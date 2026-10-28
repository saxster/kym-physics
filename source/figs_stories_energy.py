"""Figures for the stories in the energy and tools groups. All drawings are ours. Numbers come from grounding/ch00.md,
ch01.md, ch03.md, ch07.md and ch08.md and were recomputed with python3 -I (see provenance/stories_energy.yml)."""
import math
from figs_core import Fig, figure


def _ball(f, x, y, r=12):
    f.circle(x, y, r, 'block')
    f.circle(x, y, r, 'ln')


# ---------------------------------------------------------------- vis-viva
@figure
def s_clay_dents():
    f = Fig(640, 320, 'Two brass balls above two trays of clay. The left ball falls from a small height and leaves a shallow '
                      'dent; the right ball falls from four times that height, arrives at twice the speed, and leaves a dent '
                      'about four times as deep. The dents are drawn in the ratio one to four.')
    surf, bottom = 200, 270
    for x0, bx, h_px, dent, title, sub, dlab in (
            (40, 170, 30, 10, 'from a height h', 'arrives at speed v', 'dent about d'),
            (340, 470, 120, 40, 'from four times the height, 4h', 'arrives at twice the speed, 2v', 'dent about 4d')):
        # tray of clay
        f.rect(x0, surf, 260, bottom - surf, 'wash-n', rx=0)
        f.line(x0, surf, x0 + 260, surf, 'ln')
        f.line(x0, bottom, x0 + 260, bottom, 'ln')
        f.line(x0, surf, x0, bottom, 'ln')
        f.line(x0 + 260, surf, x0 + 260, bottom, 'ln')
        # the dent: a hollow in the surface
        f.path(f'M{bx - 22},{surf} Q{bx},{surf + 2.4 * dent} {bx + 22},{surf} Z', 'fill-sheet')
        f.path(f'M{bx - 22},{surf} Q{bx},{surf + 2.4 * dent} {bx + 22},{surf}', 'ln')
        # the ball before it falls, and its drop
        _ball(f, bx, surf - h_px - 12)
        f.vector(bx + 30, surf - h_px - 4, 0, h_px, '', kind='muted', dash=True)
        f.text(bx + 40, surf - h_px / 2 + 4, 'h' if h_px == 30 else '4h', 't m', 'start', 13)
        f.text(x0 + 130, 36, title, 't b', 'middle', 14)
        f.text(x0 + 130, 54, sub, 't m', 'middle', 13)
        # depth marker beside the dent
        f.line(bx + 36, surf, bx + 36, surf + dent, 'ln e')
        f.line(bx + 32, surf, bx + 40, surf, 'ln e')
        f.line(bx + 32, surf + dent, bx + 40, surf + dent, 'ln e')
        f.text(bx + 50, surf + dent / 2 + 5, dlab, 't e b', 'start', 13)
        f.text(x0 + 130, bottom + 22, 'soft clay', 't m', 'middle', 12)
    f.text(320, 310, 'with our heights, 25 cm and 1 m: speeds of 2.2 m/s and 4.4 m/s at the clay', 't m', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- conservation
@figure
def s_energy_bars():
    f = Fig(640, 340, 'Four stacked bars of equal total height for a dropped ball: at the top all gravitational; halfway '
                      'down half gravitational and half kinetic; at the floor all kinetic; at the top of the first bounce '
                      '69 units gravitational and 31 units spread into the surroundings through heating and sound. A dashed line marks the unchanging total.')
    cols = [('at the top', [100, 0, 0]), ('halfway down', [50, 50, 0]),
            ('at the floor', [0, 100, 0]), ('top of first bounce', [69, 0, 31])]
    names = ['gravitational', 'kinetic', 'spread out']
    fills = ['bar-e', 'bar-p', 'bar-n']
    y0, scale, w = 262, 1.6, 100
    for k, (title, vals) in enumerate(cols):
        x = 50 + k * 140
        y = y0
        for v, name, fill in zip(vals, names, fills):
            if v == 0:
                continue
            hgt = v * scale
            f.rect(x, y - hgt, w, hgt, fill, rx=0)
            f.rect(x, y - hgt, w, hgt, 'ln', rx=0, extra='fill="none"')
            if hgt >= 34:
                f.text(x + w / 2, y - hgt / 2 - 2, name, 't bar-label', 'middle', 12)
                f.text(x + w / 2, y - hgt / 2 + 13, str(v), 't b bar-label', 'middle', 12)
            else:
                f.text(x + w / 2, y - hgt / 2 + 4, f'{name} {v}', 't bar-label', 'middle', 12)
            y -= hgt
        f.text(x + w / 2, y0 + 20, title, 't b', 'middle', 13)
    f.line(40, y0 - 100 * scale, 610, y0 - 100 * scale, 'ln dash')
    f.text(325, y0 - 100 * scale - 10, 'the total: 100 units in every column', 't m', 'middle', 13)
    f.line(40, y0, 610, y0, 'ln')
    f.text(325, 318, 'made-up numbers for a model; the bounce keeps about 70% of the height', 't m', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- caloric
@figure
def s_rumford():
    f = Fig(640, 320, 'Rumford’s experiment in outline: a brass cannon barrel lies horizontally and is turned by horses; '
                      'a blunt steel borer presses into its end, which sits inside a wooden box full of water with a '
                      'thermometer. A timeline underneath runs from the start to the boiling point at two and a half hours.')
    # wooden box of water round the left end of the barrel
    f.rect(70, 70, 190, 160, 'plate', rx=4)
    f.rect(78, 110, 174, 112, 'water', rx=2)
    f.text(165, 58, 'wooden box of cold water', 't m', 'middle', 12)
    # barrel: a long cylinder, its left end inside the box
    f.rect(150, 120, 330, 70, 'block', rx=10)
    f.line(150, 155, 480, 155, 'ln m dash')
    f.text(330, 110, 'brass barrel, turning', 't b', 'middle', 13)
    f.curved_arrow(330, 212, 330, 100, bend=-60, kind='ink')
    f.text(348, 230, 'turned by horses walking in a circle', 't', 'start', 12)
    # borer pressed into the end from the left
    f.rect(90, 146, 70, 18, 'fill-sheet', rx=2)
    f.rect(90, 146, 70, 18, 'ln', rx=2, extra='fill="none"')
    f.rect(84, 136, 10, 38, 'fill-ink', rx=1)
    f.force(52, 155, 36, 0, '', 12)
    f.text(48, 150, 'pressed', 't p b', 'end', 12)
    f.text(48, 164, 'on', 't p b', 'end', 12)
    f.text(112, 204, 'blunt steel borer', 't', 'middle', 12)
    # thermometer standing in the water
    f.rect(226, 76, 10, 120, 'glass', rx=5)
    f.rect(228, 150, 6, 44, 'bar-p', rx=2)
    f.circle(231, 200, 8, 'bar-p')
    f.text(246, 84, 'thermometer', 't m', 'start', 12)
    f.text(470, 70, 'no fire anywhere', 't b', 'end', 13)
    # timeline
    tx0, ty = 70, 268
    f.line(tx0, ty, tx0 + 500, ty, 'ax')
    for k, lab in ((0, '0 h'), (1, '1 h'), (2, '2 h'), (2.5, '2 h 30 min')):
        x = tx0 + k * 200
        f.line(x, ty - 5, x, ty + 5, 'ax')
        f.text(x, ty + 20, lab, 't m', 'middle', 12)
    f.text(tx0, ty - 12, 'cold water', 't', 'start', 12)
    f.text(tx0 + 500, ty - 12, 'the water boils', 't b', 'end', 12)
    f.text(tx0 + 250, ty + 40, 'warming the whole time, with no sign of the brass running dry', 't m', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- matka
@figure
def s_wetbulb():
    f = Fig(640, 378, 'Three paired-dot comparisons on a shared Celsius axis show the potential evaporative temperature drop. Mumbai May: air 34.3 and wet bulb 28.7; Mumbai July: 29.4 and 26.7; dry inland air: 38 and 21.3. Dots are temperatures, not bars representing ratios above absolute zero. Conditions are illustrative and wet-bulb values are computed.')
    f.text(24,28,'Humidity sets how far evaporation can cool','t b',size=17)
    x0=265;scale=13
    def X(t):return x0+(t-20)*scale
    for yy,title,sub,ta,tw in ((99,'Mumbai, May','65% humidity',34.3,28.7),(177,'Mumbai, July','81% humidity',29.4,26.7),(255,'Dry inland air','20% humidity',38,21.3)):
        f.text(24,yy-2,title,'t b',size=14);f.text(24,yy+19,sub,'t m',size=12)
        f.line(X(20),yy,X(40),yy,'ln r')
        f.line(X(tw),yy,X(ta),yy,'ln',extra='stroke-width="3"')
        f.circle(X(ta),yy,6,'bar-p');f.circle(X(tw),yy,6,'bar-e')
        f.text(X(ta),yy-14,f'{ta:g} °C','t p b','middle',12)
        f.text(X(tw),yy+25,f'{tw:g} °C','t e b','middle',12)
        f.text(616,yy+4,f'−{ta-tw:.1f}°','t b','end',14)
    f.axis(X(20),300,X(40)-X(20),0,'temperature (°C)','',ticks={'x':[(scale*(t-20),str(t)) for t in (20,25,30,35,40)]})
    f.text(24,306,'red: air','t p',size=12);f.text(24,326,'blue: wet surface','t e',size=12)
    f.text(320,371,'Illustrative air conditions; wet-bulb limits computed from temperature and humidity.','t m','middle',12)
    return f.svg()


# ---------------------------------------------------------------- monsoon
@figure
def s_monsoon_two_ideas():
    f = Fig(640, 330, 'Two schematic panels. Left, Halley’s idea: a land mass is hotter than the ocean in summer, so moist '
                      'air flows in from the sea and the loop reverses in winter. Right, the 2021 challenge: a band of rain '
                      'that circles the Earth near the equator in January sits over the land in July.')
    # ---- left panel: Halley
    f.text(160, 28, 'Halley’s idea, 1686', 't b', 'middle', 14)
    f.text(160, 46, 'a sea breeze the size of a continent', 't m', 'middle', 12)
    f.rect(30, 60, 260, 230, 'water', rx=6)
    f.path('M90,60 Q60,120 110,170 Q150,215 200,185 Q250,150 240,100 Q235,70 230,60 Z', 'wash-n')
    f.path('M90,60 Q60,120 110,170 Q150,215 200,185 Q250,150 240,100 Q235,70 230,60', 'ln')
    f.text(165, 120, 'land', 't b', 'middle', 13)
    f.text(165, 138, 'hotter in summer', 't m', 'middle', 12)
    f.text(170, 262, 'ocean', 't b', 'start', 13)
    f.text(170, 278, 'warms and cools slowly', 't m', 'start', 12)
    for (x1, y1, x2, y2) in ((62, 236, 104, 186), (132, 244, 158, 208), (238, 236, 212, 196)):
        f.arrow(x1, y1, x2, y2, 'vector', width=2)
    f.text(40, 262, 'summer: moist air', 't e b', 'start', 12)
    f.text(40, 277, 'flows in off the sea', 't e', 'start', 12)
    f.arrow(230, 80, 275, 125, 'muted', dash=True)
    f.text(284, 150, 'winter:', 't m', 'end', 12)
    f.text(284, 164, 'dry air', 't m', 'end', 12)
    f.text(284, 178, 'flows out', 't m', 'end', 12)
    # ---- right panel: the rain band
    f.text(480, 28, 'The challenge, 2021', 't b', 'middle', 14)
    f.text(480, 46, 'a band of rain that moves north and south', 't m', 'middle', 12)
    f.rect(350, 60, 260, 230, 'water', rx=6)
    f.path('M410,60 Q380,120 430,170 Q470,215 520,185 Q570,150 560,100 Q555,70 550,60 Z', 'wash-n')
    f.path('M410,60 Q380,120 430,170 Q470,215 520,185 Q570,150 560,100 Q555,70 550,60', 'ln')
    f.text(485, 100, 'land', 't b', 'middle', 13)
    f.line(350, 270, 610, 270, 'ln dash')
    f.text(604, 284, 'equator', 't m', 'end', 12)
    # January band near the equator; July band over the land
    f.rect(352, 226, 256, 38, 'wash-e', rx=4)
    f.text(480, 250, 'rain band in January', 't e b', 'middle', 12)
    f.rect(352, 128, 256, 38, 'wash-e', rx=4)
    f.text(480, 152, 'the same band in July: over the land', 't e b', 'middle', 12)
    f.arrow(600, 222, 600, 172, 'ink', width=2)
    f.text(596, 200, 'moves north', 't', 'end', 12)
    f.text(320, 314, 'both panels are schematic: real coastlines and winds are far more complicated', 't m', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- motion-graphs
@figure
def s_walk_graphs():
    f = Fig(640, 400, 'Two graphs of the same walk, one above the other. The distance–time graph rises 4 metres in the first '
                      '4 seconds, stays flat for 2 seconds, then rises 4 metres in 2 seconds. The velocity–time graph below '
                      'shows 1 metre per second, then zero, then 2 metres per second, with the areas under the steps labelled '
                      '4 m, 0 and 4 m.')
    x0, w = 90, 480
    px = w / 8.0                                  # pixels per second
    # ---- distance–time
    y1, h1 = 170, 128
    pm = h1 / 8.0                                 # pixels per metre
    f.axis(x0, y1, w, h1, 'time (s)', 'distance walked (m)',
           ticks={'x': [(px * t, str(t)) for t in (2, 4, 6, 8)], 'y': [(pm * d, str(d)) for d in (2, 4, 6, 8)]})
    pts = [(0, 0), (4, 4), (6, 4), (8, 8)]
    P = [(x0 + t * px, y1 - d * pm) for t, d in pts]
    f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in P), 'ln e')
    for x, y in P[1:]:
        f.circle(x, y, 3.5, 'fill-ink')
    f.text(x0 + 1.6 * px, y1 - 12, 'slope 4 m ÷ 4 s = 1 m/s', 't e b', 'start', 12)
    f.text(x0 + 5 * px, y1 - 4 * pm - 12, 'flat: stopped', 't e b', 'middle', 12)
    f.text(x0 + 7.9 * px, y1 - 8 * pm - 12, 'steeper: 4 m ÷ 2 s = 2 m/s', 't e b', 'end', 12)
    # ---- velocity–time
    y2, h2 = 350, 110
    pv = h2 / 2.4                                 # pixels per m/s
    f.axis(x0, y2, w, h2, 'time (s)', 'velocity (m/s)',
           ticks={'x': [(px * t, str(t)) for t in (2, 4, 6, 8)], 'y': [(pv * v, str(v)) for v in (1, 2)]})
    f.rect(x0, y2 - pv, 4 * px, pv, 'wash-e', rx=0)
    f.rect(x0 + 6 * px, y2 - 2 * pv, 2 * px, 2 * pv, 'wash-e', rx=0)
    steps = [(0, 1), (4, 1), (4, 0), (6, 0), (6, 2), (8, 2)]
    S = [(x0 + t * px, y2 - v * pv) for t, v in steps]
    f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in S), 'ln e')
    f.text(x0 + 2 * px, y2 - pv / 2 + 4, 'area = 1 m/s × 4 s = 4 m', 't', 'middle', 12)
    f.text(x0 + 5 * px, y2 - 14, 'area 0', 't m', 'middle', 12)
    f.text(x0 + 7 * px, y2 - pv - 2, 'area = 2 m/s × 2 s', 't', 'middle', 12)
    f.text(x0 + 7 * px, y2 - pv + 14, '= 4 m', 't', 'middle', 12)
    # connectors between the graphs
    for t in (4, 6):
        f.line(x0 + t * px, y1, x0 + t * px, y2 - h2 - 6, 'ln m dash')
    f.text(x0 + w, y2 - h2 - 10, 'total distance = 4 + 0 + 4 = 8 m, the last point on the top graph', 't m', 'end', 12)
    return f.svg()


# ---------------------------------------------------------------- vectors
@figure
def s_vectors():
    f = Fig(640, 320, 'Left: a tug-of-war rope with four children pulling left (120, 100, 90 and 80 newtons, total 390) and '
                      'three pulling right (150, 130 and 110 newtons, total 390), so the net force is zero. Right: a boat '
                      'heading straight across a river at 3 metres per second while the current carries it along at 4 '
                      'metres per second; the two arrows add head to tail to a resultant of 5 metres per second at about '
                      '37 degrees to the bank.')
    # ---- tug of war
    f.text(160, 28, 'Adding along a line', 't b', 'middle', 14)
    f.line(40, 150, 280, 150, 'ln', 'stroke-width="3"')
    f.circle(160, 150, 5, 'fill-ink')
    f.force(160, 150, -117, 0, '', 12)
    f.force(160, 150, 117, 0, '', 12)
    f.text(100, 134, '390 N left', 't p b', 'middle', 13)
    f.text(220, 134, '390 N right', 't p b', 'middle', 13)
    f.text(100, 180, '120 + 100 + 90 + 80', 't m', 'middle', 12)
    f.text(220, 180, '150 + 130 + 110', 't m', 'middle', 12)
    f.text(160, 212, 'net force on the rope: 390 − 390 = 0', 't b', 'middle', 13)
    f.text(160, 232, 'so its motion does not change', 't m', 'middle', 12)
    f.text(160, 262, 'arrows along one line: add the ones pointing', 't m', 'middle', 12)
    f.text(160, 278, 'one way, subtract the ones pointing the other', 't m', 'middle', 12)
    # ---- boat crossing a river
    f.text(480, 28, 'Adding at an angle', 't b', 'middle', 14)
    f.rect(340, 60, 280, 200, 'water', rx=0)
    f.line(340, 60, 620, 60, 'ln')
    f.line(340, 260, 620, 260, 'ln')
    f.text(346, 76, 'far bank', 't m', 'start', 12)
    f.text(346, 276, 'near bank', 't m', 'start', 12)
    for y in (84, 104):
        f.arrow(556, y, 604, y, 'muted', dash=True)
    f.text(604, 76, 'current', 't m', 'end', 12)
    bx, by = 400, 240
    u = 30                                        # pixels per m/s
    f.vector(bx, by, 0, -3 * u, '', 12)
    f.text(bx - 8, by - 1.5 * u + 4, '3 m/s across', 't e', 'end', 12)
    f.vector(bx, by - 3 * u, 4 * u, 0, '', 12, kind='muted', dash=True)
    f.text(bx + 2 * u, by - 3 * u - 8, '4 m/s with the current', 't m', 'middle', 12)
    f.arrow(bx, by, bx + 4 * u, by - 3 * u, 'ink', width=2.5)
    f.text(bx + 2 * u + 14, by - 1.2 * u, 'resultant 5 m/s', 't b', 'start', 13)
    f.text(bx + 2 * u + 14, by - 1.2 * u + 16, 'about 37° to the bank', 't m', 'start', 12)
    f.text(480, 300, 'head to tail: each arrow starts where the last ends', 't m', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- si-units
@figure
def s_unit_chain():
    f = Fig(640, 350, 'Four different quantities shown physically. A newton is force: 1 N accelerates 1 kg at 1 metre per second squared. A joule is energy transferred: about 1 J lifts 1 kg by 10 cm near Earth. A watt is rate: 1 J every second. A kilowatt-hour is an amount of energy: 1000 W for 3600 seconds equals 3.6 million J.')
    headers=[('newton (N)','a force'),('joule (J)','energy transferred'),('watt (W)','energy each second'),('kilowatt-hour','an amount of energy')]
    for i,(name,kind) in enumerate(headers):
        cx=80+160*i
        if i: f.line(160*i,20,160*i,310,'ln r')
        f.text(cx,33,name,'t b','middle',15)
        f.text(cx,57,kind,'t m','middle',12)
    f.cart(49,151,75,20,label='1 kg')
    f.ground(26,190,112)
    f.force(14,160,30,0)
    f.text(28,144,'1 N','t p b','middle',13)
    f.vector(62,106,46,0)
    f.text(84,89,'1 m/s²','t e','middle',13)
    f.lines(80,232,['1 kg gains 1 m/s','of speed each second.'],'t','middle',12,lh=1.6)
    # Lift, with the displacement bracket attached to the mass's two positions.
    f.mass_block(217,166,45,32,'1 kg',12)
    f.rect(217,104,45,32,'ln m dash',rx=3)
    f.arrow(240,159,240,137,'ink')
    f.path('M276,120 L284,120 L284,182 L276,182','ln m')
    f.text(294,154,'10','t m',size=12)
    f.text(294,170,'cm','t m',size=12)
    f.lines(240,232,['≈ 1 J lifts 1 kg','through 10 cm.'],'t','middle',12,lh=1.6)
    # An amount per time, rather than an arrow that turns joules into watts.
    f.circle(400,147,36,'block')
    f.line(400,147,400,122,'ln')
    f.line(400,147,419,155,'ln')
    f.text(400,111,'1 s','t b','middle',13)
    f.text(400,199,'1 J each tick','t e b','middle',13)
    f.lines(400,232,['1 W transfers','1 J every second.'],'t','middle',12,lh=1.6)
    # A heater is recognisable by its coil. This is accounting, not a build instruction.
    f.rect(522,115,76,77,'block',rx=5)
    f.spring(535,147,585,147,coils=5,width=12,cls='ln nn')
    f.text(560,179,'1,000 W','t b','middle',13)
    f.lines(560,232,['run for 1 hour:','3,600,000 J'],'t','middle',12,lh=1.6)
    f.text(320,310,'Force, energy and rate answer different questions.','t b','middle',15)
    f.text(320,337,'All these units are built from metres, kilograms and seconds.','t m','middle',13)
    return f.svg()


# ---------------------------------------------------------------- engines
@figure
def s_engine_fall():
    f = Fig(640, 360, 'Carnot’s hot-to-cold heat-engine picture, with an explicitly illustrative energy-flow account. Of each 100 joules entering from a hot source, 17 joules become useful work and 83 joules pass to colder surroundings. At the split the two ribbon widths add to the input width; energy is conserved and the remaining heat is not destroyed.')
    f.text(24,28,'A heat engine needs somewhere colder to send energy','t b',size=16)
    f.rect(30,67,170,56,'wash-p',rx=6)
    f.lines(115,90,['hot source','boiler + steam'],'t p b','middle',13)
    f.circle(115,183,30,'block')
    for a in range(0,360,60):
        a=math.radians(a);f.line(115,183,115+26*math.cos(a),183+26*math.sin(a),'ln m')
    f.arrow(115,124,115,149,'ink')
    f.arrow(115,214,115,259,'ink')
    f.rect(30,268,170,48,'wash-e',rx=6)
    f.text(115,288,'cold surroundings','t e b','middle',13)
    f.text(115,307,'air + cooling water','t m','middle',12)
    f.arrow(149,183,197,183,'proton');f.text(166,166,'work','t p b','middle',12)
    # One input of width100 splits into17+83. No zero-based truncated bars.
    f.text(267,81,'100 J supplied','t b',size=14)
    f.path('M267,104 H375 V204 H267 Z','wash-n');f.path('M267,104 H375 V204 H267 Z','ln')
    f.path('M375,104 H552 L577,112.5 L552,121 H375 Z','wash-p');f.path('M375,104 H552 L577,112.5 L552,121 H375','ln')
    f.text(450,95,'17 J: useful work','t p b','middle',13)
    f.path('M375,121 H458 V276 L416.5,301 L375,276 Z','wash-e');f.path('M375,121 H458 V276 L416.5,301 L375,276 Z','ln')
    f.text(481,220,'83 J to','t e b',size=13);f.text(481,239,'colder places','t e',size=12)
    f.text(320,342,'Illustrative engine: 100 J = 17 J + 83 J. The flow widths share one scale.','t m','middle',12)
    return f.svg()


# ---------------------------------------------------------------- proportion
@figure
def s_torch_patch():
    """Face-on patches make the inverse-square law visible as countable equal-area squares."""
    f = Fig(640, 390, 'The same spreading beam meets a screen at one, two or three metres. Seen face-on, '
                      'the lit patches are one by one, two by two and three by three equal squares: areas of '
                      'one, four and nine squares. The same light is shared over each whole patch, so one '
                      'square receives one, one quarter or one ninth as much light. A small side view shows '
                      'the common source and the increasing beam width. This is an ideal spreading beam.')
    f.text(320, 25, 'The same light, shared over more squares', 't b', 'middle', 17)
    cell, cy = 34, 133
    for cx, n, share in ((108, 1, 'all the light'), (320, 2, '¼ of the light'), (532, 3, '⅑ of the light')):
        f.text(cx, 58, f'{n} m from the source', 't b', 'middle', 15)
        side = n * cell
        x, y = cx - side / 2, cy - side / 2
        f.rect(x, y, side, side, 'bar-n', rx=0, extra=f'opacity="{0.8 / (n * n):.3f}"')
        for k in range(n + 1):
            f.line(x + k * cell, y, x + k * cell, y + side, 'ln nn')
            f.line(x, y + k * cell, x + side, y + k * cell, 'ln nn')
        f.text(cx, 209, f'{n} × {n} = {n * n} square' + ('s' if n > 1 else ''), 't b', 'middle', 15)
        f.text(cx, 234, share + ' in each square', 't nn', 'middle', 13)
    f.line(24, 254, 616, 254, 'ln r')
    # A separate side view establishes distance and the common divergence angle;
    # the three screens are alternative placements, not opaque walls in sequence.
    sx, sy, dx = 94, 315, 150
    f.rect(sx - 48, sy - 9, 32, 18, 'block', rx=4)
    f.path(f'M{sx - 16},{sy - 9} L{sx - 4},{sy - 14} L{sx - 4},{sy + 14} L{sx - 16},{sy + 9} Z', 'plate')
    for sign in (-1, 1):
        f.ray(sx, sy, sx + 3 * dx, sy + sign * 3 * 11, chevrons=2)
    for n in (1, 2, 3):
        x = sx + n * dx
        f.line(x, sy - n * 11, x, sy + n * 11, 'ln m dash')
        f.text(x, 376, f'{n} m', 't m', 'middle', 13)
    f.text(30, 376, 'side view', 't m', 'start', 12)
    f.text(320, 275, 'Move one screen along a spreading beam; view its patch face-on above.', 't m', 'middle', 12)
    return f.svg()
