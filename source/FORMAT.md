# The Invisible World: how the book is written and built

`python3 build.py` turns `src/` into one self-contained HTML file in `build/` (fonts and figures embedded, works offline).
`python3 build.py --pdf` also prints an A4 PDF. `--only 2,3 --out /tmp/x.html` builds just some chapters (for checking).
`python3 shoot.py build/x.html /tmp/shot ch2 s2-3 fig-2-4 --w 1280` screenshots elements by id (`--w 390` for phone).

## Chapter file format (`src/chNN.md`)

```
---
chapter: 2
title: How atoms form substances
short: How atoms form substances        (used in the volume page)
question: The big question, one or two sentences, ending in a question mark.
---

Intro prose (1–2 short paragraphs; the first gets a drop cap).

## 2.1 Section title
...
## A heading for the end material     (no number: holds the :::case and :::next blocks)
```

Markdown, plus these blocks. Every block except `:::fig` ends with a line containing only `:::`.

| Block | Use |
|---|---|
| `==term==` (inline) | Highlights a key term the first time it is defined. Pair with a `:::note`. |
| `:::note Term` … `:::` | Margin definition. Put it **after** the paragraph that introduces the term; the build moves it alongside. One or two sentences. Collected into the glossary. |
| `:::aside` … `:::` | Margin comment that is not a definition (rare). |
| `:::fig name(args) \| Caption` | Figure, one line, no closing fence. `:::figwide` spans into the margin on wide screens (for charts and wide diagrams, drawn at width 1000). |
| `:::evidence Title \| date` … `:::` | "How do we know?" — the real experiment or measurement. 80–170 words. |
| `:::careful` … `:::` | Misconception. Start with `> "the tempting wrong idea, in a student's voice"`, then explain plainly why it is wrong. |
| `:::try Investigation N.M` … `:::` | Prediction or activity, tied to the lab app investigation with the same number. |
| `:::check` question `???` answer `:::` | One question per section; answer (with reasoning) goes to the back of the book. |
| `:::case Title` puzzle `???` solution `:::` | The chapter-end mystery: setup, numbered or bulleted clues, a direct question; solution hidden until revealed. |
| `:::next` … `:::` | Last block of the chapter: what this chapter's model cannot explain yet, leading into the next chapter. |
| `:::work` … `:::` | Worked arithmetic, line by line (sans serif, tabular figures). |
| `:::eq` … `:::` | A single centred equation or rule. |
| `[[nuc:17:8:O:2−]]` (inline) | Stacked nuclear symbol (mass number, atomic number, symbol, charge; leave charge empty for neutral). |

Write chemistry with Unicode: H₂O, Na⁺, O²⁻, SO₄²⁻, 6.022 × 10²³, −, ⇌, →, ΔH, δ⁺. Use the true minus sign (−) for negatives and charges.

## Figures (`figs_chNN.py`)

```python
from figs_core import Fig, figure, catmull, jitter_grid, pack_disc
from figs_ch01 import draw_nucleus, draw_atom, mini_atom, shell_atom   # reusable helpers

@figure
def c2_lattice():                       # prefix every figure name with c<chapter>_
    f = Fig(640, 300, 'Alt text describing what the figure shows')
    f.molecule('H2O', 100, 120)          # H2 O2 N2 Cl2 H2O CO2 CH4 NH3 HCl H2O2 NO O3
    f.atom(200, 120, 'Na', r=16)         # any element symbol; label drawn inside
    f.ion(260, 120, 'Cl', '−')           # atom with a charge badge
    f.bond(x1, y1, x2, y2, order=2)
    f.arrow(x1, y1, x2, y2, 'electron')  # kinds: ink muted proton electron neutron green
    f.text(x, y, 'label', 't m', 'middle', 13)   # classes: t (ink) m (muted) s (serif) v (volume colour) p e nn g b
    return f.svg()
```

* Width 640 for column figures (height 220–340); 1000 for `:::figwide`.
* Text in figures 12–15 px; never smaller than 11.5. Labels must not collide; check by screenshot.
* Colour is never the only cue: atoms carry symbols, particles carry signs, lines carry labels.
* Classes, not hex colours, for anything that should follow light/dark themes: `ln` `ln m` `ln r` `ln dash` `ln vol` `ln p` `ln e` `ln g` (strokes), `fill-ink` `fill-vol` `fill-sheet` `wash-p` `wash-e` `wash-g` `water` `glass` `plate` `region` `shell` (fills), `bar-p` `bar-e` `bar-n` `bar-g` `bar-ink` `bar-m`.
* Plots: label axes in words with units; real data only; say in the caption when a curve is schematic.
* No orbit tracks, no fake photographs, no "atoms with faces".

## Voice and standards

* Reader: Kym, 12, bright and curious. Write to "you". Plain words first, then the technical term, then the symbol. Short sentences, varied rhythm. Concrete examples from a Mumbai kitchen, street, monsoon or classroom where they fit naturally (no more than one or two per chapter).
* Each section: a hook (a puzzle, an everyday observation), the idea explained in 250–550 words, one figure that does real work, and only the boxes that earn their place. Not every section needs every box.
* Accuracy is non-negotiable. Compute every number (run it). Use real measured values and say when values are made up for a model. Hedge where science itself is uncertain or a figure is approximate ("about", "roughly").
* Never say atoms or molecules want, try, like, need, or are happy. Use forces, energy, motion and counting.
* Models are maps: mention a model's limits where they matter, once, specifically. Do not repeat boilerplate disclaimers.
* No exclamation marks except in rare genuine surprise (at most one per chapter). No "Wait!", no "Let's dive in", no rhetorical filler.
* Keep the original section numbers and the core idea of each section (they match the app), but titles and examples can improve.
