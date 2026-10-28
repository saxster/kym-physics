// Pedagogical enhancements for every live widget in The Moving World:
// 1. Goal-directed micro-challenge + earned rubber stamp (challenge)
// 2. Live "Your numbers" handwritten margin substitution in Caveat Variable (yourNumbers)
// 3. 5-shot choreographed "Watch" tour + Cut-away inside view (watch + cutaway)
// 4. "What the model simplifies" 1-sentence honesty footnote (idealised)

const G = 9.8;

export const ENHANCEMENTS = {
  videotrack: {
    challenge: {
      prompt: 'Switch to "Every frame" and set the tile scale to 15 cm to measure the peak of the toss.',
      check: (s) => s.tab(0) === 3 && Math.abs(s.num('Tile scale', 15) - 15) < 0.5,
    },
    yourNumbers: (s) => {
      const tile = s.num('Tile scale', 15);
      const dt = [0.1, 0.1, 0.05, 1 / 30][s.tab(0)] || 0.0333;
      const vPeak = (G * 0.45).toFixed(2);
      return `v_avg = Δy ÷ Δt  |  tile = ${tile} cm, Δt = ${dt.toFixed(3)} s  →  launch speed ≈ ${vPeak} m/s`;
    },
    cutaway: 'Inside the camera sensor: each frame exposes the CMOS pixels for ~1/250 s while the 30 fps clock stamps exact 0.033 s intervals.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: A ball tossed past wall tiles gives both a clock (frames) and a ruler (tiles).', act: (s) => { s.selectTab(0, 0); s.setSlider('Tile scale', 15); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Marking every 0.10 s shows the gaps shrinking on the way up as gravity slows the ball.', act: (s) => s.selectTab(0, 1) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the camera shutter, each frame freezes the ball at an exact tick of the clock.', cutaway: true, act: (s) => s.selectTab(0, 2) },
      { title: '4. Side-on trend', caption: '4/5 Trend: Marking every single frame reveals a smooth parabola on the position–time graph.', act: (s) => s.selectTab(0, 3) },
      { title: '5. Your turn', caption: '5/5 Your turn: Change the tile scale or load your own clip to measure speed.', cutaway: false },
    ],
    idealised: 'The demo toss ignores air drag and lens barrel distortion, which curves straight tile lines near the edges of a real phone camera.',
  },

  graphwalk: {
    challenge: {
      prompt: 'Switch to "Walk it yourself" and walk to the 6.5 m mark in the corridor.',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Corridor position', 0) - 6.5) <= 0.25,
    },
    yourNumbers: (s) => {
      const x = s.num('Corridor position', 0);
      const mode = s.tab(0) === 1 ? 'walking live' : 'replaying Fig 1.2';
      return `x(t) = ${x.toFixed(1)} m from classroom door  |  slope = Δx ÷ Δt = velocity (${mode})`;
    },
    cutaway: 'Inside the ultrasonic rangefinder: a 40 kHz sound pulse bounces off your chest; time-of-flight × 343 m/s ÷ 2 gives distance x.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: The corridor below and the position–time graph above move together.', act: (s) => s.selectTab(0, 0) },
      { title: '2. Close-up', caption: '2/5 Close-up: A steeper line means covering more metres each second.', act: (s) => { s.selectTab(0, 1); s.setSlider('Corridor position', 3.0); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: How a motion sensor turns echo delay into a live position dot.', cutaway: true, act: (s) => s.setSlider('Corridor position', 5.5) },
      { title: '4. Side-on trend', caption: '4/5 Trend: Standing still draws a flat horizontal line—time keeps moving even when you do not.', act: (s) => s.setSlider('Corridor position', 6.5) },
      { title: '5. Your turn', caption: '5/5 Your turn: Drag the corridor slider to match or invent a walk.', cutaway: false },
    ],
    idealised: 'Your position is treated as a single point; a real walker sways slightly with every step.',
  },

  freefall: {
    challenge: {
      prompt: 'Replay the recorded drop or watch the tour to verify g ≈ 9.8 m/s² from the slope of v(t).',
      check: (s) => s.interacted || s.watched,
    },
    yourNumbers: () => {
      return `y = ½ g t² = 0.5 × 9.8 × (0.50)² = 1.23 m  |  v = g t = 9.8 × 0.50 = 4.9 m/s`;
    },
    cutaway: 'Inside the phone MEMS accelerometer: a microscopic silicon proof-mass on springs relaxes to zero deflection during free fall.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Position curves upward with time squared while velocity rises in a straight line.' },
      { title: '2. Close-up', caption: '2/5 Close-up: Every 0.10 s adds another 0.98 m/s to the downward speed.' },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the falling phone, the tiny silicon spring is weightless until the cushion catches it.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: The slope of the velocity graph is constant at g ≈ 9.8 m/s².' },
      { title: '5. Your turn', caption: '5/5 Your turn: Replay the drop or try the motion sensor on a phone.', cutaway: false, act: (s) => s.clickBtn('Replay') },
    ],
    idealised: 'Over a 1.2 m indoor drop, air resistance reduces a dense ball’s acceleration by less than 1%, which is neglected here.',
  },

  airfall: {
    challenge: {
      prompt: 'Remove all the air (set Air to 0) and drop the feather and coin together so they land at the exact same instant.',
      check: (s) => s.num('Air', 1) <= 0.02,
    },
    yourNumbers: (s) => {
      const air = s.num('Air', 1);
      const aFeather = (G * (1 - 0.88 * air)).toFixed(2);
      return `F_net = m g − F_drag(${Math.round(air * 100)}% air)  →  initial feather accel ≈ ${aFeather} m/s² vs coin 9.80 m/s²`;
    },
    cutaway: 'Inside the tube: at full air, ~2.5 × 10²⁵ N₂ and O₂ molecules per m³ collide with the feather’s barbs; pumping them out leaves only gravity.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: In normal room air, the coin drops like a stone while the feather drifts.', act: (s) => { s.setSlider('Air', 1); s.clickBtn('Drop'); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Half the air means fewer molecular collisions against the feather.', act: (s) => { s.setSlider('Air', 0.4); s.clickBtn('Drop'); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: At the microscopic scale, air drag is billions of gas molecules bouncing off the falling surface.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: In a vacuum (Air = 0), mass cancels out of F = m g and both fall side by side.', act: (s) => { s.setSlider('Air', 0); s.clickBtn('Drop'); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Compare pairs of objects at any air density.', cutaway: false },
    ],
    idealised: 'Drag is modelled as pure quadratic-plus-linear vertical resistance without the fluttering vortices a real feather sheds in air.',
  },

  projectile: {
    challenge: {
      prompt: 'Keep Launch angle at 0° (horizontal) and find the launch speed that lands the flicked coin at the 1.20 m mark (v₀ = 3.0 m/s).',
      check: (s) => Math.abs(s.num('Launch angle', 0)) < 1 && Math.abs(s.num('Sideways', 2.0) - 3.0) < 0.1,
    },
    yourNumbers: (s) => {
      const v0 = s.num('Sideways', 2.0);
      const deg = s.num('Launch angle', 0);
      const rad = (deg * Math.PI) / 180;
      const vx = v0 * Math.cos(rad);
      const vy0 = v0 * Math.sin(rad);
      const h0 = 0.80;
      const tFlight = (vy0 + Math.sqrt(vy0 * vy0 + 2 * G * h0)) / G;
      const range = vx * tFlight;
      return `x = v_x t = ${vx.toFixed(2)} × ${tFlight.toFixed(2)} s = ${range.toFixed(2)} m  |  y = h₀ − ½ g t² (h₀ = 0.80 m)`;
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
      prompt: 'With Friction at 0 (none), make the second ramp shallow (10°) so the ball rolls three times farther to regain its starting height.',
      check: (s) => s.num('Friction', 0) <= 0.01 && Math.abs(s.num('Second ramp angle', 20) - 10) <= 1,
    },
    yourNumbers: (s) => {
      const deg2 = s.num('Second ramp angle', 20);
      const mu = s.num('Friction', 0);
      const sinT = Math.sin((deg2 * Math.PI) / 180);
      const dUp = deg2 > 0 ? (0.50 / Math.max(0.05, sinT + mu)).toFixed(2) : '∞';
      return `h_start = 0.50 m, θ₂ = ${deg2}°, μ = ${mu.toFixed(2)}  →  distance up second slope s ≈ ${dUp} m`;
    },
    cutaway: 'Inside Galileo’s polished bronze groove: a hard rolling sphere touches only a tiny patch, reducing sliding friction nearly to zero.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Released on the left slope, the ball climbs the right slope toward its original height line.', act: (s) => { s.setSlider('Friction', 0); s.setSlider('Second ramp angle', 25); s.clickBtn('Release'); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Lowering the right slope to 10° makes the ball travel much farther horizontally to reach the same height.', act: (s) => { s.setSlider('Second ramp angle', 10); s.clickBtn('Release'); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Why Galileo polished the parchment-lined channel to strip away friction.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Flatten the right ramp to 0° and the ball never reaches its starting height—so with no friction it rolls forever.', act: (s) => { s.setSlider('Second ramp angle', 0); s.clickBtn('Release'); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Test any ramp angle with or without friction.', cutaway: false },
    ],
    idealised: 'The corner between the two ramps is smoothed so no kinetic energy is lost to a bounce at the bottom transition.',
  },

  forces: {
    challenge: {
      prompt: 'Switch to "Rough floor (100 N)" and set the two pulls so the net force to the right is exactly 150 N.',
      check: (s) => {
        if (s.tab(0) !== 1) return false;
        const r = s.num('Pull to the right', 0);
        const l = s.num('Pull to the left', 0);
        return r - l === 250; // 250 N pull difference minus 100 N friction = 150 N net
      },
    },
    yourNumbers: (s) => {
      const l = s.num('Pull to the left', 200);
      const r = s.num('Pull to the right', 200);
      const rough = s.tab(0) === 1 ? 100 : 0;
      const diff = r - l;
      const fric = Math.abs(diff) <= rough ? -diff : -Math.sign(diff) * rough;
      const net = diff + fric;
      return `ΣF = F_right − F_left − F_fric = ${r} − ${l} ${fric >= 0 ? '+ ' + fric : '− ' + Math.abs(fric)} = ${net} N`;
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
      prompt: 'Switch to "Stick (inelastic)" and set Cart 1 to 0.60 kg and Cart 2 to 0.30 kg so the joined carts move at two-thirds of the initial speed.',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Mass of cart 1', 0.5) - 0.60) < 0.02 && Math.abs(s.num('Mass of cart 2', 0.5) - 0.30) < 0.02,
    },
    yourNumbers: (s) => {
      const m1 = s.num('Mass of cart 1', 0.5);
      const m2 = s.num('Mass of cart 2', 0.5);
      const v0 = 1.2;
      const pTot = m1 * v0;
      if (s.tab(0) === 1) {
        const vf = pTot / (m1 + m2);
        return `p_total = m₁ v₀ = ${m1.toFixed(2)} × ${v0} = ${pTot.toFixed(2)} kg·m/s  →  v_final = ${pTot.toFixed(2)} ÷ ${(m1 + m2).toFixed(2)} = ${vf.toFixed(2)} m/s`;
      }
      const v1f = ((m1 - m2) / (m1 + m2)) * v0;
      const v2f = ((2 * m1) / (m1 + m2)) * v0;
      return `p_before = ${pTot.toFixed(2)} kg·m/s  →  after bounce: v₁' = ${v1f.toFixed(2)} m/s, v₂' = ${v2f.toFixed(2)} m/s`;
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
      prompt: 'Set Speed to 3.5 m/s and switch to "From the ball’s seat" before releasing the string.',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Speed', 2.0) - 3.5) < 0.1,
    },
    yourNumbers: (s) => {
      const v = s.num('Speed', 2.0);
      const r = 0.80, m = 0.15;
      const a = (v * v) / r;
      const T = m * a;
      return `a_c = v² ÷ r = ${v.toFixed(1)}² ÷ ${r.toFixed(2)} = ${a.toFixed(2)} m/s²  |  string tension T = m a_c = ${T.toFixed(2)} N`;
    },
    cutaway: 'Inside the taut string: polymer fibres stretch by ~0.2% to supply the inward tension force T = mv²/r; the instant the clip opens, T drops to 0 N.',
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
      prompt: 'Find the circular orbital speed (7.9 km/s) and fire the cannonball so it orbits the Earth without crashing or escaping.',
      check: (s) => {
        const v = s.num('Launch speed', 4.0);
        return v >= 7.8 && v <= 8.1;
      },
    },
    yourNumbers: (s) => {
      const v = s.num('Launch speed', 4.0);
      const rOrbit = 6571; // km
      const aGrav = 9.27;
      const aCent = ((v * v) / rOrbit) * 1000;
      return `v₀ = ${v.toFixed(1)} km/s  |  v² ÷ r = ${aCent.toFixed(2)} m/s² vs gravity g(h) = ${aGrav} m/s² (circular at 7.9 km/s)`;
    },
    cutaway: 'Inside Newton’s gravitational field: gravity pulls toward Earth’s centre at every point; at 7.9 km/s the ground curves away by 4.9 m every second—matching the fall.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: At 4.0 km/s the cannonball arcs partway around the globe and lands.', act: (s) => { s.setSlider('Launch speed', 4.0); s.clickBtn('Fire'); } },
      { title: '2. Close-up', caption: '2/5 Close-up: At 7.9 km/s the ball falls continuously around the curving Earth in a circular orbit.', act: (s) => { s.setSlider('Launch speed', 7.9); s.clickBtn('Fire'); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Gravity never turns off in orbit—it is the inward centripetal force bending the path.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: At 9.5 km/s the orbit stretches into an ellipse; above 11.2 km/s it escapes.', act: (s) => { s.setSlider('Launch speed', 9.5); s.clickBtn('Fire'); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Drag the 3D globe and test any launch speed.', cutaway: false },
    ],
    idealised: 'Newton’s mountain sits above the atmosphere so supersonic air drag (which would burn up a cannonball at sea level) is absent.',
  },

  tides: {
    challenge: {
      prompt: 'Advance the lunar month to a neap tide (Day 7.4 or Day 22.1) when the Moon and Sun pull at right angles.',
      check: (s) => {
        const hrs = s.num('Time in lunar month', 0);
        const day = hrs / 24;
        return Math.abs(day - 7.4) <= 0.8 || Math.abs(day - 22.1) <= 0.8;
      },
    },
    yourNumbers: (s) => {
      const hrs = s.num('Time in lunar month', 0);
      const day = hrs / 24;
      const phaseAngle = (day / 29.53) * 2 * Math.PI;
      const relAmp = Math.sqrt(1 + 0.46 * 0.46 + 2 * 0.46 * Math.cos(2 * phaseAngle));
      return `Day ${day.toFixed(1)} of 29.5  |  ΔF_tide ∝ M ÷ r³ (Sun = 46% of Moon)  →  combined bulge = ${(relAmp * 100).toFixed(0)}% of lunar average`;
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
      prompt: 'Switch the liquid to Mercury (index 2) and fill the tank to 0.76 m to match standard atmospheric pressure (~101 kPa).',
      check: (s) => s.tab(0) === 2 && Math.abs(s.num('Depth of liquid', 1.0) - 0.8) <= 0.12,
    },
    yourNumbers: (s) => {
      const h = s.num('Depth of liquid', 1.0);
      const rhos = [1000, 800, 13534];
      const rho = rhos[s.tab(0)] || 1000;
      const dpKpa = (rho * G * h) / 1000;
      return `Δp = ρ g h = ${rho} × 9.8 × ${h.toFixed(1)} = ${dpKpa.toFixed(1)} kPa  (+ 101.3 kPa air = ${(dpKpa + 101.3).toFixed(1)} kPa total)`;
    },
    cutaway: 'Inside the fluid column: every horizontal layer supports the weight of all the liquid and air stacked above it, pushing equally in all directions at that depth.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Pressure increases linearly with depth, regardless of the width of the tank.', act: (s) => { s.selectTab(0, 0); s.setSlider('Depth of liquid', 1.0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Doubling the water depth from 1.0 m to 2.0 m doubles the liquid gauge pressure.', act: (s) => s.setSlider('Depth of liquid', 2.0) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Molecular collisions transmit the weight of the overlying column in every direction.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Mercury is 13.5 times denser than water, so just 0.8 m produces over 100 kPa.', act: (s) => { s.selectTab(0, 2); s.setSlider('Depth of liquid', 0.8); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Compare liquids and toggle atmospheric pressure.', cutaway: false },
    ],
    idealised: 'The liquid is treated as strictly incompressible (constant density ρ at all depths).',
  },

  buoyancy: {
    challenge: {
      prompt: 'Set Block density to 7,800 kg/m³ (steel) in water, then click "Hollow it out" so the steel hull floats!',
      check: (s) => s.num('Block density', 600) >= 7000 && /floats/i.test(s.readout()),
    },
    yourNumbers: (s) => {
      const rhoB = s.num('Block density', 600);
      const rhos = [1000, 1025, 800, 13534];
      const rhoL = rhos[s.tab(0)] || 1000;
      const frac = Math.min(100, Math.round((rhoB / rhoL) * 100));
      return `F_buoy = ρ_liquid V_disp g  |  ρ_block = ${rhoB} vs ρ_liquid = ${rhoL} kg/m³  →  submerged ≈ ${frac}%`;
    },
    cutaway: 'Inside the pressure difference: water is deeper at the bottom face of the block than at the top face, so upward pressure force exceeds downward pressure force by ρ_liq V g.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: A wood block (600 kg/m³) floats with 60% of its volume below the waterline.', act: (s) => { s.selectTab(0, 0); s.setSlider('Block density', 600); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Solid steel (7,800 kg/m³) weighs more than an equal volume of water, so it sinks.', act: (s) => s.setSlider('Block density', 7800) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Upthrust comes from higher fluid pressure on the deeper bottom face of the hull.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Hollowing out the steel block lowers its average density below 1,000 kg/m³ so it floats like a ship.', act: (s) => s.clickBtn('Hollow') },
      { title: '5. Your turn', caption: '5/5 Your turn: Test any block density across water, seawater, oil, and mercury.', cutaway: false },
    ],
    idealised: 'Surface tension at the waterline and viscous water drag are simplified for clarity.',
  },

  energystores: {
    challenge: {
      prompt: 'Select "Bouncing tennis ball" and scrub Transfer progress to the bottom of the bounce (≈ 50%) where elastic store peaks.',
      check: (s) => s.tab(0) === 0 && s.num('Transfer progress', 0) >= 1.35 && s.num('Transfer progress', 0) <= 1.65,
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
      prompt: 'With Friction at 0.10, find the lowest Release height that still lets the marble clear the 0.80 m bump (1.1 m).',
      check: (s) => Math.abs(s.num('Friction', 0) - 0.10) < 0.015 && Math.abs(s.num('Release height', 1.0) - 1.1) < 0.05,
    },
    yourNumbers: (s) => {
      const h0 = s.num('Release height', 1.0);
      const mu = s.num('Friction', 0);
      const m = s.tab(0) === 1 ? 0.060 : 0.020;
      const eTot = m * G * h0;
      return `E_total = m g h₀ = ${m.toFixed(3)} × 9.8 × ${h0.toFixed(1)} = ${eTot.toFixed(3)} J  |  E_p + E_k + E_therm = ${eTot.toFixed(3)} J (μ = ${mu.toFixed(2)})`;
    },
    cutaway: 'Inside the rolling marble and track: friction converts ordered motion into random lattice vibrations (thermal store) without changing the total joules.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Height store and motion store trade back and forth while the total bar never changes.', act: (s) => { s.setSlider('Friction', 0); s.setSlider('Release height', 1.0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Released from 0.7 m, the marble lacks the joules to reach the 0.8 m bump and rolls back.', act: (s) => s.setSlider('Release height', 0.7) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Switching from bars to glowing hatched jars shows the mechanical and heating pathways.', cutaway: true, act: (s) => { s.selectTab(1, 1); s.setSlider('Release height', 1.2); } },
      { title: '4. Side-on trend', caption: '4/5 Trend: With friction on, each pass fills the warmth store until the marble settles in the dip.', act: (s) => s.setSlider('Friction', 0.10) },
      { title: '5. Your turn', caption: '5/5 Your turn: Solve the 0.80 m bump challenge with friction at 0.10.', cutaway: false, act: (s) => s.selectTab(1, 0) },
    ],
    idealised: 'The marble slides without rotational inertia (½Iω²), so all its motion energy is translational ½mv².',
  },

  conduction: {
    challenge: {
      prompt: 'Compare Copper, Glass, and Pine wood at a Hand temperature of 37 °C to see why metal feels coldest even though all three start at 20 °C.',
      check: (s) => Math.abs(s.num('Hand temperature', 35) - 37) < 0.5 && s.tab(0) > 0,
    },
    yourNumbers: (s) => {
      const tHand = s.num('Hand temperature', 35);
      const ks = [400, 1.0, 0.12];
      const names = ['Copper', 'Glass', 'Pine wood'];
      const idx = s.tab(0);
      const k = ks[idx] || 400;
      const dt = tHand - 20;
      return `P_heat ∝ k × ΔT  |  ${names[idx] || 'Material'} k ≈ ${k} W/(m·K), ΔT = ${tHand} − 20 = ${dt} °C`;
    },
    cutaway: 'Inside copper vs wood: copper has a sea of free conduction electrons that ferry thermal energy away from your fingertips ~3,000× faster than wood fibres.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: All three blocks start at room temperature (20 °C), cooler than your 35 °C hand.', act: (s) => { s.selectTab(0, 0); s.setSlider('Hand temperature', 35); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Touching copper drains heat from your skin rapidly, dropping skin nerve temperature.', act: (s) => s.selectTab(0, 0) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Free electrons in metal vs trapped air pockets in pine wood.', cutaway: true, act: (s) => s.selectTab(0, 2) },
      { title: '4. Side-on trend', caption: '4/5 Trend: On wood, heat stays right at the surface so skin and wood quickly reach nearly the same temperature.', act: (s) => s.setSlider('Hand temperature', 37) },
      { title: '5. Your turn', caption: '5/5 Your turn: Switch materials and adjust hand temperature.', cutaway: false },
    ],
    idealised: 'Heat flow is modelled in one dimension along the bar without convective heat loss to the surrounding room air.',
  },

  ripple: {
    challenge: {
      prompt: 'Switch to "Two fingers" and set Rhythm to 2.0 Hz to create a crisp two-source interference pattern.',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Rhythm', 0) - 2.0) <= 0.1,
    },
    yourNumbers: (s) => {
      const f = s.num('Rhythm', 0);
      const v = 24; // cm/s tank wave speed
      const lam = f > 0 ? (v / f).toFixed(1) : 'pulse';
      return f > 0
        ? `v = f λ = 24 cm/s  |  f = ${f.toFixed(1)} Hz  →  wavelength λ = 24 ÷ ${f.toFixed(1)} = ${lam} cm`
        : `Single pulse: circular wavefronts expand radially at wave speed v = 24 cm/s`;
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
      prompt: 'Switch to "Both" (waveform + frequency spectrum) to see time-domain oscillations and harmonic peaks side by side.',
      check: (s) => s.tab(0) === 1,
    },
    yourNumbers: (s) => {
      const mode = s.tab(0) === 1 ? 'Time waveform + FFT spectrum' : 'Time waveform y(t)';
      return `f = 1 ÷ T  |  v_sound ≈ 343 m/s at 20 °C  |  view: ${mode}`;
    },
    cutaway: 'Inside the microphone capsule: sound pressure waves flex a 5-micrometre diaphragm, changing capacitance and voltage in step with the air vibration.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: The oscilloscope plots air pressure variations against time in milliseconds.', act: (s) => s.selectTab(0, 0) },
      { title: '2. Close-up', caption: '2/5 Close-up: Higher pitch packs more wave cycles into the same millisecond window.' },
      { title: '3. Cut-away', caption: '3/5 Cut-away: How a condenser microphone converts air pressure ripples into voltage.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: The "Both" view separates a complex wave into its pure harmonic frequencies.', act: (s) => s.selectTab(0, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Freeze the trace or test your own voice with the microphone button.', cutaway: false },
    ],
    idealised: 'Without the microphone active, the scope displays a clean synthetic reference tone free of room background noise.',
  },

  harmonics: {
    challenge: {
      prompt: 'Switch to "Tabla" and set Upper overtones to 60% to see how the central syahi patch tunes the overtones into integer harmonics.',
      check: (s) => s.tab(0) === 2 && Math.abs(s.num('Upper overtones', 0.5) - 0.6) <= 0.12,
    },
    yourNumbers: (s) => {
      const inst = ['String (1 : 2 : 3 : 4)', 'Plain drum (1 : 1.59 : 2.14)', 'Tabla with syahi (1 : 2 : 3)'][s.tab(0)] || 'String';
      const ov = Math.round(s.num('Upper overtones', 0.5) * 100);
      return `f_n = n × f₁  |  ${inst}  |  overtone mix = ${ov}%`;
    },
    cutaway: 'Inside the tabla head: C. V. Raman showed that the iron-paste syahi mass-loads the centre of the membrane so its modes shift into integer harmonic ratios 1 : 2 : 3 : 4 : 5.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: A plucked string vibrates in standing-wave loops with ratios 1 : 2 : 3 : 4.', act: (s) => { s.selectTab(0, 0); s.setSlider('Upper overtones', 0.5); } },
      { title: '2. Close-up', caption: '2/5 Close-up: A plain circular drumhead has non-integer modes (1.59×, 2.14×), sounding like a thud.', act: (s) => s.selectTab(0, 1) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: How the black syahi patch on a tabla retunes the membrane modes into singing harmonics.', cutaway: true, act: (s) => s.selectTab(0, 2) },
      { title: '4. Side-on trend', caption: '4/5 Trend: Raising the overtone slider enriches the timbre without changing the fundamental pitch.', act: (s) => s.setSlider('Upper overtones', 0.6) },
      { title: '5. Your turn', caption: '5/5 Your turn: Compare String, Plain drum, and Tabla and tap Play to hear them.', cutaway: false },
    ],
    idealised: 'Only the first four radial/azimuthal vibration modes are summed; a real struck drum excites dozens of higher modes.',
  },

  doppler: {
    challenge: {
      prompt: 'Set Train speed to 90 km/h (25 m/s) and Horn note to 400 Hz to hear and measure the ~60 Hz pitch drop as the train passes.',
      check: (s) => Math.abs(s.num('Train speed', 60) - 90) <= 5 && Math.abs(s.num('Horn note', 330) - 400) <= 10,
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
      { title: '4. Side-on trend', caption: '4/5 Trend: At 90 km/h with a 400 Hz horn, the pitch drops by nearly three semitones as the train passes.', act: (s) => { s.setSlider('Train speed', 90); s.setSlider('Horn note', 400); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Adjust speed and horn frequency, or press Sound the horn.', cutaway: false },
    ],
    idealised: 'The listener stands close to the track so the cosine angle factor approaches ±1 except right at the moment of passing.',
  },

  mirror: {
    challenge: {
      prompt: 'Switch to "Whole body" and move to 120 cm from the mirror to confirm that a half-height mirror still shows you head to toe!',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Distance from mirror', 70) - 120) <= 5,
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
      prompt: 'Switch to "Diamond (2.419)", flip direction to "material → air", and increase the angle above 25° to trigger Total Internal Reflection!',
      check: (s) => s.tab(0) === 2 && s.num('Arriving angle', 35) >= 25 && /total internal|reflect/i.test(s.readout()),
    },
    yourNumbers: (s) => {
      const th1 = s.num('Arriving angle', 35);
      const ns = [1.333, 1.52, 2.419];
      const nMat = ns[s.tab(0)] || 1.333;
      const intoAir = /material\s*→\s*air|out of/i.test(s.readout());
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
      prompt: 'Select "Short-sighted", move Object distance to far (> 80), and switch on "Glasses on" to bring the focal point back onto the retina.',
      check: (s) => s.tab(0) === 1 && s.tab(1) === 1 && s.num('Object distance', 50) >= 80,
    },
    yourNumbers: (s) => {
      const v = s.num('Object distance', 50);
      const dCm = v >= 98 ? '∞' : Math.round(25 * Math.pow(1.045, v));
      const eyeType = ['Ideal eye', 'Short-sighted (myopic)', 'Long-sighted (hyperopic)'][s.tab(0)] || 'Eye';
      return `1/f = 1/d_o + 1/d_i  |  d_o = ${dCm}${dCm === '∞' ? '' : ' cm'}, d_i ≈ 2.4 cm retina  |  ${eyeType}`;
    },
    cutaway: 'Inside the human eye: the curved cornea provides ~43 dioptres of fixed refraction while ciliary muscles squeeze the crystalline lens to add up to ~14 dioptres for near reading.',
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
      prompt: 'Switch to "Stripes on a screen", set Wavelength to 650 nm (red) and Source spacing to 0.25 mm to widen the bright fringes.',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Wavelength', 550) - 650) <= 20 && Math.abs(s.num('Source spacing', 0.4) - 0.25) <= 0.06,
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
      prompt: 'In "Light on a white wall", mix Red = 100%, Green = 100%, and Blue = 0% to make pure additive Yellow light!',
      check: (s) => s.tab(0) === 0 && s.num('Red', 100) >= 95 && s.num('Green', 100) >= 95 && s.num('Blue', 100) <= 5,
    },
    yourNumbers: (s) => {
      const r = s.num('Red', 100), g = s.num('Green', 100), b = s.num('Blue', 100);
      const mode = ['Additive RGB light', 'Subtractive CMY pigment', 'Surface reflectance'][s.tab(0)] || 'RGB';
      return `${mode}: (${r}%, ${g}%, ${b}%)  →  cone excitation L+M−S`;
    },
    cutaway: 'Inside your retina: human colour vision uses three cone types (L peaking ~565 nm, M ~535 nm, S ~440 nm); red + green light stimulates L and M cones identically to pure 580 nm yellow!',
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
      prompt: 'Lower Sun height to 2° (sunset) on Earth to see why the low Sun turns deep orange-red while the overhead sky stays blue.',
      check: (s) => s.tab(0) === 0 && s.num('Sun height', 45) <= 4,
    },
    yourNumbers: (s) => {
      const el = s.num('Sun height', 45);
      const rad = Math.max(0.03, (el * Math.PI) / 180);
      const airMass = (1 / Math.sin(rad)).toFixed(1);
      return `I_scat ∝ 1 ÷ λ⁴  (blue 450 nm scatters 5.5× more than red 650 nm)  |  Sun ${el}° → air mass ≈ ${airMass}×`;
    },
    cutaway: 'Inside Rayleigh scattering: N₂ and O₂ molecules (0.3 nm wide) are much smaller than light wavelengths, oscillating like tiny dipole antennas that radiate strongly as 1/λ⁴.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: With the Sun high overhead, short blue wavelengths scatter across the sky into your eyes.', act: (s) => { s.selectTab(0, 0); s.setSlider('Sun height', 60); } },
      { title: '2. Close-up', caption: '2/5 Close-up: At sunset (2°), sunlight slices through ~15× more air, scattering away blue and green to leave red.', act: (s) => s.setSlider('Sun height', 2) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Why violet/blue scatters 5.5 times more strongly than red off N₂ and O₂ molecules.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: On the airless Moon, no scattering occurs—the sky is pitch black even at noon.', act: (s) => { s.selectTab(0, 2); s.setSlider('Sun height', 45); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Sweep the Sun from noon to sunset across Earth, thin air, and the Moon.', cutaway: false },
    ],
    idealised: 'Only Rayleigh molecular scattering (1/λ⁴) is calculated; larger dust and water droplets add whiter Mie scattering near the horizon.',
  },

  circuit: {
    challenge: {
      prompt: 'Set Battery to 6.0 V and switch to "3 LEDs" so each identical LED drops exactly 2.0 V.',
      check: (s) => Math.abs(s.num('Battery', 3.0) - 6.0) < 0.2 && s.tab(0) === 2,
    },
    yourNumbers: (s) => {
      const vBat = s.num('Battery', 3.0);
      const nLeds = s.tab(0) + 1;
      const vEach = vBat / nLeds;
      const iAmp = vBat / (nLeds * 15);
      return `V_bat = ${vBat.toFixed(1)} V = ${nLeds} × ${vEach.toFixed(2)} V per LED  |  I = V ÷ R_tot ≈ ${iAmp.toFixed(2)} A`;
    },
    cutaway: 'Inside the copper wire and LED: the battery’s electric field pushes every conduction electron in the loop simultaneously; each coulomb hands over V/N joules at each LED.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Charges fill the whole circuit already and begin moving everywhere at once.', act: (s) => { s.selectTab(0, 0); s.setSlider('Battery', 3.0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Raising battery voltage gives each coulomb more joules to deliver per lap.', act: (s) => s.setSlider('Battery', 6.0) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Charges are never used up—the exact same current enters and leaves every bulb.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Putting 3 LEDs in series shares the 6.0 V into 2.0 V across each LED.', act: (s) => s.selectTab(0, 2) },
      { title: '5. Your turn', caption: '5/5 Your turn: Vary battery voltage and number of LEDs, and watch the coulombs & joules counters.', cutaway: false },
    ],
    idealised: 'The LEDs are modelled as ohmic resistors so voltage divides evenly at all battery settings; real semiconductor LEDs have a ~1.8 V turn-on threshold.',
  },

  seriesparallel: {
    challenge: {
      prompt: 'Switch to "Parallel", set LEDs to 3, and click "Unclip LED 1" to see why the other two lamps stay at full brightness!',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('LEDs', 2) - 3) < 0.2 && /unclip|open|stay/i.test(s.readout()),
    },
    yourNumbers: (s) => {
      const n = s.num('LEDs', 2);
      const par = s.tab(0) === 1;
      const V = 3.0, R = 10;
      if (par) {
        const iBranch = V / R;
        const iTot = n * iBranch;
        return `Parallel (${n} branches): V_each = ${V.toFixed(1)} V, I_branch = ${iBranch.toFixed(2)} A  →  I_battery = ${n} × ${iBranch.toFixed(2)} = ${iTot.toFixed(2)} A`;
      }
      const iSer = V / (n * R);
      return `Series (${n} lamps): V_each = ${(V / n).toFixed(2)} V  →  I_loop = ${V.toFixed(1)} ÷ ${n * R} Ω = ${iSer.toFixed(2)} A`;
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
      prompt: 'Switch to "Coil and magnet", set Current to 2.5 A, and click "Reverse current" to flip the coil’s North and South poles.',
      check: (s) => s.tab(0) === 1 && s.num('Current', 1.5) >= 2.4,
    },
    yourNumbers: (s) => {
      const I = s.num('Current', 1.5);
      const mode = s.tab(0) === 1 ? 'Solenoid B = μ₀ n I' : 'Straight wire B = μ₀ I ÷ (2π r)';
      return `${mode}  |  I = ${I.toFixed(1)} A  →  field strength B ∝ ${I.toFixed(1)} A (right-hand grip rule)`;
    },
    cutaway: 'Inside the solenoid coil: circular magnetic field loops around each turn add together down the central tunnel to form a uniform North–South bar-magnet field.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Current in a straight wire wraps magnetic field rings around the conductor (Ørsted’s discovery).', act: (s) => { s.selectTab(0, 0); s.setSlider('Current', 1.5); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Winding the wire into a coil stacks those rings into a strong electromagnet.', act: (s) => { s.selectTab(0, 1); s.setSlider('Current', 2.5); } },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the coil core, magnetic field lines run continuously from South to North.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Reversing the current flips every compass needle by 180°.', act: (s) => s.clickBtn('Reverse') },
      { title: '5. Your turn', caption: '5/5 Your turn: Rotate the 3D field and test any current from 0 to 3.0 A.', cutaway: false },
    ],
    idealised: 'The surrounding space has vacuum permeability μ₀ without iron core saturation or stray Earth magnetism.',
  },

  magnetometer: {
    challenge: {
      prompt: 'Explore the 3-axis magnetic readout or click "Hold" to freeze a reading in microteslas (μT).',
      check: (s) => s.interacted || s.watched,
    },
    yourNumbers: () => {
      return `|B| = √(B_x² + B_y² + B_z²)  |  Earth’s field ≈ 25–65 μT (≈ 43 μT in Mumbai)`;
    },
    cutaway: 'Inside the phone’s Hall/AMR magnetometer chip: Earth’s microtesla magnetic field deflects drifting electrons sideways in a tiny semiconductor strip.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Even far from any fridge magnet, a magnetometer reads Earth’s ~43 μT background field.' },
      { title: '2. Close-up', caption: '2/5 Close-up: Bringing a small magnet or current-carrying wire closer spikes B as 1/r³.' },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Inside the 3-axis Hall sensor that measures B_x, B_y, and B_z.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Flipping the magnet reverses the sign of the component along the sensor axis.' },
      { title: '5. Your turn', caption: '5/5 Your turn: Use a device magnetometer or inspect the reference reading.', cutaway: false },
    ],
    idealised: 'Hard-iron offsets from the phone’s own speaker magnets are subtracted by the browser’s calibrated sensor API.',
  },

  induction: {
    challenge: {
      prompt: 'Set Turns to maximum (index 3) and click "Nudge in / out" (or drag the magnet fast) to generate a strong induced voltage spike!',
      check: (s) => s.num('Turns', 1) >= 2 && (s.interacted || s.watched),
    },
    yourNumbers: (s) => {
      const idx = s.num('Turns', 1);
      const N = [20, 50, 100, 200][idx] || 50;
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
      prompt: 'Set Distance between sticks to 5,000 stadia (~800 km) and Shadow angle to 7.2° to reproduce Eratosthenes’ circumference of the Earth!',
      check: (s) => Math.abs(s.num('Distance', 5000) - 5000) <= 250 && Math.abs(s.num('Shadow angle', 7.2) - 7.2) <= 0.3,
    },
    yourNumbers: (s) => {
      const d = s.num('Distance', 5000);
      const th = s.num('Shadow angle', 7.2);
      const frac = 360 / Math.max(0.5, th);
      const circStadia = Math.round(d * frac);
      const stadiaM = [157.5, 185][s.tab(0)] || 157.5;
      const circKm = Math.round((circStadia * stadiaM) / 1000);
      return `C = (360° ÷ θ) × d = (360° ÷ ${th.toFixed(1)}°) × ${d} stadia ≈ ${circKm.toLocaleString('en-GB')} km (true Earth: 40,008 km)`;
    },
    cutaway: 'Inside the alternate-interior geometry: because the Sun is 150 million km away, its rays arrive parallel; the stick’s shadow angle at Alexandria equals the angle between the two cities at Earth’s centre.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: At noon on the solstice, a vertical well at Syene has no shadow while Alexandria casts a 7.2° shadow.', act: (s) => { s.setSlider('Distance', 5000); s.setSlider('Shadow angle', 7.2); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Parallel sunbeams mean the 7.2° shadow angle equals the central angle between the two cities.' },
      { title: '3. Cut-away', caption: '3/5 Cut-away: 7.2° is exactly 1/50th of a full 360° circle, so Earth’s circumference is 50 × the distance.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Comparing Egyptian (157.5 m) and Attic (185 m) stadia shows how close Eratosthenes came to 40,008 km.', act: (s) => s.selectTab(0, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Adjust distance and shadow angle to measure the planet.', cutaway: false },
    ],
    idealised: 'Syene and Alexandria are treated as lying on the exact same north–south meridian (in reality they differ by ~3° of longitude).',
  },

  seasons: {
    challenge: {
      prompt: 'Set Date to the June solstice (around day 172) and compare Mumbai (19° N), Tromsø (69° N), and Melbourne (38° S).',
      check: (s) => Math.abs(s.num('Date', 172) - 172) <= 15 && s.tab(0) > 0,
    },
    yourNumbers: (s) => {
      const day = s.num('Date', 172);
      const decl = 23.44 * Math.sin(((day - 81) / 365) * 2 * Math.PI);
      const lats = [19, 69, -38];
      const lat = lats[s.tab(0)] ?? 19;
      const noonAlt = Math.max(0, Math.min(90, 90 - Math.abs(lat - decl)));
      const fluxPct = Math.round(Math.sin((noonAlt * Math.PI) / 180) * 100);
      return `δ_Sun = ${decl.toFixed(1)}°, noon altitude θ = ${noonAlt.toFixed(0)}°  →  beam spread sin θ = ${fluxPct}% of direct overhead W/m²`;
    },
    cutaway: 'Inside the tilted beam: a 1 m² bundle of sunlight hitting the ground at 30° spreads over 1/sin(30°) = 2.0 m², halving the watts warming each square metre.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Earth’s 23.4° axis keeps pointing toward Polaris all year as the planet orbits the Sun.', act: (s) => { s.selectTab(0, 0); s.setSlider('Date', 172); } },
      { title: '2. Close-up', caption: '2/5 Close-up: In June the northern hemisphere leans toward the Sun, making noon sunlight steep and concentrated.', act: (s) => s.selectTab(0, 1) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Why beam angle—not Earth’s tiny 3% orbital distance change—drives summer and winter.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Half a year later in December (day 355), the southern hemisphere gets the steep beam.', act: (s) => { s.selectTab(0, 2); s.setSlider('Date', 355); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Scrub through the year or try the torch-on-graph-paper view.', cutaway: false },
    ],
    idealised: 'Atmospheric absorption and seasonal thermal lag of the oceans (which delays peak summer temperatures by ~4 weeks) are omitted.',
  },

  phases: {
    challenge: {
      prompt: 'Switch to "From Mumbai" and set Day of the month to Day 14.8 (Full Moon) to see the fully lit disc.',
      check: (s) => s.tab(0) === 1 && Math.abs(s.num('Day of the month', 4) - 14.8) <= 1.2,
    },
    yourNumbers: (s) => {
      const day = s.num('Day of the month', 4);
      const angle = (day / 29.5) * 2 * Math.PI;
      const litPct = Math.round(((1 - Math.cos(angle)) / 2) * 100);
      return `Day ${day.toFixed(1)} of 29.5  |  elongation φ = ${Math.round((angle * 180) / Math.PI)}°  →  earth-facing lit fraction = ½(1 − cos φ) = ${litPct}%`;
    },
    cutaway: 'Inside the geometry of phases: the Sun always illuminates 50% of the lunar sphere; phases are simply how much of that sunlit hemisphere faces Earth as the Moon orbits.',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: Seen from above the orbit, half the Moon is always sunlit—Earth’s shadow is nowhere near it.', act: (s) => { s.selectTab(0, 0); s.setSlider('Day of the month', 4.0); } },
      { title: '2. Close-up', caption: '2/5 Close-up: At Day 7.4 (First Quarter), we look side-on at the terminator and see a half-moon.', act: (s) => s.setSlider('Day of the month', 7.5) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: Why the Moon’s 5° orbital tilt lets sunlight pass past Earth at Full Moon without an eclipse most months.', cutaway: true, act: (s) => s.setSlider('Day of the month', 14.8) },
      { title: '4. Side-on trend', caption: '4/5 Trend: Switching to "From Mumbai" shows the waxing and waning crescent views from the ground.', act: (s) => s.selectTab(0, 1) },
      { title: '5. Your turn', caption: '5/5 Your turn: Scrub through all 29.5 days and toggle true scale.', cutaway: false },
    ],
    idealised: 'The lunar orbit is drawn circular; in reality its slight eccentricity causes a small ~6° libration wobble.',
  },

  parallax: {
    challenge: {
      prompt: 'Switch to "Through the telescope" and sweep Month from January (0) to July (6) to measure the star’s 6-month baseline shift!',
      check: (s) => s.tab(0) === 1 && s.num('Month', 0) >= 5.0 && s.num('Month', 0) <= 7.0,
    },
    yourNumbers: (s) => {
      const v = s.num('Star distance', 20);
      const dPc = +(1.3 * Math.pow(1.06, v)).toFixed(2);
      const pArcsec = 1 / dPc;
      return `d (parsecs) = 1 ÷ p (arcsec)  |  baseline = 2 AU (Jan ↔ Jul)  →  p = ${pArcsec.toFixed(3)}″, d = ${dPc.toFixed(1)} pc (${(dPc * 3.26).toFixed(1)} ly)`;
    },
    cutaway: 'Inside the 1 AU triangle: 1 parsec is the distance where Earth’s 150-million-km orbital radius subtends an angle of 1 arcsecond (1/3,600 of a degree, the width of a rupee coin at 5 km).',
    watch: [
      { title: '1. Wide view', caption: '1/5 Wide shot: As Earth moves from January to July, our sightline to a nearby star tilts against distant background stars.', act: (s) => { s.selectTab(0, 0); s.setSlider('Month', 0); s.setSlider('Star distance', 10); } },
      { title: '2. Close-up', caption: '2/5 Close-up: Six months later (July), Earth is 300 million km to the other side, shifting the star’s apparent position.', act: (s) => s.setSlider('Month', 6.0) },
      { title: '3. Cut-away', caption: '3/5 Cut-away: How a tiny parallax angle p in arcseconds gives distance d = 1/p parsecs by pure trigonometry.', cutaway: true },
      { title: '4. Side-on trend', caption: '4/5 Trend: Through the telescope, moving the star farther away shrinks its annual wobble.', act: (s) => { s.selectTab(0, 1); s.setSlider('Star distance', 50); } },
      { title: '5. Your turn', caption: '5/5 Your turn: Switch telescope view and sweep between January and July.', cutaway: false },
    ],
    idealised: 'Parallax angles in the diagram are exaggerated by ~100,000× so the triangle and telescope shift are visible to the naked eye.',
  },

  expansion: {
    challenge: {
      prompt: 'Switch home galaxy to "Me: ant at 12 cm" and stretch the band to ×2.00 to verify that Hubble’s law looks identical from every galaxy!',
      check: (s) => s.tab(0) === 2 && Math.abs(s.num('Stretch factor', 1.0) - 2.0) <= 0.08,
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
      prompt: 'Set Stiffness to 20 N/m to tune the test oscillator.',
      check: (s) => Math.abs(s.num('Stiffness', 10) - 20) <= 1,
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
};
