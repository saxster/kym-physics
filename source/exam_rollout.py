"""Compose cumulative practice from already reviewed chapter questions."""
from copy import deepcopy
from html import escape
from itertools import zip_longest


def create_mixed(catalogs):
    if len(catalogs) < 2:
        return None
    groups, papers, objectives, cards, sources = [], [[], []], [], [], {}
    for catalog in catalogs:
        by_id = {q['id']: q for q in catalog['questions']}
        selected = {}
        for objective in catalog['objectives']:
            objectives.append(deepcopy(objective))
            candidates = [q for q in catalog['questions'] if objective['id'] in q['objectives'] and q['stage'] in {'independent', 'transfer', 'review'}]
            for q in candidates[:2]: selected[q['id']] = deepcopy(q)
        for stage in ['recall', 'worked', 'guided']:
            q = next((q for q in catalog['questions'] if q['stage'] == stage), None)
            if q: selected[q['id']] = deepcopy(q)
        for card in catalog['cards']:
            cards.append(deepcopy(card))
            q = by_id[card['questionId']]
            if q['stage'] != 'paper': selected[q['id']] = deepcopy(q)
        groups.append(list(selected.values()))
        for i in range(2):
            paper = catalog['papers'][i % len(catalog['papers'])]
            q = deepcopy(by_id[paper['questions'][0]])
            papers[i].append(q)
        for source in catalog['sources']: sources[source['url']] = deepcopy(source)
    questions = [q for row in zip_longest(*groups) for q in row if q]
    used = {q['id'] for q in questions}
    mixed_papers = []
    for i, group in enumerate(papers):
        for q in group:
            if q['id'] in used: raise ValueError('Repeated cumulative paper question: '+q['id'])
            used.add(q['id']); questions.append(q)
        mixed_papers.append({'id': f'mixed-paper-{i+1}', 'title': f'Mixed practice paper {i+1}', 'minutes': 60, 'questions': [q['id'] for q in group]})
    return {'version': 1, 'chapter': 0, 'key': 'mixed', 'title': 'Mixed revision',
            'scope': 'Choose topics from your school’s list. This mixed practice brings ideas from different chapters together. These are original practice questions, with suggested self-marking guidance and optional timing; your school determines the actual exam format.',
            'objectives': objectives, 'cards': cards, 'questions': questions, 'papers': mixed_papers,
            'techniques': deepcopy(catalogs[0]['techniques']), 'sources': list(sources.values())}


def render_study_plan(catalogs):
    rows = []
    for i in range(0, len(catalogs), 2):
        pair = catalogs[i:i+2]
        links = ' and '.join(f'<a href="exams/ch{c["chapter"]:02d}.html#exam-prep">{escape(c["title"])}</a>' if c['chapter'] != 1 else '<a href="#exam-motion-objectives">Describing motion</a>' for c in pair)
        rows.append(f'<li><strong>Session {i//2+1}:</strong> {links}. Recall an earlier idea, try a fresh question from each topic, then mark and repair your answers.</li>')
    return ('<section id="exam-study-plan"><h3>A plan for the weeks before your exam</h3>'
            '<p>Match the chapter choices to your school’s topic list. Spread these sessions over the weeks you have; a short session is enough. Begin each session with the reviews due on the chapter pages.</p><ol>' + ''.join(rows) +
            '<li>Return to the earliest topics after a delay. Use different questions and explain why each method applies.</li>'
            '<li>Try a mixed practice paper, with or without timing. Mark your first answers, identify your two most useful repairs, and practise those ideas again.</li></ol>'
            '<p>Keep revisiting successful topics after longer gaps. On the final day, recall equations with their meanings and units, draw a few key diagrams, and review the errors you have corrected. Use your school’s actual paper instructions for equipment and timing.</p></section>')
