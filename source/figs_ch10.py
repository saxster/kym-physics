"""Figures for Chapter 10 (Light and seeing). Names start with c10_. Theme classes only; colour is never the only cue."""
from __future__ import annotations
import math
from figs_core import Fig, figure, r_


def _eye(f, x, y, s=1.0):
    """A simple eye (almond outline, iris, pupil) centred at (x, y)."""
    w, h = 26 * s, 22 * s
    f.path(f'M{r_(x - w)},{r_(y)} Q{r_(x)},{r_(y - h)} {r_(x + w)},{r_(y)} Q{r_(x)},{r_(y + h)} {r_(x - w)},{r_(y)} Z', 'block')
    f.circle(x, y, 9 * s, 'ln')
    f.circle(x, y, 4.5 * s, 'fill-ink')


def _mango(f, x, y, rx=26, ry=18, tilt=-25, cls='block'):
    f.add(f'<ellipse cx="{r_(x)}" cy="{r_(y)}" rx="{rx}" ry="{ry}" transform="rotate({tilt} {r_(x)} {r_(y)})" class="{cls}"/>')
    f.line(x + rx * .8, y - ry * .9, x + rx * 1.0, y - ry * 1.5, 'ln')


def _lamp(f, x, y, r=12):
    f.circle(x, y, r, 'block')
    for k in range(8):
        a = math.radians(k * 45 + 22.5)
        f.line(x + math.cos(a) * (r + 4), y + math.sin(a) * (r + 4), x + math.cos(a) * (r + 12), y + math.sin(a) * (r + 12), 'ln m')


@figure
def c10_seeing():
    f = Fig(640, 300, 'Two drawings of seeing a mango: rays wrongly drawn leaving the eye, and light from a lamp bouncing off the mango into the eye')
    # left: the common drawing
    f.text(160, 26, 'What most people draw', 't m', 'middle', 13)
    _eye(f, 60, 160)
    f.text(60, 206, 'eye', 't m', 'middle', 12)
    _mango(f, 250, 160)
    f.text(250, 206, 'mango', 't m', 'middle', 12)
    f.arrow(92, 150, 220, 150, 'muted', dash=True)
    f.arrow(92, 170, 220, 170, 'muted', dash=True)
    f.text(156, 138, 'rays going out of the eye?', 't m', 'middle', 12)
    f.line(320, 40, 320, 280, 'ln r')
    # right: what happens
    f.text(480, 26, 'What happens', 't b', 'middle', 13)
    _lamp(f, 590, 70)
    f.text(590, 108, 'lamp', 't', 'middle', 12)
    mx, my = 500, 190
    _mango(f, mx, my)
    f.text(mx, 236, 'mango', 't', 'middle', 12)
    ex, ey = 370, 120
    _eye(f, ex, ey)
    f.text(ex, 166, 'eye', 't', 'middle', 12)
    f.ray(578, 84, 514, 172, chevrons=1)
    # light scattered in every direction
    for k in range(10):
        a = math.radians(k * 36 + 10)
        dx, dy = math.cos(a), math.sin(a)
        f.ray(mx + dx * 32, my + dy * 32, mx + dx * 58, my + dy * 58, chevrons=0)
    # the share that reaches the eye
    dx, dy = ex - mx, ey - my
    n = math.hypot(dx, dy)
    ux, uy = dx / n, dy / n
    f.ray(mx + ux * 32, my + uy * 32, ex - ux * 30, ey - uy * 30, chevrons=2)
    f.text(mx + 12, my + 72, 'light goes off in every direction', 't m', 'middle', 12)
    f.text(400, 206, 'some of it', 't m', 'middle', 12)
    f.text(400, 220, 'reaches the eye', 't m', 'middle', 12)
    return f.svg()


@figure
def c10_pinhole():
    f = Fig(640, 300, 'A pinhole camera: light from the top of a window passes straight through the hole and lands low on the screen, light from the bottom lands high, so the image is upside down')
    # the window (object)
    f.arrow(70, 230, 70, 78, 'ink', width=2.5)
    f.text(80, 70, 'top', 't m', 'start', 12)
    f.text(84, 236, 'bottom', 't m', 'start', 12)
    f.text(70, 258, 'a window 1 m tall', 't', 'middle', 13)
    # the box with a pinhole in its left face
    f.path('M400,144 L400,90 L600,90 L600,210 L400,210 L400,156 Z', 'fill-sheet')
    f.path('M400,144 L400,90 L600,90 L600,210 L400,210 L400,156', 'ln')
    f.line(600, 90, 600, 210, 'ln e')
    f.text(598, 80, 'screen', 't e', 'middle', 12)
    f.text(330, 100, 'pinhole', 't', 'middle', 12)
    f.line(330, 106, 396, 146, 'ln m')
    # rays: top of the window through the hole to the screen (lands low); bottom lands high
    y_top = 150 + (150 - 78) * 200 / 330
    y_bot = 150 - (230 - 150) * 200 / 330
    f.ray(70, 78, 400, 150, chevrons=2)
    f.ray(400, 150, 600, y_top, chevrons=1)
    f.ray(70, 230, 400, 150, chevrons=2)
    f.ray(400, 150, 600, y_bot, chevrons=1)
    # the inverted image on the screen
    f.arrow(594, y_bot, 594, y_top - 4, 'ink', width=2.5)
    f.text(500, 236, 'image: upside down and small', 't', 'middle', 12)
    f.bracket_label(70, 400, 280, '3 m (not to scale)', 12)
    f.bracket_label(400, 600, 280, '30 cm', 12)
    return f.svg()


@figure
def c10_mirror():
    f = Fig(640, 320, 'A point on a face in front of a flat mirror: a ray reflects into the eye at the same angle it arrived, and traced back the reflected rays meet behind the mirror at the image')
    # mirror: a thin slab at x = 360 with hatching behind it
    f.rect(356, 40, 8, 250, 'block', rx=1)
    for y in range(48, 286, 14):
        f.line(364, y, 372, y + 6, 'ln m')
    f.text(360, 32, 'mirror', 't', 'middle', 12)
    ox, oy = 170, 110
    ix, iy = 550, 110
    ex, ey = 150, 250
    # object point and its image
    f.circle(ox, oy, 4, 'fill-ink')
    f.text(ox, 92, 'a point on your face', 't', 'middle', 12)
    f.circle(ix, iy, 4, 'ln dash')
    f.text(ix, 92, 'image', 't m', 'middle', 12)
    _eye(f, ex, ey, 0.9)
    f.text(ex, 288, 'your eye', 't', 'middle', 12)
    # ray 1: object -> mirror -> eye, found from the image-to-eye line
    my = iy + (ey - iy) * (ix - 360) / (ix - ex)
    f.ray(ox, oy, 360, my, chevrons=1)
    dx, dy = ex - 360, ey - my
    n = math.hypot(dx, dy)
    f.ray(360, my, ex - dx / n * 30, ey - dy / n * 30, chevrons=1)
    f.line(360, my, ix, iy, 'ln dash')
    # the normal at the point of reflection, with the two angles
    f.line(300, my, 440, my, 'ln dash')
    f.text(444, my + 4, 'normal', 't m', 'start', 12)
    a = math.degrees(math.atan2(my - oy, 360 - ox))
    r = 42
    f.path(f'M{r_(360 - r)},{r_(my)} A{r},{r} 0 0 1 {r_(360 - r * math.cos(math.radians(a)))},{r_(my - r * math.sin(math.radians(a)))}', 'ln m')
    f.path(f'M{r_(360 - r)},{r_(my)} A{r},{r} 0 0 0 {r_(360 - r * math.cos(math.radians(a)))},{r_(my + r * math.sin(math.radians(a)))}', 'ln m')
    f.text(306, my - 8, 'i', 't s i', 'end', 13)
    f.text(306, my + 18, 'r', 't s i', 'end', 13)
    f.text(250, my + 46, 'angle r = angle i', 't m', 'middle', 12)
    # ray 2: straight at the mirror and straight back, traced through to the image
    f.ray(ox + 8, oy, 360, oy, chevrons=1)
    f.ray(360, oy + 6, ox + 12, oy + 6, chevrons=1)
    f.line(360, oy, ix, iy, 'ln dash')
    f.bracket_label(ox, 360, 304, '1 m', 12)
    f.bracket_label(360, ix, 304, '1 m', 12)
    return f.svg()


@figure
def c10_refraction():
    f = Fig(640, 320, 'A coin under water in a cup: light from the coin bends away from the normal as it leaves the water, and the eye traces the ray straight back to a place higher and nearer than the coin')
    # cup and water
    f.rect(203, 130, 234, 158, 'water', rx=0)
    f.path('M200,90 L205,290 L435,290 L440,90', 'glass')
    f.line(203, 130, 437, 130, 'ln e')
    f.text(320, 112, 'air', 't m', 'middle', 13)
    f.text(262, 176, 'water', 't e', 'start', 13)
    # coin
    cx, cy = 320, 284
    f.add(f'<ellipse cx="{cx}" cy="{cy}" rx="14" ry="4" class="block"/>')
    f.text(cx, 308, 'coin', 't', 'middle', 12)
    # ray: 32° in water, 45° in air
    px = cx + (cy - 4 - 130) * math.tan(math.radians(32))
    py = 130
    f.ray(cx, cy - 4, px, py, chevrons=1)
    ex, ey = 490, 56
    f.ray(px, py, 470, 73, chevrons=1)
    _eye(f, ex, ey, 0.9)
    f.text(ex, 30, 'eye', 't', 'middle', 12)
    # the normal and the two angles
    f.line(px, 70, px, 190, 'ln dash')
    f.text(px - 8, 70, 'normal', 't m', 'end', 12)
    f.path(f'M{r_(px)},100 A30,30 0 0 1 {r_(px + 30 * math.sin(math.radians(45)))},{r_(130 - 30 * math.cos(math.radians(45)))}', 'ln m')
    f.path(f'M{r_(px)},160 A30,30 0 0 1 {r_(px - 30 * math.sin(math.radians(32)))},{r_(130 + 30 * math.cos(math.radians(32)))}', 'ln m')
    f.text(px + 56, 112, '45° to the normal', 't', 'start', 12)
    f.text(px + 26, 202, '32° to the normal', 't', 'start', 12)
    # the eye's straight-line guess
    f.line(px, py, cx, py + (px - cx), 'ln dash')
    f.add(f'<ellipse cx="{cx}" cy="{r_(py + (px - cx))}" rx="14" ry="4" class="ln dash"/>')
    f.text(cx - 20, py + (px - cx) + 4, 'seems here', 't m', 'end', 12)
    return f.svg()


@figure
def c10_eye():
    f = Fig(640, 300, 'Cross-section of the eye forming an upside-down image of a tree on the retina: most bending at the cornea, fine-tuning at the lens')
    gx, gy, R = 400, 150, 105
    f.circle(gx, gy, R, 'block')
    # cornea bulge, iris, lens, retina
    f.path('M305,100 Q274,150 305,200', 'glass')
    f.line(318, 98, 318, 126, 'ln', extra='stroke-width="4"')
    f.line(318, 174, 318, 202, 'ln', extra='stroke-width="4"')
    f.add('<ellipse cx="332" cy="150" rx="12" ry="34" class="water"/>')
    a = math.radians(65)
    f.path(f'M{r_(gx + 100 * math.cos(-a))},{r_(gy + 100 * math.sin(-a))} A100,100 0 0 1 {r_(gx + 100 * math.cos(a))},{r_(gy + 100 * math.sin(a))}', 'ln e')
    # the object: a far-off tree, drawn as an arrow
    f.ground(40, 212, 120)
    f.arrow(100, 210, 100, 92, 'green', width=2.5)
    f.text(100, 236, 'a tree, far away', 't', 'middle', 12)
    # two rays from the top of the tree, two from the bottom
    it = (gx + 100 * math.cos(math.radians(25)), gy + 100 * math.sin(math.radians(25)))
    ib = (gx + 100 * math.cos(math.radians(-25)), gy + 100 * math.sin(math.radians(-25)))
    for (sy, img, lens_y) in ((94, it, (126, 176)), (208, ib, (124, 174))):
        for cy, ly in zip((118, 182), lens_y):
            f.ray(100, sy, 298, cy, chevrons=1)
            f.path(f'M298,{cy} L332,{ly} L{r_(img[0])},{r_(img[1])}', 'ray')
    f.arrow(486, ib[1], 486, it[1] - 2, 'green', width=2.5)
    # labels
    f.text(280, 84, 'cornea', 't', 'end', 12)
    f.line(284, 88, 292, 112, 'ln m')
    f.text(318, 70, 'pupil', 't m', 'middle', 12)
    f.line(318, 76, 318, 94, 'ln m')
    f.text(332, 236, 'lens', 't', 'middle', 12)
    f.text(528, 154, 'retina', 't e', 'start', 12)
    f.text(512, ib[1] - 4, 'image of the bottom', 't m', 'start', 12)
    f.text(512, it[1] + 14, 'image of the top', 't m', 'start', 12)
    f.text(276, 272, 'most of the bending happens at the cornea', 't m', 'end', 12)
    f.line(280, 262, 288, 176, 'ln m')
    return f.svg()


@figure
def c10_romer():
    f = Fig(640, 300, 'Rømer’s reasoning: light from Io must cross the extra width of Earth’s orbit when Earth is on the far side of the Sun, so the eclipses appear late')
    sx, sy = 150, 150
    f.circle(sx, sy, 80, 'ln dash')
    f.circle(sx, sy, 16, 'block')
    f.text(sx, 190, 'Sun', 't', 'middle', 12)
    # Earth on the near and far sides of its orbit
    f.circle(230, 150, 7, 'fill-ink')
    f.text(230, 128, 'Earth, near side', 't', 'middle', 12)
    f.text(230, 174, 'eclipse seen first', 't m', 'middle', 12)
    f.circle(70, 150, 7, 'fill-ink')
    f.text(70, 128, 'Earth, far side', 't', 'middle', 12)
    f.text(70, 174, '16.6 min later', 't m', 'middle', 12)
    # Jupiter, its shadow, and Io entering it
    f.path('M520,134 L640,128 L640,172 L520,166 Z', 'wash')
    f.circle(520, 150, 16, 'block')
    f.text(496, 190, 'Jupiter', 't', 'end', 12)
    f.text(636, 190, "Jupiter's shadow", 't m', 'end', 12)
    f.circle(560, 124, 5, 'fill-ink')
    f.text(560, 110, 'Io', 't', 'middle', 12)
    f.text(560, 96, 'about to be eclipsed', 't m', 'middle', 12)
    # light from Io to both Earth positions
    f.ray(554, 126, 237, 148, chevrons=2)
    f.ray(554, 128, 78, 150, chevrons=0)
    f.bracket_label(70, 230, 236, '300 million km extra: 16.6 light-minutes', 12, up=False)
    return f.svg()
