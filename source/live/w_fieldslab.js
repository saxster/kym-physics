// Calculated teaching scenes; model contracts and sources: grounding/visual_fields.md.
import { Live } from "./core.js";
import { makeLab } from "./lab_kit.js";
import { Group, Mesh, BoxGeometry, SphereGeometry, TorusGeometry, CylinderGeometry, ConeGeometry, BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, MeshStandardMaterial, MeshBasicMaterial, ArrowHelper, Vector3, DoubleSide } from "three";
import LESSONS from "../lessons/fields.json";
import * as P from "./fields_models.mjs";
Live.register("fieldslab", (stage, params, api) => {
  const d = LESSONS.find((x) => x.id === params.lesson) || LESSONS.find((x) => x.id === "motor");
  const lab = makeLab(stage, api, d), c = api.colors(), root = lab.kit?.root, cv = lab.canvas, ctx = cv.ctx;
  let fixedViewRadius=null;
  let tick = 0, update = () => {
  }, draw = () => {
  }, advance = () => {
  }, lastReport = "";
  let lastTeaching = "", motionAllowed;
  const teach = explanation => {
    if (explanation !== lastTeaching) { lastTeaching = explanation; lab.teach?.({ explanation }); }
  };
  const playback = enabled => {
    if (enabled !== motionAllowed) { motionAllowed = enabled; api.playback?.(enabled); }
  };
  const label3 = (text2, position, color = c.ink) => lab.kit?.label?.(text2, position, { color });
  const report = (s) => {
    if (s !== lastReport) {
      lab.say(s);
      lastReport = s;
    }
  };
  const refresh = () => {
    update();
    lab.refresh();
    if(fixedViewRadius===null)lab.fit?.();
  };
  const scalar = (label, min, max, value, change, step = 1, unit = "") => api.slider(label, { min, max, value, step, fmt: (v) => `${Number(v.toFixed(3))}${unit}`, onInput: (v) => {
    change(v);
    refresh();
  } });
  const tabs = (labels, change, start=0) => api.tabs(labels, (i) => {
    change(i);
    refresh();
  },start);
  const button = (label, change) => api.button(label, () => {
    change();
    refresh();
  });
  const owned = [];
  const material = (color, opacity = 1) => {
    const m = new MeshStandardMaterial({ color, roughness: 0.8, transparent: opacity < 1, opacity, side: DoubleSide });
    owned.push(m);
    return m;
  };
  const mesh = (g, col, parent = root, opacity = 1) => {
    if (!parent) {
      g.dispose();
      return null;
    }
    owned.push(g);
    const m = new Mesh(g, material(col, opacity));
    parent.add(m);
    return m;
  };
  const ball = (x, y, z, r, col, parent = root, opacity = 1) => {
    const o = mesh(new SphereGeometry(r, 20, 14), col, parent, opacity);
    o?.position.set(x, y, z);
    return o;
  };
  const box = (x, y, z, w, h, depth, col, parent = root, opacity = 1) => {
    const o = mesh(new BoxGeometry(w, h, depth), col, parent, opacity);
    o?.position.set(x, y, z);
    return o;
  };
  const group = () => {
    const o = new Group();
    root?.add(o);
    return o;
  };
  const arrow = (a, b, col, parent = root) => {
    if (!parent) return null;
    const dir = new Vector3(...b).sub(new Vector3(...a)), len = dir.length();
    const o = new ArrowHelper(dir.normalize(), new Vector3(...a), Math.max(1e-3, len), col, 0.14, 0.08);
    parent.add(o);
    o.line.geometry.userData.shared = true;
    o.cone.geometry.userData.shared = true;
    owned.push(o.line.material, o.cone.material);
    return o;
  };
  const moveArrow = (o, a, b) => {
    if (!o) return;
    const q = new Vector3(...b).sub(new Vector3(...a)), n = q.length();
    o.visible = n > 1e-5;
    if (n) {
      o.position.set(...a);
      o.setDirection(q.normalize());
      o.setLength(n, Math.min(0.14, n * 0.3), Math.min(0.08, n * 0.2));
    }
  };
  const line = (points, col, parent = root) => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(new Float32Array(points.length * 3), 3));
    const m = new LineBasicMaterial({ color: col });
    owned.push(g, m);
    const o = new Line(g, m);
    parent?.add(o);
    const set = (ps) => {
      const a = g.attributes.position;
      ps.forEach((p, i) => a.setXYZ(i, ...p));
      a.needsUpdate = true;
      g.computeBoundingSphere();
    };
    set(points);
    return { object: o, set };
  };
  const circle = (r, col, parent = root) => line(Array.from({ length: 97 }, (_, i) => [r * Math.cos(i / 96 * 2 * Math.PI), 0, r * Math.sin(i / 96 * 2 * Math.PI)]), col, parent);
  const text = (s, x, y, col = c.ink, size = 14, align = "left") => {
    ctx.fillStyle = col;
    ctx.font = `${size >= 16 ? 600 : 400} ${size}px Lexend,system-ui`;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
  };
  const stroke = (pts, col = c.ink, width = 2) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = width;
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
    ctx.stroke();
  };
  const axes = (xl = "selected quantity", yl = "response", scale = null) => {
    stroke([[55, 35], [55, 195], [605, 195]], c.rule, 1);
    text(xl, 605, 237, c.muted, 12, "right");
    text(yl, 55, 22, c.muted, 12);
    if (!scale) return;
    const fmt = v => Number(v.toFixed(3)).toLocaleString('en-GB');
    for (const v of scale.xticks || [scale.x[0], (scale.x[0]+scale.x[1])/2, scale.x[1]]) {
      const x = 55 + (v-scale.x[0])/(scale.x[1]-scale.x[0])*550;
      stroke([[x,195],[x,200]],c.rule,1); text(fmt(v),x,216,c.ink,13,'center');
    }
    for (const v of scale.yticks || [scale.y[0], (scale.y[0]+scale.y[1])/2, scale.y[1]]) {
      const y = 195 - (v-scale.y[0])/(scale.y[1]-scale.y[0])*145;
      stroke([[50,y],[55,y]],c.rule,1);
      text((v>0&&scale.y[0]<0?'+':'')+fmt(v),45,y+4,c.ink,13,'right');
    }
    const reference = scale.reference ?? (scale.y[0]<0&&scale.y[1]>0?0:null);
    if (reference !== null) {
      const y=195-(reference-scale.y[0])/(scale.y[1]-scale.y[0])*145;
      stroke([[55,y],[605,y]],c.muted,1);
    }
  };
  const curve = (fn, col = c.electron) => stroke(Array.from({ length: 151 }, (_, i) => [55 + i / 150 * 550, 195 - fn(i / 150) * 145]), col);
  const bar = (label, value, max, x, y, color = c.electron, width = 240) => {
    ctx.fillStyle = c.rule;
    ctx.fillRect(x, y, width, 14);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width * P.clamp(value / Math.max(max, 1e-20), 0, 1), 14);
    text(label, x, y - 7);
  };
  const sphereDay = (radius, parent = root) => {
    const g = group();
    if (parent !== root) {
      root?.remove(g);
      parent?.add(g);
    }
    mesh(new SphereGeometry(radius, 24, 18, Math.PI / 2, Math.PI), c.electron, g);
    mesh(new SphereGeometry(radius, 24, 18, -Math.PI / 2, Math.PI), c.ink, g);
    return g;
  };
  const alignDay = (g, sun) => g?.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), new Vector3(...sun).normalize());
  const plotDot = (x, y, col = c.proton, r = 4) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  if (root) {
    root.rotation.set(0.18, -0.3, 0);
    lab.kit.spinSpeed = 0;
  }
  function charge() {
    label3("source", [-1.45, 1, 0]);
    label3("second material", () => [1.35+(dist-1)*.6, 1, 0]);
    let q = 3, dist = 1, mode = 0;
    const left = group(), right = group(), charges = [], pairs = [];
    const leftBox = box(-1.45, 0, 0, 1, 1.5, 0.45, c.rule);
    const rightBox = box(1.35, 0, 0, 1, 1.5, 0.45, c.rule);
    for (let j = 0; j < 8; j++) {
      charges.push(ball(-1.7 + j % 2 * 0.5, -0.55 + Math.floor(j / 2) * 0.35, 0.3, 0.07, c.proton));
      charges.push(ball(-1.55 + j % 2 * 0.5, -0.55 + Math.floor(j / 2) * 0.35, 0.3, 0.07, c.electron));
      pairs.push([ball(1.1 + j % 2 * 0.45, -0.55 + Math.floor(j / 2) * 0.35, 0.3, 0.06, c.proton), ball(1.2 + j % 2 * 0.45, -0.55 + Math.floor(j / 2) * 0.35, 0.3, 0.06, c.electron)]);
    }
    scalar("Electrons transferred", 0, 8, q, (v) => q = v);
    scalar("Separation", 0.5, 3, dist, (v) => dist = v, 0.1, " \xD7 reference");
    tabs(["Transfer charge", "Polarise a conductor", "Polarise bound charges"], (i) => mode = i);
    update = () => {
      const geometry=P.chargeGeometry(q,dist,mode);if(rightBox)rightBox.position.x=geometry.centre;
      charges.forEach((o,j)=>{if(o&&j%2===1)o.position.set(...geometry.sourceElectrons[(j-1)/2]);});
      pairs.forEach((pair,j)=>{pair[0]?.position.set(...geometry.sample[j].positive);pair[1]?.position.set(...geometry.sample[j].electron);});
      report(`${mode ? "Charged source +" + q + "; neutral sample 0; removed electrons \u2212" + q + " shown at far left." : "Transferred " + q + " electrons: left +" + q + ", right \u2212" + q + "."} Total charge remains 0. ${mode === 1 ? "Mobile electrons redistribute while positive nuclei remain fixed." : mode === 2 ? "Bound negative charge shifts slightly relative to fixed positive centres." : "Positive nuclei stay in their material; negative charge is transferred."} Separation ${dist.toFixed(1)}\xD7 reference.`);
    };
    draw = () => {
      bar(`Left charge +${q}`, q, 8, 40, 65, c.proton);
      const geometry=P.chargeGeometry(q,dist,mode);
      bar(`Right net charge ${geometry.sampleNet}`,Math.abs(geometry.sampleNet),8,350,65,c.electron);
      if(mode) text(`Sample +8 and −8; displacement ${mode===1?"mobile surface redistribution":"small bound shift"}`,320,103,c.muted,12,"center");
      text("Total before = total after = 0", 320, 133, c.ink, 18, "center");
      text(mode ? "Neutral \u2260 empty of charge; the internal distribution changes." : "Count transfer, rather than creation, of negative charge.", 320, 179, c.ink, 14, "center");
    };
  }
  function cage() {
    label3("closed conducting shell", [0, 1.3, 0]);
    let mode = 2, probe = 0.3;
    ball(0, 0, 0, 1, c.rule, root, 0.18);
    const pos = Array.from({ length: 35 }, (_, i) => [(i % 7 - 3) * 0.75, (Math.floor(i / 7) - 2) * 0.6, 0.05]);
    const arrows = pos.map((p) => arrow(p, p, c.electron));
    const marker = ball(0.3, 0, 0.1, 0.09, c.proton);
    tabs(["External field", "Induced field", "Sum of fields"], (i) => mode = i,mode);
    scalar("Probe position", -2.3, 2.3, probe, (v) => probe = v, 0.1, " radii");
    update = () => {
      pos.forEach((p, i) => {
        const f2 = P.sphereConductorField(p), v = mode === 0 ? f2.external : mode === 1 ? f2.induced : f2.total;
        moveArrow(arrows[i], p, p.map((x, j) => x + v[j] * 0.3));
      });
      marker?.position.set(probe, 0, 0);
      const f = P.sphereConductorField([probe, 0, 0]);
      report(`At r = ${Math.abs(probe).toFixed(1)} shell radii, total field ${Math.hypot(...f.total).toFixed(2)}\xD7 applied field. ${Math.abs(probe) < 1 ? "Inside the empty closed shell, induced and external fields cancel." : "Outside, the conductor distorts the applied field."}`);
    };
    draw = () => {
      axes("position / shell radius", "total field / applied field",{x:[-2.5,2.5],y:[0,4]});
      curve((u) => Math.min(1, P.length(P.sphereConductorField([-2.5 + 5 * u, 0, 0]).total) / 4));
      ctx.fillStyle = c.mark_soft;
      ctx.fillRect(220, 38, 220, 157);
      text("Empty cavity: E = 0", 330, 105, c.ink, 16, "center");
      text("The transparent shell remains physically closed.", 320, 165, c.muted, 13, "center");
    };
  }
  function circuits() {
    let V=9,r=660,internal=0,mode=0,probe=0,clock=5,driftSeconds=0,latched=false,cause='';
    const geometry=Array.from({length:18},()=>line([[0,0,0],[0,0,0]],c.ink)),loads=[box(0,.45,0,.55,.18,.25,c.muted),box(0,-.45,0,.55,.18,.25,c.muted)];
    const leds=[mesh(new ConeGeometry(.15,.28,3),c.proton),mesh(new ConeGeometry(.15,.28,3),c.proton)];leds.forEach(o=>o?.rotation.set(0,0,-Math.PI/2));
    box(-2,0,0,.4,.8,.4,c.electron);label3("source",[-2,-1,0]);
    const componentLeads=Array.from({length:6},()=>line([[0,0,0],[0,0,0]],c.ink));
    const redProbe=ball(0,0,.18,.09,c.proton),blackProbe=ball(0,0,.18,.09,c.ink),probeLead=line([[0,0,0],[0,0,0]],c.proton),signal=ball(0,0,.1,.1,c.neutron),dots=Array.from({length:16},()=>ball(0,0,.05,.055,c.electron));
    const caseBox=box(.6,0,0,1.1,1.1,.7,c.muted,root,.25),fault=line([[.6,.8,0],[.6,0,0]],c.proton),earth=line([[.6,0,0],[.6,-1.1,0],[-2,-1.1,0],[-2,-.4,0]],c.green),person=line([[.6,0,0],[1.6,-.2,0],[1.6,-1.1,0],[-2,-1.1,0],[-2,-.4,0]],c.proton),switchBlade=line([[-1.6,.8,0],[-1,.8,0]],c.ink);
    label3("red / black voltage probes",()=>d.id==='circuit-probes'&&probe>=3?[0,1.2,0]:[0,-10,0],c.proton);
    label3("current measurement point",()=>d.id==='circuit-probes'&&probe<3?[0,1.2,0]:[0,-10,0],c.proton);
    const trackedElectron=ball(0,0,.1,.085,c.electron);if(trackedElectron)trackedElectron.name='signal-tracked-electron';
    label3("tracked electron",()=>d.id==='circuit-signal'?P.add(P.loopPoint(-(mode?driftSeconds:clock*1e-9)*.0001),[0,.28,.1]):[0,-20,0],c.electron);
    let signalControl,driftControl;
    if(d.id==='circuit-signal'){
      signalControl=scalar("Signal elapsed time",0,20,clock,v=>clock=v,.1," ns");driftControl=scalar("Drift elapsed time",0,10000,driftSeconds,v=>driftSeconds=v,10," s");driftControl.input.disabled=true;
      tabs(["Fast signal clock","Slow drift clock"],i=>{mode=i;signalControl.input.disabled=!!i;driftControl.input.disabled=!i;});
      button("Replay selected clock",()=>{if(mode){driftSeconds=0;driftControl.set(0);}else{clock=0;signalControl.set(0);}api.pause?.();});
    }else if(d.id==='protection'){
      scalar("Prospective leakage",0,60,r=0,v=>{r=v;latched=false;},1," mA");
      tabs(["Earth fault","No earth: isolated case","No earth: virtual touch","Balanced overload"],i=>{mode=i;latched=false;});
      button("Reset virtual switch",()=>latched=false);
    }else{
      scalar("Battery voltage",0,12,V,v=>V=v,.5," V");
      if(d.id==='circuit-probes'){
        scalar("Second resistance",100,1000,r,v=>r=v,10," Ω");tabs(["Parallel","Series"],i=>mode=i);
        const names=['Branch 1 current','Branch 2 current','Battery current','Load 1 voltage','Load 2 voltage'];
        const pc=api.slider('Probe selection',{min:0,max:4,value:probe,step:1,fmt:v=>names[Math.round(v)],onInput:v=>{probe=v;pc.input.setAttribute('aria-valuetext',names[v]);refresh();}});
        pc.input.setAttribute('aria-valuetext',names[probe]);
      }else{scalar("Internal resistance",0,500,internal,v=>internal=v,10," Ω");tabs(["Red LED","White LED","Reversed LED","Open wire"],i=>mode=i);}
    }
    const setEdges=edges=>geometry.forEach((o,j)=>{o.object.visible=j<edges.length;if(j<edges.length)o.set(edges[j]);});
    const circuitState=()=>P.circuit(V,[330,r],2,0,mode===1);
    advance=dt=>{if(dt>0&&d.id==='circuit-signal'){if(mode){driftSeconds=Math.min(10000,driftSeconds+dt*500);driftControl.set(driftSeconds);if(driftSeconds===10000)api.pause?.();}else{clock=Math.min(20,clock+dt*2);signalControl.set(clock);if(clock===20)api.pause?.();}}};
    update=()=>{
      const safety=d.id==='protection',signalMode=d.id==='circuit-signal',probes=d.id==='circuit-probes';
      if(d.id==='circuit-diagnose')teach(mode===2?'Reversing the LED blocks forward conduction in this model: the current dot must sit at zero even when the battery has a voltage. A voltage alone cannot make current flow through a blocked path.':mode===3?'The visible break removes the complete route through the circuit. No sustained current flows, although the disconnected battery still has a voltage.':d.explanation);
      if(caseBox)caseBox.visible=safety;fault.object.visible=safety&&mode!==3;earth.object.visible=safety&&mode===0;person.object.visible=safety&&mode===2;switchBlade.object.visible=safety;
      signal&&(signal.visible=signalMode);trackedElectron&&(trackedElectron.visible=signalMode);if(signalMode)trackedElectron?.position.set(...P.add(P.loopPoint(-(mode?driftSeconds:clock*1e-9)*.0001),[0,0,.1]));redProbe&&(redProbe.visible=probes);blackProbe&&(blackProbe.visible=probes&&probe>=3);probeLead.object.visible=probes&&probe>=3;
      leds.forEach(o=>o&&(o.visible=!safety));loads.forEach((o,j)=>o&&(o.visible=!safety&&(probes||j===0)));
      componentLeads.forEach((o,j)=>{const active=!safety&&(probes||j<3);o.object.visible=active;if(active){const load=j<3?0:1,y=probes?P.circuitTopology(mode===1).loads[load].center[1]:signalMode?.8:.6,segment=P.loadLeads({a:[-.8,y,0],b:[.8,y,0],center:[0,y,0]})[j%3];o.set(segment);}});
      if(safety){
        const q=P.protectionState(r,mode===0,mode===2,mode===3,latched);if(q.trip&&!latched){cause=q.breaker?'20 A exceeds 16 A breaker limit':`${q.leakmA} mA imbalance exceeds 30 mA`;latched=true;}
        setEdges([[[-2,.4,0],[-2,.8,0]],[[-2,.8,0],[-1.6,.8,0]],[[-1,.8,0],[1,.8,0]],[[1,.8,0],[1,-.8,0]],[[1,-.8,0],[-2,-.8,0]],[[-2,-.8,0],[-2,-.4,0]]]);
        switchBlade.set([[-1.6,.8,0],[-1,q.trip?1.15:.8,0]]);dots.forEach(o=>o&&(o.visible=false));
        report(`${q.trip?'OPEN / current stopped: '+cause+'.':'Switch closed.'} Live ${q.liveA.toFixed(3)} A, neutral ${q.neutralA.toFixed(3)} A. ${mode===3?'Balanced overload: RCD difference 0, breaker opens.':`Return path: ${q.faultPath}. ${q.caseLive?'The isolated case remains live.':''}`} A prescribed prospective fault; virtual demonstration only.`);return;
      }
      if(probes){const g=P.circuitTopology(mode===1);setEdges(g.edges);loads.forEach((o,j)=>o?.position.set(...g.loads[j].center));leds.forEach((o,j)=>o?.position.set(.55,g.loads[j].center[1],0));
        const q=circuitState(),connection=P.circuitProbe(mode===1,probe),j=connection.load,pa=connection.red,pb=connection.black;leds.forEach((o,k)=>o?.rotation.set(0,0,mode===1&&k===1?Math.PI/2:-Math.PI/2));
        redProbe?.position.set(...P.add(pa,[0,0,.18]));blackProbe?.position.set(...P.add(pb,[0,0,.18]));probeLead.set([P.add(pa,[0,0,.18]),P.add(pb,[0,0,.18])]);
        const volts=mode===1?q.currents[j]*[330,r][j]+2:q.terminalV;
        report(`${mode?'Series':'Parallel'} topology: I₁ ${(q.currents[0]*1000).toFixed(2)} mA; I₂ ${(q.currents[1]*1000).toFixed(2)} mA; battery ${(q.totalI*1000).toFixed(2)} mA. Probe ${probe>=3?`red minus black across load ${j+1}: ${volts.toFixed(2)} V`:`${['branch 1','branch 2','battery'][probe]}: ${(1000*(probe===2?q.totalI:q.currents[probe])).toFixed(2)} mA`}. Each load contains resistor + LED.`);
      }else{
        const gap=d.id==='circuit-diagnose'&&mode===3,edge=[...P.circuitTopology(true).edges.slice(0,4),[[2,.6,0],[2,-.8,0]],[[2,-.8,0],[-2,-.8,0]]];if(gap)edge[2]=[[-2,.6,0],[-1.4,.6,0]];
        setEdges(edge);loads[0]?.position.set(0,.6,0);leds[0]?.position.set(.55,.6,0);leds[1]&&(leds[1].visible=false);leds[0]?.rotation.set(0,0,mode===2?Math.PI/2:-Math.PI/2);
        const q=P.diodeOperatingPoint(V,330,internal,mode===1,!gap,mode===2);leds[0]?.material.color.set(q.current>.0001?c.proton:c.muted);
        if(signalMode){setEdges([[[-2,-.8,0],[-2,-.4,0]],[[-2,.4,0],[-2,.8,0]],[[-2,.8,0],[-.8,.8,0]],[[.8,.8,0],[2,.8,0]],[[2,.8,0],[2,-.8,0]],[[2,-.8,0],[-2,-.8,0]]]);loads[0]?.position.set(0,.8,0);leds[0]?.position.set(.55,.8,0);const elapsed=mode?driftSeconds:clock*1e-9;dots.forEach((o,j)=>{o?.position.set(...P.loopPoint(j/16-elapsed*.0001));if(o)o.visible=true;});signal?.position.set(...P.loopPoint(P.clamp(clock/10,0,.999999)));report(`${mode?driftSeconds.toFixed(0)+' s drift clock':clock.toFixed(1)+' ns signal clock'}. Complete rectangular wire path represents 1 m. Signal 10⁸ m/s reaches one loop in 10 ns; electron drift 0.1 mm/s travels ${(elapsed*.0001).toPrecision(3)} m. Large blue dot follows one electron; outlined start stays fixed. Play advances only the selected clock (2 ns/s or 500 drift s/s); each clock stops at its limit; Replay returns it to zero. Icons enlarged, spatial path is the same.`);}
        else report(`Supply ${V.toFixed(1)} V, terminal ${q.terminalV.toFixed(2)} V, LED ${q.diodeV.toFixed(2)} V, current ${(q.current*1000).toFixed(2)} mA. ${gap?'Visible gap: open loop.':mode===2?'Reversed triangle polarity: blocked current.':'Dot is the intersection of nonlinear LED-plus-resistor response and the source load line.'} Exponential ideal-diode teaching model, not a component specification.`);
      }
      if(!signalMode)dots.forEach(o=>o&&(o.visible=false));
    };
    draw=()=>{
      const project=p=>[70+(p[0]+2)*100,125-p[1]*65];
      const paintCircuit=(edges,loads=[],series=false)=>{edges.forEach(e=>stroke(e.map(project),c.ink));loads.forEach((v,j)=>{const [x,y]=project(v.center),base=x+(series&&j===1?69:41),tip=x+(series&&j===1?41:69);P.loadLeads(v).forEach(e=>stroke(e.map(project),c.ink));ctx.strokeStyle=c.ink;ctx.strokeRect(x-27.5,y-7,55,14);stroke([[base,y-8],[tip,y],[base,y+8],[base,y-8]],c.proton);});stroke([[64,99],[76,99]],c.electron,3);stroke([[61,151],[79,151]],c.electron,3);};
      if(d.id==='circuit-signal'){const elapsed=mode?driftSeconds:clock*1e-9;paintCircuit([[[-2,-.8,0],[-2,.8,0]],[[-2,.8,0],[2,.8,0]],[[2,.8,0],[2,-.8,0]],[[2,-.8,0],[-2,-.8,0]]]);for(let j=0;j<16;j++)plotDot(...project(P.loopPoint(j/16-elapsed*.0001)),c.electron,3);plotDot(...project(P.loopPoint(P.clamp(clock/10,0,.999999))),c.neutron,7);ctx.strokeStyle=c.electron;ctx.beginPath();ctx.arc(...project(P.loopPoint(0)),6,0,2*Math.PI);ctx.stroke();plotDot(...project(P.loopPoint(-elapsed*.0001)),c.electron,5);text(mode?`Drift clock ${driftSeconds.toFixed(0)} s`:`Signal clock ${clock.toFixed(1)} ns`,320,24,c.ink,14,'center');text('Large blue dot: tracked electron; ring: its starting point.',320,46,c.muted,12,'center');text(`Drift ${(elapsed*.0001).toPrecision(3)} m · 1 m wire path · charge icons enlarged`,320,222,c.muted,12,'center');}
      else if(d.id==='protection'){const q=P.protectionState(r,mode===0,mode===2,mode===3,latched);paintCircuit([[[-2,-.8,0],[-2,.8,0]],[[-2,.8,0],[-1.2,.8,0]],[[-.5,.8,0],[1,.8,0]],[[1,.8,0],[1,-.8,0]],[[1,-.8,0],[-2,-.8,0]]]);stroke([project([-1.2,.8,0]),project([-.5,q.trip?1.2:.8,0])],c.ink,3);ctx.strokeStyle=c.rule;ctx.strokeRect(300,95,65,60);if(mode!==3)stroke([[330,73],[330,120]],c.proton);if(mode===0||mode===2)stroke([[330,120],[mode===0?330:410,185],[70,185],[70,151]],mode===0?c.green:c.proton);text(q.trip?'OPEN / current stopped':'CLOSED',320,24,c.ink,15,'center');text(`Live ${q.liveA.toFixed(3)} A · neutral ${q.neutralA.toFixed(3)} A`,320,213,c.ink,12,'center');text(mode===3?'Balanced overload trips breaker':`Separate return: ${q.faultPath}`,320,235,c.muted,11,'center');}
      else if(d.id==='circuit-probes'){const g=P.circuitTopology(mode===1),q=circuitState();paintCircuit(g.edges,g.loads,mode===1);const connection=P.circuitProbe(mode===1,probe),j=connection.load,pa=connection.red,pb=connection.black;plotDot(...project(pa),c.proton,5);if(probe>=3){plotDot(...project(pb),c.ink,5);stroke([project(pa).map((v,k)=>v+(k===1?-22:0)),project(pb).map((v,k)=>v+(k===1?-22:0))],c.proton);}
        text(`${mode?'Series':'Parallel'} · I₁ ${(q.currents[0]*1000).toFixed(1)} / I₂ ${(q.currents[1]*1000).toFixed(1)} mA`,320,24,c.ink,13,'center');text(`Probe ${probe>=3?'ΔV load '+(j+1)+' = '+(mode?q.currents[j]*[330,r][j]+2:q.terminalV).toFixed(2)+' V':['I₁','I₂','I battery'][probe]+' = '+((probe===2?q.totalI:q.currents[probe])*1000).toFixed(2)+' mA'}`,320,213,c.ink,13,'center');text(probe>=3?'Red/black endpoints measure a voltage difference; no wire bypasses a load.':'The marked point selects current; no wire bypasses a load.',320,235,c.muted,11,'center');}

      else{const q=P.diodeOperatingPoint(V,330,internal,mode===1,mode!==3,mode===2);axes('LED + resistor voltage / V','current / mA',{x:[0,12],y:[0,40]});
        const g=P.diodeOperatingPoint(V,330,internal,mode===1);curve(u=>P.diodeOperatingPoint(u*12,330,0,mode===1,mode<2).current/.04,c.proton);
        if(internal>0)curve(u=>P.clamp((V-u*12)/internal/.04,0,1),c.electron);else stroke([[55+V/12*550,45],[55+V/12*550,195]],c.electron);
        plotDot(55+q.terminalV/12*550,195-q.current/.04*145);text('Red: nonlinear load · blue: source/internal-R · dot: operating point',320,43,c.muted,11,'center');const y=218;stroke([[70,y],[115,y]],c.ink);stroke([[mode===3?150:115,y],[190,y]],c.ink);const tip=mode===2?215:235,base=mode===2?235:215;stroke([[base,y-8],[tip,y],[base,y+8],[base,y-8]],c.proton);stroke([[235,y],[280,y]],c.ink);text(mode===3?'open gap':mode===2?'reversed LED':'forward LED',300,222,c.muted,11);}
    };
  }
  function domains() {
    label3("moments inside the material", [0, 1.1, 0]);
    let field = 100, cut = false;
    const blocks = [box(-0.65, 0, 0, 1.25, 1.4, 0.6, c.rule), box(0.65, 0, 0, 1.25, 1.4, 0.6, c.rule)];
    const arrows = Array.from({ length: 24 }, (_, j) => arrow([0, 0, 0], [0, 0.3, 0], j % 2 ? c.electron : c.proton));
    const fieldControl=scalar("Applied field", -100, 100, field, (v) => field = v, 5, " relative");
    for(const side of [-1,1]){label3("N",()=>Math.abs(field)<50?[0,-20,0]:[side*(cut?.95:.65),field>=0?.83:-.83,0],c.proton);label3("S",()=>Math.abs(field)<50?[0,-20,0]:[side*(cut?.95:.65),field>=0?-.83:.83,0],c.electron);}
    const walls=[-1,1].map(side=>line([[side*.65,-.7,.32],[side*.65,.7,.32]],c.proton));
    button("Cut / join magnet", () => {cut = !cut;if(cut&&Math.abs(field)<50){field=100;fieldControl.set(field);}});
    update = () => {
      arrows.forEach((a, j) => {
        const side=j<12?-1:1,k=j%12,centre=side*(cut?.95:.65),dx=(k%4-1.5)*.25,x=centre+dx,y=(Math.floor(k/4)-1)*.4,boundary=-.625+1.25*(.5+.45*Math.abs(field)/100),favoured=dx<boundary,ang=P.domainOrientation(field,favoured);
        a?.setColor(Math.cos(ang)>0?c.proton:c.electron);
        moveArrow(a, [x, y, 0.4], [x + Math.sin(ang) * 0.22, y + Math.cos(ang) * 0.22, 0.4]);
      });
      walls.forEach((w,j)=>{const x=(j?1:-1)*(cut?.95:.65)-.625+1.25*(.5+.45*Math.abs(field)/100);w.set([[x,-.7,.32],[x,.7,.32]]);});
      blocks.forEach((b, j) => {
        if (b) b.position.x = (j ? 1 : -1) * (cut ? 0.95 : 0.65);
      });
      report(`Applied field ${field}; relative net moment ${P.domainNet(field).magnitude.toFixed(2)}: ${Math.abs(field) < 5 ? "domain moments largely cancel" : "favourable regions grow; their moments rotate toward the applied field at high field"}. ${cut ? "Both separated pieces still contain north\u2013south dipoles." : "The whole sample\u2019s magnetic moment is the vector sum of its domains."}`);
    };
    draw = () => {
      bar("Net moment, relative magnitude", P.domainNet(field).magnitude, 1, 70, 80, field < 0 ? c.electron : c.proton, 490);
      const fraction = P.domainNet(field).fraction;
      ctx.fillStyle = c.rule;
      ctx.fillRect(75, 110, 490, 48);
      ctx.fillStyle = c.electron;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(75, 110, 490 * fraction, 48);
      ctx.globalAlpha = 1;
      stroke([[75 + 490 * fraction, 105], [75 + 490 * fraction, 164]], c.proton);
      text("Favourable region grows as the wall moves", 320, 186, c.muted, 12, "center");
      text(cut ? "Two complete magnets; no isolated magnetic pole." : "Domain boundaries and orientations are schematic.", 320, 220, c.ink, 15, "center");
    };
  }
  function earthField() {
    let lat=19.08,az=0,free=true;
    ball(-1.5,0,0,.75,c.electron);line([[-1.5,-1,0],[-1.5,1,0]],c.ink);
    const site=ball(0,0,0,.055,c.proton),siteField=arrow([0,0,0],[0,0,0],c.proton),siteNorth=arrow([0,0,0],[0,0,0],c.ink),siteUp=arrow([0,0,0],[0,0,0],c.green);
    const needle=arrow([.7,0,0],[1.7,0,0],c.proton),world=arrow([.7,0,0],[1.7,0,0],c.ink),axes3=Array.from({length:3},()=>arrow([0,0,0],[0,0,0],c.electron)),components=Array.from({length:3},()=>arrow([0,0,0],[0,0,0],c.green));
    label3('world B',[1.6,.8,0],c.ink);label3('N',[.7,0,-1.1]);label3('up',[.7,1.1,0]);
    scalar('Latitude',-80,80,lat,v=>lat=v,1,'°');scalar('Device rotation',0,360,az,v=>az=v,5,'°');tabs(['Free needle','Held level'],i=>free=i===0);
    update=()=>{const q=P.earthSensorGeometry(lat,az),p=P.add([-1.5,0,0],P.scale(q.up,.8)),origin=[.7,0,0],local=v=>[v[0],v[2],-v[1]],field=local(q.enu),H=Math.hypot(q.enu[0],q.enu[1]),a=az*P.DEG;
      site?.position.set(...p);moveArrow(siteField,p,P.add(p,P.scale(q.field,.28)));moveArrow(siteNorth,p,P.add(p,P.scale(q.north,.4)));moveArrow(siteUp,p,P.add(p,P.scale(q.up,.4)));
      moveArrow(world,origin,P.add(origin,P.scale(field,.55)));moveArrow(needle,origin,P.add(origin,P.scale(free?field:[field[0],0,field[2]],.55)));
      const deviceAxes=[[Math.cos(a),0,-Math.sin(a)],[-Math.sin(a),0,-Math.cos(a)],[0,1,0]];
      let tip=[...origin];deviceAxes.forEach((v,j)=>{moveArrow(axes3[j],origin,P.add(origin,P.scale(v,.8)));const end=P.add(tip,P.scale(v,q.device[j]*.55));moveArrow(components[j],tip,end);tip=end;});
      report(`Latitude ${lat.toFixed(1)}°; dip ${(Math.atan2(-q.enu[2],H)/P.DEG).toFixed(1)}°. World east/north/up B = (${q.enu.map(x=>x.toFixed(2)).join(', ')}). Rotating device x/y/z = (${q.device.map(x=>x.toFixed(2)).join(', ')}), in relative units. Blue device basis rotates; green components add to unchanged dark world B. ${free?'Free needle follows full B.':'Level needle follows only its horizontal projection.'} Globe red arrow is the same local field.`);
    };
    draw=()=>{const q=P.earthSensorGeometry(lat,az);text('Device projections of the same world field',320,25,c.ink,14,'center');q.device.forEach((v,j)=>{const x=110+j*210;stroke([[x,55],[x,185]],c.rule);stroke([[x,120],[x,120-v*35]],c.electron,5);text(`${['x','y','z'][j]}: ${v.toFixed(3)}`,x,210,c.ink,13,'center');});stroke([[70,120],[570,120]],c.rule);};
  }
  function fieldProbe() {
    let I=1,r=1,kind='wire',turns=1;
    label3("wire +I: +y",[0,1.6,0]);label3("Earth north +y",[1.9,1.3,0],c.proton);
    const wire=mesh(new CylinderGeometry(.06,.06,2.6,16),c.ink),currentArrow=arrow([-.18,-1.2,0],[ -.18,1.2,0],c.ink);
    const rings=[.5,1,1.5].map(x=>circle(x,c.electron)),loops=Array.from({length:10},()=>circle(.8,c.electron));
    const vectors=[arrow([0,0,0],[0,0,0],c.electron),arrow([0,0,0],[0,0,0],c.proton),arrow([0,0,0],[0,0,0],c.ink)];
    const contributions=Array.from({length:10},()=>arrow([0,0,0],[0,0,0],c.green)),marker=ball(0,0,0,.08,c.neutron);
    const ic=scalar("Current",-3,3,I,v=>I=v,.1," A"),rc=scalar("Probe distance",.5,6,r,v=>r=v,.1," cm");
    tabs(["Bench wire","Tram: 500 A / 200 m","Coil centre"],i=>{kind=['wire','tram','coil'][i];ic.input.disabled=kind==='tram';rc.input.disabled=kind!=='wire';});
    const tb=button("Add coil turn (1–10)",()=>turns=turns%10+1);
    update=()=>{const q=P.wireProbeGeometry(I,r,kind,turns),coil=kind==='coil';tb.disabled=!coil;
      if(wire)wire.visible=!coil;moveArrow(currentArrow,coil?[.8,0,.35*Math.sign(q.current)]:[-.18,-1.2*Math.sign(q.current),0],coil?[.8,0,-.35*Math.sign(q.current)]:[-.18,1.2*Math.sign(q.current),0]);
      rings.forEach(o=>o.object.visible=!coil);loops.forEach((o,j)=>{o.object.visible=coil&&j<turns;o.object.position.y=(j-(turns-1)/2)*.08;});
      marker?.position.set(...q.position);[q.source,q.background,q.total].forEach((v,j)=>moveArrow(vectors[j],q.position,P.add(q.position,P.scale(v,1/q.arrowScale))));
      let tip=[...q.position];contributions.forEach((o,j)=>{if(o)o.visible=coil&&j<turns;if(coil&&j<turns){const next=P.add(tip,P.scale(q.contributions[j],1/q.arrowScale));moveArrow(o,tip,next);tip=next;}});
      report(`${kind==='tram'?'Locked tram example: 500 A at 200 m. ':''}Source ${P.length(q.source).toFixed(2)} μT; Earth north 38.4 μT; resultant ${P.length(q.total).toFixed(2)} μT. ${coil?'Green head-to-tail arrows add each turn along the coil axis.':'Current +y makes a tangent field −z at the +x probe; reversing current reverses it.'} Arrow scale ${q.arrowScale} μT/unit. ${kind==='tram'?'Distance drawing schematic; return-current geometry omitted.':`Probe ${coil?'at centre':r.toFixed(1)+' cm from wire'}.`}`);
    };
    draw=()=>{const q=P.wireProbeGeometry(I,r,kind,turns);axes(kind==='coil'?"axial distance / cm":"distance / cm","source strength / μT",{x:kind==='coil'?[0,6]:[.5,6],y:[0,kind==='coil'?2000:120]});
      curve(u=>kind==='coil'?Math.abs(P.coilField(I,turns,.01,u*.06)*1e6)/2000:kind==='tram'?.5/120:Math.abs(20*I/(.5+u*5.5))/120);
      text(`Blue source (${q.source.map(x=>x.toFixed(1)).join(',')}) μT · red north · dark sum`,320,48,c.ink,12,"center");
      ctx.fillStyle=c.plate;ctx.fillRect(440,60,175,120);const o=[495,155],project=v=>[o[0]-v[2]/q.arrowScale*70,o[1]-v[1]/q.arrowScale*70];[q.source,q.background,q.total].forEach((v,j)=>{const p=project(v);stroke([o,p],[c.electron,c.proton,c.ink][j],j===2?3:2);plotDot(...p,[c.electron,c.proton,c.ink][j],3);});text('north ↑ / −z →',525,83,c.muted,11,'center');
    };
  }
  function machines() {
    let angle = 45, I = 2, commute = true, omega = 2, ratio = 2, dc = false, running = false, velocity = 0, connected = true, angleControl, currentControl;
    const rotor = group();
    line([[-.12,-.65,0],[-.7,-.65,0],[-.7,.65,0],[.7,.65,0],[.7,-.65,0],[.12,-.65,0]],c.ink,rotor);
    const rotorLeads=[line([[-.12,-.65,0],[-.12,-.85,0],[-.22,-1,0]],c.proton,rotor),line([[.12,-.65,0],[.12,-.85,0],[.22,-1,0]],c.electron,rotor)];
    const coilNormal=arrow([0,0,0],[0,0,.85],c.green,rotor);
    const poles = [box(-1.6, 0, 0, 0.5, 1.7, 1, c.proton), box(1.6, 0, 0, 0.5, 1.7, 1, c.electron)];
    const shaft = line([[0, -1, 0], [0, 1, 0]], c.rule);
    const forces = [arrow([-0.7, 0, 0], [-0.7, 0, 0.5], c.proton), arrow([0.7, 0, 0], [0.7, 0, -0.5], c.proton)];
    const flow = [arrow([-0.7, 0.4, 0], [-0.7, -0.4, 0], c.electron, rotor), arrow([0.7, -0.4, 0], [0.7, 0.4, 0], c.electron, rotor)];
    const comm1 = mesh(new TorusGeometry(0.22, 0.04, 8, 28, Math.PI - 0.08), c.proton, rotor);
    if (comm1) {
      comm1.rotation.x = Math.PI / 2;
      comm1.position.y = -1;
    }
    const comm2 = mesh(new TorusGeometry(0.22, 0.04, 8, 28, Math.PI - 0.08), c.electron, rotor);
    if (comm2) {
      comm2.rotation.set(Math.PI / 2, 0, Math.PI);
      comm2.position.y = -1;
    }
    const brushes = [box(-0.3, -1, 0.08, 0.12, 0.23, 0.15, c.ink), box(0.3, -1, 0.08, 0.12, 0.23, 0.15, c.ink)];
    const fluxArrows=Array.from({length:8},()=>arrow([0,0,0],[0,0,0],c.green));
    const supplyLeads=[line([[-.36,-1,.08],[-.7,-1.5,.08],[-.4,-1.5,.08]],c.ink),line([[.18,-1.5,.08],[.7,-1.5,.08],[.36,-1,.08]],c.ink)];
    const supplySwitch=line([[-.4,-1.5,.08],[-.18,-1.5,.08]],c.ink);
    supplySwitch.object.name='motor-supply-switch';
    const supply=box(0,-1.5,.08,.35,.22,.2,c.electron);
    const slipRings=[];
    if(d.id!=='transformer')for(const [j,y] of [-1,-1.3].entries()){
      const ring=mesh(new TorusGeometry(.22,.035,8,36),j?c.electron:c.proton,rotor);
      if(ring){ring.rotation.x=Math.PI/2;ring.position.y=y;ring.visible=d.id==='generator';}slipRings.push(ring);
    }
    if(d.id==='generator'){label3('AC voltmeter',[1.1,-1.4,0]);label3('separate slip rings',[0,-1.4,0]);}
    if (d.id === "transformer") {
      supplyLeads.forEach(o=>o.object.visible=false);supplySwitch.object.visible=false;if(supply)supply.visible=false;
      scalar("Secondary / primary turns", 0.5, 4, ratio, (v) => ratio = v, 0.5, "\xD7");
      scalar("Primary input (AC RMS / DC)", 0, 24, I = 12, (v) => I = v, 0.5, " V");
      tabs(["Alternating input", "Steady DC"], (i) => dc = !!i);
    } else {
      angleControl = scalar("Coil angle", 0, 360, angle, (v) => {
        angle = v;
        running = false;
        velocity = 0;
        api.pause?.();
      }, 1, "\xB0");
      if (d.id === "motor") {
        currentControl = scalar("Current", -3, 3, I, (v) => I = v, 0.1, " A");
        tabs(["Split-ring commutator", "No reversal", "Open circuit"], (i) => {
          commute = i !== 1;
          connected = i !== 2;
        });
        button("Run / hold rotor", () => {
          running = !running;
          if (running) api.play?.();
          else {
            velocity = 0;
            api.pause?.();
          }
        });
        button("Step a quarter turn", () => {
          running = false;
          velocity = 0;
          angle = (angle + 90) % 360;
          angleControl.set(angle);
          api.pause?.();
        });
        button("Reverse supply", () => {
          I = -I;
          currentControl.set(I);
        });
      } else {
        scalar("Angular speed", 0, 6, omega, (v) => omega = v, 0.1, " rad/s");
      }
    }
    const secondary = group();
    if (d.id === "transformer") {
      label3("primary", [-0.9, 1.15, 0], c.proton);
      label3("secondary", [0.9, 1.15, 0], c.electron);
    } else {
      label3("N", [-1.6, 1, 0], c.proton);
      label3("S", [1.6, 1, 0], c.electron);
      arrow([-1.2, 1.2, 0], [1.2, 1.2, 0], c.ink);
      label3("B \u2192", [0, 1.45, 0]);
      if (d.id === "motor") {
        label3("current I", () => connected&&I!==0?[-0.7 * Math.sin(angle * P.DEG), 0.6, 0.7 * Math.cos(angle * P.DEG)]:[0,-20,0], c.electron);
        label3("force F", () => connected&&I!==0?[-0.7 * Math.sin(angle * P.DEG), -0.2, 0.7 * Math.cos(angle * P.DEG) + 0.7]:[0,-20,0], c.proton);
        label3("coil normal",()=>[Math.cos(angle*P.DEG)*.9,0,Math.sin(angle*P.DEG)*.9],c.green);
        label3("split ring",()=>commute?[0,-1.2,0]:[0,-20,0]);
        label3("slip rings: no reversal",()=>!commute?[0,-1.4,0]:[0,-20,0]);
        label3("brushes",()=>commute?[.5,-1.15,.1]:[.5,-1.1,.1]);
        label3("open switch",()=>!connected?[-.35,-1.5,.08]:[0,-20,0]);
      }
    }
    if (d.id === "transformer") {
      rotor.visible = false;
      poles.forEach((o) => o && (o.visible = false));
      shaft.object.visible = false;
      brushes.forEach((o) => o && (o.visible = false));
      forces.forEach((o) => o && (o.visible = false));
      for (const x of [-0.9, 0.9]) box(x, 0, 0, 0.3, 1.7, 0.4, c.muted, secondary);
      for (const y of [-0.85, 0.85]) box(0, y, 0, 2.1, 0.3, 0.4, c.muted, secondary);
      for (let j = 0; j < 6; j++) {
        const a = mesh(new TorusGeometry(0.32, 0.025, 8, 28), c.proton, secondary);
        if (a) {
          a.rotation.x = Math.PI / 2;
          a.position.set(-0.9, -0.55 + j * 0.22, 0);
        }
      }
      for (let j = 0; j < 24; j++) {
        const a = mesh(new TorusGeometry(0.32, 0.02, 8, 28), c.electron, secondary);
        if (a) {
          a.rotation.x = Math.PI / 2;
          a.position.set(0.9, -0.65 + j * 0.055, 0);
          a.userData.turn = j;
        }
      }
    }
    advance = (dt) => {
      if (d.id === "motor") {
        running = dt > 0;
        if (running) {
          const q = P.motor(angle, connected ? I : 0, 0.5, 10, 0.04, commute);
          velocity += (q.torque / 0.08 - 0.35 * velocity) * Math.min(dt, 0.05);
          angle = ((angle - velocity * dt / P.DEG) % 360 + 360) % 360;
          angleControl.set(Math.round(angle));
        }
      } else if (d.id === "generator" && dt > 0) {
        angle = (angle + omega * dt / P.DEG) % 360;
        angleControl.set(Math.round(angle));
      }
    };
    update = () => {
      fluxArrows.forEach(o=>o&&(o.visible=d.id==='transformer'));
      if (d.id === "transformer") {
        playback(!dc);
        teach(dc?'After the switching transient, steady direct current makes a steady magnetic flux. An unchanging flux produces no induced secondary voltage. The primary still draws current through its winding resistance; this is different from the ideal AC power comparison.':d.explanation);
        const phase=P.transformerPhase(dc?I:Math.SQRT2*I,ratio,tick,dc),route=[[-.9,-.7,.28],[-.9,0,.28],[-.9,.7,.28],[0,.85,.28],[.9,.7,.28],[.9,0,.28],[.9,-.7,.28],[0,-.85,.28]];
        route.forEach((v,j)=>{const next=route[(j+1)%route.length],delta=P.scale(P.add(next,P.scale(v,-1)),.7*phase.flux);moveArrow(fluxArrows[j],v,P.add(v,delta));});
        secondary.traverse((o) => {
          if (o.userData.turn !== void 0) o.visible = o.userData.turn < 6 * ratio;
        });
        const q2 = P.transformer(I, 100, 100 * ratio, 1, !dc);
        report(dc?`Steady DC comparison after its transient: applied ${I.toFixed(1)} V, illustrative winding resistance 10 Ω gives ${(I/10).toFixed(2)} A. Nonzero steady common flux (strength schematic); induced primary and secondary emf both 0 V. Winding resistance limits DC current; the AC ideal lossless power rule does not apply to this separate steady-state comparison.`:`Instantaneous primary ${phase.primaryV.toFixed(2)} V; secondary ${phase.secondaryV.toFixed(2)} V; common flux ${phase.fluxWb.toFixed(3)} Wb. Slow AC clock; voltage follows −N dΦ/dt. Primary 100 turns, secondary ${Math.round(100*ratio)} turns: ${q2.secondaryV.toFixed(1)} V RMS out, ${q2.primaryI.toFixed(2)} A RMS in for 1 A RMS secondary. Input/output mean power ${q2.outputPower.toFixed(1)} W with an ideal resistive load; core losses and saturation omitted.`);
        return;
      }
      rotor.rotation.y = (90 - angle) * P.DEG;
      const slip=d.id==='generator'||!commute;
      if(d.id==='motor')teach(!connected?'Opening the visible supply switch breaks the current path, so magnetic torque becomes zero. A moving rotor can coast while friction slows it; zero torque does not mean instant rest.':commute?d.explanation:'The continuous slip rings keep the same coil connections throughout a turn. The coil current therefore does not swap direction after half a turn, so its turning effect reverses. Compare the negative part of the signed torque graph with the split-ring case.');
      if(comm1)comm1.visible=!slip;if(comm2)comm2.visible=!slip;
      slipRings.forEach(o=>o&&(o.visible=slip));
      if(slip){
        brushes.forEach((o,j)=>o?.position.set(.3,-1-j*.3,0));
        rotorLeads[0].set([[-.12,-.65,0],[-.12,-.85,0],[.22,-1,0]]);rotorLeads[1].set([[.12,-.65,0],[.12,-1.15,0],[.22,-1.3,0]]);
        supplyLeads[0].set([[.36,-1,0],[.8,-1,0],[.8,-1.04,0]]);supplyLeads[1].set([[.8,-1.26,0],[.8,-1.3,0],[.36,-1.3,0]]);
        supplySwitch.object.visible=false;supply?.position.set(.8,-1.15,0);
      }else{
        brushes.forEach((o,j)=>o?.position.set(j?.3:-.3,-1,.08));
        rotorLeads[0].set([[-.12,-.65,0],[-.12,-.85,0],[-.22,-1,0]]);rotorLeads[1].set([[.12,-.65,0],[.12,-.85,0],[.22,-1,0]]);
        supplyLeads[0].set([[-.36,-1,.08],[-.7,-1.5,.08],[-.4,-1.5,.08]]);supplyLeads[1].set([[.18,-1.5,.08],[.7,-1.5,.08],[.36,-1,.08]]);
        supplySwitch.object.visible=true;supplySwitch.set([[-.4,-1.5,.08],[-.18,connected?-1.5:-1.22,.08]]);supply?.position.set(0,-1.5,.08);
      }
      const q = P.motor(angle, connected ? I : 0, 0.5, 10, 0.04, commute), g = P.generator(angle, omega, 0.5, 10, 0.04);
      forces.forEach((a, j) => {
        const x = (j ? 0.7 : -0.7) * Math.sin(angle * P.DEG), z = -(j ? 0.7 : -0.7) * Math.cos(angle * P.DEG);
        moveArrow(a, [x, 0, z], [x, 0, z + (j ? -1 : 1) * q.force * 0.4]);
      });
      flow.forEach((a, j) => moveArrow(a, [j ? 0.7 : -0.7, (j ? -1 : 1) * 0.4 * Math.sign(q.current), 0], [j ? 0.7 : -0.7, (j ? 1 : -1) * 0.4 * Math.sign(q.current), 0]));
      if (d.id === "generator") {
        forces.forEach((o) => o && (o.visible = false));
        flow.forEach((o) => o && (o.visible = false));
      }
      report(d.id === "motor" ? `Angle ${Math.round(angle)}\xB0; signed coil current ${q.current.toFixed(1)} A; torque ${q.torque.toFixed(3)} N\xB7m. ${!connected ? "Open circuit: torque is zero; an already moving rotor coasts with damping." : commute ? "The commutator flips current each half-turn; torque retains its sense." : "Continuous slip rings do not swap the coil connections: torque reverses after half a turn."} ${running ? "Rotor running; speed " + velocity.toFixed(2) + " rad/s." : "Rotor paused for inspection."}` : `Angle ${angle.toFixed(1)}\xB0; linked flux ${g.flux.toFixed(3)} Wb-turn; induced voltage ${g.voltage.toFixed(3)} V at ${omega.toFixed(1)} rad/s. Peak flux gives zero rate of change and zero voltage.`);
    };
    draw = () => {
      if (d.id === "transformer") {
        axes('one slowed AC cycle','blue V₁ / red V₂ in volts',{x:[0,1],y:[-150,150]});
        curve(u=>.5+.35*P.transformerPhase(dc?I:Math.SQRT2*I,ratio,u*2*Math.PI/1.5,dc).flux,c.green);
        curve(u=>.5+P.transformerPhase(dc?I:Math.SQRT2*I,ratio,u*2*Math.PI/1.5,dc).primaryV/300,c.electron);
        curve(u=>.5+P.transformerPhase(dc?I:Math.SQRT2*I,ratio,u*2*Math.PI/1.5,dc).secondaryV/300,c.proton);
        const q=P.transformerPhase(dc?I:Math.SQRT2*I,ratio,tick,dc);plotDot(55+(q.phase/(2*Math.PI)%1)*550,195-(.5+q.secondaryV/300)*145,c.proton);
        text(dc?'DC: steady green flux; both emf curves zero':'Green flux uses its own scale; compare zero crossings.',320,45,c.ink,13,'center');
      } else {
        axes("coil angle / degrees",d.id==='motor'?"torque / N·m":"relative display scale (see key)",{x:[0,360],y:d.id==='motor'?[-.6,.6]:[-1,1]});
        if(d.id==='motor')curve((u) => 0.5 + P.motor(u * 360, connected?I:0, 0.5, 10, 0.04, commute).torque / 1.2, c.proton);
        if (d.id === "generator") {
          curve((u) => 0.5 + P.generator(u*360,omega).flux/.4, c.electron);
          curve((u) => 0.5 + P.generator(u*360,omega).voltage/2.8, c.proton);
        }
        plotDot(55 + angle / 360 * 550, 195 - (0.5 + (d.id === "motor" ? P.motor(angle, connected?I:0, 0.5, 10, 0.04, commute).torque / 1.2 : P.generator(angle,omega).voltage/2.8)) * 145);
        text(d.id === "motor" ? !connected?'Supply open: zero electrical torque.':commute?'Split ring: current swaps; torque retains its sense.':'Continuous slip rings: torque reverses after half a turn.' : "Blue 1 = 0.2 Wb-turn; red 1 = 1.4 V. Turning needs work.", 320, 47, c.muted, 12, "center");
      }
    };
  }
  function emWave() {
    label3("E: electric field", [-1.9, 1.15, 0], c.proton);
    label3("B: magnetic field", [1.3, 0, 1], c.electron);
    arrow([-2.5, -1, 0], [2.5, -1, 0], c.ink);
    label3("travel \u2192", [0, -1.25, 0]);
    let wavelength = P.C/1e8, pol = 0, logF=8;
    ball(0, 0, 0, 0.055, c.ink);
    label3("fixed probe: x = 0", [0, 0.9, 0]);
    const N = 41, points = Array.from({ length: N }, () => [0, 0, 0]), eLine = line(points, c.proton), bLine = line(points, c.electron), ea = [], ba = [];
    for (let j = 0; j < N; j++) {
      ea.push(arrow([0, 0, 0], [0, 0, 0], c.proton));
      ba.push(arrow([0, 0, 0], [0, 0, 0], c.electron));
    }
    const frequencyControl=scalar("log₁₀ frequency / Hz",3,22,logF,v=>{logF=v;wavelength=P.C/10**logF;},.1);
    tabs(["FM radio","Microwave","Green light","X rays"],i=>{logF=Math.log10([1e8,2.45e9,P.C/550e-9,1e18][i]);wavelength=P.C/10**logF;frequencyControl.set(logF);});
    scalar("Polarisation direction", 0, 180, pol, (v) => pol = v, 5, "\xB0");
    update = () => {
      const e = [], b = [];
      for (let j = 0; j < N; j++) {
        const x = -2.5 + j / (N-1) * 5, v = 0.65 * Math.sin(2 * Math.PI * x - tick * 1.4), p = pol * P.DEG, ep = [x, v * Math.cos(p), v * Math.sin(p)], bp = [x, -v * Math.sin(p), v * Math.cos(p)];
        e.push(ep);
        b.push(bp);
        moveArrow(ea[j], [x, 0, 0], ep);
        moveArrow(ba[j], [x, 0, 0], bp);
      }
      eLine.set(e);
      bLine.set(b);
      report(`Wavelength ${wavelength.toExponential(3)} m; frequency ${(10**logF).toExponential(3)} Hz, f = c/λ. View spans five selected wavelengths. Time is slowed: visible angular rate 1.4 rad/s; physical angular rate ${(2*Math.PI*10**logF).toExponential(2)} rad/s. E and B are in phase, mutually perpendicular and transverse to travel (+x). At a fixed point each field oscillates; no material travels with the drawn curves.`);
    };
    draw = () => {
      stroke(Array.from({length:151},(_,j)=>[55+j/150*550,65-25*Math.sin(2*Math.PI*(-2.5+5*j/150)-tick*1.4)]),c.proton);
      text(`Slowed time · fixed probe E and cB = ${Math.sin(-tick*1.4).toFixed(2)} of peak`,320,20,c.ink,12,'center');
      const names=['radio','microwave','infrared','visible','UV','X ray','gamma'],bounds=[3,8.48,11.48,14.6,14.875,16.48,19.48,22];
      names.forEach((n,j)=>{const x=55+(bounds[j]-3)/19*550,w=(bounds[j+1]-bounds[j])/19*550;ctx.fillStyle=j%2?c.rule:c.mark_soft;ctx.fillRect(x,130,w,35);text(n,x+w/2,190,c.ink,10,'center');});
      const x=55+(logF-3)/19*550;stroke([[x,116],[x,172]],c.proton,3);text(`f ${(10**logF).toExponential(2)} Hz · λ ${wavelength.toExponential(2)} m`,320,225,c.muted,12,'center');
    };
  }

  function dayNight() {
    let lat=19.08,hour=12,local=false;
    const world=group(),surface=group(),earth=sphereDay(.7,world);alignDay(earth,[1,0,0]);
    ball(2.4,0,0,.2,c.neutron,world);line([[0,-1,0],[0,1,0]],c.ink,world);
    const observer=ball(0,0,0,.06,c.proton,world),tangent=line(Array.from({length:5},()=>[0,0,0]),c.green,world),basis=Array.from({length:3},()=>arrow([0,0,0],[0,0,0],c.ink,world));
    const meridian=circle(.705,c.rule,world);meridian.object.rotation.x=Math.PI/2;
    const starDirections=[[.6,.8,0],[-.8,.3,.52],[.1,-.6,.794],[-.2,.95,-.24]].map(v=>P.scale(v,1/P.length(v))),stars=starDirections.map(v=>ball(...P.scale(v,2.6),.045,c.sheet,world));
    circle(1.4,c.ink,surface);line([[-1.5,0,0],[1.5,0,0]],c.rule,surface);line([[0,0,-1.5],[0,0,1.5]],c.rule,surface);
    const localStars=starDirections.map(()=>ball(0,0,0,.06,c.sheet,surface)),localSun=ball(0,0,0,.09,c.neutron,surface),sunPath=line(Array.from({length:97},()=>[0,0,0]),c.neutron,surface);
    const toLocal=v=>[v[0]*1.4,v[2]*1.4,-v[1]*1.4];
    label3('E',()=>local?[1.65,0,0]:[0,-10,0]);label3('N',()=>local?[0,0,-1.65]:[0,-10,0]);label3('up',()=>local?[0,1.6,0]:[0,-10,0]);
    for(const [name,j] of [['E',0],['N',1],['up',2]])label3(name,()=>{const f=P.observerFrame(lat,hour-12);return local?[0,-20,0]:P.add(P.scale(f.up,.74),P.scale([f.east,f.north,f.up][j],.5));});
    const clock=scalar('Solar time',0,24,hour,v=>hour=v,.25,' h');scalar('Latitude',-75,75,lat,v=>lat=v,1,'°');tabs(['Space view','Local horizon'],i=>local=!!i);
    advance=dt=>{if(dt>0){hour=(hour+dt)%24;clock.set(hour);}};
    update=()=>{const f=P.observerFrame(lat,hour-12),pos=P.scale(f.up,.74),sun=f.project([1,0,0]);world.visible=!local;surface.visible=local;observer?.position.set(...pos);meridian.object.rotation.y=f.longitude;
      tangent.set([[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]].map(([x,y])=>P.add(pos,P.add(P.scale(f.east,x*.32),P.scale(f.north,y*.32)))));
      [f.east,f.north,f.up].forEach((v,j)=>moveArrow(basis[j],pos,P.add(pos,P.scale(v,.4))));
      localStars.forEach((o,j)=>{const v=f.project(starDirections[j]);o?.position.set(...toLocal(v));o?.material.color.set(v[2]>=0?c.sheet:c.muted);});localSun?.position.set(...toLocal(sun));
      sunPath.set(Array.from({length:97},(_,j)=>toLocal(P.observerFrame(lat,j/96*24-12).project([1,0,0]))));
      report(`Solar time ${hour.toFixed(2)} h, latitude ${lat.toFixed(1)}°; Sun altitude ${(Math.asin(P.clamp(sun[2],-1,1))/P.DEG).toFixed(1)}°. Play advances 1 solar hour per animation second. The tangent horizon and east/north/up basis turn with the observer. Morning Sun is east, evening Sun west; pale stars are above the horizon. Switching views preserves the same state.`);
    };
    draw=()=>{const f=P.observerFrame(lat,hour-12),project=v=>[320-f.project(v)[0]*180,125-f.project(v)[2]*85];stroke([[75,125],[565,125]],c.rule);text('E',75,145);text('W',565,145);text('Horizon: up above the line',320,25,c.ink,13,'center');
      stroke(Array.from({length:97},(_,j)=>{const v=P.observerFrame(lat,j/96*24-12).project([1,0,0]);return [320-v[0]*180,125-v[2]*85];}),c.neutron);
      starDirections.forEach(v=>{const p=project(v);plotDot(...p,f.project(v)[2]>0?c.ink:c.muted);});plotDot(...project([1,0,0]),c.neutron,7);text('Same sky projected east–up; north/depth can be inspected in 3D.',320,225,c.muted,12,'center');
    };
  }
  function sky() {
    if(d.id === "day-night"){dayNight();return;}
    let day = 172, lat = 19.08, tilt = 23.44, hour = 12, phase = 45, year = 0, sync = true, shadowBody="earth", centralZoom=false,dayControl,phaseControl;
    const earth = sphereDay(d.id === "seasons3d" ? 0.6 : 0.7), geo = group(), moon = sphereDay(0.22), mark = ball(0, 0, 0, 0.065, c.proton), axis = line([[0, -1.2, 0], [0, 1.2, 0]], c.ink), sun = ball(-2.4, 0, 0, 0.35, c.neutron);
    const orbit = circle(2.1, c.electron), ecliptic = circle(2.1, c.rule);
    const nodes = [ball(-2.1, 0, 0, 0.045, c.proton), ball(2.1, 0, 0, 0.045, c.proton)];
    const sunlight = [-1, 0, 1].map((y) => arrow([2.8, y, 0], [2.4, y, 0], c.neutron));
    const nearMark = ball(0, 0, 0, 0.055, c.proton);
    const earthScale = 2.1 / 384400, earthR = 6371 * earthScale, shadowLength = 3, shadowFarR = earthR - shadowLength * (695700 - 6371) / 149597870;
    const earthCone=P.shadowGeometry([1,0,0],[0,0,0],earthR,shadowLength);
    const shadow = mesh(new CylinderGeometry(earthCone.nearRadius, earthCone.farRadius, earthCone.length,24,1,true),c.rule,root,.2);
    const moonCone=P.shadowGeometry([1,0,0],[0,0,0],1737.4*earthScale,2.1,(695700+1737.4)/149597870);
    const moonShadow=mesh(new CylinderGeometry(moonCone.nearRadius,moonCone.farRadius,moonCone.length,24,1,true),c.rule,root,.2);
    ecliptic.object.visible = d.id === "eclipses";
    nodes.forEach((o) => o && (o.visible = d.id === "eclipses"));
    if (moonShadow) moonShadow.visible = d.id === "eclipses";
    sunlight.forEach((o) => o && (o.visible = d.id === "eclipses"));
    label3("Earth", () => [earth.position.x, earth.position.y + (d.id==='eclipses'?.22:.8), earth.position.z]);
    if(d.id==='seasons3d')label3("axis stays parallel",()=>[earth.position.x,earth.position.y+1,earth.position.z]);
    if (["moon-rotation", "eclipses"].includes(d.id)) label3("Moon", () => [moon.position.x, moon.position.y + 0.28, moon.position.z]);
    if (d.id === "eclipses") {
      label3("node", [-2.1, -0.25, 0], c.proton);
      label3("inclined lunar orbit", [0, 0.4, 2.1], c.electron);
    }
    if (d.id === "eclipses") {
      earth.scale.setScalar(earthR / 0.7);
      moon.scale.setScalar(1737.4 * earthScale / 0.22);
      if (mark) mark.visible = false;
      if (nearMark) nearMark.visible = false;
      if (sun) sun.visible = false;
    }
    const daylightArcs=[line(Array.from({length:97},()=>[0,0,0]),c.proton),line(Array.from({length:97},()=>[0,0,0]),c.green)],opposite=ball(0,0,0,.055,c.green);
    daylightArcs.forEach(o=>o.object.visible=d.id==='seasons3d');if(opposite)opposite.visible=d.id==='seasons3d';
    if (d.id === "seasons3d") {
      dayControl=scalar("Day in ideal year", 1, 365, day, (v) => day = v, 1);
      scalar("Latitude", -75, 75, lat, (v) => lat = v, 1, "\xB0");
      scalar("Axial tilt", 0, 30, tilt, (v) => tilt = v, 1, "\xB0");
      button('Restart ideal year',()=>{day=1;dayControl.set(day);api.pause?.();});
    } else if (d.id === "day-night") {
      scalar("Solar time", 0, 24, hour, (v) => hour = v, 0.25, " h");
      scalar("Latitude", -75, 75, lat, (v) => lat = v, 1, "\xB0");
    } else {
      phaseControl=scalar("Lunar angle from Sun", 0, 360, phase, (v) => phase = v, 1, "\xB0");
      if (d.id === "eclipses") {
        scalar("Year position", 0, 360, year, (v) => year = v, 5, "\xB0");
        scalar("Lunar orbit inclination", 0, 10, tilt = 5.145, (v) => tilt = v, 0.1, "\xB0");
        tabs(["Earth shadow → Moon", "Moon shadow → Earth"],i=>shadowBody=i?'moon':'earth');
        tabs(["Whole shadow cross-section", "Central detail ×20"],i=>centralZoom=!!i);
      } else tabs(["Synchronous rotation", "No axial rotation"], (i) => sync = i === 0);
    }
    advance=dt=>{if(dt<=0)return;if(d.id==='seasons3d'){day=Math.min(365,day+dt*10);dayControl.set(day);if(day===365)api.pause?.();}else if(phaseControl){phase=(phase+dt*15)%360;phaseControl.set(phase);}};
    update = () => {
      if (d.id === "seasons3d") {
        const L = 2 * Math.PI * (day - 80) / 365.25, E = [-2.1 * Math.cos(L), 0, -2.1 * Math.sin(L)], dir = [Math.cos(L), 0, Math.sin(L)], q = P.solarGeometry(day, lat, tilt);
        earth.position.set(...E);
        alignDay(earth, dir);
        sun?.position.set(0, 0, 0);
        moon.visible = false;
        if (shadow) shadow.visible = false;
        const a = tilt * P.DEG;
        axis.set([E.map((x, j) => x - [0, Math.cos(a), Math.sin(a)][j] * .95), E.map((x, j) => x + [0, Math.cos(a), Math.sin(a)][j] * .95)]);
        const sunLocal = new Vector3(...dir).applyAxisAngle(new Vector3(1, 0, 0), -a), lon = Math.atan2(sunLocal.z, sunLocal.x), p = lat * P.DEG, observer = new Vector3(Math.cos(p) * Math.cos(lon), Math.sin(p), Math.cos(p) * Math.sin(lon)).applyAxisAngle(new Vector3(1, 0, 0), a).multiplyScalar(.62).add(new Vector3(...E));
        mark?.position.copy(observer);
        const sunL=lon,rot=v=>new Vector3(...v).applyAxisAngle(new Vector3(1,0,0),a).multiplyScalar(.615).add(new Vector3(...E));
        opposite?.position.copy(rot([Math.cos(-p)*Math.cos(lon),Math.sin(-p),Math.cos(-p)*Math.sin(lon)]));
        [lat,-lat].forEach((latitude,j)=>{const h=P.solarGeometry(day,latitude,tilt).dayHours/24*Math.PI,ph=latitude*P.DEG;daylightArcs[j].set(Array.from({length:97},(_,k)=>{const l=sunL-h+2*h*k/96;return rot([Math.cos(ph)*Math.cos(l),Math.sin(ph),Math.cos(ph)*Math.sin(l)]).toArray();}));});
        nearMark && (nearMark.visible = false);
        report(`Day ${day.toFixed(1)}; latitude ${lat.toFixed(1)}\xB0; tilt ${tilt}\xB0; noon Sun ${q.noonAltitude.toFixed(1)}\xB0 high; daylight ${q.dayHours.toFixed(2)} h. Play advances 10 model days per animation second, stopping at day 365. Bodies are enlarged schematically; the axis stays parallel to itself. ${tilt === 0 ? "Zero tilt removes seasonal changes." : "Compare the opposite hemisphere at the same date."}`);
      } else if (d.id === "day-night") {
        orbit.object.visible = false;
        moon.visible = false;
        if (shadow) shadow.visible = false;
        sun?.position.set(2.4, 0, 0);
        const q = P.solarGeometry(80, lat, 0, hour), a = (hour - 12) * 15 * P.DEG, p = lat * P.DEG;
        mark?.position.set(0.74 * Math.cos(p) * Math.cos(a), 0.74 * Math.sin(p), 0.74 * Math.cos(p) * Math.sin(a));
        alignDay(earth, [1, 0, 0]);
        nearMark && (nearMark.visible = false);
        report(`Solar time ${hour.toFixed(2)} h; latitude ${lat.toFixed(1)}\xB0; equinox Sun altitude ${q.altitude.toFixed(1)}\xB0. ${q.altitude > 0 ? "The observer is in daylight." : "The observer is on the night side."} The distant sky appears to move in the opposite sense to Earth\u2019s turn.`);
      } else {
        const q = P.lunarGeometry(phase, year, d.id === "eclipses" ? tilt : 0), u = q.moonAngle, mp = q.moon.map((x) => x / 384400 * 2.1);
        sunlight.forEach((o, j) => moveArrow(o, q.sun.map((x, k) => x * 2.8 + (k === 1 ? j - 1 : 0)), q.sun.map((x, k) => x * 2.4 + (k === 1 ? j - 1 : 0))));
        orbit.set(Array.from({ length: 97 }, (_, j) => P.lunarGeometry(j / 96 * 360, 0, d.id === "eclipses" ? tilt : 0).moon.map((x) => x / 384400 * 2.1)));
        moon.position.set(...mp);
        alignDay(moon, q.sun);
        alignDay(earth, q.sun);
        sun?.position.set(...q.sun.map((x) => x * 3));
        mark?.position.set(0, 0, 0.74);
        axis.object.visible = false;
        const a = sync ? u + Math.PI : Math.PI;
        nearMark?.position.set(mp[0] + 0.24 * Math.cos(a), mp[1], mp[2] + 0.24 * Math.sin(a));
        if (shadow) {
          shadow.visible = d.id === "eclipses";
          const dir = new Vector3(...q.sun).negate();
          shadow.quaternion.setFromUnitVectors(new Vector3(0, -1, 0), dir);
          const cone=P.shadowGeometry(q.sun,[0,0,0],earthR,shadowLength);
          shadow.position.set(...cone.center);
        }
        if (moonShadow) {
          moonShadow.visible = d.id === "eclipses" && q.along > 0;
          const dir = new Vector3(...q.sun).negate();
          moonShadow.quaternion.setFromUnitVectors(new Vector3(0, -1, 0), dir);
          const cone=P.shadowGeometry(q.sun,mp,1737.4*earthScale,2.1,(695700+1737.4)/149597870);
          moonShadow.position.set(...cone.center);
        }
        report(d.id === "eclipses" ? `Illuminated fraction ${(q.lit * 100).toFixed(1)}%; Moon ${q.perpendicularKm.toFixed(0)} km from the Sun\u2013Earth axis. ${q.eclipse === "none" ? "No solar or umbral lunar intersection." : `${q.eclipse === "solar" ? "Solar" : "Lunar"} shadow intersection is possible.`} Play advances lunar angle 15° per animation second with the year fixed. Red nodes mark where the orbital planes meet. Overview bodies and shadow widths share a scale; the finite Sun is outside the view. The linked cut enlarges transverse distances as labelled; this is not a dated contact prediction.` : `Illuminated fraction ${(q.lit * 100).toFixed(1)}%. ${sync ? "The red near-side marker turns once per orbit and stays directed at Earth." : "The red marker keeps one direction in space; Earth sees changing sides."} Play advances lunar angle 15° per animation second. The unlit portion is the Moon\u2019s own night side.`);
      }
    };
    draw = () => {
      if (d.id === "seasons3d") {
        const q=P.seasonFootprint(day,lat,tilt);
        text(`Same date: +/− latitude ${Math.abs(lat).toFixed(1)}° · tilt ${tilt}°`,320,22,c.ink,13,'center');
        [q.north,q.south].forEach((v,j)=>{const x=170+j*300,flux=j?q.oppositeFlux:q.normalFlux,width=Math.min(200,35/Math.max(.02,flux));stroke([[x-width/2,110],[x+width/2,110]],j?c.green:c.proton,5);if(flux>0)for(const offset of [-width/2,0,width/2])stroke([[x+offset+40*Math.cos(v.noonAltitude*P.DEG),110-40*flux],[x+offset,110]],c.neutron);text(`${j?-lat:lat}°: ${v.dayHours.toFixed(2)} h daylight`,x,155,c.ink,12,'center');text(`Noon flux / normal ${flux.toFixed(2)}`,x,181,c.muted,12,'center');});
        text('Equal beam widths; footprints over the 200-pixel window are clipped.',320,213,c.muted,12,'center');
      } else if(d.id === "eclipses") {
        const q=P.lunarGeometry(phase,year,tilt),section=P.eclipseShadowSection(q,shadowBody),sourceName=shadowBody==='earth'?'Earth':'Moon',targetName=shadowBody==='earth'?'Moon':'Earth';
        const axisY=111,x0=52,axialScale=1500,transverseScale=125,farX=352,crossX=506,crossScale=centralZoom?6.25:125;
        const px=km=>x0+km/axialScale,py=km=>axisY-km/transverseScale;
        text(`${sourceName} shadow → ${targetName}: same selected alignment`,320,17,c.ink,13,'center');
        text('Profile: x 1 px = 1500 km; y 1 px = 125 km (×12 transverse)',35,34,c.muted,10);
        // Both penumbral edges and the signed central edges continue past a cone tip.
        ctx.save();ctx.beginPath();ctx.rect(35,41,335,146);ctx.clip();
        stroke([[x0,axisY],[farX,axisY]],c.rule,1);
        ctx.fillStyle=c.mark_soft;ctx.beginPath();section.profile.forEach((p,j)=>j?ctx.lineTo(px(p.axialKm),py(p.penumbraRadiusKm)):ctx.moveTo(px(p.axialKm),py(p.penumbraRadiusKm)));[...section.profile].reverse().forEach(p=>ctx.lineTo(px(p.axialKm),py(-p.penumbraRadiusKm)));ctx.closePath();ctx.fill();
        for(const sign of [-1,1]){
          stroke(section.profile.map(p=>[px(p.axialKm),py(sign*p.penumbraRadiusKm)]),c.muted,1.5);
          stroke(section.profile.map(p=>[px(p.axialKm),py(sign*p.centralSignedRadiusKm)]),c.ink,2);
        }
        ctx.fillStyle=c.electron;ctx.beginPath();ctx.ellipse(x0,axisY,section.sourceRadiusKm/axialScale,section.sourceRadiusKm/transverseScale,0,0,2*Math.PI);ctx.fill();
        // A target is drawn only at its actual downstream coordinate and radial offset.
        const targetX=px(section.targetDownstreamKm),targetY=py(section.targetOffsetKm);
        ctx.strokeStyle=c.proton;ctx.beginPath();ctx.ellipse(targetX,targetY,section.targetRadiusKm/axialScale,section.targetRadiusKm/transverseScale,0,0,2*Math.PI);ctx.stroke();
        if(section.targetDownstreamKm>0)stroke([[px(section.planeKm),42],[px(section.planeKm),185]],c.proton,1);
        ctx.restore();
        text('Pale outer band: penumbra. Inner solid edges: central shadow.',320,260,c.muted,12,'center');
        // When a target is outside this narrow cut, an edge marker reports its true offset.
        if(targetY-section.targetRadiusKm/transverseScale<41||targetX<35){const edgeX=P.clamp(targetX,48,345);stroke([[edgeX,59],[edgeX,44],[edgeX-4,50]],c.proton);}
        text(`0`,x0,201,c.muted,10);text('450,000 km anti-Sun →',farX,201,c.muted,10,'right');
        // Cross-section: target and every shadow radius use ONE transverse scale.
        ctx.save();ctx.beginPath();ctx.rect(403,41,206,146);ctx.clip();
        stroke([[406,axisY],[606,axisY]],c.rule,1);stroke([[crossX,43],[crossX,185]],c.rule,1);
        const disk=(cx,cy,r,color,alpha=1,fill=false)=>{ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);if(fill)ctx.fill();else ctx.stroke();ctx.globalAlpha=1;};
        disk(crossX,axisY,section.penumbraRadiusKm/crossScale,c.muted,.2,true);disk(crossX,axisY,section.penumbraRadiusKm/crossScale,c.muted);
        const centralR=Math.abs(section.centralSignedRadiusKm)/crossScale;
        disk(crossX,axisY,centralR,section.centralKind==='umbra'?c.ink:c.neutron,.3,true);disk(crossX,axisY,centralR,section.centralKind==='umbra'?c.ink:c.neutron);
        // The observed target circle is not shrunk to make an apparent overlap.
        if(section.targetDownstreamKm>0)disk(crossX,axisY-section.targetOffsetKm/crossScale,section.targetRadiusKm/crossScale,c.proton);
        if(section.targetDownstreamKm>0&&axisY-section.targetOffsetKm/crossScale<42){stroke([[crossX,axisY],[crossX,44],[crossX-4,51]],c.proton,1.5);}
        const wholeTargetWindow=section.targetRadiusKm>Math.hypot(103*crossScale,section.targetOffsetKm+74*crossScale);
        ctx.restore();
        text(`Cross-section: 1 px = ${crossScale} km${centralZoom?' (×20)':''}`,506,34,c.muted,10,'center');
        if(section.targetDownstreamKm>0&&wholeTargetWindow)text('Target covers this entire window',506,181,c.proton,10,'center');
        text(`${section.centralKind} r=${Math.abs(section.centralSignedRadiusKm).toFixed(0)} km`,506,204,c.ink,11,'center');
        text(`penumbra r=${section.penumbraRadiusKm.toFixed(0)} km`,506,219,c.muted,10,'center');
        text(`Target offset ${section.targetOffsetKm.toFixed(0)} km; ${section.targetDownstreamKm<=0?'upstream of shadow':section.intersects?'shadow intersection':'misses shadow'}`,35,219,c.proton,11);
        text(`${section.targetDownstreamKm>0?'Target plane':'Reference plane (target upstream)'} ${section.planeKm.toFixed(0)} km; red target r=${section.targetRadiusKm.toFixed(0)} km. Cropped edges stay at stated scale.`,320,237,c.muted,10,'center');
      } else if(d.id==='moon-rotation') {
        const u=P.lunarGeometry(phase,year,0).moonAngle,a=sync?u+Math.PI:Math.PI;
        const mx=330+110*Math.cos(u),my=120-78*Math.sin(u);
        text(sync?'Marked face turns once per orbit':'No axial turn: marked face keeps one direction',320,22,c.ink,14,'center');
        stroke(Array.from({length:97},(_,j)=>[330+110*Math.cos(j/96*2*Math.PI),120-78*Math.sin(j/96*2*Math.PI)]),c.rule);
        plotDot(330,120,c.electron,18);text('Earth',330,180,c.ink,13,'center');
        plotDot(mx,my,c.muted,9);stroke([[mx,my],[mx+27*Math.cos(a),my-27*Math.sin(a)]],c.proton,4);
        plotDot(mx+10*Math.cos(a),my-10*Math.sin(a),c.proton,4);
        text('Red mark: same lunar face',40,58,c.proton,12);text('Sunlight ←',565,120,c.neutron,13,'center');
        text('Top-down orbital view; body sizes and orbit gap are schematic.',320,218,c.muted,12,'center');
      } else {
        const q = P.lunarGeometry(phase, year, d.id === "eclipses" ? tilt : 0);
        text("Side view: actual Earth/Moon size ratio; gap compressed", 320, 25, c.muted, 12, "center");
        stroke([[40, 120], [600, 120]], c.rule);
        plotDot(320, 120, c.electron, 18);
        const x = 320 + 200 * q.along / 384400, y = 120 - q.moon[1] / 34472 * 80;
        plotDot(x, y, c.proton, 5);
        stroke([[320, 120], [x, y]], c.rule, 1);
        text(`Lunar height ${(q.moon[1] / 1e3).toFixed(1)} thousand km`, 40, 213);
        text(`Lit ${(q.lit * 100).toFixed(1)}%`, 600, 213, c.ink, 14, "right");
      }
    };
  }
  function tides() {
    label3("Earth", [0, 1.1, 0]);
    let phase = 0, relative = true, sunOn = true;
    label3("differential arrows",()=>relative?[0,-1.2,0]:[0,-20,0],c.proton);
    label3("absolute lunar pull",()=>relative?[0,-20,0]:[0,-1.2,0],c.proton);
    ball(0, 0, 0, 0.85, c.electron);
    const moon = ball(2.6, 0, 0, 0.2, c.muted), points = Array.from({ length: 72 }, (_, i) => {
      const a = i % 24 / 24 * 2 * Math.PI, l = (Math.floor(i / 24) - 1) * 45 * P.DEG;
      return [0.92 * Math.cos(a) * Math.cos(l), 0.92 * Math.sin(l), 0.92 * Math.sin(a) * Math.cos(l)];
    }), as = points.map((p) => arrow(p, p, c.proton));
    const clock=scalar("Moon orbital angle", 0, 360, phase, (v) => phase = v, 5, "\xB0");
    tabs(["Relative to Earth\u2019s centre", "Absolute lunar pull"], (i) => relative = i === 0);
    const sunControl=button("Include / remove Sun", () => sunOn = !sunOn);
    advance=dt=>{if(dt>0){phase=(phase+dt*15)%360;clock.set(phase);}};
    update = () => {
      sunControl.disabled=!relative;teach(relative?d.explanation:'The Moon pulls every part of Earth towards itself. The near side is pulled harder than the centre; the far side less hard. Subtract the centre’s acceleration to reveal the two outward relative pulls. The graph below always shows the differential equilibrium pattern.');
      const a = phase * P.DEG, M = [3844e5 * Math.cos(a), 3844e5 * Math.sin(a), 0];
      moon?.position.set(2.6 * Math.cos(a), 2.6 * Math.sin(a), 0);
      points.forEach((p, j) => {
        const real = p.map((x) => x / 0.92 * 6371e3), v = relative ? P.tidalAcceleration(real, M) : M.map((x, k) => 49048695e5 * (x - real[k]) / P.length(M.map((x2, k2) => x2 - real[k2])) ** 3);
        if (relative && sunOn) {
          const s = P.tidalAcceleration(real, [149597870700, 0, 0], 13271244e13);
          v.forEach((x, k) => v[k] += s[k]);
        }
        const scale = relative ? 8e5 : 3e4;
        moveArrow(as[j], p, p.map((x, k) => x + v[k] * scale));
      });
      const near = P.tidalAcceleration(M.map((x) => x / P.length(M) * 6371e3), M);
      report(`${relative ? "Differential" : "Absolute"} pull shown. Near-side differential acceleration ${P.length(near).toExponential(2)} m/s\xB2. ${sunOn ? "Sun contribution included in differential view." : "Sun contribution omitted."} Play advances the Moon 15° per animation second. Arrows use separately enlarged scales; this is not a Haji Ali tide forecast.`);
    };
    draw = () => {
      axes("angle around Earth / degrees", "differential tide: Moon-only peak = 1",{x:[0,360],y:[-1.5,1.5]});
      curve((u) => 0.5 + (Math.cos(4 * Math.PI * u - 2 * phase * P.DEG) + (sunOn ? 0.46 * Math.cos(4 * Math.PI * u) : 0))/3);
      text("Aligned solar and lunar patterns add; quarter-phase patterns reduce.", 320, 47, c.ink, 12, "center");
    };
  }
  function photo() {
    label3("photons", [-1.6, 1.1, 0], c.neutron);
    label3("calcium", [0.2, 1, 0]);
    label3("collector", [1.8, 1, 0], c.electron);
    let nm = 380, flux = 500, V = 0;
    box(0.2, 0, 0, 0.1, 1.4, 1, c.muted);
    box(1.8, 0, 0, 0.1, 1.4, 1, c.electron);
    const photons = Array.from({ length: 16 }, (_, j) => ball(0, (j % 4 - 0.5) * 0.18, (Math.floor(j / 4) - 1.5) * 0.15, 0.055, c.neutron));
    const electrons = Array.from({ length: 12 }, (_, j) => ball(0, (j % 4 - 1.5) * 0.2, 0.2, 0.045, c.electron));
    scalar("Wavelength", 300, 800, nm, (v) => nm = v, 5, " nm");
    scalar("Photon flux", 0, 1e3, flux, (v) => flux = v, 25, " photons/s");
    scalar("Retarding voltage", 0, 2, V, (v) => V = v, 0.05, " V");
    update = () => {
      const q = P.photoelectric(nm, flux, V);
      photons.forEach((o, j) => {
        if (o) {
          o.visible = j < Math.ceil(flux / 1e3 * 16);
          o.position.x = -2.5 + (tick * 0.5 + j / 16) % 1 * 2.65;
        }
      });
      electrons.forEach((o, j) => {
        if (o) {
          o.visible = j < Math.ceil(q.electronsPerSecond / 1e3 * 12);
          o.position.x = 0.3 + (tick * 0.45 + j / 12) % 1 * 1.4;
        }
      });
      report(`Each photon ${q.energy.toFixed(2)} eV; calcium threshold 2.71 eV. Maximum electron KE ${q.maxKE.toFixed(2)} eV; stopping potential ${q.stoppingV.toFixed(2)} V. ${q.electronsPerSecond.toFixed(0)} electrons/s collected (${(q.currentA / 1e-15).toFixed(3)} fA in the ideal model).`);
    };
    draw = () => {
      const q = P.photoelectric(nm, flux, V);
      bar(`Photon energy: ${q.energy.toFixed(2)} eV`, q.energy, 4.2, 45, 65, c.neutron);
      bar("Work function: 2.71 eV", 2.71, 4.2, 350, 65, c.muted);
      bar(`Maximum KE: ${q.maxKE.toFixed(2)} eV`, q.maxKE, 4.2, 45, 150, c.electron);
      bar(`Retarding barrier: ${V.toFixed(2)} eV/electron`, V, 4.2, 350, 150, c.proton);
      text("All bars share one energy scale. Flux changes counts, not energy per photon.", 320, 220, c.ink, 13, "center");
    };
  }
  function atomRadiation() {
    let ratio = 5, time = 0, mode = 0, source = true;
    const sample = box(0, 0, -0.1, 1.6, 1.4, 0.2, c.sheet, root, 0.6), beamSource = box(-2, 0, 0, 0.35, 0.6, 0.5, c.ink), beam = line([[-1.8, 0, 0], [1.8, 0, 0]], c.neutron);
    const cloud = ball(0, 0, 0, 1.3, c.electron, root, 0.1), nucleus = ball(0, 0, 0, 0.1, c.proton);
    const dots = Array.from({ length: 100 }, (_, j) => ball(-1.5 + j % 10 * 0.33, -0.8 + Math.floor(j / 10) * 0.17, 0, 0.055, c.proton));
    const rng = api.rng(1939), death = Array.from({ length: 100 }, () => -2 * Math.log(Math.max(rng(), 1e-12)) / Math.LN2);
    let survived = 100,clock,beamControl;
    label3("beam source",()=>d.id==='radiation-decay'&&mode>0?[-2,.6,0]:[0,-20,0]);
    label3("radioactive dust",()=>d.id==='radiation-decay'&&mode===2?[0,.9,0]:[0,-20,0],c.proton);
    if (d.id === "atom-scale") {
      label3('electron probability cloud',[0,1.6,0],c.electron);
      scalar("Nucleus displayed diameter", 1, 10, ratio, (v) => ratio = v, 0.5, " cm");
      tabs(["Compare reference lengths", "Common scale: nucleus unresolved"], (i) => mode = i);
    } else {
      clock=scalar("Elapsed model time", 0, 12, time, (v) => time = v, 0.1, " s");
      tabs(["Radioactive material", "External beam", "Dust on surface"], (i) => mode = i);
      beamControl=button("Switch beam on / off", () => source = !source);
      button('Replay decay sample',()=>{time=0;clock.set(time);api.pause?.();});
      advance=dt=>{if(dt>0&&mode!==1){time=Math.min(12,time+dt);clock.set(time);if(time===12)api.pause?.();}};
    }
    update = () => {
      if (d.id === "atom-scale") {
        if (sample) sample.visible = false;
        if (beamSource) beamSource.visible = false;
        beam.object.visible = false;
        dots.forEach((o) => o && (o.visible = false));
        if (nucleus) nucleus.scale.setScalar(mode ? 13e-5 : ratio/5);
        if(cloud)cloud.scale.setScalar(mode?1:ratio/5);
        report(`A nucleus ${ratio.toFixed(1)} cm across corresponds to an atom about ${(ratio * 1e3).toFixed(0)} m across at the chosen 10\u2075 diameter ratio. ${mode ? "At the common scale the nucleus is too small to resolve." : "The red nucleus marker is enlarged separately."} The blue cloud is a symbolic probability region, not an electron orbit.`);
        return;
      }
      cloud && (cloud.visible = false);
      nucleus && (nucleus.visible = false);
      playback(mode!==1);clock.input.disabled=mode===1;beamControl.disabled=mode===0;
      teach(mode===1?'Radiation arriving from a distant beam can transfer energy to an object without leaving radioactive material on it. In this exposure-only model, switching the beam off ends the exposure; the object has no continuing radioactive source.':mode===2?'Radioactive dust leaves unstable parent nuclei on the surface. Switching off a distant beam does not remove those nuclei: they can keep emitting until they decay or the dust is removed. The count falls randomly, while the curve shows an ensemble expectation.':d.explanation);
      if (sample) sample.visible = mode > 0;
      if (beamSource) beamSource.visible = mode > 0;
      beam.object.visible = mode > 0 && source;
      survived = death.slice(0,mode===2?24:100).filter((x) => x > time).length;
      dots.forEach((o, j) => {
        if (o) {
          o.visible = mode === 0 || mode === 2 && j < 24;
          if (mode === 2) o.position.set(-0.6 + j % 6 * 0.23, -0.5 + Math.floor(j / 6) * 0.3, 0.1);
          else o.position.set(-1.5 + j % 10 * 0.33, -0.8 + Math.floor(j / 10) * 0.17, 0);
          o.material.color.set(death[j] > time ? c.proton : c.rule);
        }
      });
      report(mode === 0 ? `Simulated sample: ${survived} of 100 radioactive nuclei remain at ${time.toFixed(1)} model s; expectation ${P.decay(100, 2, time).toFixed(1)}. Play advances 1 model second per animation second and stops at 12; Replay repeats this seeded sample. Individual decay times are random, not appointments at one half-life.` : mode === 1 ? `External beam ${source ? "on: exposure while radiation arrives" : "off: no continuing source remains on the object"}. Exposure alone does not leave radioactive material; no decay curve is assigned to this object.` : `Radioactive dust stays on the surface when the distant beam is switched ${source ? "on" : "off"}. ${survived} of 24 parent nuclei remain at ${time.toFixed(1)} model s. ${survived?'They can continue emitting as they decay.':'This simulated sample has no radioactive parent nuclei left.'} Play advances the labelled decay clock; Replay repeats the same sample.`);
    };
    draw = () => {
      if (d.id === "atom-scale") {
        const nucleusPx=ratio*24,atomKm=ratio;
        text(`Red nucleus reference: ${ratio.toFixed(1)} cm; blue atom reference: ${atomKm.toFixed(1)} km. Ruler units differ.`,320,25,c.ink,13,'center');
        stroke([[55,75],[55+nucleusPx,75]],c.proton,5);
        stroke([[55,145],[55+atomKm*24,145]],c.electron,5);
        text('Ruler units differ by 10⁵; common-scale mode leaves nucleus unresolved.',320,220,c.muted,12,'center');
      } else if(mode===1){
        text(source?'External beam on: radiation reaches the object':'External beam off: exposure stops',320,28,c.ink,15,'center');
        ctx.strokeStyle=c.ink;ctx.strokeRect(75,80,65,95);ctx.strokeRect(435,80,110,95);
        text('source',108,200,c.ink,14,'center');text('object',490,200,c.ink,14,'center');
        if(source){stroke([[150,125],[425,125]],c.neutron,4);stroke([[412,117],[425,125],[412,133]],c.neutron,3);}
        text('No radioactive material is left on the object in this comparison.',320,235,c.muted,12,'center');
      } else {
        const n=mode===2?24:100;
        axes("model time / seconds", "radioactive parent nuclei remaining",{x:[0,12],y:[0,n]});
        curve((u) => P.decay(n, 2, u * 12) / n);
        plotDot(55 + time / 12 * 550, 195 - survived / n * 145);
        text(mode===2?`Dust remains; distant beam ${source?'on':'off'}. Dot: seeded sample.`:"Curve: ensemble expectation. Dot: this seeded sample.", 320, 45, c.muted, 12, "center");
      }
    };
  }
  function sunHalo() {
    if (d.id === "halo") {
      ball(-2.2, 0, 0, 0.18, c.neutron);
      ball(2.2, 0, 0, 0.1, c.electron);
      label3("Sun direction", [-2.2, 0.55, 0], c.neutron);
      label3("Earth direction", [2.2, 0.55, 0], c.electron);
      label3("L1 vicinity", [0, -0.9, 0]);
      arrow([0, -0.4, 0], [-1.2, -0.4, 0], c.neutron);
      arrow([0, -0.4, 0.1], [0.08, -0.4, 0.1], c.electron);
    } else {
      label3("core", [0, -0.5, 0.3], c.proton);
      label3("radiative layer", [0.7, 0.8, 0]);
      label3("convective layer", [-0.6, 1.3, 0]);
    }
    let amount = 1, progress = 0, distance = 1.5, days = 0, haloClock;
    const shell = mesh(new SphereGeometry(1.4, 30, 22, 0, Math.PI), c.neutron, root, 0.35), radiative = mesh(new SphereGeometry(1, 26, 20, 0, Math.PI), c.proton, root, 0.35), core = ball(0, 0, 0, 0.4, c.proton);
    const craft = box(0, 0, 0, 0.18, 0.15, 0.16, c.ink);
    const random = api.rng(1938), walkPoints = [[0.15, 0, 0]];
    for (let j = 0; j < 1500; j++) {
      const last = walkPoints.at(-1), step = [random() - 0.5, random() - 0.5, random() - 0.5], n = P.length(step), next = last.map((x, k) => x + step[k] / n * 0.1);
      walkPoints.push(next);
      if (P.length(next) >= 0.94) break;
    }
    const randomWalk = line(walkPoints, c.neutron), packet = ball(0.15, 0, 0, 0.045, c.neutron), parcels = Array.from({ length: 8 }, () => ball(0, 0, 0, 0.06, c.proton)), escaping = Array.from({ length: 12 }, () => ball(0, 0, 0, 0.035, c.neutron));
    const haloPoints=Array.from({length:181},(_,j)=>P.haloPoint(j/180*177.86)),halo=line(haloPoints,c.electron);
    if (d.id === "halo") {
      scalar("Distance from Earth", 1.2, 1.8, distance, (v) => distance = v, 0.01, " million km");
      haloClock=scalar("Halo model day", 0, 177.86, days, (v) => days = v, .01);
      advance=dt=>{days=(days+5*dt)%177.86;haloClock.set(days);};
    } else {
      scalar("Hydrogen fused", 0.1, 10, amount, (v) => amount = v, 0.1, " kg");
      api.slider("Transport stage", {min:0,max:3,value:progress,step:1,fmt:v=>['Core production','Radiative transport','Convective transport','Surface emission'][Math.round(v)],onInput:v=>{progress=v;refresh();}});
    }
    update = () => {
      randomWalk.object.visible = d.id === "solar-fusion" && progress === 1;
      if (packet) packet.visible = d.id === "solar-fusion" && progress === 1;
      parcels.forEach((o) => o && (o.visible = d.id === "solar-fusion" && progress === 2));
      escaping.forEach((o) => o && (o.visible = d.id === "solar-fusion" && progress === 3));
      if (d.id === "halo") {
        shell && (shell.visible = false);
        radiative && (radiative.visible = false);
        core && (core.visible = false);
        const a = days / 177.86 * 2 * Math.PI;
        craft?.position.set(...P.haloPoint(days));
        const q = P.l1Balance(distance * 1e9);
        report(`At ${distance.toFixed(2)} million km sunward of Earth: Sun pull ${q.sunPull.toFixed(6)} m/s\xB2, Earth\u2019s opposing pull ${q.earthPull.toFixed(6)}; net ${q.netInward.toFixed(6)} versus ${q.needed.toFixed(6)} needed for Earth\u2019s year. Gravity is not zero. Distance control independently inspects the force account; it does not relocate the schematic halo. Halo day ${days.toFixed(1)}: linked projections share the same craft point. Play advances 5 model days/s around this repeating 177.86-day schematic path, not a mission ephemeris.`);
      } else {
        playback(progress>0);
        halo.object.visible = false;
        if (craft) craft.visible = false;
        const q = P.massEnergy(amount);
        if (shell) shell.material.opacity = progress >= 2 ? 0.35 : 0.12;
        if (radiative) radiative.material.opacity = progress >= 1 ? 0.25 : 0.1;
        if (packet) {
          const index = Math.floor(tick * 8) % walkPoints.length;
          packet.position.set(...walkPoints[index]);
        }
        parcels.forEach((o, j) => {
          if (!o) return;
          const a = j / 8 * 2 * Math.PI, t = tick * 0.8 + j, r = 1.15 + 0.14 * Math.cos(t), tangent = 0.12 * Math.sin(t);
          o.position.set(r * Math.cos(a) - tangent * Math.sin(a), r * Math.sin(a) + tangent * Math.cos(a), 0.2 * Math.sin(t));
          o.material.color.set(Math.sin(t) < 0 ? c.proton : c.electron);
        });
        escaping.forEach((o, j) => {
          if (!o) return;
          const a = j / 12 * 2 * Math.PI, r = 1.42 + (tick * 0.35 + j / 12) % 1 * 0.8;
          o.position.set(r * Math.cos(a), r * Math.sin(a), 0.18 * Math.sin(j));
        });
        report(`Fusing ${amount.toFixed(1)} kg of hydrogen: ${(q.fraction * 100).toFixed(3)}% of the starting atomic mass becomes released energy, ${q.energyJ.toExponential(3)} J. Stage ${progress}: ${["core production", "radiative transport", "convective transport", "surface emission"][progress]}. ${progress === 1 ? "Yellow packet: a spatially magnified random walk." : progress === 2 ? "Red outward parcels and blue return parcels show schematic convection." : progress === 3 ? "Outward yellow markers represent surface emission." : "The account includes the net reaction, not chemical burning."} Transport times and particle sizes are schematic.`);
      }
    };
    draw = () => {
      if (d.id === "halo") {
        const point=P.haloPoint(days),pairs=[[0,1],[0,2],[1,2]];
        text('Schematic halo: linked projections, same day and craft point',320,23,c.ink,13,'center');
        pairs.forEach(([a,b],j)=>{const x=110+j*210;stroke([[x-75,120],[x+75,120]],c.rule);stroke([[x,45],[x,190]],c.rule);stroke(haloPoints.map(v=>[x+v[a]*95,120-v[b]*95]),c.electron);plotDot(x+point[a]*95,120-point[b]*95,c.proton,5);text(['xy','xz','yz'][j],x,218,c.ink,13,'center');});
      } else {
        const q = P.massEnergy(amount);
        bar("Starting hydrogen mass", amount, amount, 45, 70, c.neutron, 550);
        bar("Released fraction: enlarged \xD7100", q.releasedKg * 100, amount, 45, 160, c.proton, 550);
        text("Net account: 4 protons + 2 electrons \u2192 helium nucleus + 2 neutrinos + energy", 320, 220, c.ink, 12, "center");
      }
    };
  }
  function spectrum() {
    label3("hydrogen nuclei", [0, 1.2, 0], c.proton);
    label3("bound: paired icons / free: lower row", [0, -1.8, 0], c.electron);
    let T = 9e3, abundance = 1;
    const ions = Array.from({ length: 32 }, (_, j) => ball((j % 8 - 3.5) * 0.4, (Math.floor(j / 8) - 1.5) * 0.45, 0, 0.1, c.proton)), electrons = ions.map((_, j) => ball((j % 8 - 3.5) * 0.4 + 0.15, (Math.floor(j / 8) - 1.5) * 0.45, 0.1, 0.035, c.electron));
    scalar("Temperature", 3500, 25e3, T, (v) => T = v, 250, " K");
    scalar("Hydrogen abundance", 0.1, 2, abundance, (v) => abundance = v, 0.1, " relative");
    update = () => {
      const q = P.hydrogenLinePopulation(T, 1e20, abundance);
      electrons.forEach((o, j) => {
        if (o) {
          const bound = j / 32 < q.neutral;
          o.position.x = bound ? (j % 8 - 3.5) * .4 + .15 : (j % 16 - 7.5) * .19;
          o.position.y = bound ? (Math.floor(j / 8) - 1.5) * .45 : -1.1-Math.floor(j / 16)*.2;
        }
      });
      report(`At ${T} K, neutral hydrogen ${(100 * q.neutral).toFixed(2)}%; ionised ${(100 * q.ionised).toFixed(2)}%. Fraction in the n=2 lower level ${q.n2.toExponential(2)}; abundance ${abundance.toFixed(1)}\xD7. Line strength depends on both population and abundance. Static population icons are not electron trajectories; lower-row electrons are unbound.`);
    };
    draw = () => {
      const q = P.hydrogenLinePopulation(T, 1e20, abundance), strength = P.clamp(q.lineProxy / 7e-6, 0, 1), grad = ctx.createLinearGradient(55, 0, 605, 0);
      ["#c9362b", "#e2b831", "#58a865", "#467cba", "#8159ae"].forEach((col, j) => grad.addColorStop(j / 4, col));
      ctx.fillStyle = grad;
      ctx.fillRect(55, 60, 550, 55);
      for (const wl of [656.3, 486.1, 434, 410.2]) {
        const x = 55 + (750 - wl) / 350 * 550;
        ctx.fillStyle = `rgba(0,0,0,${strength * 0.9})`;
        ctx.fillRect(x - 2, 60, 4, 55);
      }
      text("750 nm", 55, 139);
      text("400 nm", 605, 139, c.ink, 14, "right");
      text("Balmer line-depth proxy, with a normalised colour background", 320, 260, c.muted, 12, "center");
      stroke(Array.from({ length: 101 }, (_, i) => [55 + i * 5.5, 220 - P.clamp(P.hydrogenLinePopulation(3500 + i * 215).lineProxy / 7e-6, 0, 1) * 35]), c.electron);
      plotDot(55+(T-3500)/21500*550,220-P.clamp(P.hydrogenLinePopulation(T).lineProxy/7e-6,0,1)*35,c.proton,4);
      text('3500 K',55,239,c.muted,11);text('Temperature → 25000 K; abundance fixed at 1',605,239,c.muted,11,'right');
    };
  }
  function distances() {
    let pc = 10, period = 10, mode = 0, baseline = 1, timeDays=0;
    label3("baseline / Earth",()=>mode?[0,-20,0]:[-1.8,-.8,0],c.electron);
    label3("star",()=>mode?[0,.5,0]:[1.8,.5,0],c.neutron);
    const earth = ball(-1.8, 0, 0, 0.13, c.electron), star = ball(1.8, 0, 0, 0.18, c.neutron);
    const triangle=line(P.distanceGeometry(pc,baseline,period,timeDays).positions,c.rule);
    scalar("Distance", 1, 200, pc, (v) => pc = v, 1, " pc");
    const periodControl=scalar("Cepheid period", 2, 40, period, (v) => period = v, 1, " days");
    const baselineControl=scalar("Parallax baseline", 0.1, 2, baseline, (v) => baseline = v, 0.1, " AU");
    const timeControl=scalar("Cepheid elapsed time",0,80,timeDays,v=>timeDays=v,.1," days");
    tabs(["Parallax and uncertainty", "Cepheid brightness"], (i) => mode = i);
    button("Replay Cepheid clock",()=>{timeDays=0;timeControl.set(0);api.pause?.();});
    advance=dt=>{if(dt>0&&mode){timeDays=Math.min(80,timeDays+dt*2);timeControl.set(timeDays);if(timeDays===80)api.pause?.();}};
    update = () => {
      playback(!!mode);periodControl.input.disabled=!mode;timeControl.input.disabled=!mode;baselineControl.input.disabled=!!mode;
      const q = P.parallax(pc, baseline), cph = P.cepheid(period, pc);
      const geometry=P.distanceGeometry(pc,baseline,period,timeDays);triangle.object.visible=!mode;if(earth)earth.visible=!mode;triangle.set(geometry.positions);star?.position.set(...(mode?[0,0,0]:geometry.star));
      if(star){star.scale.setScalar(mode?1+.1*Math.sin(2*Math.PI*geometry.phase):1);star.material.color.set(c.neutron);if(mode)star.material.color.multiplyScalar(.55+.45*geometry.normalisedFlux/1.3);}
      report(mode ? `Cepheid period ${period} days gives illustrative absolute magnitude ${cph.absoluteMagnitude.toFixed(2)}; at ${pc} pc, apparent magnitude ${cph.apparentMagnitude.toFixed(2)}. Elapsed ${timeDays.toFixed(1)} days, phase ${geometry.phase.toFixed(3)}, received flux ${geometry.flux.toPrecision(3)}. Mean flux gives d = sqrt(calibrated luminosity / mean flux). Star pulse and graph share this clock; icon radius and colour are schematic, while the flux readout is quantitative. Doubling distance quarters received flux. Play advances 2 model days/s and stops at day 80; Replay returns to day 0.` : `At ${pc} pc, parallax ${q.arcsec.toFixed(4)} arcseconds; with \xB10.001\u2033 uncertainty the relative distance uncertainty is about ${(q.relativeError * 100).toFixed(1)}%. Beyond a small enough angle, measurement noise dominates. The responsive triangle uses exaggerated angles and logarithmic distance for visibility; numerical parallax uses the actual AU/pc ratio.`);
    };
    draw = () => {
      if (mode) {
        const q = P.cepheid(period, pc);
        axes('time / days', "flux / selected mean",{x:[0,period],y:[.5,1.5],reference:1});
        curve((u) => 0.5 + 0.3 * Math.sin(2 * Math.PI * u));
        const geometry=P.distanceGeometry(pc,baseline,period,timeDays);plotDot(55+geometry.phase*550,195-(.5+.3*Math.sin(2*Math.PI*geometry.phase))*145,c.proton);
        text(`Mean received flux ${q.relativeFlux.toPrecision(3)} relative units`, 320, 47, c.ink, 13, "center");
        text(`Peak ${(q.relativeFlux * 1.3).toPrecision(3)} \xB7 minimum ${(q.relativeFlux * 0.7).toPrecision(3)}`, 320, 260, c.muted, 12, "center");
      } else {
        axes("distance / parsecs", "parallax / arcseconds",{x:[1,200],y:[0,2],xticks:[1,100,200]});
        curve((u) => baseline / (1 + u * 199) / 2);
        const p = P.parallax(pc, baseline);
        plotDot(55 + (pc - 1) / 199 * 550, 195 - p.arcsec / 2 * 145);
        text(`p = ${p.arcsec.toFixed(4)}\u2033 \xB1 0.001\u2033`, 320, 47, c.ink, 16, "center");
      }
    };
  }
  function dwarfCosmos() {
    let mass = 0.6, initial = 1, scale = 1, home = 0, wavelengthView = false;
    const dwarf = ball(0, 0, 0, 1, c.sheet), points = [[-1, -1, -1], [1, 0, 0], [0, 1, 1], [-1, 1, 0], [1, -1, 1], [0, 0, -1]], galaxies = points.map((p) => ball(...p, 0.18, c.neutron));
    fixedViewRadius=d.id==='cosmos'?Math.max(...[0,1,2].flatMap(home=>P.expansion(points,home,3).relative.map(p=>P.length(p)*.65)))+.2:P.whiteDwarf(.2).radiusKm/1e4+.2;
    if(d.id==='cosmos')label3('observer galaxy',[0,.4,0],c.proton);
    if (d.id === "white-dwarf") {
      scalar("Final core mass", 0.2, 1.5, mass, (v) => mass = v, 0.02, " solar masses");
      scalar("Initial star mass (comparison)", 1, 20, initial, (v) => initial = v, 1, " solar masses");
    } else {
      scalar("Cosmic scale factor", 1, 3, scale, (v) => scale = v, 0.05);
      tabs(["Observe galaxy 1", "Observe galaxy 2", "Observe galaxy 3"], (i) => home = i);
      button("Compare stretched wavelength", () => wavelengthView = !wavelengthView);
    }
    update = () => {
      if (d.id === "white-dwarf") {
        galaxies.forEach((o) => o && (o.visible = false));
        const q = P.whiteDwarf(mass);
        if (dwarf) {
          dwarf.visible = q.stable;
          dwarf.scale.setScalar(q.radiusKm / 1e4);
        }
        report(`Selected initial mass ${initial} Suns; independently selected final core mass ${mass.toFixed(2)} Suns. ${q.stable ? `Ideal white-dwarf radius ${q.radiusKm.toFixed(0)} km; mean density ${(mass * 198847e25 / (4 * Math.PI / 3 * (q.radiusKm * 1e3) ** 3)).toExponential(2)} kg/m\xB3. More core mass gives a smaller radius.` : "No stable white dwarf in this model at or above 1.44 solar masses; the radius formula has reached its limit."} Initial mass is not the final core mass.`);
      } else {
        if (dwarf) dwarf.visible = false;
        const q = P.expansion(points, home, scale);
        galaxies.forEach((o, j) => {
          if (o) {o.position.set(...q.relative[j].map((x) => x * 0.65));o.material.color.set(j===home?c.proton:c.neutron);}
        });
        report(`Observer galaxy ${home + 1}; scale factor ${scale.toFixed(2)}. Each separation is multiplied by ${scale.toFixed(2)}; individual galaxy sizes stay fixed. The camera scale also stays fixed; markers are enlarged for visibility. With H = 70 km/s/Mpc, all observers find v = H d. Wavelength ratio \u03BB/\u03BB\u2080 = ${scale.toFixed(2)}, redshift z = ${(scale - 1).toFixed(2)}.`);
      }
    };
    draw = () => {
      if (d.id === "white-dwarf") {
        axes("core mass / solar masses", "radius / km",{x:[.2,1.44],y:[0,20000],xticks:[.2,.8,1.44]});
        curve((u) => P.whiteDwarf(0.2 + 1.239 * u).radiusKm / 2e4);
        if (mass < 1.44) plotDot(55 + (mass - 0.2) / 1.24 * 550, 195 - P.whiteDwarf(mass).radiusKm / 2e4 * 145);
        text("The limiting zero radius is a breakdown of the stable model.", 320, 47, c.muted, 12, "center");
      } else if (wavelengthView) {
        axes("distance / initial wavelength", "schematic unit-amplitude displacement",{x:[0,4],y:[-1,1]});
        curve((u) => 0.5 + 0.5 * Math.sin(u * 8 * Math.PI / scale), c.electron);
        text(`Wavelength ratio ${scale.toFixed(2)} \xB7 z = ${(scale - 1).toFixed(2)}`, 320, 47, c.ink, 16, "center");
        text("The fixed viewing window contains fewer crests as wavelength stretches.", 320, 225, c.muted, 12, "center");
      } else {
        axes("distance / Mpc", "recession / km s\u207B\xB9",{x:[0,9],y:[0,630]});
        curve((u) => u);
        const q = P.expansion(points, home, scale);
        q.distances.forEach((x) => plotDot(55 + x / 9 * 550, 195 - x / 9 * 145, c.electron));
        text("Choose a different observer; the slope remains H.", 320, 47, c.ink, 13, "center");
      }
    };
  }
  function foucault() {
    let lat=19.08,hours=6;
    const globe=group();ball(-1.8,0,0,.65,c.electron,globe);line([[-1.8,-.9,0],[-1.8,.9,0]],c.ink,globe);
    const meridian=circle(.66,c.rule,globe);meridian.object.rotation.x=Math.PI/2;meridian.object.position.x=-1.8;
    const site=ball(0,0,0,.06,c.proton),globalSwing=arrow([0,0,0],[0,0,0],c.proton),basis=Array.from({length:3},()=>arrow([0,0,0],[0,0,0],c.green));
    box(.9,-.6,0,2,.05,2,c.rule);const trace=line([[0,0,0],[0,0,0]],c.proton),bob=ball(0,0,0,.1,c.ink),string=line([[0,0,0],[0,0,0]],c.ink);
    label3('Earth axis',[-1.8,1.05,0]);label3('same swing: world',[.3,1.4,0],c.proton);label3('local N',[.9,-.55,-1.2]);
    let latitudeTabs;
    const latitudeControl=scalar('Latitude',-90,90,lat,v=>{lat=v;latitudeTabs?.setActive?.(-1);},1,'°');const clock=scalar('Elapsed time',0,48,hours,v=>hours=v,.25,' h');latitudeTabs=tabs(['Mumbai 19.08°','Equator','North pole'],i=>{lat=[19.08,0,90][i];latitudeControl.set(lat);});
    button('Replay precession clock',()=>{hours=0;clock.set(0);api.pause?.();});
    advance=dt=>{if(dt>0){hours=Math.min(48,hours+.5*dt);clock.set(hours);if(hours===48)api.pause?.();}};
    update=()=>{const q=P.foucaultGeometry(lat,hours),pos=P.add([-1.8,0,0],P.scale(q.up,.69));site?.position.set(...pos);meridian.object.rotation.y=q.longitude;
      [q.east,q.north,q.up].forEach((v,j)=>moveArrow(basis[j],pos,P.add(pos,P.scale(v,.3))));moveArrow(globalSwing,P.add(pos,P.scale(q.world,-.45)),P.add(pos,P.scale(q.world,.45)));
      const swing=[q.local[0],0,-q.local[1]],centre=[.9,-.55,0];trace.set([P.add(centre,P.scale(swing,-.85)),P.add(centre,P.scale(swing,.85))]);
      const displacement=.4*Math.sin(tick*2),pivot=[.9,1.2,0],bobPosition=P.add(pivot,[swing[0]*displacement,-Math.sqrt(1.5**2-displacement**2),swing[2]*displacement]);bob?.position.set(...bobPosition);string.set([pivot,bobPosition]);
      report(`One state at latitude ${lat.toFixed(2)}°, ${hours.toFixed(2)} elapsed h (3600 s each): Earth rotation ${(q.longitude/P.DEG).toFixed(1)}°, local precession ${(q.angle/P.DEG).toFixed(1)}°. Global arrow is the local swing transformed by the rotating east/north/up frame. At the pole it stays fixed in space; at other latitudes only the local precession law applies. Earth turns once in 23.93447 h, a sidereal day. Play advances the labelled clock by 0.5 model hours per animation second and stops at 48 h. Bob oscillation uses a separate schematic 3.14-animation-second period; it does not share the accelerated Earth clock. String length stays fixed.`);
    };
    draw=()=>{const q=P.foucaultGeometry(lat,hours);text('Same clock: pole / Mumbai / equator',320,22,c.ink,13,'center');[90,19.08,0].forEach((p,j)=>{const a=P.foucaultGeometry(p,hours).angle,x=110+j*210;ctx.strokeStyle=c.rule;ctx.beginPath();ctx.arc(x,115,60,0,2*Math.PI);ctx.stroke();stroke([[x-55*Math.sin(a),115-55*Math.cos(a)],[x+55*Math.sin(a),115+55*Math.cos(a)]],c.proton);text(`${p}°: ${(a/P.DEG).toFixed(1)}°`,x,205,c.ink,12,'center');});};
  }
  function telescope() {
    label3("Earth axis", [-1, 1, 0], c.proton);
    label3("telescope axle", [1, 1, 0], c.electron);
    let lat = 11.4, axle = 11.4, spacing = 2;
    const floor = box(0, -0.7, 0, 3.8, 0.08, 1.5, c.rule), dish = mesh(new CylinderGeometry(0.6, 0.6, 0.08, 24), c.electron);
    const trough = group();
    const troughWires = [];
    for (let j = 0; j < 13; j++) {
      const z = (j - 6) * 0.09;
      troughWires.push(line([[-1, 0.4 * z * z - 0.35, z], [1, 0.4 * z * z - 0.35, z]], c.electron, trough));
    }
    for (const x of [-1, 0, 1]) troughWires.push(line(Array.from({ length: 31 }, (_, j) => {
      const z = (j - 15) * 0.04;
      return [x, 0.4 * z * z - 0.35, z];
    }), c.electron, trough));
    if (dish) dish.visible = false;
    const axes3 = [arrow([-1, -0.6, 0], [1, 0.6, 0], c.proton), arrow([-1, -0.6, 0.15], [1, 0.6, 0.15], c.electron)];
    scalar("Observatory latitude", 0, 70, lat, (v) => lat = v, 0.1, "\xB0");
    scalar("Axle angle above horizontal", 0, 70, axle, (v) => axle = v, 0.1, "\xB0");
    scalar("Mesh spacing", 1, 100, spacing, (v) => spacing = v, 1, " cm");
    update = () => {
      const a = lat * P.DEG, b = axle * P.DEG;
      moveArrow(axes3[0], [-1, -0.6, 0], [-1 + 2 * Math.cos(a), -0.6 + 2 * Math.sin(a), 0]);
      moveArrow(axes3[1], [-1, -0.6, 0.15], [-1 + 2 * Math.cos(b), -0.6 + 2 * Math.sin(b), 0.15]);
      trough.rotation.z = b;
      trough.position.set(0.3, 0, 0);
      report(`Earth-axis elevation ${lat.toFixed(1)}\xB0, telescope axle ${axle.toFixed(1)}\xB0: misalignment ${Math.abs(lat - axle).toFixed(1)}\xB0. Mesh openings ${spacing} cm versus a 100 cm radio wavelength: ${spacing <= 10 ? "much smaller openings favour reflection" : "this size comparison no longer justifies treating the mesh as a continuous reflector"}. The optical/mesh response is qualitative.`);
    };
    draw = () => {
      text("Ooty example: 11.4\xB0 latitude, 11.4\xB0 north\u2013south hill", 320, 30, c.ink, 14, "center");
      const pitch = spacing * 2.5;
      for (let x = 55; x <= 555; x += pitch) stroke([[x, 65], [x, 170]], c.rule);
      for (let y = 65; y <= 170; y += pitch) stroke([[55, y], [555, y]], c.rule);
      stroke(Array.from({ length: 151 }, (_, j) => [55 + j / 150 * 500, 118 + 22 * Math.sin(j / 150 * Math.PI * 4)]), c.electron);
      text(`Window: 200 cm wide \xB7 wavelength: 100 cm \xB7 mesh: ${spacing} cm`, 320, 220, c.muted, 12, "center");
    };
  }
  function tracksParityBoseEvidence() {
    let mass=105.7,momentum=100,mode=0,spin=1,alignment=.8,resolution=.02,impact=1,arrangement=0,observed=1;
    const random=api.rng(1941),noise=Array.from({length:100},()=>[random()-.5,random()-.5]),blank=Array.from({length:100},()=>[0,0,0]);
    const track=line(blank,c.electron),grains=Array.from({length:100},()=>ball(0,0,0,.025,c.proton)),plate=box(0,0,0,4,.8,.8,c.rule,root,.12);
    const spinArrows=[arrow([0,0,0],[0,0,0],c.proton),arrow([0,0,0],[0,0,0],c.proton)],meanArrows=[arrow([0,0,0],[0,0,0],c.electron),arrow([0,0,0],[0,0,0],c.electron)],mirror=box(0,0,-.1,.025,2,1,c.rule,root,.2);
    const samples=Array.from({length:100},()=>ball(0,0,0,.025,c.electron));
    const boxes=[box(-.9,0,-.1,1,.9,.3,c.rule,root,.2),box(.9,0,-.1,1,.9,.3,c.rule,root,.2)],particles=[ball(0,0,.2,.15,c.proton),ball(0,0,.2,.15,c.electron)];
    const sun=ball(0,-.1,0,.45,c.neutron),ray=line([[0,0,0],[0,0,0],[0,0,0]],c.electron),backward=line([[0,0,0],[0,0,0]],c.proton),observer=ball(0,0,0,.07,c.ink),trueStar=ball(0,0,0,.07,c.sheet),apparentStar=ball(0,0,0,.07,c.proton);
    const hidePosition=[0,-20,0];label3('A',()=>d.id==='bose-counting'&&mode===0?P.add(particles[0]?.position.toArray()||[0,0,0],[0,.2,0]):hidePosition,c.proton);label3('B',()=>d.id==='bose-counting'&&mode===0?P.add(particles[1]?.position.toArray()||[0,0,0],[0,.2,0]):hidePosition,c.electron);
    if(d.id==='tracks'){
      scalar('Candidate rest mass',105.7,938,mass,v=>mass=v,1,' MeV/c²');scalar('Known momentum',50,500,momentum,v=>momentum=v,10,' MeV/c');scalar('Microscope resolution',.002,.08,resolution,v=>resolution=v,.002,' display units');scalar('Observed RMS scattering',.1,15,observed,v=>observed=v,.1,'°');
    }else if(d.id==='parity'){
      scalar('Spin alignment',0,1,alignment,v=>alignment=v,.05);button('Reverse spin',()=>spin*=-1);tabs(['Actual and repeat','Actual and spatial mirror'],i=>mode=i);
      label3('actual',[-.85,1.3,0]);label3('comparison',[.85,1.3,0]);label3('mirror x → −x',[0,-1.25,0]);label3('red spin / blue mean asymmetry',[0,1.7,0]);
    }else if(d.id==='bose-counting'){
      let control;tabs(['Labelled particles','Identical bosons','Same-spin fermions'],i=>{mode=i;arrangement=0;if(control){control.input.max=String(P.boseStates(['labelled','boson','fermion'][i]).length);control.set(1);}});control=scalar('Arrangement',1,4,1,v=>arrangement=v-1,1);
      label3('one-particle state 1',[-.9,-.8,0]);label3('one-particle state 2',[.9,-.8,0]);
    }else{
      scalar('Solar impact parameter',1,4,impact,v=>impact=v,.1,' solar radii');scalar('Angular uncertainty',.1,2,resolution=.5,v=>resolution=v,.1,' arcsec');tabs(['Einstein prediction','Half-Einstein prediction','Zero deflection'],i=>mode=i);
      label3('Sun',[0,-.7,0]);label3('observer',()=>P.add(P.deflectionGeometry(impact,[1,.5,0][mode]).observer,[.2,-.2,0]));label3('true star',()=>P.add(P.deflectionGeometry(impact,[1,.5,0][mode]).trueStar,[-.1,-.2,0]));label3('apparent star',()=>P.add(P.deflectionGeometry(impact,[1,.5,0][mode]).apparentStar,[-.1,.2,0]),c.proton);
    }
    update=()=>{
      const isTrack=d.id==='tracks',parity=d.id==='parity',counting=d.id==='bose-counting',evidence=d.id==='eclipse-evidence';
      track.object.visible=isTrack;if(plate)plate.visible=isTrack;if(mirror)mirror.visible=parity&&mode===1;[...spinArrows,...meanArrows].forEach(o=>o&&(o.visible=parity));samples.forEach(o=>o&&(o.visible=parity));boxes.forEach(o=>o&&(o.visible=counting));particles.forEach(o=>o&&(o.visible=counting));[sun,observer,trueStar,apparentStar].forEach(o=>o&&(o.visible=evidence));ray.object.visible=backward.object.visible=evidence;
      if(isTrack){const q=P.trackGeometry(mass,momentum,noise,resolution),inference=P.trackInference(momentum,observed*P.DEG,resolution,4*q.magnification);track.set(q.points);grains.forEach((o,j)=>{if(!o)return;o.visible=j<q.grains.length;if(j<q.grains.length){o.position.set(...q.grains[j].map(v=>Math.round(v/resolution)*resolution));o.scale.setScalar(.6+resolution*8);}});
        report(`Simulated grains: density proxy 1/β² = ${q.relativeGrainDensity.toFixed(2)}; candidate β ${q.beta.toFixed(3)}, expected RMS ${(q.scatter/P.DEG).toFixed(2)}°. Chosen observation ${observed.toFixed(1)}° ± ${(inference.uncertainty/P.DEG).toFixed(2)}° from finite resolution over a 4-unit lever with ×${q.magnification.toFixed(1)} transverse display magnification. At known ${momentum} MeV/c this gives mass ${inference.massRange.map(x=>x.toFixed(1)).join('–')} MeV/c², speed ${inference.betaRange.map(x=>x.toFixed(3)).join('–')} c. ${inference.consistent?'Compare candidate with the interval; a projection and one track cannot uniquely identify a particle.':'Below the ultrarelativistic prediction: this observation interval is incompatible with the assumed material/momentum.'} Grain positions are quantised to the chosen resolution; grain sizes enlarged; Highland material x/X₀=.01.`);
      }else{grains.forEach(o=>o&&(o.visible=false));}
      if(parity){const q=P.parityGeometry(spin,alignment,mode===1);[q.spin,q.reflectedSpin].forEach((v,j)=>{const origin=[j?.85:-.85,0,0];moveArrow(spinArrows[j],origin,P.add(origin,P.scale(v,.7)));moveArrow(meanArrows[j],origin,P.add(origin,P.scale(j?q.reflectedVelocity:q.velocity,.9)));});
        samples.forEach((o,j)=>{if(!o)return;const side=j<50?0:1,k=j%50,up=k<(side?q.counts.up-Math.floor(q.counts.up/2):Math.floor(q.counts.up/2));o.position.set((side?.85:-.85)+(k%10-4.5)*.035,(up?1:-1)*(.3+Math.floor(k/10)*.11),.15);});
        report(`Toy 100-event distribution: up ${q.counts.up}, down ${q.counts.down}; zero alignment gives equal populations and zero blue mean-asymmetry vector. Actual versus ${mode?'x-reflected experiment: polar v → Rv, axial spin → det(R)R spin':'identical repeat'}. Mirror reverses axial y spin while preserving polar y velocity; it is not a second independent decay measurement. Counts are illustrative, not historical Wu data.`);
      }else if(counting){const kind=['labelled','boson','fermion'][mode],q=P.countingGeometry(kind,arrangement);particles.forEach((o,j)=>{o?.position.set(...q.positions[j]);o?.material.color.set(mode===0&&j?c.electron:c.proton);});report(`Two particles, two available one-particle states, no fixed-total-energy constraint: ${q.count} arrangements for ${kind}. Selected ${q.state[2]}, occupation (${q.state[0]},${q.state[1]}). A/B identities are removed for identical particles. State counting alone does not assert probabilities.`);
      }else if(evidence){const g=P.deflectionGeometry(impact,[1,.5,0][mode]);ray.set(g.ray);backward.set(g.backward);observer?.position.set(...g.observer);trueStar?.position.set(...g.trueStar);apparentStar?.position.set(...g.apparentStar);
        const prediction=P.lensDeflection(impact),selected=prediction*[1,.5,0][mode],measured=prediction+.12;report(`Impact ${impact.toFixed(1)} solar radii: physical blue ray bends toward Sun. Red backward extrapolation places apparent star farther outward than true star. Angles magnified for visibility. Einstein ${prediction.toFixed(3)}″; selected ${selected.toFixed(3)}″; simulated measurement ${measured.toFixed(3)}″ ± ${resolution.toFixed(2)}″. Interval ${Math.abs(measured-selected)<=resolution?'includes':'excludes'} selected prediction.`);
      }
    };
    draw=()=>{
      if(d.id==='tracks'){const q=P.trackGeometry(mass,momentum,noise,resolution),inf=P.trackInference(momentum,observed*P.DEG,resolution,4*q.magnification);text('Microscope x–y projection: depth hidden; circles are resolved grains',320,22,c.ink,12,'center');stroke(q.points.map(v=>[55+(v[0]+2)/4*550,105-v[1]*55]),c.electron);q.grains.forEach(v=>{const y=Math.round(v[1]/resolution)*resolution;plotDot(55+(Math.round(v[0]/resolution)*resolution+2)/4*550,105-y*55,c.proton,2);ctx.strokeStyle=c.rule;ctx.beginPath();ctx.arc(55+(Math.round(v[0]/resolution)*resolution+2)/4*550,105-y*55,Math.max(2,resolution*55),0,2*Math.PI);ctx.stroke();});text(`Observed ${observed.toFixed(1)}° ± ${(inf.uncertainty/P.DEG).toFixed(2)}° → mass ${inf.massRange.map(x=>x.toFixed(0)).join('–')} MeV/c²`,320,197,c.ink,12,'center');text('Resolution rings and mass range change together; model/material assumptions matter.',320,225,c.muted,11,'center');
      }else if(d.id==='parity'){const q=P.parityGeometry(spin,alignment,mode===1);bar(`Up ${q.counts.up}`,q.counts.up,100,45,55,c.proton);bar(`Down ${q.counts.down}`,q.counts.down,100,350,55,c.electron);[q.spin,q.reflectedSpin].forEach((v,j)=>{const x=180+j*280;stroke([[x,150],[x,150-v[1]*40]],c.proton,4);const vel=(j?q.reflectedVelocity:q.velocity)[1];if(vel)stroke([[x+35,150],[x+35,150-vel*40]],c.electron,4);text(j?(mode?'mirror R = diag(−1,1,1)':'repeat'):'actual',x,205,c.ink,12,'center');});text('Red spin axis · blue mean emission (vanishes at zero alignment)',320,235,c.muted,11,'center');
      }else if(d.id==='bose-counting'){const states=P.boseStates(['labelled','boson','fermion'][mode]);text('Two particles / two states / no fixed total energy or probability assumption',320,25,c.ink,12,'center');states.forEach((state,j)=>{ctx.strokeStyle=j===arrangement?c.proton:c.rule;ctx.strokeRect(45+j*145,55,130,110);text(`(${state[0]},${state[1]})`,110+j*145,103,c.ink,18,'center');text(state[2],110+j*145,139,c.muted,13,'center');});text(mode===0?'A|B and B|A exchange actual red A and blue B locations.':'Identical particles: exchange gives no extra state.',320,219,c.muted,12,'center');
      }else{const prediction=P.lensDeflection(impact),measured=prediction+.12,min=-2.1,max=4.1,x=v=>65+(v-min)/(max-min)*510;text('Apparent angular shift / arcseconds (simulated evidence)',320,23,c.ink,13,'center');const g=P.deflectionGeometry(impact,[1,.5,0][mode]),proj=v=>[320+v[0]*105,85-(v[1]+.1)*22];plotDot(320,85,c.neutron,10);stroke(g.ray.map(proj),c.electron);stroke(g.backward.map(proj),c.proton);plotDot(...proj(g.observer),c.ink,4);plotDot(...proj(g.trueStar),c.ink,3);plotDot(...proj(g.apparentStar),c.proton,3);text('true / apparent',105,103,c.muted,10);text('observer',530,103,c.muted,10);stroke([[65,195],[575,195]],c.rule);[0,prediction/2,prediction].forEach((v,j)=>{stroke([[x(v),128],[x(v),195]],[c.muted,c.electron,c.proton][j]);text(['0','half','Einstein'][j],x(v),215,c.ink,11,'center');});stroke([[x(measured-resolution),155],[x(measured+resolution),155]],c.ink,3);plotDot(x(measured),155,c.ink,5);text(`Full uncertainty interval: ${(measured-resolution).toFixed(2)} to ${(measured+resolution).toFixed(2)}″`,320,238,c.muted,11,'center');}
    };
  }
  const id = d.id;
  if (id === "charge") charge();
  else if (id === "cage") cage();
  else if (id.startsWith("circuit-") || id === "protection") circuits();
  else if (id === "domains") domains();
  else if (id === "earth-field") earthField();
  else if (id === "field-probe") fieldProbe();
  else if (["motor", "generator", "transformer"].includes(id)) machines();
  else if (id === "em-wave") emWave();
  else if (["day-night", "seasons3d", "moon-rotation", "eclipses"].includes(id)) sky();
  else if (id === "tides3d") tides();
  else if (id === "photoelectric") photo();
  else if (["atom-scale", "radiation-decay"].includes(id)) atomRadiation();
  else if (["solar-fusion", "halo"].includes(id)) sunHalo();
  else if (id === "stellar-spectrum") spectrum();
  else if (id === "distance-ladder") distances();
  else if (["white-dwarf", "cosmos"].includes(id)) dwarfCosmos();
  else if (id === "foucault") foucault();
  else if (id === "telescope") telescope();
  else tracksParityBoseEvidence();
  playback(new Set(["circuit-signal","motor","generator","transformer","em-wave","day-night","seasons3d","moon-rotation","eclipses","tides3d","photoelectric","radiation-decay","halo","foucault"]).has(id));
  // Establish selected visibility before the lab measures its first scene bounds.
  update();
  lab.redraw(() => {
    cv.clear(c.plate);
    draw();
  });
  api.loop((dt) => {
    tick += Math.max(0, dt);
    advance(Math.max(0, dt));
    update();
    lab.refresh();
  });
  update();
  lab.refresh();
  if(fixedViewRadius!==null)lab.kit?.fit?.(fixedViewRadius);
  lab.kit?.render?.();
  api.onCleanup(() => {
    if (lab.kit) return;
    const seen = /* @__PURE__ */ new Set();
    owned.forEach((o) => {
      if (o && !o.userData?.shared && !seen.has(o)) {
        seen.add(o);
        o.dispose?.();
      }
    });
  });
  return { destroy() {
  } };
}, { label: "Explore the mechanism", three: true });
