"""Figures for Chapter 14, Earth, Moon and Sun. All drawings are ours. c14_tilt_orbit redraws the idea of OpenStax
Astronomy 2e Fig 4.5 (the axis keeps its lean round the orbit), c14_sun_height the idea of its Fig 4.6 (straight vs
slanted rays), c14_phases the idea of its Fig 4.14 with its scale problem stated in the caption, c14_eclipse_tilt the idea
of its eclipse-geometry figures, and c14_tides the idea of its differential-pull and two-bulge figures. Geometry and
numbers are ours (NASA fact sheets, computed in provenance/ch14.yml): latitude 19.08° N, tilt 23.44°, Moon 384,400 km."""
import math
from figs_core import Fig, figure

LAT = 19.08
TILT = 23.44


def _arc_points(cx, cy, r, a0, a1, n=28):
    """Points along a circle from angle a0 to a1 (radians, screen coordinates, y down)."""
    return [(cx + r * math.cos(a0 + (a1 - a0) * k / n), cy + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]


def _poly(f, pts, cls):
    f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + ' Z', cls)


def _lit_ball(f, x, y, r, sun_dx, sun_dy, lit='fill-vol', night='plate'):
    """A ball lit from direction (sun_dx, sun_dy): the half facing the light is lit, the other half is night."""
    n = math.hypot(sun_dx, sun_dy) or 1
    ux, uy = sun_dx / n, sun_dy / n
    a_light = math.atan2(uy, ux)
    f.circle(x, y, r, lit)
    _poly(f, _arc_points(x, y, r, a_light + math.pi / 2, a_light + 3 * math.pi / 2), night)
    f.circle(x, y, r, 'ln')


def _phase_disc(f, x, y, r, theta_deg, lit='fill-vol', night='plate'):
    """The Moon as seen from Earth at orbital angle theta from the Sun's direction (0 = new, 90 = first quarter,
    180 = full, 270 = third quarter). Waxing phases are lit on the right, waning on the left (northern sky)."""
    th = theta_deg % 360
    f.circle(x, y, r, night)
    if th == 0:
        f.circle(x, y, r, 'ln')
        return
    if th == 180:
        f.circle(x, y, r, lit)
        f.circle(x, y, r, 'ln')
        return
    waxing = th < 180
    c = math.cos(math.radians(th))        # +: crescent (less than half lit); -: gibbous
    rx = abs(c) * r
    top, bot = (x, y - r), (x, y + r)
    limb_sweep = 1 if waxing else 0       # top -> bottom along the lit limb
    # back from bottom to top along the terminator; it bulges towards the lit side for a crescent
    if waxing:
        term_sweep = 0 if c > 0 else 1
    else:
        term_sweep = 1 if c > 0 else 0
    d = f'M{top[0]:.1f},{top[1]:.1f} A{r},{r} 0 0 {limb_sweep} {bot[0]:.1f},{bot[1]:.1f} '
    if rx < 0.6:
        d += f'L{top[0]:.1f},{top[1]:.1f} Z'
    else:
        d += f'A{rx:.1f},{r} 0 0 {term_sweep} {top[0]:.1f},{top[1]:.1f} Z'
    f.path(d, lit)
    f.circle(x, y, r, 'ln')


@figure
def c14_boat():
    f = Fig(640, 300, 'Two pictures of the same effect. Left: a boat drifts down a river and the trees on the bank seem '
                      'to slide backwards. Right: the Earth turns eastward and the stars seem to slide west at 15 degrees an hour.')
    f.text(160, 28, 'From a drifting boat', 't b', 'middle', 14)
    f.text(480, 28, 'From the turning Earth', 't b', 'middle', 14)
    # left: river, bank, trees, boat
    f.rect(20, 200, 280, 46, 'water', rx=0)
    f.line(20, 200, 300, 200, 'ln m')
    f.ground(20, 170, 280, hatch=14, depth=6)
    for tx in (60, 120, 180, 240):
        f.line(tx, 170, tx, 140, 'ln')
        f.circle(tx, 128, 14, 'wash-g')
        f.circle(tx, 128, 14, 'ln m')
    f.path('M110,222 L190,222 L200,206 L100,206 Z', 'block')
    f.line(150, 206, 150, 182, 'ln')
    f.path('M150,182 L172,196 L150,196 Z', 'fill-ink')
    f.arrow(208, 232, 280, 232, 'vector')
    f.text(244, 262, 'the boat moves this way', 't e', 'middle', 13)
    f.arrow(240, 100, 80, 100, 'muted')
    f.text(160, 92, 'the bank seems to slide back', 't m', 'middle', 13)
    f.text(160, 282, 'the trees never moved', 't m', 'middle', 13)
    # right: Earth with axis, equator, Mumbai, rotation; stars
    cx, cy, R = 470, 160, 78
    f.circle(cx, cy, R, 'plate')
    t = math.radians(TILT)
    ax, ay = math.sin(t), -math.cos(t)
    f.line(cx - ax * (R + 18), cy - ay * (R + 18), cx + ax * (R + 18), cy + ay * (R + 18), 'ln dash')
    f.text(cx + ax * (R + 30), cy + ay * (R + 30) + 4, 'N', 't b', 'middle', 13)
    f.line(cx - R * math.cos(t), cy - R * math.sin(t), cx + R * math.cos(t), cy + R * math.sin(t), 'ln m')
    f.text(cx + R * math.cos(t) + 6, cy + R * math.sin(t) + 12, 'equator', 't m', 'start', 12)
    # Mumbai: a dot on the left limb, 19° north of the equator
    lat = math.radians(LAT)
    px = cx + (-math.cos(lat) * math.cos(t) + math.sin(lat) * math.sin(t)) * R
    py = cy + (-math.cos(lat) * math.sin(t) - math.sin(lat) * math.cos(t)) * R
    f.circle(px, py, 4, 'fill-ink')
    f.text(px - 8, py + 4, 'Mumbai, 19° N', 't', 'end', 13)
    f.curved_arrow(cx - 52, cy - R - 12, cx + 28, cy - R - 12, bend=-14, kind='vector')
    f.text(cx - 2, cy - R - 28, 'turns east, 15° an hour', 't e', 'end', 13)
    for sx, sy in ((592, 80), (618, 118), (600, 160), (622, 200), (594, 236)):
        f.circle(sx, sy, 2.2, 'fill-ink')
    f.text(608, 60, 'stars', 't m', 'middle', 12)
    f.arrow(600, 254, 510, 254, 'muted')
    f.text(505, 258, 'the stars seem to slide west', 't m', 'end', 13)
    f.text(480, 280, 'Mumbai is carried round at about 1,576 km/h', 't m', 'middle', 12)
    f.text(480, 294, 'and feels nothing', 't m', 'middle', 12)
    return f.svg()


@figure
def c14_tilt_orbit():
    f = Fig(640, 330, 'The Earth at four points of its orbit round the Sun, drawn from a slant. The axis leans the same '
                      'way at every point. In June the northern half leans towards the Sun; in December it leans away. '
                      'The orbit is nearest the Sun in early January and farthest in early July.')
    sx, sy = 320, 170
    f.path(f'M{sx - 250},{sy} A250,105 0 1 0 {sx + 250},{sy} A250,105 0 1 0 {sx - 250},{sy}', 'ln m dash')
    f.circle(sx, sy, 24, 'fill-vol')
    f.circle(sx, sy, 24, 'ln')
    f.text(sx, sy + 5, 'Sun', 't b', 'middle', 13)
    t = math.radians(TILT)
    ax, ay = math.sin(t), -math.cos(t)          # axis direction on the page, leaning right
    R = 20
    places = [
        (sx - 250, sy, 'June', 'north leans towards the Sun', 'end'),
        (sx + 250, sy, 'December', 'north leans away', 'start'),
        (sx, sy - 105, 'March', '', 'middle'),
        (sx, sy + 105, 'September', '', 'middle'),
    ]
    for ex, ey, name, note, anc in places:
        _lit_ball(f, ex, ey, R, sx - ex, sy - ey, lit='fill-sheet', night='wash')
        f.line(ex - ax * (R + 10), ey - ay * (R + 10), ex + ax * (R + 10), ey + ay * (R + 10), 'ln')
        f.text(ex + ax * (R + 20), ey + ay * (R + 20) + 4, 'N', 't b', 'middle', 12)
    f.text(sx - 250, sy + 52, 'June', 't b', 'middle', 14)
    f.text(sx - 250, sy + 70, 'north leans towards', 't', 'middle', 12)
    f.text(sx - 250, sy + 85, 'the Sun', 't', 'middle', 12)
    f.text(sx + 250, sy + 52, 'December', 't b', 'middle', 14)
    f.text(sx + 250, sy + 70, 'north leans away', 't', 'middle', 12)
    f.text(sx + 40, sy - 110, 'March', 't b', 'start', 13)
    f.text(sx + 40, sy + 112, 'September', 't b', 'start', 13)
    # perihelion and aphelion marks on the orbit, near December and June
    for ang, lab1, lab2, side in ((math.radians(-28), 'early January: nearest', '147.1 million km', 1),
                                  (math.radians(180 + 28), 'early July: farthest', '152.1 million km', -1)):
        px, py = sx + 250 * math.cos(ang), sy + 105 * math.sin(ang)
        f.circle(px, py, 3.5, 'fill-ink')
        # labels sit inside the orbit, towards the Sun
        f.text(px - side * 10, py - 2, lab1, 't', 'end' if side > 0 else 'start', 12)
        f.text(px - side * 10, py + 13, lab2, 't m', 'end' if side > 0 else 'start', 12)
    # direction of travel
    f.curved_arrow(sx + 120, sy + 100, sx + 200, sy + 70, bend=-6, kind='muted')
    f.text(sx + 170, sy + 102, 'Earth moves this way', 't m', 'start', 12)
    f.text(320, 318, 'The axis always leans the same way; only the Earth’s place on the orbit changes', 't m', 'middle', 12)
    return f.svg()


@figure
def c14_sun_height():
    f = Fig(640, 320, 'Three panels: Mumbai at noon on the June solstice, at the equinoxes and at the December solstice. '
                      'The Sun stands 85.6, 70.9 and 47.5 degrees above the horizon, and a beam of the same width lights '
                      '1.00, 1.06 and 1.36 metres of ground.')
    panels = [(20, 'June solstice', 85.64, +1, '13.2 h of daylight', 1.00),
              (225, 'Equinoxes', 70.92, -1, '12 h of daylight', 1.06),
              (430, 'December solstice', 47.48, -1, '10.9 h of daylight', 1.36)]
    g = 232          # ground level
    W = 36           # beam width
    for x0, title, alt, side, hours, patch in panels:
        f.text(x0 + 95, 26, title, 't b', 'middle', 14)
        f.ground(x0 + 6, g, 178, hatch=12, depth=6)
        a = math.radians(alt)
        # light direction (unit), coming down: from the Sun side ('side' = +1 means the Sun is to the left of overhead)
        dx, dy = -side * math.cos(a), math.sin(a)
        nx, ny = -dy, dx                      # perpendicular to the beam
        # centre line hits the ground at the panel middle
        hx = x0 + 95
        L = 150                                # beam length drawn
        cx, cy = hx - dx * L, g - dy * L       # start of the beam (Sun end)
        pts = []
        for s in (-W / 2, W / 2):
            px, py = cx + nx * s, cy + ny * s
            gx = px + (g - py) * dx / dy
            pts.append((px, py, gx))
        beam = [(pts[0][0], pts[0][1]), (pts[1][0], pts[1][1]), (pts[1][2], g), (pts[0][2], g)]
        _poly(f, beam, 'wash-n')
        f.line(pts[0][0], pts[0][1], pts[0][2], g, 'ray')
        f.line(pts[1][0], pts[1][1], pts[1][2], g, 'ray')
        f.circle(cx, cy, 13, 'fill-vol')
        f.circle(cx, cy, 13, 'ln')
        # lit patch
        xa, xb = sorted((pts[0][2], pts[1][2]))
        f.line(xa, g, xb, g, 'ln p')
        f.bracket_label(xa, xb, g + 20, f'{patch:.2f} m lit', 12, up=False)
        # altitude label beside the Sun disc, on the side away from the beam
        f.text(cx + 18, cy + 5, f'Sun {alt:.1f}° high', 't', 'start', 13)
        f.text(x0 + 95, 304, hours, 't m', 'middle', 12)
    return f.svg()


@figure
def c14_phases():
    f = Fig(640, 360, 'The Moon at eight points in its orbit round the Earth, lit from the right by the Sun; the half '
                      'facing the Sun is always lit. Below, the shape seen from Earth at each point: new, waxing crescent, '
                      'first quarter, waxing gibbous, full, waning gibbous, third quarter, waning crescent.')
    ex, ey, Ro = 320, 150, 108
    f.circle(ex, ey, Ro, 'ln m dash')
    _lit_ball(f, ex, ey, 18, 1, 0, lit='fill-sheet', night='wash')
    f.text(ex, ey + 4, 'Earth', 't b', 'middle', 12)
    for yy in (50, 250):
        f.ray(630, yy, 530, yy, chevrons=2)
    f.text(600, 40, 'sunlight', 't nn', 'middle', 12)
    f.text(600, 268, 'sunlight', 't nn', 'middle', 12)
    names = ['new', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full', 'waning gibbous', 'third quarter', 'waning crescent']
    order = []
    for k in range(8):
        th = 45 * k                                   # orbital angle from the Sun direction, anticlockwise on the page
        mx = ex + Ro * math.cos(math.radians(th))
        my = ey - Ro * math.sin(math.radians(th))
        _lit_ball(f, mx, my, 12, 1, 0)
        order.append((k, th))
    f.text(ex + Ro + 26, ey + 4, 'new', 't m', 'start', 12)
    f.text(ex - Ro - 26, ey + 4, 'full', 't m', 'end', 12)
    f.text(ex, ey - Ro - 20, 'first quarter', 't m', 'middle', 12)
    f.text(ex, ey + Ro + 26, 'third quarter', 't m', 'middle', 12)
    f.curved_arrow(ex + Ro * .72, ey - Ro * .72 - 14, ex + Ro * .35, ey - Ro * .95 - 14, bend=-4, kind='muted')
    f.text(ex + Ro * .9, ey - Ro * .9 - 10, 'the Moon moves', 't m', 'start', 11)
    f.text(ex + Ro * .9, ey - Ro * .9 + 3, 'this way', 't m', 'start', 11)
    # bottom row: what we see
    f.text(20, 296, 'Seen from Earth:', 't b', 'start', 12)
    xs = [150 + 66 * k for k in range(8)]
    for k, th in order:
        _phase_disc(f, xs[k], 318, 13, th)
        lab = names[k].split(' ')
        for j, w in enumerate(lab):
            f.text(xs[k], 343 + 12 * j, w, 't m', 'middle', 11)
    return f.svg()


@figure
def c14_eclipse_tilt():
    f = Fig(640, 300, 'Two side views of the Sun, Earth and new Moon. Left, most months: the Moon’s orbit is tilted to the '
                      'plane of the Earth’s orbit, the new Moon sits above that plane and its shadow passes above the Earth. '
                      'Right, twice a year: the Sun lies along the line where the two planes cross, the new Moon is in the '
                      'plane, and its shadow reaches the Earth.')
    panels = [(0, 'Most months: the shadow misses', True), (320, 'Twice a year: an eclipse', False)]
    for x0, title, tilted in panels:
        f.text(x0 + 160, 26, title, 't b', 'middle', 14)
        plane = 160
        f.line(x0 + 14, plane, x0 + 306, plane, 'ln m dash')
        f.text(x0 + 306, plane + 16, 'plane of the Earth’s orbit', 't m', 'end', 11)
        for yy in (plane - 24, plane, plane + 24):
            f.ray(x0 + 14, yy, x0 + 64, yy, chevrons=1)
        f.text(x0 + 16, plane - 36, 'sunlight', 't nn', 'start', 11)
        exx, eyy = x0 + 236, plane
        mx = x0 + 120
        if tilted:
            my = plane - 50                      # exaggerated tilt: really 5°, drawn about 23°
            f.line(exx - (exx - mx) * 1.2, eyy - (eyy - my) * 1.2, exx + (exx - mx) * 1.2, eyy + (eyy - my) * 1.2, 'ln dash')
            f.text(x0 + 16, 246, 'Moon’s orbit, tilted about 5° (drawn steeper)', 't', 'start', 11)
        else:
            my = plane
            f.line(mx - 20, eyy + 3, exx + (exx - mx) * 1.2, eyy - 3, 'ln dash')
            f.text(x0 + 16, 246, 'Moon’s orbit, seen along its tilt', 't', 'start', 11)
        # shadow cones from the Moon, away from the Sun (to the right): umbra dark, penumbra light
        rM = 7
        L = 140
        _poly(f, [(mx, my - rM), (mx + L, my - 20), (mx + L, my + 20), (mx, my + rM)], 'wash')
        _poly(f, [(mx, my - rM), (mx + L, my), (mx, my + rM)], 'fill-ink')
        f.circle(mx, my, rM, 'plate')
        f.circle(mx, my, rM, 'ln')
        f.text(mx, my - 15, 'new Moon', 't', 'middle', 11)
        # Earth
        f.circle(exx, eyy, 13, 'plate')
        f.circle(exx, eyy, 13, 'ln')
        f.text(exx + 20, eyy + 5, 'Earth', 't', 'start', 11)
        if tilted:
            f.text(x0 + 306, my - 18, 'shadow passes', 't m', 'end', 11)
            f.text(x0 + 306, my - 6, 'above the Earth', 't m', 'end', 11)
            f.line(mx, my + rM + 3, mx, plane - 3, 'ln m')
            f.text(mx + 6, (my + plane) / 2 + 4, 'up to 34,000 km', 't m', 'start', 11)
            f.text(x0 + 160, 268, 'Earth’s radius is only 6,371 km,', 't m', 'middle', 11)
            f.text(x0 + 160, 282, 'so most months the shadow misses', 't m', 'middle', 11)
        else:
            f.text(mx + 70, my - 26, 'umbra', 't m', 'middle', 11)
            f.text(mx + 70, my + 34, 'penumbra', 't m', 'middle', 11)
            f.text(x0 + 160, 268, 'The tilt is fixed in space;', 't m', 'middle', 11)
            f.text(x0 + 160, 282, 'the Sun lines up with it twice a year', 't m', 'middle', 11)
    return f.svg()


@figure
def c14_tides():
    f = Fig(640, 330, 'The Earth with the Moon far off to the right. Three force arrows show the Moon’s pull on the near '
                      'sea, on the Earth’s centre and on the far sea, the near one longest. Water flows along the surface '
                      'into two exaggerated bulges, one towards the Moon and one away from it.')
    ex, ey, R = 230, 165, 70
    # the two heaps: an ellipse stretched towards and away from the Moon (hugely exaggerated)
    f.path(f'M{ex - R - 38},{ey} A{R + 38},{R + 5} 0 1 0 {ex + R + 38},{ey} A{R + 38},{R + 5} 0 1 0 {ex - R - 38},{ey}', 'water')
    f.circle(ex, ey, R, 'plate')
    f.text(ex, ey - 8, 'Earth', 't b', 'middle', 13)
    f.text(ex, ey + 10, 'turns once a day', 't m', 'middle', 11)
    # Moon, far off to the right
    mx, my = 604, ey
    f.circle(mx, my, 14, 'plate')
    f.circle(mx, my, 14, 'ln')
    f.text(mx, my - 22, 'Moon', 't b', 'middle', 13)
    # the Moon's pull on three places: near sea, centre, far sea (the real 3.4% steps are drawn about four times larger)
    f.force(ex + R + 34, ey - 34, 78, 0, 'near sea: pulled most', 12)
    f.force(ex, ey, 68, 0, 'Earth’s centre', 12)
    f.force(ex - R - 34, ey + 34, 58, 0, 'far sea: pulled least', 12)
    # the differences, relative to the Earth as a whole
    f.vector(ex + R + 42, ey + 60, 26, 0, 'tug towards the Moon', 12, kind='muted')
    f.vector(ex - R - 42, ey - 60, -26, 0, 'tug away', 12, kind='muted')
    # water flowing along the surface into the heaps
    for sgn in (-1, 1):
        f.curved_arrow(ex + sgn * 30, ey - R - 14, ex + sgn * (R + 2), ey - 42, bend=-sgn * 10, kind='vector')
        f.curved_arrow(ex + sgn * 30, ey + R + 14, ex + sgn * (R + 2), ey + 42, bend=sgn * 10, kind='vector')
    f.text(ex, ey - R - 26, 'water flows sideways into the two heaps', 't e', 'middle', 12)
    f.text(ex - R - 46, ey + 96, 'heap away', 't e', 'middle', 12)
    f.text(ex - R - 46, ey + 109, 'from the Moon', 't e', 'middle', 12)
    f.text(ex + R + 46, ey + 96, 'heap towards', 't e', 'middle', 12)
    f.text(ex + R + 46, ey + 109, 'the Moon', 't e', 'middle', 12)
    f.text(320, 318, 'Heaps and the 7% difference in pull are exaggerated; the Moon is really 60 Earth-radii away', 't m', 'middle', 12)
    return f.svg()
