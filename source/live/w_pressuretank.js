// Ch 6.4 c6_tank -> w_pressuretank: Tank of liquid with depth-dependent wall pressure arrows and Torricelli jets.
// p = rho * g * h, v = sqrt(2 * g * h). Supports tapping a hole to inspect its exact depth, pressure, and jet speed.
import { Live } from './core.js';

const G = 9.8;
const P_ATM = 101.3; // kPa
const LIQUIDS = [
  { name: 'Fresh water (1,000 kg/m\u00b3)', short: 'water', rho: 1000 },
  { name: 'Sea water (1,025 kg/m\u00b3)', short: 'sea water', rho: 1025 },
  { name: 'Mercury (13,600 kg/m\u00b3)', short: 'mercury', rho: 13600 },
];
// Holes placed at height z above the floor (or depth from the 2.0 m rim):
// With default depth 1.5 m, depths below the surface are 0.5 m, 1.0 m, and 1.5 m (matching c6_tank).
const HOLE_Z = [1.0, 0.5, 0.05]; // height above tank floor (m); for 1.5 m fill, depths are 0.5 m, 1.0 m, 1.45 m (~1.5 m)

Live.register('pressuretank', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 320, 'A tank of liquid with pressure arrows on the left wall and three parabolic jets from the right wall');
  let fillDepth = 1.5; // m (0 to 2.0 m)
  let liqIdx = 0;
  let showAtm = false;
  let selectedHole = null; // 0, 1, or 2 when tapped
  let dropPhase = 0;
  const say = api.readout();

  // Geometry constants
  const tankL = 175, tankR = 405, tankBot = 280, maxH_m = 2.0;
  const pxPerM = 110; // 2.0 m = 220 px => tankTop = 60

  // Tap a hole on the right wall to inspect its depth and pressure
  k.cv.addEventListener('pointerdown', (e) => {
    const r = k.cv.getBoundingClientRect();
    const sx = (e.clientX - r.left) * (k.W / r.width);
    const sy = (e.clientY - r.top) * (k.H / r.height);
    let best = null, bestD = 32;
    HOLE_Z.forEach((z, idx) => {
      const hy = tankBot - z * pxPerM;
      const d = Math.hypot(sx - tankR, sy - hy);
      if (d < bestD) { bestD = d; best = idx; }
    });
    if (best !== null) {
      selectedHole = selectedHole === best ? null : best;
      updateReadout();
    }
  });

  function pressureKpaAt(depthBelowSurface) {
    if (depthBelowSurface <= 0) return showAtm ? P_ATM : 0;
    const pLiq = (LIQUIDS[liqIdx].rho * G * depthBelowSurface) / 1000;
    return showAtm ? pLiq + P_ATM : pLiq;
  }

  function updateReadout() {
    const liq = LIQUIDS[liqIdx];
    const p1m = (liq.rho * G * 1.0) / 1000;
    const p1mShown = showAtm ? p1m + P_ATM : p1m;
    const atmNote = showAtm ? ' (including the air\u2019s 101 kPa)' : '';
    const clipNote = liqIdx === 2 && fillDepth > 0.3 ? ' Mercury\u2019s wall-pressure arrows are clipped at the frame edge.' : '';

    if (selectedHole !== null) {
      const z = HOLE_Z[selectedHole];
      const h = Math.max(0, fillDepth - z);
      if (h <= 0) {
        say(`Hole ${selectedHole + 1} is above the liquid surface: depth 0 m, gauge pressure 0 kPa${showAtm ? ' (101.3 kPa absolute)' : ''}, no jet. The tank is kept topped up; slowed to half speed.`);
      } else {
        const pHole = pressureKpaAt(h);
        const vJet = Math.sqrt(2 * G * h);
        say(`Hole ${selectedHole + 1} (${h.toFixed(2)} m below surface): pressure ${pHole.toFixed(1)} kPa${atmNote}, jet speed v = \u221a(2gh) = ${vJet.toFixed(2)} m/s.${clipNote} The tank is kept topped up; slowed to half speed.`);
      }
      return;
    }

    if (liqIdx === 2) {
      say(`Mercury is 13.6 times as dense, so 1.0 m of it pushes with ${p1mShown.toFixed(0)} kPa${atmNote}: more than the whole atmosphere. The jet from the deepest hole is fastest (v = \u221a(2gh)).${clipNote} The tank is kept topped up; slowed to half speed.`);
    } else {
      say(`At 1.0 m the ${liq.short} pushes with ${p1mShown.toFixed(1)} kPa${atmNote} on every square metre of wall, in every direction; twice as deep, twice the push from the liquid. The deepest jet is fastest (its speed goes with \u221a(depth)); tap any hole to read it. The tank is kept topped up; slowed to half speed.`);
    }
  }

  api.slider('Depth of liquid', {
    min: 0, max: 2.0, step: 0.1, value: fillDepth,
    fmt: (v) => `${v.toFixed(1)} m`,
    onInput: (v) => { fillDepth = +v.toFixed(1); updateReadout(); },
  });

  api.tabs(LIQUIDS.map((l) => l.name), (i) => {
    liqIdx = i;
    updateReadout();
  }, 0);

  const atmBtn = api.button('Show the air\u2019s 101 kPa', () => {
    showAtm = !showAtm;
    atmBtn.setAttribute('aria-pressed', String(showAtm));
    updateReadout();
  }, { pressed: false });

  api.loop((dt) => {
    if (dt > 0) {
      // Slowed to half speed
      dropPhase = (dropPhase + dt * 0.5) % 10;
    }

    k.clear(c.plate);
    const ctx = k.ctx;
    const liq = LIQUIDS[liqIdx];
    const tankTop = tankBot - maxH_m * pxPerM;
    const surfY = tankBot - fillDepth * pxPerM;

    // Ground line
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, tankBot);
    ctx.lineTo(620, tankBot);
    ctx.stroke();

    // Liquid fill
    if (fillDepth > 0) {
      ctx.save();
      ctx.fillStyle = liqIdx === 2 ? c.ink : c.electron;
      ctx.globalAlpha = liqIdx === 2 ? 0.38 : 0.22;
      ctx.fillRect(tankL, surfY, tankR - tankL, tankBot - surfY);
      ctx.restore();

      // Surface line
      ctx.strokeStyle = liqIdx === 2 ? c.ink : c.electron;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tankL, surfY);
      ctx.lineTo(tankR, surfY);
      ctx.stroke();
    }

    // Tank walls
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(tankL, tankTop - 10);
    ctx.lineTo(tankL, tankBot);
    ctx.lineTo(tankR, tankBot);
    ctx.lineTo(tankR, tankTop - 10);
    ctx.stroke();

    api.draw.text(ctx, showAtm ? 'air above: +101.3 kPa added' : 'air above: 101 kPa (gauge pressure shown)', (tankL + tankR) * 0.5, tankTop - 16, {
      size: 12, color: c.muted, align: 'center',
    });

    // Pressure arrows on the left wall (at 4 depth levels below the surface, same scale across all liquids: 4.5 px per kPa)
    const pScale = 4.5; // px per kPa
    const maxArrowW = 148;
    const sampleDepths = [0.25, 0.5, 1.0, 1.5, 1.9].filter((d) => d <= fillDepth + 1e-4);
    for (const d of sampleDepths) {
      const y = surfY + d * pxPerM;
      const pLiq = (liq.rho * G * d) / 1000;
      const pTot = showAtm ? pLiq + P_ATM : pLiq;
      const rawLen = pLiq * pScale;
      const clipped = rawLen > maxArrowW;
      const len = Math.min(maxArrowW, Math.max(10, rawLen));

      // Arrow inside tank pointing left against the left wall
      const xStart = Math.min(tankR - 12, tankL + 4 + len);
      api.draw.arrow(ctx, xStart, y, tankL + 3, y, c.electron, 2, 7);

      // Depth & pressure label to the left of the wall
      api.draw.text(ctx, `${d.toFixed(2).replace(/0$/, '')} m · ${pTot.toFixed(1)} kPa${clipped ? ' (clipped)' : ''}`, tankL - 8, y + 4, {
        size: 11.5, color: c.ink, align: 'right',
      });
    }

    // Three holes on the right wall and their Torricelli parabolic jets: x = v * t, y_drop = 0.5 * g * t^2 => y_drop = x^2 / (4 * h)
    HOLE_Z.forEach((z, idx) => {
      const hy = tankBot - z * pxPerM;
      const h = fillDepth - z; // depth of hole below surface (m)
      const isSel = selectedHole === idx;

      // Hole marker
      ctx.beginPath();
      ctx.arc(tankR, hy, isSel ? 5.5 : 3.8, 0, Math.PI * 2);
      ctx.fillStyle = isSel ? c.proton : c.sheet;
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = c.ink;
      ctx.stroke();

      if (h > 0.01) {
        const vJet = Math.sqrt(2 * G * h); // m/s
        const tFall = Math.sqrt((2 * z) / G); // time to reach tank floor (s)

        ctx.strokeStyle = isSel ? c.proton : c.electron;
        ctx.lineWidth = isSel ? 2.8 : 2.2;
        ctx.beginPath();
        const N = 28;
        for (let i = 0; i <= N; i++) {
          const tt = (i / N) * tFall;
          const jx = tankR + 3 + (vJet * tt) * pxPerM;
          const jy = hy + (0.5 * G * tt * tt) * pxPerM;
          if (i === 0) ctx.moveTo(jx, jy); else ctx.lineTo(jx, jy);
        }
        ctx.stroke();

        // Moving fluid beads along the jet so the relative speed v = sqrt(2gh) is visually alive
        for (let b = 0; b < 4; b++) {
          const tb = ((dropPhase + b * 0.14) % 0.56);
          if (tb <= tFall) {
            const bx = tankR + 3 + (vJet * tb) * pxPerM;
            const by = hy + (0.5 * G * tb * tb) * pxPerM;
            if (bx < 630) {
              ctx.beginPath();
              ctx.arc(bx, by, 2.8, 0, Math.PI * 2);
              ctx.fillStyle = isSel ? c.proton : c.electron;
              ctx.fill();
            }
          }
        }

        const landX = Math.min(625, tankR + 3 + (vJet * tFall) * pxPerM);
        api.draw.text(ctx, `${vJet.toFixed(1)} m/s`, Math.min(618, landX + 6), hy + 14, {
          size: 11, color: isSel ? c.proton : c.electron, weight: isSel ? 600 : 400,
        });
      }
    });

    api.draw.text(ctx, 'tap any hole on the right wall to inspect', 520, 38, {
      size: 11.5, color: c.muted, align: 'center',
    });
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Fill the tank' });
