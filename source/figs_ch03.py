"""Chapter 3 figures: forces come in pairs.

All drawings are ours. c3_bridging_chain follows Clement's bridging chain (research/misconceptions.md) and the sagging
card table of OpenStax College Physics 2e Fig 4.11, redrawn as a steel ruler with coins. c3_rocket_momentum is our own
momentum diagram in the spirit of OpenStax College Physics 2e Fig 8.12. Nothing is copied.
"""
from figs_core import Fig, figure


def _person(f, x, yf, h=100, cls='ln'):
    """A stick figure standing with its feet at (x, yf)."""
    hy, hip = yf - h + 10, yf - 28
    f.circle(x, hy, 9, cls)
    f.line(x, hip, x, hy + 9, cls)
    f.line(x - 10, yf, x, hip, cls)
    f.line(x + 10, yf, x, hip, cls)
    sy = hip - (h - 38) * 0.62
    f.line(x, sy, x - 15, sy + 20, cls)
    f.line(x, sy, x + 15, sy + 20, cls)
    return f


def _cart(f, x, y, w=60, h=40, label='cart'):
    f.mass_block(x, y, w, h, label, 13)
    f.circle(x + 12, y + h + 8, 7, 'ln')
    f.circle(x + w - 12, y + h + 8, 7, 'ln')
    return f


@figure
def c3_tug_cart():
    f = Fig(640, 260, 'A cart with ropes on both sides. Left panel: 390 N to the left and 390 N to the right cancel, '
                      'net force zero. Right panel: 390 N left and 490 N right, net force 100 N to the right, drawn to '
                      'the same scale.')
    f.line(320, 40, 320, 250, 'ln dash')
    # panel A: balanced (scale: 1 px per 3.9 N)
    f.text(160, 50, 'equal pulls', 't b', 'middle', 13)
    f.ground(30, 185, 260)
    _cart(f, 130, 130)
    f.text(80, 112, '120 + 100 + 90 + 80', 't m', 'middle', 12)
    f.force(130, 150, -100, 0)
    f.text(80, 142, '390 N', 't p b', 'middle', 13)
    f.text(240, 112, '150 + 130 + 110', 't m', 'middle', 12)
    f.force(190, 150, 100, 0)
    f.text(240, 142, '390 N', 't p b', 'middle', 13)
    f.text(160, 222, 'net force 0', 't b', 'middle', 13)
    f.text(160, 240, 'velocity does not change', 't m', 'middle', 12)
    # panel B: one more child on the right
    f.text(480, 50, 'one more child on the right', 't b', 'middle', 13)
    f.ground(350, 185, 270)
    _cart(f, 450, 130)
    f.text(400, 112, '120 + 100 + 90 + 80', 't m', 'middle', 12)
    f.force(450, 150, -100, 0)
    f.text(400, 142, '390 N', 't p b', 'middle', 13)
    f.text(570, 112, '150 + 130 + 110 + 100', 't m', 'middle', 12)
    f.force(510, 150, 126, 0)
    f.text(573, 142, '490 N', 't p b', 'middle', 13)
    f.text(480, 222, 'net force 100 N to the right', 't b', 'middle', 13)
    f.force(467, 240, 26, 0)
    f.text(505, 245, '(to scale)', 't m', 'start', 12)
    return f.svg()


@figure
def c3_f_ma():
    f = Fig(640, 355, 'Three controlled comparisons use identical trolleys. One mass m pushed by F accelerates at a; the same mass pushed by 2F accelerates at 2a; two identical masses pushed by F accelerate at a/2. Force and acceleration arrows each use a consistent scale; trolley mass is idealised as negligible.')
    f.text(24,26,'Change one thing. Watch what changes.', 't b',size=17)
    f.text(135,53,'push', 't p b','middle',13)
    f.text(291,53,'mass', 't b','middle',13)
    f.text(430,53,'acceleration', 't e b','middle',13)
    for y,force,loads,acc,flab,alab in ((112,58,1,48,'F','a'),(211,116,1,96,'2F','2a'),(310,58,2,24,'F','a/2')):
        f.ground(230,y+26,340)
        f.cart(244,y-16,96,24,loads=loads)
        f.force(238-force,y,force,0)
        f.text(238-force/2,y-14,flab,'t p b','middle',16)
        f.vector(370,y,acc,0)
        f.text(370+acc+13,y+5,alab,'t e b',size=16)
        if y==112: note=['Start here:','one load, one push']
        elif y==211: note=['Double the push.','Keep the same mass.']
        else: note=['Double the mass.','Keep the same push.']
        f.lines(24,y-34,note,'t',size=13,lh=1.5)
    f.text(320,352,'Identical loads represent m; trolley mass is left out of this model.','t m','middle',12)
    return f.svg()


@figure
def c3_bridging_chain():
    f = Fig(640, 272, 'Four panels: a hand pressing a spring, which pushes up; a book denting a sponge, which pushes up; '
                      'a steel ruler across two book stacks sagging under coins, which pushes up; and a book on a table, '
                      'with the table\'s upward push equal to the book\'s weight. The table\'s sag is exaggerated.')
    # 1 spring
    f.ground(40, 200, 100)
    f.spring(90, 200, 90, 122, coils=6, width=8)
    f.rect(68, 102, 44, 18, 'plate', rx=5)
    f.text(90, 115, 'hand', 't m', 'middle', 12)
    f.force(116, 124, 0, -46)
    f.text(116, 66, 'pushes up', 't p b', 'middle', 12)
    f.text(90, 232, 'spring', 't b', 'middle', 13)
    # 2 sponge
    f.ground(190, 200, 110)
    f.path('M195,170 L218,170 Q245,188 272,170 L295,170 L295,200 L195,200 Z', 'wash')
    f.rect(222, 154, 46, 22, 'block', rx=3)
    f.force(282, 174, 0, -46)
    f.text(282, 116, 'pushes up', 't p b', 'middle', 12)
    f.text(245, 232, 'sponge', 't b', 'middle', 13)
    # 3 steel ruler on two book stacks
    f.ground(330, 200, 140)
    f.rect(335, 160, 30, 40, 'plate', rx=2)
    f.rect(435, 160, 30, 40, 'plate', rx=2)
    f.path('M335,160 Q400,190 465,160', 'ln', 'stroke-width="3"')
    f.circle(400, 167, 7, 'plate')
    f.circle(400, 155, 7, 'plate')
    f.circle(400, 143, 7, 'plate')
    f.force(425, 172, 0, -46)
    f.text(425, 114, 'pushes up', 't p b', 'middle', 12)
    f.text(400, 232, 'steel ruler, coins', 't b', 'middle', 13)
    # 4 table
    f.path('M490,170 Q555,180 620,170 L620,180 Q555,190 490,180 Z', 'plate')
    f.line(500, 180, 500, 205, 'ln')
    f.line(610, 180, 610, 205, 'ln')
    f.rect(532, 148, 46, 27, 'block', rx=3)
    f.force(548, 159, 0, 40)
    f.text(548, 214, 'weight', 't p b', 'middle', 12)
    f.force(588, 170, 0, -46)
    f.text(588, 112, 'pushes up', 't p b', 'middle', 12)
    f.text(555, 232, 'table', 't b', 'middle', 13)
    f.text(320, 260, 'in every case the upward push grows to match the downward load', 't m', 'middle', 12)
    return f.svg()


@figure
def c3_luggage_scales():
    f = Fig(640, 240, 'Two luggage scales hooked together, pulled left by Kym and right by Dad. Both dials read 10 kg. '
                      'Arrows show each pull, 98 N. A note explains that a dial reading in kg is a pull divided by 9.8.')
    f.rect(96, 110, 24, 20, 'plate', rx=6)
    f.text(108, 150, 'Kym', 't m', 'middle', 12)
    f.rect(520, 110, 24, 20, 'plate', rx=6)
    f.text(532, 150, 'Dad', 't m', 'middle', 12)
    f.line(120, 120, 170, 120, 'ln')
    f.line(470, 120, 520, 120, 'ln')
    f.rect(170, 95, 110, 50, 'plate', rx=10)
    f.text(225, 126, '10 kg', 't b', 'middle', 16)
    f.rect(360, 95, 110, 50, 'plate', rx=10)
    f.text(415, 126, '10 kg', 't b', 'middle', 16)
    f.path('M280,120 C300,100 340,140 360,120', 'ln', 'stroke-width="2.5"')
    f.force(165, 80, -80, 0)
    f.text(165, 70, 'Kym pulls  98 N', 't p b', 'end', 13)
    f.force(475, 80, 80, 0)
    f.text(475, 70, 'Dad pulls  98 N', 't p b', 'start', 13)
    f.text(320, 188, 'both dials read the same, however hard either pulls', 't b', 'middle', 13)
    f.text(320, 208, 'a dial reading in kg is the pull divided by 9.8: 10 kg means about 98 N', 't m', 'middle', 12)
    return f.svg()


@figure
def c3_pairs_person():
    f = Fig(640, 300, 'A person standing on the floor with four labelled forces sorted into two pairs. Pair 1: the '
                      'Earth pulls Kym down, Kym pulls the Earth up. Pair 2: the floor pushes Kym up, Kym pushes the '
                      'floor down. The two forces on Kym cancel; each pair acts on two different objects.')
    f.ground(60, 200, 520)
    f.text(70, 242, 'the Earth', 't m', 'start', 12)
    _person(f, 320, 200, 100)
    # forces on Kym
    f.force(300, 150, 0, 60)
    f.text(288, 182, 'pair 1: the Earth pulls Kym  392 N', 't p b', 'end', 12)
    f.force(340, 200, 0, -60)
    f.text(352, 136, 'pair 2: the floor pushes Kym  392 N', 't p b', 'start', 12)
    # their partners, on the floor and on the Earth
    f.force(352, 203, 0, 50)
    f.text(362, 258, 'pair 2: Kym pushes the floor  392 N', 't p b', 'start', 12)
    f.force(290, 282, 0, -50)
    f.text(278, 286, 'pair 1: Kym pulls the Earth  392 N', 't p b', 'end', 12)
    f.text(320, 60, 'the two forces on Kym cancel; neither pair does', 't m', 'middle', 13)
    return f.svg()


@figure
def c3_momentum_carts():
    f = Fig(640, 236, 'Two rows of two carts. Before: a 0.350 kg cart moves right at 2 m/s towards a 0.500 kg cart '
                      'moving left at 0.5 m/s. After: the light cart moves left at 0.94 m/s and the heavy cart right at '
                      '1.56 m/s. Velocity arrows are to scale. The total momentum, 0.45 kg·m/s, is the same in both rows.')
    scale = 30  # px per m/s
    for y, title, v1, v2, note in ((78, 'before', 2.0, -0.5, '0.45 kg·m/s'),
                                   (178, 'after', -0.94, 1.56, 'still 0.45 kg·m/s')):
        f.text(30, y - 38, title, 't b', 'start', 13)
        f.ground(30, y + 24, 400)
        f.mass_block(150, y - 16, 56, 40, '0.350 kg', 12)
        f.circle(162, y + 31, 6, 'ln'); f.circle(194, y + 31, 6, 'ln')
        f.mass_block(300, y - 16, 70, 40, '0.500 kg', 12)
        f.circle(312, y + 31, 6, 'ln'); f.circle(358, y + 31, 6, 'ln')
        # each cart's velocity arrow is centred above its own cart, label above the arrow
        for cx, v in ((178, v1), (335, v2)):
            f.vector(cx - v * scale / 2, y - 26, v * scale, 0)
            f.text(cx, y - 34, f'{abs(v):g} m/s', 't e', 'middle', 12)
        f.text(455, y - 2, 'total momentum', 't m', 'start', 12)
        f.text(455, y + 14, note, 't', 'start', 12)
    return f.svg()


@figure
def c3_rocket_momentum():
    f = Fig(640, 300, 'Left: a rocket in space throwing exhaust gas backward; one force arrow on the gas (rocket '
                      'pushes gas backward) and one on the rocket (gas pushes rocket forward), equal and opposite. '
                      'Right: momentum before (rocket and fuel at rest, total zero) and after (gas backward, rocket '
                      'forward, total still zero).')
    f.line(320, 40, 320, 270, 'ln dash')
    # the rocket and its exhaust
    f.rect(120, 110, 120, 40, 'plate', rx=8)
    f.path('M240,110 L282,130 L240,150 Z', 'fill-ink')
    f.line(120, 110, 100, 94, 'ln'); f.line(120, 150, 100, 166, 'ln')
    f.path('M120,120 L62,116 L48,130 L62,144 L120,140 Z', 'wash-p')
    f.text(60, 104, 'exhaust gas', 't m', 'middle', 12)
    f.force(180, 92, 60, 0)
    f.text(180, 72, 'gas pushes rocket forward', 't p b', 'middle', 12)
    f.force(84, 130, -60, 0)
    f.text(96, 186, 'rocket pushes gas backward', 't p b', 'middle', 12)
    f.text(160, 258, 'one pair: equal and opposite', 't m', 'middle', 12)
    # momentum bookkeeping
    f.text(480, 62, 'before', 't b', 'middle', 13)
    f.rect(450, 86, 60, 24, 'plate', rx=5)
    f.path('M510,86 L532,98 L510,110 Z', 'fill-ink')
    f.text(480, 130, 'rocket and fuel at rest', 't m', 'middle', 12)
    f.text(480, 148, 'total momentum 0', 't', 'middle', 12)
    f.text(480, 182, 'after', 't b', 'middle', 13)
    f.rect(480, 200, 60, 24, 'plate', rx=5)
    f.path('M540,200 L562,212 L540,224 Z', 'fill-ink')
    f.vector(562, 190, 60, 0)
    f.text(592, 182, 'rocket', 't e', 'middle', 12)
    f.circle(430, 212, 12, 'wash-p')
    f.vector(418, 190, -60, 0)
    f.text(388, 182, 'gas', 't e', 'middle', 12)
    f.text(480, 252, 'momentum backward = momentum forward', 't m', 'middle', 12)
    f.text(480, 270, 'total still 0', 't', 'middle', 12)
    return f.svg()
