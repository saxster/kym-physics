# Gate A Report — Volume II (Chapters 5–7 & Volume II Stories)

**Scope:**
- Chapters: `src/ch05.md` (Gravity and Orbits), `src/ch06.md` (Pressure and Fluids), `src/ch07.md` (Energy)
- Grounding notes: `grounding/ch05.md`, `grounding/ch06.md`, `grounding/ch07.md`
- Provenance manifests: `provenance/ch05.yml`, `provenance/ch06.yml`, `provenance/ch07.yml`, `provenance/stories_energy.yml`, `provenance/stories_tales.yml`, `provenance/stories_people_part1.yml`, `provenance/stories_people_part2.yml`
- Volume II Stories (19): `gravity.md`, `orbits.md`, `kepler.md`, `planet-from-a-pen.md`, `chandrayaan.md`, `sun-watcher.md`, `ocean-of-air.md`, `floating.md`, `vis-viva.md`, `conservation.md`, `cavendish-shed.md`, `fish-book.md`, `proportion.md`, `p-brahmagupta.md`, `p-bhaskara.md`, `p-halley.md`, `p-du-chatelet.md`, `p-sarabhai.md`, `p-chawla.md`

---

## 1. Python Numerical Verification (`python3 -I -c`)

Every numerical statement, worked example, figure caption, check question, and story calculation across Chapters 5–7 and the 19 Volume II stories was independently recomputed in `python3 -I -c`:

| Location | Claim in Text | Independent Python Result | Status |
|---|---|---|---|
| `src/ch05.md:28,34,47` | Moon at $60 R_E$: inverse-square factor $60^2 = 3600$; $a = 9.8 / 3600 = 0.00272\text{ m/s}^2$; 1 s drop $= 1.36\text{ mm}$ vs apple's $4.9\text{ m}$ ($4.9\text{ m} / 3600 = 1.361\text{ mm}$); orbital speed $2\pi(384{,}000\text{ km}) / (27.3\text{ d}) \approx 1.02\text{ km/s}$ | $9.8/3600 = 0.002722\text{ m/s}^2$; $\frac{1}{2}a(1)^2 = 1.361\text{ mm}$; $v = 1023\text{ m/s}$; $v^2/r = 0.002724\text{ m/s}^2$ | PASS |
| `src/ch05.md:38` | "in one minute the Moon falls 4.9 m below its straight line, which is what the apple falls in one second. A minute has 3600 seconds..." | $\frac{1}{2}(0.002722)(60)^2 = 4.90\text{ m}$, which matches the apple's 1 s fall because $t^2 = 60^2 = 3600\text{ s}^2$ — **NOT** because a minute has 3600 seconds (a minute has 60 seconds!) | **FIXED (BLOCKER)** |
| `src/ch05.md:118` | ISS at $400\text{ km}$ above $6400\text{ km}$ Earth: distance $6800\text{ km}$, $(6400/6800)^2 = 0.886$, so $g \approx 8.7\text{ m/s}^2$ (~89% of surface $g$) | $9.8 \times (6400/6800)^2 = 8.681\text{ m/s}^2$ ($88.58\%$) | PASS |
| `src/ch05.md:124` | Phone dropped from $40\text{ cm}$ onto a pillow: free-fall time $\approx 0.29\text{ s}$ | $\sqrt{2 \times 0.40 / 9.8} = 0.2857\text{ s} \approx 0.29\text{ s}$ | PASS |
| `src/ch05.md:156` | Newton's cannonball: at $8\text{ km/s}$, Earth curves down by $\sim 5\text{ m}$ in $1\text{ s}$; full lap of $40{,}000\text{ km}$ takes $5000\text{ s} \approx 84\text{ min}$ | $x^2/(2R_E) = 8000^2/(2 \times 6.371\times 10^6) = 5.02\text{ m}$ ($4.90\text{ m}$ at $7.9\text{ km/s}$); $2\pi R_E / 7900 = 5066\text{ s} = 84.4\text{ min}$ | PASS |
| `src/ch05.md:206` | Mars ellipse to scale: $a = 10\text{ cm}$, pins $0.9\text{ cm}$ either side of midpoint ($e = 0.0934$) | $c = ae = 0.934\text{ cm} \approx 0.9\text{ cm}$; $b = a\sqrt{1-e^2} = 9.956\text{ cm}$ | PASS |
| `src/ch05.md:232` | Kepler's 3rd law ($T^2 \propto a^3$): Mars $a=1.52\text{ AU}, T=1.88\text{ yr}$ ($1.52^3=3.51, 1.88^2=3.53$); Jupiter $a=5.2\text{ AU}, T=11.86\text{ yr}$ ($5.2^3=140.6, 11.86^2=140.7$) | $1.524^3 = 3.540, 1.881^2 = 3.538$; $5.203^3 = 140.85, 11.862^2 = 140.71$ | PASS |
| `src/ch05.md:246` | Geostationary orbit: $T = 86{,}400\text{ s}$ is $\sim 17\times$ low-orbit $5000\text{ s}$; $17^2 \approx 290$; $\sqrt[3]{290} \approx 6.6 R_E \approx 42{,}000\text{ km}$ from centre ($\sim 36{,}000\text{ km}$ altitude) | Exact sidereal $r_{\text{geo}} = 42{,}164\text{ km}$, altitude $35{,}786\text{ km}$ | PASS |
| `src/ch05.md:288` | Cavendish: $G = 6.67\times 10^{-11}\text{ N}\cdot\text{m}^2/\text{kg}^2$; two $1\text{ kg}$ melons $1\text{ m}$ apart pull with $6.67\times 10^{-11}\text{ N}$; $M_E = g R_E^2 / G = 5.97\times 10^{24}\text{ kg}$; average density $\approx 5500\text{ kg/m}^3$ ($5.5\times$ water) | $9.81 \times (6.371\times 10^6)^2 / 6.674\times 10^{-11} = 5.97\times 10^{24}\text{ kg}$; $\rho = 5514\text{ kg/m}^3$ | PASS |
| `src/ch05.md:338,348` | Escape speed: $\sqrt{2} \times 7.9\text{ km/s} = 11.2\text{ km/s}$ (Earth), $2.4\text{ km/s}$ (Moon) | $\sqrt{2}\times 7.90 = 11.17\text{ km/s}$ (exact $\sqrt{2GM_E/R_E} = 11.186\text{ km/s}$); Moon $\sqrt{2GM_M/R_M} = 2.38\text{ km/s}$ | PASS |
| `src/ch06.md:30` | Elephant ($4\text{ tonnes} \approx 40{,}000\text{ N}$ on $4 \times 0.05\text{ m}^2 = 0.20\text{ m}^2$) $\to 200{,}000\text{ Pa}$ vs dancer ($500\text{ N}$ on $1\text{ cm}^2 = 10^{-4}\text{ m}^2$) $\to 5{,}000{,}000\text{ Pa}$ ($25\times$ elephant) | $40000/0.20 = 2.0\times 10^5\text{ Pa}$; $500/10^{-4} = 5.0\times 10^6\text{ Pa}$; ratio $= 25.0$ | PASS |
| `src/ch06.md:94-126` | Torricelli barometer: $0.76\text{ m}$ of mercury ($\rho = 13{,}600\text{ kg/m}^3$) gives $p = \rho g h = 101{,}293\text{ Pa} \approx 1.01\times 10^5\text{ Pa}$; water barometer height $= 0.76 \times 13.6 = 10.3\text{ m}$; Puy de Dôme drop $\approx 8\text{ cm}$ ($3\text{ in}$) for $1000\text{ m}$ climb | $13600 \times 9.8 \times 0.76 = 101{,}293\text{ Pa}$; $h_{\text{water}} = 10.336\text{ m}$; Périer measured $3\text{ pouces } 1.5\text{ lignes} \approx 8.4\text{ cm}$ | PASS |
| `src/ch06.md:164,172` | Upside-down glass: $10\text{ cm}$ of water presses down with $\sim 1{,}000\text{ Pa}$ vs $101{,}000\text{ Pa}$ air pressing up; $5\text{ cm}$ suction hook area $\approx 20\text{ cm}^2 \to \text{max force } \approx 200\text{ N}$ ($\sim 20\text{ kg}$) | $1000 \times 9.8 \times 0.10 = 980\text{ Pa}$; $\pi(0.025)^2 \times 1.01\times 10^5 = 198.3\text{ N}$ | PASS |
| `src/ch06.md:200-220` | Water pressure $\rho g h$: $1\text{ m} \to 9{,}800\text{ Pa}$; $2\text{ m} \to 19{,}600\text{ Pa}$; $10\text{ m}$ seawater ($\rho = 1025$) $\to 100{,}450\text{ Pa} \approx 1\text{ atm}$; $4\text{ km}$ ocean $\to 40\text{ MPa} \approx 400\text{ atm}$; Dam $500\text{ m} \times 80\text{ m}$: $p_{\text{bot}} = 784\text{ kPa}$, $p_{\text{avg}} = 392\text{ kPa}$, $F = 1.568\times 10^{10}\text{ N} \approx 1.6\times 10^{10}\text{ N}$ vs reservoir weight $50\text{ km}^2 \times 40\text{ m} \to 1.96\times 10^{13}\text{ N}$ ($< 0.1\%$) | All exact to stated significant figures | PASS |
| `src/ch06.md:290-308` | Steel block ($1.00\times 10^7\text{ kg}$, $\rho = 7800\text{ kg/m}^3$): $V = 1282\text{ m}^3$, buoyant force $= 1.26\times 10^7\text{ N}$ vs weight $9.8\times 10^7\text{ N}$; ship hull displacing $\ge 10{,}000\text{ m}^3$ floats; silver coin $8.630\text{ g}$ in air, $7.800\text{ g}$ in water $\to \rho = 8.630 / 0.830 = 10.40\text{ g/cm}^3$ | $8.630 / (8.630 - 7.800) = 10.398\text{ g/cm}^3 \approx 10.4\text{ g/cm}^3$ | PASS |
| `src/ch07.md:36,92,94` | $100\text{ g}$ ball at $1.00\text{ m} \to 0.98\text{ J}$; $20\text{ g}$ marble at $1\text{ m} \to 0.196\text{ J}$, hits at $4.43\text{ m/s}$, $\frac{1}{2}(0.020)(4.43)^2 = 0.196\text{ J}$; $150\text{ g}$ cricket ball at $30\text{ km/h}$ ($8.33\text{ m/s}$) $\to \frac{1}{2}(0.15)(8.33)^2 = 5.2\text{ J} \approx 5\text{ J}$ | All exact | PASS |
| `src/ch07.md:166,184` | $40\text{ kg}$ student climbing $3\text{ m}$ floor $\to 1{,}176\text{ J}$; marble on track from $1.0\text{ m}$: at $0.5\text{ m}$, $v = 3.13\text{ m/s}$ ($3.1\text{ m/s}$); at $0.0\text{ m}$, $v = 4.43\text{ m/s}$ ($4.4\text{ m/s}$); at $0.8\text{ m}$, $v = 1.98\text{ m/s}$ ($2.0\text{ m/s}$) | $\sqrt{2(9.8)(0.5)} = 3.13$, $\sqrt{2(9.8)(1.0)} = 4.43$, $\sqrt{2(9.8)(0.2)} = 1.98\text{ m/s}$ | PASS |
| `src/ch07.md:263,268` | Acoustic stopwatch bounce height $h = \frac{1}{2}g(t/2)^2 = 9.8 t^2 / 8$; $60\text{ W}$ bulb with $5\text{ W}$ light $\to 5/60 = 8.3\% \approx 8\%$ | Exact | PASS |
| `src/ch07.md:292-375` | $1\text{ kWh} = 3.6\times 10^6\text{ J}$; $2000\text{ kcal/day} \times 4184\text{ J/kcal} / 86400\text{ s} = 96.9\text{ W} \approx 100\text{ W}$; $320\text{ kWh} = 1.152\times 10^9\text{ J}$; $2000\text{ W} \times 0.25\text{ h} = 500\text{ Wh}$ vs $10\text{ W} \times 24\text{ h} = 240\text{ Wh}$; world electricity $15.7\times 10^{12}\text{ kWh} = 5.65\times 10^{19}\text{ J} \approx 5.7\times 10^{19}\text{ J}$; $100\text{ W}$ bulb for $1\text{ yr} = 3.15\times 10^9\text{ J} = 876\text{ kWh}$ | All exact | PASS |
| `src/stories/sun-watcher.md:27-40` | L1 at $1.5\times 10^6\text{ km}$ ($1\%$ of $1.5\times 10^8\text{ km}$): free Kepler period $(0.99)^{3/2} \times 365.25 = 359.79\text{ d} \approx 359.8\text{ d}$ ($5.5\text{ d/yr}$ faster, $183/5.5 \approx 33\text{ yr}$ to drift opposite); Earth pull at L1 $\approx 3\%$ of Sun's pull; equal-pull point at $1.5\times 10^8 / (\sqrt{3.33\times 10^5}+1) \approx 260{,}000\text{ km}$ | $(0.99)^{1.5}\times 365.256 = 359.79\text{ d}$; $M_E/M_S \times (1/0.01)^2 = 3.00\times 10^{-6} \times 10^4 = 3.0\%$; $r_{\text{eq}} = 259{,}500\text{ km}$ | PASS |
| `src/stories/p-chawla.md:36` | Shuttle at $280\text{ km}$ altitude: $v = 7.7\text{ km/s}$, $T \approx 90\text{ min}$, $g(280\text{ km}) / g(0) = (6371/6651)^2 = 91.8\% \approx 92\%$ | $\sqrt{GM_E/6651\text{ km}} = 7.74\text{ km/s}$; $T = 90.0\text{ min}$; $(6371/6651)^2 = 0.9176$ ($92\%$) | PASS |

---

## 2. Grounding & Fidelity-Trap Audit

| Chapter / Story | Fidelity Traps Checked (`grounding/ch05.md`–`ch07.md`) | Verdict |
|---|---|---|
| **Ch 5 (`src/ch05.md`)** | 1. **Centrifugal force / "balance of forces" in orbit:** Explicitly refuted in `:::careful` (L50, L128) — only one inward force (gravity) acts; astronauts are in free fall, not beyond gravity ($g \approx 8.7\text{ m/s}^2$ at $400\text{ km}$).<br>2. **Moon's 1-minute fall (`src/ch05.md:38`):** Caught and fixed a slip where the prose stated *"A minute has 3600 seconds"* instead of *"A minute is 60 seconds, so a one-minute fall goes $60 \times 60 = 3600$ times as far as a one-second fall"*.<br>3. **Kepler's ellipses:** Correctly emphasises that planetary orbits are nearly circular (Mars $e = 0.093$, semi-minor axis $99.6\%$ of semi-major axis).<br>4. **Cavendish "weighing the Earth":** Accurately explains that Cavendish measured the tiny sideways pull between lead spheres on a torsion fibre, finding $G$ and thereby unlocking $M_E$ from $g = GM_E/R_E^2$. | **PASS (after fix)** |
| **Ch 6 (`src/ch06.md`)** | 1. **"Suction pulls" misconception:** Section 6.3 ("Nothing sucks") systematically dismantles suction for the upturned glass + card, drinking straw, Magdeburg hemispheres, and rubber wall hook.<br>2. **Hydrostatic paradox:** Section 6.4 proves from a $1\text{ m}^2$ column that $p = \rho g h$ depends only on depth and density, not lake length, with the $500\text{ m} \times 80\text{ m}$ dam calculation and sandbag ring check.<br>3. **Archimedes crown legend:** Section 6.5 gives Galileo's *La Bilancetta* (1586) critique honestly — bath overflow is legend (Vitruvius, 200 years later), hydrostatic balance is the real precision method. | **PASS** |
| **Ch 7 (`src/ch07.md`)** | 1. **Feynman's "movability" & Dennis the Menace blocks:** Section 7.1 opens with the "movability" test and adapts the 28-block conservation story into 28 marbles with explicit credit to Feynman.<br>2. **$mv$ vs $\frac{1}{2}mv^2$:** Section 7.2 distinguishes momentum (force $\times$ time) from kinetic energy (force $\times$ distance, tested by 's Gravesande's brass balls in clay and marble-into-atta).<br>3. **"Energy consumed" on the electricity bill:** Section 7.5 resolves the chapter's anchor question — $320\text{ kWh}$ is energy *delivered* in an ordered electrical store and dispersed into the room and air as low-grade warmth, with zero joules destroyed. | **PASS** |
| **Vol II Stories (19)** | - `p-brahmagupta.md`: Distinguishes Brahmagupta's qualitative insight ("it is the nature of the Earth to attract heavy things", reported by Al-Biruni) from Newton's quantitative inverse-square law, and notes that Brahmagupta rejected Aryabhata's rotating Earth.<br>- `p-bhaskara.md`: Honestly presents Bhaskara II's mercury-filled wheel as an early *claim* of perpetual motion and uses Ch 7 energy accounting to explain why every such wheel stops.<br>- `p-sarabhai.md`: Includes a `:::careful` box noting that the famous Thumba bicycle and bullock-cart photos reflect real practices (wooden carts avoided magnetic interference with magnetometers) but the surviving press photographs were re-staged months after the first launch.<br>- `fish-book.md`: Properly frames Giovanni Alfonso Borelli's *De Motu Animalium* swim-bladder control alongside modern updates. | **PASS** |

---

## 3. Provenance Completeness Check

- `provenance/ch05.yml`: Covers Sections `5.1`–`5.6`, all MIT OCW 8.01 / OpenStax University Physics Vol 1 Ch 13 / Feynman Vol I Ch 7 citations, `research/india-context.md` (Chandrayaan-3, Aditya-L1), and computed values. **0 missing sections.**
- `provenance/ch06.yml`: Covers Sections `6.1`–`6.5`, OpenStax College Physics 2e Ch 11 citations, IGCSE 0625 $\Delta p = \rho g \Delta h$ bridge, and computed values. Fixed 1 em-dash on line 133. **0 missing sections.**
- `provenance/ch07.yml`: Covers Sections `7.1`–`7.6`, Feynman Vol I Ch 4, OpenStax Ch 7–8, MERC / Tata Power Mumbai tariff filing (`research/india-context.md`), and MacKay *Sustainable Energy* world electricity scale. **0 missing sections.**
- All 19 Volume II stories have complete provenance entries across `stories_energy.yml`, `stories_tales.yml`, `stories_people_part1.yml`, and `stories_people_part2.yml`.

---

## 4. Style, Rendering & Language Audit

| File & Line | Severity | Issue Found | Resolution |
|---|---|---|---|
| `src/ch05.md:38` | **BLOCKER** | Factual/verbal slip: *"A minute has 3600 seconds, and the Moon's fall is 3600 times gentler."* (A minute has 60 seconds; $60^2 = 3600$ comes from $d = \frac{1}{2}at^2$). | **FIXED:** Changed to *"A minute is 60 seconds, so a one-minute fall goes 60 × 60 = 3600 times as far as a one-second fall, and the Moon's acceleration is 3600 times gentler."* |
| `src/stories/p-brahmagupta.md:38` | **BLOCKER** | Raw unparsed LaTeX `$60^2 = 3,600$` and `$0.00272\text{ m/s}^2$` rendered as literal dollar signs and backslashes in HTML. | **FIXED:** Replaced with `60² = 3,600` and `0.00272 m/s²`. |
| `src/stories/p-du-chatelet.md:24,28,30,32,38` | **BLOCKER** | 15 raw unparsed LaTeX math expressions (`$mv$`, `$mv^2$`, `$\frac{1}{2}mv^2$`, `$2^2 = 4$`, `$v = \sqrt{2gh}$`) rendered literally in HTML. | **FIXED:** Replaced all 15 with clean Unicode/italic formatting (`*mv*`, `*mv*²`, `½*mv*²`, `2² = 4`, `*v* = √(2*gh*)`). |
| `src/stories/p-sarabhai.md:18,22,26` | **BLOCKER** | Dangling `:::` after `:::scene` on L18 rendered literal `:::</p>` in HTML; numbers/units (`200`, `4,000 m`, `100`) wrapped in inline code backticks (`<code>`). | **FIXED:** Removed dangling `:::` and inline code backticks. |
| `src/stories/p-chawla.md:18,22,28,34,36,40` | **BLOCKER** | Two dangling `:::` lines after `:::scene` (L18, L34) rendered literal `:::</p>` in HTML; numbers/words wrapped in backticks (`"imagination"`, `280`, `7.7`, `280 km`, `92`); US spelling `percent` (L36); `"can suck the aircraft down"` (L28, contradicting Ch 6 "nothing sucks"); wrong chapter reference `"re-entry heating in Chapter 6"` (L40 — Ch 6 is Pressure/Fluids, Ch 7–8 are Energy/Heat). | **FIXED:** Removed both dangling `:::`, removed code backticks, changed `percent` $\to$ `per cent`, rewrote L28 as *"so that the higher-pressure air above pushes the aircraft down"*, and updated L40 to *"fluid pressure in Chapter 6, and kinetic energy and heating in Chapters 7 and 8"*. |
| `src/stories/sun-watcher.md:20` | **FIX** | Anthropomorphism of spacecraft: *"Aditya-L1 is a Sun-watcher. It wants an uninterrupted view..."* | **FIXED:** Changed to *"Aditya-L1 is a Sun-watcher, built for an uninterrupted view, day and night, year after year."* |
| `provenance/ch06.yml:133` | **FIX** | Em-dash `—` in provenance note. | **FIXED:** Replaced `—` with `,`. |

### Style Checklist Summary (Volume II)
- **Em-dashes (`—`):** `0` in `src/ch05.md`–`ch07.md`, `0` in all 19 stories, `0` in `provenance/ch05.yml`–`ch07.yml` (after fix).
- **Exclamation marks (`!`):** `0` in `src/ch05.md`, `1` in `src/ch06.md` (`"Eureka!"`), `0` in `src/ch07.md`, `0` excess in all 19 stories (within the $\le 1$/chapter limit).
- **AI-slop / banned words (`delve`, `tapestry`, `testament`, `crucial`, `pivotal`, `nestled`, `vibrant`, `moreover`, `furthermore`, `fascinating`):** `0` hits across all Volume II files.
- **British spelling:** Verified (`metres`, `kilometres`, `centre`, `litre`, `per cent`, `programme`, `organised`, `specialised`, `aluminium`, `tyre`).

---

## 5. Gate A Summary Counts (Volume II)

- **BLOCKER:** 5 found, **5 FIXED** (`src/ch05.md:38`, `src/stories/p-brahmagupta.md:38`, `src/stories/p-du-chatelet.md`, `src/stories/p-sarabhai.md`, `src/stories/p-chawla.md`)
- **FIX:** 2 found, **2 FIXED** (`src/stories/sun-watcher.md:20`, `provenance/ch06.yml:133`)
- **CONSIDER:** 0 remaining
- **Overall Gate A Status for Volume II:** **PASS (0 open blockers or fixes)**
