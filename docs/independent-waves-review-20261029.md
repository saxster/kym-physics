# Independent waves review — 29 October 2026

Reviewer: coordinator, who did not author the waves/thermal/optics domain changes. Scope: current domain source, actual-renderer tests, lesson copy and grounding addendum. Visual acceptance is recorded separately in the per-lesson register.

The changed representations agree with their underlying models:

- Pendulum arrows show acceleration on one shared scale: dividing tangential force by bob mass cancels mass. Actual weight and tangential force remain labelled in newtons. The explanation distinguishes the string's role from the restoring component.
- The water inset enlarges both coordinates of the same parcel by forty, with a fixed mean-position marker. It does not substitute a second travelling particle. Small-amplitude and deep-water limitations remain explicit.
- Sound displacement and pressure are separately normalised and in spatial quadrature. The explanation identifies neighbouring-particle compression as the cause of pressure changes.
- Sea/land circulation reverses consistently with the density difference, and arrows disappear at equal temperatures. This is an illustrative loop rather than a weather prediction.
- Amount and cooling-energy bars use common scales; equally enlarged particle windows are identified as representative samples rather than literal equal amounts.
- Mirror paths begin at the actual object tip. The reduced-eye inset uses a point-spread diameter and one fixed millimetre scale instead of an arbitrarily blurred arrow.
- Interference uses the same path difference for the phasor sum, probe marker and intensity. Raman photon loss and molecular gain are equal and opposite on one common energy scale.

The cause-first explanations retain the model limitations in `source/grounding/visual_waves.md`. No new borrowed artwork, historical claim, sensor permission or home experiment was introduced by these revisions.

Checks run: `node tests/test_waves_labs.mjs` (reference values, limiting cases, shared geometry, all 34 actual renderer mounts, finite endpoints, control presets and display contracts): PASS. `tests/test_graphics_physics.py` independently checks pressure/compression, interference source paths and eye-ray geometry: PASS.

Visual findings returned to the author: opaque labels hid parts of the seeing model; a short geometry caption covered the interference phasor; the retinal-inset caption could cross the blur disc; a zero-work arrow needed to disappear. These require fresh rendered confirmation after the fixes. Passing the physics tests alone does not close these findings.
