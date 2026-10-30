# Motion exam pilot: grounding and answer audit

Authored 30 October 2026 for the existing Chapter 1 of *The Moving World*. This note covers `source/exams/motion.json`. The narrative chapter is unchanged by this content work.

## Scope and source lineage

The pilot contains 8 working objectives, 30 progressive practice questions, 10 revision cards, 10 technique entries, and two separate 6-question practice papers. Each paper has 14 suggested marks and an optional 15-minute practice duration. These are original practice materials and editorial timing choices, not official Cambridge papers, grade boundaries or approved Cambridge marking schemes. The reader must compare the checklist with her school's actual Grade 8 topic list. No claim is made that Cambridge Stage 8 and an Indian school's Grade 8 are interchangeable.

The scientific content reuses the sources already grounded in `ch01.md` on 28 October 2026 and recorded in `source/provenance/ch01.yml`. They are listed here to make the relationship reviewable; this note does not claim a fresh source fetch or a physical learner trial. The original questions, illustrative values, suggested marking points and phrasing are newly authored; no past-paper questions or restricted diagnostic items are reproduced.

| Objective | Chapter connection | Source and use |
|---|---|---|
| Frames, distance and displacement | §1.1 | [MIT 8.01SC reference frames](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/week-2-newtons-laws/4-3-reference-frames/), [OpenStax Physics 2.1](https://openstax.org/books/physics/pages/2-1-relative-motion-distance-and-displacement): motion needs a frame; distinguish path length from change in position. |
| Average speed and velocity | §1.2 | [OpenStax Physics 2.2](https://openstax.org/books/physics/pages/2-2-speed-and-velocity): total distance/total time versus displacement/time; direction in velocity. |
| Unit conversion and equation rearrangement | §1.2 | Same speed relation, SI unit definitions, and the original computations below. |
| Position and distance graphs | §1.2 | [OpenStax Physics 2.3](https://openstax.org/books/physics/pages/2-3-position-vs-time-graphs): position–time gradient as velocity; distinguish a graph from a route drawing. |
| Acceleration | §1.3 | [MIT 8.01SC acceleration](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/week-1-kinematics/2-2-acceleration-in-1d/), [OpenStax College Physics 2e 2.4](https://openstax.org/books/college-physics-2e/pages/2-4-acceleration): rate of change of velocity; turning at constant speed; signed acceleration and slowing. |
| Speed–time graphs | §1.4 | [MIT kinematics notes, Ch 4](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter4.pdf), [OpenStax Physics 3.2](https://openstax.org/books/physics/pages/3-2-representing-acceleration-with-equations-and-graphs): areas as distance for speed graphs; linear segments represent constant acceleration. |
| Investigation and data | §§1.2, 1.4 | The existing gentle ramp and timed-journey chapter activities; repeated measurements, clear variables and compatible units. [Cambridge Lower Secondary Science 0893](https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-lower-secondary/curriculum/science/) explicitly includes scientific enquiry and practical work. |
| Free fall | §1.5 | [OpenStax College Physics 2e 2.7](https://openstax.org/books/college-physics-2e/pages/2-7-falling-objects), [MIT introduction to acceleration](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/week-1-kinematics/2-1-introduction-to-acceleration/): downward acceleration persists at the top of an upward throw; gravity-only model. |

Memory and practice design draws on the cited findings in `docs/grade8-exam-preparation-research.md` and the [IES study guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1). Specific question counts, marks, paper durations and choice of cues are design judgments; the evidence does not prescribe them or guarantee results for this student.

## Numerical audit

All practice inputs are illustrative values chosen for the questions, including vehicle speeds and timing readings. They are not measured Mumbai transport statistics or observations from a real learner. The values below were recomputed with Python from the givens independently of the stored answer values. All 18 numeric-entry values matched to floating-point precision. Any alternative unit in a handwritten answer needs checking against the question's requested unit and method points.

| Question ID suffix | Independent computation | Answer |
|---|---|---|
| worked-speed | `1200 / (4 * 60)` | 5 m/s |
| guided-time | `600 / 3` | 200 s |
| worked-acceleration | `(10 - 2) / 4` | 2 m/s² |
| guided-acceleration | `(4 - 12) / 4` | −2 m/s² |
| worked-area | `0.5 * 4 * 6` | 12 m |
| guided-area | `4 * 3 + 0.5 * 2 * 3` | 15 m |
| worked-frame | `8 + 1` | 9 m/s |
| guided-position | `(10 - 2) / (5 - 1)` | +2 m/s |
| independent-speed | `(150 / 100) / 0.5` | 3 m/s |
| independent-distance | `2 * 1.5 * 60` | 180 m |
| independent-acceleration | `(9 - 3) / 3` | +2 m/s² |
| independent-speed-graph | `0.5 * 2 * 4 + 3 * 4 + 0.5 * 2 * 4` | 20 m |
| review-position-gradient | `(15 - 3) / (6 - 2)` | +3 m/s |
| paper-a-2 | `540 / (3 * 60)` | 3 m/s |
| paper-a-4 | `(7 - 1) / 3` | 2 m/s² |
| paper-b-2 | `(360 + 360) / (120 + 60 + 120)` | 2.4 m/s |
| paper-b-3 | `5 * 4 + 0.5 * 4 * 5` | 30 m |
| paper-b-6 | `9.8 * 0.5` | 4.9 m/s |

Additional multipart answers and worked card examples, also recomputed:

- Independent round trip: `120+120 = 240 m`; `120−120 = 0 m`; `240/160 = 1.5 m/s`.
- Transfer boats: `240/(2×60) = 2 m/s`; `7.2×1000/3600 = 2 m/s`; equal speeds.
- Transfer negative acceleration: `(−6−(−2))/2 = −2 m/s²`; speed increases from 2 to 6 m/s.
- Review robot: `18+6 = 24 m`; `18−6 = 12 m north`; `24/8 = 3 m/s`.
- Review speed graph: `(8−0)/4 = 2 m/s²`; `0.5×4×8 = 16 m`.
- Review measurements: `(0.4+0.5+0.6)/3 = 0.5 s`; `0.8/0.5 = 1.6 m/s`.
- Paper A route: `35+15 = 50 m`; `35−15 = 20 m east`.
- Paper B repeated readings: `(2.1+2.0+2.2)/3 = 2.1 s`.
- Cards: `10+10 = 20 m` and `10−10 = 0 m`; `100/20 = 5 m/s`; `30/10 = 3 m/s`; `72×1000/3600 = 20 m/s`; `90/100 = 0.9 m`; `2×60 = 120 s`; `12/4 = 3 m/s`; `(7−1)/3 = 2 m/s²`; `3×4 = 12 m`; `0.5×3×4 = 6 m`.
- Technique example: `120/30 = 4 m/s`.

## Graph, language and marking checks

- Every provided graph has time in seconds on the horizontal axis and names its vertical quantity and unit. The position graph has a falling segment; the distance-travelled graphs never decrease. The timed papers use exclusive question IDs, so practice attempts do not silently prefill their answers.
- The graph-drawing question supplies only the data table; displaying the requested graph before the attempt would reveal its answer. Its suggested guidance specifies axis labels, uniform scales, points and the instructed straight segment joins. Hand-drawn graphs need human comparison with those criteria.
- The original motion graphs used for calculation have linear segments and explicit uniform acceleration or slowing, so rectangle and triangle areas give exact distances within the stated models.
- Every marking-point string is worth one suggested mark; `marks` equals the length of `points`. The point lists distinguish scientific reasons from labels. Equivalent wording is accepted, and selected questions add specific alternative wording or signed-direction guidance.
- A correct final numeric value alone does not prove that every method point is earned. The learner must compare her working with the supplied points, and progress should identify these as self-marked attempts.
- Frames are named, velocity is not confused with speed, average values are not claimed to be instantaneous, negative acceleration is not equated with slowing, and free-fall questions explicitly ignore air resistance. No continuing upward hand force is implied after release.

## Safety and actual-use limits

The practical questions ask for a written plan, so no equipment or experiment is required to complete the pilot. Optional physical trials use a small toy car, low gentle ramp, clear indoor route and stopping area, with an adult reading the plan first; they exclude stairs and doorways. There are no instructions to experiment on roads, railways, balconies or with thrown objects. A balcony is only part of the description of an already-flying ball, not a place to perform a trial.

No household experiment has been physically tested in this authoring pass. Automated answer and UI checks cannot establish student comprehension, teacher agreement with a school's marking, or actual exam readiness. The planned independent content gate should check this catalog against these source notes, recompute the arithmetic and review the explanations as a twelve-year-old reader would.

## Independent content review corrections

The independent reviewer identified five precision issues, corrected on 30 October 2026. The speed–time objective now qualifies its constant-acceleration statement as straight-line motion without reversing direction. The highest-point practice question explicitly asks for the explanation needed to earn its third mark. Paper A specifies a vertical upward throw. The gradient-card example specifies uniform motion, so its stated velocity follows from its data. Paper B separates scalar speed from the downward direction of velocity. The review speed–time question also explicitly specifies motion along a straight line. These changes alter wording, not numerical answers or mark totals.
