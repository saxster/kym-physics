# Living physics — implementation and verification

29 October 2026. Initial local verification, completed before publication. Verified build: **`mw-5539b5376f34`**. All 108 software acceptance obligations in the [implementation plan](/Users/amarsukhi/src/MyCode/kym_physics/docs/threejs-implementation-plan.md) are implemented and verified within the evidence boundaries below. The [coverage register](/Users/amarsukhi/src/MyCode/kym_physics/docs/threejs-coverage.json) maps every obligation to its lessons and evidence; the [verification manifest](/Users/amarsukhi/src/MyCode/kym_physics/docs/threejs-verification.json) records exact receipt hashes, source hashes, browser versions, cases and results.

## Delivered behaviour

Added **109 interactive lessons across all 16 chapters**: 42 mechanics/fluids/energy, 34 thermal/waves/optics, and 33 fields/sky/modern physics. The original 36 widgets, three main explorers and map remain available. Ninety of 95 stories now lead to relevant shared experiments; five historical/evidence stories intentionally retain their narrative treatment, as itemised in the coverage register.

The additions teach mechanisms with manipulable Three.js apparatus, calculated diagrams, linked graphs and measured readouts. They include horizon sight lines, reference frames, contact/friction, impulse, orbit changes, pressure and displacement, energy accounts, thermal distributions and phase changes, membrane modes, ray and wave optics, charge/current/circuit diagnosis, motors and transformers, local sky/Foucault, eclipse shadows, tides, radiation, stars and expansion. Named story presets open the relevant state rather than an unrelated default.

Each added lesson has a prediction, an explanation prompt, model limitations and primary-source attribution. Lessons open paused. Predictions and explanations persist locally and enter notebook Markdown export and JSON backup/restore. Story returns restore reading position and focus. Small screens get an initially fitted calculated drawing with an explicit full-size inspection option. The original engraved stills remain for reading and print; calculated demonstrations remain usable when WebGL is unavailable or a context is lost. Audio and sensors require reader action.

The build validates placements, implementations, source records, story references and complete acceptance coverage. Three.js and lesson bundles remain lazy. The final index is **4050.2 KiB**, below 4096 KiB; the largest ordinary chunk is **124.2 KiB**, below 150 KiB. The shared Three.js vendor chunk is the documented exception at **678.5 KiB**. Service-worker offline reload and a previously unopened lesson were exercised.

## Physics and learner-fidelity verification

Fresh independent reviews initially rejected real gaps; the reports preserve those findings and append their correction evidence. Their **latest verdicts are PASS**, rather than treating the initial implementations as adequate:

- [Mechanics/fluids/energy review](/Users/amarsukhi/src/MyCode/kym_physics/source/gates/visual-mechanics-independent.md): C00–C07 and Stevin. Checks include common clocks and frames, source-named forces, contact transitions, independent mass/area/air controls, inverse-square surfaces, actual orbit impulses/coasting/capture, integrated hydrostatics, displacement and energy boundaries.
- [Thermal/waves/optics review](/Users/amarsukhi/src/MyCode/kym_physics/source/gates/visual-waves-independent.md): C08–C11, Fizeau, engines and story presets. Checks include selected energetic evaporation, pendulum force geometry, genuine membrane modes, computed mirror/retinal rays, scattering geometry, glare incidence and phase-driven diffraction/Raman representations.
- [Fields/sky/modern review](/Users/amarsukhi/src/MyCode/kym_physics/source/gates/visual-fields-independent.md): C12–C15 and relevant story laboratories. Checks include actual circuit topology/probe polarity, current/field directions, shared transformer flux, local/world frames, calculated eclipse cone sections, quantum-counting assumptions, inference uncertainty and fixed-camera expansion. The real fields factory was additionally exercised in **670 scene/fallback state checks**.
- [Shared-engine lifecycle review](/Users/amarsukhi/src/MyCode/kym_physics/source/gates/visual-lifecycle-independent.md): E01/E02. Its final closure covers bounded renderer reuse, owned instance-buffer disposal, stale-import ordering, shader-resource ownership and touch-gesture recovery after real GPU context loss.

**18 numerical/model/catalog suites passed**: 14 Node suites and four Python suites, listed individually in the manifest. These use independent worked values, limiting cases, invariants and shared renderer-geometry contracts. Examples include a 1 m small-angle pendulum period of about 2.00709 s; a latitude-dependent Foucault rate of about 4.91675°/h for Mumbai; the photoelectric threshold/energy account; conserved momentum/energy/charge; Snell and mirror conjugates; hydrostatic force integration; orbit and eclipse geometry. Pendulum restoring-force projections were checked for both angular signs. Fizeau midpoint-ray blocking is distinguished from whole-cycle aperture transmission, checked against an independent phase-sampling oracle.

The ice-melting prose now correctly distinguishes ice's open lattice from liquid packing. Sky-model prompts describe educational geometry rather than pretending to calculate real-date astronomical forecasts. Schematic scales, approximate models, stochastic samples and omitted effects are disclosed in the lesson limits and grounding notes.

## Browser and integration results

The final frozen build passed **1,210 lesson/viewport/theme/fallback cases**, with zero recorded page or console errors in those matrices:

| Final-build matrix | Coverage | Passed |
|---|---|---:|
| Chromium, WebGL | All 109 lessons × 390/1440 px × light/sepia/dark | 654 |
| WebKit, WebGL | All 109 lessons × 390/1440 px × sepia | 218 |
| Chromium, forced no-WebGL | All 109 lessons × 390/1440 px × sepia | 218 |
| Extra responsive widths | Eight representative apparatus at 320/768/820/1024/1180 px × all three themes | 120 |

These broad matrices open each lesson, verify its paused initial state, calculated drawing, input response, play/pause, fit/full-size inspection, focus restoration, horizontal overflow and theme behaviour. Mobile contexts use touch, mobile viewport behaviour and device scale factor 2; additional keyboard interactions exercise the range controls. Chromium uses software WebGL; WebKit uses its installed headless engine. Versions: Playwright 1.64.1, Chromium 156.0.8078.4, WebKit 27.2, Three.js 0.180.0.

**All-control evidence is separate from the broad theme sweep.** Earlier domain runs exercised every offered slider endpoint/midpoint, tabs and applicable custom actions at both main widths: mechanics 84 cases, waves 68, fields 66. Subsequent physical corrections received focused reruns, including four final pendulum/Fizeau cases, 16 final fields cases and independently inspected altered states. Those receipts belong to earlier named build candidates; they are not relabelled as final-build receipts. The final whole-book sweep reruns the final shared engine against every lesson. The manifest retains both evidence groups and their actual build IDs where available.

The final integration run passed original-demo preservation, local journal reopen, Markdown export, JSON backup and actual restore, story return/keyboard focus, four story-specific presets, finite optional audio, camera reset/side/top/keyboard/touch controls, forced Three.js context loss, repeated close/reopen, offline reload and an uncached-in-memory lesson, and print stills.

The original-widget regressions passed: all 36 originals and the three main explorers at 390 and 1440 px, original ray/field/phase widgets with and without WebGL, phase-mask pixel areas, native-detail inspection at 390/820/1440 px in all themes, circuit annotations, and the existing explorer scene/scale/contrast checks. The separate fixture book builds successfully, retaining the engine's non-textbook-catalog path.

### Long-session and recovery checks

Each final browser engine passed **98 mixed Three.js/raw-shader openings** with at most **three successfully created contexts** in the session, including the capability probe. Owned GPU buffers/programs returned to baseline and old pointer listeners were removed. Reused surfaces were required to remain painted; merely keeping a context counter low would not pass.

Real forced context loss was followed by actual ripple taps, 500 ms long presses and sky dragging on the replacement calculated canvas, in both browsers. Entry-module retry, an independently tested shared-dependency retry, cancellation while returning to a story, and an older pending figure losing to a newer deliberate selection also passed. The raw-pool unit suite separately checks 60 loans/one context, partial shader/link/buffer failures, subscription cleanup and initial no-WebGL interaction.

These checks followed genuine failures: WebKit retained repeatedly lost contexts until collection; owned InstancedMesh buffers needed object-level disposal; an older import could supersede a newer scene; and replacement canvases initially lost pointer gestures. All four were corrected and rerun. The independent lifecycle report preserves the reproductions and final closure.

## Reproducing the checks

Run from `/Users/amarsukhi/src/MyCode/kym_physics`. Build before browser checks, and keep that build unchanged during a run:

```sh
.venv/bin/python source/build.py --site source/build/site
.venv/bin/python source/tests/test_labs_browser.py --themes light,sepia,dark --widths 390,1440 --smoke --out build/labs-release-chromium
.venv/bin/python source/tests/test_labs_browser.py --engine webkit --themes sepia --widths 390,1440 --smoke --out build/labs-release-webkit
.venv/bin/python source/tests/test_labs_browser.py --themes sepia --widths 390,1440 --fallback --smoke --out build/labs-release-fallback
.venv/bin/python source/tests/test_labs_integration.py
.venv/bin/python source/tests/test_labs_lifecycle.py --engine chromium
.venv/bin/python source/tests/test_labs_lifecycle.py --engine webkit
```

Omit `--smoke` to exercise all offered controls. The exact numerical commands and original-regression commands are in the manifest. Extra-width runs select `m-horizon,m-mission,m-hull,m-stevin,w9-membrane,w10-eye,motor,eclipses`, widths `320,768,820,1024,1180` and the three themes. Raw JSON receipts, screenshots and logs are under `source/build/`; that generated directory is ignored by Git. The durable manifest retains result summaries and their hashes. Source files, acceptance coverage, grounding notes and independent reviews are retained as project files.

The build embeds fonts whose binary metadata can vary on an unchanged rebuild. Receipts record both the exact index SHA-256 and a runtime SHA-256 that normalises only embedded WOFF2 data, plus the actual chunk map. A rebuilt font changing the service-worker cache ID is not treated as evidence that an older receipt tested a new source revision.

## Evidence boundaries and delivery

Mobile and tablet tests are **browser emulation, not physical-device tests**. Actual Android/iOS GPU frame rates, battery/thermal behaviour, physical microphone/motion/magnetic calibration and controlled learner-comprehension/retention outcomes remain unverified. No 60 fps real-device performance claim or guarantee of an error-free textbook is made. The reviewed numerical models remain subject to their stated approximations.

At the end of this initial verification, the source and reviewable site were local and the production root had not been replaced. Amar subsequently authorised publication. See [publication and live verification](/Users/amarsukhi/src/MyCode/kym_physics/docs/threejs-publication.md) for that separate release and its actual public-site results.

The publication work added remote-URL support to the browser/integration runners and a deployment/cache-upgrade runner. The initial source hashes above remain historical snapshots of the original local runs; the publication receipt identifies the updated verification tools. The textbook build bytes were retained exactly.
