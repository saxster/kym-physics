---
id: circuits
title: What goes round
year: 1827
sort: 1827
people: Georg Simon Ohm
group: fields
terms: electric circuit, circuit, circuits, electric current, voltage, resistance, Ohm's law, Ohm, series circuit, parallel circuit, conventional current
blurb: A schoolteacher from Cologne measured how much current a given push drives through a wire, was ignored for fourteen years, and left us the rule that every loop of wire in your flat obeys.
---

:::scene Berlin, 1827

In 1827 a mathematics teacher on leave from a school in Cologne published a book in Berlin with a forbidding title: *Die galvanische Kette, mathematisch bearbeitet*, "The galvanic circuit, treated mathematically". His name was Georg Simon Ohm. Since hearing of Ørsted's discovery in 1820 he had been experimenting in his school's well-equipped physics laboratory, and in 1826 he had published two papers that treated the flow of electricity through a wire the way Fourier had treated the flow of heat through a bar. The book put it all together. Inside it is the rule now written into every physics syllabus: the current through a conductor is proportional to the voltage across it.

The book was received, in one historian's words, with little enthusiasm. The older German physicists were not convinced that a mathematical approach was the right one, and Ohm's writing did not help: he never quite said which form of his law was the fundamental one. He had hoped the book would win him a university post. Instead he resigned from the Cologne school in March 1828 and took temporary teaching work in Berlin. The post he accepted in Nuremberg in 1833 carried the title of professor, but it was not a university chair.

Recognition came from abroad, and slowly. In 1841, fourteen years after the book, the Royal Society in London gave him its Copley Medal. In 1852, two years before he died, the University of Munich made him its professor of physics. The unit of resistance carries his name.

To see what his rule says, and why it matters, you need the whole loop first.

#### Step 1: a loop, not a pipe

A battery has two terminals. Join them with a continuous path of conductor, a wire, a bulb, a wire back, and charge flows round the whole path. Break the path anywhere and it stops. That is all an electric circuit is: a complete, closed loop. One wire from the battery to the bulb is never enough, and the reason is not that the bulb needs a "return pipe" for used-up electricity. The reason is that the battery's chemistry only runs when the loop is complete; the reaction inside it will not take place without one.

Textbooks like to compare a circuit with water in a pipe, and the comparison helps up to a point. Here is where it stops. The wire is solid metal that is already full of electrons free to move. Nothing pours into it from the battery. Cut a wire and nothing spills out.

#### Step 2: the rope

Picture instead a long loop of rope passing through the hands of a circle of people. One of them is the battery: she hauls the rope steadily along. Another is the bulb: he grips it, the rope rubs through his fingers, and his hands get warm. Everyone else lets the rope slide. Notice three things. The rope moves everywhere at once: the moment the battery pulls, the far side of the loop moves too. No rope is used up: exactly as much comes back into her hands as leaves them. And the warmth appears only where the rope is gripped. (The rope is this book's own picture, not a measurement. Like every model it stops somewhere, and it stops at telling you what the rope is made of.)

:::fig s_rope_loop() | A loop of rope as a circuit. The battery hauls, the bulb grips, and the rope moves at the same rate at every point of the loop: no rope is used up. Energy leaves the loop only where the rope is squeezed.

Measure the current in a real loop and that is what you find: the same current at every point, including inside the battery. The current neither speeds up in the wires nor slows down in the bulb; if it did, charge would pile up somewhere, and it does not. What the bulb takes is energy, delivered where the charge is squeezed through. Energy is what gets used up. Current is what goes round.

#### Step 3: push and resistance

The battery's job is to push. Its voltage is the push per coulomb of charge: a 1.5 V cell gives each coulomb 1.5 joules of energy to spend on the way round. Resistance is how much a component opposes the flow: a long thin wire opposes more than a short thick one. Ohm found that, for a given conductor at an ordinary temperature, doubling the push doubles the current. Written out:

:::eq
**V = I × R**   (voltage = current × resistance)
:::

:::work
**A car headlamp carries 2.50 A when 12.0 V is across it. What is its resistance?**
R = V ÷ I = 12.0 ÷ 2.50 = 4.8 Ω.
Halve the voltage to 6.0 V and, if the resistance stays at 4.8 Ω, the current halves to 1.25 A.
:::

:::fig s_ohm_line() | Ohm's rule for the 4.8 Ω headlamp: double the voltage, double the current. The points are the two values in the worked example; the straight line through the origin is what "proportional" looks like.

It is an empirical rule, found by measuring, and it holds for most materials at common temperatures. It fails for some. A lamp filament's resistance rises as it heats, so the line bends. An LED hardly passes any current until the push reaches about 2 volts, and then passes a great deal. A battery sets the push, roughly, not the current; the current depends on what you connect.

#### Step 4: slow drift, fast signal

Flick a switch and the light comes on at once, so the electrons must race round the loop. They do not. In a copper wire half a millimetre thick carrying 15 mA to an LED, the electrons drift along at about 6 millionths of a metre per second: two days to crawl one metre. (Each electron also jiggles about at high speed in random directions, but the jiggling averages to nothing.) What travels fast is the push itself, a change in the electric field that runs along the already-full wire at roughly 10⁸ m/s, a million million times faster than the drift. Every electron in the loop starts moving almost at once, but each one only creeps. The rope moves everywhere at once; no single fibre travels far.

#### Step 5: one after another, or side by side

Put two bulbs in one loop, one after the other, and you have a series circuit: the same current passes through both, their resistances add, the current falls, and both glow dimmer, the first no brighter than the second. Join them side by side instead, each with both its ends on the battery, and you have a parallel circuit: each gets the full push, and the currents through them add. Your flat is wired in parallel. Every light and fan sits on its own branch, so when one bulb's filament breaks, only that branch opens and the rest stay lit.

One last convention. Circuit diagrams draw the current flowing from the battery's + terminal round to its −. That direction, conventional current, was agreed before anyone knew about electrons. In a metal wire the electrons move the other way. Both arrows are correct, as long as you say which one you mean.

:::careful
> "The bulb uses up the current, so less comes back to the battery."

The same current flows out of the bulb as into it, and the same current flows through the battery. Nothing is lost on the way round. What the bulb uses is energy: the battery gives each coulomb a push, and the bulb turns that energy into light and heat.
:::

:::careful
> "A battery always gives the same current."

A battery gives roughly the same push. The current depends on what you connect: more bulbs in series, less current; more in parallel, more. A tired battery pushes less, and sags more under a heavy load.
:::

:::home A current you can count
Fill a drinking straw with dried chana or peas until it is full. Push one more in at one end: one falls out of the other end at once, though no single pea has travelled the length of the straw. Push peas in steadily for thirty seconds, count how many fall out, and divide by thirty. That is your pea current, in peas per second. Electrons in a wire behave a little like this, with one difference the straw cannot show: they push each other along by electric repulsion, not by bumping.
:::

In Chapter 12 you will build this loop yourself, with two AA cells, an LED and a resistor, and find out why a white LED can stay dark on three volts while a red one shines.
