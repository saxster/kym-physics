# Gate A Report — Volume IV (Fields, Sky and Atoms: Chapters 12–15 + 36 Stories)

Checked independently against `GATES.md`, `VOICE.md`, `CHARTER.md`, `grounding/ch12.md`–`ch15.md`, `provenance/ch12.yml`–`ch15.yml`, `provenance/stories_fields.yml`, `provenance/stories_sky.yml`, and `python3 -I` numerical verification.

---

## 1. Numerical Verification (`python3 -I`)

Every number, worked example, inline computation, and figure parameter across `ch12.md`–`ch15.md` and the 36 Volume IV stories was recomputed from scratch with `python3 -I`:

| Location | Claim in Text | Recomputed (`python3 -I`) | Verdict |
|---|---|---|---|
| `src/ch12.md:62` / `static.md:27` | $e = 1.602 \times 10^{-19}\text{ C}$; $1\text{ C} \approx 6.24 \times 10^{18}$ electrons | $1 / 1.602176634 \times 10^{-19} = 6.2415 \times 10^{18}$ | PASS |
| `src/ch12.md:107` / `circuits.md:25` | $2\text{ A}$ for $1\text{ s}$ is $2\text{ C} \approx 1.25 \times 10^{19}$ electrons | $2 \times 6.2415 \times 10^{18} = 1.2483 \times 10^{19}$ | PASS |
| `src/ch12.md:187-195` | Series $10\ \Omega + 20\ \Omega$ across $3\text{ V}$: $R_{\text{tot}} = 30\ \Omega$, $I = 0.1\text{ A}$, $V_1 = 1\text{ V}$, $V_2 = 2\text{ V}$ | Exact | PASS |
| `src/ch12.md:198-206` | Parallel $10\ \Omega \parallel 20\ \Omega$ across $3\text{ V}$: $I_1 = 0.3\text{ A}$, $I_2 = 0.15\text{ A}$, $I_{\text{tot}} = 0.45\text{ A}$, $R_{\text{tot}} = 6.67\ \Omega$ | $3 / 0.45 = 6.667\ \Omega$ | PASS |
| `src/ch12.md:247` | $12\text{ V}$ car battery ($r = 0.1\ \Omega$): $11.9\text{ V}$ across $10\ \Omega$, $10.0\text{ V}$ across $0.5\ \Omega$; worn ($r = 0.5\ \Omega$): $6.0\text{ V}$ across $0.5\ \Omega$ | $12 \times 10 / 10.1 = 11.88\text{ V}$; $12 \times 0.5 / 0.6 = 10.0\text{ V}$; $12 \times 0.5 / 1.0 = 6.0\text{ V}$ | PASS |
| `src/ch12.md:292-304` | Geyser $2{,}000\text{ W}$ at $230\text{ V}$: $I = 8.70\text{ A}$, $R = 26.5\ \Omega$; $9\text{ W}$ LED: $I = 0.039\text{ A}$ | $2000/230 = 8.696\text{ A}$; $230/8.696 = 26.45\ \Omega$; $9/230 = 0.0391\text{ A}$ | PASS |
| `src/ch12.md:308-323` | 30-day flat bill: LEDs $5.4\text{ kWh}$, fans $36\text{ kWh}$, fridge $36\text{ kWh}$, geyser $15\text{ kWh}$, AC $270\text{ kWh}$; total $362.4\text{ kWh}$, ₹$2{,}899$ at ₹$8/\text{kWh}$, AC is $74.5\%$ | $5.4 + 36 + 36 + 15 + 270 = 362.4\text{ kWh}$; $362.4 \times 8 = 2899.2$; $270 / 362.4 = 74.50\%$ | PASS |
| `src/ch12.md:332-343` | $230\text{ kW}$ over $0.1\ \Omega$ line: at $230\text{ V}$, $I = 1{,}000\text{ A}$, $I^2 R = 100\text{ kW}$ ($43.5\%$); at $11{,}000\text{ V}$, $I = 20.9\text{ A}$, $I^2 R = 43.7\text{ W}$ ($0.019\%$) | $(230000/11000)^2 \times 0.1 = 43.719\text{ W}$ | PASS |
| `src/ch13.md:94` / `earth-magnet.md:27` | Alibag magnetic field: total $B \approx 43{,}400\text{ nT}$, horizontal $38{,}400\text{ nT}$, inclination $27^\circ$ down, declination $-0^\circ 09'$ | Matches IGRF-13 Alibag / Mumbai values | PASS |
| `src/ch13.md:146-156` / `trams.md:23-25` | $B = \mu_0 I / (2\pi r)$ for $I = 500\text{ A}$ at $r = 200\text{ m}$: $B = 500\text{ nT}$ ($1.3\%$ of $38{,}400\text{ nT}$) | $2 \times 10^{-7} \times 500 / 200 = 5 \times 10^{-7}\text{ T} = 500\text{ nT}$; $500/38400 = 1.302\%$ | PASS |
| `src/ch13.md:198-204` | Wire motor force: $B = 0.02\text{ T}$, $I = 1.5\text{ A}$, $L = 0.05\text{ m} \implies F = B I L = 0.0015\text{ N}$ | $0.02 \times 1.5 \times 0.05 = 0.0015\text{ N}$ | PASS |
| `src/ch13.md:256-262` | Induction coil: $N = 200$, $A = 4 \times 10^{-4}\text{ m}^2$, $\Delta B = 0.1\text{ T}$ in $\Delta t = 0.02\text{ s} \implies \mathcal{E} = 0.4\text{ V}$ | $200 \times 0.1 \times 4 \times 10^{-4} / 0.02 = 0.4\text{ V}$ | PASS |
| `src/ch13.md:283-290` | Step-down transformer: $11{,}000\text{ V}$ primary with $4{,}783$ turns, secondary $100$ turns $\implies V_s = 230.0\text{ V}$ | $11000 \times 100 / 4783 = 229.98\text{ V}$ | PASS |
| `src/ch13.md:332` / `bose-waves.md:20` / `p-jc-bose.md:30` | J. C. Bose millimetre waves: $\lambda = 5\text{ mm} = 0.005\text{ m}$ at $c = 3 \times 10^8\text{ m/s} \implies f = 60\text{ GHz}$ | $3 \times 10^8 / 0.005 = 60 \times 10^9\text{ Hz} = 60\text{ GHz}$ | PASS |
| `src/ch14.md:62-66` / `earth-turns.md:26` | Earth rotation speed: equator $1{,}672\text{ km/h}$; Mumbai ($19.08^\circ\text{ N}$) $1{,}581\text{ km/h}$; sidereal day $23\text{ h } 56\text{ min } 4\text{ s}$ | $2\pi \times 6371 / 23.9345 = 1672.5\text{ km/h}$; $\times \cos 19.076^\circ = 1580.6\text{ km/h}$ | PASS |
| `src/stories/foucault.md:31-35` | Panthéon pendulum ($L = 67\text{ m}$): $T = 16.4\text{ s}$; precession Paris ($48.85^\circ\text{ N}$) $11.3^\circ/\text{h}$, Mumbai ($19.08^\circ\text{ N}$) $4.9^\circ/\text{h}$ | $2\pi\sqrt{67/9.81} = 16.42\text{ s}$; $15.04^\circ \sin 48.85^\circ = 11.33^\circ/\text{h}$; $15.04^\circ \sin 19.08^\circ = 4.92^\circ/\text{h}$ | PASS |
| `src/ch14.md:145-163` / `seasons.md:31-39` | Noon Sun altitude at Mumbai ($19^\circ\text{ N}$): $85.6^\circ$ (Jun 21), $47.6^\circ$ (Dec 21), $\sin$ ratio $0.74$; London ($51.5^\circ\text{ N}$): $61.9^\circ$ (Jun), $15.1^\circ$ (Dec), ratio $3.4$ | $90 - |19 - 23.4| = 85.6^\circ$; $90 - 42.4 = 47.6^\circ$; $\sin 47.6^\circ / \sin 85.6^\circ = 0.741$; $\sin 61.9^\circ / \sin 15.1^\circ = 3.39$ | PASS |
| `src/ch14.md:242-246` | Sun & Moon angular diameters: Sun $1.392 \times 10^6 / 1.496 \times 10^8 \approx 0.53^\circ$; Moon $3{,}475 / 384{,}400 \approx 0.52^\circ$ | $0.533^\circ$ and $0.518^\circ$ | PASS |
| `src/ch14.md:312-320` / `tides.md:26-34` | Two tidal bulges under $24\text{ h } 50\text{ min}$ lunar day $\implies 12\text{ h } 25\text{ min}$ between consecutive high tides ($50\text{ min/day}$ later) | $24\text{ h } 50\text{ min} / 2 = 12\text{ h } 25\text{ min}$ | PASS |
| `src/ch15.md:72-80` / `photons.md:35-38` | Calcium $\phi = 2.71\text{ eV}$: $\lambda = 420\text{ nm} \implies E = 2.95\text{ eV}$, $K_{\max} = 0.24\text{ eV}$; $\lambda = 940\text{ nm} \implies E = 1.32\text{ eV}$ (below threshold) | $1239.84 / 420 = 2.952\text{ eV}$; $2.952 - 2.71 = 0.242\text{ eV}$; $1239.84 / 940 = 1.319\text{ eV}$ | PASS |
| `src/ch15.md:148-156` / `sun-fire.md:31-34` | $1\text{ kg}$ H fusion ($0.71\%$ mass loss): $E = 0.0071 \times (3 \times 10^8)^2 \approx 6.4 \times 10^{14}\text{ J}$ ($\sim 2\text{ Myr}$ for a $10\text{ W}$ bulb) | $6.39 \times 10^{14}\text{ J}$; $6.39 \times 10^{14} / (10 \times 3.15576 \times 10^7) = 2.025 \times 10^6\text{ yr}$ | PASS |
| `src/ch15.md:162-168` / `sun-fire.md:43-45` | Sun fusion rate: $600\text{ Mt/s}$ H $\to 596\text{ Mt/s}$ He $+ 4\text{ Mt/s}$ energy ($3.8 \times 10^{26}\text{ W}$); $0.03\%$ of $M_\odot$ over $4.5\text{ Gyr}$ | $4 \times 10^9 \times 4.5 \times 10^9 \times 3.15576 \times 10^7 / 1.989 \times 10^{30} = 2.86 \times 10^{-4} \approx 0.03\%$ | PASS |
| `src/ch15.md:274-282` / `star-distances.md:30-37` | $1\text{ pc} = 206{,}265\text{ AU} = 3.26\text{ ly}$; $22\text{ mm}$ ₹1 coin subtends $1''$ at $4.54\text{ km}$ | $1 / \text{rad}(1/3600) = 206264.8\text{ AU} = 3.2615\text{ ly}$; $0.022 \times 206265 = 4538\text{ m}$ | PASS |
| `src/stories/eclipse-1919.md:23-25` | $1.75'' = 8.48 \times 10^{-6}\text{ rad}$; $22\text{ mm}$ ₹1 coin subtends $1.75''$ at $2.6\text{ km}$ | $0.022 / 8.484 \times 10^{-6} = 2593\text{ m} \approx 2.6\text{ km}$ | PASS |
| `src/ch15.md:312-320` / `expanding.md:22,46` | $H_0 \approx 22\text{ km/s/Mly}$ ($\approx 72\text{ km/s/Mpc}$); $1/H_0 \approx 13.6\text{ Gyr}$ ($13.8\text{ Gyr}$ $\Lambda$CDM age) | $(9.461 \times 10^{18}\text{ km}) / (22\text{ km/s}) = 4.30 \times 10^{17}\text{ s} = 13.63\text{ Gyr}$ | PASS |

---

## 2. Grounding & Fidelity Audit

Checked against `grounding/ch12.md`–`ch15.md` and the fidelity traps in `GATES.md`:
- **Static electricity & Mumbai monsoon (`ch12.md`, `static.md`):** Explicitly explains why electrostatic demonstrations fail in humid monsoon air (a thin conductive film of moisture with dissolved ions on surfaces lets charge leak away as fast as it is rubbed on) and directs readers to try them on a dry January afternoon or in an air-conditioned room.
- **Circuits & electron drift (`ch12.md`, `circuits.md`):** Distinguishes the slow drift of electrons in copper ($\sim 0.1\text{ mm/s}$) from the near-light-speed propagation of the electric field when the switch closes; clearly separates voltage (push per unit charge) from current (charge flow per second), and explains battery internal resistance ($r$) causing headlight dimming on starter-motor draw.
- **Electromagnetism & Lenz's law (`ch13.md`, `induction.md`, `oersted.md`, `maxwell.md`):** Emphasises that a *changing* magnetic flux induces a voltage (holding the magnet stationary inside the coil gives zero reading), states Lenz's law as opposing the *change* in flux (not the field itself), and connects Maxwell's wave speed $c = 3 \times 10^8\text{ m/s}$ to light and J. C. Bose's $5\text{ mm}$ ($60\text{ GHz}$) waves in Calcutta.
- **Sky, seasons, phases, eclipses, and tides (`ch14.md`, `seasons.md`, `moon-phases.md`, `tides.md`):** Explicitly refutes the distance-causes-seasons misconception (Earth is closest to the Sun in early January) and the eclipse-causes-phases misconception ($5.1^\circ$ orbital inclination means the Moon usually passes above or below Earth's shadow), and explains both the near-side and far-side tidal bulges from the gradient of the Moon's gravity across Earth's diameter ($12\text{ h } 25\text{ min}$ cycle at Haji Ali).
- **Photons, radiation exposure vs contamination, fusion, stellar spectra, and cosmic expansion (`ch15.md`, `photons.md`, `radiation.md`, `sun-fire.md`, `star-stuff.md`, `star-distances.md`, `star-death.md`, `expanding.md`):** Clearly separates radiation *exposure* (X-ray passes through and leaves nothing behind) from radioactive *contamination* (unstable dust on skin/clothing), distinguishes nuclear fusion from chemical burning, credits Saha's ionisation equation and Payne's hydrogen abundance discovery (noting Russell's 1929 confirmation), explains the Chandrasekhar limit ($1.4\,M_\odot$), and presents Hubble's law via stretching space (rubber ruler / balloon) with no privileged centre.

---

## 3. Provenance Audit

Checked `provenance/ch12.yml`, `provenance/ch13.yml`, `provenance/ch14.yml`, `provenance/ch15.yml`, `provenance/stories_fields.yml`, and `provenance/stories_sky.yml`:
- Every section (`12.1`–`12.6`, `13.1`–`13.6`, `14.1`–`14.6`, `15.1`–`15.6`) and all 36 Volume IV stories have complete provenance entries with `grounded_in`, `numbers` (with `computed` and `verified_by: python3 -I`), `stories`, `misconceptions`, and `try_this`.
- Note on `provenance/ch15.yml:163`: `ch15.yml` contained a note checking whether `sun-fire` used `4.5` or `4.6` billion years. Verified that `src/stories/sun-fire.md` is already titled *"A fire that has lasted four and a half billion years"* and uses `4.5 billion years` consistently throughout, matching `ch15.md`.

---

## 4. Direct Fixes Applied (`FIXED`)

1. **`FIXED` (`BLOCKER` — raw unparsed LaTeX `$ ... $` in `src/stories/p-jc-bose.md:30,36`):**
   - `p-jc-bose.md:30` contained raw `$60\text{ GHz}$ ($3\times 10^8\text{ m/s} \div 0.005\text{ m} = 60\times 10^9\text{ Hz}$)` and `p-jc-bose.md:36` contained `$60\text{ GHz}$`, which rendered as literal `$60\text{ GHz}$` strings in the HTML output. Replaced with clean Unicode `60 GHz (3 × 10⁸ m/s ÷ 0.005 m = 60 × 10⁹ Hz)` and `60 GHz`.
2. **`FIXED` (`BLOCKER` — dangling `:::` lines after `:::scene` in 8 Volume IV biography stories):**
   - `src/stories/p-saha.md:18`, `src/stories/p-sn-bose.md:18`, `src/stories/p-payne.md:18`, `src/stories/p-bhabha.md:18`, `src/stories/p-chandrasekhar.md:18,36`, `src/stories/p-wu.md:18`, `src/stories/p-chowdhuri.md:18`, and `src/stories/p-swarup.md:18` had closing `:::` lines after `:::scene` (which is a single-line directive in `build.py`), rendering as literal `<p>:::</p>` in the compiled HTML. Removed all 9 dangling `:::` lines.
3. **`FIXED` (`FIX` — inline code backticks around numbers, units, and equations in 8 Volume IV biography stories):**
   - Removed all inline code backticks (`<code>`) around temperatures, wavelengths, equations, and dimensions across `p-saha.md`, `p-sn-bose.md`, `p-payne.md`, `p-bhabha.md`, `p-chandrasekhar.md`, `p-wu.md`, `p-chowdhuri.md`, and `p-swarup.md`, converting ASCII math (`8 pi nu^2 / c^3`, `e^- + e^+ -> e^- + e^+`, `P propto rho^(4/3)`) to clean Unicode (`8πν²/c³`, `e⁻ + e⁺ → e⁻ + e⁺`, `P ∝ ρ⁴/³`).
4. **`FIXED` (`FIX` — anthropomorphism in `src/ch13.md:246`):**
   - Reworded `"One MIT course puts it as 'the system always responds so as to try to keep things the same'"` to `"One MIT course sums it up cleanly: the system always responds in the way that opposes the change"`, matching the non-anthropomorphic wording already adopted in `src/stories/induction.md` and `provenance/stories_fields.yml:76`.

---

## Summary Counts by Severity (Volume IV — Gate A)

- **BLOCKER:** 2 found, **2 FIXED** (0 remaining)
- **FIX:** 2 found, **2 FIXED** (0 remaining)
- **CONSIDER:** 0
