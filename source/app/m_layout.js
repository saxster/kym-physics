// Layout behaviour that CSS alone can't do.
//  1. Margin notes. In the source a definition note follows the paragraph that introduces its word. The build moves
//     each note in front of that paragraph so that, on wide screens, the floated note lines up with the paragraph's
//     first line. When a note sits in the text column instead (narrow screens, and inside the story panel), it must
//     come AFTER the paragraph, so the reader meets the word before its definition. This module moves notes to the
//     right side of their paragraph whenever the layout changes.
// The reading toolbar stays available, including after a deep link or a jump from search.
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

});
