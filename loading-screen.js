(() => {
  'use strict';
  const screen = document.getElementById('neonBootScreen');
  if (!screen) return;
  const $ = id => document.getElementById(id);
  const startedAt = performance.now();
  const MIN_BOOT_TIME = 4200;
  let finished = false;
  const tips = [
    'A well-timed phase dash can carry you through a tight hazard gap.',
    'Chain energy cores together to build a higher score multiplier.',
    'Use short steering taps when hazards begin arriving faster.',
    'Your daily pilot supply adds credits to your cosmetic hangar.',
    'Try different ship colors and engine trails to build your own look.',
    'The shield pickup can save one collision. Do not waste it.'
  ];
  const tip = $('bootTip');
  if (tip) tip.textContent = tips[Math.floor(Date.now() / 11000) % tips.length];

  function stage(name, percent, subtitle) {
    const label = $('bootStage'), value = $('bootPercent'), bar = $('bootProgressBar'), sub = $('bootSubtitle');
    if (label) label.textContent = name;
    if (value) value.textContent = percent + '%';
    if (bar) bar.style.width = percent + '%';
    if (sub) sub.textContent = subtitle;
  }
  function mark(name, status) {
    const row = screen.querySelector('[data-check="' + name + '"]');
    if (!row) return;
    row.classList.toggle('done', status === 'ready');
    row.classList.toggle('optional', status === 'optional');
    const value = row.querySelector('b');
    if (value) value.textContent = status === 'ready' ? 'READY' : status === 'optional' ? 'LOCAL MODE' : 'CHECK';
  }
  const waitFrame = () => new Promise(resolve => requestAnimationFrame(() => resolve()));
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function boot() {
    try {
      stage('CHECKING INTERFACE', 12, 'Checking the cockpit and game controls...');
      await waitFrame();
      await wait(650);
      const required = ['gameLobby', 'game', 'pilotLevel', 'pilotCredits', 'trailShop', 'lobbyPlay'];
      const interfaceReady = required.every(id => !!$(id));
      if (!interfaceReady) throw new Error('Some game interface elements are unavailable.');
      mark('interface', 'ready');

      stage('LOADING PILOT DATA', 36, 'Restoring your local pilot profile and settings...');
      await wait(700);
      try {
        const raw = localStorage.getItem('neonDriftPilotProgressV1');
        if (raw) {
          const data = JSON.parse(raw);
          if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid pilot data');
        }
        localStorage.getItem('neonDriftSettingsV1');
        mark('profile', 'ready');
      } catch (error) {
        mark('profile', 'optional');
      }

      stage('STARTING RENDER ENGINE', 62, 'Preparing the neon arena renderer...');
      await wait(700);
      const canvas = $('game');
      const context = canvas && canvas.getContext('2d');
      if (!context) throw new Error('Canvas rendering is not available in this browser.');
      await waitFrame();
      await waitFrame();
      mark('canvas', 'ready');

      stage('CONNECTING SERVICES', 79, 'Checking online services. Solo play remains available...');
      await wait(650);
      const config = window.NEON_DRIFT_SUPABASE || {};
      const onlineReady = !!(window.supabase && typeof window.supabase.createClient === 'function' && config.url && config.anonKey);
      mark('online', onlineReady ? 'ready' : 'optional');

      stage('FINALIZING VISUALS', 92, 'Finishing the cockpit lights...');
      if (document.fonts && document.fonts.ready) {
        await Promise.race([document.fonts.ready, wait(650)]);
      }
      await waitFrame();
      const remaining = Math.max(0, MIN_BOOT_TIME - (performance.now() - startedAt));
      if (remaining) await wait(remaining);
      stage('SYSTEM READY', 100, 'The city is yours. Good luck, pilot.');
      screen.classList.add('is-leaving');
      finished = true;
      window.__NEON_DRIFT_BOOT_READY__ = true;
      await wait(520);
      screen.remove();
    } catch (error) {
      console.warn('[Neon Drift] Boot check:', error);
      stage('SAFE START', 100, 'Starting in local mode...');
      screen.classList.add('is-leaving');
      finished = true;
      const remaining = Math.max(0, 2400 - (performance.now() - startedAt));
      if (remaining) await wait(remaining);
      screen.remove();
    }
  }

  // Never leave the loading layer covering the game if a browser API fails.
  setTimeout(() => {
    if (finished || !screen.isConnected) return;
    stage('READY', 100, 'Starting the arcade...');
    screen.classList.add('is-leaving');
    setTimeout(() => screen.remove(), 550);
  }, 12000);

  boot();
})();