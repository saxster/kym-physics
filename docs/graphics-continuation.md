# Remaining graphics: implementation and release plan

29 October 2026. Baseline: `07f790d` (the first 57-figure graphics pass).

The scope is the remaining pedagogical opportunities in the two graphics reviews, with priority to all 36 live widgets and every explorer scene. Preserve sound physical models and useful abstractions. A completed item must show a mechanism, comparison, evidence or scale relationship more clearly; cosmetic detail alone is insufficient.

## Acceptance

1. Every published live widget has a documented response to its audit row and real rendered validation. Basic apparatus becomes recognisable; linked graphs and quantities agree; controls remain native and readable.
2. Each full-page explorer improves its basic scenes and separates competing explanations, while preserving the physical window, exact orbital foci, quantities, model limitations and keyboard/offline behavior.
3. Full-size live drawings can be read on phones without shrinking their labels or breaking controls, pointer coordinates, pause, audio/sensors or reduced motion.
4. Remaining priority stills gain physically informative cut-aways, magnification, correspondences or quantitative representations. The existing 158-figure atlas must remain free of detected clipping and text collisions.
5. The build remains below 4 MiB for the main document and 150 KiB per widget/explorer (documented shared three.js exception). Lossless CSS compaction provides space for additional original SVG art.
6. Independent model checks, actual desktop/mobile/theme interactions, browser console checks and offline reload pass before publication. The deployed revision and public bytes must match the pushed commit.

## Ownership and sequence

- Mechanics/energy live widgets: `graphics-live-mechanics-pass.md` records the 16-widget result.
- Waves/optics/fields live widgets: `graphics-live-waves-pass.md` records the 20-widget result.
- Scale, sky, spectrum and map: `graphics-explorer-pass.md` records scene-level changes.
- Coordinator: shared live readability, build budget, remaining static mechanisms, integration, independent review, full runtime verification and release.

The textbook playbook explicitly calls for parallel visual work and independent fidelity gates. Separate file ownership prevents conflicting edits. Browser plugin is not available in this session; use the repository's existing Python Playwright workflow. The validation flow is: chapter/explorer entry → open and adjust the diagram → observe matching scene, quantitative readout and graph → inspect at native size → close/reopen → reload offline.

## Release

Use the existing root-of-main GitHub Pages deployment. Reconcile the public baseline with Git HEAD, stage only task-owned sources/tests/audit/generated assets, commit, push main, await the Pages build, compare public hashes, then exercise the public book. Rollback is a normal revert of the release commit followed by the same Pages verification. No credentials, private data or external messages are involved.

## Final receipt

Implemented all 36 live widgets, all three full-page explorers, map/lifelines and 16 further still diagrams. Per-item receipts:

- [Mechanics/energy: 16 widgets](graphics-live-mechanics-pass.md)
- [Waves/light/fields: 20 widgets](graphics-live-waves-pass.md)
- [Explorer scenes and map](graphics-explorer-pass.md)
- [Static mechanisms and shared native-width reading](graphics-static-continuation.md)

Independent review corrected the eye’s central-ray construction, Kibble voltmeter connection, Young crest spacing, nested-canvas sizing, physical video calibration, momentum zero reference, exact strobe timing and bound-orbit display horizons. All 36 shared enrichment blocks were checked: 32 active blocks were corrected; three were retained after review, and energy stores retains its widget-owned annotations.

Validation completed:

- All 158 SVGs: zero detected out-of-bounds text or text-to-text collisions; changed sheets visually inspected. All shared still-detail/print/story-pattern/focus tests passed at five widths in three themes.
- Every live widget/explorer opened and exercised at 390 and 1280 px with no application console errors and no chunks before interaction. Offline reload and live opening passed. Software-GL performance messages were separated from page errors.
- Live widget matrices cover 216 size/theme configurations (16+20 widgets × two widths × three themes); final focused checks cover the review fixes and sensor/video limitations. Initial cover RAF errors were fixed and the early-timestamp regression passed.
- New live-native-size checks passed at 390/820/1440 × light/sepia/dark, including 2D, 3D, WebGL and nested coin canvases, paused state, keyboard controls, fit/scroll and focus restoration. Forced no-WebGL phase/field/eye fallbacks passed. No audio or hardware sensor resources were started by opening the tested widgets.
- Explorer matrix passed at 390/820/1440 in three themes; all eight phase positions, spectrum views/thresholds, halo/noon/night views, map bounding boxes and all four offline mounts passed. Existing scale checks also passed six widths, 13 landmark dimensions, guides, failures, reflow, interruption and contrast (minimum 5.0:1).
- Figure primitives, water-jet/sound/eye/Young geometry, story geometry, Doppler, energy accounts, orbital/mission geometry, scale model/catalogue, phase masks, mechanics conservation/trajectory/strobe checks and numerical annotation/challenge boundaries passed.

Final release gates and exact build receipt are recorded below.

### Final build and release gate

- Final built and root `index.html`: **4,066,345 bytes (3.878 MiB)**; SHA-256 `87249f50b69f12723ea535449e6675399cffb87c275482fdfbe6e2b54181c586`.
- Service-worker version: **`mw-ab72a1cf8616`**, with 57 precache entries. Largest ordinary chunk is the map at 119.7 KiB; shared three.js retains its documented exception.
- Final 390 px sweep re-opened/exercised every widget and all three main explorers after annotation reconciliation, then reloaded offline and opened a live widget: passed, zero application console errors and zero eager chunks.
- Final native-size/theme/motif, annotation-to-widget agreement, opt-in resource, forced-WebGL-fallback and phase-pixel-area gates passed. All independent numerical/source checks passed. No verification job remains running at commit time.
- The public baseline was fetched and matched `07f790d`’s committed HTML byte-for-byte before source publication; no direct live edits required porting.
- Generated root files match the reviewed build. Superseded hashed chunks were removed only from the old precache manifest. Publication uses this commit’s root-of-main Pages build; the deployment commit, public file hashes, new cache and real online/offline interaction are checked after pushing. The machine-readable public receipt is written to ignored `source/build/graphics-pass2/public/verification.json`.

Known limits: hardware sensor accuracy and real-camera uncertainty were not certified; browser sensor/audio starts remain opt-in. The astronomical/thermal/tide illustrations retain their visible model qualifications. The original audit preserves optional further still-art opportunities; this receipt claims the changes enumerated above.
