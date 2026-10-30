# Exam bank grounding: Chapter 4 — Falling

Original practice questions, 30 October 2026. Based on the existing section-by-section grounding in `ch04.md` and its MIT/OpenStax sources. All numerical situations are illustrative. Existing narrative files were not changed. Each numbered section is linked from at least one objective and question.

## Model answer audit

Concept answers specify interactions, reference conditions and system boundaries where relevant. One marking point earns one suggested mark; equivalent correct wording is accepted. These are suggested self-marking schemes, not official Cambridge marks.

- `ch04-o3-q1`: Weight = mass × gravitational field strength. 7.5 × 1.6 = 12 N. The answer is 12 N. Independently computed in the authoring Python calculation.
- `ch04-o3-q2`: Weight = mass × gravitational field strength. 12.5 × 1.6 = 20 N. The answer is 20 N. Independently computed in the authoring Python calculation.
- `ch04-o3-q3`: Weight = mass × gravitational field strength. 18 × 1.6 = 28.8 N. The answer is 28.8 N. Independently computed in the authoring Python calculation.
- `ch04-o3-q4`: Weight = mass × gravitational field strength. 24 × 1.6 = 38.4 N. The answer is 38.4 N. Independently computed in the authoring Python calculation.

## Practical/data checks

All tables are supplied illustrative values. Questions ask for explanations or written investigation plans; no physical experiment is required. Any optional trial should use a low, clear indoor setup with adult guidance, never traffic, heights, mains electricity or dangerous projectiles.

Alternative-body free-fall speed = 2.4×1.5 = 3.6 m/s. Supplied terminal-speed interval is 3–4 s at 10 m/s.

## Sources

- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/online-textbook/
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter5.pdf
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/week-2-newtons-laws/5-3-gravity-at-the-surface-of-the-earth-the-value-of-g/

## Worked/guided audit

- `ch04-worked-explanation`: For release from rest, speed gained = g × time. 9.8 × 0.80 = 7.84 m/s downwards. The answer is 7.84 m/s.
- `ch04-guided-explanation`: Resultant force = 800 − 600 = 200 N upwards. The parachutist is still moving downwards. The upward acceleration reduces the downward speed.

Each data question is associated with its relevant objective rather than a generic chapter objective. Command-word examples refer to this chapter. No physical activity is required.

### Revised transfer `ch04-o3-q2`

The preceding numerical audit for this question is superseded by this changed-context/rearranged task: Mass = weight ÷ gravitational field strength. 24 ÷ 1.6 = 15 kg. Its mass remains 15 kg on Earth; its weight changes with the gravitational field.

## Final independent numeric fixture check

Every current numeric-answer field was checked by a separate Python script against hand-calculated literal expectations after transfer tasks were revised. Earlier audit entries for revised questions are superseded by this final table.

| Question | Expected result | Check |
|---|---|---|
| ch04-o3-q1 | 12 N | PASS |
| ch04-o3-q3 | 28.8 N | PASS |
| ch04-o3-q4 | 38.4 N | PASS |
| ch04-worked-explanation | 7.84 m/s | PASS |

Alternative-body free-fall speed = 2.4×1.5 = 3.6 m/s. Supplied terminal-speed interval is 3–4 s at 10 m/s.

## Core-coverage and independent-review corrections

Added explicit powers/standard-form questions (chapter 0), mass/weight, rotational equilibrium and centre-of-gravity/stability work (chapter 3), and force-work plus gravitational potential energy (chapter 7). Delayed cumulative questions were added to chapters 0, 2, 4 and 6. Applied the independent reviewer’s circular-motion, G/g, atmospheric support and requested-mark wording corrections. New arithmetic: 3.5×10⁶ m; 4.2×10⁻⁴ m; scale ratio 400; 14×9.8 = 137.2 N; 40/10 = 4 kg and 4×2.5 = 10 N; 24×0.35/14 = 0.60 m; work 28×3.5 = 98 J; potential energy 2.5×10×1.8 = 45 J; height 144/(4×10) = 3.6 m; projectile horizontal travel 3.0×0.80 = 2.4 m. These were separately recomputed in Python.
