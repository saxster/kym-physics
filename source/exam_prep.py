"""Validated, original exam practice, rendered as a readable offline document first."""
import html
import json
import math
from pathlib import Path
import re

STAGES = {'recall': 'Recall', 'worked': 'Worked example', 'guided': 'Guided practice',
          'independent': 'Independent practice', 'transfer': 'A different setting',
          'review': 'Return after a delay', 'paper': 'Practice paper'}
KINDS = {'recall', 'explain', 'calculate', 'graph', 'investigate'}
ESC = lambda value: html.escape(str(value), quote=True)


def validate_exam(c):
    def require(condition, message):
        if not condition: raise ValueError('Exam catalog: ' + message)

    def text(value): return isinstance(value, str) and bool(value.strip())

    def ident(value): return text(value) and re.fullmatch(r'[a-z][a-z0-9-]*', value)

    def teaching(value):
        if not text(value) or not re.fullmatch(r'#s[0-9]+-[0-9]+', value): return False
        chapter, section = value[2:].split('-')
        source = Path(__file__).parent / 'src' / f'ch{int(chapter):02d}.md'
        return source.exists() and bool(re.search(r'^## '+re.escape(chapter+'.'+section)+r'\s', source.read_text(), re.M))

    def finite(value): return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)

    require(isinstance(c, dict) and c.get('version') == 1 and type(c.get('chapter')) is int and 0 <= c['chapter'] <= 15, 'unsupported version or chapter')
    require(text(c.get('title')) and text(c.get('scope')), 'title and scope are required')
    expected_key = f'chapter-{c["chapter"]:02d}'
    allowed_keys = {expected_key} | ({'motion'} if c['chapter'] == 1 else set()) | ({'mixed'} if c['chapter'] == 0 else set())
    require(c.get('key', expected_key) in allowed_keys, 'invalid chapter storage key')
    for key in ['objectives', 'cards', 'techniques', 'questions', 'papers', 'sources']:
        require(isinstance(c.get(key), list) and c[key], key + ' must be a nonempty list')
    for key in ['objectives', 'cards', 'questions', 'papers']:
        require(all(isinstance(x, dict) and ident(x.get('id')) for x in c[key]), key + ' needs valid IDs')
        require(len({x['id'] for x in c[key]}) == len(c[key]), 'duplicate ' + key + ' ID')
    objectives = {o['id'] for o in c['objectives']}
    for o in c['objectives']:
        require(text(o.get('label')) and text(o.get('note')) and teaching(o.get('teach')), 'incomplete objective ' + o['id'])
    questions = {q['id']: q for q in c['questions']}
    for q in c['questions']:
        name = q['id']
        for key in ['title', 'prompt', 'common']:
            require(text(q.get(key)), f'{name}: missing {key}')
        require(q.get('stage') in STAGES and q.get('kind') in KINDS, name + ': unknown stage or kind')
        require(isinstance(q.get('objectives'), list) and q['objectives'] and set(q['objectives']) <= objectives, name + ': unknown objectives')
        require(type(q.get('marks')) is int and q['marks'] > 0, name + ': invalid marks')
        for key in ['points', 'model', 'accepted']:
            require(isinstance(q.get(key), list) and q[key] and all(text(x) for x in q[key]), f'{name}: missing {key}')
        require(isinstance(q.get('hints'), list) and all(text(x) for x in q['hints']), name + ': invalid hints')
        require(len(q['points']) == q['marks'], name + ': one point is required for every mark')
        require(teaching(q.get('teach')), name + ': teaching destination is invalid')
        if 'numeric' in q:
            n = q['numeric']
            require(isinstance(n, dict) and finite(n.get('value')) and text(n.get('unit'))
                    and finite(n.get('tolerance')) and n['tolerance'] >= 0, name + ': invalid numeric answer')
        if 'data' in q:
            d = q['data']
            require(isinstance(d, dict) and isinstance(d.get('headers'), list) and len(d['headers']) >= 2
                    and all(text(x) for x in d['headers']) and isinstance(d.get('rows'), list) and d['rows'], name + ': invalid table')
            require(all(isinstance(row, list) and len(row) == len(d['headers'])
                        and all(text(x) or finite(x) for x in row) for row in d['rows']), name + ': invalid data row')
        if 'graph' in q:
            g = q['graph']
            require(isinstance(g, dict) and all(text(g.get(k)) for k in ['xLabel', 'yLabel', 'caption'])
                    and isinstance(g.get('points'), list) and len(g['points']) >= 2, name + ': incomplete graph')
            require(all(isinstance(p, list) and len(p) == 2 and all(finite(v) for v in p) for p in g['points']), name + ': invalid graph point')
            require(all(a[0] < b[0] for a, b in zip(g['points'], g['points'][1:])), name + ': graph horizontal coordinate must increase')
    used_paper_questions = set()
    for p in c['papers']:
        require(text(p.get('title')) and type(p.get('minutes')) is int and 0 < p['minutes'] <= 180, p['id'] + ': invalid paper')
        require(isinstance(p.get('questions'), list) and p['questions'] and len(set(p['questions'])) == len(p['questions']), p['id'] + ': invalid question list')
        require(all(q in questions and questions[q]['stage'] == 'paper' for q in p['questions']), p['id'] + ': unknown paper question')
        require(not used_paper_questions.intersection(p['questions']), 'papers must use different questions')
        used_paper_questions.update(p['questions'])
    require(used_paper_questions == {q['id'] for q in c['questions'] if q['stage'] == 'paper'}, 'unassigned paper question')
    for o in objectives:
        require(sum(o in q['objectives'] and q['stage'] in {'independent', 'transfer', 'review'} for q in c['questions']) >= 2,
                o + ': needs multiple independent questions')
    for card in c['cards']:
        require(all(text(card.get(k)) for k in ['term', 'definition', 'explanation', 'example', 'confusion', 'question', 'answer']), card['id'] + ': incomplete card')
        require(teaching(card.get('teach')) and card.get('questionId') in questions, card['id'] + ': missing practice link')
    for t in c['techniques']:
        require(isinstance(t, dict) and all(text(t.get(k)) for k in ['word', 'meaning', 'example']), 'incomplete exam technique')
    for s in c['sources']:
        require(isinstance(s, dict) and text(s.get('title')) and text(s.get('url'))
                and (s['url'].startswith('https://') or re.fullmatch(r'#ch(?:[0-9]|1[0-5])', s['url'])), 'invalid source')
    return c


def load_exam(path):
    catalog = validate_exam(json.loads(Path(path).read_text(encoding='utf-8')))
    match = re.fullmatch(r'ch([0-9]{2})\.json', Path(path).name)
    if match and (catalog['chapter'] != int(match.group(1)) or catalog.get('key', f'chapter-{int(match.group(1)):02d}') == 'mixed'):
        raise ValueError('Exam catalog: chapter filename does not match its identity')
    return catalog


def runtime_exam(c):
    """Keep narrative, diagrams and solutions in HTML rather than serialising them twice."""
    if not c: return None
    fields = {'id', 'title', 'stage', 'objectives', 'kind', 'marks', 'points', 'hints', 'teach', 'numeric'}
    return {'version': c['version'], 'chapter': c['chapter'], 'title': c['title'], 'key': c.get('key', 'motion' if c['chapter'] == 1 else f'chapter-{c["chapter"]:02d}'), 'objectives': c['objectives'],
            'papers': c['papers'], 'questions': [{k: v for k, v in q.items() if k in fields} for q in c['questions']]}


def graph_html(q):
    g = q['graph']
    xs, ys = zip(*g['points'])
    def axis(values):
        low, high = min(0, min(values)), max(0, max(values))
        rough = (high-low or 1)/4
        decade = 10**math.floor(math.log10(rough))
        step = next(v*decade for v in [1, 2, 2.5, 5, 10] if v*decade >= rough)
        low, high = math.floor(low/step)*step, math.ceil(high/step)*step
        if high == low: high = low+step
        ticks = [low+i*step for i in range(round((high-low)/step)+1)]
        return low, high, ticks
    xmin, xmax, xticks = axis(xs)
    ymin, ymax, yticks = axis(ys)
    x = lambda v: 78 + (v-xmin)/(xmax-xmin)*330
    y = lambda v: 205 - (v-ymin)/(ymax-ymin)*160
    title_id = 'exam-graph-' + q['id']
    # At a 288 px reading width, 20-unit type remains 12 px tall.
    svg = [f'<svg class="exam-graph" viewBox="0 0 480 300" role="img" aria-labelledby="{title_id}">',
           f'<title id="{title_id}">{ESC(g["caption"])}</title>',
           '<g fill="none" stroke="currentColor" stroke-width="1">']
    for tick in xticks: svg.append(f'<path opacity=".18" d="M{x(tick):.2f} 45V205"/>')
    for tick in yticks: svg.append(f'<path opacity=".18" d="M78 {y(tick):.2f}H408"/>')
    svg.append('<path d="M78 45V205H408"/></g><g fill="currentColor" font-size="20" font-family="sans-serif">')
    for tick in xticks: svg.append(f'<text x="{x(tick):.2f}" y="232" text-anchor="middle">{tick:.3g}</text>')
    for tick in yticks: svg.append(f'<text x="66" y="{y(tick)+7:.2f}" text-anchor="end">{tick:.3g}</text>')
    svg.append(f'<text x="243" y="278" text-anchor="middle">{ESC(g["xLabel"])}</text>'
               f'<text x="23" y="135" text-anchor="middle" transform="rotate(-90 23 135)">{ESC(g["yLabel"])}</text></g>')
    points = ' '.join(f'{x(a):.2f},{y(b):.2f}' for a, b in g['points'])
    svg.append(f'<polyline points="{points}" fill="none" stroke="currentColor" stroke-width="3"/>')
    for a, b in g['points']:
        svg.append(f'<circle cx="{x(a):.2f}" cy="{y(b):.2f}" r="4" fill="currentColor"/>')
    svg.append('</svg>')
    # Every graph has a text/table equivalent, including graphs with no separately supplied table.
    table = table_html({'headers': [g['xLabel'], g['yLabel']], 'rows': g['points']}) if 'data' not in q else ''
    return '<figure class="exam-figure">' + ''.join(svg) + f'<figcaption>{ESC(g["caption"])}</figcaption></figure>' + table


def table_html(data):
    heads = ''.join(f'<th scope="col">{ESC(v)}</th>' for v in data['headers'])
    rows = ''.join('<tr>' + ''.join(f'<td>{ESC(v)}</td>' for v in row) + '</tr>' for row in data['rows'])
    return f'<div class="exam-table-wrap"><table><caption>Supplied practice data</caption><thead><tr>{heads}</tr></thead><tbody>{rows}</tbody></table></div>'


def question_html(q, paper=False):
    h = 'h5' if paper else 'h4'
    sub = 'h6' if paper else 'h5'
    meta = f'{STAGES[q["stage"]]} · {q["marks"]} suggested mark' + ('s' if q['marks'] != 1 else '')
    model = ''.join(f'<li>{ESC(v)}</li>' for v in q['model'])
    points = ''.join(f'<li data-point="{i}">{ESC(v)} <span class="exam-one-mark">[1]</span></li>' for i, v in enumerate(q['points']))
    scaffold = f'<p class="exam-scaffold">{ESC(q["scaffold"])}</p>' if q.get('scaffold') else ''
    return (f'<article class="exam-question" id="exam-q-{q["id"]}" data-qid="{q["id"]}" data-stage="{q["stage"]}">'
            f'<{h}>{ESC(q["title"])}</{h}><p class="exam-meta">{ESC(meta)}</p><p class="exam-prompt">{ESC(q["prompt"])}</p>'
            + (table_html(q['data']) if 'data' in q else '') + (graph_html(q) if 'graph' in q else '') + scaffold
            + '<div class="exam-response-ui"></div><div class="exam-print-working"></div>'
            + '<details class="exam-solution"><summary>Model answer and marking guidance</summary>'
            f'<p>Original question; the book’s suggested marking guidance. Equivalent scientifically correct wording is welcome.</p>'
            f'<ol class="exam-model">{model}</ol><{sub}>Why these points earn credit</{sub}><ol class="exam-markpoints">{points}</ol>'
            f'<p class="exam-accepted">{" ".join(ESC(v) for v in q["accepted"])}</p>'
            f'<p class="exam-common"><strong>A common difficulty:</strong> {ESC(q["common"])}</p>'
            f'<p><a href="{q["teach"]}">Return to the explanation</a></p></details></article>')


def render_exam(c):
    by_id = {q['id']: q for q in c['questions']}
    out = ['<section class="flow exam-prep" id="exam-prep"><h2>Prepare for my exam</h2>'
           f'<p class="exam-intro">{ESC(c["title"])} · Begin with one idea, write an answer, then compare your reasoning. '
           f'<a href="#ch{c["chapter"]}">Return to the story in Chapter {c["chapter"]}</a> whenever you need it.</p>',
           f'<p class="exam-scope">{ESC(c["scope"])}</p><p><a href="#exam-directory">Choose another chapter or a mixed review</a></p>',
           '<nav class="exam-nav" aria-label="Chapter preparation">'
           '<a href="#exam-motion-objectives">Choose my objectives</a><a href="#exam-motion-daily">Practice today</a>'
           '<a href="#exam-motion-practice">Questions</a><a href="#exam-motion-cards">Words and memory</a>'
           '<a href="#exam-motion-technique">Answering well</a><a href="#exam-motion-papers">Practice papers</a></nav>'
           '<p id="exam-motion-status" role="status">Your answers and self-assessed marks can stay in this browser. '
           'Without JavaScript, use the questions and folded answers below, and keep your work on paper.</p>'
           '<section id="exam-motion-objectives"><h3>What I’m practising</h3>'
           '<p>Choose the objectives in your school’s topic list. Your choices control what returns in your review queue; '
           'every explanation remains available.</p><ol class="exam-objectives">']
    for o in c['objectives']:
        first = next(q for q in c['questions'] if o['id'] in q['objectives'] and q['stage'] in {'independent', 'transfer', 'review'})
        out.append(f'<li data-objective="{o["id"]}" id="exam-objective-{o["id"]}"><strong>{ESC(o["label"])}</strong>'
                   f'<p>{ESC(o["note"])}</p><p><a href="{o["teach"]}">Read the explanation</a> · '
                   f'<a href="#exam-q-{first["id"]}">Try a question</a></p><p class="exam-objective-status">Not yet practised</p></li>')
    out += ['</ol></section><section id="exam-motion-daily"><h3>Practice today</h3>'
            '<p>Recall an old idea, work through one example, then answer a fresh question. Return tomorrow, after a few days, and again in later weeks. '
            'When scripts are enabled, your marked attempts help choose the next questions.</p></section>'
            f'<section id="exam-motion-practice"><h3>{ESC(c["title"])} practice</h3><p>All numbers and datasets in these questions are supplied for practice. '
            'Work through an example, complete a guided question, then try an independent question. '
            'For drawing tasks, use paper and describe or note your drawing in the answer space.</p><div id="exam-motion-filters"></div>']
    out.extend(question_html(q) for q in c['questions'] if q['stage'] != 'paper')
    out.append('</section><section id="exam-motion-cards" class="exam-revision"><h3>Words and memory</h3>'
               '<p>Try each question from memory before opening its explanation. A memory cue helps you recall a meaning; '
               'check that you can also use the idea in a new question.</p>')
    for card in c['cards']:
        exposures = ' '.join(q['id'] for q in c['questions'] if len(q['prompt']) > 25 and q['prompt'] in card['example'])
        out.append(f'<article class="exam-word" id="exam-word-{card["id"]}"><h4>{ESC(card["term"])}</h4>'
                   f'<p>{ESC(card["question"])}</p><details data-example-questions="{ESC(exposures)}"><summary>Meaning, example and memory</summary>'
                   f'<p><strong>{ESC(card["definition"])}</strong></p><p>{ESC(card["explanation"])}</p>')
        for key, label in [('formula', 'Equation'), ('unit', 'Unit'), ('example', 'Example'), ('confusion', 'Keep these apart'), ('cue', 'Memory cue'), ('answer', 'Check your recall')]:
            if card.get(key): out.append(f'<p><strong>{label}:</strong> {ESC(card[key])}</p>')
        out.append(f'<p><a href="{card["teach"]}">Read the explanation</a> · <a href="#exam-q-{card["questionId"]}">Use it in a question</a></p></details></article>')
    out.append('</section><section id="exam-motion-technique"><h3>Answering well</h3>'
               '<p>Read the command word, choose the relevant physics, and make your reasoning visible. '
               'Check units and whether your answer is a sensible size. Use your school’s instructions for rounding and permitted equipment.</p><dl>')
    for t in c['techniques']:
        out.append(f'<dt>{ESC(t["word"])}</dt><dd>{ESC(t["meaning"])}<p>{ESC(t["example"])}</p></dd>')
    out.append('</dl><p>For calculations: write the relationship, use compatible units, substitute, calculate, then check the unit and size. '
               'For investigations: name the measured quantities and controls, describe repeats, and connect the conclusion to the evidence. '
               'A useful normal study session has a little recall, a short reading, a few independent questions and one corrected mistake.</p></section>'
               '<section id="exam-motion-papers"><h3>Practice papers</h3><p>Two different practice papers, each with optional timing. '
               'These original practice papers are not official Cambridge papers and do not prescribe your school’s exam format. '
               'Keep answers covered until you finish. If drawing on paper, keep it beside your written answers.</p>')
    for p in c['papers']:
        marks = sum(by_id[q]['marks'] for q in p['questions'])
        out.append(f'<details class="exam-paper" data-paperid="{p["id"]}" id="exam-paper-{p["id"]}"><summary>{ESC(p["title"])}</summary>'
                   f'<h4>{ESC(p["title"])}</h4><p>{marks} suggested marks · optional {p["minutes"]}-minute practice.</p>'
                   '<div class="exam-paper-ui"></div>')
        out.extend(question_html(by_id[q], paper=True) for q in p['questions'])
        out.append('</details>')
    out.append('</section><section id="exam-motion-tools"><h3>Keep or print my work</h3>'
               '<p>Keep answers in your notebook. With scripts enabled you can export your marked attempts, print separate question and answer sheets, '
               'and include exam work in the book’s notebook backups.</p></section>'
               '<details class="exam-sources"><summary>Where this preparation comes from</summary>'
               '<p>Original questions, explanations and illustrative datasets grounded in the chapter’s physics sources. '
               'Self-marking is practice evidence, not an externally verified grade. Different questions answered without help on separate days '
               'give more useful evidence than recognising a solution you have already seen.</p><ul>')
    out.extend(f'<li><a href="{ESC(s["url"])}">{ESC(s["title"])}</a></li>' for s in c['sources'])
    out.append('</ul></details>')
    credited = set()
    for source in c['sources']:
        match = re.match(r'https://openstax.org/books/[^/]+', source['url'])
        if match and match.group(0) not in credited:
            credited.add(match.group(0))
            out.append(f'<p class="ch-credit">Access for free at <a href="{ESC(source["url"])}">{ESC(source["title"])}</a>. Original practice material · CC BY-NC-SA 4.0.</p>')
    out.append('</section>')
    return ''.join(out)
