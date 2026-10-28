"""Figures for Chapter 6: Pressure, floating and the ocean of air.

All numbers drawn here are the ones computed for the chapter text (python3 -I; see provenance/ch06.yml `computed:`).
Pressure pushes from a fluid are drawn as thin blue arrows (kind 'electron'); net forces as the bold red force arrow.
Colour is never the only cue: every arrow group carries a label.
"""
import math
from figs_core import Fig, figure


def _press_arrows(f, pts, kind='electron'):
    for x1, y1, x2, y2 in pts:
        f.arrow(x1, y1, x2, y2, kind)


@figure
def c6_pressure():
    f = Fig(640, 300, 'A 1 kg packet lying flat and standing on its end, with equal weight arrows and the two contact '
                      'areas labelled, and a box under water pushed on every face')
    # ---- left: same force, two areas
    f.text(165, 28, 'Same force, two areas', 't b', 'middle', 14)
    f.ground(30, 200, 275)
    # flat packet (20 cm × 5 cm side view; 7 px per cm)
    f.mass_block(40, 165, 140, 35, '')
    f.text(68, 187, '1 kg', 't b', 'middle', 13)
    f.line(40, 200, 180, 200, 'ln p', 'stroke-width="4"')
    f.force(110, 182, 0, 45, '')
    f.text(118, 222, 'weight 9.8 N', 't p b', 'start', 12)
    f.text(110, 246, 'area 240 cm²', 't m', 'middle', 13)
    f.text(110, 264, 'pressure ≈ 400 Pa', 't', 'middle', 13)
    # standing packet (5 cm wide, 20 cm tall)
    f.mass_block(225, 60, 35, 140, '')
    f.text(242, 82, '1 kg', 't b', 'middle', 12)
    f.line(225, 200, 260, 200, 'ln p', 'stroke-width="4"')
    f.force(242, 130, 0, 45, '')
    f.text(250, 160, 'weight 9.8 N', 't p b', 'start', 12)
    f.text(242, 246, 'area 60 cm²', 't m', 'middle', 13)
    f.text(242, 264, 'pressure ≈ 1,600 Pa', 't', 'middle', 13)
    f.text(165, 290, 'red strip: where the packet touches the table', 't m', 'middle', 12)
    # ---- right: a fluid pushes on every face
    f.text(480, 28, 'A fluid pushes on every face', 't b', 'middle', 14)
    f.rect(340, 60, 280, 200, 'water', rx=0)
    f.text(348, 76, 'water', 't m', 'start', 12)
    f.mass_block(450, 120, 80, 60, '')
    _press_arrows(f, [(465, 94, 465, 117), (490, 94, 490, 117), (515, 94, 515, 117),       # top, down
                      (465, 208, 465, 183), (490, 208, 490, 183), (515, 208, 515, 183),   # bottom, up (a little longer)
                      (420, 135, 447, 135), (420, 150, 447, 150), (420, 165, 447, 165),   # left, inward
                      (560, 135, 533, 135), (560, 150, 533, 150), (560, 165, 533, 165)])  # right, inward
    f.text(480, 242, 'the water pushes on all six faces,', 't e', 'middle', 12)
    f.text(480, 256, 'at right angles to each one', 't e', 'middle', 12)
    return f.svg()


@figure
def c6_barometer():
    f = Fig(640, 340, 'Torricelli’s mercury barometer beside a water barometer and a three-storey building, all drawn '
                      'to the same scale: 76 cm of mercury against 10.3 m of water')
    s = 27.0                      # px per metre
    base = 318
    f.text(320, 24, 'Drawn to the same scale', 't b', 'middle', 14)
    f.ground(20, base, 600)
    # scale bar
    f.line(30, 300, 30 + s, 300, 'ln')
    f.line(30, 296, 30, 304, 'ln'); f.line(30 + s, 296, 30 + s, 304, 'ln')
    f.text(30 + s / 2, 292, '1 m', 't m', 'middle', 12)
    # three-storey building, floors 3 m apart
    bx, bw = 70, 120
    top = base - 9 * s
    f.rect(bx, top, bw, 9 * s, 'plate', rx=0)
    for k in range(1, 3):
        f.line(bx, base - 3 * k * s, bx + bw, base - 3 * k * s, 'ln m')
    for k in range(3):
        for wx in (bx + 22, bx + 52, bx + 82):
            f.rect(wx, base - 3 * (k + 1) * s + 20, 16, 24, 'fill-sheet', rx=1, extra='stroke="none"')
    f.text(bx + bw / 2, top - 10, 'three floors, 3 m each (9 m)', 't m', 'middle', 12)
    # water barometer: 10.3 m column
    wx = 265
    h_w = 10.3 * s
    f.rect(wx - 7, base - h_w, 14, h_w, 'water', rx=0)
    f.line(wx - 7, base - h_w - 6, wx - 7, base, 'ln'); f.line(wx + 7, base - h_w - 6, wx + 7, base, 'ln')
    f.line(wx - 7, base - h_w - 6, wx + 7, base - h_w - 6, 'ln')
    f.rect(wx - 40, base - 12, 80, 12, 'water', rx=0)
    f.line(wx - 40, base - 12, wx - 40, base, 'ln'); f.line(wx + 40, base - 12, wx + 40, base, 'ln')
    f.text(wx + 14, base - h_w + 10, 'water: 10.3 m', 't e', 'start', 13)
    f.arrow(wx - 32, base - 44, wx - 32, base - 16, 'muted'); f.arrow(wx + 32, base - 44, wx + 32, base - 16, 'muted')
    f.text(wx + 14, base - 60, 'air pressing on the dish', 't m', 'start', 12)
    # mercury barometer: 76 cm column, near-empty space above it
    mx = 470
    h_m = 0.76 * s
    tube_top = base - h_m - 34
    f.rect(mx - 7, base - h_m, 14, h_m, 'fill-ink', rx=0)
    f.line(mx - 7, tube_top, mx - 7, base, 'ln'); f.line(mx + 7, tube_top, mx + 7, base, 'ln')
    f.line(mx - 7, tube_top, mx + 7, tube_top, 'ln')
    f.rect(mx - 40, base - 12, 80, 12, 'fill-ink', rx=0)
    f.line(mx - 40, base - 12, mx - 40, base, 'ln'); f.line(mx + 40, base - 12, mx + 40, base, 'ln')
    f.line(mx + 9, base - h_m / 2, mx + 60, base - 70, 'ln m')
    f.text(mx + 64, base - 72, 'mercury: 76 cm', 't', 'start', 13)
    f.line(mx + 9, tube_top + 12, mx + 60, base - 100, 'ln m')
    f.text(mx + 64, base - 102, 'near-empty space', 't m', 'start', 12)
    f.arrow(mx - 32, base - 44, mx - 32, base - 16, 'muted'); f.arrow(mx + 32, base - 44, mx + 32, base - 16, 'muted')
    f.text(mx, base - 172, 'Torricelli, 1643', 't m', 'middle', 12)
    f.text(mx, base - 152, 'mercury is 13.6 times as dense,', 't m', 'middle', 12)
    f.text(mx, base - 138, 'so the column is 13.6 times shorter', 't m', 'middle', 12)
    return f.svg()


@figure
def c6_card():
    f = Fig(640, 430, 'An inverted water glass and a separate free-body diagram of the card show atmospheric pressure up, internal water pressure down and the card weight down. Internal pressure almost balances outside pressure; the weight of the water is already reflected in the hydrostatic pressure at the card, so is not added again as a separate force on the card. A straw comparison shows a lower mouth pressure and a raised column. Arrows are explanatory, not pressure-scale drawings.')
    f.text(24,28,'Pressure acts on both sides','t b',size=17)
    f.text(157,61,'inverted glass','t b','middle',14)
    f.rect(90,91,88,115,'water',rx=0)
    f.rect(90,82,88,9,'fill-sheet',rx=0)
    f.path('M90,206 V82 H178 V206','glass')
    f.rect(79,206,110,5,'block',rx=1)
    f.text(193,104,'trapped air','t m',size=12);f.line(185,99,165,88,'ln m')
    f.text(193,125,'slightly below','t m',size=12)
    f.text(193,143,'outside pressure','t m',size=12)
    f.line(69,91,69,206,'ln m');f.line(65,91,73,91,'ln m');f.line(65,206,73,206,'ln m')
    f.text(57,154,'h','t s i','end',14)
    # Isolate the card so forces are not confused with forces on all the water.
    f.text(157,256,'forces on the card only','t b','middle',13)
    f.rect(103,319,104,5,'block',rx=0)
    f.force(128,386,0,-59);f.force(128,263,0,54)
    f.force(188,327,0,22)
    f.text(24,407,'air pressure up','t p b',size=12)
    f.text(148,288,'water pressure down','t p',size=12)
    f.text(200,352,'card weight','t p',size=12)
    f.text(353,61,'straw','t b',size=14)
    f.path('M416,183 V283 H541 V183','glass')
    f.rect(417,212,123,70,'water',rx=0)
    f.rect(469,141,13,138,'water',rx=0)
    f.path('M469,278 V101 H496 M482,278 V112 H496','ln')
    # Mouth profile, directly attached to the straw.
    f.path('M546,79 Q521,80 516,93 L499,100 L504,106 L498,113 L515,118 Q519,139 546,141','ln')
    f.text(430,92,'mouth pressure','t m','middle',12)
    f.text(430,109,'lower than outside','t m','middle',12)
    f.arrow(448,176,448,205,'electron');f.arrow(527,176,527,205,'electron')
    f.arrow(493,246,493,154,'ink')
    f.text(483,307,'outside air presses on the surface','t e','middle',12)
    f.text(483,333,'p(outside) − p(mouth) ≈ ρgh','t b','middle',13)
    f.text(483,360,'A larger pressure difference','t','middle',12)
    f.text(483,379,'can support a taller column.','t','middle',12)
    f.text(320,426,'Card arrows are not to scale. Water pressure includes the column’s weight; do not count it twice.','t m','middle',11.5)
    return f.svg()


@figure
def c6_tank():
    f = Fig(640, 350, 'A tank of water 1.5 m deep, raised 0.5 m above the ground. Pressure and exit speed increase '
                      'with hole depth. Computed parabolic jets from depths 0.5, 1.0 and 1.5 m land 1.73, 2.00 '
                      'and 1.73 m from the wall: the middle jet travels farthest, though the deepest leaves fastest.')
    L, R, top, bot, floor, scale = 150, 360, 70, 220, 270, 100
    f.text(320, 26, 'Deeper means more pressure', 't b', 'middle', 14)
    f.ground(60, floor, 560)
    f.rect(L, top, R - L, bot - top, 'water', rx=0)
    f.path(f'M{L},{top - 14} L{L},{bot} L{R},{bot} L{R},{top - 14}', 'glass')
    f.text((L + R) / 2, 60, 'air above: 101 kPa', 't m', 'middle', 12)
    for x in (L + 12, R - 12):
        f.line(x, bot + 2, x, floor, 'ln')
    f.text(136, 247, 'raised 0.5 m', 't m', 'end', 12)
    f.line(140, 243, L + 12, 243, 'ln m')
    # pressure arrows pushing on the left wall, length proportional to depth
    for depth, label in ((0.5, '0.5 m · 4.9 kPa'), (1.0, '1.0 m · 9.8 kPa'), (1.5, '1.5 m · 14.7 kPa')):
        y = top + depth * scale
        f.arrow(L + 3 + 50 * depth, y, L + 3, y, 'electron')
        f.line(L - 6, y, L, y, 'ln m')
        f.text(L - 10, y + 4, label, 't', 'end', 12)
    f.text(255, 98, 'water’s push', 't e', 'middle', 12)
    f.text(255, 113, 'on the wall', 't e', 'middle', 12)
    # Torricelli exit speed and gravity-driven flight, at the same x/y scale.
    # Surface is H = 2 m above the ground; range = 2 sqrt(depth * (H - depth)).
    H, g = (floor - top) / scale, 9.8
    f.text(494, 60, 'speed at each hole', 't b', 'middle', 13)
    for depth in (0.5, 1.0, 1.5):
        y = top + depth * scale
        speed = math.sqrt(2 * g * depth)
        flight = math.sqrt(2 * (H - depth) / g)
        pts = [(R + speed * (flight * k / 40) * scale,
                y + 0.5 * g * (flight * k / 40) ** 2 * scale) for k in range(41)]
        f.path('M' + ' L'.join(f'{px:.2f},{py:.2f}' for px, py in pts), 'ln e water-jet',
               extra=f'data-depth="{depth}"')
        f.circle(R, y, 3, 'fill-ink')
        f.vector(R + 7, y, speed * 10, 0)
        f.text(R + 68, y - 8, f'{speed:.1f} m/s', 't e b', 'start', 13)
    f.text(565, 288, 'ground', 't m', 'start', 12)
    f.text(320, 310, 'The deepest jet leaves fastest; the middle one has more time to fly.', 't b', 'middle', 13)
    f.text(320, 332, 'Pressure labels are the water’s extra push, above the air’s 101 kPa.', 't m', 'middle', 12)
    return f.svg()


@figure
def c6_buoyancy():
    f = Fig(640, 320, 'Left: a block under water with pressure arrows on every face, larger on the bottom, and the net '
                      'buoyant force upward. Right: the same steel as a solid lump that sinks and as a hollow hull that floats')
    # ---- left: why the water pushes up
    f.text(160, 26, 'Why the water pushes up', 't b', 'middle', 14)
    f.rect(20, 60, 280, 196, 'water', rx=0)
    f.text(28, 76, 'water', 't m', 'start', 12)
    f.mass_block(120, 130, 80, 70, '')
    _press_arrows(f, [(138, 106, 138, 128), (182, 106, 182, 128),                            # top: shorter
                      (138, 246, 138, 202), (160, 246, 160, 202), (182, 246, 182, 202),      # bottom: longer
                      (92, 145, 118, 145), (88, 165, 118, 165), (84, 185, 118, 185),         # left
                      (228, 145, 202, 145), (232, 165, 202, 165), (236, 185, 202, 185)])     # right
    f.force(160, 165, 0, -85, 'buoyant force')
    f.text(160, 274, 'the push on the deeper face is bigger;', 't e', 'middle', 12)
    f.text(160, 288, 'sideways pushes cancel; what is left points up', 't e', 'middle', 12)
    f.text(160, 306, 'buoyant force = weight of the water displaced', 't b', 'middle', 12)
    # ---- right: the same steel, two shapes
    f.text(480, 26, 'The same 10,000 tonnes of steel', 't b', 'middle', 14)
    f.rect(330, 150, 300, 105, 'water', rx=0)
    f.text(338, 166, 'water', 't m', 'start', 12)
    f.line(330, 150, 630, 150, 'ln e')
    # the lump on the bottom
    f.mass_block(372, 215, 36, 36, '')
    f.text(390, 207, 'solid lump', 't', 'middle', 12)
    f.text(390, 272, 'fills 1,280 m³', 't m', 'middle', 12)
    f.text(390, 288, 'pushed up: 1.3 × 10⁷ N', 't m', 'middle', 12)
    f.text(390, 304, 'weighs 9.8 × 10⁷ N: sinks', 't', 'middle', 12)
    # the hull, floating with most of itself above the waterline
    f.path('M470,110 L620,110 L600,180 L490,180 Z', 'glass')
    f.text(545, 130, 'hull: 100,000 m³', 't', 'middle', 12)
    f.text(545, 144, 'mostly air', 't', 'middle', 12)
    f.text(548, 272, 'displaces 10,000 t of water', 't m', 'middle', 12)
    f.text(552, 288, 'pushed up: 9.8 × 10⁷ N', 't m', 'middle', 12)
    f.text(552, 304, 'weighs 9.8 × 10⁷ N: floats', 't', 'middle', 12)
    f.text(630, 100, 'not to scale', 't m', 'end', 12)
    return f.svg()
