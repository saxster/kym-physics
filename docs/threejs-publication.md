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

## Results — complete

Published implementation commit **`d898711`** to `main`. GitHub Pages reported that exact revision as built. The live index and service worker match the previously verified build byte for byte. Subsequent verification-only edits change test runners and evidence; they do not change the deployed textbook bytes.

**All 109 new demonstrations passed at mobile (390 px) and desktop (1440 px) sizes in both browser engines.** Final completed lesson matrices recorded **1,090 passing cases and zero page/console errors**:

| Public-site matrix | Coverage | Passed |
|---|---|---:|
| Chromium | 109 lessons × two widths × light/sepia/dark | 654 |
| WebKit | 109 lessons × two widths × sepia | 218 |
| Chromium without WebGL | 109 lessons × two widths × sepia | 218 |

The tests open each experiment paused, manipulate an input, check calculated drawings/readouts, play/pause, change theme, inspect full-size drawings, check overflow and restore focus on close. Chromium's final matrix keeps one isolated device context across theme pages; mobile and desktop remain separate contexts. Each page's actual live navigation bytes and the service worker are checked against the expected build. WebKit's completed run used the initial committed remote runner and fresh sessions. Earlier exhaustive local controls/physics checks remain applicable because the textbook source and compiled build did not change.

The live integration run passed original/alternative preservation, local prediction/explanation persistence, Markdown export, JSON backup and actual restore, story return/focus, story-specific presets, finite optional audio, camera controls, a synthetic Three.js context-loss event, repeated opening, offline new-lesson opening and print stills.

The delivery/health run compared **all 62 actual service-worker cache entries** with local SHA-256 values, verified old-cache removal, then opened a new photoelectric lesson offline. It also passed **20 live retained-demo/explorer cases**: cannon, eye, field, Moon phases, ripple, sky colour, circuit, and the scale/sky/spectrum explorers at both widths. Three previous-edition module URLs were separately checked as HTTP 200, supporting the retained-asset transition for older open pages.

### Interrupted attempts and corrections

The actual previous live edition and its service-worker cache were observed before pushing. The first upgrade attempt reached the exact new page and service-worker bytes but stopped while hashing a cache that had not finished installing. The test had used an async `wait_for_function` predicate; an independent installed-Playwright reproduction showed `async()=>false` returning immediately rather than polling. Explicit polling of resolved values fixed the harness. The completed upgrade/cleanup check uses a **controlled old-cache fixture from the actual prepublication index**, followed by the real live worker's installation. It is not represented as a repeated preserved prepublication browser session.

A notebook-restore test's fixed sleep raced the scheduled reload on the live network. The test now explicitly awaits the public action's real navigation and application readiness. Some concurrent fresh-session runs hit 180-second index-loading timeouts. The final Chromium matrix removes duplicate index downloads and checks actual App readiness while the offline worker fetches resources; exact byte checks and all lesson assertions remain. Interrupted attempts are retained separately and are not counted as completed passing matrices. No textbook source/build change was required for these harness corrections.

### Evidence and reproduction

The durable [publication manifest](threejs-publication.json) records release/deployment identity, complete passing case counts and lesson IDs, receipt hashes, all 62 cached-file hashes, reproduction-runner hashes, source identity, interrupted attempts and evidence boundaries. Raw screenshots, receipts and logs remain under `source/build/publish/browser-trail/` (generated and Git-ignored). Actual live mobile motor/eye pictures and desktop motor/eye pictures were visually inspected alongside the automated results.

From the repository root:

```sh
.venv/bin/python source/tests/test_labs_browser.py --url https://saxster.github.io/kym-physics/ --themes light,sepia,dark --widths 390,1440 --smoke --out build/publish/browser-trail/chromium-final
.venv/bin/python source/tests/test_labs_browser.py --url https://saxster.github.io/kym-physics/ --engine webkit --themes sepia --widths 390,1440 --smoke --out build/publish/browser-trail/webkit
.venv/bin/python source/tests/test_labs_browser.py --url https://saxster.github.io/kym-physics/ --themes sepia --widths 390,1440 --fallback --smoke --out build/publish/browser-trail/fallback-final
.venv/bin/python source/tests/test_labs_integration.py --url https://saxster.github.io/kym-physics/ --out build/publish/browser-trail/integration-release
.venv/bin/python source/tests/test_live_publication.py
```

The optional old-cache replay uses `--old-cache mw-ab72a1cf8616 --replay-old-cache <saved-previous-index>`. Before a future release, `--wait-for-publish` can instead preserve a real live old-reader session across the push. The remote runner was also checked to reject a mismatched expected edition before interacting with lessons.

Mobile tests use browser emulation. Physical-phone GPU/frame-rate, battery/thermal and sensor behaviour, and human learning outcomes remain outside the verified scope.
