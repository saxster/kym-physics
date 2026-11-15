# Discovery activities — independent Gate A

15 November 2026. **Verdict after bounded correction review: required numerical/source-definition fixes resolved; host rendering remains integration coverage.** Report only; no implementation edits, commits, browser runs or broad verification suite. Original findings are preserved below as the before-change evidence; see the resolution addendum for current status.

Reviewed the 22 definitions in `source/live/discovery_{mechanics,waves,fields}.mjs`, their three discovery research records and focused test sources, against Gate A, BOOKPLAN §2, NARRATIVE, FORMAT and relevant existing grounding/fidelity traps. The integration contract supplied to this reviewer says challenge mode hides named controls/readings and passes `__challenge`/`__revealed` to drawing code. Findings below concern that contract, not an independently inspected host UI.

## Required corrections

### A1 — FIXED during integration: the resistor challenge ignored the selected series lamp

**Location:** `source/live/discovery_fields.mjs:33`, `circuitActivity.compute`; research numerical example in `source/research/discovery-fields.md`, circuit bullet.

**Reproduction:** choose series, closed switch, forward LED, 6 V. The challenge accepts **190 Ω**, the parallel-branch answer. In this selected circuit the 220 Ω lamp is also in the LED path. With the challenge's own fixed 2.0 V LED approximation, `Rminimum = max(0, (6−2)/0.020 − 10 − 220) = 0 Ω`; even the available minimum 50 Ω gives only `4/(50+10+220) = 14.29 mA`. A local model probe gives 14.38 mA with the exponential LED. The same challenge answer appears for parallel and series. This teaches the wrong resistance account and rejects the correct selected-circuit inference.

**Required:** either explicitly make this a forward, closed, parallel-branch design problem and enforce/name that context, or include every selected series resistance in the answer and explanation. State how open/reversed cases are handled. Add one series-versus-parallel challenge assertion. This is elementary Kirchhoff/Ohm reasoning already grounded in ch12 and the cited MIT circuit notes.

**Integration update:** while this independent review was running, the owner added the selected 220 Ω series resistance and clarified the prompt/explanation. A fresh bounded probe now asserts **0 Ω series / 190 Ω parallel** at 6 V and passes. The original incorrect result above is the before-change evidence, not the present candidate. No other finding was cleared by that probe.

### A2 — FIX: magnetic field reversal changes numbers but leaves the depicted field unchanged

**Location:** `source/live/discovery_fields.mjs:70`, `machineActivity.draw`.

**Reproduction:** motor, 90°, 2 A, 10 turns; change field from +0.5 T to −0.5 T. Local probes give force `+2 → −2 N` and torque `+0.4 → −0.4 N m`, while canvas calls retain left **N**, right **S**, and the same rightward **B** arrow. At zero field the same poles and full arrow remain. The investigation specifically asks the reader to reverse field and explain the response, so this contradictory representation directly defeats the intended evidence.

**Required:** reverse the pole labels and B arrow for negative field; depict a zero/off field at zero. Keep the force/torque sign convention coherent with the scene. Existing ch13 grounding defines field direction and force reversal. A draw-call assertion is sufficient for this narrow contract; visual acceptance belongs to integration.

### A3 — FIX: the train explanation conflates distance with signed displacement

**Location:** `source/live/discovery_mechanics.mjs:32`, first explanation sentence.

**Reproduction:** set `v1=v2=−8`, `v3=0`. Independent integration gives final position **−64 m**, while distance travelled is **64 m**. “Position adds up the distance travelled in each tiny time interval” is therefore false for supported reverse journeys, even though the implementation and later sentences use signed quantities correctly.

**Required:** say that position changes by adding signed velocity-times-time contributions; distinguish this displacement from total distance. No formula change is needed.

### A4 — FIX: train challenge hides the answer reading but supplies the answer plot

**Location:** `source/live/discovery_mechanics.mjs:40–41`, position plot and challenge.

**Reproduction:** `v1=8`, `v2=8`, `v3=0` gives challenge answer **64 m**. The supposedly concealed result remains the endpoint `[12,64]` of the visible “Position” plot. Moving the shared clock to 12 s also selects that endpoint. The challenge asks the reader to obtain the answer using signed areas; its evidence does not require that operation while the already integrated result is shown.

**Required:** hide the position-result plot during this unrevealed challenge (retain velocity evidence), or redesign the question around genuinely unrevealed evidence. The three coordinated plots remain appropriate during exploration. The existing tests verify only that named hidden labels exist; they do not establish answer concealment.

## Consider / explicit uncertainty

### A5 — CONSIDER: spectral provenance claims more precision than the cited table establishes

**Location:** `source/live/discovery_fields.mjs:72`, `spectralPatterns`; `source/research/discovery-fields.md`, unknown-star bullet; literal table assertion in `source/tests/test_discovery_fields.mjs:19`.

Freshly fetched NIST tables support the general line patterns, but not the assertion that every listed position is a selected table wavelength simply rounded to 0.001 nm. For example NIST lists Hβ components at 486.12786, 486.12870 and 486.13615 nm; the model uses 486.134. Hα components include 656.27110, 656.27248 and 656.28518 nm; the model uses 656.281. These can be useful effective unresolved-line positions, but that choice needs its own account. The helium 587.56148 nm component rounds to 587.561, whereas the model gives 587.562. Sodium values agree with the cited table's rounding.

**Recommendation:** either select explicitly identified components with literal rounding, or describe effective/blended reference positions and cite their derivation. This does not invalidate the internally consistent synthetic Doppler exercise, which uses identical rest references to generate and infer its shifts. [NIST hydrogen](https://physics.nist.gov/PhysRefData/Handbook/Tables/hydrogentable2.htm), [helium](https://physics.nist.gov/PhysRefData/Handbook/Tables/heliumtable2.htm), [sodium](https://physics.nist.gov/PhysRefData/Handbook/Tables/sodiumtable2.htm).

### A6 — CONSIDER: some basket arrangements cannot be reached within the speed control

**Location:** `source/live/discovery_mechanics.mjs:126–129`, projectile instructions, speed range and summary.

Seed 3, height 0.5 m and target 4.5 m require **14.087 m/s**; the speed control stops at 10 m/s. The challenge can still accept a typed physical answer, and increasing height restores a reachable construction. The exploration's instruction to “adjust speed to reach the basket” and perpetual miss summary do not explain this bound. Consider explicitly reporting an unreachable target at the current height or inviting a height change. No physics formula is wrong.

## Pass coverage and independent calculations

Python (`python3 -I`, elementary arithmetic/math) independently reproduced the consequential reference calculations below; small Node probes exercised actual challenge and draw outputs. This review inspected the focused test code but did **not** rerun previously reported endpoint suites merely for reassurance.

| Activity group | Checked result / fidelity |
| --- | --- |
| Train | Three trapezia yield 64 m for 8/8/0 m/s; reverse gives −64 m. Continuous velocities and signed-area implementation agree. A3/A4 remain. |
| Repeats / ruler | Fixed offsets sum to zero; common bias survives averaging. Deterministic rather than random status is disclosed. End subtraction and translation invariance hold; marked division limits and hidden length controls are present. |
| Cardboard | Area-centroid formula has correct orientation/sign handling; triangle (0,0),(6,0),(0,3) gives area 9 mm² and centre (2,1) mm. Hanging transform places centroid vertically below each pin; two-line degeneracy is disclosed. |
| Stopping / projectile | 36 km/h, 1 s, μ=.5 gives 20.20408163 m. Doubling speed doubles reaction and quadruples braking components. A 1.225 m drop takes .5 s and reaches 2 m at 4 m/s. Air/rotation and road-safety limitations are explicit. |
| Collision / supports | 2 kg at +4 and 1 kg at −2 gives momentum 6 kg m/s, final 2 m/s, energy 18→6 J. Bridge L=4, M=10, m=40, x=0 gives supports 441/49 N and correct torque balance. |
| Density / Earth | 200 g/100 cm³ gives 2000 kg/m³ and submerged holding force +.98 N. Floating half-submergence is coherent. 800 km/7.2° gives 40000 km; 6371 km spherical reference gives 40030.17359 km. Ancient exact-measurement claims are appropriately avoided. |
| Refraction | Equal 3 m paths give 10.00692286 ns in air, 13.33922817 ns wave prediction, 7.50706891 ns corpuscular rival. Snell at 45° gives 32.03672304°. Photons are explicitly distinguished from Newton's classical corpuscles. |
| Wave bench | v=fλ units agree; reflected pair cancels at 10 cm; phase is continuous at the 5 cm slower boundary, with speed/wavelength both .6×. Missing reflection/energy accounting and profile normalisation are expressly scoped approximations. |
| Doppler / telescope | 300 Hz, 30 m/s yields 328.23972388 Hz ahead and 276.23448640 Hz behind. 100 mm at 550 nm gives 1.38403685 arcsec Rayleigh angle; field ≈50°/magnification and inset enlargement are disclosed. |
| Heating | 200 W×1000 s =200 kJ; 42 kJ warms ice, 158 kJ melts .47305389 kg. At 1000 kJ vapour fraction .09104610. Latent and sensible energy bookkeeping is coherent over the allowed range. Particle layout is identified as illustrative. |
| Circuit / sensor / machines | Circuit break and branch-current logic is coherent apart from A1's challenge. NTC at 50°C is 3588.182582 Ω; half-supply divider requires equal resistances. Motor example gives 2 N/.4 N m; generator at 2 rad/s gives .4 V. Open-circuit power and static speaker limitations are explicit; A2 remains. |
| Star / planet | Synthetic wavelength shift and Wien peak are internally coherent. Circular-orbit recomputation gives 3.661251516 days and 131.7804872 m/s RV amplitude for one Jupiter mass. Radius ratio .1 blocks .01 centrally; 80° has impact 1.73648178 stellar radii and no transit while RV survives; face-on RV vanishes. Exact disc overlap and foreground-only occultation are correct. A5 remains a source-precision qualification. |
| Decay / distance | N0=1000, H=t=6 s gives expected 500 and activity 57.76226505/s. Inverse-exponential sampling and separate Poisson background are coherent; counts versus rates are distinguished. Point-source values at 2/3 m are .25/1⁄9; constant-area beam is explicitly finite-range. Static field laws are not described as outward energy flow. |

The Foucault 1850 slower-water statement is corroborated by the cited [William Tobin history page](https://spcs.canterbury.ac.nz/~wjt23/foucault.html). That is a historian's research account, not an inspected original 1850 publication: the linked original-publications page failed to fetch. No new invented quotation, exact ancient observation, contemporary Mumbai measurement or effectiveness claim was found in these activities. Original primary historical verification remains qualified on that basis.

No rendered UI, audio playback, retained-notebook journey, build, device matrix, safety Gate B or release gate is claimed passed here. Existing endpoint tests prove finite computations, not physical truth, visible legibility or concealment. No out-of-scope defect remediation was performed.

**Counts:** 0 BLOCKER; 4 FIX findings, of which 1 FIXED and 3 REPORT; 2 CONSIDER (REPORT). All 22 activities received source review; numerical pass coverage is limited to the calculations and invariants stated above.

## Bounded correction review

The integrating owner requested a narrow recheck of A1–A4. No endpoint matrix or broad suite was repeated.

- **A1 FIXED:** circuit answers include all selected series resistance. Four direct assertions passed: at 6 V, 0 Ω series / 190 Ω parallel; at 9 V, 120 Ω series / 340 Ω parallel, under the stated forward fixed-drop approximation.
- **A2 FIXED:** actual mocked canvas calls were checked at +0.5, −0.5 and 0 T. Positive field labels N/S and draws B from x175→460; negative labels S/N and draws x460→175; zero labels both blocks “off” and displays B=0. This clears the original sign/zero depiction contradiction; it does not claim rendered acceptance.
- **A3 FIXED:** explanation now explicitly adds signed steps and subtracts reverse travel. A −8/−8/0 m/s journey still computes −64 m correctly.
- **A4 FIXED at the activity contract:** `hidePlots:['Position']` now accompanies the two hidden numerical position readings. Applying the declared hide filter leaves only Velocity and Acceleration plots. The integrating owner is responsible for the host actually applying that contract and for reveal behaviour; this report made no browser claim.

**Updated required-finding counts: 0 BLOCKER, 4 FIXED, 0 unresolved FIX.** A5/A6 remain the two bounded considerations pending their stated integration follow-up.

### A5: explicit primary-table replacements supplied to integration

These are individual selected **air-wavelength components**, not unresolved multiplet centroids. The primary tables were fetched during this review; conversion Å÷10 and rounding were independently repeated with Python Decimal to 0.001 nm.

| Element | Selected NIST originals (Å) | Rounded references (nm) |
| --- | --- | --- |
| Hydrogen | 4101.74; 4340.462; 4861.3615; 6562.8518 | **410.174; 434.046; 486.136; 656.285** |
| Helium | 4471.479; 5015.678; 5875.6148; 6678.1517 | **447.148; 501.568; 587.561; 667.815** |
| Sodium | 5889.950; 5895.924 | **588.995; 589.592** |

Sources: [NIST hydrogen](https://physics.nist.gov/PhysRefData/Handbook/Tables/hydrogentable2.htm), [helium](https://physics.nist.gov/PhysRefData/Handbook/Tables/heliumtable2.htm), [sodium](https://physics.nist.gov/PhysRefData/Handbook/Tables/sodiumtable2.htm). Updating the code, literal fixtures and research description together is the owner's remaining A5 follow-up. A6's planned explicit unreachable-at-current-height notice is also owned by integration; no silent retry is needed. The Foucault primary-publication access limitation stated above remains explicit: the historian's account supports the factual statement, without pretending the original publication was inspected.
