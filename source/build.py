#!/usr/bin/env python3
"""Build The Invisible World into one self-contained HTML file (and optionally a PDF).

    python3 build.py            # -> build/The-Invisible-World.html
    python3 build.py --pdf      # also -> build/The-Invisible-World.pdf

Source layout
  src/front/*.md        letter, how-to-read, big ideas (rendered in fixed order)
  src/chNN.md           one file per chapter (see FORMAT.md)
  figs_*.py             figure functions registered with @figure
"""
from __future__ import annotations
import base64, glob, html, importlib, io, json, os, re, subprocess, sys
import markdown

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
from figs_core import FIGS, DEFS  # noqa: E402
import stories as ST  # noqa: E402

for f in sorted(glob.glob(os.path.join(ROOT, 'figs_*.py'))):
    name = os.path.splitext(os.path.basename(f))[0]
    if name != 'figs_core':
        importlib.import_module(name)

TITLE = 'The Invisible World'
SUBTITLE = 'Chemistry from the atom up'
VOLUMES = [
    (1, 'Volume I', 'Particles and structure',
     'What everything is made of, how we know, and how the same few kinds of atom build water, salt, diamond and air.', [0, 1, 2, 3]),
    (2, 'Volume II', 'Change and quantity',
     'What happens when substances turn into new ones: where the atoms go, where the energy goes, how fast it happens, and how chemists count what they cannot see.', [4, 5, 6]),
    (3, 'Volume III', 'Chemistry at work',
     'Acids and batteries, the shape of the periodic table, the carbon molecules of life, and the chemistry of a changing planet.', [7, 8, 9, 10, 11]),
]
ROMAN = {1: 'I', 2: 'II', 3: 'III'}

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
}

class Chapter:
    def __init__(self, path):
        raw = open(path, encoding='utf-8').read()
        m = re.match(r'---\n(.*?)\n---\n', raw, re.S)
        meta = dict(re.findall(r'^(\w+):\s*(.*)$', m.group(1), re.M))
        self.n = int(meta['chapter'])
        self.title = meta['title'].strip()
        self.question = meta.get('question', '').strip()
        self.short = meta.get('short', self.title).strip()
        self.vol = next(v[0] for v in VOLUMES if self.n in v[4])
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

class Builder:
    def __init__(self):
        self.answers = []   # (chapter n, label, qhtml, ahtml, anchor)
        self.glossary = {}  # term -> (html, anchor, label)
        self.scenes = []    # {id, text, where, kind}
        self.home_ids = set()
        self.stories = {}
        self.linker = ST.Linker([])

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
                        out[k] = out[k].replace('<figure', f'<figure data-live="{name}" data-live-params="{prm_attr}"', 1)
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
                    sid = f'scene-{len(self.scenes) + 1}'
                    where = f'story:{ch.id}' if hasattr(ch, 'id') else f'ch:{ch.n}'
                    self.scenes.append({'id': sid, 'text': plain(arg), 'where': where})
                    out.append(f'<p class="scene" id="{sid}">{ICONS["pin"]}<span>{md_inline(arg)}</span></p>')
                last_text = False; note_pos = None
                i += 1
                if i < len(lines) and lines[i].strip() == ':::':
                    i += 1
                continue
            if kind in ('fig', 'figwide', 'figcap'):
                out.append(self.figure(arg, ch, kind)); i += 1
                last_text = False; note_pos = None
                if i < len(lines) and lines[i].strip() == ':::':
                    i += 1  # tolerate a stray closing fence
                continue
            j = i + 1; inner = []
            while j < len(lines) and lines[j].strip() != ':::':
                inner.append(lines[j]); j += 1
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

    def figure(self, arg, ch, kind):
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
        return f'<figure{cls} id="fig-{num.replace(".", "-")}">{svg}{capt}</figure>'

    def block(self, kind, arg, inner, ch, sec):
        label = sec or str(ch.n)
        if kind == 'note':
            anchor = f's{label.replace(".", "-")}'
            self.glossary.setdefault(arg, (md(inner), anchor, label))
            return f'<aside class="side def"><b>{md_inline(arg)}</b>{md(inner)}</aside>'
        if kind == 'aside':
            return f'<aside class="side aside">{md(inner)}</aside>'
        if kind == 'evidence':
            t, _, yr = arg.partition('|')
            yr = f' <span class="yr">{yr.strip()}</span>' if yr.strip() else ''
            return (f'<div class="box evidence"><p class="bh">{ICONS["evidence"]}<span>How do we know? '
                    f'{md_inline(t.strip())}{yr}</span></p>{md(inner)}</div>')
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
        if kind == 'check':
            q, _, a = inner.partition('\n???\n')
            k = sum(1 for x in self.answers if x[1] == label) + 1
            anchor = f'chk-{label.replace(".", "-")}' + (f'-{k}' if k > 1 else '')
            qh, ah = md(q), md(a)
            self.answers.append((ch.n, label, qh, ah, anchor))
            return (f'<div class="box check" id="{anchor}"><p class="bh">{ICONS["check"]}<span>Check yourself</span></p>{qh}'
                    f'<p class="ans"><a href="#ans-{anchor}">Answer at the back of the book</a></p>'
                    f'<template class="chk-a">{ah}</template></div>')
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
    def chapter_html(self, ch: Chapter) -> str:
        toc = ''.join(f'<li><span class="n">{n}</span><a href="#s{n.replace(".", "-")}">{md_inline(t)}</a></li>'
                      for n, t, _ in ch.sections if n)
        opener_fig = ''
        seen = set()  # each story is linked once per chapter: at its first mention
        intro = self.linker.link(self.render_blocks(ch.intro_src, ch, None), seen=seen)
        intro = re.sub(r'<p>', '<p class="lede">', intro, count=1)
        secs = []
        for n, t, body in ch.sections:
            if n:
                secs.append(f'<section class="sec" id="s{n.replace(".", "-")}"><h3><span class="n">{n}</span>{md_inline(t)}</h3>'
                            f'{self.linker.link(self.render_blocks(body, ch, n), seen=seen)}</section>')
            else:
                secs.append(f'<section class="sec end">{self.linker.link(self.render_blocks(body, ch, None), seen=seen)}</section>')
        return (f'<article class="chapter vol-{ch.vol}" id="ch{ch.n}" data-vol="{ch.vol}"><div class="flow">'
                f'<header class="opener"><p class="cn" aria-hidden="true"><span>{ch.n}</span></p><p class="cl">Chapter {ch.n}</p>'
                f'<h2>{md_inline(ch.title)}</h2>'
                + (f'<p class="bq"><span class="bq-label">The big question</span>{md_inline(ch.question)}</p>' if ch.question else '')
                + f'<ol class="chapter-toc">{toc}</ol></header>'
                f'<div class="intro">{intro}</div>{"".join(secs)}'
                f'<p class="fin" aria-hidden="true"><i></i><i></i><i></i></p></div></article>')

    def volume_html(self, v, chapters) -> str:
        n, name, title, blurb, chs = v
        items = ''.join(f'<li><span>Chapter {c.n}</span><a href="#ch{c.n}">{md_inline(c.short)}</a></li>'
                        for c in chapters if c.n in chs)
        motif = {1: 'cloud', 2: 'balance', 3: 'lattice'}.get(n, 'cloud')
        return (f'<section class="volume vol-{n}" id="vol{n}" data-vol="{n}">'
                f'<div class="vol-art" data-motif="{motif}" aria-hidden="true"><canvas></canvas></div>'
                f'<div class="in"><p class="vn"><span class="vr" aria-hidden="true">{ROMAN.get(n, n)}</span>{name}</p>'
                f'<h2>{title}</h2><p class="vb">{blurb}</p><ol>{items}</ol></div></section>')

    def toc_html(self, chapters) -> str:
        out = ['<section class="front flow toc-page" id="contents"><h2>Contents</h2><div class="toc">',
               '<ol><li><div class="tch"><span class="n"></span><a href="#letter">A letter to Kym</a></div></li>'
               '<li><div class="tch"><span class="n"></span><a href="#howto">How this book works</a></div></li>'
               '<li><div class="tch"><span class="n"></span><a href="#ideas">Four ideas that run through everything</a></div></li>'
               '<li><div class="tch"><span class="n"></span><a href="#cast">The cast</a></div></li>'
               '<li><div class="tch"><span class="n"></span><a href="#explore-table">The periodic table, inside out</a></div></li>'
               '<li><div class="tch"><span class="n"></span><a href="#explore-map">The adventure map</a></div></li></ol>']
        for v in VOLUMES:
            out.append(f'<p class="tvol vol-{v[0]}" style="color:var(--vol)">{v[1]} <span>{v[2]}</span></p><ol class="vol-{v[0]}">')
            for c in chapters:
                if c.n in v[4]:
                    secs = ''.join(
                        f'<a href="#s{n.replace(".", "-")}"><span class="sn">{n}</span><span class="st">{md_inline(t)}</span></a>'
                        for n, t, _ in c.sections if n)
                    out.append(f'<li><div class="tch"><span class="n">{c.n}</span><a href="#ch{c.n}">{md_inline(c.title)}</a>'
                               f'<div class="tsec">{secs}</div></div></li>')
            out.append('</ol>')
        out.append('<p class="tvol">At the back</p><ol>'
                   '<li><div class="tch"><span class="n"></span><a href="#stories">Stories behind the ideas</a></div></li>'
                   '<li><div class="tch"><span class="n"></span><a href="#timeline">The adventure in time</a></div></li>'
                   '<li><div class="tch"><span class="n"></span><a href="#answers">Answers to Check yourself</a></div></li>'
                   '<li><div class="tch"><span class="n"></span><a href="#glossary">Words worth knowing</a></div></li>'
                   '<li><div class="tch"><span class="n"></span><a href="#models">About the models and numbers in this book</a></div></li>'
                   '<li><div class="tch"><span class="n"></span><a href="#further">Further adventures</a></div></li></ol>')
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
                c = next(c for c in chapters if c.n == n)
                out.append(f'<h3>Chapter {n}. {md_inline(c.title)}</h3>')
            q = re.sub(r'</?p>', ' ', qh).strip()
            out.append(f'<div class="a" id="ans-{anchor}"><span class="n">{label}</span><div><p class="q">{q}</p>{ah}'
                       f'<p class="back"><a href="#{anchor}">Back to section {label}</a></p></div></div>')
        out.append('</section>')
        return ''.join(out)

    def glossary_html(self) -> str:
        items = sorted(self.glossary.items(), key=lambda kv: re.sub(r'[^a-z0-9 ]', '', kv[0].lower()))
        dl = ''.join(f'<div><dt>{md_inline(t)}</dt><dd>{re.sub(r"</?p>", " ", h).strip()} <a href="#{a}">{l}</a></dd></div>'
                     for t, (h, a, l) in items)
        return f'<section class="flow" id="glossary"><h2>Words worth knowing</h2><dl class="gloss full">{dl}</dl></section>'


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

    def embed(path, fam, weight, style, want, keep_var=True):
        font = TTFont(path)
        cmap = font.getBestCmap() or {}
        use = {c for c in want if ord(c) in cmap}
        if not use:
            return set()
        opts = subset.Options()
        opts.layout_features = ['*']
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
    return '\n'.join(css)


SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ'
SUB = '₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎'


def mark_scripts(body: str) -> str:
    """Wrap runs of Unicode superscript/subscript characters in spans so CSS can make them legible
    (the charge sign in Cl⁻ is otherwise a hairline). Text content is unchanged; svg/script/style/textarea are skipped."""
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
  var marks=[].slice.call(document.querySelectorAll('[data-vol]'));
  function onScroll(){
    var h=document.documentElement, max=h.scrollHeight-h.clientHeight;
    if(bar) bar.style.width=(max>0? (h.scrollTop/max*100):0)+'%';
    var v='1'; for(var i=0;i<marks.length;i++){ if(marks[i].getBoundingClientRect().top<window.innerHeight*.4) v=marks[i].getAttribute('data-vol'); }
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  window.addEventListener('beforeprint',function(){[].forEach.call(document.querySelectorAll('details'),function(d){d.setAttribute('open','')});});
})();
'''


def bundle_live(out_path, body):
    """Bundle live/core.js + the widgets this build uses (live/w_<name>.js for each data-live="<name>"),
    with only the parts of three.js they need, into one script."""
    names = sorted(set(re.findall(r'data-live="([\w-]+)"', body)))
    widgets = []
    for n in names:
        f = os.path.join(ROOT, 'live', f'w_{n}.js')
        if not os.path.exists(f):
            raise SystemExit(f'live widget {n!r} has no file live/w_{n}.js')
        widgets.append(f)
    if not widgets:
        return ''
    tag = re.sub(r'\W', '_', os.path.basename(out_path or 'main'))
    entry = os.path.join(ROOT, 'live', f'.entry_{tag}.js')
    bundle = os.path.join(ROOT, 'live', f'.bundle_{tag}.js')
    with open(entry, 'w') as f:
        f.write("import './core.js';\n" + ''.join(f"import './{os.path.basename(w)}';\n" for w in widgets))
    esb = os.path.join(ROOT, 'node_modules', '.bin', 'esbuild')
    subprocess.run([esb, entry, '--bundle', '--minify', '--format=iife', '--target=es2019',
                    '--legal-comments=none', f'--outfile={bundle}', '--log-level=warning'], check=True, cwd=ROOT)
    js = open(bundle, encoding='utf-8').read()
    os.remove(entry); os.remove(bundle)
    return js.replace('</script', '<\\/script')


EXPLORE_HTML = (
    '<section class="front flow explore" id="explore-table"><h2>The periodic table, inside out</h2>'
    '<p>For most of history, people knew only a handful of elements. Slide through time and watch the table fill in, '
    'one discovery at a time. Tap any element to meet the people who found it.</p>'
    '<div class="explore-mount" data-mount="ptable"><p class="noscript">This part of the book needs JavaScript.</p></div></section>'
    '<section class="front flow explore" id="explore-map"><h2>The adventure map</h2>'
    '<p>Every scene in this book happened somewhere real. Here they all are, from Abdera to Mauna Loa. '
    'Slide through time, or tap a pin to jump into the story.</p>'
    '<div class="explore-mount" data-mount="map"><p class="noscript">This part of the book needs JavaScript.</p></div></section>')

FAVICON = ("%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='4' fill='%23b8432f'/%3E"
           "%3Cellipse cx='16' cy='16' rx='14' ry='5.5' fill='none' stroke='%232f6d8f' stroke-width='2'/%3E"
           "%3Cellipse cx='16' cy='16' rx='14' ry='5.5' fill='none' stroke='%232f6d8f' stroke-width='2' transform='rotate(60 16 16)'/%3E"
           "%3Cellipse cx='16' cy='16' rx='14' ry='5.5' fill='none' stroke='%232f6d8f' stroke-width='2' transform='rotate(120 16 16)'/%3E%3C/svg%3E")
HEAD_EXTRA = ''   # filled in by --site (manifest, Open Graph tags)
SITE_URL = 'https://saxster.github.io/kym-chem/'
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
    '<script>if("serviceWorker" in navigator && location.protocol==="https:"){{addEventListener("load",function(){{'
    'navigator.serviceWorker.register("sw.js").catch(function(){{}});}});}}</script>')


def make_site(site_dir):
    """Write a GitHub Pages folder: index.html, manifest, service worker, icons, preview image, notices."""
    global HEAD_EXTRA
    import hashlib, shutil
    os.makedirs(site_dir, exist_ok=True)
    desc = f'{SUBTITLE}. A chemistry book told as a historical adventure, with living figures, stories and the people who found it all.'
    HEAD_EXTRA = SITE_HEAD.format(url=SITE_URL, title=TITLE, desc=html.escape(desc, quote=True))
    index = os.path.join(site_dir, 'index.html')
    build(out=index)
    HEAD_EXTRA = ''
    ver = hashlib.sha1(open(index, 'rb').read()).hexdigest()[:10]
    json.dump({'name': TITLE, 'short_name': 'Invisible World', 'description': desc, 'start_url': './', 'scope': './',
               'display': 'standalone', 'background_color': '#f2e8d5', 'theme_color': '#f2e8d5',
               'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
                         {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'}]},
              open(os.path.join(site_dir, 'manifest.webmanifest'), 'w'), indent=1)
    open(os.path.join(site_dir, 'sw.js'), 'w').write(SW_JS.replace('__VER__', ver))
    open(os.path.join(site_dir, '.nojekyll'), 'w').write('')
    for f in ('README.md', 'NOTICES.md', 'LICENSE.md'):
        src = os.path.join(ROOT, 'site_src', f)
        if os.path.exists(src):
            shutil.copy(src, os.path.join(site_dir, f))
    make_images(index, site_dir)
    print('site ready in', site_dir, 'version', ver)


SW_JS = '''// Offline support: the whole book is one page, so cache it and serve it when offline.
const CACHE = 'iw-__VER__';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // network first for the page (so new editions arrive), cache as fallback; cache first for the rest
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
'''


def make_images(index, site_dir):
    from playwright.sync_api import sync_playwright
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


def bundle_app(out_path):
    """Bundle app/core.js and every feature module app/m_*.js into one script; concatenate app/*.css."""
    adir = os.path.join(ROOT, 'app')
    if not os.path.isdir(adir):
        return '', ''
    skip = set(filter(None, os.environ.get('SKIP_APP', '').split(',')))
    mods = [m for m in sorted(glob.glob(os.path.join(adir, 'm_*.js'))) if os.path.basename(m) not in skip]
    tag = re.sub(r'\W', '_', os.path.basename(out_path or 'main'))
    entry = os.path.join(adir, f'.entry_{tag}.js')
    bundle = os.path.join(adir, f'.bundle_{tag}.js')
    with open(entry, 'w') as f:
        f.write("import './core.js';\n" + ''.join(f"import './{os.path.basename(m)}';\n" for m in mods))
    esb = os.path.join(ROOT, 'node_modules', '.bin', 'esbuild')
    subprocess.run([esb, entry, '--bundle', '--minify', '--format=iife', '--target=es2019', '--loader:.json=json',
                    '--legal-comments=none', f'--outfile={bundle}', '--log-level=warning'], check=True, cwd=ROOT)
    js = open(bundle, encoding='utf-8').read()
    os.remove(entry); os.remove(bundle)
    css = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(adir, '*.css'))) if os.path.basename(f) not in skip)
    return js.replace('</script', '<\\/script'), css


def build(pdf=False, only=None, out=None):
    b = Builder()
    stories = ST.load(ROOT)
    b.stories = {s.id: s for s in stories}
    b.linker = ST.Linker(stories)
    chapters = [Chapter(p) for p in sorted(glob.glob(os.path.join(ROOT, 'src', 'ch*.md')))]
    chapters.sort(key=lambda c: c.n)
    if only is not None:
        chapters = [c for c in chapters if c.n in only]
    front = {k: open(os.path.join(ROOT, 'src', 'front', f'{k}.md'), encoding='utf-8').read()
             for k in ('letter', 'howto', 'ideas', 'models', 'further')
             if os.path.exists(os.path.join(ROOT, 'src', 'front', f'{k}.md'))}
    dummy = type('C', (), {'n': 0, 'fig_no': 0})()

    cover = FIGS['cover_art']() if 'cover_art' in FIGS else ''
    from figs_front import featured
    n_feat = len(featured())
    parts = [f'''<header class="cover" id="top"><canvas class="field" aria-hidden="true"></canvas><div class="title"><h1>{TITLE}</h1>
<p class="sub">{SUBTITLE}. Twelve chapters on what everything is made of, how it changes, and how we know.</p>
<p class="for">Written for Kym</p>
<p class="begin"><a href="#letter">Start reading</a></p></div>
<figure class="art">{cover}<figcaption class="legend"><i></i>The {n_feat} elements you will meet in this book, out of the 118 known today.</figcaption></figure></header>''']
    if 'letter' in front:
        parts.append(f'<section class="front flow letter" id="letter">{b.render_blocks(front["letter"], dummy, None)}</section>')
    if 'howto' in front:
        parts.append(f'<section class="front flow howto" id="howto">{b.render_blocks(front["howto"], dummy, None)}</section>')
    if 'ideas' in front:
        parts.append(f'<section class="front flow ideas-page" id="ideas">{b.render_blocks(front["ideas"], dummy, None)}</section>')
    parts.append(b.toc_html(chapters))
    parts.append(ST.cast_section(stories, md_inline))
    parts.append(EXPLORE_HTML)
    for v in VOLUMES:
        parts.append(b.volume_html(v, chapters))
        for c in chapters:
            if c.n in v[4]:
                parts.append(b.chapter_html(c))
    for s in stories:
        s.html = b.linker.link(b.render_blocks(s.src, s, None), exclude=s.id)
    back = []
    if stories:
        back += [ST.stories_section(stories, md_inline), ST.timeline_section(stories, md_inline)]
    back += [b.answers_html(chapters), b.glossary_html()]
    if 'models' in front:
        back.append(f'<section class="flow" id="models">{b.render_blocks(front["models"], dummy, None)}</section>')
    if 'further' in front:
        back.append(f'<section class="flow" id="further">{b.render_blocks(front["further"], dummy, None)}</section>')
    parts.append('<div class="backmatter">' + ''.join(f'<div class="front-ish">{x}</div>' for x in back) + '</div>')

    body = mark_scripts('\n'.join(parts))
    css = open(os.path.join(ROOT, 'book.css'), encoding='utf-8').read()
    live_js = bundle_live(out, body)
    app_js, app_css = bundle_app(out)
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
    }
    data_json = json.dumps(book_data, ensure_ascii=False).replace('</', '<\\/')
    text_for_fonts = re.sub(r'<[^>]+>', ' ', body) + TITLE + SUBTITLE + '0123456789'
    faces = font_faces(html.unescape(text_for_fonts))
    page = f'''<!doctype html>
<html lang="en-GB" data-theme="sepia" style="--scale:0.92">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{SUBTITLE}: a chemistry book written for Kym, told as a historical adventure.">
<meta name="theme-color" content="#f2e8d5">
<link rel="icon" href="data:image/svg+xml,{FAVICON}">
{HEAD_EXTRA}
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
<script>{JS}</script>
<script>{ST.DIALOG_JS}</script>
<script>{live_js}</script>
<script type="application/json" id="book-data">{data_json}</script>
<script>{app_js}</script>
</body>
</html>'''
    os.makedirs(os.path.join(ROOT, 'build'), exist_ok=True)
    out = out or os.path.join(ROOT, 'build', 'The-Invisible-World.html')
    open(out, 'w', encoding='utf-8').write(page)
    print(f'wrote {out}  ({len(page)/1024:.0f} KB, {len(chapters)} chapters, {len(b.answers)} checks, {len(b.glossary)} terms)')
    if pdf:
        make_pdf(out)
    return out


def make_pdf(path):
    from playwright.sync_api import sync_playwright
    pdf = path.replace('.html', '.pdf')
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page()
        pg.goto('file://' + path, wait_until='load')
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
    ap.add_argument('--out', help='output html path')
    ap.add_argument('--site', help='write a GitHub Pages folder here')
    a = ap.parse_args()
    if a.site:
        make_site(os.path.abspath(a.site)); sys.exit()
    build(pdf=a.pdf, only=[int(x) for x in a.only.split(',')] if a.only else None, out=a.out)
