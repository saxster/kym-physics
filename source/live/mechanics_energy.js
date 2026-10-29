import { Group, Mesh, BufferGeometry, Float32BufferAttribute, MeshStandardMaterial, DoubleSide } from "three";
import * as M from "./mechanics_models.mjs";
import * as R from "./mechanics_render.js";
const fmt = (x, n = 2) => (Math.abs(x)<.5*10**(-n)?0:x).toFixed(n), point = (m, x, y, z = 0) => m?.position.set(x, y, z), scaled = (m, x, y, z = 1) => m?.scale.set(x, y, z), show = (m, on) => {
  if (m) m.visible = on;
};
const title = (ctx, c, t) => R.text(ctx, c.ink, t, 20, 25, 16);
function energy(lab, api, c) {
  const s = {}, root = R.scene(lab), ball = R.ball(root, c.proton, 0.14, -0.8, 1), floor = R.block(root, c.ink, 4, 0.12, 1.5, 0, -1), boundary = R.wire(root, c.electron, [[-1, -1, 0], [-1, 1, 0], [1, 1, 0], [1, -1, 0], [-1, -1, 0]]), update = () => lab.refresh();
  lab.kit?.label?.("ball",ball,{color:c.proton});
  lab.kit?.label?.("Earth / floor",floor,{color:c.ink});
  R.slider(api, s, "progress", "Flight and bounce progress", 0, 4, 0.02, 0.5, "", update);
  R.slider(api, s, "height", "Release height", 0.5, 2, 0.1, 1, "m", update);
  R.tabs(api, s, ["Ball only", "Ball and Earth", "Surroundings included"], update);
  lab.redraw((ctx) => {
    const p = M.energyAccount(0.1, s.height, 0.64, s.progress), y = -0.8 + p.height;
    point(ball, -0.8, y);
    const x0 = s.mode === 0 ? -1.2 : s.mode === 1 ? -2.2 : -2.7, x1 = s.mode === 0 ? -0.4 : s.mode === 1 ? 2.2 : 2.7, y0 = s.mode === 0 ? y - 0.35 : -1.25, y1 = s.mode === 0 ? y + 0.35 : 1.7;
    R.path(boundary, [[x0, y0, 0.6], [x0, y1, 0.6], [x1, y1, 0.6], [x1, y0, 0.6], [x0, y0, 0.6]]);
    const inside = s.mode === 0 ? p.kinetic + p.ballThermal : s.mode === 1 ? p.kinetic + p.gravitational + p.ballThermal + p.floorThermal : p.total;
    title(ctx, c, `Account boundary: ${["ball only", "ball and Earth", "ball, Earth and surroundings"][s.mode]}`);
    const rows = [["kinetic", p.kinetic, c.proton], ["gravitational pair", p.gravitational, c.electron], ["ball internal", p.ballThermal, c.neutron], ["floor internal", p.floorThermal, c.muted], ["air after absorption", p.airThermal, c.green]];
    R.bars(ctx, c, rows.map(([label, value, color], i) => ({ label, value, text: `${fmt(value, 3)} J`, color: s.mode === 0 && (i === 1 || i > 2) || s.mode === 1 && i === 4 ? c.rule : color })), { max: p.total, width: 250, y: 42, gap: 33 });
    R.text(ctx, c.ink, `inside: ${fmt(inside, 3)} J; full account: ${fmt(p.total, 3)} J`, 25, 230, 15);
    lab.say(`The chosen boundary contains ${fmt(inside, 3)} J of the tracked energy. ${s.mode === 0 ? "Gravity transfers energy across this boundary; some then leaves during impact. The gravitational store belongs to the ball\u2013Earth pair, not the ball alone." : s.mode === 1 ? "The ball\u2013Earth account loses only the part delivered to the air." : "All tracked stores sum to the starting amount."} The full account stays ${fmt(p.total, 3)} J. Grey bars lie outside the selected boundary.`);
  });
}
function impact(lab, api, c) {
  const s = {}, update = () => lab.refresh();
  R.slider(api, s, "speed", "First ball speed", 1, 5, 0.25, 2, "m/s", update);
  R.slider(api, s, "force", "Constant resisting force", 0.5, 3, 0.25, 1, "N", update);
  lab.redraw((ctx) => {
    const a = M.impact(0.02, s.speed, s.force), b = M.impact(0.02, 2 * s.speed, s.force), y = 190, H = s.force * 110 / 3;
    title(ctx, c, "Double speed: impulse \xD72; work \xD74 (fixed physical axes)");
    R.axes(ctx, c.ink, { x: 50, y, w: 235, h: 110, xlabel: "time (s)", ylabel: "force (N)" });
    R.axes(ctx, c.ink, { x: 365, y, w: 235, h: 110, xlabel: "distance (m)", ylabel: "force (N)" });
    [[50, 235, 0.4, "s"], [365, 235, 2, "m"]].forEach(([x, w, max, unit]) => {
      [0, 0.5, 1].forEach((u) => {
        R.text(ctx, c.ink, fmt(max * u, 2), x + w * u, y + 17, 12, "center");
      });
      [1, 2, 3].forEach((v) => {
        R.line(ctx, c.rule, [[x, y - v * 110 / 3], [x + 235, y - v * 110 / 3]], 1, [3, 4]);
        R.text(ctx, c.ink, String(v), x - 8, y - v * 110 / 3 + 4, 12, "right");
      });
    });
    R.rectangle(ctx, c.proton, 50, y - H, b.time / 0.4 * 235, H, true);
    R.rectangle(ctx, c.electron, 50, y - H, a.time / 0.4 * 235, H, true);
    R.rectangle(ctx, c.proton, 365, y - H, b.distance / 2 * 235, H, true);
    R.rectangle(ctx, c.electron, 365, y - H, a.distance / 2 * 235, H, true);
    R.text(ctx, c.electron, `v: ${fmt(a.time, 3)} s; ${fmt(a.distance, 3)} m`, 50, 48, 13);
    R.text(ctx, c.proton, `2v: ${fmt(b.time, 3)} s; ${fmt(b.distance, 3)} m`, 365, 48, 13);
    R.text(ctx, c.ink, `blue/red impulse ${fmt(a.momentum, 3)} / ${fmt(b.momentum, 3)} N\xB7s`, 25, 236, 13);
    R.text(ctx, c.ink, `work ${fmt(a.kinetic, 3)} / ${fmt(b.kinetic, 3)} J`, 365, 236, 13);
    lab.say(`Axes stay fixed at 0\u20133 N, 0\u20130.4 s and 0\u20132 m. The force ${s.force} N sets both rectangle heights. Their actual widths are ${fmt(a.time, 3)} and ${fmt(b.time, 3)} s, ${fmt(a.distance, 3)} and ${fmt(b.distance, 3)} m. Rectangle area gives impulse or work on the chosen physical axes; doubling speed doubles momentum and quadruples kinetic energy.`);
  });
}
function work(lab, api, c) {
  const s = { time: 0 }, root = R.scene(lab), route = R.wire(root, c.ink, [[0, 0, 0], [1, 1, 0]]), load = R.block(root, c.proton, 0.22, 0.22, 0.22), sphere = root ? new Group() : null;
  let progressControl = null;
  if (root) root.add(sphere);
  R.ball(sphere, c.proton, 0.13);
  R.wire(sphere, c.ink, [[-0.13, 0, 0.03], [0.13, 0, 0.03]]);
  R.ball(sphere, c.ink, 0.035, 0, 0.12, 0.05);
  const force = R.vector(root, c.electron), normal = R.vector(root, c.neutron), friction = R.vector(root, c.muted), displacement = R.vector(root, c.proton), update = () => lab.refresh();
  R.slider(api, s, "mass", "Load mass", 1, 10, 0.5, 2, "kg", update);
  R.slider(api, s, "height", "Endpoint height", 1, 4, 0.5, 3, "m", update);
  const teachRoute=()=>{
    if(s.mode===3)lab.teach?.({question:"Does upward support do work during a horizontal carry?",explanation:"The support force points upward while the load moves horizontally. Their dot product is zero, so this support adds no mechanical energy. Energy used by muscles is outside this account.",limits:"Constant height and quasistatic motion; no sliding friction, air drag or physiological energy account."});
    else if(s.mode>=4)lab.teach?.({question:s.mode===5?"Why is rolling slower than frictionless sliding down the same drop?":"Where does gravitational energy go during a frictionless slide?",explanation:s.mode===5?"The same lost gravitational energy becomes both forward motion and spin. Static friction supplies the turning effect, but the point touching the stationary ramp does not move, so this contact does no work.":"Gravitational energy becomes the slider’s kinetic energy. The normal force is perpendicular to its motion and does no work.",limits:"Uniform solid sphere rolling without slip, or frictionless point slider; no air resistance or energy loss. Descent progress represents elapsed time divided by calculated descent time."});
    else lab.teach?.({question:"Does a longer ramp store more gravitational energy than a lift to the same floor?",explanation:"Only the rise changes the gravitational store. A ramp needs less force along a longer route. Upward support does no work during a horizontal stair segment; the total route work is mgh.",limits:"Quasistatic motion, no sliding friction or physiological energy costs. Force and displacement directions share the same geometric x/y scales."});
  };
  R.tabs(api, s, ["Stairs", "Ramp up", "Lift", "Horizontal carry", "Slide down", "Roll down"], () => {
    teachRoute();
    s.time = 0;
    progressControl?.set(0);
    update();
  });
  progressControl = R.slider(api, s, "time", "Route progress / descent time fraction", 0, 1, 0.01, 0, "", update);
  api.loop((dt) => {
    if (dt > 0) {
      const L = Math.hypot(3, s.height), duration = s.mode >= 4 ? Math.sqrt(2 * L * L / (9.8 * s.height * (s.mode === 5 ? 5 / 7 : 1))) : 1 / 0.15;
      s.time = (s.time + dt / duration) % 1;
      progressControl.set(s.time);
      update();
    }
  });
  lab.redraw((ctx) => {
    const down = s.mode >= 4, rolling = s.mode === 5, h = s.mode === 3 ? 0 : s.height, u = down ? s.time * s.time : s.time, k = 0.65, L = Math.hypot(3, h), pts = s.mode === 0 ? [[0, 0], [1, 0], [1, h / 3], [2, h / 3], [2, 2 * h / 3], [3, 2 * h / 3], [3, h]] : s.mode === 2 ? [[0, 0], [0, h]] : down ? [[0, h], [3, 0]] : [[0, 0], [3, h]], world = (x2, y2, z = 0) => [(x2 - 1.5) * k, y2 * k - 1, z];
    R.path(route, pts.map(([x2, y2]) => world(x2, y2)));
    let x, y, dx, dy;
    if (s.mode === 0) {
      const i = Math.min(5, Math.floor(u * 6)), f = u === 1 ? 1 : u * 6 - i, a = pts[i], b = pts[i + 1];
      x = a[0] + (b[0] - a[0]) * f;
      y = a[1] + (b[1] - a[1]) * f;
      dx = b[0] - a[0];
      dy = b[1] - a[1];
    } else {
      x = (s.mode === 2 ? 0 : 3) * u;
      y = down ? h * (1 - u) : h * u;
      dx = s.mode === 2 ? 0 : 3;
      dy = down ? -h : h;
    }
    const n = Math.hypot(dx, dy) || 1, tx = dx / n, ty = dy / n, nx = -ty, ny = tx, base = world(x, y), radius = rolling ? 0.13 : 0.11, center = [base[0] + nx * radius, base[1] + ny * radius, 0.02];
    if (load) load.rotation.z = s.mode === 1 || s.mode === 4 ? Math.atan2(ty, tx) : 0;
    point(load, ...center);
    point(sphere, ...center);
    show(load, !rolling);
    show(sphere, rolling);
    if (sphere) sphere.rotation.z = -L * u / 0.2;
    const F = s.mass * 9.8, fs = 0.65 / F;
    if (down) {
      force.set(center, [center[0], center[1] - F * fs, center[2]]);
      normal.set(center, [center[0] + nx * F * 3 / L * fs, center[1] + ny * F * 3 / L * fs, 0.03]);
      friction.set(center, [center[0] - tx * (rolling ? 2 / 7 : 0) * F * h / L * fs, center[1] - ty * (rolling ? 2 / 7 : 0) * F * h / L * fs, 0.05]);
    } else {
      const fx = s.mode === 1 ? tx * F * h / L : 0, fy = s.mode === 1 ? ty * F * h / L : F;
      force.set(center, [center[0] + fx * fs, center[1] + fy * fs, 0.03]);
      show(normal.group, false);
      show(friction.group, false);
    }
    displacement.set([center[0], center[1], 0.25], [center[0] + tx * 0.65, center[1] + ty * 0.65, 0.25]);
    title(ctx, c, down ? "Same drop; rolling shares energy with rotation" : "Force and displacement drawn on one common metre scale");
    if (down) {
      const e = M.rollingEnergy(s.mass, h * u, rolling), potential = F * h * (1 - u);
      R.bars(ctx, c, [{ label: "remaining gravitational", value: potential, text: `${fmt(potential)} J`, color: c.neutron }, { label: "translation", value: e.translation, text: `${fmt(e.translation)} J`, color: c.proton }, { label: "rotation", value: e.rotation, text: `${fmt(e.rotation)} J`, color: c.electron }], { max: F * h, width: 250, y: 52, gap: 44 });
      R.text(ctx, c.ink, `v=${fmt(e.v)} m/s; \u03C9=${fmt(e.omega)} rad/s; angle=s/R`, 25, 215, 15);
      lab.say(`After a ${fmt(h * u)} m drop, gravitational energy ${fmt(F * h * u)} J becomes ${fmt(e.translation)} J translation and ${fmt(e.rotation)} J rotation. ${rolling ? "A marked solid sphere rolls without slip: I=2mR\xB2/5 and \u03C9=v/R; static friction points uphill, with zero contact-point work." : "The ideal frictionless slider has no rotation."} The incline and force components use one .65 scene-unit/metre scale; the descent slider is elapsed time divided by the calculated descent duration, so distance grows as time squared. Quasistatic route modes use path progress.`);
    } else {
      const ramp = s.mode === 1, fx = ramp ? tx * F * h / L : 0, fy = ramp ? ty * F * h / L : F, forceMag = Math.hypot(fx, fy), theta = Math.acos(Math.max(-1, Math.min(1, (fx * tx + fy * ty) / forceMag))), a = [130, 140];
      R.arrow(ctx, c.electron, ...a, fx / F * 80, -fy / F * 80, "applied force");
      R.arrow(ctx, c.proton, ...a, tx * 95, -ty * 95, "displacement");
      ctx.beginPath();
      ctx.arc(...a, 35, -Math.atan2(fy, fx), -Math.atan2(ty, tx));
      ctx.strokeStyle = c.ink;
      ctx.stroke();
      R.text(ctx, c.ink, `angle ${fmt(theta * 180 / Math.PI, 1)}\xB0`, 275, 80, 16);
      R.text(ctx, c.proton, `Total route work: mgh = ${fmt(F * h)} J`, 275, 125, 17);
      R.text(ctx, c.ink, `rise ${fmt(h)} m; weight ${fmt(F)} N`, 275, 170, 15);
      R.text(ctx, c.ink, "Upward support does zero work on a horizontal segment.", 25, 230, 14);
      lab.say(`The selected quasistatic route reaches rise ${fmt(h)} m and gains ${fmt(F * h)} J. The shown applied force ${fmt(forceMag)} N makes angle ${fmt(theta * 180 / Math.PI, 1)}\xB0 with local displacement. At horizontal carry or a horizontal stair segment their dot product is zero. Force and displacement directions use identical x/y scales; metabolic energy use is outside this mechanical account.`);
    }
  });
}
function power(lab, api, c) {
  const s = {}, update = () => lab.refresh();
  let household = false, presets = null;
  const custom = () => { if (!household) presets?.setActive?.(-1); update(); };
  const ps = R.slider(api, s, "power", "Power", 10, 2e3, 10, 2e3, "W", custom), ts = R.slider(api, s, "hours", "Elapsed / operating time", 0.25, 24, 0.25, 0.25, "h", custom);
  presets = api.tabs(["Geyser 2 kW \xD7 15 min", "Lamp 10 W \xD7 24 h", "Whole household schedule"], (i) => {
    household = i === 2;
    s.power = i === 1 ? 10 : 2e3;
    s.hours = i === 0 ? 0.25 : 24;
    ps.set(s.power);
    ts.set(s.hours);
    ps.input.disabled = household;
    update();
  });
  lab.redraw((ctx) => {
    title(ctx, c, household ? "Sum the scheduled appliances; each slope is power" : "Fixed axes: cumulative energy slope equals power");
    if (household) {
      const times = [0, 7, 7.25, 12, 18, 18.1, 20, 24], colors = [c.proton, c.electron, c.neutron, c.muted], values = M.household(s.hours), series = M.HOUSEHOLD.map((a2, i) => ({ color: colors[i], values: times.map((t) => [t, M.household(Math.min(t, s.hours)).appliances[i].kWh]) }));
      series.push({ color: c.ink, width: 3, values: times.map((t) => [t, M.household(Math.min(t, s.hours)).kWh]) });
      const a = R.plot(ctx, c, series, { x: 52, y: 176, w: 505, h: 112, xmax: 24, ymax: 2, xlabel: "clock time (h)", ylabel: "energy (kWh)" });
      R.dot(ctx, c.ink, a.X(s.hours), a.Y(values.kWh), 5);
      R.text(ctx, c.ink, `Total ${fmt(values.kWh, 3)} kWh; current ${values.watts} W`, 25, 211, 15);
      R.text(ctx, c.ink, "Geyser 07\u201307:15; lamp all day; fan 12\u201320; kettle 18\u201318:06", 25, 235, 12);
      lab.say(`At hour ${fmt(s.hours)}, household total is ${fmt(values.kWh, 3)} kWh = ${values.appliances.map((a2) => `${a2.name} ${fmt(a2.kWh, 3)}`).join(" + ")} kWh. The black curve is the sum, with slope set by all appliances currently on. Fixed scales are 0\u201324 hours and 0\u20132 kWh. Schedule is illustrative; slider changes the time through this schedule.`);
    } else {
      const p = M.power(s.power, s.hours);
      const a = R.plot(ctx, c, [{color:c.muted,dash:[4,4],values:[[0,0],[24,s.power*24/1000]]},{ color: c.proton, width:3, values: [[0, 0], [s.hours, p.kWh]] }], {x:52,y:176,w:250,h:108,xmax: 24, ymax: 48, xlabel: "operating time (h)", ylabel: "energy (kWh)" });
      R.dot(ctx, c.electron, a.X(s.hours), a.Y(p.kWh));
      R.text(ctx,c.ink,"Fixed examples; same energy scale",340,65,13);
      [["Geyser: 15 min",.5,c.proton],["Lamp: 24 h",.24,c.electron]].forEach(([label,value,color],i)=>{
        R.text(ctx,c.ink,`${label}: ${fmt(value,3)} kWh`,340,94+i*52,13);
        ctx.fillStyle=color;ctx.fillRect(340,103+i*52,210*value/.5,17);
      });
      R.text(ctx,c.muted,"Bars: 0–0.5 kWh; dashed line: if left on",340,203,12);
      R.text(ctx, c.ink, `${s.power} W \xD7 ${fmt(s.hours)} h = ${fmt(p.kWh, 3)} kWh; plot scale 0\u201348 kWh`, 25, 235, 15);
      lab.say(`${s.power} W for ${fmt(s.hours)} h transfers ${fmt(p.kWh, 3)} kWh. Axes stay at 24 hours and 48 kWh. The dashed extension shows the energy if this power were left on; the solid segment ends at the actual operating time. Fixed example bars compare the geyser’s 0.500 kWh with the lamp’s 0.240 kWh on the same 0–0.5 kWh scale. The household preset uses its own explicitly labelled 2 kWh scale to reveal individual contributions.`);
    }
  });
}
function station(lab, api, c) {
  const s = { time: 0 }, root = R.scene(lab), reservoir = R.block(root, c.electron, 0.75, 0.7, 0.65, -2, 1, 0, 0.55), boiler = R.rod(root, c.proton, 0.35, 0.8, -2, -0.1), fire = R.ball(root, c.proton, 0.16, -2, -0.72), boilerBase = R.block(root, c.ink, 0.85, 0.08, 0.75, -2, -0.55), pipe = R.wire(root, c.ink, [[-1.6, 1, 0], [-1, 1, 0], [-1, 0.5, 0], [0, 0.5, 0]]), flow = Array.from({ length: 12 }, () => R.ball(root, c.electron, 0.055)), shaft = R.rod(root, c.ink, 0.06, 1.8, 0.65, 0), rotor = root ? new Group() : null;
  if (root) root.add(rotor);
  if (shaft) shaft.rotation.z = Math.PI / 2;
  R.ring(rotor, c.ink, 0.55);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, b = R.block(rotor, c.electron, 0.48, 0.12, 0.16, Math.cos(a) * 0.34, Math.sin(a) * 0.34);
    if (b) b.rotation.z = a;
  }
  const coil = R.wire(root, c.ink, R.samples(121, (u) => [1.2 + 0.4 * Math.cos(u * 20 * Math.PI), -0.3 + 0.6 * u, 0.4 * Math.sin(u * 20 * Math.PI)])), magnet = root ? new Group() : null;
  if (root) root.add(magnet);
  R.block(magnet, c.proton, 0.16, 0.3, 0.14, 1.2, 0.15);
  R.block(magnet, c.electron, 0.16, 0.3, 0.14, 1.2, -0.15);
  const lamp = R.ball(root, c.neutron, 0.21, 2.25, 0.65), base = R.block(root, c.ink, 0.23, 0.16, 0.23, 2.25, 0.36), lead = R.wire(root, c.ink, [[1.6, 0.3, 0], [1.9, 0.3, 0], [1.9, 0.65, 0], [2.25, 0.65, 0], [2.25, 0.3, 0], [2.1, 0.3, 0], [2.1, -0.3, 0], [1.6, -0.3, 0]]), torque = R.vector(root, c.proton), update = () => lab.refresh();
  lab.kit?.label?.("steam boiler",boiler,{color:c.proton});
  lab.kit?.label?.("raised water",reservoir,{color:c.electron});
  lab.kit?.label?.("turning turbine / wheel",rotor,{color:c.electron});
  lab.kit?.label?.("stationary coil",coil,{color:c.ink});
  lab.kit?.label?.("lamp",lamp,{color:c.neutron});
  let loaded = true, elapsedControl = null;
  const restart = () => { s.time = 0; elapsedControl?.set(0); };
  const inputPowerControl=R.slider(api, s, "input", "Source power / electrical wheel load", 10, 100, 10, 100, "W", () => {
    restart();
    update();
  });
  const efficiencyControl=R.slider(api, s, "efficiency", "Station efficiency", 0.2, 0.8, 0.05, 0.4, "", update);
  R.tabs(api, s, ["Steam drives turbine", "Water drives turbine", "Magnet wheel and lamp"], () => {
    restart();
    update();
  });
  api.button("Connect / disconnect electrical load", () => {
    loaded = !loaded;
    restart();
    update();
  });
  elapsedControl = R.slider(api, s, "time", "Elapsed time", 0, 120, 0.5, 0, "s", update);
  api.loop((dt) => {
    if (dt > 0) {
      s.time = Math.min(120, s.time + dt);
      elapsedControl.set(s.time);
      update();
    }
  });
  lab.redraw((ctx) => {
    const finite = s.mode === 2, p = M.station(s.input, s.efficiency), load = loaded ? s.input : 0, w = M.generatorWheel(1e3, load, s.time), angle = finite ? w.angle * 0.04 : s.time * 2, power2 = finite ? w.power : loaded ? p.electrical : 0;
    efficiencyControl.input.disabled=finite;
    inputPowerControl.setLabel?.(finite?"Wheel load at initial speed":"Source power");
    show(reservoir, s.mode === 1);
    show(boiler, s.mode === 0);
    show(fire, s.mode === 0);
    show(boilerBase, s.mode === 0);
    show(pipe, !finite);
    R.path(pipe, M.drivePath(s.mode === 1, 0).path.map(([x, y]) => [x, y, 0]));
    show(lead, loaded);
    show(lamp, true);
    if (lamp) lamp.material.emissive.set(loaded && power2 > 0 ? c.neutron : 0);
    if (lamp) lamp.material.emissiveIntensity = loaded && power2 > 0 ? power2 / 100 : 0;
    flow.forEach((m, i) => {
      show(m, !finite);
      const u = (s.time * 0.25 + i / 12) % 1, q = M.drivePath(s.mode === 1, u).point;
      point(m, q[0], q[1], 0.05);
      if (m) m.material.color.set(s.mode === 1 ? c.electron : c.muted);
    });
    if (rotor) rotor.rotation.set(0, Math.PI / 2, angle);
    if (magnet) magnet.rotation.x = angle;
    torque.set([0.2, 0.6, 0.1], [0.2 - (loaded ? finite ? w.torque * 0.15 : p.electrical / 150 : 0), 0.6, 0.1]);
    title(ctx, c, finite ? "A connected lamp drains the magnet wheel\u2019s kinetic store" : s.mode === 1 ? "Elevated water \u2192 turbine shaft \u2192 rotating magnet/coil \u2192 lamp" : "Heated steam \u2192 turbine shaft \u2192 rotating magnet/coil \u2192 lamp");
    if (finite) {
      R.bars(ctx, c, [{ label: "wheel kinetic", value: w.remaining, text: `${fmt(w.remaining)} J`, color: c.electron }, { label: "lamp transferred", value: 1e3 - w.remaining, text: `${fmt(1e3 - w.remaining)} J`, color: c.proton }], { max: 1e3, width: 250, y: 65, gap: 55 });
      R.text(ctx, c.ink, `load ${loaded ? "connected" : "disconnected"}; angular speed ${fmt(w.omega)} rad/s`, 25, 213, 15);
      lab.say(`The visible magnet turns inside a stationary coil. ${loaded ? "A closed circuit lights the lamp and supplies opposing torque;" : "Opening the circuit extinguishes the lamp and removes the ideal electrical resisting torque;"} the wheel retains ${fmt(w.remaining)} of its initial 1000 J after ${fmt(s.time)} s. Lamp energy ${fmt(1e3 - w.remaining)} J; current power ${fmt(w.power)} W, opposing torque ${fmt(w.torque)} N\xB7m. Unit moment of inertia gives \u03C9=sqrt(2E); display rotation is slowed .04\xD7. The resistive generator model has P proportional to \u03C9\xB2: lamp power fades exponentially as the store drains; no source replenishes it.`);
    } else {
      const input = s.input, out = loaded ? p.electrical : 0, reject = input - out, x0 = 50, y = 83, W = 150, maxW = 80;
      ctx.lineCap = "butt";
      R.line(ctx, c.ink, [[x0, y], [210, y]], input / 100 * maxW);
      R.line(ctx, c.electron, [[210, y - (input - out) / 100 * maxW / 2], [360, y - (input - out) / 100 * maxW / 2]], out / 100 * maxW);
      R.line(ctx, c.proton, [[210, y + out / 100 * maxW / 2], [280, y + out / 100 * maxW / 2], [350, 174]], reject / 100 * maxW);
      R.text(ctx, c.ink, `${input} W input`, 25, 48, 15);
      R.text(ctx, c.electron, `${fmt(out)} W electrical`, 380, 85, 16);
      R.text(ctx, c.proton, `${fmt(reject)} W rejected`, 380, 177, 16);
      R.text(ctx, c.ink, "Conservation-width Sankey: 0.8 px per watt", 25, 232, 14);
      lab.say(`${s.mode === 1 ? "Falling water with mass flow chosen by P=\u1E41gH drives" : "Steam from a heated boiler drives"} the turbine, shaft and rotating generator magnet. With load ${loaded ? "connected" : "open"}, ${input} W input = ${fmt(out)} W electrical + ${fmt(reject)} W rejected. Sankey widths use the same .8 pixels/W, so branches sum exactly to input. The simplified generator shows mechanical-to-electrical transfer, not a field solution; efficiency is prescribed.`);
    }
  });
}
function stevin(lab, api, c) {
  const s = {}, root = R.scene(lab), chain = R.wire(root, c.ink, [[0, 0, 0], [1, 1, 0], [2, 0, 0]]), lower = R.wire(root, c.ink, R.samples(121, () => [0, 0, 0])), beads = Array.from({ length: 36 }, () => R.ball(root, c.proton, 0.06)), forces = Array.from({ length: 6 }, (_, i) => R.vector(root, [c.electron, c.proton, c.neutron][i % 3])), update = () => lab.refresh();
  for(let side=0;side<2;side++) ["weight","downhill component","into-slope component"].forEach((name,i)=>lab.kit?.label?.(name,forces[side*3+i].group?.children[1],{color:[c.electron,c.proton,c.neutron][i],offset:i===0?[0,50]:i===1?[0,-45]:[side?50:-35,40]}));
  let wedge = null;
  if (root) {
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(new Array(72).fill(0), 3));
    wedge = new Mesh(geo, new MeshStandardMaterial({ color: c.muted, side: DoubleSide, transparent: true, opacity: 0.4 }));
    root.add(wedge);
  }
  R.slider(api, s, "height", "Ramp height", 0.3, 1.5, 0.1, 1, "m", update);
  R.slider(api, s, "density", "Uniform chain mass per length", 0.5, 2, 0.1, 1, "kg/m", update);
  R.tabs(api, s, ["Whole connected wreath", "Remove symmetric lower chain"], update);
  lab.redraw((ctx) => {
    const p = M.stevinChain(s.height, s.density), left = p.left, right = p.right, mid = (left + right) / 2, half = (right - left) / 2, k = 0.7, xyz = (x, y, z = 0) => [(x + 1) * k, y * k - 0.15, z], a = xyz(left, 0), b = xyz(0, s.height), d = xyz(right, 0);
    R.path(chain, [a, b, d]);
    if (wedge) {
      const attr = wedge.geometry.getAttribute("position"), back = (q) => q.map((v, i) => v + (i === 2 ? -0.6 : 0)), A = back(a), B = back(b), D = back(d), verts = [a, b, d, A, D, B, a, A, B, a, B, b, b, B, D, b, D, d, d, D, A, d, A, a];
      verts.forEach((v, i) => attr.setXYZ(i, ...v));
      attr.needsUpdate = true;
      wedge.geometry.computeVertexNormals();
      wedge.geometry.computeBoundingSphere();
    }
    const hanging = p.curve, hangingPts = p.beads;
    R.path(lower, hanging.map(([x, y]) => xyz(x, y)));
    show(lower, s.mode === 0);
    const slopePts = [...Array.from({ length: 8 }, (_, i) => [left * (1 - (i + 0.5) / 8), s.height * (i + 0.5) / 8]), ...Array.from({ length: 4 }, (_, i) => [right * (i + 0.5) / 4, s.height * (1 - (i + 0.5) / 4)])];
    beads.forEach((m, i) => {
      const on = i < 12 || s.mode === 0 && i - 12 < hangingPts.length;
      show(m, on);
      if (on) point(m, ...xyz(...i < 12 ? slopePts[i] : hangingPts[i - 12]));
    });
    [0, 1].forEach((side) => {
      const L = side ? 2 : 4, dx = (side ? right : left) / L, dy = -s.height / L, x = (side ? right : left) / 2, y = s.height / 2, mass = side ? p.rightMass : p.leftMass, W = mass * 9.8, F = side ? p.rightForce : p.leftForce, N = W * Math.sqrt(1 - (s.height / L) ** 2), origin = xyz(x, y, 0.2), scale = 0.028;
      forces[side * 3].set(origin, [origin[0], origin[1] - W * scale, 0.2]);
      forces[side * 3 + 1].set(origin, [origin[0] + dx * F * scale, origin[1] + dy * F * scale, 0.2]);
      const nx = Math.sign(dx) * -dy, ny = Math.abs(dx);
      forces[side * 3 + 2].set(origin, [origin[0] - nx * N * scale, origin[1] - ny * N * scale, 0.2]);
    });
    title(ctx, c, "Chain on a wedge: resolve weight into two components");
    R.text(ctx, c.ink, `left mass ${fmt(p.leftMass)} kg; length 4 m`, 25, 73, 16);
    R.text(ctx, c.proton, `parallel ${fmt(p.leftForce)} N = \u03BBgH`, 25, 112, 17);
    R.text(ctx, c.ink, `right mass ${fmt(p.rightMass)} kg; length 2 m`, 25, 153, 16);
    R.text(ctx, c.proton, `parallel ${fmt(p.rightForce)} N = \u03BBgH`, 25, 192, 17);
    R.text(ctx, c.electron, "weight", 25, 230, 14);
    R.text(ctx, c.proton, "downhill component", 170, 230, 14);
    R.text(ctx, c.neutron, "into-slope component", 370, 230, 14);
    lab.say(`The 4 m slope holds ${fmt(p.leftMass)} kg and the 2 m slope ${fmt(p.rightMass)} kg of uniform chain. Total weight is resolved into downhill \u03BBgH=${fmt(p.leftForce)} N and normal components on each slope. The continuous lower chain is left\u2013right symmetric and its beads are uniformly spaced by arc length, so it supplies equal end tensions. Removing it leaves the equal downhill slope pulls. The lower loop is a symmetric catenary with equal arc-length bead spacing of .5 m, matching the .5 m spacing on both slopes. Its equal endpoint tensions cancel when that part is removed.`);
  });
}
function engine(lab, api, c) {
  const s = { time: 0 }, root = R.scene(lab), hot = R.block(root, c.proton, 1, 1.3, 1, -2, 0), cold = R.block(root, c.electron, 1, 1.3, 1, 2, 0), cylinder = R.block(root, c.ink, 0.7, 1.4, 0.7, 0, 0, 0, 0.15), piston = R.block(root, c.ink, 0.68, 0.1, 0.68), update = () => lab.refresh();
  lab.kit?.label?.("hot reservoir",hot,{color:c.proton});
  lab.kit?.label?.("piston: work output",piston,{color:c.ink});
  lab.kit?.label?.("cold reservoir",cold,{color:c.electron});
  R.slider(api, s, "hot", "Hot reservoir", 400, 900, 20, 600, "K", update);
  R.slider(api, s, "cold", "Cold reservoir", 280, 400, 10, 300, "K", update);
  R.slider(api, s, "fraction", "Fraction of reversible limit", 0.2, 1, 0.05, 0.6, "", update);
  api.loop((dt) => {
    if (dt > 0) {
      s.time += dt;
      update();
    }
  });
  lab.redraw((ctx) => {
    const p = M.heatEngine(s.hot, s.cold, s.fraction);
    api.playback?.(p.work>0);
    point(piston, 0, Math.sin(s.time * 2) * p.efficiency * 0.8);
    scaled(hot, 1, s.hot / 600, 1);
    scaled(cold, 1, s.cold / 600, 1);
    title(ctx, c, "For each 1000 J entering, account for work and rejected energy");
    R.bars(ctx, c, [{ label: "heat input", value: 1e3, text: "1000 J", color: c.ink }, { label: "work output", value: p.work, text: `${fmt(p.work, 0)} J`, color: c.proton }, { label: "rejected to cold side", value: p.rejected, text: `${fmt(p.rejected, 0)} J`, color: c.electron }], { max: 1e3, width: 260, y: 51, gap: 46 });
    R.text(ctx, c.ink, `reversible limit ${fmt(p.limit * 100, 1)}%; actual model ${fmt(p.efficiency * 100, 1)}%`, 25, 218, 14);
    lab.say(`At ${s.hot} K and ${s.cold} K, the reversible efficiency limit is ${fmt(p.limit * 100, 1)}%. This selected model gives ${fmt(p.work, 0)} J work and rejects ${fmt(p.rejected, 0)} J for each 1000 J input. Their sum stays 1000 J. The piston motion is schematic, not a calculated engine cycle.`);
  });
}
export {
  energy,
  engine,
  impact,
  power,
  station,
  stevin,
  work
};
