// Where every scene in the book happened. resolve(sceneText) -> {key, label, lat, lon, year} or null
// (null for scenes that are not a real place on Earth: "your kitchen", "a school playground", the Moon, Mars ...).
// Coordinates are approximate centres (2 decimals): plenty for a world map. Scenes from research/history.md.

export const PLACES = {
  // Mumbai first: the book's home, with its own neighbourhoods
  colaba: ['Colaba, Bombay', 18.91, 72.81],
  alibag: ['Alibag', 18.64, 72.87],
  tifr: ['Peddar Road (TIFR), Bombay', 18.97, 72.81],
  worli: ['Worli, Mumbai', 19.01, 72.82],
  hajiali: ['Haji Ali, Mumbai', 18.98, 72.81],
  marinedrive: ['Marine Drive, Mumbai', 18.94, 72.82],
  bandra: ['Bandra, Mumbai', 19.06, 72.84],
  mumbai: ['Mumbai', 19.08, 72.88],
  // the rest of India
  pune: ['Pune', 18.52, 73.86],
  gmrt: ['GMRT, Khodad (near Narayangaon)', 19.10, 74.05],
  thumba: ['Thumba, Kerala', 8.53, 76.87],
  sriharikota: ['Sriharikota', 13.72, 80.23],
  bangalore: ['Bengaluru', 12.97, 77.59],
  darjeeling: ['Darjeeling', 27.04, 88.26],
  calcutta: ['Calcutta (Kolkata)', 22.57, 88.36],
  dacca: ['Dacca (Dhaka)', 23.81, 90.41],
  patna: ['Kusumapura (Patna)', 25.59, 85.14],
  ujjain: ['Ujjain', 23.18, 75.78],
  jaipur: ['Jaipur', 26.92, 75.82],
  karnal: ['Karnal', 29.69, 76.99],
  // Europe
  delft: ['Delft', 52.01, 4.36],
  leiden: ['Leiden', 52.16, 4.49],
  utrecht: ['Utrecht', 52.09, 5.12],
  pisa: ['Pisa', 43.72, 10.40],
  padua: ['Padua', 45.41, 11.88],
  venice: ['Venice', 45.44, 12.33],
  florence: ['Florence', 43.77, 11.26],
  bologna: ['Bologna', 44.49, 11.34],
  syracuse: ['Syracuse, Sicily', 37.08, 15.29],
  woolsthorpe: ['Woolsthorpe, Lincolnshire', 52.81, -0.63],
  cambridge: ['Cambridge', 52.21, 0.12],
  london: ['London', 51.51, -0.13],
  clapham: ['Clapham, London', 51.46, -0.14],
  manchester: ['Manchester', 53.48, -2.24],
  glasgow: ['Glasgow', 55.86, -4.25],
  cirey: ['Cirey-sur-Blaise', 48.33, 4.94],
  paris: ['Paris', 48.86, 2.35],
  puydedome: ['Puy de Dôme, near Clermont', 45.77, 2.96],
  chamonix: ['Chamonix', 45.92, 6.87],
  hven: ['Hven (Ven), Denmark–Sweden', 55.91, 12.69],
  copenhagen: ['Copenhagen', 55.68, 12.57],
  kungalv: ['Kungälv, Sweden', 57.87, 11.98],
  prague: ['Prague', 50.08, 14.42],
  dresden: ['Dresden', 51.05, 13.74],
  berlin: ['Berlin', 52.52, 13.40],
  regensburg: ['Regensburg', 49.01, 12.10],
  magdeburg: ['Magdeburg', 52.12, 11.63],
  munich: ['Munich', 48.14, 11.58],
  karlsruhe: ['Karlsruhe', 49.01, 8.40],
  bern: ['Bern', 46.95, 7.45],
  mediterranean: ['The Mediterranean Sea', 36.00, 18.50],
  // Asia, Africa and the rest of the world
  alexandria: ['Alexandria, Egypt', 31.20, 29.92],
  syene: ['Syene (Aswan), Egypt', 24.09, 32.90],
  cairo: ['Cairo', 30.04, 31.24],
  bukhara: ['Bukhara', 39.77, 64.42],
  batavia: ['Batavia (Jakarta), Java', -6.21, 106.85],
  kapustinyar: ['Kapustin Yar, Russia', 48.57, 45.74],
  harvard: ['Harvard, Cambridge, Mass.', 42.37, -71.12],
  newyork: ['New York', 40.71, -74.01],
  washington: ['Washington, DC', 38.91, -77.04],
  philadelphia: ['Philadelphia', 39.95, -75.17],
  signalhill: ['Signal Hill, Newfoundland', 47.57, -52.68],
  tacoma: ['Tacoma Narrows, Washington', 47.27, -122.55],
};

// Ordered: the first rule that matches decides. Specific names before general ones; null means "not on the map".
const RULES = [
  [/kitchen|playground|classroom|your (home|room|school|street)|^At home|bathroom/i, null],
  [/^(On )?the Moon|Hadley Rille|lunar|^Moon\b|^Mars\b|Salyut|^L1\b|^In orbit|Columbia|^Space\b|^Gaganyaan/i, null],
  [/Colaba/, 'colaba'], [/Alibag/, 'alibag'],
  [/Peddar Road|Kenilworth|TIFR|Tata Institute of Fundamental Research/, 'tifr'],
  [/Worli|Nehru Planetarium|Sea Link/, 'worli'], [/Haji Ali/, 'hajiali'], [/Marine Drive/, 'marinedrive'],
  [/Bandra/, 'bandra'], [/Bombay|Mumbai|Crawford Market/, 'mumbai'],
  [/Khodad|Narayangaon|GMRT|Giant Metrewave/, 'gmrt'], [/^Pune|Poona/, 'pune'],
  [/Thumba/, 'thumba'], [/Sriharikota/, 'sriharikota'], [/Bangalore|Bengaluru/, 'bangalore'],
  [/Darjeeling|Sandakphu/, 'darjeeling'], [/Calcutta|Kolkata/, 'calcutta'], [/Dacca|Dhaka/, 'dacca'],
  [/Kusumapura|Patna|Pataliputra/, 'patna'], [/Ujjain/, 'ujjain'], [/Jaipur|Jantar Mantar/, 'jaipur'], [/Karnal/, 'karnal'],
  [/Delft/, 'delft'], [/Leiden/, 'leiden'], [/Utrecht|Maarssen/, 'utrecht'],
  [/Pisa/, 'pisa'], [/Padua/, 'padua'], [/Venice/, 'venice'], [/Florence/, 'florence'], [/Bologna/, 'bologna'],
  [/Syracuse/, 'syracuse'], [/Woolsthorpe/, 'woolsthorpe'],
  [/Clapham/, 'clapham'], [/Cambridge,? (Mass|MA)|Harvard/, 'harvard'], [/Cambridge|Trinity College/, 'cambridge'],
  [/Royal Institution|London|Greenwich|Millennium Bridge/, 'london'], [/Manchester/, 'manchester'], [/Glasgow/, 'glasgow'],
  [/Cirey/, 'cirey'], [/Puy de Dôme|Puy-de-Dôme|Clermont/, 'puydedome'], [/Chamonix|Mont Blanc/, 'chamonix'],
  [/Paris|Suresnes|Montmartre|Panthéon/, 'paris'],
  [/Hven|Uraniborg/, 'hven'], [/Copenhagen/, 'copenhagen'], [/Kungälv/, 'kungalv'],
  [/Prague/, 'prague'], [/Dresden/, 'dresden'], [/Berlin/, 'berlin'],
  [/Regensburg/, 'regensburg'], [/Magdeburg/, 'magdeburg'], [/Munich/, 'munich'], [/Karlsruhe/, 'karlsruhe'], [/Bern\b/, 'bern'],
  [/Mediterranean|Narkunda/, 'mediterranean'],
  [/Alexandria/, 'alexandria'], [/Syene|Aswan/, 'syene'], [/Cairo/, 'cairo'], [/Bukhara/, 'bukhara'],
  [/Batavia|Jakarta|Java/, 'batavia'], [/Kapustin Yar/, 'kapustinyar'],
  [/Washington, DC|Washington, D\.C\.|^Washington\b(?! state)/, 'washington'], [/New York/, 'newyork'],
  [/Philadelphia/, 'philadelphia'], [/Signal Hill|Newfoundland/, 'signalhill'], [/Tacoma/, 'tacoma'],
];

// A sortable year from the scene text: "about 250 BCE" -> -250, "499 CE" -> 499, "the 1780s" -> 1780,
// "1912 to 1913" -> 1912, "about 2,250 years ago" -> -225, "c. 1011" -> 1011. null if there is none.
export function yearOf(text) {
  let m = /([\d,]+)\s*years ago/.exec(text);
  if (m) return 2026 - parseInt(m[1].replace(/,/g, ''), 10);
  m = /(\d{1,4})\s*BCE/.exec(text);
  if (m) return -parseInt(m[1], 10);
  m = /\b(\d{3,4})\s*CE\b/.exec(text);
  if (m) return parseInt(m[1], 10);
  m = /\b(1[0-9]{3}|20[0-9]{2})s?\b/.exec(text);
  if (m) return parseInt(m[1], 10);
  m = /the year (\d{1,4})/.exec(text);
  if (m) return parseInt(m[1], 10);
  return null;
}

export function resolve(text) {
  const t = (text || '').trim();
  for (const [rx, key] of RULES) {
    if (rx.test(t)) {
      if (!key) return null;
      const [label, lat, lon] = PLACES[key];
      return { key, label, lat, lon, year: yearOf(t) };
    }
  }
  return null;
}
