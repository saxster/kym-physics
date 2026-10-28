// Ch 7.3 c7_track -> w_energytrack: Ideal sliding bead (no spin), with height, motion, and warmth bars.
// Speed computed directly from energy: v = sqrt(2*g*(h0 - h) - 2*thermal/m). Conserves PE + KE + thermal = m*g*h0 every frame.
import { Live } from './core.js';
import { mechanismKey, dimension } from './art_mechanics.js';

const G = 9.8;
const MARBLES = [
  { name: 'Glass (20 g)', m: 0.020 },
  { name: 'Steel (60 g)', m: 0.060 },
];

// Track profile x in [0, 4.0] m:
// x = 0.0: left rim (h = 1.55 m)
// x = 1.5: bottom of dip (h = 0.00 m)
// x = 2.7: top of bump (h = 0.80 m)
// x = 3.2: shallow dip after bump (h = 0.50 m)
// x = 4.0: far right wall (h = 1.55 m)
const NODES = [
  [0.0, 1.55],
  [1.5, 0.00],
  [2.7, 0.80],
  [3.2, 0.50],
  [4.0, 1.55],
];

function trackHeight(x) {
  if (x <= NODES[0][0]) return NODES[0][1];
  if (x >= NODES[NODES.length - 1][0]) return NODES[NODES.length - 1][1];
  for (let i = 0; i < NODES.length - 1; i++) {
    const [x0, y0] = NODES[i];
    const [x1, y1] = NODES[i + 1];
    if (x >= x0 && x <= x1) {
      const u = (x - x0) / (x1 - x0);
      return y0 + (y1 - y0) * (0.5 - 0.5 * Math.cos(Math.PI * u));
    }
  }
  return 0;
}

function trackSlope(x) {
  if (x <= NODES[0][0] || x >= NODES[NODES.length - 1][0]) return 0;
  for (let i = 0; i < NODES.length - 1; i++) {
    const [x0, y0] = NODES[i];
    const [x1, y1] = NODES[i + 1];
    if (x >= x0 && x <= x1) {
      const u = (x - x0) / (x1 - x0);
      return ((y1 - y0) / (x1 - x0)) * 0.5 * Math.PI * Math.sin(Math.PI * u);
    }
  }
  return 0;
}

// Find x on left slope (in [0, 1.5]) where trackHeight(x) === h0
function findReleaseX(h0) {
  const [x0, y0] = NODES[0];
  const [x1, y1] = NODES[1];
  const ratio = Math.max(-1, Math.min(1, 1 - (2 * (h0 - y0)) / (y1 - y0)));
  const u = Math.acos(ratio) / Math.PI;
  return x0 + u * (x1 - x0);
}

Live.register('energytrack', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 310, 'An ideal bead sliding without spin on a hill track beside height, motion, and warmth energy bars');
  let mu = 0.0;
  let h0 = 1.0;
  let marbleIdx = 0;
  let viewMode = 0; // 0 = Bars, 1 = Glowing jars
  const say = api.readout();
  mechanismKey(stage, 'Follow the same energy account', ['The vertical bracket links the bead’s present height to the gravitational store. The blue start line fixes the initial energy.', 'The bead slides without spinning. Motion and warmth share the same joule scale as height; the outlined total stays fixed.']);

  let x = findReleaseX(h0);
  let dir = 1; // +1 right, -1 left
  let thermalPerKg = 0; // J/kg (so thermal = m * thermalPerKg)
  let stopped = false;

  function reset() {
    x = findReleaseX(h0);
    dir = 1;
    thermalPerKg = 0;
    stopped = false;
    updateReadout();
  }

  function currentEnergies() {
    const m = MARBLES[marbleIdx].m;
    const h = trackHeight(x);
    const eTot = m * G * h0;
    const eTherm = Math.min(eTot, m * thermalPerKg);
    const pe = Math.min(eTot - eTherm, m * G * h);
    const ke = Math.max(0, eTot - pe - eTherm);
    const v = Math.sqrt((2 * ke) / m);

    // Conservation check every frame
    const sum = pe + ke + eTherm;
    if (Math.abs(sum - eTot) > 1e-9) {
      console.error('Energy conservation drift:', sum, eTot);
    }
    return { m, h, eTot, pe, ke, eTherm, v };
  }

  function stepPhysics(dtReal) {
    if (stopped || dtReal <= 0) return;
    // Play at half real time for legibility
    let rem = dtReal * 0.5;
    const dt = 0.002;

    while (rem > 1e-6 && !stopped) {
      const step = Math.min(dt, rem);
      rem -= step;

      const hCur = trackHeight(x);
      const slope = trackSlope(x);
      const cosT = 1 / Math.sqrt(1 + slope * slope);
      const sinT = slope * cosT;

      // Available specific kinetic energy (J/kg): g*(h0 - h) - thermalPerKg
      const avail = G * (h0 - hCur) - thermalPerKg;
      let v = avail > 0 ? Math.sqrt(2 * avail) : 0;

      if (v < 0.02) {
        // Near a turning point: check if gravity along slope overcomes friction
        if (Math.abs(sinT) <= mu * cosT + 1e-4 && Math.abs(x - 1.5) < 0.08) {
          stopped = true;
          v = 0;
          break;
        }
        // Kick away from peak along downhill direction
        dir = slope < 0 ? 1 : -1;
        const aDown = G * (Math.abs(sinT) - mu * cosT);
        if (aDown <= 0) {
          stopped = true;
          break;
        }
        v = Math.max(0.03, aDown * step);
      }

      const ds = v * step;
      const dx = dir * ds * cosT;
      const xNext = x + dx;
      const dTherm = mu * G * cosT * ds;
      const nextTherm = thermalPerKg + dTherm;
      const hNext = trackHeight(xNext);

      if (G * (h0 - hNext) - nextTherm <= 0) {
        // Reached exact turning point where KE hits 0
        // Bisect in [x, xNext] to find where G*(h0 - h(x)) - nextTherm == 0
        let a = x, b = xNext;
        for (let iter = 0; iter < 12; iter++) {
          const mid = 0.5 * (a + b);
          if (G * (h0 - trackHeight(mid)) - nextTherm > 0) a = mid;
          else b = mid;
        }
        const dsTurn = Math.abs(a - x) / cosT;
        thermalPerKg += mu * G * cosT * dsTurn;
        x = a;
        dir = -dir;
        const slNow = trackSlope(x);
        const cNow = 1 / Math.sqrt(1 + slNow * slNow);
        if (mu > 0 && Math.abs(slNow * cNow) <= mu * cNow + 1e-4) {
          stopped = true;
          break;
        }
      } else {
        x = xNext;
        thermalPerKg = nextTherm;
      }
    }
  }

  function updateReadout() {
    const { h, eTot, pe, ke, eTherm, v } = currentEnergies();
    const bumpNote = h0 < 0.8
      ? ` Released from ${h0.toFixed(1)} m it cannot clear the 0.8 m bump: it would need ${(0.8 - h0).toFixed(1)} m of height it never had.`
      : '';
    const massNote = marbleIdx === 1
      ? ' Steel (60 g) has three times the mass of glass (20 g), so every bar is three times larger while the speed is the same everywhere.'
      : '';

    if (mu > 0 && eTherm > 0.002) {
      say(`Friction has moved ${eTherm.toFixed(3)} J into warmth so far; height (${pe.toFixed(3)} J) + motion (${ke.toFixed(3)} J) + warmth (${eTherm.toFixed(3)} J) = ${eTot.toFixed(3)} J.${bumpNote}${massNote} Half speed; bead drawn larger than true size; spin omitted.`);
    } else if (h < 0.05) {
      say(`Bottom of the dip (${h.toFixed(2)} m): ${v.toFixed(1)} m/s, nearly all ${eTot.toFixed(3)} J is motion.${bumpNote}${massNote} Half speed.`);
    } else {
      say(`At ${h.toFixed(2)} m the bead slides at ${v.toFixed(1)} m/s (height ${pe.toFixed(3)} J, motion ${ke.toFixed(3)} J; total ${eTot.toFixed(3)} J, unchanged).${bumpNote}${massNote} Half speed; spin omitted.`);
    }
  }

  api.slider('Friction', {
    min: 0, max: 0.30, step: 0.02, value: mu,
    fmt: (v) => (v === 0 ? '0 (none)' : v.toFixed(2)),
    onInput: (v) => { mu = +v.toFixed(2); reset(); },
  });

  api.slider('Release height', {
    min: 0.3, max: 1.5, step: 0.1, value: h0,
    fmt: (v) => `${v.toFixed(1)} m`,
    onInput: (v) => { h0 = +v.toFixed(1); reset(); },
  });

  api.tabs(MARBLES.map((m) => m.name), (i) => {
    marbleIdx = i;
    updateReadout();
  }, 0);

  api.tabs(['Bars', 'Glowing jars'], (i) => {
    viewMode = i;
  }, 0);

  api.loop((dt, tNow = 0) => {
    if (dt > 0) {
      stepPhysics(dt);
      updateReadout();
    }

    k.clear(c.plate);
    const ctx = k.ctx;
    const { h, eTot, pe, ke, eTherm, v } = currentEnergies();

    // ---- Left panel: Hill track (x: 30..425)
    const tx0 = 32, tw = 385, yBase = 248, pxPerH = 132; // 1.5 m = 198 px
    const pxPerX = tw / 4.0;
    const X = (xm) => tx0 + xm * pxPerX;
    const Y = (hm) => yBase - hm * pxPerH;

    // Height guide lines at 0 m, 0.5 m, 0.8 m (bump), 1.0 m, and release height h0
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    for (const [gh, glab] of [[0, '0 m'], [0.5, '0.5 m'], [0.8, '0.8 m bump'], [1.0, '1.0 m'], [1.5, '1.5 m']]) {
      const yy = Y(gh);
      ctx.beginPath(); ctx.moveTo(tx0, yy); ctx.lineTo(tx0 + tw, yy); ctx.stroke();
      api.draw.text(ctx, glab, tx0 + tw + 4, yy + 4, { size: 10.5, color: c.muted });
    }
    // Release height line highlighted in electron blue
    const yRel = Y(h0);
    ctx.strokeStyle = c.electron;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(tx0, yRel); ctx.lineTo(tx0 + tw, yRel); ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, `start ${h0.toFixed(1)} m`, tx0 + 6, yRel - 6, { size: 11, color: c.electron, weight: 600 });

    // Track curve
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const xm = (i / 120) * 4.0;
      const sx = X(xm), sy = Y(trackHeight(xm));
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Light supports make the abstract profile a physical track.
    ctx.save(); ctx.strokeStyle = c.rule; ctx.lineWidth = 1;
    for (let xm = 0.2; xm < 4; xm += 0.4) {
      ctx.beginPath(); ctx.moveTo(X(xm), Y(trackHeight(xm)) + 3); ctx.lineTo(X(xm), yBase + 5); ctx.stroke();
    }
    ctx.restore();
    dimension(ctx, X(x) + 18, Y(h), X(x) + 18, Y(0), c.electron);
    api.draw.text(ctx, `h = ${h.toFixed(2)} m`, tx0 + 10, 24, {size: 12, color: c.electron, weight: 600});

    // Marble on track
    const slope = trackSlope(x);
    const cosT = 1 / Math.sqrt(1 + slope * slope);
    const sinT = slope * cosT;
    const rad = marbleIdx === 1 ? 9.5 : 8;
    const mx = X(x) - sinT * rad;
    const my = Y(h) - cosT * rad;

    ctx.beginPath();
    ctx.arc(mx, my, rad, 0, Math.PI * 2);
    ctx.fillStyle = marbleIdx === 1 ? c.ink : c.electron;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = c.sheet;
    ctx.stroke();

    // Speed arrow along the track
    if (v > 0.08) {
      const vLen = v * 14;
      const ux = dir * cosT;
      const uy = -dir * sinT; // screen y is downward
      api.draw.arrow(ctx, mx, my, mx + ux * vLen, my + uy * vLen, c.electron, 2.2, 7);
      api.draw.text(ctx, `${v.toFixed(1)} m/s`, mx + ux * (vLen + 10), my + uy * (vLen + 10) - 6, {
        size: 11.5, color: c.electron, align: 'center', weight: 600,
      });
    }

    // ---- Right panel: Energy bars or Glowing hatched jars
    const bx0 = 485, bBase = 248, bMaxH = 195;
    const maxRefJ = 0.060 * G * 1.5; // 0.882 J
    const pxPerJ = bMaxH / maxRefJ;

    if (viewMode === 1) {
      api.draw.text(ctx, 'Glowing jars (full = 1.0 J)', bx0 + 72, 24, { size: 12.5, color: c.ink, align: 'center', weight: 600 });
      const jars = [
        { label: 'grav.', val: pe, col: '#8a4dff', hatch: 'bars' },
        { label: 'kinetic', val: ke, col: '#2f7bff', hatch: 'chevrons' },
        { label: 'thermal', val: eTherm, col: '#ff7a1c', hatch: 'waves' },
      ];
      const jw = 38, jh = 165, jGap = 14, jy = bBase - jh;
      // Pathway tubes between jars
      if (v > 0.05) {
        ctx.save();
        ctx.strokeStyle = '#5c64ff';
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 5]);
        ctx.lineDashOffset = -tNow * 36 * Math.sign(slope * dir || 1);
        ctx.beginPath();
        ctx.moveTo(bx0 + jw, jy + jh * 0.55);
        ctx.lineTo(bx0 + jw + jGap, jy + jh * 0.55);
        ctx.stroke();
        if (mu > 0) {
          ctx.strokeStyle = '#ff7a1c';
          ctx.beginPath();
          ctx.moveTo(bx0 + 2 * jw + jGap, jy + jh * 0.7);
          ctx.lineTo(bx0 + 2 * (jw + jGap), jy + jh * 0.7);
          ctx.stroke();
        }
        ctx.restore();
      }
      jars.forEach((j, i) => {
        const jx = bx0 + i * (jw + jGap);
        const frac = Math.min(1, Math.max(0, j.val / 1.0));
        const fh = frac * (jh - 8);
        const fy = jy + jh - 3 - fh;
        // Jar neck & body
        api.draw.roundRect(ctx, jx + 6, jy - 7, jw - 12, 7, 2);
        ctx.fillStyle = c.sheet; ctx.fill();
        ctx.strokeStyle = c.ink; ctx.lineWidth = 1.3; ctx.stroke();
        api.draw.roundRect(ctx, jx, jy, jw, jh, 7);
        ctx.fillStyle = c.sheet; ctx.fill();
        if (fh > 1) {
          ctx.save();
          api.draw.roundRect(ctx, jx + 2, jy + 2, jw - 4, jh - 4, 5);
          ctx.clip();
          ctx.fillStyle = j.col;
          ctx.globalAlpha = 0.28;
          ctx.fillRect(jx, fy, jw, fh);
          ctx.globalAlpha = 0.75;
          ctx.strokeStyle = c.ink;
          ctx.lineWidth = 1.1;
          if (j.hatch === 'bars') {
            for (let y = fy + 4; y < jy + jh; y += 6) {
              ctx.beginPath(); ctx.moveTo(jx + 4, y); ctx.lineTo(jx + jw - 4, y); ctx.stroke();
            }
          } else if (j.hatch === 'chevrons') {
            for (let y = fy + 6; y < jy + jh; y += 8) {
              ctx.beginPath();
              ctx.moveTo(jx + 6, y + 3); ctx.lineTo(jx + jw / 2, y - 2); ctx.lineTo(jx + jw - 6, y + 3);
              ctx.stroke();
            }
          } else {
            for (let y = fy + 5; y < jy + jh; y += 7) {
              ctx.beginPath();
              for (let xx = jx + 4; xx <= jx + jw - 4; xx += 3) {
                const yy = y + Math.sin((xx + tNow * 15) * 0.4) * 1.8;
                if (xx === jx + 4) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
              }
              ctx.stroke();
            }
          }
          ctx.globalAlpha = 1;
          ctx.strokeStyle = j.col;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(jx + 2, fy); ctx.lineTo(jx + jw - 2, fy); ctx.stroke();
          ctx.restore();
        }
        // Capacity mark for eTot
        const totY = jy + jh - 3 - Math.min(1, eTot / 1.0) * (jh - 8);
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = c.muted;
        ctx.beginPath(); ctx.moveTo(jx + 2, totY); ctx.lineTo(jx + jw - 2, totY); ctx.stroke();
        ctx.restore();
        api.draw.roundRect(ctx, jx, jy, jw, jh, 7);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5; ctx.stroke();
        api.draw.text(ctx, j.label, jx + jw / 2, bBase + 16, { size: 11, color: c.ink, align: 'center', weight: 600 });
        api.draw.text(ctx, `${j.val.toFixed(2)} J`, jx + jw / 2, bBase + 30, { size: 10.5, color: c.muted, align: 'center' });
      });
      return;
    }

    api.draw.text(ctx, 'Energy stores (J)', bx0 + 68, 26, { size: 13, color: c.ink, align: 'center', weight: 600 });

    const bars = [
      { label: 'height', val: pe, col: c.electron },
      { label: 'motion', val: ke, col: c.proton },
      { label: 'warmth', val: eTherm, col: c.neutron },
    ];

    const bw = 30, gap = 14;
    bars.forEach((b, i) => {
      const bx = bx0 + i * (bw + gap);
      const bh = Math.max(0, b.val * pxPerJ);
      const totH = eTot * pxPerJ;

      // Fixed total energy outline on each bar
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(bx, bBase - totH, bw, totH);
      ctx.restore();

      if (bh > 0.5) {
        ctx.fillStyle = b.col;
        ctx.globalAlpha = 0.78;
        ctx.fillRect(bx, bBase - bh, bw, bh);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(bx, bBase - bh, bw, bh);
      }
      api.draw.text(ctx, b.label, bx + bw / 2, bBase + 16, { size: 11.5, color: c.ink, align: 'center', weight: 600 });
      api.draw.text(ctx, b.val.toFixed(2), bx + bw / 2, bBase + 30, { size: 11, color: c.muted, align: 'center' });
    });

    // Stacked total bar on far right with fixed outline that never changes during a run
    const sx = bx0 + 3 * (bw + gap);
    const totH = eTot * pxPerJ;
    let curY = bBase;
    for (const b of bars) {
      const bh = Math.max(0, b.val * pxPerJ);
      if (bh > 0.5) {
        ctx.fillStyle = b.col;
        ctx.globalAlpha = 0.78;
        ctx.fillRect(sx, curY - bh, bw, bh);
        ctx.globalAlpha = 1;
        curY -= bh;
      }
    }
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.2;
    ctx.strokeRect(sx, bBase - totH, bw, totH);
    api.draw.text(ctx, 'total', sx + bw / 2, bBase + 16, { size: 11.5, color: c.ink, align: 'center', weight: 600 });
    api.draw.text(ctx, `${eTot.toFixed(2)} J`, sx + bw / 2, bBase + 30, { size: 11, color: c.ink, align: 'center', weight: 600 });

    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx0 - 6, bBase);
    ctx.lineTo(sx + bw + 6, bBase);
    ctx.stroke();
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Slide the bead' });
