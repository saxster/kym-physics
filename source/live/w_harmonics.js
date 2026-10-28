// 9.6 Harmonic builder: fundamental + overtones, string vs plain drum vs tabla, waveform + mode strip + Web Audio.
import { Live } from './core.js';

const LADDERS = [
  {
    name: 'String',
    ratios: [1, 2, 3, 4, 5, 6],
    decays: [1.5, 1.5, 1.5, 1.5, 1.5, 1.5],
    readout: 'String: overtones at 2, 3, 4… times the fundamental: a note you can hum (one 220th of a second, stretched).',
  },
  {
    name: 'Plain drum',
    ratios: [1, 1.593, 2.136, 2.295, 2.653, 2.917],
    decays: [0.9, 0.7, 0.55, 0.45, 0.4, 0.35],
    readout: 'Plain drum: overtones at 1.59, 2.14, 2.30… times the lowest: they clash, so you hear a thud with no clear note (one 220th of a second, stretched).',
  },
  {
    name: 'Tabla',
    ratios: [1, 2, 3, 4, 5, 6],
    decays: [1.5, 1.25, 1.0, 0.75, 0.55, 0.4],
    readout: 'Tabla: the syahi pulls the overtones onto whole numbers: it sings (one 220th of a second, stretched).',
  },
];

const DEFAULT_AMPS = [1, 0.5, 0.33, 0.25, 0.2, 0.17];

Live.register('harmonics', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 310;
  const k = api.canvas(W, H, 'Six overtone sliders, the combined waveform, and the first three vibration modes');

  let tabIdx = 0;
  const amps = DEFAULT_AMPS.slice();
  let mixChanged = false;
  let phase = 0;
  const say = api.readout();

  function isOddOnly() {
    return (
      tabIdx === 0 &&
      amps[0] > 0.05 &&
      (amps[2] > 0.05 || amps[4] > 0.05) &&
      amps[1] <= 0.05 &&
      amps[3] <= 0.05 &&
      amps[5] <= 0.05
    );
  }

  function updateReadout() {
    let msg = LADDERS[tabIdx].readout;
    if (mixChanged) msg += ' Timbre: same note, different mix.';
    if (isOddOnly()) msg += ' A pipe closed at one end has only these: 1, 3, 5.';
    say(msg);
  }

  // Control 1: Tabs String · Plain drum · Tabla
  api.tabs(['String', 'Plain drum', 'Tabla'], (i) => {
    tabIdx = i;
    mixChanged = false;
    updateReadout();
    drawFrame(0);
  });

  // Control 2: Overtone slider group (plus direct drag on the 6 vertical bars on the canvas)
  const overtoneSlider = api.slider('Upper overtones', {
    min: 0, max: 1, step: 0.05, value: 0.5,
    fmt: (v) => `${Math.round(v * 100)}%`,
    onInput: (v) => {
      const scale = v / 0.5;
      for (let i = 1; i < 6; i++) {
        amps[i] = Math.min(1, +(DEFAULT_AMPS[i] * scale).toFixed(2));
      }
      mixChanged = true;
      updateReadout();
      drawFrame(0);
    },
  });

  // Control 3: Play button (f0 = 220 Hz, 1.5 s, energy-normalised)
  api.button('Play', () => {
    const aud = api.audio();
    aud.stop();
    const ladder = LADDERS[tabIdx];
    let sumSq = 0;
    for (let i = 0; i < 6; i++) sumSq += amps[i] * amps[i];
    const norm = sumSq > 1e-6 ? 0.32 / Math.sqrt(sumSq) : 0;
    if (norm === 0) return;
    for (let i = 0; i < 6; i++) {
      if (amps[i] <= 0.005) continue;
      const dur = ladder.decays[i];
      aud.tone(220 * ladder.ratios[i], {
        gain: amps[i] * norm,
        dur,
        attack: 0.012,
        release: Math.min(0.25, dur * 0.45),
      });
    }
  });

  // Direct dragging of the 6 vertical amplitude sliders on the left of the canvas
  const sliderArea = { x0: 28, y0: 44, w: 210, h: 190 };
  function colX(i) {
    return sliderArea.x0 + 18 + i * 34;
  }

  let draggingBar = -1;
  function setBarFromPointer(e) {
    const r = k.cv.getBoundingClientRect();
    const px = ((e.clientX - r.left) / (r.width || W)) * W;
    const py = ((e.clientY - r.top) / (r.height || H)) * H;
    if (draggingBar < 0) {
      for (let i = 0; i < 6; i++) {
        if (Math.abs(px - colX(i)) < 16 && py >= sliderArea.y0 - 12 && py <= sliderArea.y0 + sliderArea.h + 16) {
          draggingBar = i;
          break;
        }
      }
    }
    if (draggingBar >= 0) {
      const val = Math.max(0, Math.min(1, 1 - (py - sliderArea.y0) / sliderArea.h));
      amps[draggingBar] = +val.toFixed(2);
      mixChanged = true;
      if (draggingBar === 1) overtoneSlider.set(amps[1]);
      updateReadout();
      drawFrame(0);
    }
  }

  k.cv.addEventListener('pointerdown', (e) => {
    draggingBar = -1;
    setBarFromPointer(e);
    if (draggingBar >= 0) k.cv.setPointerCapture(e.pointerId);
  });
  k.cv.addEventListener('pointermove', (e) => {
    if (draggingBar >= 0) setBarFromPointer(e);
  });
  k.cv.addEventListener('pointerup', () => { draggingBar = -1; });

  function drawFrame(dt) {
    phase += dt * 4.5;
    const ctx = k.ctx;
    k.clear(c.plate);
    const ladder = LADDERS[tabIdx];

    // Left panel: 6 vertical overtone sliders (the harmonic ladder)
    api.draw.text(ctx, 'Overtones (drag bars)', sliderArea.x0, 24, { size: 12, color: c.ink, weight: 600 });
    for (let i = 0; i < 6; i++) {
      const x = colX(i);
      const yTop = sliderArea.y0, yBot = yTop + sliderArea.h;
      ctx.strokeStyle = c.rule;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, yTop);
      ctx.lineTo(x, yBot);
      ctx.stroke();

      const yVal = yBot - amps[i] * sliderArea.h;
      ctx.strokeStyle = i === 0 ? c.proton : c.electron;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, yBot);
      ctx.lineTo(x, yVal);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, yVal, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = c.sheet;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = i === 0 ? c.proton : c.electron;
      ctx.stroke();

      const ratioLbl = Number.isInteger(ladder.ratios[i]) ? `${ladder.ratios[i]}f₀` : `${ladder.ratios[i].toFixed(2)}`;
      api.draw.text(ctx, ratioLbl, x, yBot + 18, { size: 10.5, color: c.ink, align: 'center', weight: 600 });
      api.draw.text(ctx, amps[i].toFixed(2), x, yBot + 32, { size: 10, color: c.muted, align: 'center' });
    }

    // Right top panel: Resulting waveform (one period of f0, plus faint continuation showing repeat vs clash)
    const waveX = 264, waveY = 36, waveW = 352, waveH = 136;
    const waveMid = waveY + waveH / 2;
    api.draw.text(ctx, 'Combined waveform (one 220th of a second, stretched)', waveX, 24, {
      size: 12, color: c.ink, weight: 600,
    });
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    ctx.strokeRect(waveX, waveY, waveW, waveH);
    ctx.beginPath();
    ctx.moveTo(waveX, waveMid);
    ctx.lineTo(waveX + waveW, waveMid);
    ctx.stroke();

    // Mark the end of 1 fundamental period T0 at 75% width, with the remaining 25% showing whether the next cycle repeats
    const splitX = waveX + waveW * 0.75;
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = c.muted;
    ctx.beginPath();
    ctx.moveTo(splitX, waveY);
    ctx.lineTo(splitX, waveY + waveH);
    ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, '1 period (1/220 s)', waveX + (splitX - waveX) / 2, waveY + waveH + 14, {
      size: 10.5, color: c.muted, align: 'center',
    });
    api.draw.text(ctx, tabIdx === 1 ? 'clashes next cycle' : 'repeats', splitX + (waveX + waveW - splitX) / 2, waveY + waveH + 14, {
      size: 10.5, color: tabIdx === 1 ? c.proton : c.green, align: 'center',
    });

    // Normalise waveform display height by max possible or RMS
    let maxAbs = 0.01;
    const Npts = 240;
    const vals = new Float32Array(Npts);
    for (let j = 0; j < Npts; j++) {
      const u = (j / (Npts * 0.75)); // u = 0..1.333 periods of f0
      let s = 0;
      for (let i = 0; i < 6; i++) {
        s += amps[i] * Math.sin(2 * Math.PI * ladder.ratios[i] * u);
      }
      vals[j] = s;
      if (Math.abs(s) > maxAbs) maxAbs = Math.abs(s);
    }
    const scaleY = (waveH * 0.42) / Math.max(1, maxAbs);

    ctx.beginPath();
    for (let j = 0; j < Npts; j++) {
      const x = waveX + (j / (Npts - 1)) * waveW;
      const y = waveMid - vals[j] * scaleY;
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = c.proton;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Right bottom panel: Mode strip showing the first three patterns lighting up in proportion to their amplitude
    const modeY = 206, modeW = 108, modeH = 66, modeGap = 14;
    api.draw.text(ctx, 'First three modes (lit by their amplitude)', waveX, modeY - 8, {
      size: 11.5, color: c.ink, weight: 600,
    });
    for (let m = 0; m < 3; m++) {
      const mx = waveX + m * (modeW + modeGap);
      const myMid = modeY + modeH / 2;
      const amp = amps[m];
      ctx.fillStyle = c.sheet;
      ctx.strokeStyle = amp > 0.05 ? c.electron : c.rule;
      ctx.lineWidth = amp > 0.05 ? 1.5 : 1;
      api.draw.roundRect(ctx, mx, modeY, modeW, modeH, 4);
      ctx.fill();
      ctx.stroke();

      // Draw vibrating standing-wave loop(s)
      ctx.save();
      ctx.globalAlpha = Math.max(0.15, amp);
      const nNodes = m + 1;
      const anim = Math.cos(phase * ladder.ratios[m]);
      // Envelope ghost
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      for (let p = 0; p <= 40; p++) {
        const u = p / 40;
        const xx = mx + 8 + u * (modeW - 16);
        const yy = myMid - Math.sin(nNodes * Math.PI * u) * 20 * amp;
        if (p === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Instantaneous string shape
      ctx.strokeStyle = m === 0 ? c.proton : c.electron;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let p = 0; p <= 40; p++) {
        const u = p / 40;
        const xx = mx + 8 + u * (modeW - 16);
        const yy = myMid - Math.sin(nNodes * Math.PI * u) * 20 * amp * anim;
        if (p === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.restore();

      const modeRatio = Number.isInteger(ladder.ratios[m]) ? `${ladder.ratios[m]}×f₀` : `${ladder.ratios[m].toFixed(2)}×f₀`;
      api.draw.text(ctx, `Mode ${m + 1} (${modeRatio})`, mx + modeW / 2, modeY + modeH + 14, {
        size: 10.5, color: c.muted, align: 'center',
      });
    }
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  updateReadout();
  drawFrame(0);
  return { destroy() {} };
}, { label: 'Build a note' });
