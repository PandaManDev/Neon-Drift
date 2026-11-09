/* Neon Drift — quick command dock and live pilot summary */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const read = (key, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(key)); return value && typeof value === 'object' ? value : fallback; }
    catch (_) { return fallback; }
  };
  const number = (value) => Math.max(0, Number(value) || 0);
  function mount() {
    const lobby = $('gameLobby');
    if (!lobby || $('ndCommandStrip')) return;
    const progression = lobby.querySelector('.pilot-progression');
    if (!progression) return;
    const strip = document.createElement('section');
    strip.id = 'ndCommandStrip';
    strip.className = 'nd-command-strip';
    strip.setAttribute('aria-label', 'Pilot command dashboard');
    strip.innerHTML = `
      <article class="nd-command-card featured">
        <span class="nd-command-label">Pilot command</span>
        <strong class="nd-command-value" id="ndPilotRank">ROOKIE PILOT</strong>
        <span class="nd-command-note" id="ndPilotSummary">Your next run is waiting. Set a new personal best.</span>
        <div class="nd-command-actions">
          <button type="button" data-nd-action="play">▶ QUICK PLAY</button>
          <button type="button" data-nd-action="ops">▦ OPERATIONS</button>
        </div>
      </article>
      <article class="nd-command-card">
        <span class="nd-command-label">Career runs</span><strong class="nd-command-value" id="ndRuns">0</strong>
        <span class="nd-command-note">Flights completed</span>
      </article>
      <article class="nd-command-card">
        <span class="nd-command-label">Energy collected</span><strong class="nd-command-value" id="ndCores">0</strong>
        <span class="nd-command-note">Lifetime energy cores</span>
      </article>
      <article class="nd-command-card">
        <span class="nd-command-label">Flight time</span><strong class="nd-command-value" id="ndFlightTime">0m</strong>
        <span class="nd-command-note">Total time in the arena</span>
        <div class="nd-command-actions">
          <button type="button" data-nd-action="hangar">OPEN HANGAR</button>
          <button type="button" data-nd-action="settings">SETTINGS</button>
        </div>
      </article>`;
    progression.insertAdjacentElement('afterend', strip);
    strip.addEventListener('click', (event) => {
      const button = event.target.closest('[data-nd-action]');
      if (!button) return;
      const action = button.dataset.ndAction;
      if (action === 'play') $('lobbyPlay')?.click();
      if (action === 'ops') $('opsOpen')?.click();
      if (action === 'settings') $('lobbySettings')?.click();
      if (action === 'hangar') {
        progression.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        $('trailShop')?.querySelector('button')?.focus({ preventScroll: true });
      }
    });
    update();
    window.addEventListener('storage', update);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  }
  function update() {
    const career = read('neonDriftCareerStatsV1', {});
    const runs = number(career.runs);
    const cores = number(career.totalCores);
    const seconds = number(career.totalSeconds);
    const best = number(localStorage.getItem('neonDriftBestV2'));
    const rank = runs >= 50 ? 'LEGEND PILOT' : runs >= 25 ? 'VETERAN PILOT' : runs >= 10 ? 'ACE PILOT' : runs >= 1 ? 'ACTIVE PILOT' : 'ROOKIE PILOT';
    if ($('ndPilotRank')) $('ndPilotRank').textContent = rank;
    if ($('ndPilotSummary')) $('ndPilotSummary').textContent = best ? 'Personal best: ' + best.toLocaleString() + ' points. Can you beat it?' : 'Your first flight is waiting. Set a new personal best.';
    if ($('ndRuns')) $('ndRuns').textContent = runs.toLocaleString();
    if ($('ndCores')) $('ndCores').textContent = cores.toLocaleString();
    if ($('ndFlightTime')) $('ndFlightTime').textContent = seconds >= 3600 ? (seconds / 3600).toFixed(1) + 'h' : Math.floor(seconds / 60) + 'm';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
