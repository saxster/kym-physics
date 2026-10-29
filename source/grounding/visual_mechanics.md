# Mechanics, fluids and energy visual lessons

29 October 2026. Applies to `lessons/mechanics.json`, `live/mechanics_models.mjs`,
the mechanics renderer modules and `w_mechanicslab.js`. These are original
explanatory scenes built from the book's existing grounding and primary sources.
The JSON catalog gives a specific source list for every lesson. No historical
apparatus dimensions, contemporary weather or mission trajectories are invented
as measurements: illustrative inputs and model limits are stated beside each scene.

## Public model boundary and verification

`node source/tests/test_mechanics_labs.mjs` checks the renderer-independent public
model functions against worked cases. Expectations include literal independently
calculated numbers and physical invariants, not comparisons with rendered pixels.

The tests were written before the new model module. The first run failed because
the public module did not exist; implementation then made the worked cases pass.
A later regression exposed a floating-point residual speed after Coulomb-friction
stopping. The model now returns exactly zero speed at/after the stopping event so
the friction arrow does not persist after the book rests.

The first browser sweep used the integrated book, all controls and presets on ten
complex lessons at 390 and 1440 px in sepia: 20 cases passed with no page errors,
painted diagrams, input changes, pause/play, detail view and focus restoration.
Receipt: `build/mechanics-focused/receipt.json`. This baseline preceded the final
scope-completion changes (hand, lattice, four-force preset, ruler/interval graphs,
COM account and fitted conics); the coordinator must verify the final build too.

## Model derivations and fidelity boundaries

### Geometry and measurement

- `m-horizon`: for a spherical Earth of radius R=6,371,000 m, the observer's
  horizon angle is acos(R/(R+h)). Beyond that angle the hidden target height is
  R(sec(angle)-1). A 2 m eye gives a geometric horizon around 5.048 km. A flat
  model hides none of a ship. The 3D cap is a deliberately exaggerated overview;
  the calculated diagram/readout use the actual radius. Refraction is omitted.
- `m-shadow-shapes`: the parallel projected area of a thin circular disc is
  πr²|cos θ|. The mesh is an actual circular disc, not a thin square. The fixed
  projection diagram stays meaningful when the reader turns the object view.
- `m-measurement`: five deterministic sample errors are added to a known 36.5 mm
  reference, then bias and instrument resolution are applied. This teaches scatter
  versus zero error, not a confidence interval or an empirical error distribution.
  A graduated magnified endpoint strip changes divisions with the resolution.
- `m-scale`: length, face area and volume vary as s, s² and s³. At s=2, ratios
  are 2:4:8. This does not replace the existing logarithmic Powers of Ten model.
- `m-rain`: m² × m gives m³. At assumed 600 km² and 100 mm the volume is
  60,000,000 m³, approximately 60,000,000 tonnes of fresh water. It is not runoff.
- `m-shadows`: circumference = (360°/θ) × city separation. At 5000 stadia,
  7.2° and an assumed 160 m stadion the answer is 40,000 km. Unknown units do
  not determine kilometres. City meridian and parallel-ray assumptions are visible.

Primary grounding: OpenStax Astronomy 2e §2.2 Ancient Astronomy; College Physics
2e §1.3 Accuracy/Precision, §1.4 Approximation and §11.2 Density; MIT 8.01SC notes
Chapter 2. Exact links live in the catalog and existing `grounding/ch00.md`.

### Motion and contact

- `m-frames`, `m-trains`, `m-braking`, `m-projectile`: all observer positions are
  subtracted from the same events. Braking uses x=v₀t−at²/2 until the train stops,
  then holds the stopped position. The projectile retains the car's horizontal
  velocity; flight time from 0.75 m is √(1.5/9.8). The body/feet separation is a
  short-time contact schematic rather than a biomechanical human simulation.
- `m-graph`: figure walk and round-trip distance are accumulated separately from
  displacement. Smooth motion is x=6 sin(πt/12) m, with derivative
  v=(π/2)cos(πt/12) m/s. A selectable finite secant interval approaches that
  instantaneous slope. Stops/turns in the piecewise walk are explicitly idealised.
- `m-acceleration`: x=v₀t+at²/2 and v=v₀+at. The sign of va distinguishes growing
  from shrinking speed; negative a alone does not. The car position is compressed
  to fit, while separately scaled arrows and the numerical model retain units.
- `m-galileo`: sliding a=g sin θ; a uniform solid sphere rolling without slip has
  a=(5/7)g sin θ. Both have x∝t². At 30°, accelerations are 4.9 and 3.5 m/s².
  Equal-time markers, a curved x–t plot and a linear v–t plot share one clock.
- `m-toss`: h=v₀t−gt²/2, v=v₀−gt and a=−g. At t=v₀/g the velocity vanishes;
  acceleration remains −9.8 m/s². The three graph modes share the same clock.
- `m-inertia`: a visible hand pushes a 1 kg book for 0.40 s to the selected
  release speed. After contact ends, hand force is exactly zero. Sliding uses
  constant kinetic friction until the exact stopping event; no residual friction
  is shown at rest. Zero friction gives constant post-release velocity.
- `m-friction`: static friction balances the push up to μsN (μs=0.50), while
  the just-slipping state uses μkN (μk=0.35). The contact junction enlargement is
  schematic. It includes deformation/adhesion; visible roughness alone is not the
  mechanism. The sliding preset depicts the onset, not a time-integrated trajectory.
- `m-tablecloth`: a=μg, v=μgτ. Displacement while on cloth is μgτ²/2; stopping
  distance on a bare table with the same μ is also μgτ²/2. With μ=.30, τ=.10 s,
  total displacement is 0.0294 m. Mass cancels. No claim about real hems/tipping.
- `m-vectors`: two equal forces F at angle θ give components
  (F+Fcosθ,Fsinθ). At 5 N and 90° the resultant is √50 N, not 10 N. Changing
  mass changes acceleration while keeping the forces the same.
- `m-support`: N=mg cosθ and compression=N/k in the assumed Hooke-law analogies.
  Spring, sponge, bent ruler and table have different stiffnesses. The table shows
  schematic material sites and relative displacement; neither dots nor connectors
  are literal classical atoms/bonds. Displacement magnification is stated. Static
  friction separately balances the downhill component in the inclined preset.
- `m-pairs`: the same force on masses m₁,m₂ gives accelerations F/m₁ and −F/m₂.
  The standing preset uses an illustrative 1 kg person and four 9.8 N forces:
  Earth on person/person on Earth; floor on person/person on floor. The two forces
  balanced on the person belong to different interaction pairs.
- `m-rocket`: recoil comes from conserved momentum plus specified separation
  speed. Successive finite-mass ejections retain their own exit velocities. Tests
  verify momentum and centre of mass for 3 fuel amounts × 5 times. The stationary
  ring marks the centre; all positions share a common scale and object sizes are
  enlarged. The model omits external forces rather than claiming rockets lack them.
- `m-fall`: quadratic drag uses vt=√(mg/k), v=vt tanh(gt/vt) and
  y=(vt²/g)ln cosh(gt/vt). At release, drag is zero and a=g for both bodies.
  At zero air the analytical result is gt²/2 regardless of mass. Gravity and air
  are independently selectable. Selecting either body exposes independent mass
  and projected area; sphere/disc/hammer/feather changes its actual silhouette and
  assumed shape coefficient. The dense-spheres comparison keeps the same area
  while changing mass. Shared-force-scale weight/drag vectors, the explicit
  (mg−drag)/m account and the speed/terminal graph remain linked to the same
  analytical state. Silhouettes are enlarged; the 200 m reference is not a floor.
  Shape coefficients are assumed; no tumbling.
- `m-circle`: velocity is tangent and acceleration is −v²r̂/r. Nearby equal-length
  velocity arrows have an inward vector difference. Removing the constraint gives
  straight tangent motion. The display freezes 0.35 s after release; motion does not.

Primary grounding: MIT 8.01SC 2016 reference-frame lesson and notes Chapters
4/7/11; OpenStax College Physics 2e §§2.4–2.7, 3.2/3.4, 4.2–4.5, 5.1–5.3,
6.2 and 8.2/8.3/8.7. The rolling constraint is the non-Lewin MIT 8.01SC 2016
Week 12 material. These lessons do not use any Walter Lewin sources.

### Gravity and orbits

- `m-gravity`: g/g₀=1/r² for r in Earth radii. Earth–Moon barycentre distance
  is 384400 km × .0123/1.0123, about 4671 km from Earth's centre. The separate
  circular Moon model gives gap r(1−cosωt) below the tangent, not inward drift:
  about 4.90 m in 60 s at 60 Earth radii. Body sizes and overview gaps are enlarged. The inverse-square view uses actual
  enclosing spherical surfaces at R/2R/3R, the same 18 equal-flux samples spread
  over area ratios 1:4:9, and field arrows scaled 1:1/4:1/9. A separate selected
  radius sphere and probe move on the labelled common autoscale.
- `m-weightless`: g(h)=9.8/(1+h/6371 km)². At 400 km this is about 8.69 m/s²;
  the ideal freely falling scale has zero normal force. A 70 kg astronaut’s feet
  touch the actual scale plate; springs meet the plate and cabin floor. A supported
  cabin compresses k=7000 N/m springs by N/k (displayed 2×); free fall translates
  cabin, scale, astronaut and external reference by −gt²/2 on a common scale.
- `m-kepler`: solve E−e sin E=M, then x=a(cosE−e), y=a√(1−e²)sinE.
  Mean anomaly advances uniformly; areal rate √(μa(1−e²))/2 is constant.
  Normalized GM=1 gives a circular unit orbit period 2π. Equal outlined sectors
  span equal times. A 1.4-times-larger orbit has period ratio 1.4^(3/2). True-eccentricity presets
  use NASA fact-sheet Earth .0167 and Mars .0935, alongside an explicitly enlarged
  teaching ellipse e=.5. The semimajor-axis comparison remains a generic model.
- `m-torsion`: sum torque from both large balls on both small balls using
  F=GmM Δr/|Δr|³. Approximate small equilibrium angle is τ(0)/κ. The chosen
  masses, lever arms, separations and κ are assumed; the separate angle dial is enlarged 800×.
  Reversing the arrangement reverses torque. The bar uses the physical angle; a
  separate dial amplifies the angle 800× without moving the balls through one
  another. A selectable initially stationary disturbance follows the underdamped
  torsional oscillator with I=.016 kg·m², κ=10⁻⁵ N·m/rad and damping ratio .12.
  The plotted signal decays towards the computed gravitational equilibrium. No
  historical angle trace is fabricated.
- `m-perturbation`: RK4 restricted three-body integration includes the heliocentric
  indirect acceleration. The additional body's circular orbit is prescribed.
  Zero perturber mass returns an identical path and conserves two-body specific
  energy to below 10⁻⁷ model units in the checked example. The residual has its
  own labelled scale. The actual prescribed outer mass can be hidden or revealed;
  a selected starting-angle hypothesis is integrated separately and compared with
  the full observed two-component synthetic residual using RMS error. The visible
  outer body and inner path share one scale; differential acceleration is enlarged
  80× only after reveal. This does not reconstruct Neptune or Halley's comet.
- `m-mission`: Earth radii, GM and apsides use kilometres consistently. A forward
  tangential impulse changes specific energy v²/2−μ/r immediately; bound apogee
  follows a=−μ/(2ε), ra=2a−rp. Lunar capture begins with a prescribed hyperbolic
  excess speed and a retrograde impulse. Conics are fitted from calculated points;
  an unbound path ends at its display radius without a fabricated circular end arc.
  The actual craft marker is propagated with elliptical/hyperbolic Kepler equations
  (and Barker’s parabolic limit) before and after the periapsis impulse. Before/after
  velocity vectors share a scale, the Δv vector shows the instantaneous change, and
  the later apogee occurs at the computed half-period. Lunar mode starts on an
  incoming hyperbolic flyby and uses the same event/coast calculation for capture.
  The scale bar follows each fitted conic. The original Sky explorer retains the
  actual source-backed ISRO sequence.

Primary grounding: MIT 8.01SC notes Chapters 9 and 25; OpenStax Astronomy 2e
§§3.1/3.3/3.4/3.5; College Physics 2e §6.5 and torque §9.2; ISRO Chandrayaan-3
updates already grounded in `grounding/ch05.md`. No current ephemeris claim.

### Fluids and energy

- `m-pressure`: a fixed 0.20×0.10×0.05 m solid, weight 98 N, turns onto faces
  of .005, .010 and .020 m². It is rotated, not reshaped. An independently held
  0.5 m cube in water has bottom-minus-top fluid force ρgV=1225 N. Only fluid
  forces are shown there; this is not a complete free-body diagram of the held cube.
- `m-suction`: supported height is Δp/(ρg). At 101 kPa this gives 10.306 m water
  or 0.758 m mercury. Hemisphere separation force uses projected area πr².
  An open reservoir supplies actual visible liquid beneath the column; vacuum/gas
  above, downward gas force, downward column weight and upward reservoir pressure
  obey poutside A=pinside A+ρghA. Straw mode has a recognizable mouth, and cutaway
  hemispheres show opposing outside/inside arrows plus Δp-dependent resultants.
  The enlarged sealed-glass inset shows a fixed 0.10 m column and initial force
  account; it does not leave water suspended after a simulated card release.
- `m-hydrostatic`: pressure is ρgh+padded at equal-depth probes, independently of
  vessel width. A vertical rectangular dam has force ρgH²w/2+paddedHw.
  At H=2 m, w=5 m, gauge pressure is 19.6 kPa and force is 98 kN.
- `m-hull`: submerged volume is min(V,m/ρ); buoyancy is displaced weight. An
  ideal 10 kg, 20 L envelope floats half submerged in fresh water. A separate
  10 kg solid steel reference occupies about 1.28 L and sinks. Cargo and salinity
  are independent. The hull is a sealed rectangular outer envelope of depth .6f and volume
  proportional to f³; draft is exactly .6f × submerged-volume fraction. Fully sunk
  bodies contact the drawn floor. The two-layer preset is an actual asymmetric egg
  of revolution, r(u)=a√(1−u²)(1−.2u). Integrating πr² du and inverting its cumulative
  volume gives the interface height for required lower volume fraction
  (ρegg−ρupper)/(ρlower−ρupper). Height fraction is not substituted for volume.
- `m-energy`: flights exchange kinetic/gravitational energy. Each instantaneous
  bounce retains 64% of mechanical energy; the missing mechanical amount is
  allocated illustratively 30% ball, 40% floor, 30% air after sound absorption.
  Selected system boundaries grey out stores lying outside. Ball-only excludes the
  gravitational interaction store; all accounts together sum to the initial energy.
- `m-impact`: momentum mv sets constant-force stopping time mv/F; kinetic energy
  mv²/2 sets stopping distance mv²/(2F). Doubling speed doubles time and quadruples
  distance under the same force. Rectangles use fixed physical axes 0–3 N,
  0–.4 s, 0–2 m: both their height and width respond to controls; numeric ticks
  identify the scales. No exact claim about real clay or flour craters.
- `m-work`: quasistatic routes to the same height change gravitational energy by
  mgh. A frictionless ramp trades smaller parallel force for greater distance.
  A vertical support force does no work during horizontal displacement. Applied
  force and local displacement are constructed side by side on equal x/y scales.
  Slide/roll descent modes share a marked ramp and common drop: an ideal solid
  sphere rolls with translation 5mgh/7 and rotation 2mgh/7, with angle s/R and
  ω=v/R, while a frictionless slider receives all mgh as translation.
- `m-power`: P×t uses watts and hours; 2000 W×.25 h=.500 kWh and
  10 W×24 h=.240 kWh. One kWh=3.6 MJ. The household alternative sums explicit schedules: geyser .500 kWh, lamp
  .240 kWh, fan .480 kWh, kettle .150 kWh, total 1.370 kWh. Appliance curves
  and their sum use fixed 0–24 h / 0–2 kWh axes. Single-appliance axes remain fixed
  at 0–24 h / 0–48 kWh; slopes no longer rescale when power changes. No tariff model.
- `m-station`: electrical output ηPin plus rejected rate (1−η)Pin equals input.
  A separate wheel starts with 1000 J and loses energy at the selected lamp load;
  the illustrated rotor, turbine and generator share a shaft axis, while a rotating
  diametric magnet changes flux through a stationary coil. Load disconnection opens
  the circuit and extinguishes the lamp. The finite-wheel model assumes constant
  resistance and emf∝ω, hence P∝ω² and E(t)=E₀exp(−P₀t/E₀). Lamp power and
  resisting torque P/ω fade as the store drains. The rotor angle is the integral of
  √(2E/I), I=1, slowed .04× for display. This avoids a constant-power singularity at
  zero speed. Continuous source modes use distinct steam/water drive paths and
  conservation-width Sankey branches, with a common .8 pixel/W scale.
- `m-stevin`: a uniform chain on slopes of common height H has downhill force
  λL g(H/L)=λgH on both sides. Four equal lengths on a 4 m slope balance two on
  a 2 m slope. The 3D wedge is a closed triangular prism and the lower chain is a continuous
  symmetric catenary. Beads on both slopes and the lower chain are spaced by the
  same .5 m arc length; vector constructions resolve total weight into downhill
  and into-slope components. Removing the symmetric hanging portion does not
  change the balance because its endpoint tensions are equal.
- `m-engine`: ηreversible=1−Tc/Th uses kelvin, actual selected η is a fraction of
  that limit, and work+rejected=input. At 600/300 K the reversible limit is 50%.
  The piston is explanatory apparatus, not a solved thermodynamic cycle.

Primary grounding: MIT 8.01SC notes Chapters 13/14/27; OpenStax College Physics
2e §§7.1–7.7, 11.2–11.7, 15.4 and 23.5. All exact URLs are in the catalog.

## Coverage and integration

The forty lesson presets cover every Chapter 0–7 audit row, including deliberate
2D choices. Existing live widgets remain available. Catalog `figure` fields attach
the new lessons as alternatives to the original drawings; `stories` opens these
same lesson states rather than copies of the code. Distinct story experiments
include Stevin, Cavendish, perturbations and Carnot. Biographies for Anna Mani,
Halley and the kilogram story reuse measurement/orbit lessons.

Final integration must retain all original tests and run the full mobile/desktop,
theme, keyboard, no-WebGL, offline and resource-lifetime matrices. Hardware sensor
accuracy and measured learning gains are not certified by this source/model work.

## Independent review closure, source candidates

The independent report `gates/visual-mechanics-independent.md` prompted the
mechanism corrections above. These are source candidates for a fresh coordinator
build and browser review; this document does not promote the old 20-case browser
receipt to verification of changed code.

`tests/test_mechanics_labs.mjs` now additionally checks Newton force balance across
independent mass/area/air/gravity boundaries; shell flux and radial geometry; scale
compression; monotonic damped-oscillator energy; finite-difference orbital velocity,
angular momentum, specific energy and timed apogee for bound/unbound Earth/lunar
cases; true-eccentricity apsides; hidden-planet residual hypotheses; independent
100,000-slice egg volume integration; rolling translation/rotation; household sum;
generator energy/power/torque/angle; and equal catenary arc spacing.

The same test instantiates the **actual** Space/Fluids/Energy builders with Three
scene objects and a mocked canvas, exercises all controls and preset extremes,
checks every transform/buffer for finite values, then runs each builder without
WebGL. It inspects actual hull draft/floor contact, egg mesh placement, reservoir/
column contact, hemisphere geometry, astronaut feet/scale contact and mass/area
silhouettes. These mesh constraints do not replace final screenshots, typography,
touch, theme, keyboard or browser error checks.

New sources checked directly on 29 October 2026:

- [NASA Earth fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html),
  rounded orbital eccentricity .0167.
- [NASA Mars fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html),
  rounded orbital eccentricity .0935.
- [OpenStax damped oscillations](https://openstax.org/books/university-physics-volume-1/pages/15-5-damped-oscillations),
  underdamped solution and energy dissipation.
- [OpenStax electric generators](https://openstax.org/books/college-physics-2e/pages/23-5-electric-generators),
  changing flux and induced emf; combining emf∝ω with a fixed resistive load
  supplies the stated cycle-averaged P∝ω² wheel model.

## 29 October fresh visual-audit corrections

The audit distinguishes personally viewed live screenshots from automated
control checks in `docs/visual-audit-mechanics.{md,json}`. Baseline visual evidence
currently covers only horizon, fall and hull; final visual acceptance remains open.

- Quantities on sliders use the actual decimal step: 0.25 h stays 0.25 h and
  2.5 kg stays 2.5 kg. A derived replay step uses at most four decimal places for
  its visible output. Independent literal-output regressions cover these cases.
- A replay reset or advancing clock changes both the model time and the visible
  slider. A manually changed body/eccentricity/appliance parameter clears the
  incompatible named preset. Static comparison scenes hide no-op playback.
- Fall silhouettes are enlarged visual representations. White dots mark matching
  reference points and grey release marks/trails compare the travelled distance;
  different silhouette tops must not imply unequal free-fall motion. A dashed
  second speed trace makes coincident vacuum curves identifiable.
- Hull dimensions at 20 L are 2 × 0.6 × 1 scene units, so every litre occupies
  0.06 scene³. A 10 L displaced-water cube must therefore have volume 0.6 scene³,
  independently of hull shape. This common scale now also matches the steel
  reference. The prior cube divisor implied a different physical volume scale.
- The layered egg is a separate experiment: its density is directly adjustable
  from 1000 to 1200 kg/m³, independent of cargo and sealed outer hull volume.
  Volume fractions in the two layers determine average displaced-liquid density;
  at equilibrium it equals egg density. Geometry remains the integrated
  egg-shaped solid at a sharp liquid interface, not a rectangular egg. Mixing,
  surface tension, hull stability and flooding are excluded as stated by each
  mode. No physical model equation or empirical parameter changed in this audit.

Further baseline findings and actual-renderer checks from all42 fresh boards:

- A visible acceleration arrow now changes inversely with cart mass while the
  force arrows remain fixed. Force and acceleration have explicitly separate
  units/scales; they are never added as if they were the same quantity.
- Equal-area immersed-face force arrows share one scale proportional to gauge
  pressure. The previous arbitrary additive length is removed; at top depth2 m,
  top/bottom force-arrow ratio is2/2.5=0.8. The contact-load view has its own
  labelled force scale. Standing-person forces are hidden in two-object mode;
  zero gas-pressure and zero-column-weight vectors remain absent.
- Work on a horizontal stair segment is locally zero. The full route’s mgh
  account is now labelled separately, replacing a misleading F s cosθ label
  next to the local90° construction. Slide/roll/horizontal modes get their own
  explanations and fidelity limits. Rolling has static contact friction and no
  dissipative loss; it is not the frictionless sliding model.
- Frame/projectile sphere surfaces now meet the actual floor at zero height in
  both3D and the linked drawing. Trajectory history is shown in both views.
  Authored complete motion/force envelopes centre the apparatus and fix camera
  scale during replay and observer switching. Circle release has a scrubbed
 0–0.35 s clock so the tangent continuation is observable without timing a click.
- The geyser/lamp energies are compared by bars on the same0–0.5 kWh scale. A
  dashed full-range energy line is explicitly a continuation if the selected
  power were left on; the solid segment ends at the actual operating duration.
- All actual textbook renderers are now exercised through their real public
  controls with a headless DOM/WebGL shell, including the functions in
  w_mechanicslab.js. New tests check literal acceleration scaling, proportional
  pressure arrows, force visibility/zero limits, landing contact, fixed replay
  framing and meaningful playback. This is computational evidence, not a claim
  of final visual or human-learning acceptance.

### Final published visual closure

- The scale comparison uses a single authored camera envelope covering the reference cube and the complete 0.5–3 length range. It must not zoom while a multiplier changes, since that would conceal the size comparison. An actual-renderer check transforms every cube corner to scene coordinates and confirms that the same envelope contains all corners at 0.5, 2 and 3.
- The torsion plot retains its physical axes, ticks and response data. The equilibrium/torque caption and twist-unit heading sit in the readable header, preventing the phone annotation layout from displacing the upper numeric tick below zero. This is a label-placement correction; gravitational torque, arcsecond conversion and damping are unchanged.
