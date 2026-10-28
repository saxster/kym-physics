// Ch 0.2 c0_eratosthenes -> w_shadow: Eratosthenes' two-stick measurement of the Earth.
// Static widget: the reader varies the distance in stadia, the shadow angle at Alexandria, and the length of a stadion.
import { Live } from './core.js';

const STADIA = [
  { name: 'Olympic (192 m)', m: 192 },
  { name: 'About 1/6 km (166.7 m)', m: 1000 / 6 },
  { name: '160 m', m: 160 },
  { name: 'Unknown', m: null },
];

Live.register('shadow', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 340, 'The Earth as a circle with two upright sticks, parallel sunbeams, and the shadow angle matching the central angle');
  let dist = 5000;
  let angleDeg = 7.2;
  let stIdx = 0;
  const say = api.readout();

  const update = () => {
    const turns = 360 / angleDeg;
    const circStadia = Math.round(turns * dist);
    const fracStr = Math.abs(turns - Math.round(turns)) < 0.05
      ? `1/${Math.round(turns)}`
      : `${angleDeg.toFixed(1)}\u00b0 / 360\u00b0 (1/${turns.toFixed(1)})`;
    const st = STADIA[stIdx];
    let unitStr = '';
    if (st.m === 192) {
      const km = Math.round((circStadia * 192) / 1000);
      const pct = Math.round(((km - 40000) / 40000) * 100);
      unitStr = ` = ${km.toLocaleString('en-GB')} km, ${pct >= 0 ? pct + '% above' : Math.abs(pct) + '% below'} today\u2019s 40,000 km.`;
    } else if (st.m === 160) {
      const km = Math.round((circStadia * 160) / 1000);
      unitStr = km === 40000
        ? ' = 40,000 km exactly.'
        : ` = ${km.toLocaleString('en-GB')} km compared with today\u2019s 40,000 km.`;
    } else if (st.m) {
      const km = Math.round((circStadia * st.m) / 100) / 10;
      const pct = Math.round(((km - 40000) / 40000) * 100);
      unitStr = ` = ${km.toLocaleString('en-GB')} km, ${pct >= 0 ? pct + '% above' : Math.abs(pct) + '% below'} today\u2019s 40,000 km.`;
    } else {
      unitStr = '; somewhere between a few percent and about 20% too large, as the unit was never written down.';
    }
    say(`${fracStr} of a circle \u2192 circumference = ${turns.toFixed(1).replace(/\.0$/, '')} \u00d7 ${dist.toLocaleString('en-GB')} = ${circStadia.toLocaleString('en-GB')} stadia${unitStr} Drawn to scale: this is why Eratosthenes needed a tall column.`);
    drawFrame();
  };

  function drawRay(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = c.neutron;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const mx = (x1 + x2) * 0.5, my = (y1 + y2) * 0.5;
    ctx.beginPath();
    ctx.moveTo(mx - 4, my - 5);
    ctx.lineTo(mx, my + 2);
    ctx.lineTo(mx + 4, my - 5);
    ctx.stroke();
  }

  function drawFrame() {
    k.clear(c.plate);
    const ctx = k.ctx;
    const Cx = 320, Cy = 320, R = 185;
    const ang = (angleDeg * Math.PI) / 180;

    // Earth circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(Cx, Cy, R, 0, Math.PI * 2);
    ctx.fillStyle = c.sheet;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = c.ink;
    ctx.stroke();

    // Syene stick (top of circle, Sun straight overhead)
    const sx = Cx, sy = Cy - R;
    const stickH = 54;
    ctx.lineWidth = 3;
    ctx.strokeStyle = c.ink;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx, sy - stickH);
    ctx.stroke();

    // Alexandria stick at true central angle `ang` counter-clockwise from top
    const ax = Cx - R * Math.sin(ang);
    const ay = Cy - R * Math.cos(ang);
    const tx = ax - stickH * Math.sin(ang);
    const ty = ay - stickH * Math.cos(ang);

    // Parallel vertical sunlight rays from top of canvas
    const rayXs = [70, 140, 210, tx, Cx, 410, 490, 560];
    for (const rx of rayXs) {
      let yHit = 325;
      if (Math.abs(rx - Cx) < R) {
        yHit = Cy - Math.sqrt(Math.max(0, R * R - (rx - Cx) * (rx - Cx)));
      }
      if (rx === tx) yHit = ty;
      if (rx === Cx) yHit = sy - stickH;
      drawRay(ctx, rx, 16, rx, yHit - 2);
    }
    api.draw.text(ctx, 'sunlight: parallel rays', 450, 32, { size: 12, color: c.neutron, align: 'center', weight: 600 });

    // Dashed ray continuation from Alexandria stick tip down to ground (showing shadow edge)
    const shx = tx;
    const shy = Math.abs(shx - Cx) < R
      ? Cy - Math.sqrt(Math.max(0, R * R - (shx - Cx) * (shx - Cx)))
      : ay;
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = c.neutron;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(shx, shy);
    ctx.stroke();
    ctx.restore();

    // Shadow along the surface from (ax, ay) to (shx, shy)
    ctx.strokeStyle = c.proton;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(shx, shy);
    ctx.stroke();

    // Alexandria stick
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Radii to centre (dashed)
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Cx, Cy);
    ctx.lineTo(sx, sy);
    ctx.moveTo(Cx, Cy);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    ctx.restore();

    // Central angle arc at (Cx, Cy)
    const rArc = 58;
    ctx.strokeStyle = c.electron;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(Cx, Cy, rArc, -Math.PI / 2 - ang, -Math.PI / 2);
    ctx.stroke();

    // Shadow angle arc at tip (tx, ty) between downward vertical (PI/2) and stick direction (PI/2 - ang)
    const rTip = 34;
    ctx.beginPath();
    ctx.arc(tx, ty, rTip, Math.PI / 2 - ang, Math.PI / 2);
    ctx.stroke();

    // Distance arc along surface between sticks
    ctx.strokeStyle = c.vol;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(Cx, Cy, R, -Math.PI / 2 - ang, -Math.PI / 2);
    ctx.stroke();

    // Labels
    api.draw.text(ctx, 'Syene: no shadow (Sun overhead)', sx + 12, sy - 24, { size: 13, color: c.ink, weight: 600 });
    api.draw.text(ctx, 'Alexandria', ax - 14, ay + 18, { size: 13, color: c.ink, align: 'right', weight: 600 });
    api.draw.text(ctx, `shadow angle ${angleDeg.toFixed(1)}\u00b0`, tx - 10, ty - 8, { size: 13, color: c.electron, align: 'right', weight: 600 });
    api.draw.text(ctx, 'shadow', shx - 8, (ay + shy) * 0.5 + 4, { size: 12, color: c.proton, align: 'right', weight: 600 });
    api.draw.text(ctx, `${dist.toLocaleString('en-GB')} stadia`, Cx - R * Math.sin(ang * 0.5) - 12, Cy - R * Math.cos(ang * 0.5) + 22, { size: 12, color: c.vol, align: 'right', weight: 600 });
    api.draw.text(ctx, `central angle = ${angleDeg.toFixed(1)}\u00b0 (same angle)`, Cx + 12, Cy - 18, { size: 13, color: c.electron, weight: 600 });
    api.draw.text(ctx, `= 1/${(360 / angleDeg).toFixed(1).replace(/\.0$/, '')} of a full turn`, Cx + 12, Cy - 2, { size: 12, color: c.muted });
    ctx.restore();
  }

  api.slider('Distance between sticks', {
    min: 1000, max: 10000, step: 250, value: dist,
    fmt: (v) => `${v.toLocaleString('en-GB')} stadia`,
    onInput: (v) => { dist = v; update(); },
  });
  api.slider('Shadow angle', {
    min: 1, max: 30, step: 0.2, value: angleDeg,
    fmt: (v) => `${v.toFixed(1)}\u00b0`,
    onInput: (v) => { angleDeg = v; update(); },
  });
  api.tabs(STADIA.map((s) => s.name), (i) => { stIdx = i; update(); }, 0);

  api.loop(() => { drawFrame(); });
  update();
  return { destroy() {} };
}, { label: 'Move the sticks', static: true });
