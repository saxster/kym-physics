// Pedagogical enhancements for every live widget in The Moving World:
// 1. Goal-directed micro-challenge + earned rubber stamp (challenge)
// 2. Live "Your numbers" handwritten margin substitution in Caveat Variable (yourNumbers)
// 3. 5-shot choreographed "Watch" tour + Cut-away inside view (watch + cutaway)
// 4. "What the model simplifies" 1-sentence honesty footnote (idealised)

const G = 9.8;
const A = (prompt, check, yourNumbers, cutaway, c1, a1, c2, a2, c3, c4, a4, idealised, presets, mentorTips) => ({
  challenge: { prompt, check },
  ...(presets ? { presets } : {}),
  ...(mentorTips ? { mentorTips } : {}),
  yourNumbers,
  cutaway,
  watch: [
    { title: '1. Wide view', caption: '1/5 Wide shot: ' + c1, act: a1 },
    { title: '2. Close-up', caption: '2/5 Close-up: ' + c2, act: a2 },
    { title: '3. Cut-away', caption: '3/5 Cut-away: ' + c3, cutaway: true },
    { title: '4. Side-on trend', caption: '4/5 Trend: ' + c4, act: a4 },
    { title: '5. Your turn', caption: '5/5 Your turn: Drag to orbit in 3D, switch stations, or explode the parts.', cutaway: false },
  ],
  idealised,
});

export const ENHANCEMENTS = {
  videotrack: {
    challenge: {
      prompt: 'Calibrate the wall tiles to a real wall scale and mark the tossed ball frame-by-frame—how do equal-time height gaps reveal whether speed is changing?',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Tile scale', 10) - 10) < 0.5,
    },
    presets: [
      { name: '10 cm Wall Tiles', prompt: 'Standard bathroom/school tile scale.', state: { tabs: [0], sliders: { 'Tile scale': 10 } } },
      { name: '0.10 s Strobe Marks', prompt: 'Inspect shrinking upward gaps between ticks.', state: { tabs: [1], sliders: { 'Tile scale': 10 } } },
    ],
    mentorTips: {
      openPlay: 'Ask Kym whether the ball slows down smoothly or loses speed in sudden jumps.',
      misconception: 'Thinking equal distances in video frames mean constant acceleration instead of constant speed.',
      dinnerQuestion: 'If you photograph a falling coin under a blinking lamp at Chowpatty, why do successive shadows pull farther apart?',
      cambridgeUnit: 'Unit 1 · Motion & Video Kinematics',
    },
    yourNumbers: (s) => `Tile = ${s.num('Tile scale',10)} cm | Demo marks: Δt = 0.100 s. For a clip, choose 0.100 s, 0.050 s, or Δt = 1/fps using the clip’s selected fps. Calibrate before using centimetres.`,
    cutaway: 'A clip supplies image samples and timestamps. Exposure duration and actual frame timing depend on the camera; selected fps must match the clip. The demo uses fixed 0.100 s marks.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: A ball tossed past wall tiles gives both a clock (frames) and a ruler (tiles).', act: (s) => { s.selectTab(0, 0); s.setSlider('Tile scale', 10); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Marking every 0.10 s shows the gaps shrinking on the way up as gravity slows the ball.', act: (s) => s.selectTab(0, 1) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the camera shutter, exposure time can blur the ball; clip frame intervals and marking errors limit measurement.', cutaway: true, act: (s) => s.selectTab(0, 2) },
      { title: '4. Side-on trend', caption: '4/5 Trend: For a loaded clip, every-frame gaps can be too small to measure reliably. Demo points remain 0.100 s apart.', act: (s) => s.selectTab(0, 3) },
      { title: '5. Your turn', caption: '5/5 Your turn: Change the tile scale or load your own clip to measure speed.', cutaway: false },
    ],
    idealised: 'The demo toss ignores air drag and lens barrel distortion, which curves straight tile lines near the edges of a real phone camera.',
  },

  graphwalk: {
    challenge: {
      prompt: 'Walk forward, pause, and turn back toward the far wall of the corridor—how does the position–time slope distinguish moving from standing still?',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Corridor position', 0) - 6.5) <= 0.25,
    },
    presets: [
      { name: 'Replay Reference Walk', prompt: 'Inspect slope changes in Fig 1.2.', state: { tabs: [0], sliders: { 'Corridor position': 0 } } },
      { name: 'Mid-Corridor Pause', prompt: 'Stand near 4.0 m and watch time run flat.', state: { tabs: [1], sliders: { 'Corridor position': 4.0 } } },
    ],
    mentorTips: {
      openPlay: 'Cover the corridor graphic and guess Kym’s motion purely from the graph slope first.',
      misconception: 'Reading a position–time graph as if it showed the hill shape or speed-vs-time directly.',
      dinnerQuestion: 'On the Marine Drive promenade, what does a flat horizontal stretch on your distance–time graph mean?',
      cambridgeUnit: 'Unit 1 · Position–Time Graphs',
    },
    yourNumbers: (s) => {
      const x = s.num('Corridor position', 0);
      const mode = s.tab(0) === 1 ? 'walking live' : 'replaying Fig 1.2';
      return `x(t) = ${x.toFixed(1)} m from classroom door  |  slope = Δx ÷ Δt = velocity (${mode})`;
    },
    cutaway: 'A real ultrasonic rangefinder can infer distance from an echo delay: x = sound speed × delay / 2. This widget uses a position slider, not a connected sensor.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: The corridor and position–time graph represent the same walk.', act: (s) => s.selectTab(0, 0) },
      { title: '2. Close-up', caption: '2/5 Close-up: A steeper line means covering more metres each second.', act: (s) => { s.selectTab(0, 1); s.setSlider('Corridor position', 3.0); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: How a motion sensor turns echo delay into a live position dot.', cutaway: true, act: (s) => s.setSlider('Corridor position', 5.5) },
      { title: '4. Side-on trend', caption: '4/5 Trend: Standing still draws a flat horizontal line—time keeps moving even when you do not.', act: (s) => s.setSlider('Corridor position', 6.5) },
      { title: '5. Your turn', caption: '5/5 Your turn: Drag the corridor slider to match or invent a walk.', cutaway: false },
    ],
    idealised: 'Your position is treated as a single point; a real walker sways slightly with every step.',
  },

  freefall: {
    challenge: {
      prompt: 'Replay the simulated accelerometer trace: identify held (~9.8 m/s²), freely falling (~0), and caught (a short peak).',
      check: (s) => s.interacted || s.watched,
    },
    presets: [
      { name: 'Simulated Drop Trace', prompt: 'Compare supported weight vs weightless free fall.', state: { tabs: [] } },
    ],
    mentorTips: {
      openPlay: 'Ask Kym why the reading drops to ZERO while falling instead of jumping up.',
      misconception: 'Thinking a free-fall accelerometer measures velocity downward rather than contact support force.',
      dinnerQuestion: 'Why does an astronaut inside the International Space Station float if Earth’s gravity up there is still ~90% as strong as in Mumbai?',
      cambridgeUnit: 'Unit 1 · Free Fall & Weightlessness',
    },
    yourNumbers: () => 'Accelerometer signal: supported ≈ 9.8 m/s²; freely falling ≈ 0. This is a simulated sensor trace, not a velocity graph.',
    cutaway: 'Inside the phone MEMS accelerometer: a microscopic silicon proof-mass on springs relaxes to zero deflection during free fall.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: The simulated accelerometer reads about 9.8 m/s² when supported and nearly zero while falling.' },
      { title: '2. Close-up', caption: '2/5 Close-up: The low-signal interval identifies free fall; the catching support creates the short peak.' },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the falling phone, the tiny silicon spring is weightless until the cushion catches it.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: A near-zero accelerometer reading during free fall does not mean that gravitational acceleration is zero.' },
      { title: '5. Your turn', caption: '5/5 Your turn: Replay the simulated trace; the motion sensor is a separate optional measurement.', cutaway: false, act: (s) => s.clickBtn('Replay') },
    ],
    idealised: 'The simulated trace illustrates support, free fall and a catch. A real sensor has orientation, sampling and calibration limits.',
  },

  airfall: {
    challenge: {
      prompt: 'Make the feather and coin hit the bottom at the exact same instant—discover which condition makes mass stop mattering.',
      check: (s) => s.num('Air', 1) <= 0.02,
    },
    presets: [
      { name: 'Room Air', prompt: 'Compare heavy coin vs light feather in 100% air.', state: { sliders: { Air: 1 } } },
      { name: 'Vacuum Tube', prompt: 'Pump out all air so only gravity acts.', state: { sliders: { Air: 0 } } },
    ],
    mentorTips: {
      openPlay: 'Let her drop the feather and coin in full air, then slowly pump air out step by step.',
      misconception: 'Believing heavier objects inherently fall faster because gravity pulls harder (forgetting larger mass also resists acceleration).',
      dinnerQuestion: 'On the Moon, if you dropped a hammer and a tissue side by side, which lands first and why?',
      cambridgeUnit: 'Unit 3 · Forces & Gravity',
    },
    yourNumbers: (s) => `F_net = mg − ½ρC_DAv² | air density = ${Math.round(s.num('Air',1)*100)}% of the reference. At release v = 0, so drag = 0 and both initial accelerations are g = 9.8 m/s².`,
    cutaway: 'Inside the tube: at full air, ~2.5 × 10²⁵ N₂ and O₂ molecules per m³ collide with the feather’s barbs; pumping them out leaves only gravity.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: In normal room air, the coin drops like a stone while the feather drifts.', act: (s) => { s.setSlider('Air', 1); s.clickBtn('Drop'); } },
      { title: '2. Close-up', caption: '2/5 Close-up: At 40% of the reference air density, the same speed produces 40% of the quadratic drag.', act: (s) => { s.setSlider('Air', 0.4); s.clickBtn('Drop'); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: At the microscopic scale, air drag is billions of gas molecules bouncing off the falling surface.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: In a vacuum (Air = 0), mass cancels out of F = m g and both fall side by side.', act: (s) => { s.setSlider('Air', 0); s.clickBtn('Drop'); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Compare pairs of objects at any air density.', cutaway: false },
    ],
    idealised: 'Drag is modelled as quadratic vertical resistance without the fluttering vortices a real feather sheds in air.',
  },

  projectile: {
    challenge: {
      prompt: 'Fire horizontally (0°) and discover what launch speed lands the flicked coin at about 1.17 m away.',
      check: (s) => Math.abs(s.num('Launch angle', 0)) < 1 && Math.abs(s.num('Sideways', 2.0) - 3.0) < 0.1,
    },
    presets: [
      { name: 'Drop vs Flick', prompt: 'Zero angle compare: horizontal flick vs vertical drop.', state: { sliders: { 'Launch angle': 0, Sideways: 2.0 } } },
      { name: '45° Range', prompt: 'Launch upward at 45° to compare flight time.', state: { sliders: { 'Launch angle': 45, Sideways: 3.0 } } },
    ],
    mentorTips: {
      openPlay: 'Ask her to watch only the vertical heights of the two coins, ignoring sideways motion.',
      misconception: 'Thinking a fast sideways throw stays in the air longer before hitting the floor.',
      dinnerQuestion: 'Why does a bullet fired horizontally from shoulder height hit flat ground at the exact same moment as one dropped from your hand?',
      cambridgeUnit: 'Unit 3 · Independent Components',
    },
    yourNumbers: (s) => {
      const v0 = s.num('Sideways', 2.0);
      const deg = s.num('Launch angle', 0);
      const rad = (deg * Math.PI) / 180;
      const vx = v0 * Math.cos(rad);
      const vy0 = v0 * Math.sin(rad);
      const h0 = 0.75;
      const tFlight = (vy0 + Math.sqrt(vy0 * vy0 + 2 * G * h0)) / G;
      const range = vx * tFlight;
      return `x = v_x t = ${vx.toFixed(2)} × ${tFlight.toFixed(2)} s = ${range.toFixed(2)} m  |  y = h₀ + v_y₀t − ½gt² (h₀ = 0.75 m)`;
    },
    cutaway: 'Inside the two-component split: the horizontal velocity arrow v_x stays the exact same length all the way across while v_y grows by 9.8 m/s every second.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: The dropped coin and the horizontally flicked coin fall through the same height lines at the same instants.', act: (s) => { s.setSlider('Launch angle', 0); s.setSlider('Sideways', 2.0); s.clickBtn('Launch'); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Doubling the horizontal speed doubles the landing distance without changing the flight time.', act: (s) => { s.setSlider('Sideways', 3.0); s.clickBtn('Launch'); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Gravity pulls only downward; nothing pushes or slows the sideways motion.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Tilting the launch upward adds initial vertical speed, keeping the coin in the air longer.', act: (s) => { s.setSlider('Launch angle', 20); s.clickBtn('Launch'); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Aim the coin to hit your target distance.', cutaway: false },
    ],
    idealised: 'Air resistance and coin spin (Magnus lift) are omitted, so horizontal velocity remains strictly constant.',
  },

  ramp: {
    challenge: {
      prompt: 'Set friction to zero and make the second ramp gentle (10°)—compare how far along the slope the puck slides to regain its 1.0 m starting height.',
      check: (s) => s.num('Friction', 0) <= 0.01 && Math.abs(s.num('Second ramp angle', 20) - 10) <= 1,
    },
    presets: [
      { name: 'Symmetric 30°', prompt: 'Frictionless equal-angle recovery.', state: { sliders: { Friction: 0, 'Second ramp angle': 30 } } },
      { name: 'Galileo Flat (0°)', prompt: 'Flatten the second ramp completely.', state: { sliders: { Friction: 0, 'Second ramp angle': 0 } } },
    ],
    mentorTips: {
      openPlay: 'Ask how high the puck climbs on the far side before touching the friction slider.',
      misconception: 'Assuming an object needs an ongoing push just to keep sliding on a level frictionless floor.',
      dinnerQuestion: 'If you flattened Galileo’s second ramp all the way to horizontal with zero friction, when would the marble ever stop?',
      cambridgeUnit: 'Unit 3 · Balanced Forces & Inertia',
    },
    yourNumbers: (s) => {
      const deg=s.num('Second ramp angle',30), mu=s.num('Friction',.1), a=deg*Math.PI/180;
      const numerator=Math.max(0,1-mu/Math.tan(Math.PI/6)),denominator=Math.sin(a)+mu*Math.cos(a);
      const distance=denominator>0?(numerator/denominator).toFixed(2):'∞';
      return `h₀ = 1.00 m | s_up = h₀(1 − μ cot30°)/(sinθ₂ + μ cosθ₂) = ${distance} m`;
    },
    cutaway: 'The widget is an ideal sliding puck, with no rotation. Friction opposes sliding on each slope and transfers mechanical energy into warmth.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Released on the left slope, the puck climbs the right slope toward its original height line.', act: (s) => { s.setSlider('Friction', 0); s.setSlider('Second ramp angle', 25); s.clickBtn('Release'); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Lowering the right slope to 10° makes the puck travel much farther horizontally to reach the same height.', act: (s) => { s.setSlider('Second ramp angle', 10); s.clickBtn('Release'); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Why Galileo polished the parchment-lined channel to strip away friction.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Flatten the right ramp to 0° and the puck never reaches its starting height—so with no friction it slides onward.', act: (s) => { s.setSlider('Second ramp angle', 0); s.clickBtn('Release'); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Test any ramp angle with or without friction.', cutaway: false },
    ],
    idealised: 'The corner between the two ramps is smoothed so no kinetic energy is lost to a bounce at the bottom transition.',
  },

  forces: {
    challenge: {
      prompt: 'On the rough floor (100 N friction), balance or unbalance the two rope pulls until the net force to the right is exactly 150 N.',
      check: (s) => {
        if (s.tab(0) !== 1) return false;
        const r = s.num('Pull to the right', 0);
        const l = s.num('Pull to the left', 0);
        return r - l === 250 && /Net force 150 N to the right/.test(s.readout()); // 250 N pull difference minus 100 N friction = 150 N net
      },
    },
    presets: [
      { name: 'Tug-of-War Tie', prompt: 'Equal 250 N pulls from rest on smooth floor.', state: { tabs: [0], sliders: { 'Pull to the left': 250, 'Pull to the right': 250 }, custom: { v: 0, x: 0 } } },
      { name: 'Cruising at Zero Net Force', prompt: 'Moving at 4.0 m/s with equal 200 N pulls—watch the water level!', state: { tabs: [0], sliders: { 'Pull to the left': 200, 'Pull to the right': 200 }, custom: { v: 4.0, x: 0, loadIdx: 0 } } },
      { name: 'Mystery Box Weighing', prompt: 'Pull the unknown ? kg crate and compute m = F_net / a.', state: { tabs: [0], sliders: { 'Pull to the left': 0, 'Pull to the right': 240 }, custom: { v: 0, x: 0, loadIdx: 2, mysteryRevealed: false } } },
    ],
    mentorTips: {
      openPlay: 'Let Kym get the cart moving, then set both pulls equal to 200 N—watch the water glass stay dead flat!',
      misconception: 'Thinking zero net force means the cart must stop (confusing net force with velocity instead of acceleration).',
      dinnerQuestion: 'On a smooth Mumbai local train cruising steadily between stations, does a glass of water tilt forward, backward, or stay flat?',
      cambridgeUnit: 'Unit 3 · Forces, Friction & Acceleration',
    },
    yourNumbers: (s) => {
      const l=s.num('Pull to the left',200),r=s.num('Pull to the right',200);
      return `Applied pull = ${r} − ${l} = ${r-l} N. ΣF = applied pull + contact friction; sliding friction opposes velocity, while static friction balances up to 100 N at rest. See the readout for the current net force.`;
    },
    cutaway: 'Inside the floor contact: microscopic bumps (asperities) on the crate interlock with the floorboards up to the 100 N friction limit.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Equal pulls of 200 N left and right cancel to a net force of 0 N.', act: (s) => { s.selectTab(0, 0); s.setSlider('Pull to the left', 200); s.setSlider('Pull to the right', 200); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Pulling harder to the right creates an unbalanced force and accelerates the crate.', act: (s) => s.setSlider('Pull to the right', 350) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Under a microscope, rough floor asperities push back against the sliding crate.', cutaway: true, act: (s) => s.selectTab(0, 1) },
      { title: '4. Side-on trend', caption: '4/5 Trend: On the rough floor, pulls smaller than 100 N are matched completely by static friction.', act: (s) => { s.setSlider('Pull to the left', 0); s.setSlider('Pull to the right', 80); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Combine pulls and friction to hit the target net force.', cutaway: false },
    ],
    idealised: 'Static and kinetic friction are set equal at 100 N here; in real wood-on-wood contact, static friction is slightly higher than sliding friction.',
  },

  momentum_carts: {
    challenge: {
      prompt: 'Choose a sticky inelastic collision and pick unequal cart masses so the joined pair finishes rolling faster than +1.1 m/s.',
      check: (s) => {
        if (s.tab(0) !== 1) return false;
        const m1 = s.num('Mass of cart 1', 0.5);
        const m2 = s.num('Mass of cart 2', 0.5);
        const vJoined = (m1 * 2.0 + m2 * -0.5) / (m1 + m2);
        return Math.abs(m1 - m2) >= 0.05 && vJoined > 1.1;
      },
    },
    presets: [
      { name: 'Equal Elastic Swap', prompt: 'Equal 0.50 kg carts bounce cleanly.', state: { tabs: [0], sliders: { 'Mass of cart 1': 0.5, 'Mass of cart 2': 0.5 } } },
      { name: 'Heavy Meets Light (Stick)', prompt: 'Watch a massive cart capture a light cart.', state: { tabs: [1], sliders: { 'Mass of cart 1': 0.8, 'Mass of cart 2': 0.2 } } },
    ],
    mentorTips: {
      openPlay: 'Try equal masses first, then make Cart 1 much heavier than Cart 2 in both Bounce and Stick modes.',
      misconception: 'Assuming kinetic energy must stay conserved in sticky collisions just because total momentum does.',
      dinnerQuestion: 'When two railway coaches couple and stick together, what disappears (KE) and what refuses to vanish (momentum)?',
      cambridgeUnit: 'Unit 3 · Momentum & Collisions',
    },
    yourNumbers: (s) => {
      const m1=s.num('Mass of cart 1',.35),m2=s.num('Mass of cart 2',.5),u1=2,u2=-.5;
      const total=m1*u1+m2*u2,sum=m1+m2;
      if(s.tab(0)===1)return `p = m₁(+2.00) + m₂(−0.50) = ${total.toFixed(2)} kg·m/s; joined v = p/(m₁+m₂) = ${(total/sum).toFixed(2)} m/s`;
      const v1=((m1-m2)*u1+2*m2*u2)/sum,v2=(2*m1*u1+(m2-m1)*u2)/sum;
      return `p = ${total.toFixed(2)} kg·m/s; elastic result v₁′ = ${v1.toFixed(2)} m/s, v₂′ = ${v2.toFixed(2)} m/s`;
    },
    cutaway: 'Inside the bumper: spring steel stores ½kx² during an elastic bounce and returns it, whereas Velcro hooks trap the carts together and turn part of KE into warmth.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Equal-mass carts in an elastic bounce swap velocities completely.', act: (s) => { s.selectTab(0, 0); s.setSlider('Mass of cart 1', 0.5); s.setSlider('Mass of cart 2', 0.5); } },
      { title: '2. Close-up', caption: '2/5 Close-up: A heavy cart hitting a light cart keeps moving forward while kicking the light cart ahead faster.', act: (s) => { s.setSlider('Mass of cart 1', 0.8); s.setSlider('Mass of cart 2', 0.2); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the spring vs Velcro bumpers during the millisecond of impact.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Even when the carts stick together and lose kinetic energy, total momentum p₁ + p₂ never changes.', act: (s) => s.selectTab(0, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Adjust both cart masses and compare elastic vs sticky collisions.', cutaway: false },
    ],
    idealised: 'Track wheel friction and air drag are set to zero so total horizontal momentum is strictly conserved.',
  },

  whirl: {
    challenge: {
      prompt: 'Raise the whirling speed, then compare the floor view and the ball’s-seat frame right before and after releasing the string—which way does the released ball actually travel?',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Speed', 2.0) - 3.5) < 0.1,
    },
    presets: [
      { name: 'Floor Reference Frame', prompt: 'Watch real inward tension perpendicular to tangent velocity.', state: { tabs: [0], sliders: { Speed: 2.0 } } },
      { name: 'Rotating Seat View', prompt: 'See why a turning observer feels an apparent outward throw.', state: { tabs: [1], sliders: { Speed: 3.5 } } },
    ],
    mentorTips: {
      openPlay: 'Let Kym predict which straight direction the ball takes if snipped at top-dead-centre.',
      misconception: 'Thinking a released object spirals outward due to "centrifugal force" instead of moving straight along the tangent.',
      dinnerQuestion: 'On a rainy Dadar Flyover turn, do groceries slide "outward" or keep trying to go straight while the car curves underneath them?',
      cambridgeUnit: 'Unit 4 · Circular Motion & Reference Frames',
    },
    yourNumbers: (s) => {
      if (/Released|No inward pull/.test(s.readout())) return 'After release: real string tension T = 0 N; inertial velocity remains constant.';
      const v = s.num('Speed', 2.0);
      const r = 1.00, m = 0.20;
      const a = (v * v) / r;
      const T = m * a;
      return `a_c = v² ÷ r = ${v.toFixed(1)}² ÷ ${r.toFixed(2)} = ${a.toFixed(2)} m/s²  |  string tension T = m a_c = ${T.toFixed(2)} N`;
    },
    cutaway: 'Inside the taut string: fibres transmit the inward tension force T = mv²/r; the instant the clip opens, T drops to 0 N.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: From the floor, the string pulls purely inward while the velocity points along the tangent.', act: (s) => { s.selectTab(0, 0); s.setSlider('Speed', 2.0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Doubling the speed quadruples the inward tension needed to bend the path.', act: (s) => s.setSlider('Speed', 3.5) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: The string tension vanishes the instant you let go—there is no outward force pushing the ball.', cutaway: true, act: (s) => s.clickBtn('Release') },
      { title: '4. Side-on trend', caption: '4/5 Trend: Seen from the rotating seat, the straight tangent path looks like it curves outward.', act: (s) => s.selectTab(0, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Release the ball at any point and compare both frames of reference.', cutaway: false },
    ],
    idealised: 'The ball whirls on a frictionless horizontal table so gravity does not tilt the string downward into a cone.',
  },

  cannon3d: {
    challenge: {
      prompt: 'Discover the horizontal launch speed that puts Newton’s cannonball into a steady circular orbit around Earth—neither crashing nor escaping.',
      check: (s) => {
        const v = s.num('Launch speed', 4.0);
        return v >= 7.8 && v <= 8.1;
      },
    },
    presets: [
      { name: 'Sub-orbital Arc', prompt: 'Slow throw falls back to Earth at 4.0 km/s.', state: { sliders: { 'Launch speed': 4.0 } } },
      { name: 'Elliptical Orbit', prompt: 'Launch at 9.5 km/s to stretch the orbit.', state: { sliders: { 'Launch speed': 9.5 } } },
    ],
    mentorTips: {
      openPlay: 'Fire once at low speed, once slightly faster, and ask why Earth’s curved surface changes the landing spot.',
      misconception: 'Believing astronauts float in orbit because Earth’s gravity suddenly switches off above the atmosphere.',
      dinnerQuestion: 'If gravity still pulls nearly 90% as strongly at ISS altitude as here in Mumbai, why doesn’t the space station crash into Earth?',
      cambridgeUnit: 'Unit 3 · Gravity & Orbital Free Fall',
    },
    yourNumbers: (s) => {
      const v = s.num('Launch speed', 4.0);
      const rOrbit = 6381; // km
      const aGrav = 3.986e14 / (6381e3 ** 2);
      const aCent = ((v * v) / rOrbit) * 1000;
      return `v₀ = ${v.toFixed(1)} km/s  |  v² ÷ r = ${aCent.toFixed(2)} m/s² vs gravity g(h) = ${aGrav.toFixed(2)} m/s² (circular at 7.9 km/s)`;
    },
    cutaway: 'Inside Newton’s gravitational field: gravity pulls toward Earth’s centre at every point; at 7.9 km/s the ground curves away by 4.9 m every second—matching the fall.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: At 4.0 km/s the cannonball arcs partway around the globe and lands.', act: (s) => { s.setSlider('Launch speed', 4.0); s.clickBtn('Fire'); } },
      { title: '2. Close-up', caption: '2/5 Close-up: At 7.9 km/s the ball falls continuously around the curving Earth in a circular orbit.', act: (s) => { s.setSlider('Launch speed', 7.9); s.clickBtn('Fire'); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Gravity never turns off in orbit—it is the inward centripetal force bending the path.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: At 9.5 km/s the orbit stretches into an ellipse; above 11.2 km/s it escapes.', act: (s) => { s.setSlider('Launch speed', 9.5); s.clickBtn('Fire'); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Drag the 3D globe and test any launch speed.', cutaway: false },
    ],
    idealised: 'Air is omitted even at the 10 km launch altitude. Reaching the 4.2 Earth-radius drawing horizon is a display limit; the sign of orbital energy decides bound motion or escape.',
  },

  tides: {
    challenge: {
      prompt: 'Advance the lunar month until the Moon and Sun pull at right angles, creating the smallest tidal range (a neap tide).',
      check: (s) => {
        const hrs = s.num('Time in lunar month', 0);
        const day = hrs / 24;
        return Math.abs(day - 7.4) <= 0.8 || Math.abs(day - 22.1) <= 0.8;
      },
    },
    presets: [
      { name: 'Spring Tide Alignment', prompt: 'New Moon alignment gives maximum combined bulge.', state: { sliders: { 'Time in lunar month': 0 } } },
      { name: 'Full Month Cycle', prompt: 'Check the Moon 14.8 days into the cycle.', state: { sliders: { 'Time in lunar month': 355 } } },
    ],
    mentorTips: {
      openPlay: 'Notice there are TWO water bulges on opposite sides of Earth before advancing time.',
      misconception: 'Thinking tides only happen on the side facing the Moon, ignoring the far-side differential bulge.',
      dinnerQuestion: 'Why does Mumbai get high tide twice every ~25 hours instead of only once when the Moon passes overhead?',
      cambridgeUnit: 'Unit 3 · Differential Gravity',
    },
    yourNumbers: (s) => {
      const hrs = s.num('Time in lunar month', 0);
      const day = hrs / 24;
      const phaseAngle = day * 12.19 * Math.PI / 180;
      const solar = /Sun’s bulges turned off/.test(s.readout()) ? 0 : 0.46;
      const relAmp = Math.sqrt(1 + solar*solar + 2*solar*Math.cos(2*phaseAngle));
      return `Day ${day.toFixed(1)} of 29.5  |  ΔF_tide ∝ M ÷ r³ (Sun = ${Math.round(solar*100)}% of Moon)  →  combined bulge = ${(relAmp * 100).toFixed(0)}% of lunar average`;
    },
    cutaway: 'Inside the tidal differential: the Moon pulls the near-side ocean ~3% harder than Earth’s rigid core, and the core ~3% harder than the far-side ocean, stretching water both ways.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: At new moon (Day 0), lunar and solar bulges align for high spring tides.', act: (s) => s.setSlider('Time in lunar month', 0) },
      { title: '2. Close-up', caption: '2/5 Close-up: Earth spins through both bulges every 24 h 50 min, giving two high tides a day.', act: (s) => s.setSlider('Time in lunar month', 12) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Why there is a bulge on the side opposite the Moon—differential gravity across Earth’s diameter.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: At quarter moon (Day 7.4), the Sun partly cancels the Moon’s bulge (neap tide).', act: (s) => s.setSlider('Time in lunar month', 178) },
      { title: '5. Your turn', caption: '5/5 Your turn: Scrub through the month or toggle the Sun’s 46% bulge.', cutaway: false },
    ],
    idealised: 'The Earth is drawn covered by a uniform deep ocean without continents or shallow coastal bays that amplify real tides.',
  },

  pressuretank: {
    challenge: {
      prompt: 'Switch to the densest liquid in the tray and fill the tank until gauge pressure slightly exceeds standard atmospheric pressure (101.3 kPa).',
      check: (s) => s.tab(0) === 2 && s.num('Depth of liquid', 1.0) >= 0.76 && s.num('Depth of liquid', 1.0) <= 0.90,
    },
    presets: [
      { name: 'Deep Fresh Water', prompt: '2.0 m water column to test Δp = ρgh.', state: { tabs: [0], sliders: { 'Depth of liquid': 2.0 } } },
      { name: 'Sea Water Column', prompt: 'Compare slightly denser salty sea water at 1.5 m.', state: { tabs: [1], sliders: { 'Depth of liquid': 1.5 } } },
    ],
    mentorTips: {
      openPlay: 'Compare water depth at 1.0 m vs 2.0 m first, then switch liquids.',
      misconception: 'Thinking wider tanks create higher pressure at the bottom than narrow columns of the same depth.',
      dinnerQuestion: 'Why did Torricelli only need a 76 cm column of mercury to balance 10 metres of water and the entire sky above Mumbai?',
      cambridgeUnit: 'Unit 3 · Pressure in Liquids & Gases',
    },
    yourNumbers: (s) => {
      const h = s.num('Depth of liquid', 1.0);
      const rhos = [1000, 1025, 13600];
      const rho = rhos[s.tab(0)] || 1000;
      const dpKpa = (rho * G * h) / 1000;
      return `Δp = ρgh/1000 = ${rho} × 9.8 × ${h.toFixed(1)} / 1000 = ${dpKpa.toFixed(1)} kPa  (+ 101.3 kPa air = ${(dpKpa + 101.3).toFixed(1)} kPa total)`;
    },
    cutaway: 'Inside the fluid column: every horizontal layer supports the weight of all the liquid and air stacked above it, pushing equally in all directions at that depth.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Pressure increases linearly with depth, regardless of the width of the tank.', act: (s) => { s.selectTab(0, 0); s.setSlider('Depth of liquid', 1.0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Doubling the water depth from 1.0 m to 2.0 m doubles the liquid gauge pressure.', act: (s) => s.setSlider('Depth of liquid', 2.0) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Molecular collisions transmit the weight of the overlying column in every direction.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Mercury is 13.6 times denser than water, so just 0.8 m produces over 100 kPa.', act: (s) => { s.selectTab(0, 2); s.setSlider('Depth of liquid', 0.8); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Compare liquids and toggle atmospheric pressure.', cutaway: false },
    ],
    idealised: 'The liquid is treated as strictly incompressible (constant density ρ at all depths).',
  },

  buoyancy: {
    challenge: {
      prompt: 'Test solid steel (7,800 kg/m³) in water so it sinks, then discover how reshaping the exact same mass into a hollow hull makes it float.',
      check: (s) => s.num('Block density', 600) >= 7000 && /floats/i.test(s.readout()),
    },
    presets: [
      { name: 'Floating Wood (600)', prompt: 'Notice how submerged percentage matches density ratio.', state: { tabs: [0], sliders: { 'Block density': 600 } } },
      { name: 'Sink Solid Iron', prompt: 'Drop solid steel into fresh water and inspect upthrust vs weight.', state: { tabs: [0], sliders: { 'Block density': 7800 } } },
      { name: 'Mystery ? Block', prompt: 'Measure displaced waterline and submerged fraction to deduce ? density.', state: { tabs: [0], custom: { mysteryMode: true, mysteryRevealed: false, liqIdx: 0, hollow: false } } },
    ],
    mentorTips: {
      openPlay: 'Ask Kym to predict what fraction of a 600 kg/m³ wood block sits underwater before running it.',
      misconception: 'Confusing material density with total mass when deciding why huge steel cargo ships float near Nhava Sheva.',
      dinnerQuestion: 'A steel nail sinks instantly in a bucket, yet a 50,000-ton steel ship floats effortlessly—what changed?',
      cambridgeUnit: 'Unit 3 · Density, Upthrust & Floating',
    },
    yourNumbers: (s) => {
      const fluid=[1000,1025,13600][s.tab(0)]||1000,rd=s.readout();
      if (/Mystery\s*\?\s*block/i.test(rd)) {
        return `Mystery ? block in liquid ρ = ${fluid} kg/m³: at calm floating equilibrium, ρ_block = ρ_fluid × (submerged fraction). Check the submerged % gauge!`;
      }
      const density=/\b650\s*kg\/m³/.test(rd)?650:s.num('Block density',920);
      const hollow=/Hollowed out:/.test(rd),effective=hollow?density/10:density,V=hollow?1:.1,mass=density*.1;
      const equilibrium=Math.min(100,100*effective/fluid);
      return `Same mass = ${mass.toFixed(1)} kg; W = ${(mass*9.8).toFixed(1)} N. Body volume = ${V.toFixed(1)} m³; ρ_avg = ${effective.toFixed(0)} kg/m³. ${effective>fluid?'Sinks; floor support supplies W − buoyancy.':`Floating equilibrium ≈ ${equilibrium.toFixed(1)}% submerged.`}`;
    },
    cutaway: 'Inside the pressure difference: water is deeper at the bottom face of the block than at the top face, so upward pressure force exceeds downward pressure force by ρ_liq V g.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: A wood block (600 kg/m³) floats with 60% of its volume below the waterline.', act: (s) => { s.selectTab(0, 0); s.setSlider('Block density', 600); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Solid steel (7,800 kg/m³) weighs more than an equal volume of water, so it sinks.', act: (s) => s.setSlider('Block density', 7800) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Upthrust comes from higher fluid pressure on the deeper bottom face of the hull.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Hollowing out the steel block lowers its average density below 1,000 kg/m³ so it floats like a ship.', act: (s) => s.clickBtn('Hollow') },
      { title: '5. Your turn', caption: '5/5 Your turn: Test any block density across fresh water, sea water, and mercury.', cutaway: false },
    ],
    idealised: 'Surface tension at the waterline and viscous water drag are simplified for clarity.',
  },

  energystores: {
    challenge: {
      prompt: 'Inspect the bouncing tennis ball and pause right at maximum compression at the bottom of the bounce where the elastic store peaks.',
      check: (s) => s.tab(0) === 0 && s.num('Transfer progress', 0) >= 1.35 && s.num('Transfer progress', 0) <= 1.65,
    },
    presets: [
      { name: 'Bounce Compression', prompt: 'Watch gravitational → kinetic → elastic store transfer.', state: { tabs: [0], sliders: { 'Transfer progress': 1.5 } } },
      { name: 'Solar Hydrogen Fusion', prompt: 'Contrast huge cosmic energy scales against daily mechanical stores.', state: { tabs: [3], sliders: { 'Transfer progress': 2.0 } } },
    ],
    mentorTips: {
      openPlay: 'Track whether the SUM of all glowing jars ever drops when transferring between stores.',
      misconception: 'Thinking energy "changes into work" as if work were a fifth jar rather than a pathway tube.',
      dinnerQuestion: 'At Sivaji Park cricket net practice, what happens to the bat’s energy a millisecond after hitting a six—where does every last joule end up?',
      cambridgeUnit: 'Unit 3 · Energy Stores & Pathways',
    },
    yourNumbers: (s) => {
      const p = Math.round((s.num('Transfer progress', 0) / 3) * 100);
      return `ΣE_stores = const  |  transfer = ${p}%  |  auto-scaled jar capacity ∈ {1, 2, 5} × 10ⁿ J`;
    },
    cutaway: 'Inside the pathway tubes: mechanical work is an ordered force push, electrical work is drift of electrons, heating is random molecular jiggling, and radiation is electromagnetic waves.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Energy sits in glowing hatched jars and pours through pathway tubes.', act: (s) => { s.selectTab(0, 0); s.setSlider('Transfer progress', 0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: At impact, gravitational and kinetic stores empty into the elastic jar and thermal jar.', act: (s) => s.setSlider('Transfer progress', 1.5) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Each store has a unique monochrome hatch and each pathway has its own flow shader.', cutaway: true, act: (s) => s.selectTab(0, 1) },
      { title: '4. Side-on trend', caption: '4/5 Trend: In one second of sunshine, the Sun’s nuclear jar (3.83 × 10²⁶ J) overflows any earthly scale.', act: (s) => { s.selectTab(0, 3); s.setSlider('Transfer progress', 2.2); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Scrub through all 4 scenarios or view all 8 hatched stores.', cutaway: false },
    ],
    idealised: 'Each jar groups microscopic kinetic and potential energies into a single macroscopic store label.',
  },

  energytrack: {
    challenge: {
      prompt: 'With friction set to 0.10, discover the lowest release height that still carries the marble cleanly over the 0.80 m bump.',
      check: (s) => Math.abs(s.num('Friction', 0) - 0.10) < 0.015 && Math.abs(s.num('Release height', 1.0) - 1.1) < 0.05,
    },
    presets: [
      { name: 'Frictionless Conservation', prompt: 'Zero friction at 1.0 m: watch PE and KE trade cleanly.', state: { tabs: [0, 0], sliders: { Friction: 0, 'Release height': 1.0 }, custom: { hRef: 0, gIdx: 0 } } },
      { name: 'Barely Clears the Bump', prompt: 'With μ = 0.10, test whether 1.0 m is enough or needs higher.', state: { tabs: [0, 2], sliders: { Friction: 0.10, 'Release height': 1.0 }, custom: { hRef: 0, gIdx: 0 } } },
      { name: 'Moon Gravity Drop', prompt: 'Compare speeds and total joules on the Moon (g = 1.6 m/s²).', state: { tabs: [0, 0], sliders: { Friction: 0, 'Release height': 1.2 }, custom: { hRef: 0, gIdx: 1 } } },
    ],
    mentorTips: {
      openPlay: 'Drag the marble directly on the track and turn on "Pie on bead" before adjusting friction.',
      misconception: 'Thinking a heavier steel marble rolls faster down the track than a lighter glass marble, or believing energy is "used up" by friction.',
      dinnerQuestion: 'If a roller coaster starts at 30 m high without an engine, can any later hill ever be 32 m high? What happens when friction warms the rails?',
      cambridgeUnit: 'Unit 3 · Conservation of Energy',
    },
    yourNumbers: (s) => {
      const h0 = s.num('Release height', 1.0);
      const mu = s.num('Friction', 0);
      const m = s.tab(0) === 1 ? 0.060 : 0.020;
      const g = [9.8, 1.6, 24.8][s.tab(2)] ?? 9.8;
      const eTot = m * g * h0;
      return `E_total = m g h₀ = ${m.toFixed(3)} × ${g.toFixed(1)} × ${h0.toFixed(2)} = ${eTot.toFixed(3)} J  |  E_p + E_k + E_therm = ${eTot.toFixed(3)} J (μ = ${mu.toFixed(2)})`;
    },
    cutaway: 'Inside the sliding bead and track: friction converts ordered motion into random lattice vibrations (thermal store) without changing the total joules.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Height store and motion store trade back and forth while the total bar never changes.', act: (s) => { s.setSlider('Friction', 0); s.setSlider('Release height', 1.0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Released from 0.7 m, the marble lacks the joules to reach the 0.8 m bump and slides back.', act: (s) => s.setSlider('Release height', 0.7) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Switching from bars to glowing hatched jars shows height, motion and warmth energy stores; friction transfers energy into internal motion.', cutaway: true, act: (s) => { s.selectTab(1, 1); s.setSlider('Release height', 1.2); } },
      { title: '4. Side-on trend', caption: '4/5 Trend: With friction on, each pass fills the warmth store until the marble settles in the dip.', act: (s) => s.setSlider('Friction', 0.10) },
      { title: '5. Your turn', caption: '5/5 Your turn: Solve the 0.80 m bump challenge with friction at 0.10.', cutaway: false, act: (s) => s.selectTab(1, 0) },
    ],
    idealised: 'The marble slides without rotational inertia (½Iω²), so all its motion energy is translational ½mv².',
  },

  conduction: {
    challenge: {
      prompt: 'Compare steel, wood, and aluminium with a 37 °C hand; every surface starts at the same 30 °C room temperature.',
      check: (s) => Math.abs(s.num('Hand temperature', 35) - 37) < 0.5 && s.tab(0) > 0,
    },
    presets: [
      { name: 'Steel Spoon', prompt: 'Steady metallic heat drain from fingertips.', state: { tabs: [0], sliders: { 'Hand temperature': 37 } } },
      { name: 'Teak Wood Bench', prompt: 'Surface heats rapidly and halts heat flow.', state: { tabs: [1], sliders: { 'Hand temperature': 37 } } },
    ],
    mentorTips: {
      openPlay: 'Ask Kym whether metal spoons in the kitchen are actually colder than wooden ladles on a 30 °C Mumbai counter.',
      misconception: 'Believing metals have an inherently lower temperature than insulators in the same room.',
      dinnerQuestion: 'Why does brass railing on the Bandra–Worli promenade feel cooler at dawn than a painted wooden bench right beside it?',
      cambridgeUnit: 'Unit 5 · Thermal Conduction & Rate',
    },
    yourNumbers: (s) => {
      const hand=s.num('Hand temperature',35),index=s.tab(0),k=[14,.12,220][index],name=['Steel','Wood','Aluminium'][index];
      return `${name}: k = ${k} W/(m·K). Initial ΔT = ${hand} − 30 = ${(hand-30).toFixed(1)} °C. The relative flow gauge changes as the contact layers warm.`;
    },
    cutaway: 'Mobile electrons help transfer energy in metals. Wood is a much poorer conductor. This lumped-layer model shows contact transfer without calibrating a material’s cooling time.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: All three surfaces start at 30 °C, cooler than the 35 °C hand.', act: (s) => { s.selectTab(0, 0); s.setSlider('Hand temperature', 35); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Touching steel transfers energy away from the warmer skin into the surface layers.', act: (s) => s.selectTab(0, 0) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Compare local energy transport through aluminium with wood; the sites themselves remain near their places.', cutaway: true, act: (s) => s.selectTab(0, 2) },
      { title: '4. Side-on trend', caption: '4/5 Trend: On wood, heat stays right at the surface so skin and wood quickly reach nearly the same temperature.', act: (s) => s.setSlider('Hand temperature', 37) },
      { title: '5. Your turn', caption: '5/5 Your turn: Switch materials and adjust hand temperature.', cutaway: false },
    ],
    idealised: 'Heat flow is modelled in one dimension along the bar without convective heat loss to the surrounding room air.',
  },

  ripple: {
    challenge: {
      prompt: 'Move from one dipping finger to two synchronised fingers dipping briskly—where do calm nodal corridors appear between oscillating crests?',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Rhythm', 0) - 2.0) <= 0.1,
    },
    presets: [
      { name: 'Single Circular Ripples', prompt: 'Measure λ spacing from one steady source.', state: { tabs: [0], sliders: { Rhythm: 1.5 } } },
      { name: 'Two-Finger Interference', prompt: 'Locate calm cancellation rays between two sources.', state: { tabs: [1], sliders: { Rhythm: 2.0 } } },
    ],
    mentorTips: {
      openPlay: 'Watch one bright float dot carefully—does it swim across the tank or bob up and down in place?',
      misconception: 'Assuming water moves outward across the tank together with the expanding wave crests.',
      dinnerQuestion: 'When two speedboats pass near Gateway of India, why do calm flat streaks cut diagonally across the choppy wake?',
      cambridgeUnit: 'Unit 6 · Wave Superposition & Ripples',
    },
    yourNumbers: (s) => {
      const f = s.num('Rhythm', 0);
      const v = 3; // cm/s at the deliberately slowed drawing clock
      const lam = f > 0 ? (v / f).toFixed(1) : 'pulse';
      return f > 0
        ? `Drawing speed v = f λ = 3.0 cm/s  |  f = ${f.toFixed(1)} Hz  →  λ = 3.0 ÷ ${f.toFixed(1)} = ${lam} cm`
        : `Single pulse: circular wavefronts expand at the slowed drawing speed v = 3.0 cm/s`;
    },
    cutaway: 'Inside the water surface: water parcels move in tiny vertical circles as the crest passes—the wave travels across the tank while the water stays in place.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: A single tap sends out circular ripples at constant wave speed.', act: (s) => { s.selectTab(0, 0); s.setSlider('Rhythm', 0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Steady dipping at 1.5 Hz spaces the circular crests one wavelength apart.', act: (s) => s.setSlider('Rhythm', 1.5) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Water molecules orbit locally in place while energy radiates outward.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Two fingers dipping in step create nodal lanes where crest meets trough.', act: (s) => { s.selectTab(0, 1); s.setSlider('Rhythm', 2.0); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Tap anywhere on the water tank or change the rhythm.', cutaway: false },
    ],
    idealised: 'The tank walls are non-reflecting so outgoing ripples are not muddied by echoes from the edges.',
  },

  scope: {
    challenge: {
      prompt: 'View waveform and frequency spectrum together, then hum a steady vowel or pluck a note—how does changing pitch move the frequency peaks?',
      check: (s) => s.tab(0) === 1,
    },
    presets: [
      { name: 'Waveform Trace', prompt: 'Inspect cycle period T in milliseconds.', state: { tabs: [0] } },
      { name: 'Waveform + FFT Spectrum', prompt: 'Separate pure tone peaks from rich overtones.', state: { tabs: [1] } },
    ],
    mentorTips: {
      openPlay: 'Hum softly then loudly at the same pitch—check what changes on the trace (height vs spacing).',
      misconception: 'Confusing louder volume (amplitude) with higher pitch (frequency) on a scope trace.',
      dinnerQuestion: 'Why does a tanpura string and a flute playing the exact same Sa (240 Hz) produce completely different shapes on an oscilloscope?',
      cambridgeUnit: 'Unit 6 · Sound Waveforms & Spectra',
    },
    yourNumbers: (s) => {
      const mode = s.tab(0) === 1 ? 'Time waveform + FFT spectrum' : 'Time waveform y(t)';
      return `f = 1 ÷ T  |  v_sound ≈ 343 m/s at 20 °C  |  view: ${mode}`;
    },
    cutaway: 'In a capacitive microphone, sound bends a flexible diaphragm and changes its capacitance; the electronics turn that change into a signal. The plot is an uncalibrated signal, not pressure in pascals.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: The oscilloscope plots relative microphone signal against time in milliseconds; the initial trace is a simulated reference tone.', act: (s) => s.selectTab(0, 0) },
      { title: '2. Close-up', caption: '2/5 Close-up: Higher pitch packs more wave cycles into the same millisecond window.' },
      { title: '3. Cut-away', caption: '3/5 Cut-away: How a condenser microphone converts air pressure ripples into voltage.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: The "Both" view separates a complex wave into its pure harmonic frequencies.', act: (s) => s.selectTab(0, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Freeze the trace or test your own voice with the microphone button.', cutaway: false },
    ],
    idealised: 'Without the microphone active, the scope displays a clean synthetic reference tone free of room background noise.',
  },

  harmonics: {
    challenge: {
      prompt: 'Enrich upper overtones and compare the plain circular drumhead with the loaded Tabla—why does the tabla’s note sing at a crisp musical pitch?',
      check: (s) => s.tab(0) === 2 && Math.abs(s.num('Upper overtones', 0.5) - 0.6) <= 0.12,
    },
    presets: [
      { name: 'Plain Circular Drum', prompt: 'Listen to non-integer membrane modes (1 : 1.59 : 2.14).', state: { tabs: [1], sliders: { 'Upper overtones': 0.5 } } },
      { name: 'Raman Tabla (Syahi)', prompt: 'Centre patch aligns modes into integer harmonics.', state: { tabs: [2], sliders: { 'Upper overtones': 0.6 } } },
    ],
    mentorTips: {
      openPlay: 'Compare the frequency ladder bars for Plain drum vs Tabla before turning up upper overtones.',
      misconception: 'Thinking any stretched drum automatically produces neat integer multiples like a violin string.',
      dinnerQuestion: 'Why does a tabla with its black central syahi spot sound pitched like a note, whereas a bass drum sounds like a thud?',
      cambridgeUnit: 'Unit 6 · Sound, Pitch & Harmonics',
    },
    yourNumbers: (s) => {
      const inst = ['String (1 : 2 : 3 : 4)', 'Plain drum (1 : 1.59 : 2.14)', 'Tabla with syahi (1 : 2 : 3)'][s.tab(0)] || 'String';
      const ov = Math.round(s.num('Upper overtones', 0.5) * 100);
      return `${s.tab(0) === 1 ? "Non-integer drum partial ratios" : "Idealised harmonic ratios f_n ≈ n f₀"}  |  ${inst}  |  overtone mix = ${ov}%`;
    },
    cutaway: 'Inside the tabla head: C. V. Raman showed that the iron-paste syahi mass-loads the centre of the membrane so its modes shift into integer harmonic ratios 1 : 2 : 3 : 4 : 5.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: A plucked string vibrates in standing-wave loops with ratios 1 : 2 : 3 : 4.', act: (s) => { s.selectTab(0, 0); s.setSlider('Upper overtones', 0.5); } },
      { title: '2. Close-up', caption: '2/5 Close-up: A plain circular drumhead has non-integer modes (1.59×, 2.14×), sounding like a thud.', act: (s) => s.selectTab(0, 1) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: How the black syahi patch on a tabla retunes the membrane modes into singing harmonics.', cutaway: true, act: (s) => s.selectTab(0, 2) },
      { title: '4. Side-on trend', caption: '4/5 Trend: Raising the overtone slider enriches the timbre without changing the fundamental pitch.', act: (s) => s.setSlider('Upper overtones', 0.6) },
      { title: '5. Your turn', caption: '5/5 Your turn: Compare String, Plain drum, and Tabla and tap Play to hear them.', cutaway: false },
    ],
    idealised: 'Six partials are summed. The small drum views illustrate mode families; a real loaded tabla needs a full membrane model and has many higher modes.',
  },

  doppler: {
    challenge: {
      prompt: 'Drive a fast express train past a station listener blowing a high brass horn—what changes between approach and recession, wave speed or wavefront spacing?',
      check: (s) => Math.abs(s.num('Train speed', 60) - 90) <= 5 && Math.abs(s.num('Horn note', 330) - 400) <= 10,
    },
    presets: [
      { name: 'Stationary Horn', prompt: 'At 0 km/h wavefront circles stay symmetric.', state: { sliders: { 'Train speed': 0, 'Horn note': 330 } } },
      { name: 'Mumbai Express 90 km/h', prompt: 'Observe bunched crests ahead and stretched crests behind.', state: { sliders: { 'Train speed': 90, 'Horn note': 400 } } },
    ],
    mentorTips: {
      openPlay: 'Watch the wavefront spacing ahead vs behind the engine as speed rises from 0.',
      misconception: 'Thinking the air pushes sound faster ahead of a train (actually wave speed c stays constant; wavelength λ bunches up).',
      dinnerQuestion: 'As a Western Line fast local races past Bandra platform blowing its horn, does the driver inside the cab hear the pitch drop too?',
      cambridgeUnit: 'Unit 6 · Sound Waves & Frequency',
    },
    yourNumbers: (s) => {
      const vKmh = s.num('Train speed', 60);
      const vS = vKmh / 3.6;
      const f0 = s.num('Horn note', 330);
      const c = 348.7;
      const fAhead = (f0 * c) / (c - vS);
      const fBehind = (f0 * c) / (c + vS);
      return `f_obs = f₀ × c ÷ (c ∓ v_s)  |  v_s = ${vS.toFixed(1)} m/s  →  ahead ${fAhead.toFixed(0)} Hz, behind ${fBehind.toFixed(0)} Hz (Δf = ${(fAhead - fBehind).toFixed(0)} Hz)`;
    },
    cutaway: 'Inside the wavefront bunching: each sound crest leaves the horn and expands at 348.7 m/s in 30 °C air, but the moving horn emits the next crest closer to the previous one.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: When the train stands still (0 km/h), sound circles are concentric and everyone hears the same pitch.', act: (s) => { s.setSlider('Train speed', 0); s.setSlider('Horn note', 330); } },
      { title: '2. Close-up', caption: '2/5 Close-up: At 60 km/h, crests bunch up ahead of the engine and stretch out behind it.', act: (s) => s.setSlider('Train speed', 60) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: The air itself does not speed up—only the spacing λ between successive crests changes.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: At 90 km/h with a 400 Hz horn, the far-approach to far-recession pitch change is about 58 Hz, or 2.5 semitones.', act: (s) => { s.setSlider('Train speed', 90); s.setSlider('Horn note', 400); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Adjust speed and horn frequency, or press Sound the horn.', cutaway: false },
    ],
    idealised: 'The listener stands close to the track so the cosine angle factor approaches ±1 except right at the moment of passing.',
  },

  mirror: {
    challenge: {
      prompt: 'Examine full-body reflection as you step farther back from the mirror—does stepping back reveal more of your body, or does a half-height mirror always work?',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Distance from mirror', 70) - 120) <= 5,
    },
    presets: [
      { name: 'Point Ray Diagram', prompt: 'See equal angles θ_i = θ_r from one object point.', state: { tabs: [0], sliders: { 'Distance from mirror': 70 } } },
      { name: 'Whole Body Half-Mirror', prompt: 'Compare standing close vs 120 cm back.', state: { tabs: [1], sliders: { 'Distance from mirror': 120 } } },
    ],
    mentorTips: {
      openPlay: 'Guess first whether walking back from the wardrobe mirror shows more or the exact same fraction of your body.',
      misconception: 'Believing stepping farther back from a flat wall mirror lets you see down to your shoes.',
      dinnerQuestion: 'How tall must a corridor wall mirror at home be for a 1.6 m person to see both hair and slippers at once?',
      cambridgeUnit: 'Unit 7 · Reflection & Plane Mirrors',
    },
    yourNumbers: (s) => {
      const d = s.num('Distance from mirror', 70);
      return `θ_i = θ_r  |  object distance d_o = ${d} cm = image distance d_i = ${d} cm behind glass (total separation = ${2 * d} cm)`;
    },
    cutaway: 'Inside the silvered glass: incoming photons reflect off the thin aluminium/silver backing at θ_i = θ_r; your visual cortex projects diverging rays straight backward to a virtual image.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Every ray from the object bounces off the mirror at an angle equal to its arrival angle.', act: (s) => { s.selectTab(0, 0); s.setSlider('Distance from mirror', 70); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Extended straight back behind the mirror, all reflected rays meet at one virtual image point.', act: (s) => s.setSlider('Distance from mirror', 100) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Why no light actually goes behind the wall—virtual rays are sightlines traced by your eye.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: In "Whole body" mode, similar triangles guarantee that a mirror half your height shows your full body at any distance.', act: (s) => { s.selectTab(0, 1); s.setSlider('Distance from mirror', 120); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Walk closer or farther and toggle the traced-back rays.', cutaway: false },
    ],
    idealised: 'The mirror is treated as a front-surface reflector, ignoring the weak second reflection from the front face of household glass.',
  },

  refraction: {
    challenge: {
      prompt: 'Choose the highest-index material, send light from material into air, and discover the steep angle where 100% of light traps inside (Total Internal Reflection).',
      check: (s) => s.tab(0) === 2 && s.num('Arriving angle', 35) >= 25 && /total internal reflection/i.test(s.readout()),
    },
    presets: [
      { name: 'Air into Water', prompt: 'Ray slows down and bends toward the normal.', state: { tabs: [0], sliders: { 'Arriving angle': 45 } } },
      { name: 'Glass Critical Threshold', prompt: 'Compare glass-to-air around 40–45°.', state: { tabs: [1], sliders: { 'Arriving angle': 42 } } },
    ],
    mentorTips: {
      openPlay: 'Always ask whether the ray bends toward or away from the 90° normal first.',
      misconception: 'Measuring angles from the flat surface instead of the normal line, or expecting TIR when entering from air into glass.',
      dinnerQuestion: 'Why does a diamond sparkle intensely while a piece of plain glass of the same cut looks dull?',
      cambridgeUnit: 'Unit 6 · Refraction & Critical Angle',
    },
    yourNumbers: (s) => {
      const th1 = s.num('Arriving angle', 35);
      const ns = [1.333, 1.52, 2.419];
      const nMat = ns[s.tab(0)] || 1.333;
      const intoAir = /^(Water|Glass|Diamond) to air/i.test(s.readout());
      const n1 = intoAir ? nMat : 1.000;
      const n2 = intoAir ? 1.000 : nMat;
      const sin2 = (n1 / n2) * Math.sin((th1 * Math.PI) / 180);
      if (sin2 > 1) {
        const crit = ((Math.asin(n2 / n1) * 180) / Math.PI).toFixed(1);
        return `n₁ sin θ₁ = ${n1.toFixed(3)} × sin(${th1}°) > 1.000  →  Total Internal Reflection! (θ_c = ${crit}°)`;
      }
      const th2 = ((Math.asin(sin2) * 180) / Math.PI).toFixed(1);
      return `n₁ sin θ₁ = n₂ sin θ₂  →  ${n1.toFixed(2)} sin(${th1}°) = ${n2.toFixed(2)} sin(${th2}°)` ;
    },
    cutaway: 'Inside the wavefront boundary: light slows down to c/n inside glass or diamond, so the edge of each wavefront that enters first falls behind and pivots the beam.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Light entering water (n = 1.333) slows down and bends toward the normal.', act: (s) => { s.selectTab(0, 0); s.setSlider('Arriving angle', 45); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Diamond (n = 2.419) slows light to 41% of c, bending the ray sharply.', act: (s) => s.selectTab(0, 2) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Wavefront crests march closer together in the slower medium, pivoting the ray direction.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Going from diamond into air above the 24.4° critical angle traps 100% of the light inside.', act: (s) => { s.clickBtn('Direction'); s.setSlider('Arriving angle', 30); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Explore angles, materials, and critical angles.', cutaway: false },
    ],
    idealised: 'The beam is monochromatic; real white light splits into a rainbow (dispersion) because n varies slightly with wavelength.',
  },

  eye3d: {
    challenge: {
      prompt: 'Examine a short-sighted eye focused on a far object, then test how spectacles restore a crisp focus on the retina.',
      check: (s) => s.tab(0) === 1 && s.tab(1) === 1 && s.num('Object distance', 50) >= 80,
    },
    presets: [
      { name: 'Short-Sighted Bare Eye', prompt: 'Distant focus lands cleanly in front of the retina.', state: { tabs: [1, 0], sliders: { 'Object distance': 90 } } },
      { name: 'Concave Spectacles Fix', prompt: 'Diverging lens shifts focal spot onto the retina.', state: { tabs: [1, 1], sliders: { 'Object distance': 90 } } },
    ],
    mentorTips: {
      openPlay: 'Try "Cover half pupil" first—predict whether half the picture vanishes or just dims.',
      misconception: 'Thinking covering half a lens blocks half the image instead of dimming the whole image uniformly.',
      dinnerQuestion: 'Why does squinting slightly—or peeking through a tiny pinhole between fingers—sharpen a blurred bus route number across Dadar circle?',
      cambridgeUnit: 'Unit 7 · Lenses & The Human Eye',
    },
    yourNumbers: (s) => {
      const v = s.num('Object distance', 50);
      const dCm = v >= 98 ? '∞' : Math.round(25 * Math.pow(400, v / 100));
      const eyeType = ['Ideal eye', 'Short-sighted (myopic)', 'Long-sighted (hyperopic)'][s.tab(0)] || 'Eye';
      return `1/f = 1/d_o + 1/d_i  |  d_o = ${dCm}${dCm === '∞' ? '' : ' cm'}, model retina = 2.00 cm behind the effective lens  |  ${eyeType}`;
    },
    cutaway: 'The cornea provides most of the bending. Ciliary muscles change the crystalline lens shape to adjust focus; this drawing combines both into one effective thin lens.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: An ideal eye adjusts its lens curvature so rays from any distance meet sharply on the retina.', act: (s) => { s.selectTab(0, 0); s.selectTab(1, 0); s.setSlider('Object distance', 50); } },
      { title: '2. Close-up', caption: '2/5 Close-up: In a short-sighted eye, distant rays converge in front of the retina, blurring the image.', act: (s) => { s.selectTab(0, 1); s.setSlider('Object distance', 90); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the eyeball, the ciliary muscle and crystalline lens reshape to focus.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: A diverging spectacle lens spreads incoming rays slightly so the eye’s lens lands them right on the retina.', act: (s) => s.selectTab(1, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Try "Cover half pupil" to see why the whole image stays complete but dimmer.', cutaway: false },
    ],
    idealised: 'The cornea and crystalline lens are combined into a single thin adjustable lens for ray-tracing clarity.',
  },

  interference: {
    challenge: {
      prompt: 'Switch to "Stripes on a screen" and find what wavelength and slit spacing produce the widest bright interference fringes.',
      check: (s) => s.tab(0) === 1 && s.num('Wavelength', 550) >= 620 && s.num('Source spacing', 0.4) <= 0.30,
    },
    presets: [
      { name: 'Green Narrow Fringes', prompt: '550 nm green light across 0.40 mm slits.', state: { tabs: [1], sliders: { Wavelength: 550, 'Source spacing': 0.4 } } },
      { name: 'Red Wide Fringes', prompt: 'Longer λ and tighter slit spacing stretch Δy.', state: { tabs: [1], sliders: { Wavelength: 660, 'Source spacing': 0.25 } } },
    ],
    mentorTips: {
      openPlay: 'Move ONLY Wavelength first, then ONLY Source spacing, watching Δy response.',
      misconception: 'Assuming bringing the two slits closer together makes the interference bands narrower rather than wider.',
      dinnerQuestion: 'Look closely through thin silk curtain folds at a distant Bandra streetlamp—why do coloured fringes spread perpendicular to the threads?',
      cambridgeUnit: 'Unit 7 · Double-Slit Interference',
    },
    yourNumbers: (s) => {
      const d = s.num('Source spacing', 0.4); // mm
      const lam = s.num('Wavelength', 550); // nm
      const L = 1.0; // m screen distance
      const dyMm = (lam * 1e-6 * L) / (d * 1e-3);
      return `Δy = λ L ÷ d = (${lam} nm × 1.0 m) ÷ ${d.toFixed(2)} mm = ${dyMm.toFixed(2)} mm between bright fringes`;
    },
    cutaway: 'Inside path difference Δr = d sin θ: where crests from both slits arrive in step (Δr = mλ) amplitudes add; where a crest meets a trough (Δr = (m+½)λ) they cancel to darkness.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Two coherent sources send overlapping waves whose crests and troughs add or cancel.', act: (s) => { s.selectTab(0, 0); s.setSlider('Source spacing', 0.4); s.setSlider('Wavelength', 550); } },
      { title: '2. Close-up', caption: '2/5 Close-up: On a distant screen, constructive lanes form evenly spaced bright bands.', act: (s) => s.selectTab(0, 1) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Light plus light makes darkness wherever the two paths differ by half a wavelength.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Longer red wavelength (650 nm) or closer slits (0.25 mm) spreads the fringes wider apart.', act: (s) => { s.setSlider('Wavelength', 650); s.setSlider('Source spacing', 0.25); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Sweep wavelength across the spectrum and watch fringe spacing respond.', cutaway: false },
    ],
    idealised: 'The slits are treated as infinitely narrow point sources, so the wide single-slit diffraction envelope does not dim the outer fringes.',
  },

  colourmix: {
    challenge: {
      prompt: 'In "Light on a white wall", discover which combination of the three spotlight beams creates pure additive Yellow light.',
      check: (s) => s.tab(0) === 0 && s.num('Red', 100) >= 95 && s.num('Green', 100) >= 95 && s.num('Blue', 100) <= 5,
    },
    presets: [
      { name: 'Full White Overlap', prompt: '100% Red + Green + Blue light makes white.', state: { tabs: [0], sliders: { Red: 100, Green: 100, Blue: 100 } } },
      { name: 'CMY Paint Filters', prompt: 'Switch to subtractive pigment filters.', state: { tabs: [1], sliders: { Red: 100, Green: 100, Blue: 0 } } },
    ],
    mentorTips: {
      openPlay: 'Ask Kym to turn off just ONE spotlight from white light and predict the overlap colour.',
      misconception: 'Assuming Red + Green light makes muddy brown because poster paints mix subtractively.',
      dinnerQuestion: 'Under pure red LED street light with zero green or blue wavelengths, what colour does a bright green leaf look?',
      cambridgeUnit: 'Unit 6 · Colour Addition & Filters',
    },
    yourNumbers: (s) => {
      const r = s.num('Red', 100), g = s.num('Green', 100), b = s.num('Blue', 100);
      const mode = ['Additive RGB light', 'Subtractive CMY pigment', 'Surface reflectance'][s.tab(0)] || 'RGB';
      return `${mode}: (${r}%, ${g}%, ${b}%)  →  idealised three-channel colour model`;
    },
    cutaway: 'The retina has three cone types with overlapping wavelength responses. Different spectra can produce similar response patterns and appear the same colour; this RGB display illustrates that principle rather than modelling cone sensitivities.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Adding Red, Green, and Blue spotlights on a dark wall makes white where all three overlap.', act: (s) => { s.selectTab(0, 0); s.setSlider('Red', 100); s.setSlider('Green', 100); s.setSlider('Blue', 100); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Turning Blue to 0% leaves Red + Green light, which your eyes see as bright Yellow.', act: (s) => s.setSlider('Blue', 0) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the retina’s L, M, and S cone photoreceptors.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Paints work by subtraction—each pigment steals wavelengths from white paper.', act: (s) => s.selectTab(0, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Test lights, paints, and coloured objects under coloured lamps.', cutaway: false },
    ],
    idealised: 'Screen sRGB primaries approximate monochromatic spectral lights and idealised block-filter pigments.',
  },

  skycolour: {
    challenge: {
      prompt: 'Lower the Sun close to the horizon on Earth and explain why the setting Sun turns orange-red while the overhead sky stays blue.',
      check: (s) => s.tab(0) === 0 && s.num('Sun height', 45) <= 4,
    },
    presets: [
      { name: 'Midday Blue Zenith', prompt: 'Short blue wavelengths scatter down to your eye.', state: { tabs: [0], sliders: { 'Sun height': 60 } } },
      { name: 'Chowpatty Sunset (2°)', prompt: 'Long air mass strips blue light out of the direct Sun.', state: { tabs: [0], sliders: { 'Sun height': 2 } } },
    ],
    mentorTips: {
      openPlay: 'Toggle "The Moon (no air)" at noon to see why air molecules create the blue vault.',
      misconception: 'Thinking Earth’s oceans reflect blue upward into the sky or that air turns blue only when polluted.',
      dinnerQuestion: 'At Worli Sea Face sunset, why is the western horizon glowing fiery amber while someone glancing straight overhead still sees slate-blue sky?',
      cambridgeUnit: 'Unit 7 · Scattering & Atmospheric Light',
    },
    yourNumbers: (s) => {
      const el = s.num('Sun height', 45);
      if (s.tab(0) === 2) return 'No atmosphere on the Moon → no molecular scattering or scattered blue sky';
      const k = 750, sine = Math.max(-0.04, Math.sin(el * Math.PI / 180));
      const airMass = Math.sqrt(k*k*sine*sine+2*k+1)-k*sine;
      return `I_scat ∝ 1 ÷ λ⁴  |  blue 450 nm scatters 5.86× more than red 700 nm  |  Sun ${el}° → curved-air path ≈ ${airMass.toFixed(1)}× zenith`;
    },
    cutaway: 'Inside Rayleigh scattering: N₂ and O₂ molecules (0.3 nm wide) are much smaller than light wavelengths, oscillating like tiny dipole antennas that radiate strongly as 1/λ⁴.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: With the Sun high overhead, short blue wavelengths scatter across the sky into your eyes.', act: (s) => { s.selectTab(0, 0); s.setSlider('Sun height', 60); } },
      { title: '2. Close-up', caption: '2/5 Close-up: At 2°, this curved-air model gives about 20.6 times the zenith path. More blue and green are scattered out of the direct beam.', act: (s) => s.setSlider('Sun height', 2) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: In this model, 450 nm blue light scatters 5.86 times as strongly as 700 nm red light.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: On the airless Moon, no scattering occurs—the sky is pitch black even at noon.', act: (s) => { s.selectTab(0, 2); s.setSlider('Sun height', 45); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Sweep the Sun from noon to sunset across Earth, thin air, and the Moon.', cutaway: false },
    ],
    idealised: 'Only Rayleigh molecular scattering (1/λ⁴) is calculated; larger dust and water droplets add whiter Mie scattering near the horizon.',
  },

  circuit: {
    challenge: {
      prompt: 'Power 3 series LEDs from a 9.0 V battery and determine both the shared loop current and the voltage left across the 330 Ω resistor.',
      check: (s) => Math.abs(s.num('Battery', 9) - 9) < 0.2 && s.tab(0) === 2,
    },
    presets: [
      { name: 'Below LED Threshold', prompt: '6.0 V across four 2 V LEDs cannot turn them on.', state: { tabs: [3, 0], sliders: { Battery: 6.0 } } },
      { name: 'Energy-per-Coulomb Steps', prompt: 'Inspect potential height around a 9 V, 3-LED loop.', state: { tabs: [2, 1], sliders: { Battery: 9.0 } } },
      { name: 'Rope Analogy', prompt: 'Compare electrical loop to a continuous pulled rope.', state: { tabs: [1, 2], sliders: { Battery: 9.0 } } },
    ],
    mentorTips: {
      openPlay: 'Ask Kym to compare the current counters at A, B, and C before touching any numbers.',
      misconception: 'Thinking current gets "used up" as it passes through the resistor and LEDs (so C would read less than A).',
      dinnerQuestion: 'When you switch on a bedroom lamp in Mumbai, why does it light instantly even though electrons drift slower than a snail?',
      cambridgeUnit: 'Unit 9 · Electric Current & Voltage',
    },
    yourNumbers: (s) => {
      const vBat = s.num('Battery', 9), nLeds = s.tab(0) + 1;
      const iAmp = Math.max(0, (vBat - 2 * nLeds) / 330);
      return iAmp > 0
        ? `I = (${vBat.toFixed(1)} − ${2*nLeds}) V ÷ 330 Ω = ${(1000*iAmp).toFixed(1)} mA  |  each LED ≈ 2 V; resistor = ${(330*iAmp).toFixed(1)} V`
        : `${vBat.toFixed(1)} V ≤ ${2*nLeds} V threshold: I = 0 in this model; individual LED voltages are not resolved.`;
    },
    cutaway: 'The wire already contains mobile charge. A change in the electric field spreads around the circuit; carriers do not travel from the battery to fill an empty wire. When current flows, each coulomb transfers about 2 J at each LED and the remaining energy at the resistor.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Existing charge circulates around a closed loop; the same current crosses A, B and C.', act: (s) => { s.selectTab(0, 0); s.selectTab(1, 0); s.setSlider('Battery', 9); } },
      { title: '2. Close-up', caption: '2/5 Close-up: The battery raises energy per coulomb; the resistor and LEDs transfer it to their surroundings.', act: (s) => s.selectTab(1, 1) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Charge is conserved; energy is transferred at the circuit components.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: At 9 V, three 2 V LEDs leave 3 V across 330 Ω, giving about 9.1 mA.', act: (s) => { s.setSlider('Battery', 9); s.selectTab(0, 2); s.selectTab(1, 1); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Lower the supply below the combined LED threshold and compare the whole-loop current.', cutaway: false },
    ],
    idealised: 'Each conducting red LED is approximated by a 2 V drop and a 330 Ω resistor limits the current. Below the combined threshold the model gives zero current and does not resolve individual LED voltages; real LED curves are gradual.',
  },

  seriesparallel: {
    challenge: {
      prompt: 'Wire 3 LEDs in parallel and unclip LED 1—discover why the remaining branches keep full brightness while total battery current drops.',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('LEDs', 2) - 3) < 0.2 && /^Parallel with LED 1 unclipped:/i.test(s.readout()),
    },
    presets: [
      { name: 'Dim Series Chain', prompt: '3 LEDs sharing one 9 V loop.', state: { tabs: [0], sliders: { LEDs: 3 }, custom: { unclipped: false } } },
      { name: '3 Parallel Branches', prompt: 'Each branch gets the full 9 V across the battery.', state: { tabs: [1], sliders: { LEDs: 3 }, custom: { unclipped: false } } },
      { name: 'Schematic Diagram', prompt: 'Switch to Cambridge IEC circuit symbols.', state: { tabs: [1], sliders: { LEDs: 2 }, custom: { schematic: true, unclipped: false } } },
    ],
    mentorTips: {
      openPlay: 'Tap LED 1 directly on the canvas in both Series and Parallel modes to see what breaks.',
      misconception: 'Thinking a battery always outputs a fixed current regardless of how many parallel branches are connected.',
      dinnerQuestion: 'Why do all rooms in our apartment stay bright when one ceiling fan or bulb is switched off—are they wired in series or parallel?',
      cambridgeUnit: 'Unit 9 · Series & Parallel Circuits',
    },
    yourNumbers: (s) => {
      const n = s.num('LEDs', 2);
      const par = s.tab(0) === 1;
      const open = /^(0 mA everywhere|Parallel with LED 1 unclipped)/.test(s.readout());
      if (par) {
        const active = n - (open ? 1 : 0), branchMa = 1000*(9-2)/330;
        return `Parallel: 9 V per branch = 2 V LED + 7 V resistor  |  ${active} connected branches × ${branchMa.toFixed(1)} mA = ${(active*branchMa).toFixed(1)} mA from battery`;
      }
      const currentMa = open ? 0 : 1000*Math.max(0,9-2*n)/330;
      return `Series: 9 V = ${n} × 2 V LED + ${(9-2*n).toFixed(0)} V resistor  |  loop current ${currentMa.toFixed(1)} mA${open ? ' (open circuit)' : ''}`;
    },
    cutaway: 'Inside the parallel junction node: Kirchhoff’s current law (I_in = I_1 + I_2 + I_3) splits the charge stream into independent lanes, each connected across the full battery voltage.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: In series, one single loop carries the same reduced current through every lamp.', act: (s) => { s.selectTab(0, 0); s.setSlider('LEDs', 3); } },
      { title: '2. Close-up', caption: '2/5 Close-up: In parallel, each lamp gets its own direct lane across the battery and shines at full brightness.', act: (s) => s.selectTab(0, 1) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: At the branch junction, current adds up while voltage stays equal across each rung.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Unclipping one lamp breaks a series loop completely, but leaves the other parallel branches running.', act: (s) => s.clickBtn('Unclip') },
      { title: '5. Your turn', caption: '5/5 Your turn: Compare 1, 2, or 3 lamps in series and parallel.', cutaway: false },
    ],
    idealised: 'The battery has zero internal resistance, so adding parallel branches never makes the battery terminal voltage sag.',
  },

  field3d: {
    challenge: {
      prompt: 'Test a strong 2.5 A current in the coil-and-magnet view, then reverse the current to see how the electromagnet poles flip.',
      check: (s) => s.tab(0) === 1 && s.num('Current', 1.5) >= 2.4,
    },
    presets: [
      { name: 'Straight Wire Ørsted', prompt: 'Circular magnetic field lines around a straight current.', state: { tabs: [0], sliders: { Current: 2.0 } } },
      { name: 'Strong Solenoid 2.5 A', prompt: 'Wound coil dipole interacting with bar magnet.', state: { tabs: [1], sliders: { Current: 2.5 } } },
    ],
    mentorTips: {
      openPlay: 'Orbit the 3D coil and watch the compass needle before flipping current direction.',
      misconception: 'Thinking a copper wire needs iron inside it to create any magnetic field at all.',
      dinnerQuestion: 'Why do junkyard crane electromagnets drop scrap steel the instant power turns off, instead of staying permanently magnetised?',
      cambridgeUnit: 'Unit 9 · Electromagnets & Magnetic Fields',
    },
    yourNumbers: (s) => {
      const I = s.num('Current', 1.5);
      const mode = s.tab(0) === 1 ? 'Coil: schematic dipole field ∝ I; bar magnet stays fixed' : 'Straight wire B = μ₀ I ÷ (2π r)';
      return `${mode}  |  I = ${I.toFixed(1)} A  →  field strength B ∝ ${I.toFixed(1)} A (right-hand grip rule)`;
    },
    cutaway: 'Inside the solenoid coil: circular magnetic field loops around each turn add together down the central tunnel to form a uniform North–South bar-magnet field.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Current in a straight wire wraps magnetic field rings around the conductor (Ørsted’s discovery).', act: (s) => { s.selectTab(0, 0); s.setSlider('Current', 1.5); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Winding the wire into a coil stacks those rings into a strong electromagnet.', act: (s) => { s.selectTab(0, 1); s.setSlider('Current', 2.5); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the coil core, magnetic field lines run continuously from South to North.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Reversing current reverses the wire field. Against Earth’s field, the compass swings to the other side of north, not generally through 180°.', act: (s) => s.clickBtn('Reverse') },
      { title: '5. Your turn', caption: '5/5 Your turn: Rotate the 3D field and test any current from 0 to 3.0 A.', cutaway: false },
    ],
    idealised: 'The wire calculation uses vacuum permeability μ₀. Its separate compass view includes Mumbai’s 38.4 μT horizontal background; the coil/magnet field shapes are schematic dipoles.',
  },

  magnetometer: {
    challenge: {
      prompt: 'Explore the 3-axis magnetic readout or click "Hold" to freeze a reading in microteslas (μT).',
      check: (s) => s.interacted || s.watched,
    },
    presets: [
      { name: 'Earth Field Baseline', prompt: 'Inspect geomagnetic B_x, B_y, B_z magnitude (~43 μT).', state: { tabs: [] } },
    ],
    mentorTips: {
      openPlay: 'Rotate the phone/sensor smoothly and notice |B| stays near ~43 μT even while components swap signs.',
      misconception: 'Confusing the vertical/horizontal axis projection with a change in Earth’s actual magnetic strength.',
      dinnerQuestion: 'Why does a navigation compass work inside an open Mumbai ferry deck yet spin unpredictably near iron train girders?',
      cambridgeUnit: 'Unit 8 · Magnetic Fields & Sensors',
    },
    yourNumbers: () => {
      return `|B| = √(B_x² + B_y² + B_z²)  |  Earth’s field ≈ 25–65 μT (≈ 43 μT in Mumbai)`;
    },
    cutaway: 'One possible chip design uses the Hall effect: moving charges are deflected sideways by a magnetic field, producing a voltage. Other phone chips use magnetoresistive materials; the displayed axes do not identify the chip design.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Even far from any fridge magnet, a magnetometer reads Earth’s ~43 μT background field.' },
      { title: '2. Close-up', caption: '2/5 Close-up: A small magnet’s far field falls approximately as 1/r³; a long straight current-carrying wire instead gives B ∝ 1/r.' },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Three sensor axes measure B_x, B_y and B_z; keep the screen flat before interpreting the screen-normal component as vertical.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Flipping the magnet reverses the sign of the component along the sensor axis.' },
      { title: '5. Your turn', caption: '5/5 Your turn: Use a device magnetometer or inspect the reference reading.', cutaway: false },
    ],
    idealised: 'Phone calibration varies. Internal magnets, nearby steel and sensor offsets can shift the readings; this display does not guarantee hard-iron correction or world-coordinate orientation.',
  },

  induction: {
    challenge: {
      prompt: 'Maximise the coil turns and move the magnet rapidly through the coil to discover what produces the largest induced voltage spike.',
      check: (s) => s.num('Turns', 1) >= 2 && (s.interacted || s.watched),
    },
    presets: [
      { name: 'Stationary Magnet', prompt: 'Strong magnet sitting still inside coil produces 0 V.', state: { sliders: { Turns: 2 } } },
      { name: '200-Turn Dynamo Coil', prompt: 'Maximum coil turns ready for rapid flux change.', state: { sliders: { Turns: 3 } } },
    ],
    mentorTips: {
      openPlay: 'Park the magnet completely inside the coil first—ask why the voltmeter drops right back to zero!',
      misconception: 'Thinking a strong magnet sitting inside a coil generates continuous steady electricity.',
      dinnerQuestion: 'What actually turns inside a wind turbine or hydroelectric generator at Koyna to keep electricity flowing?',
      cambridgeUnit: 'Unit 9 · Electromagnetic Induction',
    },
    yourNumbers: (s) => {
      const idx = s.num('Turns', 1);
      const N = [1, 10, 50, 200][idx] || 50;
      return `ε = −N × ΔΦ_B ÷ Δt  |  N = ${N} turns  →  stationary magnet gives ΔΦ_B/Δt = 0 V`;
    },
    cutaway: 'Inside Faraday’s law: a changing magnetic flux Φ_B through the coil curls an electric field around the copper loops, pushing conduction electrons only while the magnet moves.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: A magnet sitting still inside the coil produces zero voltage, no matter how strong it is.', act: (s) => s.setSlider('Turns', 1) },
      { title: '2. Close-up', caption: '2/5 Close-up: Plunging the magnet in or pulling it out deflects the galvanometer in opposite directions.', act: (s) => s.clickBtn('Nudge') },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Only changing magnetic flux (ΔΦ_B/Δt) drives an induced current.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Increasing the number of coil turns multiplies the induced voltage spike.', act: (s) => { s.setSlider('Turns', 3); s.clickBtn('Nudge'); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Drag the magnet fast or slow and flip N ↔ S.', cutaway: false },
    ],
    idealised: 'Self-inductance of the coil is neglected so current follows the induced EMF instantaneously.',
  },

  shadow: {
    challenge: {
      prompt: 'Match Eratosthenes’ Syene–Alexandria solstice meridian separation and shallow shadow tilt to estimate Earth’s full circumference from parallel sunbeams!',
      check: (s) => Math.abs(s.num('Distance', 5000) - 5000) <= 250 && Math.abs(s.num('Shadow angle', 7.2) - 7.2) <= 0.3,
    },
    presets: [
      { name: 'Eratosthenes 7.2° Setup', prompt: '1/50th of a circle × 5,000 stadia gives ~40,000 km.', state: { tabs: [1], sliders: { Distance: 5000, 'Shadow angle': 7.2 } } },
      { name: 'Steep Shadow Check', prompt: 'Larger angle for the same road implies a tinier globe.', state: { tabs: [1], sliders: { Distance: 5000, 'Shadow angle': 18 } } },
    ],
    mentorTips: {
      openPlay: 'Notice BOTH parallel Sun beams must stay parallel for the shadow angle to match the central Earth angle.',
      misconception: 'Thinking a stick shadow only changes length if Earth were tiny and the Sun sat right above Egypt.',
      dinnerQuestion: 'If Eratosthenes had lived between Mumbai and Ahmedabad (~450 km north–south), about what noon shadow difference would solstice sticks cast?',
      cambridgeUnit: 'Unit 1 · Measuring Planet Earth',
    },
    yourNumbers: (s) => {
      const d = s.num('Distance', 5000);
      const th = s.num('Shadow angle', 7.2);
      const frac = 360 / Math.max(0.5, th);
      const circStadia = Math.round(d * frac);
      const stadiaM = [192, 1000/6, 160, null][s.tab(0)];
      if (stadiaM === null) return `C = ${circStadia.toLocaleString('en-GB')} stadia; kilometres require a known stadion length.`;
      const circKm = Math.round((circStadia * stadiaM) / 1000);
      return `C = (360° ÷ θ) × d = (360° ÷ ${th.toFixed(1)}°) × ${d} stadia ≈ ${circKm.toLocaleString('en-GB')} km (true Earth: 40,008 km)`;
    },
    cutaway: 'Inside the alternate-interior geometry: because the Sun is 150 million km away, its rays arrive parallel; the stick’s shadow angle at Alexandria equals the angle between the two cities at Earth’s centre.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: At noon on the solstice, a vertical well at Syene has no shadow while Alexandria casts a 7.2° shadow.', act: (s) => { s.setSlider('Distance', 5000); s.setSlider('Shadow angle', 7.2); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Parallel sunbeams mean the 7.2° shadow angle equals the central angle between the two cities.' },
      { title: '3. Cut-away', caption: '3/5 Cut-away: 7.2° is exactly 1/50th of a full 360° circle, so Earth’s circumference is 50 × the distance.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Compare 192 m, about 166.7 m and 160 m stadia; an unknown stadion length cannot determine kilometres.', act: (s) => s.selectTab(0, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Adjust distance and shadow angle to measure the planet.', cutaway: false },
    ],
    idealised: 'Syene and Alexandria are treated as lying on the exact same north–south meridian (in reality they differ by ~3° of longitude).',
  },

  seasons: {
    challenge: {
      prompt: 'Follow noon sunlight at the June solstice across Mumbai, the Equator, the Tropic of Cancer, and higher northern latitudes—what steers summer warmth, Sun altitude or distance?',
      check: (s) => Math.abs(s.num('Date', 172) - 172) <= 15 && s.tab(0) > 0,
    },
    presets: [
      { name: 'Mumbai Solstice (19° N)', prompt: 'Compare June overhead beam vs Dec angle.', state: { tabs: [0], sliders: { Date: 172 } } },
      { name: 'December Paris Tilt', prompt: 'Low winter Sun spreads photons wider.', state: { tabs: [3], sliders: { Date: 355 } } },
    ],
    mentorTips: {
      openPlay: 'Ask Kym whether Earth is actually closest to the Sun in June or January (surprise: January!).',
      misconception: 'Believing summer happens because Earth orbits closer to the Sun in June.',
      dinnerQuestion: 'In late May before Mumbai clouds arrive, why does the Sun pass almost straight overhead near Gateway of India around noon?',
      cambridgeUnit: 'Unit 2 · Earth’s Axial Tilt & Seasons',
    },
    yourNumbers: (s) => {
      const torch = /^Tilted (\d+)/.exec(s.readout());
      if (torch) {
        const tilt = +torch[1], area = 1/Math.cos(tilt*Math.PI/180);
        return `Torch ${tilt}° from vertical → footprint ${area.toFixed(2)}× the area; ${(100/area).toFixed(0)}% light per square metre`;
      }
      const day = s.num('Date', 172);
      const decl = -23.44 * Math.cos(2*Math.PI*(day+10)/365);
      const lat = [19.08,0,23.44,48.85][s.tab(0)] ?? 19.08;
      const noonAlt = 90-Math.abs(lat-decl), share = Math.sin(noonAlt*Math.PI/180);
      return `Latitude ${lat.toFixed(2)}° N  |  δ_Sun = ${decl.toFixed(1)}°  |  noon altitude ${noonAlt.toFixed(1)}° → ${(100*share).toFixed(0)}% of overhead energy per m²`;
    },
    cutaway: 'Inside the tilted beam: a 1 m² bundle of sunlight hitting the ground at 30° spreads over 1/sin(30°) = 2.0 m², halving the watts warming each square metre.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Earth’s 23.4° axis keeps pointing toward Polaris all year as the planet orbits the Sun.', act: (s) => { s.selectTab(0, 0); s.setSlider('Date', 172); } },
      { title: '2. Close-up', caption: '2/5 Close-up: In June the northern hemisphere leans toward the Sun, making noon sunlight steep and concentrated.', act: (s) => s.selectTab(0, 1) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Why beam angle—not Earth’s tiny 3% orbital distance change—drives summer and winter.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: In December (day 355), Paris has a lower noon Sun than Mumbai. Compare the wider footprint and shorter daylight.', act: (s) => { s.selectTab(0, 3); s.setSlider('Date', 355); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Scrub through the year or try the torch-on-graph-paper view.', cutaway: false },
    ],
    idealised: 'Atmospheric absorption and seasonal thermal lag of the oceans (which delays peak summer temperatures by ~4 weeks) are omitted.',
  },

  phases: {
    challenge: {
      prompt: 'Switch to "From Mumbai" and advance the lunar cycle until the Moon’s near face appears completely illuminated (Full Moon).',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Day of the month', 4) - 14.8) <= 1.2,
    },
    presets: [
      { name: 'First Quarter Half-Moon', prompt: 'Orbit at 90° gives a half-lit disc.', state: { tabs: [0], sliders: { 'Day of the month': 7.4 } } },
      { name: 'Mumbai Crescent View', prompt: 'See a waxing crescent from Earth’s surface.', state: { tabs: [1], sliders: { 'Day of the month': 4.0 } } },
    ],
    mentorTips: {
      openPlay: 'Notice from above space that 50% of the Moon is ALWAYS sunlit—even at New Moon!',
      misconception: 'Believing crescent or half moons are caused by Earth’s shadow blocking the Sun (eclipses vs phases).',
      dinnerQuestion: 'On a First Quarter afternoon when you spot a crisp half-moon in the Mumbai sky, where is the Sun relative to the Moon?',
      cambridgeUnit: 'Unit 3 · Earth, Moon & Space Geometry',
    },
    yourNumbers: (s) => {
      const day = s.num('Day of the month', 4);
      const angle = (day / 29.5) * 2 * Math.PI;
      const litPct = Math.round(((1 - Math.cos(angle)) / 2) * 100);
      return `Day ${day.toFixed(1)} of 29.5  |  orbital phase angle φ = ${Math.round((angle * 180) / Math.PI)}°  →  earth-facing lit fraction = ½(1 − cos φ) = ${litPct}%`;
    },
    cutaway: 'Inside the geometry of phases: the Sun always illuminates 50% of the lunar sphere; phases are simply how much of that sunlit hemisphere faces Earth as the Moon orbits.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Seen from above the orbit, half the Moon is always sunlit—Earth’s shadow is nowhere near it.', act: (s) => { s.selectTab(0, 0); s.setSlider('Day of the month', 4.0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: At Day 7.4 (First Quarter), we look side-on at the terminator and see a half-moon.', act: (s) => s.setSlider('Day of the month', 7.5) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Compare the Moon’s sunlit hemisphere with its Earth-facing phase. Real orbital inclination prevents most full moons becoming eclipses; inclination is not simulated here.', cutaway: true, act: (s) => s.setSlider('Day of the month', 14.8) },
      { title: '4. Side-on trend', caption: '4/5 Trend: Switching to "From Mumbai" shows the waxing and waning crescent views from the ground.', act: (s) => s.selectTab(0, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Scrub through all 29.5 days and toggle true scale.', cutaway: false },
    ],
    idealised: 'The lunar orbit is circular and coplanar in this illustration. Orbital inclination, eclipse dates and libration are omitted.',
  },

  parallax: {
    challenge: {
      prompt: 'Look through the telescope across a 6-month Earth baseline (January to July) to measure the star’s apparent annual wobble.',
      check: (s) => s.tab(0) === 1 && s.num('Month', 0) >= 5.0 && s.num('Month', 0) <= 7.0,
    },
    presets: [
      { name: 'Nearby Star (1.6 pc)', prompt: 'Clear half-year shift p across Earth’s 2 AU orbit.', state: { tabs: [1], sliders: { 'Star distance': 10, Month: 6.0 } } },
      { name: 'Distant Star (10 pc)', prompt: 'Smaller wobble means greater distance d = 1/p.', state: { tabs: [1], sliders: { 'Star distance': 50, Month: 6.0 } } },
    ],
    mentorTips: {
      openPlay: 'Hold a thumb at arm’s length and wink left–right eyes before dragging Month from Jan to Jul.',
      misconception: 'Thinking parallax happens because the star physically moves back and forth every six months.',
      dinnerQuestion: 'Why did ancient Greek astronomers fail to see nearby stars wobble, even though Earth actually orbits 300 million km side to side?',
      cambridgeUnit: 'Unit 9 · Stellar Distances & Parallax',
    },
    yourNumbers: (s) => {
      const v = s.num('Star distance', 20);
      const dPc = Math.pow(10, v / 50);
      const pArcsec = 1 / dPc;
      return `d (parsecs) = 1 ÷ p (arcsec)  |  January ↔ July = 2 AU and shift 2p; p is the half-shift  →  p = ${pArcsec.toFixed(3)}″, d = ${dPc.toFixed(1)} pc (${(dPc * 3.26).toFixed(1)} ly)`;
    },
    cutaway: 'Inside the 1 AU triangle: 1 parsec is the distance where Earth’s 150-million-km orbital radius subtends an angle of 1 arcsecond (1/3,600 of a degree, the width of a rupee coin at 5 km).',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: As Earth moves from January to July, our sightline to a nearby star tilts against distant background stars.', act: (s) => { s.selectTab(0, 0); s.setSlider('Month', 0); s.setSlider('Star distance', 10); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Six months later (July), Earth is 300 million km to the other side, shifting the star’s apparent position.', act: (s) => s.setSlider('Month', 6.0) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: How a tiny parallax angle p in arcseconds gives distance d = 1/p parsecs by pure trigonometry.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Through the telescope, moving the star farther away shrinks its annual wobble.', act: (s) => { s.selectTab(0, 1); s.setSlider('Star distance', 50); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Switch telescope view and sweep between January and July.', cutaway: false },
    ],
    idealised: 'The overhead triangle exaggerates angles. The telescope view uses its labelled 1.0 arcsecond scale bar; the circular annual trace applies near an orbital pole.',
  },

  expansion: {
    challenge: {
      prompt: 'Move your observer perch to an outer galaxy and stretch space significantly—does Hubble’s linear expansion law still look centred around you?',
      check: (s) => s.tab(0) === 2 && Math.abs(s.num('Stretch factor', 1.0) - 2.0) <= 0.08,
    },
    presets: [
      { name: 'Central Galaxy View', prompt: 'Twice as far recedes twice as fast from 7 cm.', state: { tabs: [1], sliders: { 'Stretch factor': 2.0 } } },
      { name: 'Outer Ant Frame', prompt: 'Switch origin to 12 cm—identical Hubble slope.', state: { tabs: [2], sliders: { 'Stretch factor': 2.0 } } },
    ],
    mentorTips: {
      openPlay: 'Notice EVERY dot appears to flee the ant you pick, proving there is no centre of expansion.',
      misconception: 'Imagining the Big Bang as an explosion flying from one spot inside empty space.',
      dinnerQuestion: 'When raisin bread rises evenly in a Colaba bakery oven, which raisin sees its neighbours moving away slowest—central ones or every raisin equally?',
      cambridgeUnit: 'Unit 9 · Expanding Universe & Redshift',
    },
    yourNumbers: (s) => {
      const scale = s.num('Stretch factor', 1.0);
      const home = [2, 7, 12][s.tab(0)] || 7;
      return `v = H₀ d  |  stretch factor s = ×${scale.toFixed(2)} (home ant at ${home} cm)  →  every distance d₀ becomes ${scale.toFixed(2)} × d₀`;
    },
    cutaway: 'Inside metric expansion: galaxies are not flying like shrapnel through pre-existing space; the metric grid between unbound galaxy clusters stretches uniformly everywhere.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: As the elastic band stretches, every button moves away from your chosen home button.', act: (s) => { s.selectTab(0, 1); s.setSlider('Stretch factor', 1.0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: A neighbour twice as far away recedes twice as fast—a straight line on v vs d.', act: (s) => s.setSlider('Stretch factor', 2.0) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Why there is no special centre—every observer sees the exact same v = H₀ d slope.', cutaway: true, act: (s) => s.selectTab(0, 2) },
      { title: '4. Side-on trend', caption: '4/5 Trend: Light waves travelling through stretching space are stretched too, shifting toward the red.', act: (s) => s.clickBtn('Mode') },
      { title: '5. Your turn', caption: '5/5 Your turn: Switch home galaxies and stretch the universe.', cutaway: false },
    ],
    idealised: 'Local gravitational pulls (such as Andromeda falling toward the Milky Way) are omitted to show pure cosmological Hubble flow.',
  },

  selftest: {
    challenge: {
      prompt: 'Raise spring stiffness above 18 N/m and observe how oscillation frequency responds to stronger restoring force.',
      check: (s) => s.num('Stiffness', 10) >= 18,
    },
    yourNumbers: (s) => {
      const k = s.num('Stiffness', 10);
      const omega = Math.sqrt(k).toFixed(2);
      return `F = −k x  |  k = ${k} N/m  →  ω = √(k/m) = ${omega} rad/s`;
    },
    cutaway: 'Inside Hooke’s law: restoring force is proportional to displacement from equilibrium.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: The mass oscillates back and forth around equilibrium.' },
      { title: '2. Close-up', caption: '2/5 Close-up: Stiffer springs oscillate faster.', act: (s) => s.setSlider('Stiffness', 20) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Restoring force always points toward the centre.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Period scales inversely with √k.' },
      { title: '5. Your turn', caption: '5/5 Your turn: Adjust stiffness or play a tone.', cutaway: false },
    ],
    idealised: 'Damping is omitted so the oscillation amplitude stays constant.',
  },

  atlas_period: A(
    'Inspect the 3D pendulum and spring pair, or switch to X-ray / Section cutaway mode to see why 4× length gives 2× period.',
    (s) => s.interacted || s.watched,
    () => 'T = 2π √(L ÷ g)  |  L₂ = 4 L₁  →  T₂ = √4 × T₁ = 2 T₁',
    'Inside the small-angle restoring torque: F_restore ≈ −(mg/L) s, so longer L softens stiffness while increasing arc length.',
    'Two springs and two pendulums side by side in 3D.', undefined,
    'The 4× longer pendulum takes exactly twice as long per swing.', undefined,
    'Restoring force scales as 1/L, giving T ∝ √L.',
    'A 4× heavier mass on an identical spring also doubles the period (T = 2π√(m/k)).', undefined,
    'Small-angle approximation sin θ ≈ θ and zero air resistance keep period independent of amplitude.',
    [
      { name: 'Side-by-Side Pair', prompt: 'Count swings of the 4× length pendulum.', state: { tabs: [6, 0] } },
      { name: 'X-Ray Internal View', prompt: 'Reveal spring coils inside the frame.', state: { tabs: [6, 1] } },
    ],
    {
      openPlay: 'Count how many times the short pendulum returns while the 4× long one finishes one swing.',
      misconception: 'Thinking doubling pendulum bob mass or doubling length doubles the period.',
      dinnerQuestion: 'If you lengthen a monsoon swing rope at Hanging Gardens fourfold, how much slower does each back-and-forth beat become?',
      cambridgeUnit: 'Unit 6 · Pendulum & Spring Period',
    }
  ),

  atlas_ch00: A(
    'Move the ship farther out past the coastal curve or align the ruler straight overhead to eliminate parallax shift!',
    (s) => s.num('Ship distance', 13) >= 15 || Math.abs(s.num('Ruler viewing angle', 18)) <= 2 || s.interacted,
    (s) => {
      const h = s.num('Observer eye height', 2.0), d = s.num('Ship distance', 13);
      return `d_hz = √(2 R_E h) = ${Math.sqrt(2 * 6371 * h * 1e-3).toFixed(2)} km (h = ${h.toFixed(1)} m)  |  Ship at ${d.toFixed(1)} km`;
    },
    'The horizon is where your line of sight grazes Earth’s 6,371 km sphere; in rain gauges, V = A × h cancels mouth area A.',
    'An outbound ship drops hull-first behind the curved sea.', (s) => s.setSlider('Ship distance', 16),
    'Raising eye height h pushes the horizon kilometres farther out.', (s) => s.setSlider('Observer eye height', 15),
    'Geometry decides what is hidden behind Earth’s curve or shifted by parallax.',
    'Looking straight down (θ = 0°) reduces parallax Δx = t tan θ to 0 mm.', (s) => s.setSlider('Ruler viewing angle', 0),
    'Atmospheric refraction over warm seawater is omitted.',
    [
      { name: 'Hull-Down Cargo Ship', prompt: 'Observe Earth curvature hiding the hull beyond the horizon.', state: { tabs: [0, 0], sliders: { 'Ship distance': 16 } } },
      { name: 'Zero Parallax Look', prompt: 'Read the scale vertically perpendicular.', state: { tabs: [2, 0], sliders: { 'Ruler viewing angle': 0 } } },
    ],
    {
      openPlay: 'Orbit to look flush across the ruler thickness and watch the parallax shift appear.',
      misconception: 'Thinking binoculars bring an ocean-hidden ship hull back above the horizon.',
      dinnerQuestion: 'From the Worli Sea Link parapet compared to the sandy shore, how many extra kilometres of Arabian Sea can you see?',
      cambridgeUnit: 'Unit 1 · Measurement, Parallax & Scale',
    }
  ),

  atlas_ch01: A(
    'Steepen Galileo’s bronze-ball incline to accelerate fall, or compare two opposing trains in relative motion!',
    (s) => s.num('Galileo ramp angle', 12) >= 18 || s.interacted,
    (s) => {
      const th = s.num('Galileo ramp angle', 12);
      return `a = (5/7) g sin(${th}°) = ${((5 / 7) * 9.8 * Math.sin((th * Math.PI) / 180)).toFixed(2)} m/s²  |  odd-number gaps 1 : 3 : 5 : 7`;
    },
    'Tilting the groove dilutes gravity by sin θ (and rolling inertia by 5/7), slowing fall so bell gates verify Δx ∝ t².',
    'Platform frame S and carriage frame S′ relate positions by x′ = x − v t.', undefined,
    'On Galileo’s ramp, bells at 1, 4, 9, and 16 units ring on a steady beat.', (s) => s.setSlider('Galileo ramp angle', 16),
    'At the peak of a vertical toss, v = 0 while acceleration stays −9.8 m/s².',
    'Opposite trains add their speeds in v_AB = v_A − v_B.', (s) => s.setSlider('Train A ground velocity', 18),
    'Rolling resistance and air drag on the bronze sphere are neglected.',
    [
      { name: 'Galileo Steep Ramp', prompt: 'Trace 1 : 3 : 5 : 7 equal-time distances.', state: { tabs: [1, 0], sliders: { 'Galileo ramp angle': 18 } } },
      { name: 'Opposing Local Trains', prompt: 'Compare velocity addition across frames.', state: { tabs: [3, 0], sliders: { 'Train A ground velocity': 18 } } },
    ],
    {
      openPlay: 'Space the bells equally vs 1, 4, 9, 16 along the groove—which pattern sounds a steady beat?',
      misconception: 'Believing acceleration becomes zero at the highest point of an upward toss.',
      dinnerQuestion: 'On a Central Line fast train passing another train opposite at Bandra, why does it seem to blur by twice as fast?',
      cambridgeUnit: 'Unit 1 · Relative Motion & Constant Acceleration',
    }
  ),

  atlas_ch02: A(
    'Flatten Galileo’s second recovery ramp toward horizontal, or push the block hard enough to break static friction!',
    (s) => s.num('Galileo recovery slope', 14) <= 2 || s.num('Horizontal push', 22) >= 26 || s.interacted,
    (s) => {
      const F = s.num('Horizontal push', 22), m = s.num('Block mass', 5.0), fs = 0.5 * m * 9.8, fk = 0.35 * m * 9.8;
      return F > fs ? `F (${F} N) > f_s,max (${fs.toFixed(1)} N) → SLIDING a = ${((F - fk) / m).toFixed(2)} m/s²` : `F (${F} N) ≤ f_s,max (${fs.toFixed(1)} N) → LOCKED (a = 0)`;
    },
    'Polished surfaces touch at micron-scale asperity peaks whose cold-welded tips shear when F_push exceeds μ_s N.',
    'On Galileo’s double ramp, the ball climbs back to its starting height h.', (s) => s.setSlider('Galileo recovery slope', 15),
    'Flattening the second slope toward 0° sends run distance L = h / sin θ₂ to infinity!', (s) => s.setSlider('Galileo recovery slope', 0),
    'Inside microscopic surface asperities under normal load N.',
    'Pushing above μ_s N breaks static welds onto the lower kinetic plateau μ_k N.', (s) => s.setSlider('Horizontal push', 32),
    'Amontons–Coulomb friction treats μ_s and μ_k as constant across sliding speeds.',
    [
      { name: 'Galileo Flat Limit', prompt: 'Flatten second ramp toward perpetual motion.', state: { tabs: [0, 0], sliders: { 'Galileo recovery slope': 0 } } },
      { name: 'Break Static Welds', prompt: 'Exceed μ_s N threshold to trigger sliding.', state: { tabs: [2, 0], sliders: { 'Horizontal push': 32 } } },
    ],
    {
      openPlay: 'Switch to Section cutaway on the friction block to inspect the microscopic contact peaks.',
      misconception: 'Assuming an object moving forward must always have a net forward force pushing it.',
      dinnerQuestion: 'Why does pushing a heavy fridge across kitchen tiles take a hard initial shove yet slightly less force once moving?',
      cambridgeUnit: 'Unit 2 · Inertia & Friction Peaks',
    }
  ),

  atlas_ch03: A(
    'Increase the forward pull on the three-car train and discover how tension steps down from coupling to coupling!',
    (s) => s.num('Applied pull force', 24) >= 36 || s.interacted,
    (s) => {
      const F = s.num('Applied pull force', 24), m = s.num('Test cart mass', 3.0);
      return `a = F ÷ m = ${(F / m).toFixed(2)} m/s²  |  3-car tensions: ${F} N : ${((2 * F) / 3).toFixed(0)} N : ${(F / 3).toFixed(0)} N`;
    },
    'Each coupling pulls only the mass trailing behind it; a rocket accelerates in vacuum by pushing its own exhaust gas.',
    'Doubling net force doubles acceleration; doubling mass halves it.', (s) => s.setSlider('Applied pull force', 24),
    'Along a 3-car train, tension drops 3ma → 2ma → 1ma from front to rear.', (s) => s.setSlider('Applied pull force', 36),
    'Inside two hooked spring scales, F_AB = −F_BA holds at every instant.',
    'Faster rocket exhaust speed v_ex linearly boosts thrust F = v_ex dm/dt.', (s) => s.setSlider('Rocket exhaust speed', 3400),
    'Coupling hooks and spring scale casings are treated as massless.',
    [
      { name: 'Three-Car Tension Ladder', prompt: 'Compare 3 : 2 : 1 tension ratio along couplings.', state: { tabs: [1, 0], sliders: { 'Applied pull force': 36 } } },
      { name: 'Vacuum Rocket Exhaust', prompt: 'Inspect recoil thrust without pushing air.', state: { tabs: [3, 0], sliders: { 'Rocket exhaust speed': 3400 } } },
    ],
    {
      openPlay: 'Ask Kym whether the front coupling or rear coupling snaps first when pulling three identical bogies.',
      misconception: 'Thinking action and reaction cancel each other out because they are equal and opposite.',
      dinnerQuestion: 'How can an ISRO rocket steer and speed up in empty space if there is no air behind the nozzle to push against?',
      cambridgeUnit: 'Unit 2 · Newton’s Second & Third Laws',
    }
  ),

  atlas_ch04: A(
    'Flick the twin coin faster horizontally—does extra sideways speed delay how soon both coins strike the table?',
    (s) => s.num('Horizontal flick speed', 4.5) >= 6.5 || s.interacted,
    (s) => {
      const h = s.num('Release table height', 1.25), vx = s.num('Horizontal flick speed', 4.5), t = Math.sqrt((2 * h) / 9.8);
      return `t_fall = √(2h ÷ g) = ${t.toFixed(3)} s (independent of v_x!)  |  range x = v_x t = ${(vx * t).toFixed(2)} m`;
    },
    'Gravity pulls only along vertical y while horizontal v_x stays constant; on a circle, Δv = v₂ − v₁ points straight inward.',
    'One coin drops straight down while its twin shoots out horizontally at v_x.', (s) => s.setSlider('Horizontal flick speed', 4.5),
    'Horizontal strobe bars prove both coins share the exact same height y(t) at every instant.', (s) => s.setSlider('Horizontal flick speed', 7.5),
    'Why velocity change Δv in uniform circular motion points radially inward.',
    'Doubling orbital speed v quadruples inward centripetal acceleration a_c = v²/r.', (s) => s.setSlider('Orbital tangent speed', 8.0),
    'Air resistance is omitted so horizontal and vertical motions are strictly independent.',
    [
      { name: 'High-Speed Twin Coins', prompt: 'Check simultaneous table impact despite fast v_x.', state: { tabs: [0, 0], sliders: { 'Horizontal flick speed': 7.5 } } },
      { name: 'Vector Δv Turning', prompt: 'See inward acceleration at constant orbital speed.', state: { tabs: [2, 0], sliders: { 'Orbital tangent speed': 8.0 } } },
    ],
    {
      openPlay: 'Line the 3D camera edge-on to check the horizontal strobe planes through both coins.',
      misconception: 'Thinking a fast horizontal projectile stays airborne longer because it fights gravity sideways.',
      dinnerQuestion: 'Does a carrom striker flying horizontally off a table edge hit the Mumbai marble floor any later than one dropped beside it?',
      cambridgeUnit: 'Unit 4 · 2D Projectiles & Circular Acceleration',
    }
  ),

  atlas_ch05: A(
    'Inspect gravity’s fall-off at lunar distance, then stretch a comet orbit’s eccentricity to compare perihelion and aphelion speeds!',
    (s) => s.num('Orbital eccentricity', 0.55) >= 0.7 || s.interacted,
    (s) => {
      const r = s.num('Orbit distance', 60), e = s.num('Orbital eccentricity', 0.55);
      return `At r = ${r} R_E: 1-s drop = 4.9 m ÷ ${r}² = ${(4900 / (r * r)).toFixed(2)} mm  |  v_p/v_a = ${((1 + e) / (1 - e)).toFixed(2)}×`;
    },
    'Inside Cavendish’s box: a quartz torsion fibre twists under a 1.5 × 10⁻⁷ N pull between lead spheres, deflecting a mirror beam.',
    'At 60 R_E, gravity is diluted by 3,600× so the Moon falls 1.36 mm/s beneath its tangent.', (s) => s.setSlider('Orbit distance', 60),
    'A taut loop of string around two focal pins traces an ellipse with r₁ + r₂ = 2a.', (s) => s.setSlider('Orbital eccentricity', 0.65),
    'Inside Cavendish’s 1798 torsion balance and optical lever mirror.',
    'Comets sweep equal areas in equal times, racing past perihelion.', (s) => s.setSlider('Orbital eccentricity', 0.8),
    'Two-body Keplerian orbits neglect perturbations from neighbouring planets.',
    [
      { name: '60 R_E Moon Fall', prompt: 'Verify 1/r² gravity dilution at lunar orbit.', state: { tabs: [0, 0], sliders: { 'Orbit distance': 60 } } },
      { name: 'High-Eccentricity Comet', prompt: 'Contrast perihelion race against aphelion drift.', state: { tabs: [2, 0], sliders: { 'Orbital eccentricity': 0.8 } } },
    ],
    {
      openPlay: 'Inspect the Cavendish box in X-ray view to see how the optical lever amplifies micro-forces.',
      misconception: 'Thinking astronauts float or comets orbit because Earth or space sits completely beyond gravity.',
      dinnerQuestion: 'Why does Halley’s Comet whip past the inner Sun in a few months yet take decades to creep past Neptune?',
      cambridgeUnit: 'Unit 4 · Inverse-Square Gravity & Orbits',
    }
  ),

  atlas_ch06: A(
    'Fill the slotted water bottle deeper to accelerate the bottom jet, or drop ambient air pressure to watch the mercury barometer react!',
    (s) => s.num('Bottle water column', 0.45) >= 0.55 || s.num('External atmospheric pressure', 101.3) <= 75 || s.interacted,
    (s) => {
      const H = s.num('Bottle water column', 0.45), P = s.num('External atmospheric pressure', 101.3);
      return `ΔP_bottom = ρgH = ${(9.8 * H).toFixed(2)} kPa  |  P_atm = ${P.toFixed(1)} kPa → ${(((P * 1000) / (13595 * 9.8)) * 1000).toFixed(0)} mm Hg`;
    },
    'Fluid pressure P = P₀ + ρgh depends only on vertical depth h, while air molecules hammer upward on an inverted glass card with ~390 N.',
    'Deeper holes experience greater pressure ρgh and shoot faster jets v = √(2gh).', (s) => s.setSlider('Bottle water column', 0.55),
    'Sea-level air pressure (101.3 kPa) holds up 760 mm of dense mercury.', (s) => s.setSlider('External atmospheric pressure', 101.3),
    'At high altitude, lower P_atm lets the mercury column sink.',
    'Upward atmospheric force on a postcard exceeds the weight of 12 cm of water by 86×!', (s) => s.setSlider('External atmospheric pressure', 65),
    'Viscous nozzle losses and orifice surface tension are omitted.',
    [
      { name: 'High Bottle Head', prompt: 'Compare top vs middle vs bottom jet arcs.', state: { tabs: [0, 0], sliders: { 'Bottle water column': 0.58 } } },
      { name: 'Lonavala Hill Barometer', prompt: 'Lower P_atm and track mercury height drop.', state: { tabs: [1, 0], sliders: { 'External atmospheric pressure': 75 } } },
    ],
    {
      openPlay: 'Ask Kym why the top hole shoots a weak steep arc while the bottom hole fires almost horizontally.',
      misconception: 'Thinking a "suction force" pulls drinks up a straw rather than external atmospheric pressure pushing.',
      dinnerQuestion: 'If you carry Torricelli’s mercury barometer up Sahyadri cliffs at Matheran, does the mercury rise or fall—and why?',
      cambridgeUnit: 'Unit 3 · Fluid Jets & Air Pressure',
    }
  ),

  atlas_ch07: A(
    'Double a falling sphere’s impact speed into clay to test whether crater depth doubles or quadruples!',
    (s) => Math.abs(s.num('Clay test impact speed', 4.0) - 4.0) <= 0.6 && s.interacted,
    (s) => {
      const v = s.num('Clay test impact speed', 4.0), P = s.num('Household appliance load', 1500), ke = 0.5 * v * v;
      return `E_k = ½mv² = ${ke.toFixed(1)} J → dent d = ${(ke / 2).toFixed(2)} cm  |  ${P} W × 180 h = ${((P * 180) / 1000).toFixed(0)} kWh`;
    },
    'Stopping a sphere in clay requires work W = F_clay d = ½mv²; in an inelastic bounce, (1 − e²) of KE turns into heat.',
    'A sphere hitting clay at 2v carves a crater 4× deeper than at v.', (s) => s.setSlider('Clay test impact speed', 4.0),
    'Each bounce peaks at e² of the previous height while warming the floor.', (s) => s.setSlider('Bounce restitution', 0.7),
    'Inside the kWh meter: disc speed measures Watts, total turns count kWh.',
    'City Sankey pipes split 100% fuel input into useful work and ambient heat.', (s) => s.setSlider('Household appliance load', 2800),
    'Clay resistance force F_clay is modelled as uniform with penetration depth.',
    [
      { name: '4× Clay Crater Test', prompt: 'Check quadratic ½mv² scaling at double speed.', state: { tabs: [0, 0], sliders: { 'Clay test impact speed': 4.0 } } },
      { name: 'Heavy Home kWh Load', prompt: 'Compare spinning disc watts vs cumulative kWh.', state: { tabs: [2, 0], sliders: { 'Household appliance load': 2800 } } },
    ],
    {
      openPlay: 'Switch to Section cutaway on the household kWh meter to distinguish Power (W) from Energy (kWh).',
      misconception: 'Thinking doubling car speed only doubles braking distance (actually 4× work!).',
      dinnerQuestion: 'Why does a car screeching at 80 km/h on the Bandra–Worli Sea Link need four times the stopping distance of 40 km/h?',
      cambridgeUnit: 'Unit 3 · Work, Quadratic KE & Power',
    }
  ),

  atlas_ch08: A(
    'Push heat input into the water–steam phase transition plateau—why does the thermometer stall while you keep heating?',
    (s) => (s.num('Added heat per kg', 550) >= 850 && s.num('Added heat per kg', 550) <= 3000) || s.interacted,
    (s) => {
      const ev = s.num('Matka water evaporated', 1.5), dT = ((ev / 100) * 2260000) / ((1 - ev / 100) * 4184);
      return `Matka: ${ev.toFixed(1)}% evaporated × L_v ÷ c_w → cools pot by −${dT.toFixed(1)} °C (to ${(32 - dT).toFixed(1)} °C)`;
    },
    'During boiling or matka evaporation, incoming energy breaks hydrogen bonds (L_v = 2,260 kJ/kg) instead of raising kinetic energy.',
    'Joule’s falling weights churn water: 4,184 J warms 1 kg by 1 °C.', (s) => s.setSlider('Joule weight drops', 30),
    'A 40 °C bucket holds vastly more thermal energy Q = mcΔT than a 100 °C spoon.', undefined,
    'A wool sweater traps dead air, blocking room heat from melting ice.',
    'Evaporating 1.8% of water through porous matka clay cools the pot by ~10 °C.', (s) => s.setSlider('Matka water evaporated', 1.8),
    'Calorimeter walls are treated as adiabatic outside the modelled heat flux.',
    [
      { name: 'Boiling Flat Plateau', prompt: 'Add latent heat at constant 100 °C.', state: { tabs: [1, 0], sliders: { 'Added heat per kg': 1500 } } },
      { name: 'Clay Matka Cooling', prompt: 'Small sweat fraction cools water noticeably.', state: { tabs: [2, 0], sliders: { 'Matka water evaporated': 1.8 } } },
    ],
    {
      openPlay: 'Compare "100 °C spoon vs 40 °C bucket" to distinguish temperature from internal thermal energy.',
      misconception: 'Assuming added heat MUST always raise temperature even during melting or boiling.',
      dinnerQuestion: 'Why does drinking water stored in a Dharavi terracotta matka stay noticeably cooler in May humidity?',
      cambridgeUnit: 'Unit 5 · Specific & Latent Heat',
    }
  ),

  atlas_ch09: A(
    'Sweep Barton’s driver frequency past the pendulum array—why does one hanging responder absorb a dramatic swing?',
    (s) => Math.abs(s.num('Barton driver frequency', 1.5) - 2.0) <= 0.15 || s.interacted,
    (s) => {
      const f = s.num('Acoustic frequency', 343);
      return `v_sound = f λ → 343 m/s = ${f} Hz × ${(343 / f).toFixed(2)} m  |  Barton f_drive = ${s.num('Barton driver frequency', 1.5).toFixed(2)} Hz`;
    },
    'At resonance f_drive = f₀, pushes arrive in phase with velocity; in sound waves, air rings oscillate locally while compressions travel at 343 m/s.',
    'On Barton’s cord, only the responder matching the driver builds a huge swing.', (s) => s.setSlider('Barton driver frequency', 1.5),
    'Shifting f_drive to 2.0 Hz hands resonance to the next shorter pendulum.', (s) => s.setSlider('Barton driver frequency', 2.0),
    'Above 15 m/s crosswind, vortex shedding locks onto bridge deck twist.',
    'Doubling acoustic frequency f halves wavelength λ = v/f.', (s) => s.setSlider('Acoustic frequency', 500),
    'Sound propagation is modelled in dry air at 20 °C (343 m/s).',
    [
      { name: 'Barton Resonance Peak', prompt: 'Match driver beat to a hanging pendulum.', state: { tabs: [0, 0], sliders: { 'Barton driver frequency': 2.0 } } },
      { name: '500 Hz Sound Wavelength', prompt: 'Verify λ = 343 / f spacing in air rings.', state: { tabs: [2, 0], sliders: { 'Acoustic frequency': 500 } } },
    ],
    {
      openPlay: 'Look closely at how non-resonant responders barely twitch compared to the matched length.',
      misconception: 'Thinking air molecules travel all the way across a hall from singer to ear.',
      dinnerQuestion: 'Why can a low train horn rattle just one loose windowpane in your Dadar flat while leaving thicker panes calm?',
      cambridgeUnit: 'Unit 6 · Resonance & Acoustic Waves',
    }
  ),

  atlas_ch10: A(
    'Stop down the pinhole aperture for a sharper inverted candle, or swing Earth behind the Sun to reveal Rømer’s light delay!',
    (s) => s.num('Pinhole aperture diameter', 1.5) <= 0.6 || s.num('Earth orbital angle', 180) >= 160 || s.interacted,
    (s) => {
      const d = s.num('Pinhole aperture diameter', 1.5), di = s.num('Camera box depth', 180), M = di / 360;
      return `M = d_i ÷ d_o = ${M.toFixed(2)}×  |  blur = ${(d * (1 + M)).toFixed(2)} mm  |  brightness ∝ d² = ${(d * d).toFixed(2)}`;
    },
    'Straight rays from candle top and bottom cross at the pinhole to invert the image; across Earth’s 2 AU orbit, light takes 16.6 min to cross.',
    'We see non-luminous pages only when diffusely scattered rays enter our pupil.', undefined,
    'A 0.5 mm pinhole yields a crisp inverted image; a 4.5 mm hole blurs overlapping cones.', (s) => s.setSlider('Pinhole aperture diameter', 0.5),
    'Deeper camera box d_i magnifies the inverted image linearly (M = d_i/d_o).',
    'At conjunction (180°), Io’s eclipses arrive 16.6 minutes late across 2 AU.', (s) => s.setSlider('Earth orbital angle', 180),
    'Geometric ray optics omits wave diffraction below ~0.3 mm.',
    [
      { name: 'Sharp 0.5 mm Pinhole', prompt: 'Tighten hole diameter for crisp inversion.', state: { tabs: [0, 0], sliders: { 'Pinhole aperture diameter': 0.5 } } },
      { name: 'Rømer 180° Io Eclipse', prompt: 'Compare light delay across Earth’s 2 AU orbit.', state: { tabs: [2, 0], sliders: { 'Earth orbital angle': 180 } } },
    ],
    {
      openPlay: 'Compare 0.5 mm vs 4.5 mm aperture on bright vs crispness trade-offs.',
      misconception: 'Thinking a pinhole flips an image left-right only OR that human sight shoots rays out of the eye.',
      dinnerQuestion: 'During a Mumbai solar eclipse under banyan leaves, why do hundreds of tiny gaps project crescent Suns on the pavement?',
      cambridgeUnit: 'Unit 7 · Ray Geometry & Speed of Light',
    }
  ),

  atlas_ch11: A(
    'Rotate the Polaroid filter to find which axis snuffs out pond surface glare completely!',
    (s) => Math.abs(s.num('Polaroid sunglass axis', 90) - 90) <= 5 || s.interacted,
    (s) => {
      const phi = s.num('Polaroid sunglass axis', 90), tr = Math.round(Math.pow(Math.cos((phi * Math.PI) / 180), 2) * 100);
      return `Brewster θ_B = 53.1°  |  Malus cos²(${phi}°) = ${tr}% glare  |  Raman Δν̃ = ${s.num('Molecular bond vibration', 459)} cm⁻¹`;
    },
    'Newton’s inverted second prism recombines the spectrum into white light; Raman inelastic scattering shifts photon energy by a vibrational quantum.',
    'Violet bends more than red in glass; Newton’s second prism recombines them into white.', undefined,
    'Water glare at 53.1° is horizontally polarized; a 90° vertical Polaroid blocks it.', (s) => s.setSlider('Polaroid sunglass axis', 90),
    'Rotating the Polaroid to 0° transmits 100% of the surface glare.',
    'Higher bond vibration frequency Δν̃ pushes the Raman Stokes line farther into the green.', (s) => s.setSlider('Molecular bond vibration', 1100),
    'Crown glass dispersion uses a two-term Cauchy relation.',
    [
      { name: 'Zero Glare 90° Filter', prompt: 'Block horizontally polarised pond reflection.', state: { tabs: [1, 0], sliders: { 'Polaroid sunglass axis': 90 } } },
      { name: 'Raman Vibrational Shift', prompt: 'Tune molecular shift away from Rayleigh peak.', state: { tabs: [2, 0], sliders: { 'Molecular bond vibration': 1100 } } },
    ],
    {
      openPlay: 'Twist the Polaroid axis 90° across water glare first—prove light is a transverse wave!',
      misconception: 'Thinking glass prisms manufacture new colours instead of separating wavelengths already in white light.',
      dinnerQuestion: 'Why did C. V. Raman notice the deep sapphire Caribbean sea and then discover scattered sky photons shifting colour?',
      cambridgeUnit: 'Unit 7 · Dispersion, Polarisation & Scattering',
    }
  ),

  atlas_ch12: A(
    'Step up circuit voltage across ohmic vs filament loads, or inspect how the thicker Earth wire trips a household fuse during a live fault!',
    (s) => s.num('Applied circuit voltage', 3.5) >= 3.5 || s.interacted,
    (s) => {
      const V = s.num('Applied circuit voltage', 3.5), Re = s.num('Earth fault loop resistance', 2.0);
      return `At V = ${V.toFixed(1)} V: I_ohmic = ${(V / 10).toFixed(2)} A  |  230 V fault: I = 230 ÷ ${Re.toFixed(1)} Ω = ${(230 / Re).toFixed(0)} A (blows 15 A fuse!)`;
    },
    'The top Earth pin is longer (connects first) and thicker (R_E ≈ 2 Ω) so a live-to-case fault triggers a 115 A surge that melts the fuse immediately.',
    'A charged comb polarizes neutral paper bits, pulling closer +q upward.', (s) => s.setSlider('Charged comb height', 1.4),
    'A battery pumps the wire’s existing conduction electrons around a closed loop.', undefined,
    'Heating a tungsten filament scatters electrons and bends its I–V curve.',
    'A 2 Ω Earth wire diverts fault current and blows the 15 A fuse safely.', (s) => s.setSlider('Earth fault loop resistance', 2.0),
    'Mains voltage is 230 V RMS with a 15 A fuse threshold.',
    [
      { name: 'Ohmic vs Filament I–V', prompt: 'See hot filament bend away from Ohm’s line.', state: { tabs: [1, 0], sliders: { 'Applied circuit voltage': 4.0 } } },
      { name: '3-Pin Earth Fault Surge', prompt: 'Low-R Earth path forces fault current past 15 A.', state: { tabs: [2, 0], sliders: { 'Earth fault loop resistance': 2.0 } } },
    ],
    {
      openPlay: 'Zoom into the Indian 3-pin plug in X-ray view—notice which pin enters the socket first.',
      misconception: 'Thinking a battery creates brand-new electrons instead of pumping free electrons already inside copper wires.',
      dinnerQuestion: 'Why is the top Earth pin on an Indian 3-pin AC plug BOTH thicker and longer than the Live and Neutral pins?',
      cambridgeUnit: 'Unit 8 · Circuits, I–V & Earthing Safety',
    }
  ),

  atlas_ch13: A(
    'Strengthen the external field to align iron domains, or crank armature current to boost motor torque!',
    (s) => s.num('External magnetizing field', 0.45) >= 0.75 || s.num('DC motor armature current', 3.5) >= 5.0 || s.interacted,
    (s) => {
      const I = s.num('DC motor armature current', 3.5);
      return `τ_max = N I A B = ${(20 * I * 0.02 * 0.5).toFixed(2)} N·m  |  c = 1/√(μ₀ε₀) = 2.998 × 10⁸ m/s`;
    },
    'Split-ring commutator halves swap brush polarity every 180° to keep torque one-way; in free space, E and B regenerate each other at speed c.',
    'Microscopic magnetic domains inside soft iron align as B_ext rises.', (s) => s.setSlider('External magnetizing field', 0.85),
    'Opposite currents on left and right coil branches create a continuous torque couple.', (s) => s.setSlider('DC motor armature current', 5.0),
    'The split-ring commutator reverses coil current every half-turn.',
    'Perpendicular E and B waves oscillate in phase at speed c.', (s) => s.setSlider('EM wave frequency', 2.25),
    'Stator poles produce a uniform horizontal B-field across the rotor gap.',
    [
      { name: 'Aligned Iron Domains', prompt: 'Saturate soft-iron dipole arrows with B_ext.', state: { tabs: [0, 0], sliders: { 'External magnetizing field': 0.85 } } },
      { name: 'High-Torque DC Motor', prompt: 'Inspect split-ring flip every half revolution.', state: { tabs: [1, 2], sliders: { 'DC motor armature current': 5.0 } } },
    ],
    {
      openPlay: 'Switch DC motor to Section cutaway to watch the split-ring commutator swap brush contact every 180°.',
      misconception: 'Thinking DC motors keep spinning one way without flipping current inside the rotating loop.',
      dinnerQuestion: 'Inside a ceiling fan motor running steadily in your study, what stops the armature from flipping back after half a turn?',
      cambridgeUnit: 'Unit 8 · Domains, Motors & EM Waves',
    }
  ),

  atlas_ch14: A(
    'Shift the Full Moon away from the orbital Line of Nodes to discover why most Full Moons miss Earth’s shadow!',
    (s) => s.num('Full Moon angle', 0) >= 30 || s.interacted,
    (s) => {
      const tilt = s.num('Earth axial tilt', 23.4), node = s.num('Full Moon angle', 0);
      const miss = 60 * Math.sin((5.14 * Math.PI) / 180) * Math.sin((node * Math.PI) / 180);
      return `Tilt ε = ${tilt.toFixed(1)}°  |  Lunar 5.14° tilt at ${node}° from node → shadow miss = ${miss.toFixed(2)} R_E`;
    },
    'At r = 60 R_E, the Moon’s 5.14° orbit tilt carries it up to 5.4 R_E above or below Earth’s shadow cone except near the Line of Nodes.',
    'As Earth spins West-to-East at 15°/h, our local horizon boat turns eastward into sunlight.', undefined,
    'Earth’s 23.4° axis stays parallel in space all year, driving the seasons.', (s) => s.setSlider('Orbital longitude', 90),
    'In December (270°), the same parallel axis tilts the Northern Hemisphere away from the Sun.',
    'Away from the nodes (60°), the 5.14° tilt lifts the Full Moon clear of Earth’s shadow.', (s) => s.setSlider('Full Moon angle', 60),
    '3D orbital sizes are scaled for visibility while numerical readouts use exact 60 R_E geometry.',
    [
      { name: 'Node Lunar Eclipse', prompt: 'Align 0° at the Line of Nodes into Earth’s shadow.', state: { tabs: [2, 0], sliders: { 'Full Moon angle': 0 } } },
      { name: 'Clear Full Moon (60°)', prompt: '5.14° lunar tilt lifts Moon clear of umbra.', state: { tabs: [2, 0], sliders: { 'Full Moon angle': 60 } } },
    ],
    {
      openPlay: 'Orbit edge-on to the ecliptic plane so you see why the 5.14° tilted orbit misses the umbra cone.',
      misconception: 'Asking why we don’t see a lunar eclipse every single Full Moon month.',
      dinnerQuestion: 'Since Earth always casts a long shadow opposite the Sun, why can Mumbai go months between visible lunar eclipses?',
      cambridgeUnit: 'Unit 9 · Eclipses & Orbital Inclination',
    }
  ),

  atlas_ch15: A(
    'Shift light into ultraviolet to trigger photoemission, or push a white dwarf’s mass toward the Chandrasekhar limit!',
    (s) => s.num('Incident light wavelength', 340) <= 380 || s.num('White dwarf mass', 0.85) >= 1.3 || s.interacted,
    (s) => {
      const lam = s.num('Incident light wavelength', 340), hf = 1239.84 / lam, mWd = s.num('White dwarf mass', 0.85);
      return `Photon hf = ${hf.toFixed(2)} eV (K_max = ${Math.max(0, hf - 2.3).toFixed(2)} eV)  |  White dwarf M = ${mWd.toFixed(2)} M_☉ (limit 1.44 M_☉)`;
    },
    'Light exchanges energy in quanta E = hf; in a white dwarf, Pauli electron degeneracy supports the star until relativistic collapse at 1.44 M_☉.',
    'Red light (1.91 eV < φ) cannot eject electrons; UV (4.13 eV) discharges the gold leaf.', (s) => s.setSlider('Incident light wavelength', 300),
    'Single photons land as discrete dots yet accumulate into wave interference fringes.', (s) => s.setSlider('Single-photon exposure', 195),
    'Inside solar p–p fusion, 0.7% of proton mass becomes 26.7 MeV via ΔE = Δmc².',
    'Raising white-dwarf mass toward 1.44 M_☉ shrinks its radius dramatically.', (s) => s.setSlider('White dwarf mass', 1.38),
    'Work function φ = 2.30 eV; white dwarf radius uses the Chandrasekhar relativistic formula.',
    [
      { name: 'UV Photoelectric Drop', prompt: 'Short-wavelength photons exceed φ = 2.30 eV.', state: { tabs: [0, 0], sliders: { 'Incident light wavelength': 300 } } },
      { name: 'Near Chandrasekhar 1.38 M_☉', prompt: 'Watch relativistic degeneracy squeeze white dwarf.', state: { tabs: [2, 0], sliders: { 'White dwarf mass': 1.38 } } },
    ],
    {
      openPlay: 'Compare low-energy red beam vs UV photons—why doesn’t waiting longer help red light eject electrons?',
      misconception: 'Thinking brighter red light eventually knocks electrons loose if you crank up intensity enough.',
      dinnerQuestion: 'How did Subrahmanyan Chandrasekhar deduce on a boat from Madras to England that massive dying stars cannot stay white dwarfs?',
      cambridgeUnit: 'Unit 9 · Quanta, Fusion & Stellar Fate',
    }
  ),

  vectors: {
    challenge: {
      prompt: 'Switch to the Parallelogram law with P = 60 N and Q = 80 N, and discover the angle θ where the resultant R is exactly 100 N.',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Angle θ', 50) - 90) <= 5 && Math.abs(s.num('Arrow P', 80) - 60) <= 5 && Math.abs(s.num('Arrow Q', 60) - 80) <= 5,
    },
    presets: [
      { name: 'Perpendicular Components', prompt: 'Split one 80 N force into horizontal & vertical shadows.', state: { tabs: [0], sliders: { 'Angle θ': 37, 'Arrow P': 80 } } },
      { name: 'Ramp Component Split', prompt: 'See why steeper ramps increase down-slope pull.', state: { tabs: [2], sliders: { 'Angle θ': 30, 'Arrow P': 100 } } },
    ],
    mentorTips: {
      openPlay: 'Ask what happens to R_x when θ reaches 90° and why two forces can cancel or add depending on angle.',
      misconception: 'Simply adding 60 N + 80 N = 140 N regardless of direction.',
      dinnerQuestion: 'If you and a friend pull a heavy box along two ropes 90° apart with 60 N and 80 N, why is the combined pull 100 N instead of 140 N?',
      cambridgeUnit: 'Unit 3 · Force Vectors & Resultants',
    },
    yourNumbers: (s) => {
      const deg = s.num('Angle θ', 50), rad = (deg * Math.PI) / 180;
      const P = s.num('Arrow P', 80), Q = s.num('Arrow Q', 60);
      if (s.tab(0) === 0) return `R_x = ${P} cos ${deg}° = ${(P * Math.cos(rad)).toFixed(1)} N  |  R_y = ${P} sin ${deg}° = ${(P * Math.sin(rad)).toFixed(1)} N  |  √(R_x² + R_y²) = ${P.toFixed(1)} N`;
      if (s.tab(0) === 1) {
        const R = Math.sqrt(P * P + Q * Q + 2 * P * Q * Math.cos(rad));
        return `R = √(${P}² + ${Q}² + 2·${P}·${Q} cos ${deg}°) = ${R.toFixed(1)} N`;
      }
      const rDeg = Math.min(deg, 75), rRad = (rDeg * Math.PI) / 180;
      return `Down-slope: mg sin ${rDeg}° = ${(P * Math.sin(rRad)).toFixed(1)} N  |  Into slope: mg cos ${rDeg}° = ${(P * Math.cos(rRad)).toFixed(1)} N`;
    },
    cutaway: 'Every 2D vector equation is two independent 1D equations at right angles: what happens along x has zero projection along y because cos 90° = 0.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: One tilted arrow R casts two perpendicular shadows, R_x = R cos θ and R_y = R sin θ.', act: (s) => { s.selectTab(0, 0); s.setSlider('Angle θ', 40); s.setSlider('Arrow P', 80); } },
      { title: '2. Close-up', caption: '2/5 Close-up: In the Parallelogram Law, projecting P into P cos θ and P sin θ builds a right triangle of base Q + P cos θ.', act: (s) => { s.selectTab(0, 1); s.setSlider('Angle θ', 60); s.setSlider('Arrow P', 60); s.setSlider('Arrow Q', 80); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: At θ = 90°, cos 90° = 0 so the 2PQ cos θ alignment bonus vanishes and R = √(P² + Q²).', cutaway: true, act: (s) => s.setSlider('Angle θ', 90) },
      { title: '4. Side-on trend', caption: '4/5 Trend: On a tilted ramp, gravity mg splits into mg sin θ along the slope and mg cos θ into the boards.', act: (s) => { s.selectTab(0, 2); s.setSlider('Angle θ', 30); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Sweep θ from 0° to 180° or test ramp components.', cutaway: false },
    ],
    idealised: 'Vectors here lie in a flat 2D plane; in 3D space a third perpendicular component R_z joins so R = √(R_x² + R_y² + R_z²).',
  },

  atwood: {
    challenge: {
      prompt: 'Choose two unequal pulley masses that dilute downward acceleration to roughly one-tenth of free fall (a ≈ 0.98 m/s²).',
      check: (s) => {
        const m1 = s.num('Left mass m₁', 0.55), m2 = s.num('Right mass m₂', 0.45);
        const a = Math.abs((m1 - m2) * G / (m1 + m2));
        return Math.abs(a - 0.98) <= 0.12 && s.interacted;
      },
    },
    presets: [
      { name: 'Balanced Pulley (a = 0)', prompt: 'Equal 0.50 kg masses hang in zero-acceleration tension.', state: { sliders: { 'Left mass m₁': 0.50, 'Right mass m₂': 0.50 } } },
      { name: 'Steep Imbalance (0.8 vs 0.3)', prompt: 'Compare rope tension T against both weights m₁g and m₂g.', state: { tabs: [1], sliders: { 'Left mass m₁': 0.80, 'Right mass m₂': 0.30 } } },
    ],
    mentorTips: {
      openPlay: 'Ask whether rope tension T equals m₁g, m₂g, or lies strictly between them while moving.',
      misconception: 'Assuming the heavier falling mass pulls the rope with its full weight m₁g (ignoring that it is accelerating downward!).',
      dinnerQuestion: 'In a lift accelerating downward, do you feel heavier, lighter, or unchanged on a bathroom scale?',
      cambridgeUnit: 'Unit 3 · Coupled Masses & Tension',
    },
    yourNumbers: (s) => {
      const m1 = s.num('Left mass m₁', 0.55), m2 = s.num('Right mass m₂', 0.45);
      const a = ((m1 - m2) * G) / (m1 + m2);
      const T = (2 * m1 * m2 * G) / (m1 + m2);
      return `a = (${m1.toFixed(2)} − ${m2.toFixed(2)}) × 9.8 ÷ ${(m1 + m2).toFixed(2)} = ${a.toFixed(2)} m/s²  |  T = ${T.toFixed(2)} N`;
    },
    cutaway: 'Unfolding the rope reveals a 1D coupled train: internal tensions +T and −T cancel across the rope while the external weight difference (m₁ − m₂)g accelerates the combined inertia m₁ + m₂.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Two nearly equal masses (0.55 kg and 0.45 kg) dilute free fall to a gentle 0.98 m/s².', act: (s) => { s.setSlider('Left mass m₁', 0.55); s.setSlider('Right mass m₂', 0.45); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Equal masses (0.50 kg each) give zero net driving force and T = mg = 4.90 N.', act: (s) => { s.setSlider('Left mass m₁', 0.50); s.setSlider('Right mass m₂', 0.50); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the Tension Sandwich, T must beat the lighter weight m₂g so m₂ rises, yet stay below m₁g so m₁ falls.', cutaway: true, act: (s) => { s.selectTab(0, 1); s.setSlider('Left mass m₁', 0.80); s.setSlider('Right mass m₂', 0.30); } },
      { title: '4. Side-on trend', caption: '4/5 Trend: A large imbalance (1.00 kg vs 0.20 kg) drives acceleration up to two-thirds of g (6.53 m/s²).', act: (s) => { s.selectTab(0, 0); s.setSlider('Left mass m₁', 1.00); s.setSlider('Right mass m₂', 0.20); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Adjust m₁ and m₂ to test any mass ratio on Atwood’s pulley.', cutaway: false },
    ],
    idealised: 'The rope is treated as massless and unstretchable, and the pulley wheel as frictionless and massless (a real pulley adds rotational inertia I/R² to the denominator).',
  },
};

if (typeof window !== 'undefined') window.__liveEnhancements = ENHANCEMENTS;
