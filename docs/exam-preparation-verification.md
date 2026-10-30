# Motion exam preparation: verification record

Historical pilot checkpoint. The [all-chapter verification record](exam-all-chapters-verification.md) describes the current expanded implementation.

30 October 2026. Implements the pilot in [the detailed plan](exam-preparation-plan.md). This is the first complete preparation chapter; the remaining chapters retain their reading and conceptual checks and have a documented rollout rather than newly claimed exam coverage.

## Delivered

- A dedicated preparation page reached from the cover, contents, reading toolbar, Chapter 1, search and the glossary.
- Eight selectable motion objectives linked to existing teaching; 30 practice questions progressing through recall, worked examples, guided, independent, changed-context and delayed-review work.
- Two original papers with six different questions each, 14 suggested marks and optional 15-minute timing. Timed and untimed sessions retain their answers and deadlines across reload.
- Model reasoning, one explicit point per suggested mark, accepted equivalents, common difficulties, hints and direct repair links. Numerical final-answer checking is separate from self-awarded method marks.
- Ten revision cards with meaning, examples, distinctions, equations/units where relevant, selective memory cues and recall prompts; ten entries on command words and exam technique.
- Saved first answers, mark points, assistance, error categories and attempt history. First-answer commitment time is preserved separately from marking time.
- A daily review queue with 1, 3, 7, 14 and 30 day defaults. Known questions can support recurring retrieval reviews without creating new independent evidence. Same-day repetition cannot extend a review interval.
- Questions-only, answer/marking and revision printing; Markdown export; exam state included in the existing notebook backup and restore boundary.
- Static HTML and native disclosures without JavaScript; existing offline packaging; current-session fallback when persistent storage is unavailable.

## Content integrity

The content author recomputed all 18 numerical-entry answers and multipart examples. A fresh independent reviewer read all 42 questions, ten cards and technique entries, independently recomputed every numerical answer and graph integral, and checked marking, ambiguity, source lineage and practical safety. All numerical values matched. Five wording/marking corrections and an additional straight-line-motion clarification were applied and verified.

The independent implementation review found incorrect timing of delayed evidence, a terminal overdue-review state, a broken individual paper retry, concealed answers entering search snippets and navigation to filtered search results. Each was corrected. Subsequent integration and visual checks also corrected direct paper links, narrow reading-toolbar access, print disclosure restoration, print-control leakage, small graph labels and preservation of unmarked answers before retrying.

No existing chapter or story source was rewritten. Chapter 1 and its provenance remain unchanged; its preparation link is inserted by the builder. The reader guide and design notes describe the added path.

## Acceptance evidence

| Plan criteria | Evidence |
|---|---|
| E01–E03, learning evidence and dates | `node --test source/tests/test_exam_model.mjs`: 11 behavioral tests, including current help, prior solutions, distinct questions/days, partial/zero credit, recurring reviews and duplicate suggestions. |
| E04–E07, progressive and correct content | `test_exam_catalog.py`: five tests rejecting inconsistent marks/references/graphs, checking all stages and paper separation, and verifying escaped static output. Independent content review and arithmetic audit in `source/grounding/exam-motion.md`. |
| E08–E10, integration and fallback | Reader build checks require unique valid internal links and the original 4 MiB budget. Browser entry, search, static native disclosures and original narrative preservation were checked. |
| E11–E15, answering and revision | The real browser journey commits an answer, checks numerical feedback, self-marks, reloads and retrieves it. Controlled clock changes verify that delayed marking cannot manufacture spaced success and that a later fresh question can establish delayed evidence. |
| E16–E18, papers and portable work | Browser checks cover unchanged deadlines across reload, expiry, untimed finishing, paper retry safety, print isolation, readable Markdown export and notebook restore into a fresh browser storage context. |
| E19, complete local release checks | Final result recorded below. No GitHub-hosted verification is used. |
| E20, independent review | Fresh content and implementation reviews completed; findings addressed through the tests and inspections above. |

The complete exam browser test covers 320, 390, 820, 1024, 1180 and 1440 px in light, sepia and dark, native keyboard controls, graph readability, no relevant page errors, offline reload, no-JavaScript reading and storage failure. A separate WebKit smoke check exercised numeric feedback, marking/reload, untimed papers, graphs and access to reading settings at 320 px. Browser plugin is not installed; these checks use the repository's installed local Playwright browsers.

## Reproduce locally

Run `./source/check-reader.sh` from the repository root. The command includes model/catalog checks, the build, reader and exam browser journeys, read-aloud, investigations, lesson integration, the lesson browser matrix and live-figure/offline checks, and fails on an unsuccessful check. Publishing remains a separate source push.

Focused exam checks:

```sh
node --test source/tests/test_exam_model.mjs
.venv/bin/python -m unittest discover -s source/tests -p 'test_exam_catalog.py'
.venv/bin/python source/tests/test_exam_browser.py
```

The exam browser test accepts `--site /absolute/path/to/a/built/site` to check a separate build without disturbing another local release run. Receipts, screenshots and generated practice PDFs are under the ignored `source/build/exam-checks/` directory.

## Practical limits

These marks are self-assessed against original suggested guidance. Software checks and model review do not establish a student's understanding or predict her examination grade. Match the working checklist and future mixed papers to her school's actual syllabus and assessment format. Teacher review and a student trial after a delay remain useful next validation steps. No physical home experiment was performed during this implementation.

## Final release result

**PASS.** `./source/check-reader.sh` completed locally with exit status 0. This includes the model and catalog checks, book build and integrity, reader and exam journeys, read-aloud, investigations, lesson integration, **756 lesson/viewport/theme cases**, every live figure and explorer, and offline reload. The browser reported no relevant console errors; two headless software-GL performance notes were identified separately by the existing runner.

The final graph, print and keyboard-focus changes also passed the complete exam browser journey against the final build: **18 width/theme combinations**, concealed answers, partial/self marking, preserved commitment dates, paper deadlines/expiry, question-only and answer printing, backup/restore, offline access and both fallback modes. Hint use returns keyboard focus to the answer; saving marks focuses the saved feedback. Final WebKit smoke checks passed the answering, numerical feedback, saved marking, untimed paper, narrow graph labels and reading-tool flows.

Printed question and answer sheets were rendered and visually inspected. The questions-only sheet has writing space and excludes answers, web controls and saved responses; the answer sheet includes the model and marking guidance. The final packaged reader passes all three build-integrity checks. Its **4,142,972 bytes** stay below the **4,194,304-byte** document budget; all **76 offline manifest entries** are present and byte-identical to the tested build. The service-worker cache version is `33f7ede8554e`. The packaged index SHA-256 is `ea8896d5f1bd338b6ed186bc3d129c02d7c00b361ec4c6ca82f4e38ebbedbd86`.

The local static book and `source/build/site` have been synced to that verified build. No source has been pushed or public site published by this task.
