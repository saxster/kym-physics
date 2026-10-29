import assert from 'node:assert/strict';
import {gnomonShadow,arrowFlight,hingedPassenger,supportContact} from '../live/mechanics_motion_models.mjs';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} versus ${b}`);
for(const angle of [0,7.2,15,30]){
 const q=gnomonShadow(angle),shadow=q.end.map((x,k)=>x-q.base[k]);
 near(shadow.reduce((s,x,k)=>s+x*q.normal[k],0),0);
 near(Math.hypot(...shadow),.4*Math.tan(angle*Math.PI/180));
 near(q.top[0],q.end[0]); // Parallel vertical rays, true tangent-plane intersection.
}
for(const t of [0,.2,.6,1]){
 const q=arrowFlight(t,12,0);near(q.x,12*t);near(q.y,6-4.9*t*t);near(q.vx,12);near(q.ax,0);
 const air=arrowFlight(t,12,.2);assert.ok(air.drag[0]*air.vx+air.drag[1]*air.vy<=1e-10);
 near(air.ay,air.gravity[1]+air.drag[1]);
}
for(const t of [0,.2,.6]){
 const q=hingedPassenger(t,3);near(Math.hypot(q.head-q.feet,q.height),1.4);
 near(q.bag,3*t);assert.ok(q.head>=q.feet);assert.ok(q.bag>=q.feet);
 const rest=hingedPassenger(t,0);near(rest.angle,0);near(rest.bag,0);
}
for(const angle of [0,15,45])for(const sag of [0,.2,.6]){
 const q=supportContact(angle,sag);
 q.load.forEach((x,k)=>near(x-.2*q.normal[k],q.contact[k]));
 q.plate.forEach((x,k)=>near(x+.06*q.normal[k],q.contact[k]));
 const W=98,N=W*Math.cos(angle*Math.PI/180),F=W*Math.sin(angle*Math.PI/180);
 near(N*q.normal[0]-F*q.tangent[0],0);near(N*q.normal[1]-F*q.tangent[1]-W,0);
}
console.log('PASS ray/tangent intersections, flight-force directions, shared-frame rigid torso and exact support contacts');
