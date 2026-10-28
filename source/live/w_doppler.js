// 9.7 Doppler effect: moving horn past a platform listener, ring arrival times, gauge, and constant-gain Web Audio.
import { Live } from './core.js';

Live.register('doppler', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 300;
  const k = api.canvas(W, H, 'A train horn moving along a track past a listener, emitting circular sound wavefronts');

  const C_SOUND = 348.7; // m/s at 30 °C (CP 17.2)
  let speedKmh = 80;     // km/h (default 80 km/h)
  let hornHz = 300;      // Hz (default 300 Hz)

  // Geometry in metres: track along y = 0, listener on platform at (0, 1.4 m)
  // Visual scale: 1 m = 3.2 px, so 640 px = 200 m across (-100 m to +100 m)
  const SCALE = 3.2;
  const TRACK_Y = 135;
  const LISTENER_X_M = 0;
  const LISTENER_Y_M = 1.4; // 1.4 m from track centreline

  // Visual simulation time (slowed 10x so rings and train can be watched comfortably)
  // Audio pass time runs at real-time speed during a horn pass (~3.6 s for the pass)
  let visT = 1.25; // start with train approaching at x = -22 m with rings already spread
  let soundActive = false;
  let audioPassT = 0;
  let voice = null;

  // Compute observed frequency at listener by arrival times of successive wavefronts k-1 and k
  // emitted at t_k = k / hornHz from x(t_k) = xStart + v * t_k.
  function arrivalTime(kIdx, xStart, vMs, f0) {
    const tEmit = kIdx / f0;
    const xEmit = xStart + vMs * tEmit;
    const dist = Math.hypot(xEmit - LISTENER_X_M, LISTENER_Y_M);
    return tEmit + dist / C_SOUND;
  }

  function computeObservedHzAt(xTrainM, vMs, f0) {
    if (vMs < 0.01) return f0;
    // Place t = 0 at current train position xTrainM, and trace wavefronts emitted around retarded time
    const distNow = Math.hypot(xTrainM - LISTENER_X_M, LISTENER_Y_M);
    const tRet = -distNow / C_SOUND;
    const kEst = Math.floor(tRet * f0);
    // Search around kEst for the two successive rings whose arrival times bracket t = 0
    let kLow = kEst - 15;
    let tPrev = arrivalTime(kLow, xTrainM, vMs, f0);
    for (let k = kLow + 1; k <= kEst + 20; k++) {
      const tCur = arrivalTime(k, xTrainM, vMs, f0);
      if (tPrev <= 0 && tCur >= 0) {
        const dtArr = tCur - tPrev;
        return dtArr > 1e-6 ? 1 / dtArr : f0;
      }
      tPrev = tCur;
    }
    const dtArr = arrivalTime(kEst + 1, xTrainM, vMs, f0) - arrivalTime(kEst, xTrainM, vMs, f0);
    return dtArr > 1e-6 ? 1 / dtArr : f0;
  }

  function trainPosM() {
    const vMs = speedKmh / 3.6;
    if (soundActive) {
      // Real-time pass from -40 m to +40 m
      return -40 + vMs * audioPassT;
    }
    // Slowed 10x visual loop from -50 m to +50 m
    const span = 100;
    const d = ((visT * (vMs / 10)) % span);
    return -50 + d;
  }

  function stopHorn() {
    soundActive = false;
    if (voice) {
      voice.stop();
      voice = null;
    }
    if (hornBtn) {
      hornBtn.textContent = 'Sound the horn';
      hornBtn.setAttribute('aria-pressed', 'false');
    }
  }

  // Control 1: Train speed slider (0-120 km/h, default 80 km/h)
  api.slider('Train speed', {
    min: 0, max: 120, step: 5, value: speedKmh,
    fmt: (v) => `${v} km/h`,
    onInput: (v) => {
      speedKmh = v;
      drawFrame(0);
    },
  });

  // Control 2: Horn note slider (200-500 Hz, default 300 Hz)
  api.slider('Horn note', {
    min: 200, max: 500, step: 10, value: hornHz,
    fmt: (v) => `${v} Hz`,
    onInput: (v) => {
      hornHz = v;
      drawFrame(0);
    },
  });

  // Control 3: Sound the horn button
  const hornBtn = api.button('Sound the horn', () => {
    if (soundActive) {
      stopHorn();
    } else {
      soundActive = true;
      audioPassT = 0;
      hornBtn.textContent = 'Stop the horn';
      hornBtn.setAttribute('aria-pressed', 'true');
      const vMs = speedKmh / 3.6;
      const fObs = computeObservedHzAt(-40, vMs, hornHz);
      voice = api.audio().tone(fObs, { dur: Infinity, gain: 0.25, type: 'sawtooth' });
    }
    drawFrame(0);
  });

  api.onHide(stopHorn);
  const say = api.readout();

  function drawFrame(dt) {
    const vMs = speedKmh / 3.6;
    if (dt > 0) {
      visT += dt;
      if (soundActive) {
        audioPassT += dt;
        const xM = -40 + vMs * audioPassT;
        const fObsNow = computeObservedHzAt(xM, vMs, hornHz);
        if (voice) voice.setFreq(fObsNow);
        if (xM > 45 || audioPassT > 8) stopHorn();
      }
    }

    const xNowM = trainPosM();
    // For readout & gauge: when train is at xNowM, compute arrival-time frequency
    // On the initial still frame (xNowM < -5 m), this gives 320 Hz at 80 km/h, 300 Hz
    const fObs = computeObservedHzAt(xNowM, vMs, hornHz);
    const fObsRound = Math.round(fObs);
    const diff = Math.round(Math.abs(fObs - hornHz));
    const ratio = ((C_SOUND + vMs) / (C_SOUND - vMs)).toFixed(2);

    const ctx = k.ctx;
    k.clear(c.plate);

    // Draw railway track
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, TRACK_Y);
    ctx.lineTo(W, TRACK_Y);
    ctx.stroke();
    for (let x = 8; x < W; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, TRACK_Y - 4);
      ctx.lineTo(x, TRACK_Y + 4);
      ctx.stroke();
    }

    // Draw spreading wavefront rings (real ratio: horn moves at vMs, rings spread at C_SOUND in the same scale)
    // Emit one visual ring every dT_ring seconds of physical time so rings are spaced ~14 m apart at rest
    const dTRing = 14 / (C_SOUND * (hornHz / 300));
    const nRings = 16;
    for (let i = 1; i <= nRings; i++) {
      const agePhys = i * dTRing;
      const xEmitM = xNowM - vMs * agePhys;
      const radiusM = C_SOUND * agePhys;
      const cx = W / 2 + xEmitM * SCALE;
      const rPx = radiusM * SCALE;
      if (rPx > W * 1.1) continue;
      ctx.beginPath();
      ctx.arc(cx, TRACK_Y, rPx, 0, Math.PI * 2);
      ctx.strokeStyle = c.electron;
      ctx.globalAlpha = Math.max(0.12, 0.72 * (1 - i / (nRings + 2)));
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw train/horn at (W/2 + xNowM * SCALE, TRACK_Y)
    const trainX = W / 2 + xNowM * SCALE;
    ctx.fillStyle = c.proton;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.5;
    api.draw.roundRect(ctx, trainX - 22, TRACK_Y - 11, 44, 22, 4);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, `${hornHz} Hz`, trainX, TRACK_Y + 4, {
      size: 11, color: '#fff', align: 'center', weight: 700,
    });
    if (speedKmh > 0) {
      api.draw.arrow(ctx, trainX + 26, TRACK_Y, trainX + 52, TRACK_Y, c.proton, 2.2, 7);
    }

    // Draw listener on the platform at bottom centre
    const listX = W / 2;
    const listY = TRACK_Y + 42;
    ctx.beginPath();
    ctx.arc(listX, listY, 7, 0, Math.PI * 2);
    ctx.fillStyle = c.ink;
    ctx.fill();
    api.draw.text(ctx, 'You on the platform', listX, listY + 20, {
      size: 12, color: c.ink, align: 'center', weight: 600,
    });

    // Draw frequency gauge at bottom right and approaching/receding reference at bottom left
    const fApp = Math.round(computeObservedHzAt(-40, vMs, hornHz));
    const fRec = Math.round(computeObservedHzAt(40, vMs, hornHz));

    const boxY = 228, boxH = 56;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    api.draw.roundRect(ctx, 20, boxY, 270, boxH, 6);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, `Approaching: ${fApp} Hz   ·   Receding: ${fRec} Hz`, 32, boxY + 22, {
      size: 12, color: c.ink, weight: 600,
    });
    api.draw.text(ctx, `Ride with the driver: always ${hornHz} Hz`, 32, boxY + 42, {
      size: 11.5, color: c.muted,
    });

    // Gauge on the right
    const gX = 330, gW = 290;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    api.draw.roundRect(ctx, gX, boxY, gW, boxH, 6);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, `Pitch reaching you now: ${fObsRound} Hz`, gX + 14, boxY + 22, {
      size: 12, color: c.proton, weight: 700,
    });

    // Horizontal pitch bar centered on hornHz
    const barL = gX + 14, barR = gX + gW - 14, barMid = (barL + barR) / 2, barY = boxY + 38;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(barL, barY);
    ctx.lineTo(barR, barY);
    ctx.stroke();
    const frac = Math.max(-1, Math.min(1, (fObs - hornHz) / 60));
    const markerX = barMid + frac * ((barR - barL) / 2);
    ctx.beginPath();
    ctx.arc(markerX, barY, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = c.proton;
    ctx.fill();

    const dirWord = diff === 0 ? 'unchanged' : fObs >= hornHz ? `higher by ${diff} Hz` : `lower by ${diff} Hz`;
    say(
      `Train at ${speedKmh} km/h, horn ${hornHz} Hz. You hear ${fObsRound} Hz: ${dirWord} ` +
      `(${fApp} Hz approaching, ${fRec} Hz receding). The driver hears ${hornHz} Hz. ` +
      `Rings ahead are ${ratio}× closer than rings behind (sound in real time, drawing slowed 10×).`
    );
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() { stopHorn(); } };
}, { label: 'Hear the train pass' });
