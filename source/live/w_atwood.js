// Ch 3.4 c3_atwood -> w_atwood: George Atwood's 1784 gravity-diluting pulley machine.
// Coupled masses m1 and m2 on a massless, frictionless pulley, plus "Unfolded rope" view and Tension Sandwich bar.
import { Live } from './core.js';
import { mechanismKey, hatch } from './art_mechanics.js';

const G = 9.8;

Live.register('atwood', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 275, 'George Atwood pulley machine with coupled masses, unfolded 1D rope diagram, and tension sandwich gauge');
  let m1 = 0.55; // kg (left block)
  let m2 = 0.45; // kg (right block)
  let viewMode = 0; // 0 = Pulley + Unfolded, 1 = Unfolded focus
  let pos = 0;   // m displacement of m1 downward (-0.42..+0.42 m)
  let vel = 0;   // m/s downward for m1
  const MAX_POS = 0.42;
  const say = api.readout();

  mechanismKey(stage, 'Coupled inertia & the Tension Sandwich', [
    'The net driving pull is the weight difference (m₁ − m₂)g, but the rope forces both blocks (m₁ + m₂) to accelerate together.',
    'Tension T is always sandwiched strictly between the lighter weight and the heavier weight so both blocks accelerate the right way.',
  ]);

  stage.style.position = 'relative';
  const releaseBtn = document.createElement('button');
  releaseBtn.type = 'button';
  releaseBtn.className = 'live-ctl';
  releaseBtn.textContent = 'Release from middle';
  releaseBtn.style.cssText = 'position:absolute;top:10px;right:12px;z-index:2;font-size:12px;padding:3px 9px;';
  releaseBtn.addEventListener('click', () => {
    pos = 0;
    vel = 0;
    updateReadout();
  });
  stage.appendChild(releaseBtn);

  function computeAtwood() {
    const w1 = m1 * G;
    const w2 = m2 * G;
    const mTot = m1 + m2;
    const fNet = w1 - w2;
    const a = fNet / mTot; // positive = m1 downward, m2 upward
    const T = (2 * m1 * m2 * G) / mTot;
    return { w1, w2, mTot, fNet, a, T };
  }

  function updateReadout() {
    const { w1, w2, mTot, fNet, a, T } = computeAtwood();
    if (Math.abs(m1 - m2) < 1e-4) {
      say(
        `Balanced: m₁ = m₂ = ${m1.toFixed(2)} kg (weights ${w1.toFixed(2)} N each). Net force = 0 N, acceleration a = 0 m/s², ` +
        `and string tension T = ${T.toFixed(2)} N equals both weights.`
      );
    } else {
      const dir = a > 0 ? 'm₁ descends, m₂ rises' : 'm₂ descends, m₁ rises';
      const wMin = Math.min(w1, w2);
      const wMax = Math.max(w1, w2);
      say(
        `Net pull |m₁ − m₂|g = ${Math.abs(fNet).toFixed(2)} N ÷ total mass (m₁ + m₂ = ${mTot.toFixed(2)} kg) → ` +
        `a = ${Math.abs(a).toFixed(2)} m/s² (${((Math.abs(a) / G) * 100).toFixed(0)}% of g; ${dir}). ` +
        `Tension T = ${T.toFixed(2)} N sits inside ${wMin.toFixed(2)} N < T < ${wMax.toFixed(2)} N.`
      );
    }
  }

  api.slider('Left mass m₁', {
    min: 0.20, max: 1.00, step: 0.05, value: m1,
    fmt: (v) => `${v.toFixed(2)} kg`,
    onInput: (v) => { m1 = v; pos = 0; vel = 0; updateReadout(); },
  });

  api.slider('Right mass m₂', {
    min: 0.20, max: 1.00, step: 0.05, value: m2,
    fmt: (v) => `${v.toFixed(2)} kg`,
    onInput: (v) => { m2 = v; pos = 0; vel = 0; updateReadout(); },
  });

  api.tabs(['Pulley + Unfolded view', 'Tension Sandwich close-up'], (i) => {
    viewMode = i;
    updateReadout();
  }, 0);

  api.loop((dt) => {
    const { w1, w2, mTot, fNet, a, T } = computeAtwood();
    if (dt > 0) {
      if (Math.abs(pos) < MAX_POS || pos * a < 0) {
        vel += a * dt * 0.45; // gentle visual time scale
        pos += vel * dt * 0.45;
        if (pos >= MAX_POS) { pos = MAX_POS; vel = 0; }
        if (pos <= -MAX_POS) { pos = -MAX_POS; vel = 0; }
      }
    }

    k.clear(c.plate);
    const ctx = k.ctx;

    // Divider
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(270, 16);
    ctx.lineTo(270, 258);
    ctx.stroke();

    // ---- Left panel: Animated Pulley & Hanging Masses
    const px = 135, py = 68, pr = 34;
    hatch(ctx, 85, 22, 100, 10, c.muted, 8);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(85, 32); ctx.lineTo(185, 32);
    ctx.stroke();

    // Axle mount
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.6;
    ctx.fillRect(px - 5, 32, 10, py - 32);
    ctx.strokeRect(px - 5, 32, 10, py - 32);

    // Wheel with spokes rotating with pos
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = c.sheet;
    ctx.fill();
    ctx.stroke();

    const wheelAng = -(pos / 0.15);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(wheelAng);
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.2;
    for (let kSpoke = 0; kSpoke < 4; kSpoke++) {
      const ang = (kSpoke * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * (pr - 4), Math.sin(ang) * (pr - 4));
      ctx.stroke();
    }
    ctx.restore();

    const xL = px - pr, xR = px + pr;
    const yMid = 168;
    const pxPerM = 95;
    const y1 = yMid + pos * pxPerM;
    const y2 = yMid - pos * pxPerM;

    // Ropes
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(xL, py); ctx.lineTo(xL, y1);
    ctx.moveTo(xR, py); ctx.lineTo(xR, y2);
    ctx.stroke();

    // Masses m1 and m2
    const h1 = 28 + m1 * 18;
    const h2 = 28 + m2 * 18;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.8;
    ctx.fillRect(xL - 25, y1, 50, h1);
    ctx.strokeRect(xL - 25, y1, 50, h1);
    ctx.fillRect(xR - 25, y2, 50, h2);
    ctx.strokeRect(xR - 25, y2, 50, h2);

    api.draw.text(ctx, 'm₁', xL, y1 + h1 * 0.45, { size: 12.5, color: c.ink, align: 'center', weight: 700 });
    api.draw.text(ctx, `${m1.toFixed(2)} kg`, xL, y1 + h1 * 0.82, { size: 10.5, color: c.muted, align: 'center' });
    api.draw.text(ctx, 'm₂', xR, y2 + h2 * 0.45, { size: 12.5, color: c.ink, align: 'center', weight: 700 });
    api.draw.text(ctx, `${m2.toFixed(2)} kg`, xR, y2 + h2 * 0.82, { size: 10.5, color: c.muted, align: 'center' });

    // Force arrows (scale: 4.5 px per N)
    const fScale = 4.5;
    api.draw.arrow(ctx, xL, y1, xL, y1 - T * fScale, c.proton, 2.2, 6);
    api.draw.arrow(ctx, xL, y1 + h1, xL, y1 + h1 + w1 * fScale, c.proton, 2.2, 6);
    api.draw.arrow(ctx, xR, y2, xR, y2 - T * fScale, c.proton, 2.2, 6);
    api.draw.arrow(ctx, xR, y2 + h2, xR, y2 + h2 + w2 * fScale, c.proton, 2.2, 6);

    api.draw.text(ctx, `T=${T.toFixed(1)}N`, xL - 8, y1 - 12, { size: 11, color: c.proton, align: 'right', weight: 600 });
    api.draw.text(ctx, `${w1.toFixed(1)}N`, xL - 8, y1 + h1 + 16, { size: 11, color: c.proton, align: 'right', weight: 600 });
    api.draw.text(ctx, `T=${T.toFixed(1)}N`, xR + 8, y2 - 12, { size: 11, color: c.proton, align: 'left', weight: 600 });
    api.draw.text(ctx, `${w2.toFixed(1)}N`, xR + 8, y2 + h2 + 16, { size: 11, color: c.proton, align: 'left', weight: 600 });

    // ---- Right panel: Unfolded 1D coupled view + Tension Sandwich
    const rxMid = 455;
    api.draw.text(ctx, 'Unfolded 1D coupled system', rxMid, 30, { size: 13, color: c.ink, align: 'center', weight: 700 });

    const uy = 86;
    const shiftX = Math.max(-28, Math.min(28, pos * 60));
    const bx2 = 365 + shiftX;
    const bx1 = 485 + shiftX;

    // Connecting rope
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(bx2 + 52, uy);
    ctx.lineTo(bx1, uy);
    ctx.stroke();

    // Internal cancelling T arrows
    api.draw.arrow(ctx, bx2 + 52, uy - 7, bx2 + 78, uy - 7, c.muted, 1.6, 5);
    api.draw.arrow(ctx, bx1, uy - 7, bx1 - 26, uy - 7, c.muted, 1.6, 5);
    api.draw.text(ctx, '+T and −T cancel', (bx2 + 52 + bx1) / 2, uy - 14, { size: 10.5, color: c.muted, align: 'center' });

    // Blocks m2 and m1 on the unfolded line
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.8;
    ctx.fillRect(bx2, uy - 18, 52, 36);
    ctx.strokeRect(bx2, uy - 18, 52, 36);
    ctx.fillRect(bx1, uy - 18, 52, 36);
    ctx.strokeRect(bx1, uy - 18, 52, 36);
    api.draw.text(ctx, `m₂ (${m2.toFixed(2)})`, bx2 + 26, uy + 4, { size: 11, color: c.ink, align: 'center', weight: 600 });
    api.draw.text(ctx, `m₁ (${m1.toFixed(2)})`, bx1 + 26, uy + 4, { size: 11, color: c.ink, align: 'center', weight: 600 });

    // External weight pulls at ends
    api.draw.arrow(ctx, bx2, uy, bx2 - w2 * 4.2, uy, c.proton, 2.4, 6);
    api.draw.arrow(ctx, bx1 + 52, uy, bx1 + 52 + w1 * 4.2, uy, c.proton, 2.4, 6);
    api.draw.text(ctx, `m₂g = ${w2.toFixed(2)} N`, bx2 - 6, uy + 28, { size: 11, color: c.proton, align: 'right', weight: 600 });
    api.draw.text(ctx, `m₁g = ${w1.toFixed(2)} N`, bx1 + 58, uy + 28, { size: 11, color: c.proton, align: 'left', weight: 600 });

    // Equations readout in middle right
    api.draw.text(
      ctx,
      `a = (m₁ − m₂)g / (m₁ + m₂) = ${fNet.toFixed(2)} / ${mTot.toFixed(2)} = ${a.toFixed(2)} m/s²`,
      rxMid, 146,
      { size: 12.5, color: c.ink, align: 'center', weight: 700 }
    );
    api.draw.text(
      ctx,
      `T = 2m₁m₂g / (m₁ + m₂) = ${T.toFixed(2)} N`,
      rxMid, 168,
      { size: 12.5, color: c.proton, align: 'center', weight: 700 }
    );

    // Tension Sandwich Gauge at bottom right
    const gLeft = 310, gRight = 600, gy = 216;
    const fMin = 1.5, fMax = 10.2;
    const xOfF = (f) => gLeft + ((f - fMin) / (fMax - fMin)) * (gRight - gLeft);

    api.draw.text(ctx, 'The Tension Sandwich (N):', rxMid, 194, {
      size: 12, color: c.ink, align: 'center', weight: 600,
    });

    // Shaded sandwich band between w1 and w2
    const xW1 = xOfF(w1), xW2 = xOfF(w2), xT = xOfF(T);
    ctx.fillStyle = c.proton;
    ctx.globalAlpha = 0.16;
    ctx.fillRect(Math.min(xW1, xW2), gy - 7, Math.abs(xW1 - xW2), 14);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gLeft, gy);
    ctx.lineTo(gRight, gy);
    ctx.stroke();

    // Markers for m1g, m2g, and T
    for (const [xVal, label, col, above] of [
      [xW2, `m₂g (${w2.toFixed(2)})`, c.muted, false],
      [xW1, `m₁g (${w1.toFixed(2)})`, c.muted, false],
      [xT, `T = ${T.toFixed(2)} N`, c.proton, true],
    ]) {
      ctx.beginPath();
      ctx.arc(xVal, gy, above ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      api.draw.text(ctx, label, xVal, above ? gy - 12 : gy + 20, {
        size: 11, color: col, align: 'center', weight: above ? 700 : 600,
      });
    }
    if (viewMode === 1) {
      api.draw.text(ctx, 'T beats the lighter weight (pulls it up) and loses to the heavier weight (lets it fall).', rxMid, 256, {
        size: 11, color: c.muted, align: 'center',
      });
    }
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Weigh the pulley' });
