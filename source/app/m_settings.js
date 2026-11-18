// Reading settings: profiles, typeface, text size, line spacing, line length, theme, Still mode, Paper sounds, Projector mode,
// and 1-on-1 Voice Coach API keys (ElevenLabs British English en-GB & Gemini Live Voice Full-Duplex).
import App from './core.js';

const SIZES = [0.92, 1, 1.1, 1.22];
const SIZE_NAMES = ['Smaller', 'Normal', 'Larger', 'Largest'];
const FACES = [['literata', 'Literata'], ['georgia', 'New York'], ['sans', 'Lexend'], ['mono', 'Mono']];
const SPACINGS = [['compact', 'Compact', '1.48'], ['comfortable', 'Comfortable', '1.65'], ['spacious', 'Spacious', '1.92']];
const WIDTHS = [['narrow', 'Narrow', '31rem'], ['normal', 'Normal', '36rem'], ['wide', 'Wide', '43rem']];
const PROFILES = [
  ['read', 'Read', { face: 'literata', size: 1, spacing: 'comfortable', width: 'normal', theme: 'sepia' }],
  ['study', 'Study', { face: 'georgia', size: 2, spacing: 'comfortable', width: 'narrow', theme: 'light' }],
  ['evening', 'Evening', { face: 'literata', size: 2, spacing: 'spacious', width: 'normal', theme: 'dark' }],
];
const THEMES = [['auto', 'Auto'], ['light', 'Light'], ['sepia', 'Sepia'], ['dark', 'Dark']];

export const VOICE_COACH_MODES = [
  ['gemini_live_duplex', 'Gemini Live Duplex', 'Full-duplex WebSocket voice call (en-GB) with instant barge-in & page pointing'],
  ['hybrid_duplex_elevenlabs', 'Duplex + ElevenLabs', 'Gemini Live Socratic reasoning spoken in ElevenLabs British English (en-GB)'],
  ['elevenlabs_british', 'ElevenLabs en-GB', 'ElevenLabs British neural voice for 1-on-1 Coach & chapter Read-Aloud'],
  ['local_isabella', 'Isabella (Local)', 'In-browser neural British voice (Kokoro-82M) & grounded offline tutor'],
];

export const BRITISH_VOICE_PRESETS = [
  { id: 'charlotte_oxford', label: 'Charlotte', fullLabel: 'Charlotte · Warm Oxford Tutor', elevenId: 'XB0fDUnXU5powFXDhCwa', geminiVoice: 'Aoede', lang: 'en-GB' },
  { id: 'george_rp', label: 'George', fullLabel: 'George · Classic British Fellow', elevenId: 'JBFqnCBsd6RMkjVDRZzb', geminiVoice: 'Fenrir', lang: 'en-GB' },
  { id: 'alice_educator', label: 'Alice', fullLabel: 'Alice · Clear British Educator', elevenId: 'Xb7hH8MSUJpSbSDYk0k2', geminiVoice: 'Kore', lang: 'en-GB' },
  { id: 'daniel_story', label: 'Daniel', fullLabel: 'Daniel · British Storyteller', elevenId: 'onwK4e9ZLuTAKqWW03F9', geminiVoice: 'Charon', lang: 'en-GB' },
];

export const GEMINI_LIVE_MODELS = [
  ['gemini-3.8-live', 'Gemini 3.8 Live · Conversational Full-Duplex (en-GB)'],
  ['gemini-3.8-live-extended-thinking', 'Gemini 3.8 Live · Extended Thinking Full-Duplex (en-GB)'],
  ['gemini-2.5-flash-native-audio-preview-09-2025', 'Gemini 2.5 Flash Native Audio Live (en-GB)'],
];

const FAMILY_VOICE_KEYS_STORAGE = 'kym:family:voice_keys';

function readSharedFamilyVoiceKeys() {
  try {
    const raw = localStorage.getItem(FAMILY_VOICE_KEYS_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeSharedFamilyVoiceKeys(patch) {
  try {
    const cur = readSharedFamilyVoiceKeys();
    const next = Object.assign({}, cur, patch);
    localStorage.setItem(FAMILY_VOICE_KEYS_STORAGE, JSON.stringify(next));
    return next;
  } catch (e) {
    return patch || {};
  }
}

export const voiceKeys = {
  modes: VOICE_COACH_MODES,
  presets: BRITISH_VOICE_PRESETS,
  models: GEMINI_LIVE_MODELS,
  get() {
    const s = App.store.get('settings', {});
    const fam = readSharedFamilyVoiceKeys();
    const geminiApiKey = String(s.geminiApiKey ?? fam.geminiApiKey ?? '').trim();
    const elevenLabsApiKey = String(s.elevenLabsApiKey ?? fam.elevenLabsApiKey ?? '').trim();
    const rawMode = s.voiceMode || fam.voiceMode || (geminiApiKey && elevenLabsApiKey ? 'hybrid_duplex_elevenlabs' : geminiApiKey ? 'gemini_live_duplex' : elevenLabsApiKey ? 'elevenlabs_british' : 'gemini_live_duplex');
    const voiceMode = VOICE_COACH_MODES.some(m => m[0] === rawMode) ? rawMode : 'gemini_live_duplex';
    const rawPreset = s.voicePreset || fam.voicePreset || BRITISH_VOICE_PRESETS[0].id;
    const presetObj = BRITISH_VOICE_PRESETS.find(p => p.id === rawPreset) || BRITISH_VOICE_PRESETS[0];
    const rawModel = s.geminiLiveModel || fam.geminiLiveModel || GEMINI_LIVE_MODELS[0][0];
    const geminiLiveModel = GEMINI_LIVE_MODELS.some(m => m[0] === rawModel) ? rawModel : GEMINI_LIVE_MODELS[0][0];
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
    writeSharedFamilyVoiceKeys(clean);
    const s = Object.assign(App.store.get('settings', {}), clean);
    App.store.set('settings', s);
    const current = voiceKeys.get();
    App.emit('voicekeys:change', current);
    return current;
  },
};
App.voiceKeys = voiceKeys;

const root = document.documentElement;

function apply() {
  const s = App.store.get('settings', {});
  const size = Number.isInteger(s.size) ? Math.max(0, Math.min(3, s.size)) : 0;  // default: the smallest size
  root.style.setProperty('--scale', SIZES[size]);
  const face = FACES.some(f => f[0] === s.face) ? s.face : 'literata';
  root.setAttribute('data-face', face);
  const spEntry = SPACINGS.find(x => x[0] === s.spacing) || SPACINGS[1];
  const spacing = spEntry[0];
  root.style.setProperty('--lh', spEntry[2]);
  const wdEntry = WIDTHS.find(x => x[0] === s.width) || WIDTHS[1];
  const width = wdEntry[0];
  root.style.setProperty('--measure', wdEntry[2]);
  const theme = s.theme || 'sepia';  // default: sepia
  if (theme !== 'auto') root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');
  const still = !!s.still;
  root.classList.toggle('still', still);
  if (document.body) document.body.classList.toggle('still', still);
  const projector = !!s.projector;
  if (projector) root.setAttribute('data-projector', '1');
  else root.removeAttribute('data-projector');
  const sound = s.sound !== false;
  const vk = voiceKeys.get();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--paper').trim() || '#f6f4ec');
  return {
    size, face, spacing, width, theme, still, projector, sound,
    voiceMode: vk.voiceMode, voicePreset: vk.voicePreset, geminiLiveModel: vk.geminiLiveModel,
    hasGemini: vk.hasGemini, hasElevenLabs: vk.hasElevenLabs,
  };
}
apply(); // as early as the module runs, before the toolbar is drawn

const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 18 8 6l4.5 12M5.2 13.6h5.6"/><path d="M14.5 18l3-8 3 8M15.6 15.4h3.8"/></svg>';
const ICON_STILL = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="10" cy="10" r="7.5"/><path d="M10 2.5 A7.5 7.5 0 0 1 10 17.5 Z" fill="currentColor" stroke="none"/></svg>';

App.ready(() => {
  const { el } = App;
  const supportsPopover = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;
  let state = apply();

  const profileBtns = PROFILES.map(([k, label, patch]) => el('button', {
    type: 'button', class: 'seg-b', 'aria-pressed': 'false', onclick: () => save(patch),
  }, label));
  const faceBtns = FACES.map(([k, label]) => el('button', {
    type: 'button', class: 'seg-b', 'aria-pressed': 'false', onclick: () => save({ face: k }),
  }, label));
  const sizeBtns = SIZES.map((_, i) => el('button', {
    type: 'button', class: 'seg-b', 'aria-pressed': 'false', 'aria-label': `Text size: ${SIZE_NAMES[i]}`,
    onclick: () => save({ size: i }),
  }, el('span', { style: `font-size:${0.78 + i * 0.13}rem`, 'aria-hidden': 'true' }, 'A')));
  const spacingBtns = SPACINGS.map(([k, label]) => el('button', {
    type: 'button', class: 'seg-b', 'aria-pressed': 'false', onclick: () => save({ spacing: k }),
  }, label));
  const widthBtns = WIDTHS.map(([k, label]) => el('button', {
    type: 'button', class: 'seg-b', 'aria-pressed': 'false', onclick: () => save({ width: k }),
  }, label));
  const themeBtns = THEMES.map(([k, label]) => el('button', {
    type: 'button', class: `seg-b th th-${k}`, 'aria-pressed': 'false', onclick: () => save({ theme: k }),
  }, el('span', { class: 'sw', 'aria-hidden': 'true' }), label));

  const stillToggle = el('button', {
    type: 'button', class: 'seg-b seg-wide', 'aria-pressed': 'false',
    onclick: () => save({ still: !state.still }),
  }, 'Still mode (freeze motion)');
  const soundToggle = el('button', {
    type: 'button', class: 'seg-b seg-wide', 'aria-pressed': 'false',
    onclick: () => save({ sound: !state.sound }),
  }, 'Paper & stamp sounds');
  const projToggle = el('button', {
    type: 'button', class: 'seg-b seg-wide', 'aria-pressed': 'false',
    onclick: () => save({ projector: !state.projector }),
  }, 'Projector mode (classroom)');

  // ------------------------------------------------------------------ 1-on-1 Voice Coach & API Keys (ElevenLabs + Gemini Live Full-Duplex)
  const voiceModeBtns = VOICE_COACH_MODES.map(([k, label, desc]) => el('button', {
    type: 'button', class: 'seg-b', 'aria-pressed': 'false', title: desc,
    'data-voice-mode': k,
    onclick: () => { voiceKeys.set({ voiceMode: k }); save({ voiceMode: k }); },
  }, label));

  const voicePresetBtns = BRITISH_VOICE_PRESETS.map(p => el('button', {
    type: 'button', class: 'seg-b', 'aria-pressed': 'false', title: p.fullLabel,
    'data-voice-preset': p.id,
    onclick: () => { voiceKeys.set({ voicePreset: p.id }); save({ voicePreset: p.id }); },
  }, p.label));

  const vkInit = voiceKeys.get();
  const geminiStatusBadge = el('span', { class: 'vk-badge', id: 'settings-gemini-status' });
  const elevenStatusBadge = el('span', { class: 'vk-badge', id: 'settings-elevenlabs-status' });

  const geminiInput = el('input', {
    type: 'password',
    class: 'vk-input',
    id: 'settings-gemini-key',
    placeholder: 'Paste Gemini Live API key (AIza…)',
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-label': 'Gemini Live Voice API Key for full-duplex 1-on-1 tutor',
    value: vkInit.geminiApiKey,
  });
  let showGeminiKey = false;
  const geminiShowBtn = el('button', {
    type: 'button', class: 'vk-eye', 'aria-label': 'Show or hide Gemini API key',
    onclick: () => {
      showGeminiKey = !showGeminiKey;
      geminiInput.type = showGeminiKey ? 'text' : 'password';
      geminiShowBtn.textContent = showGeminiKey ? 'Hide' : 'Show';
    },
  }, 'Show');

  const geminiModelSelect = el('select', {
    class: 'vk-select',
    id: 'settings-gemini-model',
    'aria-label': 'Gemini Live Full-Duplex model tier',
    onchange: e => {
      voiceKeys.set({ geminiLiveModel: e.target.value });
      save({ geminiLiveModel: e.target.value });
    },
  }, GEMINI_LIVE_MODELS.map(([id, label]) => el('option', { value: id, selected: id === vkInit.geminiLiveModel }, label)));

  const elevenInput = el('input', {
    type: 'password',
    class: 'vk-input',
    id: 'settings-elevenlabs-key',
    placeholder: 'Paste ElevenLabs API key (xi-api-key)',
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-label': 'ElevenLabs API Key for British English voice tutor and read-aloud',
    value: vkInit.elevenLabsApiKey,
  });
  let showElevenKey = false;
  const elevenShowBtn = el('button', {
    type: 'button', class: 'vk-eye', 'aria-label': 'Show or hide ElevenLabs API key',
    onclick: () => {
      showElevenKey = !showElevenKey;
      elevenInput.type = showElevenKey ? 'text' : 'password';
      elevenShowBtn.textContent = showElevenKey ? 'Hide' : 'Show';
    },
  }, 'Show');

  const keySaveNotice = el('p', { class: 'vk-notice', id: 'settings-voice-keys-notice', role: 'status', 'aria-live': 'polite' });

  function commitKeyInputs(feedbackMsg) {
    const gKey = geminiInput.value.trim();
    const eKey = elevenInput.value.trim();
    const patch = { geminiApiKey: gKey, elevenLabsApiKey: eKey };
    if (gKey && eKey && state.voiceMode === 'local_isabella') patch.voiceMode = 'hybrid_duplex_elevenlabs';
    else if (gKey && !eKey && state.voiceMode === 'local_isabella') patch.voiceMode = 'gemini_live_duplex';
    else if (!gKey && eKey && (state.voiceMode === 'gemini_live_duplex' || state.voiceMode === 'local_isabella')) patch.voiceMode = 'elevenlabs_british';
    voiceKeys.set(patch);
    save(patch);
    keySaveNotice.textContent = feedbackMsg || (
      gKey && eKey
        ? 'Saved Gemini Live Full-Duplex & ElevenLabs British voice keys across your Kym textbooks.'
        : gKey
          ? 'Saved Gemini Live Full-Duplex key. Your 1-on-1 Coach is ready for live voice calls.'
          : eKey
            ? 'Saved ElevenLabs British voice key. Coach & Read-Aloud will speak in British English (en-GB).'
            : 'Cleared saved API keys. Coach will use Isabella & the built-in grounded tutor.'
    );
  }

  geminiInput.addEventListener('change', () => commitKeyInputs());
  elevenInput.addEventListener('change', () => commitKeyInputs());
  geminiInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commitKeyInputs(); } });
  elevenInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commitKeyInputs(); } });

  const saveKeysBtn = el('button', {
    type: 'button', class: 'seg-b vk-btn vk-btn-primary', id: 'settings-save-keys-btn',
    onclick: () => commitKeyInputs(),
  }, 'Save API Keys');

  const openCoachBtn = el('button', {
    type: 'button', class: 'seg-b vk-btn', id: 'settings-open-coach-btn',
    onclick: () => {
      commitKeyInputs();
      toggle(false);
      if (App.coach && typeof App.coach.open === 'function') App.coach.open();
      else App.emit('coach:open');
    },
  }, 'Open 1-on-1 Coach');

  const voiceCoachSection = el('div', { class: 'vk-sec', id: 'settings-voice-coach-keys' },
    el('p', { class: 'pop-h' }, '1-on-1 Voice Coach & API Keys (en-GB)'),
    el('p', { class: 'vk-sub' }, 'Configure Gemini Live Full-Duplex and ElevenLabs British English (en-GB) so the Coach becomes a real-time 1-on-1 voice tutor.'),
    el('p', { class: 'vk-label' }, 'Tutor voice engine'),
    el('div', { class: 'seg seg-2x2', role: 'group', 'aria-label': 'Voice Coach engine mode' }, voiceModeBtns),
    el('p', { class: 'vk-label' }, 'British English voice (en-GB)'),
    el('div', { class: 'seg', role: 'group', 'aria-label': 'British English tutor voice preset' }, voicePresetBtns),
    el('div', { class: 'vk-field' },
      el('div', { class: 'vk-field-head' },
        el('label', { class: 'vk-label', for: 'settings-gemini-key' }, 'Gemini Live Voice API Key (Full-Duplex)'),
        geminiStatusBadge,
      ),
      el('div', { class: 'vk-input-row' }, geminiInput, geminiShowBtn),
      geminiModelSelect,
    ),
    el('div', { class: 'vk-field' },
      el('div', { class: 'vk-field-head' },
        el('label', { class: 'vk-label', for: 'settings-elevenlabs-key' }, 'ElevenLabs API Key (British en-GB Voice)'),
        elevenStatusBadge,
      ),
      el('div', { class: 'vk-input-row' }, elevenInput, elevenShowBtn),
    ),
    el('div', { class: 'vk-actions' }, saveKeysBtn, openCoachBtn),
    keySaveNotice,
    el('p', { class: 'pop-note vk-privacy' }, 'Keys stay in this browser’s local storage (shared across your Kym textbooks) and connect directly to Gemini Live or ElevenLabs.'),
  );

  const panel = el('div', { class: 'iw-pop settings-pop', id: 'settings-pop', role: 'dialog', 'aria-label': 'Reading settings' },
    el('p', { class: 'pop-h' }, 'Reading profiles'),
    el('div', { class: 'seg', role: 'group', 'aria-label': 'Reading profiles' }, profileBtns),
    el('p', { class: 'pop-h' }, 'Typeface'),
    el('div', { class: 'seg', role: 'group', 'aria-label': 'Typeface' }, faceBtns),
    el('p', { class: 'pop-h' }, 'Text size'),
    el('div', { class: 'seg', role: 'group', 'aria-label': 'Text size' }, sizeBtns),
    el('p', { class: 'pop-h' }, 'Line spacing'),
    el('div', { class: 'seg', role: 'group', 'aria-label': 'Line spacing' }, spacingBtns),
    el('p', { class: 'pop-h' }, 'Line length'),
    el('div', { class: 'seg', role: 'group', 'aria-label': 'Line length' }, widthBtns),
    el('p', { class: 'pop-h' }, 'Colours'),
    el('div', { class: 'seg seg-th', role: 'group', 'aria-label': 'Colour theme' }, themeBtns),
    el('p', { class: 'pop-h' }, 'Motion, sound & display'),
    el('div', { class: 'seg seg-stack', role: 'group', 'aria-label': 'Motion, sound and display' }, stillToggle, soundToggle, projToggle),
    voiceCoachSection,
    App.store.available ? null : el('p', { class: 'pop-note' }, 'This browser is not saving settings, so they will reset next time.'),
  );
  if (supportsPopover) panel.setAttribute('popover', 'auto');
  document.body.append(panel);

  const stillBtn = App.tool({
    id: 'still',
    label: 'Still',
    icon: ICON_STILL,
    order: 85,
    title: 'Still mode: freeze all ambient motion and transitions',
    onClick: () => save({ still: !state.still }),
  });

  function sync() {
    const vk = voiceKeys.get();
    profileBtns.forEach((b, i) => {
      const p = PROFILES[i][2];
      const match = state.face === p.face && state.size === p.size && state.spacing === p.spacing && state.width === p.width && state.theme === p.theme;
      b.setAttribute('aria-pressed', String(match));
    });
    faceBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(FACES[i][0] === state.face)));
    sizeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === state.size)));
    spacingBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(SPACINGS[i][0] === state.spacing)));
    widthBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(WIDTHS[i][0] === state.width)));
    themeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(THEMES[i][0] === state.theme)));
    stillToggle.setAttribute('aria-pressed', String(!!state.still));
    soundToggle.setAttribute('aria-pressed', String(!!state.sound));
    projToggle.setAttribute('aria-pressed', String(!!state.projector));
    voiceModeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(VOICE_COACH_MODES[i][0] === vk.voiceMode)));
    voicePresetBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(BRITISH_VOICE_PRESETS[i].id === vk.voicePreset)));
    if (document.activeElement !== geminiInput) geminiInput.value = vk.geminiApiKey;
    if (document.activeElement !== elevenInput) elevenInput.value = vk.elevenLabsApiKey;
    geminiModelSelect.value = vk.geminiLiveModel;
    geminiStatusBadge.textContent = vk.hasGemini ? 'Saved · Full-Duplex Ready' : 'Not set';
    geminiStatusBadge.classList.toggle('vk-ok', vk.hasGemini);
    elevenStatusBadge.textContent = vk.hasElevenLabs ? 'Saved · en-GB Ready' : 'Not set';
    elevenStatusBadge.classList.toggle('vk-ok', vk.hasElevenLabs);
    if (stillBtn) {
      stillBtn.setAttribute('aria-pressed', String(!!state.still));
      stillBtn.title = state.still ? 'Still mode is on (tap to allow motion)' : 'Still mode: freeze all ambient motion and transitions';
    }
  }
  function save(patch) {
    const prevStill = state.still;
    const s = Object.assign(App.store.get('settings', {}), patch);
    App.store.set('settings', s);
    state = apply();
    sync();
    App.emit('settings:change', state);
    if (prevStill !== state.still) {
      App.emit('still:change', state.still);
      try { window.dispatchEvent(new CustomEvent('still:change', { detail: { still: state.still } })); } catch (e) {}
    }
  }
  window.__applyKymBioSettings = save;
  App.on('voicekeys:change', () => { state = apply(); sync(); });
  sync();

  let open = false;
  function toggle(force) {
    const want = force == null ? !isOpen() : force;
    if (supportsPopover) { try { want ? panel.showPopover() : panel.hidePopover(); } catch (e) {} }
    else { panel.classList.toggle('open', want); open = want; }
    btn.setAttribute('aria-expanded', String(want));
    if (want) (panel.querySelector('[aria-pressed="true"]') || sizeBtns[1]).focus();
  }
  function isOpen() { return supportsPopover ? panel.matches(':popover-open') : open; }
  App.openVoiceKeySettings = () => {
    toggle(true);
    setTimeout(() => {
      voiceCoachSection.scrollIntoView({ behavior: App.reduceMotion() ? 'auto' : 'smooth', block: 'nearest' });
      (geminiInput.value ? elevenInput : geminiInput).focus();
    }, 60);
  };
  if (supportsPopover) panel.addEventListener('toggle', e => {
    btn.setAttribute('aria-expanded', String(e.newState === 'open'));
    if (e.newState === 'open') {
      sync();
      (panel.querySelector('[aria-pressed="true"]') || sizeBtns[1]).focus();
    }
  });
  else {
    document.addEventListener('click', e => { if (open && !panel.contains(e.target) && !btn.contains(e.target)) toggle(false); });
    document.addEventListener('keydown', e => { if (open && e.key === 'Escape') { toggle(false); btn.focus(); } });
  }

  const btn = App.tool({ id: 'settings', label: 'Text & Keys', icon: ICON, order: 90, title: 'Reading settings, ElevenLabs & Gemini Live Voice API keys',
    onClick: e => { if (!supportsPopover) { e.stopPropagation(); toggle(); } } });
  if (btn && supportsPopover) btn.popoverTargetElement = panel;
  if (btn) { btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'settings-pop'); }

  // follow the OS theme live when on Auto
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mq && mq.addEventListener) mq.addEventListener('change', () => { state = apply(); });
});
