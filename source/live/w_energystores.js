// Ch 7.1 c7_ledger -> w_energystores: The 8 Energy Stores as Glowing Hatched Jars + 4 Pathway Tubes.
// Features:
//   - 8 stores with both glowing colour and engraved monochrome hatch patterns (colour-blind & print safe):
//     Kinetic (#2f7bff, chevrons), Gravitational (#8a4dff, horizontal bars), Elastic (#ff3fb4, zigzag),
//     Thermal (#ff7a1c, waves), Chemical (#26c75a, hex), Magnetic (#e8233a, arcs),
//     Electrostatic (#18c4dc, pluses), Nuclear (#ffcf1a, rings).
//   - Smart Jar Auto-Scaling (jarScale): picks a 1-2-5 × 10^n J capacity ("full jar = 1 J", "full jar = 5 kJ", etc.),
//     and overflows for 1 second of the Sun's nuclear output (3.83 × 10^26 J).
//   - 4 Pathway Tubes with shortest-arc HSV colour blending:
//     Mechanical work (steady stream), Electrical work (fast pulses), Heating (wavering thermal shimmer), Radiation (stepped wave rays).
import { Live } from './core.js';

export const STORES = [
  { id: 'kinetic', name: 'Kinetic', short: 'Kinetic (½mv²)', color: '#2f7bff', hatch: 'chevrons', desc: 'Moving things' },
  { id: 'grav', name: 'Gravitational', short: 'Gravitational (mgh)', color: '#8a4dff', hatch: 'bars', desc: 'Raised mass in gravity' },
  { id: 'elastic', name: 'Elastic', short: 'Elastic (½kx²)', color: '#ff3fb4', hatch: 'zigzag', desc: 'Stretched or squashed' },
  { id: 'thermal', name: 'Thermal', short: 'Thermal (internal)', color: '#ff7a1c', hatch: 'waves', desc: 'Jiggling molecules' },
  { id: 'chemical', name: 'Chemical', short: 'Chemical', color: '#26c75a', hatch: 'hex', desc: 'Food, fuel, battery' },
  { id: 'magnetic', name: 'Magnetic', short: 'Magnetic', color: '#e8233a', hatch: 'arcs', desc: 'Magnets & coils' },
  { id: 'electro', name: 'Electrostatic', short: 'Electrostatic', color: '#18c4dc', hatch: 'pluses', desc: 'Electric charges' },
  { id: 'nuclear', name: 'Nuclear', short: 'Nuclear (mc²)', color: '#ffcf1a', hatch: 'rings', desc: 'Atomic nuclei' },
];
const STORE_MAP = Object.fromEntries(STORES.map(s => [s.id, s]));

// Smart 1-2-5 × 10^n J auto-scaler
export function jarScale(maxJ) {
  if (!Number.isFinite(maxJ) || maxJ <= 0) return { cap: 1, label: '1 J', overflow: false };
  if (maxJ > 1e15) {
    return { cap: 1e12, label: '1 TJ (OVERFLOW!)', overflow: true };
  }
  const exp = Math.floor(Math.log10(maxJ));
  const base = Math.pow(10, exp);
  const norm = maxJ / base; // in [1, 10)
  const step = norm <= 1.0001 ? 1 : norm <= 2.0001 ? 2 : norm <= 5.0001 ? 5 : 10;
  const cap = step * base;
  return { cap, label: fmtJoules(cap), overflow: false };
}

export function fmtJoules(j) {
  if (j >= 1e20) return `${(j / 1e26).toFixed(2)} × 10²⁶ J`;
  if (j >= 1e12) return `${+(j / 1e12).toFixed(2)} TJ`;
  if (j >= 1e9) return `${+(j / 1e9).toFixed(2)} GJ`;
  if (j >= 1e6) return `${+(j / 1e6).toFixed(2)} MJ`;
  if (j >= 1e3) return `${+(j / 1e3).toFixed(2)} kJ`;
  if (j >= 10) return `${Math.round(j)} J`;
  return `${+j.toFixed(2)} J`;
}

// Shortest-arc HSV interpolation so complementary colours stay vivid instead of muddy grey
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max, v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, v];
}
function hsvToRgbCss(h, s, v, alpha = 1) {
  h = ((h % 1) + 1) % 1;
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alpha})`;
}
export function blendHSVShortArc(hexA, hexB, u, alpha = 1) {
  const [h1, s1, v1] = rgbToHsv(...hexToRgb(hexA));
  const [h2, s2, v2] = rgbToHsv(...hexToRgb(hexB));
  let dh = h2 - h1;
  if (dh > 0.5) dh -= 1;
  else if (dh < -0.5) dh += 1;
  return hsvToRgbCss(h1 + dh * u, s1 + (s2 - s1) * u, v1 + (v2 - v1) * u, alpha);
}

// Draw monochrome engraved hatch inside a clipped liquid rectangle (x, y, w, h)
export function drawStoreHatch(ctx, hatch, x, y, w, h, inkCol = 'rgba(20,30,25,0.42)') {
  if (h <= 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = inkCol;
  ctx.lineWidth = 1.15;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (hatch === 'chevrons') {
    for (let yy = y + 6; yy < y + h + 8; yy += 10) {
      for (let xx = x + 6; xx < x + w - 4; xx += 14) {
        ctx.beginPath();
        ctx.moveTo(xx, yy + 3);
        ctx.lineTo(xx + 5, yy - 2);
        ctx.lineTo(xx + 10, yy + 3);
        ctx.stroke();
      }
    }
  } else if (hatch === 'bars') {
    for (let yy = y + 5; yy < y + h; yy += 7) {
      ctx.beginPath();
      ctx.moveTo(x + 4, yy);
      ctx.lineTo(x + w - 4, yy);
      ctx.stroke();
    }
  } else if (hatch === 'zigzag') {
    for (let yy = y + 7; yy < y + h + 6; yy += 11) {
      ctx.beginPath();
      for (let xx = x + 2, k = 0; xx <= x + w - 2; xx += 6, k++) {
        const py = yy + (k % 2 ? -3.5 : 3.5);
        if (k === 0) ctx.moveTo(xx, py); else ctx.lineTo(xx, py);
      }
      ctx.stroke();
    }
  } else if (hatch === 'waves') {
    for (let yy = y + 7; yy < y + h + 6; yy += 10) {
      ctx.beginPath();
      for (let xx = x + 2; xx <= x + w - 2; xx += 3) {
        const py = yy + Math.sin((xx - x) * 0.42) * 2.6;
        if (xx === x + 2) ctx.moveTo(xx, py); else ctx.lineTo(xx, py);
      }
      ctx.stroke();
    }
  } else if (hatch === 'hex') {
    const r = 5.5;
    for (let row = 0, yy = y + 7; yy < y + h + r; row++, yy += 9.5) {
      const off = (row % 2) * 8;
      for (let xx = x + 7 + off; xx < x + w - 4; xx += 16) {
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const th = (a * Math.PI) / 3;
          const px = xx + r * Math.cos(th), py = yy + r * Math.sin(th);
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (hatch === 'arcs') {
    for (let yy = y + 10; yy < y + h + 8; yy += 12) {
      for (let xx = x + 12; xx < x + w - 4; xx += 18) {
        ctx.beginPath();
        ctx.arc(xx, yy, 6, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    }
  } else if (hatch === 'pluses') {
    for (let yy = y + 8; yy < y + h; yy += 12) {
      for (let xx = x + 8; xx < x + w - 4; xx += 13) {
        ctx.beginPath();
        ctx.moveTo(xx - 3, yy); ctx.lineTo(xx + 3, yy);
        ctx.moveTo(xx, yy - 3); ctx.lineTo(xx, yy + 3);
        ctx.stroke();
      }
    }
  } else if (hatch === 'rings') {
    for (let yy = y + 9; yy < y + h; yy += 14) {
      for (let xx = x + 10; xx < x + w - 5; xx += 16) {
        ctx.beginPath();
        ctx.arc(xx, yy, 4.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(xx, yy, 1.4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

// Draw a glowing jar with hatched liquid, rising bubbles, neck/rim, and handwritten Caveat tag
export function drawEnergyJar(ctx, x, yBase, w, hMax, storeId, valJ, capJ, t, c, opts = {}) {
  const st = STORE_MAP[storeId] || STORES[0];
  const rawFrac = capJ > 0 ? valJ / capJ : 0;
  const overflow = rawFrac > 1.02 || opts.overflow;
  const frac = Math.max(0, Math.min(1, rawFrac));
  const fillH = frac * (hMax - 12);
  const yTop = yBase - hMax;

  ctx.save();
  // Outer soft glow when holding energy
  if (frac > 0.02) {
    ctx.shadowColor = st.color;
    ctx.shadowBlur = overflow ? 20 : 12;
  }

  // Jar body background
  ctx.fillStyle = c.sheet;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, yTop + 8, w, hMax - 8, [4, 4, 8, 8]) : ctx.rect(x, yTop + 8, w, hMax - 8);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Liquid fill
  if (fillH > 0.5) {
    const fy = yBase - fillH;
    ctx.fillStyle = st.color;
    ctx.globalAlpha = 0.34;
    ctx.fillRect(x + 2, fy, w - 4, fillH - 1);
    ctx.globalAlpha = 0.85;
    // Glowing meniscus line
    ctx.strokeStyle = st.color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x + 2, fy);
    ctx.lineTo(x + w - 2, fy);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engraved monochrome hatch pattern (always legible in print & colour-blind safe)
    drawStoreHatch(ctx, st.hatch, x + 2, fy, w - 4, fillH, c.ink);

    // Rising bubbles inside active liquid
    if (fillH > 14 && t > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.55;
      for (let b = 0; b < 5; b++) {
        const bx = x + 7 + ((b * 17 + 5) % Math.max(8, w - 14));
        const by = yBase - 4 - (((t * (22 + b * 5) + b * 29) % Math.max(10, fillH - 8)));
        ctx.beginPath();
        ctx.arc(bx, by, 1.6 + (b % 2) * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  // Overflow fountain at top of jar for the Sun!
  if (overflow) {
    ctx.fillStyle = st.color;
    ctx.globalAlpha = 0.72;
    for (let k = -2; k <= 2; k++) {
      const ox = x + w / 2 + k * 7 + Math.sin(t * 5 + k) * 3;
      const oy = yTop + 4 - Math.abs(k) * 2 - ((t * 25 + Math.abs(k) * 7) % 12);
      ctx.beginPath();
      ctx.arc(ox, oy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Jar glass outline + neck rim + graduation ticks
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, yTop + 8, w, hMax - 8, [4, 4, 8, 8]) : ctx.rect(x, yTop + 8, w, hMax - 8);
  ctx.stroke();

  // Jar lip / collar
  ctx.fillStyle = c.plate;
  ctx.fillRect(x + 4, yTop + 2, w - 8, 6);
  ctx.strokeRect(x + 4, yTop + 2, w - 8, 6);

  // Quarter graduation ticks on right side of jar
  ctx.strokeStyle = c.muted;
  ctx.lineWidth = 1;
  for (let q = 1; q <= 3; q++) {
    const ty = yBase - (q / 4) * (hMax - 12);
    ctx.beginPath();
    ctx.moveTo(x + w - 6, ty);
    ctx.lineTo(x + w - 1, ty);
    ctx.stroke();
  }

  // Handwritten Caveat tag with joule readout
  const valStr = opts.valLabel || fmtJoules(valJ);
  ctx.font = '700 14.5px Caveat, "Bradley Hand", Lexend, cursive';
  ctx.fillStyle = c.ink;
  ctx.textAlign = 'center';
  ctx.fillText(valStr, x + w / 2, yTop - 4);

  // Store name below jar
  ctx.font = '600 11.5px Lexend, system-ui, sans-serif';
  ctx.fillStyle = c.ink;
  ctx.fillText(st.name, x + w / 2, yBase + 15);
  if (opts.subLabel) {
    ctx.font = '400 10px Lexend, system-ui, sans-serif';
    ctx.fillStyle = c.muted;
    ctx.fillText(opts.subLabel, x + w / 2, yBase + 28);
  }
  ctx.restore();
}

// Draw one of the 4 Pathway Tubes between (x1, y1) and (x2, y2):
// pathway in {'mechanical', 'electrical', 'heating', 'radiation'}
export function drawPathwayTube(ctx, x1, y1, x2, y2, fromId, toId, pathway, rate, t, c) {
  if (rate <= 0.01) return;
  const stA = STORE_MAP[fromId] || STORES[0];
  const stB = STORE_MAP[toId] || STORES[3];
  const N = 28;
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - 28 - Math.abs(x2 - x1) * 0.08;

  const pt = (u) => {
    const m = 1 - u;
    return [
      m * m * x1 + 2 * m * u * cx + u * u * x2,
      m * m * y1 + 2 * m * u * cy + u * u * y2,
    ];
  };

  ctx.save();
  ctx.lineCap = 'round';
  // Glowing tube segments with shortest-arc HSV colour blend
  const width = 4.5 + Math.min(5, rate * 4.5);
  for (let i = 0; i < N; i++) {
    const u0 = i / N, u1 = (i + 1) / N, um = (u0 + u1) * 0.5;
    let [px0, py0] = pt(u0);
    let [px1, py1] = pt(u1);
    if (pathway === 'heating') {
      // Wavering thermal shimmer
      py0 += Math.sin(u0 * 18 - t * 7) * 2.8;
      py1 += Math.sin(u1 * 18 - t * 7) * 2.8;
    } else if (pathway === 'radiation') {
      // Stepped electromagnetic/acoustic wave rays
      py0 += (Math.floor(((u0 * 14 - t * 3.5) % 1 + 1) % 1 * 2) * 2 - 1) * 2.6;
      py1 += (Math.floor(((u1 * 14 - t * 3.5) % 1 + 1) % 1 * 2) * 2 - 1) * 2.6;
    }
    ctx.strokeStyle = blendHSVShortArc(stA.color, stB.color, um, 0.72);
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(px0, py0);
    ctx.lineTo(px1, py1);
    ctx.stroke();
  }

  // Animated pathway pattern overlays inside the tube
  const flowPhase = (t * 0.85) % 1;
  const nBeads = pathway === 'electrical' ? 9 : 6;
  for (let k = 0; k < nBeads; k++) {
    const u = (k / nBeads + flowPhase) % 1;
    const [bx, by] = pt(u);
    ctx.fillStyle = '#ffffff';
    if (pathway === 'electrical') {
      // Fast sharp pulses
      ctx.beginPath();
      ctx.arc(bx, by, 2.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (pathway === 'mechanical') {
      // Steady directional stream chevrons
      ctx.beginPath();
      ctx.arc(bx, by, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Pathway label badge at apex of tube
  const [mx, my] = pt(0.5);
  const pLabels = {
    mechanical: 'Mechanical work',
    electrical: 'Electrical work',
    heating: 'Heating',
    radiation: 'Radiation (waves)',
  };
  const lab = pLabels[pathway] || pathway;
  ctx.font = '600 10.5px Lexend, system-ui, sans-serif';
  const tw = ctx.measureText(lab).width + 10;
  ctx.fillStyle = c.sheet;
  ctx.strokeStyle = c.rule;
  ctx.lineWidth = 1;
  ctx.fillRect(mx - tw / 2, my - 19, tw, 15);
  ctx.strokeRect(mx - tw / 2, my - 19, tw, 15);
  ctx.fillStyle = c.ink;
  ctx.textAlign = 'center';
  ctx.fillText(lab, mx, my - 8);
  ctx.restore();
}

const SCENARIOS = [
  {
    name: 'Bouncing ball (0.98 J)',
    totalJ: 0.98,
    sliderLabel: 'Stage of drop & bounce',
    stages: ['Released (1.00 m)', 'Halfway down (0.50 m)', 'Impact squash (floor)', 'Top of 1st bounce (0.64 m)'],
    eval(u) {
      // u in [0, 3]
      if (u <= 1) {
        const f = u;
        return {
          jars: [
            { id: 'grav', val: 0.98 * (1 - f), sub: 'height mgh' },
            { id: 'kinetic', val: 0.98 * f, sub: 'motion ½mv²' },
            { id: 'elastic', val: 0, sub: 'squash ½kx²' },
            { id: 'thermal', val: 0, sub: 'warmth + sound' },
          ],
          tubes: [
            { from: 0, to: 1, fromId: 'grav', toId: 'kinetic', way: 'mechanical', rate: Math.sin(f * Math.PI) + 0.25 },
          ],
          eq: `E_p + E_k + E_el + E_th = ${(0.98 * (1 - f)).toFixed(2)} + ${(0.98 * f).toFixed(2)} + 0.00 + 0.00 = 0.98 J`,
          caption: 'Gravity pulls the 100 g ball down: the mechanical work pathway pours joules from the gravitational jar into the kinetic jar.',
        };
      }
      if (u <= 2) {
        const f = u - 1;
        const elJ = 0.78 * f;
        const thJ = 0.20 * f;
        const keJ = Math.max(0, 0.98 - elJ - thJ);
        return {
          jars: [
            { id: 'grav', val: 0, sub: 'height mgh' },
            { id: 'kinetic', val: keJ, sub: 'motion ½mv²' },
            { id: 'elastic', val: elJ, sub: 'squash ½kx²' },
            { id: 'thermal', val: thJ, sub: 'warmth + sound' },
          ],
          tubes: [
            { from: 1, to: 2, fromId: 'kinetic', toId: 'elastic', way: 'mechanical', rate: 0.8 },
            { from: 1, to: 3, fromId: 'kinetic', toId: 'thermal', way: 'heating', rate: 0.45 },
          ],
          eq: `Impact squash: E_k (${keJ.toFixed(2)} J) + E_el (${elJ.toFixed(2)} J) + E_th (${thJ.toFixed(2)} J) = 0.98 J`,
          caption: 'At the floor the rubber squashes into the elastic store while internal rubbing warms the rubber and sends out a thock sound wave.',
        };
      }
      const f = u - 2;
      const gravJ = 0.63 * f;
      const elJ = 0.78 * (1 - f);
      const thJ = 0.20 + 0.15 * f;
      const keJ = Math.max(0, 0.98 - gravJ - elJ - thJ);
      return {
        jars: [
          { id: 'grav', val: gravJ, sub: 'height 0.64 m' },
          { id: 'kinetic', val: keJ, sub: 'motion ½mv²' },
          { id: 'elastic', val: elJ, sub: 'squash ½kx²' },
          { id: 'thermal', val: thJ, sub: 'warmth + sound' },
        ],
        tubes: [
          { from: 2, to: 0, fromId: 'elastic', toId: 'grav', way: 'mechanical', rate: 0.7 * (1 - f * 0.6) },
          { from: 2, to: 3, fromId: 'elastic', toId: 'thermal', way: 'radiation', rate: 0.35 },
        ],
        eq: `1st bounce peak: E_p = ${gravJ.toFixed(2)} J · to thermal & sound = ${thJ.toFixed(2)} J · Total = 0.98 J`,
        caption: 'At the 0.64 m peak: 0.63 J is back in the gravitational jar and 0.35 J stays in the thermal jar (warm rubber, floor and air).',
      };
    },
  },
  {
    name: 'Climbing 4 floors (18.8 kJ)',
    totalJ: 18800,
    eval(u) {
      const f = u / 3;
      const grav = 4704 * f; // 40 kg * 9.8 * 12 m = 4,704 J useful mechanical work
      const therm = 14096 * f; // ~25% muscle efficiency -> 3x as much warms the body
      const chem = Math.max(0, 18800 - grav - therm);
      return {
        jars: [
          { id: 'chemical', val: chem, sub: 'food in muscles' },
          { id: 'grav', val: grav, sub: 'height (4 floors)' },
          { id: 'thermal', val: therm, sub: 'warmth in body' },
        ],
        tubes: [
          { from: 0, to: 1, fromId: 'chemical', toId: 'grav', way: 'mechanical', rate: f > 0.02 ? 0.65 : 0 },
          { from: 0, to: 2, fromId: 'chemical', toId: 'thermal', way: 'heating', rate: f > 0.02 ? 0.9 : 0 },
        ],
        eq: `W_climb = m g h = 40 × 9.8 × ${(12 * f).toFixed(1)} m = ${(grav / 1000).toFixed(2)} kJ · Body warmth = ${(therm / 1000).toFixed(2)} kJ`,
        caption: 'Human muscles are ~25% efficient: for every 1.18 kJ lifted into the gravitational jar per floor, ~3.5 kJ warms your body and the air.',
      };
    },
  },
  {
    name: 'Coal station (100 J)',
    totalJ: 100,
    eval(u) {
      const f = u / 3;
      const chem = 100 * (1 - f);
      const elec = 40 * f;
      const therm = 60 * f;
      return {
        jars: [
          { id: 'chemical', val: chem, sub: 'coal fuel' },
          { id: 'kinetic', val: 15 * Math.sin(f * Math.PI), sub: 'spinning turbine' },
          { id: 'electro', val: elec, sub: 'useful out (40%)' },
          { id: 'thermal', val: therm, sub: 'cooling tower (60%)' },
        ],
        tubes: [
          { from: 0, to: 1, fromId: 'chemical', toId: 'kinetic', way: 'heating', rate: f > 0.02 ? 0.7 : 0 },
          { from: 1, to: 2, fromId: 'kinetic', toId: 'electro', way: 'electrical', rate: f > 0.02 ? 0.65 : 0 },
          { from: 0, to: 3, fromId: 'chemical', toId: 'thermal', way: 'heating', rate: f > 0.02 ? 0.95 : 0 },
        ],
        eq: `η = useful ÷ total = ${elec.toFixed(0)} J ÷ 100 J = 40% · Dissipated to thermal store = ${therm.toFixed(0)} J`,
        caption: 'Of every 100 J in the coal’s chemical store, 40 J leaves along the wires via the electrical pathway and 60 J warms the cooling water and air.',
      };
    },
  },
  {
    name: 'The Sun (1 s: 3.83 × 10²⁶ J)',
    totalJ: 3.83e26,
    eval(u) {
      const f = Math.max(0.15, u / 3);
      return {
        jars: [
          { id: 'nuclear', val: 3.83e26, sub: 'core fusion (mc²)', overflow: true, valLabel: '3.83 × 10²⁶ J' },
          { id: 'thermal', val: 3.83e26 * f, sub: '15 million °C core', overflow: true, valLabel: `${(3.83 * f).toFixed(2)} × 10²⁶ J` },
          { id: 'grav', val: 1.74e17 * f, sub: 'reaching Earth', overflow: true, valLabel: '1.74 × 10¹⁷ J' },
        ],
        tubes: [
          { from: 0, to: 1, fromId: 'nuclear', toId: 'thermal', way: 'heating', rate: 1.0 },
          { from: 1, to: 2, fromId: 'thermal', toId: 'grav', way: 'radiation', rate: 1.0 },
        ],
        eq: `E = Δm c² = (4.26 × 10⁹ kg) × (3.00 × 10⁸ m/s)² = 3.83 × 10²⁶ J every single second!`,
        caption: 'Every second the Sun turns 4.26 million tonnes of mass in its nuclear store into 3.83 × 10²⁶ J of thermal and radiation energy — overflowing any terrestrial jar.',
      };
    },
  },
];

Live.register('energystores', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 320;
  const k = api.canvas(W, H, 'Glowing energy store jars with monochrome hatches and 4 animated transfer pathway tubes');

  let scenIdx = 0;
  let progress = 3.0; // 0..3
  let showAll8 = false;
  let cutAway = false;
  const say = api.readout();

  const progSlider = api.slider('Transfer progress', {
    min: 0, max: 3, step: 0.05, value: progress,
    fmt: (v) => `${Math.round((v / 3) * 100)}%`,
    onInput: (v) => { progress = +v; showAll8 = false; allBtn.setAttribute('aria-pressed', 'false'); update(); },
  });

  const tabBtns = api.tabs(SCENARIOS.map(s => s.name), (i) => {
    scenIdx = i;
    showAll8 = false;
    allBtn.setAttribute('aria-pressed', 'false');
    update();
  }, 0);

  const allBtn = api.button('All 8 stores & hatches', (b) => {
    showAll8 = !showAll8;
    b.setAttribute('aria-pressed', String(showAll8));
    update();
  }, { pressed: false });

  api.challenge(
    'Inspect “The Sun (1 s: 3.83 × 10²⁶ J)” or open “All 8 stores & hatches” and set transfer progress to 100%',
    () => (scenIdx === 3 && progress >= 2.8) || (showAll8 && progress >= 2.8),
  );

  const setEq = api.yourNumbers();
  api.idealised('The share of bounce energy leaving as sound is illustrative (< 1.1% in published basketball measurements, arXiv:1708.01282); almost all non-rebound energy warms the ball and floor.');

  api.watch([
    {
      title: 'Wide shot: the energy ledger as glowing jars',
      caption: 'Every store has both a colour and a monochrome hatch pattern, and the total energy across all jars stays constant.',
      enter: () => { scenIdx = 0; showAll8 = false; cutAway = false; progress = 0.0; progSlider.set(0.0); tabBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === 0))); },
    },
    {
      title: 'Close-up: impact squash & the 4 pathways',
      caption: 'As the ball hits the floor, mechanical work fills the elastic jar while heating and radiation pathways carry energy to the thermal jar.',
      enter: () => { scenIdx = 0; showAll8 = false; cutAway = false; progress = 1.85; progSlider.set(1.85); },
    },
    {
      title: 'Cut-away: inside the rubber & molecules',
      caption: 'Inside the ball, ordered downward motion turns into random molecular jiggling (thermal store) that cannot push the ball back up.',
      enter: () => { scenIdx = 0; showAll8 = false; cutAway = true; progress = 2.6; progSlider.set(2.6); },
    },
    {
      title: 'Scale jump: from 0.98 J to the Sun’s 3.83 × 10²⁶ J',
      caption: 'Smart jar auto-scaling picks a 1–2–5 × 10ⁿ J jar size — and for 1 second of sunshine, the jar overflows!',
      enter: () => { scenIdx = 3; showAll8 = false; cutAway = false; progress = 3.0; progSlider.set(3.0); tabBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === 3))); },
    },
    {
      title: 'Your turn: explore the 8 stores & pathways',
      caption: 'Your turn: drag the Transfer progress slider or tap “All 8 stores & hatches” to earn the stamp.',
      enter: () => { scenIdx = 0; showAll8 = false; cutAway = false; progress = 3.0; progSlider.set(3.0); tabBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === 0))); },
    },
  ], { onCutAway: (on) => { cutAway = on; } });

  function update() {
    const sc = SCENARIOS[scenIdx];
    const st = sc.eval(progress);
    const scale = jarScale(sc.totalJ);
    setEq(st.eq);
    say(`${st.caption} (Jar scale: full jar = ${scale.label}).`);
  }

  api.loop((dt, t) => {
    k.clear(c.plate);
    const ctx = k.ctx;

    if (showAll8) {
      api.draw.text(ctx, 'The 8 Energy Stores — each with its colour and monochrome hatch pattern', W / 2, 22, {
        size: 13.5, color: c.ink, align: 'center', weight: 600,
      });
      const jw = 54, gap = 22, startX = 28, yBase = 248, hMax = 165;
      STORES.forEach((st, i) => {
        const x = startX + i * (jw + gap);
        drawEnergyJar(ctx, x, yBase, jw, hMax, st.id, 0.72, 1.0, t, c, {
          valLabel: st.hatch,
          subLabel: st.desc,
        });
      });
      // Legend of 4 pathways at bottom
      const pWays = ['Mechanical work (forces)', 'Electrical work (current)', 'Heating (ΔT)', 'Radiation (light & sound)'];
      api.draw.text(ctx, '4 Pathways between stores:  ' + pWays.join('   ·   '), W / 2, 304, {
        size: 11, color: c.muted, align: 'center', weight: 600,
      });
      return;
    }

    const sc = SCENARIOS[scenIdx];
    const state = sc.eval(progress);
    const scale = jarScale(sc.totalJ);

    // Header & auto-scaled full-jar badge
    api.draw.text(ctx, sc.name, 22, 24, { size: 13.5, color: c.ink, weight: 600 });
    ctx.save();
    ctx.font = '700 15px Caveat, "Bradley Hand", cursive';
    ctx.fillStyle = c.vol;
    ctx.textAlign = 'right';
    ctx.fillText(`full jar = ${scale.label}`, W - 22, 24);
    ctx.restore();

    const nJars = state.jars.length;
    const jw = 72;
    const span = Math.min(520, nJars * 145);
    const startX = (W - span) / 2 + 25;
    const stepX = nJars > 1 ? (span - jw - 50) / (nJars - 1) : 0;
    const yBase = 256, hMax = 162;

    const jarCenters = state.jars.map((j, i) => [startX + i * stepX + jw / 2, yBase - hMax + 6]);

    // Draw 4-pathway tubes first so they arch cleanly between jar mouths
    for (const tb of state.tubes) {
      const [x1, y1] = jarCenters[tb.from];
      const [x2, y2] = jarCenters[tb.to];
      drawPathwayTube(ctx, x1, y1, x2, y2, tb.fromId, tb.toId, tb.way, tb.rate, t, c);
    }

    // Draw each store jar
    state.jars.forEach((j, i) => {
      const x = startX + i * stepX;
      drawEnergyJar(ctx, x, yBase, jw, hMax, j.id, j.val, scale.cap, t, c, {
        overflow: j.overflow || scale.overflow,
        valLabel: j.valLabel,
        subLabel: j.sub,
      });
    });

    // Cut-away inspector overlay when cutAway is active
    if (cutAway) {
      const cx = W - 188, cy = 44, cw = 168, ch = 96;
      ctx.save();
      ctx.fillStyle = c.sheet;
      ctx.strokeStyle = c.proton;
      ctx.lineWidth = 1.6;
      ctx.fillRect(cx, cy, cw, ch);
      ctx.strokeRect(cx, cy, cw, ch);
      api.draw.text(ctx, 'CUT-AWAY: INSIDE THE RUBBER', cx + 8, cy + 16, { size: 9.5, color: c.proton, weight: 700 });
      const rng = api.rng(42);
      for (let m = 0; m < 18; m++) {
        const mx = cx + 18 + (m % 6) * 26 + Math.sin(t * 14 + m * 1.7) * (1.2 + progress * 1.1);
        const my = cy + 34 + Math.floor(m / 6) * 20 + Math.cos(t * 15 + m * 2.3) * (1.2 + progress * 1.1);
        ctx.beginPath();
        ctx.arc(mx, my, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ff7a1c';
        ctx.fill();
      }
      api.draw.text(ctx, 'Random molecular jiggling = thermal store', cx + cw / 2, cy + ch - 7, { size: 9.5, color: c.muted, align: 'center' });
      ctx.restore();
    }
  });

  update();
  return { destroy() {} };
}, { label: 'Pour between the stores' });
