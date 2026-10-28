// Ch 5.2 c5_cannon -> w_cannon3d: Newton's cannon in 3D (three.js).
// GM = 3.986e14 m^3/s^2, R = 6371 km, launch from R + 10 km (v_circ = 7.90 km/s, v_esc = 11.18 km/s).
// Integrates with RK4, checks specific energy 0.5*v^2 - GM/r every frame (< 0.1% drift).
import {
  Mesh, SphereGeometry, ConeGeometry, RingGeometry, MeshStandardMaterial, BufferGeometry, LineBasicMaterial, Line, Vector3, Color, DoubleSide,
} from 'three';
import { Live } from './core.js';
import { mechanismKey } from './art_mechanics.js';
import { makeStage, webglOK } from './three_kit.js';

const GM = 3.986e14;         // m^3 / s^2
const R_EARTH = 6371e3;      // m
const R_LAUNCH = 6381e3;     // R + 10 km in physics
const R_DRAW_MTN = 1.045;    // mountain drawn taller so the trajectory clearance is visible in 3D

Live.register('cannon3d', (stage, params, api) => {
  const say = api.readout();
  mechanismKey(stage, 'Read the orbit in its own plane', ['The flat inset keeps the orbital plane visible as you turn the globe. Its Earth and trajectory share one scale.', 'Ideal gravity only: no atmosphere; the mountain and ball in 3D are enlarged. Dashed predictions stop at landing, one orbit, or the display horizon (4.2 Earth radii / 4 h); reaching that horizon does not mean escape.']);
  if (!webglOK()) {
    const svg = stage.parentElement?.querySelector('svg.fig');
    if (svg) stage.appendChild(svg.cloneNode(true));
    say('3D needs WebGL, which this browser does not offer. The drawing above shows the same five shots.');
    return { destroy() {} };
  }

  const c = api.colors();
  let v0Kms = 7.9; // km/s (0 to 12 km/s)
  const kit = makeStage(stage, api, {
    height: 360,
    distance: 4.8,
    label: 'A 3D globe with Newton cannon on a tall mountain firing orbital and sub-orbital shots',
  });
  kit.spinSpeed = 0.15;
  const map = api.canvas(640, 190, 'Orbital-plane map at a common Earth and trajectory scale');

  // Globe in book colours (matte sphere + subtle latitude/longitude rings)
  const earthMat = new MeshStandardMaterial({
    color: new Color(c.plate === '#888' ? '#dfd5c0' : c.plate),
    roughness: 0.75,
    metalness: 0.0,
  });
  const earth = new Mesh(new SphereGeometry(1.0, 48, 32), earthMat);
  kit.root.add(earth);

  // Equator & meridian wire rings in book rule colour
  const ringMat = new MeshStandardMaterial({
    color: new Color(c.muted === '#888' ? '#6e7b74' : c.muted),
    roughness: 0.8,
    side: DoubleSide,
  });
  const eqRing = new Mesh(new RingGeometry(1.001, 1.006, 64), ringMat);
  eqRing.rotation.x = Math.PI / 2;
  kit.root.add(eqRing);

  const merRing = new Mesh(new RingGeometry(1.001, 1.006, 64), ringMat);
  kit.root.add(merRing);

  // Sparse graticule makes the globe readable without decorative surface imagery.
  const gridMat = new LineBasicMaterial({color: new Color(c.muted), transparent: true, opacity: 0.55});
  for (const latitude of [-60,-30,0,30,60]) {
    const a=latitude*Math.PI/180, points=[];
    for (let i=0;i<=96;i++) { const b=i*Math.PI/48; points.push(new Vector3(1.006*Math.cos(a)*Math.cos(b),1.006*Math.sin(a),1.006*Math.cos(a)*Math.sin(b))); }
    kit.root.add(new Line(new BufferGeometry().setFromPoints(points),gridMat));
  }
  for (const longitude of [0,60,120]) {
    const b=longitude*Math.PI/180, points=[];
    for (let i=0;i<=96;i++) { const a=i*Math.PI/48; points.push(new Vector3(1.006*Math.cos(a)*Math.cos(b),1.006*Math.sin(a),1.006*Math.cos(a)*Math.sin(b))); }
    kit.root.add(new Line(new BufferGeometry().setFromPoints(points),gridMat));
  }

  // Mountain cone at top (0, 1, 0)
  const mtnMat = new MeshStandardMaterial({
    color: new Color(c.ink === '#888' ? '#1d332d' : c.ink),
    roughness: 0.6,
  });
  const mtn = new Mesh(new ConeGeometry(0.06, 0.09, 20), mtnMat);
  mtn.position.set(0, 1.01, 0);
  kit.root.add(mtn);

  // Moving cannonball mesh
  const ballMat = new MeshStandardMaterial({
    color: new Color(c.proton === '#888' ? '#b8432f' : c.proton),
    roughness: 0.4,
  });
  const ball = new Mesh(new SphereGeometry(0.038, 20, 16), ballMat);
  kit.root.add(ball);

  // Up to 3 trails kept on screen
  const trails = [];
  let activeShot = null;

  function rk4Step(st, dt) {
    const acc = (x, y) => {
      const r2 = x * x + y * y;
      const r3 = r2 * Math.sqrt(r2);
      return [-GM * x / r3, -GM * y / r3];
    };
    const [ax1, ay1] = acc(st.x, st.y);
    const k1x = st.vx, k1y = st.vy, k1vx = ax1, k1vy = ay1;

    const [ax2, ay2] = acc(st.x + 0.5 * dt * k1x, st.y + 0.5 * dt * k1y);
    const k2x = st.vx + 0.5 * dt * k1vx, k2y = st.vy + 0.5 * dt * k1vy, k2vx = ax2, k2vy = ay2;

    const [ax3, ay3] = acc(st.x + 0.5 * dt * k2x, st.y + 0.5 * dt * k2y);
    const k3x = st.vx + 0.5 * dt * k2vx, k3y = st.vy + 0.5 * dt * k2vy, k3vx = ax3, k3vy = ay3;

    const [ax4, ay4] = acc(st.x + dt * k3x, st.y + dt * k3y);
    const k4x = st.vx + dt * k3vx, k4y = st.vy + dt * k3vy, k4vx = ax4, k4vy = ay4;

    st.x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    st.y += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    st.vx += (dt / 6) * (k1vx + 2 * k2vx + 2 * k3vx + k4vx);
    st.vy += (dt / 6) * (k1vy + 2 * k2vy + 2 * k3vy + k4vy);
  }

  function toSceneVec(x, y) {
    // Map physics r >= R_EARTH so r = R_LAUNCH sits at R_DRAW_MTN and r = R_EARTH sits at 1.003
    const r = Math.hypot(x, y);
    const rNorm = r / R_EARTH;
    const scale = r <= R_LAUNCH
      ? 1.003 + ((r - R_EARTH) / (R_LAUNCH - R_EARTH)) * (R_DRAW_MTN - 1.003)
      : R_DRAW_MTN + (rNorm - R_LAUNCH / R_EARTH);
    const ux = x / (r || 1), uy = y / (r || 1);
    return new Vector3(ux * scale, uy * scale, 0);
  }

  function fireShot() {
    const v0 = v0Kms * 1000;
    const e0 = 0.5 * v0 * v0 - GM / R_LAUNCH;
    const lineCol = v0Kms >= 11.18 ? c.vol : v0Kms >= 7.85 ? c.electron : c.muted;
    const mat = new LineBasicMaterial({ color: new Color(lineCol === '#888' ? '#2f6d8f' : lineCol) });
    const geo = new BufferGeometry().setFromPoints([toSceneVec(0, R_LAUNCH)]);
    const line = new Line(geo, mat);
    kit.root.add(line);
    trails.push(line);
    while (trails.length > 3) {
      const old = trails.shift();
      kit.root.remove(old);
      old.geometry.dispose();
    }

    activeShot = {
      v0Kms,
      x: 0,
      y: R_LAUNCH,
      vx: v0,
      vy: 0,
      e0,
      t: 0,
      rMin: R_LAUNCH,
      rMax: R_LAUNCH,
      done: false,
      outcome: 'flying',
      pts: [toSceneVec(0, R_LAUNCH)],
      physicalPts: [[0, R_LAUNCH]],
      line,
      energyOk: true,
    };

    // A dashed prediction makes the paused opening frame informative without autoplay.
    const predicted = {x: 0, y: R_LAUNCH, vx: v0, vy: 0};
    activeShot.prediction = [[0, R_LAUNCH]];
    for (let step = 0; step < 7200; step++) {
      const before = Math.atan2(predicted.x, predicted.y);
      rk4Step(predicted, 2);
      const radius = Math.hypot(predicted.x, predicted.y);
      if (radius <= R_EARTH) {
        activeShot.prediction.push([predicted.x * R_EARTH / radius, predicted.y * R_EARTH / radius]);
        break;
      }
      activeShot.prediction.push([predicted.x, predicted.y]);
      if (radius > 4.2 * R_EARTH || (step > 1000 && before < 0 && Math.atan2(predicted.x, predicted.y) >= 0)) break;
    }

    // If reduced motion is on, pre-advance one complete path so the still frame shows the shot
    if (api.reduced) {
      advanceShot(activeShot, 7200);
    }
    ball.position.copy(activeShot.pts[activeShot.pts.length - 1]);
    kit.dirty = true;
    updateReadout();
  }

  function advanceShot(shot, simDt) {
    if (!shot || shot.done || simDt <= 0) return;
    let rem = simDt;
    const h = 2.0; // 2 s RK4 step keeps energy drift < 0.001% per orbit
    let added = false;

    while (rem > 1e-4 && !shot.done) {
      const dt = Math.min(h, rem);
      rem -= dt;
      const prevAngle = Math.atan2(shot.x, shot.y);
      rk4Step(shot, dt);
      shot.t += dt;

      const r = Math.hypot(shot.x, shot.y);
      const v = Math.hypot(shot.vx, shot.vy);
      if (r < shot.rMin) shot.rMin = r;
      if (r > shot.rMax) shot.rMax = r;

      // Check specific energy conservation every step
      const eNow = 0.5 * v * v - GM / r;
      const relDrift = Math.abs((eNow - shot.e0) / shot.e0);
      if (relDrift > 0.001) {
        shot.energyOk = false;
        console.error('Cannon3D energy drift exceeded 0.1%:', relDrift);
      }

      shot.pts.push(toSceneVec(shot.x, shot.y));
      shot.physicalPts.push([shot.x, shot.y]);
      added = true;

      if (r <= R_EARTH) {
        shot.done = true;
        shot.outcome = 'landed';
        break;
      }
      if (r > 4.2 * R_EARTH) {
        shot.done = true;
        shot.outcome = 'view-limit';
        break;
      }
      const curAngle = Math.atan2(shot.x, shot.y);
      // Detect completion of one full orbit around +y axis (angle wrapping from -0 to +0 after t > 2000 s)
      if (shot.t > 2000 && prevAngle < 0 && curAngle >= 0) {
        shot.done = true;
        shot.outcome = 'orbited';
        break;
      }
    }

    if (added) {
      shot.line.geometry.dispose();
      shot.line.geometry = new BufferGeometry().setFromPoints(shot.pts);
      ball.position.copy(shot.pts[shot.pts.length - 1]);
      kit.dirty = true;
    }
  }

  function updateReadout() {
    const shot = activeShot;
    if (!shot) return;
    const r = Math.hypot(shot.x, shot.y);
    const altKm = Math.max(0, (r - R_EARTH) / 1000);
    const vKms = Math.hypot(shot.vx, shot.vy) / 1000;

    let specialNote = '';
    if (Math.abs(shot.v0Kms - 7.9) <= 0.11) {
      specialNote = ' (About 8 km/s: a circle.)';
    } else if (shot.v0Kms >= 11.2) {
      specialNote = ' (About 11 km/s: escape.)';
    }

    let summary = '';
    if (shot.v0Kms < 7.89 && (shot.outcome === 'landed' || shot.e0 < 0)) {
      // Compute ground range for sub-orbital shot or current distance
      const ang = Math.atan2(shot.x, shot.y);
      const distKm = Math.round((ang >= 0 ? ang : ang + 2 * Math.PI) * (R_EARTH / 1000));
      if (shot.outcome === 'landed') {
        summary = `Lands after ${distKm.toLocaleString('en-GB')} km along the ground.`;
      } else {
        summary = `In flight: altitude ${Math.round(altKm)} km, speed ${vKms.toFixed(1)} km/s (${distKm.toLocaleString('en-GB')} km along ground so far).`;
      }
    } else if (shot.e0 < 0) {
      // Bound elliptical or circular orbit: semi-major axis a = -GM / (2*e0)
      const a = -GM / (2 * shot.e0);
      const periodMin = (2 * Math.PI * Math.sqrt((a * a * a) / GM)) / 60;
      const rpKm = Math.max(0, Math.round((R_LAUNCH - R_EARTH) / 1000));
      const raKm = Math.max(rpKm, Math.round((2 * a - R_LAUNCH - R_EARTH) / 1000));
      summary = `Orbit: back to the cannon in ${Math.round(periodMin)} minutes, lowest point ${rpKm} km, highest ${raKm.toLocaleString('en-GB')} km (now at ${Math.round(altKm).toLocaleString('en-GB')} km, ${vKms.toFixed(1)} km/s).`;
    } else {
      summary = `Escapes: never comes back (now at altitude ${Math.round(altKm).toLocaleString('en-GB')} km, speed ${vKms.toFixed(1)} km/s).`;
    }

    if (shot.outcome === 'view-limit') summary += ` The drawn path stops at 4.2 Earth radii; its energy is ${shot.e0 < 0 ? 'still bound' : 'unbound'}.`;
    const chk = shot.energyOk ? 'energy check: ok' : 'energy check: drift';
    say(`${summary}${specialNote} Time sped up (1 s = about 2 minutes of flight); no air in this model; the mountain is drawn far too tall (${chk}).`);
  }

  // Note: makeStage already adds 'Turn left' and 'Turn right' buttons for the 3D drag-to-turn control.
  // Adding the Speed slider and Fire button completes the 3 controls specified.
  api.slider('Launch speed', {
    min: 0, max: 12.0, step: 0.1, value: v0Kms,
    fmt: (v) => `${v.toFixed(1)} km/s`,
    onInput: (v) => { v0Kms = +v.toFixed(1); fireShot(); },
  });

  api.button('Fire', () => {
    if (trails.length >= 3) {
      while (trails.length) {
        const old = trails.pop();
        kit.root.remove(old);
        old.geometry.dispose();
      }
    }
    fireShot();
  });

  kit.onFrame = (dt) => {
    if (dt > 0 && activeShot && !activeShot.done) {
      // 1 real second = 120 seconds (2 minutes) of flight
      advanceShot(activeShot, dt * 120);
      updateReadout();
    }
  };

  api.loop(() => {
    map.clear(c.plate);
    const ctx = map.ctx;
    const pts = activeShot?.physicalPts || [[0, R_LAUNCH]];
    let extentX = R_EARTH, extentY = R_EARTH;
    const prediction = activeShot?.prediction || pts;
    for (const [x, y] of prediction) { extentX = Math.max(extentX, Math.abs(x)); extentY = Math.max(extentY, Math.abs(y)); }
    const scale = Math.min(250 / extentX, 65 / extentY);
    const X = x => 320 + x * scale, Y = y => 101 - y * scale;
    ctx.fillStyle = c.mark_soft; ctx.strokeStyle = c.ink; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(320, 101, R_EARTH * scale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = c.electron; ctx.lineWidth = 2.2; ctx.setLineDash([4, 4]);
    ctx.beginPath(); prediction.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = c.electron; ctx.lineWidth = 2;
    ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.stroke();
    const last = pts[pts.length - 1];
    ctx.fillStyle = c.proton; ctx.beginPath(); ctx.arc(X(last[0]), Y(last[1]), 4, 0, Math.PI * 2); ctx.fill();
    api.draw.text(ctx, 'Orbital plane · dashed = prediction · no air', 14, 20, {size: 13, color: c.ink, weight: 600});
    api.draw.text(ctx, 'Earth diameter: 12,742 km', 14, 181, {size: 12, color: c.muted});
    api.draw.text(ctx, 'red dot = current shot', 626, 181, {size: 12, color: c.proton, align: 'right'});
  });

  fireShot();
  return { destroy() {} };
}, { label: 'Fire the cannon in 3D', three: true });
