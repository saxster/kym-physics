// Engine self-test widget (used only by tests/fixture): exercises api.gl (a two-source ripple shader with a canvas-2D
// fallback), api.mic, api.motion and api.video, so a test can drive each one. Not book content.
import { Live } from './core.js';

const RIPPLES = `
uniform float u_sep;
void main() {
  vec2 p = gl_FragCoord.xy / u_res.y;
  vec2 a = vec2(0.5 * u_res.x / u_res.y - u_sep, 0.5), b = vec2(0.5 * u_res.x / u_res.y + u_sep, 0.5);
  float h = sin(60.0 * distance(p, a) - 4.0 * u_time) + sin(60.0 * distance(p, b) - 4.0 * u_time);
  gl_FragColor = vec4(vec3(0.55 + 0.2 * h), 1.0);
}`;

Live.register('selftestapi', (stage, params, api) => {
  const say = api.readout();
  const g = api.gl(RIPPLES, { u_sep: 0.12 }, {
    width: 640, height: 260, label: 'Ripples from two sources overlapping',
    fallback: (ctx, W, H) => { ctx.fillStyle = api.colors().plate; ctx.fillRect(0, 0, W, H); },
  });
  api.slider('Gap between sources', { min: 0.04, max: 0.3, step: 0.01, value: 0.12, fmt: (v) => v.toFixed(2), onInput: (v) => g.set('u_sep', v) });
  const mic = api.mic({ onStart: () => say('Microphone on.') });
  const motion = api.motion();
  motion.onSample((s) => say(`Acceleration ${s.g.toFixed(1)} m/s²`));
  const vid = api.video({ fps: 30 });
  vid.onMark((m, all) => say(`${all.length} marks`));
  api.loop(() => { if (mic.active) say(`Microphone level ${mic.rms().toFixed(3)}`); });
  window.__selftestapi = { gl: g, mic, motion, video: vid };
  say(g.ok ? 'WebGL shader running.' : 'WebGL unavailable: fallback drawing.');
  return { destroy() { delete window.__selftestapi; } };
}, { label: 'Test the sensors' });
