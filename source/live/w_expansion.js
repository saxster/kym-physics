// 15.7 Expanding ruler & balloon: v proportional to distance from every observer, constant galaxy size, and cosmological redshift z = s - 1.
import { Live } from './core.js';

const ANTS_CM = [2, 4, 7, 12];
const OBS_INDICES = [0, 2, 3]; // 2 cm, 7 cm, 12 cm ants

function waveRGBForScale(s) {
  // Shift colour from blue-green at s = 1.0 (z = 0) through yellow/orange to deep red at s = 3.0 (z = 2)
  const f = Math.max(0, Math.min(1, (s - 1.0) / 2.0));
  const r = Math.round(53 + f * (205 - 53));
  const g = Math.round(135 - f * 75);
  const b = Math.round(175 - f * 140);
  return `rgb(${r}, ${g}, ${b})`;
}

Live.register('expansion', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 330;
  const k = api.canvas(W, H, 'A stretching rubber ruler with four ants and a balloon ring of galaxies with a stretching light wave');

  let scaleS = 1.0;       // scale factor s from 1.0 to 3.0
  let obsChoice = 0;      // 0 -> 2 cm ant, 1 -> 7 cm ant, 2 -> 12 cm ant
  let balloonMode = false; // false = ruler mode, true = balloon mode

  const say = api.readout();

  // Control 1: Stretch slider (scale factor 1.0 to 3.0, default 1.0)
  const sSlider = api.slider('Stretch factor s', {
    min: 1.0, max: 3.0, step: 0.05, value: scaleS,
    fmt: (v) => `×${v.toFixed(2)} (z = ${(v - 1).toFixed(2)})`,
    onInput: (v) => {
      scaleS = v;
      drawFrame(0);
    },
  });

  // Control 2: Observer menu tabs ("Ant at 2 cm" · "Ant at 7 cm" · "Ant at 12 cm")
  api.tabs(['Me: ant at 2 cm', 'Me: ant at 7 cm', 'Me: ant at 12 cm'], (i) => {
    obsChoice = i;
    drawFrame(0);
  });

  // Control 3: Mode toggle button ("Ruler" / "Balloon")
  const modeBtn = api.button('Mode: ruler', () => {
    balloonMode = !balloonMode;
    modeBtn.textContent = balloonMode ? 'Mode: balloon' : 'Mode: ruler';
    modeBtn.setAttribute('aria-pressed', String(balloonMode));
    drawFrame(0);
  }, { pressed: false });

  function drawAntFixedSize(ctx, x, y, isMe, labelCm) {
    // Ant size is strictly constant (never scaled by scaleS!)
    const col = isMe ? c.proton : c.ink;
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    for (const dx of [-6, 0, 6]) {
      ctx.beginPath();
      ctx.arc(x + dx, y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const dx of [-4, 0, 4]) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y - 2);
      ctx.lineTo(x + dx - 2, y + 6);
      ctx.moveTo(x + dx, y + 2);
      ctx.lineTo(x + dx + 2, y + 6);
      ctx.stroke();
    }
    api.draw.text(ctx, isMe ? `Me (${labelCm} cm)` : `${labelCm} cm`, x, y - 12, {
      size: 11, color: col, align: 'center', weight: isMe ? 700 : 600,
    });
  }

  function drawRulerMode(ctx, myAntIdx, myCm) {
    const pxPerCm = 14.5; // fixed pixels per true cm!
    // Keep "me" anchored at x = 230 so the reader sees all other ants receding from whichever ant is chosen!
    const anchorX = obsChoice === 0 ? 140 : obsChoice === 1 ? 275 : 420;
    const xOfOrigCm = (cm0) => anchorX + (cm0 - myCm) * scaleS * pxPerCm;

    // Reference unstretched ruler (s = 1.0) at y = 78
    const refY = 78;
    const refL = anchorX + (0 - myCm) * 1.0 * pxPerCm;
    const refW = 14 * 1.0 * pxPerCm;
    ctx.fillStyle = c.paper;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1.2;
    api.draw.roundRect(ctx, refL, refY, refW, 28, 4);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, 'Start (s = 1.00, t = 0 min)', refL + 6, refY - 8, { size: 10.5, color: c.muted });
    for (let i = 0; i < ANTS_CM.length; i++) {
      const cm0 = ANTS_CM[i];
      const ax = anchorX + (cm0 - myCm) * 1.0 * pxPerCm;
      drawAntFixedSize(ctx, ax, refY - 6, i === myAntIdx, cm0);
    }

    // Stretched rubber ruler at y = 178 (lengthening at the same pxPerCm)
    const rulY = 178;
    const rulL = xOfOrigCm(0);
    const rulW = 14 * scaleS * pxPerCm;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.8;
    api.draw.roundRect(ctx, rulL, rulY, rulW, 34, 5);
    ctx.fill();
    ctx.stroke();

    // Stretched cm tick marks
    for (let cm = 0; cm <= 14; cm++) {
      const tx = xOfOrigCm(cm);
      if (tx < 12 || tx > W - 12) continue;
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, rulY);
      ctx.lineTo(tx, rulY + (cm % 2 === 0 ? 11 : 6));
      ctx.stroke();
    }

    // Ants riding with the stretched ruler (fixed size!) + velocity arrows from "me"
    for (let i = 0; i < ANTS_CM.length; i++) {
      const cm0 = ANTS_CM[i];
      const ax = xOfOrigCm(cm0);
      drawAntFixedSize(ctx, ax, rulY - 8, i === myAntIdx, cm0);
      if (i !== myAntIdx) {
        const d0 = cm0 - myCm; // original distance in cm (doubles in 1 min -> speed = |d0| cm/min)
        const dir = Math.sign(d0);
        const arrowLen = Math.abs(d0) * 6.5;
        const ay = rulY + 52 + (i % 2) * 18;
        api.draw.arrow(ctx, ax, ay, ax + dir * arrowLen, ay, c.proton, 2.2, 7);
        api.draw.text(ctx, `${Math.abs(d0)} cm/min`, ax + (dir * arrowLen) / 2, ay - 6, {
          size: 10.5, color: c.proton, align: 'center', weight: 700,
        });
      }
    }

    // Bottom strip: Light wave crossing the stretching space (wavelength × s, redshift z = s - 1)
    const waveY = 288, waveL = 140, waveBaseW = 130, waveW = waveBaseW * scaleS;
    const zRed = scaleS - 1.0;
    const colWave = waveRGBForScale(scaleS);
    ctx.strokeStyle = colWave;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    const nCycles = 6;
    for (let p = 0; p <= 140; p++) {
      const u = p / 140;
      const wx = waveL + u * waveW;
      const wy = waveY - Math.sin(u * nCycles * Math.PI * 2) * 12;
      if (p === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();
    api.draw.text(ctx, `Light wave stretched ×${scaleS.toFixed(2)}: wavelength × ${scaleS.toFixed(2)}, redshift z = Δλ/λ₀ = ${zRed.toFixed(2)}`, waveL, waveY + 28, {
      size: 11.5, color: c.ink, weight: 600,
    });
  }

  function drawBalloonMode(ctx, myAntIdx, myCm) {
    const cx = 230, cy = 165;
    const baseR = 52;
    const curR = baseR * scaleS; // grows from 52 px to 156 px

    // Faint reference circle at s = 1.0
    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Expanding balloon circle
    ctx.strokeStyle = c.electron;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, curR, 0, Math.PI * 2);
    ctx.stroke();

    // Light wave drawn along the top arc between two dots, stretching with the circle!
    const colWave = waveRGBForScale(scaleS);
    ctx.strokeStyle = colWave;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    const aStart = -Math.PI * 0.75, aEnd = -Math.PI * 0.25;
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const a = aStart + u * (aEnd - aStart);
      const rMod = curR + 9 * Math.sin(u * 5 * Math.PI * 2);
      const wx = cx + rMod * Math.cos(a), wy = cy + rMod * Math.sin(a);
      if (i === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();

    // 8 galaxy dots around the ring, each keeping strictly constant radius (6.5 px) as the circle grows!
    const nDots = 8;
    for (let i = 0; i < nDots; i++) {
      const a = (i / nDots) * Math.PI * 2 - Math.PI / 2;
      const gx = cx + curR * Math.cos(a);
      const gy = cy + curR * Math.sin(a);
      const isMe = i === obsChoice * 2;
      ctx.beginPath();
      ctx.arc(gx, gy, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = isMe ? c.proton : c.ink;
      ctx.fill();
      ctx.strokeStyle = c.sheet;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (isMe) {
        api.draw.text(ctx, 'Me (galaxy size unchanged)', gx, gy - 13, {
          size: 11, color: c.proton, align: 'center', weight: 700,
        });
      }
    }

    // Right info card
    const rx = 420, ry = 46, rw = 200, rh = 236;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    api.draw.roundRect(ctx, rx, ry, rw, rh, 6);
    ctx.fill();
    ctx.stroke();

    const zRed = scaleS - 1.0;
    api.draw.text(ctx, `Stretch factor s = ${scaleS.toFixed(2)}`, rx + 14, ry + 28, {
      size: 12, color: c.ink, weight: 700,
    });
    api.draw.text(ctx, `Wavelength λ = ${scaleS.toFixed(2)} λ₀`, rx + 14, ry + 54, {
      size: 11.5, color: c.electron, weight: 600,
    });
    api.draw.text(ctx, `Redshift z = s − 1 = ${zRed.toFixed(2)}`, rx + 14, ry + 78, {
      size: 11.5, color: c.proton, weight: 700,
    });
    api.draw.text(ctx, 'Galaxies do not grow:', rx + 14, ry + 114, {
      size: 11, color: c.ink, weight: 600,
    });
    api.draw.text(ctx, 'gravity holds each together.', rx + 14, ry + 132, {
      size: 10.5, color: c.muted,
    });
    api.draw.text(ctx, 'Real universe:', rx + 14, ry + 168, {
      size: 11, color: c.ink, weight: 600,
    });
    api.draw.text(ctx, 'H ≈ 22 km/s per Mly', rx + 14, ry + 186, {
      size: 11, color: c.electron, weight: 600,
    });
    api.draw.text(ctx, 'No edge and no centre.', rx + 14, ry + 212, {
      size: 10.5, color: c.muted,
    });
  }

  function drawFrame(dt) {
    if (dt > 0) {
      // Smoothly stretch from 1.0 to 3.0 and wrap when playing
      scaleS += dt * 0.25;
      if (scaleS > 3.0) scaleS = 1.0;
      sSlider.set(+scaleS.toFixed(2));
    }

    const ctx = k.ctx;
    k.clear(c.plate);

    const myAntIdx = OBS_INDICES[obsChoice];
    const myCm = ANTS_CM[myAntIdx];
    const others = ANTS_CM.filter((_, idx) => idx !== myAntIdx).map((cm) => Math.abs(cm - myCm));
    const zRed = scaleS - 1.0;

    if (!balloonMode) drawRulerMode(ctx, myAntIdx, myCm);
    else drawBalloonMode(ctx, myAntIdx, myCm);

    say(
      `Seen from the ant at ${myCm} cm: when the ruler doubles in one minute, the other ants recede at ${others[0]}, ${others[1]} and ${others[2]} cm per minute, strictly in proportion to their distance (choose another ant: the same law v ∝ d holds with no favoured centre; in the real universe H ≈ 22 km/s per million light-years). ` +
      `At stretch s = ${scaleS.toFixed(2)}, galaxies and ants do not grow (gravity holds a galaxy together), while a crossing light wave stretches to wavelength × ${scaleS.toFixed(2)}, giving redshift z = Δλ/λ₀ = s − 1 = ${zRed.toFixed(2)}. ` +
      `(The one-minute stretch is a cartoon of billions of years, and unlike the ruler and balloon, which have edges and a middle, the universe has neither.)`
    );
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() {} };
}, { label: 'Stretch the ruler' });
