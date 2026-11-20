// PhET-inspired Simulation Studio, Unified Transport, Accessibility & LiveIO Bridge.
// Loaded lazily as a separate chunk in `--site` mode so index.html stays well under the 4 MiB budget.
import { Live } from './core.js';
import { playClick } from './atlas/engine/sound.js';

const STUDIO_CSS = `
html[data-sim-cb="1"] {
  --proton: #b34500;
  --electron: #005f99;
  --green: #007a5a;
  --neutron: #7a3e9d;
}
@media (prefers-color-scheme: dark) {
  html:not([data-theme="light"]):not([data-theme="sepia"])[data-sim-cb="1"] {
    --proton: #f28e4b;
    --electron: #6ec4f0;
    --green: #69cfa6;
    --neutron: #c79de6;
  }
}
html[data-theme="dark"][data-sim-cb="1"] {
  --proton: #f28e4b;
  --electron: #6ec4f0;
  --green: #69cfa6;
  --neutron: #c79de6;
}
html[data-sim-highlights="1"] .live-ctl:hover,
html[data-sim-highlights="1"] .live-ctl:focus-visible,
html[data-sim-highlights="1"] .live-watch-dot:hover,
html[data-sim-highlights="1"] .live-watch-dot:focus-visible,
html[data-sim-highlights="1"] .live-step-btn:hover,
html[data-sim-highlights="1"] .live-step-btn:focus-visible,
html[data-sim-highlights="1"] input[type="range"]:hover,
html[data-sim-highlights="1"] input[type="range"]:focus-visible,
html[data-sim-highlights="1"] .atlas-stage:focus-visible {
  outline: 2.5px solid var(--proton, #b34500) !important;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--proton, #b34500) 20%, transparent);
}
.live-pdom-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.live-pdom-sr:focus-within {
  position: relative;
  width: auto;
  height: auto;
  overflow: visible;
  clip-path: none;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  margin: .3rem 0;
  padding: .25rem .6rem;
  border-radius: 6px;
  border: 1.5px solid var(--vol);
  background: var(--sheet);
  color: var(--ink);
  font: 500 .8rem/1.3 var(--sans, system-ui, sans-serif);
}
.live-slider-track {
  display: flex;
  align-items: center;
  gap: .28rem;
  flex: 1 1 10rem;
  min-width: 0;
}
.live-slider-track input[type="range"] {
  flex: 1 1 auto;
  min-width: 3.5rem;
  margin: 0;
}
.live-step-btn {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: var(--sheet);
  color: var(--ink-2);
  font: 700 1rem/1 var(--sans, system-ui, sans-serif);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: border-color .12s ease, background-color .12s ease;
}
.live-step-btn:hover { border-color: var(--vol); color: var(--ink); }
.live-step-btn:active { transform: translateY(1px); }
.live-studio-bar {
  order: 0;
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .35rem;
  padding: .42rem .55rem;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: color-mix(in srgb, var(--sheet) 88%, var(--paper));
  position: relative;
}
.live-studio-bar .live-play {
  order: -1;
  min-height: 30px;
  min-width: 4.5rem;
  padding: .24rem .68rem;
  border-radius: 6px;
  font-size: .78rem;
}
.live-studio-sep {
  width: 1px;
  height: 1.2rem;
  background: var(--rule);
  margin: 0 .12rem;
}
.live-studio-pill {
  min-height: 30px;
  padding: .24rem .58rem;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: var(--paper);
  color: var(--ink-2);
  font: 500 .78rem/1.2 var(--sans, system-ui, sans-serif);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: .28rem;
  white-space: nowrap;
}
.live-studio-pill:hover { border-color: var(--ink); color: var(--ink); }
.live-studio-pill[aria-pressed="true"],
.live-studio-pill[aria-expanded="true"] {
  background: var(--ink);
  color: var(--sheet);
  border-color: var(--ink);
}
.live-studio-presets {
  order: 0;
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .3rem .4rem;
  padding: .2rem 0;
}
.live-studio-presets-lbl {
  font: 600 .72rem/1.2 var(--sans, system-ui, sans-serif);
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--muted);
  margin-right: .15rem;
}
.live-studio-popover {
  order: 0;
  flex-basis: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: .45rem .75rem;
  padding: .6rem .75rem;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--sheet);
  color: var(--ink);
  font: 500 .8rem/1.35 var(--sans, system-ui, sans-serif);
}
.live-studio-popover[hidden] { display: none; }
.live-pref-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
}
.live-pref-btn {
  padding: .22rem .55rem;
  border-radius: 999px;
  border: 1px solid var(--rule);
  background: var(--paper);
  color: var(--ink);
  font: 600 .75rem/1.2 var(--sans, system-ui, sans-serif);
  cursor: pointer;
}
.live-pref-btn[aria-checked="true"] {
  background: var(--vol);
  border-color: var(--vol);
  color: var(--paper);
}
@media (pointer: coarse) {
  .live-step-btn { width: 44px; height: 44px; font-size: 1.15rem; }
  .live-studio-pill,
  .live-studio-bar .live-play { min-height: 44px; padding: .38rem .75rem; font-size: .84rem; }
  .live-pref-btn { min-height: 44px; min-width: 56px; padding: .35rem .8rem; font-size: .82rem; }
}
.live-keys-modal {
  order: 0;
  flex-basis: 100%;
  padding: .65rem .8rem;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--sheet);
  color: var(--ink);
  font: 400 .8rem/1.45 var(--sans, system-ui, sans-serif);
}
.live-keys-modal[hidden] { display: none; }
.live-keys-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .45rem;
}
.live-keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: .3rem .75rem;
}
.live-keycap {
  display: inline-block;
  padding: .1rem .38rem;
  margin-right: .3rem;
  border: 1px solid var(--rule);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--paper);
  font: 600 .74rem/1.2 var(--mono, ui-monospace, monospace);
  color: var(--ink);
}
figure.live-openplay .live-challenge,
figure.live-openplay .live-mechanism-key,
figure.live-openplay .live-watch-caption,
figure.live-openplay .live-idealised {
  display: none !important;
}
`;

let cssInjected = false;
function injectStudioCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  cssInjected = true;
  if (document.getElementById('kym-sim-studio-css')) return;
  const st = document.createElement('style');
  st.id = 'kym-sim-studio-css';
  st.textContent = STUDIO_CSS;
  document.head.appendChild(st);
}

const activeEntries = new Map(); // fig -> entry
const eventLogByWidget = new Map(); // name -> events[]
let seqCounter = 0;

function makeSnapshot(ext) {
  return {
    num(prefix, fallback = 0) {
      const p = prefix.toLowerCase();
      const s = ext.sliders.find((x) => x.label.toLowerCase().includes(p));
      return s ? +s.input.value : fallback;
    },
    setSlider(prefix, val, actor = 'tour') {
      const p = prefix.toLowerCase();
      const s = ext.sliders.find((x) => x.label.toLowerCase().includes(p));
      if (s) s.drive(val, actor);
    },
    tab(groupIdx = 0) {
      return ext.tabGroups[groupIdx] ? ext.tabGroups[groupIdx].activeIdx : 0;
    },
    selectTab(groupIdx = 0, tabIdx = 0) {
      const g = ext.tabGroups[groupIdx];
      if (g && g.btns[tabIdx]) g.btns[tabIdx].click();
    },
    clickBtn(substr) {
      const p = substr.toLowerCase();
      const b = ext.buttons.find((x) => x.label.toLowerCase().includes(p));
      if (b) b.btn.click();
    },
    readout() { return ext.readoutText || ''; },
    get interacted() { return ext.interacted; },
    get watched() { return ext.watched; },
  };
}

function maybeDetentSound(api, dir) {
  if (!Live.getPrefs().sonify) return;
  const ctx = api.audio?.()?.ctx;
  if (ctx) playClick(ctx, { dir, gain: 0.04 });
}

function decorateSliders(ext, api) {
  for (const s of ext.sliders) {
    if (!s.wrap || s.wrap.querySelector('.live-slider-track')) continue;
    const inp = s.input;
    const track = document.createElement('div');
    track.className = 'live-slider-track';

    const dec = document.createElement('button');
    dec.type = 'button';
    dec.className = 'live-step-btn';
    dec.textContent = '−';
    dec.setAttribute('aria-label', `Decrease ${s.label}`);

    const inc = document.createElement('button');
    inc.type = 'button';
    inc.className = 'live-step-btn';
    inc.textContent = '+';
    inc.setAttribute('aria-label', `Increase ${s.label}`);

    const stepBy = (dir, e) => {
      const mult = e?.shiftKey ? 5 : 1;
      const cur = +inp.value;
      const step = Number.isFinite(s.step) && s.step > 0 ? s.step : 1;
      const raw = cur + dir * step * mult;
      const clamped = Math.max(s.min, Math.min(s.max, raw));
      const decimals = (String(step).split('.')[1] || '').length;
      const rounded = +clamped.toFixed(Math.min(6, decimals + 1));
      if (rounded === cur) return;
      s.drive(rounded, 'user');
      maybeDetentSound(api, dir);
    };

    dec.addEventListener('click', (e) => stepBy(-1, e));
    inc.addEventListener('click', (e) => stepBy(1, e));

    inp.parentNode.insertBefore(track, inp);
    track.append(dec, inp, inc);
  }
}

function buildStateSummary(entryOrFig) {
  const st = LiveIO.getState(entryOrFig);
  return st ? JSON.stringify(st) : null;
}

function emitCausalEvent(name, fig, ext, actor, eventMeta, stamped) {
  const ev = {
    seq: ++seqCounter,
    t: Date.now(),
    actor: actor || 'user',
    widget: name,
    lesson: fig.dataset.activeLesson || null,
    kind: eventMeta?.kind || 'update',
    control: eventMeta?.label || null,
    value: eventMeta?.value ?? null,
    readout: ext.readoutText || '',
    stamped: !!stamped,
  };
  const arr = eventLogByWidget.get(name) || [];
  arr.push(ev);
  if (arr.length > 100) arr.shift();
  eventLogByWidget.set(name, arr);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('live:io-event', { detail: ev }));
    if (typeof window.kymPhysicsNotify === 'function') {
      try {
        window.kymPhysicsNotify({
          kind: 'live_io_event',
          widgetId: name,
          actor: ev.actor,
          responseText: ev.readout,
          eventJSON: JSON.stringify(ev),
          stateJSON: buildStateSummary(fig),
        });
      } catch (_) {}
    }
  }
  return ev;
}

function emitStampAward(name, fig, ext, actor) {
  if (typeof window === 'undefined') return;
  const chMatch = /^c(?:h)?(\d+)[_-]|^fig-(\d+)-/.exec(fig.id || '') || /ch(?:apter-)?(\d+)/i.exec(fig.closest('article')?.id || '');
  const chapter = chMatch ? parseInt(chMatch[1] || chMatch[2], 10) : null;
  if (typeof window.kymPhysicsNotify === 'function') {
    try {
      window.kymPhysicsNotify({
        kind: 'live_io_stamp',
        widgetId: name,
        chapter,
        actor: actor || 'user',
        responseText: ext.readoutText || '',
        payloadJSON: buildStateSummary(fig),
      });
    } catch (_) {}
  }
}

function resolveEntry(target) {
  if (!target) {
    const all = Array.from(activeEntries.values());
    return all[all.length - 1] || null;
  }
  if (typeof target === 'string') {
    for (const entry of activeEntries.values()) {
      if (entry.fig.id === target || entry.name === target || entry.fig.dataset.activeLesson === target) return entry;
    }
    return null;
  }
  if (activeEntries.has(target)) return activeEntries.get(target);
  return null;
}

function mkPill(label, ariaLabel, opts = {}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'live-studio-pill';
  b.textContent = label;
  if (ariaLabel) b.setAttribute('aria-label', ariaLabel);
  if (opts.pressed != null) b.setAttribute('aria-pressed', String(!!opts.pressed));
  if (opts.expanded != null) b.setAttribute('aria-expanded', String(!!opts.expanded));
  return b;
}

function buildChallengeBanner(stage, chal, stamped) {
  if (!chal || !chal.prompt) return null;
  const bar = document.createElement('div');
  bar.className = 'live-challenge';
  const txt = document.createElement('span');
  txt.className = 'live-challenge-text';
  txt.innerHTML = `<strong>Challenge:</strong> ${chal.prompt}`;
  const stampEl = document.createElement('span');
  stampEl.className = 'live-stamp' + (stamped ? ' is-stamped' : '');
  stampEl.setAttribute('role', 'status');
  stampEl.textContent = stamped ? '✓ Stamped' : '◎ Goal';
  bar.append(txt, stampEl);
  stage.insertBefore(bar, stage.firstChild);
  return stampEl;
}

function buildWatchBar(stage, controls, ext, snap, shots, cutawayText, api, anchor) {
  let cutawayCard = null;
  let cutawayBtn = null;
  let cutawayOpen = false;
  if (cutawayText) {
    cutawayCard = document.createElement('div');
    cutawayCard.className = 'live-cutaway-card';
    cutawayCard.setAttribute('data-glass', '1');
    cutawayCard.hidden = true;
    cutawayCard.innerHTML = `<span class="live-cutaway-badge">◐ Cut-away inside view</span><p>${cutawayText}</p>`;
    stage.appendChild(cutawayCard);
  }
  const setCutaway = (on) => {
    cutawayOpen = !!on;
    if (cutawayCard) cutawayCard.hidden = !cutawayOpen;
    if (cutawayBtn) cutawayBtn.setAttribute('aria-pressed', String(cutawayOpen));
    if (typeof ext.cutawayCb === 'function') {
      try { ext.cutawayCb(cutawayOpen); } catch (_) {}
    }
  };
  if (!shots || !shots.length) return;

  let watchTimer = 0;
  const wBar = document.createElement('div');
  wBar.className = 'live-watch-bar';

  const wBtn = document.createElement('button');
  wBtn.type = 'button';
  wBtn.className = 'live-ctl live-watch-btn';
  wBtn.textContent = '▶ Watch 5-shot tour';
  wBtn.setAttribute('aria-pressed', 'false');

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'live-watch-dots';
  const capEl = document.createElement('span');
  capEl.className = 'live-watch-caption';
  capEl.textContent = 'Tap Watch or any step 1–5 for a guided tour.';

  const dotBtns = shots.map((sh, idx) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'live-watch-dot';
    d.textContent = String(idx + 1);
    d.title = sh.title || `Shot ${idx + 1}`;
    d.setAttribute('aria-label', sh.title || `Shot ${idx + 1}`);
    d.addEventListener('click', () => {
      stopTour();
      applyShot(idx);
    });
    dotsWrap.appendChild(d);
    return d;
  });

  if (cutawayText || ext.cutawayCb) {
    cutawayBtn = document.createElement('button');
    cutawayBtn.type = 'button';
    cutawayBtn.className = 'live-ctl live-cutaway-btn';
    cutawayBtn.textContent = '◐ Cut-away';
    cutawayBtn.setAttribute('aria-pressed', 'false');
    cutawayBtn.addEventListener('click', () => {
      setCutaway(!cutawayOpen);
      if (window.__bookSound) window.__bookSound.play('flap');
    });
  }

  function applyShot(idx) {
    const sh = shots[idx];
    if (!sh) return;
    dotBtns.forEach((b, j) => b.classList.toggle('is-active', j === idx));
    capEl.textContent = sh.caption || sh.title || '';
    if (sh.cutaway != null) setCutaway(!!sh.cutaway);
    const actFn = sh.act || sh.enter;
    if (typeof actFn === 'function') {
      ext.setActor('tour');
      try { actFn(snap); } catch (_) {}
      finally { ext.setActor('user'); }
    }
    if (idx === shots.length - 1) ext.setWatched(true);
  }

  function stopTour() {
    if (watchTimer) { clearInterval(watchTimer); watchTimer = 0; }
    wBtn.setAttribute('aria-pressed', 'false');
    wBtn.textContent = '▶ Watch 5-shot tour';
  }

  wBtn.addEventListener('click', () => {
    if (watchTimer) { stopTour(); return; }
    let stepIdx = 0;
    wBtn.setAttribute('aria-pressed', 'true');
    wBtn.textContent = '■ Stop tour';
    applyShot(0);
    watchTimer = setInterval(() => {
      stepIdx++;
      if (stepIdx >= shots.length) { stopTour(); return; }
      applyShot(stepIdx);
    }, 2100);
  });

  api.onCleanup(stopTour);
  api.onHide(stopTour);

  wBar.append(wBtn, dotsWrap);
  if (cutawayBtn) wBar.appendChild(cutawayBtn);
  wBar.appendChild(capEl);
  controls.insertBefore(wBar, anchor);
}

function buildOverlays(prefsBtn, keysBtn, sonifyBtn, api, state) {
  const prefsPopover = document.createElement('div');
  prefsPopover.className = 'live-studio-popover';
  prefsPopover.hidden = true;

  const syncPrefSwitches = () => {
    const p = Live.getPrefs();
    if (sonifyBtn) sonifyBtn.setAttribute('aria-pressed', String(!!p.sonify));
    prefsPopover.querySelectorAll('[data-pref-key]').forEach((btn) => {
      const k = btn.dataset.prefKey;
      const val = k === 'units' ? p.units === 'kmh' : !!p[k];
      btn.setAttribute('aria-checked', String(val));
      if (k === 'units') btn.textContent = p.units === 'kmh' ? 'km/h' : 'm/s';
      else btn.textContent = val ? 'On' : 'Off';
    });
  };

  for (const [key, label] of [
    ['units', 'Speed units'],
    ['colorblind', 'Colour-blind palette'],
    ['highlights', 'Interactive highlights'],
    ['sonify', 'Sound & sonification'],
  ]) {
    const row = document.createElement('div');
    row.className = 'live-pref-row';
    const span = document.createElement('span');
    span.textContent = label;
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'live-pref-btn';
    sw.setAttribute('role', 'switch');
    sw.dataset.prefKey = key;
    sw.addEventListener('click', () => {
      const cur = Live.getPrefs();
      if (key === 'units') {
        Live.setPrefs({ units: cur.units === 'kmh' ? 'si' : 'kmh' });
      } else {
        const next = !cur[key];
        Live.setPrefs({ [key]: next });
        if (key === 'sonify') {
          if (!next) {
            api.audio?.().stop?.();
            try { api._ext?.sonifyHook?.(0, state.t, Live.getPrefs()); } catch (_) {}
          } else {
            maybeDetentSound(api, 1);
          }
        }
      }
      syncPrefSwitches();
    });
    row.append(span, sw);
    prefsPopover.appendChild(row);
  }
  syncPrefSwitches();

  const keysModal = document.createElement('div');
  keysModal.className = 'live-keys-modal';
  keysModal.hidden = true;
  keysModal.setAttribute('role', 'dialog');
  keysModal.setAttribute('aria-label', 'Simulation keyboard shortcuts');
  keysModal.innerHTML = `
    <div class="live-keys-head">
      <strong>Keyboard Shortcuts</strong>
      <button type="button" class="live-pref-btn live-keys-close">Close</button>
    </div>
    <div class="live-keys-grid">
      <div><span class="live-keycap">Space</span>Play / Pause</div>
      <div><span class="live-keycap">.</span>Step forward +1 frame</div>
      <div><span class="live-keycap">S</span>Toggle ¼× Slow motion</div>
      <div><span class="live-keycap">R</span>Replay (Shift+R Reset all)</div>
      <div><span class="live-keycap">O</span>Toggle Open Play mode</div>
      <div><span class="live-keycap">H</span>Toggle Focus highlights</div>
      <div><span class="live-keycap">Arrows</span>Adjust focused slider</div>
      <div><span class="live-keycap">Esc</span>Close dialogs</div>
    </div>`;

  let lastOverlayTrigger = null;
  const closeOverlays = (returnFocus = false) => {
    const anyOpen = !prefsPopover.hidden || !keysModal.hidden;
    prefsPopover.hidden = true;
    keysModal.hidden = true;
    prefsBtn.setAttribute('aria-expanded', 'false');
    keysBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus && anyOpen && lastOverlayTrigger) {
      lastOverlayTrigger.focus({ preventScroll: true });
      lastOverlayTrigger = null;
    }
  };

  prefsBtn.addEventListener('click', () => {
    const opening = prefsPopover.hidden;
    closeOverlays(false);
    prefsPopover.hidden = !opening;
    prefsBtn.setAttribute('aria-expanded', String(opening));
    if (opening) {
      lastOverlayTrigger = prefsBtn;
      syncPrefSwitches();
      prefsPopover.querySelector('.live-pref-btn')?.focus?.({ preventScroll: true });
    }
  });
  keysBtn.addEventListener('click', () => {
    const opening = keysModal.hidden;
    closeOverlays(false);
    keysModal.hidden = !opening;
    keysBtn.setAttribute('aria-expanded', String(opening));
    if (opening) {
      lastOverlayTrigger = keysBtn;
      keysModal.querySelector('.live-keys-close')?.focus?.({ preventScroll: true });
    }
  });
  keysModal.querySelector('.live-keys-close').addEventListener('click', () => closeOverlays(true));

  return { prefsPopover, keysModal, syncPrefSwitches, closeOverlays };
}

function attach(name, fig, stage, controls, api, openBtn, state, inst, params = {}) {
  injectStudioCSS();
  const def = (window.__liveEnhancements || {})[name] || {};
  const ext = api._ext;
  const snap = makeSnapshot(ext);
  const chal = ext.challenge || def.challenge;
  const hasNum = ext.yourNumbers !== null || !!def.yourNumbers;
  const shots = ext.watch || def.watch;
  const cutawayText = ext.cutaway || def.cutaway;
  const idealText = ext.idealised || def.idealised;
  const presets = def.presets || [];

  for (const b of ext.buttons) {
    if (b.initialPressed === undefined) {
      b.initialPressed = b.btn.getAttribute('aria-pressed');
    }
  }
  decorateSliders(ext, api);

  const stampKey = 'mw:stamp:' + name;
  let stamped = false;
  try { stamped = localStorage.getItem(stampKey) === '1'; } catch (_) {}
  const stampEl = buildChallengeBanner(stage, chal, stamped);

  let numEl = null;
  if (hasNum) {
    numEl = document.createElement('div');
    numEl.className = 'live-your-numbers';
    numEl.setAttribute('aria-live', 'off');
    const badge = document.createElement('span');
    badge.className = 'live-yn-badge';
    badge.textContent = 'Your numbers';
    const eq = document.createElement('span');
    eq.className = 'live-yn-eq';
    numEl.append(badge, eq);
    controls.insertBefore(numEl, controls.firstChild);
  }

  buildWatchBar(stage, controls, ext, snap, shots, cutawayText, api, numEl ? numEl.nextSibling : controls.firstChild);

  const studioBar = document.createElement('div');
  studioBar.className = 'live-studio-bar';
  studioBar.setAttribute('role', 'toolbar');
  studioBar.setAttribute('aria-label', 'Simulation transport and preferences');

  const playBtn = controls.querySelector('.live-play');
  if (playBtn && !playBtn.hidden) studioBar.appendChild(playBtn);

  let slowBtn = null;
  let stepBtn = null;
  if (state.playbackSupported !== false) {
    stepBtn = mkPill('+1 Step', 'Step forward one frame');
    stepBtn.addEventListener('click', () => {
      state.stepOnce?.(0.05);
      maybeDetentSound(api, 1);
      emitCausalEvent(name, fig, ext, 'user', { kind: 'button', label: 'Step' }, stamped);
    });
    slowBtn = mkPill('Slow ¼×', 'Toggle slow motion quarter speed', { pressed: false });
    slowBtn.addEventListener('click', () => {
      const slow = state.speed >= 0.5;
      state.setSpeed?.(slow ? 0.25 : 1);
      slowBtn.setAttribute('aria-pressed', String(slow));
      emitCausalEvent(name, fig, ext, 'user', { kind: 'button', label: 'Slow', value: slow ? 0.25 : 1 }, stamped);
    });
    studioBar.append(stepBtn, slowBtn);
  }

  const replayBtn = mkPill('Replay', 'Replay from start keeping current controls');
  replayBtn.addEventListener('click', () => {
    ext.setActor('reset');
    try {
      state.t = 0;
      if (typeof ext.resetHooks?.replay === 'function') {
        ext.resetHooks.replay();
      } else if (typeof inst?.replay === 'function') {
        inst.replay();
      } else {
        const actionBtn = ext.buttons.find((b) => /^(replay|release|launch|restart|drop|fire)\b/i.test(b.label));
        if (actionBtn) actionBtn.btn.click();
      }
      api.redraw?.();
    } finally {
      ext.setActor('user');
    }
    emitCausalEvent(name, fig, ext, 'user', { kind: 'button', label: 'Replay' }, stamped);
  });

  const resetBtn = mkPill('Reset', 'Reset all controls and simulation');
  const doResetAll = () => {
    const hasCustomResetAll = typeof ext.resetHooks?.resetAll === 'function' || typeof inst?.resetAll === 'function';
    ext.setActor('reset');
    try {
      state.t = 0;
      state.setSpeed?.(1);
      if (slowBtn) slowBtn.setAttribute('aria-pressed', 'false');
      if (hasCustomResetAll) {
        for (const grp of ext.tabGroups) {
          if (grp.btns.setActive) grp.btns.setActive(grp.initialIdx);
        }
        for (const s of ext.sliders) s.set(s.initialValue);
        for (const btnRec of ext.buttons) {
          if (btnRec.initialPressed != null) btnRec.btn.setAttribute('aria-pressed', btnRec.initialPressed);
        }
        if (typeof ext.resetHooks?.resetAll === 'function') ext.resetHooks.resetAll();
        else inst.resetAll();
      } else {
        for (const grp of ext.tabGroups) {
          if (grp.btns[grp.initialIdx] && grp.activeIdx !== grp.initialIdx) grp.btns[grp.initialIdx].click();
        }
        for (const s of ext.sliders) s.drive(s.initialValue, 'reset');
        for (const btnRec of ext.buttons) {
          if (btnRec.initialPressed != null && btnRec.btn.getAttribute('aria-pressed') !== btnRec.initialPressed) {
            btnRec.btn.click();
          }
        }
      }
      api.redraw?.();
    } finally {
      ext.setActor('user');
    }
    emitCausalEvent(name, fig, ext, 'reset', { kind: 'reset', label: 'Reset' }, stamped);
  };
  resetBtn.addEventListener('click', doResetAll);
  studioBar.append(replayBtn, resetBtn);

  let sonifyBtn = null;
  if (ext.sonifyHook) {
    sonifyBtn = mkPill('Sonify', 'Toggle opt-in physics sonification', { pressed: !!Live.getPrefs().sonify });
    sonifyBtn.addEventListener('click', () => {
      const next = !Live.getPrefs().sonify;
      Live.setPrefs({ sonify: next });
      sonifyBtn.setAttribute('aria-pressed', String(next));
      if (!next) {
        api.audio?.().stop?.();
        try { ext.sonifyHook(0, state.t, Live.getPrefs()); } catch (_) {}
      } else {
        maybeDetentSound(api, 1);
      }
    });
    studioBar.appendChild(sonifyBtn);
  }

  const openPlayBtn = mkPill('Open Play', 'Hide hints and equations for unstructured exploration', {
    pressed: !params.lesson && !!Live.getPrefs().openPlay,
  });
  const applyOpenPlay = (on) => {
    if (params.lesson) return;
    fig.classList.toggle('live-openplay', !!on);
    openPlayBtn.setAttribute('aria-pressed', String(!!on));
  };
  if (!params.lesson) {
    applyOpenPlay(!!Live.getPrefs().openPlay);
    openPlayBtn.addEventListener('click', () => {
      const next = !fig.classList.contains('live-openplay');
      Live.setPrefs({ openPlay: next });
      applyOpenPlay(next);
    });
    studioBar.appendChild(openPlayBtn);
  }

  const sep = document.createElement('span');
  sep.className = 'live-studio-sep';
  sep.setAttribute('aria-hidden', 'true');
  const prefsBtn = mkPill('⚙ Prefs', 'Simulation display and unit preferences', { expanded: false });
  const keysBtn = mkPill('? Keys', 'Keyboard shortcuts for this simulation', { expanded: false });
  studioBar.append(sep, prefsBtn, keysBtn);

  let presetsRow = null;
  if (presets.length) {
    presetsRow = document.createElement('div');
    presetsRow.className = 'live-studio-presets';
    const lbl = document.createElement('span');
    lbl.className = 'live-studio-presets-lbl';
    lbl.textContent = 'Presets:';
    presetsRow.appendChild(lbl);
    for (const pr of presets) {
      const pb = mkPill(pr.name, pr.prompt || pr.name);
      pb.addEventListener('click', () => LiveIO.setState(fig, pr.state || {}, { actor: 'preset' }));
      presetsRow.appendChild(pb);
    }
  }

  const { prefsPopover, keysModal, syncPrefSwitches, closeOverlays } = buildOverlays(
    prefsBtn, keysBtn, sonifyBtn, api, state
  );

  const onKeyDown = (e) => {
    const tag = (e.target?.tagName || '').toUpperCase();
    if (tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && e.target.type !== 'range')) return;
    if (e.key === 'Escape') { closeOverlays(true); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); keysBtn.click(); return; }
    if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'INPUT') {
      if (playBtn && !playBtn.hidden) { e.preventDefault(); playBtn.click(); }
    } else if (e.key === '.') {
      if (stepBtn) { e.preventDefault(); stepBtn.click(); }
    } else if (e.key === 's' || e.key === 'S') {
      if (slowBtn) { e.preventDefault(); slowBtn.click(); }
    } else if (e.key === 'r' && !e.shiftKey) {
      e.preventDefault(); replayBtn.click();
    } else if (e.key === 'R' && e.shiftKey) {
      e.preventDefault(); resetBtn.click();
    } else if ((e.key === 'o' || e.key === 'O') && !params.lesson) {
      e.preventDefault(); openPlayBtn.click();
    } else if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      Live.setPrefs({ highlights: !Live.getPrefs().highlights });
      syncPrefSwitches();
    }
  };
  fig.addEventListener('keydown', onKeyDown);
  api.onCleanup(() => fig.removeEventListener('keydown', onKeyDown));

  const insertAnchor = controls.querySelector('.live-watch-bar') || numEl || controls.firstChild;
  controls.insertBefore(studioBar, insertAnchor);
  if (presetsRow) studioBar.after(presetsRow);
  (presetsRow || studioBar).after(prefsPopover, keysModal);

  if (idealText) {
    const idEl = document.createElement('p');
    idEl.className = 'live-idealised';
    idEl.innerHTML = `<strong>What the model simplifies:</strong> ${idealText}`;
    controls.appendChild(idEl);
  }

  let lastNumStr = '';
  const evaluate = (actor = ext.getActor?.() || 'user', eventMeta = null) => {
    const curNum = ext.yourNumbers !== null ? ext.yourNumbers : def.yourNumbers;
    if (numEl && curNum != null) {
      const val = typeof curNum === 'function' ? curNum(snap) : String(curNum);
      if (val && val !== lastNumStr) {
        numEl.querySelector('.live-yn-eq').textContent = val;
        lastNumStr = val;
      }
    }
    // Pedagogical Honesty: ONLY genuine user actions earn independent challenge stamps.
    if (!stamped && actor === 'user' && chal && typeof chal.check === 'function') {
      let ok = false;
      try { ok = !!chal.check(snap); } catch (_) { ok = false; }
      if (ok) {
        stamped = true;
        try { localStorage.setItem(stampKey, '1'); } catch (_) {}
        if (stampEl) {
          stampEl.textContent = '✓ Stamped';
          stampEl.classList.add('is-stamped', 'just-stamped');
        }
        if (openBtn && !openBtn.querySelector('.live-open-stamp')) {
          const b = document.createElement('em');
          b.className = 'live-open-stamp';
          b.textContent = '✓';
          b.title = 'Challenge completed';
          openBtn.appendChild(b);
        }
        if (window.__bookSound) window.__bookSound.play('stamp');
        emitStampAward(name, fig, ext, actor);
      }
    }
    if (eventMeta && eventMeta.kind !== 'readout') {
      emitCausalEvent(name, fig, ext, actor, eventMeta, stamped);
    }
  };

  ext.changeListeners.add(evaluate);
  const offPrefSync = Live.onPrefs(syncPrefSwitches);
  api.onCleanup(offPrefSync);

  const entry = {
    name, fig, stage, controls, api, state, inst, ext,
    isStamped: () => stamped,
    doResetAll,
  };
  activeEntries.set(fig, entry);
  evaluate('model', { kind: 'mount' });
}

function detach(name, fig) {
  activeEntries.delete(fig);
}

function waitForFigureMount(fig) {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      fig.removeEventListener('live:mounted', onMount);
      resolve(resolveEntry(fig));
    };
    const onMount = () => done();
    const timer = setTimeout(done, 5000);
    fig.addEventListener('live:mounted', onMount, { once: true });
  });
}

// ------------------------------------------------------------------ LiveIO Protocol (PhET-iO inspired)
export const LiveIO = {
  list() {
    return Array.from(activeEntries.values()).map((e) => ({
      widget: e.name,
      figId: e.fig.id || null,
      lesson: e.fig.dataset.activeLesson || null,
      stamped: e.isStamped(),
    }));
  },
  getState(target) {
    const e = resolveEntry(target);
    if (!e) return null;
    const sliders = {};
    for (const s of e.ext.sliders) sliders[s.label] = +s.input.value;
    const tabs = e.ext.tabGroups.map((g) => g.activeIdx);
    const custom = typeof e.inst?.getState === 'function' ? e.inst.getState() : null;
    return {
      version: 1,
      widget: e.name,
      figId: e.fig.id || null,
      lesson: e.fig.dataset.activeLesson || null,
      sliders,
      tabs,
      custom,
      readout: e.ext.readoutText || '',
      stamped: e.isStamped(),
      prefs: { ...Live.getPrefs() },
    };
  },
  setState(target, patch = {}, { actor = 'preset' } = {}) {
    const e = resolveEntry(target);
    if (!e || !patch) return null;
    if (patch.prefs && typeof patch.prefs === 'object') Live.setPrefs(patch.prefs);
    e.ext.setActor(actor);
    try {
      if (Array.isArray(patch.tabs)) {
        patch.tabs.forEach((tabIdx, grpIdx) => {
          const g = e.ext.tabGroups[grpIdx];
          if (g && g.btns[tabIdx] && g.activeIdx !== tabIdx) g.btns[tabIdx].click();
        });
      }
      if (patch.sliders && typeof patch.sliders === 'object') {
        for (const [k, val] of Object.entries(patch.sliders)) {
          const low = k.toLowerCase();
          const s = e.ext.sliders.find((x) => x.label === k || x.label.toLowerCase().includes(low));
          if (s && Number.isFinite(+val)) s.drive(+val, actor);
        }
      }
      if (patch.custom && typeof e.inst?.setState === 'function') {
        e.inst.setState(patch.custom);
      }
      for (const fn of e.api._loops) fn(0, e.state.t);
    } finally {
      e.ext.setActor('user');
    }
    emitCausalEvent(e.name, e.fig, e.ext, actor, { kind: 'preset', label: 'setState' }, e.isStamped());
    return LiveIO.getState(e.fig);
  },
  async openPreset(widgetNameOrId, patch = {}) {
    let entry = resolveEntry(widgetNameOrId);
    if (!entry) {
      const fig = document.getElementById(widgetNameOrId)
        || document.querySelector(`figure[data-live="${widgetNameOrId}"]`);
      if (!fig) return null;
      const btn = fig.querySelector('.live-open');
      if (btn && !fig.classList.contains('live-on')) {
        fig.scrollIntoView({ behavior: 'instant', block: 'center' });
        const pending = waitForFigureMount(fig);
        btn.click();
        entry = await pending;
      } else {
        entry = resolveEntry(fig);
      }
    }
    if (!entry) return null;
    entry.fig.scrollIntoView({ behavior: 'instant', block: 'center' });
    return LiveIO.setState(entry.fig, patch, { actor: 'preset' });
  },
  capturePNG(target) {
    const e = resolveEntry(target);
    if (!e) return null;
    for (const fn of e.api._loops) fn(0, e.state.t);
    const cv = e.stage.querySelector('canvas');
    let pngDataUrl = '';
    if (cv) {
      try { pngDataUrl = cv.toDataURL('image/png'); } catch (_) { pngDataUrl = ''; }
    }
    return {
      pngDataUrl,
      state: LiveIO.getState(e.fig),
      readout: e.ext.readoutText || '',
      timestamp: Date.now(),
    };
  },
  getEventLog(target) {
    const e = resolveEntry(target);
    const key = e ? e.name : (typeof target === 'string' ? target : null);
    const events = key ? (eventLogByWidget.get(key) || []).slice() : [];
    const userEvents = events.filter((ev) => ev.actor === 'user' && ev.kind !== 'mount');
    const vars = new Set(userEvents.filter((ev) => ev.control).map((ev) => ev.control));
    let singleVariableSteps = 0;
    for (let i = 1; i < userEvents.length; i++) {
      if (userEvents[i].control && userEvents[i].control === userEvents[i - 1].control) {
        singleVariableSteps++;
      }
    }
    return {
      events,
      processSummary: {
        variablesChangedCount: vars.size,
        singleVariableSteps,
        totalUserActions: userEvents.length,
        watchTourUsed: events.some((ev) => ev.actor === 'tour'),
      },
    };
  },
  shareUrl(target) {
    const st = LiveIO.getState(target);
    if (!st) return '';
    const payload = { widget: st.widget, state: { sliders: st.sliders, tabs: st.tabs, custom: st.custom } };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const hash = st.figId ? `#${st.figId}` : (typeof location !== 'undefined' ? location.hash : '');
    return `${location.origin}${location.pathname}?preset=${b64}${hash}`;
  },
};

function hydratePresetFromLocation() {
  if (typeof location === 'undefined') return;
  const search = new URLSearchParams(location.search);
  let raw = search.get('preset');
  if (!raw && location.hash.includes('preset=')) {
    const m = /preset=([^&#]+)/.exec(location.hash);
    if (m) raw = m[1];
  }
  if (!raw) return;
  try {
    const pad = raw.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((raw.length + 3) % 4);
    const parsed = JSON.parse(decodeURIComponent(escape(atob(pad))));
    if (parsed && parsed.widget && parsed.state) {
      queueMicrotask(() => { LiveIO.openPreset(parsed.widget, parsed.state); });
    }
  } catch (_) { /* ignore malformed preset URL */ }
}

if (typeof window !== 'undefined') {
  window.__liveStudio = { attach, detach };
  window.LiveIO = LiveIO;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydratePresetFromLocation, { once: true });
  } else {
    queueMicrotask(hydratePresetFromLocation);
  }
  window.addEventListener('hashchange', hydratePresetFromLocation);
}
