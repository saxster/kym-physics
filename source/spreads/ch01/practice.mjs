// One or two questions per page (keys are page indices, as in PAGES). Kym picks an answer first; the reason
// shows only after. Numbers come from model.mjs; verify() recomputes each answer another way for the test.
import * as M from './model.mjs';

const cm = x => (x * 100).toFixed(0);
const f = (x, n = 1) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(n);

// 1 · a two-metre toss: distance and displacement
const H1 = 2.0;
// 3 · average speed over the whole flight
const AVG = 2 * M.H / M.T;
// 5 · the velocity 0.2 s after the top
const V5 = M.vy(M.T_TOP + 0.2);
// 6 · five beats down the ramp
const S6 = M.rampS(5), G6 = M.rampS(5) - M.rampS(4);

export const PRACTICE = {
  1: [
    { id: 'distance-displacement', q: `You toss a ball ${f(H1)} m straight up and catch it at the same height. What distance did the ball travel, and what was its displacement?`,
      choices: [`${f(2 * H1)} m and ${f(2 * H1)} m`, `${f(2 * H1)} m and 0 m`, `${f(H1)} m and 0 m`, `0 m and ${f(2 * H1)} m`], answer: 1,
      why: `<p>Distance is the whole path: ${f(H1)} m up and ${f(H1)} m down, ${f(2 * H1)} m. Displacement is where it ended compared with where it started. It came back to your hand, so the displacement is zero.</p>`,
      verify: () => Math.abs(2 * H1 - 4) < 1e-12 },
  ],
  2: [
    { id: 'frames-path', q: 'Your friend walks past you at a steady pace, tossing a ball straight up and catching it. Which of these is true?',
      choices: ['You both see it go straight up and down', 'She sees it go straight up and down; you see an arch', 'She sees an arch; you see it go straight up and down', 'The ball lands behind her hand'], answer: 1,
      why: `<p>In her frame the ball only goes up and down. In yours it also moves along the corridor with her, ${f(M.STRIDE, 2)} m during one toss, so its path is an arch. It still lands in her hand, because it was moving forward with her all along.</p>`,
      verify: () => M.ballWalker(M.T_TOP)[0] === 0 && Math.abs(M.ballGround(M.T)[0] - M.STRIDE) < 1e-12, info: `${M.STRIDE.toFixed(2)} m` },
  ],
  3: [
    { id: 'average-speed', q: `The ball goes up ${f(M.H)} m and comes down ${f(M.H)} m in ${f(M.T, 2)} s. What are its average speed and its average velocity?`,
      choices: [`${f(AVG, 1)} m/s and ${f(AVG, 1)} m/s`, `${f(AVG, 1)} m/s and 0 m/s`, `0 m/s and ${f(AVG, 1)} m/s`, `${f(AVG / 2, 1)} m/s and 0 m/s`], answer: 1,
      why: `<p>Average speed is distance ÷ time: ${f(2 * M.H)} m ÷ ${f(M.T, 2)} s = ${f(AVG, 1)} m/s. Average velocity is displacement ÷ time, and the displacement is zero because the ball is back in your hand. So the average velocity is 0 m/s.</p>`,
      verify: () => { let d = 0; const n = 100000; for (let i = 0; i < n; i++) d += Math.abs(M.vy((i + 0.5) * M.T / n)) * M.T / n; return Math.abs(d / M.T - AVG) < 1e-6; }, info: `${AVG.toFixed(3)} m/s` },
  ],
  4: [
    { id: 'graph-slope', q: 'On the height–time graph of the toss, where is the line flat?',
      choices: ['At the start, when the ball is fastest', 'At the very top, when the velocity is zero', 'Nowhere: it is curved all the way', 'At the end, when the ball is caught'], answer: 1,
      why: '<p>The slope of a height–time graph is the velocity. The velocity is zero only at the top, so that is the one place the curve is level. At the start and the end the ball is fastest, and the curve is steepest.</p>',
      verify: () => Math.abs(M.vy(M.T_TOP)) < 1e-12 && Math.abs(M.vy(0)) > Math.abs(M.vy(0.2)) },
  ],
  5: [
    { id: 'after-top', q: `How fast is the ball moving 0.2 s after the top, and which way?`,
      choices: ['0 m/s: it is still near the top', `${f(-V5, 1)} m/s upwards`, `${f(-V5, 1)} m/s downwards`, '9.8 m/s downwards'], answer: 2,
      why: `<p>At the top the velocity is zero. After that, gravity adds 9.8 m/s of downward velocity every second, so in 0.2 s it gains 9.8 × 0.2 = ${f(-V5, 2)} m/s, downwards.</p>`,
      verify: () => Math.abs(-V5 - 9.8 * 0.2) < 1e-9, info: `${(-V5).toFixed(2)} m/s` },
  ],
  6: [
    { id: 'ramp-five', q: `On the ramp the ball rolls ${cm(M.rampS(1))} cm in the first beat. How far from the start is it after five beats?`,
      choices: [`${cm(5 * M.rampS(1))} cm`, `${cm(9 * M.rampS(1))} cm`, `${cm(S6)} cm`, `${cm(G6)} cm`], answer: 2,
      why: `<p>Distance from rest grows with the square of the time: 5 × 5 = 25 units of ${cm(M.rampS(1))} cm, which is ${cm(S6)} cm. The gap in the fifth beat alone is the fifth odd number, 9 units, or ${cm(G6)} cm.</p>`,
      verify: () => { const odd = [1, 3, 5, 7, 9].reduce((a, b) => a + b, 0) * M.rampS(1); return Math.abs(odd - S6) < 1e-12; }, info: `${cm(S6)} cm` },
  ],
  7: [
    { id: 'top-acceleration', q: 'At the very top of the toss, what is the ball’s acceleration?',
      choices: ['Zero, because it has stopped', '9.8 m/s² downwards', '9.8 m/s² upwards', 'Less than 9.8 m/s², because it is barely moving'], answer: 1,
      why: '<p>Acceleration is how fast the velocity is changing. At the top the velocity is going from a little upwards to a little downwards, and it changes just as fast as ever: 9.8 m/s every second, downwards. Zero velocity is not zero acceleration.</p>',
      verify: () => { const d = (M.vy(M.T_TOP + 1e-4) - M.vy(M.T_TOP - 1e-4)) / 2e-4; return Math.abs(d + 9.8) < 1e-9; } },
  ],
};
