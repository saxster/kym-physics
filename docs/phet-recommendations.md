# PhET Interactive Simulations — Recommendations & Architecture for *The Moving World* & `KymPhysics`

Research & design date: 20 November 2026. Scope: full implementation across `source/` (*The Moving World* offline web book) and `KymPhysics/` (native iPadOS/macOS companion).

---

## 1. What We Inspected on PhET (`phet.colorado.edu` & `phet-io.colorado.edu`)

We audited:
- **Homepage, Directory & Browse/Filter UX**: Subject carousels vs. faceted curriculum & inclusive-feature filter sidebar, removable chips, capability glyphs.
- **Simulation Detail Pages** (*Forces and Motion: Basics* `v2.6.7`, *Energy Skate Park* `v1.6.2`): 6-tab layout (*About*, *Teaching Resources*, *Activities*, *Presets*, *Translations*, *Credits*), Sample Learning Goals, alignment tags, and curated *Example Presets*.
- **Live HTML5 Simulations**:
  - *Forces and Motion: Basics*: 4 progressive screens (`Net Force` → `Motion` → `Friction` → `Acceleration`), coarse/fine steppers (`<< < > >>`), sloshing water bucket inertial indicator, mystery `?` mass, colour-blind palette switch in Preferences, Keyboard Shortcuts overlay, Parallel DOM (PDOM).
  - *Energy Skate Park*: 4 progressive screens (`Intro` → `Measure` → `Graphs` → `Playground`), draggable skater & `h = 0` reference datum line, floating pie chart, time-spaced strobe path dots + snap-to-dot Energy Sensor probe, Clear Thermal button, Earth/Moon/Jupiter gravity switcher, Normal/Slow toggle, frame-by-frame Step Forward.
- **Pedagogy, Research, Inclusive Design & PhET-iO**: Implicit scaffolding (*"guiding without feeling guided"*), Gold Star rubric rejecting knob-recipe instructions, 3–5 min unstructured *Open Play* before questions, modal parity (PDOM + Sonification + Interactive Highlights), and PhET-iO (`getState`/`setState`, `captureScreenshot`, causal `user`/`model`/`wrapper` JSON event stream).

---

## 2. What We Explicitly Skipped (Preserving *The Moving World* Identity)

1. **No SceneryStack / PhET JS scene-graph rewrite** — `source/build/site/index.html` enforces a strict **4 MiB** offline budget (`4,194,304` bytes). We borrow PhET's *contracts* (`LiveIO`, PDOM mirror, unified transport), not its scene-graph framework.
2. **No PhET visual chrome** — keep our warm paper (`light`/`sepia`/`dark`), Literata serif reading voice, Lexend controls, and *The Standard* (`KymPhysics/DESIGN.md`) rather than black toolbars and yellow boxes.
3. **No narrative removal** — keep our Mumbai-anchored historical stories, phone sensor labs, and local-only notebook.
4. **No accounts, cloud presets, or translation portals** — presets serialize locally via `LiveIO` JSON / URL hash parameters and `KymPhysics` GRDB/SwiftData.

---

## 3. Architecture & Acceptance Register

| # | Pillar | Implementation Surface | Core Invariant |
|---|---|---|---|
| 1 | **Lazy Sim Studio & 4 MiB Budget Headroom** | `source/live/core.js`, `source/live/sim_studio.js`, `source/build.py` | Move `attachEnhancements` out of `core.js` into lazy `sim_studio.js` chunk so `index.html < 4 MiB` and every chunk `< 150 KB`. |
| 2 | **`LiveIO` State, Snapshot & Causal Event Bridge** | `source/live/sim_studio.js` ↔ `MovingWorldBridgeController.swift` ↔ `LabsExplorersHomeView.swift` | `getState`, `setState`, `openPreset`, `capturePNG`, `getEventLog` + URL hash `?preset=` hydration. Pedagogical honesty: automated Watch tour (`actor === 'tour'`) NEVER awards independent `WidgetChallengeStampRecord`. |
| 3 | **Unified Transport, Touch Steppers, Preferences & Shortcuts** | `source/live/core.js`, `source/live/sim_studio.js` | Centralized `1× / ¼× Slow`, `+1 Step`, `Replay` vs `Reset all`, `−`/`+` touch steppers on every slider, `Open Play` focus mode toggle, Preferences (`m/s ↔ km/h`, Okabe-Ito colour-blind palette, focus highlights, detent/sonify audio), and `?` Keyboard Shortcuts modal. |
| 4 | **`@saxster/atlas` Drafting Grammar & Draggable Probes** | `source/live/draft_canvas.js`, `source/live/probes.js`, `docs/phet-studio-tokens.json` | Encode `draft_standard.json` roles, dual-coded vector arrows, architectural dimensions, sloshing inertial beaker, floating pie, lifelike/schematic circuit symbols, strobe path probe + draggable `h = 0` datum with visually-hidden PDOM range mirrors. Verified via `figma-bridge.mjs audit` for WCAG 2.1 AA contrast across all 4 modes. |
| 5 | **Gold-Star Non-Spoiler Inquiry Audit + Presets + Mentor Tips** | `source/live/enhancements.js` | Strip knob-recipe spoilers (`index 2`, `(7.9 km/s)`, `(1.1 m)`, `(Day 7.4)`) across all 39 widgets while keeping `enhancements.js` 100% import-free and test-compatible; add inquiry `presets` & Mumbai `mentorTips`. |
| 6 | **4 Flagship Physics Figures Upgraded** | `w_forces.js`, `w_energytrack.js`, `w_circuit.js`, `w_seriesparallel.js` | Sloshing water beaker + Mystery `? kg` + rope drag (`w_forces`); draggable bead + `h = 0` line + `Pie on bead` + Earth/Moon/Jupiter + `Drain warmth` + strobe probe (`w_energytrack`); Lifelike ↔ Schematic toggle + tap-to-unclip LED + branch probe + current hum (`w_circuit`, `w_seriesparallel`). |
| 7 | **Native `KymPhysics` Real Lab Bench & Dynamic Mentor Lens** | `export_kymphysics_pack.py`, `SeedPackModels.swift`, `AppStore.swift`, `LabsExplorersHomeView.swift`, `ParentMentorDashboardView.swift` | Remove dummy `InteractivePhysicsCanvasView`; wire real `LiveIO` presets, honest live challenge stamp, real canvas PNG capture to Lab Notebook, filterable capability cards, and dynamic per-sim Mentor Tips. |
