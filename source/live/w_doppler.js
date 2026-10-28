// 9.7 Doppler effect: moving horn past a platform listener, ring arrival times, gauge, and constant-gain Web Audio.
import { Live } from './core.js';
import { note, legend } from './art_waves.js';
import { sampledWavefronts, SOUND_SPEED_MS, CREST_STRIDE } from './doppler_model.mjs';

Live.register('doppler', (stage, params, api) => {
  const c = api.colors();
  note(stage,'Each ring keeps the centre where it was emitted. A moving horn changes the time between arrivals, not the speed of sound. The frequency gauge is the sound reaching the platform listener.');
  legend(stage,[['Sampled sound crests',c.electron],['Horn / current source',c.proton]]);
  const arrival=document.createElement('p');arrival.style.cssText='margin:0;padding:10px 14px;font:13px/1.5 var(--sans);color:var(--ink);background:var(--sheet)';stage.append(arrival);
  const W = 640, H = 300;
  const k = api.canvas(W, H, 'A train horn moving along a track past a listener, emitting circular sound wavefronts');

  const C_SOUND = SOUND_SPEED_MS; // m/s at 30 °C (CP 17.2)
  let speedKmh = 80;     // km/h (default 80 km/h)
  let hornHz = 300;      // Hz (default 300 Hz)

  // Geometry in metres: track along y = 0, listener on platform at (0, 1.4 m)
  // Visual scale: 1 m = 3.2 px, so 640 px = 200 m across (-100 m to +100 m)
  const SCALE = 3.2;
  const TRACK_Y = 135;
  const LISTENER_X_M = 0;
  const LISTENER_Y_M = 1.4; // 1.4 m from track centreline

  // Physical clock: silent demonstration advances at one tenth real time.
  // A requested audio pass advances the same geometry at real time, matching the
  // actual-frequency horn. Every crest keeps its fixed emission point in the air.
  let visT = 1.25; // physical seconds: the train begins near -22 m at 80 km/h
  let sourceStartXM = -50;
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
    return sourceStartXM + (speedKmh / 3.6) * visT;
  }

  function restartAtCurrentPosition() {
    // A slider creates a new constant-speed/note case. Clear its old emission
    // history rather than relabelling existing crests with the new parameters.
    sourceStartXM = trainPosM();
    visT = 0;
    audioPassT = 0;
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
      restartAtCurrentPosition();
      speedKmh = v;
      drawFrame(0);
    },
  });

  // Control 2: Horn note slider (200-500 Hz, default 300 Hz)
  api.slider('Horn note', {
    min: 200, max: 500, step: 10, value: hornHz,
    fmt: (v) => `${v} Hz`,
    onInput: (v) => {
      restartAtCurrentPosition();
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
      visT = 0;
      sourceStartXM = -40;
      // Asking to hear the pass also starts it if the reader paused the view.
      if (playBtn?.getAttribute('aria-pressed') !== 'true') playBtn?.click();
      hornBtn.textContent = 'Stop the horn';
      hornBtn.setAttribute('aria-pressed', 'true');
      const vMs = speedKmh / 3.6;
      const fObs = computeObservedHzAt(-40, vMs, hornHz);
      voice = api.audio().tone(fObs, { dur: Infinity, gain: 0.25, type: 'sawtooth' });
    }
    drawFrame(0);
  });

  api.onHide(stopHorn);
  // The runtime pauses its clock at dt=0 but does not stop a sustained tone.
  // Stop this widget's horn whenever Pause or Still mode stops the clock.
  const playBtn = stage.parentElement.querySelector('.live-play');
  const pauseObserver = new MutationObserver(() => {
    if (soundActive && playBtn?.getAttribute('aria-pressed') === 'false') {
      stopHorn();
      drawFrame(0);
    }
  });
  if (playBtn) pauseObserver.observe(playBtn, { attributes: true, attributeFilter: ['aria-pressed'] });
  api.onCleanup(() => pauseObserver.disconnect());
  const say = api.readout();

  function drawFrame(dt) {
    const vMs = speedKmh / 3.6;
    if (dt > 0) {
      if (soundActive) {
        audioPassT += dt;
        visT = audioPassT;
        const xM = trainPosM();
        const fObsNow = computeObservedHzAt(xM, vMs, hornHz);
        if (voice) voice.setFreq(fObsNow);
        if (xM > 45 || audioPassT > 8) stopHorn();
      } else {
        visT += dt / 10;
        if (trainPosM() > 50) { sourceStartXM = -50; visT = 0; }
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

    // Every twelfth crest is sampled so actual sound wavelengths do not turn
    // the diagram into a solid blur. Emission centres stay fixed; only radii
    // grow, at c times the same physical clock used for the moving source.
    const maxRadiusM = 220;
    const fronts = sampledWavefronts({
      timeS: visT, sourceStartXM, sourceSpeedMs: vMs, frequencyHz: hornHz, maxRadiusM,
    });
    const timed=fronts.map(front=>({...front,arrives:front.emittedAtS+Math.hypot(front.centreXM,LISTENER_Y_M)/C_SOUND}));
    const next=timed.findIndex(front=>front.arrives>=visT),pair=next>0?[timed[next-1],timed[next]]:timed.slice(0,2);
    arrival.textContent=pair.length===2?`Highlighted crests A → B: ${(1000*(pair[1].arrives-pair[0].arrives)).toFixed(1)} ms between arrivals (${CREST_STRIDE} sound cycles). One cycle reaches you every ${(1000/fObs).toFixed(2)} ms. The listening point is 1.4 m off the track.`:'The horn is starting: waiting for two sampled crests.';
    for (const front of fronts) {
      if (front.radiusM === 0) continue;
      const cx = W / 2 + front.centreXM * SCALE;
      const rPx = front.radiusM * SCALE;
      ctx.beginPath();
      ctx.arc(cx, TRACK_Y, rPx, 0, Math.PI * 2);
      const tag=pair.findIndex(p=>p.index===front.index);
      ctx.strokeStyle = tag>=0?c.neutron:c.electron;
      ctx.globalAlpha = tag>=0?1:Math.max(0.12, 0.72 * (1 - front.radiusM / maxRadiusM));
      ctx.lineWidth = tag>=0?2.6:1.6;
      ctx.stroke();
      if(tag>=0){const edge=xNowM<0?cx+rPx:cx-rPx;if(edge>16&&edge<W-16)api.draw.text(ctx,tag?'B':'A',edge,TRACK_Y-16,{size:13,color:c.neutron,weight:700,align:'center'});}
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

    // The small dot is the physical listening point, 1.4 m off the track.
    // A leader offsets the person below it so the horn and rings stay visible.
    const listeningY = TRACK_Y + LISTENER_Y_M * SCALE;
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(W / 2, listeningY); ctx.lineTo(W / 2, TRACK_Y + 33); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(W / 2, listeningY, 3, 0, Math.PI * 2);
    ctx.fillStyle = c.green; ctx.fill();

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
      `Ahead/behind spacing ratio: ${ratio} (behind spacing ÷ ahead spacing). ` +
      `Each drawn ring samples every ${CREST_STRIDE}th crest; actual sound has ${hornHz} crests per second. ` +
      (soundActive ? 'Sound and drawing run in real time during this pass. ' : 'The silent drawing runs 10× slower. ') +
      'The listening point is 1.4 m from the track; the person is drawn lower for clarity.'
    );
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() { stopHorn(); } };
}, { label: 'Hear the train pass' });
