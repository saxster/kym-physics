// The cover's chapter milestone tiles: every tile can be hovered, focused and tapped.
// Tapping opens a card showing the chapter's big question, key physical insight, people, and direct links.
import App from './core.js';

const el = App.el;

const CHAPTER_TILES = [
  { ch: 0, sym: '7.2°', title: 'The physicist’s way of seeing', vol: 'Volume I · Motion and force',
    q: 'How can a man with a stick and a shadow measure the whole Earth?',
    how: 'A noon shadow in Alexandria and a sunlit well in Syene let Eratosthenes measure the curve of the whole planet around 240 BCE.',
    who: 'Eratosthenes · Alexandria, c. 240 BCE', story: 'kilogram', explore: '#explore-scale', exploreLabel: 'Open Powers of Ten' },
  { ch: 1, sym: 'd ∝ t²', title: 'Describing motion', vol: 'Volume I · Motion and force',
    q: 'At the very top of a throw, the ball stops for an instant. Is anything happening to it then?',
    how: 'Galileo slowed falling down on a grooved wooden ramp in Padua and found the odd-number rule 1, 3, 5, 7: distance grows with the square of the time.',
    who: 'Galileo Galilei · Padua, c. 1604', story: 'p-galileo', explore: null },
  { ch: 2, sym: 'v = const', title: 'Why things keep moving', vol: 'Volume I · Motion and force',
    q: 'When a local train brakes hard, everyone lurches forward. What pushed them?',
    how: 'Nothing pushed them. Moving things keep moving on their own at steady velocity unless an outside force acts to change that motion.',
    who: 'Philoponus, Buridan, Galileo & Newton · 530–1687', story: 'impetus', explore: null },
  { ch: 3, sym: 'F = ma', title: 'Forces come in pairs', vol: 'Volume I · Motion and force',
    q: 'A mosquito hits the windscreen of a speeding car. Which feels the bigger force?',
    how: 'Neither: every push between two objects is an equal and opposite pair. The mosquito accelerates hugely because its mass is tiny.',
    who: 'Isaac Newton & Vikram Sarabhai · 1687 & Thumba, 1963', story: 'p-sarabhai', explore: null },
  { ch: 4, sym: 'g = 9.8', title: 'Falling', vol: 'Volume I · Motion and force',
    q: 'Drop a cricket ball and a ₹1 coin from the same height. Which lands first?',
    how: 'Simon Stevin dropped two lead balls of 10-to-1 weight in Delft in 1586 and heard a single thud on a wooden board: gravity accelerates light and heavy alike.',
    who: 'Simon Stevin & David Scott · Delft, 1586 & Moon, 1971', story: 'falling', explore: null },
  { ch: 5, sym: 'GMm/r²', title: 'Gravity and orbits', vol: 'Volume II · Gravity, pressure and energy',
    q: 'Astronauts on the space station float, yet gravity up there is 89% as strong as on the ground. Why?',
    how: 'An orbit is free fall sideways fast enough to keep missing the curved Earth. Cavendish weighed the whole Earth in a London garden shed in 1798.',
    who: 'Kepler, Newton, Cavendish & ISRO · 1609–2023', story: 'cavendish-shed', explore: '#explore-sky', exploreLabel: 'Open The Sky' },
  { ch: 6, sym: 'p = ρgh', title: 'Pressure, floating and the ocean of air', vol: 'Volume II · Gravity, pressure and energy',
    q: 'A steel ship of 50,000 tonnes floats. A steel ₹5 coin sinks. How?',
    how: 'Water pushes harder on the bottom of a submerged hull than on the top, and we live at the bottom of a heavy ocean of air pressing at 101,325 Pa.',
    who: 'Archimedes, Torricelli & Pascal · 250 BCE–1648', story: 'ocean-of-air', explore: null },
  { ch: 7, sym: '½mv²', title: 'Energy', vol: 'Volume II · Gravity, pressure and energy',
    q: 'If energy can never be destroyed, why does the electricity bill say "units consumed"?',
    how: 'Émilie du Châtelet showed that a moving ball’s ability to dent clay grows with the square of its speed, and Mayer and Joule showed energy is never lost, only spread out.',
    who: 'Émilie du Châtelet, Mayer & Joule · 1740–1845', story: 'vis-viva', explore: null },
  { ch: 8, sym: 'ΔQ', title: 'Heat and temperature', vol: 'Volume II · Gravity, pressure and energy',
    q: 'A steel thali and a wooden board sit in the same room all night. Why does the steel feel colder?',
    how: 'Both are at the same room temperature, but steel conducts heat away from your warm fingers much faster than wood. In Mumbai, evaporative cooling runs the matka and the monsoon.',
    who: 'Rumford, Joseph Black & Sulochana Gadgil · 1761–2021', story: 'monsoon', explore: null },
  { ch: 9, sym: 'v = fλ', title: 'Vibrations, waves and sound', vol: 'Volume III · Waves, sound and light',
    q: 'A wave crosses the whole Arabian Sea, but the water stays where it is. So what travels?',
    how: 'The disturbance and its energy travel while the medium oscillates in place. C. V. Raman showed in Calcutta how the black paste on a tabla loads the drumhead into singing harmonics.',
    who: 'Galileo, Buys Ballot & C. V. Raman · 1638–1920', story: 'tabla', explore: null },
  { ch: 10, sym: 'θᵢ = θᵣ', title: 'Light and seeing', vol: 'Volume III · Waves, sound and light',
    q: 'In a perfectly dark room, can you see your own hand?',
    how: 'Nothing leaves your eyes when you look: Ibn al-Haytham proved in eleventh-century Cairo that vision happens when light from outside enters the pupil.',
    who: 'Ibn al-Haytham, Rømer & Fizeau · c. 1021–1849', story: 'seeing', explore: null },
  { ch: 11, sym: 'Δλ', title: 'Colour, and what light really is', vol: 'Volume III · Waves, sound and light',
    q: 'The sky is blue, the sunset over Marine Drive is orange, and the sea is blue too. Is it the same reason?',
    how: 'Air scatters short blue waves across the sky, while C. V. Raman and K. S. Krishnan proved in 1928 that water and other molecules scatter light and shift its colour.',
    who: 'Newton, Young, Fresnel, Raman & Krishnan · 1666–1928', story: 'raman', explore: '#explore-spectrum', exploreLabel: 'Open The Ladder of Light' },
  { ch: 12, sym: 'V = IR', title: 'Charge and circuits', vol: 'Volume IV · Electricity, magnetism and the sky',
    q: 'If a bulb "uses up" electricity, why does it need a return wire going back to the battery?',
    how: 'Charge is never used up in a circuit: the same current flows all the way round the closed loop, carrying energy from the battery to the filament.',
    who: 'Franklin, Volta, Ohm & Faraday · 1752–1836', story: 'circuits', explore: null },
  { ch: 13, sym: 'c = 1/√µ₀ε₀', title: 'Magnetism and electromagnetism', vol: 'Volume IV · Electricity, magnetism and the sky',
    q: 'A magnet grabs a ₹5 coin but ignores a steel spoon. Both are "steel". What is going on?',
    how: 'Moving charges create magnetic fields, changing magnetic fields drive currents, and James Clerk Maxwell and J. C. Bose showed that light and millimetre waves are electromagnetic.',
    who: 'Ørsted, Faraday, Maxwell & J. C. Bose · 1820–1895', story: 'bose-waves', explore: '#explore-spectrum', exploreLabel: 'Open The Ladder of Light' },
  { ch: 14, sym: '23.4°', title: 'Earth, Moon and Sun', vol: 'Volume IV · Electricity, magnetism and the sky',
    q: 'Earth is closest to the Sun in January, when Mumbai is coolest. So what causes seasons?',
    how: 'Earth’s 23.4° axial tilt tips each hemisphere towards or away from the Sun, changing how steeply sunlight strikes the ground and how long the day lasts.',
    who: 'Aryabhata, Foucault & Mumbai’s Haji Ali tides · 499–today', story: 'seasons', explore: '#explore-sky', exploreLabel: 'Open The Sky' },
  { ch: 15, sym: 'E = mc²', title: 'Atoms, stars and the universe', vol: 'Volume IV · Electricity, magnetism and the sky',
    q: 'The Sun has burned for four and a half billion years. What could keep a fire going that long?',
    how: 'Nuclear fusion turns hydrogen into helium in the Sun’s core, Saha and Payne decoded starlight, Leavitt measured the cosmos, and Chandrasekhar calculated how stars die on a ship from Bombay.',
    who: 'Saha, S. N. Bose, Payne, Leavitt, Meitner & Chandrasekhar · 1905–1938', story: 'sun-fire', explore: '#explore-sky', exploreLabel: 'Open The Sky' },
];

const byCh = new Map(CHAPTER_TILES.map(t => [t.ch, t]));

App.ready(() => {
  const cover = document.querySelector('header.cover');
  const svg = cover && cover.querySelector('svg');
  if (!svg) return;
  const tiles = [...svg.querySelectorAll('g.el')];
  if (!tiles.length) return;

  svg.setAttribute('role', 'group');
  svg.classList.add('cover-live');

  const card = el('div', { class: 'cv-card', role: 'dialog', 'aria-modal': 'false', hidden: true });
  (svg.closest('figure') || svg.parentNode).appendChild(card);
  let current = null;

  tiles.forEach((g, idx) => {
    const chAttr = g.getAttribute('data-ch');
    const chNum = chAttr !== null ? parseInt(chAttr, 10) : idx;
    const item = byCh.get(chNum);
    if (!item) return;
    g.dataset.ch = chNum;
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `Chapter ${item.ch}: ${item.title}`);
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    t.textContent = `Chapter ${item.ch}: ${item.title}`;
    g.prepend(t);
    g.addEventListener('click', ev => { ev.stopPropagation(); open(g, item); });
    g.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(g, item); }
      if (ev.key === 'Escape') close();
    });
  });

  function place(g) {
    const host = card.parentNode.getBoundingClientRect();
    const r = g.getBoundingClientRect();
    const w = Math.min(340, host.width - 16);
    card.style.width = w + 'px';
    let left = r.left - host.left + r.width / 2 - w / 2;
    left = Math.max(8, Math.min(left, host.width - w - 8));
    card.style.left = left + 'px';
    card.style.top = (r.bottom - host.top + 8) + 'px';
  }

  function open(g, item) {
    if (current) current.classList.remove('cv-sel');
    current = g; g.classList.add('cv-sel');
    card.replaceChildren(
      el('button', { type: 'button', class: 'cv-x', 'aria-label': 'Close', onclick: close }, '×'),
      el('p', { class: 'cv-top' },
        el('span', { class: 'cv-sym' }, item.sym),
        el('span', { class: 'cv-name' }, item.title, el('small', {}, `Chapter ${item.ch} · ${item.vol}`))),
      el('p', { class: 'cv-in' }, item.q),
      el('p', { class: 'cv-how' }, item.how),
      el('p', { class: 'cv-who' }, item.who),
      el('p', { class: 'cv-links' },
        el('a', { href: '#ch' + item.ch, onclick: () => close() }, `Read Chapter ${item.ch}`),
        item.story ? el('a', { class: 'sl', href: '#story-' + item.story, 'data-story': item.story, onclick: () => close() }, 'Read its story') : null,
        item.explore ? el('a', { href: item.explore, onclick: () => close() }, item.exploreLabel || 'Open explorer') : null));
    card.hidden = false;
    place(g);
    card.querySelector('.cv-x').focus({ preventScroll: true });
  }

  function close() {
    card.hidden = true;
    if (current) { current.classList.remove('cv-sel'); current.focus({ preventScroll: true }); current = null; }
  }

  document.addEventListener('click', ev => { if (!card.hidden && !card.contains(ev.target)) close(); });
  window.addEventListener('resize', () => { if (!card.hidden && current) place(current); });
});
