---
id: vectors
title: Arrows that add
year: thinking tool
sort: 9999
people:
group: tools
terms: vector, vectors, scalar, scalars, resultant, net force, resultant force, components
blurb: Some quantities are just amounts; others point somewhere. Once you draw the pointing ones as arrows, you can split one arrow into two right-angle shadows or join two arrows at any angle.
---

:::scene A school ground in Mumbai, sports day

Seven children, one rope, and the rope is not moving. Four pull one way and three the other, all of them straining, heels dug in. A lot is happening to that rope. And yet, as far as its motion is concerned, the total of all that pulling is exactly nothing. To see why, you need one idea: some quantities point.

#### Step 1: amounts and arrows

Your mass is 40 kg; the room is 30 °C; the market is 5 km away. Each is just an amount; none of them points anywhere. Quantities like these are ==scalars==.

Now suppose you cycle 3 km west and then 2 km east. The distance you covered is 5 km, a scalar. But where you ended up is 1 km west of where you started, and "west" is part of the answer. A quantity with an amount *and* a direction is a ==vector==. Your change of position is a vector. So is your velocity, which is your speed together with the direction you are going. So is every push and pull.

#### Step 2: draw them

A vector is drawn as an arrow. Its length shows the amount, to some scale, and it points the way the quantity points. A 100 N pull to the left is an arrow 5 cm long pointing left, say; a 50 N pull to the right is an arrow 2.5 cm long pointing right. Forces are drawn from the point where they act.

#### Step 3: adding along a line

Back to the rope. Suppose the four on the left pull with 120, 100, 90 and 80 newtons, and the three on the right with 150, 130 and 110. Arrows along one line are easy to add: total the ones pointing one way, total the ones pointing the other, and subtract.

:::work
**The tug of war**
Left: 120 + 100 + 90 + 80 = 390 N.
Right: 150 + 130 + 110 = 390 N.
Net force on the rope: 390 − 390 = 0 N.
:::

The leftover, after all the cancelling, is the ==net force== on the rope. At school it is called the ==resultant force==, or the unbalanced force; the three names mean the same thing. Here it is zero, so the rope's motion does not change. The children are not doing nothing: the rope is stretched tight and every arm aches. But nothing about its *motion* changes until the two totals differ. If one child on the left let go, the net force would be 80 N to the right, and the rope would start to move that way.

#### Step 4: splitting one arrow into two right-angle shadows

Before adding arrows that meet at awkward angles, try the reverse trick: take *one* arrow and split it into two perpendicular pieces that are easy to work with.

Shine a torch straight down from above onto a tilted stick of length *R* held at an angle *θ* to the floor. Its shadow on the floor has length *R*_x = *R* cos *θ*. Shine a second torch horizontally from the side against a vertical wall: the shadow on the wall has height *R*_y = *R* sin *θ*. Those two perpendicular shadows are the ==components== of the vector **R**. Walking along *R*_x first and then straight up by *R*_y takes you from the tail of **R** to its tip—so the two components together do the exact same job as the single tilted arrow. Because the floor shadow and wall shadow meet at a right angle, Pythagoras rebuilds the original length from the two pieces:

:::eq
**resolving a vector into perpendicular components**: *R*_x = *R* cos *θ*,   *R*_y = *R* sin *θ*,   and   *R* = √(*R*_x² + *R*_y²)
:::

Whenever a problem has a natural track—a horizontal floor, or a tilted hillside—you may choose your axes to match that track. On a ramp tilted at angle *θ*, gravity still pulls straight down with weight *mg*, but the block is only free to slide *along* the slope. Tilt your axes so one lies along the ramp and the other points perpendicular to the boards: the weight arrow *mg* splits into *mg* sin *θ* pulling downhill along the slope and *mg* cos *θ* pressing into the boards.

#### Step 5: adding at a right angle—and at any angle

Now reverse the trick to add two arrows. First, a right angle: a boat is rowed straight across a river at 3 m/s, while the current carries everything downstream at 4 m/s. How fast is the boat really moving, and which way?

The rule is *head to tail*: draw the first arrow, then start the second where the first one ends. The answer, the ==resultant==, is the arrow from the very start to the very end.

:::work
**The boat**
Across: 3 m/s. Downstream, from the tip of that arrow: 4 m/s.
The two make a right angle, so the resultant is the long side of a 3–4–5 triangle: 5 m/s, pointing about 37° from the bank.
If the river is 60 m wide, crossing takes 60 ÷ 3 = 20 s, and in those 20 s the current carries the boat 4 × 20 = 80 m downstream.
:::

What if two forces **P** and **Q** pull from the same point at *any* angle *θ*—not just 90°? Draw them tail to tail and complete the parallelogram, or slide **P** so its tail sits at the tip of **Q**. Now resolve **P** into two shadows relative to **Q**: a piece *P* cos *θ* that continues along the line of **Q**, and a piece *P* sin *θ* perpendicular to **Q**. You have turned an awkward oblique triangle into a right-angled triangle with base *Q* + *P* cos *θ* and height *P* sin *θ*. Apply Pythagoras once:

*R*² = (*Q* + *P* cos *θ*)² + (*P* sin *θ*)² = *Q*² + 2*PQ* cos *θ* + *P*²(cos² *θ* + sin² *θ*)

Since cos² *θ* + sin² *θ* = 1 for any angle, the bracket collapses to 1, giving the **parallelogram law of vector addition**:

:::eq
**parallelogram law of vector addition**: *R* = √(*P*² + *Q*² + 2*PQ* cos *θ*)
:::

Notice the extra term 2*PQ* cos *θ*: it is the "alignment bonus". Check the three landmark angles and watch how one formula holds every case:
- **Same direction (*θ* = 0°):** cos 0° = 1, so *R* = √(*P*² + *Q*² + 2*PQ*) = *P* + *Q*. Two 5 N pulls in line make 10 N.
- **Right angles (*θ* = 90°):** cos 90° = 0, so the alignment term vanishes and *R* = √(*P*² + *Q*²), ordinary Pythagoras. Two 5 N pulls at 90° make √50 ≈ 7.1 N.
- **Opposite directions (*θ* = 180°):** cos 180° = −1, so *R* = √(*P*² + *Q*² − 2*PQ*) = |*P* − *Q*|. Two 5 N pulls in opposite directions cancel to 0 N.

:::fig s_vectors() | Three ways to work with vector arrows. Left, resolving one vector R into perpendicular horizontal (R cos θ) and vertical (R sin θ) components. Middle, two perpendicular velocities (3 m/s across, 4 m/s downstream) adding head to tail to a 5 m/s resultant. Right, the parallelogram law for any angle θ: splitting P into P cos θ (extending Q) and P sin θ (perpendicular to Q) turns the diagonal R into the hypotenuse of a right triangle.
:::live vectors

The same rule works inside a moving train. A train at 80 km/h passes the platform at about 22 m/s; walk forward at 1.4 m/s and you pass it at about 23.6 m/s, because the two arrows point the same way and add. Walk towards the back and they subtract.

#### Step 6: why 5 + 5 is not always 10

Two 5 N pulls in the same direction add to 10 N. Two 5 N pulls in opposite directions add to 0. Two 5 N pulls at right angles add to about 7 N, the diagonal of a square with sides of 5; at 60° they add to √(25 + 25 + 25) ≈ 8.7 N. Vectors only add like ordinary numbers when they lie along one line. Everywhere else, you draw or resolve into perpendicular shadows.

:::careful
> "Two forces of 5 N make 10 N. Numbers add."

Only if they point the same way (*θ* = 0°). Opposite (*θ* = 180°), they make 0 N; at right angles (*θ* = 90°), about 7.1 N. A vector is an amount *and* a direction, and the angle *θ* between the arrows controls the 2*PQ* cos *θ* alignment term. Off a line, lay the arrows head to tail or resolve them into perpendicular components; never just add the magnitudes.
:::

:::home Two strings and a book
Tie two strings to a book lying on a smooth table. Pull both gently with the same effort at right angles to each other: the book slides off along the diagonal between them, the resultant. Pull both the same way and it goes that way, faster. Pull in opposite directions with equal effort and it goes nowhere, like the rope on sports day. Now pull one string a little harder than the other and watch the diagonal swing towards it.
:::

Chapter 1 uses vectors for velocity, and the train walk comes from there. Chapter 3 opens with adding forces, where the net force is the whole story of whether anything changes its motion, and splits weight on a slope into *mg* sin *θ* and *mg* cos *θ*. And in Chapter 4 a ball thrown sideways has its motion split into two perpendicular arrows, across (*v* cos *θ*) and up (*v* sin *θ*), that behave as if they had never met.
