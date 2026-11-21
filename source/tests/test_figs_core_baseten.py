#!/usr/bin/env python3
"""Supplemental verification tests for Baseten registration_frame, stipple_band, callout_box, and md_export."""
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs_core import DEFS, Fig  # noqa: E402
import md_export  # noqa: E402


def test_baseten_figure_primitives():
    assert 'id="pat-stipple"' in DEFS
    cases = {
        'registration_frame': lambda f: f.registration_frame(),
        'stipple_band': lambda f: f.stipple_band(20, 40, 200, 60, 'substrate'),
        'callout_box': lambda f: f.callout_box(20, 40, 140, 32, 'F = m a'),
    }
    for name, draw in cases.items():
        f = Fig(400, 260, name)
        draw(f)
        svg = f.svg()
        assert f.parts, f'{name}: drew nothing'
        hexes = re.findall(r'(?<!url\()#[0-9a-fA-F]{3,6}\b', svg)
        assert not hexes, f'{name}: raw colours {hexes}'
        for size in re.findall(r'font-size="([\d.]+)"', svg):
            assert float(size) >= 12, f'{name}: text at {size} px'


def test_markdown_tree_export():
    with tempfile.TemporaryDirectory() as d:
        ch = type(
            'C',
            (),
            {
                'n': 1,
                'title': 'Describing Motion',
                'short': 'Motion',
                'question': 'How can two observers disagree on speed?',
                'intro_src': 'Uniform motion stays unchanged.',
                'sections': [('1.1', 'Frames', 'Choose a fixed stake first.')],
                'vol': 1,
            },
        )()
        md_export.export_markdown_tree(d, 'The Moving World', 'Physics', 'https://example.org', 'desc', [ch])
        assert os.path.exists(os.path.join(d, 'llms.txt'))
        assert os.path.exists(os.path.join(d, 'book', 'overview.md'))
        assert os.path.exists(os.path.join(d, 'llms-full.txt'))


if __name__ == '__main__':
    test_baseten_figure_primitives()
    test_markdown_tree_export()
    print('supplemental Baseten figure + markdown tests PASS')
