"""Figures for Chapter 5, Gravity and orbits. Orbits are computed, not sketched: the cannon paths are integrated in a
1/r² field (GM = 1, launch radius 1, circular speed 1); the comet and equal-area dots solve Kepler's equation; the
Chandrayaan-3 ellipses use ISRO's perigee and apogee heights with the 8.01SC Earth radius, all to one scale."""
from __future__ import annotations
import math
from figs_core import Fig, figure


def _kepler_E(M, e):
    """Eccentric anomaly from mean anomaly (Newton's method)."""
    E = M if e < 0.8 else math.pi
    for _ in range(40):
        E -= (E - e * math.sin(E) - M) / (1 - e * math.cos(E))
    return E


def _integrate(v0, dt=0.003, tmax=16.0, far=4.0, ground=0.86):
    """Launch from (0, 1) moving +x in a field a = -r/|r|^3 (GM = 1). Returns points until the ground or far away."""
    def acc(x, y):
        r3 = (x * x + y * y) ** 1.5
        return -x / r3, -y / r3
    x, y, vx, vy = 0.0, 1.0, v0, 0.0
    pts = [(x, y)]
    t = 0.0
    while t < tmax:
        ax, ay = acc(x, y)
        k1 = (vx, vy, ax, ay)
        ax2, ay2 = acc(x + dt / 2 * k1[0], y + dt / 2 * k1[1])
        k2 = (vx + dt / 2 * k1[2], vy + dt / 2 * k1[3], ax2, ay2)
        ax3, ay3 = acc(x + dt / 2 * k2[0], y + dt / 2 * k2[1])
        k3 = (vx + dt / 2 * k2[2], vy + dt / 2 * k2[3], ax3, ay3)
        ax4, ay4 = acc(x + dt * k3[0], y + dt * k3[1])
        k4 = (vx + dt * k3[2], vy + dt * k3[3], ax4, ay4)
        x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
        y += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
        vx += dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
        vy += dt / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3])
        t += dt
        pts.append((x, y))
        r = math.hypot(x, y)
        if (r < ground and t > 0.05) or r > far:
            break
    return pts


@figure
def c5_moon_fall():
    """The Moon's straight-line path and its real curved path, with the gap that is 'falling'; an apple for comparison."""
    f = Fig(640, 330, "The Moon moving along its orbit: a dashed line shows where it would go with no pull from Earth, "
                      "the curve shows where it really goes, and the gap between them is how far it has fallen. An apple "
                      "near Earth falls 4.9 m in its first second; the Moon falls 4.9 m below its straight line in a minute")
    ex, ey, R = 230, 330, 230            # Earth's centre is below the frame; the orbit arc is centred on it
    f.circle(ex, ey, 56, 'plate')
    f.text(ex, ey - 64, 'Earth', 't m', 'middle', 13)
    mx, my = ex, ey - R
    a_end = -math.radians(90) + math.radians(62)
    ox, oy = ex + R * math.cos(a_end), ey + R * math.sin(a_end)
    f.path(f'M{mx},{my} A{R},{R} 0 0 1 {ox:.1f},{oy:.1f}', 'ln e', extra='stroke-width="2.2"')
    f.path(f'M{mx},{my} L{ox:.1f},{my}', 'ln dash')
    f.circle(mx, my, 13, 'fill-ink')
    f.text(mx - 20, my + 5, 'Moon', 't', 'end', 13)
    f.vector(mx + 16, my - 22, 80, 0, '', 12)
    f.text(mx + 56, my - 30, 'about 1 km/s', 't e', 'middle', 12)
    f.text(ox + 8, my + 4, 'where it would go with no pull', 't m', 'start', 12)
    f.text(ox - 60, oy + 18, 'where it really goes', 't e', 'middle', 12)
    f.line(ox, my, ox, oy, 'ln m')
    f.line(ox - 6, my, ox + 6, my, 'ln m'); f.line(ox - 6, oy, ox + 6, oy, 'ln m')
    f.lines(ox + 10, (my + oy) / 2 - 8, ['the gap is the fall:', '4.9 m after one minute'], 't', 'start', 12)
    f.force(mx, my + 13, 0, 58)
    f.text(mx + 10, my + 74, 'pull of Earth', 't p b', 'start', 12)
    ax, ay = 50, 150
    f.circle(ax, ay, 8, 'fill-ink')
    f.line(ax, ay + 12, ax, ay + 92, 'ln dash')
    f.circle(ax, ay + 100, 8, 'ln')
    f.lines(ax + 14, ay - 4, ['an apple falls 4.9 m', 'in its first second'], 't', 'start', 12)
    f.text(320, 318, 'the curve is hugely exaggerated: in one minute the Moon moves 61 km and falls 4.9 m', 't m', 'middle', 12)
    return f.svg()


@figure
def c5_cannon():
    """Newton's cannon: computed paths from one mountain top at five launch speeds."""
    f = Fig(640, 390, 'Newton’s cannon on a tall mountain: a slow shot curves down and lands, a faster one lands farther '
                      'round the Earth, at about 8 km/s the path is a circle that never meets the ground, a little faster '
                      'gives a long ellipse, and at about 11 km/s the shot leaves Earth for good')
    cx, cy, S = 320, 165, 100.0
    f.circle(cx, cy, 0.85 * S, 'plate')
    f.text(cx, cy + 6, 'Earth', 't m', 'middle', 14)
    f.path(f'M{cx - 14},{cy - 0.84 * S:.1f} L{cx},{cy - S:.1f} L{cx + 14},{cy - 0.84 * S:.1f}', 'fill-ink')
    f.text(cx - 20, cy - S - 6, 'the mountain (far too tall, to be seen)', 't m', 'end', 12)
    runs = (
        (0.55, 'ln m', 'too slow: it lands'),
        (0.82, 'ln m', 'faster: lands farther round'),
        (1.00, 'ln e', 'about 8 km/s: a circle, it never lands'),
        (1.15, 'ln e', 'a little faster: a long loop'),
        (1.46, 'ln vol', ''),
    )
    ends = []
    for v, cls, _ in runs:
        pts = _integrate(v, tmax=(6.6 if v == 1.0 else 16.0))
        scr = [(cx + x * S, cy - y * S) for x, y in pts if -3.1 < x < 3.1 and -2.2 < y < 1.6]
        thin = scr[::8] + [scr[-1]]          # the integrator steps are far finer than a screen pixel
        f.path('M' + ' L'.join(f'{px:.1f},{py:.1f}' for px, py in thin), cls, extra='stroke-width="2"')
        ends.append(scr[-1])
    # the two landing shots: leader lines out to labels on the right
    for k, (lx, ly) in enumerate(((cx + 150, cy - 118), (cx + 150, cy - 80))):
        f.line(ends[k][0], ends[k][1], lx - 6, ly - 4, 'ln m')
        f.text(lx, ly, runs[k][2], 't m', 'start', 12)
    f.text(cx, cy + 122, runs[2][2], 't e', 'middle', 12)
    f.text(cx, cy + 1.95 * S + 16, runs[3][2], 't e', 'middle', 12)
    ex_, ey_ = min(ends[4][0], 628) - 22, ends[4][1]
    f.text(ex_, ey_ - 22, 'about 11 km/s:', 't v', 'end', 12)
    f.text(ex_, ey_ - 8, 'it leaves for good', 't v', 'end', 12)
    return f.svg()


@figure
def c5_phone_drop():
    """What a phone's accelerometer reads before, during and after a 40 cm fall onto a pillow (schematic trace)."""
    f = Fig(640, 250, 'A graph of a phone’s acceleration-sensor reading against time: 9.8 while held still, about zero for '
                      'the 0.29 s of a 40 cm fall, a brief bump as the pillow stops it, then 9.8 again')
    x0, y0, w, h = 70, 200, 540, 150
    sx, sy = 400.0, 6.5                 # px per second, px per m/s²
    f.axis(x0, y0, w, h, 'time (s)', 'sensor reading (m/s²)',
           ticks={'x': [(sx * 0.25, '0.25'), (sx * 0.5, '0.5'), (sx * 0.75, '0.75'), (sx * 1.0, '1.0')],
                  'y': [(9.8 * sy, '9.8'), (20 * sy, '20')]}, size=12)
    f.line(x0, y0 - 9.8 * sy, x0 + w - 20, y0 - 9.8 * sy, 'ln dash')
    pts = []
    t = 0.0
    while t <= 1.25:
        if t < 0.30:
            a = 9.8
        elif t < 0.30 + 0.286:
            a = 0.3
        elif t < 0.30 + 0.286 + 0.10:
            u = (t - 0.586) / 0.10
            a = 9.8 + 12.0 * math.sin(math.pi * u)
        else:
            a = 9.8
        pts.append((x0 + t * sx, y0 - a * sy))
        t += 0.005
    f.path('M' + ' L'.join(f'{px:.1f},{py:.1f}' for px, py in pts), 'ln e', extra='stroke-width="2"')
    f.text(x0 + 0.15 * sx, y0 - 9.8 * sy - 10, 'held still: 9.8', 't', 'middle', 12)
    f.text(x0 + 0.443 * sx, y0 - 14, 'falling: about 0', 't e', 'middle', 12)
    f.bracket_label(x0 + 0.30 * sx, x0 + 0.586 * sx, y0 - 9.8 * sy - 16, '0.29 s, a 40 cm drop', 12)
    f.text(x0 + 0.64 * sx, y0 - 22 * sy - 6, 'the pillow stops it', 't m', 'start', 12)
    return f.svg()


@figure
def c5_ellipse():
    """Three panels: drawing an ellipse with two pins; Mars's orbit to scale; equal areas in equal times (exaggerated)."""
    f = Fig(1000, 340, 'Three drawings: an ellipse traced with a pencil inside a loop of string around two pins; the orbit of '
                       'Mars drawn to scale, almost a circle but with the Sun clearly off centre; and an exaggerated '
                       'ellipse with two equal areas swept out in equal times, a thin long one far from the Sun and a '
                       'short fat one near it', wide=True)
    # panel 1: pins and string
    cx, cy, a, c = 165, 180, 118, 52
    b = math.sqrt(a * a - c * c)
    f.text(cx, 26, 'drawing one with two pins', 't b', 'middle', 14)
    f.add(f'<ellipse cx="{cx}" cy="{cy}" rx="{a}" ry="{b:.1f}" class="ln"/>')
    for px in (cx - c, cx + c):
        f.circle(px, cy, 4, 'fill-ink')
    f.text(cx - c, cy + 22, 'pin', 't m', 'middle', 12)
    f.text(cx + c, cy + 22, 'pin', 't m', 'middle', 12)
    th = math.radians(-55)
    qx, qy = cx + a * math.cos(th), cy + b * math.sin(th)
    f.line(cx - c, cy, qx, qy, 'ln m'); f.line(cx + c, cy, qx, qy, 'ln m')
    f.circle(qx, qy, 3, 'fill-ink')
    f.text(qx + 8, qy - 6, 'pencil', 't m', 'start', 12)
    f.text(cx + 10, cy - 60, 'string', 't m', 'start', 12)
    f.text(cx, cy + b + 30, 'the two pins are the two foci', 't m', 'middle', 12)
    # panel 2: Mars to scale, e = 0.093
    cx, cy, a = 480, 180, 112
    e = 0.093
    b = a * math.sqrt(1 - e * e)
    f.text(cx, 26, "Mars's orbit, to scale", 't b', 'middle', 14)
    f.circle(cx, cy, a, 'ln dash')
    f.add(f'<ellipse cx="{cx}" cy="{cy}" rx="{a}" ry="{b:.1f}" class="ln e" stroke-width="2"/>')
    f.circle(cx - a * e, cy, 7, 'fill-vol')
    f.text(cx - a * e, cy - 14, 'Sun', 't v', 'middle', 12)
    f.line(cx, cy - 5, cx, cy + 5, 'ln m'); f.line(cx - 5, cy, cx + 5, cy, 'ln m')
    f.text(cx + 8, cy + 16, 'centre', 't m', 'start', 12)
    f.circle(cx + a * e, cy, 3, 'ln m')
    f.text(cx + a * e + 8, cy - 8, 'other focus, empty', 't m', 'start', 12)
    f.text(cx, cy + a + 22, 'dashed: a circle of the same size', 't m', 'middle', 12)
    f.text(cx, cy + a + 40, 'the Sun sits 9% of the way from the centre to the edge', 't m', 'middle', 12)
    # panel 3: equal areas, e = 0.6 (exaggerated)
    fx, fy, a, e = 760, 180, 120, 0.6
    b = a * math.sqrt(1 - e * e)
    ccx = fx + a * e                   # ellipse centre; perihelion to the left of the Sun
    f.text(ccx, 26, 'equal areas in equal times', 't b', 'middle', 14)
    f.add(f'<ellipse cx="{ccx:.1f}" cy="{fy}" rx="{a}" ry="{b:.1f}" class="ln"/>')
    def pos(M):
        E = _kepler_E(M, e)
        return fx - a * (math.cos(E) - e), fy + b * math.sin(E)
    for M1, M2 in ((-0.35, 0.35), (math.pi - 0.35, math.pi + 0.35)):
        poly = [f'{fx},{fy}'] + [f'{x:.1f},{y:.1f}' for x, y in (pos(M1 + (M2 - M1) * k / 24) for k in range(25))]
        f.path('M' + ' L'.join(poly) + ' Z', 'wash')
    f.circle(fx, fy, 7, 'fill-vol')
    f.text(fx, fy - 14, 'Sun', 't v', 'middle', 12)
    p1 = pos(0.0); p2 = pos(math.pi)
    f.text(p1[0] - 8, p1[1] + 24, 'fast, close in', 't m', 'end', 12)
    f.text(p2[0], fy + b + 14, 'slow, far out', 't m', 'middle', 12)
    f.text(ccx, fy + b + 32, 'the two shaded areas are equal (ellipse exaggerated)', 't m', 'middle', 12)
    return f.svg()


@figure
def c5_cavendish():
    """Cavendish's torsion balance seen from above, inside its shed, with the telescope through the wall (schematic)."""
    f = Fig(640, 300, 'Cavendish’s experiment seen from above: inside a closed shed a light rod hangs from a thin wire with '
                      'a small lead ball at each end; a big lead ball sits beside each small one on opposite sides, the tiny '
                      'pull twists the rod, and Cavendish watches the twist through a telescope poked through a hole in the wall')
    f.rect(70, 30, 500, 240, 'ln', rx=0)
    f.text(80, 50, 'shed, closed up', 't m', 'start', 12)
    cx, cy = 320, 150
    f.line(cx - 130, cy, cx + 130, cy, 'ln', extra='stroke-width="3"')
    f.circle(cx, cy, 4, 'fill-ink')
    f.text(cx, cy - 12, 'thin wire, seen end-on', 't m', 'middle', 12)
    f.text(cx, cy + 22, 'light rod', 't m', 'middle', 12)
    for sx, big_dy, side in ((cx - 130, -46, -1), (cx + 130, 46, 1)):
        f.circle(sx, cy, 10, 'fill-ink')
        f.circle(sx, cy + big_dy, 24, 'plate')
        f.force(sx, cy + (-10 if big_dy < 0 else 10), 0, 14 * (1 if big_dy > 0 else -1), '', 12)
    f.text(cx - 130, cy - 86, 'big lead ball', 't m', 'middle', 12)
    f.text(cx + 130, cy + 92, 'big lead ball', 't m', 'middle', 12)
    f.text(cx - 130 - 16, cy + 28, 'small ball', 't m', 'end', 12)
    f.text(cx + 130 + 16, cy - 20, 'small ball', 't m', 'start', 12)
    f.text(cx - 100, cy - 36, 'pull (tiny)', 't p b', 'end', 12)
    f.text(cx + 100, cy + 44, 'pull (tiny)', 't p b', 'start', 12)
    f.curved_arrow(cx - 60, cy - 24, cx + 60, cy - 24, bend=14, kind='muted')
    f.text(cx, cy - 36, 'the rod twists a little', 't m', 'middle', 12)
    f.rect(20, cy - 8, 52, 16, 'block', rx=3)
    f.line(72, cy, cx - 140, cy, 'ln dash')
    f.lines(14, 110, ['telescope through', 'a hole in the wall'], 't m', 'start', 12)
    f.text(320, 292, 'schematic, not to scale', 't m', 'middle', 12)
    return f.svg()


@figure
def c5_comet():
    """A comet on an e = 0.9 ellipse, with a dot every twenty-fourth of its period: it crowds the far end."""
    f = Fig(640, 320, 'A comet’s orbit, a long ellipse with the Sun at one end: dots mark where the comet is after each '
                      'twenty-fourth of its period, and almost all of them crowd the far end because it moves slowly there '
                      'and races through the near end')
    fx, fy, a, e = 110, 160, 250, 0.9
    b = a * math.sqrt(1 - e * e)
    ccx = fx + a * e
    f.add(f'<ellipse cx="{ccx:.1f}" cy="{fy}" rx="{a}" ry="{b:.1f}" class="ln"/>')
    f.circle(fx, fy, 30, 'ln dash')
    f.text(fx, fy + 48, 'planets (schematic)', 't m', 'middle', 12)
    f.circle(fx, fy, 7, 'fill-vol')
    f.text(fx, fy - 14, 'Sun', 't v', 'middle', 12)
    for k in range(24):
        M = 2 * math.pi * k / 24
        E = _kepler_E(M, e)
        x, y = fx - a * (math.cos(E) - e), fy + b * math.sin(E)
        f.circle(x, y, 4, 'fill-ink')
    f.text(fx - 10, fy - 50, 'a few weeks', 't', 'end', 12)
    f.text(fx - 10, fy - 36, 'near the Sun', 't', 'end', 12)
    f.text(ccx + a + 6, fy - 10, 'decades', 't', 'start', 12)
    f.text(ccx + a + 6, fy + 6, 'out here', 't', 'start', 12)
    f.text(320, 306, 'the dots are equal time steps; the orbit is a schematic comet with e = 0.9', 't m', 'middle', 12)
    return f.svg()


@figure
def c5_chandrayaan():
    """Chandrayaan-3's Earth-bound orbits to one scale, from ISRO's perigee x apogee heights, out to the Moon's distance."""
    f = Fig(1000, 400, 'Chandrayaan-3’s orbits round Earth drawn to one scale: the planned parking orbit, the orbit after '
                       'the first burn on 15 July 2023, the much longer one after the fourth burn on 22 July, and the '
                       'translunar orbit of 1 August stretching almost to the Moon. Earth is the small disc at the left; '
                       'all the orbits touch it at the same low point', wide=True)
    s = 0.0022                                  # px per km
    Ex, Ey, RE = 140, 200, 6371.009
    orbits = (
        (170, 36500, 'ln dash', 'planned parking orbit: 170 × 36,500 km'),
        (173, 41762, 'ln m', '15 July, after burn 1: 173 × 41,762 km'),
        (233, 71351, 'ln', '22 July, after burn 4: 233 × 71,351 km'),
        (288, 369328, 'ln e', '1 August, translunar: 288 × 369,328 km'),
    )
    for k, (hp, ha, cls, lab) in enumerate(orbits):
        rp, ra = hp + RE, ha + RE
        a = (rp + ra) / 2
        c = a - rp
        b = math.sqrt(a * a - c * c)
        cx = Ex + c * s
        f.add(f'<ellipse cx="{cx:.1f}" cy="{Ey}" rx="{a * s:.1f}" ry="{b * s:.1f}" class="{cls}" stroke-width="2"/>')
        ax = Ex + ra * s
        if k < 3:
            ly = 56 + 24 * k
            lx = 360
            f.line(ax, Ey, lx - 8, ly, 'ln m')
            f.text(lx, ly + 4, lab, 't', 'start', 12)
        else:
            f.text(790, Ey - b * s - 12, lab, 't e', 'middle', 12)
    f.circle(Ex, Ey, RE * s, 'fill-ink')
    f.text(Ex, Ey + 52, 'Earth', 't', 'middle', 13)
    mx = Ex + 384000 * s
    f.circle(mx, Ey, 1737.1 * s, 'fill-ink')
    f.text(996, Ey + 24, 'Moon', 't', 'end', 13)
    f.text(996, Ey + 42, '(average distance)', 't m', 'end', 12)
    f.text(500, 370, 'burns at the low point speed the craft up along its path; each one lifts the far side of the loop',
           't m', 'middle', 12)
    f.text(500, 390, 'the 17 July orbit (226 × 41,603 km) lies almost on top of the 15 July one and is not drawn', 't m', 'middle', 12)
    return f.svg()
