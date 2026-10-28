import assert from 'node:assert/strict';
import {RUNGS} from '../app/scale_catalog.js';
const wave=RUNGS.find(r=>r.kind==='wave'),orbit=RUNGS.find(r=>r.kind==='orbit');
// Independent arithmetic: 500nm divided by the catalogue's 0.1nm atom reference.
assert.equal(500e-9/1e-10,5000);
assert.match(wave.story,/500 nm/);assert.match(wave.story,/5,000/);
assert.match(orbit.story,/mean radius/);assert.doesNotMatch(orbit.story,/width of Earth’s orbit/);
console.log('PASS catalogue uses one wavelength and one Earth–Sun radius consistently.');
