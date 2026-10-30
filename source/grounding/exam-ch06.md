# Exam bank grounding: Chapter 6 — Pressure, floating and the ocean of air

Original practice questions, 30 October 2026. Based on the existing section-by-section grounding in `ch06.md` and its MIT/OpenStax sources. All numerical situations are illustrative. Existing narrative files were not changed. Each numbered section is linked from at least one objective and question.

## Model answer audit

Concept answers specify interactions, reference conditions and system boundaries where relevant. One marking point earns one suggested mark; equivalent correct wording is accepted. These are suggested self-marking schemes, not official Cambridge marks.

- `ch06-o1-q1`: Pressure = normal force ÷ area. 72 ÷ 0.024 = 3000 Pa. The answer is 3000 Pa. Independently computed in the authoring Python calculation.
- `ch06-o1-q2`: Pressure = normal force ÷ area. 95 ÷ 0.019 = 5000 Pa. The answer is 5000 Pa. Independently computed in the authoring Python calculation.
- `ch06-o1-q3`: Pressure = normal force ÷ area. 108 ÷ 0.036 = 3000 Pa. The answer is 3000 Pa. Independently computed in the authoring Python calculation.
- `ch06-o1-q4`: Pressure = normal force ÷ area. 154 ÷ 0.022 = 7000 Pa. The answer is 7000 Pa. Independently computed in the authoring Python calculation.
- `ch06-o4-q1`: Pressure increase = density × g × vertical depth increase. 1000 × 10 × 0.35 = 3500 Pa. The answer is 3500 Pa. Independently computed in the authoring Python calculation.
- `ch06-o4-q2`: Pressure increase = density × g × vertical depth increase. 1000 × 10 × 0.65 = 6500 Pa. The answer is 6500 Pa. Independently computed in the authoring Python calculation.
- `ch06-o4-q3`: Pressure increase = density × g × vertical depth increase. 1000 × 10 × 0.85 = 8500 Pa. The answer is 8500 Pa. Independently computed in the authoring Python calculation.
- `ch06-o4-q4`: Pressure increase = density × g × vertical depth increase. 1000 × 10 × 1.2 = 12000 Pa. The answer is 12000 Pa. Independently computed in the authoring Python calculation.

## Practical/data checks

All tables are supplied illustrative values. Questions ask for explanations or written investigation plans; no physical experiment is required. Any optional trial should use a low, clear indoor setup with adult guidance, never traffic, heights, mains electricity or dangerous projectiles.

Displaced volumes = 300/1 = 300 cm³ and 300/1.2 = 250 cm³; solid density = 2.4/0.0008 = 3000 kg/m³.

## Sources

- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter27.pdf
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/syllabus/
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/week-4-drag-forces-constraints-and-continuous-systems/

## Worked/guided audit

- `ch06-worked-explanation`: Pressure = normal force ÷ area. 280 ÷ 0.070 = 4000 Pa. The answer is 4000 Pa.
- `ch06-guided-explanation`: Pressure increase = density × g × vertical depth increase. 800 × 10 × 0.45 = 3600 Pa. The answer is 3600 Pa.

Each data question is associated with its relevant objective rather than a generic chapter objective. Command-word examples refer to this chapter. No physical activity is required.

### Revised transfer `ch06-o1-q2`

The preceding numerical audit for this question is superseded by this changed-context/rearranged task: Area = normal force ÷ pressure. 96 ÷ 2400 = 0.040 m²; a smaller area would exceed the pressure limit.

### Revised transfer `ch06-o4-q2`

The preceding numerical audit for this question is superseded by this changed-context/rearranged task: Depth difference = pressure increase ÷ (density × g). 7200 ÷ (1000 × 10) = 0.72 m.

## Final independent numeric fixture check

Every current numeric-answer field was checked by a separate Python script against hand-calculated literal expectations after transfer tasks were revised. Earlier audit entries for revised questions are superseded by this final table.

| Question | Expected result | Check |
|---|---|---|
| ch06-o1-q1 | 3000 Pa | PASS |
| ch06-o1-q2 | 0.04 m² | PASS |
| ch06-o1-q3 | 3000 Pa | PASS |
| ch06-o1-q4 | 7000 Pa | PASS |
| ch06-o4-q1 | 3500 Pa | PASS |
| ch06-o4-q2 | 0.72 m | PASS |
| ch06-o4-q3 | 8500 Pa | PASS |
| ch06-o4-q4 | 12000 Pa | PASS |
| ch06-worked-explanation | 4000 Pa | PASS |
| ch06-guided-explanation | 3600 Pa | PASS |

Displaced volumes = 300/1 = 300 cm³ and 300/1.2 = 250 cm³; solid density = 2.4/0.0008 = 3000 kg/m³.

## Core-coverage and independent-review corrections

Added explicit powers/standard-form questions (chapter 0), mass/weight, rotational equilibrium and centre-of-gravity/stability work (chapter 3), and force-work plus gravitational potential energy (chapter 7). Delayed cumulative questions were added to chapters 0, 2, 4 and 6. Applied the independent reviewer’s circular-motion, G/g, atmospheric support and requested-mark wording corrections. New arithmetic: 3.5×10⁶ m; 4.2×10⁻⁴ m; scale ratio 400; 14×9.8 = 137.2 N; 40/10 = 4 kg and 4×2.5 = 10 N; 24×0.35/14 = 0.60 m; work 28×3.5 = 98 J; potential energy 2.5×10×1.8 = 45 J; height 144/(4×10) = 3.6 m; projectile horizontal travel 3.0×0.80 = 2.4 m. These were separately recomputed in Python.
