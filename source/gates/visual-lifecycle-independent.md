# Independent lifecycle correction review

29 October 2026, 04:59 UTC. Scope: E01/E02 shared engine correction following long-session WebKit context-limit failures. Inspected `live/core.js`, `live/three_kit.js`, shared lab mounts and the installed Three r180 resource lifecycle implementation. Tested the actual public book in `build/pool-site` (**mw-baba2832c5f5**). No physics changes were reviewed or made in this pass.

**Initial gate: changes required.** The proposed Three renderer pool addresses the repeated WebGL2 allocation mechanism and its 60-scene WebKit receipt records two created contexts with no errors, but three independent gaps were found. Root received all findings immediately; two have already been corrected in source while this review was running. They require rebuilt regression evidence, and the remaining raw shader gap still prevents full lifecycle closure.

| Finding | Evidence | Status at this review |
|---|---|---|
| L1 — Instanced object GPU buffers were not disposed | `clearGroup` originally disposed geometry/material/textures only. Installed `three/src/renderers/webgl/WebGLObjects.js` releases instanceMatrix/instanceColor only from `InstancedMesh`'s dispose event; geometry disposal does not own these object attributes. Many waves particle scenes create them. | Root source now collects owned `isInstancedMesh` objects and calls `mesh.dispose()` once. Source fix is correct; add/check createBuffer/deleteBuffer or equivalent object-disposal evidence across repeated particle scenes. |
| L2 — Older pending figure can close newer chosen figure | Real Chromium reproduction: preload/close `w10-eye`; hold the mechanics entry request; click `m-horizon`; open the newer `w10-eye`; release the old request. Actual result was `newer_eye_open:0, older_horizon_open:1, visible_3d:0`: the older request acquired the pool, closed the newer scene and opened in a hidden chapter. Per-figure generation alone cannot order requests across figures. | Root source now stamps a global `liveRequestSequence` before awaiting and rejects stale orders before factory activation. This correctly addresses the demonstrated race. Rebuild and rerun delayed-A/newer-B; also ensure old opener labels/enabled state recover. Reproducer: `/tmp/kym-pool-order-review.py`. |
| L3 — Existing raw shader widgets still exhaust WebKit contexts | Real WebKit reproduction opened/closed the original `ripple` widget 35 times. Console recorded 20 pairs of “too many active WebGL contexts … oldest context will be lost” and `INVALID_OPERATION: loseContext: context already lost`. `api.gl` still creates a new WebGL1 context per open and loses it on close; WebKit retains those lost contexts until GC. This can also evict the pooled Three renderer. | OPEN. Bound/reuse the raw shader canvas/context, or demonstrate another safe approach with long-session evidence. Include both retained ripple/skycolour and Three lessons in the public lifecycle test. A claim of at most two total contexts is invalid for a session including the current raw shader widgets. Reproducer: `/tmp/kym-rawgl-review.py`. |

## Positive checks and API review

- Pool acquire resets Three's tracked GL state, render target, clipping, scissor, clear behaviour and colour; the actual current scene implementations do not mutate other renderer settings. Fresh scene/camera/light/root construction and the existing shader geometry leave no evident cross-scene physical state in the renderer.
- `releaseRenderer` clears render lists, detaches the canvas and shrinks its drawing buffer. Group cleanup deduplicates owned geometries/materials/textures, while cached shared primitive resources remain explicitly shared. The new InstancedMesh disposal closes the missing object-level resource category.
- Context-loss cleanup removes the lesson's old event handler and retires a lost renderer rather than handing it back to the idle pool. Old ResizeObserver/theme observers are disconnected through the lesson cleanup path. No additional confirmed regression was found in those paths.
- Root's public lifecycle test meaningfully covers 60 serial 3D openings with and without explicit closes, different themes, nonempty reused scenes, entry-module retry and cancellation after returning to a story. Its context allocation monitor is an appropriate public observation, but its five-scene sequence omitted the raw WebGL1 shader surface.
- Independently injected a transient **shared dependency** failure, not only an entry failure: first `chunk-XUAL2ZCV.js` fetch aborted, second succeeded after a normal public opener retry; the lesson then opened. Actual Chromium result: two dependency requests, one lesson title, no remaining failure message. No sticky dependency-cache problem was demonstrated.
- Browser module retry receives a cache-busted entry URL after failure. The existing per-figure generation guard correctly prevents a returned/cancelled story import from creating a stage later; L2 concerns a distinct cross-figure ordering case.

## Required closure evidence

After L3 and the two source corrections are built, retain a receipt that alternates raw shader widgets, instanced particle scenes and ordinary Three scenes across enough openings to exceed WebKit's previous threshold. Assert bounded successful context allocations, no context-limit/GL/page errors, at most the intended active render surfaces, painted reused canvases, explicit release of object-level instance buffers, and delayed-old/newer-open ordering. Then rerun the planned full WebKit and Chromium render regression matrix. This independent review does not claim those later runs have happened.

## Correction closure — candidate mw-94dd009adc76

Independently reread the actual corrected `clearGroup`, request-order guard, raw WebGL pool and `api.gl` implementation. **L1, L2 and L3 PASS.** The raw pool retires genuinely lost contexts, reuses healthy contexts, detaches per-lease listeners, releases capture, disposes partial and completed shaders/programs/buffers, unbinds/reset state, and guards calls after lease release. The actual renderer's object-level disposal now includes owned InstancedMesh resources.

Independent reproductions and receipts:

- Reran the exact delayed-mechanics/newer-eye public-book reproduction: `newer_eye_open:1, older_horizon_open:0, visible_3d:1`. The newest chosen scene remains active.
- Reran the exact original-ripple 35-open WebKit reproduction: **no console/page errors**, replacing the previous 20 context-limit/error pairs.
- Reran `node source/tests/test_rawgl_pool.mjs`: **PASS** for 60 loans/one context, listener/resource cleanup, partial shader/link/buffer failure recovery and loss fallback retaining clock/uniforms.
- Independently ran the expanded **98 mixed Three/raw shader public-book session in WebKit**, writing an isolated receipt at `source/build/labs-lifecycle-independent-webkit/receipt.json`. **98 steps, maximum three created contexts, zero errors**, owned GPU buffer/program and pointer-listener checks passed; actual raw-context-loss 2D fallback and control checks passed; retry, story cancellation and cross-figure supersession passed. This independent run used the latest test including real context loss, not the older pre-loss version. Root's Chromium/WebKit receipts remain separate corroborating evidence.

### L4 — New fallback canvas loses canvas-specific interaction

**OPEN, reported to root immediately.** Real loss now replaces the raw canvas with a fresh 2D fallback, but widget pointer handlers were attached once to the old canvas. `releaseRawGL` correctly removes them; `mountFallback` does not bind them to the replacement. Thus the sliders keep working, while ripple tap/long-press and sky drag stop working after an actual context loss. The ripple widget also captures its initial `cv` in its coordinate function, so blindly moving old callbacks would still use a detached canvas's bounds.

Independent real-WebKit reproduction `/tmp/kym-rawgl-loss-pointer-review.py`: open ripple paused, force `WEBGL_lose_context`, await the new calculated tank, click the tank at (100,100). The fallback is confirmed 2D but its rendered image does not change. Source inspection confirms no replacement-canvas handlers are installed. The new public loss test changes Rhythm only and therefore does not exercise this missing interaction.

Fix by giving raw widgets a replacement-surface notification/binding callback, or equivalent explicit binding that uses the **current** canvas for coordinates and pointer capture, and reinstall the ripple/sky interactions on the 2D fallback without leaving listeners on a pooled old surface. Add actual post-loss tap/long-press/drag checks. This residual does not invalidate bounded pooling or L1–L3 closure; it prevents claiming the complete context-loss interaction lifecycle is preserved.

## Final independent L4 closure — 29 October 2026, 05:14 UTC

**PASS: L1–L4 are closed. No remaining blocking E01/E02 lifecycle issue was found in this review.** Final main build independently served: **mw-5539b5376f34**. This supersedes L4's OPEN status above while preserving the original finding and reproducer.

I reviewed the actual `gl.onCanvasChange` API and both widget bindings. Subscription immediately supplies the active surface, fallback supplies the replacement, close supplies null, and the subscription can be removed. Ripple and sky unbind the old surface before binding the new one. Coordinates and pointer capture belong to the callback's current canvas, rather than a previously captured detached canvas. Both bindings remove their event handlers and release capture; ripple additionally clears the pending long-press timer and gesture state on replacement, cancellation and cleanup. Close notification and subsequent widget cleanup are idempotent in the actual call order.

Independently repeated the former pointer-loss reproduction on the final build and extended it to **both WebKit and Chromium**: force actual GPU loss, confirm the new 2D fallback, then require changed canvas PNGs after ripple tap, 500 ms ripple long-press and sky drag. **All six gesture checks passed with no page errors.** Isolated independent receipt and images: `source/build/lifecycle-independent-gestures/receipt.json`, `webkit-ripple-tap.png`, `webkit-ripple-longpress.png`, `webkit-sky-drag.png`, and equivalent Chromium files. Reran `node source/tests/test_rawgl_pool.mjs`: both the 60-loan/resource/error/loss suite and the new subscription/transfer/initial-no-WebGL gesture suite pass.

Root's separately retained `labs-lifecycle-webkit/receipt.json` and `labs-lifecycle-chromium/receipt.json` each now record 98 mixed openings, zero errors, and all three `rawContextLossGestures`; these corroborate the earlier independent long-session pool/disposal checks. The whole-book rendering matrix remains a separate integration gate.

Final reviewed source SHA-256 values:

| File | SHA-256 |
|---|---|
| `source/live/core.js` | `24aa1573e4393ef357a7a5d1722893f3183f2b34608f55df63aaf235380f7b03` |
| `source/live/w_ripple.js` | `18f988e0496f2776104805c71a26edf0e84d56bdf59d8175e6263e98f68aec7c` |
| `source/live/w_skycolour.js` | `9cdc446b79a24b653e415d5a3394dd9491f628ca687e3c85952b02bef6a102d1` |
