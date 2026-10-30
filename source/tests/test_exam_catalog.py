"""Exam content must be complete, internally consistent and safe to publish."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from exam_prep import load_exam, validate_exam, render_exam


class ExamCatalogTests(unittest.TestCase):
    def setUp(self):
        self.catalog = load_exam(ROOT / 'exams/motion.json')

    def test_pilot_has_all_stages_and_two_different_papers(self):
        c = self.catalog
        self.assertEqual(len(c['questions']), 42)
        self.assertEqual(len(c['objectives']), 8)
        self.assertEqual({q['stage'] for q in c['questions']}, {'recall', 'worked', 'guided', 'independent', 'transfer', 'review', 'paper'})
        self.assertEqual(len(c['papers']), 2)
        self.assertFalse(set(c['papers'][0]['questions']) & set(c['papers'][1]['questions']))
        for o in c['objectives']:
            independent = [q for q in c['questions'] if o['id'] in q['objectives'] and q['stage'] in ['independent', 'transfer', 'review']]
            self.assertGreaterEqual(len(independent), 2, o['id'])

    def test_bad_marks_references_and_duplicate_ids_fail_before_publishing(self):
        changes = [lambda c: c['questions'][0].update(marks=99),
                   lambda c: c['questions'][1].update(id=c['questions'][0]['id']),
                   lambda c: c['questions'][0].update(objectives=['missing']),
                   lambda c: c['papers'][0]['questions'].append('missing'),
                   lambda c: c['cards'][0].update(questionId='missing'),
                   lambda c: c['questions'][0].update(teach='#missing')]
        for change in changes:
            with self.subTest(change=change):
                bad = copy.deepcopy(self.catalog)
                change(bad)
                with self.assertRaises(ValueError): validate_exam(bad)

    def test_numerical_and_graph_specs_cannot_silently_accept_invalid_data(self):
        for bad in [dict(value=float('nan'), unit='m/s', tolerance=0), dict(value=2, unit='m/s', tolerance=-1)]:
            c = copy.deepcopy(self.catalog)
            c['questions'][0]['numeric'] = bad
            with self.assertRaises(ValueError): validate_exam(c)
        c = copy.deepcopy(self.catalog)
        c['questions'][0]['graph'] = dict(points=[[2, 3], [1, 4]], xLabel='Time (s)', yLabel='Speed (m/s)', caption='Illustrative')
        with self.assertRaises(ValueError): validate_exam(c)

    def test_static_fallback_contains_questions_answers_graphs_and_original_marking_notice(self):
        html = render_exam(self.catalog)
        self.assertIn('id="exam-prep"', html)
        self.assertEqual(html.count('class="exam-question"'), 42)
        self.assertIn('suggested marking guidance', html)
        self.assertIn('<svg', html)
        self.assertIn('scope="col"', html)
        self.assertIn('class="exam-print-working"', html)
        self.assertIn('id="exam-motion-cards"', html)

    def test_catalog_text_is_escaped_even_in_static_model_answers(self):
        c = copy.deepcopy(self.catalog)
        c['questions'][0]['prompt'] = '<script>bad()</script>'
        self.assertIn('&lt;script&gt;bad()', render_exam(c))
        self.assertNotIn('<script>bad()', render_exam(c))


if __name__ == '__main__':
    unittest.main()
