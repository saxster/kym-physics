// Live figures: the runtime that turns a still SVG figure into an animated or 3D one on request.
// Every live figure keeps its still drawing: it is what prints, what shows without JavaScript,
// and what a reader sees until they choose to play. Widgets register with Live.register().
// In the single-file build every widget is bundled with this runtime; in the --site build each widget is a
// lazy ES-module chunk (window.BOOK_CHUNKS maps "w_<name>" to its file) imported when the reader taps its button.

import { ENHANCEMENTS } from './enhancements.js';
import { makeColourResolver } from './css_colour.mjs';

const EL = {
  H: '#f3f1e8', C: '#3d4a46', N: '#4f74b3', O: '#c4553c', Na: '#8a6bb5', Cl: '#5c9a52', Mg: '#c7a24a',
  Al: '#a7b3b8', S: '#d9b93b', Fe: '#b06a3b', Cu: '#c27a45', Zn: '#8fa2ad', Ag: '#c9cdd0', Li: '#b98bc9',
  Ne: '#e0897a', He: '#e6c87a', K: '#a67ccf', Ca: '#9fb5a0', X: '#b8b2a2', A: '#c97b5a', B: '#5a8fae',
};
const DARK_TEXT = new Set(['C', 'Na', 'N', 'O', 'Cl', 'Fe', 'Cu', 'K', 'A', 'B', 'Li']);
const reducedQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

// Raw fragment-shader pool. A healthy WebGL1 canvas is lent to one lesson at
// a time; losing contexts on every close can itself exhaust WebKit's context cap.
let idleRawGL = null;
let activeRawGL = null;
let rawGLUnavailable = false;
function resetRawGL(g) {
  if (g.isContextLost()) return;
  g.useProgram(null);
  g.bindBuffer(g.ARRAY_BUFFER, null); g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, null);
  g.bindFramebuffer(g.FRAMEBUFFER, null); g.bindRenderbuffer(g.RENDERBUFFER, null);
  for (let i = 0; i < g.getParameter(g.MAX_VERTEX_ATTRIBS); i++) {
    g.disableVertexAttribArray(i); g.vertexAttrib4f(i, 0, 0, 0, 1);
  }
  for (let i = 0; i < g.getParameter(g.MAX_COMBINED_TEXTURE_IMAGE_UNITS); i++) {
    g.activeTexture(g.TEXTURE0 + i);
    g.bindTexture(g.TEXTURE_2D, null); g.bindTexture(g.TEXTURE_CUBE_MAP, null);
  }
  g.activeTexture(g.TEXTURE0);
  for (const cap of [g.BLEND, g.CULL_FACE, g.DEPTH_TEST, g.STENCIL_TEST,
    g.SCISSOR_TEST, g.POLYGON_OFFSET_FILL, g.SAMPLE_ALPHA_TO_COVERAGE, g.SAMPLE_COVERAGE]) g.disable(cap);
  g.enable(g.DITHER); g.colorMask(true, true, true, true); g.depthMask(true); g.stencilMask(0xffffffff);
  g.clearColor(0, 0, 0, 0); g.clearDepth(1); g.clearStencil(0);
  g.blendFunc(g.ONE, g.ZERO); g.blendEquation(g.FUNC_ADD); g.depthFunc(g.LESS);
  g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false); g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  g.pixelStorei(g.UNPACK_ALIGNMENT, 4); g.pixelStorei(g.PACK_ALIGNMENT, 4);
  g.viewport(0, 0, 1, 1); g.scissor(0, 0, 1, 1);
}
function releaseRawGL(lease) {
  if (lease.released) return;
  lease.released = true;
  lease.detach();
  lease.disposeGPU();
  const { canvas, gl } = lease;
  canvas.remove();
  if (activeRawGL === lease) activeRawGL = null;
  // A genuinely lost context is retired; healthy returns never force a loss.
  if (gl.isContextLost()) return;
  resetRawGL(gl);
  canvas.width = canvas.height = 1;
  canvas.removeAttribute('style'); canvas.hidden = false;
  idleRawGL = { canvas, gl };
}
function acquireRawGL(fig) {
  if (activeRawGL) {
    const previous = activeRawGL;
    if (previous.fig !== fig) previous.fig.dispatchEvent(new CustomEvent('close-lesson'));
    if (!previous.released) releaseRawGL(previous);
  }
  let entry = idleRawGL; idleRawGL = null;
  if (entry?.gl.isContextLost()) { entry.canvas.remove(); entry = null; }
  if (!entry && !rawGLUnavailable) {
    const canvas = document.createElement('canvas');
    let gl = null;
    try { gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
      || canvas.getContext('experimental-webgl', { antialias: false, premultipliedAlpha: false }); } catch (_) { /* use 2D */ }
    if (gl) entry = { canvas, gl }; else rawGLUnavailable = true;
  }
  if (entry) resetRawGL(entry.gl);
  return entry;
}
// End raw fragment-shader pool.

const widgets = {};
export const Live = {
  EL, DARK_TEXT,
  /** register(name, factory, {label}) — factory(stage, params, api) returns {start(), stop(), destroy()} */
  register(name, factory, meta = {}) { widgets[name] = { factory, meta }; },
};
window.Live = Live;

const resolveCanvasColour = makeColourResolver(() => document.createElement('canvas'));
function cssVar(name) {
  return resolveCanvasColour(getComputedStyle(document.body).getPropertyValue(name).trim() || '#888');
}

export function colors() {
  const c = {};
  for (const k of ['paper', 'sheet', 'ink', 'ink-2', 'muted', 'rule', 'rule-2', 'proton', 'neutron', 'electron', 'green', 'vol', 'plate', 'grid', 'mark-soft'])
    c[k.replace('-', '_')] = cssVar('--' + k);
  return c;
}

// ------------------------------------------------------------------ 2D drawing helpers
export const draw = {
  atom(ctx, x, y, r, el, opts = {}) {
    const fill = EL[el] || '#bbb';
    ctx.save();
    if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = Math.max(0.8, r * 0.07); ctx.strokeStyle = 'rgba(29,51,45,.55)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r * 0.62, Math.PI * 1.08, Math.PI * 1.55);
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = Math.max(1, r * 0.09); ctx.lineCap = 'round'; ctx.stroke();
    if (opts.label !== false && r >= 7) {
      ctx.fillStyle = DARK_TEXT.has(el) ? '#fbfaf5' : '#1d2b27';
      ctx.font = `600 ${(r * (el.length === 1 ? 0.95 : 0.78)).toFixed(1)}px Lexend, system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el, x, y + r * 0.04);
    }
    if (opts.charge) {
      const bx = x + r * 0.78, by = y - r * 0.78, br = Math.max(5, r * 0.42);
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = opts.c ? opts.c.sheet : '#fbfaf5'; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = opts.c ? opts.c.ink : '#1d332d'; ctx.stroke();
      ctx.fillStyle = opts.c ? opts.c.ink : '#1d332d';
      ctx.font = `700 ${(br * 1.2).toFixed(1)}px Lexend, system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(opts.charge, bx, by + 0.5);
    }
    ctx.restore();
  },
  // particle: 'p' proton, 'n' neutron, 'e' electron (book colours, with sign)
  particle(ctx, x, y, r, kind, c) {
    const col = { p: c.proton, n: c.neutron, e: c.electron }[kind];
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    const s = { p: '+', n: '', e: '−' }[kind];
    if (s && r >= 4) {
      ctx.fillStyle = '#fff'; ctx.font = `700 ${(r * 1.5).toFixed(1)}px Lexend, system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y + r * 0.08);
    }
  },
  bond(ctx, x1, y1, x2, y2, order, c, width = 3) {
    ctx.strokeStyle = c.ink; ctx.lineWidth = width; ctx.lineCap = 'round';
    const dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1, ox = -dy / n * 4, oy = dx / n * 4;
    const offs = order === 1 ? [0] : order === 2 ? [-0.6, 0.6] : [-1, 0, 1];
    for (const k of offs) { ctx.beginPath(); ctx.moveTo(x1 + ox * k, y1 + oy * k); ctx.lineTo(x2 + ox * k, y2 + oy * k); ctx.stroke(); }
  },
  arrow(ctx, x1, y1, x2, y2, color, width = 1.8, head = 8) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(a - 0.42), y2 - head * Math.sin(a - 0.42));
    ctx.lineTo(x2 - head * Math.cos(a + 0.42), y2 - head * Math.sin(a + 0.42)); ctx.closePath(); ctx.fill();
  },
  text(ctx, s, x, y, { size = 13, color = '#1d332d', align = 'left', weight = 400, base = 'alphabetic', serif = false } = {}) {
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
    ctx.font = `${weight} ${size}px ${serif ? 'Literata, "Literata Static", Georgia, serif' : 'Lexend, system-ui, sans-serif'}`;
    ctx.fillText(s, x, y);
  },
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  },
};

// Deterministic random numbers so every reader sees the same opening frame.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
// Normal-ish random (Box–Muller)
export function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r()); }

// ------------------------------------------------------------------ sound: api.audio()
// One AudioContext per open figure, created on first use (which is always inside a tap: nothing plays by itself).
// A browser may still start it "suspended"; it resumes on the reader's next tap or key press.
function makeAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master = null, unlockers = [];
  const voices = new Set();
  function ensure() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.22;           // gentle: well below full scale
      const comp = ctx.createDynamicsCompressor();                    // so stacked harmonics never clip
      master.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
      if (!unlockers.length) {
        const unlock = () => { if (ctx) ctx.resume().catch(() => {}); unlockers.forEach(([e, f]) => document.removeEventListener(e, f, true)); unlockers = []; };
        unlockers = ['pointerdown', 'keydown', 'touchend'].map(e => [e, unlock]);
        unlockers.forEach(([e, f]) => document.addEventListener(e, f, true));
      }
    }
    return ctx;
  }
  function voice(src, gainNode, c) {
    const v = {
      src, gain: gainNode,
      setFreq(f) { if (src.frequency) src.frequency.setTargetAtTime(f, c.currentTime, 0.02); },
      setGain(g) { gainNode.gain.setTargetAtTime(g, c.currentTime, 0.03); },
      stop(release = 0.08) {
        if (!voices.has(v)) return;
        const t = c.currentTime;
        try { gainNode.gain.cancelScheduledValues(t); gainNode.gain.setValueAtTime(gainNode.gain.value, t); gainNode.gain.linearRampToValueAtTime(0, t + release); src.stop(t + release + 0.02); } catch (e) {}
      },
    };
    voices.add(v);
    src.onended = () => { voices.delete(v); try { gainNode.disconnect(); } catch (e) {} };
    return v;
  }
  const audio = {
    get available() { return !!AC; },
    /** The AudioContext (created on first access). */
    get ctx() { return ensure(); },
    /** The master gain node every sound goes through. */
    get master() { ensure(); return master; },
    /** Play a tone: tone(440, {gain: 0.3, type: 'sine'|'square'|'sawtooth'|'triangle', dur: 1, attack: 0.01, release: 0.08, wave}).
        dur: Infinity holds it until voice.stop(). Returns a voice {setFreq(f), setGain(g), stop()} or null without Web Audio. */
    tone(freq, { gain = 0.3, type = 'sine', dur = 1, attack = 0.01, release = 0.08, when = 0, wave = null } = {}) {
      const c = ensure(); if (!c) return null;
      const t0 = c.currentTime + when;
      const o = c.createOscillator();
      if (wave) o.setPeriodicWave(wave); else o.type = type;
      o.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + attack);
      if (Number.isFinite(dur)) {
        g.gain.setValueAtTime(gain, t0 + Math.max(attack, dur - release));
        g.gain.linearRampToValueAtTime(0, t0 + dur);
      }
      o.connect(g); g.connect(master); o.start(t0);
      if (Number.isFinite(dur)) o.stop(t0 + dur + 0.02);
      return voice(o, g, c);
    },
    /** A note built from harmonics: amps[k] is the amplitude of harmonic k+1 (frequency (k+1)·f0). Same options as tone(). */
    harmonics(amps, f0, opts = {}) {
      const c = ensure(); if (!c) return null;
      const n = amps.length + 1;
      const real = new Float32Array(n), imag = new Float32Array(n);
      amps.forEach((a, k) => { imag[k + 1] = a; });
      return audio.tone(f0, { ...opts, wave: c.createPeriodicWave(real, imag) });
    },
    /** Silence everything this figure is playing. */
    stop() { voices.forEach(v => v.stop()); },
    _close() {
      audio.stop();
      unlockers.forEach(([e, f]) => document.removeEventListener(e, f, true)); unlockers = [];
      if (ctx) { const c = ctx; ctx = null; setTimeout(() => c.close().catch(() => {}), 200); }
    },
  };
  return audio;
}

// ------------------------------------------------------------------ the per-figure API
function isReducedMotion() {
  return !!(reducedQuery.matches
    || document.documentElement.classList.contains('still')
    || (document.body && document.body.classList.contains('still')));
}

function makeApi(fig, stage, controls, state) {
  const loops = new Set();
  const cleanups = [];
  const hides = new Set();     // run when the figure scrolls off screen
  const sliders = [];          // [{label, input, set, onInput}]
  const tabGroups = [];        // [{btns, activeIdx, onSelect}]
  const buttons = [];          // [{label, btn}]
  const changeListeners = new Set();
  let readoutText = '';
  let customChallenge = null;
  let customNumbers = null;
  let customWatch = null;
  let customCutaway = null;
  let customCutawayCb = null;
  let customIdealised = null;
  let interacted = false;
  let watched = false;
  let audio = null;
  const palette = colors();
  const themeObserver = new MutationObserver(() => {
    Object.assign(palette, colors());
    for (const fn of loops) fn(0, state.t);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  cleanups.push(() => themeObserver.disconnect());

  const notifyChange = () => {
    for (const fn of changeListeners) {
      try { fn(); } catch (e) { /* ignore */ }
    }
  };

  const note = (text, cls = '') => {
    const p = document.createElement('p'); p.className = 'live-note ' + cls; p.setAttribute('aria-live', 'polite');
    p.textContent = text; controls.appendChild(p); return p;
  };
  const sizeCanvas = (cv, W, H) => {
    cv.style.width = '100%'; cv.style.height = 'auto'; cv.style.aspectRatio = `${W} / ${H}`; cv.style.display = 'block';
    cv.style.setProperty('--drawing-width', W + 'px');
    cv.dataset.logicalWidth = W;
  };
  const api = {
    get reduced() { return isReducedMotion(); },
    colors: () => palette,
    draw, rng, gauss, EL,
    /** true while the figure is on screen */
    get visible() { return state.visible; },
    /** Start/pause from an explicit lesson button (for example, Run a motor). */
    play() { state.setPlaying?.(true); },
    pause() { state.setPlaying?.(false); },
    /** Parameter-only lessons do not offer a Play action with no visible effect. */
    playback(enabled) { state.setPlaybackSupported?.(!!enabled); },
    /** Keep a lesson's controls beside its primary visual. */
    placeControls(slot) { slot.appendChild(controls); },
    /** A canvas that fills the stage at a fixed logical size (W x H); drawing uses logical units. */
    canvas(W, H, label) {
      const cv = document.createElement('canvas');
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', label || fig.querySelector('svg')?.getAttribute('aria-label') || 'Animated figure');
      sizeCanvas(cv, W, H);
      stage.appendChild(cv);
      const ctx = cv.getContext('2d');
      const fit = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const cssW = cv.clientWidth || W;
        const s = cssW / W;
        cv.width = Math.round(W * s * dpr); cv.height = Math.round(H * s * dpr);
        ctx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
        for (const fn of loops) fn(0, state.t); // resizing clears a canvas: redraw the current frame
      };
      fit();
      const ro = new ResizeObserver(fit); ro.observe(cv); cleanups.push(() => ro.disconnect());
      return { cv, ctx, W, H, clear(col) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.restore(); if (col) { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); } } };
    },
    /** Register a per-frame function fn(dt seconds, t seconds). Runs only while the figure plays; dt = 0 means draw a still frame. */
    loop(fn) { loops.add(fn); return () => loops.delete(fn); },
    /** Redraw derived evidence when a reader changes a control; removed on close. */
    onChange(fn) { changeListeners.add(fn); const remove = () => changeListeners.delete(fn); cleanups.push(remove); return remove; },
    button(label, onClick, opts = {}) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'live-ctl'; b.textContent = label;
      if (opts.pressed != null) b.setAttribute('aria-pressed', String(!!opts.pressed));
      b.addEventListener('click', () => {
        interacted = true;
        onClick(b);
        notifyChange();
      });
      controls.appendChild(b);
      buttons.push({ label, btn: b });
      return b;
    },
    tabs(labels, onSelect, start = 0) {
      const wrap = document.createElement('div'); wrap.className = 'live-tabs'; wrap.setAttribute('role', 'group');
      const grp = { activeIdx: start, btns: [], onSelect };
      const btns = labels.map((l, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'live-ctl'; b.textContent = l;
        b.setAttribute('aria-pressed', String(i === start));
        b.addEventListener('click', () => {
          interacted = true;
          grp.activeIdx = i;
          btns.forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
          onSelect(i);
          notifyChange();
        });
        wrap.appendChild(b); return b;
      });
      grp.btns = btns;
      tabGroups.push(grp);
      btns.setActive = (index) => {
        grp.activeIdx = index;
        btns.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      };
      controls.appendChild(wrap); return btns;
    },
    slider(label, { min, max, step = 1, value, fmt = (v) => String(v), onInput }) {
      const id = 'ls' + Math.random().toString(36).slice(2, 8);
      const wrap = document.createElement('div'); wrap.className = 'live-slider';
      const lab = document.createElement('label'); lab.htmlFor = id; lab.textContent = label;
      const inp = document.createElement('input'); inp.type = 'range'; inp.id = id; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
      const out = document.createElement('output'); out.htmlFor = id; out.textContent = fmt(+value);
      const setVal = (v, trigger = false) => {
        inp.value = v;
        out.textContent = fmt(+inp.value);
        if (trigger && onInput) onInput(+inp.value);
        notifyChange();
      };
      inp.addEventListener('input', () => {
        interacted = true;
        out.textContent = fmt(+inp.value);
        onInput(+inp.value);
        notifyChange();
      });
      wrap.append(lab, inp, out); controls.appendChild(wrap);
      const item = { label, input: inp, set: (v) => setVal(v, false), drive: (v) => setVal(v, true),
        setLabel(text) { lab.textContent = text; item.label = text; } };
      sliders.push(item);
      return item;
    },
    /** A live text readout under the figure, announced politely to screen readers. */
    readout() {
      const r = document.createElement('p'); r.className = 'live-readout'; r.setAttribute('aria-live', 'polite');
      controls.appendChild(r);
      let last = '';
      const write = (html) => {
        if (html !== last) {
          r.innerHTML = html;
          last = html;
          readoutText = r.textContent || '';
          notifyChange();
        }
      };
      write.element = r;
      return write;
    },
    /** Pedagogical challenge: prompt + check(snapshot) */
    challenge(prompt, check) { customChallenge = { prompt, check }; },
    /** Live handwritten margin substitution: fn(snapshot) or string; also returns a setter(str) */
    yourNumbers(fn) {
      if (fn !== undefined) customNumbers = fn;
      else if (!customNumbers) customNumbers = '';
      return (str) => { customNumbers = str; notifyChange(); };
    },
    /** 5-shot choreographed Watch tour + optional cutaway description/callback */
    watch(shots, opts = {}) {
      customWatch = shots;
      if (opts.cutaway) customCutaway = opts.cutaway;
      if (opts.onCutAway) customCutawayCb = opts.onCutAway;
    },
    /** 1-sentence "What the model simplifies" honesty footnote */
    idealised(text) { customIdealised = text; },
    onCleanup(fn) { cleanups.push(fn); },
    /** fn() runs whenever the figure scrolls off screen (the loop pauses by itself; use this for sound, sensors, video). */
    onHide(fn) { hides.add(fn); return () => hides.delete(fn); },

    /** Web Audio for this figure: {tone(freq, opts), harmonics(amps, f0, opts), stop(), ctx, master, available}.
        Call it from a button handler. Sound stops when the figure closes or scrolls off screen. */
    audio() {
      if (!audio) { audio = makeAudio(); hides.add(() => audio.stop()); cleanups.push(() => audio._close()); }
      return audio;
    },

    /** The microphone, behind a button: permission is asked only when the reader presses it.
        Returns a reader {time() Float32Array (−1..1), freq() Float32Array (dB per bin), rms(), active, sampleRate, binHz, stop()}.
        Sound is analysed on the device: nothing is recorded or sent anywhere. */
    mic({ label = 'Use my microphone', fftSize = 2048, smoothing = 0.6, onStart, onStop, onError } = {}) {
      let stream = null, src = null, an = null;
      const td = new Float32Array(fftSize), fd = new Float32Array(fftSize / 2);
      const btn = api.button(label, () => (an ? stop() : start()));
      btn.setAttribute('aria-pressed', 'false');
      const msg = note('The sound is measured on this device. Nothing is recorded or sent anywhere.');
      const fail = (e) => {
        stop();
        msg.textContent = 'Microphone not available here. You can still read the figure, or try another browser or device.';
        msg.classList.add('live-warn'); btn.disabled = true;
        onError && onError(e);
      };
      async function start() {
        const md = navigator.mediaDevices;
        if (!md || !md.getUserMedia || !api.audio().available) return fail(new Error('no getUserMedia'));
        btn.disabled = true;
        const c = api.audio().ctx;             // created inside the tap, so the browser lets it run
        try {
          stream = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        } catch (e) { btn.disabled = false; return fail(e); }
        if (!stage.isConnected) { stop(); return; }
        if (c.state === 'suspended') c.resume().catch(() => {});
        src = c.createMediaStreamSource(stream);
        an = c.createAnalyser(); an.fftSize = fftSize; an.smoothingTimeConstant = smoothing;
        src.connect(an);                       // analyser only: never connected to the speakers, so no feedback
        btn.disabled = false; btn.textContent = 'Stop the microphone'; btn.setAttribute('aria-pressed', 'true');
        onStart && onStart(reader);
      }
      function stop() {
        if (stream) stream.getTracks().forEach(t => t.stop());
        try { src && src.disconnect(); } catch (e) {}
        const was = !!an;
        stream = src = an = null;
        btn.textContent = label; btn.setAttribute('aria-pressed', 'false');
        if (was && onStop) onStop();
      }
      const reader = {
        get active() { return !!an; },
        get sampleRate() { return audio && audio.ctx ? audio.ctx.sampleRate : 48000; },
        get binHz() { return reader.sampleRate / fftSize; },
        time() { if (an) an.getFloatTimeDomainData(td); else td.fill(0); return td; },
        freq() { if (an) an.getFloatFrequencyData(fd); else fd.fill(-160); return fd; },
        rms() { const t = reader.time(); let s = 0; for (let i = 0; i < t.length; i++) s += t[i] * t[i]; return Math.sqrt(s / t.length); },
        stop,
      };
      hides.add(stop); cleanups.push(stop);
      return reader;
    },

    /** The phone's accelerometer, behind a button (iOS asks permission on that press).
        Returns {onSample(fn), stop(), active}; fn gets {t (s), x, y, z, g} in m/s², gravity included (a phone lying still reads g ≈ 9.8). */
    motion({ label = 'Use the motion sensor', onError } = {}) {
      const fns = new Set();
      let on = false, got = false, timer = 0;
      const btn = api.button(label, () => (on ? stop() : start()));
      btn.setAttribute('aria-pressed', 'false');
      const msg = note('Readings stay on this device.');
      const handler = (e) => {
        const a = e.accelerationIncludingGravity;
        if (!a || a.x == null) return;
        got = true;
        if (!state.visible) return;                // paused while off screen
        const s = { t: e.timeStamp / 1000, x: a.x, y: a.y, z: a.z, g: Math.hypot(a.x, a.y, a.z) };
        fns.forEach(f => f(s));
      };
      const fail = (e) => {
        stop();
        msg.innerHTML = 'No motion sensor is available here. On a phone, the free <a href="https://phyphox.org" target="_blank" rel="noopener">phyphox</a> app can record the same measurement.';
        msg.classList.add('live-warn'); btn.disabled = true;
        onError && onError(e);
      };
      async function start() {
        if (!('DeviceMotionEvent' in window)) return fail(new Error('no DeviceMotionEvent'));
        try {
          if (typeof DeviceMotionEvent.requestPermission === 'function') {
            const r = await DeviceMotionEvent.requestPermission();
            if (r !== 'granted') return fail(new Error('permission ' + r));
          }
        } catch (e) { return fail(e); }
        window.addEventListener('devicemotion', handler);
        on = true; btn.textContent = 'Stop the sensor'; btn.setAttribute('aria-pressed', 'true');
        clearTimeout(timer);
        timer = setTimeout(() => { if (on && !got) fail(new Error('no readings')); }, 1500);   // desktops have the event but no sensor
      }
      function stop() {
        window.removeEventListener('devicemotion', handler); clearTimeout(timer);
        on = false; btn.textContent = label; btn.setAttribute('aria-pressed', 'false');
      }
      cleanups.push(stop);
      return { onSample(fn) { fns.add(fn); return () => fns.delete(fn); }, stop, get active() { return on; } };
    },

    /** The reader's own video clip: a file picker, frame stepping and tap-to-mark.
        Returns {video, marks() [{t, x, y}] (seconds; video pixels, y downwards), onMark(fn), undo(), clear(), step(n), fps}.
        The clip is opened from the device and never leaves it. */
    video({ label = 'Choose a video', fps = 30, fpsChoices = [24, 30, 60, 120, 240], onLoad } = {}) {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'video/*'; input.hidden = true; controls.appendChild(input);
      api.button(label, () => input.click());
      const wrap = document.createElement('div'); wrap.className = 'live-video';
      const v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('playsinline', '');
      const ov = document.createElement('canvas'); ov.className = 'live-video-marks';
      ov.setAttribute('aria-label', 'Tap the video to mark where the object is in this frame');
      wrap.append(v, ov); wrap.hidden = true; stage.appendChild(wrap);
      const bar = document.createElement('div'); bar.className = 'live-tabs live-vbar'; bar.hidden = true;
      const mk = (txt, fn, aria) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'live-ctl'; b.textContent = txt; if (aria) b.setAttribute('aria-label', aria); b.addEventListener('click', fn); bar.appendChild(b); return b; };
      mk('◀', () => step(-1), 'Back one frame'); mk('▶', () => step(1), 'Forward one frame');
      const sel = document.createElement('select'); sel.className = 'live-ctl'; sel.setAttribute('aria-label', 'Frames per second of the clip');
      fpsChoices.forEach(f => { const o = document.createElement('option'); o.value = f; o.textContent = `${f} fps`; if (f === fps) o.selected = true; sel.appendChild(o); });
      sel.addEventListener('change', () => { ctl.fps = +sel.value; });
      bar.appendChild(sel);
      mk('Undo mark', () => ctl.undo());
      controls.appendChild(bar);
      const msg = note('Your clip opens on this device and is never uploaded.');
      let url = null, curT = 0;
      const marks = [], fns = new Set();
      const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
      function paint() {
        const r = v.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
        ov.width = Math.max(1, Math.round(r.width * dpr)); ov.height = Math.max(1, Math.round(r.height * dpr));
        const g = ov.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, r.width, r.height);
        if (!v.videoWidth) return;
        const s = r.width / v.videoWidth, c = colors();
        marks.forEach((m, i) => {
          const now = Math.abs(m.t - curT) < 0.5 / ctl.fps;
          g.beginPath(); g.arc(m.x * s, m.y * s, now ? 7 : 4.5, 0, 6.2832);
          g.fillStyle = now ? c.proton : c.electron; g.globalAlpha = now ? 1 : 0.75; g.fill();
          g.globalAlpha = 1; g.lineWidth = 1.5; g.strokeStyle = '#fff'; g.stroke();
        });
      }
      function settle() {
        curT = v.currentTime; paint();
        // the exact time of the frame on screen, where the browser reports it
        if (hasRVFC) v.requestVideoFrameCallback((now, md) => { if (Math.abs(md.mediaTime - v.currentTime) < 1 / ctl.fps) { curT = md.mediaTime; paint(); } });
      }
      function step(n) {
        if (!v.duration) return;
        v.pause();
        v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + n / ctl.fps));
      }
      v.addEventListener('seeked', settle);
      v.addEventListener('loadeddata', () => { wrap.hidden = false; bar.hidden = false; curT = 0; settle(); onLoad && onLoad(ctl); });
      v.addEventListener('error', () => { msg.textContent = 'This browser cannot play that video. Try a clip saved as MP4.'; msg.classList.add('live-warn'); });
      input.addEventListener('change', () => {
        const f = input.files && input.files[0]; if (!f) return;
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(f); marks.length = 0; v.src = url; v.load();
      });
      ov.addEventListener('pointerdown', (e) => {
        if (!v.videoWidth) return;
        const r = ov.getBoundingClientRect(), s = v.videoWidth / r.width;
        const m = { t: +curT.toFixed(4), x: Math.round((e.clientX - r.left) * s), y: Math.round((e.clientY - r.top) * s) };
        const i = marks.findIndex(q => Math.abs(q.t - m.t) < 0.5 / ctl.fps);
        if (i >= 0) marks.splice(i, 1, m); else marks.push(m);
        marks.sort((a, b) => a.t - b.t);
        paint(); fns.forEach(f => f(m, marks.slice()));
        step(1);                                   // after a mark, move on to the next frame
      });
      const ro = new ResizeObserver(paint); ro.observe(wrap);
      hides.add(() => v.pause());
      cleanups.push(() => { ro.disconnect(); v.removeAttribute('src'); v.load(); if (url) URL.revokeObjectURL(url); });
      const ctl = {
        video: v, fps,
        marks: () => marks.slice(),
        onMark(fn) { fns.add(fn); return () => fns.delete(fn); },
        undo() { marks.pop(); paint(); fns.forEach(f => f(null, marks.slice())); },
        clear() { marks.length = 0; paint(); fns.forEach(f => f(null, [])); },
        step,
        get time() { return curT; },
      };
      return ctl;
    },

    /** A full-canvas WebGL fragment shader. The source gets `precision highp float; uniform vec2 u_res; uniform float u_time;`
        prepended; declare your own uniforms in it and pass their values in `uniforms` (numbers or arrays of 2–4).
        Returns {ok, canvas, set(name, value), draw(), onCanvasChange(fn)}; the callback
        immediately receives the current canvas, then a replacement on fallback or null on close. Without WebGL: opts.fallback(ctx2d, W, H, uniforms, t) draws on a
        2D canvas instead, or, with no fallback, the still drawing stays with a short note. Runs in api.loop, so it plays,
        pauses and respects reduced motion like any widget. */
    gl(fragment, uniforms = {}, { width = 640, height = 360, label, fallback } = {}) {
      const U = { ...uniforms }, entry = acquireRawGL(fig);
      let t = state.t || 0, closed = false, lost = false, surface = null, fallbackMounted = false;
      let prog = null, buf = null, loc = -1, ro = null;
      const shaders = [], attached = new Set(), locs = {}, listeners = [], pointerIds = new Set(), canvasChanges = new Set();
      const cv = entry?.canvas, g = entry?.gl;
      let lease = null;
      const drawFallback = () => { if (!closed && surface && fallback) fallback(surface.ctx, width, height, U, t); };
      const currentCanvas = () => surface?.cv || (fallbackMounted ? null : cv);
      const notifyCanvas = canvas => { for (const fn of canvasChanges) fn(canvas); };
      const mountFallback = message => {
        if (fallbackMounted || closed) return;
        fallbackMounted = true;
        if (fallback) { surface = api.canvas(width, height, label); drawFallback(); }
        else {
          const svg = fig.querySelector('svg.fig');
          if (svg) stage.appendChild(svg.cloneNode(true));
        }
        notifyCanvas(currentCanvas());
        note(message || 'This view needs WebGL. The calculated drawing shows the same idea.', 'live-warn');
      };
      const disposeGPU = () => {
        if (!g || g.isContextLost()) { prog = buf = null; shaders.length = 0; attached.clear(); return; }
        g.useProgram(null);
        if (loc >= 0) g.disableVertexAttribArray(loc);
        g.bindBuffer(g.ARRAY_BUFFER, null); g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, null);
        if (buf) { g.deleteBuffer(buf); buf = null; }
        if (prog) {
          for (const shader of attached) g.detachShader(prog, shader);
          g.deleteProgram(prog); prog = null;
        }
        for (const shader of shaders) g.deleteShader(shader);
        shaders.length = 0; attached.clear();
      };
      const loseView = event => {
        event?.preventDefault();
        if (closed || lost) return;
        lost = true;
        if (lease) releaseRawGL(lease);
        mountFallback('The shader view became unavailable. Keep using the calculated drawing and its controls.');
      };
      const drawNow = () => {
        if (closed) return;
        if (fallbackMounted) { drawFallback(); return; }
        if (!g || lost || lease?.released) return;
        if (g.isContextLost()) { loseView(); return; }
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.round((cv.clientWidth || width) * dpr)), h = Math.max(1, Math.round((cv.clientHeight || height) * dpr));
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        // Bind this lease explicitly, including on paused redraws after resize.
        g.useProgram(prog); g.bindBuffer(g.ARRAY_BUFFER, buf);
        g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
        g.viewport(0, 0, w, h);
        const uni = n => n in locs ? locs[n] : (locs[n] = g.getUniformLocation(prog, n));
        g.uniform2f(uni('u_res'), w, h); g.uniform1f(uni('u_time'), t);
        for (const [n, val] of Object.entries(U)) {
          const l = uni(n); if (l == null) continue;
          if (typeof val === 'number') g.uniform1f(l, val);
          else if (val.length === 2) g.uniform2fv(l, val);
          else if (val.length === 3) g.uniform3fv(l, val);
          else if (val.length === 4) g.uniform4fv(l, val);
        }
        g.drawArrays(g.TRIANGLES, 0, 3);
      };
      if (entry) {
        // Widgets attach pointer listeners directly to the returned canvas. Track
        // them for this lease so a reused surface cannot call a closed widget.
        const add = cv.addEventListener, remove = cv.removeEventListener;
        cv.addEventListener = function(type, listener, options) {
          listeners.push([type, listener, options]); add.call(cv, type, listener, options);
        };
        cv.removeEventListener = function(type, listener, options) {
          remove.call(cv, type, listener, options);
          const capture = option => typeof option === 'boolean' ? option : !!option?.capture;
          for (let i = listeners.length - 1; i >= 0; i--) if (listeners[i][0] === type && listeners[i][1] === listener
            && capture(listeners[i][2]) === capture(options)) listeners.splice(i, 1);
        };
        const rememberPointer = e => pointerIds.add(e.pointerId);
        add.call(cv, 'pointerdown', rememberPointer, true);
        add.call(cv, 'webglcontextlost', loseView);
        lease = { ...entry, fig, released: false, disposeGPU, detach() {
          ro?.disconnect();
          for (const id of pointerIds) { try { if (cv.hasPointerCapture(id)) cv.releasePointerCapture(id); } catch (_) { /* pointer ended */ } }
          for (const [type, listener, options] of listeners) remove.call(cv, type, listener, options);
          listeners.length = 0;
          remove.call(cv, 'pointerdown', rememberPointer, true); remove.call(cv, 'webglcontextlost', loseView);
          cv.addEventListener = add; cv.removeEventListener = remove;
        } };
        activeRawGL = lease;
        cv.setAttribute('role', 'img');
        cv.setAttribute('aria-label', label || fig.querySelector('svg')?.getAttribute('aria-label') || 'Animated figure');
        sizeCanvas(cv, width, height); stage.appendChild(cv);
        try {
          const compile = (type, source) => {
            const shader = g.createShader(type);
            if (!shader) throw new Error('Shader allocation failed');
            shaders.push(shader); g.shaderSource(shader, source); g.compileShader(shader);
            if (!g.getShaderParameter(shader, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(shader) || 'Shader compilation failed');
            return shader;
          };
          prog = g.createProgram();
          if (!prog) throw new Error('Program allocation failed');
          const vertex = compile(g.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
          g.attachShader(prog, vertex); attached.add(vertex);
          const pixel = compile(g.FRAGMENT_SHADER, 'precision highp float;\nuniform vec2 u_res;\nuniform float u_time;\n' + fragment);
          g.attachShader(prog, pixel); attached.add(pixel);
          g.linkProgram(prog);
          if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(prog) || 'Shader link failed');
          // Linked executables no longer need their source shader objects.
          for (const shader of shaders) { g.detachShader(prog, shader); g.deleteShader(shader); }
          shaders.length = 0; attached.clear();
          buf = g.createBuffer(); if (!buf) throw new Error('Buffer allocation failed');
          g.bindBuffer(g.ARRAY_BUFFER, buf);
          g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
          loc = g.getAttribLocation(prog, 'p'); if (loc < 0) throw new Error('Shader position attribute unavailable');
          ro = new ResizeObserver(drawNow); ro.observe(cv);
        } catch (_) {
          releaseRawGL(lease);
          mountFallback('The shader could not start. Keep using the calculated drawing and controls.');
        }
      } else mountFallback();
      api.loop((dt, tt) => { t = tt; drawNow(); });
      cleanups.push(() => { closed = true; notifyCanvas(null); canvasChanges.clear(); if (lease) releaseRawGL(lease); });
      drawNow();
      return {
        get ok() { return !!entry && !lost && !fallbackMounted && !closed && !lease?.released; },
        get canvas() { return currentCanvas(); },
        onCanvasChange(fn) {
          if (closed) { fn(null); return () => {}; }
          canvasChanges.add(fn); fn(currentCanvas());
          return () => canvasChanges.delete(fn);
        },
        set(n, val) { if (closed) return; U[n] = val; drawNow(); },
        draw: drawNow,
      };
    },
    _loops: loops, _cleanups: cleanups, _hides: hides,
    _ext: {
      sliders, tabGroups, buttons, changeListeners,
      get readoutText() { return readoutText; },
      get interacted() { return interacted; },
      get watched() { return watched; },
      setWatched(v) { watched = v; notifyChange(); },
      get challenge() { return customChallenge; },
      get yourNumbers() { return customNumbers; },
      get watch() { return customWatch; },
      get cutaway() { return customCutaway; },
      get cutawayCb() { return customCutawayCb; },
      get idealised() { return customIdealised; },
    },
  };
  return api;
}

function makeSnapshot(ext) {
  return {
    num(prefix, fallback = 0) {
      const p = prefix.toLowerCase();
      const s = ext.sliders.find((x) => x.label.toLowerCase().includes(p));
      return s ? +s.input.value : fallback;
    },
    setSlider(prefix, val) {
      const p = prefix.toLowerCase();
      const s = ext.sliders.find((x) => x.label.toLowerCase().includes(p));
      if (s) s.drive(val);
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

function attachEnhancements(name, fig, stage, controls, api, openBtn) {
  const def = ENHANCEMENTS[name] || {};
  const ext = api._ext;
  const snap = makeSnapshot(ext);
  const chal = ext.challenge || def.challenge;
  const hasNum = ext.yourNumbers !== null || !!def.yourNumbers;
  const shots = ext.watch || def.watch;
  const cutawayText = ext.cutaway || def.cutaway;
  const idealText = ext.idealised || def.idealised;

  // 1. Challenge banner + circular rubber stamp at top of stage
  let stampEl = null;
  const stampKey = 'mw:stamp:' + name;
  let stamped = false;
  try { stamped = localStorage.getItem(stampKey) === '1'; } catch (e) { /* ignore */ }

  if (chal && chal.prompt) {
    const bar = document.createElement('div');
    bar.className = 'live-challenge';
    const txt = document.createElement('span');
    txt.className = 'live-challenge-text';
    txt.innerHTML = `<strong>Challenge:</strong> ${chal.prompt}`;
    stampEl = document.createElement('span');
    stampEl.className = 'live-stamp' + (stamped ? ' is-stamped' : '');
    stampEl.setAttribute('role', 'status');
    stampEl.textContent = stamped ? '✓ Stamped' : '◎ Goal';
    bar.append(txt, stampEl);
    stage.insertBefore(bar, stage.firstChild);
  }

  // 2. Cut-away cross-section overlay card inside stage
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
      try { ext.cutawayCb(cutawayOpen); } catch (e) { /* ignore */ }
    }
  };

  // 3. Live "Your Numbers" handwritten margin substitution strip at top of controls
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

  // 4. 5-shot choreographed Watch tour bar
  let watchTimer = 0;
  if (shots && shots.length) {
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
        try { actFn(snap); } catch (e) { /* ignore */ }
      }
      if (idx === shots.length - 1) ext.setWatched(true);
    }

    function stopTour() {
      if (watchTimer) { clearInterval(watchTimer); watchTimer = 0; }
      wBtn.setAttribute('aria-pressed', 'false');
      wBtn.textContent = '▶ Watch 5-shot tour';
    }

    wBtn.addEventListener('click', () => {
      if (watchTimer) {
        stopTour();
        return;
      }
      let stepIdx = 0;
      wBtn.setAttribute('aria-pressed', 'true');
      wBtn.textContent = '■ Stop tour';
      applyShot(0);
      watchTimer = setInterval(() => {
        stepIdx++;
        if (stepIdx >= shots.length) {
          stopTour();
          return;
        }
        applyShot(stepIdx);
      }, 2100);
    });

    api.onCleanup(stopTour);
    api.onHide(stopTour);

    wBar.append(wBtn, dotsWrap);
    if (cutawayBtn) wBar.appendChild(cutawayBtn);
    wBar.appendChild(capEl);
    controls.insertBefore(wBar, numEl ? numEl.nextSibling : controls.firstChild);
  }

  // 5. "What the model simplifies" 1-sentence honesty footnote
  if (idealText) {
    const idEl = document.createElement('p');
    idEl.className = 'live-idealised';
    idEl.innerHTML = `<strong>What the model simplifies:</strong> ${idealText}`;
    controls.appendChild(idEl);
  }

  // Sync live numbers + challenge check
  let lastNumStr = '';
  const evaluate = () => {
    const curNum = ext.yourNumbers !== null ? ext.yourNumbers : def.yourNumbers;
    if (numEl && curNum != null) {
      const val = typeof curNum === 'function' ? curNum(snap) : String(curNum);
      if (val && val !== lastNumStr) {
        numEl.querySelector('.live-yn-eq').textContent = val;
        lastNumStr = val;
      }
    }
    if (!stamped && chal && typeof chal.check === 'function') {
      let ok = false;
      try { ok = !!chal.check(snap); } catch (e) { ok = false; }
      if (ok) {
        stamped = true;
        try { localStorage.setItem(stampKey, '1'); } catch (e) { /* ignore */ }
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
      }
    }
  };

  ext.changeListeners.add(evaluate);
  evaluate();
}

// ------------------------------------------------------------------ wiring figures
const chunkURL = (key) => {
  const m = window.BOOK_CHUNKS || {};
  return m[key] ? new URL(m[key], document.baseURI).href : null;
};
/** Load a lazy chunk by name (site build); resolves once its module has run. */
const chunkRetries = {};
let liveRequestSequence=0;
export function loadChunk(key) {
  const url = chunkURL(key);
  if (!url) return Promise.reject(new Error(`no chunk ${key}`));
  const next = new URL(url);
  if(chunkRetries[key])next.searchParams.set('retry',chunkRetries[key]);
  return import(/* @vite-ignore */ next.href).catch(error=>{chunkRetries[key]=(chunkRetries[key]||0)+1;throw error;});
}

const ICON_3D = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5 L17 6.3 V13.7 L10 17.5 L3 13.7 V6.3 Z M3 6.3 L10 10 L17 6.3 M10 10 V17.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 4.2 L15.5 10 L6.5 15.8 Z" fill="currentColor"/></svg>';

function setup(fig) {
  const options = [];
  if (fig.dataset.live) {
    let params = {};
    try { params = JSON.parse(fig.dataset.liveParams || '{}'); } catch (_) { /* defaults */ }
    const pre = widgets[fig.dataset.live]?.meta || { label: fig.dataset.liveLabel, three: fig.dataset.live3d === '1' };
    options.push({ name: fig.dataset.live, params, label: pre.label || (pre.three ? 'Turn it in 3D' : 'Watch it move'), original: true, three: pre.three });
  }
  try {
    for (const lesson of JSON.parse(fig.dataset.labs || '[]')) {
      options.push({ name: lesson.widget, params: { lesson: lesson.id }, id: lesson.id, label: 'Explore: ' + lesson.title });
    }
  } catch (_) { /* an invalid extension must not hide the original drawing */ }
  const available = options.filter(o => widgets[o.name] || chunkURL('w_' + o.name));
  if (!available.length) return;
  let name, params, open, openLabel, generation = 0;
  for (const option of available) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = option.original ? 'live-open' : 'lab-open';
    if (option.id) button.dataset.lessonId = option.id;
    if (option.original) {
      button.innerHTML = (option.three ? ICON_3D : ICON_PLAY) + '<span></span>';
      button.querySelector('span').textContent = option.label;
      try {
        if (localStorage.getItem('mw:stamp:' + option.name) === '1') {
          const stamp = document.createElement('em'); stamp.className = 'live-open-stamp';
          stamp.textContent = '✓'; stamp.title = 'Challenge completed'; button.append(stamp);
        }
      } catch (_) { /* notebook storage is optional */ }
    } else button.textContent = option.label;
    option.button = button;
    button.addEventListener('click', () => openLive(option));
    fig.insertBefore(button, fig.querySelector('figcaption'));
  }

  let w = null, inst = null, api = null, stage = null, controls = null, playing = false, raf = 0, last = 0, liftTimer = 0;
  const state = { visible: true, t: 0 };
  state.setPlaying = setPlaying;
  state.setPlaybackSupported = (enabled) => {
    state.playbackSupported = enabled;
    playBtn.hidden = !enabled;
    if (!enabled && playing) setPlaying(false);
  };
  const originalFigureName = { label: fig.getAttribute('aria-label'), by: fig.getAttribute('aria-labelledby') };
  const playBtn = document.createElement('button');
  playBtn.type = 'button'; playBtn.className = 'live-ctl live-play';

  function frame(ts) {
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts; state.t += dt;
    const activeApi = api;
    for (const fn of activeApi._loops) {
      fn(dt, state.t);
      if (api !== activeApi || !playing) break;
    }
    if (api === activeApi && playing && state.visible) raf = requestAnimationFrame(frame);
  }
  function setPlaying(p) {
    p = !!p && state.playbackSupported !== false;
    playing = p;
    playBtn.textContent = p ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-pressed', String(p));
    fig.querySelectorAll('.live-readout').forEach(node => node.setAttribute('aria-live', p ? 'off' : 'polite'));
    cancelAnimationFrame(raf); last = 0;
    if (p && state.visible) raf = requestAnimationFrame(frame);
    else if (api) for (const fn of api._loops) fn(0, state.t); // draw one still frame
  }
  async function openLive(option, story = null) {
    const requestOrder=++liveRequestSequence;
    if (stage) closeLive(false);
    const ticket = ++generation;
    name = option.name; params = { ...option.params, story }; open = option.button; openLabel = option.label;
    const setLabel = text => { const span = option.button.querySelector('span'); if (span) span.textContent = text; else option.button.textContent = text; };
    if (!widgets[name]) {
      available.forEach(o => { o.button.disabled = true; }); setLabel('Loading…');
      try { await loadChunk('w_' + name); } catch (e) { /* reported below */ }
      if (ticket !== generation || requestOrder!==liveRequestSequence) {
        if(ticket===generation)available.forEach(o=>{o.button.disabled=false;});
        setLabel(option.label);return;
      }
      available.forEach(o => { o.button.disabled = false; }); setLabel(openLabel);
      if (!widgets[name]) {
        let msg = fig.querySelector('.live-fail');
        if (!msg) { msg = document.createElement('p'); msg.className = 'live-note live-warn live-fail'; msg.setAttribute('role', 'status'); fig.insertBefore(msg, open.nextSibling); }
        msg.textContent = location.protocol === 'file:'
          ? 'This live figure loads from the web. Open the book from its website (or a local server) to use it.'
          : 'This live figure could not load. Check the connection and try again.';
        return;
      }
    }
    w = widgets[name];
    fig.querySelector('.live-fail')?.remove();
    fig.classList.add('live-on');
    if (params.lesson) {
      fig.dataset.activeLesson = params.lesson;
      fig.setAttribute('aria-label', option.label.replace(/^Explore:\s*/, ''));
      fig.removeAttribute('aria-labelledby');
    }
    if (!isReducedMotion()) {
      fig.classList.add('live-lifting');
      clearTimeout(liftTimer);
      liftTimer = setTimeout(() => fig.classList.remove('live-lifting'), 520);
    }
    if (window.__bookSound) window.__bookSound.play('flap');
    stage = document.createElement('div'); stage.className = 'live-stage';
    controls = document.createElement('div'); controls.className = 'live-controls';
    fig.insertBefore(stage, open); fig.insertBefore(controls, open);
    state.t = 0;
    state.playbackSupported = !w.meta.static;
    playBtn.hidden = !state.playbackSupported;
    api = makeApi(fig, stage, controls, state);
    if (!w.meta.static) controls.appendChild(playBtn);
    try { inst = w.factory(stage, params, api) || {}; }
    catch (_) {
      closeLive(false);
      const message = document.createElement('p');
      message.className = 'live-note live-fail'; message.setAttribute('role', 'status');
      message.textContent = 'This experiment could not open here. The drawing remains available; try opening it again.';
      fig.insertBefore(message, open); return;
    }
    attachEnhancements(name, fig, stage, controls, api, open);
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'live-ctl live-close'; close.textContent = 'Back to the drawing';
    close.addEventListener('click', () => closeLive());
    controls.appendChild(close);
    const detail = document.createElement('button');
    detail.type = 'button'; detail.className = 'live-ctl live-detail-toggle';
    detail.textContent = 'Full-size drawing'; detail.setAttribute('aria-pressed', 'false');
    const detailHint = document.createElement('p');
    detailHint.className = 'live-detail-hint'; detailHint.hidden = true;
    detailHint.textContent = params.lesson ? 'Scroll sideways in the drawing to see all of it.' : 'Scroll sideways to see the full drawing. The controls below still work.';
    controls.append(detail, detailHint);
    detail.addEventListener('click', () => {
      const full = stage.classList.toggle('live-inspect');
      detail.setAttribute('aria-pressed', String(full));
      detail.textContent = full ? 'Fit drawing' : 'Full-size drawing';
      detailHint.hidden = !full;
      if (params.lesson) {
        const diagram = stage.querySelector('.lab-diagram-scroll');
        diagram?.setAttribute('aria-label', full ? 'Full-size calculated drawing. Scroll horizontally to inspect it.' : 'Calculated drawing and measurements.');
        diagram?.focus();
      } else if (full) {
        stage.tabIndex = 0;
        stage.setAttribute('role', 'region');
        stage.setAttribute('aria-label', 'Full-size live drawing. Scroll horizontally to explore.');
      } else {
        stage.removeAttribute('tabindex'); stage.removeAttribute('role'); stage.removeAttribute('aria-label');
        stage.scrollLeft = 0;
      }
      // Canvas ResizeObservers redraw the same state; this changes no physical input or clock.
    });
    available.forEach(o => { o.button.hidden = true; });
    setPlaying(!params.lesson && !api.reduced && !w.meta.static);
    if (params.lesson) for (const fn of api._loops) fn(0, 0);
    if (w.meta.static) for (const fn of api._loops) fn(0, 0);
    (stage.querySelector('.live-3d[tabindex],canvas[tabindex],button,input') || playBtn).focus?.({ preventScroll: true });
  }
  function closeLive(restoreFocus = true) {
    ++generation; // Also cancels a story experiment whose module is still loading.
    clearTimeout(liftTimer);
    cancelAnimationFrame(raf);
    inst?.destroy?.();
    api?._cleanups.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    stage?.remove(); controls?.remove();
    fig.classList.remove('live-on', 'live-lifting');
    delete fig.dataset.activeLesson;
    for (const [attribute, value] of [['aria-label', originalFigureName.label], ['aria-labelledby', originalFigureName.by]]) {
      if (value === null) fig.removeAttribute(attribute); else fig.setAttribute(attribute, value);
    }
    available.forEach(o => { o.button.hidden = false;o.button.disabled=false;const span=o.button.querySelector('span');if(span)span.textContent=o.label;else o.button.textContent=o.label; });
    if (restoreFocus) open?.focus({ preventScroll: true });
    inst = api = stage = controls = null; playing = false;
  }
  playBtn.addEventListener('click', () => setPlaying(!playing));
  fig.addEventListener('open-lesson', e => {
    const option = available.find(o => o.id === e.detail?.id);
    if (option) openLive(option, e.detail?.story || null);
  });
  fig.addEventListener('close-lesson', () => closeLive(false));
  fig.addEventListener('open-original', () => {
    const original = available.find(o => o.original);
    if (original) openLive(original);
  });
  window.addEventListener('still:change', (e) => {
    if (!api || !w) return;
    const stillOn = !!(e.detail && e.detail.still);
    if (stillOn && playing) setPlaying(false);
    else if (!stillOn && !params.lesson && state.playbackSupported && !playing) setPlaying(true);
  });
  // pause while off screen (animation, sound, sensors, video), resume the animation when back
  new IntersectionObserver((ents) => {
    for (const e of ents) {
      state.visible = e.isIntersecting;
      if (!api) continue;
      cancelAnimationFrame(raf); last = 0;
      if (state.visible && playing) raf = requestAnimationFrame(frame);
      if (!state.visible) api._hides.forEach((f) => { try { f(); } catch (err) { console.error(err); } });
    }
  }, { threshold: 0.05 }).observe(fig);
}

// Lazy chunks import this module's exports through the page's copy (see build_chunks in build.py):
// every export must be listed here.
window.__liveModule = { Live, colors, draw, rng, gauss, loadChunk };

function init() { document.querySelectorAll('figure[data-live],figure[data-labs]').forEach(setup); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
