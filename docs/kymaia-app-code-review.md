# Independent app code review — Kymaia reader improvements

30 October 2026. Read the settled app/build diff and the new reader-journey test using the code-review-and-quality skill’s correctness, readability, architecture, security and performance axes. This review is independent of the implementation. Book-content checks are recorded separately.

## Resolved finding

The new `details` containers for optional review and school explanations cause an existing read-aloud filter to skip them even when the reader deliberately opens them. `source/app/m_readaloud.js` includes all `details` in `SKIP` and rejects any paragraph whose ancestor matches it. These explanations were previously a `section` or `div`, so the markup change removes their read-aloud support. The implementer corrected the filter: closed disclosures and generic answer/spoiler details remain excluded, while opened review, school and deliberate deeper-reading disclosures are collected. Paragraphs nested in definition answers are no longer double-counted. The focused runtime check below confirms the correction.

## Reviewed behavior

- Front-matter units now route separately while preserving stable existing anchor IDs. Navigation still uses the existing history router; deep links and notebook jumps unfold disclosure ancestors before scrolling. Existing chapter/lesson record keys are unchanged.
- Prediction choice and answer reveal are separate actions. The persisted `seen` state determines reveal visibility, and changing a guess returns focus to the first choice. Old records remain readable.
- Experiment search creates an anchor through the app’s existing lesson-opening handler. IDs and targets come from the built catalog, not raw query text. Search display text retains its existing escaping. No new external-message, credential or user-data flow was introduced.
- Equation details are offered only for known explanations. Closing them restores focus to their toggle. Investigation empty filters have an explicit reset and return focus to the object selector. Lesson opening focuses its heading and aligns the newly mounted figure.
- Folded typography uses the book’s existing tokens and native controls. Toolbar visibility no longer depends on scroll-direction timing.
- Site font assets are derived from font bytes, named with a hash, registered in the same build-size list used to generate the offline manifest, and included in the service-worker content hash. Relative URLs retain GitHub Pages subdirectory compatibility. The single-file branch retains embedded data URLs. No dependency or lockfile changes are part of this app diff.

## Verification evidence and limits

Read `source/tests/test_reader_journey.py`: it checks the first-visit route, separate letter, quiet default, directory recovery, initial lesson alignment, return path, explicit/persisted prediction reveal, keyboard focus, review deep links, experiment search, five widths and three themes. It records browser errors and screenshots. Its initial implementation did not cover print content or read-aloud collection; those are the two additional boundaries checked here.

A focused independent Chromium check loaded the current site from a temporary local server, observed eleven font faces loaded, waited for service-worker control, reloaded, switched the context offline and successfully reloaded again with eleven faces loaded. Static inspection confirmed every referenced font asset exists and is in the service-worker manifest.

A print-media-only check found that `display:block` alone does not reveal the contents of a closed native `details` element in current Chromium: `::details-content` remains `content-visibility:hidden`. This initially looked like a print regression, but the existing `beforeprint` handler already opens all details during normal browser printing. The implementer added a print `::details-content` rule for the CSS-only/media-emulation fallback. This distinction matters: the media-only check did not prove that normal browser printing was broken. A latest-build print-media check now reports `::details-content` as visible and the closed contents child as visible. Dispatching `beforeprint` also confirms that all disclosures are opened.

No further required correctness, security, architecture or performance regressions were found in the reviewed diff. Physical hardware, voice quality and the reader’s understanding are outside this code-review claim.


## Final verdict and focused recheck

**Approve: no required regressions remain in the reviewed diff.**

On the latest rebuilt site, a focused synthetic speech-engine probe exercised the actual section-listen and next-sentence controls without producing sound or downloading a voice. With review and school notes closed, Section 4.1 collected 73 sentences. Opening those two explanations produced 90 sentences, and the first review answer appeared in the speech events. This establishes that the real collection path includes opened explanation content; it does not certify speech quality or hardware. The same probe confirmed the print-media CSS fallback and existing beforeprint expansion.

The added natural-voice first-use branch now offers the download before loading it, while an existing stored approval is retained. The existing device-voice alternative remains available. Final review covers this additional read-aloud diff as well as the original assigned files.

## Delivery follow-up

The root release check restored the original 4 MiB index budget by emitting hashed, precached font assets. The source credits now link to real case-file anchors, and a static build check covers all internal links, duplicate IDs, leaked authoring fences and offline font registration. The catalog smoke pass covers 126 lessons at 390 and 1440 px. Its original raster-only oracle falsely rejected six calculated readouts whose text is deliberately rendered as DOM labels; the revised narrow oracle and twelve targeted reruns verify those labels while retaining raster requirements for other lessons. Hidden-label and cleared-plot negative checks also fail as intended.
