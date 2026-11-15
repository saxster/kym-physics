# Discovery reader integration review

Bounded independent review of the new discovery reader, notebook integration and record boundary. Subject-model correctness was excluded. Inspection and small Node reproductions only; no browser jobs, builds, broad suites, code changes or hosted verification. Findings below describe the reviewed candidate before correction.

## Required corrections

1. **P2 — Audio feedback reveals a concealed Challenge answer.** `source/app/x_discovery.js:78–81` keeps the sound action enabled and always prints its numerical frequency. In `doppler-train`, the Challenge asks the learner to estimate the received frequency and hides that reading, while the default sound selection is the received tone. A no-browser mount witness using the actual Doppler model at seed 1, with drawing/audio device stubs, entered Challenge and pressed “Hear this frequency”: the concealed answer was `297.0368116823852`, and feedback was `A short 297.0368 Hz tone.` Suppress the numerical frequency while the Challenge is concealed, or disable that action until reveal. Check the state again after asynchronous resume before printing feedback.

2. **P2 — Malformed restored finding text can break notebook rendering/export.** `source/live/discovery_records.mjs` validates the finding title but spreads unchecked `prediction`, `claim`, `summary`, `limits`, reading units and plot axis labels into its normalized result. Small JSON witness: `{"title":"Restored model","source":"model","prediction":{"toString":null}}`. `findings([raw])` accepts one finding; `findingMarkdown(raw)` throws `TypeError: Cannot convert object to primitive value`. The notebook also interpolates prediction/claim, so such a restored `lab:<lesson>.findings` entry prevents the whole notebook from opening. Normalize every textual field before consumption. A second same-boundary witness retained 150,000 valid finite points: `plotBounds({points:Array.from({length:150000},(_,i)=>[i,1])})` throws `RangeError: Maximum call stack size exceeded` because extrema use argument spreading. Compute extrema iteratively so a larger restored graph cannot disable the notebook.

3. **P2 — A queued details toggle can mount after lesson cleanup.** `source/app/x_discovery.js:146` mounts an open activity without checking connection or the lesson's cleanup state. `api.onCleanup` merely appends callbacks (`source/live/core.js:430`); `closeLive` executes them once before removing the stage (`:1202`). A pending details toggle can therefore run after removal and install its MutationObserver too late to be cleaned up. A no-browser lifecycle witness used the actual `offer`/`mount` functions, set the detail open, ran the API cleanup list, detached the stage, then delivered the queued toggle. Result: `lateCleanupRegistrations: 1`, `liveObserversAfterClose: 1`, `detached: true`. That observer retains and redraws the detached activity on subsequent theme changes. Guard mounting with a closed flag and `detail.isConnected`, remove/abort the toggle listener on cleanup, and guard the queued scroll callback too.

No confirmed loss of existing lab notes or findings was observed in ordinary writes: both the original lab journal write and the discovery write merge the current lesson record. No browser/device coverage is claimed by this review.

## Correction recheck

All three reported findings are resolved in the corrected source. Narrow Node rechecks confirmed:

- Unrevealed Doppler Challenge sound feedback omits the numerical answer.
- An old tone's end callback cannot close the replacement tone; resolving resume after lesson close creates no oscillator and retains no observer.
- A queued toggle delivered after stage cleanup/detachment installs no observer.
- The malformed prose witness exports safely. Iterative plot bounds preserve all 150,000 points' extrema, and Markdown export retains the final `149999, 74999.5` row. The follow-up check first caught argument spreading in Markdown row appending; that path is now iterative too.

These are source/pure-boundary checks with minimal DOM and audio stubs, not browser or real-device verification. No additional review findings remain from the bounded cases above. No build, browser job or broad suite was run during correction review, including while host disk capacity was constrained.
