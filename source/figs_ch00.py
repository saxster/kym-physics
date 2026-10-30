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
    f = Fig(640, 420, 'The same short stick measured with three rulers, marked every 10 cm, every 1 cm and every 1 mm. '
                      'The readings are about 0.4 dm, 3.6 or 3.7 cm, and 36.5 mm. Below, the magnified endpoint and two '
                      'bullseye targets contrasting precision and accuracy.')
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
    f.text(580, 191, 'cm', 't m', 'end', 12)
    f.text(580, 281, 'cm', 't m', 'end', 12)
    f.text(60, 322, 'Magnify the endpoint', 't b', size=14)
    f.text(60, 342, '36.5 lies between the marks;', 't', size=12)
    f.text(60, 358, 'the last digit is an estimate.', 't m', size=12)
    zx, zy, step = 250, 344, 42
    f.rect(zx, zy-30, 1.5*step, 12, 'block', rx=1)
    f.line(zx+1.5*step,zy-18,zx+1.5*step,zy+10,'ln p dash')
    f.line(zx,zy,zx+4*step,zy,'ln')
    for k in range(5):
        f.line(zx+k*step,zy,zx+k*step,zy+8,'ln')
        f.text(zx+k*step,zy+23,str(35+k),'t','middle',12)
    f.text(zx+1.5*step,zy-36,'36.5 mm','t p b','middle',12)
    # Bullseye inset: precise vs accurate
    for tx, lbl, pts in ((475, 'precise, not accurate', [(9, -9), (11, -7), (8, -11), (12, -10)]),
                         (562, 'precise & accurate', [(-2, 1), (2, -1), (0, 2), (-1, -2)])):
        ty = 342
        f.circle(tx, ty, 19, 'ln m')
        f.circle(tx, ty, 9, 'ln m')
        f.circle(tx, ty, 2, 'fill-ink')
        for dx, dy in pts:
            f.circle(tx + dx, ty + dy, 2.3, 'fill-vol')
        f.text(tx, ty + 33, lbl, 't m', 'middle', 10.5)
    f.text(320, 408, 'Finer divisions give better precision; checking the zero gives accuracy.', 't m', 'middle', 13)
    return f.svg()


@figure
def c0_ladder():
    f = Fig(1000, 435, 'A logarithmic size ruler from a proton at about ten to the minus fifteen metres to the Milky Way at about ten to the twenty-one metres. Pictured landmarks are symbols, not a common-scale drawing. Each equal tick step multiplies the physical length by ten.')
    f.text(32,30,'One ruler, thirty-six steps of ×10','t b',size=20)
    f.text(32,54,'Each little step changes the size by ten, even when the object is too small or too large to see.','t m',size=14)
    y=240
    def X(e): return 56+(e+15)*24.5
    f.arrow(X(-15),y,X(21)+15,y,'ink')
    for e in range(-15,22):
        f.line(X(e),y-5,X(e),y+5,'ln m')
    sup=str.maketrans('-0123456789','⁻⁰¹²³⁴⁵⁶⁷⁸⁹')
    items=[(-15,'proton','proton',True),(-10,'hydrogen atom','atom',False),(-6,'visible light','light',True),
           (-3,'grain of sand','sand',False),(0,'you','person',True),(7,'Earth','earth',False),
           (9,'Sun','sun',True),(11,'Earth to Sun','distance',False),(16,'one light-year','ruler',True),(21,'Milky Way','galaxy',False)]
    for e,name,kind,above in items:
        x=X(e); cy=166 if above else 319
        f.line(x,y-8 if above else y+8,x,cy+29 if above else cy-29,'ln m')
        f.circle(x,y,3.5,'fill-vol')
        if kind=='proton':
            f.nucleon(x,cy,'p',r=17)
        elif kind=='atom':
            f.circle(x,cy,25,'region');f.nucleon(x,cy,'p',r=7);f.nucleon(x+17,cy-12,'e',r=5)
        elif kind=='light': f.wave(x-30,cy,60,12,30)
        elif kind=='sand':
            f.path(f'M{x-19},{cy-11} L{x-3},{cy-24} L{x+18},{cy-12} L{x+22},{cy+12} L{x-2},{cy+22} L{x-22},{cy+9} Z','wash-n')
            f.path(f'M{x-19},{cy-11} L{x-3},{cy-24} L{x+18},{cy-12} L{x+22},{cy+12} L{x-2},{cy+22} L{x-22},{cy+9} Z','ln')
            for dx,dy in ((-6,-8),(9,3),(-9,12)): f.circle(x+dx,cy+dy,1.5,'fill-ink')
        elif kind=='person':
            f.circle(x,cy-19,7,'block');f.line(x,cy-12,x,cy+9,'ln');f.path(f'M{x-13},{cy-2} L{x},{cy-8} L{x+13},{cy-2} M{x-11},{cy+27} L{x},{cy+9} L{x+11},{cy+27}','ln')
        elif kind in ('earth','sun'):
            f.circle(x,cy,22,'water' if kind=='earth' else 'wash-n');f.circle(x,cy,22,'ln')
            if kind=='earth':
                f.path(f'M{x-15},{cy-12} L{x-5},{cy-18} L{x+3},{cy-9} L{x-4},{cy-1} L{x+2},{cy+8} L{x-6},{cy+17} L{x-11},{cy+5} Z','wash-g')
            else:
                for k in range(8):
                    a=k*math.pi/4; f.line(x+28*math.cos(a),cy+28*math.sin(a),x+34*math.cos(a),cy+34*math.sin(a),'ln nn')
        elif kind in ('distance','ruler'):
            f.arrow(x-30,cy,x+30,cy,'muted');f.arrow(x+30,cy,x-30,cy,'muted')
            f.circle(x-32,cy,4,'fill-vol');f.circle(x+32,cy,7,'wash-n')
        else:
            f.add(f'<ellipse cx="{x}" cy="{cy}" rx="27" ry="12" class="wash" transform="rotate(-25 {x} {cy})"/>')
            f.path(f'M{x-26},{cy+10} Q{x+12},{cy-22} {x+13},{cy} Q{x+6},{cy+13} {x-4},{cy} Q{x-8},{cy-13} {x+27},{cy-12}','ln e')
        anchor='start' if e==-15 else 'end' if e==21 else 'middle'
        tx=x-18 if e==-15 else x+18 if e==21 else x
        f.text(tx,cy-43 if above else cy+51,name,'t b',anchor,14)
        f.text(tx,cy-61 if above else cy+71,'≈ 10'+str(e).translate(sup)+' m','t m',anchor,13)
    f.bracket_label(X(2),X(3),273,'×10',13,up=False)
    f.text(500,424,'Positions show approximate physical sizes. The object drawings are symbols, not to scale.','t m','middle',13)
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
    f = Fig(640, 372, 'The Earth drawn as a circle with two upright sticks. At Syene the sunlight runs straight down the '
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
    f.text(272, 196, '5,000 stadia', 't', 'middle', 13)
    f.text(320, 362, 'Angles enlarged to show the geometry; the measured angle was 7.2°.', 't m', 'middle', 12)
    return f.svg()


def _cover_emblem(f, n, x, y):
    """Small physical clues for the chapter before its formula means anything."""
    f.add(f'<g class="cover-emblem" transform="translate({x} {y})" aria-hidden="true">')
    if n == 0:
        f.circle(0, 4, 17, 'ln'); f.line(-8,-11,-12,-24,'ln'); f.line(4,-12,4,-25,'ln')
        f.path('M-12,-25 L-20,-9 M4,-25 L4,-13','ln')
    elif n == 1:
        f.path('M-23,14 L23,14 M-22,-12 L23,14','ln'); f.circle(-14,-14,5,'ln')
        for xx,yy in ((-2,-7),(14,3)): f.circle(xx,yy,3,'fill-ink')
    elif n == 2:
        f.rect(-23,-13,46,25,'ln',rx=4)
        for xx in (-15,-2,11): f.rect(xx,-7,7,8,'ln',rx=1)
        for xx in (-14,14): f.circle(xx,15,4,'ln')
        f.line(-25,21,25,21,'ln')
    elif n == 3:
        f.rect(-13,-8,26,19,'ln',rx=2)
        for xx in (-8,8): f.circle(xx,15,3,'ln')
        f.path('M-27,1 L-14,1 M-22,-4 L-27,1 L-22,6 M14,1 L27,1 M22,-4 L27,1 L22,6','ln')
    elif n == 4:
        for yy,r in ((-21,3),(-8,4),(12,6)): f.circle(0,yy,r,'ln')
        f.line(-22,24,22,24,'ln')
    elif n == 5:
        f.add('<ellipse cx="0" cy="0" rx="25" ry="16" class="ln" transform="rotate(-25)"/>')
        f.circle(-10,4,5,'fill-ink'); f.circle(21,-14,4,'fill-ink')
    elif n == 6:
        f.path('M-24,-4 L24,-4 L15,10 L-15,10 Z M0,-4 L0,-23 M0,-23 L15,-9 L0,-9','ln')
        f.wave(-27,19,54,3,18,cls='ln')
    elif n == 7:
        f.circle(0,-15,6,'ln');f.path('M-25,10 L-9,10 Q0,31 9,10 L25,10 M-25,23 L25,23','ln')
    elif n == 8:
        f.path('M-11,-22 L11,-22 L11,-12 Q29,-1 19,18 Q0,29 -19,18 Q-29,-1 -11,-12 Z','ln')
        f.wave(-15,3,30,2,15,cls='ln')
        for xx in (-24,24): f.path(f'M{xx},-13 Q{xx-5},-20 {xx},-27','ln')
    elif n == 9:
        f.wave(-27,0,54,16,27,cls='ln');f.line(-27,0,27,0,'ln thin')
    elif n == 10:
        f.path('M-27,0 Q0,-26 27,0 Q0,26 -27,0 Z','ln');f.circle(0,0,10,'ln');f.circle(0,0,4,'fill-ink')
    elif n == 11:
        f.path('M0,-23 L-20,19 L20,19 Z M-29,-4 L-9,-4 L11,3 M11,3 L29,7 M11,3 L29,15 M11,3 L29,23','ln')
    elif n == 12:
        f.path('M-18,-2 L-18,-19 L19,-19 L19,19 L-18,19 L-18,7 M-25,-2 L-11,-2 M-22,7 L-14,7','ln')
        f.circle(19,0,8,'ln');f.path('M14,-5 L24,5 M14,5 L24,-5','ln')
    elif n == 13:
        f.rect(-9,-22,18,44,'ln',rx=2);f.line(-9,0,9,0,'ln')
        f.path('M-10,-13 C-33,-24 -33,24 -10,13 M10,-13 C33,-24 33,24 10,13','ln')
    elif n == 14:
        f.circle(0,0,19,'ln');f.line(-12,28,12,-28,'ln');f.line(-17,-8,17,8,'ln')
        f.path('M-32,-12 L-23,-12 M-32,1 L-23,1 M-32,14 L-23,14','ln')
    else:
        f.path('M-18,-25 L-13,-12 L0,-7 L-13,-2 L-18,11 L-23,-2 L-36,-7 L-23,-12 Z','ln')
        for xx,hh in ((1,28),(10,39),(19,20),(28,32)): f.line(xx,23,xx,23-hh,'ln')
    f.add('</g>')


@figure
def cover_art():
    """Sixteen physics milestone tiles (Chapters 0 to 15) arranged across four volumes."""
    TILES = [
        (0, '7.2°', 'Earth’s shadow', 1, 0),
        (1, 't²', 'Galileo’s ramp', 1, 0),
        (2, 'v constant', 'Inertia', 1, 0),
        (3, 'F = ma', 'Pairs of force', 1, 0),
        (4, '9.8', 'Free fall', 1, 0),
        (5, 'GMm/r²', 'Orbits', 2, 0),
        (6, 'ρgh', 'Ocean of air', 2, 0),
        (7, '½mv²', 'Energy', 2, 0),
        (8, 'ΔQ', 'Heat & monsoon', 2, 0),
        (9, 'v = fλ', 'Waves & tabla', 3, 0),
        (10, 'θᵢ = θᵣ', 'Light & sight', 3, 0),
        (11, 'Δλ', 'Raman’s sea', 3, 0),
        (12, 'V = IR', 'Circuits', 4, 0),
        (13, '∇×B', 'Fields & trams', 4, 0),
        (14, '23.4°', 'Earth, Moon, Sun', 4, 0),
        (15, 'E = mc²', 'Starlight', 4, 0),
    ]
    W, H = 640, 530
    cw, ch, gap = 146, 118, 10
    f = Fig(W, H, 'Sixteen tiles for the sixteen chapters of this book, grouped into four volumes from falling stones to the stars.')
    vols = [
        (0, 5, 'I · Motion & force'),
        (5, 9, 'II · Gravity, pressure & energy'),
        (9, 12, 'III · Waves, sound & light'),
        (12, 16, 'IV · Fields & the sky'),
    ]
    # Four columns keep the illustrated clues readable on a phone.
    for n, sym, label, vol, hi in TILES:
        col = n % 4
        row = n // 4
        x = 12 + col * (cw + gap)
        y = 12 + row * (ch + gap)
        f.add(f'<g class="el on" style="--i:{n + 1}" data-ch="{n}">')
        cls = 'fill-vol' if hi else 'fill-ink'
        f.rect(x, y, cw, ch, cls, 6)
        f.text(x + 9, y + 18, f'Ch {n} · Vol {["I","II","III","IV"][vol - 1]}', 't', 'start', 10.5, extra='style="fill:var(--sheet);opacity:.72"')
        _cover_emblem(f, n, x + 39, y + 61)
        fsz = 13 if len(sym) > 8 else 16 if len(sym) > 4 else 20
        f.text(x + 104, y + 66, sym, 't s', 'middle', fsz, 600, 'style="fill:var(--sheet)"')
        f.text(x + cw / 2, y + ch - 12, label, 't', 'middle', 12.5, 500, 'style="fill:var(--sheet);opacity:.88"')
        f.add('</g>')
    return f.svg()

