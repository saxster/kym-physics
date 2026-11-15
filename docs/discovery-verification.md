# Discovery activities: implementation and local evidence

All 32 accepted recommendations are implemented as 22 optional investigations, a statement trail and shared reader capabilities. The [original recommendations](drjones-apps-recommendations.md) give the reasons. The [acceptance register](discovery-implementation-plan.md) names the adaptations; [discovery-coverage.json](discovery-coverage.json) maps every numbered idea to its implementation.

Open **Investigations → Choose a new investigation** to browse by purpose. Each route opens the relevant existing lesson. The activities also appear as folded additions within those lessons.

## What changed

The activities reuse the book's models, drawing helpers, lesson identities, notebook and paper/ink themes. Examples include a Mumbai local-train journey, pencil measurements, cardboard suspension, a katori/object density problem, useful sensor circuits and astronomical evidence. Explore, Investigate and Challenge provide different amounts of guidance on the same model. Controls, graphs, model limits and sources remain together; larger drawings and keyboard controls provide another route through small phone diagrams.

Retained runs compare settings and traces. A notebook finding freezes the prediction, settings, readings, graph and claim rather than changing with subsequent slider movement. Seeded cases can be reopened, paper experiment sheets can be saved, and notebook findings join the existing Markdown export and JSON backup/restore. Audio requires a click; no microphone or sensor is requested by these activities. Virtual apparatus is explicitly distinguished from safe household investigations.

## Candidate

- Branch: `codex/discovery-investigations`; application candidate through `2177719`, local gate integration through `607c2de`, test-server keep-alive correction through `c3f89f5`.
- Main page after the contrast correction: 4,193,346 bytes, **958 bytes below** the existing 4 MiB limit. SHA-256: `cadc88a8cb5852d4d078043e75e91649adae58a85540fea6f0b6eb590b347563`.
- Lazy discovery chunk: `live/x_discovery-PCAPADOW.js`, 107,310 bytes, below 150 KiB. SHA-256: `7eafac3f1091529d45212961148d3af839e755ac00bb874a691eecfb9b103515`.
- Service-worker cache: `mw-5a61f77c92a1`. Built output is local under `source/build/site`; it has not been published.

## Verification

The final activity matrix **passed all 345 cases**, with **zero failed requests, page errors or console errors**. It covers all 23 entries at 390, 820, 1024, 1180 and 1440 px, in light, dark and sepia, with 690 default/changed screenshots. Receipt: `source/build/discovery-matrix-final/receipt.json`; log: `source/build/discovery-matrix-final/log.txt`. [Machine-readable evidence](discovery-verification.json) records source/build hashes, receipts, failed attempts and final results.

| Local check | Actual result |
| --- | --- |
| `./source/check-reader.sh` | Exit 0; run once on the pre-contrast candidate |
| Models and records within that gate | 51 Node checks; includes mechanics' 464 seeded boundary/drawing cases, fields' 269 cases, seven waves tests, six record tests and two coverage-contract tests |
| Existing reader coverage | Catalogue, figure/physics, build, reader/exam journeys, optional read-aloud, original notebook/export/backup/offline and lesson integration checks passed |
| Existing rendered lessons | 756 lesson/viewport/theme cases passed |
| Companion spread and live figures | Spread checks passed; 102 live figures and three explorers opened, no console errors, offline reload passed |
| Discovery notebook journey | Retained run, immutable finding, original-note preservation, solved/concealed train challenge, case 42, paper sheet, Markdown export, fresh-context JSON restore, draft reload, opt-in Doppler tone/closure and offline exoplanet activity passed |
| Final build after the contrast correction | Four build checks passed; page/chunk budgets passed |
| Contrast correction | Red reproduction at 1.19:1; all 15 corrected trail width/theme cases passed, minimum 5.68:1 |
| Final activity matrix | 345/345 passed; 690 screenshots; zero request/page/console errors |

The full reader gate tested index SHA-256 `ff3459a0efc56bdf41930b76e1e9861050fe24f3b57d069fb4f194f4db24f0bb`. Its log is retained at `source/build/discovery-reader-gate.log`; the discovery journey receipt is `source/build/reader-discovery/receipt.json`. The only subsequent application change sets the foreground colour of selected statement-trail buttons. Unaffected gate evidence was reused. The four build checks, 15 trail cases and final 345-case matrix tested the corrected candidate; the full reader gate was not repeated. Final build log: `source/build/discovery-contrast-build.log`.

### Corrections and failed attempts

Image review found selected statement-trail text at **1.19:1 contrast** in sepia. A focused rendered regression reproduced that failure before the CSS change. Pairing its selected background with the theme's ink colour raised the minimum across all themes to **5.68:1**. The regression composites the actual ancestor backgrounds, including the translucent highlight. Red/green receipts: `source/build/discovery-trail-contrast-{red,fixed}/receipt.json`.

The initial matrix completed 345 interaction/layout cases but failed its console gate on one unattributed `ERR_CONNECTION_RESET`. The user approved one instrumented rerun. That attempt stopped before any activity case and captured a reset on a local font during the first directory load. A bounded startup-only trace reproduced the reset on a different font at startup 14: OS error 54 during TCP connection establishment, before any HTTP response or font decoding. The inspected font was valid and matched its filename hash. Queue experiments were inconclusive; no queue change was applied.

A controlled protocol comparison served the same 125 requests using **125 new TCP connections with HTTP/1.0**, versus **six persistent connections with HTTP/1.1**. Both loaded the requested fonts and completed the offline worker. The test handler now uses HTTP/1.1 keep-alive. Fifteen fresh startup checks then passed with all 12 requested font faces loaded, worker ready, and no errors. The approved 345 activity cases continued under that corrected harness and passed. No delay, retry, timeout increase or error exclusion was added. The OS's intermittent reset itself is not claimed forensically explained.

Original receipts remain under `source/build/discovery-matrix/` and `source/build/discovery-matrix-instrumented/`. Diagnostics, including the original Chromium network trace, are retained under `source/build/discovery-network/`.

## Independent reviews and limits

The [physics review](discovery-physics-gate.md), [learner/safety/provenance review](discovery-learner-gate.md) and [reader integration review](discovery-integration-review.md) preserve the original counterexamples and correction rechecks. Corrections cover series-circuit resistance, reversed magnetic-field drawings, signed displacement, concealed challenge plots/audio feedback, wavelength precision, backup text normalization, large graph export and cleanup after queued UI/audio callbacks.

Image review confirmed the visible transit dip and explicit close-up caption (closing learner finding B4), and the reversed magnetic arrow/pole labels. Default and changed drawings/plots for all 22 investigations were reviewed in sepia at 390 px and dark at 1440 px; the corrected trail was inspected separately and in the desktop contact sheet. Representative activity groups were also reviewed at 820 px/light, 1024 px/sepia and 1180 px/dark. These are human visual samples alongside the automated full matrix, not a claim that every one of its 690 screenshots was individually read. Contact sheets reuse the saved screenshots under `source/build/discovery-matrix/visual-review-final/`. Some full-element captures include the reader's fixed toolbar; paired changed-state captures also show those diagram areas.

The source review's optional refinements are recorded rather than treated as failed numerical checks: a sensor resistance table, a fuller wave-opening explanation and a definition of the static field reading through a test mass/charge. The projectile's unreachable-target hint and explicit NIST component references have already been added.

No test with Kym, measured learning outcome, physical apparatus trial, Safari/Firefox campaign or native iOS verification is claimed. The Foucault historical account retains its disclosed historian-source limitation. Future edits must respect the main page's small remaining byte budget. Existing Node module-type warnings are not suppressed. No hosted CI, source push, remote merge or publication was used.
