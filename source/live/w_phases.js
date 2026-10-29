// 14.3 Moon phases in 3D: half the Moon is always lit; synchronous rotation; view from above vs from Mumbai; true-distance scale with Earth's shadow cone.
import {
  Group, Mesh, SphereGeometry, ConeGeometry, MeshBasicMaterial, MeshStandardMaterial,
  Color, Vector3,
} from 'three';
import { Live } from './core.js';
import { label, note, phaseDisc } from './art_waves.js';
import { makeStage, addArrow, addAtom, clearGroup, webglOK } from './three_kit.js';

function phaseNameForDay(day) {
  const f = ((day % 29.5) + 29.5) % 29.5;
  if (f < 1.0 || f > 28.5) return 'New Moon';
  if (f < 6.4) return 'waxing crescent';
  if (f < 8.4) return 'First Quarter';
  if (f < 13.8) return 'waxing gibbous';
  if (f < 15.8) return 'Full Moon';
  if (f < 21.1) return 'waning gibbous';
  if (f < 23.1) return 'Third Quarter';
  return 'waning crescent';
}

Live.register('phases', (stage, params, api) => {
  const c = api.colors();
  const say = api.readout();

  let day = 3.0;         // 0 to 29.5, default 3.0 (waxing crescent, ~10% lit)
  let viewMode = 0;      // 0 = From above the orbit, 1 = From Mumbai
  let trueScale = false; // false = drawn close (not to scale), true = true distance (~30 Earth diameters)

  function computePhase() {
    const theta = (day / 29.5) * Math.PI * 2; // 0 = New Moon (towards Sun at +x), pi = Full Moon (-x)
    const litFrac = (1 - Math.cos(theta)) / 2;
    const pct = Math.round(litFrac * 100);
    const delayMin = Math.round(49 * day);
    const hrs = Math.floor(delayMin / 60);
    const mins = delayMin % 60;
    const delayStr = hrs === 0 ? `${mins} min` : mins === 0 ? `${hrs} h` : `${hrs} h ${mins} min`;
    return { theta, litFrac, pct, delayStr, name: phaseNameForDay(day) };
  }

  const diagram=api.canvas(640,186,'Linked overhead lunar orbit and the phase seen from Earth, with the same selected day');
  note(stage,'Left: the Sun always lights half the Moon. Right: look from Earth at that same Moon. The Moon’s own night side makes the phase; orbit tilt and eclipse dates are not modelled.');
  function drawDiagram(){
    const ctx=diagram.ctx,p=computePhase();diagram.clear(c.plate);
    label(ctx,c,'1  From above',24,25,{weight:600});label(ctx,c,'2  Seen from Earth',392,25,{weight:600});
    const cx=175,cy=101,R=60;ctx.strokeStyle=c.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(cx,cy,R,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=c.electron;ctx.beginPath();ctx.arc(cx,cy,15,0,2*Math.PI);ctx.fill();label(ctx,c,'Earth',cx,cy+33,{align:'center',size:12});
    const mx=cx+R*Math.cos(p.theta),my=cy-R*Math.sin(p.theta);
    phaseDisc(ctx,mx,my,10,Math.PI/2); // In the overhead view the right hemisphere always faces sunlight.
    api.draw.arrow(ctx,337,75,267,75,c.neutron,1.8,7);api.draw.arrow(ctx,337,118,267,118,c.neutron,1.8,7);label(ctx,c,'sunlight',303,55,{align:'center',size:12});
    phaseDisc(ctx,478,101,47,p.theta);label(ctx,c,`${p.name}: ${p.pct}% lit`,478,172,{align:'center',weight:600});
  }
  function updateReadout() {
    drawDiagram();
    const p = computePhase();
    const scaleNote = trueScale
      ? 'drawn at the true distance of about 30 Earth-diameters, with the Earth’s narrow shadow cone shown'
      : 'orbit drawn close, not to scale';
    say(
      `Day ${day.toFixed(1)}: ${p.name}, about ${p.pct}% lit. ` +
      `The lit half always faces the Sun; from the Earth we see ${p.pct}% of it, and the dark part is the Moon's own night side (never the Earth's shadow). ` +
      `In a simplified rise-time model, rises about ${p.delayStr} after the Sun (not a Mumbai ephemeris); the Moon turns once per orbit so the same face always looks at the Earth (${scaleNote}).`
    );
  }

  // Control 1: Day of the month slider (0 to 29.5, default 3)
  const daySlider = api.slider('Day of the month', {
    min: 0, max: 29.5, step: 0.5, value: day,
    fmt: (v) => `Day ${v.toFixed(1)}`,
    onInput: (v) => {
      day = v;
      rebuild();
    },
  });

  // Control 2: View tabs ("From above the orbit" / "From Mumbai")
  api.tabs(['From above the orbit', 'From Mumbai'], (i) => {
    viewMode = i;
    rebuild();
  });

  // Control 3: Scale toggle ("Drawn close" / "True distance")
  const scaleBtn = api.button('Scale: drawn close', () => {
    trueScale = !trueScale;
    scaleBtn.textContent = trueScale ? 'Scale: true distance (30× Earth)' : 'Scale: drawn close';
    scaleBtn.setAttribute('aria-pressed', String(trueScale));
    rebuild();
  }, { pressed: false });

  if(!webglOK()){
    var rebuild=()=>{drawDiagram();updateReadout();};api.loop(drawDiagram);rebuild();return {destroy(){}};
  }

  const kit = makeStage(stage, api, {
    height: 350,
    distance: 7.6,
    label: '3D view of the Moon orbiting the Earth in parallel sunlight, showing its lit half and the phase seen from Mumbai',
  });
  stage.append(diagram.cv);
  api.loop(drawDiagram);
  kit.spinSpeed = 0; // Advance orbit on Play instead of spinning the camera root

  // Advance day of month gently while playing
  kit.onFrame = (dt) => {
    if (dt > 0) {
      day = (day + dt * 1.4) % 29.5;
      daySlider.set(+day.toFixed(1));
      rebuild();
    }
  };

  const dynGroup = new Group();
  kit.root.add(dynGroup);
  let sceneKey = '', activeMoon = null, nearMarker = null, activeOrbitR = 0, activeMoonR = 0;

  function moveMoon(p) {
    if (!activeMoon) return;
    if (viewMode === 1) activeMoon.rotation.y = Math.PI / 2 - p.theta;
    else {
      const x = activeOrbitR * Math.cos(p.theta), z = -activeOrbitR * Math.sin(p.theta);
      activeMoon.position.set(x, 0, z);
      if (nearMarker) {
        const inward = new Vector3(-x, 0, -z).normalize();
        nearMarker.position.set(x + inward.x * activeMoonR * 1.08, 0, z + inward.z * activeMoonR * 1.08);
      }
    }
  }

  // Build a sphere whose +x hemisphere (facing the Sun at +x) is bright and whose -x hemisphere is dark night,
  // independent of scene ambient lighting so the 50/50 day-night terminator is always crystal clear!
  function makeDayNightSphere(radius, dayHex, nightHex) {
    const g = new Group();
    const dayGeo = new SphereGeometry(radius, 32, 24, -Math.PI / 2, Math.PI);
    const nightGeo = new SphereGeometry(radius, 32, 24, Math.PI / 2, Math.PI);
    const dayMat = new MeshBasicMaterial({ color: new Color(dayHex) });
    const nightMat = new MeshBasicMaterial({ color: new Color(nightHex) });
    g.add(new Mesh(dayGeo, dayMat), new Mesh(nightGeo, nightMat));
    return g;
  }

  function rebuild() {
    const key = `${viewMode}:${trueScale}`;
    const p = computePhase();
    if (sceneKey === key) {
      moveMoon(p); updateReadout(); kit.dirty = true; kit.render(); return;
    }
    sceneKey = key; activeMoon = nearMarker = null;
    clearGroup(dynGroup);

    if (viewMode === 1) {
      // View "From Mumbai": show the Moon large at the origin, rotated by p.theta so the camera at +z sees
      // the exact lit fraction (1 - cos theta)/2 with the waxing lit sliver on the right (west for a northern observer)!
      kit.root.quaternion.identity();
      const moonR = 1.45;
      const moon = makeDayNightSphere(moonR, '#f5efe0', '#232b28');
      activeMoon = moon;
      // At theta = 0 (New Moon), the dark half faces camera (+z) -> rotate +90 deg around y; then rotate by -theta
      moon.rotation.y = Math.PI / 2 - p.theta;
      dynGroup.add(moon);

      // Subtle near-side maria spots that stay fixed facing the Earth (synchronous rotation!)
      const mareMat = new MeshBasicMaterial({ color: new Color('#8c887b'), transparent: true, opacity: 0.45 });
      for (const [mx, my, mz, mr] of [[-0.35, 0.32, 1.36, 0.24], [0.22, 0.18, 1.41, 0.20], [-0.15, -0.25, 1.42, 0.18]]) {
        const spot = new Mesh(new SphereGeometry(mr, 16, 12), mareMat);
        spot.scale.set(1, 1, 0.2);
        spot.position.set(mx, my, mz);
        dynGroup.add(spot);
      }
    } else {
      // View "From above the orbit": look down on the orbital plane (x-z plane) with slight tilt
      kit.root.quaternion.identity();
      kit.root.rotation.x = 1.18;

      const earthR = trueScale ? 2.65 / 60 : 0.62;
      const orbitR = trueScale ? 2.65 : 2.15; // In trueScale, orbitR / (2 * earthR) = 30 Earth diameters to the Moon.
      const moonR = trueScale ? earthR * .2727 : 0.34;
      activeOrbitR = orbitR; activeMoonR = moonR;

      // Earth at origin (lit side facing Sun at +x)
      const earth = makeDayNightSphere(earthR, '#3b7a94', '#16262e');
      dynGroup.add(earth);

      // In true-distance mode, draw Earth's narrow umbra shadow cone extending towards -x
      if (trueScale) {
        const shadowMat = new MeshBasicMaterial({
          color: new Color(c.ink),
          transparent: true,
          opacity: 0.22,
        });
        const coneLen = 2.8;
        const shadow = new Mesh(new ConeGeometry(earthR, coneLen, 20), shadowMat);
        shadow.rotation.z = Math.PI / 2;
        shadow.position.set(-coneLen / 2, 0, 0);
        dynGroup.add(shadow);
      }

      // Moon at orbital angle theta (counterclockwise in x-z plane from +x New Moon)
      const mx = orbitR * Math.cos(p.theta);
      const mz = -orbitR * Math.sin(p.theta);
      const moon = makeDayNightSphere(moonR, '#f5efe0', '#232b28');
      activeMoon = moon;
      moon.position.set(mx, 0, mz);
      dynGroup.add(moon);

      // Synchronous rotation marker: a small red dot on the Moon's surface that ALWAYS faces the Earth at (0,0,0)
      if (!trueScale) {
        const dirToEarth = new Vector3(-mx, 0, -mz).normalize();
        const nearDotPos = new Vector3(mx, 0, mz).addScaledVector(dirToEarth, moonR * 1.08);
        nearMarker = addAtom(dynGroup, 'X', [nearDotPos.x, nearDotPos.y, nearDotPos.z], {
          r: 0.075, label: false, color: c.proton,
        });
      }

      // Parallel sunlight arrows arriving from the right (+x)
      for (const zOff of [-1.4, 0, 1.4]) {
        addArrow(dynGroup, [3.25, 0, zOff], [2.55, 0, zOff], c.neutron, 0.035);
      }
    }

    updateReadout();
    kit.dirty = true;
    kit.render();
  }

  rebuild();
  return { destroy() {} };
}, { label: 'Orbit the Moon in 3D', three: true });
