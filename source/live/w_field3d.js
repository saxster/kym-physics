// 13.3 3D magnetic field lines around a straight wire (with compass in Mumbai's 38.4 uT field) and a 10-turn coil vs bar magnet.
import {
  Group, Mesh, CylinderGeometry, TorusGeometry, ConeGeometry, BoxGeometry,
  MeshStandardMaterial, Color, CatmullRomCurve3, TubeGeometry, Vector3, Quaternion,
} from 'three';
import { Live } from './core.js';
import { makeStage, addArrow, addAtom, webglOK } from './three_kit.js';

Live.register('field3d', (stage, params, api) => {
  const c = api.colors();
  const say = api.readout();

  let currentA = 1.0; // 0 to 3.0 A, default 1.0 A
  let reversed = false;
  let tab = 0;        // 0 = Wire, 1 = Coil and magnet

  const H_MUMBAI = 38.4; // uT horizontal Earth field at Mumbai

  function bWireAtCm(rCm) {
    // B = mu0 * I / (2 * pi * r) = 20.0 * I / r_cm (in uT)
    return (20.0 * currentA) / rCm;
  }

  function compassAngleDeg() {
    const b1 = bWireAtCm(1);
    return (Math.atan2(b1, H_MUMBAI) * 180) / Math.PI;
  }

  function updateReadout() {
    const signWord = reversed ? 'reversed' : 'forward';
    if (tab === 0) {
      const b1 = bWireAtCm(1).toFixed(1);
      const b2 = bWireAtCm(2).toFixed(1);
      const b3 = bWireAtCm(3).toFixed(1);
      const b4 = bWireAtCm(4).toFixed(1);
      const b6 = bWireAtCm(6).toFixed(1);
      const ang = compassAngleDeg();
      const ew = currentA === 0 ? 'pointing straight north' : `${ang.toFixed(1)}° ${reversed ? 'west' : 'east'} of north`;
      say(
        `${currentA.toFixed(1)} A (${signWord}): the wire's field is ${b1} μT at 1 cm, ${b2} μT at 2 cm, ${b3} μT at 3 cm, ${b4} μT at 4 cm and ${b6} μT at 6 cm ` +
        `(ring brightness and thickness fall as 1/r, half as much for twice the distance). ` +
        `Against Mumbai's 38.4 μT horizontal field, a compass 1 cm from the wire swings ${ew}. ` +
        `Field lines are a drawing of the direction a compass would point; the real field fills all the space between them.`
      );
    } else {
      say(
        `A 10-turn coil carrying ${currentA.toFixed(1)} A (${signWord}) has a bar magnet's field: one end north, one end south, with closed loops running through the middle and returning outside. ` +
        `The coil's and the bar magnet's field lines are drawn with the same dipole rule; the real field fills all the space between them.`
      );
    }
  }

  // Control 1: Current slider (0 to 3 A, step 0.1 A, default 1.0 A)
  api.slider('Current', {
    min: 0, max: 3.0, step: 0.1, value: currentA,
    fmt: (v) => `${v.toFixed(1)} A`,
    onInput: (v) => {
      currentA = v;
      rebuild();
    },
  });

  // Control 2: Reverse current button
  const revBtn = api.button('Reverse current', () => {
    reversed = !reversed;
    revBtn.setAttribute('aria-pressed', String(reversed));
    rebuild();
  }, { pressed: false });

  // Control 3: Tabs Wire / Coil and magnet
  api.tabs(['Wire', 'Coil and magnet'], (i) => {
    tab = i;
    rebuild();
  });

  if (!webglOK()) {
    const k2 = api.canvas(640, 300, 'Magnetic field circles around a wire and dipole loops around a coil and bar magnet');
    function drawFallback() {
      const ctx = k2.ctx;
      k2.clear(c.plate);
      const radii = [1, 2, 3, 4, 6];
      for (const r of radii) {
        ctx.beginPath();
        ctx.arc(320, 150, r * 20, 0, Math.PI * 2);
        ctx.strokeStyle = c.electron;
        ctx.globalAlpha = Math.min(1, (currentA / 1.5) * (1 / r));
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      updateReadout();
    }
    var rebuild = drawFallback;
    api.loop(() => drawFallback());
    drawFallback();
    return { destroy() {} };
  }

  const kit = makeStage(stage, api, {
    height: 360,
    distance: 7.5,
    label: '3D magnetic field lines around a current-carrying wire with a compass, and around a 10-turn coil beside a bar magnet',
  });
  kit.spinSpeed = 0.18;
  kit.root.rotation.x = 0.42;
  kit.root.rotation.y = -0.35;

  const dynGroup = new Group();
  kit.root.add(dynGroup);

  function buildDipoleLoops(parent, centerX, scaleStrength, flipSign) {
    if (scaleStrength <= 0.02) return;
    const col = new Color(c.electron);
    // 4 azimuth angles around the y-axis, closed loops passing through core (x = centerX) and arching outside
    const shells = [0.65, 1.15];
    const azAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    for (const rShell of shells) {
      const opacity = Math.min(0.92, (0.55 / rShell) * Math.min(1.3, scaleStrength));
      const mat = new MeshStandardMaterial({ color: col, roughness: 0.4, transparent: true, opacity });
      for (const phi of azAngles) {
        const pts = [];
        const N = 28;
        for (let i = 0; i <= N; i++) {
          const t = (i / N) * Math.PI * 2;
          // Closed loop in (rho, y) plane rotated by phi: passes straight through core at rho = 0.15 * rShell and arches out to rho = rShell
          const rho = rShell * (0.58 - 0.44 * Math.cos(t));
          const y = 1.25 * Math.sin(t) * (0.65 + 0.35 * (rShell / 1.15));
          pts.push(new Vector3(centerX + rho * Math.cos(phi), flipSign ? -y : y, rho * Math.sin(phi)));
        }
        const curve = new CatmullRomCurve3(pts, true);
        const tube = new Mesh(new TubeGeometry(curve, 40, 0.024, 8, true), mat);
        parent.add(tube);

        // Arrowhead on outer return limb (t = pi, where rho is largest and field goes from North (+y) to South (-y))
        const pMid = curve.getPointAt(0.5);
        const tan = curve.getTangentAt(0.5).normalize();
        const cone = new Mesh(new ConeGeometry(0.065, 0.18, 12), mat);
        cone.position.copy(pMid);
        cone.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), tan);
        parent.add(cone);
      }
    }
  }

  function rebuild() {
    while (dynGroup.children.length) {
      const ch = dynGroup.children.pop();
      ch.traverse?.((m) => m.geometry?.dispose?.());
    }

    const dirSign = reversed ? -1 : 1;

    if (tab === 0) {
      // Straight vertical wire along y-axis (-2.1 to +2.1)
      const wireMat = new MeshStandardMaterial({ color: new Color('#b87333'), roughness: 0.45 });
      const wire = new Mesh(new CylinderGeometry(0.08, 0.08, 4.2, 20), wireMat);
      dynGroup.add(wire);

      // Current arrow in ink alongside the wire
      if (currentA > 0) {
        const y0 = -1.2 * dirSign, y1 = 1.2 * dirSign;
        addArrow(dynGroup, [-0.24, y0, 0], [-0.24, y1, 0], c.ink, 0.045);
      }

      // 5 circular field lines at radii r = 1, 2, 3, 4, 6 cm (1 cm = 0.38 scene units)
      const radiiCm = [1, 2, 3, 4, 6];
      const scaleCm = 0.38;
      if (currentA > 0) {
        for (const rCm of radiiCm) {
          const rad = rCm * scaleCm;
          // Brightness (opacity) and tube radius fall as 1/r!
          const strengthRatio = (1 / rCm) * Math.min(1, 0.4 + currentA * 0.3);
          const tubeR = Math.max(0.014, 0.036 / Math.sqrt(rCm));
          const ringMat = new MeshStandardMaterial({
            color: new Color(c.electron),
            roughness: 0.4,
            transparent: true,
            opacity: Math.max(0.22, Math.min(0.95, strengthRatio * 1.1)),
          });
          const torus = new Mesh(new TorusGeometry(rad, tubeR, 14, 48), ringMat);
          torus.rotation.x = Math.PI / 2;
          dynGroup.add(torus);

          // Two arrowheads on each circle showing right-hand rule direction
          // Seen from above (+y), current upward (+y) gives anticlockwise field
          for (const a0 of [0, Math.PI]) {
            const px = rad * Math.cos(a0);
            const pz = rad * Math.sin(a0);
            // Tangent for anticlockwise in (x, z) when looking from +y: (-sin a, 0, -cos a) * dirSign
            const tx = Math.sin(a0) * dirSign;
            const tz = -Math.cos(a0) * dirSign;
            const cone = new Mesh(new ConeGeometry(tubeR * 2.8, 0.22, 12), ringMat);
            cone.position.set(px, 0, pz);
            cone.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(tx, 0, tz).normalize());
            dynGroup.add(cone);
          }
        }
      }

      // Compass disc placed at r = 1 cm (0.38 units) from wire axis, at y = -1.35
      const compGroup = new Group();
      compGroup.position.set(0.55, -1.35, 0);
      const discMat = new MeshStandardMaterial({ color: new Color(c.sheet), roughness: 0.6 });
      const rimMat = new MeshStandardMaterial({ color: new Color(c.ink), roughness: 0.5 });
      compGroup.add(new Mesh(new CylinderGeometry(0.52, 0.52, 0.06, 28), discMat));
      const rim = new Mesh(new TorusGeometry(0.52, 0.025, 10, 28), rimMat);
      rim.rotation.x = Math.PI / 2;
      compGroup.add(rim);

      // Needle points north (-z) when I=0, and swings by atan(B_wire(1 cm) / 38.4 uT) east/west
      const swingRad = Math.atan2(bWireAtCm(1) * dirSign, H_MUMBAI);
      const needleGroup = new Group();
      needleGroup.position.y = 0.05;
      needleGroup.rotation.y = -swingRad;
      addArrow(needleGroup, [0, 0, 0.36], [0, 0, -0.42], c.proton, 0.038);
      compGroup.add(needleGroup);
      dynGroup.add(compGroup);
    } else {
      // Tab 1: 10-turn coil at x = -1.45 and bar magnet at x = +1.45, both with dipole field lines
      const coilX = -1.45, magX = 1.45;
      const coilMat = new MeshStandardMaterial({ color: new Color('#b87333'), roughness: 0.4 });
      for (let i = 0; i < 10; i++) {
        const y = -0.65 + (i / 9) * 1.3;
        const turn = new Mesh(new TorusGeometry(0.36, 0.028, 10, 28), coilMat);
        turn.rotation.x = Math.PI / 2;
        turn.position.set(coilX, y, 0);
        dynGroup.add(turn);
      }
      buildDipoleLoops(dynGroup, coilX, currentA / 1.5, reversed);

      // Bar magnet at x = +1.45 (North top in red, South bottom in blue)
      const nMat = new MeshStandardMaterial({ color: new Color(c.proton), roughness: 0.5 });
      const sMat = new MeshStandardMaterial({ color: new Color(c.electron), roughness: 0.5 });
      const nHalf = new Mesh(new BoxGeometry(0.48, 0.72, 0.36), nMat);
      nHalf.position.set(magX, 0.36, 0);
      const sHalf = new Mesh(new BoxGeometry(0.48, 0.72, 0.36), sMat);
      sHalf.position.set(magX, -0.36, 0);
      dynGroup.add(nHalf, sHalf);
      addAtom(dynGroup, 'N', [magX, 0.88, 0], { r: 0.25, color: c.proton });
      addAtom(dynGroup, 'S', [magX, -0.88, 0], { r: 0.25, color: c.electron });
      buildDipoleLoops(dynGroup, magX, 1.0, false);
    }

    updateReadout();
    kit.dirty = true;
    kit.render();
  }

  rebuild();
  return { destroy() {} };
}, { label: 'Turn the magnetic field in 3D', three: true });
