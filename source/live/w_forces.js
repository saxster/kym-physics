// Ch 3.1 c3_tug_cart -> w_forces: Adding forces on a 50 kg cart.
// Teaches that net force changes velocity, and balanced forces mean constant velocity (which may be non-zero).
import { Live } from './core.js';

const MASS = 50; // kg
const FRIC_MAX = 100; // N on rough floor
const SCALE_F = 1 / 3.9; // 1 px per 3.9 N, matching the still figure

Live.register('forces', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 260, 'A 50 kg cart pulled left and right on a scrolling track, with force and velocity arrows');
  let pullL = 390;
  let pullR = 390;
  let rough = false;
  let x = 0; // m along track
  let v = 0; // m/s
  const say = api.readout();

  // Reset button inside the stage (not counted as a control in controls bar)
  stage.style.position = 'relative';
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'live-ctl';
  resetBtn.textContent = 'Reset to rest';
  resetBtn.style.cssText = 'position:absolute;top:10px;right:12px;z-index:2;font-size:12px;padding:3px 9px;';
  resetBtn.addEventListener('click', () => {
    v = 0;
    x = 0;
    updateReadout();
  });
  stage.appendChild(resetBtn);

  function computeForces() {
    const netPull = pullR - pullL;
    let fFric = 0;
    if (rough) {
      if (Math.abs(v) > 1e-4) {
        fFric = -Math.sign(v) * FRIC_MAX;
      } else if (Math.abs(netPull) <= FRIC_MAX) {
        fFric = -netPull;
      } else {
        fFric = -Math.sign(netPull) * FRIC_MAX;
      }
    }
    const fNet = netPull + fFric;
    const a = fNet / MASS;
    return { netPull, fFric, fNet, a };
  }

  function stepPhysics(dtReal) {
    if (dtReal <= 0) return;
    let rem = dtReal;
    const h = 0.002;
    while (rem > 1e-6) {
      const dt = Math.min(h, rem);
      rem -= dt;
      const { netPull, fNet, a } = computeForces();
      if (rough && Math.abs(v) > 1e-4) {
        const vNext = v + a * dt;
        // If kinetic friction would reverse velocity and applied pull cannot overcome static friction, clamp to rest
        if (v * vNext <= 0 && Math.abs(netPull) <= FRIC_MAX) {
          x += 0.5 * v * dt;
          v = 0;
          continue;
        }
      }
      v += a * dt;
      x += v * dt;
    }
  }

  function updateReadout() {
    const { netPull, fFric, fNet, a } = computeForces();
    const vAbs = Math.abs(v);
    const vDir = v > 0.02 ? 'to the right' : v < -0.02 ? 'to the left' : '';
    let msg = '';

    if (rough && Math.abs(v) <= 0.02 && Math.abs(netPull) > 0 && Math.abs(netPull) <= FRIC_MAX) {
      msg = `Net pull ${Math.abs(netPull)} N ${netPull > 0 ? 'to the right' : 'to the left'}, but static friction (${Math.abs(fFric)} N) cancels it. Nothing moves until the pull beats 100 N.`;
    } else if (Math.abs(fNet) < 0.5) {
      if (vAbs < 0.02) {
        msg = 'Net force 0 on the 50 kg cart. At rest, it stays at rest.';
      } else {
        msg = `Net force 0. The 50 kg cart keeps its velocity: ${vAbs.toFixed(1)} m/s ${vDir}.`;
      }
    } else {
      const fDir = fNet > 0 ? 'to the right' : 'to the left';
      const action = vAbs < 0.02 || v * fNet >= 0 ? 'speeds up' : 'slows down';
      const vPart = vAbs >= 0.02 ? ` Current velocity: ${vAbs.toFixed(1)} m/s ${vDir}.` : '';
      msg = `Net force ${Math.round(Math.abs(fNet))} N ${fDir} on the 50 kg cart. The cart ${action} at ${Math.abs(a).toFixed(1)} m/s\u00b2.${vPart}`;
    }
    say(`${msg} (1 second on screen = 1 second.)`);
  }

  api.slider('Pull to the left', {
    min: 0, max: 500, step: 10, value: pullL,
    fmt: (val) => `${val} N`,
    onInput: (val) => { pullL = val; updateReadout(); },
  });

  api.slider('Pull to the right', {
    min: 0, max: 500, step: 10, value: pullR,
    fmt: (val) => `${val} N`,
    onInput: (val) => { pullR = val; updateReadout(); },
  });

  api.tabs(['Smooth floor', 'Rough floor (100 N)'], (i) => {
    rough = i === 1;
    updateReadout();
  }, 0);

  api.loop((dt) => {
    if (dt > 0) {
      stepPhysics(dt);
      updateReadout();
    }

    k.clear(c.plate);
    const ctx = k.ctx;
    const { fFric, fNet } = computeForces();

    // Track at y = 185, scrolling with x (60 px per metre)
    const groundY = 185;
    const pxPerM = 60;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, groundY);
    ctx.lineTo(616, groundY);
    ctx.stroke();

    // Scrolling sleeper marks along the floor so motion is unmistakable
    const spacing = 30; // 0.5 m
    const offset = ((x * pxPerM) % spacing + spacing) % spacing;
    ctx.strokeStyle = rough ? c.proton : c.muted;
    ctx.lineWidth = rough ? 1.8 : 1.2;
    for (let gx = 30 - offset; gx < 610; gx += spacing) {
      if (gx < 24) continue;
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx - 8, groundY + 10);
      ctx.stroke();
    }
    if (rough) {
      api.draw.text(ctx, 'rough floor (up to 100 N friction)', 32, groundY + 24, { size: 11.5, color: c.muted });
    }

    // Cart centred at cx = 320
    const cx = 320, cw = 76, ch = 44;
    const cy = groundY - ch - 14;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    api.draw.roundRect(ctx, cx - cw / 2, cy, cw, ch, 4);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, '50 kg', cx, cy + 27, { size: 13, color: c.ink, align: 'center', weight: 600 });

    // Wheels
    const wheelRot = (x * pxPerM) / 7;
    for (const wx of [cx - cw / 2 + 15, cx + cw / 2 - 15]) {
      const wy = groundY - 7;
      ctx.beginPath();
      ctx.arc(wx, wy, 7, 0, Math.PI * 2);
      ctx.fillStyle = c.sheet;
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wx - 5 * Math.cos(wheelRot), wy - 5 * Math.sin(wheelRot));
      ctx.lineTo(wx + 5 * Math.cos(wheelRot), wy + 5 * Math.sin(wheelRot));
      ctx.stroke();
    }

    // Velocity arrow above the cart (blue, labelled m/s)
    const vAbs = Math.abs(v);
    if (vAbs >= 0.05) {
      const vLen = Math.min(180, Math.max(18, vAbs * 18)) * Math.sign(v);
      api.draw.arrow(ctx, cx, cy - 18, cx + vLen, cy - 18, c.electron, 2.2, 8);
      api.draw.text(ctx, `v = ${v.toFixed(1).replace('-', '\u2212')} m/s`, cx + vLen * 0.5, cy - 28, {
        size: 12.5, color: c.electron, align: 'center', weight: 600,
      });
    } else {
      api.draw.text(ctx, 'v = 0 m/s', cx, cy - 18, { size: 12.5, color: c.muted, align: 'center' });
    }

    // Left pull arrow (1 px per 3.9 N)
    const midY = cy + ch * 0.5;
    if (pullL > 0) {
      const lenL = pullL * SCALE_F;
      api.draw.arrow(ctx, cx - cw / 2, midY, cx - cw / 2 - lenL, midY, c.proton, 2.6, 9);
      api.draw.text(ctx, `${pullL} N`, cx - cw / 2 - lenL * 0.5, midY - 10, {
        size: 13, color: c.proton, align: 'center', weight: 600,
      });
    }

    // Right pull arrow (1 px per 3.9 N)
    if (pullR > 0) {
      const lenR = pullR * SCALE_F;
      api.draw.arrow(ctx, cx + cw / 2, midY, cx + cw / 2 + lenR, midY, c.proton, 2.6, 9);
      api.draw.text(ctx, `${pullR} N`, cx + cw / 2 + lenR * 0.5, midY - 10, {
        size: 13, color: c.proton, align: 'center', weight: 600,
      });
    }

    // Friction arrow at the wheels when non-zero
    if (Math.abs(fFric) > 0.5) {
      const lenF = fFric * SCALE_F;
      api.draw.arrow(ctx, cx, groundY - 2, cx + lenF, groundY - 2, c.proton, 2.2, 7);
      api.draw.text(ctx, `friction ${Math.round(Math.abs(fFric))} N`, cx + lenF * 0.5, groundY - 10, {
        size: 11.5, color: c.proton, align: 'center', weight: 600,
      });
    }

    // Net-force arrow drawn below the cart, labelled "net"
    const netY = 228;
    if (Math.abs(fNet) > 0.5) {
      const lenNet = fNet * SCALE_F;
      api.draw.arrow(ctx, cx, netY, cx + lenNet, netY, c.proton, 2.8, 9);
      api.draw.text(ctx, `net ${Math.round(Math.abs(fNet))} N`, cx + lenNet + (fNet > 0 ? 8 : -8), netY + 4, {
        size: 13, color: c.proton, align: fNet > 0 ? 'left' : 'right', weight: 600,
      });
    } else {
      api.draw.text(ctx, 'net force 0', cx, netY + 4, { size: 13, color: c.ink, align: 'center', weight: 600 });
    }
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Pull the cart' });
