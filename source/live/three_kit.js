// Shared 3D kit for live figures: one look for every molecule and crystal in the book.
// Matte spheres in the book's element colours, ink bonds, a label on every atom,
// drag (or the arrow buttons) to turn, gentle auto-turn while playing.
import {
  Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight, AmbientLight, Group, Mesh,
  SphereGeometry, CylinderGeometry, MeshStandardMaterial, Vector3, Quaternion, Sprite, SpriteMaterial,
  CanvasTexture, Color, ConeGeometry, Raycaster, SRGBColorSpace, LineDashedMaterial, BufferGeometry, Line,
} from 'three';
import { Live, colors } from './core.js';

export const RADIUS = { H: 0.30, C: 0.42, N: 0.42, O: 0.44, Na: 0.40, Cl: 0.62, S: 0.5, Li: 0.38, X: 0.4 };
const DARK_TEXT = Live.DARK_TEXT;

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}

const labelCache = new Map();
function labelTexture(text, fg) {
  const key = text + fg;
  if (labelCache.has(key)) return labelCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = fg; g.font = `600 ${text.length > 1 ? 58 : 70}px Lexend, system-ui, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 64, 68);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; labelCache.set(key, t); return t;
}

/** Create a 3D stage. Returns kit {scene, root, camera, renderer, render(), fit(radius), spin, ...}. */
export function makeStage(stage, api, { height = 360, distance = 7, label = '' } = {}) {
  const c = colors();
  const wrap = document.createElement('div');
  wrap.className = 'live-3d';
  wrap.style.height = height + 'px';
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', label);
  wrap.tabIndex = 0;
  stage.appendChild(wrap);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  wrap.appendChild(renderer.domElement);
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, distance);
  scene.add(new HemisphereLight(0xffffff, 0x8a8a7a, 1.4));
  scene.add(new AmbientLight(0xffffff, 0.35));
  const key = new DirectionalLight(0xffffff, 1.8); key.position.set(4, 6, 8); scene.add(key);
  const root = new Group(); scene.add(root);
  const ray = new Raycaster();
  const kit = {
    c, scene, root, camera, renderer, wrap,
    spinSpeed: 0.35, // radians per second while playing
    dirty: true,
    render() {
      // keep every atom label on the side of its sphere that faces the camera
      root.updateMatrixWorld(true);
      const atoms = [];
      root.traverse((m) => { if (m.userData && m.userData.label) atoms.push(m); });
      for (const m of atoms) {
        const s = m.userData.label;
        s.position.copy(m.worldToLocal(camera.position.clone()).normalize().multiplyScalar(1.02));
        // show a label only if its atom is the first thing the eye meets along that line
        const p = m.getWorldPosition(new Vector3());
        ray.set(camera.position, p.clone().sub(camera.position).normalize());
        const hit = ray.intersectObjects(atoms, false)[0];
        s.visible = !!hit && hit.object === m && (m.material.opacity ?? 1) > 0.5;
      }
      renderer.render(scene, camera); kit.dirty = false;
    },
    resize() {
      const w = wrap.clientWidth || 600, h = wrap.clientHeight || height;
      renderer.setSize(w, h, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
      camera.aspect = w / h; camera.updateProjectionMatrix(); kit.render();
    },
    clear() { while (root.children.length) { const o = root.children.pop(); o.traverse?.((m) => { m.geometry?.dispose?.(); }); } kit.dirty = true; },
  };
  const ro = new ResizeObserver(() => kit.resize()); ro.observe(wrap);
  api.onCleanup(() => { ro.disconnect(); renderer.dispose(); });
  kit.resize();

  // drag to rotate (pointer), arrows to rotate (keyboard)
  let drag = null, userTurned = 0;
  const rotate = (dx, dy) => {
    const q1 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), dx);
    const q2 = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), dy);
    root.quaternion.premultiply(q1).premultiply(q2);
    kit.render(); userTurned = 2.5;
  };
  wrap.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener('pointermove', (e) => { if (!drag) return; rotate((e.clientX - drag.x) * 0.01, (e.clientY - drag.y) * 0.01); drag = { x: e.clientX, y: e.clientY }; });
  wrap.addEventListener('pointerup', () => { drag = null; });
  wrap.addEventListener('keydown', (e) => {
    const k = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, -0.2], ArrowDown: [0, 0.2] }[e.key];
    if (k) { rotate(...k); e.preventDefault(); }
  });
  wrap.style.touchAction = 'none';
  api.button('Turn left', () => rotate(-0.35, 0));
  api.button('Turn right', () => rotate(0.35, 0));
  api.loop((dt) => {
    if (userTurned > 0) userTurned -= dt;
    else if (dt > 0 && kit.spinSpeed) { root.rotateOnWorldAxis(new Vector3(0, 1, 0), kit.spinSpeed * dt); kit.dirty = true; }
    kit.onFrame?.(dt);
    if (kit.dirty || dt === 0) kit.render();
  });
  return kit;
}

const matCache = new Map();
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new MeshStandardMaterial({ color: new Color(color), roughness: 0.55, metalness: 0.0, ...opts }));
  return matCache.get(key);
}
const sphereGeo = new SphereGeometry(1, 32, 24);
const cylGeo = new CylinderGeometry(1, 1, 1, 16);

/** Add an atom with a label that always faces the camera. */
export function addAtom(parent, el, pos, { r, label = true, color, opacity } = {}) {
  const rad = r ?? RADIUS[el] ?? 0.4;
  const m = new Mesh(sphereGeo, mat(color || Live.EL[el] || '#bbb', opacity != null ? { transparent: true, opacity } : {}));
  m.scale.setScalar(rad); m.position.set(...pos);
  parent.add(m);
  if (label && rad >= 0.25) {
    const fg = DARK_TEXT.has(el) ? '#fbfaf5' : '#1d2b27';
    const s = new Sprite(new SpriteMaterial({ map: labelTexture(el, fg), depthWrite: false, depthTest: false, transparent: true }));
    s.renderOrder = 10;
    s.scale.setScalar(1.15); // local to the unit sphere, so it scales with the atom
    m.add(s); m.userData.label = s;
  }
  return m;
}

/** A bond between two points; order 1–3 draws parallel rods. */
export function addBond(parent, a, b, order = 1, c = colors(), radius = 0.07) {
  const A = new Vector3(...a), B = new Vector3(...b);
  const dir = B.clone().sub(A); const len = dir.length();
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
  const side = new Vector3(1, 0, 0).applyQuaternion(q).multiplyScalar(radius * 2.3);
  const offs = order === 1 ? [0] : order === 2 ? [-0.5, 0.5] : [-1, 0, 1];
  const out = [];
  for (const k of offs) {
    const m = new Mesh(cylGeo, mat(c.ink === '#888' ? '#33483f' : c.ink));
    m.scale.set(radius * (order > 1 ? 0.75 : 1), len, radius * (order > 1 ? 0.75 : 1));
    m.quaternion.copy(q); m.position.copy(mid).addScaledVector(side, k);
    parent.add(m); out.push(m);
  }
  return out;
}

/** An arrow from a to b (for dipoles and forces). */
export function addArrow(parent, a, b, color, radius = 0.045) {
  const A = new Vector3(...a), B = new Vector3(...b);
  const dir = B.clone().sub(A); const len = dir.length(); const head = Math.min(0.32, len * 0.35);
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
  const g = new Group();
  const shaft = new Mesh(cylGeo, mat(color)); shaft.scale.set(radius, len - head, radius);
  shaft.position.copy(A).addScaledVector(dir.clone().normalize(), (len - head) / 2); shaft.quaternion.copy(q);
  const cone = new Mesh(new ConeGeometry(radius * 2.6, head, 18), mat(color));
  cone.position.copy(A).addScaledVector(dir.clone().normalize(), len - head / 2); cone.quaternion.copy(q);
  g.add(shaft, cone); parent.add(g); return g;
}

/** A dashed line (for hydrogen bonds or weak attractions between layers). */
export function addDashed(parent, a, b, color) {
  const geo = new BufferGeometry().setFromPoints([new Vector3(...a), new Vector3(...b)]);
  const l = new Line(geo, new LineDashedMaterial({ color: new Color(color), dashSize: 0.12, gapSize: 0.09 }));
  l.computeLineDistances(); parent.add(l); return l;
}

/** Build a molecule from {atoms:[[el,x,y,z],...], bonds:[[i,j,order],...]} centred at the origin. */
export function addMolecule(parent, mol, { scale = 1, c = colors() } = {}) {
  const g = new Group();
  const cen = [0, 0, 0];
  mol.atoms.forEach(([, x, y, z]) => { cen[0] += x; cen[1] += y; cen[2] += z; });
  cen.forEach((v, i) => { cen[i] = v / mol.atoms.length; });
  const P = mol.atoms.map(([, x, y, z]) => [(x - cen[0]) * scale, (y - cen[1]) * scale, (z - cen[2]) * scale]);
  (mol.bonds || []).forEach(([i, j, o]) => addBond(g, P[i], P[j], o, c));
  const meshes = mol.atoms.map(([el], i) => addAtom(g, el, P[i]));
  parent.add(g);
  return { group: g, positions: P, meshes };
}

/** Real molecular geometry (Å-ish units, scaled for display). Bond lengths and angles are realistic. */
export const MOLS = (() => {
  const d = Math.PI / 180;
  const tet = (r) => [[r, r, r], [r, -r, -r], [-r, r, -r], [-r, -r, r]].map((v) => v.map((x) => x / Math.sqrt(3)));
  const H2O = { atoms: [['O', 0, 0, 0], ['H', 0.96 * Math.sin(52.25 * d), -0.96 * Math.cos(52.25 * d), 0], ['H', -0.96 * Math.sin(52.25 * d), -0.96 * Math.cos(52.25 * d), 0]], bonds: [[0, 1, 1], [0, 2, 1]] };
  const CO2 = { atoms: [['C', 0, 0, 0], ['O', 1.16, 0, 0], ['O', -1.16, 0, 0]], bonds: [[0, 1, 2], [0, 2, 2]] };
  const CH4 = { atoms: [['C', 0, 0, 0], ...tet(1.09).map((v) => ['H', ...v])], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] };
  const nhA = 106.7 * d; // H–N–H angle
  const nhR = 1.01, nhy = -0.38;
  const ring = Math.sqrt(nhR * nhR - nhy * nhy);
  const NH3 = { atoms: [['N', 0, 0, 0], ...[0, 120, 240].map((a) => ['H', ring * Math.cos(a * d), nhy, ring * Math.sin(a * d)])], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] };
  return { H2O, CO2, CH4, NH3 };
})();
