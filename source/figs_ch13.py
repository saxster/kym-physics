"""Figures for Chapter 13, Magnetism and electromagnetism. All drawings are ours. c13_domains follows the idea of
OpenStax Physics Fig 20.7 (domains before and after), c13_earth_field of Physics Fig 20.9 and College Physics 2e Fig 22.3
(Earth as a bar magnet, field loops), c13_wire_field of Physics Fig 20.13 (right-hand rule), c13_motor_force of Physics
Figs 20.23-20.25 (loop and brushes), c13_induction of College Physics 2e Fig 23.4 (magnet in coil) and c13_em_wave of
Physics Fig 15.2 (E perpendicular to B), all redrawn with our own numbers. Numbers (python3 -I, 2026-10-28): Mumbai field
from WMM2025 F 43.6 uT, H 38.4, Z 20.7, dip 28.3 deg; 1 A at 1 cm -> 20 uT, needle 27.5 deg; ladder rungs by log10 of
wavelength."""
import math
from figs_core import Fig, figure, catmull


def _magnet(f, x, y, w, h, horizontal=True, n_first=True, size=13):
    """A bar magnet; N half and S half labelled. Returns nothing."""
    if horizontal:
        f.rect(x, y, w / 2, h, 'wash-p' if n_first else 'wash-e', rx=3)
        f.rect(x + w / 2, y, w / 2, h, 'wash-e' if n_first else 'wash-p', rx=3)
        f.rect(x, y, w, h, 'ln', rx=3)
        f.text(x + w / 4, y + h / 2 + size * .35, 'N' if n_first else 'S', 't b', 'middle', size)
        f.text(x + 3 * w / 4, y + h / 2 + size * .35, 'S' if n_first else 'N', 't b', 'middle', size)
    else:
        f.rect(x, y, w, h / 2, 'wash-p' if n_first else 'wash-e', rx=3)
        f.rect(x, y + h / 2, w, h / 2, 'wash-e' if n_first else 'wash-p', rx=3)
        f.rect(x, y, w, h, 'ln', rx=3)
        f.text(x + w / 2, y + h / 4 + size * .35, 'N' if n_first else 'S', 't b', 'middle', size)
        f.text(x + w / 2, y + 3 * h / 4 + size * .35, 'S' if n_first else 'N', 't b', 'middle', size)


def _small_arrow(f, x, y, ang_deg, L=14, kind='ink'):
    a = math.radians(ang_deg)
    dx, dy = L * math.cos(a), -L * math.sin(a)
    f.arrow(x - dx / 2, y - dy / 2, x + dx / 2, y + dy / 2, kind, 1.6)


# ---------------------------------------------------------------- 13.1
@figure
def c13_domains():
    f = Fig(640, 300, 'Two blocks of iron drawn as grids of domains, each domain a small arrow. Left, no magnet near: '
                      'the arrows point every way and cancel. Right, a bar magnet above with its north end down: every '
                      'arrow points down, the top of the block has become a south pole, the bottom a north pole, and the '
                      'block is pulled up towards the magnet.')
    angles = [20, 160, 250, 95, 310, 45, 200, 130, 350, 80, 230, 15, 290, 110, 60, 180, 335, 145, 265, 30]

    def block(x0, y0, w, h, cols, rows, dirs):
        f.rect(x0, y0, w, h, 'plate', rx=4)
        cw, ch = w / cols, h / rows
        k = 0
        for r in range(rows):
            for c in range(cols):
                f.rect(x0 + c * cw, y0 + r * ch, cw, ch, 'ln m', rx=0)
                _small_arrow(f, x0 + (c + .5) * cw, y0 + (r + .5) * ch, dirs[k % len(dirs)], 16)
                k += 1

    f.text(160, 24, 'No magnet near', 't b', 'middle', 14)
    block(60, 70, 200, 150, 5, 4, angles)
    f.text(160, 246, 'domains point every way and cancel:', 't', 'middle', 12)
    f.text(160, 262, 'the block is not a magnet', 't', 'middle', 12)
    f.line(320, 20, 320, 280, 'ln r')
    f.text(480, 24, 'A magnet brought near', 't b', 'middle', 14)
    _magnet(f, 455, 40, 50, 44, horizontal=False, n_first=False)     # S on top, N at the bottom, nearest the block
    block(380, 112, 200, 150, 5, 4, [270])
    f.text(590, 124, 'S', 't b', 'start', 15)
    f.text(590, 258, 'N', 't b', 'start', 15)
    f.force(370, 190, 0, -60, 'pulled', 12)
    f.text(480, 288, 'all domains agree: the block is a magnet', 't', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- 13.2
@figure
def c13_earth_field():
    f = Fig(640, 360, 'Left: the Earth with its magnetic field lines, which loop from the magnetic north pole near the '
                      'geographic South Pole round to the magnetic south pole near the geographic North Pole. Mumbai is '
                      'marked at 19 degrees north. Right: the field at Mumbai, 43.6 microtesla dipping 28 degrees below '
                      'the horizontal, split into a horizontal part of 38.4 pointing north and a downward part of 20.7; a '
                      'level compass needle shows only the horizontal part.')
    cx, cy, R = 200, 178, 100
    # dipole field lines r = L sin^2(theta), theta from the axis; draw only outside the Earth
    for L in (1.3, 1.65, 2.1):
        pts = []
        for k in range(0, 361, 3):
            th = math.radians(k)
            r = L * R * math.sin(th) ** 2
            x, y = cx + r * math.sin(th), cy + r * math.cos(th)      # theta from the top (north) axis
            if r < R + 1 or x > 356 or x < 14:                        # keep the loops out of the right-hand panel
                if pts:
                    f.path(catmull(pts), 'ln e')
                    pts = []
                continue
            pts.append((x, y))
        if pts:
            f.path(catmull(pts), 'ln e')
    # arrowheads: the field goes from the magnetic N (bottom) round to the magnetic S (top): upward at the sides
    for L in (1.3, 1.65):
        f.vector(cx - L * R, cy + 12, 0, -24, '', 12)
    f.vector(cx + 1.3 * R, cy + 12, 0, -24, '', 12)
    f.circle(cx, cy, R, 'water')
    f.circle(cx, cy, R, 'ln')
    f.line(cx, cy - R - 26, cx, cy + R + 8, 'ln dash')
    f.text(cx, cy - R - 32, 'geographic North Pole', 't', 'middle', 12)
    f.text(cx, cy - R + 22, 'magnetic S', 't b', 'middle', 13)
    f.text(cx, cy + R - 10, 'magnetic N', 't b', 'middle', 13)
    f.text(cx, cy + R + 22, 'geographic South Pole', 't', 'middle', 12)
    f.line(cx - R, cy, cx + R, cy, 'ln m dash')
    f.text(cx + R + 4, cy + 4, 'equator', 't m', 'start', 12)
    phi = math.radians(19.08)
    mx, my = cx + R * math.cos(phi), cy - R * math.sin(phi)
    f.circle(mx, my, 4, 'fill-ink')
    f.text(mx - 8, my - 8, 'Mumbai, 19° N', 't b', 'end', 12)
    f.text(20, 344, 'field lines: the way a compass points at each place', 't m', 'start', 11)
    # ---- right: the field at Mumbai
    f.line(372, 20, 372, 350, 'ln r')
    f.text(506, 30, 'At Mumbai', 't b', 'middle', 14)
    gx, gy = 440, 130          # a point on the ground
    f.ground(400, gy, 220)
    f.text(620, gy - 8, 'north →', 't m', 'end', 12)
    sc = 2.6                   # px per microtesla
    H, Z = 38.4, 20.7
    f.vector(gx, gy, H * sc, 0, '', 12)
    f.text(gx + H * sc / 2, gy - 8, 'horizontal: 38.4 μT', 't e b', 'middle', 12)
    f.vector(gx, gy, 0, Z * sc, '', 12)
    f.text(gx + 8, gy + Z * sc - 4, 'down 20.7 μT', 't e', 'start', 12)
    f.vector(gx, gy, H * sc, Z * sc, '', 12)
    f.text(gx + H * sc, gy + Z * sc + 22, 'the whole field: 43.6 μT', 't e b', 'end', 12)
    f.text(gx + H * sc, gy + Z * sc + 36, 'dipping 28° into the ground', 't e', 'end', 12)
    # dip angle arc
    f.path(f'M{gx + 60},{gy} A60,60 0 0 1 {gx + 60 * math.cos(math.radians(28.3)):.1f},{gy + 60 * math.sin(math.radians(28.3)):.1f}', 'ln m')
    f.text(gx + 66, gy + 20, '28°', 't m', 'start', 12)
    # compass needle lying level
    ny = 286
    f.circle(506, ny, 28, 'ln m')
    f.line(506, ny, 530, ny, 'ln p', 'stroke-width="3"')
    f.line(506, ny, 482, ny, 'ln', 'stroke-width="3"')
    f.text(536, ny + 4, 'N', 't p b', 'start', 12)
    f.text(506, ny + 44, 'a level compass shows only the horizontal part:', 't', 'middle', 11)
    f.text(506, ny + 57, '38.4 μT, pointing within a fraction', 't m', 'middle', 11)
    f.text(506, ny + 70, 'of a degree of true north', 't m', 'middle', 11)
    return f.svg()


# ---------------------------------------------------------------- 13.3
@figure
def c13_wire_field():
    f = Fig(640, 320, 'Left: a vertical wire with the current flowing up, ringed by circular field lines drawn in '
                      'perspective, closer together near the wire; seen from above the field runs anticlockwise. Labels '
                      'give 20 microtesla at 1 centimetre for 1 ampere, 10 at 2 centimetres, 6.7 at 3. Right: a compass '
                      'under a north-south wire carrying 1 ampere; the Earth''s 38 microtesla northward and the wire''s 20 '
                      'eastward add to swing the needle 27 degrees east of north.')
    wx, wy = 150, 170
    for k, rx in enumerate((34, 68, 102)):
        ry = rx * .36
        # back half (dashed, behind the wire) then front half
        f.path(f'M{wx - rx},{wy} A{rx},{ry} 0 0 1 {wx + rx},{wy}', 'ln e dash')
        f.path(f'M{wx + rx},{wy} A{rx},{ry} 0 0 1 {wx - rx},{wy}', 'ln e')
        # arrowhead on the front arc pointing right (anticlockwise seen from above)
        f.vector(wx - 10, wy + ry, 20, 0, '', 12)
    f.line(wx, 30, wx, 300, 'ln', 'stroke-width="3"')
    f.vector(wx + 16, 110, 0, -60, 'current I, up', 12)
    for rx, lab, ly in ((34, '20 μT, 1 cm', 204), (68, '10 μT, 2 cm', 220), (102, '6.7 μT, 3 cm', 236)):
        ry = rx * .36
        f.line(wx + rx * .8, wy + ry * .6, 236, ly - 4, 'ln m')
        f.text(240, ly, lab, 't e', 'start', 12)
    f.text(20, 50, 'for 1 A:', 't m', 'start', 12)
    f.lines(20, 262, ['right thumb along the current,', 'fingers curl the way the field goes'], 't', 'start', 12)
    f.line(330, 20, 330, 300, 'ln r')
    # ---- right: compass under a wire
    cx, cy, r = 440, 140, 56
    f.text(485, 30, 'Compass under a north–south wire', 't b', 'middle', 14)
    f.circle(cx, cy, r, 'ln m')
    f.text(cx, cy - r - 8, 'N', 't m', 'middle', 12)
    f.text(cx + r + 10, cy + 4, 'E', 't m', 'start', 12)
    f.line(cx, cy - r - 24, cx, cy + r + 24, 'ln', 'stroke-width="3"')
    # With the compass below the wire, southward current gives an eastward field.
    f.vector(cx, cy + 8, 0, 42, '', 12)
    f.text(cx - 8, cy + 42, 'I south', 't e', 'end', 12)
    f.text(cx, cy + r + 36, 'the wire, 1 cm above, 1 A', 't', 'middle', 12)
    a = math.radians(27.5)
    f.line(cx, cy, cx + 46 * math.sin(a), cy - 46 * math.cos(a), 'ln p', 'stroke-width="3.5"')
    f.line(cx, cy, cx - 46 * math.sin(a), cy + 46 * math.cos(a), 'ln', 'stroke-width="3.5"')
    f.path(f'M{cx},{cy - 40} A40,40 0 0 1 {cx + 40 * math.sin(a):.1f},{cy - 40 * math.cos(a):.1f}', 'ln m')
    f.text(cx + 14, cy - 44, '27°', 't m', 'start', 12)
    # the two fields that add
    vx, vy = 560, 292
    s = 1.8
    f.vector(vx, vy, 0, -38.4 * s, '', 12)
    f.text(vx - 6, vy - 38.4 * s / 2, 'Earth, 38 μT', 't e', 'end', 12)
    f.vector(vx, vy, 20 * s, 0, '', 12)
    f.text(vx + 20 * s / 2, vy + 16, 'wire, 20 μT', 't e', 'middle', 12)
    f.vector(vx, vy, 20 * s, -38.4 * s, '', 12, dash=True)
    f.text(vx + 20 * s + 6, vy - 38.4 * s + 4, 'sum', 't e b', 'start', 12)
    return f.svg()


# ---------------------------------------------------------------- 13.4
@figure
def c13_motor_force():
    f = Fig(640, 350, 'Left: current up the page crossed with a magnetic field to the right gives a force into the page, shown by a cross in a circle. Right: a loop seen end-on between north and south poles carries current out of the page on the left and into the page on the right, giving upward and downward forces and clockwise torque. A dot means towards you; a cross means away.')
    f.text(158,28,'One wire: three directions','t b','middle',16)
    f.text(480,28,'A loop, seen from the end','t b','middle',16)
    f.line(320,18,320,321,'ln r')
    for yy in (104,150,196): f.vector(28,yy,260,0)
    f.text(285,85,'field B →','t e','end',13)
    f.line(156,76,156,244,'ln', 'stroke-width="4"')
    f.vector(156,239,0,-55)
    f.text(171,233,'current I ↑','t e b',size=13)
    f.circle(156,150,15,'block')
    for d in (-1,1): f.line(149,150+d*7,163,150-d*7,'ln p')
    f.text(158,278,'force goes INTO the page','t p b','middle',13)
    f.text(158,300,'perpendicular to both I and B','t m','middle',12)
    for xx,lab,cls in ((344,'N','wash-p'),(580,'S','wash-e')):
        f.rect(xx,104,36,112,cls,rx=3)
        f.rect(xx,104,36,112,'ln',rx=3)
        f.text(xx+18,164,lab,'t b','middle',18)
    for yy in (128,166,204): f.vector(388,yy,183,0,kind='muted')
    f.line(412,166,548,166,'ln', 'stroke-width="3"')
    f.line(480,83,480,252,'ln m dash')
    f.text(480,77,'axle','t m','middle',12)
    for xx,out in ((412,True),(548,False)):
        f.circle(xx,166,12,'block')
        if out: f.circle(xx,166,4,'fill-ink')
        else:
            f.line(xx-5,161,xx+5,171,'ln')
            f.line(xx-5,171,xx+5,161,'ln')
        f.force(xx,151 if out else 181,0,-56 if out else 56)
    f.text(404,89,'push up','t p b','middle',12)
    f.text(550,255,'push down','t p b','middle',12)
    f.curved_arrow(447,112,514,112,bend=-27,kind='proton')
    f.text(480,283,'opposite forces turn the loop','t b','middle',13)
    f.text(480,304,'current reverses every half-turn','t m','middle',12)
    f.text(320,338,'⊙ current towards you     ⊗ current away from you','t','middle',14)
    return f.svg()


# ---------------------------------------------------------------- 13.5
def _coil(f, x, y, n=6, w=90, h=44):
    """A coil seen from the side: n turns as loops along the x axis."""
    step = w / n
    for k in range(n):
        cx = x + step * (k + .5)
        f.path(f'M{cx - step * .5},{y + h / 2} A{step * .5},{h / 2} 0 0 1 {cx + step * .5},{y + h / 2}', 'ln')
        f.path(f'M{cx + step * .5},{y + h / 2} A{step * .5},{h / 2} 0 0 1 {cx - step * .5},{y + h / 2}', 'ln dash')
    f.line(x, y + h / 2, x - 12, y + h / 2, 'ln')
    f.line(x + w, y + h / 2, x + w + 12, y + h / 2, 'ln')


def _meter(f, x, y, needle_deg):
    """A meter: a semicircular dial with a needle; 0 is straight up, positive degrees to the right."""
    f.path(f'M{x - 30},{y} A30,30 0 0 1 {x + 30},{y}', 'ln m')
    f.line(x - 30, y, x + 30, y, 'ln m')
    f.text(x, y - 36, '0', 't m', 'middle', 12)
    a = math.radians(needle_deg)
    f.line(x, y, x + 26 * math.sin(a), y - 26 * math.cos(a), 'ln p', 'stroke-width="2.5"')
    f.circle(x, y, 2.5, 'fill-ink')


@figure
def c13_induction():
    f = Fig(640, 300, 'Three panels of a bar magnet and a coil wired to a meter. Left: the magnet moves into the coil '
                      'and the meter needle kicks to the right. Middle: the magnet sits still inside the coil and the '
                      'needle reads zero. Right: the magnet moves out and the needle kicks to the left.')

    def panel(x0, title, mag_x, vel, needle, note):
        f.text(x0 + 100, 18, title, 't b', 'middle', 14)
        cy = 150
        _coil(f, x0 + 70, cy - 22, 6, 90, 44)
        _magnet(f, mag_x, cy - 11, 70, 22, horizontal=True, n_first=True, size=12)
        if vel:
            f.vector(mag_x + (74 if vel > 0 else -4), cy, vel, 0, '', 12)
        # leads up to the meter
        f.line(x0 + 58, cy, x0 + 58, 72, 'ln')
        f.line(x0 + 172, cy, x0 + 172, 72, 'ln')
        f.line(x0 + 58, 72, x0 + 86, 72, 'ln')
        f.line(x0 + 172, 72, x0 + 144, 72, 'ln')
        _meter(f, x0 + 115, 72, needle)
        f.text(x0 + 100, 226, note, 't', 'middle', 12)

    panel(10, 'Moving in', 10, 28, 42, 'needle kicks right')
    panel(220, 'Held still', 270, 0, 0, 'nothing, however strong the magnet')
    panel(430, 'Moving out', 420, -28, -42, 'needle kicks left')
    f.line(214, 20, 214, 240, 'ln r')
    f.line(424, 20, 424, 240, 'ln r')
    f.text(320, 266, 'only a changing field through the coil makes a current; faster change, bigger kick', 't', 'middle', 13)
    f.text(320, 286, 'the meter needles are drawn with equal swings; a real meter also shows the speed', 't m', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- 13.6
@figure
def c13_em_wave():
    f = Fig(640, 340, 'Left: an electromagnetic wave travelling to the right, with the electric field drawn as a '
                      'vertical sine wave and the magnetic field as a sine wave in the horizontal plane, at right angles '
                      'to it. Right: the ladder of light, a vertical scale of wavelength in powers of ten from six '
                      'thousand kilometres at the top to X-rays at the bottom, with rungs for 50 hertz mains, metre '
                      'radio waves, Bose''s 5 millimetre waves, a remote''s 940 nanometre infrared, visible light, '
                      'ultraviolet and X-rays.')
    # ---- left: the wave
    f.text(160, 26, 'One wave, two fields', 't b', 'middle', 14)
    x0, yc, W = 30, 160, 270
    f.line(x0, yc, x0 + W, yc, 'ln m')
    f.wave(x0, yc, W, 52, 120, 0, 'ln e')
    # B in the "horizontal" plane, drawn slanted
    pts = []
    for k in range(0, int(W) + 1, 3):
        a = 36 * math.sin(2 * math.pi * k / 120)
        pts.append((x0 + k + a * .55, yc + a * .28))
    f.path('M' + ' L'.join(f'{px:.1f},{py:.1f}' for px, py in pts), 'ln p')
    for k in (30, 90, 150, 210):
        e = 52 * math.sin(2 * math.pi * k / 120)
        f.vector(x0 + k, yc, 0, -e, '', 11)
        b = 36 * math.sin(2 * math.pi * k / 120)
        f.arrow(x0 + k, yc, x0 + k + b * .55, yc + b * .28, 'force', 1.4)
    f.text(x0 + 4, yc - 62, 'E, electric: up and down', 't e b', 'start', 12)
    f.text(x0 + 4, yc + 66, 'B, magnetic: side to side', 't p b', 'start', 12)
    f.vector(x0 + 60, yc + 80, 150, 0, '', 12, kind='muted')
    f.text(x0 + 135, yc + 100, 'travels at 3.00 × 10⁸ m/s', 't', 'middle', 12)
    f.text(x0 + 135, yc + 116, 'each changing field makes the other', 't m', 'middle', 12)
    f.text(x0 + 135, yc + 132, 'both at right angles to the travel', 't m', 'middle', 12)
    # ---- right: the ladder
    f.line(330, 20, 330, 330, 'ln r')
    f.text(486, 26, 'The ladder of light', 't b', 'middle', 14)
    ax, top, bot = 400, 48, 318
    lo, hi = -11.0, 7.0                     # log10 wavelength in metres: bottom = +7, top = -11
    def Y(logl):
        return top + (hi - logl) / (hi - lo) * (bot - top)
    f.line(ax, top, ax, bot, 'ln')
    for d in range(-11, 8):
        f.line(ax - 4, Y(d), ax + 4, Y(d), 'ln m')
    f.text(ax - 8, Y(6) + 4, '10⁶ m', 't m', 'end', 11)
    f.text(ax - 8, Y(0) + 4, '1 m', 't m', 'end', 11)
    f.text(ax - 8, Y(-3) + 4, '1 mm', 't m', 'end', 11)
    f.text(ax - 8, Y(-6) + 4, '1 μm', 't m', 'end', 11)
    f.text(ax - 8, Y(-9) + 4, '1 nm', 't m', 'end', 11)
    rungs = [
        (math.log10(5996e3), '50 Hz mains: a 6,000 km "wave"', 0),
        (0.0, 'GMRT radio, near Pune: about 1 m', 0),
        (math.log10(5e-3), 'J. C. Bose, 1895: 5 mm', 0),
        (math.log10(940e-9), 'TV remote, infrared: 940 nm', 14),
        (math.log10(10e-9), 'ultraviolet: 400 nm down to 10 nm', 0),
        (-10.0, 'X-rays', 0),
    ]
    for logl, lab, dy in rungs:
        y = Y(logl)
        f.line(ax, y, ax + 24, y + dy, 'ln')
        f.circle(ax, y, 3.5, 'fill-ink')
        f.text(ax + 30, y + dy + 4, lab, 't', 'start', 12)
    yv1, yv2 = Y(math.log10(750e-9)), Y(math.log10(400e-9))
    f.rect(ax - 6, yv1, 12, max(3, yv2 - yv1), 'wash-g', rx=1)
    f.line(ax, yv1, ax + 24, yv1 - 14, 'ln g')
    f.text(ax + 30, yv1 - 10, 'visible: 400 to 750 nm, a thin band', 't g b', 'start', 12)
    f.text(ax + 30, Y(-2.3) + 22, 'microwaves', 't m', 'start', 11)
    f.text(ax + 30, Y(1.5) + 4, 'radio', 't m', 'start', 11)
    f.text(486, 334, 'wavelength, each step a power of ten; all at one speed', 't m', 'middle', 11)
    return f.svg()
