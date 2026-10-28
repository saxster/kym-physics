// 12.3 Potential hill & rope-loop circuit: identical current everywhere, volts height profile, and power conservation.
import { Live } from './core.js';

Live.register('circuit', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 360;
  const k = api.canvas(W, H, 'Potential height profile, circuit loop with three charge counters, and the rope-loop analogy');

  let nLeds = 1;    // 1..4 LEDs
  let vBat = 9.0;   // 1.5..9.0 V in 1.5 V steps (default 9.0 V)
  let beadPhase = 0; // cumulative bead spacings passed (integer part = identical count at all 3 stations)
  let ropePhase = 0;

  const say = api.readout();

  // Control 1: LEDs in the loop tabs (1, 2, 3, 4)
  api.tabs(['1 LED', '2 LEDs', '3 LEDs', '4 LEDs'], (i) => {
    nLeds = i + 1;
    beadPhase = 0;
    drawFrame(0);
  });

  // Control 2: Battery slider (1.5 V to 9.0 V in 1.5 V steps, default 9.0 V)
  api.slider('Battery', {
    min: 1.5, max: 9.0, step: 1.5, value: vBat,
    fmt: (v) => `${v.toFixed(1)} V`,
    onInput: (v) => {
      vBat = v;
      beadPhase = 0;
      drawFrame(0);
    },
  });

  // Control 3: Reset counters button
  api.button('Reset counters', () => {
    beadPhase = 0;
    drawFrame(0);
  });

  function solveCircuit() {
    const vLedsNeeded = 2.0 * nLeds;
    const I = vBat > vLedsNeeded ? (vBat - vLedsNeeded) / 330 : 0;
    const pBat = vBat * I;
    const pLedEach = I > 0 ? 2.0 * I : 0;
    const pRes = I * I * 330;
    // Conservation check every frame: P_battery = n * P_LED + P_resistor within 1e-9 W
    if (I > 0 && Math.abs(pBat - (nLeds * pLedEach + pRes)) > 1e-9) {
      throw new Error('Power conservation violated in w_circuit');
    }
    return { I, iMa: I * 1000, pBat, pLedEach, pRes, vRes: I > 0 ? vBat - vLedsNeeded : 0 };
  }

  function drawFrame(dt) {
    const s = solveCircuit();
    // 21.2 mA maps to ~60 px/s; with bead spacing 20 px, that is 3.0 beads/s at 21.2 mA
    const beadsPerSec = s.I > 0 ? (s.iMa / 21.212) * 3.0 : 0;
    if (dt > 0) {
      beadPhase += beadsPerSec * dt;
      ropePhase += beadsPerSec * 20 * dt;
    }
    const countInt = Math.floor(beadPhase);

    const ctx = k.ctx;
    k.clear(c.plate);

    // 1. TOP PANEL (y = 14..102): Potential hill (volts as height)
    const hillL = 64, hillR = 576, hillBot = 96, hillMaxH = 68;
    const yOfV = (v) => hillBot - (v / 9.0) * hillMaxH;

    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hillL, hillBot);
    ctx.lineTo(hillR, hillBot);
    ctx.stroke();

    // Potential profile coordinates:
    // x = 64..110: battery climb 0 -> vBat
    // x = 110..210: flat lead at vBat
    // x = 210..310: 330 ohm resistor drop from vBat to vAfterRes
    // x = 310..360: flat lead
    // x = 360..520: nLeds steps, each dropping 2 V (if conducting) or sharing vBat
    const vAfterRes = s.I > 0 ? 2.0 * nLeds : vBat;
    ctx.strokeStyle = c.electron;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(hillL, yOfV(0));
    ctx.lineTo(100, yOfV(vBat));
    ctx.lineTo(210, yOfV(vBat));
    ctx.lineTo(305, yOfV(vAfterRes));
    ctx.lineTo(355, yOfV(vAfterRes));
    const ledSpan = 165 / nLeds;
    for (let i = 0; i < nLeds; i++) {
      const x1 = 355 + i * ledSpan;
      const x2 = x1 + ledSpan * 0.65;
      const x3 = x1 + ledSpan;
      const vDropAfter = s.I > 0 ? 2.0 * (nLeds - 1 - i) : (i === nLeds - 1 ? 0 : vBat);
      ctx.lineTo(x2, yOfV(vDropAfter));
      ctx.lineTo(x3, yOfV(vDropAfter));
    }
    ctx.lineTo(hillR, yOfV(0));
    ctx.stroke();

    api.draw.text(ctx, `Potential height: +${vBat.toFixed(1)} V at battery, −${s.vRes.toFixed(1)} V across resistor, −2.0 V per lit LED`, hillL, 18, {
      size: 11.5, color: c.electron, weight: 600,
    });

    // 2. MIDDLE PANEL (y = 118..224): Unrolled circuit loop with circulating charge beads and 3 counters
    const loopL = 64, loopR = 576, loopTop = 136, loopBot = 204;
    const loopW = loopR - loopL, loopH = loopBot - loopTop;
    const perim = 2 * (loopW + loopH);

    // Wire rectangle
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(loopL, loopTop, loopW, loopH);

    // Battery on left edge
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    api.draw.roundRect(ctx, loopL - 22, (loopTop + loopBot) / 2 - 22, 44, 44, 4);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, `${vBat.toFixed(1)} V`, loopL, (loopTop + loopBot) / 2 + 4, {
      size: 11, color: c.ink, align: 'center', weight: 700,
    });
    api.draw.text(ctx, '+', loopL, loopTop - 5, { size: 12, color: c.proton, align: 'center', weight: 700 });
    api.draw.text(ctx, '−', loopL, loopBot + 14, { size: 12, color: c.electron, align: 'center', weight: 700 });

    // 330 ohm resistor on top branch (x = 210..305)
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    api.draw.roundRect(ctx, 210, loopTop - 11, 95, 22, 3);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, `330 Ω (${s.pRes.toFixed(2)} W)`, 257.5, loopTop + 4, {
      size: 10.5, color: c.ink, align: 'center', weight: 600,
    });

    // 1 to 4 Red LEDs on top branch (x = 360..520)
    const ledBright = s.I > 0.001 ? Math.min(1, 0.28 + (s.pLedEach / 0.0424) * 0.72) : 0;
    for (let i = 0; i < nLeds; i++) {
      const lx = 368 + i * (152 / nLeds) + (76 / nLeds - 14);
      if (ledBright > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(lx, loopTop, 16, 0, Math.PI * 2);
        ctx.fillStyle = c.proton;
        ctx.globalAlpha = 0.35 * ledBright;
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(lx, loopTop, 8.5, 0, Math.PI * 2);
      ctx.fillStyle = ledBright > 0 ? c.proton : c.sheet;
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      api.draw.text(ctx, `LED ${i + 1}`, lx, loopTop - 14, { size: 10, color: c.muted, align: 'center' });
    }

    // Fixed population of 64 beads circulating round the perimeter
    const nBeads = 64;
    const spacing = perim / nBeads;
    const shift = ((beadPhase % 1) + 1) % 1;
    ctx.fillStyle = c.ink;
    for (let b = 0; b < nBeads; b++) {
      const dist = ((b + shift) * spacing) % perim;
      let bx = 0, by = 0;
      if (dist < loopW) { bx = loopL + dist; by = loopTop; }
      else if (dist < loopW + loopH) { bx = loopR; by = loopTop + (dist - loopW); }
      else if (dist < 2 * loopW + loopH) { bx = loopR - (dist - loopW - loopH); by = loopBot; }
      else { bx = loopL; by = loopBot - (dist - 2 * loopW - loopH); }
      // Don't draw on top of battery/resistor boxes
      if (Math.abs(bx - loopL) < 22 && Math.abs(by - (loopTop + loopBot) / 2) < 22) continue;
      if (by === loopTop && bx >= 210 && bx <= 305) continue;
      ctx.beginPath();
      ctx.arc(bx, by, 2.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Three counters at marked points: "leaving +", "after the resistor", "returning to −"
    const stations = [
      { x: 145, y: loopTop, lbl: 'leaving +' },
      { x: 332, y: loopTop, lbl: 'after the resistor' },
      { x: 320, y: loopBot, lbl: 'returning to −' },
    ];
    for (const st of stations) {
      ctx.strokeStyle = c.proton;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y - 9);
      ctx.lineTo(st.x, st.y + 9);
      ctx.stroke();
      const ty = st.y === loopTop ? st.y + 23 : st.y - 12;
      api.draw.text(ctx, `${st.lbl}: ${s.iMa.toFixed(1)} mA (${countInt})`, st.x, ty, {
        size: 10.5, color: c.proton, align: 'center', weight: 600,
      });
    }

    // 3. BOTTOM PANEL (y = 242..344): Rope-loop model with hauling hands ("battery") and gripping hands ("grips")
    const ropeY = 294, ropeRx = 220, ropeRy = 32, ropeCx = W / 2;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(ropeCx, ropeY, ropeRx, ropeRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Knots on the rope moving at the same speed everywhere
    const nKnots = 28;
    for (let i = 0; i < nKnots; i++) {
      const ang = ((i / nKnots) * Math.PI * 2 + (ropePhase / 120)) % (Math.PI * 2);
      const kx = ropeCx + ropeRx * Math.cos(ang);
      const ky = ropeY + ropeRy * Math.sin(ang);
      ctx.beginPath();
      ctx.arc(kx, ky, 3, 0, Math.PI * 2);
      ctx.fillStyle = c.sheet;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = c.ink;
      ctx.stroke();
    }

    // Battery hauling hands at left of rope loop
    const drawGrip = (gx, gy, label, powerW, isBattery) => {
      if (!isBattery && powerW > 0.001) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(gx, gy, 18, 0, Math.PI * 2);
        ctx.fillStyle = c.proton;
        ctx.globalAlpha = Math.min(0.55, 0.15 + powerW * 2.5);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = c.sheet;
      ctx.strokeStyle = isBattery ? c.electron : c.proton;
      ctx.lineWidth = 1.8;
      api.draw.roundRect(ctx, gx - 26, gy - 11, 52, 22, 6);
      ctx.fill();
      ctx.stroke();
      api.draw.text(ctx, label, gx, gy + 4, { size: 10, color: c.ink, align: 'center', weight: 600 });
    };

    drawGrip(ropeCx - ropeRx, ropeY, 'battery', s.pBat, true);
    drawGrip(ropeCx - 70, ropeY - ropeRy, 'resistor grip', s.pRes, false);
    for (let i = 0; i < nLeds; i++) {
      const gx = ropeCx + 20 + i * 52;
      drawGrip(gx, ropeY - ropeRy, `grip ${i + 1}`, s.pLedEach, false);
    }
    api.draw.text(ctx, 'Rope-loop model: the whole rope moves at one speed; gripping hands warm up where it is hard to push through', ropeCx, 346, {
      size: 11, color: c.muted, align: 'center',
    });

    // Readout
    if (s.I > 0) {
      const iStr = s.iMa.toFixed(1);
      const ledText = nLeds === 1
        ? `the LED hands over ${s.pLedEach.toFixed(3)} W as light and warmth`
        : `${nLeds} LEDs hand over ${s.pLedEach.toFixed(3)} W each (${(nLeds * s.pLedEach).toFixed(3)} W total)`;
      const dimNote = nLeds === 4 ? ' (with 4 LEDs the current is only 3.0 mA, giving a dim glow)' : '';
      say(
        `Same current everywhere: ${iStr} mA leaving +, ${iStr} mA after the resistor, ${iStr} mA returning to −${dimNote}. ` +
        `The battery delivers ${s.pBat.toFixed(3)} W; ${ledText}, and the resistor ${s.pRes.toFixed(3)} W as warmth ` +
        `(a real LED's 2 V shifts a little with current; swapping the LED and resistor order would change nothing). ` +
        `Beads are drawn moving about ten million times faster than real electrons creep (about 8 µm/s at 21 mA in half-millimetre wire); ` +
        `the push that starts them all moving is not drawn, because at 10⁸ m/s it would be instant.`
      );
    } else {
      say(
        `No push to spare: ${vBat.toFixed(1)} V is less than ${nLeds} red LEDs' ${(2 * nLeds).toFixed(0)} V (${nLeds} × 2 V needed), ` +
        `so 0.0 mA flows everywhere and nothing lights.`
      );
    }
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() {} };
}, { label: 'Run the loop' });
