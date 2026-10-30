// SI models for the original investigations. Renderers and readouts share these results.
export const G=9.8;
const radians=d=>d*Math.PI/180;
export function rolling(inertia,angle,height,mass=1){
 const acceleration=G*Math.sin(radians(angle))/(1+inertia),speed=Math.sqrt(2*G*height/(1+inertia));
 return {acceleration,speed,translation:.5*mass*speed**2,rotation:.5*inertia*mass*speed**2,
  distance:height/Math.sin(radians(angle)),duration:Math.sqrt(2*height/Math.sin(radians(angle))/acceleration)};
}
export function balance(m1,x1,m2,x2,pivot){
 // Positive torque is counterclockwise: a downward load to the right gives negative torque.
 const mass=m1+m2,centre=(m1*x1+m2*x2)/mass,
  inertia=m1*(x1-pivot)**2+m2*(x2-pivot)**2,torque=-mass*G*(centre-pivot),
  alpha=inertia?torque/inertia:0,netForce=mass*alpha*(centre-pivot);
 return {torque,support:mass*G+netForce,centre,alpha,netForce};
}
export function yoyo(inertia,radius,axle,drop,mass=1){
 const k=inertia*radius**2/axle**2,acceleration=G/(1+k),speed=Math.sqrt(2*acceleration*drop);
 return {acceleration,speed,omega:speed/axle,tension:mass*(G-acceleration),
  translation:.5*mass*speed**2,rotation:.5*mass*k*speed**2};
}
export function spring(force,k,nonlinear){
 // Rubber illustration: F=kx+800x³; not a measured material fit or hysteresis model.
 let low=0,high=Math.max(1,force/k);
 for(let i=0;i<60;i++){const mid=(low+high)/2;if(k*mid+(nonlinear?800*mid**3:0)>force)high=mid;else low=mid;}
 const extension=(low+high)/2;
 return {extension,energy:.5*k*extension**2+(nonlinear?200*extension**4:0)};
}
export function gas(volumeLitres,temperature){return {pressure:101325*temperature/300/volumeLitres};}
export function diver(pressure){
 const airMl=101325/pressure,volumeMl=9+airMl,mass=.0098;
 return {airMl,volumeMl,mass,weight:mass*G,buoyancy:1000*G*volumeMl*1e-6};
}
export function bounce(drop,rebound){
 if(!Number.isFinite(drop)||!Number.isFinite(rebound)||drop<=0||rebound<0)return null;
 return {restitution:Math.sqrt(rebound/drop),fraction:rebound/drop,loss:1-rebound/drop};
}
export function bounceTiming(firstInterval,nextInterval){
 if(!Number.isFinite(firstInterval)||!Number.isFinite(nextInterval)||firstInterval<=0||nextInterval<0)return null;
 const restitution=nextInterval/firstInterval;
 return {restitution,fraction:restitution**2,firstHeight:G*firstInterval**2/8,nextHeight:G*nextInterval**2/8};
}
export function eddyDrop(damping,time){
 const mass=.02,height=1;
 const at=t=>{
  if(damping===0)return {distance:.5*G*t*t,speed:G*t};
  const tau=mass/damping,terminal=mass*G/damping;
  return {distance:terminal*(t+tau*Math.expm1(-t/tau)),speed:-terminal*Math.expm1(-t/tau)};
 };
 let low=0,high=10;for(let i=0;i<60;i++){const mid=(low+high)/2;if(at(mid).distance>height)high=mid;else low=mid;}
 const duration=(low+high)/2,t=Math.min(time,duration),state=at(t),potentialLost=mass*G*state.distance,kinetic=.5*mass*state.speed**2;
 return {...state,time:t,duration,heat:Math.max(0,potentialLost-kinetic),kinetic,potentialLost};
}
export function top(spin,tilt){
 const inertia=.0001,mass=.1,length=.04,L=inertia*spin,precession=mass*G*length/L;
 return {L,precession,torque:mass*G*length*Math.sin(radians(tilt))};
}
// c=1 light-second per second; mirror separation=1 light-second in both frames.
export function lightClock(beta,groundTime){
 const gamma=1/Math.sqrt(1-beta**2),properTime=groundTime/gamma,phase=properTime%2;
 return {gamma,properTime,lightX:beta*groundTime,lightY:phase<=1?phase:2-phase,
  groundTime,mirrorX:beta*groundTime};
}
export function microwave(spacingCm,frequencyGHz){return {wavelength:2*spacingCm/100,speed:2*spacingCm/100*frequencyGHz*1e9};}
export function flashlight(speed,time,after=0){
 // Ideal rectified EMF charges C=.1F through10Ω; after shaking, a10Ω lamp-equivalent discharges it.
 const C=.1,R=10,emf=2*speed,chargedVoltage=emf*(1-Math.exp(-time/(R*C))),
  work=C*emf*chargedVoltage,initial=.5*C*chargedVoltage**2,
  voltage=chargedVoltage*Math.exp(-after/(R*C)),stored=.5*C*voltage**2,
  lightEnergy=initial-stored,windingLoss=work-initial,power=emf*(emf-chargedVoltage)/R;
 return {emf,power,work,stored,lightEnergy,windingLoss,voltage,chargedVoltage,
  resistanceForce:speed?power/speed:0,afterglowPower:voltage**2/R};
}
export function nucleon(upCount){return {up:upCount,down:3-upCount,charge:upCount-1};}
function random(seed){let s=seed>>>0;return ()=>{s=(1664525*s+1013904223)>>>0;return (s+.5)/4294967296;};}
export function decayEnsembles(initial,halfLife,rounds,seed=1,count=5){
 return Array.from({length:count},(_,i)=>{
  const rand=random(seed+104729*i),lives=Array.from({length:initial},()=>-Math.log(rand())*halfLife/Math.LN2);
  return Array.from({length:rounds+1},(_,t)=>lives.filter(l=>l>t).length);
 });
}
export function discFlight(speed,angle,air=true){
 const th=radians(angle),dt=.01,mass=.175,area=.057,rho=1.2,cl=.3,cd=.12;
 let x=0,y=1,vx=speed*Math.cos(th),vy=speed*Math.sin(th),t=0;
 const result=[{x,y,vx,vy,t}];
 if(!air){
  const end=(vy+Math.sqrt(vy**2+2*G))/G;
  for(let i=1;i<=150;i++){t=end*i/150;result.push({x:vx*t,y:i===150?0:1+vy*t-.5*G*t*t,vx,vy:vy-G*t,t});}
  return result;
 }
 // RK4, fixed illustrative lift/drag coefficients; lift normal to flight velocity, no spin dynamics.
 const derivative=([x,y,u,v])=>{
  const speed=Math.hypot(u,v),factor=.5*rho*area*speed/mass;
  return [u,v,factor*(-cd*u-cl*v),-G+factor*(-cd*v+cl*u)];
 };
 for(let i=0;i<3000&&y>0;i++){
  const old={x,y,vx,vy,t},state=[x,y,vx,vy],k1=derivative(state),
   k2=derivative(state.map((v,j)=>v+dt*k1[j]/2)),k3=derivative(state.map((v,j)=>v+dt*k2[j]/2)),
   k4=derivative(state.map((v,j)=>v+dt*k3[j]));
  [x,y,vx,vy]=state.map((v,j)=>v+dt*(k1[j]+2*k2[j]+2*k3[j]+k4[j])/6);t+=dt;
  if(y<0){const f=old.y/(old.y-y);x=old.x+f*(x-old.x);vx=old.vx+f*(vx-old.vx);vy=old.vy+f*(vy-old.vy);t=old.t+f*dt;y=0;}
  result.push({x,y,vx,vy,t});
 }
 return result;
}
