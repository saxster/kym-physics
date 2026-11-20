// Editorial Drafting & Visual Craft Helpers for 2D Simulation Canvases.
// Encodes @saxster/atlas draft_standard.json roles, WCAG-audited palettes,
// dual-coded physics vectors, architectural dimensions, and tactile apparatus primitives.
import { draw } from './core.js';
import { fmtSpeedPure } from './phet_models.mjs';

export const DRAFT_ROLES = {
  primary: { width: 2.0, alpha: 1.0, dash: [] },
  secondary: { width: 1.4, alpha: 0.72, dash: [] },
  guide: { width: 1.0, alpha: 0.28, dash: [] },
  grid: { width: 1.0, alpha: 0.14, dash: [] },
  centerline: { width: 1.1, alpha: 0.55, dash: [8, 3, 1, 3] },
  hidden: { width: 1.2, alpha: 0.45, dash: [3, 5] },
  transfer: { width: 1.5, alpha: 0.78, dash: [4, 6] },
};

export function setRole(ctx, roleName, color) {
  const role = DRAFT_ROLES[roleName] || DRAFT_ROLES.primary;
  if (color) ctx.strokeStyle = color;
  ctx.lineWidth = role.width;
  ctx.globalAlpha = role.alpha;
  ctx.setLineDash(role.dash);
}

export function isDarkTheme() {
  if (typeof document === 'undefined') return false;
  const t = document.documentElement.dataset.theme;
  if (t === 'dark') return true;
  if (t === 'light' || t === 'sepia') return false;
  return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function simPalette(api) {
  const c = api.colors();
  const dark = isDarkTheme();
  const cb = !!api.prefs?.colorblind;
  if (cb) {
    return {
      ...c,
      force: dark ? '#f28e4b' : '#b34500',
      net: dark ? '#69cfa6' : '#007a5a',
      friction: dark ? '#dfb476' : '#8a5a10',
      velocity: dark ? '#6ec4f0' : '#005f99',
      accel: dark ? '#c79de6' : '#7a3e9d',
      pe: dark ? '#6ec4f0' : '#005f99',
      ke: dark ? '#69cfa6' : '#007a5a',
      thermal: dark ? '#f28e4b' : '#b34500',
      current: dark ? '#f28e4b' : '#b34500',
      charge: dark ? '#6ec4f0' : '#005f99',
      ledGlow: dark ? '#f28e4b' : '#b34500',
      water: dark ? '#6ec4f0' : '#2a7bb5',
    };
  }
  return {
    ...c,
    force: c.proton,
    net: c.green || (dark ? '#73bd96' : '#226b48'),
    friction: c.neutron || (dark ? '#d4a35f' : '#8a5a10'),
    velocity: c.electron,
    accel: dark ? '#c79de6' : '#7a3e9d',
    pe: c.electron,
    ke: c.green || (dark ? '#73bd96' : '#226b48'),
    thermal: c.proton,
    current: c.proton,
    charge: c.electron,
    ledGlow: c.proton,
    water: c.electron,
  };
}

export function fmtSpeed(mps, prefs) {
  return fmtSpeedPure(mps, prefs?.units);
}

export function canvasPointerCoords(ev, cv, W, H) {
  const r = cv.getBoundingClientRect();
  return {
    lx: ((ev.clientX - r.left) / Math.max(1, r.width)) * W,
    ly: ((ev.clientY - r.top) / Math.max(1, r.height)) * H,
  };
}

// Dual-coded physics vector arrow: distinct shaft + head grammar per physical quantity
// so vectors never rely on hue alone.
export function drawVector(ctx, x1, y1, x2, y2, { kind = 'force', color = '#1a2824', width = 2.4, head = 8.5 } = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const ang = Math.atan2(dy, dx);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (kind === 'friction') {
    ctx.setLineDash([5, 3]);
  } else if (kind === 'net') {
    // Subtle outer halo behind shaft so net force visually stands apart from pulls
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = width + 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 - head * 0.6 * Math.cos(ang), y2 - head * 0.6 * Math.sin(ang));
    ctx.stroke();
    ctx.restore();
  }

  ctx.lineWidth = width;
  const tipBack = kind === 'velocity' ? head * 0.25 : head * 0.65;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - tipBack * Math.cos(ang), y2 - tipBack * Math.sin(ang));
  ctx.stroke();
  ctx.setLineDash([]);

  if (kind === 'velocity') {
    // Open chevron arrowhead for kinematics (distinct from solid force arrows)
    ctx.lineWidth = Math.max(1.8, width);
    ctx.beginPath();
    ctx.moveTo(x2 - head * Math.cos(ang - 0.45), y2 - head * Math.sin(ang - 0.45));
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(ang + 0.45), y2 - head * Math.sin(ang + 0.45));
    ctx.stroke();
  } else if (kind === 'accel') {
    // Double chevron for acceleration
    ctx.lineWidth = Math.max(1.8, width);
    for (const off of [0, head * 0.55]) {
      const tx = x2 - off * Math.cos(ang);
      const ty = y2 - off * Math.sin(ang);
      ctx.beginPath();
      ctx.moveTo(tx - head * 0.85 * Math.cos(ang - 0.45), ty - head * 0.85 * Math.sin(ang - 0.45));
      ctx.lineTo(tx, ty);
      ctx.lineTo(tx - head * 0.85 * Math.cos(ang + 0.45), ty - head * 0.85 * Math.sin(ang + 0.45));
      ctx.stroke();
    }
  } else {
    // Crisp solid triangle for force / net / friction
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42));
    ctx.lineTo(x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Architectural dimension line with 45-degree slash ticks (draft_standard.json geometry).
export function drawDimension(ctx, x1, y1, x2, y2, textStr, { color = '#53635d', bg = '#fbfaf5', tick = 5 } = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const ang = Math.atan2(dy, dx);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  for (const [px, py] of [[x1, y1], [x2, y2]]) {
    const a = ang + Math.PI / 4;
    ctx.moveTo(px - tick * Math.cos(a), py - tick * Math.sin(a));
    ctx.lineTo(px + tick * Math.cos(a), py + tick * Math.sin(a));
  }
  ctx.stroke();
  if (textStr) {
    const mx = (x1 + x2) * 0.5;
    const my = (y1 + y2) * 0.5;
    ctx.font = '600 11px Lexend, system-ui, sans-serif';
    const w = ctx.measureText(textStr).width + 8;
    ctx.fillStyle = bg;
    ctx.fillRect(mx - w / 2, my - 8, w, 16);
    draw.text(ctx, textStr, mx, my + 3.5, { size: 11, color, align: 'center', weight: 600 });
  }
  ctx.restore();
}

// Inertial water beaker sitting on the cart: surface tilts only when accelerating (a != 0).
export function drawWaterBeaker(ctx, x, y, w, h, tiltRad, ripplePhase, pal) {
  ctx.save();
  draw.roundRect(ctx, x, y, w, h, 4);
  ctx.fillStyle = pal.sheet;
  ctx.fill();

  ctx.save();
  draw.roundRect(ctx, x + 1.5, y + 1.5, w - 3, h - 3, 3);
  ctx.clip();

  const midY = y + h * 0.52;
  const halfW = w * 0.5;
  const slope = Math.tan(Math.max(-0.46, Math.min(0.46, tiltRad)));
  // Canvas Y increases downward: when a > 0, tiltRad < 0, so water rises on the left (yL < midY).
  const yL = midY + halfW * slope;
  const yR = midY - halfW * slope;
  const slosh = Math.abs(tiltRad) > 0.01 ? Math.sin(ripplePhase * 7) * 1.3 : 0;

  // Water fill
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, yL + slosh);
  ctx.quadraticCurveTo(x + halfW, midY - slosh, x + w, yR + slosh);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fillStyle = pal.water;
  ctx.globalAlpha = 0.42;
  ctx.fill();

  // Bright meniscus line
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = pal.water;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, yL + slosh);
  ctx.quadraticCurveTo(x + halfW, midY - slosh, x + w, yR + slosh);
  ctx.stroke();

  // Level a = 0 reference datum ticks
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = pal.muted;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 2, midY);
  ctx.lineTo(x + w - 2, midY);
  ctx.stroke();
  ctx.restore();

  // Glass outline + specular streak
  draw.roundRect(ctx, x, y, w, h, 4);
  ctx.strokeStyle = pal.ink;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.strokeStyle = pal.sheet;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 4);
  ctx.lineTo(x + 5, y + h - 5);
  ctx.stroke();
  ctx.restore();
}

// Floating proportional Energy Pie Chart anchored above moving object.
export function drawMiniPie(ctx, cx, cy, r, { pe = 0, ke = 0, thermal = 0 }, pal) {
  const peN = Math.max(0, pe);
  const keN = Math.max(0, ke);
  const thN = Math.max(0, thermal);
  const tot = Math.max(1e-9, peN + keN + thN);
  const slices = [
    { val: peN, col: pal.pe, lbl: 'PE' },
    { val: keN, col: pal.ke, lbl: 'KE' },
    { val: thN, col: pal.thermal, lbl: 'Th' },
  ];
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2.5, 0, Math.PI * 2);
  ctx.fillStyle = pal.sheet;
  ctx.fill();
  ctx.strokeStyle = pal.ink;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  let a = -Math.PI / 2;
  for (const s of slices) {
    if (s.val <= 1e-6) continue;
    const sweep = (s.val / tot) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a, a + sweep);
    ctx.closePath();
    ctx.fillStyle = s.col;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = pal.sheet;
    ctx.lineWidth = 1;
    ctx.stroke();
    a += sweep;
  }
  ctx.restore();
}

// Lifelike vs. Schematic Resistor (330 ohm colour bands in lifelike, crisp IEC zigzag in schematic).
export function drawCircuitResistor(ctx, x, y, w, h, label, pal, style = 'lifelike') {
  ctx.save();
  ctx.fillStyle = pal.plate;
  ctx.fillRect(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4);
  if (style === 'lifelike') {
    const bw = w * 0.72, bh = 14, bx = x - bw / 2, by = y - bh / 2;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(bx, y);
    ctx.moveTo(bx + bw, y);
    ctx.lineTo(x + w / 2, y);
    ctx.stroke();
    draw.roundRect(ctx, bx, by, bw, bh, 5);
    ctx.fillStyle = pal.sheet;
    ctx.fill();
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 330 ohm 4-band colour code: orange, orange, brown, gold
    const bands = ['#d96b1c', '#d96b1c', '#6e4220', '#c49b2d'];
    bands.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(bx + 8 + i * 11, by + 1.5, 4.5, bh - 3);
    });
  } else {
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    for (let i = 0; i < 10; i++) {
      ctx.lineTo(x - w / 2 + ((i + 1) * w) / 11, y + (i % 2 ? 1 : -1) * h * 0.3);
    }
    ctx.lineTo(x + w / 2, y);
    ctx.stroke();
  }
  if (label) {
    draw.text(ctx, label, x, y - 14, { size: 11.5, color: pal.ink, align: 'center', weight: 600 });
  }
  ctx.restore();
}

export function drawCircuitLED(ctx, x, y, powerW, isBroken, label, pal, style = 'lifelike', showPower = !!label) {
  ctx.save();
  const bright = !isBroken && powerW > 0.001 ? Math.min(1, 0.25 + (powerW / 0.0424) * 0.75) : 0;
  if (bright > 0) {
    const grad = ctx.createRadialGradient(x, y, 2, x, y, 22);
    grad.addColorStop(0, pal.ledGlow);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.45 * bright;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (isBroken) {
    ctx.fillStyle = pal.plate;
    ctx.fillRect(x - 18, y - 12, 36, 24);
    ctx.strokeStyle = pal.force;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x - 4, y - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 15, y, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 15, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = pal.sheet;
    ctx.fill();
    ctx.stroke();
    draw.text(ctx, 'unclipped gap', x, y + 20, { size: 10, color: pal.force, align: 'center', weight: 700 });
    ctx.restore();
    return;
  }

  ctx.fillStyle = pal.plate;
  ctx.fillRect(x - 13, y - 13, 26, 26);
  if (style === 'lifelike') {
    // Glass dome LED silhouette
    ctx.beginPath();
    ctx.arc(x, y - 2, 10, Math.PI, 0);
    ctx.lineTo(x + 10, y + 8);
    ctx.lineTo(x - 10, y + 8);
    ctx.closePath();
    ctx.fillStyle = bright > 0 ? pal.ledGlow : pal.sheet;
    ctx.globalAlpha = bright > 0 ? 0.25 + 0.7 * bright : 1;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.7;
    ctx.stroke();
    // Anode / cathode legs
    ctx.beginPath();
    ctx.moveTo(x - 13, y); ctx.lineTo(x - 10, y);
    ctx.moveTo(x + 10, y); ctx.lineTo(x + 13, y);
    ctx.stroke();
  } else {
    // Schematic diode + emission arrows
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 9);
    ctx.lineTo(x + 6, y);
    ctx.lineTo(x - 9, y + 9);
    ctx.closePath();
    ctx.fillStyle = bright > 0 ? pal.ledGlow : pal.sheet;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 7, y - 10);
    ctx.lineTo(x + 7, y + 10);
    ctx.stroke();
  }
  drawVector(ctx, x + 8, y - 10, x + 17, y - 19, { kind: 'force', color: pal.force, width: 1.3, head: 4.5 });
  drawVector(ctx, x + 13, y - 5, x + 22, y - 14, { kind: 'force', color: pal.force, width: 1.3, head: 4.5 });
  if (label) draw.text(ctx, label, x, y - 24, { size: 10.5, color: pal.ink, align: 'center', weight: 600 });
  if (showPower) draw.text(ctx, `${powerW.toFixed(3)} W`, x, y + 23, { size: 10, color: pal.muted, align: 'center' });
  ctx.restore();
}

export function drawCircuitBattery(ctx, x, midY, voltageStr, pal, style = 'lifelike') {
  ctx.save();
  if (style === 'lifelike') {
    draw.roundRect(ctx, x - 24, midY - 28, 48, 56, 6);
    ctx.fillStyle = pal.sheet;
    ctx.fill();
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // Copper top cap
    ctx.fillStyle = pal.friction;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(x - 23, midY - 27, 46, 15);
    ctx.globalAlpha = 1;
    draw.text(ctx, voltageStr, x, midY + 7, { size: 12, color: pal.ink, align: 'center', weight: 700 });
  } else {
    // Classic schematic two-plate cell symbol
    ctx.fillStyle = pal.plate;
    ctx.fillRect(x - 20, midY - 20, 40, 40);
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x - 16, midY - 7); ctx.lineTo(x + 16, midY - 7); // long + plate
    ctx.stroke();
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(x - 9, midY + 7); ctx.lineTo(x + 9, midY + 7);   // short - plate
    ctx.stroke();
    draw.text(ctx, voltageStr, x - 34, midY + 4, { size: 11.5, color: pal.ink, align: 'right', weight: 700 });
  }
  draw.text(ctx, '+', x, midY - 34, { size: 12, color: pal.force, align: 'center', weight: 700 });
  draw.text(ctx, '−', x, midY + 44, { size: 12, color: pal.charge, align: 'center', weight: 700 });
  ctx.restore();
}
