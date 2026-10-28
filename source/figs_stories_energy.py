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
                      '69 units gravitational and 31 units thermal and sound. A dashed line marks the unchanging total.')
    cols = [('at the top', [100, 0, 0]), ('halfway down', [50, 50, 0]),
            ('at the floor', [0, 100, 0]), ('top of first bounce', [69, 0, 31])]
    names = ['gravitational', 'kinetic', 'thermal + sound']
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
                f.text(x + w / 2, y - hgt / 2 - 2, name, 't', 'middle', 12)
                f.text(x + w / 2, y - hgt / 2 + 13, str(v), 't b', 'middle', 12)
            else:
                f.text(x + w / 2, y - hgt / 2 + 4, f'{name} {v}', 't', 'middle', 12)
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
    f = Fig(640, 340, 'Three pairs of bars on a temperature axis from 15 to 40 degrees. For a Mumbai afternoon in May the '
                      'air is 34.3 degrees and the wet-bulb floor 28.7, a drop of 5.6. For July the air is 29.4 and the '
                      'floor 26.7, a drop of 2.7. For a dry inland town at 38 degrees and 20 percent humidity the floor is '
                      '21.3, a drop of 16.7.')
    x0, y0, h = 70, 250, 200
    px = h / 25.0          # pixels per degree, 15 to 40 °C

    def Y(t):
        return y0 - (t - 15) * px
    f.axis(x0, y0, 540, h, '', 'temperature (°C)',
           ticks={'y': [((t - 15) * px, str(t)) for t in (15, 20, 25, 30, 35, 40)]})
    groups = [(130, 'Mumbai, May afternoon', '34.3 °C, 65% humidity', 34.3, 28.7),
              (320, 'Mumbai, July afternoon', '29.4 °C, 81% humidity', 29.4, 26.7),
              (510, 'a dry inland town', '38 °C, 20% humidity', 38.0, 21.3)]
    for cx, title, sub, ta, tw in groups:
        f.rect(cx - 56, Y(ta), 50, y0 - Y(ta), 'bar-p', rx=0)
        f.rect(cx + 6, Y(tw), 50, y0 - Y(tw), 'bar-e', rx=0)
        f.text(cx - 31, Y(ta) - 6, f'{ta:g}', 't p b', 'middle', 12)
        f.text(cx + 31, Y(tw) - 6, f'{tw:g}', 't e b', 'middle', 12)
        # the drop, as a bracket between the two tops
        f.line(cx + 62, Y(ta), cx + 62, Y(tw), 'ln')
        f.line(cx + 58, Y(ta), cx + 66, Y(ta), 'ln')
        f.line(cx + 58, Y(tw), cx + 66, Y(tw), 'ln')
        f.text(cx + 70, (Y(ta) + Y(tw)) / 2 + 4, f'{ta - tw:.1f} °C', 't b', 'start', 12)
        f.text(cx, y0 + 20, title, 't b', 'middle', 12)
        f.text(cx, y0 + 36, sub, 't m', 'middle', 12)
    # legend
    f.rect(70, 300, 14, 14, 'bar-p', rx=2)
    f.text(90, 311, 'air temperature', 't', 'start', 12)
    f.rect(230, 300, 14, 14, 'bar-e', rx=2)
    f.text(250, 311, 'the floor: lowest a wet surface can reach (wet-bulb temperature)', 't', 'start', 12)
    f.text(70, 332, 'typical afternoon values; the floor is computed from the air temperature and humidity', 't m', 'start', 12)
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
    f = Fig(640, 230, 'Four boxes joined by arrows: the newton, the force that gives one kilogram an acceleration of one '
                      'metre per second squared; the joule, one newton pushed through one metre; the watt, one joule every '
                      'second; and the kilowatt-hour, a thousand watts for an hour, which is 3.6 million joules.')
    boxes = [('newton (N)', ['1 kg gaining 1 m/s', 'of speed each second', 'a 1 kg bag weighs 9.8 N']),
             ('joule (J)', ['1 N pushed through 1 m', 'lifting 1 kg by 10 cm', 'takes about 1 J']),
             ('watt (W)', ['1 J every second', 'a 60 W bulb moves', '60 J each second']),
             ('kilowatt-hour (kWh)', ['1000 W for 3600 s', '= 3,600,000 J', 'one “unit” on the bill'])]
    bw, bh, gap = 146, 120, 12
    x = 9
    for i, (title, rows) in enumerate(boxes):
        f.rect(x, 40, bw, bh, 'plate', rx=8)
        f.text(x + bw / 2, 64, title, 't b', 'middle', 13)
        f.lines(x + bw / 2, 90, rows, 't m', 'middle', 12, lh=1.4)
        if i < 3:
            f.arrow(x + bw + 1, 100, x + bw + gap - 1, 100, 'ink')
        x += bw + gap
    f.text(320, 190, 'each unit is built from the one before it, and every one of them is built, in the end,', 't m', 'middle', 12)
    f.text(320, 208, 'from the metre, the kilogram and the second', 't m', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- engines
@figure
def s_engine_fall():
    f = Fig(640, 320, 'Left: Carnot’s picture of an engine, heat falling from a hot boiler to the cold outside air past a '
                      'wheel that takes out some work. Right: a bar for a steam engine, with 17 of every 100 joules from '
                      'the fire becoming useful work and 83 joules going to the cold side.')
    # ---- the fall
    f.text(170, 28, 'Carnot’s picture', 't b', 'middle', 14)
    f.text(170, 46, 'as historians summarise it', 't m', 'middle', 12)
    f.rect(90, 60, 160, 44, 'wash-p', rx=6)
    f.text(170, 78, 'hot: the boiler', 't p b', 'middle', 13)
    f.text(170, 95, 'steam at high temperature', 't p', 'middle', 12)
    f.rect(90, 236, 160, 44, 'wash-e', rx=6)
    f.text(170, 254, 'cold: the air outside', 't e b', 'middle', 13)
    f.text(170, 271, 'where the used steam goes', 't e', 'middle', 12)
    f.arrow(130, 108, 130, 230, 'ink', width=6)
    f.text(118, 170, 'heat “falls”', 't b', 'end', 13)
    f.text(118, 186, 'from hot to cold', 't m', 'end', 12)
    # the wheel
    f.circle(190, 170, 26, 'plate')
    f.circle(190, 170, 26, 'ln')
    for k in range(6):
        a = math.radians(k * 60)
        f.line(190, 170, 190 + 26 * math.cos(a), 170 + 26 * math.sin(a), 'ln m')
    f.curved_arrow(190, 136, 224, 170, bend=-14)
    f.force(220, 170, 60, 0, 'work out', 12)
    # ---- the bar
    f.text(470, 28, 'A steam engine, by the numbers', 't b', 'middle', 14)
    f.text(470, 46, 'of every 100 J the fire gives', 't m', 'middle', 12)
    bx, by, bw = 372, 70, 60
    f.rect(bx, by, bw, 17 * 2, 'bar-p', rx=0)
    f.rect(bx, by + 34, bw, 83 * 2, 'bar-e', rx=0)
    f.rect(bx, by, bw, 200, 'ln', rx=0, extra='fill="none"')
    f.text(bx + bw + 12, by + 22, '17 J become useful work', 't p b', 'start', 13)
    f.text(bx + bw + 12, by + 120, '83 J go to the cold side', 't e b', 'start', 13)
    f.text(bx + bw + 12, by + 138, 'as warmth in the air and water', 't e', 'start', 12)
    f.text(bx + bw + 12, by + 164, 'efficiency = 17 ÷ 100 = 17%', 't', 'start', 12)
    f.text(320, 300, 'representative values: a petrol engine manages about 30%, a coal power station about 42%', 't m', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- proportion
@figure
def s_torch_patch():
    f = Fig(640, 320, 'A torch on the left shines on three walls at one, two and three metres. The lit patch is one square '
                      'at one metre, four squares at two metres and nine squares at three metres: the same light spread '
                      'over four and then nine times the area.')
    tx, ty = 50, 170
    f.rect(tx - 30, ty - 10, 36, 20, 'block', rx=4)
    f.path(f'M{tx + 6},{ty - 14} L{tx + 18},{ty - 18} L{tx + 18},{ty + 18} L{tx + 6},{ty + 14} Z', 'plate')
    f.text(tx - 12, ty + 40, 'torch', 't m', 'middle', 12)
    unit = 28
    walls = [(1, 200, 'at 1 m: 1 square', 'full brightness'),
             (2, 370, 'at 2 m: 4 squares', 'each ¼ as bright'),
             (3, 580, 'at 3 m: 9 squares', 'each ⅑ as bright')]
    for n, wx, lab, sub in walls:
        half = n * unit / 2
        f.line(wx, 40, wx, 300, 'ln m')
        f.rect(wx - 4, ty - half, 4, 2 * half, 'wash-p', rx=0)
        for k in range(n + 1):
            yy = ty - half + k * unit
            f.line(wx - 4, yy, wx, yy, 'ln')
        f.line(wx - 4, ty - half, wx - 4, ty + half, 'ln')
        # rays from the torch lens to the patch edges
        f.ray(tx + 18, ty - 18, wx - 4, ty - half, chevrons=1, cls='ray')
        f.ray(tx + 18, ty + 18, wx - 4, ty + half, chevrons=1, cls='ray')
        f.text(wx - 10, 56, lab, 't b', 'end', 12)
        f.text(wx - 10, 72, sub, 't m', 'end', 12)
        f.text(wx - 10, 290, f'{n} m from the torch', 't m', 'end', 12)
    f.text(320, 310, 'the patch is drawn edge-on; seen face-on it is 1 × 1, 2 × 2 and 3 × 3 squares', 't m', 'middle', 12)
    return f.svg()
