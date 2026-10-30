# Exam bank grounding: Chapter 5 — Gravity and orbits

Original practice questions, 30 October 2026. Based on the existing section-by-section grounding in `ch05.md` and its MIT/OpenStax sources. All numerical situations are illustrative. Existing narrative files were not changed. Each numbered section is linked from at least one objective and question.

## Model answer audit

Concept answers specify interactions, reference conditions and system boundaries where relevant. One marking point earns one suggested mark; equivalent correct wording is accepted. These are suggested self-marking schemes, not official Cambridge marks.


## Practical/data checks

All tables are supplied illustrative values. Questions ask for explanations or written investigation plans; no physical experiment is required. Any optional trial should use a low, clear indoor setup with adult guidance, never traffic, heights, mains electricity or dangerous projectiles.

Force ratio at four times separation = 1/16 = 0.0625; orbital circumference/speed = (2×3.14×14000)/14000 = 6.28 km/s.

## Sources

- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/online-textbook/
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_data.pdf
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_constants.pdf

## Worked/guided audit

- `ch05-worked-explanation`: For fixed masses, gravitational force is inversely proportional to separation squared. 36 ÷ 3² = 4 N. The answer is 4 N.
- `ch05-guided-explanation`: The planet’s gravity exerts a force on the spacecraft. That force changes the spacecraft’s velocity and can curve its path during coasting. There is no need for an outward force to balance gravity; a curved path requires a resultant acceleration.

Each data question is associated with its relevant objective rather than a generic chapter objective. Command-word examples refer to this chapter. No physical activity is required.

## Final independent numeric fixture check

Every current numeric-answer field was checked by a separate Python script against hand-calculated literal expectations after transfer tasks were revised. Earlier audit entries for revised questions are superseded by this final table.

| Question | Expected result | Check |
|---|---|---|
| ch05-worked-explanation | 4 N | PASS |

Force ratio at four times separation = 1/16 = 0.0625; orbital circumference/speed = (2×3.14×14000)/14000 = 6.28 km/s.

## Core-coverage and independent-review corrections

Added explicit powers/standard-form questions (chapter 0), mass/weight, rotational equilibrium and centre-of-gravity/stability work (chapter 3), and force-work plus gravitational potential energy (chapter 7). Delayed cumulative questions were added to chapters 0, 2, 4 and 6. Applied the independent reviewer’s circular-motion, G/g, atmospheric support and requested-mark wording corrections. New arithmetic: 3.5×10⁶ m; 4.2×10⁻⁴ m; scale ratio 400; 14×9.8 = 137.2 N; 40/10 = 4 kg and 4×2.5 = 10 N; 24×0.35/14 = 0.60 m; work 28×3.5 = 98 J; potential energy 2.5×10×1.8 = 45 J; height 144/(4×10) = 3.6 m; projectile horizontal travel 3.0×0.80 = 2.4 m. These were separately recomputed in Python.
