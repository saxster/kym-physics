# Live figures (animation, 3D, sound and sensors)

A live figure is an ordinary still figure with a `:::live` line directly under its `:::fig` line:

```
:::fig c4_fall() | Caption...
:::live fall {"drag": true}
```

The still SVG stays: it prints, it shows without JavaScript or WebGL, and it is what the reader sees first. The build
adds a button under the figure; tapping it swaps the still for the live version, with controls and a readout, and a
"Back to the drawing" button. Nothing moves or sounds until the reader asks. Live figures pause when scrolled off
screen; with reduced motion they open paused.

**Loading.** In the website build every widget is its own small chunk (`site/live/w_<name>-<hash>.js`), fetched only
when the reader taps its button; three.js is one shared chunk fetched by the first 3D figure. The service worker
precaches all of them for offline use. `--out` builds inline everything into one file.

## Writing a widget (`live/w_<name>.js`)

The file name must match the registered name: `:::live fall` loads `live/w_fall.js`.

```js
import { Live } from './core.js';
Live.register('fall', (stage, params, api) => {
  const c = api.colors();                 // c.ink c.muted c.rule c.sheet c.plate c.paper c.proton c.neutron c.electron c.green c.vol
  const k = api.canvas(640, 300, 'alt text');  // draw in these logical units; HiDPI and resizing handled
  api.slider('Air resistance', { min, max, step, value, fmt: v => `${v} N`, onInput: v => {...} });
  api.tabs(['Feather', 'Hammer'], i => {...});
  api.button('Drop', () => {...});
  const say = api.readout();              // say(html): live text under the figure (screen-reader polite)
  api.loop((dt, t) => { /* dt = 0 means draw one still frame (paused / reduced motion) */ });
  return { destroy() {} };
}, { label: 'Drop them' });               // add three: true for 3D; static: true if nothing animates
```

Keep the last argument (the meta) a plain object literal: the build reads its `label` and `three` to draw the button
before the widget's chunk has loaded. Import only from `./core.js`, `./three_kit.js`, other `live/` files and npm
packages; never from `app/`.

Helpers: `api.draw.arrow(ctx, x1, y1, x2, y2, color, width, head)`, `api.draw.text(ctx, s, x, y, {size, color, align, weight, serif})`,
`api.draw.roundRect(...)`, `api.draw.atom(...)`, `api.draw.particle(...)`, `api.rng(seed)` (deterministic),
`api.gauss(r)`, `api.reduced`, `api.visible`, `api.onCleanup(fn)`, `api.onHide(fn)` (runs when scrolled off screen).

3D: `import { makeStage, addAtom, addArrow, addDashed, webglOK } from './three_kit.js'` (drag to turn, Turn buttons,
gentle spin while playing) or import from `'three'` directly.

## Sound, sensors, video and shaders

All of these start only from a button the reader presses, stop when the figure closes, pause or stop when it scrolls
off screen, and keep everything on the device.

* **`api.audio()`** → `{tone(freq, {gain, type, dur, attack, release}), harmonics([a1, a2, …], f0, opts), stop(), ctx, master, available}`.
  One gentle master gain (0.22) through a compressor. `tone` returns a voice `{setFreq, setGain, stop}`; `dur: Infinity`
  holds it until `stop()`. `harmonics` builds one note from harmonic amplitudes (a tabla vs a tin drum). Call from a
  button handler.
* **`api.mic({label, fftSize, onStart, onStop, onError})`** → adds a "Use my microphone" button and a note that nothing is
  recorded. Returns `{time(), freq(), rms(), active, sampleRate, binHz, stop()}`: `time()` is the waveform (−1…1),
  `freq()` dB per bin. If there is no microphone or permission is refused it says "Microphone not available here".
* **`api.motion({label, onError})`** → a "Use the motion sensor" button (iOS permission on that press). Returns
  `{onSample(fn), stop(), active}`; `fn({t, x, y, z, g})` in m/s², gravity included (still phone: g ≈ 9.8; falling: ≈ 0).
  Without a sensor it points to the free phyphox app.
* **`api.video({label, fps})`** → a "Choose a video" picker, frame-step buttons, an fps menu and tap-to-mark (each tap
  marks the frame and steps on). Returns `{video, marks() → [{t, x, y}], onMark(fn), undo(), clear(), step(n), time}`;
  `t` in seconds, `x, y` in video pixels (y downwards). Uses `requestVideoFrameCallback` for exact frame times where
  the browser has it. The clip is never uploaded.
* **`api.gl(fragmentSource, uniforms, {width, height, label, fallback})`** → a full-canvas WebGL fragment shader.
  `precision highp float; uniform vec2 u_res; uniform float u_time;` are prepended: declare your other uniforms and
  pass their values (numbers or arrays of 2–4). Returns `{ok, canvas, set(name, value), draw()}`. It runs in the
  play/pause loop. Without WebGL, `fallback(ctx2d, W, H, uniforms, t)` draws instead, or the still drawing stays.

## Rules

* The animation teaches the section's idea and is physically honest: real ratios, real directions, conservation
  checked every frame. Say in the readout what is exaggerated or slowed down.
* Same visual language as the stills: book colours, labelled forces and vectors.
* Calm: no auto-play, no flashing, gentle speeds and volumes. One idea per widget; at most two or three controls.
* Readout: one or two plain sentences saying what to notice, updated as the reader changes things.
* Budget: each widget chunk under 150 KB (the site build prints sizes and warns).
* Test: `python3 build.py --site build/site && python3 livetest.py build/site/index.html /tmp/lt` (serves the folder
  over HTTP, opens every live figure and explorer, moves a slider or tab, screenshots, lists console errors, and
  confirms no chunk loads before a tap; `--offline` also checks the offline reload). Check `--w 1280` and `--w 390`.
  The engine fixture (`tests/fixture`, widgets `live/w_selftest*.js`) exercises every API above.
