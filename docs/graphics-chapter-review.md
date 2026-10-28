# Chapter graphics: independent textbook-art and physics review

Reviewed 29 October 2026. Scope: **all 101 registered chapter/cover SVGs** in `source/figs_ch00.py` through `figs_ch15.py`. Read drawing code and inspected every chapter contact sheet in `source/build/graphics-review/before/`. This is an independent audit of the starting state, not a claim that every opportunity below has been implemented. Story figures, live widgets and explorers are covered by the coordinator's broader audit.

`FIX` identifies a demonstrable scientific, wording, or layout defect. `REDESIGN` identifies a teaching/art opportunity, not necessarily an error. `KEEP` means the explanatory structure works; the listed opportunity can be addressed without replacing it. The contact sheets' sticky toolbar obscures parts of their first row; code and the underlying gallery supply the obscured content. Phone legibility must be checked in the actual book, not inferred from these desktop sheets.

## What the visual system needs

The strongest existing graphics put the same quantity in a comparable position: the fall strobes, equal-height energy bars, equal-time orbital dots, circuit currents and fixed-axis seasons. Keep that discipline. Many weaker graphics are boxes with explanatory sentences around them: the mechanism remains in the writing. Improve those with recognizable apparatus, close-ups of the active contact, numbered sequences, traced light/charge paths, and linked observations. Do not add realism where the abstraction already carries the idea well.

Across the book, distinguish three things consistently: the physical scene, analytical arrows/graphs, and the conclusion the reader should discover. Reserve red for force/selected energy change, blue for motion/field, and use labels or line styles as the second cue. Keep spectra physically coloured because colour is their subject. A polished illustration must never straighten a projectile path, misalign a pressure crest, reverse a force, or imply a quantitative scale it does not have.

Default 12 px text in a 640-unit SVG becomes about 6–7 px at phone width. Widening strokes cannot solve that. Dense multipanel figures need stacking, a larger readable view with a clear affordance, or fewer words inside the SVG and a connected caption. The 1000-unit triple plots and ladders particularly need this treatment. Preserve still figures for print and no-JavaScript use.

## Highest-priority verified defects

1. `c13_motor_force`: the shown upward conventional current crossed with a rightward field gives **into** the page, not out. The motor loop then draws force parallel to its current. Replace the left dot with a cross or reverse the current; show the two loop forces into/out of the page or use a coherent 3D projection.
2. `c9_compressions`: particle compressions occur at displacement-gradient minima, but the pressure wave is a quarter wavelength away. With displacement `A sin(kx)`, pressure is proportional to `−cos(kx)`, so use phase `−π/2`, not `π`.
3. `c1_two_frames`: the stationary-observer bounce is drawn as straight zigzags. Constant horizontal velocity plus vertical gravity gives parabolic arcs, with equal-time dots crowded near the apex.
4. `c6_tank`: deepest jet is drawn with greatest landing range. Exit speed grows with depth, but flight time shrinks for lower holes. For water-surface height H above ground, range is `2√(d(H−d))`; it is greatest for d=H/2. Draw the actual trajectories or compare equal short flight times without a floor.
5. `c7_track` and §7.3: a rolling marble is assigned `mgh=½mv²`. That omits rotational kinetic energy. The displayed 4.4 and 3.1 m/s are correct for an ideal **sliding bead**, not a rolling solid sphere. Relabel the model consistently, including live descriptions, and explain the distinction once.
6. `c11_prism`: the red ray emerges upward after travelling downward inside an upright prism, inconsistent with refraction away from the right face's normal. Recalculate a ray bundle that deflects toward the prism's base. Use actual spectrum colours and arrowheads.
7. `c15_photoelectric`: violet lamp says 2.95 eV while the ladder and alternative description say 3.26 eV. Choose one wavelength/energy consistently.
8. `c15_fusion`: 0.71% is the net four-hydrogen-atom to helium-atom mass budget, including annihilation, not precisely the four-proton/helium-nucleus comparison drawn. Specify the full net budget or correct the comparison and products.
9. `c14_eclipse_tilt`: “Twice a year: an eclipse” conflates eclipse seasons with a fixed count of eclipses. Name the alignment condition/node or eclipse season.
10. `c9_pendulum` clips the bottom of “weight”; `c9_harmonics` overlaps 2.14 and 2.3. Several other dense figures have text overflowing their viewBox; use the gallery's metrics rather than trusting the SVG frame.

## Complete per-figure review

### Chapter 0: learning to see

| Figure | Assessment and concrete opportunity |
|---|---|
| `c0_hull_down` | REDESIGN — Keep the flat/curved comparison. Replace triangles with recognizable vessels, use one tangent sightline, and shade the occluded hull below it. Label exaggerated curvature directly. |
| `c0_rulers` | KEEP — The same stick against finer scales is an excellent comparison. Enlarge an endpoint inset; the 1 mm ticks become texture on a phone. Label the cm scales explicitly. |
| `c0_ladder` | REDESIGN — A text-only 36-decade ruler is too small to explore. Add small object silhouettes at selected powers, magnified transitions, and clear approximation signs. Keep equal exponent spacing. |
| `c0_rain` | REDESIGN — The slab is intelligible but generic. Pair a recognisable coastal-city footprint with a rain-depth inset and three linked area → volume → mass steps. Keep the thickness-exaggeration note. |
| `c0_eratosthenes` | FIX — Actual geometry is drawn at 30° but labelled 7.2°; the exaggeration exists only in a code comment. Say so visibly. Add a matching-angle cue and a small well/stick inset. The Earth circle is intentionally cropped, but the final text needs bottom clearance. |
| `cover_art` | FIX / REDESIGN — `v=c` as the inertia tile is readily confused with light speed c. Use `v=constant` or a moving-object motif. The sixteen formula tiles could become sixteen illustrative clues, retaining navigable labels. |

### Chapter 1: describing motion

| Figure | Assessment and concrete opportunity |
|---|---|
| `c1_two_frames` | FIX — Replace straight zigzags with parabolas; give the two frames matching equal-time snapshots and one shared event highlight. A walking person/ball context would make “frame” concrete. |
| `c1_graph_walk` | KEEP — Accurate slopes/intersections. Add a small corridor strip aligned to the numbered graph intervals; shorten in-plot sentences and label the two people directly. |
| `c1_four_cars` | KEEP — The four sign combinations are well chosen. Upgrade recognizable cars and separate velocity/acceleration rows; shorten right-hand text so it fits without shrinking. |
| `c1_ramp` | KEEP — Exact 0,1,4,9,16 positions teach acceleration. Use numbered time badges and move the crowded first three “beats/distance/gaps” labels into a tiny table/key. |
| `c1_toss_strobe` | KEEP — Strong evidence graphic with computed spacing. Clarify that left/right are two portions of one vertical trajectory, not a sideways jump; highlight matching times around the apex. |
| `c1_toss_graphs` | REDESIGN — Three sound quantitative plots become tiny at 1000-unit width. Stack on phones and link the same apex time through all three; add a miniature toss beside the height plot. |
| `c1_trains` | REDESIGN — Rectangles with names do little to teach relative motion. Draw local-train windows and a track observer, then compare track-frame and passenger-frame velocity arrows side by side. |

### Chapter 2: inertia and contact

| Figure | Assessment and concrete opportunity |
|---|---|
| `c2_book_slide` | REDESIGN — Make the book and departing hand recognizable, show sequential motion marks and decreasing equal-time gaps. Preserve the intentional “what pushes it back?” prediction before the explanation. |
| `c2_arrow_forces` | KEEP — Good separation of velocity, real forces and a crossed-out false force. Retain the crossing, reduce annotation length, and attach each force to a named interaction. |
| `c2_two_ramps` | KEEP — The invariant-height argument is visible. Make the ideal negligible-loss assumption explicit and show a sequence of progressively shallower returns, ending with the continuation arrow. |
| `c2_train_brake` | REDESIGN — Add recognizable carriage/platform context and a ghost of the passenger's prior posture. Distinguish the two reference frames with panel headers, not a disconnected dashed “force”. |
| `c2_friction_closeup` | REDESIGN — The close-up needs a leader back to the actual contact. Highlight the few junctions and show deformation/contact rather than implying roughness alone explains all friction. |
| `c2_friction_graph` | KEEP — Static matching and the sliding drop are clear. Add a matched block/hand state at each region and mark the graph schematic rather than implying a universal kinetic plateau. |

### Chapter 3: forces and momentum

| Figure | Assessment and concrete opportunity |
|---|---|
| `c3_tug_cart` | KEEP — Scaled net force and explicit arithmetic work. Put the children/ropes into the scene or replace unexplained sum terms with a small contribution ledger. |
| `c3_f_ma` | KEEP — The controlled comparisons are excellent. Add wheeled carts and common baseline; keep the doubled mass/force/acceleration ratios exact. |
| `c3_bridging_chain` | FIX / REDESIGN — It claims the table's sag is exaggerated, but draws the table flat. Show its slight deformation and equal weight/support arrows. The spring is pressed by a hand, so “in every case ... matches the weight” should say “matches the downward load”. |
| `c3_luggage_scales` | KEEP — Matched readings counter the doubling misconception. Draw scale bodies/hooks and hands, show tension along the same line, and qualify equal readings to the ideal/light static arrangement. |
| `c3_pairs_person` | REDESIGN — Four same-colour arrows around one person/floor are hard to group. Split “forces on Kym” from “forces on Earth/floor”; pair numbers and connector brackets make different objects explicit. |
| `c3_momentum_carts` | KEEP — Correct before/after momentum; 0.350×2−0.500×0.5=0.45, after≈0.451. Show signed contribution bars so conservation is visible without arithmetic in prose. |
| `c3_rocket_momentum` | FIX / REDESIGN — The two “equal and opposite” force arrows are 60 and 56 units long. Make them equal. The right-hand arrows stand for momentum but use the velocity style; name their quantity and show total-zero balance. |

### Chapter 4: falling

| Figure | Assessment and concrete opportunity |
|---|---|
| `c4_two_predictions` | KEEP — Predictions vs evidence is the right structure. Show both release ghosts and the board impact as the decisive event; give the heavy/light masses labels rather than size alone. |
| `c4_drag_balance` | KEEP — Weight fixed, drag growing, graph flattening is strong. Link the three pictured stages to corresponding points on the speed curve. Distinguish “zero net force” from “zero speed”. |
| `c4_moon_strobe` | REDESIGN — Exact positions are useful but early 0.0/0.2/0.4 hammer/feather drawings overlap. Use small centres plus detailed object insets and offset time labels with leaders. |
| `c4_two_coins` | KEEP — Same-height joins make independence visible. Use a smooth computed trajectory, exact equal-time horizontal spacings and a clean shared-release inset. |
| `c4_whirl` | KEEP — Tangent exit vs false radial path is effective. Add a faint plate surface/rim, a clearly cut gap, and cross the false path so it cannot be mistaken for another observed trajectory. |

### Chapter 5: gravity and orbits

| Figure | Assessment and concrete opportunity |
|---|---|
| `c5_moon_fall` | FIX / REDESIGN — The Earth-pull arrow is offset and diagonal instead of radial downward from the initial Moon position. Draw it from the Moon toward Earth. Make the hugely exaggerated 4.9 m separation an inset dimension. |
| `c5_cannon` | KEEP — Numerically integrated paths are valuable. Give paths distinct line styles/direct labels and show only honest in-frame segments. The ~8/~11 km/s are Earth-near illustrative values, with the oversized mountain identified. |
| `c5_phone_drop` | KEEP — Clear zero proper-acceleration demonstration. Add held/falling/impact phone silhouettes. The stopping pulse is schematic; its integral should not be interpreted as measured deceleration. |
| `c5_ellipse` | REDESIGN — Three useful concepts crowded into one wide strip. Separate pin construction, Mars's near-circle and equal-area law into readable panels, with matched sector outlines/hatching. |
| `c5_cavendish` | REDESIGN — The apparatus reads as a line in a box. Show a ghost rod before/after torque, suspension inset, and a labelled optical readout. Keep the opposing mass placement and tiny-force explanation. |
| `c5_comet` | KEEP — Equal-time dots communicate dwelling far away. Add a direction arrow and explicit generic-comet period if saying “weeks/decades”; otherwise say “short time/long time”. |
| `c5_chandrayaan` | KEEP — The common physical scale is the point. Add an enlarged near-Earth inset, burn-position arrow and chronological labels; preserve the common-scale main drawing and historical values. |

### Chapter 6: pressure and buoyancy

| Figure | Assessment and concrete opportunity |
|---|---|
| `c6_pressure` | KEEP — Equal weight with 4× area comparison is sound: 9.8/0.024≈408 Pa and 9.8/0.006≈1633 Pa. Improve packet rendering and show the missing contact dimension in a plan-view inset. |
| `c6_barometer` | REDESIGN — Shared scale is valuable, but mercury's 76 cm is tiny. Add a magnified mercury inset alongside the common-scale building/water comparison; show the near vacuum on both tubes. |
| `c6_card` | REDESIGN — Only the upward pressure arrows are shown. Add internal pressure and water weight to show near balance; otherwise the picture suggests the whole 101 kPa is unopposed. Show a mouth/pressure change on the straw. |
| `c6_tank` | FIX — Compute projectile trajectories to a common floor; the middle depth can land farthest even though the deepest exits fastest. Link increasing pressure arrows to exit-speed arrows and keep gauge vs atmospheric pressure explicit. |
| `c6_buoyancy` | REDESIGN — Useful solid/hull comparison. Add displaced-water outlines/containers and separate all pressure forces from their resultant. Label the hull's outer volume versus actual displaced volume at its floating waterline. |

### Chapter 7: energy

| Figure | Assessment and concrete opportunity |
|---|---|
| `c7_ledger` | KEEP — Equal totals and explicitly counted surroundings are strong. Add the corresponding ball/floor state above each column and label energy stores on the chart so colour need not be remembered. |
| `c7_dent` | KEEP — Momentum×2 vs energy×4 is visible. Keep “roughly/constant resisting force” beside the clay-depth analogy and show the release heights or impact speeds as the controlled variables. |
| `c7_track` | FIX — Use an ideal sliding bead, not a rolling marble, for the displayed translational-only energy equation. Add tangential arrows that match the local track slope and a visible no-spin assumption. |
| `c7_bounce` | KEEP — Lower bounce/constant whole-system total is excellent. Connect peak numbers to energy bars with common identifiers. Say whether the curved scene's horizontal axis is time or schematic position. |
| `c7_bill` | REDESIGN — Logarithmic **bar lengths** can imply incorrect ratios: the 100 h bar is not 10× the 10 h bar. Prefer a log dot plot labelled duration, or equal-area energy tiles with familiar device drawings. |
| `c7_city` | KEEP — The 40/60 Sankey widths and capacity-vs-generation distinction carry useful meaning. Add generator/cooling-water motifs; explicitly mark right bars as shares (100% each), not absolute comparable amounts. |

### Chapter 8: heat

| Figure | Assessment and concrete opportunity |
|---|---|
| `c8_joule` | REDESIGN — Draw a working linked weight→axle→paddle→water mechanism; the thermometer currently floats separate from the apparatus. Put its bulb in the water and use a magnified tiny-rise inset. |
| `c8_bucket_spoon` | KEEP — Size×temperature-change comparison is strong. The spoon's 0.6 px bar is rendered as a vertical line; provide a labelled enlarged inset while retaining its true-scale sliver. Give bucket particles small motion marks too. |
| `c8_conduction` | KEEP — Paired same-temperature surfaces teach a useful misconception. Add the actual contact object and leaders to the particle cutaways; unclutter the logarithmic conductivity labels. |
| `c8_sweater` | REDESIGN — Good trapped-air mechanism, weak outcome picture. Show equal starting ice cubes with matched elapsed-time badges and inward energy arrows on the wrapped cold cube. Qualify one hour as illustrative. |
| `c8_heating_curve` | KEEP — True energy-width scale makes latent heat visible. Add phase sketches at each segment and state atmospheric pressure; do not stretch the short warming segments to fill space. |
| `c8_matka` | KEEP — Mechanism includes pores, evaporation and energy loss. Improve pot silhouette/cross-section, connect the close-up to a wet patch and show faster escaping particles without implying all particles leaving are only the absolute fastest. |
| `c8_sea_breeze` | REDESIGN — Local land/sea context could replace the generic rectangles. Add surface-temperature difference and ground-pressure gradient; keep the circulation arrows and daylight assumption explicit. |

### Chapter 9: waves

| Figure | Assessment and concrete opportunity |
|---|---|
| `c9_pendulum` | FIX — Weight label extends below the viewBox. Increase clearance; make the tangent arrow explicitly a component of weight, not another force. Preserve the 4:1 length and 2:1 period comparison. |
| `c9_resonance` | KEEP — The computed damping comparison works. Use distinct dash styles and direct curve labels; call the peak “near natural frequency” because damping shifts the amplitude maximum slightly below it. |
| `c9_flutter` | KEEP — Important contrast with the false Tacoma resonance story. Make a four-stage twist→airforce→further-twist loop; “it pushes itself” needs the wind energy source clearly shown. |
| `c9_wave_carries` | REDESIGN — Link the top and side views with a highlighted scrap/particle. The circular-orbit depiction is a model for water waves, not exact for all depth/surface conditions; identify that simplification. |
| `c9_compressions` | FIX — Align pressure maxima with actual particle compression. Add faint vertical guides between the two representations and a highlighted particle's local back-and-forth displacement. |
| `c9_loud_high` | KEEP — Controlled amplitude/frequency matrix is clear. Label the common time span and measured pressure/signal on each panel; show equal scales so amplitude changes are honest. |
| `c9_harmonics` | FIX — 2.14 and 2.3 labels collide. Stagger with leader lines or enlarge spacing. “Overtone ÷ fundamental” incorrectly calls the fundamental an overtone; use relative frequency f/f₁. |
| `c9_doppler` | KEEP — Correct displaced emission centres produce bunched/spread rings. Mark past source positions and one equal-time interval to expose the construction; keep the exaggerated source/sound speed ratio visible. |

### Chapter 10: seeing

| Figure | Assessment and concrete opportunity |
|---|---|
| `c10_seeing` | REDESIGN — Give the false eye-ray model a cross and a clear “prediction” label. Draw recognizable mango/eye/lamp and retain source→scatter→eye arrowheads; reduce sentence labels. |
| `c10_pinhole` | REDESIGN — Replace a generic object arrow with the window itself and its inverted recognizable image. Keep two colour/line-coded point bundles. Dimensions are schematic; show the actual 10:1 image reduction in a separate inset if using 3 m/30 cm. |
| `c10_mirror` | KEEP — Equal distances and virtual extensions are accurate. Differentiate actual ray from construction lines, and show the face point/eye as parts of one person. |
| `c10_refraction` | KEEP — Computed 32° water /45° air geometry is consistent with n≈1.334. Improve the cup/coin and explicitly identify the dashed extension as the eye's back-trace, not another ray. |
| `c10_eye` | REDESIGN — Anatomical context is too schematic for the claim “most bending at cornea”. Use a clear cross-section with cornea, aperture, lens, retina and a consistent simplified optical construction; identify the drawing as schematic. |
| `c10_romer` | KEEP — The extra path length gives the right 16.6 min. Distinguish two observations at different orbital dates from one eclipse observed simultaneously in two places; show Io's entry direction. |

### Chapter 11: colour and light

| Figure | Assessment and concrete opportunity |
|---|---|
| `c11_prism` | FIX — Recalculate ray deflections toward the prism base. Actual spectrum colours and a red-only second stage are essential here: all rays currently look identical except words. |
| `c11_banana` | REDESIGN — All three bananas currently look identical. Render yellow/red/near-black appearances as the lesson itself; label incoming/outgoing wavelength bands and give the absent return ray a clear crossed-out cue. |
| `c11_sky` | REDESIGN — The claimed short/long atmospheric paths are abstract rectangles of equal height. Use a curved atmosphere cross-section or a path-length inset, and colour-code blue scattering versus warm transmitted sunlight. |
| `c11_brewster` | KEEP — Angular geometry is sound. Add a separate filter-axis inset so page dots/vertical stripes do not become unexplained polarization notation. Reduce colliding angle and glare labels. |
| `c11_young` | REDESIGN — The screen's stripes are a block diagram, wavefronts stop early, and green lines radiate from the midpoint rather than real sources. Add two explicit path pairs with path difference λ versus λ/2 and a computed/intensity screen strip. |
| `c11_raman` | REDESIGN — Keep the source/liquid/spectrum chain. Add incident wavelength marker and label Stokes/unshifted/anti-Stokes by energy exchange; symmetric schematic side peaks need a “not relative intensities” qualification. |

### Chapter 12: electricity

| Figure | Assessment and concrete opportunity |
|---|---|
| `c12_rubbing` | KEEP — Conserved charge counts are useful. Connect the transfer arrow to the hair and comb in the same time-state and name the signs as charge carriers rather than suggesting bare proton dots move independently in solids. |
| `c12_loop` | FIX / REDESIGN — Arrow labelled “inside the battery” is outside the battery rectangle. Put the arrow inside/on its circuit path. Add explicit conventional-current direction and an electron-motion cue separately if needed. |
| `c12_potential_hill` | REDESIGN — The height analogy needs the actual loop component positions linked below. Label vertical axis “potential (V), energy per charge”; state this is not physical altitude or charge being used up. |
| `c12_iv_graph` | KEEP — Linear resistor vs nonlinear LED is useful. Datasheet maximum current is not an exact survival threshold; label “rated maximum (this LED)” rather than “the most ... survives”. Stagger endpoint labels to keep them in bounds. |
| `c12_series_parallel` | KEEP — Branch currents and voltages are informative. Add junction dots and a small removed-LED state for each arrangement. Make positive-to-negative conventional current explicit. |
| `c12_earth_wire` | REDESIGN — The tiny drawing of a case does not show the complete return circuit/RCD. Add labelled RCD current comparison and clear case-earth bonding; scope “20× with wet hands” to the assumed resistances, not a universal factor. |

### Chapter 13: magnetism

| Figure | Assessment and concrete opportunity |
|---|---|
| `c13_domains` | REDESIGN — Regular square cells with one arrow each can be read as little compass objects. Use irregular domain boundaries, a consistent magnetic-moment arrow key and partial alignment before saturation. |
| `c13_earth_field` | KEEP — Global loops plus local H/Z decomposition is a strong structure. Increase 11 px labels, show geographic/magnetic-axis mismatch schematically and identify WMM2025 local numbers as dated/model values. |
| `c13_wire_field` | FIX / REDESIGN — Right-hand compass panel lacks a current-direction arrow on its north–south wire, so eastward deflection cannot be inferred. Add the direction and a top-down cross/dot inset; keep the 1/r field numbers. |
| `c13_motor_force` | FIX — Up current × right field points into the page, not out. The loop forces must be perpendicular to current/field, never vertical parallel to drawn current. Show coherent 3D or unambiguous into/out symbols; include a split-ring commutator rather than crediting brushes alone. |
| `c13_induction` | KEEP — Moving/still/reversing is the right comparison. Add identical time-window badges, flux lines and a short meter trace so “changing field” is observed rather than just named. |
| `c13_em_wave` | FIX / REDESIGN — Code alternative text says long wavelengths at the bottom and short at top, but plotted Y mapping puts long at top. Align direction/readout. Add 3D orthogonal axes and field-unit/amplitude scale caveat; avoid saying E and B are independent alternating causes in the picture. |

### Chapter 14: Earth, Moon, Sun

| Figure | Assessment and concrete opportunity |
|---|---|
| `c14_boat` | KEEP — The local motion analogy helps. Upgrade boat/bank art; show a fixed observer frame and a small top-down Earth rotation cue rather than relying on an ambiguous curved arrow. |
| `c14_tilt_orbit` | KEEP — Fixed parallel axes across all seasons confront the right misconception. Mark orbital plane/perspective and draw a genuinely near-circular inset orbit to prevent reading the projected ellipse as huge distance change. |
| `c14_sun_height` | KEEP — Equal-width beams and lit patches are meaningful. June Sun is north of zenith in Mumbai: label north/south/horizon and show angular wedges. Separate panel headings, which crowd each other. |
| `c14_phases` | FIX / REDESIGN — Small bottom labels at the right are crowded/clipped. Link each Earth-view phase to the same numbered orbit position; the phase's bright side must be visually lighter, not the current dark green fill. |
| `c14_eclipse_tilt` | FIX — Replace “twice a year: an eclipse” with eclipse-season/node alignment language. Add the line of nodes in a small overhead inset; describe the Moon's orbit as approximately fixed over one year, not absolutely fixed. |
| `c14_tides` | KEEP — Differential pull rather than a fictitious far-side repulsion is sound. Separate absolute Moon pulls from Earth-relative tidal arrows, keep the exaggerated scales visible, and label the two-bulge ocean as an ideal equilibrium model. |

### Chapter 15: atoms and stars

| Figure | Assessment and concrete opportunity |
|---|---|
| `c15_photoelectric` | FIX — Violet value 2.95/3.26 eV disagrees. Use distinct red/violet beams and photon symbols; compare count (brightness) separately from photon energy. Move overflowing ladder text into shorter labels. |
| `c15_exposure` | KEEP — The source-off versus dust-stays contrast is useful. Show an explicit second time state, and say “no radioactive material remains” rather than “nothing is left” to avoid implying exposure cannot cause lasting effects. |
| `c15_fusion` | FIX — Reconcile atomic versus nuclear mass budget and omitted products. Add a magnified mass-difference inset; the true 0.71% difference is too small to see on the large bars. |
| `c15_spectra` | REDESIGN — The spectrum is the subject: add real visible-spectrum colour with dark absorption lines, explanatory text outside the bands and shared wavelength labels. Keep “positions schematic” or calculate Balmer wavelengths. |
| `c15_parallax` | KEEP — Baseline and half-shift definition work. Colour/line-code January/July, add observed-sky inset and keep the large angular exaggeration stated. |
| `c15_white_dwarf` | FIX — At 1.0 solar mass the label suggests the Sun's final white dwarf retains its present mass. Say “a white dwarf with the Sun's present mass” or mark a grounded remnant value. Do not illustrate the formal zero-radius limit as a physically existing zero-sized star. |
| `c15_ruler` | KEEP — Shared scale and two observer ants demonstrate the relation well. Improve ant drawings, add outward direction cues to the listed speed magnitudes and say ants stay at fixed material marks while physical distances increase. |

## Computation and evidence

- Gravity-driven projectile: `y(t)=y₀+vᵧ₀t−gt²/2`, `x(t)=x₀+vₓt`. Eliminating t yields a parabola whenever vₓ≠0.
- Water jet: Bernoulli/Torricelli gives exit speed `√(2gd)`; flight time from a hole height `H−d` is `√(2(H−d)/g)`, so range is `2√(d(H−d))`. H=2 m gives d=0.5,1.0,1.5 m ranges 1.732,2.000,1.732 m, although speeds grow 3.130,4.427,5.422 m/s.
- Sliding bead from a 1 m drop: `√(2×9.8×1)=4.427 m/s`; from a 0.5 m drop: 3.130 m/s. For a uniform solid sphere rolling without slip, `I=2mr²/5` and `mgh=½mv²+½I(v/r)²` give `v=√(10gh/7)`, only 3.742 m/s from 1 m.
- Longitudinal displacement `ξ=A sin(kx)` has local extension `∂ξ/∂x=Ak cos(kx)`. Pressure change is proportional to negative extension. Its maxima are at `kx=π,3π,...`, exactly where the drawn particles crowd.
- Magnetic direction in right-handed coordinates with x right, y up, z toward reader: `(0,1,0)×(1,0,0)=(0,0,−1)`.
- Mass comparison using standard masses in atomic mass units: `(4×1.0072764666−4.0015061791)/(4×1.0072764666)≈0.006855`; atomic comparison `(4×1.0078250322−4.0026032541)/(4×1.0078250322)≈0.007119`.
- The source grounding/provenance files supply the book's equations and cited primary teaching sources: `source/grounding/ch01.md`, `ch06.md`, `ch07.md`, `ch09.md`, `ch13.md`, `ch14.md`, `ch15.md`. This audit recomputes the diagram logic; it does not revalidate every historical fact or re-date the WMM local field estimate.

## Implementation receipt for assigned corrections

The coordinator assigned `c6_tank`, `c7_track`/§7.3/live wording and the Chapter 9 phase/pendulum/harmonics corrections to this reviewer after this audit. Exact verification results will be appended after those changes are rendered. Other rows above remain audit findings/opportunities unless the coordinator's final report records their completion.

### Completed by this reviewer

- Rebuilt `c6_tank` with gravity-driven trajectories and proportional exit-speed arrows. The 1.5 m tank is raised 0.5 m so the three side holes have a visible common-floor comparison; the caption names the steady-level/no-air-resistance assumptions.
- Corrected `c7_track`, §7.3 and live-reader wording to the ideal sliding-bead/no-spin model, keeping the existing numerical energy ledger and other local work. Added the rolling-marble distinction explicitly.
- Corrected pressure-wave phase in `c9_compressions` and added guides; repaired pendulum clipping and component wording; separated close drum frequency labels with leaders and used relative-frequency wording.
- Corrected the Chapter 3 downward-load wording and drew the claimed table sag; made rocket force arrows equal; moved the Moon's gravity arrow onto its radial line; put the battery-current arrow inside the battery; specified southward current in the compass example; aligned the EM ladder alternative description with its rendered order.
- Added `source/tests/test_graphics_physics.py`: exported jet geometry satisfies independent Bernoulli/projectile equations at every sampled point, the middle jet has greatest common-floor range, and exported pressure maxima/minima match compression/rarefaction positions.

Validation: `.venv/bin/python source/tests/test_graphics_physics.py` passed; `.venv/bin/python source/tests/test_figs_core.py` passed; `node --check source/live/w_energytrack.js` passed; changed Python modules compiled. The `physics-fixes` atlas rendered all 158 chapter and story figures across 22 modules with **zero out-of-bounds text labels**, and four remaining possible-collision figures outside this reviewer's changed sections. Inspected resulting Chapter 6, 7, 9 and 13 contact sheets. The coordinator owns full-book/phone/theme/runtime checks and the remaining corrections; this receipt does not certify that those checks have run.

### Final independent gate on the coordinator's settled chapter changes

Read and checked the redesigned ruler/size ladder/cover, reference-frame bounce, relative trains, sliding book, F=ma carts, prism and banana, motor, fusion, photoelectric and white-dwarf diagrams, plus `m_beauty.js` and `orbit_model.mjs`. Inspected the final Chapter 0, 1, 11 and 15 contact sheets and the preceding Chapter 2, 3 and 13 sheets. The final atlas metrics available at this gate reported **zero out-of-bounds labels and zero potential text collisions** for all 158 SVGs.

The review found and fixed remaining linked-source discrepancies before handoff: motor caption still said out/dot; the violet example/caption retained 2.95 eV; fusion text retained nuclear-mass wording for the atomic 0.71% budget; a prism caption incorrectly reused a water-interface dispersion angle. Also fixed one violet ray that missed its plate, added red/violet beam colours, and moved train names off the preceding rails. The complete atomic mass account includes the consumed electrons and emitted neutrinos, and the updated prose distinguishes neutrino energy escape from sunlight.

`node source/tests/test_orbit_model.mjs` passed its independent equal-swept-area check. Re-ran `test_graphics_physics.py` successfully. The requested redesigned mechanisms have **no remaining scientific blockers identified by this review**. The small final caption/ray/name-position edits require the coordinator's final rebuild. This is a gate on the changed diagrams and their connected explanations, not a new independent fact check of every unchanged chapter claim or a declaration that every longer-term art opportunity in the table has been implemented.
