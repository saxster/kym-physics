"""Figures for Chapter 0, The physicist's way of seeing. All drawings are ours; c0_eratosthenes redraws the geometry of
OpenStax Astronomy 2e Fig 2.11 (itself a modification of NOAA Ocean Service Education work) in the book's style."""
import math
from figs_core import Fig, figure


def _ship(f, x, y, w, h, mast, sail, hidden_hull=False):
    """A small sailing ship with its hull sitting on the water at (x, y). hidden_hull draws the hull dashed."""
    hull = f'M{x - w / 2:.1f},{y:.1f} L{x + w / 2:.1f},{y:.1f} L{x + w * .4:.1f},{y - h:.1f} L{x - w * .4:.1f},{y - h:.1f} Z'
    f.path(hull, 'ln dash' if hidden_hull else 'block')
    f.line(x, y - h, x, y - h - mast, 'ln')
    f.path(f'M{x:.1f},{y - h - mast:.1f} L{x + sail:.1f},{y - h - mast * .4:.1f} L{x:.1f},{y - h - mast * .3:.1f} Z', 'wash')
    f.path(f'M{x:.1f},{y - h - mast:.1f} L{x + sail:.1f},{y - h - mast * .4:.1f} L{x:.1f},{y - h - mast * .3:.1f} Z', 'ln')


def _eye(f, x, y):
    f.circle(x, y, 7, 'ln')
    f.circle(x, y, 2.6, 'fill-ink')
    f.line(x, y + 7, x, y + 22, 'ln')          # a watcher, drawn as an eye on a post
    f.line(x - 6, y + 22, x + 6, y + 22, 'ln')


@figure
def c0_hull_down():
    f = Fig(640, 300, 'Two drawings of a ship sailing away. Left, on a flat sea, the whole ship stays in view and simply '
                      'shrinks. Right, on a curved sea, the bulge of water hides the hull first while the mast still shows.')
    # ---- left panel: a flat sea
    f.text(165, 30, 'If the sea were flat', 't b', 'middle', 14)
    f.line(25, 180, 310, 180, 'ln e')
    _eye(f, 48, 158)
    _ship(f, 125, 180, 70, 16, 50, 30)
    _ship(f, 268, 180, 36, 9, 28, 16)
    f.line(55, 158, 252, 178, 'ln m dash')
    f.text(165, 215, 'the far ship just looks smaller:', 't m', 'middle', 13)
    f.text(165, 233, 'hull, mast and sail all still there', 't m', 'middle', 13)
    # ---- right panel: a curved sea (a shallow dome; the curve is hugely exaggerated)
    f.text(480, 30, 'The sea is curved', 't b', 'middle', 14)
    x1, y1, cx, cy, x2, y2 = 335, 200, 480, 118, 625, 200

    def dome(t):
        return ((1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2,
                (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2)
    f.path(f'M{x1},{y1} Q{cx},{cy} {x2},{y2}', 'ln e')
    ex, ey = 355, dome((355 - x1) / (x2 - x1))[1] - 20
    _eye(f, ex, ey)
    sx, sy = 595, dome((595 - x1) / (x2 - x1))[1]
    # sightline: the line from the eye that just grazes the dome
    best = None
    for k in range(60, 240):
        t = k / 290
        px, py = dome(t)
        s = (py - ey) / (px - ex)
        if best is None or s < best[0]:
            best = (s, px, py)
    s = best[0]
    f.line(ex + 7, ey, 618, ey + s * (618 - ex - 7), 'ln m dash')
    _ship(f, sx, sy, 36, 9, 28, 16, hidden_hull=True)
    f.text(480, 215, 'the water bulges up between you and the ship:', 't m', 'middle', 13)
    f.text(480, 233, 'the hull goes out of sight first, the mast last', 't m', 'middle', 13)
    f.text(320, 272, 'Both drawings are models. Only one of them predicts what sailors actually see.', 't', 'middle', 13)
    return f.svg()


@figure
def c0_rulers():
    f = Fig(640, 300, 'The same short stick measured with three rulers, marked every 10 cm, every 1 cm and every 1 mm. '
                      'The readings are about 0.4 dm, 3.6 or 3.7 cm, and 36.5 mm.')
    mm = 4.0                        # pixels per millimetre
    x0, stick = 60, 36.5 * mm        # the stick is 36.5 mm long
    panels = [
        (34, 'marks every 10 cm', 100, 'reads: about 0.4 dm'),
        (124, 'marks every 1 cm', 10, 'reads: 3.6 cm… or is it 3.7?'),
        (214, 'marks every 1 mm', 1, 'reads: 36.5 mm'),
    ]
    for y, title, step_mm, reading in panels:
        f.text(x0, y - 2, title, 't m', 'start', 13)
        f.rect(x0, y + 6, stick, 14, 'block', rx=3)
        f.line(x0 + stick, y + 20, x0 + stick, y + 36, 'ln m dash')
        f.rect(x0, y + 34, 520, 24, 'plate', rx=2)
        f.line(x0, y + 34, x0 + 520, y + 34, 'ln')
        n = int(130 / step_mm)
        for k in range(n + 1):
            x = x0 + k * step_mm * mm
            if x > x0 + 520:
                break
            length = 12 if (k * step_mm) % 100 == 0 else 9 if (k * step_mm) % 10 == 0 else 7 if (k * step_mm) % 5 == 0 else 4
            f.line(x, y + 34, x, y + 34 + length, 'ln' if length >= 9 else 'ln m')
            if step_mm == 100 and k * step_mm in (0, 100):
                f.text(x, y + 54, '0' if k == 0 else '1 dm', 't', 'middle', 12)
            if step_mm in (10, 1) and (k * step_mm) % 10 == 0:
                f.text(x, y + 54, str(k * step_mm // 10), 't', 'middle', 12)
        f.text(x0 + 520, y + 20, reading, 't b', 'end', 14)
    f.text(320, 290, 'the finer the marks, the more digits you can honestly write down', 't m', 'middle', 13)
    return f.svg()


@figure
def c0_ladder():
    f = Fig(1000, 250, 'A ladder of sizes from a proton at ten to the minus fifteen metres to the Milky Way at ten to the '
                       'twenty-one metres. Every step along the ladder multiplies the size by ten.', wide=True)
    y = 150
    x_of = lambda e: 60 + (e + 15) * 25
    f.add(f'<line x1="{x_of(-15)}" y1="{y}" x2="{x_of(21) + 4}" y2="{y}" class="ax" marker-end="url(#ah-ink)"/>')
    for e in range(-15, 22):
        f.line(x_of(e), y - (6 if e % 5 == 0 else 3), x_of(e), y + (6 if e % 5 == 0 else 3), 'ln' if e % 5 == 0 else 'ln m')
    sup = {'-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'}

    def pw(e):
        return '10' + ''.join(sup[c] for c in str(e))
    above = [(-15, 'proton'), (-6, 'a wave of light'), (0, 'you'), (9, 'the Sun'), (16, 'one light year')]
    below = [(-10, 'hydrogen atom'), (-3, 'grain of sand'), (7, 'Earth'), (11, 'Earth to Sun'), (21, 'Milky Way')]
    for e, name in above:
        x = x_of(e)
        f.line(x, y - 8, x, y - 36, 'ln m')
        f.circle(x, y - 8, 3, 'fill-vol')
        anchor = 'start' if e == -15 else 'middle'
        f.text(x if anchor == 'middle' else x - 6, y - 44, name, 't', anchor, 13)
        f.text(x if anchor == 'middle' else x - 6, y - 60, pw(e) + ' m', 't m', anchor, 12)
    for e, name in below:
        x = x_of(e)
        f.line(x, y + 8, x, y + 44, 'ln m')
        f.circle(x, y + 8, 3, 'fill-vol')
        anchor = 'end' if e == 21 else 'middle'
        f.text(x if anchor == 'middle' else x + 6, y + 62, name, 't', anchor, 13)
        f.text(x if anchor == 'middle' else x + 6, y + 78, pw(e) + ' m', 't m', anchor, 12)
    f.bracket_label(x_of(-10), x_of(9), 70, '19 steps of ×10 from a hydrogen atom to the Sun', 13)
    f.bracket_label(x_of(3), x_of(4), y + 14, 'one step: ×10', 12, up=False)
    return f.svg()


@figure
def c0_rain():
    f = Fig(640, 300, 'A slab of water the size of Mumbai, 40 km by 15 km and 0.1 m deep, drawn far too thick, with the '
                      'arithmetic that turns it into a mass of 6 times 10 to the 10 kilograms.')
    ax, ay = 90, 130
    bx, by = 430, 130
    cx, cy = 520, 82
    dx, dy = 180, 82
    th = 22   # the 0.1 m of rain, drawn thousands of times too thick
    f.path(f'M{ax},{ay} L{bx},{by} L{cx},{cy} L{dx},{dy} Z', 'water')
    f.path(f'M{ax},{ay} L{bx},{by} L{bx},{by + th} L{ax},{ay + th} Z', 'wash-e')
    f.path(f'M{bx},{by} L{cx},{cy} L{cx},{cy + th} L{bx},{by + th} Z', 'wash-e')
    f.path(f'M{ax},{ay} L{bx},{by} L{cx},{cy} L{dx},{dy} Z M{ax},{ay} L{ax},{ay + th} L{bx},{by + th} L{bx},{by} '
           f'M{bx},{by + th} L{cx},{cy + th} L{cx},{cy}', 'ln')
    f.bracket_label(ax, bx, ay + th + 10, '40 km', 13, up=False)
    f.text(cx + 8, cy + 4, '15 km', 't', 'start', 13)
    f.line(bx + 6, by + 2, bx + 6, by + th - 2, 'ln m')
    f.text(bx + 12, by + th + 2, '0.1 m of rain', 't', 'start', 13)
    f.text(bx + 12, by + th + 18, '(drawn far too thick)', 't m', 'start', 12)
    f.text(300, 60, 'the whole city as one flat slab', 't m', 'middle', 13)
    f.lines(60, 222, ['area:  40 km × 15 km = 600 km² = 6 × 10⁸ m²',
                      'volume:  6 × 10⁸ m² × 0.1 m = 6 × 10⁷ m³',
                      'mass:  6 × 10⁷ m³ × 1,000 kg/m³ = 6 × 10¹⁰ kg, about 60 million tonnes'], 't', 'start', 14, lh=1.5)
    return f.svg()


@figure
def c0_eratosthenes():
    f = Fig(640, 340, 'The Earth drawn as a circle with two upright sticks. At Syene the sunlight runs straight down the '
                      'stick and into a well. At Alexandria, to the north, the same parallel sunlight meets the stick at an '
                      'angle and casts a shadow. The shadow angle equals the angle between the two sticks at the centre of the Earth.')
    Cx, Cy, R = 320, 330, 190
    ang = math.radians(30)            # the real angle is 7.2°; drawn at 30° so it can be seen
    f.circle(Cx, Cy, R, 'wash')
    f.circle(Cx, Cy, R, 'ln')
    # parallel sunlight
    for x in (60, 130, 205, 320, 420, 500, 580):
        top = 18
        y_hit = Cy - math.sqrt(max(R * R - (x - Cx) ** 2, 0)) if abs(x - Cx) < R else 300
        if x == 205:
            y_hit = 131   # this ray stops at the tip of the Alexandria stick
        if x == 320:
            y_hit = 100   # this ray runs down the Syene stick
        f.ray(x, top, x, y_hit - 4, chevrons=1)
    f.text(370, 36, 'sunlight:', 't nn', 'middle', 12)
    f.text(370, 50, 'parallel rays', 't nn', 'middle', 12)
    # Syene: a stick (the well) with the Sun straight overhead
    sx, sy = Cx, Cy - R
    f.line(sx, sy, sx, sy - 40, 'ln', 'stroke-width="3"')
    f.text(sx + 10, sy + 20, 'Syene: no shadow', 't b', 'start', 13)
    f.text(sx + 10, sy + 36, 'the Sun is straight overhead', 't m', 'start', 12)
    # Alexandria: a stick on the surface, 30° round the circle, radial
    ax, ay = Cx - R * math.sin(ang), Cy - R * math.cos(ang)
    tx, ty = ax - 40 * math.sin(ang), ay - 40 * math.cos(ang)
    f.line(ax, ay, tx, ty, 'ln', 'stroke-width="3"')
    # its shadow: along the surface from the foot to where the ray through the tip meets the ground
    shx = tx
    shy = Cy - math.sqrt(R * R - (shx - Cx) ** 2)
    f.line(ax, ay, shx, shy, 'ln p', 'stroke-width="4"')
    f.text(190, 150, 'shadow', 't p b', 'end', 13)
    f.text(212, 196, 'Alexandria', 't b', 'end', 13)
    # the shadow angle at the tip: between "down the stick" and "down the ray"
    a1 = math.degrees(math.atan2(ay - ty, ax - tx))   # direction from tip to foot
    r = 22
    p1 = (tx + r * math.cos(math.radians(a1)), ty + r * math.sin(math.radians(a1)))
    p2 = (tx, ty + r)
    f.path(f'M{p1[0]:.1f},{p1[1]:.1f} A{r},{r} 0 0 1 {p2[0]:.1f},{p2[1]:.1f}', 'ln e')
    f.text(232, 152, '7.2°', 't e b', 'start', 13)
    # the same angle at the centre of the Earth
    f.line(Cx, Cy, sx, sy, 'ln m dash')
    f.line(Cx, Cy, ax, ay, 'ln m dash')
    r2 = 46
    q1 = (Cx - r2 * math.sin(ang), Cy - r2 * math.cos(ang))
    q2 = (Cx, Cy - r2)
    f.path(f'M{q1[0]:.1f},{q1[1]:.1f} A{r2},{r2} 0 0 1 {q2[0]:.1f},{q2[1]:.1f}', 'ln e')
    f.text(Cx + 8, Cy - 12, '7.2° again: the same angle,', 't e b', 'start', 13)
    f.text(Cx + 8, Cy + 4, '1/50 of a full turn', 't e', 'start', 12)
    f.text(272, 176, '5,000 stadia', 't', 'middle', 13)
    return f.svg()


@figure
def cover_art():
    """Sixteen physics milestone tiles (Chapters 0 to 15) arranged across four volumes."""
    TILES = [
        (0, '7.2°', 'Earth’s shadow', 1, 0),
        (1, 't²', 'Galileo’s ramp', 1, 0),
        (2, 'v = c', 'Inertia', 1, 0),
        (3, 'F = ma', 'Pairs of force', 1, 0),
        (4, '9.8', 'Free fall', 1, 0),
        (5, 'GMm/r²', 'Orbits', 2, 1),
        (6, 'ρgh', 'Ocean of air', 2, 0),
        (7, '½mv²', 'Energy', 2, 0),
        (8, 'ΔQ', 'Heat & monsoon', 2, 0),
        (9, 'v = fλ', 'Waves & tabla', 3, 0),
        (10, 'θᵢ = θᵣ', 'Light & sight', 3, 0),
        (11, 'Δλ', 'Raman’s sea', 3, 1),
        (12, 'V = IR', 'Circuits', 4, 0),
        (13, '∇×B', 'Fields & trams', 4, 0),
        (14, '23.4°', 'Earth, Moon, Sun', 4, 0),
        (15, 'E = mc²', 'Starlight', 4, 1),
    ]
    W, H = 928, 224
    cw, ch, gap = 108, 92, 8
    f = Fig(W, H, 'Sixteen tiles for the sixteen chapters of this book, grouped into four volumes from falling stones to the stars.')
    vols = [
        (0, 5, 'I · Motion & force'),
        (5, 9, 'II · Gravity, pressure & energy'),
        (9, 12, 'III · Waves, sound & light'),
        (12, 16, 'IV · Fields & the sky'),
    ]
    # 2 rows of 8 tiles
    for n, sym, label, vol, hi in TILES:
        col = n % 8
        row = n // 8
        x = 6 + col * (cw + gap)
        y = 18 + row * (ch + gap + 6)
        f.add(f'<g class="el on" style="--i:{n + 1}" data-ch="{n}">')
        cls = 'fill-vol' if hi else 'fill-ink'
        f.rect(x, y, cw, ch, cls, 6)
        f.text(x + 9, y + 18, f'Ch {n} · Vol {["I","II","III","IV"][vol - 1]}', 't', 'start', 10.5, extra='style="fill:var(--sheet);opacity:.72"')
        fsz = 18 if len(sym) > 4 else 22
        f.text(x + cw / 2, y + 52, sym, 't s', 'middle', fsz, 600, 'style="fill:var(--sheet)"')
        f.text(x + cw / 2, y + ch - 12, label, 't', 'middle', 11.5, 500, 'style="fill:var(--sheet);opacity:.88"')
        f.add('</g>')
    return f.svg()

