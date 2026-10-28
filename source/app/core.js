// The book's app layer: shared helpers that every feature module uses.
// Everything here must degrade gracefully: the book is a plain document first.
//
//   App.data            parsed <script id="book-data"> (chapters, stories, scenes, checks)
//   App.store.get(k, d) / App.store.set(k, v)   JSON in localStorage, never throws
//   App.tool({id, label, icon, onClick, order})  adds a button to the reading toolbar
//   App.on(evt, fn) / App.emit(evt, detail)     tiny event bus ('story:open', 'story:close', 'ready')
//   App.openStory(id) / App.closeStory()
//   App.ready(fn)       run after DOM + data are ready
//   App.el(tag, attrs, ...children)            small DOM builder
//   App.transition(fn)  wraps a DOM change in a View Transition when supported and motion is allowed
//   App.explorer(name, {mount(el)})            an explorer implementation registers itself (app/x_<name>.js)
//   App.loadExplorer(name) -> Promise<impl>    the registered implementation, loading its lazy chunk if needed

// Every book on saxster.github.io shares one origin, so each keeps its own prefix ('iw:' is the chemistry book).
const PREFIX = 'mw:';
let mem = {};
let canStore = true;
try { const k = PREFIX + '__t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); } catch (e) { canStore = false; }

const store = {
  available: canStore,
  get(key, dflt) {
    try {
      const raw = canStore ? localStorage.getItem(PREFIX + key) : mem[key];
      return raw == null ? dflt : JSON.parse(raw);
    } catch (e) { return dflt; }
  },
  set(key, val) {
    const raw = JSON.stringify(val);
    try { if (canStore) localStorage.setItem(PREFIX + key, raw); else mem[key] = raw; } catch (e) { mem[key] = raw; }
  },
  remove(key) { try { if (canStore) localStorage.removeItem(PREFIX + key); } catch (e) {} delete mem[key]; },
  keys() {
    const out = [];
    try { if (canStore) for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length)); } } catch (e) {}
    Object.keys(mem).forEach(k => out.includes(k) || out.push(k));
    return out;
  },
};

const handlers = {};
function on(evt, fn) { (handlers[evt] = handlers[evt] || []).push(fn); }
function emit(evt, detail) { (handlers[evt] || []).forEach(fn => { try { fn(detail); } catch (e) { console.error(e); } }); }

function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}

const reduceMotion = () => (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  || document.documentElement.classList.contains('still')
  || (document.body ? document.body.classList.contains('still') : false);
function transition(fn) {
  if (document.startViewTransition && !reduceMotion()) { try { return document.startViewTransition(fn); } catch (e) {} }
  fn();
}

let data = {};
try { data = JSON.parse(document.getElementById('book-data').textContent); } catch (e) { data = {}; }

const tools = [];
function tool({ id, label, icon, onClick, order = 50, title }) {
  const bar = document.getElementById('toolbar');
  if (!bar) return null;
  const b = el('button', { type: 'button', class: 'tb', id: 'tb-' + id, 'aria-label': title || label, title: title || label, 'data-order': order, onclick: onClick },
    el('span', { class: 'tb-i', 'aria-hidden': 'true', html: icon || '' }), el('span', { class: 'tb-l' }, label));
  tools.push(b);
  tools.sort((a, c) => a.dataset.order - c.dataset.order);
  tools.forEach(t => bar.append(t));
  return b;
}

const readyFns = [];
let isReady = false;
function ready(fn) { if (isReady) fn(); else readyFns.push(fn); }
function boot() { isReady = true; readyFns.splice(0).forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); emit('ready'); }

// Explorers: in the single-file build their code is bundled in and registers at once; in the --site build each is a
// lazy chunk (window.BOOK_CHUNKS['x_<name>']) fetched the first time the reader opens it.
const explorers = {};
function explorer(name, impl) { explorers[name] = impl; }
async function loadExplorer(name, chunk = 'x_' + name) {
  if (explorers[name]) return explorers[name];
  const rel = (window.BOOK_CHUNKS || {})[chunk];
  if (!rel) throw new Error(`explorer ${name} is not in this build`);
  await import(new URL(rel, document.baseURI).href);
  if (!explorers[name]) throw new Error(`chunk ${chunk} did not register explorer ${name}`);
  return explorers[name];
}

const App = window.App = {
  data, store, on, emit, el, tool, ready, transition, reduceMotion, explorer, loadExplorer,
  openStory: id => window.__openStory && window.__openStory(id),
  closeStory: () => window.__closeStory && window.__closeStory(),
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
else setTimeout(boot, 0);
export default App;
