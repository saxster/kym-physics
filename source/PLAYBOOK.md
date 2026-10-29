# The Kym Textbook Playbook

How the series is made: *The Invisible World* (chemistry, https://saxster.github.io/kym-chem/) first, then *The Moving World* (physics, https://saxster.github.io/kym-physics/), written down so every next book can be made the same way, only better. Read this before you start a new book.

**Version 2.1 (2026-10-28, completed with the physics book).** New: grounding-first research (§3a), teaching like Feynman (§9), the `:::five` "Understand it" cards (§9a), the Honest Note opening in the letter, Isabella's in-browser neural voice (`Kokoro-82M` WebGPU `fp32` / WASM `q8`), interactive cover tiles (`m_cover`), the visual layer (§10), a provenance ledger the build enforces, the `:::predict`, `:::recall` and `:::school` blocks, and new lessons in §6.

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
10. **The simplest true explanation.** Explain everything the simplest way it can be explained *truthfully*, after Feynman (§9): the thing before its name, the mechanism instead of a label, nothing she will have to unlearn. Simplicity is a test of the writer's understanding, never a reason to leave content out.
11. **Ground first, then adapt.** Before any prose, every section gets a grounding note built from the MIT OCW and OpenStax sources (§3a). A fact may appear in the book only if it traces to a grounding note, a Python computation, or a cited research file.
12. **Make it beautiful with everything the web can do** (§10): canvas, three.js, WebGL shaders, Web Audio, the phone's own sensors. Every moving thing teaches; nothing moves until she asks.

**The letter to Kym is in Amar's own voice, and Amar is not a subject expert.** Every book's letter opens, right after `"Dear Kym,"`, with an **Honest Note**: that he is not a chemist/physicist, that he made the book he would have loved to read at her age with the help of AI (without naming a specific AI product), that the explanations draw on MIT OCW, OpenStax and misconception research, that independent checkers verified every fact, date and number from scratch, and that if something disagrees with what she finds elsewhere they will check it together. Don't invent memories or a childhood for him.

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
- OpenStax books are now CC BY-NC-SA 4.0 (checked 2026-10-28; *Physics* still says CC BY in one paragraph, so treat it as BY-NC-SA). Their prefaces add that the book "may not be used in the training of large language models or otherwise be ingested into large language models or generative AI offerings without OpenStax's prior written permission". Raise this with Amar at the start of every book. For the physics book Amar decided to proceed (non-commercial, one reader, full attribution). Digital derivatives must show "Access for free at <book URL>" on every page view; the engine puts it in each chapter footer from the ledger.
- MIT OCW's terms explicitly allow non-commercial AI use with attribution (ocw.mit.edu/pages/privacy-and-terms-of-use, "Permitted Use of AI Training").
- PhET changed licence on 29 March 2026: sims released before then are CC BY 4.0 (unmodified, attribution beside the sim); newer ones are unverified. Link out rather than embed.
- MacTutor is CC BY-SA, which can't be remixed into a BY-NC-SA book: cite it, don't adapt it. IOP Spark is BY-NC-ND: ideas only. The FCI and PhysPort instruments are restricted: cite, never reproduce items.
- ISRO images: reusable unaltered with prominent credit, outside our licence. NASA: generally public domain, credit NASA, no logos. The Feynman Lectures online are © Caltech: read-only, ideas only. NASA material is generally public domain (verify per item).
- The series is non-commercial and CC BY-NC-SA 4.0, which is compatible with all of the above.

**The provenance ledger (required, enforced by the build).** `source/provenance/chNN.yml` holds one entry per numbered section (plus stories and figures): what was taken (idea, sequence, problem, number, demo, figure), from where (URL, course number, faculty, book section), and under which licence. `build.py` fails if a numbered section has no entry, and generates the credits page and the OpenStax footer line from the ledger. (The chemistry book described a ledger but never built one; the physics engine made it real.)

### 3a. Grounding first

Research has two halves, and the grounding half comes first.

1. **Spine map.** For each chapter, map every section to the exact MIT OCW session or lesson and the exact OpenStax section that teaches it. It goes at the top of `source/grounding/chNN.md`.
2. **A grounding note per section**, built by agents that actually fetch those pages: the concept sequence as the sources build it; definitions (paraphrased, with URL, noting where the school syllabus words it differently); laws and standard values with units, each recomputed in Python; worked numbers recast in the reader's world; demonstrations; concept questions (OCW concept questions and OpenStax conceptual questions seed `:::predict` and `:::check`); warnings the sources themselves give; **fidelity traps** (where the natural simplification for a 12-year-old becomes false, and the true minimal version); gaps; and proposed ledger entries.
3. **Then the other layers**: misconceptions, history, school wording.
4. **Writers write only from the notes.** Anything not in a grounding note, a Python computation or a research file is flagged for the fact gate.

The fidelity gate checks chapters against the grounding notes, line by line.

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
  - `:::predict` (v2): a question with `- option` lines and a hidden reveal; she must choose before the reveal shows, and the notebook keeps her choice
  - `:::five Term` (v2): Feynman-style "Understand it" card placed right after the text has taught a central concept, with five core `?` questions (`What is it?`, `Why is it called this?`, `What problem did it solve?`, `Why does it work?`, `How does it help?`), three folded `??` go-deeper questions (`How do we know?`, `What it isn't`, `Where does it stop working?`), and a `Your turn` one-sentence explain-back saved in her notebook
  - `:::recall N` (v2): a misconception from Chapter N coming back in a new setting (spaced retrieval, because corrections fade within months)
  - `:::school` (v2): one kind sentence on how her school's syllabus words the same thing
- **Stories:** `src/stories/<id>.md` with front matter (id, title, year, sort, people, group, terms, blurb; people also get name, born, died, role). The build auto-links the first mention of each story's `terms` per chapter. Stories open in a side panel with their own URL (`#story-id`). The groups are: table, people, tales, atoms, matter, change, quantity, electrons, carbon and tools. Give each new book its own groups.
- **Back matter:** stories index, a timeline ("The adventure in time"), answers, glossary, notes on models and numbers, Further adventures, licence.
- **App layer** (`app/`, bundled with esbuild; each module is optional and degrades gracefully):
  - **Reading:** one page at a time (`m_pages`), reading settings defaulting to sepia and the smallest size (`m_settings`), progress and resume and share links (`m_progress`), search with ⌘K (`m_search`).
  - **Learning:** answer-first checks and experiment journals (`m_checks`), highlights, notes and an exportable notebook (`m_notebook`), read-aloud with sentence highlighting and Isabella's in-browser neural voice (`Kokoro-82M` via `kokoro-js`, WebGPU `fp32` where available and WASM `q8` fallback, plus ranked system voices and unit pronunciation in `m_readaloud`).
  - **Cover and explorers:** interactive cover tiles that open a profile card for each element or chapter milestone (`m_cover`, `k_cover.css`), full-page explorers with a guided 5-question explanation alongside the interactive view (`x_scale`, `x_sky`, `x_spectrum` in physics; `m_ptable`, `m_atlas`, `m_ptguide` in chemistry), and the adventure map with lifelines (`m_map`).
  - **Design and layout:** the dotted-engraving art, volume motifs and chapter spine (`m_beauty`), and margin-note reordering on narrow screens (`m_layout`).
- **Site:** `python3 build.py --site build/site` writes `index.html`, a manifest, a service worker (offline and installable), icons, a link-preview image, README, NOTICES and LICENSE.

## 5. The pipeline (with gates)

1. **Learner profile and archetype.** Confirm the reader, the place and the constraints.
2. **Source research, run in parallel:**
   - (a) a source inventory with licences, including each source's AI-use terms;
   - (b) misconception research by topic, with prevalence and decisive demonstrations;
   - (c) history: the cast, scenes and true stories, with Indian connections, each tagged TRUE, HEDGE or LEGEND;
   - (d) school wording: the reader's actual syllabus (IB MYP and Cambridge IGCSE for Kym), with a bridge-sentence table.
   Every claim gets a real URL; never invent. Save the reports verbatim to `source/research/`.
3. **Book plan → APPROVAL GATE.** Big ideas, volumes, chapters with big questions, section list, cast, story list, live figures, explorers. Amar approves before any chapter is written, because this is the expensive-to-redo step.
4. **Engine setup and grounding, in parallel.** Copy the engine (see §7) and adapt it; meanwhile grounding agents write `source/grounding/chNN.md` (§3a). Write `NARRATIVE.md`, `STORIES.md` and the front matter for the new subject.
5. **Write chapters** in parallel writers (two or three chapters each), story-first and misconception-first, recording provenance as they go.
6. **Write stories:** topic stories, life stories and "true stories that sound made up".
7. **Gates, using independent agents that have NOT seen the writing process:**
   - fact-check, one checker per chunk, computing numbers in Python and citing sources;
   - fidelity check against the MIT and OpenStax sources;
   - the **Feynman read** (§9): a reader-as-Kym agent flags names before things, labels used as explanations, skipped steps and convenient falsehoods, and writes a three-sentence explain-back; if the explain-back contains the misconception, rewrite;
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

Added during the physics book:
- **Read every source's terms, including AI clauses.** OpenStax added an AI-ingestion restriction; MIT OCW explicitly allows non-commercial AI use. Ask Amar before starting, not halfway through.
- **The synced Skill can't be edited locally.** `story-textbook` on the Mac is a claude.ai-synced copy, and local edits are overwritten. Put depth in this PLAYBOOK and give Amar the SKILL.md text to paste into claude.ai.
- **The repo may not exist yet.** Check with `gh repo view`; this Mac's `gh` login (saxster) can create it with `gh repo create saxster/<name> --public`.
- **A single-file site stops scaling.** Chemistry was one 3.6 MB `index.html`. With dozens of three.js widgets, emit lazy chunks and precache them in the service worker.
- **Physics misconception research says three things:** a demonstration alone rarely changes a mind (Halloun & Hestenes 1985), corrections fade within 3–5 months (Winer et al. 2002), and wrong ideas come in inconsistent bundles. Hence predict-first, `:::recall`, and two or three settings per idea.
- **Research agents repeat old falsehoods.** The physics misconception report re-suggested the sugar-in-a-brim-full-glass demo the chemistry book had already rejected. Keep the rejected list below and check new suggestions against it.
- **Famous anecdotes are mostly legends.** Pisa, the cathedral lamp, Archimedes' bath, Pythagoras' hammers, the apple hitting Newton's head, "one day, sir, you may tax it", Joule's waterfall thermometer, the "Feynman Technique". Tell the true story beside each one.

- **Fan out in waves, not all at once.** Fifteen top-model writers launched together hit the 5-hour usage limit within an hour and all stopped mid-sentence. Run about four writers at a time, commit a WIP snapshot before resuming, and resume stopped agents with a message (their work is saved) rather than starting new ones.

**Rejected suggestions (don't reintroduce):** sugar barely raising a brim-full glass; Indian coins as copper; kitchen scrubbers rusting; a lemon cell lighting an LED alone; a home vacuum bag "proving" sound needs air; any figure for Leavitt's wages; "Brahmagupta discovered gravity".

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

## 8. Physics: decisions taken before planning (the approved plan is `kym-physics/source/BOOKPLAN.md`)

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

## 9. Teaching like Feynman: the simplest true explanation

The aim is the simplest explanation that is **true**: the shortest path from what the reader can see and do to the real mechanism, with nothing in it she will later have to unlearn. These rules come from what Feynman documented, not from the internet's "Feynman Technique" (a four-step recipe coined in a 2011 blog post by Scott Young; don't cite it as Feynman's).

| Principle | Where Feynman shows it | Rule for writers |
|---|---|---|
| Know the thing, not the name. | His father and the bird (*What Do You Care What Other People Think?*, 1988); the Brazil class who could recite Brewster's angle but couldn't see it in light off the bay (*Surely You're Joking*, "O Americano, Outra Vez!") | Phenomenon first, name second. Every new term is earned by something she has seen. |
| A label is not an explanation. | "Judging Books by Their Covers" (*Surely You're Joking*): "energy makes it go" says no more than "movability makes it move". | **Movability test:** swap the term for a made-up word. If the sentence still "explains", it explains nothing. Show the spring, the gear, the push. |
| If it can't be made simple, we don't understand it yet. | Goodstein, "Richard P. Feynman, Teacher", *Physics Today* 42(2), 1989: "I couldn't reduce it to the freshman level. That means we really don't understand it." | Simplicity tests the writer. When a section won't go simple, go back to the grounding note and the sources; never water it down. |
| You must not fool yourself. | "Cargo Cult Science", Caltech commencement, 1974. | The gates. Report what doesn't fit; say plainly what nobody knows yet. |
| Several ways to see the same thing. | His recurring point that good physicists carry several representations of the same physics (*The Character of Physical Law*, 1965; check the wording before quoting). | Each big idea from at least two angles: picture, number, story, hands. |
| Start from what you can see; estimate first. | Throughout the *Lectures* and the memoirs. | Numbers before formulas; a guess before a measurement. |

**Guards, so "simplest" doesn't slide into something worse:**
1. Simple is not false. Convenient fictions stick; the misconception research shows it. Where a model stops working, say so once.
2. Simple is not short. A simple explanation often has more steps, each smaller.
3. Simple is not easy. Keep the challenge. Feynman's own *Lectures* overshot many of the freshmen they were written for; the lesson is to test explanations on the real reader.
4. Simple is not vague. Precise words, real numbers and named people stay.

**The Feynman read (a gate).** An independent agent reads each section as the reader would and flags: a name given before the thing is shown; a label used as an explanation; a skipped step; a convenient falsehood. It writes a three-sentence explain-back in a 12-year-old's words. If the explain-back contains the misconception, the section is rewritten.

## 10. The visual layer

A beautiful book gets read. Use everything the browser offers, but every moving thing must teach the idea of its section.

**Per chapter:** a volume-motif opener, two to four live figures, and one hands-on sensor lab where the idea allows. A still, engraved SVG sits behind every live figure: it prints, it shows without JavaScript, and it is what the reader sees first.

**Affordances (in the engine; see LIVE.md):**
- **three.js:** explorers, 3D fields and orbits, molecules and crystals, the eye and lens.
- **WebGL shaders** (`api.gl`): ripple tanks, interference, sky colour from scattering.
- **Canvas 2D** (`live/core.js`): motion, forces, energy, circuits, particles.
- **Web Audio** (`api.audio`): harmonics, beats, the Doppler effect, pitch against loudness.
- **The reader's own phone, opt-in only:** microphone (`api.mic`: oscilloscope, spectrum, echo timing), motion sensor (`api.motion`: free fall reads about zero), video (`api.video`: step through her own slow-motion clip and tap to track a ball). Nothing she records leaves the device.
- **Explorers** for structures she returns to (the periodic table and map for chemistry; Powers of Ten, the Sky, the Ladder of Light and the map for physics).
- **CSS:** scroll-driven openers, View Transitions between chapters, the dotted-engraving art and volume motifs.

**Guardrails:**
- Physically honest: real ratios and directions, conservation checked every frame, and anything slowed or exaggerated is named in the readout.
- No autoplay. Pause off-screen. Reduced motion opens paused. At most two or three controls. Book colours in light, dark and sepia.
- Budget: `index.html` under 4 MB; each widget chunk under 150 KB; three.js as one shared chunk loaded only when a 3D figure opens; 60 fps on a mid-range Android phone; everything precached for offline reading.
- Content first, beauty second: the design pass follows the content gates, never the other way round.

### Graphics continuation lessons (29 October 2026)

- A live canvas needs both a fitted composition and native-width inspection on phones. Apply inspection sizing to nested teaching canvases as well as direct children; keep input state, clock, keyboard controls and WebGL fallbacks intact.
- Link each diagram to evidence: actual source paths must generate the same interference strip; a lens’s central ray and focus must agree; calibration must not rescale physical gravity. Label a display horizon separately from escape.
- Verify the paused first frame after ResizeObserver and theme changes. A clear canvas is not evidence of a working fallback. Start animation time deltas at zero if the first RAF timestamp predates the synchronous setup clock.
- Additional original static art can stay within the existing document budget by minifying CSS whitespace and deferring heavy map data to the existing precached explorer-chunk mechanism. Measure SVG labels using actual font bounds when culling map labels.

### Demonstration audit lessons (29 October 2026)

- Numerical and renderer tests do not establish visual acceptance. Inspect every added lesson in default and meaningful changed states on mobile and desktop; retain a per-lesson record. Record actual viewport dimensions and wait for the opening transition to finish before accepting screenshots.
- Readable text must leave the evidence visible. Keep long headings and bottom captions outside the calculated geometry, retain numeric ticks at their measured anchors, and use callouts where labels would cover a body, force arrow or ray. Preserve the diagram's aspect ratio and disclose enlarged insets.
- Frame the visible apparatus rather than hidden alternatives or unused buffer capacity. For a replay, author an envelope that contains its motion and keep that camera fixed through the replay.
- Match controls to the model: hide playback when time changes nothing; synchronise clocks, resets and preset selection; derive displayed precision from the actual slider step. A loop that pauses at an endpoint must not schedule another animation frame afterwards.
- Check light, dark and sepia on a wide-gamut display. Convert CSS Color 4 palette values through the browser's sRGB canvas before passing them to a renderer that cannot parse that syntax; otherwise coloured evidence can become white. Cache the conversion rather than reading pixels every frame.
