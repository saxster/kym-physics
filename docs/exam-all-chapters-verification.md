# All-chapter exam preparation: implementation and verification

30 October 2026. All sixteen chapters now have preparation banks. The narrative chapter and story source files remain unchanged. Preparation links are inserted by the builder.

## Delivered coverage

507 original questions, 97 objectives, 104 revision cards and 32 chapter practice papers. A cumulative bank assembles 279 of the reviewed questions without changing their prompts or answers, and adds two mixed practice papers. A multi-session study plan connects chapters and spaced reviews. Timings and marking are original practice guidance, not an official school paper specification.

| Chapter | Objectives | Questions | Revision cards | Papers |
|---|---:|---:|---:|---:|
| 0. The physicist's way of seeing | 5 | 32 | 6 | 2 |
| 1. Motion | 8 | 42 | 10 | 2 |
| 2. Why things keep moving | 5 | 30 | 5 | 2 |
| 3. Forces come in pairs | 8 | 45 | 10 | 2 |
| 4. Falling | 5 | 30 | 5 | 2 |
| 5. Gravity and orbits | 6 | 34 | 6 | 2 |
| 6. Pressure, floating and the ocean of air | 5 | 30 | 5 | 2 |
| 7. Energy | 6 | 38 | 8 | 2 |
| 8. Heat and temperature | 6 | 28 | 6 | 2 |
| 9. Vibrations, waves and sound | 7 | 30 | 7 | 2 |
| 10. Light and seeing | 6 | 28 | 6 | 2 |
| 11. Colour, and what light really is | 6 | 28 | 6 | 2 |
| 12. Charge and circuits | 6 | 28 | 6 | 2 |
| 13. Magnetism and electromagnetism | 6 | 28 | 6 | 2 |
| 14. Earth, Moon and Sun | 5 | 26 | 5 | 2 |
| 15. Atoms, stars and the universe | 7 | 30 | 7 | 2 |

Every numbered book section has a teaching link from at least one practice question. Every objective has at least two independent/changed-context questions. Every chapter contains recall, worked, guided, independent, transfer, delayed-review and paper questions. Scope remains selectable against the actual school topic list.

## Integrity review

A fresh reviewer read all 239 new first-half questions and 45 cards, recalculated all 58 numerical entries, checked embedded calculations and reviewed the additional standard-form, weight, moments, stability, work and potential-energy content. A separate cross-review read all 226 second-half questions and 49 cards, independently recalculated 28 numerical entries and checked embedded calculations, assumptions and safe practical wording. The motion pilot already had independent review of its 42 questions and 18 numerical entries. Together these cover all 104 numerical-entry answers and every model answer/card in the expanded book.

Corrections include circular-motion constant-speed assumptions, G versus g, explicit thermal-state assumptions, charge definitions, Doppler velocities relative to the medium, marking points aligned with requested explanations, sensible numerical precision and proper torque/stability source links. Grounding and arithmetic audit notes are in `source/grounding/exam-chNN.md`.

## Scalable offline implementation

The main book retains its motion pilot and adds the all-chapter directory. Seventeen separate HTML pages carry all sixteen banks and mixed review, reusing the book's typography and the preparation engine. Pages, fonts and runtime assets are precached. Each HTML document retains the 4 MiB limit. The self-contained single-file edition retains its motion preparation and explains that the website edition contains the complete banks; it does not link to absent companion pages.

Existing motion storage remains `exam:motion`. New chapter and mixed records use separate validated keys and are included in notebook backups. Opening an exact question example on a revision card records solution exposure; concealed card text stays out of search snippets. Generic printing records exposed answers. Previously seen questions cannot establish new independent evidence when reused in mixed practice.

Independent code review found and led to correction of the old single-page service worker's navigation cache: every page now caches and falls back to its own request URL. Tests check actual chapter identities offline and return to the intact main book, rather than just checking that a generic preparation heading exists.

## Local verification

`./source/check-reader.sh` is the single local release command. It includes the original reader checks plus `source/tests/test_exam_rollout.py` for complete catalog coverage, unchanged cumulative answers, unique/resolving generated links, offline manifest entries, page budgets, all sixteen answer/mark/reload journeys, mobile/desktop layouts, all seventeen backup keys restored in a fresh browser, revision-card/print exposure and correct offline chapter navigation.

**Final release result: PASS.** The complete `./source/check-reader.sh` local release command finished with exit status 0: the original reader, experiments, read-aloud, lesson integration, 756 lesson/viewport/theme cases, every live figure/explorer and offline reload all passed. No relevant console errors were reported; the existing runner separately identifies headless software-GL performance notes.

The final build also passed the complete all-chapter browser/catalog/link/offline suite again after the last objective-label, unit-input, source-credit and contextual-navigation refinements. This checks every chapter at mobile and desktop widths, preserves/restores all 17 records on a fresh browser, records revision-card/print exposure, verifies actual offline chapter identities and returns to the intact offline main book. The exam toolbar opens practice for the chapter being read. All 16 chapter pages also booted and laid out correctly in WebKit, with mark/reload checks on representative chapters. The original full motion browser journey passed its 18 width/theme combinations. All 12 learning-rule tests and all 5 legacy catalog tests pass. The single-file motion edition was checked for absent companion-page links.

The published-folder files and preview are byte-identical to the verified final build for every offline manifest entry. Package metadata: {"index_bytes": 4150981, "budget_bytes": 4194304, "offline_entries": 93, "prepared_html_pages": 17, "index_sha256": "880982a37960d4b725696aba821426a92cfa1a5427ea29b825937505d64b0433", "cache_version": "mw-aef65c263925"}. All 17 generated preparation pages stay below 4 MiB, as does the main book. Separate preparation pages retain source credits and the book's license. Receipts, screenshots, test PDFs and the package manifest are in the ignored `source/build/exam-rollout/` and `source/build/exam-checks/` folders.

 School-specific paper calibration and a student/teacher trial remain human validation activities; no examination grade is inferred from software checks. No hosted CI, source push or public deployment is performed.
