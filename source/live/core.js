// Live figures: the runtime that turns a still SVG figure into an animated or 3D one on request.
// Every live figure keeps its still drawing: it is what prints, what shows without JavaScript,
// and what a reader sees until they choose to play. Widgets register with Live.register().

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

// ------------------------------------------------------------------ the per-figure API
function makeApi(fig, stage, controls) {
  const loops = new Set();
  const cleanups = [];
  const api = {
    reduced: reducedQuery.matches,
    colors,
    draw, rng, gauss, EL,
    /** A canvas that fills the stage at a fixed logical size (W x H); drawing uses logical units. */
    canvas(W, H, label) {
      const cv = document.createElement('canvas');
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', label || fig.querySelector('svg')?.getAttribute('aria-label') || 'Animated figure');
      cv.style.width = '100%'; cv.style.height = 'auto'; cv.style.aspectRatio = `${W} / ${H}`; cv.style.display = 'block';
      stage.appendChild(cv);
      const ctx = cv.getContext('2d');
      const fit = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const cssW = cv.clientWidth || W;
        const s = cssW / W;
        cv.width = Math.round(W * s * dpr); cv.height = Math.round(H * s * dpr);
        ctx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
        for (const fn of loops) fn(0, 0); // resizing clears a canvas: redraw the current frame
      };
      fit();
      const ro = new ResizeObserver(fit); ro.observe(cv); cleanups.push(() => ro.disconnect());
      return { cv, ctx, W, H, clear(col) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.restore(); if (col) { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); } } };
    },
    /** Register a per-frame function fn(dt seconds, t seconds). Runs only while the figure plays. */
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
    _loops: loops, _cleanups: cleanups,
  };
  return api;
}

// ------------------------------------------------------------------ wiring figures
function setup(fig) {
  const name = fig.dataset.live;
  const w = widgets[name];
  if (!w) return;
  let params = {};
  try { params = JSON.parse(fig.dataset.liveParams || '{}'); } catch (e) { /* keep defaults */ }
  const svg = fig.querySelector('svg.fig');
  const is3d = !!w.meta.three;
  const open = document.createElement('button');
  open.type = 'button'; open.className = 'live-open';
  open.innerHTML = (is3d
    ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5 L17 6.3 V13.7 L10 17.5 L3 13.7 V6.3 Z M3 6.3 L10 10 L17 6.3 M10 10 V17.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 4.2 L15.5 10 L6.5 15.8 Z" fill="currentColor"/></svg>')
    + `<span>${w.meta.label || (is3d ? 'Turn it in 3D' : 'Watch it move')}</span>`;
  fig.insertBefore(open, fig.querySelector('figcaption'));

  let inst = null, api = null, stage = null, controls = null, playing = false, raf = 0, last = 0, t = 0, visible = true;
  const playBtn = document.createElement('button');
  playBtn.type = 'button'; playBtn.className = 'live-ctl live-play';

  function frame(ts) {
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts; t += dt;
    for (const fn of api._loops) fn(dt, t);
    raf = requestAnimationFrame(frame);
  }
  function setPlaying(p) {
    playing = p;
    playBtn.textContent = p ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-pressed', String(p));
    cancelAnimationFrame(raf); last = 0;
    if (p && visible) raf = requestAnimationFrame(frame);
    else if (api) for (const fn of api._loops) fn(0, t); // draw one still frame
  }
  function openLive() {
    fig.classList.add('live-on');
    stage = document.createElement('div'); stage.className = 'live-stage';
    controls = document.createElement('div'); controls.className = 'live-controls';
    fig.insertBefore(stage, open); fig.insertBefore(controls, open);
    api = makeApi(fig, stage, controls);
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
    api?._cleanups.forEach((f) => f());
    stage?.remove(); controls?.remove();
    fig.classList.remove('live-on'); open.hidden = false; open.focus({ preventScroll: true });
    inst = api = stage = controls = null; playing = false;
  }
  playBtn.addEventListener('click', () => setPlaying(!playing));
  open.addEventListener('click', openLive);
  // pause while off screen, resume when back
  new IntersectionObserver((ents) => {
    for (const e of ents) {
      visible = e.isIntersecting;
      if (!api) continue;
      cancelAnimationFrame(raf); last = 0;
      if (visible && playing) raf = requestAnimationFrame(frame);
    }
  }, { threshold: 0.05 }).observe(fig);
}

function init() { document.querySelectorAll('figure[data-live]').forEach(setup); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
