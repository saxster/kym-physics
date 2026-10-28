"""Figures for Chapter 1, Describing motion. All drawings are ours. c1_four_cars redraws the idea of OpenStax College
Physics 2e Fig 2.14 (four cars, velocity and acceleration arrows); c1_toss_graphs redraws the idea of its Fig 2.39
(position, velocity and acceleration against time for a thrown object), both with our own numbers."""
import math
from figs_core import Fig, figure

G = 9.8
V0 = math.sqrt(2 * G * 1.0)      # a toss that rises 1 m: 4.43 m/s


def _ball(f, x, y, r=8):
    f.circle(x, y, r, 'fill-vol')
    f.circle(x, y, r, 'ln')


@figure
def c1_two_frames():
    f = Fig(640, 296, 'A ball bounced by someone walking, drawn twice. Seen by a friend walking alongside, the ball goes '
                      'straight up and down. Seen by someone standing still, the same ball traces a zigzag.')
    f.text(160, 30, 'Seen by a friend walking alongside', 't b', 'middle', 14)
    f.text(470, 30, 'Seen by someone standing still', 't b', 'middle', 14)
    f.ground(30, 220, 270)
    f.ground(340, 220, 270)
    # left: straight up and down
    f.line(160, 80, 160, 212, 'ln e dash')
    for y in (80, 120, 165, 212):
        _ball(f, 160, y, 7)
    f.vector(184, 200, 0, -110, '', 13)
    f.vector(136, 92, 0, 110, '', 13)
    f.text(192, 150, 'up', 't e', 'start', 13)
    f.text(128, 150, 'down', 't e', 'end', 13)
    f.text(160, 250, 'the ball stays beside you', 't m', 'middle', 13)
    # right: a zigzag, because the bouncer moves along while the ball goes up and down
    pts = [(360, 212), (395, 80), (430, 212), (465, 80), (500, 212), (535, 80), (570, 212)]
    f.path('M' + ' L'.join(f'{x},{y}' for x, y in pts), 'ln e dash')
    for x, y in pts:
        _ball(f, x, y, 7)
    f.vector(390, 246, 130, 0, '', 13)
    f.text(460, 266, 'the bouncer walks this way', 't e', 'middle', 13)
    f.text(320, 290, 'Same ball, same bounces. Neither picture is "the real one".', 't', 'middle', 13)
    return f.svg()


@figure
def c1_graph_walk():
    f = Fig(640, 300, 'A position–time graph of a walk along a corridor: forward 6 metres in 3 seconds, standing still for '
                      '3 seconds, back 3 metres in 3 seconds, then still again. Steeper means faster; a downward slope means '
                      'walking back. A dashed line for a friend walking back at half a metre per second crosses it twice.')
    x0, y0, w, h = 70, 240, 520, 190
    px = w / 12          # pixels per second
    py = h / 8           # pixels per metre
    f.axis(x0, y0, w, h, 'time (s)', 'position along the corridor (m)',
           ticks={'x': [(px * k, str(k)) for k in (2, 4, 6, 8, 10, 12)], 'y': [(py * k, str(k)) for k in (2, 4, 6, 8)]})
    pts = [(0, 0), (3, 6), (6, 6), (9, 3), (12, 3)]
    P = [(x0 + t * px, y0 - d * py) for t, d in pts]
    # a friend who starts at 8 m and strolls back at 0.5 m/s: she passes you at t = 4 s (you still) and t = 8 s
    f.line(x0, y0 - 8 * py, x0 + 12 * px, y0 - 2 * py, 'ln m dash')
    f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in P), 'ln e')
    for t, d in ((4, 6), (8, 4)):
        f.circle(x0 + t * px, y0 - d * py, 5.5, 'ln')
    f.text(105, 150, 'forward, 2 m/s', 't e b', 'start', 13)
    f.text(x0 + 4.6 * px, y0 - 6 * py - 10, 'standing still', 't e b', 'start', 13)
    f.text(372, 192, 'back, 1 m/s', 't e b', 'start', 13)
    f.text(525, 158, 'still again', 't e b', 'middle', 13)
    f.text(x0 + 12 * px - 4, 212, 'a friend walking back at 0.5 m/s', 't m', 'end', 12)
    f.text(112, 228, 'circles: same place at 4 s and at 8 s, different speeds', 't m', 'start', 12)
    return f.svg()


def _car(f, x, y, w=76, h=24):
    f.rect(x - w / 2, y - h / 2, w, h, 'block', rx=5)
    f.rect(x - w * .22, y - h / 2 - 9, w * .44, 9, 'block', rx=3)
    for dx in (-w * .3, w * .3):
        f.circle(x + dx, y + h / 2 + 2, 5, 'fill-ink')


@figure
def c1_four_cars():
    f = Fig(640, 330, 'Four cars on a road with the positive direction to the right. The velocity arrow shows which way each '
                      'car moves; the acceleration arrow shows which way its velocity is changing. When the two arrows point '
                      'the same way the car speeds up; when they point opposite ways it slows down, whatever the signs.')
    f.vector(250, 16, 120, 0, 'positive direction', 13)
    rows = [
        (68, 1, 1, 'moving right', '(a) speeding up: a is positive'),
        (140, 1, -1, 'moving right', '(b) slowing down: a is negative'),
        (212, -1, -1, 'moving left', '(c) speeding up: a is negative'),
        (284, -1, 1, 'moving left', '(d) slowing down: a is positive'),
    ]
    for y, sv, sa, left, right in rows:
        _car(f, 290, y)
        f.vector(290 + sv * 44, y - 28, sv * 70, 0, 'v', 13)
        f.vector(290 + sa * 44, y + 24, sa * 48, 0, 'a', 13, kind='muted')
        f.text(20, y + 5, left, 't m', 'start', 13)
        f.text(430, y + 5, right, 't', 'start', 13)
    f.text(320, 324, 'v is the velocity, a the acceleration; opposite arrows always mean slowing down', 't m', 'middle', 12)
    return f.svg()


@figure
def c1_ramp():
    f = Fig(640, 300, 'A ball rolling down a long ramp, drawn at five equally spaced moments. The distances from the start '
                      'are 0, 1, 4, 9 and 16 units, so the gaps between the moments are 1, 3, 5 and 7 units.')
    x1, y1, x2, y2 = 70, 62, 590, 232
    L = math.hypot(x2 - x1, y2 - y1)
    ux, uy = (x2 - x1) / L, (y2 - y1) / L          # along the ramp
    nx, ny = uy, -ux                                # "up" from the ramp surface
    f.ground(40, 246, 580)
    f.line(x1, y1, x1, 246, 'ln m')
    f.line(x1, y1, x2, y2, 'ln', 'stroke-width="3"')
    unit = L / 16

    def at(s, off):
        return x1 + ux * s * unit + nx * off, y1 + uy * s * unit + ny * off
    for beat, s in enumerate((0, 1, 4, 9, 16)):
        bx, by = at(s, 11)
        _ball(f, bx, by, 9)
        lx, ly = at(s, 34)
        f.text(lx, ly + 4, str(beat), 't', 'middle', 13)
        tx1, ty1 = at(s, -3)
        tx2, ty2 = at(s, -12)
        f.line(tx1, ty1, tx2, ty2, 'ln')
        dx, dy = at(s, -24)
        f.text(dx, dy + 5, str(s), 't b', 'middle', 13)
    for s_a, s_b in ((0, 1), (1, 4), (4, 9), (9, 16)):
        mx, my = at((s_a + s_b) / 2, -42)
        f.text(mx, my + 5, f'+{s_b - s_a}', 't e b', 'middle', 13)
    lx, ly = at(0, 34)
    f.text(lx - 10, ly + 4, 'beats:', 't m', 'end', 12)
    dx, dy = at(0, -24)
    f.text(dx - 10, dy + 5, 'distance:', 't m', 'end', 12)
    mx, my = at(0, -42)
    f.text(mx - 10, my + 5, 'gaps:', 't m', 'end', 12)
    f.text(600, 292, 'the ramp is drawn steeper than Galileo would have used it', 't m', 'end', 12)
    return f.svg()


def _heights():
    return [(V0 * t - 0.5 * G * t * t) * 100 for t in [k / 10 for k in range(10)]]


@figure
def c1_toss_strobe():
    f = Fig(640, 330, 'A ball tossed straight up one metre in front of a tiled wall, drawn every tenth of a second: five '
                      'positions going up on the left, five coming down on the right. The gaps between positions shrink by '
                      'about 9.8 cm each time, through the top and down the other side.')
    base, scale = 300, 2.4           # y of the floor, pixels per centimetre
    for cm in range(0, 101, 10):
        y = base - cm * scale
        f.line(130, y, 510, y, 'ln r')
    for cm, lab in ((0, '0'), (50, '50 cm'), (100, '1 m')):
        f.text(122, base - cm * scale + 4, lab, 't m', 'end', 12)
    hs = _heights()
    up, down = hs[:5], hs[5:]
    xu, xd = 240, 400
    for i, h in enumerate(up):
        y = base - h * scale
        _ball(f, xu, y, 8)
        f.text(xu - 16, y + 4, f'{i / 10:.1f} s', 't', 'end', 12)
    for i, h in enumerate(down):
        y = base - h * scale
        _ball(f, xd, y, 8)
        f.text(xd + 16, y + 4, f'{(i + 5) / 10:.1f} s', 't', 'start', 12)
    for i in range(4):
        ya, yb = base - up[i] * scale, base - up[i + 1] * scale
        f.line(xu + 22, ya, xu + 22, yb, 'ln e')
        f.text(xu + 30, (ya + yb) / 2 + 4, f'{up[i + 1] - up[i]:.0f} cm', 't e', 'start', 12)
    for i in range(4):
        ya, yb = base - down[i] * scale, base - down[i + 1] * scale
        f.line(xd - 22, ya, xd - 22, yb, 'ln e')
        f.text(xd - 30, (ya + yb) / 2 + 4, f'{down[i] - down[i + 1]:.0f} cm', 't e', 'end', 12)
    f.text(320, 46, f'top: only {hs[5] - hs[4]:.1f} cm between 0.4 s and 0.5 s', 't e b', 'middle', 12)
    f.text(xu, 322, 'going up', 't b', 'middle', 13)
    f.text(xd, 322, 'coming down', 't b', 'middle', 13)
    f.text(122, base - 50 * scale + 20, 'tiles 10 cm apart', 't m', 'end', 12)
    return f.svg()


@figure
def c1_toss_graphs():
    f = Fig(1000, 300, 'Three graphs against time for the one-metre toss. Height rises and falls in a curve with its top at '
                       '0.45 seconds. Velocity is a straight line sloping down, positive then negative, passing through zero at '
                       '0.45 seconds. Acceleration is a flat line at minus 9.8 metres per second squared the whole time.', wide=True)
    T = 0.9
    px = 260 / 1.0                      # pixels per second
    # ---- height
    x0, yb = 60, 232
    f.axis(x0, yb, 270, 170, 'time (s)', 'height (cm)',
           ticks={'x': [(px * .5, '0.5'), (px * 1, '1')], 'y': [(80, '50'), (160, '100')]})
    pts = []
    for k in range(0, 91):
        t = k / 100
        hcm = (V0 * t - 0.5 * G * t * t) * 100
        pts.append((x0 + t * px, yb - hcm * 1.6))
    f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts), 'ln e')
    tt = x0 + 0.452 * px
    f.line(tt, yb, tt, 50, 'ln m dash')
    f.text(tt, 42, 'top of the flight, 0.45 s', 't m', 'middle', 12)
    # ---- velocity: zero line in the middle
    x1, ym = 390, 150
    f.line(x1, ym, x1 + 270, ym, 'ax')
    f.add(f'<line x1="{x1}" y1="{ym + 90}" x2="{x1}" y2="{ym - 95}" class="ax" marker-end="url(#ah-ink)"/>')
    for v in (4, 2, -2, -4):
        f.line(x1 - 5, ym - v * 18, x1, ym - v * 18, 'ax')
        f.text(x1 - 9, ym - v * 18 + 4, f'{v:+d}' if v > 0 else str(v), 't m', 'end', 12)
    f.text(x1 - 9, ym + 4, '0', 't m', 'end', 12)
    f.text(x1 + 8, ym - 95 + 4, 'velocity (m/s), up is +', 't m', 'start', 13)
    f.text(x1 + 270, ym + 34, 'time (s)', 't m', 'end', 13)
    for t in (0.5, 1.0):
        f.line(x1 + t * px, ym, x1 + t * px, ym + 5, 'ax')
        f.text(x1 + t * px, ym + 18, f'{t:g}', 't m', 'middle', 12)
    va, vb = V0, V0 - G * T
    f.line(x1, ym - va * 18, x1 + T * px, ym - vb * 18, 'ln e', 'stroke-width="2.2"')
    f.line(x1 + 0.452 * px, ym + 90, x1 + 0.452 * px, 50, 'ln m dash')
    f.text(x1 + 0.452 * px + 6, ym - 30, 'zero here, for an instant', 't e', 'start', 12)
    f.text(x1 + T * px - 6, ym - vb * 18 + 16, '−4.4 m/s', 't e', 'end', 12)
    # ---- acceleration: zero line near the top, −9.8 below it
    x2, yz = 720, 92
    f.line(x2, yz, x2 + 270, yz, 'ax')
    f.add(f'<line x1="{x2}" y1="{yz + 150}" x2="{x2}" y2="{yz - 36}" class="ax" marker-end="url(#ah-ink)"/>')
    f.text(x2 - 9, yz + 4, '0', 't m', 'end', 12)
    ya = yz + 9.8 * 11
    f.line(x2 - 5, ya, x2, ya, 'ax')
    f.text(x2 - 9, ya + 4, '−9.8', 't m', 'end', 12)
    f.text(x2 + 8, yz - 36 + 4, 'acceleration (m/s²)', 't m', 'start', 13)
    f.text(x2 + 270, yz + 34, 'time (s)', 't m', 'end', 13)
    for t in (0.5, 1.0):
        f.line(x2 + t * px, yz, x2 + t * px, yz + 5, 'ax')
        f.text(x2 + t * px, yz + 18, f'{t:g}', 't m', 'middle', 12)
    f.line(x2, ya, x2 + T * px, ya, 'ln e', 'stroke-width="2.2"')
    f.line(x2 + 0.452 * px, yz + 150, x2 + 0.452 * px, 50, 'ln m dash')
    f.text(x2 + 0.452 * px + 8, ya - 24, 'the same −9.8', 't e', 'start', 12)
    f.text(x2 + 0.452 * px + 8, ya - 10, 'the whole time', 't e', 'start', 12)
    return f.svg()


@figure
def c1_trains():
    f = Fig(640, 230, 'Three trains on three parallel tracks. Your train runs at 60 km/h to the right. On one side a train '
                      'runs at 70 km/h in the same direction; relative to you it creeps past at 10 km/h. On the other side a '
                      'train runs at 60 km/h the opposite way; relative to you it passes at 120 km/h.')
    tracks = (62, 122, 182)
    for y in tracks:
        f.line(20, y + 14, 620, y + 14, 'ln m')
        f.line(20, y + 18, 620, y + 18, 'ln m')
    # top: the oncoming train
    f.rect(400, 48, 150, 28, 'block', rx=8)
    f.text(475, 67, 'a local the other way', 't', 'middle', 13)
    f.vector(396, 50, -90, 0, '60 km/h', 13)
    # middle: Kym's train
    f.rect(110, 108, 150, 28, 'block', rx=8)
    f.text(185, 127, 'your train', 't b', 'middle', 13)
    f.vector(264, 110, 90, 0, '60 km/h', 13)
    # bottom: the faster train on the next track
    f.rect(190, 168, 150, 28, 'block', rx=8)
    f.text(265, 187, 'a faster local', 't', 'middle', 13)
    f.vector(344, 170, 105, 0, '70 km/h', 13)
    f.text(620, 36, 'relative to you: 120 km/h, flashing past', 't e', 'end', 12)
    f.text(620, 216, 'relative to you: 10 km/h, creeping past', 't e', 'end', 12)
    f.text(20, 36, 'speeds relative to the track', 't m', 'start', 12)
    return f.svg()
