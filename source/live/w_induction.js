// 13.5 Electromagnetic induction: Faraday's law e = -N dPhi/dt, Lenz's law, zero when still inside coil, and 4 s strip trace.
import { Live } from './core.js';
import { note, label } from './art_waves.js';

const TURNS_CHOICES = [1, 10, 50, 200];
const METRES_PER_PX = 0.001; // Drawing scale: 100 px = 0.10 m.
const NUDGE_SPEED_PX = 360; // 180 px (0.18 m) in a half-second stroke.

Live.register('induction', (stage, params, api) => {
  const c = api.colors();
  note(stage,'The coil is a cut-away: drawn turns represent the selected total turn count. A held magnet produces no sustained voltage. Moving it changes the field through the coil; reversing the change reverses the pulse.');
  const W = 640, H = 340;
  const k = api.canvas(W, H, 'A bar magnet movable into and out of a coil connected to a centre-zero galvanometer and a 4-second voltage trace');

  const COIL_X = 390, COIL_Y = 148, COIL_A = 56; // px (100 px = 0.10 m, so 1 px = 1 mm)
  let magX = 210; // magnet centre x (180 px left of coil centre)
  let prevMagX = magX;
  let turnsIdx = 2; // default 50 turns
  let flipped = false; // false: N on right (facing coil); true: S on right

  // Nudge stroke animation state (0.5 s in at 0.36 m/s, pause, 0.5 s out)
  let nudgeDir = 0; // +1 = nudging in, -1 = nudging out, 0 = idle
  let nudgeTimer = 0;
  let nextNudgeIn = true;

  // Current induced emf (mV) and 4-second rolling history [{t, emf}]
  let simT = 0;
  let curEmf = 0;
  let curVelMs = 0;
  let netIntegral = 0; // integral of e dt = -N (Phi(x) - Phi(x0)), exactly 0 on returning to x0
  const history = [];

  // Pre-seed history with a completed in-pause-out stroke so the opening frame already shows the two cancelling pulses and flat zero!
  (function seedHistory() {
    const N = TURNS_CHOICES[turnsIdx];
    const dt = 0.025;
    let x = 210;
    for (let i = 0; i <= 160; i++) {
      const t = -4.0 + i * dt;
      let xNext = x;
      if (t >= -3.4 && t < -2.9) xNext = 210 + ((t + 3.4) / 0.5) * 180; // stroke in to coil centre (x = 390)
      else if (t >= -2.9 && t < -1.9) xNext = 390; // held still inside coil: zero!
      else if (t >= -1.9 && t < -1.4) xNext = 390 - ((t + 1.9) / 0.5) * 180; // stroke out back to 210
      else xNext = 210;
      const dPhi = fluxAt(xNext, N, false) - fluxAt(x, N, false);
      const emf = -dPhi / dt;
      history.push({ t, emf });
      x = xNext;
    }
  })();

  function fluxAt(xPx, N, isFlipped) {
    // Dipole on axis: Phi(x) = Phi0 * (1 + ((x - COIL_X)/a)^2)^(-3/2)
    // Illustrative flux model, in milliwebers per turn; its time derivative is in mV.
    // At the 0.36 m/s nudge speed and N = 50, peak emf is about 3.3 mV.
    const u = (xPx - COIL_X) / COIL_A;
    const sign = isFlipped ? -1 : 1;
    const phiSingle = 0.012 * sign * Math.pow(1 + u * u, -1.5);
    return N * phiSingle;
  }

  const say = api.readout();

  // Control 1: Nudge in / Nudge out button (plus direct pointer drag and arrow keys on canvas)
  const nudgeBtn = api.button('Nudge in / out', () => {
    nudgeDir = nextNudgeIn ? 1 : -1;
    nextNudgeIn = !nextNudgeIn;
    nudgeTimer = 0.5;
  });

  // Control 2: Turns slider (1, 10, 50, 200)
  api.slider('Turns', {
    min: 0, max: 3, step: 1, value: turnsIdx,
    fmt: (v) => `${TURNS_CHOICES[v]} turns`,
    onInput: (v) => {
      turnsIdx = v;
      drawFrame(0);
    },
  });

  // Control 3: Flip magnet button
  const flipBtn = api.button('Flip magnet (N ↔ S)', () => {
    flipped = !flipped;
    flipBtn.setAttribute('aria-pressed', String(flipped));
    drawFrame(0);
  }, { pressed: false });

  // Pointer drag and keyboard arrows for the magnet
  let dragging = false;
  let dragOffset = 0;
  k.cv.style.cursor = 'grab';
  k.cv.tabIndex = 0;
  k.cv.addEventListener('pointerdown', (e) => {
    const r = k.cv.getBoundingClientRect();
    const px = ((e.clientX - r.left) / (r.width || W)) * W;
    const py = ((e.clientY - r.top) / (r.height || H)) * H;
    if (Math.abs(px - magX) < 75 && Math.abs(py - COIL_Y) < 40) {
      dragging = true;
      nudgeTimer = 0;
      dragOffset = px - magX;
      k.cv.setPointerCapture(e.pointerId);
    }
  });
  k.cv.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const r = k.cv.getBoundingClientRect();
    const px = ((e.clientX - r.left) / (r.width || W)) * W;
    magX = Math.max(95, Math.min(520, px - dragOffset));
  });
  k.cv.addEventListener('pointerup', () => { dragging = false; });
  k.cv.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { magX = Math.min(520, magX + 12); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { magX = Math.max(95, magX - 12); e.preventDefault(); }
  });

  function updateReadout() {
    const N = TURNS_CHOICES[turnsIdx];
    const ratio50 = N / 50;
    const ratioText = N === 50 ? 'baseline 50-turn scale' : `${ratio50 >= 1 ? ratio50 : `1/${50 / N}`} times the 50-turn kick`;
    const inside = Math.abs(magX - COIL_X) < 35;

    let motionSentence = '';
    if (Math.abs(curVelMs) < 0.005) {
      motionSentence = inside
        ? 'Magnet held still inside the coil: 0.0 mV, however strong the magnet.'
        : 'Magnet at rest: 0.0 mV (current appears only while the flux through the coil is changing).';
    } else {
      const approaching = (magX < COIL_X && curVelMs > 0) || (magX > COIL_X && curVelMs < 0);
      const kickDir = curEmf >= 0 ? 'right (+)' : 'left (−)';
      const lenzAction = approaching
        ? 'the induced current pushes back on the approaching magnet'
        : 'the induced current pulls back on the leaving magnet';
      motionSentence = `Moving ${approaching ? 'in' : 'out'} at ${Math.abs(curVelMs).toFixed(2)} m/s: the needle kicks ${kickDir} (${curEmf.toFixed(1)} mV) and ${lenzAction}.`;
    }

    say(
      `${motionSentence} (${N} turns: ${ratioText}; a hand-moved magnet will not light an LED, so we use a sensitive meter.) ` +
      `The meter responds instantly here; a real needle lags a little. Faraday's needle in 1831 did the same two opposite kicks, whose areas cancel to zero.`
    );
  }

  function drawFrame(dt) {
    const N = TURNS_CHOICES[turnsIdx];
    if (dt > 0) {
      simT += dt;
      if (nudgeTimer > 0) {
        const step = Math.min(dt, nudgeTimer);
        // At the drawing scale, 360 px/s = 0.36 m/s; 0.5 s covers 0.18 m.
        magX = Math.max(95, Math.min(520, magX + nudgeDir * NUDGE_SPEED_PX * step));
        nudgeTimer -= step;
        if (nudgeTimer <= 0) nudgeDir = 0;
      }
      const dxPx = magX - prevMagX;
      curVelMs = (dxPx / dt) * METRES_PER_PX;
      // Finite-difference Faraday's law: e = -N dPhi/dt
      const phiNow = fluxAt(magX, N, flipped);
      const phiPrev = fluxAt(prevMagX, N, flipped);
      curEmf = Math.abs(dxPx) < 1e-5 ? 0 : -(phiNow - phiPrev) / dt;
      netIntegral = -(phiNow - fluxAt(210, N, flipped));
      prevMagX = magX;

      history.push({ t: simT, emf: curEmf });
      while (history.length && history[0].t < simT - 4.0) history.shift();
    } else {
      curEmf = 0;
      curVelMs = 0;
    }

    const ctx = k.ctx;
    k.clear(c.plate);

    // Field-through-the-loop cue: flux linkage is a model value, not a voltage.
    const linked=fluxAt(magX,N,flipped);
    label(ctx,c,`Flux linkage NΦ: ${linked.toFixed(2)} mWb`,22,24,{size:12,weight:600});
    label(ctx,c,'Voltage responds to its rate of change.',22,44,{size:11,color:c.muted});
    ctx.save();ctx.globalAlpha=.15;ctx.fillStyle=c.electron;ctx.beginPath();ctx.ellipse(COIL_X,COIL_Y,15,36,0,0,2*Math.PI);ctx.fill();ctx.restore();

    // 1. Top: Centre-zero galvanometer wired to the coil
    const meterX = COIL_X, meterY = 58, meterR = 42;
    // Leads from coil to meter
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(COIL_X - 42, COIL_Y - 38);
    ctx.lineTo(COIL_X - 42, meterY);
    ctx.lineTo(meterX - meterR, meterY);
    ctx.moveTo(COIL_X + 42, COIL_Y - 38);
    ctx.lineTo(COIL_X + 42, meterY);
    ctx.lineTo(meterX + meterR, meterY);
    ctx.stroke();

    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.8;
    api.draw.roundRect(ctx, meterX - 58, 12, 116, 66, 8);
    ctx.fill();
    ctx.stroke();

    // Scale arc and zero mark
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(meterX, 66, 38, -Math.PI * 0.82, -Math.PI * 0.18);
    ctx.stroke();
    api.draw.text(ctx, '0', meterX, 24, { size: 10.5, color: c.ink, align: 'center', weight: 700 });
    api.draw.text(ctx, '−', meterX - 34, 34, { size: 11, color: c.electron, align: 'center', weight: 700 });
    api.draw.text(ctx, '+', meterX + 34, 34, { size: 11, color: c.proton, align: 'center', weight: 700 });

    // Rescale full-scale deflection proportionally with N so trace/meter stays readable while showing true mV
    const maxScaleMv = Math.max(1.5, (N / 50) * 25);
    const normDefl = Math.max(-1, Math.min(1, curEmf / maxScaleMv));
    const needleAng = -Math.PI / 2 + normDefl * 0.95;
    ctx.strokeStyle = c.proton;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(meterX, 66);
    ctx.lineTo(meterX + 34 * Math.cos(needleAng), 66 + 34 * Math.sin(needleAng));
    ctx.stroke();
    api.draw.text(ctx, `${curEmf >= 0 ? '+' : ''}${curEmf.toFixed(1)} mV`, meterX + 74, 48, {
      size: 12, color: c.proton, weight: 700,
    });

    // 2. Middle: Bar magnet (draggable) and Coil of wire
    // Draw back halves of coil turns
    const nVisTurns = turnsIdx === 0 ? 1 : turnsIdx === 1 ? 5 : turnsIdx === 2 ? 9 : 14;
    ctx.strokeStyle = '#b87333';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < nVisTurns; i++) {
      const tx = COIL_X - 42 + (nVisTurns === 1 ? 42 : (i / (nVisTurns - 1)) * 84);
      ctx.beginPath();
      ctx.ellipse(tx, COIL_Y, 10, 40, 0, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }

    // Draw Bar Magnet (width 116, height 34)
    const magW = 116, magH = 34;
    const rightColor = flipped ? c.electron : c.proton;
    const leftColor = flipped ? c.proton : c.electron;
    const rightPole = flipped ? 'S' : 'N';
    const leftPole = flipped ? 'N' : 'S';

    ctx.fillStyle = leftColor;
    ctx.fillRect(magX - magW / 2, COIL_Y - magH / 2, magW / 2, magH);
    ctx.fillStyle = rightColor;
    ctx.fillRect(magX, COIL_Y - magH / 2, magW / 2, magH);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(magX - magW / 2, COIL_Y - magH / 2, magW, magH);
    api.draw.text(ctx, leftPole, magX - magW / 4, COIL_Y + 5, { size: 13, color: '#fff', align: 'center', weight: 700 });
    api.draw.text(ctx, rightPole, magX + magW / 4, COIL_Y + 5, { size: 13, color: '#fff', align: 'center', weight: 700 });
    api.draw.text(ctx, 'drag magnet left / right', magX, COIL_Y + 32, { size: 10.5, color: c.muted, align: 'center' });

    // Draw front halves of coil turns (over the magnet so magnet passes inside the coil!)
    ctx.strokeStyle = '#d28a47';
    ctx.lineWidth = 2.6;
    for (let i = 0; i < nVisTurns; i++) {
      const tx = COIL_X - 42 + (nVisTurns === 1 ? 42 : (i / (nVisTurns - 1)) * 84);
      ctx.beginPath();
      ctx.ellipse(tx, COIL_Y, 10, 40, 0, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.stroke();
    }

    // Lenz's law current direction arrow on the front of the coil when curEmf != 0
    if (Math.abs(curEmf) > 0.05) {
      const up = curEmf > 0;
      api.draw.arrow(ctx, COIL_X, COIL_Y + (up ? 22 : -22), COIL_X, COIL_Y + (up ? -22 : 22), c.proton, 2.6, 8);
      api.draw.text(ctx, 'induced I (Lenz)', COIL_X + 58, COIL_Y + 4, { size: 10.5, color: c.proton, weight: 600 });
    }

    // 3. Bottom: 4-second strip chart of induced voltage e(t) showing two opposite pulses cancelling to 0
    const plotL = 56, plotR = W - 24, plotTop = 216, plotH = 104, plotMid = plotTop + plotH / 2;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    ctx.fillRect(plotL, plotTop, plotR - plotL, plotH);
    ctx.strokeRect(plotL, plotTop, plotR - plotL, plotH);

    ctx.beginPath();
    ctx.moveTo(plotL, plotMid);
    ctx.lineTo(plotR, plotMid);
    ctx.stroke();
    api.draw.text(ctx, '0 mV', plotL - 8, plotMid + 4, { size: 10.5, color: c.muted, align: 'right' });
    api.draw.text(ctx, 'Induced voltage over the last 4 s (in-and-out pulses cancel; held still = 0)', plotL + 8, plotTop + 15, {
      size: 11, color: c.ink, weight: 600,
    });

    if (history.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < history.length; i++) {
        const pt = history[i];
        const x = plotR - ((simT - pt.t) / 4.0) * (plotR - plotL);
        const y = plotMid - Math.max(-1, Math.min(1, pt.emf / maxScaleMv)) * (plotH * 0.42);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = c.proton;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    updateReadout();
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() {} };
}, { label: 'Move the magnet' });
