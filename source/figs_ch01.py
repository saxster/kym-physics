"""Figures for Chapter 1, Describing motion. All drawings are ours. c1_four_cars redraws the idea of OpenStax College
Physics 2e Fig 2.14 (four cars, velocity and acceleration arrows); c1_toss_graphs redraws the idea of its Fig 2.39
(position, velocity and acceleration against time for a thrown object), both with our own numbers."""
import math
from figs_core import Fig, figure

G = 9.8
V0 = math.sqrt(2 * G * 1.0)      # a toss that rises 1 m: 4.43 m/s


def _ball(f, x, y, r=8):
    f.circle(x, y, r, 'fill-vol')
    f.circle(x, y, r, 'ln')


@figure
def c1_two_frames():
    f = Fig(640, 340, 'The same bouncing ball in two reference frames. A walking observer sees vertical motion; a stationary observer sees three parabolic arcs. Numbered dots 1, 2 and 3 identify the same moments in both views. Gravity curves the flight between bounces; no air resistance is included.')
    for cx, title, sub in ((160, 'Walking beside the ball', 'your sideways speed matches its speed'),
                            (480, 'Standing on the platform', 'the ball keeps moving sideways')):
        f.text(cx, 30, title, 't b', 'middle', 16)
        f.text(cx, 52, sub, 't m', 'middle', 12)
    f.line(320, 18, 320, 302, 'ln r')
    f.ground(28, 252, 275)
    f.ground(340, 252, 276)
    # The world-lines are sampled from the SAME projectile at equal times.
    f.line(160, 100, 160, 244, 'ln e dash')
    for t, num in ((0, '1'), (.5, '2'), (1, '3')):
        yy = 244 - 144 * 4 * t * (1-t)
        if t == 1:
            continue  # same place as dot 1; show the shared endpoint label below
        f.circle(160, yy, 9, 'fill-vol')
        f.circle(160, yy, 9, 'ln')
        f.text(181, yy + 5, '1, 3' if t == 0 else num, 't b', 'start', 14)
    f.vector(118, 224, 0, -90)
    f.vector(210, 120, 0, 90)
    f.text(104, 175, 'up', 't e', 'end', 13)
    f.text(225, 175, 'down', 't e', 'start', 13)
    for bounce in range(3):
        pts=[]
        for k in range(41):
            t=k/40
            pts.append((350+bounce*86+86*t, 244-144*4*t*(1-t)))
        f.path('M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in pts), 'ln e')
    for t,num in ((0,'1'),(.5,'2'),(1,'3')):
        x,y=350+86*t,244-144*4*t*(1-t)
        f.circle(x,y,7,'fill-vol')
        f.circle(x,y,7,'ln')
        f.text(x, y-17, num, 't b', 'middle',14)
    f.vector(418,280,120,0)
    f.text(480,302,'steady sideways motion','t e','middle',13)
    f.text(160,284,'same place sideways','t e b','middle',13)
    f.text(320,332,'Match dots 1, 2 and 3: same events, different observers.','t','middle',14)
    return f.svg()


@figure
def c1_graph_walk():
    f = Fig(640, 300, 'A position–time graph of a walk along a corridor: forward 6 metres in 3 seconds, standing still for '
                      '3 seconds, back 3 metres in 3 seconds, then still again. Steeper means faster; a downward slope means '
                      'walking back. A dashed line for a friend walking back at half a metre per second crosses it twice.')
    x0, y0, w, h = 70, 240, 520, 190
    px = w / 12          # pixels per second
    py = h / 8           # pixels per metre
    f.axis(x0, y0, w, h, 'time (s)', 'position along the corridor (m)',
           ticks={'x': [(px * k, str(k)) for k in (2, 4, 6, 8, 10, 12)], 'y': [(py * k, str(k)) for k in (2, 4, 6, 8)]})
    pts = [(0, 0), (3, 6), (6, 6), (9, 3), (12, 3)]
    P = [(x0 + t * px, y0 - d * py) for t, d in pts]
    # a friend who starts at 8 m and strolls back at 0.5 m/s: she passes you at t = 4 s (you still) and t = 8 s
    f.line(x0, y0 - 8 * py, x0 + 12 * px, y0 - 2 * py, 'ln m dash')
    f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in P), 'ln e')
    for t, d in ((4, 6), (8, 4)):
        f.circle(x0 + t * px, y0 - d * py, 5.5, 'ln')
    f.text(105, 150, 'forward, 2 m/s', 't e b', 'start', 13)
    f.text(x0 + 4.6 * px, y0 - 6 * py - 10, 'standing still', 't e b', 'start', 13)
    f.text(372, 192, 'back, 1 m/s', 't e b', 'start', 13)
    f.text(525, 158, 'still again', 't e b', 'middle', 13)
    f.text(x0 + 12 * px - 4, 212, 'a friend walking back at 0.5 m/s', 't m', 'end', 12)
    f.text(112, 228, 'circles: same place at 4 s and at 8 s, different speeds', 't m', 'start', 12)
    return f.svg()


def _car(f, x, y, w=76, h=24):
    f.rect(x - w / 2, y - h / 2, w, h, 'block', rx=5)
    f.rect(x - w * .22, y - h / 2 - 9, w * .44, 9, 'block', rx=3)
    for dx in (-w * .3, w * .3):
        f.circle(x + dx, y + h / 2 + 2, 5, 'fill-ink')


@figure
def c1_four_cars():
    f = Fig(640, 355, 'Four cars on a road with the positive direction to the right. The velocity arrow shows which way each '
                      'car moves; the acceleration arrow shows which way its velocity is changing, and equal-time motion dots '
                      'under each car show the spacing widening when speeding up and tightening when slowing down.')
    f.vector(250, 16, 120, 0, 'positive direction', 13)
    rows = [
        (68, 1, 1, 'moving right', '(a) speeding up: a is positive', [252, 260, 274, 294, 320]),
        (140, 1, -1, 'moving right', '(b) slowing down: a is negative', [252, 278, 298, 312, 320]),
        (212, -1, -1, 'moving left', '(c) speeding up: a is negative', [328, 320, 306, 286, 260]),
        (284, -1, 1, 'moving left', '(d) slowing down: a is positive', [328, 302, 282, 268, 260]),
    ]
    for y, sv, sa, left, right, dots in rows:
        _car(f, 290, y)
        for dx in dots:
            f.circle(dx, y + 18, 2.3, 'fill-vol')
        f.vector(290 + sv * 44, y - 28, sv * 70, 0, 'v', 13)
        f.vector(290 + sa * 44, y + 29, sa * 48, 0, 'a', 13, kind='muted')
        f.text(20, y + 5, left, 't m', 'start', 13)
        f.text(430, y + 5, right, 't', 'start', 13)
    f.text(320, 348, 'v is the velocity, a the acceleration; equal-time dots widen when arrows match', 't m', 'middle', 12)
    return f.svg()


@figure
def c1_ramp():
    f = Fig(640, 300, 'A ball rolling down a long ramp, drawn at five equally spaced moments. The distances from the start '
                      'are 0, 1, 4, 9 and 16 units, so the gaps between the moments are 1, 3, 5 and 7 units. An inset velocity–time '
                      'graph shows that the areas under v = at in successive beats are 1, 3, 5 and 7.')
    x1, y1, x2, y2 = 70, 62, 590, 232
    L = math.hypot(x2 - x1, y2 - y1)
    ux, uy = (x2 - x1) / L, (y2 - y1) / L          # along the ramp
    nx, ny = uy, -ux                                # "up" from the ramp surface
    f.ground(40, 246, 580)
    f.line(x1, y1, x1, 246, 'ln m')
    f.line(x1, y1, x2, y2, 'ln', 'stroke-width="3"')
    unit = L / 16

    def at(s, off):
        return x1 + ux * s * unit + nx * off, y1 + uy * s * unit + ny * off
    for beat, s in enumerate((0, 1, 4, 9, 16)):
        bx, by = at(s, 11)
        _ball(f, bx, by, 9)
        lx, ly = at(s, 34)
        f.text(lx, ly + 4, str(beat), 't', 'middle', 13)
        tx1, ty1 = at(s, -3)
        tx2, ty2 = at(s, -12)
        f.line(tx1, ty1, tx2, ty2, 'ln')
        dx, dy = at(s, -24)
        f.text(dx, dy + 5, str(s), 't b', 'middle', 13)
    for s_a, s_b in ((0, 1), (1, 4), (4, 9), (9, 16)):
        mx, my = at((s_a + s_b) / 2, -42)
        f.text(mx, my + 5, f'+{s_b - s_a}', 't e b', 'middle', 13)
    lx, ly = at(0, 34)
    f.text(lx - 10, ly + 4, 'beats:', 't m', 'end', 12)
    dx, dy = at(0, -24)
    f.text(dx - 10, dy + 5, 'distance:', 't m', 'end', 12)
    mx, my = at(0, -42)
    f.text(mx - 10, my + 5, 'gaps:', 't m', 'end', 12)
    # Inset v-t area diagram in upper right
    ix, iy, iw, ih = 430, 112, 160, 76
    f.path(f'M{ix},{iy} L{ix+iw},{iy} L{ix+iw},{iy-ih} Z', 'wash')
    f.line(ix, iy, ix + iw, iy, 'ax')
    f.line(ix, iy, ix, iy - ih - 6, 'ax')
    f.line(ix, iy, ix + iw, iy - ih, 'ln e')
    for k, area_lbl in ((1, '+1'), (2, '+3'), (3, '+5'), (4, '+7')):
        xk = ix + k * (iw / 4)
        yk = iy - k * (ih / 4)
        f.line(xk, iy, xk, yk, 'ln m dash')
        f.text(xk - iw / 8, iy - (k - 0.5) * (ih / 8) + 4, area_lbl, 't e b', 'middle', 10.5)
    f.text(ix + 6, iy - ih + 4, 'v = at (area = distance)', 't m', 'start', 11)
    f.text(ix + iw, iy + 13, 'beats (t)', 't m', 'end', 10.5)
    f.text(600, 292, 'the ramp is drawn steeper than Galileo would have used it', 't m', 'end', 12)
    return f.svg()


def _heights():
    return [(V0 * t - 0.5 * G * t * t) * 100 for t in [k / 10 for k in range(10)]]


@figure
def c1_toss_strobe():
    f = Fig(640, 330, 'A ball tossed straight up one metre in front of a tiled wall, drawn every tenth of a second: five '
                      'positions going up on the left, five coming down on the right. The gaps between positions shrink by '
                      'about 9.8 cm each time, through the top and down the other side.')
    base, scale = 300, 2.4           # y of the floor, pixels per centimetre
    for cm in range(0, 101, 10):
        y = base - cm * scale
        f.line(130, y, 510, y, 'ln r')
    for cm, lab in ((0, '0'), (50, '50 cm'), (100, '1 m')):
        f.text(122, base - cm * scale + 4, lab, 't m', 'end', 12)
    hs = _heights()
    up, down = hs[:5], hs[5:]
    xu, xd = 240, 400
    for i, h in enumerate(up):
        y = base - h * scale
        _ball(f, xu, y, 8)
        f.text(xu - 16, y + 4, f'{i / 10:.1f} s', 't', 'end', 12)
    for i, h in enumerate(down):
        y = base - h * scale
        _ball(f, xd, y, 8)
        f.text(xd + 16, y + 4, f'{(i + 5) / 10:.1f} s', 't', 'start', 12)
    for i in range(4):
        ya, yb = base - up[i] * scale, base - up[i + 1] * scale
        f.line(xu + 22, ya, xu + 22, yb, 'ln e')
        f.text(xu + 30, (ya + yb) / 2 + 4, f'{up[i + 1] - up[i]:.0f} cm', 't e', 'start', 12)
    for i in range(4):
        ya, yb = base - down[i] * scale, base - down[i + 1] * scale
        f.line(xd - 22, ya, xd - 22, yb, 'ln e')
        f.text(xd - 30, (ya + yb) / 2 + 4, f'{down[i] - down[i + 1]:.0f} cm', 't e', 'end', 12)
    f.text(320, 46, f'top: only {hs[5] - hs[4]:.1f} cm between 0.4 s and 0.5 s', 't e b', 'middle', 12)
    f.text(xu, 322, 'going up', 't b', 'middle', 13)
    f.text(xd, 322, 'coming down', 't b', 'middle', 13)
    f.text(122, base - 50 * scale + 20, 'tiles 10 cm apart', 't m', 'end', 12)
    return f.svg()


@figure
def c1_toss_graphs():
    f = Fig(1000, 300, 'Three graphs against time for the one-metre toss. Height rises and falls in a curve with its top at '
                       '0.45 seconds. Velocity is a straight line sloping down, positive then negative, passing through zero at '
                       '0.45 seconds. Acceleration is a flat line at minus 9.8 metres per second squared the whole time.', wide=True)
    T = 0.9
    px = 260 / 1.0                      # pixels per second
    # ---- height
    x0, yb = 60, 232
    f.axis(x0, yb, 270, 170, 'time (s)', 'height (cm)',
           ticks={'x': [(px * .5, '0.5'), (px * 1, '1')], 'y': [(80, '50'), (160, '100')]})
    pts = []
    for k in range(0, 91):
        t = k / 100
        hcm = (V0 * t - 0.5 * G * t * t) * 100
        pts.append((x0 + t * px, yb - hcm * 1.6))
    f.path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts), 'ln e')
    tt = x0 + 0.452 * px
    f.line(tt, yb, tt, 50, 'ln m dash')
    f.text(tt, 42, 'top of the flight, 0.45 s', 't m', 'middle', 12)
    # ---- velocity: zero line in the middle
    x1, ym = 390, 150
    f.line(x1, ym, x1 + 270, ym, 'ax')
    f.add(f'<line x1="{x1}" y1="{ym + 90}" x2="{x1}" y2="{ym - 95}" class="ax" marker-end="url(#ah-ink)"/>')
    for v in (4, 2, -2, -4):
        f.line(x1 - 5, ym - v * 18, x1, ym - v * 18, 'ax')
        f.text(x1 - 9, ym - v * 18 + 4, f'{v:+d}' if v > 0 else str(v), 't m', 'end', 12)
    f.text(x1 - 9, ym + 4, '0', 't m', 'end', 12)
    f.text(x1 + 8, ym - 95 + 4, 'velocity (m/s), up is +', 't m', 'start', 13)
    f.text(x1 + 270, ym + 34, 'time (s)', 't m', 'end', 13)
    for t in (0.5, 1.0):
        f.line(x1 + t * px, ym, x1 + t * px, ym + 5, 'ax')
        f.text(x1 + t * px, ym + 18, f'{t:g}', 't m', 'middle', 12)
    va, vb = V0, V0 - G * T
    f.line(x1, ym - va * 18, x1 + T * px, ym - vb * 18, 'ln e', 'stroke-width="2.2"')
    f.line(x1 + 0.452 * px, ym + 90, x1 + 0.452 * px, 50, 'ln m dash')
    f.text(x1 + 0.452 * px + 6, ym - 30, 'zero here, for an instant', 't e', 'start', 12)
    f.text(x1 + T * px - 6, ym - vb * 18 + 16, '−4.4 m/s', 't e', 'end', 12)
    # ---- acceleration: zero line near the top, −9.8 below it
    x2, yz = 720, 92
    f.line(x2, yz, x2 + 270, yz, 'ax')
    f.add(f'<line x1="{x2}" y1="{yz + 150}" x2="{x2}" y2="{yz - 36}" class="ax" marker-end="url(#ah-ink)"/>')
    f.text(x2 - 9, yz + 4, '0', 't m', 'end', 12)
    ya = yz + 9.8 * 11
    f.line(x2 - 5, ya, x2, ya, 'ax')
    f.text(x2 - 9, ya + 4, '−9.8', 't m', 'end', 12)
    f.text(x2 + 8, yz - 36 + 4, 'acceleration (m/s²)', 't m', 'start', 13)
    f.text(x2 + 270, yz + 34, 'time (s)', 't m', 'end', 13)
    for t in (0.5, 1.0):
        f.line(x2 + t * px, yz, x2 + t * px, yz + 5, 'ax')
        f.text(x2 + t * px, yz + 18, f'{t:g}', 't m', 'middle', 12)
    f.line(x2, ya, x2 + T * px, ya, 'ln e', 'stroke-width="2.2"')
    f.line(x2 + 0.452 * px, yz + 150, x2 + 0.452 * px, 50, 'ln m dash')
    f.text(x2 + 0.452 * px + 8, ya - 24, 'the same −9.8', 't e', 'start', 12)
    f.text(x2 + 0.452 * px + 8, ya - 10, 'the whole time', 't e', 'start', 12)
    return f.svg()


@figure
def c1_trains():
    f = Fig(640, 370, 'Three Mumbai local trains. Track-frame arrows use the same speed scale: an oncoming train 60 km/h left (south), your train 60 km/h right (north), and a faster train 70 km/h right (north). In your frame the oncoming train approaches at 120 km/h and the faster train gains at 10 km/h.')
    f.text(24,28,'What the platform sees', 't b',size=16)
    f.text(396,28,'← South  |  North →', 't m', 'end', 12)
    f.text(440,28,'What you see', 't b',size=16)
    f.line(420,42,420,340,'ln r')
    rows=[(94,220,-90,'an oncoming local','120 km/h','approaching you'),
          (194,65,90,'your train','0 km/h','you are at rest here'),
          (294,130,105,'a faster local','10 km/h','gaining on you')]
    for y,x,dx,label,rel,note in rows:
        f.line(22,y+44,398,y+44,'ln m')
        f.line(22,y+48,398,y+48,'ln r')
        f.train(x,y,170,36)
        f.text(24,y-36,label,'t b',size=13)
        ax=x-7 if dx<0 else x+175
        if dx>0: ax=min(ax,290)
        f.vector(ax,y-14,dx,0)
        f.text(ax+dx/2,y-26,'70 km/h' if dx==105 else '60 km/h','t e','middle',13)
        f.text(446,y+5,rel,'t e b',size=23)
        f.text(446,y+28,note,'t m',size=13)
    f.text(320,363,'Relative velocity = the other train’s velocity − your velocity.','t','middle',14)
    return f.svg()
