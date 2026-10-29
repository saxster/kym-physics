# Fresh live visual audit — fields, sky and modern physics

29 October 2026. Scope: all33 added fields lessons at mobile and desktop widths. **Baseline review complete: all 33 lessons personally inspected on mobile and desktop, default and changed states. Final fixed-state visual acceptance remains pending.** Only fresh images from this audit qualify as visual evidence. Prior source/numerical reviews are background, not visual acceptance.

Each lesson must show readable labels/values, usable controls, coherent default and changed states, and a causal explanation suitable for a twelve-year-old. Shared kit issues are coordinated by root.

## Per-lesson review register

| Lesson | Title | Visual status |
|---|---|---|
| charge | Charge moves; neutral objects respond | Inspected mobile + desktop, default + changed; fixes need fresh render |
| cage | Inside a conducting shell | Inspected mobile + desktop, default + changed; fixes need fresh render |
| circuit-signal | Slow electrons, fast signal | Inspected mobile + desktop, default + changed; fixes need fresh render |
| circuit-diagnose | Find the dark LED | Inspected mobile + desktop, default + changed; fixes need fresh render |
| circuit-probes | Measure two branches | Inspected mobile + desktop, default + changed; fixes need fresh render |
| protection | A fault in the case | Inspected mobile + desktop, default + changed; fixes need fresh render |
| domains | Domains inside a magnet | Inspected mobile + desktop, default + changed; fixes need fresh render |
| earth-field | A compass that can dip | Inspected mobile + desktop, default + changed; fixes need fresh render |
| field-probe | Add wire and Earth fields | Inspected mobile + desktop, default + changed; fixes need fresh render |
| motor | Step inside a motor | Inspected mobile + desktop, default + changed; fixes need fresh render |
| generator | Turn a generator | Inspected mobile + desktop, default + changed; fixes need fresh render |
| transformer | Two coils, one changing field | Inspected mobile + desktop, default + changed; fixes need fresh render |
| em-wave | Two fields across a gap | Inspected mobile + desktop, default + changed; fixes need fresh render |
| day-night | Earth turns beneath the sky | Inspected mobile + desktop, default + changed; fixes need fresh render |
| seasons3d | Tilt, sunlight and daylight | Inspected mobile + desktop, default + changed; fixes need fresh render |
| moon-rotation | The Moon has to turn | Inspected mobile + desktop, default + changed; fixes need fresh render |
| eclipses | Find an eclipse by geometry | Inspected mobile + desktop, default + changed; fixes need fresh render |
| tides3d | Subtract Earth’s central pull | Inspected mobile + desktop, default + changed; fixes need fresh render |
| photoelectric | Count photons and electrons | Inspected mobile + desktop, default + changed; fixes need fresh render |
| atom-scale | An atom is mostly space | Inspected mobile + desktop, default + changed; fixes need fresh render |
| radiation-decay | Exposure, contamination and decay | Inspected mobile + desktop, default + changed; fixes need fresh render |
| solar-fusion | From the solar core to light | Inspected mobile + desktop, default + changed; fixes need fresh render |
| halo | A halo around L1 | Inspected mobile + desktop, default + changed; fixes need fresh render |
| stellar-spectrum | Same hydrogen, different lines | Inspected mobile + desktop, default + changed; fixes need fresh render |
| distance-ladder | From a blink to a distance | Inspected mobile + desktop, default + changed; fixes need fresh render |
| white-dwarf | More mass, smaller dwarf | Inspected mobile + desktop, default + changed; fixes need fresh render |
| cosmos | Choose another galaxy | Inspected mobile + desktop, default + changed; fixes need fresh render |
| foucault | A pendulum and a turning Earth | Inspected mobile + desktop, default + changed; fixes need fresh render |
| telescope | An axle parallel to Earth’s | Inspected mobile + desktop, default + changed; fixes need fresh render |
| tracks | Read a track through emulsion | Inspected mobile + desktop, default + changed; fixes need fresh render |
| parity | Nature and its mirror | Inspected mobile + desktop, default + changed; fixes need fresh render |
| bose-counting | Count states, not labels | Inspected mobile + desktop, default + changed; fixes need fresh render |
| eclipse-evidence | Measure a tiny displaced star | Inspected mobile + desktop, default + changed; fixes need fresh render |

## Confirmed paired-board findings

All 33 fresh `boards-fields-before/{id}.png` boards were opened personally. Each contains mobile and desktop defaults plus changed state with its explanation. This is a before-fix diagnosis, not final acceptance. Horizontal green lines and translucent toolbars are fixed reading chrome captured within full-figure clips; they are not physical geometry.

- **Motor:** split-ring and brush labels overlap; small apparatus and graph lettering are hard to read; changed No reversal mode still depicts a split ring and says it reverses current. The negative torque readout lacks a signed graph reference. Domain source now switches to continuous slip rings, adds a visible open supply switch, gives signed numeric axes and changes its explanation with mode. A separate actual-factory test found that ordinary Play did nothing until Run/hold; that gate is fixed and tested.
- **Circuit diagnosis:** forward mode reads 21.20 mA but plots zero; reversed mode reads zero but plots about 21 mA. The dot and current readout now use the same polarity. The explanatory card now explains internal voltage drop, with separate open/reversed accounts. Both scenes need the shared framing, text sizing and control-position fixes.
- **Both:** original drawing captions describe absent views or different curves. Root is hiding them during the added live view and retaining drawing/print text.

## Domain improvements awaiting fresh visual verification

All 33 cards now state a cause before naming the model. Named probe measurements replace bare selector numbers. Static studies hide no-op Play. Temporal studies expose a labelled model clock and its animation rate; finite-time studies stop instead of silently resetting to an earlier state. Replay is explicit. Radioactive contamination counts the 24 displayed nuclei, while beam-only exposure no longer shows an unrelated decay curve. Free-electron population icons no longer orbit their former nuclei.

`node source/tests/test_fields_labs.mjs` passes the actual 33-factory scene/fallback matrix, numeric references, graph/readout agreement, motor Play/hardware, named probes, mode-specific playback/explanations and clock-rate checks. These are source/API tests; they do not certify browser appearance or usability. Final acceptance remains pending fresh rebuilt/live screenshots for every lesson.

## Full per-lesson baseline findings

| Lesson | Observed mechanism or defect | Targeted correction |
|---|---|---|
| charge | Transferred and polarised charges conserve the visible count; changed conductor remains neutral, with removed electrons at far left. | Cause-first charge-transfer/polarisation account; hide static Play. |
| cage | Default total field vanishes inside; selecting external arrows leaves total graph/readout unchanged, requiring clear total-versus-selected wording. | Numeric field/position axes; explain cancellation; hide static Play. |
| circuit-signal | At 5000 s drift the identical evenly spaced dots produce the same snapshot as the initial arrangement. | Add one distinguished tracked electron plus fixed start ring in 3D/diagram; state independent clock rates. |
| circuit-diagnose | Default readout reports 21.20 mA while the graph dot is at zero; reversed mode reports zero but the dot floats at roughly 21 mA. | Use the same reversed-polarity boolean for plotted dot and measured readout; actual-factory marker regression verifies all four modes. |
| circuit-probes | Bare probe values 0 and 4 conceal what is selected; current mode is incorrectly labelled voltage probes. | Name all five measurement choices; separate current/voltage local labels and hide black voltage endpoint in current mode. |
| protection | Changed fault visibly opens switch and current goes to zero; original caption/control remoteness obscures the mechanism. | Explain return imbalance versus balanced overload; static Play hidden; shared layout changes. |
| domains | Separated pieces each show N/S and complete dipoles; no-op Play and explanatory instructions add friction. | Explain cancellation, domain-wall growth and complete magnets; hide static Play. |
| earth-field | Held-level needle projects horizontally while world field keeps its downward component; tiny vectors/labels weaken the comparison. | Shared larger framing/labels plus causal account of mechanical constraint versus full field. |
| field-probe | Reversed wire contribution changes the resultant while north component remains; small 3D resultant and unnumbered strength curve are hard to compare. | Numeric magnetic field/distance axes, causal vector-sum explanation, shared framing. |
| motor | No reversal still shows split-ring commutator hardware, although its readout claims fixed-sign coil current. | Display two continuous slip rings in this mode; retain split halves only in commutated mode; show an open switch in open mode. |
| generator | Maximum flux and emf extrema differ, but the signed graph has no zero line and slip-ring/voltmeter labels overlap. | Signed numerical relative display scale with explicit two-unit key; shared collision layout. |
| transformer | Steady DC still has Play and an explanation referring to reversing flux; graph lacks zero/numeric voltage references. | Disable steady-state Play, mode-dependent causal account, zero reference and signed numeric voltage scale. |
| em-wave | Green-light preset changes the spectrum marker and transverse orientation; spectrum/field labels are tiny. | Shared readable annotations and causal field-pattern account; retain explicit slowed clock. |
| day-night | Local horizon shows morning Sun east; globe, observer and stars are tiny in the space view. | Meaningful labelled solar-time playback and tighter framing; explain opposite apparent sky motion. |
| seasons3d | Globe is too small to inspect tilt or daylight arcs; footprint values are tiny and explanation is instructions. | Enlarge schematic globe consistently with its axis/arcs; disclose size scale, add causal sunlight/daylength account and explicit advancing year clock. |
| moon-rotation | Fallback diagram only shows two dots on a line and never draws the marked face, so it fails to explain axial rotation. | Top-down orbit plus same marked-face vector as 3D; disclose schematic sizes; explicit lunar clock. |
| eclipses | Physical-scale bodies are unresolved and labels collide; actual shadow cut is the useful inspection view but its labels are tiny. | Shared readable annotations/nonoverlap; keep physical overview, explicit scaled cut, causal node/alignment account and labelled phase playback. |
| tides3d | Absolute lunar pull is still labelled differential arrows, contradicting the chosen mode; signed equilibrium graph has no zero. | Separate mode labels/explanations; label differential graph independently, add zero and numeric scale; disable Sun toggle in lunar-only absolute mode. |
| photoelectric | Bright-red state correctly emits no electrons, but KE and photon/work bars secretly use different energy scales. | Use one common 4.2 eV scale for photon, work, maximum KE and retarding barrier bars, with numeric labels and explicit same-scale caption. |
| atom-scale | Common-scale nucleus becomes unresolved as intended, but cloud/nucleus have no local labels and original caption discusses radiation. | Add local probability-cloud/enlarged-nucleus labels; cause-first size-ratio account; static Play hidden. |
| radiation-decay | Dust state contains 24 displayed nuclei but plot uses 100-nucleus expectation/dot; apparatus shrinks markedly. | Match N24 count/expectation, beam-only diagram rather than decay curve, visible distant-beam source for dust comparison; explicit finite decay clock/replay. |
| solar-fusion | Transport selector gives only 0/2 although the stages represent different mechanisms; Stage0 Play does nothing. | Named stage values; enable Play only for actual transport; explain fusion account and transport causes. |
| halo | Three projections share the changed craft point, but small 3D path/readout and instruction-only explanation obscure why gravity is nonzero. | Cause-first required-inward-acceleration account, explicit schematic halo clock; shared framing/annotations. |
| stellar-spectrum | Temperature change removes visible line depth but free-electron icons remain clustered around nuclei; curve lacks temperature mapping/selected point. | Static unbound population region, labelled temperature range and selected-temperature marker; hide unrelated Play. |
| distance-ladder | Cepheid selected state retains the irrelevant parallax triangle; all controls stay active in both modes. | Hide parallax apparatus during star pulse, disable unrelated controls, explicit finite clock/replay and numeric mean-flux axis. |
| white-dwarf | Fixed camera makes the radius shrink clearly, but plot has no numeric ticks and explanation names a relation rather than its support. | Retain fixed camera; add numeric radius/mass axes and accurate complete-quantum-state explanation. |
| cosmos | Fixed camera preserves expansion visibly, but all six galaxies look identical so selected observer is not identified. | Colour/label the observer at origin; numeric Hubble axes and causal equal-fractional-separation account. |
| foucault | Pole/Mumbai/equator circles differ correctly; globe and bob apparatus are small and Play does not advance precession clock. | Label and advance sidereal clock at disclosed rate; separate bob display clock, stop/replay; causal latitude dependence. |
| telescope | Changing axle produces visible misalignment, while instruction-only explanation does not connect latitude to Earth-axis elevation. | Cause-first alignment/mesh explanation; hide static Play and shared framing/annotations. |
| tracks | Resolution enlargement makes grains visibly larger and widens inferred interval; dense readout/diagram type is hard to read. | Causal scattering/resolution account, hide static Play, shared readable measurements; retain uncertainty and identification limits. |
| parity | Selected mirror reverses red spin while blue polar-velocity pattern remains; explanatory jargon hides why comparison matters. | Cause-first mirror/correlation explanation; hide static Play, readable vector/count labels. |
| bose-counting | Labelled-to-boson selection reduces four cards to three and removes A/B identities; one-particle-state labels overlap. | Shared label collision fix; causal identity/exclusion account and hide static Play. |
| eclipse-evidence | Larger uncertainty spans all three predictions, but small graph reference labels and instruction-only explanation obscure evidence limits. | Causal uncertainty/discrimination account and readable references; hide static Play. |

## Independent review of shared changes

This reviewer did not author the shared core, lab kit, Three kit, annotation layout, visible-bounds code or CSS. Source review found no further blocker in hidden-object framing, frustum geometry, explicit fixed-radius comparisons, pause/close frame scheduling, control/readout order, active-view captions/accessibility names, or separate object-label placement and leader anchors. The shared layout and existing annotation fidelity suites pass. The JSON register records exact reviewed file hashes. Dense eclipse annotation layouts and authored array-anchor plate occlusion still require actual candidate screenshots; source review does not accept those appearances.

## Candidate mobile review

All 33 first-candidate 390 px default/changed boards were personally opened. The circuit operating point, signed torque and slip-ring mode, dust count, named probes/stages, mode-specific playback and Cepheid apparatus changes render consistently with their readouts. Enlarged annotations exposed a further problem: opaque caption plates hid several plotted curves, the atom nucleus, a lunar disk, the spectrum peak and parts of the eclipse cone. Those findings triggered shared normal-flow headers/bottom gutters plus targeted field label/caption changes. Initial selected visibility is now established before first scene fitting. This first candidate predates those last corrections and therefore is not accepted as final. The JSON register names each affected case.

## Candidate desktop review and final source gate

All 33 desktop default/changed paired boards in `boards-desktop-candidate/` were personally opened. The last six were also independently inspected by the mechanics reviewer. The circuit operating point, probe selection, signed torque, transformer DC state, named transport stages, linked halo projections at 35.58 model days, Cepheid phase, dwarf radius, Hubble observer, particle inference and uncertainty interval are readable and consistent with their selected controls and numerical accounts.

That second review found two wording inconsistencies: the boson diagram retained a labelled-particle A/B footer, and the Foucault clock called ordinary 3600-second hours “sidereal hours”. The footer is now mode-specific; the Foucault selector says Elapsed time and its account explicitly states 3600 seconds per hour and 23.93447 hours per sidereal rotation. Numerical models and geometry are unchanged. The 33-factory scene/fallback suite passes 680 finite-state checks after these corrections. Both captions still require fresh rendered/live confirmation.

The refined mobile pairs for atom-scale, circuit-probes, motor, eclipses and distance-ladder were personally opened and pass their targeted occlusion/control corrections. These results do not substitute for the final published 33-lesson matrix.

Independent shared-source review is PASS, including the final annotation header/footer and retained-parent changes, object-label offsets/reset projection, pause/playback guards, and native memoized sRGB conversion of the opaque wide-gamut palette before Three parses it. The CSS colour and visual-layout suites were independently rerun and pass. Exact reviewed hashes are recorded in the JSON register. Parent reports actual three-theme responsive browser checks pass; this reviewer keeps that rendering evidence distinct from its source review.

Final candidate `9ff53a303e3f`: all four fresh stable Bose/Foucault default/changed desktop screenshots in `candidate-final/` were personally opened. Both caption corrections pass: labelled A/B language is absent in identical-particle modes; ordinary elapsed hours and the sidereal-day rotation are explicitly distinguished. Their targeted candidate findings are closed. Final published per-lesson acceptance remains pending.

## Published live A review

All 33 demonstrations were captured at 390×844 and 1440×1000 on the public textbook after commit `6dc2858637e4d80f1419c498c9f873c7ca2ec1dc` (cache `mw-4ae3460b3b81`). Every default and meaningful changed state was personally opened: 132 photos. All 66 action recipes succeeded and both native browser error logs are empty. Each photo records the actual public URL, exact viewport, Sepia theme, opening-animation class absent and stage transform none.

31 lessons pass the live mobile/desktop review. Two require follow-up publication and fresh both-width inspection: the current-probe diagram retained a voltage-probe footer; the atom reference diagram hid its blue ruler beneath inline caption plates. Source fixes now select the footer for the measurement and move both colour-labelled ruler values/units into a normal-flow header. Both original ruler segments and all physics models are unchanged. Actual renderer tests check all five probe selections and the two ruler lengths at 1, 5, 10 units; the 680-state suite passes. The per-ID JSON records the specific observed mechanism and actual readouts, and keeps these two IDs pending until their updated live photos are inspected.
