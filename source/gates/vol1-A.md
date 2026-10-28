# Gate A Report — Volume I (Chapters 0–4 & Volume I Stories)

**Scope:**
- **Chapters:** `src/ch00.md`, `src/ch01.md`, `src/ch02.md`, `src/ch03.md`, `src/ch04.md`
- **Grounding & Provenance:** `grounding/ch00.md`..`ch04.md`, `provenance/ch00.yml`..`ch04.yml`, `provenance/stories_motion.yml`, `provenance/stories_tales.yml`, `provenance/stories_people_part1.yml`
- **Stories:** `src/stories/estimation.md`, `src/stories/powers-of-ten.md`, `src/stories/si-units.md`, `src/stories/motion-graphs.md`, `src/stories/vectors.md`, `src/stories/impetus.md`, `src/stories/inertia.md`, `src/stories/third-law.md`, `src/stories/momentum.md`, `src/stories/falling.md`, `src/stories/circular.md`, `src/stories/kilogram.md`, `src/stories/pisa.md`, `src/stories/hammer-feather.md`, `src/stories/p-stevin.md`, `src/stories/p-galileo.md`, `src/stories/p-newton.md`

---

## 1. Findings & Direct Fixes

### Finding V1-A1
- **Where:** `src/stories/p-galileo.md:32` and `src/stories/p-newton.md:34`
- **Severity:** `BLOCKER`
- **What's wrong:** Both cast life stories contained raw LaTeX math delimiters (`$1$`, `$3$`, `$5$`, `$7$`, `$1+3=4$`, `$1+3+5=9$`, `$1+3+5+7=16$`, `$d \propto t^2$` in `p-galileo.md`; `$60^2 = 3,600$`, `$9.8\text{ m/s}^2$`, `$4.9\text{ m}$`, `$0.00272\text{ m/s}^2$`, `$1.36\text{ mm}$` in `p-newton.md`). Because `build.py` does not run a LaTeX math parser, these rendered as literal `$` and `\text{ m/s}^2` strings in `build/gate_check.html`.
- **Evidence:** `python3 -I -c 'import re; print(re.findall(r"\$[^\$]+\$", open("source/build/gate_check.html").read()))'` confirmed literal unparsed `$60^2 = 3,600$` and `$0.00272\text{ m/s}^2$` in the output HTML.
- **Status:** `FIXED` — Replaced all raw LaTeX strings with clean Unicode typography (`1`, `3`, `5`, `7`, `*d* ∝ *t*²`, `60² = 3,600`, `9.8 m/s²`, `0.00272 m/s²`, `1.36 mm`, `4.9 m`).

### Finding V1-A2
- **Where:** `src/stories/p-stevin.md:40`
- **Severity:** `FIX`
- **What's wrong:** Decimal fractions were wrapped in Markdown code backticks (`` `0.1`, `0.01`, `0.001` ``), rendering them as monospace `<code>` elements in prose (`FORMAT.md` reserves plain typography for numbers in prose).
- **Evidence:** Inspection of `build/gate_check.html` showed `<code>0.1</code>, <code>0.01</code>, <code>0.001</code>`.
- **Status:** `FIXED` — Removed code backticks around `(0.1, 0.01, 0.001)`.

### Finding V1-A3
- **Where:** `src/ch00.md:209` (`:::idea` block in §0.3)
- **Severity:** `FIX`
- **What's wrong:** Used American spelling `"It is not a license to be sloppy"` instead of British noun `"licence"` (`WRITING.md` & `GATES.md` mandate British English throughout).
- **Evidence:** British English distinguishes the noun *licence* from the verb *license*.
- **Status:** `FIXED` — Changed `license` to `licence`.

### Finding V1-A4
- **Where:** `src/ch02.md:100` (§2.3) and `src/ch03.md:174, 176` (§3.3)
- **Severity:** `FIX`
- **What's wrong:** Anthropomorphism of inanimate objects:
  1. `src/ch02.md:100`: `"the ball rolls further still, always seeking the same height"`
  2. `src/ch03.md:174`: `"squeezed a tiny bit closer together than they like to sit"`
  3. `src/ch03.md:176`: `"It is whatever it needs to be to stop the object sinking in"`
- **Evidence:** `NARRATIVE.md` & `WRITING.md` rule: *"No anthropomorphism. Forces do not try. Nature does not want."*
- **Status:** `FIXED` — Reworded to `"always climbing to the same height"`, `"than their normal spacing"`, and `"It grows to whatever size is required to stop the object sinking in"`.

### Finding V1-A5
- **Where:** `src/ch01.md:287–288` (§1.5 `:::work` "The one-metre toss, step by step")
- **Severity:** `FIX`
- **What's wrong:** The printed height series rounded to the nearest centimetre reads `0, 39, 69, 89, 99, 99, 89, 70, 41, 2 cm`, while the printed gap series below it reads `39, 30, 20, 10, 0.2, −10, −19, −29, −39 cm`. A careful reader subtracting the fifth and sixth printed numbers (`99 − 99`) gets `0 cm`, not `0.2 cm`, because the `0.2 cm` comes from the unrounded heights `98.69 cm` and `98.86 cm`.
- **Evidence:** `python3 -I -c 'import math; v0=math.sqrt(2*9.8*1.0); hs=[v0*i*0.1 - 0.5*9.8*(i*0.1)**2 for i in range(10)]; print([round(h*100,2) for h in hs])'` → `[0.0, 39.37, 68.94, 88.72, 98.69, 98.86, 89.23, 69.8, 40.58, 1.55]`.
- **Status:** `FIXED` — Added parenthetical clarification `(the two 99s are 98.7 and 98.9 cm before rounding)` on line 287 so the `0.2 cm` step is transparent.

### Finding V1-A6
- **Where:** `src/stories/hammer-feather.md:20, 22` and `37–38, 48`
- **Severity:** `FIX`
- **What's wrong:**
  1. Two exclamation marks appeared on consecutive lines (`"How about that!" says Scott.` and `"How about that!" says Joe Allen...`), exceeding the 1-exclamation-mark budget.
  2. Line 38 used `g = 1.62 m/s²` (`√(2 × 1.2 ÷ 1.62) = 1.22 s`) while line 48 (`c4_moon_strobe()` caption) quoted `g is 1.67 m/s²` without noting that `1.67 m/s²` is OpenStax's rounded 1/6 of Earth's `9.8 m/s²`.
- **Evidence:** `python3 -I -c 'import math; print(round(math.sqrt(2*1.2/1.62),2), round(math.sqrt(2*1.2/1.67),2))'` → `1.22`, `1.20`.
- **Status:** `FIXED` — Changed Joe Allen's punctuation to a comma (`"How about that," says Joe Allen...`) and noted both `1.62 m/s²` (`1.22 s`) and the rounded `1.67 m/s²` (`1.20 s`) in the `:::work` block.

### Finding V1-A7
- **Where:** `grounding/ch01.md:355` (Grounding note only; already corrected in `src/ch01.md:281, 288` and `provenance/ch01.yml`)
- **Severity:** `CONSIDER`
- **What's wrong:** The grounding note's list of 1-metre-toss gaps had a subtraction slip at `t = 0.6 -> 0.7 s` (`69.8 - 89.2 = -19.4 cm`, written `-19.6`) and omitted the 9th interval (`1.5 - 40.6 = -39.1 cm`). The chapter text (`src/ch01.md:281, 288`) and `provenance/ch01.yml:112` already caught and corrected this to `−19 cm` and `−39 cm`.
- **Evidence:** `python3 -I -c 'print(round(69.8 - 89.2, 1), round(1.55 - 40.58, 1))'` → `-19.4 -39.0`.
- **Status:** `REPORT` — Already accurate in `src/ch01.md`; noted for grounding audit trail.

---

## 2. Chapter-by-Chapter & Story Verification Log

| Unit | Numbers Recomputed (`python3 -I -c`) | Grounding & Fidelity Traps | Provenance (`provenance/*.yml`) | Style & Spelling |
| :--- | :--- | :--- | :--- | :--- |
| **Ch 0 (`src/ch00.md`)** | Mumbai rain: `40e3 * 15e3 * 0.1 * 1000 = 6e10 kg = 6e7 t` (PASS). Rice in 5 kg: `2500 * 100 = 250,000` (PASS). Piano tuners: `(3e6/5*0.1)/(3*5*50) = 80` (PASS). Heartbeats in 12 yr: `70*60*24*365*12 = 4.42e8` (PASS). Pendulum `L=0.25, 0.5, 1.0 m`: `T = 1.00, 1.42, 2.01 s` (PASS). Eratosthenes: `360/7.2 = 50`, `50*800 = 40,000 km`, `111 km/deg` (PASS). Mumbai–Delhi: `9.5°`, `37.9 * 1150 ≈ 43,600–43,700 km` (PASS). Zero-shadow days in Mumbai (`19.08° N`): May & July (PASS). | No weight/mass conflation; no "more digits = more accurate"; Eratosthenes wells/sticks contrast clear. | `provenance/ch00.yml` complete for §0.1–0.6 and all `c0_*` figures. | 0 em-dashes, 0 `!`, `license` → `licence` FIXED. |
| **Ch 1 (`src/ch01.md`)** | Train `18 km / 0.4 h = 45 km/h = 12.5 m/s` (PASS). Walk `10 m / 7 s = 1.43 m/s = 5.14 km/h` (PASS). Train `80 km/h = 22.2 m/s`, `+1.4 = 23.6 m/s`, `-1.4 = 20.8 m/s` (PASS). Bolt `5 m/s²`, cheetah `9 m/s²`, local `0.5 m/s²`, braking `-0.8 m/s²` (PASS). Galileo ramp `1, 4, 9, 16` & odd diffs `1, 3, 5, 7` (PASS). 1.0 m toss `v0 = 4.43 m/s`, `t_top = 0.452 s`, heights & gaps verified (PASS). | Position vs distance distinguished; graph is not a map; crossing ≠ equal speed; `a = -9.8 m/s²` at top of toss (`v = 0` for one instant, never a flat plateau). | `provenance/ch01.yml` complete for §1.1–1.5 and all `c1_*` figures. | 0 em-dashes, 0 `!`, British spelling clean. |
| **Ch 2 (`src/ch02.md`)** | Delft drop: `30 ft = 9.1 m`, `t = sqrt(2*9.1/9.8) = 1.36–1.37 s`, Aristotle `13.7 s` (PASS). Voyager 1: `5 Sep 1977`, `17 km/s`, `~24 billion km` (PASS). | Impetus named & dismantled; 0 upward force arrows on flying ball after release; Galileo's double-ramp thought experiment honest; Pisa drop flagged as Viviani story. | `provenance/ch02.yml` complete for §2.1–2.5 and all `c2_*` figures. | 0 em-dashes, 0 `!`, `seeking` → `climbing` FIXED. |
| **Ch 3 (`src/ch03.md`)** | Tug-of-war: `120+100+90+80 = 390 N` vs `150+130+110 = 390 N` (PASS). Cart: `1 N / 0.5 kg = 2 m/s²`, `2 N / 0.5 kg = 4 m/s²`, `1 N / 1.0 kg = 1 m/s²` (PASS). Bat/ball: `0.16 * 30 / 0.001 = 4,800 N` (PASS). 40 kg Kym: `392 N` Earth, `65 N` Moon, `148 N` Mars, `1,000 N` Jupiter, `350 N` ISS (`g ≈ 8.8 N/kg` at 350 km) (PASS). Skier `60 kg` on `25°`: `588 * cos 25° = 533 N` (PASS). Lift `600 kg`: `5,880 N` steady, `7,080 N` (`48 kg` scale) at `+2 m/s²`, `4,680 N` (`32 kg` scale) at `-2 m/s²` (PASS). Mosquito `2 mg` vs `1000 kg` car at `20 m/s`, `1 ms`: `F = 0.04 N`, `a_m = 20,000 m/s²` (`2000 g`), `a_car = 4e-5 m/s²` (PASS). Skateboard `40 kg` + `4 kg` bag at `5 m/s`: `v = 0.5 m/s` (PASS). Earth recoil: `1.3e-23 m/s` (PASS). | Minstrell spring-sponge-ruler-table bridging chain intact; normal force + weight on same body never called a 3rd-law pair; rocket pushes exhaust gas, not air. | `provenance/ch03.yml` complete for §3.1–3.6 and all `c3_*` figures. | 0 em-dashes, 0 `!`, anthropomorphism FIXED. |
| **Ch 4 (`src/ch04.md`)** | 10 m drop: `1.43 s`, `14.0 m/s = 50.4 km/h` (PASS). 1.00 m drop: `0.452 s`, `13.6` frames at 30 fps, `108.4` frames at 240 fps (PASS). Ruler reaction: `0.18 s -> 15.9 cm`, `20 cm -> 0.202 s` (PASS). Moon 1.6 m drop: `1.38 s` (`g=1.67`) vs `0.57 s` Earth (PASS). Raindrop 2,000 m without air: `20.2 s`, `198 m/s = 713 km/h` vs real `6.5 m/s` (PASS). Table `0.80 m`: `t = 0.404 s`, `x = 0.61 m` (`1.5 m/s`), `1.21 m` (`3.0 m/s`) (PASS). Bucket `r = 0.8 m`: `v_min = 2.80 m/s`, `T = 1.80 s`; at `5 m/s`, `a = 31.25 m/s² ≈ 3.2 g` (PASS). | Free fall = gravity alone; mass cancellation `a = mg/m = g` explicit; horizontal & vertical independence; centripetal is a role, never a separate arrow; no outward force on whirling stone in ground frame. | `provenance/ch04.yml` complete for §4.1–4.5 and all `c4_*` figures. | 0 em-dashes, 0 `!`, British spelling clean. |
| **Vol I Stories (17 files)** | All calculations in `estimation`, `powers-of-ten`, `si-units`, `motion-graphs`, `vectors`, `impetus`, `inertia`, `third-law`, `momentum`, `falling`, `circular`, `kilogram`, `pisa`, `hammer-feather`, `p-stevin`, `p-galileo`, `p-newton` verified via Python. | Historical hedges respected (`pisa`, `impetus`, `inertia`, `momentum` bicycle/bullock cart, `p-galileo`, `p-newton` apple). | Covered in `stories_motion.yml`, `stories_tales.yml`, `stories_people_part1.yml`. | LaTeX `$` in `p-galileo`/`p-newton`, backticks in `p-stevin`, excess `!` in `hammer-feather` FIXED. |

---

## 3. Summary Counts (Volume I — Gate A)

- **BLOCKER:** 1 found (`V1-A1`: raw unparsed LaTeX in `p-galileo.md` & `p-newton.md`) — **1 FIXED, 0 remaining**
- **FIX:** 5 found (`V1-A2` through `V1-A6`) — **5 FIXED, 0 remaining**
- **CONSIDER:** 1 found (`V1-A7`: grounding-only typo already fixed in prose) — **0 action needed**
