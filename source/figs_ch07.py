"""Figures for Chapter 7: Energy.

Every number drawn here was computed with python3 -I for the chapter text (see provenance/ch07.yml `computed:`).
Energy stores use the theme washes with an ink outline (class "wash-x ln"): wash-e = gravitational (height),
wash-p = kinetic (motion), wash-n = thermal and sound. Colour is never the only cue: every bar carries its label.
"""
from figs_core import Fig, figure, catmull

GRAV, KIN, THERM = 'wash-e ln', 'wash-p ln', 'wash-n ln'


def _stack(f, x, base, w, parts, scale, min_label=16):
    """Stacked bar from `base` upward. parts = [(value, cls, label)]; height = value * scale."""
    y = base
    for val, cls, lab in parts:
        h = val * scale
        if h <= 0:
            continue
        f.rect(x, y - h, w, h, cls, rx=0)
        if h >= min_label and lab:
            f.text(x + w / 2, y - h / 2 + 4, lab, 't', 'middle', 12)
        y -= h


def _legend(f, x, y, items, size=12, gap=16):
    for i, (cls, lab) in enumerate(items):
        yy = y + i * gap
        f.rect(x, yy - 9, 14, 11, cls, rx=1)
        f.text(x + 20, yy, lab, 't m', 'start', size)


@figure
def c7_ledger():
    f = Fig(640, 300, 'An energy ledger: four stacked bars for a 100 g ball dropped from 1.00 m, at release, halfway, '
                      'just before the floor and at the top of its first bounce; every bar totals 0.98 J')
    base, scale = 240, 180 / 0.98
    f.text(300, 24, 'The same 0.98 J, four moments', 't b', 'middle', 14)
    f.axis(60, base, 390, 200, '', 'energy (J)',
           ticks={'y': [(0.49 * scale, '0.49'), (0.98 * scale, '0.98')]})
    cols = [
        (90, 'released', '1.00 m up', [(0.98, GRAV, '0.98'), (0, KIN, ''), (0, THERM, '')]),
        (180, 'halfway down', '0.50 m up', [(0.49, GRAV, '0.49'), (0.49, KIN, '0.49'), (0, THERM, '')]),
        (270, 'just before', 'the floor', [(0, GRAV, ''), (0.98, KIN, '0.98'), (0, THERM, '')]),
        (360, 'top of the', 'first bounce, 0.64 m', [(0.63, GRAV, '0.63'), (0, KIN, ''), (0.35, THERM, '0.35')]),
    ]
    for x, l1, l2, parts in cols:
        _stack(f, x, base, 60, parts, scale)
        f.text(x + 30, base + 18, l1, 't m', 'middle', 12)
        f.text(x + 30, base + 32, l2, 't m', 'middle', 12)
    _legend(f, 470, 80, [(GRAV, 'gravitational (height)'), (KIN, 'kinetic (motion)'), (THERM, 'thermal + sound')])
    f.lines(470, 150, ['Each column adds up', 'to 0.98 J. Nothing is', 'ever missing; it only', 'moves between stores.'], 't m', 'start', 12)
    return f.svg()


@figure
def c7_dent():
    f = Fig(640, 290, 'Two balls dropped into clay, one arriving at twice the speed of the other, with a dent four times '
                      'as deep; beside them, bars comparing momentum (doubled) and kinetic energy (quadrupled)')
    f.text(180, 24, '’s Gravesande’s clay, 1722', 't b', 'middle', 14)
    f.rect(30, 170, 300, 90, 'plate', rx=0)
    f.text(45, 250, 'soft clay', 't m', 'start', 12)
    # ball 1: speed v, dent d = 12 px
    f.circle(100, 120, 14, 'block')
    f.vector(130, 68, 0, 40, 'v')
    f.path('M84,170 Q100,194 116,170', 'fill-sheet', extra='stroke="none"')
    f.path('M84,170 Q100,194 116,170', 'ln')
    f.text(100, 276, 'dent: depth d', 't', 'middle', 12)
    # ball 2: speed 2v, dent 4d = 48 px
    f.circle(240, 120, 14, 'block')
    f.vector(270, 28, 0, 80, '2v')
    f.path('M224,170 Q240,266 256,170', 'fill-sheet', extra='stroke="none"')
    f.path('M224,170 Q240,266 256,170', 'ln')
    f.text(240, 276, 'dent: depth 4d', 't', 'middle', 12)
    # bars
    f.text(490, 24, 'Twice the speed gives…', 't b', 'middle', 14)
    unit = 30
    f.text(425, 60, 'momentum mv', 't m', 'middle', 12)
    f.rect(395, 240 - unit, 26, unit, 'wash-e ln', rx=0)
    f.rect(429, 240 - 2 * unit, 26, 2 * unit, 'wash-e ln', rx=0)
    f.text(408, 256, 'v', 't m', 'middle', 12); f.text(442, 256, '2v', 't m', 'middle', 12)
    f.text(425, 272, '× 2', 't b', 'middle', 13)
    f.text(560, 60, 'kinetic energy ½mv²', 't m', 'middle', 12)
    f.rect(530, 240 - unit, 26, unit, 'wash-p ln', rx=0)
    f.rect(564, 240 - 4 * unit, 26, 4 * unit, 'wash-p ln', rx=0)
    f.text(543, 256, 'v', 't m', 'middle', 12); f.text(577, 256, '2v', 't m', 'middle', 12)
    f.text(560, 272, '× 4', 't b', 'middle', 13)
    f.line(380, 240, 610, 240, 'ln m')
    return f.svg()


@figure
def c7_track():
    f = Fig(640, 300, 'A marble on a smooth track released from 1.0 m, shown at four points with its speed: 3.1 m/s half '
                      'a metre down, 4.4 m/s at the bottom, 3.1 m/s on top of a 0.5 m bump')
    def y(h):
        return 230 - 160 * h
    pts = [(60, y(1.0)), (110, y(0.86)), (185, y(0.5)), (250, y(0.12)), (300, y(0.0)), (360, y(0.06)),
           (430, y(0.3)), (500, y(0.5)), (560, y(0.3)), (610, y(0.2))]
    f.text(320, 24, 'Height becomes speed, and back again', 't b', 'middle', 14)
    for h, lab in ((1.0, '1.0 m'), (0.5, '0.5 m'), (0.0, '0 m')):
        f.line(30, y(h), 612, y(h), 'ln dash r')
        f.text(636, y(h) + 4, lab, 't m', 'end', 12)
    f.path(catmull(pts), 'ln', extra='stroke-width="2.4"')
    # marbles and speeds (arrow length proportional to speed: 4.43 m/s = 78 px)
    f.circle(60, y(1.0) - 8, 8, 'block')
    f.text(60, y(1.0) - 24, 'released, v = 0', 't', 'middle', 12)
    f.circle(185, y(0.5) - 8, 8, 'block')
    f.vector(195, y(0.5) - 2, 38, 36, 'v = 3.1 m/s')
    f.circle(300, y(0.0) - 8, 8, 'block')
    f.vector(310, y(0.0) - 8, 78, 0, 'v = 4.4 m/s')
    f.circle(500, y(0.5) - 8, 8, 'block')
    f.vector(510, y(0.5) - 8, 55, 0, '')
    f.text(538, y(0.5) - 24, 'v = 3.1 m/s', 't e', 'middle', 13)
    f.text(320, 262, 'mgh = ½mv², so v = √(2gh): the mass cancels, and the speed depends only on how far', 't m', 'middle', 12)
    f.text(320, 278, 'the marble is below its start. With no friction, height and motion always add to the same total.', 't m', 'middle', 12)
    return f.svg()


@figure
def c7_bounce():
    f = Fig(640, 300, 'A bouncing ball drawn with each bounce keeping 64% of the height before it, and under each peak a '
                      'bar showing the energy split between height and warmth-and-sound, all bars the same total height')
    base = 220
    def y(h):
        return base - 150 * h
    f.text(170, 24, 'Each bounce lower…', 't b', 'middle', 14)
    f.ground(30, base, 300)
    heights = [1.0, 0.64, 0.41, 0.26]
    # the drop: half a parabola from the release point
    f.path(f'M40,{y(1.0)} Q95,{y(1.0)} 95,{base}', 'ln e')
    f.circle(40, y(1.0), 6, 'block')
    f.text(40, y(1.0) - 12, '1.0 m', 't', 'middle', 12)
    x = 95
    widths = [88, 70, 56]
    for h, w in zip(heights[1:], widths):
        cx = x + w / 2
        f.path(f'M{x},{base} Q{cx},{2 * y(h) - base} {x + w},{base}', 'ln e')
        f.text(cx, y(h) - 8, f'{h:.2f} m', 't', 'middle', 12)
        x += w
    f.text(170, 250, 'thock… thock… thock', 't m', 'middle', 12)
    f.text(170, 268, '64% of the height kept each bounce', 't m', 'middle', 12)
    f.text(170, 283, '(a figure chosen for the drawing)', 't m', 'middle', 12)
    # energy bars at the top of each bounce
    f.text(495, 24, '…but the total never changes', 't b', 'middle', 14)
    scale = 150
    xs = [370, 435, 500, 565]
    labels = ['start', '1st', '2nd', '3rd']
    for h, bx, lab in zip(heights, xs, labels):
        _stack(f, bx, base, 40, [(h, GRAV, ''), (1 - h, THERM, '')], scale, min_label=999)
        f.text(bx + 20, base + 16, lab, 't m', 'middle', 12)
        f.text(bx + 20, base + 30, f'{h:.2f} m', 't m', 'middle', 12)
    f.line(360, base, 615, base, 'ln m')
    _legend(f, 370, 264, [(GRAV, 'still in the bounce (height)'), (THERM, 'spread out as warmth and sound')], size=12, gap=16)
    return f.svg()


@figure
def c7_bill():
    f = Fig(640, 300, 'Horizontal bars on a logarithmic hours axis showing how long one kilowatt-hour runs a 10 W LED '
                      '(100 h), a 100 W person (10 h), a 500 W mixer-grinder (2 h) and a 2 kW geyser (half an hour)')
    f.text(320, 24, 'What one unit (1 kWh = 3.6 million joules) will run', 't b', 'middle', 14)
    x0, dec = 160, 128          # axis starts at 0.1 h; 128 px per factor of ten
    import math
    def xh(h):
        return x0 + dec * math.log10(h / 0.1)
    rows = [('10 W LED bulb', 100, '100 hours'), ('100 W person at rest', 10, '10 hours'),
            ('500 W mixer-grinder', 2, '2 hours'), ('2,000 W geyser', 0.5, 'half an hour')]
    for i, (lab, h, txt) in enumerate(rows):
        yy = 62 + i * 44
        f.text(x0 - 10, yy + 14, lab, 't', 'end', 13)
        f.rect(x0, yy, xh(h) - x0, 22, 'wash-e ln', rx=2)
        f.text(xh(h) + 8, yy + 15, txt, 't b', 'start', 12)
    ay = 62 + 4 * 44 - 10
    f.line(x0, ay, xh(100) + 30, ay, 'ax')
    for h, lab in ((0.1, '0.1 h'), (1, '1 h'), (10, '10 h'), (100, '100 h')):
        f.line(xh(h), ay, xh(h), ay + 5, 'ax')
        f.text(xh(h), ay + 20, lab, 't m', 'middle', 12)
    f.text(x0 + 1.5 * dec, ay + 38, 'hours the unit lasts (each step along the axis is ten times longer)', 't m', 'middle', 12)
    f.text(320, 290, '1 kWh ≈ 860 kcal: about 29 biscuits of 30 kcal each. Wattages are typical label values.', 't m', 'middle', 12)
    return f.svg()


@figure
def c7_city():
    f = Fig(1000, 340, 'Left: a Sankey diagram for a coal-fired power station, 100 J of chemical energy splitting into '
                       '40 J electrical and 60 J thermal. Right: Tata Power’s generating capacity in megawatts beside its '
                       'actual generation in million units for 2021–22, hydro and thermal shares', wide=True)
    # ---- left: Sankey
    f.text(270, 26, 'A coal-fired station: where 100 J of coal goes', 't b', 'middle', 14)
    f.rect(40, 110, 160, 120, 'wash-g ln', rx=0)
    f.text(120, 96, '100 J chemical energy in the coal', 't', 'middle', 12)
    f.text(120, 166, 'boiler → turbine', 't m', 'middle', 12)
    f.text(120, 182, '→ generator', 't m', 'middle', 12)
    f.path('M200,110 L480,110 L500,134 L480,158 L200,158 Z', 'wash-e ln')
    f.text(340, 138, '40 J electrical energy', 't', 'middle', 12)
    f.text(340, 96, 'out along the wires', 't m', 'middle', 12)
    f.path('M200,158 L272,158 L272,300 L236,320 L200,300 Z', 'wash-n ln')
    f.text(236, 235, '60 J', 't', 'middle', 12)
    f.text(300, 300, '60 J thermal energy into the air', 't m', 'start', 12)
    f.text(300, 316, 'and the cooling water (about 40% efficient)', 't m', 'start', 12)
    # ---- right: capacity vs generation
    f.text(770, 26, 'Tata Power’s generating arm (regulator’s filing)', 't b', 'middle', 14)
    bh, base = 200, 290
    for bx, total, hydro, lab1, lab2, unit in ((610, 1377, 447, 'capacity', '1,377 MW', 'MW'),
                                                 (820, 7108, 1596, 'generated in 2021–22', '7,108 million units', 'MU')):
        fh = hydro / total
        _stack(f, bx, base, 120, [(1 - fh, THERM, ''), (fh, GRAV, '')], bh, min_label=999)
        f.text(bx + 60, base - bh * (1 - fh) / 2 + 4, f'thermal {total - hydro:,} {unit}', 't', 'middle', 12)
        f.text(bx + 60, base - bh * (1 - fh) / 2 + 20, f'{100 * (1 - fh):.0f}%', 't', 'middle', 12)
        f.text(bx + 60, base - bh * (1 - fh) - bh * fh / 2 + 4, f'hydro {hydro:,} {unit}', 't', 'middle', 12)
        f.text(bx + 60, base - bh * (1 - fh) - bh * fh / 2 + 20, f'{100 * fh:.0f}%', 't', 'middle', 12)
        f.text(bx + 60, base + 18, lab1, 't m', 'middle', 12)
        f.text(bx + 60, base + 33, lab2, 't', 'middle', 12)
    f.text(770, 60, 'a rate (megawatts) is not an amount (million units)', 't m', 'middle', 12)
    return f.svg()
