# Gate B Report — Volume III (Chapters 8–11 & Volume III Stories)

## Scope Checked
- **Chapters:** `src/ch08.md` (Heat, temperature, and why things cool), `src/ch09.md` (Swings, strings, and sound), `src/ch10.md` (Light and seeing), `src/ch11.md` (Colour, and what light really is)
- **Stories (23):** `caloric`, `latent-heat`, `matka`, `monsoon`, `engines`, `mpemba`, `resonance`, `tabla`, `doppler`, `seeing`, `speed-of-light`, `refraction`, `prism`, `blue-sky`, `raman`, `light-wave`, `wobbly-bridge`, `tacoma`, `fizeau-wheel`, `galileo-fingers`, `p-ibn-al-haytham`, `p-raman`, `p-mani`

---

## 1. Feynman 3-Sentence Explain-Back (12-Year-Old's Voice) & Movability Test

### Chapter 8 — Heat, temperature, and why things cool
- **8.1 What a thermometer measures (`src/ch08.md`):**
  - *12-year-old explain-back:* Everything around us is made of tiny particles that never sit still, and temperature tells us how hard those particles are jiggling on average. When something warms up, its particles jiggle slightly further apart so the whole thing expands, which is how liquid climbing a narrow tube or a bending two-metal strip measures temperature. Cold is not a stuff of its own; it is just less jiggling, all the way down to `-273.15 °C` where the jiggling reaches its floor.
  - *Movability:* Cannot move; introduces temperature and thermal expansion before energy flow.
- **8.2 Heat is a flow, not a fluid (`src/ch08.md`):**
  - *12-year-old explain-back:* People once thought hot things were full of an invisible weightless liquid called caloric, until Rumford showed that a blunt cannon drill can make boiling-hot water forever as long as the horses keep turning it. Joule proved with falling weights turning a paddle wheel that `4,200 J` of mechanical work warms `1 kg` of water by `1 °C`, just like a flame does. So "heat" is not something stored inside an object; stored jiggling is thermal energy, and heat is the passing of that energy from a warmer body to a cooler one.
  - *Movability:* Depends directly on §8.1's particle-jiggling picture.
- **8.3 Why metal feels colder (`src/ch08.md`):**
  - *12-year-old explain-back:* A steel thali and a wooden chopping board left on the kitchen counter all night are at the exact same room temperature, even though the steel feels much colder. Your skin does not feel temperature directly; it feels how fast thermal energy leaves your warm hand. Steel passes energy away from your palm about a hundred times faster than wood by particle-to-particle collisions (conduction), whereas a blanket or sweater keeps you warm by trapping still air that conducts very poorly.
  - *Movability:* Builds on §8.2's definition of heat as energy transfer.
- **8.4 Why hot chai cools: moving fluids and invisible glow (`src/ch08.md`):**
  - *12-year-old explain-back:* When fluid warms up it expands and becomes less dense, so cooler, denser fluid around it sinks underneath and pushes the warm fluid up in a circulation loop called convection. Every warm object also sheds energy without touching anything at all by sending out invisible infrared radiation, while dark surfaces both soak up and radiate more energy than shiny silver ones. A thermos flask keeps chai hot by stopping all three escapes at once: a vacuum stops conduction and convection, silvered walls block radiation, and a tight lid stops evaporation.
  - *Movability:* Completes the trio of heat-transfer mechanisms started in §8.3.
- **8.5 The greedy water (`src/ch08.md`):**
  - *12-year-old explain-back:* Water has an unusually huge appetite for thermal energy: it takes `4,200 J` to warm `1 kg` of water by `1 °C`, about five times as much as dry soil or sand and nearly ten times as much as steel. That is why land heats up much faster than the Arabian Sea in afternoon sunshine, drawing in Mumbai's cool sea breeze, and why continental interiors heat up faster than the Indian Ocean in May and June, driving the southwest monsoon.
  - *Movability:* Prepares quantitative heat capacity before §8.6's phase changes.
- **8.6 The hidden heat (`src/ch08.md`):**
  - *12-year-old explain-back:* When ice melts at `0 °C` or water boils at `100 °C`, the thermometer stops rising even though the stove keeps pouring energy in, because all that "latent heat" goes into pulling molecules apart rather than speeding them up. Turning `1 kg` of water into vapour takes `2,260,000 J`—over seven times the energy needed to bring it from room temperature to the boil! When sweat evaporates off your skin or water seeps through a porous clay *matka*, the fastest molecules escape and steal that huge hidden energy from the water left behind, cooling it down.
  - *Movability:* Climax of Chapter 8; integrates specific heat (§8.5) with phase transitions.

### Chapter 9 — Swings, strings, and sound
- **9.1 The swing that keeps time (`src/ch09.md`):**
  - *12-year-old explain-back:* Whenever a system is nudged a little way from rest and pulled back by a force that grows in proportion to how far it moved, it swings back and forth in equal times regardless of the width of a small swing. For a pendulum, a heavier bob makes no difference because gravity pulls harder and inertia resists more in exact lockstep; only the length and gravity matter (`T = 2π√(L/g)`). Because of the square root, making a pendulum four times longer doubles its period.
  - *Movability:* Foundation of oscillation period and frequency (`f = 1/T`).
- **9.2 Pushing at the right moment (`src/ch09.md`):**
  - *12-year-old explain-back:* If you push a swing in rhythm with its own natural frequency, even tiny pushes add up swing after swing into a huge motion called resonance, limited only by how much friction or damping drains energy out. Not every famous wobbling bridge is resonance, though: the Tacoma Narrows bridge twisted itself apart in a steady wind by aeroelastic flutter, where each twist changed the wind's push to feed the next twist, and London's Millennium Bridge fed on the sideways balance adjustments of walkers until engineers added dampers.
  - *Movability:* Follows directly from natural frequency (§9.1).
- **9.3 Plucked strings and singing drums (`src/ch09.md`):**
  - *12-year-old explain-back:* A guitar or *tanpura* string clamped at both ends can only vibrate in patterns that fit a whole number of half-waves along its length, giving a fundamental note and exact whole-number overtones (`1, 2, 3, 4...`) that sound musical together. A plain round drumskin vibrates at awkward decimal ratios (`1 : 1.59 : 2.14 : 2.30`) and sounds like a thud, which is why Indian *tabla* makers press a heavy black *syahi* paste onto the centre to slow the middle and pull the overtones into clean whole numbers.
  - *Movability:* Bridges standing oscillations to musical pitch and timbre.
- **9.4 What sound is (`src/ch09.md`):**
  - *12-year-old explain-back:* A vibrating speaker or drumskin pushes the air next to it into crowded high-pressure bunches (compressions) and thinned-out gaps (rarefactions) that race outward at about `340 m/s` while each air parcel only jiggles back and forth in place. Because sound is a relay race handed from molecule to molecule, it travels even faster in liquids (`1,500 m/s` in water) and solids (`5,000 m/s` in steel), and cannot cross the vacuum of space at all. Every wave obeys `speed = frequency × wavelength`.
  - *Movability:* Extends vibration (§§9.1–9.3) into travelling waves.
- **9.5 Loud, soft, high, low (`src/ch09.md`):**
  - *12-year-old explain-back:* The frequency of a sound wave sets its pitch (human ears hear roughly `20 Hz` to `20,000 Hz`), while the size of the pressure swing—its amplitude—sets how much energy it carries and how loud it sounds. When two notes have almost the same frequency, their crests drift in and out of step at your ear, making a regular "wah-wah" pulsing called beats whose pulse rate equals the difference between the two frequencies.
  - *Movability:* Builds on §9.4's wave anatomy.
- **9.6 The passing horn (`src/ch09.md`):**
  - *12-year-old explain-back:* When a honking horn rushes towards you, it chases its own sound and releases each new wave crest closer behind the one before, so the crests arrive at your ear bunched together at a higher frequency and higher pitch. Once it passes and moves away, each crest is released further back, stretching the spacing out so the pitch drops. Notice that the pitch stays steady at the high note all the way in and drops only as the vehicle sweeps past you; distance changes loudness, not pitch.
  - *Movability:* Capstone application of wave speed, wavelength, and frequency.

### Chapter 10 — Light and seeing
- **10.1 How you see (`src/ch10.md`):**
  - *12-year-old explain-back:* Even though many people instinctively imagine invisible feelers coming out of their eyes, Ibn al-Haytham proved a thousand years ago that seeing happens only when light from a lamp or the Sun bounces off an object and enters the pupil. A smooth mirror bounces parallel rays off in one neat direction, while rough paper scatters them every which way (diffuse reflection) so anyone in the room can read the page. Inside the dark back of the eye, cones read colour in bright light and rods take over in dim light without colour.
  - *Movability:* Opening of optics; establishes rays and vision.
- **10.2 The flat mirror (`src/ch10.md`):**
  - *12-year-old explain-back:* When a ray of light hits a mirror, the angle it leaves at equals the angle it arrived at, measured from the perpendicular line (the normal). Your brain traces the diverging rays that enter your eyes straight back behind the glass to where they seem to meet, creating a virtual image the same size and as far behind the mirror as you stand in front. Because the mirror only turns front-to-back around, a flat mirror just half your height is enough to show you from head to toe at any distance.
  - *Movability:* Builds directly on §10.1's ray model.
- **10.3 Curved mirrors: spoons, security mirrors, and headlights (`src/ch10.md`):**
  - *12-year-old explain-back:* A curved mirror obeys the exact same equal-angle reflection law at every point, but because its surface curves, the normal points in a slightly different direction at each spot. A bowl-shaped concave mirror bends parallel rays inward to meet at a focal point (or sends rays from a bulb at the focus out in a tight headlight beam), while a bulging convex mirror spreads rays out so your brain sees a smaller, upright image taking in a wide view of the road.
  - *Movability:* Extends §10.2 from flat to curved surfaces.
- **10.4 The bent straw (`src/ch10.md`):**
  - *12-year-old explain-back:* Light travels at top speed in empty space and air, slows down to three-quarters of that speed in water (`n = 1.33`), and slows to two-thirds in glass (`n = 1.5`). When a beam enters water at a slant, the edge of the wave that hits the water first slows down while the other edge is still moving fast in air, swinging the beam around closer to the normal (refraction). When light goes the other way, from water into air, it bends away from the normal, so your brain traces the rays straight back to a shallower spot and makes a pool look shallower and a straw look kinked.
  - *Movability:* Introduces refraction and refractive index.
- **10.5 Trapped light and curved glass (`src/ch10.md`):**
  - *12-year-old explain-back:* Because light leaving water or glass bends away from the normal, past a certain critical angle (`49°` in water, `42°` in glass, `24°` in diamond) the escaping ray would have to bend past the surface itself, so `100%` of the light bounces back inside (total internal reflection). That trapped bounce is how glass optical fibres guide internet data around corners and why a cut diamond sparkles. Curve a piece of glass on both sides to make a lens, and refraction bends rays together (convex, like your eye's lens) or spreads them apart (concave, to fix short-sighted eyes).
  - *Movability:* Direct consequence of §10.4's refraction law.
- **10.6 How fast is "instant"? (`src/ch10.md`):**
  - *12-year-old explain-back:* Light is so fast that Galileo's shuttered lanterns on two hills only measured human reaction time, but Rømer noticed that Jupiter's moon Io appeared minutes late when Earth was on the far side of its orbit because light took about `16.5 minutes` to cross the orbit. In 1849 Fizeau caught the speed on the ground by firing light through the gaps of a spinning `720`-tooth cogwheel to a mirror `8.6 km` away and spinning the wheel until a tooth blocked the returning flash (`~300,000 km/s`).
  - *Movability:* Sets up the speed and wave nature of light for Chapter 11.

### Chapter 11 — Colour, and what light really is
- **11.1 White is a crowd (`src/ch11.md`):**
  - *12-year-old explain-back:* People before Newton thought a glass prism stained pure white sunlight into rainbow colours, until Newton sent a single colour from the spectrum through a second prism and saw that it bent without changing colour at all. That proved white sunlight is already a mixture of all colours travelling together, and glass sorts them out because violet light slows down and bends slightly more in glass or water than red light does (dispersion). Every raindrop in a shower acts like a tiny prism and mirror, sending sorted colours back towards you when the Sun is behind your back.
  - *Movability:* Builds directly on Chapter 10's refraction.
- **11.2 Why a banana is yellow (`src/ch11.md`):**
  - *12-year-old explain-back:* A banana in sunlight does not glow on its own; its skin absorbs the blue part of white sunlight and reflects the red and green parts into your eye. Your retina has only three kinds of colour cones (roughly red-, green-, and blue-sensitive), and when red and green cones fire together with no blue, your brain sees yellow—whether the light is pure rainbow yellow or a mix of red and green dots from a phone screen! That is why a phone screen adds red, green, and blue light to make white, while paints subtract colours until mixing them all leaves a muddy dark grey.
  - *Movability:* Connects dispersion (§11.1) and eye cones (§10.1) to everyday colour.
- **11.3 Why the sky is blue and the sunset is orange (`src/ch11.md`):**
  - *12-year-old explain-back:* Air molecules are tiny antennas that catch passing sunlight and re-broadcast it sideways in all directions (Rayleigh scattering), and because blue light shakes faster at a shorter wavelength, air scatters blue about six times more strongly than red (`(700/450)⁴ ≈ 5.9`). When you look up at the daytime sky, you see that sideways-scattered blue light. At sunset over Marine Drive, sunlight travels through up to ten times more air to reach you, so most of its blue has been scattered away to light up other people's skies, leaving the direct beam orange and red.
  - *Movability:* Introduces light as a transverse oscillation and wavelength-dependent scattering.
- **11.4 Sunglasses at the sea wall (`src/ch11.md`):**
  - *12-year-old explain-back:* Because light waves shake sideways across their line of travel, a polarising filter acts like a picket fence that lets through only shakes in one direction. Light that reflects off water at a slant shakes mostly side-to-side parallel to the water surface, so polarised sunglasses cut out surface glare. On board the *Narkunda* in 1921, C. V. Raman used a polarising prism to block the reflected sky from the Mediterranean Sea and saw the water beneath still glowing deep blue, proving that water molecules scatter light from inside the sea itself.
  - *Movability:* Connects transverse waves and scattering (§11.3) to polarisation and Raman's voyage.
- **11.5 Ripples of light (`src/ch11.md`):**
  - *12-year-old explain-back:* Two streams of particles cannot cancel each other out to make darkness, yet Thomas Young held a narrow card in a sunbeam and saw bright and dark stripes inside its shadow where light waves from the two edges met crest-to-crest and crest-to-trough (interference). When Poisson tried to disprove Fresnel's wave math by showing it predicted an "absurd" bright dot right in the centre of a round disc's shadow, Arago did the experiment and found the bright spot shining right there. We only fail to notice light bending round everyday corners (diffraction) because its wavelength is tiny—about half a thousandth of a millimetre.
  - *Movability:* Establishes wavelength and interference before the electromagnetic spectrum in §11.6.
- **11.6 The colour that changed, and the invisible rainbow (`src/ch11.md`):**
  - *12-year-old explain-back:* Seven years after his sea voyage, Raman and K. S. Krishnan discovered in Calcutta that roughly one in ten million scattered light waves trades a tiny bit of energy with a vibrating molecule and comes out a slightly different colour—a molecular fingerprint now called the Raman effect. Visible colours from violet (`400 nm`) to red (`700 nm`) are just one tiny octave of a vast family of waves that all travel at `300,000 km/s` in space: radio waves, microwaves, infrared, visible light, ultraviolet, X-rays, and gamma rays.
  - *Movability:* Finale of Volume III; bridges waves and optics to Volume IV (electromagnetism and modern physics).

---

## 2. Home Experiments (`:::home` & `:::try`) — Mumbai Flat Feasibility, Safety & Effect-Size Check

Every `:::home` and `:::try` activity in Volume III (Chapters 8–11 and all 23 stories) was checked for Mumbai flat availability, child safety, and observable effect size via Python:

| Location | Activity | Materials (Mumbai Flat) | Safety & Adult Supervision | Python Effect-Size Verification | Verdict |
|---|---|---|---|---|---|
| `src/ch08.md` §8.1 | Two bowls and a lukewarm middle (`:::try`) | 3 kitchen bowls, tap water, warm water, ice cubes | Uses warm (not hot) water ("comfortable to hold a hand in"); safe | Sensory adaptation contrast is `~15 °C` (`15 °C` vs `30 °C` vs `42 °C`), producing an unmistakable warm/cold simultaneous illusion | PASS |
| `src/ch08.md` §8.3 | Touch steel thali vs wooden chopping board (`:::try`) | Steel thali, wooden board | Completely safe | Conductivity ratio `14–80 W/(m·K)` vs `0.12 W/(m·K)` (`>100×` faster contact heat flux) | PASS |
| `src/ch08.md` §8.5 | Wet back of one hand and blow across both (`:::try`) | Tap water | Completely safe | Evaporating a `0.05 mm` film (`5 mg/cm²`) absorbs `~11 J/cm²`, dropping skin surface temp by `3–5 °C` in seconds | PASS |
| `src/ch08.md` §8.6 / `matka.md` | Compare water in clay *matka* vs steel bottle (`:::home`) | Clay *matka* or terracotta cup, steel vessel, thermometer/taste | Completely safe | `50 g/h` evaporation from `5 L` cools water by `5.4 °C/h` (`4–6 °C` below ambient in Mumbai outside peak monsoon) | PASS |
| `src/stories/latent-heat.md` | Melting ice in a glass with thermometer (`:::home`) | Ice cubes, glass, thermometer | Safe | Slush holds at `0 °C` for `15–25 min` until all ice melts (`334 kJ/kg`) | PASS |
| `src/stories/p-mani.md` | Narrow glass vs wide pot rain gauge (`:::home`) | Straight-walled glass and straight-walled pot on balcony in rain | Safe | Equal depth `h = V / A` independent of cross-sectional area `A` for vertical walls | PASS |
| `src/ch09.md` §9.1 / `resonance.md` | Weigh Earth's pull with a key on a 1 m thread (`:::home`) | Key, sewing thread (`1.00 m` and `0.25 m`), phone stopwatch | Safe | `10` swings of `1.00 m` take `20.07 s` (`±0.2 s` human stopwatch reaction gives `g` within `±2%`) | PASS |
| `src/ch09.md` §9.2 | Coupled pendulums on a horizontal string (`:::home`) | Two keys/spoons, thread, two chairs | Safe | Energy transfers completely back and forth every `5–10` swings (`10–15 s`) | PASS |
| `src/ch09.md` §9.3 / `tabla.md` | Singing glass & rubber-band guitar (`:::home`) | Steel/glass tumbler, rubber band, ruler | Safe | Halving speaking length doubles frequency (`+1 octave`, `100%` shift vs `~0.5%` human pitch threshold) | PASS |
| `src/ch09.md` §9.4 | Spoon on a string church bell (`:::home`) | Metal spoon, `1 m` cotton string | Safe | Solid string conducts vibration directly to fingers/ears (`~15–20 dB` louder than air path) | PASS |
| `src/ch09.md` §9.6 / `doppler.md` | Listen to passing scooter/train horn (`:::try`) | Balcony or pavement (with adult) | Safe (passive listening from balcony/footpath) | `54 km/h` (`15 m/s`) gives `1.092×` frequency ratio (`1.5 semitones`), easily heard by any listener | PASS |
| `src/stories/tacoma.md` | Strip of paper (`3 cm × 30 cm`) vs stiff card in front of ceiling/table fan (`:::home`) | Paper strip, stiff card, fan | Safe | Paper strip enters self-excited flutter immediately at `2–4 m/s` fan breeze | PASS |
| `src/ch10.md` §10.1 / `seeing.md` | Foil vs paper reflection & pinhole viewer (`:::home`) | Aluminium foil, paper, cardboard box/tube, pin, tracing/oiled paper | Explicitly warns **never** to look directly at the Sun (`seeing.md:62`); you look at the translucent paper screen inside the tube | Pinhole (`d = 1 mm`) at `L = 20 cm` projects a sharp inverted image on the translucent screen | PASS |
| `src/ch10.md` §10.2 | Half-height mirror test (`:::try`) | Wall mirror, sticky notes | Safe | Geometry `h_mirror = H_person / 2` independent of distance `d` | PASS |
| `src/ch10.md` §10.3 | Polished stainless spoon (inside bowl vs back) (`:::try`) | Stainless steel spoon | Safe | Concave bowl (`f ≈ 1.5 cm`) inverts image beyond `3 cm`; convex back stays upright and wide-angle | PASS |
| `src/ch10.md` §10.4 / `refraction.md` | Reappearing coin in a steel *katori* & straw in glass (`:::home`) | Steel bowl, ₹5 coin, water, glass, straw | Safe | Apparent depth `d/1.33 = 0.75 d` lifts coin ray by `~10–12°` over the rim | PASS |
| `src/ch10.md` §10.5 | Underside of water surface in a glass as a mirror (`:::try`) | Clear glass of water, spoon | Safe | Looking up at `>48.6°` from vertical gives `100%` total internal reflection (silvery mirror) | PASS |
| `src/ch11.md` §11.1 / `prism.md` | Glass of water on sunny windowsill & balcony plant mister rainbow (`:::home`) | Glass of water, windowsill sunlight, spray bottle | Safe | `~42°` primary rainbow cone in mist; `~1–2 cm` spectrum band across floor from water glass | PASS |
| `src/ch11.md` §11.3 / `blue-sky.md` | Sky in a glass (`2–3` drops of milk in water + phone torch) (`:::home`) | Clear glass, water, drops of milk, phone torch | Safe | Side-scattered light looks distinctly bluish-white while transmitted torch beam turns yellow-orange | PASS |
| `src/ch11.md` §11.4 / `raman.md` | Polarised sunglasses on phone screen & Marine Drive glare (`:::home`) | Polarised sunglasses, phone screen, adult accompaniment at Marine Drive | Explicitly specifies going "with an adult" (`raman.md:57`) | Rotating polariser against LCD/sky/water at `~37°` below horizon modulates glare intensity by `5–20×` | PASS |
| `src/ch11.md` §11.5 / `light-wave.md` | Soap bubble colours / black film & CD diffraction (`:::home`) | Dish soap + water, old CD/DVD | Safe | CD track pitch `1.6 μm` (`d sin θ = mλ`) spreads visible spectrum (`400–700 nm`) across `~12°` | PASS |

---

## Summary of Findings by Severity (Volume III — Gate B)

- **BLOCKER:** 0
- **FIX:** 0
- **CONSIDER:** 0
