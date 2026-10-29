// SI unless a unit is named. Educational models and their bounds are documented in visual_fields.md.
export const DEG=Math.PI/180, C=299792458, HC=1239.841984, E_CHARGE=1.602176634e-19;
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const length=v=>Math.hypot(...v);
export function motor(angle,I=2,B=.5,N=10,A=.04,commutator=true){
  const s=Math.sin(angle*DEG),switchSign=commutator?(s>=0?1:-1):1;
  return {current:I*switchSign,torque:N*I*B*A*s*switchSign,force:N*I*switchSign*B*.2};
}
export function motorVectors(angle,I=2,B=.5,N=10,commutator=true){
  const q=motor(angle,I,B,N,.04,commutator),s=Math.sin(angle*DEG),co=Math.cos(angle*DEG);
  return {rotationY:(90-angle)*DEG,sides:[
    {position:[-.1*s,0,.1*co],current:[0,-q.current,0],force:[0,0,q.force]},
    {position:[.1*s,0,-.1*co],current:[0,q.current,0],force:[0,0,-q.force]},
  ],torque:q.torque};
}
export function generator(angle,omega=2,B=.5,N=10,A=.04){return {flux:N*B*A*Math.cos(angle*DEG),voltage:N*B*A*omega*Math.sin(angle*DEG)};}
export function transformer(primaryV,Np,Ns,secondaryI=1,ac=true){const secondaryV=ac?primaryV*Ns/Np:0;return {secondaryV,primaryI:ac?secondaryI*Ns/Np:0,inputPower:secondaryV*secondaryI,outputPower:secondaryV*secondaryI};}
export function photoelectric(wavelengthNm,flux=1000,retardingV=0,work=2.71){const energy=HC/wavelengthNm,maxKE=Math.max(0,energy-work),fraction=maxKE>0?clamp(1-retardingV/maxKE,0,1):0;return {energy,maxKE,stoppingV:maxKE,electronsPerSecond:flux*fraction,currentA:flux*fraction*E_CHARGE};}
export function solarGeometry(day,latitude=19.08,tilt=23.44,hour=12){
  const dec=Math.asin(Math.sin(tilt*DEG)*Math.sin(2*Math.PI*(day-80)/365.25))/DEG,p=latitude*DEG,d=dec*DEG,h=(hour-12)*15*DEG;
  const sinAlt=Math.sin(p)*Math.sin(d)+Math.cos(p)*Math.cos(d)*Math.cos(h);
  const cosH=-Math.tan(p)*Math.tan(d);
  return {declination:dec,noonAltitude:90-Math.abs(latitude-dec),altitude:Math.asin(clamp(sinAlt,-1,1))/DEG,dayHours:cosH<=-1?24:cosH>=1?0:24*Math.acos(cosH)/Math.PI};
}
export function lunarGeometry(phaseAngle,yearAngle=0,inclination=5.145){
  // Earth is origin; Sun rotates in x-z plane. Fixed lunar nodes are the x axis.
  const u=(phaseAngle+yearAngle)*DEG,L=yearAngle*DEG,i=inclination*DEG,D=384400,R=6371,r=1737.4,A=149597870,S=695700;
  const moon=[D*Math.cos(u),D*Math.sin(u)*Math.sin(i),D*Math.sin(u)*Math.cos(i)],sun=[Math.cos(L),0,Math.sin(L)];
  const along=moon.reduce((s,x,k)=>s+x*sun[k],0),perp=Math.sqrt(Math.max(0,D*D-along*along));
  const umbra=R-D*(S-R)/A,solarReach=R+r+D*(S+r)/A;
  let eclipse='none'; if(along>0&&perp<solarReach)eclipse='solar';if(along<0&&perp<umbra+r)eclipse='lunar';
  return {moon,sun,along,perpendicularKm:perp,umbraKm:umbra,lit:(1-along/D)/2,eclipse,moonAngle:u};
}
export function tidalAcceleration(position,source,GM=4.9048695e12){const dr=source.map((x,k)=>x-position[k]),r=length(dr),d=length(source);return dr.map((x,k)=>GM*(x/r**3-source[k]/d**3));}
export function dipoleField(position,moment=[0,1,0]){const r=length(position);if(r<.01)return [0,0,0];const dot=position.reduce((s,x,k)=>s+x*moment[k],0);return position.map((x,k)=>(3*x*dot/r**2-moment[k])/r**3);}
export function wireField(I,r){return [0,2e-7*I/Math.max(.0001,r),0];}
export function circuit(V,resistances=[330],ledV=2,internalR=0,series=false,connected=true){
  if(!connected)return {currents:resistances.map(()=>0),totalI:0,terminalV:V,power:0};
  if(series){const totalI=Math.max(0,(V-ledV*resistances.length)/(internalR+resistances.reduce((s,r)=>s+r,0)));return {currents:resistances.map(()=>totalI),totalI,terminalV:V-totalI*internalR,power:V*totalI};}
  const conductance=resistances.reduce((s,r)=>s+1/r,0),totalI=Math.max(0,(V-ledV)*conductance/(1+internalR*conductance)),terminalV=V-internalR*totalI;
  return {currents:resistances.map(r=>Math.max(0,(terminalV-ledV)/r)),totalI,terminalV,power:V*totalI};
}
export const decay=(initial,halfLife,time)=>initial*2**(-time/halfLife);
export function parallax(distancePc,baselineAU=1,uncertainty=.001){const arcsec=baselineAU/distancePc;return {arcsec,relativeError:uncertainty/arcsec};}
export function cepheid(periodDays,distancePc){
  // An illustrative V-band calibration, M_V=-2.76 log10(P)-1.40; not a precision cosmological distance estimator.
  const absoluteMagnitude=-2.76*Math.log10(periodDays)-1.4,apparentMagnitude=absoluteMagnitude+5*Math.log10(distancePc)-5;
  return {absoluteMagnitude,apparentMagnitude,relativeFlux:10**(-.4*absoluteMagnitude)/distancePc**2};
}
export function whiteDwarf(mass){const limit=1.44;if(mass>=limit)return {stable:false,radiusKm:0};return {stable:true,radiusKm:7788*Math.sqrt((limit/mass)**(2/3)-(mass/limit)**(2/3))};}
export function expansion(points,observer=0,scale=1,H=70){const relative=points.map(p=>p.map((x,k)=>(x-points[observer][k])*scale));const distances=relative.map(length);return {relative,distances,velocities:distances.map(d=>H*d),redshift:scale-1};}
export function foucault(latitude,hours){return {degrees:-360/23.9344696*Math.sin(latitude*DEG)*hours,periodHours:Math.abs(latitude)<1e-9?Infinity:23.9344696/Math.abs(Math.sin(latitude*DEG))};}
export function trackParticle(massMeV,momentumMeV){const beta=momentumMeV/Math.hypot(momentumMeV,massMeV);return {beta,scatter:13.6/(beta*momentumMeV)*Math.sqrt(.01)*(1+.038*Math.log(.01)),relativeGrainDensity:1/beta**2};}
export function boseStates(kind){return kind==='labelled'?[[2,0,'AB'],[1,1,'A|B'],[1,1,'B|A'],[0,2,'AB']]:kind==='fermion'?[[1,1,'one per state']]:[[2,0,'2|0'],[1,1,'1|1'],[0,2,'0|2']];}
export function parityCounts(spin=1,alignment=.8){const down=Math.round(100*(.5+spin*alignment/4));return {up:100-down,down};}
export function l1Balance(distanceEarthM=1.5e9){const A=149597870700,GM_S=1.3271244e20,GM_E=3.9860044e14,r=A-distanceEarthM,omega=2*Math.PI/(365.256*86400);return {sunPull:GM_S/r**2,earthPull:GM_E/distanceEarthM**2,netInward:GM_S/r**2-GM_E/distanceEarthM**2,needed:omega**2*r};}
export function massEnergy(hydrogenKg){const fraction=(4*1.00782503223-4.00260325413)/(4*1.00782503223);return {fraction,releasedKg:hydrogenKg*fraction,energyJ:hydrogenKg*fraction*C**2};}
export function sphereConductorField(position,radius=1,external=[1,0,0]){
  const r=length(position);if(r<radius)return {external,induced:external.map(x=>-x),total:[0,0,0]};
  // Uniform field + analytic induced dipole of a neutral conducting sphere.
  const eDot=position.reduce((s,x,k)=>s+x*external[k],0),induced=position.map((x,k)=>radius**3*(3*eDot*x/r**5-external[k]/r**3));
  return {external,induced,total:external.map((x,k)=>x+induced[k])};
}
export function hydrogenLinePopulation(T,ne=1e20,abundance=1){
  const k=1.380649e-23,h=6.62607015e-34,me=9.1093837139e-31,kEv=8.617333262e-5;
  const ionRatio=(2*Math.PI*me*k*T/h**2)**1.5/ne*Math.exp(-13.6/(kEv*T)),neutral=1/(1+ionRatio),excited=4*Math.exp(-10.2/(kEv*T));
  return {neutral,ionised:1-neutral,n2:neutral*excited,lineProxy:abundance*neutral*excited};
}
export function electrostatic(q=3,distance=1,conductor=true){return {chargeA:-q,chargeB:q,total:0,relativeForce:conductor?q*q/Math.max(.1,distance)**2:q*q/Math.max(.1,distance)**3};}
export function lensDeflection(impactSolarR=1){return 1.75/impactSolarR;}

export function coilField(I,turns=1,radius=.01,axial=0,spacing=.001){let B=0;for(let j=0;j<turns;j++){const y=(j-(turns-1)/2)*spacing;B+=2*Math.PI*1e-7*I*radius**2/(radius**2+(axial-y)**2)**1.5;}return B;}
export function circuitProbe(series,selection){
 const g=circuitTopology(series),load=selection===1||selection===4?1:0;
 let red=selection>=3?g.loads[load].a:selection===2?[-2,.6,0]:[-1,g.loads[load].center[1],0];
 let black=selection>=3?g.loads[load].b:red;
 if(series&&selection===4)[red,black]=[black,red];
 return {load,red,black,voltage:selection>=3};
}
export function loadLeads(load){
 const [x,y,z]=load.center;
 return [[load.a,[x-.275,y,z]],[[x+.275,y,z],[x+.41,y,z]],[[x+.69,y,z],load.b]];
}
export function domainOrientation(field,favoured){
 const target=field<0?Math.PI:0,base=target+(favoured?Math.PI/3:4*Math.PI/3),fraction=Math.max(0,(Math.abs(field)-50)/50);
 const delta=Math.atan2(Math.sin(target-base),Math.cos(target-base));
 return base+delta*fraction;
}
export function domainNet(field){
 const fraction=.5+.45*Math.abs(field)/100,a=domainOrientation(field,true),b=domainOrientation(field,false);
 const vector=[fraction*Math.sin(a)+(1-fraction)*Math.sin(b),fraction*Math.cos(a)+(1-fraction)*Math.cos(b)];
 return {fraction,vector,magnitude:Math.hypot(...vector)};
}

// Rendering contracts: coordinates below are also the coordinates consumed by the scenes.
export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const add=(a,b)=>a.map((x,i)=>x+b[i]);
export const scale=(a,s)=>a.map(x=>x*s);
export function wireProbeGeometry(I,rCm,kind='wire',turns=1){
 const coil=kind==='coil',tram=kind==='tram',position=coil?[0,0,0]:[tram?1.6:rCm*.35,0,0],current=tram?500:I,distanceM=tram?200:rCm/100;
 const contributions=coil?Array.from({length:turns},(_,j)=>[0,coilField(I,1,.01,(j-(turns-1)/2)*.001)*1e6,0]):[[0,0,-2e-7*current/distanceM*1e6]];
 const source=contributions.reduce(add,[0,0,0]),background=[0,38.4,0];
 return {position,current,distanceM,contributions,source,background,total:add(source,background),arrowScale:coil?1500:80};
}
export function loopPoint(fraction){const points=[[-2,-.8,0],[-2,.8,0],[2,.8,0],[2,-.8,0],[-2,-.8,0]],lengths=[1.6,4,1.6,4];let s=((fraction%1)+1)%1*11.2;for(let i=0;i<4;i++){if(s<=lengths[i])return points[i].map((x,k)=>x+(points[i+1][k]-x)*s/lengths[i]);s-=lengths[i];}return points[0];}
export function circuitTopology(series=false,open=false){
 // Source on x=-2, loads interrupt each path. No ideal-wire bypass of a load.
 const y1=series?.6:.45,y2=series?-.6:-.45;
 const edges=series?[[[-2,-.8,0],[-2,-.4,0]],[[-2,.4,0],[-2,.6,0]],[[-2,.6,0],[-.8,.6,0]],[[.8,.6,0],[2,.6,0]],[[2,.6,0],[2,-.6,0]],[[2,-.6,0],[.8,-.6,0]],[[-.8,-.6,0],[-2,-.6,0]],[[-2,-.6,0],[-2,-.8,0]]]:[[[-2,-.8,0],[-2,-.4,0]],[[-2,.4,0],[-2,.8,0]],[[-2,.8,0],[-1.5,.8,0]],[[-1.5,.8,0],[-1.5,-.45,0]],[[-2,-.8,0],[1.5,-.8,0]],[[1.5,.8,0],[1.5,-.8,0]],[[-1.5,y1,0],[-.8,y1,0]],[[.8,y1,0],[1.5,y1,0]],[[-1.5,y2,0],[-.8,y2,0]],[[.8,y2,0],[1.5,y2,0]]];
 const loads=[{a:[-.8,y1,0],b:[.8,y1,0],center:[0,y1,0]},{a:[-.8,y2,0],b:[.8,y2,0],center:[0,y2,0]}];
 if(open)edges[2]=[edges[2][0],[-1.8,.8,0]];
 return {edges,loads,connections:series?[[0,1],[1,2],[2,3]]:[[0,1],[0,2],[1,3],[2,3]],series,open};
}
export function protectionState(leakmA,earth=true,touch=false,overload=false,latched=false){const faultPath=earth?'protective earth':touch?'virtual person to ground':'none',leak=faultPath==='none'||overload?0:leakmA,current=overload?20:1,trip=latched||leak>30||current>16;return {faultPath,leakmA:leak,liveA:trip?0:current,neutralA:trip?0:current-leak/1000,trip,rcd:leak>30,breaker:current>16,caseLive:!trip&&!earth};}
export function observerFrame(latitude,hours,dayLength=24){const p=latitude*DEG,L=-2*Math.PI*hours/dayLength,up=[Math.cos(p)*Math.cos(L),Math.sin(p),Math.cos(p)*Math.sin(L)],north=[-Math.sin(p)*Math.cos(L),Math.cos(p),-Math.sin(p)*Math.sin(L)],east=[Math.sin(L),0,-Math.cos(L)];return {up,north,east,longitude:L,project:v=>[dot(v,east),dot(v,north),dot(v,up)]};}
export function foucaultGeometry(latitude,hours){const frame=observerFrame(latitude,hours,23.9344696),a=foucault(latitude,hours).degrees*DEG,local=[-Math.sin(a),Math.cos(a),0],world=add(scale(frame.east,local[0]),scale(frame.north,local[1]));return {...frame,local,world,angle:a};}
export function shadowGeometry(sun,origin=[0,0,0],bodyRadius=.0348,length=3,slope=-(695700-6371)/149597870){const axis=scale(sun,-1);return {near:origin,far:add(origin,scale(axis,length)),axis,center:add(origin,scale(axis,length/2)),nearRadius:bodyRadius,farRadius:bodyRadius+length*slope,length};}
export function transformerPhase(primaryPeak,ratio,time,dc=false){const phase=time*1.5,wave=dc?1:Math.cos(phase),flux=primaryPeak/24*wave,fluxWb=primaryPeak/(100*1.5)*wave,primaryV=dc?0:primaryPeak*Math.sin(phase);return {flux,fluxWb,primaryV,secondaryV:primaryV*ratio,phase};}
export function seasonFootprint(day,latitude,tilt){const north=solarGeometry(day,latitude,tilt),south=solarGeometry(day,-latitude,tilt);return {north,south,normalFlux:Math.max(0,Math.sin(north.noonAltitude*DEG)),oppositeFlux:Math.max(0,Math.sin(south.noonAltitude*DEG)),footprintRatio:1/Math.max(.02,Math.sin(north.noonAltitude*DEG))};}
export function trackGeometry(mass,p,noise,resolution=.01){const q=trackParticle(mass,p);let y=0,z=0,dy=0,dz=0;const raw=noise.map((n,j)=>{dy+=n[0]*q.scatter*Math.sqrt(12/noise.length);dz+=n[1]*q.scatter*Math.sqrt(12/noise.length);y+=dy*.04;z+=dz*.04;return [-2+j/25,y,z];});const extent=Math.max(.001,...raw.flatMap(v=>[Math.abs(v[1]),Math.abs(v[2])])),magnification=Math.min(12,.85/extent),points=raw.map(v=>[v[0],v[1]*magnification,v[2]*magnification]),grains=points.filter((_,j)=>j%Math.max(1,Math.round(8/Math.sqrt(q.relativeGrainDensity)))===0);return {...q,raw,points,grains,magnification};}

export function parityGeometry(spin,alignment,mirror=false){const velocity=[0,-spin*alignment,0],axial=[0,spin,0];return {spin:axial,velocity,reflectedSpin:mirror?[axial[0],-axial[1],-axial[2]]:axial,reflectedVelocity:mirror?[-velocity[0],velocity[1],velocity[2]]:velocity,counts:parityCounts(spin,alignment)};}
export function countingGeometry(kind,index){const states=boseStates(kind),state=states[clamp(index,0,states.length-1)],positions=kind==='labelled'&&state[2]==='B|A'?[[.9,-.2,.2],[-.9,.2,.2]]:Array.from({length:2},(_,j)=>[j<state[0]?-.9:.9,(j-.5)*.4,.2]);return {state,positions,count:states.length};}
export function deflectionGeometry(impact,prediction=1){const theta=lensDeflection(impact)*.12*prediction,bend=2*Math.tan(theta),y=.45*impact*Math.sqrt(1+(bend/2)**2)-.1,observer=[2,y-bend,0],near=[0,y,0],trueStar=[-2,y,0],apparentStar=[-2,y+bend,0];return {ray:[trueStar,near,observer],observer,trueStar,apparentStar,backward:[observer,apparentStar],bend};}
export function earthSensorGeometry(latitude,azimuth){const frame=observerFrame(latitude,0),field=dipoleField(frame.up,[0,-1,0]),enu=frame.project(field),a=azimuth*DEG;return {...frame,field,enu,device:[enu[0]*Math.cos(a)+enu[1]*Math.sin(a),-enu[0]*Math.sin(a)+enu[1]*Math.cos(a),enu[2]]};}
export function haloPoint(day){const t=day/177.86*2*Math.PI;return [.45*Math.cos(t),.65*Math.sin(t),.3*Math.sin(2*t)];}
export function distanceGeometry(pc,baseline,period,timeDays){const phase=((timeDays/period)%1+1)%1,flux=cepheid(period,pc).relativeFlux*(1+.3*Math.sin(2*Math.PI*phase)),depth=1+Math.log10(pc),halfBaseline=.3*baseline;return {earth:[-1.8,0,0],positions:[[-1.8,-halfBaseline,0],[-1.8,halfBaseline,0],[depth,0,0],[-1.8,-halfBaseline,0]],star:[depth,0,0],phase,flux,normalisedFlux:1+.3*Math.sin(2*Math.PI*phase)};}
export function diodeOperatingPoint(V,R=330,internal=0,white=false,connected=true,reversed=false){const knee=white?3.3:2,nVt=.08,Is=.02/Math.expm1(knee/nVt),diodeV=I=>nVt*Math.log1p(I/Is);let lo=0,hi=Math.max(0,V/R);for(let j=0;j<70;j++){const I=(lo+hi)/2;if(diodeV(I)+I*(R+internal)>V)hi=I;else lo=I;}const current=connected&&!reversed?(lo+hi)/2:0;return {current,diodeV:current?diodeV(current):V,terminalV:V-current*internal,voltageAtCurrent:diodeV,currentAtVoltage:voltage=>Is*Math.expm1(Math.min(700,voltage/nVt))};}
export function trackInference(momentum,observedScatter,resolution,lever=4){const uncertainty=Math.max(.0001,resolution/lever),K=13.6/momentum*Math.sqrt(.01)*(1+.038*Math.log(.01)),lo=Math.max(1e-6,observedScatter-uncertainty),hi=observedScatter+uncertainty,massAt=s=>momentum*Math.sqrt(Math.max(0,(s/K)**2-1));return {uncertainty,massRange:[massAt(lo),massAt(hi)],betaRange:[Math.min(1,K/hi),Math.min(1,K/lo)],consistent:hi>=K};}
export function chargeGeometry(q,separation=1,mode=0){const centre=1.35+(separation-1)*.6,sample=Array.from({length:8},(_,j)=>{const positive=[centre-.25+j%2*.45,-.55+Math.floor(j/2)*.35,.3],base=positive[0]+.1,alpha=q/8/Math.max(.5,separation),electron=mode===1?base+(centre-.43-base)*Math.min(1,alpha):base-(mode===2?.1*alpha:0);return {positive,electron:[electron,positive[1],.3]};}),sourceElectrons=Array.from({length:8},(_,j)=>[j<q?(mode===0?centre-.45+j%2*.45:-2.7+j%2*.15):-1.55+j%2*.5,-.55+Math.floor(j/2)*.35,.3]);return {centre,sample,sourceElectrons,sourceNet:q,sampleNet:mode?0:-q,storedNet:mode?-q:0,total:0};}

// Sun-axis cut plane containing the selected target centre. Distances/radii in km.
// Uses the very same lunar state as the overview; no alignment is invented for the inset.
export function eclipseShadowSection(q,body='earth'){
  const solar=body==='moon',sourceRadiusKm=solar?1737.4:6371,targetRadiusKm=solar?6371:1737.4,SunRadiusKm=695700,SunDistanceKm=149597870;
  const targetDownstreamKm=solar?q.along:-q.along,targetOffsetKm=q.perpendicularKm;
  const planeKm=targetDownstreamKm>0?targetDownstreamKm:384400;
  const umbraSlope=-(SunRadiusKm-sourceRadiusKm)/SunDistanceKm,penumbraSlope=(SunRadiusKm+sourceRadiusKm)/SunDistanceKm;
  const umbraAt=x=>sourceRadiusKm+x*umbraSlope,penumbraAt=x=>sourceRadiusKm+x*penumbraSlope;
  const centralSignedRadiusKm=umbraAt(planeKm),penumbraRadiusKm=penumbraAt(planeKm);
  return {body,sourceRadiusKm,targetRadiusKm,targetDownstreamKm,targetOffsetKm,planeKm,umbraSlope,penumbraSlope,centralSignedRadiusKm,centralKind:centralSignedRadiusKm>=0?'umbra':'antumbra',penumbraRadiusKm,
    intersects:targetDownstreamKm>0&&targetOffsetKm<targetRadiusKm+penumbraRadiusKm,
    centralIntersects:targetDownstreamKm>0&&targetOffsetKm<targetRadiusKm+Math.abs(centralSignedRadiusKm),
    profile:Array.from({length:61},(_,j)=>{const axialKm=j/60*450000;return {axialKm,centralSignedRadiusKm:umbraAt(axialKm),penumbraRadiusKm:penumbraAt(axialKm)};})};
}
