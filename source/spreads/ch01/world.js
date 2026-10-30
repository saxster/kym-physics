// The figure: the one-metre toss of Section 1.5 beside a position axis, its velocity and acceleration as solid
// arrows and a strobe every tenth of a second; further along, the corridor walker of Section 1.1 tossing the
// same ball; behind, Galileo's ramp of Section 1.4. Only what a textbook diagram would draw. Metres, y up.
import * as THREE from 'three';
import { part, box, cyl, lines, arrow, setArrow, shadeMat, V, PALETTE } from '../../spread/parts.js';
import * as M from './model.mjs';

export const R = 0.045;            // ball radius: drawn a little larger than a real ball, so it can be seen
export const V_SCALE = 0.1;        // arrow metres per m/s
export const A_SCALE = 0.04;       // arrow metres per m/s²
export const SX = -0.32;           // the position axis stands beside the toss
const ST = M.ST;
export const WALK_RUN = 2;                // tosses per walk across the corridor
export const WALK_GAP = 0.25;             // seconds between catching and tossing again, while still walking

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const ink = PALETTE.dark[1], faint = PALETTE.base[2];

  // ---------- the floor: faint squared paper, 10 cm squares ----------
  const grid = [];
  for (let x = -5; x <= 7.001; x += 0.5) grid.push(x, -0.9, -1.2, x, -0.9, 1.2);
  for (let z = -1.2; z <= 1.201; z += 0.5) grid.push(-5, -0.9, z, 7, -0.9, z);
  lines(root, grid, faint);

  // ---------- the hand: the launch point and position zero ----------
  const hand = asm('hand', root, { title: 'Your hand', sub: 'the launch point, and position zero' });
  part(hand, box(0.16, 0.035, 0.12, 0.012), { tone: 'mid', pal: 'base', pos: [0, -R - 0.018, 0], name: 'Hand' });
  part(hand, cyl(0.02, 0.22, 16), { tone: 'lo', pal: 'base', pos: [0, -R - 0.15, 0], name: 'Arm' });

  // ---------- the position axis ----------
  const staff = asm('staff', root, { title: 'Position axis', sub: 'where the ball is, from your hand' });
  part(staff, cyl(0.006, 1.18, 12), { tone: 'hi', pal: 'ink', pos: [SX, 0.59, 0], name: 'Axis' });
  part(staff, new THREE.ConeGeometry(0.018, 0.05, 20), { tone: 'hi', pal: 'ink', pos: [SX, 1.2, 0], name: 'Axis' });
  const ticks = [];
  for (let i = 0; i <= 11; i++) { const l = i % 5 === 0 ? 0.05 : 0.025; ticks.push(SX, i * 0.1, 0, SX + l, i * 0.1, 0); }
  lines(staff, ticks, ink);
  const collar = part(staff, box(0.09, 0.008, 0.008, 0.003), { tone: 'hi', pal: 'ink', pos: [SX, 0, 0], name: 'Height marker' });
  const dispArrow = arrow(staff, 'ink', { r: 0.006, head: 0.035, headR: 0.017, name: 'Displacement' });

  // ---------- the ball, its arrows and its strobe ----------
  const ball = asm('ball', root, { title: 'The ball', sub: `tossed up at ${M.VY0.toFixed(1)} m/s` });
  part(ball, new THREE.SphereGeometry(R, 40, 28), { tone: 'hi', name: 'Ball' });
  const vG = asm('vArrow', root, { title: 'Velocity', sub: 'how fast, and which way' });
  const vArrow = arrow(vG, 'blue', { r: 0.008, head: 0.04, headR: 0.02, name: 'Velocity' });
  const aG = asm('aArrow', root, { title: 'Acceleration', sub: 'how the velocity is changing' });
  const aArrow = arrow(aG, 'red', { r: 0.008, head: 0.04, headR: 0.02, name: 'Acceleration' });
  const strobe = asm('strobe', root, { title: 'The strobe', sub: 'the ball every tenth of a second' });
  const ghostMat = shadeMat('paper', { opacity: 0.55 });
  const ghosts = M.strobeTimes().map(t => {
    const g = part(strobe, new THREE.SphereGeometry(R * 0.96, 28, 18), { tone: 'lo', name: 'Image', mat: ghostMat });
    g.userData.t = t; g.visible = false; return g;
  });

  // ---------- the corridor: a friend walks along, tossing the ball ----------
  const W0 = ST.walk;
  const corridor = asm('corridor', root, { title: 'The corridor', sub: 'the platform’s frame: it stays still' });
  const CL = M.WALK * WALK_RUN * (M.T + WALK_GAP) + 0.4;
  part(corridor, box(CL, 0.02, 0.6, 0.006), { tone: 'lo', pal: 'base', pos: [W0 + CL / 2 - 0.2, -0.9, 0], name: 'Floor' });
  const cticks = [];
  for (let k = 0; k <= Math.floor((CL - 0.4) / 0.25); k++) cticks.push(W0 + k * 0.25, -0.885, 0.3, W0 + k * 0.25, -0.885, k % 4 === 0 ? 0.18 : 0.24);
  lines(corridor, cticks, ink);
  const walker = asm('walker', root, { title: 'Your friend', sub: `walking at a steady ${M.WALK.toFixed(1)} m/s` });
  part(walker, box(0.16, 0.035, 0.12, 0.012), { tone: 'mid', pal: 'base', pos: [0, -R - 0.018, 0], name: 'Hand' });
  part(walker, cyl(0.02, 0.86, 16), { tone: 'lo', pal: 'base', pos: [0, -R - 0.47, 0], name: 'Arm' });
  const wBallG = asm('wBall', root, { title: 'The same toss', sub: 'straight up for her, an arch for you' });
  const wBall = part(wBallG, new THREE.SphereGeometry(R, 40, 28), { tone: 'hi', name: 'Ball' });
  const arcG = asm('arc', root, { title: 'The arch you see', sub: 'the ball every tenth of a second, from the platform' });
  const arcGhosts = M.strobeTimes().map(() => { const g = part(arcG, new THREE.SphereGeometry(R * 0.96, 28, 18), { tone: 'lo', name: 'Image', mat: ghostMat }); g.visible = false; return g; });
  // her view: a dashed upright line that walks with her
  const herLine = [];
  for (let y = 0; y < 1.0; y += 0.08) herLine.push(0, y, 0, 0, Math.min(y + 0.04, 1.0), 0);
  const herPath = lines(walker, herLine, PALETTE.blue[1]);

  // ---------- Galileo's ramp ----------
  const R0 = ST.ramp, ang = THREE.MathUtils.degToRad(M.RAMP.angle), L = M.RAMP_LEN + 0.25;
  const down = V(Math.cos(ang), -Math.sin(ang), 0), top = V(R0 - 0.9, 0.05, 0);
  const along = s => top.clone().addScaledVector(down, s);
  const rampG = asm('ramp', root, { title: 'Galileo’s ramp', sub: 'gravity, slowed down so it can be timed' });
  const board = part(rampG, box(L, 0.03, 0.22, 0.008), { tone: 'mid', pal: 'base', name: 'Ramp' });
  board.position.copy(along(L / 2 - 0.1)).add(V(0, -R - 0.015, 0).applyAxisAngle(V(0, 0, 1), -ang));
  board.rotation.z = -ang; board.userData.home = board.position.clone();
  const legH = along(L - 0.1).y + 0.9;
  part(rampG, box(0.04, legH, 0.18, 0.008), { tone: 'lo', pal: 'base', pos: [along(L - 0.12).x, -0.9 + legH / 2 - 0.05, 0], name: 'Stand' });
  const rBallG = asm('rBall', root, { title: 'The rolling ball', sub: 'starting from rest' });
  const rBall = part(rBallG, new THREE.SphereGeometry(R, 40, 28), { tone: 'hi', name: 'Ball' });
  const marksG = asm('marks', root, { title: 'The marks', sub: 'where the ball is at each beat' });
  M.rampMarks().forEach((s, n) => {
    const p = along(s).add(V(0, -R + 0.002, 0).applyAxisAngle(V(0, 0, 1), -ang));
    const m = part(marksG, box(0.012, 0.004, 0.24, 0.002), { tone: 'hi', pal: 'ink', name: `Beat ${n}` });
    m.position.copy(p); m.rotation.z = -ang; m.userData.home = m.position.clone();
  });
  const rGhosts = M.rampMarks().map(() => { const g = part(rBallG, new THREE.SphereGeometry(R * 0.96, 28, 18), { tone: 'lo', name: 'Image', mat: ghostMat }); g.visible = false; return g; });

  // ---------- per-frame update ----------
  function update(s, look) {
    const { t, resting } = s.toss, fly = resting ? 0 : 1;
    const yb = resting ? 0 : M.y(t);
    ball.position.set(0, yb, 0);
    collar.position.y = yb;
    setArrow(dispArrow, V(SX - 0.03, 0, 0), V(0, yb, 0), look.disp);
    const v = fly * M.vy(t);
    setArrow(vArrow, V(R + 0.02, yb, 0), V(0, v * V_SCALE, 0), look.vel);
    setArrow(aArrow, V(-(R + 0.02), yb, 0), V(0, -fly * M.G * A_SCALE, 0), look.acc);
    // strobe: going up drawn a little left, coming down a little right, as in Figure 1.5
    for (const g of ghosts) {
      const show = look.strobe > 0.5 && (resting || g.userData.t <= t + 1e-9);
      g.visible = show;
      if (show) g.position.set(g.userData.t < M.T_TOP ? -0.012 : g.userData.t > M.T_TOP ? 0.012 : 0, M.y(g.userData.t), 0);
    }

    // the corridor
    const w = s.walk, x = W0 + M.walkX(w.c);
    walker.position.set(x, 0, 0);
    const wy = w.tossing ? M.y(w.t) : 0;
    wBall.position.set(x, wy, 0);
    herPath.visible = look.frames > 0.5;
    arcGhosts.forEach((g, k) => {
      const tk = k * M.STROBE, show = look.frames > 0.5 && tk <= w.t + 1e-9;
      g.visible = show;
      if (show) g.position.set(W0 + M.walkX(w.c0 + tk), M.y(tk), 0);
    });

    // the ramp
    const r = s.ramp, sr = M.rampS(r.t);
    rBall.position.copy(along(sr));
    rGhosts.forEach((g, n) => { g.visible = n <= r.t + 1e-9 && n > 0; if (g.visible) g.position.copy(along(M.rampS(n))); });
  }

  // anchors for the HTML labels
  const anchors = {
    v: () => ball.visible && vArrow.visible ? ball.position.clone().add(V(R + 0.07, 0.02, 0)) : null,
    a: () => aArrow.visible ? ball.position.clone().add(V(-(R + 0.07), -0.06, 0)) : null,
    staff: q => V(SX - 0.04, q, 0),
    mark: n => along(M.rampS(n)).add(V(0, -0.11, 0.13)),
    walker: () => walker.position.clone().add(V(0, -0.98, 0.32)),
  };
  return { update, anchors, along };
}
