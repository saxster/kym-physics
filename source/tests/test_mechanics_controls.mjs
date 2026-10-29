import assert from 'node:assert/strict';
import { slider } from '../live/mechanics_render.js';

function displayed(step, value, unit = '') {
  let spec;
  const api = { slider(_label, options) { spec = options; return {}; } };
  slider(api, {}, 'value', 'Physical quantity', 0, 10000, step, value, unit);
  return spec.fmt(value);
}
for (const [step,value,unit,expected] of [
  [.5,2.5,'kg','2.5 kg'],
  [.25,.25,'h','0.25 h'],
  [.25,2.25,'m/s','2.25 m/s'],
  [.05,.55,'km/s','0.55 km/s'],
  [.05,.25,'','0.25'],
  [.001,.125,'kg','0.125 kg'],
  [1e-4,.004,'m²','0.0040 m²'],
  [10,100,'W','100 W'],
]) assert.equal(displayed(step,value,unit),expected,`${step} step must not change the displayed physical quantity`);
assert.match(displayed(Math.sqrt(1.5/9.8)/100,.3,'s'),/^0\.3000 s$/, 'Derived replay steps must have bounded readable precision');
console.log('PASS literal visible physical quantities: half/quarter steps, units, scientific notation and bounded replay precision');
