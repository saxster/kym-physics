# Living physics publication

Authorised 29 October 2026: commit all completed implementation changes, publish the textbook, then verify the new demonstrations on the live site at mobile and desktop sizes.

## Release contract

- Target: `https://saxster.github.io/kym-physics/`, GitHub Pages legacy deployment from `saxster/kym-physics`, branch `main`, repository root.
- Previous published revision: `a0de52b221115721918319ebc6c9a3afb971a922`; previous service-worker cache: `mw-ab72a1cf8616`.
- The fetched live index exactly matched that revision before publication (SHA-256 `87249f50b69f12723ea535449e6675399cffb87c275482fdfbe6e2b54181c586`). No direct live edits needed porting.
- Candidate: the exact existing build verified in `threejs-verification.json`, cache `mw-5539b5376f34`; index SHA-256 `66496ef4fb739221dfadb89840f1ec7e7d5dfb69cd45d9e487a96e83022b9dde`. Copy this build rather than regenerating fonts and changing the tested edition.
- Keep older hashed chunks available for readers who still have the previous page open. New service-worker precaching uses the new build's complete file list.
- Live verification: every new lesson at 390 and 1440 px in Chromium and WebKit; Chromium theme matrix; representative forced fallback; old-reader cache upgrade, exact cached asset hashes, offline new lesson, notebook/story/print integration, and retained demonstrations/explorers.
- Browser tests use isolated profiles and emulated mobile devices. Physical-device frame rate, battery/thermal behaviour, sensor calibration and human learning outcomes are not certified.

## Rollback readiness

The previous complete website and source remain in `a0de52b`. If the release produces a confirmed blocking problem, revert the implementation/publication commit on `main` and push normally; do not force-reset history. Check that Pages reports the resulting revision, that the previous index is served and that cache `mw-ab72a1cf8616` activates again. Notebook data remains local and is not deleted by publication or rollback.

## Results

Publication and live verification are in progress. This section will be replaced with the actual deployment revision, checks and evidence after completion.
