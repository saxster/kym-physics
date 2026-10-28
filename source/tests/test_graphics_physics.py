#!/usr/bin/env python3
"""Check scientific relationships in the exported SVG geometry.

These are independent physical expectations, not screenshot snapshots:
pressure crests coincide with compression, and faster water jets do not
necessarily travel farthest before reaching the same floor.
"""
import math
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from figs_ch06 import c6_tank
from figs_ch09 import c9_compressions


def points(path):
    return [tuple(map(float, pair)) for pair in re.findall(r'([-\d.]+),([-\d.]+)', path.attrib['d'])]


def svg_elements(svg, tag):
    return ET.fromstring(svg).findall(f'.//{{http://www.w3.org/2000/svg}}{tag}')


# The tank's surface is 2 m above its common ground, with 100 SVG units/m.
# Bernoulli gives v²=2gd; projectile flight gives drop=g t²/2.
jets = [path for path in svg_elements(c6_tank(), 'path')
        if 'water-jet' in path.attrib.get('class', '').split()]
assert len(jets) == 3
ranges = {}
for jet in jets:
    depth = float(jet.attrib['data-depth'])
    pts = points(jet)
    origin_x, origin_y = pts[0]
    assert math.isclose(origin_y, 70 + 100 * depth, abs_tol=0.01)
    assert math.isclose(pts[-1][1], 270, abs_tol=0.01)
    for x, y in pts:
        horizontal_m = (x - origin_x) / 100
        expected_drop = horizontal_m ** 2 / (4 * depth)
        assert math.isclose((y - origin_y) / 100, expected_drop, abs_tol=0.0002)
    ranges[depth] = (pts[-1][0] - origin_x) / 100
    assert math.isclose(ranges[depth], 2 * math.sqrt(depth * (2 - depth)), abs_tol=0.0001)
assert ranges[1.0] > ranges[0.5]
assert ranges[1.0] > ranges[1.5]
assert math.isclose(ranges[0.5], ranges[1.5], abs_tol=0.0001)
print('water jets: Bernoulli speed, ballistic paths and common-floor ranges agree')


# The drawing displaces particles by +11 sin(2π(x−100)/150).
# Their compression maxima are x=175,325,475. Pressure must peak there.
paths = svg_elements(c9_compressions(), 'path')
wave = next(path for path in paths if path.attrib.get('class') == 'ln e')
curve = points(wave)
for compression_x in (175, 325, 475):
    _, peak_y = min(curve, key=lambda point: abs(point[0] - compression_x))
    assert math.isclose(peak_y, 265 - 24, abs_tol=0.1), (compression_x, peak_y)
for rarefaction_x in (100, 250, 400, 550):
    _, trough_y = min(curve, key=lambda point: abs(point[0] - rarefaction_x))
    assert math.isclose(trough_y, 265 + 24, abs_tol=0.1), (rarefaction_x, trough_y)
print('sound: pressure maxima align with particle compressions; minima with rarefactions')

# Interference paths must start at both actual sources, reach a shared point,
# and match the bright/dark condition rather than coming from a fictitious midpoint.
from figs_ch11 import c11_young
paths = [e for e in svg_elements(c11_young(),'line') if e.attrib.get('x1')=='95']
assert len(paths)==4
for pair,expected in ((paths[:2],0),(paths[2:],7)):
    a,b=pair
    assert a.attrib['x2']==b.attrib['x2'] and a.attrib['y2']==b.attrib['y2']
    lengths=[math.hypot(float(e.attrib['x2'])-float(e.attrib['x1']),float(e.attrib['y2'])-float(e.attrib['y1'])) for e in pair]
    assert math.isclose(abs(lengths[1]-lengths[0]),expected,abs_tol=.02)
print('Young: true source paths agree with zero and half-wavelength interference')

# Two rays from each tree point must converge on one inverted image point,
# and the rays must pass through the pupil instead of the opaque iris.
from figs_ch10 import c10_eye
rays=svg_elements(c10_eye(),'line')
for colour in ('light-blue','light-red'):
    group=[e for e in rays if e.attrib.get('class')=='ray '+colour]
    final=[e for e in group if e.attrib['x2']=='500']
    assert len(final)==2 and final[0].attrib['y2']==final[1].attrib['y2']
    source=next(e for e in group if e.attrib['x1']=='55')
    assert (float(source.attrib['y1'])-173)*(float(final[0].attrib['y2'])-173)<0
    for e in group:
        if e.attrib['x1']=='288':
            y=float(e.attrib['y1'])+(310-288)/(325-288)*(float(e.attrib['y2'])-float(e.attrib['y1']))
            assert 134.5<y<211.5
print('Eye: two points focus inverted and all model rays clear the pupil')
