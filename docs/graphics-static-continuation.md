# Still graphics continuation

29 October 2026 · baseline `07f790d`.

Sixteen additional original SVGs now make the physical mechanism visible:

| Figure | Response to the audit |
|---|---|
| `c2_friction_closeup` | Contact marker connects the real block to enlarged deforming/adhesive junctions, rather than roughness alone. |
| `c5_cavendish` | Before/after torsion rod, opposing masses, suspension side view and external telescope/scale readout. |
| `c6_card` | Isolated card with opposing pressure forces and its own weight; no double-counted water weight. Mouth/straw pressure-column comparison. |
| `c8_joule` | Linked falling weight, pulley, axle, paddle, immersed thermometer and magnified small rise. |
| `c8_sweater` | Fibres/air cut-away, same starting cubes, same elapsed interval, and inward transfer arrows for cold objects. |
| `c10_seeing` | Recognisable source, mango and receiving eye; numbered light path and crossed false outgoing eye ray. |
| `c10_pinhole` | Recognisable window with tracked top/bottom points and exactly collinear rays. Separate height inset preserves the computed 10:1 ratio. |
| `c10_eye` | Cornea, iris opening, lens, retina and optic nerve; two serial optical surfaces focus two inverted tagged points without hitting the iris. |
| `c11_young` | Paths begin at both sources. The same distance differences generate screen intensity, curve, and marked bright/dark points. |
| `c11_raman` | Recognisable liquid apparatus and energy-exchange directions connected to shorter/longer wavelengths; peak heights explicitly schematic. |
| `c13_domains` | Shared irregular boundaries and changed region areas replace a compass-cell grid. Arrows represent magnetisation. |
| `s_kilogram_rule` | Separate weighing/moving modes, recognisable coil/magnet/meter, and elimination of the shared BL factor. |
| `s_faraday_cube` | Hollow cut-away and straight inside leaves versus separated charged outside leaves. Real shell explicitly closed. |
| `s_sun_budget` | Solar core, true 596:4 mass-account widths, and connected enlarged energy fraction. |
| `s_wetbulb` | Paired dots on one Celsius axis replace truncated temperature bars. |
| `s_engine_fall` | Mechanism and 100:17:83 energy-flow widths linked on one drawing. |

Captions and accessible descriptions were updated where the changed composition or mechanism required it. Existing grounding and provenance remain in force; added eye/Young geometry and NIST Kibble-balance sources are recorded in the grounding/ledger. No third-party image assets were introduced.

The public `Full-size drawing` control now makes all live canvases, including nested coin experiments and 3D wrappers, readable at their logical width. It retains the simulation clock and physical inputs, keeps control access, confines scrolling to the drawing, and restores fitted reading on request.

Main-document CSS is compacted by the existing esbuild parser with whitespace minification only. The map is deferred to an offline-cached chunk to keep the richer static art below the document budget. A negative first RAF time delta found during the rendering matrix is clamped to zero in volume art, preventing invalid trajectory indices without advancing the physical animation.

Validation is recorded in `graphics-continuation.md`. Atlas: `source/build/graphics-pass2/current/index.html`, baseline: `source/build/graphics-pass2/before/index.html`. Remaining suggestions in the original per-figure tables are retained as editorial opportunities, not implied completed work. In particular, the original sound quantitative plots and minimal circuit abstractions were not all redrawn for decoration.
