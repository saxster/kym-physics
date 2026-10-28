# Stories behind the ideas: plan and standards

Each story is `src/stories/<id>.md` (front matter format in stories.py's docstring). **Terms** are the words in the book
that link to the story; each term belongs to exactly one story (below). The build links the first mention per section.
Never use everyday words that also have a plain meaning in the book as terms (force, energy, work, power, field, wave,
light, heat, unit, current-as-in-now, charge-as-in-price are all banned as bare terms; use the specific phrase instead).

## Voice and rules
* A true adventure, then the idea, step by step. Open with `:::scene Place, year`. Let Kym (12) stand beside the people
  who worked it out: what they saw, what went wrong, what surprised them. Then slow down: numbered steps
  (`#### Step 1: ...`), everyday analogies, a worked example (`:::work`), the common slip (`:::careful`), something to do
  (`:::home`, kitchen-safe only).
* Lengths: topic stories 800–1,500 words; thinking tools 500–900; tales 500–900; life stories 400–700.
* Simplest true explanation (BOOKPLAN §2): the phenomenon before the name, mechanism not label, nothing she must unlearn.
* History must be true. Use research/history.md labels: TRUE as fact, HEDGE as "the story goes", LEGEND told as a legend
  with what really happened. Compute every number in Python. Never invent a quote.
* Include women and non-European scientists where the history genuinely involves them; never shoehorn.
* No `:::note`, `:::check`, `:::case`, `:::next`, `:::try`, `:::predict`, `:::recall` inside stories. Figures: reuse a
  chapter figure or add `s_`-prefixed ones in `figs_stories_<group>.py`; `:::live` allowed.
* Each story needs a provenance entry (`story:<id>`) in the ledger of the chapter that first links it.
* Close with one or two sentences tying back to the main book.

Priority: **P1** must exist when the book first publishes; **P2** may follow.

## Motion and force (group: motion)
- `impetus` P1 — The arrow problem: two thousand years of a wrong idea. sort 530. terms: impetus, Philoponus, Buridan, Aristotle's physics. Beats: Aristotle's mover; Philoponus in Alexandria; Ibn Sina's *mayl*; Buridan names impetus; why it felt right (and still does to 65% of students); what Galileo changed.
- `inertia` P1 — The ball that never stops. sort 1638. terms: inertia, Newton's first law, first law of motion. Beats: Galileo's two ramps; Descartes' straight lines; Newton's first law; the local train lurch explained.
- `third-law` P1 — Every push has a partner. sort 1687. terms: Newton's third law, third law of motion, action and reaction. Beats: Newton's horse-and-stone example (check wording in the *Principia*); luggage scales; why the truck and car feel equal forces but not equal effects.
- `momentum` P1 — Rockets from a church. sort 1963. terms: momentum, rocket, rockets, Thumba. Beats: conservation of momentum; Sarabhai and St Mary Magdalene church, 21 November 1963 (bicycle detail HEDGE); balloon rocket; Chandrayaan's engines.
- `falling` P1 — The single thud at Delft. sort 1586. terms: free fall, Stevin, air resistance, terminal velocity, terminal speed. Beats: Aristotle's prediction; Philoponus; Stevin and de Groot at the Nieuwe Kerk; Pisa as legend; Apollo 15's hammer and feather.
- `circular` P2 — Why there is no force flinging you out. sort 1673. terms: centripetal, centripetal force, centrifugal, centrifugal force, circular motion. Beats: Huygens on circular motion (check), the paper-plate marble, the honest note about rotating frames.

## Pressure and floating (group: fluids)
- `ocean-of-air` P1 — We live at the bottom of an ocean of air. sort 1643. terms: atmospheric pressure, air pressure, barometer, Torricelli, vacuum, Magdeburg hemispheres, suction. Beats: pumps that stopped at 10 m; Torricelli's tube; Périer climbs the Puy de Dôme with a priest guarding the control tube; von Guericke's horses (count HEDGE).
- `floating` P1 — Galileo and the crown. sort 1586. terms: buoyancy, upthrust, Archimedes' principle, Archimedes, density, densities. Beats: Vitruvius's bath story as legend; the 22-year-old Galileo's *La Bilancetta*; why a steel ship floats; the egg in salt water.

## Gravity and the sky (group: sky)
- `gravity` P1 — The apple and the Moon. sort 1666. terms: gravity, gravitation, universal gravitation, inverse square law, inverse-square. Beats: Woolsthorpe in the plague years (apple HEDGE, Stukeley 1726); the Moon falling towards us; Halley's 1684 question.
- `orbits` P1 — Falling around the Earth. sort 1687. terms: orbit, orbits, orbital, Newton's cannon, weightless, weightlessness, space station, ISS. Beats: Newton's mountain-top cannon; why astronauts float at 89% gravity; the phone that reads zero in free fall.
- `kepler` P1 — Eight minutes of arc. sort 1609. terms: Kepler, Kepler's laws, Tycho, Tycho Brahe, ellipse, elliptical. Beats: Hven; Prague 1600; the Mars data; ellipses.
- `planet-from-a-pen` P2 — The planet found with a pen. sort 1846. terms: Neptune, Le Verrier, Halley's comet. Beats: Halley's 1758 prediction, Clairaut, Lalande and Nicole-Reine Lepaute; Palitzsch on Christmas night; Uranus drifting; Galle finds Neptune the night the letter arrives.
- `earth-turns` P1 — Aryabhata's boat. sort 499. terms: Earth's rotation, rotation of the Earth, Aryabhatiya. Beats: the boat analogy; eclipses as shadows; why nobody feels the spin; Foucault as the later proof (link to tale).
- `seasons` P1 — Harvard graduates and the seasons. sort 1987. terms: season, seasons, axial tilt, solstice, solstices, equinox, perihelion, aphelion. Beats: *A Private Universe*; Earth nearest the Sun in January; the slanting torch; Mumbai's noon Sun in June and December.
- `moon-phases` P1 — The orange and the lamp. sort 9999 (tool-like but in sky). terms: phases of the Moon, Moon's phases, crescent, gibbous, eclipse, eclipses, lunar eclipse, solar eclipse. Beats: half lit always; why not Earth's shadow; why eclipses are rare (5° tilt).
- `tides` P1 — Why Haji Ali goes under the sea. sort 1687. terms: tide, tides, high tide, low tide, spring tide, neap tide, tidal. Beats: Newton's explanation; two bulges; spring and neap; Mumbai tide tables (INCOIS).
- `chandrayaan` P1 — The slow road to the Moon. sort 2023. terms: Chandrayaan-3, Chandrayaan-1, Chandrayaan, Vikram lander, Pragyan, ISRO. Beats: why a spacecraft climbs in loops; lunar capture; landing at 18:04 IST on 23 August 2023; Shiv Shakti Point; sulphur.
- `sun-watcher` P2 — A spacecraft that never stops watching the Sun. sort 2024. terms: Aditya-L1, Lagrange point, L1. Beats: balance of pulls; halo orbit 6 January 2024; what it measures.

## Energy and heat (group: energy)
- `vis-viva` P1 — mv or mv²? sort 1740. terms: kinetic energy, vis viva, 's Gravesande. Beats: brass balls in clay; du Châtelet's *Institutions* (backed it; did not "prove" it); twice as fast, four times the dent.
- `conservation` P1 — The number that never changes. sort 1847. terms: conservation of energy, energy store, energy stores, energy transfer, Mayer, Joule. Beats: Mayer's bright-red blood in Batavia; Joule's paddle wheel; the honeymoon at Chamonix (waterfall thermometer HEDGE/LEGEND); Feynman's blocks idea retold.
- `caloric` P1 — Boiling water with a blunt drill. sort 1798. terms: caloric, Rumford, thermal energy, internal energy. Beats: heat as a fluid; the Munich arsenal; "at two hours thirty minutes it actually boiled" (check wording).
- `latent-heat` P2 — The ice that would not warm up. sort 1761. terms: latent heat, Joseph Black, melting point, boiling point. Beats: Black's Glasgow lectures; the flat stretch; link to *The Invisible World* Ch 3.
- `matka` P1 — Why the matka works in May. sort 9999. terms: evaporative cooling, matka, wet-bulb, humidity. Beats: what evaporation carries away; the wet-bulb limit; May vs July in Mumbai; the steel tumbler and wet cloth.
- `monsoon` P1 — The wind that turns around. sort 1686. terms: monsoon, sea breeze, convection, convection current. Beats: Halley's 1686 giant-sea-breeze theory; Anna Mani's instruments; Gadgil and colleagues' 2021 challenge; the question still being argued.
- `engines` P2 — Waterfalls of heat. sort 1824. terms: Carnot, heat engine, steam engine, efficiency. Beats: Sadi Carnot's 600 copies; heat "falling" from hot to cold (historians' summary, not his words); why no engine is perfect.

## Sound and light (group: waves)
- `resonance` P1 — Pushing a swing. sort 1583. terms: resonance, natural frequency, pendulum, oscillation. Beats: Galileo's pendulum work (the cathedral lamp is a legend); pushing in time; bridges (link to tales).
- `tabla` P1 — How a tabla sings. sort 1920. terms: tabla, mridangam, harmonic, harmonics, overtone, overtones, pitch. Beats: Vincenzo Galilei's weights and strings (Pythagoras' hammers as legend); Raman and Sivakali Kumar, *Nature* 1920; the syahi.
- `doppler` P1 — Horn players on a train. sort 1842. terms: Doppler effect, Doppler, Buys Ballot. Beats: Doppler in Prague, 1842 (his star-colour example was wrong); Buys Ballot's horn players near Utrecht, 1845; the local-train horn.
- `seeing` P1 — Light comes in. sort 1011. terms: Ibn al-Haytham, camera obscura, pinhole camera, *Book of Optics*, extramission. Beats: Euclid and Ptolemy's eye-rays; Ibn al-Haytham in Cairo (feigned-madness story HEDGE); the dark room; 86% of students today.
- `speed-of-light` P1 — Ten minutes late. sort 1676. terms: speed of light, Rømer, Fizeau. Beats: Io's eclipses; Rømer's prediction for 9 November 1676; Huygens' arithmetic; Fizeau's cogwheel 1849; light from the Sun is about 8 minutes old.
- `refraction` P2 — The coin that rises. sort 1621. terms: refraction, refracted, refractive index, Snell's law, lens, lenses. Beats: Ibn Sahl and Snell (check), apparent depth, water-drop lens, the eye and glasses.
- `prism` P1 — Newton's dark room. sort 1672. terms: prism, dispersion, white light, experimentum crucis. Beats: the shutter hole; colours that stay colours; the 1672 letter and the quarrel it started.
- `blue-sky` P1 — Why the sky is blue and the sunset orange. sort 1871. terms: scattering, Rayleigh scattering, Rayleigh, sunset, polarised, polarized, polarisation, polarization. Beats: Tyndall and Rayleigh; why blue scatters more (computed ratio); Marine Drive sunsets; polarised sunglasses.
- `raman` P1 — The colour of the sea. sort 1921. terms: Raman effect, Narkunda, Krishnan, K. S. Krishnan, National Science Day. Beats: Rayleigh said the sea reflects the sky; Raman's Nicol prism at the rail; the letter posted at Bombay; Krishnan's diary, February 1928; Nobel 1930.
- `light-wave` P1 — The spot that shouldn't exist. sort 1818. terms: wave theory of light, interference, diffraction, Thomas Young, Fresnel, Arago, Poisson spot, Arago spot. Beats: Young's card, 24 November 1803; Poisson's "absurd" prediction; Arago looks; Maraldi had seen it before.

## Electricity and magnetism (group: fields)
- `static` P1 — Rubbing doesn't make charge. sort 1600. terms: static electricity, electric charge, conductor, conductors, insulator, insulators, electrostatic. Beats: Gilbert's *electricus*; Franklin's kite (HEDGE); why the balloon trick fails in the monsoon.
- `circuits` P1 — What goes round. sort 1827. terms: electric circuit, circuit, circuits, electric current, voltage, resistance, Ohm's law, Ohm, series circuit, parallel circuit, conventional current. Beats: Ohm's 1827 work and its cold reception (research at the gate); the rope-loop model; drift is slow, the signal is fast.
- `earth-magnet` P1 — The little Earth. sort 1600. terms: Gilbert, *De Magnete*, terrella, compass, magnetic field, Earth's magnetic field, magnetic north. Beats: Gilbert's sphere and dip needle; garlic and compasses (della Porta); what a compass really points to.
- `oersted` P1 — The needle that twitched. sort 1820. terms: Ørsted, Oersted, electromagnet, electromagnets, electromagnetism, Ampère. Beats: Copenhagen, 21 April 1820; four pages in Latin; Ampère's week of work.
- `induction` P1 — Magnets make electricity. sort 1831. terms: electromagnetic induction, induction, generator, generators, dynamo, transformer, electric motor, motor effect. Beats: Faraday's spinning wire, 1821; the iron ring, 29 August 1831; where Mumbai's electricity comes from.
- `maxwell` P1 — Light is electromagnetic. sort 1865. terms: Maxwell, Maxwell's equations, electromagnetic wave, electromagnetic waves, electromagnetic spectrum, Hertz, radio waves. Beats: the speed that matched Fizeau's; Hertz's sparks (the "no use" quote: "the story goes"); the ladder of light.
- `bose-waves` P1 — Invisible waves in Calcutta. sort 1895. terms: microwaves, millimetre waves, coherer, Presidency College. Beats: Bose's demonstration (details HEDGE); 5 mm waves; Royal Institution 1897; the patent his friends filed; Marconi.

## Atoms, stars and the universe (group: atoms)
- `photons` P1 — Light in packets. sort 1905. terms: photon, photons, photoelectric effect, boson, bosons. Beats: Einstein in Bern, 1905; Nobel for the photoelectric effect; S. N. Bose's "Respected Sir" letter from Dacca, 1924; the TV remote seen by a phone camera.
- `radiation` P1 — Radiation is not catching. sort 1896. terms: radiation, ionising radiation, ionizing radiation, radioactive, radioactivity, contamination, half-life. Beats: what radiation is (from radio to gamma); being near vs taking in; 63–75% of students' belief; links to *The Invisible World* Ch 1.
- `sun-fire` P1 — A fire that lasts four and a half billion years. sort 1938. terms: E = mc², nuclear fusion, fusion, nuclear fission, fission, Meitner. Beats: why burning can't explain the Sun; Meitner and Frisch at Kungälv; fusion; the Sun's mass loss (computed).
- `star-stuff` P1 — What the stars are made of. sort 1925. terms: stellar spectrum, stellar spectra, Saha equation, ionisation, ionization. Beats: Saha 1920; Payne 1925 and the word "spurious"; Russell 1929.
- `star-distances` P1 — A measuring tape to the stars. sort 1912. terms: parallax, parsec, parsecs, Cepheid, Cepheids, light-year, light-years. Beats: thumb-and-eyes parallax at home; Leavitt and the Small Magellanic Cloud; why it mattered.
- `star-death` P1 — The limit worked out at sea. sort 1930. terms: white dwarf, white dwarfs, Chandrasekhar limit, neutron star, neutron stars, black hole, black holes. Beats: 19 years old on the *Pilsna* out of Bombay; Eddington's mockery in 1935; Nobel 1983.
- `expanding` P1 — The stretching universe. sort 1929. terms: redshift, red shift, expanding universe, Big Bang, Hubble's law. Beats: Leavitt's tape used by Hubble; galaxies receding; space stretching, not an explosion into empty space; IGCSE's wording.

## Thinking tools (group: tools)
- `estimation` P1 — Guess like a physicist. terms: estimate, estimation, Fermi problem, order of magnitude. Steps: rice in a sack; rain on Mumbai.
- `powers-of-ten` P1 — Powers of ten. terms: powers of ten, scientific notation, standard form, logarithmic scale. Steps: 10³, 10⁻³, the zoom.
- `motion-graphs` P1 — Reading a motion graph. terms: distance–time graph, velocity–time graph, gradient, slope. Steps: walk it, plot it, read the slope.
- `vectors` P1 — Arrows that add. terms: vector, vectors, scalar, scalars, resultant, net force, resultant force. Steps: tug-of-war, the boat crossing a river.
- `si-units` P1 — Measuring anything. terms: SI, newton, newtons, joule, joules, watt, watts, kilowatt-hour, kilowatt-hours. Steps: why units; converting; the electricity bill.
- `proportion` P2 — Twice as far, four times as weak. terms: proportional, proportionality, square law. Steps: torch on a wall at 1 m and 2 m; gravity; sound.

## True stories that sound made up (group: tales)
500–900 words each; few or no terms (distinctive names only).
- `cavendish-shed` — Weighing the world through a hole in the wall. terms: Cavendish, Cavendish experiment.
- `fish-book` — The book that nearly sank the *Principia*. terms: Principia, *Principia*.
- `pisa` — The drop that probably never happened. terms: Leaning Tower, Pisa.
- `hammer-feather` — A hammer, a feather and the Moon. terms: Apollo 15.
- `fizeau-wheel` — A cogwheel across Paris. terms: cogwheel.
- `galileo-fingers` — Galileo's fingers. terms: (none).
- `faraday-cage` — The man in the foil box. terms: Faraday cage.
- `foucault` — Have you seen the Earth turn? terms: Foucault pendulum, Foucault, Panthéon.
- `eclipse-1919` — The eclipse that made Einstein famous, and the argument after. terms: 1919 eclipse, Eddington.
- `wobbly-bridge` — The bridge that walked. terms: Millennium Bridge.
- `tacoma` — Galloping Gertie and Tubby the dog. terms: Tacoma Narrows.
- `einstein-brain` — The brain in the jars. terms: (none).
- `kilogram` — The kilogram that changed. terms: Le Grand K, International Prototype Kilogram, Planck constant.
- `mpemba` — The schoolboy and the ice cream. terms: Mpemba effect, Mpemba.
- `tax-it` — The quote Faraday never said. terms: (none).
- `trams` — Chased out of Bombay by the trams. terms: Colaba Observatory, Alibag.

## The cast: life stories (group: people)
400–700 words, front matter includes name, born, died, role; initials medallion, no photographs. One-line roles and
sources are in research/history.md's cast table; dates are checked at the gate.
Aryabhata · Brahmagupta · Ibn al-Haytham · Bhaskara II · Simon Stevin · Tycho Brahe (terms belong to `kepler`; the card
links there) · Galileo Galilei · Johannes Kepler (card only) · Evangelista Torricelli (card only) · Isaac Newton ·
Edmond Halley · Émilie du Châtelet · Henry Cavendish (card only) · Count Rumford (card only) · Hans Christian Ørsted
(card only) · Augustin Fresnel (card only) · Michael Faraday · Julius Robert Mayer (card only) · James Clerk Maxwell
(card only) · Jagadish Chandra Bose · Henrietta Leavitt · Lise Meitner (card only) · C. V. Raman · Meghnad Saha ·
Satyendra Nath Bose · K. S. Krishnan (card only) · Cecilia Payne-Gaposchkin · Homi Bhabha · Subrahmanyan Chandrasekhar ·
Chien-Shiung Wu · Bibha Chowdhuri · Anna Mani · Vikram Sarabhai · Govind Swarup · Kalpana Chawla.

"Card only" means the person's name already belongs to a topic story as a term: the cast page shows their card and it
opens that topic story. Everyone else gets their own life story, with their own name as its term (ids: `p-<surname>`,
e.g. `p-galileo`, `p-jc-bose`, `p-raman`).
