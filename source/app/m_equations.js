// Interactive Symbol & Unit Breakdown on Equations (:::eq) + Frosted-Glass Inspector Card (lensCard).
// Tapping, hovering, or focusing on any equation block (or its symbols) opens a frosted-glass card
// breaking down every symbol, physical quantity, SI unit, and a real-world example.
import App from './core.js';

const { el } = App;

const LENS_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12.4 12.4 L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const EQ_DB = [
  {
    match: /distance from rest/i,
    title: 'Uniform acceleration from rest',
    summary: 'When an object starts from rest and speeds up at a steady rate, the distance it covers grows with the square of the time.',
    terms: [
      { sym: 'd', name: 'Distance from rest', unit: 'metres, m', note: 'How far it has travelled since t = 0' },
      { sym: 'a', name: 'Acceleration', unit: 'metres per second squared, m/s²', note: 'Rate of gain of velocity (9.8 m/s² in free fall)' },
      { sym: 't', name: 'Time elapsed', unit: 'seconds, s', note: 'Squared (t²): double the time → four times the distance' },
    ],
  },
  {
    match: /net force\s*=\s*mass|F\s*=\s*ma/i,
    title: 'Newton’s second law of motion',
    summary: 'The net (resultant) force on an object equals its mass multiplied by the acceleration that force produces.',
    terms: [
      { sym: 'F', name: 'Net (resultant) force', unit: 'newtons, N (1 N = 1 kg·m/s²)', note: 'What is left after all pushes and pulls are added' },
      { sym: 'm', name: 'Mass', unit: 'kilograms, kg', note: 'How much matter is in the object (inertia)' },
      { sym: 'a', name: 'Acceleration', unit: 'metres per second squared, m/s²', note: 'Change in velocity each second, in the direction of F' },
    ],
  },
  {
    match: /weight\s*=\s*mass/i,
    title: 'Weight in a gravitational field',
    summary: 'Weight is the gravitational pull of a planet on a mass. Near Earth’s surface each kilogram is pulled down with 9.8 N.',
    terms: [
      { sym: 'W', name: 'Weight', unit: 'newtons, N', note: 'A downward gravitational force (a vector)' },
      { sym: 'm', name: 'Mass', unit: 'kilograms, kg', note: 'Stays the same on Earth, on the Moon, and in orbit' },
      { sym: 'g', name: 'Gravitational field strength', unit: 'newtons per kilogram, N/kg (or m/s²)', note: '9.8 N/kg on Earth; 1.6 N/kg on the Moon' },
    ],
  },
  {
    match: /G\s*m.*r²|Gm₁m₂/i,
    title: 'Newton’s law of universal gravitation',
    summary: 'Every mass pulls every other mass with a force proportional to both masses and inversely proportional to the square of their separation.',
    terms: [
      { sym: 'F', name: 'Gravitational force', unit: 'newtons, N', note: 'Equal and opposite on both bodies' },
      { sym: 'G', name: 'Gravitational constant', unit: '6.674 × 10⁻¹¹ N·m²/kg²', note: 'Measured in the lab by Cavendish (1798)' },
      { sym: 'm₁, m₂', name: 'The two masses', unit: 'kilograms, kg', note: 'e.g. Earth and Moon, or two lead spheres' },
      { sym: 'r', name: 'Distance between centres', unit: 'metres, m', note: 'Squared in the denominator: 2× farther → ¼ the pull' },
    ],
  },
  {
    match: /pressure\s*=\s*force|p\s*=\s*F/i,
    title: 'Pressure on a surface',
    summary: 'Pressure measures how concentrated a perpendicular force is over the area it presses on.',
    terms: [
      { sym: 'p', name: 'Pressure', unit: 'pascals, Pa (1 Pa = 1 N/m²)', note: 'Sea-level air pressure is about 101,300 Pa' },
      { sym: 'F', name: 'Normal force', unit: 'newtons, N', note: 'The push at right angles to the surface' },
      { sym: 'A', name: 'Contact area', unit: 'square metres, m²', note: 'Smaller area → larger pressure for the same force' },
    ],
  },
  {
    match: /Δp\s*=|ρ\s*g\s*Δh/i,
    title: 'Hydrostatic fluid pressure with depth',
    summary: 'Going deeper in a liquid or gas increases the pressure because of the weight of the fluid column above.',
    terms: [
      { sym: 'Δp', name: 'Change in pressure', unit: 'pascals, Pa', note: 'About +100,000 Pa (1 atm) for every 10 m of sea water' },
      { sym: 'ρ', name: 'Fluid density', unit: 'kilograms per cubic metre, kg/m³', note: 'Fresh water: 1,000 kg/m³; sea water: 1,025 kg/m³' },
      { sym: 'g', name: 'Gravitational field strength', unit: '9.8 N/kg (or m/s²)', note: 'Pull of gravity per kilogram of fluid' },
      { sym: 'Δh', name: 'Depth change', unit: 'metres, m', note: 'Only vertical depth matters, never the width of the lake' },
    ],
  },
  {
    match: /kinetic energy|Eₖ\s*=\s*½/i,
    title: 'Kinetic energy (energy in the kinetic store)',
    summary: 'The energy a moving object holds in its kinetic store grows with its mass and with the square of its speed.',
    terms: [
      { sym: 'Eₖ', name: 'Kinetic energy', unit: 'joules, J', note: '20 g marble at 4.43 m/s holds 0.196 J' },
      { sym: 'm', name: 'Mass', unit: 'kilograms, kg', note: 'Triple the mass → triple the kinetic energy' },
      { sym: 'v', name: 'Speed', unit: 'metres per second, m/s', note: 'Squared (v²): double the speed → four times the energy' },
    ],
  },
  {
    match: /work\s*=\s*force|W\s*=\s*F\s*×\s*d/i,
    title: 'Mechanical work done by a force',
    summary: 'Work is the energy transferred along the mechanical pathway when a force moves an object along its direction.',
    terms: [
      { sym: 'W', name: 'Work done (energy transferred)', unit: 'joules, J (1 J = 1 N·m)', note: 'Zero if the object does not move' },
      { sym: 'F', name: 'Force along motion', unit: 'newtons, N', note: 'e.g. 392 N lifting a 40 kg person' },
      { sym: 'd', name: 'Distance moved in line with F', unit: 'metres, m', note: 'e.g. 3 m up one storey → 1,176 J' },
    ],
  },
  {
    match: /gravitational potential|Eₚ\s*=\s*m\s*g\s*h/i,
    title: 'Gravitational potential energy store',
    summary: 'Lifting a mass m through a vertical height h against gravity stores mgh of energy in the object–Earth gravitational store.',
    terms: [
      { sym: 'Eₚ', name: 'Gravitational potential energy', unit: 'joules, J', note: 'Depends only on vertical height change, not the path' },
      { sym: 'm', name: 'Mass', unit: 'kilograms, kg', note: '0.100 kg ball lifted 1.00 m stores 0.98 J' },
      { sym: 'g', name: 'Gravitational field strength', unit: 'newtons per kilogram, N/kg (9.8 N/kg)', note: 'Strength of Earth’s pull on each kilogram' },
      { sym: 'h', name: 'Height gained', unit: 'metres, m', note: 'Vertical height above your chosen zero level' },
    ],
  },
  {
    match: /power\s*=\s*energy|P\s*=\s*E\s*÷\s*t/i,
    title: 'Power (rate of energy transfer)',
    summary: 'Power measures how fast energy moves from one store to another: joules per second.',
    terms: [
      { sym: 'P', name: 'Power', unit: 'watts, W (1 W = 1 J/s)', note: 'LED bulb ~10 W, resting human ~100 W, geyser ~2,000 W' },
      { sym: 'E', name: 'Energy transferred', unit: 'joules, J (or kWh on bills)', note: '1 kWh = 3,600,000 J' },
      { sym: 't', name: 'Time taken', unit: 'seconds, s', note: 'Same climb in half the time needs twice the power' },
    ],
  },
  {
    match: /specific heat capacity/i,
    title: 'Thermal energy for a temperature change',
    summary: 'The energy needed to warm a substance depends on its mass, its specific heat capacity, and the temperature rise.',
    terms: [
      { sym: 'ΔE', name: 'Thermal energy transferred', unit: 'joules, J', note: 'Energy entering or leaving the internal store' },
      { sym: 'm', name: 'Mass', unit: 'kilograms, kg', note: '1 litre of water has a mass of 1.0 kg' },
      { sym: 'c', name: 'Specific heat capacity', unit: 'joules per kilogram per °C, J/(kg·°C)', note: 'Water: 4,186 J/(kg·°C); aluminium: 900 J/(kg·°C)' },
      { sym: 'Δθ', name: 'Temperature change', unit: 'degrees Celsius, °C (or K)', note: 'Final temperature minus starting temperature' },
    ],
  },
  {
    match: /period\s*=\s*2π/i,
    title: 'Period of a simple pendulum',
    summary: 'For small swings, a pendulum’s time for one complete back-and-forth swing depends only on its length and gravity, not its mass.',
    terms: [
      { sym: 'T', name: 'Period (time for one full swing)', unit: 'seconds, s', note: 'A 1.0 m pendulum on Earth takes 2.01 s' },
      { sym: 'L', name: 'Length to centre of bob', unit: 'metres, m', note: '4× the length → 2× the period (square-root law)' },
      { sym: 'g', name: 'Acceleration of free fall', unit: 'metres per second squared, m/s²', note: '9.8 m/s² on Earth' },
    ],
  },
  {
    match: /wave speed\s*=\s*frequency/i,
    title: 'The universal wave equation',
    summary: 'Every wave travels one wavelength in one period, so wave speed equals frequency multiplied by wavelength.',
    terms: [
      { sym: 'v', name: 'Wave speed', unit: 'metres per second, m/s', note: 'Sound in 30 °C air: 349 m/s; light in air: 3.00 × 10⁸ m/s' },
      { sym: 'f', name: 'Frequency', unit: 'hertz, Hz (cycles per second)', note: 'Fixed by the source; does not change when crossing a boundary' },
      { sym: 'λ', name: 'Wavelength', unit: 'metres, m', note: 'Distance from crest to crest' },
    ],
  },
  {
    match: /angle of reflection/i,
    title: 'Law of reflection',
    summary: 'A ray reflecting off a smooth mirror leaves at the exact same angle to the normal as it arrived.',
    terms: [
      { sym: 'θᵣ', name: 'Angle of reflection', unit: 'degrees, °', note: 'Measured from the perpendicular normal line, never from the mirror surface' },
      { sym: 'θᵢ', name: 'Angle of incidence', unit: 'degrees, °', note: 'Equals θᵣ for every wavelength' },
    ],
  },
  {
    match: /refractive index|n\s*=\s*c/i,
    title: 'Refractive index of a medium',
    summary: 'Refractive index compares the speed of light in empty space with its slower speed inside a transparent material.',
    terms: [
      { sym: 'n', name: 'Refractive index', unit: 'dimensionless ratio (no unit, ≥ 1)', note: 'Water: 1.333; glass: 1.52; diamond: 2.42' },
      { sym: 'c', name: 'Speed of light in vacuum', unit: '3.00 × 10⁸ m/s', note: 'The cosmic speed limit' },
      { sym: 'v', name: 'Speed of light in the material', unit: 'metres per second, m/s', note: 'In water: 2.25 × 10⁸ m/s (three-quarters of c)' },
    ],
  },
  {
    match: /V\s*=\s*I\s*×\s*R|voltage\s*=\s*current/i,
    title: 'Ohm’s law & electrical resistance',
    summary: 'The potential difference (push) across a conductor equals the current flowing through it multiplied by its resistance.',
    terms: [
      { sym: 'V', name: 'Potential difference (voltage)', unit: 'volts, V (1 V = 1 J/C)', note: 'Energy transferred per coulomb of charge' },
      { sym: 'I', name: 'Electric current', unit: 'amperes, A (1 A = 1 C/s)', note: 'Coulombs of charge passing per second' },
      { sym: 'R', name: 'Resistance', unit: 'ohms, Ω (1 Ω = 1 V/A)', note: 'Constant for a metal wire at steady temperature' },
    ],
  },
  {
    match: /E\s*=\s*mc²/i,
    title: 'Einstein’s mass–energy equivalence',
    summary: 'Mass itself is a concentrated store of energy. A tiny loss of mass Δm releases Δm × c² of energy.',
    terms: [
      { sym: 'E', name: 'Rest energy', unit: 'joules, J', note: 'The Sun radiates 3.83 × 10²⁶ J every second' },
      { sym: 'm', name: 'Mass', unit: 'kilograms, kg', note: 'The Sun converts 4.26 million tonnes of mass per second' },
      { sym: 'c', name: 'Speed of light in vacuum', unit: '2.998 × 10⁸ m/s', note: 'c² ≈ 9 × 10¹⁶ J per kilogram' },
    ],
  },
  {
    match: /v\s*=\s*H\s*×\s*d/i,
    title: 'Hubble–Lemaître law of cosmic expansion',
    summary: 'Because space itself is stretching, a distant galaxy’s recession speed is proportional to its distance from us.',
    terms: [
      { sym: 'v', name: 'Recession speed', unit: 'kilometres per second, km/s', note: 'Measured from the redshift of spectral lines' },
      { sym: 'H', name: 'Hubble constant', unit: '~22 km/s per million light-years (~70 km/s/Mpc)', note: 'Rate at which space stretches with distance' },
      { sym: 'd', name: 'Distance to the galaxy', unit: 'million light-years (or megaparsecs, Mpc)', note: 'Twice as far away → receding twice as fast' },
    ],
  },
  {
    match: /μ₀\s*ε₀/i,
    title: 'Maxwell’s electromagnetic wave speed',
    summary: 'Electric and magnetic constants measured on a lab bench predict the exact speed of light in empty space.',
    terms: [
      { sym: 'c', name: 'Electromagnetic wave speed', unit: '3.00 × 10⁸ m/s', note: 'Matched the measured speed of light!' },
      { sym: 'μ₀', name: 'Magnetic constant (permeability)', unit: '1.257 × 10⁻⁶ N/A²', note: 'Sets magnetic field strength per amp of current' },
      { sym: 'ε₀', name: 'Electric constant (permittivity)', unit: '8.854 × 10⁻¹² C²/(N·m²)', note: 'Sets electric field strength per coulomb of charge' },
    ],
  },
  {
    match: /E\s*=\s*h\s*f/i,
    title: 'Planck–Einstein photon energy',
    summary: 'Light delivers energy in quantum packets (photons); each single photon’s energy is fixed by the wave’s frequency.',
    terms: [
      { sym: 'E', name: 'Energy of one photon', unit: 'joules, J (or electronvolts, eV)', note: 'Visible photons carry 1.65 eV (red) to 3.1 eV (violet)' },
      { sym: 'h', name: 'Planck’s constant', unit: '6.626 × 10⁻³⁴ J·s', note: 'Fundamental quantum action constant' },
      { sym: 'f', name: 'Wave frequency', unit: 'hertz, Hz (s⁻¹)', note: 'Higher frequency → more energy per packet' },
    ],
  },
];

function matchEquation(text) {
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
  if (!info) return; // An unknown equation keeps its explanation in the surrounding prose.
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
    title: 'Inspect every symbol, quantity and SI unit in this equation',
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
      el('span', { class: 'eq-lens-k' }, 'MAGNIFIER · SYMBOL & UNIT BREAKDOWN'),
      closeBtn,
    ),
    el('p', { class: 'eq-lens-title' }, info.title),
    el('p', { class: 'eq-lens-sum' }, info.summary),
    tbody,
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
  eqEl.title = 'Tap to inspect symbols and SI units';
  eqEl.addEventListener('click', () => openCard(card.hidden, 0));
}

function initAllEquations(root = document) {
  root.querySelectorAll('p.eq').forEach((eq, i) => setupEq(eq, i + 1));
}

App.ready(() => {
  initAllEquations(document);
  App.on('story:open', d => { if (d && d.el) initAllEquations(d.el); });
});
