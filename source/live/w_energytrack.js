// Ch 7.3 c7_track -> w_energytrack: Direct-drag bead on hill track, draggable h=0 datum,
// Earth/Moon/Jupiter gravity, Bars/Jars/Floating-Pie views, and strobe-dot Energy Probe.
import { Live } from './core.js';
import { mechanismKey, dimension } from './art_mechanics.js';
import { simPalette, drawVector, drawMiniPie, fmtSpeed, canvasPointerCoords } from './draft_canvas.js';
import { createPathProbe, createReferenceLine } from './probes.js';
import { GRAVITIES, energyTrackAt } from './phet_models.mjs';
import { playTone } from './atlas/engine/sound.js';

const MARBLES = [
  { name: 'Glass (20 g)', m: 0.020 },
  { name: 'Steel (60 g)', m: 0.060 },
];

const NODES = [
  [0.0, 1.55],
  [1.5, 0.00],
  [2.7, 0.80],
  [3.2, 0.50],
  [4.0, 1.55],
];

function trackHeight(x) {
  if (x <= NODES[0][0]) return NODES[0][1];
  if (x >= NODES[NODES.length - 1][0]) return NODES[NODES.length - 1][1];
  for (let i = 0; i < NODES.length - 1; i++) {
    const [x0, y0] = NODES[i];
    const [x1, y1] = NODES[i + 1];
    if (x >= x0 && x <= x1) {
      const u = (x - x0) / (x1 - x0);
      return y0 + (y1 - y0) * (0.5 - 0.5 * Math.cos(Math.PI * u));
    }
  }
  return 0;
}

function trackSlope(x) {
  if (x <= NODES[0][0] || x >= NODES[NODES.length - 1][0]) return 0;
  for (let i = 0; i < NODES.length - 1; i++) {
    const [x0, y0] = NODES[i];
    const [x1, y1] = NODES[i + 1];
    if (x >= x0 && x <= x1) {
      const u = (x - x0) / (x1 - x0);
      return ((y1 - y0) / (x1 - x0)) * 0.5 * Math.PI * Math.sin(Math.PI * u);
    }
  }
  return 0;
}

function findReleaseX(h0) {
  const [x0, y0] = NODES[0];
  const [x1, y1] = NODES[1];
  const ratio = Math.max(-1, Math.min(1, 1 - (2 * (h0 - y0)) / (y1 - y0)));
  const u = Math.acos(ratio) / Math.PI;
  return x0 + u * (x1 - x0);
}

Live.register('energytrack', (stage, params, api) => {
  const k = api.canvas(640, 320, 'A sliding bead on a hill track with draggable height datum, strobe probe, and energy accounting');
  let mu = 0.0;
  let h0 = 1.0;
  let marbleIdx = 0;
  let viewMode = 0; // 0 = Bars, 1 = Glowing jars, 2 = Pie on bead
  let gIdx = 0;     // 0 = Earth, 1 = Moon, 2 = Jupiter
  let hRef = 0.0;

  let x = findReleaseX(h0);
  let dir = 1;
  let thermalPerKg = 0;
  let stopped = false;
  let draggingBead = false;
  let lastChimeAt = 0;

  const say = api.readout();
  mechanismKey(stage, 'Follow the same energy account', [
    'Drag the bead directly onto the slope or drag the dashed h₀ = 0 datum line on the left margin.',
    'Click any strobe dot along the path to inspect exact height, speed, and joules at that instant.',
  ]);

  const tx0 = 36, tw = 354, yBase = 252, pxPerH = 132;
  const pxPerX = tw / 4.0;
  const X = (xm) => tx0 + xm * pxPerX;
  const Y = (hm) => yBase - hm * pxPerH;
  const invX = (cx) => Math.max(0.02, Math.min(3.98, (cx - tx0) / pxPerX));
  const invH = (cy) => Math.max(0, Math.min(1.5, (yBase - cy) / pxPerH));

  const currentEnergies = () => {
    const g = GRAVITIES[gIdx].g;
    return energyTrackAt({ m: MARBLES[marbleIdx].m, g, h: trackHeight(x), h0, hRef, thermalPerKg });
  };

  let pathProbe = null;
  let refDatum = null;

  api.onPrefs(() => {
    updateReadout();
    api.redraw?.();
  });

  function reset(clearDots = true) {
    x = findReleaseX(h0);
    dir = 1;
    thermalPerKg = 0;
    stopped = false;
    if (clearDots && pathProbe) pathProbe.clear();
    updateReadout();
    api.redraw?.();
  }

  function stepPhysics(dtReal) {
    if (stopped || draggingBead || dtReal <= 0) return;
    const g = GRAVITIES[gIdx].g;
    let rem = dtReal;
    const dt = 0.002;
    while (rem > 1e-6 && !stopped) {
      const step = Math.min(dt, rem);
      rem -= step;
      const hCur = trackHeight(x);
      const slope = trackSlope(x);
      const cosT = 1 / Math.sqrt(1 + slope * slope);
      const sinT = slope * cosT;
      const avail = g * (h0 - hCur) - thermalPerKg;
      let v = avail > 0 ? Math.sqrt(2 * avail) : 0;

      if (v < 0.02) {
        if (Math.abs(sinT) <= mu * cosT + 1e-4 && Math.abs(x - 1.5) < 0.08) {
          stopped = true;
          v = 0;
          break;
        }
        dir = slope < 0 ? 1 : -1;
        const aDown = g * (Math.abs(sinT) - mu * cosT);
        if (aDown <= 0) { stopped = true; break; }
        v = Math.max(0.03, aDown * step);
      }

      const ds = v * step;
      const dx = dir * ds * cosT;
      const xNext = x + dx;
      const dTherm = mu * g * cosT * ds;
      const nextTherm = thermalPerKg + dTherm;
      const hNext = trackHeight(xNext);

      if (g * (h0 - hNext) - nextTherm <= 0) {
        let a = x, b = xNext;
        for (let iter = 0; iter < 12; iter++) {
          const mid = 0.5 * (a + b);
          if (g * (h0 - trackHeight(mid)) - nextTherm > 0) a = mid; else b = mid;
        }
        const dsTurn = Math.abs(a - x) / cosT;
        thermalPerKg += mu * g * cosT * dsTurn;
        x = a;
        dir = -dir;
        const slNow = trackSlope(x);
        const cNow = 1 / Math.sqrt(1 + slNow * slNow);
        if (mu > 0 && Math.abs(slNow * cNow) <= mu * cNow + 1e-4) {
          stopped = true;
          break;
        }
      } else {
        x = xNext;
        thermalPerKg = nextTherm;
      }
    }
  }

  function updateReadout() {
    const { h, eTotRel, peRel, ke, eTherm, v, g } = currentEnergies();
    const bumpNote = h0 < 0.8
      ? ` Released from ${h0.toFixed(1)} m it cannot clear the 0.8 m bump: it would need ${(0.8 - h0).toFixed(1)} m of height it never had.`
      : '';
    const massNote = marbleIdx === 1
      ? ' Steel (60 g) has 3× the mass of glass (20 g), scaling every energy bar by 3× while speed stays the same.'
      : '';
    const refNote = hRef > 0.01 ? ` (Measured from h₀ = ${hRef.toFixed(1)} m.)` : '';
    const vTxt = fmtSpeed(v, api.prefs);

    if (mu > 0 && eTherm > 0.002) {
      say(`Warmth ${eTherm.toFixed(3)} J; height (${peRel.toFixed(3)} J) + motion (${ke.toFixed(3)} J) + warmth (${eTherm.toFixed(3)} J) = ${eTotRel.toFixed(3)} J at ${GRAVITIES[gIdx].name}.${bumpNote}${massNote}${refNote}`);
    } else if (h < 0.05) {
      say(`Bottom of the dip (${h.toFixed(2)} m): ${vTxt}, kinetic ${ke.toFixed(3)} J (g = ${g.toFixed(1)} m/s²).${bumpNote}${massNote}${refNote}`);
    } else {
      say(`At ${h.toFixed(2)} m: ${vTxt} (height ${peRel.toFixed(3)} J, motion ${ke.toFixed(3)} J, total ${eTotRel.toFixed(3)} J).${bumpNote}${massNote}${refNote}`);
    }
  }

  const muSlider = api.slider('Friction', {
    min: 0, max: 0.30, step: 0.02, value: mu,
    fmt: (v) => (v === 0 ? '0 (none)' : v.toFixed(2)),
    onInput: (v) => { mu = +v.toFixed(2); reset(); },
  });

  const h0Slider = api.slider('Release height', {
    min: 0.0, max: 1.5, step: 0.01, value: h0,
    fmt: (v) => `${v.toFixed(2)} m`,
    onInput: (v) => { h0 = +v.toFixed(2); reset(); },
  });

  // Register PDOM mirrors AFTER primary sliders so first input[type="range"] stays Friction
  pathProbe = createPathProbe(stage, api, {
    maxDots: 36,
    dotInterval: 0.14,
    onSelect: () => { api.redraw?.(); },
    formatCard: (d) => [
      `t = ${d.t.toFixed(2)} s · ${fmtSpeed(d.v, api.prefs)}`,
      `h = ${d.h.toFixed(2)} m (ref ${d.hRef.toFixed(1)})`,
      `PE ${d.peRel.toFixed(2)} · KE ${d.ke.toFixed(2)} J`,
      `Warmth ${d.eTherm.toFixed(2)} J`,
    ],
  });

  refDatum = createReferenceLine(stage, api, {
    label: 'Reference height datum h = 0',
    min: 0,
    max: 1.2,
    step: 0.1,
    value: hRef,
    onChange: (val) => {
      hRef = val;
      updateReadout();
      api.redraw?.();
    },
  });

  // Tab group 0: Marbles (enhancements.js checks tab(0))
  const marbleTabs = api.tabs(MARBLES.map((m) => m.name), (i) => {
    marbleIdx = i;
    updateReadout();
  }, 0);

  // Tab group 1: Views (enhancements.js checks selectTab(1, 1) for Glowing jars)
  const viewTabs = api.tabs(['Bars', 'Glowing jars', 'Pie on bead'], (i) => {
    viewMode = i;
  }, 0);

  // Tab group 2: Celestial Gravity
  const gravityTabs = api.tabs(GRAVITIES.map((g) => g.name), (i) => {
    const oldG = GRAVITIES[gIdx].g;
    const newG = GRAVITIES[i].g;
    if (oldG > 0) thermalPerKg = Math.max(0, Math.min(newG * h0, thermalPerKg * (newG / oldG)));
    gIdx = i;
    updateReadout();
  }, 0);

  api.button('Drain warmth', () => {
    const g = GRAVITIES[gIdx].g;
    const hCur = trackHeight(x);
    const hEffective = Math.max(hCur, h0 - thermalPerKg / g);
    h0 = +Math.max(0.0, Math.min(1.5, hEffective)).toFixed(2);
    thermalPerKg = 0;
    stopped = Math.abs(trackSlope(x)) < 0.01 && h0 <= hCur + 1e-4;
    h0Slider.set(h0);
    updateReadout();
    api.redraw?.();
  });

  api.onReset(
    () => reset(true),
    () => {
      gIdx = 0; gravityTabs.setActive(0);
      viewMode = 0; viewTabs.setActive(0);
      marbleIdx = 0; marbleTabs.setActive(0);
      hRef = 0; refDatum.set(0);
      mu = 0; muSlider.set(0);
      h0 = 1.0; h0Slider.set(1.0);
      reset(true);
    }
  );

  // Direct pointer interaction: drag h0 datum line, drag bead onto track, or click/scrub path strobe probe
  const toLogical = (ev) => canvasPointerCoords(ev, k.cv, k.W, k.H);
  k.cv.style.touchAction = 'none';
  const onPointerDown = (ev) => {
    const { lx, ly } = toLogical(ev);
    if (refDatum.hitTest(lx, ly, tx0, tx0 + tw, Y(hRef))) {
      refDatum.setDragging(true);
      k.cv.setPointerCapture?.(ev.pointerId);
      return;
    }
    const bx = X(x), by = Y(trackHeight(x));
    if (Math.hypot(lx - bx, ly - by) < 22) {
      draggingBead = true;
      thermalPerKg = 0;
      stopped = false;
      pathProbe.clear();
      k.cv.setPointerCapture?.(ev.pointerId);
      api.redraw?.();
      return;
    }
    if (pathProbe.hitTest(lx, ly, 20) >= 0) {
      pathProbe.setDragging(true);
      pathProbe.selectNear(lx, ly, 24);
      k.cv.setPointerCapture?.(ev.pointerId);
    } else {
      pathProbe.clearSelection();
    }
    api.redraw?.();
  };
  const onPointerMove = (ev) => {
    const { lx, ly } = toLogical(ev);
    if (refDatum.dragging) {
      refDatum.set(invH(ly));
      return;
    }
    if (draggingBead) {
      x = invX(lx);
      const newH = Math.max(0.0, Math.min(1.5, trackHeight(x)));
      h0 = +newH.toFixed(2);
      dir = trackSlope(x) > 0 ? -1 : 1;
      h0Slider.set(h0);
      updateReadout();
      api.redraw?.();
      return;
    }
    if (pathProbe.dragging) {
      pathProbe.selectNear(lx, ly, 28);
      api.redraw?.();
    }
  };
  const onPointerUp = (ev) => {
    refDatum.setDragging(false);
    draggingBead = false;
    pathProbe.setDragging(false);
    try { k.cv.releasePointerCapture?.(ev.pointerId); } catch (_) {}
  };
  k.cv.addEventListener('pointerdown', onPointerDown);
  k.cv.addEventListener('pointermove', onPointerMove);
  k.cv.addEventListener('pointerup', onPointerUp);
  k.cv.addEventListener('pointercancel', onPointerUp);
  api.onCleanup(() => {
    k.cv.removeEventListener('pointerdown', onPointerDown);
    k.cv.removeEventListener('pointermove', onPointerMove);
    k.cv.removeEventListener('pointerup', onPointerUp);
    k.cv.removeEventListener('pointercancel', onPointerUp);
  });

  // Opt-in sonification mapping potential height / speed to gentle pentatonic chimes
  api.sonify((dt, tNow, prefs) => {
    if (dt <= 0 || !prefs.sonify || stopped || draggingBead) return;
    const nowMs = performance.now();
    if (nowMs - lastChimeAt < 180) return;
    lastChimeAt = nowMs;
    const { v, h } = currentEnergies();
    if (v < 0.15) return;
    const ctx = api.audio()?.ctx;
    if (ctx) {
      const freq = 240 + Math.max(0, Math.min(1.5, h)) * 180;
      playTone(ctx, { freq, dur: 0.08, type: 'sine', gain: 0.028 });
    }
  });

  api.loop((dt, tNow = 0) => {
    if (dt > 0) {
      stepPhysics(dt);
      updateReadout();
    }
    const pal = simPalette(api);
    k.clear(pal.plate);
    const ctx = k.ctx;
    const state = currentEnergies();
    const { h, eTotAbs, eTotRel, peAbs, peRel, ke, eTherm, v, g } = state;

    // Height guide lines
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = pal.rule;
    ctx.lineWidth = 1;
    for (const [gh, glab] of [[0, '0 m'], [0.5, '0.5 m'], [0.8, '0.8 m bump'], [1.0, '1.0 m'], [1.5, '1.5 m']]) {
      const yy = Y(gh);
      ctx.beginPath(); ctx.moveTo(tx0, yy); ctx.lineTo(tx0 + tw, yy); ctx.stroke();
      api.draw.text(ctx, glab, tx0 + tw + 4, yy + 4, { size: 10.5, color: pal.muted });
    }
    // Release height line
    const yRel = Y(h0);
    ctx.strokeStyle = pal.pe;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(tx0, yRel); ctx.lineTo(tx0 + tw, yRel); ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, `start ${h0.toFixed(1)} m`, tx0 + 6, yRel - 6, { size: 11, color: pal.pe, weight: 600 });

    // Track curve + light drafting supports
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const xm = (i / 120) * 4.0;
      const sx = X(xm), sy = Y(trackHeight(xm));
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    ctx.save();
    ctx.strokeStyle = pal.rule;
    ctx.lineWidth = 1;
    for (let xm = 0.2; xm < 4; xm += 0.4) {
      ctx.beginPath(); ctx.moveTo(X(xm), Y(trackHeight(xm)) + 3); ctx.lineTo(X(xm), yBase + 5); ctx.stroke();
    }
    ctx.restore();

    // Draggable h = 0 Reference Datum Line
    refDatum.draw(ctx, tx0, tx0 + tw, Y(hRef), pal);

    // Height bracket dimension
    dimension(ctx, X(x) + 18, Y(h), X(x) + 18, Y(hRef), pal.pe);
    api.draw.text(ctx, `h = ${h.toFixed(2)} m · g = ${g.toFixed(1)} m/s²`, tx0 + 10, 24, { size: 12, color: pal.pe, weight: 600 });

    // Bead & Path Probe
    const slope = trackSlope(x);
    const cosT = 1 / Math.sqrt(1 + slope * slope);
    const sinT = slope * cosT;
    const rad = marbleIdx === 1 ? 9.5 : 8;
    const mx = X(x) - sinT * rad;
    const my = Y(h) - cosT * rad;

    pathProbe.record(dt, { cx: mx, cy: my, t: tNow, h, hRef, v, peRel, ke, eTherm });
    pathProbe.draw(ctx, pal, { minX: tx0, maxX: tx0 + tw, minY: 28, maxY: yBase - 6 });

    ctx.beginPath();
    ctx.arc(mx, my, rad, 0, Math.PI * 2);
    ctx.fillStyle = marbleIdx === 1 ? pal.ink : pal.pe;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = pal.sheet;
    ctx.stroke();

    // Floating Energy Pie Chart above bead when mode === 2
    if (viewMode === 2) {
      drawMiniPie(ctx, mx, Math.max(38, my - 30), 14, { pe: peAbs, ke, thermal: eTherm }, pal);
    }

    // Speed vector along track
    if (v > 0.08) {
      const vLen = Math.min(72, v * 11);
      const ux = dir * cosT;
      const uy = -dir * sinT;
      drawVector(ctx, mx, my, mx + ux * vLen, my + uy * vLen, { kind: 'velocity', color: pal.velocity, width: 2.2, head: 7 });
      api.draw.text(ctx, fmtSpeed(v, api.prefs), mx + ux * (vLen + 10), my + uy * (vLen + 10) - 6, {
        size: 11.5, color: pal.velocity, align: 'center', weight: 600,
      });
    }

    // Right panel: Energy stores (kept well inside W = 640 right margin)
    const bx0 = 466, bBase = 252, bMaxH = 195;
    const mCur = MARBLES[marbleIdx].m;
    const maxRefJ = Math.max(0.882, mCur * g * 1.5);
    const pxPerJAbs = bMaxH / maxRefJ;

    if (viewMode === 1) {
      api.draw.text(ctx, `Glowing jars (scale ${maxRefJ.toFixed(1)} J)`, bx0 + 66, 24, { size: 12, color: pal.ink, align: 'center', weight: 600 });
      const jars = [
        { label: 'grav. (abs)', val: peAbs, col: pal.pe, hatch: 'bars' },
        { label: 'kinetic', val: ke, col: pal.ke, hatch: 'chevrons' },
        { label: 'thermal', val: eTherm, col: pal.thermal, hatch: 'waves' },
      ];
      const jw = 36, jh = 165, jGap = 12, jy = bBase - jh;
      if (v > 0.05) {
        ctx.save();
        ctx.strokeStyle = pal.pe;
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 5]);
        ctx.lineDashOffset = -tNow * 36 * Math.sign(slope * dir || 1);
        ctx.beginPath(); ctx.moveTo(bx0 + jw, jy + jh * 0.55); ctx.lineTo(bx0 + jw + jGap, jy + jh * 0.55); ctx.stroke();
        if (mu > 0) {
          ctx.strokeStyle = pal.thermal;
          ctx.beginPath(); ctx.moveTo(bx0 + 2 * jw + jGap, jy + jh * 0.7); ctx.lineTo(bx0 + 2 * (jw + jGap), jy + jh * 0.7); ctx.stroke();
        }
        ctx.restore();
      }
      jars.forEach((j, i) => {
        const jx = bx0 + i * (jw + jGap);
        const frac = Math.min(1, Math.max(0, j.val / maxRefJ));
        const fh = frac * (jh - 8);
        const fy = jy + jh - 3 - fh;
        api.draw.roundRect(ctx, jx + 6, jy - 7, jw - 12, 7, 2);
        ctx.fillStyle = pal.sheet; ctx.fill();
        ctx.strokeStyle = pal.ink; ctx.lineWidth = 1.3; ctx.stroke();
        api.draw.roundRect(ctx, jx, jy, jw, jh, 7);
        ctx.fillStyle = pal.sheet; ctx.fill();
        if (fh > 1) {
          ctx.save();
          api.draw.roundRect(ctx, jx + 2, jy + 2, jw - 4, jh - 4, 5);
          ctx.clip();
          ctx.fillStyle = j.col;
          ctx.globalAlpha = 0.28;
          ctx.fillRect(jx, fy, jw, fh);
          ctx.globalAlpha = 0.75;
          ctx.strokeStyle = pal.ink;
          ctx.lineWidth = 1.1;
          if (j.hatch === 'bars') {
            for (let y = fy + 4; y < jy + jh; y += 6) {
              ctx.beginPath(); ctx.moveTo(jx + 4, y); ctx.lineTo(jx + jw - 4, y); ctx.stroke();
            }
          } else if (j.hatch === 'chevrons') {
            for (let y = fy + 6; y < jy + jh; y += 8) {
              ctx.beginPath();
              ctx.moveTo(jx + 6, y + 3); ctx.lineTo(jx + jw / 2, y - 2); ctx.lineTo(jx + jw - 6, y + 3);
              ctx.stroke();
            }
          } else {
            for (let y = fy + 5; y < jy + jh; y += 7) {
              ctx.beginPath();
              for (let xx = jx + 4; xx <= jx + jw - 4; xx += 3) {
                const yy = y + Math.sin((xx + tNow * 15) * 0.4) * 1.8;
                if (xx === jx + 4) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
              }
              ctx.stroke();
            }
          }
          ctx.globalAlpha = 1;
          ctx.strokeStyle = j.col;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(jx + 2, fy); ctx.lineTo(jx + jw - 2, fy); ctx.stroke();
          ctx.restore();
        }
        api.draw.roundRect(ctx, jx, jy, jw, jh, 7);
        ctx.strokeStyle = pal.ink; ctx.lineWidth = 1.5; ctx.stroke();
        api.draw.text(ctx, j.label, jx + jw / 2, bBase + 16, { size: 10.5, color: pal.ink, align: 'center', weight: 600 });
        api.draw.text(ctx, `${j.val.toFixed(2)} J`, jx + jw / 2, bBase + 30, { size: 10.5, color: pal.muted, align: 'center' });
      });
      return;
    }

    // Bars mode: signed baseline zeroY allows negative peRel / eTotRel below 0 J when hRef > h
    const barTopY = 56;
    const barSpanPx = bBase - barTopY;
    const minJ = Math.min(0, -mCur * g * hRef);
    const maxJ = Math.max(0.2, mCur * g * Math.max(0.4, 1.5 - hRef));
    const pxPerJ = barSpanPx / Math.max(0.2, maxJ - minJ);
    const zeroY = barTopY + maxJ * pxPerJ;

    api.draw.text(ctx, 'Energy stores (J)', bx0 + 72, 24, { size: 13, color: pal.ink, align: 'center', weight: 600 });
    const bars = [
      { label: 'height', val: peRel, col: pal.pe },
      { label: 'motion', val: ke, col: pal.ke },
      { label: 'warmth', val: eTherm, col: pal.thermal },
    ];
    const bw = 26, gap = 14;
    const drawSignedBar = (bx, val, col, outlineOnly = false, lineW = 1.4) => {
      const yTop = val >= 0 ? zeroY - val * pxPerJ : zeroY;
      const hPx = Math.abs(val) * pxPerJ;
      if (hPx < 0.5) return;
      if (outlineOnly) {
        ctx.strokeRect(bx, yTop, bw, hPx);
        return;
      }
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.82;
      ctx.fillRect(bx, yTop, bw, hPx);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = lineW;
      ctx.strokeRect(bx, yTop, bw, hPx);
    };

    bars.forEach((b, i) => {
      const bx = bx0 + i * (bw + gap);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = pal.muted;
      ctx.lineWidth = 1.2;
      drawSignedBar(bx, eTotRel, pal.muted, true);
      ctx.restore();

      drawSignedBar(bx, b.val, b.col);
      api.draw.text(ctx, b.label, bx + bw / 2, bBase + 16, { size: 9.5, color: pal.ink, align: 'center', weight: 600 });
      api.draw.text(ctx, b.val.toFixed(2), bx + bw / 2, bBase + 30, { size: 10, color: pal.muted, align: 'center' });
    });

    // Total stacked algebraic ledger bar: negative PE draws below zeroY; KE + warmth stack above zeroY
    const sx = bx0 + 3 * (bw + gap);
    if (peRel < 0) drawSignedBar(sx, peRel, pal.pe);
    let posY = zeroY;
    for (const b of bars) {
      if (b.val <= 0) continue;
      const bh = b.val * pxPerJ;
      if (bh >= 0.5) {
        ctx.fillStyle = b.col;
        ctx.globalAlpha = 0.82;
        ctx.fillRect(sx, posY - bh, bw, bh);
        ctx.globalAlpha = 1;
        posY -= bh;
      }
    }
    const totTopY = eTotRel >= 0 ? zeroY - eTotRel * pxPerJ : zeroY;
    const totH = Math.abs(eTotRel) * pxPerJ;
    if (totH >= 0.5) {
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(sx, totTopY, bw, totH);
    }
    api.draw.text(ctx, 'total', sx + bw / 2, bBase + 16, { size: 9.5, color: pal.ink, align: 'center', weight: 600 });
    api.draw.text(ctx, `${eTotRel.toFixed(2)} J`, sx + bw / 2, bBase + 30, { size: 10, color: pal.ink, align: 'center', weight: 600 });

    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx0 - 6, zeroY); ctx.lineTo(sx + bw + 6, zeroY); ctx.stroke();
    if (hRef > 0.01) {
      api.draw.text(ctx, '0', bx0 - 10, zeroY + 4, { size: 9.5, color: pal.muted, align: 'right' });
    }
  });

  updateReadout();
  return {
    getState() {
      return { mu, h0, marbleIdx, viewMode, gIdx, hRef, x, dir, thermalPerKg };
    },
    setState(patch = {}) {
      if (typeof patch.mu === 'number') { mu = patch.mu; muSlider.set(mu); }
      if (typeof patch.h0 === 'number') { h0 = patch.h0; h0Slider.set(h0); }
      if (typeof patch.marbleIdx === 'number') { marbleIdx = patch.marbleIdx; marbleTabs.setActive(marbleIdx); }
      if (typeof patch.viewMode === 'number') { viewMode = patch.viewMode; viewTabs.setActive(viewMode); }
      if (typeof patch.gIdx === 'number' && GRAVITIES[patch.gIdx]) { gIdx = patch.gIdx; gravityTabs.setActive(gIdx); }
      if (typeof patch.hRef === 'number') { hRef = patch.hRef; refDatum.set(hRef); }
      if (typeof patch.x === 'number') x = patch.x; else x = findReleaseX(h0);
      if (typeof patch.dir === 'number') dir = patch.dir;
      if (typeof patch.thermalPerKg === 'number') thermalPerKg = patch.thermalPerKg;
      stopped = false;
      pathProbe.clear();
      updateReadout();
    },
    destroy() {},
  };
}, { label: 'Slide the bead' });
