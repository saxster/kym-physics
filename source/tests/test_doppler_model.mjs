import assert from 'node:assert/strict';
import { sampledWavefronts, SOUND_SPEED_MS, CREST_STRIDE } from '../live/doppler_model.mjs';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const params = { sourceStartXM: -50, sourceSpeedMs: 80 / 3.6, frequencyHz: 300 };
const at = timeS => sampledWavefronts({ ...params, timeS });

// A crest that already exists must expand in place in the air. This fails for
// the former drawing, where each fixed-radius circle followed the moving horn.
const earlier = at(0.19).find(front => front.index === 2);
const later = at(0.20).find(front => front.index === 2);
close(later.centreXM, earlier.centreXM);
close(later.radiusM - earlier.radiusM, SOUND_SPEED_MS * 0.01);
assert.ok(later.radiusM > earlier.radiusM);

// Independent physical expectations: adjacent forward/backward crests have
// spacing (c-v)T and (c+v)T, respectively, where T samples twelve sound cycles.
const fronts = at(0.30);
const old = fronts.find(front => front.index === 2);
const next = fronts.find(front => front.index === 3);
const interval = CREST_STRIDE / params.frequencyHz;
close((old.centreXM + old.radiusM) - (next.centreXM + next.radiusM), (SOUND_SPEED_MS - params.sourceSpeedMs) * interval);
close((next.centreXM - next.radiusM) - (old.centreXM - old.radiusM), (SOUND_SPEED_MS + params.sourceSpeedMs) * interval);

// Display slowing must slow source motion and sound propagation by the same
// factor; the physical ratio v/c cannot change between silent and audio passes.
const realDt = 0.10;
const silentDt = realDt / 10;
close((at(0.19 + silentDt).find(front => front.index === 2).radiusM - earlier.radiusM) / (params.sourceSpeedMs * silentDt), SOUND_SPEED_MS / params.sourceSpeedMs);

// A stationary horn emits concentric expanding rings. Doubling frequency halves
// their spacing; at a pass reset no pre-reset or future crest may be invented.
const stopped = sampledWavefronts({ ...params, sourceSpeedMs: 0, timeS: 0.3 });
assert.ok(stopped.every(front => front.centreXM === params.sourceStartXM));
const firstRing = sampledWavefronts({ ...params, timeS: 0 });
assert.equal(firstRing.length, 1);
close(firstRing[0].radiusM, 0);
assert.deepEqual(at(-0.1), []);
const doubled = sampledWavefronts({ ...params, sourceSpeedMs: 0, frequencyHz: 600, timeS: 0.3 });
close(doubled[0].radiusM - doubled[1].radiusM, (stopped[0].radiusM - stopped[1].radiusM) / 2);
for (const now of [0, 0.01, 0.12, 2, 7, 100]) {
  const sample = at(now);
  assert.ok(sample.every(front => front.emittedAtS >= 0 && front.emittedAtS <= now + 1e-9));
  assert.ok(sample.every(front => front.radiusM >= 0 && front.radiusM <= 220 + 1e-7));
  assert.deepEqual(sample, at(now), 'A paused clock must preserve every crest');
}
console.log('Doppler wavefront physics: fixed emission centres, expansion, spacing, clocks and reset pass');
