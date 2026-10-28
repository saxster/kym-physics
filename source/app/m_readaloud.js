// Read aloud: any chapter section or story, sentence by sentence, with the sentence highlighted.
// Uses Isabella (Kokoro-82M neural TTS in the browser) or the Web Speech API; adds nothing when neither is supported.
import App from './core.js';

const synth = window.speechSynthesis;
const sysSupported = !!(synth && window.SpeechSynthesisUtterance);
// read-aloud works with the device's voices, or with the natural voice alone where those are missing
const supported = sysSupported || !!(window.Worker && window.WebAssembly && (window.AudioContext || window.webkitAudioContext));

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
  s = s.replace(/\bkg\/m³/g, ' kilograms per cubic metre')
    .replace(/\bg\/cm³/g, ' grams per cubic centimetre')
    .replace(/\bm\/s²/g, ' metres per second squared')
    .replace(/\bm\/s\b/g, ' metres per second')
    .replace(/\bkm\/s\b/g, ' kilometres per second')
    .replace(/\bkm\/h\b/g, ' kilometres per hour')
    .replace(/\bN\/kg\b/g, ' newtons per kilogram')
    .replace(/\bN\/m²/g, ' newtons per square metre')
    .replace(/\bcm²/g, ' square centimetres').replace(/\bm²/g, ' square metres')
    .replace(/cm³/g, ' cubic centimetres').replace(/m³/g, ' cubic metres');
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
    .replace(/\bkWh\b/g, 'kilowatt-hours').replace(/\bkW\b/g, 'kilowatts')
    .replace(/\bkJ\b/g, 'kilojoules').replace(/\bkPa\b/g, 'kilopascals').replace(/\bmL\b/g, 'millilitres')
    .replace(/\bGHz\b/g, 'gigahertz').replace(/\bMHz\b/g, 'megahertz').replace(/\bkHz\b/g, 'kilohertz').replace(/\bHz\b/g, 'hertz')
    .replace(/\bnT\b/g, 'nanotesla').replace(/µT\b/g, 'microtesla').replace(/µg\b/g, 'micrograms').replace(/µm\b/g, 'micrometres').replace(/µs\b/g, 'microseconds')
    .replace(/\bmol\b/g, 'moles').replace(/\bkm\b/g, 'kilometres').replace(/\bnm\b/g, 'nanometres').replace(/\bppm\b/g, 'parts per million')
    .replace(/(\d)\s?kg\b/g, '$1 kilograms').replace(/(\d)\s?g\b/g, '$1 grams').replace(/(\d)\s?cm\b/g, '$1 centimetres')
    .replace(/(\d)\s?mm\b/g, '$1 millimetres').replace(/(\d)\s?m\b/g, '$1 metres').replace(/(\d)\s?K\b/g, '$1 kelvin')
    .replace(/(\d)\s?N\b/g, '$1 newtons').replace(/(\d)\s?J\b/g, '$1 joules').replace(/(\d)\s?W\b/g, '$1 watts')
    .replace(/(\d)\s?V\b/g, '$1 volts').replace(/(\d)\s?A\b/g, '$1 amperes').replace(/(\d)\s?L\b/g, '$1 litres').replace(/(\d)\s?s\b/g, '$1 seconds')
    .replace(/(\d),(\d{3})/g, '$1$2')
    .replace(/\bBCE\b/g, 'B C E').replace(/\bCE\b/g, 'C E');
  return s.replace(/\s+/g, ' ').trim();
}

// ------------------------------------------------------------------ voices and settings
let voices = [];
function loadVoices() {
  try { voices = sysSupported ? (synth.getVoices() || []).filter(v => /^en/i.test(v.lang)) : []; } catch (e) { voices = []; }
  // Warmest voice first. Quality matters far more than accent: a natural neural voice beats an old robotic one.
  voices = voices.filter(v => !NOVELTY.test(v.name));
  voices.sort((a, b) => quality(b) - quality(a) || a.name.localeCompare(b.name));
  fillVoices();
}
// Novelty and robotic voices that ship with some systems: never offer them to a reader.
const NOVELTY = /\b(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Fred|Good News|Hysterical|Jester|Junior|Kathy|Organ|Pipe Organ|Princess|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|eSpeak)\b/i;
// The book's voice is warm, friendly, British and female (like Kokoro's bf_isabella). Among the device's own voices
// prefer, in order: British female natural voices (Microsoft Sonia/Libby in Edge, Apple Serena/Kate/Stephanie/Martha,
// Google UK English Female), then other high-quality British voices, then Indian English natural voices, then the rest.
const BRIT_FEMALE = [/\bSonia\b/, /\bLibby\b/, /\bSerena\b/, /\bKate\b/, /\bStephanie\b/, /\bMartha\b/, /Google UK English Female/];
const GOOD_NAMES = /\b(Isha|Rishi|Veena|Neerja|Prabhat|Serena|Kate|Daniel|Arthur|Martha|Moira|Fiona|Tessa|Karen|Samantha|Ava|Zoe|Allison|Susan|Evan|Nathan|Sonia|Libby|Ryan|Thomas|Stephanie)\b/i;
function quality(v) {
  const n = v.name || '';
  const gb = /en[-_]GB/i.test(v.lang);
  let q = 0;
  if (/natural|neural/i.test(n)) q += 60;
  if (/premium/i.test(n)) q += 50;
  if (/enhanced/i.test(n)) q += 40;
  if (/^Google\b/i.test(n) && !/UK English Female/.test(n)) q += 30;
  if (GOOD_NAMES.test(n)) q += 20;
  const bf = gb ? BRIT_FEMALE.findIndex(r => r.test(n)) : -1;
  if (bf >= 0) q += 200 - 5 * bf;               // the British female voices, in the order above
  if (gb && /natural|neural|premium|enhanced/i.test(n)) q += 20;   // a high-quality British voice beats an Indian one
  if (/\bMaisie\b/i.test(n)) q -= 40;          // a child's voice
  if (/compact/i.test(n)) q -= 20;
  if (gb) q += 12; else if (/en[-_]IN/i.test(v.lang)) q += 6; else if (/en[-_](AU|IE|NZ|ZA)/i.test(v.lang)) q += 3;
  return q;
}
const voicesAreBasic = () => !voices.length || quality(voices[0]) < 20;
function chosenVoice() {
  const uri = App.store.get('readaloud:voice', null);
  return voices.find(v => v.voiceURI === uri) || voices[0] || null;
}

// ------------------------------------------------------------------ Isabella: a natural neural voice, run in the browser
// Kokoro-82M (Apache-2.0) through kokoro-js (Apache-2.0), loaded from jsDelivr only when it is first needed, running in
// a Web Worker so the page stays smooth. The model comes from Hugging Face: on a graphics chip (WebGPU) the full-precision
// model, about 300 MB, which reads faster than real time; elsewhere the quantised one, about 90 MB. Either is kept in the
// browser's Cache Storage, so later visits start quickly. Text is read live, sentence by sentence: nothing is pre-recorded.
const KOKORO_JS = 'https://cdn.jsdelivr.net/npm/' + 'kokoro-js@1.2.1/dist/kokoro.web.js';
const KOKORO_MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const KOKORO_VOICE = 'bf_isabella';
const ISABELLA = 'kokoro:' + KOKORO_VOICE;
const kokoroPossible = !!(window.Worker && window.WebAssembly && (window.AudioContext || window.webkitAudioContext));
const useGPU = !!navigator.gpu;
let KOKORO_RUN = useGPU ? { dtype: 'fp32', device: 'webgpu' } : { dtype: 'q8', device: 'wasm' };
let KOKORO_MB = useGPU ? 'about 300 MB' : 'about 90 MB';
const saveData = !!(navigator.connection && navigator.connection.saveData);
const K = { state: 'idle', worker: null, files: {}, pct: 0, lastProgress: 0, timer: 0, waiters: [], seq: 0, pending: new Map(),
  cache: new Map(), fallback: false, slow: 0, offered: false, ctx: null, src: null };

const WORKER_SRC = `
let tts = null, chain = Promise.resolve();
self.onmessage = (e) => {
  const m = e.data;
  if (m.type === 'load') {
    (async () => {
      try {
        const mod = await import(m.url);
        tts = await mod.KokoroTTS.from_pretrained(m.model, { dtype: m.dtype, device: m.device,
          progress_callback: (p) => self.postMessage({ type: 'progress', status: p.status, file: p.file, loaded: p.loaded, total: p.total }) });
        self.postMessage({ type: 'ready' });
      } catch (err) { self.postMessage({ type: 'error', error: String((err && err.message) || err) }); }
    })();
  } else if (m.type === 'gen') {
    chain = chain.then(async () => {
      try {
        const t0 = performance.now();
        const a = await tts.generate(m.text, { voice: m.voice, speed: m.speed });
        const audio = a.audio;
        self.postMessage({ type: 'audio', id: m.id, audio, sr: a.sampling_rate, ms: performance.now() - t0 }, [audio.buffer]);
      } catch (err) { self.postMessage({ type: 'generr', id: m.id, error: String((err && err.message) || err) }); }
    });
  }
};`;

function engine() {
  const v = App.store.get('readaloud:voice', null);
  if (!kokoroPossible || K.fallback || K.state === 'failed') return 'system';
  if (v === ISABELLA) return 'kokoro';
  if (v == null) return 'kokoro';   // Isabella by default (on a data-saving connection the reader is asked first)
  return 'system';
}
function audioCtx() {
  if (!K.ctx) { const C = window.AudioContext || window.webkitAudioContext; try { K.ctx = new C(); } catch (e) { K.ctx = null; } }
  if (K.ctx && K.ctx.state === 'suspended') { try { K.ctx.resume(); } catch (e) {} }
  return K.ctx;
}
function loadKokoro() {
  if (K.state === 'ready') return Promise.resolve();
  if (K.state === 'failed') return Promise.reject(new Error('failed'));
  const p = new Promise((res, rej) => K.waiters.push({ res, rej }));
  if (K.state === 'loading') return p;
  K.state = 'loading'; K.files = {}; K.pct = 0; K.lastProgress = Date.now();
  try {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
    K.worker = new Worker(url, { type: 'module' });
  } catch (e) { kokoroFailed('no worker'); return p; }
  K.worker.onmessage = e => {
    const m = e.data;
    if (m.type === 'progress') {
      K.lastProgress = Date.now();
      if (m.file && m.total) { K.files[m.file] = { loaded: m.loaded || 0, total: m.total }; }
      const f = Object.values(K.files), tot = f.reduce((a, x) => a + x.total, 0), got = f.reduce((a, x) => a + Math.min(x.loaded, x.total), 0);
      if (tot) K.pct = Math.min(99, Math.round(got / tot * 100));
      updateLoading();
    } else if (m.type === 'ready') {
      K.state = 'ready'; clearInterval(K.timer); App.store.set('readaloud:kokoro-ok', true);
      K.waiters.splice(0).forEach(w => w.res());
    } else if (m.type === 'error') {
      if (KOKORO_RUN.device === 'webgpu') {   // the graphics-chip path failed: try the ordinary path once
        try { K.worker.terminate(); } catch (e) {}
        KOKORO_RUN = { dtype: 'q8', device: 'wasm' }; KOKORO_MB = 'about 90 MB';
        K.state = 'idle'; const w = K.waiters.splice(0); clearInterval(K.timer);
        loadKokoro().then(() => w.forEach(x => x.res()), err => w.forEach(x => x.rej(err)));
      } else kokoroFailed(m.error);
    }
    else if (m.type === 'audio' || m.type === 'generr') {
      const w = K.pending.get(m.id); if (!w) return;
      K.pending.delete(m.id);
      if (m.type === 'audio') w.res({ audio: m.audio, sr: m.sr, ms: m.ms }); else w.rej(new Error(m.error));
    }
  };
  K.worker.onerror = () => kokoroFailed('worker error');
  K.worker.postMessage({ type: 'load', url: KOKORO_JS, model: KOKORO_MODEL, dtype: KOKORO_RUN.dtype, device: KOKORO_RUN.device });
  K.timer = setInterval(() => { if (K.state === 'loading' && Date.now() - K.lastProgress > 60000) kokoroFailed('timeout'); }, 5000);
  return p;
}
function kokoroFailed(why) {
  if (K.state === 'failed') return;
  K.state = 'failed'; clearInterval(K.timer);
  try { K.worker && K.worker.terminate(); } catch (e) {}
  K.waiters.splice(0).forEach(w => w.rej(new Error(why)));
  K.pending.forEach(w => w.rej(new Error(why))); K.pending.clear();
  if (window.console) console.info('[read aloud] natural voice unavailable:', why);
}
// one generated sentence, cached by its text
function synth1(text) {
  const key = rate() + '|' + text;
  if (K.cache.has(key)) return K.cache.get(key);
  const pr = new Promise((res, rej) => { const id = ++K.seq; K.pending.set(id, { res, rej }); K.worker.postMessage({ type: 'gen', id, text, voice: KOKORO_VOICE, speed: rate() }); });
  K.cache.set(key, pr);
  pr.catch(() => K.cache.delete(key));
  if (K.cache.size > 40) K.cache.delete(K.cache.keys().next().value);
  return pr;
}
function stopAudio() { if (K.src) { try { K.src.onended = null; K.src.stop(); } catch (e) {} K.src = null; } }

const RATES = [0.85, 0.95, 1.1];
const rate = () => { const r = App.store.get('readaloud:rate', 0.95); return RATES.includes(r) ? r : 0.95; };

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

// after a sentence: a natural breath, longer between paragraphs, then the next one
function advance(token) {
  if (token !== st.token || !st.playing) return;
  const prev = st.list[st.i]; st.i++;
  if (st.i >= st.list.length) { stop(); return; }
  const gap = st.list[st.i].block !== prev.block ? 420 : 140;
  setTimeout(() => { if (token === st.token && st.playing && !st.paused) speakCurrent(); }, gap);
}

function speakCurrent() {
  const s = st.list[st.i];
  if (!s) { stop(); return; }
  const token = ++st.token;
  highlight(s);
  updatePlayer();
  if (engine() === 'kokoro') { speakKokoro(s, token); return; }
  speakSystem(s, token);
}

function speakSystem(s, token) {
  if (!synth) { stop(); return; }
  const u = new SpeechSynthesisUtterance(speakable(s.text));
  const v = chosenVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
  u.rate = rate();
  u.pitch = 1;
  u.onend = () => advance(token);
  u.onerror = e => { if (token !== st.token) return; if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; advance(token); };
  try { synth.speak(u); } catch (e) { stop(); }
}

function speakKokoro(s, token) {
  if (K.state !== 'ready') {
    // first use: fetch the voice (or ask first, on a data-saving connection), then start automatically
    if (saveData && K.state === 'idle' && !App.store.get('readaloud:kokoro-ok', false) && !K.askedOk) { showAsk(); return; }
    showLoading();
    loadKokoro().then(() => { hideLoading(); if (token === st.token && st.playing && !st.paused && engine() === 'kokoro') speakCurrent(); })
      .catch(() => { hideLoading(); fallBack('Isabella’s natural voice could not load here, so this device’s own voice is reading.'); });
    return;
  }
  const ctx = audioCtx();
  if (!ctx) { fallBack('This browser cannot play Isabella’s voice, so this device’s own voice is reading.'); return; }
  const want = speakable(s.text);
  const playStarted = performance.now();
  synth1(want).then(r => {
    if (token !== st.token || !st.playing || st.paused) return;
    // keep one or two sentences ready ahead, so there are no gaps
    for (let k = 1; k <= 2; k++) { const n = st.list[st.i + k]; if (n) synth1(speakable(n.text)).catch(() => {}); }
    const buf = ctx.createBuffer(1, r.audio.length, r.sr);
    buf.copyToChannel ? buf.copyToChannel(r.audio, 0) : buf.getChannelData(0).set(r.audio);
    const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
    stopAudio(); K.src = src;
    src.onended = () => { if (K.src === src) K.src = null; advance(token); };
    src.start();
    // too slow on this device? (the next sentence takes longer to make than this one takes to say, three times running)
    const dur = r.audio.length / r.sr * 1000;
    const waited = performance.now() - playStarted;
    if (waited > 100 && r.ms > dur) K.slow++; else if (waited < 50) K.slow = 0;
    if (K.slow >= 3 && !K.offered) { K.offered = true; offerSwitch(); }
  }).catch(() => { if (token === st.token) fallBack('Isabella’s voice stopped working, so this device’s own voice is reading.'); });
}

function fallBack(msg) {
  K.fallback = true;
  note(msg);
  if (st.playing && !st.paused) { st.token++; speakCurrent(); }
}

function start(blocks, label, source, from = 0) {
  stop(true);
  st.list = blocks.flatMap(sentences).filter(s => /[\w\d]/.test(s.text));
  if (!st.list.length) return;
  st.i = Math.max(0, Math.min(from, st.list.length - 1));
  st.playing = true; st.paused = false; st.label = label; st.source = source;
  if (engine() === 'kokoro') audioCtx();          // created inside the reader's tap, as browsers require
  showPlayer();
  try { synth && synth.cancel(); } catch (e) {}
  speakCurrent();
}

function haltAll() { try { synth && synth.cancel(); } catch (e) {} stopAudio(); }

function stop(quiet) {
  st.token++;
  st.playing = false; st.paused = false;
  haltAll();
  clearHighlight();
  hideLoading();
  if (!quiet) hidePlayer();
  document.querySelectorAll('.rl-btn[aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
}

function togglePause() {
  if (!st.playing) return;
  if (st.paused) {
    st.paused = false;
    if (engine() === 'kokoro') audioCtx();
    // resume() is unreliable in some browsers after a long pause; re-speak the sentence instead
    haltAll();
    speakCurrent();
  } else {
    st.paused = true; st.token++;
    haltAll();
    updatePlayer();
  }
}
function step(d) {
  if (!st.list.length) return;
  st.i = Math.max(0, Math.min(st.list.length - 1, st.i + d));
  haltAll();
  if (st.paused) { st.token++; highlight(st.list[st.i]); updatePlayer(); } else speakCurrent();
}

// ------------------------------------------------------------------ the mini player
let player = null, voiceSel = null;
function restartWithNewVoice() { if (st.playing && !st.paused) { haltAll(); hideLoading(); speakCurrent(); } }
function buildPlayer() {
  const { el } = App;
  const btn = (cls, label, icon, fn) => el('button', { type: 'button', class: 'rl-pb ' + cls, 'aria-label': label, title: label, html: icon, onclick: fn });
  const speed = el('select', { class: 'rl-sel rl-speed', 'aria-label': 'Reading speed', onchange: e => { App.store.set('readaloud:rate', +e.target.value); restartWithNewVoice(); } },
    RATES.map(r => el('option', { value: r, selected: r === rate() }, r + '×')));
  voiceSel = el('select', { class: 'rl-sel rl-voice', 'aria-label': 'Voice', onchange: e => {
    App.store.set('readaloud:voice', e.target.value);
    if (e.target.value === ISABELLA) { K.fallback = false; if (K.state === 'failed') K.state = 'idle'; K.askedOk = true; audioCtx(); }
    note(''); fillVoices(); restartWithNewVoice();
  } });
  player = el('div', { class: 'rl-player', role: 'region', 'aria-label': 'Read aloud', hidden: true },
    el('p', { class: 'rl-what' }, el('span', { class: 'rl-i', html: ICON }), el('span', { class: 'rl-label' }), el('span', { class: 'rl-count', 'aria-live': 'off' })),
    el('div', { class: 'rl-ctrls' },
      btn('rl-prev', 'Previous sentence', I.prev, () => step(-1)),
      btn('rl-play', 'Pause', I.pause, togglePause),
      btn('rl-next', 'Next sentence', I.next, () => step(1)),
      btn('rl-stop', 'Stop reading', I.stop, () => stop()),
      speed, voiceSel),
    el('div', { class: 'rl-load', hidden: true, role: 'status' },
      el('p', { class: 'rl-load-t' }),
      el('div', { class: 'rl-bar', 'aria-hidden': 'true' }, el('i')),
      el('div', { class: 'rl-load-b' })),
    el('p', { class: 'rl-note', hidden: true, role: 'status' }),
    el('p', { class: 'rl-tip', hidden: true },
      'For a warmer voice: on an iPad or iPhone, go to Settings → Accessibility → Spoken Content → Voices → English and download a “Premium” or “Enhanced” voice. On a computer, Microsoft Edge has natural-sounding voices built in.'));
  player.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); stop(); } });
  fillVoices();
}
function useDeviceVoice() {
  App.store.set('readaloud:voice', (voices[0] && voices[0].voiceURI) || 'system');
  hideLoading(); fillVoices();
  if (st.playing && !st.paused) { st.token++; haltAll(); speakCurrent(); }
}
function loadBox() { return player && player.querySelector('.rl-load'); }
function showLoading() {
  if (!player) return;
  const box = loadBox(); box.hidden = false;
  box.querySelector('.rl-load-b').replaceChildren(App.el('button', { type: 'button', class: 'rl-alt', onclick: useDeviceVoice }, 'Read now with this device’s voice instead'));
  updateLoading();
}
function updateLoading() {
  const box = loadBox(); if (!box || box.hidden) return;
  const fresh = !App.store.get('readaloud:kokoro-ok', false);
  box.querySelector('.rl-load-t').textContent = (fresh
    ? `Getting Isabella’s voice ready: a one-time download of ${KOKORO_MB}`
    : 'Getting Isabella’s voice ready') + (K.pct ? ` … ${K.pct}%` : ' …');
  box.querySelector('.rl-bar i').style.width = (K.pct || 2) + '%';
}
function hideLoading() { const box = loadBox(); if (box) box.hidden = true; }
function showAsk() {
  const box = loadBox(); if (!box) return;
  box.hidden = false;
  box.querySelector('.rl-load-t').textContent = `Isabella’s natural voice needs a one-time download of ${KOKORO_MB}.`;
  box.querySelector('.rl-bar i').style.width = '0%';
  box.querySelector('.rl-load-b').replaceChildren(
    App.el('button', { type: 'button', class: 'rl-alt rl-go', onclick: () => { K.askedOk = true; audioCtx(); st.token++; speakCurrent(); } }, 'Download Isabella'),
    App.el('button', { type: 'button', class: 'rl-alt', onclick: useDeviceVoice }, 'Use this device’s voice'));
}
function note(msg) {
  const n = player && player.querySelector('.rl-note'); if (!n) return;
  n.replaceChildren(msg || ''); n.hidden = !msg;
}
function offerSwitch() {
  const n = player && player.querySelector('.rl-note'); if (!n) return;
  n.replaceChildren('Isabella is slow on this device. ',
    App.el('button', { type: 'button', class: 'rl-alt', onclick: () => { note(''); useDeviceVoice(); } }, 'Switch to the device voice?'));
  n.hidden = false;
}
function fillVoices() {
  if (!voiceSel) return;
  const eng = engine();
  const cur = chosenVoice();
  voiceSel.innerHTML = '';
  if (kokoroPossible) voiceSel.append(App.el('option', { value: ISABELLA, selected: eng === 'kokoro' }, 'Isabella (natural voice)'));
  voices.forEach(v => voiceSel.append(App.el('option', { value: v.voiceURI, selected: eng !== 'kokoro' && cur && v.voiceURI === cur.voiceURI }, v.name.replace(/^(Microsoft|Google)\s+/, '') + ' (' + v.lang + ')')));
  voiceSel.hidden = voiceSel.options.length < 2;
  const tip = player && player.querySelector('.rl-tip');
  if (tip) tip.hidden = !(eng === 'system' && voicesAreBasic());
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
    if (sysSupported) { try { synth.addEventListener ? synth.addEventListener('voiceschanged', loadVoices) : (synth.onvoiceschanged = loadVoices); } catch (e) {} }
    addSectionButtons();
    addStoryButton();
    App.tool({ id: 'listen', label: 'Listen', icon: ICON, order: 40, title: 'Read aloud from here', onClick: readOnScreen });
    App.on('story:open', () => { if (st.playing) stop(); addStoryButton(); });
    App.on('story:close', () => { if (st.playing && st.source && st.source.matches('article.story')) stop(); else if (player && player.parentNode !== document.body && !st.playing) document.body.append(player); });
    window.addEventListener('pagehide', haltAll);
    document.addEventListener('keydown', e => {
      if (!st.playing || e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'Escape' && !document.getElementById('storydlg')?.open) stop();
    });
  });
}

export default { speakable };
