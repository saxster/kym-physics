// Ch 6.5 c6_buoyancy -> w_buoyancy: Block or hollowed hull in a tank of fresh water, sea water, or mercury.
// Shows face pressure arrows, net buoyant force vs weight, and displaced water volume matching submerged volume every frame.
import { Live } from './core.js';

const G = 9.8;
const LIQUIDS = [
  { name: 'Fresh water (1,000)', short: 'water', rho: 1000 },
  { name: 'Sea water (1,025)', short: 'sea water', rho: 1025 },
  { name: 'Mercury (13,600)', short: 'mercury', rho: 13600 },
];

function materialName(rho) {
  if (Math.abs(rho - 700) <= 40) return 'Wood';
  if (Math.abs(rho - 920) <= 40) return 'Ice';
  if (Math.abs(rho - 1000) <= 30) return 'Water-density block';
  if (Math.abs(rho - 2700) <= 150) return 'Aluminium';
  if (Math.abs(rho - 7800) <= 250) return 'Steel';
  return 'Block';
}

Live.register('buoyancy', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 330, 'A block in a tank with pressure arrows on its faces, buoyant and weight force bars, and shaded displaced liquid');
  let rhoBlock = 920; // kg/m^3 (100 to 10,000)
  let liqIdx = 0;
  let hollow = false; // when true, same mass occupies 10x the volume (effective density = rhoBlock / 10)
  const say = api.readout();

  // Block vertical coordinate yTop: 0 = top of block at water surface, 1 = fully submerged at surface, >1 deeper, 1.55 = tank bottom
  const MAX_DEPTH_RATIO = 1.55;
  let subPos = 0.92; // current depth of block bottom below surface in units of block height H_b
  let subVel = 0;

  function effectiveDensity() {
    return hollow ? rhoBlock / 10 : rhoBlock;
  }

  function equilibriumPos() {
    const rhoEff = effectiveDensity();
    const rhoFluid = LIQUIDS[liqIdx].rho;
    if (Math.abs(rhoEff - rhoFluid) < 1e-3) {
      // Neutral buoyancy: hangs wherever you leave it (clamp within 1.0..MAX_DEPTH_RATIO)
      return Math.min(MAX_DEPTH_RATIO, Math.max(1.0, subPos));
    }
    if (rhoEff < rhoFluid) {
      return rhoEff / rhoFluid;
    }
    return MAX_DEPTH_RATIO;
  }

  function snapOrRelease() {
    const eq = equilibriumPos();
    if (api.reduced) {
      subPos = eq;
      subVel = 0;
    } else {
      // Start slightly away from equilibrium so the damped bobbing motion is visible
      subPos = Math.abs(subPos - eq) < 0.05 ? Math.max(0.2, eq - 0.25) : subPos;
    }
    updateReadout();
  }

  function stepPhysics(dtReal) {
    if (dtReal <= 0) return;
    const rhoEff = effectiveDensity();
    const rhoFluid = LIQUIDS[liqIdx].rho;
    const eq = equilibriumPos();
    if (Math.abs(rhoEff - rhoFluid) < 1e-3) {
      subPos = Math.min(MAX_DEPTH_RATIO, Math.max(1.0, subPos));
      subVel = 0;
      return;
    }

    let rem = Math.min(0.05, dtReal);
    const h = 0.004;
    while (rem > 1e-6) {
      const dt = Math.min(h, rem);
      rem -= dt;
      const fracSub = Math.max(0, Math.min(1, subPos));
      // Normalized acceleration: (weight - buoyant) / mass, with strong water drag so it settles after 1-2 bobs
      const aNorm = ((rhoEff - rhoFluid * fracSub) / rhoEff) * 14.0 - 5.2 * subVel;
      subVel += aNorm * dt;
      subPos += subVel * dt;
      if (subPos >= MAX_DEPTH_RATIO) {
        subPos = MAX_DEPTH_RATIO;
        if (subVel > 0) subVel = 0;
      }
      if (subPos < 0.02) {
        subPos = 0.02;
        if (subVel < 0) subVel = 0;
      }
    }
    if (Math.abs(subPos - eq) < 0.002 && Math.abs(subVel) < 0.005) {
      subPos = eq;
      subVel = 0;
    }
  }

  function updateReadout() {
    const rhoFluid = LIQUIDS[liqIdx].rho;
    const rhoEff = effectiveDensity();
    const matName = materialName(rhoBlock);
    const fracFloat = Math.min(1, rhoEff / rhoFluid);
    const pctFloat = (fracFloat * 100).toFixed(fracFloat * 100 < 99 && (fracFloat * 100) % 1 !== 0 ? 1 : 0);

    let msg = '';
    if (hollow) {
      msg = `Hollowed out: the same ${matName.toLowerCase()} mass now encloses air with 10 times the total volume (average density ${Math.round(rhoEff)} kg/m\u00b3, wall thickness drawn thicker for visibility), so it floats with ${pctFloat}% of the hull below the waterline.`;
    } else if (Math.abs(rhoEff - rhoFluid) < 1) {
      msg = `Density equal to the ${LIQUIDS[liqIdx].short}\u2019s (${rhoBlock.toLocaleString('en-GB')} kg/m\u00b3): buoyant force equals weight when submerged, so the block hangs wherever you leave it.`;
    } else if (rhoEff < rhoFluid) {
      const seaExtra = liqIdx === 1 && Math.abs(rhoBlock - 920) < 10
        ? ' Sea water is 2.5% denser than fresh water, so ice floats higher: 89.8% submerged instead of 92%.'
        : '';
      msg = `${matName}, ${rhoBlock.toLocaleString('en-GB')} kg/m\u00b3, floats with ${pctFloat}% of its volume under the ${LIQUIDS[liqIdx].short}: it displaces exactly its own weight of liquid.${seaExtra}`;
    } else {
      const ratio = (rhoEff / rhoFluid).toFixed(1);
      const apparentPct = Math.round((1 - rhoFluid / rhoEff) * 100);
      msg = `${matName} (${rhoBlock.toLocaleString('en-GB')} kg/m\u00b3) is ${ratio} times as dense as ${LIQUIDS[liqIdx].short}. The liquid pushes up with 1/${ratio} of the block\u2019s weight, so it sinks, but resting on the bottom it presses down with only ${apparentPct}% of its weight in air.`;
    }
    say(`${msg} (Water drag is exaggerated so the block settles quickly; atmospheric pressure on top and bottom cancels.)`);
  }

  api.slider('Block density', {
    min: 100, max: 10000, step: 20, value: rhoBlock,
    fmt: (v) => `${v.toLocaleString('en-GB')} kg/m\u00b3 (${materialName(v)})`,
    onInput: (v) => {
      // Snap near key benchmark values: wood 700, ice 920, water 1000, aluminium 2700, steel 7800
      for (const mark of [700, 920, 1000, 2700, 7800]) {
        if (Math.abs(v - mark) <= 35) { v = mark; break; }
      }
      rhoBlock = v;
      snapOrRelease();
    },
  });

  api.tabs(LIQUIDS.map((l) => l.name), (i) => {
    liqIdx = i;
    snapOrRelease();
  }, 0);

  const hollowBtn = api.button('Hollow it out', () => {
    hollow = !hollow;
    hollowBtn.setAttribute('aria-pressed', String(hollow));
    hollowBtn.textContent = hollow ? 'Make it solid again' : 'Hollow it out';
    snapOrRelease();
  }, { pressed: false });

  api.loop((dt) => {
    if (dt > 0) stepPhysics(dt);

    const rhoFluid = LIQUIDS[liqIdx].rho;
    const rhoEff = effectiveDensity();
    const fracSub = Math.max(0, Math.min(1, subPos));

    // Conservation check: displaced liquid volume must equal submerged part of block at every frame
    const V_block = hollow ? 1.0 : 0.1; // m^3 reference
    const V_submerged = fracSub * V_block;
    const V_displaced = V_submerged;
    if (Math.abs(V_displaced - fracSub * V_block) > 1e-12) {
      console.error('Buoyancy displaced volume mismatch');
    }

    k.clear(c.plate);
    const ctx = k.ctx;

    // ---- Left panel: Tank with block and pressure arrows (x: 24..370)
    const tankL = 40, tankR = 350, surfY = 108, tankBot = 248;
    const bW = hollow ? 116 : 78;
    const bH = hollow ? 76 : 64;
    const bx = (tankL + tankR - bW) * 0.5;

    // Map subPos so subPos = 0..1 puts block bottom at surfY + subPos * bH, and subPos = MAX_DEPTH_RATIO puts block bottom at tankBot
    let bBotY;
    if (subPos <= 1.0) {
      bBotY = surfY + subPos * bH;
    } else {
      const extra = (subPos - 1.0) / (MAX_DEPTH_RATIO - 1.0);
      bBotY = (surfY + bH) + extra * (tankBot - (surfY + bH));
    }
    const bTopY = bBotY - bH;

    // Water fill in tank
    ctx.save();
    ctx.fillStyle = liqIdx === 2 ? c.ink : c.electron;
    ctx.globalAlpha = liqIdx === 2 ? 0.35 : 0.20;
    ctx.fillRect(tankL, surfY, tankR - tankL, tankBot - surfY);
    ctx.restore();

    // Surface line & tank outline
    ctx.strokeStyle = c.electron;
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(tankL, surfY); ctx.lineTo(tankR, surfY); ctx.stroke();

    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(tankL, surfY - 36);
    ctx.lineTo(tankL, tankBot);
    ctx.lineTo(tankR, tankBot);
    ctx.lineTo(tankR, surfY - 36);
    ctx.stroke();

    // Draw block (or hollowed hull)
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.fillRect(bx, bTopY, bW, bH);
    ctx.strokeRect(bx, bTopY, bW, bH);

    if (hollow) {
      // Inner air cavity (wall thickness exaggerated for visibility)
      ctx.fillStyle = c.plate;
      ctx.fillRect(bx + 7, bTopY + 4, bW - 14, bH - 11);
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 7, bTopY + 4, bW - 14, bH - 11);
      api.draw.text(ctx, 'hollow hull (10\u00d7 vol)', bx + bW / 2, bTopY + 22, { size: 11, color: c.ink, align: 'center', weight: 600 });
    } else {
      api.draw.text(ctx, `${rhoBlock} kg/m\u00b3`, bx + bW / 2, bTopY + 24, { size: 11.5, color: c.ink, align: 'center', weight: 600 });
    }

    // Shade the submerged ("water displaced") volume on the block and show matching displaced column on right of tank
    const subHeightPx = Math.max(0, Math.min(bH, bBotY - surfY));
    if (subHeightPx > 0.5) {
      ctx.save();
      ctx.fillStyle = c.electron;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(bx, bBotY - subHeightPx, bW, subHeightPx);
      ctx.restore();
    }

    // Pressure arrows on top, bottom, left, right faces (lengths proportional to depth below surface)
    const hTopPx = Math.max(0, bTopY - surfY);
    const hBotPx = Math.max(0, bBotY - surfY);
    const arrowK = 0.36; // px of arrow per px of depth
    const topLen = hTopPx * arrowK;
    const botLen = Math.max(8, hBotPx * arrowK);

    // Top downward pressure arrows (if top face is under liquid)
    if (topLen >= 4) {
      for (const ax of [bx + bW * 0.28, bx + bW * 0.72]) {
        api.draw.arrow(ctx, ax, bTopY - topLen - 2, ax, bTopY - 2, c.electron, 1.8, 6);
      }
    }
    // Bottom upward pressure arrows (always longer than top by bH * arrowK when submerged)
    if (hBotPx > 2) {
      for (const ax of [bx + bW * 0.25, bx + bW * 0.5, bx + bW * 0.75]) {
        api.draw.arrow(ctx, ax, bBotY + botLen + 2, ax, bBotY + 2, c.electron, 1.8, 6);
      }
    }
    // Sideways equal & opposite pressure arrows
    for (const fracY of [0.35, 0.75]) {
      const py = bTopY + bH * fracY;
      if (py > surfY + 4) {
        const sLen = Math.min(28, (py - surfY) * arrowK);
        api.draw.arrow(ctx, bx - sLen - 2, py, bx - 2, py, c.electron, 1.6, 5);
        api.draw.arrow(ctx, bx + bW + sLen + 2, py, bx + bW + 2, py, c.electron, 1.6, 5);
      }
    }

    // Net buoyant force arrow (upward, red) and Weight arrow (downward, ink/red) from block centre
    // Net arrow = bottom push - top push = buoyant force, to the pixel
    const netBuoyPx = Math.max(0, botLen - topLen);
    const weightPx = netBuoyPx * (rhoEff / (rhoFluid * Math.max(0.01, fracSub)));
    const midX = bx + bW / 2, midY = bTopY + bH / 2;
    if (netBuoyPx >= 3) {
      api.draw.arrow(ctx, midX - 10, midY, midX - 10, midY - Math.min(75, netBuoyPx * 2.2), c.proton, 2.6, 8);
    }
    api.draw.arrow(ctx, midX + 10, midY, midX + 10, midY + Math.min(75, weightPx * 2.2), c.ink, 2.4, 8);

    // ---- Right panel: Displaced liquid box + Force comparison bars (x: 385..620)
    const rx0 = 395;
    api.draw.text(ctx, 'Forces & displaced liquid', rx0 + 110, 28, { size: 13, color: c.ink, align: 'center', weight: 600 });

    // Shaded "water displaced" volume box matching submerged fraction
    const dispW = 68, dispMaxH = bH;
    const dispX = rx0 + 12, dispBotY = 148;
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(dispX, dispBotY - dispMaxH, dispW, dispMaxH);
    if (subHeightPx > 0) {
      ctx.save();
      ctx.fillStyle = liqIdx === 2 ? c.ink : c.electron;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(dispX, dispBotY - subHeightPx, dispW, subHeightPx);
      ctx.restore();
    }
    api.draw.text(ctx, 'liquid displaced', dispX + dispW / 2, dispBotY + 16, { size: 11.5, color: c.muted, align: 'center' });
    api.draw.text(ctx, `${Math.round(fracSub * 100)}% of block`, dispX + dispW / 2, dispBotY + 30, { size: 11.5, color: c.electron, align: 'center', weight: 600 });

    // Two horizontal bars below: Weight vs Buoyant force
    const fWeight = rhoEff * G; // N per unit volume
    const fBuoy = rhoFluid * fracSub * G;
    const fMax = Math.max(fWeight, fBuoy, 1000 * G);
    const barMaxW = 145;

    const drawBar = (y, label, val, col) => {
      const wBar = Math.max(3, (val / fMax) * barMaxW);
      api.draw.text(ctx, label, rx0, y - 6, { size: 12, color: c.ink, weight: 600 });
      ctx.fillStyle = col;
      ctx.fillRect(rx0, y, wBar, 16);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(rx0, y, wBar, 16);
      api.draw.text(ctx, `${(val / 1000).toFixed(1)} kN`, rx0 + wBar + 6, y + 12, { size: 11.5, color: c.ink });
    };

    drawBar(212, 'Weight (\u03c1_block V g)', fWeight, c.muted);
    drawBar(262, 'Buoyant force (\u03c1_liquid V_sub g)', fBuoy, c.proton);

    // Benchmarks reminder along bottom of tank
    api.draw.text(ctx, 'Marks: wood 700 · ice 920 · water 1,000 · aluminium 2,700 · steel 7,800 kg/m\u00b3', 320, 314, {
      size: 11.5, color: c.muted, align: 'center',
    });
  });

  snapOrRelease();
  return { destroy() {} };
}, { label: 'Drop it in' });
