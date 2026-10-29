# Independent mechanics and learner-fidelity gate

29 October 2026. Fresh reviewer; did not write these implementations. Scope is the
accepted C00–C07 and S05 rows in `docs/threejs-implementation-plan.md`, not merely
the catalog's narrower claims. Reviewed current source: `w_mechanicslab.js`, all
`mechanics_*` modules, catalog, grounding, original chapter placements and retained
widgets. Public model and geometry suites pass. **This is a source/mechanism
audit, not a new final-build screenshot receipt.** The old focused-browser receipt
cannot certify the latest source. Rebuild and visually test every corrected scene.

Verdicts: READY means the required mechanism exists in source and is a candidate
for browser verification, not VERIFIED. GAP means a named accepted obligation is
missing. GEOMETRY means numerical accounts and visible apparatus disagree.

## Per-ID acceptance audit

| ID | Verdict | Actual evidence and required action |
|---|---|---|
| C00.1 | READY / geometry caution | `horizon` has eye/range and curved/flat alternatives; `shadowshapes` uses a real circular disc and computed elliptical projection. The ship's actual mesh is not occluded by the calculated hidden height: the calculated 2D strip is the trustworthy visibility comparison. Keep overview explicitly nonmeasuring and test eye/range extremes. |
| C00.2 | READY | Independent resolution, repeat scatter, bias controls and a graduated endpoint strip exist. Deterministic illustrative samples are disclosed. |
| C00.3 | READY | Existing logarithmic explorer retained; `scale` has s/s²/s³ cube and bars. The catalog says count unit squares/cubes but meshes have no subdivision: optional improvement, not an additional accepted requirement. |
| C00.4 | GAP | Rain area/depth calculation and enlarged water layer work. `shadows` links a globe, rods, parallel rays and numerical circumference, but draws no ground shadow or local shadow-angle inset. Add actual shadow vectors on local tangent planes and the angle between ray/local vertical; show the central-angle equivalence geometrically. |
| C01.1 | READY | Frames subtract observer position from the same bounce events and common clock. Original and trains alternatives remain. Test wrap disclosure and high-speed clipping. |
| C01.2 | READY | Original `graphwalk` links a corridor walker to graph point; `graph` adds accumulated distance/displacement, secant interval and smooth-motion derivative. Keep both accessible. |
| C01.3 | READY | Independent signed v0 and a cover all four cases; `circle` explicitly constructs nearby equal-speed velocity vectors and their inward difference. |
| C01.4 | GAP | `galileo` links 0,1,4,9,16 samples and x–t/v–t points. Rolling/sliding changes only model numbers: the normalized ramp/motion/graphs look identical and no rolling rotation is visible. Add a marked rotating sphere with angle s/R, versus a nonrotating slider, and a shared physical distance scale or labelled auto-scale. |
| C01.5 | READY | Scrubbed toss graphs share time and apex marker; h/v/a numerical readout persists through apex; original video remains. |
| C02.1 | GEOMETRY / source-label gap | Hand visibly departs and force becomes zero. Book bottom is −.24 while table top is −.265 (gap .025 scene units); hand finger right edge and book edge should also be checked. Readout says friction but should explicitly identify **table on book**; include Earth/table vertical force account or scope arrows explicitly as horizontal only. |
| C02.2 | GAP | No live arrow-flight renderer or catalog alternative exists for `c2_arrow_forces`. A static original picture is not the required new observable arrow continuing after launch with source-named drag. Implement arrow/velocity/gravity/air, launcher departure and independent air-off comparison. |
| C02.3 | READY | Original `ramp` retains angle and friction-to-zero; puck/sliding distinction is explicit. |
| C02.4 | GAP | `frames(...,'braking')` shows a floating head marker and feet but no bag, actual connected passenger or contact-force arrow. Add passenger/feet and free bag from the same initial state in both frames; floor contact decelerates feet while the unrestrained bag retains ground velocity. Label short-time schematic limit. |
| C02.5 | GAP / GEOMETRY | Static/kinetic force law works. Junction blocks lie entirely in the gap: upper bottom +.35, lower top −.35, junction half-height only .06–.21. They never touch both surfaces and their positions only jump by a small sinusoid at slip; no deformation/breaking evolution exists. Put junctions in actual contact and animate deformation/break/reformation under sliding. Tablecloth gives displacement but no impulse-time representation; add F×duration and Δp with linked cloth departure/contact interval. |
| C03.1 | READY | Angled head-to-tail force construction and resultant exist. Retained `forces` separates force from velocity. Do not label the resultant as velocity. |
| C03.2 | READY / placement | `vectors` exposes independent mass and force and computes a=F/m; original force demo remains fixed 50 kg. Also attach the adjustable lesson at section 3.2's `c3_f_ma` so this section has the promised accessible entry. |
| C03.3 | GEOMETRY | Four presets and tilted normal exist, but load sags vertically through a fixed support plate. In spring mode sag saturates at .6 and load bottom is −.9 while fixed plate top is −.44. Sponge stays centred at −.7 while shrinking; load position is not tied to its top. Tilted load does not sit on rotated support; static-friction force is prose only. Build each apparatus with connected load/support contact, deformation along the normal, visibly tilted normal, weight and uphill friction. Table lattice displacement is schematic and disclosed. |
| C03.4 | READY | Selected-object arrows and both objects have unequal a at equal opposite force. Standing-person four-force preset explicitly separates gravity and contact pairs. |
| C03.5 | READY | Original carts preserved; astronaut/spanner and six distinct successive ejections conserve momentum and COM, with stationary COM marker. |
| C04.1 | GAP | Equal/different-mass presets and air-off equal fall exist, but no visible weight/inertial-mass cancellation and no two dense spheres comparison. `fall` always renders one ball and one flat block even when comparison changes to different mass/same area or hammer/feather. Add dense-body case and show mg/m=g with weight-force and acceleration evidence. |
| C04.2 | GAP | Original `airfall` DOES show drag/weight balance, strobes, speed graph and terminal speed. New `fall` does NOT add independent mass/shape controls; its presets bundle both. Expose independently variable mass, effective shape/area and air, update actual silhouettes, and retain or integrate terminal balance. |
| C04.3 | READY | Earth/Moon gravity and air multiplier are independent in `fall`; no-air Earth and Moon can be contrasted honestly. |
| C04.4 | READY | Retained projectile has two objects/common fall time; moving-car release has frame switch and shared events. |
| C04.5 | READY | Circle tangent release/inward vector and retained `whirl` rotating-frame modes exist. |
| C05.1 | GAP | Apple/Moon tangent numbers and barycentre exist. Inverse-square view draws six great-circle rings, with no sphere surfaces/area patches/flux distribution; radius slider changes readout/arrow but rings and probe position stay fixed. Add actual enclosing spherical surfaces at linked radii with area comparison 1:4:9 and an inverse-area field representation. |
| C05.2 | GAP | Cannon retained; room/proof-mass support analogy works. No weighing scale supports astronaut and no external view visibly shows station and astronaut falling together: whole cabin is stationary in both modes. Add a scale/compression and external shared-fall comparison tied to the support readout. |
| C05.3 | GAP | Numerically correct ellipses, equal-time sectors and outer period comparison. No named true-planet eccentricity versus enlarged teaching preset; e defaults .5. Add Mars/Earth true eccentricity and an explicit enlarged comparison with actual values. |
| C05.4 | GAP | Mass/separation change approximate equilibrium and switching sides reverses twist, with 800× scale disclosure. No disturbance control or decaying disturbance response exists; add a small optional disturbance and restoring/damped motion about the physical equilibrium. |
| C05.5 | GAP | A zero mass slider is an effective perturber toggle and residual is separate. The perturber itself is never drawn, no force direction is shown, and no unseen-planet inference/prediction exists. Add visible/hidden perturber state, selectable predicted position and reveal against computed residual. |
| C05.6 | GAP | Correct energy/conic calculations and numeric view span. Static postburn conic and constant .8-scene-unit velocity arrow do not show an impulse or later apogee. Add before/after tangential velocity, burn event, coast marker/time and reaching changed apogee, plus lunar flyby→retrograde burn→capture. Draw a scale bar that follows auto-fit. |
| C06.1 | READY | Fixed solid genuinely rotates through three faces; held cube has six normal pressure arrows and top/bottom force difference. Held-body/incomplete-FBD caveat exists. |
| C06.2 | GAP | Correct common-scale water/mercury heights. The reservoir is a dry grey slab and one constant upward arrow; no downward inside pressure or column-weight balance is drawn. Show open reservoir liquid, gas/vacuum at top, actual column and ΔpA=ρgAh with opposing forces. |
| C06.3 | GAP | Pressure-difference formulas and honest no-vacuum-pull prose exist. Straw is same closed-box barometer geometry without mouth; hemispheres are a whole sphere/seam with a single constant outside arrow regardless of inside pressure. Build recognizable straw/mouth and opposed hemisphere surfaces with outside/inside pressure arrows and resultant varying with Δp. |
| C06.4 | READY | Equal-bottom-depth probes, connected narrow/wide vessels, local depth-increasing dam arrows and integrated numerical wall load; original calculated jets retained. Added surface-pressure apparatus could be made more explicit. |
| C06.5 | GEOMETRY / GAP | Hull, cargo and displaced volume are present; original buoyancy retained. Hull draft uses fraction×.7 although drawn walls have depth .6: default 50% readout submerges .35/.6=58% of wall depth. Choose a consistent sealed outer geometry and displaced volume/draft. Layer preset is a rectangular block, not the specifically accepted egg: add actual egg geometry/volume integration or an explicitly separate egg case with physical volume fractions. |
| C07.1 | READY | Selectable boundary and grey external stores; original eight stores and actual enlarged rubber molecular cutaway retained. |
| C07.2 | READY / graph-scale gap | Correct mv/mv² and force-time versus force-distance areas/ratios. Rectangles remain exactly the same pixel heights and lengths when F/v controls change; axes have no scale numbers. Add numeric axis scales or keep fixed physical scales so changed force/time/distance agree with the graph geometry. |
| C07.3 | GAP | Same load/rise routes and perpendicular horizontal-carry example exist. No slide-versus-roll mode in either `work` or original `energytrack`. Add translation+rotation partition and marked rolling body; draw displacement arrow/angle beside force. Also avoid treating unequal schematic x/y display scaling as a physical force angle without disclosure. |
| C07.4 | READY | Original track and expanded ball/floor/air account retain dissipated energy. |
| C07.5 | GAP | Single appliance P×t graph is correct but no cumulative household/multiple appliance account exists. Add household schedule and summed cumulative energy, with individual slopes/contributions. All `R.plot` axes lack numeric ticks, and dynamic ymax can disguise changed slopes; label scales explicitly. |
| C07.6 | GAP | Original still Sankey survives but live scene is blocks, a shaft and spinning vanes with bars. Thermal/hydro presets differ only by text. No water/steam drive or electromagnetic generator mechanism; finite-wheel mode has no lamp, magnet or electrical load connection. Implement distinct source→turbine→generator→load path, conservation-width Sankey, and loaded magnet-wheel counterexample that visibly drains its named kinetic store. |
| S05 | GAP | Unequal slope chain lengths and equal downhill sums are correct. No solid ramp/wedge, connected lower hanging chain or weight-to-parallel/normal decomposition is drawn; lower beads alone form an elliptical arc with nonuniform physical spacing despite equal-chain-length claim. Add real wedge/ramp geometry, a continuous symmetric lower chain, and component construction for weights with balance tied to chain mass/length. |

## Primary-source fidelity checks

Fetched the following actual catalog primary pages during this audit (29 October),
and compared the mechanism rather than accepting the catalog paraphrase:

- [OpenStax drag §5.2](https://openstax.org/books/college-physics-2e/pages/5-2-drag-forces):
  drag depends independently on shape/area, air density and speed; terminal speed
  is weight balanced by drag. `M.fall` is a valid constant-coefficient quadratic
  solution; presets alone do not establish the required independent experiment.
- [OpenStax work §7.1](https://openstax.org/books/college-physics-2e/pages/7-1-work-the-scientific-definition):
  only the force component along displacement contributes. Same-height route
  numbers and zero horizontal-support work are right; draw the actual component
  and displacement rather than depending on the word “perpendicular”.
- [OpenStax buoyancy §11.7](https://openstax.org/books/college-physics-2e/pages/11-7-archimedes-principle):
  buoyancy equals displaced fluid weight, including sinking bodies. Model accounts
  satisfy this, but a hull's displayed draft must enclose that very displaced volume.
- [OpenStax gravitation §6.5](https://openstax.org/books/college-physics-2e/pages/6-5-newtons-universal-law-of-gravitation):
  inverse-square acceleration and equal opposite attraction are correct; weightless
  means loss of support, not loss of gravity. Current room readout makes that
  distinction, but shared fall/scale and sphere-area evidence remain to be drawn.

Other model derivations were checked against local grounded definitions and literal
worked tests. Do not claim every source URL was fetched anew. Passed commands:
`node source/tests/test_mechanics_labs.mjs` and
`node source/tests/test_mechanics_geometry.mjs`. Neither certifies renderer contact,
geometry, controls or missing accepted behaviour.

## Feynman read: three-sentence learner explain-backs

These are the understanding the completed scenes must make possible. Where a
scene above is GAP, current visuals alone do not yet earn the full explain-back.

**C00:** Raising my eyes changes the line that just grazes the sea, so I can see
more of a distant ship. If I double every side of a cube, I need four little
squares on a face and eight little cubes inside. Rain volume comes from laying
its measured depth over the whole measured area, after making the units agree.

**C01:** The same bounce can look straight to a moving friend and curved to me,
because we subtract different observer positions from the same events. Walking
back adds distance even when it removes my displacement, and the graph's slope
tells me velocity. At a toss's top the velocity passes through zero while gravity
keeps changing it downward.

**C02:** Once my hand leaves the book it cannot still push it, but the table can
slow it through contact. With that contact resistance removed the book keeps the
same velocity. During braking the floor slows my feet first while my unrestrained
bag initially keeps its old ground motion.

**C03:** Two pulls must be added with their directions, and the same resultant
changes a smaller mass's velocity faster. The table changes shape a little and
its restoring response supports the load. The equal opposite partner of a force
acts on the other object, so it is not a second force cancelling on this object.

**C04:** Gravity pulls harder on more mass, but the same force per kilogram gives
the same free-fall acceleration. Air adds another force that depends on shape and
speed, so removing air is a different change from using the Moon's weaker gravity.
A moving release keeps its sideways velocity, and a turning object goes along
the tangent when the inward constraint ends.

**C05:** The Moon falls below the line it would otherwise follow without getting
steadily closer to Earth, and Earth also moves around their shared balance point.
Equal times sweep equal orbital areas, so speed changes around an ellipse. A
forward burn changes velocity immediately; the farther apogee is reached later
during the coast.

**C06:** Pressure pushes normal to every face, and the deeper bottom gets a
larger push than the top. Outside air can support liquid when its pressure exceeds
the pressure above the liquid; empty space supplies no pulling object. A floating
hull settles until the weight of its displaced liquid matches its loaded weight.

**C07:** When the bouncing ball loses mechanical energy I can find the rest in
the warmer ball, floor and surroundings if I enlarge my accounting boundary.
Double speed means twice the momentum but four times the kinetic energy, which
explains different stopping-time and stopping-distance changes at the same force.
A generator and lamp can drain a wheel's finite kinetic store, so continued output
requires continued energy input.

**S05:** The longer slope holds more of the uniform chain but each bit has a
smaller fraction of its weight down that slope. Multiplying those two effects
gives the same downhill pull on both slopes of equal height. Removing the
symmetric hanging part leaves those balanced slope pulls unchanged.

## Release condition

Fix confirmed GAP/GEOMETRY rows without substituting explanation text for a
mechanism, then rebuild and inspect each affected renderer at nondefault controls,
mobile/desktop, no-WebGL and all themes. Check apparatus contacts, labelled common
scales, force sources, conservation and graph/scene correspondence. Only then can
the coordinator promote these source candidates to VERIFIED.

## Independent closure pass 1: chapter 0–3 corrections

Reviewed changed source after the first implementation correction round; initial
findings above remain the immutable record of the earlier state.

- C00.4: `gnomonShadow` intersects a parallel ray with each local tangent plane;
  renderer now draws ground/shadow segments and a local stick-shadow inset.
- C01.4: marked rolling sphere rotates by s/R; slider does not rotate. Both
  presets share the sliding-reference distance/velocity scales.
- C02.1: book/table and hand/finger contacts corrected; table-on-book and
  hand-on-book sources named and horizontal-only scope disclosed.
- C02.2: new `m-arrow` uses an actual released arrow/trail, gravity and opposing
  air force from the consumed analytical linear-drag model; zero air preserves vx.
- C02.4: new connected hinged torso, feet and bag share one model/clock and
  observer subtraction; floor contact force is explicit.
- C02.5: junctions now bridge the surfaces and stretch/break/reform; tablecloth
  has a calculated force-time area equated to impulse and momentum change.
- C03.2: `m-newton` is catalogued at `c3_f_ma` in section 3.2 with independent
  force and mass. It reuses the real force-addition calculation.
- C03.3: consumed `supportContact` places the rotating load bottom exactly on
  the deformed support plane; sponge top and spring end follow that plane. The
  ruler has a sag curve and the table has relative material displacement. Normal,
  weight and uphill friction vector components balance for each tilt.

`node source/tests/test_mechanics_motion_geometry.mjs` passes independent
parallel-ray/tangent intersections, drag opposition, rigid torso length,
frame-shared bag events and support contact/force-component constraints.

Independently ran forced-no-WebGL Chromium smoke against the then-current built
site: 9 changed lessons × 390/1440 = **18 passing cases**. Receipt:
`source/build/mechanics-independent-main-closure/receipt.json`. Checked painted
calculated diagrams, nondefault first control, play/pause, paused theme/resize,
full-size/fit, focus restoration and no unexpected media/sensors/errors. This was
sepia only and does not replace all-controls/all-themes/final-build verification.
Inspected the coordinator's actual 1440 screenshots for shadows, braking,
friction and support in `labs-mechanics-main-corrected`, not just their pass flags.

Residuals reported promptly to coordinator, pending final source/build closure:

1. Friction's leftward resistance arrow is drawn beneath the lower body, while
   it is the upper body that receives leftward table friction. Place it on the
   upper body's contact and label the source; the lower-body partner points right.
2. Braking floor top −.77, feet bottom −.74 and bag bottom −.75 leave small
   hovering gaps; align the physical contacts and preserve torso origin.
3. Tablecloth plate bottom +.01 versus cloth top −.085 is a clear gap; cloth
   shifts left although the plate's model impulse/displacement is right. Show
   contact, consistent pull direction and a meaningful cloth-clear endpoint or
   actual replay of contact/departure.
4. Arrow-flight's 2D Earth force uses 42 px/.98 N, while drag uses 50 px/N;
   use one force scale. Its 3D gravity/drag scales also differ slightly.
5. Older support screenshots show the spring obscured by an opaque large plate;
   latest narrow/translucent source plate should resolve this but needs a fresh
   screenshot. No-WebGL support currently offers only numbers and friction only
   bars: smoke verifies functionality, not those 3D mechanisms in fallback.

Space/fluid/energy corrections are still in progress at this closure checkpoint;
their initial GAP/GEOMETRY verdicts have not yet been promoted.

## Independent closure pass 2: complete source mechanisms

Reviewed stable corrected `mechanics_space.js`, `mechanics_fluids.js`,
`mechanics_energy.js` and their consumed models. All formerly absent accepted
mechanisms now have substantive source implementations:

| Earlier affected ID | Corrected source evidence |
|---|---|
| C04.1–C04.3 | Independent selected-body mass/area/shape controls, actual dense-sphere/disc/hammer/feather silhouettes, independent air and gravity, common-scale weight/drag arrows, terminal curves and explicit (mg−drag)/m calculation. |
| C05.1 | Actual spherical surfaces, equal-count spherical flux samples at R/2R/3R and 1:4:9 area labels; probe radius follows slider on a labelled common scale. |
| C05.2 | Cabin and astronaut visibly share external displacement, with a physical floor/scale/foot contact and spring compression/support force. |
| C05.3 | Named nominal Earth/Mars eccentricity and enlarged preset; equal-time sectors/period comparison retained; manual change now identifies user-selected eccentricity. |
| C05.4 | Damped disturbance response about the torque-set equilibrium, physical bar angle and separate explicitly magnified dial. |
| C05.5 | Hidden/revealed actual perturber, predicted starting-angle marker, computed predicted residual and full-vector RMS error, perturbing-force direction. |
| C05.6 | Time-propagated incoming/preburn and postburn conics, common-scale velocity/impulse arrows, craft coast to calculated apogee or display horizon, lunar capture and a numerical distance scale bar. |
| C06.2–C06.3 | Open liquid reservoir, gas region, common-height columns, outside/gas/weight balance, mouth/straw, actual half-shells with opposing normal pressure and integrated axial resultants. |
| C06.5 | Actual sealed envelope with consistent .6-depth draft and floor contact when sunk; egg is a lathed asymmetric profile whose submerged volume is integrated/inverted rather than equated to height fraction. |
| C07.2 | Force-height and time/distance-width rectangles use fixed physical numeric axes across the complete control range. |
| C07.3 | Common x/y metre scale; explicit force/displacement and angle; marked rolling sphere versus nonrotating slider; calculated translation/rotation energy and no-slip rotation. |
| C07.5 | Summed scheduled household appliances, individual cumulative curves and summed curve/current total power, with explicitly fixed axes. |
| C07.6 | Distinct water/steam drive paths, turbine/shaft, rotating magnet with stationary coil and lamp/circuit, width-conserving Sankey and connectable resistive generator load draining the finite wheel store. |
| S05 | Real wedge, connected symmetric catenary and equal arc-length beads; weight and its parallel/normal components are drawn on both slopes and vector sum closes. |

Additional closure bugs were found independently and corrected by the implementer:
the no-WebGL freefall diagram initially moved up because it added a negative
physical displacement to canvas y; the suction fallback drew a nonzero weight
arrow for a zero-height column; equal-pressure hemisphere arrows used unequal
length scales; and manual eccentricity retained a named-planet identity. Read
the corrected source and reran the suite containing actual-canvas/vector
regressions for all four limits: PASS.

Rechecked main-file residuals after coordinator fixes: resistance now acts on
upper contact; feet and bag rest on the train floor; tablecloth before/during/
after states have consistent direction and exact cloth/bare-table contact; after
state clears cloth to the right; arrow gravity/drag use one physical force scale.
The narrow transparent support cap is present in source. New fallback insets
are being integrated by the coordinator and require fresh visual inspection.

Additional actual primary pages fetched for this closure:
[Kepler's laws](https://openstax.org/books/astronomy-2e/pages/3-1-the-laws-of-planetary-motion),
[pressure measurement](https://openstax.org/books/college-physics-2e/pages/11-6-gauge-pressure-absolute-pressure-and-pressure-measurement),
[electric generators](https://openstax.org/books/college-physics-2e/pages/23-5-electric-generators).
Nominal Earth/Mars preset values are supported by the linked
[NASA Mars fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html?level=1),
not by a claim of a current ephemeris. Grounding records these sources.

`test_mechanics_labs.mjs`, `test_mechanics_geometry.mjs` and
`test_mechanics_motion_geometry.mjs` pass. The first now instantiates the actual
domain renderer builders, checks finite control extrema, real mesh contacts,
egg/column/hemisphere geometry, chain vector components and canvas limiting
cases. **Source-level physics/accepted-mechanism gaps are closed; final fresh
integrated browser/screenshots remain pending at this checkpoint.**

## Independent final visual closure

Candidate: `source/build/site`, service-worker cache `mw-81c12a9235dc`,
mechanics chunk `w_mechanicslab-347TTJBI.js`. This evidence supersedes the earlier
main-file smoke receipt for the reviewed candidate.

- **46/46 passing** Chromium checks: all 23 changed mechanics lessons at 390 and
  1440 px in sepia, with real WebGL rendering, a nondefault control, play/pause,
  paused theme/resize, full-size/fit, focus return, no page overflow, no errors and
  no unexpected audio/microphone/sensors. Receipt/screenshots:
  `source/build/mechanics-independent-final/receipt.json`.
- **12/12 passing** forced-no-WebGL checks: support, friction, tablecloth,
  weightlessness, mission and suction at both widths. Independently read the
  actual mobile screenshots: the new spring/contact inset, bridged junctions,
  cloth/contact endpoints, shared-fall diagram, conic/velocity and pressure/weight
  balance remain visible. Receipt:
  `source/build/mechanics-independent-final-fallback/receipt.json`.
- Independently drove **20 additional nondefault apparatus states** and read
  every resulting screenshot, including all four support types at 20 kg/45°,
  sliding junctions, cloth during/clear states, hammer/feather, sphere areas,
  shared fall, enlarged ellipse, damped torsion, correct hidden-planet hypothesis,
  lunar apogee after capture, equal-pressure hemispheres, integrated egg,
  rolling energy, summed household account, loaded magnet wheel and continuous
  chain components. Captured actual values/readouts and no page errors in
  `source/build/mechanics-independent-presets/receipt.json`.
- Also read the final impact comparison screenshot and checked its fixed numeric
  force/time/distance axes against the displayed widths, heights and worked values.

**Independent physics and learner-fidelity gate: PASS for C00–C07/S05.** No
confirmed physical error or accepted visual-mechanism omission remains from this
audit. The unchanged READY rows retain their source evidence; every GAP/GEOMETRY
row has substantive corrected source plus the focused browser evidence above.
The learner explain-backs now follow observable mechanisms instead of unexplained
names. No implementation files were edited by this reviewer.

Presentation note sent to coordinator: mission's preburn numerical label is
drawn in `c.rule` and is faint on sepia. The comparison geometry and values are
correct, but a legible text colour would improve this label. The wider all-theme,
all-controls, WebKit/offline/print/lifecycle matrix remains the coordinator's
separate release evidence; this focused independent gate does not claim it.
