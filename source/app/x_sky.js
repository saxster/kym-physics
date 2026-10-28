// The Sky explorer: Sun, Earth, Moon, Mumbai's 19.08° N rooftop, ideal tides, Chandrayaan-3 & Aditya-L1.
import App from './core.js';
import { fitMissionOrbit, missionPeriodHours } from './mission_orbit.mjs';
import { phaseDisc } from './phase_shape.mjs';

const { el } = App;

const MUMBAI_LAT = 19.08;
const OBLIQUITY = 23.44;
const MOON_TILT = 5.145;
const SYNODIC_DAYS = 29.5306;
const SIDEREAL_DAYS = 27.3217;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function dayToDateStr(doy) {
  let d = Math.max(1, Math.min(365, Math.round(doy)));
  for (let m = 0; m < 12; m++) {
    if (d <= MDAYS[m]) return `${d} ${MONTHS[m]}`;
    d -= MDAYS[m];
  }
  return '31 Dec';
}

// Solar declination (degrees) from day of year (1..365), accurate to ~0.5 deg
function solarDeclination(doy) {
  const angle = (2 * Math.PI / 365) * (doy + 10);
  return -OBLIQUITY * Math.cos(angle);
}

// Earth-Sun distance in million km (perihelion 147.095 on ~3 Jan, aphelion 152.100 on ~4 Jul)
function earthSunDistMkm(doy) {
  const a = 149.598;
  const e = 0.0167;
  const theta = (2 * Math.PI / 365) * (doy - 3);
  return a * (1 - e * Math.cos(theta));
}

// Geometric day length in hours at latitude phiDeg for declination decDeg
function dayLengthHours(phiDeg, decDeg) {
  const phi = phiDeg * Math.PI / 180;
  const dec = decDeg * Math.PI / 180;
  const cosH = -Math.tan(phi) * Math.tan(dec);
  if (cosH <= -1) return 24;
  if (cosH >= 1) return 0;
  return (2 * Math.acos(cosH) * 180 / Math.PI) / 15;
}

// Instantaneous solar altitude and azimuth-sign at hour (0..24 solar time)
function sunPositionAtHour(phiDeg, decDeg, hour) {
  const phi = phiDeg * Math.PI / 180;
  const dec = decDeg * Math.PI / 180;
  const H = (hour - 12) * 15 * Math.PI / 180;
  const sinAlt = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180 / Math.PI;
  return { alt, H };
}

function fmtHours(h) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  const hh = mins === 60 ? hrs + 1 : hrs;
  const mm = mins === 60 ? 0 : mins;
  return `${String(hh % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// ISRO Chandrayaan-3 documented manoeuvres (from grounding/ch05.md §5.6)
const CH3_STEPS = [
  {
    date: '14 Jul 2023',
    name: '1. Launch (EPO)',
    body: 'Earth',
    peri: 170,
    apo: 36500,
    note: 'LVM3-M4 launches Chandrayaan-3 from Sriharikota into an Elliptic Parking Orbit (170 × 36,500 km). After engine cut-off, the craft coasts under Earth’s gravity alone.',
  },
  {
    date: '15 Jul 2023',
    name: '2. Earth burn 1',
    body: 'Earth',
    peri: 173,
    apo: 41762,
    note: 'First Earth-bound perigee firing from ISTRAC Bengaluru speeds the craft up at its closest point, raising apogee to 41,762 km and lengthening the orbital period to 12.5 hours.',
  },
  {
    date: '17 Jul 2023',
    name: '3. Earth burn 2',
    body: 'Earth',
    peri: 226,
    apo: 41603,
    note: 'Second orbit-raising manoeuvre raises perigee to 226 km above Earth.',
  },
  {
    date: '22 Jul 2023',
    name: '4. Earth burn 4',
    body: 'Earth',
    peri: 233,
    apo: 71351,
    note: 'Fourth Earth-bound perigee firing boosts apogee to 71,351 km. By Kepler’s third law (T² ∝ a³), the orbital period nearly doubles to 23.9 hours.',
  },
  {
    date: '1 Aug 2023',
    name: '5. Translunar Injection (TLI)',
    body: 'Earth',
    peri: 288,
    apo: 369328,
    note: 'Perigee burn sends Chandrayaan-3 onto a 288 × 369,328 km translunar transfer ellipse reaching out to the Moon’s neighbourhood.',
  },
  {
    date: '5 Aug 2023',
    name: '6. Lunar Orbit Insertion (LOI)',
    body: 'Moon',
    peri: 164,
    apo: 18074,
    note: 'A retro-burn at perilune for 1,835 seconds slows the craft down so the Moon’s gravity captures it into a 164 × 18,074 km lunar ellipse.',
  },
  {
    date: '6–9 Aug 2023',
    name: '7. Lunar burns 2 & 3',
    body: 'Moon',
    peri: 174,
    apo: 1437,
    note: 'Retro-burns at perilune lower apolune first to 4,313 km (6 Aug) and then to 1,437 km (9 Aug), shrinking the orbit step by step.',
  },
  {
    date: '16 Aug 2023',
    name: '8. Circularisation',
    body: 'Moon',
    peri: 153,
    apo: 163,
    note: 'Fourth and fifth lunar burns round the path into a 153 × 163 km near-circular polar orbit before the Vikram lander separates on 17 August.',
  },
  {
    date: '23 Aug 2023',
    name: '9. Polar Landing (69.37° S)',
    body: 'Moon',
    peri: 0,
    apo: 134,
    period: 'Landed 18:04 IST',
    note: 'From a 25 × 134 km descent orbit, Vikram performs powered braking and soft-lands near the lunar south pole at 69.37° S, 32.35° E (Shiv Shakti Point).',
  },
].map(step => {
  if (step.peri === 0) return step; // Landing has a time, not a Kepler period.
  const earth = step.body === 'Earth';
  const hours = missionPeriodHours(step.peri, step.apo, earth ? 6371 : 1737.1, earth ? 398600 : 4902.8);
  return { ...step, period: `${hours.toFixed(1)} h` };
});

const SKY_TOUR = [
  {
    q: '1. What is it?',
    tab: 'seasons',
    setup: s => { s.doy = 172; s.hour = 12; s.lat = 19.08; },
    syncText: 'Synced to 21 June (June solstice) at 12:00 noon on a Mumbai rooftop (19.08° N)',
    body: [
      'The Sky explorer is a working model of the Sun, Earth, and Moon paired with the view from a rooftop in Mumbai (19.08° N) and an ideal model of ocean tides.',
      'On the left you look from space at Earth’s tilted axis and orbit; on the right you stand on the ground and watch how that tilt changes the Sun’s noon height, the length of the day, the Moon’s phases, and the ocean tides.',
    ],
  },
  {
    q: '2. Why is it called an orrery?',
    tab: 'seasons',
    setup: s => { s.doy = 135; s.hour = 12; s.lat = 19.08; },
    syncText: 'Synced to mid-May (Mumbai’s first zero-shadow day: noon Sun 90.0° straight overhead)',
    body: [
      'Clockwork models of the Solar System were named after Charles Boyle, 4th Earl of Orrery, after George Graham and John Rowley built one in London around 1712.',
      'A mechanical brass orrery has to exaggerate sizes so the gears fit. A digital orrery lets us keep the true geometry: at Mumbai’s latitude (19.08° N), the noon Sun passes straight overhead (90.0°) twice a year, in mid-May and late July, when shadows vanish at noon.',
    ],
  },
  {
    q: '3. What problem did it solve?',
    tab: 'seasons',
    setup: s => { s.doy = 3; s.hour = 12; s.lat = 19.08; },
    syncText: 'Synced to 3 January (Perihelion: Earth is closest to the Sun at 147.1 million km, yet noon Sun is only 48° high)',
    body: [
      'Most people (including 21 of 23 Harvard graduates and faculty filmed in A Private Universe) guess that summer happens when Earth is closer to the Sun.',
      'Look at 3 January on the left panel: Earth is at perihelion (147.1 million km), 5 million km closer to the Sun than in July! Yet in Mumbai and across the Northern Hemisphere it is the coolest time of year, because the northern axis leans away from the Sun, lowering the noon Sun to 47.5° and spreading the same beam over 1.35× more ground.',
    ],
  },
  {
    q: '4. Why is the sky shaped by two tilts (23.4° and 5°)?',
    tab: 'moon',
    setup: s => { s.lunarDay = 14.8; s.nodeAligned = false; s.includeSunTide = true; },
    syncText: 'Synced to Day 14.8 (Full Moon) with the Moon’s 5.14° orbital tilt visible',
    body: [
      'Earth’s spin axis is tilted 23.44° to its orbit around the Sun, which gives us the seasons and shifts the noon Sun north and south over the year.',
      'Meanwhile, the Moon’s orbit around Earth is tilted by 5.145° to Earth’s orbital plane. Because of that 5.14° tilt, at most New and Full Moons the Moon passes up to 34,470 km above or below Earth’s shadow line. There are roughly two eclipse seasons each year, when the Sun is near the line of nodes. A New or Full Moon near a node can then produce an eclipse.',
    ],
  },
  {
    q: '5. How does it help?',
    tab: 'missions',
    setup: s => { s.mission = 'ch3'; s.ch3Idx = 5; },
    syncText: 'Synced to Chandrayaan-3 Lunar Orbit Insertion (5 August 2023) & ISRO trajectory',
    body: [
      'One law of gravity (F = GMm/r²) explains both the rhythm of the sea at Haji Ali and how ISRO navigates spacecraft across space.',
      'The difference in the Moon’s pull across Earth’s width heaps ocean water into two tidal bulges (with the Sun adding 46% as much). And by firing thrusters at perigee and braking at perilune, Chandrayaan-3 rode Kepler ellipses to the Moon, while Aditya-L1 loops around the Sun–Earth L1 balance point 1.5 million km away.',
    ],
  },
];

App.explorer('sky', {
  mount(stage, { title, close }) {
    const state = {
      tab: 'seasons', // 'seasons' | 'moon' | 'missions' | 'tour'
      doy: 172,       // 21 June default
      hour: 12.0,     // 12:00 noon
      lat: 19.08,     // Mumbai default
      playing: false,
      lunarDay: 3.0,  // waxing crescent default
      nodeAligned: false,
      includeSunTide: true,
      mission: 'ch3', // 'ch3' | 'l1'
      ch3Idx: 0,
      l1Day: 45,
      tourIdx: 0,
    };

    let rafId = 0;
    let lastTick = 0;
    let disposed = false;

    const canvasL = el('canvas', { class: 'xp-canvas', width: 460, height: 340 });
    const canvasR = el('canvas', { class: 'xp-canvas', width: 460, height: 340 });
    const headL = el('p', { class: 'xp-pane-head' });
    const headR = el('p', { class: 'xp-pane-head' });

    const controlsMount = el('div', { class: 'xp-controls' });
    const presetsMount = el('div', { class: 'xp-rungs' });
    const statsMount = el('div', { class: 'xp-stats' });
    const readoutMount = el('div', { class: 'xp-readout', 'aria-live': 'polite' });
    const tourMount = el('div', { class: 'xp-tour', hidden: true });
    const sceneNote=el('p',{class:'explorer-scene-note'});
    const phaseNames=['New','Waxing crescent','First quarter','Waxing gibbous','Full','Waning gibbous','Third quarter','Waning crescent'];
    const phaseLinks=el('div',{class:'sky-phase-links',role:'group','aria-label':'Match the numbered orbit position to the Moon phase',hidden:true});
    const phaseButtons=phaseNames.map((name,i)=>{
      const shape=phaseDisc(i*45);
      const art=`<svg viewBox="-24 -24 48 48" width="48" height="48" aria-hidden="true"><circle r="18" fill="#424b48" stroke="var(--ink)"/><path d="${shape.path}" fill="#eadb9c"/></svg>`;
      return el('button',{type:'button','aria-pressed':'false',onclick:()=>{stopPlay();state.lunarDay=i*SYNODIC_DAYS/8;rebuildControls();updateView(true);}},el('span',{html:art}),el('span',{},`${i+1} · ${name}`));
    });
    phaseLinks.append(...phaseButtons);

    const TABS = [
      { id: 'seasons', label: 'From space & Mumbai rooftop' },
      { id: 'moon', label: 'Moon phases, eclipses & ideal tides' },
      { id: 'missions', label: 'Missions (Chandrayaan-3 & Aditya-L1)' },
      { id: 'tour', label: 'Explain it step by step (5 questions)' },
    ];

    const tabBtns = TABS.map(t =>
      el('button', {
        type: 'button',
        class: 'xp-tab',
        'data-tab': t.id,
        'aria-pressed': t.id === state.tab ? 'true' : 'false',
        onclick: () => switchTab(t.id),
      }, t.label)
    );

    function stopPlay() {
      state.playing = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      const pb = controlsMount.querySelector('[data-role="play"]');
      if (pb) pb.textContent = 'Play';
    }

    function startPlay() {
      if (state.playing) { stopPlay(); return; }
      state.playing = true;
      const pb = controlsMount.querySelector('[data-role="play"]');
      if (pb) pb.textContent = 'Pause';
      lastTick = performance.now();
      const step = now => {
        if (!state.playing) return;
        const dt = Math.min(0.1, (now - lastTick) / 1000);
        lastTick = now;
        const activeMode = state.tab === 'tour' ? SKY_TOUR[state.tourIdx].tab : state.tab;
        if (activeMode === 'seasons') {
          state.hour = (state.hour + dt * 2.4) % 24;
          const hSlider = controlsMount.querySelector('[data-slider="hour"]');
          if (hSlider) hSlider.value = state.hour.toFixed(2);
        } else if (activeMode === 'moon') {
          state.lunarDay = (state.lunarDay + dt * 1.2) % SYNODIC_DAYS;
          const mSlider = controlsMount.querySelector('[data-slider="lunar"]');
          if (mSlider) mSlider.value = state.lunarDay.toFixed(2);
        } else if (activeMode === 'missions' && state.mission === 'l1') {
          state.l1Day = (state.l1Day + dt * 25) % 365;
          const lSlider = controlsMount.querySelector('[data-slider="l1"]');
          if (lSlider) lSlider.value = Math.round(state.l1Day);
        }
        updateView(false);
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    }

    function switchTab(id) {
      stopPlay();
      state.tab = id;
      tabBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === id)));
      if (id === 'tour') {
        tourMount.hidden = false;
        setTourStep(state.tourIdx);
      } else {
        tourMount.hidden = true;
        rebuildControls();
        updateView(true);
      }
    }

    function setTourStep(idx) {
      stopPlay();
      state.tourIdx = idx;
      const st = SKY_TOUR[idx];
      st.setup(state);
      rebuildControls();
      updateView(true);

      const stepPills = TOUR_STEPS_UI();
      tourMount.replaceChildren(
        el('div', { class: 'xp-tour-head' },
          el('p', { class: 'xp-tour-kicker' }, 'Understand the sky · 5-question guided tour')
        ),
        el('div', { class: 'xp-tour-steps' }, stepPills),
        el('h4', { class: 'xp-tour-q' }, st.q),
        el('div', { class: 'xp-tour-a' }, ...st.body.map(p => el('p', {}, p))),
        el('div', { class: 'xp-tour-sync' },
          el('span', {}, st.syncText),
          el('button', {
            type: 'button',
            class: 'xp-btn',
            onclick: () => { st.setup(state); rebuildControls(); updateView(true); },
          }, 'Re-sync view')
        ),
        el('div', { class: 'xp-tour-nav' },
          el('button', {
            type: 'button',
            class: 'xp-btn',
            disabled: idx === 0,
            onclick: () => setTourStep(Math.max(0, idx - 1)),
          }, '← Previous question'),
          el('button', {
            type: 'button',
            class: 'xp-btn',
            disabled: idx === SKY_TOUR.length - 1,
            onclick: () => setTourStep(Math.min(SKY_TOUR.length - 1, idx + 1)),
          }, 'Next question →')
        )
      );
    }

    function TOUR_STEPS_UI() {
      return SKY_TOUR.map((s, i) =>
        el('button', {
          type: 'button',
          class: 'xp-step-pill',
          'aria-current': i === state.tourIdx ? 'step' : 'false',
          onclick: () => setTourStep(i),
        }, s.q)
      );
    }

    function activeMode() {
      return state.tab === 'tour' ? SKY_TOUR[state.tourIdx].tab : state.tab;
    }

    function rebuildControls() {
      const mode = activeMode();
      presetsMount.replaceChildren();
      controlsMount.replaceChildren();

      if (mode === 'seasons') {
        const datePresets = [
          { label: 'Perihelion (3 Jan)', doy: 3 },
          { label: 'March Equinox (20 Mar)', doy: 79 },
          { label: 'Zero-shadow (~15 May)', doy: 135 },
          { label: 'June Solstice (21 Jun)', doy: 172 },
          { label: 'Zero-shadow (~28 Jul)', doy: 209 },
          { label: 'Sept Equinox (22 Sep)', doy: 265 },
          { label: 'Dec Solstice (21 Dec)', doy: 355 },
        ];
        datePresets.forEach(p => {
          presetsMount.append(el('button', {
            type: 'button',
            class: 'xp-rung',
            'data-doy': p.doy,
            'aria-pressed': Math.abs(state.doy - p.doy) <= 2 ? 'true' : 'false',
            onclick: () => { stopPlay(); state.doy = p.doy; rebuildControls(); updateView(true); },
          }, p.label));
        });

        const doyOut = el('output', { 'data-out': 'doy' }, dayToDateStr(state.doy));
        const doySlider = el('input', {
          type: 'range', min: 1, max: 365, step: 1, value: state.doy, 'data-slider': 'doy',
          'aria-label': 'Day of the year',
          oninput: e => { state.doy = +e.target.value; updateView(false); },
        });

        const hrOut = el('output', { 'data-out': 'hour' }, fmtHours(state.hour));
        const hrSlider = el('input', {
          type: 'range', min: 0, max: 24, step: 0.1, value: state.hour, 'data-slider': 'hour',
          'aria-label': 'Solar time of day in hours',
          oninput: e => { stopPlay(); state.hour = +e.target.value; updateView(false); },
        });

        const playBtn = el('button', {
          type: 'button', class: 'xp-btn', 'data-role': 'play', onclick: startPlay,
        }, state.playing ? 'Pause' : 'Play day');

        controlsMount.append(
          el('div', { class: 'xp-slider' }, el('label', {}, 'Date'), doySlider, doyOut),
          el('div', { class: 'xp-slider' }, el('label', {}, 'Mumbai time'), hrSlider, hrOut),
          playBtn
        );
      } else if (mode === 'moon') {
        const phasePresets = [
          { label: 'New Moon (Day 0)', day: 0 },
          { label: 'Waxing Crescent (Day 3.5)', day: 3.5 },
          { label: 'First Quarter (Day 7.4)', day: 7.4 },
          { label: 'Full Moon (Day 14.8)', day: 14.8 },
          { label: 'Third Quarter (Day 22.1)', day: 22.1 },
        ];
        phasePresets.forEach(p => {
          presetsMount.append(el('button', {
            type: 'button',
            class: 'xp-rung',
            'data-lday': p.day,
            'aria-pressed': Math.abs(state.lunarDay - p.day) < 0.8 ? 'true' : 'false',
            onclick: () => { stopPlay(); state.lunarDay = p.day; rebuildControls(); updateView(true); },
          }, p.label));
        });

        const lOut = el('output', { 'data-out': 'lunar' }, `Day ${state.lunarDay.toFixed(1)}`);
        const lSlider = el('input', {
          type: 'range', min: 0, max: 29.5, step: 0.1, value: state.lunarDay, 'data-slider': 'lunar',
          'aria-label': 'Day of the lunar month (0 to 29.5)',
          oninput: e => { stopPlay(); state.lunarDay = +e.target.value; updateView(false); },
        });

        const nodeBtn = el('button', {
          type: 'button',
          class: 'xp-btn',
          'aria-pressed': String(state.nodeAligned),
          onclick: () => { state.nodeAligned = !state.nodeAligned; rebuildControls(); updateView(true); },
        }, state.nodeAligned ? 'Node line-up: ON (eclipse season)' : '5.14° tilt: typical month (no eclipse)');

        const sunTideBtn = el('button', {
          type: 'button',
          class: 'xp-btn',
          'aria-pressed': String(state.includeSunTide),
          onclick: () => { state.includeSunTide = !state.includeSunTide; rebuildControls(); updateView(true); },
        }, state.includeSunTide ? 'Sun tide (0.46×): ON' : 'Sun tide (0.46×): OFF');

        const playBtn = el('button', {
          type: 'button', class: 'xp-btn', 'data-role': 'play', onclick: startPlay,
        }, state.playing ? 'Pause' : 'Play month');

        controlsMount.append(
          el('div', { class: 'xp-slider' }, el('label', {}, 'Lunar month'), lSlider, lOut),
          el('div', { class: 'xp-btn-group' }, playBtn, nodeBtn, sunTideBtn)
        );
      } else if (mode === 'missions') {
        const btnCh3 = el('button', {
          type: 'button',
          class: 'xp-btn',
          'aria-pressed': String(state.mission === 'ch3'),
          onclick: () => { stopPlay(); state.mission = 'ch3'; rebuildControls(); updateView(true); },
        }, 'Chandrayaan-3 (July–Aug 2023)');
        const btnL1 = el('button', {
          type: 'button',
          class: 'xp-btn',
          'aria-pressed': String(state.mission === 'l1'),
          onclick: () => { stopPlay(); state.mission = 'l1'; rebuildControls(); updateView(true); },
        }, 'Aditya-L1 (Sun–Earth L1 halo orbit)');

        presetsMount.append(btnCh3, btnL1);

        if (state.mission === 'ch3') {
          CH3_STEPS.forEach((st, idx) => {
            presetsMount.append(el('button', {
              type: 'button',
              class: 'xp-rung',
              'aria-pressed': String(state.ch3Idx === idx),
              onclick: () => { state.ch3Idx = idx; rebuildControls(); updateView(true); },
            }, st.name));
          });

          const stepOut = el('output', { 'data-out': 'ch3' }, `${state.ch3Idx + 1} / ${CH3_STEPS.length}`);
          const stepSlider = el('input', {
            type: 'range', min: 0, max: CH3_STEPS.length - 1, step: 1, value: state.ch3Idx,
            'aria-label': 'Chandrayaan-3 mission burn step',
            oninput: e => { state.ch3Idx = +e.target.value; rebuildControls(); updateView(true); },
          });

          controlsMount.append(
            el('div', { class: 'xp-slider' }, el('label', {}, 'Mission step'), stepSlider, stepOut),
            el('div', { class: 'xp-btn-group' },
              el('button', {
                type: 'button', class: 'xp-btn',
                disabled: state.ch3Idx === 0,
                onclick: () => { state.ch3Idx = Math.max(0, state.ch3Idx - 1); rebuildControls(); updateView(true); },
              }, '← Previous burn'),
              el('button', {
                type: 'button', class: 'xp-btn',
                disabled: state.ch3Idx === CH3_STEPS.length - 1,
                onclick: () => { state.ch3Idx = Math.min(CH3_STEPS.length - 1, state.ch3Idx + 1); rebuildControls(); updateView(true); },
              }, 'Next burn →')
            )
          );
        } else {
          const l1Out = el('output', { 'data-out': 'l1' }, `Day ${Math.round(state.l1Day)}`);
          const l1Slider = el('input', {
            type: 'range', min: 0, max: 365, step: 1, value: Math.round(state.l1Day), 'data-slider': 'l1',
            'aria-label': 'Days since Aditya-L1 halo orbit insertion',
            oninput: e => { stopPlay(); state.l1Day = +e.target.value; updateView(false); },
          });
          const playBtn = el('button', {
            type: 'button', class: 'xp-btn', 'data-role': 'play', onclick: startPlay,
          }, state.playing ? 'Pause' : 'Play orbit');

          controlsMount.append(
            el('div', { class: 'xp-slider' }, el('label', {}, 'Mission day'), l1Slider, l1Out),
            playBtn
          );
        }
      }
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
        paper: g('--paper') || '#f6f4ec',
        rule: g('--rule') || '#d5d3c6',
        proton: g('--proton') || '#a94730',
        neutron: g('--neutron') || '#936022',
        electron: g('--electron') || '#356d83',
        green: g('--green') || '#2e604a',
        vol: g('--vol') || '#356d83',
      };
    }

    function prepCanvas(cv) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = cv.clientWidth || 440;
      const cssH = Math.max(270, Math.min(350, Math.round(cssW * 0.72)));
      if (cv.width !== Math.round(cssW * dpr) || cv.height !== Math.round(cssH * dpr)) {
        cv.width = Math.round(cssW * dpr);
        cv.height = Math.round(cssH * dpr);
      }
      const ctx = cv.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);
      return { ctx, W: cssW, H: cssH };
    }

    function drawSeasonsMode(col) {
      const dec = solarDeclination(state.doy);
      const dist = earthSunDistMkm(state.doy);
      const noonAlt = 90 - Math.abs(MUMBAI_LAT - dec);
      const leansNorth = dec > MUMBAI_LAT;
      const dayLen = dayLengthHours(MUMBAI_LAT, dec);
      const { alt: curAlt } = sunPositionAtHour(MUMBAI_LAT, dec, state.hour);

      headL.replaceChildren(el('b', {}, '1 · Sunlight reaches tilted Earth'), el('span', {}, `Distance: ${dist.toFixed(1)} million km`));
      headR.replaceChildren(el('b', {}, curAlt<0?'2 · Mumbai’s northern night sky':'2 · The same beam at Mumbai noon'), el('span', {}, curAlt<0?`${fmtHours(state.hour)} solar time · Sun below horizon`:`Noon Sun: ${noonAlt.toFixed(1)}°`));

      // Two large linked views replace the cramped orbit/tilt/dome mini-panels.
      {
        const {ctx,W,H}=prepCanvas(canvasL);ctx.fillStyle=col.plate;ctx.fillRect(0,0,W,H);
        const text=(v,x,y,align='center',colour=col.ink,size=13)=>{ctx.fillStyle=colour;ctx.font=`500 ${size}px Lexend,system-ui`;ctx.textAlign=align;ctx.fillText(v,x,y);};
        const cx=W*.5,cy=H*.46,rx=Math.min(W*.31,H*.35),ry=rx*.58;
        ctx.strokeStyle=col.rule;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle=col.neutron;ctx.beginPath();ctx.arc(cx,cy,15,0,Math.PI*2);ctx.fill();text('Sun',cx,cy+32);
        text('June',cx-rx,cy-ry-18);text('December',cx+rx,cy-ry-18);text('March',cx,cy-ry-18);text('September',cx,cy+ry+35);
        const a=((state.doy-355)/365)*Math.PI*2,ex=cx+Math.cos(a)*rx,ey=cy-Math.sin(a)*ry;
        const tilt=OBLIQUITY*Math.PI/180;
        for(const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
          const x=cx+Math.cos(angle)*rx,y=cy-Math.sin(angle)*ry;ctx.fillStyle=col.sheet;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col.electron;ctx.stroke();ctx.strokeStyle=col.proton;ctx.beginPath();ctx.moveTo(x-Math.sin(tilt)*19,y+Math.cos(tilt)*19);ctx.lineTo(x+Math.sin(tilt)*19,y-Math.cos(tilt)*19);ctx.stroke();
        }
        ctx.strokeStyle=col.neutron;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();
        ctx.fillStyle=col.electron;ctx.beginPath();ctx.arc(ex,ey,11,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=col.proton;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ex-Math.sin(tilt)*21,ey+Math.cos(tilt)*21);ctx.lineTo(ex+Math.sin(tilt)*21,ey-Math.cos(tilt)*21);ctx.stroke();
        text('1',ex,ey-29,'center',col.neutron,16);text('Axis keeps the same direction',W/2,H-31,'center',col.proton,13);text('Orbit overview: sizes enlarged',W/2,H-12,'center',col.muted,12);
        ctx.restore();
      }
      {
        const {ctx,W,H}=prepCanvas(canvasR);ctx.fillStyle=col.plate;ctx.fillRect(0,0,W,H);
        const text=(v,x,y,align='center',colour=col.ink,size=13)=>{ctx.fillStyle=colour;ctx.font=`500 ${size}px Lexend,system-ui`;ctx.textAlign=align;ctx.fillText(v,x,y);};
        if(curAlt<0){
          const horizon=H*.78,poleX=W*.5,poleY=horizon-Math.sin(MUMBAI_LAT*Math.PI/180)*H*.6;
          text('Looking north · Mumbai',W/2,25,'center',col.ink,13);
          text('Each arc traces one hour (15°)',W/2,46,'center',col.electron,12);
          ctx.save();ctx.beginPath();ctx.rect(15,56,W-30,horizon-56);ctx.clip();
          ctx.strokeStyle=col.electron;ctx.lineWidth=2;
          for(let i=0;i<18;i++){
            const r=22+(i%6)*19,a=i*2.39996+state.hour*Math.PI/12;
            ctx.globalAlpha=.45+(i%3)*.2;ctx.beginPath();ctx.arc(poleX,poleY,r,a-Math.PI/12,a);ctx.stroke();
            ctx.fillStyle=col.electron;ctx.beginPath();ctx.arc(poleX+r*Math.cos(a),poleY+r*Math.sin(a),2,0,Math.PI*2);ctx.fill();
          }
          ctx.globalAlpha=1;ctx.restore();
          ctx.strokeStyle=col.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(20,horizon);ctx.lineTo(W-20,horizon);ctx.stroke();
          ctx.fillStyle=col.proton;ctx.beginPath();ctx.arc(poleX,poleY,3,0,Math.PI*2);ctx.fill();
          text('North celestial pole',poleX,poleY-13,'center',col.proton,12);
          text('19.08° above the north horizon',W/2,horizon+23,'center',col.muted,12);
          text('Change the clock to turn the trails',W/2,H-16,'center',col.muted,12);
        }else{
        const roofY=H*.6,gx=W*.47,stick=37;
        // A local meridian section at noon: geography and compass direction stay explicit.
        const zenith=W*.5,sunRad=noonAlt*Math.PI/180,reach=Math.min(W*.38,H*.31),sx=zenith+(leansNorth?-1:1)*Math.cos(sunRad)*reach,sy=roofY-Math.sin(sunRad)*reach;
        ctx.fillStyle=col.neutron;ctx.beginPath();ctx.arc(sx,sy,11,0,Math.PI*2);ctx.fill();
        text('2  noon sunlight',W/2,25,'center',col.neutron,13);
        text(`${fmtHours(state.hour)}: Sun ${curAlt.toFixed(0)}° high`,W/2,46,'center',col.electron,12);
        ctx.fillStyle=col.sheet;ctx.fillRect(22,roofY,W-44,40);ctx.strokeStyle=col.ink;ctx.strokeRect(22,roofY,W-44,40);
        for(let x=36;x<W-30;x+=28){ctx.strokeStyle=col.rule;ctx.beginPath();ctx.moveTo(x,roofY+13);ctx.lineTo(x+10,roofY+40);ctx.stroke();}
        ctx.strokeStyle=col.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,roofY);ctx.lineTo(gx,roofY-stick);ctx.stroke();
        const shadowDirection=leansNorth?1:-1,shadow=stick/Math.tan(sunRad);
        ctx.strokeStyle=col.proton;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(gx,roofY+2);ctx.lineTo(gx+shadowDirection*shadow,roofY+2);ctx.stroke();
        const dx=gx-sx,dy=roofY-sy,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
        ctx.strokeStyle=col.neutron;ctx.lineWidth=2;for(const off of [-10,0,10]){ctx.beginPath();ctx.moveTo(sx+off*uy,sy-off*ux);ctx.lineTo(gx+off*uy,roofY-off*ux);ctx.stroke();}
        text('North',24,roofY+58,'left',col.muted,12);text('South',W-24,roofY+58,'right',col.muted,12);
        // Equal incoming beam width, countable ground footprint. Not a second size scale.
        const spread=1/Math.sin(sunRad),patch=62*spread,px=(W-patch)/2,py=H-44;
        ctx.fillStyle=col.neutron;ctx.globalAlpha=.2;ctx.fillRect(px,py,patch,20);ctx.globalAlpha=1;ctx.strokeStyle=col.neutron;ctx.strokeRect(px,py,patch,20);
        for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(px+i*patch/4,py);ctx.lineTo(px+i*patch/4,py+20);ctx.stroke();}
        text(`1 m beam → ${spread.toFixed(2)} m on ground`,W/2,H-10,'center',col.ink,13);
        }
        ctx.restore();
      }
      sceneNote.textContent=curAlt<0?'The northern sky rotates around a pole 19.08° above Mumbai’s horizon. Each blue arc traces one hour, or approximately 15°. Moving the clock rotates all the arcs together. Trail radii and star locations are schematic. The space view keeps the selected date.':`Follow the ochre light in views 1 and 2. At noon it reaches Mumbai at ${noonAlt.toFixed(1)}°, lighting ${ (1/Math.sin(noonAlt*Math.PI/180)).toFixed(2)} m of ground for a 1 m-wide beam. The rooftop is a north–south section; the Sun is ${leansNorth?'north':'south'} of zenith. The red line is the stick’s shadow. Sizes and the orbit perspective are schematic.`;

      // Stats & Readout
      const patchW = 1 / Math.sin(noonAlt * Math.PI / 180);
      statsMount.replaceChildren(
        el('div', { class: 'xp-stat' },
          el('span', { class: 'xp-stat-k' }, 'Mumbai noon Sun height'),
          el('span', { class: 'xp-stat-v' }, `${noonAlt.toFixed(1)}° (${leansNorth ? 'north' : 'south'} of zenith)`),
          el('span', { class: 'xp-stat-sub' }, `1.00 m beam lights ${patchW.toFixed(2)} m of ground`)
        ),
        el('div', { class: 'xp-stat' },
          el('span', { class: 'xp-stat-k' }, 'Day length & star trails'),
          el('span', { class: 'xp-stat-v' }, `${dayLen.toFixed(2)} hours of daylight`),
          el('span', { class: 'xp-stat-sub' }, `Sky turns 15°/hour (${fmtHours(state.hour)} local solar time)`)
        ),
        el('div', { class: 'xp-stat' },
          el('span', { class: 'xp-stat-k' }, 'Earth–Sun distance'),
          el('span', { class: 'xp-stat-v' }, `${dist.toFixed(1)} million km`),
          el('span', { class: 'xp-stat-sub' }, state.doy < 30 || state.doy > 345 ? 'Near perihelion (closest in Jan!)' : state.doy > 160 && state.doy < 200 ? 'Near aphelion (farthest in Jul!)' : 'Elliptical orbit (e = 0.0167)')
        )
      );

      readoutMount.replaceChildren(
        el('p', {},
          el('b', {}, `${dayToDateStr(state.doy)} at ${fmtHours(state.hour)} in Mumbai (19.08° N): `),
          `The Sun’s declination is ${dec >= 0 ? '+' : ''}${dec.toFixed(1)}°, so at noon the Sun reaches `,
          el('b', {}, `${noonAlt.toFixed(1)}° above the ${leansNorth ? 'northern' : 'southern'} horizon`),
          noonAlt > 89.2
            ? ' (a Mumbai zero-shadow day: vertical posts cast no shadow at local noon!).'
            : `. A 1.00 m wide sunbeam spreads over ${patchW.toFixed(2)} m of flat ground, and daylight lasts ${dayLen.toFixed(1)} hours.`
        ),
        el('p', {},
          `Earth is `,
          el('b', {}, `${dist.toFixed(1)} million km`),
          ` from the Sun today. Remember Chapter 14.2: Earth is closest to the Sun (147.1 million km) around 3 January and farthest (152.1 million km) in early July, so distance does not cause the seasons. The 23.44° axial tilt changes both the noon beam angle and the hours of daylight.`
        ),
        el('p', { class: 'xp-honest' },
          'Model note: The orbit’s 1.7% eccentricity looks almost circular at true scale, so the exact distance in million km is printed in the readout. Slide the time into night to see Mumbai’s star trails turning at 15° per hour around the North Celestial Pole (19.08° up).'
        )
      );
    }

    function drawMoonTidesMode(col) {
      const phaseAngle = (state.lunarDay / SYNODIC_DAYS) * Math.PI * 2;
      const litFrac = (1 - Math.cos(phaseAngle)) / 2;
      const degPerDay = 360 / SYNODIC_DAYS; // 12.19 deg/day

      // Phase name
      const d = state.lunarDay % SYNODIC_DAYS;
      let phaseName = 'Waxing Crescent';
      if (d < 1.0 || d > 28.5) phaseName = 'New Moon';
      else if (Math.abs(d - 7.4) < 1.1) phaseName = 'First Quarter';
      else if (d > 7.4 && d < 13.7) phaseName = 'Waxing Gibbous';
      else if (Math.abs(d - 14.8) < 1.1) phaseName = 'Full Moon';
      else if (d > 15.8 && d < 21.0) phaseName = 'Waning Gibbous';
      else if (Math.abs(d - 22.1) < 1.1) phaseName = 'Third Quarter';
      else if (d > 22.1) phaseName = 'Waning Crescent';

      // Height of Moon above/below ecliptic plane (km): 384,400 * sin(5.145 deg) * sin(angle from node)
      const maxZ = 384400 * Math.sin(MOON_TILT * Math.PI / 180); // ~34,472 km
      const zKm = state.nodeAligned ? 0 : Math.round(maxZ * Math.cos(phaseAngle));
      const isNew = d < 1.1 || d > 28.4;
      const isFull = Math.abs(d - 14.8) < 1.1;
      const eclipseState = state.nodeAligned && isNew
        ? 'Solar eclipse! (Moon’s shadow hits Earth)'
        : state.nodeAligned && isFull
          ? 'Lunar eclipse! (Moon enters Earth’s umbra)'
          : (isNew || isFull)
            ? `No eclipse: 5.14° tilt places Moon ~${Math.abs(zKm).toLocaleString('en-GB')} km off the shadow line`
            : 'Not aligned with Sun–Earth line';

      headL.replaceChildren(
        el('b', {}, `Moon phase (${phaseName}) & 5.14° tilt`),
        el('span', {}, `${Math.round(litFrac * 100)}% lit from Mumbai`)
      );
      headR.replaceChildren(
        el('b', {}, 'Ideal tides (Moon 1 : Sun 0.46)'),
        el('span', {}, 'A teaching model, not a Haji Ali tide forecast')
      );

      // LEFT CANVAS: Moon orbit, phase disc, tidal bulges, and 5.14° tilt side-view
      {
        const { ctx, W, H } = prepCanvas(canvasL);
        ctx.fillStyle = col.plate;
        ctx.fillRect(0, 0, W, H);

        const cx = W * 0.42, cy = H * 0.42;
        const orbR = Math.min(W, H) * 0.27;

        // Sunlight arrows from left
        ctx.strokeStyle = col.neutron;
        ctx.lineWidth = 1.3;
        for (let y = cy - orbR * 0.8; y <= cy + orbR * 0.8; y += orbR * 0.4) {
          ctx.beginPath();
          ctx.moveTo(10, y);
          ctx.lineTo(28, y);
          ctx.stroke();
        }
        ctx.fillStyle = col.neutron;
        ctx.font = `600 11.5px "Lexend", system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText('Sunlight', 8, cy - orbR * 0.92);

        // Schematic tidal bulges around Earth (Moon 1 : Sun 0.46)
        const sunAmp = state.includeSunTide ? 0.46 : 0;
        ctx.fillStyle = col.electron;
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.06) {
          const mTerm = Math.cos(2 * (a - (Math.PI - phaseAngle)));
          const sTerm = sunAmp * Math.cos(2 * (a - Math.PI));
          const r = 18 + 7 * (mTerm + sTerm);
          const x = cx + Math.cos(a) * r;
          const y = cy - Math.sin(a) * r;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Earth at centre
        ctx.fillStyle = col.electron;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = col.ink;
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Earth's shadow cone extending right (away from Sun)
        ctx.fillStyle = col.ink;
        ctx.globalAlpha = 0.12;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 14);
        ctx.lineTo(cx + orbR + 28, cy - 5);
        ctx.lineTo(cx + orbR + 28, cy + 5);
        ctx.lineTo(cx, cy + 14);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Moon orbit
        ctx.strokeStyle = col.rule;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Match orbit positions to the observed phase sequence, without confusing shadow with night.
        for(let k=0;k<8;k++){
          const a=Math.PI-k*Math.PI/4,x=cx+Math.cos(a)*orbR,y=cy-Math.sin(a)*orbR;
          ctx.fillStyle=col.plate;ctx.strokeStyle=col.rule;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.stroke();
          ctx.fillStyle=col.ink;ctx.font='600 12px Lexend,system-ui';ctx.textAlign='center';ctx.fillText(String(k+1),x+Math.cos(a)*15,y-Math.sin(a)*15+4);
        }

        // Moon position (New Moon at left = angle pi, facing Sun)
        const mAngle = Math.PI - phaseAngle;
        const mx = cx + Math.cos(mAngle) * orbR;
        const my = cy - Math.sin(mAngle) * orbR;

        // Half-lit Moon in space (left half always lit by Sun!)
        ctx.fillStyle = col.neutron;
        ctx.beginPath();
        ctx.arc(mx, my, 9, Math.PI / 2, (3 * Math.PI) / 2);
        ctx.fill();
        ctx.fillStyle = col.ink;
        ctx.beginPath();
        ctx.arc(mx, my, 9, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        // Top-right inset: How the Moon looks from Mumbai
        const px = W * 0.84, py = 58, pr = 26;
        ctx.strokeStyle = col.rule;
        ctx.strokeRect(W * 0.7, 12, W * 0.27, 96);
        ctx.font = `700 10px "Lexend", system-ui, sans-serif`;
        ctx.fillStyle = col.ink2;
        ctx.textAlign = 'center';
        ctx.fillText('From Mumbai', px, 26);

        // Draw Moon phase disc accurately
        ctx.fillStyle = col.ink;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();

        const isWaxing = (phaseAngle % (Math.PI * 2)) <= Math.PI;
        const k = Math.cos(phaseAngle); // +1 at New, 0 at Quarter, -1 at Full
        ctx.fillStyle = state.nodeAligned && isFull ? col.proton : col.neutron;
        ctx.beginPath();
        ctx.arc(px, py, pr, -Math.PI / 2, Math.PI / 2, !isWaxing);
        ctx.ellipse(px, py, Math.abs(k) * pr, pr, 0, Math.PI / 2, -Math.PI / 2, isWaxing ? k > 0 : k < 0);
        ctx.closePath();
        ctx.fill();

        // Bottom strip: Side view of the 5.14° orbital tilt vs Earth–Sun plane
        const sy = H - 38;
        ctx.strokeStyle = col.rule;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(16, sy);
        ctx.lineTo(W - 16, sy);
        ctx.stroke();

        const tiltSlope = state.nodeAligned ? 0 : Math.sin(MOON_TILT * Math.PI / 180) * 180;
        ctx.strokeStyle = col.proton;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx - orbR, sy - tiltSlope);
        ctx.lineTo(cx + orbR, sy + tiltSlope);
        ctx.stroke();

        const sideMoonX = cx + Math.cos(mAngle) * orbR;
        const sideMoonY = sy - Math.cos(mAngle) * tiltSlope;
        ctx.fillStyle = col.proton;
        ctx.beginPath();
        ctx.arc(sideMoonX, sideMoonY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `600 12px "Lexend", system-ui, sans-serif`;
        ctx.fillStyle = col.ink2;
        ctx.textAlign = 'left';
        ctx.fillText(`Side view (5.14° tilt): ${eclipseState}`, 16, H - 10);

        ctx.restore();
      }

      // RIGHT CANVAS: ideal 29.5-day tide strip chart + selected model-day detail
      {
        const { ctx, W, H } = prepCanvas(canvasR);
        ctx.fillStyle = col.plate;
        ctx.fillRect(0, 0, W, H);

        const padL = 38, padR = 16, topY = 34, midY = H * 0.36, botY = H - 36;
        const plotW = W - padL - padR;

        // Top half: 29.5-day Spring-Neap envelope strip chart
        ctx.font = `700 10.5px "Lexend", system-ui, sans-serif`;
        ctx.fillStyle = col.ink2;
        ctx.textAlign = 'left';
        ctx.fillText('Ideal 29.5-day spring–neap cycle', padL, 20);

        const envMid = (topY + midY) * 0.52;
        const envAmp = (midY - topY) * 0.38;
        const sunR = state.includeSunTide ? 0.46 : 0;

        ctx.strokeStyle = col.rule;
        ctx.beginPath();
        ctx.moveTo(padL, envMid);
        ctx.lineTo(padL + plotW, envMid);
        ctx.stroke();

        ctx.strokeStyle = col.electron;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        const samples = 240;
        for (let i = 0; i <= samples; i++) {
          const day = (i / samples) * SYNODIC_DAYS;
          const x = padL + (i / samples) * plotW;
          const env = (1 + sunR * Math.cos((2 * Math.PI * 2 * day) / SYNODIC_DAYS)) / 1.46;
          const carrier = Math.cos((2 * Math.PI * 2 * day) / 1.035);
          const y = envMid - carrier * env * envAmp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Marker for current lunarDay
        const curX = padL + (state.lunarDay / SYNODIC_DAYS) * plotW;
        ctx.strokeStyle = col.proton;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(curX, topY - 4);
        ctx.lineTo(curX, midY + 4);
        ctx.stroke();

        // Labels for Spring / Neap
        ctx.font = `600 11.5px "Lexend", system-ui, sans-serif`;
        ctx.fillStyle = col.muted;
        ctx.textAlign = 'center';
        ctx.fillText('New', padL + 24, midY + 14);
        ctx.fillText('1st Q', padL + plotW * 0.25, midY + 14);
        ctx.fillText('Full', padL + plotW * 0.5, midY + 14);
        ctx.fillText('3rd Q', padL + plotW * 0.75, midY + 14);

        // Bottom half: relative water level over one ideal lunar day
        const dTop = midY + 34;
        const dMid = (dTop + botY) * 0.5;
        const dAmp = (botY - dTop) * 0.42;
        const curEnv = (1 + sunR * Math.cos(2 * phaseAngle)) / 1.46;
        const shiftHrs = (state.lunarDay * (50 / 60)) % 12.42;

        // Relative mean level, not a measured causeway threshold
        ctx.strokeStyle = col.neutron;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(padL, dMid);
        ctx.lineTo(padL + plotW, dMid);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = col.neutron;
        ctx.font = `600 11.5px "Lexend", system-ui, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText('Mean water level', padL + plotW - 4, dMid - 4);

        // Today's 24h curve (2 highs, 12 h 25 min apart)
        ctx.strokeStyle = col.green;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let h = 0; h <= 24.84; h += 0.2) {
          const x = padL + (h / 24.84) * plotW;
          const y = dMid - Math.cos(((h - shiftHrs) / 12.42) * Math.PI * 2) * curEnv * dAmp;
          if (h === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = col.ink2;
        ctx.font = `600 12px "Lexend", system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(
          `Model highs: ~12 h 25 min apart`,
          padL, H - 12
        );

        ctx.restore();
      }

      sceneNote.textContent=`Numbered orbit positions: 1 new → 2 waxing crescent → 3 first quarter → 4 waxing gibbous → 5 full → 6 waning gibbous → 7 third quarter → 8 waning crescent. Current position ${Math.round((state.lunarDay/SYNODIC_DAYS)*8)%8+1}. Each Moon has a sunlit half and its own night; the grey cone behind Earth is Earth’s shadow, a different thing. The shape seen from Mumbai is an idealised orientation, not the exact sky rotation.`;
      const tideStrength = state.includeSunTide
        ? (1 + 0.46 * Math.cos(2 * phaseAngle))
        : 1.0;
      const tideKind = !state.includeSunTide
        ? 'Moon bulge only (1.00×)'
        : tideStrength > 1.25
          ? `Spring tide (${tideStrength.toFixed(2)}× Moon alone: Sun & Moon add)`
          : tideStrength < 0.75
            ? `Neap tide (${tideStrength.toFixed(2)}× Moon alone: Sun & Moon partly cancel)`
            : `Intermediate tide (${tideStrength.toFixed(2)}× Moon alone)`;

      const riseDelayHrs = (state.lunarDay * (49 / 60)) % 24;

      statsMount.replaceChildren(
        el('div', { class: 'xp-stat' },
          el('span', { class: 'xp-stat-k' }, 'Moon phase & lit fraction'),
          el('span', { class: 'xp-stat-v' }, `${phaseName} (${Math.round(litFrac * 100)}% lit)`),
          el('span', { class: 'xp-stat-sub' }, `Rises ~${riseDelayHrs.toFixed(1)} h after sunrise (49 min later/day)`)
        ),
        el('div', { class: 'xp-stat' },
          el('span', { class: 'xp-stat-k' }, '5.14° orbital tilt & eclipses'),
          el('span', { class: 'xp-stat-v' }, state.nodeAligned ? 'At node (0 km off plane)' : `${zKm >= 0 ? '+' : ''}${zKm.toLocaleString('en-GB')} km from plane`),
          el('span', { class: 'xp-stat-sub' }, eclipseState)
        ),
        el('div', { class: 'xp-stat' },
          el('span', { class: 'xp-stat-k' }, 'Ideal tidal bulges'),
          el('span', { class: 'xp-stat-v' }, tideKind),
          el('span', { class: 'xp-stat-sub' }, 'Two highs per lunar day in this model')
        )
      );

      readoutMount.replaceChildren(
        el('p', {},
          el('b', {}, `Day ${state.lunarDay.toFixed(1)} of 29.5 (${phaseName}, ${Math.round(litFrac * 100)}% lit): `),
          `Half of the Moon is always lit by the Sun. Phases are never caused by Earth’s shadow; they are simply how much of the Moon’s sunlit hemisphere faces us as the Moon orbits Earth.`
        ),
        el('p', {},
          el('b', {}, 'Why isn’t there an eclipse every month? '),
          `Because the Moon’s orbit is tilted by `,
          el('b', {}, '5.145°'),
          ` to Earth’s orbit. At 384,400 km distance, that tilt carries the Moon up to 34,470 km above or below Earth’s 1.4-million-km shadow cone. Toggle `,
          el('b', {}, 'Node line-up'),
          ` above to see what happens during an eclipse season.`
        ),
        el('p', { class: 'xp-honest' },
          'Model note: This is an ideal equilibrium-tide model, not a forecast of water height or causeway access at Haji Ali. The tidal bulges are drawn thousands of times taller than life (on an all-water Earth they would be under 1 metre high) and result from water flowing sideways under the difference in gravitational pull (Moon 1 : Sun 0.46). Real tides at Mumbai are mixed semi-diurnal and lag the Moon because of coastlines and ocean depth; always check a published INCOIS tide table before visiting the Haji Ali causeway.'
        )
      );
    }

    function drawMissionsMode(col) {
      sceneNote.textContent=state.mission==='l1'?'The halo is an oblique view of a three-dimensional path. The dotted projection shows its depth relative to the Sun–Earth line. L1 is a location, not a massive object; the orbit shape is schematic.':'Each panel has its own labelled distance scale. The selected Earth or lunar orbit retains its actual eccentricity and places the central body at a focus.';
      if (state.mission === 'ch3') {
        const st = CH3_STEPS[state.ch3Idx];
        const earthStep = CH3_STEPS[Math.min(state.ch3Idx, 4)];
        const moonStep = state.ch3Idx === 8
          ? { body: 'Moon', peri: 25, apo: 134, date: '23 Aug 2023' }
          : CH3_STEPS[Math.max(5, state.ch3Idx)];
        headL.replaceChildren(
          el('b', {}, `Earth orbit · ${earthStep.date}`),
          el('span', {}, `${earthStep.peri.toLocaleString('en-GB')} × ${earthStep.apo.toLocaleString('en-GB')} km above Earth`)
        );
        headR.replaceChildren(
          el('b', {}, `${state.ch3Idx < 5 ? 'Later: lunar capture' : state.ch3Idx === 8 ? 'Before landing: descent orbit' : 'Moon orbit'} · ${moonStep.date}`),
          el('span', {}, `${moonStep.peri.toLocaleString('en-GB')} × ${moonStep.apo.toLocaleString('en-GB')} km above the Moon`)
        );

        function drawMissionOrbit(canvas, orbitStep, bodyRadiusKm, bodyColour, landing = false) {
          const { ctx, W, H } = prepCanvas(canvas);
          const o = fitMissionOrbit(orbitStep.peri, orbitStep.apo, bodyRadiusKm, W, H);
          canvas.setAttribute('aria-label', `${orbitStep.body} at a focus of the ${orbitStep.peri} by ${orbitStep.apo} kilometre orbit. True shape and body size; each selected orbit is resized to fit.`);
          ctx.fillStyle = col.plate;
          ctx.fillRect(0, 0, W, H);
          ctx.strokeStyle = orbitStep.body === st.body ? col.proton : col.electron;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(o.cx, o.cy, o.a, o.b, 0, 0, Math.PI * 2);
          ctx.stroke();

          // One common scale for the central body and every point on this orbit.
          ctx.fillStyle = bodyColour;
          ctx.globalAlpha = 0.23;
          ctx.beginPath();
          ctx.arc(o.focusX, o.focusY, o.bodyRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = bodyColour;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = col.ink;
          ctx.beginPath();
          ctx.arc(o.focusX, o.focusY, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = `600 12px "Lexend", system-ui, sans-serif`;
          ctx.textAlign = o.focusX < 80 ? 'left' : 'center';
          ctx.fillText(`${orbitStep.body} at a focus`, Math.max(14, o.focusX), o.focusY + o.bodyRadius + 18);

          // Orbit direction at the top is tangent to the ellipse. The nearest
          // point is marked separately; the body is not at the ellipse centre.
          const topY = o.cy - o.b;
          ctx.strokeStyle = col.ink2;
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(o.cx - 12, topY); ctx.lineTo(o.cx + 12, topY); ctx.stroke();
          ctx.fillStyle = col.ink2;
          ctx.beginPath(); ctx.moveTo(o.cx + 12, topY); ctx.lineTo(o.cx + 5, topY - 4); ctx.lineTo(o.cx + 5, topY + 4); ctx.fill();
          ctx.fillStyle = col.proton;
          ctx.beginPath(); ctx.arc(o.cx - o.a, o.cy, 3, 0, Math.PI * 2); ctx.fill();
          ctx.textAlign = 'left';
          ctx.fillText('nearest point', Math.max(14, o.cx - o.a), o.cy - 14);

          if (landing) {
            const lat = 69.37 * Math.PI / 180;
            const lx = o.focusX + Math.cos(lat) * o.bodyRadius;
            const ly = o.focusY + Math.sin(lat) * o.bodyRadius;
            ctx.fillStyle = col.green;
            ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();
            ctx.textAlign = 'center';
            ctx.fillText('Landing: 69.37° S', W / 2, 24);
          }

          // A physical scale bar makes the changing panel magnification explicit.
          const maxKm = W * 0.24 / o.pxPerKm;
          const power = Math.pow(10, Math.floor(Math.log10(maxKm)));
          const km = [1, 2, 5].map(n => n * power).filter(n => n <= maxKm).pop();
          const bar = km * o.pxPerKm, by = H - 32, bx = 24;
          ctx.strokeStyle = col.ink2;
          ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by); ctx.lineTo(bx + bar, by); ctx.lineTo(bx + bar, by - 4); ctx.stroke();
          ctx.fillStyle = col.ink2;
          ctx.textAlign = 'left';
          ctx.font = `500 11px "Lexend", system-ui, sans-serif`;
          ctx.fillText(`${km.toLocaleString('en-GB')} km`, bx, H - 13);
          ctx.textAlign = 'right';
          ctx.fillText('Resized for this orbit', W - 16, H - 13);
          ctx.restore();
        }
        drawMissionOrbit(canvasL, earthStep, 6371, col.electron);
        drawMissionOrbit(canvasR, moonStep, 1737.1, col.neutron, state.ch3Idx === 8);

        statsMount.replaceChildren(
          el('div', { class: 'xp-stat' },
            el('span', { class: 'xp-stat-k' }, 'Manoeuvre & date'),
            el('span', { class: 'xp-stat-v' }, st.name),
            el('span', { class: 'xp-stat-sub' }, `${st.date} · Central body: ${st.body}`)
          ),
          el('div', { class: 'xp-stat' },
            el('span', { class: 'xp-stat-k' }, state.ch3Idx === 8 ? 'Landing site' : 'Orbit size (peri × apo)'),
            el('span', { class: 'xp-stat-v' }, state.ch3Idx === 8 ? '69.37° S, 32.35° E' : `${st.peri.toLocaleString('en-GB')} × ${st.apo.toLocaleString('en-GB')} km`),
            el('span', { class: 'xp-stat-sub' }, state.ch3Idx === 8 ? 'Shiv Shakti Point, on the Moon’s surface' : st.body === 'Earth' ? 'Heights above Earth' : 'Heights above the Moon')
          ),
          el('div', { class: 'xp-stat' },
            el('span', { class: 'xp-stat-k' }, state.ch3Idx === 8 ? 'Landing time' : 'Kepler orbital period'),
            el('span', { class: 'xp-stat-v' }, st.period),
            el('span', { class: 'xp-stat-sub' }, state.ch3Idx === 8 ? 'Powered descent; the panel shows the 25 × 134 km approach orbit' : 'T = 2π √(a³ / GM)')
          )
        );

        readoutMount.replaceChildren(
          el('p', {}, el('b', {}, state.ch3Idx === 8 ? `${st.name} (${st.date}, ${st.period}): ` : `${st.name} (${st.date}, orbit ${st.peri.toLocaleString('en-GB')} × ${st.apo.toLocaleString('en-GB')} km, period ${st.period}): `), st.note),
          el('p', { class: 'xp-honest' },
            'Model note: Each panel shows one orbit, resized independently to fit. Its shape is computed from the stated heights plus the central body’s radius, and the body sits at a focus. Within each panel, the body and orbit share one scale; the scale bar changes between steps. Compare the numbers and scale bars, rather than the apparent sizes of different panels. The translunar period describes a complete unperturbed Earth-centred ellipse; the spacecraft reached the Moon before completing it. The Earth panel holds the translunar orbit during lunar steps; the Moon panel previews capture during Earth steps and shows the lander’s 25 × 134 km approach orbit during powered landing. Orbits and periods come from ISRO’s Chandrayaan-3 mission updates and the Chapter 5.6 grounding notes.'
          )
        );
      } else {
        // Aditya-L1 mode
        headL.replaceChildren(el('b', {}, 'Sun–Earth L1 point (1.5 million km sunward)'), el('span', {}, '1% of the way to the Sun'));
        headR.replaceChildren(el('b', {}, 'Aditya-L1 178-day 3D Halo Orbit'), el('span', {}, 'Arrived 6 Jan 2024'));

        const earthAngle = (state.l1Day / 365.25) * Math.PI * 2;
        const haloAngle = (state.l1Day / 177.86) * Math.PI * 2;

        // LEFT CANVAS: Sun-Earth system showing L1 keeping pace with Earth
        {
          const { ctx, W, H } = prepCanvas(canvasL);
          ctx.fillStyle = col.plate;
          ctx.fillRect(0, 0, W, H);

          const sx = W * 0.22, sy = H * 0.52;
          const orbR = Math.min(W * 0.58, H * 0.4);

          ctx.fillStyle = col.neutron;
          ctx.beginPath();
          ctx.arc(sx, sy, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = `700 10.5px "Lexend", system-ui, sans-serif`;
          ctx.fillStyle = col.ink;
          ctx.textAlign = 'center';
          ctx.fillText('Sun', sx, sy + 30);

          ctx.strokeStyle = col.rule;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(sx, sy, orbR, -0.65, 0.65);
          ctx.stroke();
          ctx.setLineDash([]);

          const a = (earthAngle % 0.9) - 0.45;
          const ex = sx + Math.cos(a) * orbR;
          const ey = sy + Math.sin(a) * orbR;
          const l1x = sx + Math.cos(a) * (orbR - 36);
          const l1y = sy + Math.sin(a) * (orbR - 36);

          // Sun-Earth line
          ctx.strokeStyle = col.muted;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();

          ctx.fillStyle = col.electron;
          ctx.beginPath();
          ctx.arc(ex, ey, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText('Earth (149.6M km)', ex - 10, ey + 22);

          ctx.fillStyle = col.proton;
          ctx.beginPath();
          ctx.arc(l1x, l1y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText('L1 (1.5M km)', l1x - 8, l1y - 11);

          ctx.font = `500 10px "Lexend", system-ui, sans-serif`;
          ctx.fillStyle = col.ink2;
          ctx.textAlign = 'left';
          ctx.fillText('Earth’s inward pull partly cancels the Sun’s pull at L1', 14, 24);

          ctx.restore();
        }

        // RIGHT CANVAS: 3D Halo orbit around L1
        {
          const { ctx, W, H } = prepCanvas(canvasR);
          ctx.fillStyle = col.plate;
          ctx.fillRect(0, 0, W, H);

          const cx = W * 0.5, cy = H * 0.52;
          const rx = W * 0.28, ry = H * 0.24;

          // Sun rays from left, Earth on right
          ctx.strokeStyle = col.rule;
          ctx.beginPath();
          ctx.moveTo(20, cy);
          ctx.lineTo(W - 20, cy);
          ctx.stroke();

          ctx.fillStyle = col.electron;
          ctx.beginPath();
          ctx.arc(W - 34, cy, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = `600 10px "Lexend", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('Earth', W - 34, cy + 22);

          // L1 point
          ctx.fillStyle = col.muted;
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText('L1 point', cx, cy + 15);

          // Oblique 3D schematic: y and z motions project into different screen axes.
          const haloPoint=t=>({x:cx+Math.cos(t)*rx+Math.sin(t)*rx*.17,y:cy+Math.sin(t)*ry*.52-Math.sin(t*2)*ry*.6});
          ctx.strokeStyle=col.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(cx,cy,rx,ry*.52,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
          ctx.strokeStyle=col.proton;ctx.lineWidth=2.2;ctx.beginPath();for(let i=0;i<=120;i++){const q=haloPoint(i/120*Math.PI*2);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();
          const position=haloPoint(haloAngle),ax=position.x,ay=position.y;
          ctx.strokeStyle=col.muted;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax,cy+Math.sin(haloAngle)*ry*.52);ctx.stroke();ctx.setLineDash([]);

          ctx.fillStyle = col.proton;
          ctx.beginPath();
          ctx.arc(ax, ay, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = col.ink;
          ctx.fillText('Aditya-L1', ax, ay - 11);

          ctx.textAlign = 'left';
          ctx.fillStyle = col.ink2;
          ctx.fillText('Oblique halo view · 177.86 days per loop', 14, 24);

          ctx.restore();
        }

        statsMount.replaceChildren(
          el('div', { class: 'xp-stat' },
            el('span', { class: 'xp-stat-k' }, 'Distance from Earth'),
            el('span', { class: 'xp-stat-v' }, '1.5 million km (1% to Sun)'),
            el('span', { class: 'xp-stat-sub' }, 'About 4× farther than the Moon')
          ),
          el('div', { class: 'xp-stat' },
            el('span', { class: 'xp-stat-k' }, 'Halo orbit period'),
            el('span', { class: 'xp-stat-v' }, '177.86 days (~178 days)'),
            el('span', { class: 'xp-stat-sub' }, 'Inserted 6 January 2024 by ISRO')
          ),
          el('div', { class: 'xp-stat' },
            el('span', { class: 'xp-stat-k' }, 'Sun–Earth line period'),
            el('span', { class: 'xp-stat-v' }, '365.25 days (with Earth)'),
            el('span', { class: 'xp-stat-sub' }, 'Zero eclipses: uninterrupted view of Sun')
          )
        );

        readoutMount.replaceChildren(
          el('p', {},
            el('b', {}, 'Aditya-L1 at the Sun–Earth L1 Lagrange point (Chapter 15.3): '),
            'Normally a spacecraft closer to the Sun than Earth would have a shorter year and overtake us. At L1 (roughly 1.5 million km from Earth, 1% of the way to the Sun), Earth’s backward gravitational pull cancels just enough of the Sun’s forward pull that a craft orbits the Sun in exactly one Earth year.'
          ),
          el('p', { class: 'xp-honest' },
            'Model note: Aditya-L1 does not sit still at L1; it travels around L1 on a three-dimensional halo orbit every 177.86 days so that its radio dish never lines up directly with the noisy disc of the Sun. The 1% L1 distance is widened on the left diagram so L1 and Earth do not overlap.'
          )
        );
      }
    }

    function updateView(syncPresets) {
      const mode = activeMode();
      phaseLinks.hidden=mode!=='moon';
      phaseButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===Math.round(state.lunarDay/SYNODIC_DAYS*8)%8)));
      const col = readPalette();

      if (mode === 'seasons') {
        const doyOut = controlsMount.querySelector('[data-out="doy"]');
        if (doyOut) doyOut.textContent = dayToDateStr(state.doy);
        const hrOut = controlsMount.querySelector('[data-out="hour"]');
        if (hrOut) hrOut.textContent = fmtHours(state.hour);
        if (syncPresets) {
          presetsMount.querySelectorAll('[data-doy]').forEach(b => {
            b.setAttribute('aria-pressed', String(Math.abs(+b.dataset.doy - state.doy) <= 2));
          });
        }
        drawSeasonsMode(col);
      } else if (mode === 'moon') {
        const lOut = controlsMount.querySelector('[data-out="lunar"]');
        if (lOut) lOut.textContent = `Day ${state.lunarDay.toFixed(1)}`;
        if (syncPresets) {
          presetsMount.querySelectorAll('[data-lday]').forEach(b => {
            b.setAttribute('aria-pressed', String(Math.abs(+b.dataset.lday - state.lunarDay) < 0.8));
          });
        }
        drawMoonTidesMode(col);
      } else if (mode === 'missions') {
        const l1Out = controlsMount.querySelector('[data-out="l1"]');
        if (l1Out) l1Out.textContent = `Day ${Math.round(state.l1Day)}`;
        drawMissionsMode(col);
      }
    }

    const wrap = el('div', { class: 'xp-wrap' },
      el('div', { class: 'xp-top' },
        el('div', { class: 'xp-title-group' },
          el('p', { class: 'xp-kicker' }, 'Explorer · Chapters 5.6, 14 & 15.3'),
          el('h3', { class: 'xp-heading' }, 'The Sky: Sun, Earth, Moon, and Mumbai’s Rooftop (19.08° N)')
        ),
        el('button', { type: 'button', class: 'xp-btn xp-close', onclick: () => { stopPlay(); close(); } }, 'Close explorer')
      ),
      el('div', { class: 'xp-tabs', role: 'tablist', 'aria-label': 'Sky explorer modes' }, tabBtns),
      presetsMount,
      el('div', { class: 'xp-split' },
        el('div', { class: 'xp-pane' }, headL, el('div', { class: 'xp-canvas-wrap' }, canvasL)),
        el('div', { class: 'xp-pane' }, headR, el('div', { class: 'xp-canvas-wrap' }, canvasR))
      ),
      phaseLinks,sceneNote, controlsMount,
      statsMount,
      readoutMount,
      tourMount
    );

    stage.replaceChildren(wrap);
    rebuildControls();
    updateView(true);

    let rTimer;
    const resize=()=>{clearTimeout(rTimer);rTimer=setTimeout(()=>{if(!disposed)updateView(false);},80);};
    const hide=()=>{if(document.hidden||stage.closest('[data-page-off]'))stopPlay();};
    window.addEventListener('resize',resize);document.addEventListener('visibilitychange',hide);
    const themeObserver=new MutationObserver(()=>{if(!disposed)updateView(false);});themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    const pageObserver=new MutationObserver(hide);const section=stage.closest('section');if(section)pageObserver.observe(section,{attributes:true,attributeFilter:['data-page-off']});
    return ()=>{disposed=true;stopPlay();clearTimeout(rTimer);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',hide);themeObserver.disconnect();pageObserver.disconnect();};
  },
});
