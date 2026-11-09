# Neon Drift Online Setup

Neon Drift's online friends and party lobby use a **separate Supabase project**. The game itself remains playable without an account.

## 1. Create the backend

1. Open https://supabase.com/dashboard and create a new project named **Neon Drift Online**.
2. Choose a strong database password and save it somewhere private.
3. Wait for the project to finish provisioning.
4. Open **SQL Editor → New query**.
5. Copy the full contents of `supabase/schema.sql` from this repository, paste it into the editor, and click **Run**.

The SQL creates profiles, friend requests, party tables, access policies, secure database functions, and realtime publication entries.

## 2. Configure the website

1. In Supabase, open **Project Settings → API** (or **Connect**).
2. Copy the **Project URL**.
3. Copy the **anon / publishable key**.
4. Open `supabase-config.js` in this repository.
5. Replace the two placeholder strings and commit the file.

Example:

```js
window.NEON_DRIFT_SUPABASE = {
  url: 'https://YOUR-PROJECT-REF.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY'
};
```

**Never put the service_role / secret key in website code.** The anon/publishable key is designed for browser use; database access is protected by the policies and functions installed by the SQL script.

## 3. Authentication

Players create an account with email, password, and username. Supabase may require email confirmation depending on your project's Auth settings. If confirmation is enabled, players must verify their email before signing in.

For quick testing, use two different email addresses in two separate browsers/devices.

## 4. Test friends

1. Sign in on both devices using two different accounts.
2. In Friends, search/add the other account by its username.
3. The recipient accepts the request.
4. Both accounts should see each other in their friends list.
5. Keep one account signed in and verify its online indicator updates for the other.

## 5. Test parties

1. Create a party on device A.
2. Copy the eight-character party code.
3. On device B, sign in and choose **Join with code**.
4. Both devices should see the same party members and ready states update live.
5. Leaving transfers host to the next member; an empty party is deleted.

## Security notes

- The service_role key must remain private and is not needed by the browser.
- Friend requests and party membership changes run through authenticated database functions.
- Row-level security restricts profile, request, and party data.
- Online status is realtime presence and is temporary: closing the tab or losing its connection removes the presence entry.
- Party lobby synchronization is online. Actual real-time racing/gameplay synchronization is not included.
