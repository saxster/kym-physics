import assert from 'node:assert/strict';
import * as M from '../live/waves_models.mjs';
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} ≠ ${b}`);
// Reference cases come from the textbook grounding and independent analytic limits.
near(M.jouleWork(10,20,1,1).energyJ,1960);
near(M.coolingEnergy(10,40,30),418600);
near(M.coolingEnergy(.005,90,30),1255.8);
near(M.conductionRate(20,.01,[{thickness:.02,k:.04}]),.4);
near(M.phaseState(42).temperatureC,0);near(M.phaseState(200).temperatureC,0);
near(M.phaseState(376).liquidFraction,1);near(M.phaseState(900).temperatureC,100);
near(M.phaseState(3050.6).vapourFraction,1,1e-5);
near(M.pendulumPeriod(1,9.8),2.007089923,1e-8);
near(M.echoDelay(50,349),100/349);
near(M.soundWave(0,0,1,1,.01).pressureUnit,0);
near(M.soundWave(.25,0,1,1,.01).pressureUnit,1);
near(M.malus(0),1);near(M.malus(90),0);near(M.malus(45),.5);
near(M.fresnel( Math.atan(1.333)*180/Math.PI,1,1.333).rp,0,1e-12);
near(M.snell(45,1,1.333).angleDeg,32.03672304,1e-5);
assert.equal(M.snell(60,1.333,1).tir,true);
near(M.pinhole(1,3,.3,.001).imageHeight,.1);
near(M.pinhole(1,3,.3,.003).relativeFlux,9);
near(M.mirrorImage(.2,.1).distance,.2);near(M.mirrorImage(.05,.1).distance,-.1);
for(const distance of [.2,.6,1.5,3])for(const eyeZ of [-1,0,.8]){
 const p=M.planeMirrorPath(distance,2,1,eyeZ);
 const incoming=p.hit.map((x,k)=>x-p.object[k]),outgoing=p.eye.map((x,k)=>x-p.hit[k]);
 const a=Math.hypot(...incoming),b=Math.hypot(...outgoing);
 near(incoming[0]/a,-outgoing[0]/b);
 near(incoming[1]/a,outgoing[1]/b);near(incoming[2]/a,outgoing[2]/b);
}
near(M.fizeauFrequency(8633,720),12.05775553,1e-5);
for(const multiplier of [0,.25,.5,.75,1,1.5,2]){
 const q=M.fizeauReturn(M.fizeauFrequency(8633,720)*multiplier);
 near(q.transmission,Math.abs(1-multiplier),1e-10);
 if(Math.abs(Math.cos(q.phase))>1e-10)assert.equal(q.markerFraction>.5,q.centralRayBlocked);
 let pass=0,launched=0;
 for(let j=0;j<4000;j++){const phi=2*Math.PI*(j+.5)/4000;if(Math.cos(phi)>0){launched++;if(Math.cos(phi+q.phase)>0)pass++;}}
 near(q.transmission,pass/launched,.001);
}
near(M.lightTime(384400e3),1.2822204,1e-6);
near(M.doubleSlit(0,.0005,550e-9,1).intensity,1);
near(M.singleSlit(0,.0001,550e-9,1),1);
near(M.aragoIntensity(0,.001,550e-9,1),1);
const red=M.rainbowPath(.86,1.331),violet=M.rainbowPath(.86,1.342);
assert.ok(red.rainbowAngleDeg>violet.rainbowAngleDeg);
assert.ok(red.rainbowAngleDeg>41&&red.rainbowAngleDeg<43);
const r=M.raman(532,1000);near(r.stokesNm,561.8926912,1e-6);near(r.antiStokesNm,505.12723130,1e-6);
near(M.doppler(300,22,0,349),320.1834862,1e-6);
near(M.doppler(300,22,22,349),300);
near(M.carnot(.5,600,300,100).work,25);
for(let m=0;m<3;m++)near(M.membraneShape(m,1,.4),0,1e-6);
const loaded=M.membraneFrequency(1,5)/M.membraneFrequency(0,5);
assert.ok(loaded>1.593,'centre loading raises relative spacing in this Rayleigh trial');
const coin=M.coinRay(1,2,3,1.333);
near(1.333*Math.sin(coin.waterAngle),Math.sin(coin.airAngle));
assert.ok(coin.hitX<1,'refraction exposes a coin behind the selected rim');
console.log('PASS waves/thermal/optical reference cases and limiting behaviours');
// Distribution normalisation and independent work/energy account over 20 seconds.
for(const T of [30,40,90]){
 let integral=0;for(let speed=1;speed<3000;speed+=2)integral+=2*M.maxwellSpeed(speed,T);
 near(integral,1,1e-7);
}
let osc={x:0,velocity:0,work:0,loss:0,time:0};
for(let j=0;j<400;j++)osc=M.oscillatorStep(osc,.05,{frequency:.5,damping:.12,force:.4});
near(osc.work-osc.loss,(osc.velocity**2+Math.PI**2*osc.x**2)/2,1e-8);
const noFriction=M.waterWave(.6,-.25,0,2,.1),period=2*Math.PI/noFriction.omega;
const again=M.waterWave(.6,-.25,period,2,.1);
near(noFriction.x,again.x);near(noFriction.z,again.z);
assert.equal(M.guidePath(0,1.5).escaped,false);
assert.equal(M.guidePath(40,1.5).escaped,true);
near(M.prismDeviation(1.512).deviationDeg,38.22576364,1e-7);
near(M.glassIndex(660),1.512);near(M.glassIndex(410),1.530);
near(M.waterIndex(660),1.331);near(M.waterIndex(410),1.342);
console.log('PASS work/energy integration, thermal distributions, return orbits and computed ray limits');

// Independent geometric oracles exercise the very state consumed by the renderers.
const cross2=(a,b)=>a[0]*b[1]-a[1]*b[0];
for(const mass of [10,20]){
 const F=M.pendulumForces(mass,Math.PI/6);
 near(F.weight[1],-9.8*mass);near(Math.hypot(...F.tangent),9.8*mass*.5);
 near(F.tangent[0]*.5-F.tangent[1]*Math.sqrt(3)/2,0); // perpendicular to actual downward string
 assert.ok(F.tangent[0]*Math.cos(Math.PI/6)+F.tangent[1]*Math.sin(Math.PI/6)<0); // restores toward theta=0
}
for(const theta of [-.7,-.2,0,.2,.7]){
 const F=M.pendulumForces(10,theta),radial=[Math.sin(theta),-Math.cos(theta)],dot=F.weight[0]*radial[0]+F.weight[1]*radial[1];
 F.tangent.forEach((x,k)=>near(x,F.weight[k]-dot*radial[k]));
 near(F.tangent[0]*radial[0]+F.tangent[1]*radial[1],0);
 assert.ok(theta*(F.tangent[0]*Math.cos(theta)+F.tangent[1]*Math.sin(theta))<=0);
}
const dry=Array.from({length:48},(_,i)=>M.evaporationSample(i,20,1));
const humid=Array.from({length:48},(_,i)=>M.evaporationSample(i,81,1));
assert.ok(dry.filter(s=>s.escaping).length>humid.filter(s=>s.escaping).length);
for(const e of dry.filter(e=>e.active)){assert.ok(e.energy>1.2);assert.ok(e.position[1]>-.14);}
for(const distance of [.2,.4,1.2,3])for(const f of [.6,-.6]){
 const g=M.curvedMirrorRays(distance,f);
 for(const r of g.rays)near(cross2([g.image[0]-r.hit[0],g.image[1]-r.hit[1]],r.direction),0,1e-10);
 near(g.source[1],.3);near(g.image[1],-.3*g.distance/distance);
}
for(const mode of [0,1,2])for(const distance of [.25,2,10]){
 const e=M.reducedEye(distance,mode,.005);
 for(const r of e.rays){near(r.at(e.imageDistance),e.imageHeight,1e-12);near(r.at(.02),r.retinaHeight,1e-12);near(r.height-distance*r.incomingSlope,.005,1e-12);}
 near(e.rays[1].incomingSlope,e.rays[1].outgoingSlope,1e-12); // central ray never kinks
 near(e.retinalCentre,-.0001/distance,1e-12);
 near(e.blurDiameter,Math.abs(e.rays[2].retinaHeight-e.rays[0].retinaHeight),1e-12);
 if(mode!==1){near(e.imageDistance,.02,1e-12);near(e.blurDiameter,0,1e-12);}else assert.ok(e.imageDistance>.04);
}
for(let altitude=0;altitude<=90;altitude+=5){
 const g=M.skyScatterGeometry(altitude),r=P=>Math.hypot(P[0],P[1]+1);
 near(r(g.directEntry),1.15);near(r(g.scatterEntry),1.15);
 assert.ok(r(g.vertex)>1&&r(g.vertex)<1.15);
 for(const [entry,target] of [[g.directEntry,g.observer],[g.scatterEntry,g.vertex]]){
  near(cross2([entry[0]-target[0],entry[1]-target[1]],g.sun),0,1e-12);
  for(let k=0;k<=100;k++){const f=k/100,P=entry.map((v,i)=>v+(target[i]-v)*f);assert.ok(r(P)>=1-1e-12,'sunlight must not cross globe');}
 }
 for(let k=0;k<=100;k++){const f=k/100,P=g.vertex.map((v,i)=>v+(g.observer[i]-v)*f);assert.ok(r(P)>=1-1e-12,'scattered route must not cross globe');}
}
for(const angle of [0,20,53.1,85]){
 const g=M.waterGlareGeometry(angle);near(g.contact[1],-.8);
 near(g.incidentDirection[0],g.reflectedDirection[0]);near(g.incidentDirection[1],-g.reflectedDirection[1]);
 near(g.p.reduce((s,x,i)=>s+x*g.reflectedDirection[i],0),0);
 near(g.s.reduce((s,x,i)=>s+x*g.reflectedDirection[i],0),0);
 const A=g.analyser.map((x,i)=>x-g.contact[i]);near(cross2(A,g.reflectedDirection),0);
}
// Continuous-aperture and rim reference formulas are independent convergence oracles.
for(const y of [-.01,-.001,0,.001,.01]){
 const sampled=M.aperturePhases(y,.0002,550e-9,1);
 near(sampled.intensity,M.singleSlit(y,.0002,550e-9,1),.0001);
 near(M.aperturePhases(y,.0002,550e-9,1,true).intensity,M.grating(y,.0002,550e-9,1),1e-12);
}
for(const r of [0,.0001,.001,.002])for(const R of [.0005,.001,.002])near(M.rimPhases(r,R,550e-9,1).intensity,M.aragoIntensity(r,R,550e-9,1),1e-10);
near(M.rimPhases(0,.001,550e-9,1).real,1);near(M.rimPhases(0,.001,550e-9,1).imaginary,0);
assert.ok(new Set(M.rimPhases(.001,.001,550e-9,1).phases.map(p=>p.toFixed(6))).size>10);
for(const nm of [400,550,700])for(const thickness of [50,300,800])near(M.filmPhases(nm,thickness).intensity,M.thinFilm(nm,thickness),1e-12);
// Wave crests translated by the same distance have the same phase: equal visual propagation speed.
for(const outNm of [r.stokesNm,532,r.antiStokesNm]){
 near(M.ramanPhase(.25+1/(2*Math.PI),1,532,outNm),M.ramanPhase(.25,0,532,outNm));
 const period=Math.PI*outNm/532;
 near(M.ramanPhase(.25,period,532,outNm)-M.ramanPhase(.25,0,532,outNm),-2*Math.PI);
}
console.log('PASS renderer-shared mirror/eye/sky/glare geometry, energetic escape, phase convergence and Raman propagation');

// Mount each real subject renderer without a browser. This checks first-frame story
// controls against rendered readouts and catches non-finite generated coordinates.
const {readFileSync}=await import('node:fs');
const {Group}=await import('../node_modules/three/build/three.module.js');
const {mountThermal}=await import('../live/waves_thermal.js');
const {mountMotion}=await import('../live/waves_motion.js');
const {mountOptics}=await import('../live/waves_optics.js');
const {mountColour}=await import('../live/waves_colour.js');
const catalog=JSON.parse(readFileSync(new URL('../lessons/waves.json',import.meta.url)));
const colors={ink:'#18202a',muted:'#777777',sheet:'#eeeeee',rule:'#bbbbbb',proton:'#aa4433',electron:'#3366aa',neutron:'#a68b32',green:'#228866'};
const context=new Proxy({}, {get:(_,key)=>key==='measureText'?s=>({width:s.length*7}):(...args)=>{for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg),`nonfinite canvas argument for ${String(key)}`);},set:()=>true});
for(const entry of catalog){
 const variants=[[null,{}],...Object.entries(entry.storyPresets||{})];
 for(const [story,preset] of variants){
  let render=()=>{},readout='';const root=new Group(),sliders=[],tabs=[],loops=[];
  const lab={kit:{root,label(){}},refresh(){render(context,640,240);},redraw(fn){render=fn;render(context,640,240);},say(s){readout=s;}};
  const api={colors:()=>colors,slider(name,opts){sliders.push({name,...opts});},tabs(labels,onSelect,start=0){tabs.push({labels,onSelect,start});},loop(fn){loops.push(fn);},button(){},onHide(){},onCleanup(){},audio(){throw new Error('Audio must not open during mount');}};
  const mount=entry.id.startsWith('w8-')?mountThermal:entry.id.startsWith('w9-')?mountMotion:entry.id.startsWith('w10-')?mountOptics:mountColour;
  mount(lab,api,entry.id,story,preset);
  if(preset.load!==undefined){near(sliders.find(x=>x.name==='Central mass loading').value,preset.load);assert.equal(tabs[0].start,preset.selection);assert.match(readout,/Drum mode/);}
  if(preset.glare){assert.equal(tabs[0].start,1);near(sliders.find(x=>x.name==='Incidence angle on water').value,preset.incidence);assert.match(readout,/Rs=/);}
  if(preset.mode!==undefined){assert.equal(tabs[0].start,preset.mode);assert.match(readout,/Stokes scattering/);}
  for(const slider of sliders)for(const endpoint of [slider.min,slider.max]){slider.onInput(endpoint);render(context,640,240);}
  for(const tab of tabs)for(let i=0;i<tab.labels.length;i++){tab.onSelect(i);render(context,640,240);}
  for(const fn of loops)fn(.1);render(context,640,240);
  root.updateMatrixWorld(true);root.traverse(o=>{const a=o.geometry?.attributes?.position;if(a)for(const n of a.array)assert.ok(Number.isFinite(n),`${entry.id} generated nonfinite geometry`);if(o.matrixWorld)for(const n of o.matrixWorld.elements)assert.ok(Number.isFinite(n));});
 }
}
console.log('PASS all34 real renderer mounts, story first-frame controls, endpoint/preset redraws and finite geometry');
