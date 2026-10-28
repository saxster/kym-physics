# Powers of Ten: implementation audit

Audited the published release `93c7d4a` against the complete approved eight-part implementation plan on 29 October 2026. Kept the published illustrations, typography, paper palette, jar geometry, colours, hatches, and control layout. The accounting request was interpreted using the book's existing energy-ledger and heat/payment examples, following the user's instruction to use best judgement.

## Plan coverage and repairs

| Plan part | Original evidence or gap | Result and verification |
|---|---|---|
| 1. Visual target and content map | Published design supplies the approved visual target. Existing apartment, neighbourhood, coast, space and microscopic references remain. | Preserved design; six-width, three-theme screenshot matrix. No speculative new art direction. |
| 2. Separate mathematics and interface | A fractional fitted view was rounded by the range control; largest landmark could not fit within the upper bound. | Native range retains exact fractional width, keyboard increments are explicit, and one extra framing step accommodates the complete galaxy. Model tests cover fit, exact ratios, limits, units and invalid input. |
| 3. Complete human-scale interaction | Free zoom left a stale landmark selected; opening focused Home, skipping primary controls. | Free zoom clears selection. Opening focuses the first zoom control. Repeated presses, bounds, slider keys and return-to-human-scale are tested. |
| 4. Illustrated journey | Resizing a selected Earth could crop it; several microscopic and space intervals had no object or marker. | All 13 landmark dimensions fit at 320 and 1440 px, including after resize. Empty intervals now have named, explicitly symbolic markers. Selected references and illustration limitations are visible. Artwork failure supplies an honest reference diagram and a working retry. |
| 5. Prediction guide | Only two lessons explicitly requested predictions; first/third/fourth exposed the explanation first. Starting-width changes were not clearly identified. | All five prompts precede a deliberate reveal. Correct explanations follow the action. Starting views and results are identified; opening still preserves the current view. Full guide, free exploration, restore and focus recovery are exercised. |
| 6. Entry, loading and lifecycle | Failed imports needed a real retry. Router pushState navigation did not trigger hashchange, so hidden explorers could keep animating. | Loading exposes aria-busy, failure restores launch focus, import retries use a new URL, and shell retains cleanup. Router/visibility events stop animation and announcements. Direct entry, Back, close/reopen and failure recovery pass. |
| 7. Assets, responsive layout and accessibility | Fixed canvas labels could not enlarge with reading text. One secondary text token measured 4.35:1 in sepia. | Scale note moved to readable DOM text; darker existing token fixes contrast. Main text and control labels measure at least 5:1 across themes. 200% reading-text reflow passes at six widths. Local assets work offline and in the self-contained file. |
| 8. Regression and release | Existing tests mainly proved explorers opened; they did not cover all landmarks, guide states, errors or conservation in the energy animation. | Added acceptance tests and pure energy-account tests. Full-book smoke checks exercise all 36 figures, all explorers, offline reload, and collect browser stack traces. Release verification checks the Pages revision, service-worker version and live interactions. |

## Clear accounting analogies

Chapter 7 now defines the counted system and the balance **end = start + in − out**. Stores correspond to account balances; transfers correspond to payments. Energy uses joules rather than rupees. Power corresponds to an amount transferred per second. The analogy tracks amounts; it does not explain why conservation holds or how useful energy is.

Chapter 8 distinguishes stored internal energy from energy transferred by heating or work. A payment changes a balance but is not kept inside it; similarly an object has internal energy, not stored heat. Temperature requires the particle explanation, not merely the ledger balance.

The diagrams and live jar labels agree with that distinction. Sound carries energy and is counted as warming after absorption. The tracked bounce amount is the initial 0.98 J, not all pre-existing energy in Earth and the room.

Two numerical defects in the existing animation were repaired without changing its visual design: coal's temporary turbine energy formerly added to an already fully allocated 100 J, reaching 115 J; the Sun's unchanged nuclear amount plus growing outputs also double-counted energy. Every scenario now accounts for one starting amount at every stage. “Delivered” and “Sunlight” explicitly label cumulative outputs, rather than pretending to be electrostatic or gravitational stores. Intermediate allocations are illustrative, not measured timing.

The independent content and model review is recorded in [the gate report](../source/gates/scale-plan-audit.md). Four energy scenarios are checked at 608 positions each for conservation, finite nonnegative amounts and truthful classifications.

## Reproduce

From the repository root, build with `.venv/bin/python source/build.py --site source/build/audit-final`, and serve that directory on port 8766.

- `node source/tests/test_scale_model.mjs`
- `node source/tests/test_energy_scenarios.mjs`
- `.venv/bin/python source/tests/test_scale_plan.py http://localhost:8766/`
- `.venv/bin/python source/tests/test_scale_browser.py http://localhost:8766/`
- `.venv/bin/python source/tests/test_scale_contrast.py http://localhost:8766/`
- `.venv/bin/python source/livetest.py source/build/audit-final/index.html source/build/plan-audit/full --wait 200 --offline`

Screenshots from this audit are saved under `source/build/plan-audit/`; the responsive matrix is under `source/build/scale-checks/`.

## Evidence limits

This is a plan-scoped audit of the explorer, its shared lifecycle, and the existing energy-accounting explanations and widget. It is not a new fact-check of all sixteen chapters or a claim of complete WCAG certification. Keyboard, focus, motion, reflow, text contrast and accessible labels were checked; a human screen-reader session and physical-phone performance measurements were not performed. Images remain disclosed illustrative scenes and schematics rather than measured maps or a physically continuous microscopic-to-galactic camera journey.

## Validation history

The first full-book smoke attempt reported two unlocated “undefined is not iterable” errors. The runner now records full browser stack traces. A focused energy/explorer/offline run and a clean full-book rerun passed without console errors; no source-level cause for that first transient failure was established. Final release checks use a separate, fixed build directory so rebuilding another preview cannot replace files under a running test.
