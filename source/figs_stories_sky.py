"""Figures for the stories in the sky group (gravity, orbits, kepler, earth-turns, seasons, moon-phases, tides,
chandrayaan, planet-from-a-pen, sun-watcher). Every number drawn here is recorded in provenance/stories_sky.yml and
was computed from the 8.01SC data sheet, NASA fact sheets, OpenStax Astronomy 2e and ISRO's Chandrayaan-3 updates.
Where a drawing exaggerates (a gap, a bulge, a tilt), its caption says so. Theme classes only: the night side of the
Moon is hatched rather than filled, so it reads the same way in the dark theme, where ink and paper swap."""
from __future__ import annotations
import math
from figs_core import Fig, figure


def _ellipse(f, cx, cy, rx, ry, cls='ln', extra=''):
    return f.add(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" class="{cls}" {extra}/>')


def _poly(pts, close=False):
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + (' Z' if close else '')


def _hatch(f, pid):
    """A diagonal-hatch pattern in the muted line colour: used for the night side of the Moon."""
    return f.add(f'<defs><pattern id="{pid}" width="5" height="5" patternUnits="userSpaceOnUse" '
                 f'patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" class="ln m"/></pattern></defs>')


def _moon(f, x, y, r, alpha, hatch):
    """A Moon disc with its lit part for phase angle alpha (0 new, 90 first quarter, 180 full, 270 third quarter):
    plain for the lit part, hatched for the night side. Waxing phases are lit on the right, as seen from Mumbai."""
    f.circle(x, y, r, 'plate')
    f.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="url(#{hatch})"/>')
    a = alpha % 360
    if a == 0:
        return f.circle(x, y, r, 'ln')
    lit = None
    if a != 180:
        waxing = a < 180
        b = a if waxing else 360 - a
        at = r * math.cos(math.radians(b))          # terminator half-width: + bulges to the lit side (crescent)
        top, bot = f'{x:.1f},{y - r:.1f}', f'{x:.1f},{y + r:.1f}'
        d = f'M{top} A{r} {r} 0 0 {1 if waxing else 0} {bot}'
        if abs(at) < 0.6:
            d += f' L{top} Z'
        else:
            sweep = (0 if at > 0 else 1) if waxing else (1 if at > 0 else 0)
            d += f' A{abs(at):.1f} {r} 0 0 {sweep} {top} Z'
        lit = d
    for cls in ('plate', 'wash-n'):
        if lit is None:
            f.circle(x, y, r, cls)
        else:
            f.path(lit, cls)
    return f.circle(x, y, r, 'ln')


# ------------------------------------------------------------------ gravity
@figure
def s_moon_falls():
    """The Moon's straight-line path against its real path: 1.36 mm per second, 4.9 m per minute (a = 4π²r/T²)."""
    f = Fig(640, 300, "Earth at the left; the Moon at the right moving up along its orbit. A dashed straight line shows "
                      "where the Moon would go with no pull; the orbit bends towards Earth, and after one minute the Moon "
                      "is 4.9 m below the straight line, the distance an apple falls in its first second. The departure gap is enlarged; the acceleration at the Moon is about one thirty-six-hundredth of gravity near Earth")
    ex, ey, R = 70, 168, 400
    f.circle(ex, ey, 46, 'plate')
    f.text(ex, ey + 5, 'Earth', 't b', 'middle', 14)
    pts = [(ex + R * math.cos(math.radians(k)), ey - R * math.sin(math.radians(k))) for k in range(-22, 19)]
    f.path(_poly(pts), 'ln')
    mx, my = ex + R, ey
    f.line(mx, my, mx, my - 140, 'ln dash')
    top = 18
    gx, gy = ex + R * math.cos(math.radians(top)), ey - R * math.sin(math.radians(top))
    f.circle(mx, gy, 9, 'ln dash')          # where it would be with no pull
    f.circle(gx, gy, 9, 'plate')            # where it really is
    f.circle(gx, gy, 9, 'ln')
    f.bracket_label(gx, mx, gy - 16, 'gap enlarged', 12)
    f.lines(mx + 20, 40, ['one minute later:', '4.9 m below the', 'straight line'], 't', 'start', 12)
    f.circle(mx, my, 11, 'plate')
    f.circle(mx, my, 11, 'ln')
    f.text(mx + 16, my + 30, 'the Moon now', 't', 'start', 12)
    f.force(mx, my, -70, 0, 'pull towards Earth', 12)
    f.vector(mx + 30, my - 8, 0, -60, '1 km/s', 12)
    f.text(24, 262, 'an apple falls 4.9 m in its first second', 't m', 'start', 12)
    f.text(24, 280, 'At the Moon: about 1/3,600 of the acceleration near Earth.', 't m', 'start', 12)
    return f.svg()


# ------------------------------------------------------------------ orbits
@figure
def s_newton_cannon():
    """Four horizontal launches from a 0.1 R mountain: real Kepler paths for 0.6, 0.85, 1.0 and 1.12 of circular speed."""
    f = Fig(640, 390, "Newton's cannon: Earth as a circle with a tall mountain on top. Two slow balls curve down and land; "
                      "one at the right speed circles the Earth; one faster swings out into a longer loop. A dashed line "
                      "shows the straight path a ball would take with no gravity")
    cx, cy, R = 320, 200, 85
    r0 = 1.1 * R
    f.circle(cx, cy, R, 'plate')
    f.text(cx, cy + 5, 'Earth', 't b', 'middle', 14)
    f.path(f'M{cx - 9},{cy - R + 2} L{cx},{cy - r0} L{cx + 9},{cy - R + 2} Z', 'fill-ink')
    f.line(cx, cy - r0, 600, cy - r0, 'ln dash')
    f.text(600, cy - r0 - 8, 'no gravity: straight on', 't m', 'end', 12)

    def traj(fr):
        rr0, p = 1.1, 1.1 * fr * fr
        if fr < 1:
            e, sgn = 1 - fr * fr, -1
        else:
            e, sgn = fr * fr - 1, 1
        pts, phi = [], 0.0
        while phi <= 2 * math.pi + 1e-9:
            r = p / (1 + sgn * e * math.cos(phi)) if e > 1e-9 else rr0
            if r < 1.0:
                break
            ang = math.pi / 2 - phi
            pts.append((cx + r * R * math.cos(ang), cy - r * R * math.sin(ang)))
            phi += math.radians(1)
        f.path(_poly(pts), 'ln')
        return pts[-1]

    land1 = traj(0.6)
    land2 = traj(0.85)
    traj(1.0)
    traj(1.12)
    f.line(land1[0], land1[1], 452, 126, 'ln m')
    f.text(458, 130, 'slower: lands here', 't', 'start', 12)
    f.line(land2[0], land2[1], 452, 158, 'ln m')
    f.text(458, 162, 'faster: lands further away', 't', 'start', 12)
    f.lines(188, 196, ['about 8 km/s:', 'round and round'], 't', 'end', 12)
    f.text(cx, 378, 'faster still: a longer loop, back to the mountain each time', 't', 'middle', 12)
    return f.svg()


# ------------------------------------------------------------------ kepler
@figure
def s_ellipse_pins():
    """Left: a pins-and-string ellipse (e = 0.5). Right: Mars's orbit to scale, e = 0.093 (8.282J PS3)."""
    f = Fig(640, 320, "Left: an ellipse drawn round two pins with a loop of string, the pencil pulling the string tight. "
                      "Right: Mars's orbit to scale, almost a circle, with the Sun about 9% of the radius off centre")
    # left panel: a = 120, c = 60
    cx, cy, a, c = 160, 172, 120, 60
    b = math.sqrt(a * a - c * c)
    f.text(cx, 26, 'two pins and a loop of string', 't b', 'middle', 13)
    _ellipse(f, cx, cy, a, b, 'ln')
    f1, f2 = (cx - c, cy), (cx + c, cy)
    px, py = cx + a * math.cos(math.radians(60)), cy - b * math.sin(math.radians(60))
    f.line(*f1, px, py, 'ln m')
    f.line(*f2, px, py, 'ln m')
    f.circle(*f1, 4, 'fill-ink')
    f.circle(*f2, 4, 'fill-ink')
    f.circle(px, py, 3.5, 'fill-ink')
    f.text(px + 10, py - 2, 'pencil', 't', 'start', 12)
    f.text((f1[0] + px) / 2 - 10, (f1[1] + py) / 2, 'string', 't m', 'end', 12)
    f.text(f1[0], cy + 22, "the Sun's pin", 't', 'middle', 12)
    f.text(f2[0], cy + 22, 'the empty pin', 't', 'middle', 12)
    f.text(cx, 302, 'pin to pencil to pin: always the same length', 't m', 'middle', 12)
    f.line(320, 14, 320, 306, 'ln r')
    # right panel: Mars to scale
    cx, a, e = 470, 120, 0.093
    c, b = a * e, a * math.sqrt(1 - e * e)
    f.text(cx, 26, "Mars's orbit, to scale", 't b', 'middle', 13)
    f.text(cx, 44, 'the Sun sits 9% off centre', 't m', 'middle', 12)
    _ellipse(f, cx, cy, a, b, 'ln')
    f.line(cx - 5, cy, cx + 5, cy, 'ln m')
    f.line(cx, cy - 5, cx, cy + 5, 'ln m')
    f.line(cx, cy + 8, cx, cy + 56, 'ln m')
    f.text(cx, cy + 70, 'centre (empty)', 't m', 'middle', 12)
    f.circle(cx + c, cy, 6, 'fill-ink')
    f.text(cx + c + 10, cy + 4, 'Sun', 't b', 'start', 12)
    f.text(cx + a - 6, cy - 12, 'nearest', 't m', 'end', 12)
    f.text(cx - a + 4, cy - 12, 'farthest', 't m', 'start', 12)
    return f.svg()


# ------------------------------------------------------------------ earth-turns
@figure
def s_aryabhata_boat():
    """A moving boat with the bank seeming to slide back, beside a turning Earth with the stars seeming to drift west."""
    f = Fig(640, 300, 'Left: a boat moving along a river, with an arrow showing that the trees on the bank seem to slide '
                      'the other way. Right: a turning Earth with a person on top, and an arrow showing that the stars seem '
                      'to drift west while the ground turns east')
    f.text(160, 26, 'In a boat', 't b', 'middle', 13)
    f.text(160, 62, 'the trees seem to slide back', 't m', 'middle', 12)
    f.arrow(215, 74, 105, 74, 'muted', dash=True)
    for x in (50, 105, 160, 215, 270):
        f.line(x, 122, x, 142, 'ln')
        f.circle(x, 112, 11, 'wash-g')
        f.circle(x, 112, 11, 'ln g')
    f.line(20, 142, 300, 142, 'ln m')
    f.rect(20, 144, 280, 100, 'water', rx=0)
    f.path('M120,206 L200,206 L190,224 L130,224 Z', 'block')
    f.line(160, 206, 160, 186, 'ln')
    f.circle(160, 180, 5, 'fill-ink')
    f.arrow(205, 215, 268, 215, 'ink')
    f.text(236, 240, 'the boat moves', 't', 'middle', 12)
    f.line(320, 14, 320, 286, 'ln r')
    f.text(480, 26, 'Under the sky', 't b', 'middle', 13)
    f.text(480, 46, 'the stars seem to drift west', 't m', 'middle', 12)
    f.arrow(560, 58, 400, 58, 'muted', dash=True)
    for x, y, r in ((392, 76, 2.5), (428, 71, 2.5), (462, 78, 2.5), (480, 73, 3.5), (500, 69, 2.5), (536, 77, 2.5), (572, 72, 2.5)):
        f.circle(x, y, r, 'fill-ink')
    f.circle(480, 185, 62, 'plate')
    f.add('<path d="M434,170 Q480,132 526,170" class="ar ar-ink" fill="none" marker-end="url(#ah-ink)"/>')
    f.text(480, 196, 'Earth turns east', 't b', 'middle', 12)
    f.text(480, 214, '(you ride along)', 't m', 'middle', 12)
    f.circle(480, 123, 4, 'fill-ink')
    f.text(490, 120, 'you', 't', 'start', 12)
    return f.svg()


# ------------------------------------------------------------------ seasons
@figure
def s_tilt_year():
    """Earth at four points of its orbit with the axis (23.4°) pointing the same way; Mumbai noon-Sun heights."""
    f = Fig(640, 300, "The Sun in the middle and Earth at four points round it: June on the left with the north pole "
                      "leaning towards the Sun, December on the right leaning away, and the two equinoxes top and bottom. "
                      "Every axis is drawn parallel. Labels give Mumbai's noon Sun height: 86°, 71°, 47°")
    sx, sy = 320, 150
    _ellipse(f, sx, sy, 235, 62, 'ln dash')
    f.circle(sx, sy, 20, 'wash-n')
    f.circle(sx, sy, 20, 'ln')
    f.text(sx, sy + 5, 'Sun', 't b', 'middle', 12)
    t = math.radians(23.44)
    for x, y in ((85, 150), (555, 150), (320, 88), (320, 212)):
        f.circle(x, y, 15, 'plate')
        f.line(x - 22 * math.sin(t), y + 22 * math.cos(t), x + 22 * math.sin(t), y - 22 * math.cos(t), 'ln')
        f.line(x - 15 * math.cos(t), y - 15 * math.sin(t), x + 15 * math.cos(t), y + 15 * math.sin(t), 'ln m')
        f.text(x + 13, y - 21, 'N', 't m', 'start', 12)
    f.text(85, 100, 'June solstice', 't b', 'middle', 12)
    f.text(85, 214, 'noon Sun 86° over Mumbai', 't', 'middle', 12)
    f.text(85, 229, 'north leans towards the Sun', 't m', 'middle', 12)
    f.text(555, 100, 'December solstice', 't b', 'middle', 12)
    f.text(555, 214, 'noon Sun 47° over Mumbai', 't', 'middle', 12)
    f.text(555, 229, 'north leans away', 't m', 'middle', 12)
    f.text(320, 42, 'equinox: noon Sun 71°', 't m', 'middle', 12)
    f.text(320, 252, 'equinox', 't m', 'middle', 12)
    f.text(8, 288, 'early July: farthest from the Sun, 152.1 million km', 't m', 'start', 12)
    f.text(632, 288, 'early January: nearest, 147.1 million km', 't m', 'end', 12)
    return f.svg()


@figure
def s_slant_light():
    """The same beam width landing at 85.6° and 47.5°: ground footprint 1.0 against 1.35 (1/sin)."""
    f = Fig(640, 260, 'Two panels: on the left five parallel rays of sunlight falling almost straight down on a strip of '
                      'ground; on the right the same five rays arriving at a slant and lighting a strip 1.35 times as long')
    for x0, alpha, title, lab, sx in ((135, 85.64, 'June noon: Sun 86° high', 'ground lit: 1.0', 175),
                                      (430, 47.48, 'December noon: Sun 47° high', 'ground lit: 1.35 times as much', 565)):
        f.text(x0 + 30, 26, title, 't b', 'middle', 13)
        foot = 60 / math.sin(math.radians(alpha))
        L = 140
        ca, sa = math.cos(math.radians(alpha)), math.sin(math.radians(alpha))
        for i in range(5):
            gx = x0 + foot * i / 4
            f.ray(gx + L * ca, 200 - L * sa, gx, 200, chevrons=1)
        f.text(sx, 200 - L * sa - 8, 'sunlight', 't m', 'middle', 12)
        f.bracket_label(x0, x0 + foot, 214, lab, 12, up=False)
    f.ground(30, 200, 270)
    f.ground(340, 200, 270)
    return f.svg()


# ------------------------------------------------------------------ moon-phases
@figure
def s_phases_ring():
    """Top view of the Moon's orbit with the Sun-facing half lit, and the eight phases as seen from Earth."""
    f = Fig(640, 378, "Top: looking down on Earth with sunlight arriving from the left; eight Moons round the orbit, "
                      "each lit on its left half. Bottom: the matching eight shapes seen from Earth, from new through "
                      "crescent, first quarter, gibbous and full, and back")
    _hatch(f, 's_ph_hatch')
    ex, ey, ring = 320, 150, 95
    for y in (110, 150, 190):
        f.ray(18, y, 118, y, chevrons=1)
    f.text(68, 98, 'sunlight', 't m', 'middle', 12)
    f.circle(ex, ey, 13, 'plate')
    f.circle(ex, ey, 13, 'ln')
    f.text(ex + 18, ey + 4, 'Earth', 't', 'start', 12)
    f.add('<path d="M258,61.5 Q276,47 301,43.6" class="ar ar-muted" fill="none" marker-end="url(#ah-muted)"/>')
    f.text(236, 50, "the Moon's path", 't m', 'end', 12)
    for k in range(8):
        ang = math.radians(180 - 45 * k)
        x, y = ex + ring * math.cos(ang), ey - ring * math.sin(ang)
        _moon(f, x, y, 12, 270, 's_ph_hatch')      # left half lit: the half that faces the Sun
    f.text(ex - ring - 18, ey + 4, 'new', 't', 'end', 12)
    f.text(ex + ring + 18, ey + 4, 'full', 't', 'start', 12)
    f.text(ex, ey - ring - 19, 'first quarter', 't', 'middle', 12)
    f.text(ex, ey + ring + 27, 'third quarter', 't', 'middle', 12)
    f.text(560, 26, 'seen from above', 't m', 'end', 12)
    f.text(ex, 298, 'what we see from Mumbai', 't m', 'middle', 12)
    names = [('new', ''), ('waxing', 'crescent'), ('first', 'quarter'), ('waxing', 'gibbous'), ('full', ''),
             ('waning', 'gibbous'), ('third', 'quarter'), ('waning', 'crescent')]
    for i, (a_, b_) in enumerate(names):
        x = 70 + 71.4 * i
        _moon(f, x, 330, 15, 45 * i, 's_ph_hatch')
        f.text(x, 360, a_, 't', 'middle', 12)
        if b_:
            f.text(x, 374, b_, 't', 'middle', 12)
    return f.svg()


@figure
def s_eclipse_tilt():
    """Side view: the Moon's orbit tilted (drawn at 15°, really 5.1°) so new and full Moons miss the shadows."""
    f = Fig(640, 260, "Side view with the Sun at the far left, Earth in the middle and Earth's shadow stretching right. "
                      "The Moon's orbit is a tilted line through Earth: the full Moon on the right sits above the shadow, "
                      "and the new Moon on the left casts a shadow that passes below Earth")
    f.circle(40, 130, 36, 'wash-n')
    f.circle(40, 130, 36, 'ln')
    f.text(40, 135, 'Sun', 't b', 'middle', 12)
    f.line(90, 130, 625, 130, 'ln m dash')
    f.text(600, 116, "Earth's path round the Sun", 't m', 'end', 12)
    f.path('M342,119 L625,125 L625,135 L342,141 Z', 'wash')
    f.line(342, 119, 625, 125, 'ln m')
    f.line(342, 141, 625, 135, 'ln m')
    f.text(480, 156, "Earth's shadow", 't m', 'middle', 12)
    f.circle(330, 130, 12, 'plate')
    f.circle(330, 130, 12, 'ln')
    f.text(330, 108, 'Earth', 't', 'middle', 12)
    t = math.radians(15)
    f.line(330 - 200 * math.cos(t), 130 + 200 * math.sin(t), 330 + 200 * math.cos(t), 130 - 200 * math.sin(t), 'ln')
    f.text(140, 206, "the Moon's orbit, tilted (5° really; drawn as 15°)", 't m', 'start', 12)
    fx, fy = 330 + 190 * math.cos(t), 130 - 190 * math.sin(t)
    f.circle(fx, fy, 7, 'plate')
    f.circle(fx, fy, 7, 'ln')
    f.text(fx, fy - 17, 'full Moon: above the shadow, no eclipse', 't', 'middle', 12)
    nx, ny = 330 - 190 * math.cos(t), 130 + 190 * math.sin(t)
    f.path(f'M{nx + 5:.1f},{ny - 6:.1f} L330,{ny - 3:.1f} L330,{ny + 3:.1f} L{nx + 5:.1f},{ny + 6:.1f} Z', 'wash')
    f.line(nx + 5, ny - 6, 330, ny - 3, 'ln m')
    f.line(nx + 5, ny + 6, 330, ny + 3, 'ln m')
    f.circle(nx, ny, 7, 'plate')
    f.circle(nx, ny, 7, 'ln')
    f.text(240, 238, "new Moon's shadow passes below Earth", 't m', 'middle', 12)
    return f.svg()


# ------------------------------------------------------------------ tides
@figure
def s_tide_bulges():
    """Differential pull and two heaps (left); spring and neap line-ups (right). Exaggerated, as the caption says."""
    f = Fig(640, 320, "Left: Earth with two exaggerated heaps of water, one towards the Moon and one away, and three "
                      "arrows of different lengths showing the Moon's pull on the far side, the centre and the near side. "
                      "Right: Sun, Earth and Moon in a line for a spring tide, and at right angles for a neap tide")
    f.text(165, 26, "The Moon's pull is not the same everywhere", 't b', 'middle', 13)
    _ellipse(f, 150, 175, 92, 62, 'water')
    f.circle(150, 175, 62, 'plate')
    f.text(150, 150, 'Earth', 't b', 'middle', 13)
    f.arrow(88, 175, 116, 175, 'vector')
    f.arrow(150, 175, 186, 175, 'vector')
    f.arrow(236, 175, 280, 175, 'vector')
    f.text(88, 163, 'least', 't e', 'start', 12)
    f.text(150, 163, 'more', 't e', 'middle', 12)
    f.text(236, 163, 'most', 't e', 'start', 12)
    f.circle(312, 175, 8, 'plate')
    f.circle(312, 175, 8, 'ln')
    f.text(312, 199, 'Moon', 't', 'middle', 12)
    f.text(150, 264, 'pull per kilogram; differences exaggerated', 't m', 'middle', 12)
    f.text(150, 288, 'two heaps of water', 't e', 'middle', 12)
    f.line(105, 276, 64, 192, 'ln m')
    f.line(195, 276, 236, 192, 'ln m')
    f.line(330, 12, 330, 310, 'ln r')
    for y, rx, ry, moon, title, name in ((92, 37, 22, (566, 92), 'new or full Moon: Sun and Moon in line', 'spring tide: the two heaps add up'),
                                         (236, 26, 31, (485, 172), 'quarter Moon: Sun and Moon at right angles', 'neap tide: the heaps partly cancel')):
        _ellipse(f, 485, y, rx, ry, 'water')
        f.circle(485, y, 22, 'plate')
        f.circle(*moon, 6, 'plate')
        f.circle(*moon, 6, 'ln')
        f.arrow(430, y, 372, y, 'muted')
        f.text(401, y - 10, 'to the Sun', 't m', 'middle', 12)
        if y < 150:
            f.text(moon[0], moon[1] + 20, 'Moon', 't', 'middle', 12)
            f.text(485, 44, title, 't m', 'middle', 12)
            f.text(485, 138, name, 't b', 'middle', 12)
        else:
            f.text(moon[0] + 12, moon[1] + 4, 'Moon', 't', 'start', 12)
            f.text(485, 284, title, 't m', 'middle', 12)
            f.text(485, 302, name, 't b', 'middle', 12)
    return f.svg()


# ------------------------------------------------------------------ chandrayaan
def _orbit(f, cx_body, cy, rp_km, ra_km, R_km, s, cls):
    """An orbit with perigee rp_km and apogee ra_km above a body of radius R_km, drawn to scale s (px per km),
    apogee to the right. Returns (ellipse centre x, rx, ry)."""
    rp, ra = rp_km + R_km, ra_km + R_km
    a, c = (rp + ra) / 2, (ra - rp) / 2
    b = math.sqrt(a * a - c * c)
    _ellipse(f, cx_body + c * s, cy, a * s, b * s, cls)
    return cx_body + c * s, a * s, b * s


@figure
def s_orbit_raising():
    """Chandrayaan-3's Earth-bound orbits to scale (ISRO heights + 6,371 km): 173 x 41,762; 233 x 71,351; 288 x 369,328."""
    f = Fig(640, 340, "Earth at the left with two nested ellipses drawn to scale: the orbit after the first perigee firing "
                      "and the much longer one after the fourth, both with their low point just above Earth on the left. "
                      "A third curve leaves the top of the picture: the translunar loop of 1 August")
    ex, ey, s, RE = 110, 170, 0.0062, 6371
    f.circle(ex, ey, RE * s, 'plate')
    f.text(ex, ey + 5, 'Earth', 't b', 'middle', 13)
    cx1, rx1, _ = _orbit(f, ex, ey, 173, 41762, RE, s, 'ln')
    cx4, rx4, _ = _orbit(f, ex, ey, 233, 71351, RE, s, 'ln')
    # translunar loop: only the part that fits
    rp, ra = (288 + RE) * s, (369328 + RE) * s
    a, c = (rp + ra) / 2, (ra - rp) / 2
    b = math.sqrt(a * a - c * c)
    pts = []
    th = 180.0
    while th > 90:
        x, y = ex + c + a * math.cos(math.radians(th)), ey - b * math.sin(math.radians(th))
        if y < 6 or x > 636:
            break
        pts.append((x, y))
        th -= 0.5
    f.add(f'<path d="{_poly(pts)}" class="ar ar-ink" fill="none" marker-end="url(#ah-ink)"/>')
    f.text(262, 12, '1 August: the translunar loop,', 't', 'start', 12)
    f.text(262, 26, '288 × 369,328 km, out towards the Moon', 't', 'start', 12)
    for cx, rx in ((cx1, rx1), (cx4, rx4)):
        f.circle(cx + rx, ey, 3, 'fill-ink')
    f.circle(ex - (173 + RE) * s, ey, 3, 'fill-ink')
    f.lines(cx1 + rx1 - 8, 158, ['15 July, first firing:', '173 × 41,762 km', 'one lap: 12.5 h'], 't', 'end', 12, lh=1.33)
    f.lines(cx4 + rx4 - 6, 158, ['22 July, fourth firing:', '233 × 71,351 km', 'one lap: 23.9 h'], 't', 'end', 12, lh=1.33)
    f.line(62, 316, ex - (200 + RE) * s, ey + 8, 'ln m')
    f.text(10, 328, 'every firing happened here, at the low point', 't', 'start', 12)
    return f.svg()


@figure
def s_lunar_capture():
    """Around the Moon to scale (ISRO heights + 1,737 km): 164 x 18,074; 170 x 4,313; 174 x 1,437; 153 x 163."""
    f = Fig(640, 410, "The Moon at the left with four nested orbits drawn to scale: the long capture orbit of 5 August, "
                      "two shrinking ones, and a near-circle just above the surface. A legend at the bottom names each "
                      "with its date and size; an arrow at the nearest point marks the braking burn")
    mx, my, s, RM = 120, 180, 0.026, 1737.1
    f.circle(mx, my, RM * s, 'plate')
    f.text(mx, my + 5, 'Moon', 't b', 'middle', 13)
    rows = ((164, 18074, 'ln', '5 August: captured, 164 × 18,074 km, one lap about 28 h'),
            (170, 4313, 'ln m', '6 August: 170 × 4,313 km'),
            (174, 1437, 'ln dash', '9 August: 174 × 1,437 km'),
            (153, 163, 'ln e', '16 August: 153 × 163 km, about 2 h a lap'))
    for rp, ra, cls, _ in rows:
        _orbit(f, mx, my, rp, ra, RM, s, cls)
    px = mx - (164 + RM) * s
    f.force(px, my, 0, -40, '', 12)
    f.line(60, 66, px, my - 44, 'ln m')
    f.text(8, 60, 'braking burn: 1,835 s', 't', 'start', 12)
    for i, (_, _, cls, lab) in enumerate(rows):
        y = 356 + 16 * i
        f.line(20, y - 4, 52, y - 4, cls)
        f.text(60, y, lab, 't', 'start', 12)
    return f.svg()


# ------------------------------------------------------------------ planet-from-a-pen
@figure
def s_neptune_tug():
    """Schematic: Uranus pulled off its computed path by an unseen outer planet."""
    f = Fig(640, 300, "The Sun in the middle with two circular orbits round it. On the inner orbit a hollow circle marks "
                      "where the tables put Uranus and a filled circle, a little way off, where it really was; an arrow "
                      "from Uranus points at Neptune on the outer orbit")
    sx, sy = 320, 150
    f.circle(sx, sy, 85, 'ln dash')
    f.circle(sx, sy, 128, 'ln m')
    f.circle(sx, sy, 14, 'wash-n')
    f.circle(sx, sy, 14, 'ln')
    f.text(sx, sy + 5, 'Sun', 't b', 'middle', 12)
    f.text(sx, sy + 85 + 18, "Uranus's orbit, as calculated", 't m', 'middle', 12)
    f.text(sx, sy + 128 + 18, "Neptune's orbit", 't m', 'middle', 12)
    ux, uy = sx + 85 * math.cos(math.radians(150)), sy - 85 * math.sin(math.radians(150))
    ax, ay = sx + 92 * math.cos(math.radians(140)), sy - 92 * math.sin(math.radians(140))
    nx, ny = sx + 128 * math.cos(math.radians(120)), sy - 128 * math.sin(math.radians(120))
    f.circle(ux, uy, 6, 'ln')
    f.text(ux - 12, uy + 4, 'where the tables put Uranus', 't m', 'end', 12)
    f.circle(ax, ay, 6, 'fill-ink')
    f.text(ax + 12, ay + 4, 'where it really was', 't', 'start', 12)
    dx, dy = nx - ax, ny - ay
    n = math.hypot(dx, dy)
    f.force(ax, ay, dx / n * 30, dy / n * 30, '', 12)
    f.text(ax - 12, ay - 20, "Neptune's pull", 't p b', 'end', 12)
    f.circle(nx, ny, 7, 'plate')
    f.circle(nx, ny, 7, 'ln')
    f.text(nx + 12, ny - 2, 'Neptune (unseen)', 't', 'start', 12)
    return f.svg()


# ------------------------------------------------------------------ sun-watcher
@figure
def s_l1_balance():
    """The Sun's pull and Earth's opposite pull at L1, with the halo orbit round the point. Not to scale."""
    f = Fig(640, 260, "The Sun at the far left, Earth at the right, and between them the point L1 with a dashed loop "
                      "round it for the halo orbit. From L1 a long arrow points to the Sun and a short arrow points to "
                      "Earth: the Sun's pull and Earth's smaller pull the other way")
    f.circle(60, 130, 48, 'wash-n')
    f.circle(60, 130, 48, 'ln')
    f.text(60, 135, 'Sun', 't b', 'middle', 13)
    f.circle(560, 130, 13, 'plate')
    f.circle(560, 130, 13, 'ln')
    f.text(560, 162, 'Earth', 't', 'middle', 12)
    lx, ly = 470, 130
    _ellipse(f, lx, ly, 60, 85, 'ln dash')
    f.circle(lx, ly, 3.5, 'fill-ink')
    f.text(lx, ly + 20, 'L1', 't b', 'middle', 12)
    f.circle(lx, ly - 85, 4, 'fill-ink')
    f.text(lx, 30, 'Aditya-L1, looping round L1 every 178 days', 't', 'middle', 12)
    f.force(lx, ly, -90, 0, "the Sun's pull", 12)
    f.force(lx, ly, 30, 0, '', 12)
    f.text(lx + 15, ly - 12, "Earth's pull", 't p b', 'middle', 12)
    f.lines(lx, 232, ["combined: a little less than the Sun's pull alone,", 'exactly what a one-year lap needs'],
            't m', 'middle', 12, lh=1.33)
    return f.svg()
