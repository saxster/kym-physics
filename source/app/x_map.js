// The adventure map (every :::scene on a world map, with a time slider) and Lifelines (the cast on one timeline).
// Mounts into [data-mount="map"] in section#explore-map. Emits/listens 'map:year' so the two stay in step.
import App from './core.js';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import { resolve } from './places_data.js';

const { el } = App;
const NS = 'http://www.w3.org/2000/svg';
const W = 960, H = 500;
const Y0 = -500, YMID = 1600, Y1 = 2026;          // slider: antiquity squeezed into the first 15%
const SPLIT = 150, SMAX = 1000;
const toSlider = y => y < YMID ? (y - Y0) / (YMID - Y0) * SPLIT : SPLIT + (y - YMID) / (Y1 - YMID) * (SMAX - SPLIT);
const fromSlider = v => Math.round(v < SPLIT ? Y0 + v / SPLIT * (YMID - Y0) : YMID + (v - SPLIT) / (SMAX - SPLIT) * (Y1 - YMID));
const decode = (() => { const t = document.createElement('textarea'); return s => { t.innerHTML = s || ''; return t.value; }; })();
const fmtYear = y => y < 0 ? `${-y} BCE` : y < 1000 ? `${y} CE` : String(y);

const VIEWS = {
  world: { label: 'World' },
  europe: { label: 'Europe', lon: [-11, 33], lat: [35, 63] },
  britain: { label: 'Britain', lon: [-8.5, 2.2], lat: [49.8, 56.3] },
  india: { label: 'India', lon: [66, 95], lat: [6, 30] },
  americas: { label: 'Americas', lon: [-160, -60], lat: [15, 62] },
};

function svg(tag, attrs, ...kids) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) if (v != null) n.setAttribute(k, v);
  kids.flat().forEach(c => c != null && n.append(c.nodeType ? c : document.createTextNode(String(c))));
  return n;
}

function context(where) {
  const [kind, id] = where.split(':');
  if (kind === 'ch') {
    const c = (App.data.chapters || []).find(c => String(c.n) === id);
    return c ? `Chapter ${c.n} · ${decode(c.title)}` : `Chapter ${id}`;
  }
  const s = (App.data.stories || []).find(s => s.id === id);
  return s ? `Story · ${decode(s.title)}` : 'Story';
}

function goToScene(sc) {
  const [kind, id] = sc.where.split(':');
  const flash = () => {
    const t = document.getElementById(sc.id);
    if (!t) return;
    t.scrollIntoView({ block: 'center', behavior: App.reduceMotion() ? 'auto' : 'smooth' });
    t.classList.remove('amap-flash'); void t.offsetWidth; t.classList.add('amap-flash');
  };
  if (kind === 'story') { App.openStory(id); requestAnimationFrame(() => requestAnimationFrame(flash)); }
  else { history.pushState(null, '', '#' + sc.id); flash(); }
}

// ------------------------------------------------------------------ the map
function buildMap(mount) {
  // group scenes by place
  const places = new Map();
  let skipped = 0;
  for (let sc of App.data.scenes || []) {
    sc = { ...sc, text: decode(sc.text) };
    const r = resolve(sc.text);
    if (!r) { skipped++; continue; }
    if (!places.has(r.key)) places.set(r.key, { ...r, scenes: [] });
    places.get(r.key).scenes.push({ ...sc, year: r.year });
  }
  for (const p of places.values()) {
    p.scenes.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
    const ys = p.scenes.map(s => s.year).filter(y => y != null);
    p.first = ys.length ? Math.min(...ys) : null;
  }
  const total = [...places.values()].reduce((n, p) => n + p.scenes.length, 0);

  const proj = geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'Sphere' });
  const path = geoPath(proj);
  const land = feature(world, world.objects.land);
  const borders = mesh(world, world.objects.countries, (a, b) => a !== b);
  for (const p of places.values()) [p.x, p.y] = proj([p.lon, p.lat]);

  const vb = { x: 0, y: 0, w: W, h: H };
  const map = svg('svg', { class: 'amap-svg', viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': 'World map of the places where the scenes in this book happened' },
    svg('path', { class: 'amap-sphere', d: path({ type: 'Sphere' }) }),
    svg('path', { class: 'amap-grat', d: path(geoGraticule10()) }),
    svg('path', { class: 'amap-land', d: path(land) }),
    svg('path', { class: 'amap-border', d: path(borders) }));
  const gPins = svg('g', { class: 'amap-pins' });
  const gLabels = svg('g', { class: 'amap-labels', 'aria-hidden': 'true' });
  map.append(gPins, gLabels);

  const yearBig = el('p', { class: 'amap-year', 'aria-hidden': 'true' });
  const slider = el('input', { type: 'range', min: 0, max: SMAX, step: 1, value: SMAX, class: 'amap-range', 'aria-label': 'Year' });
  const play = el('button', { type: 'button', class: 'amap-btn amap-play', 'aria-label': 'Play through time' }, 'Play');
  const count = el('p', { class: 'amap-count', 'aria-live': 'polite' });
  const views = el('div', { class: 'amap-views', role: 'group', 'aria-label': 'Zoom to' },
    Object.entries(VIEWS).map(([k, v]) => el('button', { type: 'button', class: 'amap-btn', 'data-view': k, 'aria-pressed': k === 'world' ? 'true' : 'false', onclick: () => zoomTo(k) }, v.label)));
  const card = el('div', { class: 'amap-card', role: 'region', 'aria-label': 'Scenes at this place', 'aria-live': 'polite', hidden: true });
  const stage = el('div', { class: 'amap-stage' }, map, yearBig);

  mount.replaceChildren(
    el('div', { class: 'amap' },
      el('div', { class: 'amap-bar' }, views),
      stage,
      el('div', { class: 'amap-time' }, play, el('div', { class: 'amap-slide' }, slider,
        el('div', { class: 'amap-scale', 'aria-hidden': 'true' }, ['500 BCE', '1600', '1700', '1800', '1900', '2026'].map(t => {
          const y = t.includes('BCE') ? -500 : +t;
          return el('span', { class: /^1[67]|^19/.test(t) ? 'minor' : null, style: `left:${toSlider(y) / SMAX * 100}%` }, t);
        })))),
      count, card,
      skipped ? el('p', { class: 'amap-note' }, `Not on the map: ${skipped} scenes set anywhere at all, like your own kitchen, a school sports day, and one on Mars.`) : null));

  let year = Y1, k = 1, current = null;

  function pinR(n) { return (3.2 + 2.1 * Math.sqrt(n)) / k; }

  const pinEls = new Map();
  for (const p of [...places.values()].sort((a, b) => b.scenes.length - a.scenes.length)) {
    const g = svg('g', { class: 'amap-pin', tabindex: 0, role: 'button' },
      svg('circle', { class: 'halo', cx: p.x, cy: p.y }),
      svg('circle', { class: 'dot', cx: p.x, cy: p.y }));
    const open = () => showCard(p);
    g.addEventListener('click', open);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    gPins.append(g);
    pinEls.set(p.key, g);
  }

  function visibleScenes(p) { return p.scenes.filter(s => s.year == null || s.year <= year); }

  function render() {
    yearBig.textContent = fmtYear(year);
    slider.setAttribute('aria-valuetext', fmtYear(year));
    let shown = 0, placesShown = 0;
    for (const p of places.values()) {
      const n = visibleScenes(p).length, g = pinEls.get(p.key);
      const on = n > 0;
      g.classList.toggle('off', !on);
      g.setAttribute('aria-hidden', on ? 'false' : 'true');
      g.setAttribute('tabindex', on ? '0' : '-1');
      g.setAttribute('aria-label', `${p.label}: ${n} scene${n === 1 ? '' : 's'}`);
      g.querySelector('.dot').setAttribute('r', pinR(Math.max(n, 1)));
      g.querySelector('.halo').setAttribute('r', pinR(Math.max(n, 1)) + 4 / k);
      g.classList.toggle('sel', current === p);
      if (on) { shown += n; placesShown++; }
    }
    count.textContent = year >= Y1 ? `${total} scenes in ${places.size} places.` : `By ${fmtYear(year)}: ${shown} of ${total} scenes, in ${placesShown} places.`;
    renderLabels();
  }

  function renderLabels() {
    gLabels.replaceChildren();
    if (k < 2.2) return;
    const displayScale=Math.max(.25,map.clientWidth/W);
    const fs = 13 / (k*displayScale), placed = [];
    const inView = p => p.x >= vb.x && p.x <= vb.x + vb.w && p.y >= vb.y && p.y <= vb.y + vb.h;
    for (const p of [...places.values()].sort((a, b) => b.scenes.length - a.scenes.length)) {
      if (!inView(p) || !visibleScenes(p).length) continue;
      const name=p.label.split(',')[0],r=pinR(visibleScenes(p).length),padding=3/(k*displayScale);
      const label=svg('text',{x:p.x+r+2/k,y:p.y+fs*.35,'font-size':fs,'stroke-width':3/k},name);
      gLabels.append(label);
      let measured=label.getBBox();
      if(measured.x+measured.width+padding>vb.x+vb.w){
        label.setAttribute('x',p.x-r-2/k-measured.width-padding);measured=label.getBBox();
      }
      // Actual font geometry, rather than a per-character width guess, determines placement.
      const box={x:measured.x-padding/2,y:measured.y-padding/2,w:measured.width+padding,h:measured.height+padding};
      if(box.x<vb.x||box.x+box.w>vb.x+vb.w||box.y<vb.y||box.y+box.h>vb.y+vb.h||
        placed.some(b=>box.x<b.x+b.w&&b.x<box.x+box.w&&box.y<b.y+b.h&&b.y<box.y+box.h)){
        label.remove();continue;
      }
      placed.push(box);
    }
  }

  function showCard(p) {
    current = p;
    const items = p.scenes.map(s => {
      const later = s.year != null && s.year > year;
      return el('li', { class: later ? 'later' : null },
        el('button', { type: 'button', class: 'amap-go', onclick: () => goToScene(s) },
          el('b', {}, s.text), el('span', {}, context(s.where) + (later ? ' · later' : ''))));
    });
    card.replaceChildren(
      el('div', { class: 'amap-card-h' }, el('h3', {}, p.label),
        el('button', { type: 'button', class: 'amap-x', 'aria-label': 'Close', onclick: () => { current = null; card.hidden = true; render(); } }, '×')),
      el('p', { class: 'amap-card-n' }, `${p.scenes.length} scene${p.scenes.length === 1 ? '' : 's'} in this book`),
      el('ol', {}, items));
    card.hidden = false;
    render();
  }

  // zoom: animate the viewBox between presets
  function boxFor(key) {
    const v = VIEWS[key];
    if (!v.lon) return { x: 0, y: 0, w: W, h: H };
    const pts = [];
    for (let lo = v.lon[0]; lo <= v.lon[1]; lo += (v.lon[1] - v.lon[0]) / 8)
      for (let la = v.lat[0]; la <= v.lat[1]; la += (v.lat[1] - v.lat[0]) / 8) pts.push(proj([lo, la]));
    let x0 = Math.min(...pts.map(p => p[0])), x1 = Math.max(...pts.map(p => p[0]));
    let y0 = Math.min(...pts.map(p => p[1])), y1 = Math.max(...pts.map(p => p[1]));
    let w = x1 - x0, h = y1 - y0;
    const ar = W / H;                              // keep the stage's aspect ratio
    if (w / h > ar) { const nh = w / ar; y0 -= (nh - h) / 2; h = nh; } else { const nw = h * ar; x0 -= (nw - w) / 2; w = nw; }
    return { x: x0, y: y0, w, h };
  }
  let anim = 0;
  function setVB(b) {
    Object.assign(vb, b); k = W / b.w;
    map.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`);
    map.style.setProperty('--k', k);
    render();
  }
  function zoomTo(key) {
    views.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === key)));
    const to = boxFor(key), from = { ...vb };
    cancelAnimationFrame(anim);
    if (App.reduceMotion()) return setVB(to);
    const t0 = performance.now(), D = 520;
    const step = now => {
      const t = Math.min(1, (now - t0) / D), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      // interpolate in log-scale for width so zooming feels even
      const w = Math.exp(Math.log(from.w) + (Math.log(to.w) - Math.log(from.w)) * e);
      const cx = from.x + from.w / 2 + ((to.x + to.w / 2) - (from.x + from.w / 2)) * e;
      const cy = from.y + from.h / 2 + ((to.y + to.h / 2) - (from.y + from.h / 2)) * e;
      const h = w * H / W;
      setVB({ x: cx - w / 2, y: cy - h / 2, w, h });
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  // time
  function setYear(y, fromUser) {
    year = Math.max(Y0, Math.min(Y1, y));
    slider.value = toSlider(year);
    render();
    if (current) showCard(current);
    App.emit('map:year', { year, fromUser });
  }
  slider.addEventListener('input', () => { stop(); setYear(fromSlider(+slider.value), true); });

  let playing = 0;
  function stop() { if (playing) { cancelAnimationFrame(playing); clearTimeout(playing); playing = 0; } play.textContent = 'Play'; play.setAttribute('aria-label', 'Play through time'); }
  play.addEventListener('click', () => {
    if (playing) return stop();
    play.textContent = 'Pause'; play.setAttribute('aria-label', 'Pause');
    let v = year >= Y1 ? 0 : +slider.value;
    if (App.reduceMotion()) {         // no sweep: step through the years when something new happens
      const marks = [...new Set([...places.values()].flatMap(p => p.scenes.map(s => s.year)).filter(y => y != null))].sort((a, b) => a - b);
      let i = marks.findIndex(y => y > (v === 0 ? Y0 - 1 : year));
      const tick = () => {
        if (i < 0 || i >= marks.length) { setYear(Y1); return stop(); }
        setYear(marks[i++]); playing = setTimeout(tick, 900);
      };
      return tick();
    }
    let last = performance.now();
    const step = now => {
      v += (now - last) / 16000 * SMAX; last = now;   // about 16 seconds end to end
      if (v >= SMAX) { setYear(Y1); return stop(); }
      setYear(fromSlider(v));
      playing = requestAnimationFrame(step);
    };
    playing = requestAnimationFrame(step);
  });

  setVB({ x: 0, y: 0, w: W, h: H });
  setYear(Y1);
}

// ------------------------------------------------------------------ lifelines
function buildLifelines(mount) {
  const people = (App.data.stories || []).filter(s => s.born).map(s => ({
    id: s.id, name: decode(s.name || s.title), born: parseInt(s.born, 10), died: parseInt(s.died, 10) || Y1, role: s.role,
  })).filter(p => p.born).sort((a, b) => a.born - b.born);
  if (!people.length) return;
  const start = Math.floor(Math.min(...people.map(p => p.born)) / 50) * 50, end = Y1;

  const wrap = el('div', { class: 'll' });
  const caption = el('p', { class: 'll-cap', 'aria-live': 'polite' }, 'Move along the timeline to see who was alive at the same time. Tap a name to read their life.');
  const scroller = el('div', { class: 'll-scroll', tabindex: 0, 'aria-label': 'Lifelines of the cast, from ' + start + ' to today' });
  const track = el('div', { class: 'll-track' });
  const cursor = el('div', { class: 'll-cursor', hidden: true }, el('span', {}));
  scroller.append(track);
  mount.append(el('div', { class: 'll-head' }, el('h3', {}, 'Lifelines'),
    el('p', {}, 'Every person in the cast, on one timeline. Dalton was a boy when Lavoisier was weighing tin; Faraday was born while Priestley was still alive.')),
  wrap);
  wrap.append(scroller, caption);

  let px = 3;
  function layout() {
    const cw = scroller.clientWidth - 24;
    px = Math.max(cw < 600 ? 2.6 : 1.6, cw / (end - start));
    const X = y => 12 + (y - start) * px;
    const rows = [];
    const ROW = 30, TOP = 26;
    track.replaceChildren();
    track.style.width = X(end) + 12 + 'px';
    for (let y = start; y <= end; y += 10) {
      const major = y % 50 === 0;
      track.append(el('i', { class: 'll-tick' + (major ? ' major' : ''), style: `left:${X(y)}px` }));
      if (major) track.append(el('span', { class: 'll-yr', style: `left:${X(y)}px` }, y));
    }
    let maxEnd = 0;
    for (const p of people) {
      const labelW = p.name.length * 8.5 + 20;
      const out = labelW > X(p.died) - X(p.born);
      const endPx = out ? X(p.died) + labelW : X(p.died);
      maxEnd = Math.max(maxEnd, endPx);
      let r = rows.findIndex(e => e + 8 < X(p.born));
      if (r < 0) { r = rows.length; rows.push(0); }
      rows[r] = endPx;
      const w = X(p.died) - X(p.born);
      const a = el('a', { class: 'sl ll-bar' + (p.died >= Y1 ? ' living' : '') + (out ? ' out' : ''), href: '#story-' + p.id, 'data-story': p.id,
        style: `left:${X(p.born)}px;top:${TOP + r * ROW}px;width:${w}px`,
        'aria-label': `${p.name}, ${p.born} to ${p.died}. ${p.role || ''}` },
        el('span', { class: 'll-name' }, p.name));
      a.addEventListener('focus', () => describePerson(p));
      a.addEventListener('mouseenter', () => describePerson(p));
      track.append(a);
    }
    track.style.height = TOP + rows.length * ROW + 6 + 'px';
    track.style.width = Math.max(X(end) + 12, maxEnd + 12) + 'px';
    track.append(cursor);
    layout.X = X;
  }
  function alive(y) { return people.filter(p => p.born <= y && y <= p.died); }
  function describeYear(y) {
    const a = alive(y);
    caption.textContent = a.length ? `In ${y}: ${a.map(p => p.name).join(', ')}.` : `In ${y}, none of the cast had been born yet.`;
  }
  function describePerson(p) {
    const others = people.filter(q => q !== p && q.born <= p.died && p.born <= q.died).map(q => q.name);
    caption.textContent = `${p.name}, ${p.born} to ${p.died >= Y1 ? 'today' : p.died}. ` +
      (others.length ? `Alive at the same time as ${others.join(', ')}.` : 'No one else in the cast was alive at the same time.');
  }
  function setCursor(y, scroll) {
    if (y < start || y > end) { cursor.hidden = true; return; }
    cursor.hidden = false;
    cursor.style.left = layout.X(y) + 'px';
    cursor.firstChild.textContent = y;
    if (scroll) {
      const x = layout.X(y), sl = scroller.scrollLeft, w = scroller.clientWidth;
      if (x < sl + 40 || x > sl + w - 40) scroller.scrollLeft = x - w / 2;
    }
  }
  scroller.addEventListener('pointermove', e => {
    if (e.target.closest('.ll-bar')) return;
    const r = track.getBoundingClientRect();
    const y = Math.round(start + (e.clientX - r.left - 12) / px);
    if (y < start || y > end) return;
    setCursor(y); describeYear(y);
  });
  App.on('map:year', ({ year }) => { if (year >= start) { setCursor(year, true); describeYear(year); } else cursor.hidden = true; });
  layout();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
}

App.explorer('map', {
  mount(mount) {
    buildMap(mount);
    const ll = el('div', {class:'ll-mount'});
    mount.append(ll);
    buildLifelines(ll);
  },
});
