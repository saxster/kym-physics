"""Shared drawing primitives for the book's figures.

Every figure is an inline SVG. Colours come from CSS classes (defined in book.css) so the
figures follow light/dark themes and print. Rules:
  * Never rely on colour alone: every atom carries its symbol, every particle its sign.
  * Text in figures uses class "t" (sans, ink) or "t m" (muted) or "t s" (serif, for formulas).
  * Sizes are in viewBox units; figures are drawn at a nominal width of 640 (full text column)
    or 1000 (wide, spans into the margin on large screens).
"""
from __future__ import annotations
import math
from html import escape

# ---------------------------------------------------------------- element styling
# fill colour per element (CPK-inspired, harmonised with the book palette)
EL = {
    'H': '#f3f1e8', 'C': '#3d4a46', 'N': '#4f74b3', 'O': '#c4553c', 'Na': '#8a6bb5',
    'Cl': '#5c9a52', 'Mg': '#c7a24a', 'Al': '#a7b3b8', 'S': '#d9b93b', 'Fe': '#b06a3b',
    'Cu': '#c27a45', 'Zn': '#8fa2ad', 'Ag': '#c9cdd0', 'Li': '#b98bc9', 'Ne': '#e0897a',
    'He': '#e6c87a', 'Br': '#9a4a3c', 'Ca': '#9fb5a0', 'K': '#a67ccf', 'F': '#8fc06b',
    'X': '#b8b2a2', 'A': '#c97b5a', 'B': '#5a8fae', 'Pb': '#7d7f8a', 'B_': '#e3a3a3',
}
DARK_TEXT = {'C', 'Na', 'N', 'O', 'Cl', 'Fe', 'Cu', 'Br', 'K', 'Pb', 'A', 'B', 'Li'}

def r_(x):
    return f'{x:.1f}'.rstrip('0').rstrip('.') if isinstance(x, float) else str(x)


class Fig:
    """Collects SVG elements; call .svg() to finish."""

    def __init__(self, w=640, h=360, label='', wide=False):
        self.w, self.h, self.label, self.wide = w, h, label, wide
        self.parts: list[str] = []

    def add(self, s):
        self.parts.append(s)
        return self

    def svg(self):
        cls = 'fig wide' if self.wide else 'fig'
        return (f'<svg class="{cls}" viewBox="0 0 {self.w} {self.h}" role="img" '
                f'aria-label="{escape(self.label)}" xmlns="http://www.w3.org/2000/svg">'
                + ''.join(self.parts) + '</svg>')

    # ---------------------------------------------------------- basic shapes
    def rect(self, x, y, w, h, cls='plate', rx=6, extra=''):
        return self.add(f'<rect x="{r_(x)}" y="{r_(y)}" width="{r_(w)}" height="{r_(h)}" rx="{rx}" class="{cls}" {extra}/>')

    def line(self, x1, y1, x2, y2, cls='ln', extra=''):
        return self.add(f'<line x1="{r_(x1)}" y1="{r_(y1)}" x2="{r_(x2)}" y2="{r_(y2)}" class="{cls}" {extra}/>')

    def path(self, d, cls='ln', extra=''):
        return self.add(f'<path d="{d}" class="{cls}" {extra}/>')

    def circle(self, x, y, r, cls='ln', extra=''):
        return self.add(f'<circle cx="{r_(x)}" cy="{r_(y)}" r="{r_(r)}" class="{cls}" {extra}/>')

    def text(self, x, y, s, cls='t', anchor='start', size=15, weight=None, extra=''):
        w = f' font-weight="{weight}"' if weight else ''
        return self.add(f'<text x="{r_(x)}" y="{r_(y)}" class="{cls}" text-anchor="{anchor}" '
                        f'font-size="{size}"{w} {extra}>{s}</text>')

    def lines(self, x, y, rows, cls='t', anchor='start', size=15, lh=1.3, weight=None):
        for i, s in enumerate(rows):
            self.text(x, y + i * size * lh, s, cls, anchor, size, weight)
        return self

    def arrow(self, x1, y1, x2, y2, kind='ink', width=None, dash=False, extra=''):
        sw = f' stroke-width="{width}"' if width else ''
        da = ' stroke-dasharray="5 4"' if dash else ''
        return self.add(f'<line x1="{r_(x1)}" y1="{r_(y1)}" x2="{r_(x2)}" y2="{r_(y2)}" '
                        f'class="ar ar-{kind}" marker-end="url(#ah-{kind})"{sw}{da} {extra}/>')

    def curved_arrow(self, x1, y1, x2, y2, bend=30, kind='ink', dash=False):
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        dx, dy = x2 - x1, y2 - y1
        n = math.hypot(dx, dy) or 1
        cx, cy = mx - dy / n * bend, my + dx / n * bend
        da = ' stroke-dasharray="5 4"' if dash else ''
        return self.add(f'<path d="M{r_(x1)},{r_(y1)} Q{r_(cx)},{r_(cy)} {r_(x2)},{r_(y2)}" '
                        f'class="ar ar-{kind}" fill="none" marker-end="url(#ah-{kind})"{da}/>')

    def bracket_label(self, x1, x2, y, s, size=13, up=True):
        d = -6 if up else 6
        self.path(f'M{x1},{y + d} L{x1},{y} L{x2},{y} L{x2},{y + d}', 'ln m')
        return self.text((x1 + x2) / 2, y - 8 if up else y + 18, s, 't m', 'middle', size)

    # ---------------------------------------------------------- particles
    def atom(self, x, y, el, r=16, label=True, cls=''):
        fill = EL.get(el, '#bbb')
        tc = '#fbfaf5' if el in DARK_TEXT else '#1d2b27'
        self.add(f'<g class="atom {cls}"><circle cx="{r_(x)}" cy="{r_(y)}" r="{r_(r)}" fill="{fill}" class="atom-c"/>'
                 f'<path d="M{r_(x - r * .55)},{r_(y - r * .2)} A{r_(r * .62)},{r_(r * .62)} 0 0 1 {r_(x + r * .05)},{r_(y - r * .62)}" class="atom-hl"/>')
        if label:
            fs = r * (0.95 if len(el) == 1 else 0.78)
            self.add(f'<text x="{r_(x)}" y="{r_(y + fs * .35)}" text-anchor="middle" font-size="{r_(fs)}" '
                     f'class="atom-t" fill="{tc}">{el}</text>')
        return self.add('</g>')

    def ion(self, x, y, el, charge, r=16):
        """Atom with a small charge badge at upper right."""
        self.atom(x, y, el, r)
        bx, by = x + r * .78, y - r * .78
        self.add(f'<circle cx="{r_(bx)}" cy="{r_(by)}" r="{r_(r * .42)}" class="badge"/>')
        return self.text(bx, by + r * .17, charge, 'badge-t', 'middle', r_(r * .5), 700)

    def nucleon(self, x, y, kind, r=9, sign=True):
        cls = {'p': 'pt-p', 'n': 'pt-n', 'e': 'pt-e'}[kind]
        self.circle(x, y, r, cls)
        self.add(f'<path d="M{r_(x - r * .55)},{r_(y - r * .15)} A{r_(r * .6)},{r_(r * .6)} 0 0 1 {r_(x)},{r_(y - r * .62)}" class="atom-hl"/>')
        if sign:
            s = {'p': '+', 'n': '', 'e': '−'}[kind]
            if s:
                self.text(x, y + r * .42, s, 'pt-sign', 'middle', r_(r * 1.25), 700)
        return self

    def bond(self, x1, y1, x2, y2, order=1, gap=4.2, cls='bond'):
        if order == 1:
            return self.line(x1, y1, x2, y2, cls)
        dx, dy = x2 - x1, y2 - y1
        n = math.hypot(dx, dy) or 1
        ox, oy = -dy / n * gap, dx / n * gap
        offs = [-.5, .5] if order == 2 else [-1, 0, 1]
        for k in offs:
            self.line(x1 + ox * k * (2 if order == 2 else 1), y1 + oy * k * (2 if order == 2 else 1),
                      x2 + ox * k * (2 if order == 2 else 1), y2 + oy * k * (2 if order == 2 else 1), cls)
        return self

    # ---------------------------------------------------------- molecules (2D)
    def molecule(self, kind, x, y, s=1.0, rot=0.0, label=True):
        """Draw a small molecule centred at (x, y). s scales, rot in degrees."""
        spec = MOLECULES[kind]
        c, sn = math.cos(math.radians(rot)), math.sin(math.radians(rot))
        pts = [(x + (ax * c - ay * sn) * s, y + (ax * sn + ay * c) * s) for _, ax, ay in spec['atoms']]
        for i, j, o in spec.get('bonds', []):
            self.bond(*pts[i], *pts[j], o)
        # draw back-to-front: larger atoms first
        order = sorted(range(len(pts)), key=lambda k: -ATOM_R.get(spec['atoms'][k][0], 14))
        for k in order:
            el = spec['atoms'][k][0]
            self.atom(*pts[k], el, ATOM_R.get(el, 14) * s, label)
        return self

    # ---------------------------------------------------------- plotting helpers
    def axes(self, x0, y0, w, h, xlabel='', ylabel='', cls='ax'):
        self.line(x0, y0, x0 + w, y0, cls)
        self.line(x0, y0, x0, y0 - h, cls)
        if xlabel:
            self.text(x0 + w, y0 + 28, xlabel, 't m', 'end', 13)
        if ylabel:
            self.text(x0 - 12, y0 - h - 12, ylabel, 't m', 'start', 13)
        return self


ATOM_R = {'H': 10, 'C': 15, 'N': 15, 'O': 15.5, 'Cl': 18, 'Na': 17, 'S': 17}

def _mol(atoms, bonds):
    return {'atoms': atoms, 'bonds': bonds}

_w = math.radians(104.5 / 2)
MOLECULES = {
    'H2': _mol([('H', -11, 0), ('H', 11, 0)], [(0, 1, 1)]),
    'O2': _mol([('O', -15, 0), ('O', 15, 0)], [(0, 1, 2)]),
    'N2': _mol([('N', -14, 0), ('N', 14, 0)], [(0, 1, 3)]),
    'Cl2': _mol([('Cl', -17, 0), ('Cl', 17, 0)], [(0, 1, 1)]),
    'H2O': _mol([('O', 0, -5), ('H', -24 * math.sin(_w), -5 + 24 * math.cos(_w)),
                 ('H', 24 * math.sin(_w), -5 + 24 * math.cos(_w))], [(0, 1, 1), (0, 2, 1)]),
    'CO2': _mol([('C', 0, 0), ('O', -30, 0), ('O', 30, 0)], [(0, 1, 2), (0, 2, 2)]),
    'CH4': _mol([('C', 0, 0), ('H', 0, -26), ('H', -24, 10), ('H', 24, 10), ('H', 6, 22)],
                [(0, 1, 1), (0, 2, 1), (0, 3, 1), (0, 4, 1)]),
    'NH3': _mol([('N', 0, -3), ('H', -24, 10), ('H', 24, 10), ('H', 0, 24)],
                [(0, 1, 1), (0, 2, 1), (0, 3, 1)]),
    'HCl': _mol([('H', -16, 0), ('Cl', 10, 0)], [(0, 1, 1)]),
    'H2O2': _mol([('O', -14, 0), ('O', 14, 0), ('H', -30, -16), ('H', 30, 16)],
                 [(0, 1, 1), (0, 2, 1), (1, 3, 1)]),
    'NO': _mol([('N', -14, 0), ('O', 14, 0)], [(0, 1, 2)]),
    'O3': _mol([('O', 0, -8), ('O', -24, 10), ('O', 24, 10)], [(0, 1, 2), (0, 2, 1)]),
}


def catmull(points, closed=False):
    """Smooth path through points (Catmull–Rom converted to cubic Béziers)."""
    if len(points) < 2:
        return ''
    p = points
    d = f'M{r_(p[0][0])},{r_(p[0][1])}'
    for i in range(len(p) - 1):
        p0 = p[i - 1] if i > 0 else p[i]
        p1, p2 = p[i], p[i + 1]
        p3 = p[i + 2] if i + 2 < len(p) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f' C{r_(c1[0])},{r_(c1[1])} {r_(c2[0])},{r_(c2[1])} {r_(p2[0])},{r_(p2[1])}'
    return d


def pack_disc(n, r_item, seed=0):
    """Deterministic sunflower packing of n discs; returns offsets from centre."""
    out = []
    golden = math.pi * (3 - math.sqrt(5))
    for i in range(n):
        rr = r_item * 1.08 * math.sqrt(i + .5) * 1.05
        th = i * golden + seed
        out.append((rr * math.cos(th), rr * math.sin(th)))
    return out


def jitter_grid(n, x, y, w, h, seed=1, margin=18):
    """Scatter n points pseudo-randomly but evenly inside a box (for gas/liquid drawings)."""
    import random
    rnd = random.Random(seed)
    cols = max(1, round(math.sqrt(n * w / h)))
    rows = math.ceil(n / cols)
    cw, ch = (w - 2 * margin) / cols, (h - 2 * margin) / rows
    cells = [(i % cols, i // cols) for i in range(cols * rows)]
    rnd.shuffle(cells)
    pts = []
    for (cx, cy) in cells[:n]:
        pts.append((x + margin + cw * (cx + .5) + rnd.uniform(-cw * .28, cw * .28),
                    y + margin + ch * (cy + .5) + rnd.uniform(-ch * .28, ch * .28)))
    return pts


# Shared defs, injected once per document.
DEFS = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
''' + ''.join(
    f'<marker id="ah-{k}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
    f'<path d="M0,0.6 L9.4,5 L0,9.4 L2.4,5 Z" class="ah ah-{k}"/></marker>'
    for k in ('ink', 'muted', 'proton', 'electron', 'neutron', 'green')) + '''
<pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0 L0 0 0 16" class="gridln"/></pattern>
</defs></svg>'''


# ---------------------------------------------------------------- registry
FIGS: dict = {}

def figure(fn):
    """Register a figure function. It must return an SVG string (use Fig(...).svg())."""
    FIGS[fn.__name__] = fn
    return fn
