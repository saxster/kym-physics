# KymPhysics design (`DESIGN.md`)

## Design system: The Standard
KymPhysics draws in **The Standard**, the design system it shares with KymBio, KymChem, KymMaths and
apple_poem. Its colours, themes, type scale, spacing, radii, motion, components and accessibility rules
live in one place: [`teaching_kit/docs/STANDARD.md`](../../teaching_kit/docs/STANDARD.md). The Swift is
`teaching_kit/Sources/KymDesign/Standard/`. Do not restate its tokens here; change them in the kit.

- **Themes.** Six Standard themes (Vivid by default, Paper, Warm, Dusk, Black, Ink) plus Follow System.
  `StandardThemeMenu` in each room's toolbar is the picker. `Design/AppTheme.swift` registers the theme at
  launch and holds the legacy map that moved a learner's choice from the old physics catalogue:
  Moving World, Living World and Sketchbook → Paper; Terracotta and Scholar → Warm; Dusk → Dusk;
  Journal and Marine Drive → Vivid.
- **Widget.** The Daily Study Glance widget registers The Standard itself, reading the choice the app
  copies into the `group.com.kymaia.physics` app group, and draws with `Color.kymaia*` tokens.
- **Tokens in screens.** `Features/` uses `Font.kymaia*` or `.standardType(role)`, `Color.kymaia*`,
  `Spacing.*` and `CornerRadius.*` / `StandardRadius.*`. The kit's `check-consumers.mjs --lint` counts
  radius literals, fixed and shorthand fonts, `.secondary` styles and named system colours there; the
  count stays at zero. Fixed sizes inside drawn physics figures live in `PhysicsFigureType`
  (`Design/SemanticStyles.swift`).
- **Screen patterns.** Room homes open with `EditorialHeader`; filters use `StandardFilterChip`; cards
  use `SurfaceCard`, `QuietPanel` or the Journal shells; empty states use `EmptyStateCard`; animation
  uses `StandardMotion` and respects Reduce Motion.

## Physics-specific rules
- **Serif for the work.** Long-form textbook prose (`JournalReaderPage`), equations and notebook paper
  (`JournalPaperSheet`) are serif. Chrome, navigation, badges and buttons are SF, with
  `.monospacedDigit()` on every numerical readout and timer, so lab values do not reflow as they tick.
- **Touch and Pencil.** Hit targets are at least 44 × 44 pt (`AccessibilityLayout.minTouchTarget`).
  Independent proof inputs set `.writingToolsBehavior(.none)`, so Apple Intelligence cannot rewrite
  Kym's own scientific explanations.
