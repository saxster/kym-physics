# Kymaia reader review: Chapters 0–7

Reviewed 30 October 2026 for a twelve-year-old in Mumbai. This pass read the full current sources of Chapters 0–7 and all five front-matter files. It also read the main linked accounts of measurement, motion, falling, gravity, buoyancy and energy, then scanned the home activities and physical invitations in all 47 stories matched by these chapters' terms and explicit callouts. Root owns the front matter, app, build and publication; this record covers the first-half prose changes.

## Chapter coverage and changes

| Chapter | Reader finding and resulting change | Status |
|---|---|---|
| 0, seeing and measuring | The paper-thickness procedure confused physical sheets with numbered pages, halving a reader's result. Count 50 leaves/100 numbered pages and divide by 50; name the resulting 0.01 mm ruler contribution without promising total uncertainty. Replace moral language about extra digits with the instrument's actual precision limit. | Source and rendered blocks checked |
| 1, describing motion | The opening twice interrupted the ball puzzle with students' wrong-answer percentages, and the final transition told every twelve-year-old her answer was wrong. Keep the challenge and prediction; remove those judgments. | Source and rendered blocks checked |
| 2, continuing motion | Oil/talc on a floor created a slip hazard. Use the existing cloth/ice/thali comparison instead. A coin rolling on its edge cannot test sliding-contact area; use a rectangular block/eraser on two faces. Flatten the nested `:::work` inside the tablecloth case so its solution remains hidden and no fences leak. | Source and rendered blocks checked |
| 3, forces | The opening incorrectly equated unchanged velocity with no forces. State zero *net* force. Remove sitting on a table and maximum-strength luggage-scale/door-handle pulls; retain a gentle, adult-assisted, load-limited test and a drawing alternative. | Source and rendered blocks checked |
| 4, falling | Balcony and bridge drops sounded imitable. Make the higher drop explicitly a computer-model calculation and the Sea Link scene a thought experiment; retain table-height real drops. | Source and rendered blocks checked |
| 5, gravity | The ellipse pin-separation wording disagreed with the later correct instructions. Locate each pin 9% of the half-length from the centre. Offer the existing simulated free-fall trace before any physical phone drop, with an adult deciding whether their device can be used. | Source and rendered blocks checked |
| 6, pressure and floating | The card-on-glass answer compared atmospheric pressure with only the water-column increment, contradicting the corrected diagram. Explain the almost balanced pressures. Start the pencil experiment with dough rather than skin. Allow real oranges and air-filled foil balls to differ from the advertised outcome. Qualify the buoyancy claim for an object sealing against the bottom. | Source and rendered blocks checked |
| 7, energy | The flour activity promised a fourfold dent and used an ambiguous depth measurement. Distinguish the known fourfold impact energy from the conditional dent-depth prediction, compare from the original surface, repeat trials and stop at the tray bottom. Remove an inaccurate relativistic accuracy threshold, acknowledge that bounce warming may be imperceptible, and separate long coasting from perpetual power production. | Source and rendered blocks checked |

No chapter, numbered section, central explanation or prediction was removed. The coarsest ruler graphic was inspected in source: its 100 mm spacing and approximately 0.4 dm reading are internally consistent, so it was left intact. No identical duplicated long paragraph was found in the current Chapter 2 source.

## Linked-story consistency

- `inertia`: remove oil/talc on floors.
- `estimation`: correct the 1 km versus 3.7 km ocean-depth factor; replace moral judgment about precision.
- `third-law`: gentle, adult-assisted scale comparison; remove door-handle pulls, maximal pulls and wheeled-chair invitation.
- `falling`: remove standing on a chair; keep low drops and suggest filming the release.
- `ocean-of-air`: align the inverted-glass pressure explanation with Chapter 6.
- `orbits`: offer Chapter 5's simulated trace before the optional phone drop.
- `powers-of-ten`: distinguish sheets/leaves from numbered pages.
- `floating`: permit trapped-air foil balls and different oranges to behave differently.
- `vis-viva`: remove the guaranteed flour-depth ratio and ambiguous toothpick measurement; keep the fourfold kinetic-energy result.
- `chandrayaan`: remove the blanket claim that nothing travels directly to the Moon; describe this mission's actual looping route.
- `conservation`: holding hands still removes sliding work, but does not guarantee no warmth or no muscle energy use.

The scan also identified appliance-reaching instructions in `engines` and window proximity during lightning in `speed-of-light`; these were sent to root for the second-half owner rather than edited concurrently.

## Explain-back checks

**0.** I observe something before choosing a model to explain it. A measurement needs a unit and a realistic uncertainty. Counting sheets is different from counting printed pages, so I divide by the physical sheets I measured.

**1.** Motion needs a stated viewpoint. Velocity includes direction, while acceleration describes how velocity changes. A ball can have zero velocity at the top while gravity keeps changing its velocity.

**2.** A moving thing does not carry a supply of push. Friction from a named surface changes its motion. If friction decreases, stopping takes longer; a rolling coin cannot test a rule about sliding.

**3.** Several forces can cancel even while each still acts. Equal opposite interaction forces act on different objects, so they do not cancel on one object. Two steady connected scales can compare the same tension without anyone pulling as hard as possible.

**4.** With negligible air, gravity gives heavy and light objects the same acceleration. A horizontal launch changes the landing place without changing the fall time from the same height. High drops belong in the model; the real kitchen test can stay low.

**5.** An orbit is continuous falling with enough sideways motion to miss Earth. The astronaut and station fall together, so the floor does not support her feet. An ellipse has two foci, and their separation is twice either focus's distance from the centre.

**6.** Pressure is force spread over area. Pressure differences, not the comparison of one pressure with a water-column increment, explain the sealed glass. Floating depends on displaced fluid and average density, so trapped air and the actual fruit matter.

**7.** Energy accounts for what each store gains and loses. Four times the drop height gives four times the kinetic energy before impact, but a dent adds assumptions about the resisting material. Friction can make a wheel coast down slowly; it cannot supply endless power to a bulb.

## Evidence and limits

- Rendered every intro and section in Chapters 0–7 with the actual `Builder.render_blocks` and registered figure functions: all 41 numbered sections retained, no leaked `:::` fences.
- `git diff --check` passed for these changes.
- Independent arithmetic: 0.5 mm / 50 = 0.01 mm; foci at ±0.9 cm are 1.8 cm apart; 3.7 km / 1 km = 3.7; √(1 m / 0.25 m) = 2 for speed and 1/0.25 = 4 for impact energy; √(2 × 0.4 / 9.8) = 0.286 s; 1000 × 9.8 × 0.1 = 980 Pa. A 100 W load for 365 days needs 3.1536 billion joules, regardless of how long an unloaded wheel can coast.
- Grounding pointers: `source/grounding/ch00.md` (uncertainty); `ch02.md` (friction); `ch03.md` (net force, normal support, third law); `ch05.md` (orbits and foci); `ch06.md` (pressure differences, Archimedes); `ch07.md` §§7.2–7.4 (the explicit constant-resisting-force fidelity trap, work, internal energy). The unchanged `c6_card` caption already gives the correct inside/outside pressure account. `source/live/w_freefall.js` exposes “Replay the simulated drop”, confirming the device-free route actually exists.
- This is an editorial and source-rendering review, not a household apparatus test or an observation of Kymaia's comprehension. Root performs browser checks, independent final review and live publication verification.

## Independent gate follow-up

The independent remaining-story pass identified three overstatements. `kepler` now states the ellipse rule for a bound two-body orbit and allows open escaping paths. `planet-from-a-pen` identifies Palitzsch's sighting as the comet's 1758 return, and distinguishes the lack of a simple general three-body formula from the absence of an exact physical solution. These are scope qualifications of the existing Chapter 5 model. Both stories render without leaked directives; the scoped diff check passes.

The matching Chapter 5 case clue now uses the same bound-two-body and no-simple-general-formula qualifications. Its case still renders with the solution hidden and no leaked directives.
