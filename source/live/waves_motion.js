import * as M from './waves_models.mjs';
import {sceneTools,diagramTools,fixed,rads} from './waves_draw.js';
export function mountMotion(lab,api,id,story=null,preset={}){
 if(['w9-flutter','w9-echo','w9-tone'].includes(id))api.playback(false);
 const v=sceneTools(lab,api),c=api.colors();let time=.25,draw=()=>{};api.loop(dt=>time+=dt);
 const slider=(name,min,max,step,value,unit,fn)=>api.slider(name,{min,max,step,value,fmt:x=>`${fixed(x,step<1?Math.ceil(-Math.log10(step)):0)} ${unit}`,onInput:x=>{fn(x);lab.refresh();}});
 if(id==='w9-pendulum'){
  let L=1,mass=10,angle=12;
  slider('String length',.25,4,.05,L,'m',x=>L=x);
  slider('Bob mass',1,100,1,mass,'kg',x=>mass=x);
  slider('Starting angle',3,40,1,angle,'°',x=>angle=x);
  draw=(ctx,W,H)=>{
   const d=diagramTools(ctx,c),T=M.pendulumPeriod(L,9.8,angle),Tref=M.pendulumPeriod(1,9.8,angle),a=rads(angle)*Math.cos(2*Math.PI*time/T),b=rads(angle)*Math.cos(2*Math.PI*time/Tref);
   d.text('Two clocks share one time',24,25);
   d.text('Red: gravitational g; green: acceleration along the arc',24,45,c.muted,12);
   for(const [x,len,th,col,m]of [[165,75*L/Math.max(L,1),a,c.proton,mass],[460,75/Math.max(L,1),b,c.electron,10]]){
    const X=x+len*Math.sin(th),Y=55+len*Math.cos(th),F=M.pendulumForces(m,th),acceleration=F.tangent.map(q=>q/m),scale=5.2;
    d.line(x,55,X,Y,c.ink,2);d.dot(X,Y,10,col);
    // Offset arrow tails outside the bob so a small vector is not buried in it.
    d.arrow(X,Y+12,X,Y+12+9.8*scale,c.proton,2);
    const size=Math.hypot(...acceleration);
    if(size>1e-8){const dx=acceleration[0]/size,dy=-acceleration[1]/size;d.arrow(X+12*dx,Y+12*dy,X+(12+scale*size)*dx,Y+(12+scale*size)*dy,c.green,3);}
   }
   d.text(`${fixed(L,2)} m · ${mass} kg`,85,208,c.proton);
   d.text('Reference: 1 m · 10 kg',365,208,c.electron);
   d.text(`Period ${fixed(T,3)} s`,85,232,c.proton);
   d.text(`Period ${fixed(Tref,3)} s`,365,232,c.electron);
   const force=Math.abs(mass*9.8*Math.sin(a));
   lab.say(`Period ${fixed(T,3)} s; selected mass ${mass} kg. Weight ${fixed(mass*9.8,1)} N; current tangential pull ${fixed(force,2)} N. Red g = 9.8 m/s²; green pull/mass = ${fixed(force/mass,3)} m/s². Both bobs use one fixed acceleration scale. More mass increases pull and inertia together; it does not change this clock.`);
  };
 }else if(id==='w9-resonance'){
  let f=.5,damping=.12,osc={x:0,velocity:0,work:0,loss:0,time:0};const k=Math.PI**2;slider('Push frequency',.1,1,.01,f,'Hz',n=>f=n);slider('Damping ratio',.03,.6,.01,damping,'',n=>damping=n);api.button('Give one small push now',()=>{const impulse=.15;osc.work+=osc.velocity*impulse+impulse*impulse/2;osc.velocity+=impulse;lab.refresh();});api.loop(dt=>{osc=M.oscillatorStep(osc,dt,{frequency:f,damping,force:.4});});
  draw=(ctx,W,H)=>{const d=diagramTools(ctx,c),z=M.resonance(f,damping,.4);const p=d.plot(q=>M.resonance(q,damping,.4).amplitude,{x:345,y:50,w:250,h:125,min:.1,max:1,ymin:0,ymax:.7});d.dot(p.X(f),p.Y(z.amplitude),4,c.proton);d.text('Driven oscillator and steady response',24,25);const bx=160+osc.x*120;d.line(30,95,30,170,c.ink,3);d.line(30,168,300,168,c.rule);d.path(Array.from({length:30},(_,i)=>[30+(bx-45)*i/29,133+(i===0||i===29?0:(i%2?9:-9))]),c.ink);ctx.fillStyle=c.electron;ctx.fillRect(bx-15,118,30,30);d.line(bx,95,bx+70*Math.sin(2*Math.PI*f*osc.time),95,c.proton,3);d.text('red line: applied drive',50,183,c.proton,12);d.text('drive frequency (Hz) →',410,215);d.text(`Current x ${fixed(osc.x,3)} m; energy ${fixed((osc.velocity**2+k*osc.x**2)/2,3)} J`,30,200);lab.say(`Natural frequency 0.50 Hz; steady amplitude ${fixed(z.amplitude,3)} m. Measured input ${fixed(osc.work,3)} J and damping loss ${fixed(osc.loss,3)} J. A badly timed manual push can remove energy instead of adding it.`);};
 }else if(id==='w9-flutter'){
  let feedback=.6,damping=.3,elapsed=5;if(v.root)v.root.rotation.x=.5;const deck=[];for(let i=0;i<9;i++)deck.push(v.box(-2.4+i*.6,0,0,.57,.08,1.1,c.electron));for(let i=0;i<4;i++)v.arrow([-3,1-i*.55,.7],[-2,1-i*.55,.7],c.neutron);slider('Steady-flow feedback',0,1,.05,feedback,'relative',x=>feedback=x);slider('Damping',0,1,.05,damping,'relative',x=>damping=x);slider('Elapsed time',0,12,.1,elapsed,'s',x=>elapsed=x);
  draw=(ctx,W,H)=>{const d=diagramTools(ctx,c),rate=.12*feedback-.1*damping,en=Math.exp(2*rate*elapsed),a=.06*Math.exp(rate*elapsed)*Math.cos(2*elapsed);deck.forEach((o,i)=>{if(o)o.rotation.x=a*Math.sin((i+1)*Math.PI/10);});d.text('Steady flow · twist-dependent energy feedback',24,25);const p=d.plot(q=>Math.exp(2*rate*q),{x:345,w:250,min:0,max:12,ymin:0,ymax:20});d.dot(p.X(elapsed),p.Y(en),4,c.proton);ctx.setLineDash([5,4]);d.line(60,115,280,115,c.rule,1);ctx.setLineDash([]);const displayAngle=4*a;d.line(170-100*Math.cos(displayAngle),115-100*Math.sin(displayAngle),170+100*Math.cos(displayAngle),115+100*Math.sin(displayAngle),c.electron,5);d.dot(170,115,4,c.ink);d.text('Deck cross-section · twist ×4',35,61,c.ink,12);d.text(`Actual central twist ${fixed(a*180/Math.PI,2)}°`,35,173,c.ink,12);d.text(`Relative energy ${fixed(en,2)}`,345,211);d.text('elapsed time (s) →',435,233);lab.say(`Input coefficient ${fixed(.12*feedback,3)} s⁻¹; damping coefficient ${fixed(.1*damping,3)} s⁻¹. The model’s energy ${rate>0?'grows':'decays'} even though the incoming flow is steady. No gust frequency is imposed.`);};
 }else if(id==='w9-water'){
  let wavelength=2,amplitude=.03;
  const surface=v.surface(17,49,(i,j)=>[-3+j/8,0,-1+i/8],c.electron),markers=v.particles(45,c.muted,.045),tracked=v.ball(0,0,.1,.05,c.proton),orbit=v.line([],c.rule),enlarged=v.ball(4.6,0,.1,.08,c.proton);
  v.ball(4.6,0,.1,.035,c.ink);
  v.line([[3.2,-1.45,.1],[6,-1.45,.1],[6,1.45,.1],[3.2,1.45,.1],[3.2,-1.45,.1]],c.rule);
  if(v.root)v.root.rotation.x=.45;
  lab.kit?.label('same red parcel · motion ×40',[4.6,1.7,.1]);
  lab.kit?.label('red parcel',()=>[tracked?.position.x??0,(tracked?.position.y??0)+.35,.1]);
  slider('Water wavelength',1,4,.1,wavelength,'m',x=>wavelength=x);
  slider('Wave amplitude',.01,.03,.005,amplitude,'m',x=>amplitude=x);
  draw=(ctx,W,H)=>{
   const d=diagramTools(ctx,c),tau=time*.4;
   surface.update((i,j)=>{const x=-3+j/8;return [x,M.waterWave(x,0,tau,wavelength,amplitude).surface,-1+i/8];});
   for(let i=0;i<45;i++){const x=-2.8+(i%15)*.4,depth=-.25*Math.floor(i/15),q=M.waterWave(x,depth,tau,wavelength,amplitude);markers.set(i,q.x,q.z,.1);}markers.finish();
   const q=M.waterWave(0,0,tau,wavelength,amplitude);
   tracked?.position.set(q.x,q.z,.1);enlarged?.position.set(4.6+40*q.x,40*q.z,.1);
   orbit.set(Array.from({length:97},(_,i)=>[4.6+40*amplitude*Math.cos(i/96*2*Math.PI),40*amplitude*Math.sin(i/96*2*Math.PI),.1]));
   d.text('A travelling crest; one parcel circles its mean position',24,25);
   const scale=50,X=x=>195+scale*x,Y=y=>115-scale*y;
   for(let j=0;j<45;j++){const x=-2.8+(j%15)*.4,depth=-.25*Math.floor(j/15),p=M.waterWave(x,depth,tau,wavelength,amplitude);d.dot(X(p.x),Y(p.z),j===7?4:2.5,j===7?c.proton:c.electron);}
   d.path(Array.from({length:150},(_,i)=>{const x=-3+6*i/149;return[X(x),Y(M.waterWave(x,0,tau,wavelength,amplitude).surface)];}),c.electron);
   d.dot(X(0),Y(0),2,c.ink);
   d.text('Whole-wave side view',45,66,c.muted,12);
   d.line(X(-3),155,X(3),155,c.rule);d.text('6 m of water',110,176,c.muted,12);
   const cx=485,cy=116,zoom=40,r=scale*zoom*amplitude;
   d.path(Array.from({length:97},(_,i)=>[cx+r*Math.cos(i/96*2*Math.PI),cy-r*Math.sin(i/96*2*Math.PI)]),c.rule,1.5);
   d.dot(cx,cy,3,c.ink);d.dot(cx+scale*zoom*q.x,cy-scale*zoom*q.z,5,c.proton);
   d.text('Same parcel · motion ×40',380,48,c.ink,12);
   d.text('Black point: mean position',380,194,c.muted,11);
   d.text(`Orbit radius ${fixed(amplitude*100,1)} cm`,380,216,c.proton,12);
   d.text(`Crest speed ${fixed(q.speed,2)} m/s`,30,212,c.electron,13);
   d.text('Time runs at 0.4 × physical time.',30,233,c.muted,11);
   lab.say(`Wavelength ${fixed(wavelength,1)} m; crest speed ${fixed(q.speed,2)} m/s. The red parcel stays within ${fixed(amplitude*100,1)} cm of its mean position at the surface. The framed 3D copy and right-hand diagram enlarge that same local displacement 40× in both directions; they do not move a second parcel through the water. Deeper orbits shrink. This small-amplitude model keeps kA ≤ 0.189 and omits Stokes drift and breaking.`);
  };
 }else if(id==='w9-sound'){
  let frequency=300,probe=0;const particles=v.particles(180,c.electron),speaker=v.box(-3.3,0,0,.25,1.4,1.5,c.ink),slice=v.box(0,0,0,.018,1.5,1.5,c.proton,.16),tracked=v.ball(0,0,.55,.085,c.proton),mean=v.ball(0,0,.55,.035,c.ink);lab.kit?.label('speaker',speaker);lab.kit?.label('red air parcel · black mean',()=>[tracked?.position.x??0,.55,.55]);lab.kit?.label('fixed pressure probe',()=>[probe,.85,0]);slider('Sound frequency',100,600,10,frequency,'Hz',x=>frequency=x);slider('Fixed pressure probe',-2,2,.1,probe,'m',x=>probe=x);
  draw=(ctx,W,H)=>{const d=diagramTools(ctx,c),lam=349/frequency,tau=time/300;for(let i=0;i<180;i++){const x=-3+(i%20)*6/19,s=M.soundWave(x,tau,lam,frequency,.065);particles.set(i,s.x,(Math.floor(i/20)%3-1)*.45,(Math.floor(i/60)-1)*.5);}particles.finish();if(slice)slice.position.x=probe;const local=M.soundWave(0,tau,lam,frequency,.065);tracked?.position.set(local.x,0,.55);d.text('Pressure peaks where neighbouring air parcels crowd',24,25);const p=d.plot(x=>M.soundWave(x,tau,lam,frequency,.065).pressureUnit,{min:-3,max:3,ymin:-1.2,ymax:1.2,color:c.electron});d.plot(x=>M.soundWave(x,tau,lam,frequency,.065).displacement/.065,{min:-3,max:3,ymin:-1.2,ymax:1.2,color:c.proton});const q=M.soundWave(probe,tau,lam,frequency,.065);d.dot(p.X(probe),p.Y(q.pressureUnit),5,c.proton);d.text('Blue: relative pressure · red: displacement / its maximum',24,211,c.ink,12);d.text('position (m) →',430,234,c.muted,12);lab.say(`λ = ${fixed(lam,3)} m at 349 m/s. Probe at ${fixed(probe,1)} m: relative pressure ${fixed(q.pressureUnit,2)}. The red air parcel oscillates around the fixed black mean. Red curve: displacement divided by its amplitude; blue curve: pressure relative to its maximum. A parcel at maximum displacement has zero pressure variation; pressure peaks where neighbours crowd. Display time is slowed 300× and displacement is magnified.`);};
 }else if(id==='w9-echo'){
  let distance=50,progress=.5;slider('Distance to wall',10,100,1,distance,'m',x=>distance=x);slider('Round-trip progress',0,1,.01,progress,'',x=>progress=x);
  draw=(ctx,W,H)=>{const d=diagramTools(ctx,c),x=progress<=.5?progress*2:2-progress*2;d.text('Clapper → wall → clapper',24,25);d.line(70,95,570,95,c.rule,2);d.line(570,50,570,165,c.ink,7);d.dot(70+500*x,95,10,c.proton);d.text('You',70,191,c.ink,13,'center');d.text('Reflecting wall',560,191,c.ink,13,'right');d.text(`Elapsed ${fixed(M.echoDelay(distance)*progress,3)} s`,215,220);lab.say(`Wall distance ${distance} m; full echo delay ${fixed(M.echoDelay(distance),3)} s. The pulse travels ${fixed(2*distance*progress,1)} m so far, reaching the wall halfway through the round trip.`);};
 }else if(id==='w9-tone'){
  let frequency=220,amplitude=.3,voice=null;const stop=()=>{voice?.stop();voice=null;};api.onHide(stop);api.onCleanup(stop);slider('Tone frequency',100,800,10,frequency,'Hz',x=>{stop();frequency=x;});slider('Relative amplitude',.05,1,.05,amplitude,'',x=>{stop();amplitude=x;});api.button('Play this tone',()=>{stop();voice=api.audio().tone(frequency,{dur:.8,gain:amplitude*.12});});
  draw=(ctx,W,H)=>{const d=diagramTools(ctx,c);d.text('A fixed 0.020 second time window',24,25);d.plot(x=>amplitude*Math.sin(2*Math.PI*frequency*x),{min:0,max:.02,ymin:-1.1,ymax:1.1});d.text(`Frequency ${frequency} Hz · relative intensity ${fixed(amplitude*amplitude,3)}`,30,211);lab.say(`${frequency} Hz controls pitch; amplitude ${fixed(amplitude,2)} gives relative intensity ${fixed(amplitude**2,3)}. The drawing is synthetic and not a microphone calibration.`);};
 }else if(id==='w9-membrane'){
  let selection=preset.selection??2,load=preset.load??0,voice=null;if(v.root)v.root.rotation.x=.5;const nodal=[v.line([],c.ink),v.line([],c.ink)],rim=v.line(Array.from({length:100},(_,i)=>[1.7*Math.cos(i/99*2*Math.PI),0,1.7*Math.sin(i/99*2*Math.PI)]),c.ink);const surface=v.surface(25,65,(i,j)=>{const r=i/24,a=j/64*2*Math.PI;return[1.7*r*Math.cos(a),0,1.7*r*Math.sin(a)];},c.electron),string=v.line([],c.proton),patch=v.surface(10,41,(i,j)=>{const r=i/9*.34,a=j/40*2*Math.PI;return[1.7*r*Math.cos(a),.02,1.7*r*Math.sin(a)];},c.neutron);const stop=()=>{voice?.stop();voice=null;};api.onHide(stop);api.onCleanup(stop);lab.kit?.label('fixed rim',()=>selection<2?null:[1.7,0,0]);lab.kit?.label('central loading',patch);api.tabs(['String 1','String 2','Drum 0','Drum 1','Drum 2'],i=>{stop();selection=i;lab.refresh();},selection);const loadControl=slider('Central mass loading',0,5,.25,load,'relative',x=>{stop();load=x;});api.button('Hear this calculated mode',()=>{stop();const f=selection<2?110*(selection+1):M.membraneFrequency(selection-2,load);voice=api.audio().tone(f,{dur:1,gain:.12});});
  draw=(ctx,W,H)=>{const d=diagramTools(ctx,c),isString=selection<2,m=Math.max(0,selection-2),freq=isString?110*(selection+1):M.membraneFrequency(m,load),phase=Math.cos(2*Math.PI*time*.65);loadControl.input.disabled=isString;if(surface.visible!==undefined)surface.visible=!isString;if(patch.visible!==undefined)patch.visible=!isString&&load>0;surface.update((i,j)=>{const r=i/24,a=j/64*2*Math.PI;return[1.7*r*Math.cos(a),.45*M.membraneShape(m,r,a)*phase,1.7*r*Math.sin(a)];});patch.update((i,j)=>{const r=i/9*.34,a=j/40*2*Math.PI;return[1.7*r*Math.cos(a),.02+.45*M.membraneShape(m,r,a)*phase,1.7*r*Math.sin(a)];});nodal.forEach((l,j)=>{const a=(Math.PI/2+j*Math.PI)/Math.max(m,1);l.set(!isString&&j<m?[[-1.7*Math.cos(a),0,-1.7*Math.sin(a)],[1.7*Math.cos(a),0,1.7*Math.sin(a)]]:[]);});if(rim.visible!==undefined)rim.visible=!isString;string.set(isString?Array.from({length:100},(_,i)=>[-2+4*i/99,.4*Math.sin((selection+1)*Math.PI*i/99)*phase,0]):[]);d.text(isString?'Fixed string: integer multiples':'Black lines stay still; coloured regions move up and down',24,25);if(isString){d.path(Array.from({length:180},(_,i)=>[40+560*i/179,115-55*Math.sin((selection+1)*Math.PI*i/179)*phase]),c.proton);}else{for(let j=0;j<500;j++){const r=Math.sqrt((j+.5)/500),a=j*2.399,u=M.membraneShape(m,r,a)*phase;d.dot(180+78*r*Math.cos(a),120+78*r*Math.sin(a),2,u>=0?c.proton:c.electron);}for(let j=0;j<m;j++){const a=(Math.PI/2+j*Math.PI)/m;d.line(180-78*Math.cos(a),120-78*Math.sin(a),180+78*Math.cos(a),120+78*Math.sin(a),c.ink,2);}d.path(Array.from({length:97},(_,i)=>[180+78*Math.cos(i/96*2*Math.PI),120+78*Math.sin(i/96*2*Math.PI)]),c.ink,1.5);d.text(`${m} still diameter${m===1?'':'s'} (nodes)`,300,75);d.text('Red: above · blue: below rest plane',300,104,c.muted,11);d.text(`Frequency ${fixed(freq,2)} Hz`,300,134,c.proton,16);d.text(`Central loading ${fixed(load,2)}`,300,159);d.text('Loaded frequencies: Rayleigh estimate',300,189,c.muted,12);}d.text('Visual time is slowed independently; audio uses the stated frequency.',24,226,c.muted,12);lab.say(`${isString?'String harmonic '+(selection+1):`Drum mode with ${m} nodal diameters`}: ${fixed(freq,2)} Hz. ${load>0&&!isString?'Central loading changes the estimated frequency; this is not a fitted tabla.':'A uniform drum’s mode frequencies are not whole-number multiples.'}`);};
 }else if(id==='w9-doppler'){
  let source=22,listener=0,driver=false;slider('Source velocity towards right',-60,60,1,source,'m/s',x=>source=x);const listenerControl=slider('Listener velocity towards right',-60,60,1,listener,'m/s',x=>listener=x);api.tabs(['Platform listener','Driver with horn'],i=>{driver=!!i;lab.refresh();});
  draw=(ctx,W,H)=>{const d=diagramTools(ctx,c),tau=(.14+time*.03)%.6,vl=driver?source:listener,xs=-10+source*tau,xl=driver?xs:15+listener*tau;listenerControl.input.disabled=driver;listenerControl.set(vl);d.text('Wavefront centres stay at their emission positions',24,25);ctx.save();ctx.beginPath();ctx.rect(20,40,600,140);ctx.clip();for(let te=0;te<tau;te+=10/300){const x0=-10+source*te,r=349*(tau-te)*4;ctx.strokeStyle=c.electron;ctx.beginPath();ctx.arc(260+x0*4,110,r,0,2*Math.PI);ctx.stroke();}ctx.restore();d.dot(260+xs*4,110,8,c.proton);d.dot(260+xl*4,110,4,c.ink);d.text(driver?'Horn + driver':'Horn',260+xs*4,195,c.proton,12,'center');if(!driver)d.text('Listener',260+xl*4,195,c.ink,12,'center');const side=driver?1:Math.sign(xl-xs)||1,f=M.doppler(300,side*source,side*vl);d.text(`Emitted 300 Hz · received ${fixed(f,1)} Hz`,30,215);lab.say(`${driver?'Driver':'Moving listener'} hears ${fixed(f,1)} Hz. Source ${source} m/s, listener ${vl} m/s, sound 349 m/s. Drawn rings represent every tenth crest; time is slowed.`);};
 }
 lab.redraw((ctx,W,H)=>{Object.assign(c,api.colors());draw(ctx,W,H);});
}
