---
id: estimation
title: Guess like a physicist
year: thinking tool
sort: 9999
people: Enrico Fermi
group: tools
terms: estimate, estimation, Fermi problem, order of magnitude
blurb: How to get a number you can defend for something nobody has counted, from the grains in a rice sack to the rain on a whole city.
---

:::scene A kitchen in Mumbai, a July afternoon

The rain has not stopped since breakfast, and the news says 100 mm has fallen on the city since morning. How much water is that, over the whole of Mumbai? Nobody has measured it. Nobody could. And yet in two minutes, with nothing but a pencil, you can have a number you could defend to a room full of engineers.

Physicists do this so often that it has a name. A rough, reasoned answer to a question nobody can measure directly is a ==Fermi problem==, after Enrico Fermi, who was famous for working out surprising numbers on the back of an envelope. The skill is called ==estimation==, and it is a chain, not a guess.

#### Step 1: break it into pieces you can defend

You do not know the rain on Mumbai. You do know, from a map, that the city is a long strip about 40 km long and about 15 km wide. You know the rain lay 100 mm deep, which is 0.1 m. Each of those is a number you could argue for. An ==estimate== is built from pieces like these, and choosing them is most of the skill.

#### Step 2: find the relationship

Volume is area times depth. Mass is volume times the mass of a cubic metre of water, which is 1,000 kg.

:::work
**Rain on Mumbai**
Area: 40 km × 15 km = 600 km² = 6 × 10⁸ m².
Volume: 6 × 10⁸ m² × 0.1 m = 6 × 10⁷ m³.
Mass: 6 × 10⁷ m³ × 1,000 kg/m³ = 6 × 10¹⁰ kg, about 60 million tonnes.
:::

:::fig c0_rain() | The city as one flat slab, 40 km by 15 km, with 0.1 m of rain on it. The arithmetic turns the slab into a volume and then a mass. The rain layer is drawn thousands of times too thick.

#### Step 3: check the units

Kilometres had to become metres before they met the depth in metres. Then m² × m gave m³, a volume, and m³ × kg/m³ gave kg, a mass. If the units had come out as m² or kg/m, something was wrong. Units that disagree always mean a mistake. Units that agree do not prove you right, but they catch most of the slips.

#### Step 4: find the weakest link

An estimate is only as good as its shakiest input. The city's area is good to perhaps 20%. The rain is far shakier: 100 mm was one gauge's reading, and rain over a city is patchy. If the true average was 50 mm, the answer halves. So the depth is the number worth improving, and you can improve it yourself with a straight-sided jar on the balcony.

The same lesson, the other way round: estimate the mass of all the oceans using an average depth of 1 km, and the answer comes out about 3.7 times too small, because the real average depth is nearer 3.7 km. Everything else in that chain was fine. One weak input swallowed the whole answer.

#### Step 5: write only the digits you have earned

Fermi's own favourite example was: how many piano tuners work in Chicago? About 3 million people, perhaps 5 to a home, perhaps one home in ten with a piano: about 60,000 pianos. A tuner might manage about 750 a year, so the city needs about 80 tuners. Fermi called that "about a hundred", and about a hundred is right.

Notice the wording. Never "60,300,000 tonnes" or "exactly 80 tuners". Inputs that are good to 20% cannot give an answer good to the nearest tonne. One significant figure, sometimes two, is all an estimate has earned. Often what matters is only the power of ten, the ==order of magnitude==: is it thousands of tonnes, millions, or billions? For a question like that, an answer within a factor of ten either way counts as close enough.

:::careful
> "An answer with more digits is a better answer."

The opposite. The weakest input sets how many digits the answer can have, and writing more pretends to a precision you do not possess. "About 60 million tonnes" is honest. "60,300,000 tonnes" claims a precision the inputs cannot support.
:::

:::home How many breaths have you taken?
Count your breaths for one minute while sitting still. Say you get 15. Then build the chain: 15 a minute × 60 minutes × 24 hours ≈ 22,000 a day; × 365 ≈ 8 million a year; × 12 years ≈ 100 million, or 10⁸, breaths so far. Now find the weakest link: is 15 right when you are asleep, or running? Measure it once more after climbing the stairs, and see how much the final answer moves.
:::

In Chapter 0 this habit gets a section of its own, and the rain on Mumbai gets a figure. From then on it runs underneath every chapter: before any experiment, ask what you expect, roughly. If the measurement comes out a thousand times off your estimate, one of them is wrong, and you will want to know which.
