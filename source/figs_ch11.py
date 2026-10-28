"""Figures for Chapter 11 (Colour, and what light really is). Names start with c11_. Theme classes only; colour is never the only cue."""
from __future__ import annotations
import math
from figs_core import Fig, figure, r_


@figure
def c11_prism():
    f = Fig(640, 300, 'Newton’s decisive experiment: a prism fans white light into a spectrum, a board with a hole passes only the red, and a second prism bends the red without adding any colour')
    f.ray(30, 150, 226, 150, chevrons=2)
    f.text(120, 140, 'white light', 't', 'middle', 12)
    f.path('M260,60 L200,230 L320,230 Z', 'glass')
    f.text(260, 250, 'first prism', 't m', 'middle', 12)
    f.line(228, 150, 299, 170, 'ray')
    # the fan: red bent least, violet most; all but red stop at the board
    ends = [('red', 150), ('yellow', 166), ('green', 182), ('blue', 198), ('violet', 214)]
    for name, y in ends:
        f.line(299, 170, 396, y, 'ray')
        if name != 'red':
            f.text(408, y + 4, name, 't m', 'start', 12)
    f.rect(396, 96, 8, 46, 'block', rx=1)
    f.rect(396, 158, 8, 100, 'block', rx=1)
    f.text(400, 276, 'board with a hole', 't m', 'middle', 12)
    # the red passes through the hole and a second prism, and stays red
    f.line(396, 150, 452, 138.4, 'ray')
    f.text(420, 132, 'red', 't', 'start', 12)
    f.path('M470,110 L440,190 L500,190 Z', 'glass')
    f.text(470, 100, 'second prism', 't m', 'middle', 12)
    f.line(452, 138.4, 488, 150, 'ray')
    f.ray(488, 150, 556, 166, chevrons=1)
    f.rect(556, 120, 8, 80, 'plate', rx=0)
    f.text(560, 110, 'wall', 't m', 'middle', 12)
    f.text(570, 170, 'still red', 't b', 'start', 12)
    return f.svg()


def _banana(f, cx, cy):
    f.path(f'M{cx - 42},{cy + 12} Q{cx},{cy - 44} {cx + 42},{cy + 12} Q{cx},{cy - 8} {cx - 42},{cy + 12} Z', 'block')


@figure
def c11_banana():
    f = Fig(640, 300, 'The same banana under white, red and blue light: it sends back red and green and absorbs blue, so it looks yellow, red, or black depending on the light that arrives')
    panels = [
        (110, 'Under white light', 'in: R + G + B', 'back: R + G', 'absorbs B', 'looks yellow'),
        (320, 'Under red light', 'in: R', 'back: R', 'absorbs little', 'looks red'),
        (530, 'Under blue light', 'in: B', 'back: nothing', 'absorbs B', 'looks black'),
    ]
    cy = 172
    for cx, title, inn, back, absorbed, looks in panels:
        f.text(cx, 26, title, 't b', 'middle', 13)
        _banana(f, cx, cy)
        f.ray(cx - 86, cy - 78, cx - 34, cy - 24, chevrons=1)
        f.text(cx - 98, cy - 92, inn, 't', 'start', 12)
        if back != 'back: nothing':
            f.ray(cx + 34, cy - 24, cx + 86, cy - 78, chevrons=1)
        else:
            f.line(cx + 34, cy - 24, cx + 86, cy - 78, 'ln dash')
        f.text(cx + 30, cy - 104, back, 't', 'start', 12)
        f.text(cx, cy + 46, absorbed, 't m', 'middle', 12)
        f.text(cx, cy + 66, looks, 't b', 'middle', 13)
    f.line(215, 40, 215, 280, 'ln r')
    f.line(425, 40, 425, 280, 'ln r')
    return f.svg()


def _person(f, x, ground_y):
    f.circle(x, ground_y - 34, 7, 'ln')
    f.line(x, ground_y - 27, x, ground_y, 'ln')


def _sun(f, x, y, r=12):
    f.circle(x, y, r, 'block')
    for k in range(8):
        a = math.radians(k * 45)
        f.line(x + math.cos(a) * (r + 4), y + math.sin(a) * (r + 4), x + math.cos(a) * (r + 11), y + math.sin(a) * (r + 11), 'ln m')


@figure
def c11_sky():
    f = Fig(640, 320, 'Noon and sunset: at noon sunlight crosses a short stretch of air and the scattered blue reaches you from all over the sky; at sunset the beam crosses far more air, loses most of its blue, and arrives orange')
    # noon
    f.text(30, 24, 'Noon', 't b', 'start', 13)
    f.rect(20, 70, 290, 130, 'wash-e', rx=0)
    f.text(30, 88, 'air', 't e', 'start', 12)
    f.ground(20, 230, 290)
    _person(f, 165, 230)
    f.text(165, 250, 'you', 't', 'middle', 12)
    _sun(f, 165, 36)
    f.text(190, 40, 'Sun overhead', 't', 'start', 12)
    f.ray(165, 52, 165, 188, chevrons=2)
    for (x, y) in ((60, 120), (100, 160), (235, 110), (275, 165)):
        f.ray(x, y, 165 + (x - 165) * 0.08, 196 - (196 - y) * 0.1, chevrons=1)
    f.text(165, 274, 'blue, scattered to you', 't', 'middle', 12)
    f.text(165, 290, 'from all over the sky', 't', 'middle', 12)
    f.line(320, 20, 320, 300, 'ln r')
    # sunset
    f.text(340, 24, 'Sunset', 't b', 'start', 13)
    f.rect(330, 70, 290, 130, 'wash-e', rx=0)
    f.text(340, 88, 'air', 't e', 'start', 12)
    f.ground(330, 230, 290)
    _person(f, 390, 230)
    f.text(390, 250, 'you', 't', 'middle', 12)
    _sun(f, 600, 186)
    f.text(596, 160, 'setting Sun', 't', 'middle', 12)
    f.ray(586, 189, 398, 195, chevrons=3)
    for x in (540, 480):
        f.arrow(x, 190, x - 12, 150, 'muted')
    f.text(500, 138, 'blue leaves the beam sideways', 't m', 'middle', 12)
    f.text(492, 220, 'a much longer path through air', 't m', 'middle', 12)
    f.text(475, 274, 'most blue scattered away;', 't', 'middle', 12)
    f.text(475, 290, 'the orange gets through', 't', 'middle', 12)
    return f.svg()


@figure
def c11_brewster():
    f = Fig(640, 320, 'Sunlight meeting the sea at Brewster’s angle, 53° from the normal: the reflected glare is completely polarised and reaches an eye on the sea wall looking 37° below the horizon; the refracted ray is at right angles to it')
    f.rect(40, 200, 580, 100, 'water', rx=0)
    f.line(40, 200, 620, 200, 'ln e')
    f.text(60, 290, 'sea', 't e', 'start', 13)
    f.rect(40, 150, 70, 50, 'block', rx=2)
    f.text(75, 196, 'sea wall', 't m', 'middle', 12)
    ex, ey = 75, 96
    f.circle(ex, ey, 7, 'ln')
    f.line(ex, ey + 7, ex, 150, 'ln')
    f.text(ex, 76, 'you', 't', 'middle', 12)
    # polarised lens in front of the eye
    f.rect(84, 90, 18, 12, 'block', rx=2)
    for x in (88, 93, 98):
        f.line(x, 92, x, 100, 'ln e')
    f.text(112, 60, 'polarised lens:', 't e', 'start', 12)
    f.text(112, 74, 'passes up-and-down shaking only', 't e', 'start', 12)
    # geometry: Brewster's angle for water, 53.1° from the normal = 36.9° below the horizon
    b = math.radians(53.1)
    px = ex + (200 - ey) / math.tan(math.radians(90) - b)
    py = 200
    f.line(ex, ey, 260, ey, 'ln dash')
    f.text(266, ey - 4, 'horizon', 't m', 'start', 12)
    f.path(f'M{r_(ex + 50)},{ey} A50,50 0 0 1 {r_(ex + 50 * math.cos(math.radians(36.9)))},{r_(ey + 50 * math.sin(math.radians(36.9)))}', 'ln m')
    f.text(130, 122, '37° down', 't', 'start', 12)
    # incoming sunlight, reflected glare, refracted ray
    ux, uy = -math.sin(b), math.cos(b)
    f.ray(px - ux * 170, py - uy * 170, px, py, chevrons=2)
    f.text(px - ux * 170 + 6, py - uy * 170 - 6, 'sunlight', 't', 'start', 12)
    rx, ry = -math.sin(b), -math.cos(b)
    f.ray(px, py, ex + 8, ey + 6, chevrons=1)
    for t in (.3, .45, .6, .75):
        f.circle(px + (ex + 8 - px) * t, py + (ey + 6 - py) * t, 2.6, 'fill-ink')
    f.text(232, 108, 'glare, polarised', 't', 'start', 12)
    f.text(232, 122, 'side to side', 't', 'start', 12)
    tx, ty = -math.sin(math.radians(36.9)), math.cos(math.radians(36.9))
    f.ray(px, py, px + tx * 95, py + ty * 95, chevrons=1)
    # the normal, the angles, the right angle
    f.line(px, 120, px, 270, 'ln dash')
    f.text(px + 6, 284, 'normal', 't m', 'start', 12)
    f.path(f'M{r_(px)},164 A36,36 0 0 1 {r_(px - ux * 36)},{r_(py - uy * 36)}', 'ln m')
    f.text(px + 22, 160, '53°', 't', 'start', 12)
    f.path(f'M{r_(px)},164 A36,36 0 0 0 {r_(px + rx * 36)},{r_(py + ry * 36)}', 'ln m')
    f.text(px - 22, 160, '53°', 't', 'end', 12)
    f.path(f'M{r_(px)},236 A36,36 0 0 1 {r_(px + tx * 36)},{r_(py + ty * 36)}', 'ln m')
    f.text(px - 28, 250, '37°', 't', 'end', 12)
    k = 14
    f.path(f'M{r_(px + rx * k)},{r_(py + ry * k)} L{r_(px + (rx + tx) * k)},{r_(py + (ry + ty) * k)} L{r_(px + tx * k)},{r_(py + ty * k)}', 'ln m')
    f.text(px - 28, 206, '90°', 't m', 'end', 12)
    return f.svg()


@figure
def c11_young():
    f = Fig(640, 320, 'Two sources of light in step send out crests; where crests meet crests the screen is bright, where a crest meets a trough it is dark, giving stripes')
    s1, s2, lam = (120, 130), (120, 190), 16
    for (x, y), cls in ((s1, 'ln m'), (s2, 'ln e')):
        for r in range(lam, 130, lam):
            f.path(f'M{x},{y - r} A{r},{r} 0 0 1 {x},{y + r}', cls)
        f.circle(x, y, 4, 'fill-ink')
    f.text(104, 134, 'S₁', 't b', 'end', 13)
    f.text(104, 194, 'S₂', 't b', 'end', 13)
    f.text(8, 160, 'two sources', 't m', 'start', 12)
    f.text(8, 174, 'in step', 't m', 'start', 12)
    # screen with bright and dark bands (fringe spacing 117 in these units)
    f.rect(556, 14, 12, 292, 'plate', rx=0)
    for y0 in (72, 189):
        f.rect(556, y0, 12, 58, 'fill-ink', rx=0)
    for y, lab in ((47, 'bright'), (105, 'dark'), (164, 'bright'), (222, 'dark'), (281, 'bright')):
        f.text(576, y, lab, 't', 'start', 12)
    mx, my = 120, 160
    for y in (43, 160, 277):
        f.line(mx, my, 556, y, 'ln g')
    for y in (101.5, 218.5):
        f.line(mx, my, 556, y, 'ln dash')
    f.text(380, 150, 'crests meet crests: bright', 't g', 'middle', 12)
    f.text(300, 80, 'crest meets trough: dark', 't m', 'middle', 12)
    return f.svg()


@figure
def c11_raman():
    f = Fig(640, 280, 'The Raman effect as a spectrum: light of one colour enters a liquid; of the light scattered sideways almost all keeps its colour, and a small fraction comes out shifted')
    # a flask of liquid, lit from the left
    f.path('M100,150 L80,230 L180,230 L160,150 Z', 'water')
    f.path('M100,90 L100,150 L80,230 L180,230 L160,150 L160,90', 'glass')
    f.text(130, 250, 'liquid', 't', 'middle', 12)
    f.ray(10, 190, 88, 190, chevrons=1)
    f.line(88, 190, 172, 190, 'ray')
    f.text(8, 176, 'one colour in', 't', 'start', 12)
    f.ray(130, 188, 130, 100, chevrons=1)
    f.text(134, 70, 'scattered sideways', 't', 'start', 12)
    f.arrow(160, 100, 270, 100, 'muted')
    f.text(215, 92, 'spread into a spectrum', 't m', 'middle', 12)
    # the spectrum
    f.axis(280, 230, 320, 170, 'wavelength (colour)', 'how much light')
    f.line(440, 230, 440, 80, 'ln', extra='stroke-width="3"')
    f.text(452, 84, 'the same colour', 't', 'start', 12)
    f.text(452, 98, 'as went in', 't', 'start', 12)
    for x in (400, 480):
        f.line(x, 230, x, 210, 'ln p', extra='stroke-width="3"')
    f.text(400, 204, 'shifted', 't p', 'middle', 12)
    f.text(490, 190, 'a tiny fraction,', 't p', 'start', 12)
    f.text(490, 204, 'shifted', 't p', 'start', 12)
    return f.svg()
