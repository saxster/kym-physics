# Explorer graphics continuation — 29 October 2026

This pass implements the explorer opportunities in `graphics-story-live-review.md` using deterministic explanatory drawing. It preserves the book’s physical scale window, reference dimensions, focused mission ellipses, keyboard controls, guided journeys and opt-in animation.

## Changes

| Scene | Implemented | Retained / limits |
|---|---|---|
| Proton | Quark symbols and a soft internal region replace the plain disc. | Outer reference span remains the proton’s approximate width. Symbols are explicitly not hard balls or tracks. |
| Hydrogen atom | A deterministic point cloud and density shading replace orbit-like decoration. | Nucleus remains an explicitly enlarged marker; cloud drawing is schematic. |
| Light wavelength | One complete field cycle with an external wavelength bracket. | Curve is an electric-field pattern, not a photon trajectory. |
| Sand | Facets and fine material texture distinguish solid grain from empty background. | Texture is illustrative; one-millimetre reference remains independent of framing. |
| Human scale | A tabletop, person and familiar objects provide physical context. | Tabletop sets the one-metre reference; person is not a measured portrait. |
| Earth | Existing geographic renderer retained. | Exact 12,742 km reference diameter and horizontal window conversion retained. |
| Sun | Surface structure and a quarter cut-away distinguish the visible surface from interior layers. | Internal bands are schematic; outer diameter alone determines scale. |
| Earth–Sun | Two endpoint markers and a labelled separation replace an ambiguous orbit emblem. | One AU is a distance; body markers are explicitly enlarged. Caption corrected from orbit “width” to mean radius. |
| Light-year | Endpoint marks and light’s travel duration make the distance interpretation explicit. | Not presented as a star’s diameter. |
| Galaxy | Star-rich disc, central glow and structured arms replace a lone spiral stroke. | Star marks are enlarged; geometry is not a measured Milky Way map. |
| Room / neighbourhood / coast | Existing detailed illustrations retained. | Their stated reference widths, illustrative provenance, failure recovery and physical window mapping retained. |
| Scale comparisons | A persistent one-metre comparison states how many metre lengths fit the window, or how many windows fit one metre. Added a native-text mechanism note for each selected landmark. | No arbitrary internal texture is assigned measured dimensions. |
| Sky: seasons / noon | Larger space overview and Mumbai meridian section connect the same ochre sunlight. Parallel Earth axes, enlarged gnomon, red shadow and countable beam footprint explain angle versus illuminated ground. | Rooftop diagram is explicitly a **noon** reference; a separate clock annotation reports selected-hour solar altitude. Orbit perspective and body sizes are explicitly schematic. |
| Sky: night | Selecting nighttime switches the local panel to a large northern-sky view, with a pole marker, horizon and one-hour trail arcs. | Pole altitude is labelled 19.08°; star positions and trail radii are schematic. No autoplay. |
| Sky: Moon / tides | Eight numbered orbit positions link to eight large phase buttons with actual phase silhouettes. Buttons select the corresponding lunar day and work by keyboard. Added explicit shadow/night distinction and orientation caveat; increased dense diagram label sizes. | Ideal tide response retained as a teaching model, not a forecast. The compact tide graph remains subordinate to native explanatory text. |
| Sky: Chandrayaan-3 | Existing physically derived pericentre/apocentre ellipses, focus placement, body/orbit common scale, scale bars and Kepler periods retained. | The audit’s older generic-ellipse finding had already been addressed before this pass; no orbit model was replaced. |
| Sky: Aditya-L1 | Oblique halo view, dotted plane projection and selected-time craft position distinguish depth from a flat loop. | L1 remains a point, not a massive object. Shape and apparent depth are schematic; this is not a reconstructed ephemeris. Unequal solar/Earth pulls and one-year rotating-frame requirement retained. |
| Spectrum | Three selectable full-size explanations replace competing tiny panels: colour/spectral lines; electric and magnetic fields; single-photon calcium photoemission. A persistent logarithmic spectrum remains above each. | Native readouts, slider, detector/source explanations and five-question guide retained. |
| Visible magnification | True-width visible sliver is connected to an enlarged strip. Lower wavelength axis is explicitly linear; upper frequency ruler is explicitly logarithmic. | Removed the unlabelled minimum-width widening. Calcium threshold and dark spectral lines remain independently labelled. |
| Wave encoding | Always shows **two wavelengths**, with the changing physical span printed beside the drawing. E/B directions, schematic amplitudes and slowed illustrative motion are qualified beside the view. | Replaces the former arbitrary 1.2–14 compressed cycle encoding. Play is available only in the wave view. |
| Photon outcome | Enlarged calcium target, incoming photon and bound/ejected outcome, with threshold and maximum kinetic energy. | Single-photon model explicitly stated. Removed the broad implication that non-ionising means safe; actual ionisation thresholds depend on material. |
| Adventure map | Map/data implementation moved to lazy `x_map.js`; its small shell automatically loads the familiar map on page visibility, with retry on failure. | Preserves map flow, scene cards, zoom presets, time controls and lifelines; precached for offline use. |
| Map labels / lifelines | Map labels target 13 CSS px at every zoom; placement uses actual SVG font bounds, with padding and clipping/collision checks. Larger lifeline text, taller bars and focus outlines improve reading and activation. | Dense locations still use deliberate label culling; every place remains a keyboard-accessible pin. Lifelines retain horizontal scrolling. |

The 500 nm scale caption now consistently says green light and approximately 5,000 of the existing 0.1 nm hydrogen-atom reference widths. The previous caption said 10,000.

## Verification

- `test_explorer_scenes.py`: actual Chromium UI at **390, 820 and 1440 px**, each in **light, dark and sepia**. All three spectrum explanations, both photoelectric threshold outcomes, noon/night views, all eight keyboard phase selections, halo view, scale landmarks and all four map zoom presets passed.
- Measured actual map label bounding boxes: no overlap in the tested views; text remained at least **12.5 CSS px** (13 px target). The test caught a real 820 px India collision in the former character-count estimate; actual SVG measurement fixed it.
- Native controls, hidden-page wave pause, repeated close/reopen and horizontal overflow checks passed. Hidden phase controls are absent from the other sky modes.
- Fresh offline reload and first lazy mount passed for **all four explorers**, after service-worker activation. The map chunk is not eagerly loaded on the cover.
- `test_scale_browser.py`: six widths (320, 390, 820, 1024, 1180, 1440), all themes, guide and keyboard bounds, repeated opening, offline reload and interrupted animation passed.
- `test_scale_plan.py`: all 13 landmark dimensions, fit at both mobile and desktop, formerly empty intervals, complete guide/focus, 200% reading text reflow, chunk retry, illustration failure recovery and hidden-page animation pause passed.
- `test_scale_contrast.py`: opaque normal-size text/control contrast passed, minimum **5.0:1**. Reduced-motion preferences now disable explorer control colour transitions, preventing temporary low contrast on theme change.
- `test_scale_model.mjs`, `test_mission_orbit.mjs`, `test_phase_shape.mjs`, `test_scale_catalog.mjs` passed. Phase tests independently check new/full/quarter illumination and waxing/waning symmetry; mission tests preserve physical apsides, focus, shared body scale and period benchmarks.
- Isolated build: `source/build/explorer-pass-site`. Latest integrated-source snapshot measured **3967 KiB** for index; explorer chunks: map **119.7 KiB**, scale **81.3 KiB**, sky **40.7 KiB**, spectrum **21.5 KiB**. Parent’s final build and deployment verification supersede these intermediate sizes.
- Browser evidence is written under ignored `source/build/explorer-checks/` and `source/build/scale-checks/`; generated output is not a new source dependency.

## Source checks and remaining meaningful opportunities

The proton symbols use CERN’s [quark teaching reference](https://educational-resources.web.cern.ch/sites/default/files/documents/Quark%20Puzzle%20Scaffolded%20Worksheet.pdf); they do not claim literal particle trajectories. ISRO describes Aditya-L1’s halo as a [three-dimensional orbit with a 177.86-day period](https://www.isro.gov.in/halo-orbit-insertion-adtya-l1.html), and explicitly distinguishes its [published XY projection from the full trajectory](https://www.isro.gov.in/Aditya_L1_Mission_Completion_of_First_Halo_Orbit.html). Existing chapter grounding/model constants remain the source of the retained orbital quantities.

A future astronomical precision pass could replace the explicitly schematic halo path with a documented orbit reconstruction and add a freely rotatable viewpoint. A future tide lesson could dedicate one large panel to a chosen timescale, rather than showing both month and day responses. Neither is needed to interpret the present model honestly. The map deliberately culls labels at dense views; opening a pin is the supported way to inspect every location. Scientific material is original vector/canvas drawing; no generated bitmap is used to encode measured quantities.
