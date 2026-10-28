import{a as x,b as U}from"./chunk-CFOTGZ3T.js";import{a as H}from"./chunk-YVAPA4BS.js";var N=`
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
`;H.register("ripple",(X,j,u)=>{let n=u.colors();U(X,"The paper scrap is a local marker: it oscillates near its starting point while the pattern travels outward. Two-source bands are places of reinforcement or cancellation, not streams of travelling water.");let q=640,b=360,g=30,O=3,d=2.4,c=0,m=!1,o=[{x:230,y:180,t0:.2},{x:-100,y:-100,t0:-1},{x:-100,y:-100,t0:-1}],t={x0:410,y0:180,x:410,y:180,dispMm:0};function D(e,s,a,i,l){if(a.t0<0)return{dx:0,dy:0,h:0};let r=e-a.x,h=s-a.y,p=Math.hypot(r,h);if(p<.001)return{dx:0,dy:0,h:0};let T=r/p,L=h/p,y=l>.05?l:1.5,w=2*Math.PI*y/g,z=2*Math.PI*y,R=1/Math.sqrt(Math.max(p,10)/10),S=0,P=0;if(l>.05){let v=Math.max(0,i-a.t0),M=g*v;S=v>0&&p<M+12?Math.min(1,Math.max(0,(M+12-p)/18)):0,P=w*p-z*v}else{let v=i-a.t0;if(v<=0)return{dx:0,dy:0,h:0};let M=p-g*v;S=Math.exp(-(M*M)/1352)*Math.exp(-.12*v),P=w*M}let B=R*S*Math.sin(P),W=7*R*S*Math.sin(P),G=4.5*R*S*Math.cos(P);return{dx:T*W,dy:L*W+G*.35,h:B}}function F(){let e=0,s=0;if(m){let a=c>.05?c:1.5,i=D(t.x0,t.y0,{x:260,y:180,t0:0},d,a),l=D(t.x0,t.y0,{x:380,y:180,t0:0},d,a);e=i.dx+l.dx,s=i.dy+l.dy}else for(let a=0;a<3;a++){let i=D(t.x0,t.y0,o[a],d,a===0?c:0);e+=i.dx,s+=i.dy}t.x=t.x0+e,t.y=t.y0+s,t.dispMm=Math.hypot(e,s)}function Y(e,s,a,i){e.fillStyle=n.plate,e.fillRect(0,0,s,a),e.fillStyle="rgba(53, 109, 131, 0.08)",e.fillRect(0,0,s,a);let l=m?[{x:260,y:180,t0:0,f:c>.05?c:1.5},{x:380,y:180,t0:0,f:c>.05?c:1.5}]:o.filter(r=>r.t0>=0).map((r,h)=>({...r,f:h===0?c:0}));for(let r of l){let h=Math.max(0,d-r.t0),p=r.f>.05?r.f:1.5,T=g/p,L=Math.min(720,g*h+30);for(let y=T*(g*h/T%1);y<L;y+=T){if(y<4)continue;let w=1/Math.sqrt(Math.max(y,10)/10);if(r.f<=.05){let z=y-g*h;w*=Math.exp(-(z*z)/1352)*Math.exp(-.12*h)}w<.03||(e.beginPath(),e.arc(r.x,r.y,y,0,Math.PI*2),e.strokeStyle=n.electron,e.globalAlpha=Math.min(.85,w*.75),e.lineWidth=2.2,e.stroke())}e.globalAlpha=1,e.beginPath(),e.arc(r.x,r.y,3.5,0,Math.PI*2),e.fillStyle=n.proton,e.fill()}m&&(e.save(),e.setLineDash([4,4]),e.strokeStyle=n.muted,e.globalAlpha=.45,e.beginPath(),e.moveTo(320,10),e.lineTo(320,b-10),e.stroke(),e.restore()),e.save(),e.setLineDash([2,2]),e.strokeStyle=n.muted,e.beginPath(),e.arc(t.x0,t.y0,7,0,Math.PI*2),e.stroke(),e.restore(),e.fillStyle=n.sheet,e.strokeStyle=n.ink,e.lineWidth=1.5,u.draw.roundRect(e,t.x-9,t.y-6,18,12,2),e.fill(),e.stroke(),u.draw.text(e,"paper scrap",t.x0,t.y0+20,{size:11,color:n.muted,align:"center"})}F();let f=u.gl(N,{u_s0:[o[0].x,o[0].y,o[0].t0,0],u_s1:[o[1].x,o[1].y,o[1].t0,0],u_s2:[o[2].x,o[2].y,o[2].t0,0],u_scrap:[t.x0,t.y0,t.x,t.y],u_mode:0,u_freq:0,u_simT:d},{width:q,height:b,fallback:Y,label:"Top view of a ripple tank with circular waves and a floating paper scrap"}),I=u.readout();function A(){let e=c>.05?c:1.5,s=(O/e).toFixed(1),a=t.dispMm.toFixed(1),i=`Rings spread at ${O.toFixed(1)} cm/s (slowed to about a tenth of real ripple speed; wave heights are exaggerated, and each ring's height falls as 1/\u221Ar as its energy spreads round a larger circle). The paper scrap is ${a} mm from where it started (it goes round a closed loop and comes back). Dipping faster packs the rings closer: wavelength ${s} cm.`;I(m?`${i} Where the rings cross, their heights add; along the still lines they cancel.`:i)}let E=u.canvas(640,130,"Magnified displacement of the local paper marker about its rest position");function C(){let e=E.ctx;E.clear(n.plate);let s=122,a=62,i=7,l=(t.x-t.x0)*i,r=(t.y-t.y0)*i;e.strokeStyle=n.muted,e.setLineDash([3,4]),e.beginPath(),e.ellipse(s,a,48,24,0,0,2*Math.PI),e.stroke(),e.setLineDash([]),e.beginPath(),e.moveTo(s-6,a),e.lineTo(s+6,a),e.moveTo(s,a-6),e.lineTo(s,a+6),e.stroke(),e.save(),e.translate(s+l,a+r),e.rotate(-.2),e.fillStyle=n.sheet,e.fillRect(-9,-6,18,12),e.strokeStyle=n.ink,e.strokeRect(-9,-6,18,12),e.restore(),x(e,n,"Rest + / paper \u25A1",20,115,{size:12}),x(e,n,"LOCAL MOTION \xD77",20,20,{size:12,weight:600}),x(e,n,`Displacement: ${t.dispMm.toFixed(1)} mm`,270,40,{size:14,weight:600}),x(e,n,"The pattern spreads across the tank.",270,68,{size:13}),x(e,n,"This scrap moves around its rest point.",270,91,{size:13}),x(e,n,"Dashed oval is a motion guide, not a wave crest.",270,115,{size:11,color:n.muted})}function _(){F(),C(),m?(f.set("u_s0",[260,180,0,0]),f.set("u_s1",[380,180,0,0])):(f.set("u_s0",[o[0].x,o[0].y,o[0].t0,0]),f.set("u_s1",[o[1].x,o[1].y,o[1].t0,0]),f.set("u_s2",[o[2].x,o[2].y,o[2].t0,0])),f.set("u_scrap",[t.x0,t.y0,t.x,t.y]),f.set("u_mode",m?1:0),f.set("u_freq",c),f.set("u_simT",d),A()}let k=f.canvas;if(k){k.style.cursor="pointer";let e=0,s=null,a=0,i=l=>{let r=k.getBoundingClientRect();return{x:(l.clientX-r.left)/(r.width||q)*q,y:(l.clientY-r.top)/(r.height||b)*b}};k.addEventListener("pointerdown",l=>{e=performance.now(),s=i(l),clearTimeout(a),a=setTimeout(()=>{s&&(t.x0=Math.max(24,Math.min(q-24,s.x)),t.y0=Math.max(24,Math.min(b-24,s.y)),s=null,_())},420)}),k.addEventListener("pointerup",()=>{clearTimeout(a),s&&performance.now()-e<420&&(m=!1,$[0].setAttribute("aria-pressed","true"),$[1].setAttribute("aria-pressed","false"),o.pop(),o.unshift({x:s.x,y:s.y,t0:d-.05}),_()),s=null})}u.slider("Rhythm",{min:0,max:3,step:.5,value:0,fmt:e=>e===0?"Single dip":`${e.toFixed(1)} Hz`,onInput:e=>{c=e,c>0&&o[0].t0<0&&(o[0]={x:230,y:180,t0:0}),_()}});let $=u.tabs(["One finger","Two fingers"],e=>{m=e===1,!m&&o[0].t0<0&&(o[0]={x:230,y:180,t0:d-.5}),_()});return u.loop(e=>{e>0?(d+=e,_()):(F(),C(),A())}),_(),{destroy(){}}},{label:"Dip a finger"});
