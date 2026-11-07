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

    def test_predict_option_symmetry_and_no_giveaways(self):
        root = Path(__file__).resolve().parents[1]
        giveaway_re = re.compile(r'(\(correct\)|\[correct\]|\(right answer\)|✓|✔)', re.I)
        count = 0
        for ch_path in sorted((root / 'src').glob('ch*.md')):
            txt = ch_path.read_text(encoding='utf-8')
            for m in re.finditer(r':::predict\s+([^\n]+)\n(.*?):::', txt, re.S):
                pid, body = m.group(1).strip(), m.group(2)
                self.assertIn('\n???\n', body, f'{ch_path.name}:{pid} missing ??? reveal separator')
                head, tail = body.split('\n???\n', 1)
                opts = [line.strip()[2:].strip() for line in head.splitlines() if line.strip().startswith('- ')]
                self.assertGreaterEqual(len(opts), 2, f'{ch_path.name}:{pid} needs at least 2 options')
                self.assertLessEqual(len(opts), 5, f'{ch_path.name}:{pid} has too many options')
                self.assertEqual(len(opts), len(set(opts)), f'{ch_path.name}:{pid} has duplicate options')
                self.assertTrue(tail.strip(), f'{ch_path.name}:{pid} has empty reveal explanation')
                for opt in opts:
                    self.assertIsNone(giveaway_re.search(opt), f'{ch_path.name}:{pid} option leaks answer marker: {opt}')
                count += 1
        self.assertGreaterEqual(count, 16)

    def test_learnharness_proposition_graph_and_practice_demands(self):
        from export_kymphysics_pack import build_proposition_graph, build_practice_demands, simplify_chains
        graph = build_proposition_graph()
        node_ids = {n['id'] for n in graph['nodes']}
        self.assertGreaterEqual(len(node_ids), 20)
        self.assertEqual(simplify_chains(graph['chains']), graph['chains'])
        for c in graph['chains']:
            self.assertIn(c['conclusion'], node_ids)
            for p in c['premises']:
                self.assertIn(p, node_ids)
        demands = build_practice_demands()
        self.assertGreaterEqual(len(demands), 6)
        for d in demands:
            self.assertIn(d['propositionId'], node_ids)
            self.assertIn(d['mode'], {'recall', 'discrimination', 'composition'})
            self.assertIn(d['modifier'], {'standard', 'reverse', 'probe_premises'})
            self.assertEqual(len(d['hintLadderR0ToR5']), 6)


if __name__ == '__main__':
    unittest.main()
