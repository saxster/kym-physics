# Story, live and explorer graphics review

Reviewed 29 October 2026, as an independent textbook visual/fidelity pass. Audience: Kym, age 12, Mumbai. The goal is to make the mechanism, comparison or evidence readable from the drawing before its terminology is memorised.

Scope: all 57 registered figures in six `figs_stories_*.py` modules; all 36 production `live/w_*.js` widgets; the three self-test fixtures; all three `app/x_*.js` explorers; cover interactions and decorative graphics in `m_cover.js` and `m_beauty.js`. Story figures were inspected as source and in the six rendered baseline atlas sheets at `source/build/graphics-review/before/`. Live/explorer findings below are source-based editorial and model reviews, not a claim that every interactive state was operated in a browser. Runtime browser verification belongs to the main implementation pass.

## Most consequential findings

1. **Correctness, fixed:** the story rocket drew a Newton's-third-law pair with lengths 74 and 56. Both now measure 64; velocity arrows distinguish slow rocket and fast gas, and the momentum ledger explicitly states its isolated-system assumption.
2. **Meaningful redesign, fixed:** the inverse-square illustration named square areas while drawing only narrow edge-on strips. The replacement shows countable face-on grids with identical unit squares and areas 1:4:9, and a separate, proportionate beam side view.
3. **Meaningful redesign, fixed:** charge transfer was a circle and rectangle with unexplained extra electrons. The replacement shows a balloon and schematic hair section, vacancies in the hair, a transfer arrow, unchanged positive symbols and a conservation strip. Both before and after contain 8 positive and 8 negative charge symbols.
4. **Correctness, fixed:** terrella field arcs were minor ellipse arcs hidden inside the opaque ball. The equator needle pointed radially outward while labelled “level”. Actual external dipole curves now surround the stone; the equator needle is tangent to its local surface, with a separate ground-level Mumbai dip inset.
5. **Correctness, fixed:** for northward current above a compass, the wire field at the compass points west (`north × down = west`). The story needle had pointed east. It now deflects west by the same 27°.
6. **Correctness, fixed:** the Bose figure said a 1 m radio wave is 200 coin widths. A 22 mm coin makes that ratio about 45; the intended ratio is 1 m / 5 mm = 200. The figure now compares wavelengths.
7. **Dynamic model, corrected in final implementation:** `w_doppler.js` uses `agePhys = i * dTRing` every frame. Ring ages never grow, so the wave pattern translates rigidly with the train. Keep emission times or vary phase globally so individual emitted crests expand while their centres stay at their emission positions. The steady-state spacing itself is sensible. Also, the listener is drawn 42 px below the track while its physical offset is 1.4 m × 3.2 px/m = 4.48 px: disclose the offset or make it consistent.
8. **Misconception risk, corrected in final implementation:** the Volume IV motif animates “charge running along” magnetic field lines. The book explicitly teaches that field lines are not particle tracks. Use stationary direction arrows or stationary highlights instead of travelling beads.
9. **Model claim, corrected in final implementation:** the Volume II motif parameterises ellipses as `x=a cos(theta)-ae`, so theta is eccentric anomaly, but advances theta using the inverse-square distance rule for true anomaly. Use mean anomaly and Kepler's equation, or the correct eccentric-anomaly rate proportional to 1/r, before calling the motion Keplerian.
10. **Pervasive legibility:** most live canvases use 9.5–13 px labels in a nominal 640 px drawing, shrinking to roughly 5–7 px on a phone. Increasing decorative detail cannot solve this. Use a readable enlarged view and reduce labels to essential direct annotations; put full explanations in adjacent HTML. Make key text independent of colour.

## Story figures: complete assessment

“Retain” means the visual explanation is sound enough to preserve, with the stated specific improvement. It does not mean the figure is publication-ready at every screen size.

### Motion and fluids — 5

| Figure | Assessment and next improvement |
|---|---|
| `s_two_scales` | Retain equal arrows and equal numerical readings. Add recognisable hooked scales/handles and explicit label “each scale measures tension”; split the very long bottom sentence. |
| `s_rocket_momentum` | Fixed unequal interaction-force lengths and clarified isolated model. Next: connect each force explicitly to the body it acts on and use matching outlines for the rocket and gas in the momentum panel. |
| `s_torricelli` | Strong mechanism and broken-height comparison. Retain. Add a magnified meniscus/vacuum top and directly distinguish liquid level from tube rim; avoid mercury being visually indistinguishable from empty paper. |
| `s_hemispheres` | Pressure arrows communicate compression well. Retain. A small cross-section with a valve and split seam would explain pumping and separation; the labelled rope ends need not become decorative horse drawings. |
| `s_buoyancy_cube` | Sound differential-pressure argument. Bottom-left callout is cramped and visually competes with the side forces. Replace paragraph arithmetic with a short force/area ledger; show the displaced one-litre volume beside the tank. |

### Energy and tools — 10

| Figure | Assessment and next improvement |
|---|---|
| `s_clay_dents` | Good ratio comparison. Retain. Add a common height datum and equal-size physical ball rendering; use lightly hatched clay and a vertical depth dimension so depth cannot be mistaken for width. |
| `s_energy_bars` | Useful conserved-total geometry. Labels on dark saturated bars have poor contrast, especially in monochrome. Use hatches plus an outside legend and connect each column to a tiny ball-position scene. |
| `s_rumford` | Worth keeping apparatus and time line. The barrel label, rotation arrow and thermometer crowd one another. Draw a clean cut-away contact region and a separated inset showing mechanical work warming the water. |
| `s_wetbulb` | Quantitative and locally relevant. A bar axis beginning at 15°C can exaggerate ratios; a paired-dot/dumbbell plot better communicates temperature differences. Shorten and directly label “air” and “wet surface”; retain measured/computed distinction. |
| `s_monsoon_two_ideas` | Comparison has a useful purpose but the abstract blob does little geographical work. Add north/equator cues, a recognisable India/Arabian-Sea schematic and a stronger January–July relationship; avoid implying either diagram is a full model of monsoons. |
| `s_walk_graphs` | One of the strongest explanatory figures: shared time axis, slope and area. Retain. Use aligned shaded time bands and shorter direct annotations so it survives narrow screens. |
| `s_vectors` | The 3–4–5 construction is strong; left sums are too small and verbal. Give each team's contribution a countable arrow row. Draw a boat at the vector origin and mark the 37° angle physically. |
| `s_unit_chain` | High-priority basic graphic: four text cards with joining arrows. Replace prose examples with a lifting mass, one-metre bracket, and a one-second clock; distinguish force, energy and rate rather than implying all are conversions of one substance. |
| `s_engine_fall` | Useful hot–cold contrast and numerical ledger. Replace the free-floating wheel and vertical arrow with clearly split input/work/rejected-energy flows, widths proportional to 100:17:83; retain the historical model qualification. |
| `s_torch_patch` | Redesigned: countable 1×1/2×2/3×3 patches, constant unit square, proportional opacity and separate side view. Independent area check gives 1:4:9. |

### Fields and atoms — 16

| Figure | Assessment and next improvement |
|---|---|
| `s_rub_moves_charge` | Redesigned with recognisable balloon/hair, missing-electron outlines, transfer direction and explicit conservation. Units-of-charge qualification prevents badges being read as whole atoms. |
| `s_rope_loop` | Helpful analogy with equal-flow arrows. Make mechanical drive and heating contact recognisable; replace “it stops at saying what the rope is made of” with a precise limit of the analogy in the caption. |
| `s_ohm_line` | The line and points are clear. The lamp is not generally ohmic; the surrounding text does qualify fixed resistance, but the figure should itself say “fixed-resistance model, 4.8 Ω” rather than a headlamp’s real measured characteristic. |
| `s_terrella` | Redesigned/corrected external dipole loops and local tangent; a separate Mumbai inset earns the dip angle. Magnetic S/N labels make the Earth analogy explicit. |
| `s_oersted_compass` | Corrected northward-current deflection to west. Next: show the wire as an elevated bridge with a vertical section inset; the current top-view overlay hides why the needle receives an east–west field. |
| `s_faraday_ring` | Apparatus plus synchronised traces teach the causal relationship well. Retain. Label common time and make the needle’s zero baseline explicit; simplify the tiny battery/switch to maintain legibility. |
| `s_em_ladder` | Logarithmic scale is valuable. The visible band and UV are displaced into text without clear boundaries. Add band dividers and one visible-light magnification inset; explicitly separate 50 Hz quasi-static fields from freely radiated waves if keeping the mains example. |
| `s_bose_scale` | Corrected 200× ratio to compare wavelengths. Keep coin comparison; add a 5 mm bracket outside the wave so wavelength cannot be read as amplitude. |
| `s_photon_threshold` | Clear energy threshold and values. Preserve. Use visual electron-release outcomes, not only text; label 380 nm consistently as near UV relative to the book’s approximate 400–750 nm visible range. |
| `s_exposure_vs_contamination` | Good contrast. Wording corrected to “no radioactive material is left behind” to avoid implying exposure leaves no effects. More recognisable person/sleeve would help; preserve distinct travelling-ray and persistent-particle marks. |
| `s_halflife_c14` | Sound halving pattern. Add a row of countable undecayed/decayed particles above the bars, carefully identified as a statistical model. Align one half-life bracket with every interval rather than relying on years alone. |
| `s_sun_budget` | High-priority basic flowchart: mostly text in boxes. Add a solar-core inset and quantitative split; make the missing mass a tiny, explicitly magnified fraction, not an arrow visually comparable to the 596-million-tonne output. |
| `s_hydrogen_lines_temperature` | Schematic hump usefully contrasts abundance and visible strength. Fixed colliding “hotter”/axis labels. Add three small atomic-population diagrams linked to cool/intermediate/ionised regimes; avoid suggesting one atom’s emission spectrum is the complete stellar absorption mechanism. |
| `s_parallax` | Correctly distinguishes p from total shift. Preserve geometry, but tiny crossing sightlines are abstract; add a paired telescope-field inset and make the half-angle bracket less cramped. |
| `s_white_dwarf_mass_radius` | Useful counterintuitive trend and schematic qualification. Add matched small/large white-dwarf silhouettes at two points and state that the limiting curve belongs to the ideal supported-white-dwarf model. |
| `s_ruler_ants` | Good countable stretching example. Align both views on the chosen observer rather than the ruler’s left end, or explain why displacement arrows begin at shifted reference positions. Fixed-size ants and ruler tick spacing should remain explicit. |

### Sky — 13

| Figure | Assessment and next improvement |
|---|---|
| `s_moon_falls` | Useful tangent/curvature comparison, but the orbital departure after a minute is hugely enlarged without a visible local label. Add a magnified departure inset with “gap enlarged”; “3,600 times more slowly” should say acceleration is 1/3,600 rather than suggest speed. |
| `s_newton_cannon` | Computed paths are a strong foundation. Different shots need different line styles, start arrowheads and direct speed labels so they do not merge into an orbital tangle. Name the mountain enlargement. |
| `s_ellipse_pins` | Excellent true-orbit versus construction contrast. Retain. Complete the string loop along the pins baseline, identify the focus as a geometrical point and avoid using line weight for irrelevant emphasis. |
| `s_aryabhata_boat` | Strong familiar analogy. Retain. Mark the viewing direction and Earth’s rotation axis so east/west is earned by the drawing. |
| `s_tilt_year` | Parallel axes address a core misconception. Enlarge the Earth discs and add a close local sunlight inset; outer distance labels should not visually tie perihelion to the solstice. |
| `s_slant_light` | Geometry correctly keeps beam width constant. Add common-width perpendicular brackets and equal-area ground cells; a face-on footprint inset makes the area change more visible than five thin rays. |
| `s_phases_ring` | Good orbital view plus Earth view, with hatching robust to themes. Add numbered links connecting orbit positions to the phase strip, and an orbit line; orientation caveat is needed if “Mumbai” implies the exact sky rotation of the crescent. |
| `s_eclipse_tilt` | The necessary side view is useful. Retain the exaggerated tilt note. A second “near a node: eclipse” panel would explain when an eclipse does occur, not merely why most months miss. |
| `s_tide_bulges` | Helpful differential pulls plus spring/neap configurations. Add a separate Earth-centre-subtracted set of arrows to make the far bulge intelligible; raw Moon pulls alone do not show the differential outward effect. |
| `s_orbit_raising` | Quantitative nested orbits are strong; preserve their common focus. Directly colour/style the burns by date and include an overview/zoom pair for translunar scale instead of merely clipping the long curve. |
| `s_lunar_capture` | Quantitative radii and keyed line styles are valuable. Retain. Add orbital-direction arrows so the braking burn can be seen opposing motion; give the circular final orbit its own local zoom. |
| `s_neptune_tug` | Dense cluster of labels around Uranus conceals the discrepancy. Use a magnified position-residual inset plus an overview showing Neptune’s force; label displacement as exaggerated. |
| `s_l1_balance` | Unequal arrows correctly avoid the “gravity cancels at L1” error. Preserve the one-year orbital requirement. The halo orbit needs an oblique 3D inset because an apparent ellipse encircling a point can imply a small planet-like central attraction. |

### Historical tales — 8

| Figure | Assessment and next improvement |
|---|---|
| `s_eclipse_bend` | True/apparent position contrast is useful. The dashed back-projection is not exactly collinear with the arriving ray; compute the apparent position from the outgoing ray so visual geometry proves the explanation. Move the crowded lower text into a clean comparison inset. |
| `s_faraday_cube` | Interior instrument and exterior charge location are instructive. Use a visible cut-away wall and optional electroscope comparison outside the enclosure; empty interior should be visually distinct from filled conducting metal. |
| `s_fizeau_wheel` | Two states are valuable, but the beam crosses the wheel’s whole circular body and lamp overlaps the heading. Show the wheel edge at the beam with a magnified tooth–gap inset and a distance-break in the 8.6 km path. Tooth spacing should be schematic and explicitly stated. |
| `s_foucault_turn` | Comparative dials are worthwhile. Actual code uses rate×3×1.4 (4.2 hours equivalent), while comments claim other exaggerations and footer only says “several hours”. Choose one explicit elapsed time and draw true angles; no invisible angle multiplier. |
| `s_kilogram_rule` | The old/new comparison is relevant; the tiny Kibble balance, text and force label collide. Show separate force and velocity measurement phases in a cleaner inset, with weights and electromagnetic force attached to the actual moving coil. A beam sketch alone is not the mechanism. |
| `s_mpemba_curves` | The same-state test is conceptually strong. Retain. Label the curve as cooling to 0°C rather than completed freezing; do not conflate reaching 0°C with time to freeze all the water. Use line styles plus direct labels for branches. |
| `s_tram_field` | High-priority misleading basic geometry: magnetic circles are drawn in the same plane as a horizontal overhead wire instead of encircling its axis; the central formula crosses the observatory; 1.3% field ratio is shown as about a 28° needle swing. Redraw an end-on wire cross-section, separate the return path and label the field estimate schematic; use a correctly scaled or explicitly magnified compass inset. |
| `s_wobble_loop` | A causal cycle is the right form, but three text boxes do little physical teaching. Show a bridge deck, walkers and side-step force at the three steps, with a visibly connected damper draining energy. Move “energy drained out” out of the cure title. |

### Cross-cutting story standard

Use small human/object illustrations only where they establish scale, material, contact or viewpoint. Preserve clear abstract plots. A surface texture should identify material or a region, not decorate empty space. Matching quantities get matching lengths/areas, and every exaggeration is labelled beside its location. Essential labels should be direct; explanatory paragraphs belong in captions. All symbols need a readable monochrome distinction.

## Production live widgets: complete assessment — 36

All these would benefit from mobile label enlargement and a common clear visual distinction between quantities, measurements and controls. The actions below are specific to the individual visual rather than a generic request for “more polish”.

| Widget | Teaching value and useful refactor |
|---|---|
| `w_airfall` | Keep synchronised object fall plus speed plot. Draw recognisable object silhouettes and a common strobe-time grid; show equal drag/weight arrows clearly at terminal speed and directly connect graph colours to objects. |
| `w_buoyancy` | Keep density/hollow-hull comparison and displaced-volume accounting. Make hull wall and trapped-air region a proper cut-away; distinguish buoyancy alone from net force and tank-floor support at the settled state. |
| `w_cannon3d` | Computed 3D trajectories earn the medium. Keep a readable 2D orbital-plane inset and line-style keys, and use a visible atmospheric/model boundary rather than implying a mountaintop near Earth is a practical vacuum launch. |
| `w_circuit` | Potential profile, counters and rope analogy are three useful representations but overcrowd one 640×360 frame. Stage them with aligned highlights: battery raises energy per charge, resistor/LED lowers it, charge rate remains unchanged. |
| `w_colourmix` | Keep additive/subtractive/object modes. Make object silhouettes recognisable (banana, leaf, cloth, kurta) and label idealised three-channel reflectance. Selection cards drawn on canvas need equivalent native controls for keyboard/screen-reader access. |
| `w_conduction` | Energy ledger and warm-hand transfer are strong. Add a local contact cut-away, organise six layers as a readable temperature profile and make arbitrary flow “units” visually different from joules. The decorative jiggle must not imply particles traverse the slab. |
| `w_doppler` | Fix ring emission/expansion animation described above. Mark the listener’s geometric offset and compare arrival times of two successive identifiable crests; otherwise ring spacing and heard pitch remain disconnected. |
| `w_energystores` | Existing richly styled jars/hatches and transfer scenarios are materially stronger than basic diagrams. Retain hatch semantics, scale label and conservation ledger; organise eight-store overview separately from the selected scenario, simplify pipes at crossings and make the molecular inset readable. |
| `w_energytrack` | Dynamic bars linked to track position explain conservation. Formula uses translational KE only but calls the object a rolling marble; either label a sliding point-mass model or include rotational KE. Avoid adding a false spin animation over a translational model. |
| `w_expansion` | Fixed-size ants/galaxies and selectable observer teach relativity of recession well. Keep a common observer-centred baseline, qualify projected balloon geometry and make stretching wavelength distinct from the changing displayed colour. |
| `w_eye3d` | Cut-away and focus correction merit 3D. A permanent diagram plane showing lens, rays, retina and focus offset should remain legible during rotation; treat the single effective lens/air optical model as a schematic. The no-WebGL fallback should expose the same essential cause/effect. |
| `w_field3d` | Clear current dependence and wire/coil/magnet comparison. Add a labelled perpendicular wire cross-section and needle orientation; do not confuse geometric field lines with flowing material. Retain 1/r numerical readout and zero-current state. |
| `w_forces` | Good force/velocity distinction and net-force explanation. Keep consistent arrow scales, show balanced forces with a moving ground reference and simplify the cart into a recognisable trolley. Velocity length currently saturates at 180 px, so give a saturation cue or scale key. |
| `w_freefall` | Recorded example plus live sensor is effective. The “recorded” demo is actually `schematicReading()` generated from a hand-shaped curve; label it simulated unless real recorded data is supplied. Clearly distinguish accelerometer support-force reading from gravitational acceleration. |
| `w_graphwalk` | Excellent linked corridor and graph. Replace dots with small walker silhouettes and add a local tangent/slope triangle; do not add unnecessary scene detail. Preserve the two crossings and manual-trace mode. |
| `w_harmonics` | Sound plus mode shape is meaningful. Six tiny drag bars need native accessible sliders or a focussed single-harmonic control. Make idealised string/drum/tabla mode differences visible instead of simply changing numbers and the mixed waveform. |
| `w_induction` | Magnet/coil/meter plus pulse trace is an excellent structure. Expose flux change geometrically and make coil turns countable/schematic. Units need checking: code’s 1 px = 1 mm geometry note disagrees with `curVelMs = dxPx/dt*(0.20/360)`; reconcile calibration before displaying physical speed. |
| `w_interference` | Source-spacing/wavelength controls and screen stripes teach well. Correct the screen projection: ripple image is drawn to `W−90=550` while source dots remain at nominal x=56; image source x is about48, so markers no longer coincide. Identify the intentionally rescaled tank ratio and keep it separate from the physical 1m screen geometry. |
| `w_magnetometer` | Numerical vector decomposition is educational. A phone-orientation drawing should explain sensor coordinates and whether “down” is world vertical. Enlarge 9.5px reference labels and show measured values separately from WMM references. |
| `w_mirror` | Draggable eye/object and back-projection are well chosen. Make virtual rays dashed and real rays directional in every view; add clear mirror silvered backing and a simple person silhouette for the whole-body proof. |
| `w_momentum_carts` | Conserved total plus collision modes are strong. Add matching before/after momenta on one shared scale, and give energy conversion in the sticking case a small ledger rather than only prose. |
| `w_parallax` | Telescope and overhead modes complement each other well. Link the selected month consistently in both views and show the half-shift p and full shift2p as actual brackets; retain explicit angular exaggeration. |
| `w_phases` | 3D lit hemisphere with viewpoints is appropriate. The canvas fallback currently draws two plain circles with no phase shading or orbit/light direction; this loses the lesson. Implement real phase masks in fallback. Qualify that the simplified rise-time is approximate and not an actual Mumbai ephemeris. |
| `w_pressuretank` | Tap-to-inspect depths is useful. Avoid clipped mercury-force arrows by switching scale with an explicit key; show gauge pressure compared with atmosphere without implying increasing absolute pressure increases equal-atmosphere jet speed. Give holes keyboard-accessible controls. |
| `w_projectile` | Shared strobe times make independence of vertical motion visible. Keep matched time markers, a common floor and velocity-component arrows. At extreme launch speed/angle, fit the trajectory or label a clipped continuation rather than letting the meaningful landing leave the frame. |
| `w_ramp` | Sliding-puck qualification is scientifically honest. Retain. Add an optional height-to-speed energy link and distinct still/first-peak/return states; keep equal-height datum obvious when ramp angle changes. |
| `w_refraction` | Marching wavefronts plus cup is valuable but dense. Match wavefront spacing and speed between materials; split the coin experiment into a selected second view so the main ray/normal/angles can be enlarged. |
| `w_ripple` | Paper-scrap motion directly confronts transport misconception. Keep it prominent and label local oscillation versus travelling disturbance. Avoid decorative circles competing with the still lines in two-source mode. |
| `w_scope` | Reader voice and frozen traces make evidence personal. Move axes/units and pitch/loudness summaries into readable HTML or enlarge them. Label pressure amplitude as relative microphone signal unless physically calibrated. |
| `w_seasons` | Parallel orbit axis and local Sun patch are a strong pair. Use a legible local horizon and face-on grid footprint; keep actual distance variation subordinate to tilt/daylength and show direction relative to Mumbai. |
| `w_seriesparallel` | Breaking one branch is a decisive experiment. Retain. Use standard clean schematic symbols linked to a tiny physical LED circuit view; currents need branch junction dots and a clear common 9V annotation. |
| `w_shadow` | Preserves true 7.2° central-angle geometry. Add a magnified Alexandria stick/shadow inset because the informative difference is physically small; label stick height hugely enlarged relative to Earth rather than claiming an overall scale drawing. |
| `w_skycolour` | Physically motivated sky shader has clear teaching value. Show separate direct-sun and scattered-light paths with a simple observer, and qualify RGB/single-scattering as an illustrative colour model; numerical scattering factors belong beside a selected wavelength comparison. |
| `w_tides` | Differential pull plus rotating observer plus tide trace is a good structure. Label the trace an ideal equilibrium tide at a rotating site rather than a prediction for Mumbai/Haji Ali; coastline and basin dynamics make real local tides different. Add raw versus centre-subtracted force toggle. |
| `w_videotrack` | Actual user evidence plus predicted toss is strong. Keep clip local, make scale calibration visible, show points with confidence/measurement limitations and align selected video frame with both the graph and gap table. |
| `w_whirl` | Contrasting frames and tangent release directly counter the outward-force misconception. Keep force/velocity coding; move rotating labels to a stable legend and mark the fictitious force explicitly in the rotating frame. |

The three `w_selftest*.js` files are technical fixtures, not textbook teaching graphics. Preserve them as test tools; exclude them from the published visual-quality denominator and from cosmetic refactors.

## Explorers, cover and decorative systems

| Surface | Assessment and concrete opportunity |
|---|---|
| `x_scale.js` (Powers of Ten) | Current illustration scenes and coherent physical window are strong. The centred nested landmark schematics at microscopic/astronomical scales remain much more basic than room/coast artwork. Add scientifically constrained material/structure details at each selected landmark and a stable human/previous-step comparison; preserve physical dimensions and fit. Do not scale arbitrary artistic features as if measured. Existing user changes here should be preserved. |
| `x_sky.js` — seasons | Linked space/rooftop canvases are a good explanatory composition. Directly highlight the same ray in both and enlarge the Mumbai horizon/gnomon. Most 9–10px labels should become 13–15px CSS text or direct annotations. |
| `x_sky.js` — Moon/tides | Separate the orbital lit-half view, observer’s phase and ideal tide response with explicit correspondences. Add numbered phase links and a legend distinguishing Earth shadow from Moon’s own night. |
| `x_sky.js` — Chandrayaan | Orbits are mostly generic ellipses with arbitrary aspect ratios. Even if spacing is schematic, the central body should sit at a focus: current `bPx` is chosen independently of `aPx` and centre offset, so orbital focus is wrong. Derive a,b,c from pericentre/apocentre or label as a diagram of mission stages; use overview plus zoom for scale. |
| `x_sky.js` — Aditya-L1 | Preserve unequal gravitational pulls and one-year orbital requirement. Use an oblique halo-orbit inset with L1 marked as a point in the rotating system, not a gravitating body; connect the selected time to spacecraft position. |
| `x_spectrum.js` | Spectrum/visible zoom/E⊥B/photoelectric tester are powerful but compete in one canvas. Use selected panels with a persistent main spectrum; enlarge band labels and add an explicit magnification connector for visible light. Avoid `Math.max(6, visibleBandWidth)` without indicating the sliver is widened. Its 1.2–14 displayed cycles are a compressed visual encoding across many frequency decades; keep this limitation beside the wave. |
| `m_cover.js` chapter tiles | Formula-only tiles are abstract before a child has read the book. Pair each with a tiny physical emblem: shadow, ramp, train, trolley, falling ball, orbit, hull, clay dent, warm hand, wave, eye, prism, loop, magnet, tilted Earth, spectrum. Keep keyboard/focus behaviour. Several story IDs (`galileo-ramps`, `thumba`, `delft-drop`, etc.) appear absent from `src/stories/`; validate every story link rather than retaining dead calls to action. |
| `m_beauty.js` cover field | Brownian dots add atmosphere but no explanation. Retain subtly as decoration, respecting still mode; do not claim they depict measured particle motion. Consider one restrained physical focal object rather than covering the reading title with moving noise. |
| Volume I projectile motif | Uses physically shaped arcs and equal-horizontal strobe guides. Preserve. Distinguish an explicitly illustrative vertical exaggeration from a quantitative trajectory plot; a still hero can be beautiful without automatic motion. |
| Volume II orbit motif | Correct eccentric-anomaly dynamics before claiming Kepler's law (see finding9). Equal-area wedges should have mathematically equal swept area, not arbitrary angular spans. |
| Volume III interference motif | Two-source pattern has subject meaning. Keep stationary node/antinode structure, but make the time-averaged intensity field distinct from moving crest rings; avoid treating instantaneous `amp*amp` at one phase as full time average. |
| Volume IV magnetic motif | Remove moving “charges” along field lines; static dipole loops and direction marks preserve beauty without teaching a false mechanism. |
| People medallions | Initials and stipple honour the no-photographs convention. Retain; use consistent diameter, text contrast and a visual landmark for the person's field, but do not invent likenesses. |
| Chapter spine | Navigation ornament is useful only if it improves orientation. Keep progress state and chapter landmarks legible; avoid miniature physics detail that cannot be read at margin size. |

## Evidence for the implemented subset

- `source/tests/test_figs_core.py`: passed all nine primitive checks.
- Parsed all changed figure SVGs as XML.
- Independently counted conserved charge symbols: across the before-and-after composition, 16 positive and16 electron symbols (8+/8− per state).
- Independently computed face-on patch areas: 34²,68²,102², giving1:4:9.
- Independently measured rocket interaction arrows: both64 viewBox units.
- Rendered all158 registered figures, including this subset, using `source/graphics_audit.py` to `source/build/graphics-review/story-update/`, with full module sheets and browser text bounds. Visually inspected the three changed module sheets. The final build/multi-theme/mobile and live-state verification remains the parent pass.

## Follow-through corrections

Implemented the following verified defects after the first review:

- Repaired all seven absent cover-story IDs using existing stories that match each tile: Galileo→`p-galileo`, Thumba→`p-sarabhai`, Delft→`falling`, dark-room optics→`seeing`, Raman's sea→`raman`, circuit story→`circuits`, seasons→`seasons`. Checked all16 cover story targets against actual front-matter IDs.
- Relabelled the generated free-fall curve consistently as a **simulated** drop in its control, initial-state comment, canvas annotation and readout. The real motion sensor remains identified as a sensor.
- Unified induction speed with the stated1mm/px drawing scale. A180px stroke in0.5s is0.18m/0.5s=0.36m/s. The nudge and reported speed now share named calibration constants; the illustrative flux is explicitly in milliwebers per turn, making its derivative millivolts. Replaced the misleading15mV calibration comment with the actual approximately3.3mV model peak.
- Changed only Doppler's local enhancement calculations/cut-away text from343m/s to348.7m/s, matching the widget's30°C model. Other20°C sound examples remain unchanged.

Validation: all four edited JavaScript files pass `node --check`. A lightweight execution harness mounted the real induction callback, nudged the magnet, and observed0.36m/s during motion followed by0.0mV when held. Executing the real Doppler `yourNumbers` callback at90km/h and400Hz produced431Hz ahead,373Hz behind and58Hz drop, matching an independent calculation with348.7m/s. A source check confirms no generated free-fall data is called recorded and all16 cover links resolve. These checks complement the parent's real browser pass; they do not substitute for full rendered-state verification.


## Coordinator closure

The original-state findings above are preserved as audit evidence. The final implementation fixes Doppler emission motion and pause/audio behavior, field-line travelling beads, Keplerian decorative motion, sensor-demo wording, induction calibration, cover story targets, mission-orbit foci and periods, eclipse-season wording, and ideal-tide labelling. Story eclipse, tram-field, Foucault, Moon-gap and cooling-endpoint geometry were also corrected. See graphics-audit.md for the final verification receipt and the individual tables for still-open artistic opportunities.
