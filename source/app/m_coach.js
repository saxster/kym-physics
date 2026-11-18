// 1-on-1 Full-Duplex Voice & Socratic Coach (Gemini Live Full-Duplex WebSocket + ElevenLabs British English en-GB + Isabella fallback).
// Turns every textbook in the factory into a live, shared-desk 1-on-1 tutor grounded in the active chapter, figures, and Understand-It cards.
import App from './core.js';

const FAMILY_VOICE_KEYS_STORAGE = 'kym:family:voice_keys';

const DEFAULT_MODES = [
  ['gemini_live_duplex', 'Gemini Live Duplex', 'Full-duplex WebSocket voice call (en-GB) with instant barge-in & page pointing'],
  ['hybrid_duplex_elevenlabs', 'Duplex + ElevenLabs', 'Gemini Live Socratic reasoning spoken in ElevenLabs British English (en-GB)'],
  ['elevenlabs_british', 'ElevenLabs en-GB', 'ElevenLabs British neural voice for 1-on-1 Coach & chapter Read-Aloud'],
  ['local_isabella', 'Isabella (Local)', 'In-browser neural British voice (Kokoro-82M) & grounded offline tutor'],
];

const DEFAULT_PRESETS = [
  { id: 'charlotte_oxford', label: 'Charlotte', fullLabel: 'Charlotte · Warm Oxford Tutor', elevenId: 'XB0fDUnXU5powFXDhCwa', geminiVoice: 'Aoede', lang: 'en-GB' },
  { id: 'george_rp', label: 'George', fullLabel: 'George · Classic British Fellow', elevenId: 'JBFqnCBsd6RMkjVDRZzb', geminiVoice: 'Fenrir', lang: 'en-GB' },
  { id: 'alice_educator', label: 'Alice', fullLabel: 'Alice · Clear British Educator', elevenId: 'Xb7hH8MSUJpSbSDYk0k2', geminiVoice: 'Kore', lang: 'en-GB' },
  { id: 'daniel_story', label: 'Daniel', fullLabel: 'Daniel · British Storyteller', elevenId: 'onwK4e9ZLuTAKqWW03F9', geminiVoice: 'Charon', lang: 'en-GB' },
];

const DEFAULT_GEMINI_MODELS = [
  ['gemini-3.8-live', 'Gemini 3.8 Live · Conversational Full-Duplex (en-GB)'],
  ['gemini-3.8-live-extended-thinking', 'Gemini 3.8 Live · Extended Thinking Full-Duplex (en-GB)'],
  ['gemini-2.5-flash-native-audio-preview-09-2025', 'Gemini 2.5 Flash Native Audio Live (en-GB)'],
];

const PERSONAS = [
  { id: 'charlotte', label: 'Charlotte · Oxford Tutor', tagline: 'Warm British peer tutor: concrete scene first, then the mechanism.' },
  { id: 'feynman', label: 'Feynman · Thing Before Name', tagline: 'No jargon labels: swap the technical word for "blarg" and prove the mechanism.' },
  { id: 'sparky', label: 'Sparky · Teach Me', tagline: 'Protégé mode: explain the idea to cure Sparky’s common misconception.' },
  { id: 'examiner', label: 'Examiner · Mark Scheme', tagline: 'Sharpens your wording against school & exam mark-scheme traps.' },
];

const PHASES = [
  { id: 'probe', label: '1. Probe', promptHint: 'Start by probing what the learner currently pictures happening.' },
  { id: 'mechanism', label: '2. Mechanism', promptHint: 'Unpack the physical, chemical, or biological cause-and-effect chain.' },
  { id: 'visual', label: '3. Visual Stage', promptHint: 'Point directly to a figure, Understand-It card, or section on the page.' },
  { id: 'explain', label: '4. Explain-Back', promptHint: 'Invite a crisp one-sentence explain-back in the learner’s own words.' },
];

function ensureVoiceKeysBridge() {
  if (App.voiceKeys && typeof App.voiceKeys.get === 'function') return App.voiceKeys;
  const readFam = () => {
    try { return JSON.parse(localStorage.getItem(FAMILY_VOICE_KEYS_STORAGE) || '{}'); } catch (e) { return {}; }
  };
  const writeFam = patch => {
    try {
      const next = Object.assign({}, readFam(), patch);
      localStorage.setItem(FAMILY_VOICE_KEYS_STORAGE, JSON.stringify(next));
      return next;
    } catch (e) { return patch || {}; }
  };
  const vk = {
    modes: DEFAULT_MODES,
    presets: DEFAULT_PRESETS,
    models: DEFAULT_GEMINI_MODELS,
    get() {
      const s = App.store.get('settings', {});
      const fam = readFam();
      const geminiApiKey = String(s.geminiApiKey ?? fam.geminiApiKey ?? '').trim();
      const elevenLabsApiKey = String(s.elevenLabsApiKey ?? fam.elevenLabsApiKey ?? '').trim();
      const rawMode = s.voiceMode || fam.voiceMode || (geminiApiKey && elevenLabsApiKey ? 'hybrid_duplex_elevenlabs' : geminiApiKey ? 'gemini_live_duplex' : elevenLabsApiKey ? 'elevenlabs_british' : 'gemini_live_duplex');
      const voiceMode = DEFAULT_MODES.some(m => m[0] === rawMode) ? rawMode : 'gemini_live_duplex';
      const rawPreset = s.voicePreset || fam.voicePreset || DEFAULT_PRESETS[0].id;
      const presetObj = DEFAULT_PRESETS.find(p => p.id === rawPreset) || DEFAULT_PRESETS[0];
      const rawModel = s.geminiLiveModel || fam.geminiLiveModel || DEFAULT_GEMINI_MODELS[0][0];
      const geminiLiveModel = DEFAULT_GEMINI_MODELS.some(m => m[0] === rawModel) ? rawModel : DEFAULT_GEMINI_MODELS[0][0];
      return {
        geminiApiKey,
        elevenLabsApiKey,
        voiceMode,
        voicePreset: presetObj.id,
        preset: presetObj,
        geminiLiveModel,
        hasGemini: geminiApiKey.length > 0,
        hasElevenLabs: elevenLabsApiKey.length > 0,
      };
    },
    set(patch) {
      const clean = {};
      if ('geminiApiKey' in patch) clean.geminiApiKey = String(patch.geminiApiKey || '').trim();
      if ('elevenLabsApiKey' in patch) clean.elevenLabsApiKey = String(patch.elevenLabsApiKey || '').trim();
      if ('voiceMode' in patch) clean.voiceMode = patch.voiceMode;
      if ('voicePreset' in patch) clean.voicePreset = patch.voicePreset;
      if ('geminiLiveModel' in patch) clean.geminiLiveModel = patch.geminiLiveModel;
      writeFam(clean);
      const s = Object.assign(App.store.get('settings', {}), clean);
      App.store.set('settings', s);
      const cur = vk.get();
      App.emit('voicekeys:change', cur);
      return cur;
    },
  };
  App.voiceKeys = vk;
  return vk;
}

// Ensure that even if a book uses an older m_settings.js, #settings-pop always gets the ElevenLabs + Gemini Live Full-Duplex API keys section.
function ensureSettingsVoiceSection() {
  const vk = ensureVoiceKeysBridge();
  const pop = document.getElementById('settings-pop');
  if (!pop || document.getElementById('settings-voice-coach-keys')) return;
  const { el } = App;
  const init = vk.get();

  const modeBtns = DEFAULT_MODES.map(([k, label, desc]) => el('button', {
    type: 'button', class: 'seg-b', 'aria-pressed': String(init.voiceMode === k), title: desc,
    onclick: () => { vk.set({ voiceMode: k }); syncFallbackSettings(); },
  }, label));
  const presetBtns = DEFAULT_PRESETS.map(p => el('button', {
    type: 'button', class: 'seg-b', 'aria-pressed': String(init.voicePreset === p.id), title: p.fullLabel,
    onclick: () => { vk.set({ voicePreset: p.id }); syncFallbackSettings(); },
  }, p.label));
  const gBadge = el('span', { class: 'vk-badge', id: 'settings-gemini-status' });
  const eBadge = el('span', { class: 'vk-badge', id: 'settings-elevenlabs-status' });
  const gIn = el('input', {
    type: 'password', class: 'vk-input', id: 'settings-gemini-key',
    placeholder: 'Paste Gemini Live API key (AIza…)', autocomplete: 'off', spellcheck: 'false', value: init.geminiApiKey,
  });
  const eIn = el('input', {
    type: 'password', class: 'vk-input', id: 'settings-elevenlabs-key',
    placeholder: 'Paste ElevenLabs API key (xi-api-key)', autocomplete: 'off', spellcheck: 'false', value: init.elevenLabsApiKey,
  });
  const notice = el('p', { class: 'vk-notice', id: 'settings-voice-keys-notice', role: 'status', 'aria-live': 'polite' });
  const commit = () => {
    vk.set({ geminiApiKey: gIn.value.trim(), elevenLabsApiKey: eIn.value.trim() });
    notice.textContent = 'Saved ElevenLabs & Gemini Live Full-Duplex keys across your Kym textbooks.';
    syncFallbackSettings();
  };
  gIn.addEventListener('change', commit);
  eIn.addEventListener('change', commit);

  function syncFallbackSettings() {
    const cur = vk.get();
    modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(DEFAULT_MODES[i][0] === cur.voiceMode)));
    presetBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(DEFAULT_PRESETS[i].id === cur.voicePreset)));
    gBadge.textContent = cur.hasGemini ? 'Saved · Full-Duplex Ready' : 'Not set';
    gBadge.classList.toggle('vk-ok', cur.hasGemini);
    eBadge.textContent = cur.hasElevenLabs ? 'Saved · en-GB Ready' : 'Not set';
    eBadge.classList.toggle('vk-ok', cur.hasElevenLabs);
  }
  syncFallbackSettings();
  App.on('voicekeys:change', syncFallbackSettings);

  const sec = el('div', { class: 'vk-sec', id: 'settings-voice-coach-keys' },
    el('p', { class: 'pop-h' }, '1-on-1 Voice Coach & Read-Aloud Keys (en-GB)'),
    el('p', { class: 'vk-sub' }, 'ElevenLabs (en-GB) reads aloud the static textbook chapters, sections, and stories to Kym; Gemini Live Voice powers full-duplex 1-on-1 Socratic tutor conversations with Kym.'),
    el('div', { class: 'seg seg-2x2', role: 'group', 'aria-label': 'Voice Coach engine mode' }, modeBtns),
    el('div', { class: 'seg', role: 'group', 'aria-label': 'British English tutor voice preset' }, presetBtns),
    el('div', { class: 'vk-field' },
      el('div', { class: 'vk-field-head' }, el('label', { class: 'vk-label', for: 'settings-gemini-key' }, 'Gemini Live Voice API Key · Full-Duplex 1-on-1 Tutor Conversations'), gBadge),
      el('div', { class: 'vk-input-row' }, gIn),
    ),
    el('div', { class: 'vk-field' },
      el('div', { class: 'vk-field-head' }, el('label', { class: 'vk-label', for: 'settings-elevenlabs-key' }, 'ElevenLabs API Key · Read Aloud Static Textbook Text (British en-GB)'), eBadge),
      el('div', { class: 'vk-input-row' }, eIn),
    ),
    el('div', { class: 'vk-actions' },
      el('button', { type: 'button', class: 'seg-b vk-btn vk-btn-primary', id: 'settings-save-keys-btn', onclick: commit }, 'Save API Keys'),
      el('button', { type: 'button', class: 'seg-b vk-btn', id: 'settings-open-coach-btn', onclick: () => { commit(); if (App.coach) App.coach.open(); } }, 'Open 1-on-1 Coach'),
    ),
    notice,
  );
  pop.append(sec);
}

// ------------------------------------------------------------------ Chapter & Visual Stage Grounding Harvester
function harvestActiveChapterContext() {
  const y = window.innerHeight * 0.35;
  const chapters = [...document.querySelectorAll('article.chapter')];
  let activeCh = chapters.find(ch => {
    const r = ch.getBoundingClientRect();
    return r.top <= y && r.bottom > y;
  }) || chapters.find(ch => ch.getClientRects().length > 0 && ch.getBoundingClientRect().bottom > 0) || chapters[0];

  const bookTitle = (document.querySelector('h1')?.textContent || document.title || 'Kym Textbook').trim();
  if (!activeCh) {
    return {
      bookTitle,
      chapterId: 'front',
      chapterNumber: '0',
      chapterTitle: bookTitle,
      bigQuestion: 'How do we build a working mental model from first principles?',
      sectionTitle: 'Introduction',
      sectionExcerpt: (document.querySelector('main')?.textContent || '').slice(0, 700).trim(),
      fiveTerms: [],
      carefulTraps: [],
      schoolBridges: [],
      starters: [
        'Quiz me on the main idea of this page',
        'Give me a concrete everyday example first',
        'Just explain the core mechanism step by step',
      ],
    };
  }

  const chId = activeCh.id || 'ch01';
  const chNum = (activeCh.querySelector('.opener .cn')?.textContent || chId).replace(/[^\d]/g, '') || '1';
  const chTitle = (activeCh.querySelector('.opener h2')?.textContent || 'Current Chapter').trim();
  const bigQ = (activeCh.querySelector('.opener .bigq')?.textContent || '').trim();

  // Find visible section inside active chapter
  const secs = [...activeCh.querySelectorAll('section.sec')];
  let activeSec = secs.find(s => {
    const r = s.getBoundingClientRect();
    return r.top <= y && r.bottom > y;
  }) || secs[0];

  let secTitle = chTitle;
  let secExcerpt = '';
  if (activeSec) {
    const h3 = activeSec.querySelector('h3');
    if (h3) {
      secTitle = [...h3.childNodes]
        .filter(n => !(n.classList && n.classList.contains('rl-btn')))
        .map(n => n.textContent)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    const paras = [...activeSec.querySelectorAll('p')].filter(p => !p.closest('aside, details, figure, .chk-a')).slice(0, 3);
    secExcerpt = paras.map(p => p.textContent.trim()).join(' ').slice(0, 850);
  }

  const fiveTerms = [...activeCh.querySelectorAll('details.five')].map(d => {
    const term = (d.querySelector('summary .five-term, summary b, summary')?.textContent || '').replace(/Understand it:?/i, '').trim();
    const firstAns = (d.querySelector('.five-body p, p')?.textContent || '').trim().slice(0, 220);
    return { term, firstAns, el: d };
  }).filter(x => x.term);

  const carefulTraps = [...activeCh.querySelectorAll('.careful, aside.careful')].map(c => c.textContent.replace(/\s+/g, ' ').trim().slice(0, 260)).slice(0, 3);
  const schoolBridges = [...activeCh.querySelectorAll('details.school')].map(s => s.textContent.replace(/\s+/g, ' ').trim().slice(0, 260)).slice(0, 2);

  const starters = [];
  if (bigQ) starters.push(bigQ);
  if (fiveTerms[0]) starters.push(`Unpack "${fiveTerms[0].term}" from first principles`);
  if (carefulTraps[0]) starters.push(`What is the common trap in ${secTitle}?`);
  starters.push(`Quiz me with one Socratic question on ${secTitle}`);
  starters.push(`Just explain ${secTitle} directly step by step`);

  return {
    bookTitle,
    chapterEl: activeCh,
    sectionEl: activeSec,
    chapterId: chId,
    chapterNumber: chNum,
    chapterTitle: chTitle,
    bigQuestion: bigQ,
    sectionTitle: secTitle,
    sectionExcerpt: secExcerpt,
    fiveTerms,
    carefulTraps,
    schoolBridges,
    starters: starters.slice(0, 4),
  };
}

// ------------------------------------------------------------------ Child-Safety Pre-Gate (Runs before any local or cloud AI call)
const CRISIS_RE = /\b(?:kill myself|suicide|end my life|self[- ]harm|hurt myself|want to die|nobody cares if i live)\b/i;
const CRISIS_SUPPORT_MSG = 'I care about your safety and wellbeing right now. Please pause the lesson and talk right away with a trusted parent or adult at home, or call Childline India (1098) / emergency services (112). You do not have to carry this alone.';

// ------------------------------------------------------------------ Deictic Page Pointing & Notebook Takeaway Helpers
let activeDeicticEl = null;
let deicticTimer = 0;

function clearDeicticHighlight() {
  if (deicticTimer) { clearTimeout(deicticTimer); deicticTimer = 0; }
  if (activeDeicticEl) {
    activeDeicticEl.classList.remove('coach-deictic-focus');
    activeDeicticEl = null;
  }
}

function pointToElementOnPage(targetEl) {
  if (!targetEl) return null;
  clearDeicticHighlight();
  if (targetEl.tagName === 'DETAILS') targetEl.open = true;
  activeDeicticEl = targetEl;
  targetEl.classList.add('coach-deictic-focus');
  targetEl.scrollIntoView({ behavior: App.reduceMotion() ? 'auto' : 'smooth', block: 'center' });
  deicticTimer = setTimeout(() => {
    if (activeDeicticEl === targetEl) {
      targetEl.classList.remove('coach-deictic-focus');
      activeDeicticEl = null;
    }
  }, 6500);
  return targetEl;
}

function findAndPointOnPage(query) {
  const ctx = harvestActiveChapterContext();
  const root = ctx.chapterEl || document.body;
  const q = String(query || '').toLowerCase().trim();
  if (!q) {
    if (ctx.sectionEl) return pointToElementOnPage(ctx.sectionEl);
    return null;
  }
  const cands = [...root.querySelectorAll('details.five, figure, section.sec > h3, .careful, details.school, p')];
  const tokens = q.split(/\W+/).filter(w => w.length >= 3);
  let best = null, bestScore = 0;
  for (const c of cands) {
    const txt = (c.textContent || '').toLowerCase();
    let score = txt.includes(q) ? 10 : 0;
    for (const t of tokens) if (txt.includes(t)) score += 2;
    if (c.matches('details.five, figure, section.sec > h3')) score += 1;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  const target = best || ctx.sectionEl;
  pointToElementOnPage(target);
  return target;
}

function saveTakeawayToNotebook(summaryText, ctx) {
  const clean = String(summaryText || '').trim();
  if (!clean) return false;
  const list = App.store.get('hl', []);
  const id = 'coach-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  list.push({
    id,
    ch: ctx.chapterId || 'ch01',
    chTitle: `Ch ${ctx.chapterNumber}: ${ctx.chapterTitle}`,
    secId: (ctx.sectionEl && ctx.sectionEl.id) || ctx.chapterId || 'ch01',
    secTitle: ctx.sectionTitle || ctx.chapterTitle,
    quote: `1-on-1 Coach Takeaway (${ctx.sectionTitle || ctx.chapterTitle})`,
    color: 'g',
    note: clean,
    t: Date.now(),
  });
  App.store.set('hl', list);
  App.emit('learn:change');
  return true;
}

// ------------------------------------------------------------------ Grounded Local & Cloud Socratic Synthesis
function buildSystemInstruction(ctx, persona, phase, vk, forceDirectExplain = false) {
  return [
    `You are ${vk.preset.fullLabel} (${persona.label}), a warm, rigorous 1-on-1 British English (en-GB) tutor sitting beside the reader in "${ctx.bookTitle}".`,
    `BRITISH ENGLISH & PEER VOICE CONTRACT:`,
    `- Always use natural British English (en-GB) spelling and phrasing: colour, centre, metre, litre, grey, maths, brackets, full stop.`,
    `- Follow Richard Feynman's rule (the thing before its name; a mechanism, never a bare label) and the warm peer tone of Head First and For Dummies.`,
    `- Keep every spoken turn concise: 2 to 4 sentences (under 65 words / ~12 seconds of speech) so it feels like a real 1-on-1 conversation at a desk.`,
    forceDirectExplain
      ? `- The learner asked to "just explain": give a crystal-clear, direct step-by-step explanation of the mechanism right now with zero Socratic gatekeeping.`
      : `- Active 4-Phase Teaching Step: ${phase.label} (${phase.promptHint}). End with one concrete question or check unless the learner asks you to "just explain".`,
    `ACTIVE BOOK CONTEXT ON SCREEN:`,
    `- Chapter ${ctx.chapterNumber}: ${ctx.chapterTitle}`,
    ctx.bigQuestion ? `- Chapter Big Question: ${ctx.bigQuestion}` : '',
    `- Active Section: ${ctx.sectionTitle}`,
    ctx.sectionExcerpt ? `- Section Excerpt: ${ctx.sectionExcerpt}` : '',
    ctx.fiveTerms.length ? `- Key Understand-It Concepts in Chapter: ${ctx.fiveTerms.map(f => `${f.term} (${f.firstAns})`).join(' | ')}` : '',
    ctx.carefulTraps.length ? `- Misconception Watchouts: ${ctx.carefulTraps.join(' | ')}` : '',
    ctx.schoolBridges.length ? `- School / Exam Wording Bridge: ${ctx.schoolBridges.join(' | ')}` : '',
  ].filter(Boolean).join('\n');
}

function generateLocalGroundedReply(userText, ctx, persona, phase, forceDirectExplain) {
  const q = userText.toLowerCase();
  const isDirect = forceDirectExplain || /\b(?:just explain|explain directly|tell me the answer|stop asking)\b/i.test(q);
  const matchedFive = ctx.fiveTerms.find(f => q.includes(f.term.toLowerCase())) || ctx.fiveTerms[0];

  if (persona.id === 'sparky' && !isDirect) {
    const topic = matchedFive ? matchedFive.term : ctx.sectionTitle;
    return {
      text: `Wait a minute — my notebook says ${topic} happens just because the system "wants" to balance itself! Why would a strict examiner cross out the word "wants"? What is the real physical or biological mechanism in ${ctx.sectionTitle}?`,
      tag: `Sparky Protégé Mode · Ch ${ctx.chapterNumber}`,
      pointQuery: topic,
    };
  }

  if (isDirect) {
    const core = matchedFive && matchedFive.firstAns
      ? `${matchedFive.term}: ${matchedFive.firstAns}`
      : (ctx.sectionExcerpt ? ctx.sectionExcerpt.split(/(?<=[.!?])\s+/).slice(0, 3).join(' ') : `In ${ctx.sectionTitle}, trace what moves, what stays conserved, and what gradient drives the change.`);
    const trap = ctx.carefulTraps[0] ? ` Watch out for the common trap: ${ctx.carefulTraps[0].slice(0, 160)}` : '';
    return {
      text: `Here is the direct step-by-step mechanism for ${ctx.sectionTitle}: ${core}${trap}`,
      tag: `Direct First-Principles Explanation · Ch ${ctx.chapterNumber}`,
      pointQuery: matchedFive ? matchedFive.term : ctx.sectionTitle,
    };
  }

  if (q.includes('trap') || q.includes('careful') || q.includes('mistake') || persona.id === 'examiner') {
    const trapText = ctx.carefulTraps[0] || (matchedFive ? `Avoid using "${matchedFive.term}" as a bare label without naming what physically moves or collides.` : `In ${ctx.sectionTitle}, always state the physical gradient or mechanism rather than saying a particle "wants" to move.`);
    return {
      text: `Here is the classic trap to watch for in ${ctx.sectionTitle}: ${trapText} How would you phrase the mechanism in one crisp sentence so an examiner awards full marks?`,
      tag: `Examiner Wording & Trap Check · Ch ${ctx.chapterNumber}`,
      pointQuery: matchedFive ? matchedFive.term : ctx.sectionTitle,
    };
  }

  if (matchedFive) {
    return {
      text: `Let’s look right at "${matchedFive.term}" in ${ctx.sectionTitle}. ${matchedFive.firstAns || ''} Before we name the rule, what do you picture changing on screen if we double the driving gradient?`,
      tag: `${persona.label} · ${phase.label}`,
      pointQuery: matchedFive.term,
    };
  }

  const leadSentence = (ctx.sectionExcerpt || '').split(/(?<=[.!?])\s+/)[0] || `We are looking at ${ctx.sectionTitle} in Chapter ${ctx.chapterNumber}.`;
  return {
    text: `${leadSentence} Let’s test our mental model: what is the concrete actor moving here, and what force, collision, or gradient pushes it?`,
    tag: `${persona.label} · ${phase.label}`,
    pointQuery: ctx.sectionTitle,
  };
}

async function generateGeminiSocraticReply(userText, ctx, persona, phase, vk, history, forceDirectExplain) {
  if (!vk.hasGemini) return null;
  const sys = buildSystemInstruction(ctx, persona, phase, vk, forceDirectExplain);
  const contents = history.slice(-6).map(m => ({
    role: m.role === 'coach' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));
  contents.push({ role: 'user', parts: [{ text: userText }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(vk.geminiApiKey)}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: sys }] },
      contents,
      generationConfig: { temperature: 0.35, maxOutputTokens: 260 },
    }),
  });
  if (!resp.ok) throw new Error('Gemini HTTP ' + resp.status);
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join(' ').trim();
  return text || null;
}

// ------------------------------------------------------------------ Full-Duplex Gemini Live WebSocket + Continuous Voice Engine
const COACH_TOOLS_DECL = [
  {
    name: 'focus_book_section',
    description: 'Scrolls to and highlights a section, figure, or paragraph on the textbook page while speaking.',
    parameters: {
      type: 'OBJECT',
      properties: { query: { type: 'STRING', description: 'Section heading, term, or phrase to highlight on the page.' } },
      required: ['query'],
    },
  },
  {
    name: 'open_understand_card',
    description: 'Opens and highlights an "Understand it" (5-question) concept card in the current chapter.',
    parameters: {
      type: 'OBJECT',
      properties: { term: { type: 'STRING', description: 'Concept term to open.' } },
      required: ['term'],
    },
  },
  {
    name: 'save_call_takeaway',
    description: 'Saves a concise 1-sentence learning takeaway from the 1-on-1 tutoring call into the reader’s Notebook.',
    parameters: {
      type: 'OBJECT',
      properties: { summary: { type: 'STRING', description: 'One-sentence takeaway to save.' } },
      required: ['summary'],
    },
  },
];

function int16ToBase64(int16Arr) {
  const bytes = new Uint8Array(int16Arr.buffer, int16Arr.byteOffset, int16Arr.byteLength);
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function base64ToInt16(b64) {
  const bin = atob(b64);
  const len = bin.length - (bin.length % 2);
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

// ------------------------------------------------------------------ UI & Session Controller
const ICON_COACH = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M10 2.5a3 3 0 0 0-3 3v3.8a3 3 0 0 0 6 0V5.5a3 3 0 0 0-3-3Z"/>' +
  '<path d="M4.8 8.8a5.2 5.2 0 0 0 10.4 0M10 14v3.5M7.2 17.5h5.6"/>' +
  '</svg>';

App.ready(() => {
  const { el } = App;
  const vk = ensureVoiceKeysBridge();
  ensureSettingsVoiceSection();

  let isOpen = false;
  let activePersona = PERSONAS[0];
  let activePhaseIdx = 0;
  let thinkingHold = false;
  let liveState = 'idle'; // 'idle' | 'connecting' | 'listening' | 'speaking' | 'hold'
  let messages = [];

  // Full-duplex WebSocket & audio state
  let ws = null;
  let micStream = null;
  let micAudioCtx = null;
  let micSource = null;
  let micProcessor = null;
  let playAudioCtx = null;
  let nextPlayTime = 0;
  let activePlayNodes = [];
  let speechRec = null;
  let speechRecActive = false;
  let currentOutputTranscript = '';
  let currentInputTranscript = '';
  let wsSetupDone = false;

  // Build initial greeting
  const initCtx = harvestActiveChapterContext();
  messages.push({
    role: 'coach',
    speaker: vk.get().preset.fullLabel,
    tag: `1-on-1 Tutor · Ch ${initCtx.chapterNumber}: ${initCtx.chapterTitle}`,
    text: `Hello! I’m ${vk.get().preset.label}, your 1-on-1 British voice tutor. We’re looking at Chapter ${initCtx.chapterNumber} (${initCtx.chapterTitle}). Tap "Start 1-on-1 Live Voice" to talk hands-free with full-duplex barge-in while you explore the page, or pick a question below.`,
  });

  // DOM Elements
  const statusDot = el('span', { class: 'cd-dot', 'aria-hidden': 'true' });
  const statusLabel = el('span', { class: 'cd-status-text' }, 'Ready · 1-on-1 Full-Duplex Tutor');
  const engineBadge = el('button', {
    type: 'button', class: 'cd-engine-pill', id: 'coach-engine-pill',
    title: 'Click to configure ElevenLabs & Gemini Live Full-Duplex API keys in Settings',
    onclick: () => openKeysInSettings(),
  });
  const anchorBar = el('div', { class: 'cd-anchor', id: 'coach-chapter-anchor' });

  const liveBtn = el('button', {
    type: 'button', class: 'cd-btn cd-btn-live', id: 'coach-live-btn',
    onclick: () => toggleLiveCall(),
  }, 'Start 1-on-1 Live Voice');

  const holdBtn = el('button', {
    type: 'button', class: 'cd-btn cd-btn-hold', id: 'coach-hold-btn',
    'aria-pressed': 'false',
    title: 'Pause microphone listening while you think or work out a step on paper',
    onclick: () => toggleThinkingHold(),
  }, 'Give me a moment');

  const explainBtn = el('button', {
    type: 'button', class: 'cd-btn', id: 'coach-explain-btn',
    title: 'Skip Socratic questions and get a direct step-by-step explanation',
    onclick: () => {
      const ctx = harvestActiveChapterContext();
      handleUserTurn(`Just explain ${ctx.sectionTitle} directly step by step.`, true);
    },
  }, 'Just explain');

  const testVoiceBtn = el('button', {
    type: 'button', class: 'cd-btn', id: 'coach-test-voice-btn',
    title: 'Hear a sample from your active British voice tutor',
    onclick: () => {
      const cur = vk.get();
      const ctx = harvestActiveChapterContext();
      const sample = `Hello! I am ${cur.preset.label}, your one-on-one tutor for ${ctx.chapterTitle}. Ask me anything or interrupt me whenever you want to test an idea.`;
      speakCoachReply(sample);
    },
  }, 'Test voice');

  const phaseBtns = PHASES.map((p, idx) => el('button', {
    type: 'button', class: 'cd-chip', 'aria-pressed': String(idx === activePhaseIdx),
    title: p.promptHint,
    onclick: () => {
      activePhaseIdx = idx;
      phaseBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === activePhaseIdx)));
    },
  }, p.label));

  const personaSelect = el('select', {
    class: 'cd-select', 'aria-label': 'Tutor persona',
    onchange: e => {
      activePersona = PERSONAS.find(p => p.id === e.target.value) || PERSONAS[0];
    },
  }, PERSONAS.map(p => el('option', { value: p.id }, p.label)));

  const startersWrap = el('div', { class: 'cd-starters', id: 'coach-starters' });
  const msgList = el('div', { class: 'cd-messages', id: 'coach-messages', role: 'log', 'aria-live': 'polite' });

  const textInput = el('input', {
    type: 'text', class: 'cd-input', id: 'coach-input',
    placeholder: 'Ask your 1-on-1 tutor, or say "just explain"…',
    'aria-label': 'Message to 1-on-1 Coach',
  });
  const sendBtn = el('button', {
    type: 'button', class: 'cd-btn cd-btn-send', id: 'coach-send-btn',
    onclick: () => submitTypedTurn(),
  }, 'Send');

  textInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submitTypedTurn(); }
  });

  const takeawayBtn = el('button', {
    type: 'button', class: 'cd-btn cd-btn-takeaway', id: 'coach-save-takeaway',
    onclick: () => {
      const lastCoach = [...messages].reverse().find(m => m.role === 'coach');
      if (!lastCoach) return;
      const ctx = harvestActiveChapterContext();
      saveTakeawayToNotebook(lastCoach.text, ctx);
      takeawayBtn.textContent = 'Saved to My Notebook ✓';
      setTimeout(() => { takeawayBtn.textContent = 'Save Takeaway to Notebook'; }, 2400);
    },
  }, 'Save Takeaway to Notebook');

  const keysShortcutBtn = el('button', {
    type: 'button', class: 'cd-btn', id: 'coach-keys-btn',
    onclick: () => openKeysInSettings(),
  }, 'API Keys (ElevenLabs & Gemini Live)');

  const desk = el('aside', {
    class: 'coach-desk', id: 'coach-desk', role: 'dialog',
    'aria-label': '1-on-1 Full-Duplex Voice Coach', hidden: true,
  },
    el('div', { class: 'cd-head' },
      el('div', { class: 'cd-head-titles' },
        el('p', { class: 'cd-eyebrow' }, '1-ON-1 FULL-DUPLEX TUTOR · BRITISH ENGLISH (en-GB)'),
        el('div', { class: 'cd-status-row' }, statusDot, statusLabel, engineBadge),
      ),
      el('div', { class: 'cd-head-actions' },
        el('button', {
          type: 'button', class: 'cd-icon-btn', title: 'Configure ElevenLabs & Gemini Live API Keys',
          'aria-label': 'Configure ElevenLabs and Gemini Live API Keys',
          onclick: () => openKeysInSettings(),
        }, 'Keys'),
        el('button', {
          type: 'button', class: 'cd-icon-btn cd-close', title: 'Close 1-on-1 Coach',
          'aria-label': 'Close 1-on-1 Coach',
          onclick: () => toggleDesk(false),
        }, '×'),
      ),
    ),
    anchorBar,
    el('div', { class: 'cd-voice-bar' }, liveBtn, holdBtn, explainBtn, testVoiceBtn),
    el('div', { class: 'cd-controls-row' },
      el('div', { class: 'cd-phases', role: 'group', 'aria-label': '4-phase teaching loop' }, phaseBtns),
      personaSelect,
    ),
    startersWrap,
    msgList,
    el('div', { class: 'cd-composer' }, textInput, sendBtn),
    el('div', { class: 'cd-foot' }, takeawayBtn, keysShortcutBtn),
  );
  document.body.append(desk);

  const toolbarBtn = App.tool({
    id: 'coach',
    label: 'Coach',
    icon: ICON_COACH,
    order: 45,
    title: '1-on-1 Full-Duplex Voice Coach (Gemini Live & ElevenLabs en-GB)',
    onClick: () => toggleDesk(),
  });

  function openKeysInSettings() {
    if (typeof App.openVoiceKeySettings === 'function') {
      App.openVoiceKeySettings();
      return;
    }
    const tbSettings = document.getElementById('tb-settings');
    if (tbSettings) tbSettings.click();
    const sec = document.getElementById('settings-voice-coach-keys');
    if (sec) setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  }

  function syncEngineBadge() {
    const cur = vk.get();
    let modeText = 'Isabella / Local Grounded';
    if (cur.hasGemini && cur.hasElevenLabs && cur.voiceMode === 'hybrid_duplex_elevenlabs') {
      modeText = `Duplex + ElevenLabs · ${cur.preset.label} (en-GB)`;
    } else if (cur.hasGemini && (cur.voiceMode === 'gemini_live_duplex' || cur.voiceMode === 'hybrid_duplex_elevenlabs')) {
      modeText = `Gemini Live Full-Duplex · ${cur.preset.label} (en-GB)`;
    } else if (cur.hasElevenLabs) {
      modeText = `ElevenLabs en-GB · ${cur.preset.label}`;
    } else if (cur.hasGemini) {
      modeText = `Gemini Live · ${cur.preset.label}`;
    } else {
      modeText = `Set ElevenLabs / Gemini Key →`;
    }
    engineBadge.textContent = modeText;
    engineBadge.classList.toggle('cd-engine-ready', cur.hasGemini || cur.hasElevenLabs);
  }

  function refreshContextUI() {
    const ctx = harvestActiveChapterContext();
    anchorBar.textContent = `Grounded in: Ch ${ctx.chapterNumber} · ${ctx.sectionTitle}`;
    startersWrap.replaceChildren(
      ...ctx.starters.map(prompt => el('button', {
        type: 'button', class: 'cd-starter-chip',
        onclick: () => handleUserTurn(prompt, /just explain/i.test(prompt)),
      }, prompt))
    );
  }

  function renderMessages() {
    msgList.replaceChildren(
      ...messages.map(m => {
        const card = el('div', { class: `cd-msg cd-msg-${m.role}` },
          el('div', { class: 'cd-msg-meta' },
            el('span', { class: 'cd-msg-who' }, m.role === 'coach' ? (m.speaker || vk.get().preset.fullLabel) : m.role === 'system' ? 'Safety & Support' : 'You'),
            m.tag ? el('span', { class: 'cd-msg-tag' }, m.tag) : null,
          ),
          el('p', { class: 'cd-msg-text' }, m.text),
        );
        if (m.pointQuery || m.role === 'coach') {
          const actions = el('div', { class: 'cd-msg-actions' });
          if (m.role === 'coach') {
            actions.append(el('button', {
              type: 'button', class: 'cd-mini-btn',
              onclick: () => speakCoachReply(m.text),
            }, 'Listen (en-GB)'));
          }
          if (m.pointQuery) {
            actions.append(el('button', {
              type: 'button', class: 'cd-mini-btn',
              onclick: () => findAndPointOnPage(m.pointQuery),
            }, `Point on page: ${m.pointQuery.slice(0, 28)}`));
          }
          card.append(actions);
        }
        return card;
      })
    );
    msgList.scrollTop = msgList.scrollHeight;
  }

  function setLiveStatus(state, text) {
    liveState = state;
    desk.setAttribute('data-live-state', state);
    statusLabel.textContent = text;
    const active = state !== 'idle';
    liveBtn.textContent = active ? 'End 1-on-1 Voice Call' : 'Start 1-on-1 Live Voice';
    liveBtn.setAttribute('aria-pressed', String(active));
  }

  function stopPlaybackBuffers() {
    activePlayNodes.forEach(n => { try { n.stop(); } catch (e) {} });
    activePlayNodes = [];
    if (playAudioCtx) nextPlayTime = playAudioCtx.currentTime;
    if (App.readaloud && typeof App.readaloud.stop === 'function') App.readaloud.stop();
  }

  function enqueuePCM24k(int16Samples) {
    if (!int16Samples || !int16Samples.length) return;
    if (!playAudioCtx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      playAudioCtx = new C({ sampleRate: 24000 });
    }
    if (playAudioCtx.state === 'suspended') {
      try { playAudioCtx.resume(); } catch (e) {}
    }
    const float32 = new Float32Array(int16Samples.length);
    for (let i = 0; i < int16Samples.length; i++) {
      float32[i] = int16Samples[i] / 32768;
    }
    const buf = playAudioCtx.createBuffer(1, float32.length, 24000);
    buf.getChannelData(0).set(float32);
    const src = playAudioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(playAudioCtx.destination);
    const now = playAudioCtx.currentTime;
    const startAt = Math.max(now + 0.015, nextPlayTime);
    nextPlayTime = startAt + buf.duration;
    activePlayNodes.push(src);
    src.onended = () => {
      activePlayNodes = activePlayNodes.filter(x => x !== src);
      if (activePlayNodes.length === 0 && liveState === 'speaking') {
        setLiveStatus(thinkingHold ? 'hold' : 'listening', thinkingHold ? 'Thinking Hold · Mic Paused' : 'Live Full-Duplex · Listening (en-GB)');
      }
    };
    src.start(startAt);
    if (liveState !== 'speaking') {
      setLiveStatus('speaking', 'Coach Speaking · Speak Anytime to Barge In');
    }
  }

  async function speakCoachReply(text) {
    if (!text) return;
    setLiveStatus('speaking', `Coach Speaking (${vk.get().preset.label} · en-GB)…`);
    if (App.readaloud && typeof App.readaloud.speakText === 'function') {
      await App.readaloud.speakText(text, {
        voicePreset: vk.get().voicePreset,
        onEnd: () => {
          if (ws || speechRecActive) {
            setLiveStatus(thinkingHold ? 'hold' : 'listening', thinkingHold ? 'Thinking Hold · Mic Paused' : 'Live 1-on-1 Call · Listening (en-GB)');
          } else {
            setLiveStatus('idle', 'Ready · 1-on-1 Full-Duplex Tutor');
          }
        },
      });
    } else {
      setLiveStatus('idle', 'Ready · 1-on-1 Full-Duplex Tutor');
    }
  }

  function handleDeicticToolCall(call) {
    const name = call?.name;
    const args = call?.args || {};
    const ctx = harvestActiveChapterContext();
    if (name === 'focus_book_section') {
      findAndPointOnPage(args.query || ctx.sectionTitle);
      return { status: 'focused', target: args.query || ctx.sectionTitle };
    }
    if (name === 'open_understand_card') {
      findAndPointOnPage(args.term || (ctx.fiveTerms[0] && ctx.fiveTerms[0].term) || ctx.sectionTitle);
      return { status: 'opened', term: args.term };
    }
    if (name === 'save_call_takeaway') {
      saveTakeawayToNotebook(args.summary || 'Key mechanism reviewed with 1-on-1 Coach.', ctx);
      return { status: 'saved_to_notebook' };
    }
    return { status: 'ok' };
  }

  async function startMicrophoneForWebSocket() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    const C = window.AudioContext || window.webkitAudioContext;
    micAudioCtx = new C();
    const sr = micAudioCtx.sampleRate;
    micSource = micAudioCtx.createMediaStreamSource(micStream);
    micProcessor = micAudioCtx.createScriptProcessor(2048, 1, 1);

    micProcessor.onaudioprocess = e => {
      if (!ws || ws.readyState !== WebSocket.OPEN || !wsSetupDone || thinkingHold) return;
      const input = e.inputBuffer.getChannelData(0);
      // Compute RMS for barge-in & visual indicator
      let sum = 0;
      for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
      const rms = Math.sqrt(sum / input.length);
      desk.style.setProperty('--coach-vu', Math.min(1, rms * 8).toFixed(2));
      if (rms > 0.065 && liveState === 'speaking') {
        stopPlaybackBuffers();
        clearDeicticHighlight();
      }
      // Downsample to 16kHz Int16 PCM
      const ratio = sr / 16000;
      const outLen = Math.max(1, Math.floor(input.length / ratio));
      const pcm16 = new Int16Array(outLen);
      for (let i = 0; i < outLen; i++) {
        const s = Math.max(-1, Math.min(1, input[Math.min(input.length - 1, Math.floor(i * ratio))]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      const b64 = int16ToBase64(pcm16);
      try {
        ws.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: b64 }],
          },
        }));
      } catch (err) {}
    };

    micSource.connect(micProcessor);
    micProcessor.connect(micAudioCtx.destination);
  }

  function startSpeechRecognitionDuplexLoop() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setLiveStatus('listening', 'Live Voice Active · Type or use mic below (en-GB)');
      return;
    }
    try {
      speechRec = new SR();
      speechRec.lang = 'en-GB';
      speechRec.continuous = true;
      speechRec.interimResults = true;
      speechRecActive = true;

      speechRec.onSpeechStart = () => {
        if (liveState === 'speaking') {
          stopPlaybackBuffers();
          clearDeicticHighlight();
        }
      };

      speechRec.onresult = e => {
        if (thinkingHold) return;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          const t = (r[0]?.transcript || '').trim();
          if (!t) continue;
          if (!r.isFinal && t.length > 4 && liveState === 'speaking') {
            stopPlaybackBuffers();
          }
          if (r.isFinal) {
            handleUserTurn(t, false, true);
          }
        }
      };

      speechRec.onend = () => {
        if (speechRecActive && !thinkingHold) {
          try { speechRec.start(); } catch (e) {}
        }
      };

      speechRec.start();
      setLiveStatus('listening', `Live Full-Duplex · Listening (${vk.get().preset.label} · en-GB)`);
    } catch (e) {
      setLiveStatus('listening', 'Live Tutor Active · Ask below');
    }
  }

  async function startFullDuplexCall() {
    stopFullDuplexCall();
    const cur = vk.get();
    const ctx = harvestActiveChapterContext();
    thinkingHold = false;
    holdBtn.setAttribute('aria-pressed', 'false');

    // If Gemini API key is configured and user selected Gemini Live Duplex or Hybrid Duplex, connect via Gemini Live WebSocket
    if (cur.hasGemini && (cur.voiceMode === 'gemini_live_duplex' || cur.voiceMode === 'hybrid_duplex_elevenlabs')) {
      setLiveStatus('connecting', 'Connecting Gemini Live Full-Duplex (en-GB)…');
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(cur.geminiApiKey)}`;
      const modelCandidates = [
        cur.geminiLiveModel,
        'gemini-2.5-flash-native-audio-preview-09-2025',
        'gemini-2.0-flash-live-001',
      ].filter((v, i, a) => v && a.indexOf(v) === i);

      let modelIdx = 0;
      const connectWithModel = modelSlug => {
        try {
          ws = new WebSocket(wsUrl);
        } catch (err) {
          startSpeechRecognitionDuplexLoop();
          return;
        }
        wsSetupDone = false;
        currentOutputTranscript = '';
        currentInputTranscript = '';

        ws.onopen = () => {
          const resourceModel = modelSlug.startsWith('models/') ? modelSlug : `models/${modelSlug}`;
          const sys = buildSystemInstruction(ctx, activePersona, PHASES[activePhaseIdx], cur, false);
          const generationConfig = {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: cur.preset.geminiVoice } },
              languageCode: 'en-GB',
            },
          };
          if (modelSlug === 'gemini-3.8-live-extended-thinking') {
            generationConfig.thinkingConfig = { thinkingLevel: 'medium' };
          }
          const setupPayload = {
            setup: {
              model: resourceModel,
              generationConfig,
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              realtimeInputConfig: {
                automaticActivityDetection: { silenceDurationMs: 650, prefixPaddingMs: 250 },
              },
              contextWindowCompression: { slidingWindow: {} },
              systemInstruction: { parts: [{ text: sys }] },
              tools: [{ functionDeclarations: COACH_TOOLS_DECL }],
            },
          };
          ws.send(JSON.stringify(setupPayload));
        };

        ws.onmessage = async evt => {
          let msg = null;
          try {
            const raw = typeof evt.data === 'string' ? evt.data : await evt.data.text();
            msg = JSON.parse(raw);
          } catch (e) { return; }

          if (msg.setupComplete !== undefined || !wsSetupDone) {
            wsSetupDone = true;
            setLiveStatus('listening', `Live Full-Duplex · Listening (${cur.preset.label} · en-GB)`);
            startMicrophoneForWebSocket().catch(() => {});
            if (msg.setupComplete !== undefined) return;
          }

          if (msg.toolCall && Array.isArray(msg.toolCall.functionCalls)) {
            const responses = msg.toolCall.functionCalls.map(fc => ({
              id: fc.id,
              name: fc.name,
              response: handleDeicticToolCall(fc),
            }));
            try { ws.send(JSON.stringify({ toolResponse: { functionResponses: responses } })); } catch (e) {}
          }

          const sc = msg.serverContent;
          if (!sc) return;

          if (sc.interrupted) {
            stopPlaybackBuffers();
            clearDeicticHighlight();
            setLiveStatus('listening', `Interrupted · Listening (${cur.preset.label} · en-GB)`);
            return;
          }

          if (sc.inputTranscription && sc.inputTranscription.text) {
            currentInputTranscript += sc.inputTranscription.text;
          }
          if (sc.outputTranscription && sc.outputTranscription.text) {
            currentOutputTranscript += sc.outputTranscription.text;
          }

          const useElevenVoice = cur.hasElevenLabs && cur.voiceMode === 'hybrid_duplex_elevenlabs';
          if (sc.modelTurn && Array.isArray(sc.modelTurn.parts)) {
            for (const part of sc.modelTurn.parts) {
              if (part.text) currentOutputTranscript += part.text;
              if (part.inlineData && part.inlineData.data && /^audio\/pcm/i.test(part.inlineData.mimeType || '')) {
                if (!useElevenVoice) {
                  enqueuePCM24k(base64ToInt16(part.inlineData.data));
                }
              }
            }
          }

          if (sc.turnComplete) {
            if (currentInputTranscript.trim()) {
              messages.push({ role: 'user', text: currentInputTranscript.trim() });
              currentInputTranscript = '';
            }
            if (currentOutputTranscript.trim()) {
              const outText = currentOutputTranscript.trim();
              currentOutputTranscript = '';
              messages.push({
                role: 'coach',
                speaker: cur.preset.fullLabel,
                tag: `Gemini Live Full-Duplex · Ch ${ctx.chapterNumber}`,
                text: outText,
                pointQuery: ctx.sectionTitle,
              });
              renderMessages();
              if (useElevenVoice) {
                speakCoachReply(outText);
              }
            } else {
              renderMessages();
            }
          }
        };

        ws.onerror = () => {};
        ws.onclose = () => {
          if (!wsSetupDone && modelIdx + 1 < modelCandidates.length) {
            modelIdx += 1;
            connectWithModel(modelCandidates[modelIdx]);
            return;
          }
          if (!wsSetupDone) {
            // Fall back cleanly to continuous speech recognition + Gemini REST + ElevenLabs/Isabella duplex loop
            ws = null;
            startSpeechRecognitionDuplexLoop();
          }
        };
      };

      connectWithModel(modelCandidates[0]);
      return;
    }

    // ElevenLabs en-GB or Local Isabella continuous voice call loop
    startSpeechRecognitionDuplexLoop();
    const welcome = cur.hasElevenLabs
      ? `Live voice session started with ElevenLabs British English (${cur.preset.label}). What part of ${ctx.sectionTitle} shall we explore first?`
      : `Live voice session started with in-browser British voice. Add your Gemini Live or ElevenLabs API key in Settings anytime for cloud full-duplex. What shall we explore in ${ctx.sectionTitle}?`;
    speakCoachReply(welcome);
  }

  function stopFullDuplexCall() {
    wsSetupDone = false;
    if (ws) { try { ws.onclose = null; ws.close(); } catch (e) {} ws = null; }
    if (micProcessor) { try { micProcessor.disconnect(); } catch (e) {} micProcessor = null; }
    if (micSource) { try { micSource.disconnect(); } catch (e) {} micSource = null; }
    if (micAudioCtx) { try { micAudioCtx.close(); } catch (e) {} micAudioCtx = null; }
    if (micStream) { try { micStream.getTracks().forEach(t => t.stop()); } catch (e) {} micStream = null; }
    if (speechRec) { speechRecActive = false; try { speechRec.onend = null; speechRec.stop(); } catch (e) {} speechRec = null; }
    stopPlaybackBuffers();
    desk.style.setProperty('--coach-vu', '0');
    setLiveStatus('idle', 'Ready · 1-on-1 Full-Duplex Tutor');
  }

  function toggleLiveCall() {
    if (liveState === 'idle') startFullDuplexCall();
    else stopFullDuplexCall();
  }

  function toggleThinkingHold() {
    thinkingHold = !thinkingHold;
    holdBtn.setAttribute('aria-pressed', String(thinkingHold));
    holdBtn.textContent = thinkingHold ? 'Resume listening' : 'Give me a moment';
    if (thinkingHold) {
      stopPlaybackBuffers();
      if (liveState !== 'idle') setLiveStatus('hold', 'Thinking Hold · Mic Paused while you think');
    } else if (liveState === 'hold') {
      setLiveStatus('listening', `Live Full-Duplex · Listening (${vk.get().preset.label} · en-GB)`);
    }
  }

  async function handleUserTurn(rawText, forceDirectExplain = false, speakOut = false) {
    const text = String(rawText || '').trim();
    if (!text) return;
    stopPlaybackBuffers();
    messages.push({ role: 'user', text });
    renderMessages();

    // 1. Child-Safety Pre-Gate
    if (CRISIS_RE.test(text)) {
      stopFullDuplexCall();
      messages.push({
        role: 'system',
        tag: 'Safety & Wellbeing Support · Lesson Paused',
        text: CRISIS_SUPPORT_MSG,
      });
      renderMessages();
      return;
    }

    const ctx = harvestActiveChapterContext();
    const cur = vk.get();
    const phase = PHASES[activePhaseIdx];

    // If an active Gemini Live WebSocket is open, send the turn directly into the live full-duplex session
    if (ws && ws.readyState === WebSocket.OPEN && wsSetupDone) {
      try {
        ws.send(JSON.stringify({
          clientContent: {
            turns: [{ role: 'user', parts: [{ text }] }],
            turnComplete: true,
          },
        }));
        return;
      } catch (e) {}
    }

    // Try Gemini Socratic reply if Gemini key is configured, otherwise local grounded reply
    let replyText = null;
    let replyTag = `${cur.preset.label} · ${phase.label}`;
    let pointQuery = ctx.sectionTitle;

    if (cur.hasGemini) {
      try {
        setLiveStatus(liveState === 'idle' ? 'idle' : 'connecting', 'Thinking…');
        replyText = await generateGeminiSocraticReply(text, ctx, activePersona, phase, cur, messages, forceDirectExplain);
        replyTag = `Gemini + ${cur.hasElevenLabs ? 'ElevenLabs en-GB' : cur.preset.label} · Ch ${ctx.chapterNumber}`;
      } catch (e) {
        replyText = null;
      }
    }

    if (!replyText) {
      const local = generateLocalGroundedReply(text, ctx, activePersona, phase, forceDirectExplain);
      replyText = local.text;
      replyTag = local.tag;
      pointQuery = local.pointQuery;
    }

    // Advance 4-phase loop naturally
    activePhaseIdx = (activePhaseIdx + 1) % PHASES.length;
    phaseBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === activePhaseIdx)));

    messages.push({
      role: 'coach',
      speaker: cur.preset.fullLabel,
      tag: replyTag,
      text: replyText,
      pointQuery,
    });
    renderMessages();
    if (pointQuery) findAndPointOnPage(pointQuery);

    const shouldSpeak = speakOut || liveState !== 'idle' || cur.hasElevenLabs;
    if (shouldSpeak) {
      speakCoachReply(replyText);
    }
  }

  function submitTypedTurn() {
    const val = textInput.value.trim();
    if (!val) return;
    textInput.value = '';
    handleUserTurn(val, /just explain/i.test(val), liveState !== 'idle' || vk.get().hasElevenLabs);
  }

  function toggleDesk(force) {
    isOpen = force == null ? !isOpen : !!force;
    desk.hidden = !isOpen;
    document.documentElement.classList.toggle('coach-open', isOpen);
    if (toolbarBtn) toolbarBtn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      syncEngineBadge();
      refreshContextUI();
      renderMessages();
      textInput.focus();
    }
  }

  // Inject "Ask 1-on-1 Coach" buttons into every :::five ("Understand it") card & Mastery Studio
  function decorateChapterCards() {
    document.querySelectorAll('details.five').forEach(d => {
      if (d.querySelector('.coach-five-btn')) return;
      const term = (d.querySelector('summary .five-term, summary b, summary')?.textContent || 'this concept')
        .replace(/Understand it:?/i, '').trim();
      const btn = el('button', {
        type: 'button', class: 'coach-five-btn',
        onclick: e => {
          e.stopPropagation();
          toggleDesk(true);
          handleUserTurn(`Walk me through "${term}" one-on-one and quiz me on why it works.`, false);
        },
      }, `Talk to 1-on-1 Coach about ${term}`);
      d.append(btn);
    });
  }

  // Stream stage slider/toggle interactions into active Gemini Live session with turnComplete: false
  document.addEventListener('change', e => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !wsSetupDone) return;
    const fig = e.target && e.target.closest && e.target.closest('figure, .live-stage');
    if (!fig) return;
    const label = (e.target.getAttribute('aria-label') || e.target.name || 'stage control').trim();
    const val = e.target.value;
    try {
      ws.send(JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text: `[Learner adjusted figure control "${label}" to ${val}]` }] }],
          turnComplete: false,
        },
      }));
    } catch (err) {}
  });

  decorateChapterCards();
  syncEngineBadge();
  refreshContextUI();
  renderMessages();

  App.on('voicekeys:change', () => {
    syncEngineBadge();
  });
  App.on('coach:open', () => toggleDesk(true));
  window.addEventListener('hashchange', () => { if (isOpen) refreshContextUI(); });

  App.coach = {
    open: (initialPrompt) => {
      toggleDesk(true);
      if (initialPrompt) handleUserTurn(initialPrompt, false);
    },
    close: () => toggleDesk(false),
    startLiveVoice: () => { toggleDesk(true); startFullDuplexCall(); },
    stopLiveVoice: () => stopFullDuplexCall(),
  };
});
