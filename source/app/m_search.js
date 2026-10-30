// Search the whole book: sections, stories, the cast and the glossary. Cmd/Ctrl-K or "/".
import App from './core.js';

const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>';
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[‘’]/g, "'").replace(/[₀-₉]/g, d => String(d.charCodeAt(0) - 0x2080))
  .replace(/[⁰¹²³⁴-⁹]/g, d => '0123456789'['⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(d)]);
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const BLOCKS = 'p, h1, h2, h3, h4, li, dt, dd, div, header, aside, figcaption, section, article, td, th, br';
function cleanText(node, drop) {
  const c = node.cloneNode(true);
  c.querySelectorAll('svg, template, script, style, .live-controls, .live-open, button, .hlink, .chapter-toc' + (drop ? ', ' + drop : '')).forEach(n => n.remove());
  c.querySelectorAll(BLOCKS).forEach(n => n.after(document.createTextNode(' ')));
  return c.textContent.replace(/\s+/g, ' ').trim();
}
const isWordChar = ch => !!ch && /[a-z0-9]/.test(ch);
// does token t occur in folded string f starting at a word boundary?
function wordStarts(f, t) { let i = -1, k = 0; while ((i = f.indexOf(t, i + 1)) !== -1) if (!isWordChar(f[i - 1])) k++; return k; }
function wholeWord(f, t) { let i = -1; while ((i = f.indexOf(t, i + 1)) !== -1) if (!isWordChar(f[i - 1]) && !isWordChar(f[i + t.length])) return true; return false; }

let index = null;
function buildIndex() {
  const out = [];
  document.querySelectorAll('article.chapter').forEach(ch => {
    const chTitle = (ch.querySelector('.opener h2') || {}).textContent || '';
    const chN = ch.id.replace('ch', '');
    const intro = ch.querySelector('.intro');
    if (intro) out.push({ kind: 'Chapter', label: `Chapter ${chN}`, title: chTitle.trim(), text: cleanText(intro), target: ch.id });
    ch.querySelectorAll('section.sec[id]').forEach(sec => {
      const h = sec.querySelector(':scope > h3');
      const n = h && h.querySelector('.n') ? h.querySelector('.n').textContent.trim() : '';
      const t = h ? cleanText(h).replace(n, '').trim() : '';
      out.push({ kind: 'Section', label: `Section ${n}`, title: t, text: cleanText(sec).replace(cleanText(h || sec), ''), target: sec.id });
    });
  });
  document.querySelectorAll('article.story[id^="story-"]').forEach(a => {
    const id = a.id.slice(6);
    const isCast = !!document.querySelector(`#cast a[data-story="${id}"]`);
    out.push({ kind: isCast ? 'Life story' : 'Story', label: isCast ? 'Life story' : 'Story', title: a.getAttribute('data-story-title') || id, text: cleanText(a, 'header.st-head'), story: id, boost: 8 });
  });
  document.querySelectorAll('#cast .cast-card').forEach(c => {
    const name = (c.querySelector('b') || {}).textContent || '';
    out.push({ kind: 'Person', label: 'The cast', title: name, text: cleanText(c).replace(name, ''), story: c.getAttribute('data-story'), boost: 30 });
  });
  document.querySelectorAll('#glossary dl > div').forEach(d => {
    const dt = d.querySelector('dt'), dd = d.querySelector('dd');
    if (!dt || !dd) return;
    const link = dd.querySelector('a[href^="#"]');
    out.push({ kind: 'Word', label: 'Word worth knowing', title: dt.textContent.trim(), text: cleanText(dd, 'a[href^="#"]:last-child'), target: link ? link.getAttribute('href').slice(1) : 'glossary', boost: 10 });
  });
  (App.data.lessons || []).forEach(l => {
    out.push({ kind: 'Experiment', label: 'Try an experiment', title: l.title,
      text: [l.object, l.question, l.encounter, l.description].filter(Boolean).join(' '),
      target: l.target, lesson: l.id, boost: 15 });
  });
  document.querySelectorAll('#exam-prep .exam-question').forEach(q => {
    const title = q.querySelector('h4, h5');
    out.push({ kind: 'Practice', label: 'Exam practice question', title: title?.textContent.trim() || 'Motion practice',
      text: cleanText(q, '.exam-solution, .exam-response-ui, .exam-marking-ui, .exam-scaffold'), target: q.id, boost: 12 });
  });
  document.querySelectorAll('#exam-prep .exam-word').forEach(card => {
    out.push({ kind: 'Revision', label: 'Motion revision card', title: card.querySelector('h4')?.textContent.trim() || 'Motion word', text: cleanText(card, 'details'), target: card.id });
  });
  ['letter', 'howto', 'ideas', 'investigations', 'exam-prep', 'explore-scale', 'explore-sky', 'explore-spectrum', 'explore-map', 'timeline', 'further', 'credits'].forEach(id => {
    const s = document.getElementById(id);
    if (!s) return;
    const h = s.querySelector('h2');
    out.push({ kind: 'Page', label: 'Page', title: h ? h.textContent.trim() : id,
      text: cleanText(s, id === 'exam-prep' ? '.exam-solution, .exam-response-ui, .exam-marking-ui, .exam-scaffold, .exam-word details' : null), target: id });
  });
  out.forEach(e => { e.ft = fold(e.title); e.fx = fold(e.text); });
  return out;
}

function search(q) {
  const fq = fold(q.trim());
  if (!fq) return [];
  const toks = fq.split(/\s+/).filter(Boolean);
  const res = [];
  for (const e of index) {
    if (!toks.every(t => e.ft.includes(t) || e.fx.includes(t))) continue;
    let s = e.boost || 0;
    if (e.ft === fq) s += 300;
    else if (wholeWord(e.ft, fq)) s += 170;
    else if (toks.every(t => wordStarts(e.ft, t))) s += 90;
    else if (e.ft.includes(fq)) s += 40;
    s += toks.filter(t => wholeWord(e.ft, t)).length * 20;
    if (wholeWord(e.fx, fq)) s += 20;
    let hits = 0;
    for (const t of toks) hits += Math.min(12, wordStarts(e.fx, t));
    s += Math.min(hits, 16) * 2;
    if (e.kind === 'Section' || e.kind === 'Chapter') s += 3;
    res.push({ e, s });
  }
  res.sort((a, b) => b.s - a.s);
  return res.slice(0, 40).map(r => r.e);
}

function snippet(e, toks) {
  const text = e.text, ft = e.fx;
  let at = -1;
  for (const t of toks) { let i = -1; while ((i = ft.indexOf(t, i + 1)) !== -1) if (!isWordChar(ft[i - 1])) { at = i; break; } if (at !== -1) break; }
  if (at === -1) for (const t of toks) { at = ft.indexOf(t); if (at !== -1) break; }
  if (at === -1) return esc(text.slice(0, 140)) + (text.length > 140 ? '…' : '');
  const a = Math.max(0, at - 60), b = Math.min(text.length, at + 110);
  const piece = text.slice(a, b), fpiece = ft.slice(a, b);
  // mark tokens; folded and original text are index-aligned except for rare expansions, so guard lengths
  const marks = [];
  if (fpiece.length === piece.length) for (const t of toks) { let i = -1; while ((i = fpiece.indexOf(t, i + 1)) !== -1) if (!isWordChar(fpiece[i - 1]) || (i === 0 && a > 0 && !isWordChar(ft[a - 1]))) marks.push([i, i + t.length]); }
  marks.sort((x, y) => x[0] - y[0]);
  let html = '', p = 0;
  for (const [s, f] of marks) { if (s < p) continue; html += esc(piece.slice(p, s)) + '<mark>' + esc(piece.slice(s, f)) + '</mark>'; p = f; }
  html += esc(piece.slice(p));
  return (a > 0 ? '…' : '') + html + (b < text.length ? '…' : '');
}

// ------------------------------------------------------------------ highlight in place
let hlTimer;
function highlight(root, toks) {
  if (!root || !window.CSS || !CSS.highlights || typeof Highlight === 'undefined') return;
  const ranges = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement && n.parentElement.closest('svg, script, style, template, button') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  let n;
  while ((n = walker.nextNode()) && ranges.length < 80) {
    const f = fold(n.nodeValue);
    if (f.length !== n.nodeValue.length) continue;
    for (const t of toks) {
      let i = -1;
      while ((i = f.indexOf(t, i + 1)) !== -1 && ranges.length < 80) {
        if (isWordChar(f[i - 1])) continue;
        const r = new Range(); r.setStart(n, i); r.setEnd(n, i + t.length); ranges.push(r);
      }
    }
  }
  if (!ranges.length) return;
  CSS.highlights.set('iw-search', new Highlight(...ranges));
  clearTimeout(hlTimer);
  hlTimer = setTimeout(() => CSS.highlights.delete('iw-search'), 7000);
}

App.ready(() => {
  const { el } = App;
  const input = el('input', { type: 'search', class: 'sr-in', placeholder: 'Search the book: a word, an idea, a person…',
    'aria-label': 'Search the book', autocomplete: 'off', spellcheck: 'false', role: 'combobox', 'aria-expanded': 'false',
    'aria-controls': 'sr-list', 'aria-autocomplete': 'list' });
  const list = el('ul', { class: 'sr-list', id: 'sr-list', role: 'listbox', 'aria-label': 'Results' });
  const status = el('p', { class: 'sr-status', role: 'status', 'aria-live': 'polite' });
  const dlg = el('dialog', { class: 'srch', 'aria-label': 'Search the book' },
    el('div', { class: 'sr-top' }, el('span', { class: 'sr-i', html: ICON }), input,
      el('button', { type: 'button', class: 'sr-close', 'aria-label': 'Close search', onclick: () => dlg.close() }, 'Esc')),
    status, list);
  document.body.append(dlg);

  let results = [], active = -1, toks = [];
  function render() {
    const q = input.value;
    toks = fold(q.trim()).split(/\s+/).filter(Boolean);
    results = q.trim() ? search(q) : [];
    active = results.length ? 0 : -1;
    list.innerHTML = '';
    results.forEach((e, i) => {
      list.append(el('li', { role: 'option', id: 'sr-o-' + i, class: 'sr-o', 'aria-selected': String(i === active),
        onclick: () => go(i), onmousemove: () => setActive(i) },
        el('span', { class: 'sr-k' }, e.label),
        el('span', { class: 'sr-t', html: esc(e.title) }),
        el('span', { class: 'sr-s', html: snippet(e, toks) })));
    });
    input.setAttribute('aria-expanded', String(results.length > 0));
    if (active >= 0) input.setAttribute('aria-activedescendant', 'sr-o-0'); else input.removeAttribute('aria-activedescendant');
    status.textContent = !q.trim() ? 'Try “bounce”, “Moon”, “Newton” or “battery”.'
      : results.length ? `${results.length}${results.length === 40 ? '+' : ''} result${results.length === 1 ? '' : 's'}` : 'Nothing found. Try a shorter word.';
  }
  function setActive(i) {
    if (i === active || i < 0 || i >= results.length) return;
    const prev = list.children[active]; if (prev) prev.setAttribute('aria-selected', 'false');
    active = i;
    const cur = list.children[i]; cur.setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', cur.id);
    cur.scrollIntoView({ block: 'nearest' });
  }
  function go(i) {
    const e = results[i]; if (!e) return;
    const t = toks.slice();
    dlg.close();
    if (e.lesson) {
      const link = App.el('a', { href: '#' + e.target, 'data-open-lesson': e.lesson, hidden: true });
      document.body.append(link); link.click(); link.remove();
      return;
    }
    if (e.story) {
      App.openStory(e.story);
      setTimeout(() => highlight(document.getElementById('story-' + e.story), t), 120);
      return;
    }
    const nav = () => {
      const target = document.getElementById(e.target);
      if (!target) return;
      App.emit('search:target', { id: e.target });
      history.pushState(null, '', '#' + e.target);
      target.scrollIntoView({ behavior: App.reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      highlight(target.closest('section, article') || target, t);
      const h = target.matches('section, article') ? target.querySelector('h2, h3, h4, h5') : target;
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    };
    if (document.documentElement.classList.contains('sd-open')) { App.closeStory(); setTimeout(nav, 200); } else nav();
  }

  let deb;
  input.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(render, 60); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(results.length - 1, active + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, active - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(active); }
    else if (e.key === 'Escape') { e.preventDefault(); dlg.close(); }
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  let opener = null;
  function open() {
    if (dlg.open) { input.select(); return; }
    if (!index) index = buildIndex();
    opener = document.activeElement;
    dlg.showModal();
    input.select();
    render();
  }
  dlg.addEventListener('close', () => { if (opener && opener.focus && document.contains(opener)) try { opener.focus({ preventScroll: true }); } catch (e) {} });
  App.search = { open };

  App.tool({ id: 'search', label: 'Search', icon: ICON, order: 10, title: 'Search the book (⌘K or /)', onClick: open });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); open(); return; }
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const a = document.activeElement;
      if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) return;
      e.preventDefault(); open();
    }
  });
});
