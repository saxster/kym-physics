// 12.5 Series and parallel LED circuits: Kirchhoff current & voltage laws, tap-to-unclip LED 1,
// Lifelike <-> Schematic toggle, interactive V/I probe tooltip, and battery drain rate.
import { Live } from './core.js';
import { note } from './art_waves.js';
import { simPalette, drawVector, drawCircuitBattery, drawCircuitResistor, drawCircuitLED, canvasPointerCoords } from './draft_canvas.js';
import { createHum, playClick } from './atlas/engine/sound.js';

Live.register('seriesparallel', (stage, params, api) => {
  note(stage, 'Tap LED 1 directly on the drawing (or press Unclip LED 1) to break branch 1. Toggle Schematic view for Cambridge symbols.');
  const W = 640, H = 360;
  const k = api.canvas(W, H, 'Series and parallel LED circuits with 9 V battery, 330 ohm resistors, and live current arrows');

  let isParallel = false; // false = Series, true = Parallel
  let nLeds = 2;          // 1..3 (default 2)
  let unclipped = false;  // Unclip LED 1 toggle
  let schematic = false;
  let phase = 0;
  let hoverInfo = null;   // { x, y, title, detail }
  let led1Hit = { x: 320, y: 92 };
  let hum = null;

  const say = api.readout();

  // Control 1 (Tab 0): Series / Parallel tabs
  const modeTabs = api.tabs(['Series', 'Parallel'], (i) => {
    isParallel = i === 1;
    hoverInfo = null;
    drawFrame(0);
  });

  // Control 2: LEDs slider (1 to 3, default 2)
  const ledSlider = api.slider('LEDs', {
    min: 1, max: 3, step: 1, value: nLeds,
    fmt: (v) => `${v} LED${v > 1 ? 's' : ''}`,
    onInput: (v) => {
      nLeds = v;
      hoverInfo = null;
      drawFrame(0);
    },
  });

  // Control 3: Unclip LED 1 toggle button
  const toggleClip = () => {
    unclipped = !unclipped;
    clipBtn.textContent = unclipped ? 'Reclip LED 1' : 'Unclip LED 1';
    clipBtn.setAttribute('aria-pressed', String(unclipped));
    if (Live.getPrefs().sonify && api.audio?.().ctx) {
      playClick(api.audio().ctx, { dir: unclipped ? -1 : 1, gain: 0.05 });
    }
    drawFrame(0);
  };
  const clipBtn = api.button('Unclip LED 1', toggleClip, { pressed: false });

  // Control 4: Lifelike <-> Schematic toggle button
  const styleBtn = api.button('Schematic view', () => {
    schematic = !schematic;
    styleBtn.setAttribute('aria-pressed', String(schematic));
    drawFrame(0);
  }, { pressed: false });

  function drawBatteryAndMeter(ctx, x, topY, botY, iBatMa, drainFactorText, pal) {
    const midY = (topY + botY) / 2;
    drawCircuitBattery(ctx, x, midY, '9.0 V', pal, schematic ? 'schematic' : 'lifelike');
    const mx = 16, my = 306, mw = 204, mh = 44;
    ctx.fillStyle = pal.sheet;
    ctx.strokeStyle = pal.rule;
    ctx.lineWidth = 1;
    api.draw.roundRect(ctx, mx, my, mw, mh, 5);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, `Battery: ${Math.round(iBatMa)} mA`, mx + 10, my + 18, {
      size: 11.5, color: pal.current, weight: 700,
    });
    api.draw.text(ctx, drainFactorText, mx + 10, my + 35, {
      size: 10.5, color: pal.muted,
    });
  }

  function currentBatteryMa() {
    if (!isParallel) return unclipped ? 0 : Math.max(0, ((9.0 - 2.0 * nLeds) / 330) * 1000);
    const active = nLeds - (unclipped ? 1 : 0);
    return active * ((9.0 - 2.0) / 330) * 1000;
  }

  function drawSeries(ctx, pal) {
    const mode = schematic ? 'schematic' : 'lifelike';
    const I = unclipped ? 0 : (9.0 - 2.0 * nLeds) / 330;
    const iMa = I * 1000;
    const vRes = unclipped ? 0 : 9.0 - 2.0 * nLeds;
    const vLed = unclipped ? 0 : 2.0;
    const pLed = vLed * I;

    if (!unclipped && Math.abs(2.0 * nLeds + vRes - 9.0) > 1e-9) {
      throw new Error('Kirchhoff voltage sum violated in series');
    }

    const leftX = 110, rightX = 560, topY = 92, botY = 264;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2.2;
    ctx.strokeRect(leftX, topY, rightX - leftX, botY - topY);

    const drainRatio = unclipped ? '0 (stopped)' : `×${(I / (7 / 330)).toFixed(2)} as fast`;
    drawBatteryAndMeter(ctx, leftX, topY, botY, iMa, `Runs down ${drainRatio}`, pal);
    drawCircuitResistor(ctx, 215, topY, 82, 24, `330 Ω (${vRes.toFixed(0)} V)`, pal, mode);

    led1Hit = { x: 320, y: topY };
    for (let i = 0; i < nLeds; i++) {
      const lx = 320 + i * 95;
      drawCircuitLED(ctx, lx, topY, pLed, i === 0 && unclipped, `LED ${i + 1} (${vLed.toFixed(0)} V)`, pal, mode);
    }

    const iStr = `${Math.round(iMa)} mA`;
    if (!unclipped) {
      drawChargeTokens(ctx, [[leftX, topY], [rightX, topY], [rightX, botY], [leftX, botY], [leftX, topY]], iMa, 28, pal);
    }
    drawVector(ctx, 145, topY - 16, 172, topY - 16, { kind: 'force', color: pal.current, width: 2.1, head: 6.5 });
    api.draw.text(ctx, iStr, 158, topY - 23, { size: 11, color: pal.current, align: 'center', weight: 700 });

    drawVector(ctx, rightX + 16, 155, rightX + 16, 195, { kind: 'force', color: pal.current, width: 2.1, head: 6.5 });
    api.draw.text(ctx, iStr, rightX + 24, 180, { size: 11, color: pal.current, weight: 700 });

    drawVector(ctx, 370, botY + 18, 320, botY + 18, { kind: 'force', color: pal.current, width: 2.1, head: 6.5 });
    api.draw.text(ctx, `One path: ${iStr} everywhere`, 345, botY + 34, {
      size: 11.5, color: pal.current, align: 'center', weight: 700,
    });

    if (unclipped) {
      say(
        `0 mA everywhere: unclipping LED 1 breaks the only path, so the whole loop stops and every LED goes dark ` +
        `(a real battery sags a little when it supplies more current, Section 12.4).`
      );
    } else if (nLeds === 1) {
      say(
        `Series with 1 LED: ${Math.round(iMa)} mA at every point. The LED takes 2 V (${pLed.toFixed(3)} W) and the 330 Ω resistor takes the other 7 V ` +
        `(2 V + 7 V = 9 V; a real battery sags a little under load, Section 12.4).`
      );
    } else {
      const pct = Math.round((pLed / 0.04242) * 100);
      say(
        `One path: ${Math.round(iMa)} mA at every point. Each of the ${nLeds} LEDs has 2 V (${pLed.toFixed(3)} W each, about ${pct}% of one LED's 0.042 W because the shared 330 Ω resistor now takes ${vRes.toFixed(0)} V). ` +
        `Unclip any LED and the only path is broken (a real battery sags a little under load, Section 12.4).`
      );
    }
  }

  function drawParallel(ctx, pal) {
    const mode = schematic ? 'schematic' : 'lifelike';
    const iBranchA = (9.0 - 2.0) / 330;
    const branches = [];
    let iBatA = 0;
    for (let i = 0; i < nLeds; i++) {
      const broken = i === 0 && unclipped;
      const ib = broken ? 0 : iBranchA;
      branches.push({ broken, iA: ib, iMa: ib * 1000, pLed: 2.0 * ib });
      iBatA += ib;
    }
    const iBatMa = iBatA * 1000;
    const activeCount = branches.filter((b) => !b.broken).length;

    const sumBr = branches.reduce((acc, b) => acc + b.iA, 0);
    if (Math.abs(sumBr - iBatA) > 1e-12) throw new Error('Kirchhoff current law violated in parallel');

    const leftX = 110, forkX = 215, joinX = 535, botY = 292;
    const branchYs = [96, 178, 260].slice(0, nLeds);
    const lastBranchY = branchYs[branchYs.length - 1];
    led1Hit = { x: 435, y: branchYs[0] };

    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(leftX, branchYs[0]); ctx.lineTo(forkX, branchYs[0]);
    ctx.moveTo(forkX, branchYs[0]); ctx.lineTo(forkX, lastBranchY);
    ctx.moveTo(joinX, branchYs[0]); ctx.lineTo(joinX, botY);
    ctx.moveTo(joinX, botY); ctx.lineTo(leftX, botY);
    ctx.lineTo(leftX, branchYs[0]);
    ctx.stroke();

    drawBatteryAndMeter(ctx, leftX, branchYs[0], botY, iBatMa, `Battery runs down ×${activeCount} as fast`, pal);

    drawVector(ctx, 138, branchYs[0] - 14, 185, branchYs[0] - 14, { kind: 'force', color: pal.current, width: 2.3, head: 7 });
    api.draw.text(ctx, `${Math.round(iBatMa)} mA`, 162, branchYs[0] - 20, {
      size: 11.5, color: pal.current, align: 'center', weight: 700,
    });
    api.draw.text(ctx, '9 V across each branch', (forkX + joinX) / 2, 34, {
      size: 12, color: pal.ink, align: 'center', weight: 700,
    });

    for (let i = 0; i < nLeds; i++) {
      const by = branchYs[i];
      const br = branches[i];
      ctx.strokeStyle = pal.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(forkX, by); ctx.lineTo(joinX, by); ctx.stroke();

      for (const jx of [forkX, joinX]) {
        ctx.beginPath(); ctx.arc(jx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = pal.ink; ctx.fill();
      }
      drawCircuitResistor(ctx, 315, by, 78, 22, br.broken ? '330 Ω (0 V)' : '330 Ω (7 V)', pal, mode);
      drawCircuitLED(ctx, 435, by, br.pLed, br.broken, `LED ${i + 1} (2 V)`, pal, mode);
      if (!br.broken) drawChargeTokens(ctx, [[forkX, by], [joinX, by]], br.iMa, 32, pal);

      drawVector(ctx, 232, by - 12, 264, by - 12, { kind: 'force', color: br.broken ? pal.muted : pal.current, width: 1.8, head: 6 });
      api.draw.text(ctx, `${Math.round(br.iMa)} mA`, 248, by - 18, {
        size: 10.5, color: br.broken ? pal.muted : pal.current, align: 'center', weight: 700,
      });
    }

    if (iBatMa > 0) {
      drawChargeTokens(ctx, [[leftX, botY], [leftX, branchYs[0]], [forkX, branchYs[0]]], iBatMa, 28, pal);
      drawChargeTokens(ctx, [[joinX, branchYs[0]], [joinX, botY], [leftX, botY]], iBatMa, 28, pal);
    }

    if (unclipped) {
      say(
        `Parallel with LED 1 unclipped: branch 1 drops to 0 mA, while ${activeCount === 0 ? 'no other branch is connected' : `the other ${activeCount} branch${activeCount > 1 ? 'es' : ''} still ha${activeCount > 1 ? 've' : 's'} the full 9 V (2 V + 7 V) and carr${activeCount > 1 ? 'y' : 'ies'} 21 mA (0.042 W) unchanged`}. ` +
        `The battery now supplies ${Math.round(iBatMa)} mA (a real battery sags a little when it supplies more current, Section 12.4).`
      );
    } else {
      say(
        `Each branch has the full 9 V (2 V across the LED + 7 V across its 330 Ω resistor) and carries 21 mA (0.042 W per LED), ` +
        `so with ${nLeds} branch${nLeds > 1 ? 'es' : ''} the currents add at the fork to ${Math.round(iBatMa)} mA and the battery runs down ×${nLeds} as fast. ` +
        `Unclip one LED and the others do not change (a real battery sags a little under load, Section 12.4).`
      );
    }
  }

  function drawChargeTokens(ctx, pts, iMa, spacing = 30, pal) {
    if (iMa <= 0 || pts.length < 2) return;
    const segs = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1];
      const len = Math.hypot(dx, dy);
      segs.push({ x0: pts[i][0], y0: pts[i][1], dx, dy, len, start: total });
      total += len;
    }
    const shift = ((phase * iMa * 1.8) % spacing + spacing) % spacing;
    ctx.fillStyle = pal.charge;
    for (let d = shift; d < total; d += spacing) {
      const seg = segs.find((s) => d >= s.start && d <= s.start + s.len) || segs[segs.length - 1];
      const u = seg.len > 0 ? (d - seg.start) / seg.len : 0;
      ctx.beginPath();
      ctx.arc(seg.x0 + seg.dx * u, seg.y0 + seg.dy * u, 2.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function buildProbeFor(index) {
    const iMa = currentBatteryMa();
    if (index === 0) {
      return { x: 110, y: 185, title: '9.0 V Supply Probe', detail: `I_bat = ${Math.round(iMa)} mA · P = ${(0.009 * iMa).toFixed(2)} W` };
    }
    if (index === 1) {
      if (!isParallel) {
        const vRes = unclipped ? 0 : 9 - 2 * nLeds;
        return { x: 215, y: 92, title: '330 Ω Resistor Probe', detail: unclipped ? '0.0 V (circuit open) · 0 mA' : `${vRes.toFixed(1)} V · ${Math.round(iMa)} mA` };
      }
      return { x: 315, y: 96, title: 'Branch 1 Resistor Probe', detail: unclipped ? '0.0 V across resistor · 0 mA (open)' : '7.0 V across resistor · 21 mA' };
    }
    if (!isParallel) {
      return {
        x: 320, y: 92,
        title: unclipped ? 'Open LED 1 Gap Probe' : 'LED 1 Probe',
        detail: unclipped ? '9.0 V across open gap · 0 mA' : `2.0 V · ${Math.round(iMa)} mA`,
      };
    }
    if (index === 2) {
      return {
        x: 435, y: 96,
        title: unclipped ? 'Open Branch 1 Gap Probe' : 'Branch 1 LED Probe',
        detail: unclipped ? '9.0 V across open gap · 0 mA' : '2.0 V across LED · 21 mA',
      };
    }
    const y2 = nLeds >= 2 ? 178 : 96;
    return { x: 435, y: y2, title: `Branch ${Math.min(2, nLeds)} LED Probe`, detail: '9 V branch (2 V LED + 7 V res) · 21 mA' };
  }

  // PDOM keyboard component probe mirror
  const pdomWrap = document.createElement('label');
  pdomWrap.className = 'live-pdom-sr';
  pdomWrap.textContent = 'Probe circuit node';
  const pdomProbe = document.createElement('input');
  pdomProbe.type = 'range';
  pdomProbe.min = '0';
  pdomProbe.max = '3';
  pdomProbe.step = '1';
  pdomProbe.value = '0';
  pdomProbe.setAttribute('aria-label', 'Inspect series or parallel circuit component voltage and current');
  pdomWrap.appendChild(pdomProbe);
  api.controls.appendChild(pdomWrap);
  pdomProbe.addEventListener('input', () => {
    hoverInfo = buildProbeFor(+pdomProbe.value);
    pdomProbe.setAttribute('aria-valuetext', `${hoverInfo.title}: ${hoverInfo.detail}`);
    drawFrame(0);
  });
  api.onCleanup(() => pdomWrap.remove());

  function drawProbeTooltip(ctx, pal) {
    if (!hoverInfo) return;
    ctx.save();
    ctx.font = '700 10.5px Lexend, system-ui, sans-serif';
    const w1 = ctx.measureText(hoverInfo.title).width;
    ctx.font = '500 10px Lexend, system-ui, sans-serif';
    const w2 = ctx.measureText(hoverInfo.detail).width;
    const w = Math.max(158, Math.ceil(Math.max(w1, w2)) + 20);
    const h = 38;
    const bx = Math.max(12, Math.min(W - w - 12, hoverInfo.x - w / 2));
    const by = Math.max(12, Math.min(H - h - 12, hoverInfo.y - h - 22));
    api.draw.roundRect(ctx, bx, by, w, h, 5);
    ctx.fillStyle = pal.sheet; ctx.fill();
    ctx.strokeStyle = pal.net; ctx.lineWidth = 1.4; ctx.stroke();
    api.draw.text(ctx, hoverInfo.title, bx + 9, by + 15, { size: 10.5, color: pal.net, weight: 700 });
    api.draw.text(ctx, hoverInfo.detail, bx + 9, by + 30, { size: 10, color: pal.ink, weight: 500 });
    ctx.restore();
  }

  const toLogical = (ev) => canvasPointerCoords(ev, k.cv, W, H);
  const onPointerDown = (ev) => {
    const { lx, ly } = toLogical(ev);
    if (Math.hypot(lx - led1Hit.x, ly - led1Hit.y) < 26) {
      toggleClip();
      return;
    }
    if (lx >= 78 && lx <= 142 && ly >= 110 && ly <= 265) {
      hoverInfo = buildProbeFor(0);
    } else if (isParallel) {
      const branchYs = [96, 178, 260].slice(0, nLeds);
      const bIdx = branchYs.findIndex((by) => Math.abs(ly - by) < 24);
      if (bIdx === 0 && lx >= 270 && lx <= 360) hoverInfo = buildProbeFor(1);
      else if (bIdx >= 0 && lx >= 220 && lx <= 535) hoverInfo = buildProbeFor(bIdx === 0 ? 2 : 3);
      else hoverInfo = null;
    } else if (Math.abs(ly - 92) < 24 && lx >= 170 && lx <= 260) {
      hoverInfo = buildProbeFor(1);
    } else if (Math.abs(ly - 92) < 24 && lx > 260 && lx <= 550) {
      hoverInfo = buildProbeFor(2);
    } else {
      hoverInfo = null;
    }
    drawFrame(0);
  };
  k.cv.addEventListener('pointerdown', onPointerDown);
  api.onCleanup(() => k.cv.removeEventListener('pointerdown', onPointerDown));

  function drawFrame(dt) {
    phase += dt;
    const pal = simPalette(api);
    const ctx = k.ctx;
    k.clear(pal.plate);
    if (!isParallel) drawSeries(ctx, pal);
    else drawParallel(ctx, pal);
    drawProbeTooltip(ctx, pal);
  }

  api.sonify((dt, _t, prefs) => {
    if (dt <= 0 || !prefs.sonify) {
      if (hum) { hum.stop(); hum = null; }
      return;
    }
    const iMa = currentBatteryMa();
    const ctx = api.audio()?.ctx;
    if (!ctx) return;
    if (!hum) hum = createHum(ctx, { baseFreq: 68, maxBoost: 110, maxGain: 0.032 });
    hum.update(iMa > 0 ? Math.min(1, iMa / 64) : 0);
  });

  api.onHide(() => { if (hum) { hum.stop(); hum = null; } });
  api.onCleanup(() => { if (hum) { hum.stop(); hum = null; } });

  api.onReset(
    () => { phase = 0; hoverInfo = null; drawFrame(0); },
    () => {
      isParallel = false; nLeds = 2; unclipped = false; schematic = false; phase = 0; hoverInfo = null;
      modeTabs.setActive(0); ledSlider.set(2);
      clipBtn.textContent = 'Unclip LED 1'; clipBtn.setAttribute('aria-pressed', 'false');
      styleBtn.setAttribute('aria-pressed', 'false');
      drawFrame(0);
    }
  );

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return {
    getState() { return { isParallel, nLeds, unclipped, schematic }; },
    setState(patch = {}) {
      if (typeof patch.isParallel === 'boolean') { isParallel = patch.isParallel; modeTabs.setActive(isParallel ? 1 : 0); }
      if (typeof patch.nLeds === 'number') { nLeds = patch.nLeds; ledSlider.set(nLeds); }
      if (typeof patch.unclipped === 'boolean') {
        unclipped = patch.unclipped;
        clipBtn.textContent = unclipped ? 'Reclip LED 1' : 'Unclip LED 1';
        clipBtn.setAttribute('aria-pressed', String(unclipped));
      }
      if (typeof patch.schematic === 'boolean') {
        schematic = patch.schematic;
        styleBtn.setAttribute('aria-pressed', String(schematic));
      }
      hoverInfo = null;
      drawFrame(0);
    },
    destroy() { if (hum) { hum.stop(); hum = null; } },
  };
}, { label: 'Wire them two ways' });
