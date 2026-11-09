-- Neon Drift online friends and party system
-- Run this entire file in Supabase SQL Editor as the project owner.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_]{3,20}$')
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friend_requests_not_self check (sender_id <> receiver_id),
  constraint friend_requests_pair unique (sender_id, receiver_id)
);

create table if not exists public.parties (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  host_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.party_members (
  party_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  is_ready boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (party_id, user_id)
);

create index if not exists friend_requests_receiver_status_idx on public.friend_requests(receiver_id, status);
create index if not exists friend_requests_sender_status_idx on public.friend_requests(sender_id, status);
create index if not exists party_members_party_idx on public.party_members(party_id);

alter table public.profiles enable row level security;
alter table public.friend_requests enable row level security;
alter table public.parties enable row level security;
alter table public.party_members enable row level security;

drop policy if exists "Profiles are visible to signed-in users" on public.profiles;
create policy "Profiles are visible to signed-in users" on public.profiles for select to authenticated using (true);
drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Users see their own friend requests" on public.friend_requests;
create policy "Users see their own friend requests" on public.friend_requests for select to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "Party members can see their party" on public.parties;
create policy "Party members can see their party" on public.parties for select to authenticated using (
  exists (select 1 from public.party_members pm where pm.party_id = id and pm.user_id = auth.uid())
);

drop policy if exists "Party members can see members" on public.party_members;
create policy "Party members can see members" on public.party_members for select to authenticated using (
  exists (select 1 from public.party_members mine where mine.party_id = party_id and mine.user_id = auth.uid())
);

create or replace function public.neon_create_profile()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  chosen text;
begin
  chosen := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  chosen := regexp_replace(chosen, '[^A-Za-z0-9_]', '', 'g');
  if length(chosen) < 3 then chosen := 'pilot_' || substr(replace(new.id::text, '-', ''), 1, 8); end if;
  insert into public.profiles(id, username, display_name)
  values(new.id, chosen, coalesce(nullif(new.raw_user_meta_data->>'display_name',''), chosen));
  return new;
exception when unique_violation then
  insert into public.profiles(id, username, display_name)
  values(new.id, 'pilot_' || substr(replace(new.id::text, '-', ''), 1, 12), 'New Pilot');
  return new;
end;
$$;

drop trigger if exists neon_auth_user_created on auth.users;
create trigger neon_auth_user_created after insert on auth.users
for each row execute procedure public.neon_create_profile();

create or replace function public.neon_send_friend_request(target_username text)
returns void language plpgsql security definer set search_path = public
as $$
declare target_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select id into target_id from public.profiles where lower(username) = lower(trim(target_username));
  if target_id is null then raise exception 'Pilot not found.'; end if;
  if target_id = auth.uid() then raise exception 'You cannot add yourself.'; end if;
  if exists (
    select 1 from public.friend_requests
    where status = 'accepted'
      and ((sender_id = auth.uid() and receiver_id = target_id) or (sender_id = target_id and receiver_id = auth.uid()))
  ) then raise exception 'You are already friends.'; end if;
  if exists (select 1 from public.friend_requests where sender_id = target_id and receiver_id = auth.uid() and status = 'pending') then
    update public.friend_requests set status = 'accepted', updated_at = now()
    where sender_id = target_id and receiver_id = auth.uid();
    return;
  end if;
  insert into public.friend_requests(sender_id, receiver_id)
  values(auth.uid(), target_id)
  on conflict(sender_id, receiver_id) do update set status='pending', updated_at=now();
end;
$$;

create or replace function public.neon_respond_friend_request(request_id uuid, accept_request boolean)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update public.friend_requests
  set status = case when accept_request then 'accepted' else 'declined' end, updated_at = now()
  where id = request_id and receiver_id = auth.uid() and status = 'pending';
  if not found then raise exception 'Request not found or already handled.'; end if;
end;
$$;

create or replace function public.neon_create_party()
returns table(party_id uuid, party_code text)
language plpgsql security definer set search_path = public
as $$
declare new_id uuid; new_code text;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if exists (select 1 from public.party_members where user_id = auth.uid()) then raise exception 'Leave your current party first.'; end if;
  new_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
  insert into public.parties(invite_code, host_id) values(new_code, auth.uid()) returning id into new_id;
  insert into public.party_members(party_id, user_id, is_ready) values(new_id, auth.uid(), true);
  return query select new_id, new_code;
end;
$$;

create or replace function public.neon_join_party(code text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare target_party uuid; member_count integer;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if exists (select 1 from public.party_members where user_id = auth.uid()) then raise exception 'Leave your current party first.'; end if;
  select id into target_party from public.parties where invite_code = upper(trim(code));
  if target_party is null then raise exception 'Party code not found.'; end if;
  select count(*) into member_count from public.party_members where party_id = target_party;
  if member_count >= 4 then raise exception 'That party is full.'; end if;
  insert into public.party_members(party_id, user_id) values(target_party, auth.uid());
  return target_party;
end;
$$;

create or replace function public.neon_leave_party()
returns void language plpgsql security definer set search_path = public
as $$
declare current_party uuid; current_host uuid; next_host uuid;
begin
  select p.id, p.host_id into current_party, current_host
  from public.parties p join public.party_members pm on pm.party_id=p.id
  where pm.user_id=auth.uid();
  if current_party is null then return; end if;
  delete from public.party_members where party_id=current_party and user_id=auth.uid();
  if current_host=auth.uid() then
    select user_id into next_host from public.party_members where party_id=current_party order by joined_at limit 1;
    if next_host is null then delete from public.parties where id=current_party;
    else update public.parties set host_id=next_host where id=current_party; end if;
  elsif not exists(select 1 from public.party_members where party_id=current_party) then
    delete from public.parties where id=current_party;
  end if;
end;
$$;

create or replace function public.neon_set_party_ready(ready_state boolean)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update public.party_members set is_ready=ready_state where user_id=auth.uid();
  if not found then raise exception 'You are not in a party.'; end if;
end;
$$;

grant execute on function public.neon_send_friend_request(text) to authenticated;
grant execute on function public.neon_respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.neon_create_party() to authenticated;
grant execute on function public.neon_join_party(text) to authenticated;
grant execute on function public.neon_leave_party() to authenticated;
grant execute on function public.neon_set_party_ready(boolean) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.friend_requests;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.party_members;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.parties;
exception when duplicate_object then null;
end $$;
