"""Figures for Chapter 4, Falling. Every number drawn here was computed with the kinematics in the chapter
(y = ½gt², v = gt, g = 9.8 m/s² on Earth and 1.67 m/s² on the Moon) or with the drag model of 8.01SC notes §8.6."""
from __future__ import annotations
import math
from figs_core import Fig, figure


@figure
def c4_two_predictions():
    """Delft, 1586: Aristotle's prediction beside what Stevin and de Groot heard."""
    f = Fig(640, 332, "Two lead balls, one ten times heavier, dropped about 9 m onto a board: Aristotle's prediction "
                      "has the light ball a tenth of the way down when the heavy one lands; Stevin heard a single thud")
    for k, (x0, title) in enumerate(((16, "What Aristotle predicted"), (330, "What Stevin and de Groot heard"))):
        f.text(x0 + 150, 22, title, 't b', 'middle', 14)
        f.rect(x0, 40, 22, 232, 'plate', rx=0)               # the tower wall
        f.text(x0 + 11, 160, 'tower', 't m', 'middle', 12, extra=f'transform="rotate(-90 {x0 + 11} 160)"')
        f.ground(x0 + 22, 272, 272)
        f.text(x0 + 294, 292, 'wooden board', 't m', 'end', 12)
        xh, xl = x0 + 80, x0 + 160
        f.line(xh, 52, xh, 262, 'ln dash')
        f.line(xl, 52, xl, 262, 'ln dash')
        f.text(x0 + 120, 48, 'let go together', 't m', 'middle', 12)
        if k == 0:
            f.circle(xh, 256, 15, 'fill-ink')
            f.text(xh, 236, 'heavy ball lands', 't', 'middle', 12)
            f.circle(xl, 74, 6, 'fill-ink')
            f.lines(xl + 14, 72, ['light ball: only a', 'tenth of the way down'], 't', 'start', 12)
            f.text(x0 + 150, 320, 'the light ball should take ten times longer', 't m', 'middle', 12)
        else:
            f.circle(xh, 256, 15, 'fill-ink')
            f.circle(xl, 265, 6, 'fill-ink')
            f.text(x0 + 120, 236, 'both land together: one thud', 't', 'middle', 12)
            f.line(x0 + 290, 52, x0 + 290, 272, 'ln m')
            f.line(x0 + 284, 52, x0 + 296, 52, 'ln m')
            f.line(x0 + 284, 272, x0 + 296, 272, 'ln m')
            f.text(x0 + 282, 165, 'about 9 m', 't m', 'start', 12,
                   extra=f'transform="rotate(-90 {x0 + 282} 165)"')
    return f.svg()


@figure
def c4_drag_balance():
    """A falling raindrop at three moments, and its speed against time with drag that grows as speed squared."""
    f = Fig(640, 320, 'A raindrop just after release, while speeding up, and at its steady speed: the weight arrow stays '
                      'the same, the drag arrow grows until it matches; beside it the speed-time curve flattens at 6.5 m/s')
    f.text(160, 22, 'a 2 mm raindrop at three moments', 't b', 'middle', 14)
    for x, drag, cap in ((60, 0, 'just let go'), (160, 32, 'speeding up'), (260, 64, 'steady speed')):
        bun = f'M{x-13},153 C{x-13},138 {x+13},138 {x+13},153 Q{x},157 {x-13},153 Z'
        f.path(bun, 'water')
        f.path(bun, 'ln')
        f.force(x, 162, 0, 64, 'weight', 12)
        if drag:
            f.force(x, 138, 0, -drag, 'drag', 12)
        else:
            f.text(x, 124, 'drag 0', 't p b', 'middle', 12)
        f.text(x, 268, cap, 't m', 'middle', 12)
    f.text(160, 296, 'drag grows with speed until it equals the weight', 't m', 'middle', 12)
    # speed-time graph: v = vt·tanh(g t / vt), vt = 6.5 m/s, g = 9.8 m/s²
    x0, y0, w, h = 372, 262, 236, 200
    vt, g = 6.5, 9.8
    sx, sy = 72.0, h / 8.0          # 72 px per second, 25 px per m/s
    f.axis(x0, y0, w, h, 'time (s)', 'speed (m/s)',
           ticks={'x': [(sx, '1'), (2 * sx, '2'), (3 * sx, '3')], 'y': [(2 * sy, '2'), (4 * sy, '4'), (6 * sy, '6')]}, size=12)
    pts = []
    t = 0.0
    while t <= 3.05:
        v = vt * math.tanh(g * t / vt)
        pts.append((x0 + t * sx, y0 - v * sy))
        t += 0.05
    f.path('M' + ' L'.join(f'{px:.1f},{py:.1f}' for px, py in pts), 'ln e')
    f.line(x0, y0 - vt * sy, x0 + w - 10, y0 - vt * sy, 'ln dash')
    f.text(x0 + w - 10, y0 - vt * sy - 8, 'terminal speed 6.5 m/s', 't m', 'end', 12)
    f.text(x0 + 30, y0 - 20, 'steepest here', 't m', 'start', 12)
    return f.svg()


@figure
def c4_moon_strobe():
    """Hammer and feather from 1.6 m, flashed every 0.2 s: Earth beside the Moon. Heights are ½gt²."""
    f = Fig(640, 340, 'Strobe pictures of a drop from 1.6 m, one flash every 0.2 s: on Earth the hammer lands in 0.57 s '
                      'after three flashes; on the Moon the hammer and the feather fall side by side and land after 1.38 s')
    scale = 150.0                      # px per metre
    top, floor = 60, 60 + 1.6 * scale  # floor at y = 300
    f.text(160, 24, 'Earth: g = 9.8 m/s²', 't b', 'middle', 14)
    f.text(460, 24, 'the Moon: g = 1.67 m/s²', 't b', 'middle', 14)
    f.ground(30, floor, 580)
    f.line(30, top, 610, top, 'ln dash')
    f.text(36, top - 8, 'let go at 1.6 m', 't m', 'start', 12)
    f.line(320, 40, 320, floor + 10, 'ln m')

    def hammer(x, y):
        f.rect(x - 3, y - 14, 6, 28, 'fill-ink', rx=1)
        f.rect(x - 9, y - 18, 18, 7, 'fill-ink', rx=1)

    def feather(x, y):
        f.path(f'M{x},{y - 16} Q{x + 9},{y - 4} {x},{y + 16} Q{x - 9},{y - 4} {x},{y - 16} Z', 'ln')
        f.line(x, y - 16, x, y + 16, 'ln m')

    def tlabel(x, y, t, lab):
        f.text(x, y - 10 if t == 0 else y + 4, lab, 't m', 'start', 12)

    # Earth: flashes at 0, 0.2, 0.4 s and the landing at 0.57 s
    for t in (0.0, 0.2, 0.4, 0.571):
        y = min(top + 0.5 * 9.8 * t * t * scale, floor - 18)
        hammer(180, y)
        tlabel(200, y, t, f'{t:.1f} s' if t < 0.5 else '0.57 s: lands')
    f.lines(40, 150, ['a feather dropped', 'here would lag far', 'behind: the air', 'holds it back'], 't m', 'start', 12)
    # Moon: flashes every 0.2 s to 1.2 s, then the landing at 1.38 s
    for t in (0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.38):
        y = min(top + 0.5 * 1.67 * t * t * scale, floor - 18)
        hammer(430, y)
        feather(470, y)
        tlabel(490, y, t, f'{t:.1f} s' if t < 1.3 else '1.38 s: both land')
    f.text(180, floor + 24, 'hammer', 't m', 'middle', 12)
    f.text(440, floor + 24, 'hammer', 't m', 'end', 12)
    f.text(462, floor + 24, 'feather', 't m', 'start', 12)
    return f.svg()


@figure
def c4_two_coins():
    """Two coins leave a 75 cm table edge together, one dropped and one flicked at 2 m/s; flashes every 0.1 s."""
    f = Fig(640, 340, 'Two coins leaving a table edge at the same instant, one dropped and one flicked sideways at 2 m/s, '
                      'photographed every 0.1 s: at every flash they are at the same height; the flicked coin moves equal '
                      'steps sideways; both reach the floor after 0.39 s')
    scale = 240.0                        # px per metre
    edge_x, top_y = 170, 90
    floor_y = top_y + 0.75 * scale       # 270
    f.rect(20, top_y, edge_x - 20, 10, 'plate', rx=2)
    f.rect(36, top_y + 10, 10, floor_y - top_y - 10, 'plate', rx=0)
    f.rect(edge_x - 26, top_y + 10, 10, floor_y - top_y - 10, 'plate', rx=0)
    f.ground(20, floor_y, 600)
    f.text(40, top_y - 10, 'table, 75 cm high', 't m', 'start', 12)
    v = 2.0
    times = (0.0, 0.1, 0.2, 0.3, 0.391)
    path = []
    for t in times:
        h = 0.5 * 9.8 * t * t
        y = min(top_y + h * scale, floor_y - 7)
        xd = edge_x + 10
        xf = edge_x + 10 + v * t * scale
        f.line(xd + 8, y, xf - 8, y, 'ln dash')
        f.circle(xd, y, 7, 'fill-ink')
        f.circle(xf, y, 7, 'fill-ink')
        path.append((xf, y))
        if t > 0:
            f.text(xf + 14, y + 4, f'{t:.1f} s' if t < 0.35 else '0.39 s', 't m', 'start', 12)
    f.path('M' + ' L'.join(f'{px:.1f},{py:.1f}' for px, py in path), 'ln e')
    f.text(edge_x + 10, top_y - 10, 'dropped', 't', 'middle', 12)
    f.text(edge_x + 110, top_y - 10, 'flicked at 2 m/s', 't', 'middle', 12)
    f.vector(edge_x + 24, top_y - 30, 48, 0, '', 12)
    f.bracket_label(edge_x + 10, edge_x + 10 + v * 0.3 * scale, floor_y + 24, 'equal steps sideways every 0.1 s', 12, up=False)
    f.lines(430, 120, ['the dashed lines join', 'the two coins at each flash:', 'same height every time'], 't m', 'start', 12)
    return f.svg()


@figure
def c4_whirl():
    """A marble circling inside a paper plate with a gap in the rim: inward push, tangent velocity, and the straight exit."""
    f = Fig(640, 330, 'A marble rolling round the inside of a paper plate: at each moment its velocity points along the rim '
                      'and the rim pushes it inward; where the rim is cut away the marble carries straight on along the '
                      'line it was moving on, not outward')
    cx, cy, r = 250, 180, 118
    gap_a = -math.radians(40)            # the gap sits up and to the right
    a1, a2 = gap_a + math.radians(20), gap_a - math.radians(20) + 2 * math.pi
    def P(a, rr=r):
        return cx + rr * math.cos(a), cy + rr * math.sin(a)
    x1, y1 = P(a1); x2, y2 = P(a2)
    f.path(f'M{x1:.1f},{y1:.1f} A{r},{r} 0 1 1 {x2:.1f},{y2:.1f}', 'ln', extra='stroke-width="4"')
    f.text(cx, cy + 6, 'paper plate', 't m', 'middle', 13)
    # the marble at three points on its way round (clockwise on screen), with inward push and tangent velocity
    for a in (math.radians(100), math.radians(170), math.radians(250)):
        mx, my = P(a, r - 12)
        f.circle(mx, my, 9, 'fill-ink')
        ux, uy = -math.cos(a), -math.sin(a)                 # inward
        f.force(mx + 9 * ux, my + 9 * uy, ux * 38, uy * 38, '', 12)
        tx, ty = -math.sin(a), math.cos(a)                  # clockwise tangent on screen
        f.vector(mx + tx * 12, my + ty * 12, tx * 46, ty * 46, '', 12)
    bx, by = P(math.radians(100), r - 12)
    f.text(bx, by + 28, 'push of the rim', 't p b', 'middle', 12)
    lx, ly = P(math.radians(170), r - 12)
    f.text(lx - 14, ly - 34, 'velocity', 't e', 'end', 12)
    # the marble at the gap, carrying straight on along the tangent
    ga = gap_a
    gx, gy = P(ga, r - 12)
    f.circle(gx, gy, 9, 'fill-ink')
    tx, ty = -math.sin(ga), math.cos(ga)
    L = 190
    f.path(f'M{gx:.1f},{gy:.1f} L{gx + tx * L:.1f},{gy + ty * L:.1f}', 'ln e', extra='stroke-width="2.5"')
    f.circle(gx + tx * 70, gy + ty * 70, 9, 'ln')
    f.circle(gx + tx * 140, gy + ty * 140, 9, 'ln')
    f.lines(gx + tx * L + 8, gy + ty * L - 4, ['straight on, along the', 'line it was moving on'], 't e', 'start', 12)
    # the tempting wrong answer: outward along the radius
    ox, oy = math.cos(ga), math.sin(ga)
    f.path(f'M{gx:.1f},{gy:.1f} L{gx + ox * 120:.1f},{gy + oy * 120:.1f}', 'ln dash')
    f.lines(gx + ox * 120 + 6, gy + oy * 120 - 2, ['not outward:', 'nothing pushes that way'], 't m', 'start', 12)
    return f.svg()
