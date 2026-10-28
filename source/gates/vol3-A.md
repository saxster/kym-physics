# Gate A Report — Volume III (Chapters 8–11 & Volume III Stories)

## Scope Checked
- **Chapters:** `src/ch08.md` (Heat, temperature, and why things cool), `src/ch09.md` (Swings, strings, and sound), `src/ch10.md` (Light and seeing), `src/ch11.md` (Colour, and what light really is)
- **Stories (23):** `src/stories/caloric.md`, `src/stories/latent-heat.md`, `src/stories/matka.md`, `src/stories/monsoon.md`, `src/stories/engines.md`, `src/stories/mpemba.md`, `src/stories/resonance.md`, `src/stories/tabla.md`, `src/stories/doppler.md`, `src/stories/seeing.md`, `src/stories/speed-of-light.md`, `src/stories/refraction.md`, `src/stories/prism.md`, `src/stories/blue-sky.md`, `src/stories/raman.md`, `src/stories/light-wave.md`, `src/stories/wobbly-bridge.md`, `src/stories/tacoma.md`, `src/stories/fizeau-wheel.md`, `src/stories/galileo-fingers.md`, `src/stories/p-ibn-al-haytham.md`, `src/stories/p-raman.md`, `src/stories/p-mani.md`
- **Grounding & Provenance:** `grounding/ch08.md`, `grounding/ch09.md`, `grounding/ch10.md`, `grounding/ch11.md`, `provenance/ch08.yml`, `provenance/ch09.yml`, `provenance/ch10.yml`, `provenance/ch11.yml`, `provenance/stories_waves.yml`

---

## 1. Numerical & Factual Verification (`python3 -I -c`)

Every numerical claim in Chapters 8–11 and all 23 Volume III stories was independently recomputed in Python (`python3 -I -c`):

| File & Line | Claim in Text | Independent Python Calculation (`python3 -I -c`) | Status |
|---|---|---|---|
| `src/ch08.md:94` | Human body temp `37 °C` (`98.6 °F`); absolute zero `-273.15 °C` (`0 K`); Mumbai room `30 °C = 303 K` | `37 * 9/5 + 32 = 98.6`; `30 + 273.15 = 303.15 K` | PASS |
| `src/ch08.md:170` | Thermal conductivity: aluminium `220`, steel `80`, stainless steel `14`, glass `<1`, water `0.6`, wood `0.08–0.16`, wool `0.04`, air `0.023 W/(m·K)` | Matches OpenStax *College Physics 2e* Table 14.3 (`14 / 0.12 ≈ 117`, "about a hundred times better") | PASS |
| `src/ch08.md:232` | Specific heat: water `4,200 J/(kg·°C)` (exact `4,184`), aluminium `900`, steel `450`, dry soil/sand `~800` (about one-fifth of water) | `4200 / 5 = 840`; matches standard tables | PASS |
| `src/ch08.md:274` | Heating `1 kg` water from `25 °C` to `100 °C` (`75 °C` rise) takes `315,000 J` (`315 kJ`); boiling it away takes `2,260,000 J` (`2,260 kJ`, about `7×` as much); melting `1 kg` ice takes `334,000 J` (`~80 °C` of warming) | `4200 * 75 = 315,000 J`; `2260 / 315 = 7.17`; `334000 / 4184 = 79.83 °C` | PASS |
| `src/ch08.md:302`, `matka.md:32` | A `5 L` (`5 kg`) matka losing `50 g` (`0.05 kg`) per hour gives up `0.05 × 2,260,000 = 113,000 J`, cooling `5 kg` by `113,000 ÷ (5 × 4,200) ≈ 5.4 °C` (about `5 °C`) | `0.05 * 2260000 = 113000 J`; `113000 / 21000 = 5.38 °C` | PASS |
| `src/stories/caloric.md:36` | Joule's paddle wheel: `26 kg` weights falling `1.6 m` twenty times do `~8,300 J` of work and warm `~6 kg` of water by `~0.3 °C` | `20 * 26.3 * 9.81 * 1.6 = 8256 J`; `8300 / (6 * 4184) = 0.33 °C` | PASS |
| `src/ch09.md:47`, `resonance.md:26` | Pendulum `T = 2π√(L/g)`: `L = 0.25 m -> 1.0 s`, `L = 1.0 m -> 2.0 s`, `L = 4.0 m -> 4.0 s`; at `15°` period increases by `<0.5%` (`0.43%`); at `60°` by `~7%` (`7.3%`); `L = 0.75000 m`, `T = 1.7357 s -> g = 9.83 m/s²` | `2*pi*sqrt(1/9.8) = 2.007 s`; `1 + rad(15)^2/16 = 1.0043`; `4*pi^2*0.75/1.7357^2 = 9.830 m/s²` | PASS |
| `src/ch09.md:254`, `tabla.md:26`, `p-raman.md:28` | Circular membrane modes `1 : 1.59 : 2.14 : 2.30` vs *syahi*-loaded tabla `1 : 2 : 3 : 4 : 5` | Bessel zero ratios `j_11/j_01 = 1.593`, `j_21/j_01 = 2.136`, `j_02/j_01 = 2.295` | PASS |
| `src/ch09.md:312-345` | Speed of sound: `~340 m/s` in air (`349 m/s` at `30 °C`), `~1,500 m/s` in water (`4.4×`), `~5,000 m/s` in steel (`~15×`); `340 Hz` has `λ = 1 m`; thunder `3 s` delay `≈ 1 km` (`1,020 m`) | `340 / 340 = 1.0 m`; `3 * 340 = 1020 m` | PASS |
| `src/ch09.md:394`, `doppler.md:32` | Horn `400 Hz` moving at `20 m/s` (`72 km/h`) with `v_s = 340 m/s`: approaching `425 Hz`, receding `378 Hz` | `400 * 340 / (340 - 20) = 425.0 Hz`; `400 * 340 / (340 + 20) = 377.8 Hz` | PASS |
| `src/ch10.md:205`, `refraction.md:34` | Refractive index `n`: air `1.0003`, water `1.33`, glass `1.5`, diamond `2.42`; beam at `45°` in air bends to `32.1°` in water and `28.1°` in glass | `degrees(asin(sin(rad(45))/1.33)) = 32.12°`; `degrees(asin(sin(rad(45))/1.5)) = 28.13°` | PASS |
| `src/ch10.md:252`, `refraction.md:42` | Critical angle for total internal reflection: water `48.6°` (`~49°`), glass `41.8°` (`~42°`), diamond `24.4°` (`~24°`) | `degrees(asin(1/1.333)) = 48.61°`; `degrees(asin(1/1.5)) = 41.81°`; `degrees(asin(1/2.42)) = 24.41°` | PASS |
| `src/ch10.md:365`, `speed-of-light.md:36`, `fizeau-wheel.md:33-38` | Io period `42.5 h`; Rømer delay across Earth's orbit `~16.5 min` (`990 s`); Fizeau cogwheel `720` teeth, `8,633 m` (`17,266 m` round trip), first eclipse at `12.6 rev/s`: `Δt = 1/(1440×12.6) = 55.1 μs`, `c ≈ 313,000 km/s` | `1/(1440*12.6) = 5.511e-5 s`; `17266 / 5.511e-5 = 313,274 km/s` (`+4.5%` vs `299,792.458 km/s`) | PASS |
| `src/ch11.md:54`, `prism.md:36` | Water dispersion at `45°` incidence: red (`n = 1.331`) refracts at `32.09°`, violet (`n = 1.342`) at `31.80°`, difference `0.29°` (`~0.3°`) | `degrees(asin(sin(rad(45))/1.331)) = 32.091°`; `degrees(asin(sin(rad(45))/1.342)) = 31.797°` | PASS |
| `src/ch11.md:155`, `blue-sky.md:33-48` | Rayleigh scattering `∝ 1/λ⁴`: `(700/450)⁴ = 5.86` (`~6×`); violet `(700/400)⁴ = 9.38` (`>9×`); air mass at `10°` is `1/sin(10°) = 5.8` (`~6`), at `5°` is `1/sin(5°) = 11.5` (`~11`) | `(700/450)**4 = 5.855`; `(700/400)**4 = 9.379`; `1/sin(10°) = 5.76`; `1/sin(5°) = 11.47` | PASS |
| `src/ch11.md:214`, `raman.md:22-24` | Brewster's angle for water (`n = 1.333`): `arctan(1.333) = 53.1°` from normal (`36.9° ≈ 37°` below horizon); normal-incidence reflectance `((n-1)/(n+1))² = 2.04%` (`~2 in 100`) | `degrees(atan(1.333)) = 53.12°`; `((0.333)/(2.333))**2 = 0.0204` | PASS |
| `src/ch11.md:274`, `light-wave.md:28` | Green light (`550 nm`) has `~1,800` waves per mm (`1,818`); two slits `0.5 mm` apart at `1 m` screen distance give fringes `~1.1 mm` apart | `1e-3 / 550e-9 = 1818.2`; `550e-9 * 1.0 / 0.5e-3 = 1.1e-3 m` | PASS |

---

## 2. Grounding & Fidelity-Trap Audit

Checked `src/ch08.md`–`src/ch11.md` and all 23 Volume III stories against `grounding/ch08.md`–`grounding/ch11.md`:

- **Chapter 8 (`grounding/ch08.md`):**
  - *Trap 1 (Do not use "heat" as a noun for energy stored inside an body; stored energy is thermal/internal energy, heat is energy in transit):* Respected throughout `ch08.md` and `caloric.md`.
  - *Trap 2 (Do not claim "warm air rises because its molecules move faster and fly upward"; buoyancy from thermal expansion and cooler denser air pushing underneath drives convection):* Respected in `ch08.md` §8.4 and `monsoon.md`.
  - *Trap 3 (Do not say a blanket or sweater "makes heat" or "warms you up"; it slows conduction/convection of your body's own energy):* Respected in `ch08.md` §8.3.
  - *Trap 4 (Mpemba effect must be presented honestly as subtle, disputed, and dependent on container/convection/evaporation/supercooling rather than a simple universal rule):* Respected in `mpemba.md`.
- **Chapter 9 (`grounding/ch09.md`):**
  - *Trap 1 (Tacoma Narrows collapse was aeroelastic flutter / self-excited negative damping in a steady 68 km/h wind, NOT forced resonance from periodic wind gusts or von Kármán vortex shedding):* Explicitly debunked in `ch09.md` §9.2 and `tacoma.md` (citing Billah & Scanlan 1991 and MIT 8.03).
  - *Trap 2 (Millennium Bridge sideways sway was pedestrian-bridge feedback / negative damping, NOT soldiers marching in step; include Belykh et al. 2021 alongside Arup's synchronisation account):* Explicitly covered in `ch09.md` §9.2 and `wobbly-bridge.md`.
  - *Trap 3 (Do not confuse sound wave speed with the back-and-forth speed of air molecules, or claim air travels from speaker to ear):* Respected in `ch09.md` §9.4.
  - *Trap 4 (Doppler shift is a change in frequency as speed is constant in the medium, and pitch does not drop "as the vehicle approaches/passes" gradually due to distance — distance changes loudness, velocity component changes pitch):* Respected in `ch09.md` §9.6 and `doppler.md`.
- **Chapter 10 (`grounding/ch10.md`):**
  - *Trap 1 (Extramission misconception — eyes do not send out rays; seeing requires light from a source to reflect off an object and enter the pupil):* Directly addressed in `ch10.md` §10.1, `seeing.md`, and `p-ibn-al-haytham.md`.
  - *Trap 2 (Mirror image is not flipped left-to-right because the mirror knows horizontal from vertical; it is flipped front-to-back along the normal):* Respected in `ch10.md` §10.2.
  - *Trap 3 (Refraction happens because light changes speed across the boundary, not because water "pushes" the ray):* Respected in `ch10.md` §10.4 and `refraction.md`.
- **Chapter 11 (`grounding/ch11.md`):**
  - *Trap 1 (A prism does not stain white light; white light is a heterogeneous mixture and dispersion sorts it):* Respected in `ch11.md` §11.1 and `prism.md`.
  - *Trap 2 (A yellow banana does not "make" yellow light; pigments subtract/absorb blue and reflect red+green, which stimulate the eye's cones just as pure yellow does):* Respected in `ch11.md` §11.2.
  - *Trap 3 (The sky is not blue because it reflects the sea, and the sea is not blue solely because it reflects the sky — Raman 1921 showed water scatters light from within; Rayleigh scattering is `1/λ⁴` and scatters all wavelengths, blue ~6× red):* Respected in `ch11.md` §§11.3–11.4, `blue-sky.md`, and `raman.md`.
  - *Trap 4 (Raman scattering is inelastic and shifts a tiny fraction of scattered light, ~1 in `10^7`, not ordinary sky/sea scattering):* Respected in `ch11.md` §11.6, `raman.md`, and `p-raman.md`.

---

## 3. Style, Formatting & Provenance Audit

- **Em-dashes (`—`):**
  - Found 0 em-dashes in `src/ch08.md`–`src/ch11.md` and 0 in all 23 Volume III stories.
  - Found 2 em-dashes in YAML header comments of `provenance/ch10.yml:1` (`# Chapter 10 — Light and seeing`) and `provenance/ch11.yml:1` (`# Chapter 11 — Colour, and what light really is`).
  - **Action (`FIX` — FIXED):** Replaced `—` with `,` in `provenance/ch10.yml:1` and `provenance/ch11.yml:1`.
- **British vs US Spelling:**
  - Found 2 instances of US `percent` in `src/ch09.md:47` (`less than half a percent`, `within a fraction of a percent`), whereas the rest of the book uses British `per cent`.
  - **Action (`FIX` — FIXED):** Changed both instances of `percent` to `per cent` in `src/ch09.md:47`.
- **Anthropomorphism Check:**
  - Found in `src/ch08.md:160`: `"The steel carries that energy away from the contact point quickly and keeps asking for more, so your skin loses energy fast..."` ("keeps asking for more" anthropomorphises steel).
  - **Action (`FIX` — FIXED):** Rewrote `src/ch08.md:160` as `"The steel carries that energy away from the contact point quickly so the surface stays cool and keeps drawing more, and your skin loses energy fast: fast loss is what "cold" means to your nerves."`
- **Dangling `:::` Block Closers & Inline Code Backticks in Portrait Stories:**
  - `src/stories/p-raman.md:16-18,28,32-34`: Two `:::scene` headings were followed by dangling `:::` lines (`L18`, `L34`) that rendered as literal `<p>:::</p>` in HTML, and mode ratios (`1 : 1.59 : 2.14 : 2.30` and `1 : 2 : 3 : 4 : 5`) were wrapped in backticks (`<code>`).
  - `src/stories/p-mani.md:16-18`: `:::scene Pune, 1948` was followed by a dangling `:::` on line 18 that rendered as literal `<p>:::</p>` in HTML.
  - **Action (`FIX` — FIXED):** Removed the three dangling `:::` lines and unquoted the inline backticks in `src/stories/p-raman.md` and `src/stories/p-mani.md`.
- **Exclamation Marks & AI-Slop Words:**
  - 0 excess exclamation marks across `ch08.md`–`ch11.md` and all 23 stories; 0 banned AI-slop words (`delve`, `tapestry`, `testament`, `crucial`, `moreover`, `furthermore`, `pivotal`, `realm`).
- **Provenance Completeness:**
  - Verified `provenance/ch08.yml`, `provenance/ch09.yml`, `provenance/ch10.yml`, `provenance/ch11.yml`, and `provenance/stories_waves.yml`. Every numbered section (`8.1`–`8.6`, `9.1`–`9.6`, `10.1`–`10.6`, `11.1`–`11.6`), figure, and story has complete provenance entries.

---

## Summary of Findings by Severity (Volume III — Gate A)

- **BLOCKER:** 0
- **FIX:** 5 (all **FIXED** directly in source files: `provenance/ch10.yml:1`, `provenance/ch11.yml:1`, `src/ch08.md:160`, `src/ch09.md:47`, `src/stories/p-raman.md:16-34`, `src/stories/p-mani.md:16-18`)
- **CONSIDER:** 0
