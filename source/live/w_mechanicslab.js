import { Live } from "./core.js";
import { makeLab } from "./lab_kit.js";
import lessons from "../lessons/mechanics.json";
import * as M from "./mechanics_models.mjs";
import * as Motion from "./mechanics_motion_models.mjs";
import * as R from "./mechanics_render.js";
import * as Space from "./mechanics_space.js";
import * as Fluids from "./mechanics_fluids.js";
import * as Energy from "./mechanics_energy.js";
const fmt = (x, n = 2) => Number.isFinite(x) ? (Math.abs(x)<.5*10**(-n)?0:x).toFixed(n) : "unbounded";
const point = (m, x, y, z = 0) => m?.position.set(x, y, z);
const scaled = (m, x, y, z = 1) => m?.scale.set(x, y, z);
const show = (m, on) => {
  if (m) m.visible = on;
};
const primary = (ctx, c, title) => R.text(ctx, c.ink, title, 20, 25, 16);
function horizon(lab, api, c) {
  const s = {}, root = R.scene(lab), earth = R.ball(root, c.electron, 3, 0, -3, 0), flat = R.block(root, c.electron, 6, 0.06, 1, 0, 0, 0), ship = R.block(root, c.ink, 0.2, 0.4, 0.2, 0, 0, 0), mast = R.rod(root, c.ink, 0.02, 0.7), eye = R.ball(root, c.proton, 0.07, -2, 0, 0), sight = R.wire(root, c.neutron, [[0, 0, 0], [1, 1, 0]]);
  lab.kit?.label?.('eye', eye, { color: c.proton });
  lab.kit?.label?.('ship', mast, { color: c.ink });
  const update = () => lab.refresh();
  R.slider(api, s, "height", "Eye height", 1, 40, 1, 2, "m", update);
  R.slider(api, s, "range", "Ship distance", 0, 30, 0.5, 10, "km", update);
  R.tabs(api, s, ["Curved sea", "Flat sea"], () => { update(); lab.fit?.(); });
  lab.redraw((ctx) => {
    const p = M.horizon(s.height, s.range, s.mode === 1), hidden = Math.min(12, p.hiddenMetres);
    show(earth, s.mode === 0);
    show(flat, s.mode === 1);
    const x = -2 + s.range / 30 * 4, yy = s.mode ? 0 : -3 + Math.sqrt(Math.max(0, 9 - x * x));
    point(ship, x, yy + 0.2);
    point(mast, x, yy + 0.65);
    const ey = -3 + Math.sqrt(5) + 0.05 + s.height * 0.01;
    point(eye, -2, s.mode ? s.height * 0.01 : ey);
    R.path(sight, [[-2, s.mode ? s.height * 0.01 : ey, 0], [x, yy + 0.9, 0]]);
    primary(ctx, c, "Real-Earth visibility; overview curvature is enlarged");
    R.line(ctx, c.electron, [[20, 185], [610, 185]], 2);
    R.text(ctx,c.ink,'3D: schematic overview; strip: calculated visible hull',25,47,12);
    R.text(ctx, c.ink, `Eye: ${s.height} m`, 30, 77);
    R.text(ctx, c.ink, `Horizon: ${fmt(p.horizonKm)} km`, 30, 98);
    R.text(ctx, c.ink, `Ship: ${fmt(s.range, 1)} km`, 30, 126);
    R.rectangle(ctx, c.ink, 420, 65, 70, 120, true);
    ctx.fillStyle = c.plate;
    ctx.fillRect(418, 185 - hidden / 12 * 120, 74, hidden / 12 * 120);
    R.line(ctx, c.electron, [[390, 185], [540, 185]], 2);
    R.text(ctx, c.ink, "12 m ship", 455, 61, 14, "center");
    R.text(ctx, c.proton, `${fmt(p.hiddenMetres)} m hidden`, 390, 219, 14);
    lab.say(`${s.mode ? "Flat sea" : "Curved Earth"}: the geometric horizon is ${fmt(p.horizonKm)} km away; ${fmt(p.hiddenMetres)} m of the ship\u2019s bottom is hidden. Raising the eye changes the tangent. No refraction is included.`);
  });
}
function shadowshapes(lab, api, c) {
  const s = {}, root = R.scene(lab), sphere = R.ball(root, c.electron, 0.8, -1.3, 0), disc = R.disc(root, c.proton, 0.8, 1.3, 0), update = () => lab.refresh();
  lab.kit?.label?.("sphere", sphere, {color:c.electron});
  lab.kit?.label?.("thin disc", disc, {color:c.proton});
  R.slider(api, s, "angle", "Disc tilt", 0, 90, 1, 0, "\xB0", update);
  lab.redraw((ctx) => {
    if (disc) disc.rotation.y = s.angle * Math.PI / 180;
    primary(ctx, c, "A sphere stays circular; a disc changes its shadow");
    for (const [x, ry, col] of [[180, 65, c.electron], [460, 65 * Math.cos(s.angle * Math.PI / 180), c.proton]]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, 126, Math.max(0.4, ry), 65, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
    R.text(ctx, c.ink, "sphere", 180, 221, 15, "center");
    R.text(ctx, c.ink, `disc: ${s.angle}\xB0`, 460, 221, 15, "center");
    lab.say(`The disc\u2019s projected area is ${fmt(Math.cos(s.angle * Math.PI / 180) * 100, 0)}% of its face-on area. A sphere has the same circular outline from every direction. The projection is parallel and geometric.`);
  });
}
function measurement(lab, api, c) {
  const s = {}, root = R.scene(lab), update = () => lab.refresh();
  R.block(root, c.ink, 4.2, 0.08, 0.35, 0, -0.35);
  R.block(root, c.proton, 1.8, 0.14, 0.25, -0.5, -0.22);
  R.wire(root, c.proton, [[0.4, -0.45, 0.2], [0.4, 0.35, 0.2]]);
  const readingDots = Array.from({ length: 5 }, (_, i) => R.ball(root, c.electron, 0.055, 0, -0.05 + i * 0.11, 0.18));
  R.slider(api, s, "resolution", "Ruler division", 0.1, 1, 0.1, 0.1, "mm", update);
  R.slider(api, s, "bias", "Zero error", -3, 3, 0.1, 0, "mm", update);
  R.slider(api, s, "scatter", "Repeat scatter", 0, 2, 0.1, 0.6, "mm", update);
  lab.redraw((ctx) => {
    const p = M.measurement(36.5, s.resolution, s.bias, s.scatter), X = (v) => 60 + (v - 32) / 10 * 520;
    readingDots.forEach((m, i) => point(m, 0.4 + (p.readings[i] - 36.5) * 0.35, -0.05 + i * 0.11, 0.18));
    primary(ctx, c, "Five readings, then a magnified view of the ruler endpoint");
    p.readings.forEach((v, i) => {
      R.dot(ctx, c.electron, X(v), 55 + i * 17, 5);
      R.text(ctx, c.ink, `${i + 1}`, 30, 60 + i * 17, 13);
    });
    R.line(ctx, c.proton, [[X(36.5), 42], [X(36.5), 143]], 2, [4, 4]);
    R.text(ctx,c.proton,"known length: 36.5 mm",X(36.5)+14,49,12);
    R.text(ctx, c.ink, "Ruler around the endpoint (mm); start at zero is outside this view", 25, 45, 13);
    R.line(ctx, c.ink, [[60, 184], [580, 184]], 1);
    for (let i = 0; i <= Math.round(10 / s.resolution); i++) {
      const v = 32 + i * s.resolution, x = X(v), major = Math.abs(v - Math.round(v)) < 1e-6;
      R.line(ctx, c.ink, [[x, 184], [x, 184 + (major ? 14 : 7)]], 1);
      if (major) R.text(ctx, c.ink, String(Math.round(v)), x, 215, 12, "center");
    }
    R.line(ctx, c.proton, [[X(32), 174], [X(36.5), 174], [X(36.5), 181]], 4);
    R.text(ctx, c.ink, `mean ${fmt(p.mean)} mm; range ${fmt(p.range)} mm`, 60, 237, 14);
    lab.say(`Readings: ${p.readings.map((v) => fmt(v, 1)).join(", ")} mm. Mean error ${fmt(p.error)} mm. The ruler strip magnifies the same known 36.5 mm endpoint: changing its divisions changes the digits you can read, while repeated-reading scatter and zero error are separate effects.`);
  });
}
function scale(lab, api, c) {
  const s = {}, root = R.scene(lab), reference = R.block(root, c.ink, 0.75, 0.75, 0.75, -1.6, 0), cube = R.block(root, c.electron, 0.75, 0.75, 0.75, 1.1, 0, 0, .24), grid = Array.from({length:48}, () => R.wire(root,c.electron,[[0,0,0],[0,0,0]])), update = () => lab.refresh();
  // Include the full 0.5–3 multiplier range without changing the comparison scale.
  R.frame(lab,root,{min:[-2,-1.2,-1.2],max:[2.3,1.2,1.2]});
  lab.kit?.label?.("one unit cube", reference, {color:c.ink});
  lab.kit?.label?.("same unit grid", cube, {color:c.electron});
  R.slider(api, s, "scale", "Length multiplier", 0.5, 3, 0.1, 2, "", update);
  lab.redraw((ctx) => {
    const p = M.scaleFactors(s.scale);
    scaled(cube, p.length, p.length, p.length);
    const lattice=Motion.unitCubeLattice(s.scale);
    grid.forEach((line,i)=>{
      show(line,i<lattice.length);
      if (i<lattice.length) R.path(line,lattice[i].map(q=>q.map((v,k)=>(v-s.scale/2)*.75+(k===0?1.1:0))));
    });
    primary(ctx, c, "One unit cube compared with a scaled copy");
    R.bars(ctx, c, [{ label: "length", value: p.length, text: `${fmt(p.length)} \xD7`, color: c.ink }, { label: "face area", value: p.area, text: `${fmt(p.area)} \xD7`, color: c.electron }, { label: "volume", value: p.volume, text: `${fmt(p.volume)} \xD7`, color: c.proton }], { max: 27, width: 310, y: 48, gap: 52 });
    lab.say(`A length multiplier of ${fmt(s.scale)} gives ${fmt(p.area)} times the face area and ${fmt(p.volume)} times the volume. The blue grid keeps the original unit spacing: count units along an edge, unit squares on a face, then layers of unit cubes inside. Non-integer multipliers leave partial units at the far edges. The bars share a multiplier scale from zero to 27.`);
  });
}
function rain(lab, api, c) {
  const s = {}, root = R.scene(lab), city = R.block(root, c.ink, 4, 0.08, 2, 0, -0.7), water = R.block(root, c.electron, 4, 0.4, 2, 0, -0.45, 0, 0.45), update = () => lab.refresh();
  for (let i = 0; i < 12; i++) R.block(root, c.muted, 0.13, 0.2 + i % 3 * 0.1, 0.13, -1.8 + i % 6 * 0.65, -0.55, Math.floor(i / 6) - 0.5);
  R.slider(api, s, "area", "Footprint area", 100, 1e3, 50, 600, "km\xB2", update);
  R.slider(api, s, "depth", "Rainfall depth", 10, 200, 10, 100, "mm", update);
  lab.redraw((ctx) => {
    const p = M.rainfall(s.area, s.depth);
    scaled(city, Math.sqrt(s.area / 600), 1, Math.sqrt(s.area / 600));
    scaled(water, Math.sqrt(s.area / 600), s.depth / 100, Math.sqrt(s.area / 600));
    point(water, 0, -0.66 + 0.2 * s.depth / 100);
    primary(ctx, c, "Area \xD7 depth = volume");
    R.text(ctx, c.ink, `${s.area} km\xB2 = ${(s.area * 1e6).toLocaleString("en-GB")} m\xB2`, 30, 76, 17);
    R.text(ctx, c.ink, `${s.depth} mm = ${fmt(s.depth / 1e3, 3)} m`, 30, 111, 17);
    R.text(ctx, c.electron, `Volume: ${p.volume.toLocaleString("en-GB")} m\xB3`, 30, 153, 17);
    R.text(ctx, c.proton, `Water mass: ${p.tonnes.toLocaleString("en-GB")} tonnes`, 30, 195, 17);
    lab.say(`The illustrative footprint receives ${p.volume.toLocaleString("en-GB")} cubic metres, about ${p.tonnes.toLocaleString("en-GB")} tonnes of fresh water. The overview greatly enlarges the water depth; the printed units carry the calculation.`);
  });
}
function shadows(lab, api, c) {
  const s = {}, root = R.scene(lab), earth = R.ball(root, c.electron, 1.7, 0, -0.4, 0), sticks = [R.rod(root, c.ink, 0.025, 0.4), R.rod(root, c.ink, 0.025, 0.4)], rays = [R.vector(root, c.neutron), R.vector(root, c.neutron)], localGround=[R.wire(root,c.ink,[[0,0,0],[0,0,0]]),R.wire(root,c.ink,[[0,0,0],[0,0,0]])], shadowLines=[R.wire(root,c.proton,[[0,0,0],[0,0,0]]),R.wire(root,c.proton,[[0,0,0],[0,0,0]])], update = () => lab.refresh();
  lab.kit?.label?.("city 1: overhead Sun", sticks[0], {color:c.ink});
  lab.kit?.label?.("city 2: tilted vertical", sticks[1], {color:c.proton});
  R.slider(api, s, "distance", "Distance between cities", 1e3, 1e4, 100, 5e3, "stadia", update);
  R.slider(api, s, "angle", "Shadow angle", 1, 30, 0.1, 7.2, "\xB0", update);
  R.tabs(api, s, ["160 m stadion", "166.7 m stadion", "192 m stadion", "Unknown length"], update);
  lab.redraw((ctx) => {
    const th = s.angle * Math.PI / 180, stadion = [160, 1e3 / 6, 192, 160][s.mode], p = M.earthMeasure(s.distance, s.angle, stadion);
    for (let i = 0; i < 2; i++) {
      const a = i * th;
      point(sticks[i], 1.9 * Math.sin(a), -0.4 + 1.9 * Math.cos(a));
      if (sticks[i]) sticks[i].rotation.z = -a;
      const q=Motion.gnomonShadow(i*s.angle),shift=p=>[p[0],p[1]-.4,p[2]];
      rays[i].set([q.top[0],2.8,0],shift(q.end));
      R.path(localGround[i],[-.55,.55].map(k=>shift(q.base.map((x,j)=>x+k*q.tangent[j]))));
      R.path(shadowLines[i],[shift(q.base),shift(q.end)]);
    }
    primary(ctx, c, "Parallel rays; central and shadow angles agree");
    const X = 180, Y = 180, rr = 110;
    ctx.strokeStyle = c.electron;
    ctx.beginPath();
    ctx.arc(X, Y, rr, Math.PI, 2 * Math.PI);
    ctx.stroke();
    for (const a of [0, th]) {
      const x = X + rr * Math.sin(a), y = Y - rr * Math.cos(a);
      R.line(ctx, c.ink, [[X, Y], [x, y]], 1, [3, 3]);
      R.line(ctx, c.neutron, [[x, 37], [x, y]], 2);
    }
    R.text(ctx,c.ink,'Local vertical, parallel sunlight and ground shadow',310,45,12);
    R.line(ctx,c.ink,[[340,105],[575,105]],1);
    R.line(ctx,c.ink,[[380,105],[380,58]],3);
    const shadowPx=47*Math.tan(th);
    R.line(ctx,c.proton,[[380,105],[380+shadowPx,105]],4);
    R.arrow(ctx,c.neutron,380-24*Math.sin(th),58-24*Math.cos(th),24*Math.sin(th),24*Math.cos(th));
    R.line(ctx,c.neutron,[[380,58],[380+shadowPx,105]],1);
    R.text(ctx,c.ink,`shadow / stick = tan(${fmt(s.angle,1)}°)`,330,130,12);
    R.text(ctx,c.ink,`${fmt(s.angle,1)}° = 1 / ${fmt(360/s.angle,1)} circle`,330,155,13);
    R.text(ctx, c.electron, `${Math.round(p.circumferenceStadia).toLocaleString("en-GB")} stadia`, 345, 184, 15);
    R.text(ctx, c.proton, s.mode === 3 ? "Kilometres undetermined" : `${Math.round(p.circumferenceKm).toLocaleString("en-GB")} km`, 345, 216, 15);
    lab.say(`Circumference = 360\xB0 \xF7 ${fmt(s.angle, 1)}\xB0 \xD7 ${s.distance} = ${Math.round(p.circumferenceStadia).toLocaleString("en-GB")} stadia. ${s.mode === 3 ? "An unknown stadion length cannot give kilometres." : `At the selected stadion length this is ${Math.round(p.circumferenceKm).toLocaleString("en-GB")} km.`}`);
  });
}
function frames(lab, api, c, kind = "frames") {
  const s = {}, root = R.scene(lab), car = R.block(root, c.electron, 2.4, 1, 0.8, 0, 0, 0, 0.25), floor = R.block(root, c.ink, 2.5, 0.06, 0.9, 0, -0.5), head = R.ball(root, c.proton, 0.12), trail = R.wire(root, c.proton, R.samples(61, () => [0, 0, 0]));
  lab.kit?.label?.("vehicle",car,{color:c.electron});
  lab.kit?.label?.("same ball",head,{color:c.proton,offset:[70,-45]});
  const update = () => lab.refresh(), max = kind === "projectile" ? Math.sqrt(1.5 / 9.8) : kind === "braking" ? 2 : 1.8;
  R.clock(api, s, update, max, kind === "projectile" ? 0.15 : 0.35, 0);
  R.slider(api, s, "speed", "Initial vehicle speed", 0, 12, 0.5, kind === "projectile" ? 2 : 3, "m/s", update);
  R.tabs(api, s, ["Ground observer", "Vehicle observer"], update);
  lab.redraw((ctx) => {
    const t = s.time, brake = kind === "braking" ? 2 : 0, train = M.trainPosition(t, s.speed, brake), observer = s.mode ? train : 0;
    const bounceT = kind === "projectile" ? t : t % 0.8, h = kind === "braking" ? 0.5 : kind === "projectile" ? M.projectile(0.75, s.speed, t).height : M.toss(bounceT, 3.92).height;
    const bx = s.speed * t, scale2 = kind === "projectile" ? 2.5 : 0.5, origin = -1.6;
    point(car, origin + (train - observer) * scale2, -0.1);
    point(floor, origin + (train - observer) * scale2, -0.6);
    R.frame(lab,root,{min:[origin-1.25,-.65,-.5],max:[origin+s.speed*max*scale2+1.25,.5,.5]});
    point(head, origin + (bx - observer) * scale2, h * 0.6 - 0.45);
    const pts = R.samples(61, (u) => {
      const tt = u * t, ob = s.mode ? M.trainPosition(tt, s.speed, brake) : 0, hh = kind === "braking" ? 0.5 : kind === "projectile" ? M.projectile(0.75, s.speed, tt).height : M.toss(tt % 0.8, 3.92).height;
      return [origin + (s.speed * tt - ob) * scale2, hh * 0.6 - 0.45, 0.03];
    });
    R.path(trail, pts);
    primary(ctx, c, `${kind === "braking" ? "Braking" : "Steady motion"} \xB7 ${s.mode ? "vehicle" : "ground"} coordinates`);
    const xscale = 450 / Math.max(1, s.speed * max), baseline = 190;
    R.line(ctx, c.ink, [[25, baseline], [610, baseline]], 1);
    const cvx = 60 + (train - observer) * xscale, bvx = 60 + (bx - observer) * xscale;
    R.rectangle(ctx, c.electron, cvx - 24, baseline - 75, 150, 75);
    R.line(ctx,c.proton,pts.map(p=>[60+(p[0]-origin)/scale2*xscale,baseline-7-(p[1]+.45)/.6*55]),2);
    R.dot(ctx, c.proton, bvx, baseline - 7 - h * 55, 7);
    R.text(ctx, c.ink, `vehicle x = ${fmt(train - observer)} m`, 30, 63);
    R.text(ctx, c.proton, `ball x = ${fmt(bx - observer)} m in this frame`, 30, 230,13);
    R.text(ctx, c.ink, `same clock: ${fmt(t)} s`, 380, 63);
    R.text(ctx, c.ink, kind === "braking" ? "Floor force slows the feet first." : `Ground-frame horizontal velocity: ${fmt(s.speed)} m/s`, 30, 207, 13);
    lab.say(kind === "braking" ? `The vehicle has travelled ${fmt(train)} m. The initially unrestrained marker has travelled ${fmt(bx)} m, so it is ${fmt(bx - train)} m forward relative to the carriage. This short-time separation illustrates contact and inertia, not a complete human-body model.` : `At ${fmt(t)} s the same marker is at x=${fmt(bx)} m in the ground frame and x=${fmt(bx - train)} m relative to the vehicle. ${kind === "projectile" ? "The release retains the vehicle\u2019s horizontal velocity." : "The repeated ideal bounce is vertical in the vehicle frame and curved in the ground frame."}`);
  });
}
function trains(lab, api, c) {
  const s = {}, root = R.scene(lab), cars = [R.block(root, c.electron, 1.2, 0.4, 0.45), R.block(root, c.proton, 1.2, 0.4, 0.45), R.block(root, c.ink, 1.2, 0.4, 0.45)], update = () => lab.refresh();
  R.clock(api, s, update, 3, 0.3);
  cars.forEach((car,i)=>lab.kit?.label?.(["train 1:60 km/h north","train 2:70 km/h north","train 3:60 km/h south"][i],car,{color:[c.electron,c.proton,c.ink][i]}));
  R.tabs(api, s, ["Track", "60 km/h north", "70 km/h north"], update);
  lab.redraw((ctx) => {
    const speeds = [60, 70, -60], frame = [0, 60, 70][s.mode];
    primary(ctx, c, "Same events, velocities relative to the chosen observer");
    speeds.forEach((v, i) => {
      const rel = v - frame, xx = ((rel / 3.6 * s.time / 12 + 3) % 6 + 6) % 6 - 3;
      point(cars[i], xx, 0.7 - i * 0.7);
      R.text(ctx, [c.electron, c.proton, c.ink][i], `Train ${i + 1}: ${v} km/h on track`, 25, 68 + i * 47, 15);
      R.arrow(ctx, [c.electron, c.proton, c.ink][i], 350, 64 + i * 47, rel * 0.95, 0);
      R.text(ctx, c.ink, `${rel > 0 ? "+" : ""}${rel} km/h`, 520, 70 + i * 47, 14);
    });
    lab.say(`Relative to ${s.mode === 0 ? "the track" : s.mode === 1 ? "the 60 km/h train" : "the 70 km/h train"}, the velocities are ${speeds.map((v) => v - frame).join(", ")} km/h. The displayed carriage positions wrap to keep the comparison in view.`);
  });
}
function braking(lab,api,c){
  const s={},root=R.scene(lab),car=R.block(root,c.electron,3.4,.06,1,0,-.8),head=R.ball(root,c.proton,.14),body=R.wire(root,c.ink,[[0,0,0],[0,0,0]]),feet=R.block(root,c.ink,.35,.08,.3),bag=R.block(root,c.neutron,.35,.4,.25),contact=R.vector(root,c.electron),update=()=>lab.refresh();
 lab.kit?.label?.('passenger',head,{color:c.proton});lab.kit?.label?.('loose bag',bag,{color:c.neutron,offset:[70,-30]});lab.kit?.label?.('floor force on feet',contact.group?.children[1],{color:c.electron,offset:[-20,38]});
 R.clock(api,s,update,.6,.2,.15);R.slider(api,s,'speed','Initial train speed',0,12,.5,3,'m/s',update);R.tabs(api,s,['Ground observer','Train observer'],update);
 lab.redraw(ctx=>{
  const p=Motion.hingedPassenger(s.time,s.speed),observer=s.mode?p.feet:0,k=.6,X=x=>-1.5+(x-observer)*k,foot=[X(p.feet),-.73,0],top=[X(p.head),-.73+p.height*k,0];
  point(car,X(p.feet),-.8);point(feet,...foot);point(head,...top);R.path(body,[foot,top]);point(bag,X(p.bag)+.7,-.57,.2);
  contact.set([foot[0],-.66,.3],[foot[0]+p.footForce*.25,-.66,.3]);
  primary(ctx,c,`${s.mode?'Train':'Ground'} frame: feet, torso and loose bag share one clock`);
  const D=x=>65+(x-observer)*32;
  R.line(ctx,c.ink,[[25,190],[610,190]]);R.rectangle(ctx,c.electron,D(p.feet)-25,58,160,132);
  R.line(ctx,c.ink,[[D(p.feet),185],[D(p.head),185-p.height*65]],6);R.dot(ctx,c.proton,D(p.head),185-p.height*65,9);
  R.rectangle(ctx,c.neutron,D(p.bag)+45,163,20,27,true);R.arrow(ctx,c.electron,D(p.feet),180,p.footForce*22,0);
  R.text(ctx,c.ink,`t ${fmt(s.time)} s · braking 2 m/s² until stopped`,25,47,13);
  R.text(ctx,c.ink,'Blue arrow: floor contact on feet; bag slides on an ideal smooth floor',25,226,12);
  lab.say(`Feet x=${fmt(p.feet-observer)} m; head x=${fmt(p.head-observer)} m; loose bag displacement=${fmt(p.bag-observer)} m in this frame. Floor contact decelerates the feet. The upper body initially continues and tips forward; the bag keeps its ground velocity. This short-time hinged-body model uses a 1.4 m rigid torso and omits muscle response, stepping and floor friction on the bag. No forward force from the train is acting on the bag.`);
 });
}
function graph(lab, api, c) {
  const s = {}, root = R.scene(lab), update = () => lab.refresh();
  R.block(root, c.rule, 4.4, 0.05, 0.6, 0, -0.4);
  for (let i = 0; i <= 6; i++) R.rod(root, c.muted, 0.02, 0.2, -1.8 + i * 0.6, -0.28, -0.25);
  const walker = R.ball(root, c.proton, 0.14, -1.8, -0.22), velVec = R.vector(root, c.electron);
  R.clock(api, s, update, 12, 0.8);
  R.slider(api, s, "interval", "Slope measurement interval", 0.05, 2, 0.05, 1, "s", update);
  R.tabs(api, s, ["Figure walk", "Out and back", "Smooth motion"], update);
  const position = (t) => s.mode === 2 ? 6 * Math.sin(Math.PI * t / 12) : s.mode === 1 ? t <= 6 ? t : 12 - t : M.walk(t).x;
  lab.redraw((ctx) => {
    const t = s.time, x = position(t), distance = s.mode === 2 ? t <= 6 ? x : 12 - x : s.mode === 1 ? t : M.walk(t).distance, velocity = s.mode === 2 ? Math.PI / 2 * Math.cos(Math.PI * t / 12) : s.mode === 1 ? t < 6 ? 1 : -1 : M.walk(t).velocity;
    const wx = -1.8 + x * 0.6;
    point(walker, wx, -0.22);
    velVec.set([wx, 0.02, 0], [wx + velocity * 0.35, 0.02, 0]);
    const start = Math.max(0, t - s.interval / 2), end = Math.min(12, t + s.interval / 2), slope = (position(end) - position(start)) / (end - start), a = R.plot(ctx, c, [{ color: c.electron, values: R.samples(121, (u) => [u * 12, position(u * 12)]) }], { xmax: 12, ymax: 6, xlabel: "time (s)", ylabel: "position (m)" });
    R.line(ctx, c.proton, [[a.X(start), a.Y(position(start))], [a.X(end), a.Y(position(end))]], 4);
    R.dot(ctx, c.proton, a.X(t), a.Y(x), 6);
    R.text(ctx, c.ink, `distance ${fmt(distance)} m \xB7 displacement ${fmt(x)} m \xB7 \u0394t ${fmt(end - start)} s`, 55, 225, 13);
    const averages = t > 0 ? `average speed ${fmt(distance / t)} m/s, average velocity ${fmt(x / t)} m/s` : 'average speed and average velocity are not defined yet: no time has elapsed';
    lab.say(`At ${fmt(t)} s: ${averages}. Across \u0394t=${fmt(end - start)} s the red secant slope is ${fmt(slope, 4)} m/s; ${s.mode === 2 ? `instantaneous velocity is ${fmt(velocity, 4)} m/s. Shrink the interval to compare them.` : "use Smooth motion to study the limit without instantaneous stops or turns."} The graph is not a road.`);
  });
}
function acceleration(lab, api, c) {
  const s = {}, root = R.scene(lab), update = () => lab.refresh();
  R.block(root, c.rule, 4.8, 0.05, 0.6, 0, -0.35);
  const car = R.block(root, c.ink, 0.55, 0.22, 0.36, 0, -0.2), vVec = R.vector(root, c.electron), aVec = R.vector(root, c.proton);
  R.clock(api, s, update, 4, 0.5);
  R.slider(api, s, "v0", "Initial velocity", -4, 4, 0.5, -4, "m/s", update);
  R.slider(api, s, "a", "Acceleration", -2, 2, 0.5, -1, "m/s\xB2", update);
  lab.redraw((ctx) => {
    const p = M.constantAcceleration(s.time, s.v0, s.a);
    const cx = 1.8 * Math.tanh(p.x / 8);
    point(car, cx, -0.2);
    vVec.set([cx, 0.05, 0], [cx + p.v * 0.22, 0.05, 0]);
    aVec.set([cx, -0.48, 0], [cx + s.a * 0.45, -0.48, 0]);
    primary(ctx, c, "Right is positive; arrows determine speeding or slowing");
    R.line(ctx, c.rule, [[30, 151], [610, 151]], 1);
    const x = 320 + 120 * Math.tanh(p.x / 8);
    R.rectangle(ctx, c.ink, x - 22, 126, 44, 24, true);
    R.arrow(ctx, c.electron, x, 112, p.v * 15, 0, "v");
    R.arrow(ctx, c.proton, x, 177, s.a * 45, 0, "a");
    R.text(ctx, c.ink, `v = ${fmt(p.v)} m/s`, 30, 65, 16);
    R.text(ctx, c.ink, `a = ${fmt(p.a)} m/s\xB2`, 355, 65, 16);
    R.text(ctx, c.ink, Math.abs(p.v) < 1e-7 ? "Zero velocity for an instant; acceleration unchanged." : p.v * p.a > 0 ? "Speed is increasing." : p.v * p.a < 0 ? "Speed is decreasing." : "Velocity is constant.", 30, 223, 16);
    lab.say(`Velocity ${fmt(p.v)} m/s; acceleration ${fmt(p.a)} m/s\xB2. ${p.v * p.a > 0 ? "They point the same way, so speed grows." : p.v * p.a < 0 ? "They point opposite ways, so speed shrinks." : "A zero velocity does not require zero acceleration."} The car position is compressed to remain visible; arrows keep their labelled scales.`);
  });
}
function galileo(lab, api, c) {
  const s = {}, root = R.scene(lab), update = () => lab.refresh();
  const beam = R.block(root, c.ink, 4.4, 0.07, 0.45, 0, -0.1);
  const bells = Array.from({ length: 5 }, () => R.ball(root, c.muted, 0.045));
  const sliderBox = R.block(root, c.proton, 0.22, 0.12, 0.22), roller = R.ball(root, c.proton, 0.11);
  R.clock(api, s, update, 4, 0.45);
  R.slider(api, s, "angle", "Ramp angle", 1, 10, 1, 5, "\xB0", update);
  R.tabs(api, s, ["Sliding particle", "Rolling solid sphere"], update);
  lab.redraw((ctx) => {
    const p = M.ramp(s.angle, s.time, !!s.mode), at4 = M.ramp(s.angle, 4, !!s.mode), ref=M.ramp(s.angle,4,false), X = (x2) => 45 + x2 / ref.x * 540;
    const th = s.angle * Math.PI / 180, cth = Math.cos(th), sth = Math.sin(th);
    if (beam) beam.rotation.z = -th;
    for (let i = 0; i <= 4; i++) {
      const q = M.ramp(s.angle, i, !!s.mode), u = (q.x / ref.x - 0.5) * 3.8;
      point(bells[i], u * cth, -0.1 - u * sth + 0.09, 0.18);
    }
    const uNow = (p.x / ref.x - 0.5) * 3.8;
    show(sliderBox, !s.mode);
    show(roller, !!s.mode);
    if (sliderBox) sliderBox.rotation.z = -th;
    point(sliderBox, uNow * cth, -0.1 - uNow * sth + 0.1);
    point(roller, uNow * cth, -0.1 - uNow * sth + 0.14);
    primary(ctx, c, "One clock links equal-time markers, distance and velocity");
    R.line(ctx, c.ink, [[45, 51], [585, 73]], 2);
    for (let i = 0; i <= 4; i++) {
      const q = M.ramp(s.angle, i, !!s.mode);
      R.dot(ctx, c.muted, X(q.x), 51 + q.x / ref.x * 22, 4);
      R.text(ctx, c.ink, String(i * i), X(q.x), 35, 12, "center");
    }
    const px=X(p.x),py=51+p.x/ref.x*22-8;
    if(s.mode){R.dot(ctx,c.proton,px,py,8);const spin=p.x/.02;R.line(ctx,c.ink,[[px,py],[px+7*Math.cos(spin),py+7*Math.sin(spin)]],2);}else R.rectangle(ctx,c.proton,px-8,py-5,16,10,true);
    const x = R.plot(ctx, c, [{ color: c.electron, values: R.samples(61, (u) => [4 * u, M.ramp(s.angle, 4 * u, !!s.mode).x]) }], { x: 75, y: 197, w: 210, h: 70, xmax: 4, ymax: ref.x, xlabel: "time (s)", ylabel: "distance (m)" });
    const v = R.plot(ctx, c, [{ color: c.proton, values: [[0, 0], [4, at4.v]] }], { x: 390, y: 197, w: 210, h: 70, xmax: 4, ymax: ref.v, xlabel: "time (s)", ylabel: "velocity (m/s)" });
    R.dot(ctx, c.proton, x.X(s.time), x.Y(p.x), 4);
    R.dot(ctx, c.electron, v.X(s.time), v.Y(p.v), 4);
    lab.say(`${s.mode ? "Rolling sphere" : "Sliding particle"}: acceleration ${fmt(p.a, 3)} m/s\xB2, velocity ${fmt(p.v)} m/s, distance ${fmt(p.x)} m. The velocity graph rises linearly while distance curves as t\xB2. Equal-time distances follow 0,1,4,9,16. Both modes retain the same physical graph scales; the 2 cm radius sphere’s marker turns by distance/radius, while the slider does not rotate. The ramp’s vertical drop is framed separately. Rolling gives 5/7 of the sliding acceleration for a uniform solid sphere.`);
  });
}
function toss(lab, api, c) {
  const s = {}, root = R.scene(lab), update = () => lab.refresh();
  R.block(root, c.ink, 1.8, 0.06, 0.8, 0, -0.9);
  R.rod(root, c.rule, 0.02, 1.8, -0.5, 0);
  const ball = R.ball(root, c.proton, 0.13, 0, -0.8), vVec = R.vector(root, c.electron), gVec = R.vector(root, c.proton);
  R.clock(api, s, update, 2 * 4.43 / 9.8, 0.15);
  R.tabs(api, s, ["Height", "Velocity", "Acceleration"], update);
  lab.redraw((ctx) => {
    const p = M.toss(s.time), T = 2 * 4.43 / 9.8, key = ["height", "v", "a"][s.mode], bounds = [[0, 1.05], [-4.5, 4.5], [-11, 0]][s.mode];
    const by = -0.8 + p.height * 1.4;
    point(ball, 0, by);
    vVec.set([0.28, by, 0], [0.28, by + p.v * 0.18, 0]);
    gVec.set([-0.28, by, 0], [-0.28, by - 0.55, 0]);
    const a = R.plot(ctx, c, [{ color: c.electron, values: R.samples(121, (u) => {
      const q = M.toss(u * T);
      return [u * T, q[key]];
    }) }], { xmax: T, ymin: bounds[0], ymax: bounds[1], ylabel: ["height (m)", "velocity (m/s)", "acceleration (m/s\xB2)"][s.mode] });
    R.dot(ctx, c.proton, a.X(s.time), a.Y(p[key]));
    R.line(ctx, c.proton, [[a.X(p.topTime), 43], [a.X(p.topTime), 190]], 1, [4, 4]);
    R.text(ctx, c.ink, `h ${fmt(p.height)} m   v ${fmt(p.v)} m/s   a \u22129.80 m/s\xB2`, 60, 225, 15);
    lab.say(`The top is at ${fmt(p.topTime, 3)} s. At the selected time, height ${fmt(p.height)} m, velocity ${fmt(p.v)} m/s and acceleration \u22129.80 m/s\xB2. All three graphs use the same physical clock.`);
  });
}
function inertia(lab, api, c) {
  const s = {}, root = R.scene(lab), book = R.block(root, c.proton, 0.6, 0.12, 0.45);
  R.block(root, c.ink, 6, 0.07, 1, 0, -0.275);
  const hand = R.block(root, c.neutron, 0.3, 0.12, 0.4), fingers = Array.from({ length: 3 }, () => R.block(root, c.neutron, 0.06, 0.055, 0.07)), back = R.vector(root, c.electron), forward = R.vector(root, c.proton), update = () => lab.refresh();
  lab.kit?.label?.("book",book,{color:c.proton});
  lab.kit?.label?.("hand",hand,{color:c.neutron});
  R.clock(api, s, update, 5, 0.5);
  R.slider(api, s, "mu", "Sliding friction coefficient", 0, 0.5, 0.02, 0.2, "", update);
  R.slider(api, s, "v0", "Release speed", 1, 5, 0.5, 4, "m/s", update);
  lab.redraw((ctx) => {
    const p = M.shove(s.v0, s.mu, s.time), x = -2.5 + 5 * p.distance / (5 * s.v0), handX = x - 0.45 - (p.contact ? 0 : Math.min(1.2, (s.time - 0.4) * 2));
    point(book, x, -0.18);
    point(hand, handX, -0.12);
    fingers.forEach((f, i) => point(f, handX + 0.12, -0.1, (i - 1) * 0.1));
    back.set([x, -0.05, 0], [x + p.friction / 5, -0.05, 0]);
    forward.set([x, 0.18, 0], [x + p.hand / 10, 0.18, 0]);
    primary(ctx, c, p.contact ? "The hand is touching and pushing the book" : "The hand has departed; the book carries no stored force");
    R.plot(ctx, c, [{ color: c.electron, values: R.samples(101, (u) => [u * 5, M.shove(s.v0, s.mu, u * 5).v]) }], { xmax: 5, ymax: 5, ylabel: "velocity (m/s)" });
    R.text(ctx, c.ink, `hand on book ${fmt(p.hand)} N; table on book ${fmt(p.friction)} N`, 60, 225, 14);
    lab.say(`${p.contact ? "Before release at 0.40 s, the hand pushes." : "After release at 0.40 s, hand force is zero."} Velocity ${fmt(p.v)} m/s, distance ${fmt(p.distance)} m. ${s.mu === 0 && !p.contact ? "No horizontal force remains, so velocity stays constant." : `The table exerts ${fmt(p.friction)} N of horizontal friction on this 1 kg book.`} Only horizontal forces are drawn; Earth’s weight and the table’s normal balance vertically. The replay resets after five seconds.`);
  });
}
function arrowflight(lab,api,c){
  const s={},root=R.scene(lab),shaft=R.vector(root,c.ink),weight=R.vector(root,c.proton),drag=R.vector(root,c.electron),trail=R.wire(root,c.muted,R.samples(81,()=>[0,0,0]));
  const update=()=>lab.refresh();
  R.clock(api,s,update,1,.35,.15);
  R.slider(api,s,'speed','Release speed',6,18,.5,12,'m/s',update);
  R.slider(api,s,'drag','Air drag rate',0,.8,.05,.2,'s⁻¹',update);
  const bow=R.wire(root,c.neutron,R.samples(41,u=>[-2.6+.22*Math.sin(Math.PI*u),.3+u*.8,0]));
  lab.kit?.label?.('released bow',R.anchor(bow,-2.38,.7,0),{color:c.neutron,offset:[0,-30]});
  lab.kit?.label?.('Earth: gravity',weight.group?.children[1],{color:c.proton,offset:[60,12]});
  lab.kit?.label?.('air: drag',drag.group?.children[1],{color:c.electron});
  lab.redraw(ctx=>{
    const p=Motion.arrowFlight(s.time,s.speed,s.drag),toScene=q=>[-2.3+q.x*.25,-1.2+q.y*.25,0],pos=toScene(p),vnorm=Math.hypot(p.vx,p.vy);
    shaft.set(pos,[pos[0]+.65*p.vx/vnorm,pos[1]+.65*p.vy/vnorm,0]);
    weight.set([pos[0],pos[1],.1],[pos[0],pos[1]-9.8*.065,.1]);
    drag.set([pos[0],pos[1],.15],[pos[0]+p.drag[0]*.065,pos[1]+p.drag[1]*.065,.15]);
    R.path(trail,R.samples(81,u=>toScene(Motion.arrowFlight(s.time*u,s.speed,s.drag))));
    primary(ctx,c,'After release: Earth pulls; air resists; the bow no longer pushes');
    const X=x=>50+x/18*530,Y=y=>195-y/6*140;
    R.line(ctx,c.rule,[[50,195],[580,195]],1);
    R.line(ctx,c.muted,R.samples(81,u=>{const q=Motion.arrowFlight(s.time*u,s.speed,s.drag);return[X(q.x),Y(q.y)];}));
    R.arrow(ctx,c.ink,X(p.x)-15,Y(p.y),30*p.vx/vnorm,-30*p.vy/vnorm);
    R.arrow(ctx,c.proton,X(p.x),Y(p.y),0,9.8*4,'Earth');
    R.arrow(ctx,c.electron,X(p.x),Y(p.y),p.drag[0]*4,-p.drag[1]*4,'air');
    R.text(ctx,c.ink,`Bow force = 0 N · model mass 0.10 kg · t=${fmt(s.time)} s`,35,226,13);
    lab.say(`Bow force is zero after release. Earth supplies 0.98 N downward; air drag magnitude ${fmt(.1*Math.hypot(...p.drag))} N opposes velocity. Horizontal speed ${fmt(p.vx)} m/s. ${s.drag===0?'Without air, no horizontal force acts and horizontal velocity remains constant.':'Air reduces horizontal speed; it is an interaction with the air, not a stored forward force.'} Linear drag is an illustrative point-particle approximation; orientation follows velocity and lift is omitted.`);
  });
}
function friction(lab, api, c) {
  const s = {}, root = R.scene(lab), top = R.block(root, c.proton, 4, 0.5, 1, 0, 0.35), base = R.block(root, c.ink, 4, 0.5, 1, 0, -0.35), junctions = [];
  for (let i = 0; i < 9; i++) junctions.push(R.block(root, c.electron, 0.08, 0.22, 0.25, -1.8 + i * 0.45, 0, 0));
  let phase=0;api.loop(dt=>phase+=dt);
  const push = R.vector(root, c.proton), resist = R.vector(root, c.electron), update = () => lab.refresh();
  R.slider(api, s, "push", "Applied push", 0, 100, 1, 20, "N", update);
  R.slider(api, s, "mass", "Load mass", 2, 20, 1, 10, "kg", update);
  lab.redraw((ctx) => {
    const p = M.friction(s.push, s.mass);
    api.playback?.(p.slipping);
    const shear=p.slipping?((phase*.6)% .45):s.push/100*.12;
    point(top,shear,.35);
    junctions.forEach((j, i) => {
      const extension=p.slipping?((phase*.6+i*.05)%.45):shear;
      point(j,-1.8+i*.45+extension/2,0,0);
      scaled(j,.5+s.mass/20,Math.hypot(.22,extension)/.22,1);
      if(j)j.rotation.z=-Math.atan2(extension,.22);
      show(j,!p.slipping||extension<.24);
    });
    push.set([-1, 0.9, 0.7], [-1 + s.push / 55, 0.9, 0.7]);
    resist.set([1+shear,.3,.6],[1+shear+p.force/55,.3,.6]);
    primary(ctx, c, p.slipping ? "Sliding: junctions deform and break" : "Sticking: friction matches the push");
    const maxF = 100;
    R.bars(ctx, c, [{ label: "applied push", value: s.push, text: `${fmt(s.push, 0)} N`, color: c.proton }, { label: "friction magnitude", value: Math.abs(p.force), text: `${fmt(Math.abs(p.force))} N`, color: c.electron }, { label: "static limit", value: p.limit, text: `${fmt(p.limit)} N`, color: c.muted }], { max: maxF, width: 300, y: 52, gap: 48 });
    R.rectangle(ctx,c.proton,300+shear*100,185,290,13,true);R.rectangle(ctx,c.ink,300,220,290,13,true);
    for(let i=0;i<7;i++){const extension=p.slipping?((phase*.6+i*.05)%.45):shear;if(!p.slipping||extension<.24)R.line(ctx,c.electron,[[320+i*40,220],[320+i*40+extension*100,198]],3);}
    R.text(ctx,c.ink,p.slipping?'Play: stretch, break, reform':'Sticking: elastic shear',25,211,12);
    lab.say(`${p.slipping ? "Sliding begins; Play shows junctions stretch, break and form again" : "The contact sticks; junctions shear elastically while forces balance"}: friction ${fmt(p.force)} N, net force ${fmt(p.net)} N. The static limit is ${fmt(p.limit)} N. The magnified junctions bridge the actual two surfaces; their cycle and deformation are schematic, not a molecular dynamics solution. Roughness alone is not a complete friction explanation.`);
  });
}
function tablecloth(lab, api, c) {
  const s = {}, root = R.scene(lab), cloth = R.block(root, c.electron, 2, 0.03, 1, 0, -.145), plate = R.rod(root, c.paper, 0.4, 0.08, 0, -.09), floor=R.block(root,c.ink,6,.12,1.2,0,-.22), pull=R.vector(root,c.electron), update = () => lab.refresh();
  lab.kit?.label?.("plate",plate,{color:c.ink});
  lab.kit?.label?.("cloth motion",pull.group?.children[1],{color:c.electron});
  R.slider(api, s, "duration", "Pull duration", 0.02, 0.5, 0.01, 0.1, "s", update);
  R.slider(api, s, "mass", "Plate mass", 0.2, 3, 0.1, 1, "kg", update);
  R.tabs(api,s,["Before pull","During contact","After cloth clears"],update,2);
  lab.redraw((ctx) => {
    const p = M.tablecloth(s.duration, 0.3, s.mass);
    const fraction=s.mode===0?0:s.mode===1?.5:1,plateX=s.mode===2?p.totalDistance*2:p.during*fraction*fraction*2,clothX=s.mode===2?plateX+1.45:(p.during*2+1.45)*fraction;
    point(plate,plateX,s.mode===2?-.12:-.09);point(cloth,clothX,-.145);
    pull.set([clothX+.3,.15,.2],[clothX+1,.15,.2]);show(pull.group,s.mode!==0);
    primary(ctx, c, "Same friction model, different contact time");
    const graph=R.plot(ctx,c,[{color:c.electron,values:[[0,p.force],[s.duration,p.force],[s.duration,0],[.5,0]]}],{xmax:.5,ymax:10,ylabel:'cloth force (N)',xlabel:'contact time (s)',y:173,h:115,w:270});
    ctx.fillStyle=c.electron;ctx.globalAlpha=.15;ctx.fillRect(graph.X(0),graph.Y(p.force),graph.X(s.duration)-graph.X(0),graph.Y(0)-graph.Y(p.force));ctx.globalAlpha=1;
    R.text(ctx,c.ink,`area = impulse ${fmt(p.force*s.duration,3)} N·s = change in momentum`,50,214,13);
    R.text(ctx,c.ink,`travel: ${fmt(p.during*100)} cm on cloth + ${fmt(p.after*100)} cm after`,50,237,13);
    const V=x=>420+45*x;R.line(ctx,c.ink,[[365,170],[610,170]],2);R.rectangle(ctx,c.electron,V(clothX)-45,166,90,4,true);
    ctx.strokeStyle=c.ink;ctx.beginPath();ctx.ellipse(V(plateX),s.mode===2?166:162,18,4,0,0,2*Math.PI);ctx.stroke();
    if(s.mode!==0)R.arrow(ctx,c.electron,V(clothX),128,35,0);
    R.text(ctx,c.ink,['Before pull','During contact','Cloth fully clear'][s.mode],375,84,13);
    R.text(ctx,c.muted,'Same state, side view',375,105,12);
    lab.say(`${["Before: plate rests on cloth.","During: cloth moves right and its friction pushes the plate right.","After: cloth has cleared; the plate rests on the bare table."][s.mode]} The shaded force-time area is impulse ${fmt(p.force*s.duration,3)} N·s, giving release speed ${fmt(p.a*s.duration)} m/s. The plate moves ${fmt(p.during * 100)} cm while the cloth acts, then ${fmt(p.after * 100)} cm on the bare table: ${fmt(p.totalDistance * 100)} cm total. Doubling mass doubles friction and impulse but leaves this acceleration and displacement unchanged.`);
  });
}
function vectors(lab, api, c) {
  const s = {}, root = R.scene(lab), cart = R.block(root, c.ink, 0.5, 0.25, 0.6, 0, -0.3), v1 = R.vector(root, c.electron), v2 = R.vector(root, c.electron), net = R.vector(root, c.proton), accel = R.vector(root,c.neutron), para = R.wire(root, c.rule, [[0, 0, 0], [0, 0, 0], [0, 0, 0]]), update = () => lab.refresh();
  lab.kit?.label?.("pull 1",v1.group?.children[1],{color:c.electron});
  lab.kit?.label?.("pull 2",v2.group?.children[1],{color:c.electron});
  lab.kit?.label?.("resultant force",net.group?.children[1],{color:c.proton});
  lab.kit?.label?.("acceleration",accel.group?.children[1],{color:c.neutron,offset:[75,10]});
  R.slider(api, s, "force", "Each pull", 1, 10, 0.5, 5, "N", update);
  R.slider(api, s, "angle", "Angle between pulls", 0, 180, 5, 90, "\xB0", update);
  R.slider(api, s, "mass", "Mass", 1, 5, 0.5, 1, "kg", update);
  lab.redraw((ctx) => {
    const p = M.resultant(s.force, s.angle, s.mass), th = s.angle * Math.PI / 180;
    v1.set([0, 0, 0], [s.force / 8, 0, 0]);
    v2.set([0, 0, 0], [s.force / 8 * Math.cos(th), s.force / 8 * Math.sin(th), 0]);
    net.set([0, 0, 0.1], [p.x / 8, p.y / 8, 0.1]);
    accel.set([0,-.85,.1],[p.x/(8*s.mass),-.85+p.y/(8*s.mass),.1]);
    R.path(para, [[s.force / 8, 0, 0], [p.x / 8, p.y / 8, 0], [s.force / 8 * Math.cos(th), s.force / 8 * Math.sin(th), 0]]);
    primary(ctx, c, "Head-to-tail addition; 1 screen unit represents the same force");
    const x = 190, y = 180, k = 15;
    R.arrow(ctx, c.electron, x, y, s.force * k, 0);
    R.arrow(ctx, c.electron, x + s.force * k, y, s.force * k * Math.cos(th), -s.force * k * Math.sin(th));
    R.arrow(ctx, c.proton, x, y, p.x * k, -p.y * k);
    R.text(ctx, c.ink, `resultant ${fmt(p.magnitude)} N`, 375, 70, 16);
    R.text(ctx, c.ink, `acceleration ${fmt(p.magnitude / s.mass)} m/s\xB2`, 375, 105, 14);
    R.text(ctx,c.neutron,"Acceleration: separate arrow scale",375,135,12);
    R.arrow(ctx,c.neutron,415,190,p.x/s.mass*8,-p.y/s.mass*8);
    lab.say(`Two ${fmt(s.force, 1)} N pulls at ${s.angle}\xB0 give a resultant of ${fmt(p.magnitude)} N. Dividing by ${fmt(s.mass, 1)} kg gives acceleration ${fmt(p.magnitude / s.mass)} m/s\xB2. Blue/red arrows share the force scale (8 N per scene unit); the yellow acceleration arrow has its own scale (8 m/s² per scene unit). Changing mass leaves the forces fixed and changes the acceleration.`);
  });
}
function newton(lab, api, c) {
  const s = {}, root = R.scene(lab);
  R.block(root, c.rule, 4.2, 0.05, 0.45, 0, -0.35, -0.45);
  R.block(root, c.rule, 4.2, 0.05, 0.45, 0, -0.35, 0.45);
  const refCart = R.block(root, c.electron, 0.42, 0.22, 0.34, -1.6, -0.2, -0.45);
  const testCart = R.block(root, c.proton, 0.42, 0.22, 0.34, -1.6, -0.2, 0.45);
  const refF = R.vector(root, c.electron), testF = R.vector(root, c.proton), testA = R.vector(root, c.neutron), update = () => lab.refresh();
  lab.kit?.label?.("reference 1 kg cart", refCart, { color: c.electron });
  lab.kit?.label?.("adjustable cart", testCart, { color: c.proton });
  R.clock(api, s, update, 1.5, 0.05);
  R.slider(api, s, "force", "Applied net force", 1, 10, 0.5, 4, "N", update);
  R.slider(api, s, "mass", "Cart mass", 0.5, 5, 0.5, 2, "kg", update);
  lab.redraw((ctx) => {
    const aRef = 4 / 1, aTest = s.force / s.mass, t = s.time;
    const xRef = Math.min(1.6, -1.6 + 0.5 * aRef * t * t * 0.65);
    const xTest = Math.min(1.6, -1.6 + 0.5 * aTest * t * t * 0.65);
    point(refCart, xRef, -0.2, -0.45);
    point(testCart, xTest, -0.2, 0.45);
    scaled(testCart, 1, 0.75 + 0.15 * s.mass, 1);
    refF.set([xRef + 0.22, -0.2, -0.45], [xRef + 0.22 + 4 / 10, -0.2, -0.45]);
    testF.set([xTest + 0.22, -0.2, 0.45], [xTest + 0.22 + s.force / 10, -0.2, 0.45]);
    testA.set([xTest, 0.08, 0.45], [xTest + aTest / 12, 0.08, 0.45]);
    primary(ctx, c, "Same force on more mass gives smaller acceleration (a = F / m)");
    const ax = R.plot(ctx, c, [
      { color: c.electron, values: R.samples(61, (u) => [u * 1.5, aRef * u * 1.5]), dash: [4, 4] },
      { color: c.proton, values: R.samples(61, (u) => [u * 1.5, aTest * u * 1.5]) }
    ], { x: 45, y: 195, w: 280, h: 120, xmax: 1.5, ymax: 30, xlabel: "time (s)" });
    R.dot(ctx, c.proton, ax.X(t), ax.Y(aTest * t), 5);
    R.text(ctx, c.electron, "reference: 4 N on 1 kg → 4.00 m/s\xB2", 355, 78, 14);
    R.text(ctx, c.proton, `test cart: ${fmt(s.force, 1)} N on ${fmt(s.mass, 1)} kg`, 355, 114, 15);
    R.text(ctx, c.ink, `a = F / m = ${fmt(aTest)} m/s\xB2`, 355, 150, 17);
    R.text(ctx, c.neutron, `speed at ${fmt(t)} s: ${fmt(aTest * t)} m/s`, 355, 186, 14);
    lab.say(`Applying ${fmt(s.force, 1)} N to a ${fmt(s.mass, 1)} kg cart produces acceleration a = F/m = ${fmt(aTest)} m/s\xB2, compared with 4.00 m/s\xB2 for the 1 kg reference cart under 4 N. Doubling mass at fixed force halves the slope of v(t); doubling force at fixed mass doubles it.`);
  });
}
function support(lab, api, c) {
  const s = {}, root = R.scene(lab), plate = R.block(root, c.ink, 3, 0.12, 1, 0, -0.5), load = R.block(root, c.proton, 0.6, 0.4, 0.5, 0, -0.1), normal = R.vector(root, c.electron), weight = R.vector(root, c.proton), uphill = R.vector(root,c.neutron), spring = R.wire(root, c.electron, R.samples(81, () => [0, 0, 0])), sponge = R.block(root, c.neutron, 1, 0.6, 0.8, 0, -0.7), legs = [R.block(root, c.ink, 0.15, 0.8, 0.15, -1, -0.9), R.block(root, c.ink, 0.15, 0.8, 0.15, 1, -0.9)], atoms = [], bonds = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 7; col++) {
    atoms.push({ mesh: R.ball(root, c.electron, 0.065), row, col });
    if (row < 2) bonds.push({ wire: R.wire(root, c.rule, [[0, 0, 0], [0, 0, 0]]), row, col });
  }
  const update = () => lab.refresh();
  lab.kit?.label('support N',normal.group.children[1],{color:c.electron});
  lab.kit?.label('Earth: weight',weight.group.children[1],{color:c.proton,offset:[55,0]});
  lab.kit?.label('uphill friction',uphill.group.children[1],{color:c.neutron});
  R.slider(api, s, "mass", "Load mass", 1, 20, 1, 10, "kg", update);
  R.slider(api, s, "angle", "Support tilt", 0, 45, 5, 0, "\xB0", update);
  R.tabs(api, s, ["Spring", "Sponge", "Bent ruler", "Table"], update);
  lab.redraw((ctx) => {
    const k = [100, 500, 1e4, 1e7][s.mode], p = M.support(s.mass, s.angle, k), a = s.angle * Math.PI / 180, sag = Math.min(s.mode===3?.3:.6, p.compression * [1, 2, 100, 1e5][s.mode]);
    const geo=Motion.supportContact(s.angle,sag),n=geo.normal,t=geo.tangent;
    if(plate)plate.rotation.z=-a;if(load)load.rotation.z=-a;
    point(plate,...(s.mode===3?geo.at(-sag-.3):geo.plate));scaled(plate,s.mode<2?.4:1,s.mode===3?5:1,s.mode<2?.4:1);point(load,...geo.load);show(plate,s.mode!==2);
    if(plate){plate.material.transparent=s.mode===3||s.mode===0;plate.material.opacity=s.mode===3?.18:s.mode===0?.25:1;}
    const origin=geo.load;
    normal.set(origin,origin.map((x,j)=>x+n[j]*p.normal/120));
    weight.set([origin[0],origin[1],.2],[origin[0],origin[1]-p.weight/120,.2]);
    uphill.set([origin[0],origin[1],.3],[origin[0]-t[0]*p.along/120,origin[1]-t[1]*p.along/120,.3]);
    show(spring,s.mode===0||s.mode===2);show(sponge,s.mode===1);
    if(sponge)sponge.rotation.z=-a;point(sponge,...geo.at(-(1.2+sag)/2));scaled(sponge,1,geo.height/.6,1);
    legs.forEach((leg,i)=>{show(leg,s.mode>=2);if(leg)leg.rotation.z=-a;const top=s.mode===2?0:-sag-.12;point(leg,...geo.at((top-1.2)/2,i?1:-1));scaled(leg,1,(top+1.2)/.8,1);});
    R.path(spring,R.samples(81,u=>s.mode===0?geo.at(-1.2+u*geo.height,.13*Math.sin(u*16*Math.PI)):geo.at(-sag*Math.sin(Math.PI*u),(u-.5)*2)));
    const atomPosition=(row,col)=>{const q=geo.at(-.13-row*.25-sag*(1-row/2),-1.1+col*.36);return[q[0],q[1],.65];};
    atoms.forEach(({ mesh, row, col }) => {
      show(mesh, s.mode === 3);
      point(mesh, ...atomPosition(row, col));
    });
    bonds.forEach(({ wire, row, col }) => {
      show(wire, s.mode === 3);
      R.path(wire, [atomPosition(row, col), atomPosition(row + 1, col)]);
    });
    primary(ctx, c, s.mode === 3 ? "Magnified material displacement makes support visible" : "Same load, different stiffness; deformation enlarged");
    R.text(ctx, c.ink, `normal ${fmt(p.normal)} N`, 30, 66, 17);
    R.text(ctx, c.proton, `weight ${fmt(p.weight)} N`, 30, 101, 17);
    R.text(ctx, c.electron, `compression ${fmt(p.compression * 1e3, 4)} mm`, 30, 138, 16);
    R.text(ctx, c.ink, `stiffness ${k.toExponential(1)} N/m`, 30, 173, 15);
    R.text(ctx, c.ink, `downhill ${fmt(p.along)} N, balanced by static friction`, 30, 211, 14);
    const project=q=>[500+55*q[0],125-55*q[1]],poly=(normal0,normal1,halfWidth,col)=>{const corners=[[normal0,-halfWidth],[normal0,halfWidth],[normal1,halfWidth],[normal1,-halfWidth],[normal0,-halfWidth]].map(([n,t])=>project(geo.at(n,t)));R.line(ctx,col,corners,2);};
    poly(-sag,-sag+.4,.3,c.proton);
    if(s.mode===0)R.line(ctx,c.electron,R.samples(61,u=>project(geo.at(-1.2+u*geo.height,.12*Math.sin(u*12*Math.PI)))),2);
    else if(s.mode===1)poly(-1.2,-sag,.45,c.neutron);
    else if(s.mode===2)R.line(ctx,c.electron,R.samples(61,u=>project(geo.at(-sag*Math.sin(Math.PI*u),(u-.5)*2))),3);
    else{poly(-sag-.6,-sag,1,c.ink);for(let row=0;row<3;row++)for(let col=0;col<5;col++)R.dot(ctx,c.electron,...project(geo.at(-.13-row*.2-sag*(1-row/3),-.8+col*.4)),2);}
    const A=project(geo.load);R.arrow(ctx,c.electron,...A,n[0]*p.normal*.2,-n[1]*p.normal*.2);R.arrow(ctx,c.proton,...A,0,p.weight*.2);R.arrow(ctx,c.neutron,...A,-t[0]*p.along*.2,t[1]*p.along*.2);
    R.text(ctx,c.muted,'Same contact, side view',390,52,12);

    lab.say(`The support provides ${fmt(p.normal)} N perpendicular to itself. At stiffness ${k.toExponential(1)} N/m it deforms ${p.compression.toExponential(2)} m. ${s.mode === 3 ? "The exposed lattice sites move slightly relative to neighbours; their displacement is greatly magnified. These dots and connectors are a material schematic, not literal atomic springs." : "The spring, sponge and ruler make the same restoring-response principle visible."} On a slope, the pale uphill arrow is static friction. Display displacement ${fmt(sag)} scene units is an enlarged schematic; the physical compression is printed in millimetres. The load stays in contact as the support deforms.`);
  });
}
function pairs(lab, api, c) {
  const s = {}, root = R.scene(lab), one = R.ball(root, c.electron, 0.35, -1.5, 0), two = R.ball(root, c.proton, 0.65, 1.5, 0), a = R.vector(root, c.electron), b = R.vector(root, c.proton), person = R.block(root, c.neutron, 0.35, 0.7, 0.3, 0, 0.3), floor = R.block(root, c.ink, 2, 0.08, 0.8, 0, -0.1), earth = R.ball(root, c.electron, 0.7, 0, -1.4), standing = Array.from({ length: 4 }, (_, i) => R.vector(root, i % 2 ? c.electron : c.proton)), update = () => lab.refresh();
  const ratio = R.slider(api, s, "ratio", "Second mass / first mass", 1, 100, 1, 10, "", update), force = R.slider(api, s, "force", "Interaction force", 1, 20, 1, 10, "N", update);
  R.tabs(api, s, ["Both objects", "Only object A", "Only object B", "Standing person and floor"], update);
  lab.redraw((ctx) => {
    const p = M.forcePair(1, s.ratio, s.force), st = s.mode === 3;
    show(one, !st);
    show(two, !st);
    show(person, st);
    show(floor, st);
    show(earth, st);
    ratio.input.disabled = st;
    force.input.disabled = st;
    a.set([-1.5, 0.7, 0], [-1.5 + s.force / 12, 0.7, 0]);
    b.set([1.5, 0.7, 0], [1.5 - s.force / 12, 0.7, 0]);
    show(a.group, !st && s.mode !== 2);
    show(b.group, !st && s.mode !== 1);
    const w = 9.8;
    standing[0].set([-0.2, 0.35, 0.3], [-0.2, -0.3, 0.3]);
    standing[1].set([0.2, 0.1, 0.3], [0.2, 0.75, 0.3]);
    standing[2].set([-0.5, -1.3, 0.3], [-0.5, -0.65, 0.3]);
    standing[3].set([0.65, -0.1, 0.3], [0.65, -0.75, 0.3]);
    standing.forEach((v) => show(v.group, st));
    primary(ctx, c, st ? "Four forces, two pairs; two forces on the person balance" : "Equal force pair; separate objects and accelerations");
    if (st) {
      R.text(ctx, c.ink, "On person: Earth \u2193 9.8 N and floor \u2191 9.8 N", 25, 67, 15);
      R.text(ctx, c.proton, "Gravity pair: Earth \u2192 person; person \u2192 Earth", 25, 106, 15);
      R.text(ctx, c.electron, "Contact pair: floor \u2192 person; person \u2192 floor", 25, 145, 15);
      R.text(ctx, c.ink, "The balanced forces on the person belong to different pairs.", 25, 189, 14);
      R.text(ctx, c.ink, "Illustrative 1 kg person; arrow lengths share a force scale.", 25, 225, 14);
      lab.say("On the illustrative 1 kg person, Earth\u2019s 9.8 N downward pull balances the floor\u2019s 9.8 N upward push. They are not an interaction pair because both act on the person. The gravity partner acts upward on Earth; the contact partner acts downward on the floor. Four forces, two pairs.");
    } else {
      R.text(ctx, c.electron, "A: 1 kg", 50, 65, 16);
      R.text(ctx, c.proton, `B: ${s.ratio} kg`, 370, 65, 16);
      if (s.mode !== 2) R.arrow(ctx, c.electron, 60, 104, s.force * 6, 0, `${fmt(p.f1, 0)} N`);
      if (s.mode !== 1) R.arrow(ctx, c.proton, 560, 104, -s.force * 6, 0, `${fmt(p.f2, 0)} N`);
      R.text(ctx, c.electron, `a = ${fmt(p.a1)} m/s\xB2`, 50, 180, 16);
      R.text(ctx, c.proton, `a = ${fmt(p.a2, 3)} m/s\xB2`, 370, 180, 16);
      R.text(ctx, c.ink, "An interaction pair acts on two different objects.", 25, 224, 15);
      lab.say(`A feels +${fmt(s.force, 0)} N and B feels \u2212${fmt(s.force, 0)} N. Their accelerations are ${fmt(p.a1)} and ${fmt(p.a2, 3)} m/s\xB2. The pair does not cancel in either object\u2019s individual account.`);
    }
  });
}
function rocket(lab, api, c) {
  const s = {}, root = R.scene(lab), person = R.block(root, c.electron, 0.4, 0.7, 0.35), spanner = R.block(root, c.proton, 0.4, 0.06, 0.1), parcels = Array.from({ length: 6 }, () => R.ball(root, c.neutron, 0.08));
  R.ring(root, c.neutron, 0.1, "z", 0, -0.55, 0);
  lab.kit?.label?.("astronaut / craft",person,{color:c.electron});
  lab.kit?.label?.("thrown spanner",spanner,{color:c.proton});
  const update = () => lab.refresh();
  R.clock(api, s, update, 6, 0.5);
  R.slider(api, s, "mass", "Thrown mass", 0.5, 10, 0.5, 1, "kg", update);
  R.tabs(api, s, ["Astronaut and spanner", "Six exhaust parcels"], update);
  lab.redraw((ctx) => {
    let vr, pr, pg, centre;
    const t = s.time, k = 0.05;
    R.frame(lab,root,{min:[-2.35,-.7,-.4],max:[.6,.55,.4]});
    if (!s.mode) {
      const p = M.recoil(70, s.mass, 7.1);
      vr = p.v1;
      pr = 70 * vr;
      pg = s.mass * p.v2;
      centre = (70 * p.v1 * t + s.mass * p.v2 * t) / (70 + s.mass);
      point(person, vr * t * k, 0);
      point(spanner, p.v2 * t * k, 0.2);
      parcels.forEach((p2) => show(p2, false));
      show(spanner, true);
    } else {
      show(spanner, false);
      const q = M.rocketSequence(s.mass, t);
      vr = q.v;
      pr = q.craftMomentum;
      pg = q.exhaustMomentum;
      centre = q.centre;
      point(person, q.x * k, 0);
      q.parcels.forEach((p, i) => {
        show(parcels[i], true);
        point(parcels[i], p.position * k, 0);
      });
      for (let i = q.parcels.length; i < 6; i++) show(parcels[i], false);
    }
    primary(ctx, c, s.mode ? "Each parcel keeps its exit velocity" : "A two-body push in empty space");
    R.text(ctx, c.electron, `forward momentum ${fmt(pr)} kg\xB7m/s`, 25, 67, 16);
    R.text(ctx, c.proton, `backward momentum ${fmt(pg)} kg\xB7m/s`, 25, 103, 16);
    R.text(ctx, c.ink, `total ${fmt(pr + pg, 8)} kg\xB7m/s`, 25, 141, 17);
    R.text(ctx, c.ink, `centre of mass x = ${fmt(centre, 8)} m`, 25, 177, 15);
    R.text(ctx, c.ink, `forward speed ${fmt(vr, 3)} m/s`, 25, 215, 15);
    lab.say(`Total momentum ${fmt(pr + pg, 8)} kg\xB7m/s; centre of mass ${fmt(centre, 8)} m, marked by the stationary ring. Forward speed ${fmt(vr, 3)} m/s. ${s.mode ? "The craft accelerates only at its discrete ejections." : "The heavy astronaut moves much less than the spanner."} All displayed positions share one common scale; body sizes are enlarged.`);
  });
}
const RENDERERS = { horizon, shadowshapes, measurement, scale, rain, shadows, frames, trains, graph, acceleration, galileo, toss, inertia, arrowflight, braking, friction, tablecloth, vectors, newton, support, pairs, rocket, projectile: (...a) => frames(...a, "projectile"), ...Space, ...Fluids, ...Energy };
const TWO_D = /* @__PURE__ */ new Set([]);
const TEMPORAL = new Set(["frames", "trains", "graph", "acceleration", "galileo", "toss", "inertia", "arrowflight", "braking", "friction", "newton", "rocket", "fall", "projectile", "circle", "weightless", "torsion", "perturbation", "mission", "work", "station", "engine"]);
Live.register("mechanicslab", (stage, params, api) => {
  const lesson = lessons.find((l) => l.id === params.lesson) || lessons[0];
  const lab = makeLab(stage, api, { ...lesson, three: !TWO_D.has(lesson.renderer) }), c = api.colors();
  const render = RENDERERS[lesson.renderer];
  if (!render) throw new Error(`Mechanics lesson renderer missing: ${lesson.renderer}`);
  api.playback?.(TEMPORAL.has(lesson.renderer));
  render(lab, api, c);
  return { destroy() {
  } };
}, { label: "Explore the mechanism", three: true });

export { RENDERERS };
