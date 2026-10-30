// Chapter 1 spread model: the one-metre toss of Section 1.5, the corridor walker of Section 1.1 and
// Galileo's ramp of Section 1.4. Pure functions, SI units, y up, no air resistance.
// Every motion, arrow, graph and number on the spread comes from here; checks in tests/test_spread_ch01.mjs.

// where the corridor and the ramp stand along x in the figure, metres from the toss
export const ST = { walk: 3.2, ramp: -3.4 };

export const G = 9.8;                         // m/s², downwards
export const H = 1.0;                         // the toss rises one metre (Section 1.5)
export const VY0 = Math.sqrt(2 * G * H);      // launch speed: 4.43 m/s
export const T_TOP = VY0 / G;                 // top of the throw: 0.45 s
export const T = 2 * T_TOP;                   // caught at launch height: 0.90 s
export const STROBE = 0.1;                    // one image every tenth of a second, as in Figure 1.5
export const SLOW = 0.4;                      // the figure runs at 0.4 × real speed
export const REST = 0.7;                      // the ball rests in the hand between tosses, s

// the toss
export const y = t => VY0 * t - 0.5 * G * t * t;
export const vy = t => VY0 - G * t;
export const ay = () => -G;
export const distance = t => t <= T_TOP ? y(t) : 2 * H - y(t);
export const strobeTimes = (t1 = T) => Array.from({ length: Math.floor(t1 / STROBE + 1e-9) + 1 }, (_, i) => i * STROBE);
export const gaps = () => strobeTimes().slice(1).map((t, i) => y(t) - y(i * STROBE));

// the corridor: a friend walks at a steady 1.4 m/s and tosses the same ball (Section 1.1)
export const WALK = 1.4;                      // m/s, an easy walking pace
export const walkX = t => WALK * t;           // the friend's position along the corridor, ground frame
export const ballGround = t => [walkX(t), y(t)];   // the ball seen from the platform: an arc
export const ballWalker = t => [0, y(t)];          // the ball seen by the walker: straight up and down
export const STRIDE = WALK * T;               // how far the ball moves along the corridor during one toss: 1.26 m

// Galileo's ramp: 10 cm in the first second, so a = 0.2 m/s² along the ramp (Section 1.4)
export const RAMP = { a: 0.20, beats: 4, angle: 9 };   // angle drawn steeper than Galileo's, in degrees
export const rampS = t => 0.5 * RAMP.a * t * t;         // distance down the ramp from rest
export const rampV = t => RAMP.a * t;
export const RAMP_LEN = rampS(RAMP.beats);              // 1.60 m after four beats
export const rampMarks = () => Array.from({ length: RAMP.beats + 1 }, (_, n) => rampS(n));
export const rampGaps = () => rampMarks().slice(1).map((s, i) => s - rampS(i));

// the figure's clock → physics time, looping run then rest
export function loop(time, run, rest = REST) {
  const c = time % (run + rest);
  return { t: Math.min(c, run), resting: c > run };
}
export const flight = clock => loop(clock * SLOW, T);
export const rampRun = clock => loop(clock * 0.8, RAMP.beats, 1.0);
