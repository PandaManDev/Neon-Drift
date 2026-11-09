/* Neon Drift — unified main-menu hub */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const lobby = $('gameLobby');
  if (!lobby || $('ndMenuHub')) return;

  const hub = document.createElement('section');
  hub.className = 'nd-menu-hub';
  hub.id = 'ndMenuHub';
  hub.hidden = true;
  hub.setAttribute('aria-label', 'All game features');
  hub.innerHTML = `
    <div class="nd-menu-backdrop" data-menu-close></div>
    <div class="nd-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="ndMenuTitle">
      <header class="nd-menu-heading">
        <div><span class="nd-menu-eyebrow">NEON DRIFT // COMMAND CENTER</span><h2 id="ndMenuTitle">GAME MENU</h2><p>Everything in one place. Pick where you want to go.</p></div>
        <button class="nd-menu-close" type="button" data-menu-close aria-label="Close menu">×</button>
      </header>
      <div class="nd-menu-groups">
        <section class="nd-menu-group"><h3>PLAY</h3><div class="nd-menu-grid">
          <button class="nd-menu-item featured" data-action="play"><span>▶</span><b>Start a run</b><small>Jump straight into the arena</small></button>
          <button class="nd-menu-item" data-action="how"><span>⌁</span><b>How to play</b><small>Controls, hazards and power-ups</small></button>
          <button class="nd-menu-item" data-action="difficulty"><span>◈</span><b>Difficulty</b><small>Choose your challenge</small></button>
        </div></section>
        <section class="nd-menu-group"><h3>PILOT</h3><div class="nd-menu-grid">
          <button class="nd-menu-item" data-action="profile"><span>✧</span><b>Progression & hangar</b><small>Level, credits, rewards and trails</small></button>
          <button class="nd-menu-item" data-action="operations"><span>▦</span><b>Operations</b><small>Missions, season and milestones</small></button>
          <button class="nd-menu-item" data-action="records"><span>⌁</span><b>Career records</b><small>Achievements and flight history</small></button>
        </div></section>
        <section class="nd-menu-group"><h3>SOCIAL</h3><div class="nd-menu-grid">
          <button class="nd-menu-item" data-action="friends"><span>♧</span><b>Friends</b><small>Find and manage your crew</small></button>
          <button class="nd-menu-item" data-action="party"><span>✦</span><b>Party</b><small>Play alongside your friends</small></button>
          <button class="nd-menu-item" data-action="invite"><span>↗</span><b>Invite friends</b><small>Share the game link</small></button>
        </div></section>
        <section class="nd-menu-group"><h3>SYSTEM</h3><div class="nd-menu-grid">
          <button class="nd-menu-item" data-action="notifications"><span>♢</span><b>Daily signals</b><small>Open your notification center</small></button>
          <button class="nd-menu-item" data-action="settings"><span>⚙</span><b>Settings</b><small>Performance, motion and sound</small></button>
          <button class="nd-menu-item" data-action="fullscreen"><span>⛶</span><b>Fullscreen</b><small>Expand the game experience</small></button>
        </div></section>
      </div>
      <footer class="nd-menu-footer"><span>NEON DRIFT</span><span>ALL SYSTEMS IN ONE MENU</span></footer>
    </div>`;
  lobby.append(hub);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = 'lobbyAllFeatures';
  trigger.className = 'lobby-secondary nd-all-features';
  trigger.textContent = '☰ ALL FEATURES';
  const actions = lobby.querySelector('.lobby-actions');
  if (actions) actions.append(trigger);

  const open = () => { hub.hidden = false; document.body.classList.add('nd-menu-open'); hub.querySelector('.nd-menu-close').focus(); };
  const close = () => { hub.hidden = true; document.body.classList.remove('nd-menu-open'); trigger.focus(); };
  trigger.addEventListener('click', open);
  hub.addEventListener('click', (event) => {
    if (event.target.closest('[data-menu-close]')) { close(); return; }
    const item = event.target.closest('[data-action]');
    if (!item) return;
    const action = item.dataset.action;
    close();
    const click = (id) => $(id)?.click();
    if (action === 'play') click('lobbyPlay');
    else if (action === 'how') click('lobbyHow');
    else if (action === 'friends') click('lobbyFriends');
    else if (action === 'party') click('lobbyParty');
    else if (action === 'invite') { click('lobbyFriends'); setTimeout(() => click('friendsTabInvite'), 0); }
    else if (action === 'settings') click('lobbySettings');
    else if (action === 'fullscreen') click('lobbyFullscreen');
    else if (action === 'difficulty') $('lobbyDifficulty')?.focus();
    else if (action === 'profile') document.querySelector('.pilot-progression')?.scrollIntoView({behavior:'smooth',block:'center'});
    else if (action === 'operations') {
      const ops = $('opsOpen');
      if (ops) ops.click();
      else { document.querySelector('.pilot-progression')?.scrollIntoView({behavior:'smooth',block:'center'}); }
    }
    else if (action === 'records') {
      const records = $('runHistory') || $('careerStats') || $('achievementList');
      if (records) records.scrollIntoView({behavior:'smooth',block:'center'});
      else click('lobbyPlay');
    }
    else if (action === 'notifications') {
      const bell = $('notifyBell');
      if (bell) { if (document.body.classList.contains('game-active')) bell.click(); else { click('lobbyPlay'); setTimeout(() => bell.click(), 250); } }
    }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !hub.hidden) close(); });
})();
