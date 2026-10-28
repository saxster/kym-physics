// Ch 5.2 c5_phone_drop -> w_freefall: Accelerometer sensor lab showing |a| = 9.8 m/s^2 at rest and ~0 in free fall.
// Uses api.motion() for live device readings, plus a Replay the simulated drop button for readers without a sensor.
import { Live } from './core.js';
import { mechanismKey,phone } from './art_mechanics.js';

const G = 9.8;
const WINDOW_S = 4.0;

// Schematic 40 cm drop curve matching c5_phone_drop (0.286 s of free fall, then a pillow catch peak)
function schematicReading(t) {
  if (t < 0.60) return 9.8;
  if (t < 0.60 + 0.286) return 0.3;
  if (t < 0.60 + 0.286 + 0.12) {
    const u = (t - 0.886) / 0.12;
    return 9.8 + 13.5 * Math.sin(Math.PI * u);
  }
  return 9.8;
}

Live.register('freefall', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 345, 'Accelerometer trace against time showing 9.8 m/s^2 when held still and near 0 during free fall');
  const say = api.readout();
  mechanismKey(stage, "A sensor measures support, not gravity itself", ["Held: the hand or floor pushes the phone, so its accelerometer reads about 9.8 m/s\u00b2.", "Falling: phone and sensor fall together, so support is near zero. The catch produces the short peak."]);

  let samples = []; // [{t, g}]
  let t0Sensor = null;
  let replaying = false;
  let replayT = 0;

  // Free-fall detector state
  let lowStartT = null;
  let lastLowT = null;
  let lastDropDuration = null; // seconds

  function seedInitialReplay() {
    samples = [];
    for (let t = 0; t <= 1.6; t += 0.01) {
      processSample(t, schematicReading(t));
    }
    replaying = false;
  }

  function processSample(t, gVal) {
    samples.push({ t, g: gVal });
    // Keep 4 s scrolling window
    const cutoff = t - WINDOW_S;
    while (samples.length > 1 && samples[0].t < cutoff) {
      samples.shift();
    }

    if (gVal < 2.0) {
      if (lowStartT === null) lowStartT = t;
      lastLowT = t;
    } else if (gVal > 12.0 && lowStartT !== null && lastLowT !== null) {
      const dur = lastLowT - lowStartT;
      if (dur >= 0.10) {
        lastDropDuration = dur;
      }
      lowStartT = null;
      lastLowT = null;
    } else if (gVal > 5.0 && lastLowT !== null && t - lastLowT > 0.15) {
      lowStartT = null;
      lastLowT = null;
    }
  }

  function updateReadout() {
    const cur = samples[samples.length - 1];
    const gNow = cur ? cur.g : 9.8;
    const tag = !motion.active ? ' (simulated example, not your phone)' : '';

    if (lastDropDuration !== null) {
      const cm = Math.round(0.5 * G * lastDropDuration * lastDropDuration * 100);
      const longWarn = lastDropDuration > 0.6
        ? ' That was a long drop; please drop onto a pillow from no higher than your knee.'
        : '';
      say(`Sensor now ${gNow.toFixed(1)} m/s\u00b2${tag}: that was ${lastDropDuration.toFixed(2)} s of free fall. For that time nothing pushed on the phone, so it felt no weight. From the time, the drop was about ${cm} cm (\u00bdgt\u00b2).${longWarn}`);
      return;
    }

    if (gNow < 2.0) {
      say(`${gNow.toFixed(1)} m/s\u00b2${tag}: falling! Nothing is holding the phone up, so the sensor reads near zero.`);
    } else {
      say(`${gNow.toFixed(1)} m/s\u00b2${tag}: the table (or your hand) is holding the phone up against gravity.`);
    }
  }

  // Control 1: Use the motion sensor (via api.motion)
  const motion = api.motion({
    label: 'Use the motion sensor',
    onError: () => { updateReadout(); },
  });

  motion.onSample((s) => {
    replaying = false;
    if (t0Sensor === null) {
      t0Sensor = s.t;
      samples = [];
      lastDropDuration = null;
    }
    processSample(s.t - t0Sensor, s.g);
    updateReadout();
  });

  // Control 2: Clear button
  api.button('Clear', () => {
    samples = [];
    t0Sensor = null;
    replaying = false;
    replayT = 0;
    lowStartT = null;
    lastLowT = null;
    lastDropDuration = null;
    say('Trace cleared. Press "Use the motion sensor" or "Replay the simulated drop".');
  });

  // Control 3: Replay the simulated drop button
  api.button('Replay the simulated drop', () => {
    if (motion.active) motion.stop();
    samples = [];
    lowStartT = null;
    lastLowT = null;
    lastDropDuration = null;
    replayT = 0;
    replaying = true;
    if (api.reduced) {
      seedInitialReplay();
    }
    updateReadout();
  });

  // Start with the simulated trace visible so the initial frame is complete and informative
  seedInitialReplay();
  updateReadout();

  api.loop((dt) => {
    if (dt > 0 && replaying) {
      const targetT = Math.min(2.0, replayT + dt);
      while (replayT < targetT) {
        replayT = +(replayT + 0.01).toFixed(3);
        processSample(replayT, schematicReading(replayT));
      }
      if (replayT >= 2.0) replaying = false;
      updateReadout();
    }

    k.clear(c.plate);
    const ctx = k.ctx;

    // Safety line on the stage
    api.draw.text(ctx, 'Safety: use a soft pillow on the floor, no higher than your knee.', 70, 22, {
      size: 12, color: c.proton, weight: 600,
    });
    if (!motion.active) {
      api.draw.text(ctx, 'simulated trace', 610, 42, {
        size: 11.5, color: c.muted, align: 'right',
      });
    }

    const x0 = 70, y0 = 212, w = 540, h = 165;
    const maxA = 25;
    const sy = h / maxA;

    // Axes
    api.draw.arrow(ctx, x0, y0, x0 + w + 8, y0, c.ink, 1.5, 6);
    api.draw.arrow(ctx, x0, y0, x0, y0 - h - 8, c.ink, 1.5, 6);
    api.draw.text(ctx, 'time (4 s window)', x0 + w, y0 + 28, { size: 12, color: c.muted, align: 'right' });
    api.draw.text(ctx, 'sensor |a| (m/s\u00b2)', x0 + 8, y0 - h + 4, { size: 12, color: c.muted, weight: 600 });

    // Y ticks at 0, 9.8, 20
    for (const [val, lab] of [[0, '0'], [9.8, '9.8'], [20, '20']]) {
      const y = y0 - val * sy;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x0 - 5, y);
      ctx.lineTo(x0, y);
      ctx.stroke();
      api.draw.text(ctx, lab, x0 - 9, y + 4, { size: 11.5, color: c.muted, align: 'right' });
    }

    // Dashed reference line at 9.8 m/s^2
    const y98 = y0 - 9.8 * sy;
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x0, y98);
    ctx.lineTo(x0 + w, y98);
    ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, 'held still: 9.8 m/s\u00b2', x0 + 12, y98 - 7, { size: 11.5, color: c.muted });

    // Plot samples in 4 s window
    if (samples.length > 0) {
      const tEnd = Math.max(WINDOW_S, samples[samples.length - 1].t);
      const tStart = tEnd - WINDOW_S;
      const sx = w / WINDOW_S;

      for (let sTick = 0; sTick <= 4; sTick++) {
        const tx = x0 + sTick * sx;
        ctx.beginPath(); ctx.moveTo(tx, y0); ctx.lineTo(tx, y0 + 4); ctx.strokeStyle = c.ink; ctx.stroke();
        api.draw.text(ctx, `${(tStart + sTick).toFixed(0)} s`, tx, y0 + 16, { size: 11, color: c.muted, align: 'center' });
      }

      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      samples.forEach((pt, idx) => {
        const px = x0 + (pt.t - tStart) * sx;
        const py = y0 - Math.min(maxA, pt.g) * sy;
        if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();

      const last = samples[samples.length - 1];
      const lx = x0 + (last.t - tStart) * sx;
      const ly = y0 - Math.min(maxA, last.g) * sy;
      ctx.beginPath();
      ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = c.electron;
      ctx.fill();
    }
    // The three physical states make the otherwise surprising zero reading intelligible.
    for(const [x,label,stateCol] of [[130,'held',c.muted],[320,'falling',c.electron],[510,'caught',c.proton]]){
      phone(ctx,x-13,278,26,43,c);
      if(label==='held'){ctx.strokeStyle=c.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-23,324);ctx.lineTo(x+23,324);ctx.stroke();api.draw.arrow(ctx,x+23,317,x+23,289,stateCol,2,6);}
      else if(label==='falling'){ctx.save();ctx.setLineDash([3,3]);api.draw.arrow(ctx,x+24,281,x+24,315,stateCol,1.8,6);ctx.restore();}
      else{ctx.fillStyle=c.mark_soft;ctx.beginPath();ctx.ellipse(x,325,35,9,0,0,Math.PI*2);ctx.fill();api.draw.arrow(ctx,x+23,317,x+23,289,stateCol,3,6);}
      api.draw.text(ctx,label,x,264,{size:13,color:stateCol,align:'center',weight:600});
    }

  });

  return { destroy() {} };
}, { label: 'Try the drop trace' });
