# The Kym Textbook Playbook

How *The Invisible World* (chemistry, https://saxster.github.io/kym-chem/) was made, written down so the next book in the series (physics first) can be made the same way, only better. Read this before you start a new book.

The series: free, non-commercial books for one reader (Kym, 12, Mumbai), shared publicly on GitHub Pages under CC BY-NC-SA 4.0.

---

## 1. Principles (the non-negotiables)

1. **An audience of one.** Every choice is made for one specific reader: her age, her city, her kitchen, what she already knows, what school will tell her. Examples come from her life (local trains, chai, haldi, chuna, the monsoon). Clarity is the only test. Don't simplify, postpone or label anything "ahead of school". The one exception is a single kind bridge sentence where school will word something differently and she would otherwise be confused.
2. **Ideas have discoverers.** Teach how we know, through the people who were confused, wrong, then right. History is the thread, not decoration. True history only: hedge anecdotes ("the story goes"), flag legends as legends, never invent quotes.
3. **Her wrong idea comes first.** For each idea: name the misconception she probably holds, then **Predict first**, then the decisive evidence or demonstration, then the better model, then a correction box, then retrieval ("Check yourself"). The misconception research is the single biggest quality lever.
4. **Mechanism instead of shorthand.** Wherever experts use a convenient fiction ("atoms want a full shell"), show the real principle underneath (energy and probability), and say why the shorthand exists.
5. **Evidence integrity is a gate, not a polish.** Independent checkers verify every fact, number, date and quote against sources, and compute numbers in Python. Independent "will it work, is it safe" checkers test every home experiment for this reader's actual home. Roughly a third of the effort. Never cut it.
6. **Motion only where the idea is dynamic.** Live figures (canvas or three.js) for change: equilibrium, titration, a battery's electrons, states of matter. Explorers (a periodic table, a map) for structures she returns to. A still SVG is the fallback.
7. **Understand first, then memorise.** Spaced retrieval comes after the pattern makes sense, never instead of it.
8. **Content first, then beauty.** The design pass comes after the content is right. Beauty matters, because a beautiful book gets read, but it never competes with reading.
9. **Voice.** Warm, plain, vivid, precise. No exclamation-mark gush. Speak to her as "you". Tell one continuous adventure, with bridges between chapters ("Fifty years after Dalton…").

## 2. Subject archetypes

The weight of each layer changes with the subject:

| Archetype | Examples | Weight shifts to |
|---|---|---|
| Explanatory science | chemistry, physics, biology | mechanism, misconceptions, home experiments, live figures |
| Formal systems | maths, accounting, programming | worked examples, misconceptions, practice |
| Narrative humanities | history, economics | story, primary sources, competing interpretations ("contested" flag) |
| Embodied skills | music, languages | a practice loop and feedback, with short theory bursts |

## 3. Sources: adapting MIT OCW, OpenStax and others

Build on three layers of sources:

| Layer | Source | Gives |
|---|---|---|
| Rigour and sequence | MIT OpenCourseWare course(s) | what matters and in what order, demonstrations, problems, concept questions |
| Coverage and accuracy | an OpenStax textbook | complete checked explanations to verify against |
| How learners think | misconception research (for example IOP Spark, AAAS Project 2061, RSC/Taber, PhET research, the Force Concept Inventory) plus history sources | the wrong ideas to confront, and the people and stories |

**Licences (verify per course and per book; these change):**
- MIT OCW is **CC BY-NC-SA**. Adaptation is allowed: credit MIT and the named faculty, no commercial use, and share under the same licence. **"All rights reserved" third-party items inside OCW courses can't be adapted.** Redraw them as our own figures.
- OpenStax states CC BY-NC-SA on its help page. Some older editions may be CC BY 4.0, so check each book's own licence page.
- PhET is CC BY (verify). The Feynman Lectures online are © Caltech: read-only, ideas only. NASA material is generally public domain (verify per item).
- The series is non-commercial and CC BY-NC-SA 4.0, which is compatible with all of the above.

**The provenance ledger (required).** For every section, record what was taken (idea, sequence, problem, figure, wording), from where (URL, course number, faculty), and under which licence. The credits page is generated from the ledger.

**Fidelity check (required).** A checker compares each simplified explanation against the source. Simplifying for a 12-year-old is exactly where subtle errors creep in.

Ideas aren't copyrightable. Re-teach the content in our voice; never paste source prose.

## 4. Book anatomy (what the engine supports)

- **Front matter:** a letter to the reader, How this book works, the Four big ideas, Contents, The cast (life-story cards), and explorer pages.
- **Volumes and chapters.** Each chapter has a "big question" and numbered sections (the section numbers match the companion lab app). Each section opens with a **scene** (`:::scene Manchester, 1909`), then a story-led explanation.
- **Blocks:**
  - `:::note` margin definitions, which become the glossary
  - `:::careful` misconceptions
  - `:::home` kitchen experiments (adult-led ones say so)
  - `:::try`
  - `:::check` (question, `???`, answer)
  - `:::case` end-of-chapter mystery
  - `:::next` the bridge to the next chapter
  - `:::work` worked examples, `:::eq` equations
  - `:::fig` and `:::figwide` (Python SVG figure functions), with `:::live name {params}` under a figure to make it live
  - `:::story id` story callout cards
- **Stories:** `src/stories/<id>.md` with front matter (id, title, year, sort, people, group, terms, blurb; people also get name, born, died, role). The build auto-links the first mention of each story's `terms` per chapter. Stories open in a side panel with their own URL (`#story-id`). The groups are: table, people, tales, atoms, matter, change, quantity, electrons, carbon and tools. Give each new book its own groups.
- **Back matter:** stories index, a timeline ("The adventure in time"), answers, glossary, notes on models and numbers, Further adventures, licence.
- **App layer** (`app/`, bundled with esbuild; each module is optional and degrades gracefully):
  - **Reading:** one page at a time (`m_pages`), reading settings defaulting to sepia and the smallest size (`m_settings`), progress and resume and share links (`m_progress`), search with ⌘K (`m_search`).
  - **Learning:** answer-first checks and experiment journals (`m_checks`), highlights, notes and an exportable notebook (`m_notebook`), read-aloud with sentence highlighting (`m_readaloud`).
  - **Explorers:** the periodic table with Discovered, Explore, Build it and Practise tabs (`m_ptable`, `m_atlas`), and the adventure map with lifelines (`m_map`). These are subject-specific; replace them per book.
  - **Design and layout:** the dotted-engraving art, volume motifs and chapter spine (`m_beauty`), and margin-note reordering on narrow screens (`m_layout`).
- **Site:** `python3 build.py --site build/site` writes `index.html`, a manifest, a service worker (offline and installable), icons, a link-preview image, README, NOTICES and LICENSE.

## 5. The pipeline (with gates)

1. **Learner profile and archetype.** Confirm the reader, the place and the constraints.
2. **Source research, run in parallel:**
   - (a) a source inventory with licences;
   - (b) misconception research by topic, with prevalence and decisive demonstrations;
   - (c) history: the cast, scenes and true stories, with Indian connections.
   Every claim gets a real URL; never invent.
3. **Book plan → APPROVAL GATE.** Big ideas, volumes, chapters with big questions, section list, cast, story list, live figures, explorers. Amar approves before any chapter is written, because this is the expensive-to-redo step.
4. **Engine setup.** Copy the engine (see §7). Write `NARRATIVE.md`, `STORIES.md` and `FORMAT.md` for the new subject.
5. **Write chapters** in parallel writers (two or three chapters each), story-first and misconception-first, recording provenance as they go.
6. **Write stories:** topic stories, life stories and "true stories that sound made up".
7. **Gates, using independent agents that have NOT seen the writing process:**
   - fact-check, one checker per chunk, computing numbers in Python and citing sources;
   - fidelity check against the MIT and OpenStax sources;
   - experiment safety and "will it work in a Mumbai home" check;
   - licence and provenance check.
8. **Figures and live widgets**, then **visual QA** with Playwright screenshots at 390, 820, 1024, 1180 and 1440 px, in light, dark and sepia; plus `livetest.py` and no console errors.
9. **Publish** to GitHub Pages, then verify live by checking the service worker's version string matches the build.
10. **Feedback loop.** What Kym actually reads, skips and gets wrong feeds the next revision. This part isn't built yet; it's the biggest open gap.

## 6. Lessons learned (each cost real effort)

- **Fact errors are everywhere until checked.** About 150 were caught across chemistry: wrong dates, wrong cities, legends stated as fact, "musician" Newlands, Mendeleev's cobalt and nickel "swap", a 1908 Dalton table that was really 1803.
- **Experiments must fit her actual home.**
  - Indian coins aren't copper.
  - Kitchen scrubbers are stainless steel and don't rust.
  - Pharmacy hydrogen peroxide is 6% here.
  - Indian vinegar can be 4%.
  - Many homes have no hot tap.
  - One lemon cell gives about 0.9 V, and an LED needs about 1.8 V.
- **Research suggestions can be wrong too.** "A brimful glass barely rises when sugar dissolves" would have taught a falsehood, so the writer rejected it. Writers must think, not obey.
- **School will contradict you.** NCERT says "atoms want an octet", "oxidation is gaining oxygen", and "neutralisation gives out heat". Bridge each one with a sentence; don't fight it.
- **Layout audits find real problems.** One 640,000 px page; definitions appearing before the paragraph that introduces the term on phones; 13 px grey margin notes; automatic hyphenation splitting "hydronium"; ion charges too faint to read.
- **Publishing friction.** This session couldn't create GitHub repositories, so Amar creates the empty repo and Claude pushes. Someone may edit the live site directly, so diff the live `index.html` against the local build before republishing, and port any edits into the source.
- **Parallel agents need strict file ownership.** Give each agent its own files, and make no shared-file edits without reporting them.

## 7. The engine: starting a new book

- **Keep, unchanged or nearly:**
  - `build.py`, `stories.py`, `book.css`
  - `app/core.js` and the generic app modules: pages, settings, progress, search, checks, notebook, readaloud, beauty, layout
  - `live/core.js` and `live/three_kit.js`
  - `fonts/`, `fonts_prep.py`, `package.json`
  - `shoot.py`, `livetest.py`, `site_src/`
- **Replace per book:**
  - `src/` (chapters, front matter, stories)
  - the `figs_*.py` figure functions
  - the `live/w_*.js` widgets
  - the explorers (`m_ptable`, `m_atlas`, `m_map` and their data)
  - `TITLE` and `SUBTITLE` in `build.py`
  - `VOLUMES` and volume colours
  - the `SITE_URL` in `build.py`
  - the story `GROUPS` in `stories.py`
  - `site_src/` text
- **Commands:**
  ```
  npm install                                 # esbuild, three, d3-geo, topojson-client, world-atlas
  python3 build.py --only 1,2 --out build/x.html   # quick partial build
  python3 build.py --site build/site               # full site for GitHub Pages
  python3 livetest.py build/site/index.html /tmp/lt # every live figure, no console errors
  ```

## 8. Physics: decisions already made

- Next book: **physics**, in its own repo, **saxster/kym-physics**, served at https://saxster.github.io/kym-physics/.
- **Sources to evaluate:**
  - MIT OCW 8.01 (mechanics), 8.02 (electricity and magnetism), 8.03 (waves), 8.282 (astronomy), MIT physics demonstration collections and Highlights for High School;
  - OpenStax *Physics* (high school) and *College Physics*;
  - PhET simulations;
  - IOP Spark misconceptions, the Force Concept Inventory, and "A Private Universe" (seasons).
- **Do not use Walter Lewin's lecture videos.** MIT removed them from OCW in 2014 after finding he had harassed students online. Verify the current status.
- Physics has the richest misconception literature of any subject. Build chapters around the most persistent ones: force and motion, falling, seasons, circuits, light and seeing, heat and temperature.
- **Connect to the chemistry book** where it helps (atoms, energy, electrons), with links to https://saxster.github.io/kym-chem/.
- **Indian connections:** Aryabhata, Brahmagupta, J. C. Bose, S. N. Bose, Raman, Saha, Chandrasekhar, Bhabha, Sarabhai, Kalpana Chawla, ISRO (Chandrayaan-3, Aditya-L1). Mumbai examples: local trains, the monsoon, the Sea Link, the tides at Haji Ali.
- **Defaults carried over:** sepia, the smallest text size, one chapter per page.
