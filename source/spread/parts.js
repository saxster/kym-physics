// Parts kit: paper solids with facing-based shading, and helpers that build them.
// Every part carries a line tone (faint, lo, mid, hi, lit) and an explode vector.
// Ported from Atlas of Physics (MIT, (c) 2026 Nathan Liow, see LICENSE-atlas.txt); colours follow the book's theme.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const TONE = { faint: 0.2, lo: 0.4, mid: 0.6, hi: 0.8, lit: 1.0 };

const SHADE_V = `
  varying vec3 vWN;
  void main() {
    vec3 n = normal;
    #ifdef USE_INSTANCING
      n = mat3(instanceMatrix) * n;
    #endif
    vWN = normalize(mat3(modelMatrix) * n);
    #include <begin_vertex>
    #include <project_vertex>
  }`;
const SHADE_F = `
  uniform vec3 uTop; uniform vec3 uLight; uniform vec3 uDark; uniform float uOpacity; uniform float uLit;
  varying vec3 vWN;
  void main() {
    vec3 n = normalize(vWN);
    // sides: close tones by facing, continuous so curved parts never staircase
    float side = clamp(dot(normalize(vec3(-0.55, 0.0, 0.83)), normalize(vec3(n.x, 0.0, n.z) + 1e-5)) * 0.5 + 0.5, 0.0, 1.0);
    vec3 c = mix(uDark, uLight, side);
    c = mix(c, uTop, smoothstep(0.55, 0.95, n.y));
    c = mix(c, uDark * 0.97, smoothstep(-0.4, -0.95, n.y));
    c = mix(c, uTop, uLit * 0.35);
    gl_FragColor = vec4(c, uOpacity);
    #include <colorspace_fragment>
  }`;
// Three tones per palette (top, lit side, shaded side), read from the book's theme so paper is paper in sepia,
// light and dark alike. themePalette() runs once, before any material is made (createEngine calls it).
export const PALETTE = {};
const css = (name, fallback) => (getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback);
// any CSS colour (including display-p3) as #rrggbb: paint one pixel and read it back
const solid = s => {
  const c = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  c.fillStyle = '#000'; c.fillStyle = s; c.fillRect(0, 0, 1, 1);
  const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
};
export function themePalette() {
  const sheet = new THREE.Color(solid(css('--sheet', '#fbfaf5'))), ink = new THREE.Color(solid(css('--ink', '#1d332d')));
  const dark = sheet.getHSL({}).l < 0.4;
  const mix = (a, b, u) => '#' + a.clone().lerp(b, u).getHexString();
  const tri = (c, spread = 1) => { const base = new THREE.Color(solid(c)); return [mix(base, sheet, 0.35 * spread), mix(base, ink, 0.02), mix(base, ink, 0.16 * spread)]; };
  const paperTop = dark ? sheet.clone().lerp(ink, 0.10) : sheet.clone().lerp(new THREE.Color('#ffffff'), 0.6);
  Object.assign(PALETTE, {
    paper: [ '#' + paperTop.getHexString(), mix(sheet, ink, dark ? 0.06 : 0.04), mix(sheet, ink, dark ? 0.0 : 0.14)],
    base: [mix(sheet, ink, 0.03), mix(sheet, ink, 0.07), mix(sheet, ink, 0.17)],
    dark: [mix(sheet, ink, 0.45), mix(sheet, ink, 0.52), mix(sheet, ink, 0.60)],
    ink: [mix(sheet, ink, 0.75), mix(sheet, ink, 0.86), mix(sheet, ink, 0.95)],
    red: tri(css('--proton', '#a94730')),
    blue: tri(css('--electron', '#356d83')),
    green: tri(css('--green', '#2e604a')),
    ochre: tri(css('--neutron', '#936022')),
    board: [mix(sheet, ink, 0.0), mix(sheet, ink, 0.02), mix(sheet, ink, 0.06)],
  });
  return { sheet: '#' + sheet.getHexString(), ink: '#' + ink.getHexString(), dark,
    inks: [0.18, 0.32, 0.5, 0.82, 1].map(u => mix(sheet, ink, u)) };
}
const cache = new Map();
export function shadeMat(pal = 'paper', { opacity = 1 } = {}) {
  const key = pal + opacity;
  if (opacity === 1 && cache.has(key)) return cache.get(key);
  const [top, light, dark] = PALETTE[pal];
  const m = new THREE.ShaderMaterial({
    vertexShader: SHADE_V, fragmentShader: SHADE_F, transparent: opacity < 1, depthWrite: opacity >= 1,
    uniforms: { uTop: { value: new THREE.Color(top) }, uLight: { value: new THREE.Color(light) }, uDark: { value: new THREE.Color(dark) }, uOpacity: { value: opacity }, uLit: { value: 0 } },
  });
  if (opacity === 1) cache.set(key, m);
  return m;
}

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export function part(parent, geo, { tone = 'mid', pal = 'paper', pos = [0, 0, 0], rot, name, ex = [0, 0, 0], mat } = {}) {
  const m = new THREE.Mesh(geo, mat || shadeMat(pal));
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.userData = { tone: TONE[tone], baseTone: TONE[tone], part: name, home: m.position.clone(), ex: V(...ex) };
  parent.add(m);
  return m;
}
export const box = (w, h, d, r = 0.02) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2));
export const cyl = (r, h, seg = 32, r2 = r) => new THREE.CylinderGeometry(r2, r, h, seg);
export const xAxis = g => g.rotateZ(-Math.PI / 2);
export const zAxis = g => g.rotateX(Math.PI / 2);

// flat ink lines (ticks, grids); never part of the edge pass
export function lines(parent, coords, color = PALETTE.dark[1], opacity = 1) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
  l.userData = { noEdge: true };
  parent.add(l);
  return l;
}

// a solid arrow along +y, resized each frame with setArrow
export function arrow(parent, pal, { r = 0.035, head = 0.16, headR = 0.09, name, tone = 'hi' } = {}) {
  const g = new THREE.Group();
  // vectors are what the diagram is about: draw them over solids, as a free-body diagram does
  const mat = shadeMat(pal).clone(); mat.depthTest = false; mat.transparent = true;   // sorts after translucent solids
  const shaft = part(g, cyl(r, 1, 20), { pal, tone, name, mat });
  const tip = part(g, new THREE.ConeGeometry(headR, head, 28), { pal, tone, name, mat });
  shaft.renderOrder = tip.renderOrder = 10;
  g.userData.arrow = { shaft, tip, head };
  parent.add(g);
  return g;
}
const UP = V(0, 1, 0);
export function setArrow(a, from, vec, opacity = 1) {
  const len = vec.length(), { shaft, tip, head } = a.userData.arrow;
  a.visible = opacity > 0.01 && len > 0.02;
  if (!a.visible) return;
  const hl = Math.min(head, len * 0.5), sl = Math.max(len - hl, 0.001);
  a.position.copy(from);
  a.quaternion.setFromUnitVectors(UP, vec.clone().normalize());
  shaft.scale.set(1, sl, 1); shaft.position.y = sl / 2;
  tip.scale.set(1, hl / head, 1); tip.position.y = sl + hl / 2;
}

// a tube whose path changes every frame: built once, then its vertices are rewritten in place
// (rebuilding a TubeGeometry per frame cost more than the rest of the frame). geo.update(pts)
// takes n + 1 points; the cross-section is carried along by parallel transport.
export function liveTube(n, radius, radial = 6) {
  const geo = new THREE.TubeGeometry(new THREE.LineCurve3(V(0, 0, 0), V(0, 1, 0)), n, radius, radial);
  const pos = geo.attributes.position.array, nor = geo.attributes.normal.array, T = V(), N = V(), B = V();
  const cs = Array.from({ length: radial + 1 }, (_, j) => -Math.cos(j / radial * Math.PI * 2)), sn = cs.map((_, j) => Math.sin(j / radial * Math.PI * 2));
  const bb = geo.boundingBox = new THREE.Box3(), bs = geo.boundingSphere = new THREE.Sphere();
  geo.update = pts => {
    bb.makeEmpty();
    for (let i = 0; i <= n; i++) {
      const p = pts[i];
      T.subVectors(pts[Math.min(i + 1, n)], pts[Math.max(i - 1, 0)]).normalize();
      if (i === 0) N.set(Math.abs(T.y) < 0.9 ? 0 : 1, Math.abs(T.y) < 0.9 ? 1 : 0, 0);
      N.addScaledVector(T, -N.dot(T)).normalize();
      B.crossVectors(T, N);
      bb.expandByPoint(p);
      for (let j = 0, k = i * (radial + 1) * 3; j <= radial; j++, k += 3) {
        const qx = N.x * cs[j] + B.x * sn[j], qy = N.y * cs[j] + B.y * sn[j], qz = N.z * cs[j] + B.z * sn[j];
        nor[k] = qx; nor[k + 1] = qy; nor[k + 2] = qz;
        pos[k] = p.x + radius * qx; pos[k + 1] = p.y + radius * qy; pos[k + 2] = p.z + radius * qz;
      }
    }
    geo.attributes.position.needsUpdate = geo.attributes.normal.needsUpdate = true;
    bb.expandByScalar(radius); bb.getBoundingSphere(bs);
  };
  return geo;
}
