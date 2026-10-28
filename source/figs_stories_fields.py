"""Figures for the stories in the fields group (electricity, magnetism, light) and the atoms group (atoms, stars, the
universe). Every number drawn here appears in the story that uses the figure and was computed with python3 -I -c on
2026-10-28 (see provenance/stories_fields.yml). Curves marked schematic in their captions are drawn for shape only."""
from __future__ import annotations
import math
from figs_core import Fig, figure, catmull


def _charges(f, pts, kind):
    for x, y in pts:
        f.nucleon(x, y, kind, r=10)


@figure
def s_rub_moves_charge():
    """The same positive charges stay put; four electrons visibly change owners."""
    f = Fig(640, 394, 'Before and after rubbing a balloon against hair. Each starts with four positive and '
                      'four negative charge symbols. Afterwards the balloon still has its four positive symbols '
                      'but has eight electrons; the hair keeps its four positive symbols and has lost its four '
                      'electrons. A leftward arrow shows the electron transfer. The total remains eight positive '
                      'and eight negative symbols. Symbols count units of charge, not whole atoms.')
    for k, title in enumerate(('Before rubbing', 'After rubbing')):
        x0 = 16 + k * 320
        bx, hx, cy = x0 + 70, x0 + 232, 154
        f.text(x0 + 144, 25, title, 't b', 'middle', 17)
        if k:
            f.text(x0 + 144, 51, '4 electrons move from hair to balloon', 't e', 'middle', 13)
        else:
            f.text(x0 + 144, 51, 'Equal positive and negative charges', 't m', 'middle', 13)
        # Recognisable objects, with a deliberately schematic charge cut-away.
        f.add(f'<ellipse cx="{bx}" cy="{cy}" rx="60" ry="79" class="plate"/>')
        f.path(f'M{bx},233 l-6,8 h12 Z', 'block')
        f.path(f'M{bx},242 q-8,8 0,16', 'ln m')
        f.rect(hx - 50, 78, 100, 164, 'plate', rx=22)
        for dx in (-40, -20, 0, 20, 40):
            f.path(f'M{hx + dx},84 q-9,-14 0,-19 q9,-5 2,-13', 'ln m')
        positive = [(x, y) for y in (115, 139) for x in (-16, 16)]
        electrons = [(x, y) for y in (166, 190) for x in (-16, 16)]
        _charges(f, [(bx + x, y) for x, y in positive], 'p')
        _charges(f, [(hx + x, y) for x, y in positive], 'p')
        _charges(f, [(bx + x, y) for x, y in electrons], 'e')
        if k == 0:
            _charges(f, [(hx + x, y) for x, y in electrons], 'e')
        else:
            _charges(f, [(bx + x, y) for x, y in ((-40, 166), (40, 166), (-16, 214), (16, 214))], 'e')
            for x, y in electrons:
                f.circle(hx + x, y, 10, 'ln m dash')
            f.arrow(hx - 54, 215, bx + 64, 215, 'electron', width=2.4)
            f.text((hx + bx) / 2, 204, 'electrons', 't e', 'middle', 12)
        f.text(bx, 278, 'balloon', 't b', 'middle', 15)
        f.text(hx, 278, 'hair', 't b', 'middle', 15)
        f.text(bx, 302, '4+ and 4−: neutral' if k == 0 else '4+ and 8−: charge −4', 't e' if k else 't m', 'middle', 13)
        f.text(hx, 302, '4+ and 4−: neutral' if k == 0 else '4+ and 0−: charge +4', 't p' if k else 't m', 'middle', 13)
    f.line(320, 65, 320, 312, 'ln r')
    f.rect(24, 326, 592, 44, 'wash', rx=8)
    f.text(320, 354, 'Total before: 8+ and 8−.   Total after: 8+ and 8−.', 't b', 'middle', 15)
    f.text(320, 388, 'Rubbing moves electrons; it does not create charge. Symbols show units of charge.', 't m', 'middle', 12)
    return f.svg()


@figure
def s_rope_loop():
    """A loop of rope as a circuit: the battery hauls, the bulb grips, the rope moves at the same rate everywhere."""
    f = Fig(640, 300, 'A loop of rope. A battery on the left hauls it round; a bulb on the right grips it and gets warm. '
                      'Arrows of equal length all round the loop show that the rope moves at the same rate everywhere.')
    f.rect(70, 70, 500, 160, 'ln', rx=60, extra='fill="none" style="stroke-width:6"')
    for x in (170, 300, 430):
        f.arrow(x, 70, x + 46, 70, 'vector')
        f.arrow(x + 46, 230, x, 230, 'vector')
    f.arrow(70, 180, 70, 134, 'vector')
    f.arrow(570, 120, 570, 166, 'vector')
    f.rect(36, 124, 68, 52, 'block', rx=6)
    f.text(70, 146, 'battery', 't b', 'middle', 13)
    f.text(70, 164, 'hauls', 't m', 'middle', 12)
    f.rect(536, 124, 68, 52, 'block', rx=6)
    f.text(570, 146, 'bulb', 't b', 'middle', 13)
    f.text(570, 164, 'grips', 't m', 'middle', 12)
    for dx in (-14, 0, 14):
        f.path(f'M{570 + dx},112 q4,-8 0,-16 q-4,-8 0,-16', 'ln r')
    f.text(570, 60, 'warm here', 't p b', 'middle', 12)
    f.text(320, 130, 'the rope moves at the same rate', 't', 'middle', 14)
    f.text(320, 150, 'at every point of the loop', 't', 'middle', 14)
    f.text(320, 176, 'no rope is used up', 't m', 'middle', 13)
    f.text(320, 272, 'this rope is a model: it stops at saying what the rope is made of', 't m', 'middle', 12)
    return f.svg()


@figure
def s_ohm_line():
    """Current against voltage for the 4.8 Ω headlamp of the worked example: a straight line through the origin."""
    f = Fig(640, 280, 'Graph of current against voltage for a 4.8 ohm lamp: a straight line through the origin, with the '
                      'two worked-example points marked at 6 volts, 1.25 amperes and 12 volts, 2.5 amperes.')
    x0, y0, w, h = 70, 230, 480, 180
    px_v, px_a = w / 14, h / 3
    f.axis(x0, y0, w, h, 'voltage across the lamp (V)', 'current (A)',
           ticks={'x': [(px_v * v, str(v)) for v in (2, 4, 6, 8, 10, 12, 14)],
                  'y': [(px_a * a, str(a)) for a in (1, 2, 3)]})
    f.line(x0, y0, x0 + 14 * px_v, y0 - (14 / 4.8) * px_a, 'ln e')
    for v, a, lab in ((6, 1.25, '6 V, 1.25 A'), (12, 2.5, '12 V, 2.5 A')):
        x, y = x0 + v * px_v, y0 - a * px_a
        f.circle(x, y, 5, 'fill-ink')
        f.text(x + 10, y + 16, lab, 't', 'start', 13)
    f.text(x0 + 11.6 * px_v, y0 - 1.55 * px_a, 'R = 4.8 Ω', 't e b', 'middle', 13)
    f.text(x0 + 11.6 * px_v, y0 - 1.25 * px_a, 'double the push, double the current', 't e', 'middle', 13)
    return f.svg()


@figure
def s_terrella():
    """Dipole loops outside the stone, with 'level' measured against the local ground."""
    f = Fig(640, 354, 'Left: a spherical lodestone, with its magnetic south pole at the top and north at the '
                      'bottom, like Earth in outline. Magnetic field lines form loops outside the stone. '
                      'A free needle points into the top pole and parallel to the local ground at the equator. '
                      'Right: a separate local view in Mumbai shows the north end of a needle dipping 28 degrees '
                      'below the horizontal ground. The stone is a model of the shape of the field.')
    cx, cy, r = 174, 184, 77
    f.text(cx, 26, 'A magnet with Earth’s field shape', 't b', 'middle', 15)
    # Dipole field lines: r = L sin²(theta). Begin and end on the
    # surface; unlike ellipse minor arcs, these loops stay outside it.
    for L in (108, 139, 166):
        theta0 = math.asin(math.sqrt(r / L))
        for side in (-1, 1):
            pts = []
            for k in range(81):
                theta = theta0 + (math.pi - 2 * theta0) * k / 80
                rr = L * math.sin(theta) ** 2
                pts.append((cx + side * rr * math.sin(theta), cy - rr * math.cos(theta)))
            f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts), 'ln e')
            # At the equator the external field points toward the top S pole.
            f.arrow(cx + side * L, cy + 11, cx + side * L, cy - 11, 'electron', width=1.3)
    f.circle(cx, cy, r, 'plate')
    f.circle(cx, cy, r, 'ln')
    f.text(cx, cy - 44, 'S', 't e b', 'middle', 16)
    f.text(cx, cy + 55, 'N', 't p b', 'middle', 16)
    f.text(cx, cy - 5, 'terrella', 't b', 'middle', 16)
    f.text(cx, cy + 16, 'a lodestone ball', 't m', 'middle', 13)
    f.line(cx - r, cy, cx + r, cy, 'ln m dash')
    # Needle above the pole, pointing inward; local ground is horizontal here.
    f.arrow(cx, 57, cx, 98, 'ink', width=3)
    f.text(cx + 14, 65, 'at a pole:', 't', 'start', 12)
    f.text(cx + 14, 81, 'straight into the ground', 't m', 'start', 12)
    # At the right-hand equator, 'level' is vertical on the page:
    # the needle follows the tangent, not the radius of the ball.
    ex = cx + r + 14
    f.line(ex, cy - 36, ex, cy + 36, 'ln m dash')
    f.arrow(ex + 9, cy + 28, ex + 9, cy - 28, 'ink', width=3)
    f.line(ex + 15, cy + 30, 280, 286, 'ln m')
    f.lines(192, 307, ['at the equator: along the local ground', '(level does not mean sideways on the page)'], 't m', 'middle', 12)
    # The right inset uses a local horizontal, as a real observer sees it.
    f.line(354, 48, 354, 325, 'ln r')
    f.text(492, 57, 'Mumbai: a view at ground level', 't b', 'middle', 14)
    f.text(492, 78, 'a free needle can tilt as well as turn', 't m', 'middle', 12)
    ox, oy, L = 413, 150, 136
    f.line(386, oy, 607, oy, 'ln m dash')
    f.text(605, oy - 12, 'horizontal', 't m', 'end', 13)
    angle = math.radians(28)
    nx, ny = ox + L * math.cos(angle), oy + L * math.sin(angle)
    f.arrow(ox, oy, nx, ny, 'ink', width=3)
    f.path(f'M{ox + 44},{oy} A44,44 0 0 1 {ox + 44 * math.cos(angle):.1f},{oy + 44 * math.sin(angle):.1f}', 'ln e')
    f.text(ox + 53, oy + 17, '28°', 't e b', 'start', 14)
    f.text(nx + 8, ny + 4, 'N', 't p b', 'start', 15)
    f.ground(382, 252, 226)
    f.lines(492, 282, ['the north end dips into the ground;', 'a flat compass hides this part of the field'], 't', 'middle', 13)
    f.text(320, 344, 'Field lines show the direction a needle points. They are not paths for moving objects.', 't m', 'middle', 12)
    return f.svg()


def _compass(f, cx, cy, r, shift=0):
    f.circle(cx, cy, r, 'plate')
    f.circle(cx, cy, 3, 'fill-ink')
    for lab, dx, dy in (('N', shift, -r + 16), ('S', shift, r - 6), ('E', r - 12, 5), ('W', -r + 12, 5)):
        f.text(cx + dx, cy + dy, lab, 't m', 'middle', 13)


@figure
def s_oersted_compass():
    """A compass in Mumbai with no current, and the same compass under a north-south wire carrying 1 A at 1 cm."""
    f = Fig(640, 290, 'Two compasses. Left: with no current the needle points north. Right: a wire carrying one ampere '
                      'runs north-south one centimetre above the compass and the needle has swung about 27 degrees.')
    for k, cx in enumerate((160, 480)):
        cy, r = 150, 78
        _compass(f, cx, cy, r, shift=-18 if k else 0)
        if k == 0:
            f.arrow(cx, cy + 40, cx, cy - 40, 'force')
            f.text(cx, 36, 'no current', 't b', 'middle', 14)
            f.text(cx, 262, "Mumbai's field alone: 38 μT, pointing north", 't m', 'middle', 12)
        else:
            f.line(cx, 44, cx, 256, 'ln vol', extra='style="stroke-width:4"')
            f.arrow(cx, 100, cx, 60, 'vector')
            f.text(cx - 8, 58, 'wire: 1 A, north–south,', 't e', 'end', 12)
            f.text(cx - 8, 72, '1 cm above the compass', 't e', 'end', 12)
            th = math.radians(27.5)
            dx, dy = 40 * math.sin(th), 40 * math.cos(th)
            f.arrow(cx + dx, cy + dy, cx - dx, cy - dy, 'force')
            f.path(f'M{cx},{cy - 30} A30,30 0 0 0 {cx - 30 * math.sin(th):.1f},{cy - 30 * math.cos(th):.1f}', 'ln m')
            f.text(cx - 22, cy - 34, '27°', 't', 'start', 13)
            f.text(cx, 36, 'current on', 't b', 'middle', 14)
            f.text(cx, 262, "the wire's 20 μT at right angles swings the needle", 't m', 'middle', 12)
            f.text(cx, 278, 'reverse the current and it swings the other way', 't m', 'middle', 12)
    return f.svg()


@figure
def s_faraday_ring():
    """Faraday's ring and what the needle did: a kick at switch-on, a kick the other way at switch-off, nothing in between."""
    f = Fig(640, 300, 'Left: an iron ring with a coil on each side; the left coil is joined to a battery through a switch, '
                      'the right coil to a compass needle. Right: two traces against time. The current in the left coil '
                      'steps up when the switch closes and down when it opens; the needle kicks one way at the first '
                      'moment, the other way at the second, and is still while the current is steady.')
    cx, cy = 172, 140
    f.circle(cx, cy, 66, 'ln m', extra='fill="none" style="stroke-width:16"')
    f.spring(cx - 74, cy - 46, cx - 74, cy + 46, coils=7, width=11, cls='ln e')
    f.spring(cx + 74, cy - 46, cx + 74, cy + 46, coils=7, width=11, cls='ln p')
    f.text(cx - 74, cy - 60, 'coil A', 't e', 'middle', 13)
    f.text(cx + 74, cy - 60, 'coil B', 't p', 'middle', 13)
    f.text(cx, cy + 4, 'iron ring', 't b', 'middle', 13)
    # battery and switch on the left
    f.line(cx - 74, cy - 46, cx - 120, cy - 46, 'ln')
    f.line(cx - 120, cy - 46, cx - 120, cy + 10, 'ln')
    f.line(cx - 120, cy + 34, cx - 120, cy + 46, 'ln')
    f.line(cx - 120, cy + 46, cx - 74, cy + 46, 'ln')
    f.line(cx - 120, cy + 34, cx - 106, cy + 16, 'ln')     # the open switch blade
    f.circle(cx - 120, cy + 10, 2.5, 'fill-ink')
    f.text(cx - 120, cy + 64, 'switch', 't m', 'middle', 12)
    f.rect(cx - 132, cy - 20, 24, 20, 'block', rx=3)
    f.text(cx - 120, cy - 5, '+ −', 't', 'middle', 12)
    f.text(cx - 120, cy - 28, 'battery', 't m', 'middle', 12)
    # needle on the right
    f.line(cx + 74, cy - 46, cx + 128, cy - 46, 'ln')
    f.line(cx + 128, cy - 46, cx + 128, cy - 18, 'ln')
    f.line(cx + 74, cy + 46, cx + 128, cy + 46, 'ln')
    f.line(cx + 128, cy + 46, cx + 128, cy + 18, 'ln')
    f.circle(cx + 128, cy, 18, 'plate')
    f.arrow(cx + 128, cy + 11, cx + 128, cy - 11, 'force')
    f.text(cx + 128, cy + 38, 'needle', 't m', 'middle', 12)
    f.text(cx, 262, 'no wire joins coil A to coil B', 't m', 'middle', 12)
    # the traces
    gx0, gx1 = 340, 620
    t1, t2 = 410, 540
    y_a, y_b = 110, 220
    f.text(gx0, 40, 'current in coil A', 't e', 'start', 13)
    f.path(f'M{gx0},{y_a} L{t1},{y_a} L{t1},{y_a - 44} L{t2},{y_a - 44} L{t2},{y_a} L{gx1},{y_a}', 'ln e')
    f.text(gx0, 160, 'needle (coil B)', 't p', 'start', 13)
    f.path(f'M{gx0},{y_b} L{t1 - 6},{y_b} L{t1},{y_b - 40} L{t1 + 8},{y_b} L{t2 - 6},{y_b} L{t2},{y_b + 40} L{t2 + 8},{y_b} L{gx1},{y_b}', 'ln p')
    for t, lab in ((t1, 'switch closed'), (t2, 'switch opened')):
        f.line(t, 56, t, 272, 'ln m dash')
        f.text(t, 288, lab, 't m', 'middle', 12)
    f.text((t1 + t2) / 2, y_b - 12, 'steady: nothing', 't m', 'middle', 12)
    f.arrow(gx0, 275, gx1, 275, 'muted')
    f.text(gx1, 292, 'time', 't m', 'end', 12)
    return f.svg()


@figure
def s_em_ladder():
    """The electromagnetic spectrum on a wavelength scale, with the examples from the maxwell story marked."""
    f = Fig(640, 250, 'The electromagnetic spectrum on a logarithmic wavelength scale from 1,000 km to 1 pm, with the '
                      'bands radio, microwaves, infrared, visible, ultraviolet, X-rays and gamma rays, and markers for '
                      'the 6,000 km mains wave, the 1 m GMRT wave, Bose\'s 5 mm wave, the 940 nm TV remote and the '
                      '400 to 750 nm visible band.')
    x0, per = 40, 30.0
    def X(lam):
        return x0 + (7 - math.log10(lam)) * per
    top, bot = 118, 158
    f.rect(X(1e7), top, X(1e-12) - X(1e7), bot - top, 'wash', rx=4)
    f.rect(X(750e-9), top, X(400e-9) - X(750e-9), bot - top, 'fill-vol', rx=0)
    for lam, lab in ((1e6, '1,000 km'), (1e3, '1 km'), (1, '1 m'), (1e-3, '1 mm'), (1e-6, '1 μm'), (1e-9, '1 nm'), (1e-12, '1 pm')):
        f.line(X(lam), bot, X(lam), bot + 6, 'ax')
        f.text(X(lam), bot + 20, lab, 't m', 'middle', 12)
    f.line(X(1e7), bot, X(1e-12), bot, 'ax')
    f.text(x0, bot + 40, 'wavelength, each tick a thousand times shorter', 't m', 'start', 12)
    for lam, lab in ((2e3, 'radio'), (1.5e-2, 'microwaves'), (1.5e-5, 'infrared'), (2e-10, 'X-rays'), (1e-12, 'γ rays')):
        f.text(X(lam), top + 25, lab, 't b', 'middle', 13)
    f.text(X(560e-9), 200, 'visible: 400 to 750 nm', 't b', 'middle', 12)
    f.text(X(60e-9), 218, 'ultraviolet: 400 nm down to 10 nm', 't m', 'middle', 12)
    f.line(X(560e-9), bot + 2, X(560e-9), 188, 'ln m')
    # markers
    marks = ((6e6, 'mains, 50 Hz: 6,000 km', 46, 'start'), (1.0, 'GMRT: 1 m', 46, 'middle'),
             (940e-9, 'TV remote: 940 nm', 78, 'start'), (5e-3, 'Bose: 5 mm', 78, 'middle'))
    for lam, lab, y, anchor in marks:
        f.line(X(lam), y + 6, X(lam), top - 2, 'ln m')
        f.circle(X(lam), top - 2, 2.5, 'fill-ink')
        f.text(X(lam) + (4 if anchor == 'start' else 0), y, lab, 't', anchor, 12)
    f.text(320, 22, 'the ladder of light: one kind of wave, one speed, many lengths', 't b', 'middle', 14)
    return f.svg()


@figure
def s_bose_scale():
    """Bose's 5 mm waves drawn to scale across a 22 mm one-rupee coin."""
    f = Fig(640, 230, 'A one-rupee coin 22 mm across, drawn at 8 pixels per millimetre, with a wave of wavelength 5 mm '
                      'running across it: about four and a half wavelengths fit across the coin.')
    s, cx, cy = 8.0, 150, 112
    r = 11 * s
    f.circle(cx, cy, r, 'plate')
    f.circle(cx, cy, r - 6, 'ln m')
    f.text(cx, cy + r + 24, '₹1 coin, 22 mm across', 't m', 'middle', 13)
    f.wave(cx - r, cy, 2 * r, 14, 5 * s, cls='ln e')
    f.bracket_label(cx - 2.5 * s, cx + 2.5 * s, cy + 26, 'one wave: 5 mm', 12, up=False)
    f.lines(300, 70, ["Bose's shortest waves were 5 mm long:", 'about four and a half of them across the coin.',
                      'They swing 60,000 million times a second.'], 't', 'start', 14)
    f.lines(300, 150, ['A 1 m radio wave is 200 times this 5 mm wavelength', 'and swings 200 times more slowly.'],
            't m', 'start', 13)
    return f.svg()


@figure
def s_photon_threshold():
    """Photon energies for four kinds of light against calcium's binding energy of 2.71 eV."""
    f = Fig(640, 300, 'Bar chart of the energy of one photon: TV remote infrared at 940 nm, 1.32 eV; red light at 760 nm, '
                      '1.63 eV; violet at 420 nm, 2.95 eV; violet at 380 nm, 3.26 eV. A dashed line at 2.71 eV marks '
                      'calcium\'s binding energy; only the two violet bars rise above it.')
    x0, y0, w, h = 80, 236, 500, 200
    pa = h / 3.5
    f.axis(x0, y0, w, h, '', 'energy of one photon (eV)', ticks={'y': [(pa * e, str(e)) for e in (1, 2, 3)]})
    bars = ((150, 1.32, 'TV remote', '940 nm', 'no electron'), (260, 1.63, 'red light', '760 nm', 'no electron'),
            (370, 2.95, 'violet', '420 nm', 'electron freed'), (480, 3.26, 'violet', '380 nm', 'electron freed'))
    for x, e, l1, l2, verdict in bars:
        f.rect(x - 34, y0 - e * pa, 68, e * pa, 'fill-vol', rx=3)
        f.text(x, y0 - e * pa - 8, f'{e} eV', 't b', 'middle', 13)
        f.text(x, y0 + 18, l1, 't', 'middle', 13)
        f.text(x, y0 + 34, l2, 't m', 'middle', 12)
        f.text(x, y0 + 52, verdict, 't p b' if verdict.startswith('electron') else 't m', 'middle', 12)
    yt = y0 - 2.71 * pa
    f.line(x0, yt, x0 + w, yt, 'ln r dash')
    f.text(x0 + 6, yt - 8, "calcium's entry fee: 2.71 eV", 't p b', 'start', 13)
    return f.svg()


def _person(f, cx, top):
    f.circle(cx, top + 16, 16, 'plate')
    f.rect(cx - 20, top + 36, 40, 78, 'plate', rx=8)
    f.line(cx - 10, top + 114, cx - 16, top + 160, 'ln')
    f.line(cx + 10, top + 114, cx + 16, top + 160, 'ln')


@figure
def s_exposure_vs_contamination():
    """Exposure (an X-ray beam passes through and is gone) beside contamination (radioactive dust stays on a sleeve)."""
    f = Fig(640, 270, 'Left: an X-ray beam passes through a standing figure and continues beyond; no radioactive material stays behind. '
                      'Right: a figure with specks of radioactive dust on one sleeve, each speck emitting; the dust stays '
                      'and can be carried off.')
    f.text(160, 28, 'exposure', 't b', 'middle', 15)
    _person(f, 160, 50)
    f.ray(30, 120, 290, 120, chevrons=3)
    f.text(30, 106, 'X-ray beam', 't', 'start', 12)
    f.text(160, 232, 'the beam passes through and is gone;', 't', 'middle', 13)
    f.text(160, 250, 'no radioactive material is left behind', 't', 'middle', 13)
    f.text(480, 28, 'contamination', 't b', 'middle', 15)
    _person(f, 480, 50)
    for x, y in ((452, 100), (447, 118), (455, 134)):
        f.circle(x, y, 3.5, 'fill-ink')
        f.arrow(x - 6, y - 4, x - 22, y - 14, 'muted')
        f.arrow(x - 6, y + 4, x - 22, y + 14, 'muted')
    f.text(428, 86, 'radioactive dust', 't', 'end', 12)
    f.text(480, 232, 'the dust stays and keeps emitting;', 't', 'middle', 13)
    f.text(480, 250, 'it can be carried off, or washed off', 't', 'middle', 13)
    return f.svg()


@figure
def s_halflife_c14():
    """Carbon-14 remaining after 0, 1, 2, 3 and 4 half-lives of 5,730 years."""
    f = Fig(640, 250, 'Bar chart: carbon-14 remaining falls from 100% at 0 years to 50% at 5,730 years, 25% at 11,460, '
                      '12.5% at 17,190 and 6.25% at 22,920 years.')
    x0, y0, h = 90, 196, 132
    for i, v in enumerate((100, 50, 25, 12.5, 6.25)):
        x = x0 + i * 108
        f.rect(x, y0 - h * v / 100, 64, h * v / 100, 'fill-vol', rx=3)
        f.text(x + 32, y0 - h * v / 100 - 8, f'{v:g}%', 't b', 'middle', 13)
        f.text(x + 32, y0 + 20, f'{i * 5730:,}', 't m', 'middle', 12)
    f.line(x0 - 16, y0, x0 + 4 * 108 + 80, y0, 'ax')
    f.text(x0 - 16, y0 + 42, 'years since the plant or animal died', 't m', 'start', 12)
    f.text(x0 - 16, 24, 'carbon-14 left', 't b', 'start', 13)
    f.text(x0 + 4 * 108 + 80, 24, 'each step is one half-life, 5,730 years', 't m', 'end', 12)
    return f.svg()


@figure
def s_sun_budget():
    """What the Sun does each second: 600 million tonnes of hydrogen in, 596 million tonnes of helium out, 4 million tonnes to energy."""
    f = Fig(640, 240, 'Flow diagram. Every second about 600 million tonnes of hydrogen fuse into about 596 million tonnes '
                      'of helium, and the missing 4 million tonnes leaves as 4 times ten to the 26 joules of light and heat. '
                      'In 4.5 billion years this has used about 0.03% of the Sun\'s mass.')
    f.text(320, 30, "every second, at the Sun's centre", 't b', 'middle', 14)
    f.rect(30, 64, 200, 70, 'block', rx=8)
    f.lines(130, 92, ['600 million tonnes', 'of hydrogen'], 't b', 'middle', 14)
    f.rect(410, 64, 200, 70, 'block', rx=8)
    f.lines(510, 92, ['596 million tonnes', 'of helium'], 't b', 'middle', 14)
    f.arrow(232, 99, 406, 99, 'ink', width=3)
    f.text(320, 88, 'fusion', 't m', 'middle', 13)
    f.arrow(320, 106, 320, 150, 'force')
    f.lines(320, 172, ['4 million tonnes becomes energy:', '4 × 10²⁶ joules of light and heat'], 't p b', 'middle', 13)
    f.text(320, 224, "in 4.5 billion years: about 0.03% of the Sun's mass used", 't m', 'middle', 12)
    return f.svg()


@figure
def s_hydrogen_lines_temperature():
    """Schematic: hydrogen's visible lines are strong only at middling temperatures."""
    f = Fig(640, 270, 'Schematic graph of the strength of hydrogen\'s visible lines against a star\'s surface temperature: '
                      'a hump, weak in the coolest stars where electrons sit on the bottom rung, strong in between, and '
                      'weak again in the hottest stars where hydrogen is ionised.')
    x0, y0, w, h = 70, 212, 500, 160
    f.axis(x0, y0, w, h, 'surface temperature: cooler → hotter', "strength of hydrogen's visible lines")
    pts = [(x0 + t, y0 - 140 * math.exp(-((t - 250) / 110) ** 2)) for t in range(0, 501, 10)]
    f.path(catmull(pts), 'ln e')
    f.lines(x0 + 30, 96, ['too cool: electrons', 'sit on the bottom rung,', 'few visible lines'], 't', 'start', 12)
    f.lines(x0 + w - 30, 96, ['too hot: hydrogen', 'is ionised, and a bare', 'proton has no lines'], 't', 'end', 12)
    f.text(x0 + 250, 30, 'strong lines, though hydrogen is abundant everywhere', 't b', 'middle', 13)
    f.text(320, 258, 'the curve is schematic: shape only, no measured values', 't m', 'middle', 12)
    return f.svg()


@figure
def s_parallax():
    """Parallax geometry: Earth in January and July, a nearby star, and its two apparent positions among distant stars."""
    f = Fig(640, 300, 'The Sun at the left with the Earth above it in January and below it in July. Two sight lines from '
                      'the two Earth positions cross at a nearby star and continue to a column of distant stars at the '
                      'right, hitting it at two different points. The angle p at the star, between the line to the Sun '
                      'and the line to the January Earth, is marked; the drawing exaggerates it enormously.')
    sx, sy = 120, 150
    f.path(f'M{sx},60 A44,90 0 0 1 {sx},240', 'ln m dash')
    f.path(f'M{sx},60 A44,90 0 0 0 {sx},240', 'ln m dash')
    f.circle(sx, sy, 12, 'fill-vol')
    f.text(sx, sy + 30, 'Sun', 't', 'middle', 13)
    f.circle(sx, 60, 7, 'water')
    f.text(sx - 14, 56, 'Earth, January', 't', 'end', 13)
    f.circle(sx, 240, 7, 'water')
    f.text(sx - 14, 245, 'Earth, July', 't', 'end', 13)
    stx, sty = 380, 150
    for (ex, ey) in ((sx, 60), (sx, 240)):
        k = (600 - ex) / (stx - ex)
        f.line(ex, ey, 600, ey + (sty - ey) * k, 'ln m')
    f.line(sx, sy, stx, sty, 'ln m dash')
    f.path(f'M{stx - 50},{sty} A50,50 0 0 1 {stx - 50 * math.cos(math.radians(19.1)):.1f},{sty - 50 * math.sin(math.radians(19.1)):.1f}', 'ln')
    f.text(stx - 62, sty - 12, 'p', 't s i', 'end', 15)
    f.circle(stx, sty, 6, 'fill-ink')
    f.text(stx, sty + 26, 'nearby star', 't b', 'middle', 13)
    f.line(600, 30, 600, 270, 'ln m')
    for y in range(40, 270, 28):
        f.circle(600, y, 2, 'fill-ink')
    f.text(600, 22, 'distant stars', 't m', 'middle', 12)
    f.circle(600, 226.2, 5, 'fill-ink')
    f.text(590, 231, 'where it seems to be in January', 't', 'end', 12)
    f.circle(600, 73.8, 5, 'fill-ink')
    f.text(590, 78, 'where it seems to be in July', 't', 'end', 12)
    f.text(320, 290, 'p is half the total shift; the nearer the star, the bigger p', 't m', 'middle', 12)
    return f.svg()


@figure
def s_white_dwarf_mass_radius():
    """Schematic mass-radius curve for white dwarfs, reaching zero radius at 1.4 solar masses."""
    f = Fig(640, 290, 'Schematic graph of white-dwarf radius against mass: the curve falls as mass rises and reaches zero '
                      'at 1.4 solar masses, marked by a dashed vertical line labelled Chandrasekhar limit. The Sun\'s mass, '
                      '1.0, is marked on the curve.')
    x0, y0, w, h = 80, 236, 480, 180
    pm = w / 1.6
    f.axis(x0, y0, w, h, 'mass of the white dwarf (Suns)', 'radius',
           ticks={'x': [(pm * m, s) for m, s in ((0.5, '0.5'), (1.0, '1.0'), (1.4, '1.4'))]})
    def R(m):
        return 0.6 * m ** (-1 / 3) * math.sqrt(max(0.0, 1 - (m / 1.4) ** (4 / 3)))
    pts = [(x0 + pm * m, y0 - 150 * R(m)) for m in [0.15 + i * 0.025 for i in range(0, 50)] + [1.399]]
    f.path(catmull(pts), 'ln e')
    xl = x0 + pm * 1.4
    f.line(xl, y0, xl, 56, 'ln r dash')
    f.text(xl, 46, 'Chandrasekhar limit: about 1.4 Suns', 't p b', 'middle', 13)
    f.circle(x0 + pm * 1.0, y0 - 150 * R(1.0), 6, 'fill-vol')
    f.text(x0 + pm * 1.0 + 10, y0 - 150 * R(1.0) - 10, "the Sun's mass", 't', 'start', 13)
    f.text(x0 + pm * 0.3, y0 - 150 * R(0.3) - 16, 'more mass, smaller star', 't e', 'start', 13)
    f.text(xl + 8, y0 - 60, 'no white dwarf', 't m', 'start', 12)
    f.text(xl + 8, y0 - 44, 'can exist here', 't m', 'start', 12)
    f.text(x0, 24, 'the curve is schematic: shape only', 't m', 'start', 12)
    return f.svg()


@figure
def s_ruler_ants():
    """Ants on a rubber ruler before and after it doubles in length in one minute."""
    f = Fig(640, 280, 'Two rulers. The top one, 14 cm long, has ants at 2, 4, 7 and 12 cm; the ant at 2 cm is marked '
                      'you. The bottom one, a minute later, is 28 cm long with the ants at 4, 8, 14 and 24 cm. Arrows '
                      'above it show that the three other ants have moved 2, 5 and 10 cm farther from you.')
    s = 20.0
    def ruler(x, y, cm, step):
        f.rect(x, y, cm * s, 18, 'plate', rx=2)
        for c in range(0, cm + 1):
            f.line(x + c * s, y, x + c * s, y + (8 if c % 5 == 0 else 4), 'ln m')
            if c % step == 0:
                f.text(x + c * s, y + 32, str(c), 't m', 'middle', 12)
    def ant(x, y, you=False):
        f.circle(x, y, 6, 'fill-ink')
        f.circle(x - 7, y, 4, 'fill-ink')
        if you:
            f.text(x, y - 12, 'you', 't b', 'middle', 12)
    f.text(60, 26, 'now: the ruler is 14 cm long', 't b', 'start', 13)
    ruler(60, 72, 14, 5)
    for m in (2, 4, 7, 12):
        ant(60 + m * s, 62, you=(m == 2))
    f.text(60, 134, 'one minute later: the ruler has stretched to 28 cm', 't b', 'start', 13)
    ruler(60, 200, 28, 5)
    for m in (4, 8, 14, 24):
        ant(60 + m * s, 190, you=(m == 4))
    for (a, b, lab) in ((6, 8, 'moved 2 cm'), (9, 14, 'moved 5 cm'), (14, 24, 'moved 10 cm')):
        y = 172 if lab != 'moved 5 cm' else 158
        f.arrow(60 + a * s, y, 60 + b * s, y, 'vector')
        f.text(60 + (a + b) / 2 * s, y - 6, lab, 't e', 'middle', 12)
    f.text(320, 264, 'from you: the ant that was 2 cm away moved 2 cm, 5 cm away moved 5 cm, 10 cm away moved 10 cm', 't m', 'middle', 12)
    return f.svg()
