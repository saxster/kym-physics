// Ch 4.4 c4_two_coins -> w_projectile: Dropped and flicked coins launched together off a 75 cm table.
// Teaches independence of horizontal and vertical motions. Scale 240 px/m matching the still figure. Time slowed 3x.
import { Live } from './core.js';

const G = 9.8;
const H_TABLE = 0.75; // m
const SCALE = 240.0;  // px per metre, matching c4_two_coins

Live.register('projectile', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 340, 'Two coins leaving a 75 cm table edge together, flashed every 0.1 s');
  let v0 = 2.0;   // m/s
  let deg = 0;    // launch angle in degrees (-20 to +30)
  let simT = 0;
  let running = !api.reduced;
  const say = api.readout();

  function flightTimes() {
    // Dropped coin: 0.5 * g * t^2 = H_TABLE => t1 = sqrt(2 * 0.75 / 9.8) = 0.3912 s
    const tDrop = Math.sqrt((2 * H_TABLE) / G);
    // Thrown coin: y(t) = v0 * sin(theta) * t - 0.5 * g * t^2 = -H_TABLE
    const vy0 = v0 * Math.sin((deg * Math.PI) / 180);
    const tFlick = (vy0 + Math.sqrt(vy0 * vy0 + 2 * G * H_TABLE)) / G;
    const vx0 = v0 * Math.cos((deg * Math.PI) / 180);
    const xLand = vx0 * tFlick;
    return { tDrop, tFlick, vx0, vy0, xLand };
  }

  function coinPos(t) {
    const { tDrop, tFlick, vx0, vy0 } = flightTimes();
    const t1 = Math.min(t, tDrop);
    const y1 = -0.5 * G * t1 * t1; // relative to table top (0 to -0.75 m)

    const t2 = Math.min(t, tFlick);
    const x2 = vx0 * t2;
    const y2 = Math.max(-H_TABLE, vy0 * t2 - 0.5 * G * t2 * t2);
    return { x1: 0, y1, x2, y2, landed1: t >= tDrop, landed2: t >= tFlick };
  }

  function reset(startNow = true) {
    simT = 0;
    running = startNow;
    updateReadout();
  }

  function updateReadout() {
    const { tDrop, tFlick, xLand } = flightTimes();
    if (deg === 0) {
      const flashIdx = Math.floor(Math.min(simT, tDrop) / 0.1);
      const flashNote = flashIdx >= 1 ? ` Flash at ${(flashIdx * 0.1).toFixed(1)} s: same height: yes.` : ' At every strobe flash, same height: yes.';
      say(`Both in the air for ${tDrop.toFixed(2)} s; the flicked coin lands ${xLand.toFixed(2)} m out at ${v0.toFixed(1)} m/s.${flashNote} Slowed 3 times; no air in this model (a real long throw falls short).`);
    } else if (deg > 0) {
      say(`With an upward angle (+${deg}\u00b0), the thrown coin starts with upward velocity so it lands later (${tFlick.toFixed(2)} s vs ${tDrop.toFixed(2)} s for the dropped coin), ${xLand.toFixed(2)} m out. Slowed 3 times; no air in this model.`);
    } else {
      say(`Aimed downward (\u2212${Math.abs(deg)}\u00b0), the thrown coin reaches the floor earlier (${tFlick.toFixed(2)} s vs ${tDrop.toFixed(2)} s for the dropped coin), ${xLand.toFixed(2)} m out. Slowed 3 times; no air in this model.`);
    }
  }

  api.slider('Sideways / launch speed', {
    min: 0, max: 4.0, step: 0.5, value: v0,
    fmt: (v) => `${v.toFixed(1)} m/s`,
    onInput: (v) => { v0 = v; reset(true); },
  });

  api.slider('Launch angle', {
    min: -20, max: 30, step: 5, value: deg,
    fmt: (v) => (v === 0 ? '0\u00b0 (horizontal)' : v > 0 ? `+${v}\u00b0` : `\u2212${Math.abs(v)}\u00b0`),
    onInput: (v) => { deg = v; reset(true); },
  });

  api.button('Launch', () => {
    const { tDrop, tFlick } = flightTimes();
    const maxT = Math.max(tDrop, tFlick);
    if (simT > 0 && simT < maxT && running) {
      reset(false);
    } else {
      reset(true);
    }
  });

  api.loop((dt) => {
    const { tDrop, tFlick, vx0 } = flightTimes();
    const maxT = Math.max(tDrop, tFlick);

    if (dt > 0 && running) {
      // Time slowed 3x
      simT = Math.min(maxT, simT + dt / 3);
      if (simT >= maxT) running = false;
      updateReadout();
    }

    // When opened paused (reduced motion), show full flight so all strobe marks are visible
    const drawT = api.reduced && simT === 0 && !running ? maxT : simT;

    k.clear(c.plate);
    const ctx = k.ctx;

    const edgeX = 160, topY = 96;
    const floorY = topY + H_TABLE * SCALE; // 96 + 180 = 276
    const xOrigin = edgeX + 10;

    // Table and floor (matching c4_two_coins)
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.6;
    api.draw.roundRect(ctx, 20, topY, edgeX - 20, 10, 2);
    ctx.fill(); ctx.stroke();
    ctx.fillRect(36, topY + 10, 10, floorY - topY - 10);
    ctx.strokeRect(36, topY + 10, 10, floorY - topY - 10);
    ctx.fillRect(edgeX - 26, topY + 10, 10, floorY - topY - 10);
    ctx.strokeRect(edgeX - 26, topY + 10, 10, floorY - topY - 10);

    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, floorY);
    ctx.lineTo(620, floorY);
    ctx.stroke();

    api.draw.text(ctx, 'table, 75 cm high', 34, topY - 10, { size: 12, color: c.muted });
    api.draw.text(ctx, 'coin size not to scale', 616, 24, { size: 11, color: c.muted, align: 'right' });

    // Full trajectory curve (faint guide) and active trajectory up to drawT
    ctx.strokeStyle = c.electron;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const tt = (i / steps) * Math.min(drawT, tFlick);
      const p = coinPos(tt);
      const px = xOrigin + p.x2 * SCALE;
      const py = Math.min(floorY - 7, topY - p.y2 * SCALE);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Strobe flashes every 0.1 s up to drawT (plus landing if reached)
    const strobeTimes = [0.0, 0.1, 0.2, 0.3];
    if (drawT >= tDrop) strobeTimes.push(tDrop);
    if (deg !== 0 && drawT >= tFlick && Math.abs(tFlick - tDrop) > 0.01) strobeTimes.push(tFlick);

    for (const st of strobeTimes) {
      if (st > drawT + 1e-4) continue;
      const p = coinPos(st);
      const xd = xOrigin;
      const yd = Math.min(floorY - 7, topY - p.y1 * SCALE);
      const xf = xOrigin + p.x2 * SCALE;
      const yf = Math.min(floorY - 7, topY - p.y2 * SCALE);

      // Dashed horizontal level line joining the two coins when deg === 0
      if (deg === 0 && xf - xd > 16) {
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = c.muted;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(xd + 8, yd);
        ctx.lineTo(xf - 8, yf);
        ctx.stroke();
        ctx.restore();
      }

      // Strobe ghosts
      ctx.beginPath();
      ctx.arc(xd, yd, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = c.ink;
      ctx.globalAlpha = st === 0 ? 0.5 : 0.75;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(xf, yf, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (st > 0 && st <= 0.35) {
        api.draw.text(ctx, `${st.toFixed(1)} s`, xf + 12, yf + 4, { size: 11.5, color: c.muted });
      } else if (Math.abs(st - tFlick) < 0.005) {
        api.draw.text(ctx, `${tFlick.toFixed(2)} s`, xf + 12, yf - 6, { size: 11.5, color: c.electron, weight: 600 });
      }
    }

    // Equal sideways steps tick marks along the floor every 0.1 s
    if (vx0 > 0.1) {
      const yTick = floorY + 14;
      for (let kStep = 0; kStep <= 3; kStep++) {
        const tx = xOrigin + vx0 * (kStep * 0.1) * SCALE;
        if (tx <= 615) {
          ctx.strokeStyle = c.muted;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(tx, floorY + 3);
          ctx.lineTo(tx, yTick);
          ctx.stroke();
        }
      }
      api.draw.text(ctx, `equal sideways steps every 0.1 s (${(vx0 * 0.1 * 100).toFixed(0)} cm each)`, xOrigin + 4, floorY + 28, {
        size: 11.5, color: c.muted,
      });
    }

    // Live coins at current drawT
    const cur = coinPos(drawT);
    const curXd = xOrigin, curYd = Math.min(floorY - 7, topY - cur.y1 * SCALE);
    const curXf = xOrigin + cur.x2 * SCALE, curYf = Math.min(floorY - 7, topY - cur.y2 * SCALE);

    if (deg === 0 && curXf - curXd > 16) {
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(curXd + 8, curYd);
      ctx.lineTo(curXf - 8, curYf);
      ctx.stroke();
      ctx.restore();
    }

    for (const [cx, cy, col] of [[curXd, curYd, c.ink], [curXf, curYf, c.electron]]) {
      ctx.beginPath();
      ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = c.sheet;
      ctx.stroke();
    }

    api.draw.text(ctx, 'dropped', xOrigin, topY - 12, { size: 12, color: c.ink, align: 'center', weight: 600 });
    api.draw.text(ctx, `launched at ${v0.toFixed(1)} m/s (${deg}\u00b0)`, xOrigin + 125, topY - 12, {
      size: 12, color: c.electron, align: 'center', weight: 600,
    });
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Launch the coins' });
