// 10.5 Cut-away 3D eye: cornea + accommodating lens (50 D far to 54 D at 25 cm), retina at 2.00 cm, glasses, and half-pupil cover.
import {
  Group, Mesh, SphereGeometry, CylinderGeometry, TorusGeometry, BufferGeometry, Line, LineBasicMaterial,
  MeshStandardMaterial, Color, DoubleSide, Vector3,
} from 'three';
import { Live } from './core.js';
import { label, note } from './art_waves.js';
import { makeStage, addArrow, webglOK } from './three_kit.js';

Live.register('eye3d', (stage, params, api) => {
  const c = api.colors();
  const say = api.readout();

  // State
  let sliderVal = 25; // 0 = 25 cm, 100 = far away (100 m); start at 25 so moving slider to max tests far away
  let eyeType = 0;    // 0 = Ideal eye, 1 = Short-sighted, 2 = Long-sighted
  let optMode = 0;    // 0 = Bare eye, 1 = Glasses on, 2 = Half pupil covered

  function distMetres(v) {
    // Logarithmic from 0.25 m (v=0) to 100 m (v=100)
    return 0.25 * Math.pow(400, v / 100);
  }

  function computeOptics() {
    const doM = distMetres(sliderVal);
    const vergenceIn = sliderVal >= 98 ? 0 : 1 / doM; // dioptres (1/m)
    // Eye's own power range (cornea ~34 D fixed + lens 16..20 D accommodation)
    let pMin = 50.0, pMax = 54.0, glassD = 0;
    if (eyeType === 1) {
      // Short-sighted: eyeball/cornea effectively +5.55 D too strong for retina at 2.00 cm (far focus at 1.80 cm = 2 mm in front)
      pMin = 55.55;
      pMax = 59.55;
      glassD = -5.55;
    } else if (eyeType === 2) {
      // Long-sighted: weak power (47.5 D to 51.5 D), cannot reach 54 D for a 25 cm object without +2.5 D glasses
      pMin = 47.5;
      pMax = 51.5;
      glassD = 2.5;
    }
    const pGlass = optMode === 1 ? glassD : 0;
    // Target eye power to focus at d_i = 0.0200 m (50.0 D image vergence)
    const neededEyeP = 50.0 + vergenceIn - pGlass;
    const pEye = Math.max(pMin, Math.min(pMax, neededEyeP));
    const pCornea = pMin * 0.68;
    const pLens = pEye - pCornea;
    const accomFrac = Math.max(0, Math.min(1, (pEye - pMin) / 4.0));

    // Thin-lens equation: 1/d_i = P_eye + P_glass - 1/d_o
    const invDi = pEye + pGlass - vergenceIn;
    const diCm = 100 / invDi; // cm (retina is at 2.00 cm)
    const errMm = (2.0 - diCm) * 10; // positive = in front of retina, negative = behind retina
    return { doM, pEye, pCornea, pLens, pGlass, accomFrac, diCm, errMm };
  }

  const diagram=api.canvas(640,190,'Stable eye cross-section: object, effective lens, retina, and the focus error, independent of the 3D viewpoint');
  note(stage,'The fixed cross-section keeps the optical story visible while you turn the 3D eye. It combines cornea and lens into one effective thin lens; distances and image height are framed for clarity.');
  function drawDiagram(){
    const ctx=diagram.ctx,o=computeOptics(),ax=93,lens=285,retina=500,fx=lens+(o.diCm/2)*215,fy=ax+(ax-49)*(fx-lens)/(lens-70);
    diagram.clear(c.plate);ctx.strokeStyle=c.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(30,ax);ctx.lineTo(607,ax);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle=c.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(391,ax,116,62,0,-Math.PI*.75,Math.PI*.75);ctx.stroke();
    ctx.fillStyle='rgba(53,109,131,.18)';ctx.beginPath();ctx.ellipse(lens,ax,9+o.accomFrac*6,42,0,0,2*Math.PI);ctx.fill();ctx.stroke();
    ctx.strokeStyle=c.proton;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(retina,44);ctx.lineTo(retina,144);ctx.stroke();
    api.draw.arrow(ctx,70,ax,70,49,c.ink,2,7);
    for(const ly of optMode===2?[67]:[67,93,119]){
      ctx.strokeStyle=c.neutron;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(70,49);ctx.lineTo(lens,ly);ctx.lineTo(fx,fy);ctx.stroke();
      api.draw.arrow(ctx,125,49+(ly-49)*55/(lens-70),195,49+(ly-49)*125/(lens-70),c.neutron,1.5,5);
    }
    ctx.fillStyle=c.electron;ctx.beginPath();ctx.arc(fx,fy,4,0,2*Math.PI);ctx.fill();
    if(optMode===1){ctx.strokeStyle=c.electron;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(235,ax,6,35,0,0,2*Math.PI);ctx.stroke();label(ctx,c,'glasses',235,153,{align:'center',size:12});}
    label(ctx,c,'object',70,27,{align:'center',weight:600});label(ctx,c,'effective lens',285,27,{align:'center',weight:600});label(ctx,c,'retina',500,27,{align:'center',weight:600,color:c.proton});
    label(ctx,c,Math.abs(o.errMm)<.15?'focus on retina':`focus ${Math.abs(o.errMm).toFixed(1)} mm ${o.errMm>0?'in front':'behind'}`,405,176,{align:'center',weight:600,color:c.electron});
  }
  function updateReadout() {
    drawDiagram();
    const o = computeOptics();
    const distLbl = sliderVal >= 98 ? 'far away' : o.doM < 1 ? `${Math.round(o.doM * 100)} cm` : `${o.doM.toFixed(1)} m`;
    const sharp = Math.abs(o.errMm) < 0.15;
    let msg = '';
    if (eyeType === 0) {
      if (sliderVal >= 98) {
        msg = `Object far away: cornea and lens together ${o.pEye.toFixed(0)} dioptres, image sharp on the retina (2.00 cm behind the lens), upside down.`;
      } else {
        const pct = Math.round(((o.pEye - 50) / 50) * 100);
        msg = `Object at ${distLbl}: lens fattened to give ${o.pEye.toFixed(1)} dioptres (${pct}% more than far vision). Image sharp on the retina, upside down.`;
      }
    } else if (eyeType === 1) {
      if (optMode === 1) {
        msg = `Short-sighted with diverging glasses (${o.pGlass.toFixed(1)} D): the glasses spread the light before it enters, so the eye's own ${o.pEye.toFixed(1)} D brings it sharply onto the retina.`;
      } else if (sharp) {
        msg = `Short-sighted at ${distLbl}: near objects focus sharply on the retina without glasses (${o.pEye.toFixed(1)} D).`;
      } else {
        msg = `Short-sighted, object ${distLbl}: light meets ${Math.abs(o.errMm).toFixed(1)} mm in front of the retina, so the image is blurred. A diverging lens puts it back.`;
      }
    } else {
      if (optMode === 1) {
        msg = `Long-sighted with converging glasses (+${o.pGlass.toFixed(1)} D): the glasses add the extra bending so the eye's ${o.pEye.toFixed(1)} D focuses sharply on the retina.`;
      } else if (sharp) {
        msg = `Long-sighted, object ${distLbl}: the lens accommodates to ${o.pEye.toFixed(1)} D and reaches a sharp focus on the retina.`;
      } else {
        msg = `Long-sighted, object ${distLbl}: even at full accommodation (${o.pEye.toFixed(1)} D) light would meet ${Math.abs(o.errMm).toFixed(1)} mm behind the retina, blurred. A converging lens fixes it.`;
      }
    }
    if (optMode === 2) {
      msg += ' Half pupil covered: the whole upside-down image stays there, at half the brightness.';
    }
    msg += ' (Exaggerated for visibility: the eye is drawn about 10 cm across, bends are shown at single surfaces, and the object arrow is scaled to fit.)';
    say(msg);
  }

  // Control 1: Object distance slider (logarithmic from 25 cm to far away)
  api.slider('Object distance', {
    min: 0, max: 100, step: 1, value: sliderVal,
    fmt: (v) => {
      if (v >= 98) return 'Far away';
      const d = distMetres(v);
      return d < 1 ? `${Math.round(d * 100)} cm` : `${d.toFixed(1)} m`;
    },
    onInput: (v) => {
      sliderVal = v;
      rebuild();
    },
  });

  // Control 2: Tabs for eye condition
  api.tabs(['Ideal eye', 'Short-sighted', 'Long-sighted'], (i) => {
    eyeType = i;
    rebuild();
  });

  // Control 3: Tabs for Glasses / Half-pupil cover
  api.tabs(['Bare eye', 'Glasses on', 'Cover half pupil'], (i) => {
    optMode = i;
    rebuild();
  });

  // The labelled 2D cross-section remains a complete explanation without WebGL.
  if(!webglOK()){
    var rebuild=()=>{drawDiagram();updateReadout();};
    api.loop(()=>drawDiagram());rebuild();return {destroy(){}};
  }

  const kit = makeStage(stage, api, {
    height: 340,
    distance: 7.4,
    label: 'Cut-away 3D eyeball showing cornea, iris, crystalline lens, retina, and light rays from an arrow object',
  });
  stage.append(diagram.cv);
  api.loop(drawDiagram);
  kit.spinSpeed = 0; // Keep cut-away facing the reader unless dragged
  kit.root.rotation.y = -0.18;
  kit.root.rotation.x = 0.08;

  const dynGroup = new Group();
  kit.root.add(dynGroup);

  // Static cut-away eye shell centred at x = +1.05, radius R = 1.15 (so cornea at x = -0.1, lens at x = +0.1, retina at x = +2.2)
  const eyeCenter = new Vector3(1.05, 0, 0);
  const eyeR = 1.15;
  const scleraMat = new MeshStandardMaterial({
    color: new Color(c.sheet),
    roughness: 0.65,
    side: DoubleSide,
    transparent: true,
    opacity: 0.88,
  });
  const sclera = new Mesh(new SphereGeometry(eyeR, 32, 24, 0, Math.PI * 1.15, 0.25, Math.PI - 0.5), scleraMat);
  sclera.position.copy(eyeCenter);
  sclera.rotation.y = -Math.PI * 0.08;
  kit.root.add(sclera);

  // Retina inner lining at back of eye (x around +2.2)
  const retinaMat = new MeshStandardMaterial({
    color: new Color(c.proton),
    roughness: 0.6,
    side: DoubleSide,
  });
  const retina = new Mesh(new SphereGeometry(eyeR * 0.97, 28, 20, -Math.PI * 0.35, Math.PI * 0.7, Math.PI * 0.25, Math.PI * 0.5), retinaMat);
  retina.position.copy(eyeCenter);
  kit.root.add(retina);

  // Cornea dome at front (x = -0.12)
  const corneaMat = new MeshStandardMaterial({
    color: new Color(c.electron),
    roughness: 0.2,
    transparent: true,
    opacity: 0.32,
    side: DoubleSide,
  });
  const cornea = new Mesh(new SphereGeometry(0.58, 24, 18, Math.PI * 0.65, Math.PI * 0.7, Math.PI * 0.2, Math.PI * 0.6), corneaMat);
  cornea.position.set(0.18, 0, 0);
  kit.root.add(cornea);

  // Iris ring at x = 0.02
  const irisMat = new MeshStandardMaterial({ color: new Color(c.green), roughness: 0.5 });
  const iris = new Mesh(new TorusGeometry(0.42, 0.09, 14, 28), irisMat);
  iris.rotation.y = Math.PI / 2;
  iris.position.set(0.02, 0, 0);
  kit.root.add(iris);

  function rebuild() {
    while (dynGroup.children.length) {
      const ch = dynGroup.children.pop();
      ch.traverse?.((m) => m.geometry?.dispose?.());
    }
    const o = computeOptics();

    // Crystalline lens at x = 0.20, fattening with accommodation (accomFrac 0..1)
    const lensMat = new MeshStandardMaterial({
      color: new Color(c.electron),
      roughness: 0.25,
      transparent: true,
      opacity: 0.62,
    });
    const lens = new Mesh(new SphereGeometry(0.44, 24, 18), lensMat);
    const thickness = 0.32 + 0.26 * o.accomFrac;
    lens.scale.set(thickness, 1.0, 1.0);
    lens.position.set(0.20, 0, 0);
    dynGroup.add(lens);

    // Optional correcting glasses lens in front at x = -0.55
    if (optMode === 1 && eyeType !== 0) {
      const glassMat = new MeshStandardMaterial({
        color: new Color(c.electron),
        roughness: 0.2,
        transparent: true,
        opacity: 0.45,
      });
      const gLens = new Mesh(new CylinderGeometry(0.55, 0.55, eyeType === 1 ? 0.08 : 0.16, 24), glassMat);
      gLens.rotation.z = Math.PI / 2;
      gLens.position.set(-0.55, 0, 0);
      dynGroup.add(gLens);
    }

    // Optional half-pupil cover at x = 0.0
    if (optMode === 2) {
      const coverMat = new MeshStandardMaterial({ color: new Color(c.ink), roughness: 0.7, side: DoubleSide });
      const cover = new Mesh(new CylinderGeometry(0.42, 0.42, 0.04, 20, 1, false, 0, Math.PI), coverMat);
      cover.rotation.z = Math.PI / 2;
      cover.rotation.x = Math.PI / 2;
      cover.position.set(0.0, 0.2, 0);
      dynGroup.add(cover);
    }

    // Object arrow in front of the eye: moves from x = -1.55 (25 cm) to x = -2.65 (far away)
    const objX = -1.55 - (sliderVal / 100) * 1.10;
    const objH = 0.52;
    addArrow(dynGroup, [objX, -objH, 0], [objX, objH, 0], c.proton, 0.045);

    // Where the rays meet along x: lens is at x = 0.20, retina is at x = 2.20 (representing 2.00 cm)
    // Scale: 1.00 cm in eye = 1.00 scene unit, so 2.00 cm = 2.00 units -> retinaX = 2.20
    const retinaX = 2.20;
    const focusX = 0.20 + Math.max(1.2, Math.min(2.65, o.diCm));

    // Rays from object tip (objX, +objH) and base (objX, -objH) through cornea/lens to focusX, then to retinaX
    const rayMat = new LineBasicMaterial({ color: new Color(c.neutron) });
    const pupilOffsets = optMode === 2 ? [-0.26, -0.06] : [0.26, 0.0, -0.26];

    for (const srcSign of [1, -1]) {
      const srcY = srcSign * objH;
      const imgYAtFocus = -srcSign * 0.34;
      for (const py of pupilOffsets) {
        const pts = [];
        pts.push(new Vector3(objX, srcY, 0));
        if (optMode === 1 && eyeType !== 0) {
          const gy = py * 0.92 + srcY * 0.15;
          pts.push(new Vector3(-0.55, gy, 0));
        }
        // Cornea bend at x = -0.10, lens bend at x = 0.20
        pts.push(new Vector3(-0.10, py * 1.06, 0));
        pts.push(new Vector3(0.20, py, 0));
        // Straight line from (0.20, py) through (focusX, imgYAtFocus) to x = retinaX
        const slope = (imgYAtFocus - py) / (focusX - 0.20);
        const yAtRetina = py + slope * (retinaX - 0.20);
        if (focusX < retinaX) {
          pts.push(new Vector3(focusX, imgYAtFocus, 0));
        }
        pts.push(new Vector3(retinaX, yAtRetina, 0));
        const geo = new BufferGeometry().setFromPoints(pts);
        dynGroup.add(new Line(geo, rayMat));
      }
    }

    // Upside-down image arrow on the retina (sharp when focusX ≈ retinaX, dimmed when half-pupil covered)
    const imgColor = optMode === 2 ? c.muted : c.proton;
    const blurSpread = Math.abs(focusX - retinaX);
    addArrow(dynGroup, [retinaX - 0.03, 0.34, 0], [retinaX - 0.03, -0.34, 0], imgColor, blurSpread > 0.06 ? 0.075 : 0.04);

    updateReadout();
    kit.dirty = true;
    kit.render();
  }

  rebuild();
  return { destroy() {} };
}, { label: 'Focus the eye in 3D', three: true });
