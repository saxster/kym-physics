"""Figures for Chapter 15, Atoms, stars and the universe. All drawings are ours. c15_photoelectric redraws the idea of
OpenStax Physics Figs 21.7–21.8 (electrons freed by light; the threshold), c15_fusion the idea of Astronomy 2e's
proton–proton figure with the 0.71% mass bookkeeping, c15_parallax the idea of Astronomy 2e Fig 19.x (parallax
geometry), c15_white_dwarf the idea of Astronomy 2e Fig 23.2 (mass–radius curve, drawn schematically) and c15_ruler the
idea of Astronomy 2e Fig 26.16 (ants on a stretching ruler), all with our own geometry. Numbers are in provenance/ch15.yml."""
import math
from figs_core import Fig, figure


def _poly(f, pts, cls):
    f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + ' Z', cls)


def _lamp(f, x, y, r, rays, label, cls='fill-vol'):
    f.circle(x, y, r, cls)
    f.circle(x, y, r, 'ln')
    f.text(x, y - r - 8, label, 't b', 'middle', 13)
    return rays


@figure
def c15_photoelectric():
    f = Fig(640, 330, 'Left: a bright red lamp shines many rays onto a calcium plate and no electrons leave; a dim violet '
                      'lamp shines two rays and electrons leave at once. Right: a ladder of photon energies in '
                      'electronvolts, with the remote at 1.32, red at 1.63 and violet at 3.26, against the 2.71 eV '
                      'calcium needs.')
    # left panel: two lamps over two plates
    for x0, title, nrays, out in ((30, 'bright red lamp', 7, False), (210, 'dim violet lamp', 2, True)):
        lx, ly = x0 + 70, 60
        f.circle(lx, ly, 14, 'fill-vol')
        f.circle(lx, ly, 14, 'ln')
        f.text(lx, 34, title, 't b', 'middle', 13)
        px, py = x0 + 10, 210
        f.rect(px, py, 120, 16, 'block', rx=2)
        f.text(px + 60, py + 34, 'calcium plate', 't m', 'middle', 12)
        for k in range(nrays):
            tx = px + 14 + (92 * k / max(1, nrays - 1) if nrays > 1 else 46) + (20 if nrays == 2 else 0)
            f.ray(lx + (tx - lx) * 0.2, ly + 14 + (py - ly - 14) * 0.2, tx, py, chevrons=1)
        if out:
            for k, (ex, ey, dx, dy) in enumerate(((px + 38, py - 6, -16, -34), (px + 86, py - 6, 20, -30))):
                f.nucleon(ex, ey, 'e', r=6)
                f.arrow(ex + dx * .35, ey + dy * .35, ex + dx, ey + dy, 'electron')
            f.text(px + 60, 262, 'electrons out at once', 't e b', 'middle', 12)
            f.text(px + 60, 278, 'each photon 2.95 eV', 't m', 'middle', 12)
        else:
            f.text(px + 60, 262, 'no electrons, however bright', 't p b', 'middle', 12)
            f.text(px + 60, 278, 'each photon 1.63 eV', 't m', 'middle', 12)
    # right panel: energy ladder
    x0, y0, h = 420, 290, 230
    f.axis(x0, y0, 170, h, '', 'energy of one photon (eV)',
           ticks={'y': [(h * v / 3.5, str(v)) for v in (1, 2, 3)]})
    def yv(v):
        return y0 - h * v / 3.5
    for v, lab, cls in ((1.32, 'TV remote, infrared: 1.32', 't nn'), (1.63, 'deep red: 1.63', 't p'), (3.26, 'violet: 3.26', 't e')):
        f.line(x0 + 10, yv(v), x0 + 60, yv(v), 'ln')
        f.text(x0 + 66, yv(v) + 4, lab, cls, 'start', 12)
    f.line(x0 + 4, yv(2.71), x0 + 170, yv(2.71), 'ln dash')
    f.text(x0 + 170, yv(2.71) - 6, 'calcium needs 2.71', 't b', 'end', 12)
    f.text(x0 + 170, yv(2.71) + 16, 'below this line: nothing leaves', 't m', 'end', 11)
    return f.svg()


@figure
def c15_exposure():
    f = Fig(640, 300, 'Left, exposure: an X-ray source sends rays through a hand onto a film; with the source off, nothing '
                      'remains. Right, contamination: specks of radioactive dust on the skin keep sending out rays until '
                      'they are washed off.')
    f.text(160, 28, 'Exposure: a beam passes', 't b', 'middle', 14)
    f.text(480, 28, 'Contamination: dust stays', 't b', 'middle', 14)
    # left: source, hand outline, film
    f.rect(40, 100, 44, 60, 'block', rx=4)
    f.text(62, 136, 'X-ray', 't', 'middle', 12)
    f.text(62, 176, 'source', 't m', 'middle', 11)
    hand = [(150, 92), (164, 86), (176, 98), (182, 140), (188, 100), (198, 100), (200, 146), (206, 108), (216, 110),
            (214, 160), (222, 124), (230, 128), (224, 180), (210, 206), (156, 206), (150, 160)]
    _poly(f, hand, 'wash-n')
    f.path('M' + ' L'.join(f'{x},{y}' for x, y in hand) + ' Z', 'ln')
    for yy in (110, 130, 150, 170, 190):
        f.ray(86, yy, 246, yy, chevrons=1)
    f.rect(250, 84, 10, 130, 'fill-ink', rx=1)
    f.text(255, 232, 'film', 't m', 'middle', 12)
    f.text(160, 262, 'switch the source off: nothing is left', 't', 'middle', 12)
    f.text(160, 278, 'in the hand, and the hand gives off nothing', 't', 'middle', 12)
    # right: hand with dust specks emitting
    hand2 = [(x + 310, y) for x, y in hand]
    _poly(f, hand2, 'wash-n')
    f.path('M' + ' L'.join(f'{x},{y}' for x, y in hand2) + ' Z', 'ln')
    for (sx, sy) in ((486, 150), (508, 172), (470, 184), (520, 140)):
        f.circle(sx, sy, 3.2, 'fill-ink')
        for a in (30, 150, 270):
            r1, r2 = 6, 16
            f.line(sx + r1 * math.cos(math.radians(a)), sy - r1 * math.sin(math.radians(a)),
                   sx + r2 * math.cos(math.radians(a)), sy - r2 * math.sin(math.radians(a)), 'ln p')
    f.text(500, 70, 'radioactive dust on the skin', 't', 'middle', 12)
    f.text(480, 262, 'the dust keeps emitting wherever it goes,', 't', 'middle', 12)
    f.text(480, 278, 'until it is washed off', 't', 'middle', 12)
    return f.svg()


@figure
def c15_fusion():
    f = Fig(640, 320, 'Four protons on the left, an arrow labelled several steps at 15 million degrees, and a helium '
                      'nucleus of two protons and two neutrons on the right, plus energy. Below, two bars: the mass of '
                      'four protons and the mass of the helium nucleus, 0.71% shorter.')
    for k in range(4):
        f.nucleon(70 + k * 44, 90, 'p', r=13)
        if k < 3:
            f.text(92 + k * 44, 95, '+', 't b', 'middle', 16)
    f.text(136, 130, 'four hydrogen nuclei (protons)', 't', 'middle', 13)
    f.arrow(250, 90, 370, 90, 'ink', width=2)
    f.text(310, 70, 'several steps,', 't m', 'middle', 12)
    f.text(310, 112, 'about 15 million degrees', 't m', 'middle', 12)
    # helium nucleus: 2 p + 2 n packed
    hx, hy = 430, 90
    for (dx, dy, kind) in ((-11, -8, 'p'), (11, -8, 'n'), (-11, 9, 'n'), (11, 9, 'p')):
        f.nucleon(hx + dx, hy + dy, kind, r=13)
    f.text(hx, 130, 'one helium nucleus', 't', 'middle', 13)
    f.text(495, 95, '+', 't b', 'middle', 16)
    f.text(560, 86, 'energy', 't b', 'middle', 14)
    f.text(560, 104, '0.71% of the mass', 't m', 'middle', 12)
    f.text(560, 119, 'E = mc²', 't s', 'middle', 13)
    # mass bars to scale
    bx, bw = 100, 440
    f.text(bx, 182, 'mass before: four protons', 't', 'start', 12)
    f.rect(bx, 188, bw, 14, 'wash-p', rx=2)
    f.rect(bx, 188, bw, 14, 'glass', rx=2)
    f.text(bx + bw + 8, 199, '1.0000', 't m', 'start', 12)
    f.text(bx, 228, 'mass after: helium nucleus', 't', 'start', 12)
    f.rect(bx, 234, bw * (1 - 0.0071), 14, 'wash-e', rx=2)
    f.rect(bx, 234, bw * (1 - 0.0071), 14, 'glass', rx=2)
    f.text(bx + bw + 8, 245, '0.9929', 't m', 'start', 12)
    f.line(bx + bw, 186, bx + bw, 252, 'ln dash')
    f.text(bx + bw - 6, 268, 'the missing 0.71% has become energy', 't p', 'end', 12)
    f.text(320, 302, 'In the Sun: 600 million tonnes of hydrogen a second become helium; 4 million tonnes of mass become light',
           't m', 'middle', 12)
    return f.svg()


@figure
def c15_spectra():
    f = Fig(640, 320, 'Three horizontal spectrum strips from violet to red, one for a hot star, one for a star of middling '
                      'temperature and one for a cool star. Four hydrogen lines cross each strip: faint in the hot star, '
                      'strong in the middle one, faint in the cool one.')
    x0, w = 170, 430
    rows = [(70, 'Hot blue star', 'hydrogen ionised:', 'the lines fade', 'ln m'),
            (150, 'Middling star', 'hydrogen lines', 'at their strongest', 'ln'),
            (230, 'Cool red star', 'electrons in the lowest level:', 'the lines fade', 'ln m')]
    lines = (0.08, 0.17, 0.32, 0.80)          # schematic positions, violet end to red end
    for y, name, n1, n2, cls in rows:
        f.rect(x0, y - 18, w, 36, 'plate', rx=3)
        f.text(x0 - 12, y - 4, name, 't b', 'end', 13)
        f.text(x0 - 12, y + 12, 'mostly hydrogen', 't m', 'end', 11)
        for p in lines:
            xx = x0 + w * p
            if cls == 'ln':
                f.line(xx, y - 18, xx, y + 18, 'ln', 'stroke-width="4"')
            else:
                f.line(xx, y - 18, xx, y + 18, 'ln m', 'stroke-width="1.6" stroke-opacity="0.6"')
        f.text(x0 + w * 0.45, y - 4, n1, 't', 'start', 12)
        f.text(x0 + w * 0.45, y + 11, n2, 't', 'start', 12)
    f.axis(x0, 270, w, 0, '', '', ticks={'x': [(0, 'violet'), (w * 0.5, 'green'), (w, 'red')]})
    f.text(x0 + w / 2, 300, 'colour, from short wavelength to long (positions schematic)', 't m', 'middle', 12)
    f.text(x0 + w * 0.17, 42, 'hydrogen lines', 't', 'middle', 12)
    f.line(x0 + w * 0.17, 46, x0 + w * 0.17, 50, 'ln m')
    return f.svg()


@figure
def c15_parallax():
    f = Fig(640, 330, 'The Sun with the Earth at two points of its orbit six months apart, a nearby star to the right, '
                      'and far stars beyond it. Lines of sight from the two Earths to the near star reach different far '
                      'stars; the angle at the near star between the Sun line and one Earth line is the parallax. Inset: '
                      'a thumb seen from two eyes.')
    sx, sy = 150, 160
    f.circle(sx, sy, 12, 'fill-vol')
    f.circle(sx, sy, 12, 'ln')
    f.text(sx, sy + 28, 'Sun', 't b', 'middle', 12)
    f.path(f'M{sx},{sy - 60} A30,60 0 1 0 {sx},{sy + 60} A30,60 0 1 0 {sx},{sy - 60}', 'ln m dash')
    e1, e2 = (sx, sy - 60), (sx, sy + 60)
    for (ex, ey), lab in ((e1, 'Earth, January'), (e2, 'Earth, July')):
        f.circle(ex, ey, 6, 'plate')
        f.circle(ex, ey, 6, 'ln')
        f.text(ex - 12, ey + 4, lab, 't', 'end', 12)
    nx, ny = 440, sy
    f.circle(nx, ny, 5, 'fill-ink')
    f.text(nx, ny - 14, 'nearby star', 't b', 'middle', 12)
    # lines of sight to the far stars
    far_x = 610
    for (ex, ey), fy in ((e1, sy + 60 * (far_x - nx) / (nx - sx)), (e2, sy - 60 * (far_x - nx) / (nx - sx))):
        f.line(ex, ey, far_x, fy, 'ln e')
        f.circle(far_x, fy, 3, 'fill-ink')
    f.line(sx, sy, far_x, sy, 'ln m dash')
    for yy in (sy - 70, sy + 70, sy - 20, sy + 20):
        f.circle(far_x + 12, yy, 2.2, 'fill-ink')
    f.text(far_x + 2, sy - 90, 'far stars', 't m', 'middle', 12)
    # parallax angle at the near star
    a = math.degrees(math.atan2(60, nx - sx))
    f.path(f'M{nx - 40},{ny} A40,40 0 0 0 {nx - 40 * math.cos(math.radians(a)):.1f},{ny - 40 * math.sin(math.radians(a)):.1f}', 'ln p')
    f.text(nx - 54, ny - 10, 'p', 't p b', 'end', 14)
    f.text(300, 248, 'the star seems to shift between January and July;', 't', 'start', 12)
    f.text(300, 263, 'the parallax p is half of that shift', 't', 'start', 12)
    f.text(300, 285, 'not to scale: for the nearest star p is under one arcsecond', 't m', 'start', 11)
    f.text(sx, sy - 76, 'baseline: the Earth’s orbit, 300 million km across', 't m', 'start', 11)
    # inset: thumb and eyes
    ix, iy = 60, 262
    f.rect(ix - 40, iy - 28, 250, 56, 'plate', rx=6)
    for k, yy in enumerate((iy - 12, iy + 12)):
        f.circle(ix - 24, yy, 4, 'fill-ink')
        f.line(ix - 20, yy, ix + 150, iy + (12 if k == 0 else -12), 'ln m')
    f.rect(ix + 30, iy - 12, 10, 24, 'block', rx=3)
    f.text(ix + 35, iy + 24, 'thumb', 't m', 'middle', 11)
    f.text(ix - 24, iy + 24, 'eyes', 't m', 'middle', 11)
    f.line(ix + 150, iy - 22, ix + 150, iy + 22, 'ln')
    f.text(ix + 156, iy - 8, 'wall: the', 't m', 'start', 11)
    f.text(ix + 156, iy + 6, 'thumb jumps', 't m', 'start', 11)
    f.text(ix + 156, iy + 20, 'between views', 't m', 'start', 11)
    return f.svg()


@figure
def c15_white_dwarf():
    f = Fig(640, 300, 'A graph of a white dwarf’s radius against its mass in Suns. The curve falls as mass rises and '
                      'reaches zero at about 1.4 Suns, marked as the Chandrasekhar limit. The Sun’s mass, 1.0, is marked '
                      'on the curve.')
    x0, y0, w, h = 80, 240, 480, 180
    f.axis(x0, y0, w, h, 'mass (Suns)', 'radius of the white dwarf',
           ticks={'x': [(w * m / 1.6, f'{m:.1f}' if m != 1 else '1.0') for m in (0.4, 0.8, 1.0, 1.2, 1.4)]})
    pts = []
    M_lim = 1.4
    m = 0.15
    while m < M_lim - 0.004:
        r = (m ** (-1 / 3)) * math.sqrt(max(0.0, 1 - (m / M_lim) ** (4 / 3)))
        pts.append((x0 + w * m / 1.6, y0 - h * 0.42 * r / 1.9))
        m += 0.01
    pts.append((x0 + w * M_lim / 1.6, y0))
    f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts), 'ln e')
    xl = x0 + w * M_lim / 1.6
    f.line(xl, y0, xl, y0 - h + 10, 'ln dash')
    f.text(xl - 8, y0 - h + 24, 'Chandrasekhar limit', 't b', 'end', 13)
    f.text(xl - 8, y0 - h + 40, 'about 1.4 Suns: no white dwarf', 't', 'end', 12)
    f.text(xl - 8, y0 - h + 55, 'can exist beyond this', 't', 'end', 12)
    xs = x0 + w * 1.0 / 1.6
    rs = (1.0 ** (-1 / 3)) * math.sqrt(1 - (1.0 / M_lim) ** (4 / 3))
    ys = y0 - h * 0.42 * rs / 1.9
    f.circle(xs, ys, 5, 'fill-vol')
    f.circle(xs, ys, 5, 'ln')
    f.text(xs + 10, ys - 10, 'the Sun’s mass: ends', 't', 'start', 12)
    f.text(xs + 10, ys + 4, 'as a white dwarf', 't', 'start', 12)
    f.text(x0 + 20, y0 - h + 24, 'more mass, smaller star', 't e b', 'start', 13)
    f.text(x0, 294, 'schematic shape; the end point at 1.4 Suns is the real one', 't m', 'start', 12)
    return f.svg()


@figure
def c15_ruler():
    f = Fig(640, 330, 'Two rulers. The top one runs 0 to 12 cm with ants at 2, 4, 7 and 12. The bottom one, a minute later, '
                      'runs 0 to 24 cm with the same ants at 4, 8, 14 and 24. Labels give each ant’s speed as seen from '
                      'the ant at 2 cm and from the ant at 7 cm.')
    def ruler(x0, y, length_px, cm, ants, label):
        f.rect(x0, y - 10, length_px, 20, 'block', rx=3)
        for c in range(cm + 1):
            xx = x0 + length_px * c / cm
            f.line(xx, y + 10, xx, y + (4 if c % 2 else 0), 'ln')
            if c % 2 == 0:
                f.text(xx, y + 26, str(c), 't m', 'middle', 11)
        f.text(x0 + length_px + 10, y + 4, label, 't m', 'start', 12)
        for a in ants:
            xx = x0 + length_px * a / cm
            f.circle(xx, y - 18, 5, 'fill-ink')
            f.line(xx - 7, y - 14, xx + 7, y - 22, 'ln')
            f.line(xx - 7, y - 22, xx + 7, y - 14, 'ln')
    unit = 22            # px per cm, the same for both rulers
    f.text(20, 36, 'Start', 't b', 'start', 13)
    ruler(20, 70, 12 * unit, 12, (2, 4, 7, 12), 'ants at 2, 4, 7 and 12 cm')
    f.text(20, 136, 'One minute later: the ruler has doubled', 't b', 'start', 13)
    ruler(20, 170, 24 * unit, 24, (4, 8, 14, 24), '')
    f.text(20, 214, 'seen from the ant that was at 2 cm:', 't', 'start', 12)
    for a0, sp in ((4, '2 cm/min'), (7, '5 cm/min'), (12, '10 cm/min')):
        xx = 20 + 2 * a0 * unit
        f.text(xx, 232, sp, 't e b', 'middle', 12)
    f.text(20 + 4 * unit, 232, '(me)', 't m', 'middle', 11)
    f.text(20, 262, 'seen from the ant that was at 7 cm:', 't', 'start', 12)
    for a0, sp in ((2, '5 cm/min'), (4, '3 cm/min'), (12, '5 cm/min')):
        xx = 20 + 2 * a0 * unit
        f.text(xx, 280, sp, 't e b', 'middle', 12)
    f.text(20 + 14 * unit, 280, '(me)', 't m', 'middle', 11)
    f.text(320, 314, 'Each ant sees speed in proportion to distance, and none of them moved: the ruler stretched', 't m', 'middle', 12)
    return f.svg()
