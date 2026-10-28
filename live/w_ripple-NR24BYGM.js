import{a as C}from"./chunk-YVAPA4BS.js";var U=`
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
`;C.register("ripple",(X,Y,m)=>{let y=m.colors(),q=640,b=360,g=30,z=3,p=2.4,i=0,u=!1,a=[{x:230,y:180,t0:.2},{x:-100,y:-100,t0:-1},{x:-100,y:-100,t0:-1}],t={x0:410,y0:180,x:410,y:180,dispMm:0};function F(e,o,s,n,l){if(s.t0<0)return{dx:0,dy:0,h:0};let r=e-s.x,d=o-s.y,c=Math.hypot(r,d);if(c<.001)return{dx:0,dy:0,h:0};let k=r/c,D=d/c,h=l>.05?l:1.5,x=2*Math.PI*h/g,P=2*Math.PI*h,L=1/Math.sqrt(Math.max(c,10)/10),T=0,S=0;if(l>.05){let _=Math.max(0,n-s.t0),M=g*_;T=_>0&&c<M+12?Math.min(1,Math.max(0,(M+12-c)/18)):0,S=x*c-P*_}else{let _=n-s.t0;if(_<=0)return{dx:0,dy:0,h:0};let M=c-g*_;T=Math.exp(-(M*M)/1352)*Math.exp(-.12*_),S=x*M}let $=L*T*Math.sin(S),I=7*L*T*Math.sin(S),H=4.5*L*T*Math.cos(S);return{dx:k*I,dy:D*I+H*.35,h:$}}function R(){let e=0,o=0;if(u){let s=i>.05?i:1.5,n=F(t.x0,t.y0,{x:260,y:180,t0:0},p,s),l=F(t.x0,t.y0,{x:380,y:180,t0:0},p,s);e=n.dx+l.dx,o=n.dy+l.dy}else for(let s=0;s<3;s++){let n=F(t.x0,t.y0,a[s],p,s===0?i:0);e+=n.dx,o+=n.dy}t.x=t.x0+e,t.y=t.y0+o,t.dispMm=Math.hypot(e,o)}function W(e,o,s,n){e.fillStyle=y.plate,e.fillRect(0,0,o,s),e.fillStyle="rgba(53, 109, 131, 0.08)",e.fillRect(0,0,o,s);let l=u?[{x:260,y:180,t0:0,f:i>.05?i:1.5},{x:380,y:180,t0:0,f:i>.05?i:1.5}]:a.filter(r=>r.t0>=0).map((r,d)=>({...r,f:d===0?i:0}));for(let r of l){let d=Math.max(0,p-r.t0),c=r.f>.05?r.f:1.5,k=g/c,D=Math.min(720,g*d+30);for(let h=k*(g*d/k%1);h<D;h+=k){if(h<4)continue;let x=1/Math.sqrt(Math.max(h,10)/10);if(r.f<=.05){let P=h-g*d;x*=Math.exp(-(P*P)/1352)*Math.exp(-.12*d)}x<.03||(e.beginPath(),e.arc(r.x,r.y,h,0,Math.PI*2),e.strokeStyle=y.electron,e.globalAlpha=Math.min(.85,x*.75),e.lineWidth=2.2,e.stroke())}e.globalAlpha=1,e.beginPath(),e.arc(r.x,r.y,3.5,0,Math.PI*2),e.fillStyle=y.proton,e.fill()}u&&(e.save(),e.setLineDash([4,4]),e.strokeStyle=y.muted,e.globalAlpha=.45,e.beginPath(),e.moveTo(320,10),e.lineTo(320,b-10),e.stroke(),e.restore()),e.save(),e.setLineDash([2,2]),e.strokeStyle=y.muted,e.beginPath(),e.arc(t.x0,t.y0,7,0,Math.PI*2),e.stroke(),e.restore(),e.fillStyle=y.sheet,e.strokeStyle=y.ink,e.lineWidth=1.5,m.draw.roundRect(e,t.x-9,t.y-6,18,12,2),e.fill(),e.stroke(),m.draw.text(e,"paper scrap",t.x0,t.y0+20,{size:11,color:y.muted,align:"center"})}R();let f=m.gl(U,{u_s0:[a[0].x,a[0].y,a[0].t0,0],u_s1:[a[1].x,a[1].y,a[1].t0,0],u_s2:[a[2].x,a[2].y,a[2].t0,0],u_scrap:[t.x0,t.y0,t.x,t.y],u_mode:0,u_freq:0,u_simT:p},{width:q,height:b,fallback:W,label:"Top view of a ripple tank with circular waves and a floating paper scrap"}),E=m.readout();function O(){let e=i>.05?i:1.5,o=(z/e).toFixed(1),s=t.dispMm.toFixed(1),n=`Rings spread at ${z.toFixed(1)} cm/s (slowed to about a tenth of real ripple speed; wave heights are exaggerated, and each ring's height falls as 1/\u221Ar as its energy spreads round a larger circle). The paper scrap is ${s} mm from where it started (it goes round a closed loop and comes back). Dipping faster packs the rings closer: wavelength ${o} cm.`;E(u?`${n} Where the rings cross, their heights add; along the still lines they cancel.`:n)}function v(){R(),u?(f.set("u_s0",[260,180,0,0]),f.set("u_s1",[380,180,0,0])):(f.set("u_s0",[a[0].x,a[0].y,a[0].t0,0]),f.set("u_s1",[a[1].x,a[1].y,a[1].t0,0]),f.set("u_s2",[a[2].x,a[2].y,a[2].t0,0])),f.set("u_scrap",[t.x0,t.y0,t.x,t.y]),f.set("u_mode",u?1:0),f.set("u_freq",i),f.set("u_simT",p),O()}let w=f.canvas;if(w){w.style.cursor="pointer";let e=0,o=null,s=0,n=l=>{let r=w.getBoundingClientRect();return{x:(l.clientX-r.left)/(r.width||q)*q,y:(l.clientY-r.top)/(r.height||b)*b}};w.addEventListener("pointerdown",l=>{e=performance.now(),o=n(l),clearTimeout(s),s=setTimeout(()=>{o&&(t.x0=Math.max(24,Math.min(q-24,o.x)),t.y0=Math.max(24,Math.min(b-24,o.y)),o=null,v())},420)}),w.addEventListener("pointerup",()=>{clearTimeout(s),o&&performance.now()-e<420&&(u=!1,A[0].setAttribute("aria-pressed","true"),A[1].setAttribute("aria-pressed","false"),a.pop(),a.unshift({x:o.x,y:o.y,t0:p-.05}),v()),o=null})}m.slider("Rhythm",{min:0,max:3,step:.5,value:0,fmt:e=>e===0?"Single dip":`${e.toFixed(1)} Hz`,onInput:e=>{i=e,i>0&&a[0].t0<0&&(a[0]={x:230,y:180,t0:0}),v()}});let A=m.tabs(["One finger","Two fingers"],e=>{u=e===1,!u&&a[0].t0<0&&(a[0]={x:230,y:180,t0:p-.5}),v()});return m.loop(e=>{e>0?(p+=e,v()):(R(),O())}),v(),{destroy(){}}},{label:"Dip a finger"});
