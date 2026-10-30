"""Integrity of the complete published reading surface and its offline typography."""
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unittest

SITE = Path(__file__).resolve().parents[1] / 'build/site'

class Anchors(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links = [], []
    def handle_starttag(self, _, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if attrs.get('href', '').startswith('#'): self.links.append(attrs['href'][1:])

class ReaderBuild(unittest.TestCase):
    def test_every_internal_link_has_one_destination(self):
        parser = Anchors()
        parser.feed((SITE/'index.html').read_text())
        self.assertEqual(set(parser.links)-set(parser.ids)-{''}, set())
        self.assertEqual([key for key, count in Counter(parser.ids).items() if count > 1], [])

    def test_reading_budget_and_no_leaked_authoring_fences(self):
        data = (SITE/'index.html').read_bytes()
        self.assertLess(len(data), 4*1024*1024)
        self.assertIsNone(re.search(rb'<p>\s*:::', data))

    def test_every_font_is_available_offline(self):
        page = (SITE/'index.html').read_text()
        files = json.loads(re.search(r'const FILES = (.*?);', (SITE/'sw.js').read_text()).group(1))
        fonts = set(re.findall(r'url\((assets/fonts/[^)]+)\)', page))
        self.assertTrue(fonts)
        self.assertEqual({str(p.relative_to(SITE)) for p in (SITE/'assets/fonts').glob('*.woff2')}, fonts)
        for font in fonts:
            self.assertTrue((SITE/font).is_file(), font)
            self.assertIn('./'+font, files)

if __name__ == '__main__':
    unittest.main()
