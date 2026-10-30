// The spread, page by page: text on the left; for the figure on the right, the camera, the one lit thing and
// what is shown. Every number comes from model.mjs. Written for Kym: plain words first, then the term.
import * as M from './model.mjs';
import { chart, samples } from '../../spread/chart.js';

const f = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
const cm = x => (x * 100).toFixed(0);
const sgn = v => v > 1e-9 ? '+' : v < -1e-9 ? '−' : '';
const T = f(M.T), TOP = f(M.T_TOP), V0 = f(M.VY0, 1);
const term = s => `<b class="term">${s}</b>`;

export const CHARTS = {
  y: { x0: 0, x1: 0.9, y0: 0, y1: 1.2 },
  v: { x0: 0, x1: 0.9, y0: -5, y1: 5 },
};
const STORY = (id, text) => `<p class="story-link">In the story: <a href="../index.html#${id}">${text}</a></p>`;

export const PAGES = [
  {
    kicker: 'Chapter 1 · Describing motion', title: 'One toss', sub: 'a ball, a hand, and nothing else',
    body: `
      <p class="lede">Everything on these pages comes from one small ball, tossed a metre straight up.</p>
      <p>It leaves your hand at ${V0} m/s, reaches the top after ${TOP} s and drops back into your hand ${T} s after it left. The figure runs at ${M.SLOW} × real speed, so you can follow it.</p>
      <p>Scroll to turn the page, or press Play. Point at anything in the figure and time stops, so you can read it. Click it, or use the buttons below, to take it apart.</p>`,
    cam: { target: [-0.1, 0.5, 0], az: 24, el: 8, dist: 3.7 }, lit: 'ball', look: { strobe: 1, vel: 1, acc: 1 },
    fig: 'A ball tossed straight up', alt: 'A ball rises from a hand beside a measuring axis and falls back.',
    parts: ['ball', 'hand', 'strobe'],
  },
  {
    kicker: '1.1 · Where and when', title: 'Position', sub: 'where, measured from where',
    body: `
      <p class="lede">To say how something moves, first you have to say where it is, and that needs a starting point.</p>
      <p>Here the starting point is your hand, and up counts as positive. The ball’s ${term('position')} is its height above your hand, read off the axis. The black arrow beside the axis is its ${term('displacement')}: the straight line from where it started to where it is now, with a direction.</p>
      <table class="data">
        <tr><th></th><th>displacement</th><th>distance</th></tr>
        <tr><td>hand → top</td><td>+${f(M.H)} m</td><td>${f(M.H)} m</td></tr>
        <tr><td>hand → hand</td><td>${f(M.y(M.T))} m</td><td>${f(2 * M.H)} m</td></tr>
      </table>
      <p>Distance counts every metre of the path. Displacement only cares where the ball ended up.</p>
      ${STORY('s1-1', 'Section 1.1, Where and when')}`,
    cam: { target: [-0.16, 0.52, 0], az: -14, el: 5, dist: 3.5 }, lit: 'staff', look: { disp: 1 },
    fig: 'The position axis', alt: 'A vertical axis marked every 10 cm, with an arrow from zero up to the ball.',
    parts: ['staff', 'ball', 'hand'],
  },
  {
    kicker: '1.1 · Where and when', title: 'Who is watching?', sub: 'the same toss, seen from two places',
    body: `
      <p class="lede">Your friend walks along the corridor at a steady ${f(M.WALK, 1)} m/s, tossing the same ball.</p>
      <p>To her it goes straight up and down beside her hand: the dashed blue line that walks with her. From where you stand, the ball also travels along the corridor with her, ${f(M.STRIDE)} m during each toss, so its strobe images trace an arch.</p>
      <p>Both descriptions are right. Each belongs to its ${term('reference frame')}, the place you measure from. The ball lands back in her hand because it was moving forward with her the whole time.</p>
      ${STORY('s1-1', 'the walker in the corridor')}`,
    cam: { target: [M.ST.walk + 1.55, 0.2, 0], az: -10, el: 12, dist: 10 }, lit: 'arc', look: { frames: 1 }, scene: 'walk',
    fig: 'One toss, two frames', alt: 'A friend walks along a corridor tossing a ball; the ball’s images trace arches.',
    parts: ['walker', 'arc', 'corridor'],
  },
  {
    kicker: '1.2 · How fast, and which way', title: 'Velocity', sub: 'speed, with a direction',
    body: `
      <p class="lede">The blue arrow is the ball’s ${term('velocity')}. Its length is the speed, and it points the way the ball is going.</p>
      <p>It starts at ${V0} m/s upwards, shrinks to nothing at the top, then grows pointing down until the ball is moving at ${V0} m/s downwards as it reaches your hand. The same speed at the start and the end; opposite velocities.</p>
      <table class="data">
        <tr><td>average speed</td><td>${f(2 * M.H)} m ÷ ${T} s = ${f(2 * M.H / M.T, 1)} m/s</td></tr>
        <tr><td>average velocity</td><td>${f(M.y(M.T))} m ÷ ${T} s = 0 m/s</td></tr>
      </table>
      ${STORY('s1-2', 'Section 1.2, How fast, and which way')}`,
    cam: { target: [-0.02, 0.5, 0], az: 22, el: 6, dist: 3.5 }, lit: 'vArrow', look: { vel: 1 },
    fig: 'Velocity', alt: 'An arrow on the ball that shrinks as it rises and grows pointing down as it falls.',
    parts: ['vArrow', 'ball'],
  },
  {
    kicker: '1.2 · How fast, and which way', title: 'Graphs of the toss', sub: 'time along the bottom',
    body: `
      <p class="lede">The red line touches the height curve at this instant. Its slope, rise ÷ run, is the velocity.</p>
      <div class="charts">
        ${chart('y', CHARTS.y, { xlabel: 'time (s)', ylabel: 'height (m) · slope = velocity', label: 'Height against time, with its slope at this instant', live: ['tangent', 'cursor'], series: [{ pts: samples(90, 0, M.T, M.y) }] })}
        ${chart('v', CHARTS.v, { xlabel: 'time (s)', ylabel: 'velocity (m/s)', label: 'Velocity against time: one straight line through zero', live: ['cursor'], series: [{ pts: samples(2, 0, M.T, M.vy) }], marks: [[M.T_TOP, 0, `top, ${TOP} s`, 6, -8]] })}
      </div>
      <p>Steep at the start, flat at the top, steep the other way at the end. The velocity graph is one straight line: it crosses zero at the top and keeps going without a pause.</p>
      <p>The height curve looks like an arch, but the ball went straight up and down. The bottom axis is time, not a direction.</p>`,
    cam: { target: [-0.12, 0.5, 0], az: 0, el: 4, dist: 3.6 }, lit: 'ball', look: { disp: 1, vel: 1 },
    fig: 'Height and velocity against time', alt: 'The toss beside its position axis; the graphs are on the left page.',
    parts: ['ball', 'staff', 'vArrow'],
  },
  {
    kicker: '1.3 · Speeding up, slowing down', title: 'Acceleration', sub: 'how fast the velocity changes',
    body: `
      <p class="lede">The red arrow is the ball’s ${term('acceleration')}: ${f(M.G, 1)} m/s² downwards, the whole flight. It never changes length.</p>
      <p>Going up, the blue and red arrows point opposite ways, so the ball slows down. Coming down they point the same way, so it speeds up. Both are acceleration.</p>
      <p>The faint balls are a strobe, one image every tenth of a second. Each gap is ${f(M.G * M.STROBE ** 2 * 100, 1)} cm shorter than the one before, straight through the top.</p>
      <p class="live" id="live-sign"></p>
      ${STORY('s1-3', 'Section 1.3, Speeding up, slowing down and turning')}`,
    cam: { target: [-0.06, 0.5, 0], az: -8, el: 5, dist: 3.4 }, lit: 'aArrow', look: { vel: 1, acc: 1, strobe: 1 },
    fig: 'Strobe, every 0.1 s', alt: 'Faint images of the ball every tenth of a second, closer together near the top.',
    parts: ['aArrow', 'vArrow', 'strobe'],
  },
  {
    kicker: '1.4 · Galileo’s ramps', title: 'Squares and odd numbers', sub: 'gravity, slowed down',
    body: `
      <p class="lede">Galileo slowed falling down with a gentle ramp, so that he could time it.</p>
      <p>This ball rolls ${cm(M.rampS(1))} cm in the first beat. After 2, 3 and 4 beats it is ${M.rampMarks().slice(2).map(cm).join(', ')} cm from the start: 1, 4, 9 and 16 units, the squares.</p>
      <p>The gaps between the marks are ${M.rampGaps().map(cm).join(', ')} cm: the odd numbers. The ball’s speed grows by the same ${cm(M.RAMP.a)} cm/s every beat, and that steady growth is what makes the squares.</p>
      <div class="eq">distance from rest = ½ × acceleration × time²</div>
      <p class="hintline">The ramp is drawn steeper than Galileo’s; a real one is nearly flat.</p>
      ${STORY('s1-4', 'Section 1.4, Galileo’s ramps')}`,
    cam: { target: [M.ST.ramp - 0.05, -0.12, 0], az: -6, el: 16, dist: 6 }, lit: 'marks', look: {}, scene: 'ramp',
    fig: 'Marks at every beat', alt: 'A ball rolls down a ramp past marks at 10, 40, 90 and 160 cm.',
    parts: ['rBall', 'marks', 'ramp'],
  },
  {
    kicker: '1.5 · The top of a throw', title: 'Stopped, but still changing', sub: 'the puzzle the chapter began with',
    body: `
      <p class="lede">At the top the velocity is zero for one instant. The acceleration is not.</p>
      <p>The red arrow is exactly as long at the top as everywhere else. Look at the two strobe images nearest the top, at 0.4 s and 0.5 s: they are only ${f((M.y(0.5) - M.y(0.4)) * 100, 1)} cm apart. That is as close as the ball comes to stopping.</p>
      <p>Its velocity goes from a little upwards to a little downwards without pausing at zero. Zero velocity is not zero acceleration.</p>
      <p class="live" id="live-top"></p>
      ${STORY('s1-5', 'Section 1.5, The top of a throw')}`,
    cam: { target: [0, 0.92, 0], az: 16, el: 6, dist: 2.2 }, lit: 'aArrow', look: { vel: 1, acc: 1, strobe: 1 },
    fig: 'At the top', alt: 'The ball at the top of its flight with its acceleration arrow still pointing down.',
    parts: ['aArrow', 'vArrow', 'strobe', 'ball'],
  },
];

// ---------- click a part: what it breaks into ----------
const vtxt = v => Math.abs(v) < 0.005 ? '0.00 m/s' : `${f(Math.abs(v))} m/s ${v > 0 ? 'up' : 'down'}`;
export const PLATES = {
  ball: { text: `A ball in free fall. Once it leaves your hand nothing pushes it up. It rises only because it is still moving up, and gravity takes ${f(M.G, 1)} m/s off that upward velocity every second.`,
    facts: s => { const { t, resting } = s.toss; return resting ? [['where', 'back in your hand']] : [['time', `${f(t)} s`], ['height', `${f(M.y(t))} m`], ['velocity', vtxt(M.vy(t))], ['acceleration', `${f(M.G, 1)} m/s² down`]]; } },
  hand: { text: 'Every position on these pages is measured from here. Choosing the starting point and which way counts as positive is the first step in describing any motion.',
    facts: () => [['position', '0 m'], ['positive direction', 'up']] },
  staff: { text: `The upright line is the position axis, marked every 10 cm. The black arrow is the displacement from your hand. It shrinks back to nothing when the ball is caught, though the ball has travelled ${f(2 * M.H)} m.`,
    facts: s => { const { t, resting } = s.toss, yy = resting ? 0 : M.y(t); return [['position', `${sgn(yy)}${f(Math.abs(yy))} m`], ['distance so far', `${f(resting ? 2 * M.H : M.distance(t))} m`]]; } },
  vArrow: { text: 'The arrow’s length is the speed and its direction is the way the ball is moving. It is drawn to scale: twice as fast is twice as long.',
    facts: s => { const { t, resting } = s.toss, v = resting ? 0 : M.vy(t); return [['velocity', vtxt(v)], ['speed', `${f(Math.abs(v))} m/s`]]; } },
  aArrow: { text: 'The acceleration is the same at every instant, so this arrow never changes. Whether the ball speeds up or slows down depends on whether the velocity arrow points the same way or the opposite way.',
    facts: s => { const { t, resting } = s.toss, v = resting ? 0 : M.vy(t); return resting ? [['acceleration', '0: the hand holds it']] : [['acceleration', `${f(M.G, 1)} m/s² down`], ['velocity', vtxt(v)], ['so the ball is', Math.abs(v) < 0.05 ? 'at the top' : v > 0 ? 'slowing down' : 'speeding up']]; } },
  strobe: { text: `One image every ${M.STROBE} s, like a camera with a flashing light. Going up the gaps shrink; coming down they grow. Each gap differs from the last by ${f(M.G * M.STROBE ** 2 * 100, 1)} cm, the acceleration made visible.`,
    facts: () => M.gaps().slice(0, 5).map((g, i) => [`gap ${i + 1}`, `${f(g * 100, 1)} cm`]) },
  walker: { text: `In her frame the ball goes straight up and down beside her hand, along the dashed blue line. She cannot tell, from the ball alone, that she is walking.`,
    facts: s => [['her speed', `${f(M.WALK, 1)} m/s`], ['ball height', `${f(s.walk.tossing ? M.y(s.walk.t) : 0)} m`], ['ball, sideways, in her frame', '0 m/s']] },
  arc: { text: `From the platform, the ball moves along the corridor with your friend while it rises and falls. Put together, the two motions make an arch.`,
    facts: () => [['along the corridor per toss', `${f(M.STRIDE)} m`], ['height', `${f(M.H)} m`], ['time', `${T} s`]] },
  corridor: { text: 'The corridor is your frame. You measure the ball’s position along it from where your friend first tossed it.',
    facts: s => [['your friend, from the start', `${f(M.walkX(s.walk.c))} m`]] },
  rBall: { text: `It starts from rest and gains ${cm(M.RAMP.a)} cm/s of speed in every beat. The distance from the start grows as the square of the time.`,
    facts: s => { const t = s.ramp.t; return [['beat', `${f(t, 1)}`], ['from the start', `${f(M.rampS(t) * 100, 1)} cm`], ['speed', `${f(M.rampV(t) * 100, 0)} cm/s`]]; } },
  marks: { text: 'Each mark is where the ball is at a beat. From the start: 1, 4, 9, 16 units. Between marks: 1, 3, 5, 7 units, the odd numbers in order.',
    facts: () => M.rampMarks().slice(1).map((s, i) => [`beat ${i + 1}`, `${cm(s)} cm, gap ${cm(M.rampGaps()[i])} cm`]) },
  ramp: { text: 'A gentle slope lets gravity act along it only a little, so the same kind of motion as falling happens slowly enough to time with a beat or a water clock.',
    facts: () => [['drawn at', `${M.RAMP.angle}°`], ['acceleration along it', `${cm(M.RAMP.a)} cm/s²`]] },
};
