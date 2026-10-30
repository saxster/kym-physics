"""The build must reject missing evidence and include every alternative lazy widget."""
import html
import json
import re
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lesson_catalog import load_catalog, lesson_attributes, widgets_from_html


class CatalogTests(unittest.TestCase):
    def row(self):
        return dict(id='motor', widget='fieldslab', title='Turn a coil', chapter=13,
                    section='13.4', question='What reverses?', explanation='The force reverses.',
                    limits='Ideal coil.', sources=['https://example.org/physics'])

    def test_alternatives_load_their_widget_without_replacing_original(self):
        attrs = html.escape(lesson_attributes([self.row()]), quote=True)
        self.assertEqual(widgets_from_html(f'<figure data-live="field3d" data-labs="{attrs}">'),
                         ['field3d', 'fieldslab'])

    def test_connected_lessons_must_exist(self):
        with tempfile.TemporaryDirectory() as folder:
            row = self.row()
            row['connections'] = ['missing-investigation']
            (Path(folder) / 'catalog.json').write_text(json.dumps([row]))
            with self.assertRaisesRegex(ValueError, 'unknown connected lessons'):
                load_catalog(folder)

    def test_unsupported_or_duplicate_lessons_fail_the_build(self):
        with tempfile.TemporaryDirectory() as folder:
            p = Path(folder) / 'catalog.json'
            row = self.row()
            p.write_text(json.dumps([row, row]))
            with self.assertRaisesRegex(ValueError, 'duplicate'):
                load_catalog(folder)
            del row['sources']
            p.write_text(json.dumps([row]))
            with self.assertRaisesRegex(ValueError, 'sources'):
                load_catalog(folder)

    def test_book_coverage_preserves_every_accepted_obligation(self):
        root=Path(__file__).resolve().parents[2]
        plan=(root/'docs/threejs-implementation-plan.md').read_text()
        expected=set(re.findall(r'^\| ((?:C\d\d\.\d+|S\d\d|E\d\d)) \|',plan,re.M))
        coverage=json.loads((root/'docs/threejs-coverage.json').read_text())['coverage']
        self.assertEqual(set(coverage),expected)
        published={l['id'] for l in load_catalog(root/'source/lessons')}
        referenced={ident for row in coverage.values() for ident in row['lessons']}
        self.assertEqual(referenced,published)
        for ident,row in coverage.items():
            self.assertTrue(row['lessons'] or row.get('files') or row.get('mechanism'),ident)


if __name__ == '__main__':
    unittest.main()
