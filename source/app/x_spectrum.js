// The Ladder of Light explorer: from 50 Hz mains to gamma rays (c = f * lambda, E = h * f).
import App from './core.js';

const { el } = App;

const C_LIGHT = 299792458;        // m/s exact in vacuum
const H_PLANCK_EV = 4.135667696e-15; // eV * s
const CA_WORK_EV = 2.71;          // Calcium binding energy (OpenStax College Physics 2e Example 29.1)
const IONISE_EV = 10.0;           // Typical atomic/molecular ionisation threshold (~10 eV, CP 29.3)

const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
function fmtSup(n) {
  return String(n).split('').map(c => SUP[c] || c).join('');
}

// Slider parameter is log10(frequency in Hz), running from 1.7 (50 Hz) to 20.5 (~3e20 Hz gamma rays)
const LOGF_MIN = 1.7;
const LOGF_MAX = 20.5;

const RUNGS = [
  {
    id: 'mains',
    name: '50 Hz Indian mains',
    short: '50 Hz mains (6,000 km)',
    logF: Math.log10(50), // 1.699
    band: 'Extremely Low Frequency AC',
    source: 'Alternating current generators at power stations (50 cycles per second across India)',
    detector: 'Oscilloscope or pickup coil near a mains cable',
    story: 'At 50 Hz, a single wavelength stretches 5,996 km (wider than India from Kashmir to Kanyakumari). Each quantum carries only 2.1 × 10⁻¹³ eV.',
    chapter: 'Chapters 12.6 & 13.6',
  },
  {
    id: 'gmrt',
    name: 'GMRT radio telescope (Pune)',
    short: 'GMRT Pune (150 MHz–1.4 GHz)',
    logF: Math.log10(300e6), // 8.477 (lambda ~ 1 m)
    band: 'Metrewave & centimetre radio',
    source: 'Neutral hydrogen gas in galaxies (21 cm / 1.42 GHz), pulsars, and supernova remnants',
    detector: '30 giant 45-metre wire-mesh dishes set up by Govind Swarup at Khodad near Pune',
    story: 'Metrewave radio waves (λ ≈ 2 m to 21 cm) pass right through clouds and cosmic dust, letting the Giant Metrewave Radio Telescope map hydrogen across the universe.',
    chapter: 'Chapter 13.6',
  },
  {
    id: 'wifi',
    name: 'FM radio & Wi-Fi',
    short: 'FM & Wi-Fi (100 MHz / 2.4 GHz)',
    logF: Math.log10(2.4e9), // 9.38 (lambda = 12.5 cm)
    band: 'VHF Radio / Microwaves',
    source: 'Electrons oscillating rapidly back and forth in a transmitter aerial or home router',
    detector: 'Radio aerial or phone Wi-Fi antenna',
    story: 'FM radio sits near 100 MHz (λ ≈ 3 m) and Wi-Fi near 2.4 GHz (λ = 12.5 cm). Single photons have ~10⁻⁵ eV, millions of times too weak to ionise atoms.',
    chapter: 'Chapter 13.6',
  },
  {
    id: 'bose',
    name: 'J. C. Bose’s 1895 mm waves',
    short: 'J. C. Bose 60 GHz (5 mm)',
    logF: Math.log10(60e9), // 10.778 (lambda = 5 mm)
    band: 'Millimetre microwaves',
    source: 'Spark transmitter with miniature waveguide horns and sulphur lenses',
    detector: 'Coherer receiver built by Jagadish Chandra Bose at Presidency College, Calcutta (1895)',
    story: 'In 1895 J. C. Bose generated 5 mm electromagnetic waves (60 GHz), ringing a bell and firing a pistol across Town Hall through walls and the Mayor’s body.',
    chapter: 'Chapter 13.6',
  },
  {
    id: 'thermal',
    name: 'Warm bodies & thermal IR',
    short: 'Thermal IR (10 μm)',
    logF: Math.log10(C_LIGHT / 10e-6), // 13.477 (30 THz)
    band: 'Thermal (Far/Mid) Infrared',
    source: 'Jiggling atoms and molecules in your own skin, a cup of chai, or the warm Arabian Sea',
    detector: 'Skin thermoreceptors and thermal-imaging bolometers',
    story: 'Everything at room or body temperature glows brightest near 10 micrometres (0.12 eV per photon). You are shining in infrared right now, even in a dark room.',
    chapter: 'Chapters 8 & 15.1',
  },
  {
    id: 'remote',
    name: 'TV remote LED (940 nm)',
    short: 'TV remote (940 nm, 1.32 eV)',
    logF: Math.log10(C_LIGHT / 940e-9), // 14.504 (319 THz)
    band: 'Near Infrared',
    source: 'Gallium arsenide light-emitting diode (LED) at the tip of a television remote control',
    detector: 'Silicon photodiode in the TV, or the camera sensor on your phone',
    story: 'Your eyes cannot see 940 nm light, but many phone cameras detect it as a purplish-white flash. At 1.32 eV per photon, even the brightest remote cannot knock an electron out of calcium (2.71 eV).',
    chapter: 'Chapters 13.6 & 15.1',
  },
  {
    id: 'visible',
    name: 'Visible rainbow (750–400 nm)',
    short: 'Visible (750–400 nm, 1.65–3.10 eV)',
    logF: Math.log10(C_LIGHT / 420e-9), // 14.854 (420 nm violet = 2.95 eV, beats Ca 2.71 eV!)
    band: 'Visible Light (Red 750 nm to Violet 400 nm)',
    source: 'Hot solar photosphere (5,800 K), LEDs, and electronic transitions in atoms',
    detector: 'Red, green, and blue cone cells in your retina; prisms and diffraction gratings',
    story: 'A tiny octave of the spectrum (1.65 eV red to 3.10 eV violet). Violet photons above 2.71 eV (λ < 458 nm) eject photoelectrons from calcium; Fraunhofer’s dark solar lines reveal what stars are made of.',
    chapter: 'Chapters 11.1, 15.1 & 15.4',
  },
  {
    id: 'uv',
    name: 'Ultraviolet (100–400 nm)',
    short: 'Ultraviolet (100–400 nm)',
    logF: Math.log10(C_LIGHT / 250e-9), // 15.079 (250 nm = 4.96 eV)
    band: 'Ultraviolet (UV)',
    source: 'The Sun and hot blue O/B stars; mercury-vapour lamps',
    detector: 'Ozone layer (absorbs short UV), fluorescent dyes, and UV photodiodes',
    story: 'Short-wavelength UV photons (3.1 to 12.4 eV) carry enough energy in a single packet to break chemical bonds in skin cells (sunburn) and knock electrons free.',
    chapter: 'Chapters 13.6 & 15.1',
  },
  {
    id: 'xray',
    name: 'X-rays (0.01–10 nm)',
    short: 'X-rays (0.01–10 nm)',
    logF: Math.log10(C_LIGHT / 0.1e-9), // 18.477 (0.1 nm = 12.4 keV)
    band: 'X-rays (Ionising)',
    source: 'High-speed electrons slamming into a metal target (hospital X-ray tube); inner-shell atomic jumps',
    detector: 'Digital X-ray detector plate (bones absorb X-rays strongly; soft tissue lets them pass)',
    story: 'Moseley used X-ray frequencies in 1913 to count the exact nuclear charge Z of each element. Having a medical X-ray exposes you briefly to photons but never makes your body radioactive.',
    chapter: 'Chapters 13.6 & 15.2',
  },
  {
    id: 'gamma',
    name: 'Gamma rays (< 0.01 nm)',
    short: 'Gamma rays (< 0.01 nm)',
    logF: Math.log10(C_LIGHT / 1e-12), // 20.477 (1 pm = 1.24 MeV)
    band: 'Gamma Rays (Nuclear & Cosmic)',
    source: 'Excited atomic nuclei rearranging protons and neutrons, and cosmic-ray collisions',
    detector: 'Scintillation counters and cloud chambers (used by Homi Bhabha and Bibha Chowdhuri)',
    story: 'The highest-energy packets on the ladder (over 100 keV to MeV and beyond). Like X-rays, gamma rays are pure electromagnetic waves travelling at c = 299,792,458 m/s.',
    chapter: 'Chapters 13.6 & 15.2',
  },
];

// Fraunhofer lines in visible sunlight (Ch 15.4)
const FRAUNHOFER = [
  { wl: 656.3, label: 'Hα (656 nm, Hydrogen)' },
  { wl: 589.3, label: 'Na D (589 nm, Sodium)' },
  { wl: 517.3, label: 'Mg b (517 nm)' },
  { wl: 486.1, label: 'Hβ (486 nm, Hydrogen)' },
  { wl: 430.8, label: 'Fe/Ca G (431 nm)' },
  { wl: 393.4, label: 'Ca K (393 nm, Calcium)' },
];

const SPECTRUM_TOUR = [
  {
    q: '1. What is it?',
    logF: Math.log10(C_LIGHT / 550e-9),
    syncText: 'Synced to Visible Light (550 nm green-yellow, 545 THz, 2.25 eV)',
    body: [
      'The Ladder of Light is the complete family of electromagnetic waves, stretching from 50 Hz alternating-current waves (6,000 km long) all the way to nuclear gamma rays (smaller than a picometre).',
      'Everything our eyes call "light" is just one tiny octave in the middle of this ladder, from 750 nm (red) to 400 nm (violet).',
    ],
  },
  {
    q: '2. Why is it called the electromagnetic spectrum?',
    logF: Math.log10(60e9),
    syncText: 'Synced to J. C. Bose’s 1895 Calcutta millimetre waves (60 GHz, λ = 5 mm)',
    body: [
      'In the 1860s James Clerk Maxwell united electricity and magnetism: a changing electric field (E) creates a magnetic field (B), and that changing magnetic field creates an electric field right back.',
      'Shake an electric charge back and forth and the two fields leap off into space together at right angles, sustaining each other without needing any wire or medium. Hertz proved it in 1887, and J. C. Bose built 5 mm horn antennas in Calcutta in 1895.',
    ],
  },
  {
    q: '3. What problem did it solve?',
    logF: Math.log10(C_LIGHT / 420e-9),
    syncText: 'Synced to Violet Light (420 nm, 2.95 eV) on Calcium metal (threshold 2.71 eV)',
    body: [
      'First, it showed that radio waves, warmth from a stove, sunlight, and hospital X-rays are not separate substances: they are the exact same wave at different wavelengths.',
      'Second, in 1905 Einstein solved the photoelectric puzzle: light travels as a wave, but delivers energy in individual packets (photons) of energy E = hf. A dim 420 nm violet beam (2.95 eV per photon) knocks electrons out of calcium (2.71 eV binding energy) with 0.24 eV to spare, whereas a blazingly bright 940 nm TV remote (1.32 eV) ejects none at all.',
    ],
  },
  {
    q: '4. Why is it shaped as one ladder with one speed?',
    logF: Math.log10(50),
    syncText: 'Synced to 50 Hz Mains (λ = 6,000 km) · c = fλ = 299,792,458 m/s everywhere in vacuum',
    body: [
      'In empty space, every rung on this ladder travels at the exact same speed: c = 1/√(μ₀ε₀) = 299,792,458 m/s.',
      'Because wavelength times frequency must always equal c (c = fλ), making a wave 10 times shorter automatically makes its frequency 10 times higher, and makes each photon packet (E = hf) 10 times more energetic.',
    ],
  },
  {
    q: '5. How does it help?',
    logF: Math.log10(C_LIGHT / 0.1e-9),
    syncText: 'Synced to X-rays (0.1 nm, 12.4 keV): single-photon ionising threshold (> 10 eV)',
    body: [
      'Knowing a wave’s rung tells us how it interacts with matter. Waves with photon energy below ~10 eV (radio, Wi-Fi, infrared, visible) cannot ionise atoms one photon at a time; they only warm things if huge numbers of photons arrive together.',
      'High on the ladder, UV, X-rays, and gamma rays pack enough energy in a single photon to knock electrons out of molecules. And in the visible band, Fraunhofer’s dark absorption lines let Meghnad Saha and Cecilia Payne read the temperature and hydrogen abundance of distant stars.',
    ],
  },
];

function fmtFreq(f) {
  if (f < 1e3) return `${f.toFixed(0)} Hz`;
  if (f < 1e6) return `${(f / 1e3).toPrecision(3)} kHz`;
  if (f < 1e9) return `${(f / 1e6).toPrecision(3)} MHz`;
  if (f < 1e12) return `${(f / 1e9).toPrecision(3)} GHz`;
  if (f < 1e15) return `${(f / 1e12).toPrecision(3)} THz`;
  if (f < 1e18) return `${(f / 1e15).toPrecision(3)} PHz`;
  return `${(f / 1e18).toPrecision(3)} EHz`;
}

function fmtWavelength(lam) {
  if (lam >= 1e3) return `${(lam / 1e3).toLocaleString('en-GB', { maximumFractionDigits: 0 })} km`;
  if (lam >= 1) return `${lam.toPrecision(3)} m`;
  if (lam >= 1e-2) return `${(lam * 100).toPrecision(3)} cm`;
  if (lam >= 1e-3) return `${(lam * 1e3).toPrecision(3)} mm`;
  if (lam >= 1e-6) return `${(lam * 1e6).toPrecision(3)} μm`;
  if (lam >= 1e-9) return `${(lam * 1e9).toPrecision(3)} nm`;
  return `${(lam * 1e12).toPrecision(3)} pm`;
}

function fmtEnergyEv(ev) {
  if (ev < 1e-3) {
    const exp = Math.floor(Math.log10(ev));
    const mant = ev / Math.pow(10, exp);
    return `${mant.toFixed(2)} × 10${fmtSup(exp)} eV`;
  }
  if (ev < 1e3) return `${ev.toPrecision(3)} eV`;
  if (ev < 1e6) return `${(ev / 1e3).toPrecision(3)} keV`;
  return `${(ev / 1e6).toPrecision(3)} MeV`;
}

function nearestRung(logF) {
  let best = RUNGS[0];
  let bestDist = Infinity;
  for (const r of RUNGS) {
    const d = Math.abs(r.logF - logF);
    if (d < bestDist) { bestDist = d; best = r; }
  }
  return best;
}

function visibleHueForNm(nm) {
  if (nm < 380 || nm > 760) return null;
  const t = (750 - Math.max(400, Math.min(750, nm))) / 350; // 0 at red 750, 1 at violet 400
  const hue = Math.round(t * 275);
  return `hsl(${hue}, 82%, 48%)`;
}

App.explorer('spectrum', {
  mount(stage, { title, close }) {
    let logF = Math.log10(C_LIGHT / 420e-9); // Start in visible rainbow (420 nm violet, 2.95 eV)
    let playing = false;
    let phase = 0;
    let rafId = 0;
    let lastTime = 0;
    let showTour = false;
    let tourIdx = 0;

    const canvas = el('canvas', { class: 'xp-canvas', width: 880, height: 460, 'aria-label': 'Electromagnetic spectrum, coupled E and B wave, and photoelectric packet tester' });
    const slider = el('input', {
      type: 'range',
      min: LOGF_MIN,
      max: LOGF_MAX,
      step: 0.02,
      value: logF.toFixed(2),
      'aria-label': 'Position along the electromagnetic spectrum',
    });
    const sliderOut = el('output', {}, '');

    const playBtn = el('button', {
      type: 'button',
      class: 'xp-btn',
      onclick: togglePlay,
    }, 'Animate E ⊥ B wave');

    const statWl = el('span', { class: 'xp-stat-v' });
    const statWlSub = el('span', { class: 'xp-stat-sub' });
    const statFreq = el('span', { class: 'xp-stat-v' });
    const statFreqSub = el('span', { class: 'xp-stat-sub' });
    const statEv = el('span', { class: 'xp-stat-v' });
    const statEvSub = el('span', { class: 'xp-stat-sub' });

    const readoutMount = el('div', { class: 'xp-readout', 'aria-live': 'polite' });
    const tourBox = el('div', { class: 'xp-tour', hidden: true });

    const rungBtns = RUNGS.map(r =>
      el('button', {
        type: 'button',
        class: 'xp-rung',
        'data-id': r.id,
        'aria-pressed': 'false',
        onclick: () => { setLogF(r.logF); },
      }, r.short)
    );

    const tabExplore = el('button', {
      type: 'button',
      class: 'xp-tab',
      'aria-pressed': 'true',
      onclick: () => toggleTour(false),
    }, 'Interactive spectrum & photon tester');

    const tabTour = el('button', {
      type: 'button',
      class: 'xp-tab',
      'aria-pressed': 'false',
      onclick: () => toggleTour(true),
    }, 'Explain it step by step (5 questions)');

    function stopPlay() {
      playing = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      playBtn.textContent = 'Animate E ⊥ B wave';
      playBtn.setAttribute('aria-pressed', 'false');
    }

    function togglePlay() {
      if (playing) { stopPlay(); return; }
      playing = true;
      playBtn.textContent = 'Pause wave';
      playBtn.setAttribute('aria-pressed', 'true');
      lastTime = performance.now();
      const tick = now => {
        if (!playing) return;
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;
        phase = (phase + dt * 4.2) % (Math.PI * 2);
        drawCanvas();
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    function toggleTour(on) {
      showTour = on;
      tabExplore.setAttribute('aria-pressed', String(!on));
      tabTour.setAttribute('aria-pressed', String(on));
      tourBox.hidden = !on;
      if (on) renderTour(tourIdx);
    }

    function renderTour(idx) {
      tourIdx = idx;
      const st = SPECTRUM_TOUR[idx];
      setLogF(st.logF);

      const pills = SPECTRUM_TOUR.map((s, i) =>
        el('button', {
          type: 'button',
          class: 'xp-step-pill',
          'aria-current': i === idx ? 'step' : 'false',
          onclick: () => renderTour(i),
        }, s.q)
      );

      tourBox.replaceChildren(
        el('div', { class: 'xp-tour-head' },
          el('p', { class: 'xp-tour-kicker' }, 'Understand the spectrum · 5-question guided tour')
        ),
        el('div', { class: 'xp-tour-steps' }, pills),
        el('h4', { class: 'xp-tour-q' }, st.q),
        el('div', { class: 'xp-tour-a' }, ...st.body.map(p => el('p', {}, p))),
        el('div', { class: 'xp-tour-sync' },
          el('span', {}, st.syncText),
          el('button', {
            type: 'button',
            class: 'xp-btn',
            onclick: () => setLogF(st.logF),
          }, 'Jump to this rung')
        ),
        el('div', { class: 'xp-tour-nav' },
          el('button', {
            type: 'button',
            class: 'xp-btn',
            disabled: idx === 0,
            onclick: () => renderTour(Math.max(0, idx - 1)),
          }, '← Previous question'),
          el('button', {
            type: 'button',
            class: 'xp-btn',
            disabled: idx === SPECTRUM_TOUR.length - 1,
            onclick: () => renderTour(Math.min(SPECTRUM_TOUR.length - 1, idx + 1)),
          }, 'Next question →')
        )
      );
    }

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
      };
    }

    function drawCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 880;
      const cssH = Math.max(350, Math.min(460, Math.round(cssW * 0.54)));
      if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
      }
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);

      const W = cssW, H = cssH;
      const col = readPalette();
      const freq = Math.pow(10, logF);
      const lam = C_LIGHT / freq;
      const ev = H_PLANCK_EV * freq;
      const nm = lam * 1e9;

      ctx.fillStyle = col.plate;
      ctx.fillRect(0, 0, W, H);

      // 1. TOP SPECTRUM LADDER BAR (y = 14..82)
      const padX = 24;
      const barW = W - padX * 2;
      const barY = 30;
      const barH = 26;
      const xOfLogF = lf => padX + ((lf - LOGF_MIN) / (LOGF_MAX - LOGF_MIN)) * barW;

      ctx.fillStyle = col.sheet;
      ctx.strokeStyle = col.rule;
      ctx.lineWidth = 1.2;
      ctx.fillRect(padX, barY, barW, barH);
      ctx.strokeRect(padX, barY, barW, barH);

      // Highlight visible sliver on the main bar (logF ~ 14.60 to 14.88)
      const visX0 = xOfLogF(Math.log10(C_LIGHT / 750e-9));
      const visX1 = xOfLogF(Math.log10(C_LIGHT / 400e-9));
      const gradVis = ctx.createLinearGradient(visX0, 0, visX1, 0);
      gradVis.addColorStop(0, '#c83e2b');
      gradVis.addColorStop(0.35, '#d99b26');
      gradVis.addColorStop(0.6, '#2e8b57');
      gradVis.addColorStop(0.85, '#2b6cb0');
      gradVis.addColorStop(1, '#6b46c1');
      ctx.fillStyle = gradVis;
      ctx.fillRect(visX0, barY + 1, Math.max(6, visX1 - visX0), barH - 2);

      // Band labels along the spectrum bar
      const bandLabels = [
        { lf: 2.3, text: '50 Hz' },
        { lf: 8.5, text: 'Radio' },
        { lf: 10.6, text: 'mm / μwave' },
        { lf: 13.4, text: 'Infrared' },
        { lf: 14.74, text: 'Vis' },
        { lf: 15.8, text: 'UV' },
        { lf: 18.0, text: 'X-rays' },
        { lf: 20.0, text: 'γ-rays' },
      ];
      ctx.font = `600 10px "Lexend", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      bandLabels.forEach(b => {
        const bx = xOfLogF(b.lf);
        if (bx > padX + 12 && bx < padX + barW - 12) {
          ctx.fillStyle = col.ink2;
          ctx.fillText(b.text, bx, barY - 6);
        }
      });

      // Rung dots on main bar
      RUNGS.forEach(r => {
        const rx = xOfLogF(r.logF);
        ctx.fillStyle = Math.abs(r.logF - logF) < 0.25 ? col.proton : col.electron;
        ctx.beginPath();
        ctx.arc(rx, barY + barH / 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Current cursor on main bar
      const curX = xOfLogF(logF);
      ctx.strokeStyle = col.proton;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(curX, barY - 4);
      ctx.lineTo(curX, barY + barH + 4);
      ctx.stroke();

      // 2. VISIBLE RAINBOW & FRAUNHOFER ZOOM STRIP (y = 74..118)
      const zoomY = 74, zoomH = 26;
      const zGrad = ctx.createLinearGradient(padX, 0, padX + barW, 0);
      zGrad.addColorStop(0, '#b83227');
      zGrad.addColorStop(0.22, '#d97724');
      zGrad.addColorStop(0.42, '#d4ac2b');
      zGrad.addColorStop(0.62, '#2f855a');
      zGrad.addColorStop(0.82, '#2b6cb0');
      zGrad.addColorStop(1, '#553c9a');
      ctx.fillStyle = zGrad;
      ctx.globalAlpha = (nm >= 380 && nm <= 760) ? 0.92 : 0.45;
      ctx.fillRect(padX, zoomY, barW, zoomH);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = col.rule;
      ctx.strokeRect(padX, zoomY, barW, zoomH);

      // Map 750 nm (left) to 380 nm (right)
      const xOfNm = w => padX + ((750 - w) / (750 - 380)) * barW;

      // Fraunhofer dark solar absorption lines (Ch 15.4)
      FRAUNHOFER.forEach(fl => {
        const fx = xOfNm(fl.wl);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(fx, zoomY);
        ctx.lineTo(fx, zoomY + zoomH);
        ctx.stroke();
        if (W > 560) {
          ctx.fillStyle = col.ink2;
          ctx.font = `600 9.5px "Lexend", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(fl.label.split(' ')[0], fx, zoomY + zoomH + 11);
        }
      });

      // Calcium 2.71 eV photoelectric threshold marker (458 nm)
      const caX = xOfNm(457.5);
      ctx.strokeStyle = col.proton;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(caX, zoomY - 3);
      ctx.lineTo(caX, zoomY + zoomH + 3);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = col.proton;
      ctx.font = `700 9.5px "Lexend", system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText('Ca threshold 2.71 eV (458 nm) →', caX - 4, zoomY - 4);

      if (nm >= 380 && nm <= 750) {
        const vx = xOfNm(nm);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(vx, zoomY - 2);
        ctx.lineTo(vx, zoomY + zoomH + 2);
        ctx.stroke();
      }

      // 3. BOTTOM LEFT: COUPLED E ⊥ B WAVE VISUALISER
      const waveTop = 124;
      const waveW = W > 640 ? W * 0.56 : W - padX * 2;
      const waveH = H - waveTop - 16;
      const wCx = padX + 16;
      const wCy = waveTop + waveH * 0.52;
      const axisLen = waveW - 32;

      ctx.strokeStyle = col.rule;
      ctx.lineWidth = 1;
      ctx.strokeRect(padX, waveTop, waveW, waveH);

      // Propagation axis (c)
      ctx.strokeStyle = col.muted;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(wCx, wCy);
      ctx.lineTo(wCx + axisLen, wCy);
      ctx.stroke();

      // Number of spatial cycles shown scales smoothly with logF (from 1.2 cycles at 50 Hz to 14 cycles at gamma)
      const cycles = 1.2 + ((logF - LOGF_MIN) / (LOGF_MAX - LOGF_MIN)) * 12.5;
      const ampE = Math.min(48, waveH * 0.34);
      const bxSlant = 0.45, bySlant = -0.32; // 3D oblique projection for perpendicular B field

      // Draw B-field wave (blue/electron, perpendicular to E)
      ctx.strokeStyle = col.electron;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const steps = 140;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const x0 = wCx + u * axisLen;
        const s = Math.sin(u * cycles * Math.PI * 2 - phase);
        const bx = x0 + s * ampE * bxSlant;
        const by = wCy + s * ampE * bySlant;
        if (i === 0) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
      ctx.stroke();

      // Draw E-field wave (red/proton, vertical) with field vectors
      const visCol = visibleHueForNm(nm);
      ctx.strokeStyle = visCol || col.proton;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const x0 = wCx + u * axisLen;
        const s = Math.sin(u * cycles * Math.PI * 2 - phase);
        const ey = wCy - s * ampE;
        if (i === 0) ctx.moveTo(x0, ey);
        else ctx.lineTo(x0, ey);
      }
      ctx.stroke();

      // Draw E and B field vector ribs every few steps
      for (let i = 0; i <= steps; i += 6) {
        const u = i / steps;
        const x0 = wCx + u * axisLen;
        const s = Math.sin(u * cycles * Math.PI * 2 - phase);
        ctx.strokeStyle = visCol || col.proton;
        ctx.globalAlpha = 0.32;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, wCy);
        ctx.lineTo(x0, wCy - s * ampE);
        ctx.stroke();

        ctx.strokeStyle = col.electron;
        ctx.beginPath();
        ctx.moveTo(x0, wCy);
        ctx.lineTo(x0 + s * ampE * bxSlant, wCy + s * ampE * bySlant);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.font = `700 11px "Lexend", system-ui, sans-serif`;
      ctx.fillStyle = col.ink;
      ctx.textAlign = 'left';
      ctx.fillText('Coupled Electromagnetic Wave (E ⊥ B, speed c = 299,792,458 m/s)', padX + 10, waveTop + 18);
      ctx.font = `600 10px "Lexend", system-ui, sans-serif`;
      ctx.fillStyle = visCol || col.proton;
      ctx.fillText('Electric field E (vertical)', padX + 10, waveTop + waveH - 10);
      ctx.fillStyle = col.electron;
      ctx.fillText('Magnetic field B (90° to E)', padX + 165, waveTop + waveH - 10);

      // 4. BOTTOM RIGHT: PHOTOELECTRIC (Ca 2.71 eV) & IONISATION (~10 eV) PACKET TESTER
      if (W > 640) {
        const pLeft = padX + waveW + 12;
        const pW = W - pLeft - padX;
        ctx.strokeStyle = col.rule;
        ctx.lineWidth = 1;
        ctx.strokeRect(pLeft, waveTop, pW, waveH);

        ctx.font = `700 11px "Lexend", system-ui, sans-serif`;
        ctx.fillStyle = col.ink;
        ctx.textAlign = 'left';
        ctx.fillText('Single-Photon Packet Test (E = hf)', pLeft + 10, waveTop + 18);

        // Draw Calcium metal plate
        const plateX = pLeft + pW * 0.48;
        const plateY = waveTop + waveH * 0.56;
        ctx.fillStyle = col.rule;
        ctx.fillRect(plateX - 8, plateY - 38, 16, 76);
        ctx.strokeStyle = col.ink2;
        ctx.strokeRect(plateX - 8, plateY - 38, 16, 76);

        ctx.font = `600 9.5px "Lexend", system-ui, sans-serif`;
        ctx.fillStyle = col.ink2;
        ctx.textAlign = 'center';
        ctx.fillText('Calcium metal', plateX, plateY + 52);
        ctx.fillText('(BE = 2.71 eV)', plateX, plateY + 64);

        // Incoming photon wave-packet from left
        ctx.strokeStyle = visCol || col.neutron;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const pktX = pLeft + pW * 0.22;
        for (let dx = -22; dx <= 22; dx++) {
          const env = Math.cos((dx / 22) * (Math.PI / 2));
          const py = plateY - 12 + Math.sin(dx * 0.65 - phase * 2) * 11 * env;
          if (dx === -22) ctx.moveTo(pktX + dx, py);
          else ctx.lineTo(pktX + dx, py);
        }
        ctx.stroke();
        ctx.fillStyle = col.ink;
        ctx.fillText(`hf = ${fmtEnergyEv(ev)}`, pktX, plateY - 30);

        const ejectsCa = ev >= CA_WORK_EV;
        const ionises = ev >= IONISE_EV;

        if (ejectsCa) {
          const ke = ev - CA_WORK_EV;
          ctx.strokeStyle = col.green;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(plateX + 10, plateY - 10);
          ctx.lineTo(pLeft + pW - 22, plateY - 28);
          ctx.stroke();

          ctx.fillStyle = col.green;
          ctx.beginPath();
          ctx.arc(pLeft + pW - 22, plateY - 28, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = `700 10px "Lexend", system-ui, sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText('e⁻ ejected!', plateX + 16, plateY - 34);
          ctx.font = `500 9.5px "Lexend", system-ui, sans-serif`;
          ctx.fillText(`KE = ${fmtEnergyEv(ke)}`, plateX + 16, plateY - 4);
        } else {
          ctx.fillStyle = col.proton;
          ctx.font = `700 10px "Lexend", system-ui, sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText('No electron ejected', plateX + 14, plateY - 14);
          ctx.font = `400 9.5px "Lexend", system-ui, sans-serif`;
          ctx.fillStyle = col.muted;
          ctx.fillText('(hf < 2.71 eV threshold)', plateX + 14, plateY + 2);
        }

        // Bottom status line in tester box
        ctx.font = `700 10px "Lexend", system-ui, sans-serif`;
        ctx.fillStyle = ionises ? col.proton : col.green;
        ctx.textAlign = 'left';
        ctx.fillText(
          ionises
            ? 'Ionising (> 10 eV): single photon can ionise atoms'
            : 'Non-ionising (< 10 eV): safe per photon (heating only)',
          pLeft + 10, waveTop + waveH - 10
        );
      }

      ctx.restore();
    }

    function setLogF(val) {
      logF = Math.max(LOGF_MIN, Math.min(LOGF_MAX, val));
      slider.value = logF.toFixed(2);

      const freq = Math.pow(10, logF);
      const lam = C_LIGHT / freq;
      const ev = H_PLANCK_EV * freq;
      const rung = nearestRung(logF);

      sliderOut.textContent = `${fmtWavelength(lam)} · ${fmtFreq(freq)}`;

      rungBtns.forEach(b => {
        b.setAttribute('aria-pressed', String(b.dataset.id === rung.id && Math.abs(rung.logF - logF) < 0.35));
      });

      const ejectsCa = ev >= CA_WORK_EV;
      const ionises = ev >= IONISE_EV;

      statWl.textContent = fmtWavelength(lam);
      statWlSub.textContent = `Band: ${rung.band}`;

      statFreq.textContent = fmtFreq(freq);
      statFreqSub.textContent = `c = fλ = 299,792,458 m/s`;

      statEv.textContent = fmtEnergyEv(ev);
      statEvSub.textContent = ejectsCa
        ? (ionises ? 'Ejects Ca e⁻ & ionises atoms (>10 eV)' : `Ejects Ca e⁻ (KE = ${fmtEnergyEv(ev - CA_WORK_EV)})`)
        : 'Below Calcium 2.71 eV threshold';

      readoutMount.replaceChildren(
        el('p', {},
          el('b', {}, `${rung.name} · ${rung.chapter}: `),
          rung.story
        ),
        el('p', {},
          el('b', {}, 'Source: '), `${rung.source}. `,
          el('b', {}, 'Detector: '), `${rung.detector}.`
        ),
        el('p', {},
          el('b', {}, 'Photoelectric & ionisation check (Chapters 15.1 & 15.2): '),
          ejectsCa
            ? `Each photon carries ${fmtEnergyEv(ev)}, which beats calcium’s 2.71 eV work function and knocks out an electron with maximum kinetic energy KE = hf − BE = ${fmtEnergyEv(ev - CA_WORK_EV)}. `
            : `Each photon carries ${fmtEnergyEv(ev)}, which is below calcium’s 2.71 eV binding energy, so zero electrons are ejected however bright the beam is. `,
          ionises
            ? 'Because each photon exceeds ~10 eV, single photons can ionise atoms and break biological molecules.'
            : 'Because each photon is below ~10 eV, this radiation is non-ionising.'
        ),
        el('p', { class: 'xp-honest' },
          'Model note: In empty space every electromagnetic wave travels at c = 299,792,458 m/s. Because real frequencies run from 50 Hz to 3 × 10²⁰ Hz, the wave animation is slowed by factors of up to 10²⁰ so you can watch the coupled electric (E) and magnetic (B) fields oscillate at right angles.'
        )
      );

      drawCanvas();
    }

    slider.addEventListener('input', () => {
      setLogF(parseFloat(slider.value));
    });

    // Click on top spectrum bar or visible rainbow zoom strip to jump directly
    canvas.addEventListener('pointerdown', e => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const padX = 24;
      const barW = rect.width - padX * 2;
      const frac = Math.max(0, Math.min(1, (x - padX) / barW));
      if (y >= 16 && y <= 64) {
        setLogF(LOGF_MIN + frac * (LOGF_MAX - LOGF_MIN));
      } else if (y >= 68 && y <= 112) {
        const nm = 750 - frac * (750 - 380);
        setLogF(Math.log10(C_LIGHT / (nm * 1e-9)));
      }
    });

    const wrap = el('div', { class: 'xp-wrap' },
      el('div', { class: 'xp-top' },
        el('div', { class: 'xp-title-group' },
          el('p', { class: 'xp-kicker' }, 'Explorer · Chapters 11, 13.6 & 15'),
          el('h3', { class: 'xp-heading' }, 'The Ladder of Light: from 50 Hz mains to gamma rays')
        ),
        el('button', { type: 'button', class: 'xp-btn xp-close', onclick: () => { stopPlay(); close(); } }, 'Close explorer')
      ),
      el('div', { class: 'xp-tabs', role: 'toolbar', 'aria-label': 'Spectrum explorer modes' }, tabExplore, tabTour),
      el('div', { class: 'xp-rungs', role: 'group', 'aria-label': 'Electromagnetic spectrum rungs' }, rungBtns),
      el('div', { class: 'xp-canvas-wrap' }, canvas),
      el('div', { class: 'xp-controls' },
        el('div', { class: 'xp-slider' },
          el('label', {}, 'Spectrum rung'),
          slider,
          sliderOut
        ),
        playBtn
      ),
      el('div', { class: 'xp-stats' },
        el('div', { class: 'xp-stat' }, el('span', { class: 'xp-stat-k' }, 'Wavelength (λ)'), statWl, statWlSub),
        el('div', { class: 'xp-stat' }, el('span', { class: 'xp-stat-k' }, 'Frequency (f = c / λ)'), statFreq, statFreqSub),
        el('div', { class: 'xp-stat' }, el('span', { class: 'xp-stat-k' }, 'Photon energy (E = hf)'), statEv, statEvSub)
      ),
      readoutMount,
      tourBox
    );

    stage.replaceChildren(wrap);
    setLogF(logF);

    let rTimer;
    window.addEventListener('resize', () => { clearTimeout(rTimer); rTimer = setTimeout(drawCanvas, 80); });
  },
});
