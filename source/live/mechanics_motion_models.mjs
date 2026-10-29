// Geometry shared by the rendered mechanisms and independent constraint checks.
export function gnomonShadow(angle, radius=1.7, height=.4){
 const a=angle*Math.PI/180,n=[Math.sin(a),Math.cos(a),0],tangent=[Math.cos(a),-Math.sin(a),0];
 const base=n.map(x=>radius*x),top=n.map(x=>(radius+height)*x);
 const end=[top[0],top[1]-height/Math.cos(a),0];
 return {normal:n,tangent,base,top,end,length:height*Math.tan(a)};
}
export function arrowFlight(time,speed=12,dragRate=0,g=9.8){
 const t=Math.max(0,time),b=dragRate;
 const k=b>1e-8?(1-Math.exp(-b*t))/b:t;
 const vx=speed*Math.exp(-b*t),vy=b>1e-8?-g*k:-g*t;
 const x=speed*k,y=b>1e-8?6-g*(t-k)/b:6-g*t*t/2;
 return {x,y,vx,vy,ax:-b*vx,ay:-g-b*vy,drag:[-b*vx,-b*vy],gravity:[0,-g]};
}
export function brakingPassenger(time,speed=3,deceleration=2){
 const t=Math.max(0,time),stop=deceleration>0?speed/deceleration:Infinity,tc=Math.min(t,stop);
 const feet=speed*tc-deceleration*tc*tc/2,free=speed*t;
 return {feet,head:free,bag:free,relative:free-feet,footForce:t<stop&&speed>0?-deceleration:0};
}
export function hingedPassenger(time,speed=3,deceleration=2,length=1.4){
 const t=Math.max(0,time),stop=speed/deceleration;let angle=0,omega=0,now=0;
 const acceleration=(q,at)=>(9.8*Math.sin(q)+(at<stop?deceleration:0)*Math.cos(q))/length;
 while(now<t-1e-10){const h=Math.min(.001,t-now),a=acceleration(angle,now);omega+=a*h;angle+=omega*h;now+=h;}
 const free=brakingPassenger(t,speed,deceleration);
 return {...free,angle,omega,length,head:free.feet+length*Math.sin(angle),height:length*Math.cos(angle)};
}
export function supportContact(angle,displayDeflection){
 const a=angle*Math.PI/180,n=[Math.sin(a),Math.cos(a),0],t=[Math.cos(a),-Math.sin(a),0],at=(normal,tangent=0)=>n.map((x,k)=>normal*x+tangent*t[k]);
 return {normal:n,tangent:t,at,contact:at(-displayDeflection),plate:at(-displayDeflection-.06),load:at(-displayDeflection+.2),base:at(-1.2),height:1.2-displayDeflection};
}
