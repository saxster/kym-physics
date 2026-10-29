# Living physics: complete implementation and verification plan

29 October 2026. Authorised scope: every recommendation in the preceding textbook audit, including the items previously marked Next and Later. Baseline: 90 numbered sections, 36 live widgets, 95 stories, three main explorers and the map. Existing useful demonstrations stay available. No recommendation is completed merely by adding a button or a generic moving scene.

## Outcomes and contracts

Each lesson has a stable ID in `source/lessons/*.json`, a chapter/figure placement, explicit question, explanation, limitations and primary sources. The catalog is executable build input. Every record must resolve to a real lesson implementation and an accessible book entry. The acceptance register below preserves the audit's scope independently of the implementation catalog.

The public verification boundaries are the exported physics models (independent worked values, invariants and limiting cases), the built book in real browsers (input → scene/diagram/readout → journal), generated provenance/coverage, and the existing offline/print engine. User requested verification of all of these. No network accounts, sensor permission, publication or external data upload is needed for implementation.

Each scene follows predict → manipulate → see the mechanism → connect measured representations → explain a new case. A fixed calculated diagram remains useful without WebGL. The static engraved drawing remains the reading and print fallback. Two or three primary subject controls; additional cases belong in named presets. No audio/sensor activation without an explicit request. Local predictions and explain-backs enter notebook export/backup.

## Complete acceptance register

All 108 obligations below are implemented and verified within the software/browser evidence boundary. IDs are audit obligations; lesson IDs cover multiple obligations only where actual controls and visual evidence prove each one. See [verification](threejs-verification.md) and the [machine-readable coverage](threejs-coverage.json). Physical-device performance and human learning outcomes remain unverified.

| ID | Placement | Required observable teaching behaviour | Final status |
|---|---|---|---|
| C00.1 | 0.1 | Horizon ship/eye height; sphere/disc shadow comparison; observations versus models | VERIFIED |
| C00.2 | 0.2 | Ruler resolution, repeated scatter and independent zero error | VERIFIED |
| C00.3 | 0.3 | Preserve logarithmic scale; distinguish length, area and volume ratios | VERIFIED |
| C00.4 | 0.4/case | Rain depth × city area; linked globe, local shadows and circumference | VERIFIED |
| C01.1 | 1.1/case | One bounce/trains event, two frames, same clock | VERIFIED |
| C01.2 | 1.2 | Distance/displacement and average/instantaneous velocity with linked graph | VERIFIED |
| C01.3 | 1.3 | Four velocity/acceleration signs; constant-speed turning via vector differences | VERIFIED |
| C01.4 | 1.4 | Equal-time marks 1:4:9:16 linked to motion and graphs; rolling/sliding distinction | VERIFIED |
| C01.5 | 1.5 | Scrubbed toss with position/velocity/acceleration through apex; preserve video | VERIFIED |
| C02.1 | 2.1 | Departing hand and source-named forces on sliding book | VERIFIED |
| C02.2 | 2.2 | Arrow continues without stored forward force; drag source visible | VERIFIED |
| C02.3 | 2.3 | Compare friction tending to zero; preserve existing ramp | VERIFIED |
| C02.4 | 2.4 | Braking train passenger, feet and bag in two frames | VERIFIED |
| C02.5 | 2.5/case | Sticking/sliding contact junctions; tablecloth impulse versus pull duration | VERIFIED |
| C03.1 | 3.1 | Angled force addition and resultant separated from velocity | VERIFIED |
| C03.2 | 3.2 | Adjustable mass and applied force, a=F/m | VERIFIED |
| C03.3 | 3.3 | Spring/sponge/ruler/table deformation and tilted normal | VERIFIED |
| C03.4 | 3.4/case | Forces on selected object versus interaction pair; equal force unequal acceleration | VERIFIED |
| C03.5 | 3.5 | Preserve carts; astronaut recoil, successive exhaust parcels, momentum/COM | VERIFIED |
| C04.1 | 4.1 | Mass cancellation under gravity; dense-ball comparison | VERIFIED |
| C04.2 | 4.2 | Independent shape/mass/air controls and terminal-force balance | VERIFIED |
| C04.3 | 4.3 | Independent gravity/air settings distinguish vacuum from lunar g | VERIFIED |
| C04.4 | 4.4/case | Common fall time; moving-car release in two frames | VERIFIED |
| C04.5 | 4.5 | Inward acceleration, tangent on release, retained rotating-frame modes | VERIFIED |
| C05.1 | 5.1 | Apple/Moon tangent comparison, barycentre and inverse-square sphere surfaces | VERIFIED |
| C05.2 | 5.2 | Preserve cannon; station/astronaut shared fall; scale and accelerometer support | VERIFIED |
| C05.3 | 5.3 | True/enlarged eccentricity, equal-time areas and period-size comparison | VERIFIED |
| C05.4 | 5.4 | Torsion-balance masses change equilibrium; honest magnified angle/disturbance | VERIFIED |
| C05.5 | 5.5/case | Perturber toggled; separate residual plot and unseen-planet prediction | VERIFIED |
| C05.6 | 5.6 | Orbit-raising velocity impulse, later apogee change, coast/capture, scale bars | VERIFIED |
| C06.1 | 6.1 | Pressure normal to six faces; same weight different contact areas | VERIFIED |
| C06.2 | 6.2 | Barometer pressure balance; mercury/water common height scale | VERIFIED |
| C06.3 | 6.3 | Straw/hemispheres driven by pressure difference, no vacuum pull | VERIFIED |
| C06.4 | 6.4 | Equal depths in vessels; integrated dam load; retain calculated jets | VERIFIED |
| C06.5 | 6.5/case | Hull/cargo/displaced volume; layered-fluid egg; retain current buoyancy | VERIFIED |
| C07.1 | 7.1 | Select accounting boundary; preserve stores/real rubber cutaway | VERIFIED |
| C07.2 | 7.2 | Force-time versus force-distance impact comparison; double speed p×2 K×4 | VERIFIED |
| C07.3 | 7.3 | Same load via stairs/ramp/lift; force-displacement angle; slide versus roll | VERIFIED |
| C07.4 | 7.4 | Dissipation remains in enlarged system account | VERIFIED |
| C07.5 | 7.5 | Appliance power as energy-graph slope and cumulative household energy | VERIFIED |
| C07.6 | 7.6/case | Turbine/generator/Sankey; loaded magnet-wheel drains identified store | VERIFIED |
| C08.1 | 8.1 | Joule weight/paddle/temperature account | VERIFIED |
| C08.2 | 8.2 | Temperature distribution versus sample size and total transferred energy | VERIFIED |
| C08.3 | 8.3 | Preserve conduction; calculated gradient and contact mechanism | VERIFIED |
| C08.4 | 8.4 | Insulation slows both warming and cooling; layer thickness | VERIFIED |
| C08.5 | 8.5 | Phase fraction, particle arrangement, energy and thermometer through plateaux | VERIFIED |
| C08.6 | 8.6/case | Evaporation selection/humidity, matka limits, coastal convection and May/July | VERIFIED |
| C09.1 | 9.1 | Pendulum length/mass/amplitude comparison, restoring force and period | VERIFIED |
| C09.2 | 9.2 | Timed swing drive/damping/energy; separate steady-flow flutter | VERIFIED |
| C09.3 | 9.3 | Wave surface and tracked local parcel versus advancing crests | VERIFIED |
| C09.4 | 9.4/case | Longitudinal sound in volume, fixed particles and pressure; echo round trip | VERIFIED |
| C09.5 | 9.5 | Preserve mic; synthetic amplitude/frequency controls, no invented calibration | VERIFIED |
| C09.6 | 9.6 | String and actual membrane nodal modes; syahi overlay and corresponding audio | VERIFIED |
| C09.7 | 9.7 | Preserve emission-centred wavefronts; movable listener and driver | VERIFIED |
| C10.1 | 10.1 | Lamp-object-eye path; dark room, occlusion and sampled scattered directions | VERIFIED |
| C10.2 | 10.2 | Open pinhole box, multiple points, hole/distance controls; extended-source shadows | VERIFIED |
| C10.3 | 10.3 | Preserve mirror; oblique observer, spoon and image transition | VERIFIED |
| C10.4 | 10.4/case | Preserve Snell view; fixed-eye disappearing coin and total-internal light guide | VERIFIED |
| C10.5 | 10.5 | Preserve focus/glasses/half pupil; underwater/goggles and computed retinal image | VERIFIED |
| C10.6 | 10.6 | Io emission/reception clocks and Earth geometry; Fizeau story | VERIFIED |
| C11.1 | 11.1 | Two-prism selecting slit and droplet-to-observer rainbow geometry | VERIFIED |
| C11.2 | 11.2 | Preserve colour mix; incoming × reflectance → outgoing spectrum/cone responses | VERIFIED |
| C11.3 | 11.3 | Preserve scattering; linked globe/atmosphere direct versus scattered paths | VERIFIED |
| C11.4 | 11.4/case | Rotating polariser, field projection/intensity, Brewster angle and water glare | VERIFIED |
| C11.5 | 11.5 | Preserve interference; probe path/phase/intensity, slit/disc/Arago calculated wave views | VERIFIED |
| C11.6 | 11.6 | Raman vibration/energy/spectrum; elastic/Stokes/anti-Stokes distinction | VERIFIED |
| C12.1 | 12.1 | Charge transfer/conservation, neutral polarisation, conductor/insulator and shell cancellation | VERIFIED |
| C12.2 | 12.2 | Preserve loop; slow local drift versus separately scaled signal | VERIFIED |
| C12.3 | 12.3 | Preserve rope/energy modes; charge conserved and energy delivered | VERIFIED |
| C12.4 | 12.4/case | Circuit operating point/internal resistance; voltage/polarity/open-loop diagnosis | VERIFIED |
| C12.5 | 12.5 | Preserve series/parallel; unequal branches, voltage and current probes | VERIFIED |
| C12.6 | 12.6 | Virtual appliance fault, earth path, RCD current imbalance versus overload | VERIFIED |
| C13.1 | 13.1 | Schematic domain walls and rotation; cut magnet yields complete magnets | VERIFIED |
| C13.2 | 13.2 | Earth with unconstrained/constrained needle, local/world sensor axes | VERIFIED |
| C13.3 | 13.3/case | Preserve field3d; movable probe, superposition, coil contributions, tram case | VERIFIED |
| C13.4 | 13.4 | Working coil/brushes/commutator/current/force/torque; reverse/open/step | VERIFIED |
| C13.5 | 13.5 | Preserve induction; rotating generator flux/emf and separate transformer | VERIFIED |
| C13.6 | 13.6 | Inspectable perpendicular in-phase E/B wave, fixed probe, polarisation and ladder | VERIFIED |
| C14.1 | 14.1 | Earth/local horizon/apparent sky plus latitude-correct Foucault model | VERIFIED |
| C14.2 | 14.2 | Fixed axis, opposite hemispheres, footprints/daylight, zero tilt | VERIFIED |
| C14.3 | 14.3 | Preserve phases; shared observer view and rotation versus no-rotation near side | VERIFIED |
| C14.4 | 14.4 | Inclined planes, nodes, geometric shadow cones and year/month alignment | VERIFIED |
| C14.5 | 14.5/case | Preserve tide components; spherical differential field and Sun; local data separated | VERIFIED |
| C15.1 | 15.1 | Preserve photon threshold; independent flux/frequency, count/KE/stopping potential | VERIFIED |
| C15.2 | 15.2 | Atom/nucleus scale, exposure/contamination source off, random/ensemble half-life | VERIFIED |
| C15.3 | 15.3 | Core/transport/surface and fusion mass account; 3D L1 halo clearly qualified | VERIFIED |
| C15.4 | 15.4/case | Fixed composition temperature scan, then independent abundance | VERIFIED |
| C15.5 | 15.5 | Preserve parallax; baseline/uncertainty and Cepheid curve-luminosity-distance | VERIFIED |
| C15.6 | 15.6 | White dwarf mass/radius/density, stable-model boundary; initial/core mass separated | VERIFIED |
| C15.7 | 15.7 | Preserve observer ruler; 3D observer switching, bound sizes, expanding gaps/redshift | VERIFIED |
| S01 | Fizeau | Wheel/light round trip and extinction speed | VERIFIED |
| S02 | Foucault/Aryabhata | Latitude/pole/equator comparison, same physical state in local/global views | VERIFIED |
| S03 | Faraday cage | External/induced/net fields; inspection opening not a physical opening | VERIFIED |
| S04 | Engines/caloric | Work and hot/cold reservoir energy accounts; no destroyed energy | VERIFIED |
| S05 | Stevin | Wreath on unequal ramps, components and balance | VERIFIED |
| S06 | Swarup | Equatorial telescope axle and mesh/wavelength comparison | VERIFIED |
| S07 | Chowdhuri | 3D schematic track/projection, grains/scattering/inference uncertainty | VERIFIED |
| S08 | Wu | Spin, statistical electron asymmetry and properly transformed mirror experiment | VERIFIED |
| S09 | SN Bose | Occupancy versus labelled-particle counting, explicit assumptions | VERIFIED |
| S10 | Eclipse 1919 | Apparent position shifts plus independent measurement uncertainty | VERIFIED |
| S11 | Arago/Raman/tabla | Shared chapter experiments open at story-specific preset | VERIFIED |
| S12 | Other stories/map | Relevant shared experiments linked; historical/evidence-only stories retained | VERIFIED |
| E01 | Stage | Reset/presets, clipping, honest scale, WebGL2 failure/context loss, owned cleanup | VERIFIED |
| E02 | Rendering | Stable meshes/buffers and shared ownership, no per-frame scene reconstruction | VERIFIED |
| E03 | Teaching | Real visual mechanisms, predictions, explain-back, notebook exports | VERIFIED |
| E04 | Delivery | Lazy chunks, main HTML <4 MiB, ordinary chunks <150 KiB, offline cache | VERIFIED |
| E05 | Verification | Independent physics review; all lessons browser-tested mobile/desktop; theme/keyboard/fallback | VERIFIED |
| E06 | Astronomical prose | Actual-date prompts match capability; educational models not forecasts | VERIFIED |

## Ordered implementation slices

1. **Foundation and catalog.** Implement shared lesson shell, multi-experiment figure entry, notebook journal, sources and coverage validation. Add a fixture that opens two alternatives without losing the original demo. Check no eager chunk loading and exact focus restoration. Files: build/runtime, lab kit, notebook, catalog tests. Depends: none.
2. **Stage lifecycle.** WebGL2-only detection; camera presets/reset; clipping; owned-resource cleanup and context-loss fallback. Repeated opening, failed context, keyboard and paused resize checks. Depends: 1.
3. **Mechanics/fluids/energy slices.** Each C00–C07 group delivers model tests, distinctive views, source grounding and catalog entries; maintain prior widgets. Depends: 1–2.
4. **Thermal/waves/optics slices.** Each C08–C11 group delivers the same complete path. Do not conflate physical optics with transparent materials or surface modes with audio frequencies. Depends: 1–2.
5. **Fields/sky/modern slices.** Each C12–C15 group delivers the same complete path, including the motor pilot and all Later items. Do not substitute manually set alignment labels for computed eclipse geometry. Depends: 1–2.
6. **Story/map/explorer integration.** Shared scenes open directly from the story and explorer; preserve return context and introductory explanations. Resolve unique S01–S12 obligations and E06 prose. Depends: relevant lesson.
7. **Independent review.** Fresh physics and learner-facing reviewers compare every accepted obligation to actual code and rendered results. Record gaps explicitly; fix all confirmed failures. Depends: 3–6.
8. **Full verification and local build.** Run all numerical checks, source/build validation and browser matrices; inspect screenshots; fix and repeat affected checks. Build reviewable site output and update exact coverage/evidence receipt. Depends: 7.

## Checkpoints and verification

After each domain: public pure-model tests, build and focused browser interactions. Final matrix: every lesson at 390×844 and 1440×1000, all three themes; representative lessons at 320/768/820/1024/1180; every control at least one nondefault state; moving scenes play/pause; no console errors/nonfinite numbers; 3D and forced fallback; no audio/sensor starts; keyboard; local journal/backup; story return; print stills; service-worker offline reload and opening lessons. Existing 36 widgets and all explorers must still pass. Chromium and WebKit cross-browser coverage where installed. Actual hardware sensors, a physical Android GPU and human learning outcomes are separate evidence boundaries; do not claim them from emulation.

Reference numerical oracles include g=9.8, 1 m pendulum ≈2.00709 s, Mumbai Foucault ≈4.91675°/h, calcium 380 nm KE≈0.552742 eV, circular/escape at Earth radius+10 km ≈7.90359/11.17736 km/s. Each domain supplies additional independent values and limits.

Physics caveats: distinguish rolling from sliding; ice's open lattice contracts on melting; temperature is a distribution property; no planetary electron orbits; photon icons are not classical trajectories; no material travelling on field lines; E/B directions are perpendicular with separately scaled amplitudes; a Foucault plane is not globally fixed at all latitudes; ideal tides are not harbour predictions; schematic halo paths are not mission ephemerides; quantum state counting requires explicit assumptions.

## Evidence and completion

Completed all eight slices: 109 added lessons across all 16 chapters, all 108 acceptance obligations, 90 linked stories, preserved original demonstrations and completed independent review. The final frozen build is `mw-5539b5376f34`. Detailed results and evidence boundaries are in [threejs-verification.md](threejs-verification.md).

VERIFIED requires both a concrete learner-visible implementation and applicable model/browser evidence. Human/hardware checks remain unverified as stated in that report. The build is locally reviewable; publication is separate. An individual lesson can be removed through its catalog entry while preserving its source and model tests; existing primary widgets remain available.
