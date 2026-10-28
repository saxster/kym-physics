# Kym's physics book: book plan (approval gate)

## Context
This is the second book in Kym's series. Kym is 12, lives in Mumbai and is on the IB/IGCSE track. The first book, *The Invisible World* (chemistry), lives in `saxster/kym-chem`. Its `source/` folder holds the reusable engine and `PLAYBOOK.md` (the method, pipeline, gates and lessons learned).

This book reuses that engine and method for physics. It is grounded first in MIT OCW and OpenStax, then rewritten into our story-first, misconception-first format. It will be published at https://saxster.github.io/kym-physics/.

PLAYBOOK step 3 is a hard stop: Amar approves this plan before any chapter is written. Pushing back on it now is cheap. Pushing back after chapters exist is not.

### Decisions already taken with Amar (2026-10-28)
- **Size:** 16 chapters (0–15) in four volumes.
- **Try-it boxes:** `:::try Investigation N.M` numbers are reserved for a future physics lab app.
- **School bridges:** bridge sentences target IB MYP and Cambridge IGCSE 0625 wording, not NCERT. The 0625 syllabus for 2026–28 is unchanged for 2029.
- **Grounding:** MIT OCW and OpenStax are the factual spine. We ground in them first, then adapt to our format.
- **OpenStax AI clause:** the OpenStax prefaces forbid ingestion "into large language models or generative AI offerings without OpenStax's prior written permission". Amar decided to go ahead anyway, because the book is non-commercial and written for one reader. We keep full CC BY-NC-SA attribution, and the "Access for free at openstax.org/…" line on every page view, as their licence requires. MIT OCW explicitly allows non-commercial AI use with attribution.
- **Visuals:** use every HTML5 and three.js affordance to make the book as rich and beautiful as possible. The guardrails are in §3.
- **Feynman:** explain everything in the simplest true way, following Feynman's teaching principles. The steelman is in §2.
- **Method updates:** these new ideas go into the reusable method (PLAYBOOK and Skill) so every future book inherits them. See §7.

### Facts found while planning
- `saxster/kym-physics` does **not** exist. GitHub returns 404 for the `saxster` login, and the token has `repo` scope. After approval I create it with `gh repo create saxster/kym-physics --public` and enable Pages from the root of `main`.
- `/Users/amarsukhi/src/MyCode/kym_chem` is a different repo. It is `saxster/kym_chem` (with an underscore), the Vite lab app, on a dirty branch, so don't touch it. The book engine is `saxster/kym-chem` (with a hyphen), and I clone a fresh copy of it.
- The chemistry engine has **no provenance ledger file**, although PLAYBOOK §3 calls one "required". This book builds it into the engine (§4).
- The chemistry site is one 3.6 MB `index.html`. With roughly 45 live widgets and three.js explorers, physics would grow far beyond that, so the build must load widgets lazily (§4).
- The `story-textbook` Skill on this Mac is a claude.ai-synced copy (`~/.claude/skills/synced/…`). Local edits would be overwritten, so the Skill update goes to claude.ai (§7).
- The Wolfram MCP server failed to connect this session. Numbers are computed in Python, which is what the Playbook asks for anyway.

---

## 1. Research done (step 2): what it found
All four reports are saved verbatim to `source/research/` on the first commit:
- `sources.md`
- `misconceptions.md`
- `history.md`
- `school-wording.md`

**Sources and licences**
- MIT OCW: CC BY-NC-SA 4.0, and AI use is explicitly allowed for non-commercial work with attribution.
- OpenStax *Physics*, *College Physics 2e*, *University Physics* and *Astronomy 2e*: now CC BY-NC-SA 4.0, plus the AI clause above. The *Physics* preface contradicts itself (it says CC BY in one place and BY-NC-SA in another), so we treat it as BY-NC-SA.
- PhET: sims released before 29 March 2026 are CC BY 4.0, unmodified, with attribution placed next to them. We link out rather than embed.
- NASA images: reusable with credit.
- ISRO images: reusable unaltered, with credit, and outside our licence.
- Cite only, ideas only: IOP Spark (CC BY-NC-ND), FCI and PhysPort (restricted), Driver et al., *A Private Universe*, Feynman Lectures (© Caltech), MacTutor (BY-SA, which is incompatible with our licence) and NCERT.
- Walter Lewin: MIT removed his OCW and edX courses on 8 December 2014 (https://news.mit.edu/2014/lewin-courses-removed-1208). Never use the 8.01/8.02 material from 1999 or Fall 2010.

**Spine (one MIT course and one OpenStax book per area)**

| Area | MIT OCW | OpenStax |
|---|---|---|
| Mechanics, gravity | 8.01SC Classical Mechanics, Fall 2016 (Chakrabarty, Dourmashkin et al.) + RES.8-003 demo videos | *Physics* (high school), Urone & Hinrichs |
| Energy, heat, fluids | 8.01SC energy weeks; 8.21 Physics of Energy (hooks and numbers) | *Physics*; *College Physics 2e* for fluids and thermodynamics |
| Waves, sound, light | 8.03SC Vibrations and Waves, Fall 2016 (Yen-Jie Lee) | *Physics* |
| Electricity, magnetism | 8.02 Spring 2007, TEAL (PRS concept questions, Belcher field visualisations) | *Physics* |
| Sky, stars | 8.282J Intro to Astronomy, Spring 2006 (Rappaport) | *Astronomy 2e* (Fraknoi, Morrison, Wolff) |

**Misconceptions**
- The 15 most persistent are ranked in `misconceptions.md`.
- Top three:
  - impetus, 65% of n=478 (Halloun & Hestenes 1985);
  - "something leaves my eyes when I see", 86% (Winer 2002);
  - "there's no gravity in space", 81% of 13-year-olds (Stead & Osborne).
- The research gives three design rules:
  1. A demo alone rarely changes a belief. It needs the full elicit → confront → resolve sequence.
  2. Corrections fade within 3–5 months (Winer). So each chapter revisits misconceptions from earlier chapters with the new `:::recall` block.
  3. Wrong ideas come in inconsistent bundles. So each idea is tested in two or three different settings.

**History**
- About 60 scenes, each tagged TRUE, HEDGE or LEGEND.
- 16 verified true stories that sound made up.
- A 35-person cast with sources.
- Pisa, the cathedral lamp, Pythagoras' hammers, Archimedes' "Eureka", "you may tax it", Edison and Topsy, and Joule's waterfall thermometer are legends or hedged. The book uses the true version beside each one: Stevin at Delft in 1586; Vincenzo Galilei's strings; Galileo debunking the crown story at 22.

**Already rejected:** "a brim-full glass barely overflows when sugar dissolves", from the misconceptions report. The chemistry book's lesson log flags this as false. The Playbook rule stands: writers must reject wrong suggestions from research.

---

## 2. Teaching like Feynman: the simplest true explanation (steelman)

The aim is the simplest explanation that is **true**: the shortest path from what Kym can see and do to the real mechanism, with nothing in it she will later have to unlearn. The rules below come from Feynman's documented practice. They are not the internet's "Feynman Technique", which is a four-step recipe coined in a 2011 blog post by Scott Young. The Skill says so, so future books don't cite the meme.

| Principle | Documented source | Rule for writers |
|---|---|---|
| **Know the thing, not the name.** | His father and the bird (*What Do You Care What Other People Think?*, 1988). The Brazil class who could recite Brewster's angle but could not see it in light reflected off the bay (*Surely You're Joking*, "O Americano, Outra Vez!"). | The phenomenon comes first and the name after it. Every new term is earned by something she has seen. |
| **A label is not an explanation.** | "Judging Books by Their Covers" (*Surely You're Joking*). "Energy makes it go" says no more than "movability makes it move". | **Movability test:** swap the term for a made-up word. If the sentence still "explains", it explains nothing. Show the spring, the gear, the push. (This sharpens the Playbook's principle 4.) |
| **If it can't be made simple, we don't understand it yet.** | Goodstein, "Richard P. Feynman, Teacher", *Physics Today* 42(2), 1989: "I couldn't reduce it to the freshman level. That means we really don't understand it." | Simplicity tests the writer, not the reader. When a section won't go simple, the writer goes back to the grounding note and re-researches. They do not water it down. |
| **You must not fool yourself.** | "Cargo Cult Science", Caltech commencement address, 1974. | The integrity gates. Report what doesn't fit, and say plainly what nobody knows yet (for example the Mpemba effect, or the monsoon's cause). |
| **Several ways to see the same thing.** | His recurring claim that good physicists hold several representations of the same physics (*The Character of Physical Law*, 1965; exact wording to be checked at the gate). | Each big idea is approached from at least two angles: picture, number, story and hands. |
| **Start from what you can see; estimate first.** | His habit throughout the Lectures and the memoirs. | Numbers come before formulas. A guess comes before a measurement. Fermi estimates are a recurring "thinking tool". |

**Steelman guards.** These stop "simplest" from sliding into one of four failure modes:
1. **Simple must not be false.** Misconception research shows that convenient fictions stick. Where a model is incomplete, say where it stops, once.
2. **Simple is not the same as short.** A simple explanation often has more steps, each one smaller.
3. **Simple is not the same as easy.** Keep the challenge. Feynman's own *Lectures* overshot many of the freshmen they were written for. The lesson is to test each explanation on its real reader.
4. **Simple is not the same as vague.** Precise words, real numbers and named people stay.

**New gate, the "Feynman read".**
- An independent agent reads each section as Kym would and flags four things: a name given before it is shown; a label used as an explanation; a skipped step; a convenient falsehood.
- It then writes a 3-sentence explain-back in a 12-year-old's words. If the explain-back contains the misconception, the section is rewritten.

---

## 3. The visual layer (HTML5 + three.js), with guardrails

**Ambition per chapter**
- A volume-motif opener.
- 2–4 live figures.
- One hands-on sensor lab where the idea allows it.
- A still engraved SVG behind every live figure, used for print, for readers without JavaScript, and as the first view.

**Affordances**
- **three.js**
  - Explorers (below).
  - 3D field lines, inspired by Belcher's TEAL visualisations but redrawn by us.
  - Orbits; the eye and lens; wave surfaces.
- **WebGL shaders**
  - A ripple tank showing interference.
  - Sky colour from scattering as the Sun's angle changes.
  - A Doppler wavefront.
- **Canvas 2D** for motion, force, energy and circuit widgets. This uses the existing `live/core.js` API.
- **Web Audio**
  - A harmonic builder (tabla vs a tin drum).
  - Beats; Doppler pass-by of a local-train horn.
  - Pitch vs loudness.
- **Sensors (opt-in, permission-gated, never required)**
  - The DeviceMotion accelerometer reads about 0 g while the phone falls onto a pillow.
  - The microphone drives an oscilloscope and spectrum of her own voice and times an echo.
  - Magnetometer where the browser supports it (Chrome on Android). Otherwise the box points to phyphox.
- **Video tracker:** she loads her own slow-motion clip of a tossed ball, steps through it frame by frame and taps the ball to get a position–time graph. Video never leaves the device.
- **CSS:** scroll-driven animations for chapter openers and View Transitions between chapters. The chemistry book's dotted-engraving art and volume motifs (`m_beauty`) are kept.

**Explorers (structures she returns to)**
1. **Powers of Ten** (three.js). A logarithmic zoom from a proton → atom → grain of salt → Kym → Mumbai → Earth → Moon's orbit → Solar System → galaxy, with real sizes and a "how many times bigger" readout.
2. **The Sky** (three.js orrery). Sun, Earth and Moon with the real 23.4° tilt, and two views: "from space" and "from a Mumbai rooftop". A date and time slider drives:
   - noon Sun height at Mumbai;
   - Moon phase;
   - eclipses;
   - the tidal bulges, marked as schematic.
   Mission tabs show Chandrayaan-3's slow orbit-raising and Aditya-L1's halo orbit, from ISRO data.
3. **The Ladder of Light.** The electromagnetic spectrum from GMRT radio, through J. C. Bose's 5 mm waves, the TV-remote infrared, visible light and UV, to X-rays. Each rung has a real source, a wavelength ruler, and the stories that belong to it.
4. **The adventure map + Lifelines.** The chemistry book's `m_map`, reused with new `places_data.js`.

The periodic-table and atlas explorers are dropped.

**Guardrails** (from the Playbook, made stricter):
- Every moving thing teaches the section's idea and is physically honest: real ratios, conservation checked every frame, and slowed or exaggerated parts named in the readout.
- No autoplay.
- Pause when off screen.
- Reduced motion opens paused.
- At most 2–3 controls.
- Book colours and themes (light, dark, sepia).
- **Performance budget:**
  - `index.html` stays under 4 MB.
  - Each widget chunk stays under 150 KB.
  - three.js loads once, as a shared chunk, and only when a 3D figure opens.
  - 60 fps on a mid-range Android phone.
  - Everything precached by the service worker for offline use.

---

## 4. Engine changes (copied from `kym-chem/source`, then extended)

**Keep:**
- `build.py`, `stories.py`, `book.css`, `fonts/`, `fonts_prep.py`
- the `app/` modules: core, pages, settings, progress, search, checks, notebook, readaloud, beauty, layout, map
- `live/core.js`, `live/three_kit.js`
- `shoot.py`, `livetest.py`, `site_src/`

**Replace:**
- `src/`, `figs_*.py`, `live/w_*.js`, `places_data.js`
- `TITLE`, `SUBTITLE`, `VOLUMES`, `SITE_URL`
- the story `GROUPS`

**Drop:** `m_ptable`, `m_atlas`, `ptable_data`, `atlas_data`, `c_ptable.css`, `h_atlas.css`.

**New:**
1. **Split build.** esbuild `splitting: true`. Widgets and three.js become lazy chunks under `site/live/`, and `sw.js` precaches them. The single-file `--out` build still works for quick checks.
2. **Provenance ledger** in `source/provenance/chNN.yml`. It has one entry per numbered section, story and figure, recording:
   - `ocw` and `openstax`: URL plus what was taken (idea, sequence, problem, number, demo);
   - `research`: misconception and history sources;
   - `figure_origin`: ours, or redrawn from X;
   - `licence`.
   `build.py` **fails** if a numbered section has no entry. It generates the credits page "Where this book comes from" and puts the OpenStax attribution line in each chapter's footer.
3. **New blocks:**
   - `:::predict` — choices recorded in the notebook before the reveal;
   - `:::recall` — a misconception from an earlier chapter, returning (spaced retrieval);
   - `:::school` — a one-line IB/IGCSE bridge.
   `m_checks` is extended to store predictions and resurface them.
4. **`live/core.js` sensor and audio API:** `api.motion()`, `api.mic()`, `api.audio()`, `api.video()`. Each has a permission prompt, a graceful "not available here", and no data leaving the device.
5. **New explorers:** `m_scale`, `m_sky`, `m_spectrum`.

---

## 5. The book

**Title (proposed):** *The Moving World*, with the subtitle *Physics from the falling stone to the stars*. It is a sibling to *The Invisible World*.

**Five big ideas** (the front-matter page, as in chemistry):
1. **Forces change motion; they don't keep it going.** Every force is one half of a pair between two things.
2. **Energy is never used up.** It moves between stores and spreads out until it is no longer useful.
3. **Waves and fields carry energy without carrying stuff.** That covers sound, light, and the pull of a magnet across empty space.
4. **One set of rules for Earth and sky.** The law that drops a mango also steers Chandrayaan-3.
5. **The habit underneath:** estimate before you measure, and keep what you observe separate from the model that explains it.

**Story groups:** people (the cast), tales (true stories that sound made up), motion, sky, energy, waves, fields, atoms, tools (thinking tools: estimation, graphs, vectors, ratios, logarithmic scales).

Each chapter below shows its big question, then its sections, each with its misconception → decisive demo. **Live** marks the canvas/three.js figures. The spine column of the grounding notes maps each chapter to its exact OCW sessions and OpenStax sections. That mapping is the first job of step 6.

### Volume I: Motion and force (Chapters 0–4)

**Ch 0: The physicist's way of seeing**
*How can a man with a stick and a shadow measure the whole Earth?*
- 0.1 What we see and what we think. Observation vs model; the Eratosthenes scene (to be checked at the gate).
- 0.2 Measuring anything. Units; the 2019 kilogram redefinition (a tale).
- 0.3 Powers of ten. Count the rice in a teaspoon, then estimate a 25 kg sack. Opens the **Powers of Ten** explorer.
- 0.4 Guess like a physicist. A Fermi estimate: how much rain falls on Mumbai in one monsoon day?
- Case: *The shadow at Syene.*

**Ch 1: Describing motion**
*At the very top of a throw, the ball stops for an instant. Is anything happening to it then?*
- 1.1 Where and when. Walking inside a moving local train; frames of reference.
- 1.2 How fast, and which way. Speed vs velocity; distance–time graphs. **Live:** graph-walker.
- 1.3 Speeding up and turning. Acceleration as change of velocity.
- 1.4 Galileo's ramps. Padua, c. 1604; the 1:3:5:7 spacing; the singing-beat story, hedged.
- 1.5 The top of a throw. "Zero speed means zero acceleration" (44%) → the **video tracker** on her own slow-motion clip.
- Case: *Two trains on the Western line.*

**Ch 2: Why things keep moving**
*When a local train brakes hard, everyone lurches forward. What pushed them?*
- 2.1 Aristotle's world. Her intuition is Aristotle's, and that is respectable.
- 2.2 The arrow problem. Philoponus → Ibn Sina → Buridan's impetus (65% hold impetus today).
- 2.3 The ball that never stops. Galileo's two-ramp thought experiment. **Live:** ramp with a friction slider.
- 2.4 Newton's first law. Inertia; the coin-on-card-on-glass trick at home.
- 2.5 Friction is a force. An ice cube on a wet thali vs on cloth.
- Case: *The tablecloth trick.*

**Ch 3: Forces come in pairs**
*A mosquito hits the windscreen of a speeding car. Which feels the bigger force?*
- 3.1 Adding forces. Net or resultant force; tug-of-war. **Live:** force arrows.
- 3.2 Why heavy things are hard to start. F = ma: scooter vs truck.
- 3.3 Can a table push? About 50% say no → Clement's bridging chain: spring → foam → steel ruler sagging under ₹5 coins → table.
- 3.4 Every push has a partner. Two luggage scales pulled against each other read the same (73% believe "the bigger truck pushes harder").
- 3.5 Momentum and rockets. Thumba, 1963; a balloon rocket on a string. **Live:** momentum carts.
- Case: *The mosquito and the windscreen.*

**Ch 4: Falling**
*Drop a cricket ball and a ₹1 coin from the same height. Which lands first, and why do you think so?*
- 4.1 Heavier falls faster? Aristotle; Stevin at Delft, 1586 (true); Pisa (legend).
- 4.2 Air gets in the way. Flat paper vs crumpled paper; terminal speed of monsoon raindrops. **Live:** falling with an air-resistance slider.
- 4.3 On the Moon. Apollo 15's hammer and feather, 1971.
- 4.4 Thrown sideways. A dropped coin and a flicked coin land together; McCloskey's curved-tube study. **Live:** projectile with independent axes.
- 4.5 Going round. "Centrifugal force" → a marble leaving a paper plate through a gap goes straight. **Live:** whirl-and-release.
- Case: *The ball off the Sea Link.*

### Volume II: Gravity, pressure and energy (Chapters 5–8)

**Ch 5: Gravity and orbits**
*Astronauts on the space station float, yet gravity up there is about 89% as strong as on the ground. Why do they float?*
- 5.1 The apple and the Moon. Woolsthorpe, 1666 (hedged); the Moon falling towards us.
- 5.2 Newton's cannon. An orbit is falling and missing; phyphox reads 0 g during a drop. **Live:** three.js Newton's cannon.
- 5.3 Ellipses. Tycho's Mars data, Kepler's 8 arcminutes.
- 5.4 Weighing the Earth. Cavendish's shed, 1798.
- 5.5 Predicting the sky. Halley's comet on Christmas night 1758, with Lepaute's sums; Neptune, 1846.
- 5.6 The slow road to the Moon. Chandrayaan-3's orbit-raising, seen through **The Sky** explorer's mission tab.
- Case: *The comet that came back.*

**Ch 6: Pressure, floating and the ocean of air**
*A steel ship of 50,000 tonnes floats. A steel ₹5 coin sinks. How?*
- 6.1 Pressure. Elephant vs stiletto heel; force per area.
- 6.2 The ocean of air. Torricelli, 1643; Périer on the Puy de Dôme, 1648.
- 6.3 Nothing sucks. Magdeburg hemispheres; card on an upside-down glass; straws. School bridge: "suction" is not in the syllabus.
- 6.4 Deeper means more. p = ρgh; divers; dams. **Live:** pressure tank.
- 6.5 Why ships float. Archimedes, and the crown legend debunked by Galileo at 22; density; an orange floats until peeled; an egg floats in salt water. **Live:** buoyancy tank.
- Case: *The egg that changed its mind.*

**Ch 7: Energy**
*If energy can never be destroyed, why does the electricity bill say "units consumed"?*
- 7.1 What is energy? A bookkeeping number that never changes (Feynman's blocks idea, re-told in our own words).
- 7.2 mv or mv²? 's Gravesande's balls in clay and du Châtelet; at home, a marble dropped into flour from 1× and 4× the height.
- 7.3 Stores and transfers. IGCSE language. **Live:** energy track (skate-park style).
- 7.4 Where does it go? A bouncing ball timed with phyphox; never "lost", only spread out.
- 7.5 Power and the bill. Watts and kWh: a mixer-grinder vs an LED; a biscuit's kcal in kWh.
- 7.6 Energy for a city. Where Mumbai's electricity comes from; numbers checked at the gate.
- Case: *The perpetual-motion machine.*

**Ch 8: Heat and temperature**
*A steel thali and a wooden board sit in the same room all night. In the morning the steel feels colder. Is it?*
- 8.1 Hot and cold aren't substances. Caloric; Rumford's cannon, 1798; Joule.
- 8.2 Heat vs temperature. A bucket vs a spoonful of hot water.
- 8.3 Why metal feels colder. Ice cube on aluminium vs on plastic. **Live:** particle conduction.
- 8.4 Sweaters don't make heat. Ice cube wrapped in a sweater vs left bare.
- 8.5 Hidden heat. Black, 1761; the flat stretch on a heating graph. Links to *The Invisible World*, Ch 3.
- 8.6 The matka and the monsoon. Evaporative cooling; why a matka works better in May than in July (wet-bulb limit); sea breezes; Halley's 1686 theory → Gadgil's 2021 challenge to it, presented as an open question.
- Case: *May or July?*

### Volume III: Waves, sound and light (Chapters 9–11)

**Ch 9: Vibrations, waves and sound**
*A wave crosses the whole Arabian Sea, but the water in it stays where it is. So what travels?*
- 9.1 Things that swing. Pendulums; the cathedral lamp is a legend.
- 9.2 Resonance. Pushing a swing; the Millennium Bridge, 2000; Tacoma Narrows (flutter, not simple resonance).
- 9.3 What a wave carries. Paper floating on bucket ripples. **Live:** wave on a string / ripple tank shader.
- 9.4 Sound is a push passed on. A spoon on a string held to the ears; why a bell jar goes silent.
- 9.5 Loud and high. Amplitude vs frequency. **Sensor lab:** microphone oscilloscope of her own voice.
- 9.6 Why a tabla sings. Harmonics; Raman & Kumar, 1920; Vincenzo Galilei's strings. **Live:** Web Audio harmonic builder.
- 9.7 The moving whistle. Doppler; Buys Ballot's horn players, 1845; a local-train horn. **Live:** Doppler wavefronts with audio.
- Case: *The echo off the building.*

**Ch 10: Light and seeing**
*In a perfectly dark room, can you see your own hand?*
- 10.1 Does anything leave your eyes? 86% think so; Euclid and Ptolemy vs Ibn al-Haytham in Cairo; a windowless bathroom at night.
- 10.2 Straight lines and shadows. A pinhole camera, which is a camera obscura at home.
- 10.3 Mirrors. The image is behind the glass. **Live:** ray mirror.
- 10.4 Bending light. A coin that appears in a cup when water is poured in. **Live:** refraction.
- 10.5 Lenses and the eye. A water-drop lens; how glasses work. **Live:** three.js eye.
- 10.6 How fast is light? Rømer, 1676; Fizeau, 1849; the Sun's light is 8 minutes old; the radio delay from the Moon.
- Case: *The disappearing coin.*

**Ch 11: Colour, and what light really is**
*The sky is blue, the sunset over Marine Drive is orange, and the sea is blue too. Is it the same reason every time?*
- 11.1 White is a mixture. Newton's prism (letter of 1672); a CD rainbow.
- 11.2 Colour is in the light. A banana under red light; mixing light vs mixing paint. **Live:** colour mixer.
- 11.3 Blue sky, orange sunset. Scattering; milk-in-water demo. **Live:** sky-colour shader.
- 11.4 Why the sea is blue. Raman on the *Narkunda*, 1921, posting his letter in Bombay; polarised sunglasses at Marine Drive; Feynman's Brazil class.
- 11.5 Light is a wave. Young's card, 1803; Poisson's "absurd" spot found by Arago, 1818.
- 11.6 The colour that changed. Raman and Krishnan, 1928; National Science Day. Opens **The Ladder of Light**.
- Case: *The sunglasses test.*

### Volume IV: Electricity, magnetism and the sky (Chapters 12–15)

**Ch 12: Charge and circuits**
*A bulb glows only when a complete loop of wire joins it to the battery. If the bulb "uses up" electricity, why does it need a wire going back?*
- 12.1 Rubbing moves charge. A balloon and a stream of water; why it is weaker in Mumbai's monsoon humidity.
- 12.2 A loop, not a pipe. One wire is never enough.
- 12.3 What gets used up? The current is the same all the way round; energy is what gets delivered. **Live:** circuit with a rope-loop model.
- 12.4 Push and resistance. Voltage and resistance; a battery is not a constant-current source. LED experiments with two AA cells and a resistor.
- 12.5 Series and parallel. Why one fused bulb doesn't black out the flat.
- 12.6 Safe at home. Mains, MCBs and earthing; never experiment on mains.
- Case: *The LED that wouldn't light.*

**Ch 13: Magnetism and electromagnetism**
*A magnet grabs a ₹5 coin but ignores a steel spoon. Both are "steel". What's going on?*
- 13.1 Which metals stick? Indian coins are ferritic steel; many spoons are austenitic stainless. Both checked at the safety gate.
- 13.2 The Earth is a magnet. Gilbert's terrella, 1600; a needle floating on a leaf; the Colaba Observatory, 1841, driven to Alibag by the trams of 1904.
- 13.3 Electricity makes magnetism. Ørsted, 1820; a wire over the phone's compass. **Live:** three.js field lines.
- 13.4 The first motor. Faraday, 1821; a homopolar motor at home, adult-led, safety-gated.
- 13.5 Magnetism makes electricity. Faraday, 1831; generators; how Mumbai's power is made. **Live:** induction.
- 13.6 Light is electromagnetic. Maxwell, 1865; Hertz, 1887; J. C. Bose in Calcutta, 1895; GMRT.
- Case: *The trams and the magnetometer.*

**Ch 14: Earth, Moon and Sun**
*Earth is closest to the Sun in January, when Mumbai is at its coolest. So what causes seasons?*
- 14.1 Day and night. Aryabhata's boat, 499 CE; Foucault's pendulum, 1851.
- 14.2 Why seasons happen. *A Private Universe*; a torch shone straight vs slanted; the Mumbai noon Sun at 86° vs 48°; why Mumbai's year is shaped more by the monsoon than by temperature.
- 14.3 Phases of the Moon. An orange and a lamp; not Earth's shadow (41–44% think it is).
- 14.4 Eclipses. Aryabhata's shadows; why there isn't one every month.
- 14.5 Tides at Haji Ali. Two bulges; spring and neap tides; a month-long log using INCOIS data. All through **The Sky** explorer.
- Case: *The causeway timetable.*

**Ch 15: Atoms, stars and the universe**
*The Sun has burned for four and a half billion years. What could possibly keep a fire going that long?*
- 15.1 Light comes in packets. Einstein, 1905; S. N. Bose's letter from Dacca, 1924; seeing TV-remote infrared on a phone camera.
- 15.2 The nucleus and radiation myths. "Radiation makes things radioactive" (63–75% think so); Bhabha and TIFR, Bombay, 1945. Links to *The Invisible World*, Ch 1.
- 15.3 E = mc² and the Sun's fire. Meitner, 1938; fusion; Aditya-L1 watching the Sun.
- 15.4 What stars are made of. Saha, 1920; Payne, 1925.
- 15.5 How far are the stars? Parallax; Leavitt, 1912.
- 15.6 How stars die. Chandrasekhar on the *Pilsna*, sailing from Bombay, 1930.
- 15.7 The stretching universe. Redshift; IGCSE bridge; space stretching, not an explosion.
- Case: *The star that's mostly hydrogen.*

**Section count:** about 90. **Live figures:** about 45, plus 4 explorers and 3 sensor labs.

### Cast (life-story cards, initials medallions, no photographs)
Aryabhata · Brahmagupta (hedged: an idea of attraction, not a law) · Ibn al-Haytham · Bhaskara II · Stevin · Tycho · Galileo · Kepler · Torricelli · Newton · Halley · du Châtelet · Cavendish · Rumford · Ørsted · Fresnel · Faraday · Mayer · Maxwell · J. C. Bose · Leavitt · Meitner · Raman · Saha · S. N. Bose · K. S. Krishnan · Payne-Gaposchkin · Bhabha · Chandrasekhar · C.-S. Wu · Bibha Chowdhuri · Anna Mani · Sarabhai · Govind Swarup · Kalpana Chawla.

That is 35 people. Each card gets a source URL from `history.md`, and dates are spot-checked at the gate.

### True stories that sound made up (tales group)
1. Cavendish's shed
2. Rømer's late eclipse
3. Arago's spot
4. Buys Ballot's horn players
5. Fizeau's cogwheel
6. Galileo's fingers
7. The Faraday cage
8. Foucault's pendulum
9. The 1919 eclipse and its controversy
10. The Millennium Bridge
11. Tacoma Narrows and Tubby the dog
12. Einstein's brain
13. The kilogram that changed
14. Mpemba (the effect is disputed, and the book says so)
15. The *Principia* and the fish book
16. Bombay's observatory chased out by trams

**Topic stories:** about 30. Their ids, terms and beats are written in `STORIES.md` at step 4.

---

## 6. Execution after approval (with file ownership)

Agents follow `pstack-models.md`: prose and judgment on `fable@max`, engine and widgets on `opus@high`, gates on fresh `xhigh` agents that have not seen the writing.

| Step | What | Who owns which files | Est. |
|---|---|---|---|
| 1 | Create the repo; clone `saxster/kym-chem` into the scratchpad; copy the engine to `kym_physics/source/`; save the 4 research reports to `source/research/` | me | ~20 min |
| 2 | Engine changes from §4 (split build, provenance check, new blocks, sensor API, explorer shells). A stub chapter must build and pass `livetest.py`. | 1 engine agent: `build.py`, `stories.py`, `app/`, `live/core.js` | ~3 h |
| 3 | **Grounding pass.** One note per chapter, `source/grounding/chNN.md`, built from the mapped OCW sessions and OpenStax sections: concept sequence, definitions, laws, standard values with units, worked numbers, demos, concept questions, and errors the sources themselves warn about. Every line carries its URL. | 4 agents × 4 chapters | ~2 h |
| 4 | Subject docs: `NARRATIVE.md`, `STORIES.md`, `FORMAT.md` (physics blocks and figure helpers), front matter | me | ~1 h |
| 5 | Chapter writers. A physics fact may be stated only if it appears in a grounding note, is computed in Python, or is cited in the research. Writers fill in the ledger as they go. | 6 writers × 2–3 chapters: `src/chNN.md`, `figs_chNN.py`, `provenance/chNN.yml` | ~5 h |
| 6 | Stories (topic, life, tales) | 3 writers: `src/stories/*`, `figs_stories_*.py` | ~3 h |
| 7 | **Gates** (independent): facts, with numbers in Python; fidelity against the grounding notes; the Feynman read; safety and will-it-work in a Mumbai flat; licence and provenance. Findings go back to the owning writer. | 5 gate agents | ~3 h |
| 8 | Widgets, explorers and sensor labs, then the design pass. Visual QA at 390/820/1024/1180/1440 px × light/dark/sepia by a subagent that returns a text verdict and paths; `livetest.py`; zero console errors | 3 widget agents + 1 QA agent | ~6 h |
| 9 | Publish to `main`, enable Pages, then check that the live `sw.js` version matches the build | me | ~20 min |
| 10 | Method update (§7) | me | ~45 min |

This will span several sessions. Each step ends with a dated memory note, so the next session resumes cleanly.

## 7. Making it part of the Skill

1. **`PLAYBOOK.md` v2.** New sections:
   - Grounding-first pipeline (the grounding notes plus the "fact must trace" rule)
   - Teaching like Feynman (§2, with sources and the movability test)
   - The visual layer (§3: affordances, guardrails, budgets)
   - The build-enforced provenance ledger
   - `:::predict`, `:::recall` and `:::school`
   - New lessons learned: the OpenStax AI clause; PhET's licence change on 29 March 2026; the IB/IGCSE wording table; "simple ≠ false"
   It goes to `kym-physics/source/PLAYBOOK.md`. A PR to `saxster/kym-chem` makes the same update there, because the Skill points to that copy. I'll ask before opening the PR.
2. **`SKILL.md` v2.** The same rules in brief: grounding first; Feynman's principles and the Feynman-read gate; the visual layer; the ledger enforced by the build. It is saved as `kym-physics/source/SKILL.md`, and I give you the text to paste into the `story-textbook` Skill on claude.ai. The local synced copy can't be edited durably.

## 8. Verification
- `python3 build.py --site build/site` exits 0. It fails if any numbered section lacks a provenance entry.
- `python3 livetest.py build/site/index.html <scratch>`: every live figure opens, and there are zero console errors.
- Playwright screenshots at 5 widths × 3 themes. The QA subagent reports overflow, collisions and illegible text, and returns the file paths.
- Lighthouse, or a manual check on a throttled mid-range Android profile, against the budget: `index.html` < 4 MB, widget chunks < 150 KB, and offline reload works.
- Gate reports saved to `source/gates/*.md`, with every finding marked fixed or rejected (with a reason).
- Live check: `curl https://saxster.github.io/kym-physics/sw.js` shows the same cache version as `build/site/sw.js`.
- The final report names each command that ran and its result, and says what is still unverified.

## 9. Open items to check at the gates
- Eratosthenes scene details: not yet researched.
- Brahmagupta's exact wording in Sachau.
- Mumbai's tide range, from INCOIS.
- Gaganyaan status: as of 2026-10-24, the uncrewed G1 flight was about two months away.
- The Hertz "no use" quote: tell as "the story goes".
- The Thumba bicycle photograph.
- Whether Indian coins and spoons are magnetic: test, don't assume.
- The Feynman "several representations" wording.
