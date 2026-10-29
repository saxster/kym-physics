import assert from 'node:assert/strict';
import {motorVectors,coilField,hydrogenLinePopulation,lunarGeometry as moon} from '../live/fields_models.mjs';
import {motor, generator, transformer, photoelectric, solarGeometry, lunarGeometry, tidalAcceleration, dipoleField, wireField, circuit, decay, parallax, cepheid, whiteDwarf, expansion, foucault, trackParticle, boseStates, parityCounts, l1Balance, massEnergy, sphereConductorField} from '../live/fields_models.mjs';
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
near(motor(90,2,.5,10,.04).torque,.4);
near(motor(270,2,.5,10,.04).torque,.4);
near(motor(90,-2,.5,10,.04).torque,-.4);
near(motor(180,2,.5,10,.04).torque,0);
for(const angle of [0,45,90,180,225,270]){
 const q=motorVectors(angle),yTorque=q.sides.reduce((s,v)=>s+v.position[2]*v.force[0]-v.position[0]*v.force[2],0);
 near(yTorque,q.torque);
 for(const side of q.sides)near(side.force[2],-side.current[1]); // N L B = 10 × 0.2 × 0.5 = 1
}
near(generator(90,2,.5,10,.04).voltage,.4);
near(generator(0,2,.5,10,.04).voltage,0);
near(transformer(12,100,300,6).secondaryV,36);
near(transformer(12,100,300,6).primaryI,18);
near(photoelectric(380,1000,0).maxKE,.5527420631578948,1e-8);
near(photoelectric(750,1000,0).electronsPerSecond,0);
near(photoelectric(380,1000,1).electronsPerSecond,0);
near(photoelectric(380,1000,0).maxKE,photoelectric(380,10,0).maxKE);
near(solarGeometry(172,19.08,23.44).noonAltitude,85.641,0.02);
near(solarGeometry(355,19.08,23.44).noonAltitude,47.481,0.02);
near(solarGeometry(172,-19.08,0).dayHours,12);
assert.equal(lunarGeometry(0,0,5.145).eclipse,'solar');
assert.equal(lunarGeometry(180,0,5.145).eclipse,'lunar');
assert.equal(lunarGeometry(0,90,5.145).eclipse,'none');
near(lunarGeometry(90,0,5.145).lit,.5);
near(lunarGeometry(0,0,5.145).lit,0);
assert.ok(tidalAcceleration([6371e3,0,0],[384400e3,0,0])[0]>0);
assert.ok(tidalAcceleration([-6371e3,0,0],[384400e3,0,0])[0]<0);
near(wireField(1,.01)[1],20e-6,1e-12);
near(coilField(1,1),6.283185307179586e-5,1e-12);
near(coilField(-1,1),-6.283185307179586e-5,1e-12);
assert.ok(coilField(1,10)>coilField(1,1));
const b=dipoleField([0,2,0]);near(b[1],.25);
near(circuit(9,[330,660],2,0).currents[0],7/330);
near(circuit(9,[330,660],2,0).currents[1],7/660);
near(circuit(9,[330,660],2,0).totalI,7/220);
near(circuit(9,[330],2,100).terminalV,9-700/430);
near(decay(100,2,2),50);
near(decay(100,2,4),25);
near(parallax(10,1).arcsec,.1);
near(cepheid(10,100).relativeFlux,cepheid(10,200).relativeFlux*4);
assert.ok(whiteDwarf(1).radiusKm<whiteDwarf(.6).radiusKm);
assert.equal(whiteDwarf(1.44).stable,false);
near(expansion([[0,0,0],[2,0,0]],1,2).distances[0],4);
near(foucault(0,6).degrees,0);
near(foucault(90,23.9344696).degrees,-360);
near(foucault(19.08,1).degrees,-4.91674529,1e-6);
assert.ok(trackParticle(938,100).scatter>trackParticle(105.7,100).scatter);
assert.equal(boseStates('labelled').length,4);
assert.equal(boseStates('boson').length,3);
assert.equal(boseStates('fermion').length,1);
assert.deepEqual(parityCounts(1,.8),{up:30,down:70});
assert.deepEqual(parityCounts(-1,.8),{up:70,down:30});
near(l1Balance(1.5e9).netInward,l1Balance(1.5e9).needed,1e-5);
near(massEnergy(1).fraction,.007119,1e-6);
near(sphereConductorField([.2,0,0],1,[1,0,0]).total[0],0);
assert.ok(hydrogenLinePopulation(10000).lineProxy>hydrogenLinePopulation(5000).lineProxy);
assert.ok(hydrogenLinePopulation(10000).lineProxy>hydrogenLinePopulation(25000).lineProxy);
assert.equal(moon(0,90,0).eclipse,'solar');
console.log('PASS fields/sky lesson public models: independent reference values, limiting cases, conservation and geometry');

// These contracts supply the actual positions/vectors/polyline buffers used in w_fieldslab.js.
const G=await import('../live/fields_models.mjs');
for(const I of [-3,0,3])for(const r of [.5,1,6]){
 const g=G.wireProbeGeometry(I,r),rad=g.position;
 near(G.dot(g.source,[0,1,0]),0);near(G.dot(g.source,rad),0);near(g.position[0],r*.35);
 near(g.source[2],-20*I/r);assert.deepEqual(g.total,G.add(g.source,g.background));
}
assert.deepEqual(G.wireProbeGeometry(99,99,'tram').source,[0,0,-.5]);
for(let n=1;n<=10;n++){const g=G.wireProbeGeometry(1,1,'coil',n);near(g.source[1],G.coilField(1,n)*1e6);near(g.contributions.reduce((s,v)=>s+v[1],0),g.source[1]);}
assert.deepEqual(G.loopPoint(0),[-2,-.8,0]);assert.notDeepEqual(G.loopPoint(.4),G.loopPoint(.5));
// Build actual wire connectivity by splitting at all on-segment junctions. Battery is excluded.
function wireConnected(edges,a,b){
 const key=v=>v.map(x=>x.toFixed(7)).join(','),nodes=[a,b,...edges.flat()],adj=new Map();
 const within=(p,x,y)=>{const d=G.add(y,G.scale(x,-1)),v=G.add(p,G.scale(x,-1)),t=G.dot(v,d)/G.dot(d,d);return t>=-1e-9&&t<=1+1e-9&&G.length(G.add(v,G.scale(d,-t)))<1e-8;};
 for(const [x,y] of edges){const ps=nodes.filter(p=>within(p,x,y));for(const p of ps)for(const q of ps){const k=key(p);if(!adj.has(k))adj.set(k,new Set());adj.get(k).add(key(q));}}
 const seen=new Set(),todo=[key(a)];while(todo.length){const p=todo.pop();if(seen.has(p))continue;seen.add(p);for(const q of adj.get(p)||[])todo.push(q);}return seen.has(key(b));
}
for(const series of [false,true]){const g=G.circuitTopology(series);assert.equal(wireConnected(g.edges,[-2,.4,0],[-2,-.4,0]),false,'no ideal wire bypass');assert.ok(wireConnected([...g.edges,...g.loads.map(v=>[v.a,v.b])],[-2,.4,0],[-2,-.4,0]),'adding the real loads closes the path');}
assert.equal(G.protectionState(40,true).trip,true);assert.equal(G.protectionState(40,false,false).leakmA,0);assert.equal(G.protectionState(40,false,true).rcd,true);assert.equal(G.protectionState(0,true,false,true).breaker,true);assert.equal(G.protectionState(0,true,false,true).rcd,false);near(G.protectionState(40,true).liveA,0);
for(const latitude of [-90,0,19.08,90])for(const h of [0,6,24]){const f=G.observerFrame(latitude,h);for(const v of [f.up,f.north,f.east])near(G.length(v),1);near(G.dot(f.up,f.north),0);near(G.dot(f.up,f.east),0);const g=G.foucaultGeometry(latitude,h),reconstructed=G.add(G.scale(g.east,g.local[0]),G.scale(g.north,g.local[1]));reconstructed.forEach((x,i)=>near(x,g.world[i]));}
const pole0=G.foucaultGeometry(90,0).world,pole6=G.foucaultGeometry(90,6).world;pole0.forEach((x,i)=>near(x,pole6[i]));near(G.foucaultGeometry(0,6).angle,0);
assert.ok(G.observerFrame(0,-6).project([1,0,0])[0]>0,'morning Sun east');assert.ok(G.observerFrame(0,6).project([1,0,0])[0]<0,'evening Sun west');
for(const sun of [[1,0,0],[0,0,1]]){const earth=G.shadowGeometry(sun),moon=G.shadowGeometry(sun,[1,0,0],.0095,2.1,(695700-1737.4)/149597870);assert.ok(earth.farRadius<earth.nearRadius);assert.ok(moon.farRadius>moon.nearRadius);near(G.dot(G.add(earth.far,G.scale(earth.near,-1)),sun),-earth.length);earth.center.forEach((x,i)=>near(x,(earth.near[i]+earth.far[i])/2));}
near(G.generator(90,0).voltage,0);near(G.generator(90,6).voltage,1.2);
for(const dc of [false,true]){const p=G.transformerPhase(12,3,1,dc);near(p.secondaryV,3*p.primaryV);const eps=1e-5,dPhi=(G.transformerPhase(12,3,1+eps,dc).fluxWb-G.transformerPhase(12,3,1-eps,dc).fluxWb)/(2*eps);near(-100*dPhi,p.primaryV,1e-7);if(dc){assert.ok(p.fluxWb>0);near(p.secondaryV,0);}}
near(G.transformerPhase(0,2,1,true).flux,0);
const summer=G.seasonFootprint(172,40,23.44);assert.ok(summer.north.dayHours>summer.south.dayHours);assert.ok(summer.normalFlux>summer.oppositeFlux);near(G.seasonFootprint(172,40,0).normalFlux,G.seasonFootprint(172,-40,0).normalFlux);
for(const mode of [false,true]){const g=G.parityGeometry(1,0,mode);near(G.length(g.velocity),0);near(G.length(g.reflectedVelocity),0);near(g.counts.up,g.counts.down);}
assert.deepEqual(G.parityGeometry(1,1,true).reflectedSpin,[0,-1,-0]);assert.deepEqual(G.parityGeometry(1,1,true).reflectedVelocity,[-0,-1,0]);
assert.notDeepEqual(G.countingGeometry('labelled',1).positions,G.countingGeometry('labelled',2).positions);assert.equal(G.countingGeometry('boson',2).count,3);assert.equal(G.countingGeometry('fermion',0).count,1);
for(const impact of [1,2,4]){const g=G.deflectionGeometry(impact);assert.ok(g.ray[2][1]<g.ray[1][1],'deflect toward Sun');assert.ok(g.apparentStar[1]>g.trueStar[1],'apparent star shifts outward');near((g.ray[1][1]+.1)/Math.sqrt(1+(g.bend/2)**2),.45*impact);const slope=(g.ray[2][1]-g.ray[1][1])/2;near((g.apparentStar[1]-g.observer[1])/-4,slope);}
for(const p of [0,90,180]){const q=G.earthSensorGeometry(19.08,p);near(G.length(q.device),G.length(q.enu));near(q.device[2],q.enu[2]);}
assert.notDeepEqual(G.distanceGeometry(10,1,10,0).positions,G.distanceGeometry(100,2,10,0).positions);near(G.distanceGeometry(10,1,10,2.5).normalisedFlux,1.3);near(G.distanceGeometry(10,1,20,5).normalisedFlux,1.3);
near(G.diodeOperatingPoint(9).current*(330)+G.diodeOperatingPoint(9).diodeV,9);near(G.diodeOperatingPoint(9,330,100).terminalV,9-100*G.diodeOperatingPoint(9,330,100).current);near(G.diodeOperatingPoint(9,330,0,false,false).current,0);
assert.ok(G.trackInference(100,.05,.05).massRange[1]>G.trackInference(100,.05,.005).massRange[1]);
for(const mode of [0,1,2])for(const q of [0,4,8]){const g=G.chargeGeometry(q,3,mode);near(g.sampleNet,mode?0:-q);near(g.sourceNet+g.sampleNet+g.storedNet,0);near(g.centre,2.55);if(mode)assert.equal(g.sourceElectrons.filter(v=>v[0]<-2).length,q);}
console.log('PASS renderer geometry: tangent fields, topology/no bypass, frame transforms, shadow endpoints, Faraday phases, reflection/exchange and ray extrapolation');

// Instantiate the real widget with Three geometry and a deterministic Canvas/API adapter.
// This exercises every scene/control branch without a GPU; it is not a browser-render receipt.
const {readFile}=await import('node:fs/promises'),THREE=await import('three');
const catalog=JSON.parse(await readFile(new URL('../lessons/fields.json',import.meta.url),'utf8'));
const widgetSource=(await readFile(new URL('../live/w_fieldslab.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
let factory;const Live={register(name,fn){factory=fn;}};
const names=['Group','Mesh','BoxGeometry','SphereGeometry','TorusGeometry','CylinderGeometry','ConeGeometry','BufferGeometry','Float32BufferAttribute','Line','LineBasicMaterial','MeshStandardMaterial','MeshBasicMaterial','ArrowHelper','Vector3','DoubleSide'];
let active;
const makeLab=()=>{const root=active.gpu?new THREE.Group():undefined;active.root=root;let draw=()=>{};const kit=root?{root,label(t,p){active.labels.push(p);},spinSpeed:0}:null;return {kit,canvas:{ctx:active.ctx,W:640,H:240,clear(){}},say:s=>active.readout=s,teach:o=>active.teaching=o.explanation,redraw(fn){draw=fn;},refresh(){active.canvasOps=[];draw();for(const p of active.labels){const q=typeof p==='function'?p():p;assert.ok(q.every(Number.isFinite),'finite scene label');}}};};
new Function('Live','makeLab','LESSONS','P',...names,widgetSource)(Live,makeLab,catalog,G,...names.map(n=>THREE[n]));
let sceneChecks=0;
for(const gpu of [true,false])for(const lesson of catalog){
 active={gpu,root:null,labels:[],sliders:[],tabs:[],buttons:[],loops:[],canvasOps:[],readout:'',ctx:new Proxy({},{get:(_,key)=>key==='measureText'?s=>({width:String(s).length*7}):String(key).includes('Gradient')?()=>({addColorStop(){}}):(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`${lesson.id}: finite Canvas ${String(key)}`);if(['arc','fillText','moveTo','lineTo','fillRect'].includes(key))active.canvasOps.push({key,args});},set:()=>true})};
 const api={colors:()=>new Proxy({},{get:()=> '#667788'}),slider(label,o){const input={value:o.value,min:o.min,max:o.max,disabled:false,setAttribute(){}};const control={label,input,fmt:o.fmt,set(v){input.value=Math.max(+input.min,Math.min(+input.max,v));},drive(v){this.set(v);o.onInput(+input.value);}};active.sliders.push(control);return control;},tabs(labels,fn,start=0){const group={labels,fn,start,selected:start};active.tabs.push(group);const result=[];result.setActive=i=>group.selected=i;return result;},button(label,fn){const o={label,fn};active.buttons.push(o);return o;},rng(seed){let n=seed;return()=>((n=(1664525*n+1013904223)>>>0)/2**32);},loop(fn){active.loops.push(fn);},onCleanup(){},playback(enabled){active.playback=enabled;},play(){},pause(){active.pauses=(active.pauses||0)+1;}};
 factory({}, {lesson:lesson.id},api);
 const staticLessons=['charge','cage','circuit-diagnose','circuit-probes','protection','domains','earth-field','field-probe','atom-scale','solar-fusion','stellar-spectrum','distance-ladder','white-dwarf','cosmos','telescope','tracks','parity','bose-counting','eclipse-evidence'];
 assert.equal(active.playback,!staticLessons.includes(lesson.id),lesson.id+' has meaningful initial Play availability');
 const step=dt=>{for(const loop of active.loops)loop(dt);};
 const clockRates={
  'day-night':['Solar time',1],
  'seasons3d':['Day in ideal year',10],
  'moon-rotation':['Lunar angle from Sun',15],
  'eclipses':['Lunar angle from Sun',15],
  'tides3d':['Moon orbital angle',15],
  'radiation-decay':['Elapsed model time',1],
  'halo':['Halo model day',5],
  'foucault':['Elapsed time',.5]
 };
 if(clockRates[lesson.id]){
  const [label,rate]=clockRates[lesson.id],clock=active.sliders.find(c=>c.label===label);
  assert.ok(clock,lesson.id+' exposes its clock');
  const before=+clock.input.value;step(.1);near(+clock.input.value,before+.1*rate);clock.drive(before);
 }
 if(lesson.id==='foucault'){
  const latitude=active.sliders.find(c=>c.label==='Latitude');latitude.drive(30);
  assert.equal(active.tabs[0].selected,-1,'manual Foucault latitude clears the city/pole preset');
  assert.match(active.readout,/latitude 30.00/);active.tabs[0].fn(0);
 }
 if(lesson.id==='atom-scale'){
  const ruler=active.sliders.find(c=>c.label==='Nucleus displayed diameter');
  for(const size of [1,5,10]){ruler.drive(size);for(const y of [75,145]){const start=active.canvasOps.findIndex(o=>o.key==='moveTo'&&o.args[0]===55&&o.args[1]===y);assert.ok(start>=0,'both physical reference rulers are retained');assert.deepEqual(active.canvasOps[start+1],{key:'lineTo',args:[55+size*24,y]});}const captions=active.canvasOps.filter(o=>o.key==='fillText');assert.ok(captions.some(o=>String(o.args[0]).includes('Red nucleus reference:')&&String(o.args[0]).includes(' cm; blue atom reference:')&&String(o.args[0]).includes(' km. Ruler units differ.')&&o.args[2]===25),'separate ruler units are stated in the normal-flow header');assert.ok(!captions.some(o=>o.args[2]>50&&o.args[2]<200),'no enlarged inline caption plate can hide a reference ruler');}ruler.drive(5);
 }
 if(lesson.id==='photoelectric'){
  const bars=active.canvasOps.filter(o=>o.key==='fillRect'&&o.args[3]===14),values=[G.photoelectric(380,500,0).energy,2.71,G.photoelectric(380,500,0).maxKE,0];
  assert.equal(bars.length,8);for(let j=0;j<4;j++)near(bars[2*j+1].args[2],values[j]/4.2*240);
 }
 if(lesson.id==='solar-fusion'){
  const stage=active.sliders.find(c=>c.label==='Transport stage');
  assert.equal(stage.fmt(2),'Convective transport');stage.drive(2);assert.equal(active.playback,true);stage.drive(0);assert.equal(active.playback,false);
 }
 if(lesson.id==='tides3d'){
  active.tabs[0].fn(1);assert.match(active.teaching,/every part of Earth towards itself/);
  assert.equal(active.buttons.find(b=>b.label==='Include / remove Sun').disabled,true);
  active.tabs[0].fn(0);
 }
 if(lesson.id==='moon-rotation'){
  const phase=active.sliders.find(c=>c.label==='Lunar angle from Sun');phase.drive(90);
  for(const mode of [0,1]){
   active.tabs[0].fn(mode);const q=G.lunarGeometry(90,0,0),a=mode?Math.PI:q.moonAngle+Math.PI;
   const mx=330+110*Math.cos(q.moonAngle),my=120-78*Math.sin(q.moonAngle);
   const start=active.canvasOps.findIndex(o=>o.key==='moveTo'&&Math.abs(o.args[0]-mx)<1e-7&&Math.abs(o.args[1]-my)<1e-7);
   assert.ok(start>=0,'Moon fallback draws its face direction');const end=active.canvasOps[start+1];
   assert.equal(end.key,'lineTo');near(end.args[0],mx+27*Math.cos(a));near(end.args[1],my-27*Math.sin(a));
   if(gpu){const expected=q.moon.map(v=>v/384400*2.1);expected[0]+=.24*Math.cos(a);expected[2]+=.24*Math.sin(a);
    const markers=[];active.root.traverse(o=>{if(o.geometry?.type==='SphereGeometry'&&o.geometry.parameters.radius===.055)markers.push(o);});
    assert.ok(markers.some(o=>o.position.toArray().every((v,j)=>Math.abs(v-expected[j])<1e-7)),'3D and fallback mark the same lunar face');
   }
  }active.tabs[0].fn(0);phase.drive(45);
 }
 if(lesson.id==='circuit-signal'){
  active.tabs[0].fn(1);active.sliders.find(c=>c.label==='Drift elapsed time').drive(5000);
  const p=G.loopPoint(-.5),project=[70+(p[0]+2)*100,125-p[1]*65];
  assert.ok(active.canvasOps.some(o=>o.key==='arc'&&o.args[2]===5&&Math.abs(o.args[0]-project[0])<1e-7&&Math.abs(o.args[1]-project[1])<1e-7),'distinguished electron reaches half loop');
  if(gpu){const marker=active.root.getObjectByName('signal-tracked-electron');near(marker.position.x,p[0]);near(marker.position.y,p[1]);}
  const drift=active.sliders.find(c=>c.label==='Drift elapsed time');drift.drive(9990);step(.1);near(drift.input.value,10000);assert.ok(active.pauses);
  active.tabs[0].fn(0);
 }
 if(lesson.id==='circuit-probes'){
  const probe=active.sliders.find(c=>c.label==='Probe selection');
  assert.equal(probe.fmt(4),'Load 2 voltage','probe choice has a readable name');
  for(let choice=0;choice<5;choice++){probe.drive(choice);const captions=active.canvasOps.filter(o=>o.key==='fillText').map(o=>String(o.args[0])).join('\n');if(choice<3){assert.match(captions,/marked point selects current/);assert.doesNotMatch(captions,/endpoints measure a voltage/);}else{assert.match(captions,/endpoints measure a voltage difference/);assert.doesNotMatch(captions,/marked point selects current/);}}
  probe.drive(0);
 }
 if(lesson.id==='transformer'){
  active.tabs[0].fn(1);assert.equal(active.playback,false,'steady DC has no no-op Play');
  assert.match(active.teaching,/unchanging flux/);
  active.tabs[0].fn(0);assert.equal(active.playback,true);
 }
 if(lesson.id==='distance-ladder'){
  active.tabs[0].fn(1);assert.equal(active.playback,true);
  const clock=active.sliders.find(c=>c.label==='Cepheid elapsed time');
  step(.5);near(clock.input.value,1);clock.drive(79.9);step(.5);near(clock.input.value,80);assert.ok(active.pauses);
  active.tabs[0].fn(0);assert.equal(active.playback,false);
 }
 if(lesson.id==='radiation-decay'){
  active.tabs[0].fn(1);assert.equal(active.playback,false);
  assert.match(active.teaching,/no continuing radioactive source/);
  assert.ok(!active.canvasOps.some(o=>o.key==='fillText'&&String(o.args[0]).includes('ensemble expectation')),'beam-only exposure has no false decay curve');
  active.tabs[0].fn(2);assert.equal(active.playback,true);
  assert.match(active.readout,/of 24 parent/);
  active.tabs[0].fn(0);
 }
 if(lesson.id==='circuit-diagnose'){
  // The visible operating-point marker must agree with the measured readout,
  // including reversed/open states; checking pure diode values alone misses this.
  for(let mode=0;mode<4;mode++){
   active.tabs[0].fn(mode);
   const current=Number(active.readout.match(/current ([\d.]+) mA/)[1])/1000;
   const marker=active.canvasOps.find(o=>o.key==='arc'&&o.args[2]===4);
   assert.ok(marker,'diagnostic operating point is drawn');
   near(marker.args[1],195-current/.04*145,.025);
  }
  active.tabs[0].fn(0);
 }
 if(lesson.id==='motor'){
  // The shared Play clock must animate the rotor without a second run switch.
  const angle=active.sliders.find(s=>s.label==='Coil angle'),before=angle.input.value;
  for(let i=0;i<20;i++)for(const loop of active.loops)loop(.05);
  assert.notEqual(angle.input.value,before,'ordinary Play clock turns the motor');
  angle.drive(45);
 }
 if(lesson.id==='cage')assert.equal(active.tabs[0].start,2,'initial Sum button agrees with displayed net field');
 if(lesson.id==='em-wave'){
  assert.equal(active.tabs[0].start,0);
  const f=10**Number(active.sliders.find(s=>s.label.includes('log₁₀')).input.value);
  const wavelength=Number(active.readout.match(/Wavelength ([0-9.e+-]+) m/)[1]);
  near(f,1e8);near(f*wavelength,G.C,1e5);
 }

 if(gpu){
   const objects=[];active.root.traverse(o=>objects.push(o));
   if(lesson.id==='eclipses'){
     const earth=objects.find(o=>o.geometry?.type==='CylinderGeometry'&&o.geometry.parameters.height===3),params=earth.geometry.parameters;
     const top=new THREE.Vector3(0,1.5,0).applyQuaternion(earth.quaternion).add(earth.position),bottom=new THREE.Vector3(0,-1.5,0).applyQuaternion(earth.quaternion).add(earth.position);
     top.toArray().forEach(v=>near(v,0));near(bottom.x,-3);near(params.radiusTop,6371*2.1/384400);assert.ok(params.radiusBottom<params.radiusTop);
     const moon=objects.find(o=>o.geometry?.type==='CylinderGeometry'&&o.geometry.parameters.height===2.1),mp=G.lunarGeometry(45).moon.map(x=>x/384400*2.1);
     new THREE.Vector3(0,1.05,0).applyQuaternion(moon.quaternion).add(moon.position).toArray().forEach((v,i)=>near(v,mp[i]));assert.ok(moon.geometry.parameters.radiusBottom>moon.geometry.parameters.radiusTop);
   }
   if(lesson.id==='distance-ladder'){
     active.tabs[0].fn(1);const stars=objects.filter(o=>o.geometry?.type==='SphereGeometry'&&o.geometry.parameters.radius===.18);
     assert.equal(stars.length,1);stars[0].position.toArray().forEach(v=>near(v,0));
     assert.ok(objects.some(o=>o.type==='Line'&&o.visible===false),'Cepheid view hides the parallax triangle');active.tabs[0].fn(0);
   }
   if(lesson.id==='generator'){const rings=objects.filter(o=>o.geometry?.type==='TorusGeometry'&&o.visible);assert.equal(rings.length,2);rings.forEach(o=>near(o.geometry.parameters.arc,2*Math.PI));}
   if(lesson.id==='motor'){
     active.tabs[0].fn(1);
     const rings=objects.filter(o=>o.geometry?.type==='TorusGeometry'&&o.visible);
     assert.equal(rings.length,2);rings.forEach(o=>near(o.geometry.parameters.arc,2*Math.PI));
     active.tabs[0].fn(2);
     const blade=objects.find(o=>o.name==='motor-supply-switch');
     assert.ok(blade,'open motor has an inspectable supply switch');
     assert.ok(blade.geometry.attributes.position.array[4]>blade.geometry.attributes.position.array[1]+.15,'open switch blade leaves its contact');
     active.tabs[0].fn(0);
   }
   if(lesson.id==='field-probe'){active.sliders.find(v=>v.label==='Probe distance').drive(6);const marker=objects.find(o=>o.geometry?.type==='SphereGeometry'&&o.geometry.parameters.radius===.08);near(marker.position.x,2.1);}
   if(lesson.id==='bose-counting'){const particles=objects.filter(o=>o.geometry?.type==='SphereGeometry'&&o.geometry.parameters.radius===.15),control=active.sliders.find(v=>v.label==='Arrangement');control.drive(2);near(particles[0].position.x,-.9);control.drive(3);near(particles[0].position.x,.9);near(particles[1].position.x,-.9);}
   if(lesson.id==='protection'){active.sliders.find(v=>v.label==='Prospective leakage').drive(40);assert.ok(active.readout.includes('OPEN'));const blade=objects.find(o=>o.type==='Line'&&o.geometry.attributes.position.count===2&&Math.abs(o.geometry.attributes.position.array[0]+1.6)<1e-5);near(blade.geometry.attributes.position.array[4],1.15,1e-6);}
 }

 const check=()=>{assert.ok(active.readout.length>20,lesson.id+' readout');if(active.root){active.root.updateMatrixWorld(true);active.root.traverse(o=>{assert.ok([...o.position.toArray(),...o.scale.toArray(),...o.quaternion.toArray()].every(Number.isFinite),lesson.id+' finite transforms');if(o.geometry?.attributes?.position)assert.ok(Array.from(o.geometry.attributes.position.array).every(Number.isFinite),lesson.id+' finite geometry');});}sceneChecks++;};check();
 for(const t of active.tabs)for(let i=0;i<t.labels.length;i++){t.fn(i);check();}
 for(const slider of active.sliders){slider.drive(+slider.input.min);check();slider.drive(+slider.input.max);check();}
 for(const button of active.buttons){button.fn();check();}
 for(const dt of [0,.016,.1]){for(const loop of active.loops)loop(dt);check();}
}
console.log(`PASS instantiated scene/control smoke: ${catalog.length} lessons × scene/fallback, ${sceneChecks} finite state checks (no browser or GPU claims)`);

// Probe polarity follows conventional current through the actual selected topology.
const Geometry=await import('../live/fields_models.mjs');
for(const series of [false,true])for(const select of [0,1,2,3,4]){
 const p=Geometry.circuitProbe(series,select),g=Geometry.circuitTopology(series);
 if(select===1)near(p.red[1],g.loads[1].center[1]);
 if(select>=3){const direction=series&&select===4?-1:1;assert.ok((p.black[0]-p.red[0])*direction>0);}
}
near(Geometry.domainNet(0).magnitude,0);near(Geometry.domainNet(100).magnitude,1);
assert.ok(Math.abs(Geometry.domainOrientation(60,true)-Geometry.domainOrientation(80,true))>.05);
near(Geometry.domainNet(70).vector[1],-Geometry.domainNet(-70).vector[1]);
console.log('PASS shared probe polarity/current selection and continuous coherent-domain rotation');

for(const series of [false,true])for(const load of Geometry.circuitTopology(series).loads){
 const leads=Geometry.loadLeads(load);assert.deepEqual(leads[0][0],load.a);assert.deepEqual(leads[2][1],load.b);
 near(leads[0][1][0],load.center[0]-.275);near(leads[1][0][0],load.center[0]+.275);
 near(leads[1][1][0],load.center[0]+.41);near(leads[2][0][0],load.center[0]+.69);
}
console.log('PASS scene/fallback shared load leads connect wires to resistor and both diode ends');

// Close-up is a cut of the selected overview state, with physical radii before display scaling.
const lunarCut=G.eclipseShadowSection(G.lunarGeometry(180),'earth');
near(lunarCut.targetDownstreamKm,384400);near(lunarCut.targetOffsetKm,0);
near(lunarCut.centralSignedRadiusKm,4599.731013349321);near(lunarCut.penumbraRadiusKm,8175.010260306513);
assert.equal(lunarCut.intersects,true);assert.equal(lunarCut.centralKind,'umbra');
const solarCut=G.eclipseShadowSection(G.lunarGeometry(0),'moon');
near(solarCut.centralSignedRadiusKm,-45.775278097208);near(solarCut.penumbraRadiusKm,3529.5039688599845);
assert.equal(solarCut.centralKind,'antumbra');assert.equal(solarCut.intersects,true);
// At the same lunar phase but away from the fixed nodes, show the real radial miss.
const missedCut=G.eclipseShadowSection(G.lunarGeometry(180,90,5.145),'earth');
assert.ok(missedCut.targetOffsetKm>34000);assert.equal(missedCut.intersects,false);
const upstreamCut=G.eclipseShadowSection(G.lunarGeometry(0),'earth');
assert.ok(upstreamCut.targetDownstreamKm<0);assert.equal(upstreamCut.intersects,false);near(upstreamCut.planeKm,384400);
for(const body of ['earth','moon'])for(const phase of [0,45,90,180,270]){
 const q=G.lunarGeometry(phase,70,5.145),cut=G.eclipseShadowSection(q,body);
 near(cut.targetOffsetKm,q.perpendicularKm);near(cut.targetDownstreamKm,body==='earth'?-q.along:q.along);
 near(cut.profile[0].centralSignedRadiusKm,cut.sourceRadiusKm);near(cut.profile[0].penumbraRadiusKm,cut.sourceRadiusKm);
 assert.ok(cut.profile.at(-1).centralSignedRadiusKm<cut.sourceRadiusKm);assert.ok(cut.profile.at(-1).penumbraRadiusKm>cut.sourceRadiusKm);
 // All default-profile cone edges fit the named viewport at 125 km per pixel.
 for(const sample of cut.profile){assert.ok(111-sample.penumbraRadiusKm/125>=41);assert.ok(111+sample.penumbraRadiusKm/125<=187);}
 // Target/penumbra ratios must be invariant under the named ×20 transverse zoom.
 near((cut.targetRadiusKm/125)/(cut.penumbraRadiusKm/125),(cut.targetRadiusKm/6.25)/(cut.penumbraRadiusKm/6.25));
}
assert.ok(Math.abs(solarCut.centralSignedRadiusKm)/6.25>7,'mean-distance antumbra becomes inspectable in the central detail');
console.log('PASS eclipse close-up: shared state, umbra/penumbra/antumbra radii, target misses, common cross-section scale and default visibility');
