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
    let panel = 'visible';
    let disposed = false;

    const canvas = el('canvas', { class: 'xp-canvas spectrum-canvas', width: 880, height: 460, role:'img', 'aria-label': 'The electromagnetic spectrum and an enlarged selected explanation.' });
    const panelNote = el('p', {class:'explorer-scene-note'});
    const panels = [['visible','Colour & spectral lines'],['wave','Electric & magnetic fields'],['photon','One photon & an electron']];
    const panelButtons = panels.map(([key,label])=>el('button',{type:'button',class:'xp-tab','aria-pressed':String(key===panel),onclick:()=>{panel=key;stopPlay();panelButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(panels[i][0]===key)));drawCanvas();}},label));
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
      if (disposed || stage.closest('[data-page-off]')) return;
      const dpr=Math.min(devicePixelRatio||1,2),W=canvas.clientWidth||700,H=410;
      canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
      const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
      const col=readPalette(),freq=10**logF,lam=C_LIGHT/freq,ev=H_PLANCK_EV*freq,nm=lam*1e9;
      const text=(s,x,y,{size=13,colour=col.ink,align='left',weight=400}={})=>{ctx.fillStyle=colour;ctx.font=`${weight} ${size}px Lexend,system-ui`;ctx.textAlign=align;ctx.fillText(s,x,y);};
      const line=(x,y,x2,y2,colour=col.rule,width=1)=>{ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();};
      const arrow=(x,y,x2,y2,colour)=>{line(x,y,x2,y2,colour,2);const a=Math.atan2(y2-y,x2-x);ctx.fillStyle=colour;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-8*Math.cos(a-.45),y2-8*Math.sin(a-.45));ctx.lineTo(x2-8*Math.cos(a+.45),y2-8*Math.sin(a+.45));ctx.fill();};
      ctx.fillStyle=col.plate;ctx.fillRect(0,0,W,H);
      const pad=24,bw=W-pad*2,by=48,bh=24;
      const xf=lf=>pad+(lf-LOGF_MIN)/(LOGF_MAX-LOGF_MIN)*bw;
      text('Whole electromagnetic spectrum',pad,25,{weight:700});
      ctx.fillStyle=col.sheet;ctx.fillRect(pad,by,bw,bh);ctx.strokeStyle=col.rule;ctx.strokeRect(pad,by,bw,bh);
      const v0=xf(Math.log10(C_LIGHT/750e-9)),v1=xf(Math.log10(C_LIGHT/400e-9));
      const rainbow=ctx.createLinearGradient(v0,0,v1,0);['#c83e2b','#d99b26','#2e8b57','#2b6cb0','#6b46c1'].forEach((c,i)=>rainbow.addColorStop(i/4,c));ctx.fillStyle=rainbow;ctx.fillRect(v0,by,v1-v0,bh);
      RUNGS.forEach(r=>{ctx.fillStyle=Math.abs(r.logF-logF)<.25?col.proton:col.electron;ctx.beginPath();ctx.arc(xf(r.logF),by+bh/2,3,0,Math.PI*2);ctx.fill();});
      line(xf(logF),by-6,xf(logF),by+bh+6,col.proton,2.5);
      text('lower frequency',pad,94,{size:12,colour:col.muted});text('higher frequency',W-pad,94,{size:12,colour:col.muted,align:'right'});
      const rung=nearestRung(logF);
      text(rung.band.length>34?rung.name:rung.band,pad,121,{weight:600,size:W<400?12:14});
      if(panel==='visible'){
        // Exact log-width sliver, expanded into an explicitly linked linear-wavelength view.
        line(v0,by+bh,pad,171,col.muted);line(v1,by+bh,W-pad,171,col.muted);
        const zy=179,zh=47,zn=w=>pad+(750-w)/350*bw;
        const g=ctx.createLinearGradient(pad,0,W-pad,0);['#bd5145','#cf933e','#c4b856','#6c9b5e','#4f87b1','#8a67b0'].forEach((c,i)=>g.addColorStop(i/5,c));ctx.fillStyle=g;ctx.fillRect(pad,zy,bw,zh);
        text('Visible band enlarged',pad,159,{weight:700,size:14});
        FRAUNHOFER.filter(f=>f.wl>=400).forEach(f=>{const x=zn(f.wl);line(x,zy,x,zy+zh,'#202822',2);});
        [750,650,550,450,400].forEach(w=>text(String(w),zn(w),zy+zh+21,{size:12,align:w===750?'left':w===400?'right':'center'}));
        text('wavelength (nm)',W-pad,zy+zh+44,{size:12,align:'right',colour:col.muted});
        const ca=zn(H_PLANCK_EV*C_LIGHT/CA_WORK_EV*1e9);ctx.setLineDash([4,3]);line(ca,zy-5,ca,zy+zh+4,col.proton,2);ctx.setLineDash([]);
        if(nm>=400&&nm<=750)line(zn(nm),zy-4,zn(nm),zy+zh+4,'#fff',3);
        text(W<400?'Dark lines: atoms absorb light':'Dark lines: atoms absorb particular colours.',pad,310,{size:13});
        text(W<400?'Dashed: calcium threshold (458 nm)':'Dashed mark: calcium threshold, 458 nm.',pad,334,{size:13,colour:col.proton});
        text('Red 750 nm',pad,380,{size:12,colour:col.muted});text('Violet 400 nm',W-pad,380,{size:12,colour:col.muted,align:'right'});
        panelNote.textContent='The connectors magnify the true, narrow visible band above. The lower strip uses a linear wavelength axis; the upper ruler uses logarithmic frequency. The white mark is your selected colour when it lies in the visible band.';
      }else if(panel==='wave'){
        const x0=pad+15,x1=W-pad-15,mid=246,amp=Math.min(58,bw*.18),cycles=2;
        text('Two fields, one travelling wave',pad,159,{weight:700,size:14});
        arrow(x0,mid,x1,mid,col.muted);
        for(const [colour,isB]of [[col.electron,true],[col.proton,false]]){ctx.strokeStyle=colour;ctx.lineWidth=2.2;ctx.beginPath();for(let i=0;i<=160;i++){const u=i/160,v=Math.sin(u*cycles*Math.PI*2-phase),x=x0+u*(x1-x0)+(isB?v*amp*.35:0),y=mid-v*amp*(isB?.38:1);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
        for(let i=0;i<=24;i++){const u=i/24,v=Math.sin(u*cycles*Math.PI*2-phase),x=x0+u*(x1-x0);ctx.globalAlpha=.35;line(x,mid,x,mid-v*amp,col.proton);line(x,mid,x+v*amp*.35,mid-v*amp*.38,col.electron);}ctx.globalAlpha=1;
        text('E: up / down',pad,185,{size:13,colour:col.proton});text('B: perpendicular to E',pad,344,{size:13,colour:col.electron});
        text('travel direction →',W-pad,369,{size:12,colour:col.muted,align:'right'});
        text('span = '+fmtWavelength(lam*2),pad,395,{weight:600,size:13});
        panelNote.textContent='This view always shows two wavelengths, so its physical span changes as you move along the ladder. E and B are in phase and perpendicular to each other and to travel. Their amplitudes use separate schematic scales; motion is slowed for viewing.';
      }else{
        text('Can one photon free an electron?',pad,159,{weight:700,size:14});
        const px=W*.5,py=258;
        ctx.fillStyle=col.rule;ctx.fillRect(px-10,py-53,20,106);ctx.strokeStyle=col.ink;ctx.strokeRect(px-10,py-53,20,106);
        ctx.strokeStyle=visibleHueForNm(nm)||col.neutron;ctx.lineWidth=2;ctx.beginPath();const end=px-19,start=pad+4;for(let i=0;i<=80;i++){const x=start+(end-start)*i/80,y=py+Math.sin(i/80*Math.PI*6-phase)*10;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
        text(fmtEnergyEv(ev),pad,196,{weight:700,size:13});
        if(ev>=CA_WORK_EV){arrow(px+20,py,W-pad-10,py-38,col.electron);ctx.fillStyle=col.electron;ctx.beginPath();ctx.arc(W-pad-10,py-38,5,0,Math.PI*2);ctx.fill();text('electron out',W-pad,286,{align:'right',weight:700,size:13,colour:col.electron});text('KE '+fmtEnergyEv(ev-CA_WORK_EV),W-pad,308,{align:'right',size:12});}
        else{text('stays bound',W-pad,286,{align:'right',weight:700,size:13,colour:col.proton});}
        text('calcium',px,332,{align:'center',weight:700,size:13});text('needs 2.71 eV',px,354,{align:'center',size:13});
        text(ev>=CA_WORK_EV?'Above the threshold':'Below the threshold',pad,391,{weight:700,size:14,colour:ev>=CA_WORK_EV?col.electron:col.proton});
        panelNote.textContent='Brightness changes the number of photons; wavelength changes each photon’s energy. This single-photon model uses clean calcium’s 2.71 eV work function. Ionisation thresholds depend on the material; “non-ionising” does not mean harmless.';
      }
      playBtn.hidden=panel!=='wave';
      canvas.setAttribute('aria-label',`${panels.find(p=>p[0]===panel)[1]}. ${sliderOut.textContent}. ${panelNote.textContent}`);
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
            : `Each photon carries ${fmtEnergyEv(ev)}, which is below calcium’s 2.71 eV binding energy, so increasing the number of photons does not eject electrons in this single-photon model. `,
          ionises
            ? 'This is above the approximate 10 eV guide used here for ionising radiation. Actual ionisation thresholds depend on the material.'
            : 'This is below the approximate 10 eV guide used here. Actual ionisation thresholds depend on the material; non-ionising does not mean harmless.'
        ),
        el('p', { class: 'xp-honest' },
          'Model note: In empty space every electromagnetic wave travels at c = 299,792,458 m/s. The wave view rescales its window to show two wavelengths at every selected frequency; its visible motion is illustrative, not a clock for the actual oscillation.'
        )
      );

      drawCanvas();
    }

    slider.addEventListener('input', () => {
      setLogF(parseFloat(slider.value));
    });

    // The same native slider is available to keyboard users; the drawing is an optional shortcut.
    canvas.addEventListener('pointerdown',e=>{
      const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=(e.clientY-r.top)*410/r.height,pad=24;
      const frac=Math.max(0,Math.min(1,(x-pad)/(r.width-2*pad)));
      if(y>=35&&y<=80)setLogF(LOGF_MIN+frac*(LOGF_MAX-LOGF_MIN));
      else if(panel==='visible'&&y>=170&&y<=235)setLogF(Math.log10(C_LIGHT/((750-frac*350)*1e-9)));
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
      el('div',{class:'spectrum-panels',role:'group','aria-label':'Choose a visual explanation'},panelButtons),
      el('div', { class: 'xp-canvas-wrap' }, canvas), panelNote,
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
    const resize=()=>{clearTimeout(rTimer);rTimer=setTimeout(drawCanvas,80);};
    const hide=()=>{if(document.hidden||stage.closest('[data-page-off]'))stopPlay();};
    window.addEventListener('resize',resize);document.addEventListener('visibilitychange',hide);
    const pageObserver=new MutationObserver(hide);const section=stage.closest('section');if(section)pageObserver.observe(section,{attributes:true,attributeFilter:['data-page-off']});
    const observer=new MutationObserver(drawCanvas);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
    return ()=>{disposed=true;stopPlay();clearTimeout(rTimer);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',hide);observer.disconnect();pageObserver.disconnect();};
  },
});
