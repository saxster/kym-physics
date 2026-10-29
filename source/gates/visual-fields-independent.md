# Independent physics and learner-fidelity gate: fields, sky and modern physics

Reviewer: fresh independent agent, 29 October 2026. **Gate: FAIL / fixes required.** This is a source-level audit of the implementation present when this report was written, not a receipt for a subsequently rebuilt site. No implementation files were edited by this reviewer.

## Evidence and method

Read `source/SKILL.md`, the complete `source/PLAYBOOK.md`, `docs/threejs-implementation-plan.md`, the complete `source/live/w_fieldslab.js`, `fields_models.mjs`, `source/lessons/fields.json`, `source/grounding/visual_fields.md`, `source/tests/test_fields_labs.mjs`, the shared `lab_kit.js`, and the relevant preserved chapter widgets/placements. The requirement is observable teaching behaviour, not whether a catalog record or a formula exists. Findings below come from actual geometry and update/draw/control branches. Browser validation of the final changes remains necessary.

Primary reference pages independently inspected during this gate: [wire/coil field directions](https://openstax.org/books/college-physics-2e/pages/22-9-magnetic-fields-produced-by-currents-amperes-law), [electrical protection mechanisms](https://openstax.org/books/college-physics-2e/pages/23-8-electrical-safety-systems-and-devices), [NASA eclipse geometry](https://science.nasa.gov/moon/eclipses/), [generator geometry and flux/emf](https://openstax.org/books/college-physics-2e/pages/23-5-electric-generators), [Earth/sky coordinate frames](https://openstax.org/books/astronomy-2e/pages/4-1-earth-and-sky), [light deflection and apparent star direction](https://openstax.org/books/astronomy-2e/pages/24-3-tests-of-general-relativity), and [NIST parity experiment](https://www.nist.gov/pml/fall-parity/reversal-parity-law-nuclear-physics). No historical counts are inferred from simulated examples.

“PASS (source)” below means the required mechanism can be traced through the source; it does not waive the final browser matrix. “PARTIAL” and “FAIL” both leave the acceptance obligation open. A limitation disclosure cannot satisfy missing accepted scope.

## Actionable blockers and necessary corrections

### F1 — Wire probe contradicts the geometry and never moves (C13.3)

`fieldProbe()` constructs a vertical wire along y with circular field lines in x-z. It places the probe at `[1,0,0]` but draws the wire contribution along y, parallel to the wire. A wire's field must be tangent to the circle (at +x, along -z for current +y). This is a wrong physical picture despite a correct scalar magnitude. The background and wire must be drawn in a common coordinate frame with a consistent current arrow and local north. Move the actual marker and all vector origins when `r` changes. Currently only the magnitude changes, and all origins remain x=1. Draw contribution vectors for individual coil turns or a clearly linked sum rather than only showing more loops and a new total. Tram mode currently hardcodes 0.5 μT: either lock current/distance controls to its named 500 A/200 m values or let controls change that calculation and labels. The preserved `field3d` does not repair the new scene's false vectors.

### F2 — Local horizon/sky and a shared global/local Foucault state are absent (C14.1, S02)

`sky()` day-night draws a marked point round an Earth, a Sun and an altitude graph. There are no stars, horizon plane, north/east/up basis, apparent sky path or surface camera/diagram. The catalog promises a surface-direction diagram and illustrative star coordinates which do not exist. Build the local horizon from the same observer latitude and rotation/time used in the space view; project fixed inertial star/Sun directions into that basis, show east/west apparent travel and visibility above/below horizon, and show the tangent horizon and observer on the globe. A local/global toggle must preserve this exact state.

`foucault()` has a stationary globe whose site depends only on latitude. Hours rotate a local floor trace, but no global Earth rotation, rotating local frame or transformed swing-plane direction is computed. The bob and vertical suspension line never change. Show the Earth-axis rotation and local basis at the selected site/time, and transform the same local swing direction into the world scene. Use the latitude-correct local precession; do not claim a globally fixed plane at arbitrary latitude. Pole, equator and Mumbai should be directly comparable with the same clock, with a proper pendulum/string if the bob is animated. The numerical −Ω sin φ law alone does not satisfy the local/global requirement.

### F3 — Shadow cone endpoints are reversed (C14.4)

`sky()` creates Earth shadow with `CylinderGeometry(shadowFarR, earthR, shadowLength, ...)`, rotates local +y toward anti-Sun, then places the centre anti-Sun at half its length. Three's top radius is local +y. Consequently the *far* end has earthR and the Earth end has shadowFarR: the umbra widens away from Earth. Likewise the Moon penumbra uses `(farRadius, moonRadius, ...)` with +y toward anti-Sun, so it narrows away from the Moon. Reverse the endpoint radius arguments (or the geometry-axis mapping), then independently assert both world-space endpoint radii and positions. Preserve the good common-scale bodies, fixed nodes, year and inclination controls, and actual calculated intersection classification. The solar intersection formula is an approximation at mean distance; disclose its approximation rather than implying exact contact prediction.

### F4 — Circuit topology does not follow the selected case (C12.4–C12.6)

`circuits()` always creates the intact outer rectangle. In `circuit-probes`, this supplies extra ideal-wire paths across the battery/load rails; selecting Series retains the two parallel branches. Rebuild or toggle the wire segments so the geometry actually matches the solved topology, with resistor/LED interruptions rather than wires visibly running straight through every component. Add voltage probes: current branch selections exist, but no probe measures a chosen voltage difference. A terminal-voltage sentence is not a voltage probe.

For `circuit-diagnose`, Open wire leaves the wire geometrically closed; reversed LED remains an unoriented sphere. Make the actual gap and diode polarity visible. Show the chosen supply/load operating point on the current-voltage representation (including the source/internal-resistance relation), rather than only a whole response curve with no selected-point marker. Connect the selected voltage/current readings to the visible components.

For `protection`, supply/return bars are fixed at 1000 and 1000−leak mA and the RCD only reports “trips”; no switch opens, current stops or post-trip state is represented. Removing protective earth hides one line but continues the same prescribed leakage and difference without showing another return path. Add a visible source-return route for each state, an actual trip/open state, and a separate overload case in which equal live/neutral currents can exceed the breaker limit without residual imbalance. Keep all cases virtual. The accepted distinction between overload and RCD imbalance is currently missing.

### F5 — The two circuit clocks are a label plus a static bar (C12.2)

The “Slow drift clock” tab changes only `bar(... mode ? 1 : 1e-9 ...)`. Electron positions continue to use `timeNs/1e10` for both modes, producing effectively no visible drift over the entire slider. The readout always speaks nanoseconds. Give the two named modes actual separately scaled clocks and local drift motion, and label the displayed seconds/nanoseconds and spatial magnification. Signal travel must follow the wire path being claimed; the marker currently moves only across the upper horizontal segment while the charge dots circulate the complete rectangle.

### F6 — Neutral sample is incorrectly labelled charged (C12.1)

In the polarisation modes, `charge()` correctly retains a neutral right sample in 3D and states “neutral sample 0” in the report, but the linked chart always labels it “Right charge −q”. This directly reinstates the misconception being corrected. The right net-charge bar must be zero in polarisation, with separate positive/negative internal charges or dipole displacement; keep the removed-electron storage account explicit. Separation should move the actual materials/probe rather than only alter a displacement parameter while boxes stay fixed. Distinguish surface redistribution in a conductor from small bound-charge shifts. For cage, also align the rendered shell radius (currently 1.05) with the analytical boundary (1), so the probe does not report an outside field while apparently inside the shell.

### F7 — Generator hardware and transformer mechanism are incomplete (C13.5)

`machines()` leaves the motor's split-ring commutator in the generator scene, while reporting a sinusoidal alternating output. Show separate slip rings for AC or explicitly distinguish coil emf from the rectified brush-terminal output of a split ring. The generator graph also unconditionally draws the commutated motor torque curve before its flux/emf curves, resulting in an unlabelled third curve; remove it. Scale the plotted emf by the selected omega, so omega=0 gives a flat zero voltage instead of a full sine curve. Keep the already correct numerical phase relation.

Transformer mode only displays static core/coils, turn bars and a formula/readout. There is no common flux, primary AC phase, induced-secondary phase/voltage measurement or DC steady-state visual difference. Show a reversible common field through the core driven by a shared AC clock and link induced secondary voltage to its changing flux. Steady DC should leave steady flux and no sustained secondary emf; do not imply that zero voltage necessarily means no magnetic field. Retain the stated ideal-model bounds.

### F8 — Seasons mechanisms are split and missing from the new shared state (C14.2)

`seasons3d` correctly preserves a fixed inertial axis and computes latitude/tilt-dependent daylight and altitude. It has no beam footprint, daylight arc or actual opposite-hemisphere comparison. The preserved `seasons` widget supplies a useful fixed-tilt beam-footprint illustration, but has only northern/equatorial latitude presets and no zero-tilt state. Add a linked footprint/energy-per-area view and selected latitude daylight arc to the *same* chosen tilt/year/latitude state, and show the opposite hemisphere at that same time. A sentence inviting comparison cannot substitute for those representations.

### F9 — Story tracks omit grains and inference uncertainty (S07)

`tracksParityBoseEvidence()` displays a continuous noisy 3D line and its consistent x-y projection. The grain-density proxy is only a number; there are no emulsion grains. No measurement uncertainty, finite microscope resolution or range of mass/speed inferences is represented. Add grains whose distribution changes with the declared ionisation proxy, an observational/resolution/uncertainty representation, and a transparent comparison of what can and cannot be inferred at fixed momentum. Keep the simulated/Highland-approximation qualification. Merely adding a continuous line plus a proxy number does not deliver this story's accepted evidence mechanism.

### F10 — Zero alignment still displays one-sided electron emission (S08)

The hemisphere counts correctly become 50/50 at zero alignment, and mirror mode correctly reverses y axial spin under x reflection while retaining y polar velocity. However both electron arrows remain a finite downward preferred direction because their length is `0.4+0.5*alignment`; at alignment=0 the picture still claims asymmetry. Show both hemispheres/statistical samples with equal visible counts then, or make a labelled mean-asymmetry vector vanish. Label the mirror plane/reflection and actual versus mirrored experiments, so this is a transformed experiment rather than two unexplained arrow groups. Mirror arrows must remain derived from one explicit spatial reflection.

### F11 — Label swapping is not rendered (S09)

`boseStates()` distinguishes labelled A|B and B|A, but both arrangements in 3D use `left = j < state[0]`, assigning red particle 0 left and blue particle 1 right. Selecting arrangements 2 and 3 therefore produces the same labelled configuration. Render the actual label assignments, retain visible A/B identities, and remove identities for bosons. The arrangement slider must have the correct range for each statistics mode rather than silently clamping multiple positions to one state. State the fixed two particles, two available one-particle states and the lack of a fixed-total-energy constraint/probability assumption; preserve the useful occupation-number comparison.

### F12 — Eclipse-evidence ray bends away from the Sun (S10)

Sun is at y=−0.1 and the ray enters at y=+0.55; its outgoing segment rises to `0.55+bend`. This is away from the Sun. Draw the physical deflection toward the Sun and then a backward straight extrapolation from the observer that shows the apparent star shifted outward. Include an observer, true star direction and apparent direction; the acceptance asks for apparent position shifts, not only a scalar arcsecond plot. Link impact control to actual ray/Sun separation, presently fixed despite changing the bend. The independently controlled uncertainty and simulated-evidence label are good. Fit the full interval: measured+resolution reaches 3.87 arcsec while the graph maps only 0–2.5 arcsec into its width, so permitted uncertainty states overflow the canvas.

### F13 — Additional accepted representations are only textual or disconnected

* **C13.2:** Earth latitude changes a needle but there is no site/field on the globe or north/up basis, and rotating the device changes only its blue axis. Show the world field and its x/y/z sensor projections/components in the rotating device frame, including the constrained horizontal projection. Do not claim components change without actually representing components.
* **C13.6:** E/B perpendicularity, phase, fixed probe and polarisation are good. The selectable wavelength spans only 0.5–2 m; no linked ladder of light exists in the new scene. Add a log-frequency/wavelength ladder or named real examples tied to f=c/λ, preserving the full spectrum range. Keep separate amplitude scales and visibly state slowed time in the visible readout, not only folded limits.
* **C15.2 atom scale:** The reference diameter slider updates only text; neither displayed reference length changes. Add an inspectable reference ruler/zoom/log comparison that genuinely responds, alongside the common-scale unresolved nucleus. The arithmetic 1 cm ×10^5 =1 km is correct; do not change it.
* **C15.3 halo:** The 3D schematic is honestly qualified and has a useful force account, but the promised projections are absent. Add linked xy/xz/yz projections of the *same* selected craft point/curve. Distance-from-Earth changes the force account while the halo stays fixed; label this as independent force-account inspection or move the L1 reference consistently.
* **C15.5:** Preserved parallax geometry plus the new baseline/uncertainty and Cepheid account cover most scope. The new 3D baseline/triangle itself never changes with distance/baseline. Make its reference geometry respond or explicitly replace it with an honest exaggerated-angle geometry. Connect the received-flux curve/selected phase to the star: the star pulses using `sin(tick)` regardless of selected period, so it is not the displayed Cepheid clock. Use a shared phase/time and show how measured period gives luminosity then distance from mean received flux. Keep the illustrative calibration caveats.

## Acceptance-by-acceptance verdict

| ID | Source verdict | Evidence and remaining obligation |
|---|---|---|
| C12.1 | FAIL | Electron conservation and conductor/bound shift exist; polarisation chart falsely labels neutral sample −q; see F6. Shell sum exists with minor boundary mismatch. |
| C12.2 | PARTIAL | Loop retained, labelled fast signal exists; genuine separate drift clock/motion absent; F5. |
| C12.3 | PASS (source) | Preserved `w_circuit.js` has circuit, energy-per-charge and rope views, equal charge counters and explicit power balance. No new fieldslab record required if existing book entry stays accessible. |
| C12.4 | PARTIAL | Internal resistance, terminal voltage and dark-LED cases are numerically solved; visible gap/polarity and operating point missing; F4. |
| C12.5 | FAIL | Unequal currents are solved; voltage probe absent and Series scene remains parallel with extra bypass wires; F4. Existing symmetric widget does not meet unequal/probe additions. |
| C12.6 | PARTIAL | Case fault and earth line visible; no actual trip/open state or overload comparator, inconsistent no-earth leakage route; F4. |
| C13.1 | PARTIAL | Individual arrows rotate and 2D favourable-region wall moves; cut separates blocks. Show coherent domains/walls with orientations and N/S ends on both cut magnet pieces, preferably from a magnetised preset. At zero field the default cut is a demagnetised sample, not a demonstration of two macroscopic magnets. |
| C13.2 | PARTIAL | Dip/level constraint works; actual local/world device components and globe site missing; F13. |
| C13.3 | FAIL | Preserved field3d accessible, scalar sums/turn counts/tram present; new wire vector is physically wrong and probe does not move; F1. |
| C13.4 | PASS with visual follow-up | Coil/current/L×B force and r×F torque are consistent; commutator, brushes, reverse/open/quarter-turn and dynamic/coasting controls exist. Add visible conductive leads from coil to split-ring halves and supply to brushes to earn “working” electrical path; at present rings/brushes are disconnected ornaments. Do not require back emf beyond declared scope. |
| C13.5 | FAIL | Preserved induction remains; rotating flux/emf exists, but wrong output hardware, speed-independent voltage curve and extraneous torque curve; transformer lacks changing-flux mechanism; F7. |
| C13.6 | PARTIAL | Correct inspectable E/B and fixed probe/polarisation; shared ladder missing; F13. |
| C14.1 | PARTIAL | Observer/daylight/altitude and correct numeric Foucault rate; horizon/apparent sky and shared global/local state missing; F2. |
| C14.2 | PARTIAL | Axis/declination/daylight/no-tilt calculations good; opposite hemisphere, linked footprint and daylight arc missing; F8. |
| C14.3 | PASS (source) | Existing phases preserves shared overhead/Earth-seen phase diagram; new synchronous/nonrotating marker follows correct space orientation. Keep both entries accessible and verify quarter/new/full and the red face from Earth. |
| C14.4 | FAIL | Inclined orbit/nodes/year/month and computed intersections exist; rendered shadow frusta reverse their taper; F3. |
| C14.5 | PASS (source) | Preserved components plus spherical three-latitude differential vector sampling, centre subtraction and optional Sun. Explicitly separates ideal response from Haji Ali predictions. |
| C15.1 | PASS (source) | Independent wavelength/flux/retarding potential give counts, maximum KE and stopping potential, with threshold and limits. Photon icons are schematic. |
| C15.2 | PARTIAL | Exposure/contamination/source off and individual seeded/ensemble decay exist; actual adjustable atom/nucleus reference scale lacking; F13. |
| C15.3 | PARTIAL | Solar layers, random walk, convection/escape markers and mass-energy account present; halo honestly schematic and nonzero gravity correct, projections missing; F13. |
| C15.4 | PASS (source) | Independent T/abundance, fixed-composition temperature scan and neutral/excited population/line proxy meet scope. Visible abundance does not change ion count, so retain explicit “relative line-strength proxy” rather than pretending particle-count accuracy. |
| C15.5 | PARTIAL | Existing parallax retained; new baseline/noise and Cepheid period-luminosity/flux calculations present; disconnected triangle and pulsation clock need repair; F13. |
| C15.6 | PASS (source) | Mass-radius-density, no stable-model radius at/above limit, and separately selected initial/core mass visible. Invalid state should say “at or above” rather than “above 1.44” when exactly equal. |
| C15.7 | PASS (source) | Preserved ruler plus 3D observer re-centering, fixed marker sizes, changing gaps, Hubble plot and stretched-wave view. Final browser must check all observers at scale=3 fit the stage. |
| S02 | PARTIAL | Correct latitude precession but no common global/local physical state; F2. |
| S03 | PASS with boundary correction | Separate external/induced/net fields and transparent physically closed shell; match displayed/model radius; F6. |
| S06 | PASS (source) | Equatorial-axis elevation comparison and parabolic cylindrical trough; mesh spacing changes a 200 cm reference grid against 100 cm wave. Response explicitly qualitative. |
| S07 | PARTIAL | Actual 3D scattering and matching projection; grains/inference uncertainty missing; F9. |
| S08 | PARTIAL | Correct statistical counts/spin reversal and axial/polar mirror transformation; finite asymmetry arrow at isotropy and unlabeled comparison; F10. |
| S09 | FAIL | Counts correct but labelled exchange is not rendered and arrangement control silently repeats states; F11. |
| S10 | FAIL | Independent uncertainty and alternatives exist; physical ray bends wrong way, apparent versus actual star missing and allowed intervals overflow; F12. |

## Feynman explain-backs and learner-risk check

**Charge and shielding.** “Rubbing moves electrons from one material to the other, so the whole pair keeps the same total charge. A neutral object can still be pulled because its positive and negative charges shift into a different arrangement. In a closed metal shell the shifted charges produce a field that cancels the outside field inside the empty cavity.” Risk: the current neutral-sample bar contradicts sentence two.

**Circuits and protection.** “The wire already contains charge, so a change can spread round the circuit much faster than an electron drifts. A battery gives energy to each amount of charge and the components receive that energy while charge keeps circulating. An overload is too much current, whereas an RCD compares outgoing and returning current and opens the circuit if some returns another way.” Risk: current scene never actually opens and never demonstrates overload with balanced currents.

**Magnets and machines.** “Small magnetic regions can turn or grow so their effects add, and cutting a magnet does not give a lone pole. A current in a wire makes a field round the wire, and fields from different sources add as arrows. A motor uses opposite forces and reverses the current at the right time, while a generator or transformer makes voltage when the linked magnetic field changes.” Risk: the new wire arrow is parallel to the wire; transformer currently names flux without showing it change.

**Earth, Moon and sky.** “Our horizon moves with our place on the turning Earth, so distant stars seem to move the other way. Earth's tilted axis keeps its direction while Earth goes round the Sun, giving opposite hemispheres different Sun angles and day lengths. The Moon must rotate to keep one face towards us, and eclipses need its inclined orbit to put it inside the right shadow.” Risk: there is no horizon representation and the rendered shadows have the wrong taper.

**Foucault and tides.** “A Foucault swing changes direction relative to the floor at a rate that depends on latitude, so the equator is different from the pole. To find the tide-making pull I compare each place's pull with the pull at Earth's centre, rather than claiming the Moon pushes the far ocean away. The Sun changes that pattern too, but a simple globe cannot tell me the actual tide time at Mumbai.” Risk: the local Foucault numerical line is not connected to a physical world-frame state.

**Photons, nuclei and the Sun.** “Brighter light supplies more photons, but each photon still needs enough energy to free an electron. A nucleus can decay at an unpredictable time even though a large sample follows a half-life curve, and radioactive dust left on something differs from a beam that has stopped. Fusion releases the energy represented by a small mass difference, and that energy passes through different layers before it leaves the Sun.” Risk: nucleus/atom size needs an actual scale comparison; remaining main mechanisms are acceptably qualified.

**Stellar and cosmic inference.** “A weak hydrogen line can mean the wrong temperature for that line instead of little hydrogen. I can use parallax or a variable star's measured period and brightness to infer distance, with uncertainty, and a white dwarf's initial star mass differs from the mass of its leftover core. Expanding space increases gaps and stretches wavelengths while bound galaxies keep their size, so choosing a different galaxy does not make a special centre.” Risk: variable-star icon and period plot currently use different clocks.

**Distinctive evidence stories.** “Radio waves can reflect from a mesh whose openings are small compared with their wavelength, and a tilted telescope axle can follow Earth's turn. A particle's grain trail is an uncertain clue rather than a photograph of its identity, and a mirror changes spin and motion arrows differently. Exchanging labels can give a new arrangement for labelled particles but not identical bosons, while a tiny star-position measurement needs an uncertainty range before we compare theories.” Risk: grains/uncertainty missing, labelled exchange duplicate, and ray direction wrong.

## Verification requests before closing this gate

Use meaningful geometry-to-model checks, not only more scalar formula tests: wire tangent perpendicular to current/radius; marker position versus distance; topology graph versus selected circuit; neutral sample charge in every representation; both cone endpoint radii/positions; generator voltage amplitude at omega=0 and a nonzero speed; local/world Foucault direction from the same state; isotope/isotropy symmetric emission; visibly different A|B/B|A; gravitational ray curvature toward the Sun and outward apparent extrapolation. Browser checks must inspect every newly added mechanism in 3D and forced fallback, including zero/extreme controls and the full uncertainty interval. The existing fields tests mostly validate formulas and cannot detect these rendering failures. Re-run the independent gate against the final source and rebuilt screenshots after fixes.

## Independent rereview, candidate mw-81c12a9235dc

The original findings above remain immutable history. This rereview independently traced the revised renderer's actual helper calls, not just the added exported helpers. The public model tests, geometry tests and actual 33-factory scene/fallback harness were rerun: all passed, including 662 finite state checks plus the shared voltage-probe polarity/current-selection and continuous coherent-domain rotation checks. These are CPU scene-instantiation checks, not GPU or browser evidence.

A separate Playwright run using the repository `.venv/bin/python` selected nondefault teaching states in 27 affected lessons at 1440 and 390 px with 3D, plus the same 27 at 390 px with forced WebGL failure: **81 cases passed with zero page errors**. Saved readouts, actions and screenshots are in `source/build/fields-independent-closure/receipt.json`. It records cache `mw-81c12a9235dc`. The tested states include conductor polarisation at maximum transfer/separation, the actual slow drift clock, Series return-load voltage polarity, a visible diagnosis gap, balanced overload, a cut magnet at intermediate/high field, rotated sensor axes, reversed wire current at a moved probe, generator at zero angular speed, transformer steady DC, a visible spectrum ladder, local sunrise, opposite-hemisphere winter footprints, no-rotation Moon, node-aligned solar eclipse, north-pole Foucault, adjusted atom references, selected halo projections, a 40-day Cepheid at quarter-cycle, the exact white-dwarf limit, expanded observer switching, finite-resolution grain inference, zero-alignment mirror statistics, labelled B|A exchange and the largest uncertainty at impact four.

Source inspection and actual screenshots close the initial wrong-physics issues in F1, F2, F5–F13, together with the domain/cut-magnet, motor conductive-lead and exact dwarf-boundary follow-ups. In particular the Series voltage probe is now red on the right/black on the left of the return load and reads +5.33 V consistently; lower Series LEDs reverse in both 3D and the fallback. The new domain region model retains wall movement and continuous high-field rotation. Shared world/local Foucault state is transformed with latitude-correct precession, with no globally-fixed-plane claim at intermediate latitudes. The initial explain-backs are now supported by the corrected mechanisms.

**Gate remains pending two visual corrections discovered by inspecting the rebuilt pictures:**

1. F4's fallback circuit diagram omits the short component-lead segments that join each topology endpoint to the drawn resistor and diode. It therefore displays disconnected components even when its solver says the circuit is closed. Compare `circuit-probes-1440-3d.png`: the 3D is joined, but the calculated diagram has visible gaps before/after each load. Include those joins in the actual fallback, with the corrected return diode orientation.
2. F3's cone taper is now physically correct in source and actual instantiated Three endpoint geometry, but the overview makes the common-scale cones effectively uninspectable. At the selected node-aligned solar eclipse the Earth radius is about one pixel and no cone can be read; the fallback has no shadow-boundary representation at all. Preserve the honest common-scale overview, but add a linked shadow close-up/inset or a close camera that shows the computed umbra/penumbra and selected body's offset with explicit magnification/common spatial units. See `eclipses-1440-3d.png`.

These are renderer/learner-fidelity findings, not numerical-test failures. Final closure requires inspecting the corresponding rebuilt fixes.

Further picture-level follow-ups from the same 81-case inspection, sent immediately to the coordinator:

3. In the moved/reversed wire-probe picture, the current ArrowHelper is wholly inside the opaque wire cylinder: its head radius is smaller than the wire's. Move the current-direction arrow parallel to and beside the wire so the selected current sign is visible. This leaves the correct B-vector geometry unchanged.
4. The generic per-input camera refit defeats the cosmos expansion comparison. As the scale factor grows, it pulls the camera away, largely keeping gaps the same size on screen and shrinking the supposedly fixed-size bound-galaxy markers to about a pixel. Hold a common camera scale across the expansion comparison (fit the maximum supported scene/observer extent once), and retain readable fixed marker sizes. Source-world mesh scale alone does not prove the learner-visible expanding-gaps/fixed-sizes observable.

## Final independent closure — PASS

**The latest gate verdict is PASS for the scoped C12–C15 and S02, S03, S06–S10 physics/learner-fidelity obligations.** This supersedes the initial FAIL and the pending rereview above; both are retained as immutable audit history. All confirmed F1–F13 findings and the subsequent picture-level, probe-polarity, domain-rotation, default-tab and initial-FM-state findings are closed. No implementation files were edited by this reviewer.

The final candidate reviewed is `source/build/verified-site`, cache **mw-d525f79a4244**. Final source SHA-256:

- `source/live/w_fieldslab.js`: `4a6ecf17bec80bf48edd1ef00755f4494005a3aa1d5e3c74fa0bbcb493e8541b`
- `source/live/fields_models.mjs`: `b0080ce343175f0767494643015b8a186732537b3c1268d0ef3b20e03500eee3`
- `source/tests/test_fields_labs.mjs`: `577ff239867e7b89eae0a0aeac065db6cfef27f76b4a2043653a5ab4070fc3c5`

### What was independently rerun and actually inspected

`node source/tests/test_fields_labs.mjs` passed again against the final frozen source: public reference values, renderer geometry contracts, the real widget factory for all 33 lessons in both scene and no-scene branches (**670 state checks**), probe polarity/current selection, continuous coherent-domain rotation, shared resistor/diode lead endpoints and actual eclipse close-up geometry. I inspected the renderer call sites to establish that these helpers feed the actual mesh positions, polyline buffers and Canvas paths; helpers that merely pass isolated tests would not close this gate.

The earlier independent 81-case selected-state matrix on mw-81c12a9235dc remains evidence for the unchanged affected mechanisms. On the final candidate I independently ran **33 additional selected-state browser cases**: eleven scenarios at desktop 1440 px and mobile 390 px with WebGL, plus the eleven at 390 px with forced WebGL failure. All passed, with **zero page errors**. The final receipt, actions, readouts and screenshots are in `source/build/fields-independent-final/receipt.json`. The scenarios cover correct cage/FM initial states; Series return-load polarity and physically joined components; both wire-current signs; aligned solar and lunar cuts, an off-node miss and ×20 central shadow detail; and cosmic scale factors one and three with the same observer/camera.

I opened and inspected the actual images rather than accepting the script's PASS lines. The final Series fallback now visibly joins the resistor and diode between topology endpoints and reads +5.33 V with red on the right/black on the left of its return load. Both wire-current arrow signs are visible beside the opaque cylinder. The shadow inset shows calculated umbra, penumbra and antumbra, true target displacement and explicitly different axial/transverse km-per-pixel scales; its cross-section uses one common transverse scale for target and shadow, and the ×20 view labels cropped coverage. In the no-node state it visibly reports a 34,472 km target offset and a miss. The unchanged overview retains honest common physical scale. The before/after cosmos pictures now show larger gaps while bound markers remain readable at the same camera scale. Cage opens with Sum selected and cavity cancellation; FM opens at 100 MHz and 2.998 m.

I also read the completed coordinator browser receipt `source/build/labs-fields-final/receipt.json`: 66 of 66 fields lesson/viewport cases passed, zero recorded errors. That is separate coordinator-run evidence, not my own invocation. The independent runs above used Chromium with software WebGL and emulated viewports; they do not establish physical-device GPU performance, actual sensor calibration or a controlled learning outcome. The parent owns whole-book delivery, offline, keyboard/theme matrices and publication gates.

### Final acceptance ledger

| ID | Final verdict | Concrete basis for closure |
|---|---|---|
| C12.1 | PASS | Counted electron transfer is conserved; neutral polarisation chart now says zero net sample charge; conductor surface redistribution and smaller bound shifts differ; source/sample separation moves geometry; shell radius matches its analytic boundary. |
| C12.2 | PASS | Signal and drift have real independent clocks, share the labelled one-metre wire path, and show fast propagation versus locally slow drifting charge. Selected slow-clock screenshot displays 5000 s and 0.500 m. |
| C12.3 | PASS | Existing circuit, rope and energy-per-charge modes remain, with equal charge counters and delivered-power accounting. |
| C12.4 | PASS | Nonlinear load/source relation has its selected operating point; internal resistance affects terminal voltage; diode polarity and actual wire gap follow their selected cases. |
| C12.5 | PASS | Unequal branch values, actual series/parallel topology, branch/battery current selections and two-end voltage probes agree. Shared component leads close the fallback as well as 3D; return-branch diode and voltage polarity are correct. |
| C12.6 | PASS | Virtual live-case fault has an explicit earth, isolated or virtual-touch return state; RCD imbalance and balanced overload are distinct; the visible switch opens and currents stop. |
| C13.1 | PASS | Coherent magnetic regions have a moving wall and continuous high-field moment rotation; weighted net moment follows their orientations; cutting uses a magnetised state and leaves N/S-labelled complete pieces. |
| C13.2 | PASS | Globe site and world field share the local ENU basis; free/level needles distinguish full field from horizontal projection; device axes rotate and measured components transform accordingly. |
| C13.3 | PASS | Preserved field3d remains; new current arrow is visible; wire B is tangent and perpendicular to current/radius; probe truly moves; source/background/resultant and coil-turn contributions use shared geometry; locked tram values match its approximation. |
| C13.4 | PASS | Actual coil leads, split ring, brushes and external supply path accompany opposite currents, L×B forces and consistent torque; reverse, open/coast, hold/run and step states exist with declared omitted back emf. |
| C13.5 | PASS | Existing induction remains; generator uses separate slip rings and its emf curve scales with angular speed, vanishing at zero speed; transformer shows common flux and phase-linked induced voltages, including nonzero steady DC flux with zero sustained emf. |
| C13.6 | PASS | Inspectable in-phase transverse E/B, correct propagation/polarisation, fixed probe and linked frequency/wavelength ladder; actual slowed time and diagram amplitudes are disclosed. |
| C14.1 | PASS | Space/local views share observer time/latitude and ENU projection of Sun/stars; visible tangent horizon and apparent motion connect to a latitude-correct Foucault local/global state. |
| C14.2 | PASS | Axis stays fixed in inertial space; opposite hemispheres share one date/tilt; latitude daylight arcs, noon flux/footprints and zero-tilt limiting case are calculated from the same geometry. |
| C14.3 | PASS | Existing shared observer/overhead phase view remains; new synchronous and no-rotation face markers have correct Earth-relative versus inertial behaviour. |
| C14.4 | PASS | Fixed nodes, inclined plane, year/month geometry and computed intersections persist; cone taper is physically correct; linked shadow profiles/cross-sections make the mechanism inspectable in both 3D mode and fallback without falsifying overview scale. |
| C14.5 | PASS | Preserved tide components plus spherical differential-field sampling subtract the centre's pull and optionally add the Sun; local harbour forecasts are explicitly separated. |
| C15.1 | PASS | Independent flux/wavelength/retarding potential control collected counts, maximum KE and stopping potential with a clear single-photon threshold and model bounds. |
| C15.2 | PASS | Adjustable nucleus/atom reference rulers and common-scale unresolved nucleus avoid planetary orbits; beam-off exposure, persistent contamination and seeded individual versus ensemble decay are distinct. |
| C15.3 | PASS | Core/layers/transport/surface sequence and mass-energy account are explicit; qualified 3D halo has linked xy/xz/yz projections and a nonzero-gravity force account independently inspected by distance. |
| C15.4 | PASS | Fixed-composition temperature scan shows excitation/ionisation competition, then abundance changes independently; line depth remains labelled a population proxy. |
| C15.5 | PASS | Existing parallax remains; responsive exaggerated baseline geometry, explicit angular uncertainty and a shared Cepheid period/phase/received-flux clock connect luminosity to inferred distance. |
| C15.6 | PASS | Mass-radius-density account and exact at/above-limit model boundary remain; initial/core masses are independently selected; the comparison holds camera scale fixed so size changes are observable. |
| C15.7 | PASS | Preserved ruler remains; selected 3D observers recover expansion; a fixed camera now exposes increasing gaps and fixed bound markers, while the separate wavelength view shows redshift. |
| S02 | PASS | Pole/equator/Mumbai comparisons share elapsed time; local swing and rotating world-frame representation are one physical state, with no false globally-fixed-plane claim away from the poles. |
| S03 | PASS | External/induced/net choices exist; initial selected tab now matches Sum; transparent inspection is explicitly a physically closed electrostatic shell. |
| S06 | PASS | Equatorial axle elevation is compared with latitude; parabolic trough and variable mesh spacing share the stated wavelength reference; response is honestly qualitative. |
| S07 | PASS | Seeded 3D track and its matching projection include quantised visible grains/resolution, scattering/ionisation proxies and an explicit observation-dependent mass/speed inference interval. |
| S08 | PASS | Statistical counts reverse with spin, become 50/50 at zero alignment and have zero mean-asymmetry arrow there; mirror spin/velocity are derived from the explicit axial/polar spatial transformation. |
| S09 | PASS | A|B and B|A now exchange actual labelled identities; boson labels disappear; arrangement range changes with statistics; fixed particle/state/energy-counting assumptions are explicit and no probability rule is invented. |
| S10 | PASS | Physical ray bends toward the Sun, backward extrapolation shifts apparent star outward; true/observed directions and selected impact geometry are represented; full independent uncertainty intervals fit the plot and retain the simulated-evidence qualification. |

The original concept-group explain-backs remain the intended learner account. After these corrections, the scene/diagram/readout combinations support those accounts without the misconceptions identified in the initial review. No scoped physics or missing-mechanism blocker remains in this final candidate.
