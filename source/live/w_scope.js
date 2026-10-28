// 9.5 Microphone oscilloscope & spectrum strip: loudness is amplitude, pitch is frequency.
import { Live } from './core.js';
import { note } from './art_waves.js';

Live.register('scope', (stage, params, api) => {
  const c = api.colors();
  note(stage,'The microphone signal is a relative amplitude, not calibrated pressure in pascals. Compare trace height for loudness and the spacing of peaks for pitch. The initial trace is a simulated 220 Hz preview.');
  const W = 640, H = 320;
  const k = api.canvas(W, H, 'Oscilloscope showing relative microphone amplitude against time and a frequency spectrum strip');

  let showSpectrum = false;
  let frozenWave = null;
  let frozenFreq = null;
  let freezeActive = false;

  // Synthetic preview buffers shown before the reader activates the microphone
  const N = 2048;
  const previewTime = new Float32Array(N);
  const previewFreq = new Float32Array(N / 2);
  for (let i = 0; i < N; i++) {
    const t = i / 48000;
    previewTime[i] = 0.32 * Math.sin(2 * Math.PI * 220 * t) + 0.08 * Math.sin(2 * Math.PI * 440 * t);
  }
  for (let i = 0; i < N / 2; i++) previewFreq[i] = -85;
  const bin220 = Math.round(220 / (48000 / N));
  const bin440 = Math.round(440 / (48000 / N));
  previewFreq[bin220] = -22;
  if (bin220 > 0) previewFreq[bin220 - 1] = -30;
  previewFreq[bin220 + 1] = -30;
  previewFreq[bin440] = -36;

  // Control 1: Use my microphone
  const mic = api.mic({
    fftSize: N,
    smoothing: 0.65,
    onStart: () => drawFrame(),
    onStop: () => drawFrame(),
  });

  // Control 2: Tabs Waveform / Both
  api.tabs(['Waveform', 'Both'], (i) => {
    showSpectrum = i === 1;
    drawFrame();
  });

  // Control 3: Freeze button
  const freezeBtn = api.button('Freeze', () => {
    if (!freezeActive) {
      const srcT = mic.active ? mic.time() : previewTime;
      const srcF = mic.active ? mic.freq() : previewFreq;
      frozenWave = new Float32Array(srcT);
      frozenFreq = new Float32Array(srcF);
      freezeActive = true;
      freezeBtn.textContent = 'Unfreeze';
      freezeBtn.setAttribute('aria-pressed', 'true');
    } else {
      freezeActive = false;
      freezeBtn.textContent = 'Freeze';
      freezeBtn.setAttribute('aria-pressed', 'false');
    }
    drawFrame();
  });

  const metrics=document.createElement('div');metrics.style.cssText='padding:12px 14px;font:14px/1.6 var(--sans);color:var(--ink);background:var(--sheet)';metrics.setAttribute('aria-label','Oscilloscope axes and measurements');stage.append(metrics);
  const say = api.readout();

  function analysePitch(fd, binHz) {
    const len = fd.length;
    const minBin = Math.max(1, Math.ceil(20 / binHz));
    const vals = [];
    let bestBin = minBin, bestVal = -Infinity;
    for (let i = minBin; i < len; i++) {
      const v = fd[i];
      vals.push(v);
      if (v > bestVal) {
        bestVal = v;
        bestBin = i;
      }
    }
    vals.sort((a, b) => a - b);
    const median = vals[Math.floor(vals.length / 2)] ?? -100;
    if (bestVal - median >= 12 && bestVal > -110) {
      return `${Math.round(bestBin * binHz)} Hz`;
    }
    return 'no clear note';
  }

  function computeRms(td) {
    let s = 0;
    for (let i = 0; i < td.length; i++) s += td[i] * td[i];
    return Math.sqrt(s / td.length);
  }

  function drawTrace(ctx, buf, sr, topY, h, color, width, alpha = 1) {
    const midY = topY + h / 2;
    const ampScale = h * 0.42; // fixed vertical scale
    // Trigger on rising zero-crossing for a steady display
    let trig = 0;
    for (let i = 1; i < buf.length / 2; i++) {
      if (buf[i - 1] <= 0 && buf[i] > 0) { trig = i; break; }
    }
    const samplesToShow = Math.min(buf.length - trig, Math.round(0.020 * sr)); // 20 ms window
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let i = 0; i < samplesToShow; i++) {
      const x = 48 + (i / (samplesToShow - 1)) * (W - 68);
      const y = midY - Math.max(-1, Math.min(1, buf[trig + i])) * ampScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawFrame() {
    const ctx = k.ctx;
    k.clear(c.plate);

    const sr = mic.active ? mic.sampleRate : 48000;
    const binHz = mic.active ? mic.binHz : 48000 / N;
    const liveT = mic.active ? mic.time() : previewTime;
    const liveF = mic.active ? mic.freq() : previewFreq;
    const activeT = freezeActive && frozenWave ? frozenWave : liveT;
    const activeF = freezeActive && frozenFreq ? frozenFreq : liveF;

    const waveH = showSpectrum ? 210 : 280;
    const waveTop = 16;
    const waveMid = waveTop + waveH / 2;
    const plotL = 48, plotR = W - 20, plotW = plotR - plotL;

    // Frame and zero-pressure line
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    ctx.strokeRect(plotL, waveTop, plotW, waveH);
    ctx.beginPath();
    ctx.moveTo(plotL, waveMid);
    ctx.lineTo(plotR, waveMid);
    ctx.stroke();

    // Time axis ticks in milliseconds (0 to 20 ms)
    for (let ms = 0; ms <= 20; ms += 5) {
      const x = plotL + (ms / 20) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, waveTop + waveH);
      ctx.lineTo(x, waveTop + waveH + 4);
      ctx.strokeStyle = c.muted;
      ctx.stroke();
      api.draw.text(ctx, `${ms} ms`, x, waveTop + waveH + 15, { size: 11, color: c.muted, align: 'center' });
    }
    api.draw.text(ctx, 'signal', 10, waveMid, { size: 11, color: c.muted });
    api.draw.text(ctx, '+', 36, waveTop + 14, { size: 11, color: c.muted, align: 'center' });
    api.draw.text(ctx, '0', 36, waveMid + 4, { size: 11, color: c.muted, align: 'center' });
    api.draw.text(ctx, '−', 36, waveTop + waveH - 6, { size: 11, color: c.muted, align: 'center' });

    // Previous frozen trace drawn in muted colour under the live trace
    if (frozenWave && (!freezeActive || mic.active)) {
      drawTrace(ctx, frozenWave, sr, waveTop, waveH, c.muted, 1.6, 0.65);
    }
    drawTrace(ctx, activeT, sr, waveTop, waveH, c.proton, 2.2, 1);

    if (!mic.active) {
      api.draw.text(ctx, 'Preview hum (220 Hz): press "Use my microphone" for your live voice', plotL + 10, waveTop + 18, {
        size: 11.5, color: c.muted,
      });
    } else if (freezeActive) {
      api.draw.text(ctx, 'Frozen trace held for comparison', plotL + 10, waveTop + 18, {
        size: 11.5, color: c.proton, weight: 600,
      });
    }

    // Spectrum strip (20 Hz to Nyquist on a log axis, 640 x 80 area at bottom)
    if (showSpectrum) {
      const specTop = 246, specH = 54, specBot = specTop + specH;
      ctx.strokeStyle = c.rule;
      ctx.strokeRect(plotL, specTop, plotW, specH);

      const fMin = 20, fMax = sr / 2;
      const logMin = Math.log10(fMin), logMax = Math.log10(fMax);
      const xOfFreq = (f) => plotL + ((Math.log10(f) - logMin) / (logMax - logMin)) * plotW;

      for (const fMark of [20, 100, 1000, 10000]) {
        if (fMark > fMax) continue;
        const x = xOfFreq(fMark);
        ctx.beginPath();
        ctx.moveTo(x, specBot);
        ctx.lineTo(x, specBot + 4);
        ctx.strokeStyle = c.muted;
        ctx.stroke();
        const lbl = fMark === 10000 ? '10,000 Hz' : `${fMark} Hz`;
        api.draw.text(ctx, lbl, x, specBot + 14, { size: 10.5, color: c.muted, align: 'center' });
      }

      // Draw spectrum bins
      ctx.beginPath();
      let started = false;
      for (let i = 1; i < activeF.length; i++) {
        const f = i * binHz;
        if (f < fMin || f > fMax) continue;
        const x = xOfFreq(f);
        const norm = Math.max(0, Math.min(1, (activeF[i] + 100) / 80));
        const y = specBot - norm * (specH - 6);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      api.draw.text(ctx, 'spectrum (audible range)', plotL + 8, specTop + 14, { size: 10.5, color: c.electron });
    }

    // Readout computation
    const rms = computeRms(activeT);
    const relDb = Math.max(0, Math.round(20 * Math.log10(Math.max(rms, 1e-4) / 1e-4)));
    const pitchStr = analysePitch(activeF, binHz);
    metrics.textContent=`${mic.active?'Microphone':'Simulated preview'}${freezeActive?' · frozen':''} · Pitch: ${pitchStr} · Relative signal: ${relDb} dB · Time axis: milliseconds · Vertical axis: arbitrary digital amplitude`;
    say(
      `Taller trace, same spacing: louder, same note. Closer crests: a higher note, ${pitchStr}. ` +
      `Relative signal level ${relDb} dB above an arbitrary digital reference; this is not a sound-level meter. ` +
      `${mic.active ? "Your live microphone signal" : "The simulated preview"} is plotted against the labelled millisecond time axis.`
    );
  }

  api.loop(() => {
    drawFrame();
  });

  drawFrame();
  return { destroy() {} };
}, { label: 'See your voice' });
