// node tests/test_spread_ch01.mjs — invariants of the Chapter 1 spread model and its practice answers.
// Each answer is recomputed another way (stepping, summing or the book's own published numbers). Exit 1 on failure.
import * as M from '../spreads/ch01/model.mjs';
import { PRACTICE } from '../spreads/ch01/practice.mjs';

const rows = [];
const check = (name, ok, info = '') => rows.push([ok ? 'PASS' : 'FAIL', name, info]);
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const h = 1e-6;
const deriv = (fn, t) => (fn(t + h) - fn(t - h)) / (2 * h);

// the toss agrees with Section 1.5's published numbers
check('rises 1.0 m', near(M.y(M.T_TOP), M.H), `${M.y(M.T_TOP).toFixed(3)} m`);
check('leaves the hand at about 4.4 m/s', Math.abs(M.VY0 - 4.4) < 0.05, `${M.VY0.toFixed(3)} m/s`);
check('top at about 0.45 s', Math.abs(M.T_TOP - 0.45) < 0.005, `${M.T_TOP.toFixed(3)} s`);
check('caught at launch height after 2 × T_TOP', near(M.y(M.T), 0));
check('dy/dt = v and dv/dt = a', [0.1, 0.45, 0.8].every(t => near(deriv(M.y, t), M.vy(t), 1e-6) && near(deriv(M.vy, t), M.ay(), 1e-6)));
check('v = 0 at the top but a = −9.8 there', near(M.vy(M.T_TOP), 0) && near(M.ay(M.T_TOP), -9.8));
const book = [39, 30, 20, 10, 0.2, -10, -19, -29, -39];   // Figure 1.5's gaps, cm
check('strobe gaps match Figure 1.5 to the nearest cm', M.gaps().every((g, i) => Math.abs(g * 100 - book[i]) < 0.6), M.gaps().map(g => (g * 100).toFixed(1)).join(', '));
const dd = M.gaps().slice(1).map((g, i) => g - M.gaps()[i]);
check('each gap shrinks by gτ² = 9.8 cm, straight through the top', dd.every(d => near(d, -M.G * M.STROBE ** 2, 1e-9)));
check('round trip: displacement 0, distance 2 m', near(M.y(M.T), 0) && near(M.distance(M.T), 2 * M.H));
// step the toss with a fine semi-implicit Euler: same top, same catch
{ const dt = 1e-5; let yy = 0, v = M.VY0, t = 0, top = 0;
  while (t < M.T - dt / 2) { v -= M.G * dt; yy += v * dt + 0.5 * M.G * dt * dt; t += dt; top = Math.max(top, yy); }
  check('stepped toss: same top and catch', Math.abs(top - M.H) < 1e-4 && Math.abs(yy) < 1e-4, `top ${top.toFixed(5)} m`); }

// the corridor
check('walker frame: ball goes straight up and down', [0.2, 0.5, 0.8].every(t => M.ballWalker(t)[0] === 0));
check('ground frame = walker frame + walker’s motion', [0.2, 0.5, 0.8].every(t => near(M.ballGround(t)[0], M.ballWalker(t)[0] + M.walkX(t)) && near(M.ballGround(t)[1], M.ballWalker(t)[1])));
check('ball lands back in the hand, 1.26 m along', near(M.STRIDE, M.walkX(M.T)), `${M.STRIDE.toFixed(2)} m`);

// the ramp agrees with Section 1.4
check('ramp: 10 cm in the first second', near(M.rampS(1), 0.10));
check('ramp: distances 1, 4, 9, 16 units', M.rampMarks().every((s, n) => near(s, 0.10 * n * n)));
check('ramp: gaps are the odd numbers', M.rampGaps().every((g, i) => near(g, 0.10 * (2 * i + 1))));
check('ramp: speed gains 20 cm/s each beat', [1, 2, 3, 4].every(n => near(M.rampV(n) - M.rampV(n - 1), 0.20)));

// every practice question has a valid answer and a worked reason
const all = Object.values(PRACTICE).flat();
check('practice: every choice question has its answer in range', all.every(q => !q.choices || (Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length)), `${all.length} questions`);
check('practice: every question explains itself', all.every(q => (q.why || q.solution || '').length > 40));
for (const q of all) if (q.verify) check(`practice: ${q.id}`, q.verify(), q.info || '');

let fail = 0;
for (const [s, n, i] of rows) { if (s === 'FAIL') fail++; console.log(`${s}  ${n}${i ? '  · ' + i : ''}`); }
console.log(`\n${rows.length - fail} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
