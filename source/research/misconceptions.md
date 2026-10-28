<!-- Research report saved verbatim from the planning session of 2026-10-28 (story-textbook pipeline step 2). URLs were gathered by a research agent; treat UNVERIFIED/HEDGE marks as binding until a gate checks them. -->

# Misconception research brief: physics for Kym (age 12, Mumbai)

**Before you use these numbers:**
- **Where the numbers come from.** Every percentage below comes from a page I fetched or from a search-result summary. Where I could only see a secondary report, I say so. A missing number is marked UNVERIFIED.
- **IOP Spark** pages refused my fetches (HTTP 403). The Spark claims below come from search-result summaries of those pages.
- **NCERT.** I could not get readable text of the new *Curiosity* Class 7 chapters. The NCERT notes come from third-party chapter summaries on edzy.ai, so check them against the printed book.
- **Search budget.** The session's web-search budget ran out partway through. Several items (static electricity, E=mc², wave/particle, the "Haji Ali" tide range) have no prevalence data.
- **Your own physics.** Arithmetic I did myself is labelled "computed". Expected sizes for the home experiments are my own judgement unless a URL is given.

**Three findings from the research that should shape every chapter:**
1. **A demonstration alone rarely changes a mind.** Halloun & Hestenes interviewed students after showing them demonstrations. They found "students held firm to mistaken beliefs even when confronted with phenomena that contradicted those beliefs." Their conclusion was that a demonstration must sit "in a context that elicits and helps to resolve conflicts" ([Halloun & Hestenes 1985, PDF](https://davidhestenes.net/modeling/R&E/Hestenes_CommonSenseConcept.pdf)). Your sequence (wrong idea → Predict first → evidence → model) is the right one.
2. **Corrections fade.** In Winer et al., students taught that nothing leaves the eyes improved straight away. Three to five months later, most had gone back to their old belief ([Winer et al. 2002, PDF](https://Www.Gwern.net/doc/psychology/cognitive-bias/illusion-of-depth/extramission/2002-winer.pdf)). So bring each core misconception back in retrieval questions several chapters later, not only at the end of its own chapter.
3. **Wrong ideas are bundles, not theories.** Students mix ideas inconsistently. For example, 84% said a free particle moves in a straight line, but only 30% said its speed stays constant (n=478) ([Halloun & Hestenes 1985](https://davidhestenes.net/modeling/R&E/Hestenes_CommonSenseConcept.pdf)). Test each idea in two or three different settings.

---

## 1. Measurement, scale, units, estimation

**Misconceptions**
- "Everything too small to see is about the same size."
- "Ten times bigger, then ten times bigger again, is like adding the same step each time." (powers of ten treated as linear)
- "I can't guess how far the Moon is, so I won't."

**Prevalence**
- Tretter et al. (2006, JRST) found that pre-college students lump everything microscopic and nano-scale into one category and lack benchmark objects. They may also treat powers of ten as linear ([Purdue lesson citing Tretter 2006](https://www.physics.purdue.edu/psas/docs/How%20Small%20is%20Nano%20Lesson.pdf); [ISTAR entry](https://istardb.org/aerpublications/conceptions-of-scale-and-scaling-the-expert-novice-continuum/)). Percentages: UNVERIFIED.
- In a Belgian survey, 78% of students declined to give any number for the Moon's distance (n=2,589 students plus public questionnaires) ([Belgian astronomy survey, arXiv 1308.3963](https://arxiv.org/pdf/1308.3963)).

**Decisive evidence (my suggestion).**
- Count the grains of rice in one teaspoon. Use the number of teaspoons in a 1 kg packet to estimate the grains per packet. Then do the same for the grains in a 25 kg sack.
- Measure the thickness of 100 notebook pages to get one page.
- **Will it work?** Yes. Expect the teaspoon count to vary by about ±20% between tries. That spread is itself the lesson about estimation.

**Better model.** Size is best compared by factors of ten. Each step on the ladder (1 m, 10 m, 100 m…) is ten times the last, not ten more.

**NCERT.** *Curiosity* Class 7, Ch. 8 "Measurement of Time and Motion" covers the SI unit of time, speed, and uniform and non-uniform motion ([edzy summary](https://www.edzy.ai/okf/chapter/cbse-class-7-science-curiosity-measurement-of-time-and-motion.md)). Bridge sentence: NCERT gives you the units; this book teaches you to guess before you measure.

## 2. Motion: speed, velocity, acceleration

**Misconceptions**
- "At the top of a throw the ball stops, so its acceleration is zero."
- "If two things are at the same place at the same time, they have the same speed."
- "A steady push gives a steady speed."

**Prevalence**
- 44% of 100 students chose "acceleration is zero at the highest point" on a multiple-choice item. This is one Irish item, so treat it as indicative only ([Keenahan, DCU slides](https://www.dcu.ie/sites/default/files/smec/pdfs/CP3-DKeenahan.pdf)).
- Over 30% of 478 US university students said two particles at the same position have the same speed. Only 15% held that a constant force gives constant acceleration ([Halloun & Hestenes 1985](https://davidhestenes.net/modeling/R&E/Hestenes_CommonSenseConcept.pdf)).
- The "zero speed implies zero acceleration syndrome" is discussed in a *Resonance* (1997) article hosted by HBCSE ([HBCSE PDF](https://www3.hbcse.tifr.res.in/research-development/physics-ed/pitfalls-in-elementary-physics-velocity-acceleration-and-force.pdf)). The server would not resolve when I tried to fetch it, so this is from the search snippet only.

**Decisive evidence**
- Film a ball tossed up in front of bathroom tiles using the phone's slow-motion mode. Step through the frames and count tile rows moved per frame. The count drops by the same amount every frame, straight through the top. The speed is still changing at the top, so the acceleration is not zero there.
- **Will it work?** Yes, if the phone is on a stand and the toss is about 1 m. Motion blur is the main problem, so use bright light.

**Better model.** Acceleration is how fast velocity is changing. At the top, velocity is zero but it is still changing (from up to down) at about 9.8 m/s every second.

**NCERT.** The Class 7 chapter covers speed and uniform motion. In the summary I saw, it does not mention velocity or acceleration ([edzy](https://www.edzy.ai/okf/chapter/cbse-class-7-science-curiosity-measurement-of-time-and-motion.md)). Bridge sentence: "Your textbook talks about speed. Physicists also care about direction and about how fast speed changes."

## 3. Force and motion

**Misconceptions**
- "Things only keep moving if something keeps pushing them" (impetus: "a moving ball carries force inside it").
- "Under a constant push, things move at constant speed."
- "The truck hits the car harder than the car hits the truck."
- "A table can't push. It's just in the way."
- "Friction isn't really a force."

**Prevalence**
- **Impetus.** On the pretest, 65% of 478 US university students showed the belief that an impetus keeps motion going (44% after the course). 47% believed an object slows down with no net force. 65% held that "every motion has a cause." Classified overall: 65% impetus-type, 18% Aristotelian, 17% Newtonian ([Halloun & Hestenes 1985](https://davidhestenes.net/modeling/R&E/Hestenes_CommonSenseConcept.pdf)).
- **Constant force, constant speed.** 44% of US middle and high school students chose this on AAAS Project 2061 items. Each item was answered by at least 2,000 students, and over 90,000 students in 814 schools took part in the 2010 field tests ([AAAS news, 2011](https://www.aaas.org/news/us-students-and-science-aaas-testing-gives-new-insight-what-they-know-and-their-misconceptions)).
- **Third law.** On FCI item 4 (truck hits car), 73% of about 900 algebra-based University of Pittsburgh students chose "the larger object exerts the larger force" before instruction, and 39% still did after ([Maries & Singh, arXiv 1307.7177, Table 5](https://arxiv.org/pdf/1307.7177)).
- **Normal force.** In Minstrell's high-school study, only about half of students said the table pushes up on a book ([review, arXiv 1603.06024](https://arxiv.org/pdf/1603.06024)).
- **Friction.** The Harvard MOSART lists "friction not recognised as a force" for grades 9–12 ([MOSART misconceptions](https://waps.cfa.harvard.edu/mosart/misconceptions.php)).
- **India.** An HBCSE paper (Shome, 2013) found this sentence in a Class VI science textbook: "When force is applied to a stationary object it moves." The paper does not say whether that book is NCERT or a State Board text. The 21 participants interviewed (10 of them teachers) voiced several alternative conceptions while interpreting it. It cites earlier Indian work (Saxena 1996; Kumar 1997; Rampal 1998) finding these ideas "so robust that these cannot be eliminated by mere pointing out the mistakes" ([HBCSE PDF](https://dnte.hbcse.tifr.res.in/wp-content/uploads/2018/04/2013_SS_When_objects_fail_to_move_despite_force_VTATE.pdf)).

**Decisive evidence**
- **Third law.** Hook two hanging luggage scales together (common in Indian homes for airline bags). Kym and an adult pull: both read the same, whoever "pulls harder". Hook one scale to a door handle and pull the other: still equal.
  - **Will it work?** Yes, to about ±0.1 kg.
- **Table pushes.** Use Clement's bridging chain: hand pressing a spring → book on foam → book on a steel ruler bridging two stacks of books (you can see it sag) → book on a table. Bridging analogies are from Clement (1993, JRST 30(10):1241–57); the search summary reports 40 high-school participants ([bibliographic entry](https://informahealthcare.com/doi/abs/10.1080/0950069940160208)).
  - **Will it work?** A 30 cm steel ruler visibly sags under a few ₹5 coins.
- **Motion without force.** Slide an ice cube across a wet steel thali, then across a cloth. Less friction means it goes further. Extrapolate to zero friction.

**Better model.** A force changes motion; it is not needed to keep motion going. Forces always come in equal and opposite pairs between two objects. Solid surfaces push back by deforming very slightly.

**NCERT.** The HBCSE paper says the Class VI sentence above breaks NCF 2005's content-validity criterion. Bridge sentence: "A push makes a still object move only if it beats friction. Push a wall: it doesn't move, but you're still pushing."

## 4. Gravity, falling, projectiles, circular motion

**Misconceptions**
- "Heavier things fall faster."
- "There's no gravity in space. That's why astronauts float." / "Gravity needs air."
- "A ball shot out of a curved tube keeps curving."
- "When I let go of a whirling ball, it flies outward."
- "Centrifugal force flings you out."

**Prevalence**
- **No gravity in space.** 81% of 13-year-olds and 75% of 14-year-olds did not think there is gravity in space (Stead & Osborne 1980, via [IOP Spark](https://spark.iop.org/many-students-think-object-beyond-earths-atmosphere-space-does-not-experience-force-gravity)). Related: some students think gravity requires air ([IOP Spark](https://spark.iop.org/some-pupils-think-gravity-requires-presence-air-so-there-no-gravity-moon-or-space)).
- **Weight affects falling.** 82% of 478 US university students believed an object's intrinsic properties affect its free fall in a vacuum ([Halloun & Hestenes 1985](https://davidhestenes.net/modeling/R&E/Hestenes_CommonSenseConcept.pdf)). The "heavier is faster" belief appears from age 5 into adulthood ([Hast & Howe](https://research.stmarys.ac.uk/id/eprint/223/8/Hast-Howe-Understanding-the-Beliefs-Informing-Childrens-Commonsense-Theories.pdf)). Child percentage: UNVERIFIED.
- **Curved paths (McCloskey, Caramazza & Green 1980, n=47 US university students).** 33% drew a ball leaving a C-shaped tube still curving, 51% for a spiral tube, and 30% for a ball released from a string ([Christian Science Monitor report](https://www.csmonitor.com/1980/1217/121733.html)).
- **Dropped ball.** McCloskey et al. 1983 "straight-down" figure: UNVERIFIED.
- **Centrifugal force.** Listed as a common misconception ([IOP Spark](https://spark.iop.org/many-pupils-think-object-moving-circle-experiences-force-away-centre-circle-centrifugal-force)). New university students avoid the word but still draw an outward force ([Chalmers](https://research.chalmers.se/publication/553050/file/553050_Fulltext.pdf)).

**Decisive evidence**
- **Weightlessness.** In phyphox, "Acceleration (with g)" reads about 9.81 m/s² at rest ([phyphox built-in experiments](https://phyphox.org/wiki/index.php/Category:Built-in_experiments)). Drop the phone 40 cm onto a pillow and the reading falls to about zero during the fall. That is exactly an astronaut's situation: falling, not gravity-free.
  - **Will it work?** Yes. The fall lasts about 0.3 s (computed), so use the graph view.
  - Computed: at the ISS's roughly 400 km height, gravity is about 89% of surface gravity ((6371/6771)² ≈ 0.89).
- **Falling.** Drop a ₹1 and a ₹5 coin together onto a steel plate: one clink. Then drop a flat sheet of paper and a crumpled one: air resistance, not weight, separates them. phyphox's acoustic stopwatch can time a 1 m fall (computed ≈ 0.45 s).
- **Curved path.** Cut a gap in the rim of a paper plate and roll a marble around inside. It leaves in a straight line, on the tangent.
  - **Will it work?** Reliably, on a smooth floor.

**Better model.** Gravity pulls everything near Earth with the same acceleration; only air makes light, wide things slower. In orbit you are falling all the time. Without a force pulling inward, objects go straight.

**NCERT.** Class 9 (Gravitation) defines weight W = mg in newtons, per secondary study sites ([Shaalaa](https://www.shaalaa.com/question-bank-solutions/what-weight-1-kilogram-mass-earth-g-98-m-s2_29903)). Bridge sentence: at home we say "my weight is 40 kg"; physicists call that mass.

## 5. Mass, weight, density, floating, pressure

**Misconceptions**
- "Heavy things sink, light things float."
- "Suction pulls things."
- "Heating a liquid in a closed bottle makes it heavier."
- "Big things sink."

**Prevalence**
- About half of 120 Turkish 13–14-year-olds named weight or mass as the main factor in floating (Ünal & Coştu 2005). This is a secondary report seen in search results; I did not retrieve the original, so treat it as UNVERIFIED.
- 41% of US middle and high school students said heating a liquid in a closed container increases its mass ([AAAS](https://www.aaas.org/news/us-students-and-science-aaas-testing-gives-new-insight-what-they-know-and-their-misconceptions)).
- "Suction" prevalence: UNVERIFIED.

**Decisive evidence**
- **Floating.** A whole orange or mosambi floats; peel it and it sinks. The peel is full of air pockets. Then: an egg sinks in tap water and floats after you stir in enough salt.
  - **Will it work?** Yes. The orange is very reliable. The egg needs several tablespoons of salt per glass; add salt until it lifts (exact amount UNVERIFIED).
- **Air pressure.** Fill a glass to the brim, slide a postcard over it and turn it upside down over the sink. The card stays. Or trap water in a straw with a fingertip.
  - **Will it work?** Yes over a sink. A wet, stiff card works best.

**Better model.** Whether something floats depends on its density compared with the liquid, not its weight. "Suction" is really the air outside pushing harder than the air inside: about 10 tonnes on every square metre (approximate standard value; UNVERIFIED here).

**NCERT.** Study notes for Class 8 "Force and Pressure" say suction cups stick "due to absence of air inside", with atmospheric pressure acting on the cup ([EduRev notes](https://edurev.in/t/154915/Short-Answer-Question-Force-Pressure)). Bridge sentence: "The empty space doesn't pull. The air outside pushes."

## 6. Energy, power, food, the electricity bill

**Misconceptions**
- "Energy gets used up."
- "Energy is a fuel or stuff inside things."
- "Energy and power are the same thing."
- "Food isn't energy; energy is electricity and petrol."

**Prevalence**
- The MOSART list includes "Energy is an entity contained within substances and can be created and destroyed" (grades K–4). For grades 9–12 it lists energy treated as a stored ingredient or as a force, and "energy is not conserved" ([MOSART](https://waps.cfa.harvard.edu/mosart/misconceptions.php)).
- Watts (1983, *Physics Education* 18(5)) catalogued frameworks including energy as "used up" and as fuel. Harrer et al. (2013) re-analysed his transcripts ([DOAJ](https://doaj.org/article/6d5cf76275e9416d814521b04b2c822e)).
- AAAS energy tests (more than 20,000 students) found misconceptions concentrated at particular grades but published no per-item rates I could see ([AAAS](https://www.aaas.org/news/what-do-students-really-know-about-energy)).
- Only 62% knew that raising an object's temperature raises its thermal energy ([AAAS 2011](https://www.aaas.org/news/us-students-and-science-aaas-testing-gives-new-insight-what-they-know-and-their-misconceptions)).
- A percentage for "used up": UNVERIFIED.

**Decisive evidence**
- **Energy spreads out.** Drop a ball and record the bounces with phyphox's acoustic stopwatch ([phyphox](https://phyphox.org/wiki/index.php/Category:Built-in_experiments)). Each bounce is lower. Where did the energy go? Listen to the sound, and note the slight warming.
- **The bill.** Read the wattage label on the mixer-grinder and on an LED bulb. Computed: 1 unit = 1 kWh, which is a 10 W LED for 100 hours or a 500 W mixer for 2 hours.
  - Mumbai tariffs vary by supplier and slab (see the [MERC 2025 Tata Power press note](https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_TPC_English.pdf)). Use the family's own bill; I could not verify a per-unit rate.
- **Food.** Read the kcal on a biscuit packet's nutrition label and compare it with the bill's kWh. Computed: 1 kWh ≈ 860 kcal.

**Better model.** Energy is never used up. It moves from place to place and spreads out until it is no longer useful. Power is how fast it moves (watts = joules per second).

**NCERT.** Not checked for Class 7. Bridge sentence: "When the bill says 'units consumed', the energy wasn't destroyed. It became light and warmth in your flat."

## 7. Heat and temperature

**Misconceptions**
- "Heat and temperature are the same."
- "Metal is colder than wood in the same room."
- "My sweater makes heat."
- "Cold comes in through the door; cold is a thing."
- "Matka water is cold because clay is cold."

**Prevalence**
- The MOSART list includes:
  - heat and cold as substances (grades K–8);
  - coldness transferring between objects, and heat confused with temperature (grades 9–12);
  - only hot objects having thermal energy (grades 9–12)
  ([MOSART](https://waps.cfa.harvard.edu/mosart/misconceptions.php)).
- **Metal feels colder.** Erickson (1979, *Science Education* 63:221–30) and Erickson & Tiberghien (1985) document this ([IOP diagnostic sheet](https://spark.iop.org/sites/default/files/media/documents/BEST_PMA_1_3_Diagnostic_Warm%20feeling.doc)). Percentage: UNVERIFIED.
- **Heat = temperature.** Reported rates vary widely: 45% (Indonesia, grade 8, n=22) against 5% (Turkey) ([jurnal.usk.ac.id](https://jurnal.usk.ac.id/JIPI/article/download/42361/22283)). Treat both as UNVERIFIED for Kym's age.
- **Sweaters.** Students think blankets and mittens produce heat ([NSTA "Mitten problem"](https://www.nsta.org/lesson-plan/mitten-problem)).

**Decisive evidence**
- **Feel, then measure.** Kym first feels a steel thali and a plastic chopping board; the steel feels colder. Then put an ice cube on each. The cube on the "colder" metal melts much faster ([IOP Spark metal vs plastic](https://spark.iop.org/thermal-conductivity-metal-v-plastic); [UCSB demo](https://web.physics.ucsb.edu/~lecturedemonstrations/Composer/Pages/52.10.html)).
  - **Will it work?** The commercial demo uses aluminium, which melts its cube in under about 4 minutes ([PASCO manual](https://cdn.pasco.com/product_document/MELT_Manual_2024-01-03.pdf)). Stainless steel conducts less well, so use the thickest steel plate or an aluminium kadhai base. Plastic should still lose clearly.
- **Sweater.** Wrap one ice cube in a woollen sweater and leave another bare. The wrapped one lasts longer: the sweater slows heat flow, it doesn't make heat.
- **Matka.** Water seeps out and evaporates from the outer surface. Reported drops are 5–15 °C ([Springer](https://link.springer.com/article/10.1007/s43939-025-00516-z)) and up to 7 °C in a Kolkata measurement ([arXiv 1710.00667](https://export.arxiv.org/pdf/1710.00667)).
  - **Will it work?** Cooling stops at the wet-bulb temperature. One source says there is "almost none in humid Mumbai" ([studiomatrx](https://www.studiomatrx.org/students/climate-responsive-design/evaporative-cooling)), so expect it to work best in Mumbai's drier winter and pre-monsoon months. Turn this into a "Predict first": will the matka work better in May or in July?
  - Home version: wrap a wet cloth around a steel tumbler of water and stand it in front of a fan, next to a dry-wrapped tumbler.

**Better model.** Temperature is how hot something is. Heat is energy flowing from hotter to colder. Metal feels cold because it carries heat away from your hand fast, not because it is colder.

**NCERT.** *Curiosity* Class 7, Ch. 7 says heat moves from hotter to colder parts. It also says woollens "trap air, a poor conductor, to keep warmth close to the body"; it does not mention evaporative cooling or the matka ([edzy](https://www.edzy.ai/okf/chapter/cbse-class-7-science-curiosity-heat-transfer-in-nature.md)). This fits well. Add: "keep warmth" means slow its escape, not create it.

## 8. Waves and sound

**Misconceptions**
- "Sound can travel through empty space."
- "Waves carry water or air along with them."
- "High pitch means loud."
- "An echo is a new sound made by the wall."

**Prevalence**
- **Vacuum.** Only a few students believe sound crosses empty space. But most cannot explain why it can't (Caleon & Subramanian 2010, via [IOP Spark](https://spark.iop.org/many-students-believe-sound-can-travel-through-empty-space)).
- **Vibrations.** Fewer than 30% of 11–14-year-olds used vibrations to explain how sound travels (Whittaker 2012, same page).
- **Pitch vs loudness.** Confusion is common ([IOP Spark](https://spark.iop.org/many-students-confuse-effects-changing-amplitude-and-frequency-sound-wave-pitch-and-volume-sound)). In a 1994 study, most of 115 five-to-six-year-olds did not separate pitch from volume. Turkish 8th and 9th graders mostly treated intensity and pitch as the same ([APFSLT](https://eduhk.hk/apfslt/v14_issue1/ozkan/page4.htm)).

**Decisive evidence**
- **Waves don't carry the water.** Float a scrap of paper in a bucket and make ripples. The paper bobs but doesn't travel.
- **Sound needs something to travel through.** Tie a steel spoon to the middle of a string, press the string ends to your ears and tap the spoon: a loud bell sound through the string. Hold it away from your ears and it is faint.
- **Echo.** Clap facing a building about 50 m away. Computed: the echo returns after about 0.3 s, which phyphox's acoustic stopwatch can time.
- **Vacuum.** A home vacuum test will not work: a bag with the air sucked out is nowhere near empty. Use a bell-jar video. I fetched no URL for one.

**Better model.** Sound is a vibration passed from particle to particle. With no particles, there is no sound. Loudness is how big the vibration is; pitch is how fast it repeats.

**NCERT.** Not checked.

## 9. Light and seeing

**Misconceptions**
- "Something goes out of my eyes when I look."
- "I see the book; light doesn't need to come from it to me."
- "A red shirt is red, whatever the light."
- "White light is pure."
- "The sea is blue because it reflects the sky."

**Prevalence**
- **Something leaves the eyes (extramission).** When asked to draw arrows showing how a person sees a balloon, 86% of students showed outward arrows. Among adults asked directly, 69% did. Even for a lit bulb, 33% of adults said something leaves the eye. Refutation teaching faded within 3–5 months ([Winer et al. 2002](https://Www.Gwern.net/doc/psychology/cognitive-bias/illusion-of-depth/extramission/2002-winer.pdf)).
- MOSART lists "the eye emits light in order to see" for grades 5–8 ([MOSART](https://waps.cfa.harvard.edu/mosart/misconceptions.php)).
- **Light as a thing.** Guesne (1985) found that 10–15-year-olds identify light with its source or its effects, not as an entity travelling through space ([SERC](https://serc.carleton.edu/resources/19525.html)).
- **Mirrors.** Students think the image is on the mirror surface ([IOP Spark](https://spark.iop.org/some-students-believe-image-mirror-mirror-rather-behind-it)). One study of 174 Taiwanese 7th graders found it as a major misconception. Percentage: UNVERIFIED.
- **Colour.** "For most people, colour is an innate property of an object" ([IOP Spark](https://spark.iop.org/colour-objects); Martinez-Borreguero 2013).

**Decisive evidence**
- **Seeing needs light.** Go into a windowless bathroom at night with the light off: Kym sees nothing. If eyes sent out rays, she would.
- **Light travels to your eye.** Shine a torch through mist from a plant sprayer. You see the beam only where droplets send light into your eye.
- **Colour depends on the light.** Set the phone screen to full red in the dark and look at a green leaf or a banana. They look dark or odd.
- **Sky and sea.** A few drops of milk in a glass of water lit by a torch look bluish from the side and orange looking through toward the torch (amount of milk UNVERIFIED; adjust).
- **Raman's question.** On his 1921 voyage, C.V. Raman used a Nicol prism to remove the sky's reflection from the Mediterranean, and the blue stayed. He argued that molecular scattering in the water gives the colour. This led to the 1928 Raman effect ([Optica OPN](https://www.optica-opn.org/home/articles/volume_20/issue_3/features/c_v_raman_and_the_raman_effect/); [The Wire](https://science.thewire.in/society/history/cv-raman-colour-of-the-sea-ks-krishnan-raman-effect-experimental-physics-nobel-prize/)). His letter "The Colour of the Sea" was sent as the ship reached Bombay.
  - **Kym's version:** wear polarised sunglasses at Marine Drive and tilt her head. Glare changes but the sea's colour remains.
  - **Will it work?** Only with genuinely polarised lenses. Test first by looking at a phone screen through them.

**Better model.** We see an object only when light from a source bounces off it into our eyes. An object's colour is the part of the incoming light it reflects.

**NCERT.** *Curiosity* Class 7, Ch. 11 says "Light is emitted by luminous objects and reflects off non-luminous objects". It does not say outright that light must enter the eye ([edzy](https://www.edzy.ai/okf/chapter/cbse-class-7-science-curiosity-light-shadows-and-reflections.md)). Bridge sentence: "…and then that reflected light has to reach your eye."

## 10. Electricity

**Misconceptions**
- "The bulb uses up the current."
- "A battery always gives out the same current."
- "One wire is enough."
- "Electricity flows through hollow wires like water in a pipe."
- "Static is a different kind of electricity."

**Prevalence**
- MOSART lists:
  - "Electricity flows through hollow wires and is used up by lights or appliances" (grades K–8);
  - "appliances or lights can still work in incomplete circuits" (grades 5–8);
  - batteries seen as givers of electricity (grades 9–12)
  ([MOSART](https://waps.cfa.harvard.edu/mosart/misconceptions.php)).
- "It is clear to most pupils that something must get used up" ([IOP Spark "What gets used"](https://spark.iop.org/what-gets-used)). See also the consumer–source model ([IOP Spark](https://spark.iop.org/some-students-hold-consumer-source-model-simple-circuit)).
- The one-wire idea traces to Fredette & Lochhead (1980) ([EU-JER review](https://www.eu-jer.com/how-difficult-are-simple-electrical-circuit-conceptions-new-findings)).
- Shipstone (1985) found students do not separate current, voltage, energy and power ([STEM Learning resource](https://www.stem.org.uk/system/files/elibrary-resources/2023/04/BEST_PEM_8_2_Diagnostic_Power%20and%20current.docx)).
- Numeric prevalence for 12-year-olds: UNVERIFIED.

**Decisive evidence**
- **Circuits.** Use 2 AA cells, two identical LEDs, a resistor and crocodile clips.
  1. One wire only: nothing lights.
  2. Two LEDs in series are equally bright, and swapping their order changes nothing. So the current isn't used up by the first one.
  3. Add a third LED in series and all dim. So the battery is not a constant-current source.
  4. In parallel, each LED stays bright.
  - **Will it work?** A single 1.5 V AA usually won't light an LED (my judgement; UNVERIFIED here), so use two cells and a resistor of about 100 Ω (approximate; UNVERIFIED here).
  - **Safety:** never short a 9 V battery or AA cells with bare wire; it gets hot. NCERT itself warns never to experiment with mains, generator or inverter supply ([NCERT Class 8 PDF](https://ncert.nic.in/textbook/pdf/hesc111.pdf)).
- **Static.** A rubbed balloon bends a thin stream of tap water.
  - **Will it work?** Weakly in Mumbai's monsoon humidity; much better in dry winter air (my judgement).

**Better model.** A circuit is a loop. The battery pushes charge round the whole loop. The same current flows back to the battery; what gets "used" is energy, delivered in the bulb.

**NCERT.** *Curiosity* Class 7, Ch. 3 covers cells, batteries, simple circuits and circuit diagrams. The summary I saw does not mention current ([edzy](https://www.edzy.ai/okf/chapter/cbse-class-7-science-curiosity-electricity-circuits-and-their-components.md)). Bridge sentence: "NCERT shows you the loop; we'll ask what goes round it."

## 11. Magnetism

**Misconceptions**
- "Magnets attract all metals."
- "A bigger magnet is always stronger."
- "The north pole is positive charge."
- "The Earth's North Pole is a magnet's north pole."

**Prevalence**
- Many students expect all metals to be attracted and think size sets strength ([IOP Spark](https://spark.iop.org/many-students-expect-all-metals-be-attracted-magnets-and-think-size-magnet-dictates-its-strength)).
- Children aged 3–8 believe magnets attract all metals (Smolleck & Hershberger 2011). Bradamante & Viennot (2007, n=33, ages 9–11) found most knew non-metals aren't attracted ([IOP Spark key paper](https://spark.iop.org/key-research-paper-bradamante-and-viennot-2007)).
- Maloney (1985) found college students believed poles are charged, with north positive. The figure of 214 students comes from a secondary summary and is UNVERIFIED ([Maloney 1985 DOI](https://dx.doi.org/10.1088/0031-9120/20/6/009); [IOP Spark](https://spark.iop.org/some-students-conflate-magnetic-and-electrostatic-effects)).

**Decisive evidence**
- **Sorting game.** Fridge magnet against ₹1/₹2/₹5 coins (attracted, as you note), aluminium foil (not attracted), a brass key, and a steel spoon. Many stainless spoons are not attracted, which is a great surprise; whether any given spoon sticks is UNVERIFIED, so test it.
- **Magnet vs charge.** A rubbed balloon picks up paper bits; a magnet doesn't. The magnet picks up a coin; the balloon barely does.
- **Earth as a magnet.** Stroke a sewing needle with the magnet, lay it on a leaf floating in a bowl, and it turns north–south. phyphox's magnetometer shows Earth's field ([phyphox](https://phyphox.org/wiki/index.php/Category:Built-in_experiments)).
- **Electromagnetism.** Touch a wire across an AA cell above the phone's compass: the reading jumps. Brief touches only; the wire heats.

**Better model.** Only a few metals (iron, nickel, cobalt and some steels) are magnetic. Magnetic poles are not charges, and you can never get a lone north pole.

**NCERT.** Not checked.

## 12. Earth, Moon and space

**Misconceptions**
- "Summer is when Earth is closer to the Sun."
- "Moon phases are Earth's shadow."
- "The Sun goes round the Earth each day."
- "Tides are only the Moon pulling the water up."
- "Sun and Moon are about the same size and distance."

**Prevalence**
- **Seasons.**
  - In *A Private Universe*, 21 of 23 Harvard graduates and faculty gave wrong explanations of seasons or Moon phases. That count comes from secondary write-ups ([TIE online](https://www.tieonline.com/article/307/student-misconceptions-where-do-they-come-from-); [SIU Medicine](https://www.siumed.edu/academy/private-universe.html)).
  - In the Belgian survey (n=2,589 students), half blamed a shorter Earth–Sun distance for summer and only 30% rejected it ([arXiv 1308.3963](https://arxiv.org/pdf/1308.3963)).
  - Sadler analysed 2,567 Project STAR responses and found "most students" hold the distance idea ([Harvard GSE](https://www.gse.harvard.edu/ideas/news/99/04/research-finds-revolutionary-discoveries-cognitive-sciences-are-not-reflected-high)). IOP calls distance "by far the most common explanation" ([IOP Spark](https://spark.iop.org/most-pupils-think-it-cold-winter-because-sun-further-away-earth)).
- **Phases as Earth's shadow.**
  - 44% of UK children (Baxter 1988), the same rate in 1994 ([Cambridge PDF](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/3DEC59B5E70CB64896E9FF0B07A23270/S0252921100114964a.pdf/the-influences-of-the-national-curriculum-on-childrens-misconceptions-about-astronomy-and-the-use-of-these-misconceptions-in-the-development-of-interactive-teaching-materials.pdf)).
  - About 40% of Belgian students ([arXiv 1308.3963](https://arxiv.org/pdf/1308.3963)).
  - 41% of 1,414 US secondary students (Sadler 1992) and 19% of junior-high students (Trumper 2001), both via [TUSED review](https://tused.org/index.php/tused/article/download/101/59/125).
- **Earth's shape.** Vosniadou & Brewer (1992) studied 60 US children in grades 1, 3 and 5 and found five alternative Earth models ([IOP Spark](https://spark.iop.org/vosniadou-and-brewer-1992)). This is contested by later work ([UEA](https://ueaeprints.uea.ac.uk/id/eprint/48378/)).
- **Tides.** Two-thirds of Spanish high-school and university students named the Moon's attraction as the main cause but struggled to picture it on a global scale ([Corrochano 2017](https://produccioncientifica.usal.es/documentos/5e4fc3e629995245c6b2e9c0)).

**Decisive evidence**
- **Mumbai's own calendar.** Earth is closest to the Sun in early January, about 147 million km away, and farthest in early July ([EarthSky](https://earthsky.org/tonight/earth-comes-closest-to-sun-every-year-in-early-january/); [Almanac](https://cdn.almanac.com/comment/132438)). Mumbai's January is its coolest month. Australia has summer in December.
- **Why tilt matters.** A torch shone straight down on paper makes a small bright patch; slanted, the patch spreads and dims. Computed: Mumbai's noon Sun is about 86° high in June and about 48° high in December.
- **Phases.** Hold an orange at arm's length in a dark room with a single torch or lamp, then turn slowly. The phases appear with no Earth shadow involved. The lit side always faces the lamp.
- **Tides.** The Haji Ali causeway is open at low tide and submerged at high tide ([Wikipedia](https://en.wikipedia.org/wiki/Haji__Ali_Dargah)). Kym can log tide times and the Moon's phase for a month. Mumbai's tide range in metres: UNVERIFIED.

**Better model.**
- Seasons come from the tilted axis, which changes how high the Sun climbs and how long the days are.
- Phases are how much of the Moon's sunlit half we see.
- Tides are two bulges raised by the difference in the Moon's (and Sun's) pull across Earth.

**NCERT.** *Curiosity* Class 7, Ch. 12 gives tilt as the cause of seasons and says the Sun and Moon have similar apparent sizes. In the summary I saw, it covers eclipses but not phases or tides ([edzy](https://www.edzy.ai/okf/chapter/cbse-class-7-science-curiosity-earth-moon-and-the-sun.md)). That's good. Add the bridge "apparent ≠ actual size", and keep phases clearly separate from eclipses.

## 13. Modern physics ideas

**Misconceptions**
- "Atoms are tiny solid balls; there's air or stuff between particles."
- "Scientists have photographed atoms like a picture."
- "All radiation is dangerous, and anything near radiation becomes radioactive."
- "Light is either a wave or a particle."
- "E=mc² is only about bombs."

**Prevalence**
- **Particles.** Novick & Nussbaum (1978) studied Israeli 13–14-year-olds: many drew the air in a part-emptied flask in a heap at the bottom or round the sides. About 60% consistently used particle ideas (secondary report; [RSC](https://edu.rsc.org/resources/students-ideas-about-the-particulate-nature-of-matter-beyond-appearances/4017763.article)).
- **India.** Malhotra (HBCSE epiSTEME-8, 2020) reports that Indian students assume scientists have "seen" atoms and cling to watermelon-seed and solar-system pictures. Atoms are introduced in CBSE Class 9 ([HBCSE proceedings PDF](https://episteme8.hbcse.tifr.res.in/proceedings/INDIAN%20STUDENTS%E2%80%99%20UNDERSTANDING%20OF%20PARTICULATE%20NATURE%20OF%20MATTER.pdf)).
- **Atoms in living things.** 27% of US middle-schoolers said cells are not made of atoms ([AAAS](https://www.aaas.org/news/us-students-and-science-aaas-testing-gives-new-insight-what-they-know-and-their-misconceptions)).
- **Radiation.**
  - 65% of one cohort said radiation makes other objects radioactive ([AAPT poster, Johnson 2014](https://www.aapt.org/docdirectory/meetingpresentations/SM14/PST2C37%20A%20Johnson%20Journeys_poster.pdf)).
  - 63% of predictions in a CERN class showed this idea ([CERN S'Cool LAB](https://scoollab.web.cern.ch/sites/default/files/documents/160126_JW_poster_dinat.pdf)).
  - About 75% in another study thought objects in an X-ray room become radioactive ([arXiv 2001.07746](https://arxiv.org/pdf/2001.07746)).
- **Wave/particle and E=mc²:** prevalence UNVERIFIED.

**Decisive evidence**
- **Invisible light.** Point a TV remote at the phone's camera: you can see the infrared flash on screen. That is radiation that is harmless and everywhere.
- **Empty space between particles.** Dissolve a spoon of sugar in a brim-full glass of water: it barely overflows. The sugar fits into gaps between the water particles. (Atom-to-nucleus size ratio of about 100,000: standard value, UNVERIFIED here.)

**Better model.** Atoms are almost entirely empty space around a tiny nucleus. "Radiation" means energy travelling outward, from light to X-rays. Being near radiation does not make you radioactive; only taking in radioactive material does.

---

## Teaching methods with effect sizes

1. **Interactive engagement** (Hake 1998). 62 courses, N=6,542.
   - 14 traditional courses (N=2,084): average normalized gain 0.23 ± 0.04.
   - 48 interactive-engagement courses (N=4,458): 0.48 ± 0.14, "almost two standard deviations" higher.
   - Source: [Hake 1998 PDF](https://www.montana.edu/msse/Old_Data_analysis/Hake_1998_Normalized_gain.pdf).
2. **Peer Instruction with ConcepTests** (Crouch & Mazur 2001).
   - FCI normalized gain was 0.25 with traditional lecturing, then 0.49 in the first Peer Instruction year, rising over later years to 0.74.
   - Discussion helps most when 35–70% answer correctly at first.
   - Students switched from right to wrong only 6% of the time.
   - Sources: [paper PDF](https://ctne.fct.unl.pt/pluginfile.php/256/mod_data/content/4180/peer_instruction.pdf); [Mazur page](https://mazur.harvard.edu/publications/peer-instruction-ten-years-experience-and-results).
   - **For a one-reader book:** aim each "Predict first" so that about half of 12-year-olds would get it wrong.
3. **Active learning in general** (Freeman et al. 2014, *PNAS*). 225 studies; effect size 0.47 SD on exams; failure rate about 34% → 22%. Source: [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4060683).
4. **Predict–Observe–Explain** (White & Gunstone 1992). Students who don't predict "may not observe carefully". Source: [NZCER ARB](https://arbs.nzcer.org.nz/node/7187). Effect size: UNVERIFIED.
5. **Bridging analogies and anchors** (Clement 1993, JRST 30(10)). Hand on spring → book on foam → book on table. Effect size: UNVERIFIED.
6. **Elicit, then confront, then resolve.** This is supported by the Indian evidence: cognitive conflict after eliciting ideas (Saxena 1996, cited in the [HBCSE paper](https://dnte.hbcse.tifr.res.in/wp-content/uploads/2018/04/2013_SS_When_objects_fail_to_move_despite_force_VTATE.pdf)). Add spaced retrieval, because of Winer's 3–5-month relapse.

---

## The 15 most persistent misconceptions to build chapters around (ranked)

| # | Misconception (Kym's voice) | Prevalence | Source |
|---|---|---|---|
| 1 | "Things keep moving because they carry a force inside" | 65% of 478 US university students before teaching; 44% after | [Halloun & Hestenes](https://davidhestenes.net/modeling/R&E/Hestenes_CommonSenseConcept.pdf) |
| 2 | "Something comes out of my eyes when I see" | 86% drew outward arrows; 33% of adults even for a lit bulb | [Winer 2002](https://Www.Gwern.net/doc/psychology/cognitive-bias/illusion-of-depth/extramission/2002-winer.pdf) |
| 3 | "No gravity in space" | 81% of 13-year-olds, 75% of 14-year-olds | [IOP Spark](https://spark.iop.org/many-students-think-object-beyond-earths-atmosphere-space-does-not-experience-force-gravity) |
| 4 | "Bigger truck pushes harder" | 73% of about 900 US students before teaching; 39% after | [arXiv 1307.7177](https://arxiv.org/pdf/1307.7177) |
| 5 | "Heavier falls faster" | 82% of 478 US university students (properties affect fall in vacuum) | [Halloun & Hestenes](https://davidhestenes.net/modeling/R&E/Hestenes_CommonSenseConcept.pdf) |
| 6 | "Constant push gives constant speed" | 66% (n=478); 44% of US middle/high schoolers | [H&H](https://davidhestenes.net/modeling/R&E/Hestenes_CommonSenseConcept.pdf); [AAAS](https://www.aaas.org/news/us-students-and-science-aaas-testing-gives-new-insight-what-they-know-and-their-misconceptions) |
| 7 | "Summer = closer to the Sun" | About 50% of 2,589 Belgian students; 21 of 23 in *A Private Universe* | [arXiv 1308.3963](https://arxiv.org/pdf/1308.3963); [TIE](https://www.tieonline.com/article/307/student-misconceptions-where-do-they-come-from-) |
| 8 | "Moon phases = Earth's shadow" | 41% of 1,414 US secondary; 44% of UK children | [TUSED](https://tused.org/index.php/tused/article/download/101/59/125); [Cambridge](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/3DEC59B5E70CB64896E9FF0B07A23270/S0252921100114964a.pdf/the-influences-of-the-national-curriculum-on-childrens-misconceptions-about-astronomy-and-the-use-of-these-misconceptions-in-the-development-of-interactive-teaching-materials.pdf) |
| 9 | "Tables can't push" | About half of high-schoolers (Minstrell) | [arXiv 1603.06024](https://arxiv.org/pdf/1603.06024) |
| 10 | "No force means it slows down" | 47% (n=478) | [H&H](https://davidhestenes.net/modeling/R&E/Hestenes_CommonSenseConcept.pdf) |
| 11 | "Bulbs use up current" | "most pupils" (no percentage) | [IOP Spark](https://spark.iop.org/what-gets-used); [MOSART](https://waps.cfa.harvard.edu/mosart/misconceptions.php) |
| 12 | "Radiation makes things radioactive" | 63–75% across studies | [AAPT](https://www.aapt.org/docdirectory/meetingpresentations/SM14/PST2C37%20A%20Johnson%20Journeys_poster.pdf); [arXiv 2001.07746](https://arxiv.org/pdf/2001.07746) |
| 13 | "Curved motion continues after release" | 33–51% (n=47) | [CS Monitor](https://www.csmonitor.com/1980/1217/121733.html) |
| 14 | "Zero speed = zero acceleration" | 44% (n=100) | [DCU](https://www.dcu.ie/sites/default/files/smec/pdfs/CP3-DKeenahan.pdf) |
| 15 | "Heat and cold are substances; metal is colder" | Listed for grades K–12; percentage UNVERIFIED | [MOSART](https://waps.cfa.harvard.edu/mosart/misconceptions.php); [IOP](https://spark.iop.org/thermal-conductivity-metal-v-plastic) |

**Honourable mentions** (strong but without good numbers): all metals are magnetic; sound in a vacuum; pitch vs loudness; energy "used up"; "suction pulls".

**Gaps worth filling if you re-run searches:**
- AAAS item statistics at assessment.aaas.org (the site refused connections).
- Shipstone's 1988 European circuit data.
- Osborne's current-model percentages.
- Viiri (2000) on tides.
- Lewis & Linn on heat.
- Mumbai's tide range from INCOIS.
- The actual NCERT *Curiosity* PDFs.
