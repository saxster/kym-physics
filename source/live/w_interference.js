// 11.5 Young's two-source interference: ripple tank view and stripes on a screen 1.00 m away.
import { Live } from './core.js';
import { note } from './art_waves.js';

function wavelengthToRGB(nm) {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm >= 440 && nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm >= 490 && nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm >= 510 && nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm >= 580 && nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm >= 645 && nm <= 750) { r = 1; }
  return [Math.round(r * 235 + 20), Math.round(g * 235 + 20), Math.round(b * 235 + 20)];
}

Live.register('interference', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 320;
  const k = api.canvas(W, H, 'Two-source wave interference showing circular ripples and bright and dark stripes on a screen');

  let dMm = 0.50;    // slit spacing in mm (0.1 to 1.0, default 0.5)
  let lamNm = 550;   // wavelength in nm (400 to 700, default 550)
  let tab = 0;       // 0 = Ripple tank, 1 = Stripes on a screen
  let phase = 0;
  let pointerMm = 1.10; // position y along the screen in mm (at d=0.5, lam=550, y=1.10 mm is exactly 1.0 wavelength!)

  const say = api.readout();

  // Control 1: Source spacing slider (0.1 to 1.0 mm)
  api.slider('Source spacing', {
    min: 0.1, max: 1.0, step: 0.05, value: dMm,
    fmt: (v) => `${v.toFixed(2)} mm`,
    onInput: (v) => {
      dMm = v;
      drawFrame(0);
    },
  });

  // Control 2: Wavelength slider (400 to 700 nm)
  api.slider('Wavelength', {
    min: 400, max: 700, step: 10, value: lamNm,
    fmt: (v) => `${v} nm`,
    onInput: (v) => {
      lamNm = v;
      drawFrame(0);
    },
  });

  // Control 3: Tabs Ripple tank / Stripes on a screen
  api.tabs(['Ripple tank', 'Stripes on a screen'], (i) => {
    tab = i;
    drawFrame(0);
  });

  // Drag pointer on the screen to inspect path difference in wavelengths
  let dragging = false;
  function updatePointer(e) {
    const r = k.cv.getBoundingClientRect();
    const py = ((e.clientY - r.top) / (r.height || H)) * H;
    // Screen runs vertically from y = 26 to y = 294 (mid = 160), scale: 36 px = 1 mm (range -3.5 mm to +3.5 mm)
    const mm = (160 - py) / 36;
    pointerMm = Math.max(-3.4, Math.min(3.4, mm));
    drawFrame(0);
  }
  k.cv.addEventListener('pointerdown', (e) => {
    dragging = true;
    k.cv.setPointerCapture(e.pointerId);
    updatePointer(e);
  });
  k.cv.addEventListener('pointermove', (e) => {
    if (dragging) updatePointer(e);
  });
  k.cv.addEventListener('pointerup', () => { dragging = false; });

  // Offscreen buffer for fast 2D interference ripple tank rendering (160 x 80 scaled 4x)
  const bufW = 160, bufH = 80;
  const offCv = document.createElement('canvas');
  offCv.width = bufW;
  offCv.height = bufH;
  const offCtx = offCv.getContext('2d');
  const imgData = offCtx.createImageData(bufW, bufH);

  note(stage,'Tank view compresses the source-spacing/wavelength ratio so the interference pattern can be seen. The screen view uses a separate 1.00 m optical geometry; its stripes, rather than tank pixels, carry the millimetre scale.');

  function updateReadout() {
    const L_mm = 1000; // 1.00 m = 1000 mm
    const lamMm = lamNm * 1e-6; // nm to mm
    const stripeMm = (lamMm * L_mm) / dMm; // lambda * L / d in mm
    // Exact path difference at pointerMm: sqrt(L^2 + (y + d/2)^2) - sqrt(L^2 + (y - d/2)^2)
    const r1 = Math.hypot(L_mm, pointerMm + dMm / 2);
    const r2 = Math.hypot(L_mm, pointerMm - dMm / 2);
    const diffWaves = Math.abs(r1 - r2) / lamMm;
    const frac = diffWaves - Math.floor(diffWaves);
    let kindText = 'intermediate brightness';
    if (frac < 0.15 || frac > 0.85) kindText = 'crest meets crest, bright';
    else if (Math.abs(frac - 0.5) < 0.15) kindText = 'crest meets trough, dark';
    const realRatio = Math.round((dMm * 1e6) / lamNm);

    say(
      `Sources ${dMm.toFixed(2)} mm apart, light ${lamNm} nm, screen 1.00 m away: stripes ${stripeMm.toFixed(2)} mm apart. ` +
      `At the pointer (${pointerMm >= 0 ? '+' : ''}${pointerMm.toFixed(2)} mm) the two paths differ by ${diffWaves.toFixed(2)} wavelengths: ${kindText}. ` +
      `(In the ripple view, time is slowed by about 10¹⁴ and the spacing-to-wavelength ratio of ${realRatio} is reduced 150× so individual crests are visible; screen colours are approximations of spectral colours.)`
    );
  }

  function drawRippleTank(ctx, rgb) {
    // Reduced ratio d / lambda in tank view: real ratio / 150, keeping both proportional to the sliders!
    const lamPx = (lamNm / 550) * 18;
    const sepPx = (dMm / 0.5) * (lamPx * 6.0);
    const kWave = (2 * Math.PI) / lamPx;

    const s1x = 56, s1y = H / 2 - sepPx / 2;
    const s2x = 56, s2y = H / 2 + sepPx / 2;

    const data = imgData.data;
    for (let by = 0; by < bufH; by++) {
      const y = (by + 0.5) * 4;
      for (let bx = 0; bx < bufW; bx++) {
        const x = (bx + 0.5) * (W - 90) / bufW;
        const r1 = Math.hypot(x - s1x, y - s1y);
        const r2 = Math.hypot(x - s2x, y - s2y);
        const a1 = Math.sin(kWave * r1 - phase) / Math.sqrt(Math.max(r1, 12) / 12);
        const a2 = Math.sin(kWave * r2 - phase) / Math.sqrt(Math.max(r2, 12) / 12);
        const h = (a1 + a2) * 0.5; // -1..1
        const bright = Math.max(0, Math.min(1, 0.5 + 0.48 * h));
        const idx = (by * bufW + bx) * 4;
        data[idx] = Math.round(20 + bright * (rgb[0] - 20));
        data[idx + 1] = Math.round(26 + bright * (rgb[1] - 26));
        data[idx + 2] = Math.round(28 + bright * (rgb[2] - 28));
        data[idx + 3] = 255;
      }
    }
    offCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(offCv, 0, 0, W - 90, H);

    // Draw source dots
    for (const sy of [s1y, s2y]) {
      ctx.beginPath();
      ctx.arc(s1x, sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = c.ink;
      ctx.stroke();
    }

    // Screen intensity strip on the right edge (x = 550..630)
    drawScreenStrip(ctx, rgb, 550, 80);
  }

  function drawScreenStrip(ctx, rgb, x0, wStrip) {
    const L_mm = 1000;
    const lamMm = lamNm * 1e-6;
    const midY = 160;
    const pxPerMm = 36;

    ctx.fillStyle = '#121816';
    ctx.fillRect(x0, 0, wStrip, H);

    for (let py = 20; py < H - 20; py++) {
      const yMm = (midY - py) / pxPerMm;
      const r1 = Math.hypot(L_mm, yMm + dMm / 2);
      const r2 = Math.hypot(L_mm, yMm - dMm / 2);
      const dPhi = (2 * Math.PI * (r1 - r2)) / lamMm;
      const intensity = Math.cos(dPhi / 2) ** 2; // exact cos^2(pi * delta_r / lambda)
      ctx.fillStyle = `rgb(${Math.round(rgb[0] * intensity)}, ${Math.round(rgb[1] * intensity)}, ${Math.round(rgb[2] * intensity)})`;
      ctx.fillRect(x0 + 8, py, wStrip - 16, 1.5);
    }

    // Pointer marker on the strip
    const ptrY = midY - pointerMm * pxPerMm;
    api.draw.arrow(ctx, x0 + wStrip - 4, ptrY, x0 + 10, ptrY, '#ffffff', 2, 6);
  }

  function drawScreenTab(ctx, rgb) {
    const L_mm = 1000;
    const lamMm = lamNm * 1e-6;
    const stripeMm = (lamMm * L_mm) / dMm;
    const midY = 160;
    const pxPerMm = 36;

    // Left: Schematic of the two slits and the two paths to the pointer on the screen 1.00 m away
    const slitX = 68;
    const screenX = 430;
    const slitHalfPx = Math.max(14, dMm * 48);
    const s1y = midY - slitHalfPx, s2y = midY + slitHalfPx;
    const ptrY = midY - pointerMm * pxPerMm;

    // Barrier with two slits
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(slitX, 24);
    ctx.lineTo(slitX, s1y - 6);
    ctx.moveTo(slitX, s1y + 6);
    ctx.lineTo(slitX, s2y - 6);
    ctx.moveTo(slitX, s2y + 6);
    ctx.lineTo(slitX, H - 24);
    ctx.stroke();
    api.draw.text(ctx, `d = ${dMm.toFixed(2)} mm`, slitX, H - 8, { size: 11, color: c.ink, align: 'center', weight: 600 });

    // Two paths from slits to pointer position on screen
    const colStr = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    ctx.strokeStyle = colStr;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(slitX, s1y);
    ctx.lineTo(screenX, ptrY);
    ctx.moveTo(slitX, s2y);
    ctx.lineTo(screenX, ptrY);
    ctx.stroke();

    // Label L = 1.00 m and path difference Δr
    const r1 = Math.hypot(L_mm, pointerMm + dMm / 2);
    const r2 = Math.hypot(L_mm, pointerMm - dMm / 2);
    const diffWaves = Math.abs(r1 - r2) / lamMm;
    api.draw.text(ctx, 'L = 1.00 m (not to scale horizontally)', (slitX + screenX) / 2, H - 10, {
      size: 11, color: c.muted, align: 'center',
    });
    api.draw.text(ctx, `Path difference = ${diffWaves.toFixed(2)} λ`, (slitX + screenX) / 2, 28, {
      size: 12, color: c.ink, align: 'center', weight: 700,
    });

    // Screen intensity strip and intensity curve
    drawScreenStrip(ctx, rgb, screenX, 74);

    // Intensity curve I(y) on the right (x = 516..616)
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    ctx.strokeRect(516, 20, 96, H - 40);
    ctx.beginPath();
    for (let py = 20; py <= H - 20; py++) {
      const yMm = (midY - py) / pxPerMm;
      const dPhi = (2 * Math.PI * (Math.hypot(L_mm, yMm + dMm / 2) - Math.hypot(L_mm, yMm - dMm / 2))) / lamMm;
      const intensity = Math.cos(dPhi / 2) ** 2;
      const x = 520 + intensity * 86;
      if (py === 20) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.strokeStyle = c.proton;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fringe spacing dimension bracket
    const y0 = midY, y1 = midY - stripeMm * pxPerMm;
    if (y1 > 28) {
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(screenX - 10, y0);
      ctx.lineTo(screenX - 2, y0);
      ctx.moveTo(screenX - 10, y1);
      ctx.lineTo(screenX - 2, y1);
      ctx.moveTo(screenX - 6, y0);
      ctx.lineTo(screenX - 6, y1);
      ctx.stroke();
      api.draw.text(ctx, `${stripeMm.toFixed(2)} mm`, screenX - 14, (y0 + y1) / 2 + 4, {
        size: 11, color: c.ink, align: 'right', weight: 600,
      });
    }
  }

  function drawFrame(dt) {
    phase += dt * 5.0;
    const ctx = k.ctx;
    k.clear(c.plate);
    const rgb = wavelengthToRGB(lamNm);
    if (tab === 0) drawRippleTank(ctx, rgb);
    else drawScreenTab(ctx, rgb);
    updateReadout();
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() {} };
}, { label: 'Overlap two waves' });
