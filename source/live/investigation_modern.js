import * as M from './investigation_models.mjs';
import {text,line,circle,rect,arrow,plot,controls} from './investigation_draw.js';
const f=(n,d=3)=>Number(n.toFixed(d));
export function flashlight(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('speed','Representative magnet speed',0,3,.1,2,'m/s');u.slider('charge','Charging duration',0,5,.1,2,'s');u.slider('after','Time since shaking stopped',0,5,.1,0,'s');
 lab.redraw(ctx=>{
  const p=M.flashlight(s.speed,s.charge,s.after);
  rect(ctx,c.ink,50,100,170,65);for(let i=0;i<9;i++){ctx.beginPath();ctx.strokeStyle=c.electron;ctx.ellipse(100+i*9,132,10,40,0,0,Math.PI*2);ctx.stroke();}
  rect(ctx,c.proton,60,120,50,24,true);arrow(ctx,c.ink,60,187,s.speed*22,0,'representative motion');
  arrow(ctx,c.ink,225,132,50,0);rect(ctx,c.electron,285,105,65,55);text(ctx,c.ink,'Store',294,136,14);
  arrow(ctx,c.ink,355,132,40,0);circle(ctx,c.neutron,420,132,18);line(ctx,c.neutron,[[408,120],[432,144],[408,144],[432,120]],1);
  text(ctx,c.ink,`EMF ${f(p.emf)} V`,445,90,17);text(ctx,c.ink,`Capacitor ${f(p.voltage)} V`,445,132,15);text(ctx,c.ink,`Load ${f(p.afterglowPower)} W`,445,174,15);
  text(ctx,c.ink,'Energy paths, not wiring: charge first, then discharge to load',35,260,14);
  text(ctx,c.ink,`Work ${f(p.work)} J = stored ${f(p.stored)} + load ${f(p.lightEnergy)} + heat ${f(p.windingLoss)}`,35,295,14);
  lab.say(`After ${s.charge} s charging and ${s.after} s discharge: stored ${f(p.stored)} J, load energy ${f(p.lightEnergy)} J, winding/resistor heat ${f(p.windingLoss)} J. Total input ${f(p.work)} J. Opposing force at the end of charging ${f(p.resistanceForce)} N. With zero magnet speed the source and stored energy are zero. The lamp stands for an ideal resistive load; a real LED has a threshold.`);
 });return ()=>[s.charge,M.flashlight(s.speed,s.charge,0).chargedVoltage,`Magnet speed ${s.speed} m/s; voltage before discharge`];
}
export function eddy(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('damping','Conducting-tube drag coefficient',0,.5,.05,.2,'N·s/m');u.clock(4);
 lab.redraw(ctx=>{
  const p=M.eddyDrop(s.damping,s.time),free=M.eddyDrop(0,s.time);
  [free,p].forEach((q,i)=>{const x=140+i*300;rect(ctx,i?c.electron:c.rule,x-32,60,64,180);rect(ctx,c.proton,x-18,67+q.distance*150,36,15,true);text(ctx,c.ink,i?'Conducting tube':'Nonconducting tube',x-80,32,15);text(ctx,c.ink,`${f(q.distance)} m fallen`,x-70,265,14);});
  text(ctx,c.ink,`Before contact: ${f(p.potentialLost,4)} J = kinetic ${f(p.kinetic,4)} + warming ${f(p.heat,4)}`,35,305,14);
  lab.say(`Free fall reaches the bottom in ${f(free.duration)} s; selected drag model takes ${f(p.duration)} s. Speed ${f(p.speed)} m/s before first contact. Induced-current heating ${f(p.heat,4)} J. Forces: gravity and a drag −bv; gravity does not switch off. The tubes share a one-metre scale; the drawing freezes each magnet just before its first contact. A lengthwise slot breaks current paths and weakens braking in a real conducting tube.`);
 });return Object.assign(()=>[s.damping,M.eddyDrop(s.damping,10).duration,'Constant linear drag, 0.020 kg, one-metre tube'],{predict:x=>x>=0&&x<=.5?M.eddyDrop(x,10).duration:NaN});
}
export function microwave(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('d','Adjacent hot-region spacing',3,10,.1,6.1,'cm');u.slider('frequency','Frequency',1,4,.05,2.45,'GHz');
 lab.redraw(ctx=>{
  const p=M.microwave(s.d,s.frequency),scale=20,wave=[];
  for(let i=0;i<=540;i++)wave.push([50+i,140-50*Math.cos(Math.PI*i/(s.d*scale))]);line(ctx,c.electron,wave,2);
  rect(ctx,c.ink,50,207,540,38);for(let x=0;x<540;x+=s.d*scale){circle(ctx,c.proton,50+x,225,10,true);line(ctx,c.rule,[[50+x,90],[50+x,245]],1,[3,4]);}
  line(ctx,c.ink,[[50,275],[50+s.d*scale,275]]);text(ctx,c.ink,`d = ${s.d} cm = λ/2`,60,302,16);
  text(ctx,c.ink,'Ideal standing-wave snapshot and hot-region map',35,35,16);
  lab.say(`Wavelength ${f(p.wavelength,4)} m; c≈2df=${p.speed.toExponential(4)} m/s. A dark or light wave excursion gives the same intensity antinode, so neighbouring hot regions are half a wavelength apart. Grid spacing is 20 drawing units/cm. Real melt patterns may not follow this one-dimensional ideal.`);
 });return ()=>[s.d,s.frequency];
}
export function lightclock(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('beta','Relative speed',0,.8,.05,.6,'c');u.clock(5);
 lab.redraw(ctx=>{
  const p=M.lightClock(s.beta,s.time),scale=65;
  const panels=[{x:50,label:'Aboard the carriage',time:p.properTime,move:0},{x:330,label:'Ground frame',time:s.time,move:s.beta}];
  panels.forEach((panel,i)=>{
   text(ctx,c.ink,panel.label,panel.x,35,16);
   // Ground-frame ruler spans 0–4 light-seconds horizontally; same scale for x and y.
   const origin=panel.x+10,base=235,lightX=i?p.lightX:0;
   for(const yy of [0,1])line(ctx,c.ink,[[origin+(i?p.mirrorX:0)*scale-12,base-yy*scale],[origin+(i?p.mirrorX:0)*scale+12,base-yy*scale]],3);
   const path=[];const n=Math.floor(p.properTime);path.push([origin,base]);
   for(let k=1;k<=n;k++)path.push([origin+(i?s.beta*k*p.gamma:0)*scale,base-(k%2)*scale]);
   path.push([origin+lightX*scale,base-p.lightY*scale]);line(ctx,c.electron,path,2,[4,3]);circle(ctx,c.proton,origin+lightX*scale,base-p.lightY*scale,5,true);
   text(ctx,c.ink,`${i?'t':'τ'} = ${f(panel.time)} s`,panel.x,280,16);
  });
  text(ctx,c.ink,`Same events; c=1 light-second/s. γ=${f(p.gamma)}. D=1 light-second.`,35,310,14);
  lab.say(`Ground t=${f(s.time)} s; carriage proper time τ=${f(p.properTime)} s, γ=${f(p.gamma)}. One full 2 s carriage tick takes ${f(2*p.gamma)} ground s. Both diagrams use one equal x/y scale in light-seconds and the same reflection events. This is transformed coordinate time, not a delayed photograph.`);
 });return ()=>[s.beta,M.lightClock(s.beta,s.time).gamma];
}
export function decay(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('population','Initial population',8,256,8,64,'nuclei');u.slider('seed','Independent sample set',1,50,1,1);u.slider('time','Elapsed time',0,10,.1,2,'s');
 let cachedKey='',samples=[];
 lab.redraw(ctx=>{
  const key=s.population+':'+s.seed;if(key!==cachedKey){samples=M.decayEnsembles(s.population,2,10,s.seed);cachedKey=key;}
  const colors=[c.proton,c.electron,c.neutron,c.green,c.muted],series=samples.map((ns,i)=>({color:colors[i],points:ns.flatMap((n,t)=>t?[[t,ns[t-1]],[t,n]]:[[0,n]])}));
  series.push({color:c.ink,dash:[4,3],points:Array.from({length:101},(_,i)=>[i/10,s.population*2**(-i/20)])});
  plot(ctx,c,series,{xmax:10,ymax:s.population,xlabel:'Time (model s)',ylabel:'Surviving parent nuclei'});
  const t=Math.floor(s.time);text(ctx,c.ink,`At whole second ${t}: ${samples.map(v=>v[t]).join(' / ')} survivors`,35,302,15);
  lab.say(`Five independent samples from ${s.population} nuclei; expected after ${f(s.time)} s: ${f(s.population*2**(-s.time/2))}. Staircases are sampled at whole seconds; displayed counts at ${t} s: ${samples.map(v=>v[t]).join(', ')}. Change sample set for independent lifetimes. The physical coin table uses rounds, not these 2 s model half-lives.`);
 });return ()=>null;
}
const families=[
 ['Quarks','up, down; charm, strange; top, bottom','Fractional charges; all feel the strong interaction.'],
 ['Leptons','electron, muon, tau; three neutrino types','Leptons do not feel the strong interaction.'],
 ['Interaction bosons','photon; gluons; W+, W− and Z','Electromagnetic, strong and weak interactions.'],
 ['Higgs','Higgs boson','Its field couples to elementary particles; it is not the source of all nucleon mass.']
];
export function particles(lab,api,c){
 const u=controls(api,lab),s=u.s;u.tabs(['Proton uud','Neutron udd']);u.tabs(['Quarks','Leptons','Interaction bosons','Higgs'],'family');
 lab.redraw(ctx=>{
  const p=M.nucleon(s.mode?1:2),letters=s.mode?['u','d','d']:['u','u','d'];
  letters.forEach((q,i)=>{const x=115+i*175;circle(ctx,q==='u'?c.electron:c.proton,x,95,32);text(ctx,c.ink,`${q}: ${q==='u'?'+⅔':'−⅓'}e`,x-28,100,16);});
  text(ctx,c.ink,`${s.mode?'Neutron':'Proton'}: total charge ${p.charge}e`,55,160,20);
  const family=families[s.family];text(ctx,c.electron,family[0],55,205,17);text(ctx,c.ink,family[1],55,237,14);text(ctx,c.ink,family[2],55,267,13);
  text(ctx,c.ink,'No quark orbits shown. Gravity is outside the Standard Model.',35,310,14);
  lab.say(`${s.mode?'udd':'uud'} charge sums to ${p.charge}e. This is valence bookkeeping, not the full nucleon: sea quarks and gluons are omitted. ${family[0]}: ${family[2]} Higgs discovery announced 4 July 2012; the field gives elementary masses through couplings, while strong-interaction energy accounts for most nucleon mass.`);
 });return ()=>[s.mode?1:2,M.nucleon(s.mode?1:2).charge];
}
const surfaceCases=[
 ['Prism','Refraction differs with wavelength.','Change prism orientation; compare the selected-red experiment.'],
 ['Fine tracks','Many paths reinforce at selected angles.','Change viewing angle; compare the grating model.'],
 ['Thin film','Two reflected paths combine.','Change thickness or angle; include reflection phase.'],
 ['Polarising filter','Field orientation is selected.','Rotate the filter while watching glare.']
];
export function surfaces(lab,api,c){
 const u=controls(api,lab),s=u.s;u.tabs(surfaceCases.map(v=>v[0]));const analyser=u.slider('condition','Analyser angle',0,90,1,45,'°');
 lab.redraw(ctx=>{
  const q=surfaceCases[s.mode],a=s.condition*Math.PI/180,brightness=Math.cos(a)**2;
  analyser.input.disabled=s.mode!==3;
  if(s.mode===0){line(ctx,c.ink,[[220,60],[165,200],[285,200],[220,60]]);for(let i=0;i<3;i++)line(ctx,[c.proton,c.neutron,c.electron][i],[[70,110],[208,110],[420,85+i*35]]);}
  else if(s.mode===1){for(let i=0;i<14;i++)line(ctx,c.ink,[[140+i*10,170],[140+i*10,210]],1);for(let i=0;i<3;i++)arrow(ctx,[c.proton,c.neutron,c.electron][i],220,170,150, -100+i*45);}
  else if(s.mode===2){rect(ctx,c.electron,135,155,250,20);line(ctx,c.proton,[[65,65],[180,155],[295,65]]);line(ctx,c.neutron,[[180,155],[210,175],[325,65]]);}
  else{circle(ctx,c.ink,250,140,65);for(let i=-3;i<=3;i++){const dx=Math.cos(a),dy=Math.sin(a),ox=-dy*i*12,oy=dx*i*12;line(ctx,c.electron,[[250+ox-38*dx,140+oy-38*dy],[250+ox+38*dx,140+oy+38*dy]],1);}arrow(ctx,c.proton,80,140,100,0);if(brightness>1e-8)arrow(ctx,c.neutron,325,140,100*brightness,0);text(ctx,c.ink,`I/I₀ = ${f(brightness)}`,380,205,16);}
  text(ctx,c.ink,q[0],35,30,19);text(ctx,c.ink,q[1],35,255,15);text(ctx,c.ink,q[2],35,290,14);
  lab.say(`${q[0]}: ${q[1]} ${q[2]} ${s.mode===3?`Ideal analyser with initially linearly polarised light: I/I₀=cos²(${s.condition}°)=${f(brightness)}. The outgoing arrow length represents intensity, not electric-field amplitude.`:'This panel is a mechanism sketch. Open the connected quantitative models for predicted angles and intensity.'}`);
 });return ()=>s.mode===3?[s.condition,Math.cos(s.condition*Math.PI/180)**2,'Ideal analyser; linearly polarised incident light']:null;
}
