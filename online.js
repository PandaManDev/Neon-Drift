(() => {
'use strict';
const cfg = window.NEON_DRIFT_SUPABASE || {};
const configured = cfg.url && !cfg.url.includes('YOUR-PROJECT') && cfg.anonKey && !cfg.anonKey.includes('YOUR_SUPABASE');
const modal = document.getElementById('friendsModal');
const partyModal = document.getElementById('partyModal');
if (!modal || !partyModal) return;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const style = document.createElement('style');
style.textContent = `
.online-auth{padding:13px;border:1px solid #31506f;border-radius:12px;background:#0a1423;margin:12px 0 16px}
.online-auth h3,.online-section h3{font-size:11px;letter-spacing:.14em;margin:0 0 10px;color:#72eaff}
.online-auth input,.online-code{width:100%;box-sizing:border-box;background:#070e19;border:1px solid #344d6b;border-radius:9px;color:#fff;padding:11px;margin:5px 0;font:inherit;min-width:0}
.online-auth .online-actions,.online-buttons{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.online-auth button,.online-buttons button,.online-row button{border:1px solid #46658a;border-radius:9px;background:#172b45;color:#e8f7ff;padding:9px 12px;font:inherit;font-size:10px;letter-spacing:.08em;cursor:pointer}
.online-auth button.primary,.online-buttons button.primary{background:linear-gradient(110deg,#7138b7,#176c99);border-color:#6588b8}
.online-hint,.online-message{font-size:10px;line-height:1.5;color:#9ab2ce;margin:8px 0 0}
.online-message.error{color:#ff8ba9}.online-message.good{color:#7af4c1}
.online-section{margin:14px 0}.online-row{display:flex;align-items:center;gap:9px;padding:10px;border:1px solid #2b4565;border-radius:10px;background:#0b1728;margin:7px 0}
.online-row .online-name{flex:1;min-width:0}.online-row b,.online-row small{display:block}.online-row b{font-size:11px}.online-row small{font-size:9px;color:#8ca9c8;margin-top:3px}
.online-dot{width:8px;height:8px;border-radius:50%;background:#687b91;flex:none}.online-dot.on{background:#5af0b8;box-shadow:0 0 9px #5af0b8}
.online-empty{padding:13px;border:1px dashed #314b68;border-radius:10px;color:#8fa8c5;font-size:10px;text-align:center}
.online-code-wrap{display:flex;gap:7px;margin:10px 0}.online-code-wrap input{flex:1;min-width:0}
.online-party-code{font-size:18px;letter-spacing:.22em;color:#78eaff;font-weight:900;text-align:center;padding:10px}
.online-chat{margin-top:14px;border-top:1px solid #29415e;padding-top:12px}
.online-chat-log{height:150px;overflow:auto;background:#070e19;border:1px solid #29415e;border-radius:10px;padding:8px}
.online-chat-line{font-size:10px;line-height:1.5;padding:4px 2px;overflow-wrap:anywhere;color:#cfe1f5}
.online-chat-line b{color:#78eaff;margin-right:5px}
.online-chat-form{display:flex;gap:7px;margin-top:8px}
.online-chat-form input{flex:1;min-width:0;background:#070e19;border:1px solid #344d6b;border-radius:9px;color:#fff;padding:10px;font:inherit}
.online-chat-form button{border:1px solid #6588b8;border-radius:9px;background:#172b45;color:#e8f7ff;padding:9px 12px;font:inherit;font-size:10px}
#onlineAuthStatus{overflow-wrap:anywhere}
`;
document.head.appendChild(style);
const card = modal.querySelector('.friends-card');
const auth = document.createElement('section');
auth.className='online-auth';
auth.innerHTML = `
 <h3>ONLINE PILOT ACCOUNT</h3>
 <div id="onlineAuthStatus" class="online-hint">Connect to Neon Drift Online to add real friends and join parties.</div>
 <div id="onlineAuthFields">
  <input id="onlineUsername" maxlength="20" autocomplete="username" placeholder="Username (3–20 letters, numbers or _)">
  <input id="onlineEmail" type="email" autocomplete="email" placeholder="Email address">
  <input id="onlinePassword" type="password" autocomplete="current-password" placeholder="Password (at least 8 characters)">
  <div class="online-actions"><button class="primary" id="onlineSignUp" type="button">CREATE ACCOUNT</button><button id="onlineSignIn" type="button">SIGN IN</button></div>
 </div>
 <div id="onlineAccountActions" hidden class="online-actions"><button id="onlineSignOut" type="button">SIGN OUT</button></div>
 <p id="onlineAuthMessage" class="online-message" aria-live="polite"></p>`;
card.insertBefore(auth, card.querySelector('.friends-summary'));
const oldList = $('friendsListView');
const onlineFriends = document.createElement('section');
onlineFriends.id='onlineFriendsView';
onlineFriends.innerHTML = `
 <div class="online-section">
  <h3>ADD A PILOT</h3>
  <form id="onlineAddFriend" class="online-code-wrap"><input id="onlineFriendName" class="online-code" maxlength="20" placeholder="Exact username" autocomplete="off" required><button class="primary" type="submit">SEND</button></form>
  <p id="onlineFriendMessage" class="online-message" aria-live="polite"></p>
 </div>
 <div class="online-section"><h3>FRIEND REQUESTS</h3><div id="onlineRequests" class="online-empty">Sign in to see requests.</div></div>
 <div class="online-section"><h3>YOUR FRIENDS</h3><div id="onlineFriendRows" class="online-empty">Sign in to load your friends.</div></div>`;
card.insertBefore(onlineFriends, oldList);
oldList.hidden = true;
const inviteView = $('friendsInviteView');
if(inviteView) inviteView.hidden=true;
const tabs=card.querySelector('.friends-tabs');
if(tabs) tabs.hidden=true;
const partyCard=partyModal.querySelector('.party-card');
const partyExtras=document.createElement('div');
partyExtras.id='onlinePartyControls';
partyExtras.innerHTML = `
 <div class="online-section">
  <h3>JOIN A PARTY</h3>
  <form id="onlineJoinParty" class="online-code-wrap"><input id="onlinePartyCode" class="online-code" maxlength="8" placeholder="8-CHARACTER CODE" autocomplete="off" required><button class="primary" type="submit">JOIN</button></form>
  <p id="onlinePartyMessage" class="online-message" aria-live="polite"></p>
 </div>
 <div class="online-section" id="onlinePartyCodeBox" hidden><h3>YOUR INVITE CODE</h3><div class="online-party-code" id="onlinePartyCodeText"></div><div class="online-buttons"><button id="onlineCopyPartyCode" type="button">COPY CODE</button><button id="onlineReadyToggle" type="button">SET READY</button></div>
  <div class="online-chat"><h3>PARTY CHAT</h3><div id="onlinePartyChatLog" class="online-chat-log" aria-live="polite"><div class="online-empty">Party messages will appear here.</div></div><form id="onlinePartyChatForm" class="online-chat-form"><input id="onlinePartyChatInput" maxlength="300" placeholder="Message your party…" autocomplete="off" required><button type="submit">SEND</button></form></div></div>`;
partyCard.insertBefore(partyExtras, $('partySlots'));
if(!configured){
 auth.querySelector('#onlineAuthStatus').textContent='Backend setup required. Add your Supabase Project URL and anon/publishable key to supabase-config.js, then reload.';
 auth.querySelector('#onlineAuthFields').hidden=true;
 auth.querySelector('#onlineAuthMessage').textContent='Follow SUPABASE_SETUP.md to create the dedicated Neon Drift project.';
 partyExtras.querySelector('#onlinePartyMessage').textContent='Connect the Supabase project to enable shared parties.';
 return;
}
if(!window.supabase || !window.supabase.createClient){
 auth.querySelector('#onlineAuthStatus').textContent='Could not load the online service library. Refresh the page and try again.';
 return;
}
const db=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let session=null,profile=null,presenceChannel=null,tableChannel=null,presenceState={},activeParty=null,refreshing=false;
function say(id,msg,type=''){const el=$(id);if(!el)return;el.textContent=msg;el.className='online-message'+(type?' '+type:'')}
function authMessage(msg,type=''){say('onlineAuthMessage',msg,type)}
function friendMessage(msg,type=''){say('onlineFriendMessage',msg,type)}
function partyMessage(msg,type=''){say('onlinePartyMessage',msg,type)}
function isOnline(userId){return !!(presenceState[userId]&&presenceState[userId].length)}
async function loadProfile(){
 if(!session){profile=null;return}
 const {data,error}=await db.from('profiles').select('*').eq('id',session.user.id).maybeSingle();
 if(error) throw error;
 profile=data;
}
function renderAuth(){
 const status=$('onlineAuthStatus'),fields=$('onlineAuthFields'),actions=$('onlineAccountActions');
 if(session&&profile){
  status.textContent='SIGNED IN AS @'+profile.username+' · '+(presenceChannel?'ONLINE':'CONNECTING');
  fields.hidden=true;actions.hidden=false;
 }else{
  status.textContent='Not signed in · online friends and parties need an account.';
  fields.hidden=false;actions.hidden=true;
 }
}
async function startPresence(){
 if(presenceChannel){await db.removeChannel(presenceChannel);presenceChannel=null}
 if(!session||!profile)return;
 presenceChannel=db.channel('neon-drift-online-pilots',{config:{presence:{key:session.user.id}}});
 presenceChannel.on('presence',{event:'sync'},()=>{
  const state=presenceChannel.presenceState();presenceState={};
  Object.entries(state).forEach(([id,metas])=>presenceState[id]=metas);
  refreshFriends().catch(()=>{});
 });
 presenceChannel.subscribe(async status=>{
  if(status==='SUBSCRIBED'){
   await presenceChannel.track({user_id:session.user.id,username:profile.username,online_at:new Date().toISOString()});
   renderAuth();
  }
 });
}
async function subscribeTables(){
 if(tableChannel)await db.removeChannel(tableChannel);
 tableChannel=db.channel('neon-drift-social-'+session.user.id)
  .on('postgres_changes',{event:'*',schema:'public',table:'friend_requests'},()=>refreshFriends())
  .on('postgres_changes',{event:'*',schema:'public',table:'party_members'},()=>refreshParty())
  .on('postgres_changes',{event:'*',schema:'public',table:'parties'},()=>refreshParty())
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'party_messages'},()=>loadPartyChat())
  .subscribe();
}
async function refreshFriends(){
 if(!session)return;
 const [req,accepted]=await Promise.all([
  db.from('friend_requests').select('id,sender_id,receiver_id,created_at').eq('receiver_id',session.user.id).eq('status','pending').order('created_at',{ascending:false}),
  db.from('friend_requests').select('sender_id,receiver_id').eq('status','accepted').or('sender_id.eq.'+session.user.id+',receiver_id.eq.'+session.user.id)
 ]);
 if(req.error)throw req.error;if(accepted.error)throw accepted.error;
 const incoming=req.data||[];
 if(incoming.length){
  const ids=[...new Set(incoming.map(x=>x.sender_id))];
  const {data:people,error}=await db.from('profiles').select('id,username,display_name').in('id',ids);
  if(error)throw error;
  const map=Object.fromEntries((people||[]).map(p=>[p.id,p]));
  $('onlineRequests').innerHTML=incoming.map(r=>{const p=map[r.sender_id];return p?'<div class="online-row"><span class="online-name"><b>'+esc(p.display_name)+'</b><small>@'+esc(p.username)+'</small></span><button data-accept="'+r.id+'">ACCEPT</button><button data-decline="'+r.id+'">DECLINE</button></div>':''}).join('')||'<div class="online-empty">No incoming requests.</div>';
 }else $('onlineRequests').innerHTML='<div class="online-empty">No incoming requests.</div>';
 const friendIds=(accepted.data||[]).map(r=>r.sender_id===session.user.id?r.receiver_id:r.sender_id);
 if(friendIds.length){
  const {data:people,error}=await db.from('profiles').select('id,username,display_name').in('id',friendIds);
  if(error)throw error;
  $('onlineFriendRows').innerHTML=(people||[]).map(p=>'<div class="online-row"><span class="online-dot '+(isOnline(p.id)?'on':'')+'"></span><span class="online-name"><b>'+esc(p.display_name)+'</b><small>@'+esc(p.username)+' · '+(isOnline(p.id)?'ONLINE':'OFFLINE')+'</small></span></div>').join('')||'<div class="online-empty">Your friends list is empty.</div>';
  $('friendCount').textContent=String(people?.length||0);
  $('onlineCount').textContent=String((people||[]).filter(p=>isOnline(p.id)).length);
 }else{
  $('onlineFriendRows').innerHTML='<div class="online-empty">No friends yet. Add someone by their exact username.</div>';
  $('friendCount').textContent='0';$('onlineCount').textContent='0';
 }
}
async function loadPartyChat(){
 if(!session||!activeParty)return;
 const {data,error}=await db.from('party_messages').select('id,user_id,message,created_at').eq('party_id',activeParty.id).order('created_at',{ascending:true}).limit(60);
 if(error){partyMessage(error.message,'error');return}
 const ids=[...new Set((data||[]).map(m=>m.user_id))];
 const {data:people}=ids.length?await db.from('profiles').select('id,username').in('id',ids):{data:[]};
 const names=Object.fromEntries((people||[]).map(p=>[p.id,p.username]));
 const log=$('onlinePartyChatLog');
 log.innerHTML=(data||[]).map(m=>'<div class="online-chat-line"><b>@'+esc(names[m.user_id]||'pilot')+'</b>'+esc(m.message)+'</div>').join('')||'<div class="online-empty">No messages yet. Say hello!</div>';
 log.scrollTop=log.scrollHeight;
}
async function refreshParty(){
 if(!session){
  activeParty=null;
  $('partyStatusText').textContent='YOU ARE PLAYING SOLO';
  $('partyModal').querySelector('.party-status').classList.remove('active');
  $('partyCreate').disabled=false;$('partyCreate').textContent='CREATE PARTY';
  $('partyLeave').disabled=true;$('partyInvite').disabled=true;
  $('onlinePartyCodeBox').hidden=true;
  $('partySlots').innerHTML='<div class="party-slot empty"><span class="party-avatar">+</span><span><b>NO ACTIVE PARTY</b><small>SIGN IN TO CREATE OR JOIN</small></span></div>';
  return;
 }
 const {data:mine,error}=await db.from('party_members').select('party_id,is_ready').eq('user_id',session.user.id).maybeSingle();
 if(error)throw error;
 if(!mine){
  activeParty=null;
  $('partyStatusText').textContent='YOU ARE PLAYING SOLO';
  $('partyModal').querySelector('.party-status').classList.remove('active');
  $('partyCreate').disabled=false;$('partyCreate').textContent='CREATE PARTY';
  $('partyLeave').disabled=true;$('partyInvite').disabled=true;
  $('onlinePartyCodeBox').hidden=true;
  $('partySlots').innerHTML='<div class="party-slot empty"><span class="party-avatar">+</span><span><b>NO ACTIVE PARTY</b><small>CREATE OR JOIN A PARTY</small></span></div>';
  return;
 }
 const {data:party,error:partyError}=await db.from('parties').select('id,invite_code,host_id').eq('id',mine.party_id).single();
 if(partyError)throw partyError;
 const {data:members,error:memberError}=await db.from('party_members').select('user_id,is_ready,joined_at').eq('party_id',mine.party_id).order('joined_at');
 if(memberError)throw memberError;
 const ids=(members||[]).map(m=>m.user_id);
 const {data:people,error:peopleError}=await db.from('profiles').select('id,username,display_name').in('id',ids);
 if(peopleError)throw peopleError;
 const byId=Object.fromEntries((people||[]).map(p=>[p.id,p]));
 activeParty={...party,members};
 $('partyStatusText').textContent='PARTY ACTIVE · '+members.length+'/4 PILOTS';
 $('partyModal').querySelector('.party-status').classList.add('active');
 $('partyCreate').disabled=true;$('partyCreate').textContent='PARTY ACTIVE';
 $('partyLeave').disabled=false;$('partyInvite').disabled=false;
 $('onlinePartyCodeBox').hidden=false;$('onlinePartyCodeText').textContent=party.invite_code;
 $('onlineReadyToggle').textContent=mine.is_ready?'SET NOT READY':'SET READY';
 $('partySlots').innerHTML=members.map(m=>{const p=byId[m.user_id]||{username:'pilot',display_name:'Pilot'};const host=m.user_id===party.host_id;return '<div class="party-slot"><span class="party-avatar">'+esc(p.username.charAt(0).toUpperCase())+'</span><span><b>'+esc(p.display_name)+(host?' · HOST':'')+(m.user_id===session.user.id?' · YOU':'')+'</b><small>'+(m.is_ready?'READY':'NOT READY')+'</small></span><i>'+(m.is_ready?'●':'○')+'</i></div>'}).join('')+Array.from({length:Math.max(0,4-members.length)},()=>'<div class="party-slot empty"><span class="party-avatar">+</span><span><b>OPEN SLOT</b><small>WAITING FOR PILOT</small></span></div>').join('');
}
async function refreshAll(){
 if(refreshing)return;refreshing=true;
 try{await refreshFriends();await refreshParty()}catch(e){console.error('Neon Drift online refresh:',e);partyMessage(e.message||'Could not refresh online data.','error')}
 finally{refreshing=false}
}
// Expose the authenticated online state to the legacy lobby renderers.
window.NeonOnline={
 ready:true,
 get user(){return session?.user||null},
 refresh:refreshAll
};
async function onSession(next){
 session=next;
 if(!session){
  profile=null;presenceState={};
  if(presenceChannel){await db.removeChannel(presenceChannel);presenceChannel=null}
  if(tableChannel){await db.removeChannel(tableChannel);tableChannel=null}
  renderAuth();$('onlineRequests').innerHTML='<div class="online-empty">Sign in to see requests.</div>';$('onlineFriendRows').innerHTML='<div class="online-empty">Sign in to load friends.</div>';
  $('friendCount').textContent='0';$('onlineCount').textContent='0';activeParty=null;
  await refreshParty().catch(()=>{});return;
 }
 try{
  await loadProfile();
  if(!profile)throw new Error('Your profile is still being created. Refresh in a moment.');
  renderAuth();await startPresence();await subscribeTables();await refreshAll();
  authMessage('Online account connected. Friends and parties now sync across devices.','good');
 }catch(e){console.error(e);authMessage(e.message||'Could not connect your account.','error')}
}
$('onlineSignUp').addEventListener('click',async()=>{
 const username=$('onlineUsername').value.trim(),email=$('onlineEmail').value.trim(),password=$('onlinePassword').value;
 if(!/^[A-Za-z0-9_]{3,20}$/.test(username)){authMessage('Username must be 3–20 characters: letters, numbers or underscores.','error');return}
 if(password.length<8){authMessage('Use a password with at least 8 characters.','error');return}
 authMessage('Creating your pilot account…');
 const {data,error}=await db.auth.signUp({email,password,options:{data:{username,display_name:username}}});
 if(error){authMessage(error.message,'error');return}
 if(data.session)await onSession(data.session);else authMessage('Account created. Check your email to confirm it, then sign in.','good');
});
$('onlineSignIn').addEventListener('click',async()=>{
 const email=$('onlineEmail').value.trim(),password=$('onlinePassword').value;
 if(!email||!password){authMessage('Enter your email and password.','error');return}
 authMessage('Signing in…');
 const {data,error}=await db.auth.signInWithPassword({email,password});
 if(error){authMessage(error.message,'error');return}
 await onSession(data.session);
});
$('onlineSignOut').addEventListener('click',async()=>{const {error}=await db.auth.signOut();if(error)authMessage(error.message,'error');else authMessage('Signed out.','good')});
$('onlineAddFriend').addEventListener('submit',async e=>{
 e.preventDefault();if(!session){friendMessage('Sign in first.','error');return}
 const username=$('onlineFriendName').value.trim();friendMessage('Sending request…');
 const {error}=await db.rpc('neon_send_friend_request',{target_username:username});
 if(error)friendMessage(error.message,'error');else{$('onlineFriendName').value='';friendMessage('Friend request sent.','good');await refreshFriends()}
});
$('onlineRequests').addEventListener('click',async e=>{
 const accept=e.target.closest('[data-accept]'),decline=e.target.closest('[data-decline]');const button=accept||decline;if(!button)return;
 const {error}=await db.rpc('neon_respond_friend_request',{request_id:button.dataset.accept||button.dataset.decline,accept_request:!!accept});
 if(error)friendMessage(error.message,'error');else{friendMessage(accept?'Friend request accepted.':'Friend request declined.','good');await refreshFriends()}
});
$('onlineJoinParty').addEventListener('submit',async e=>{
 e.preventDefault();if(!session){partyMessage('Sign in first.','error');return}
 const code=$('onlinePartyCode').value.trim().toUpperCase();partyMessage('Joining party…');
 const {error}=await db.rpc('neon_join_party',{code});
 if(error)partyMessage(error.message,'error');else{$('onlinePartyCode').value='';partyMessage('Joined party.','good');await refreshParty()}
});
$('partyCreate').addEventListener('click',async e=>{
 e.preventDefault();e.stopImmediatePropagation();if(!session){partyMessage('Sign in through Friends first.','error');return}
 partyMessage('Creating your party…');const {data,error}=await db.rpc('neon_create_party');
 if(error){partyMessage(error.message,'error');return}
 const row=Array.isArray(data)?data[0]:data;partyMessage('Party created. Share the invite code!','good');await refreshParty();
},{capture:true});
$('partyLeave').addEventListener('click',async e=>{
 e.preventDefault();e.stopImmediatePropagation();const {error}=await db.rpc('neon_leave_party');
 if(error)partyMessage(error.message,'error');else{partyMessage('You left the party.','good');await refreshParty()}
},{capture:true});
$('partyInvite').addEventListener('click',async e=>{
 e.preventDefault();e.stopImmediatePropagation();if(!activeParty)return;
 const share={title:'Join my Neon Drift party',text:'Use this Neon Drift party code: '+activeParty.invite_code,url:location.href.split('#')[0]};
 try{if(navigator.share)await navigator.share(share);else await navigator.clipboard.writeText(share.text+' '+share.url);partyMessage('Party invite shared.','good')}
 catch(err){if(err.name!=='AbortError')partyMessage('Could not share. Copy the code shown above.','error')}
},{capture:true});
$('onlineCopyPartyCode').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('onlinePartyCodeText').textContent);partyMessage('Party code copied.','good')}catch(e){partyMessage('Select and copy the code above.','error')}});
$('onlinePartyChatForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!session||!activeParty)return;
 const input=$('onlinePartyChatInput'),message=input.value.trim();if(!message)return;
 input.disabled=true;
 const {error}=await db.from('party_messages').insert({party_id:activeParty.id,user_id:session.user.id,message});
 input.disabled=false;
 if(error)partyMessage(error.message,'error');else{input.value='';await loadPartyChat()}
});
$('onlineReadyToggle').addEventListener('click',async()=>{
 if(!activeParty)return;const mine=activeParty.members.find(m=>m.user_id===session.user.id);
 const {error}=await db.rpc('neon_set_party_ready',{ready_state:!mine?.is_ready});
 if(error)partyMessage(error.message,'error');else await refreshParty();
});
db.auth.onAuthStateChange((_event,next)=>{setTimeout(()=>onSession(next),0)});
db.auth.getSession().then(({data})=>onSession(data.session));
window.addEventListener('beforeunload',()=>{if(presenceChannel)db.removeChannel(presenceChannel)});
})();
