// 9.1 Four times the length, twice the period: the Atlas of Physics figure (6.6) of two springs and two pendulums,
// turned in 3D in the book's own paper and ink. The figure lives in live/atlas/ (vendored from the atlas by its
// tools/vendor.mjs; edit it there, not here). Every number on it comes from the atlas's checked model.
import { Live } from './core.js';
import { mountAtlas } from './atlas/adapters/kym-live.js';
import { CHAPTER } from './atlas/physics/oscillations/chapter.js';
import { DOUBLE, periodPendulum } from './atlas/physics/oscillations/model.js';

const short = periodPendulum(DOUBLE.L), long = periodPendulum(DOUBLE.L4);
const m = x => (x < 1 ? x.toFixed(2) : x.toFixed(1));
// this book's words for the readout; the numbers are the atlas model's
const readout = ({ t }) => `Short pendulum, ${m(DOUBLE.L)} m: there and back every ${short.toFixed(2)} s. ` +
  `Long one, ${m(DOUBLE.L4)} m (four times as long): every ${long.toFixed(2)} s, twice as long.<br>` +
  `Swings so far: short ${(t / short).toFixed(1)}, long ${(t / long).toFixed(1)}.`;

Live.register('atlas_period', (stage, params, api) => mountAtlas(stage, params, api, CHAPTER, { page: 6, height: 400, readout }), {
  label: 'Turn the springs and pendulums in 3D', three: true,
});
