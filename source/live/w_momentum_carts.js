// Ch 3.5 c3_momentum_carts -> w_momentum_carts: 1D elastic ("bounce") and perfectly inelastic ("stick") collisions.
// Initial velocities fixed at +2.00 m/s (cart 1) and -0.50 m/s (cart 2). Conserves momentum every frame.
import { Live } from './core.js';

const V1_INIT = 2.00;
const V2_INIT = -0.50;
const PX_PER_M = 110; // track scale
const SCALE_V = 34;   // px per m/s for velocity arrows
const SCALE_P = 68;   // px per (kg.m/s) for momentum arrows

Live.register('momentum_carts', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 260, 'Two carts colliding on a frictionless track, with velocity and momentum arrows and a constant total-momentum bar');
  let m1 = 0.35;
  let m2 = 0.50;
  let stick = false;

  // Positions in metres relative to track centre (0)
  let x1 = -1.1;
  let x2 = 0.9;
  let v1 = V1_INIT;
  let v2 = V2_INIT;
  let collided = false;
  let running = false;
  const say = api.readout();

  // Stage action button ("Collide" / "Again") inside stage so control count is strictly 3
  stage.style.position = 'relative';
  const actBtn = document.createElement('button');
  actBtn.type = 'button';
  actBtn.className = 'live-ctl';
  actBtn.textContent = 'Collide';
  actBtn.style.cssText = 'position:absolute;top:10px;right:12px;z-index:2;font-size:12px;padding:3px 10px;';
  actBtn.addEventListener('click', () => {
    if (!running && !collided && x1 === -1.1) {
      running = true;
      actBtn.textContent = 'Again';
    } else {
      reset(true);
    }
  });
  stage.appendChild(actBtn);

  function cartDims(m) {
    // Area proportional to mass: A = w * h. With aspect w/h = 1.5, both w and h scale as sqrt(m).
    const s = Math.sqrt(m / 0.40);
    return { w: 62 * s, h: 38 * s };
  }

  function afterVelocities() {
    if (stick) {
      const vf = (m1 * V1_INIT + m2 * V2_INIT) / (m1 + m2);
      return [vf, vf];
    }
    const vf1 = ((m1 - m2) * V1_INIT + 2 * m2 * V2_INIT) / (m1 + m2);
    const vf2 = ((m2 - m1) * V2_INIT + 2 * m1 * V1_INIT) / (m1 + m2);
    return [vf1, vf2];
  }

  function reset(startNow = false) {
    x1 = -1.1;
    x2 = 0.9;
    v1 = V1_INIT;
    v2 = V2_INIT;
    collided = false;
    running = startNow;
    actBtn.textContent = running ? 'Again' : 'Collide';
    updateReadout();
  }

  function fmtSigned(val) {
    const r = Math.round(val * 100) / 100;
    return r < 0 ? `\u2212${Math.abs(r).toFixed(2)}` : r.toFixed(2);
  }

  function updateReadout() {
    const p1i = m1 * V1_INIT;
    const p2i = m2 * V2_INIT;
    const pTot = p1i + p2i;
    const [vf1, vf2] = afterVelocities();
    const p1f = m1 * vf1;
    const p2f = m2 * vf2;
    const dirStr = pTot >= 0 ? 'to the right' : 'to the left';

    if (!collided) {
      say(`Before: total momentum ${fmtSigned(pTot)} kg\u00b7m/s ${dirStr} (${fmtSigned(p1i)} from cart 1, ${fmtSigned(p2i)} from cart 2). Shown at half speed.`);
    } else if (stick) {
      say(`Still ${fmtSigned(p1f + p2f)} kg\u00b7m/s: cart 1 now ${fmtSigned(p1f)}, cart 2 now ${fmtSigned(p2f)}. They move off together at ${fmtSigned(vf1)} m/s (kinetic energy is partly turned into warmth and sound; momentum is unchanged). Shown at half speed.`);
    } else {
      say(`Still ${fmtSigned(p1f + p2f)} kg\u00b7m/s: cart 1 now ${fmtSigned(p1f)} kg\u00b7m/s (${fmtSigned(vf1)} m/s), cart 2 now ${fmtSigned(p2f)} kg\u00b7m/s (${fmtSigned(vf2)} m/s). Shown at half speed.`);
    }
  }

  api.slider('Mass of cart 1', {
    min: 0.10, max: 1.00, step: 0.05, value: m1,
    fmt: (v) => `${v.toFixed(2)} kg`,
    onInput: (v) => { m1 = +v.toFixed(2); reset(false); },
  });

  api.slider('Mass of cart 2', {
    min: 0.10, max: 1.00, step: 0.05, value: m2,
    fmt: (v) => `${v.toFixed(2)} kg`,
    onInput: (v) => { m2 = +v.toFixed(2); reset(false); },
  });

  api.tabs(['Bounce (elastic)', 'Stick (inelastic)'], (i) => {
    stick = i === 1;
    reset(false);
  }, 0);

  api.loop((dt) => {
    if (dt > 0) {
      if (!running && !collided && x1 === -1.1) {
        running = true;
        actBtn.textContent = 'Again';
      }
      if (running) {
        const dtSim = dt * 0.5; // shown at half speed
        const d1 = cartDims(m1), d2 = cartDims(m2);
        const minSep = (d1.w + d2.w) / (2 * PX_PER_M);

        if (!collided) {
          const nextX1 = x1 + v1 * dtSim;
          const nextX2 = x2 + v2 * dtSim;
          if (nextX2 - nextX1 <= minSep) {
            const relV = v1 - v2;
            const tHit = relV > 1e-6 ? Math.max(0, (x2 - x1 - minSep) / relV) : 0;
            x1 += v1 * tHit;
            x2 = x1 + minSep;
            const [vf1, vf2] = afterVelocities();
            v1 = vf1;
            v2 = vf2;
            collided = true;
            const rem = Math.max(0, dtSim - tHit);
            x1 += v1 * rem;
            x2 += v2 * rem;
            updateReadout();
          } else {
            x1 = nextX1;
            x2 = nextX2;
          }
        } else {
          x1 += v1 * dtSim;
          x2 += v2 * dtSim;
          if (x1 < -2.3 && x2 < -2.3 || x1 > 2.3 && x2 > 2.3 || (x2 - x1 > 3.8)) {
            running = false;
          }
        }
      }
    }

    // Conservation check every frame
    const pInit = m1 * V1_INIT + m2 * V2_INIT;
    const pNow = m1 * v1 + m2 * v2;
    if (Math.abs(pNow - pInit) > 1e-9) {
      console.error('Momentum conservation violation:', pInit, pNow);
    }

    k.clear(c.plate);
    const ctx = k.ctx;
    const trackY = 162;
    const cx = 320;

    // Frictionless track
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, trackY);
    ctx.lineTo(616, trackY);
    ctx.stroke();

    function drawCart(xm, m, v, col, title) {
      const { w, h } = cartDims(m);
      const sx = cx + xm * PX_PER_M;
      const sy = trackY - 12 - h;

      ctx.fillStyle = col;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.8;
      api.draw.roundRect(ctx, sx - w / 2, sy, w, h, 4);
      ctx.fill();
      ctx.stroke();

      api.draw.text(ctx, `${m.toFixed(2)} kg`, sx, sy + h / 2 + 4, {
        size: 12, color: c.ink, align: 'center', weight: 600,
      });

      // Wheels
      for (const wx of [sx - w * 0.3, sx + w * 0.3]) {
        ctx.beginPath();
        ctx.arc(wx, trackY - 6, 6, 0, Math.PI * 2);
        ctx.fillStyle = c.sheet;
        ctx.fill();
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // Velocity arrow (bold blue, above cart)
      if (Math.abs(v) > 0.01) {
        const vLen = v * SCALE_V;
        const ay = sy - 26;
        api.draw.arrow(ctx, sx - vLen / 2, ay, sx + vLen / 2, ay, c.electron, 2.4, 8);
        api.draw.text(ctx, `v = ${fmtSigned(v)} m/s`, sx, ay - 9, {
          size: 11.5, color: c.electron, align: 'center', weight: 600,
        });
      }

      // Momentum arrow (thinner, just above cart roof)
      const p = m * v;
      if (Math.abs(p) > 0.005) {
        const pLen = p * SCALE_P;
        const py = sy - 8;
        api.draw.arrow(ctx, sx - pLen / 2, py, sx + pLen / 2, py, c.proton, 1.5, 6);
      }
      api.draw.text(ctx, `${title}: p = ${fmtSigned(p)}`, sx, trackY + 20, {
        size: 11.5, color: c.muted, align: 'center',
      });
    }

    drawCart(x1, m1, v1, c.sheet, 'cart 1');
    drawCart(x2, m2, v2, c.mark_soft || c.sheet, 'cart 2');

    // Legend for arrows at top left
    api.draw.arrow(ctx, 28, 22, 56, 22, c.electron, 2.4, 7);
    api.draw.text(ctx, 'velocity (m/s)', 62, 26, { size: 11.5, color: c.electron });
    api.draw.arrow(ctx, 165, 22, 193, 22, c.proton, 1.5, 6);
    api.draw.text(ctx, 'momentum mv (kg\u00b7m/s)', 199, 26, { size: 11.5, color: c.proton });

    // Running "total momentum" line under the track that does not change
    const barY = 222;
    const pLenTot = pNow * SCALE_P * 1.6;
    api.draw.text(ctx, `Total momentum = ${fmtSigned(pNow)} kg\u00b7m/s (unchanged before and after)`, cx, barY - 12, {
      size: 12.5, color: c.ink, align: 'center', weight: 600,
    });
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 140, barY + 4);
    ctx.lineTo(cx + 140, barY + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, barY - 2);
    ctx.lineTo(cx, barY + 10);
    ctx.stroke();
    if (Math.abs(pLenTot) > 2) {
      api.draw.arrow(ctx, cx, barY + 4, cx + pLenTot, barY + 4, c.proton, 3, 9);
    }
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Collide the carts' });
