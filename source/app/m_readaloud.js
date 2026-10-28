// Read aloud: any chapter section or story, sentence by sentence, with the sentence highlighted.
// Uses the Web Speech API; adds nothing at all when it is missing.
import App from './core.js';

const synth = window.speechSynthesis;
const supported = !!(synth && window.SpeechSynthesisUtterance);

const ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 7.5h3l4-3.5v12l-4-3.5h-3z" fill="currentColor"/>' +
  '<path d="M13.2 7a4 4 0 0 1 0 6M15.4 5a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const I = {
  play: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 4h3v12h-3zM11.5 4h3v12h-3z" fill="currentColor"/></svg>',
  stop: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="5" width="10" height="10" rx="1.5" fill="currentColor"/></svg>',
  prev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4h2v12H5zM16 4L8 10l8 6z" fill="currentColor"/></svg>',
  next: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13 4h2v12h-2zM4 4l8 6-8 6z" fill="currentColor"/></svg>',
};

// ------------------------------------------------------------------ what to read
const BLOCKS = 'h2, h3, h4, p, li, dt, dd';
const SKIP = 'figure, svg, .side, button, .st-callout, code, pre, template, .chk-a, details, nav, .ans, .live-controls, ' +
  '.rl-player, .chapter-toc, .toolbar, .noscript, .cast, .st-index, script, style, .opener .cn';

function collectBlocks(root) {
  return [...root.querySelectorAll(BLOCKS)].filter(b => {
    if (b.closest(SKIP)) return false;
    if (b.tagName === 'LI' && b.querySelector('p')) return false;   // its paragraphs are read instead
    if (b.closest('li') && b.tagName !== 'LI' && b.tagName !== 'P') return false;
    return b.textContent.trim().length > 0 && b.getClientRects().length > 0;
  });
}

// Text nodes of a block (skipping nested things we never read), with their running offsets.
function textMap(block) {
  const nodes = []; let text = '';
  const walk = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.parentElement && n.parentElement.closest(SKIP) && !block.closest(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  for (let n = walk.nextNode(); n; n = walk.nextNode()) { nodes.push({ node: n, start: text.length }); text += n.data; }
  return { nodes, text };
}

const ABBR = /\b(?:e\.g|i\.e|etc|Mr|Mrs|Dr|St|Prof|vs|c|approx|No)\.$/i;
function sentences(block) {
  const { nodes, text } = textMap(block);
  const out = [];
  const re = /[^.!?…]+(?:[.!?…]+["”’)\]]*|$)\s*/g;
  let m, start = 0, buf = '';
  while ((m = re.exec(text)) && m[0]) {
    buf += m[0];
    const end = m.index + m[0].length;
    if (ABBR.test(buf.trim()) || /\d\.$/.test(buf.trim()) && /^\d/.test(text.slice(end))) continue;
    if (buf.trim()) out.push({ block, start, end, text: buf.trim(), nodes });
    start = end; buf = '';
  }
  if (buf.trim()) out.push({ block, start, end: text.length, text: buf.trim(), nodes });
  return out;
}

function rangeFor(s) {
  const r = document.createRange();
  const at = off => {
    for (let i = s.nodes.length - 1; i >= 0; i--) if (s.nodes[i].start <= off) return { node: s.nodes[i].node, off: Math.min(off - s.nodes[i].start, s.nodes[i].node.length) };
    return { node: s.nodes[0].node, off: 0 };
  };
  const lead = s.start + (s.nodes.length ? (textOf(s).match(/^\s*/)[0].length) : 0);
  const a = at(lead), b = at(Math.max(lead, s.end - (textOf(s).match(/\s*$/)[0].length)));
  try { r.setStart(a.node, a.off); r.setEnd(b.node, b.off); } catch (e) { r.selectNodeContents(s.block); }
  return r;
}
function textOf(s) { return s.nodes.map(n => n.node.data).join('').slice(s.start, s.end); }

// ------------------------------------------------------------------ making text speakable
const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₊': '+', '₋': '-' };
const supRun = '[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+';
const toPlain = (s, map) => [...s].map(c => map[c] || c).join('');

export function speakable(t) {
  let s = t;
  s = s.replace(/cm³/g, ' cubic centimetres').replace(/m³/g, ' cubic metres');
  // powers of ten: 6.022 × 10²³, 10⁻⁶
  s = s.replace(new RegExp('10(' + supRun + ')', 'g'), (_, e) => {
    const p = toPlain(e, SUP);
    return '10 to the power ' + (p[0] === '-' ? 'minus ' + p.slice(1) : p.replace('+', ''));
  });
  // charges on ions: Na⁺, Mg²⁺, SO₄²⁻
  s = s.replace(new RegExp('(' + supRun + ')', 'g'), e => {
    const p = toPlain(e, SUP);
    const n = p.replace(/[+-]/g, '');
    const sign = p.includes('+') ? 'plus' : p.includes('-') ? 'minus' : '';
    return ' ' + [n, sign].filter(Boolean).join(' ') + ' ';
  });
  s = s.replace(/[₀-₉₊₋]+/g, e => ' ' + toPlain(e, SUB) + ' ');
  s = s.replace(/(\d)\s*×\s*/g, '$1 times ').replace(/×/g, ' times ')
    .replace(/≈/g, ' about ').replace(/~(?=\s*\d)/g, ' about ')
    .replace(/⇌/g, ' goes both ways to ').replace(/[→⟶]/g, ' gives ').replace(/←/g, ' comes from ')
    .replace(/±/g, ' plus or minus ').replace(/÷/g, ' divided by ').replace(/−(?=\s*\d)/g, ' minus ').replace(/−/g, ' minus ')
    .replace(/≤/g, ' less than or equal to ').replace(/≥/g, ' at least ').replace(/</g, ' less than ').replace(/>/g, ' more than ')
    .replace(/°C\b/g, ' degrees Celsius').replace(/°F\b/g, ' degrees Fahrenheit').replace(/°/g, ' degrees')
    .replace(/\bpH\b/g, 'P H').replace(/\bpKa\b/g, 'P K A')
    .replace(/\bmol\/L\b/g, 'moles per litre').replace(/\bg\/mol\b/g, 'grams per mole').replace(/\bg\/L\b/g, 'grams per litre')
    .replace(/\bkJ\b/g, 'kilojoules').replace(/\bkPa\b/g, 'kilopascals').replace(/\bmL\b/g, 'millilitres')
    .replace(/\bmol\b/g, 'moles').replace(/\bkm\b/g, 'kilometres').replace(/\bnm\b/g, 'nanometres').replace(/\bppm\b/g, 'parts per million')
    .replace(/(\d)\s?kg\b/g, '$1 kilograms').replace(/(\d)\s?g\b/g, '$1 grams').replace(/(\d)\s?cm\b/g, '$1 centimetres')
    .replace(/(\d)\s?mm\b/g, '$1 millimetres').replace(/(\d)\s?m\b/g, '$1 metres').replace(/(\d)\s?K\b/g, '$1 kelvin')
    .replace(/(\d)\s?V\b/g, '$1 volts').replace(/(\d)\s?L\b/g, '$1 litres').replace(/(\d)\s?s\b/g, '$1 seconds')
    .replace(/(\d),(\d{3})/g, '$1$2')
    .replace(/\bBCE\b/g, 'B C E').replace(/\bCE\b/g, 'C E');
  return s.replace(/\s+/g, ' ').trim();
}

// ------------------------------------------------------------------ voices and settings
let voices = [];
function loadVoices() {
  try { voices = (synth.getVoices() || []).filter(v => /^en/i.test(v.lang)); } catch (e) { voices = []; }
  const rank = v => (/en[-_]GB/i.test(v.lang) ? 0 : /en[-_]IN/i.test(v.lang) ? 1 : 2) + (v.localService ? 0 : 0.5);
  voices.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  fillVoices();
}
function chosenVoice() {
  const uri = App.store.get('readaloud:voice', null);
  return voices.find(v => v.voiceURI === uri) || voices[0] || null;
}
const RATES = [0.85, 1, 1.15];
const rate = () => { const r = App.store.get('readaloud:rate', 1); return RATES.includes(r) ? r : 1; };

// ------------------------------------------------------------------ the reader
const st = { list: [], i: 0, playing: false, paused: false, token: 0, label: '', source: null };
const hlSupported = !!(window.CSS && CSS.highlights && window.Highlight);
let fallbackEl = null;

function clearHighlight() {
  if (hlSupported) CSS.highlights.delete('readaloud');
  if (fallbackEl) { fallbackEl.classList.remove('rl-cur'); fallbackEl = null; }
  document.querySelectorAll('.rl-block').forEach(b => b.classList.remove('rl-block'));
}
function highlight(s) {
  clearHighlight();
  s.block.classList.add('rl-block');
  if (hlSupported) { try { CSS.highlights.set('readaloud', new Highlight(rangeFor(s))); } catch (e) { s.block.classList.add('rl-cur'); fallbackEl = s.block; } }
  else { s.block.classList.add('rl-cur'); fallbackEl = s.block; }
  const r = s.block.getBoundingClientRect();
  const vh = window.innerHeight;
  if (r.top < vh * 0.12 || r.bottom > vh * 0.78) {
    s.block.scrollIntoView({ block: 'center', behavior: App.reduceMotion() ? 'auto' : 'smooth' });
  }
}

function speakCurrent() {
  const s = st.list[st.i];
  if (!s) { stop(); return; }
  const token = ++st.token;
  highlight(s);
  updatePlayer();
  const u = new SpeechSynthesisUtterance(speakable(s.text));
  const v = chosenVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
  u.rate = rate();
  u.onend = () => { if (token !== st.token || !st.playing) return; st.i++; if (st.i < st.list.length) speakCurrent(); else stop(); };
  u.onerror = e => { if (token !== st.token) return; if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; st.i++; if (st.playing && st.i < st.list.length) speakCurrent(); else stop(); };
  try { synth.speak(u); } catch (e) { stop(); }
}

function start(blocks, label, source, from = 0) {
  stop(true);
  st.list = blocks.flatMap(sentences).filter(s => /[\w\d]/.test(s.text));
  if (!st.list.length) return;
  st.i = Math.max(0, Math.min(from, st.list.length - 1));
  st.playing = true; st.paused = false; st.label = label; st.source = source;
  showPlayer();
  try { synth.cancel(); } catch (e) {}
  speakCurrent();
}

function stop(quiet) {
  st.token++;
  st.playing = false; st.paused = false;
  try { synth.cancel(); } catch (e) {}
  clearHighlight();
  if (!quiet) hidePlayer();
  document.querySelectorAll('.rl-btn[aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
}

function togglePause() {
  if (!st.playing) return;
  if (st.paused) {
    st.paused = false;
    // resume() is unreliable in some browsers after a long pause; re-speak the sentence instead
    try { synth.cancel(); } catch (e) {}
    speakCurrent();
  } else {
    st.paused = true; st.token++;
    try { synth.cancel(); } catch (e) {}
    updatePlayer();
  }
}
function step(d) {
  if (!st.list.length) return;
  st.i = Math.max(0, Math.min(st.list.length - 1, st.i + d));
  try { synth.cancel(); } catch (e) {}
  if (st.paused) { st.token++; highlight(st.list[st.i]); updatePlayer(); } else speakCurrent();
}

// ------------------------------------------------------------------ the mini player
let player = null, voiceSel = null;
function buildPlayer() {
  const { el } = App;
  const btn = (cls, label, icon, fn) => el('button', { type: 'button', class: 'rl-pb ' + cls, 'aria-label': label, title: label, html: icon, onclick: fn });
  const speed = el('select', { class: 'rl-sel rl-speed', 'aria-label': 'Reading speed', onchange: e => { App.store.set('readaloud:rate', +e.target.value); if (st.playing && !st.paused) { try { synth.cancel(); } catch (x) {} speakCurrent(); } } },
    RATES.map(r => el('option', { value: r, selected: r === rate() }, r + '×')));
  voiceSel = el('select', { class: 'rl-sel rl-voice', 'aria-label': 'Voice', onchange: e => { App.store.set('readaloud:voice', e.target.value); if (st.playing && !st.paused) { try { synth.cancel(); } catch (x) {} speakCurrent(); } } });
  player = el('div', { class: 'rl-player', role: 'region', 'aria-label': 'Read aloud', hidden: true },
    el('p', { class: 'rl-what' }, el('span', { class: 'rl-i', html: ICON }), el('span', { class: 'rl-label' }), el('span', { class: 'rl-count', 'aria-live': 'off' })),
    el('div', { class: 'rl-ctrls' },
      btn('rl-prev', 'Previous sentence', I.prev, () => step(-1)),
      btn('rl-play', 'Pause', I.pause, togglePause),
      btn('rl-next', 'Next sentence', I.next, () => step(1)),
      btn('rl-stop', 'Stop reading', I.stop, () => stop()),
      speed, voiceSel));
  player.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); stop(); } });
  fillVoices();
}
function fillVoices() {
  if (!voiceSel) return;
  const cur = chosenVoice();
  voiceSel.innerHTML = '';
  voices.forEach(v => voiceSel.append(App.el('option', { value: v.voiceURI, selected: cur && v.voiceURI === cur.voiceURI }, v.name.replace(/^(Microsoft|Google)\s+/, '') + ' (' + v.lang + ')')));
  voiceSel.hidden = voices.length < 2;
}
function playerHost() {
  const dlg = document.getElementById('storydlg');
  return dlg && dlg.open ? dlg : document.body;   // a modal dialog is the top layer; the player must live inside it
}
function showPlayer() {
  if (!player) buildPlayer();
  const host = playerHost();
  if (player.parentNode !== host) host.append(player);
  player.hidden = false;
  document.documentElement.classList.add('rl-on');
  updatePlayer();
}
function hidePlayer() { if (player) player.hidden = true; document.documentElement.classList.remove('rl-on'); }
function updatePlayer() {
  if (!player) return;
  player.querySelector('.rl-label').textContent = st.label;
  player.querySelector('.rl-count').textContent = st.list.length ? `${st.i + 1} of ${st.list.length}` : '';
  const p = player.querySelector('.rl-play');
  p.innerHTML = st.paused ? I.play : I.pause;
  p.setAttribute('aria-label', st.paused ? 'Resume' : 'Pause'); p.title = st.paused ? 'Resume' : 'Pause';
  player.classList.toggle('paused', st.paused);
}

// ------------------------------------------------------------------ entry points
function readSection(sec, btn) {
  if (st.playing && st.source === sec) { stop(); return; }
  const h = sec.querySelector('h3');
  const n = h && h.querySelector('.n');
  const label = h ? (n ? 'Section ' + n.textContent + ': ' : '') + [...h.childNodes].filter(x => !(x.classList && (x.classList.contains('n') || x.classList.contains('rl-btn')))).map(x => x.textContent).join('').trim() : 'This part';
  start(collectBlocks(sec), label, sec);
  if (btn) btn.setAttribute('aria-pressed', 'true');
}
function readStory(art, from = 0) {
  if (st.playing && st.source === art) { stop(); return; }
  start(collectBlocks(art), art.getAttribute('data-story-title') || 'Story', art, from);
}

function onScreenSource() {
  const dlg = document.getElementById('storydlg');
  if (dlg && dlg.open) return { el: dlg.querySelector('.sd-body article.story'), story: true };
  const y = window.innerHeight * 0.35;
  const cands = [...document.querySelectorAll('section.sec, .chapter .intro, section.front, .backmatter section, article.story, .volume')];
  let best = null;
  for (const c of cands) {
    const r = c.getBoundingClientRect();
    if (r.top <= y && r.bottom > y && (!best || best.contains(c))) best = c;
  }
  return best ? { el: best, story: best.matches('article.story') } : null;
}
function readOnScreen() {
  if (st.playing) { stop(); return; }
  const src = onScreenSource();
  if (!src || !src.el) return;
  const blocks = collectBlocks(src.el);
  // start from the first block that is visible on screen
  const vh = window.innerHeight;
  let firstIdx = blocks.findIndex(b => { const r = b.getBoundingClientRect(); return r.bottom > vh * 0.08 && r.top < vh; });
  if (firstIdx < 0) firstIdx = 0;
  const vis = blocks.slice(firstIdx);
  const h = src.el.querySelector('h3, h2');
  const n = h && h.querySelector('.n');
  const label = src.story ? (src.el.getAttribute('data-story-title') || 'Story')
    : h ? (n ? 'Section ' + n.textContent + ': ' : '') + [...h.childNodes].filter(x => !(x.classList && (x.classList.contains('n') || x.classList.contains('rl-btn')))).map(x => x.textContent).join('').trim()
    : 'This page';
  start(vis, label, src.el);
}

function addSectionButtons() {
  document.querySelectorAll('section.sec > h3').forEach(h => {
    if (h.querySelector('.rl-btn')) return;
    const sec = h.parentElement;
    const n = h.querySelector('.n');
    const b = App.el('button', { type: 'button', class: 'rl-btn', 'aria-pressed': 'false', 'aria-label': 'Listen to section ' + (n ? n.textContent : ''), title: 'Listen to this section', html: ICON,
      onclick: e => { e.preventDefault(); readSection(sec, b); } });
    h.append(b);
  });
}

function addStoryButton() {
  const bar = document.querySelector('#storydlg .sd-bar');
  if (!bar || bar.querySelector('.rl-story')) return;
  const b = App.el('button', { type: 'button', class: 'rl-story', 'aria-label': 'Listen to this story', title: 'Listen to this story', onclick: () => {
    const art = document.querySelector('#storydlg .sd-body article.story');
    if (art) readStory(art);
  } }, App.el('span', { class: 'rl-i', html: ICON }), App.el('span', { class: 'rl-l' }, 'Listen'));
  const close = bar.querySelector('.sd-close');
  bar.insertBefore(b, close || null);
}

if (supported) {
  App.ready(() => {
    loadVoices();
    try { synth.addEventListener ? synth.addEventListener('voiceschanged', loadVoices) : (synth.onvoiceschanged = loadVoices); } catch (e) {}
    addSectionButtons();
    addStoryButton();
    App.tool({ id: 'listen', label: 'Listen', icon: ICON, order: 40, title: 'Read aloud from here', onClick: readOnScreen });
    App.on('story:open', () => { if (st.playing) stop(); addStoryButton(); });
    App.on('story:close', () => { if (st.playing && st.source && st.source.matches('article.story')) stop(); else if (player && player.parentNode !== document.body && !st.playing) document.body.append(player); });
    window.addEventListener('pagehide', () => { try { synth.cancel(); } catch (e) {} });
    document.addEventListener('keydown', e => {
      if (!st.playing || e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'Escape' && !document.getElementById('storydlg')?.open) stop();
    });
  });
}

export default { speakable };
