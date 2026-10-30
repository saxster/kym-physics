// Ch 1.2 c1_graph_walk -> w_graphwalk: Position-time graph of a corridor walk.
// Teaches that horizontal axis is time, velocity is slope, a flat line is zero velocity, and a downward slope is walking back.
import { Live } from './core.js';
import { mechanismKey,person } from './art_mechanics.js';

function presetPos(t) {
  if (t <= 0) return 0;
  if (t <= 3) return 2 * t;
  if (t <= 6) return 6;
  if (t <= 9) return 6 - (t - 6);
  return 3;
}

function friendPos(t) {
  const tt = Math.max(0, Math.min(12, t));
  return 8 - 0.5 * tt;
}

Live.register('graphwalk', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 320, 'A corridor walk above a position-time graph');
  let mode = 0; // 0 = Replay Figure 1.2, 1 = Walk it yourself
  let userPos = 0;
  let simT = api.reduced ? 12 : 0;
  let running = !api.reduced;
  let finished = api.reduced;
  const trace = []; // [{t, x}] for Walk it yourself
  const say = api.readout();
  mechanismKey(stage, "One person, two representations", ["The walker\u2019s horizontal position and the highlighted graph point describe the same event.", "The vertical guide gives time; the horizontal guide gives corridor position. A flat trace means standing still."]);

  function seedPresetTrace(upTo) {
    trace.length = 0;
    const steps = Math.max(1, Math.round(upTo / 0.05));
    for (let i = 0; i <= steps; i++) {
      const tt = Math.min(upTo, (i / steps) * upTo);
      trace.push({ t: tt, x: presetPos(tt) });
    }
  }
  seedPresetTrace(simT);

  const posSlider = api.slider('Corridor position', {
    min: 0, max: 8, step: 0.1, value: 0,
    fmt: (v) => `${v.toFixed(1)} m`,
    onInput: (v) => {
      userPos = v;
      if (mode === 0) {
        // Switching to manual walk if the reader moves the position slider
        tabs[0].setAttribute('aria-pressed', 'false');
        tabs[1].setAttribute('aria-pressed', 'true');
        mode = 1;
        resetRun(true);
      }
      updateReadout();
    },
  });

  const tabs = api.tabs(['Replay Figure 1.2', 'Walk it yourself'], (i) => {
    mode = i;
    if (mode === 0) {
      simT = api.reduced ? 12 : 0;
      running = !api.reduced;
      finished = api.reduced;
      seedPresetTrace(simT);
    } else {
      resetRun(true);
    }
    syncBtn();
    updateReadout();
  }, 0);

  const startStopBtn = api.button(running ? 'Stop' : 'Start', () => {
    if (running) {
      running = false;
      finished = true;
    } else if (finished || simT > 0) {
      // Second press clears it, or restarts if already cleared
      if (simT > 0) {
        simT = 0;
        trace.length = 0;
        if (mode === 1) trace.push({ t: 0, x: userPos });
        else trace.push({ t: 0, x: 0 });
        finished = false;
        running = false;
      } else {
        running = true;
        finished = false;
      }
    } else {
      running = true;
      finished = false;
    }
    syncBtn();
    updateReadout();
  });

  function syncBtn() {
    if (running) startStopBtn.textContent = 'Stop';
    else if (simT > 0) startStopBtn.textContent = 'Clear / Reset';
    else startStopBtn.textContent = 'Start';
  }

  function resetRun(autoStart) {
    simT = 0;
    trace.length = 0;
    trace.push({ t: 0, x: mode === 0 ? 0 : userPos });
    running = !!autoStart;
    finished = false;
    syncBtn();
  }

  function getVelocity() {
    if (mode === 0) {
      if (simT < 0.05) return 2.0;
      const t0 = Math.max(0, simT - 0.5);
      const dt = simT - t0;
      return dt > 1e-4 ? (presetPos(simT) - presetPos(t0)) / dt : 0;
    }
    if (trace.length < 2) return 0;
    const last = trace[trace.length - 1];
    let prev = trace[0];
    for (let i = trace.length - 1; i >= 0; i--) {
      if (last.t - trace[i].t >= 0.5) {
        prev = trace[i];
        break;
      }
    }
    const dt = last.t - prev.t;
    return dt > 0.05 ? (last.x - prev.x) / dt : 0;
  }

  function updateReadout() {
    const curX = mode === 0 ? presetPos(simT) : userPos;
    const vRaw = getVelocity();
    const vRound = Math.round(vRaw * 10) / 10;
    const vSign = vRound < 0 ? `\u2212${Math.abs(vRound).toFixed(1)}` : vRound.toFixed(1);

    let desc = '';
    if (Math.abs(vRound) < 0.05) {
      desc = 'the line is flat, you are standing still.';
    } else if (vRound > 0) {
      desc = 'the line slopes up, you are walking forward.';
    } else {
      desc = 'the line slopes down, you are walking back.';
    }

    let crossing = '';
    if (mode === 0) {
      if (Math.abs(simT - 4) < 0.35) {
        crossing = ' At 4 s: same place as your friend (6.0 m), different speeds (0 and 0.5 m/s).';
      } else if (Math.abs(simT - 8) < 0.35) {
        crossing = ' At 8 s: same place again (4.0 m), 1.0 and 0.5 m/s.';
      }
    }
    say(`t = ${simT.toFixed(1)} s (real time), position ${curX.toFixed(1)} m, velocity ${vSign} m/s: ${desc}${crossing}`);
  }

  api.loop((dt) => {
    if (dt > 0 && running) {
      simT = Math.min(12, simT + dt);
      const curX = mode === 0 ? presetPos(simT) : userPos;
      if (mode === 0) posSlider.set(curX.toFixed(1));
      trace.push({ t: simT, x: curX });
      if (simT >= 12) {
        running = false;
        finished = true;
        syncBtn();
      }
      updateReadout();
    }

    k.clear(c.plate);
    const ctx = k.ctx;

    // ---- Top corridor (1D path)
    const corX0 = 70, corW = 520, corY = 48;
    const pxPerM = corW / 8;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(corX0, corY);
    ctx.lineTo(corX0 + corW, corY);
    ctx.stroke();

    for (let m = 0; m <= 8; m += 2) {
      const mx = corX0 + m * pxPerM;
      ctx.beginPath();
      ctx.moveTo(mx, corY - 5);
      ctx.lineTo(mx, corY + 5);
      ctx.stroke();
      api.draw.text(ctx, `${m} m`, mx, corY + 18, { size: 11, color: c.muted, align: 'center' });
    }
    api.draw.text(ctx, 'corridor (1D path)', corX0, 22, { size: 12, color: c.muted, weight: 600 });

    // Friend on corridor (in Replay mode)
    if (mode === 0) {
      const fx = corX0 + friendPos(simT) * pxPerM;
      person(ctx, fx, corY, 31, c.muted);
      api.draw.text(ctx, 'friend', fx, corY - 36, { size: 11, color: c.muted, align: 'center' });
    }

    // Fixed-height people establish the corridor's physical scene.
    const curX = mode === 0 ? presetPos(simT) : userPos;
    const wx = corX0 + curX * pxPerM;
    person(ctx,wx,corY,31,c.electron);
    api.draw.text(ctx,'you',wx,corY-36,{size:12,color:c.electron,align:'center',weight:600});

    // ---- Position-time graph below
    const gx0 = 70, gy0 = 278, gw = 520, gh = 176;
    const px = gw / 12; // px per s
    const py = gh / 8;  // px per m

    // Grid & axes
    ctx.strokeStyle = c.grid || c.rule;
    ctx.lineWidth = 0.8;
    for (let s = 2; s <= 12; s += 2) {
      const x = gx0 + s * px;
      ctx.beginPath(); ctx.moveTo(x, gy0); ctx.lineTo(x, gy0 - gh); ctx.stroke();
    }
    for (let m = 2; m <= 8; m += 2) {
      const y = gy0 - m * py;
      ctx.beginPath(); ctx.moveTo(gx0, y); ctx.lineTo(gx0 + gw, y); ctx.stroke();
    }

    api.draw.arrow(ctx, gx0, gy0, gx0 + gw + 10, gy0, c.ink, 1.6, 7);
    api.draw.arrow(ctx, gx0, gy0, gx0, gy0 - gh - 10, c.ink, 1.6, 7);
    for (let s = 2; s <= 12; s += 2) {
      const x = gx0 + s * px;
      api.draw.text(ctx, String(s), x, gy0 + 16, { size: 12, color: c.muted, align: 'center' });
    }
    for (let m = 2; m <= 8; m += 2) {
      const y = gy0 - m * py;
      api.draw.text(ctx, String(m), gx0 - 10, y + 4, { size: 12, color: c.muted, align: 'right' });
    }
    api.draw.text(ctx, 'time (s)', gx0 + gw, gy0 + 34, { size: 13, color: c.muted, align: 'right', weight: 600 });
    api.draw.text(ctx, 'position (m)', gx0 + 10, gy0 - gh + 2, { size: 13, color: c.muted, weight: 600 });

    // Friend's dashed line in Replay mode (or faint reference in Walk mode)
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(gx0, gy0 - 8 * py);
    const friendEndT = mode === 0 ? simT : 12;
    ctx.lineTo(gx0 + friendEndT * px, gy0 - friendPos(friendEndT) * py);
    ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, 'friend (0.5 m/s back)', gx0 + 12 * px - 4, gy0 - 2 * py - 8, { size: 11, color: c.muted, align: 'right' });

    // Faint ghost of preset in Walk-it-yourself mode for comparison
    if (mode === 1) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const [pt, pd] of [[0, 0], [3, 6], [6, 6], [9, 3], [12, 3]]) {
        const x = gx0 + pt * px, y = gy0 - pd * py;
        if (pt === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Active trace line
    if (trace.length > 0) {
      ctx.strokeStyle = c.electron;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      trace.forEach((p, idx) => {
        const x = gx0 + p.t * px;
        const y = gy0 - p.x * py;
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      const last = trace[trace.length - 1];
      const lx = gx0 + last.t * px, ly = gy0 - last.x * py;
      ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=c.electron;ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(lx,gy0);ctx.lineTo(lx,ly);ctx.lineTo(gx0,ly);ctx.stroke();ctx.restore();
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fillStyle = c.electron;
      ctx.fill();
    }

    // Crossings at 4 s and 8 s in Replay mode
    if (mode === 0) {
      for (const [ct, cd] of [[4, 6], [8, 4]]) {
        if (simT >= ct) {
          ctx.beginPath();
          ctx.arc(gx0 + ct * px, gy0 - cd * py, 6, 0, Math.PI * 2);
          ctx.strokeStyle = c.ink;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }
      }
    }
  });

  updateReadout();
  return { destroy() {} };
}, { label: 'Walk the graph' });
