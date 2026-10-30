import * as M from './investigation_models.mjs';
import {text,line,circle,rect,arrow,plot,controls} from './investigation_draw.js';
const f=(n,d=3)=>Number(n.toFixed(d));
export function rolling(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('inertia','Mass distribution k',.4,1,.1,.5);u.slider('angle','Ramp angle',10,45,1,30,'°');u.clock(4);
 lab.redraw(ctx=>{
  const p=M.rolling(s.inertia,s.angle,1),hoop=M.rolling(1,s.angle,1);
  [p,hoop].forEach((v,i)=>{
   const distance=Math.min(v.distance,.5*v.acceleration*s.time**2),q=distance/v.distance,x=75+q*480,y=65+i*110+q*50,col=i?c.proton:c.electron;
   line(ctx,c.rule,[[60,90+i*110],[575,140+i*110]]);circle(ctx,col,x,y,19);if(!i)circle(ctx,col,x,y,10);
   const a=distance/.1;line(ctx,col,[[x,y],[x+18*Math.cos(a),y+18*Math.sin(a)]]);
   text(ctx,col,i?'hoop: k=1':`adjustable: k=${s.inertia}`,65,45+i*110,14);
  });
  text(ctx,c.ink,`Same 1 kg, radius 0.1 m and height 1 m; slopes are schematic`,35,270,14);
  text(ctx,c.electron,`At finish: translation ${f(p.translation)} J + rotation ${f(p.rotation)} J`,35,302,15);
  lab.say(`Acceleration ${f(p.acceleration)} m/s²; finish ${f(p.duration)} s. Hoop: ${f(hoop.acceleration)} m/s², ${f(hoop.duration)} s. Each energy account totals 9.8 J. Positions use calculated distance fractions on the two schematic lanes. Replay time ${f(s.time)} s.`);
 });
 return Object.assign(()=>[s.inertia,M.rolling(s.inertia,s.angle,1).duration,`Slope ${s.angle}°; height 1 m; no slip`],{predict:x=>x>0?M.rolling(x,s.angle,1).duration:NaN});
}
export function balance(lab,api,c){
 const u=controls(api,lab),s=u.s;u.tabs(['Beam at a pivot','Turning force pair']);const load=u.slider('load','Right mass',.1,.8,.05,.4,'kg'),right=u.slider('right','Right load position',.05,.4,.01,.1,'m'),pivot=u.slider('pivot','Pivot coordinate',-.1,.1,.01,0,'m');
 lab.redraw(ctx=>{
  for(const control of [load,right,pivot])control.input.disabled=s.mode===1;
  if(s.mode===1){
   line(ctx,c.ink,[[180,150],[460,150]],5);circle(ctx,c.green,320,150,5,true);
   arrow(ctx,c.electron,210,150,0,-70,'2 N');arrow(ctx,c.proton,430,150,0,70,'2 N');
   text(ctx,c.ink,'View from above: force pair on a free bar, 0.4 m apart',35,35,15);
   text(ctx,c.ink,'Net in-plane force = 0 N; torque = −0.8 N·m',35,280,17);
   lab.say('Two equal opposite in-plane forces on a free bar form a clockwise couple. Net force is zero, so its centre has zero initial acceleration, while torque −0.8 N·m produces angular acceleration. There is no fixed pivot in this example. Gravity and table support balance out of this top view.');return;
  }
  const p=M.balance(.2,-.2,s.load,s.right,s.pivot),X=x=>320+x*550;
  line(ctx,c.ink,[[65,145],[575,145]],5);line(ctx,c.neutron,[[X(s.pivot)-18,195],[X(s.pivot),150],[X(s.pivot)+18,195],[X(s.pivot)-18,195]]);
  arrow(ctx,c.proton,X(-.2),145,0,19.6,'1.96 N');arrow(ctx,c.proton,X(s.right),145,0,s.load*98,`${f(s.load*9.8)} N`);
  arrow(ctx,c.electron,X(s.pivot),145,0,-p.support*10,`${f(p.support)} N support`);
  circle(ctx,c.green,X(p.centre),135,5,true);text(ctx,c.green,'centre of mass',X(p.centre)+8,125,13);
  text(ctx,c.ink,'Coordinate x (metres); pivot supplies no turning couple',35,250,14);
  text(ctx,c.ink,`Initial net force: ${f(p.netForce)} N; torque: ${f(p.torque)} N·m`,35,285,17);
  lab.say(`Initial support ${f(p.support)} N; net vertical force ${f(p.netForce)} N. Torque ${f(p.torque)} N·m: ${Math.abs(p.torque)<1e-8?'balanced; no initial rotation':p.torque>0?'initial turn counterclockwise':'initial turn clockwise'}. For an unbalanced fixed-pivot beam, the centre accelerates downward and support is less than total weight. This is the horizontal instant at release, not a time trajectory. Arrows share 10 drawing units/N. Try the separate force-pair mode for zero net force with nonzero torque.`);
 });
 return ()=>s.mode===0?[s.right-s.pivot,s.load,`Pivot ${s.pivot} m; left load .2 kg at −.2 m; selected configuration, not necessarily balanced`]:null;
}
export function bounce(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('height','Drop height',.1,2,.1,1,'m');u.slider('e','Speed ratio e',0,1,.05,.8);u.clock(4);
 lab.redraw(ctx=>{
  const peaks=Array.from({length:5},(_,i)=>s.height*s.e**(2*i)),p=M.bounce(s.height,peaks[1]);
  line(ctx,c.ink,[[45,245],[600,245]]);peaks.forEach((h,i)=>{const x=85+i*110;line(ctx,c.rule,[[x,245],[x,245-h*90]],1,[3,4]);circle(ctx,i?c.electron:c.proton,x,245-h*90,10);text(ctx,c.ink,`${f(h)} m`,x-25,275,13);});
  // Continuous ballistic arcs, with instantaneous contact and a constant e.
  let t=s.time,y=s.height,flight=Math.sqrt(2*s.height/9.8),v=0;
  if(t<=flight)y=Math.max(0,s.height-.5*9.8*t*t);
  else{t-=flight;v=s.e*Math.sqrt(2*9.8*s.height);let n=0;while(t>2*v/9.8&&v>.001&&n++<100){t-=2*v/9.8;v*=s.e;}y=v>.001?Math.max(0,v*t-.5*9.8*t*t):0;}
  circle(ctx,c.green,595,245-y*90,6,true);
  text(ctx,c.ink,'Five predicted peak heights; green dot follows the replay',35,30,15);
  lab.say(`First rebound ${f(peaks[1])} m. Speed ratio ${f(p.restitution)}; mechanical-energy fraction ${f(p.fraction)} (${f(p.fraction*100)}%). The rest enters other energy stores and sound. Zero-height bounces stay at the floor. Record measured peaks below; the connected toss tracker accepts a local video.`);
 });
 return Object.assign(()=>[s.height,s.height*s.e*s.e,`Constant restitution ${s.e}; negligible drag`],{predict:x=>x*s.e*s.e});
}
export function bounceTiming(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('first','First flight interval',.1,1.5,.05,1,'s');u.slider('next','Next flight interval',0,1.5,.05,.8,'s');
 lab.redraw(ctx=>{
  const p=M.bounceTiming(s.first,s.next),total=s.first+s.next,scale=500/Math.max(1,total),times=s.next>0?[0,s.first,total]:[0,s.first];
  line(ctx,c.ink,[[55,210],[585,210]]);
  times.forEach((t,i)=>{const x=65+t*scale;line(ctx,c.proton,[[x,190],[x,225]],3);text(ctx,c.ink,`Impact ${i+1}`,x-22,252,13);text(ctx,c.ink,`${f(t)} s`,x-22,275,13);});
  const yscale=120/Math.max(p.firstHeight,p.nextHeight,.1);
  [s.first,s.next].forEach((interval,i)=>{if(!interval)return;const path=[];for(let j=0;j<=80;j++){const t=interval*j/80;path.push([65+(times[i]+t)*scale,210-(4.9*interval*t-4.9*t*t)*yscale]);}line(ctx,i?c.electron:c.proton,path);});
  text(ctx,c.ink,'Consecutive impacts: two measured flight intervals',35,30,16);
  lab.say(`Interval ratio e=${f(p.restitution)}; returned energy fraction=${f(p.fraction)}. Peaks after the first and second impacts: ${f(p.firstHeight)} m and ${f(p.nextHeight)} m. ${s.next===0?'No next flight and no third impact: e=0 is a limiting model, not a measured third interval.':p.restitution>1?'Next interval is longer: check the events, echoes and possible energy input.':'Consecutive ideal bounces can be compared with the height route.'} Diagram time and height axes use separate labeled scales; no microphone is started.`);
 });return Object.assign(()=>[s.first,s.next,`Ideal interval example; ratio ${f(s.next/s.first)}`],{predict:x=>x*s.next/s.first});
}
export function diver(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('pressure','Absolute pressure',101.325,250,.5,101.325,'kPa');
 lab.redraw(ctx=>{
  const p=M.diver(s.pressure*1000),floating=p.buoyancy>=p.weight,y=120;
  rect(ctx,c.electron,95,45,155,235);line(ctx,c.electron,[[95,65],[250,65]],1);
  const packetHeight=65*p.volumeMl/10;
  rect(ctx,c.proton,145,y,55,packetHeight);circle(ctx,c.neutron,172,y+20,15*Math.sqrt(p.airMl));
  arrow(ctx,c.proton,215,y+42,0,p.weight*450,'weight');arrow(ctx,c.electron,125,y+42,0,-p.buoyancy*450,'buoyancy');
  text(ctx,c.ink,`Packet: ${f(p.volumeMl)} mL`,325,100,17);text(ctx,c.ink,`Air: ${f(p.airMl)} mL`,325,140,17);text(ctx,c.ink,'Mass: 9.8 g, unchanged',325,180,17);
  text(ctx,c.ink,'Fully submerged comparison; forces decide the initial tendency',35,308,14);
  lab.say(`Air ${f(p.airMl)} mL; sealed packet volume ${f(p.volumeMl)} mL. Buoyancy ${f(p.buoyancy,5)} N, weight ${f(p.weight,5)} N. ${floating?'Initially rises: at full submersion buoyancy exceeds weight. At the surface it can float with only part submerged.':'Initially sinks: even at full submersion buoyancy is below weight.'} Arrows use the same scale, 450 drawing units/N. Packet height represents volume at fixed cross-section; the air-pocket area represents gas volume schematically. No time trajectory is modeled.`);
 });return Object.assign(()=>[s.pressure,M.diver(s.pressure*1000).airMl,`Isothermal sealed packet; initial air 1 mL at 101.325 kPa`],{predict:x=>x>0?M.diver(x*1000).airMl:NaN});
}
export function gas(lab,api,c){
 const u=controls(api,lab),s=u.s;u.tabs(['Compress at 300 K','Warm at 1 L']);const volume=u.slider('volume','Volume',.5,2,.1,1,'L'),temperature=u.slider('temperature','Temperature',150,600,10,300,'K');
 lab.redraw(ctx=>{
  volume.input.disabled=s.mode===1;temperature.input.disabled=s.mode===0;
  const V=s.mode===0?s.volume:1,T=s.mode===0?300:s.temperature,p=M.gas(V,T),w=V*100;
  rect(ctx,c.ink,65,65,220,170);rect(ctx,c.electron,65,65,w,170);line(ctx,c.proton,[[65+w,55],[65+w,245]],5);
  for(let i=0;i<16;i++)circle(ctx,c.neutron,75+(i%4)*(w-20)/3,90+Math.floor(i/4)*35,4,true);
  text(ctx,c.ink,`${V} L at ${T} K`,325,105,20);text(ctx,c.proton,`${f(p.pressure/1000)} kPa`,325,150,20);
  text(ctx,c.ink,'Dots indicate a fixed amount, not molecular trajectories',35,285,14);
  lab.say(`${s.mode===0?'Temperature fixed at 300 K':'Volume fixed at 1 L'}. Pressure ${f(p.pressure/1000)} kPa. P/P₀ = (T/300 K) × (1 L/V). The inactive control is ignored by the chosen route; the readout names the fixed quantity. No real sealed vessel is heated.`);
 });return Object.assign(()=>s.mode===0?[s.volume,M.gas(s.volume,300).pressure/1000,`300 K; fixed gas amount`]:null,{predict:x=>s.mode===0&&x>0?M.gas(x,300).pressure/1000:NaN});
}
export function yoyo(lab,api,c){
 const u=controls(api,lab),s=u.s;u.tabs(['Unwinding','Pendulum']);const axle=u.slider('axle','Axle radius',.5,3,.1,1,'cm'),length=u.slider('length','Hanging length',.3,1.5,.1,1,'m');u.clock(3);
 lab.redraw(ctx=>{
  axle.input.disabled=s.mode===1;length.input.disabled=s.mode===0;
  const p=M.yoyo(.5,.04,s.axle/100,1),drop=Math.min(1,.5*p.acceleration*s.time**2),a=.2*Math.cos(Math.sqrt(9.8/s.length)*s.time),x=s.mode?320+Math.sin(a)*s.length*140:320,y=s.mode?45+Math.cos(a)*s.length*140:60+drop*155;
  line(ctx,c.ink,[[300,40],[340,40]],5);line(ctx,c.ink,[[320,40],[x,y]]);circle(ctx,c.electron,x,y,26);circle(ctx,c.proton,x,y,s.axle*5);
  if(!s.mode){const phase=drop/(s.axle/100);line(ctx,c.electron,[[x,y],[x+24*Math.cos(phase),y+24*Math.sin(phase)]]);}
  text(ctx,c.ink,s.mode?'Small-angle pendulum: no unwinding':'String unwinds from the axle',35,275,16);
  lab.say(s.mode?`Point-bob pendulum period ${f(2*Math.PI*Math.sqrt(s.length/9.8))} s at length ${s.length} m. Angle amplitude 0.2 rad; bob size and length scale are schematic.`:`Unwinding acceleration ${f(p.acceleration)} m/s²; tension ${f(p.tension)} N. At 1 m descent: ${f(p.translation)} J translation + ${f(p.rotation)} J rotation = 9.8 J. Shown drop ${f(drop)} m, clamped at 1 m; no return tug. Axle is exaggerated.`);
 });return Object.assign(()=>s.mode===0?[s.axle,M.yoyo(.5,.04,s.axle/100,1).acceleration,`Outer radius 4 cm; inertia factor .5; unwinding`]:null,{predict:x=>s.mode===0&&x>0?M.yoyo(.5,.04,x/100,1).acceleration:NaN});
}
export function spring(lab,api,c){
 const u=controls(api,lab),s=u.s;u.tabs(['Linear spring','Stiffening material']);u.slider('force','Applied force',0,4,.1,2,'N');u.slider('k','Initial stiffness',10,40,1,20,'N/m');
 lab.redraw(ctx=>{
  const series=[false,true].map((nonlinear,i)=>({color:i?c.proton:c.electron,points:Array.from({length:41},(_,j)=>{const force=j/10;return [M.spring(force,s.k,nonlinear).extension,force];})}));
  plot(ctx,c,series,{xmax:4/s.k,ymax:4,xlabel:'Extension (m)',ylabel:'Force (N)',w:340,h:165});
  const p=M.spring(s.force,s.k,!!s.mode),end=85+p.extension*400;
  line(ctx,c.ink,[[485,45],[485,75]]);const zig=[[485,75]];for(let j=0;j<12;j++)zig.push([485+(j%2?10:-10),75+(end-75)*j/11]);zig.push([485,end]);line(ctx,s.mode?c.proton:c.electron,zig);rect(ctx,c.neutron,470,end,30,25,true);
  text(ctx,c.ink,'Blue: linear; red: illustrative stiffening curve',35,293,14);
  lab.say(`${s.mode?'Stiffening material':'Linear spring'}: ${s.force} N gives ${f(p.extension,4)} m extension and ${f(p.energy,4)} J stored energy. Initial stiffness ${s.k} N/m. The spring drawing magnifies extension; the graph is quantitative. Real rubber hysteresis is not modeled.`);
 });return Object.assign(()=>[s.force,M.spring(s.force,s.k,!!s.mode).extension,`${s.mode?"Stiffening":"Linear"}; initial k=${s.k} N/m`],{predict:x=>M.spring(x,s.k,!!s.mode).extension});
}
export function top(lab,api,c){
 const u=controls(api,lab),s=u.s;u.slider('spin','Spin angular speed',80,160,10,80,'rad/s');u.slider('tilt','Tilt',15,45,5,30,'°');u.clock(5);
 lab.redraw(ctx=>{
  const p=M.top(s.spin,s.tilt),angle=-p.precession*s.time,tilt=s.tilt*Math.PI/180,
   x=300+110*Math.sin(tilt)*Math.cos(angle),y=235-150*Math.cos(tilt)+30*Math.sin(tilt)*Math.sin(angle);
  ctx.beginPath();ctx.strokeStyle=c.rule;ctx.ellipse(300,235-150*Math.cos(tilt),110*Math.sin(tilt),30*Math.sin(tilt),0,0,Math.PI*2);ctx.stroke();line(ctx,c.ink,[[300,235],[x,y]],3);circle(ctx,c.electron,x,y,24);
  arrow(ctx,c.electron,300,235,(x-300)*1.3,(y-235)*1.3,'L');arrow(ctx,c.proton,x,y,0,65,'mg');
  const torqueScale=70*Math.sin(tilt);
  arrow(ctx,c.neutron,x,y,torqueScale*Math.sin(angle),-torqueScale*30/110*Math.cos(angle),'torque');
  text(ctx,c.ink,`Spin ${s.spin} rad/s; slow precession ${f(p.precession)} rad/s`,35,285,16);
  lab.say(`L≈${f(p.L,4)} kg·m²/s; torque ${f(p.torque,4)} N·m; precession Ω≈${f(p.precession)} rad/s. Gravity still acts. Arrows show directions; their different physical quantities have no common magnitude scale. The torque is projected about the support, changing L. Fixed tilt, no nutation or spin loss; spin phase is not animated at its real frequency.`);
 });return Object.assign(()=>[s.spin,M.top(s.spin,s.tilt).precession,`Tilt ${s.tilt}°; fast steady top approximation`],{predict:x=>x>=80?M.top(x,s.tilt).precession:NaN});
}
export function disc(lab,api,c){
 const u=controls(api,lab),s=u.s;u.tabs(['Gravity only','Simple lift and drag']);u.slider('speed','Launch speed',5,15,.5,10,'m/s');u.slider('angle','Launch elevation',0,45,1,30,'°');
 lab.redraw(ctx=>{
  const vacuum=M.discFlight(s.speed,s.angle,false),air=M.discFlight(s.speed,s.angle,true),all=[...vacuum,...air],xmax=Math.max(...all.map(p=>p.x))*1.05,ymax=Math.max(...all.map(p=>p.y))*1.1;
  plot(ctx,c,[{color:c.rule,points:vacuum.map(p=>[p.x,p.y]),dash:[4,4]},{color:s.mode?c.electron:c.proton,points:(s.mode?air:vacuum).map(p=>[p.x,p.y])}],{xmax,ymax,xlabel:'Horizontal distance (m)',ylabel:'Height (m)'});
  const end=(s.mode?air:vacuum).at(-1);
  text(ctx,c.ink,'Dashed: gravity only. Solid: selected model.',35,305,14);
  lab.say(`${s.mode?'Illustrative lift/drag':'Gravity-only'} range ${f(end.x)} m; flight time ${f(end.t)} s. Launched from 1 m. Air model: fixed CL=.30, CD=.12; no attitude or spin dynamics. Elevation is not angle of attack. Spin can stabilise orientation, but supplies no energy source. No equal-transit-time assumption.`);
 });return Object.assign(()=>[s.speed,M.discFlight(s.speed,s.angle,!!s.mode).at(-1).x,`${s.mode?'Simple lift/drag':'Gravity only'}; elevation ${s.angle}°; initial height 1 m`],{predict:x=>x>=0&&x<=30?M.discFlight(x,s.angle,!!s.mode).at(-1).x:NaN});
}
