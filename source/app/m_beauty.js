// The look of the book, brought to life.
// One idea runs through all of it: everything decorative is made of dots, because everything is made of atoms.
//   - the cover: a faint field of particles in Brownian motion, behind the assembling periodic table
//   - volume pages: a stippled motif per volume (electron cloud; a dynamic equilibrium; a carbon lattice with moving charge)
//   - medallions for the people in the book, stippled like an engraving
//   - a chapter spine in the left margin on wide screens, showing where you are
// Every animation runs only while on screen, and not at all when the reader prefers reduced motion.
import App from './core.js';

const motionOK = () => !App.reduceMotion();

// ------------------------------------------------------------------ helpers
function rng(seed) {             // mulberry32
  let a = 0;
  for (const ch of String(seed)) a = (a * 31 + ch.charCodeAt(0)) >>> 0;
  a = a || 0x9e3779b9;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = r => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

function cssVar(el, name, fallback) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

// size a canvas to its CSS box at device resolution; returns {ctx, w, h} in CSS pixels
function fit(canvas) {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

// run fn(t, dt) every frame while `el` is on screen and motion is allowed; draw once otherwise
function animateWhileVisible(el, setup) {
  let raf = 0, visible = false, last = 0, state = null;
  const start = () => {
    if (!state) state = setup();
    if (!state) return;
    if (!motionOK()) { state.draw(0, 0); return; }
    if (raf) return;
    last = performance.now();
    const tick = now => {
      const dt = Math.min(64, now - last); last = now;
      state.draw(now, dt);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => {
    for (const e of es) { visible = e.isIntersecting; if (visible) start(); }
  }, { rootMargin: '80px' });
  io.observe(el);
  return { redraw() { state = null; if (visible) { cancelAnimationFrame(raf); raf = 0; start(); } } };
}

// ------------------------------------------------------------------ cover: particles in Brownian motion
function cover() {
  const host = document.querySelector('.cover');
  const canvas = host && host.querySelector('canvas.field');
  if (!canvas) return null;
  return animateWhileVisible(host, () => {
    const { ctx, w, h } = fit(canvas);
    const r = rng('cover');
    const n = Math.round(Math.min(900, w * h / 1400));
    const pts = Array.from({ length: n }, () => ({ x: r() * w, y: r() * h, s: .6 + r() * 1.1, a: .10 + r() * .22 }));
    const ink = cssVar(host, '--ink', '#1d332d');
    return {
      draw(t, dt) {
        const k = dt ? Math.sqrt(dt / 16) * .32 : 0;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = ink;
        for (const p of pts) {
          if (k) {
            p.x += gauss(Math.random) * k * (1.6 - p.s * .6);
            p.y += gauss(Math.random) * k * (1.6 - p.s * .6);
            if (p.x < 0) p.x += w; else if (p.x > w) p.x -= w;
            if (p.y < 0) p.y += h; else if (p.y > h) p.y -= h;
          }
          ctx.globalAlpha = p.a;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.2832); ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
    };
  });
}

// ------------------------------------------------------------------ volume motifs
const MOTIFS = {
  // Volume I: an electron cloud. Dots are sampled from where an electron is likely to be found
  // (a dense spherical cloud with two lobes along a tilted axis); a few are re-sampled each frame, so it shimmers.
  cloud(ctx, w, h, col, r) {
    const cx = w * .5, cy = h * .5, R = Math.min(w, h) * .62;
    const ang = -0.5, ax = Math.cos(ang), ay = Math.sin(ang);
    const sample = () => {
      const u = r();
      if (u < .42) {                       // 1s: radius ~ Gamma(3)
        const rr = -Math.log(r() * r() * r() + 1e-9) * R * .085;
        const th = r() * 6.2832;
        return [cx + rr * Math.cos(th), cy + rr * Math.sin(th) * .96];
      }
      const lobe = r() < .5 ? -1 : 1;      // 2p lobes
      const along = (Math.abs(gauss(r)) * .22 + .36) * R * lobe;
      const across = gauss(r) * R * .16 * (1 - Math.min(.6, Math.abs(along) / R * .5));
      return [cx + ax * along - ay * across, cy + ay * along + ax * across];
    };
    const n = Math.round(Math.min(3400, w * h / 70));
    const pts = Array.from({ length: n }, () => { const [x, y] = sample(); return { x, y, a: .35 + r() * .5 }; });
    const proton = col.proton;
    return (t, dt) => {
      if (dt) for (let i = 0; i < n * .025; i++) { const p = pts[(r() * n) | 0]; const [x, y] = sample(); p.x = x; p.y = y; p.a = .1; }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = col.vol;
      for (const p of pts) {
        if (p.a < .8) p.a = Math.min(.8, p.a + (dt ? .02 : 1));
        ctx.globalAlpha = p.a * .8;
        ctx.fillRect(p.x, p.y, 1.35, 1.35);
      }
      ctx.globalAlpha = 1; ctx.fillStyle = proton;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(2.2, R * .012), 0, 6.2832); ctx.fill();
    };
  },

  // Volume II: change, seen up close. Two crowds of particles trade members at equal rates (a dynamic equilibrium):
  // every particle that leaves one side is matched, on average, by one arriving from the other.
  balance(ctx, w, h, col, r) {
    const R = Math.min(w * .22, h * .32);
    const A = { x: w * .3, y: h * .52 }, B = { x: w * .7, y: h * .48 };
    const n = Math.round(Math.min(900, w * h / 260));
    const home = c => { const rr = Math.sqrt(r()) * R, th = r() * 6.2832; return { x: c.x + rr * Math.cos(th), y: c.y + rr * Math.sin(th) }; };
    const pts = Array.from({ length: n }, (_, i) => { const side = i % 2 ? A : B; const p = home(side); return { ...p, side, tx: 0, ty: 0, k: 1, sx: 0, sy: 0, s: .9 + r() * .9 }; });
    return (t, dt) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (dt) {
          if (p.k >= 1 && r() < .0016 * (dt / 16)) {           // start a crossing
            const to = p.side === A ? B : A; const q = home(to);
            p.sx = p.x; p.sy = p.y; p.tx = q.x; p.ty = q.y; p.k = 0; p.side = to;
          }
          if (p.k < 1) {
            p.k = Math.min(1, p.k + dt / 2600);
            const e = p.k < .5 ? 2 * p.k * p.k : 1 - Math.pow(-2 * p.k + 2, 2) / 2;
            const lift = Math.sin(Math.PI * p.k) * h * .16 * (p.side === B ? -1 : 1);
            p.x = p.sx + (p.tx - p.sx) * e; p.y = p.sy + (p.ty - p.sy) * e + lift;
          } else {
            p.x += gauss(r) * .18; p.y += gauss(r) * .18;
          }
        }
        ctx.globalAlpha = p.k < 1 ? .95 : .55;
        ctx.fillStyle = p.k < 1 ? col.vol : col.ink;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.k < 1 ? p.s + .5 : p.s, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
  },

  // Volume III: chemistry at work. A sheet of carbon (graphene) drawn in stipple, with charges hopping along its bonds.
  lattice(ctx, w, h, col, r) {
    const a = Math.max(26, Math.min(w, h) / 9);         // bond length
    const dx = a * Math.sqrt(3), dy = a * 1.5;
    const nodes = [], key = (x, y) => Math.round(x) + ',' + Math.round(y), index = new Map();
    for (let row = -1; row * dy < h + a * 2; row++) {
      for (let c = -1; c * dx < w + dx; c++) {
        const x0 = c * dx + (row % 2 ? dx / 2 : 0), y0 = row * dy;
        for (const [x, y] of [[x0, y0], [x0, y0 + a]]) {
          const k = key(x, y);
          if (!index.has(k)) { index.set(k, nodes.length); nodes.push({ x, y, nb: [] }); }
        }
      }
    }
    const link = (i, j) => { if (!nodes[i].nb.includes(j)) { nodes[i].nb.push(j); nodes[j].nb.push(i); } };
    nodes.forEach((n, i) => {
      for (const [ox, oy] of [[0, a], [dx / 2, -a / 2], [-dx / 2, -a / 2]]) {
        const j = index.get(key(n.x + ox, n.y + oy)); if (j != null) link(i, j);
      }
    });
    // fade the sheet towards the edges so it sits on the page like an engraving
    const fade = (x, y) => { const u = x / w - .5, v = y / h - .5; return Math.max(0, 1 - (u * u * 2.6 + v * v * 3.2)); };
    const dots = [];
    nodes.forEach((n, i) => n.nb.forEach(j => { if (j > i) { const m = nodes[j]; const steps = Math.round(a / 4.2);
      for (let s = 1; s < steps; s++) { const x = n.x + (m.x - n.x) * s / steps + gauss(r) * .45, y = n.y + (m.y - n.y) * s / steps + gauss(r) * .45; dots.push([x, y, fade(x, y)]); } } }));
    const atoms = nodes.map(n => [n.x, n.y, fade(n.x, n.y)]);
    const live = nodes.map((n, i) => i).filter(i => fade(nodes[i].x, nodes[i].y) > .35);
    const sparks = Array.from({ length: Math.min(9, Math.max(4, live.length / 18 | 0)) }, () => {
      const i = live[(r() * live.length) | 0]; return { i, j: nodes[i].nb[0] ?? i, k: r(), trail: [] };
    });
    return (t, dt) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = col.ink;
      for (const [x, y, f] of dots) { if (f <= 0) continue; ctx.globalAlpha = f * .34; ctx.fillRect(x, y, 1.1, 1.1); }
      for (const [x, y, f] of atoms) { if (f <= 0) continue; ctx.globalAlpha = f * .5; ctx.beginPath(); ctx.arc(x, y, 2.1, 0, 6.2832); ctx.fill(); }
      for (const s of sparks) {
        if (dt) {
          s.k += dt / 900;
          if (s.k >= 1) { s.k = 0; const nb = nodes[s.j].nb.filter(q => q !== s.i && fade(nodes[q].x, nodes[q].y) > .15); s.i = s.j; s.j = nb.length ? nb[(r() * nb.length) | 0] : s.i; }
        }
        const p = nodes[s.i], q = nodes[s.j];
        const x = p.x + (q.x - p.x) * s.k, y = p.y + (q.y - p.y) * s.k;
        s.trail.push([x, y]); if (s.trail.length > 26) s.trail.shift();
        ctx.fillStyle = col.vol;
        s.trail.forEach(([tx, ty], idx) => { ctx.globalAlpha = (idx / s.trail.length) * .5; ctx.beginPath(); ctx.arc(tx, ty, 1.6, 0, 6.2832); ctx.fill(); });
        ctx.globalAlpha = .95; ctx.beginPath(); ctx.arc(x, y, 3, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
  },
};

function volumes() {
  return [...document.querySelectorAll('.vol-art[data-motif]')].map(box => {
    const canvas = box.querySelector('canvas');
    const make = MOTIFS[box.dataset.motif];
    if (!canvas || !make) return null;
    return animateWhileVisible(box, () => {
      const { ctx, w, h } = fit(canvas);
      const sec = box.closest('.volume') || box;
      const col = { vol: cssVar(sec, '--vol', '#356d83'), ink: cssVar(sec, '--ink', '#1d332d'), proton: cssVar(sec, '--proton', '#a94730') };
      const draw = make(ctx, w, h, col, rng(box.dataset.motif));
      return { draw };
    });
  }).filter(Boolean);
}

// ------------------------------------------------------------------ medallions (people)
function medal(el) {
  const canvas = el.querySelector('canvas');
  if (!canvas) return;
  const { ctx, w, h } = fit(canvas);
  if (w < 4) return;
  const r = rng(el.dataset.seed || 'x');
  const host = el.closest('[data-vol], .story, .cast-page') || el;
  const col = cssVar(el, '--vol', cssVar(host, '--vol', '#356d83'));
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 1;
  // light falls from the upper left, as on an engraved coin: denser dots on the shadow side
  const lx = -0.55, ly = -0.65;
  const n = Math.round(R * R * 1.35);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const rr = Math.sqrt(r()) * R, th = r() * 6.2832;
    const x = Math.cos(th) * rr, y = Math.sin(th) * rr;
    const shade = .5 - (x * lx + y * ly) / R * .42 + (rr / R) * .18;   // 0..1
    if (r() > shade * 1.05) continue;
    ctx.globalAlpha = .38 + shade * .55;
    ctx.beginPath(); ctx.arc(cx + x, cy + y, .62 + shade * .32, 0, 6.2832); ctx.fill();
  }
  ctx.globalAlpha = 1;
  el.classList.add('drawn');
}

function medals() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { medal(e.target); io.unobserve(e.target); } }), { rootMargin: '200px' });
  document.querySelectorAll('.medal[data-seed]').forEach(m => io.observe(m));
  App.on('story:open', d => { const m = d && d.el && d.el.querySelector('.medal'); if (m) requestAnimationFrame(() => medal(m)); });
  return { redraw() { document.querySelectorAll('.medal.drawn').forEach(medal); } };
}

// ------------------------------------------------------------------ chapter spine
function spine() {
  const chapters = [...document.querySelectorAll('article.chapter')];
  if (!chapters.length) return;
  const nav = App.el('nav', { class: 'spine', 'aria-label': 'Sections of this chapter', hidden: true });
  document.body.append(nav);
  let current = null, curSec = null;
  const build = ch => {
    const n = ch.querySelector('.opener .cl')?.textContent || '';
    const title = ch.querySelector('.opener h2')?.textContent || '';
    const items = [...ch.querySelectorAll('section.sec[id]')].map(s => {
      const num = s.querySelector('h3 .n')?.textContent || '';
      const h = s.querySelector('h3')?.cloneNode(true); h?.querySelector('.n')?.remove();
      return App.el('li', {}, App.el('a', { href: '#' + s.id, 'data-sec': s.id },
        App.el('span', { class: 'sp-n' }, num), App.el('span', { class: 'sp-t' }, (h?.textContent || '').trim())));
    });
    nav.replaceChildren(
      App.el('a', { class: 'sp-ch', href: '#' + ch.id }, App.el('span', { class: 'sp-k' }, n), App.el('span', { class: 'sp-h' }, title)),
      App.el('ol', {}, items));
  };
  const setSec = id => {
    if (id === curSec) return; curSec = id;
    nav.querySelectorAll('a[data-sec]').forEach(a => { if (a.dataset.sec === id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  };
  // which chapter is on screen
  const chIO = new IntersectionObserver(es => {
    for (const e of es) {
      if (e.isIntersecting && e.target !== current) { current = e.target; build(current); curSec = null; }
      if (!e.isIntersecting && e.target === current) { current = null; }
    }
    nav.hidden = !current;
  }, { rootMargin: '-45% 0px -50% 0px' });
  chapters.forEach(c => chIO.observe(c));
  // which section: the last one whose top has passed 40% of the screen
  const secIO = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) setSec(e.target.id);
  }, { rootMargin: '-38% 0px -60% 0px' });
  document.querySelectorAll('article.chapter section.sec[id]').forEach(s => secIO.observe(s));
  // hide the spine while the opener itself is on screen: it repeats the chapter's own contents list
  const opIO = new IntersectionObserver(es => es.forEach(e => nav.classList.toggle('quiet', e.isIntersecting && e.target.closest('article') === current)), { threshold: .25 });
  document.querySelectorAll('article.chapter .opener').forEach(o => opIO.observe(o));
}

// ------------------------------------------------------------------ boot
App.ready(() => {
  const parts = [cover(), ...volumes(), medals()].filter(Boolean);
  spine();
  // redraw the art when the colours change (theme switch) or the window is resized
  let rt = 0;
  const redraw = () => { clearTimeout(rt); rt = setTimeout(() => parts.forEach(p => p.redraw && p.redraw()), 150); };
  window.addEventListener('resize', redraw);
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw); } catch (e) {}
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });
});
