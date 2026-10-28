// Reading progress: which sections and stories have been read, where the reader stopped,
// a "continue where you left off" chip, ticks in the Contents, and copy/share links.
import App from './core.js';

const LINK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>';
const SHARE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12"/></svg>';

// ------------------------------------------------------------------ toast (also used by other modules via App.toast)
let toastEl, toastT;
function toast(msg) {
  if (!toastEl) { toastEl = App.el('div', { class: 'iw-toast', role: 'status', 'aria-live': 'polite' }); document.body.append(toastEl); }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
}
App.toast = App.toast || toast;

function pageUrl(hash) {
  const u = location.href.split('#')[0];
  return u + (hash ? '#' + hash : '');
}
async function copyText(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch (e) {}
  try {
    const ta = App.el('textarea', { style: 'position:fixed;opacity:0;top:0;left:0', 'aria-hidden': 'true' });
    ta.value = text; document.body.append(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch (e) { return false; }
}
App.copyLink = async (hash, what) => {
  const ok = await copyText(pageUrl(hash));
  App.toast(ok ? `Link to ${what} copied` : 'Could not copy the link');
};

App.ready(() => {
  const { el, store } = App;
  const sections = [...document.querySelectorAll('section.sec[id]')];
  const secById = new Map(sections.map(s => [s.id, s]));
  let read = new Set(store.get('read', []).filter(id => secById.has(id) || id.startsWith('story-')));
  const saveRead = () => store.set('read', [...read]);

  // ---------------------------------------------------------------- copy-link buttons on section headings
  sections.forEach(sec => {
    const h = sec.querySelector(':scope > h3');
    if (!h) return;
    const num = (h.querySelector('.n') || {}).textContent || '';
    h.append(el('button', { type: 'button', class: 'hlink', 'aria-label': `Copy a link to section ${num}`, title: 'Copy a link to this section',
      html: LINK_ICON, onclick: () => App.copyLink(sec.id, `section ${num}`) }));
  });

  // ---------------------------------------------------------------- share button in the story panel
  let currentStory = null;
  const bar = document.querySelector('#storydlg .sd-bar');
  const closeBtn = bar && bar.querySelector('.sd-close');
  if (bar && closeBtn) {
    const share = el('button', { type: 'button', class: 'sd-share', 'aria-label': 'Share this story', title: 'Share a link to this story' },
      el('span', { class: 'i', html: SHARE_ICON }), el('span', { class: 'l' }, 'Share'));
    share.addEventListener('click', async () => {
      if (!currentStory) return;
      const url = pageUrl('story-' + currentStory.id);
      const title = currentStory.title;
      if (navigator.share) {
        try { await navigator.share({ title, text: `${title}, from The Invisible World`, url }); return; }
        catch (e) { if (e && e.name === 'AbortError') return; }
      }
      App.copyLink('story-' + currentStory.id, 'this story');
    });
    bar.insertBefore(share, closeBtn);
  }

  // ---------------------------------------------------------------- stories read
  App.on('story:open', d => {
    if (!d || !d.id) return;
    currentStory = { id: d.id, title: (d.el && d.el.getAttribute('data-story-title')) || d.id };
    if (!read.has('story-' + d.id)) { read.add('story-' + d.id); saveRead(); paint(); }
  });
  App.on('story:close', () => { currentStory = null; });

  // ---------------------------------------------------------------- sections read
  // A section counts as read when its end has scrolled above the middle of the screen,
  // after the reader has actually spent time with it (so jumping through the Contents doesn't tick everything).
  const seen = new Map();   // id -> ms visible
  const visibleSince = new Map();
  const minMs = sec => Math.min(20000, Math.max(5000, (sec.textContent.length / 6) / 250 * 60000 * 0.25));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      const now = performance.now();
      entries.forEach(e => {
        const id = e.target.id;
        if (e.isIntersecting) visibleSince.set(id, now);
        else if (visibleSince.has(id)) { seen.set(id, (seen.get(id) || 0) + now - visibleSince.get(id)); visibleSince.delete(id); }
      });
    }, { threshold: 0, rootMargin: '-20% 0px -20% 0px' });
    sections.forEach(s => io.observe(s));
  }
  function checkRead() {
    const now = performance.now(), mid = innerHeight * 0.5;
    let changed = false;
    visibleSince.forEach((t0, id) => {
      const s = secById.get(id);
      if (!s || read.has(id)) return;
      const total = (seen.get(id) || 0) + now - t0;
      if (s.getBoundingClientRect().bottom < mid && total >= minMs(s)) { read.add(id); changed = true; }
    });
    if (changed) { saveRead(); paint(); }
  }

  // ---------------------------------------------------------------- last position
  let posT;
  function savePos() {
    if (document.documentElement.classList.contains('sd-open')) return;
    const line = innerHeight * 0.3;
    let cur = null;
    for (const s of sections) { if (!s.getClientRects().length) continue; const r = s.getBoundingClientRect(); if (r.top <= line) cur = s; else break; }
    if (!cur) return;
    const r = cur.getBoundingClientRect();
    if (r.bottom < 0) return; // in back matter, past the last section of its chapter
    store.set('pos', { id: cur.id, off: Math.round(line - r.top), at: Date.now() });
  }
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { ticking = false; checkRead(); clearTimeout(posT); posT = setTimeout(savePos, 400); });
  }, { passive: true });
  setInterval(checkRead, 4000);

  // ---------------------------------------------------------------- continue chip
  const pos = store.get('pos', null);
  if (pos && !location.hash && secById.has(pos.id)) {
    const sec = secById.get(pos.id);
    const h = sec.querySelector(':scope > h3');
    const num = h && h.querySelector('.n') ? h.querySelector('.n').textContent.trim() : '';
    const title = h ? [...h.childNodes].filter(n => !(n.nodeType === 1 && (n.classList.contains('n') || n.classList.contains('hlink')))).map(n => n.textContent).join('').trim() : '';
    const go = el('button', { type: 'button', class: 'cc-go' },
      el('span', { class: 'cc-k' }, 'Continue where you left off'), el('span', { class: 'cc-t' }, `${num} ${title}`.trim()));
    const x = el('button', { type: 'button', class: 'cc-x', 'aria-label': 'Dismiss' }, '×');
    const chip = el('div', { class: 'cont-chip', role: 'region', 'aria-label': 'Continue reading' }, go, x);
    const dismiss = () => { chip.classList.remove('show'); setTimeout(() => chip.remove(), 300); };
    go.addEventListener('click', () => {
      if (App.reveal) App.reveal(sec);
      const top = sec.getBoundingClientRect().top + scrollY - innerHeight * 0.3 + (pos.off || 0);
      history.replaceState(null, '', '#' + sec.id);
      scrollTo({ top: Math.max(0, top), behavior: App.reduceMotion() ? 'auto' : 'smooth' });
      dismiss();
    });
    x.addEventListener('click', dismiss);
    document.body.append(chip);
    requestAnimationFrame(() => chip.classList.add('show'));
    // once the reader starts somewhere else on their own, the chip has done its job
    let start = scrollY;
    const onS = () => { if (Math.abs(scrollY - start) > innerHeight * 1.5) { dismiss(); removeEventListener('scroll', onS); } };
    addEventListener('scroll', onS, { passive: true });
  }

  // ---------------------------------------------------------------- Contents ticks and chapter progress
  const toc = document.querySelector('#contents .toc');
  const chapterRows = toc ? [...toc.querySelectorAll('.tch')].filter(t => t.querySelector('.tsec')) : [];
  chapterRows.forEach(row => {
    const links = [...row.querySelectorAll('.tsec a')];
    row._links = links;
    const ring = el('span', { class: 'cprog', role: 'img' }, el('span', { class: 'cprog-i' }));
    row._ring = ring;
    const n = row.querySelector(':scope > .n');
    (n || row).append(ring);
  });
  function paint() {
    chapterRows.forEach(row => {
      let k = 0;
      row._links.forEach(a => {
        const id = (a.getAttribute('href') || '').slice(1);
        const on = read.has(id);
        a.classList.toggle('is-read', on);
        if (on) k++;
      });
      const tot = row._links.length || 1;
      row._ring.style.setProperty('--p', (k / tot).toFixed(3));
      row._ring.classList.toggle('done', k === tot);
      row._ring.classList.toggle('none', k === 0);
      row._ring.setAttribute('aria-label', `${k} of ${tot} sections read`);
      row._ring.title = `${k} of ${tot} sections read`;
    });
    document.querySelectorAll('a[data-story]').forEach(a => {
      if (a.closest('.st-index, .cast')) a.classList.toggle('is-read', read.has('story-' + a.getAttribute('data-story')));
    });
  }
  paint();
  App.progress = { read, paint, reset() { read.clear(); saveRead(); store.remove('pos'); paint(); } };
});
