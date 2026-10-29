// Public, DOM-free teaching models. SI units unless the function name says otherwise.
// Source/limits: grounding/visual_waves.md. No model below infers a physical quantity from display pixels.
export const C=299792458, HC_EV_NM=1239.841984, G=9.8;
const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function jouleWork(m,height,repeats=1,waterKg=1){const energyJ=m*G*height*repeats;return {energyJ,temperatureRise:energyJ/(waterKg*4186)};}
export const coolingEnergy=(kg,startC,roomC)=>kg*4186*(startC-roomC);
export function conductionRate(deltaC,area,layers){return deltaC*area/layers.reduce((r,l)=>r+l.thickness/l.k,0);}
export function phaseState(energyKJ){
 const q=clamp(energyKJ,0,3050.6);
 if(q<42)return {temperatureC:-20+q/2.1,liquidFraction:0,vapourFraction:0,stage:'warming ice'};
 if(q<376)return {temperatureC:0,liquidFraction:(q-42)/334,vapourFraction:0,stage:'melting'};
 if(q<794.6)return {temperatureC:(q-376)/4.186,liquidFraction:1,vapourFraction:0,stage:'warming water'};
 return {temperatureC:100,liquidFraction:1,vapourFraction:(q-794.6)/2256,stage:'boiling'};
}
export const airDensity=T=>353/(T+273.15);
export const evaporationEnergy=g=>g*2400; // warm water: J, temperature-dependent latent heat approximated
export const WET_BULB_CASES=[{name:'Mumbai May',air:34.3,rh:65,wet:28.7},{name:'Mumbai July',air:29.4,rh:81,wet:26.7},{name:'Dry inland example',air:38,rh:20,wet:21}];
export function carnot(fraction,hotK,coldK,inputJ=100){const limit=1-coldK/hotK,efficiency=clamp(fraction,0,1)*limit;return {limit,efficiency,work:inputJ*efficiency,rejected:inputJ*(1-efficiency)};}
export const pendulumPeriod=(L,g=G,angleDeg=0)=>2*Math.PI*Math.sqrt(L/g)*(1+rad(angleDeg)**2/16+11*rad(angleDeg)**4/3072);
export function resonance(f,ratio=.12,force=1){const w=2*Math.PI*f,w0=Math.PI,b=2*ratio*w0;return {amplitude:force/Math.hypot(w0*w0-w*w,b*w),phase:Math.atan2(b*w,w0*w0-w*w),naturalHz:.5};}
export function waterWave(x,depth,t,wavelength=2,amplitude=.15){const k=2*Math.PI/wavelength,w=Math.sqrt(G*k),p=k*x-w*t,a=amplitude*Math.exp(k*depth);return {x:x-a*Math.sin(p),z:depth+a*Math.cos(p),surface:amplitude*Math.cos(p),omega:w,speed:w/k};}
export function soundWave(x,t,wavelength=1,frequency=1,amplitude=.07){const p=2*Math.PI*(x/wavelength-frequency*t);return {x:x+amplitude*Math.cos(p),displacement:amplitude*Math.cos(p),pressureUnit:Math.sin(p)};}
export const echoDelay=(distance,speed=349)=>2*distance/speed;
export function doppler(f,sourceToward,listenerAway=0,c=349){return f*(c-listenerAway)/(c-sourceToward);}
export function bessel(m,z){if(Math.abs(z)>12){let sum=0;const N=512;for(let j=0;j<N;j++){const a=(j+.5)*Math.PI/N;sum+=Math.cos(m*a-z*Math.sin(a));}return sum/N;}let term=(z/2)**m;for(let j=2;j<=m;j++)term/=j;let sum=term;for(let j=1;j<45;j++){term*=-(z*z/4)/(j*(j+m));sum+=term;if(Math.abs(term)<1e-15)break;}return sum;}
export const BESSEL_ROOTS=[2.404825557695773,3.8317059702075125,5.135622301840683];
export function membraneShape(mode,r,theta=0){if(r>=1)return 0;return bessel(mode,BESSEL_ROOTS[mode]*r)*Math.cos(mode*theta);}
export function membraneFrequency(mode,load=0){
 let normal=0,weighted=0;const N=240;
 for(let j=0;j<N;j++){const r=(j+.5)/N,u=bessel(mode,BESSEL_ROOTS[mode]*r),v=u*u*r;normal+=v;weighted+=v*(1+load*Math.exp(-((r/.34)**8)));}
 return 110*BESSEL_ROOTS[mode]/BESSEL_ROOTS[0]*Math.sqrt(normal/weighted);
}
export function snell(angleDeg,n1,n2){const s=n1/n2*Math.sin(rad(angleDeg));return Math.abs(s)>1?{tir:true,angleDeg:null}:{tir:false,angleDeg:deg(Math.asin(s))};}
export function fresnel(angleDeg,n1=1,n2=1.333){const out=snell(angleDeg,n1,n2);if(out.tir)return {rs:1,rp:1};const a=rad(angleDeg),b=rad(out.angleDeg),c1=Math.cos(a),c2=Math.cos(b);return {rs:((n1*c1-n2*c2)/(n1*c1+n2*c2))**2,rp:((n2*c1-n1*c2)/(n2*c1+n1*c2))**2};}
export const malus=angleDeg=>Math.cos(rad(angleDeg))**2;
export function pinhole(height,objectDistance,screenDistance,holeMetres){return {imageHeight:height*screenDistance/objectDistance,blurDiameter:holeMetres*(1+screenDistance/objectDistance),relativeFlux:(holeMetres/.001)**2};}
export function mirrorImage(objectDistance,focalLength){const distance=1/(1/focalLength-1/objectDistance);return {distance,magnification:-distance/objectDistance};}
// Plane x=0, object (-distance,0,0), observer (-eyeDistance,eyeY,eyeZ).
export function planeMirrorPath(distance,eyeDistance=2,eyeY=1,eyeZ=.8){
 const fraction=distance/(distance+eyeDistance);
 return {object:[-distance,0,0],hit:[0,eyeY*fraction,eyeZ*fraction],eye:[-eyeDistance,eyeY,eyeZ],image:[distance,0,0]};
}
export const lightTime=metres=>metres/C;
export const fizeauFrequency=(distance,teeth)=>C/(4*distance*teeth);
export function fizeauReturn(speed,progress=1,distance=8633,teeth=720){
 const phase=2*Math.PI*speed*(2*distance/C)*progress*teeth;
 const wrapped=((phase%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
 const separation=Math.min(wrapped,2*Math.PI-wrapped);
 return {phase,markerFraction:((wrapped/(2*Math.PI)+.25)%1),centralRayBlocked:Math.cos(phase)<0,transmission:1-separation/Math.PI};
}
export function coinRay(depth,eyeHeight,eyeX,n=1.333){
 let lo=0,hi=eyeX;
 for(let j=0;j<70;j++){const x=(lo+hi)/2,a=n*x/Math.hypot(x,depth),b=(eyeX-x)/Math.hypot(eyeX-x,eyeHeight);if(a>b)hi=x;else lo=x;}
 const hitX=(lo+hi)/2,waterAngle=Math.atan2(hitX,depth),airAngle=Math.atan2(eyeX-hitX,eyeHeight);
 return {hitX,waterAngle,airAngle,apparentDepth:hitX/Math.tan(airAngle)};
}
export function doubleSlit(y,spacing,wavelength,L){const a=Math.hypot(L,y-spacing/2),b=Math.hypot(L,y+spacing/2),pathDifference=b-a;return {pathDifference,intensity:Math.cos(Math.PI*pathDifference/wavelength)**2};}
const sinc=x=>Math.abs(x)<1e-8?1:Math.sin(x)/x;
export const singleSlit=(y,width,wavelength,L)=>sinc(Math.PI*width*y/(wavelength*Math.hypot(y,L)))**2;
export const aragoIntensity=(r,discRadius,wavelength,L)=>bessel(0,2*Math.PI*discRadius*r/(wavelength*L))**2;
export const thinFilm=(nm,thicknessNm,angleDeg=0,n=1.333)=>Math.sin(2*Math.PI*n*thicknessNm*Math.cos(rad(angleDeg))/nm)**2;
export const grating=(y,spacing,wavelength,L,N=8)=>{const b=Math.PI*spacing*y/(wavelength*Math.hypot(y,L));return Math.abs(Math.sin(b))<1e-8?1:(Math.sin(N*b)/(N*Math.sin(b)))**2;};
export function raman(laserNm,shiftCm){const input=1e7/laserNm;return {stokesNm:1e7/(input-shiftCm),antiStokesNm:1e7/(input+shiftCm),energyEV:HC_EV_NM*shiftCm/1e7};}
export const glassIndex=nm=>1.512+(660-nm)/250*.018;
export const waterIndex=nm=>1.331+(660-nm)/250*.011;
export function prismDeviation(n,incidenceDeg=49.2,apexDeg=60){const r1=Math.asin(Math.sin(rad(incidenceDeg))/n),r2=rad(apexDeg)-r1,e=Math.asin(n*Math.sin(r2));return {deviationDeg:incidenceDeg+deg(e)-apexDeg,insideDeg:deg(r1),exitDeg:deg(e)};}
function dot(a,b){return a[0]*b[0]+a[1]*b[1];}
function add(a,b,s=1){return [a[0]+s*b[0],a[1]+s*b[1]];}
function refract(I,N,n1,n2){const eta=n1/n2,c=-dot(I,N),q=1-eta*eta*(1-c*c);return q<0?null:add(I.map(v=>v*eta),N,eta*c-Math.sqrt(q));}
function nextCircle(P,I,r=1){const b=dot(P,I),q=b*b-dot(P,P)+r*r;if(q<0)return null;const candidates=[-b-Math.sqrt(q),-b+Math.sqrt(q)].filter(t=>t>1e-7);return candidates.length?add(P,I,Math.min(...candidates)):null;}
export function rainbowPath(impact,n=1.333){
 const P=[-Math.sqrt(1-impact*impact),impact],inside=refract([1,0],P,1,n),Q=nextCircle(P,inside),normal=Q,reflected=add(inside,normal,-2*dot(inside,normal)),R=nextCircle(Q,reflected),out=refract(reflected,R.map(v=>-v),n,1);
 return {points:[add(P,[1,0],-1.5),P,Q,R,add(R,out,1.5)],out,rainbowAngleDeg:deg(Math.acos(clamp(-out[0],-1,1)))};
}
export function guidePath(angleDeg,n=1.5){
 let P=[1.5,0],I=[Math.sin(rad(angleDeg)),Math.cos(rad(angleDeg))];const points=[P],outer=2,inner=1;let escaped=false,minIncidence=90;
 for(let j=0;j<12;j++){const candidates=[nextCircle(P,I,outer),nextCircle(P,I,inner)].filter(Boolean).sort((a,b)=>Math.hypot(a[0]-P[0],a[1]-P[1])-Math.hypot(b[0]-P[0],b[1]-P[1]));if(!candidates.length)break;const Q=candidates[0],r=Math.hypot(...Q),N=Q.map(v=>v/r),cos=Math.abs(dot(I,N)),inc=deg(Math.acos(clamp(cos,-1,1)));minIncidence=Math.min(minIncidence,inc);points.push(Q);if(n*Math.sin(rad(inc))<1){escaped=true;break;}I=add(I,N,-2*dot(I,N));P=Q;}
 return {points,escaped,minIncidence,critical:deg(Math.asin(1/n))};
}

export function maxwellSpeed(v,tempC,moleculeKg=2.9915e-26){const a=moleculeKg/(2*1.380649e-23*(tempC+273.15));return 4/Math.sqrt(Math.PI)*a**1.5*v*v*Math.exp(-a*v*v);}
// RK4 integrates position, velocity and the two independent work integrals together.
export function oscillatorStep(state,dt,{frequency=.5,damping=.12,force=.4}={}){
 const k=Math.PI**2,b=2*damping*Math.PI;
 const derivative=(z,t)=>{const F=force*Math.sin(2*Math.PI*frequency*t);return[z[1],F-b*z[1]-k*z[0],F*z[1],b*z[1]*z[1]];};
 let s={...state},remaining=dt;
 while(remaining>1e-10){const h=Math.min(remaining,.005),z=[s.x,s.velocity,s.work,s.loss],a=derivative(z,s.time),B=derivative(z.map((v,i)=>v+h*a[i]/2),s.time+h/2),D=derivative(z.map((v,i)=>v+h*B[i]/2),s.time+h/2),E=derivative(z.map((v,i)=>v+h*D[i]),s.time+h);const out=z.map((v,i)=>v+h*(a[i]+2*B[i]+2*D[i]+E[i])/6);[s.x,s.velocity,s.work,s.loss]=out;s.time+=h;remaining-=h;}
 return s;
}

// Geometry exposed here is the actual geometry consumed by the teaching renderers.
export function pendulumForces(mass,theta,g=G){return {weight:[0,-mass*g],tangent:[-mass*g*Math.sin(theta)*Math.cos(theta),-mass*g*Math.sin(theta)**2]};}
// Deterministic illustrative surface ensemble, not a kinetic-rate prediction.
export function evaporationSample(index,rh,time){
 const speed=.35+.15*(index%8),energy=speed*speed,eligible=energy>1.2,returns=eligible&&(index%10)<Math.round(rh/10),phase=(time*.25+index*.137)%1;
 const base=[(index%6-2.5)*.35,-.8+Math.floor(index/12)*.22,(Math.floor(index/6)%2-.5)*.6];
 const active=eligible&&index>=36,flight=active?Math.sin(Math.PI*phase):0;
 return {speed,energy,eligible,active,returns,phase,position:active?[base[0],-.14+(returns?1.2*flight:1.5*phase),base[2]]:[base[0]+.025*speed*Math.sin(time*speed*4+index),base[1],base[2]],escaping:active&&!returns};
}
export function curvedMirrorRays(distance,focalLength,height=.3){
 const image=mirrorImage(distance,focalLength),source=[-distance,height,0],parallelHit=[0,height,0],centre=[0,0,0];
 return {source,image:[-image.distance,height*image.magnification,0],distance:image.distance,magnification:image.magnification,rays:[{hit:parallelHit,direction:[-1,-height/focalLength,0]},{hit:centre,direction:[-1,-height/distance,0]}]};
}
export function reducedEye(distance,mode=0,objectHeight=.02,pupilRadius=.002){
 const cornea=mode===1?34*(1.38-1.333)/.38:34,lens=clamp(50+1/distance-cornea,16,20),power=cornea+lens,imageDistance=1/(power-1/distance),imageHeight=-objectHeight*imageDistance/distance,retina=.02;
 const rays=[-pupilRadius,0,pupilRadius].map(height=>{const incomingSlope=(height-objectHeight)/distance,outgoingSlope=incomingSlope-power*height;return {height,incomingSlope,outgoingSlope,retinaHeight:height+retina*outgoingSlope,at:x=>height+x*outgoingSlope};});
 const intercepts=rays.map(r=>r.retinaHeight),retinalCentre=-objectHeight*retina/distance,blurDiameter=Math.max(...intercepts)-Math.min(...intercepts);
 return {cornea,lens,power,imageDistance,imageHeight,objectHeight,distance,pupilRadius,retina,rays,retinalCentre,blurDiameter};
}
function shellEntry(P,direction,radius=1.15){const centre=[0,-1],Q=[P[0],P[1]+1],b=dot(Q,direction),t=-b+Math.sqrt(b*b+radius*radius-dot(Q,Q));return add(P,direction,t);}
export function skyScatterGeometry(altitude){
 const sun=[Math.cos(rad(altitude)),Math.sin(rad(altitude))],observer=[0,0],vertex=[.08,.035],directEntry=shellEntry(observer,sun),scatterEntry=shellEntry(vertex,sun);
 return {sun,observer,vertex,directEntry,scatterEntry,globeCentre:[0,-1],globeRadius:1,shellRadius:1.15};
}
export function waterGlareGeometry(incidenceDeg){
 const a=rad(incidenceDeg),contact=[0,-.8,0],incidentDirection=[Math.sin(a),-Math.cos(a),0],reflectedDirection=[Math.sin(a),Math.cos(a),0],length=2;
 return {contact,incident:[-length*Math.sin(a),-.8+length*Math.cos(a),0],reflected:[length*Math.sin(a),-.8+length*Math.cos(a),0],incidentDirection,reflectedDirection,s:[0,0,1],p:[Math.cos(a),-Math.sin(a),0],analyser:[1.15*Math.sin(a),-.8+1.15*Math.cos(a),0]};
}
export function phaseSum(phases){const real=phases.reduce((s,p)=>s+Math.cos(p),0)/phases.length,imaginary=phases.reduce((s,p)=>s+Math.sin(p),0)/phases.length;return {phases,real,imaginary,intensity:real*real+imaginary*imaginary};}
export function aperturePhases(y,size,wavelength,L,gratingMode=false,N=64){
 const count=gratingMode?8:N,sinTheta=y/Math.hypot(y,L),positions=Array.from({length:count},(_,i)=>gratingMode?(i-(count-1)/2)*size:((i+.5)/count-.5)*size),phases=positions.map(x=>-2*Math.PI*x*sinTheta/wavelength);
 return {...phaseSum(phases),positions,sinTheta};
}
export function rimPhases(r,R,wavelength,L,N=96){const theta=Array.from({length:N},(_,i)=>2*Math.PI*i/N),phases=theta.map(a=>-2*Math.PI*R*r*Math.cos(a)/(wavelength*L));return {...phaseSum(phases),theta};}
export function filmPhases(nm,thicknessNm,n=1.333){return {...phaseSum([Math.PI,4*Math.PI*n*thicknessNm/nm]),opticalPath:2*n*thicknessNm};}
export function ramanPhase(u,time,laserNm,outNm){return (4*Math.PI*u-2*time)*laserNm/outNm;}
