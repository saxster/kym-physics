// Chapter 1 spread, on the shared book engine.
import { startBook } from '../../spread/book.js';
import { liveChart } from '../../spread/chart.js';
import { buildWorld, WALK_RUN, WALK_GAP } from './world.js';
import { PAGES, PLATES, CHARTS } from './pages.mjs';
import { PRACTICE } from './practice.mjs';
import * as M from './model.mjs';

const f = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
const sgn = v => v > 1e-9 ? '+' : v < -1e-9 ? '−' : ' ';

function walkState(clock) {
  const cyc = M.T + WALK_GAP, c = (clock * M.SLOW) % (WALK_RUN * cyc), k = Math.floor(c / cyc), c0 = k * cyc;
  return { c, c0, t: Math.min(c - c0, M.T), tossing: c - c0 <= M.T };
}

startBook({
  no: 1, PAGES, PLATES, PRACTICE: Object.fromEntries(Object.entries(PRACTICE).map(([k, qs]) => [k, qs.map(({ verify, info, ...q }) => q)])),
  back: '../index.html#ch1', narrowZoom: 0.9, clock0: (M.T_TOP * 0.6) / M.SLOW,
  lookKeys: ['disp', 'vel', 'acc', 'strobe', 'frames'],
  buildWorld(E) {
    const W = buildWorld(E);
    const labels = [
      { cls: 'vec blue', html: 'v', at: W.anchors.v },
      { cls: 'vec red', html: 'a', at: W.anchors.a },
      ...[[0, '0'], [0.5, '50 cm'], [1, '1 m']].map(([q, h]) => ({ cls: 'tick', html: h, at: () => W.anchors.staff(q) })),
      ...[1, 2, 3, 4].map(n => ({ cls: 'mark', html: `${n * n}`, at: () => W.anchors.mark(n) })),
    ];
    return { update: W.update, labels };
  },
  state: (clock, reduced) => reduced
    ? { toss: { t: M.T_TOP * 0.55, resting: false }, walk: { c: 0.62, c0: 0, t: 0.62, tossing: true }, ramp: { t: 3 } }
    : { toss: M.flight(clock), walk: walkState(clock), ramp: M.rampRun(clock) },
  forceLook(selected, look) {
    if (selected === 'staff') look.disp = 1;
    if (selected === 'vArrow') look.vel = 1;
    if (selected === 'aArrow') look.acc = 1;
    if (selected === 'strobe') look.strobe = 1;
  },
  readout(s, page) {
    if (page.scene === 'walk') return `friend ${f(M.walkX(s.walk.c))} m along\nball ${f(s.walk.tossing ? M.y(s.walk.t) : 0)} m up`;
    if (page.scene === 'ramp') return `beat ${f(s.ramp.t, 1)}   ${f(M.rampS(s.ramp.t) * 100, 1)} cm\nspeed ${f(M.rampV(s.ramp.t) * 100, 0)} cm/s`;
    const { t, resting } = s.toss, v = resting ? 0 : M.vy(t);
    return `t ${f(t)} s   height ${f(resting ? 0 : M.y(t))} m\nv ${sgn(v)}${f(Math.abs(v))} m/s   a ${resting ? '0.0' : '−' + f(M.G, 1)} m/s²`;
  },
  onFrame(s, sheets) {
    const { t, resting } = s.toss, v = M.vy(t);
    const say = (id, text) => sheets.forEach(el => { const p = el.querySelector('#' + id); if (p && p.textContent !== text) p.textContent = text; });
    say('live-sign', resting ? 'Now: back in your hand.' : Math.abs(v) < 0.08 ? 'Now: at the top. v = 0, but a is still 9.8 m/s² down.'
      : v > 0 ? `Now: v is ${f(v)} m/s up, a is down. Opposite ways, so it is slowing.` : `Now: v is ${f(-v)} m/s down, a is down. Same way, so it is speeding up.`);
    say('live-top', resting ? '' : `Now: velocity ${Math.abs(v) < 0.005 ? '0.00 m/s' : `${f(Math.abs(v))} m/s ${v > 0 ? 'up' : 'down'}`}, acceleration 9.8 m/s² down.`);
    const tt = resting ? M.T : t;
    liveChart(sheets, 'y', CHARTS.y, { fn: M.y, slope: M.vy, t: tt });
    liveChart(sheets, 'v', CHARTS.v, { fn: M.vy, t: tt });
  },
});
