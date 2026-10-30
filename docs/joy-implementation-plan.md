# Joy of Physics: implementation and verification plan

Authorized 30 October 2026: implement every recommendation in the two research notes. This is a local implementation; publishing and git commits are separate actions. No new service or account is needed. Preserve the narrative, original demonstrations, local-only storage, offline packaging, keyboard access, reduced motion, and the paper/ink visual language.

## Architecture and scope

Add a chapter-linked investigation collection using the existing validated lesson catalog and lazy live-figure runtime. An object-led directory links both new investigations and existing optics, electrical, thermal, and modern-physics lessons. Each new investigation has a short encounter, a longer investigation, materials/preparation, a manual or supplied-data alternative, an optional reasoning chain, model limits, and a transfer question. Existing chapters keep their figures; new lessons attach as alternatives.

Physics functions are separate from rendering. Use SI units internally. New observations use a versioned record under `investigation:<lesson>`; legacy lab predictions remain intact. The notebook collects the records and includes them in Markdown and JSON backups; each investigation exports CSV. Supplied observations are labeled, and no device access starts on opening. Browser plugin is not installed; use the repository's Python Playwright workflow.

## Acceptance register and ordered slices

| ID | Deliverable and acceptance | Dependencies | Verification |
|---|---|---|---|
| J01 | Short encounter and longer activity, materials, setup, timing estimates, alternatives, editable prediction, explanation and transfer question | Catalog | Browser opens both depths; theory stays optional |
| J02 | Trial rows with units, source, controlled variables, resolution, notes, graph and repeat summary; add/remove rows; persist and export | J01 | Empty/invalid data; reload, notebook, CSV, backup/restore; no invented confidence interval |
| J03 | Rolling race with equal mass/radius and variable inertia; translational/rotational energy and no-slip assumptions | Models | Hoop/cylinder/sphere examples, energy invariant, controls and diagram |
| J04 | Balance beam with pivot, loads, support force, signed torque and zero-force/nonzero-torque case | Models | Known balanced/unbalanced examples; keyboard controls |
| J05 | Bouncing-ball heights, restitution, energy fractions, manual/supplied impact-interval comparison and connection to existing local video tracker | J02 | 1 m → .64 m gives .8 speed ratio/.64 energy fraction; interval ratio and peak height; invalid values handled |
| J06 | Sealed-packet diver and gas compression/heating bridge; mass stays fixed; buoyancy varies | Models | Boyle relationship, buoyancy crossing, units, stated temperature assumption |
| J07 | Optional reasoning chains: observation, relationship, derivation, symbols, units, assumptions, worked example | J03–J06 | Inspect all new lessons; preserve existing equation inspector |
| J08 | Yo-yo pendulum/unwinding modes, axle radius and inertia controls, consistent energy/tension | J03 | Pendulum mass independence; unwinding acceleration and energy checks |
| J09 | Shake flashlight, finite storage, motion-generated voltage, lamp-equivalent load and opposition; conducting-tube eddy-current alternative; links existing generator and quantum lesson | Models | Stationary magnet produces zero EMF; hand work equals stored + delivered + dissipated energy; braking accounts for warming |
| J10 | Virtual microwave field and supplied hot-spot measurements; half-wavelength factor and uncertainty | J02 | 6.1 cm/2.45 GHz example; limits on arbitrary real melt spots; no appliance required |
| J11 | Surface detective routes to existing prism, grating/thin-film, interference and polarisation lessons; observation record | J01 | All target links open, return to directory, model selection and prediction |
| J12 | Light clock with both frames at common ground-frame events, proper time and invariant light speed | Models | beta=0 and .6 → gamma1.25; light-path geometry; no signal-delay conflation |
| J13 | Independent decay ensembles, population size, expectation, physical coin survivor data; existing decay connection | Models/J02 | Deterministic seeds, monotonic survivors, independent samples, correct mean model |
| J14 | Spring calibration and nonlinear rubber-band comparison, load/stretch graph, stored energy | Models/J02 | Known linear result, nonlinear trend, loading/unloading limits |
| J15 | Spinning-top precession model with torque/angular-momentum vectors and fast-spin limits | J03/J04 | Inverse spin-rate relation, no gravity cancellation, honest fixed-tilt approximation |
| J16 | Flying-disc investigation with gravity-only and documented simple lift/drag models; spin-stability explanation separate | Models | Vacuum projectile oracle; finite/physical flight; explicit aerodynamic limitations |
| J17 | Particle exploration: quarks/leptons/bosons, composite nucleons/charges, interactions and Higgs chronology | Sources | Proton/neutron charge examples, gravity outside Standard Model, no all-mass-from-Higgs claim |
| J18 | Object directory, filters, chapter/story/explorer links, source credits, original art/humor, notebook integration | J01–J17 | Discoverability, links, empty filter state, desktop/mobile/theme/keyboard/offline |

## Implementation files and checkpoints

1. Models and independent known-answer tests (`source/live/investigation_models.mjs`, `source/tests/test_investigation_models.mjs`). Keep a failing check before each model group is implemented.
2. Observation schema/export and reusable activity interface (`source/live/investigation_records.mjs`, `source/live/investigation_ui.js`, notebook integration). Verify a complete bouncing-ball path before broadening it.
3. Catalog and mechanics renderers: rolling, balance, bounce, diver, yo-yo, gas, springs, top, disc. Each has its own rendered mechanism and explanation.
4. Electrical/waves/modern renderers: flashlight, microwave, light clock, decay ensembles, particles, surface detective. Independently verify model limits and ordinary/edge controls.
5. Directory, object trails, chapter/story links, responsive CSS, complete sources and build metadata.
6. Full model/unit suite, catalog and build checks, existing integration/lifecycle checks, all-new-lesson browser matrix, record/backup/offline test, and independent review. Fix findings, rerun affected checks, read final diff.

Checkpoint after each numbered slice: record changes, focused checks and remaining obligations here. Do not call a checked-in plan or a simulation a physical learner trial. Actual household apparatus, sensor hardware and learner comprehension cannot be certified by browser tests.

## Risks and mitigations

- Missing or inconsistent book procedures: author original activities from the cited independent physics sources; do not claim verbatim fidelity to unavailable chapters.
- A large catalog overwhelming a child: object trails, short encounters, optional longer investigations and theory disclosures.
- Plausible but false animations: compute positions/readouts from the same tested model; label idealisations and slowed time.
- Data loss: retain legacy keys, bounded schema normalization, text-only rendering, export round-trip tests and explicit storage-unavailable feedback.
- Narrow-screen charts/tables: responsive controls and scrollable tables with readable labels; test 320/390/768/1440 pixels and three themes.
- Physical safety: default to virtual/manual observations; small household loads, no mains, flames, appliance modification or unsupervised strong magnets.

## Execution evidence

Completed: all J01–J18 rows. The catalog now has17 new investigations and126 lessons in total. The implementation includes the optional eddy-current and manual acoustic-timing alternatives as well as the core recommendations.

- Physics and record boundaries:19 Node test files pass, including independent values, conservation, event geometry, numerical limits, source-aware summaries and export round trips.
- Publication boundary: catalog checks, the existing coverage register, site build and self-contained build pass.
- Browser boundary:179 matrix cases across Chromium/WebKit, narrow/wide screens, three themes and unavailable WebGL pass. The final journey verifies observations, sources, exports, backup restoration, video connection/return, invalid input, keyboard, four widths, offline and full-storage fallback.
- Regression boundary: existing notebook/story/original-figure integration and98-scene graphics lifecycle pass.
- Independent review: physics and data-flow findings corrected; final focused checks passed. No claims of a physical learner trial or production publication.

Detailed commands, scope mapping, corrections, artifact locations and practical limits are in [joy-verification.md](joy-verification.md); hashes and case counts are in [joy-verification.json](joy-verification.json).
