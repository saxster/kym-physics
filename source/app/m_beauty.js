// The look of the book, brought to life.
// One idea runs through all of it: everything decorative is made of dots, like an engraving.
//   - the cover: a faint field of particles in Brownian motion
//   - volume pages: a stippled motif per volume (MOTIFS below; build.py MOTIFS picks one per volume:
//     I cloud, II balance, III lattice, IV field: the field lines of a magnet, with stationary direction marks)
//   - medallions for the people in the book, stippled like an engraving
//   - a chapter spine in the left margin on wide screens, showing where you are
// Every animation runs only while on screen, and not at all when the reader prefers reduced motion.
import App from './core.js';
import { eccentricAnomaly } from './orbit_model.mjs';

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
    if (!motionOK()) { cancelAnimationFrame(raf); raf = 0; state.draw(0, 0); return; }
    if (raf) return;
    last = performance.now();
    const tick = now => {
      if (!motionOK()) { raf = 0; state.draw(now, 0); return; }
      // A newly scheduled RAF can share an earlier frame timestamp than performance.now().
      const dt = Math.max(0, Math.min(64, now - last)); last = now;
      state.draw(now, dt);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => {
    for (const e of es) { visible = e.isIntersecting; if (visible) start(); else { cancelAnimationFrame(raf); raf = 0; } }
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
  // Volume I (Motion and force): Galileo's parabolic trajectories. Four projectile arcs launched from the left at
  // 28°, 45°, 62° and 74°, drawn in stipple with vertical drop lines at equal horizontal intervals, while bright
  // stones trace the parabolas with steady horizontal speed and uniformly accelerating vertical speed.
  cloud(ctx, w, h, col, r) {
    const x0 = w * .10, y0 = h * .84, span = w * .80, g = 1.0;
    const v0 = Math.sqrt(span * g);                   // 45° lands at x0 + span
    const angles = [28, 45, 62, 74].map(d => d * Math.PI / 180);
    const fade = (x, y) => {
      const u = (x - w * .5) / (w * .5), v = (y - h * .5) / (h * .5);
      return Math.max(0, 1 - (u * u * .85 + v * v * 1.05));
    };
    const arcs = angles.map(th => {
      const vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
      const tFlight = (2 * vy) / g;
      const pts = [];
      for (let i = 0; i <= 180; i++) {
        const t = (i / 180) * tFlight;
        const x = x0 + vx * t;
        const y = y0 - (vy * t - 0.5 * g * t * t) * (h / span) * 1.35;
        pts.push([x, y]);
      }
      return { pts, vx, vy, tFlight };
    });
    const dots = [];
    // Stippled ground baseline and equal horizontal stroboscopic columns
    for (let x = w * .06; x < w * .94; x += 2.2) {
      dots.push([x + gauss(r) * .4, y0 + gauss(r) * .6, fade(x, y0) * .65]);
    }
    arcs.forEach(a => {
      a.pts.forEach(([x, y]) => {
        for (let k = 0; k < 2; k++) {
          dots.push([x + gauss(r) * .9, y + gauss(r) * .9, fade(x, y)]);
        }
      });
      // Vertical drop guides on the 45° arc showing equal Δx steps
      if (Math.abs(a.vx - a.vy) < 1e-2) {
        for (let step = 1; step <= 7; step++) {
          const idx = Math.round((step / 8) * (a.pts.length - 1));
          const [gx, gy] = a.pts[idx];
          for (let y = gy; y < y0; y += 4.5) {
            dots.push([gx + gauss(r) * .35, y + gauss(r) * .35, fade(gx, y) * .5]);
          }
        }
      }
    });
    const flyers = arcs.map((a, i) => ({ arc: a, k: (i * .27) % 1, trail: [] }));
    return (t, dt) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = col.ink;
      for (const [x, y, f] of dots) {
        if (f <= 0) continue;
        ctx.globalAlpha = f * .36;
        ctx.fillRect(x, y, 1.2, 1.2);
      }
      // Launch origin dot
      ctx.globalAlpha = .75;
      ctx.fillStyle = col.proton;
      ctx.beginPath(); ctx.arc(x0, y0, 3.2, 0, 6.2832); ctx.fill();
      ctx.fillStyle = col.vol;
      for (const fl of flyers) {
        if (dt) {
          fl.k += dt / 4200;
          if (fl.k >= 1) { fl.k -= 1; fl.trail.length = 0; }
        }
        const idx = Math.min(fl.arc.pts.length - 1, Math.floor(fl.k * (fl.arc.pts.length - 1)));
        const p = fl.arc.pts[idx];
        fl.trail.push(p);
        if (fl.trail.length > 24) fl.trail.shift();
        fl.trail.forEach(([tx, ty], i) => {
          ctx.globalAlpha = (i / fl.trail.length) * .45 * fade(tx, ty);
          ctx.beginPath(); ctx.arc(tx, ty, 1.6, 0, 6.2832); ctx.fill();
        });
        ctx.globalAlpha = .92 * fade(p[0], p[1]);
        ctx.beginPath(); ctx.arc(p[0], p[1], 3.1, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
  },

  // Volume II (Gravity, pressure and energy): Keplerian elliptical orbits around a central star at one focus, with
  // equal-area radial spokes drawn in stipple and planets sweeping faster near perihelion and slower near aphelion.
  balance(ctx, w, h, col, r) {
    const cx = w * .52, cy = h * .50;
    const S = Math.min(w * .44, h * .44);
    const fade = (x, y) => {
      const u = (x - w * .5) / (w * .5), v = (y - h * .5) / (h * .5);
      return Math.max(0, 1 - (u * u * .85 + v * v * .95));
    };
    const orbits = [
      { a: S * .42, e: 0.20, rot: -0.18, period: 3600, phase: 0.1 },
      { a: S * .72, e: 0.32, rot:  0.12, period: 3600 * (.72 / .42) ** 1.5, phase: 0.55 },
      { a: S * 1.02, e: 0.24, rot: -0.08, period: 3600 * (1.02 / .42) ** 1.5, phase: 0.82 },
    ];
    // Central Sun sits at the focus of the middle ellipse
    const focusShift = orbits[1].a * orbits[1].e;
    const fx = cx - focusShift * Math.cos(orbits[1].rot);
    const fy = cy - focusShift * Math.sin(orbits[1].rot);
    const posOn = (orb, th) => {
      const b = orb.a * Math.sqrt(1 - orb.e * orb.e);
      const ex = orb.a * Math.cos(th) - orb.a * orb.e;
      const ey = b * Math.sin(th);
      const c = Math.cos(orb.rot), s = Math.sin(orb.rot);
      return [fx + ex * c - ey * s, fy + ex * s + ey * c];
    };
    const dots = [];
    // Stippled Sun disc at the focus
    for (let i = 0; i < 240; i++) {
      const rr = Math.sqrt(r()) * 9.5, th = r() * 6.2832;
      dots.push([fx + rr * Math.cos(th), fy + rr * Math.sin(th), 0.9]);
    }
    // Stippled elliptical tracks + Kepler equal-area spokes on the middle orbit
    orbits.forEach((orb, idx) => {
      for (let i = 0; i < 260; i++) {
        const th = (i / 260) * 6.2832;
        const [x, y] = posOn(orb, th);
        dots.push([x + gauss(r) * .6, y + gauss(r) * .6, fade(x, y)]);
      }
      if (idx === 1) {
        for (const M of [-0.35, 0.35, Math.PI - 0.35, Math.PI + 0.35]) {
          const th = eccentricAnomaly(M, orb.e);
          const [ox, oy] = posOn(orb, th);
          for (let s = 0.08; s < 1; s += 0.03) {
            const sx = fx + (ox - fx) * s, sy = fy + (oy - fy) * s;
            dots.push([sx + gauss(r) * .35, sy + gauss(r) * .35, fade(sx, sy) * .55]);
          }
        }
      }
    });
    const bodies = orbits.map(orb => ({ orb, mean: orb.phase * 6.2832, moonTh: r() * 6.2832, trail: [] }));
    return (t, dt) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = col.ink;
      for (const [x, y, f] of dots) {
        if (f <= 0) continue;
        ctx.globalAlpha = f * .36;
        ctx.fillRect(x, y, 1.15, 1.15);
      }
      ctx.globalAlpha = .85;
      ctx.fillStyle = col.proton;
      ctx.beginPath(); ctx.arc(fx, fy, 4.2, 0, 6.2832); ctx.fill();
      ctx.fillStyle = col.vol;
      bodies.forEach((b, idx) => {
        if (dt) {
          b.mean = (b.mean + 2 * Math.PI * dt / b.orb.period) % (2 * Math.PI);
          b.moonTh = (b.moonTh + dt / 480) % (2 * Math.PI);
        }
        const [nx, ny] = posOn(b.orb, eccentricAnomaly(b.mean, b.orb.e));
        b.trail.push([nx, ny]);
        if (b.trail.length > 26) b.trail.shift();
        b.trail.forEach(([tx, ty], i) => {
          ctx.globalAlpha = (i / b.trail.length) * .45 * fade(tx, ty);
          ctx.beginPath(); ctx.arc(tx, ty, 1.5, 0, 6.2832); ctx.fill();
        });
        ctx.globalAlpha = .92 * fade(nx, ny);
        ctx.beginPath(); ctx.arc(nx, ny, idx === 1 ? 3.3 : 2.6, 0, 6.2832); ctx.fill();
        if (idx === 1) {
          const mx = nx + 11 * Math.cos(b.moonTh), my = ny + 11 * Math.sin(b.moonTh);
          ctx.globalAlpha = .75 * fade(mx, my);
          ctx.beginPath(); ctx.arc(mx, my, 1.6, 0, 6.2832); ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    };
  },

  // Volume III (Waves, sound and light): Two coherent wave sources sending circular ripples across a pond, with
  // stippled interference fringes and expanding wavefront rings.
  lattice(ctx, w, h, col, r) {
    const sep = Math.min(w, h) * .28;
    const S1 = { x: w * .5 - sep * .5, y: h * .52 };
    const S2 = { x: w * .5 + sep * .5, y: h * .52 };
    const wl = Math.max(24, Math.min(w, h) * .13);
    const maxR = Math.hypot(w, h) * .52;
    const fade = (x, y) => {
      const u = (x - w * .5) / (w * .5), v = (y - h * .5) / (h * .5);
      return Math.max(0, 1 - (u * u * .95 + v * v * 1.1));
    };
    // Static background stipple sampled along constructive interference crests
    const n = Math.round(Math.min(2800, w * h / 85));
    const bg = [];
    for (let i = 0; i < n * 2 && bg.length < n; i++) {
      const x = r() * w, y = r() * h;
      const d1 = Math.hypot(x - S1.x, y - S1.y);
      const d2 = Math.hypot(x - S2.x, y - S2.y);
      const amp = 0.5 * (Math.cos(6.2832 * d1 / wl) + Math.cos(6.2832 * d2 / wl));
      if (r() < amp * amp * .85) {
        bg.push([x, y, fade(x, y) * (.25 + .55 * Math.abs(amp))]);
      }
    }
    let phase = 0;
    return (t, dt) => {
      if (dt) phase = (phase + dt / 1800) % 1;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = col.ink;
      for (const [x, y, f] of bg) {
        if (f <= 0) continue;
        ctx.globalAlpha = f * .42;
        ctx.fillRect(x, y, 1.15, 1.15);
      }
      // Expanding stippled wavefront circles from S1 and S2
      ctx.fillStyle = col.vol;
      for (const src of [S1, S2]) {
        for (let k = 0; k < 7; k++) {
          const rad = (k + phase) * wl;
          if (rad > maxR) continue;
          const steps = Math.max(24, Math.round(rad * 1.1));
          const ringFade = Math.max(0, 1 - rad / maxR);
          for (let s = 0; s < steps; s++) {
            const th = (s / steps) * 6.2832;
            const x = src.x + rad * Math.cos(th), y = src.y + rad * Math.sin(th);
            const f = fade(x, y) * ringFade;
            if (f <= 0.04) continue;
            ctx.globalAlpha = f * .62;
            ctx.fillRect(x, y, 1.35, 1.35);
          }
        }
        ctx.globalAlpha = .9;
        ctx.fillStyle = col.proton;
        ctx.beginPath(); ctx.arc(src.x, src.y, 3.2, 0, 6.2832); ctx.fill();
        ctx.fillStyle = col.vol;
      }
      ctx.globalAlpha = 1;
    };
  },

  // Volume IV: electricity and magnetism. The field lines of a magnet (a dipole), drawn in stipple: each line
  // follows r = L·sin²θ, the shape iron filings make around a bar magnet. Fixed chevrons show direction; the lines are not tracks for charges.
  field(ctx, w, h, col, r) {
    const cx = w * .5, cy = h * .5, S = Math.min(w * .46, h * 1.15);   // magnet upright, loops spread sideways
    const Ls = [.12, .19, .28, .4, .55, .74, 1.0];
    const fade = (x, y) => { const u = (x - cx) / (w * .5), v = (y - cy) / (h * .5); return Math.max(0, 1 - (u * u * .9 + v * v * 1.1)); };
    const lines = [];
    for (const L of Ls) for (const side of [1, -1]) {
      const pts = [];
      for (let th = .06; th < Math.PI - .06; th += .012) {
        const rr = L * S * Math.sin(th) ** 2;
        pts.push([cx + side * rr * Math.sin(th), cy - rr * Math.cos(th)]);
      }
      lines.push(pts);
    }
    const dots = [];
    lines.forEach(pts => pts.forEach(([x, y], i) => { if (i % 2 === 0) dots.push([x + gauss(r) * .5, y + gauss(r) * .5, fade(x, y)]); }));
    const mag = [];                                    // the magnet itself: a small stippled bar
    for (let i = 0; i < 260; i++) mag.push([cx + (r() - .5) * S * .05, cy + (r() - .5) * S * .2]);
    const directions = lines.map(pts => { const mid = Math.floor(pts.length / 2); return [pts[mid - 2], pts[mid + 2]]; });
    return (t, dt) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = col.ink;
      for (const [x, y, f] of dots) { if (f <= 0) continue; ctx.globalAlpha = f * .38; ctx.fillRect(x, y, 1.15, 1.15); }
      ctx.globalAlpha = .55; for (const [x, y] of mag) ctx.fillRect(x, y, 1.2, 1.2);
      ctx.fillStyle = col.vol;
      ctx.strokeStyle = col.vol;
      ctx.lineWidth = 1.4;
      for (const [[x1, y1], [x2, y2]] of directions) {
        const angle = Math.atan2(y2-y1, x2-x1);
        const x = (x1+x2)/2, y = (y1+y2)/2;
        ctx.globalAlpha = .85 * fade(x, y);
        ctx.beginPath();
        ctx.moveTo(x-5*Math.cos(angle-.55), y-5*Math.sin(angle-.55));
        ctx.lineTo(x, y);
        ctx.lineTo(x-5*Math.cos(angle+.55), y-5*Math.sin(angle+.55));
        ctx.stroke();
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
  // redraw the art when the colours change (theme switch), Still mode toggles, or the window is resized
  let rt = 0;
  const redraw = () => { clearTimeout(rt); rt = setTimeout(() => parts.forEach(p => p.redraw && p.redraw()), 150); };
  window.addEventListener('resize', redraw);
  App.on('still:change', () => parts.forEach(p => p.redraw && p.redraw()));
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw); } catch (e) {}
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
});
