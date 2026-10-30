// Procedural Web Audio foley sound engine (zero external audio files).
// Synthesises subtle tactile paper and pen sounds on user interaction:
//   - 'tick'  : crisp graphite pen tick when choosing a prediction option or filter chip
//   - 'flap'  : soft stitched-paper flap / page lift when revealing an answer or lifting a live figure
//   - 'stamp' : rubber-stamp thud + crisp ink press when completing a widget challenge
//   - 'lens'  : gentle glass tap when inspecting an equation symbol or unit card
// Paper sounds are opt-in and mute automatically in Still Mode or reduced motion.
import App from './core.js';

const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
let ctx = null;
let master = null;
let noiseBuf = null;

function isEnabled() {
  if (!AC || App.reduceMotion()) return false;
  if (document.documentElement.classList.contains('still') || document.body?.classList.contains('still')) return false;
  const s = App.store.get('settings', {});
  return s.sound === true;
}

function ensureCtx() {
  if (!isEnabled()) return null;
  if (!ctx) {
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.18;
      master.connect(ctx.destination);
    } catch (e) {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  if (!noiseBuf && ctx) {
    const len = Math.floor(ctx.sampleRate * 0.35);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      // Pink-ish warm paper noise
      last = 0.82 * last + 0.18 * white;
      data[i] = last * 1.8;
    }
  }
  return ctx;
}

function play(kind) {
  const c = ensureCtx();
  if (!c || !master) return;
  const t0 = c.currentTime;
  try {
    if (kind === 'tick') {
      // Short graphite pen scratch: high-passed noise burst + tiny woody click
      const src = c.createBufferSource();
      src.buffer = noiseBuf;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2400, t0);
      bp.Q.value = 2.8;
      const g = c.createGain();
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.28, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.038);
      src.connect(bp);
      bp.connect(g);
      g.connect(master);
      src.start(t0);
      src.stop(t0 + 0.042);
    } else if (kind === 'flap') {
      // Soft physical paper flap / page lift: swept bandpass noise rustle
      const src = c.createBufferSource();
      src.buffer = noiseBuf;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(620, t0);
      bp.frequency.exponentialRampToValueAtTime(1480, t0 + 0.09);
      bp.frequency.exponentialRampToValueAtTime(780, t0 + 0.16);
      bp.Q.value = 1.6;
      const g = c.createGain();
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.32, t0 + 0.028);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.165);
      src.connect(bp);
      bp.connect(g);
      g.connect(master);
      src.start(t0);
      src.stop(t0 + 0.175);
    } else if (kind === 'stamp') {
      // Rubber stamp thud (low membrane pitch drop) + crisp ink-on-paper contact
      const osc = c.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(135, t0);
      osc.frequency.exponentialRampToValueAtTime(46, t0 + 0.11);
      const og = c.createGain();
      og.gain.setValueAtTime(0.001, t0);
      og.gain.linearRampToValueAtTime(0.55, t0 + 0.008);
      og.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
      osc.connect(og);
      og.connect(master);
      osc.start(t0);
      osc.stop(t0 + 0.15);

      const src = c.createBufferSource();
      src.buffer = noiseBuf;
      const lp = c.createBiquadFilter();
      lp.type = 'bandpass';
      lp.frequency.setValueAtTime(1100, t0 + 0.01);
      lp.Q.value = 1.4;
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.001, t0);
      ng.gain.linearRampToValueAtTime(0.26, t0 + 0.012);
      ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.085);
      src.connect(lp);
      lp.connect(ng);
      ng.connect(master);
      src.start(t0);
      src.stop(t0 + 0.095);
    } else if (kind === 'lens') {
      // Gentle frosted-glass tap
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, t0);
      osc.frequency.exponentialRampToValueAtTime(920, t0 + 0.035);
      const g = c.createGain();
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.16, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.055);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + 0.06);
    }
  } catch (e) {
    // Ignore audio context edge cases
  }
}

const sound = { play, get enabled() { return isEnabled(); } };
App.sound = sound;
if (typeof window !== 'undefined') window.__bookSound = sound;
export default sound;
