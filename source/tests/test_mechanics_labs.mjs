// Public model checks: SI quantities and independent worked examples, not pixels.
import assert from 'node:assert/strict';
import * as M from '../live/mechanics_models.mjs';
const near=(actual,expected,tol=1e-8)=>assert.ok(Math.abs(actual-expected)<=tol,`${actual} != ${expected} ± ${tol}`);

// Geometry: a 2 m eye has an approximately 5.05 km sea horizon.
near(M.horizon(2,0).horizonKm,5.04817,.001);
assert.ok(M.horizon(20,10).hiddenMetres<M.horizon(2,10).hiddenMetres);
near(M.horizon(2,10,true).hiddenMetres,0);
assert.deepEqual(M.scaleFactors(2),{length:2,area:4,volume:8});
near(M.rainfall(600,100).volume,60_000_000);
near(M.rainfall(600,100).tonnes,60_000_000);
near(M.earthMeasure(5000,7.2,160).circumferenceKm,40_000);
const biased=M.measurement(36.5,.1,2,0);
near(biased.mean,38.5);near(biased.range,0);

// Relative motion: 80 km/h plus a 5 km/h walk gives 85 km/h.
near(M.relativeVelocity(80,5),85);
near(M.trainPosition(4,10,2),24); // braking: 10*4 - .5*2*16
near(M.trainPosition(8,10,2),25); // train remains stopped after t=5 s
near(M.walk(9).distance,9);near(M.walk(9).x,3);
near(M.walk(12).averageVelocity,.25);
near(M.constantAcceleration(2,-4,2).v,0);
near(M.constantAcceleration(2,-4,2).a,2);
near(M.ramp(30,2,false).a,4.9);
near(M.ramp(30,2,true).a,3.5);
near(M.toss(4.9/9.8,4.9).v,0);
near(M.toss(.5,4.9).a,-9.8);
near(M.slide(4,.2,10).distance,4.081632653061225);
near(M.slide(4,0,10).v,4);
near(M.shove(4,0,.2).v,2);near(M.shove(4,0,.4).distance,.8);
near(M.shove(4,0,1.4).distance,4.8);near(M.shove(4,.2,.5).hand,0);
near(M.shove(4,.2,5).friction,0);
near(M.friction(20,10).force,-20); // static, not μN at every push
near(M.friction(60,10).force,-34.3); // kinetic resistance after slipping
near(M.tablecloth(.1,.3,1).totalDistance,.0294);
near(M.tablecloth(.1,.3,10).totalDistance,.0294); // mass cancels
near(M.resultant(5,90,1).magnitude,Math.sqrt(50));
near(M.support(10,0,1000).compression,.098);
near(M.support(10,60,1000).normal,49);
near(M.forcePair(1,100,10).a1,10);near(M.forcePair(1,100,10).a2,-.1);
const recoil=M.recoil(70,1,7.1);
near(recoil.v1,.1);near(70*recoil.v1+recoil.v2,0);
for(const fuel of [.5,1,10])for(const t of [0,.1,.7,2.8,6]){
  const seq=M.rocketSequence(fuel,t);near(seq.craftMomentum+seq.exhaustMomentum,0,1e-12);near(seq.centre,0,1e-12);
}

// Air and gravity are independent. With no air both masses start and stay alike.
near(M.fall(1,1,0,9.8).distance,4.9);
near(M.fall(1,10,0,9.8).distance,4.9);
near(M.fall(0,1,2,9.8).a,9.8);
near(M.fall(20,1,.2,9.8).v,7,1e-8);
near(M.projectile(.75,2,.2).height,.554);
near(M.projectile(.75,2,.2).x,.4);
near(M.circle(2,4,0).a,8);
near(M.gravity(2).ratio,.25);
near(M.gravity(60).tangentGap60,4.9,.00001);
near(M.weightless(400,true).sensor,0);
near(M.weightless(400,false).sensor,8.69,.02);

// Kepler: unit circular orbit, and an ellipse's apsides and constant area rate.
const circular=M.orbit(0,1,0,1);
near(circular.x,1);near(circular.y,0);near(circular.period,2*Math.PI);
const peri=M.orbit(.5,2,0,1),apo=M.orbit(.5,2,Math.PI,1);
near(peri.radius,1);near(apo.radius,3);
near(peri.speed/apo.speed,3);
near(peri.arealRate,apo.arealRate);
near(M.torsion(5,.1).torque,-M.torsion(5,-.1).torque,1e-16);
near(M.torsion(0,.1).angle,0);
const burn=M.burn(6601,71000,0);
near(burn.apoKm,77371,1e-6); // input apogee HEIGHT + Earth's radius
assert.ok(M.burn(6601,71000,.1).apoKm>burn.apoKm);
near(M.capture(1.5,0).energy,1.125,1e-8); // hyperbolic excess specific energy
assert.ok(M.capture(1.5,1).energy<0);

// Hydrostatics: p=ρgh, dam pressure triangle, displaced weight and layers.
near(M.pressure(98,.01).pressure,9800);
near(M.suction(101000,0,1000).height,10.306122448979592);
near(M.suction(101000,0,13600).height,.7578031212484994);
near(M.hydrostatic(2,5).baseGauge,19600);
near(M.hydrostatic(2,5).damForce,98000);
near(M.buoyancy(10,.02,1000).fraction,.5);
near(M.buoyancy(10,.02,1000).buoyancy,98);
near(M.buoyancy(10,.001,1000).support,88.2);
near(M.layered(1050,1000,1200).lowerFraction,.25);

// Work, power, losses and heat engines conserve the specified account.
near(M.energyAccount(.1,1,.64,.5).total,.98);
const e=M.energyAccount(.1,1,.64,1.5);
near(e.kinetic+e.gravitational+e.ballThermal+e.floorThermal+e.airThermal,.98);
near(M.impact(.02,2,1).distance,.04);
near(M.impact(.02,4,1).distance,.16);
near(M.work(2,3,6).energy,58.8);
near(M.work(2,3,3).energy,58.8);
near(M.power(2000,.25).kWh,.5);
near(M.power(10,24).kWh,.24);
near(M.station(100,.4).electrical+M.station(100,.4).rejected,100);
near(M.wheel(100,10,10).remaining,0);
near(M.stevin(1,4,2).leftForce,M.stevin(1,4,2).rightForce);
near(M.heatEngine(600,300,1).efficiency,.5);
near(M.heatEngine(600,300,1).work+M.heatEngine(600,300,1).rejected,1000);

// Perturbation has no effect when its mass is zero; one small pull changes the orbit.
const p0=M.perturbedOrbit(0,4),p1=M.perturbedOrbit(.001,4);
near(p0.difference,0,1e-12);assert.ok(p1.difference>0);
assert.ok(p0.energyError<1e-7);
console.log('PASS mechanics lesson models: geometry, motion, force, orbit, fluids and energy');

// Constraint cases introduced by the independent mechanism review.
// Force balance must match acceleration at arbitrary mass, shape and air density.
for(const mass of [.001,.1,1])for(const area of [.0001,.001,.02])for(const air of [0,.5,1])for(const g of [1.67,9.8]) {
 const p=M.fallingBody(2,mass,area,1.1,air,g);
 near((p.weight-p.drag)/mass,p.a,1e-10);
 if(!air)near(p.distance,2*g); // s=.5*g*(2 s)^2, independent of mass/shape
}
const balanced=M.fallingBody(100,.01,.01,1.1,1,9.8);
near(balanced.weight,balanced.drag,1e-12);near(balanced.a,0,1e-12);
for(const r of [1,2,3,60]){
 const p=M.sphericalField(r,18);near(p.area*p.field,4*Math.PI*9.8);
 p.points.forEach(q=>near(Math.hypot(...q),r,1e-12));
}
const free=M.cabinFall(.5,400,true),supported=M.cabinFall(.5,400,false);
near(free.support,0);near(free.displacement,-free.g/8);near(supported.compression*7000,70*supported.g);
// An initial displacement starts at rest and damping dissipates relative energy.
const td=20*Math.PI/(180*3600),td0=M.torsionResponse(.00001,0,td);
near(td0.angle,.00001+td);near(td0.velocity,0);
let previous=Infinity;for(let t=0;t<5000;t+=25){const p=M.torsionResponse(.00001,t,td);assert.ok(p.energy<=previous+1e-22);previous=p.energy;}
// Independently known planet apsidal radius ratios; true eccentricity stays small.
near(M.orbit(.0167,1,Math.PI).radius/M.orbit(.0167,1,0).radius,1.033967253127225,1e-9);
near(M.orbit(.0935,1,0).radius,.9065);
// Propagation must conserve energy and angular momentum, and its derivative is velocity.
for(const lunar of [false,true])for(const dv of lunar?[0,.5,.9]:[0,.1,.7]){
 const p=lunar?M.capture(1.5,dv):M.burn(6601,71000,dv),rp=lunar?p.rp:6601,mu=lunar?4902.8001:M.MU_EARTH_KM;
 const q0=M.conicState(rp,p.v,mu,0);near(q0.x,rp,1e-7);near(q0.y,0,1e-7);
 for(const t of [-1000,1000,10000]){const q=M.conicState(rp,p.v,mu,t),a=M.conicState(rp,p.v,mu,t-.01),b=M.conicState(rp,p.v,mu,t+.01);near(q.vx,(b.x-a.x)/.02,2e-7);near(q.vy,(b.y-a.y)/.02,2e-7);near((q.vx*q.vx+q.vy*q.vy)/2-mu/q.radius,p.energy,1e-9);near(q.x*q.vy-q.y*q.vx,rp*p.v,1e-6);}
 if(p.bound){const end=M.missionCoast(rp,p.v,mu,400000),q=M.conicState(rp,p.v,mu,end);near(q.radius,p.apoKm,1e-6);near(q.vx,0,1e-10);}
}
// The correct hidden-planet angle must match both observed residual components.
const observed=M.perturbedOrbit(.001,4,.9),correct=M.perturbedOrbit(.001,4,.9),wrong=M.perturbedOrbit(.001,4,Math.PI);
assert.deepEqual(observed.residual,correct.residual);assert.ok(Math.hypot(wrong.residual.at(-1)[0]-observed.residual.at(-1)[0],wrong.residual.at(-1)[1]-observed.residual.at(-1)[1])>1e-4);
// Numerical integration of the actual asymmetric egg slices independently checks its inverse.
for(const rho of [1000,1050,1100,1150,1200]){
 const p=M.eggInterface(rho);let lower=0,total=0;for(let j=0;j<100000;j++){const u=-1+(j+.5)*2/100000,area=(1-u*u)*(1-.2*u)**2;total+=area;if(u<=p.interfaceU)lower+=area;}
 near(lower/total,p.fraction,2e-5);near(1000*(1-p.fraction)+1200*p.fraction,rho);
}
assert.ok(Math.abs(M.eggInterface(1100).interfaceU)>.05); // half volume isn't half height
const rolling=M.rollingEnergy(2,3,true),sliding=M.rollingEnergy(2,3,false);
near(rolling.translation,42);near(rolling.rotation,16.8);near(rolling.translation+rolling.rotation,58.8);near(sliding.v**2/rolling.v**2,7/5);near(rolling.v,.2*rolling.omega);
near(M.household(24).kWh,1.37);near(M.household(7.1).watts,2010);
for(const t of [0,10,30,120]){
 const p=M.generatorWheel(1000,100,t);near(p.remaining+p.delivered,1000);near(p.power,p.torque*p.omega);near(p.omega*p.omega/2,p.remaining);
 const before=M.generatorWheel(1000,100,t-.001),after=M.generatorWheel(1000,100,t+.001);near((before.remaining-after.remaining)/.002,p.power,1e-6);near((after.angle-before.angle)/.002,p.omega,1e-6);
}
near(M.generatorWheel(1000,0,120).remaining,1000);
for(const h of [.3,1,1.5]){
 const p=M.stevinChain(h),a=p.curve[0],b=p.curve.at(-1);near(a[0],p.left);near(b[0],p.right);near(a[1],0);near(b[1],0);near(p.leftMass*9.8*Math.sin(p.leftAngle),p.rightMass*9.8*Math.sin(p.rightAngle));
 p.curve.forEach((q,i)=>near(q[1],p.curve[p.curve.length-1-i][1]));
 // Arc coordinate s=a*sinh((x-mid)/a) gives equal .5 m bead spacing.
 const mid=(p.left+p.right)/2,aa=(p.right-p.left)/2*1.1;
 for(let j=1;j<p.beads.length;j++)near(aa*(Math.sinh((p.beads[j][0]-mid)/aa)-Math.sinh((p.beads[j-1][0]-mid)/aa)),.5);
}
console.log('PASS independent mechanism constraints: force/flux/contact/orbit/egg/rolling/schedule/generator/chain');

// Instantiate actual renderers without WebGL. These checks inspect their meshes,
// not a duplicate drawing function, and exercise extrema through the real controls.
const {Group,Vector3}=await import('../node_modules/three/build/three.module.js');
const {build}=await import('../node_modules/esbuild/lib/main.js');
const textbook=await build({entryPoints:[new URL('../live/w_mechanicslab.js',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'headless-widget-shell',setup(b){b.onLoad({filter:/\/core\.js$/},()=>({contents:'export const Live={register(){}};'}));b.onLoad({filter:/\/lab_kit\.js$/},()=>({contents:'export function makeLab(){}'}));}}]});
const {RENDERERS}=await import('data:text/javascript;base64,'+Buffer.from(textbook.outputFiles[0].contents).toString('base64'));
const Space=await import('../live/mechanics_space.js'),Fluids=await import('../live/mechanics_fluids.js'),Energy=await import('../live/mechanics_energy.js');
const palette={paper:'#fbfaf5',ink:'#202020',proton:'#cc4444',electron:'#4477cc',neutron:'#bb9922',muted:'#888888',rule:'#cccccc',green:'#228855'};
function apparatus(builder,webgl=true){
 const sliders=[],tabs=[],buttons=[],loops=[],calls=[],root=new Group();let draw=()=>{},speech='',teaching={},playback=null,frameRadius=null,frameCalls=0;
 const ctx=new Proxy({measureText:t=>({width:String(t).length*7})},{get:(obj,key)=>key in obj?obj[key]:(...args)=>{calls.push({method:key,args});},set:(obj,key,v)=>{obj[key]=v;return true;}});
 const api={playback(enabled){playback=enabled;},slider(label,options){const record={label,...options,input:{disabled:false,min:String(options.min),max:String(options.max),step:String(options.step),value:String(options.value)},set(v){record.value=v;record.input.value=String(v);},setLabel(text){record.label=text;},drive(v){record.set(v);options.onInput(v);}};sliders.push(record);return record;},tabs(labels,fn,start=0){const record={labels,activeIdx:start},items=labels.map((label,i)=>({label,pressed:i===start}));items.setActive=i=>{record.activeIdx=i;items.forEach((b,j)=>b.pressed=i===j);};record.fn=i=>{items.setActive(i);fn(i);};record.items=items;tabs.push(record);return items;},button(label,fn){buttons.push({label,fn});},loop(fn){loops.push(fn);}};
 const lab={kit:webgl?{root,label(){}}:null,frame(r){frameRadius=r;frameCalls++;},redraw(fn){draw=fn;draw(ctx,640,240);},refresh(){draw(ctx,640,240);},say(text){speech=text;},teach(next){teaching={...teaching,...next};}};
 builder(lab,api,palette);return {root,sliders,tabs,buttons,loops,calls,lab,get speech(){return speech;},get teaching(){return teaching;},get playback(){return playback;},get frameRadius(){return frameRadius;},get frameCalls(){return frameCalls;}};
}
function actualMeshes(a){const out=[];a.root.traverse(o=>{if(o.isMesh)out.push(o);});return out;}
function finiteApparatus(a){a.root.traverse(o=>{for(const value of [...o.position.toArray(),...o.scale.toArray(),o.rotation.x,o.rotation.y,o.rotation.z])assert.ok(Number.isFinite(value),`nonfinite transform ${value}`);for(const attr of Object.values(o.geometry?.attributes??{}))for(const value of attr.array)assert.ok(Number.isFinite(value));});assert.ok(!a.speech.includes('NaN'));}
for(const group of [Space,Fluids,Energy,RENDERERS])for(const [name,builder] of Object.entries(group)){
 const a=apparatus(builder);finiteApparatus(a);
 for(const control of a.sliders){for(const value of [control.min,control.max]){control.onInput(value);finiteApparatus(a);}}
 for(const control of a.tabs){for(let i=0;i<control.labels.length;i++){control.fn(i);finiteApparatus(a);}}
 for(const control of a.buttons){control.fn();finiteApparatus(a);}for(const loop of a.loops)loop(.1);finiteApparatus(a);
 const fallback=apparatus(builder,false);finiteApparatus(fallback);assert.ok(fallback.speech.length>40,`missing fallback for ${name}`);
}
const ship=apparatus(Fluids.hull),envelope=actualMeshes(ship).find(m=>m.geometry.parameters.width===2&&m.geometry.parameters.height===.6&&m.geometry.parameters.depth===1&&m.material.opacity===.15);
near(- (envelope.position.y-.3*envelope.scale.y)/(.6*envelope.scale.y),.5); // actual half-draft
ship.sliders.find(c=>c.label==='Sealed outer volume').onInput(5);ship.sliders.find(c=>c.label.startsWith('Cargo')).onInput(20);
near(envelope.position.y-.3*envelope.scale.y,-1.5); // hull touches actual floor when sunk
const floor=actualMeshes(ship).find(m=>m.geometry.parameters.width===5&&m.geometry.parameters.height===.06);near(floor.position.y+.03,-1.5);
ship.tabs[0].fn(2);ship.sliders.find(c=>c.label==='Egg density').onInput(1100);
const eggMesh=actualMeshes(ship).find(m=>m.geometry.type==='LatheGeometry');near(eggMesh.position.y,-M.eggInterface(1100).interfaceU*.55);
assert.ok(Math.abs(eggMesh.position.y)>.02); // actual mesh changes height from volume calculation
const gauge=apparatus(Fluids.suction),column=actualMeshes(gauge).find(m=>m.geometry.parameters.width===.26&&m.geometry.parameters.height===1),reservoir=actualMeshes(gauge).find(m=>m.geometry.parameters.width===1.4&&m.geometry.parameters.height===.22);
for(const inside of [0,50000,101000]){gauge.sliders[0].onInput(inside);near(column.position.y-column.scale.y/2,reservoir.position.y+.11,1e-4);near(column.scale.y,M.suction(101000,inside,1000).height*.27,1e-4);}
gauge.tabs.find(t=>t.labels.includes('Hemispheres cutaway')).fn(2);
assert.equal(actualMeshes(gauge).filter(m=>m.geometry.type==='SphereGeometry'&&m.geometry.parameters.thetaLength===Math.PI/2&&m.visible).length,2);
const cabin=apparatus(Space.weightless);cabin.tabs[0].fn(1);const plate=actualMeshes(cabin).find(m=>m.geometry.parameters.width===.75),foot=actualMeshes(cabin).find(m=>m.geometry.parameters.width===.36);
near(foot.position.y-.05+foot.parent.position.y,plate.position.y+.03); // actual foot/scale contact
const floorCabin=actualMeshes(cabin).find(m=>m.geometry.parameters.width===2.6&&m.geometry.parameters.height===.08);near(floorCabin.position.y+.04,-.96);
const fallApp=apparatus(Space.fall),denseSpheres=actualMeshes(fallApp).filter(m=>m.geometry.type==='SphereGeometry'&&m.geometry.parameters.radius===.16);
assert.equal(denseSpheres.length,2);assert.ok(denseSpheres.every(m=>m.visible));
fallApp.sliders.find(c=>c.label==='Selected projected area').onInput(.004);near(denseSpheres[0].scale.x,2);near(denseSpheres[1].scale.x,1);
console.log('PASS actual renderer states: mesh contacts/draft/egg/column/hemispheres/silhouettes and control extrema');

// The actual three-arrow construction must close; checking only equal downhill
// magnitudes would miss a normal component drawn on the wrong side.
const wreath=apparatus(Energy.stevin),vectorGroups=[];wreath.root.traverse(o=>{if(o.isGroup&&o.children.length===2&&o.children[1].geometry?.type==='ConeGeometry')vectorGroups.push(o);});
assert.equal(vectorGroups.length,6);
function drawnVector(group){const shaft=group.children[0],tip=group.children[1],length=shaft.scale.y+.19*tip.scale.y;return new Vector3(0,length,0).applyQuaternion(group.quaternion);}
for(const side of [0,1]){const w=drawnVector(vectorGroups[side*3]),parallel=drawnVector(vectorGroups[side*3+1]),normal=drawnVector(vectorGroups[side*3+2]);near(w.x,parallel.x+normal.x);near(w.y,parallel.y+normal.y);near(w.dot(normal.clone().cross(parallel)),0);}
console.log('PASS actual chain force-vector decomposition closes');

// Closure regressions inspect canvas commands as well as the 3D mesh account.
const fallingFallback=apparatus(Space.weightless,false);fallingFallback.calls.length=0;fallingFallback.sliders.find(c=>c.label==='Replay time').onInput(.5);
const cabinRectangle=fallingFallback.calls.find(c=>c.method==='strokeRect'&&c.args[0]===55);assert.ok(cabinRectangle.args[1]>70,'free-fall cabin must move down on canvas');
const cabinDot=fallingFallback.calls.find(c=>c.method==='arc'&&c.args[0]===105);near(cabinDot.args[1],cabinRectangle.args[1]+35);
const pressureFallback=apparatus(Fluids.suction,false);pressureFallback.calls.length=0;pressureFallback.sliders[0].onInput(50000);
const canvasLabel=(a,label)=>a.calls.find(c=>c.method==='fillText'&&c.args[0]===label)?.args;
const outsideLabel=canvasLabel(pressureFallback,'p outside A'),weightLabel=canvasLabel(pressureFallback,'weight'),gasLabel=canvasLabel(pressureFallback,'p top A'),columnTop=175-M.suction(101000,50000,1000).height*10;
const outsidePixels=175-outsideLabel[2]-6,weightPixels=weightLabel[2]+6-columnTop,gasPixels=gasLabel[2]+6-(columnTop-30);near(outsidePixels,weightPixels+gasPixels);
pressureFallback.calls.length=0;pressureFallback.sliders[0].onInput(101000);assert.equal(canvasLabel(pressureFallback,'weight'),undefined,'zero-height column must have no weight arrow');
const orbitLabel=apparatus(Space.kepler,false);orbitLabel.tabs[0].fn(0);orbitLabel.calls.length=0;orbitLabel.sliders.find(c=>c.label==='Teaching eccentricity').onInput(.3);assert.ok(orbitLabel.calls.some(c=>c.method==='fillText'&&String(c.args[0]).startsWith('User-selected eccentricity')));
assert.equal(orbitLabel.tabs[0].activeIdx,-1,'custom eccentricity clears the named planet preset');
const powerPreset=apparatus(Energy.power,false);powerPreset.sliders[0].drive(1000);assert.equal(powerPreset.tabs[0].activeIdx,-1);powerPreset.tabs[0].fn(1);powerPreset.sliders[1].drive(12);assert.equal(powerPreset.tabs[0].activeIdx,-1);powerPreset.tabs[0].fn(2);powerPreset.sliders[1].drive(6);assert.equal(powerPreset.tabs[0].activeIdx,2,'household time belongs to the same schedule');
const hemisphere=apparatus(Fluids.suction);hemisphere.sliders[0].onInput(101000);hemisphere.calls.length=0;hemisphere.tabs.find(t=>t.labels.includes('Hemispheres cutaway')).fn(2);
const pressureGroups=[];hemisphere.root.traverse(o=>{if(o.isGroup&&o.visible&&o.children[1]?.geometry?.type==='ConeGeometry')pressureGroups.push(o);});assert.equal(pressureGroups.length,12);pressureGroups.forEach(g=>near(drawnVector(g).length(),.45));
function canvasSegment(a,x,y){const i=a.calls.findIndex(c=>c.method==='moveTo'&&c.args[0]===x&&c.args[1]===y);assert.ok(i>=0);assert.equal(a.calls[i+1].method,'lineTo');return Math.hypot(a.calls[i+1].args[0]-x,a.calls[i+1].args[1]-y);}
near(canvasSegment(hemisphere,48,130),canvasSegment(hemisphere,135,130));
console.log('PASS closure renderer limits: downward shared fall, common pressure scale/zero weight, preset identity');

// The learner's visible time/progress control must follow resets and playback,
// rather than describing a different state from the actual scene/readout.
const fallControls=apparatus(Space.fall),fallTime=fallControls.sliders.find(c=>c.label==='Replay time');
fallTime.drive(4);fallControls.tabs.find(t=>t.labels.includes('Hammer and feather')).fn(2);
near(fallTime.value,0);assert.equal(fallControls.tabs.find(t=>t.labels.includes('Feather')).activeIdx,2);
fallControls.tabs.find(t=>t.labels.includes('Edit blue body')).fn(1);
assert.equal(fallControls.tabs.find(t=>t.labels.includes('Feather')).activeIdx,3);
fallControls.sliders.find(c=>c.label==='Selected body mass').drive(.02);
assert.equal(fallControls.tabs.find(t=>t.labels.includes('Hammer and feather')).activeIdx,-1);
const twistControls=apparatus(Space.torsion),twistTime=twistControls.sliders.find(c=>c.label==='Replay time');
twistTime.drive(1000);twistControls.buttons[0].fn();near(twistTime.value,0);
twistTime.drive(1000);twistControls.sliders.find(c=>c.label==='Initial disturbance').drive(40);near(twistTime.value,0);
const missionControls=apparatus(Space.mission),coast=missionControls.sliders.find(c=>c.label.startsWith('Incoming'));
coast.drive(1);missionControls.tabs[0].fn(1);near(coast.value,0);missionControls.loops.forEach(fn=>fn(.5));assert.ok(coast.value>0);
const workControls=apparatus(Energy.work),routeTime=workControls.sliders.find(c=>c.label.startsWith('Route progress'));
routeTime.drive(.8);workControls.tabs[0].fn(1);near(routeTime.value,0);workControls.loops.forEach(fn=>fn(1));near(routeTime.value,.15);
const stationControls=apparatus(Energy.station),stationTime=stationControls.sliders.find(c=>c.label==='Elapsed time');
stationTime.drive(30);stationControls.tabs[0].fn(2);near(stationTime.value,0);stationControls.loops.forEach(fn=>fn(1));near(stationTime.value,1);
stationTime.drive(30);stationControls.buttons[0].fn();near(stationTime.value,0);
stationTime.drive(30);stationControls.sliders.find(c=>c.label==='Wheel load at initial speed').drive(50);near(stationTime.value,0);

const unitHull=apparatus(Fluids.hull),outerVolume=unitHull.sliders.find(c=>c.label==='Sealed outer volume'),cargoDensity=unitHull.sliders.find(c=>c.label==='Cargo mass');
const displacedCube=actualMeshes(unitHull).find(m=>m.geometry.parameters.width===1&&m.geometry.parameters.height===1&&m.geometry.parameters.depth===1&&m.material.opacity===.6);
near(displacedCube.scale.x*displacedCube.scale.y*displacedCube.scale.z,.6); // 10 L, same .06 scene³/L as the 20 L hull
cargoDensity.drive(5);unitHull.tabs[0].fn(2);
assert.equal(cargoDensity.label,'Egg density');assert.equal(cargoDensity.input.min,'1000');assert.equal(cargoDensity.input.max,'1200');assert.equal(cargoDensity.value,1100);assert.equal(outerVolume.input.disabled,true);
assert.match(unitHull.teaching.question,/egg/i);assert.match(unitHull.teaching.explanation,/each layer/);assert.doesNotMatch(unitHull.teaching.limits,/rectangular/);
cargoDensity.drive(1150);unitHull.tabs[0].fn(0);assert.equal(cargoDensity.label,'Cargo mass');near(cargoDensity.value,5);assert.equal(outerVolume.input.disabled,false);
unitHull.tabs[0].fn(2);near(cargoDensity.value,1150);assert.match(unitHull.speech,/1150 kg\/m³/);
console.log('PASS actual control/model agreement: replay resets/playback, shape/preset selection, independent hull/egg units and teaching, common displacement volume scale');

function visibleVectors(a){const groups=[];a.root.traverse(o=>{if(o.isGroup&&o.visible&&o.children[1]?.geometry?.type==='ConeGeometry')groups.push(o);});return groups;}
const pairScene=apparatus(RENDERERS.pairs);assert.equal(visibleVectors(pairScene).length,2,'two-body mode must show only its two interaction forces');
pairScene.tabs[0].fn(1);assert.equal(visibleVectors(pairScene).length,1);pairScene.tabs[0].fn(3);assert.equal(visibleVectors(pairScene).length,4);pairScene.tabs[0].fn(0);assert.equal(visibleVectors(pairScene).length,2);
const contactPressure=apparatus(Fluids.pressure);assert.equal(visibleVectors(contactPressure).length,1);contactPressure.tabs[0].fn(1);assert.equal(visibleVectors(contactPressure).length,6);contactPressure.tabs[0].fn(0);assert.equal(visibleVectors(contactPressure).length,1);
const zeroGas=apparatus(Fluids.suction);assert.equal(visibleVectors(zeroGas).length,2,'vacuum contributes no gas pressure arrow');zeroGas.sliders[0].drive(101000);assert.equal(visibleVectors(zeroGas).length,2,'zero liquid height contributes no weight arrow');
const horizontalWork=apparatus(Energy.work,false);assert.ok(horizontalWork.calls.some(c=>c.method==='fillText'&&String(c.args[0]).startsWith('Total route work: mgh')));assert.ok(!horizontalWork.calls.some(c=>c.method==='fillText'&&String(c.args[0]).startsWith('work = F s cos')));
const walkTrail=apparatus(RENDERERS.frames,false);walkTrail.calls.length=0;walkTrail.sliders[0].drive(.4);assert.ok(walkTrail.calls.filter(c=>c.method==='lineTo').length>=61,'2D frame comparison includes the same accumulated trajectory');
console.log('PASS all actual textbook renderers plus force visibility, zero-force limits, local/route work distinction and frame trajectory');

const accelScene=apparatus(RENDERERS.vectors),accelVector=visibleVectors(accelScene).find(g=>g.children[0].material.color.getHexString()==='bb9922');
near(drawnVector(accelVector).length(),Math.sqrt(50)/8);const beforeForces=visibleVectors(accelScene).filter(g=>g!==accelVector).map(g=>drawnVector(g).length());accelScene.sliders.find(c=>c.label==='Mass').drive(5);near(drawnVector(accelVector).length(),Math.sqrt(50)/40);visibleVectors(accelScene).filter(g=>g!==accelVector).forEach((g,i)=>near(drawnVector(g).length(),beforeForces[i]));
const pressureRatios=apparatus(Fluids.pressure);pressureRatios.tabs[0].fn(1);near(drawnVector(visibleVectors(pressureRatios)[2]).length()/drawnVector(visibleVectors(pressureRatios)[3]).length(),.8);assert.equal(pressureRatios.sliders[0].input.disabled,true);assert.equal(pressureRatios.sliders[1].input.disabled,false);
const tangentRelease=apparatus(Space.circle),releaseTime=tangentRelease.sliders.find(c=>c.label==='Time after release');assert.equal(tangentRelease.playback,false);assert.equal(releaseTime.input.disabled,true);tangentRelease.buttons[0].fn();releaseTime.drive(.35);assert.equal(tangentRelease.playback,false);assert.equal(releaseTime.input.disabled,false);assert.equal(visibleVectors(tangentRelease).length,1);const orbitBall=actualMeshes(tangentRelease).find(m=>m.geometry.type==='SphereGeometry'&&m.geometry.parameters.radius===.13);near(orbitBall.position.x,.8*(Math.SQRT2-.35*2*Math.SQRT2));near(orbitBall.position.y,.8*(Math.SQRT2+.35*2*Math.SQRT2));tangentRelease.buttons[0].fn();near(releaseTime.value,0);assert.equal(releaseTime.input.disabled,true);
const stillCabin=apparatus(Space.weightless,false);stillCabin.tabs[0].fn(1);assert.equal(stillCabin.playback,false);assert.ok(stillCabin.calls.some(c=>c.method==='fillText'&&String(c.args[0]).startsWith('Supported cabin:')));
const zeroEngine=apparatus(Energy.engine);assert.equal(zeroEngine.playback,true);zeroEngine.sliders.find(c=>c.label==='Hot reservoir').drive(400);zeroEngine.sliders.find(c=>c.label==='Cold reservoir').drive(400);assert.equal(zeroEngine.playback,false);
const landing=apparatus(RENDERERS.projectile),flightEnd=landing.sliders.find(c=>c.label==='Replay time');flightEnd.drive(Math.sqrt(1.5/9.8));const landingBall=actualMeshes(landing).find(m=>m.geometry.type==='SphereGeometry'&&m.geometry.parameters.radius===.12),landingFloor=actualMeshes(landing).find(m=>m.geometry.parameters.width===2.5);near(landingBall.position.y-.12,landingFloor.position.y+.03);const fixedRadius=landing.frameRadius,numberOfFits=landing.frameCalls;flightEnd.drive(0);flightEnd.drive(.2);near(landing.frameRadius,fixedRadius);assert.equal(landing.frameCalls,numberOfFits,'replay time never refits the motion envelope');landing.tabs[0].fn(1);assert.equal(landing.frameCalls,numberOfFits,'observer switch keeps the same physical view scale');
console.log('PASS visible acceleration scales, proportional pressure vectors, tangent release clock, supported/zero-gradient playback and exact landing contact with fixed replay framing');

const fullScaleScene=apparatus(RENDERERS.scale),scaleControl=fullScaleScene.sliders.find(c=>c.label==='Length multiplier');
assert.ok(fullScaleScene.frameRadius>0,'cube comparison declares its full-range camera envelope');
const scaleRadius=fullScaleScene.frameRadius,scaleFits=fullScaleScene.frameCalls;
for(const multiplier of [.5,2,3]){
  scaleControl.drive(multiplier);fullScaleScene.root.updateMatrixWorld(true);
  for(const mesh of actualMeshes(fullScaleScene)){
    mesh.geometry.computeBoundingBox();const bounds=mesh.geometry.boundingBox;
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])
      assert.ok(new Vector3(x,y,z).applyMatrix4(mesh.matrixWorld).length()<=scaleRadius+1e-8,'every cube corner remains inside the authored envelope');
  }
  near(fullScaleScene.frameRadius,scaleRadius);assert.equal(fullScaleScene.frameCalls,scaleFits,'changing length never changes the camera comparison scale');
}
console.log('PASS cube comparison keeps all corners inside one fixed camera envelope across the full multiplier range');
