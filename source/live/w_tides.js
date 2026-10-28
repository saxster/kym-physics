// 14.5 Tides: two bulges from the difference in the Moon's pull, 24 h 50 min lunar day, and the Sun's 0.46 bulge (spring and neap tides).
import { Live } from './core.js';
import { note, label } from './art_waves.js';

Live.register('tides', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 360;
  const k = api.canvas(W, H, 'Earth turning under the Moon and Sun tidal bulges, with a strip chart of water height at Mumbai');

  const MONTH_HOURS = 708; // 29.53 days * 24 h
  const MOON_DEG_PER_DAY = 12.19; // deg/day relative to Sun direction
  const SUN_RATIO = 0.46;         // Sun tidal amplitude / Moon tidal amplitude (from M / d^3)

  let timeHours = 0;   // 0..708 hours
  let includeSun = true;
  let pullView = 0;
  note(stage,'An ideal all-water Earth explains the two-bulge mechanism. Select raw Moon pull or the pull relative to Earth’s centre: every raw arrow points towards the Moon, while the differential arrows stretch both sides. Relative arrows and the water height are magnified independently; the Moon is drawn close. This is not a Mumbai tide prediction.');

  const say = api.readout();

  // Control 1: Time slider over one lunar month (0 to 708 hours)
  const timeSlider = api.slider('Time in lunar month', {
    min: 0, max: MONTH_HOURS, step: 1, value: timeHours,
    fmt: (v) => `Day ${(v / 24).toFixed(1)} (${Math.round(v)} h)`,
    onInput: (v) => {
      timeHours = v;
      drawFrame(0);
    },
  });

  // Control 2: Sun toggle button (adds/removes the Sun's 46% bulges)
  const sunBtn = api.button('Sun’s bulges (46%): on', () => {
    includeSun = !includeSun;
    sunBtn.textContent = includeSun ? 'Sun’s bulges (46%): on' : 'Sun’s bulges (46%): off';
    sunBtn.setAttribute('aria-pressed', String(includeSun));
    drawFrame(0);
  }, { pressed: true });

  api.tabs(['Water response','Moon pull','Pull relative to centre'],i=>{pullView=i;drawFrame(0);});

  function tidalHeightAtAngle(phiRad, moonRad, withSun) {
    // Quadrupole tidal height: cos(2*(phi - moonRad)) + 0.46 * cos(2*phi)
    const moonPart = Math.cos(2 * (phiRad - moonRad));
    const sunPart = withSun ? SUN_RATIO * Math.cos(2 * phiRad) : 0;
    return moonPart + sunPart;
  }

  function drawFrame(dt) {
    if (dt > 0) {
      // Advance 6 hours per second of real time so Earth rotation and daily highs are easy to follow
      timeHours = (timeHours + dt * 6) % MONTH_HOURS;
      timeSlider.set(Math.round(timeHours));
    }

    const ctx = k.ctx;
    k.clear(c.plate);

    const earthRotRad = (timeHours / 24) * Math.PI * 2;
    const moonOrbRad = ((timeHours / 24) * MOON_DEG_PER_DAY * Math.PI) / 180;

    // 1. TOP-LEFT PANEL: Schematic view from above the North Pole (Earth turning inside tidal bulges + orbiting Moon)
    const cx = 185, cy = 122, earthR = 42, moonOrbitR = 96;

    // Parallel sunlight / pull indicator from the right (+x)
    if (includeSun) {
      api.draw.text(ctx, 'to the Sun →', 325, cy - 18, { size: 11, color: c.neutron, align: 'center', weight: 600 });
      api.draw.arrow(ctx, 295, cy, 345, cy, c.neutron, 2, 7);

      // Faint dashed ellipse for the Sun's 46% bulge alone
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = c.neutron;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const r = earthR + 12 + 16 * SUN_RATIO * Math.cos(2 * a);
        const px = cx + r * Math.cos(a), py = cy - r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Combined water bulge envelope around the Earth (Moon 1.0 + Sun 0.46 added at each angle)
    ctx.fillStyle = 'rgba(53, 109, 131, 0.24)';
    ctx.strokeStyle = c.electron;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const hTide = tidalHeightAtAngle(a, moonOrbRad, includeSun);
      const r = earthR + 14 + 13 * hTide;
      const px = cx + r * Math.cos(a), py = cy - r * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Turning Earth globe
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    ctx.fillStyle = c.sheet;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Longitude spokes turning with the Earth
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    for (let kSpoke = 0; kSpoke < 4; kSpoke++) {
      const a = earthRotRad + (kSpoke * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(cx - earthR * Math.cos(a), cy + earthR * Math.sin(a));
      ctx.lineTo(cx + earthR * Math.cos(a), cy - earthR * Math.sin(a));
      ctx.stroke();
    }

    if (pullView) {
      const ux=Math.cos(moonOrbRad),uy=Math.sin(moonOrbRad),D=60;
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4,rx=Math.cos(a),ry=Math.sin(a);
        const dx=D*ux-rx,dy=D*uy-ry,rr=Math.hypot(dx,dy);
        let gx=dx/rr**3,gy=dy/rr**3;
        if(pullView===2){gx-=ux/D**2;gy-=uy/D**2;}
        const gain=pullView===2?22*D**3:22*D**2;
        api.draw.arrow(ctx,cx+earthR*rx,cy-earthR*ry,cx+earthR*rx+gx*gain,cy-earthR*ry-gy*gain,c.proton,2,6);
      }
      label(ctx,c,pullView===1?'Raw pull: all towards Moon':'Relative pull: subtract centre’s pull',185,16,{align:'center',size:12,weight:600});
    }

    // Model-site marker on the Earth's rim at angle earthRotRad
    const mumX = cx + earthR * Math.cos(earthRotRad);
    const mumY = cy - earthR * Math.sin(earthRotRad);
    ctx.beginPath();
    ctx.arc(mumX, mumY, 5, 0, Math.PI * 2);
    ctx.fillStyle = c.proton;
    ctx.fill();
    api.draw.text(ctx, 'Site', mumX + 14 * Math.cos(earthRotRad), mumY - 14 * Math.sin(earthRotRad), {
      size: 10.5, color: c.proton, align: 'center', weight: 700,
    });

    // Orbiting Moon at angle moonOrbRad (advancing 12.19 deg/day)
    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = c.rule;
    ctx.beginPath();
    ctx.arc(cx, cy, moonOrbitR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const mx = cx + moonOrbitR * Math.cos(moonOrbRad);
    const my = cy - moonOrbitR * Math.sin(moonOrbRad);
    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, Math.PI * 2);
    ctx.fillStyle = c.ink;
    ctx.fill();
    api.draw.text(ctx, 'Moon', mx, my - 14, { size: 11, color: c.ink, align: 'center', weight: 600 });

    // Top-right summary card: 48-hour close-up showing two highs a day (12 h 25 min apart)
    const zoomL = 385, zoomR = 618, zoomTop = 28, zoomH = 175, zoomMid = zoomTop + zoomH / 2 + 10;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    api.draw.roundRect(ctx, zoomL, zoomTop, zoomR - zoomL, zoomH, 6);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, 'Ideal site: 48 hours', (zoomL + zoomR) / 2, zoomTop + 18, {
      size: 11, color: c.ink, align: 'center', weight: 700,
    });
    api.draw.text(ctx, 'Two highs per lunar day (about 24 h 50 min)', (zoomL + zoomR) / 2, zoomTop + 34, {
      size: 10, color: c.muted, align: 'center',
    });

    ctx.strokeStyle = c.rule;
    ctx.beginPath();
    ctx.moveTo(zoomL + 10, zoomMid);
    ctx.lineTo(zoomR - 10, zoomMid);
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const dh = (i / 120) * 48 - 24; // -24 h to +24 h around current timeHours
      const tH = timeHours + dh;
      const eA = (tH / 24) * Math.PI * 2;
      const mA = ((tH / 24) * MOON_DEG_PER_DAY * Math.PI) / 180;
      const hVal = tidalHeightAtAngle(eA, mA, includeSun);
      const px = zoomL + 12 + (i / 120) * (zoomR - zoomL - 24);
      const py = zoomMid - (hVal / 1.46) * 52;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = c.electron;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current-time marker in the middle of the 48-hour window
    const hNow = tidalHeightAtAngle(earthRotRad, moonOrbRad, includeSun);
    const nowY = zoomMid - (hNow / 1.46) * 52;
    ctx.beginPath();
    ctx.arc((zoomL + zoomR) / 2, nowY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = c.proton;
    ctx.fill();

    // 2. BOTTOM STRIP CHART: Full 29.5-day lunar month showing the 14.8-day spring-neap envelope and Moon phase icons
    const stripL = 48, stripR = 618, stripTop = 238, stripH = 96, stripMid = stripTop + stripH / 2;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    ctx.fillRect(stripL, stripTop, stripR - stripL, stripH);
    ctx.strokeRect(stripL, stripTop, stripR - stripL, stripH);

    // Phase labels along top of strip chart
    const phases = [
      { day: 0, lbl: 'New (spring)' },
      { day: 7.4, lbl: '1st Q (neap)' },
      { day: 14.8, lbl: 'Full (spring)' },
      { day: 22.1, lbl: '3rd Q (neap)' },
      { day: 29.5, lbl: 'New' },
    ];
    for (const p of phases) {
      const px = stripL + (p.day / 29.5) * (stripR - stripL);
      api.draw.text(ctx, p.lbl, px, stripTop - 6, { size: 10, color: c.muted, align: 'center' });
    }

    // Plot the 29.5-day water height curve at Mumbai
    ctx.beginPath();
    const Npts = 560;
    for (let i = 0; i <= Npts; i++) {
      const hTime = (i / Npts) * MONTH_HOURS;
      const eA = (hTime / 24) * Math.PI * 2;
      const mA = ((hTime / 24) * MOON_DEG_PER_DAY * Math.PI) / 180;
      const hVal = tidalHeightAtAngle(eA, mA, includeSun);
      const px = stripL + (i / Npts) * (stripR - stripL);
      const py = stripMid - (hVal / 1.46) * (stripH * 0.42);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = c.electron;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Current time cursor on the monthly strip chart
    const curStripX = stripL + (timeHours / MONTH_HOURS) * (stripR - stripL);
    ctx.strokeStyle = c.proton;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(curStripX, stripTop);
    ctx.lineTo(curStripX, stripTop + stripH);
    ctx.stroke();

    // Readout
    const relAng = (((earthRotRad - moonOrbRad) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const cos2 = Math.cos(2 * relAng);
    const tideState = cos2 > 0.5
      ? Math.cos(relAng) > 0
        ? 'The model site is under the near bulge: high tide'
        : 'The model site is under the far-side bulge: second daily high tide'
      : cos2 < -0.5
      ? 'The model site is between the bulges: low tide'
      : 'the model tide is turning between high and low';

    const alignCos = Math.cos(2 * moonOrbRad);
    const springNeapText = !includeSun
      ? 'Sun’s bulges turned off: only the Moon’s two bulges are shown.'
      : alignCos > 0.5
      ? 'New or Full Moon alignment: Sun (0.46) and Moon (1.00) bulges add to 1.46, giving a spring tide.'
      : alignCos < -0.5
      ? 'Quarter Moon: the Sun’s bulges sit in the Moon’s troughs (1.00 − 0.46 = 0.54), giving a neap tide.'
      : 'Between spring and neap tide as the Moon’s and Sun’s bulges shift in angle.';

    say(
      `${tideState}. Successive Moon-only highs are about 12 h 25 min apart; tomorrow’s high is about 50 min later (lunar day 24 h 50 min as the Moon advances 12.19°/day). ` +
      `${springNeapText} ` +
      `(The Earth’s two bulges are drawn thousands of times too tall, since the real all-water bulge is under 1 m, and the Moon is drawn close; real tides lag the Moon and vary by coast, so Mumbai’s real times come from published tide tables.)`
    );
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() {} };
}, { label: 'Turn the Earth under the bulges' });
