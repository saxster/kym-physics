// Powers of Ten explorer: smooth logarithmic zoom from a proton (10^-15 m) to the Milky Way (10^21 m).
import App from './core.js';

const { el } = App;

const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
function fmtSup(n) {
  return String(n).split('').map(c => SUP[c] || c).join('');
}
function fmtPow10(exp) {
  const r = Math.round(exp * 10) / 10;
  const s = Number.isInteger(r) ? String(r) : r.toFixed(1);
  return '10' + fmtSup(s) + ' m';
}

const RUNGS = [
  {
    exp: -15,
    name: 'Proton',
    label: 'Proton 10⁻¹⁵ m',
    sizeText: '1 femtometre (0.000 000 000 000 001 m)',
    kind: 'proton',
    story: 'A single proton (the nucleus of a hydrogen atom) is about 10⁻¹⁵ m across. Rutherford discovered in 1911 that almost all of an atom’s mass sits in this tiny core.',
    chapter: 'Chapters 0.3 & 15.2',
  },
  {
    exp: -10,
    name: 'Hydrogen atom',
    label: 'Hydrogen atom 10⁻¹⁰ m',
    sizeText: '0.1 nanometres (100,000 protons wide)',
    kind: 'atom',
    story: 'Five steps of ×10 wider than a proton. If the proton at the centre were a 1 cm marble on your floor, the electron cloud would reach half a kilometre away in every direction.',
    chapter: 'Chapters 0.3 & 15.2',
  },
  {
    exp: -6,
    name: 'Visible light wave',
    label: 'Visible light wave 10⁻⁶ m',
    sizeText: 'About 0.5 micrometres (500 nm)',
    kind: 'wave',
    story: 'A single wavelength of green-red sunlight is just under one micrometre, about 10,000 atoms wide. Soap-bubble films of this thickness glow with interference colours.',
    chapter: 'Chapters 0.3 & 11.5',
  },
  {
    exp: -3,
    name: 'Grain of sand',
    label: 'Grain of sand 10⁻³ m',
    sizeText: '1 millimetre (0.001 m)',
    kind: 'sand',
    story: 'A coarse grain of Juhu beach sand or a mustard seed sits at 1 millimetre: three steps of ÷10 smaller than you, and a thousand times wider than a light wave.',
    chapter: 'Chapter 0.3',
  },
  {
    exp: 0,
    name: 'You (Kym)',
    label: 'You (Kym) 10⁰ m',
    sizeText: '1 metre (human scale)',
    kind: 'human',
    story: 'Any number to the zeroth power is 1, so 10⁰ m is 1 metre: roughly the height of your desk or a long stride. This is our home rung on the ladder.',
    chapter: 'Chapter 0.3',
  },
  {
    exp: 7,
    name: 'Earth',
    label: 'Earth 10⁷ m',
    sizeText: '12,742 km diameter (~10⁷ m)',
    kind: 'earth',
    story: 'Seven steps of ×10 up from you. Eratosthenes measured Earth’s circumference with two sticks and a shadow in Alexandria and Syene.',
    chapter: 'Chapters 0.1, 0.3 & 5.1',
  },
  {
    exp: 9,
    name: 'Sun',
    label: 'Sun 10⁹ m',
    sizeText: '1.39 million km diameter (~10⁹ m)',
    kind: 'sun',
    story: 'Two steps of ×10 wider than Earth (about 109 Earth diameters across). Its hot plasma core fuses 600 million tonnes of hydrogen every second.',
    chapter: 'Chapters 0.3 & 15.3',
  },
  {
    exp: 11,
    name: 'Earth–Sun',
    label: 'Earth–Sun 10¹¹ m',
    sizeText: '149.6 million km (1 AU, ~1.5 × 10¹¹ m)',
    kind: 'orbit',
    story: 'Two more steps of ×10 take us from the Sun’s width to the width of Earth’s orbit around it. Light takes about 8 minutes and 20 seconds to cross this radius.',
    chapter: 'Chapters 0.3, 5.3 & 14.2',
  },
  {
    exp: 16,
    name: 'One light-year',
    label: 'One light-year 10¹⁶ m',
    sizeText: '9.46 × 10¹⁵ m (~10¹⁶ m)',
    kind: 'lightyear',
    story: 'The distance light travels in one Julian year. The nearest star beyond the Sun, Proxima Centauri, sits at 4.25 light-years (about 4 × 10¹⁶ m).',
    chapter: 'Chapters 0.3 & 15.5',
  },
  {
    exp: 21,
    name: 'Milky Way',
    label: 'Milky Way 10²¹ m',
    sizeText: 'About 100,000 light-years (~10²¹ m)',
    kind: 'galaxy',
    story: 'Five steps of ×10 wider than a single light-year: our home galaxy of over a hundred billion stars, turning slowly in a flat spiral disc.',
    chapter: 'Chapters 0.3 & 15.7',
  },
];

const TOUR_STEPS = [
  {
    q: '1. What is it?',
    exp: 0,
    pair: null,
    syncText: 'Synced to 10⁰ m (1 metre, Kym’s human scale)',
    body: [
      'The Powers of Ten explorer is a zoom lens for the whole universe, running from a single proton (10⁻¹⁵ m) to the Milky Way galaxy (10²¹ m) in 36 steps of ×10.',
      'We start at 10⁰ m (1 metre): the scale of your own body and room. Every step to the right multiplies the width of the view by 10; every step to the left divides it by 10.',
    ],
  },
  {
    q: '2. Why is it called Powers of Ten?',
    exp: 7,
    pair: [-3, 7],
    syncText: 'Synced to 10⁻³ m → 10⁷ m (Grain of sand to Earth)',
    body: [
      'Because each rung counts how many times you multiply or divide 1 metre by 10. Writing 10⁷ m is short for 1 × 10 × 10 × 10 × 10 × 10 × 10 × 10 m = 10,000,000 m.',
      'In Chapter 0.3 you count the steps from yourself (10⁰ m) up to Earth (10⁷ m): that is 7 steps of ×10. Going from a grain of sand (10⁻³ m) to Earth (10⁷ m) is 7 − (−3) = 10 steps of ×10, or ten billion times wider.',
    ],
  },
  {
    q: '3. What problem did it solve?',
    exp: -10,
    pair: [-15, -10],
    syncText: 'Synced to 10⁻¹⁵ m → 10⁻¹⁰ m (Proton to Hydrogen atom)',
    body: [
      'An ordinary ruler adds equal lengths: 1 m, 2 m, 3 m. If you tried to draw a hydrogen atom (10⁻¹⁰ m) and its proton nucleus (10⁻¹⁵ m) on the same ordinary diagram, the proton would be 100,000 times smaller than the atom, narrower than a single screen pixel.',
      'And if you drew Earth’s orbit on a page where 1 metre was 1 millimetre wide, the paper would have to be 150,000 kilometres across. Ordinary scales squash everything small onto zero and push everything large off the page.',
    ],
  },
  {
    q: '4. Why is it shaped as a logarithmic ladder?',
    exp: 11,
    pair: [9, 11],
    syncText: 'Synced to 10⁹ m → 10¹¹ m (Sun to Earth–Sun distance)',
    body: [
      'On a logarithmic ladder, equal distances along the bar stand for equal multiplications (×10), not equal additions (+1). Going from the Sun’s diameter (10⁹ m) to the Earth–Sun distance (10¹¹ m) is just 2 steps of ×10 (100 times wider).',
      'Notice what never appears on the bottom axis: there is no 0! Dividing by 10 gives 10⁻¹, 10⁻², 10⁻³ and so on forever, getting smaller and smaller without ever reaching zero.',
    ],
  },
  {
    q: '5. How does it help?',
    exp: 21,
    pair: [16, 21],
    syncText: 'Synced to 10¹⁶ m → 10²¹ m (One light-year to the Milky Way)',
    body: [
      'When sizes are written as powers of ten, comparing any two things in nature turns multiplication into simple subtraction of exponents.',
      'From one light-year (10¹⁶ m) to the Milky Way (10²¹ m) is 21 − 16 = 5 steps of ×10, so the galaxy is 10⁵ = 100,000 light-years across. From a proton (10⁻¹⁵ m) to the Milky Way (10²¹ m) is 21 − (−15) = 36 steps of ×10.',
    ],
  },
];

function humanMetres(exp) {
  const val = Math.pow(10, exp);
  if (exp <= -13) return `${(val * 1e15).toPrecision(2)} fm`;
  if (exp <= -8) return `${(val * 1e9).toPrecision(2)} nm`;
  if (exp <= -4) return `${(val * 1e6).toPrecision(2)} μm`;
  if (exp < 0) return `${(val * 1e3).toPrecision(2)} mm`;
  if (exp < 3) return `${val.toPrecision(2)} m`;
  if (exp < 9) return `${(val / 1e3).toLocaleString('en-GB', { maximumFractionDigits: 0 })} km`;
  if (exp < 15) return `${(val / 1e9).toPrecision(2)} million km`;
  return `${(val / 9.4607e15).toPrecision(2)} light-years`;
}

function nearestRungs(exp) {
  let prev = RUNGS[0], next = RUNGS[RUNGS.length - 1], exact = null;
  for (let i = 0; i < RUNGS.length; i++) {
    const r = RUNGS[i];
    if (Math.abs(r.exp - exp) < 0.08) exact = r;
    if (r.exp <= exp + 0.05) prev = r;
    if (r.exp >= exp - 0.05) { next = r; break; }
  }
  if (exact) {
    const idx = RUNGS.indexOf(exact);
    prev = idx > 0 ? RUNGS[idx - 1] : exact;
    next = idx < RUNGS.length - 1 ? RUNGS[idx + 1] : exact;
  }
  return { exact, prev, next };
}

function drawRungIcon(ctx, kind, cx, cy, r, col) {
  if (r < 1.5 || r > 4000) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (kind === 'proton') {
    ctx.fillStyle = col.protonWash;
    ctx.strokeStyle = col.proton;
    ctx.lineWidth = Math.max(1.2, Math.min(3, r * 0.06));
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (r > 12) {
      const qr = r * 0.22;
      const pts = [[0, -r * 0.42], [-r * 0.38, r * 0.28], [r * 0.38, r * 0.28]];
      pts.forEach(([qx, qy], i) => {
        ctx.beginPath();
        ctx.fillStyle = i < 2 ? col.proton : col.electron;
        ctx.arc(qx, qy, qr, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  } else if (kind === 'atom') {
    const grad = ctx.createRadialGradient(0, 0, r * 0.05, 0, 0, r);
    grad.addColorStop(0, col.electronWash);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = col.electron;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = col.proton;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2.5, r * 0.04), 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'wave') {
    ctx.strokeStyle = col.neutron;
    ctx.lineWidth = Math.max(1.6, Math.min(3.2, r * 0.08));
    ctx.beginPath();
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 - 1;
      const x = t * r;
      const y = Math.sin(t * Math.PI * 2) * r * 0.38;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else if (kind === 'sand') {
    ctx.fillStyle = col.neutronWash;
    ctx.strokeStyle = col.neutron;
    ctx.lineWidth = Math.max(1.2, Math.min(2.4, r * 0.05));
    ctx.beginPath();
    const angles = [0.1, 1.1, 2.0, 2.9, 3.8, 4.9, 5.7];
    const rads = [0.92, 0.85, 0.96, 0.82, 0.9, 0.88, 0.95];
    angles.forEach((a, i) => {
      const px = Math.cos(a) * r * rads[i];
      const py = Math.sin(a) * r * rads[i];
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'human') {
    ctx.strokeStyle = col.ink;
    ctx.fillStyle = col.ink;
    const lw = Math.max(1.5, Math.min(3.5, r * 0.07));
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    const headR = r * 0.16;
    ctx.beginPath();
    ctx.arc(0, -r * 0.62, headR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.46);
    ctx.lineTo(0, r * 0.18);
    ctx.moveTo(-r * 0.38, -r * 0.18);
    ctx.lineTo(r * 0.38, -r * 0.18);
    ctx.moveTo(0, r * 0.18);
    ctx.lineTo(-r * 0.28, r * 0.82);
    ctx.moveTo(0, r * 0.18);
    ctx.lineTo(r * 0.28, r * 0.82);
    ctx.stroke();
  } else if (kind === 'earth') {
    ctx.fillStyle = col.electronWash;
    ctx.strokeStyle = col.electron;
    ctx.lineWidth = Math.max(1.4, Math.min(3, r * 0.05));
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (r > 10) {
      ctx.strokeStyle = col.green;
      ctx.lineWidth = Math.max(1, r * 0.03);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.98, r * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = col.proton;
      ctx.beginPath();
      ctx.arc(r * 0.22, -r * 0.28, Math.max(2, r * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'sun') {
    const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.15);
    grad.addColorStop(0, col.neutron);
    grad.addColorStop(0.75, col.neutronWash);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = col.neutron;
    ctx.lineWidth = Math.max(1.5, Math.min(3, r * 0.05));
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'orbit') {
    ctx.strokeStyle = col.electron;
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = col.neutron;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(3, r * 0.04), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = col.electron;
    ctx.beginPath();
    ctx.arc(r, 0, Math.max(2.5, r * 0.035), 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'lightyear') {
    ctx.strokeStyle = col.green;
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (r > 18) {
      const stars = [[0, 0], [r * 0.55, -r * 0.35], [-r * 0.62, r * 0.28], [r * 0.2, r * 0.68]];
      stars.forEach(([sx, sy], i) => {
        ctx.fillStyle = i === 0 ? col.neutron : col.ink;
        ctx.beginPath();
        ctx.arc(sx, sy, i === 0 ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  } else if (kind === 'galaxy') {
    ctx.strokeStyle = col.proton;
    ctx.lineWidth = Math.max(1.4, Math.min(3.2, r * 0.05));
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      for (let t = 0.15; t <= 1; t += 0.04) {
        const a = t * Math.PI * 2.2 + arm * Math.PI;
        const rad = t * r * 0.92;
        const x = Math.cos(a) * rad;
        const y = Math.sin(a) * rad * 0.68;
        if (t === 0.15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = col.neutron;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(3, r * 0.16), Math.max(2, r * 0.09), 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

App.explorer('scale', {
  mount(stage, { title, close }) {
    let exp = 0;
    let animId = 0;
    let tourStep = 0;
    let showTour = false;

    const canvas = el('canvas', { class: 'xp-canvas', width: 880, height: 460, 'aria-label': 'Powers of Ten logarithmic zoom visualiser' });
    const slider = el('input', {
      type: 'range',
      min: -15,
      max: 21,
      step: 0.05,
      value: 0,
      'aria-label': 'Power of ten scale exponent in metres',
    });
    const sliderOut = el('output', {}, '10⁰ m');

    const statScale = el('span', { class: 'xp-stat-v' });
    const statScaleSub = el('span', { class: 'xp-stat-sub' });
    const statFromYou = el('span', { class: 'xp-stat-v' });
    const statFromYouSub = el('span', { class: 'xp-stat-sub' });
    const statFromPrev = el('span', { class: 'xp-stat-v' });
    const statFromPrevSub = el('span', { class: 'xp-stat-sub' });

    const readoutBody = el('div', { class: 'xp-readout', 'aria-live': 'polite' });

    const rungBtns = RUNGS.map(r => {
      const b = el('button', {
        type: 'button',
        class: 'xp-rung',
        'data-exp': r.exp,
        'aria-pressed': r.exp === 0 ? 'true' : 'false',
        onclick: () => animateTo(r.exp),
      }, r.name + ' ', el('b', {}, fmtPow10(r.exp)));
      return b;
    });

    const btnMinus = el('button', {
      type: 'button',
      class: 'xp-btn',
      onclick: () => animateTo(Math.max(-15, Math.round(exp) - 1)),
    }, '−1 step (÷10)');

    const btnPlus = el('button', {
      type: 'button',
      class: 'xp-btn',
      onclick: () => animateTo(Math.min(21, Math.round(exp) + 1)),
    }, '+1 step (×10)');

    // Tour elements
    const tourBox = el('div', { class: 'xp-tour', hidden: true });
    const tourQ = el('h4', { class: 'xp-tour-q' });
    const tourA = el('div', { class: 'xp-tour-a' });
    const tourSyncText = el('span', {});
    const tourJumpBtn = el('button', { type: 'button', class: 'xp-btn' });
    const tourSyncBar = el('div', { class: 'xp-tour-sync' }, tourSyncText, tourJumpBtn);

    const stepPills = TOUR_STEPS.map((st, idx) =>
      el('button', {
        type: 'button',
        class: 'xp-step-pill',
        'aria-current': idx === 0 ? 'step' : 'false',
        onclick: () => setTourStep(idx),
      }, st.q)
    );

    const btnPrevStep = el('button', {
      type: 'button',
      class: 'xp-btn',
      onclick: () => setTourStep(Math.max(0, tourStep - 1)),
    }, '← Previous question');
    const btnNextStep = el('button', {
      type: 'button',
      class: 'xp-btn',
      onclick: () => setTourStep(Math.min(TOUR_STEPS.length - 1, tourStep + 1)),
    }, 'Next question →');

    tourBox.append(
      el('div', { class: 'xp-tour-head' },
        el('p', { class: 'xp-tour-kicker' }, 'Understand this scale · 5-question guided tour')),
      el('div', { class: 'xp-tour-steps', role: 'tablist', 'aria-label': 'Five questions about Powers of Ten' }, stepPills),
      tourQ,
      tourA,
      tourSyncBar,
      el('div', { class: 'xp-tour-nav' }, btnPrevStep, btnNextStep)
    );

    const tabExplore = el('button', {
      type: 'button',
      class: 'xp-tab',
      'aria-pressed': 'true',
      onclick: () => toggleMode(false),
    }, 'Interactive zoom ladder');

    const tabTour = el('button', {
      type: 'button',
      class: 'xp-tab',
      'aria-pressed': 'false',
      onclick: () => toggleMode(true),
    }, 'Understand this scale (5 questions)');

    function toggleMode(tourOn) {
      showTour = tourOn;
      tabExplore.setAttribute('aria-pressed', String(!tourOn));
      tabTour.setAttribute('aria-pressed', String(tourOn));
      tourBox.hidden = !tourOn;
      if (tourOn) setTourStep(tourStep);
    }

    function setTourStep(idx) {
      tourStep = idx;
      const st = TOUR_STEPS[idx];
      stepPills.forEach((p, i) => p.setAttribute('aria-current', i === idx ? 'step' : 'false'));
      tourQ.textContent = st.q;
      tourA.replaceChildren(...st.body.map(para => el('p', {}, para)));
      tourSyncText.textContent = st.syncText;
      if (st.pair) {
        const [a, b] = st.pair;
        tourJumpBtn.hidden = false;
        tourJumpBtn.textContent = `Sweep ${fmtPow10(a)} ↔ ${fmtPow10(b)}`;
        tourJumpBtn.onclick = () => {
          const target = Math.abs(exp - a) < 1 ? b : a;
          animateTo(target, 950);
        };
        animateTo(a, 500);
      } else {
        tourJumpBtn.hidden = false;
        tourJumpBtn.textContent = `Reset to ${fmtPow10(st.exp)}`;
        tourJumpBtn.onclick = () => animateTo(st.exp, 500);
        animateTo(st.exp, 500);
      }
      btnPrevStep.disabled = idx === 0;
      btnNextStep.disabled = idx === TOUR_STEPS.length - 1;
    }

    function stopAnim() {
      if (animId) { cancelAnimationFrame(animId); animId = 0; }
    }

    function animateTo(targetExp, duration = 480) {
      stopAnim();
      targetExp = Math.max(-15, Math.min(21, targetExp));
      if (App.reduceMotion() || Math.abs(targetExp - exp) < 0.02) {
        setExp(targetExp);
        return;
      }
      const startExp = exp;
      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / duration);
        const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        setExp(startExp + (targetExp - startExp) * ease);
        if (p < 1) animId = requestAnimationFrame(tick);
        else animId = 0;
      };
      animId = requestAnimationFrame(tick);
    }

    slider.addEventListener('input', () => {
      stopAnim();
      setExp(parseFloat(slider.value));
    });

    function readPalette() {
      const cs = getComputedStyle(stage);
      const g = k => cs.getPropertyValue(k).trim();
      return {
        ink: g('--ink') || '#1d332d',
        ink2: g('--ink-2') || '#33483f',
        muted: g('--muted') || '#5d6c66',
        plate: g('--plate') || '#fdfcf8',
        sheet: g('--sheet') || '#fbfaf5',
        rule: g('--rule') || '#d5d3c6',
        proton: g('--proton') || '#a94730',
        neutron: g('--neutron') || '#936022',
        electron: g('--electron') || '#356d83',
        green: g('--green') || '#2e604a',
        vol: g('--vol') || '#356d83',
        protonWash: 'rgba(169, 71, 48, 0.14)',
        neutronWash: 'rgba(147, 96, 34, 0.15)',
        electronWash: 'rgba(53, 109, 131, 0.15)',
      };
    }

    function drawCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 880;
      const cssH = Math.max(320, Math.min(460, Math.round(cssW * 0.54)));
      if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
      }
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);

      const W = cssW, H = cssH;
      const barH = 54;
      const viewH = H - barH;
      const cx = W * 0.5, cy = viewH * 0.5;
      const baseR = Math.min(W, viewH) * 0.27;
      const col = readPalette();

      ctx.fillStyle = col.plate;
      ctx.fillRect(0, 0, W, H);

      // Draw nested powers-of-ten rings at true 10^(k - exp) scale
      const minK = Math.floor(exp) - 2;
      const maxK = Math.ceil(exp) + 2;
      for (let k = minK; k <= maxK; k++) {
        if (k < -16 || k > 22) continue;
        const r = baseR * Math.pow(10, k - exp);
        if (r < 2 || r > Math.max(W, H) * 1.6) continue;
        const dist = Math.abs(k - exp);
        const alpha = Math.max(0.12, Math.min(0.85, 1 - dist * 0.38));
        ctx.save();
        ctx.strokeStyle = k === Math.round(exp) ? col.vol : col.muted;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = k === Math.round(exp) ? 1.8 : 1;
        ctx.setLineDash(k === Math.round(exp) ? [] : [4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        if (r > 24 && r < Math.min(W, viewH) * 0.47) {
          ctx.setLineDash([]);
          ctx.font = `600 11px "Lexend", system-ui, sans-serif`;
          ctx.fillStyle = k === Math.round(exp) ? col.vol : col.muted;
          ctx.textAlign = 'center';
          ctx.fillText(fmtPow10(k), cx, cy - r - 5);
        }
        ctx.restore();
      }

      // Draw rung objects at true relative radius: r = baseR * 10^(rung.exp - exp)
      for (const rung of RUNGS) {
        const diff = rung.exp - exp;
        if (diff < -2.2 || diff > 2.2) continue;
        const r = baseR * Math.pow(10, diff);
        const fade = Math.max(0, Math.min(1, 1 - Math.abs(diff) / 2.1));
        ctx.save();
        ctx.globalAlpha = fade;
        drawRungIcon(ctx, rung.kind, cx, cy, r, col);
        if (r >= 14 && r <= Math.min(W, viewH) * 0.45) {
          ctx.font = `700 12px "Lexend", system-ui, sans-serif`;
          ctx.fillStyle = col.ink;
          ctx.textAlign = 'center';
          const ly = Math.min(viewH - 12, cy + r + 15);
          ctx.fillText(`${rung.name} (${fmtPow10(rung.exp)})`, cx, ly);
        }
        ctx.restore();
      }

      // Crosshair and scale bar in top-left corner
      ctx.fillStyle = col.ink;
      ctx.font = `700 14px "Lexend", system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(` Ring width: ${fmtPow10(exp)} (${humanMetres(exp)})`, 14, 24);
      ctx.font = `400 11.5px "Lexend", system-ui, sans-serif`;
      ctx.fillStyle = col.muted;
      ctx.fillText('Every outer ring is ×10 wider than the ring just inside it', 16, 42);

      // Bottom logarithmic axis (-15 to +21, never showing 0!)
      const axY = viewH + 18;
      const padX = Math.max(24, W * 0.05);
      const axW = W - padX * 2;
      const xOf = e => padX + ((e - (-15)) / 36) * axW;

      ctx.fillStyle = col.sheet;
      ctx.fillRect(0, viewH, W, barH);
      ctx.strokeStyle = col.rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, viewH);
      ctx.lineTo(W, viewH);
      ctx.stroke();

      ctx.strokeStyle = col.ink2;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padX, axY);
      ctx.lineTo(padX + axW, axY);
      ctx.stroke();

      const majorStep = W < 500 ? 6 : 3;
      for (let e = -15; e <= 21; e++) {
        const tx = xOf(e);
        const isMajor = (e - (-15)) % majorStep === 0 || e === 0;
        ctx.strokeStyle = e === 0 ? col.vol : col.muted;
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(tx, axY - (isMajor ? 5 : 3));
        ctx.lineTo(tx, axY + (isMajor ? 5 : 3));
        ctx.stroke();
        if (isMajor) {
          ctx.font = e === 0 ? `700 10.5px "Lexend", system-ui, sans-serif` : `500 10px "Lexend", system-ui, sans-serif`;
          ctx.fillStyle = e === 0 ? col.vol : col.muted;
          ctx.textAlign = 'center';
          ctx.fillText('10' + fmtSup(e), tx, axY + 18);
        }
      }

      // Highlight preset rungs on axis
      for (const r of RUNGS) {
        const rx = xOf(r.exp);
        ctx.fillStyle = Math.abs(r.exp - exp) < 0.3 ? col.proton : col.electron;
        ctx.beginPath();
        ctx.arc(rx, axY, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Current marker on axis
      const curX = xOf(exp);
      ctx.fillStyle = col.proton;
      ctx.beginPath();
      ctx.moveTo(curX, axY - 10);
      ctx.lineTo(curX - 5, axY - 17);
      ctx.lineTo(curX + 5, axY - 17);
      ctx.closePath();
      ctx.fill();

      ctx.font = `400 10px "Lexend", system-ui, sans-serif`;
      ctx.fillStyle = col.muted;
      ctx.textAlign = 'right';
      ctx.fillText('Logarithmic scale in metres (no zero exists on a ×10 axis)', W - padX, H - 5);

      ctx.restore();
    }

    function setExp(val) {
      exp = Math.max(-15, Math.min(21, val));
      slider.value = exp;
      const powStr = fmtPow10(exp);
      sliderOut.textContent = powStr;

      rungBtns.forEach(b => {
        const re = parseFloat(b.dataset.exp);
        b.setAttribute('aria-pressed', String(Math.abs(re - exp) < 0.15));
      });

      const stepsFromYou = Math.round((exp - 0) * 10) / 10;
      const absSteps = Math.abs(stepsFromYou);
      const factorYou = Math.pow(10, absSteps);
      const factorStr = absSteps === 0
        ? '1× (your own 1 m scale)'
        : absSteps <= 6
          ? `${Math.round(factorYou).toLocaleString('en-GB')}× ${stepsFromYou > 0 ? 'wider' : 'smaller'}`
          : `10${fmtSup(absSteps)}× ${stepsFromYou > 0 ? 'wider' : 'smaller'}`;

      statScale.textContent = powStr;
      statScaleSub.textContent = humanMetres(exp);

      if (Math.abs(stepsFromYou) < 0.05) {
        statFromYou.textContent = '0 steps from you';
        statFromYouSub.textContent = 'At Kym’s 10⁰ m = 1 m home rung';
      } else if (stepsFromYou > 0) {
        statFromYou.textContent = `+${absSteps} step${absSteps === 1 ? '' : 's'} of ×10 up`;
        statFromYouSub.textContent = `${factorStr} than you (10⁰ m)`;
      } else {
        statFromYou.textContent = `−${absSteps} step${absSteps === 1 ? '' : 's'} of ÷10 down`;
        statFromYouSub.textContent = `${factorStr} than you (10⁰ m)`;
      }

      const { exact, prev, next } = nearestRungs(exp);
      const activeRung = exact || (Math.abs(exp - prev.exp) <= Math.abs( next.exp - exp) ? prev : next);
      const idx = RUNGS.indexOf(activeRung);
      const lowerRung = idx > 0 ? RUNGS[idx - 1] : RUNGS[0];
      const stepDiff = activeRung.exp - lowerRung.exp;

      if (idx === 0 && exp <= -14.8) {
        statFromPrev.textContent = 'Lowest rung (10⁻¹⁵ m)';
        statFromPrevSub.textContent = '5 steps of ×10 below Hydrogen atom (10⁻¹⁰ m)';
      } else {
        const d = Math.round((exp - lowerRung.exp) * 10) / 10;
        statFromPrev.textContent = `${d >= 0 ? '+' : ''}${d} steps from ${lowerRung.name}`;
        statFromPrevSub.textContent = `${lowerRung.name} (${fmtPow10(lowerRung.exp)}) → ${activeRung.name} (${fmtPow10(activeRung.exp)}): ${stepDiff} steps of ×10`;
      }

      readoutBody.replaceChildren(
        el('p', {},
          el('b', {}, `${activeRung.name} (${fmtPow10(activeRung.exp)}, ${activeRung.sizeText}) · ${activeRung.chapter}. `),
          activeRung.story
        ),
        el('p', {},
          `Counting from you (10⁰ m = 1 m): ${powStr} is `,
          el('b', {}, Math.abs(stepsFromYou) < 0.05
            ? '0 steps away (you are at 1 metre)'
            : `${absSteps} step${absSteps === 1 ? '' : 's'} of ${stepsFromYou > 0 ? '×10 up' : '÷10 down'}`),
          `. Notice the bottom scale runs …, 10⁻¹, 10⁰, 10¹, … and never shows 0, because dividing by 10 never reaches zero.`
        ),
        el('p', { class: 'xp-honest' },
          'Model note: Every ring and object on the canvas is drawn at its true power-of-ten ratio. When you click a rung button, the zoom motion is slowed to half a second so your eye can follow the jump; the relative sizes are never distorted.'
        )
      );

      drawCanvas();
    }

    // Allow clicking along the bottom axis of the canvas to jump directly to a power of ten
    canvas.addEventListener('pointerdown', e => {
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      if (y > rect.height - 60) {
        const padX = Math.max(24, rect.width * 0.05);
        const axW = rect.width - padX * 2;
        const frac = (e.clientX - rect.left - padX) / axW;
        const target = Math.round((-15 + Math.max(0, Math.min(1, frac)) * 36) * 2) / 2;
        animateTo(target, 320);
      }
    });

    const wrap = el('div', { class: 'xp-wrap' },
      el('div', { class: 'xp-top' },
        el('div', { class: 'xp-title-group' },
          el('p', { class: 'xp-kicker' }, 'Explorer · Chapter 0.3'),
          el('h3', { class: 'xp-heading' }, 'Powers of Ten: from a proton (10⁻¹⁵ m) to the Milky Way (10²¹ m)')
        ),
        el('button', { type: 'button', class: 'xp-btn xp-close', onclick: () => { stopAnim(); close(); } }, 'Close explorer')
      ),
      el('div', { class: 'xp-tabs', role: 'toolbar', 'aria-label': 'Explorer mode' }, tabExplore, tabTour),
      el('div', { class: 'xp-rungs', role: 'group', 'aria-label': 'Scale rungs from proton to Milky Way' }, rungBtns),
      el('div', { class: 'xp-canvas-wrap' }, canvas),
      el('div', { class: 'xp-controls' },
        el('div', { class: 'xp-slider' },
          el('label', {}, 'Logarithmic scale'),
          slider,
          sliderOut
        ),
        el('div', { class: 'xp-btn-group' }, btnMinus, btnPlus)
      ),
      el('div', { class: 'xp-stats' },
        el('div', { class: 'xp-stat' }, el('span', { class: 'xp-stat-k' }, 'Current view width'), statScale, statScaleSub),
        el('div', { class: 'xp-stat' }, el('span', { class: 'xp-stat-k' }, '×10 steps from Kym (10⁰ m)'), statFromYou, statFromYouSub),
        el('div', { class: 'xp-stat' }, el('span', { class: 'xp-stat-k' }, 'Step from previous rung'), statFromPrev, statFromPrevSub)
      ),
      readoutBody,
      tourBox
    );

    stage.replaceChildren(wrap);
    setExp(0);

    let rTimer;
    const onResize = () => { clearTimeout(rTimer); rTimer = setTimeout(drawCanvas, 80); };
    window.addEventListener('resize', onResize);
  },
});
