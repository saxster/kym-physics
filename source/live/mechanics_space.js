import { Group } from "three";
import * as M from "./mechanics_models.mjs";
import * as R from "./mechanics_render.js";
const fmt = (x, n = 2) => Number.isFinite(x) ? x.toFixed(n) : "unbounded";
const point = (m, x, y, z = 0) => m?.position.set(x, y, z);
const scaled = (m, x, y, z = 1) => m?.scale.set(x, y, z);
const show = (m, on) => {
  if (m) m.visible = on;
};
const primary = (ctx, c, title) => R.text(ctx, c.ink, title, 20, 25, 16);
function fall(lab, api, c) {
  const s = { time: 0, air: 1, mode: 0 }, root = R.scene(lab), params = [{ mass: 0.1, area: 1e-3, shape: 0 }, { mass: 1, area: 1e-3, shape: 0 }], sets = [];
  const cds = [0.47, 1.1, 1, 1.3], names = ["Dense sphere", "Flat disc", "Hammer", "Feather"];
  for (let i = 0; i < 2; i++) {
    const g = root ? new Group() : null;
    if (root) root.add(g);
    const sphere = R.ball(g, i ? c.electron : c.proton, 0.16), disc = R.disc(g, i ? c.electron : c.proton, 0.2);
    const hammer = root ? new Group() : null, feather = root ? new Group() : null;
    if (g) {
      g.add(hammer, feather);
    }
    R.rod(hammer, c.ink, 0.035, 0.5, 0, -0.15);
    R.block(hammer, i ? c.electron : c.proton, 0.4, 0.17, 0.16, 0, 0.15);
    R.rod(feather, c.ink, 0.014, 0.65);
    for (let j = 0; j < 6; j++) {
      const y = -0.24 + j * 0.085;
      for (const sign of [-1, 1]) R.wire(feather, i ? c.electron : c.proton, [[0, y, 0], [sign * 0.17, y + 0.14, 0]]);
    }
    sets.push({ g, meshes: [sphere, disc, hammer, feather], weight: R.vector(root, c.proton), drag: R.vector(root, c.electron) });
  }
  R.wire(root, c.rule, [[-1.7, 1.5, 0], [-1.7, -1.5, 0], [-1.5, -1.5, 0]]);
  let selected = 0;
  const update = () => lab.refresh(), mass = R.slider(api, s, "mass", "Selected body mass", 1e-3, 1, 1e-3, 0.1, "kg", () => {
    params[selected].mass = s.mass;
    update();
  }), area = R.slider(api, s, "area", "Selected projected area", 1e-4, 0.02, 1e-4, 1e-3, "m\xB2", () => {
    params[selected].area = s.area;
    update();
  });
  R.slider(api, s, "air", "Air density multiplier", 0, 1, 0.05, 1, "", update);
  api.tabs(["Edit red body", "Edit blue body"], (i) => {
    selected = i;
    s.mass = params[i].mass;
    s.area = params[i].area;
    mass.set(s.mass);
    area.set(s.area);
    update();
  });
  api.tabs(names, (i) => {
    params[selected].shape = i;
    update();
  });
  api.tabs(["Two dense spheres", "Equal mass, different shape", "Hammer and feather"], (i) => {
    const presets = [[{ mass: 0.1, area: 1e-3, shape: 0 }, { mass: 1, area: 1e-3, shape: 0 }], [{ mass: 0.01, area: 1e-3, shape: 0 }, { mass: 0.01, area: 0.01, shape: 1 }], [{ mass: 0.5, area: 4e-3, shape: 2 }, { mass: 1e-3, area: 0.01, shape: 3 }]];
    params.splice(0, 2, ...presets[i]);
    s.mass = params[selected].mass;
    s.area = params[selected].area;
    mass.set(s.mass);
    area.set(s.area);
    s.time = 0;
    update();
  });
  R.tabs(api, s, ["Earth gravity", "Moon gravity"], update);
  R.clock(api, s, update, 6, 0.45, 0.8);
  lab.redraw((ctx) => {
    const g = s.mode ? 1.67 : 9.8, values = params.map((p) => M.fallingBody(s.time, p.mass, p.area, cds[p.shape], s.air, g)), forceScale = 1 / Math.max(...values.map((v) => v.weight));
    sets.forEach((set, i) => {
      const p = params[i], v = values[i], y = 1.5 - v.distance * 3 / 200, k = Math.sqrt(p.area / 1e-3);
      point(set.g, i ? 1 : -1, y);
      set.meshes.forEach((m, j) => {
        show(m, p.shape === j);
        scaled(m, k, k, k);
      });
      set.weight.set([i ? 1 : -1, y, 0.3], [i ? 1 : -1, y - v.weight * forceScale, 0.3]);
      set.drag.set([(i ? 1 : -1) + 0.3, y, 0.3], [(i ? 1 : -1) + 0.3, y + v.drag * forceScale, 0.3]);
    });
    primary(ctx, c, "Gravity on body mg; air on body cv\xB2; net / mass = acceleration");
    const maxV = 60, plots = values.map((v, i) => ({ color: i ? c.electron : c.proton, values: R.samples(61, (u) => [u * 6, M.fallingBody(u * 6, params[i].mass, params[i].area, cds[params[i].shape], s.air, g).v]) }));
    const ax = R.plot(ctx, c, plots, { x: 45, y: 180, w: 255, h: 115, xmax: 6, ymax: maxV, ylabel: "speed (m/s)", xlabel: "seconds" });
    values.forEach((v, i) => {
      R.dot(ctx, i ? c.electron : c.proton, ax.X(s.time), ax.Y(v.v), 4);
      if (v.terminal <= 60) R.line(ctx, i ? c.electron : c.proton, [[45, ax.Y(v.terminal)], [300, ax.Y(v.terminal)]], 1, [4, 4]);
      R.text(ctx, i ? c.electron : c.proton, `${names[params[i].shape]}: ${params[i].mass} kg`, 330, 62 + i * 73, 14);
      R.text(ctx, c.ink, `mg ${fmt(v.weight, 3)} N; drag ${fmt(v.drag, 3)} N`, 330, 83 + i * 73, 13);
      R.text(ctx, c.ink, `a = (mg \u2212 drag)/m = ${fmt(v.a)} m/s\xB2`, 330, 104 + i * 73, 13);
    });
    R.text(ctx, c.ink, "Vertical path: 200 m; silhouettes enlarged. Dashed = terminal speed.", 20, 231, 13);
    lab.say(`t=${fmt(s.time)} s, g=${g} m/s\xB2. In vacuum mg/m=g for both independently adjustable masses. Red/blue distances ${values.map((v) => fmt(v.distance)).join(" / ")} m; acceleration ${values.map((v) => fmt(v.a)).join(" / ")} m/s\xB2. Weight arrows share ${fmt(1 / forceScale, 3)} N per scene unit. Drag balances weight at terminal speed ${values.map((v) => Number.isFinite(v.terminal) ? fmt(v.terminal) : "unbounded in vacuum").join(" / ")} m/s. Projected area and shape coefficient are independent of mass; coefficients are illustrative constant values.`);
  });
}
function circle(lab, api, c) {
  const s = { elapsed: 0, released: false }, root = R.scene(lab);
  R.ring(root, c.ink, 1.6);
  const body = R.ball(root, c.proton, 0.13), velocity = R.vector(root, c.electron), inward = R.vector(root, c.proton), update = () => lab.refresh();
  R.slider(api, s, "speed", "Speed", 1, 6, 0.5, 4, "m/s", () => {
    s.released = false;
    s.elapsed = 0;
    update();
  });
  R.slider(api, s, "angle", "Release position", 0, 360, 5, 45, "\xB0", () => {
    s.released = false;
    s.elapsed = 0;
    update();
  });
  api.button("Release / reset", () => {
    s.released = !s.released;
    s.elapsed = 0;
    update();
  });
  api.loop((dt) => {
    if (dt > 0 && s.released) {
      s.elapsed = Math.min(0.35, s.elapsed + dt * 0.35);
      update();
    }
  });
  lab.redraw((ctx) => {
    const th = s.angle * Math.PI / 180, p = M.circle(2, s.speed, th), x = p.x + (s.released ? p.vx * s.elapsed : 0), y = p.y + (s.released ? p.vy * s.elapsed : 0);
    point(body, x * 0.8, y * 0.8);
    velocity.set([x * 0.8, y * 0.8, 0], [x * 0.8 + p.vx * 0.2, y * 0.8 + p.vy * 0.2, 0]);
    inward.set([x * 0.8, y * 0.8, 0.05], [x * 0.8 + (s.released ? 0 : p.ax * 0.12), y * 0.8 + (s.released ? 0 : p.ay * 0.12), 0.05]);
    primary(ctx, c, "Compare two velocity arrows at nearby points");
    const a = M.circle(2, s.speed, th - 0.18), b = M.circle(2, s.speed, th + 0.18), xx = 210, yy = 135, k = 15;
    R.arrow(ctx, c.electron, xx, yy, a.vx * k, -a.vy * k);
    R.arrow(ctx, c.electron, xx, yy, b.vx * k, -b.vy * k);
    R.arrow(ctx, c.proton, xx + a.vx * k, yy - a.vy * k, (b.vx - a.vx) * k, -(b.vy - a.vy) * k, "\u0394v");
    R.text(ctx, c.ink, s.released ? "Released: constraint removed." : `Inward a: ${fmt(p.a)} m/s\xB2`, 355, 89, 14);
    R.text(ctx, c.ink, "Equal speed, different directions; the difference is inward.", 25, 222, 14);
    lab.say(s.released ? `Released at ${s.angle}\xB0: velocity stays tangent, (${fmt(p.vx)}, ${fmt(p.vy)}) m/s. No outward force was added. The marker is ${fmt(s.elapsed)} s past release. The view freezes after 0.35 s; physical motion continues.` : `At radius 2 m and speed ${fmt(s.speed, 1)} m/s, acceleration is ${fmt(p.a)} m/s\xB2 inward. Equal-length velocity arrows differ because their directions differ.`);
  });
}
function gravity(lab, api, c) {
  const s = {}, root = R.scene(lab), earth = R.ball(root, c.electron, 0.55), moon = R.ball(root, c.muted, 0.12), centre = R.ball(root, c.proton, 0.05), shells = [1, 2, 3].map((r) => ({ r, surface: R.ball(root, c.electron, 1, 0, 0, 0, 0.055), points: M.sphericalField(r, 18).points.map(() => R.ball(root, c.proton, 0.025)), vectors: Array.from({ length: 8 }, () => R.vector(root, c.electron)) })), probeShell = R.ball(root, c.proton, 1, 0, 0, 0, 0.025), field = R.vector(root, c.proton), tangent = R.wire(root, c.ink, [[0, 0, 0], [1, 0, 0]]), curve = R.wire(root, c.proton, R.samples(61, () => [0, 0, 0])), update = () => lab.refresh();
  const distance = R.slider(api, s, "distance", "Distance from Earth centre", 1, 60, 1, 2, "Earth radii", update);
  R.slider(api, s, "angle", "Orbital position", 0, 360, 5, 45, "\xB0", update);
  R.tabs(api, s, ["Inverse-square surfaces", "Shared centre of mass", "Apple and Moon"], () => {
    if (s.mode === 2) {
      s.distance = 60;
      distance.set(60);
    }
    update();
  });
  lab.redraw((ctx) => {
    const p = M.gravity(s.distance), a = s.angle * Math.PI / 180, k = 2 / Math.max(3, s.distance), sep = 2.7, b = sep * 0.0123 / 1.0123;
    distance.input.disabled = s.mode === 2;
    show(tangent, s.mode === 2);
    show(curve, s.mode === 2);
    show(centre, s.mode === 1);
    show(probeShell, s.mode === 0);
    shells.forEach((shell) => {
      const f = M.sphericalField(shell.r, 18);
      show(shell.surface, s.mode === 0);
      scaled(shell.surface, shell.r * k, shell.r * k, shell.r * k);
      shell.points.forEach((m, i) => {
        show(m, s.mode === 0);
        point(m, ...f.points[i].map((v) => v * k));
      });
      shell.vectors.forEach((v, i) => {
        const q = f.points[i * 2], n = q.map((x) => x / shell.r);
        v.set(q.map((x) => x * k), q.map((x, j) => x * k - n[j] * 0.55 / shell.r ** 2));
        show(v.group, s.mode === 0);
      });
    });
    if (s.mode === 1) {
      scaled(earth, 1, 1, 1);
      point(earth, -b * Math.cos(a), -b * Math.sin(a));
      point(moon, (sep - b) * Math.cos(a), (sep - b) * Math.sin(a));
      show(field.group, false);
    } else if (s.mode === 2) {
      scaled(earth, 1, 1, 1);
      point(earth, -2, -0.8);
      point(moon, 1.5, 0.5 - p.tangentGap60 * 0.13);
      field.set([1.5, 0.5, 0], [1.5, 0.5 - p.tangentGap60 * 0.13, 0]);
      R.path(tangent, [[-1.5, 0.5, 0], [1.5, 0.5, 0]]);
      R.path(curve, R.samples(61, (u) => [-1.5 + 3 * u, 0.5 - p.tangentGap60 * 0.13 * u * u, 0]));
    } else {
      point(earth, 0, 0);
      scaled(earth, k / 0.55, k / 0.55, k / 0.55);
      point(moon, s.distance * k, 0);
      scaled(probeShell, s.distance * k, s.distance * k, s.distance * k);
      field.set([s.distance * k, 0, 0], [s.distance * k - 0.8 * p.ratio, 0, 0]);
    }
    primary(ctx, c, s.mode === 2 ? "Moon falls below a tangent while its radius stays constant" : s.mode === 1 ? "Earth and Moon share a centre of mass" : "Same 18 flux samples spread over 1 : 4 : 9 surface areas");
    if (s.mode === 0) {
      [1, 2, 3].forEach((r, i) => {
        const f = M.sphericalField(r, 18), x = 95 + i * 195;
        R.text(ctx, c.ink, `r = ${r}R`, x, 53, 16, "center");
        ctx.beginPath();
        ctx.arc(x, 113, r * 17, 0, 2 * Math.PI);
        ctx.strokeStyle = c.electron;
        ctx.stroke();
        f.points.forEach((q) => R.dot(ctx, c.proton, x + q[0] * 17, 113 - q[1] * 17, 2));
        R.text(ctx, c.electron, `area = ${r * r} \xD7 4\u03C0R\xB2`, x, 185, 15, "center");
        R.text(ctx, c.proton, `g = ${fmt(f.field)} m/s\xB2`, x, 209, 15, "center");
      });
      R.text(ctx, c.ink, `Probe ${s.distance}R: g=${fmt(p.g, 5)} m/s\xB2. Common view: ${fmt(1 / k, 1)}R / scene unit.`, 20, 225, 14);
    } else if (s.mode === 2) {
      R.text(ctx, c.ink, "Apple, 1 s: 4.90 m down", 25, 82, 18);
      R.text(ctx, c.electron, `Moon, 60 s: ${fmt(p.tangentGap60)} m below tangent`, 25, 131, 18);
      R.text(ctx, c.ink, `${fmt(p.sideways60 / 1e3, 1)} km sideways; enlarged tangent gap`, 25, 181, 15);
    } else {
      R.text(ctx, c.ink, `Earth\u2013Moon mass ratio: 1 : 0.0123`, 25, 83, 17);
      R.text(ctx, c.proton, `barycentre ${fmt(p.barycentreKm, 0)} km from Earth centre`, 25, 132, 17);
    }
    lab.say(s.mode === 0 ? `Enclosing spherical surfaces at R, 2R and 3R have areas 4\u03C0R\xB2, 16\u03C0R\xB2 and 36\u03C0R\xB2. The same 18 samples represent equal flux bundles, so their area per bundle grows 1:4:9, while field arrows shrink 1:1/4:1/9. The selected sphere and probe are at ${s.distance} Earth radii on the labelled common autoscale. Its field is ${fmt(p.g, 5)} m/s\xB2.` : s.mode === 1 ? "Both bodies orbit the red barycentre; bodies are enlarged relative to separation." : `At 60R the Moon falls ${fmt(p.tangentGap60)} m below its tangent in 60 s, without changing Earth distance. This enlarged tangent construction compares the apple\u2019s 4.90 m fall in 1 s.`);
  });
}
function weightless(lab, api, c) {
  const s = {}, root = R.scene(lab), cabin = root ? new Group() : null;
  if (root) root.add(cabin);
  R.block(cabin, c.ink, 2.6, 2, 1.2, 0, 0, 0, 0.1);
  R.block(cabin, c.ink, 2.6, 0.08, 1.2, 0, -1);
  const plate = R.block(cabin, c.electron, 0.75, 0.06, 0.6, -0.55, -0.65), astronaut = cabin ? new Group() : null;
  if (cabin) cabin.add(astronaut);
  R.ball(astronaut, c.proton, 0.15, 0, 0.55);
  R.block(astronaut, c.proton, 0.3, 0.45, 0.22, 0, 0.19);
  R.block(astronaut, c.ink, 0.36, 0.1, 0.25, 0, -0.09);
  const springs = [R.wire(cabin, c.electron, R.samples(40, () => [0, 0, 0])), R.wire(cabin, c.electron, R.samples(40, () => [0, 0, 0]))], gravity2 = R.vector(root, c.proton), support = R.vector(root, c.electron), external = R.ball(root, c.electron, 0.18, 2, 1), trail = R.wire(root, c.rule, [[2, 1, 0], [2, -1, 0]]), update = () => lab.refresh();
  R.slider(api, s, "height", "Altitude", 0, 500, 10, 400, "km", update);
  R.tabs(api, s, ["Freely falling together", "Supported cabin"], update);
  R.clock(api, s, update, 0.65, 0.12, 0);
  lab.redraw((ctx) => {
    const p = M.cabinFall(s.time, s.height, s.mode === 0), compression = p.compression * 2, deck = -0.63 - compression, fallY = p.displacement * 0.8;
    point(cabin, -0.4, fallY);
    point(plate, -0.55, deck);
    point(astronaut, -0.55, deck + 0.17);
    point(external, 2, 1 + fallY);
    springs.forEach((wire, i) => R.path(wire, R.samples(40, (u) => [-0.8 + i * 0.5 + 0.04 * Math.sin(u * 12 * Math.PI), -0.96 + u * (deck + 0.93), 0.1])));
    gravity2.set([-0.95, fallY + deck + 0.55, 0.5], [-0.95, fallY + deck + 0.55 - p.g * 0.07, 0.5]);
    support.set([-0.6, fallY + deck, 0.5], [-0.6, fallY + deck + p.sensor * 0.07, 0.5]);
    primary(ctx, c, "External view: cabin and astronaut fall together");
    const y = 70 - p.displacement * 30;
    R.rectangle(ctx, c.ink, 55, y, 165, 90);
    R.dot(ctx, c.proton, 105, y + 35, 9);
    R.dot(ctx, c.electron, 175, 70 - p.displacement * 30 + 35, 7);
    R.line(ctx, c.rule, [[30, 185], [255, 185]], 1);
    R.text(ctx, c.ink, "Same displacement in external frame", 30, 215, 13);
    R.text(ctx, c.proton, `gravity ${fmt(p.g)} m/s\xB2`, 300, 76, 18);
    R.text(ctx, c.electron, `scale: ${fmt(p.support)} N`, 300, 115, 18);
    R.text(ctx, c.ink, `spring compression: ${fmt(p.compression * 1e3, 1)} mm`, 300, 155, 15);
    R.text(ctx, c.ink, `shared fall: ${fmt(-p.displacement)} m`, 300, 193, 15);
    lab.say(`At ${s.height} km, gravity is ${fmt(p.g)} m/s\xB2. ${s.mode ? "A supported cabin compresses a 7000 N/m scale under the 70 kg astronaut." : "The cabin, scale and astronaut all have acceleration g; the scale spring is uncompressed."} Scale normal force ${fmt(p.support)} N, physical compression ${fmt(p.compression * 1e3, 1)} mm (shown 2\xD7). The external reference and cabin use a common 0.8 scene-unit/metre displacement scale. Short local fall ignores tidal variation and horizontal orbital motion.`);
  });
}
function kepler(lab, api, c) {
  const s = {}, root = R.scene(lab);
  R.ball(root, c.neutron, 0.16, 0, 0);
  const body = R.ball(root, c.proton, 0.1), other = R.ball(root, c.electron, 0.08), orbit = R.wire(root, c.ink, R.samples(121, () => [0, 0, 0])), outer = R.wire(root, c.rule, R.samples(121, () => [0, 0, 0])), wedges = [R.wire(root, c.proton, R.samples(22, () => [0, 0, 0])), R.wire(root, c.proton, R.samples(22, () => [0, 0, 0]))], vel = R.vector(root, c.proton), update = () => lab.refresh();
  let planet = "Earth, nominal e";
  const eccentricity = R.slider(api, s, "e", "Teaching eccentricity", 0, 0.8, 1e-4, 0.0167, "", () => {
    planet = "User-selected eccentricity";
    update();
  });
  api.tabs(["Earth: e=0.0167", "Mars: e=0.0935", "Enlarged: e=0.5"], (i) => {
    s.e = [0.0167, 0.0935, 0.5][i];
    planet = ["Earth, nominal e", "Mars, nominal e", "Enlarged teaching orbit"][i];
    eccentricity.set(s.e);
    update();
  });
  R.slider(api, s, "a", "Semi-major axis", 0.7, 2, 0.1, 1, "model units", update);
  R.slider(api, s, "phase", "Mean anomaly", 0, 360, 5, 0, "\xB0", update);
  lab.redraw((ctx) => {
    const mean = s.phase * Math.PI / 180, p = M.orbit(s.e, s.a, mean), q = M.orbit(s.e, s.a * 1.4, mean / 1.4 ** 1.5), k = 1.05 / s.a;
    const pt = (e, a, m) => {
      const v = M.orbit(e, a, m);
      return [v.x * k, v.y * k, 0];
    };
    R.path(orbit, R.samples(121, (u) => pt(s.e, s.a, u * 2 * Math.PI)));
    R.path(outer, R.samples(121, (u) => pt(s.e, s.a * 1.4, u * 2 * Math.PI)));
    point(body, p.x * k, p.y * k);
    point(other, q.x * k, q.y * k);
    vel.set([p.x * k, p.y * k, 0.03], [p.x * k + p.vx * 0.3, p.y * k + p.vy * 0.3, 0.03]);
    [0, Math.PI].forEach((m, i) => R.path(wedges[i], [[0, 0, 0], ...R.samples(20, (u) => pt(s.e, s.a, m + (u - 0.5) * 0.4)), [0, 0, 0]]));
    primary(ctx, c, `${planet}; e=${fmt(s.e, 4)}; focus at central body`);
    R.text(ctx, c.ink, `r = ${fmt(p.radius)} model units`, 25, 72, 16);
    R.text(ctx, c.proton, `speed = ${fmt(p.speed)} units / time`, 25, 108, 16);
    R.text(ctx, c.ink, `inner period ${fmt(p.period)}; outer ${fmt(q.period)}`, 25, 147, 15);
    R.text(ctx, c.electron, `period ratio ${fmt(q.period / p.period, 3)} = 1.4^(3/2)`, 25, 183, 15);
    R.text(ctx, c.ink, `areal rate = ${fmt(p.arealRate, 4)} area / time`, 25, 220, 14);
    lab.say(`The selected orbit has r=${fmt(p.radius)}, speed ${fmt(p.speed)} and constant areal rate ${fmt(p.arealRate, 4)}. Both outlined sectors span the same elapsed time. A 1.4-times-larger orbit takes ${fmt(q.period / p.period, 3)} times as long; both use GM=1.`);
  });
}
function torsion(lab, api, c) {
  const s = { sign: 1 }, root = R.scene(lab);
  R.rod(root, c.ink, 0.015, 2, 0, 0.9);
  const bar = root ? new Group() : null;
  if (root) root.add(bar);
  R.block(bar, c.ink, 2, 0.04, 0.04);
  R.ball(bar, c.electron, 0.04, -1, 0);
  R.ball(bar, c.electron, 0.04, 1, 0);
  const large = [R.ball(root, c.proton, 0.08, -1, 0.6), R.ball(root, c.proton, 0.08, 1, -0.6)], equilibrium = R.wire(root, c.rule, [[-1, 0, 0], [1, 0, 0]]), dial = R.vector(root, c.proton), update = () => lab.refresh();
  R.ring(root, c.ink, 0.5, "z", 2, 0, 0);
  R.slider(api, s, "mass", "Each large mass", 0, 10, 0.5, 5, "kg", update);
  R.slider(api, s, "distance", "Closest separation", 0.06, 0.2, 0.01, 0.1, "m", update);
  R.slider(api, s, "disturbance", "Initial disturbance", 0, 60, 5, 20, "arcseconds", () => {
    s.time = 0;
    update();
  });
  R.clock(api, s, update, 5e3, 250, 0);
  api.button("Switch large masses to the other side", () => {
    s.sign *= -1;
    s.time = 0;
    update();
  });
  lab.redraw((ctx) => {
    const p = M.torsion(s.mass, s.distance * s.sign), d = M.torsionResponse(p.angle, s.time, s.disturbance * Math.PI / (180 * 3600));
    point(large[0], -1, -s.sign * s.distance * 2.5);
    point(large[1], 1, s.sign * s.distance * 2.5);
    if (bar) bar.rotation.z = d.angle;
    dial.set([2, 0, 0], [2 - 0.5 * Math.sin(d.angle * 800), 0.5 * Math.cos(d.angle * 800), 0]);
    const a = p.angle;
    R.path(equilibrium, [[-Math.cos(a), -Math.sin(a), 0.05], [Math.cos(a), Math.sin(a), 0.05]]);
    primary(ctx, c, "A disturbed balance settles towards gravity equilibrium");
    const unit = 180 * 3600 / Math.PI, max = 250;
    const ax = R.plot(ctx, c, [{ color: c.proton, values: R.samples(151, (u) => [u * 5e3, M.torsionResponse(p.angle, u * 5e3, s.disturbance / unit).angle * unit]) }, { color: c.rule, values: [[0, p.angle * unit], [5e3, p.angle * unit]], dash: [4, 4] }], { x: 55, y: 185, w: 500, h: 105, xmax: 5e3, ymin: -max, ymax: max, ylabel: "twist (arcsec)", xlabel: "time (s)" });
    R.dot(ctx, c.electron, ax.X(s.time), ax.Y(d.angle * unit), 5);
    R.text(ctx, c.ink, `equilibrium ${fmt(p.angle * unit)} arcsec; torque ${p.torque.toExponential(2)} N\xB7m`, 25, 54, 14);
    R.text(ctx, c.ink, "k=10\u207B\u2075 N\xB7m/rad, I=.016 kg\xB7m\xB2, damping ratio .12; separate dial \xD7800", 25, 230, 13);
    lab.say(`The gravitational torque ${p.torque.toExponential(3)} N\xB7m sets equilibrium ${fmt(p.angle * unit)} arcseconds. A ${s.disturbance} arcsecond disturbance starts at rest and decays with damping ratio .12, period ${fmt(d.period, 0)} s. Current twist ${fmt(d.angle * unit)} arcseconds; the grey reference is equilibrium. The bar uses its physical angle on a common 2.5 scene-unit/metre apparatus scale; only the separate dial amplifies angle 800\xD7, and ball markers are schematic. Damping removes oscillation energy, not gravity torque. Apparatus values are illustrative.`);
  });
}
function perturbation(lab, api, c) {
  const s = {}, root = R.scene(lab);
  R.ball(root, c.neutron, 0.16);
  const body = R.ball(root, c.proton, 0.09), planet = R.ball(root, c.electron, 0.14), guess = R.ring(root, c.proton, 0.18), base = R.wire(root, c.ink, [[0, 0, 0], [0, 0, 0]]), pert = R.wire(root, c.proton, [[0, 0, 0], [0, 0, 0]]), force = R.vector(root, c.electron), update = () => lab.refresh();
  let cached = null, trial = null, key = "", revealed = false;
  const phase = Math.PI / 3, k = 0.85;
  R.clock(api, s, update, 8, 0.5);
  R.slider(api, s, "mass", "Perturber / Sun mass", 0, 0.01, 1e-3, 1e-3, "", update);
  R.slider(api, s, "prediction", "Predicted starting angle", 0, 360, 5, 180, "\xB0", update);
  api.button("Reveal / hide outer planet", () => {
    revealed = !revealed;
    update();
  });
  lab.redraw((ctx) => {
    const newKey = `${s.mass}/${s.prediction}`;
    if (key !== newKey) {
      cached = M.perturbedOrbit(s.mass, 8, phase);
      trial = M.perturbedOrbit(s.mass, 8, s.prediction * Math.PI / 180);
      key = newKey;
      R.path(base, cached.baseline.map(([x, y]) => [x * k, y * k, 0]));
      R.path(pert, cached.perturbed.map(([x, y]) => [x * k, y * k, 0.025]));
    }
    const n = cached.residual.length, i = Math.min(n - 1, Math.floor(s.time / 8 * (n - 1))), p = cached.perturbed[i], outer = M.perturberPosition(s.time, phase), pred = M.perturberPosition(s.time, s.prediction * Math.PI / 180), acc = M.perturbingAcceleration(p[0], p[1], s.time, s.mass, phase);
    point(body, p[0] * k, p[1] * k, 0.04);
    point(planet, outer.x * k, outer.y * k);
    show(planet, revealed);
    point(guess, pred.x * k, pred.y * k);
    force.set([p[0] * k, p[1] * k, 0.05], [p[0] * k + acc[0] * 80, p[1] * k + acc[1] * 80, 0.05]);
    show(force.group, revealed && s.mass > 0);
    const max = Math.max(1e-5, ...cached.residual.map(([x, y]) => Math.hypot(x, y)), ...trial.residual.map(([x, y]) => Math.hypot(x, y))), score = Math.sqrt(cached.residual.reduce((sum, v, j) => sum + (v[0] - trial.residual[j][0]) ** 2 + (v[1] - trial.residual[j][1]) ** 2, 0) / n);
    primary(ctx, c, "Infer a hidden outer mass by matching its computed residual");
    R.plot(ctx, c, [{ color: c.proton, values: cached.residual.map((v, j) => [j / (n - 1) * 8, Math.hypot(...v)]) }, { color: c.electron, values: trial.residual.map((v, j) => [j / (n - 1) * 8, Math.hypot(...v)]), dash: [4, 4] }], { xmax: 8, ymax: max * 1.05, ylabel: "residual magnitude (model units)" });
    R.text(ctx, c.ink, `red: observed model; dashed: prediction; vector RMS error ${score.toExponential(2)}`, 25, 232, 13);
    lab.say(`Your starting angle is ${s.prediction}\xB0. Matching the full two-component residual gives RMS error ${score.toExponential(3)} model units. ${revealed ? `The actual starting angle is ${fmt(phase * 180 / Math.PI, 1)}\xB0; blue arrow is its differential heliocentric perturbing acceleration, enlarged 80\xD7.` : "The actual planet is hidden; the outlined marker shows your prediction."} Both simulations use mass ratio ${s.mass}; zero mass removes the signal. The solar orbit, outer radius 2.5, and relative positions share one scale. This is a synthetic inference exercise, not historical observations.`);
  });
}
function mission(lab, api, c) {
  const s = {}, root = R.scene(lab), planet = R.ball(root, c.electron, 0.4), craft = R.ball(root, c.proton, 0.07), track = R.wire(root, c.proton, R.samples(151, () => [0, 0, 0])), beforeTrack = R.wire(root, c.rule, R.samples(151, () => [0, 0, 0])), before = R.vector(root, c.rule), after = R.vector(root, c.electron), impulse = R.vector(root, c.proton), scaleBar = R.wire(root, c.ink, [[0, 0, 0], [1, 0, 0]]), update = () => lab.refresh();
  R.slider(api, s, "dv", "Earth forward burn", 0, 0.7, 0.02, 0.1, "km/s", update);
  R.slider(api, s, "brake", "Moon retrograde burn", 0, 0.9, 0.05, 0.5, "km/s", update);
  R.tabs(api, s, ["Earth impulse \u2192 later apogee", "Moon flyby \u2192 burn \u2192 capture"], () => {
    s.progress = 0;
    update();
  });
  R.slider(api, s, "progress", "Incoming \u2190 burn at 0 \u2192 coast", -1, 1, 0.01, 0, "", update);
  api.loop((dt) => {
    if (dt > 0) {
      s.progress = Math.min(1, s.progress + dt * 0.07);
      update();
    }
  });
  lab.redraw((ctx) => {
    const lunar = s.mode === 1, p = lunar ? M.capture(1.5, s.brake) : M.burn(6601, 71e3, s.dv), rp = lunar ? p.rp : 6601, mu = lunar ? 4902.8001 : M.MU_EARTH_KM, radius = lunar ? 1737.4 : 6371, v0 = lunar ? p.vBefore : p.v0, v1 = p.v, extent = p.bound ? Math.max(p.apoKm, radius * 3) : lunar ? 3e4 : 4e5, k = 4 / (extent + rp), end = M.missionCoast(rp, v1, mu, extent), incoming = Math.min(end, M.missionCoast(rp, v0, mu, extent)), t = s.progress < 0 ? s.progress * incoming : s.progress * end, q = M.conicState(rp, s.progress < 0 ? v0 : v1, mu, t), pt = (q2) => [q2.x * k + 1.8, q2.y * k, 0];
    R.path(track, R.samples(151, (u) => pt(M.conicState(rp, v1, mu, u * end))));
    R.path(beforeTrack, R.samples(151, (u) => pt(M.conicState(rp, v0, mu, -incoming + u * 2 * incoming))));
    point(planet, 1.8, 0);
    scaled(planet, radius * k / 0.4, radius * k / 0.4, radius * k / 0.4);
    point(craft, ...pt(q));
    const burn = [1.8 + rp * k, 0, 0.05], velocityScale = 0.7 / Math.max(v0, v1);
    before.set(burn, [burn[0], v0 * velocityScale, 0.05]);
    after.set([burn[0] + 0.12, 0, 0.05], [burn[0] + 0.12, v1 * velocityScale, 0.05]);
    impulse.set([burn[0] + 0.25, v0 * velocityScale, 0.05], [burn[0] + 0.25, v1 * velocityScale, 0.05]);
    R.path(scaleBar, [[-2, -1.35, 0], [-1, -1.35, 0]]);
    primary(ctx, c, lunar ? "Incoming grey flyby \u2192 retrograde impulse \u2192 red coast" : "Tangential impulse now; changed apogee reached later");
    R.text(ctx, c.rule, `before ${fmt(v0, 3)} km/s`, 25, 65, 16);
    R.text(ctx, c.electron, `after ${fmt(v1, 3)} km/s; \u0394v=${fmt(v1 - v0, 3)}`, 25, 98, 16);
    R.text(ctx, c.proton, s.progress < 0 ? "Before burn" : s.progress === 0 ? "Impulse at periapsis" : p.bound && s.progress === 1 ? "Coast reaches changed apogee" : "Coasting after burn", 25, 134, 17);
    R.text(ctx, c.ink, `t=${fmt(t / 3600, 2)} h; r=${fmt(q.radius, 0)} km; ${p.bound ? "bound" : "unbound"}`, 25, 171, 16);
    const flat = (q2) => {
      const w = pt(q2);
      return [460 + w[0] * 28, 127 - w[1] * 28];
    };
    R.line(ctx, c.rule, R.samples(101, (u) => flat(M.conicState(rp, v0, mu, -incoming + u * 2 * incoming))), 1);
    R.line(ctx, c.proton, R.samples(101, (u) => flat(M.conicState(rp, v1, mu, u * end))), 2);
    R.dot(ctx, c.electron, 460 + 1.8 * 28, 127, Math.max(2, radius * k * 28));
    R.dot(ctx, c.proton, ...flat(q), 4);
    const bx = 460 + burn[0] * 28;
    R.arrow(ctx, c.rule, bx - 4, 127, 0, -v0 * velocityScale * 35);
    R.arrow(ctx, c.electron, bx + 4, 127, 0, -v1 * velocityScale * 35);
    R.line(ctx, c.ink, [[400, 211], [450, 211]], 2);
    R.text(ctx, c.ink, `${fmt(50 / (28 * k), 0)} km`, 425, 231, 12, "center");
    R.text(ctx, c.ink, `3D bar ${fmt(1 / k, 0)} km; velocity scale shared`, 25, 216, 13);
    lab.say(`At periapsis radius ${fmt(rp, 1)} km, a ${fmt(v1 - v0, 3)} km/s tangential impulse changes specific energy from ${fmt(v0 * v0 / 2 - mu / rp, 3)} to ${fmt(p.energy, 3)} km\xB2/s\xB2. The craft marker is propagated for ${fmt(t / 3600, 2)} hours ${s.progress < 0 ? "before" : "after"} the event. ${p.bound ? `Apogee ${fmt(p.apoKm, 0)} km occurs after ${fmt(end / 3600, 2)} hours; it does not jump there during the burn.` : "The outgoing conic is unbound and stops at the labelled display horizon."} Grey = preburn conic; red = postburn coast; the paired arrows share one velocity scale. Two-body impulsive model, not the historical mission reconstruction.`);
  });
}
export {
  circle,
  fall,
  gravity,
  kepler,
  mission,
  perturbation,
  torsion,
  weightless
};
