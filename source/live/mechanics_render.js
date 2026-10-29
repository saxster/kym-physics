import { Group, Mesh, BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry, MeshStandardMaterial, BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, Vector3, Quaternion, DoubleSide } from "three";
function scene(lab) {
  if (!lab.kit) return null;
  const root = new Group();
  root.scale.setScalar(0.74);
  root.rotation.x = 0.12;
  root.rotation.y = -0.16;
  lab.kit.root.add(root);
  return root;
}
// Fit one authored envelope, keeping the same camera throughout a replay.
// Bounds are in the lesson scene's physical drawing coordinates.
function frame(lab,root,bounds,radius=null) {
 if(!root||!lab.frame)return;
 const key=JSON.stringify([bounds,radius]);if(root.userData.mechanicsFrame===key)return;
 const lo=new Vector3(...bounds.min),hi=new Vector3(...bounds.max),centre=lo.clone().add(hi).multiplyScalar(.5);
 root.position.copy(centre).multiply(root.scale).multiplyScalar(-1).applyQuaternion(root.quaternion);
 const scale=Math.max(...root.scale.toArray());
 lab.frame((radius??hi.sub(lo).length()*.5)*scale);
 root.userData.mechanicsFrame=key;
}
function anchor(parent,x=0,y=0,z=0) {
 if(!parent)return null;
 const point=new Group();point.position.set(x,y,z);parent.add(point);return point;
}
const material = (color, opacity = 1) => new MeshStandardMaterial({ color, roughness: 0.76, transparent: opacity < 1, opacity, side: DoubleSide });
function block(root, c, w = 1, h = 1, d = 0.5, x = 0, y = 0, z = 0, opacity = 1) {
  if (!root) return null;
  const m = new Mesh(new BoxGeometry(w, h, d), material(c, opacity));
  m.position.set(x, y, z);
  root.add(m);
  return m;
}
function ball(root, c, r = 0.15, x = 0, y = 0, z = 0, opacity = 1) {
  if (!root) return null;
  const m = new Mesh(new SphereGeometry(r, 20, 14), material(c, opacity));
  m.position.set(x, y, z);
  root.add(m);
  return m;
}
function rod(root, c, r = 0.04, length = 1, x = 0, y = 0, z = 0) {
  if (!root) return null;
  const m = new Mesh(new CylinderGeometry(r, r, length, 12), material(c));
  m.position.set(x, y, z);
  root.add(m);
  return m;
}
function disc(root, c, r = 0.8, x = 0, y = 0, z = 0) {
  if (!root) return null;
  const geometry = new CylinderGeometry(r, r, 0.025, 48);
  geometry.rotateX(Math.PI / 2);
  const m = new Mesh(geometry, material(c));
  m.position.set(x, y, z);
  root.add(m);
  return m;
}
function wire(root, c, points) {
  if (!root) return null;
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points.flat(), 3));
  const m = new Line(geometry, new LineBasicMaterial({ color: c }));
  root.add(m);
  return m;
}
function path(line2, points) {
  if (!line2) return;
  const pos = line2.geometry.getAttribute("position");
  if (pos.count !== points.length) {
    line2.geometry.setAttribute("position", new Float32BufferAttribute(points.flat(), 3));
  } else {
    points.forEach((p, i) => pos.setXYZ(i, ...p));
    pos.needsUpdate = true;
  }
  line2.geometry.computeBoundingSphere();
}
function vector(root, c) {
  if (!root) return { set() {
  } };
  const g = new Group(), shaft = new Mesh(new CylinderGeometry(0.025, 0.025, 1, 8), material(c)), tip = new Mesh(new ConeGeometry(0.085, 0.19, 10), material(c));
  g.add(shaft, tip);
  root.add(g);
  return { group: g, set(a, b) {
    const A = new Vector3(...a), B = new Vector3(...b), dir = B.clone().sub(A), len = dir.length();
    g.visible = len > 1e-7;
    if (!g.visible) return;
    const head = Math.min(0.19, len * 0.35), body = len - head;
    g.position.copy(A);
    g.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
    shaft.scale.set(1, body, 1);
    shaft.position.y = body / 2;
    tip.scale.set(1, head / 0.19, 1);
    tip.position.y = body + head / 2;
  } };
}
function ring(root, c, r = 1, normal = "z", x = 0, y = 0, z = 0) {
  return wire(root, c, Array.from({ length: 97 }, (_, i) => {
    const a = 2 * Math.PI * i / 96;
    return normal === "y" ? [x + r * Math.cos(a), y, z + r * Math.sin(a)] : [x + r * Math.cos(a), y + r * Math.sin(a), z];
  }));
}
const text = (ctx, c, s, x, y, size = 15, align = "left") => {
  ctx.fillStyle = c;
  ctx.font = `${size >= 16 ? 600 : 400} ${size}px Lexend,system-ui,sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(s, x, y);
};
function line(ctx, c, points, width = 2, dash = []) {
  ctx.strokeStyle = c;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.stroke();
  ctx.setLineDash([]);
}
function arrow(ctx, c, x, y, dx, dy, label = "") {
  if (Math.hypot(dx, dy) < 0.1) return;
  line(ctx, c, [[x, y], [x + dx, y + dy]], 2.5);
  const a = Math.atan2(dy, dx);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x + dx, y + dy);
  ctx.lineTo(x + dx - 9 * Math.cos(a - 0.45), y + dy - 9 * Math.sin(a - 0.45));
  ctx.lineTo(x + dx - 9 * Math.cos(a + 0.45), y + dy - 9 * Math.sin(a + 0.45));
  ctx.closePath();
  ctx.fill();
  if (label) text(ctx, c, label, x + dx + 8, y + dy - 6, 13);
}
function dot(ctx, c, x, y, r = 6) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}
function rectangle(ctx, c, x, y, w, h, fill = false) {
  ctx.strokeStyle = c;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  if (fill) {
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.16;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }
}
function axes(ctx, c, { x = 52, y = 193, w = 530, h = 145, xlabel = "", ylabel = "" }) {
  line(ctx, c, [[x, y - h], [x, y], [x + w, y]], 1);
  text(ctx, c, xlabel, x + w, y + 28, 13, "right");
  text(ctx, c, ylabel, x, y - h - 24, 13);
  return { X: (v) => x + w * v, Y: (v) => y - h * v };
}
function bars(ctx, c, rows, { x = 200, y = 30, width = 350, max = 1, gap = 41 } = {}) {
  rows.forEach((r, i) => {
    const yy = y + i * gap;
    text(ctx, c.ink, r.label, 20, yy + 17, 14);
    ctx.fillStyle = r.color || c.electron;
    ctx.fillRect(x, yy, Math.max(0, Math.min(width, width * r.value / max)), 22);
    text(ctx, c.ink, r.text ?? r.value.toFixed(2), x + width + 8, yy + 17, 13);
  });
}
function plot(ctx, c, series, { xlabel = "time (s)", ylabel = "", xmin = 0, xmax = 1, ymin = 0, ymax = 1, x = 52, y = 190, w = 530, h = 140 } = {}) {
  const a = axes(ctx, c.ink, { x, y, w, h, xlabel, ylabel }), X = (v) => a.X((v - xmin) / (xmax - xmin)), Y = (v) => a.Y((v - ymin) / (ymax - ymin));
  const tick=v=>v===0?'0':Math.abs(v)<.001||Math.abs(v)>=1e5?v.toExponential(1):Number(v.toPrecision(3)).toString();
  for(let i=0;i<=2;i++){
    const xv=xmin+(xmax-xmin)*i/2,yv=ymin+(ymax-ymin)*i/2;
    line(ctx,c.rule,[[X(xv),y],[X(xv),y+4]],1);text(ctx,c.muted,tick(xv),X(xv),y+15,12,'center');
    text(ctx,c.muted,tick(yv),x-7,Y(yv)+4,12,'right');
  }
  series.forEach((s) => line(ctx, s.color, s.values.map(([xx, yy]) => [X(xx), Y(yy)]), s.width || 2, s.dash || []));
  return { X, Y };
}
const samples = (n, fn) => Array.from({ length: n }, (_, i) => fn(i / (n - 1)));
function stepDecimals(step) {
  for (let digits = 0; digits < 4; digits++) {
    const scaledStep = step * 10 ** digits;
    if (Math.abs(scaledStep - Math.round(scaledStep)) < 1e-8) return digits;
  }
  return 4; // Derived replay intervals need bounded, readable precision.
}
function slider(api, state, key, label, min, max, step, value, unit = "", update = () => {
}) {
  state[key] = value;
  const digits = stepDecimals(step);
  return api.slider(label, { min, max, step, value, fmt: (v) => `${Number(v).toFixed(digits)}${unit ? " " + unit : ""}`, onInput: (v) => {
    state[key] = v;
    update();
  } });
}
function clock(api, state, update, max = 4, rate = 0.5, value = 0) {
  const control = slider(api, state, "time", "Replay time", 0, max, max / 100, value, "s", update);
  api.loop((dt) => {
    if (dt > 0) {
      state.time = (state.time + dt * rate) % max;
      control.set(state.time);
      update();
    }
  });
  return control;
}
function tabs(api, state, labels, update, start = 0) {
  state.mode = start;
  api.tabs(labels, (i) => {
    state.mode = i;
    update();
  }, start);
}
export {
  anchor,
  arrow,
  axes,
  ball,
  bars,
  block,
  clock,
  disc,
  dot,
  frame,
  line,
  path,
  plot,
  rectangle,
  ring,
  rod,
  samples,
  scene,
  slider,
  tabs,
  text,
  vector,
  wire
};
