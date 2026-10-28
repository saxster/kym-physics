# The Moving World: how the book is written and built

```
npm install                                   # once: esbuild, three, d3-geo, topojson-client, world-atlas
python3 build.py --only 2,3 --out build/x.html   # quick check: one self-contained file, widgets inlined
python3 build.py --site build/site               # the website: index.html + lazy chunks in live/ + offline sw.js
python3 build.py --allow-missing-provenance --only 4 --out build/x.html   # a partial draft without a full ledger
python3 shoot.py build/x.html /tmp/shot ch2 s2-3 fig-2-4 --w 390          # screenshot elements by id
python3 livetest.py build/site/index.html /tmp/lt                          # every live figure + explorer, console errors
python3 tests/test_figs_core.py                                            # figure helpers self-test
```

`--src DIR` and `--provenance DIR` point the build at another tree (the engine fixture is
`--src tests/fixture/src --provenance tests/fixture/provenance`). Figures are loaded from `figs_*.py` in the folder that
holds the src folder. The site build prints every chunk's size: `index.html` must stay under 4 MB and each widget
chunk under 150 KB (three.js is one shared chunk and does not count).

## Chapter file format (`src/chNN.md`)

```
---
chapter: 2
title: Why things keep moving
short: Why things keep moving        (used on the volume page)
question: The big question, one or two sentences, ending in a question mark.
---

Intro prose (1–2 short paragraphs; the first gets a drop cap).

## 2.1 Section title
...
## A heading for the end material     (no number: holds the :::case and :::next blocks)
```

Markdown, plus these blocks. Every block except `:::fig`, `:::live`, `:::scene` and `:::story` ends with a line containing only `:::`.

| Block | Use |
|---|---|
| `==term==` (inline) | Highlights a key term the first time it is defined. Pair with a `:::note`. |
| `:::note Term` … `:::` | Margin definition, placed **after** the paragraph that introduces the term. One or two sentences. Goes to the glossary. |
| `:::aside` … `:::` | Margin comment that is not a definition (rare). |
| `:::scene Delft, 1586` | Where and when, one line. Starts with a real place name so it lands on the adventure map (see `app/places_data.js`). |
| `:::fig name(args) \| Caption` | Figure, one line. `:::figwide` spans into the margin on wide screens (draw at width 1000). |
| `:::live widget {json}` | Directly under a `:::fig` line: makes that figure live (see LIVE.md). |
| `:::evidence Title \| date` … `:::` | "How do we know?": the real experiment or measurement. 80–170 words. |
| `:::careful` … `:::` | Misconception. Start with `> "the tempting wrong idea, in a student's voice"`, then why it is wrong. |
| `:::predict` … `:::` | Predict first. A question line, then two or more `- option` lines, then `???`, then the reveal. With JavaScript the reader must choose before the reveal shows; her choice goes to the notebook. Without it, all of it shows. |
| `:::try Investigation N.M` … `:::` | Prediction or activity tied to the lab app investigation with the same number. |
| `:::home Title` … `:::` | Kitchen experiment. Adult-led ones say so in the first sentence. Gets an experiment journal. |
| `:::check` question `???` answer `:::` | One per section at most; the answer (with reasoning) goes to the back of the book. |
| `:::recall N` question `???` answer `:::` | A misconception from Chapter N coming back (spaced retrieval). Badged "Back from Chapter N"; the answer goes to the back like a check. `:::recall 3.4` also shows "you predicted …" if section 3.4 has a `:::predict`. |
| `:::school` … `:::` | "At school": one or two sentences bridging to IB/IGCSE wording. |
| `:::story id` | A card linking to the story `src/stories/<id>.md`. |
| `:::case Title` puzzle `???` solution `:::` | The chapter-end mystery: setup, clues, a direct question; solution hidden until revealed. |
| `:::next` … `:::` | Last block of the chapter: what this chapter cannot explain yet. |
| `:::work` … `:::` | Worked arithmetic, line by line. |
| `:::eq` … `:::` | A single centred equation. |
| `:::raw` … `:::` | HTML passed through unchanged (rare). |

Write units and numbers in Unicode: 9.8 m/s², 9.8 N/kg, 3 × 10⁸ m/s, 6.4 × 10⁻³, 25 °C, 4.7 kΩ, 1.5 V, λ, Δv.
Use the true minus sign (−) for negatives, a space between number and unit, and × (not x) for multiplication.

## Provenance (`provenance/chNN.yml`) — the build fails without it

One YAML file per chapter (`ch00.yml` … `ch15.yml`). **Every numbered section needs an entry**, or the build stops and
lists what is missing. Stories (`story:<id>`) and figures (`fig:<name>`, or a `figures:` item in a section) only warn
for now. Quote every key. Story and figure entries may also live in `provenance/stories*.yml` / `figures*.yml` (e.g. one `stories_<group>.yml` per story writer).

```yaml
"1.2":
  ocw: [{course: "8.01SC Classical Mechanics, Fall 2016", where: "Week 1, Lesson 2", url: "https://ocw.mit.edu/...", took: "sequence; position vs displacement"}]
  openstax: [{book: "Physics", section: "2.1 Relative Motion, Distance, and Displacement", url: "https://openstax.org/books/physics/pages/2-1-...", took: "definitions, worked number"}]
  research: [{what: "misconception prevalence", source: "Halloun & Hestenes 1985", url: "..."}]
  history: [{what: "Stevin's drop", source: "...", url: "..."}]
  figures: [{name: c1_ramp, origin: ours}]          # or origin: "redrawn from OpenStax Physics Fig 2.3"
  licence: "CC BY-NC-SA 4.0"
"story:raman": {history: [{what: "the Narkunda voyage", source: "...", url: "..."}]}
```

`provenance/sources.yml` (optional) names who made each course and book, once, for the credits page:

```yaml
ocw:      {"8.01SC Classical Mechanics, Fall 2016": {faculty: "…", url: "https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/"}}
openstax: {"Physics": {authors: "…", url: "https://openstax.org/books/physics/pages/1-introduction"}}
```

The ledger builds the back page "Where this book comes from" (grouped by source, with links to each section) and, for
every chapter that cites OpenStax, the footer line "Access for free at … Changes were made to the original material."
Use the exact `book:` and `course:` names everywhere: they are the grouping keys.

## Figures (`figs_chNN.py`)

```python
from figs_core import Fig, figure

@figure
def c3_table_push():                     # prefix every figure name with c<chapter>_
    f = Fig(640, 300, 'Alt text describing what the figure shows')
    f.ground(40, 220, 560)               # a hatched surface at height y
    f.mass_block(250, 160, 120, 60, '5 kg')
    f.force(310, 190, 0, 70, 'weight 49 N')          # bold red arrow from its point of action, labelled at the tip
    f.force(310, 160, 0, -70, 'push of the table 49 N')
    f.vector(380, 120, 90, 0, 'v = 2 m/s')           # velocity, displacement, field: thinner blue arrow
    f.spring(80, 40, 80, 200, coils=8)
    f.axis(60, 280, 300, 160, 'time (s)', 'speed (m/s)', ticks={'x': [(100, '1'), (200, '2')], 'y': [(80, '5')]})
    f.wave(60, 120, 300, 20, 80, phase=0)            # sine: amplitude, wavelength in viewBox units
    f.ray(20, 40, 300, 140, chevrons=2)              # light ray with direction chevrons
    f.arrow(x1, y1, x2, y2, 'muted'); f.text(x, y, 'label', 't m', 'middle', 13)
    return f.svg()
```

Also in `figs_core`: `line rect circle path lines curved_arrow bracket_label axes`, and for atoms (Chapter 15 and the
links to *The Invisible World*): `atom ion nucleon bond molecule`.

* Width 640 for column figures (height 220–340); 1000 with `Fig(..., wide=True)` for `:::figwide`.
* Text 12–15 px, never smaller than 12. Labels must not collide: check with `shoot.py` at 1280 and 390.
* Colour is never the only cue: forces carry labels, vectors carry names, lines carry words.
* Theme classes only, never hex: strokes `ln` `ln m` `ln r` `ln dash` `ln vol` `ln p` `ln e` `ln nn` `ln g`; fills
  `fill-ink` `fill-vol` `fill-sheet` `wash` `wash-p` `wash-e` `wash-n` `wash-g` `water` `glass` `plate` `block`;
  text `t` (ink) `t m` (muted) `t s` (serif) `t v` `t p` `t e` `t nn` `t g` `t b` (bold) `t i` (italic).
* Graphs: label axes in words with units; real data only; say in the caption when a curve is schematic.
* Real ratios: if a drawing exaggerates a size or a speed, the caption says so.

## Voice and standards

* Reader: Kym, 12, bright and curious. Write to "you". Plain words first, then the technical term, then the symbol.
  Short sentences, varied rhythm. Mumbai examples where they fit naturally (a local train, the monsoon, Marine Drive).
* Each section: a hook (a puzzle, an everyday observation), the idea in 250–550 words, one figure that does real work,
  and only the boxes that earn their place.
* Accuracy is non-negotiable. Compute every number (run it). Real measured values; say when values are made up for a
  model. Hedge where the history or the science is uncertain ("about", "the story goes").
* Never say objects want, try, like or need anything. Use forces, energy and motion.
* Models are maps: mention a model's limits where they matter, once, specifically.
* No exclamation marks except in rare genuine surprise (at most one per chapter). No "Let's dive in", no filler.
