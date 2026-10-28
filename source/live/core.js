// Live figures: the runtime that turns a still SVG figure into an animated or 3D one on request.
// Every live figure keeps its still drawing: it is what prints, what shows without JavaScript,
// and what a reader sees until they choose to play. Widgets register with Live.register().
// In the single-file build every widget is bundled with this runtime; in the --site build each widget is a
// lazy ES-module chunk (window.BOOK_CHUNKS maps "w_<name>" to its file) imported when the reader taps its button.

const EL = {
  H: '#f3f1e8', C: '#3d4a46', N: '#4f74b3', O: '#c4553c', Na: '#8a6bb5', Cl: '#5c9a52', Mg: '#c7a24a',
  Al: '#a7b3b8', S: '#d9b93b', Fe: '#b06a3b', Cu: '#c27a45', Zn: '#8fa2ad', Ag: '#c9cdd0', Li: '#b98bc9',
  Ne: '#e0897a', He: '#e6c87a', K: '#a67ccf', Ca: '#9fb5a0', X: '#b8b2a2', A: '#c97b5a', B: '#5a8fae',
};
const DARK_TEXT = new Set(['C', 'Na', 'N', 'O', 'Cl', 'Fe', 'Cu', 'K', 'A', 'B', 'Li']);
const reducedQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

const widgets = {};
export const Live = {
  EL, DARK_TEXT,
  /** register(name, factory, {label}) — factory(stage, params, api) returns {start(), stop(), destroy()} */
  register(name, factory, meta = {}) { widgets[name] = { factory, meta }; },
};
window.Live = Live;

function cssVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim() || '#888';
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
        o.stop(t0 + dur + 0.02);
      }
      o.connect(g); g.connect(master); o.start(t0);
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
function makeApi(fig, stage, controls, state) {
  const loops = new Set();
  const cleanups = [];
  const hides = new Set();     // run when the figure scrolls off screen
  let audio = null;
  const note = (text, cls = '') => {
    const p = document.createElement('p'); p.className = 'live-note ' + cls; p.setAttribute('aria-live', 'polite');
    p.textContent = text; controls.appendChild(p); return p;
  };
  const sizeCanvas = (cv, W, H) => {
    cv.style.width = '100%'; cv.style.height = 'auto'; cv.style.aspectRatio = `${W} / ${H}`; cv.style.display = 'block';
  };
  const api = {
    reduced: reducedQuery.matches,
    colors,
    draw, rng, gauss, EL,
    /** true while the figure is on screen */
    get visible() { return state.visible; },
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
    button(label, onClick, opts = {}) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'live-ctl'; b.textContent = label;
      if (opts.pressed != null) b.setAttribute('aria-pressed', String(!!opts.pressed));
      b.addEventListener('click', () => onClick(b));
      controls.appendChild(b); return b;
    },
    tabs(labels, onSelect, start = 0) {
      const wrap = document.createElement('div'); wrap.className = 'live-tabs'; wrap.setAttribute('role', 'group');
      const btns = labels.map((l, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'live-ctl'; b.textContent = l;
        b.setAttribute('aria-pressed', String(i === start));
        b.addEventListener('click', () => { btns.forEach((x, j) => x.setAttribute('aria-pressed', String(j === i))); onSelect(i); });
        wrap.appendChild(b); return b;
      });
      controls.appendChild(wrap); return btns;
    },
    slider(label, { min, max, step = 1, value, fmt = (v) => String(v), onInput }) {
      const id = 'ls' + Math.random().toString(36).slice(2, 8);
      const wrap = document.createElement('div'); wrap.className = 'live-slider';
      const lab = document.createElement('label'); lab.htmlFor = id; lab.textContent = label;
      const inp = document.createElement('input'); inp.type = 'range'; inp.id = id; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
      const out = document.createElement('output'); out.htmlFor = id; out.textContent = fmt(+value);
      inp.addEventListener('input', () => { out.textContent = fmt(+inp.value); onInput(+inp.value); });
      wrap.append(lab, inp, out); controls.appendChild(wrap);
      return { input: inp, set(v) { inp.value = v; out.textContent = fmt(+v); } };
    },
    /** A live text readout under the figure, announced politely to screen readers. */
    readout() {
      const r = document.createElement('p'); r.className = 'live-readout'; r.setAttribute('aria-live', 'polite');
      controls.appendChild(r);
      let last = '';
      return (html) => { if (html !== last) { r.innerHTML = html; last = html; } };
    },
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
        Returns {ok, canvas, set(name, value), draw()}. Without WebGL: opts.fallback(ctx2d, W, H, uniforms, t) draws on a
        2D canvas instead, or, with no fallback, the still drawing stays with a short note. Runs in api.loop, so it plays,
        pauses and respects reduced motion like any widget. */
    gl(fragment, uniforms = {}, { width = 640, height = 360, label, fallback } = {}) {
      const U = { ...uniforms };
      const cv = document.createElement('canvas');
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', label || fig.querySelector('svg')?.getAttribute('aria-label') || 'Animated figure');
      sizeCanvas(cv, width, height);
      let g = null;
      try { g = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false }) || cv.getContext('experimental-webgl'); } catch (e) { g = null; }
      if (!g) {
        if (fallback) {
          const k = api.canvas(width, height, label);
          api.loop((dt, t) => fallback(k.ctx, width, height, U, t));
          return { ok: false, canvas: k.cv, set(n, val) { U[n] = val; fallback(k.ctx, width, height, U, state.t); }, draw() { fallback(k.ctx, width, height, U, state.t); } };
        }
        const svg = fig.querySelector('svg.fig');
        if (svg) stage.appendChild(svg.cloneNode(true));
        note('This view needs WebGL, which this browser does not offer. The drawing shows the same idea.', 'live-warn');
        return { ok: false, canvas: null, set() {}, draw() {} };
      }
      stage.appendChild(cv);
      const compile = (type, src) => {
        const sh = g.createShader(type); g.shaderSource(sh, src); g.compileShader(sh);
        if (!g.getShaderParameter(sh, g.COMPILE_STATUS)) throw new Error('api.gl shader: ' + g.getShaderInfoLog(sh));
        return sh;
      };
      const prog = g.createProgram();
      g.attachShader(prog, compile(g.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
      g.attachShader(prog, compile(g.FRAGMENT_SHADER, 'precision highp float;\nuniform vec2 u_res;\nuniform float u_time;\n' + fragment));
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error('api.gl link: ' + g.getProgramInfoLog(prog));
      g.useProgram(prog);
      const buf = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, buf);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);   // one triangle covers the canvas
      const loc = g.getAttribLocation(prog, 'p'); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
      const locs = {};
      const uni = (n) => (n in locs ? locs[n] : (locs[n] = g.getUniformLocation(prog, n)));
      let t = 0;
      const drawNow = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.round((cv.clientWidth || width) * dpr)), h = Math.max(1, Math.round((cv.clientHeight || height) * dpr));
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        g.viewport(0, 0, w, h);
        g.uniform2f(uni('u_res'), w, h); g.uniform1f(uni('u_time'), t);
        for (const [n, val] of Object.entries(U)) {
          const l = uni(n); if (!l) continue;
          if (typeof val === 'number') g.uniform1f(l, val);
          else if (val.length === 2) g.uniform2fv(l, val); else if (val.length === 3) g.uniform3fv(l, val); else if (val.length === 4) g.uniform4fv(l, val);
        }
        g.drawArrays(g.TRIANGLES, 0, 3);
      };
      api.loop((dt, tt) => { t = tt; drawNow(); });
      const ro = new ResizeObserver(drawNow); ro.observe(cv);
      cleanups.push(() => { ro.disconnect(); const ext = g.getExtension('WEBGL_lose_context'); ext && ext.loseContext(); });
      return { ok: true, canvas: cv, set(n, val) { U[n] = val; drawNow(); }, draw: drawNow };
    },
    _loops: loops, _cleanups: cleanups, _hides: hides,
  };
  return api;
}

// ------------------------------------------------------------------ wiring figures
const chunkURL = (key) => {
  const m = window.BOOK_CHUNKS || {};
  return m[key] ? new URL(m[key], document.baseURI).href : null;
};
/** Load a lazy chunk by name (site build); resolves once its module has run. */
export function loadChunk(key) {
  const url = chunkURL(key);
  if (!url) return Promise.reject(new Error(`no chunk ${key}`));
  return import(/* @vite-ignore */ url);
}

const ICON_3D = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5 L17 6.3 V13.7 L10 17.5 L3 13.7 V6.3 Z M3 6.3 L10 10 L17 6.3 M10 10 V17.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 4.2 L15.5 10 L6.5 15.8 Z" fill="currentColor"/></svg>';

function setup(fig) {
  const name = fig.dataset.live;
  if (!widgets[name] && !chunkURL('w_' + name)) return;     // nothing to load: the still drawing stays
  // until the widget's code arrives, the build's copy of its meta decides the button
  const pre = widgets[name] ? widgets[name].meta
    : { label: fig.dataset.liveLabel || '', three: fig.dataset.live3d === '1', static: fig.dataset.liveStatic === '1' };
  let params = {};
  try { params = JSON.parse(fig.dataset.liveParams || '{}'); } catch (e) { /* keep defaults */ }
  const open = document.createElement('button');
  open.type = 'button'; open.className = 'live-open';
  const openLabel = pre.label || (pre.three ? 'Turn it in 3D' : 'Watch it move');
  open.innerHTML = (pre.three ? ICON_3D : ICON_PLAY) + `<span>${openLabel}</span>`;
  fig.insertBefore(open, fig.querySelector('figcaption'));

  let w = null, inst = null, api = null, stage = null, controls = null, playing = false, raf = 0, last = 0;
  const state = { visible: true, t: 0 };
  const playBtn = document.createElement('button');
  playBtn.type = 'button'; playBtn.className = 'live-ctl live-play';

  function frame(ts) {
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts; state.t += dt;
    for (const fn of api._loops) fn(dt, state.t);
    raf = requestAnimationFrame(frame);
  }
  function setPlaying(p) {
    playing = p;
    playBtn.textContent = p ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-pressed', String(p));
    cancelAnimationFrame(raf); last = 0;
    if (p && state.visible) raf = requestAnimationFrame(frame);
    else if (api) for (const fn of api._loops) fn(0, state.t); // draw one still frame
  }
  async function openLive() {
    if (!widgets[name]) {
      open.disabled = true; open.querySelector('span').textContent = 'Loading…';
      try { await loadChunk('w_' + name); } catch (e) { /* reported below */ }
      open.disabled = false; open.querySelector('span').textContent = openLabel;
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
    stage = document.createElement('div'); stage.className = 'live-stage';
    controls = document.createElement('div'); controls.className = 'live-controls';
    fig.insertBefore(stage, open); fig.insertBefore(controls, open);
    state.t = 0;
    api = makeApi(fig, stage, controls, state);
    if (!w.meta.static) controls.appendChild(playBtn);
    inst = w.factory(stage, params, api) || {};
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'live-ctl live-close'; close.textContent = 'Back to the drawing';
    close.addEventListener('click', closeLive);
    controls.appendChild(close);
    open.hidden = true;
    setPlaying(!api.reduced && !w.meta.static);
    if (w.meta.static) for (const fn of api._loops) fn(0, 0);
    (stage.querySelector('canvas,button,input') || playBtn).focus?.({ preventScroll: true });
  }
  function closeLive() {
    cancelAnimationFrame(raf);
    inst?.destroy?.();
    api?._cleanups.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    stage?.remove(); controls?.remove();
    fig.classList.remove('live-on'); open.hidden = false; open.focus({ preventScroll: true });
    inst = api = stage = controls = null; playing = false;
  }
  playBtn.addEventListener('click', () => setPlaying(!playing));
  open.addEventListener('click', openLive);
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

function init() { document.querySelectorAll('figure[data-live]').forEach(setup); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
