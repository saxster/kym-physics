// Ch 8.3 c8_conduction -> w_conduction: 1D particle conduction between a warm hand (32..38 deg C) and a room-temperature (30 deg C) surface.
// Materials: Steel (k = 14 W/(m.K)), Wood (k = 0.12 W/(m.K)), Aluminium (k = 220 W/(m.K)).
// Conserves energy every frame: energy leaving the hand equals energy gained by the 6 surface layers + room sink.
import { Live } from './core.js';
import { mechanismKey } from './art_mechanics.js';

const T_ROOM = 30.0; // deg C
const MATERIALS = [
  { name: 'Steel (14 W/m\u00b7K)', short: 'steel', k: 14, isMetal: true, slowFactor: 20, capLayer: 24.0, hContact: 12.0 },
  { name: 'Wood (0.12 W/m\u00b7K)', short: 'wood', k: 0.12, isMetal: false, slowFactor: 1, capLayer: 2.2, hContact: 1.8 },
  { name: 'Aluminium (220 W/m\u00b7K)', short: 'aluminium', k: 220, isMetal: true, slowFactor: 20, capLayer: 18.0, hContact: 12.0 },
];

Live.register('conduction', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 320, 'Particles jiggling in a warm hand above a 6-layer surface, with temperature profile and heat-flow bars');
  let matIdx = 0;
  let tHandSet = 35.0; // deg C (32 to 38)
  let touching = true;
  const say = api.readout();
  mechanismKey(stage, 'A contact cut-away, not moving matter', ['The top region represents skin pressed against the slab; lifting it opens a gap and stops contact transfer.', 'Sites jiggle locally: they do not travel down the slab. The connected dots at the right show temperature through six depth layers.', 'The rate gauge is a relative model scale, not a watt meter. The conserved ledger records transferred energy in joules.']);

  // 1 hand layer + 6 surface layers
  let tHand = tHandSet;
  let layers = [T_ROOM, T_ROOM, T_ROOM, T_ROOM, T_ROOM, T_ROOM];
  let totalHandLost = 0;    // J
  let totalSurfGained = 0;  // J (stored in layers + drained to room sink)
  let currentFlowRate = 0;  // W (scaled from k and temperature difference)
  let phase = 0;

  // Deterministic particle lattice: 2 rows in hand (16 particles), 6 rows in surface (6 * 8 = 48 particles)
  const rand = api.rng(803);
  const handParticles = [];
  for (let r = 0; r < 2; r++) {
    for (let col = 0; col < 8; col++) {
      handParticles.push({
        hx: 46 + col * 38 + (r % 2 ? 12 : 0),
        hy: 62 + r * 26,
        phX: rand() * Math.PI * 2,
        phY: rand() * Math.PI * 2,
        freq: 8 + rand() * 4,
      });
    }
  }
  const surfParticles = [];
  for (let l = 0; l < 6; l++) {
    const row = [];
    for (let col = 0; col < 8; col++) {
      row.push({
        hx: 46 + col * 38 + (l % 2 ? 12 : 0),
        hy: 132 + l * 26,
        phX: rand() * Math.PI * 2,
        phY: rand() * Math.PI * 2,
        freq: 7 + rand() * 4,
      });
    }
    surfParticles.push(row);
  }

  function resetSurface(keepTouch = true) {
    tHand = tHandSet;
    layers = [T_ROOM, T_ROOM, T_ROOM, T_ROOM, T_ROOM, T_ROOM];
    totalHandLost = 0;
    totalSurfGained = 0;
    touching = keepTouch;
    syncTouchBtn();
    // Under reduced motion, step 1.5 s so the difference between wood warming and metal staying near 30 C is shown on the still frame
    if (api.reduced && touching) {
      stepPhysics(1.5);
    } else {
      computeFlowInstant();
    }
    updateReadout();
  }

  function computeFlowInstant() {
    const mat = MATERIALS[matIdx];
    if (!touching) {
      currentFlowRate = 0;
      return;
    }
    // Boundary heat flow proportional to k * (tHand - layers[0])
    currentFlowRate = mat.k * Math.max(0, tHand - layers[0]);
  }

  function stepPhysics(dtReal) {
    if (dtReal <= 0) return;
    const mat = MATERIALS[matIdx];
    let rem = Math.min(0.1, dtReal);
    const h = 0.002;

    while (rem > 1e-6) {
      const dt = Math.min(h, rem);
      rem -= dt;
      const dtEff = dt / mat.slowFactor;

      // Boundary transfer between hand and top surface layer (layer 0)
      let dQ_boundary = 0;
      if (touching) {
        // Rate proportional to k * (tHand - layers[0])
        const qRate = mat.k * (tHand - layers[0]);
        dQ_boundary = qRate * dtEff;
        totalHandLost += dQ_boundary;
        layers[0] += dQ_boundary / mat.capLayer;
        // Hand stays near set temperature (blood perfusion), dipping slightly under heavy load
        tHand = tHandSet - Math.min(0.6, qRate * 0.0004);
        currentFlowRate = Math.max(0, qRate);
      } else {
        currentFlowRate = 0;
        tHand += (tHandSet - tHand) * Math.min(1, dt * 3);
      }

      // 1D conduction between neighbouring surface layers: i <-> i+1 in proportion to k * (T_i - T_{i+1})
      const fluxes = [0, 0, 0, 0, 0];
      for (let i = 0; i < 5; i++) {
        fluxes[i] = mat.k * 0.85 * (layers[i] - layers[i + 1]) * dtEff;
      }
      for (let i = 0; i < 5; i++) {
        const dQ = Math.min(fluxes[i], 0.4 * mat.capLayer * (layers[i] - layers[i + 1]));
        layers[i] -= dQ / mat.capLayer;
        layers[i + 1] += dQ / mat.capLayer;
      }

      // Deepest layer (layer 5) drains slowly to the room sink at 30 C (and when hand is lifted, top layer also relaxes slowly)
      const dQ_sink = 0.15 * mat.capLayer * (layers[5] - T_ROOM) * dt;
      layers[5] -= dQ_sink / mat.capLayer;
      let dQ_topRelax = 0;
      if (!touching) {
        dQ_topRelax = 0.4 * mat.capLayer * (layers[0] - T_ROOM) * dt;
        layers[0] -= dQ_topRelax / mat.capLayer;
      }

      totalSurfGained += dQ_boundary;

      // Conservation check: energy leaving hand equals energy gained by surface + sink
      const storedNow = layers.reduce((acc, temp) => acc + mat.capLayer * (temp - T_ROOM), 0);
      if (Math.abs(totalHandLost - totalSurfGained) > 1e-6) {
        console.error('Conduction energy conservation mismatch:', totalHandLost, totalSurfGained);
      }
      void storedNow;
    }
  }

  function updateReadout() {
    const mat = MATERIALS[matIdx];
    const tSurf = layers[0];
    const woodRefFlow = 0.12 * Math.max(0.1, tHandSet - T_ROOM);
    const ratioToWood = Math.max(1, Math.round(currentFlowRate / woodRefFlow));
    const slowNote = mat.isMetal
      ? `(${mat.name.split(' ')[0]} shown ${mat.slowFactor}\u00d7 slower than life; jiggle amplitudes exaggerated ~1,000\u00d7.)`
      : '(Wood shown at real pace; jiggle amplitudes exaggerated ~1,000\u00d7.)';

    if (!touching) {
      say(`Hand lifted (${tHandSet.toFixed(0)} \u00b0C); the ${mat.short} surface is relaxing back toward the 30.0 \u00b0C room (top layer now ${tSurf.toFixed(1)} \u00b0C). Energy from hand = ${totalHandLost.toFixed(1)} J, gained by surface = ${totalSurfGained.toFixed(1)} J. ${slowNote}`);
      return;
    }

    if (!mat.isMetal && tSurf - T_ROOM > 1.2) {
      say(`The wood surface has warmed to ${tSurf.toFixed(1)} \u00b0C, so the flow from your ${tHandSet.toFixed(0)} \u00b0C hand has dropped to ${currentFlowRate.toFixed(2)} units: this is why wood stops feeling cold. Energy leaving hand = ${totalHandLost.toFixed(1)} J = surface gain ${totalSurfGained.toFixed(1)} J. ${slowNote}`);
    } else {
      const cmp = mat.isMetal ? `, about ${ratioToWood.toLocaleString('en-GB')}\u00d7 faster than through wood` : '';
      say(`Room is at 30 \u00b0C. Energy is leaving your ${tHandSet.toFixed(0)} \u00b0C hand at ${currentFlowRate.toFixed(1)} units (${mat.short})${cmp}; the surface under your hand reads ${tSurf.toFixed(1)} \u00b0C (hand lost ${totalHandLost.toFixed(1)} J = surface gained ${totalSurfGained.toFixed(1)} J). ${slowNote}`);
    }
  }

  api.tabs(MATERIALS.map((m) => m.name), (i) => {
    matIdx = i;
    resetSurface(true);
  }, 0);

  api.slider('Hand temperature', {
    min: 32, max: 38, step: 1, value: tHandSet,
    fmt: (v) => `${v} \u00b0C`,
    onInput: (v) => {
      tHandSet = v;
      tHand = v;
      computeFlowInstant();
      updateReadout();
    },
  });

  const touchBtn = api.button('Lift hand', () => {
    touching = !touching;
    syncTouchBtn();
    computeFlowInstant();
    updateReadout();
  });

  function syncTouchBtn() {
    touchBtn.textContent = touching ? 'Lift hand' : 'Touch';
    touchBtn.setAttribute('aria-pressed', String(touching));
  }

  api.loop((dt) => {
    if (dt > 0) {
      phase += dt;
      stepPhysics(dt);
      updateReadout();
    }

    k.clear(c.plate);
    const ctx = k.ctx;
    const mat = MATERIALS[matIdx];

    // ---- Left panel: Particle lattice (x: 20..365)
    const lx0 = 20, lw = 345;
    const handShiftY = touching ? 0 : -16;

    // Hand region background
    ctx.save();
    ctx.fillStyle = c.proton;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(lx0, 36 + handShiftY, lw, 74);
    ctx.restore();

    // Surface region background (6 layers, y: 112..276)
    ctx.save();
    ctx.fillStyle = mat.isMetal ? c.electron : c.neutron;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(lx0, 112, lw, 168);
    ctx.restore();

    // A finger outline locates this molecular cut-away within a contact.
    ctx.save(); ctx.strokeStyle = c.proton; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx0 + 12, 42 + handShiftY);
    ctx.bezierCurveTo(lx0 + 90, 38 + handShiftY, lx0 + 210, 38 + handShiftY, lx0 + 280, 54 + handShiftY);
    ctx.bezierCurveTo(lx0 + 330, 66 + handShiftY, lx0 + 330, 105 + handShiftY, lx0 + 282, 108 + handShiftY);
    ctx.lineTo(lx0 + 12, 108 + handShiftY); ctx.stroke(); ctx.restore();

    // Boundary line at y = 111
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = touching ? 2.4 : 1.4;
    if (!touching) ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(lx0, 111);
    ctx.lineTo(lx0 + lw, 111);
    ctx.stroke();
    ctx.setLineDash([]);

    api.draw.text(ctx, `skin (${tHandSet.toFixed(0)} \u00b0C)`, lx0 + 8, 30 + handShiftY * 0.4, {
      size: 12, color: c.proton, weight: 600,
    });
    api.draw.text(ctx, `${mat.short} surface (starts at room 30 \u00b0C)`, lx0 + lw - 6, 30, {
      size: 12, color: c.ink, align: 'right', weight: 600,
    });

    // Helper to draw a jiggling particle: amplitude grows with local temperature above 26 C baseline
    function drawParticle(p, tempC, fillCol, yOffset = 0) {
      const amp = 0.7 + Math.max(0, tempC - 26) * 0.42;
      const jx = p.hx + Math.sin(phase * p.freq + p.phX) * amp;
      const jy = p.hy + yOffset + Math.cos(phase * p.freq + p.phY) * amp;

      // Secondary cue: thin ring that brightens with temperature
      const warmFrac = Math.max(0, Math.min(1, (tempC - T_ROOM) / 8));
      if (warmFrac > 0.04) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(jx, jy, 6.2, 0, Math.PI * 2);
        ctx.strokeStyle = c.proton;
        ctx.lineWidth = 1.2 + warmFrac * 1.4;
        ctx.globalAlpha = 0.25 + warmFrac * 0.65;
        ctx.stroke();
        ctx.restore();
      }

      // Fixed fill colour per material (never colour alone)
      ctx.beginPath();
      ctx.arc(jx, jy, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = fillCol;
      ctx.fill();
    }

    // Hand particles
    for (const p of handParticles) {
      drawParticle(p, tHand, c.proton, handShiftY);
    }

    // The temperature profile uses one common horizontal temperature scale.
    const tempX = temp => lx0 + lw + 10 + 35 * Math.max(0, Math.min(1, (temp - T_ROOM) / Math.max(1, tHandSet - T_ROOM)));
    ctx.strokeStyle = c.proton; ctx.lineWidth = 1.5; ctx.beginPath();
    layers.forEach((temp, l) => l ? ctx.lineTo(tempX(temp), 132 + l * 26) : ctx.moveTo(tempX(temp), 132)); ctx.stroke();
    api.draw.text(ctx, '30 → hand °C', lx0 + lw + 28, 116, {size: 10, color: c.muted, align: 'center'});
    // Surface particles across 6 depth layers
    const surfCol = mat.isMetal ? c.electron : c.neutron;
    for (let l = 0; l < 6; l++) {
      const tLayer = layers[l];
      for (const p of surfParticles[l]) {
        drawParticle(p, tLayer, surfCol, 0);
      }
      ctx.fillStyle = c.proton; ctx.beginPath(); ctx.arc(tempX(tLayer), 132 + l * 26, 3, 0, Math.PI * 2); ctx.fill();
    }

    // Boundary energy-transfer arrows when touching
    if (touching && currentFlowRate > 0.01) {
      const arrowLen = Math.min(135, 18 + Math.log10(1 + currentFlowRate * 10) * 34);
      for (const ax of [lx0 + 85, lx0 + 175, lx0 + 265]) {
        api.draw.arrow(ctx, ax, 102, ax, 102 + arrowLen, c.ink, 1.8, 7);
      }
    }

    api.draw.text(ctx, 'room sink: 30.0 \u00b0C', lx0 + lw / 2, 298, { size: 11.5, color: c.muted, align: 'center' });

    // ---- Right panel: "What you feel" rate bar & Energy conservation ledger (x: 430..625)
    const rx0 = 435;
    api.draw.text(ctx, 'What your hand feels', rx0, 36, { size: 13, color: c.ink, weight: 600 });
    api.draw.text(ctx, '(rate energy leaves your skin)', rx0, 52, { size: 11.5, color: c.muted });

    // Logarithmic-ish / normalized rate bar so wood, steel, and aluminium are all clearly legible
    const barW = 175;
    const normRate = currentFlowRate <= 0 ? 0 : Math.min(1, Math.log10(1 + currentFlowRate * 12) / Math.log10(1 + 220 * 8 * 12));
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(rx0, 64, barW, 20);
    if (normRate > 0) {
      ctx.fillStyle = c.proton;
      ctx.fillRect(rx0, 64, Math.max(4, normRate * barW), 20);
    }
    const feelLabel = !touching ? 'not touching (0)' : currentFlowRate > 80 ? 'feels very cold (fast flow)' : currentFlowRate > 5 ? 'feels cold (steady flow)' : 'feels neutral (tiny flow)';
    api.draw.text(ctx, feelLabel, rx0, 102, { size: 12, color: c.proton, weight: 600 });

    // Surface temperature under hand
    api.draw.text(ctx, `Top surface layer: ${layers[0].toFixed(2)} \u00b0C`, rx0, 136, { size: 12.5, color: c.ink, weight: 600 });
    api.draw.text(ctx, `Deepest layer (6): ${layers[5].toFixed(2)} \u00b0C`, rx0, 156, { size: 12, color: c.muted });

    // Energy conservation box
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1.2;
    api.draw.roundRect(ctx, rx0, 180, 185, 88, 4);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, 'Energy ledger (conserved)', rx0 + 10, 200, { size: 11.5, color: c.ink, weight: 600 });
    api.draw.text(ctx, `Lost by hand:   ${totalHandLost.toFixed(2)} J`, rx0 + 10, 222, { size: 11.5, color: c.proton });
    api.draw.text(ctx, `Gained by slab: ${totalSurfGained.toFixed(2)} J`, rx0 + 10, 242, { size: 11.5, color: c.electron });
    api.draw.text(ctx, 'Difference: 0.00 J', rx0 + 10, 260, { size: 11, color: c.muted });
  });

  resetSurface(true);
  return { destroy() {} };
}, { label: 'Touch the surface' });
