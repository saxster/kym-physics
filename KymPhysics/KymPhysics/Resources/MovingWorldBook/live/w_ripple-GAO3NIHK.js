import{a as M,b as U}from"./chunk-CFOTGZ3T.js";import{a as H}from"./chunk-YVAPA4BS.js";import"./chunk-WOT6VMZA.js";var j=`
uniform vec4 u_s0;
uniform vec4 u_s1;
uniform vec4 u_s2;
uniform vec4 u_scrap;
uniform float u_mode;
uniform float u_freq;
uniform float u_simT;

float waveOne(vec2 p, vec4 s, float t, float freq) {
  if (s.z < 0.0) return 0.0;
  float r = distance(p, s.xy);
  float c = 30.0; // 30 px/s = 3.0 cm/s
  float f = freq > 0.05 ? freq : 1.5;
  float k = 6.2831853 * f / c;
  float w = 6.2831853 * f;
  float amp = 1.0 / sqrt(max(r, 10.0) / 10.0);
  if (freq > 0.05) {
    float age = max(0.0, t - s.z);
    float front = c * age;
    float env = smoothstep(front + 18.0, front - 6.0, r) * smoothstep(0.0, 6.0, r);
    return amp * env * sin(k * r - w * age);
  } else {
    float age = t - s.z;
    if (age <= 0.0) return 0.0;
    float center = c * age;
    float dr = r - center;
    float packet = exp(-(dr * dr) / (2.0 * 26.0 * 26.0));
    float fade = exp(-0.12 * age);
    return amp * packet * fade * sin(k * dr);
  }
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) * (640.0 / u_res.x);
  float h = 0.0;
  if (u_mode > 0.5) {
    h = waveOne(p, u_s0, u_simT, u_freq > 0.05 ? u_freq : 1.5)
      + waveOne(p, u_s1, u_simT, u_freq > 0.05 ? u_freq : 1.5);
  } else {
    h = waveOne(p, u_s0, u_simT, u_freq)
      + waveOne(p, u_s1, u_simT, 0.0)
      + waveOne(p, u_s2, u_simT, 0.0);
  }
  vec3 base = vec3(0.91, 0.94, 0.95);
  vec3 crest = vec3(0.21, 0.43, 0.52);
  vec3 trough = vec3(0.98, 0.98, 0.96);
  float s = clamp(0.5 + 0.42 * h, 0.0, 1.0);
  vec3 col = mix(trough, crest, s * 0.65);
  col = mix(base, col, clamp(abs(h) * 1.15 + 0.25, 0.0, 1.0));

  // Faint orbital loop around paper scrap rest position
  float dLoop = abs(distance(p, u_scrap.xy) - 7.0);
  if (dLoop < 1.1) col = mix(col, vec3(0.36, 0.42, 0.40), 0.45);

  // Floating paper scrap rectangle at displaced position u_scrap.zw
  vec2 dp = p - u_scrap.zw;
  if (abs(dp.x) < 9.0 && abs(dp.y) < 6.0) {
    col = vec3(0.98, 0.96, 0.88);
    if (abs(dp.x) > 7.6 || abs(dp.y) > 4.6) col = vec3(0.18, 0.25, 0.22);
  }
  gl_FragColor = vec4(col, 1.0);
}
`;H.register("ripple",(X,J,h)=>{let i=h.colors();U(X,"The paper scrap is a local marker: it oscillates near its starting point while the pattern travels outward. Two-source bands are places of reinforcement or cancellation, not streams of travelling water.");let S=640,T=360,x=30,F=3,y=2.4,c=0,g=!1,s=[{x:230,y:180,t0:.2},{x:-100,y:-100,t0:-1},{x:-100,y:-100,t0:-1}],a={x0:410,y0:180,x:410,y:180,dispMm:0};function C(e,r,t,n,p){if(t.t0<0)return{dx:0,dy:0,h:0};let l=e-t.x,f=r-t.y,u=Math.hypot(l,f);if(u<.001)return{dx:0,dy:0,h:0};let v=l/u,_=f/u,o=p>.05?p:1.5,d=2*Math.PI*o/x,z=2*Math.PI*o,D=1/Math.sqrt(Math.max(u,10)/10),P=0,L=0;if(p>.05){let w=Math.max(0,n-t.t0),k=x*w;P=w>0&&u<k+12?Math.min(1,Math.max(0,(k+12-u)/18)):0,L=d*u-z*w}else{let w=n-t.t0;if(w<=0)return{dx:0,dy:0,h:0};let k=u-x*w;P=Math.exp(-(k*k)/1352)*Math.exp(-.12*w),L=d*k}let G=D*P*Math.sin(L),$=7*D*P*Math.sin(L),N=4.5*D*P*Math.cos(L);return{dx:v*$,dy:_*$+N*.35,h:G}}function E(){let e=0,r=0;if(g){let t=c>.05?c:1.5,n=C(a.x0,a.y0,{x:260,y:180,t0:0},y,t),p=C(a.x0,a.y0,{x:380,y:180,t0:0},y,t);e=n.dx+p.dx,r=n.dy+p.dy}else for(let t=0;t<3;t++){let n=C(a.x0,a.y0,s[t],y,t===0?c:0);e+=n.dx,r+=n.dy}a.x=a.x0+e,a.y=a.y0+r,a.dispMm=Math.hypot(e,r)}function Y(e,r,t,n){e.fillStyle=i.plate,e.fillRect(0,0,r,t),e.fillStyle="rgba(53, 109, 131, 0.08)",e.fillRect(0,0,r,t);let p=g?[{x:260,y:180,t0:0,f:c>.05?c:1.5},{x:380,y:180,t0:0,f:c>.05?c:1.5}]:s.filter(l=>l.t0>=0).map((l,f)=>({...l,f:f===0?c:0}));for(let l of p){let f=Math.max(0,y-l.t0),u=l.f>.05?l.f:1.5,v=x/u,_=Math.min(720,x*f+30);for(let o=v*(x*f/v%1);o<_;o+=v){if(o<4)continue;let d=1/Math.sqrt(Math.max(o,10)/10);if(l.f<=.05){let z=o-x*f;d*=Math.exp(-(z*z)/1352)*Math.exp(-.12*f)}d<.03||(e.beginPath(),e.arc(l.x,l.y,o,0,Math.PI*2),e.strokeStyle=i.electron,e.globalAlpha=Math.min(.85,d*.75),e.lineWidth=2.2,e.stroke())}e.globalAlpha=1,e.beginPath(),e.arc(l.x,l.y,3.5,0,Math.PI*2),e.fillStyle=i.proton,e.fill()}g&&(e.save(),e.setLineDash([4,4]),e.strokeStyle=i.muted,e.globalAlpha=.45,e.beginPath(),e.moveTo(320,10),e.lineTo(320,T-10),e.stroke(),e.restore()),e.save(),e.setLineDash([2,2]),e.strokeStyle=i.muted,e.beginPath(),e.arc(a.x0,a.y0,7,0,Math.PI*2),e.stroke(),e.restore(),e.fillStyle=i.sheet,e.strokeStyle=i.ink,e.lineWidth=1.5,h.draw.roundRect(e,a.x-9,a.y-6,18,12,2),e.fill(),e.stroke(),h.draw.text(e,"paper scrap",a.x0,a.y0+20,{size:11,color:i.muted,align:"center"})}E();let m=h.gl(j,{u_s0:[s[0].x,s[0].y,s[0].t0,0],u_s1:[s[1].x,s[1].y,s[1].t0,0],u_s2:[s[2].x,s[2].y,s[2].t0,0],u_scrap:[a.x0,a.y0,a.x,a.y],u_mode:0,u_freq:0,u_simT:y},{width:S,height:T,fallback:Y,label:"Top view of a ripple tank with circular waves and a floating paper scrap"}),I=h.readout();function R(){let e=c>.05?c:1.5,r=(F/e).toFixed(1),t=a.dispMm.toFixed(1),n=`Rings spread at ${F.toFixed(1)} cm/s (slowed to about a tenth of real ripple speed; wave heights are exaggerated, and each ring's height falls as 1/\u221Ar as its energy spreads round a larger circle). The paper scrap is ${t} mm from where it started (it goes round a closed loop and comes back). Dipping faster packs the rings closer: wavelength ${r} cm.`;I(g?`${n} Where the rings cross, their heights add; along the still lines they cancel.`:n)}let O=h.canvas(640,130,"Magnified displacement of the local paper marker about its rest position");function A(){let e=O.ctx;O.clear(i.plate);let r=122,t=62,n=7,p=(a.x-a.x0)*n,l=(a.y-a.y0)*n;e.strokeStyle=i.muted,e.setLineDash([3,4]),e.beginPath(),e.ellipse(r,t,48,24,0,0,2*Math.PI),e.stroke(),e.setLineDash([]),e.beginPath(),e.moveTo(r-6,t),e.lineTo(r+6,t),e.moveTo(r,t-6),e.lineTo(r,t+6),e.stroke(),e.save(),e.translate(r+p,t+l),e.rotate(-.2),e.fillStyle=i.sheet,e.fillRect(-9,-6,18,12),e.strokeStyle=i.ink,e.strokeRect(-9,-6,18,12),e.restore(),M(e,i,"Rest + / paper \u25A1",20,115,{size:12}),M(e,i,"LOCAL MOTION \xD77",20,20,{size:12,weight:600}),M(e,i,`Displacement: ${a.dispMm.toFixed(1)} mm`,270,40,{size:14,weight:600}),M(e,i,"The pattern spreads across the tank.",270,68,{size:13}),M(e,i,"This scrap moves around its rest point.",270,91,{size:13}),M(e,i,"Dashed oval is a motion guide, not a wave crest.",270,115,{size:11,color:i.muted})}function b(){E(),A(),g?(m.set("u_s0",[260,180,0,0]),m.set("u_s1",[380,180,0,0])):(m.set("u_s0",[s[0].x,s[0].y,s[0].t0,0]),m.set("u_s1",[s[1].x,s[1].y,s[1].t0,0]),m.set("u_s2",[s[2].x,s[2].y,s[2].t0,0])),m.set("u_scrap",[a.x0,a.y0,a.x,a.y]),m.set("u_mode",g?1:0),m.set("u_freq",c),m.set("u_simT",y),R()}let q=()=>{},B=m.onCanvasChange(e=>{if(q(),q=()=>{},!e)return;e.style.cursor="pointer",e.style.touchAction="none";let r=0,t=null,n=0,p=null,l=o=>{let d=e.getBoundingClientRect();return{x:(o.clientX-d.left)/(d.width||S)*S,y:(o.clientY-d.top)/(d.height||T)*T}},f=()=>{clearTimeout(n),n=0,t=null;let o=p;p=null;try{o!=null&&e.hasPointerCapture(o)&&e.releasePointerCapture(o)}catch{}},u=o=>{if(p==null){p=o.pointerId,r=performance.now(),t=l(o);try{e.setPointerCapture(p)}catch{}n=setTimeout(()=>{n=0,t&&(a.x0=Math.max(24,Math.min(S-24,t.x)),a.y0=Math.max(24,Math.min(T-24,t.y)),t=null,b())},420)}},v=o=>{o.pointerId===p&&(clearTimeout(n),t&&performance.now()-r<420&&(g=!1,W[0].setAttribute("aria-pressed","true"),W[1].setAttribute("aria-pressed","false"),s.pop(),s.unshift({x:t.x,y:t.y,t0:y-.05}),b()),f())},_=o=>{o.pointerId===p&&f()};e.addEventListener("pointerdown",u),e.addEventListener("pointerup",v),e.addEventListener("pointercancel",_),e.addEventListener("lostpointercapture",_),q=()=>{e.removeEventListener("pointerdown",u),e.removeEventListener("pointerup",v),e.removeEventListener("pointercancel",_),e.removeEventListener("lostpointercapture",_),f()}});h.onCleanup(()=>{B(),q()}),h.slider("Rhythm",{min:0,max:3,step:.5,value:0,fmt:e=>e===0?"Single dip":`${e.toFixed(1)} Hz`,onInput:e=>{c=e,c>0&&s[0].t0<0&&(s[0]={x:230,y:180,t0:0}),b()}});let W=h.tabs(["One finger","Two fingers"],e=>{g=e===1,!g&&s[0].t0<0&&(s[0]={x:230,y:180,t0:y-.5}),b()});return h.loop(e=>{e>0?(y+=e,b()):(E(),A(),R())}),b(),{destroy(){}}},{label:"Dip a finger"});
