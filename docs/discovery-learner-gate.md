# Discovery activities: independent learner and provenance gate

15 November 2026. Gate B, report only. Reviewed as a bright twelve-year-old in Mumbai against `source/GATES.md` Gate B, `source/NARRATIVE.md`, `source/BOOKPLAN.md` §2 and the relevant format rules. Scope is the 22 new activity definitions, the statement trail, their discovery UI, the three discovery research notes and the Dr Jones recommendation report. No product source was edited, browser or physical experiment run, heavy test started, or commit made by this reviewer.

This is a source-based learner review, not evidence of comprehension by an actual child. The physics explain-backs below deliberately distinguish what the current wording supports from wording that needs correction. Existing chapter context can supply familiar definitions; an optional challenge still needs usable evidence at its displayed precision.

## Findings requiring action

### B1 — BLOCKER / REWRITE: signed position is called distance travelled

Location: `source/live/discovery_mechanics.mjs`, `train.explanation` (initial review line 32). “Position adds up the distance travelled” teaches exactly the distance/displacement confusion that reverse velocity exposes. For stage velocities 0, +8, −8, 0 m/s at 0, 4, 8, 12 s, displacement is 0 m while distance travelled is 48 m; the code correctly returns the signed displacement. Replace the first sentence with an explanation that each interval contributes a signed change in position: forward adds, reverse subtracts; position is the starting position plus those changes. Then the signed-area explanation follows without a hidden change of meaning. [OpenStax graph relations](https://openstax.org/books/physics/pages/3-2-representing-acceleration-with-equations-and-graphs) support signed velocity and displacement; numbers independently recomputed with Python.

### B2 — BLOCKER / REWRITE: LED design answer ignores a selected series component

Location: `source/live/discovery_fields.mjs`, `circuitActivity.compute`, minimum-protector challenge. The displayed circuit can be series, with a 220 Ω lamp already in the LED path, but the answer always uses the parallel LED-branch formula `(V−2)/0.020−10`. At 6 V, the stated approximation needs 190 Ω of additional protection in the parallel branch; in series the existing 220 Ω lamp plus 10 Ω already restricts current below 20 mA, so the additional minimum is 0 Ω. A learner who includes every component in the displayed path is marked wrong. Constrain this challenge explicitly to the independent LED branch, or include the 220 Ω series lamp and state the chosen topology. The [MIT DC-circuit notes](https://ocw.mit.edu/courses/8-02-physics-ii-electricity-and-magnetism-spring-2007/resources/chap7dc_circuits/) provide the circuit-law grounding; numerical witness independently recomputed with Python.

### B3 — BLOCKER: displayed spectral precision can reject correct reasoning

Location: `source/app/x_discovery.js`, `fmt`; `source/live/discovery_fields.mjs`, star motion challenge. At true +40 km/s, hydrogen’s 410.174 nm rest line appears at 410.2287277 nm. Five-significant-figure formatting shows 410.17 and 410.23 nm, whose displayed ratio gives +43.8539 km/s, outside the challenge’s ±2 km/s tolerance. The prompt explicitly permits a line pair, so the learner need not average other lines to repair display rounding. Preserve sufficient wavelength digits or derive the tolerance from the displayed resolution. The witness uses the module’s stated nonrelativistic Doppler relation and independently computed Python arithmetic; the research note links the [NIST hydrogen positions](https://physics.nist.gov/PhysRefData/Handbook/Tables/hydrogentable2.htm).

### B4 — FIX: transit evidence is flattened against an unnecessary zero baseline

Location: `source/app/x_discovery.js`, `graph`; `source/live/discovery_fields.mjs`, hidden-planet plot. The generic graph includes zero on the brightness axis. With a radius ratio of 0.05 the depth is 0.0025, only 0.3875 pixels in the graph’s 155-pixel vertical extent; even ratio 0.1 produces only 1.55 pixels. The central-transit challenge asks the learner to measure the dip, yet the main visual evidence is nearly invisible for ordinary cases. Give this particular relative-brightness plot a clearly labelled range near 1 or a disclosed zoom, preserving the physical depth and exact readings. This is a source-derived rendering risk for root’s targeted browser check, not a claimed screenshot observation. The area-ratio witness was recomputed with Python. [NASA’s methods account](https://science.nasa.gov/exoplanets/how-we-find-and-characterize/) describes the brightness dip as the evidence.

### B5 — FIX: ruler instruction names a scale that is not drawn

Location: `source/live/discovery_mechanics.mjs`, `ruler.investigation[0]` (initial line 65). It says to count divisions between labelled centimetres; the drawing and summary explicitly label 0, 10, 20… as millimetres. Say “between labelled ten-millimetre marks,” or describe the actual scale without changing it. Otherwise a careful reader can introduce an avoidable factor-of-ten error.

### B6 — FIX: the magnetic-field picture does not follow field reversal

Location: `source/live/discovery_fields.mjs`, `machineActivity.draw`. The field slider permits negative B, but the diagram always labels N at left and S at right and always draws B to the right. Reversing only B changes the computed force/torque while leaving the claimed field direction unchanged in the picture. Make pole/arrow cues follow the sign, and distinguish zero field; otherwise the visual explanation contradicts the reversal experiment. Root’s facts/rendered gate should verify the resulting orientation together with the declared sign convention.

## Bounded learning improvements

### B7 — CONSIDER: sensor challenge makes the mathematics a larger jump than the mechanism

Location: sensor activity challenge and its `evidence` string. The environment→resistance→voltage→switch sequence is useful and the threshold insight is simple: equal resistances split 5 V equally. But asking a twelve-year-old to evaluate an unfamiliar fractional power or `exp[3950…]` is a sharp jump from swapping two components; no resistance-versus-environment graph is supplied. Preserve the useful inference by supplying the sensor resistance at the requested environment, or showing a small readable resistance table/curve; keep the component law available as optional depth. This is an access/scaffolding issue, not a claim that the declared laws are false.

### B8 — CONSIDER: wave opening explanation compresses several unseen steps

Location: `waveBench.explanation`. “Different phases,” “coherent,” “interference bands” and “single-opening envelope” arrive together. A short bridge—contributions can arrive on the same part of a cycle and reinforce, or opposite parts and cancel—would earn those labels without redesigning the bench. The local marked-piece experiment is already a strong mechanism-first entry. In fixed-end mode, describe the displayed sum as incident plus reflected motion rather than implying the entire standing pattern travels right.

### B9 — CONSIDER: name the limits of the shared inverse-square explanation

Location: distance-pattern explanation and picture. The point-lamp explanation gives a mechanism through conserved power over growing spherical area; the gravity/electric cases correctly state a shared magnitude law and explicitly avoid calling it energy flow. Preserve that distinction. If adding one sentence, define a field reading through the force on a small test mass or charge; do not invent spherical energy spreading as a causal explanation of static fields. No broad new field lesson is required.

## Three-sentence explain-backs for all activities

These are grouped by the physics they share. Each numbered item covers one activity and contains three learner sentences; the trail is separate.

### Positions, readings and controlled changes

1. **Train — REWRITE until B1 is fixed.** “I can add a forward change in position and subtract a backward one to find where the train ends. The signed area under its velocity graph does that adding, and a downward slope means the velocity is getting smaller even if it is still positive. If I added all the distances instead, I would get how far it travelled, which is a different answer.” The current first explanation sentence contradicts this safe explain-back.

2. **Repeated readings.** “Five close readings can all be shifted because the scale started above zero. Averaging can reduce changes that go both ways, but it cannot remove a shift shared by every reading. I would check the empty scale or use a known mass before trusting the average.” Deterministic variation and the absence of a confidence interval are honestly declared.

3. **Ruler.** “The left end gives one position and the right end gives another. Subtracting them gives the length, even when neither end is at zero. Moving the pencil changes both readings together, while using fewer divisions gives me less detail.” Sound after the unit-language correction in B5.

4. **Stopping comparison.** “While the driver reacts, the car keeps moving at its original speed. The brakes then transfer away its kinetic energy, and this model’s unchanged braking force needs four times the distance when speed doubles. I must change only one condition to find its effect, and these chosen grip numbers are not measured safe distances for Mumbai roads.” The explicit prohibition on real-road testing is appropriate.

### Falling, collisions and balances

5. **Projectile.** “Gravity keeps changing the ball’s downward velocity after it leaves the shelf. With the same height and no air resistance, changing sideways speed does not change the fall time. I can reach the basket by multiplying that fall time by the sideways speed, without believing a sideways push holds the ball up.” The horizontal-launch limits make this inference honest.

6. **Sticking collision.** “The trolleys push each other in opposite directions during contact. Those pushes cannot change the pair’s total momentum when there is no outside horizontal impulse, so the masses and shared final motion let me work backwards. Their kinetic energy can decrease because some becomes internal energy and sound; momentum and kinetic energy are not the same account.” “Impulse” is compressed but supported by the existing chapter and surrounding force description.

7. **Cardboard balance point.** “Every patch of the same-thickness cardboard has weight, so I must count more than the outline’s appearance. A freely hanging sheet turns until its combined weight acts below the pin. Drawing that vertical line back on the sheet from two different pins locates the same point, unless the lines are too nearly parallel.” The uniform-density assumption and poor-pin warning are valuable.

8. **Bridge supports.** “The two scales’ upward pushes must add to the plank and load’s weight. That alone does not tell me the sharing, because the plank must also have balanced turning effects. Moving the load changes the two readings, and the readings can reveal its position if I know the masses and support separation.” It gives a reason for moments rather than merely naming them.

9. **Unknown density.** “Mass divided by the sealed object’s outside volume gives its average density. Pressure is greater lower down in the water, so the water’s upward force equals the weight of the displaced water. A hollow shape can therefore float even when its material is dense, and average density alone cannot prove which material it is.” Instrument choice, signed holding force and release provide different evidence for the same model.

10. **Earth from two sticks.** “Sunlight is nearly parallel, but upright sticks at different places point in different directions on a round Earth. With the first Sun overhead, the second shadow gives the angle between those directions. If our surface journey spans one-fiftieth of a whole turn, multiplying its length by fifty estimates the circumference.” Same-meridian, simultaneous-noon and illustrative-input limitations prevent a false historical measurement claim.

### Waves, light and thermal energy

11. **Refraction rivals.** “Two old accounts can both fit one bending ray, so that observation does not choose between them. They disagree about the speed in water, and equal paths taking longer in water support the slower prediction. The screen’s timing is calculated, while Foucault’s actual experiment supplied historical evidence; this does not mean modern photons are Newton’s projectiles.” This is a meaningful evidence question, with the calculation/observation boundary stated.

12. **Wave bench.** “The coloured piece moves near its own mean position while a disturbance reaches other pieces. Contributions that arrive together can reinforce or cancel, so changing the openings changes the detector pattern. At the fixed end the two displacements cancel, while in the slower region the same number of cycles per second fits into shorter wavelengths.” B8 would make the middle step easier to reach from the actual prose; the medium analogy and normalised-power limits are explicit.

13. **Doppler train.** “Each crest spreads from the place where the horn emitted it. Ahead of a moving horn the crests are closer together, so a waiting listener receives more each second; behind, the opposite happens. The driver moves with the horn and hears its emitted frequency, and the screen’s short tone is an optional sample rather than an actual flyby.” The selected-side limitation avoids a misleading closest-approach story.

14. **Telescope design.** “A shorter eyepiece can make the Moon look larger but show a smaller patch of sky. A larger opening narrows the diffraction blur, so it can distinguish stars that magnification alone cannot separate. I need a design that answers my question, and the simplified view does not include atmospheric blur or my eye.” The 200× inset and first-minimum rings are disclosed.

15. **Heating evidence.** “Energy can keep entering melting ice while the thermometer remains at zero degrees. During that stage it changes the particles’ arrangement and interactions, rather than making the particles themselves bigger. Power and time, a joulemeter, or steady voltage and current can estimate the same input, but only this insulated model sends all of it into the sample.” The three routes are explicitly ideal readings rather than household wiring instructions.

### Paths for electricity and magnetic interactions

16. **Circuit repair — REWRITE the design challenge until B2 is fixed.** “A break in a shared path stops both lights, but separate branches can leave one path complete. Reversing meter leads changes the sign of the reading rather than making the lamp consume current. To limit the LED current I must count every resistance actually in its path, including the lamp if the selected arrangement is series.” The last sentence is the inference the current challenge incorrectly rejects in a valid selected state.

17. **Sensor job.** “The sensor changes resistance when light or temperature changes. The two resistors divide the supply voltage, and swapping their places reverses which environmental change raises the junction voltage. Equal resistances split five volts into two-and-a-half volts each, so that point locates this ideal switch’s boundary.” Good mechanism; B7 concerns access to the requested numerical resistance.

18. **Three machines.** “Current in a magnetic field produces forces that can twist a coil or push a speaker cone. Turning a generator changes the field passing through its coil and produces voltage, although an open circuit delivers no current to a load. Reversing a chosen input can reverse the force or voltage, and a paused cone displacement is not yet a sound wave.” B6 concerns a contradictory direction cue in the drawing; the prose distinguishes force, voltage and power.

### Hidden astronomical and statistical properties

19. **Unknown star.** “Several missing colours can match an atom’s laboratory line pattern. The overall glow gives a separate temperature clue, while a common fractional line shift tells me about motion towards or away from us. A deep line alone does not tell me how much of an element is present, and I need enough displayed wavelength digits to calculate the claimed motion.” B3 blocks reliable numerical inference from an allowed line pair.

20. **Hidden planet.** “A planet can cross the star’s face for one viewing angle and miss it for another. The star’s own towards-and-away motion can still give a second clue after the brightness dip disappears. A missing signal therefore depends on the method and viewing geometry, rather than proving that no planet exists.” B4 concerns seeing the dip well enough to use it as evidence.

21. **Decay evidence.** “Each nucleus has the same chance of surviving another equal interval, but that does not schedule when an individual nucleus decays. A larger starting group gives a more stable fraction remaining, even though individual runs still vary. Nuclei remaining, expected decays each second and counts recorded by an imperfect detector are different quantities.” The statistical expectation, seeded samples and detector/background distinctions are stated; no isotope or dose inference is invited.

22. **Shared distance pattern.** “A point lamp sends the same power through larger spheres, so doubling distance gives four times the area and a quarter of the intensity. The chosen point-gravity and point-charge models share that numerical pattern, but their field readings describe different interactions. A beam whose width stays fixed over this limited range does not meet the lamp’s spherical-spreading assumption.” This safe explain-back does not turn static fields into flowing energy; preserve B9’s distinction.

### Statement trail

23. **Forces trail.** “A moving object can keep a steady velocity when its forces balance, while zero velocity at one instant does not prove zero acceleration. The two forces in an interaction pair act on different objects, and changing place to the Moon changes weight rather than mass. I have to repair a false statement with a reason, not just find the route, and friction can act while the touching surfaces do not slide.” The trail gives corrections and keeps no score; it is a recall activity, with the chapter supplying the experiments and mechanisms. Its geometry stays fixed between seeds while statements rotate, so it should not be described as evidence of understanding merely because a route is completed.

## Safety, household feasibility and existing reader records

All 22 activities are virtual investigations; none adds a `:::home` procedure requiring a physical effect to work in a Mumbai flat. Available materials and monsoon sensitivity therefore do not determine success. The katori, pencil, cardboard, sticks and water are familiar contexts; balances, two support scales, nanosecond timers, optical equipment and high-current heaters are simulated apparatus, not a claim that those instruments are ordinarily available at home. The paper sheet explicitly remains virtual unless the book supplies a separate safe household procedure.

The road, shelf, bridge and circuit activities state their relevant real-world limits. No new flame, mains, hot-water, rooftop, sun-viewing, balcony-drop or actual meter-connection procedure is instructed. At 1 m stick height and 7.2° the shadow would be about 12.6 cm, a visible scale, but this review does not authorise an outdoor two-town experiment. The ideal thermal energy account gives 42 kJ to warm 1 kg of ice from −20 °C and 334 kJ to melt it; these are model inputs, not practical household heating directions.

The UI source merges existing lesson records when saving discoveries, findings or trail corrections; it does not replace the lesson object wholesale. Predictions and claims survive a new case, and clearing a comparison clears retained runs rather than written notes. These source observations support the intended preservation, but real storage/reopen/export behaviour remains root’s targeted browser responsibility.

There is no autoplay loop or microphone/sensor access in the reviewed activity modules. The only added audio path creates an AudioContext after an explicit “Hear this frequency” click and closes it after a short quiet tone, on control/mode changes and cleanup; a full visual frequency/trace route exists. Root clarified that explicit opt-in audio is authorised and that the prohibition concerns autoplay audio/device permission. No score system or new curriculum progression is added.

## Provenance and source limits

The three research notes map each activity to the numbered recommendation and to its physical sources. They separate inspected Dr Jones interfaces from catalogue-level inspiration and avoid claiming measured learning outcomes. The recommendation report similarly distinguishes original adaptations from observed app capabilities, and records what it did not test. The new definitions use original context, explanatory wording, geometry and constrained tasks; no copied passage or third-party artwork is apparent in this bounded comparison.

The declarations that no Dr Jones code, text, assets or numerical models were copied are authors’ provenance statements. This review did not inspect all external app source or perform a copyright/code-similarity audit, so it cannot independently prove absence of copying. Existing project attribution/licence decisions are inherited; this report does not establish a new licence permission or reopen those decisions. Physics source links and limits are exposed beside each activity, although links alone do not prove all existing site-wide attribution is rendered correctly.

For targeted verification this reviewer opened the [OpenStax acceleration/graph page](https://openstax.org/books/physics/pages/3-2-representing-acceleration-with-equations-and-graphs), [OpenStax half-life/activity page](https://openstax.org/books/college-physics-2e/pages/31-5-half-life-and-activity), [NASA exoplanet methods page](https://science.nasa.gov/exoplanets/how-we-find-and-characterize/) and [William Tobin’s Foucault research page](https://spcs.canterbury.ac.nz/~wjt23/foucault.html). The historian’s own page supports the 1850 comparison and faster-in-air result, but is not the original 1850 apparatus record and says it is no longer maintained. The activity and research note correctly disclose that source limitation. Original historical readings are not claimed; source re-fetching and a fresh independent numerical audit of every physical model belong to Gate A, not this Gate B report.

## Verification record and disposition

Independent lightweight Python arithmetic established the train 0 m/48 m distinction, the 6 V LED 190 Ω/0 Ω topology distinction, the 0.3875-pixel and 1.55-pixel transit depths, the +43.8539 km/s rounded-line witness, and the shadow/heating scales above. These are focused counterexamples, not a repeated unit suite. No browser, build, exhaustive matrix or hosted CI ran in this review.

Initial disposition: **3 BLOCKER findings (including 2 REWRITE flags), 3 FIX findings and 3 CONSIDER findings**. All 22 activities and the statement trail have explain-backs. The overall mechanism-first design is useful, but B1–B3 prevent an unconditional learner-gate pass until corrected. Root owns resolving these bounded findings and running the planned final local gate; browser/storage/audio checks and Gate A are not claimed passed here.

### Integration recheck

The integrating task corrected the source while this report was being written. A bounded reread of the assigned files confirms:

- **B1 closed in source:** the train now adds signed steps, explicitly adding forward motion and subtracting reverse motion. Explain-back 1 is now supported, so its REWRITE flag is resolved.
- **B2 closed in source:** the challenge now counts `10 + 220` Ω in series and 10 Ω in parallel, names the extra lamp resistance and explains a zero additional minimum. Explain-back 16 is now supported, so its REWRITE flag is resolved.
- **B3 closed in source:** formatting now uses seven significant figures. Recomputing the same displayed pair, 410.174 and 410.2287 nm, gives +39.9797 km/s, within the unchanged ±2 km/s tolerance.
- **B4 implementation route present, rendered verification pending:** the transit plot opts out of a zero baseline, the graph calls a new bounds helper, and the caption explicitly discloses the close-up vertical scale. That helper is outside this reviewer’s assigned file scope; root must confirm the actual bounds and visible dip with its targeted rendered check.
- **B5 closed in source:** the instruction now refers to numbered millimetre marks.
- **B6 closed in source:** negative field swaps pole labels and reverses the B arrow; zero field displays “off” and “B = 0.” Root still owns rendered legibility/orientation checking.

Current source-review disposition: **0 remaining BLOCKER, 1 FIX awaiting root’s targeted rendering/bounds evidence (B4), 3 optional CONSIDER**. This is not a claim that the final browser or repository gate passed. The original findings remain above so the counterexamples and reasons for the corrections remain reviewable.

### Rendered closure — integration owner

The integrating owner subsequently verified B4 through the real reader: the transit dip is visibly resolved at phone width, and the plot explicitly discloses its close-up vertical scale. The plot-bounds regression also passes. Default/changed reader images confirm B6's reversed pole labels and magnetic arrow. This closes the remaining required rendered finding; the three optional CONSIDER items remain recorded above.

The [final verification report](discovery-verification.md) and its receipt hashes record the full local reader gate, focused notebook/audio/offline journey, final build checks and 345-case activity matrix. The matrix passed with no request, page or console errors. This addendum records integration evidence; it does not expand the independent source review's original claims.
