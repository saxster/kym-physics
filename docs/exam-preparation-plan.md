# Exam preparation path: implementation plan

30 October 2026. Authorised outcome: implement all eight preparation recommendations as a complete motion pilot, preserving the existing story, then use the same reviewed structure for the remaining chapters. The pilot is Chapter 1, *Describing motion*. This plan distinguishes the implemented pilot from the subsequent whole-book content rollout.

The all-chapter implementation is recorded in [the current verification report](exam-all-chapters-verification.md): 507 questions across sixteen banks, plus mixed review and shared offline delivery. The chapter register below is now implemented; school-specific calibration and classroom trials remain validation steps.

## Product contract

The student can find a preparation path from the cover, contents and motion chapter; choose the objectives she needs; learn from a worked solution; complete progressively less supported questions; compare her own answer with explained mark points; retain her answer and corrections; return to weak material after a delay; practise with a timed or untimed paper; and print questions separately from solutions. The existing chapter paragraphs, stories, predictions and experiments remain intact.

The coverage checklist is a working motion map, not a claim of alignment with an unidentified school's Grade 8 paper. Her school syllabus and sample assessments remain the authority. All new questions and marking guidance are original. Marking is explicitly self-assessment against suggested guidance, not an official Cambridge score or an externally verified grade. Illustrative datasets must be identified. Timing is practice timing, not an asserted school examination format.

## Architecture and public test boundaries

- Content: a validated `source/exams/motion.json` with objectives, progressive questions, revision cards, command-word examples, two original papers and source links. Reuse the existing Chapter 1 grounding and original arithmetic.
- Build: `source/exam_prep.py` validates and renders semantic HTML, tables, graph SVGs, answer disclosures and revision material. `build.py` inserts the path as a normal book page and supplies the app's data. The static document remains useful without JavaScript.
- Learning rules: `source/app/exam_model.mjs` owns attempt validation, numeric checking, objective evidence and review dates. The interface owns DOM, draft persistence and paper timers. Store all exam state under `exam:motion` using the existing book storage boundary.
- Interface: `m_exam.js` progressively enhances the static questions. Scope, filters, hints, explicit answer commitment, marking, repeat attempts and persistent timing remain keyboard accessible. Use the existing typography and colour tokens.
- Integration: include exam state in existing notebook backups; provide readable Markdown export and separate question/answer/revision printing. Precache follows the existing generated book and app packaging; no new network dependency.
- Tests exercise the public learning-rule functions, catalog validation/build output, and the browser journey from entry through independent answer, marking, reload and delayed review. Browser tests also exercise hidden answers, paper deadlines, print isolation, broken storage, offline reload, deep links and mobile layouts. Expectations come from the learning contract and independently computed numbers.

## Ordered implementation slices

### 1. Specify learning evidence and review rules

Acceptance **E01**: a correct self-marked answer with help is distinguished from an independent answer; reading completion is never used as exam evidence. **E02**: repeated attempts on the same question/day cannot manufacture delayed success. **E03**: weak work returns the next day; successful reviews can move to 1, 3, 7, 14 and 30 day intervals. These are adjustable editorial defaults, not a claim of optimal intervals. Secure practice requires successful different questions on different days and a changed-context question.

Files: model and model tests. Verify known numeric conversions, partial/zero credit, malformed saved state, aided attempts, independent successes, changed contexts, calendar dates and expired timer arithmetic before using these rules in the interface.

### 2. Author and validate the complete motion content

Acceptance **E04**: every objective links to existing teaching and multiple independent/changed-context questions. **E05**: each question has a correct model answer, one explicit point per mark, acceptable equivalents, a common error and a repair link. **E06**: include worked, guided, independent, transfer and delayed-review questions, practical/data tasks and two different practice papers. **E07**: revision cards explain terms, examples, equations, units and confusions; memory cues are selective and scientifically faithful.

Files: content JSON, grounding note and catalog tests. Independently recompute numeric answers; reject duplicate IDs, invalid references, inconsistent marks, missing objectives, invalid graphs and incomplete paper specifications. Obtain a fresh independent physics/fidelity review before completion.

### 3. Ship the static preparation path

Acceptance **E08**: cover, contents, Chapter 1 and search reach the path. **E09**: without JavaScript, questions, graphical/data representations, worked answers, marking and revision cards remain readable through native disclosures. **E10**: all links resolve uniquely and the existing document stays below 4 MiB.

Files: renderer, builder, search and reader guide. Verify build integrity, fallback HTML and preserved Chapter 1 narrative.

### 4. Add answering and corrective feedback

Acceptance **E11**: independent answers remain concealed until a genuine response is committed; using hints records assistance. **E12**: mark points support partial credit, including zero, and clearly label self-marking. **E13**: answers, hints, marking and attempt history survive reload; retrying preserves earlier attempts. Numerical checks distinguish wrong units from wrong values and support sensible tolerances.

Files: interface and scoped CSS. Verify real answer → reveal → mark → save → reload and repair-link/deep-link journeys.

### 5. Add daily and spaced revision

Acceptance **E14**: objective selection, evidence labels, due dates and a manageable daily queue work together. **E15**: questions return in changed contexts; helped work and same-day repetition never inflate secure practice. Command words, maths checks and investigation reasoning are accessible from the preparation page.

Verify the browser with controlled dates and the model's independent time fixtures. Make scope and empty states explicit.

### 6. Add paper practice, print and portable records

Acceptance **E16**: timed practice persists its wall-clock deadline across reload, supports finishing early and handles expiry; untimed practice also works. **E17**: a questions-only print contains no model answers, hints, marking text or saved answers; answer sheets and a concise revision sheet can be printed separately. **E18**: Markdown export and existing notebook backup/restore retain exam work. Storage failure keeps the current session usable and gives an accurate persistence message.

Files: interface, CSS and notebook integration. Verify two paper forms, timing, print media, exported content and backup/restore through browser boundaries.

### 7. Review, validate and deliver locally

Acceptance **E19**: pass the documented local reader command, including focused catalog/model/browser checks. Review at 390, 820, 1024, 1180 and 1440 px in light, sepia and dark, plus a narrow 320 px check. Inspect representative screenshots, keyboard focus, browser errors, offline reload and the no-JavaScript fallback. **E20**: independently review the settled physics and consequential implementation; fix findings and rerun affected checks.

Use existing local Python/Node/Playwright dependencies. Browser plugin is not installed; the repository's local Playwright workflow is the available browser verification route. No GitHub Actions job is created, dispatched or used. Publishing and source pushes remain separate from local verification.

## Whole-book rollout after the pilot

1. Obtain the school's current topic list and representative papers; reconcile the working checklist with the actual course and identify the physics portion if science is integrated. A student/teacher trial is needed to validate usefulness and calibration; software checks cannot certify comprehension or guarantee marks.
2. Map remaining examinable objectives across forces/falling, gravity/pressure, energy/thermal physics, waves/light, circuits/magnetism and Earth/space. Preserve stories and explanations; add compact preparation links rather than replace the narrative.
3. For each chapter, author the same objective → example → guided → independent → transfer → delayed-review structure. Choose counts from coverage, not a universal quota. Independently review physics, arithmetic, accepted wording and practical safety.
4. Expand cumulative reviews to mix completed topics and generate term-length revision plans. Select mixed papers from the school's format and marks distribution only once those are known.
5. Repeat the same local checks for each content slice, then observe a student's independent attempts after a delay. Use the actual errors to improve hints, explanations and question selection.

### Chapter coverage register

This is an authoring register, not an asserted Grade 8 syllabus. Match each candidate objective to the school's topic list before identifying it as required for an exam. Each retained objective needs an explanation link, a worked/guided path where useful, at least two independent or changed-context questions, delayed retrieval and marking guidance. A calculation is included when it is meaningful for that objective, rather than added to meet a quota.

| Chapter | Candidate preparation content | Distinctive question and revision work | State |
|---|---|---|---|
| 0. The physicist's way of seeing | Measurement, units, scales, models, evidence and estimates | Read instruments; convert units; evaluate repeat readings and sensible precision; identify what an observation supports | Implemented |
| 1. Describing motion | Frames, distance/displacement, speed/velocity, conversions, graphs, acceleration, motion measurements and free fall | Eight objectives; 30 progressive tasks; two six-question papers; ten revision cards; timed/untimed practice and scheduled review | Implemented; preserved pilot |
| 2. Why things keep moving | Inertia, friction and unchanged motion | Explain unfamiliar motion; distinguish a force from continuing motion; compare evidence under changing friction | Implemented |
| 3. Forces come in pairs | Resultant forces, mass/weight, moments, stability, force pairs, springs and momentum | Force diagrams; identify the object acted on; proportional calculations; moment and load-extension data; distinguish balanced forces from a third-law pair | Implemented |
| 4. Falling | Air resistance, terminal motion, projectiles and turning | Interpret changes in motion/force diagrams; compare controlled drops; explain the limits of an idealised model | Implemented |
| 5. Gravity and orbits | Gravitational attraction, weight, orbits and apparent weightlessness | Explain satellite motion; reason about changes of distance; connect diagrams to stated assumptions and required numerical relationships | Implemented |
| 6. Pressure, floating and the ocean of air | Pressure, density, fluids and floating | Compatible units; force/area reasoning; interpret fluid diagrams and density data; plan a fair comparison | Implemented |
| 7. Energy | Stores/transfers, conservation, work, power and efficiency | Complete energy accounts; compare useful outputs; calculate with stated system boundaries; repair statements about energy being destroyed | Implemented |
| 8. Heat and temperature | Particle models, temperature, internal energy, transfer and changes of state | Explain mechanisms; interpret temperature-time data; compare insulating experiments; distinguish temperature from energy transfer | Implemented |
| 9. Vibrations, waves and sound | Oscillation, frequency, period, amplitude, wavelength and sound | Read traces and wave diagrams; connect representations; calculate with appropriate units; plan sound/oscillation measurements safely | Implemented |
| 10. Light and seeing | Rays, reflection, refraction, images, lenses and eyes | Draw and mark ray diagrams; use angles to the normal; explain image evidence and state the limits of ray models | Implemented |
| 11. Colour, and what light really is | Colour, dispersion and the electromagnetic spectrum | Compare transmitted/reflected light; interpret spectra and diagrams; use selective sequence cues with meaning and applications | Implemented |
| 12. Charge and circuits | Charge, current, potential difference, resistance and circuit representations | Draw circuits; locate instruments; interpret readings; distinguish current from energy transfer; use only safe low-voltage practical plans | Implemented |
| 13. Magnetism and electromagnetism | Fields, electromagnets and induction | Draw field patterns; compare changing variables; explain generator/motor evidence; pair any hand-rule cue with the actual physical directions | Implemented |
| 14. Earth, Moon and Sun | Rotation/orbits, phases, seasons, eclipses and tides | Read space diagrams from different viewpoints; interpret cycles and timings; separate scale drawings from illustrative models | Implemented |
| 15. Atoms, stars and the universe | The chapter's atomic and astronomical models, stellar evidence and the expanding universe | Relate observations to models; interpret spectra/scale data; distinguish what is inferred from what is directly observed | Implemented |

### Implementation dependencies for expansion

1. **School coverage before paper design.** Record the actual school objectives, examination date, paper format, permitted equipment and practical expectations. Build a school-specific selection from the authoring register; keep the broader narrative available.
2. **Packaging before adding another full bank to the main document.** The pilot keeps the index below the existing 4 MiB budget with limited room remaining. Remaining banks need separately generated, linked chapter preparation pages or offline-cached fragments, with a readable static fallback and all required assets in the offline manifest. Do not raise the document budget or silently drop content to fit it. Retain a small preparation directory in the main book; offer printable/downloadable preparation material separately where a single-file edition cannot carry the complete bank within its budget.
3. **Catalog and storage generalisation.** Generalise chapter-specific validation against the actual generated teaching anchors, register chapter catalogs explicitly, and use a separately normalised storage key per catalog. Extend backup ownership, review selection, export and progress migration through that registry. Test old motion backups before changing the saved-state format.
4. **Chapter-sized authoring slices.** Use the row above to author one complete chapter at a time. For every objective, record which question tests recall, explanation, calculation/diagram/data/enquiry as appropriate, and changed-context application. Have an independent reviewer check science, arithmetic, wording, marking and safety. Reuse the pilot browser journey for each registered chapter.
5. **Cumulative practice after multiple reviewed banks exist.** Add cross-chapter questions that require selecting a principle, and short reviews mixing earlier chapters. Generate distinct term papers from the actual school blueprint. Keep first answers, assistance and exposure to earlier solutions separate from self-marking dates and scores.
6. **Student trial before claiming educational outcomes.** Observe the student choosing a task, completing it unaided, using the feedback and attempting a fresh question after a delay. Record confusing wording and unhelpful hints. Measure independent performance rather than page completion or confidence alone. Teacher input is needed to calibrate original marking guidance to the school's expectations.

## Completion evidence

Implementation and verification status will be recorded in `docs/exam-preparation-verification.md`, with explicit limits for school-specific alignment, human classroom trials and public deployment. Do not mark an acceptance criterion complete from a plan, screenshot or code assertion alone.
