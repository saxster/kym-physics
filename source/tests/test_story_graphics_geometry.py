#!/usr/bin/env python3
"""Check the physical geometry behind the corrected story figures."""
from html.parser import HTMLParser
import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from figs_stories_tales import s_eclipse_bend, s_foucault_turn, s_mpemba_curves, s_tram_field
from figs_stories_sky import s_moon_falls


class Shapes(HTMLParser):
    def __init__(self, svg):
        super().__init__()
        self.nodes = []
        self.feed(svg)

    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))

    def matching(self, tag, cls):
        return [attrs for name, attrs in self.nodes if name == tag and attrs.get('class') == cls]


def point(attrs, suffix):
    return float(attrs['x' + suffix]), float(attrs['y' + suffix])


# The apparent star must lie on the extension of the actual arriving ray,
# on the side farther from the Sun. This geometric constraint is independent
# of the amount by which the tiny real deflection is enlarged for the page.
eclipse = Shapes(s_eclipse_bend())
incoming, arriving = eclipse.matching('line', 'ray')
projection, = eclipse.matching('line', 'ln dash')
gx, gy = point(arriving, '1')
tx, ty = point(arriving, '2')
ax, ay = point(projection, '1')
px, py = point(projection, '2')
assert math.hypot(px - gx, py - gy) < 0.11
assert abs((tx - gx) * (ay - gy) - (ty - gy) * (ax - gx)) / math.hypot(tx - gx, ty - gy) < 0.11
assert ax < gx < tx and ay < float(incoming['y1'])
assert (ty - gy) / (tx - gx) > (float(incoming['y2']) - float(incoming['y1'])) / (float(incoming['x2']) - float(incoming['x1']))

# Foucault precession is Omega*sin(latitude): each drawn red track must be
# that angular speed times the explicitly labelled 4.2 h, with no extra gain.
foucault_svg = s_foucault_turn()
foucault = Shapes(foucault_svg)
tracks = foucault.matching('line', 'ln p')
assert len(tracks) == 4
for line, latitude in zip(tracks, (90, 48.9, 19.1, 0)):
    dx = float(line['x2']) - float(line['x1'])
    dy = float(line['y2']) - float(line['y1'])
    drawn = math.degrees(math.atan2(abs(dx), abs(dy)))
    expected = 15 * math.sin(math.radians(latitude)) * 4.2
    assert abs(drawn - expected) < 0.15, (drawn, expected)
assert 'after 4.2 hours' in foucault_svg

# The 500 nT / 38,400 nT comparison is a field ratio, not a 1.3-degree
# compass rotation. A perpendicular perturbation gives arctan(B/B_Earth).
tram_svg = s_tram_field()
tram = Shapes(tram_svg)
mu0 = 4 * math.pi * 1e-7
field_nt = mu0 * 500 / (2 * math.pi * 200) * 1e9
assert abs(field_nt - 500) < 1e-9
actual_angle = math.degrees(math.atan(field_nt / 38400))
assert abs(actual_angle - 0.746) < 0.001
needle, = [line for line in tram.matching('line', 'ln p') if float(line['y1']) > float(line['y2'])]
drawn = math.degrees(math.atan2(float(needle['x2']) - float(needle['x1']), float(needle['y1']) - float(needle['y2'])))
assert abs(drawn - 30 * actual_angle) < 0.15
assert 'needle angle ×30' in tram_svg and '≈ 0.75°' in tram_svg
rings = tram.matching('circle', 'ln e')
assert len(rings) == 3 and len({(ring['cx'], ring['cy']) for ring in rings}) == 1
assert 'plane perpendicular to the wire' in tram_svg

# Equal 4.9 m departures over 1 s and 60 s correspond to a 1/60²
# acceleration ratio. It is not a claim about the Moon's orbital speed.
moon_svg = s_moon_falls()
assert 60 ** 2 == 3600
assert '1/3,600 of the acceleration' in moon_svg and 'gap enlarged' in moon_svg
assert 'times more slowly' not in moon_svg
assert 'not freezing solid' in s_mpemba_curves()
print('Story graphics: ray back-projection, Foucault angles, wire-field geometry and compass deflection pass')
