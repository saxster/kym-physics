# Independent mechanics review — 29 October 2026

Reviewer: waves audit agent, not an author of the mechanics changes. This receipt covers source, grounding and numerical/renderer contracts. It does not substitute for the mechanics agent’s per-lesson visual review.

Reviewed the current changes in mechanics renderers, motion geometry, lesson copy and `source/grounding/visual_mechanics.md`:

- Cube lattice keeps one-unit spacing, partial far-edge units and at most48segments at the offered length multiplier3.
- Hull and displaced-water reference share0.06scene³/L. Egg equilibrium uses volume fractions, so the displaced-liquid average density equals the egg density; cargo and egg density have independent state and units.
- Immersed equal-area arrows are proportional to gauge pressure; at2m top depth their top/bottom ratio is2/2.5=.8. Ambient contributions cancel. Zero-force vectors and unrelated mode controls are hidden or disabled.
- Resultant force and acceleration retain separate units/scales. Changing mass leaves the forces unchanged while acceleration varies as1/m.
- Horizontal local work is zero while complete rising-route work remainsmgh. Sliding/rolling copy distinguishes rotation and static contact friction from dissipative loss.
- Landing puts the sphere surface on the floor; complete replay envelopes preserve camera scale during time/frame changes. Tangent release preserves instantaneous velocity and removes the inward interaction.
- Clock/preset controls now reflect the actual model state. Supported cabins and zero-temperature-gradient engines hide playback that would otherwise have no useful motion.
- New Kepler copy introduces equal swept areas before mean-anomaly terminology; named examples clear when manually customised. Fixed appliance bars compare actual energies on a common scale.

One actionable copy finding was sent to the coordinator: the fall view now dashes the second body’s speed curve, while an unchanged legend said “Dashed = terminal speed.” Both uses must be distinguished by the legend or line style. No other physics/fidelity blocker was found in the reviewed patch.

Independently executed and passed:

- `node source/tests/test_mechanics_labs.mjs`
- `node source/tests/test_mechanics_motion_geometry.mjs`
- `node source/tests/test_mechanics_controls.mjs`

These exercise actual renderer geometry and public controls as well as independently calculated constraints. Final screenshot acceptance, including readable labels and unobstructed mechanisms, remains a separate gate.
