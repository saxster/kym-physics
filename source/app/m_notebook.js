// Highlights and notes (select text in a chapter section or a story), and the Notebook
// that gathers highlights, predictions, check answers and experiment journals in one place.
import App from './core.js';

const { el, store } = App;
const HL_KEY = 'hl';
const OWNED = k => k === HL_KEY || k.startsWith('chk:') || k.startsWith('home:') || k.startsWith('pred:') || k.startsWith('lab:');
const BOOK = () => App.data.title || document.title;
const SLUG = () => BOOK().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SKIP = 'svg, figure, button, textarea, input, template, script, style, .chk-ui, .home-ui, .pred-opts, .pred-you, .hl-pop, .live-controls, .scene, .bh, h2, h3, h4';
const CONTAINERS = 'section.sec[id], article.story[id]';

// ------------------------------------------------------------------ text model of a container
function textNodes(root) {
  const out = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
      // a nested container (a story card inside a section is fine; but never another section/story)
      const c = p.closest(CONTAINERS);
      if (c !== root) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let cum = 0, n;
  while ((n = w.nextNode())) { out.push({ node: n, start: cum }); cum += n.data.length; }
  return { nodes: out, text: out.map(o => o.node.data).join('') };
}

function offsetOf(model, container, offset) {
  if (container.nodeType === 3) {
    const f = model.nodes.find(o => o.node === container);
    return f ? f.start + offset : -1;
  }
  // element boundary: find first text node at/after that child
  const child = container.childNodes[offset];
  if (!child) {
    // end of element: last text node inside it
    let best = -1;
    model.nodes.forEach(o => { if (container.contains(o.node)) best = o.start + o.node.data.length; });
    return best;
  }
  const f = model.nodes.find(o => child === o.node || child.contains(o.node) || (child.compareDocumentPosition(o.node) & Node.DOCUMENT_POSITION_FOLLOWING));
  return f ? f.start : -1;
}

function locate(text, h) {
  let best = -1, bestScore = -1, i = text.indexOf(h.quote);
  while (i !== -1) {
    const pre = text.slice(Math.max(0, i - h.prefix.length), i);
    const suf = text.slice(i + h.quote.length, i + h.quote.length + h.suffix.length);
    let score = 0;
    for (let k = 1; k <= pre.length && pre[pre.length - k] === h.prefix[h.prefix.length - k]; k++) score++;
    for (let k = 0; k < suf.length && suf[k] === h.suffix[k]; k++) score++;
    if (score > bestScore) { bestScore = score; best = i; }
    i = text.indexOf(h.quote, i + 1);
  }
  return best;
}

function wrap(model, start, end, id) {
  const marks = [];
  for (const o of model.nodes) {
    const ns = o.start, ne = o.start + o.node.data.length;
    if (ne <= start || ns >= end) continue;
    let node = o.node;
    const a = Math.max(0, start - ns), b = Math.min(node.data.length, end - ns);
    if (!node.data.slice(a, b).trim()) continue;
    if (b < node.data.length) node.splitText(b);
    if (a > 0) node = node.splitText(a);
    const m = el('mark', { class: 'hl', 'data-hl': id, tabindex: '0' });
    node.parentNode.insertBefore(m, node); m.append(node);
    marks.push(m);
  }
  return marks;
}

function unwrap(id) {
  document.querySelectorAll(`mark.hl[data-hl="${id}"]`).forEach(m => {
    const p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize();
  });
}

const all = () => store.get(HL_KEY, []);
const saveAll = list => { store.set(HL_KEY, list); App.emit('learn:change'); };

function paintNote(h) {
  document.querySelectorAll(`mark.hl[data-hl="${h.id}"]`).forEach((m, i, arr) => {
    m.classList.toggle('has-note', !!h.note && i === arr.length - 1);
    m.title = h.note ? 'Your note: ' + h.note : 'Your highlight';
    m.setAttribute('aria-label', h.note ? 'Highlight with a note' : 'Highlight');
  });
}

function apply(root) {
  const list = all().filter(h => h.c === root.id);
  if (!list.length) return;
  list.forEach(h => {
    if (root.querySelector(`mark.hl[data-hl="${h.id}"]`)) return;
    const model = textNodes(root);
    const i = locate(model.text, h);
    if (i < 0) return;
    wrap(model, i, i + h.quote.length, h.id);
    paintNote(h);
  });
}
function applyAll() { document.querySelectorAll(CONTAINERS).forEach(apply); }

// ------------------------------------------------------------------ selection popover
let pop, current;
function hidePop() { if (pop) pop.hidden = true; current = null; }

function selectionInfo() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  const r = sel.getRangeAt(0);
  const sc = r.startContainer.nodeType === 3 ? r.startContainer.parentElement : r.startContainer;
  const ec = r.endContainer.nodeType === 3 ? r.endContainer.parentElement : r.endContainer;
  if (!sc || !ec) return null;
  const root = sc.closest(CONTAINERS);
  if (!root || ec.closest(CONTAINERS) !== root) return null;
  if (sc.closest(SKIP) || ec.closest(SKIP)) return null;
  const model = textNodes(root);
  let s = offsetOf(model, r.startContainer, r.startOffset), e = offsetOf(model, r.endContainer, r.endOffset);
  if (s < 0 || e <= s) return null;
  // snap to whole words, so a slightly sloppy finger still highlights clean words
  const W = /[\p{L}\p{N}’'-]/u;
  let s2 = s, e2 = e;
  while (s2 > 0 && W.test(model.text[s2 - 1]) && W.test(model.text[s2])) s2--;
  while (e2 < model.text.length && W.test(model.text[e2]) && W.test(model.text[e2 - 1])) e2++;
  while (s2 < e2 && /\s/.test(model.text[s2])) s2++;
  while (e2 > s2 && /\s/.test(model.text[e2 - 1])) e2--;
  s = s2; e = e2;
  const quote = model.text.slice(s, e);
  if (quote.trim().length < 2 || quote.length > 2000) return null;
  return { root, model, s, e, quote, rect: r.getBoundingClientRect() };
}

function onSelect() {
  const info = selectionInfo();
  if (!info) { if (pop && !pop.contains(document.activeElement)) hidePop(); return; }
  current = info;
  // a modal dialog (the story panel) makes everything outside it inert, so the popover must live inside it
  const host = info.root.closest('dialog[open]') || document.body;
  if (pop.parentElement !== host) host.append(pop);
  pop.hidden = false;
  const pw = pop.offsetWidth || 190, ph = pop.offsetHeight || 40;
  let x = info.rect.left + info.rect.width / 2 - pw / 2;
  x = Math.max(8, Math.min(window.innerWidth - pw - 8, x));
  let y = info.rect.bottom + 10;              // below, so it never fights the phone's own selection menu above
  if (y + ph > window.innerHeight - 8) y = Math.max(8, info.rect.top - ph - 10);
  pop.style.left = x + 'px'; pop.style.top = y + 'px';
  // if the host has a transform (it becomes the containing block), correct by the measured offset
  const got = pop.getBoundingClientRect();
  if (Math.abs(got.left - x) > 1 || Math.abs(got.top - y) > 1) {
    pop.style.left = (2 * x - got.left) + 'px'; pop.style.top = (2 * y - got.top) + 'px';
  }
}

function create(withNote) {
  const info = current || selectionInfo();
  if (!info) return;
  const { root, model, s, e, quote } = info;
  const h = {
    id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    c: root.id, quote,
    prefix: model.text.slice(Math.max(0, s - 32), s), suffix: model.text.slice(e, e + 32),
    note: '', t: Date.now(),
  };
  const list = all(); list.push(h); saveAll(list);
  wrap(model, s, e, h.id); paintNote(h);
  window.getSelection().removeAllRanges(); hidePop();
  if (withNote) editNote(h.id);
}

// ------------------------------------------------------------------ note editor
let noteDlg;
function editNote(id) {
  const h = all().find(x => x.id === id);
  if (!h) return;
  noteDlg.dataset.id = id;
  noteDlg.querySelector('.nd-quote').textContent = '“' + h.quote.trim() + '”';
  noteDlg.querySelector('textarea').value = h.note || '';
  noteDlg.showModal();
  noteDlg.querySelector('textarea').focus();
}
function buildNoteDlg() {
  const ta = el('textarea', { rows: 4, id: 'nd-note', class: 'lj-ta', placeholder: 'Why did this catch your eye? A question? A connection?' });
  noteDlg = el('dialog', { class: 'lj-dlg note-dlg', 'aria-labelledby': 'nd-h' },
    el('form', { method: 'dialog' },
      el('h2', { id: 'nd-h' }, 'Your note'),
      el('blockquote', { class: 'nd-quote' }),
      el('label', { class: 'lj-lab', for: 'nd-note' }, 'Note'), ta,
      el('div', { class: 'lj-row end' },
        el('button', { type: 'button', class: 'lj-link danger', onclick: () => {
          const id = noteDlg.dataset.id; unwrap(id); saveAll(all().filter(x => x.id !== id)); noteDlg.close();
        } }, 'Remove highlight'),
        el('button', { type: 'button', class: 'lj-btn', onclick: () => noteDlg.close() }, 'Cancel'),
        el('button', { type: 'button', class: 'lj-btn primary', onclick: () => {
          const id = noteDlg.dataset.id; const list = all(); const h = list.find(x => x.id === id);
          if (h) { h.note = ta.value.trim(); h.t = Date.now(); saveAll(list); paintNote(h); }
          noteDlg.close();
        } }, 'Save'))));
  noteDlg.addEventListener('click', e => { if (e.target === noteDlg) noteDlg.close(); });
  document.body.append(noteDlg);
}

// ------------------------------------------------------------------ where things live
const strip = s => String(s || '').replace(/\s+/g, ' ').trim();
const decode = s => { const t = document.createElement('textarea'); t.innerHTML = String(s || ''); return t.value; };
function placeOf(node) {
  const story = node && node.closest && node.closest('article.story[id]');
  if (story) return { kind: 'story', id: story.id.replace(/^story-/, ''), group: 'Story: ' + decode(story.dataset.storyTitle || ''), sort: 1000, link: story.id };
  const sec = node && node.closest && node.closest('section.sec[id]');
  const ch = node && node.closest && node.closest('article.chapter[id]');
  const chn = ch ? +ch.id.replace('ch', '') : 99;
  const c = (App.data.chapters || []).find(x => x.n === chn);
  const group = c ? `Chapter ${c.n}. ${decode(c.title)}` : 'The book';
  let label = '';
  if (sec) { const n = sec.id.replace(/^s/, '').replace('-', '.'); const st = c && c.sections.find(x => x.n === n); label = st ? `${n} ${decode(st.title)}` : n; }
  return { kind: 'chapter', group, sort: chn, label, link: sec ? sec.id : (ch ? ch.id : '') };
}

function goTo(targetId, story) {
  nb.close();
  const t = document.getElementById(targetId);
  if (story) {
    App.openStory(story);
    setTimeout(() => { const x = document.getElementById(targetId); if (x && x !== document.getElementById('story-' + story)) x.scrollIntoView({ block: 'center' }); }, 120);
  } else if (t) {
    if (document.getElementById('storydlg') && document.getElementById('storydlg').open) App.closeStory();
    setTimeout(() => { t.scrollIntoView({ block: 'start' }); history.replaceState(null, '', '#' + targetId); }, 60);
  }
}

// ------------------------------------------------------------------ gather everything
function gather() {
  const groups = new Map();
  const add = (place, item) => {
    const k = place.group;
    if (!groups.has(k)) groups.set(k, { name: k, sort: place.sort, items: [] });
    groups.get(k).items.push(item);
  };
  const checks = [...document.querySelectorAll('.box.check[id]')];
  let tried = 0, got = 0, partly = 0;
  checks.forEach(box => {
    const s = store.get('chk:' + box.id, null);
    if (!s || (!s.a && !s.seen && !s.r)) return;
    tried++; if (s.r === 'got') got++; if (s.r === 'partly') partly++;
    const place = placeOf(box);
    const q = strip([...box.children].filter(x => x.tagName === 'P' && !x.classList.contains('bh') && !x.classList.contains('ans')).map(x => x.textContent).join(' '));
    add(place, { type: 'check', target: box.id, story: place.kind === 'story' ? place.id : null, where: place.label, q, a: s.a, r: s.r, t: s.t });
  });
  const preds = [...document.querySelectorAll('.box.predict[data-predict]')];
  let predN = 0;
  preds.forEach(box => {
    const s = store.get('pred:' + box.dataset.predict, null);
    if (!s || s.c == null) return;
    predN++;
    const place = placeOf(box);
    add(place, { type: 'pred', target: box.id, story: place.kind === 'story' ? place.id : null, where: place.label,
      q: s.q || strip(box.querySelector('.pq') && box.querySelector('.pq').textContent), o: s.o, c: s.c, t: s.t });
  });
  const homes = [...document.querySelectorAll('.box.home[data-home]')];
  let doneN = 0;
  homes.forEach(box => {
    const s = store.get('home:' + box.dataset.home, null);
    if (!s || (!s.pred && !s.done && !s.res)) return;
    if (s.done) doneN++;
    const place = placeOf(box);
    add(place, { type: 'home', target: box.id, story: place.kind === 'story' ? place.id : null, where: place.label,
      title: strip(box.querySelector('.bh') && box.querySelector('.bh').textContent), pred: s.pred, res: s.res, done: s.done, date: s.date, t: s.t });
  });
  const hls = all();
  for (const lesson of App.data.lessons || []) {
    const saved = store.get('lab:' + lesson.id, null);
    if (!saved || (!saved.prediction && !saved.explanation)) continue;
    const root = document.getElementById(lesson.target);
    if (!root) continue;
    add(placeOf(root), { type: 'lab', target: lesson.target, lesson: lesson.id, title: lesson.title,
      pred: saved.prediction, res: saved.explanation, t: saved.t });
  }
  hls.forEach(h => {
    const root = document.getElementById(h.c);
    if (!root) return;
    const place = placeOf(root);
    const mark = document.querySelector(`mark.hl[data-hl="${h.id}"]`);
    add(place, { type: 'hl', target: mark ? null : h.c, mark: h.id, story: place.kind === 'story' ? place.id : null, where: place.label, quote: h.quote, note: h.note, t: h.t });
  });
  const list = [...groups.values()].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
  return { list, stats: { preds: preds.length, predN, checks: checks.length, tried, got, partly, homes: homes.length, done: doneN, hls: hls.length, notes: hls.filter(h => h.note).length } };
}

const RLABEL = { got: 'I got it', partly: 'Partly', not: 'Not yet' };
const fmtDate = t => t ? new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// ------------------------------------------------------------------ notebook dialog
let nb, nbBody;
function renderNotebook() {
  const { list, stats } = gather();
  nbBody.innerHTML = '';
  if (!store.available) nbBody.append(el('p', { class: 'nb-warn' }, 'This browser is not letting the book save anything, so your notes will last only while this page stays open. Use “Save my notebook” to keep a copy.'));
  nbBody.append(el('div', { class: 'nb-stats' },
    stats.preds ? stat(stats.predN, `of ${stats.preds} predictions made`, '') : null,
    stat(stats.tried, `of ${stats.checks} checks tried`, stats.got ? `${stats.got} got it` + (stats.partly ? `, ${stats.partly} partly` : '') : ''),
    stat(stats.done, `of ${stats.homes} home experiments done`, ''),
    stat(stats.hls, stats.hls === 1 ? 'highlight' : 'highlights', stats.notes ? `${stats.notes} with notes` : '')));
  if (!list.length) {
    nbBody.append(el('div', { class: 'nb-empty' },
      el('p', {}, 'Your notebook is empty for now.'),
      el('p', {}, 'Select any words in the book to highlight them or add a note. Make a prediction, answer a “Check yourself” question, or keep a journal for a “Try it at home” experiment, and it will all collect here.')));
    return;
  }
  list.forEach(g => {
    const sec = el('section', { class: 'nb-group' }, el('h3', {}, g.name));
    g.items.sort((a, b) => (a.where || '').localeCompare(b.where || '', undefined, { numeric: true }) || a.t - b.t);
    g.items.forEach(it => sec.append(item(it)));
    nbBody.append(sec);
  });
}
function stat(n, label, sub) {
  return el('div', { class: 'nb-stat' }, el('b', {}, String(n)), el('span', {}, label), sub ? el('small', {}, sub) : null);
}
function item(it) {
  const go = el('button', { type: 'button', class: 'lj-link nb-go', onclick: () => {
    if (it.type === 'hl' && it.mark) {
      if (it.story) { nb.close(); App.openStory(it.story); setTimeout(() => { const m = document.querySelector(`mark.hl[data-hl="${it.mark}"]`); if (m) m.scrollIntoView({ block: 'center' }); }, 150); }
      else { nb.close(); const m = document.querySelector(`mark.hl[data-hl="${it.mark}"]`); if (m) setTimeout(() => m.scrollIntoView({ block: 'center' }), 60); }
    } else if (it.type === 'lab') {
      nb.close();
      const link = document.createElement('a'); link.href = '#' + it.target; link.dataset.openLesson = it.lesson;
      document.body.append(link); link.click(); link.remove();
    } else goTo(it.target, it.story);
  } }, 'Go there');
  const where = it.where ? el('span', { class: 'nb-where' }, it.where) : null;
  if (it.type === 'lab') return el('article', { class: 'nb-item' },
    el('p', { class: 'nb-kind' }, 'Live experiment', where), el('p', { class: 'nb-q' }, it.title),
    it.pred ? el('p', { class: 'nb-a' }, 'I predicted: ' + it.pred) : null,
    it.res ? el('p', { class: 'nb-a' }, 'My explanation: ' + it.res) : null, go);
  if (it.type === 'hl') {
    return el('article', { class: 'nb-item hl-item' }, el('p', { class: 'nb-kind' }, 'Highlight', where),
      el('blockquote', {}, it.quote.trim()), it.note ? el('p', { class: 'nb-note' }, it.note) : null, go);
  }
  if (it.type === 'pred') {
    return el('article', { class: 'nb-item' }, el('p', { class: 'nb-kind' }, 'Prediction', where),
      el('p', { class: 'nb-q' }, it.q),
      el('p', { class: 'nb-a' }, el('span', {}, 'I predicted: '), `${'ABCDEFGHIJ'[it.c] || ''}. ${it.o}`), go);
  }
  if (it.type === 'check') {
    return el('article', { class: 'nb-item' }, el('p', { class: 'nb-kind' }, 'Check yourself', where),
      el('p', { class: 'nb-q' }, it.q),
      it.a ? el('p', { class: 'nb-a' }, el('span', {}, 'You wrote: '), it.a) : el('p', { class: 'nb-a muted' }, 'You answered in your head.'),
      it.r ? el('p', { class: 'nb-r', 'data-r': it.r }, RLABEL[it.r]) : null, go);
  }
  return el('article', { class: 'nb-item' }, el('p', { class: 'nb-kind' }, 'Try it at home', where),
    el('p', { class: 'nb-q' }, it.title + (it.done ? ' · done ' + fmtDate(it.date) : '')),
    it.pred ? el('p', { class: 'nb-a' }, el('span', {}, 'I predicted: '), it.pred) : null,
    it.res ? el('p', { class: 'nb-a' }, el('span', {}, 'What happened: '), it.res) : null, go);
}

function markdown() {
  const { list, stats } = gather();
  const L = [`# My notebook: ${BOOK()}`, '', `Saved ${fmtDate(Date.now())}.`, '',
    `- Predictions made: ${stats.predN} of ${stats.preds}`,
    `- Checks tried: ${stats.tried} of ${stats.checks} (${stats.got} got it, ${stats.partly} partly)`,
    `- Home experiments done: ${stats.done} of ${stats.homes}`, `- Highlights: ${stats.hls} (${stats.notes} with notes)`, ''];
  list.forEach(g => {
    L.push(`## ${g.name}`, '');
    g.items.forEach(it => {
      const w = it.where ? ` (${it.where})` : '';
      if (it.type === 'hl') { L.push(`> ${strip(it.quote)}${w}`, ''); if (it.note) L.push(`Note: ${it.note}`, ''); }
      else if (it.type === 'pred') { L.push(`**Prediction${w}.** ${it.q}`, '', `I predicted: ${it.o}`, ''); }
      else if (it.type === 'check') { L.push(`**Check yourself${w}.** ${it.q}`, '', `My answer: ${it.a || '(in my head)'}${it.r ? ` · ${RLABEL[it.r]}` : ''}`, ''); }
      else if (it.type === 'lab') { L.push(`**Live experiment${w}: ${it.title}**`, '');
        if (it.pred) L.push(`I predicted: ${it.pred}`, ''); if (it.res) L.push(`My explanation: ${it.res}`, ''); }
      else { L.push(`**Try it at home${w}: ${it.title}**${it.done ? ` (done ${fmtDate(it.date)})` : ''}`, '');
        if (it.pred) L.push(`I predicted: ${it.pred}`, ''); if (it.res) L.push(`What happened: ${it.res}`, ''); }
    });
  });
  return L.join('\n');
}

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = el('a', { href: url, download: name }); document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}

function backup() {
  const keys = {};
  store.keys().filter(OWNED).forEach(k => { keys[k] = store.get(k); });
  download(`${SLUG()}-notebook-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ book: BOOK(), kind: 'notebook', version: 1, saved: Date.now(), keys }, null, 1), 'application/json');
}
function restore(file) {
  const r = new FileReader();
  r.onload = () => {
    let d; try { d = JSON.parse(r.result); } catch (e) { d = null; }
    const msg = nb.querySelector('.nb-msg');
    if (!d || d.kind !== 'notebook' || !d.keys) { msg.textContent = 'That file does not look like a notebook backup from this book.'; return; }
    Object.entries(d.keys).forEach(([k, v]) => {
      if (!OWNED(k)) return;
      if (k === HL_KEY) { const cur = all(); const ids = new Set(cur.map(h => h.id)); (v || []).forEach(h => ids.has(h.id) || cur.push(h)); store.set(HL_KEY, cur); }
      else store.set(k, v);
    });
    msg.textContent = 'Restored. Reloading the book…';
    setTimeout(() => location.reload(), 700);
  };
  r.readAsText(file);
}

function buildNotebook() {
  nbBody = el('div', { class: 'nb-body' });
  const file = el('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: e => e.target.files[0] && restore(e.target.files[0]) });
  nb = el('dialog', { class: 'lj-dlg notebook', 'aria-labelledby': 'nb-h' },
    el('div', { class: 'nb-bar' }, el('h2', { id: 'nb-h' }, 'My notebook'),
      el('button', { type: 'button', class: 'lj-btn', 'aria-label': 'Close the notebook', onclick: () => nb.close() }, 'Close')),
    nbBody,
    el('div', { class: 'nb-foot' },
      el('button', { type: 'button', class: 'lj-btn primary', onclick: () => download(`my-notebook-${new Date().toISOString().slice(0, 10)}.md`, markdown(), 'text/markdown') }, 'Save my notebook'),
      el('details', { class: 'nb-more' }, el('summary', {}, 'Back up or restore'),
        el('p', {}, 'Moving to another device? Save a backup file here, then open the book on the other device and restore it.'),
        el('div', { class: 'lj-row' },
          el('button', { type: 'button', class: 'lj-btn', onclick: backup }, 'Save a backup'),
          el('button', { type: 'button', class: 'lj-btn', onclick: () => file.click() }, 'Restore from a backup'), file),
        el('p', { class: 'nb-msg', role: 'status' }))));
  nb.addEventListener('click', e => { if (e.target === nb) nb.close(); });
  document.body.append(nb);
}

const ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h9.5A1.5 1.5 0 0 1 16 4.5v12a.5.5 0 0 1-.8.4L12.5 15H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 7h6M7 10h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

App.ready(() => {
  buildNoteDlg();
  buildNotebook();
  pop = el('div', { class: 'hl-pop', role: 'toolbar', 'aria-label': 'Highlight the selected words', hidden: true },
    el('button', { type: 'button', onmousedown: e => e.preventDefault(), onclick: () => create(false) }, 'Highlight'),
    el('button', { type: 'button', onmousedown: e => e.preventDefault(), onclick: () => create(true) }, 'Add note'));
  document.body.append(pop);
  let t;
  document.addEventListener('selectionchange', () => { clearTimeout(t); t = setTimeout(onSelect, 220); });
  window.addEventListener('scroll', () => { if (pop && !pop.hidden) onSelect(); }, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePop(); });
  // the story panel scrolls on its own
  const sd = document.querySelector('.sd-body'); if (sd) sd.addEventListener('scroll', () => { if (pop && !pop.hidden) onSelect(); }, { passive: true });
  document.addEventListener('click', e => {
    const m = e.target.closest && e.target.closest('mark.hl');
    if (m && !e.target.closest('a')) { e.preventDefault(); editNote(m.dataset.hl); }
  });
  document.addEventListener('keydown', e => {
    const m = e.target.closest && e.target.closest('mark.hl');
    if (m && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); editNote(m.dataset.hl); }
  });
  applyAll();
  App.on('story:open', d => d && d.el && apply(d.el));
  App.tool({ id: 'notebook', label: 'Notebook', icon: ICON, order: 40, title: 'My notebook: highlights, notes and answers', onClick: () => { renderNotebook(); nb.showModal(); } });
});
