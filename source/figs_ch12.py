"""Figures for Chapter 12, Charge and circuits. All drawings are ours. c12_loop and c12_series_parallel use the
standard circuit symbols; c12_potential_hill follows the idea of the MIT 8.02 course notes Fig 7.2.3b (potential
round a loop) with our own 9 V / 330 Ω / red-LED numbers; c12_earth_wire follows the idea of OpenStax College Physics 2e
Fig 23.32 (worn insulation with and without an earth wire), redrawn. Numbers: 9 V, 330 Ω, red LED 2.0 V -> 21 mA;
two red LEDs in series -> 15 mA; two branches in parallel -> 21 mA each, 42 mA at the battery (python3 -I, 2026-10-28)."""
import math
from figs_core import Fig, figure, catmull


# ---------------------------------------------------------------- shared circuit parts
def _battery(f, x, y, h=64, w=36, label='9 V'):
    """A 9 V battery standing upright: + terminal at the top, − at the bottom. (x, y) is the top-left corner."""
    f.rect(x, y, w, h, 'plate', rx=4)
    f.rect(x + w * .3, y - 7, w * .4, 7, 'fill-ink', rx=2)
    f.text(x + w / 2, y + 22, '+', 't b', 'middle', 16)
    f.text(x + w / 2, y + h - 8, '−', 't b', 'middle', 16)
    f.text(x + w / 2, y + h / 2 + 5, label, 't m', 'middle', 12)
    return (x + w / 2, y - 7), (x + w / 2, y + h)       # top and bottom connection points


def _resistor(f, x, y, L=56, label='330 Ω', horizontal=True, size=12):
    """Zigzag resistor along a wire starting at (x, y)."""
    pts = [(x, y)]
    n = 6
    seg = L / (n + 1)
    for k in range(1, n + 1):
        s = 7 if k % 2 else -7
        if horizontal:
            pts.append((x + seg * k, y + s))
        else:
            pts.append((x + s, y + seg * k))
    pts.append((x + L, y) if horizontal else (x, y + L))
    f.path('M' + ' L'.join(f'{px:.1f},{py:.1f}' for px, py in pts), 'ln')
    if label:
        if horizontal:
            f.text(x + L / 2, y - 13, label, 't', 'middle', size)
        else:
            f.text(x + 14, y + L / 2 + 4, label, 't', 'start', size)
    return pts[-1]


def _led(f, x, y, lit=True, label='red LED', size=12, down=True):
    """An LED symbol on a vertical wire: current enters at the top (x, y) and leaves 34 px below.
    Triangle pointing down, bar below it; short rays when lit."""
    t = 14
    f.path(f'M{x - t},{y + 4} L{x + t},{y + 4} L{x},{y + 4 + 1.6 * t} Z', 'ln')
    f.line(x - t, y + 4 + 1.6 * t, x + t, y + 4 + 1.6 * t, 'ln', 'stroke-width="2.2"')
    f.line(x, y, x, y + 4, 'ln')
    f.line(x, y + 4 + 1.6 * t, x, y + 34, 'ln')
    if lit:
        for dy, dx in ((6, 30), (16, 32)):
            f.arrow(x + t + 4, y + dy, x + t + 4 + 14, y + dy - 8, 'ink', 1.4)
    if label:
        f.text(x + t + (24 if lit else 8), y + 30, label, 't', 'start', size)
    return (x, y + 34)


def _ground(f, x, y):
    for k, w in enumerate((22, 14, 6)):
        f.line(x - w / 2, y + k * 5, x + w / 2, y + k * 5, 'ln')


def _person(f, x, y, h=70):
    """A stick figure standing with feet at (x, y + h), one arm reaching left."""
    r = h * .12
    f.circle(x, y + r, r, 'ln')
    f.line(x, y + 2 * r, x, y + h * .62, 'ln', 'stroke-width="2"')
    f.line(x, y + h * .62, x - h * .16, y + h, 'ln', 'stroke-width="2"')
    f.line(x, y + h * .62, x + h * .16, y + h, 'ln', 'stroke-width="2"')
    f.line(x, y + h * .3, x - h * .36, y + h * .22, 'ln', 'stroke-width="2"')
    f.line(x, y + h * .3, x + h * .18, y + h * .48, 'ln', 'stroke-width="2"')


# ---------------------------------------------------------------- 12.1
@figure
def c12_rubbing():
    f = Fig(640, 300, 'Before and after rubbing a comb on hair, with the charges counted. Before, the comb holds six '
                      'positive and six negative charges and so does the hair. After, three electrons have moved to the '
                      'comb: it has six positive and nine negative, the hair six positive and three negative. The totals, '
                      'twelve of each, have not changed.')

    def panel(x0, title, comb_e, hair_e, comb_lab, hair_lab):
        f.text(x0 + 140, 24, title, 't b', 'middle', 14)
        # comb: body with teeth
        f.rect(x0 + 30, 40, 220, 46, 'plate', rx=4)
        for k in range(12):
            f.rect(x0 + 36 + k * 18, 86, 6, 16, 'plate', rx=1)
        for k in range(6):
            f.nucleon(x0 + 52 + k * 24, 54, 'p', 7)
        step = 196 / max(comb_e, 1)
        for k in range(comb_e):
            f.nucleon(x0 + 42 + step * (k + .5), 74, 'e', 7)
        f.text(x0 + 140, 122, comb_lab, 't', 'middle', 12)
        # hair: a wash with wavy strands
        f.rect(x0 + 30, 136, 220, 76, 'wash', rx=6)
        for yy in (150, 170, 190):
            f.wave(x0 + 40, yy, 200, 4, 36, phase=yy / 10, cls='ln m')
        for k in range(6):
            f.nucleon(x0 + 52 + k * 24, 160, 'p', 7)
        step = 196 / max(hair_e, 1)
        for k in range(hair_e):
            f.nucleon(x0 + 42 + step * (k + .5), 190, 'e', 7)
        f.text(x0 + 140, 232, hair_lab, 't', 'middle', 12)

    panel(10, 'Before rubbing', 6, 6, 'comb: 6 + and 6 −, neutral', 'hair: 6 + and 6 −, neutral')
    panel(350, 'After rubbing', 9, 3, 'comb: 6 + and 9 −, charge −3', 'hair: 6 + and 3 −, charge +3')
    f.curved_arrow(300, 190, 340, 78, bend=-28, kind='electron')
    f.text(320, 140, '3 electrons', 't e b', 'middle', 12)
    f.text(320, 155, 'move', 't e b', 'middle', 12)
    f.text(320, 272, 'Total before: 12 + and 12 −.  Total after: 12 + and 12 −.  Nothing was made.', 't', 'middle', 13)
    f.text(320, 292, 'only the electrons move; every + stays in its atom', 't m', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- 12.2
@figure
def c12_loop():
    f = Fig(640, 300, 'Left: a single wire from the battery to an LED, which stays dark. Right: a closed loop through a '
                      'resistor and the LED, which lights. Four equal current arrows round the loop, including one '
                      'inside the battery, each labelled 21 milliamps.')
    # ---- left: one wire
    f.text(160, 26, 'One wire', 't b', 'middle', 14)
    top, bot = _battery(f, 62, 120)
    f.line(top[0], top[1], top[0], 70, 'ln')
    f.line(top[0], 70, 236, 70, 'ln')
    f.line(236, 70, 236, 104, 'ln')
    end = _led(f, 236, 104, lit=False, label='dark')
    f.text(236, 160, '?', 't m', 'middle', 16)
    f.text(160, 210, 'the charge has nowhere to go,', 't', 'middle', 12)
    f.text(160, 226, 'so nothing moves and nothing lights', 't', 'middle', 12)
    f.line(300, 20, 300, 280, 'ln r')
    # ---- right: closed loop
    f.text(480, 26, 'A loop', 't b', 'middle', 14)
    top, bot = _battery(f, 402, 120)
    xr = 572
    f.line(top[0], top[1], top[0], 70, 'ln')
    f.line(top[0], 70, 456, 70, 'ln')
    _resistor(f, 456, 70, 56)
    f.line(512, 70, xr, 70, 'ln')
    f.line(xr, 70, xr, 104, 'ln')
    end = _led(f, xr, 104, lit=True, label='')
    f.text(xr - 20, 160, 'red LED', 't', 'end', 12)
    f.line(xr, end[1], xr, 236, 'ln')
    f.line(xr, 236, top[0], 236, 'ln')
    f.line(top[0], 236, bot[0], bot[1], 'ln')
    # equal current arrows
    f.arrow(428, 70, 448, 70, 'force', 2.2)
    f.text(438, 58, '21 mA', 't p b', 'middle', 12)
    f.arrow(xr, 180, xr, 204, 'force', 2.2)
    f.text(xr - 8, 196, '21 mA', 't p b', 'end', 12)
    f.arrow(500, 236, 476, 236, 'force', 2.2)
    f.text(488, 256, '21 mA', 't p b', 'middle', 12)
    f.arrow(433, 164, 433, 145, 'force', 1.4)
    f.text(372, 190, '21 mA, inside', 't p b', 'end', 12)
    f.text(372, 204, 'the battery too', 't p b', 'end', 12)
    f.text(480, 282, 'the same current at every point of the loop', 't', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- 12.3
@figure
def c12_potential_hill():
    f = Fig(640, 330, 'The loop unrolled as a height profile. The battery lifts the charge by 9 volts. The leads are '
                      'level. The resistor is a long slope down of 7 volts and the LED a steep drop of 2 volts, back to '
                      'the start. Below, the current is drawn with the same arrow at every point: 21 milliamps.')
    x0, y0 = 60, 212
    pv = 16                       # px per volt
    f.axis(x0, y0, 560, 170, 'position round the loop', 'volts',
           ticks={'y': [(0, '0'), (2 * pv, '2'), (9 * pv, '9')]})
    yv = lambda v: y0 - v * pv
    prof = [(80, 0), (80, 9), (112, 9), (230, 9), (390, 2), (450, 2), (470, 0), (600, 0)]
    # battery lift drawn as a block
    f.rect(76, yv(9), 36, 9 * pv, 'plate', rx=3)
    f.text(94, yv(4.5) + 4, '+', 't b', 'middle', 15)
    f.text(94, yv(0.7), '−', 't b', 'middle', 15)
    f.path('M' + ' L'.join(f'{x},{yv(v):.1f}' for x, v in prof[2:]), 'ln e', 'stroke-width="2.5"')
    f.line(112, yv(9), 112, yv(9), 'ln e')
    # annotations
    f.text(120, yv(5) + 4, 'battery: up 9 V', 't e b', 'start', 12)
    f.text(176, yv(9) - 10, 'lead: level', 't m', 'middle', 12)
    f.text(330, yv(6.2) - 8, 'resistor: down 7 V', 't e b', 'middle', 12)
    f.text(420, yv(2) - 10, 'lead', 't m', 'middle', 12)
    f.text(478, yv(2.9), 'LED: down 2 V', 't e b', 'start', 12)
    f.text(540, yv(0) - 10, 'lead: level, back to the −', 't m', 'middle', 12)
    # current strip
    ys = 278
    f.line(60, ys, 620, ys, 'ln m')
    for x in (96, 230, 370, 520):
        f.arrow(x, ys, x + 40, ys, 'force', 2.2)
        f.text(x + 20, ys - 10, '21 mA', 't p b', 'middle', 12)
    f.text(340, ys + 30, 'the current: the same arrow everywhere round the loop', 't', 'middle', 13)
    return f.svg()


# ---------------------------------------------------------------- 12.4
@figure
def c12_iv_graph():
    f = Fig(640, 320, 'Current against voltage. The 330 ohm resistor gives a straight line through the origin reaching '
                      '27 milliamps at 9 volts. The red LED curve stays near zero until about 2 volts and then climbs '
                      'steeply, drawn schematically through its datasheet point of 2.0 volts at 20 milliamps. A dashed '
                      'line marks 30 milliamps, the most the LED survives.')
    x0, y0 = 70, 262
    pxv, pymA = 50, 6
    f.axis(x0, y0, 500, 210, 'voltage across the component (V)', 'current (mA)',
           ticks={'x': [(pxv * k, str(k)) for k in (2, 4, 6, 8)], 'y': [(pymA * k, str(k)) for k in (10, 20, 30)]})
    X = lambda v: x0 + v * pxv
    Y = lambda i: y0 - i * pymA
    # resistor line
    f.line(X(0), Y(0), X(9), Y(9 / 330 * 1e3), 'ln e', 'stroke-width="2.4"')
    f.text(X(9) + 8, Y(27.3) - 2, '330 Ω resistor', 't e b', 'start', 13)
    f.text(X(9) + 8, Y(27.3) + 12, '27 mA at 9 V', 't e', 'start', 12)
    f.circle(X(7), Y(21.2), 4, 'fill-ink')
    f.text(X(7) + 8, Y(21.2) + 16, 'in your loop: 7 V, 21 mA', 't', 'start', 12)
    # LED curve (schematic)
    pts = [(0, 0), (1.0, 0.05), (1.5, 0.4), (1.75, 2.0), (1.9, 8.5), (2.0, 20), (2.07, 30)]
    f.path(catmull([(X(v), Y(i)) for v, i in pts]), 'ln p', 'stroke-width="2.4"')
    f.circle(X(2.0), Y(20), 4, 'fill-ink')
    f.text(X(2.0) - 8, Y(22), 'red LED (2.0 V)', 't p b', 'end', 12)
    # White LED curve (~3.3 V knee)
    pts_w = [(0, 0), (2.2, 0.05), (2.8, 0.5), (3.05, 2.5), (3.2, 9.0), (3.3, 20), (3.37, 30)]
    f.path(catmull([(X(v), Y(i)) for v, i in pts_w]), 'ln n', 'stroke-width="2.2"')
    f.circle(X(3.3), Y(20), 4, 'fill-ink')
    f.text(X(3.3) + 8, Y(20) - 4, 'white LED (~3.3 V)', 't b', 'start', 12)
    f.line(X(3.0), y0 - 4, X(3.0), y0 + 4, 'ln m')
    f.text(X(3.0), y0 + 15, '3 V', 't m', 'middle', 11)
    # 30 mA limit
    f.line(X(0), Y(30), X(10), Y(30), 'ln dash')
    f.text(X(10), Y(30) - 6, '30 mA: the most the LED survives', 't m', 'end', 12)
    f.text(X(4.3), Y(3) - 6, 'LED alone on 9 V: far off the top of this graph', 't m', 'start', 12)
    return f.svg()


# ---------------------------------------------------------------- 12.5
@figure
def c12_series_parallel():
    f = Fig(640, 330, 'Two red LEDs on one 9 volt battery, two ways. Series, on the left: one path, the same 15 '
                      'milliamps at every point, 2 volts across each LED and 5 across the resistor. Parallel, on the '
                      'right: two branches each with its own resistor and LED, 9 volts across each branch, 21 '
                      'milliamps in each, and 42 milliamps at the battery.')
    # ---- series
    f.text(150, 24, 'Series: one path', 't b', 'middle', 14)
    top, bot = _battery(f, 40, 130)
    xr = 250
    f.line(top[0], top[1], top[0], 62, 'ln')
    f.line(top[0], 62, 100, 62, 'ln')
    _resistor(f, 100, 62, 56, '330 Ω: 5 V')
    f.line(156, 62, xr, 62, 'ln')
    f.line(xr, 62, xr, 86, 'ln')
    e1 = _led(f, xr, 86, True, '2 V')
    f.line(xr, e1[1], xr, e1[1] + 14, 'ln')
    e2 = _led(f, xr, e1[1] + 14, True, '2 V')
    f.line(xr, e2[1], xr, 262, 'ln')
    f.line(xr, 262, top[0], 262, 'ln')
    f.line(top[0], 262, bot[0], bot[1], 'ln')
    f.arrow(176, 62, 196, 62, 'force', 2.2)
    f.text(186, 50, '15 mA', 't p b', 'middle', 12)
    f.arrow(200, 262, 180, 262, 'force', 2.2)
    f.text(190, 282, '15 mA', 't p b', 'middle', 12)
    f.arrow(xr, 222, xr, 244, 'force', 2.2)
    f.text(xr - 8, 240, '15 mA', 't p b', 'end', 12)
    f.text(150, 312, 'unclip one LED: the only path is broken, both dark', 't', 'middle', 12)
    f.line(312, 20, 312, 318, 'ln r')
    # ---- parallel
    f.text(476, 24, 'Parallel: two branches', 't b', 'middle', 14)
    top, bot = _battery(f, 350, 130)
    xl, xr2 = 410, 600
    f.line(top[0], top[1], top[0], 62, 'ln')
    f.line(top[0], 62, xl, 62, 'ln')
    f.line(xl, 62, xl, 190, 'ln')
    f.line(xr2, 62, xr2, 190, 'ln')
    for yb in (62, 190):
        _resistor(f, xl, yb, 50, '330 Ω')
        f.line(xl + 50, yb, 540, yb, 'ln')
        # LED drawn horizontally: rotate by using a small group
        t = 13
        f.path(f'M{540},{yb - t} L{540},{yb + t} L{540 + 1.6 * t},{yb} Z', 'ln')
        f.line(540 + 1.6 * t, yb - t, 540 + 1.6 * t, yb + t, 'ln', 'stroke-width="2.2"')
        f.line(540 + 1.6 * t, yb, xr2, yb, 'ln')
        for dx in (0, 10):
            f.arrow(546 + dx, yb - t - 2, 552 + dx, yb - t - 16, 'ink', 1.4)
        f.arrow(466, yb, 486, yb, 'force', 2.2)
        f.text(476, yb - 12, '21 mA', 't p b', 'middle', 12)
    f.text(505, 126, '9 V across each branch', 't', 'middle', 12)
    f.line(xr2, 190, xr2, 262, 'ln')
    f.line(xr2, 262, top[0], 262, 'ln')
    f.line(top[0], 262, bot[0], bot[1], 'ln')
    f.arrow(500, 262, 480, 262, 'force', 2.6)
    f.text(490, 282, '42 mA back to the battery', 't p b', 'middle', 12)
    f.text(476, 312, 'unclip one LED: the other branch carries on', 't', 'middle', 12)
    return f.svg()


# ---------------------------------------------------------------- 12.6
@figure
def c12_earth_wire():
    f = Fig(640, 330, 'A metal-cased appliance whose live wire has frayed and touches the case. Left, with an earth '
                      'wire: the fault current runs down the earth wire to the ground and the residual current device '
                      'trips. Right, without one: the case sits live and the current runs through the person who '
                      'touches it.')

    def panel(x0, title, earthed):
        f.text(x0 + 150, 24, title, 't b', 'middle', 14)
        # supply wires from the left
        for k, (lab, yy) in enumerate((('live', 70), ('neutral', 100), ('earth', 130))):
            if lab == 'earth' and not earthed:
                continue
            f.line(x0 + 10, yy, x0 + 92, yy, 'ln dash' if lab == 'earth' else 'ln')
            f.text(x0 + 12, yy - 6, lab, 't m', 'start', 12)
        # case
        cx, cy, cw, chh = x0 + 92, 48, 150, 150
        f.rect(cx, cy, cw, chh, 'plate', rx=6)
        f.text(cx + cw / 2, cy + chh - 10, 'metal case', 't m', 'middle', 12)
        # heater element inside
        _resistor(f, cx + 40, 100, 70, '', True)
        f.line(cx, 100, cx + 40, 100, 'ln')
        f.line(cx + 110, 100, cx + 110, 70, 'ln')
        f.line(cx + 110, 70, cx + 60, 70, 'ln')
        # frayed live: from the entry point it sags onto the case wall
        f.path(f'M{cx},70 Q{cx + 20},72 {cx + 30},70 L{cx + 34},66 L{cx + 38},72 L{cx + 60},70', 'ln')
        f.path(f'M{cx + 36},70 Q{cx + 40},86 {cx + 18},{cy + chh - 2}', 'ln p', 'stroke-width="2"')
        f.text(cx + 56, 160, 'frayed live', 't p b', 'start', 12)
        f.text(cx + 56, 174, 'touches case', 't p b', 'start', 12)
        # person to the right, hand on the case
        px = cx + cw + 36
        _person(f, px, 118, 86)
        f.line(x0 + 10, 206, x0 + 300, 206, 'ln')      # floor
        f.ground(x0 + 10, 206, 290)
        if earthed:
            # earth wire bonded to case, down to the ground symbol
            f.line(cx, 130, cx + 12, 130, 'ln dash')
            f.line(x0 + 40, 130, x0 + 40, 230, 'ln dash')
            f.line(x0 + 10, 130, x0 + 40, 130, 'ln dash')
            _ground(f, x0 + 40, 232)
            f.arrow(x0 + 40, 150, x0 + 40, 196, 'force', 2.4)
            f.text(x0 + 48, 178, 'fault current', 't p b', 'start', 12)
            f.text(x0 + 48, 192, 'to earth', 't p b', 'start', 12)
            f.text(x0 + 150, 262, 'live and neutral currents no longer match:', 't', 'middle', 12)
            f.text(x0 + 150, 278, 'the RCD trips in a fraction of a second', 't b', 'middle', 12)
            f.text(x0 + 150, 300, 'nobody has to touch it first', 't m', 'middle', 12)
        else:
            f.arrow(px, 148, px, 196, 'force', 2.4)
            f.text(x0 + 300, 226, 'current through', 't p b', 'end', 12)
            f.text(x0 + 300, 240, 'the person', 't p b', 'end', 12)
            f.text(x0 + 150, 262, 'no earth wire: the case sits live, waiting,', 't', 'middle', 12)
            f.text(x0 + 150, 278, 'and the first hand to touch it is the path', 't b', 'middle', 12)
            f.text(x0 + 150, 300, 'wet hands make that current twenty times larger', 't m', 'middle', 12)

    panel(10, 'With an earth wire', True)
    f.line(320, 18, 320, 318, 'ln r')
    panel(330, 'Without an earth wire', False)
    return f.svg()
