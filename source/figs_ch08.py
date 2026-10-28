"""Figures for Chapter 8, Heat and temperature. All drawn by us; numbers from grounding/ch08.md (OpenStax College
Physics 2e Tables 14.1–14.3, 14.2; MIT 8.21 lecture 4) and recomputed with python3 -I (see provenance/ch08.yml)."""
import math
from figs_core import Fig, figure


def _particles(f, pts, cls='pt-e', r=3.2):
    for x, y in pts:
        f.circle(x, y, r, cls)


def _jiggle(f, x, y, dx, dy, kind='muted'):
    """A short double-ended wiggle mark showing a particle's motion."""
    f.line(x - dx, y - dy, x + dx, y + dy, 'ln m')


@figure
def c8_joule():
    f = Fig(640, 300, 'Joule’s apparatus in outline: a falling weight on a string turns a paddle wheel inside a tub of water, '
                      'and a thermometer in the water shows a small rise')
    # pulley, string and weight
    f.circle(90, 50, 16, 'ln')
    f.circle(90, 50, 3, 'fill-ink')
    f.line(74, 50, 74, 150, 'ln')                 # string down to the weight
    f.line(90, 34, 300, 34, 'ln')                 # string across to the axle drum
    f.mass_block(49, 150, 50, 44, 'weight')
    f.vector(74, 200, 0, 44)
    f.text(74, 262, 'the weight falls', 't m', 'middle', 13)
    f.text(74, 280, 'and does work', 't m', 'middle', 13)
    # axle drum and shaft
    f.rect(292, 24, 16, 20, 'block', rx=3)
    f.line(300, 44, 300, 236, 'ln')
    f.curved_arrow(338, 62, 262, 62, bend=18)
    f.text(300, 98, 'paddle turns', 't m', 'middle', 13)
    # tub of water
    f.path('M230,120 L236,262 L364,262 L370,120', 'glass')
    f.path('M233,150 L238,258 L362,258 L367,150 Z', 'water')
    # paddle blades
    for yy in (170, 200, 230):
        f.line(300, yy, 262, yy + 12, 'ln')
        f.line(300, yy, 338, yy - 12, 'ln')
    f.text(300, 284, 'water, churned', 't m', 'middle', 13)
    # thermometer: scale on the left, the rise on the right
    f.rect(482, 70, 14, 170, 'glass', rx=7)
    f.circle(489, 250, 13, 'glass')
    f.rect(486, 150, 6, 88, 'bar-p', rx=3)
    f.circle(489, 250, 10, 'bar-p')
    f.rect(486, 120, 6, 32, 'bar-m', rx=3)
    for yy, lab in ((100, '30 °C'), (150, '20 °C'), (200, '10 °C')):
        f.line(474, yy, 482, yy, 'ln m')
        f.text(470, yy + 4, lab, 't m', 'end', 12)
    f.arrow(516, 150, 516, 122, 'proton')
    f.text(526, 132, 'the reading', 't', 'start', 13)
    f.text(526, 148, 'climbs a little,', 't', 'start', 13)
    f.text(526, 164, 'every time', 't', 'start', 13)
    # the bookkeeping line
    f.text(470, 284, 'so much falling, so much warming', 't b', 'middle', 13)
    return f.svg()


@figure
def c8_bucket_spoon():
    f = Fig(640, 300, 'A bucket of water at 40 °C with many gently moving particles, a spoonful at 90 °C with a few fast '
                      'ones, and two bars showing the energy each gives out cooling to 30 °C: the bucket’s bar is about 333 '
                      'times longer')
    # bucket
    f.path('M40,70 L58,240 L182,240 L200,70 Z', 'glass')
    f.path('M46,90 L60,236 L180,236 L194,90 Z', 'water')
    rnd_pts = []
    cols, rows = 9, 10
    for i in range(cols):
        for j in range(rows):
            x = 62 + i * 14.5 + (6 if j % 2 else 0)
            y = 104 + j * 13.2
            # keep inside the trapezoid
            half = (182 - 58) / 2 + (240 - y) * ((200 - 182) / (240 - 70))
            if abs(x - 120) < half - 6:
                rnd_pts.append((x, y))
    _particles(f, rnd_pts, 'pt-e', 2.6)
    f.text(120, 56, 'bucket · 10 kg · 40 °C', 't b', 'middle', 13)
    f.text(120, 262, 'many particles, each jiggling gently', 't m', 'middle', 12)
    # spoon
    f.path('M250,150 Q250,120 300,118 Q350,116 352,150 Q350,184 300,182 Q250,180 250,150 Z', 'glass')
    f.path('M258,150 Q258,128 300,126 Q342,124 344,150 Q342,176 300,174 Q258,172 258,150 Z', 'water')
    f.line(352, 148, 400, 136, 'ln')
    f.line(352, 154, 400, 146, 'ln')
    spoon_pts = [(276, 150), (300, 138), (326, 152), (304, 164), (288, 142), (318, 140)]
    _particles(f, spoon_pts, 'pt-p', 3.4)
    for (x, y), (dx, dy) in zip(spoon_pts, ((7, 4), (-6, 6), (5, -7), (8, 2), (-4, -7), (6, 6))):
        _jiggle(f, x, y, dx, dy)
    f.text(300, 100, 'spoonful · 5 g · 90 °C', 't b', 'middle', 13)
    f.text(300, 204, 'few particles,', 't m', 'middle', 12)
    f.text(300, 218, 'each jiggling fast', 't m', 'middle', 12)
    # energy bars (to scale: 418,600 J vs 1,256 J -> 200 px vs 0.6 px)
    x0 = 412
    f.text(x0, 56, 'energy given out,', 't b', 'start', 13)
    f.text(x0, 72, 'cooling to 30 °C', 't b', 'start', 13)
    f.text(x0, 100, 'bucket: 418,600 J', 't', 'start', 13)
    f.rect(x0, 108, 200, 22, 'bar-e', rx=2)
    f.text(x0, 170, 'spoonful: 1,256 J', 't', 'start', 13)
    f.line(x0, 178, x0, 200, 'ln p')
    f.text(x0 + 8, 194, '(a hair’s width)', 't m', 'start', 12)
    f.text(x0, 236, 'both bars to the same scale:', 't m', 'start', 12)
    f.text(x0, 252, 'the spoon’s is 333 times shorter', 't m', 'start', 12)
    return f.svg()


@figure
def c8_conduction():
    f = Fig(640, 340, 'Two close-ups of a warm hand touching a surface: on steel the energy handed across the boundary is '
                      'passed on quickly into the metal; on wood it stays near the surface, which warms. Below, a scale of '
                      'thermal conductivities from air to aluminium')
    def panel(x0, title, deep):
        # hand (warmer) above, surface below
        f.rect(x0, 40, 270, 70, 'wash-p', rx=0)
        f.rect(x0, 110, 270, 100, 'wash-e' if deep else 'wash-n', rx=0)
        f.line(x0, 110, x0 + 270, 110, 'ln')
        f.text(x0 + 8, 58, 'hand, warmer', 't p', 'start', 12)
        f.text(x0 + 8, 200, title, 't', 'start', 12)
        hand = [(x0 + 40 + i * 48, 86 + (8 if i % 2 else 0)) for i in range(5)]
        _particles(f, hand, 'pt-p', 3.6)
        for (x, y), (dx, dy) in zip(hand, ((7, 5), (-7, 5), (6, -6), (8, 3), (-5, 7))):
            _jiggle(f, x, y, dx, dy)
        surf = [(x0 + 30 + i * 30, 130 + (6 if i % 2 else 0)) for i in range(8)]
        _particles(f, surf, 'pt-e' if deep else 'pt-n', 3.4)
        deeper = [(x0 + 45 + i * 30, 164 + (6 if i % 2 else 0)) for i in range(7)]
        _particles(f, deeper, 'pt-e' if deep else 'pt-n', 3.4)
        if deep:
            for xx in (x0 + 60, x0 + 135, x0 + 210):
                f.arrow(xx, 114, xx, 190, 'ink')
            f.text(x0 + 135, 230, 'energy passed on fast; surface stays cool', 't m', 'middle', 12)
            f.text(x0 + 135, 246, 'so the hand keeps losing energy', 't m', 'middle', 12)
        else:
            for xx in (x0 + 60, x0 + 135, x0 + 210):
                f.arrow(xx, 114, xx, 138, 'ink', dash=True)
            f.text(x0 + 135, 230, 'energy passed on slowly; surface warms', 't m', 'middle', 12)
            f.text(x0 + 135, 246, 'so the flow from the hand dies down', 't m', 'middle', 12)
    panel(20, 'steel at room temperature', True)
    panel(350, 'wood at room temperature', False)
    f.text(155, 28, 'steel', 't b', 'middle', 14)
    f.text(485, 28, 'wood', 't b', 'middle', 14)
    # conductivity ruler (logarithmic: 0.01 to 1000 W/(m·K) across 540 px)
    rx0, ry = 60, 300
    f.line(rx0, ry, rx0 + 540, ry, 'ax')
    for k in range(6):
        x = rx0 + k * 108
        f.line(x, ry - 5, x, ry + 5, 'ax')
        f.text(x, ry + 20, ['0.01', '0.1', '1', '10', '100', '1000'][k], 't m', 'middle', 12)
    f.text(600, ry + 36, 'how fast it conducts, W/(m·K): each step is ×10', 't m', 'end', 12)
    marks = [('air 0.023', 0.023, -1), ('wool 0.04', 0.04, 1), ('wood 0.1', 0.12, -1), ('water 0.6', 0.6, 1),
             ('stainless 14', 14, -1), ('steel 80', 80, 1), ('aluminium 220', 220, -1)]
    for lab, k, side in marks:
        x = rx0 + (math.log10(k) + 2) * 108
        f.circle(x, ry, 4, 'fill-ink')
        yy = ry - 12 if side < 0 else ry - 26
        f.text(x, yy, lab, 't', 'middle', 12)
    return f.svg()


@figure
def c8_sweater():
    f = Fig(640, 280, 'A sweater in cross-section between skin and a cooler room: wool fibres trap pockets of air, and '
                      'energy leaks through slowly. At the right, two ice cubes after an hour: the wrapped one is still a cube, '
                      'the bare one a puddle')
    # skin, sweater, room
    f.rect(30, 40, 60, 190, 'wash-p', rx=0)
    f.rect(90, 40, 250, 190, 'wash-n', rx=0)
    f.rect(340, 40, 70, 190, 'wash-e', rx=0)
    f.line(90, 40, 90, 230, 'ln')
    f.line(340, 40, 340, 230, 'ln')
    f.text(60, 60, 'skin', 't p b', 'middle', 13)
    f.text(60, 78, '37 °C', 't p', 'middle', 13)
    f.text(375, 60, 'room', 't e b', 'middle', 13)
    f.text(375, 78, 'cooler', 't e', 'middle', 13)
    f.text(215, 60, 'the sweater', 't b', 'middle', 13)
    # fibres: wavy lines
    rnd = [0.0, 1.1, 2.3, 0.6, 1.8, 2.9, 0.3, 1.5]
    for i in range(8):
        y = 92 + i * 17
        f.wave(96, y, 238, 5, 46, phase=rnd[i], cls='ln nn')
    # air pockets
    for (x, y) in ((150, 118), (250, 152), (190, 186), (290, 110), (120, 170), (270, 196)):
        f.circle(x, y, 9, 'fill-sheet')
        f.circle(x, y, 9, 'ln dash')
    f.text(215, 246, 'air trapped in pockets too small to flow', 't m', 'middle', 12)
    f.text(215, 262, 'still air conducts at 0.023: a very poor conductor', 't m', 'middle', 12)
    # leak arrows: a few short dashed arrows across the sweater
    for y in (128, 160, 192):
        f.arrow(100, y, 330, y, 'muted', dash=True)
    f.text(215, 84, 'energy leaks out, slowly', 't m', 'middle', 12)
    # the two ice cubes
    f.text(530, 60, 'after an hour', 't b', 'middle', 13)
    # wrapped
    f.path('M452,120 Q450,92 480,94 Q500,80 522,96 Q548,92 546,124 Q552,150 524,150 Q500,162 476,150 Q450,150 452,120 Z', 'wash-n')
    f.path('M452,120 Q450,92 480,94 Q500,80 522,96 Q548,92 546,124 Q552,150 524,150 Q500,162 476,150 Q450,150 452,120 Z', 'ln nn')
    f.rect(486, 108, 28, 28, 'glass', rx=3)
    f.text(500, 174, 'wrapped: still a cube', 't', 'middle', 12)
    # bare
    f.path('M470,228 Q500,214 530,228 Q540,236 500,238 Q460,236 470,228 Z', 'water')
    f.rect(493, 212, 14, 14, 'glass', rx=2)
    f.text(500, 258, 'bare: nearly gone', 't', 'middle', 12)
    return f.svg()


@figure
def c8_heating_curve():
    f = Fig(640, 340, 'Heating curve for one kilogram of ice from −20 °C to steam, drawn to scale: a short rise, a flat '
                      'stretch at 0 °C while 334 kJ melt the ice, a rise to 100 °C, and a very long flat stretch while '
                      '2256 kJ boil the water')
    x0, y0, w, h = 70, 280, 540, 220
    total = 41.8 + 334 + 418.6 + 2256          # kJ, from 2090×20, 334e3, 4186×100, 2256e3
    px = w / total
    def X(kj): return x0 + kj * px
    def Y(t): return y0 - (t + 20) * (h / 140)
    f.axis(x0, y0, w, h, 'energy added (kJ)', 'temperature (°C)',
           ticks={'x': [(500 * px * k, str(500 * k)) for k in range(1, 7)],
                  'y': [(Y(-20) - Y(-20), '−20'), (Y(-20) - Y(0), '0'), (Y(-20) - Y(100), '100')]})
    pts = [(X(0), Y(-20)), (X(41.8), Y(0)), (X(375.8), Y(0)), (X(794.4), Y(100)), (X(total), Y(100))]
    d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    f.path(d, 'ln e')
    # labels, each with a leader line so none sits on the axes
    f.line(X(21), Y(-10), X(420), Y(-12), 'ln m')
    f.text(X(430), Y(-12) + 4, 'ice warms from −20 to 0 °C: 42 kJ', 't m', 'start', 12)
    f.line(X(210), Y(0), X(520), Y(28), 'ln m')
    f.text(X(530), Y(28) + 4, 'melting at 0 °C: 334 kJ, no temperature change', 't m', 'start', 12)
    f.line(X(600), Y(55), X(980), Y(55), 'ln m')
    f.text(X(990), Y(55) + 4, 'water warms from 0 to 100 °C: 419 kJ', 't m', 'start', 12)
    f.bracket_label(X(794.4), X(total), Y(100) - 8, 'boiling at 100 °C: 2256 kJ, no temperature change', 12, up=True)
    f.text(X(1900), Y(100) + 24, 'the hidden heat: energy goes in, the thermometer does not move', 't b', 'middle', 12)
    return f.svg()


@figure
def c8_matka():
    f = Fig(640, 320, 'A matka in cross-section: water inside a porous clay wall, droplets seeping to the outer surface and '
                      'particles escaping from it as vapour, with energy leaving the water. At the right, a close-up of a water '
                      'surface where the fastest particles leave')
    # pot: a neck, then an elliptical body; the wall is the band between the outer and inner ellipses
    cx, cy = 200, 190
    f.rect(164, 84, 72, 40, 'wash-n', rx=4)
    f.line(164, 84, 164, 124, 'ln'); f.line(236, 84, 236, 124, 'ln')
    f.line(156, 84, 244, 84, 'ln')
    f.path(f'M{cx-112},{cy} A112,100 0 1 0 {cx+112},{cy} A112,100 0 1 0 {cx-112},{cy} Z', 'wash-n')
    f.path(f'M{cx-94},{cy} A94,82 0 1 0 {cx+94},{cy} A94,82 0 1 0 {cx-94},{cy} Z', 'water')
    f.path(f'M{cx-112},{cy} A112,100 0 1 0 {cx+112},{cy} A112,100 0 1 0 {cx-112},{cy} Z', 'ln')
    f.path(f'M{cx-94},{cy} A94,82 0 1 0 {cx+94},{cy} A94,82 0 1 0 {cx-94},{cy} Z', 'ln m')
    f.rect(176, 100, 48, 30, 'water', rx=0)
    f.text(cx, cy - 4, 'water inside', 't e b', 'middle', 13)
    f.text(cx, cy + 16, 'cooler than the air', 't e', 'middle', 13)
    # pores in the clay wall: small dots along the middle of the wall
    for ang in range(0, 360, 14):
        a = math.radians(ang)
        f.circle(cx + 103 * math.cos(a), cy + 91 * math.sin(a), 1.5, 'fill-ink')
    # droplets on the outside and escaping particles
    drops = [(82, 170), (76, 214), (94, 256), (318, 170), (324, 214), (306, 256)]
    for (x, y) in drops:
        f.circle(x, y, 4.5, 'water')
    esc = [(56, 160), (46, 206), (58, 252), (344, 160), (354, 206), (342, 252)]
    for (x, y), (dx, dy) in zip(esc, ((-14, -12), (-18, -2), (-14, 10), (14, -12), (18, -2), (14, 10))):
        f.circle(x, y, 3, 'pt-e')
        f.arrow(x, y, x + dx, y + dy, 'electron')
    f.text(20, 60, 'water seeps through', 't m', 'start', 12)
    f.text(20, 74, 'pores in the clay…', 't m', 'start', 12)
    f.text(250, 60, '…and evaporates from', 't m', 'start', 12)
    f.text(250, 74, 'the outside surface', 't m', 'start', 12)
    f.text(cx, 310, 'each escaping particle carries energy away from the pot', 't b', 'middle', 12)
    # close-up panel: a liquid surface where the fastest leave
    f.rect(430, 130, 196, 150, 'plate', rx=6)
    f.text(528, 150, 'close-up of the wet surface', 't b', 'middle', 12)
    f.path('M438,214 Q460,208 482,214 T526,214 T570,214 T618,214 L618,272 L438,272 Z', 'water')
    slow = [(452, 236), (476, 254), (502, 240), (528, 258), (556, 236), (584, 254), (466, 266), (542, 268), (604, 240)]
    _particles(f, slow, 'pt-e', 3)
    for (x, y) in slow:
        _jiggle(f, x, y, 3, 2)
    fast = [(490, 200), (560, 198)]
    for (x, y), (dx, dy) in zip(fast, ((5, -18), (-4, -20))):
        f.circle(x, y, 3.2, 'pt-p')
        f.arrow(x, y, x + dx, y + dy, 'proton')
    f.text(528, 168, 'the fastest escape', 't p', 'middle', 12)
    f.text(528, 294, 'the rest are slower on average', 't m', 'middle', 12)
    f.text(528, 308, 'so the water is cooler', 't m', 'middle', 12)
    return f.svg()


@figure
def c8_sea_breeze():
    f = Fig(640, 304, 'The sea breeze by day: the Sun warms land and sea equally, the land gets hotter, warm air over the '
                      'land is pushed up by denser air, cooler air flows in from the sea along the ground, and the loop '
                      'closes high up')
    # sun, with short rays, and no long rays crossing the labels
    f.circle(320, 34, 14, 'ln nn')
    for ang in range(0, 360, 45):
        a = math.radians(ang)
        f.line(320 + 19 * math.cos(a), 34 + 19 * math.sin(a), 320 + 28 * math.cos(a), 34 + 28 * math.sin(a), 'ln nn')
    f.text(320, 76, 'the same sunshine falls on both', 't m', 'middle', 12)
    # land and sea
    f.rect(20, 200, 300, 60, 'wash-n', rx=0)
    f.ground(20, 200, 300)
    f.rect(320, 200, 300, 60, 'water', rx=0)
    f.text(170, 240, 'land (Marine Drive): warms fast', 't b', 'middle', 13)
    f.text(170, 258, 'sand needs about 800 J per kg per °C', 't m', 'middle', 12)
    f.text(470, 240, 'Arabian Sea: warms slowly', 't b', 'middle', 13)
    f.text(470, 258, 'water needs 4186 J per kg per °C', 't m', 'middle', 12)
    # the loop
    f.arrow(110, 190, 110, 112, 'ink', width=2)
    f.text(122, 146, 'warm air, less dense,', 't', 'start', 12)
    f.text(122, 160, 'is pushed up by the', 't', 'start', 12)
    f.text(122, 174, 'denser air around it', 't', 'start', 12)
    f.arrow(120, 104, 500, 104, 'muted', dash=True)
    f.text(315, 96, 'high up, air drifts out to sea', 't m', 'middle', 12)
    f.arrow(520, 112, 520, 184, 'muted', dash=True)
    f.text(532, 150, 'cooler air sinks', 't m', 'start', 12)
    f.arrow(500, 192, 140, 192, 'vector')
    f.text(320, 215, 'cooler sea air flows in along the ground', 't e b', 'middle', 12)
    f.text(320, 291, 'at night the land cools faster than the sea, and the whole loop runs the other way', 't m', 'middle', 12)
    return f.svg()
