// 12.5 Series and parallel LED circuits: Kirchhoff current & voltage laws, unclipping one LED, and battery drain rate.
import { Live } from './core.js';

Live.register('seriesparallel', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 360;
  const k = api.canvas(W, H, 'Series and parallel LED circuits with 9 V battery, 330 ohm resistors, and live current arrows');

  let isParallel = false; // false = Series, true = Parallel
  let nLeds = 2;          // 1..3 (default 2)
  let unclipped = false;  // Unclip LED 1 toggle
  let phase = 0;

  const say = api.readout();

  // Control 1: Series / Parallel tabs
  api.tabs(['Series', 'Parallel'], (i) => {
    isParallel = i === 1;
    drawFrame(0);
  });

  // Control 2: LEDs slider (1 to 3, default 2)
  api.slider('LEDs', {
    min: 1, max: 3, step: 1, value: nLeds,
    fmt: (v) => `${v} LED${v > 1 ? 's' : ''}`,
    onInput: (v) => {
      nLeds = v;
      drawFrame(0);
    },
  });

  // Control 3: Unclip LED 1 toggle button
  const clipBtn = api.button('Unclip LED 1', () => {
    unclipped = !unclipped;
    clipBtn.textContent = unclipped ? 'Reclip LED 1' : 'Unclip LED 1';
    clipBtn.setAttribute('aria-pressed', String(unclipped));
    drawFrame(0);
  }, { pressed: false });

  function drawResistor(ctx, x, y, w, h, label) {
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.6;
    api.draw.roundRect(ctx, x - w / 2, y - h / 2, w, h, 3);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, label, x, y + 4, { size: 10, color: c.ink, align: 'center', weight: 600 });
  }

  function drawLed(ctx, x, y, powerW, isBroken, label) {
    const bright = !isBroken && powerW > 0.001 ? Math.min(1, 0.3 + (powerW / 0.0424) * 0.7) : 0;
    if (bright > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = c.proton;
      ctx.globalAlpha = 0.35 * bright;
      ctx.fill();
      ctx.restore();
    }
    if (isBroken) {
      // Show open clip gap
      ctx.fillStyle = c.plate;
      ctx.fillRect(x - 18, y - 10, 36, 20);
      ctx.strokeStyle = c.proton;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 16, y);
      ctx.lineTo(x - 6, y - 9);
      ctx.stroke();
      api.draw.text(ctx, 'unclipped gap', x, y - 16, { size: 10, color: c.proton, align: 'center', weight: 700 });
      return;
    }
    ctx.beginPath();
    ctx.arc(x, y, 9.5, 0, Math.PI * 2);
    ctx.fillStyle = bright > 0 ? c.proton : c.sheet;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    api.draw.text(ctx, label, x, y - 15, { size: 10.5, color: c.ink, align: 'center', weight: 600 });
    api.draw.text(ctx, `${powerW.toFixed(3)} W`, x, y + 23, { size: 10, color: c.muted, align: 'center' });
  }

  function drawBatteryAndMeter(ctx, x, topY, botY, iBatMa, drainFactorText) {
    const midY = (topY + botY) / 2;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.8;
    api.draw.roundRect(ctx, x - 26, midY - 28, 52, 56, 5);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, '9.0 V', x, midY + 4, { size: 12, color: c.ink, align: 'center', weight: 700 });
    api.draw.text(ctx, '+', x, midY - 34, { size: 12, color: c.proton, align: 'center', weight: 700 });
    api.draw.text(ctx, '−', x, midY + 44, { size: 12, color: c.electron, align: 'center', weight: 700 });

    // Meter card beside the battery
    const mx = 16, my = midY + 62, mw = 152, mh = 54;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    api.draw.roundRect(ctx, mx, my, mw, mh, 5);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, `Battery: ${Math.round(iBatMa)} mA`, mx + 10, my + 21, {
      size: 11.5, color: c.proton, weight: 700,
    });
    api.draw.text(ctx, drainFactorText, mx + 10, my + 40, {
      size: 10.5, color: c.muted,
    });
  }

  function drawSeries(ctx) {
    const I = unclipped ? 0 : (9.0 - 2.0 * nLeds) / 330;
    const iMa = I * 1000;
    const vRes = unclipped ? 0 : 9.0 - 2.0 * nLeds;
    const vLed = unclipped ? 0 : 2.0;
    const pLed = vLed * I;

    // Kirchhoff voltage check when closed: 2*n + vRes === 9.0
    if (!unclipped && Math.abs(2.0 * nLeds + vRes - 9.0) > 1e-9) {
      throw new Error('Kirchhoff voltage sum violated in series');
    }

    const leftX = 110, rightX = 560, topY = 92, botY = 264;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.2;
    ctx.strokeRect(leftX, topY, rightX - leftX, botY - topY);

    const drainRatio = unclipped ? '0 (stopped)' : `×${(I / (7 / 330)).toFixed(2)} as fast`;
    drawBatteryAndMeter(ctx, leftX, topY, botY, iMa, `Runs down ${drainRatio}`);

    // Shared 330 ohm resistor on top left
    drawResistor(ctx, 215, topY, 82, 24, `330 Ω (${vRes.toFixed(0)} V)`);

    // LEDs along top right
    for (let i = 0; i < nLeds; i++) {
      const lx = 320 + i * 95;
      drawLed(ctx, lx, topY, pLed, i === 0 && unclipped, `LED ${i + 1} (${vLed.toFixed(0)} V)`);
    }

    // Current arrows and identical labels round the single path
    const iStr = `${Math.round(iMa)} mA`;
    api.draw.arrow(ctx, 145, topY - 16, 170, topY - 16, c.proton, 2.2, 7);
    api.draw.text(ctx, iStr, 158, topY - 23, { size: 11, color: c.proton, align: 'center', weight: 700 });

    api.draw.arrow(ctx, rightX + 16, 155, rightX + 16, 195, c.proton, 2.2, 7);
    api.draw.text(ctx, iStr, rightX + 24, 180, { size: 11, color: c.proton, weight: 700 });

    api.draw.arrow(ctx, 370, botY + 18, 320, botY + 18, c.proton, 2.2, 7);
    api.draw.text(ctx, `One path: ${iStr} everywhere`, 345, botY + 34, {
      size: 11.5, color: c.proton, align: 'center', weight: 700,
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

  function drawParallel(ctx) {
    const iBranchA = (9.0 - 2.0) / 330; // 21.212 mA
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

    // Kirchhoff current check: sum of branch currents equals battery current
    const sumBr = branches.reduce((acc, b) => acc + b.iA, 0);
    if (Math.abs(sumBr - iBatA) > 1e-12) {
      throw new Error('Kirchhoff current law violated in parallel');
    }

    const leftX = 110, forkX = 215, joinX = 535, topY = 64, botY = 292;
    const branchYs = [96, 178, 260].slice(0, nLeds);
    const lastBranchY = branchYs[branchYs.length - 1];

    // Main battery rails to the fork and join nodes
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(leftX, branchYs[0]);
    ctx.lineTo(forkX, branchYs[0]);
    ctx.moveTo(forkX, branchYs[0]);
    ctx.lineTo(forkX, lastBranchY);
    ctx.moveTo(joinX, branchYs[0]);
    ctx.lineTo(joinX, lastBranchY);
    ctx.moveTo(joinX, lastBranchY);
    ctx.lineTo(leftX, lastBranchY);
    ctx.lineTo(leftX, branchYs[0]);
    ctx.stroke();

    drawBatteryAndMeter(ctx, leftX, branchYs[0], lastBranchY, iBatMa, `Battery runs down ×${activeCount} as fast`);

    // Total battery current arrows before the fork and after the join
    api.draw.arrow(ctx, 138, branchYs[0] - 14, 185, branchYs[0] - 14, c.proton, 2.4, 7);
    api.draw.text(ctx, `${Math.round(iBatMa)} mA`, 162, branchYs[0] - 20, {
      size: 11.5, color: c.proton, align: 'center', weight: 700,
    });
    api.draw.text(ctx, '9 V across each branch', (forkX + joinX) / 2, 34, {
      size: 12, color: c.ink, align: 'center', weight: 700,
    });

    // Draw each parallel branch with its own 330 ohm resistor + LED
    for (let i = 0; i < nLeds; i++) {
      const by = branchYs[i];
      const br = branches[i];
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(forkX, by);
      ctx.lineTo(joinX, by);
      ctx.stroke();

      // Junction dots
      for (const jx of [forkX, joinX]) {
        ctx.beginPath();
        ctx.arc(jx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = c.ink;
        ctx.fill();
      }

      drawResistor(ctx, 315, by, 78, 22, br.broken ? '330 Ω (0 V)' : '330 Ω (7 V)');
      drawLed(ctx, 435, by, br.pLed, br.broken, `LED ${i + 1} (2 V)`);

      api.draw.arrow(ctx, 232, by - 12, 264, by - 12, br.broken ? c.muted : c.proton, 1.8, 6);
      api.draw.text(ctx, `${Math.round(br.iMa)} mA`, 248, by - 18, {
        size: 10.5, color: br.broken ? c.muted : c.proton, align: 'center', weight: 700,
      });
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

  function drawFrame(dt) {
    phase += dt;
    const ctx = k.ctx;
    k.clear(c.plate);
    if (!isParallel) drawSeries(ctx);
    else drawParallel(ctx);
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() {} };
}, { label: 'Wire them two ways' });
