"""Validated lesson metadata; shared build and audit boundary, no browser dependencies."""
from pathlib import Path
import json
import re
import math


def load_catalog(folder):
    lessons = []
    seen = set()
    for path in sorted(Path(folder).glob('*.json')):
        rows = json.loads(path.read_text())
        if isinstance(rows, dict):
            rows = rows.get('lessons', [])
        if not isinstance(rows, list):
            raise ValueError(f'{path}: expected a lesson list')
        for row in rows:
            for key in ('id', 'widget', 'title', 'chapter', 'question', 'explanation', 'limits', 'sources'):
                if key not in row or row[key] in ('', None, []):
                    raise ValueError(f'{path}: lesson {row.get("id")!r} needs {key}')
            if not re.fullmatch(r'[a-z][a-z0-9-]*', row['id']):
                raise ValueError(f'{path}: invalid lesson id {row["id"]!r}')
            if row['id'] in seen:
                raise ValueError(f'duplicate lesson id {row["id"]}')
            if not row.get('figure') and not row.get('section'):
                raise ValueError(f'lesson {row["id"]}: needs a figure or section placement')
            if not isinstance(row['sources'], list) or not all(isinstance(u, str) and u.startswith('https://') for u in row['sources']):
                raise ValueError(f'lesson {row["id"]}: sources must be HTTPS URLs')
            if row['widget'] == 'investigations':
                for key in ('renderer', 'object', 'materials', 'minutes', 'preparation', 'encounter', 'procedure', 'derivation', 'worked', 'challenge', 'observations'):
                    if not row.get(key):
                        raise ValueError(f'lesson {row["id"]}: investigation needs {key}')
                for key in ('procedure', 'derivation'):
                    if not isinstance(row[key], list) or not all(isinstance(s, str) and s.strip() for s in row[key]):
                        raise ValueError(f'lesson {row["id"]}: {key} must be nonempty steps')
                spec = row['observations']
                if not isinstance(spec, dict) or not all(isinstance(spec.get(k), str) and spec[k] for k in ('x', 'y', 'xUnit', 'yUnit')):
                    raise ValueError(f'lesson {row["id"]}: observation labels and units required')
                if not isinstance(spec.get('samples'), list) or not all(isinstance(pair, list) and len(pair) == 2 and all(isinstance(n, (int, float)) and math.isfinite(n) for n in pair) for pair in spec['samples']):
                    raise ValueError(f'lesson {row["id"]}: invalid supplied samples')
            seen.add(row['id'])
            lessons.append(row)
    for row in lessons:
        unknown = set(row.get('connections', [])) - seen
        if unknown:
            raise ValueError(f'lesson {row["id"]}: unknown connected lessons {sorted(unknown)}')
    return lessons


def lesson_attributes(lessons):
    return json.dumps([{'id': r['id'], 'widget': r['widget'], 'title': r['title']}
                       for r in lessons], ensure_ascii=False, separators=(',', ':'))


def widgets_from_html(body):
    from html import unescape
    names = set(re.findall(r'data-live="([\w-]+)"', body))
    for data in re.findall(r'data-labs="([^"]+)"', body):
        names.update(r['widget'] for r in json.loads(unescape(data)))
    return sorted(names)
