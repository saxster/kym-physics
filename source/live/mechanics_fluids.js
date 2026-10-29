import { Mesh, SphereGeometry, MeshStandardMaterial, CylinderGeometry, DoubleSide, LatheGeometry, Vector2 } from "three";
import * as M from "./mechanics_models.mjs";
import * as R from "./mechanics_render.js";
const fmt = (x, n = 2) => x.toFixed(n), point = (m, x, y, z = 0) => m?.position.set(x, y, z), scaled = (m, x, y, z = 1) => m?.scale.set(x, y, z), show = (m, on) => {
  if (m) m.visible = on;
};
const title = (ctx, c, t) => R.text(ctx, c.ink, t, 20, 25, 16);
function pressure(lab, api, c) {
  const s = { face: 1 }, root = R.scene(lab), body = R.block(root, c.proton, 2, 1, 0.5, 0, 0, 0, 0.6), floor = R.block(root, c.ink, 4, 0.06, 2, 0, -0.6), arrows = Array.from({ length: 6 }, () => R.vector(root, c.electron)), update = () => lab.refresh();
  api.slider("Turn the same solid onto a face", { min: 0, max: 2, step: 1, value: 1, fmt: (v) => ["small: 0.005 m\xB2", "middle: 0.010 m\xB2", "large: 0.020 m\xB2"][v], onInput: (v) => {
    s.face = v;
    update();
  } });
  R.slider(api, s, "depth", "Immersed top depth", 0.5, 4, 0.25, 2, "m", update);
  R.tabs(api, s, ["Same weight, different area", "Water on all six faces"], update);
  lab.redraw((ctx) => {
    const area = [5e-3, 0.01, 0.02][s.face], p = M.pressure(98, area);
    show(floor, s.mode === 0);
    if (body) {
      body.rotation.set(0, 0, 0);
      if (s.mode) {
        scaled(body, 0.5, 1, 2);
        point(body, 0, 0);
      } else {
        scaled(body, 1, 1, 1);
        if (s.face === 0) body.rotation.z = Math.PI / 2;
        if (s.face === 2) body.rotation.x = Math.PI / 2;
        point(body, 0, -0.57 + [2, 1, 0.5][s.face] / 2);
      }
    }
    const directions = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    directions.forEach((d, i) => {
      if (s.mode) {
        const depth = s.depth + (1 - d[1]) * 0.25, gauge = 1e3 * 9.8 * depth, len = 0.35 + gauge / 98e3;
        arrows[i].set(d.map((x) => x * (0.55 + len)), d.map((x) => x * 0.55));
        show(arrows[i].group, true);
      } else {
        show(arrows[i].group, i === 2);
        const top = -0.57 + [2, 1, 0.5][s.face];
        arrows[i].set([0, top + 0.6, 0], [0, top, 0]);
      }
    });
    title(ctx, c, s.mode ? "Pressure is scalar; face forces have directions" : "A fixed 98 N spread over different areas");
    if (!s.mode) {
      R.text(ctx, c.ink, `force: 98 N`, 25, 80, 18);
      R.text(ctx, c.ink, `area: ${fmt(area, 3)} m\xB2`, 25, 123, 17);
      R.text(ctx, c.proton, `pressure: ${fmt(p.pressure / 1e3)} kPa`, 25, 170, 18);
      R.text(ctx, c.ink, "Turning a load changes area, not its weight.", 25, 220, 14);
    } else {
      const top = 1e3 * 9.8 * s.depth, bottom = 1e3 * 9.8 * (s.depth + 0.5);
      R.text(ctx, c.ink, `top: ${fmt(top / 1e3)} kPa gauge`, 25, 75, 16);
      R.text(ctx, c.ink, `bottom: ${fmt(bottom / 1e3)} kPa gauge`, 25, 113, 16);
      R.text(ctx, c.electron, `bottom \u2212 top force = ${fmt((bottom - top) * 0.25, 0)} N up`, 25, 157, 16);
      R.text(ctx, c.ink, "Left/right and front/back forces cancel.", 25, 201, 15);
    }
    lab.say(s.mode ? `A half-metre cube has gauge pressure ${fmt(9.8 * s.depth)} kPa at its top and ${fmt(9.8 * (s.depth + 0.5))} kPa at its bottom. Multiplying the difference by each face\u2019s 0.25 m\xB2 area gives 1225 N upward. Ambient pressure adds equally on opposite faces.` : `The same 0.20 \xD7 0.10 \xD7 0.05 m solid is turned, keeping its 98 N weight. Pressure = 98 N \xF7 ${fmt(area, 3)} m\xB2 = ${fmt(p.pressure / 1e3)} kPa. It changes orientation, not shape or mass.`);
  });
}
function suction(lab, api, c) {
  const s = {}, root = R.scene(lab), column = R.block(root, c.electron, 0.26, 1, 0.26, -1, 0, 0, 0.65), tube = R.block(root, c.ink, 0.34, 3.2, 0.34, -1, 0.1, 0, 0.1), reservoir = R.block(root, c.electron, 1.4, 0.22, 1, -1, -1.51, 0, 0.5), dish = R.block(root, c.ink, 1.5, 0.07, 1.1, -1, -1.66), gas = R.block(root, c.muted, 0.25, 0.22, 0.25, -1, 1.45, 0, 0.22), card = R.block(root, c.ink, 0.6, 0.04, 0.6, -1, -0.82), mouth = R.ball(root, c.proton, 0.26, -1, 1.75), lip = R.ring(root, c.ink, 0.12, "z", -1, 1.59, 0.2), halves = [], outside = [], inside = [], resultants = [R.vector(root, c.proton), R.vector(root, c.proton)], up = R.vector(root, c.electron), down = R.vector(root, c.proton), gasForce = R.vector(root, c.muted), update = () => lab.refresh();
  if (root) for (const sign of [-1, 1]) {
    const m = new Mesh(new SphereGeometry(0.68, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), new MeshStandardMaterial({ color: c.neutron, transparent: true, opacity: 0.45, side: DoubleSide }));
    m.rotation.z = -sign * Math.PI / 2;
    m.position.x = 1 + sign * 0.05;
    root.add(m);
    halves.push(m);
    for (const a of [-0.7, 0, 0.7]) {
      outside.push({ sign, a, v: R.vector(root, c.electron) });
      inside.push({ sign, a, v: R.vector(root, c.muted) });
    }
  }
  R.slider(api, s, "inside", "Gas / mouth / interior pressure", 0, 101e3, 1e3, 0, "Pa", update);
  let liquid = 0;
  api.tabs(["Water", "Mercury"], (i) => {
    liquid = i;
    update();
  });
  R.tabs(api, s, ["Barometer", "Straw and mouth", "Hemispheres cutaway", "Sealed glass"], update);
  lab.redraw((ctx) => {
    const rho = liquid ? 13600 : 1e3, p = M.suction(101e3, s.inside, rho), k = 0.27, h = p.height, hem = s.mode === 2, glass = s.mode === 3, straw = s.mode === 1, A = glass ? 0.01 : 1e-4, W = rho * 9.8 * (glass ? 0.1 : h) * A;
    [column, tube, gas].forEach((m) => show(m, !hem));
    [reservoir, dish].forEach((m) => show(m, !hem && !glass));
    show(card, glass);
    show(mouth, straw);
    show(lip, straw);
    halves.forEach((m) => show(m, hem));
    const visualHeight = glass ? 1 : h * k;
    scaled(column, 1, Math.max(1e-4, visualHeight), 1);
    point(column, -1, glass ? -0.3 : -1.4 + visualHeight / 2);
    scaled(tube, 1, glass ? 0.42 : 1, 1);
    point(tube, -1, glass ? -0.25 : 0.1);
    const gasTop = glass ? 0.42 : 1.7, liquidTop = glass ? 0.2 : -1.4 + visualHeight;
    point(gas, -1, (gasTop + liquidTop) / 2);
    scaled(gas, 1, Math.max(1e-3, gasTop - liquidTop) / 0.22, 1);
    const forceScale = 0.8 / (101e3 * A), base = glass ? -0.8 : -1.4;
    up.set([-0.65, base, 0], [-0.65, base + 101e3 * A * forceScale, 0]);
    down.set([-0.15, base + 0.7, 0], [-0.15, base + 0.7 - W * forceScale, 0]);
    gasForce.set([-1.35, glass ? 0.2 : -1.4 + visualHeight, 0], [-1.35, (glass ? 0.2 : -1.4 + visualHeight) - s.inside * A * forceScale, 0]);
    [up, down, gasForce].forEach((v) => show(v.group, !hem));
    outside.forEach(({ sign, a, v }) => {
      const n = [sign * Math.cos(a), Math.sin(a), 0], face = [1 + sign * 0.05 + n[0] * 0.68, n[1] * 0.68, 0];
      v.set(face.map((x, j) => x + n[j] * 0.45), face);
      show(v.group, hem);
    });
    inside.forEach(({ sign, a, v }) => {
      const n = [sign * Math.cos(a), Math.sin(a), 0], face = [1 + sign * 0.05 + n[0] * 0.6, n[1] * 0.6, 0.1];
      v.set(face.map((x, j) => x - n[j] * s.inside / 101e3 * 0.45), face);
      show(v.group, hem && s.inside > 0);
    });
    resultants.forEach((v, i) => {
      const sign = i ? 1 : -1, x = 1 + sign * 0.75;
      v.set([x, -1, 0], [x - sign * 0.8 * p.difference / 101e3, -1, 0]);
      show(v.group, hem && p.difference > 0);
    });
    title(ctx, c, ["Reservoir air supports gas pressure and column weight", "Mouth lowers top pressure; reservoir air drives the liquid", "Outside and inside pressures give a \u0394p resultant", "Initial force account on a sealed card"][s.mode]);
    if (hem) {
      ctx.strokeStyle = c.ink;
      ctx.beginPath();
      ctx.arc(140, 130, 53, Math.PI / 2, 3 * Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(150, 130, 53, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      R.arrow(ctx, c.electron, 48, 130, 38, 0);
      R.arrow(ctx, c.electron, 242, 130, -38, 0);
      R.arrow(ctx, c.muted, 135, 130, -s.inside / 101e3 * 38, 0);
      R.arrow(ctx, c.muted, 155, 130, s.inside / 101e3 * 38, 0);
      R.arrow(ctx, c.proton, 95, 192, p.difference / 101e3 * 35, 0);
      R.arrow(ctx, c.proton, 195, 192, -p.difference / 101e3 * 35, 0);
      R.text(ctx, c.electron, "outside 101 kPa inward", 285, 75, 16);
      R.text(ctx, c.muted, `inside ${fmt(s.inside / 1e3, 1)} kPa outward`, 285, 115, 16);
      R.text(ctx, c.proton, `each net ${fmt(p.separatingForce, 0)} N`, 285, 159, 17);
      R.text(ctx, c.ink, "r=.10 m; resultant \u0394p \xD7 \u03C0r\xB2", 285, 204, 14);
    } else if (glass) {
      const net = (101e3 - s.inside - rho * 9.8 * 0.1) * 0.01 - 1e-3 * 9.8;
      R.text(ctx, c.ink, "Liquid depth .10 m, card area .01 m\xB2", 25, 80, 16);
      R.text(ctx, c.proton, `net before rim reaction ${fmt(net)} N up`, 25, 130, 18);
      R.text(ctx, c.ink, net >= 0 ? "Upward net can be balanced by the rim." : "Downward imbalance: no sealed equilibrium.", 25, 181, 15);
    } else {
      const x = 320;
      R.rectangle(ctx, c.electron, 40, 175, 225, 20, true);
      const top = 175 - h * 10;
      R.rectangle(ctx, c.electron, 118, top, 30, h * 10, true);
      const forcePixels = 60 / (101e3 * A);
      R.arrow(ctx, c.electron, 105, 175, 0, -101e3 * A * forcePixels, "p outside A");
      R.arrow(ctx, c.proton, 175, top, 0, W * forcePixels, "weight");
      R.arrow(ctx, c.muted, 135, top - 30, 0, s.inside * A * forcePixels, "p top A");
      if (straw) {
        ctx.beginPath();
        ctx.ellipse(133, top - 20, 25, 12, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = c.proton;
        ctx.stroke();
        R.text(ctx, c.proton, "mouth", 185, top - 15, 13);
      } else R.text(ctx, c.ink, s.inside === 0 ? "vacuum above" : "gas above", 170, top - 15, 13);
      R.text(ctx, c.ink, `h=${fmt(h, 3)} m (${liquid ? "mercury" : "water"})`, x, 79, 17);
      R.text(ctx, c.electron, `outside force ${fmt(101e3 * A)} N`, x, 119, 16);
      R.text(ctx, c.proton, `weight ${fmt(W)} N + gas ${fmt(s.inside * A)} N`, x, 159, 15);
      R.text(ctx, c.ink, "A=1 cm\xB2; column height uses common scale", x, 198, 13);
    }
    R.text(ctx, c.ink, "Pressure pushes; no vacuum pulling force exists.", 25, 234, 14);
    lab.say(hem ? `Each curved half receives outside inward and inside outward pressure. Their integrated axial difference is (${101e3}\u2212${s.inside}) Pa \xD7 \u03C0(0.10 m)\xB2 = ${fmt(p.separatingForce)} N. Equal pressures make both resultants zero; the inside arrows vanish in vacuum. The halves are separated slightly only to expose the cutaway.` : glass ? "The fixed .10 m glass is an initial static force test. Water flow after card release is not simulated." : `The open liquid reservoir is at 101 kPa; ${straw ? "the recognizable mouth sets" : "gas above the closed tube sets"} ${fmt(s.inside / 1e3, 1)} kPa. \u0394p A = \u03C1g h A: ${fmt(p.difference * A)} N equals column weight ${fmt(W)} N. The upward reservoir pressure force ${fmt(101e3 * A)} N balances gas ${fmt(s.inside * A)} N plus weight. Tube width is enlarged; height scale .27 scene units/metre is common to water and mercury.`);
  });
}
function hydrostatic(lab, api, c) {
  const s = {}, root = R.scene(lab), narrow = R.block(root, c.electron, 0.4, 2, 0.5, -1.7, 0, 0, 0.3), wide = R.block(root, c.electron, 2.4, 2, 1.3, 0.8, 0, 0, 0.3), wall = R.block(root, c.ink, 0.08, 2, 1.3, 2.04, 0), probes = [R.ball(root, c.proton, 0.07, -1.7, -1), R.ball(root, c.proton, 0.07, 0.8, -1)], forces = Array.from({ length: 5 }, () => R.vector(root, c.proton)), update = () => lab.refresh();
  const pipe = R.rod(root, c.electron, 0.1, 2.5, -0.45, -0.9, 0);
  if (pipe) pipe.rotation.z = Math.PI / 2;
  R.slider(api, s, "depth", "Water depth", 0.5, 4, 0.25, 2, "m", update);
  R.slider(api, s, "width", "Dam width", 1, 10, 1, 5, "m", update);
  R.slider(api, s, "extra", "Added piston pressure", 0, 5e4, 5e3, 0, "Pa", update);
  lab.redraw((ctx) => {
    const p = M.hydrostatic(s.depth, s.width, s.extra);
    scaled(narrow, 1, s.depth / 2, 1);
    scaled(wide, 1, s.depth / 2, s.width / 5);
    scaled(wall, 1, s.depth / 2, s.width / 5);
    point(narrow, -1.7, -1 + s.depth / 2);
    point(wide, 0.8, -1 + s.depth / 2);
    point(wall, 2.04, -1 + s.depth / 2);
    forces.forEach((f, i) => {
      const h = s.depth * (i + 0.5) / 5, y = -1 + s.depth - h, pp = 1e3 * 9.8 * h + s.extra;
      f.set([2.08, y, 0], [2.08 + pp / 45e3, y, 0]);
    });
    title(ctx, c, "Equal-depth probes agree in a tube and a wide reservoir");
    R.bars(ctx, c, [{ label: "narrow tube bottom", value: p.baseGauge, text: `${fmt(p.baseGauge / 1e3)} kPa`, color: c.electron }, { label: "wide lake bottom", value: p.baseGauge, text: `${fmt(p.baseGauge / 1e3)} kPa`, color: c.proton }], { max: 1e5, width: 270, y: 57, gap: 52 });
    R.text(ctx, c.ink, `total force on ${s.width} m dam: ${fmt(p.damForce / 1e3)} kN`, 25, 191, 16);
    R.text(ctx, c.ink, "Piston pressure adds equally at every depth.", 25, 225, 14);
    lab.say(`Both bottom probes read ${fmt(p.baseGauge / 1e3)} kPa gauge. Depth ${fmt(s.depth)} m and dam width ${s.width} m give total wall force ${fmt(p.damForce / 1e3)} kN. Reservoir length is absent from this pressure law. Added surface pressure shifts every local pressure by the same amount.`);
  });
}
function hull(lab, api, c) {
  const s = {}, root = R.scene(lab), water = R.block(root, c.electron, 5, 1.5, 2, 0, -0.75, 0, 0.22), upper = R.block(root, c.neutron, 5, 1.5, 2, 0, 0.75, 0, 0.18), lower = R.block(root, c.electron, 5, 1.5, 2, 0, -0.75, 0, 0.3), solid = R.block(root, c.ink, 0.425, 0.425, 0.425, -2, -1.2875), outer = R.block(root, c.ink, 2, 0.6, 1, 0, 0, 0, 0.15), bottom = R.block(root, c.ink, 2, 0.04, 1), roof = R.block(root, c.ink, 2, 0.04, 1), walls = [R.block(root, c.ink, 2, 0.6, 0.04, 0, 0, -0.5), R.block(root, c.ink, 0.04, 0.6, 1, -1, 0), R.block(root, c.ink, 0.04, 0.6, 1, 1, 0)], cargo = R.block(root, c.proton, 0.4, 0.3, 0.4), displaced = R.block(root, c.electron, 1, 1, 1, 1.8, -0.7, 0, 0.6), update = () => lab.refresh();
  R.block(root, c.ink, 5, 0.06, 2, 0, -1.53);
  let egg = null;
  if (root) {
    const profile = R.samples(81, (t) => {
      const u = 2 * t - 1;
      return new Vector2(0.35 * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.2 * u), u * 0.55);
    });
    egg = new Mesh(new LatheGeometry(profile, 48), new MeshStandardMaterial({ color: c.proton, roughness: 0.7 }));
    root.add(egg);
  }
  R.slider(api, s, "volume", "Sealed outer volume", 5, 40, 1, 20, "litres", update);
  R.slider(api, s, "cargo", "Cargo mass / egg density adjustment", 0, 20, 1, 0, "kg / steps", update);
  R.tabs(api, s, ["Sealed hull: fresh water", "Sealed hull: sea water", "Egg at liquid interface"], update);
  lab.redraw((ctx) => {
    const eggMode = s.mode === 2, rho = s.mode === 1 ? 1025 : 1e3, mass = 10 + s.cargo, p = M.buoyancy(mass, s.volume / 1e3, rho), f = Math.cbrt(s.volume / 20), height = 0.6 * f, draft = height * p.fraction, bottomY = p.support > 0 ? -1.5 : -draft;
    [outer, bottom, roof, ...walls, cargo, solid, displaced].forEach((m) => show(m, !eggMode));
    show(water, !eggMode);
    show(upper, eggMode);
    show(lower, eggMode);
    show(egg, eggMode);
    scaled(outer, f, f, f);
    point(outer, 0, bottomY + height / 2);
    scaled(bottom, f, f, f);
    point(bottom, 0, bottomY + 0.02 * f);
    scaled(roof, f, f, f);
    point(roof, 0, bottomY + height - 0.02 * f);
    walls.forEach((w, i) => {
      scaled(w, f, f, f);
      point(w, i === 1 ? -0.98 * f : i === 2 ? 0.98 * f : 0, bottomY + height / 2, i === 0 ? -0.48 * f : 0);
    });
    const cargoScale = 0.15 + s.cargo / 10;
    point(cargo, 0, bottomY + height + 0.15 * cargoScale);
    scaled(cargo, 1, cargoScale, 1);
    show(cargo, !eggMode && s.cargo > 0);
    const d = Math.cbrt(p.displaced * 1e3) / 3;
    scaled(displaced, d, d, d);
    title(ctx, c, eggMode ? "Egg volume sets the displaced-liquid weight" : "Sealed hull: draft / depth = displaced fraction");
    if (eggMode) {
      const density = 1e3 + s.cargo * 10, e = M.eggInterface(density);
      point(egg, 0, -e.interfaceU * 0.55);
      const topForce = 1e3 * 9.8 * (1 - e.fraction), lowerForce = 1200 * 9.8 * e.fraction;
      R.rectangle(ctx, c.neutron, 30, 40, 195, 90, true);
      R.rectangle(ctx, c.electron, 30, 130, 195, 90, true);
      const outline = R.samples(81, (t) => {
        const u = 2 * t - 1;
        return [125 + 30 * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.2 * u), 130 - (u - e.interfaceU) * 45];
      });
      R.line(ctx, c.proton, [...outline, ...outline.slice().reverse().map(([x, y]) => [250 - x, y]), outline[0]], 2);
      R.text(ctx, c.ink, "upper 1000; lower 1200 kg/m\xB3", 260, 75, 15);
      R.text(ctx, c.proton, `egg density ${density} kg/m\xB3`, 260, 113, 18);
      R.text(ctx, c.ink, `lower volume ${fmt(e.fraction * 100, 1)}%`, 260, 154, 16);
      R.text(ctx, c.electron, `buoyancy/m\xB3 ${fmt(topForce + lowerForce, 0)} N`, 260, 195, 16);
      lab.say(`The displayed egg is a surface of revolution with radius proportional to sqrt(1\u2212u\xB2)(1\u22120.2u). Integrating its circular slices places ${fmt(e.fraction * 100, 1)}% of its volume below the interface, not that percentage of its height. The upper and lower buoyancies sum to ${fmt(topForce + lowerForce, 0)} N per m\xB3, matching density ${density} kg/m\xB3 \xD7 g. Endpoint densities imply neutral buoyancy in one layer.`);
    } else {
      R.bars(ctx, c, [{ label: "weight", value: p.weight, text: `${fmt(p.weight)} N`, color: c.proton }, { label: "buoyancy", value: p.buoyancy, text: `${fmt(p.buoyancy)} N`, color: c.electron }, { label: "floor if sunk", value: p.support, text: `${fmt(p.support)} N`, color: c.muted }], { max: 300, width: 250, y: 50, gap: 45 });
      R.text(ctx, c.ink, `draft ${fmt(draft, 3)} / depth ${fmt(height, 3)} scene units`, 25, 201, 15);
      R.text(ctx, c.ink, `displaced ${fmt(p.displaced * 1e3)} L; solid steel reference 1.28 L`, 25, 232, 14);
      lab.say(`The sealed rectangular outer box has constant aspect ratios 2:.6:1. Uniform scaling by ${fmt(f, 3)} makes its outer volume ${s.volume} L. Bottom-to-waterline draft ${fmt(draft, 3)} divided by depth ${fmt(height, 3)} equals ${fmt(p.fraction * 100, 1)}%, exactly the displaced volume fraction. ${p.support > 0 ? "The fully submerged hull rests on the drawn reservoir floor." : "It settles at the drawn waterline."} Weight ${fmt(p.weight)} N = buoyancy ${fmt(p.buoyancy)} N + floor support ${fmt(p.support)} N. The hull is sealed so water cannot flood an open rim.`);
    }
  });
}
export {
  hull,
  hydrostatic,
  pressure,
  suction
};
