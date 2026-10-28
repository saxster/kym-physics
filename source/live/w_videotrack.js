// Ch 1.5 c1_toss_strobe -> w_videotrack: Strobe video tracker for a one-metre vertical toss.
// Has a Demo tab (playing the computed 1 m toss, V0 = 4.43 m/s, 10 cm tiles) and a Your clip tab using api.video().
import { Live } from './core.js';

const DEMO_HEIGHTS = [0, 39.4, 68.9, 88.7, 98.7, 98.9, 89.2, 69.8, 40.6, 1.5]; // cm at 0.1 s steps

Live.register('videotrack', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 320, 'Strobe positions of a tossed ball beside its height-time graph and table of gaps');
  let mode = 0; // 0 = Demo (1 m toss), 1 = Your clip (video)
  let sampleIdx = 0; // 0 = 0.1 s, 1 = 0.05 s, 2 = every frame
  const sampleIntervals = [0.1, 0.05, 0]; // 0 means 1 frame
  let tileCm = 10;
  let demoStep = api.reduced ? 10 : 6; // start with 6 marks visible so reader immediately sees the parabola & g fit
  let animAcc = 0;

  // Video marks and scale calibration
  let scalePts = []; // up to 2 points [{x, y}] in video pixels for 1 tile
  let settingScale = false;
  const say = api.readout();

  // Control 1: Demo vs Your clip + api.video()
  const vid = api.video({
    label: 'Choose a video',
    fps: 240,
    fpsChoices: [30, 60, 120, 240],
    onLoad: () => {
      mode = 1;
      scalePts = [];
      updateReadout();
    },
  });

  // Override step buttons inside live-vbar so they step by the chosen sample interval
  const vbars = stage.parentElement?.querySelectorAll('.live-vbar button') || [];
  if (vbars.length >= 2) {
    const getFrames = () => {
      const dt = sampleIntervals[sampleIdx];
      if (!dt) return 1;
      return Math.max(1, Math.round(dt * vid.fps));
    };
    vbars[0].onclick = (e) => { e.stopPropagation(); vid.step(-getFrames()); };
    vbars[1].onclick = (e) => { e.stopPropagation(); vid.step(getFrames()); };
  }

  vid.onMark((m, all) => {
    mode = 1;
    if (settingScale && m) {
      scalePts.push({ x: m.x, y: m.y });
      vid.undo(); // don't keep calibration tap as a ball mark
      if (scalePts.length >= 2) {
        settingScale = false;
      }
      updateReadout();
      return;
    }
    // Step extra frames if sample interval > 1 frame (api.video already stepped 1 frame)
    const dt = sampleIntervals[sampleIdx];
    const frames = dt ? Math.max(1, Math.round(dt * vid.fps)) : 1;
    if (frames > 1 && m) vid.step(frames - 1);
    updateReadout();
  });

  // Control 2: Mark every ... (0.1 s, 0.05 s, every frame)
  api.tabs(['Demo (1 m toss)', 'Mark every 0.1 s', 'Mark every 0.05 s', 'Every frame'], (i) => {
    if (i === 0) {
      mode = 0;
      demoStep = 1;
      animAcc = 0;
    } else {
      sampleIdx = i - 1;
      if (vid.video && vid.video.duration) mode = 1;
    }
    updateReadout();
  }, 0);

  // Control 3: Scale tile size in cm (or tap two tile marks in video mode)
  api.slider('Tile scale', {
    min: 5, max: 30, step: 1, value: tileCm,
    fmt: (v) => `${v} cm`,
    onInput: (v) => { tileCm = v; updateReadout(); },
  });

  function getActivePoints() {
    if (mode === 0 || !vid.marks().length) {
      const n = Math.max(1, Math.min(DEMO_HEIGHTS.length, demoStep));
      const scaleFactor = tileCm / 10;
      return DEMO_HEIGHTS.slice(0, n).map((h, i) => ({
        t: +(i * 0.1).toFixed(2),
        hCm: +(h * scaleFactor).toFixed(1),
        unit: 'cm',
      }));
    }
    const raw = vid.marks();
    const y0 = raw[0].y;
    let pxPerTile = 50;
    let calibrated = false;
    if (scalePts.length >= 2) {
      const d = Math.hypot(scalePts[1].x - scalePts[0].x, scalePts[1].y - scalePts[0].y);
      if (d > 2) { pxPerTile = d; calibrated = true; }
    }
    return raw.map((m) => {
      const tiles = (y0 - m.y) / pxPerTile;
      return {
        t: m.t,
        hCm: calibrated ? +(tiles * tileCm).toFixed(1) : +tiles.toFixed(2),
        unit: calibrated ? 'cm' : 'tiles',
      };
    });
  }

  function updateReadout() {
    const pts = getActivePoints();
    const unit = pts[0]?.unit || 'cm';
    const dtNominal = mode === 0 ? 0.1 : (sampleIntervals[sampleIdx] || (1 / vid.fps));

    if (sampleIdx === 2) {
      say(`Every frame at ${vid.fps} fps (${(1000 / vid.fps).toFixed(1)} ms step): at 240 fps the gap changes by g/f\u00b2 = 0.17 mm per frame, below what a phone camera resolves against a tile. Use 0.1 s or 0.05 s steps to measure g cleanly. Your clip stays on this device.`);
      return;
    }

    const gaps = [];
    for (let i = 0; i < pts.length - 1; i++) {
      gaps.push(+(pts[i + 1].hCm - pts[i].hCm).toFixed(1));
    }

    let msg = '';
    if (gaps.length > 0) {
      const gapList = gaps.map((g) => (g >= 0 ? `+${Math.round(g)}` : `\u2212${Math.abs(Math.round(g))}`)).join(', ');
      msg = `Gaps so far (${ dtNominal.toFixed(2).replace(/0$/, '') } s steps at ${vid.fps} fps): ${gapList} ${unit}. Each gap is about ${(9.8 * dtNominal * dtNominal * 100 * (tileCm / 10)).toFixed(1)} ${unit} shorter than the one before: that shrinking is the acceleration.`;
    } else {
      msg = `Tap Play or step through frames to mark the ball every ${dtNominal} s. Your clip never leaves this device.`;
    }

    if (mode === 0 && pts.length >= 6) {
      msg += ' Between 0.4 s and 0.5 s the ball moved 0.2 cm, yet the gaps kept shrinking at the same rate: zero velocity, full acceleration.';
    }

    if (pts.length >= 6 && unit === 'cm') {
      const d2 = [];
      for (let i = 0; i < gaps.length - 1; i++) {
        const dt = Math.max(0.01, (pts[i + 2].t - pts[i].t) * 0.5);
        const gEst = -((gaps[i + 1] - gaps[i]) / 100) / (dt * dt);
        d2.push(gEst);
      }
      const meanG = d2.reduce((a, b) => a + b, 0) / d2.length;
      const spread = Math.max(...d2.map((v) => Math.abs(v - meanG)));
      msg += ` Estimate from \u0394gap \u00f7 \u0394t\u00b2: g \u2248 ${meanG.toFixed(1)} \u00b1 ${spread.toFixed(1)} m/s\u00b2 (the textbook value is 9.8 m/s\u00b2; yours will be a little lower if the ball is light and the air slows it).`;
    }
    say(msg);
  }

  api.loop((dt) => {
    if (dt > 0 && mode === 0) {
      animAcc += dt;
      if (animAcc >= 0.45) {
        animAcc = 0;
        demoStep = demoStep < DEMO_HEIGHTS.length ? demoStep + 1 : 1;
        updateReadout();
      }
    }

    k.clear(c.plate);
    const ctx = k.ctx;
    const pts = getActivePoints();
    const unit = pts[0]?.unit || 'cm';
    const maxH = Math.max(100, tileCm * 10);

    // ---- Left panel: tiled wall & strobe positions (x: 30..250)
    const wallL = 55, wallR = 225, base = 280, topY = 40;
    const pxPerCm = (base - topY) / maxH;

    // 10-tile grid
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    for (let ti = 0; ti <= 10; ti++) {
      const hVal = ti * tileCm;
      const y = base - hVal * pxPerCm;
      ctx.beginPath(); ctx.moveTo(wallL, y); ctx.lineTo(wallR, y); ctx.stroke();
      if (ti % 5 === 0) {
        api.draw.text(ctx, `${hVal} ${unit}`, wallL - 6, y + 4, { size: 11, color: c.muted, align: 'right' });
      }
    }
    api.draw.text(ctx, `tiles ${tileCm} cm apart`, (wallL + wallR) / 2, 24, { size: 12, color: c.muted, align: 'center', weight: 600 });

    const xu = 105, xd = 175;
    pts.forEach((p, i) => {
      const goingUp = i < 5;
      const x = goingUp ? xu : xd;
      const y = base - p.hCm * pxPerCm;
      ctx.beginPath();
      ctx.arc(x, y, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = i === pts.length - 1 ? c.proton : c.vol;
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = c.ink;
      ctx.stroke();
      api.draw.text(ctx, `${p.t.toFixed(1)}s`, goingUp ? x - 11 : x + 11, y + 4, {
        size: 10.5, color: c.ink, align: goingUp ? 'right' : 'left',
      });
    });
    api.draw.text(ctx, 'up', xu, 302, { size: 12, color: c.ink, align: 'center', weight: 600 });
    api.draw.text(ctx, 'down', xd, 302, { size: 12, color: c.ink, align: 'center', weight: 600 });

    // ---- Middle panel: Height-time graph (x: 275..495)
    const gx0 = 280, gy0 = 280, gw = 205, gh = 220;
    const tMax = Math.max(0.95, pts[pts.length - 1]?.t || 0.9);
    const pxT = gw / tMax;
    const pyH = gh / maxH;

    api.draw.arrow(ctx, gx0, gy0, gx0 + gw + 8, gy0, c.ink, 1.5, 6);
    api.draw.arrow(ctx, gx0, gy0, gx0, gy0 - gh - 8, c.ink, 1.5, 6);
    api.draw.text(ctx, 'time (s)', gx0 + gw, gy0 + 22, { size: 12, color: c.muted, align: 'right' });
    api.draw.text(ctx, `height (${unit})`, gx0 + 8, gy0 - gh + 4, { size: 12, color: c.muted, weight: 600 });

    for (const tv of [0.2, 0.4, 0.6, 0.8]) {
      if (tv <= tMax) {
        const tx = gx0 + tv * pxT;
        ctx.beginPath(); ctx.moveTo(tx, gy0 - 3); ctx.lineTo(tx, gy0 + 3); ctx.strokeStyle = c.ink; ctx.stroke();
        api.draw.text(ctx, tv.toFixed(1), tx, gy0 + 15, { size: 10.5, color: c.muted, align: 'center' });
      }
    }

    if (pts.length > 1) {
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach((p, idx) => {
        const x = gx0 + p.t * pxT, y = gy0 - p.hCm * pyH;
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    pts.forEach((p) => {
      const x = gx0 + p.t * pxT, y = gy0 - p.hCm * pyH;
      ctx.beginPath(); ctx.arc(x, y, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = c.electron; ctx.fill();
    });

    // ---- Right panel: Table of gaps (x: 510..630)
    const tx0 = 515;
    api.draw.text(ctx, 'Step', tx0, 42, { size: 11.5, color: c.muted, weight: 600 });
    api.draw.text(ctx, `Gap (${unit})`, tx0 + 110, 42, { size: 11.5, color: c.muted, align: 'right', weight: 600 });
    ctx.strokeStyle = c.rule;
    ctx.beginPath(); ctx.moveTo(tx0, 48); ctx.lineTo(tx0 + 112, 48); ctx.stroke();

    for (let i = 0; i < Math.min(9, pts.length - 1); i++) {
      const gap = pts[i + 1].hCm - pts[i].hCm;
      const rowY = 66 + i * 24;
      const label = `${pts[i].t.toFixed(1)}\u2013${pts[i + 1].t.toFixed(1)}s`;
      const gStr = gap >= 0 ? `+${gap.toFixed(1)}` : `\u2212${Math.abs(gap).toFixed(1)}`;
      api.draw.text(ctx, label, tx0, rowY, { size: 11, color: c.ink });
      api.draw.text(ctx, gStr, tx0 + 110, rowY, { size: 11.5, color: c.electron, align: 'right', weight: 600 });
    }
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Track a toss' });
