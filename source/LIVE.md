# Live figures (animation and 3D)

A live figure is an ordinary still figure with a `:::live` line directly under its `:::fig` line:

```
:::fig c3_gas_temperature() | Caption...
:::live gasbox {"mode":"temperature"}
```

The still SVG stays: it prints, it shows without JavaScript or WebGL, and it is what the reader sees first.
The build adds a button under the figure ("Watch the molecules", "Turn it in 3D"); tapping it swaps the still
for the live version, with controls and a readout underneath, and a "Back to the drawing" button.
Nothing moves until the reader asks. Live figures pause when scrolled off screen. With reduced motion
switched on they open paused.

## Writing a widget (`live/w_<name>.js`)

The file name must match the registered name: `:::live gasbox` loads `live/w_gasbox.js`. A build bundles only the widgets its chapters use.

```js
import { Live } from './core.js';
Live.register('gasbox', (stage, params, api) => {
  const c = api.colors();                 // c.ink c.muted c.rule c.rule_2 c.sheet c.plate c.paper c.proton c.neutron c.electron c.green c.vol
  const k = api.canvas(640, 300, 'alt text');  // draw in these logical units; HiDPI and resizing handled
  const ctx = k.ctx;
  api.slider('Temperature', { min, max, step, value, fmt: v => `${v} K`, onInput: v => {...} });
  api.tabs(['Solid', 'Liquid', 'Gas'], i => {...});
  api.button('Add water', () => {...});
  const say = api.readout();              // say(html): live text under the figure (screen-reader polite)
  api.loop((dt, t) => { /* dt = 0 means draw one still frame (paused / reduced motion) */ });
  return { destroy() {} };
}, { label: 'Watch the molecules' });     // add three: true for 3D; static: true if nothing animates
```

Helpers: `api.draw.atom(ctx, x, y, r, 'O', {charge: '−', c})`, `api.draw.particle(ctx, x, y, r, 'p'|'n'|'e', c)`,
`api.draw.bond(...)`, `api.draw.arrow(ctx, x1, y1, x2, y2, color)`, `api.draw.text(ctx, s, x, y, {size, color, align, weight, serif})`,
`api.draw.roundRect(...)`, `api.rng(seed)` (deterministic), `api.gauss(r)`, `api.reduced`.

3D: `import { makeStage, addMolecule, addAtom, addBond, addArrow, addDashed, MOLS, RADIUS, webglOK } from './three_kit.js'`
and `import { registerSet } from './w_molecule3d.js'` to add a tabbed set of molecules to the `molecule3d` widget.
Molecule format: `{atoms: [['C', x, y, z], ...], bonds: [[i, j, order], ...]}` in ångströms (real bond lengths and angles).

## Rules

* The animation must teach the same idea as the section, and be physically honest: real ratios, real directions,
  real conservation (count atoms and charge on every frame). Say in the readout what is exaggerated or slowed down.
* Same visual language as the stills: book colours, element colours, atom symbols on atoms, signs on charges.
* Calm: no auto-play on page load, no flashing, gentle speeds. One idea per widget; at most two or three controls.
* Readout text: one or two plain sentences saying what to notice, updated as the reader changes things.
* Test: `python3 build.py --only N --out build/x.html && python3 livetest.py build/x.html /home/claude/work/live-x`
  (opens every live figure, screenshots before and after using a slider or tab, lists console errors). Check at
  `--w 1280` and `--w 390`. No console errors; nothing overflows.
