// Layout behaviour that CSS alone can't do.
//  1. Margin notes. In the source a definition note follows the paragraph that introduces its word. The build moves
//     each note in front of that paragraph so that, on wide screens, the floated note lines up with the paragraph's
//     first line. When a note sits in the text column instead (narrow screens, and inside the story panel), it must
//     come AFTER the paragraph, so the reader meets the word before its definition. This module moves notes to the
//     right side of their paragraph whenever the layout changes.
//  2. The toolbar steps out of the way while reading (scrolling down) and comes back on scrolling up.
import App from './core.js';

const anchors = new Map();   // note -> the paragraph (or block) it belongs to

function collect(root) {
  root.querySelectorAll('.side').forEach(n => {
    if (anchors.has(n)) return;
    let a = n.nextElementSibling;
    while (a && a.classList.contains('side')) a = a.nextElementSibling;
    if (a) anchors.set(n, a);
  });
}

function place() {
  const groups = new Map();
  anchors.forEach((a, n) => {
    if (!n.isConnected || !a.isConnected || n.parentNode !== a.parentNode) return;
    if (!groups.has(a)) groups.set(a, []);
    groups.get(a).push(n);
  });
  groups.forEach((notes, a) => {
    const inline = getComputedStyle(notes[0]).float === 'none';
    if (inline) {
      let ref = a;
      for (const n of notes) { if (ref.nextElementSibling !== n) ref.after(n); ref = n; }
    } else {
      for (const n of notes) a.before(n);
    }
  });
}

App.ready(() => {
  collect(document);
  place();
  const mq = window.matchMedia('(max-width: 959px)');
  const onChange = () => place();
  if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  // stories move into the panel (inline notes) and back again (floated notes)
  App.on('story:open', () => requestAnimationFrame(place));
  App.on('story:close', () => requestAnimationFrame(place));

  // ------------------------------------------------------------ the toolbar steps aside while reading
  const nav = document.querySelector('.navbtn');
  if (!nav) return;
  let lastY = window.scrollY, ticking = false;
  const openPop = () => { try { return !!document.querySelector('.iw-pop:popover-open'); } catch (e) { return false; } };
  const busy = () => document.documentElement.classList.contains('sd-open') || nav.matches(':focus-within') ||
    openPop() || !!document.querySelector('.iw-pop.open, dialog[open]');
  function update() {
    ticking = false;
    const y = window.scrollY, dy = y - lastY;
    if (Math.abs(dy) < 6) return;
    if (y < 240 || dy < 0 || busy()) nav.classList.remove('tb-away');
    else nav.classList.add('tb-away');
    lastY = y;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  nav.addEventListener('focusin', () => nav.classList.remove('tb-away'));
  // bring it back when the pointer heads for the top edge
  window.addEventListener('mousemove', e => { if (e.clientY < 70) nav.classList.remove('tb-away'); }, { passive: true });
});
