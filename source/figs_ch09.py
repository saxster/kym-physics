"""Figures for Chapter 9, Vibrations, waves and sound. All drawn by us; numbers from grounding/ch09.md (OpenStax
College Physics 2e Ch 16–17; MIT 8.03SC; MIT 18.03 Appendix B) and recomputed with python3 -I (see provenance/ch09.yml)."""
import math
from figs_core import Fig, figure


@figure
def c9_pendulum():
    f = Fig(640, 350, 'Two pendulums, one four times as long as the other: their periods are about 2 and 4 seconds. '
                      'The longer pendulum shows weight downward and the part of that weight acting back along the arc. '
                      'The blue component is not an extra force; string tension is omitted.')
    def pend(px, py, L, ang_deg, label, period, forces=False, centre_line=True):
        a = math.radians(ang_deg)                      # negative angle: bob displaced to the left
        bx, by = px + L * math.sin(a), py + L * math.cos(a)
        f.line(px - 24, py, px + 24, py, 'ln')
        f.ground(px - 24, py, 48, hatch=8, depth=-6)
        if centre_line:
            f.line(px, py, px, py + L + 10, 'ln dash')
        # the arc of the swing
        amp = abs(ang_deg)
        pts = []
        for k in range(21):
            t = math.radians(-amp + 2 * amp * k / 20)
            pts.append((px + L * math.sin(t), py + L * math.cos(t)))
        f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts), 'ln m')
        f.line(px, py, bx, by, 'ln')
        f.circle(bx, by, 11, 'block')
        f.text(px, py - 12, label, 't b', 'middle', 13)
        f.text(px, py + L + 34, period, 't', 'middle', 13)
        if forces:
            # weight straight down; its part along the arc, back towards the middle (to the right here)
            f.force(bx, by, 0, 80, 'weight')
            tx, ty = math.cos(a), -math.sin(a)         # unit vector along the arc, towards the middle
            comp = 80 * math.sin(abs(a))
            f.vector(bx, by, tx * comp, ty * comp, 'part along the arc', 12)
            f.line(bx + tx * comp, by + ty * comp, bx, by + 80, 'ln m dash')
    pend(110, 30, 47.5, 22, '1 m long', '2.0 s per swing')
    pend(300, 30, 190, -22, '4 m long', '4.0 s per swing', forces=True, centre_line=False)
    f.text(530, 120, 'four times the', 't', 'middle', 13)
    f.text(530, 138, 'length gives twice', 't', 'middle', 13)
    f.text(530, 156, 'the period', 't', 'middle', 13)
    f.text(530, 196, 'the mass of the bob', 't m', 'middle', 12)
    f.text(530, 212, 'makes no difference', 't m', 'middle', 12)
    f.text(320, 338, 'Blue: a part of weight, not another force. The string’s tension is not shown.', 't m', 'middle', 12)
    return f.svg()


@figure
def c9_resonance():
    f = Fig(640, 300, 'A graph of how far a driven oscillator swings against the frequency of the pushes: a tall narrow '
                      'peak at the natural frequency for light damping and a lower, broader hump for heavy damping')
    x0, y0, w, h = 80, 250, 500, 190
    f.axis(x0, y0, w, h, 'frequency of the pushes', 'how far it swings',
           ticks={'x': [(w * 0.5, 'natural frequency')]})
    def curve(G, cls):
        pts = []
        for i in range(0, 201):
            wd = 2.0 * i / 200                          # drive frequency in units of the natural frequency
            A = 1 / math.sqrt((1 - wd ** 2) ** 2 + (wd * G) ** 2)
            pts.append((x0 + wd * w / 2, y0 - min(A, 6.6) * h / 7))
        f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts), cls)
    curve(0.16, 'ln e')
    curve(0.6, 'ln nn')
    f.line(x0 + w / 2, y0, x0 + w / 2, y0 - h + 10, 'ln dash')
    f.text(x0 + w / 2 + 14, y0 - h + 22, 'light damping: tall, narrow', 't e', 'start', 13)
    f.text(x0 + w / 2 + 70, y0 - h * 0.20, 'heavy damping: low, broad', 't nn', 'start', 13)
    f.text(x0 + 10, y0 - h * 0.46, 'pushes too slow: it just follows', 't m', 'start', 12)
    f.text(x0 + w - 10, y0 - h * 0.46, 'pushes too fast: it barely moves', 't m', 'end', 12)
    return f.svg()


@figure
def c9_flutter():
    f = Fig(640, 260, 'Two drawings of a bridge deck. Left: gusts arriving in time with the deck’s up-and-down swing, '
                      'which would be resonance. Right: a steady wind, the deck twisting, and the push on it changing with '
                      'the twist, which is flutter')
    # left: resonance story
    f.text(160, 28, 'the textbook story: resonance', 't b', 'middle', 13)
    f.rect(70, 120, 180, 14, 'block', rx=2)
    f.line(70, 60, 70, 120, 'ln m'); f.line(250, 60, 250, 120, 'ln m')
    f.vector(160, 110, 0, -34, '', 12)
    f.vector(160, 148, 0, 34, '', 12)
    f.text(160, 184, 'deck swings up and down', 't m', 'middle', 12)
    for k, xx in enumerate((20, 20, 20)):
        y = 90 + k * 22
        f.arrow(14, y, 54, y, 'neutron')
    f.text(34, 76, 'gust', 't nn', 'middle', 12)
    f.text(160, 212, 'gusts arriving in time with the swing', 't', 'middle', 12)
    f.text(160, 228, '(the wind was not gusting)', 't p', 'middle', 12)
    # right: flutter
    f.text(480, 28, 'what happened: flutter', 't b', 'middle', 13)
    # twisted deck, seen end-on
    cx, cy = 480, 126
    a = math.radians(14)
    L = 90
    x1, y1 = cx - L * math.cos(a), cy + L * math.sin(a)
    x2, y2 = cx + L * math.cos(a), cy - L * math.sin(a)
    f.add(f'<polygon points="{x1:.1f},{y1-7:.1f} {x2:.1f},{y2-7:.1f} {x2:.1f},{y2+7:.1f} {x1:.1f},{y1+7:.1f}" class="block"/>')
    f.curved_arrow(cx - 60, cy - 50, cx + 60, cy - 46, bend=-18)
    f.text(cx, cy - 64, 'the deck twists', 't m', 'middle', 12)
    for y in (96, 126, 156):
        f.arrow(340, y, 374, y, 'neutron')
    f.text(356, 82, 'steady wind', 't nn', 'middle', 12)
    f.force(x1 + 44, y1 - 14, 0, -30, 'push up here')
    f.force(x2 - 20, y2 + 10, 0, 30, 'push down here')
    f.text(480, 212, 'the twist changes the push, and the push', 't', 'middle', 12)
    f.text(480, 228, 'drives the next twist: it pushes itself', 't', 'middle', 12)
    f.line(320, 40, 320, 240, 'ln r')
    return f.svg()


@figure
def c9_wave_carries():
    f = Fig(640, 380, 'Ripples spreading in rings from a dipped finger, seen from above with a paper scrap staying in '
                      'place, and the same wave seen from the side with wavelength, amplitude and the small loop each bit of '
                      'water travels')
    # top view
    cx, cy = 150, 126
    for r in (20, 40, 60, 80, 100):
        f.circle(cx, cy, r, 'ln e' if r % 40 else 'ln m')
    f.circle(cx, cy, 4, 'fill-ink')
    f.text(cx, cy - 110, 'finger dipped here', 't m', 'middle', 12)
    f.arrow(cx + 84, cy - 52, cx + 112, cy - 70, 'ink')
    f.text(cx + 120, cy - 74, 'crests move outward', 't', 'start', 12)
    f.rect(cx + 66, cy + 30, 14, 10, 'plate', rx=1)
    f.text(cx + 88, cy + 40, 'paper scrap: bobs, stays', 't', 'start', 12)
    f.text(cx, cy + 122, 'from above', 't b', 'middle', 13)
    # side view
    y0 = 314
    f.line(40, y0, 600, y0, 'ln r')
    f.text(44, y0 + 16, 'still level', 't m', 'start', 12)
    lam, amp = 120, 24
    f.wave(40, y0, 560, amp, lam, phase=0, cls='ln e')
    f.vector(440, y0 - amp - 36, 36, 0, 'the shape moves this way', 12)
    # wavelength bracket between two crests (phase 0: crests at x = 40 + lam/4 + n·lam)
    c1 = 40 + lam / 4 + lam
    c2 = c1 + lam
    f.bracket_label(c1, c2, y0 - amp - 10, 'wavelength: crest to crest', 12, up=True)
    # amplitude bracket
    xa = c2 + lam
    f.line(xa + 8, y0, xa + 8, y0 - amp, 'ln m')
    f.line(xa + 4, y0, xa + 12, y0, 'ln m'); f.line(xa + 4, y0 - amp, xa + 12, y0 - amp, 'ln m')
    f.text(xa + 16, y0 - amp / 2 + 4, 'amplitude', 't m', 'start', 12)
    # the loop a bit of water makes
    lx = c1
    f.circle(lx, y0 - amp / 2 - 2, amp / 2 + 2, 'ln dash')
    f.curved_arrow(lx - 10, y0 - amp - 6, lx + 12, y0 - amp - 4, bend=-8)
    f.text(lx + 40, y0 + 38, 'each bit of water goes round a small loop', 't', 'middle', 12)
    f.text(lx + 40, y0 + 54, 'and comes back to where it started', 't', 'middle', 12)
    f.text(560, y0 + 54, 'from the side', 't b', 'middle', 13)
    return f.svg()


@figure
def c9_compressions():
    f = Fig(640, 330, 'A vibrating spoon at the left with rows of air particles stretching to the right; the particles '
                      'crowd together in compressions and thin out in rarefactions, and a graph below shows the air pressure '
                      'rising and falling along the same line')
    # the spoon, vibrating
    f.path('M56,60 Q30,80 56,100 Q82,80 56,60 Z', 'block')
    f.line(56, 100, 56, 160, 'ln')
    f.line(40, 130, 46, 130, 'ln m'); f.line(66, 130, 72, 130, 'ln m')
    f.text(56, 180, 'spoon,', 't m', 'middle', 12)
    f.text(56, 194, 'vibrating', 't m', 'middle', 12)
    # particles: displacement field x = x0 + A sin(2π x0 / λ)
    lam, A = 150, 11
    xs = [100 + 9 * i for i in range(56)]
    for row in range(6):
        y = 62 + row * 18 + (4 if row % 2 else 0)
        for x0 in xs:
            x = x0 + A * math.sin(2 * math.pi * (x0 - 100) / lam)
            if x < 606:
                f.circle(x, y, 2.4, 'pt-e')
    # labels at compressions (x0 - 100 = λ/2 + nλ) and rarefactions
    for n in range(4):
        xc = 100 + lam / 2 + n * lam
        xr = 100 + n * lam
        if xc < 600:
            f.text(xc, 46, 'compression', 't', 'middle', 12)
        if n and xr < 600:
            f.text(xr, 46, 'rarefaction', 't m', 'middle', 12)
    f.vector(470, 190, 120, 0)
    f.text(530, 180, 'the pattern moves at 349 m/s', 't e', 'middle', 12)
    f.text(300, 202, 'each particle only shoves back and forth about its place', 't m', 'middle', 12)
    # pressure graph
    x0, y0, w, h = 100, 300, 500, 70
    f.axis(x0, y0, w, h, 'distance along the line', 'air pressure')
    for xc in (175, 325, 475):
        f.line(xc, 216, xc, y0, 'ln r dash')
    f.line(x0, y0 - h / 2, x0 + w, y0 - h / 2, 'ln r')
    f.text(x0 + w - 4, y0 - h / 2 - 6, 'normal pressure', 't m', 'end', 12)
    # Pressure is proportional to minus the displacement gradient, -cos(kx).
    # Its crests must sit directly below the crowded particle regions.
    f.wave(x0, y0 - h / 2, w - 20, 24, lam, phase=-math.pi / 2, cls='ln e')
    return f.svg()


@figure
def c9_loud_high():
    f = Fig(640, 320, 'Four microphone traces in a grid: a soft low note, a loud low note, a soft high note and a loud '
                      'high note; loud traces are taller, high traces have crests closer together')
    f.text(190, 28, 'soft', 't b', 'middle', 14)
    f.text(480, 28, 'loud', 't b', 'middle', 14)
    f.text(30, 100, 'low', 't b', 'middle', 14)
    f.text(30, 116, 'note', 't b', 'middle', 14)
    f.text(30, 230, 'high', 't b', 'middle', 14)
    f.text(30, 246, 'note', 't b', 'middle', 14)
    panels = [((70, 48), 12, 64, 'small waves, far apart'), ((360, 48), 38, 64, 'tall waves, far apart'),
              ((70, 178), 12, 24, 'small waves, close together'), ((360, 178), 38, 24, 'tall waves, close together')]
    for (px, py), amp, lam, lab in panels:
        f.rect(px, py, 240, 104, 'plate', rx=4)
        f.line(px, py + 52, px + 240, py + 52, 'ln r')
        f.wave(px + 6, py + 52, 228, amp, lam, phase=0, cls='ln e')
        f.text(px + 120, py + 120, lab, 't m', 'middle', 12)
    f.text(190, 316, 'time →', 't m', 'middle', 12)
    f.text(480, 316, 'time →', 't m', 'middle', 12)
    f.line(330, 40, 330, 300, 'ln r')
    f.line(60, 170, 610, 170, 'ln r')
    return f.svg()


@figure
def c9_harmonics():
    f = Fig(640, 360, 'Left: the first three vibration patterns of a string, at f, 2f and 3f. Middle: ladders of '
                      'overtone frequencies for a string (1, 2, 3, 4) and for an ideal flat drumhead (1, 1.59, 2.14, 2.30, '
                      '2.65). Right: a tabla head with its black patch, and its overtones pulled onto whole-number rungs')
    # string modes
    f.text(140, 28, 'a string’s patterns', 't b', 'middle', 13)
    for n, (y, lab) in enumerate(((70, 'f'), (140, '2f'), (210, '3f')), 1):
        f.line(40, y - 24, 40, y + 24, 'ln'); f.line(240, y - 24, 240, y + 24, 'ln')
        f.line(40, y, 240, y, 'ln r')
        for sgn, cls in ((1, 'ln e'), (-1, 'ln e dash')):
            pts = [(40 + 200 * k / 60, y - sgn * 18 * math.sin(math.pi * n * k / 60)) for k in range(61)]
            f.path('M' + ' L'.join(f'{x:.1f},{yy:.1f}' for x, yy in pts), cls)
        f.text(258, y + 5, lab, 't b', 'start', 13)
    f.text(140, 262, 'the ends are held, so only', 't m', 'middle', 12)
    f.text(140, 278, 'whole numbers of bumps fit', 't m', 'middle', 12)
    # A common frequency scale; nearby flat-drum labels use separated leaders.
    def ladder(x, rungs, title, cls_rung='ln e', top=60, label_y=None):
        f.line(x, 310, x, top, 'ln')
        if title:
            f.text(x, 46, title, 't b', 'middle', 12)
        for r in rungs:
            y = 310 - (r - 1) * 76
            if y < top:
                continue
            f.line(x - 16, y, x + 16, y, cls_rung)
            ly = (label_y or {}).get(r, y + 4)
            if abs(ly - (y + 4)) > 1:
                f.line(x + 16, y, x + 24, ly - 4, 'ln m')
            f.text(x + 28, ly, f'{r:g}', 't', 'start', 12)
    ladder(305, [1, 2, 3, 4], 'string')
    ladder(408, [1, 1.59, 2.14, 2.30, 2.65], 'flat drum', 'ln nn',
           label_y={2.14: 240, 2.30: 217})
    f.text(438, 348, 'relative frequency: f ÷ fundamental', 't m', 'middle', 12)
    # tabla: the drum at the top of its column, its ladder below
    f.text(555, 46, 'tabla', 't b', 'middle', 12)
    f.circle(555, 82, 25, 'glass')
    f.circle(555, 82, 22, 'plate')
    f.circle(553, 84, 8, 'fill-ink')
    f.text(555, 124, 'syahi: a loaded', 't m', 'middle', 12)
    f.text(555, 139, 'patch on the head', 't m', 'middle', 12)
    ladder(555, [1, 2, 3], '', 'ln g', top=152)
    f.text(555, 330, 'in tune', 't g', 'middle', 12)
    return f.svg()


@figure
def c9_doppler():
    f = Fig(640, 340, 'Rings of compressions spreading from a horn that moves to the right; each ring is centred where the '
                      'horn was when it made it, so the rings bunch together ahead of the horn and spread out behind it, '
                      'with a listener on each side')
    cy = 172
    N, r0, ratio = 6, 22, 0.3                     # ratio = source speed / sound speed (drawn larger than a local train's)
    x_start = 250
    for k in range(N):
        cxk = x_start + k * ratio * r0
        rad = (N - k) * r0
        f.circle(cxk, cy, rad, 'ln e')
    sx = x_start + N * ratio * r0
    f.path(f'M{sx-9:.1f},{cy-7} L{sx+11:.1f},{cy} L{sx-9:.1f},{cy+7} Z', 'fill-ink')
    # listeners, well outside the rings
    for (lx, lab1, lab2, cls) in ((566, 'listener ahead', 'a higher note', 't p b'), (74, 'listener behind', 'a lower note', 't e b')):
        f.circle(lx, cy - 4, 9, 'block')
        f.line(lx, cy + 5, lx, cy + 30, 'ln')
        f.text(lx, cy + 50, lab1, 't b', 'middle', 12)
        f.text(lx, cy + 66, lab2, cls, 'middle', 12)
    f.text(566, cy + 82, 'rings arrive', 't m', 'middle', 12)
    f.text(566, cy + 96, 'more often', 't m', 'middle', 12)
    f.text(74, cy + 82, 'rings arrive', 't m', 'middle', 12)
    f.text(74, cy + 96, 'less often', 't m', 'middle', 12)
    # labels outside the rings, with thin leaders to the ring fronts on the centre line
    front_ahead = sx + 0.5 * ((N - 5) * r0 + x_start + 5 * ratio * r0 - sx) + 1.5 * r0 * (1 - ratio)
    f.line(470, 70, 352, cy - 6, 'ln m')
    f.text(470, 64, 'bunched ahead', 't', 'middle', 12)
    f.line(150, 70, 190, cy - 6, 'ln m')
    f.text(150, 64, 'spread out behind', 't', 'middle', 12)
    f.text(320, 328, '▶ the horn now, moving right. Each ring started where the horn was when it made that compression.', 't m', 'middle', 12)
    return f.svg()
