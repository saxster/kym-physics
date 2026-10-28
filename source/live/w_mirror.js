// 10.3 Flat mirror: law of reflection, equal object and image distance (1 px = 1 cm), and the half-height full-body mirror.
import { Live } from './core.js';

Live.register('mirror', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 320;
  const k = api.canvas(W, H, 'Rays from an object reflecting off a flat mirror into an eye, traced back to the virtual image');

  const MIRROR_X = 340; // 1 px = 1 cm
  let tab = 0;          // 0 = Point and eye, 1 = Whole body
  let showTraced = true;
  let eyeMoved = false;

  // Tab 0 state (in cm / px relative to mirror at x = 340)
  // Default: object 80 cm in front (x = 260, y = 105), eye at 120 cm in front (x = 220, y = 190)
  // Wait: if object is at d_o = 80, y_o = 105 and eye is at d_e = 85, y_e = 175:
  // Reflection y_m divides y_o..y_e in ratio d_o : d_e.
  // With d_o = 80 cm, d_e = 80 cm, dy = 68 cm => dy_o = 34 cm, atan(34/80) = 23.0 deg!
  const obj = { d: 80, y: 112 }; // 80 cm in front of mirror
  const eye = { d: 80, y: 180 }; // 80 cm in front of mirror -> angle = atan(34/80) = 23°

  // Tab 1 (Whole body) state: 150 cm person (scaled 1.4 px per cm vertically to fit 320 px height cleanly)
  // Head top = 150 cm, eyes = 140 cm, feet = 0 cm. Required mirror: 70 cm to 145 cm (height 75 cm).
  let mirTopCm = 145;
  let mirBotCm = 70;

  const say = api.readout();

  // Control 1: Tabs Point and eye / Whole body
  api.tabs(['Point and eye', 'Whole body'], (i) => {
    tab = i;
    drawFrame();
  });

  // Control 2: Distance from mirror slider (20 to 160 cm, default 80 cm)
  const distSlider = api.slider('Distance from mirror', {
    min: 20, max: 160, step: 1, value: obj.d,
    fmt: (v) => `${v} cm`,
    onInput: (v) => {
      obj.d = v;
      eyeMoved = false;
      drawFrame();
    },
  });

  // Control 3: Toggle "Show the traced-back rays"
  const traceBtn = api.button('Show the traced-back rays', () => {
    showTraced = !showTraced;
    traceBtn.setAttribute('aria-pressed', String(showTraced));
    drawFrame();
  }, { pressed: true });

  // Pointer drag on canvas
  let dragKind = null;
  function toCanvas(e) {
    const r = k.cv.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / (r.width || W)) * W,
      y: ((e.clientY - r.top) / (r.height || H)) * H,
    };
  }

  k.cv.style.cursor = 'grab';
  k.cv.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    if (tab === 0) {
      const ox = MIRROR_X - obj.d, oy = obj.y;
      const ex = MIRROR_X - eye.d, ey = eye.y;
      if (Math.hypot(p.x - ox, p.y - oy) < 26) {
        dragKind = 'obj';
      } else if (Math.hypot(p.x - ex, p.y - ey) < 28) {
        dragKind = 'eye';
      }
    } else {
      const yOfCm = (cm) => 275 - cm * 1.45;
      if (Math.abs(p.x - MIRROR_X) < 35) {
        if (Math.abs(p.y - yOfCm(mirTopCm)) < 20) dragKind = 'mirTop';
        else if (Math.abs(p.y - yOfCm(mirBotCm)) < 20) dragKind = 'mirBot';
      }
    }
    if (dragKind) k.cv.setPointerCapture(e.pointerId);
  });

  k.cv.addEventListener('pointermove', (e) => {
    if (!dragKind) return;
    const p = toCanvas(e);
    if (dragKind === 'obj') {
      obj.d = Math.round(Math.max(20, Math.min(160, MIRROR_X - p.x)));
      obj.y = Math.round(Math.max(36, Math.min(H - 46, p.y)));
      eyeMoved = false;
      distSlider.set(obj.d);
    } else if (dragKind === 'eye') {
      eye.y = Math.round(Math.max(46, Math.min(H - 36, p.y)));
      eyeMoved = true;
    } else if (dragKind === 'mirTop') {
      const cm = Math.round((275 - p.y) / 1.45);
      mirTopCm = Math.max(mirBotCm + 15, Math.min(160, cm));
    } else if (dragKind === 'mirBot') {
      const cm = Math.round((275 - p.y) / 1.45);
      mirBotCm = Math.max(0, Math.min(mirTopCm - 15, cm));
    }
    drawFrame();
  });
  k.cv.addEventListener('pointerup', () => { dragKind = null; });

  function drawMirrorLine(ctx, topY, botY) {
    // Silvered backing hatches on right side
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1;
    for (let y = topY; y <= botY; y += 8) {
      ctx.beginPath();
      ctx.moveTo(MIRROR_X, y);
      ctx.lineTo(MIRROR_X + 6, y + 5);
      ctx.stroke();
    }
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(MIRROR_X, topY);
    ctx.lineTo(MIRROR_X, botY);
    ctx.stroke();
  }

  function drawPointAndEye(ctx) {
    drawMirrorLine(ctx, 24, H - 24);
    api.draw.text(ctx, 'mirror', MIRROR_X, 16, { size: 11.5, color: c.ink, align: 'center', weight: 600 });

    // Scale bar: 1 px = 1 cm (draw 50 cm = 50 px bar)
    const sbX = 28, sbY = H - 22;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(sbX, sbY);
    ctx.lineTo(sbX + 50, sbY);
    ctx.moveTo(sbX, sbY - 4);
    ctx.lineTo(sbX, sbY + 4);
    ctx.moveTo(sbX + 50, sbY - 4);
    ctx.lineTo(sbX + 50, sbY + 4);
    ctx.stroke();
    api.draw.text(ctx, '50 cm (1 px = 1 cm)', sbX + 25, sbY - 7, { size: 10.5, color: c.muted, align: 'center' });

    // Vertical guide line for eye drag
    const ox = MIRROR_X - obj.d, oy = obj.y;
    const ix = MIRROR_X + obj.d, iy = obj.y; // exact pixel equality: image distance = object distance
    const ex = MIRROR_X - eye.d, ey = eye.y;

    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = c.rule;
    ctx.beginPath();
    ctx.moveTo(ex, 36);
    ctx.lineTo(ex, H - 36);
    ctx.stroke();
    ctx.restore();

    // Two rays from object into top and bottom of the eye aperture (ey - 7, ey + 7)
    // Exact reflection point on mirror y_m satisfies (y_m - oy) / obj.d = (ey_k - y_m) / eye.d
    const eyeTargets = [ey - 7, ey + 7];
    const hitYs = eyeTargets.map((et) => oy + (et - oy) * (obj.d / (obj.d + eye.d)));

    // Draw normal at the primary (first) reflection point and mark angles
    const ym0 = hitYs[0];
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(MIRROR_X - 64, ym0);
    ctx.lineTo(MIRROR_X + 30, ym0);
    ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, 'normal', MIRROR_X - 66, ym0 - 5, { size: 10.5, color: c.muted, align: 'right' });

    const thetaRad = Math.atan2(Math.abs(ym0 - oy), obj.d);
    const thetaDeg = Math.round((thetaRad * 180) / Math.PI);

    // Angle arcs at ym0
    if (thetaDeg >= 2) {
      const sign = ym0 >= oy ? -1 : 1;
      ctx.strokeStyle = c.neutron;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      const aNorm = Math.PI;
      const aInc = Math.atan2(oy - ym0, ox - MIRROR_X);
      const aRef = Math.atan2(eyeTargets[0] - ym0, ex - MIRROR_X);
      ctx.arc(MIRROR_X, ym0, 28, Math.min(aNorm, aInc), Math.max(aNorm, aInc));
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(MIRROR_X, ym0, 32, Math.min(aNorm, aRef), Math.max(aNorm, aRef));
      ctx.stroke();
      api.draw.text(ctx, `${thetaDeg}°`, MIRROR_X - 42, ym0 + sign * 14, { size: 10.5, color: c.neutron, align: 'center' });
      api.draw.text(ctx, `${thetaDeg}°`, MIRROR_X - 42, ym0 - sign * 18, { size: 10.5, color: c.neutron, align: 'center' });
    }

    // Draw real rays (object -> mirror -> eye) and traced-back virtual rays (mirror -> image)
    for (let kIdx = 0; kIdx < 2; kIdx++) {
      const ym = hitYs[kIdx];
      const et = eyeTargets[kIdx];
      // Incident ray
      api.draw.arrow(ctx, ox, oy, (ox + MIRROR_X) / 2, (oy + ym) / 2, c.neutron, 1.8, 7);
      ctx.strokeStyle = c.neutron;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(MIRROR_X, ym);
      ctx.lineTo(ex, et);
      ctx.stroke();
      // Arrowhead on reflected ray
      api.draw.arrow(ctx, MIRROR_X, ym, (MIRROR_X + ex) / 2, (ym + et) / 2, c.neutron, 1.8, 7);

      if (showTraced) {
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = c.neutron;
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(MIRROR_X, ym);
        ctx.lineTo(ix, iy);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Distance dimension lines at bottom
    const dimY = H - 40;
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1;
    api.draw.arrow(ctx, MIRROR_X, dimY, ox, dimY, c.muted, 1.2, 6);
    api.draw.text(ctx, `${obj.d} cm`, (MIRROR_X + ox) / 2, dimY - 6, { size: 11, color: c.ink, align: 'center' });
    if (showTraced) {
      api.draw.arrow(ctx, MIRROR_X, dimY, ix, dimY, c.muted, 1.2, 6);
      api.draw.text(ctx, `${obj.d} cm`, (MIRROR_X + ix) / 2, dimY - 6, { size: 11, color: c.muted, align: 'center' });
    }

    // Object point (and draggable ring)
    ctx.beginPath();
    ctx.arc(ox, oy, 7, 0, Math.PI * 2);
    ctx.fillStyle = c.proton;
    ctx.fill();
    api.draw.text(ctx, 'Object (drag)', ox, oy - 12, { size: 11.5, color: c.proton, align: 'center', weight: 600 });

    // Faint ghost of the object at the image point behind the mirror
    if (showTraced) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(ix, iy, 7, 0, Math.PI * 2);
      ctx.fillStyle = c.proton;
      ctx.fill();
      ctx.restore();
      api.draw.text(ctx, 'Virtual image', ix, iy - 12, { size: 11.5, color: c.muted, align: 'center' });
    }

    // Eye symbol
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ex - 14, ey);
    ctx.quadraticCurveTo(ex, ey - 11, ex + 10, ey - 8);
    ctx.moveTo(ex - 14, ey);
    ctx.quadraticCurveTo(ex, ey + 11, ex + 10, ey + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex + 6, ey, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = c.electron;
    ctx.fill();
    api.draw.text(ctx, 'Eye (drag up/down)', ex - 6, ey + 24, { size: 11, color: c.ink, align: 'center' });

    let msg = `Object ${obj.d} cm in front of the mirror. Image ${obj.d} cm behind it, ${2 * obj.d} cm from the object. At the marked point the ray arrives at ${thetaDeg}° to the normal and leaves at ${thetaDeg}°.`;
    if (eyeMoved) msg += ' Same image. Only the rays that reach your eye have changed.';
    say(msg);
  }

  function drawWholeBody(ctx) {
    // 150 cm figure standing at obj.d cm in front of mirror
    const yOfCm = (cm) => 275 - cm * 1.45;
    const ox = MIRROR_X - obj.d;
    const ix = MIRROR_X + obj.d;

    // Full wall line and active draggable mirror segment [mirBotCm .. mirTopCm]
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(MIRROR_X, yOfCm(160));
    ctx.lineTo(MIRROR_X, yOfCm(0));
    ctx.stroke();

    drawMirrorLine(ctx, yOfCm(mirTopCm), yOfCm(mirBotCm));
    // Handles on mirror top and bottom
    for (const cm of [mirTopCm, mirBotCm]) {
      ctx.fillStyle = c.electron;
      api.draw.roundRect(ctx, MIRROR_X - 7, yOfCm(cm) - 4, 14, 8, 2);
      ctx.fill();
    }

    const headCm = 150, eyeCm = 140, feetCm = 0;
    const reqTop = (headCm + eyeCm) / 2; // 145 cm
    const reqBot = (eyeCm + feetCm) / 2; // 70 cm

    // Draw person and virtual twin
    const drawPerson = (px, alpha, label) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2.2;
      // Head (132 to 150 cm)
      ctx.beginPath();
      ctx.arc(px, yOfCm(141), 12, 0, Math.PI * 2);
      ctx.stroke();
      // Body & legs
      ctx.beginPath();
      ctx.moveTo(px, yOfCm(129));
      ctx.lineTo(px, yOfCm(65));
      ctx.lineTo(px - 10, yOfCm(0));
      ctx.moveTo(px, yOfCm(65));
      ctx.lineTo(px + 10, yOfCm(0));
      ctx.moveTo(px - 14, yOfCm(105));
      ctx.lineTo(px + 14, yOfCm(105));
      ctx.stroke();
      api.draw.text(ctx, label, px, yOfCm(0) + 18, { size: 11, color: c.ink, align: 'center' });
      ctx.restore();
    };

    drawPerson(ox, 1, `150 cm (${obj.d} cm away)`);
    if (showTraced) drawPerson(ix, 0.35, 'Image');

    // Rays from top of head (150 cm) and feet (0 cm) to eyes (140 cm)
    for (const [srcCm, hitCm] of [[headCm, reqTop], [feetCm, reqBot]]) {
      const hitsMirror = hitCm <= mirTopCm && hitCm >= mirBotCm;
      const col = hitsMirror ? c.neutron : c.muted;
      ctx.strokeStyle = col;
      ctx.lineWidth = hitsMirror ? 1.8 : 1.2;
      ctx.beginPath();
      ctx.moveTo(ox, yOfCm(srcCm));
      ctx.lineTo(MIRROR_X, yOfCm(hitCm));
      ctx.lineTo(ox, yOfCm(eyeCm));
      ctx.stroke();
      if (showTraced && hitsMirror) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(MIRROR_X, yOfCm(hitCm));
        ctx.lineTo(ix, yOfCm(srcCm));
        ctx.stroke();
        ctx.restore();
      }
    }

    const visTop = Math.min(headCm, Math.max(feetCm, 2 * mirTopCm - eyeCm));
    const visBot = Math.min(headCm, Math.max(feetCm, 2 * mirBotCm - eyeCm));
    const pct = Math.round(((visTop - visBot) / 150) * 100);
    const mirH = mirTopCm - mirBotCm;

    say(
      `A 150 cm person needs a 75 cm mirror (half their height, from 70 cm to 145 cm above the floor), ` +
      `and that required mirror height does not change with distance (${obj.d} cm). ` +
      `Your ${mirH} cm mirror shows ${pct}% of the body (from ${Math.round(visBot)} cm to ${Math.round(visTop)} cm).`
    );
  }

  function drawFrame() {
    const ctx = k.ctx;
    k.clear(c.plate);
    if (tab === 0) drawPointAndEye(ctx);
    else drawWholeBody(ctx);
  }

  api.loop(() => {
    drawFrame();
  });

  drawFrame();
  return { destroy() {} };
}, { label: 'Move in front of the mirror', static: true });
