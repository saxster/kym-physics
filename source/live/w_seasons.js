// 14.2 Tilt and the noon Sun: Earth's orbit, solar declination, noon altitude, ground patch width, day length, and torch on graph paper.
import { Live } from './core.js';
import { note, label } from './art_waves.js';

const LATS = [
  { name: 'Mumbai 19.08° N', short: 'Mumbai', phi: 19.08 },
  { name: 'Equator 0°', short: ' the Equator', phi: 0.0 },
  { name: 'Tropic 23.44° N', short: 'the Tropic of Cancer', phi: 23.44 },
  { name: 'Paris 48.85° N', short: 'Paris', phi: 48.85 },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function dayToDateStr(dayOfYear) {
  let d = Math.max(1, Math.min(365, Math.round(dayOfYear)));
  for (let m = 0; m < 12; m++) {
    if (d <= MONTH_DAYS[m]) return `${d} ${MONTHS[m]}`;
    d -= MONTH_DAYS[m];
  }
  return '31 Dec';
}

Live.register('seasons', (stage, params, api) => {
  const c = api.colors();
  note(stage,'The orbit is a schematic. Earth’s axis keeps its direction through the year. The plan view below compares equal-power beams on a surface: a longer footprint spreads the same energy over more area. Colour density indicates energy per area, not extra rays.');
  const W = 640, H = 330;
  const k = api.canvas(W, H, 'Earth orbit with constant axial tilt on the left, and the noon Sun beam or tilted torch on the right');

  const footprint=api.canvas(640,154,'Plan view of equal power light beams: one square metre upright and a wider footprint at the selected angle');
  let dayOfYear = 172; // 21 June default (shows 85.6° high at Mumbai, leaning 4.4° north)
  let latIdx = 0;      // Mumbai 19.08° N
  let torchMode = false;
  let torchTiltDeg = 60; // 0° to 75° from vertical when in torch mode

  const say = api.readout();

  // Control 1: Date slider (1 to 365) or Torch tilt slider when in torch mode
  const mainSlider = api.slider('Date', {
    min: 1, max: 365, step: 1, value: dayOfYear,
    fmt: (v) => (torchMode ? `${Math.round(((v - 1) / 364) * 75)}° tilt` : dayToDateStr(v)),
    onInput: (v) => {
      if (torchMode) {
        torchTiltDeg = Math.round(((v - 1) / 364) * 75);
      } else {
        dayOfYear = v;
      }
      drawFrame();
    },
  });
  const sliderLabel = mainSlider.input.previousElementSibling;

  // Control 2: Latitude tabs
  api.tabs(LATS.map((l) => l.name), (i) => {
    latIdx = i;
    drawFrame();
  });

  // Control 3: Torch toggle button
  const torchBtn = api.button('Torch on graph paper', () => {
    torchMode = !torchMode;
    torchBtn.setAttribute('aria-pressed', String(torchMode));
    sliderLabel.textContent = torchMode ? 'Torch tilt' : 'Date';
    if (torchMode) {
      mainSlider.set(Math.round((torchTiltDeg / 75) * 364 + 1));
    } else {
      mainSlider.set(dayOfYear);
    }
    drawFrame();
  }, { pressed: false });

  function computeSolar(day, phiDeg) {
    // Standard declination approximation: delta = -23.44° * cos(2pi * (day + 10) / 365)
    // At day 172 (21 June): delta = +23.44°
    const delta = -23.44 * Math.cos((2 * Math.PI * (day + 10)) / 365);
    const zenithDiff = phiDeg - delta; // positive = Sun is south of zenith; negative = Sun is north of zenith
    const altDeg = 90 - Math.abs(zenithDiff);
    const leanDir = Math.abs(zenithDiff) < 0.15 ? 'overhead (zero shadow)' : zenithDiff < 0 ? 'north' : 'south';
    const altRad = (Math.max(1, altDeg) * Math.PI) / 180;
    const patchMetres = 1.0 / Math.sin(altRad);

    // Day length from cos H = -tan(phi) * tan(delta) (geometric) and with -0.833° refraction/solar disc allowance
    const phiRad = (phiDeg * Math.PI) / 180;
    const delRad = (delta * Math.PI) / 180;
    const cosHGeom = Math.max(-1, Math.min(1, -Math.tan(phiRad) * Math.tan(delRad)));
    const dayGeomH = (2 * Math.acos(cosHGeom) * 12) / Math.PI;

    const refRad = (-0.833 * Math.PI) / 180;
    const cosHRef = Math.max(
      -1,
      Math.min(1, (Math.sin(refRad) - Math.sin(phiRad) * Math.sin(delRad)) / (Math.cos(phiRad) * Math.cos(delRad)))
    );
    const dayRefH = (2 * Math.acos(cosHRef) * 12) / Math.PI;

    // Earth-Sun distance: perihelion 147.1 million km around 3 Jan (day 3), aphelion 152.1 million km around 4 Jul
    const distMkm = 149.6 - 2.5 * Math.cos((2 * Math.PI * (day - 3)) / 365);
    return { delta, zenithDiff, altDeg, leanDir, patchMetres, dayGeomH, dayRefH, distMkm };
  }

  function drawOrbitPanel(ctx, sol) {
    const cx = 148, cy = 165, rx = 98, ry = 82;
    api.draw.text(ctx, 'Earth’s orbit (tilt fixed in space)', cx, 24, {
      size: 12, color: c.ink, align: 'center', weight: 700,
    });

    // Orbit ellipse
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Sun at centre
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fillStyle = c.neutron;
    ctx.fill();
    api.draw.text(ctx, 'Sun', cx, cy + 28, { size: 11, color: c.neutron, align: 'center', weight: 600 });

    // Place June (day 172) at left (-pi) so axis leaning right (+x, towards Sun in June) is immediately clear
    const orbAng = Math.PI - ((dayOfYear - 172) / 365) * Math.PI * 2;
    const ex = cx + rx * Math.cos(orbAng);
    const ey = cy + ry * Math.sin(orbAng);

    // Reference solstice/equinox dots
    for (const [lbl, a, dy] of [['Jun', Math.PI, 4], ['Dec', 0, 4], ['Mar', -Math.PI / 2, -10], ['Sep', Math.PI / 2, 16]]) {
      const gx = cx + rx * Math.cos(a), gy = cy + ry * Math.sin(a);
      api.draw.text(ctx, lbl, gx + (a === Math.PI ? -18 : a === 0 ? 18 : 0), gy + dy, {
        size: 10, color: c.muted, align: 'center',
      });
    }

    // Earth globe and fixed 23.44° axis leaning up-right at every date
    ctx.beginPath();
    ctx.arc(ex, ey, 11, 0, Math.PI * 2);
    ctx.fillStyle = c.electron;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    const tiltRad = (23.44 * Math.PI) / 180;
    const axLen = 19;
    ctx.beginPath();
    ctx.moveTo(ex - axLen * Math.sin(tiltRad), ey + axLen * Math.cos(tiltRad));
    ctx.lineTo(ex + axLen * Math.sin(tiltRad), ey - axLen * Math.cos(tiltRad));
    ctx.stroke();
    api.draw.text(ctx, 'N', ex + (axLen + 6) * Math.sin(tiltRad), ey - (axLen + 6) * Math.cos(tiltRad), {
      size: 9.5, color: c.ink, align: 'center', weight: 700,
    });

    // Distance readout at bottom of orbit panel
    api.draw.text(ctx, `${dayToDateStr(dayOfYear)}: ${sol.distMkm.toFixed(1)} million km`, cx, 282, {
      size: 11.5, color: c.ink, align: 'center', weight: 600,
    });
    api.draw.text(ctx, '(147.1 in Jan to 152.1 in Jul: only a 7% light change)', cx, 300, {
      size: 10, color: c.muted, align: 'center',
    });
  }

  function drawNoonSunPanel(ctx, sol, lat) {
    const boxL = 304, boxR = 620, groundY = 258;
    const midX = (boxL + boxR) / 2;

    api.draw.text(ctx, `Noon Sun at ${lat.name} (${dayToDateStr(dayOfYear)})`, midX, 24, {
      size: 12, color: c.ink, align: 'center', weight: 700,
    });

    // Ground line with South on left, North on right
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boxL, groundY);
    ctx.lineTo(boxR, groundY);
    ctx.stroke();
    api.draw.text(ctx, 'South', boxL + 22, groundY + 18, { size: 11, color: c.muted, align: 'center' });
    api.draw.text(ctx, 'North', boxR - 22, groundY + 18, { size: 11, color: c.muted, align: 'center' });

    // Overhead (90°) vertical reference dashed line
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = c.muted;
    ctx.beginPath();
    ctx.moveTo(midX, 46);
    ctx.lineTo(midX, groundY);
    ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, 'zenith (90°)', midX, 42, { size: 10, color: c.muted, align: 'center' });

    // Direction of noon Sun: zenithDiff > 0 means Sun is to the South (left); zenithDiff < 0 means Sun is to the North (right)
    const zenRad = (sol.zenithDiff * Math.PI) / 180;
    const dirX = -Math.sin(zenRad); // left for South, right for North
    const dirY = -Math.cos(zenRad); // upward
    const rayLen = 175;
    const sunX = midX + dirX * rayLen;
    const sunY = groundY + dirY * rayLen;

    // Draw fixed-width 1.00 m beam (half-width 22 px perpendicular to ray)
    const perpX = -dirY, perpY = dirX;
    const beamHalfPx = 22;
    const patchHalfPx = beamHalfPx / Math.max(0.15, Math.cos(zenRad));

    ctx.fillStyle = 'rgba(241, 217, 120, 0.36)';
    ctx.beginPath();
    ctx.moveTo(sunX - perpX * beamHalfPx, sunY - perpY * beamHalfPx);
    ctx.lineTo(sunX + perpX * beamHalfPx, sunY + perpY * beamHalfPx);
    ctx.lineTo(midX + patchHalfPx, groundY);
    ctx.lineTo(midX - patchHalfPx, groundY);
    ctx.closePath();
    ctx.fill();

    // Lit patch highlight on ground
    ctx.strokeStyle = c.proton;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(midX - patchHalfPx, groundY);
    ctx.lineTo(midX + patchHalfPx, groundY);
    ctx.stroke();

    // Central ray and Sun disc
    api.draw.arrow(ctx, sunX, sunY, midX, groundY, c.neutron, 2.2, 8);
    ctx.beginPath();
    ctx.arc(sunX, sunY, 11, 0, Math.PI * 2);
    ctx.fillStyle = c.neutron;
    ctx.fill();

    // Stick at midX casting a noon shadow
    const stickH = 38;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(midX, groundY);
    ctx.lineTo(midX, groundY - stickH);
    ctx.stroke();

    // Labels for altitude, patch width, and day length
    api.draw.text(ctx, `1.00 m beam lights ${sol.patchMetres.toFixed(2)} m of ground`, midX, groundY + 20, {
      size: 11.5, color: c.proton, align: 'center', weight: 700,
    });
    api.draw.text(ctx, `Noon altitude: ${sol.altDeg.toFixed(1)}° (${sol.leanDir === 'overhead (zero shadow)' ? 'overhead' : `leaning ${Math.abs(sol.zenithDiff).toFixed(1)}° ${sol.leanDir}`})`, midX, groundY + 40, {
      size: 11.5, color: c.ink, align: 'center', weight: 600,
    });
    api.draw.text(ctx, `Daylight: ${sol.dayRefH.toFixed(1)} h (${sol.dayGeomH.toFixed(1)} h geometric)`, midX, groundY + 58, {
      size: 11, color: c.muted, align: 'center',
    });

    const distComment = sol.distMkm > 151.5
      ? 'near farthest of the year'
      : sol.distMkm < 147.6
      ? 'near closest of the year'
      : 'orbit nearly circular (only 7% sunlight change all year)';
    say(
      `Noon Sun ${sol.altDeg.toFixed(1)}° high (${sol.leanDir === 'overhead (zero shadow)' ? 'directly overhead, zero shadow' : `leaning ${Math.abs(sol.zenithDiff).toFixed(1)}° ${sol.leanDir}`}). ` +
      `The same 1.00 m beam lights ${sol.patchMetres.toFixed(2)} m of ground. ` +
      `Daylight about ${sol.dayRefH.toFixed(1)} h (${sol.dayGeomH.toFixed(1)} h geometric, before the 0.833° refraction allowance). ` +
      `Earth–Sun distance ${sol.distMkm.toFixed(1)} million km: ${distComment}.`
    );
  }

  function drawTorchPanel(ctx) {
    const boxL = 304, boxR = 620, groundY = 240;
    const midX = (boxL + boxR) / 2;

    api.draw.text(ctx, `Torch on graph paper (tilted ${torchTiltDeg}° from vertical)`, midX, 24, {
      size: 12, color: c.ink, align: 'center', weight: 700,
    });

    // Graph paper strip along groundY
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boxL, groundY);
    ctx.lineTo(boxR, groundY);
    ctx.stroke();

    for (let x = boxL + 12; x <= boxR - 12; x += 14) {
      ctx.strokeStyle = c.rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, groundY + 18);
      ctx.stroke();
    }

    const tiltRad = (torchTiltDeg * Math.PI) / 180;
    const areaFactor = 1 / Math.cos(tiltRad);
    const dirX = -Math.sin(tiltRad), dirY = -Math.cos(tiltRad);
    const perpX = -dirY, perpY = dirX;
    const beamHalfPx = 22;
    const patchHalfPx = Math.min(145, beamHalfPx * areaFactor);
    const tX = midX + dirX * 155, tY = groundY + dirY * 155;

    ctx.fillStyle = 'rgba(241, 217, 120, 0.42)';
    ctx.beginPath();
    ctx.moveTo(tX - perpX * beamHalfPx, tY - perpY * beamHalfPx);
    ctx.lineTo(tX + perpX * beamHalfPx, tY + perpY * beamHalfPx);
    ctx.lineTo(midX + patchHalfPx, groundY);
    ctx.lineTo(midX - patchHalfPx, groundY);
    ctx.closePath();
    ctx.fill();

    // Torch body
    ctx.fillStyle = c.ink;
    ctx.beginPath();
    ctx.arc(tX, tY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = c.proton;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(midX - patchHalfPx, groundY);
    ctx.lineTo(midX + patchHalfPx, groundY);
    ctx.stroke();

    const sharePct = Math.round((1 / areaFactor) * 100);
    api.draw.text(ctx, `Patch covers ${areaFactor.toFixed(2)}× the area (${sharePct}% light per square)`, midX, groundY + 38, {
      size: 12, color: c.proton, align: 'center', weight: 700,
    });

    say(
      `Tilted ${torchTiltDeg}°: the patch covers ${areaFactor.toFixed(1)} times the area (1 / cos ${torchTiltDeg}°), ` +
      `so each graph-paper square gets ${(1 / areaFactor).toFixed(2)} of the straight-down light (${sharePct}%).`
    );
  }

  function drawFrame() {
    const ctx = k.ctx;
    k.clear(c.plate);
    const lat = LATS[latIdx];
    const sol = computeSolar(dayOfYear, lat.phi);

    // Divider line
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(290, 16);
    ctx.lineTo(290, H - 16);
    ctx.stroke();

    const f=footprint.ctx;footprint.clear(c.plate);
    const factor=torchMode?1/Math.cos(torchTiltDeg*Math.PI/180):sol.patchMetres;
    label(f,c,'SAME BEAM · VIEW FROM ABOVE',20,23,{size:12,weight:600});
    for(const [x,ratio,title] of [[48,1,'Vertical beam'],[290,factor,torchMode?`${torchTiltDeg}° tilt`:`Noon at ${lat.short.trim()}`]]){
      const width=Math.min(310,56*ratio);f.fillStyle=c.neutron;f.globalAlpha=1/ratio;f.fillRect(x,46,width,56);f.globalAlpha=1;
      f.strokeStyle=c.ink;f.lineWidth=1.2;f.strokeRect(x,46,width,56);f.strokeStyle=c.rule;
      for(let gx=0;gx<width;gx+=14){f.beginPath();f.moveTo(x+gx,46);f.lineTo(x+gx,102);f.stroke();}
      for(let gy=0;gy<=56;gy+=14){f.beginPath();f.moveTo(x,46+gy);f.lineTo(x+width,46+gy);f.stroke();}
      label(f,c,title,x,121,{size:12});label(f,c,`${ratio.toFixed(2)} m² · ${(100/ratio).toFixed(0)}% per m²`,x,141,{size:12,color:c.muted});
    }
    drawOrbitPanel(ctx, sol);
    if (!torchMode) drawNoonSunPanel(ctx, sol, lat);
    else drawTorchPanel(ctx);
  }

  api.loop(() => {
    drawFrame();
  });

  drawFrame();
  return { destroy() {} };
}, { label: 'Tilt and the noon Sun', static: true });
