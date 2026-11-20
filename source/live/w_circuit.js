// 12.3 A circuit, energy-per-charge profile, rope analogy, tap switch & component probe.
import { Live } from './core.js';
import { label, note } from './art_waves.js';
import {
  simPalette, canvasPointerCoords, drawCircuitBattery, drawCircuitResistor, drawCircuitLED,
} from './draft_canvas.js';
import { createHum, playClick } from './atlas/engine/sound.js';

Live.register('circuit', (stage, params, api) => {
  const k = api.canvas(640, 360, 'A closed LED circuit linked to equal charge counters and energy-per-charge accounting');
  let nLeds = 1, vBat = 9, phase = 0, view = 0, schematic = false, switchOpen = false;
  let hoverInfo = null;
  let hum = null;
  const say = api.readout();

  // Keep Tab 0 (LEDs) and Tab 1 (View) indices intact for existing tests!
  const ledTabs = api.tabs(['1 LED', '2 LEDs', '3 LEDs', '4 LEDs'], (i) => {
    nLeds = i + 1;
    phase = 0;
    hoverInfo = null;
    if (Live.getPrefs().sonify && api.audio?.().ctx) playClick(api.audio().ctx, { dir: 1, gain: 0.04 });
    draw(0);
  });
  const batSlider = api.slider('Battery', {
    min: 1.5, max: 9, step: 1.5, value: vBat,
    fmt: (v) => `${v.toFixed(1)} V`,
    onInput: (v) => { vBat = v; phase = 0; hoverInfo = null; draw(0); },
  });
  const viewTabs = api.tabs(['Circuit', 'Energy per charge', 'Rope model'], (i) => {
    view = i;
    hoverInfo = null;
    draw(0);
  });
  const styleBtn = api.button('Schematic view', () => {
    schematic = !schematic;
    styleBtn.setAttribute('aria-pressed', String(schematic));
    draw(0);
  }, { pressed: false });

  const toggleSwitch = () => {
    switchOpen = !switchOpen;
    swBtn.textContent = switchOpen ? 'Close switch' : 'Open switch';
    swBtn.setAttribute('aria-pressed', String(switchOpen));
    hoverInfo = null;
    if (Live.getPrefs().sonify && api.audio?.().ctx) {
      playClick(api.audio().ctx, { dir: switchOpen ? -1 : 1, gain: 0.05 });
    }
    draw(0);
  };
  const swBtn = api.button('Open switch', toggleSwitch, { pressed: false });

  note(stage, 'Tap components to probe V/I or tap the right wire switch to break the circuit. Toggle Schematic view for Cambridge symbols.');

  function solve() {
    const I = switchOpen ? 0 : Math.max(0, (vBat - 2 * nLeds) / 330);
    const pLed = I > 0 ? 2 * I : 0;
    const pRes = I * I * 330;
    const pBat = vBat * I;
    if (I > 0 && Math.abs(pBat - nLeds * pLed - pRes) > 1e-9) throw new Error('Circuit power is not conserved');
    return { I, iMa: 1000 * I, pLed, pRes, pBat, vRes: I > 0 ? vBat - 2 * nLeds : 0 };
  }

  function buildProbeFor(index) {
    const s = solve();
    if (index === 0) {
      return { x: 78, y: 190, title: `${vBat.toFixed(1)} V Battery Probe`, detail: `I = ${s.iMa.toFixed(1)} mA · P = ${s.pBat.toFixed(3)} W` };
    }
    if (index === 1) {
      return { x: 245, y: 111, title: '330 Ω Resistor Probe', detail: `ΔV = ${s.vRes.toFixed(1)} V · P = ${s.pRes.toFixed(3)} W` };
    }
    if (index === 2) {
      const vLed = s.I > 0 ? 2.0 : (switchOpen ? 0 : Math.min(2.0, vBat / nLeds));
      return { x: 440, y: 111, title: `${nLeds} LED Bank Probe`, detail: `ΔV = ${vLed.toFixed(1)} V/LED · I = ${s.iMa.toFixed(1)} mA` };
    }
    return { x: 565, y: 190, title: 'Knife Switch Probe', detail: switchOpen ? `${vBat.toFixed(1)} V across open gap · 0.0 mA` : `0.0 V across closed switch · ${s.iMa.toFixed(1)} mA` };
  }

  // PDOM keyboard probe mirror
  const pdomWrap = document.createElement('label');
  pdomWrap.className = 'live-pdom-sr';
  pdomWrap.textContent = 'Probe circuit component';
  const pdomProbe = document.createElement('input');
  pdomProbe.type = 'range';
  pdomProbe.min = '0';
  pdomProbe.max = '3';
  pdomProbe.step = '1';
  pdomProbe.value = '0';
  pdomProbe.setAttribute('aria-label', 'Inspect series circuit component voltage and current');
  pdomWrap.appendChild(pdomProbe);
  api.controls.appendChild(pdomWrap);
  pdomProbe.addEventListener('input', () => {
    hoverInfo = buildProbeFor(+pdomProbe.value);
    pdomProbe.setAttribute('aria-valuetext', `${hoverInfo.title}: ${hoverInfo.detail}`);
    draw(0);
  });
  api.onCleanup(() => pdomWrap.remove());

  function drawProbeTooltip(ctx, pal) {
    if (!hoverInfo) return;
    ctx.save();
    ctx.font = '700 10.5px Lexend, system-ui, sans-serif';
    const w1 = ctx.measureText(hoverInfo.title).width;
    ctx.font = '500 10px Lexend, system-ui, sans-serif';
    const w2 = ctx.measureText(hoverInfo.detail).width;
    const w = Math.max(150, Math.ceil(Math.max(w1, w2)) + 18);
    const h = 38;
    const bx = Math.max(12, Math.min(640 - w - 12, hoverInfo.x - w / 2));
    const by = Math.max(12, Math.min(360 - h - 12, hoverInfo.y - h - 18));
    api.draw.roundRect(ctx, bx, by, w, h, 5);
    ctx.fillStyle = pal.sheet; ctx.fill();
    ctx.strokeStyle = pal.net; ctx.lineWidth = 1.4; ctx.stroke();
    api.draw.text(ctx, hoverInfo.title, bx + 9, by + 15, { size: 10.5, color: pal.net, weight: 700 });
    api.draw.text(ctx, hoverInfo.detail, bx + 9, by + 30, { size: 10, color: pal.ink, weight: 500 });
    ctx.restore();
  }

  function circuit(ctx, s, pal) {
    const mode = schematic ? 'schematic' : 'lifelike';
    label(ctx, pal, '1  Follow the charge around the whole loop', 24, 29, { size: 17, weight: 600 });
    const L = 78, R = 565, T = 111, B = 262, P = 2 * (R - L + B - T);
    ctx.strokeStyle = pal.ink; ctx.lineWidth = 2; ctx.strokeRect(L, T, R - L, B - T);

    drawCircuitBattery(ctx, L, 190, `${vBat.toFixed(1)} V`, pal, mode);
    drawCircuitResistor(ctx, 245, T, 82, 24, '330 Ω', pal, mode);

    for (let i = 0; i < nLeds; i++) {
      const x = 355 + (i + 0.5) * 170 / nLeds;
      drawCircuitLED(ctx, x, T, s.pLed, s.I <= 0, '', pal, mode);
    }
    label(ctx, pal, `${nLeds} red LED${nLeds > 1 ? 's' : ''}`, 440, 65, { align: 'center', weight: 600 });

    // Knife switch on right vertical wire (x = R, y = 190)
    const swY = 190;
    ctx.fillStyle = pal.plate;
    ctx.fillRect(R - 14, swY - 18, 28, 36);
    ctx.strokeStyle = switchOpen ? pal.force : pal.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(R, swY + 14);
    ctx.lineTo(switchOpen ? R + 15 : R, swY - 12);
    ctx.stroke();
    for (const sy of [swY - 14, swY + 14]) {
      ctx.beginPath(); ctx.arc(R, sy, 3, 0, Math.PI * 2);
      ctx.fillStyle = pal.sheet; ctx.fill(); ctx.stroke();
    }
    label(ctx, pal, switchOpen ? 'switch open' : 'switch', R - 14, swY + 4, { align: 'right', size: 10.5, color: switchOpen ? pal.force : pal.muted });

    if (!switchOpen) {
      for (let i = 0; i < 32; i++) {
        let d = ((i + phase % 1) / 32) * P, x, y;
        if (d < R - L) { x = L + d; y = T; }
        else if (d < R - L + B - T) { x = R; y = T + d - (R - L); }
        else if (d < 2 * (R - L) + B - T) { x = R - (d - (R - L) - (B - T)); y = B; }
        else { x = L; y = B - (d - 2 * (R - L) - (B - T)); }
        if (y === T && ((x > 200 && x < 294) || (x > 350 && x < 530))) continue;
        if (x === L && y > 152 && y < 236) continue;
        if (x === R && y > swY - 18 && y < swY + 18) continue;
        ctx.fillStyle = pal.charge; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (const [x, y, n, txt] of [[154, T, 'A', 'leaving +'], [322, T, 'B', 'after resistor'], [320, B, 'C', 'returning to −']]) {
      ctx.strokeStyle = pal.current; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke();
      label(ctx, pal, n, x, y === T ? y + 27 : y - 18, { align: 'center', weight: 600, color: pal.current });
      label(ctx, pal, `${s.iMa.toFixed(1)} mA`, x, y === T ? y + 47 : y - 38, { align: 'center', weight: 600 });
      label(ctx, pal, txt, x, y === T ? y + 65 : y + 28, { align: 'center', size: 12 });
    }
    label(ctx, pal, `A = B = C: ${Math.floor(phase)} equal charge amounts counted`, 320, 336, { align: 'center', weight: 600 });
  }

  function energy(ctx, s, pal) {
    label(ctx, pal, '2  Follow the energy carried by each coulomb', 24, 29, { size: 17, weight: 600 });
    if (s.I <= 0) {
      const msg = switchOpen ? 'Switch open: break prevents charge circulation (full V sits across the gap).' : `${vBat.toFixed(1)} V is below the ${2 * nLeds} V threshold.`;
      label(ctx, pal, msg, 320, 127, { size: 17, align: 'center', weight: 600 });
      label(ctx, pal, 'No charge circulates; no power is transferred.', 320, 170, { size: 16, align: 'center' });
      label(ctx, pal, 'This threshold model does not resolve the individual LED voltages.', 320, 219, { size: 13, align: 'center', color: pal.muted });
      return;
    }
    const base = 252, Y = (v) => base - v * 17;
    ctx.strokeStyle = pal.rule; ctx.lineWidth = 1;
    for (const v of [0, 3, 6, 9]) {
      ctx.beginPath(); ctx.moveTo(60, Y(v)); ctx.lineTo(600, Y(v)); ctx.stroke();
      label(ctx, pal, `${v} V`, 49, Y(v) + 4, { align: 'right', size: 12 });
    }
    const pts = [[76, 0], [114, vBat], [218, vBat], [318, 2 * nLeds], [355, 2 * nLeds]];
    for (let i = 0; i < nLeds; i++) pts.push([355 + (i + 1) * 175 / nLeds, 2 * (nLeds - i - 1)]);
    pts.push([600, 0]);
    ctx.strokeStyle = pal.charge; ctx.lineWidth = 3; ctx.beginPath();
    pts.forEach(([x, v], i) => (i ? ctx.lineTo(x, Y(v)) : ctx.moveTo(x, Y(v))));
    ctx.stroke();
    label(ctx, pal, 'battery', 95, 281, { align: 'center', weight: 600 });
    label(ctx, pal, 'resistor', 270, 281, { align: 'center', weight: 600 });
    label(ctx, pal, 'LEDs', 447, 281, { align: 'center', weight: 600 });
    label(ctx, pal, `+${vBat.toFixed(1)} J/C`, 100, 307, { align: 'center', color: pal.charge });
    label(ctx, pal, `−${s.vRes.toFixed(1)} J/C`, 270, 307, { align: 'center', color: pal.current });
    label(ctx, pal, '−2 J/C each', 447, 307, { align: 'center', color: pal.current });
    label(ctx, pal, 'This “height” means energy per charge, not physical altitude.', 320, 339, { align: 'center', size: 13 });
  }

  function rope(ctx, _s, pal) {
    label(ctx, pal, '3  A rope helps us picture a complete circuit', 24, 29, { size: 17, weight: 600 });
    ctx.strokeStyle = pal.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(320, 182, 230, 77, 0, 0, 2 * Math.PI); ctx.stroke();
    for (let i = 0; i < 28; i++) {
      const a = (i / 28 + phase / 28) * 2 * Math.PI, x = 320 + 230 * Math.cos(a), y = 182 + 77 * Math.sin(a);
      ctx.fillStyle = pal.sheet; ctx.strokeStyle = pal.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 3, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    }
    for (const [x, y, col] of [[90, 181, pal.charge], [430, 112, pal.current]]) {
      ctx.fillStyle = pal.sheet; ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x - 28, y - 17, 56, 34, 13); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 15 + i * 9, y - 11); ctx.lineTo(x - 15 + i * 9, y + 11); ctx.stroke(); }
    }
    label(ctx, pal, 'hands pull', 90, 225, { align: 'center', color: pal.charge, weight: 600 });
    label(ctx, pal, 'hands grip: they warm up', 430, 76, { align: 'center', color: pal.current, weight: 600 });
    api.draw.arrow(ctx, 240, 105, 300, 105, pal.charge, 2, 8);
    api.draw.arrow(ctx, 400, 260, 340, 260, pal.charge, 2, 8);
    label(ctx, pal, 'Same rope speed everywhere; energy is passed at the contacts.', 320, 304, { align: 'center', weight: 600 });
    label(ctx, pal, 'A circuit has charge carriers and electric fields; it has no material rope.', 320, 336, { align: 'center', size: 12 });
  }

  function draw(dt) {
    const pal = simPalette(api);
    const s = solve();
    if (dt > 0) phase += (s.iMa / 21.212) * 3 * dt;
    k.clear(pal.plate);
    [circuit, energy, rope][view](k.ctx, s, pal);
    drawProbeTooltip(k.ctx, pal);
    say(switchOpen
      ? `Open switch: 0.0 mA everywhere (${vBat.toFixed(1)} V sits across the open switch; no charge circulates).`
      : s.I > 0
        ? `Same current everywhere: ${s.iMa.toFixed(1)} mA. Battery supplies ${s.pBat.toFixed(3)} W; resistor receives ${s.pRes.toFixed(3)} W and each of ${nLeds} LEDs receives ${s.pLed.toFixed(3)} W. Energy balances; charge is not used up. The 2 V LED model is approximate.`
        : `${vBat.toFixed(1)} V does not exceed the ${2 * nLeds} V LED threshold in this approximate model: no current anywhere in the loop.`);
  }

  const onPointerDown = (ev) => {
    if (view !== 0) { hoverInfo = null; draw(0); return; }
    const { lx, ly } = canvasPointerCoords(ev, k.cv, k.W, k.H);
    if (Math.hypot(lx - 565, ly - 190) < 28) {
      toggleSwitch();
      return;
    }
    if (Math.hypot(lx - 78, ly - 190) < 32) hoverInfo = buildProbeFor(0);
    else if (Math.abs(lx - 245) < 46 && Math.abs(ly - 111) < 24) hoverInfo = buildProbeFor(1);
    else if (lx >= 340 && lx <= 535 && Math.abs(ly - 111) < 28) hoverInfo = buildProbeFor(2);
    else hoverInfo = null;
    draw(0);
  };
  k.cv.addEventListener('pointerdown', onPointerDown);
  api.onCleanup(() => k.cv.removeEventListener('pointerdown', onPointerDown));

  api.sonify((dt, _t, prefs) => {
    if (dt <= 0 || !prefs.sonify) {
      if (hum) { hum.stop(); hum = null; }
      return;
    }
    const { iMa } = solve();
    const ctx = api.audio()?.ctx;
    if (!ctx) return;
    if (!hum) hum = createHum(ctx, { baseFreq: 68, maxBoost: 110, maxGain: 0.035 });
    hum.update(iMa > 0 ? Math.min(1, iMa / 22) : 0);
  });

  api.onHide(() => { if (hum) { hum.stop(); hum = null; } });
  api.onCleanup(() => { if (hum) { hum.stop(); hum = null; } });

  api.onReset(
    () => { phase = 0; hoverInfo = null; draw(0); },
    () => {
      nLeds = 1; vBat = 9; phase = 0; view = 0; schematic = false; switchOpen = false; hoverInfo = null;
      ledTabs.setActive(0); viewTabs.setActive(0); batSlider.set(9);
      styleBtn.setAttribute('aria-pressed', 'false');
      swBtn.textContent = 'Open switch'; swBtn.setAttribute('aria-pressed', 'false');
      draw(0);
    }
  );

  api.loop(draw);
  draw(0);
  return {
    getState() { return { nLeds, vBat, view, schematic, switchOpen }; },
    setState(patch = {}) {
      if (typeof patch.nLeds === 'number') { nLeds = patch.nLeds; ledTabs.setActive(Math.max(0, Math.min(3, nLeds - 1))); }
      if (typeof patch.vBat === 'number') { vBat = patch.vBat; batSlider.set(vBat); }
      if (typeof patch.view === 'number') { view = patch.view; viewTabs.setActive(view); }
      if (typeof patch.schematic === 'boolean') { schematic = patch.schematic; styleBtn.setAttribute('aria-pressed', String(schematic)); }
      if (typeof patch.switchOpen === 'boolean') {
        switchOpen = patch.switchOpen;
        swBtn.textContent = switchOpen ? 'Close switch' : 'Open switch';
        swBtn.setAttribute('aria-pressed', String(switchOpen));
      }
      hoverInfo = null;
      draw(0);
    },
    destroy() { if (hum) { hum.stop(); hum = null; } },
  };
}, { label: 'Run the loop' });
