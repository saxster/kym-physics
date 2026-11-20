import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fmtSpeedPure,
  computeForcesState,
  beakerTiltEq,
  GRAVITIES,
  energyTrackAt,
} from '../live/phet_models.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENHANCEMENTS_PATH = path.resolve(HERE, '../live/enhancements.js');

async function loadEnhancements() {
  const src = fs.readFileSync(ENHANCEMENTS_PATH, 'utf8');
  assert.equal(/^\s*import\s+/m.test(src), false, 'enhancements.js must stay zero-import');
  const b64 = Buffer.from(src, 'utf8').toString('base64');
  const mod = await import(`data:text/javascript;base64,${b64}`);
  return mod.ENHANCEMENTS;
}

test('ENHANCEMENTS contract: spoiler-free prompts, valid presets, and mentorTips coverage', async () => {
  const ENHANCEMENTS = await loadEnhancements();
  const keys = Object.keys(ENHANCEMENTS);
  assert.ok(keys.length >= 39, `Expected >= 39 widgets, got ${keys.length}`);

  let enrichedCount = 0;
  for (const id of keys) {
    const entry = ENHANCEMENTS[id];
    assert.ok(entry.challenge && typeof entry.challenge.prompt === 'string', `${id}: missing challenge prompt`);
    assert.ok(typeof entry.challenge.check === 'function', `${id}: missing challenge check`);

    const prompt = entry.challenge.prompt;
    assert.equal(/\(index\s*\d+\)/i.test(prompt), false, `${id}: tab index spoiler leaked in prompt: ${prompt}`);
    assert.equal(/\(7\.9\s*km\/s|\(1\.1\s*m\b|\(Day\s*7\.4/i.test(prompt), false, `${id}: numeric spoiler leaked in prompt: ${prompt}`);

    if (entry.presets) {
      assert.ok(Array.isArray(entry.presets) && entry.presets.length >= 1, `${id}: presets must be non-empty array`);
      for (const p of entry.presets) {
        assert.ok(typeof p.name === 'string' && p.name.trim().length > 0, `${id}: preset name required`);
        assert.ok(typeof p.prompt === 'string' && p.prompt.trim().length > 0, `${id}: preset prompt required`);
        assert.ok(p.state && typeof p.state === 'object', `${id}: preset state must be object`);
        const roundTrip = JSON.parse(JSON.stringify(p.state));
        assert.deepEqual(roundTrip, p.state, `${id}: preset state must be clean JSON`);
      }
    }

    if (entry.mentorTips) {
      for (const field of ['openPlay', 'misconception', 'dinnerQuestion', 'cambridgeUnit']) {
        assert.ok(
          typeof entry.mentorTips[field] === 'string' && entry.mentorTips[field].trim().length > 0,
          `${id}: mentorTips.${field} must be non-empty`
        );
      }
    }

    if (id !== 'selftest') {
      assert.ok(Array.isArray(entry.presets) && entry.presets.length >= 1, `${id}: presets required for chapter widget`);
      assert.ok(entry.mentorTips && typeof entry.mentorTips === 'object', `${id}: mentorTips required for chapter widget`);
    }

    if (entry.presets?.length && entry.mentorTips) enrichedCount += 1;
  }

  assert.ok(enrichedCount >= 38, `Expected >= 38 enriched widgets with presets + mentorTips, got ${enrichedCount}`);
});

test('energytrack.yourNumbers and draft_canvas.fmtSpeed honor active gravity and pure formatting', async () => {
  const ENHANCEMENTS = await loadEnhancements();
  const makeState = (h0, mu, mIdx, gIdx) => ({
    num(prefix, fallback = 0) {
      if (prefix === 'Release height') return h0;
      if (prefix === 'Friction') return mu;
      return fallback;
    },
    tab(idx = 0) {
      return idx === 0 ? mIdx : idx === 2 ? gIdx : 0;
    },
  });

  const moon = ENHANCEMENTS.energytrack.yourNumbers(makeState(1.0, 0.1, 0, 1));
  assert.match(moon, /× 1\.6 × 1\.00 = 0\.032 J/, `Expected Moon g=1.6 in yourNumbers, got: ${moon}`);
  const jup = ENHANCEMENTS.energytrack.yourNumbers(makeState(1.0, 0.0, 1, 2));
  assert.match(jup, /× 24\.8 × 1\.00 = 1\.488 J/, `Expected Jupiter g=24.8 in yourNumbers, got: ${jup}`);

  const dcSrc = fs.readFileSync(path.resolve(HERE, '../live/draft_canvas.js'), 'utf8');
  assert.match(dcSrc, /fmtSpeedPure/, 'draft_canvas.js must delegate fmtSpeed to fmtSpeedPure');

  // Direct h < hRef negative relative PE invariant
  const belowDatum = energyTrackAt({ m: 0.06, g: 9.8, h: 0.2, h0: 0.8, hRef: 1.0, thermalPerKg: 0 });
  assert.ok(belowDatum.peRel < 0, 'peRel must become negative when bead is below datum hRef');
  assert.ok(belowDatum.eTotRel < 0, 'eTotRel must become negative when release height h0 < hRef');
  assert.ok(Math.abs((belowDatum.peRel + belowDatum.ke + belowDatum.eTherm) - belowDatum.eTotRel) < 1e-9);
});

test('computeForcesState & beakerTiltEq: cruising equilibrium, slosh direction, and rough static friction', () => {
  // Balanced pulls while cruising at v = 6.0 m/s on smooth floor -> fNet = 0, a = 0, flat water
  for (const pull of [0, 150, 300]) {
    const s = computeForcesState({ pullL: pull, pullR: pull, rough: false, v: 6.0, mass: 50 });
    assert.equal(s.fNet, 0);
    assert.equal(s.a, 0);
    assert.equal(beakerTiltEq(s.a), 0);
  }

  // Accelerating right -> water sloshes up left -> beakerTiltEq(a) < 0
  const accelRight = computeForcesState({ pullL: 100, pullR: 350, rough: false, v: 0, mass: 50 });
  assert.equal(accelRight.fNet, 250);
  assert.ok(accelRight.a > 0);
  assert.ok(beakerTiltEq(accelRight.a) < 0);

  // Accelerating left -> water sloshes up right -> beakerTiltEq(a) > 0
  const accelLeft = computeForcesState({ pullL: 400, pullR: 150, rough: false, v: 0, mass: 50 });
  assert.ok(accelLeft.a < 0);
  assert.ok(beakerTiltEq(accelLeft.a) > 0);

  // Rough floor static friction cancels applied pull <= 100 N from rest
  for (const pullR of [0, 40, 100]) {
    const rest = computeForcesState({ pullL: 0, pullR, rough: true, v: 0, mass: 50, fricMax: 100 });
    assert.equal(rest.fNet, 0);
    assert.equal(rest.a, 0);
    assert.equal(rest.fFric, -pullR);
  }
});

test('energyTrackAt: conservation holds across >= 200 gravity, mass, datum hRef, and thermal states', () => {
  let count = 0;
  for (const grav of GRAVITIES) {
    for (const m of [0.02, 0.06]) {
      for (const hRef of [0, 0.4, 0.8, 1.2]) {
        for (const h0 of [0.5, 1.0, 1.5]) {
          for (const thermFrac of [0, 0.25, 0.5]) {
            const thermalPerKg = thermFrac * grav.g * h0;
            const hMax = Math.max(0, h0 - thermalPerKg / grav.g);
            for (const hFrac of [0, 0.5, 1.0]) {
              const h = hFrac * hMax;
              const res = energyTrackAt({ m, g: grav.g, h, h0, hRef, thermalPerKg });
              const sumRel = res.peRel + res.ke + res.eTherm;
              assert.ok(Math.abs(sumRel - res.eTotRel) < 1e-9, `Conservation drift at case ${count}`);
              assert.ok(Math.abs(res.peRel - m * grav.g * (h - hRef)) < 1e-12, `Exact relative PE at case ${count}`);
              assert.ok(res.ke >= 0 && res.v >= 0);
              count += 1;
            }
          }
        }
      }
    }
  }
  assert.ok(count >= 200, `Expected >= 200 energy combinations, ran ${count}`);

  // Slight turnaround numerical overshoot should never throw or break conservation
  const edge = energyTrackAt({ m: 0.06, g: 9.8, h: 1.00001, h0: 1.0, hRef: 0.4, thermalPerKg: 0 });
  assert.equal(edge.ke, 0);
  assert.ok(Math.abs((edge.peRel + edge.ke + edge.eTherm) - edge.eTotRel) < 1e-9);
});

test('fmtSpeedPure: formats m/s and converts cleanly to km/h and back', () => {
  assert.equal(fmtSpeedPure(10, 'si'), '10.0 m/s');
  assert.equal(fmtSpeedPure(10, 'kmh'), '36.0 km/h');
  for (const mps of [0, 1.5, 4.0, 7.9, 12.5]) {
    const kmhStr = fmtSpeedPure(mps, 'kmh');
    const kmh = parseFloat(kmhStr);
    assert.ok(Math.abs(kmh / 3.6 - mps) < 0.05, `Round-trip mismatch for ${mps} -> ${kmhStr}`);
  }
});
