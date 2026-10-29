import{a as m,b as A,d as C}from"./chunk-CFOTGZ3T.js";import{a as P}from"./chunk-YVAPA4BS.js";import"./chunk-WOT6VMZA.js";var J=`
uniform float u_elev;    // Sun elevation in degrees (-2 to 90)
uniform float u_dens;    // Atmosphere density (1.0 = Earth, 0.35 = Thin air, 0.0 = Moon)
uniform float u_pan;     // Horizontal pan offset (-0.6 to 0.6)

// Curved-Earth optical airmass: R_E / H_scale \u2248 750, so horizon airmass \u2248 38
float airMass(float sinEl) {
  float k = 750.0;
  float s = max(-0.04, sinEl);
  return sqrt(k * k * s * s + 2.0 * k + 1.0) - k * s;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = vec2(uv.x * 640.0, (1.0 - uv.y) * 360.0);

  // Sea wall and Arabian Sea at the bottom (p.y > 282)
  float horizonY = 282.0;
  float sunAz = 0.36 + u_pan;
  float sunElRad = radians(u_elev);
  float sunY = horizonY - (max(-4.0, u_elev) / 95.0) * 245.0;
  float sunX = sunAz * 640.0;

  // Wavelength scattering ratios (700 nm, 530 nm, 450 nm): (700/lambda)^4 = (1.0, 3.04, 5.86)
  vec3 beta = vec3(1.0, 3.04, 5.86) * 0.026 * u_dens;

  if (p.y < horizonY) {
    // View elevation angle from horizon (0 to 90 deg)
    float vFrac = clamp((horizonY - p.y) / 245.0, 0.005, 1.0);
    float viewSin = sin(vFrac * 1.5707963);
    float mView = airMass(viewSin);
    float mSun = airMass(sin(sunElRad));

    vec3 col = vec3(0.0);
    if (u_dens > 0.001) {
      // Single-scattering integral along the view ray (8 steps)
      float angDist = length(vec2((uv.x - sunAz) * 1.5, (horizonY - p.y - (horizonY - sunY)) / 245.0));
      float phaseR = 0.75 * (1.0 + pow(cos(clamp(angDist, 0.0, 3.14159)), 2.0));
      vec3 accum = vec3(0.0);
      for (int i = 0; i < 8; i++) {
        float f = (float(i) + 0.5) / 8.0;
        // Exponential atmosphere profile along view ray and sun ray at fractional optical depth f
        vec3 tauSun = beta * mSun * exp(-f * 2.2);
        vec3 tauView = beta * mView * f;
        accum += exp(-(tauSun + tauView)) * exp(-f * 2.2) * (mView / 8.0);
      }
      col = beta * phaseR * accum * 1.45;
      // Tone-map exposure
      col = 1.0 - exp(-col * 2.4);
    }

    // Direct Sun disc (transmitted beam exp(-beta * mSun))
    float dSun = distance(p, vec2(sunX, sunY));
    vec3 sunTrans = u_dens > 0.001 ? exp(-beta * mSun) : vec3(1.0);
    if (dSun < 16.0 && p.y < horizonY) {
      float edge = smoothstep(16.0, 12.5, dSun);
      col = mix(col, clamp(sunTrans * 1.15, 0.0, 1.0), edge);
    } else if (dSun < 42.0 && u_dens > 0.001) {
      float glow = exp(-(dSun - 16.0) / 14.0) * 0.35;
      col = clamp(col + sunTrans * glow, 0.0, 1.0);
    }

    // Top-right inset (x: 468..624, y: 14..122): side-view geometry of curved Earth & exaggerated air layer
    if (p.x > 468.0 && p.x < 624.0 && p.y > 14.0 && p.y < 122.0) {
      col = vec3(0.08, 0.11, 0.12);
      vec2 ec = vec2(546.0, 195.0);
      float r = distance(p, ec);
      // Exaggerated atmosphere shell between r = 112 and r = 148
      if (r >= 112.0 && r <= 148.0 && u_dens > 0.001) {
        col = mix(col, vec3(0.22, 0.48, 0.68), 0.45 * clamp(u_dens, 0.3, 1.0));
      }
      if (r < 112.0) {
        col = vec3(0.18, 0.28, 0.24);
      }
      // Observer dot at top of Earth arc (546, 83) and incoming Sun ray at angle u_elev
      vec2 obs = vec2(546.0, 83.0);
      vec2 rayDir = vec2(-cos(sunElRad), -sin(sunElRad));
      vec2 rel = p - obs;
      float proj = dot(rel, rayDir);
      float perp = length(rel - proj * rayDir);
      if (proj > 0.0 && proj < 70.0 && perp < 1.8) {
        col = u_dens > 0.001 ? clamp(sunTrans * 1.2, 0.25, 1.0) : vec3(1.0);
      }
      if (distance(p, obs) < 3.5) col = vec3(0.95, 0.45, 0.32);
      if (p.x < 470.0 || p.x > 622.0 || p.y < 16.0 || p.y > 120.0) col = vec3(0.55, 0.58, 0.54);
    }

    gl_FragColor = vec4(col, 1.0);
    return;
  }

  // Below horizon: Arabian Sea with subtle reflection + Mumbai sea-wall parapet
  vec3 sea = vec3(0.07, 0.12, 0.16);
  if (u_dens > 0.001 && u_elev > -2.0) {
    float mSun = airMass(sin(sunElRad));
    vec3 sunTrans = exp(-beta * mSun);
    float glint = exp(-abs(p.x - sunX) / 28.0) * 0.35;
    sea += sunTrans * glint;
  }
  // Sea wall parapet silhouette at y > 322 with stepped stones
  float wallTop = 324.0 - 5.0 * step(0.5, fract(p.x / 48.0));
  if (p.y > wallTop) {
    sea = vec3(0.08, 0.10, 0.09);
  }
  gl_FragColor = vec4(sea, 1.0);
}
`;P.register("skycolour",(Y,K,l)=>{let o=l.colors();A(Y,"The sky colour is an illustrative RGB, single-scattering model. Direct sunlight travels to the observer; scattered skylight arrives from another direction. The atmosphere and light paths are greatly enlarged.");let x=640,$=360,c=10,u=0,g=0,d=[1,.35,0],M=l.readout();function v(e){let t=Math.max(-.04,Math.sin(e*Math.PI/180));return Math.sqrt(750*750*t*t+2*750+1)-750*t}function k(e,a){if(a<=.001)return[1,1,1];let t=v(e),r=.026*a;return[Math.exp(-1*r*t),Math.exp(-3.04*r*t),Math.exp(-5.86*r*t)]}function D(e,a,t){let r=d[u],s=282,p=v(c),i=.026*r,n=[1*i,3.04*i,5.86*i],h=64;for(let y=0;y<h;y++){let z=y/h*s,j=(y+1)/h*s+1,N=Math.max(.005,1-(y+.5)/h),f=v(N*90),R=0,T=0,L=0;if(r>.001){let H=n[0]*(p*.5+f*.5),q=n[1]*(p*.5+f*.5),O=n[2]*(p*.5+f*.5);R=1-Math.exp(-n[0]*f*Math.exp(-H)*2.6),T=1-Math.exp(-n[1]*f*Math.exp(-q)*2.6),L=1-Math.exp(-n[2]*f*Math.exp(-O)*2.6)}e.fillStyle=`rgb(${Math.round(R*255)}, ${Math.round(T*255)}, ${Math.round(L*255)})`,e.fillRect(0,z,a,j-z)}let X=(.36+g)*a,B=s-Math.max(-4,c)/95*245,[V,G,W]=k(c,r);e.fillStyle=`rgb(${Math.round(V*255)}, ${Math.round(G*255)}, ${Math.round(W*255)})`,e.beginPath(),e.arc(X,B,15,0,Math.PI*2),e.fill(),e.fillStyle="#121f29",e.fillRect(0,s,a,t-s),e.fillStyle="#141917",e.fillRect(0,322,a,t-322),e.fillStyle="#141c1e",e.strokeStyle=o.rule,e.lineWidth=1,e.fillRect(450,14,176,114),e.strokeRect(450,14,176,114),l.draw.text(e,"air layer drawn far thicker than it is",538,120,{size:9.5,color:"#cfccbf",align:"center"})}let b=l.gl(J,{u_elev:c,u_dens:d[u],u_pan:g},{width:x,height:$,fallback:D,label:"Sky dome over the Mumbai sea wall showing Rayleigh scattering and the colour of the Sun from horizon to noon"});function I(){if(u===2){M("The Moon (no air): no atmosphere scatters sunlight towards your eye, so the sky is black even at noon and the Sun is white (exposure, tone-mapping and screen RGB are display approximations).");return}let e=v(c),a=v(90),t=e/a,[r,s,p]=k(c,d[u]),i=p<.15?"deep orange-red":p<.45?"warm orange-yellow":"yellowish-white",n=u===1?"thin air":"air";M(`Sun ${c}\xB0 above the horizon: its light crosses ${t.toFixed(1)} times as much ${n} as at noon (computed for a curved Earth; in the corner inset the air layer is drawn far thicker than it is). Blue (450 nm) scatters 5.86\xD7 more than red (700 nm) and green (530 nm) about 3\xD7 more, so direct sunlight looks ${i} while scattered light makes the sky blue (exposure, tone-mapping and screen colours are approximations).`)}let _=l.canvas(640,160,"Direct sunlight and a separately scattered ray arriving at an eye");function E(){let e=_.ctx;_.clear(o.plate);let a=530,t=118,r=52,s=30;e.fillStyle=o.electron,e.globalAlpha=.07*d[u],e.fillRect(16,15,608,115),e.globalAlpha=1,e.strokeStyle=o.rule,e.beginPath(),e.moveTo(16,130),e.lineTo(624,130),e.stroke(),C(e,o,a,t,.7),e.fillStyle=o.neutron,e.beginPath(),e.arc(r,s,13,0,2*Math.PI),e.fill(),l.draw.arrow(e,r+18,s+4,a-20,t,o.neutron,2.2,7),m(e,o,"Direct sunlight \u2192 eye",275,101,{size:12,color:o.neutron}),d[u]>0?(l.draw.arrow(e,r+18,s,330,43,o.neutron,1.8,6),l.draw.arrow(e,330,43,a-14,t-12,o.electron,2.2,7),e.beginPath(),e.arc(330,43,5,0,2*Math.PI),e.fillStyle=o.electron,e.fill(),m(e,o,"Air molecule scatters light",340,27,{size:12}),m(e,o,"Scattered skylight",380,60,{size:12,color:o.electron})):m(e,o,"No atmosphere \u2192 no scattered skylight",270,45,{size:13,align:"center"}),m(e,o,`Path key \xB7 schematic, not an angle measurement \xB7 Sun ${c}\xB0`,20,151,{size:12,color:o.muted})}l.loop(E);function w(){E(),b.set("u_elev",c),b.set("u_dens",d[u]),b.set("u_pan",g),I()}l.slider("Sun height",{min:-2,max:90,step:1,value:c,fmt:e=>`${e}\xB0`,onInput:e=>{c=e,w()}}),l.tabs(["Earth","Thin air","The Moon (no air)"],e=>{u=e,w()});let S=()=>{},F=b.onCanvasChange(e=>{if(S(),S=()=>{},!e)return;let a=null,t=null;e.style.cursor="grab",e.style.touchAction="pan-y";let r=()=>{a=null;let n=t;t=null;try{n!=null&&e.hasPointerCapture(n)&&e.releasePointerCapture(n)}catch{}},s=n=>{if(t==null){t=n.pointerId,a=n.clientX;try{e.setPointerCapture(t)}catch{}}},p=n=>{if(a==null||n.pointerId!==t)return;let h=(n.clientX-a)/(e.getBoundingClientRect().width||x);a=n.clientX,g=Math.max(-.28,Math.min(.28,g+h)),w()},i=n=>{n.pointerId===t&&r()};e.addEventListener("pointerdown",s),e.addEventListener("pointermove",p),e.addEventListener("pointerup",i),e.addEventListener("pointercancel",i),e.addEventListener("lostpointercapture",i),S=()=>{e.removeEventListener("pointerdown",s),e.removeEventListener("pointermove",p),e.removeEventListener("pointerup",i),e.removeEventListener("pointercancel",i),e.removeEventListener("lostpointercapture",i),r()}});return l.onCleanup(()=>{F(),S()}),w(),{destroy(){}}},{label:"Lower the Sun"});
