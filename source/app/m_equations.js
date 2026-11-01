// Interactive Symbol & Unit Breakdown on Equations (:::eq), Frosted-Glass Living Equation Lens,
// and the Connected Formula & Archetype Atlas (#formula-atlas).
import App from './core.js';

const { el } = App;

const LENS_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12.4 12.4 L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

export const EQ_DB = [
  // ---- Chapter 1: Motion
  {
    match: /constant acceleration|distance from rest/i,
    title: 'Uniform acceleration (v = u + at, s = ut + ½at²)',
    formula: 'v = u + at   ·   s = ut + ½at²',
    domain: 'Mechanics',
    section: '#s1-4',
    summary: 'With constant acceleration, velocity climbs linearly with time while displacement is the area under the v–t line: a rectangle ut plus a triangle ½at².',
    why: 'Area under the velocity–time graph: steady speed u over time t gives rectangle ut; the extra speed at gained over time t adds a triangle of area ½ × t × at = ½at².',
    scales: [
      { label: 'Start from rest (u = 0), 2× time t', result: 'v doubles (2×); distance s quadruples (4×, Galileo’s 1, 4, 9, 16)' },
      { label: 'Start from rest (u = 0), 3× time t', result: 'v triples (3×); distance s grows 9× (odd-number gaps 1, 3, 5, 7)' },
    ],
    limit: 'Holds only when acceleration a is constant; once air drag grows with speed, a shrinks and the v–t graph curves toward terminal speed.',
    terms: [
      { sym: 's', name: 'Displacement (distance)', unit: 'metres, m', note: 'Total ground covered in time t' },
      { sym: 'u', name: 'Initial velocity', unit: 'metres per second, m/s', note: 'Starting velocity at t = 0 (zero when dropped from rest)' },
      { sym: 'v', name: 'Final velocity', unit: 'metres per second, m/s', note: 'Velocity after accelerating for time t' },
      { sym: 'a', name: 'Acceleration', unit: 'metres per second squared, m/s²', note: 'Steady rate of gain of velocity (9.8 m/s² in free fall)' },
      { sym: 't', name: 'Time elapsed', unit: 'seconds, s', note: 'Appears squared (t²) in the triangle term ½at²' },
    ],
  },

  // ---- Chapter 2: Friction & Moments
  {
    match: /static friction|sliding friction/i,
    title: 'Static and sliding (kinetic) friction',
    formula: 'f_s ≤ μ_s N   ·   f_k = μ_k N',
    domain: 'Mechanics',
    section: '#s2-4',
    summary: 'Microscopic surface peaks interlock and weld; pressing the surfaces harder together (increasing N) increases the maximum grip proportionally.',
    why: 'Only a tiny fraction of a block’s apparent area actually touches at microscopic peaks (asperities). Pressing harder (larger N) flattens those peaks and increases the true contact area in direct proportion to N.',
    scales: [
      { label: 'Double the normal load N', result: 'Maximum static grip and sliding friction both double (2×)' },
      { label: 'Turn a brick onto its narrow face (same N)', result: 'Friction stays almost unchanged—smaller area presses harder per peak' },
    ],
    limit: 'Empirical rule for dry rigid solids at moderate pressures; breaks down when surfaces melt (ice skates), lubricate, or peel like sticky tape.',
    terms: [
      { sym: 'f_s, f_k', name: 'Static / sliding friction force', unit: 'newtons, N', note: 'Static friction matches your push up to μ_s N; sliding friction is slightly smaller' },
      { sym: 'μ_s, μ_k', name: 'Coefficients of friction', unit: 'dimensionless ratio (no unit)', note: 'Depends on the pair of materials (e.g. rubber on dry tarmac ~0.8, ice on steel ~0.03)' },
      { sym: 'N', name: 'Normal contact force', unit: 'newtons, N', note: 'How hard the two surfaces are pressed perpendicularly together' },
    ],
  },
  {
    match: /moment of a force|clockwise moment/i,
    title: 'Moment of a force & principle of moments',
    formula: 'M = F × d_⊥   ·   ΣM_cw = ΣM_acw',
    domain: 'Mechanics',
    section: '#s2-5',
    summary: 'The turning effect of a force around a pivot equals the force multiplied by the perpendicular lever arm from the pivot to the line of action.',
    why: 'A push straight through the hinge only squeezes the hinge pins; only the lever arm d_⊥ perpendicular to the force gives mechanical leverage to turn the beam.',
    scales: [
      { label: 'Push 3× farther from the hinge (3× d_⊥)', result: '3× the turning moment for the same push—why door handles sit far from hinges' },
      { label: 'Push along the door toward the hinge (d_⊥ = 0)', result: 'Zero moment—the door does not turn however hard you push' },
    ],
    limit: 'Rotational balance (clockwise = anticlockwise) prevents spinning; full equilibrium also requires zero net force so the pivot does not accelerate.',
    terms: [
      { sym: 'M', name: 'Moment (turning effect / torque)', unit: 'newton-metres, N·m', note: 'Not joules—here force and distance are perpendicular, not aligned' },
      { sym: 'F', name: 'Applied force', unit: 'newtons, N', note: 'Push or pull acting on the lever or spanner' },
      { sym: 'd_⊥', name: 'Perpendicular distance from pivot', unit: 'metres, m', note: 'Shortest right-angle distance from pivot to the force’s line of action' },
    ],
  },

  // ---- Chapter 3: Newton's Laws, Springs, Atwood, Momentum
  {
    match: /net force\s*=\s*mass|F\s*=\s*ma/i,
    title: 'Newton’s second law of motion',
    formula: 'F_net = m a',
    domain: 'Mechanics',
    section: '#s3-2',
    summary: 'The net (resultant) force on an object equals its mass multiplied by the acceleration that force produces.',
    why: 'Acceleration is proportional to the unbalanced push F_net and inversely proportional to how much inertia m must be accelerated: a = F_net / m.',
    scales: [
      { label: 'Double the net force F_net (same mass)', result: 'Acceleration a doubles (2×)' },
      { label: 'Triple the loaded cart mass m (same F_net)', result: 'Acceleration drops to one-third (⅓×)' },
    ],
    limit: 'Requires constant mass m and speeds well below light (v ≪ c); when mass changes (rockets), use F = dp/dt.',
    terms: [
      { sym: 'F', name: 'Net (resultant) force', unit: 'newtons, N (1 N = 1 kg·m/s²)', note: 'Vector sum of all forces acting on the body' },
      { sym: 'm', name: 'Mass (inertia)', unit: 'kilograms, kg', note: 'Resistance to any change in velocity' },
      { sym: 'a', name: 'Acceleration', unit: 'metres per second squared, m/s²', note: 'Rate of change of velocity, always in the direction of F_net' },
    ],
  },
  {
    match: /weight\s*=\s*mass/i,
    title: 'Weight in a gravitational field',
    formula: 'W = m g',
    domain: 'Mechanics',
    section: '#s3-2',
    summary: 'Weight is the gravitational pull of a planet on a mass. Near Earth’s surface each kilogram is pulled down with 9.8 N.',
    why: 'Gravity pulls every kilogram of matter with the same local field strength g, so total gravitational force scales strictly with mass m.',
    scales: [
      { label: 'Take a 40 kg person to the Moon (g = 1.6 N/kg)', result: 'Mass stays 40 kg; weight W drops from 392 N to 64 N (⅙×)' },
      { label: 'Double the mass m at the same place', result: 'Weight W doubles (2×), and inertia m also doubles so free-fall a stays g' },
    ],
    limit: 'g ≈ 9.8 N/kg is the value near Earth’s surface; it weakens with altitude as GM / r².',
    terms: [
      { sym: 'W', name: 'Weight', unit: 'newtons, N', note: 'Downward gravitational pull on the object' },
      { sym: 'm', name: 'Mass', unit: 'kilograms, kg', note: 'Intrinsic amount of matter, unchanged everywhere' },
      { sym: 'g', name: 'Gravitational field strength', unit: 'newtons per kilogram, N/kg (or m/s²)', note: '9.8 N/kg on Earth; 1.6 N/kg on the Moon' },
    ],
  },
  {
    match: /spring constant|F\s*=\s*kx/i,
    title: 'Hooke’s law for elastic springs & bonds',
    formula: 'F = k x',
    domain: 'Mechanics',
    section: '#s3-3',
    summary: 'Below the limit of proportionality, the restoring or stretching force of a spring is directly proportional to its extension or compression x.',
    why: 'For small displacements around equilibrium, atomic bonds and coiled wire act linearly: each identical turn of wire shares the stretch equally.',
    scales: [
      { label: 'Double the hanging load F', result: 'Extension x doubles (2×)' },
      { label: 'Use a table top (huge k) vs a soft spring (small k)', result: 'Same 10 N load gives microscopic sag x = F/k on the table, large stretch on the spring' },
    ],
    limit: 'Holds only up to the limit of proportionality; beyond the elastic limit the spring deforms permanently.',
    terms: [
      { sym: 'F', name: 'Applied or restoring force', unit: 'newtons, N', note: 'Load stretching or compressing the spring' },
      { sym: 'k', name: 'Spring constant (stiffness)', unit: 'newtons per metre, N/m (or N/cm)', note: 'Slope of the load–extension graph' },
      { sym: 'x', name: 'Extension (or compression)', unit: 'metres, m (or cm)', note: 'Stretched length minus original unstretched length' },
    ],
  },
  {
    match: /Atwood machine/i,
    title: 'The Atwood machine (coupled acceleration & tension)',
    formula: 'a = (m₁ − m₂)g ÷ (m₁ + m₂)   ·   T = 2m₁m₂g ÷ (m₁ + m₂)',
    domain: 'Mechanics',
    section: '#s3-4',
    summary: 'Two masses on a frictionless pulley accelerate together under their weight difference (m₁ − m₂)g while sharing the combined inertia (m₁ + m₂).',
    why: 'Unfold the rope into a 1D line: internal tensions +T and −T cancel, leaving net pull (m₁ − m₂)g to accelerate both masses (m₁ + m₂) at once. T is always sandwiched between m₂g and m₁g.',
    scales: [
      { label: 'Equal masses (m₁ = m₂)', result: 'a = 0 m/s² (balanced) and T = m₁g = m₂g' },
      { label: 'Nearly equal masses (0.55 kg & 0.45 kg)', result: 'Gravity is diluted 10× to a = 0.10 g = 0.98 m/s²; T = 4.85 N' },
      { label: 'Remove m₂ → 0 (free fall of m₁)', result: 'a → g = 9.8 m/s² and string tension T → 0 N' },
    ],
    limit: 'Assumes a massless, unstretchable string and a frictionless, massless pulley; a real pulley wheel of rotational inertia I adds I/R² to the denominator m₁ + m₂.',
    terms: [
      { sym: 'a', name: 'System acceleration', unit: 'metres per second squared, m/s²', note: 'Shared magnitude: m₁ accelerates down at a, m₂ accelerates up at a' },
      { sym: 'T', name: 'String tension', unit: 'newtons, N', note: 'Harmonic mean of weights; strictly m₂g < T < m₁g when m₁ > m₂' },
      { sym: 'm₁, m₂', name: 'Hanging masses', unit: 'kilograms, kg', note: '(m₁ − m₂)g drives the motion; (m₁ + m₂) resists it as total inertia' },
      { sym: 'g', name: 'Acceleration of free fall', unit: '9.8 m/s²', note: 'Diluted by the dimensionless ratio (m₁ − m₂)/(m₁ + m₂)' },
    ],
  },
  {
    match: /momentum.*p\s*=\s*mv|dp\/dt/i,
    title: 'Momentum, impulse & Newton’s second law (F = dp/dt)',
    formula: 'p = mv   ·   F Δt = Δp   ·   F_net = Δp/Δt = dp/dt',
    domain: 'Mechanics',
    section: '#s3-5',
    summary: 'Momentum p = mv measures how hard a moving body is to stop; net force is the rate of change of momentum, reducing to F = ma when mass is constant.',
    why: 'Rearranging F = m(Δv/Δt) gives F Δt = Δ(mv): force acting over time delivers impulse Δp. Dividing by Δt gives Newton’s general form F_net = dp/dt.',
    scales: [
      { label: 'Stop the same ball in 5× longer time Δt (riding back with hands)', result: 'Average stopping force F drops to one-fifth (⅕×)' },
      { label: 'Two carts push off each other (F₁ = −F₂ for same Δt)', result: 'Δp₁ = −Δp₂, so total momentum p₁ + p₂ is strictly conserved' },
    ],
    limit: 'F_net = dp/dt and momentum conservation hold everywhere in physics, even for rockets losing mass and relativistic particles (with p = γmv).',
    terms: [
      { sym: 'p', name: 'Linear momentum', unit: 'kilogram-metres per second, kg·m/s (or N·s)', note: 'Vector pointing along velocity v' },
      { sym: 'F Δt', name: 'Impulse', unit: 'newton-seconds, N·s', note: 'Equals the change in momentum Δp' },
      { sym: 'dp/dt', name: 'Rate of change of momentum', unit: 'newtons, N (kg·m/s²)', note: 'Newton’s general second law; equals ma when m is constant' },
    ],
  },

  // ---- Chapter 4: Free Fall, Drag & Circular Motion
  {
    match: /mass cancels out of free fall|m\s*a\s*=\s*m\s*g/i,
    title: 'Equivalence of inertial and gravitational mass (a = g)',
    formula: 'm a = m g   →   a = g',
    domain: 'Mechanics',
    section: '#s4-1',
    summary: 'In a vacuum, a heavy lead ball and a feather fall with the exact same acceleration g because mass m appears on both sides of ma = mg and cancels.',
    why: 'Twice the mass gets twice the gravitational pull (2mg), but also has twice the inertia (2m) resisting acceleration—so ratio a = F/m = g is independent of mass.',
    scales: [
      { label: '10× heavier stone in vacuum', result: '10× gravity pull ÷ 10× inertia = exact same acceleration g = 9.8 m/s²' },
    ],
    limit: 'Exact in vacuum (tested to 1 part in 10¹⁵); in air, drag ½ρC_dAv² breaks the cancellation for light, wide objects like feathers.',
    terms: [
      { sym: 'm', name: 'Mass (inertial and gravitational)', unit: 'kilograms, kg', note: 'Cancels from both sides when gravity is the only force' },
      { sym: 'a', name: 'Free-fall acceleration', unit: 'metres per second squared, m/s²', note: 'Equals g for every falling body in vacuum' },
      { sym: 'g', name: 'Acceleration due to gravity', unit: '9.8 m/s² near Earth', note: '1.6 m/s² on the Moon (Apollo 15 hammer & feather)' },
    ],
  },
  {
    match: /air drag|F_drag/i,
    title: 'Quadratic air drag & terminal speed',
    formula: 'F_drag = ½ ρ C_d A v²   ·   at v_t: ½ ρ C_d A v_t² = mg',
    domain: 'Mechanics',
    section: '#s4-2',
    summary: 'Moving through air at speed v scoops up ρAv of air mass per second and accelerates it to ~v, producing a drag force proportional to v².',
    why: 'Doubling your speed hits twice as many air molecules per second and imparts twice the momentum to each, multiplying the drag force by 2 × 2 = 4 (v²).',
    scales: [
      { label: 'Double the falling speed v', result: 'Air drag F_drag quadruples (4×)' },
      { label: 'Open a parachute (increase area A by 100×)', result: 'Terminal speed v_t = √(2mg / ρC_dA) drops to one-tenth (⅒×)' },
    ],
    limit: 'Applies to everyday speeds and sizes (raindrops, cyclists, skydivers); tiny dust grains moving very slowly experience viscous drag proportional to v instead of v².',
    terms: [
      { sym: 'F_drag', name: 'Aerodynamic drag force', unit: 'newtons, N', note: 'Always opposes the velocity relative to the air' },
      { sym: 'ρ', name: 'Air density', unit: 'kilograms per cubic metre, kg/m³', note: '~1.2 kg/m³ at sea level' },
      { sym: 'C_d', name: 'Drag coefficient', unit: 'dimensionless', note: 'Shape factor (~0.47 for a sphere, ~1.0–1.3 for a skydiver)' },
      { sym: 'A', name: 'Cross-sectional area', unit: 'square metres, m²', note: 'Frontal area pushing through the air' },
      { sym: 'v, v_t', name: 'Speed / terminal speed', unit: 'metres per second, m/s', note: 'At v_t, upward drag balances downward weight mg so a = 0' },
    ],
  },
  {
    match: /centripetal/i,
    title: 'Centripetal acceleration & centripetal force',
    formula: 'a_c = v² ÷ r   ·   F_c = m v² ÷ r',
    domain: 'Mechanics',
    section: '#s4-4',
    summary: 'To bend a straight path of speed v into a circle of radius r requires an inward acceleration v²/r and an inward net force mv²/r toward the centre.',
    why: 'In a short time Δt on a circle, the velocity vector turns by angle Δθ = vΔt/r, so the inward velocity change is Δv = vΔθ = (v²/r)Δt.',
    scales: [
      { label: 'Take the same corner at 2× the speed v', result: 'Required inward grip F_c quadruples (4×)—why fast corners skid' },
      { label: 'Widen the turn radius r by 2× at the same speed', result: 'Required inward force F_c halves (½×)' },
    ],
    limit: 'Centripetal force is not a new fifth force on a diagram—it is the job done by tension, gravity, or road friction.',
    terms: [
      { sym: 'a_c', name: 'Centripetal acceleration', unit: 'metres per second squared, m/s²', note: 'Points toward the centre of the circle' },
      { sym: 'F_c', name: 'Centripetal force', unit: 'newtons, N', note: 'Net inward force supplied by string tension, gravity, or friction' },
      { sym: 'v', name: 'Orbital or tangential speed', unit: 'metres per second, m/s', note: 'Squared: doubling speed needs 4× the inward pull' },
      { sym: 'r', name: 'Radius of circular path', unit: 'metres, m', note: 'Tighter curve (smaller r) needs a larger inward force' },
    ],
  },

  // ---- Chapter 5: Universal Gravitation
  {
    match: /G\s*m.*r²|Gm₁m₂/i,
    title: 'Newton’s law of universal gravitation',
    formula: 'F = G m₁ m₂ ÷ r²',
    domain: 'Fields',
    section: '#s5-3',
    summary: 'Every mass pulls every other mass with a force proportional to both masses and inversely proportional to the square of their centre-to-centre distance.',
    why: 'Gravitational influence spreads out over spherical shells of area 4πr², diluting the field strength as 1/r² (the Moon at 60 Earth radii gets 1/3600 of surface g).',
    scales: [
      { label: 'Move 2× farther between centres (2r)', result: 'Gravitational pull drops to one-quarter (¼×)' },
      { label: 'Move to the Moon’s orbit (60 Earth radii)', result: 'Acceleration drops to g / 60² = 9.8 / 3600 ≈ 0.00272 m/s²' },
    ],
    limit: 'Extremely accurate throughout the solar system; near black holes or for Mercury’s tiny perihelion shift, Einstein’s general relativity replaces it.',
    terms: [
      { sym: 'F', name: 'Gravitational force', unit: 'newtons, N', note: 'Equal and opposite on both masses (Newton’s third law)' },
      { sym: 'G', name: 'Universal gravitational constant', unit: '6.674 × 10⁻¹¹ N·m²/kg²', note: 'Measured in the lab by Henry Cavendish in 1798' },
      { sym: 'm₁, m₂', name: 'The two interacting masses', unit: 'kilograms, kg', note: 'Spherical bodies pull as if all their mass were at their centre' },
      { sym: 'r', name: 'Distance between centres', unit: 'metres, m', note: 'Measured from centre to centre, not surface to surface' },
    ],
  },

  // ---- Chapter 6: Pressure, Gas Laws, Hydraulics & Buoyancy
  {
    match: /pressure\s*=\s*force|p\s*=\s*F\s*÷\s*A/i,
    title: 'Pressure on a surface',
    formula: 'p = F ÷ A',
    domain: 'Matter & Heat',
    section: '#s6-1',
    summary: 'Pressure measures how concentrated a perpendicular force is over the area it presses on.',
    why: 'A sharp knife edge or drawing pin concentrates a modest push F onto a tiny contact area A, producing an enormous local stress F/A that parts the material.',
    scales: [
      { label: 'Shrink the contact area A by 100× (blunt vs sharp blade)', result: 'Pressure p increases 100× for the exact same push F' },
      { label: 'Spread your weight over wide snowshoes (10× area A)', result: 'Pressure on the snow drops to one-tenth (⅒×) so you don’t sink' },
    ],
    limit: 'Defines average pressure over area A; in a fluid at rest, pressure acts equally in all directions at a given depth.',
    terms: [
      { sym: 'p', name: 'Pressure', unit: 'pascals, Pa (1 Pa = 1 N/m²)', note: 'Sea-level atmospheric pressure is ~101,300 Pa (~10 N per cm²)' },
      { sym: 'F', name: 'Normal force', unit: 'newtons, N', note: 'Push perpendicular to the surface' },
      { sym: 'A', name: 'Contact area', unit: 'square metres, m²', note: '1 cm² = 10⁻⁴ m²' },
    ],
  },
  {
    match: /Boyle.*law|p₁\s*V₁\s*=\s*p₂\s*V₂/i,
    title: 'Boyle’s law for a fixed mass of gas at constant temperature',
    formula: 'p₁ V₁ = p₂ V₂',
    domain: 'Matter & Heat',
    section: '#s6-3',
    summary: 'At constant temperature, halving the volume of a trapped gas doubles its pressure because the same molecules hit the walls twice as crowded.',
    why: 'Constant temperature keeps average molecular speed fixed; halving the volume V packs twice as many molecules into each cubic centimetre, doubling the wall collision rate.',
    scales: [
      { label: 'Halve the gas volume (V₂ = ½V₁) slowly', result: 'Pressure doubles (p₂ = 2p₁)' },
      { label: 'Bubble rises from 10 m depth (2 atm) to surface (1 atm)', result: 'Bubble volume doubles (2×) on the way up' },
    ],
    limit: 'Requires constant mass of gas and constant temperature (slow compression); at very high pressures where molecules crowd together, real gases deviate.',
    terms: [
      { sym: 'p₁, p₂', name: 'Initial and final gas pressure', unit: 'pascals, Pa (or atm)', note: 'Must be absolute pressure, not gauge pressure above atmospheric' },
      { sym: 'V₁, V₂', name: 'Initial and final gas volume', unit: 'cubic metres, m³ (or cm³, L)', note: 'Inversely proportional to absolute pressure: p ∝ 1/V' },
    ],
  },
  {
    match: /hydraulic force multiplier|F₁\s*÷\s*A₁/i,
    title: 'Pascal’s hydraulic force multiplier',
    formula: 'p = F₁ ÷ A₁ = F₂ ÷ A₂   →   F₂ = F₁ (A₂ ÷ A₁)',
    domain: 'Matter & Heat',
    section: '#s6-4',
    summary: 'An enclosed liquid transmits extra pressure p equally everywhere, so a wide piston of 20× the area experiences 20× the force of a narrow piston.',
    why: 'By Pascal’s principle, pressure p = F₁/A₁ is the same under both pistons. Multiplying that shared pressure by a larger area A₂ yields F₂ = (A₂/A₁)F₁.',
    scales: [
      { label: 'Output piston has 20× the area (A₂ = 20 A₁)', result: 'Output force F₂ is 20× larger, but moves 1/20th the distance (work F₁d₁ = F₂d₂ conserved!)' },
    ],
    limit: 'Requires an nearly incompressible liquid (oil or water) with no trapped air bubbles that would squash instead of transmitting the push.',
    terms: [
      { sym: 'p', name: 'Transmitted fluid pressure', unit: 'pascals, Pa (or N/cm²)', note: 'Passed undiminished throughout the enclosed oil' },
      { sym: 'F₁, F₂', name: 'Input and output piston forces', unit: 'newtons, N', note: 'Force ratio equals area ratio A₂/A₁' },
      { sym: 'A₁, A₂', name: 'Input and output piston areas', unit: 'square metres, m² (or cm²)', note: 'Work is never multiplied: F₁d₁ = F₂d₂' },
    ],
  },
  {
    match: /Δp\s*=|ρ\s*g\s*Δh/i,
    title: 'Hydrostatic fluid pressure with depth',
    formula: 'Δp = ρ g Δh',
    domain: 'Matter & Heat',
    section: '#s6-4',
    summary: 'Going Δh deeper in a fluid of density ρ raises the pressure by ρgΔh—the weight of a column of fluid of unit area overhead.',
    why: 'A vertical column of area A and height Δh has volume AΔh, mass ρAΔh, and weight ρgAΔh. Dividing that weight by area A cancels A, leaving Δp = ρgΔh.',
    scales: [
      { label: 'Go 2× deeper in the same lake (2× Δh)', result: 'Gauge water pressure Δp doubles (2×); every 10 m of sea adds ~1 atm' },
      { label: 'Make the lake 10× wider at the same depth Δh', result: 'Pressure on the dam wall does not change at all!' },
    ],
    limit: 'Assumes constant fluid density ρ and uniform gravity g; in the atmosphere, air density ρ thins exponentially with altitude.',
    terms: [
      { sym: 'Δp', name: 'Pressure increase with depth', unit: 'pascals, Pa', note: 'Added on top of atmospheric pressure p_atm at the surface' },
      { sym: 'ρ', name: 'Fluid density', unit: 'kilograms per cubic metre, kg/m³', note: 'Fresh water: 1,000 kg/m³; sea water: 1,025 kg/m³' },
      { sym: 'g', name: 'Gravitational field strength', unit: '9.8 N/kg (or m/s²)', note: 'Weight per kilogram' },
      { sym: 'Δh', name: 'Vertical depth change', unit: 'metres, m', note: 'Measured straight down from the free surface' },
    ],
  },
  {
    match: /density.*ρ\s*=\s*m\s*÷\s*V|Archimedes.*buoyant/i,
    title: 'Density & Archimedes’ buoyant force',
    formula: 'ρ = m ÷ V   ·   F_b = ρ_fluid V_displaced g',
    domain: 'Matter & Heat',
    section: '#s6-5',
    summary: 'Density is mass packed per unit volume; any immersed object feels an upward buoyant force equal to the weight of the fluid it displaces.',
    why: 'Fluid pressure is higher on the deeper bottom face of a submerged body than on its top face by Δp = ρ_fluid g h; multiplying by face area A gives ρ_fluid V_disp g.',
    scales: [
      { label: 'Average density ρ_obj < ρ_fluid (hollow steel hull)', result: 'Floats with fraction ρ_obj / ρ_fluid submerged (ice in water: 920/1000 = 92%)' },
      { label: 'Average density ρ_obj > ρ_fluid (solid steel coin)', result: 'Weight mg exceeds max buoyant force ρ_fluid V g, so it sinks' },
    ],
    limit: 'Applies to any fluid in a gravitational field; in weightless free fall (g_eff = 0), pressure gradients vanish and buoyancy disappears.',
    terms: [
      { sym: 'ρ', name: 'Density', unit: 'kilograms per cubic metre, kg/m³ (or g/cm³)', note: '1 g/cm³ = 1,000 kg/m³ (fresh water)' },
      { sym: 'm, V', name: 'Mass and volume', unit: 'kg and m³', note: 'For a hollow ship, average density includes the enclosed air volume' },
      { sym: 'F_b', name: 'Buoyant force (upthrust)', unit: 'newtons, N', note: 'Weight of the displaced fluid: m_fluid × g = ρ_fluid V_disp g' },
    ],
  },

  // ---- Chapter 7: Energy, Work & Power
  {
    match: /kinetic store.*elastic store|Eₑ\s*=\s*½\s*k\s*x²/i,
    title: 'Mechanical energy stores (kinetic, gravitational, elastic)',
    formula: 'Eₖ = ½ m v²   ·   ΔEₚ = m g Δh   ·   Eₑ = ½ k x²',
    domain: 'Energy',
    section: '#s7-1',
    summary: 'The three mechanical stores track energy in motion (½mv²), in height against gravity (mgΔh), and in a stretched or compressed spring (½kx²).',
    why: 'Each formula is the area under its force–displacement graph: constant gravity mg over Δh gives rectangle mgΔh; linear spring force kx over x gives triangle ½kx².',
    scales: [
      { label: 'Double the speed v or spring stretch x', result: 'Kinetic store Eₖ and elastic store Eₑ both quadruple (4×)' },
      { label: 'Double the height change Δh', result: 'Gravitational store ΔEₚ doubles (2×)' },
    ],
    limit: 'Total mechanical energy Eₖ + Eₚ + Eₑ stays constant only when friction and air drag are zero; otherwise part shifts into the thermal store.',
    terms: [
      { sym: 'Eₖ', name: 'Kinetic energy store', unit: 'joules, J', note: 'Energy of a moving mass m at speed v' },
      { sym: 'ΔEₚ', name: 'Gravitational potential store change', unit: 'joules, J', note: 'Energy stored by lifting mass m through vertical height Δh' },
      { sym: 'Eₑ', name: 'Elastic potential energy store', unit: 'joules, J', note: 'Area ½kx² under the Hooke’s-law F = kx triangle' },
    ],
  },
  {
    match: /^kinetic energy:\s*Eₖ\s*=\s*½\s*m\s*v²/i,
    title: 'Kinetic energy (energy in the kinetic store)',
    formula: 'Eₖ = ½ m v²',
    domain: 'Energy',
    section: '#s7-2',
    summary: 'The energy a moving object holds in its kinetic store grows in proportion to its mass and with the square of its speed.',
    why: 'Accelerating a mass m from rest with force F = ma over distance d = ½at² requires work W = Fd = (ma)(½at²) = ½m(at)² = ½mv².',
    scales: [
      { label: 'Double the speed v (e.g. 30 km/h → 60 km/h)', result: 'Kinetic energy Eₖ and braking distance both quadruple (4×)!' },
      { label: 'Triple the speed v (20 km/h → 60 km/h)', result: 'Kinetic energy Eₖ grows 9× (while momentum mv only triples)' },
    ],
    limit: 'Classical form valid for v ≪ c; near the speed of light, relativistic kinetic energy grows without bound as (γ − 1)mc².',
    terms: [
      { sym: 'Eₖ', name: 'Kinetic energy', unit: 'joules, J', note: 'Always positive or zero (scalar—independent of direction)' },
      { sym: 'm', name: 'Mass', unit: 'kilograms, kg', note: '20 g marble at 4.43 m/s holds 0.196 J' },
      { sym: 'v', name: 'Speed', unit: 'metres per second, m/s', note: 'Squared (v²): explains ’s Gravesande’s 4× deeper clay dents' },
    ],
  },
  {
    match: /work\s*=\s*force|W\s*=\s*F\s*×\s*d|W\s*=\s*F\s*s\s*cos/i,
    title: 'Mechanical work done by a force (including at an angle θ)',
    formula: 'W = F × d   ·   general: W = F s cos θ',
    domain: 'Energy',
    section: '#s7-3',
    summary: 'Work is the energy transferred when a force moves an object; only the component of force along the displacement (F cos θ) does work.',
    why: 'Splitting force F into F cos θ along the motion and F sin θ perpendicular to the motion shows that only F cos θ speeds up or slows down the object.',
    scales: [
      { label: 'Force aligned with motion (θ = 0°, cos 0° = 1)', result: 'Maximum positive work W = +Fs (adds energy)' },
      { label: 'Force perpendicular to motion (θ = 90°, cos 90° = 0)', result: 'Zero work W = 0 J (normal force on flat floor, circular orbit gravity)' },
      { label: 'Force opposing motion (θ = 180°, cos 180° = −1)', result: 'Negative work W = −Fs (friction/brakes drain kinetic energy into heat)' },
    ],
    limit: 'Assumes force F is constant along straight displacement s; if F varies with position (like a spring), work is the area under the F–x graph.',
    terms: [
      { sym: 'W', name: 'Mechanical work done', unit: 'joules, J (1 J = 1 N·m)', note: 'Scalar energy transfer; zero if displacement s = 0' },
      { sym: 'F', name: 'Magnitude of force', unit: 'newtons, N', note: 'e.g. 392 N lifting a 40 kg person' },
      { sym: 'd, s', name: 'Displacement (distance moved)', unit: 'metres, m', note: '3 m up one storey → 392 × 3 = 1,176 J' },
      { sym: 'θ', name: 'Angle between force F and displacement s', unit: 'degrees, °', note: 'cos θ selects the component of force parallel to motion' },
    ],
  },
  {
    match: /gravitational potential energy:\s*Eₚ\s*=\s*m\s*g\s*h/i,
    title: 'Gravitational potential energy store',
    formula: 'Eₚ = m g h',
    domain: 'Energy',
    section: '#s7-3',
    summary: 'Lifting a mass m through a vertical height h against gravity stores mgh of energy in the shared object–Earth gravitational store.',
    why: 'Lifting requires an upward force mg over vertical rise h, so work done is W = mgh regardless of whether you climb straight up, take stairs, or wind up a gentle ramp.',
    scales: [
      { label: 'Take a 3× longer zigzag ramp to the same floor height h', result: 'Exact same Eₚ = mgh stored (1/3 the slope force × 3× the ramp length)' },
      { label: 'Release from rest on a frictionless track (mgh → ½mv²)', result: 'Bottom speed v = √(2gh) is independent of mass m' },
    ],
    limit: 'Uses constant g = 9.8 N/kg near Earth’s surface; for spacecraft climbing thousands of kilometres, use U = −GMm/r.',
    terms: [
      { sym: 'Eₚ', name: 'Gravitational potential energy', unit: 'joules, J', note: 'Belongs to the object and Earth together' },
      { sym: 'm', name: 'Mass', unit: 'kilograms, kg', note: 'Cancels when equating mgh = ½mv²' },
      { sym: 'g', name: 'Gravitational field strength', unit: '9.8 N/kg', note: 'Local pull per kilogram' },
      { sym: 'h', name: 'Vertical height change', unit: 'metres, m', note: 'Only vertical height above your chosen zero reference counts' },
    ],
  },
  {
    match: /efficiency\s*=/i,
    title: 'Efficiency of an energy transfer',
    formula: 'efficiency = (useful output ÷ total input) × 100%',
    domain: 'Energy',
    section: '#s7-4',
    summary: 'Efficiency is the fraction (or percentage) of total input energy or power that ends up in the intended useful form rather than spread-out warmth.',
    why: 'Conservation of energy guarantees total output equals total input, but friction, electrical resistance, and Carnot’s thermodynamic limit divert part into thermal energy.',
    scales: [
      { label: 'Swap a 10% filament bulb for a 50% LED bulb (same light)', result: 'Requires one-fifth (⅕×) the electrical input power' },
    ],
    limit: 'Can never exceed 100% (1.0) without violating conservation of energy; heat engines are further capped below 100% by the second law of thermodynamics.',
    terms: [
      { sym: 'η', name: 'Efficiency', unit: 'dimensionless fraction (0 to 1) or percentage (%)', note: 'Ratio of joules (or watts) useful to total joules (or watts) put in' },
      { sym: 'E_useful, P_useful', name: 'Useful energy or power output', unit: 'joules, J (or watts, W)', note: 'Light from a lamp, mechanical lift from a motor' },
      { sym: 'E_total, P_total', name: 'Total energy or power input', unit: 'joules, J (or watts, W)', note: 'Useful output + wasted thermal dissipation' },
    ],
  },
  {
    match: /power\s*=\s*energy|P\s*=\s*E\s*÷\s*t/i,
    title: 'Power (rate of energy transfer)',
    formula: 'P = E ÷ t   (or P = W ÷ t)',
    domain: 'Energy',
    section: '#s7-5',
    summary: 'Power measures how fast energy is transferred or work is done: one watt is one joule per second.',
    why: 'Walking and running up the same flight of stairs transfer the exact same gravitational energy mgh, but running does it in less time t, demanding higher power P = E/t.',
    scales: [
      { label: 'Climb the same stairs in half the time (½ t)', result: 'Power output P doubles (2×) while total energy E stays identical' },
      { label: 'Run a 1,000 W appliance for 1 hour (3,600 s)', result: 'Energy transferred E = P × t = 3,600,000 J = 1 kilowatt-hour (1 kWh)' },
    ],
    limit: 'Defines average power over interval t; instantaneous mechanical power at speed v under force F is P = Fv.',
    terms: [
      { sym: 'P', name: 'Power', unit: 'watts, W (1 W = 1 J/s)', note: 'LED lamp ~10 W, human body at rest ~100 W, kettle ~2,000 W' },
      { sym: 'E, W', name: 'Energy transferred / work done', unit: 'joules, J (or kWh)', note: '1 kWh = 3.6 × 10⁶ J' },
      { sym: 't', name: 'Time taken', unit: 'seconds, s', note: 'In the denominator: shorter time → higher power' },
    ],
  },

  // ---- Chapter 8: Thermal Physics
  {
    match: /kelvin temperature|273\.15/i,
    title: 'Absolute (Kelvin) temperature scale',
    formula: 'T(K) = θ(°C) + 273.15',
    domain: 'Matter & Heat',
    section: '#s8-2',
    summary: 'The Kelvin scale shifts the zero point to absolute zero (−273.15 °C), where classical thermal motion bottoms out, while keeping 1 K equal in step size to 1 °C.',
    why: 'Cooled at constant volume, every ideal gas loses 1/273.15 of its 0 °C pressure per degree Celsius; extrapolating to zero pressure locates a universal floor at −273.15 °C.',
    scales: [
      { label: 'Warm a gas from 27 °C (300 K) to 327 °C (600 K)', result: 'Absolute temperature T doubles (2×), so average molecular kinetic energy doubles' },
      { label: 'Temperature difference ΔT (e.g. 20 °C → 100 °C)', result: 'ΔT = 80 K = 80 °C—intervals are identical on both scales' },
    ],
    limit: 'Absolute zero (0 K) cannot be reached in a finite number of cooling steps; quantum zero-point jiggling remains even as T → 0 K.',
    terms: [
      { sym: 'T', name: 'Absolute temperature', unit: 'kelvins, K (no degree symbol)', note: 'Proportional to average random translational kinetic energy of gas molecules' },
      { sym: 'θ', name: 'Celsius temperature', unit: 'degrees Celsius, °C', note: '0 °C = 273.15 K (ice point); 100 °C = 373.15 K' },
    ],
  },
  {
    match: /specific heat capacity/i,
    title: 'Thermal energy for a temperature change',
    formula: 'Q = m c ΔT   (or ΔE = m c Δθ)',
    domain: 'Matter & Heat',
    section: '#s8-3',
    summary: 'The thermal energy Q needed to warm a substance without changing its state is proportional to its mass m, its specific heat capacity c, and the temperature change ΔT.',
    why: 'More mass m means more atoms to speed up; a larger specific heat capacity c (like water’s 4,186 J/(kg·°C)) means each kilogram stores more energy per degree of warming.',
    scales: [
      { label: 'Warm 1 kg of water vs 1 kg of dry sand (c ≈ 800) with same sun energy Q', result: 'Sand’s temperature rises >5× faster than water’s—driving sea breezes!' },
      { label: 'Double the mass of water in the kettle (2m)', result: 'Takes 2× the energy Q (and 2× the time) for the same ΔT' },
    ],
    limit: 'Applies only while the substance stays in a single phase; during melting or boiling, temperature stalls (ΔT = 0) and Q = mL takes over.',
    terms: [
      { sym: 'Q, ΔE', name: 'Thermal energy transferred', unit: 'joules, J', note: 'Energy entering or leaving the internal store' },
      { sym: 'm', name: 'Mass of substance', unit: 'kilograms, kg', note: '1 litre of water is 1.0 kg' },
      { sym: 'c', name: 'Specific heat capacity', unit: 'J/(kg·°C) or J/(kg·K)', note: 'Water: 4,186; aluminium: 900; sand: ~800' },
      { sym: 'ΔT, Δθ', name: 'Temperature change', unit: '°C or K', note: 'Final temperature minus initial temperature' },
    ],
  },
  {
    match: /latent heat:\s*Q\s*=\s*mL/i,
    title: 'Specific latent heat of phase change',
    formula: 'Q = m L',
    domain: 'Matter & Heat',
    section: '#s8-5',
    summary: 'During melting or boiling, energy Q = mL goes entirely into breaking intermolecular bonds (potential energy) rather than speeding molecules up, so temperature stays flat.',
    why: 'Pulling water molecules apart from a liquid into steam against their mutual attraction requires 2.26 million joules per kilogram even though their average speed (temperature) does not change.',
    scales: [
      { label: 'Boil 1 kg of 100 °C water into steam (L_v = 2,260 kJ/kg)', result: 'Requires 6.8× more energy than melting 1 kg of ice (L_f = 334 kJ/kg)' },
    ],
    limit: 'L depends on the substance and the external pressure (water boils at a lower temperature and slightly different L_v high in the Himalayas).',
    terms: [
      { sym: 'Q', name: 'Thermal energy for phase change', unit: 'joules, J', note: 'Absorbed during melting/boiling; released during freezing/condensing' },
      { sym: 'm', name: 'Mass that changes state', unit: 'kilograms, kg', note: 'e.g. mass of ice melted or sweat evaporated' },
      { sym: 'L', name: 'Specific latent heat (L_f or L_v)', unit: 'joules per kilogram, J/kg', note: 'Water: L_f = 334,000 J/kg (fusion), L_v = 2,260,000 J/kg (vaporisation)' },
    ],
  },

  // ---- Chapter 9: Oscillations & Waves
  {
    match: /pendulum period|T\s*=\s*2π/i,
    title: 'Frequency, period & simple pendulum law',
    formula: 'f = 1 ÷ T   ·   T = 2π √(L ÷ g)',
    domain: 'Waves & Light',
    section: '#s9-1',
    summary: 'Frequency and period are reciprocals; for small swings, a pendulum’s period depends only on the square root of its length L and gravity g, never on bob mass.',
    why: 'Just as in free fall, a heavier bob gets a larger gravitational restoring pull mg sin θ in exact proportion to its larger inertia m, so mass cancels out.',
    scales: [
      { label: 'Quadruple the pendulum length (4× L)', result: 'Period T doubles (2×); frequency f halves (½×)' },
      { label: 'Double the bob mass m (same length L)', result: 'Period T is completely unchanged!' },
    ],
    limit: 'Small-angle approximation (sin θ ≈ θ in radians, accurate within 1% up to ~23°); at large swing angles the period grows slightly longer.',
    terms: [
      { sym: 'f', name: 'Frequency', unit: 'hertz, Hz (cycles per second, s⁻¹)', note: 'Number of complete swings each second' },
      { sym: 'T', name: 'Period', unit: 'seconds, s', note: 'Time for one complete back-and-forth cycle (2.01 s for L = 1.0 m on Earth)' },
      { sym: 'L', name: 'Pendulum length', unit: 'metres, m', note: 'From pivot to the centre of mass of the bob' },
      { sym: 'g', name: 'Gravitational field strength', unit: '9.8 m/s²', note: 'Stronger gravity → faster swing (shorter T)' },
    ],
  },
  {
    match: /wave speed\s*=\s*frequency/i,
    title: 'The universal wave equation',
    formula: 'v = f λ',
    domain: 'Waves & Light',
    section: '#s9-3',
    summary: 'Every wave advances by one wavelength λ in one period T = 1/f, so wave speed equals frequency multiplied by wavelength.',
    why: 'Distance = speed × time for one cycle gives λ = vT; substituting T = 1/f yields v = fλ for water ripples, sound, strings, and light alike.',
    scales: [
      { label: 'Double the source frequency f in the same medium (fixed v)', result: 'Wavelength λ halves (½×)—wave speed v is set by the medium, not the source!' },
      { label: 'Wave crosses into a slower medium (v drops, f stays locked)', result: 'Wavelength λ shrinks in proportion to v' },
    ],
    limit: 'Universal kinematic identity for any periodic wave; in dispersive media (like glass for white light), wave speed v itself varies slightly with f.',
    terms: [
      { sym: 'v', name: 'Wave speed', unit: 'metres per second, m/s', note: 'Fixed by the medium (sound in 30 °C air: 349 m/s; light in vacuum: 3.00 × 10⁸ m/s)' },
      { sym: 'f', name: 'Frequency', unit: 'hertz, Hz', note: 'Set by the vibrating source; never changes when crossing a boundary' },
      { sym: 'λ', name: 'Wavelength', unit: 'metres, m', note: 'Crest-to-crest (or compression-to-compression) distance' },
    ],
  },

  // ---- Chapter 10: Geometric Optics
  {
    match: /angle of reflection/i,
    title: 'Law of reflection',
    formula: 'θ_r = θ_i',
    domain: 'Waves & Light',
    section: '#s10-3',
    summary: 'A ray reflecting off a mirror leaves at the exact same angle to the perpendicular normal line as it arrived.',
    why: 'By Huygens’ wavelet construction (or Fermat’s shortest-time path), a wave reflecting in the same medium keeps the same speed, forcing symmetrical angles.',
    scales: [
      { label: 'Increase angle of incidence θ_i from 20° to 50° (from normal)', result: 'Angle of reflection θ_r also increases to 50°; total turn between rays is 2θ_i' },
    ],
    limit: 'Holds locally at every microscopic patch; on a rough sheet of paper, tilted micro-normals scatter rays in all directions (diffuse reflection).',
    terms: [
      { sym: 'θ_i', name: 'Angle of incidence', unit: 'degrees, °', note: 'Always measured from the perpendicular normal, never from the mirror surface' },
      { sym: 'θ_r', name: 'Angle of reflection', unit: 'degrees, °', note: 'Equals θ_i in the same plane of incidence' },
    ],
  },
  {
    match: /refractive index|n\s*=\s*c\s*÷\s*v/i,
    title: 'Refractive index of a transparent medium',
    formula: 'n = c ÷ v',
    domain: 'Waves & Light',
    section: '#s10-4',
    summary: 'Refractive index n tells you by what factor light travels slower in a material than in empty space, setting both how sharply rays bend and apparent depth.',
    why: 'When a slanted wavefront enters a medium where speed is v = c/n, the side that enters first slows down first, pivoting the ray toward the normal (n₁ sin θ₁ = n₂ sin θ₂).',
    scales: [
      { label: 'Enter water (n = 1.333 = 4/3)', result: 'Light speed drops to ¾ c (2.25 × 10⁸ m/s); pool floor looks ¾ as deep' },
      { label: 'Enter diamond (n = 2.42)', result: 'Light slows to 0.41 c; tiny 24.4° critical angle traps light inside for sparkle' },
    ],
    limit: 'n varies slightly with wavelength (dispersion: violet slows more than red, n_violet > n_red), which is how prisms and raindrops split white light.',
    terms: [
      { sym: 'n', name: 'Refractive index', unit: 'dimensionless ratio (≥ 1)', note: 'Air: 1.0003; water: 1.333; glass: ~1.52; diamond: 2.42' },
      { sym: 'c', name: 'Speed of light in vacuum', unit: '3.00 × 10⁸ m/s', note: 'Universal speed limit' },
      { sym: 'v', name: 'Phase speed of light in medium', unit: 'metres per second, m/s', note: 'Wavelength inside medium shrinks to λ₀ / n while f stays fixed' },
    ],
  },
  {
    match: /thin-lens equation|optical power/i,
    title: 'Thin-lens equation & optical power (dioptres)',
    formula: '1/f = 1/u + 1/v   (1/f = 1/d_o + 1/d_i)   ·   P = 1/f',
    domain: 'Waves & Light',
    section: '#s10-5',
    summary: 'A lens of focal length f bends rays of object distance u (d_o) to meet at image distance v (d_i); its optical strength in dioptres is P = 1/f.',
    why: 'A thin lens adds a fixed curvature 1/f to incoming wavefronts: flat waves from infinity (1/u = 0) acquire curvature 1/v = 1/f and focus at distance f.',
    scales: [
      { label: 'Distant object (u > 2f, camera / eye)', result: 'Real, inverted, diminished image between f and 2f' },
      { label: 'Projector regime (f < u < 2f, e.g. u = 0.30 m, f = 0.20 m)', result: 'Real, inverted, magnified image at v = 0.60 m (> 2f)' },
      { label: 'Magnifying glass (u < f)', result: 'v < 0: upright, magnified virtual image on the same side as the object' },
    ],
    limit: 'Thin-lens paraxial approximation (rays near the axis of a lens whose thickness is small compared with f); thick wide-angle lenses need spherical/chromatic correction.',
    terms: [
      { sym: 'f', name: 'Focal length', unit: 'metres, m', note: 'Positive (+) for converging lenses, negative (−) for diverging lenses' },
      { sym: 'u, d_o', name: 'Object distance', unit: 'metres, m', note: 'Distance from object to optical centre of lens' },
      { sym: 'v, d_i', name: 'Image distance', unit: 'metres, m', note: 'Positive for real images on far side; negative for virtual images' },
      { sym: 'P', name: 'Optical power', unit: 'dioptres, D (m⁻¹)', note: 'Human cornea + lens is ~50 D relaxed, ~54 D accommodated' },
    ],
  },

  // ---- Chapter 11: Wave Optics & Interference
  {
    match: /two-slit bright fringes|fringe spacing/i,
    title: 'Young’s two-slit interference & fringe spacing',
    formula: 'd sin θ = m λ   ·   Δy = λ L ÷ d',
    domain: 'Waves & Light',
    section: '#s11-2',
    summary: 'Two slits separated by d produce bright fringes wherever the path difference d sin θ is a whole number of wavelengths mλ, spaced by Δy = λL/d on a screen.',
    why: 'Waves from the two slits arrive crest-on-crest (constructive interference) whenever one wave travels exactly m = 0, 1, 2… extra wavelengths λ.',
    scales: [
      { label: 'Move the slits closer together (halve d)', result: 'Fringe spacing Δy on the screen doubles (2×)—narrower slit gap spreads fringes wider!' },
      { label: 'Switch from blue light (450 nm) to red light (650 nm)', result: 'Longer wavelength λ spreads the bright fringes ~44% farther apart' },
    ],
    limit: 'Fringe spacing formula Δy = λL/d uses the small-angle approximation sin θ ≈ tan θ = y/L (valid when screen distance L ≫ slit separation d).',
    terms: [
      { sym: 'd', name: 'Slit centre-to-centre separation', unit: 'metres, m (typically fractions of a mm)', note: 'Inversely proportional to fringe width Δy' },
      { sym: 'θ', name: 'Diffraction / fringe angle', unit: 'degrees or radians', note: 'd sin θ is the geometric path difference between the two rays' },
      { sym: 'm', name: 'Fringe order number', unit: 'integer (0, 1, 2, …)', note: 'm = 0 is the central bright fringe; half-integers give dark fringes' },
      { sym: 'λ', name: 'Wavelength', unit: 'metres, m (400–700 nm for visible light)', note: 'How Young measured the tiny wavelength of light in 1801' },
      { sym: 'Δy, L', name: 'Fringe spacing & screen distance', unit: 'metres, m', note: 'L magnifies the microscopic λ/d ratio into millimetre-spaced bands' },
    ],
  },

  // ---- Chapter 12: Electric Circuits & Power
  {
    match: /electrical power\s*=\s*voltage|P\s*=\s*V\s*×\s*I/i,
    title: 'Electrical power (P = VI = I²R = V²/R)',
    formula: 'P = V I = I² R = V² ÷ R',
    domain: 'Electricity & Magnetism',
    section: '#s12-3',
    summary: 'Electrical power in watts equals voltage (joules per coulomb) multiplied by current (coulombs per second): J/C × C/s = J/s = W.',
    why: 'Each coulomb delivers V joules of energy as it drops through a component, and I coulombs pass every second; substituting V = IR gives I²R and V²/R.',
    scales: [
      { label: 'Double the current I through a fixed wire resistance R', result: 'Heating power P = I²R quadruples (4×)—why fuses blow and power lines use low I' },
      { label: 'Double the voltage V across a fixed resistor R', result: 'Current I also doubles, so power P = V²/R quadruples (4×)' },
    ],
    limit: 'P = VI holds for every electrical component; the forms I²R and V²/R apply when all the electrical work goes into a resistance R.',
    terms: [
      { sym: 'P', name: 'Electrical power', unit: 'watts, W (1 W = 1 J/s)', note: 'Rate at which electrical energy is converted to heat, light, or motion' },
      { sym: 'V', name: 'Potential difference (voltage)', unit: 'volts, V (J/C)', note: 'Energy delivered per coulomb of charge across the component' },
      { sym: 'I', name: 'Electric current', unit: 'amperes, A (C/s)', note: 'Coulombs of charge flowing through per second' },
      { sym: 'R', name: 'Resistance', unit: 'ohms, Ω (V/A)', note: 'Links V and I via V = IR' },
    ],
  },
  {
    match: /V\s*=\s*I\s*×\s*R|voltage\s*=\s*current/i,
    title: 'Ohm’s law & electrical resistance',
    formula: 'V = I R   (R = V ÷ I)',
    domain: 'Electricity & Magnetism',
    section: '#s12-4',
    summary: 'The potential difference V across a conductor equals the current I flowing through it multiplied by its resistance R.',
    why: 'Drifting electrons collide with metal ions; for a metal at constant temperature, doubling the electrical push V doubles the drift speed and current I.',
    scales: [
      { label: 'Double the resistance R in a circuit at fixed voltage V', result: 'Current I = V/R halves (½×)' },
      { label: 'Use a wire 2× longer and ½ the cross-sectional area', result: 'Resistance R = ρL/A quadruples (4×)' },
    ],
    limit: 'R = V/I defines resistance for anything, but R is constant (Ohm’s law) only for ohmic conductors at steady temperature—filament lamps warm up (R rises) and LEDs are one-way diodes.',
    terms: [
      { sym: 'V', name: 'Potential difference (voltage)', unit: 'volts, V (1 V = 1 J/C)', note: 'Electrical push across the component' },
      { sym: 'I', name: 'Electric current', unit: 'amperes, A (1 A = 1 C/s)', note: 'Same everywhere around a single series loop' },
      { sym: 'R', name: 'Electrical resistance', unit: 'ohms, Ω (1 Ω = 1 V/A)', note: 'Opposition to current flow' },
    ],
  },
  {
    match: /series resistors|parallel resistors|potential divider/i,
    title: 'Series & parallel resistors and the potential divider',
    formula: 'R_s = R₁ + R₂   ·   1/R_p = 1/R₁ + 1/R₂   ·   V_out = V_in R₂/(R₁ + R₂)',
    domain: 'Electricity & Magnetism',
    section: '#s12-5',
    summary: 'Series resistors share the same current and add their resistances; parallel branches share the same voltage and add their conductances (1/R).',
    why: 'Putting resistors in series makes a longer obstacle course (R₁ + R₂) where voltage divides in proportion to R; adding a parallel branch opens an extra lane so total resistance drops below the smallest branch.',
    scales: [
      { label: 'Connect two identical 100 Ω resistors in parallel', result: 'Combined resistance halves to 50 Ω (twice the pathways for current)' },
      { label: 'Darkness raises LDR resistance R₂ to 9× R₁ in a divider', result: 'V_out rises to 9/10 of V_in, switching on an automatic street light' },
    ],
    limit: 'Assumes ideal connecting leads (R ≈ 0) and a voltage source with negligible internal resistance.',
    terms: [
      { sym: 'R_total', name: 'Equivalent combined resistance', unit: 'ohms, Ω', note: 'Larger than any part in series; smaller than the smallest branch in parallel' },
      { sym: 'R₁, R₂', name: 'Individual resistances', unit: 'ohms, Ω', note: 'In a potential divider, one is often a thermistor or LDR sensor' },
      { sym: 'V_in, V_out', name: 'Supply voltage & divider tap voltage', unit: 'volts, V', note: 'Shared in the exact ratio of the series resistances' },
    ],
  },

  // ---- Chapter 13: Electromagnetism & Power Grid
  {
    match: /magnetic force on a current|F\s*=\s*B\s*×\s*I\s*×\s*L/i,
    title: 'Motor force on a current-carrying wire (F = BIL)',
    formula: 'F = B I L',
    domain: 'Electricity & Magnetism',
    section: '#s13-3',
    summary: 'A wire of length L carrying current I perpendicular to a magnetic field B feels a sideways force F = BIL (Fleming’s left-hand rule).',
    why: 'Moving charges inside the wire experience a sideways Lorentz force qv × B; summing over all drifting electrons in length L gives F = BIL.',
    scales: [
      { label: 'Reverse either the current I or the magnet poles B', result: 'Force F reverses direction; reversing both keeps F the same way' },
      { label: 'Align the wire parallel to the magnetic field lines', result: 'Force F drops to zero (F = BIL sin θ with θ = 0°)' },
    ],
    limit: 'F = BIL assumes the wire is at 90° to uniform field B; at angle θ to the field lines, F = BIL sin θ.',
    terms: [
      { sym: 'F', name: 'Magnetic motor force', unit: 'newtons, N', note: 'Perpendicular to both magnetic field B and current I' },
      { sym: 'B', name: 'Magnetic flux density (field strength)', unit: 'teslas, T (1 T = 1 N/(A·m))', note: 'Earth’s field ~50 μT; lab neodymium magnet ~0.2–1.0 T' },
      { sym: 'I', name: 'Current in the wire', unit: 'amperes, A', note: 'Conventional current from + to −' },
      { sym: 'L', name: 'Length of wire inside the field', unit: 'metres, m', note: 'Winding N turns in a motor coil multiplies the effect N times' },
    ],
  },
  {
    match: /transformer turns ratio|P_loss\s*=\s*I²/i,
    title: 'Transformers & high-voltage grid transmission loss',
    formula: 'V_s/V_p = N_s/N_p   ·   V_p I_p = V_s I_s   ·   P_loss = I² R_line',
    domain: 'Electricity & Magnetism',
    section: '#s13-5',
    summary: 'An AC transformer steps voltage up in the ratio of coil turns (N_s/N_p), cutting current I by the same factor so grid heating loss I²R_line plummets.',
    why: 'The same changing magnetic flux in the iron core links every turn of both coils, inducing the same volts-per-turn in primary and secondary.',
    scales: [
      { label: 'Step voltage V up 10× for the same transmitted power P = VI', result: 'Line current I drops to 1/10×, so cable heating loss I²R_line drops to 1/100× (1%)!' },
    ],
    limit: 'Requires alternating current (AC) so the magnetic flux keeps changing; a steady DC battery induces zero voltage once switched on.',
    terms: [
      { sym: 'V_p, V_s', name: 'Primary and secondary AC voltages', unit: 'volts, V', note: 'Stepped up to 400 kV for grid lines, down to 230 V for homes' },
      { sym: 'N_p, N_s', name: 'Primary and secondary coil turns', unit: 'dimensionless count', note: 'N_s > N_p steps voltage up; N_s < N_p steps voltage down' },
      { sym: 'I_p, I_s', name: 'Primary and secondary currents', unit: 'amperes, A', note: 'Stepping voltage up 10× steps current down 10× (energy conservation)' },
      { sym: 'P_loss', name: 'Joule heating wasted in grid cables', unit: 'watts, W', note: 'Depends on I² R_line, NOT on (V_grid)²/R_line' },
    ],
  },

  // ---- Chapter 14: Tides & Astronomy
  {
    match: /tidal difference|2GMR_E/i,
    title: 'Differential tidal gravity (inverse-cube law)',
    formula: 'Δg ≈ 2 G M R_E ÷ d³',
    domain: 'Fields',
    section: '#s14-5',
    summary: 'Tides are raised not by total gravity GM/d², but by the difference in gravity across Earth’s diameter 2R_E, which falls off as the cube of distance (1/d³).',
    why: 'The derivative of 1/d² with respect to distance d is −2/d³: across a planet of radius R_E, near-side pull minus centre pull is GM/(d − R_E)² − GM/d² ≈ 2GMR_E/d³.',
    scales: [
      { label: 'Sun (27 million × Moon’s mass, 390× farther away)', result: 'Total gravity is 180× stronger than Moon’s, but 1/d³ makes solar tides 46% of lunar tides!' },
      { label: 'Halve a moon’s orbital distance d', result: 'Tidal stretching force Δg increases eightfold (2³ = 8×)' },
    ],
    limit: 'Assumes planet radius R_E is much smaller than orbital distance d (R_E ≪ d).',
    terms: [
      { sym: 'Δg', name: 'Tidal acceleration difference across Earth', unit: 'm/s² (or N/kg)', note: '~1.1 × 10⁻⁶ m/s² from the Moon—stretches oceans horizontally along the rim' },
      { sym: 'G, M', name: 'Gravitational constant & tide-raising mass', unit: 'N·m²/kg² and kg', note: 'Moon or Sun mass' },
      { sym: 'R_E', name: 'Radius of the stretched body (Earth)', unit: 'metres, m (6.37 × 10⁶ m)', note: 'Larger body spans a wider gravity gradient' },
      { sym: 'd', name: 'Distance to the Moon or Sun', unit: 'metres, m', note: 'Cubed in denominator (d³): distance beats mass in tidal contests' },
    ],
  },

  // ---- Chapter 15 & Stories: Quantum, Relativity, Stars & Cosmos
  {
    match: /E\s*=\s*mc²/i,
    title: 'Einstein’s mass–energy equivalence',
    formula: 'E = m c²   (ΔE = Δm c²)',
    domain: 'Quantum & Cosmos',
    section: '#s15-5',
    summary: 'Mass itself is a concentrated store of energy. When nuclear fusion binds protons into helium, 0.7% of their mass vanishes and emerges as Δm × c² of sunlight.',
    why: 'Relativity unites space and time via speed c; a body emitting energy E as light loses inertia E/c², proving that mass m is simply rest energy divided by c².',
    scales: [
      { label: 'Convert 1 gram (0.001 kg) of mass completely into energy', result: 'Releases 9 × 10¹³ J (25 million kWh)—because c² ≈ 9 × 10¹⁶ J/kg is huge' },
    ],
    limit: 'Exact universal law for rest energy; for a body moving with momentum p, total energy is E² = (mc²)² + (pc)².',
    terms: [
      { sym: 'E', name: 'Rest energy (or energy released ΔE)', unit: 'joules, J', note: 'The Sun radiates 3.83 × 10²⁶ J every second' },
      { sym: 'm', name: 'Mass (or mass defect Δm)', unit: 'kilograms, kg', note: 'The Sun converts 4.26 million tonnes of mass into light each second' },
      { sym: 'c', name: 'Speed of light in vacuum', unit: '2.998 × 10⁸ m/s', note: 'c² = 8.99 × 10¹⁶ J/kg' },
    ],
  },
  {
    match: /Wien.*displacement|λ_peak\s*×\s*T/i,
    title: 'Wien’s displacement law (star colour & temperature)',
    formula: 'λ_peak × T = 2.90 × 10⁻³ m·K',
    domain: 'Quantum & Cosmos',
    section: '#s15-6',
    summary: 'Hotter glowing bodies shift their peak thermal radiation to shorter, bluer wavelengths in exact inverse proportion to their absolute temperature T.',
    why: 'Higher temperature T packs more thermal energy k_B T into each oscillating mode, allowing shorter-wavelength (higher-energy hf = hc/λ) photons to be excited.',
    scales: [
      { label: 'Double a star’s surface temperature (e.g. 3,000 K → 6,000 K)', result: 'Peak wavelength λ_peak halves (from 966 nm infrared/red to 483 nm blue-green)' },
      { label: 'Human body at 310 K (37 °C)', result: 'Glows in the mid-infrared at λ_peak ≈ 9.4 μm (what thermal cameras see)' },
    ],
    limit: 'Applies to thermal blackbody radiation from opaque solids, liquids, or dense stellar photospheres; thin glowing gas tubes emit discrete atomic spectral lines instead.',
    terms: [
      { sym: 'λ_peak', name: 'Peak emission wavelength', unit: 'metres, m (or nanometres, nm)', note: 'Sun at 5,800 K peaks near 500 nm (visible green-yellow)' },
      { sym: 'T', name: 'Absolute surface temperature', unit: 'kelvins, K', note: 'Must be in kelvins, never °C' },
      { sym: 'b', name: 'Wien’s displacement constant', unit: '2.898 × 10⁻³ m·K', note: 'Fixed by Planck’s constant h, light speed c, and Boltzmann’s constant k_B' },
    ],
  },
  {
    match: /μ₀\s*ε₀/i,
    title: 'Maxwell’s electromagnetic wave speed',
    formula: 'c = 1 ÷ √(μ₀ ε₀) ≈ 3.00 × 10⁸ m/s',
    domain: 'Electricity & Magnetism',
    section: '#story-maxwell',
    summary: 'Electric permittivity ε₀ and magnetic permeability μ₀ measured with batteries, capacitors, and coils on a lab bench predict the exact speed of light.',
    why: 'A changing electric field creates a magnetic field (∝ μ₀ε₀ ∂E/∂t) and a changing magnetic field creates an electric field; the wave equation locks their speed at 1/√(μ₀ε₀).',
    scales: [
      { label: 'Enter glass where permittivity is ε = n² ε₀', result: 'Wave speed slows to v = c / n—unifying optics with electromagnetism!' },
    ],
    limit: 'Exact in vacuum for all electromagnetic waves from radio to gamma rays.',
    terms: [
      { sym: 'c', name: 'Electromagnetic wave speed in vacuum', unit: '2.998 × 10⁸ m/s', note: 'Proved that light is an electromagnetic wave (Maxwell, 1865)' },
      { sym: 'μ₀', name: 'Vacuum magnetic permeability', unit: '1.257 × 10⁻⁶ N/A²', note: 'Strength of magnetic field per ampere of current' },
      { sym: 'ε₀', name: 'Vacuum electric permittivity', unit: '8.854 × 10⁻¹² C²/(N·m²)', note: 'Capacity of empty space to hold electric field lines' },
    ],
  },
  {
    match: /v\s*=\s*H\s*×\s*d/i,
    title: 'Hubble–Lemaître law of cosmic expansion',
    formula: 'v = H × d',
    domain: 'Quantum & Cosmos',
    section: '#story-expanding',
    summary: 'Because space itself is stretching uniformly, a distant galaxy’s recession speed v is directly proportional to its distance d from the observer.',
    why: 'On any uniformly stretching rubber band or rising raisin bread, doubling the number of centimetres between two raisins doubles the centimetres added per second.',
    scales: [
      { label: 'Look at a galaxy 3× farther away (3d)', result: 'Its light is redshifted by 3× the recession speed (3v)' },
    ],
    limit: 'Holds on cosmic scales (>100 million light-years); nearby galaxies like Andromeda are pulled toward the Milky Way by local gravity.',
    terms: [
      { sym: 'v', name: 'Recession velocity', unit: 'kilometres per second, km/s', note: 'Measured from the Doppler/cosmological redshift of spectral lines' },
      { sym: 'H', name: 'Hubble parameter', unit: '~22 km/s per million light-years (~70 km/s/Mpc)', note: '1/H ≈ 14 billion years sets the expansion age scale of the universe' },
      { sym: 'd', name: 'Proper distance to galaxy', unit: 'million light-years or megaparsecs (Mpc)', note: 'Measured via standard candles (Cepheids, Type Ia supernovae)' },
    ],
  },
  {
    match: /E\s*=\s*h\s*f/i,
    title: 'Planck–Einstein photon energy',
    formula: 'E = h f = h c ÷ λ',
    domain: 'Quantum & Cosmos',
    section: '#story-photons',
    summary: 'Light exchanges energy in indivisible quantum packets (photons); each single photon’s energy depends only on the light’s frequency f, not its brightness.',
    why: 'Brightness only counts how many photons arrive per second; whether a single electron gets kicked out of a metal (photoelectric effect) depends on the energy hf of one photon.',
    scales: [
      { label: 'Double the light intensity (brightness) at low frequency f', result: 'Twice as many photons per second, but each photon still has the same E = hf' },
      { label: 'Switch from red light (4.3 × 10¹⁴ Hz) to UV (10¹⁵ Hz)', result: 'Single-photon energy E = hf more than doubles, ejecting photoelectrons immediately' },
    ],
    limit: 'Universal quantum rule for all electromagnetic radiation and matter excitations.',
    terms: [
      { sym: 'E', name: 'Single-photon energy', unit: 'joules, J (or electronvolts, 1 eV = 1.60 × 10⁻¹⁹ J)', note: 'Red photon ~1.8 eV; blue ~2.8 eV; UV > 3.2 eV' },
      { sym: 'h', name: 'Planck’s constant', unit: '6.626 × 10⁻³⁴ J·s', note: 'Fundamental quantum of action' },
      { sym: 'f', name: 'Wave frequency', unit: 'hertz, Hz (s⁻¹)', note: 'Since f = c/λ, shorter wavelength means higher photon energy' },
    ],
  },

  // ---- Thinking Tool Story: Vectors (Component Resolution & Parallelogram Law)
  {
    match: /resolving a vector into perpendicular components|R\s*cos\s*θ/i,
    title: 'Resolving a vector into perpendicular components',
    formula: 'R_x = R cos θ   ·   R_y = R sin θ   ·   R = √(R_x² + R_y²)',
    domain: 'Mechanics',
    section: '#story-vectors',
    summary: 'Any tilted vector R at angle θ splits into two perpendicular right-angle shadows—horizontal R cos θ and vertical R sin θ—that obey Pythagoras.',
    why: 'Drop perpendiculars from the tip of arrow R to the x and y axes: R is the hypotenuse of a right-angled triangle with adjacent leg R cos θ and opposite leg R sin θ.',
    scales: [
      { label: 'Tilt θ → 0° (purely horizontal)', result: 'cos 0° = 1, sin 0° = 0 → R_x = R and R_y = 0' },
      { label: 'Tilt θ = 45° (diagonal)', result: 'cos 45° = sin 45° ≈ 0.707 → equal shadows R_x = R_y = 0.707 R' },
      { label: 'Tilt θ → 90° (purely vertical)', result: 'cos 90° = 0, sin 90° = 1 → R_x = 0 and R_y = R' },
    ],
    limit: 'Applies to any vector (displacement, velocity, force, momentum, field) in a flat Euclidean plane; in 3D, R = √(R_x² + R_y² + R_z²).',
    terms: [
      { sym: 'R', name: 'Resultant vector magnitude', unit: 'same unit as vector (N, m/s, m)', note: 'Hypotenuse length √(R_x² + R_y²)' },
      { sym: 'R_x', name: 'Horizontal (adjacent) component', unit: 'same unit as R', note: 'R cos θ (or down-board normal press mg cos θ on a tilted ramp)' },
      { sym: 'R_y', name: 'Vertical (opposite) component', unit: 'same unit as R', note: 'R sin θ (or down-slope pull mg sin θ on a tilted ramp)' },
      { sym: 'θ', name: 'Angle from the reference axis', unit: 'degrees, °', note: 'The axis touching θ always gets cos θ; the axis opposite θ gets sin θ' },
    ],
  },
  {
    match: /parallelogram law|2PQ\s*cos/i,
    title: 'Parallelogram law of vector addition',
    formula: 'R = √(P² + Q² + 2 P Q cos θ)',
    domain: 'Mechanics',
    section: '#story-vectors',
    summary: 'Two vectors P and Q meeting at tail-to-tail angle θ add along the diagonal of their parallelogram, with magnitude √(P² + Q² + 2PQ cos θ).',
    why: 'Project P into P cos θ continuing along Q and P sin θ perpendicular to Q. That forms a right triangle of base (Q + P cos θ) and height P sin θ; Pythagoras plus cos²θ + sin²θ = 1 gives R² = P² + Q² + 2PQ cos θ.',
    scales: [
      { label: 'Same direction (θ = 0°, cos 0° = +1)', result: 'Alignment bonus +2PQ is maximum → R = P + Q (ordinary addition)' },
      { label: 'Right angles (θ = 90°, cos 90° = 0)', result: 'Alignment term vanishes → R = √(P² + Q²) (ordinary Pythagoras)' },
      { label: 'Opposite directions (θ = 180°, cos 180° = −1)', result: 'Alignment term subtracts → R = |P − Q| (tug-of-war cancellation)' },
    ],
    limit: 'Exact for any two vectors in Euclidean space; for relativistic velocities near light speed c, Einstein’s velocity-addition formula replaces simple vector addition.',
    terms: [
      { sym: 'R', name: 'Resultant magnitude |P + Q|', unit: 'same unit as P and Q (e.g. N or m/s)', note: 'Always lies between |P − Q| and P + Q' },
      { sym: 'P, Q', name: 'Magnitudes of the two vectors', unit: 'newtons, N (or m/s, m)', note: 'Lengths of the two adjacent sides of the parallelogram' },
      { sym: 'θ', name: 'Angle between P and Q (tail to tail)', unit: 'degrees, ° (0° to 180°)', note: 'Controls the 2PQ cos θ alignment bonus' },
    ],
  },
];

export function matchEquation(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  for (const item of EQ_DB) {
    if (item.match.test(clean)) return item;
  }
  return null;
}

function setupEq(eqEl, idx) {
  if (eqEl.dataset.eqReady) return;
  eqEl.dataset.eqReady = '1';
  const info = matchEquation(eqEl.textContent || '');
  if (!info) return;
  const cardId = `eq-card-${idx}`;

  const wrap = el('div', { class: 'eq-wrap' });
  eqEl.parentNode.insertBefore(wrap, eqEl);
  wrap.appendChild(eqEl);

  const symBar = el('div', { class: 'eq-sym-bar', role: 'group', 'aria-label': `Symbols and units in ${info.title}` });
  const rows = [];

  const toggleBtn = el('button', {
    type: 'button',
    class: 'eq-lens-btn',
    'aria-expanded': 'false',
    'aria-controls': cardId,
    title: 'Inspect every symbol, geometric meaning, scaling law and SI unit in this equation',
  }, el('span', { class: 'eq-lens-i', html: LENS_ICON }), el('span', { class: 'eq-lens-l' }, 'Symbols & units'));
  symBar.appendChild(toggleBtn);

  info.terms.forEach((t, ti) => {
    const chip = el('button', {
      type: 'button',
      class: 'eq-sym-chip',
      'data-term': String(ti),
      title: `${t.sym}: ${t.name} (${t.unit})`,
    }, el('b', {}, t.sym), el('span', {}, t.unit.split(',')[1]?.trim() || t.unit));
    chip.addEventListener('click', () => {
      openCard(true, ti);
    });
    chip.addEventListener('mouseenter', () => {
      if (!card.hidden) highlightRow(ti);
    });
    symBar.appendChild(chip);
  });

  const tbody = el('div', { class: 'eq-lens-grid' });
  info.terms.forEach((t, ti) => {
    const r = el('div', { class: 'eq-lens-row', 'data-term': String(ti) },
      el('span', { class: 'eq-c-sym' }, t.sym),
      el('div', { class: 'eq-c-body' },
        el('div', { class: 'eq-c-top' },
          el('b', { class: 'eq-c-name' }, t.name),
          el('span', { class: 'eq-c-unit' }, `Unit: ${t.unit}`),
        ),
        el('p', { class: 'eq-c-note' }, t.note),
      ),
    );
    rows.push(r);
    tbody.appendChild(r);
  });

  // Living Equation Lens extras: Why it takes this shape, Interactive Scaling chips, Where it stops working
  const extras = el('div', { class: 'eq-lens-extras' });
  if (info.why) {
    extras.appendChild(
      el('div', { class: 'eq-meta-block' },
        el('b', { class: 'eq-meta-k' }, 'Why it takes this shape: '),
        el('span', {}, info.why),
      )
    );
  }
  if (info.scales && info.scales.length) {
    const scaleOut = el('p', { class: 'eq-scale-out' }, `→ ${info.scales[0].result}`);
    const chipRow = el('div', { class: 'eq-scale-chips' });
    info.scales.forEach((sc, si) => {
      const b = el('button', {
        type: 'button',
        class: 'eq-scale-chip' + (si === 0 ? ' is-active' : ''),
      }, sc.label);
      b.addEventListener('click', () => {
        chipRow.querySelectorAll('.eq-scale-chip').forEach((c, ci) => c.classList.toggle('is-active', ci === si));
        scaleOut.textContent = `→ ${sc.result}`;
      });
      chipRow.appendChild(b);
    });
    extras.appendChild(
      el('div', { class: 'eq-scale-box' },
        el('div', { class: 'eq-meta-k' }, 'What happens if you change one thing?'),
        chipRow,
        scaleOut,
      )
    );
  }
  if (info.limit) {
    extras.appendChild(
      el('div', { class: 'eq-meta-block eq-meta-limit' },
        el('b', { class: 'eq-meta-k' }, 'Where it stops working: '),
        el('span', {}, info.limit),
      )
    );
  }

  const closeBtn = el('button', { type: 'button', class: 'eq-lens-close', 'aria-label': 'Close symbol inspector' }, '×');
  const card = el('div', {
    class: 'eq-lens-card',
    id: cardId,
    'data-glass': '1',
    role: 'region',
    'aria-label': info.title,
    hidden: true,
  },
    el('div', { class: 'eq-lens-head' },
      el('span', { class: 'eq-lens-k' }, 'MAGNIFIER · SYMBOL, SCALING & UNIT BREAKDOWN'),
      closeBtn,
    ),
    el('p', { class: 'eq-lens-title' }, info.title),
    el('p', { class: 'eq-lens-sum' }, info.summary),
    tbody,
    extras,
  );

  wrap.append(symBar, card);

  function highlightRow(ti) {
    rows.forEach((r, i) => r.classList.toggle('is-active', i === ti));
    symBar.querySelectorAll('.eq-sym-chip').forEach((c, i) => c.classList.toggle('is-active', i === ti));
  }

  function openCard(show, activeIdx = -1) {
    const wasHidden = card.hidden;
    card.hidden = !show;
    toggleBtn.setAttribute('aria-expanded', String(show));
    wrap.classList.toggle('eq-open', show);
    if (show) {
      if (wasHidden && typeof window !== 'undefined' && window.__bookSound) {
        window.__bookSound.play('lens');
      }
      highlightRow(activeIdx);
    } else {
      highlightRow(-1);
      toggleBtn.focus({ preventScroll: true });
    }
  }

  toggleBtn.addEventListener('click', () => openCard(card.hidden, 0));
  closeBtn.addEventListener('click', () => openCard(false));
  eqEl.style.cursor = 'pointer';
  eqEl.title = 'Tap to inspect symbols, scaling laws and SI units';
  eqEl.addEventListener('click', () => openCard(card.hidden, 0));
}

function mountFormulaAtlas() {
  const modelsSec = document.getElementById('models');
  if (!modelsSec || document.getElementById('formula-atlas')) return;

  const domains = ['All', 'Mechanics', 'Fields', 'Matter & Heat', 'Energy', 'Waves & Light', 'Electricity & Magnetism', 'Quantum & Cosmos'];
  let activeDomain = 'All';

  const filterBar = el('div', { class: 'curr-chips', role: 'group', 'aria-label': 'Filter formulas by domain' });
  const grid = el('div', { class: 'val-grid formula-atlas-grid' });

  function renderCards() {
    grid.innerHTML = '';
    EQ_DB.forEach((item) => {
      if (activeDomain !== 'All' && item.domain !== activeDomain) return;
      const whereLabel = item.section.startsWith('#story-')
        ? `Story: ${item.section.replace('#story-', '')}`
        : `§${item.section.replace('#s', '').replace('-', '.')}`;
      const jumpLink = el('a', {
        class: 'val-where',
        href: item.section,
      }, whereLabel);
      if (item.section.startsWith('#story-')) {
        const sid = item.section.replace('#story-', '');
        jumpLink.dataset.story = sid;
      }

      const scaleNote = item.scales && item.scales[0]
        ? `${item.scales[0].label} → ${item.scales[0].result}`
        : '';

      const card = el('div', { class: 'val-card formula-atlas-card' },
        el('div', { class: 'val-head' },
          el('span', { class: 'val-key' }, item.domain),
          jumpLink,
        ),
        el('h4', { class: 'val-name' }, item.title),
        el('p', { class: 'val-num formula-atlas-eq' }, item.formula),
        el('p', { class: 'val-deriv' }, item.why || item.summary),
        scaleNote ? el('p', { class: 'val-src' }, `Scaling: ${scaleNote}`) : null,
      );
      grid.appendChild(card);
    });
  }

  domains.forEach((dom) => {
    const btn = el('button', {
      type: 'button',
      class: 'curr-chip',
      'aria-pressed': String(dom === activeDomain),
    }, dom === 'All' ? `All (${EQ_DB.length})` : dom);
    btn.addEventListener('click', () => {
      activeDomain = dom;
      filterBar.querySelectorAll('.curr-chip').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      renderCards();
    });
    filterBar.appendChild(btn);
  });

  const chainNote = el('p', { class: 'curr-meta' },
    'Instead of a wall of 15 disconnected formulas to memorise, every equation in this book grows from five visual archetypes: ' +
    '(1) Rate × Time = Change (v = u + at, Δp = FΔt, E = Pt), ' +
    '(2) Area under a Curve (s = ut + ½at², Eₖ = ½mv², Eₑ = ½kx², W = Fs cos θ), ' +
    '(3) Right-Angle Shadow Projection (R_x = R cos θ, R = √(P² + Q² + 2PQ cos θ)), ' +
    '(4) Intensity & Spread (p = F/A, ρ = m/V, F = Gm₁m₂/r², Δg ∝ 1/d³), and ' +
    '(5) Conservation Bookkeeping (m₁v₁ + m₂v₂, E = mc², P = VI).'
  );

  const box = el('aside', {
    class: 'values-registry formula-atlas',
    id: 'formula-atlas',
    'aria-label': 'Connected Formula and Archetype Atlas',
  },
    el('h3', {}, 'Connected Formula & Archetype Atlas'),
    chainNote,
    filterBar,
    grid,
  );

  modelsSec.appendChild(box);
  renderCards();
}

function initAllEquations(root = document) {
  root.querySelectorAll('p.eq').forEach((eq, i) => setupEq(eq, i + 1));
}

App.ready(() => {
  initAllEquations(document);
  mountFormulaAtlas();
  App.on('story:open', d => { if (d && d.el) initAllEquations(d.el); });
});
