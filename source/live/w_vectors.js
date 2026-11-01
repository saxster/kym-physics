// Story: vectors -> w_vectors: Resolve one vector into components or add two vectors at any angle.
// Three interactive stations: (1) Resolve into components (Rx = R cos theta, Ry = R sin theta),
// (2) Parallelogram addition (R = sqrt(P^2 + Q^2 + 2 P Q cos theta)), (3) Inclined plane weight components.
import { Live } from './core.js';
import { mechanismKey, hatch } from './art_mechanics.js';

Live.register('vectors', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 270, 'Interactive vector component projector, parallelogram law builder, and inclined-plane weight decomposition');
  let mode = 0; // 0 = Resolve, 1 = Parallelogram, 2 = Ramp weight
  let magP = 80; // N (used as R in mode 0, P in mode 1, weight mg in mode 2)
  let magQ = 60; // N (used as Q in mode 1)
  let deg = 50;  // degrees
  const say = api.readout();

  mechanismKey(stage, 'Shadows and diagonals', [
    'Blue dashed drop-lines project an arrow onto perpendicular axes so Pythagoras applies.',
    'In Parallelogram mode, the extension P cos θ and height P sin θ turn any angle θ into a right-angled triangle.',
  ]);

  function updateReadout() {
    const rad = (deg * Math.PI) / 180;
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);
    if (mode === 0) {
      const rx = magP * cosT;
      const ry = magP * sinT;
      say(
        `Vector R = ${magP} N at θ = ${deg}°. Horizontal shadow R_x = R cos θ = ${rx.toFixed(1)} N; ` +
        `vertical shadow R_y = R sin θ = ${ry.toFixed(1)} N. Check: √(${rx.toFixed(1)}² + ${ry.toFixed(1)}²) = ${magP.toFixed(1)} N.`
      );
    } else if (mode === 1) {
      const pCos = magP * cosT;
      const pSin = magP * sinT;
      const base = magQ + pCos;
      const rMag = Math.hypot(base, pSin);
      const rAng = (Math.atan2(pSin, base) * 180) / Math.PI;
      const bonus = 2 * magP * magQ * cosT;
      say(
        `P = ${magP} N, Q = ${magQ} N at θ = ${deg}°. Base = Q + P cos θ = ${base.toFixed(1)} N, height = P sin θ = ${pSin.toFixed(1)} N. ` +
        `Resultant R = √(P² + Q² + 2PQ cos θ) = ${rMag.toFixed(1)} N at ${rAng.toFixed(1)}° from Q (alignment term 2PQ cos θ = ${bonus >= 0 ? '+' : ''}${Math.round(bonus)} N²).`
      );
    } else {
      const rampDeg = Math.min(deg, 75);
      const rRad = (rampDeg * Math.PI) / 180;
      const fSlide = magP * Math.sin(rRad);
      const fPress = magP * Math.cos(rRad);
      say(
        `Slope θ = ${rampDeg}°, weight mg = ${magP} N straight down. Down-slope pull mg sin θ = ${fSlide.toFixed(1)} N; ` +
        `perpendicular press into the ramp mg cos θ = ${fPress.toFixed(1)} N (matched by the normal force N = ${fPress.toFixed(1)} N).`
      );
    }
  }

  api.tabs(['Resolve into shadows', 'Parallelogram law', 'Weight on a ramp'], (i) => {
    mode = i;
    updateReadout();
  }, 0);

  api.slider('Angle θ', {
    min: 0, max: 180, step: 5, value: deg,
    fmt: (v) => `${v}°`,
    onInput: (v) => { deg = v; updateReadout(); },
  });

  api.slider('Arrow P (or R / weight)', {
    min: 20, max: 100, step: 5, value: magP,
    fmt: (v) => `${v} N`,
    onInput: (v) => { magP = v; updateReadout(); },
  });

  api.slider('Arrow Q (in Parallelogram)', {
    min: 20, max: 100, step: 5, value: magQ,
    fmt: (v) => `${v} N`,
    onInput: (v) => { magQ = v; updateReadout(); },
  });

  api.loop(() => {
    k.clear(c.plate);
    const ctx = k.ctx;
    const rad = (deg * Math.PI) / 180;
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);

    if (mode === 0) {
      // Station 1: Resolve R into Rx and Ry
      const ox = 250, oy = 215;
      const scale = 1.65;
      const rxPx = magP * cosT * scale;
      const ryPx = magP * sinT * scale;
      const tx = ox + rxPx;
      const ty = oy - ryPx;

      // Axes
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(60, oy); ctx.lineTo(480, oy);
      ctx.moveTo(ox, oy + 25); ctx.lineTo(ox, 28);
      ctx.stroke();
      api.draw.text(ctx, '+x', 474, oy + 16, { size: 12, color: c.muted, align: 'right' });
      api.draw.text(ctx, '+y', ox + 8, 36, { size: 12, color: c.muted });

      // Projection dashed lines
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx, ty); ctx.lineTo(tx, oy);
      ctx.moveTo(tx, ty); ctx.lineTo(ox, ty);
      ctx.stroke();
      ctx.restore();

      // Right-angle marker at (tx, oy)
      if (Math.abs(rxPx) > 12 && Math.abs(ryPx) > 12) {
        const sx = rxPx >= 0 ? -9 : 9;
        ctx.strokeStyle = c.muted;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tx + sx, oy);
        ctx.lineTo(tx + sx, oy - 9);
        ctx.lineTo(tx, oy - 9);
        ctx.stroke();
      }

      // Component arrows Rx and Ry
      if (Math.abs(rxPx) > 3) {
        api.draw.arrow(ctx, ox, oy, tx, oy, c.electron, 2.4, 7);
      }
      if (Math.abs(ryPx) > 3) {
        api.draw.arrow(ctx, ox, oy, ox, ty, c.electron, 2.4, 7);
      }

      // Main vector R
      api.draw.arrow(ctx, ox, oy, tx, ty, c.ink, 3, 8);

      // Angle arc
      if (deg > 4) {
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(ox, oy, 30, -rad, 0);
        ctx.stroke();
        const mid = -rad / 2;
        api.draw.text(ctx, `θ = ${deg}°`, ox + Math.cos(mid) * 44, oy + Math.sin(mid) * 44 + 4, {
          size: 12, color: c.ink, weight: 600,
        });
      }

      // Labels
      const rxVal = (magP * cosT).toFixed(1);
      const ryVal = (magP * sinT).toFixed(1);
      api.draw.text(ctx, `R_x = R cos θ = ${rxVal} N`, (ox + tx) / 2, oy + 22, {
        size: 12.5, color: c.electron, align: 'center', weight: 600,
      });
      api.draw.text(ctx, `R_y = R sin θ = ${ryVal} N`, ox + (rxPx >= 0 ? -10 : 10), (oy + ty) / 2, {
        size: 12.5, color: c.electron, align: rxPx >= 0 ? 'right' : 'left', weight: 600,
      });
      api.draw.text(ctx, `R = ${magP} N`, (ox + tx) / 2 + (rxPx >= 0 ? -12 : 12), (oy + ty) / 2 - 10, {
        size: 13.5, color: c.ink, align: rxPx >= 0 ? 'right' : 'left', weight: 700,
      });

      // Summary card on right
      api.draw.text(ctx, 'Right-triangle check:', 505, 68, { size: 12.5, color: c.ink, weight: 600 });
      api.draw.text(ctx, `R_x² = ${(magP * cosT * magP * cosT).toFixed(0)}`, 505, 92, { size: 12, color: c.electron });
      api.draw.text(ctx, `R_y² = ${(magP * sinT * magP * sinT).toFixed(0)}`, 505, 112, { size: 12, color: c.electron });
      api.draw.text(ctx, `√(R_x² + R_y²) = ${magP.toFixed(1)} N`, 505, 136, { size: 12.5, color: c.ink, weight: 600 });
    } else if (mode === 1) {
      // Station 2: Parallelogram law of vector addition
      const ox = 200, oy = 215;
      const scale = 1.25;
      const qPx = magQ * scale;
      const pDx = magP * cosT * scale;
      const pDy = magP * sinT * scale;
      const qx = ox + qPx, qy = oy;
      const px = ox + pDx, py = oy - pDy;
      const rx = qx + pDx, ry = oy - pDy;

      // Parallelogram dashed sides
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(px, py); ctx.lineTo(rx, ry);
      ctx.moveTo(qx, qy); ctx.lineTo(rx, ry);
      ctx.stroke();

      // Right-triangle base extension (P cos theta) and height (P sin theta)
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(qx, qy); ctx.lineTo(rx, qy);
      ctx.moveTo(rx, ry); ctx.lineTo(rx, qy);
      ctx.stroke();
      ctx.restore();

      if (Math.abs(pDy) > 10 && Math.abs(pDx) > 10) {
        const sx = pDx >= 0 ? -8 : 8;
        ctx.strokeStyle = c.electron;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(rx + sx, qy);
        ctx.lineTo(rx + sx, qy - 8);
        ctx.lineTo(rx, qy - 8);
        ctx.stroke();
      }

      // Vectors Q and P
      api.draw.arrow(ctx, ox, oy, qx, qy, c.proton, 2.5, 7);
      api.draw.arrow(ctx, ox, oy, px, py, c.proton, 2.5, 7);
      // Resultant R
      if (Math.hypot(rx - ox, ry - oy) > 3) {
        api.draw.arrow(ctx, ox, oy, rx, ry, c.ink, 3, 8);
      }

      // Angle arc
      if (deg > 4) {
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(ox, oy, 26, -rad, 0);
        ctx.stroke();
        api.draw.text(ctx, `θ = ${deg}°`, ox + 32, oy - 10, { size: 11.5, color: c.ink, weight: 600 });
      }

      const pCos = magP * cosT;
      const pSin = magP * sinT;
      const rMag = Math.hypot(magQ + pCos, pSin);
      api.draw.text(ctx, `Q = ${magQ} N`, (ox + qx) / 2, oy + 20, {
        size: 12.5, color: c.proton, align: 'center', weight: 600,
      });
      api.draw.text(ctx, `P = ${magP} N`, px - 8, py - 6, {
        size: 12.5, color: c.proton, align: 'right', weight: 600,
      });
      api.draw.text(ctx, `P cos θ = ${pCos.toFixed(1)}`, (qx + rx) / 2, oy + 36, {
        size: 11.5, color: c.electron, align: 'center', weight: 600,
      });
      api.draw.text(ctx, `P sin θ = ${pSin.toFixed(1)}`, rx + 8, (qy + ry) / 2 + 4, {
        size: 11.5, color: c.electron, align: 'left', weight: 600,
      });
      api.draw.text(ctx, `R = ${rMag.toFixed(1)} N`, (ox + rx) / 2, (oy + ry) / 2 - 10, {
        size: 13.5, color: c.ink, align: 'center', weight: 700,
      });

      api.draw.text(ctx, 'R = √(P² + Q² + 2PQ cos θ)', 440, 36, { size: 12.5, color: c.ink, weight: 700 });
      const bonus = 2 * magP * magQ * cosT;
      api.draw.text(ctx, `2PQ cos θ = ${bonus >= 0 ? '+' : ''}${Math.round(bonus)} N²`, 440, 56, { size: 12, color: c.muted });
    } else {
      // Station 3: Inclined plane weight resolution
      const rampDeg = Math.min(deg, 75);
      const rRad = (rampDeg * Math.PI) / 180;
      const cosR = Math.cos(rRad), sinR = Math.sin(rRad);
      const x0 = 110, y0 = 225;
      const rampLen = 280;
      const xTop = x0 + rampLen * cosR;
      const yTop = y0 - rampLen * sinR;

      // Draw wedge and hatch
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(xTop, yTop);
      ctx.lineTo(xTop, y0);
      ctx.closePath();
      ctx.stroke();
      hatch(ctx, x0, y0, rampLen * cosR, 10, c.muted, 9);

      // Block at midpoint of ramp
      const midS = 145;
      const bx = x0 + midS * cosR - sinR * 16;
      const by = y0 - midS * sinR - cosR * 16;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(-rRad);
      ctx.fillStyle = c.sheet;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.8;
      ctx.fillRect(-22, -16, 44, 32);
      ctx.strokeRect(-22, -16, 44, 32);
      ctx.restore();

      const scale = 1.15;
      const wLen = magP * scale;
      const fPar = magP * sinR * scale;
      const fPerp = magP * cosR * scale;

      // Perpendicular component (mg cos theta) into the slope
      const pxEnd = bx + sinR * fPerp;
      const pyEnd = by + cosR * fPerp;
      // Parallel component (mg sin theta) down the slope
      const sxEnd = bx - cosR * fPar;
      const syEnd = by + sinR * fPar;

      // Dashed rectangle of components
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(pxEnd, pyEnd); ctx.lineTo(bx, by + wLen);
      ctx.moveTo(sxEnd, syEnd); ctx.lineTo(bx, by + wLen);
      ctx.stroke();
      ctx.restore();

      // Draw component vectors and full weight mg
      if (fPerp > 3) api.draw.arrow(ctx, bx, by, pxEnd, pyEnd, c.electron, 2.2, 6);
      if (fPar > 3) api.draw.arrow(ctx, bx, by, sxEnd, syEnd, c.electron, 2.2, 6);
      api.draw.arrow(ctx, bx, by, bx, by + wLen, c.proton, 2.8, 7);

      api.draw.text(ctx, `mg = ${magP} N`, bx + 8, by + wLen + 12, { size: 12.5, color: c.proton, weight: 700 });
      api.draw.text(ctx, `mg sin θ = ${(magP * sinR).toFixed(1)} N (down slope)`, sxEnd - 8, syEnd - 6, {
        size: 12, color: c.electron, align: 'right', weight: 600,
      });
      api.draw.text(ctx, `mg cos θ = ${(magP * cosR).toFixed(1)} N (into slope)`, pxEnd + 10, pyEnd + 4, {
        size: 12, color: c.electron, align: 'left', weight: 600,
      });
      api.draw.text(ctx, `ramp θ = ${rampDeg}°`, x0 + 48, y0 - 8, { size: 12, color: c.ink, weight: 600 });
    }
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Project & add arrows' });
