"""Stories behind the ideas: long-form, story-first explanations that open from links in the text.

Each story lives in src/stories/<id>.md:

    ---
    id: cavendish-shed
    title: Weighing the world from a garden shed
    year: 1798                    (shown above the title)
    sort: 1798                    (number used to place it on the timeline)
    people: Henry Cavendish, John Michell
    group: sky                    (people | tales | motion | fluids | sky | energy | waves | fields | atoms | tools)
    terms: torsion balance, Cavendish experiment   (words in the main text that link here; longest match wins)
    blurb: One sentence for the timeline and the index.
    ---
    Markdown body, with the same blocks as chapters (:::fig, :::live, :::work, :::careful, :::home, :::scene ...).

Life stories (group: people, ids p-<surname>) also carry name, born, died and role; they become the cast cards.
The build links the first mention of any term in each section of the book (and in other stories) to the story.
"""
from __future__ import annotations
import glob, os, re
from html import escape

GROUPS = [
    ('people', 'The cast: lives of the physicists'),
    ('tales', 'True stories that sound made up'),
    ('motion', 'Motion and force'),
    ('fluids', 'Pressure and floating'),
    ('sky', 'Gravity and the sky'),
    ('energy', 'Energy and heat'),
    ('waves', 'Sound and light'),
    ('fields', 'Electricity and magnetism'),
    ('atoms', 'Atoms, stars and the universe'),
    ('tools', 'Thinking tools'),
]


class Story:
    def __init__(self, path, idx):
        raw = open(path, encoding='utf-8').read()
        m = re.match(r'---\n(.*?)\n---\n', raw, re.S)
        meta = dict(re.findall(r'^(\w+):[ \t]*(.*)$', m.group(1), re.M)) if m else {}
        self.id = meta.get('id') or os.path.splitext(os.path.basename(path))[0]
        self.title = meta.get('title', self.id).strip()
        self.year = meta.get('year', '').strip()
        try:
            self.sort = float(meta.get('sort', '') or 9999)
        except ValueError:
            self.sort = 9999
        self.people = meta.get('people', '').strip()
        self.group = meta.get('group', 'tools').strip()
        self.terms = [t.strip() for t in meta.get('terms', '').split(',') if t.strip()]
        self.blurb = meta.get('blurb', '').strip()
        self.born = meta.get('born', '').strip()
        self.died = meta.get('died', '').strip()
        self.role = meta.get('role', '').strip()
        self.name = meta.get('name', '').strip() or self.title
        self.src = raw[m.end():] if m else raw
        self.n = f'S{idx}'      # used for figure numbering
        self.fig_no = 0
        self.html = ''


def load(src):
    """Every story in <src>/stories/*.md (src is the book's src folder, or a test fixture's)."""
    paths = sorted(glob.glob(os.path.join(src, 'stories', '*.md')))
    return [Story(p, i + 1) for i, p in enumerate(paths)]


# ------------------------------------------------------------------ automatic links
SKIP = {'a', 'h1', 'h2', 'h3', 'h4', 'svg', 'button', 'summary', 'script', 'style', 'code', 'figcaption', 'dt'}


class Linker:
    def __init__(self, stories):
        self.by_term = {}
        # people's life stories win their names; everything else first come, first served
        for s in sorted(stories, key=lambda s: s.group != 'people'):
            for t in s.terms:
                self.by_term.setdefault(t.lower(), s.id)
        terms = sorted(self.by_term, key=len, reverse=True)
        def pat(t):
            return re.escape(t).replace("\\'", "['’‘]").replace('’', "['’‘]")
        self.by_term = {re.sub("['’‘]", "'", k): v for k, v in self.by_term.items()}
        self.rx = re.compile(r"(?<![\w’'-])(" + '|'.join(pat(t) for t in terms) + r")(?![\w-])", re.I) if terms else None

    def link(self, html: str, exclude: str | None = None, seen: set | None = None) -> str:
        """Link the first mention of each story in this chunk of HTML. `seen` carries over within a scope."""
        if not self.rx:
            return html
        seen = set() if seen is None else seen
        if exclude:
            seen.add(exclude)
        out, stack = [], []
        for part in re.split(r'(<[^>]+>)', html):
            if part.startswith('<'):
                m = re.match(r'<(/?)([a-zA-Z0-9]+)', part)
                if m:
                    closing, name = m.group(1) == '/', m.group(2).lower()
                    selfclose = part.endswith('/>')
                    if not closing and not selfclose and (name in SKIP or 'class="bh"' in part or 'class="nuc"' in part
                                                          or 'class="n"' in part or 'class="scene"' in part or 'class="side' in part):
                        stack.append(name)
                    elif closing and stack and stack[-1] == name:
                        stack.pop()
                out.append(part)
                continue
            if stack or not part.strip():
                out.append(part)
                continue

            def rep(mm):
                sid = self.by_term.get(re.sub("['’‘]", "'", mm.group(1).lower()))
                if not sid or sid in seen:
                    return mm.group(0)
                seen.add(sid)
                return f'<a class="sl" href="#story-{sid}" data-story="{sid}">{mm.group(0)}</a>'
            out.append(self.rx.sub(rep, part))
        return ''.join(out)


# ------------------------------------------------------------------ pages
def story_article(s: Story) -> str:
    who = f'<p class="st-people">{escape(s.people)}</p>' if s.people else ''
    if s.born or s.role:
        life = ' to '.join(x for x in (s.born, s.died) if x)
        who = (f'<p class="st-people">' + (f'<span class="st-life">{escape(life)}</span>' if life else '')
               + f'{escape(s.role)}</p>')
    yr = f'<p class="st-year">{escape(s.year)}</p>' if s.year else ''
    if s.born:   # a life story: the kicker names the person; the life dates sit under the title
        yr = f'<p class="st-year">{escape(s.name)}</p>'
    medal = (f'<div class="medal" data-seed="{escape(s.id)}" aria-hidden="true"><canvas></canvas>'
             f'<span>{escape(initials(s.name))}</span></div>') if s.born else ''
    cls = 'story is-life' if s.born else 'story'
    return (f'<article class="{cls}" id="story-{s.id}" data-story-title="{escape(s.title)}" data-group="{s.group}">'
            f'<header class="st-head">{medal}<div class="st-hd">{yr}<h3>{s.title}</h3>{who}</div></header>{s.html}'
            f'<p class="fin" aria-hidden="true"><i></i><i></i><i></i></p></article>')


def stories_section(stories, md_inline) -> str:
    out = ['<section class="stories flow" id="stories"><h2>Stories behind the ideas</h2>'
           '<p class="st-intro">Every big idea in physics was found by someone, somewhere, often after years of getting it wrong. '
           'These are their stories, told slowly, with the idea explained step by step. Any word in the book that has a story '
           'is <a class="sl" href="#story-index" data-noopen>marked like this</a>; tap it and the story opens beside the page.</p>'
           '<nav class="st-index" id="story-index" aria-label="All stories">']
    for gid, gname in GROUPS:
        items = sorted([s for s in stories if s.group == gid], key=lambda s: s.sort)
        if not items:
            continue
        out.append(f'<div class="st-group"><p class="st-gname">{gname}</p><ul>')
        for s in items:
            out.append(f'<li><a class="sl" href="#story-{s.id}" data-story="{s.id}">{md_inline(s.title)}</a>'
                       + (f'<span>{escape(s.year)}</span>' if s.year else '') + '</li>')
        out.append('</ul></div>')
    out.append('</nav>')
    for gid, gname in GROUPS:
        for s in [s for s in stories if s.group == gid]:
            out.append(story_article(s))
    out.append('</section>')
    return ''.join(out)


def initials(name):
    parts = [p for p in re.split(r'[\s.]+', name) if p and p[0].isupper() and p.lower() not in ('van', 'de', 'von')]
    return (parts[0][0] + (parts[-1][0] if len(parts) > 1 else '')) if parts else '?'


def cast_section(stories, md_inline) -> str:
    people = sorted([s for s in stories if s.born], key=lambda s: int(re.sub(r'\D', '', s.born)[:4] or 9999))
    if not people:
        return ''
    cards = ''.join(
        f'<li><a class="sl cast-card" href="#story-{s.id}" data-story="{s.id}"><span class="mono medal" data-seed="{escape(s.id)}" aria-hidden="true"><canvas></canvas><span>{escape(initials(s.name))}</span></span>'
        f'<b>{escape(s.name)}</b><span class="yrs">{escape(" to ".join(x for x in (s.born, s.died) if x))}</span>'
        f'<span class="role">{escape(s.role)}</span></a></li>' for s in people)
    return ('<section class="front flow cast-page" id="cast"><h2>The cast</h2>'
            '<p>Every adventure has its characters. These are some of the people you will meet in this book: '
            'star-gazers and instrument-makers, a ship\u2019s doctor, a teacher in Dacca who wrote to a famous stranger, '
            'and women who had to fight to be allowed to study. Tap anyone to read their life story.</p>'
            f'<ul class="cast full">{cards}</ul></section>')


def timeline_section(stories, md_inline) -> str:
    items = sorted([s for s in stories if s.sort < 9999], key=lambda s: s.sort)

    def era(y):
        if y < 500: return 'The ancient world'
        if y < 1600: return 'The Middle Ages'
        c = int(y) // 100
        return f'The {c}00s'
    rows, last = [], None
    for s in items:
        e = era(s.sort)
        if e != last:
            rows.append(f'<li class="tl-c" role="presentation"><span>{e}</span></li>')
            last = e
        rows.append(f'<li><span class="tl-y">{escape(s.year)}</span><div><a class="sl" href="#story-{s.id}" data-story="{s.id}">'
                    f'{md_inline(s.title)}</a><p>{md_inline(s.blurb)}</p></div></li>')
    rows = ''.join(rows)
    return ('<section class="timeline flow" id="timeline"><h2>The adventure in time</h2>'
            '<p>The ideas in this book were not found in the order a textbook teaches them. Here they are in the order '
            'they actually happened: two and a half thousand years of people asking how things move, and why.</p>'
            f'<ol class="tl">{rows}</ol></section>')


def callout(s: Story, md_inline) -> str:
    return (f'<aside class="st-callout"><p class="bh">The story behind this</p>'
            f'<a class="sl st-card" href="#story-{s.id}" data-story="{s.id}"><b>{md_inline(s.title)}</b>'
            f'<span>{md_inline(s.blurb)}</span></a></aside>')


DIALOG_JS = r'''
(function(){
  var dlg=document.getElementById('storydlg'); if(!dlg) return;
  var body=dlg.querySelector('.sd-body'), back=dlg.querySelector('.sd-back'), title=dlg.querySelector('.sd-title');
  var current=null, home=null, depth=0;   // depth = story entries we pushed onto browser history
  function emit(n,d){ if(window.App) window.App.emit(n,d); }
  function restore(){ if(current&&home){ home.parent.insertBefore(current, home.next); } current=null; home=null; }
  function swap(art){
    restore();
    home={parent:art.parentNode, next:art.nextSibling}; current=art;
    body.innerHTML=''; body.appendChild(art); body.scrollTop=0;
    title.textContent=art.getAttribute('data-story-title')||'';
  }
  function show(id, mode){            // mode: 'push' (from a click), 'pop' (from history), 'load'
    var art=document.getElementById('story-'+id); if(!art) return false;
    var go=function(){ swap(art); };
    if(window.App && dlg.open) window.App.transition(go); else go();
    if(mode==='push'){ history.pushState({story:id}, '', '#story-'+id); depth++; }
    back.hidden = depth<2;
    if(!dlg.open){ dlg.showModal(); document.documentElement.classList.add('sd-open'); }
    body.setAttribute('tabindex','-1'); body.focus({preventScroll:true});
    document.title = (art.getAttribute('data-story-title')||'') + ' · ' + baseTitle;
    emit('story:open', {id:id, el:art});
    return true;
  }
  var baseTitle=document.title;
  function hide(){ restore(); if(dlg.open) dlg.close(); document.documentElement.classList.remove('sd-open'); document.title=baseTitle; emit('story:close'); }
  function close(){ if(depth>0){ var n=depth; depth=0; history.go(-n); } else { if(/^#story-/.test(location.hash)) history.replaceState(null,'',location.pathname+location.search); hide(); } }
  window.__openStory=function(id){ return show(id,'push'); };
  window.__closeStory=close;
  dlg.addEventListener('cancel',function(e){ e.preventDefault(); close(); });
  dlg.querySelector('.sd-close').addEventListener('click',close);
  back.addEventListener('click',function(){ history.back(); });
  dlg.addEventListener('click',function(e){ if(e.target===dlg) close(); });
  window.addEventListener('popstate',function(){
    var m=/^#story-([\w-]+)$/.exec(location.hash);
    if(m){ if(depth>0) depth--; show(m[1],'pop'); } else { depth=0; hide(); }
  });
  document.addEventListener('click',function(e){
    var a=e.target.closest && e.target.closest('a.sl[data-story]'); if(!a) return;
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button) return;
    if(show(a.getAttribute('data-story'),'push')) e.preventDefault();
  });
  // jump links inside an open story (e.g. to a section of the book) close the panel first
  body.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]:not([data-story])'); if(!a) return;
    e.preventDefault(); var target=a.getAttribute('href'); depth=0; hide();
    history.pushState(null,'',target); var t=document.querySelector(target); if(t) t.scrollIntoView();
  });
  var m=/^#story-([\w-]+)$/.exec(location.hash);
  if(m) setTimeout(function(){ show(m[1],'load'); },0);
})();
'''

DIALOG_HTML = ('<dialog id="storydlg" class="storydlg" aria-label="Story"><div class="sd-bar">'
               '<button type="button" class="sd-back" hidden>Back</button><p class="sd-title"></p>'
               '<button type="button" class="sd-close" aria-label="Close the story">Close</button></div>'
               '<div class="sd-body"></div></dialog>')
