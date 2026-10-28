// One page at a time. The book is still a single document (search, links and print see all of it),
// but only the current "page" is shown: the front matter, each explorer, each chapter (with its
// volume title page in front of the first chapter of a volume), and each part of the back matter.
// The page follows location.hash; anything that scrolls an element into view reveals its page first.
import App from './core.js';

const main = document.querySelector('main.book');
const units = [];          // {id, els: [Element], title, kind}
const unitByEl = new Map(); // top-level element -> unit
let cur = null;

function txt(e) { return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }

function collect() {
  if (!main) return;
  const kids = [...main.children];
  let pendingVol = null, front = null;
  const add = (u) => { units.push(u); u.els.forEach((e) => unitByEl.set(e, u)); return u; };
  for (const k of kids) {
    if (k.matches('header.cover, section.front') && !k.matches('.explore')) {
      if (!front) front = add({ id: 'top', els: [], title: 'The beginning', kind: 'front' });
      front.els.push(k); unitByEl.set(k, front);
    } else if (k.matches('section.explore')) {
      add({ id: k.id, els: [k], title: txt(k.querySelector('h2')), kind: 'explore' });
    } else if (k.matches('section.volume')) {
      pendingVol = k;
    } else if (k.matches('article.chapter')) {
      const els = pendingVol ? [pendingVol, k] : [k];
      pendingVol = null;
      const n = k.id.replace('ch', '');
      add({ id: k.id, els, title: txt(k.querySelector('.opener h2')), kind: 'chapter', n });
    } else if (k.matches('.backmatter')) {
      for (const part of k.children) {
        const sec = part.querySelector('section[id]') || part;
        add({ id: sec.id || ('back-' + units.length), els: [part], title: txt(sec.querySelector('h2')), kind: 'back' });
      }
    } else if (front && !units.some((u) => u.kind !== 'front')) {
      front.els.push(k); unitByEl.set(k, front);   // anything else early on travels with the front
    }
  }
}

function unitOf(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (unitByEl.has(n)) return unitByEl.get(n);
    if (n === main) return null;
  }
  return null;
}

function label(u) { return u.kind === 'chapter' ? `Chapter ${u.n}` : u.kind === 'explore' ? 'Explore' : u.kind === 'front' ? 'Start' : 'At the back'; }

function addNav() {
  units.forEach((u, i) => {
    const prev = units[i - 1], next = units[i + 1];
    const link = (v, dir) => v ? App.el('a', { class: 'pg-' + dir, href: '#' + v.id, rel: dir },
      App.el('span', { class: 'pg-k' }, dir === 'prev' ? '← Previous' : 'Next →'),
      App.el('span', { class: 'pg-l' }, label(v)),
      App.el('span', { class: 'pg-t' }, v.title)) : App.el('span', { class: 'pg-' + dir + ' pg-none', 'aria-hidden': 'true' });
    const nav = App.el('nav', { class: 'pg-nav', 'aria-label': 'Page navigation' }, link(prev, 'prev'), link(next, 'next'));
    const last = u.els[u.els.length - 1];
    const host = last.matches('article.chapter') ? (last.querySelector(':scope > .flow') || last) : (last.querySelector('section[id]') || last);
    host.append(nav);
  });
}

function setVisible(u) {
  units.forEach((v) => v.els.forEach((e) => {
    if (v === u) e.removeAttribute('data-page-off'); else e.setAttribute('data-page-off', '');
  }));
  document.documentElement.dataset.page = u.id;
  cur = u;
}

// The volume colour follows the page. (build.py's scroll script picks the last [data-vol] above the
// fold, which is wrong once other pages are hidden, so this re-asserts it after that script runs.)
function volOf(u) {
  if (!u) return '1';
  const v = u.els.map((e) => e.getAttribute('data-vol')).find(Boolean);
  if (v) return v;
  return u.kind === 'back' ? '3' : '1';
}
function paintVol() { if (cur) document.body.className = 'vol-' + volOf(cur); }
addEventListener('scroll', paintVol, { passive: true });

function afterShow() {
  paintVol();
  // widgets and canvases measured while hidden need another look
  dispatchEvent(new Event('resize'));
  dispatchEvent(new Event('scroll'));
  App.emit('page:change', { id: cur.id, kind: cur.kind });
  document.dispatchEvent(new CustomEvent('book:pagechange', { detail: { id: cur.id, kind: cur.kind } }));
}

const origScroll = Element.prototype.scrollIntoView;

/** Show the page holding el (if it is not the current one). Returns true if the page changed. */
function reveal(el, { anim = false } = {}) {
  const u = el && unitOf(el);
  if (!u || u === cur) return false;
  const go = () => setVisible(u);
  if (anim) App.transition(go); else go();
  afterShow();
  return true;
}
App.reveal = (el) => reveal(el);
App.pages = { units, current: () => cur, reveal };

Element.prototype.scrollIntoView = function (...args) {
  if (main && main.contains(this)) {
    const before = Math.round(scrollY);
    if (reveal(this)) {
      try { history.replaceState(Object.assign({}, history.state, { y: before }), ''); } catch (e) {}
      const h = targetFor(location.hash);
      if (!(h && h !== 'story' && unitOf(h) === cur)) {
        const anchor = this.id ? this : (this.closest('[id]') || cur.els[0]);
        history.pushState(null, '', '#' + (anchor.id || cur.id));
        lastHash = location.hash;
      }
    }
  }
  return origScroll.apply(this, args);
};

function targetFor(hash) {
  if (!hash || hash === '#') return null;
  const id = decodeURIComponent(hash.slice(1));
  const el = document.getElementById(id);
  if (el && el.matches('article.story')) return 'story';
  return el;
}

let lastHash = location.hash;
const isStoryHash = (h) => targetFor(h) === 'story';

/** Route to location.hash: show its page and scroll there. */
function route({ anim = true, initial = false, pop = false, y = null } = {}) {
  const fromStory = isStoryHash(lastHash);
  lastHash = location.hash;
  const t = targetFor(location.hash);
  if (t === 'story') { if (!cur) { setVisible(units[0]); afterShow(); } return; }  // the story panel opens over the current page
  if (!t) { if (!cur || !initial) { if (cur !== units[0]) { setVisible(units[0]); afterShow(); } scrollTo({ top: y || 0, behavior: 'instant' }); } return; }
  const u = unitOf(t);
  if (!u) return;
  const changed = u !== cur;
  if (!changed && pop && fromStory) return;   // closing a story: stay exactly where the reader was
  const scroll = () => {
    if (y != null) { scrollTo({ top: y, behavior: 'instant' }); return; }
    const behavior = changed || App.reduceMotion() ? 'instant' : 'smooth';
    if (t === u.els[0] || t.id === u.id) scrollTo({ top: 0, behavior: 'instant' });
    else origScroll.call(t, { block: 'start', behavior });
  };
  if (!changed) { scroll(); return; }
  const go = () => { setVisible(u); scroll(); afterShow(); };
  if (anim && !initial) App.transition(go); else go();
}

function boot() {
  collect();
  if (!units.length) return;
  addNav();
  document.documentElement.classList.add('paged');
  route({ initial: true });

  // in-page links: route through history so Back works
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-story')) return;
    const href = a.getAttribute('href');
    if (/^#story-/.test(href) && !a.hasAttribute('data-noopen')) return; // the story panel's own links
    const t = targetFor(href);
    if (!t || t === 'story') return;
    e.preventDefault();
    history.replaceState(Object.assign({}, history.state, { y: Math.round(scrollY) }), '');
    if (location.hash !== href) history.pushState(null, '', href);
    route();
    if (a.closest('.pg-nav')) a.blur();
  });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  addEventListener('popstate', (e) => route({ pop: true, y: e.state && typeof e.state.y === 'number' ? e.state.y : null }));
  addEventListener('hashchange', () => { if (location.hash !== lastHash) route({ pop: true }); });
}

App.ready(boot);
