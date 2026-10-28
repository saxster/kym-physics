#!/usr/bin/env python3
"""Quick self-test for the figure helpers in figs_core.py: each one renders, uses theme classes rather than raw
colours, and keeps text at 12 px or more.   python3 tests/test_figs_core.py"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs_core import Fig  # noqa: E402

CASES = {
    'force': lambda f: f.force(100, 100, 0, 60, 'weight 9.8 N'),
    'vector': lambda f: f.vector(100, 100, 80, 0, 'v = 3 m/s'),
    'axis': lambda f: f.axis(60, 200, 300, 150, 'time (s)', 'speed (m/s)', ticks={'x': [(100, '1')], 'y': [(50, '2')]}),
    'ray': lambda f: f.ray(20, 20, 300, 120, chevrons=2),
    'wave': lambda f: f.wave(20, 100, 300, 20, 80),
    'spring': lambda f: f.spring(50, 20, 50, 200, coils=6),
    'ground': lambda f: f.ground(20, 200, 300),
    'mass_block': lambda f: f.mass_block(100, 100, 80, 50, '2 kg'),
    'arrow': lambda f: f.arrow(10, 10, 100, 10, 'ink'),
}
bad = []
for name, draw in CASES.items():
    f = Fig(400, 260, name)
    draw(f)
    svg = f.svg()
    if not f.parts:
        bad.append(f'{name}: drew nothing')
    hexes = re.findall(r'(?<!url\()#[0-9a-fA-F]{3,6}\b', svg)
    if hexes:
        bad.append(f'{name}: raw colours {hexes}')
    for size in re.findall(r'font-size="([\d.]+)"', svg):
        if float(size) < 12:
            bad.append(f'{name}: text at {size} px')
    for m in re.findall(r'url\(#(ah-[\w-]+)\)', svg):
        from figs_core import DEFS
        if f'id="{m}"' not in DEFS:
            bad.append(f'{name}: marker {m} is not defined in DEFS')
    print(f'{name:<11} ok' if not any(b.startswith(name + ':') for b in bad) else f'{name:<11} FAIL')
if bad:
    print('\n'.join(bad)); sys.exit(1)
print('all figure helpers ok')
