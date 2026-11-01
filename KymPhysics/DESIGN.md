# KymPhysics — Apple Journal Design System (`DESIGN.md`)

## Reference App
**Apple Journal for iPad (iPadOS 26/27)**. Every screen in `KymPhysics` is built from the eleven Journal primitives (`JournalPage`, `JournalReaderPage`, `JournalFocusPage`, `JournalCard`, `JournalMiniCard`, `JournalSection`, `JournalRow`, `JournalChip`, `JournalBadge`, `JournalPaperSheet`, `JournalForm`) using semantic tokens (`Color.kymaia*`, `Font.kymaia*`, `Spacing.*`, `CornerRadius.*`).

## Curated Color Schemes (`CuratedColorScheme`)
1. **`.journal` (Default):** Soft lavender canvas (`#F3F1F7` / `#0E0E12`), white elevated cards (`20pt` continuous corner radius), indigo accent (`#5856D6`).
2. **`.movingWorld`:** Warm rag paper (`#FBF7EF` / `#161410`), Galileo alizarin primary (`#A3291E` / `#F27D70`), celestial ultramarine secondary (`#1E4D8B` / `#82B4F5`), serif headings (`16pt` hairline cards).
3. **`.monsoon` (Marine Drive):** Coastal slate (`#F1F5F7`), Arabian Sea teal (`#125E7A`), warm lantern gold (`#7A4A10`).
4. **`.botanical` (Living World):** Warm cream (`#F7F3E8`), conservation emerald (`#2E604A`), terracotta (`#8A3B28`).
5. **`.sketchbook`, `.hearth`, `.scholar`, `.dusk`:** Additional WCAG AAA/AA verified study palettes.

## Strict Visual & Accessibility Rules
- **WCAG Contrast:** Primary ink $\ge 7.0:1$ (AAA) against page and card surfaces in both light and dark modes; muted/tertiary ink and primary/secondary accents $\ge 4.5:1$ (AA); resting control borders $\ge 3.0:1$.
- **Typography:** `.serif` is reserved for long-form textbook prose (`JournalReaderPage`), equations, and notebook paper (`JournalPaperSheet`). Chrome, navigation, badges, and buttons use `.default` or `.rounded` with `.monospacedDigit()` on all numerical readouts and timers.
- **Touch & Pencil Ergonomics:** Minimum $44 \times 44\text{ pt}$ hit targets (`AccessibilityLayout.minTouchTarget`); `.writingToolsBehavior(.none)` on independent proof inputs so Apple Intelligence cannot rewrite Kym's own scientific explanations.
