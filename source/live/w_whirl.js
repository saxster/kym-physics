// Ch 4.5 c4_whirl -> w_whirl: Ball on a 1 m string (m = 0.2 kg), whirling and released.
// Shows inertial ("from the floor") and co-rotating ("from the ball's seat") frames.
import { Live } from './core.js';

const M_BALL = 0.2; // kg
const R_STR = 1.0;  // m
const PX_R = 105;   // px for 1 m radius

Live.register('whirl', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 330, 'A ball whirling on a 1 m string, with inward force and tangent velocity, and its straight tangent path when released');
  let speed = 2.0;    // m/s (1 to 4 m/s)
  let rotatingView = false;
  let released = false;
  let theta = -Math.PI / 4; // current angle (or release angle once released)
  let tAfter = 0;           // time since release (s)
  let relTrail = [];        // trail after release in active frame
  const say = api.readout();

  const relBtn = api.button('Release', () => {
    if (!released) {
      released = true;
      tAfter = 0;
      relTrail = [];
      relBtn.textContent = 'Reset to whirling';
    } else {
      released = false;
      tAfter = 0;
      relTrail = [];
      relBtn.textContent = 'Release';
    }
    updateReadout();
  });

  api.slider('Speed', {
    min: 1.0, max: 4.0, step: 0.5, value: speed,
    fmt: (v) => `${v.toFixed(1)} m/s`,
    onInput: (v) => {
      speed = v;
      if (released) {
        tAfter = 0;
        relTrail = [];
      }
      updateReadout();
    },
  });

  api.tabs(['From the floor', 'From the ball\u2019s seat'], (i) => {
    rotatingView = i === 1;
    relTrail = [];
    updateReadout();
  }, 0);

  function updateReadout() {
    const F = (M_BALL * speed * speed) / R_STR;
    if (rotatingView) {
      if (!released) {
        say(`In this spinning view a pretend outward force of ${F.toFixed(2)} N appears so that the rules still work (balancing the string\u2019s ${F.toFixed(2)} N inward pull); from the floor there is none. Real time; ball size exaggerated.`);
      } else {
        say(`Released at ${speed.toFixed(1)} m/s: in the floor view it flies straight along the tangent, which looks curved in this spinning seat. Real time; ball size exaggerated.`);
      }
    } else if (!released) {
      say(`The string pulls inward with F = mv\u00b2/r = ${F.toFixed(2)} N (m = 0.2 kg, r = 1.0 m); the velocity (${speed.toFixed(1)} m/s) points along the circle. Real time; ball size exaggerated.`);
    } else {
      say(`No inward pull now: straight line along the tangent at the same speed, ${speed.toFixed(1)} m/s. Real time; ball size exaggerated.`);
    }
  }

  // Inertial position and velocity (in metres, relative to centre)
  function inertialState(ang, dtRel) {
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const tx = -Math.sin(ang), ty = Math.cos(ang); // clockwise on screen (y down)
    const x = R_STR * ux + speed * dtRel * tx;
    const y = R_STR * uy + speed * dtRel * ty;
    const vx = speed * tx;
    const vy = speed * ty;
    // Conservation check: inertial speed must equal `speed` to within 0.1%
    const vMag = Math.hypot(vx, vy);
    if (Math.abs(vMag - speed) > 0.001 * speed) {
      console.error('Whirl speed drift:', vMag, speed);
    }
    return { x, y, vx, vy, ux, uy, tx, ty };
  }

  // Transform inertial point (x, y) into rotating frame where release radius stays at angle -PI/4 (up-right)
  function toViewCoords(x, y, ang0, dtRel) {
    if (!rotatingView) return { x, y };
    const omega = speed / R_STR;
    const curFrameAng = ang0 + omega * dtRel;
    const targetAng = -Math.PI / 4;
    const rot = targetAng - curFrameAng;
    const cR = Math.cos(rot), sR = Math.sin(rot);
    return {
      x: x * cR - y * sR,
      y: x * sR + y * cR,
    };
  }

  api.loop((dt) => {
    const omega = speed / R_STR; // rad/s (real time)
    if (dt > 0) {
      if (!released) {
        theta = (theta + omega * dt) % (Math.PI * 2);
      } else {
        tAfter += dt;
        if (tAfter > 2.4) {
          tAfter = 0;
          relTrail = [];
        }
      }
    }

    k.clear(c.plate);
    const ctx = k.ctx;
    const cx = 270, cy = 175;

    // Background reference grid (rotates backward in rotating view so the spinning frame is obvious)
    const bgAngle = rotatingView ? -(theta + omega * tAfter + Math.PI / 4) : 0;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(bgAngle);
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    for (let g = -120; g <= 120; g += 60) {
      ctx.beginPath(); ctx.moveTo(g, -135); ctx.lineTo(g, 135); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-135, g); ctx.lineTo(135, g); ctx.stroke();
    }
    api.draw.text(ctx, 'floor grid', -128, -120, { size: 11, color: c.muted });
    ctx.restore();

    // Circle of radius 1 m
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, PX_R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Centre post
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = c.ink;
    ctx.fill();

    const st = inertialState(theta, released ? tAfter : 0);
    const vp = toViewCoords(st.x, st.y, theta, released ? tAfter : 0);
    const bx = cx + vp.x * PX_R;
    const by = cy + vp.y * PX_R;

    const F = (M_BALL * speed * speed) / R_STR; // 0.2 to 3.2 N
    const fScale = 28; // px per N

    if (!released) {
      // String from centre to ball
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Unit inward vector in current view
      const rLen = Math.hypot(vp.x, vp.y) || 1;
      const inX = -vp.x / rLen, inY = -vp.y / rLen;
      const fLen = Math.max(18, F * fScale);

      // Inward string force arrow
      api.draw.arrow(ctx, bx, by, bx + inX * fLen, by + inY * fLen, c.proton, 2.4, 8);
      api.draw.text(ctx, `inward pull ${F.toFixed(2)} N`, bx + inX * (fLen + 14), by + inY * (fLen + 14), {
        size: 12, color: c.proton, align: 'center', weight: 600,
      });

      if (!rotatingView) {
        // Tangent velocity arrow (in floor view)
        const tx = -inY, ty = inX;
        const vLen = speed * 24;
        api.draw.arrow(ctx, bx, by, bx + tx * vLen, by + ty * vLen, c.electron, 2.4, 8);
        api.draw.text(ctx, `v = ${speed.toFixed(1)} m/s`, bx + tx * (vLen + 14), by + ty * (vLen + 14), {
          size: 12, color: c.electron, align: 'center', weight: 600,
        });
      } else {
        // Dashed pretend outward arrow in rotating view
        const outX = -inX, outY = -inY;
        ctx.save();
        ctx.setLineDash([5, 4]);
        api.draw.arrow(ctx, bx, by, bx + outX * fLen, by + outY * fLen, c.muted, 2.2, 8);
        ctx.restore();
        api.draw.text(ctx, 'pretend (only in this view)', bx + outX * (fLen + 12), by + outY * (fLen + 12) - 4, {
          size: 12, color: c.muted, align: 'left', weight: 600,
        });
      }
    } else {
      // Released: draw exact trajectory from t = 0 to tAfter
      const relPt0 = toViewCoords(R_STR * Math.cos(theta), R_STR * Math.sin(theta), theta, tAfter);
      const rx0 = cx + relPt0.x * PX_R, ry0 = cy + relPt0.y * PX_R;

      // Tempting wrong radial outward line from release point (dashed muted)
      const radOutX = relPt0.x, radOutY = relPt0.y;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(rx0, ry0);
      ctx.lineTo(rx0 + radOutX * 95, ry0 + radOutY * 95);
      ctx.stroke();
      ctx.restore();
      api.draw.text(ctx, 'not outward: nothing pushes that way', rx0 + radOutX * 98, ry0 + radOutY * 98, {
        size: 11.5, color: c.muted,
      });

      // Actual path after release (straight tangent in inertial view; curved inertial-line-transformed in rotating view)
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      const N = 40;
      const tDraw = Math.max(0.6, tAfter);
      for (let i = 0; i <= N; i++) {
        const tau = (i / N) * tDraw;
        const pIn = inertialState(theta, tau);
        const pVw = toViewCoords(pIn.x, pIn.y, theta, tau);
        const px = cx + pVw.x * PX_R, py = cy + pVw.y * PX_R;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      if (!rotatingView) {
        const vLen = speed * 24;
        api.draw.arrow(ctx, bx, by, bx + st.tx * vLen, by + st.ty * vLen, c.electron, 2.2, 8);
        api.draw.text(ctx, `straight on at ${speed.toFixed(1)} m/s`, bx + 14, by - 10, {
          size: 12, color: c.electron, weight: 600,
        });
      }
    }

    // Draw the ball (exaggerated size)
    ctx.beginPath();
    ctx.arc(bx, by, 9.5, 0, Math.PI * 2);
    ctx.fillStyle = c.ink;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = c.sheet;
    ctx.stroke();

    api.draw.text(ctx, 'm = 0.2 kg · r = 1.0 m (ball size exaggerated)', 20, 24, { size: 12, color: c.muted });
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Whirl and release' });
