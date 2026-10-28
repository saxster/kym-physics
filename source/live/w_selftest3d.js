// Engine self-test 3D widget (used only by tests/fixture): proves three.js arrives as the shared lazy chunk.
import { Live } from './core.js';
import { makeStage, addAtom, addArrow, webglOK } from './three_kit.js';

Live.register('selftest3d', (stage, params, api) => {
  const say = api.readout();
  if (!webglOK()) { say('3D needs WebGL, which this browser does not offer.'); return {}; }
  const c = api.colors();
  const kit = makeStage(stage, api, { height: 300, distance: 7, label: 'A ball you can turn, with an arrow along its spin axis' });
  addAtom(kit.root, 'X', [0, 0, 0], { r: 1.3, label: false, color: c.electron });
  addArrow(kit.root, [0, -2, 0], [0, 2, 0], c.proton);
  say('Drag to turn it. The arrow is the axis it spins about.');
  return { destroy() {} };
}, { label: 'Turn it in 3D', three: true });
