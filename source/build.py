#!/usr/bin/env python3
"""Build The Moving World.

    python3 build.py                       # -> build/The-Moving-World.html (one self-contained file, widgets inlined)
    python3 build.py --only 2,3 --out build/x.html
    python3 build.py --pdf                 # also -> build/The-Moving-World.pdf
    python3 build.py --site build/site     # GitHub Pages folder: index.html + lazy chunks in live/ + sw.js
    python3 build.py --src tests/fixture/src --provenance tests/fixture/provenance --site build/fixture-site

Source layout (under --src, default src/)
  front/*.md            letter, howto, ideas, models, further (each optional)
  chNN.md               one file per chapter (see FORMAT.md)
  stories/<id>.md       stories behind the ideas (see stories.py)
Figures: figs_*.py in the folder that holds the src folder (source/ for the book, tests/fixture/ for the fixture).
Provenance: <--provenance>/chNN.yml, one per chapter, plus optional stories*.yml, figures*.yml and sources.yml (see FORMAT.md).
The build fails if a numbered section of a built chapter has no provenance entry (--allow-missing-provenance warns instead).
"""
from __future__ import annotations
import base64, glob, hashlib, html, importlib, io, json, os, re, shutil, subprocess, sys
import markdown

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
from figs_core import FIGS, DEFS  # noqa: E402
import stories as ST  # noqa: E402

SRC = os.path.join(ROOT, 'src')
PROV = os.path.join(ROOT, 'provenance')
ALLOW_MISSING_PROV = False

TITLE = 'The Moving World'
SUBTITLE = 'Physics from the falling stone to the stars'
COVER_LINE = 'Sixteen chapters on how things move, push, shine and spin, and how we know.'
VOLUMES = [
    (1, 'Volume I', 'Motion and force',
     'How things move, why they keep moving, and what forces really do.', [0, 1, 2, 3, 4]),
    (2, 'Volume II', 'Gravity, pressure and energy',
     'The pull that runs the sky, the weight of the air, and the one quantity that is never used up.', [5, 6, 7, 8]),
    (3, 'Volume III', 'Waves, sound and light',
     'How energy travels without carrying anything, from a tabla\u2019s note to the colour of the sea.', [9, 10, 11]),
    (4, 'Volume IV', 'Electricity, magnetism and the sky',
     'Circuits, magnets and the electromagnetic waves they make, then out to the Moon, the Sun and the stars.', [12, 13, 14, 15]),
]
ROMAN = {1: 'I', 2: 'II', 3: 'III', 4: 'IV'}
MOTIFS = {1: 'cloud', 2: 'balance', 3: 'lattice', 4: 'field'}   # drawn by app/m_beauty.js
SITE_URL = 'https://saxster.github.io/kym-physics/'
SHORT_NAME = 'Moving World'
DESCRIPTION = (f'{SUBTITLE}. A physics book told as a historical adventure, with living figures, '
               'experiments to try at home, and the stories of the people who worked it all out.')
OUT_NAME = 'The-Moving-World'

# Explorers: (mount name, title, lazy chunk, blurb). Each gets a front-matter page section#explore-<name>.
EXPLORERS = [
    ('scale', 'Powers of Ten', 'x_scale',
     'From a proton to a galaxy in one long zoom. Each step makes the view ten times wider, '
     'and a readout tells you how many times bigger each new thing is than the last.'),
    ('sky', 'The Sky', 'x_sky',
     'The Sun, the Earth and the Moon, with the Earth tilted by its real 23.4°. Pick a date and a time '
     'to see how high the noon Sun stands over Mumbai, which phase the Moon is in, and when an eclipse can happen.'),
    ('spectrum', 'The Ladder of Light', 'x_spectrum',
     'Radio waves, the light you see and X-rays are the same thing at different sizes. Climb from the longest '
     'waves to the shortest, with a real source and a story on every rung.'),
]
MAP_BLURB = ('Every scene in this book happened somewhere real. Here they all are, from Alexandria to Thumba. '
             'Slide through time, or tap a pin to jump into the story.')

MD = markdown.Markdown(extensions=['extra', 'smarty', 'sane_lists'],
                       extension_configs={'smarty': {'smart_angled_quotes': False}})


def nuc(m):
    a, z, sym, q = m.groups()
    qs = f'<span class="nq">{q}</span>' if q else ''
    return (f'<span class="nuc" aria-label="{sym}, mass number {a}, atomic number {z}'
            f'{", charge " + q if q else ""}"><span class="nz"><span>{a}</span><span>{z}</span></span>{sym}{qs}</span>')


def md(text: str) -> str:
    MD.reset()
    text = re.sub(r'==(.+?)==', r'<mark class="term">\1</mark>', text)
    text = re.sub(r'\[\[nuc:([^:\]]*):([^:\]]*):([^:\]]*):([^\]]*)\]\]', nuc, text)
    return MD.convert(text.strip())


def md_inline(text: str) -> str:
    h = md(text)
    return re.sub(r'^<p>(.*)</p>$', r'\1', h, flags=re.S)


ICONS = {
    'evidence': '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12.6 12.6 L17.5 17.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    'careful': '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5 L18 16.5 H2 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 7.5 V11.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1.1" fill="currentColor"/></svg>',
    'try': '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 2.5 H12.5 M8.5 2.5 V8 L3.5 16.2 Q3 17.5 4.5 17.5 H15.5 Q17 17.5 16.5 16.2 L11.5 8 V2.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M5.6 13 H14.4" stroke="currentColor" stroke-width="1.5"/></svg>',
    'check': '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6.5 10.2 L9 12.7 L13.8 7.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'home': '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 9.5 L10 3.5 L17 9.5 M5 8 V16.5 H15 V8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.5 16.5 V12 H11.5 V16.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    'pin': '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18 C10 18 4.5 11.8 4.5 8 A5.5 5.5 0 0 1 15.5 8 C15.5 11.8 10 18 10 18 Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="10" cy="8" r="2" fill="currentColor"/></svg>',
    'case': '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="5" width="15" height="11.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7 5 V3.5 H13 V5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    'predict': '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5 A5.2 5.2 0 0 1 13.2 11.8 V14 H6.8 V11.8 A5.2 5.2 0 0 1 10 2.5 Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M7.4 16.6 H12.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    'recall': '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.2 8 A6.2 6.2 0 1 1 4.6 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M2.6 4.6 L4.2 8.4 L8 6.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'school': '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.5 L18.5 7.5 L10 11.5 L1.5 7.5 Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M5 9.4 V13.5 Q10 16.5 15 13.5 V9.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
}


def sid(label: str) -> str:
    return label.replace('.', '-')


class Chapter:
    def __init__(self, path):
        raw = open(path, encoding='utf-8').read()
        m = re.match(r'---\n(.*?)\n---\n', raw, re.S)
        if not m:
            raise SystemExit(f'{path}: missing the --- front matter --- block')
        meta = dict(re.findall(r'^(\w+):\s*(.*)$', m.group(1), re.M))
        self.path = path
        self.n = int(meta['chapter'])
        self.title = meta['title'].strip()
        self.question = meta.get('question', '').strip()
        self.short = meta.get('short', self.title).strip()
        vols = [v[0] for v in VOLUMES if self.n in v[4]]
        if not vols:
            raise SystemExit(f'{path}: chapter {self.n} is in no volume (see VOLUMES in build.py)')
        self.vol = vols[0]
        body = raw[m.end():]
        parts = re.split(r'^## +', body, flags=re.M)
        self.intro_src = parts[0]
        self.sections = []
        for p in parts[1:]:
            head, _, rest = p.partition('\n')
            mm = re.match(r'(\d+\.\d+)\s+(.*)', head.strip())
            if mm:
                self.sections.append((mm.group(1), mm.group(2).strip(), rest))
            else:  # chapter-end material (case file etc.) under a non-numbered heading
                self.sections.append((None, head.strip(), rest))
        self.fig_no = 0


# ------------------------------------------------------------------ provenance ledger
class Ledger:
    """provenance/chNN.yml (one mapping per chapter) + optional provenance/sources.yml (who wrote each course/book).

    Keys: section numbers ("1.2"), stories ("story:raman"), figures ("fig:c1_ramp"). Values are mappings with the
    lists ocw, openstax, research, history, figures and a licence string. YAML is read with BaseLoader, so every
    scalar is a string and "1.10" never turns into the number 1.1."""
    KINDS = ('ocw', 'openstax', 'research', 'history')

    def __init__(self, folder):
        import yaml
        self.folder = folder
        self.by_ch: dict[int, dict] = {}
        self.extra: dict = {}           # stories.yml / figures.yml: entries that belong to no chapter
        self.sources = {'ocw': {}, 'openstax': {}}
        self.problems: list[str] = []

        def load(path):
            try:
                d = yaml.load(open(path, encoding='utf-8'), Loader=yaml.BaseLoader) or {}
            except yaml.YAMLError as e:
                raise SystemExit(f'provenance: cannot read {path}:\n{e}')
            if not isinstance(d, dict):
                raise SystemExit(f'provenance: {path} must be a mapping of keys to entries')
            return d
        if not os.path.isdir(folder):
            return
        for p in sorted(glob.glob(os.path.join(folder, 'ch*.yml'))):
            mm = re.match(r'ch(\d+)\.yml$', os.path.basename(p))
            if mm:
                self.by_ch[int(mm.group(1))] = load(p)
        for pat in ('stories*.yml', 'figures*.yml'):      # stories_<group>.yml lets story writers work in parallel
            for p in sorted(glob.glob(os.path.join(folder, pat))):
                self.extra.update(load(p))
        p = os.path.join(folder, 'sources.yml')
        if os.path.exists(p):
            d = load(p)
            for k in ('ocw', 'openstax'):
                self.sources[k] = d.get(k) or {}

    def entry(self, ch_n, key):
        e = self.by_ch.get(ch_n, {}).get(key)
        return e if isinstance(e, dict) else None

    def any_entry(self, key):
        for d in list(self.by_ch.values()) + [self.extra]:
            if isinstance(d.get(key), dict):
                return d[key]
        return None

    def items(self, e, kind):
        v = e.get(kind) or []
        return [x for x in (v if isinstance(v, list) else [v]) if isinstance(x, dict)]

    def check(self, chapters, stories, figs_used):
        """Return (errors, warnings). Errors: numbered sections with no entry."""
        errors, warns = [], []
        for c in chapters:
            path = os.path.join(self.folder, f'ch{c.n:02d}.yml')
            d = self.by_ch.get(c.n)
            missing = [n for n, _, _ in c.sections if n and not isinstance((d or {}).get(n), dict)]
            if missing:
                where = path if d is not None else f'{path} (file not found)'
                errors.append(f'chapter {c.n}: no provenance entry for section{"s" if len(missing) > 1 else ""} '
                              f'{", ".join(missing)} in {os.path.relpath(where, ROOT)}')
            for n, _, _ in c.sections:
                e = (d or {}).get(n)
                if isinstance(e, dict):
                    if not any(self.items(e, k) for k in self.KINDS):
                        warns.append(f'chapter {c.n}: section {n} has an entry but cites no ocw, openstax, research or history source')
                    for k, need in (('ocw', ('course', 'url')), ('openstax', ('book', 'url')), ('research', ('source',)), ('history', ('source',))):
                        for it in self.items(e, k):
                            lack = [f for f in need if not it.get(f)]
                            if lack:
                                warns.append(f'chapter {c.n}: section {n}: a {k} item lacks {", ".join(lack)}')
        for s in stories:
            if not self.any_entry(f'story:{s.id}'):
                warns.append(f'story {s.id}: no provenance entry "story:{s.id}"')
        listed = set()
        for d in self.by_ch.values():
            for e in d.values():
                if isinstance(e, dict):
                    listed |= {f.get('name') for f in self.items(e, 'figures')}
        for ch_n, name in sorted(set(figs_used), key=str):
            if name not in listed and not self.any_entry(f'fig:{name}'):
                warns.append(f'figure {name} (chapter {ch_n}): no provenance entry "fig:{name}" or figures: list item')
        return errors, warns

    def openstax_books(self, ch_n):
        seen = {}
        for e in self.by_ch.get(ch_n, {}).values():
            if isinstance(e, dict):
                for it in self.items(e, 'openstax'):
                    b = it.get('book')
                    if b and b not in seen:
                        seen[b] = self.book_url(b, it.get('url', ''))
        return seen

    def book_url(self, book, any_url=''):
        reg = self.sources['openstax'].get(book) or {}
        if isinstance(reg, dict) and reg.get('url'):
            return reg['url']
        m = re.match(r'(https://openstax\.org/books/[^/]+)', any_url or '')
        return f'{m.group(1)}/pages/1-introduction' if m else 'https://openstax.org'


class Builder:
    def __init__(self):
        self.answers = []   # (chapter n, label, qhtml, ahtml, anchor)
        self.glossary = {}  # term -> (html, anchor, label)
        self.scenes = []    # {id, text, where}
        self.home_ids = set()
        self.ids = set()
        self.stories = {}
        self.predicts = {}  # id -> (ch n, label)
        self.figs_used = [] # (ch n, figure function name)
        self.fig_anchor = {}  # figure function name -> (anchor, number)
        self.linker = ST.Linker([])

    def uid(self, base):
        u, k = base, 2
        while u in self.ids:
            u, k = f'{base}-{k}', k + 1
        self.ids.add(u)
        return u

    # ------------------------------------------------------------- directives
    def render_blocks(self, src: str, ch: Chapter, sec: str | None) -> str:
        out, buf = [], []
        lines = src.split('\n')
        i = 0
        last_text = False; note_pos = None

        def flush():
            nonlocal last_text, note_pos
            if ''.join(buf).strip():
                out.append(md('\n'.join(buf)))
                last_text = True; note_pos = None
            buf.clear()
        while i < len(lines):
            line = lines[i]
            m = re.match(r'^:::(\w+)\s*(.*)$', line)
            if not m:
                buf.append(line); i += 1; continue
            flush()
            kind, arg = m.group(1), m.group(2).strip()
            if kind == 'live':
                # attach a live (animated / 3D) version to the figure just above: ':::live widget {json}'
                name, _, prm = arg.partition(' ')
                for k in range(len(out) - 1, -1, -1):
                    if out[k].startswith('<figure'):
                        prm_attr = html.escape(prm.strip() or '{}', quote=True)
                        meta = widget_meta(name)
                        extra = (f' data-live-label="{html.escape(meta["label"], quote=True)}"' if meta.get('label') else '') \
                            + (' data-live-3d="1"' if meta.get('three') else '') + (' data-live-static="1"' if meta.get('static') else '')
                        out[k] = out[k].replace('<figure', f'<figure data-live="{name}" data-live-params="{prm_attr}"{extra}', 1)
                        break
                else:
                    raise SystemExit(f':::live {name} has no figure above it in chapter {ch.n}')
                i += 1
                if i < len(lines) and lines[i].strip() == ':::':
                    i += 1
                continue
            if kind in ('story', 'scene'):
                if kind == 'story':
                    st = self.stories.get(arg.strip())
                    if st is None:
                        print(f'note: :::story {arg.strip()} not written yet (chapter {ch.n})')
                    else:
                        out.append(ST.callout(st, md_inline))
                else:
                    scid = f'scene-{len(self.scenes) + 1}'
                    where = f'story:{ch.id}' if hasattr(ch, 'id') else f'ch:{ch.n}'
                    self.scenes.append({'id': scid, 'text': plain(arg), 'where': where})
                    out.append(f'<p class="scene" id="{scid}">{ICONS["pin"]}<span>{md_inline(arg)}</span></p>')
                last_text = False; note_pos = None
                i += 1
                if i < len(lines) and lines[i].strip() == ':::':
                    i += 1
                continue
            if kind in ('fig', 'figwide', 'figcap'):
                out.append(self.figure(arg, ch, kind, sec)); i += 1
                last_text = False; note_pos = None
                if i < len(lines) and lines[i].strip() == ':::':
                    i += 1  # tolerate a stray closing fence
                continue
            j = i + 1; inner = []
            while j < len(lines) and lines[j].strip() != ':::':
                inner.append(lines[j]); j += 1
            if j >= len(lines):
                raise SystemExit(f':::{kind} in chapter {ch.n} (section {sec or "intro"}) has no closing ::: line')
            i = j + 1
            html_ = self.block(kind, arg, '\n'.join(inner), ch, sec)
            if kind in ('note', 'aside') and out and isinstance(out[-1], str) and last_text:
                # margin notes float beside the paragraph they explain: move before it
                chunk = out[-1]
                if note_pos is None:
                    starts = [m.start() for m in re.finditer(r'<(p|ul|ol|table|blockquote|h\d)[ >]', chunk)]
                    note_pos = starts[-1] if starts else 0
                out[-1] = chunk[:note_pos] + html_ + chunk[note_pos:]
                note_pos += len(html_)
                continue
            out.append(html_)
            last_text = False; note_pos = None
        flush()
        return '\n'.join(out)

    def figure(self, arg, ch, kind, sec=None):
        call, _, cap = arg.partition('|')
        call = call.strip()
        name = call.split('(')[0]
        if name not in FIGS:
            raise SystemExit(f'Unknown figure {name!r} in chapter {ch.n}')
        svg = eval(call, {'__builtins__': {}}, FIGS)
        ch.fig_no += 1
        num = f'{ch.n}.{ch.fig_no}'
        cls = {'figwide': ' class="wide"', 'figcap': ' class="margin-cap"'}.get(kind, '')
        label = '' if str(ch.n).startswith('S') else f'<b>Figure {num}</b>'
        capt = f'<figcaption>{label}{md_inline(cap.strip())}</figcaption>' if cap.strip() else ''
        anchor = f'fig-{sid(num)}'
        self.figs_used.append((ch.n, name))
        self.fig_anchor.setdefault(name, (anchor, num))
        return f'<figure{cls} id="{anchor}">{svg}{capt}</figure>'

    def block(self, kind, arg, inner, ch, sec):
        label = sec or str(ch.n)
        if kind == 'note':
            anchor = f's{sid(label)}'
            self.glossary.setdefault(arg, (md(inner), anchor, label))
            return f'<aside class="side def"><b>{md_inline(arg)}</b>{md(inner)}</aside>'
        if kind == 'aside':
            return f'<aside class="side aside">{md(inner)}</aside>'
        if kind == 'evidence':
            t, _, yr = arg.partition('|')
            yr = f' <span class="yr">{yr.strip()}</span>' if yr.strip() else ''
            return (f'<div class="box evidence"><p class="bh">{ICONS["evidence"]}<span>How do we know? '
                    f'{md_inline(t.strip())}{yr}</span></p>{md(inner)}</div>')
        if kind == 'five':
            # Understand it (Feynman-style). Lines "? Question" are the core questions (always shown);
            # "?? Question" are go-deeper questions (folded away). Each is followed by its answer.
            # The card ends with a "Your turn" check: explain it in one sentence, compared with the first answer.
            title, _, opts = arg.partition('|')
            parts = re.split(r'^(\?\??)\s*(.+)$', inner.strip(), flags=re.M)
            core, deep = [], []
            for k in range(1, len(parts) - 2, 3):
                lvl, q, a = parts[k], parts[k + 1].strip(), parts[k + 2].strip()
                row = f'<div class="fq"><dt>{md_inline(q)}</dt><dd>{md(a)}</dd></div>'
                (deep if lvl == '??' else core).append((row, q, a))
            if not core:
                raise SystemExit(f':::five {arg} has no "? question" lines (chapter {ch.n})')
            plain_t = html.escape(re.sub(r'<[^>]+>', '', md_inline(title.strip())), quote=True)
            slug = re.sub(r'[^a-z0-9]+', '-', re.sub(r'<[^>]+>', '', title).lower()).strip('-')
            out = (f'<section class="box five" id="five-{slug}" aria-label="Understand it: {plain_t}">'
                   f'<p class="bh"><span class="five-k">Understand it</span><span class="five-t">{md_inline(title.strip())}</span></p>'
                   f'<dl class="fqs">{"".join(r for r, _, _ in core)}</dl>')
            if deep:
                names = ', '.join(html.unescape(re.sub(r'<[^>]+>', '', md_inline(q))).rstrip('?').lower() for _, q, _ in deep)
                out += (f'<details class="five-more"><summary>Go deeper <span>{html.escape(names)}</span></summary>'
                        f'<dl class="fqs">{"".join(r for r, _, _ in deep)}</dl></details>')
            if 'noturn' not in opts:
                anchor = f'chk-five-{slug}'
                one = md(core[0][2])
                out += (f'<div class="box check five-turn" id="{anchor}"><p class="bh">{ICONS["check"]}<span>Your turn</span></p>'
                        f'<p>Explain <b>{md_inline(title.strip())}</b> to a friend in one sentence, in your own words. '
                        f'Then compare it with the book’s.</p><template class="chk-a">{one}</template></div>')
            return out + '</section>'
        if kind == 'careful':
            head = md_inline(arg) if arg else 'Careful'
            return f'<div class="box careful"><p class="bh">{ICONS["careful"]}<span>{head}</span></p>{md(inner)}</div>'
        if kind == 'home':
            head = md_inline(arg) if arg else 'Try it at home'
            where = ch.id if hasattr(ch, 'id') else f'ch{ch.n}'
            base = 'home-' + re.sub(r'[^a-z0-9]+', '-', f'{where} {re.sub(r"<[^>]+>", "", arg or "home")}'.lower()).strip('-')[:60]
            hid, k = base, 2
            while hid in self.home_ids:
                hid, k = f'{base}-{k}', k + 1
            self.home_ids.add(hid)
            return f'<div class="box home" id="{hid}" data-home="{hid}"><p class="bh">{ICONS["home"]}<span>{head}</span></p>{md(inner)}</div>'
        if kind == 'try':
            head = md_inline(arg) if arg else 'Try it'
            return f'<div class="box try"><p class="bh">{ICONS["try"]}<span>{head}</span></p>{md(inner)}</div>'
        if kind in ('check', 'recall'):
            q, sep, a = inner.partition('\n???\n')
            if not sep:
                raise SystemExit(f':::{kind} in chapter {ch.n} section {label} needs a ??? line between question and answer')
            prefix = 'chk' if kind == 'check' else 'rec'
            k = sum(1 for x in self.answers if x[1] == label and x[4].startswith(prefix)) + 1
            anchor = f'{prefix}-{sid(label)}' + (f'-{k}' if k > 1 else '')
            qh, ah = md(q), md(a)
            self.answers.append((ch.n, label, qh, ah, anchor))
            if kind == 'check':
                cls, head, extra = 'box check', f'{ICONS["check"]}<span>Check yourself</span>', ''
            else:
                mm = re.match(r'^(\d+)(?:\.(\d+))?$', arg.strip())
                if not mm:
                    raise SystemExit(f':::recall in chapter {ch.n} section {label}: write ":::recall N" or ":::recall N.M" (got {arg!r})')
                back = mm.group(1)
                extra = ''
                if mm.group(2):
                    pid = f'pred-{back}-{mm.group(2)}'
                    if pid in self.predicts:
                        extra = f' data-recall-pred="{pid}"'
                    else:
                        print(f'note: :::recall {arg} in chapter {ch.n}: section {arg} has no :::predict to recall')
                cls = 'box check recall'
                head = f'{ICONS["recall"]}<span>Back from Chapter {back}</span>'
            return (f'<div class="{cls}" id="{anchor}"{extra}><p class="bh">{head}</p>{qh}'
                    f'<p class="ans"><a href="#ans-{anchor}">Answer at the back of the book</a></p>'
                    f'<template class="chk-a">{ah}</template></div>')
        if kind == 'predict':
            q_opts, sep, reveal = inner.partition('\n???\n')
            if not sep:
                raise SystemExit(f':::predict in chapter {ch.n} section {label} needs a ??? line before the reveal')
            qlines, opts = [], []
            for ln in q_opts.split('\n'):
                mo = re.match(r'^\s*[-*]\s+(.*)$', ln)
                if mo:
                    opts.append(mo.group(1).strip())
                elif opts and ln.strip():
                    opts[-1] += ' ' + ln.strip()
                elif not opts:
                    qlines.append(ln)
            if len(opts) < 2:
                raise SystemExit(f':::predict in chapter {ch.n} section {label} needs at least two "- option" lines')
            pid = self.uid(f'pred-{sid(label)}')
            self.predicts[pid] = (ch.n, label)
            lis = ''.join(f'<li>{md_inline(o)}</li>' for o in opts)
            return (f'<div class="box predict" id="{pid}" data-predict="{pid}"><p class="bh">{ICONS["predict"]}<span>Predict first</span></p>'
                    f'<div class="pq">{md(chr(10).join(qlines))}</div><ol class="pred-opts" type="A">{lis}</ol>'
                    f'<div class="pred-reveal"><p class="pr-k">What happens</p>{md(reveal)}</div></div>')
        if kind == 'school':
            head = md_inline(arg) if arg else 'At school'
            return f'<div class="box school"><p class="bh">{ICONS["school"]}<span>{head}</span></p>{md(inner)}</div>'
        if kind == 'case':
            puzzle, _, sol = inner.partition('\n???\n')
            return (f'<div class="case full-ish"><p class="bh">{ICONS["case"]}<span>Case file {ch.n}</span></p>'
                    f'<h3>{md_inline(arg)}</h3><div class="clues">{md(puzzle)}</div>'
                    f'<details><summary>Show the solution</summary><div>{md(sol)}</div></details></div>')
        if kind == 'next':
            head = md_inline(arg) if arg else 'What this chapter can’t explain yet'
            return f'<div class="next"><p class="bh">{head}</p>{md(inner)}</div>'
        if kind == 'work':
            inner = re.sub(r'(?<!\n)\n(?!\n)', '  \n', inner.strip())
            return f'<div class="work">{md(inner)}</div>'
        if kind == 'eq':
            return f'<p class="eq">{md_inline(inner)}</p>'
        if kind == 'raw':
            return re.sub(r"(\w)'(\w)", "\\1\u2019\\2", inner)
        raise SystemExit(f'Unknown block :::{kind} in chapter {ch.n}')

    # ------------------------------------------------------------- pieces
    def chapter_html(self, ch: Chapter, ledger: Ledger) -> str:
        toc = ''.join(f'<li><span class="n">{n}</span><a href="#s{sid(n)}">{md_inline(t)}</a></li>'
                      for n, t, _ in ch.sections if n)
        seen = set()  # each story is linked once per chapter: at its first mention
        intro = self.linker.link(self.render_blocks(ch.intro_src, ch, None), seen=seen)
        intro = re.sub(r'<p>', '<p class="lede">', intro, count=1)
        secs = []
        for n, t, body in ch.sections:
            if n:
                secs.append(f'<section class="sec" id="s{sid(n)}"><h3><span class="n">{n}</span>{md_inline(t)}</h3>'
                            f'{self.linker.link(self.render_blocks(body, ch, n), seen=seen)}</section>')
            else:
                secs.append(f'<section class="sec end">{self.linker.link(self.render_blocks(body, ch, None), seen=seen)}</section>')
        return (f'<article class="chapter vol-{ch.vol}" id="ch{ch.n}" data-vol="{ch.vol}"><div class="flow">'
                f'<header class="opener"><p class="cn" aria-hidden="true"><span>{ch.n}</span></p><p class="cl">Chapter {ch.n}</p>'
                f'<h2>{md_inline(ch.title)}</h2>'
                + (f'<p class="bq"><span class="bq-label">The big question</span>{md_inline(ch.question)}</p>' if ch.question else '')
                + f'<ol class="chapter-toc">{toc}</ol></header>'
                f'<div class="intro">{intro}</div>{"".join(secs)}'
                f'<p class="fin" aria-hidden="true"><i></i><i></i><i></i></p>{chapter_credits(ch, ledger)}</div></article>')

    def volume_html(self, v, chapters) -> str:
        n, name, title, blurb, chs = v
        items = ''.join(f'<li><span>Chapter {c.n}</span><a href="#ch{c.n}">{md_inline(c.short)}</a></li>'
                        for c in chapters if c.n in chs)
        motif = MOTIFS.get(n, 'cloud')
        return (f'<section class="volume vol-{n}" id="vol{n}" data-vol="{n}">'
                f'<div class="vol-art" data-motif="{motif}" aria-hidden="true"><canvas></canvas></div>'
                f'<div class="in"><p class="vn"><span class="vr" aria-hidden="true">{ROMAN.get(n, n)}</span>{name}</p>'
                f'<h2>{title}</h2><p class="vb">{blurb}</p><ol>{items}</ol></div></section>')

    def toc_html(self, chapters, front_titles) -> str:
        li = lambda href, t: f'<li><div class="tch"><span class="n"></span><a href="#{href}">{t}</a></div></li>'
        out = ['<section class="front flow toc-page" id="contents"><h2>Contents</h2><div class="toc"><ol>']
        for k, t in front_titles:
            out.append(li(k, t))
        out.append(li('cast', 'The cast'))
        for name, title, _, _ in EXPLORERS:
            out.append(li(f'explore-{name}', title))
        out.append(li('explore-map', 'The adventure map'))
        out.append('</ol>')
        for v in VOLUMES:
            if not any(c.n in v[4] for c in chapters):
                continue
            out.append(f'<p class="tvol vol-{v[0]}" style="color:var(--vol)">{v[1]} <span>{v[2]}</span></p><ol class="vol-{v[0]}">')
            for c in chapters:
                if c.n in v[4]:
                    secs = ''.join(
                        f'<a href="#s{sid(n)}"><span class="sn">{n}</span><span class="st">{md_inline(t)}</span></a>'
                        for n, t, _ in c.sections if n)
                    out.append(f'<li><div class="tch"><span class="n">{c.n}</span><a href="#ch{c.n}">{md_inline(c.title)}</a>'
                               f'<div class="tsec">{secs}</div></div></li>')
            out.append('</ol>')
        out.append('<p class="tvol">At the back</p><ol>'
                   + li('stories', 'Stories behind the ideas') + li('timeline', 'The adventure in time')
                   + li('answers', 'Answers to Check yourself') + li('glossary', 'Words worth knowing')
                   + li('models', 'About the models and numbers in this book') + li('further', 'Further adventures')
                   + li('credits', 'Where this book comes from') + '</ol>')
        out.append('</div></section>')
        return ''.join(out)

    def answers_html(self, chapters) -> str:
        out = ['<section class="answers flow" id="answers"><h2>Answers to Check yourself</h2>'
               '<p>Try each question before you look. If your answer differs, the reasoning matters more than the words: '
               'see whether you used the same idea.</p>']
        cur = None
        for n, label, qh, ah, anchor in self.answers:
            if n != cur:
                cur = n
                c = next((c for c in chapters if c.n == n), None)
                out.append(f'<h3>Chapter {n}. {md_inline(c.title)}</h3>' if c else '<h3>From the stories</h3>')
            q = re.sub(r'</?p>', ' ', qh).strip()
            out.append(f'<div class="a" id="ans-{anchor}"><span class="n">{label}</span><div><p class="q">{q}</p>{ah}'
                       f'<p class="back"><a href="#{anchor}">Back to {"section " + label if "." in label else "the question"}</a></p></div></div>')
        out.append('</section>')
        return ''.join(out)

    def glossary_html(self) -> str:
        items = sorted(self.glossary.items(), key=lambda kv: re.sub(r'[^a-z0-9 ]', '', kv[0].lower()))
        dl = ''.join(f'<div><dt>{md_inline(t)}</dt><dd>{re.sub(r"</?p>", " ", h).strip()} <a href="#{a}">{l}</a></dd></div>'
                     for t, (h, a, l) in items)
        return f'<section class="flow" id="glossary"><h2>Words worth knowing</h2><dl class="gloss full">{dl}</dl></section>'

    def credits_html(self, chapters, stories, ledger: Ledger) -> str:
        """Back-matter page "Where this book comes from", grouped by source."""
        E = lambda s: html.escape(str(s or ''))
        groups = {k: {} for k in ('ocw', 'openstax', 'research', 'history')}
        figs_redrawn = []
        sec_title = {(c.n, n): plain(t) for c in chapters for n, t, _ in c.sections if n}
        story_by_id = {s.id: s for s in stories}

        def where(ch_n, key):
            if key.startswith('story:'):
                s = story_by_id.get(key[6:])
                return (f'#story-{key[6:]}', f'Story: {plain(s.title)}' if s else key)
            if key.startswith('fig:'):
                a = self.fig_anchor.get(key[4:])
                return (f'#{a[0]}', f'Figure {a[1]}') if a else ('', f'Figure {key[4:]}')
            return (f'#s{sid(key)}', f'{key} {sec_title.get((ch_n, key), "")}'.strip())
        built = {c.n for c in chapters}
        sources = [(n, d) for n, d in sorted(ledger.by_ch.items()) if n in built] + [(None, ledger.extra)]
        for ch_n, d in sources:
            for key, e in d.items():
                if not isinstance(e, dict):
                    continue
                href, lab = where(ch_n, key)
                if key.startswith('story:') and key[6:] not in story_by_id:
                    continue
                for it in ledger.items(e, 'ocw'):
                    g = groups['ocw'].setdefault(it.get('course', '?'), {'url': it.get('url', ''), 'uses': []})
                    g['uses'].append((href, lab, ' · '.join(x for x in (it.get('where'), it.get('took')) if x)))
                    g.setdefault('faculty', it.get('faculty'))
                for it in ledger.items(e, 'openstax'):
                    g = groups['openstax'].setdefault(it.get('book', '?'), {'url': ledger.book_url(it.get('book', ''), it.get('url', '')), 'uses': []})
                    g['uses'].append((href, lab, ' · '.join(x for x in (it.get('section'), it.get('took')) if x)))
                    g.setdefault('authors', it.get('authors'))
                for k in ('research', 'history'):
                    for it in ledger.items(e, k):
                        g = groups[k].setdefault(it.get('source', '?'), {'url': it.get('url', ''), 'uses': []})
                        g['uses'].append((href, lab, it.get('what', '')))
                for f in ledger.items(e, 'figures'):
                    if f.get('origin') and f.get('origin') != 'ours':
                        figs_redrawn.append((f.get('name', ''), f.get('origin'), href, lab))
                if e.get('origin') and e.get('origin') != 'ours' and key.startswith('fig:'):
                    figs_redrawn.append((key[4:], e['origin'], href, lab))

        def uses(lst):
            return '<ul class="cr-uses">' + ''.join(
                f'<li><a href="{h}">{E(l)}</a>' + (f'<span>{E(t)}</span>' if t else '') + '</li>' if h else f'<li>{E(l)}</li>'
                for h, l, t in lst) + '</ul>'

        def link(name, url):
            return f'<a href="{E(url)}" rel="noopener">{E(name)}</a>' if url else E(name)
        out = ['<section class="flow credits" id="credits"><h2>Where this book comes from</h2>'
               '<p>Every section of this book was written fresh, in our own words, for this book. But the order of ideas, '
               'many of the demonstrations and a good number of the problems were learned from the free courses and textbooks '
               'below. This page lists what came from where, section by section.</p>']
        if groups['ocw']:
            out.append('<h3>MIT OpenCourseWare</h3>')
            for name, g in sorted(groups['ocw'].items()):
                reg = ledger.sources['ocw'].get(name) or {}
                fac = (reg.get('faculty') if isinstance(reg, dict) else None) or g.get('faculty')
                url = (reg.get('url') if isinstance(reg, dict) else None) or re.sub(r'(https://ocw\.mit\.edu/courses/[^/]+/).*', r'\1', g['url'])
                out.append(f'<div class="cr-src"><p class="cr-name">{link(name, url)}</p>'
                           + (f'<p class="cr-who">{E(fac)}</p>' if fac else '') + uses(g['uses']) + '</div>')
        if groups['openstax']:
            out.append('<h3>OpenStax</h3>')
            for name, g in sorted(groups['openstax'].items()):
                reg = ledger.sources['openstax'].get(name) or {}
                who = (reg.get('authors') if isinstance(reg, dict) else None) or g.get('authors')
                out.append(f'<div class="cr-src"><p class="cr-name">{link(name, g["url"])}<span> by OpenStax</span></p>'
                           + (f'<p class="cr-who">{E(who)}</p>' if who else '')
                           + f'<p class="cr-who">Access for free at <a href="{E(g["url"])}" rel="noopener">{E(g["url"])}</a>. '
                           'Changes were made to the original material.</p>' + uses(g['uses']) + '</div>')
        for k, title in (('research', 'Research on how people learn physics'), ('history', 'History')):
            if groups[k]:
                out.append(f'<h3>{title}</h3>')
                for name, g in sorted(groups[k].items()):
                    out.append(f'<div class="cr-src"><p class="cr-name">{link(name, g["url"])}</p>{uses(g["uses"])}</div>')
        if figs_redrawn:
            out.append('<h3>Figures redrawn from other sources</h3><ul class="cr-uses">' + ''.join(
                f'<li><a href="{h}">{E(l)}</a><span>{E(o)}</span></li>' if h else f'<li>{E(n)}<span>{E(o)}</span></li>'
                for n, o, h, l in figs_redrawn) + '</ul>')
        out.append('<h3>Licence</h3><p class="cr-lic">This book is licensed under '
                   '<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="noopener license">Creative Commons '
                   'Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)</a>. You may share and adapt it, '
                   'not for profit, if you credit it and share what you make under the same licence.</p>'
                   '<p class="cr-lic">MIT, MIT OpenCourseWare and OpenStax did not write this book and do not endorse it. '
                   'Their names appear here only to credit their work; their logos are not used.</p></section>')
        return ''.join(out)


def chapter_credits(ch, ledger):
    books = ledger.openstax_books(ch.n)
    if not books:
        return ''
    lines = ''.join(f'<p>This chapter draws on <i>{html.escape(b)}</i> by OpenStax. Access for free at '
                    f'<a href="{html.escape(u)}" rel="noopener">{html.escape(u)}</a>. Changes were made to the original material.</p>'
                    for b, u in books.items())
    return f'<footer class="ch-credit">{lines}<p><a href="#credits">Where this chapter comes from</a></p></footer>'


def font_faces(text_chars: str) -> str:
    """Embed the fonts, subset to the characters the book uses.

    Literata is the variable font (weight 200-900 and an optical-size axis, so small text gets sturdier shapes and
    display text finer ones). Its web subsets (latin, latin-ext, greek) lack a few characters the book needs, such as
    subscript digits and superscript signs; those come from the static Literata cut under a second family name, which
    the browser falls back to glyph by glyph."""
    from fontTools import subset
    from fontTools.ttLib import TTFont
    chars = set(text_chars) | set(''.join(chr(c) for c in range(0x20, 0x7f)))
    css, covered = [], set()

    def embed(path, fam, weight, style, want, keep_var=True, features=('*',)):
        font = TTFont(path)
        cmap = font.getBestCmap() or {}
        use = {c for c in want if ord(c) in cmap}
        if not use:
            return set()
        opts = subset.Options()
        opts.layout_features = list(features)
        opts.flavor = 'woff2'
        opts.notdef_outline = True
        opts.name_IDs = ['*']
        sub = subset.Subsetter(opts)
        sub.populate(text=''.join(use))
        sub.subset(font)
        buf = io.BytesIO(); font.flavor = 'woff2'; font.save(buf)
        b64 = base64.b64encode(buf.getvalue()).decode()
        rng = ','.join(f'U+{ord(c):04X}' for c in sorted(use))
        css.append(f'@font-face{{font-family:"{fam}";font-weight:{weight};font-style:{style};font-display:swap;'
                   f'unicode-range:{rng};src:url(data:font/woff2;base64,{b64}) format("woff2");}}')
        return use

    vdir = os.path.join(ROOT, 'fonts', 'var')
    for sub_name in ('latin', 'latin-ext', 'greek'):
        for style in ('normal', 'italic'):
            f = os.path.join(vdir, f'literata-{sub_name}-opsz-{style}.woff2')
            if os.path.exists(f):
                got = embed(f, 'Literata', '200 900', style, chars - covered if style == 'normal' else chars)
                if style == 'normal':
                    covered |= got
    rest = chars - covered
    for w, style, key in ((400, 'normal', 'Literata-400'), (600, 'normal', 'Literata-600'),
                          (400, 'italic', 'Literata-400i'), (600, 'italic', 'Literata-600i')):
        embed(os.path.join(ROOT, 'fonts', key + '.ttf'), 'Literata Static', w, style, rest)
    for fam, w, style, key in (('Lexend', 400, 'normal', 'Lexend-400'), ('Lexend', 700, 'normal', 'Lexend-600')):
        embed(os.path.join(ROOT, 'fonts', key + '.ttf'), fam, w, style, chars)
    caveat_f = os.path.join(vdir, 'caveat-latin-wght-normal.woff2')
    if os.path.exists(caveat_f):
        hand_chars = set(''.join(chr(c) for c in range(0x20, 0x7f)) + '×÷−±≈≠≤≥°²³¹⁰⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉½¼¾→←↔✓ΔλμρΩ')
        embed(caveat_f, 'Caveat', '400 700', 'normal', hand_chars, features=('kern',))
    return '\n'.join(css)


SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ'
SUB = '₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎'


def mark_scripts(body: str) -> str:
    """Wrap runs of Unicode superscript/subscript characters in spans so CSS can make them legible
    (the minus in 10⁻³ is otherwise a hairline). Text content is unchanged; svg/script/style/textarea are skipped."""
    rx = re.compile(f'([{SUP}]+)|([{SUB}]+)')
    out, skip = [], 0
    for part in re.split(r'(<[^>]+>)', body):
        if part.startswith('<'):
            m = re.match(r'<(/?)(svg|script|style|textarea|title)\b', part, re.I)
            if m:
                skip += -1 if m.group(1) else (0 if part.endswith('/>') else 1)
            out.append(part)
        elif skip > 0 or not part:
            out.append(part)
        else:
            out.append(rx.sub(lambda mm: f'<span class="{"sx" if mm.group(1) else "sb"}">'
                              + mm.group(0).replace('⁻', '<span class="sxm">⁻</span>').replace('⁺', '<span class="sxp">⁺</span>') + '</span>', part))
    return ''.join(out)


JS = r'''
(function(){
  var bar=document.querySelector('.bar i');
  function onScroll(){
    var h=document.documentElement, max=h.scrollHeight-h.clientHeight;
    if(bar) bar.style.width=(max>0? (h.scrollTop/max*100):0)+'%';
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  window.addEventListener('beforeprint',function(){[].forEach.call(document.querySelectorAll('details'),function(d){d.setAttribute('open','')});});
})();
'''


# ------------------------------------------------------------------ JavaScript bundling
def esbuild_bin():
    esb = os.path.join(ROOT, 'node_modules', '.bin', 'esbuild')
    if not os.path.exists(esb):
        raise SystemExit('esbuild is missing: run `npm install` in source/ first')
    return esb


def iife(entry_src, tag, folder):
    """Bundle a generated entry (a list of imports) into one minified IIFE script."""
    entry = os.path.join(folder, f'.entry_{tag}.js')
    bundle = os.path.join(folder, f'.bundle_{tag}.js')
    with open(entry, 'w') as f:
        f.write(entry_src)
    try:
        subprocess.run([esbuild_bin(), entry, '--bundle', '--minify', '--format=iife', '--target=es2020', '--loader:.json=json',
                        '--legal-comments=none', f'--outfile={bundle}', '--log-level=warning'], check=True, cwd=ROOT)
        js = open(bundle, encoding='utf-8').read()
    finally:
        for p in (entry, bundle):
            if os.path.exists(p):
                os.remove(p)
    return js.replace('</script', '<\\/script')


def used_widgets(body):
    names = sorted(set(re.findall(r'data-live="([\w-]+)"', body)))
    for n in names:
        if not os.path.exists(os.path.join(ROOT, 'live', f'w_{n}.js')):
            raise SystemExit(f'live widget {n!r} has no file live/w_{n}.js')
    return names


_META = {}


def widget_meta(name):
    """Read the button label / 3D / static flags from the widget's Live.register(name, factory, {meta}) call, so the
    page can show the right button before the widget's chunk has loaded. Keep that meta a plain object literal."""
    if name in _META:
        return _META[name]
    p = os.path.join(ROOT, 'live', f'w_{name}.js')
    meta = {}
    if os.path.exists(p):
        src = open(p, encoding='utf-8').read()
        at = src.find('Live.register(')
        for m in re.finditer(r'\{([^{}]*)\}\s*\)', src[max(at, 0):]):
            body = m.group(1)
            if re.match(r'\s*(label|three|static)\s*:', body):
                lab = re.search(r'label\s*:\s*([\'"`])(.*?)\1', body)
                meta = {'label': lab.group(2) if lab else '', 'three': bool(re.search(r'three\s*:\s*true', body)),
                        'static': bool(re.search(r'static\s*:\s*true', body))}
                break
    _META[name] = meta
    return meta


def bundle_live_inline(names, tag):
    """--out mode: live/core.js + every widget the build uses, in one IIFE."""
    if not names:
        return ''
    src = "import './core.js';\n" + ''.join(f"import './w_{n}.js';\n" for n in names)
    return iife(src, tag, os.path.join(ROOT, 'live'))


def bundle_live_runtime(tag):
    """--site mode: only the runtime (buttons, controls, lazy loading); widgets arrive as chunks."""
    return iife("import './core.js';\n", tag, os.path.join(ROOT, 'live'))


def bundle_app(tag, inline_explorers):
    """Bundle app/core.js and every feature module app/m_*.js (plus, in --out mode, the explorer
    implementations app/x_*.js) into one script; concatenate app/*.css."""
    adir = os.path.join(ROOT, 'app')
    skip = set(filter(None, os.environ.get('SKIP_APP', '').split(',')))
    mods = [m for m in sorted(glob.glob(os.path.join(adir, 'm_*.js'))) if os.path.basename(m) not in skip]
    if inline_explorers:
        mods += sorted(glob.glob(os.path.join(adir, 'x_*.js')))
    js = iife("import './core.js';\n" + ''.join(f"import './{os.path.basename(m)}';\n" for m in mods), tag, adir)
    css = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(adir, '*.css'))) if os.path.basename(f) not in skip)
    return js, css


CHUNKS_MJS = r'''
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
// Lazy chunks run inside a page whose runtime is already loaded (inline scripts): they reach it through
// window globals instead of carrying a second copy of app/core.js or live/core.js.
const shims = { [cfg.liveCore]: cfg.liveShim, [cfg.appCore]: cfg.appShim };
const plugin = { name: 'book-shims', setup(b) {
  b.onResolve({ filter: /core\.js$/ }, a => { const p = path.resolve(a.resolveDir, a.path); return p in shims ? { path: p, namespace: 'shim' } : undefined; });
  b.onLoad({ filter: /.*/, namespace: 'shim' }, a => ({ contents: shims[a.path], loader: 'js' }));
} };
const r = await esbuild.build({
  entryPoints: cfg.entries, bundle: true, splitting: true, format: 'esm', minify: true, target: 'es2020',
  outdir: cfg.outdir, entryNames: '[name]-[hash]', chunkNames: 'chunk-[hash]', metafile: true,
  legalComments: 'none', logLevel: 'warning', loader: { '.json': 'json' }, plugins: [plugin], absWorkingDir: cfg.root,
});
fs.writeFileSync(cfg.meta, JSON.stringify(r.metafile));
'''


def imports_three(path, seen=None):
    seen = seen if seen is not None else set()
    if path in seen or not os.path.exists(path):
        return False
    seen.add(path)
    src = open(path, encoding='utf-8').read()
    if re.search(r'''from\s+['"]three['"]|import\(\s*['"]three['"]''', src):
        return True
    return any(imports_three(os.path.normpath(os.path.join(os.path.dirname(path), p)), seen)
               for p in re.findall(r'''from\s+['"](\.[^'"]+)['"]''', src))


def build_chunks(site_dir, widget_names):
    """--site mode: every live widget, every explorer implementation and three.js become lazy ES-module chunks
    under site/live/. Returns ({entry name: 'live/<file>'}, [(file, bytes, kind)])."""
    live_out = os.path.join(site_dir, 'live')
    shutil.rmtree(live_out, ignore_errors=True)
    os.makedirs(live_out)
    entries = {f'w_{n}': os.path.join(ROOT, 'live', f'w_{n}.js') for n in widget_names}
    entries.update({os.path.splitext(os.path.basename(p))[0]: p for p in sorted(glob.glob(os.path.join(ROOT, 'app', 'x_*.js')))})
    tmp = os.path.join(ROOT, 'build', '.chunks')
    os.makedirs(tmp, exist_ok=True)
    if any(imports_three(p) for p in entries.values()):
        # one shared three.js chunk, whichever widgets use it, loaded only when a 3D figure or explorer opens
        three_entry = os.path.join(tmp, 'three.js')
        open(three_entry, 'w').write("export * from 'three';\n")
        entries['three'] = three_entry
    if not entries:
        return {}, []
    core_src = open(os.path.join(ROOT, 'live', 'core.js'), encoding='utf-8').read()
    names = re.findall(r'^export (?:const|function|let|class) (\w+)', core_src, re.M)
    mod = re.search(r'window\.__liveModule\s*=\s*\{([^}]*)\}', core_src)
    have = set(re.findall(r'\w+', mod.group(1))) if mod else set()
    if set(names) - have:
        raise SystemExit(f'live/core.js: add {sorted(set(names) - have)} to window.__liveModule so lazy chunks can use them')
    live_shim = 'const M = window.__liveModule;\n' + ''.join(f'export const {n} = M.{n};\n' for n in names)
    app_shim = 'const App = window.App;\nexport default App;\n'
    cfg = {'entries': entries, 'outdir': live_out, 'root': ROOT, 'meta': os.path.join(tmp, 'meta.json'),
           'liveCore': os.path.join(ROOT, 'live', 'core.js'), 'appCore': os.path.join(ROOT, 'app', 'core.js'),
           'liveShim': live_shim, 'appShim': app_shim}
    cfg_path = os.path.join(tmp, 'cfg.json'); json.dump(cfg, open(cfg_path, 'w'))
    script = os.path.join(tmp, 'chunks.mjs'); open(script, 'w').write(CHUNKS_MJS)
    subprocess.run(['node', script, cfg_path], check=True, cwd=ROOT)
    meta = json.load(open(cfg['meta']))
    by_input = {os.path.normpath(p): k for k, p in entries.items()}
    chunks, sizes = {}, []
    for out, info in meta['outputs'].items():
        if out.endswith('.map'):
            continue
        absout = os.path.normpath(os.path.join(ROOT, out))
        rel = 'live/' + os.path.basename(absout)
        ep = info.get('entryPoint')
        name = by_input.get(os.path.normpath(os.path.join(ROOT, ep))) if ep else None
        if name:
            chunks[name] = rel
        has_three = any('node_modules/three/' in i for i in info.get('inputs', {}))
        kind = 'three' if has_three else (name or 'shared')
        sizes.append((rel, os.path.getsize(absout), kind))
    shutil.rmtree(tmp, ignore_errors=True)
    return chunks, sorted(sizes, key=lambda x: x[0])


def explore_html():
    parts = []
    for name, title, chunk, blurb in EXPLORERS:
        parts.append(f'<section class="front flow explore" id="explore-{name}"><h2>{title}</h2><p>{blurb}</p>'
                     f'<div class="explore-mount" data-mount="{name}" data-chunk="{chunk}" data-title="{html.escape(title, quote=True)}">'
                     '<p class="noscript">This explorer needs JavaScript. The rest of the book works without it.</p></div></section>')
    parts.append('<section class="front flow explore" id="explore-map"><h2>The adventure map</h2>'
                 f'<p>{MAP_BLURB}</p>'
                 '<div class="explore-mount" data-mount="map"><p class="noscript">This part of the book needs JavaScript.</p></div></section>')
    return ''.join(parts)


FAVICON = ("%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
           "%3Cpath d='M4 26 Q16 -2 28 26' fill='none' stroke='%232f6d8f' stroke-width='2.2' stroke-linecap='round'/%3E"
           "%3Ccircle cx='16' cy='12' r='4.2' fill='%23b8432f'/%3E%3Cpath d='M3 27.5 H29' stroke='%232f6d8f' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")
SITE_HEAD = (
    '<link rel="canonical" href="{url}">\n'
    '<link rel="manifest" href="manifest.webmanifest">\n'
    '<link rel="apple-touch-icon" href="icon-192.png">\n'
    '<meta property="og:type" content="book">\n'
    '<meta property="og:title" content="{title}">\n'
    '<meta property="og:description" content="{desc}">\n'
    '<meta property="og:url" content="{url}">\n'
    '<meta property="og:image" content="{url}og.png">\n'
    '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">\n'
    '<meta name="twitter:card" content="summary_large_image">\n'
    '<script>if("serviceWorker" in navigator && (location.protocol==="https:"||/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname))){{'
    'addEventListener("load",function(){{navigator.serviceWorker.register("sw.js").catch(function(){{}});}});}}</script>')

BUDGET_INDEX = 4 * 1024 * 1024
BUDGET_CHUNK = 150 * 1024


def make_site(site_dir, only=None):
    """Write a GitHub Pages folder: index.html, live/ chunks, manifest, service worker, icons, preview image, notices."""
    os.makedirs(site_dir, exist_ok=True)
    index = os.path.join(site_dir, 'index.html')
    head = SITE_HEAD.format(url=SITE_URL, title=TITLE, desc=html.escape(DESCRIPTION, quote=True))
    _, sizes = build(out=index, site_dir=site_dir, head_extra=head, only=only)
    json.dump({'name': TITLE, 'short_name': SHORT_NAME, 'description': DESCRIPTION, 'start_url': './', 'scope': './',
               'display': 'standalone', 'background_color': '#f2e8d5', 'theme_color': '#f2e8d5',
               'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
                         {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'}]},
              open(os.path.join(site_dir, 'manifest.webmanifest'), 'w'), indent=1)
    open(os.path.join(site_dir, '.nojekyll'), 'w').write('')
    for f in ('README.md', 'NOTICES.md', 'LICENSE.md'):
        src = os.path.join(ROOT, 'site_src', f)
        if os.path.exists(src):
            shutil.copy(src, os.path.join(site_dir, f))
    make_images(index, site_dir)
    # the cache version is a hash of everything the service worker precaches, so any change ships a new cache
    files = [f for f in ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'] + [s[0] for s in sizes]
             if os.path.exists(os.path.join(site_dir, f))]
    h = hashlib.sha1()
    for f in files:
        h.update(f.encode()); h.update(open(os.path.join(site_dir, f), 'rb').read())
    ver = h.hexdigest()[:12]
    open(os.path.join(site_dir, 'sw.js'), 'w').write(
        SW_JS.replace('__VER__', ver).replace('__FILES__', json.dumps(['./'] + ['./' + f for f in files])))
    print('site ready in', site_dir, 'cache version', ver)
    report_sizes(index, sizes)


def report_sizes(index, sizes):
    kb = lambda n: f'{n / 1024:8.1f} KB'
    isz = os.path.getsize(index)
    over = []
    print('\nsizes (budget: index.html < 4 MB, each chunk < 150 KB except the shared three.js chunk)')
    print(f'  index.html {kb(isz)}' + ('   OVER BUDGET' if isz > BUDGET_INDEX else ''))
    if isz > BUDGET_INDEX:
        over.append('index.html')
    for f, n, kind in sizes:
        bad = kind != 'three' and n > BUDGET_CHUNK
        print(f'  {f:<34} {kb(n)}  {kind}' + ('   OVER BUDGET' if bad else ''))
        if bad:
            over.append(f)
    if over:
        print(f'WARNING: over budget: {", ".join(over)}')


SW_JS = '''// Offline support: precache the page and every lazy chunk, so the whole book works offline after the first visit.
const CACHE = 'mw-__VER__';
const FILES = __FILES__;
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
// only this book's old caches: other books on the same origin keep theirs
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mw-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // network first for the page (so new editions arrive), cache as fallback; cache first for everything else
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
'''


def make_images(index, site_dir):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('WARNING: Python playwright is not installed, so icon-192.png, icon-512.png and og.png were not made '
              '(pip install playwright). Do not publish this folder.')
        return
    icon = ('<html><body style="margin:0;background:#f6f3ec;display:grid;place-items:center;height:100vh">'
            '<svg viewBox="0 0 32 32" style="width:62%">' + html.unescape(FAVICON.replace('%3C', '<').replace('%3E', '>')
            .replace('%23', '#')).split('>', 1)[1] + '</body></html>')
    with sync_playwright() as p:
        br = p.chromium.launch()
        for n in (192, 512):
            pg = br.new_page(viewport={'width': n, 'height': n}); pg.set_content(icon)
            pg.screenshot(path=os.path.join(site_dir, f'icon-{n}.png')); pg.close()
        pg = br.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1, reduced_motion='reduce')
        pg.goto('file://' + os.path.abspath(index), wait_until='load'); pg.wait_for_timeout(3500)
        pg.evaluate("document.querySelectorAll('.navbtn,.bar').forEach(e=>e.remove())")
        pg.screenshot(path=os.path.join(site_dir, 'og.png'))
        br.close()


def plain(src):
    """Markdown-inline text as plain unicode (no tags, no entities) for the app data."""
    return html.unescape(re.sub(r'<[^>]+>', '', md_inline(src)))


def load_figures():
    """figs_*.py next to the src folder: source/ for the book, tests/fixture/ for the fixture."""
    folder = os.path.dirname(os.path.abspath(SRC))
    if folder not in sys.path:
        sys.path.insert(0, folder)
    for f in sorted(glob.glob(os.path.join(folder, 'figs_*.py'))):
        name = os.path.splitext(os.path.basename(f))[0]
        if name != 'figs_core' and name not in sys.modules:
            importlib.import_module(name)


def front_title(html_, default):
    m = re.search(r'<h[12][^>]*>(.*?)</h[12]>', html_, re.S)
    return re.sub(r'<[^>]+>', '', m.group(1)).strip() if m else default


def build(pdf=False, only=None, out=None, site_dir=None, head_extra=''):
    load_figures()
    b = Builder()
    stories = ST.load(SRC)
    b.stories = {s.id: s for s in stories}
    b.linker = ST.Linker(stories)
    chapters = [Chapter(p) for p in sorted(glob.glob(os.path.join(SRC, 'ch*.md')))]
    chapters.sort(key=lambda c: c.n)
    if only is not None:
        chapters = [c for c in chapters if c.n in only]
    ledger = Ledger(PROV)
    front = {k: open(os.path.join(SRC, 'front', f'{k}.md'), encoding='utf-8').read()
             for k in ('letter', 'howto', 'ideas', 'models', 'further')
             if os.path.exists(os.path.join(SRC, 'front', f'{k}.md'))}
    dummy = type('C', (), {'n': 0, 'fig_no': 0})()

    cover = FIGS['cover_art']() if 'cover_art' in FIGS else ''
    legend = '<figcaption class="legend">Every tile is a chapter of this book: tap any tile to see its puzzle, the people who cracked it, and where to jump in.</figcaption>'
    parts = [f'''<header class="cover" id="top"><canvas class="field" aria-hidden="true"></canvas><div class="title"><h1>{TITLE}</h1>
<p class="sub">{SUBTITLE}. {COVER_LINE}</p>
<p class="for">Written for Kym</p>
<p class="begin"><a href="#letter">Start reading</a></p></div>
{f'<figure class="art">{cover}{legend}</figure>' if cover else ''}</header>''']
    front_titles = []
    for k, cls, default in (('letter', 'letter', 'A letter to Kym'), ('howto', 'howto', 'How this book works'),
                            ('ideas', 'ideas-page', 'Five big ideas')):
        if k in front:
            h = b.render_blocks(front[k], dummy, None)
            front_titles.append((k, front_title(h, default)))
            parts.append(f'<section class="front flow {cls}" id="{k}">{h}</section>')
    toc_at = len(parts)
    parts.append(ST.cast_section(stories, md_inline))
    parts.append(explore_html())
    for v in VOLUMES:
        if not any(c.n in v[4] for c in chapters):
            continue
        parts.append(b.volume_html(v, chapters))
        for c in chapters:
            if c.n in v[4]:
                parts.append(b.chapter_html(c, ledger))
    for s in stories:
        s.html = b.linker.link(b.render_blocks(s.src, s, None), exclude=s.id)
    parts.insert(toc_at, b.toc_html(chapters, front_titles))
    errors, warns = ledger.check(chapters, stories, b.figs_used)
    for w in warns:
        print('provenance warning:', w)
    if errors:
        print('\nPROVENANCE MISSING' + (' (allowed by --allow-missing-provenance)' if ALLOW_MISSING_PROV else '') + ':')
        for e in errors:
            print('  -', e)
        if not ALLOW_MISSING_PROV:
            print('\nAdd an entry for each section listed above (see FORMAT.md, "Provenance"), '
                  'or build a partial draft with --allow-missing-provenance.')
            raise SystemExit(1)
    back = []
    if stories:
        back += [ST.stories_section(stories, md_inline), ST.timeline_section(stories, md_inline)]
    back += [b.answers_html(chapters), b.glossary_html()]
    if 'models' in front:
        back.append(f'<section class="flow" id="models">{b.render_blocks(front["models"], dummy, None)}</section>')
    if 'further' in front:
        back.append(f'<section class="flow" id="further">{b.render_blocks(front["further"], dummy, None)}</section>')
    back.append(b.credits_html(chapters, stories, ledger))
    parts.append('<div class="backmatter">' + ''.join(f'<div class="front-ish">{x}</div>' for x in back) + '</div>')

    body = mark_scripts('\n'.join(parts))
    # drop contents lines whose page this build does not have (no cast yet, no models page in a fixture...)
    ids = set(re.findall(r'\bid="([^"]+)"', body))
    body = re.sub(r'<li><div class="tch"><span class="n"></span><a href="#([\w-]+)">[^<]*</a></div></li>',
                  lambda m: m.group(0) if m.group(1) in ids else '', body)
    css = open(os.path.join(ROOT, 'book.css'), encoding='utf-8').read()
    tag = re.sub(r'\W', '_', os.path.basename(out or 'main'))
    widgets = used_widgets(body)
    chunks, sizes = {}, []
    if site_dir:
        chunks, sizes = build_chunks(site_dir, widgets)
        live_js = bundle_live_runtime(tag)
    else:
        live_js = bundle_live_inline(widgets, tag)
    app_js, app_css = bundle_app(tag, inline_explorers=not site_dir)
    css += '\n' + app_css
    book_data = {
        'title': TITLE,
        'chapters': [{'n': c.n, 'title': plain(c.title), 'vol': c.vol,
                      'sections': [{'n': n, 'title': plain(t)} for n, t, _ in c.sections if n]}
                     for c in chapters],
        'stories': [{'id': s.id, 'title': plain(s.title), 'year': s.year, 'sort': s.sort,
                     'group': s.group, 'name': s.name, 'born': s.born, 'died': s.died, 'role': s.role, 'blurb': s.blurb,
                     'people': s.people} for s in stories],
        'scenes': b.scenes,
        'checks': [{'anchor': a[4], 'label': a[1], 'ch': a[0]} for a in b.answers],
        'predicts': [{'id': k, 'ch': v[0], 'label': v[1]} for k, v in b.predicts.items()],
    }
    data_json = json.dumps(book_data, ensure_ascii=False).replace('</', '<\\/')
    chunks_json = json.dumps(chunks).replace('</', '<\\/')
    text_for_fonts = re.sub(r'<[^>]+>', ' ', body) + TITLE + SUBTITLE + '0123456789'
    faces = font_faces(html.unescape(text_for_fonts))
    page = f'''<!doctype html>
<html lang="en-GB" data-theme="sepia" style="--scale:0.92">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{html.escape(DESCRIPTION, quote=True)}">
<meta name="theme-color" content="#f2e8d5">
<link rel="icon" href="data:image/svg+xml,{FAVICON}">
{head_extra}
<style>
{faces}
{css}
</style>
</head>
<body class="vol-1">
<div class="bar" aria-hidden="true"><i></i></div>
<nav class="navbtn" aria-label="Book navigation"><a href="#contents">Contents</a><div id="toolbar" class="toolbar" role="toolbar" aria-label="Reading tools"></div></nav>
{DEFS}
<main class="book">
{body}
</main>
{ST.DIALOG_HTML}
<script>window.BOOK_CHUNKS={chunks_json};</script>
<script>{JS}</script>
<script>{ST.DIALOG_JS}</script>
<script>{live_js}</script>
<script type="application/json" id="book-data">{data_json}</script>
<script>{app_js}</script>
</body>
</html>'''
    os.makedirs(os.path.join(ROOT, 'build'), exist_ok=True)
    out = out or os.path.join(ROOT, 'build', f'{OUT_NAME}.html')
    open(out, 'w', encoding='utf-8').write(page)
    print(f'wrote {out}  ({len(page.encode())/1024:.0f} KB, {len(chapters)} chapters, {len(b.answers)} checks, '
          f'{len(b.predicts)} predictions, {len(b.glossary)} terms, {len(widgets)} live widgets)')
    if pdf:
        make_pdf(out)
    return out, sizes


def make_pdf(path):
    from playwright.sync_api import sync_playwright
    pdf = path.replace('.html', '.pdf')
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page()
        pg.goto('file://' + os.path.abspath(path), wait_until='load')
        pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
        pg.emulate_media(media='print', color_scheme='light')
        pg.wait_for_timeout(300)
        pg.pdf(path=pdf, format='A4', print_background=True, display_header_footer=True,
               header_template='<div></div>',
               footer_template=('<div style="font-family:Georgia,serif;font-size:7.5pt;color:#5d6c66;width:100%;'
                                'padding:0 18mm 0 18mm;display:flex;justify-content:space-between;">'
                                f'<span>{TITLE}</span><span class="pageNumber"></span></div>'),
               margin={'top': '17mm', 'bottom': '18mm', 'left': '18mm', 'right': '16mm'},
               prefer_css_page_size=True)
        br.close()
    print('wrote', pdf)


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--pdf', action='store_true')
    ap.add_argument('--only', help='comma-separated chapter numbers, e.g. 2,3')
    ap.add_argument('--out', help='output html path (single self-contained file)')
    ap.add_argument('--site', help='write a GitHub Pages folder here (index.html + lazy chunks + service worker)')
    ap.add_argument('--src', help='source folder (default: src/)')
    ap.add_argument('--provenance', help='provenance ledger folder (default: provenance/)')
    ap.add_argument('--allow-missing-provenance', action='store_true',
                    help='warn instead of failing when a numbered section has no provenance entry (partial drafts)')
    a = ap.parse_args()
    if a.src:
        SRC = os.path.abspath(a.src)
    if a.provenance:
        PROV = os.path.abspath(a.provenance)
    ALLOW_MISSING_PROV = a.allow_missing_provenance
    only = [int(x) for x in a.only.split(',')] if a.only else None
    if a.site:
        make_site(os.path.abspath(a.site), only=only); sys.exit()
    build(pdf=a.pdf, only=only, out=os.path.abspath(a.out) if a.out else None)
