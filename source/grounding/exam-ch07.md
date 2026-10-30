# Exam bank grounding: Chapter 7 — Energy

Original practice questions, 30 October 2026. Based on the existing section-by-section grounding in `ch07.md` and its MIT/OpenStax sources. All numerical situations are illustrative. Existing narrative files were not changed. Each numbered section is linked from at least one objective and question.

## Model answer audit

Concept answers specify interactions, reference conditions and system boundaries where relevant. One marking point earns one suggested mark; equivalent correct wording is accepted. These are suggested self-marking schemes, not official Cambridge marks.

- `ch07-o2-q1`: Kinetic energy = ½mv². ½ × 3 × 4² = 24 J. The answer is 24 J. Independently computed in the authoring Python calculation.
- `ch07-o2-q2`: Kinetic energy = ½mv². ½ × 5 × 6² = 90 J. The answer is 90 J. Independently computed in the authoring Python calculation.
- `ch07-o2-q3`: Kinetic energy = ½mv². ½ × 7 × 2² = 14 J. The answer is 14 J. Independently computed in the authoring Python calculation.
- `ch07-o2-q4`: Kinetic energy = ½mv². ½ × 9 × 4² = 72 J. The answer is 72 J. Independently computed in the authoring Python calculation.
- `ch07-o4-q1`: Percentage efficiency = useful output ÷ total input × 100. 90 ÷ 360 × 100 = 25 %. The answer is 25 %. Independently computed in the authoring Python calculation.
- `ch07-o4-q2`: Percentage efficiency = useful output ÷ total input × 100. 180 ÷ 450 × 100 = 40 %. The answer is 40 %. Independently computed in the authoring Python calculation.
- `ch07-o4-q3`: Percentage efficiency = useful output ÷ total input × 100. 280 ÷ 800 × 100 = 35 %. The answer is 35 %. Independently computed in the authoring Python calculation.
- `ch07-o4-q4`: Percentage efficiency = useful output ÷ total input × 100. 540 ÷ 900 × 100 = 60 %. The answer is 60 %. Independently computed in the authoring Python calculation.
- `ch07-o5-q1`: Average power = energy transferred ÷ time. 420 ÷ 7 = 60 W. The answer is 60 W. Independently computed in the authoring Python calculation.
- `ch07-o5-q2`: Average power = energy transferred ÷ time. 720 ÷ 9 = 80 W. The answer is 80 W. Independently computed in the authoring Python calculation.
- `ch07-o5-q3`: Average power = energy transferred ÷ time. 960 ÷ 12 = 80 W. The answer is 80 W. Independently computed in the authoring Python calculation.
- `ch07-o5-q4`: Average power = energy transferred ÷ time. 1350 ÷ 15 = 90 W. The answer is 90 W. Independently computed in the authoring Python calculation.

## Practical/data checks

All tables are supplied illustrative values. Questions ask for explanations or written investigation plans; no physical experiment is required. Any optional trial should use a low, clear indoor setup with adult guidance, never traffic, heights, mains electricity or dangerous projectiles.

Efficiency = 450/1000×100 = 45%; remaining transfer = 1000−450 = 550 J; appliance energy = 0.60×2.5 = 1.5 kWh.

## Sources

- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter13.pdf
- https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter14.pdf
- https://ocw.mit.edu/courses/8-21-the-physics-of-energy-fall-2009/76bb428d6455f6769501ff959cc28fee_MIT8_21s09_lec02.pdf

## Worked/guided audit

- `ch07-worked-explanation`: Average power = energy transferred ÷ time. 840 ÷ 21 = 40 W. The answer is 40 W.
- `ch07-guided-explanation`: Kinetic energy = ½mv². ½ × 4.0 × 3.0² = 18 J. The answer is 18 J.

Each data question is associated with its relevant objective rather than a generic chapter objective. Command-word examples refer to this chapter. No physical activity is required.

### Revised transfer `ch07-o2-q2`

The preceding numerical audit for this question is superseded by this changed-context/rearranged task: Kinetic energy is proportional to speed squared for fixed mass. The energy ratio is 6²/3² = 4. The faster trolley therefore has four times the kinetic energy.

### Revised transfer `ch07-o4-q2`

The preceding numerical audit for this question is superseded by this changed-context/rearranged task: Efficiency as a fraction = 0.30 = useful output ÷ input. Input = 210 ÷ 0.30 = 700 J.

### Revised transfer `ch07-o5-q2`

The preceding numerical audit for this question is superseded by this changed-context/rearranged task: Time = energy transferred ÷ power. 675 ÷ 45 = 15 s.

## Final independent numeric fixture check

Every current numeric-answer field was checked by a separate Python script against hand-calculated literal expectations after transfer tasks were revised. Earlier audit entries for revised questions are superseded by this final table.

| Question | Expected result | Check |
|---|---|---|
| ch07-o2-q1 | 24 J | PASS |
| ch07-o2-q3 | 14 J | PASS |
| ch07-o2-q4 | 72 J | PASS |
| ch07-o4-q1 | 25 % | PASS |
| ch07-o4-q2 | 700 J | PASS |
| ch07-o4-q3 | 35 % | PASS |
| ch07-o4-q4 | 60 % | PASS |
| ch07-o5-q1 | 60 W | PASS |
| ch07-o5-q2 | 15 s | PASS |
| ch07-o5-q3 | 80 W | PASS |
| ch07-o5-q4 | 90 W | PASS |
| ch07-worked-explanation | 40 W | PASS |
| ch07-guided-explanation | 18 J | PASS |

Efficiency = 450/1000×100 = 45%; remaining transfer = 1000−450 = 550 J; appliance energy = 0.60×2.5 = 1.5 kWh.

## Core-coverage and independent-review corrections

Added explicit powers/standard-form questions (chapter 0), mass/weight, rotational equilibrium and centre-of-gravity/stability work (chapter 3), and force-work plus gravitational potential energy (chapter 7). Delayed cumulative questions were added to chapters 0, 2, 4 and 6. Applied the independent reviewer’s circular-motion, G/g, atmospheric support and requested-mark wording corrections. New arithmetic: 3.5×10⁶ m; 4.2×10⁻⁴ m; scale ratio 400; 14×9.8 = 137.2 N; 40/10 = 4 kg and 4×2.5 = 10 N; 24×0.35/14 = 0.60 m; work 28×3.5 = 98 J; potential energy 2.5×10×1.8 = 45 J; height 144/(4×10) = 3.6 m; projectile horizontal travel 3.0×0.80 = 2.4 m. These were separately recomputed in Python.
