"""Figures for Chapter 6: Pressure, floating and the ocean of air.

All numbers drawn here are the ones computed for the chapter text (python3 -I; see provenance/ch06.yml `computed:`).
Pressure pushes from a fluid are drawn as thin blue arrows (kind 'electron'); net forces as the bold red force arrow.
Colour is never the only cue: every arrow group carries a label.
"""
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
    f.mass_block(40, 165, 140, 35, '1 kg')
    f.line(40, 200, 180, 200, 'ln p', 'stroke-width="4"')
    f.force(110, 182, 0, 45, '')
    f.text(118, 222, 'weight 9.8 N', 't p b', 'start', 12)
    f.text(110, 246, 'area 240 cm²', 't m', 'middle', 13)
    f.text(110, 264, 'pressure ≈ 400 Pa', 't', 'middle', 13)
    # standing packet (5 cm wide, 20 cm tall)
    f.mass_block(225, 60, 35, 140, '1 kg', size=12)
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
    f.text(mx, base - 130, 'Torricelli, 1643', 't m', 'middle', 12)
    f.text(mx, base - 150, 'mercury is 13.6 times as dense,', 't m', 'middle', 12)
    f.text(mx, base - 164, 'so the column is 13.6 times shorter', 't m', 'middle', 12)
    return f.svg()


@figure
def c6_card():
    f = Fig(640, 300, 'An upside-down glass of water held shut by a card, with the air pushing up on the card; and a '
                      'straw in a glass, with the air pressing on the drink’s surface and the drink rising in the straw')
    # ---- left: the card
    f.text(150, 24, 'The card stays', 't b', 'middle', 14)
    gx, gw, top, rim = 105, 80, 70, 200
    f.rect(gx, top, gw, rim - top, 'water', rx=0)
    f.path(f'M{gx},{rim} L{gx},{top} L{gx + gw},{top} L{gx + gw},{rim}', 'glass')
    f.rect(gx - 12, rim, gw + 24, 6, 'fill-ink', rx=1)
    f.text(gx + gw + 18, rim + 6, 'card', 't', 'start', 12)
    # 10 cm dimension
    f.line(gx - 26, top, gx - 26, rim, 'ln m'); f.line(gx - 30, top, gx - 22, top, 'ln m'); f.line(gx - 30, rim, gx - 22, rim, 'ln m')
    f.text(gx - 34, (top + rim) / 2 + 4, '10 cm', 't m', 'end', 12)
    f.text(150, 46, 'the 10 cm of water adds only ≈ 1 kPa (1%)', 't m', 'middle', 12)
    f.text(150, 60, 'to the push the card feels from inside', 't m', 'middle', 12)
    _press_arrows(f, [(125, 252, 125, 212), (145, 252, 145, 212), (165, 252, 165, 212)])
    f.text(150, 272, 'air pushes up on the card:', 't e', 'middle', 12)
    f.text(150, 286, 'about 1.01 × 10⁵ Pa', 't e', 'middle', 12)
    # ---- right: the straw
    f.text(460, 24, 'The straw', 't b', 'middle', 14)
    f.rect(400, 170, 110, 90, 'water', rx=0)
    f.path('M400,150 L400,260 L510,260 L510,150', 'glass')
    # straw with the drink standing higher inside it
    f.rect(455, 118, 12, 138, 'water', rx=0)
    f.line(455, 60, 455, 256, 'ln'); f.line(467, 60, 467, 256, 'ln')
    f.text(461, 48, 'lower pressure in the mouth', 't m', 'middle', 12)
    _press_arrows(f, [(418, 140, 418, 166), (436, 140, 436, 166), (488, 140, 488, 166)])
    f.arrow(482, 200, 482, 128, 'ink')
    f.text(490, 168, 'the drink', 't', 'start', 12); f.text(490, 182, 'is pushed up', 't', 'start', 12)
    f.text(455, 282, 'air presses on the drink’s surface at full atmospheric pressure', 't e', 'middle', 12)
    return f.svg()


@figure
def c6_tank():
    f = Fig(640, 320, 'A tank of water 1.5 m deep with pressure arrows on its left wall growing with depth and three '
                      'holes in its right wall whose jets get faster with depth')
    L, R, top, bot = 80, 340, 70, 280
    f.text(210, 26, 'Deeper means more pressure', 't b', 'middle', 14)
    f.ground(60, bot, 560)
    f.rect(L, top, R - L, bot - top, 'water', rx=0)
    f.path(f'M{L},{top - 14} L{L},{bot} L{R},{bot} L{R},{top - 14}', 'glass')
    f.text(210, 60, 'air above: 101 kPa', 't m', 'middle', 12)
    # pressure arrows pushing on the left wall, length proportional to depth
    for depth, label in ((0.5, '0.5 m · 4.9 kPa'), (1.0, '1.0 m · 9.8 kPa'), (1.5, '1.5 m · 14.7 kPa')):
        y = top + depth * 140 - (10 if depth == 1.5 else 0)
        f.arrow(L + 3 + 50 * depth, y, L + 3, y, 'electron')
        f.line(L - 6, y, L, y, 'ln m')
        f.text(L - 10, y + 4, label, 't', 'end', 12)
    f.text(L + 60, top + 140 * 0.5 - 12, 'the water’s push on the wall', 't e', 'start', 12)
    # holes and jets (schematic shapes; relative speeds go with the square root of depth)
    for depth, k in ((0.5, 0.71), (1.0, 1.0), (1.5, 1.22)):
        y = top + depth * 140 - (15 if depth == 1.5 else 0)
        f.circle(R, y, 3, 'fill-ink')
        f.path(f'M{R + 3},{y} Q{R + 3 + 70 * k},{y} {R + 3 + 110 * k},{bot}', 'ln e')
    f.text(500, 110, 'the deepest jet', 't', 'middle', 13)
    f.text(500, 126, 'spurts fastest', 't', 'middle', 13)
    f.text(500, 150, 'pressure pushes sideways', 't m', 'middle', 12)
    f.text(500, 164, 'as hard as it pushes down', 't m', 'middle', 12)
    f.text(320, 306, 'fresh water, 1,000 kg/m³: pressure from the water = depth × 1,000 × 9.8', 't m', 'middle', 12)
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
    f.mass_block(380, 215, 36, 36, '')
    f.text(398, 207, 'solid lump', 't', 'middle', 12)
    f.text(398, 272, 'fills 1,280 m³', 't m', 'middle', 12)
    f.text(398, 288, 'pushed up with 1.3 × 10⁷ N', 't m', 'middle', 12)
    f.text(398, 304, 'weighs 9.8 × 10⁷ N: sinks', 't', 'middle', 12)
    # the hull, floating with most of itself above the waterline
    f.path('M470,110 L620,110 L600,180 L490,180 Z', 'glass')
    f.text(545, 138, 'hull: 100,000 m³, mostly air', 't', 'middle', 12)
    f.text(545, 272, 'pushes aside 10,000 t of water', 't m', 'middle', 12)
    f.text(545, 288, 'pushed up with 9.8 × 10⁷ N', 't m', 'middle', 12)
    f.text(545, 304, 'weighs 9.8 × 10⁷ N: floats', 't', 'middle', 12)
    f.text(630, 100, 'not to scale', 't m', 'end', 11)
    return f.svg()
