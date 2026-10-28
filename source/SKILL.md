---
name: "story-textbook"
description: "Use when creating or revising a book in Kym's story-first textbook series (chemistry, physics, etc.) built from MIT OCW, OpenStax and misconception research, published on GitHub Pages."
---

# Story-first textbooks for Kym

A series of free, non-commercial HTML5 textbooks for one reader: Kym, 12, Mumbai, on the IB/IGCSE track. Each book is shared publicly on GitHub Pages under CC BY-NC-SA 4.0.
- Book 1, *The Invisible World* (chemistry): https://saxster.github.io/kym-chem/ (repo saxster/kym-chem)
- Book 2, *The Moving World* (physics): https://saxster.github.io/kym-physics/ (repo saxster/kym-physics)

## Before anything else
1. Clone the newest book's repo (saxster/kym-physics, else saxster/kym-chem) and read `source/PLAYBOOK.md` in full. It holds the method, pipeline, gates, lessons learned, the Feynman principles (§9), the visual layer (§10) and the engine guide. The physics repo also has `source/BOOKPLAN.md`, a worked example of an approved plan.
2. The reusable engine lives in `source/`: build.py, stories.py, book.css, the app/ modules, live/ (core.js with the audio, mic, motion, video and WebGL helpers; three_kit.js), fonts/ and the provenance check. Copy the newest book's engine, then replace the subject content (src/, figs_*.py, live/w_*.js, explorers, TITLE/SUBTITLE/VOLUMES/SITE_URL, story GROUPS, places_data.js).
3. Check the new repo exists with `gh repo view saxster/<name>`. If it doesn't, this Mac's gh login can create it: `gh repo create saxster/<name> --public`. Push the built site (`python3 build.py --site build/site`) to the root of `main` and enable Pages.

## Principles (non-negotiable)
- **Audience of one.** Write for Kym's age, her city, her kitchen and what she already knows. Clarity is the only test. Never water anything down for curriculum level. The one exception is a single kind `:::school` sentence bridging to how her syllabus (IB MYP / Cambridge IGCSE) words something differently.
- **The simplest true explanation, after Feynman.** The thing before its name. A mechanism, never a label (movability test: swap the term for a made-up word, and if the sentence still "explains", it explains nothing). Nothing she will have to unlearn. If a section won't go simple, the writer doesn't understand it yet: go back to the sources, don't dilute. Simple is not false, short, easy or vague. Cite Feynman's documented practice (PLAYBOOK §9), never the "Feynman Technique" meme.
- **Ground first, then adapt.** Before any prose, every section gets a grounding note (`source/grounding/chNN.md`) built from the actual MIT OCW and OpenStax pages: sequence, definitions, values recomputed in Python, demos, concept questions, fidelity traps. A fact may appear in the book only if it traces to a grounding note, a Python computation or a cited research file.
- **Ideas have discoverers.** Story-first: real people, places and years, with scenes like `:::scene Delft, 1586`. True history only: tag every anecdote TRUE, HEDGE or LEGEND; hedge anecdotes, tell legends as legends beside what really happened, never invent quotes.
- **Misconception-first.** Each idea runs: her likely wrong idea, then `:::predict`, then the decisive evidence or demonstration, then the better model, then `:::careful`, then `:::check`. Wrong ideas return in later chapters (`:::recall N`), because corrections fade within months.
- **Mechanism instead of shorthand.** Never "atoms want", "the ball wants", "electricity is used up". Unpack the convenient fiction into the real principle.
- **Integrity gates are mandatory**, run by independent agents that haven't seen the writing: facts (numbers in Python, sources cited); fidelity against the grounding notes; the **Feynman read** (flags names before things, labels as explanations, skipped steps, convenient falsehoods, plus a three-sentence explain-back); safety and will-it-work for a Mumbai home; licence and provenance. Writers must reject bad research suggestions (see the rejected list in PLAYBOOK §6).
- **Make it beautiful with everything the web can do.** three.js explorers and 3D figures, WebGL shaders, canvas widgets, Web Audio, and the reader's own phone (microphone, motion sensor, slow-motion video), all opt-in. Every moving thing teaches its section's idea, is physically honest, never autoplays, and has a still SVG behind it. Budget: index.html under 4 MB, lazy widget chunks under 150 KB each, offline via the service worker.
- **Understand first, then memorise** with spaced retrieval.
- **Content first, beauty second.**
- **Voice:** warm, plain, vivid; no exclamation-mark gush.

## Sources and licences
- Three layers: an MIT OCW course for rigour and sequence, an OpenStax book for coverage and accuracy, and misconception research plus history sources for how learners think.
- MIT OCW and OpenStax are CC BY-NC-SA. Adapt freely, with credit, non-commercially, and share alike. Verify each course's and book's own licence page, including AI terms: MIT OCW allows non-commercial AI use with attribution; OpenStax's prefaces restrict AI ingestion without permission, so raise it with Amar at the start (for physics he chose to proceed). OpenStax derivatives need "Access for free at <book URL>" on every page view.
- All-rights-reserved third-party items inside OCW and OpenStax can't be adapted: redraw them as our own figures. Ideas-only sources: IOP Spark, FCI/PhysPort, Feynman Lectures, MacTutor (BY-SA), NCERT.
- Keep the provenance ledger (`source/provenance/chNN.yml`): what was taken, from where, under which licence. The build fails without an entry per section and generates the credits page from it.
- Re-teach in our own voice; never paste source prose.

## Pipeline
1. Learner profile, archetype and school syllabus.
2. Parallel research: (a) source inventory with licences and AI terms; (b) misconceptions with prevalence and decisive demonstrations; (c) history: cast, scenes, true stories and Indian connections, each tagged TRUE/HEDGE/LEGEND; (d) school wording with bridge sentences. Every claim needs a real URL. Save the reports to `source/research/`.
3. **Book plan, then STOP for Amar's approval:** big ideas, volumes, chapters with big questions, sections, cast, stories, live figures, explorers, sensor labs.
4. Engine setup and the grounding pass in parallel; subject docs (NARRATIVE.md, STORIES.md, front matter).
5. Parallel chapter writers, each owning specific files (chapter, figures, ledger), writing only from the grounding notes.
6. Stories: topic stories, life stories, and "true stories that sound made up".
7. Independent gates: facts, fidelity, Feynman read, safety and will-it-work, licence and provenance.
8. Figures, widgets, explorers and sensor labs, then visual QA with Playwright at 390, 820, 1024, 1180 and 1440 px in light, dark and sepia, plus livetest.py and no console errors.
9. Publish, then verify the live site (the service worker's cache version must match the build).
10. Before republishing, diff the live index.html against the local build and port any direct edits into the source.
11. Fold what you learned into PLAYBOOK.md, and give Amar the updated SKILL.md text to paste into claude.ai (the local synced copy can't be edited).

## Defaults
Sepia theme and the smallest text size by default; one chapter per page; CC BY-NC-SA 4.0; British spelling; `:::try Investigation N.M` numbers kept for a companion lab app (existing or future).

## Do not
- Use Walter Lewin's lectures or course materials. MIT removed them from OCW in December 2014 after a harassment finding.
- Use any photographs of public figures. Use initials medallions instead.
- Commit secrets.
- Edit another agent's files without reporting it.
- Let anything move, play sound or ask for the microphone or motion sensor before the reader asks.
