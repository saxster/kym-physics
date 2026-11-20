// Ch 3.1 c3_tug_cart -> w_forces: Adding forces on a cart with sloshing water inertia & mystery box.
// Teaches that net force changes velocity, and balanced forces mean constant velocity (which may be non-zero).
import { Live } from './core.js';
import { mechanismKey, hatch } from './art_mechanics.js';
import { simPalette, drawVector, drawWaterBeaker, fmtSpeed, canvasPointerCoords } from './draft_canvas.js';
import { computeForcesState, beakerTiltEq } from './phet_models.mjs';
import { playClick } from './atlas/engine/sound.js';

const FRIC_MAX = 100; // N on rough floor
const SCALE_F = 1 / 3.9; // 1 px per 3.9 N, matching the still figure
const LOADS = [
  { label: '50 kg crate', mass: 50, mystery: false },
  { label: '100 kg steel', mass: 100, mystery: false },
  { label: 'Mystery ? kg', mass: 75, mystery: true },
];

Live.register('forces', (stage, params, api) => {
  const k = api.canvas(640, 272, 'A cart pulled left and right on a scrolling track, with dual-coded force/velocity arrows and an inertial water beaker');
  let pullL = 390;
  let pullR = 390;
  let rough = false;
  let loadIdx = 0;
  let mysteryMass = 75;
  let mysteryRevealed = false;
  let showWater = true;
  let x = 0; // m along track
  let v = 0; // m/s
  let tilt = 0;
  let tiltV = 0;
  let ripplePhase = 0;
  let sleeperAccum = 0;
  let dragSide = null; // 'L' | 'R' | null

  const say = api.readout();
  mechanismKey(stage, 'Follow the load and the water surface, not just the arrows', [
    'Force arrows have filled heads (dashed for friction, haloed for net force); velocity has an open chevron.',
    'The glass of water on the cart tilts ONLY when accelerating — at steady speed with zero net force, the water stays flat!',
  ]);

  const currentMass = () => (LOADS[loadIdx].mystery ? mysteryMass : LOADS[loadIdx].mass);

  function computeForces() {
    return computeForcesState({ pullL, pullR, rough, v, mass: currentMass(), fricMax: FRIC_MAX });
  }

  function stepPhysics(dtReal) {
    if (dtReal <= 0) return;
    let rem = dtReal;
    const h = 0.002;
    const mass = currentMass();
    while (rem > 1e-6) {
      const dt = Math.min(h, rem);
      rem -= dt;
      const { netPull, fNet, a } = computeForces();
      if (rough && Math.abs(v) > 1e-4) {
        const vNext = v + a * dt;
        if (v * vNext <= 0 && Math.abs(netPull) <= FRIC_MAX) {
          x += 0.5 * v * dt;
          v = 0;
          continue;
        }
      }
      v += a * dt;
      x += v * dt;
      // Damped harmonic slosh toward equilibrium tilt = atan(-a/g)
      const target = beakerTiltEq(a, 9.8);
      const omega = 11.5;
      const damp = 6.2;
      const dd = omega * omega * (target - tilt) - damp * tiltV;
      tiltV += dd * dt;
      tilt += tiltV * dt;
    }
    ripplePhase += dtReal * (1 + Math.min(4, Math.abs(computeForces().a) * 0.4));
  }

  function updateReadout() {
    const pal = simPalette(api);
    const { netPull, fFric, fNet, a } = computeForces();
    const mass = currentMass();
    const massLabel = LOADS[loadIdx].mystery && !mysteryRevealed ? 'mystery ? kg' : `${mass} kg`;
    const vAbs = Math.abs(v);
    const vDir = v > 0.02 ? 'to the right' : v < -0.02 ? 'to the left' : '';
    const vText = fmtSpeed(vAbs, api.prefs);
    let msg = '';

    if (rough && Math.abs(v) <= 0.02 && Math.abs(netPull) > 0 && Math.abs(netPull) <= FRIC_MAX) {
      msg = `Net pull ${Math.abs(netPull)} N ${netPull > 0 ? 'to the right' : 'to the left'}, but static friction (${Math.abs(fFric)} N) cancels it. Nothing moves until the pull beats 100 N.`;
    } else if (Math.abs(fNet) < 0.5) {
      if (vAbs < 0.02) {
        msg = `Net force 0 on the ${massLabel} cart. At rest, it stays at rest (water flat).`;
      } else {
        msg = `Net force 0. The ${massLabel} cart keeps its velocity: ${vText} ${vDir} (water stays flat!).`;
      }
    } else {
      const fDir = fNet > 0 ? 'to the right' : 'to the left';
      const action = vAbs < 0.02 || v * fNet >= 0 ? 'speeds up' : 'slows down';
      const vPart = vAbs >= 0.02 ? ` Current velocity: ${vText} ${vDir}.` : '';
      msg = `Net force ${Math.round(Math.abs(fNet))} N ${fDir} on the ${massLabel} cart. The cart ${action} at ${Math.abs(a).toFixed(2)} m/s².${vPart}`;
    }
    say(`${msg} (a = F_net ÷ m; water tilts only when a ≠ 0.)`);
    return pal;
  }

  const leftSlider = api.slider('Pull to the left', {
    min: 0, max: 500, step: 10, value: pullL,
    fmt: (val) => `${val} N`,
    onInput: (val) => { pullL = val; updateReadout(); },
  });

  const rightSlider = api.slider('Pull to the right', {
    min: 0, max: 500, step: 10, value: pullR,
    fmt: (val) => `${val} N`,
    onInput: (val) => { pullR = val; updateReadout(); },
  });

  // Tab group 0 MUST remain floor friction so existing challenges stay green!
  const floorTabs = api.tabs(['Smooth floor', 'Rough floor (100 N)'], (i) => {
    rough = i === 1;
    updateReadout();
  }, 0);

  // Tab group 1: Selectable load + Mystery ? kg box
  const loadTabs = api.tabs(LOADS.map((l) => l.label), (i) => {
    loadIdx = i;
    revealBtn.hidden = !LOADS[i].mystery;
    updateReadout();
  }, 0);

  const waterBtn = api.button('Water inertia', () => {
    showWater = !showWater;
    waterBtn.setAttribute('aria-pressed', String(showWater));
    api.redraw?.();
  }, { pressed: true });

  const revealBtn = api.button('Reveal ? mass', () => {
    mysteryRevealed = !mysteryRevealed;
    revealBtn.setAttribute('aria-pressed', String(mysteryRevealed));
    revealBtn.textContent = mysteryRevealed ? `Mass = ${mysteryMass} kg` : 'Reveal ? mass';
    updateReadout();
    api.redraw?.();
  }, { pressed: false });
  revealBtn.hidden = true;

  api.onPrefs(() => {
    updateReadout();
    api.redraw?.();
  });

  // Unified transport reset hooks
  api.onReset(
    () => {
      v = 0; x = 0; tilt = 0; tiltV = 0;
      updateReadout();
      api.redraw?.();
    },
    () => {
      pullL = 390; pullR = 390; rough = false;
      floorTabs.setActive(0);
      v = 0; x = 0; tilt = 0; tiltV = 0;
      mysteryRevealed = false;
      showWater = true;
      waterBtn.setAttribute('aria-pressed', 'true');
      loadTabs.setActive(0);
      loadIdx = 0;
      revealBtn.hidden = true;
      revealBtn.setAttribute('aria-pressed', 'false');
      revealBtn.textContent = 'Reveal ? mass';
      updateReadout();
      api.redraw?.();
    }
  );

  // Direct canvas drag on left/right pull vector tips
  const cx = 320, cw = 76, ch = 44, groundY = 194;
  const cy = groundY - ch - 14;
  const midY = cy + ch * 0.5;

  const toLogical = (ev) => canvasPointerCoords(ev, k.cv, k.W, k.H);

  k.cv.style.touchAction = 'none';
  const onPointerDown = (ev) => {
    const { lx, ly } = toLogical(ev);
    const tipL = cx - cw / 2 - pullL * SCALE_F;
    const tipR = cx + cw / 2 + pullR * SCALE_F;
    if (Math.abs(ly - midY) < 26) {
      if (Math.abs(lx - tipL) < 24 || (lx < cx - cw / 2 && lx > tipL - 20)) dragSide = 'L';
      else if (Math.abs(lx - tipR) < 24 || (lx > cx + cw / 2 && lx < tipR + 20)) dragSide = 'R';
      if (dragSide) {
        k.cv.setPointerCapture?.(ev.pointerId);
        k.cv.style.cursor = 'grabbing';
      }
    }
  };
  const onPointerMove = (ev) => {
    if (!dragSide) return;
    const { lx } = toLogical(ev);
    if (dragSide === 'L') {
      const n = Math.round(Math.max(0, Math.min(500, ((cx - cw / 2) - lx) / SCALE_F)) / 10) * 10;
      leftSlider.drive(n, 'user');
    } else {
      const n = Math.round(Math.max(0, Math.min(500, (lx - (cx + cw / 2)) / SCALE_F)) / 10) * 10;
      rightSlider.drive(n, 'user');
    }
  };
  const onPointerUp = (ev) => {
    if (!dragSide) return;
    dragSide = null;
    k.cv.style.cursor = 'default';
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

  // Opt-in sonification: soft wheel-sleeper pulse rate proportional to |v|
  api.sonify((dt, _t, prefs) => {
    if (dt <= 0 || !prefs.sonify) { sleeperAccum = 0; return; }
    const speed = Math.abs(v);
    if (speed < 0.08) return;
    sleeperAccum += speed * dt;
    if (sleeperAccum >= 0.5) {
      sleeperAccum %= 0.5;
      const ctx = api.audio()?.ctx;
      if (ctx) playClick(ctx, { dir: v >= 0 ? 1 : -1, gain: 0.032 });
    }
  });

  api.loop((dt) => {
    if (dt > 0) {
      stepPhysics(dt);
      updateReadout();
    }
    const pal = simPalette(api);
    k.clear(pal.plate);
    const ctx = k.ctx;
    const { fFric, fNet, a } = computeForces();

    // Track at y = 194, scrolling with x (60 px per metre)
    const pxPerM = 60;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, groundY);
    ctx.lineTo(616, groundY);
    ctx.stroke();

    // Scrolling sleeper marks along the floor so motion is unmistakable even when F_net = 0
    const spacing = 30; // 0.5 m
    const offset = ((x * pxPerM) % spacing + spacing) % spacing;
    ctx.strokeStyle = rough ? pal.friction : pal.muted;
    ctx.lineWidth = rough ? 1.8 : 1.2;
    for (let gx = 30 - offset; gx < 610; gx += spacing) {
      if (gx < 24) continue;
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx - 8, groundY + 10);
      ctx.stroke();
    }
    if (rough) {
      api.draw.text(ctx, 'rough floor (up to 100 N friction)', 24, 260, { size: 11.5, color: pal.muted });
    }

    // Cart centred at cx = 320
    ctx.fillStyle = pal.sheet;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2;
    api.draw.roundRect(ctx, cx - cw / 2, cy, cw, ch, 4);
    ctx.fill();
    ctx.stroke();
    hatch(ctx, cx - cw / 2 + 3, cy + 3, cw - 6, 9, pal.muted, 6);
    ctx.strokeStyle = pal.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 26, cy + 13);
    ctx.lineTo(cx + 26, cy + 13);
    ctx.stroke();

    const loadLabel = LOADS[loadIdx].mystery && !mysteryRevealed ? '? kg' : `${currentMass()} kg`;
    api.draw.text(ctx, loadLabel, cx, cy + 28, { size: 13, color: pal.ink, align: 'center', weight: 600 });

    // Sloshing inertial water beaker mounted on top of the cart
    if (showWater) {
      drawWaterBeaker(ctx, cx - 21, cy - 30, 42, 28, tilt, ripplePhase, pal);
      if (Math.abs(a) < 0.05 && Math.abs(v) > 0.1) {
        api.draw.text(ctx, 'a = 0 → level water', cx, cy - 36, { size: 10.5, color: pal.net, align: 'center', weight: 600 });
      }
    }

    // Wheels
    const wheelRot = (x * pxPerM) / 7;
    for (const wx of [cx - cw / 2 + 15, cx + cw / 2 - 15]) {
      const wy = groundY - 7;
      ctx.beginPath();
      ctx.arc(wx, wy, 7, 0, Math.PI * 2);
      ctx.fillStyle = pal.sheet;
      ctx.fill();
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wx - 5 * Math.cos(wheelRot), wy - 5 * Math.sin(wheelRot));
      ctx.lineTo(wx + 5 * Math.cos(wheelRot), wy + 5 * Math.sin(wheelRot));
      ctx.stroke();
    }

    // Velocity vector above beaker/cart (dual-coded open chevron)
    const vAbs = Math.abs(v);
    const vY = showWater ? cy - 58 : cy - 22;
    if (vAbs >= 0.05) {
      const vLen = Math.min(180, Math.max(18, vAbs * 18)) * Math.sign(v);
      drawVector(ctx, cx, vY, cx + vLen, vY, { kind: 'velocity', color: pal.velocity, width: 2.3, head: 8.5 });
      api.draw.text(ctx, `v = ${v < 0 ? '−' : ''}${fmtSpeed(vAbs, api.prefs)}`, cx + vLen * 0.5, vY - 10, {
        size: 12, color: pal.velocity, align: 'center', weight: 600,
      });
    } else {
      api.draw.text(ctx, `v = ${fmtSpeed(0, api.prefs)}`, cx, vY - 2, { size: 12, color: pal.muted, align: 'center' });
    }
    if (vAbs > 10) api.draw.text(ctx, 'velocity arrow at display limit', 320, 20, { size: 11, color: pal.muted, align: 'center' });

    // Left pull vector + draggable handle ring
    if (pullL > 0) {
      const lenL = pullL * SCALE_F;
      const tipL = cx - cw / 2 - lenL;
      drawVector(ctx, cx - cw / 2, midY, tipL, midY, { kind: 'force', color: pal.force, width: 2.6, head: 9 });
      api.draw.text(ctx, `${pullL} N`, cx - cw / 2 - lenL * 0.5, midY - 11, {
        size: 12.5, color: pal.force, align: 'center', weight: 600,
      });
      ctx.beginPath();
      ctx.arc(tipL, midY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = pal.sheet; ctx.fill();
      ctx.strokeStyle = pal.force; ctx.lineWidth = 1.6; ctx.stroke();
    }

    // Right pull vector + draggable handle ring
    if (pullR > 0) {
      const lenR = pullR * SCALE_F;
      const tipR = cx + cw / 2 + lenR;
      drawVector(ctx, cx + cw / 2, midY, tipR, midY, { kind: 'force', color: pal.force, width: 2.6, head: 9 });
      api.draw.text(ctx, `${pullR} N`, cx + cw / 2 + lenR * 0.5, midY - 11, {
        size: 12.5, color: pal.force, align: 'center', weight: 600,
      });
      ctx.beginPath();
      ctx.arc(tipR, midY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = pal.sheet; ctx.fill();
      ctx.strokeStyle = pal.force; ctx.lineWidth = 1.6; ctx.stroke();
    }

    // Dashed friction arrow at the wheels; place text below sleepers to avoid wheel overlap
    if (Math.abs(fFric) > 0.5) {
      const lenF = fFric * SCALE_F;
      drawVector(ctx, cx, groundY + 1, cx + lenF, groundY + 1, { kind: 'friction', color: pal.friction, width: 2.2, head: 7.5 });
      api.draw.text(ctx, `friction ${Math.round(Math.abs(fFric))} N`, cx + lenF * 0.5, groundY + 21, {
        size: 11.5, color: pal.friction, align: 'center', weight: 600,
      });
    }

    // Haloed Net-force arrow below the cart
    const netY = 236;
    if (Math.abs(fNet) > 0.5) {
      const lenNet = fNet * SCALE_F;
      drawVector(ctx, cx, netY, cx + lenNet, netY, { kind: 'net', color: pal.net, width: 2.8, head: 9 });
      api.draw.text(ctx, `net ${Math.round(Math.abs(fNet))} N`, cx + lenNet + (fNet > 0 ? 8 : -8), netY + 4, {
        size: 12.5, color: pal.net, align: fNet > 0 ? 'left' : 'right', weight: 700,
      });
    } else {
      api.draw.text(ctx, 'net force 0 N', cx, netY + 4, { size: 12.5, color: pal.ink, align: 'center', weight: 600 });
    }

    // Acceleration gauge pill in top-right corner
    const aText = `a = ${a >= 0 ? '+' : '−'}${Math.abs(a).toFixed(2)} m/s²`;
    api.draw.text(ctx, aText, 614, 22, { size: 11.5, color: Math.abs(a) > 0.02 ? pal.accel : pal.muted, align: 'right', weight: 600 });
  });

  updateReadout();
  return {
    getState() {
      return { pullL, pullR, rough, loadIdx, mysteryMass, mysteryRevealed, showWater, v, x };
    },
    setState(patch = {}) {
      if (typeof patch.pullL === 'number') { pullL = patch.pullL; leftSlider.set(pullL); }
      if (typeof patch.pullR === 'number') { pullR = patch.pullR; rightSlider.set(pullR); }
      if (typeof patch.rough === 'boolean') { rough = patch.rough; floorTabs.setActive(rough ? 1 : 0); }
      if (typeof patch.loadIdx === 'number' && LOADS[patch.loadIdx]) {
        loadIdx = patch.loadIdx;
        loadTabs.setActive(loadIdx);
        revealBtn.hidden = !LOADS[loadIdx].mystery;
      }
      if (typeof patch.mysteryMass === 'number') mysteryMass = patch.mysteryMass;
      if (typeof patch.mysteryRevealed === 'boolean') {
        mysteryRevealed = patch.mysteryRevealed;
        revealBtn.setAttribute('aria-pressed', String(mysteryRevealed));
        revealBtn.textContent = mysteryRevealed ? `Mass = ${mysteryMass} kg` : 'Reveal ? mass';
      }
      if (typeof patch.showWater === 'boolean') {
        showWater = patch.showWater;
        waterBtn.setAttribute('aria-pressed', String(showWater));
      }
      if (typeof patch.v === 'number') v = patch.v;
      if (typeof patch.x === 'number') x = patch.x;
      tilt = beakerTiltEq(computeForces().a, 9.8);
      tiltV = 0;
      updateReadout();
    },
    destroy() {},
  };
}, { label: 'Pull the cart' });
