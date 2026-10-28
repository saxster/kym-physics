// Engine self-test widget (used only by tests/fixture): a mass on a spring, drawn with api.loop, a slider for the
// stiffness, a readout of the period, and a button that plays a note through api.audio().
// The motion is honest simple harmonic motion: x = A cos(ωt), ω = √(k/m).
import { Live } from './core.js';

Live.register('selftest', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 240, 'A mass bouncing on a spring');
  const m = params.m || 0.2;          // kg
  let K = 8;                          // N/m
  let phase = 0;
  const say = api.readout();
  const report = () => {
    const T = 2 * Math.PI * Math.sqrt(m / K);
    say(`Stiffness ${K} N/m, mass ${m} kg: one bounce takes ${T.toFixed(2)} s. A stiffer spring bounces faster.`);
  };
  api.slider('Stiffness', { min: 2, max: 40, step: 1, value: K, fmt: (v) => `${v} N/m`, onInput: (v) => { K = v; report(); } });
  api.button('Play a note', () => api.audio().tone(220 * Math.sqrt(K / 8), { dur: 0.6, gain: 0.25 }));
  report();
  api.loop((dt) => {
    phase += dt * Math.sqrt(K / m);
    const x = Math.cos(phase);                 // −1..1
    const top = 30, y = 130 + x * 50;          // the mass, in canvas units
    k.clear(c.plate);
    const ctx = k.ctx;
    ctx.strokeStyle = c.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(240, top - 10); ctx.lineTo(400, top - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(320, top - 10);
    const coils = 10;
    for (let i = 1; i < 2 * coils; i++) ctx.lineTo(320 + (i % 2 ? 14 : -14), top + (y - 20 - top) * i / (2 * coils));
    ctx.lineTo(320, y - 20); ctx.stroke();
    api.draw.roundRect(ctx, 290, y - 20, 60, 40, 4); ctx.fillStyle = c.sheet; ctx.fill(); ctx.stroke();
    api.draw.text(ctx, `${m} kg`, 320, y + 5, { size: 13, color: c.ink, align: 'center', weight: 600 });
    api.draw.arrow(ctx, 380, 130, 380, 130 - x * 40, c.proton, 2.4, 9);
    api.draw.text(ctx, 'pull of the spring', 392, 134, { size: 13, color: c.proton });
  });
  return { destroy() {} };
}, { label: 'Watch it bounce' });
