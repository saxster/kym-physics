// Check yourself: commit to an answer, then reveal, then rate yourself.
// Back from Chapter N (:::recall): the same, plus "You predicted ..." when it recalls a :::predict.
// Predict first: choose an option before the reveal shows; the choice is kept (pred:<id>) for the notebook and recalls.
// Try it at home: a small experiment journal (prediction, done, what happened).
import App from './core.js';

const { el, store } = App;
const RATINGS = [
  ['got', 'I got it'],
  ['partly', 'Partly'],
  ['not', 'Not yet'],
];

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

function reveal(node, show) {
  if (show) {
    node.hidden = false;
    if (!App.reduceMotion() && node.animate) node.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
  } else node.hidden = true;
}

function setupCheck(box) {
  const id = box.id;
  const tpl = box.querySelector('template.chk-a');
  if (!id || !tpl || box.querySelector('.chk-ui')) return;
  const key = 'chk:' + id;
  const saved = store.get(key, {});
  const back = box.querySelector('.ans');

  const ta = el('textarea', { class: 'lj-ta', rows: 2, id: id + '-mine', placeholder: 'Write it here, or just think it' });
  ta.value = saved.a || '';
  const label = el('label', { class: 'lj-lab', for: id + '-mine' }, 'Your answer');
  const showBtn = el('button', { type: 'button', class: 'lj-btn primary', 'aria-expanded': 'false', 'aria-controls': id + '-reveal' }, 'Show the answer');
  const answer = el('div', { class: 'chk-reveal', id: id + '-reveal', hidden: true });
  answer.append(el('p', { class: 'lj-kick' }, 'The answer'));
  answer.append(tpl.content.cloneNode(true));

  const rateRow = el('div', { class: 'lj-rate', role: 'group', 'aria-label': 'How did you do?' });
  const rateBtns = RATINGS.map(([v, l]) => el('button', { type: 'button', class: 'lj-chip', 'data-r': v, 'aria-pressed': 'false' }, l));
  rateRow.append(el('span', { class: 'lj-q' }, 'How did you do?'), ...rateBtns);
  const again = el('button', { type: 'button', class: 'lj-link' }, 'Try again');
  answer.append(rateRow, again);

  const save = () => { const s = store.get(key, {}); s.a = ta.value; s.t = Date.now(); store.set(key, s); App.emit('learn:change'); };
  ta.addEventListener('input', debounce(save, 400));

  function paintRating(r) {
    rateBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.r === r)));
    box.dataset.rated = r || '';
  }
  function open(animate) {
    showBtn.hidden = true; showBtn.setAttribute('aria-expanded', 'true');
    if (animate) reveal(answer, true); else answer.hidden = false;
  }
  showBtn.addEventListener('click', () => {
    const s = store.get(key, {}); s.a = ta.value; s.seen = true; s.t = Date.now(); store.set(key, s);
    open(true); App.emit('learn:change');
    answer.querySelector('.lj-chip').focus({ preventScroll: true });
  });
  rateBtns.forEach(b => b.addEventListener('click', () => {
    const s = store.get(key, {}); s.r = b.dataset.r; s.a = ta.value; s.seen = true; s.t = Date.now(); store.set(key, s);
    paintRating(s.r); App.emit('learn:change');
  }));
  again.addEventListener('click', () => {
    store.set(key, { a: '', t: Date.now() });
    ta.value = ''; paintRating(''); answer.hidden = true; showBtn.hidden = false; showBtn.setAttribute('aria-expanded', 'false');
    ta.focus(); App.emit('learn:change');
  });

  const ui = el('div', { class: 'chk-ui' }, label, ta, el('div', { class: 'lj-row' }, showBtn), answer);
  if (back) box.insertBefore(ui, back); else box.append(ui);
  if (back) back.classList.add('lj-back');
  if (saved.seen) open(false);
  paintRating(saved.r);
}

function setupHome(box) {
  const n = box.dataset.home;
  if (!n || box.querySelector('.home-ui')) return;
  const key = 'home:' + n;
  const s = store.get(key, {});
  const pid = `home-${n}-pred`, rid = `home-${n}-res`, cid = `home-${n}-done`;
  const pred = el('textarea', { class: 'lj-ta', rows: 2, id: pid, placeholder: 'Make a guess before you begin' });
  pred.value = s.pred || '';
  const res = el('textarea', { class: 'lj-ta', rows: 2, id: rid, placeholder: 'What did you see? Was your guess right?' });
  res.value = s.res || '';
  const done = el('input', { type: 'checkbox', id: cid });
  done.checked = !!s.done;
  const when = el('span', { class: 'lj-date' });
  const resWrap = el('div', { class: 'home-res' }, el('label', { class: 'lj-lab', for: rid }, 'What actually happened?'), res);

  function paint() {
    const cur = store.get(key, {});
    when.textContent = cur.done && cur.date ? new Date(cur.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    resWrap.hidden = !cur.done && !cur.res;
    box.dataset.done = cur.done ? '1' : '';
  }
  const save = () => { const cur = store.get(key, {}); cur.pred = pred.value; cur.res = res.value; cur.t = Date.now(); store.set(key, cur); App.emit('learn:change'); };
  pred.addEventListener('input', debounce(save, 400));
  res.addEventListener('input', debounce(save, 400));
  done.addEventListener('change', () => {
    const cur = store.get(key, {}); cur.done = done.checked; cur.date = done.checked ? Date.now() : null; cur.pred = pred.value; cur.res = res.value;
    store.set(key, cur); const wasHidden = resWrap.hidden; paint();
    if (wasHidden && !resWrap.hidden) { reveal(resWrap, true); res.focus({ preventScroll: true }); }
    App.emit('learn:change');
  });

  const ui = el('div', { class: 'home-ui', role: 'group', 'aria-label': 'My experiment journal' },
    el('p', { class: 'lj-kick' }, 'My experiment journal'),
    el('label', { class: 'lj-lab', for: pid }, 'Before you start: what do you think will happen?'), pred,
    el('div', { class: 'lj-done' }, done, el('label', { for: cid }, 'I did it'), when),
    resWrap);
  box.append(ui);
  paint();
}

const LETTERS = 'ABCDEFGHIJ';
const clean = s => String(s || '').replace(/\s+/g, ' ').trim();

function setupPredict(box) {
  const id = box.dataset.predict;
  const list = box.querySelector('.pred-opts');
  const rev = box.querySelector('.pred-reveal');
  if (!id || !list || !rev || box.querySelector('.pred-you')) return;
  const key = 'pred:' + id;
  const q = clean(box.querySelector('.pq') && box.querySelector('.pq').textContent);
  box.classList.add('pred-js');
  list.setAttribute('role', 'group');
  list.setAttribute('aria-label', 'Your prediction');
  const btns = [...list.children].map((li, i) => {
    const b = el('button', { type: 'button', class: 'pred-opt', 'aria-pressed': 'false' },
      el('span', { class: 'pred-l', 'aria-hidden': 'true' }, LETTERS[i] || String(i + 1)));
    const txt = el('span', { class: 'pred-t' });
    while (li.firstChild) txt.append(li.firstChild);
    b.append(txt); li.append(b);
    b.addEventListener('click', () => choose(i));
    return b;
  });
  const you = el('p', { class: 'pred-you', 'aria-live': 'polite' });
  const again = el('button', { type: 'button', class: 'lj-link' }, 'Change my prediction');
  list.after(you);
  rev.append(again);
  rev.id = rev.id || id + '-reveal';
  btns.forEach(b => b.setAttribute('aria-controls', rev.id));

  function paint(animate) {
    const s = store.get(key, null);
    const has = s && s.c != null && btns[s.c];
    btns.forEach((b, i) => { b.setAttribute('aria-pressed', String(!!has && i === s.c)); b.disabled = !!has; });
    you.textContent = has ? `You predicted ${LETTERS[s.c]}: ${s.o}` : 'Choose one before you read on.';
    box.dataset.chosen = has ? '1' : '';
    if (has) { if (animate) reveal(rev, true); else rev.hidden = false; } else rev.hidden = true;
  }
  function choose(i) {
    store.set(key, { c: i, o: clean(btns[i].querySelector('.pred-t').textContent), q, t: Date.now() });
    paint(true); App.emit('learn:change');
  }
  again.addEventListener('click', () => {
    store.remove(key); paint(false); App.emit('learn:change');
    btns[0].focus({ preventScroll: true });
  });
  paint(false);
}

function paintRecall(box) {
  const ref = box.dataset.recallPred;
  if (!ref) return;
  const s = store.get('pred:' + ref, null);
  let p = box.querySelector('.rec-pred');
  if (!s || s.c == null) { if (p) p.remove(); return; }
  if (!p) { p = el('p', { class: 'rec-pred' }); box.querySelector('.bh').after(p); }
  const where = ref.replace(/^pred-/, '').replace('-', '.');
  p.textContent = `Back in section ${where} you predicted: “${s.o}”`;
}

App.ready(() => {
  document.querySelectorAll('.box.predict[data-predict]').forEach(setupPredict);
  document.querySelectorAll('.box.check[id]').forEach(setupCheck);
  const recalls = [...document.querySelectorAll('.box.recall[data-recall-pred]')];
  recalls.forEach(paintRecall);
  App.on('learn:change', () => recalls.forEach(paintRecall));
  document.querySelectorAll('.box.home[data-home]').forEach(setupHome);
});
