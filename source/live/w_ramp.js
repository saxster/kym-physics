// Ch 2.3 c2_two_ramps -> w_ramp: Galileo's two-ramp thought experiment.
// Point-mass sliding puck released from 1.0 m on a 30 deg first ramp, climbing a second ramp of angle 0..40 deg with friction mu = 0..0.30.
import { Live } from './core.js';
import { mechanismKey,dimension,hatch } from './art_mechanics.js';

const G = 9.8;
const TH1 = (30 * Math.PI) / 180;
const H0 = 1.0;
const L1 = H0 / Math.sin(TH1); // 2.0 m along first ramp

Live.register('ramp', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 260, 'Galileo two-ramp thought experiment with a sliding puck and dashed starting-height line');
  let deg2 = 30;
  let mu = 0.10;
  const say = api.readout();
  mechanismKey(stage, "Same height, different distance", ["The striped ramp is the solid support; the puck slides on its upper edge. The blue vertical bracket measures height.", "A dotted return mark records the highest point. On a flat second track the arrow continues beyond this drawing."]);

  // State: s is arc-length along track (s = 0 at top of first ramp, s = L1 at bottom vertex, s > L1 on second ramp)
  let s = 0;
  let v = 0;
  let maxH = 0;
  let maxS2 = 0;
  let stopped = false;
  let hasTurned = false;

  function reset() {
    s = 0;
    v = 0;
    maxH = 0;
    maxS2 = 0;
    stopped = false;
    hasTurned = false;
    // Compute theoretical peak on first pass so the ghost puck and readout are immediately accurate even when paused
    computeFirstPeak();
    updateReadout();
  }

  function computeFirstPeak() {
    const sin1 = Math.sin(TH1), cos1 = Math.cos(TH1);
    const aDown1 = G * (sin1 - mu * cos1);
    if (aDown1 <= 0) {
      maxH = H0;
      maxS2 = 0;
      return;
    }
    const vBotSq = 2 * aDown1 * L1; // v^2 at bottom: 2 g H0 (1 - mu cot 30)
    const th2 = (deg2 * Math.PI) / 180;
    const decel2 = G * (Math.sin(th2) + mu * Math.cos(th2));
    if (decel2 <= 1e-9) {
      maxS2 = Infinity;
      maxH = 0;
    } else {
      maxS2 = vBotSq / (2 * decel2);
      maxH = maxS2 * Math.sin(th2);
      if (mu === 0 && deg2 > 0) maxH = H0;
    }
  }

  function heightAt(posS) {
    if (posS <= L1) {
      return Math.max(0, (L1 - posS) * Math.sin(TH1));
    }
    const th2 = (deg2 * Math.PI) / 180;
    return (posS - L1) * Math.sin(th2);
  }

  function stepPhysics(dtReal) {
    if (stopped || dtReal <= 0) return;
    // Motion is shown at half speed
    let rem = dtReal * 0.5;
    const hStep = 0.002;
    const th2 = (deg2 * Math.PI) / 180;

    while (rem > 1e-6 && !stopped) {
      const dt = Math.min(hStep, rem);
      rem -= dt;

      const onRamp1 = s < L1 || (s === L1 && v < 0);
      const theta = onRamp1 ? TH1 : th2;
      const sinT = Math.sin(theta), cosT = Math.cos(theta);
      // Gravity component along increasing s: +g sin(TH1) on ramp 1, -g sin(th2) on ramp 2
      const aGrav = onRamp1 ? G * sinT : -G * sinT;
      const aFricMag = mu * G * cosT;

      if (Math.abs(v) < 0.001) {
        if (Math.abs(aGrav) <= aFricMag + 1e-6) {
          v = 0;
          stopped = true;
          break;
        }
      }

      const dir = v > 0 ? 1 : (v < 0 ? -1 : Math.sign(aGrav));
      const a = aGrav - dir * aFricMag;
      const vNext = v + a * dt;

      // Check zero-crossing of velocity (turning point or stopping)
      if (v * vNext < 0 || (v !== 0 && Math.abs(vNext) < 0.001 && Math.abs(aGrav) <= aFricMag)) {
        // Interpolate to exact v = 0 moment
        const dtZero = Math.abs(a) > 1e-9 ? Math.abs(v / a) : 0;
        s += v * dtZero + 0.5 * a * dtZero * dtZero;
        v = 0;
        if (!onRamp1 && !hasTurned) {
          hasTurned = true;
          // At mu = 0, clamp to exact start height within 1 mm
          if (mu === 0 && deg2 > 0) {
            s = L1 + H0 / Math.sin(th2);
          }
        }
        if (Math.abs(aGrav) <= aFricMag + 1e-6) {
          stopped = true;
          break;
        }
        continue;
      }

      // Check crossing the vertex s = L1
      const sNext = s + v * dt + 0.5 * a * dt * dt;
      if ((s < L1 && sNext >= L1) || (s > L1 && sNext <= L1)) {
        // Energy-exact speed at bottom on first pass when mu === 0
        s = sNext;
        v = vNext;
        if (mu === 0) {
          const hCur = heightAt(s);
          const vMag = Math.sqrt(Math.max(0, 2 * G * (H0 - hCur)));
          v = Math.sign(v || 1) * vMag;
        }
      } else {
        s = Math.max(0, sNext);
        v = vNext;
        if (mu === 0) {
          const hCur = heightAt(s);
          if (hCur >= H0 && Math.abs(v) < 0.05) {
            s = s <= L1 ? 0 : L1 + H0 / Math.sin(th2);
            v = -v;
          } else {
            const vMag = Math.sqrt(Math.max(0, 2 * G * (H0 - hCur)));
            v = Math.sign(v || 1) * vMag;
          }
        }
      }
    }
  }

  function updateReadout() {
    const vBot = Math.sqrt(Math.max(0, 2 * G * L1 * (Math.sin(TH1) - mu * Math.cos(TH1))));
    let main = '';
    if (deg2 === 0 && mu === 0) {
      main = `Still going at ${vBot.toFixed(2)} m/s. Nothing is slowing it, so nothing stops it (the track repeats on screen; the real puck would carry straight on).`;
    } else if (deg2 === 0 && mu > 0) {
      main = `Stopped after ${maxS2.toFixed(1)} m on the flat. Friction did that.`;
    } else if (mu === 0) {
      main = `Back to exactly 1.00 m (after ${maxS2.toFixed(2)} m along the ${deg2}\u00b0 ramp): with no friction, nothing takes the motion away.`;
    } else {
      main = `Highest point reached: ${maxH.toFixed(2)} m of the 1.00 m it started with (after ${maxS2.toFixed(2)} m along the ${deg2}\u00b0 ramp). Friction spread the rest out as warming.`;
    }
    say(`${main} Motion is shown at half speed; drawn as a sliding puck (a real ball also spins, which Chapter 7 can afford).`);
  }

  api.slider('Second ramp angle', {
    min: 0, max: 40, step: 5, value: deg2,
    fmt: (val) => (val === 0 ? '0\u00b0 (flat)' : `${val}\u00b0`),
    onInput: (val) => { deg2 = val; reset(); },
  });

  api.slider('Friction', {
    min: 0, max: 0.30, step: 0.02, value: mu,
    fmt: (val) => (val === 0 ? 'none' : `friction ${val.toFixed(2)}`),
    onInput: (val) => { mu = +val.toFixed(2); reset(); },
  });

  api.button('Release', () => { reset(); });

  api.loop((dt) => {
    if (dt > 0) stepPhysics(dt);

    k.clear(c.plate);
    const ctx = k.ctx;

    // Geometry: bottom vertex at (vx, vy) = (210, 200), scale = 120 px per metre of height
    const scale = 110;
    const vx = 225, vy = 220;
    const xStart = vx - L1 * Math.cos(TH1) * scale;
    const yStart = vy - H0 * scale;

    const th2 = (deg2 * Math.PI) / 180;
    const maxDrawS2 = deg2 === 0 ? 3.4 : Math.min(3.5, 1.1 / Math.sin(Math.max(th2, 0.08)));
    const xEnd = vx + maxDrawS2 * Math.cos(th2) * scale;
    const yEnd = vy - maxDrawS2 * Math.sin(th2) * scale;

    // Dashed starting-height line
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xStart - 10, yStart);
    ctx.lineTo(615, yStart);
    ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, 'starting height 1.00 m', 612, yStart - 7, { size: 12, color: c.muted, align: 'right' });

    // Ground hash under vertex
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(20, vy + 10);
    ctx.lineTo(620, vy + 10);
    ctx.stroke();

    // First and second ramps
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(vx, vy);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();

    hatch(ctx,xStart,yStart,20,Math.max(0,vy-yStart),c.muted,10);
    dimension(ctx,24,yStart,24,vy,c.electron);
    api.draw.text(ctx,'1 m',34,(yStart+vy)/2,{size:12,color:c.electron});
    if(deg2===0){api.draw.arrow(ctx,560,vy-15,612,vy-15,c.electron,2,7);api.draw.text(ctx,'continues',585,vy-25,{size:12,color:c.electron,align:'center'});}

    // Labels for angles
    api.draw.text(ctx, '30\u00b0', vx - 46, vy - 6, { size: 12, color: c.muted, align: 'center' });
    api.draw.text(ctx, deg2 === 0 ? 'flat (0\u00b0)' : `${deg2}\u00b0`, vx + 58, vy - 6, { size: 12, color: c.muted, align: 'center' });

    // Ghost puck at highest point reached on second ramp (when finite and within screen or clamped)
    if (Number.isFinite(maxS2) && maxS2 > 0) {
      const gs2 = Math.min(maxS2, maxDrawS2);
      const gx = vx + gs2 * Math.cos(th2) * scale - Math.sin(th2) * 8;
      const gy = vy - gs2 * Math.sin(th2) * scale - Math.cos(th2) * 8;
      ctx.save();
      ctx.setLineDash([3, 2]);
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(gx, gy, 7.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      if (maxS2 <= maxDrawS2) {
        api.draw.text(ctx, `${maxH.toFixed(2)} m`, gx, gy - 13, { size: 11.5, color: c.muted, align: 'center', weight: 600 });
      }
    }

    // Current puck position (looping visibly on the flat track if s > L1 + maxDrawS2)
    let px = 0, py = 0, ux = 1, uy = 0, nx = 0, ny = -1;
    if (s <= L1) {
      ux = Math.cos(TH1);
      uy = Math.sin(TH1);
      nx = uy;
      ny = -ux;
      px = xStart + s * ux * scale + nx * 8;
      py = yStart + s * uy * scale + ny * 8;
    } else {
      let s2 = s - L1;
      if (deg2 === 0 && s2 > maxDrawS2) {
        s2 = s2 % maxDrawS2;
      } else {
        s2 = Math.min(s2, maxDrawS2);
      }
      ux = Math.cos(th2);
      uy = -Math.sin(th2);
      nx = -uy;
      ny = ux;
      px = vx + s2 * ux * scale + nx * 8;
      py = vy + s2 * uy * scale - Math.cos(th2) * 8;
    }

    // Draw the sliding puck
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fillStyle = c.ink;
    ctx.fill();

    // Small friction arrow on the puck while it slides (hidden when mu = 0)
    if (mu > 0 && Math.abs(v) > 0.02 && !stopped) {
      const dir = v > 0 ? -1 : 1; // opposing motion
      const fLen = 20 + mu * 90;
      const fx2 = px + dir * ux * fLen;
      const fy2 = py + dir * uy * fLen;
      api.draw.arrow(ctx, px, py, fx2, fy2, c.proton, 2.2, 7);
      api.draw.text(ctx, 'friction', fx2 + dir * 6, fy2 - 8, {
        size: 11.5, color: c.proton, align: dir > 0 ? 'left' : 'right', weight: 600,
      });
    }

    // Readout overlay on canvas for current speed & height
    const hNow = heightAt(s);
    api.draw.text(ctx, `height ${hNow.toFixed(2)} m · speed ${Math.abs(v).toFixed(2)} m/s`, 24, 28, {
      size: 12.5, color: c.ink, weight: 600,
    });
  });

  reset();
  return { destroy() {} };
}, { label: 'Slide the puck' });
