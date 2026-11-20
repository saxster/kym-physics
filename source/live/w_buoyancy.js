// Ch 6.5 c6_buoyancy -> w_buoyancy: Block or hollowed hull in a tank of fresh water, sea water, or mercury.
// Shows live displaced waterline rise, face pressure arrows, Mystery ? block, direct drag dunking & sonification.
import { Live } from './core.js';
import { buoyancyForceAccount } from './mechanics_geometry.mjs';
import { mechanismKey, hatch } from './art_mechanics.js';
import { simPalette, drawDimension, canvasPointerCoords } from './draft_canvas.js';
import { playTone } from './atlas/engine/sound.js';

const LIQUIDS = [
  { name: 'Fresh water (1,000)', short: 'water', rho: 1000 },
  { name: 'Sea water (1,025)', short: 'sea water', rho: 1025 },
  { name: 'Mercury (13,600)', short: 'mercury', rho: 13600 },
];
const MYSTERY_DENSITY = 650; // floats cleanly at 65% submerged in fresh water so Kym can infer it

function materialName(rho, masked = false) {
  if (masked) return 'Mystery ? block';
  if (Math.abs(rho - 700) <= 40) return 'Wood';
  if (Math.abs(rho - 920) <= 40) return 'Ice';
  if (Math.abs(rho - 1000) <= 30) return 'Water-density block';
  if (Math.abs(rho - 2700) <= 150) return 'Aluminium';
  if (Math.abs(rho - 7800) <= 250) return 'Steel';
  return 'Block';
}

Live.register('buoyancy', (stage, params, api) => {
  const k = api.canvas(640, 380, 'A block in a tank with pressure arrows, rising displaced waterline, buoyant vs weight bars, and direct drag');
  let rhoBlock = 920; // kg/m^3 (100 to 10,000)
  let liqIdx = 0;
  let hollow = false;
  let mysteryMode = false;
  let mysteryRevealed = false;
  let draggingBlock = false;
  let dragStartY = 0;
  let dragStartSub = 0;
  let lastChimeAt = 0;
  const say = api.readout();

  mechanismKey(stage, 'Drag the block underwater or hollow it into a hull', [
    'Diagonal hatching marks excluded liquid volume (including trapped hull air); tank level rises linearly with V_displaced.',
    'Wait for Mystery ? block to settle in water — its submerged fraction tells you its exact density!',
  ]);

  const MAX_DEPTH_RATIO = 1.55;
  let subPos = 0.92;
  let subVel = 0;

  const activeDensity = () => (mysteryMode ? MYSTERY_DENSITY : rhoBlock);
  const effectiveDensity = () => (hollow ? activeDensity() / 10 : activeDensity());

  function equilibriumPos() {
    const rhoEff = effectiveDensity();
    const rhoFluid = LIQUIDS[liqIdx].rho;
    if (Math.abs(rhoEff - rhoFluid) < 1e-3) return Math.min(MAX_DEPTH_RATIO, Math.max(1.0, subPos));
    if (rhoEff < rhoFluid) return rhoEff / rhoFluid;
    return MAX_DEPTH_RATIO;
  }

  function snapOrRelease() {
    const eq = equilibriumPos();
    if (api.reduced) {
      subPos = eq;
      subVel = 0;
    } else {
      subPos = Math.abs(subPos - eq) < 0.05 ? Math.max(0.2, eq - 0.25) : subPos;
    }
    updateReadout();
    api.redraw?.();
  }

  function stepPhysics(dtReal) {
    if (draggingBlock || dtReal <= 0) return;
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
      const aNorm = ((rhoEff - rhoFluid * fracSub) / rhoEff) * 14.0 - 5.2 * subVel;
      subVel += aNorm * dt;
      subPos += subVel * dt;
      if (subPos >= MAX_DEPTH_RATIO) { subPos = MAX_DEPTH_RATIO; if (subVel > 0) subVel = 0; }
      if (subPos < 0.02) { subPos = 0.02; if (subVel < 0) subVel = 0; }
    }
    if (Math.abs(subPos - eq) < 0.002 && Math.abs(subVel) < 0.005) {
      subPos = eq;
      subVel = 0;
    }
  }

  function updateReadout() {
    const rhoFluid = LIQUIDS[liqIdx].rho;
    const rhoVal = activeDensity();
    const rhoEff = effectiveDensity();
    const masked = mysteryMode && !mysteryRevealed;
    const matName = materialName(rhoVal, masked);
    const fracFloat = Math.min(1, rhoEff / rhoFluid);
    const pctFloat = (fracFloat * 100).toFixed(fracFloat * 100 < 99 && (fracFloat * 100) % 1 !== 0 ? 1 : 0);

    let msg = '';
    if (hollow) {
      msg = `Hollowed out: the ${matName.toLowerCase()} encloses air with 10× total volume (effective density ${masked ? '? kg/m³' : `${Math.round(rhoEff)} kg/m³`}), floating with ${pctFloat}% submerged.`;
    } else if (Math.abs(rhoEff - rhoFluid) < 1) {
      msg = `Density equal to the ${LIQUIDS[liqIdx].short}’s (${masked ? '? ' : rhoVal.toLocaleString('en-GB') + ' '}kg/m³): neutral buoyancy anywhere underwater.`;
    } else if (rhoEff < rhoFluid) {
      const seaExtra = !masked && liqIdx === 1 && Math.abs(rhoVal - 920) < 10
        ? ' Sea water is 2.5% denser than fresh water, so ice floats higher: 89.8% submerged instead of 92%.'
        : '';
      const valTag = masked ? '' : `, ${rhoVal.toLocaleString('en-GB')} kg/m³,`;
      msg = `${matName}${valTag} floats with ${pctFloat}% submerged in ${LIQUIDS[liqIdx].short}: displaced liquid weight equals block weight.${seaExtra}`;
    } else {
      const ratio = (rhoEff / rhoFluid).toFixed(1);
      const apparentPct = Math.round((1 - rhoFluid / rhoEff) * 100);
      msg = `${matName} (${masked ? '? ' : rhoVal.toLocaleString('en-GB') + ' '}kg/m³) is ${ratio}× as dense as ${LIQUIDS[liqIdx].short} and rests on the floor with ${apparentPct}% apparent weight.`;
    }
    say(`${msg} (Drag the block down to feel buoyancy spike.)`);
  }

  const densitySlider = api.slider('Block density', {
    min: 100, max: 10000, step: 20, value: rhoBlock,
    fmt: (v) => (mysteryMode && !mysteryRevealed ? '? kg/m³ (Mystery)' : `${v.toLocaleString('en-GB')} kg/m³ (${materialName(v)})`),
    onInput: (v) => {
      if (mysteryMode) {
        mysteryMode = false;
        mysteryRevealed = false;
        mysteryBtn.setAttribute('aria-pressed', 'false');
        revealBtn.hidden = true;
      }
      for (const mark of [700, 920, 1000, 2700, 7800]) {
        if (Math.abs(v - mark) <= 35) { v = mark; break; }
      }
      rhoBlock = v;
      snapOrRelease();
    },
  });

  const liqTabs = api.tabs(LIQUIDS.map((l) => l.name), (i) => {
    liqIdx = i;
    snapOrRelease();
  }, 0);

  const hollowBtn = api.button('Hollow it out', () => {
    hollow = !hollow;
    hollowBtn.setAttribute('aria-pressed', String(hollow));
    hollowBtn.textContent = hollow ? 'Make it solid again' : 'Hollow it out';
    snapOrRelease();
  }, { pressed: false });

  const mysteryBtn = api.button('Mystery ? block', () => {
    mysteryMode = !mysteryMode;
    mysteryRevealed = false;
    mysteryBtn.setAttribute('aria-pressed', String(mysteryMode));
    revealBtn.hidden = !mysteryMode;
    revealBtn.setAttribute('aria-pressed', 'false');
    revealBtn.textContent = 'Reveal ? density';
    densitySlider.set(mysteryMode ? rhoBlock : rhoBlock);
    snapOrRelease();
  }, { pressed: false });

  const revealBtn = api.button('Reveal ? density', () => {
    mysteryRevealed = !mysteryRevealed;
    revealBtn.setAttribute('aria-pressed', String(mysteryRevealed));
    revealBtn.textContent = mysteryRevealed ? `${MYSTERY_DENSITY} kg/m³` : 'Reveal ? density';
    updateReadout();
    api.redraw?.();
  }, { pressed: false });
  revealBtn.hidden = true;

  api.onPrefs(() => { updateReadout(); api.redraw?.(); });

  api.onReset(
    () => { subVel = 0; subPos = Math.max(0.15, equilibriumPos() - 0.25); updateReadout(); api.redraw?.(); },
    () => {
      rhoBlock = 920; liqIdx = 0; hollow = false; mysteryMode = false; mysteryRevealed = false;
      liqTabs.setActive(0); densitySlider.set(920);
      hollowBtn.setAttribute('aria-pressed', 'false'); hollowBtn.textContent = 'Hollow it out';
      mysteryBtn.setAttribute('aria-pressed', 'false');
      revealBtn.hidden = true; revealBtn.setAttribute('aria-pressed', 'false'); revealBtn.textContent = 'Reveal ? density';
      subVel = 0; subPos = 0.92;
      updateReadout();
      api.redraw?.();
    }
  );

  // Direct block drag underwater / lift up
  k.cv.style.touchAction = 'none';
  let activeTop = 80, activeBot = 160, activeLeft = 140, activeRight = 240, activeBH = 64;
  const onPointerDown = (ev) => {
    const { lx, ly } = canvasPointerCoords(ev, k.cv, k.W, k.H);
    if (lx >= activeLeft - 12 && lx <= activeRight + 12 && ly >= activeTop - 12 && ly <= activeBot + 12) {
      draggingBlock = true;
      dragStartY = ly;
      dragStartSub = subPos;
      subVel = 0;
      k.cv.setPointerCapture?.(ev.pointerId);
      k.cv.style.cursor = 'grabbing';
    }
  };
  const onPointerMove = (ev) => {
    if (!draggingBlock) return;
    const { ly } = canvasPointerCoords(ev, k.cv, k.W, k.H);
    const nextSub = dragStartSub + (ly - dragStartY) / Math.max(20, activeBH);
    subPos = Math.max(0.05, Math.min(MAX_DEPTH_RATIO, nextSub));
    updateReadout();
    api.redraw?.();
  };
  const onPointerUp = (ev) => {
    if (!draggingBlock) return;
    draggingBlock = false;
    k.cv.style.cursor = 'grab';
    try { k.cv.releasePointerCapture?.(ev.pointerId); } catch (_) {}
  };
  k.cv.addEventListener('pointerdown', onPointerDown);
  k.cv.addEventListener('pointermove', onPointerMove);
  k.cv.addEventListener('pointerup', onPointerUp);
  k.cv.addEventListener('pointercancel', onPointerUp);
  api.onCleanup(() => {
    k.cv.removeEventListener('pointerdown', onPointerDown);
    k.cv.removeEventListener('pointermove', onPointerMove);
    k.cv.removeEventListener('pointerup', onPointerUp);
    k.cv.removeEventListener('pointercancel', onPointerUp);
  });

  api.sonify((dt, _t, prefs) => {
    if (dt <= 0 || !prefs.sonify) return;
    const spd = Math.abs(subVel);
    if (spd < 0.08) return;
    const nowMs = performance.now();
    if (nowMs - lastChimeAt < 180) return;
    lastChimeAt = nowMs;
    const ctx = api.audio()?.ctx;
    if (ctx) {
      const f = 190 + Math.min(1, subPos / MAX_DEPTH_RATIO) * 140;
      playTone(ctx, { freq: f, dur: 0.07, type: 'sine', gain: 0.025 });
    }
  });

  api.loop((dt) => {
    if (dt > 0) stepPhysics(dt);
    const c = simPalette(api);
    const rhoFluid = LIQUIDS[liqIdx].rho;
    const rhoEff = effectiveDensity();
    const fracSub = Math.max(0, Math.min(1, subPos));

    const V_block = hollow ? 1.0 : 0.1;
    const V_submerged = fracSub * V_block;
    const V_displaced = V_submerged;
    if (Math.abs(V_displaced - fracSub * V_block) > 1e-12) {
      console.error('Buoyancy displaced volume mismatch');
    }

    k.clear(c.plate);
    const ctx = k.ctx;

    const tankL = 44, tankR = 350, baseSurfY = 114, tankBot = 250;
    const waterRisePx = fracSub * (hollow ? 18 : 10);
    const surfY = baseSurfY - waterRisePx;
    const bW = hollow ? 116 : 78;
    const bH = hollow ? 76 : 64;
    const bx = (tankL + tankR - bW) * 0.5;

    let bBotY;
    if (subPos <= 1.0) {
      bBotY = surfY + subPos * bH;
    } else {
      const extra = (subPos - 1.0) / (MAX_DEPTH_RATIO - 1.0);
      bBotY = (surfY + bH) + extra * (tankBot - (surfY + bH));
    }
    const bTopY = bBotY - bH;
    activeLeft = bx; activeRight = bx + bW; activeTop = bTopY; activeBot = bBotY; activeBH = bH;

    // Tank volume graduated scale & base waterline tick
    ctx.strokeStyle = c.rule;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tankL, baseSurfY); ctx.lineTo(tankR, baseSurfY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.save();
    ctx.fillStyle = liqIdx === 2 ? c.ink : c.water;
    ctx.globalAlpha = liqIdx === 2 ? 0.35 : 0.22;
    ctx.fillRect(tankL, surfY, tankR - tankL, tankBot - surfY);
    ctx.restore();

    ctx.strokeStyle = c.water;
    ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.moveTo(tankL, surfY); ctx.lineTo(tankR, surfY); ctx.stroke();

    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(tankL, baseSurfY - 40);
    ctx.lineTo(tankL, tankBot);
    ctx.lineTo(tankR, tankBot);
    ctx.lineTo(tankR, baseSurfY - 40);
    ctx.stroke();

    // Submerged block
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.fillRect(bx, bTopY, bW, bH);
    ctx.strokeRect(bx, bTopY, bW, bH);

    const masked = mysteryMode && !mysteryRevealed;
    if (hollow) {
      ctx.fillStyle = c.plate;
      ctx.fillRect(bx + 7, bTopY + 4, bW - 14, bH - 11);
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 7, bTopY + 4, bW - 14, bH - 11);
      api.draw.text(ctx, 'hollow hull (10× vol)', bx + bW / 2, bTopY + 22, { size: 11, color: c.ink, align: 'center', weight: 600 });
    }

    const subHeightPx = Math.max(0, Math.min(bH, bBotY - surfY));
    if (subHeightPx > 0.5) {
      ctx.save();
      ctx.fillStyle = c.water;
      ctx.globalAlpha = hollow ? 0.08 : 0.25;
      ctx.fillRect(bx, bBotY - subHeightPx, bW, subHeightPx);
      ctx.restore();
    }
    hatch(ctx, bx + 2, bBotY - subHeightPx, bW - 4, subHeightPx, c.water, 9);
    if (hollow) api.draw.text(ctx, 'trapped air', bx + bW / 2, bTopY + bH * 0.65, { size: 12, color: c.muted, align: 'center' });

    // Architectural submerged percentage gauge using draft_canvas.drawDimension
    drawDimension(ctx, 26, surfY, 26, bBotY, `${Math.round(fracSub * 100)}%`, { color: c.ink, bg: c.plate });

    // Face pressure arrows
    const hTopPx = Math.max(0, bTopY - surfY);
    const hBotPx = Math.max(0, bBotY - surfY);
    const arrowK = 0.36;
    const topLen = hTopPx * arrowK;
    const botLen = Math.max(8, hBotPx * arrowK);
    if (topLen >= 4) {
      for (const ax of [bx + bW * 0.28, bx + bW * 0.72]) {
        api.draw.arrow(ctx, ax, bTopY - topLen - 2, ax, bTopY - 2, c.water, 1.8, 6);
      }
    }
    if (hBotPx > 2) {
      for (const ax of [bx + bW * 0.25, bx + bW * 0.5, bx + bW * 0.75]) {
        api.draw.arrow(ctx, ax, bBotY + botLen + 2, ax, bBotY + 2, c.water, 1.8, 6);
      }
    }
    for (const fracY of [0.35, 0.75]) {
      const py = bTopY + bH * fracY;
      if (py > surfY + 4) {
        const sLen = Math.min(28, (py - surfY) * arrowK);
        api.draw.arrow(ctx, bx - sLen - 2, py, bx - 2, py, c.water, 1.6, 5);
        api.draw.arrow(ctx, bx + bW + sLen + 2, py, bx + bW + 2, py, c.water, 1.6, 5);
      }
    }

    const netBuoyPx = Math.max(0, botLen - topLen);
    const weightPx = netBuoyPx * (rhoEff / (rhoFluid * Math.max(0.01, fracSub)));
    const midX = bx + bW / 2, midY = bTopY + bH / 2;
    if (netBuoyPx >= 3) {
      api.draw.arrow(ctx, midX - 16, midY, midX - 16, midY - Math.min(75, netBuoyPx * 2.2), c.force, 2.6, 8);
    }
    api.draw.arrow(ctx, midX + 16, midY, midX + 16, midY + Math.min(75, weightPx * 2.2), c.ink, 2.4, 8);
    if (!hollow) {
      ctx.save();
      ctx.fillStyle = c.sheet;
      ctx.globalAlpha = 0.92;
      api.draw.roundRect(ctx, bx + 5, bTopY + 5, bW - 10, 18, 4);
      ctx.fill();
      ctx.restore();
      api.draw.text(ctx, masked ? '? kg/m³' : `${activeDensity()} kg/m³`, bx + bW / 2, bTopY + 18, {
        size: 11, color: masked ? c.force : c.ink, align: 'center', weight: 700,
      });
    }

    // Right panel: Displaced liquid + exact Force bars
    const rx0 = 395;
    api.draw.text(ctx, 'Forces & displaced liquid', rx0 + 110, 28, { size: 13, color: c.ink, align: 'center', weight: 600 });

    const dispW = 68, dispMaxH = bH;
    const dispX = rx0 + 12, dispBotY = 148;
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(dispX, dispBotY - dispMaxH, dispW, dispMaxH);
    if (subHeightPx > 0) {
      ctx.save();
      ctx.fillStyle = liqIdx === 2 ? c.ink : c.water;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(dispX, dispBotY - subHeightPx, dispW, subHeightPx);
      ctx.restore();
    }
    api.draw.text(ctx, 'liquid displaced', dispX + dispW / 2, dispBotY + 16, { size: 11.5, color: c.muted, align: 'center' });
    api.draw.text(ctx, `${V_displaced.toFixed(3)} m³ displaced`, dispX + dispW / 2, dispBotY + 30, { size: 11.5, color: c.water, align: 'center', weight: 600 });

    const { weight: fWeight, buoyancy: fBuoy, support: fSupport } =
      buoyancyForceAccount(rhoEff, V_block, rhoFluid, V_submerged, !draggingBlock && subPos >= MAX_DEPTH_RATIO - 0.002);
    const fMax = Math.max(fWeight, fBuoy, 100);
    const barMaxW = 145;

    const drawBar = (y, labelText, val, col) => {
      const wBar = Math.max(3, (val / fMax) * barMaxW);
      api.draw.text(ctx, labelText, rx0, y - 6, { size: 12, color: c.ink, weight: 600 });
      ctx.fillStyle = col;
      ctx.fillRect(rx0, y, wBar, 16);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(rx0, y, wBar, 16);
      api.draw.text(ctx, `${(val / 1000).toFixed(1)} kN`, rx0 + wBar + 6, y + 12, { size: 11.5, color: c.ink });
    };

    drawBar(212, 'Weight: mass × g', fWeight, c.muted);
    drawBar(262, 'Buoyancy: liquid mass × g', fBuoy, c.force);
    drawBar(312, 'Floor support', fSupport, c.net);
    if (fSupport > 0) {
      api.draw.arrow(ctx, midX, Math.min(301, bBotY + 48), midX, bBotY, c.net, 3, 8);
      api.draw.text(ctx, 'floor support', midX + 12, Math.min(299, bBotY + 43), { size: 12, color: c.net });
    }

    api.draw.text(ctx, 'Marks: wood 700 · ice 920 · water 1,000 · aluminium 2,700 · steel 7,800 kg/m³', 320, 364, {
      size: 11.5, color: c.muted, align: 'center',
    });
  });

  snapOrRelease();
  return {
    getState() { return { rhoBlock, liqIdx, hollow, mysteryMode, mysteryRevealed, subPos }; },
    setState(patch = {}) {
      if (typeof patch.rhoBlock === 'number') { rhoBlock = patch.rhoBlock; densitySlider.set(rhoBlock); }
      if (typeof patch.liqIdx === 'number' && LIQUIDS[patch.liqIdx]) { liqIdx = patch.liqIdx; liqTabs.setActive(liqIdx); }
      if (typeof patch.hollow === 'boolean') {
        hollow = patch.hollow;
        hollowBtn.setAttribute('aria-pressed', String(hollow));
        hollowBtn.textContent = hollow ? 'Make it solid again' : 'Hollow it out';
      }
      if (typeof patch.mysteryMode === 'boolean') {
        mysteryMode = patch.mysteryMode;
        mysteryBtn.setAttribute('aria-pressed', String(mysteryMode));
        revealBtn.hidden = !mysteryMode;
      }
      if (typeof patch.mysteryRevealed === 'boolean') {
        mysteryRevealed = patch.mysteryRevealed;
        revealBtn.setAttribute('aria-pressed', String(mysteryRevealed));
        revealBtn.textContent = mysteryRevealed ? `${MYSTERY_DENSITY} kg/m³` : 'Reveal ? density';
      }
      if (typeof patch.subPos === 'number') { subPos = patch.subPos; subVel = 0; }
      else { subPos = equilibriumPos(); subVel = 0; }
      updateReadout();
      api.redraw?.();
    },
    destroy() {},
  };
}, { label: 'Drop it in' });
