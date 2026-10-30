# Exam bank grounding: Chapter 0 — The physicist's way of seeing

Original practice questions, 30 October 2026. Based on the existing section-by-section grounding in `ch00.md` and its MIT/OpenStax sources. All numerical situations are illustrative. Existing narrative files were not changed. Each numbered section is linked from at least one objective and question.

## Model answer audit

Concept answers specify interactions, reference conditions and system boundaries where relevant. One marking point earns one suggested mark; equivalent correct wording is accepted. These are suggested self-marking schemes, not official Cambridge marks.

- `ch00-o4-q1`: 1 km = 1000 m. 2.4 × 1000 = 2400 m. The answer is 2400 m. Independently computed in the authoring Python calculation.
- `ch00-o4-q2`: 1 km = 1000 m. 0.65 × 1000 = 650 m. The answer is 650 m. Independently computed in the authoring Python calculation.
- `ch00-o4-q3`: 1 km = 1000 m. 3.7 × 1000 = 3700 m. The answer is 3700 m. Independently computed in the authoring Python calculation.
- `ch00-o4-q4`: 1 km = 1000 m. 0.085 × 1000 = 85 m. The answer is 85 m. Independently computed in the authoring Python calculation.
- `ch00-o5-q1`: Total volume = number of people × volume per person. 120 × 80 = 9600 L. State the assumed use per person. The answer is 9600 L. Independently computed in the authoring Python calculation.
- `ch00-o5-q2`: Total volume = number of people × volume per person. 250 × 60 = 15000 L. State the assumed use per person. The answer is 15000 L. Independently computed in the authoring Python calculation.
- `ch00-o5-q3`: Total volume = number of people × volume per person. 400 × 90 = 36000 L. State the assumed use per person. The answer is 36000 L. Independently computed in the authoring Python calculation.
- `ch00-o5-q4`: Total volume = number of people × volume per person. 350 × 40 = 14000 L. State the assumed use per person. The answer is 14000 L. Independently computed in the authoring Python calculation.

## Practical/data checks

All tables are supplied illustrative values. Questions ask for explanations or written investigation plans; no physical experiment is required. Any optional trial should use a low, clear indoor setup with adult guidance, never traffic, heights, mains electricity or dangerous projectiles.

Mean (12.1+12.2+12.3)/3 = 12.2 cm; estimated height 18×2.8 = 50.4 m, reported as about 50 m.

## Sources

- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/online-textbook/
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter1.pdf
- https://openstax.org/books/physics/pages/1-2-the-scientific-methods
- https://openstax.org/books/college-physics-2e/pages/1-1-physics-an-introduction

## Worked/guided audit

- `ch00-worked-explanation`: Mean thickness = stack thickness ÷ number of sheets. 6.0 ÷ 24 = 0.25 mm. The answer is 0.25 mm.
- `ch00-guided-explanation`: Mean time per oscillation = total time ÷ number of complete oscillations. 36 ÷ 20 = 1.8 s. The answer is 1.8 s.

Each data question is associated with its relevant objective rather than a generic chapter objective. Command-word examples refer to this chapter. No physical activity is required.

### Revised transfer `ch00-o4-q2`

The preceding numerical audit for this question is superseded by this changed-context/rearranged task: 1 km = 1000 m, so divide the metre value by 1000. 1850 ÷ 1000 = 1.85 km. Changing the unit changes the numerical value, not the physical length.

### Revised transfer `ch00-o5-q2`

The preceding numerical audit for this question is superseded by this changed-context/rearranged task: Assumed allowance = total volume ÷ number of people. 19200 ÷ 240 = 80 L per person per day. Actual use may differ with weather, activities or individual needs.

## Final independent numeric fixture check

Every current numeric-answer field was checked by a separate Python script against hand-calculated literal expectations after transfer tasks were revised. Earlier audit entries for revised questions are superseded by this final table.

| Question | Expected result | Check |
|---|---|---|
| ch00-o4-q1 | 2400 m | PASS |
| ch00-o4-q3 | 3700 m | PASS |
| ch00-o4-q4 | 85 m | PASS |
| ch00-o5-q1 | 9600 L | PASS |
| ch00-o5-q3 | 36000 L | PASS |
| ch00-o5-q4 | 14000 L | PASS |
| ch00-worked-explanation | 0.25 mm | PASS |
| ch00-guided-explanation | 1.8 s | PASS |

Mean (12.1+12.2+12.3)/3 = 12.2 cm; estimated height 18×2.8 = 50.4 m, reported as about 50 m.

## Core-coverage and independent-review corrections

Added explicit powers/standard-form questions (chapter 0), mass/weight, rotational equilibrium and centre-of-gravity/stability work (chapter 3), and force-work plus gravitational potential energy (chapter 7). Delayed cumulative questions were added to chapters 0, 2, 4 and 6. Applied the independent reviewer’s circular-motion, G/g, atmospheric support and requested-mark wording corrections. New arithmetic: 3.5×10⁶ m; 4.2×10⁻⁴ m; scale ratio 400; 14×9.8 = 137.2 N; 40/10 = 4 kg and 4×2.5 = 10 N; 24×0.35/14 = 0.60 m; work 28×3.5 = 98 J; potential energy 2.5×10×1.8 = 45 J; height 144/(4×10) = 3.6 m; projectile horizontal travel 3.0×0.80 = 2.4 m. These were separately recomputed in Python.
