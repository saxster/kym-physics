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
    f = Fig(640, 360, 'A falling weight turns a drum and shaft whose paddles stir water inside a vessel. The thermometer bulb is physically in the water. A magnified thermometer scale shows a tiny temperature rise, not an invented large measured rise. Mechanical work enters the water; the falling weight and the water are linked by the string and shaft.')
    f.text(24,28,'Follow the connection from falling weight to warmer water','t b',size=16)
    f.circle(86,76,17,'block');f.circle(86,76,3,'fill-ink')
    f.path('M69,76 L69,165 M86,59 L307,59','ln')
    f.mass_block(44,165,50,46,'weight',13)
    f.vector(69,224,0,50)
    f.text(69,299,'falls','t e b','middle',14)
    f.rect(295,45,24,28,'block',rx=4)
    f.line(307,73,307,272,'ln',extra='stroke-width="3"')
    f.curved_arrow(341,91,272,91,bend=21)
    f.text(307,129,'shaft turns','t b','middle',13)
    f.path('M215,153 L224,292 L390,292 L399,153','glass')
    f.path('M218,177 L226,289 L388,289 L396,177 Z','water')
    for y in (213,242,267):
        f.path(f'M269,{y+10} L307,{y-3} L345,{y-16}','ln')
    for y in (202,232,262): f.line(239,y,248,y+9,'ln m')
    # Probe is immersed; the scale close-up is linked to this physical bulb.
    f.rect(365,143,8,102,'glass',rx=4);f.circle(369,253,8,'sample-red')
    f.line(369,244,369,185,'ln p')
    f.circle(369,184,14,'ln e')
    f.line(381,176,456,93,'ln m');f.line(383,190,456,267,'ln m')
    f.rect(456,64,164,228,'plate',rx=7)
    f.text(538,88,'Magnified rise','t b','middle',14)
    f.rect(482,111,13,137,'glass',rx=6)
    f.circle(488.5,258,12,'sample-red')
    f.line(488.5,246,488.5,158,'ln p',extra='stroke-width="5"')
    f.line(488.5,158,488.5,146,'ln p dash',extra='stroke-width="5"')
    f.line(501,158,553,158,'ln m dash');f.line(501,146,553,146,'ln p')
    f.lines(512,184,['small rise,','enlarged here'],'t m',size=12)
    f.text(307,317,'paddles do work on the water','t b','middle',14)
    f.text(320,349,'Less energy in the raised weight; more internal energy in the water and apparatus.','t m','middle',12)
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
    f = Fig(640, 390, 'A connected cut-away shows wool fibres holding still air and slowing energy transfer. Matched ice cubes start the same size in the same warmer room. After the same interval, the unwrapped cube has melted more; arrows point into both cold cubes, with a smaller transfer through insulation. The time and remaining sizes are illustrative, not experimental data.')
    f.text(24,28,'Insulation slows energy transfer in either direction','t b',size=16)
    f.text(162,68,'a warm body in a cooler room','t b','middle',13)
    f.rect(35,99,48,151,'wash-p',rx=0)
    f.rect(83,99,156,151,'wash-n',rx=0)
    f.rect(239,99,49,151,'wash-e',rx=0)
    f.text(59,91,'skin','t p','middle',12);f.text(263,91,'room','t e','middle',12)
    f.text(161,91,'wool + still air','t b','middle',12)
    for i in range(7):
        y=116+i*19
        f.path('M87,'+str(y)+' '+' '.join(f'Q{x+8},{y-10} {x+16},{y}' for x in range(87,215,16)),'ln nn')
    for x,y in ((109,145),(164,183),(207,221)):
        f.circle(x,y,9,'fill-sheet')
    f.arrow(42,172,78,172,'proton',width=3)
    f.arrow(91,172,275,172,'proton',width=1.4)
    f.text(161,279,'fibres hold pockets of air','t b','middle',12)
    f.text(161,300,'energy passes through slowly','t m','middle',12)
    f.line(320,54,320,326,'ln r')
    f.text(480,68,'two identical starting ice cubes','t b','middle',13)
    def cube(x,y,s=25):
        f.rect(x-s/2,y-s,s,s,'water',rx=2)
        f.path(f'M{x-s/2},{y-s} l7,-5 h{s} v{s} l-7,5 M{x+s/2},{y-s} l7,-5','ln e')
    for x in (399,555):cube(x,124)
    f.text(399,146,'bare','t','middle',12);f.text(555,146,'wrapped','t','middle',12)
    f.arrow(399,160,399,199,'muted');f.arrow(555,160,555,199,'muted')
    f.text(480,185,'same interval','t m','middle',12)
    f.add('<ellipse cx="399" cy="259" rx="40" ry="8" class="water"/>')
    cube(399,253,10)
    f.rect(515,214,80,64,'wash-n',rx=12)
    f.rect(529,224,52,44,'fill-sheet',rx=6)
    cube(555,259,23)
    for x in (519,589):f.path(f'M{x},227 q8,10 0,20 q-8,10 0,20','ln nn')
    f.arrow(361,215,390,238,'proton',width=3)
    f.arrow(516,205,542,233,'proton',width=1.2)
    f.text(480,308,'Energy enters both from the warmer room.','t b','middle',12)
    f.text(480,329,'The wrapped cube receives it more slowly.','t','middle',12)
    f.text(320,365,'Wool does not supply heat: it slows the transfer. The cube sizes and elapsed time are illustrative.','t m','middle',12)
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
