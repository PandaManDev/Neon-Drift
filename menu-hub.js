/* Neon Drift — unified lobby menu: keep the landing screen clean */
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
    <div class="nd-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="ndMenuTitle" tabindex="-1">
      <header class="nd-menu-heading">
        <div><span class="nd-menu-eyebrow">NEON DRIFT // COMMAND CENTER</span><h2 id="ndMenuTitle">ALL FEATURES</h2><p>Your pilot profile, rewards, settings and game options — all together.</p></div>
        <button class="nd-menu-close" type="button" data-menu-close aria-label="Close menu">×</button>
      </header>
      <div class="nd-menu-groups">
        <section class="nd-menu-group"><h3>PLAY</h3><div class="nd-menu-grid">
          <button class="nd-menu-item featured" data-action="play"><span>▶</span><b>Start a run</b><small>Jump straight into the arena</small></button>
          <button class="nd-menu-item" data-action="how"><span>⌁</span><b>How to play</b><small>Controls, hazards and power-ups</small></button>
          <button class="nd-menu-item" data-action="difficulty"><span>◈</span><b>Difficulty</b><small>Choose your challenge</small></button>
        </div></section>
        <section class="nd-menu-group"><h3>SOCIAL</h3><div class="nd-menu-grid">
          <button class="nd-menu-item" data-action="friends"><span>♧</span><b>Friends</b><small>Find and manage your crew</small></button>
          <button class="nd-menu-item" data-action="party"><span>✦</span><b>Party</b><small>Play alongside your friends</small></button>
          <button class="nd-menu-item" data-action="invite"><span>↗</span><b>Invite friends</b><small>Share the game link</small></button>
        </div></section>
        <section class="nd-menu-group"><h3>PILOT & PROGRESSION</h3><div class="nd-menu-grid">
          <button class="nd-menu-item" data-action="operations"><span>▦</span><b>Operations</b><small>Missions, season and milestones</small></button>
          <button class="nd-menu-item" data-action="records"><span>⌁</span><b>Career records</b><small>Achievements and flight history</small></button>
          <button class="nd-menu-item" data-action="profile"><span>✧</span><b>Pilot profile</b><small>Level, credits, rewards and hangar</small></button>
        </div></section>
        <section class="nd-menu-group"><h3>SYSTEM</h3><div class="nd-menu-grid">
          <button class="nd-menu-item" data-action="notifications"><span>♢</span><b>Daily signals</b><small>Open your notification center</small></button>
          <button class="nd-menu-item" data-action="settings"><span>⚙</span><b>Settings</b><small>Performance, motion and sound</small></button>
          <button class="nd-menu-item" data-action="fullscreen"><span>⛶</span><b>Fullscreen</b><small>Expand the game experience</small></button>
        </div></section>
      </div>
      <div class="nd-menu-content" aria-label="More game details"></div>
      <footer class="nd-menu-footer"><span>NEON DRIFT</span><span>ONE MENU · ALL YOUR FEATURES</span></footer>
    </div>`;
  lobby.append(hub);

  const content = hub.querySelector('.nd-menu-content');
  const moveIntoMenu = (element, title, className) => {
    if (!element || element.dataset.ndMenuMoved === 'true') return;
    const section = document.createElement('section');
    section.className = 'nd-menu-extra ' + className;
    section.innerHTML = '<h3>' + title + '</h3>';
    section.append(element);
    element.dataset.ndMenuMoved = 'true';
    content.append(section);
  };

  // These are the actual lobby sections, moved intact so their controls and IDs keep working.
  moveIntoMenu(lobby.querySelector('.lobby-meta'), 'GAME MODES', 'nd-menu-meta');
  moveIntoMenu(lobby.querySelector('.lobby-footer'), 'PERSONAL BEST · DIFFICULTY · SETTINGS · GAME INFO', 'nd-menu-footer-content');
  moveIntoMenu(lobby.querySelector('.pilot-progression'), 'YOUR PILOT PROFILE & HANGAR', 'nd-menu-progression');

  // Move the separate interface that was sitting underneath the lobby into this menu too.
  // Keep only the actual canvas/stage in .app so Play still has a clean arena to show.
  const gameApp = document.querySelector('.app');
  if (gameApp) {
    moveIntoMenu(gameApp.querySelector('.top'), 'GAME HEADER & DAILY SIGNALS', 'nd-menu-app-header');
    moveIntoMenu(gameApp.querySelector('.command-intro'), 'GAME OVERVIEW', 'nd-menu-app-intro');
    moveIntoMenu(gameApp.querySelector('.dashboard'), 'LIVE & CAREER STATS', 'nd-menu-live-stats');
    moveIntoMenu(gameApp.querySelector('.panel.side'), 'MISSION BRIEFING & PILOT RECORDS', 'nd-menu-intel');
    moveIntoMenu(gameApp.querySelector('.footer'), 'GAME INFORMATION', 'nd-menu-app-footer');
  }

  // Put the real feature panels themselves inside this menu (not just shortcut buttons).
  // Their existing IDs and event listeners stay intact when the nodes are moved.
  [
    ['lobbyHowModal', 'HOW TO PLAY', 'nd-inline-how'],
    ['friendsModal', 'FRIENDS & INVITES', 'nd-inline-friends'],
    ['partyModal', 'PARTY LOBBY', 'nd-inline-party'],
    ['settingsModal', 'SETTINGS', 'nd-inline-settings']
  ].forEach(([id, title, cls]) => {
    const panel = $(id);
    if (!panel) return;
    panel.classList.add('nd-inline-feature', cls);
    panel.setAttribute('aria-label', title);
    content.append(panel);
  });

  // These modules mount some controls after this script runs. Move the actual
  // elements into the menu as soon as they are created.
  const moveCommandStrip = () => moveIntoMenu(lobby.querySelector('.nd-command-strip'), 'PILOT COMMAND DASHBOARD', 'nd-menu-command');
  const moveOperationsLaunch = () => moveIntoMenu(lobby.querySelector('.ops-launch'), 'OPERATIONS CENTER', 'nd-menu-operations');
  moveCommandStrip();
  moveOperationsLaunch();
  const observer = new MutationObserver(() => {
    moveCommandStrip();
    moveOperationsLaunch();
  });
  observer.observe(lobby, { childList: true, subtree: true });

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = 'lobbyAllFeatures';
  trigger.className = 'lobby-secondary nd-all-features';
  trigger.textContent = '☰ ALL FEATURES';
  const actions = lobby.querySelector('.lobby-actions');
  if (actions) actions.append(trigger);

  const open = () => {
    hub.hidden = false;
    document.body.classList.add('nd-menu-open');
    hub.querySelector('.nd-menu-close').focus();
  };
  const close = () => {
    hub.hidden = true;
    document.body.classList.remove('nd-menu-open');
    trigger.focus();
  };
  trigger.addEventListener('click', open);
  hub.addEventListener('click', (event) => {
    if (event.target.closest('[data-menu-close]')) { close(); return; }
    const item = event.target.closest('[data-action]');
    if (!item) return;
    const action = item.dataset.action;
    const inlinePanelActions = ['how', 'friends', 'party', 'settings'];
    if (inlinePanelActions.includes(action)) open();
    else close();
    const click = (id) => $(id)?.click();
    if (action === 'play') click('lobbyPlay');
    else if (action === 'how') click('lobbyHow');
    else if (action === 'friends') click('lobbyFriends');
    else if (action === 'party') click('lobbyParty');
    else if (action === 'invite') { click('lobbyFriends'); setTimeout(() => click('friendsTabInvite'), 0); }
    else if (action === 'settings') click('lobbySettings');
    else if (action === 'fullscreen') click('lobbyFullscreen');
    else if (action === 'difficulty') $('lobbyDifficulty')?.focus();
    else if (action === 'profile') {
      open();
      const profile = hub.querySelector('.nd-menu-progression');
      profile?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    else if (action === 'operations') click('opsOpen');
    else if (action === 'records') {
      click('lobbyPlay');
      setTimeout(() => ($('runHistory') || $('careerStats') || $('achievementList'))?.scrollIntoView({behavior:'smooth',block:'center'}), 350);
    }
    else if (action === 'notifications') {
      const bell = $('notifyBell');
      if (bell) { click('lobbyPlay'); setTimeout(() => bell.click(), 350); }
    }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !hub.hidden) close(); });
})();
