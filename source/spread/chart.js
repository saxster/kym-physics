// Small SVG charts for the left page, with live parts (a cursor, a tangent, a shaded area) that follow the
// figure's clock. Ported from Atlas of Physics' kinematics chapter (MIT, (c) 2026 Nathan Liow, see LICENSE-atlas.txt).
const CW = 420, CH = 110, CP = { l: 44, r: 12, t: 24, b: 22 };
export const sx = (x, R) => CP.l + (x - R.x0) / (R.x1 - R.x0) * (CW - CP.l - CP.r);
export const sy = (y, R) => CP.t + (1 - (y - R.y0) / (R.y1 - R.y0)) * (CH - CP.t - CP.b);
export const samples = (n, a, b, fn) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n; return [x, fn(x)]; });
const fmt = v => (v < 0 ? '−' : '') + Math.abs(v);

// key names the chart's live parts; live: any of 'cursor', 'tangent', 'area'
export function chart(key, R, { series, xlabel, ylabel, label, live = [], marks = [] }) {
  const X = x => sx(x, R), Y = y => sy(y, R);
  const paths = series.map(s => `<path class="${s.cls || 'curve'}" d="${s.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('')}"/>`).join('');
  const mk = marks.map(([x, y, t, dx = 6, dy = 14]) => `<circle class="mark" cx="${X(x)}" cy="${Y(y)}" r="3.5"/><text class="ax" x="${X(x) + dx}" y="${Y(y) + dy}">${t}</text>`).join('');
  const zero = R.y0 < 0 ? `<line class="zero" x1="${CP.l}" x2="${CW - CP.r}" y1="${Y(0)}" y2="${Y(0)}"/>` : '';
  const parts = (live.includes('area') ? `<path class="area" data-area="${key}"/>` : '')
    + (live.includes('tangent') ? `<line class="tan" data-tan="${key}"/>` : '')
    + (live.includes('cursor') ? `<circle class="cursor" r="4.5" data-cursor="${key}"/>` : '');
  return `<svg class="chart" viewBox="0 0 ${CW} ${CH}" role="img" aria-label="${label}">
    <rect class="frame" x="${CP.l}" y="${CP.t}" width="${CW - CP.l - CP.r}" height="${CH - CP.t - CP.b}"/>${zero}${paths}${parts}${mk}
    <text class="ax" x="${CP.l - 6}" y="${Y(R.y1) + 4}" text-anchor="end">${fmt(R.y1)}</text><text class="ax" x="${CP.l - 6}" y="${Y(R.y0) + 4}" text-anchor="end">${fmt(R.y0)}</text>
    <text class="ax" x="${CP.l}" y="${CH - 7}">${R.x0}</text><text class="ax" x="${CW - CP.r}" y="${CH - 7}" text-anchor="end">${R.x1}</text>
    <text class="lab" x="${CP.l}" y="${CP.t - 9}">${ylabel}</text><text class="ax" x="${(CP.l + CW - CP.r) / 2}" y="${CH - 7}" text-anchor="middle">${xlabel}</text>
  </svg>`;
}

// live updates, applied to every copy of the chart (the page and the turning leaf both hold one)
export function liveChart(roots, key, R, { fn, slope, t, half = 0.12 }) {
  const q = sel => roots.flatMap(el => [...el.querySelectorAll(sel)]);
  q(`circle[data-cursor="${key}"]`).forEach(c => { c.setAttribute('cx', sx(t, R)); c.setAttribute('cy', sy(fn(t), R)); });
  q(`path[data-area="${key}"]`).forEach(p => {
    let d = `M${sx(R.x0, R)},${sy(0, R)}`;
    for (let i = 0; i <= 60; i++) { const u = R.x0 + (t - R.x0) * i / 60; d += `L${sx(u, R).toFixed(1)},${sy(fn(u), R).toFixed(1)}`; }
    p.setAttribute('d', d + `L${sx(t, R)},${sy(0, R)}Z`);
  });
  if (slope) q(`line[data-tan="${key}"]`).forEach(l => {
    const m = slope(t), y = u => fn(t) + m * (u - t);
    let a = Math.max(R.x0, t - half), b = Math.min(R.x1, t + half);
    if (Math.abs(m) > 1e-9) for (const lim of [R.y0, R.y1]) { const u = t + (lim - fn(t)) / m; if (u > t && u < b) b = u; if (u < t && u > a) a = u; }
    l.setAttribute('x1', sx(a, R)); l.setAttribute('y1', sy(y(a), R)); l.setAttribute('x2', sx(b, R)); l.setAttribute('y2', sy(y(b), R));
  });
}
