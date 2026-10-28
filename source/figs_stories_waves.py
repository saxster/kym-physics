"""Figures for the stories in the waves group (Sound and light). Only the drawings the chapters lack live here; the
stories reuse the chapter figures c9_resonance, c9_harmonics, c9_doppler, c10_seeing, c10_pinhole, c10_refraction,
c10_eye, c10_romer, c11_prism, c11_sky, c11_brewster, c11_young and c11_raman by name. All drawings are ours. The two
curves in s_push_timing are computed by integrating a damped oscillator driven by equal impulses; the bars in
s_scatter_bars follow the 1/lambda^4 rule (College Physics 2e, Ch 27 Conceptual Q34)."""
import math
from figs_core import Fig, figure


def _driven(push_period, n_steps=2400, dt=0.01, w0=2 * math.pi / 3.2, gamma=0.25, kick=0.6):
    """Position of a lightly damped oscillator (natural period 3.2 s) kicked with equal impulses every push_period."""
    x, v, t = 0.0, 0.0, 0.0
    out, pushes, next_push = [], [], 0.0
    for _ in range(n_steps):
        if t >= next_push - 1e-9:
            v += kick
            pushes.append(t)
            next_push += push_period
        a = -w0 * w0 * x - gamma * v
        v += a * dt
        x += v * dt
        t += dt
        out.append((t, x))
    return out, pushes


@figure
def s_push_timing():
    f = Fig(640, 350, 'Two graphs of a swing driven by equal small pushes. Above: pushes once per swing, in time with it, '
                      'and the swing grows steadily. Below: pushes at an unrelated rhythm, and the swing stays small.')
    panels = [(84, 'Pushes in time: one every 3.2 s, as the seat moves away', 3.2),
              (236, 'Pushes at the wrong rhythm: one every 1.9 s', 1.9)]
    x0, w = 62, 500
    scale = 44 / 4.2          # the in-time curve reaches about 4 units at the end: 44 px
    for yc, title, per in panels:
        pts, pushes = _driven(per)
        tmax = pts[-1][0]
        f.text(x0, yc - 56, title, 't b', 'start', 13)
        f.line(x0, yc, x0 + w, yc, 'ln m')
        d = 'M' + ' L'.join(f'{x0 + w * t / tmax:.1f},{yc - x * scale:.1f}' for t, x in pts[::4])
        f.path(d, 'ln e')
        for tp in pushes:
            px = x0 + w * tp / tmax
            f.arrow(px, yc + 66, px, yc + 50, 'force', width=1.6)
        f.text(x0 + w + 8, yc + 4, 'time →', 't m', 'start', 12)
    f.text(x0 + w / 2, 336, 'Each arrow is one push. Every push is the same size; only the timing differs.', 't m', 'middle', 13)
    f.text(24, 160, 'how far the seat swings', 't m', 'middle', 12, extra='transform="rotate(-90 24 160)"')
    return f.svg()


@figure
def s_light_delays():
    f = Fig(640, 250, 'Four distances and the time light takes to cross each: Fizeau\'s mirror and back in Paris, '
                      '0.00006 s; the Moon to Earth, 1.3 s; the Sun to Earth, 8 min 19 s; across Earth\'s orbit, 16.6 min.')
    rows = [
        ('Fizeau\'s mirror and back', '17 km', '0.00006 s'),
        ('The Moon to Earth', '384,400 km', '1.3 s'),
        ('The Sun to Earth', '150 million km', '8 min 19 s'),
        ('Across Earth\'s orbit', '300 million km', '16.6 min (Rømer said about 22)'),
    ]
    f.text(60, 34, 'light leaves', 't m', 'start', 12)
    f.text(600, 34, 'light arrives', 't m', 'end', 12)
    for i, (what, dist, t) in enumerate(rows):
        y = 70 + i * 46
        f.circle(60, y, 6, 'fill-vol')
        f.circle(600, y, 6, 'fill-ink')
        f.arrow(72, y, 586, y, 'muted')
        f.text(80, y - 9, what, 't b', 'start', 13)
        f.text(80, y + 15, dist, 't m', 'start', 12)
        f.text(580, y - 9, t, 't', 'end', 13)
    f.text(320, 240, 'Not to scale. Light covers 299,792 km every second.', 't m', 'middle', 12)
    return f.svg()


@figure
def s_scatter_bars():
    f = Fig(640, 330, 'A bar chart of how strongly air scatters light of each colour, relative to red at 700 nm: '
                      'violet 400 nm about 9.4 times, blue 450 nm 5.9, blue-green 500 nm 3.8, green 550 nm 2.6, '
                      'yellow 600 nm 1.9, orange 650 nm 1.4, red 700 nm 1.')
    x0, y0, h = 70, 250, 180
    waves = [(400, 'violet'), (450, 'blue'), (500, 'blue-green'), (550, 'green'), (600, 'yellow'), (650, 'orange'), (700, 'red')]
    top = (700 / 400) ** 4
    px = (h - 24) / top       # pixels per unit, so the tallest bar stops short of the axis arrowhead
    f.axis(x0, y0, 530, h, '', '', ticks={'y': [(px * k, f'×{k}') for k in (1, 3, 5, 7, 9)]})
    f.text(x0 - 46, y0 - h - 16, 'how much is scattered, compared with red light', 't m', 'start', 13)
    f.text(x0 + 530, y0 + 54, 'wavelength of the light, and its colour', 't m', 'end', 13)
    bw = 50
    for i, (lam, name) in enumerate(waves):
        r = (700 / lam) ** 4
        bh = px * r
        x = x0 + 26 + i * 72
        f.rect(x, y0 - bh, bw, bh, 'wash-e', rx=3)
        f.line(x, y0 - bh, x + bw, y0 - bh, 'ln e')
        f.text(x + bw / 2, y0 - bh - 8, f'×{r:.1f}', 't e b', 'middle', 13)
        f.text(x + bw / 2, y0 + 17, f'{lam} nm', 't m', 'middle', 12)
        f.text(x + bw / 2, y0 + 32, name, 't', 'middle', 12)
    return f.svg()


@figure
def s_narkunda_rail():
    f = Fig(640, 320, 'A cross-section at a ship\'s rail. Skylight reflects off the sea surface up to an eye holding a '
                      'Nicol prism and is blocked, labelled as shaking side to side. Sunlight entering the water is '
                      'scattered inside it and comes back up through the surface to the same eye, labelled as shaking '
                      'every way, and passes the prism.')
    ys = 220                     # the sea surface
    f.rect(0, ys, 640, 100, 'water', rx=0)
    f.line(0, ys, 640, ys, 'ln')
    f.text(14, ys + 24, 'sea', 't m', 'start', 13)
    f.text(14, 28, 'sky', 't m', 'start', 13)
    # the eye at the rail, with the prism in front of it
    ex, ey = 524, 56
    f.circle(ex + 22, ey, 9, 'ln')
    f.circle(ex + 22, ey, 3.5, 'fill-ink')
    f.rect(ex - 2, ey - 16, 12, 32, 'glass', rx=2)
    f.text(626, 16, 'Nicol prism: passes', 't b', 'end', 12)
    f.text(626, 30, 'up-and-down shaking only', 't b', 'end', 12)
    # 1. skylight reflected at Brewster's angle (53 deg from the normal) into the eye
    px = 300
    f.ray(76, ys - 169, px, ys, chevrons=2)
    f.ray(px, ys, ex - 4, ey, chevrons=2)
    f.line(px, ys, px, ys - 70, 'ln m dash')
    f.text(px + 6, ys - 56, '53°', 't m', 'start', 12)
    f.text(150, 60, 'skylight, reflected off the surface:', 't', 'start', 13)
    f.text(150, 76, 'shakes side to side only', 't b', 'start', 13)
    # a cross on the reflected ray just before the prism, and the word beside it
    cx, cy = 494, ys - (ys - ey) * (494 - px) / (ex - 4 - px)
    f.line(cx - 7, cy - 7, cx + 7, cy + 7, 'ln p')
    f.line(cx + 7, cy - 7, cx - 7, cy + 7, 'ln p')
    f.text(cx - 14, cy - 10, 'BLOCKED', 't p b', 'end', 13)
    # 2. sunlight entering the water, scattered inside, back up through the surface to the eye
    sx = 420
    f.ray(sx - 150, ys - 120, sx - 60, ys, chevrons=1)              # sunlight going in
    f.line(sx - 60, ys, sx - 30, ys + 60, 'ray')
    for dx, dy in ((-4, 8), (10, 22), (22, 40), (-18, 30), (4, 52)):
        f.circle(sx - 30 + dx, ys + 10 + dy, 2.2, 'fill-ink')
    f.text(sx - 30, ys + 92, 'scattered inside the water', 't m', 'middle', 12)
    f.ray(sx - 25, ys + 70, sx + 20, ys, chevrons=1)
    f.ray(sx + 20, ys, ex - 4, ey + 8, chevrons=2)
    f.text(sx + 30, ys - 20, 'blue from inside the water:', 't', 'start', 13)
    f.text(sx + 30, ys - 4, 'shakes every way', 't b', 'start', 13)
    f.text(626, 150, 'PASSES', 't g b', 'end', 13)
    return f.svg()


@figure
def s_arago_spot():
    f = Fig(640, 280, 'A point source at the left lights a small round disc seen edge-on. On a screen at the right its '
                      'shadow is drawn, with a bright spot at the exact centre. Two equal lines run from the top and the '
                      'bottom of the disc\'s rim to that centre point, marked as the same length.')
    sx, sy = 30, 140
    dx, top, bot = 250, 118, 162
    scx = 530
    # geometric shadow edges
    for e in (top, bot):
        slope = (e - sy) / (dx - sx)
        f.line(sx, sy, scx, sy + slope * (scx - sx), 'ln m dash')
    f.rect(scx, sy + (top - sy) * (scx - sx) / (dx - sx), 6, (bot - top) * (scx - sx) / (dx - sx), 'fill-ink', rx=0)
    f.line(scx + 3, 40, scx + 3, 250, 'ln')
    f.text(scx + 14, 48, 'screen', 't m', 'start', 12)
    f.text(scx + 14, 100, 'the shadow', 't m', 'start', 12)
    # the source and the disc
    f.circle(sx, sy, 6, 'fill-vol')
    f.text(8, sy + 26, 'point of light', 't m', 'start', 12)
    f.rect(dx - 4, top, 8, bot - top, 'block', rx=2)
    f.text(dx, top - 30, 'small round disc, edge-on', 't m', 'middle', 12)
    # straight rays that miss the disc
    f.ray(sx, sy, scx, 60, chevrons=1)
    f.ray(sx, sy, scx, 220, chevrons=1)
    # wavelets spilling round the rim, meeting at the centre of the shadow
    for e in (top, bot):
        f.ray(dx, e, scx, sy, chevrons=1, cls='ray')
        for r in (14, 28):
            s = -1 if e == top else 1
            f.path(f'M{dx + r},{e + s * 2} A{r},{r} 0 0 {1 if e == top else 0} {dx + 4},{e - s * r}', 'ln e thin')
    f.circle(scx + 3, sy, 4, 'fill-sheet')
    f.circle(scx + 3, sy, 4, 'ln')
    f.text(scx + 14, sy + 4, 'bright spot', 't b', 'start', 13)
    f.text(40, 206, 'the two lines from the rim to the centre', 't e', 'start', 12)
    f.text(40, 220, 'are the same length, so the waves arrive in step', 't e', 'start', 12)
    f.text(320, 264, 'Light spilling round the rim arrives at the centre in step, crest with crest, and adds up.',
           't m', 'middle', 12)
    return f.svg()
