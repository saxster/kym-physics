// Switchable Curriculum Wording Filter (Every course | IB MYP | IGCSE 0625 | CBSE / NCERT | English GCSE)
// + Chapter-by-Chapter Teachers' & Curriculum Guide + Verbatim Numbers & Sources Registry (#models & #credits).
import App from './core.js';
import { VALUES_LIST } from './values_data.js';

const { el, store } = App;

const BOARDS = [
  ['all', 'Every course'],
  ['igcse', 'IGCSE 0625'],
  ['myp', 'IB MYP'],
  ['cbse', 'CBSE / NCERT'],
  ['gcse', 'English GCSE'],
];

// Chapter-level syllabus mapping across the four major boards
const CH_SYLLABUS = {
  0: {
    title: 'How we know',
    igcse: 'Topic 1.1 Physical quantities and measurement techniques: SI units (m, kg, s), prefixes, averaging multiple measurements (e.g. oscillations or thickness), scalars vs vectors.',
    myp: 'MYP Sciences Criterion A (Knowing & understanding) & Criterion B/C (Inquiring, processing & evaluating): models vs observations, measurement uncertainty, and order-of-magnitude estimation.',
    cbse: 'NCERT Class 9/11 Physical World & Measurement: SI base units, significant figures, parallax and indirect measurement methods.',
    gcse: 'Working Scientifically (AQA/OCR/Edexcel): SI units and prefixes, repeatable vs reproducible measurements, random vs systematic uncertainty.',
    simplify: 'Treats Sun rays arriving at Earth as parallel (accurate to 0.004° because the Sun is 150 million km away).',
    ask: 'Why does measuring 100 grains of rice and dividing by 100 give a more trustworthy answer than weighing a single grain?',
  },
  1: {
    title: 'Where and how fast',
    igcse: 'Topic 1.2 Motion: speed = d/t, velocity as speed in a given direction, acceleration a = Δv/Δt, gradient of distance–time and speed–time graphs, g ≈ 9.8 m/s².',
    myp: 'MYP Movement & Change: reference frames, position–time vs velocity–time graphs, distinguishing average from instantaneous speed.',
    cbse: 'NCERT Class 9 Ch 7 (Motion): distance vs displacement, uniform and non-uniform motion, equations of uniformly accelerated motion (s = ut + ½at²), g = 9.8 m/s² (or 10 m/s² when stated).',
    gcse: 'Forces & Motion: scalar distance vs vector displacement, speed vs velocity, tangent gradient on curved distance–time graphs, g ≈ 9.8 m/s².',
    simplify: 'Strobe toss assumes zero air resistance over a 1 m indoor toss (drag changes height by less than 0.5%).',
    ask: 'At the very top of a vertical toss the ball’s velocity is zero for an instant. Is its acceleration zero there?',
  },
  2: {
    title: 'Why things keep moving',
    igcse: 'Topic 1.5.1 Effects of forces: an object remains at rest or continues in a straight line at constant speed unless acted on by a resultant force; solid friction impedes motion and produces heating.',
    myp: 'MYP Forces & Inertia: Galileo’s inclined-plane thought experiment, overcoming the impetus misconception, static vs sliding friction.',
    cbse: 'NCERT Class 9 Ch 8 (Force and Laws of Motion): Galileo’s double-ramp deduction, Newton’s First Law of Motion, inertia and mass, friction as an opposing contact force.',
    gcse: 'Newton’s First Law: zero resultant force means stationary stays stationary and moving continues at the same velocity; friction transfers kinetic store to thermal store.',
    simplify: 'Galileo ramp simulation treats the puck as a sliding point mass without rotational inertia.',
    ask: 'A puck slides across smooth ice at steady speed with nobody touching it. What horizontal force keeps it moving forward?',
  },
  3: {
    title: 'How forces add and pair',
    igcse: 'Topic 1.5 & 1.6: resultant force F = ma; weight W = mg with g = 9.8 N/kg; momentum p = mv, impulse FΔt = Δp, conservation of total momentum in a collision.',
    myp: 'MYP Systems & Interactions: free-body diagrams, distinguishing balanced forces on one body from Newton’s 3rd-law pairs on two different bodies.',
    cbse: 'NCERT Class 9 Ch 8: balanced vs unbalanced forces, rate of change of momentum F = ma, action and reaction act on two different bodies, conservation of momentum.',
    gcse: 'Resultant forces, W = mg (g = 9.8 N/kg), Newton’s Second and Third Laws, momentum p = mv and crash crumple-zone impulse Δp / Δt.',
    simplify: '1D cart tracks neglect wheel bearing friction and air drag during the brief collision interval.',
    ask: 'When a mosquito hits a speeding train’s windscreen, which experiences the larger force, and which experiences the larger acceleration?',
  },
  4: {
    title: 'Falling, flying and going round',
    igcse: 'Topic 1.2 & 1.5: free fall with and without air resistance (terminal velocity when drag balances weight); circular motion requires a perpendicular force towards the centre.',
    myp: 'MYP 2D Motion: independence of horizontal and vertical motion in projectiles; centripetal force as a role played by tension, gravity or friction.',
    cbse: 'NCERT Class 9 Ch 9 & Class 11 Motion in a Plane: free fall g = 9.8 m/s², projectile parabola, uniform circular motion and centripetal acceleration v²/r.',
    gcse: 'Terminal velocity in fluids (resultant force reaches zero); circular motion has constant speed but changing velocity due to a resultant centripetal force.',
    simplify: 'Two-coin projectile model omits air drag; whirl model treats the string as massless and inextensible.',
    ask: 'If the string snaps while a ball is whirling in a horizontal circle, what path does the ball follow across the floor?',
  },
  5: {
    title: 'The pull of the world',
    igcse: 'Topic 1.3 Mass and weight & 6.1 Earth and Solar System: gravitational field strength g = W/m (9.8 N/kg); orbital motion of planets, moons and satellites.',
    myp: 'MYP Universal Gravitation: Newton’s inverse-square synthesis of terrestrial free fall and lunar orbit; Kepler’s ellipse laws; apparent weightlessness in free fall.',
    cbse: 'NCERT Class 9 Ch 9 (Gravitation): Universal Law F = Gm₁m₂/r², Cavendish’s G, Kepler’s laws, free fall and weightlessness.',
    gcse: 'Gravity, weight W = mg, circular and elliptical orbits where gravity provides the centripetal force, changing velocity at constant orbital speed.',
    simplify: 'Two-body cannon orbit treats Earth as a spherically symmetric mass and launches above the atmosphere.',
    ask: 'Does an astronaut floating inside the International Space Station have zero weight, or is she in continuous free fall?',
  },
  6: {
    title: 'Under pressure',
    igcse: 'Topic 1.4 Density (ρ = m/V) & 1.8 Pressure (p = F/A, Δp = ρgΔh). Note: IGCSE 0625 does not use the words “suction” or “upthrust”; explain in terms of pressure differences and buoyant force.',
    myp: 'MYP Fluids & Pressure: particulate collision picture of gas pressure, atmospheric weight, hydrostatic paradox, Archimedes’ displacement principle.',
    cbse: 'NCERT Class 9 Ch 9 (Floatation): thrust and pressure (p = F/A), pressure in fluids, buoyancy / upthrust, Archimedes’ principle and relative density.',
    gcse: 'Pressure in fluids p = F/A and p = hρg; atmospheric pressure; upthrust (buoyant force) equal to the weight of displaced fluid.',
    simplify: 'Treats water and mercury as incompressible fluids with uniform density at all depths.',
    ask: 'Why does a straw stop working if you poke a tiny pinhole in the side of the straw above the drink?',
  },
  7: {
    title: 'Energy',
    igcse: 'Topic 1.7 Energy, work and power: stores (kinetic, gravitational potential, chemical, elastic/strain, nuclear, electrostatic, internal/thermal) and transfers (mechanical work, electrical work, heating, waves); E_k = ½mv², ΔE_p = mgΔh, W = Fd, P = ΔE/t, efficiency.',
    myp: 'MYP Energy Conservation: Feynman’s conservation ledger, stores vs pathways, useful vs dissipated thermal energy, household kWh and city-scale generation.',
    cbse: 'NCERT Class 9 Ch 10 (Work and Energy): work W = F s, kinetic energy ½mv², potential energy mgh, law of conservation of energy, power P = W/t, commercial unit 1 kWh = 3.6 × 10⁶ J.',
    gcse: '8 Energy Stores & 4 Pathways (AQA/OCR/Edexcel): E_k = ½mv², E_p = mgh, E_e = ½ke², P = E/t, efficiency = useful output / total input, Sankey diagrams.',
    simplify: 'Roller-coaster track models the marble as a sliding point mass unless spin energy is included.',
    ask: 'If energy can never be destroyed, what are you actually paying for when the electricity bill charges for “units consumed”?',
  },
  8: {
    title: 'Warmth and the monsoon',
    igcse: 'Topic 2.1–2.3 Thermal physics: particle model, internal energy vs temperature, specific heat capacity c = ΔE/(mΔθ), conduction, convection, radiation, evaporation cooling.',
    myp: 'MYP Thermal Systems: microscopic kinetic theory, phase changes at constant temperature, evaporative cooling in a clay matka, land–sea monsoon convection.',
    cbse: 'NCERT Class 7/11 Thermal Properties of Matter: heat vs temperature, specific heat capacity Q = mcΔT, latent heat, conduction, convection, radiation, sea breeze.',
    gcse: 'Internal energy, specific heat capacity ΔE = mcΔθ, latent heat of fusion/vaporisation, thermal conductivity of materials.',
    simplify: '1D conduction bar models 6 discrete slabs with Newtonian contact transfer and room heat sink.',
    ask: 'Why does a metal spoon in a 30 °C room feel much colder to your fingers than a wooden spoon right next to it at the exact same 30 °C?',
  },
  9: {
    title: 'Swings, ripples and sound',
    igcse: 'Topic 3.1 General properties of waves & 3.4 Sound: transverse vs longitudinal, amplitude, wavelength, frequency f = 1/T, wave speed v = fλ, echoes, pitch and loudness, ultrasound (> 20 kHz).',
    myp: 'MYP Waves & Oscillations: pendulum isochronism, medium stays in place while disturbance travels, superposition, standing-wave harmonics and Doppler shift.',
    cbse: 'NCERT Class 9 Ch 11 (Sound): longitudinal compression/rarefaction waves, v = νλ, pitch vs loudness (dB logarithmic scale), echoes and reverberation.',
    gcse: 'Transverse and longitudinal waves, T = 1/f, v = fλ, oscilloscope traces of sound pitch and amplitude, reflection and refraction of waves.',
    simplify: 'Small-angle pendulum formula T = 2π√(L/g) assumes sin θ ≈ θ (accurate to within 1% below 23°).',
    ask: 'When a ripple crosses a bucket of water, does the water at the middle travel to the rim with the ripple?',
  },
  10: {
    title: 'Rays, mirrors and eyes',
    igcse: 'Topic 3.2 Light: rectilinear propagation, reflection θ_i = θ_r, virtual image in a plane mirror, refraction n = c/v = sin i / sin r, critical angle and total internal reflection, converging and diverging lenses.',
    myp: 'MYP Optics & Vision: Ibn al-Haytham’s intromission rays, pinhole camera geometry, Snell’s law via wavefront speed change, corneal + crystalline lens accommodation.',
    cbse: 'NCERT Class 10 Ch 9 & 10 (Light — Reflection & Refraction; Human Eye): laws of reflection/refraction, refractive index n = c/v, total internal reflection, eye accommodation, myopia and hypermetropia.',
    gcse: 'Specular vs diffuse reflection, ray diagrams for plane mirrors and lenses, refraction wave-front model, eye defects and corrective lenses.',
    simplify: 'Paraxial thin-lens model neglects spherical and chromatic aberration.',
    ask: 'If you cover the top half of a camera lens (or your eye’s pupil) with black card, does the top half of the image disappear?',
  },
  11: {
    title: 'Colour, the sky and the spectrum',
    igcse: 'Topic 3.2.4 Dispersion of light & 3.3 Electromagnetic spectrum: prism order (red bent least, violet most), monochromatic light, EM spectrum order by wavelength/frequency, all travel at 3.0 × 10⁸ m/s in vacuum.',
    myp: 'MYP Light as a Wave: Newton’s two-prism experiment, additive RGB vs subtractive pigments, Rayleigh λ⁻⁴ sky scattering, Young’s two-slit interference, Maxwell’s EM wave synthesis.',
    cbse: 'NCERT Class 10 Ch 10 (The Human Eye and the Colourful World): prism dispersion and recombination, scattering of light (blue sky, red sunrise/sunset), Raman effect.',
    gcse: 'Dispersion, colour filters and differential reflection, full electromagnetic spectrum from radio to gamma rays, wave interference.',
    simplify: 'Three-band RGB colour mixer models human cone response with three discrete channels.',
    ask: 'Why was Newton’s second prism—which put the rainbow back together into white light—even more important than his first prism?',
  },
  12: {
    title: 'Charges and circuits',
    igcse: 'Topic 4.1–4.4 Electricity: charge (C), current I = Q/t (conventional + to − vs electron flow), e.m.f. and p.d. V = E/Q, resistance R = V/I, series and parallel rules, electrical power P = VI, fuses, circuit breakers (MCB/RCCB) and earthing.',
    myp: 'MYP Electrical Circuits: rope-loop charge conservation model vs potential-hill voltage model, ohmic wires vs non-ohmic LEDs, household safety.',
    cbse: 'NCERT Class 10 Ch 11 (Electricity): electric current I = Q/t, potential difference V = W/Q, Ohm’s law V = IR, series and parallel resistors, Joule heating H = I²Rt, electric power P = VI.',
    gcse: 'Charge flow Q = It, V = IR, I–V characteristics of resistor vs diode/LED, series & parallel rules, P = VI = I²R, mains live/neutral/earth safety.',
    simplify: 'Series/parallel circuit simulator uses an ideal 9.0 V battery with zero internal resistance.',
    ask: 'Does electric current get “used up” as it passes through a bulb, or does the exact same current return to the battery?',
  },
  13: {
    title: 'Magnets, motors and generators',
    igcse: 'Topic 4.1 Simple phenomena of magnetism & 4.5 Electromagnetic effects: ferromagnetic materials, magnetic field lines (N to S), field around a wire and solenoid, motor effect (force on a conductor),電磁 induction, AC generator and transformer (V_p/V_s = N_p/N_s).',
    myp: 'MYP Electromagnetism: Oersted’s compass deflection, Ampere’s coil, Lorentz motor torque and commutator, Faraday’s changing-flux induction and grid transformers.',
    cbse: 'NCERT Class 10 Ch 12 (Magnetic Effects of Electric Current): field lines, right-hand thumb rule, solenoid, force on current-carrying conductor, electromagnetic induction.',
    gcse: 'Permanent and induced magnets, Earth’s magnetic field, Fleming’s left-hand rule & electric motors, generator effect (induction) and step-up/step-down transformers.',
    simplify: 'Induction simulator computes dipole axial flux analytically along the coil centreline.',
    ask: 'If you hold the strongest magnet in the world completely still inside a coil of wire, how much voltage does it generate?',
  },
  14: {
    title: 'Earth, Moon and Sun',
    igcse: 'Topic 6.1 The Earth and the Solar System: 24 h rotation on tilted axis (23.4°), 365-day orbit and seasonal solar altitude/day-length cycle, ~1-month lunar phase cycle.',
    myp: 'MYP Cycles in the Sky: geometric 3D reasoning for day/night, solstice noon altitude at Mumbai (19.08° N), lunar phases vs eclipses (5.1° orbital tilt), differential gravity and two tidal bulges.',
    cbse: 'NCERT Class 8/11 Solar System & Gravitation: rotation and revolution, axial tilt and seasons, phases of the Moon, solar and lunar eclipses, ocean tides.',
    gcse: 'Solar system geometry, axial tilt and solar flux density per square metre, lunar phases and orbital mechanics.',
    simplify: '3D Moon phases widget offers both a drawn-close pedagogical scale and the true 30-Earth-diameter scale.',
    ask: 'Why are there two high tides every lunar day (24 h 50 min) instead of just one on the side facing the Moon?',
  },
  15: {
    title: 'From atoms to the edge of space',
    igcse: 'Topic 5.1–5.2 Nuclear physics & 6.2 Stars and the Universe: alpha, beta, gamma radiation, half-life, irradiation vs contamination, nuclear fusion in the Sun, light-years, redshift and Hubble’s law v = H₀d supporting the Big Bang.',
    myp: 'MYP Modern Physics & Cosmology: photoelectric photons (E = hf), radioactivity & statistical half-life, E = mc² in fission and solar fusion, cosmic distance ladder (parallax & Cepheids), stellar remnants and expanding space.',
    cbse: 'NCERT Class 12 Atoms, Nuclei & Dual Nature: photoelectric effect E = hν, alpha-scattering, mass defect and nuclear binding energy ΔE = Δmc², fusion in stars.',
    gcse: 'Atomic structure, α/β/γ ionising radiation and half-life, irradiation vs contamination, life cycle of stars, cosmological redshift and the Big Bang.',
    simplify: '1D expanding ruler illustrates uniform metric stretching while keeping bound objects (paper-clip galaxies) fixed in size.',
    ask: 'If every galaxy sees every other galaxy rushing away from it in proportion to distance, does that mean we are at the centre of the universe?',
  },
};

function playTick() {
  if (typeof window !== 'undefined' && window.__bookSound) window.__bookSound.play('tick');
}

function getBoardNoteForBox(box, chNum, board) {
  if (board === 'all') return null;
  const chInfo = CH_SYLLABUS[chNum] || CH_SYLLABUS[0];
  const txt = (box.textContent || '').toLowerCase();

  if (board === 'myp') {
    if (txt.includes('9.8')) {
      return 'IB MYP tip: MYP accepts g = 9.8 m/s² (or 9.8 N/kg) and often allows g ≈ 10 m/s² in mental estimation tasks — always state which value you used and include units.';
    }
    if (txt.includes('store') || txt.includes('sankey') || txt.includes('lost')) {
      return 'IB MYP tip: Frame energy answers around the Key Concept of Systems and Conservation: name the system boundary, the initial and final stores, and the transfer pathway.';
    }
    return `IB MYP connection: ${chInfo.myp}`;
  }
  if (board === 'cbse') {
    if (txt.includes('9.8')) {
      return 'CBSE / NCERT wording: NCERT Class 9 Ch 9 uses g = 9.8 m/s², and explicitly tells you in the question when to take g = 10 m/s² to simplify arithmetic.';
    }
    if (txt.includes('resultant') || txt.includes('net force')) {
      return 'CBSE / NCERT wording: NCERT Class 9 Ch 8 calls this an “unbalanced force” (as opposed to balanced forces whose net effect is zero).';
    }
    if (txt.includes('upthrust') || txt.includes('buoyant') || txt.includes('suction')) {
      return 'CBSE / NCERT wording: NCERT Class 9 uses both “buoyant force” and “upthrust” interchangeably, and defines pressure as “thrust per unit area”.';
    }
    if (txt.includes('store') || txt.includes('lost') || txt.includes('sankey')) {
      return 'CBSE / NCERT wording: NCERT Class 9 Ch 10 speaks of “forms of energy” (kinetic, potential, heat, light, sound, chemical, electrical) rather than “stores and pathways” — use the translator table in Section 7.1 to map between them.';
    }
    return `CBSE / NCERT connection: ${chInfo.cbse}`;
  }
  if (board === 'gcse') {
    if (txt.includes('store') || txt.includes('lost') || txt.includes('sankey')) {
      return 'English GCSE (AQA / OCR / Edexcel) wording: Uses the exact 8 Energy Stores (kinetic, gravitational potential, elastic potential, thermal, chemical, nuclear, magnetic, electrostatic) and 4 Pathways (mechanical work, electrical work, heating, radiation). Say “dissipated to the thermal store of the surroundings”, never “lost”.';
    }
    if (txt.includes('upthrust') || txt.includes('buoyant')) {
      return 'English GCSE wording: Uses “upthrust” for the upward resultant force exerted by a fluid on a submerged object (equal to the weight of fluid displaced).';
    }
    return `English GCSE connection: ${chInfo.gcse}`;
  }
  if (board === 'igcse') {
    return `Cambridge IGCSE 0625 syllabus focus: ${chInfo.igcse}`;
  }
  return null;
}

const syncedBoxes = [];

function setupSchoolBox(box) {
  if (box.dataset.currReady) return;
  box.dataset.currReady = '1';
  const chEl = box.closest('article.chapter');
  const chNum = chEl ? parseInt(chEl.id.replace('ch', ''), 10) : 0;

  const bar = el('div', { class: 'curr-chips', role: 'group', 'aria-label': 'Filter syllabus wording by curriculum board' });
  const btns = BOARDS.map(([id, label]) => {
    const b = el('button', {
      type: 'button',
      class: 'curr-chip',
      'data-board': id,
      'aria-pressed': 'false',
    }, label);
    b.addEventListener('click', () => setGlobalBoard(id));
    bar.appendChild(b);
    return b;
  });

  const extra = el('p', { class: 'school-board-note', hidden: true });
  const bh = box.querySelector('.bh');
  if (bh) bh.after(bar); else box.prepend(bar);
  box.appendChild(extra);

  const sync = (board) => {
    btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.board === board)));
    const note = getBoardNoteForBox(box, chNum, board);
    if (note) {
      extra.textContent = note;
      extra.hidden = false;
      box.dataset.board = board;
    } else {
      extra.hidden = true;
      delete box.dataset.board;
    }
  };
  syncedBoxes.push(sync);
  sync(store.get('curriculum', 'all'));
}

function setGlobalBoard(board) {
  playTick();
  store.set('curriculum', board);
  syncedBoxes.forEach(fn => fn(board));
  App.emit('curriculum:change', board);
}

function buildModelsAndTeachersSection() {
  const modelsSec = document.getElementById('models');
  if (!modelsSec || modelsSec.querySelector('.values-registry')) return;

  // 1. Verbatim Numbers & Simulation Values Registry (sources.html style)
  const cats = [
    ['all', 'All numbers (' + VALUES_LIST.length + ')'],
    ['constants', 'Fundamental constants'],
    ['energy', 'Energy & power'],
    ['mumbai', 'Mumbai & India'],
    ['matter', 'Matter, fluids & waves'],
    ['sky', 'Sky & cosmos'],
  ];
  let curCat = 'all';

  const catBar = el('div', { class: 'curr-chips val-chips', role: 'group', 'aria-label': 'Filter numbers by topic' });
  const catBtns = cats.map(([id, label]) => {
    const b = el('button', {
      type: 'button',
      class: 'curr-chip',
      'data-cat': id,
      'aria-pressed': String(id === curCat),
    }, label);
    b.addEventListener('click', () => {
      playTick();
      curCat = id;
      catBtns.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.cat === curCat)));
      renderCards();
    });
    catBar.appendChild(b);
    return b;
  });

  const listWrap = el('div', { class: 'val-grid' });

  function renderCards() {
    listWrap.replaceChildren();
    const filtered = curCat === 'all' ? VALUES_LIST : VALUES_LIST.filter(v => v.cat === curCat);
    filtered.forEach(v => {
      const card = el('article', { class: 'val-card', id: 'val-' + v.key },
        el('div', { class: 'val-head' },
          el('code', { class: 'val-key' }, `{v:${v.key}}`),
          el('a', { class: 'val-where', href: v.where }, v.whereLabel),
        ),
        el('h4', { class: 'val-name' }, v.name),
        el('p', { class: 'val-num' }, v.val),
        v.derived ? el('p', { class: 'val-deriv' },
          el('b', {}, 'How it is computed: '),
          el('span', {}, `${v.derived.formula} — ${v.derived.how}`),
        ) : null,
        el('blockquote', { class: 'val-quote' }, v.quote),
        el('p', { class: 'val-src' },
          'Primary source: ',
          v.url ? el('a', { href: v.url, target: '_blank', rel: 'noopener' }, v.source) : v.source,
        ),
      );
      listWrap.appendChild(card);
    });
  }
  renderCards();

  const regSec = el('div', { class: 'values-registry', id: 'values-registry' },
    el('h3', {}, 'The numbers in the simulations: exact values, derivations and verbatim quotes'),
    el('p', {}, 'Every physical constant and real-world number used in the prose and live simulations comes from a primary source or standard reference and is stored in the book’s value registry. Filter by topic below to inspect the exact number, how the simulation uses it, and the verbatim quote from the source document.'),
    catBar,
    listWrap,
  );
  modelsSec.appendChild(regSec);

  // 2. Switchable Curriculum & Teachers' Guide (teachers.html style)
  const guideBar = el('div', { class: 'curr-chips guide-chips', role: 'group', 'aria-label': 'Choose curriculum board' });
  const guideBtns = BOARDS.map(([id, label]) => {
    const b = el('button', {
      type: 'button',
      class: 'curr-chip',
      'data-board': id,
      'aria-pressed': 'false',
    }, label);
    b.addEventListener('click', () => setGlobalBoard(id));
    guideBar.appendChild(b);
    return b;
  });

  const projBtn = el('button', {
    type: 'button',
    class: 'curr-chip proj-btn',
    'aria-pressed': String(document.documentElement.hasAttribute('data-projector')),
  }, 'Projector mode (classroom high-contrast)');
  projBtn.addEventListener('click', () => {
    playTick();
    const s = store.get('settings', {});
    s.projector = !s.projector;
    store.set('settings', s);
    if (s.projector) document.documentElement.setAttribute('data-projector', '1');
    else document.documentElement.removeAttribute('data-projector');
    projBtn.setAttribute('aria-pressed', String(!!s.projector));
  });
  guideBar.appendChild(projBtn);

  const chTable = el('div', { class: 'curr-guide-list' });

  function renderGuide(board) {
    guideBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.board === board)));
    chTable.replaceChildren();
    Object.entries(CH_SYLLABUS).forEach(([chN, info]) => {
      const rows = [];
      if (board === 'all' || board === 'igcse') rows.push(['Cambridge IGCSE 0625', info.igcse]);
      if (board === 'all' || board === 'myp') rows.push(['IB MYP Sciences', info.myp]);
      if (board === 'all' || board === 'cbse') rows.push(['CBSE / NCERT', info.cbse]);
      if (board === 'all' || board === 'gcse') rows.push(['English GCSE (AQA/OCR/Edexcel)', info.gcse]);

      const card = el('div', { class: 'curr-ch-card' },
        el('div', { class: 'curr-ch-top' },
          el('a', { class: 'curr-ch-link', href: `#ch${chN}` }, `Chapter ${chN}: ${info.title}`),
        ),
        el('dl', { class: 'curr-dl' },
          ...rows.flatMap(([bName, text]) => [
            el('dt', {}, bName),
            el('dd', {}, text),
          ]),
          el('dt', { class: 'curr-meta' }, 'What the model simplifies'),
          el('dd', { class: 'curr-meta' }, info.simplify),
          el('dt', { class: 'curr-meta' }, 'Oral question to ask'),
          el('dd', { class: 'curr-meta' }, `“${info.ask}”`),
        ),
      );
      chTable.appendChild(card);
    });
  }

  syncedBoxes.push(renderGuide);
  renderGuide(store.get('curriculum', 'all'));

  const guideSec = el('div', { class: 'teachers-guide', id: 'teachers-guide' },
    el('h3', {}, 'Curriculum & Teachers’ Guide: switchable board wording'),
    el('p', {}, 'Choose a syllabus below (or on any “At school” box in the chapters) to filter the learning objectives, exact wording differences (such as g = 9.8 m/s² vs 9.8 N/kg vs 10 m/s², or stores and pathways vs forms of energy), model simplifications, and oral discussion questions.'),
    guideBar,
    chTable,
  );
  modelsSec.appendChild(guideSec);
}

App.ready(() => {
  document.querySelectorAll('.box.school').forEach(setupSchoolBox);
  App.on('story:open', d => { if (d && d.el) d.el.querySelectorAll('.box.school').forEach(setupSchoolBox); });
  buildModelsAndTeachersSection();
});
