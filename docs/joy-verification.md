# Joy of Physics implementation: verification

Verified 30 October 2026. Local preview: [Investigate everyday things](http://127.0.0.1:8877/#investigations). The public deployment was not changed. Source/build hashes and matrix receipts are recorded in [joy-verification.json](joy-verification.json).

## Delivered scope

All J01–J18 rows in [the implementation plan](joy-implementation-plan.md) are implemented. Seventeen new investigations extend the catalog from109 to126 lessons:

- Rolling race, balance beam and free force couple, bouncing-ball heights, bounce-impact intervals, sealed-packet diver, gas compression/heating, yo-yo pendulum/unwinding, spring calibration, spinning-top precession, flying-disc model comparison.
- Shake flashlight and capacitor discharge, eddy-current braking, virtual microwave, light clock, independent decay ensembles, particle families/nucleons, and the surface detective linked to existing optics models.

Each has a short encounter, an optional longer activity, materials and estimated preparation/duration, a prediction, model limitations, an explanation, optional derivation, worked example, transfer question, source links, and connected lessons. The directory filters by object/duration and appears in the toolbar and contents; chapter introductions and selected existing stories also link directly to the investigations.

Evidence records support editable trials, source labels, controlled variables, resolution, notes, graphs, repeated-setting summaries, comparison with the current model where appropriate, claims, and disconfirming observations. Model summaries retain their control conditions. CSV, notebook Markdown and JSON backup/restore preserve the data. A full-storage fallback keeps newly authored evidence available for the current visit. Existing notebook and original-figure behavior are retained.

## Checks and results

| Check | Result |
|---|---|
| All19 Node test files, including the new model and record boundaries | PASS |
| Catalog validation, missing connection rejection, complete existing coverage register | PASS,4 tests |
| Existing figure-helper and scientific-geometry checks | PASS |
| New-lesson full control sweep, Chromium390/1440px | PASS,30 cases |
| Chromium320/1440px, light/sepia/dark | PASS,90 cases |
| WebKit390/1440px | PASS,34 cases covering all17 investigations |
| WebGL unavailable, dark theme390px | PASS,17 cases |
| Final focused controls for diver, yo-yo and both advanced alternatives | PASS,8 cases |
| End-to-end investigation journey | PASS |
| Existing original/lab/notebook/story/offline integration | PASS |
| Existing graphics lifecycle:98 serial Three/raw-shader scenes, bounded contexts, resource release, lazy retry and stale-load cancellation | PASS |
| Site and self-contained HTML builds | PASS |
| Whitespace/diff check | PASS |

The matrices total179 cases. They cover default and endpoint controls, mode changes, diagrams, theme changes, focus, page overflow and closing. Matrices preceded the final focused corrections; the final journey subsequently covers corrected video routing, timing-zero behavior, and data persistence. The last build adds one supporting scientific citation without changing interaction behavior.

The journey starts at the directory, checks an empty filter result, opens a bounce investigation, edits observations, compares repeated readings, distinguishes sources, exports CSV, removes a row, reloads, preserves text beyond10000 characters, rejects invalid numbers, opens theory, exports notebook Markdown/JSON, restores the backup, opens the original local video tracker and returns. It checks incompatible recording modes, Malus’s-law endpoints, the zero-next-flight limit, all connected lesson identities, keyboard entry,320/390/768/1440px layouts, offline reopening and full-storage fallback. Relevant browser errors: none in successful runs.

## Independent review and corrections

An independently delegated physics review and a later data-flow review identified issues during implementation. They were corrected before closeout:

- The fixed-pivot beam now computes its dynamic initial support reaction. A separate free-bar force couple demonstrates zero net force with nonzero torque.
- Buoyancy and weight arrows share a force scale. The packet is compared fully submerged; its changing volume and initial motion tendency are explicit.
- Top precession, angular-momentum direction and torque use a consistent projection and signed precession; direction-only vector scales are explained.
- The flashlight uses an energy-flow diagram rather than misleading shorted wiring. Its ideal RC model accounts for stored, delivered and dissipated energy.
- Incompatible gas/yo-yo modes cannot record mislabeled values. Flight readings retain aerodynamic mode/elevation, and model summaries separate conditions.
- Numerical supplied examples were checked; long text is preserved; the video link targets the actual tracker figure.
- A zero subsequent bounce interval has no third impact. Zero measured flight intervals are invalid for three-impact inference.

Independent numerical sweeps checked light speed along later and returning light-clock segments, dissipating flight energy and ground termination, all offered eddy-drag values, terminal-speed bounds, and timing-height relations. Primary source checks include OpenStax, NASA, Exploratorium, CERN, the Open University and the original bounce-acoustics paper. The additional proton-mass explanation is supported by the [US Department of Energy account](https://www.energy.gov/science/np/articles/scientists-locate-missing-mass-inside-proton).

## Reviewable outputs and limits

The lazy site is under `source/build/site`; the self-contained artifact is `source/build/joy-physics.html`. The final site index is about4084 KiB, within the build’s4 MiB budget; the new lazy investigation chunk is below150 KiB. The preview is open in the in-app browser and the local server runs on port8877.

Browser artifacts are under `/tmp/joy-browser`, `/tmp/joy-final-matrix`, `/tmp/joy-webkit`, `/tmp/joy-fallback`, `/tmp/joy-final-controls`, and `/tmp/joy-journey`. They are temporary local evidence, not application source or public uploads. Node logs are `/tmp/joy-node-final.log`. Existing Node module-type warnings remain nonfatal and predate this work.

No physical household apparatus, microphone hardware, or learner-comprehension trial was performed. The acoustic route uses manually identified or supplied intervals; it does not claim automatic impact detection. No production publication or git commit was performed.
