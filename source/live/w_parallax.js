// 15.5 Stellar parallax: p = 1/d (arcseconds and parsecs), 1 AU vs 2 AU baseline, ₹1-coin angle comparison, and telescope view.
import { Live } from './core.js';
import { note } from './art_waves.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

Live.register('parallax', (stage, params, api) => {
  const c = api.colors();
  note(stage,'The same month selects Earth’s position and the telescope’s moving star. The telescope circle applies near an orbital pole; other stars trace ellipses. Parallax p is the half-shift; January to July spans 2p. Background stars are held fixed.');
  const W = 640, H = 330;
  const k = api.canvas(W, H, 'Stellar parallax geometry from above the Earth orbit and the star loop seen through a telescope');

  // Slider s in [0, 100] maps logarithmically to d in [1.0, 100.0] parsecs
  // Default d = 1.30 pc (Proxima Centauri) -> s = 50 * log10(1.3) = 5.7
  let distSliderVal = 5.7;
  let monthFloat = 0; // 0..12 (0 = January, 6 = July)
  let viewTab = 0;    // 0 = From above the orbit, 1 = Through the telescope

  // Fixed background stars for the telescope view
  const r = api.rng(42);
  const bgStars = Array.from({ length: 38 }, () => ({
    x: 40 + r() * (W - 80),
    y: 36 + r() * (H - 72),
    rad: 1.2 + r() * 1.6,
  }));

  function distPc() {
    return Math.pow(10, distSliderVal / 50);
  }

  const say = api.readout();

  // Control 1: Distance slider (1.0 to 100 pc, log scale, default 1.3 pc)
  api.slider('Star distance', {
    min: 0, max: 100, step: 0.5, value: distSliderVal,
    fmt: (v) => {
      const d = Math.pow(10, v / 50);
      return d < 10 ? `${d.toFixed(1)} pc` : `${Math.round(d)} pc`;
    },
    onInput: (v) => {
      distSliderVal = v;
      drawFrame(0);
    },
  });

  // Control 2: Month slider (January to December)
  const mSlider = api.slider('Month', {
    min: 0, max: 11.9, step: 0.1, value: monthFloat,
    fmt: (v) => MONTHS[Math.floor(v) % 12],
    onInput: (v) => {
      monthFloat = v;
      drawFrame(0);
    },
  });

  // Control 3: View tabs ("From above the orbit" / "Through the telescope")
  api.tabs(['From above the orbit', 'Through the telescope'], (i) => {
    viewTab = i;
    drawFrame(0);
  });

  function updateReadout() {
    const d = distPc();
    const ly = d * 3.26156;
    const pArcsec = 1 / d;
    // 22 mm ₹1 coin at distance 0.022 * 206,265 / p metres
    const coinKm = (0.022 * 206265) / pArcsec / 1000;
    const dStr = d < 10 ? d.toFixed(1) : Math.round(d).toString();
    const pStr = pArcsec >= 0.1 ? pArcsec.toFixed(2) : pArcsec.toFixed(3);
    const fullStr = (2 * pArcsec) >= 0.2 ? (2 * pArcsec).toFixed(2) : (2 * pArcsec).toFixed(3);

    let msg =
      `Distance ${dStr} pc (${ly.toFixed(1)} light-years). Parallax p = 1/d = ${pStr} arcseconds (half-shift over 1 AU): ` +
      `a 22 mm ₹1 coin seen from about ${Math.round(coinKm)} km. Over six months (the full 2 AU orbit width) the star shifts by twice that (${fullStr}″).`;
    if (d >= 75) {
      msg += ' With errors of 0.001″ this is where ground-based parallax stops being good to 10%.';
    }
    msg +=
      ' (In the view from above the orbit, the angle is drawn thousands of times too large to be visible; in the telescope view the yearly loop is drawn to scale against the 1.0″ scale bar, shown as a circle for a star near the pole of the orbit.)';
    say(msg);
  }

  function drawAboveOrbit(ctx, d, pArcsec) {
    const sunX = 110, sunY = H / 2, orbR = 66; // 66 px = 1 AU
    const bgX = 590;

    // Distant background stars screen on the right
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bgX, 24);
    ctx.lineTo(bgX, H - 24);
    ctx.stroke();
    for (let y = 38; y <= H - 38; y += 28) {
      ctx.fillStyle = c.muted;
      ctx.beginPath();
      ctx.arc(bgX + 8, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    api.draw.text(ctx, 'far background stars', bgX - 6, 20, { size: 11, color: c.muted, align: 'right' });

    // Centre dashed axis from Sun to background
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = c.rule;
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(bgX, sunY);
    ctx.stroke();
    ctx.restore();

    // Earth's 1 AU orbit circle
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sunX, sunY, orbR, 0, Math.PI * 2);
    ctx.stroke();

    // 1 AU baseline bracket
    api.draw.text(ctx, '1 AU', sunX - 24, sunY - orbR / 2, { size: 11, color: c.ink, align: 'right', weight: 600 });
    ctx.beginPath();
    ctx.moveTo(sunX - 14, sunY);
    ctx.lineTo(sunX - 14, sunY - orbR);
    ctx.stroke();

    // Sun
    ctx.beginPath();
    ctx.arc(sunX, sunY, 10, 0, Math.PI * 2);
    ctx.fillStyle = c.neutron;
    ctx.fill();
    api.draw.text(ctx, 'Sun', sunX + 16, sunY + 4, { size: 11, color: c.neutron, weight: 600 });

    // Nearby star position along the axis: moves from x = 250 (1 pc) to x = 490 (100 pc)
    const starX = 250 + (distSliderVal / 100) * 240;
    const starY = sunY;

    // Extreme January (top, y = sunY - orbR) and July (bottom, y = sunY + orbR) faint sightlines
    for (const sign of [-1, 1]) {
      const ey0 = sunY + sign * orbR;
      const slope = (starY - ey0) / (starX - sunX);
      const hitY = starY + slope * (bgX - starX);
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = c.muted;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(sunX, ey0);
      ctx.lineTo(bgX, hitY);
      ctx.stroke();
      ctx.restore();
    }

    // Current month Earth position
    const ang = (monthFloat / 12) * Math.PI * 2 - Math.PI / 2; // Jan at top (-pi/2), Jul at bottom (+pi/2)
    const ex = sunX + orbR * Math.cos(ang);
    const ey = sunY + orbR * Math.sin(ang);

    // Current sightline from Earth through nearby star to the background screen
    const slopeNow = (starY - ey) / (starX - ex);
    const bgHitY = starY + slopeNow * (bgX - starX);
    ctx.strokeStyle = c.proton;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(bgX, bgHitY);
    ctx.stroke();

    // Apparent position dot on the background screen
    ctx.beginPath();
    ctx.arc(bgX, bgHitY, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = c.proton;
    ctx.fill();
    api.draw.text(ctx, `apparent position (${MONTHS[Math.floor(monthFloat) % 12].slice(0, 3)})`, bgX - 10, bgHitY - 8, {
      size: 11, color: c.proton, align: 'right', weight: 600,
    });

    // Earth dot
    ctx.beginPath();
    ctx.arc(ex, ey, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = c.electron;
    ctx.fill();
    api.draw.text(ctx, `Earth (${MONTHS[Math.floor(monthFloat) % 12].slice(0, 3)})`, ex, ey + (ey < sunY ? -12 : 18), {
      size: 11, color: c.electron, align: 'center', weight: 600,
    });

    // Nearby star
    ctx.beginPath();
    ctx.arc(starX, starY, 6, 0, Math.PI * 2);
    ctx.fillStyle = c.proton;
    ctx.fill();
    const pStr = pArcsec >= 0.1 ? pArcsec.toFixed(2) : pArcsec.toFixed(3);
    api.draw.text(ctx, `Near star (${d < 10 ? d.toFixed(1) : Math.round(d)} pc)`, starX, starY - 26, {
      size: 11.5, color: c.ink, align: 'center', weight: 700,
    });
    api.draw.text(ctx, `parallax p = ${pStr}″ (angle exaggerated)`, starX, starY - 11, {
      size: 10.5, color: c.proton, align: 'center',
    });
  }

  function drawTelescopeView(ctx, d, pArcsec) {
    // Dark telescope field of view
    ctx.fillStyle = '#131b19';
    api.draw.roundRect(ctx, 20, 14, W - 40, H - 28, 10);
    ctx.fill();
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Scale: 1.0 arcsecond = 110 px!
    const pxPerArcsec = 110;
    const cx = W / 2, cy = H / 2;

    // Fixed background stars
    ctx.fillStyle = '#cfccbf';
    for (const s of bgStars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Printed 1.0 arcsecond scale bar at bottom left (110 px = 1.0")
    const sbX = 48, sbY = H - 36;
    ctx.strokeStyle = '#fbfaf5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sbX, sbY);
    ctx.lineTo(sbX + pxPerArcsec, sbY);
    ctx.moveTo(sbX, sbY - 5);
    ctx.lineTo(sbX, sbY + 5);
    ctx.moveTo(sbX + pxPerArcsec, sbY - 5);
    ctx.lineTo(sbX + pxPerArcsec, sbY + 5);
    ctx.stroke();
    api.draw.text(ctx, '1.0 arcsecond (1.0″) scale bar', sbX + pxPerArcsec / 2, sbY - 10, {
      size: 11, color: '#fbfaf5', align: 'center', weight: 600,
    });

    // Yearly parallax loop of radius pArcsec * pxPerArcsec (full width = 2 * pArcsec)
    const loopR = pArcsec * pxPerArcsec;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#78b3cb';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, loopR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Dimension line showing full 6-month shift = 2p
    if (loopR > 6) {
      ctx.strokeStyle = '#9eaaa4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - loopR, cy + loopR + 18);
      ctx.lineTo(cx + loopR, cy + loopR + 18);
      for(const xx of [cx-loopR,cx+loopR]){ctx.moveTo(xx,cy+loopR+13);ctx.lineTo(xx,cy+loopR+23);}ctx.stroke();
      api.draw.text(ctx, `6-month shift 2p = ${(2 * pArcsec).toFixed(2)}″`, cx, cy + loopR + 34, {
        size: 11, color: '#e6e3d6', align: 'center',
      });
    }

    // Half-shift has its own bracket, anchored at the loop centre.
    ctx.strokeStyle='#d9c792';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,cy-15);ctx.lineTo(cx+loopR,cy-15);
    for(const xx of [cx,cx+loopR]){ctx.moveTo(xx,cy-20);ctx.lineTo(xx,cy-10);}ctx.stroke();
    api.draw.text(ctx,`p = ${pArcsec.toFixed(3)}″`,cx+Math.max(30,loopR/2),cy-26,{size:12,color:'#d9c792',align:'center'});
    for(const [dx,name] of [[-loopR,'Jan'],[loopR,'Jul']]){ctx.beginPath();ctx.arc(cx+dx,cy,4,0,2*Math.PI);ctx.strokeStyle='#fbfaf5';ctx.stroke();if(loopR>20)api.draw.text(ctx,name,cx+dx,cy+20,{size:11,color:'#fbfaf5',align:'center'});}

    // Current position of the nearby star along its yearly loop
    const ang = (monthFloat / 12) * Math.PI * 2;
    const sx = cx - loopR * Math.cos(ang);
    const sy = cy - loopR * Math.sin(ang);

    ctx.beginPath();
    ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e0896f';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    api.draw.text(ctx, `Nearby star in ${MONTHS[Math.floor(monthFloat) % 12]} (p = ${pArcsec >= 0.1 ? pArcsec.toFixed(2) : pArcsec.toFixed(3)}″)`, cx, 38, {
      size: 12, color: '#fbfaf5', align: 'center', weight: 700,
    });
  }

  function drawFrame(dt) {
    if (dt > 0) {
      monthFloat = (monthFloat + dt * 1.5) % 12;
      mSlider.set(+monthFloat.toFixed(1));
    }
    const ctx = k.ctx;
    k.clear(c.plate);
    const d = distPc();
    const pArcsec = 1 / d;

    if (viewTab === 0) drawAboveOrbit(ctx, d, pArcsec);
    else drawTelescopeView(ctx, d, pArcsec);

    updateReadout();
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() {} };
}, { label: 'Shift the star' });
