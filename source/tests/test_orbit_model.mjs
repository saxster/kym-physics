import assert from 'node:assert/strict';
import { eccentricAnomaly } from '../app/orbit_model.mjs';
// Kepler's area measured from the focus is ab/2 * (E-e sin E).
// Uniform time steps must give equal independent swept-area increments.
for (const e of [0, .2, .32, .7]) {
  let previousArea = 0;
  for (let i=1; i<=120; i++) {
    const M = i * 2 * Math.PI / 120;
    const E = eccentricAnomaly(M, e);
    const area = (E-e*Math.sin(E))/2;
    assert.ok(Math.abs((area-previousArea)-Math.PI/120) < 1e-10);
    previousArea = area;
  }
  assert.ok(Math.abs(eccentricAnomaly(Math.PI,e)-Math.PI)<1e-12);
}
console.log('Orbital illustration: equal swept areas at equal times verified.');
