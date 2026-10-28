"""Figures for the stories in the motion and fluids groups (names prefixed s_). Every number drawn here is computed
in the story's :::work block: 98 N for a 10 kg luggage-scale reading, 76 cm of mercury against 10.3 m of water,
980 Pa across a 10 cm cube, about 20,000 N on half-metre hemispheres."""
from __future__ import annotations
import math
from figs_core import Fig, figure


@figure
def s_two_scales():
    """Two luggage scales hooked together and pulled from both ends; both dials read the same."""
    f = Fig(640, 270, 'Two luggage scales hooked together in a line, pulled to the left by Kym and to the right by an '
                      'adult. Both dials read 10.0 kg. Where the hooks meet, two equal and opposite force arrows of '
                      '98 N are drawn, one on each scale.')
    y = 150
    f.text(320, 26, 'Pull against each other as hard as you like', 't b', 'middle', 14)
    for x, name in ((130, 'scale A'), (390, 'scale B')):
        f.rect(x, y - 30, 120, 60, 'plate', rx=10)
        f.text(x + 60, y - 9, name, 't m', 'middle', 12)
        f.text(x + 60, y + 15, '10.0 kg', 't b', 'middle', 16)
    # the two hooks, linked
    f.line(250, y, 390, y, 'ln')
    f.circle(320, y, 5, 'fill-ink')
    # the pair of forces where the hooks meet, drawn above the link
    f.force(314, y - 48, -52, 0, '', 12)
    f.force(326, y - 48, 52, 0, '', 12)
    f.text(256, y - 60, 'B pulls A: 98 N', 't p b', 'end', 12)
    f.text(384, y - 60, 'A pulls B: 98 N', 't p b', 'start', 12)
    f.line(320, y - 40, 320, y - 8, 'ln m')
    # handles out to the two pullers
    f.line(40, y, 130, y, 'ln')
    f.line(510, y, 600, y, 'ln')
    f.arrow(120, y + 62, 48, y + 62, 'muted')
    f.arrow(520, y + 62, 592, y + 62, 'muted')
    f.text(84, y + 84, 'Kym pulls', 't m', 'middle', 12)
    f.text(556, y + 84, 'an adult pulls', 't m', 'middle', 12)
    f.text(320, 252, 'both read 10.0 kg, a pull of about 98 N on each scale; a door handle in place of one puller changes nothing',
           't m', 'middle', 12)
    return f.svg()


@figure
def s_rocket_momentum():
    """A rocket throwing gas downward, with the force pair and the momentum bookkeeping beside it."""
    f = Fig(640, 330, 'Left: a rocket with gas streaming from its tail. A force arrow on the rocket points up, labelled '
                      'gas pushes the rocket up; a force arrow on the gas points down, labelled rocket pushes the gas down. '
                      'Right: two equal arrows, the rocket\'s momentum upward and the gas\'s momentum downward, with the '
                      'note that the total stays zero.')
    cx = 120
    f.text(160, 26, 'What pushes on what', 't b', 'middle', 14)
    # the rocket
    f.path(f'M{cx - 20},72 L{cx},38 L{cx + 20},72 Z', 'fill-ink')
    f.rect(cx - 20, 72, 40, 128, 'block', rx=5)
    f.path(f'M{cx - 20},200 L{cx - 38},232 L{cx - 20},232 Z', 'fill-ink')
    f.path(f'M{cx + 20},200 L{cx + 38},232 L{cx + 20},232 Z', 'fill-ink')
    f.rect(cx - 9, 200, 18, 14, 'fill-ink', rx=2)
    # the exhaust cloud
    for (dx, dy, r) in ((-10, 234, 8), (12, 240, 9), (-14, 258, 11), (14, 266, 12), (0, 290, 14)):
        f.circle(cx + dx, dy, r, 'wash')
    f.text(152, 302, 'hot gas, thrown downward', 't m', 'start', 12)
    # the pair of forces, drawn beside the rocket so they do not hide it
    f.force(172, 200, 0, -64, '', 12)
    f.text(182, 158, 'gas pushes the', 't p b', 'start', 12)
    f.text(182, 173, 'rocket up', 't p b', 'start', 12)
    f.force(172, 228, 0, 64, '', 12)
    f.text(182, 250, 'rocket pushes', 't p b', 'start', 12)
    f.text(182, 265, 'the gas down', 't p b', 'start', 12)
    # velocities
    f.vector(56, 160, 0, -40, '', 12)
    f.text(56, 108, 'rocket: slow', 't e', 'middle', 12)
    f.vector(56, 226, 0, 64, '', 12)
    f.text(56, 310, 'gas: very fast', 't e', 'middle', 12)
    # right panel: the momentum ledger
    f.line(318, 44, 318, 310, 'ln dash')
    f.text(480, 26, 'Momentum before and after', 't b', 'middle', 14)
    f.text(480, 52, 'isolated model: no external force', 't m', 'middle', 12)
    f.text(480, 72, 'before: everything at rest, total 0', 't m', 'middle', 12)
    f.vector(420, 212, 0, -92, '', 12)
    f.vector(540, 120, 0, 92, '', 12)
    f.text(480, 170, 'same size', 't m', 'middle', 12)
    f.lines(420, 240, ['the rocket:', 'big mass ×', 'small speed'], 't e', 'middle', 12)
    f.lines(540, 240, ['the gas:', 'small mass ×', 'big speed'], 't e', 'middle', 12)
    f.text(480, 306, 'equal and opposite, so the total is still 0', 't m', 'middle', 12)
    return f.svg()


@figure
def s_torricelli():
    """Torricelli's mercury barometer beside a (broken) water column at the same pressure."""
    f = Fig(640, 340, 'Torricelli\'s tube standing in a dish of mercury: the mercury column is 76 cm tall, with an empty '
                      'space above it, and arrows show the air pressing down on the open mercury in the dish. To the right '
                      'a much taller water tube, drawn with a break, is labelled 10.3 m: the same air pressure holds up '
                      'both columns.')
    px_per_cm = 2.5
    dish_top = 268
    tx = 295                                   # centre of the mercury tube
    top = dish_top - 76 * px_per_cm            # 78: the top of the mercury column
    # the dish of mercury and the tube
    f.rect(190, dish_top, 210, 30, 'plate', rx=4)
    f.text(295, 318, 'dish of mercury', 't m', 'middle', 12)
    f.rect(tx - 12, top - 28, 24, dish_top + 20 - (top - 28), 'glass', rx=3)
    f.rect(tx - 9, top, 18, dish_top + 17 - top, 'plate', rx=0)
    # the empty space, labelled to the right of the tube top
    f.line(tx + 12, top - 14, tx + 30, top - 14, 'ln m')
    f.text(tx + 34, top - 20, 'almost nothing in here', 't m', 'start', 12)
    f.text(tx + 34, top - 6, '(a vacuum)', 't m', 'start', 12)
    # 76 cm bracket
    bx = tx + 30
    f.line(bx, top, bx, dish_top, 'ln m')
    f.line(bx - 6, top, bx + 6, top, 'ln m')
    f.line(bx - 6, dish_top, bx + 6, dish_top, 'ln m')
    f.text(bx + 8, (top + dish_top) / 2 + 4, '76 cm of mercury', 't', 'start', 13)
    # the air pressing on the open mercury, to the left of the tube
    for x in (212, 240, 268):
        f.force(x, dish_top - 50, 0, 46, '', 12)
    f.text(20, 190, 'the air presses down', 't p b', 'start', 12)
    f.text(20, 205, 'on the open mercury...', 't p b', 'start', 12)
    f.curved_arrow(274, 258, tx - 2, 234, bend=-12, kind='ink')
    f.text(20, 236, '...and so pushes mercury', 't m', 'start', 12)
    f.text(20, 251, 'up the tube until the', 't m', 'start', 12)
    f.text(20, 266, 'column\'s weight balances it', 't m', 'start', 12)
    # the water tube, same pressure, 13.6 times taller: drawn with a break
    wx = 560
    f.rect(wx - 14, 40, 28, dish_top + 20 - 40, 'glass', rx=3)
    f.rect(wx - 11, 44, 22, 92, 'water', rx=0)
    f.rect(wx - 11, 168, 22, dish_top + 17 - 168, 'water', rx=0)
    f.path(f'M{wx - 16},138 L{wx - 4},146 L{wx + 4},130 L{wx + 16},138', 'ln')
    f.path(f'M{wx - 16},164 L{wx - 4},172 L{wx + 4},156 L{wx + 16},164', 'ln')
    f.rect(wx - 60, dish_top, 120, 30, 'water', rx=4)
    f.text(wx, 318, 'dish of water', 't m', 'middle', 12)
    f.text(wx - 22, 205, 'the same air pressure', 't', 'end', 12)
    f.text(wx - 22, 220, 'holds up 10.3 m of water', 't', 'end', 12)
    f.text(wx - 22, 235, '(not to scale: this tube', 't m', 'end', 12)
    f.text(wx - 22, 250, 'would be 13.6 times taller)', 't m', 'end', 12)
    return f.svg()


@figure
def s_hemispheres():
    """The Magdeburg hemispheres: nothing inside, the air pushing in all round, horses pulling outward."""
    f = Fig(640, 310, 'Two copper hemispheres fitted together into a sphere, with the air pumped out. Small force arrows '
                      'all round the outside point inward, labelled the air outside pushes in on every part of the '
                      'surface. Ropes lead left and right to teams of horses pulling outward. Inside is written: air '
                      'pumped out, nothing here to push outward.')
    cx, cy, r = 320, 150, 78
    f.path(f'M{cx},{cy - r} A{r},{r} 0 0 0 {cx},{cy + r} Z', 'wash-n')
    f.path(f'M{cx},{cy - r} A{r},{r} 0 0 1 {cx},{cy + r} Z', 'wash-n')
    f.circle(cx, cy, r, 'ln')
    f.line(cx, cy - r, cx, cy - 34, 'ln dash')
    f.line(cx, cy + 40, cx, cy + r, 'ln dash')
    f.lines(cx, cy - 12, ['air pumped out:', 'nothing here to', 'push outward'], 't m', 'middle', 12)
    # the air pushing in all round, leaving the two rope directions clear
    for deg in range(20, 360, 20):
        if abs(deg - 180) < 15:
            continue
        a = math.radians(deg)
        x0, y0 = cx + (r + 42) * math.cos(a), cy + (r + 42) * math.sin(a)
        f.force(x0, y0, -34 * math.cos(a), -34 * math.sin(a), '', 12)
    f.text(20, 40, 'the air outside pushes in', 't p b', 'start', 12)
    f.text(20, 55, 'on every part of the surface', 't p b', 'start', 12)
    # ropes and horses
    f.line(cx - r, cy, 70, cy, 'ln', extra='stroke-width="2.5"')
    f.line(cx + r, cy, 570, cy, 'ln', extra='stroke-width="2.5"')
    f.arrow(70, cy, 30, cy, 'muted', width=2.5)
    f.arrow(570, cy, 610, cy, 'muted', width=2.5)
    f.text(60, cy + 24, 'a team of', 't m', 'middle', 12)
    f.text(60, cy + 39, 'horses pulls', 't m', 'middle', 12)
    f.text(580, cy + 24, 'a team of', 't m', 'middle', 12)
    f.text(580, cy + 39, 'horses pulls', 't m', 'middle', 12)
    f.text(320, 298, 'half-metre hemispheres: about 20,000 N holding the halves together, the weight of some two tonnes',
           't m', 'middle', 12)
    return f.svg()


@figure
def s_buoyancy_cube():
    """A 10 cm cube under water: pressure pushes on every face, more on the deeper bottom face; the net is 9.8 N up."""
    f = Fig(640, 320, 'A tank of water with a cube held below the surface. Force arrows push on every face of the cube: '
                      'a short one down on the top, a longer one up on the bottom, equal ones inward on the two sides. '
                      'To the right, one upward arrow labelled net upward push 9.8 N, with the arithmetic beneath it.')
    # the tank
    f.rect(40, 70, 320, 220, 'water', rx=0)
    f.line(40, 70, 40, 290, 'ln')
    f.line(360, 70, 360, 290, 'ln')
    f.line(40, 290, 360, 290, 'ln')
    f.text(48, 62, 'water surface', 't m', 'start', 12)
    # the cube: 10 cm = 80 px
    x0, y0, s = 160, 125, 80
    f.rect(x0, y0, s, s, 'block', rx=2)
    f.text(x0 + s / 2, y0 + s / 2 + 5, '10 cm cube', 't b', 'middle', 13)
    # pushes on each face
    f.force(x0 + s / 2, y0 - 44, 0, 42, '', 12)
    f.text(x0 + s / 2 + 8, y0 - 30, 'push down on the top', 't p b', 'start', 12)
    f.force(x0 + s / 2, y0 + s + 70, 0, -68, '', 12)
    f.text(x0 + s / 2 - 5, y0 + s + 52, 'push up on the bottom:', 't p b', 'end', 12)
    f.text(x0 + s / 2 - 5, y0 + s + 67, 'bigger, because it is deeper', 't p b', 'end', 12)
    f.force(x0 - 46, y0 + s / 2, 44, 0, '', 12)
    f.force(x0 + s + 46, y0 + s / 2, -44, 0, '', 12)
    f.text(200, 308, 'the sideways pushes are equal and cancel', 't m', 'middle', 12)
    # the net result
    f.line(400, 60, 400, 300, 'ln dash')
    f.text(520, 62, 'What is left over', 't b', 'middle', 14)
    f.force(470, 200, 0, -96, '', 13)
    f.text(482, 150, 'net upward push', 't p b', 'start', 13)
    f.text(482, 167, '9.8 N', 't p b', 'start', 13)
    f.lines(430, 232, ['bottom face 10 cm deeper', '= 980 N/m² more pressure', '× 0.01 m² of face = 9.8 N',
                       '= the weight of 1 litre of water,', 'the water the cube pushed aside'], 't m', 'start', 12)
    return f.svg()
