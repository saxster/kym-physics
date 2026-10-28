import{a as f,b as $,d as A}from"./chunk-CFOTGZ3T.js";import{a as Y}from"./chunk-YVAPA4BS.js";var q=`
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
`;Y.register("skycolour",(D,O,r)=>{let a=r.colors();$(D,"The sky colour is an illustrative RGB, single-scattering model. Direct sunlight travels to the observer; scattered skylight arrives from another direction. The atmosphere and light paths are greatly enlarged.");let S=640,P=360,s=10,i=0,m=0,h=[1,.35,0],x=r.readout();function v(e){let n=Math.max(-.04,Math.sin(e*Math.PI/180));return Math.sqrt(750*750*n*n+2*750+1)-750*n}function M(e,t){if(t<=.001)return[1,1,1];let n=v(e),o=.026*t;return[Math.exp(-1*o*n),Math.exp(-3.04*o*n),Math.exp(-5.86*o*n)]}function F(e,t,n){let o=h[i],l=282,p=v(s),g=.026*o,u=[1*g,3.04*g,5.86*g],w=64;for(let y=0;y<w;y++){let z=y/w*l,G=(y+1)/w*l+1,j=Math.max(.005,1-(y+.5)/w),d=v(j*90),R=0,E=0,T=0;if(o>.001){let N=u[0]*(p*.5+d*.5),W=u[1]*(p*.5+d*.5),H=u[2]*(p*.5+d*.5);R=1-Math.exp(-u[0]*d*Math.exp(-N)*2.6),E=1-Math.exp(-u[1]*d*Math.exp(-W)*2.6),T=1-Math.exp(-u[2]*d*Math.exp(-H)*2.6)}e.fillStyle=`rgb(${Math.round(R*255)}, ${Math.round(E*255)}, ${Math.round(T*255)})`,e.fillRect(0,z,t,G-z)}let I=(.36+m)*t,V=l-Math.max(-4,s)/95*245,[B,L,C]=M(s,o);e.fillStyle=`rgb(${Math.round(B*255)}, ${Math.round(L*255)}, ${Math.round(C*255)})`,e.beginPath(),e.arc(I,V,15,0,Math.PI*2),e.fill(),e.fillStyle="#121f29",e.fillRect(0,l,t,n-l),e.fillStyle="#141917",e.fillRect(0,322,t,n-322),e.fillStyle="#141c1e",e.strokeStyle=a.rule,e.lineWidth=1,e.fillRect(450,14,176,114),e.strokeRect(450,14,176,114),r.draw.text(e,"air layer drawn far thicker than it is",538,120,{size:9.5,color:"#cfccbf",align:"center"})}let c=r.gl(q,{u_elev:s,u_dens:h[i],u_pan:m},{width:S,height:P,fallback:F,label:"Sky dome over the Mumbai sea wall showing Rayleigh scattering and the colour of the Sun from horizon to noon"});function X(){if(i===2){x("The Moon (no air): no atmosphere scatters sunlight towards your eye, so the sky is black even at noon and the Sun is white (exposure, tone-mapping and screen RGB are display approximations).");return}let e=v(s),t=v(90),n=e/t,[o,l,p]=M(s,h[i]),g=p<.15?"deep orange-red":p<.45?"warm orange-yellow":"yellowish-white",u=i===1?"thin air":"air";x(`Sun ${s}\xB0 above the horizon: its light crosses ${n.toFixed(1)} times as much ${u} as at noon (computed for a curved Earth; in the corner inset the air layer is drawn far thicker than it is). Blue (450 nm) scatters 5.86\xD7 more than red (700 nm) and green (530 nm) about 3\xD7 more, so direct sunlight looks ${g} while scattered light makes the sky blue (exposure, tone-mapping and screen colours are approximations).`)}let k=r.canvas(640,160,"Direct sunlight and a separately scattered ray arriving at an eye");function _(){let e=k.ctx;k.clear(a.plate);let t=530,n=118,o=52,l=30;e.fillStyle=a.electron,e.globalAlpha=.07*h[i],e.fillRect(16,15,608,115),e.globalAlpha=1,e.strokeStyle=a.rule,e.beginPath(),e.moveTo(16,130),e.lineTo(624,130),e.stroke(),A(e,a,t,n,.7),e.fillStyle=a.neutron,e.beginPath(),e.arc(o,l,13,0,2*Math.PI),e.fill(),r.draw.arrow(e,o+18,l+4,t-20,n,a.neutron,2.2,7),f(e,a,"Direct sunlight \u2192 eye",275,101,{size:12,color:a.neutron}),h[i]>0?(r.draw.arrow(e,o+18,l,330,43,a.neutron,1.8,6),r.draw.arrow(e,330,43,t-14,n-12,a.electron,2.2,7),e.beginPath(),e.arc(330,43,5,0,2*Math.PI),e.fillStyle=a.electron,e.fill(),f(e,a,"Air molecule scatters light",340,27,{size:12}),f(e,a,"Scattered skylight",380,60,{size:12,color:a.electron})):f(e,a,"No atmosphere \u2192 no scattered skylight",270,45,{size:13,align:"center"}),f(e,a,`Path key \xB7 schematic, not an angle measurement \xB7 Sun ${s}\xB0`,20,151,{size:12,color:a.muted})}r.loop(_);function b(){_(),c.set("u_elev",s),c.set("u_dens",h[i]),c.set("u_pan",m),X()}if(r.slider("Sun height",{min:-2,max:90,step:1,value:s,fmt:e=>`${e}\xB0`,onInput:e=>{s=e,b()}}),r.tabs(["Earth","Thin air","The Moon (no air)"],e=>{i=e,b()}),c.canvas){let e=null;c.canvas.style.cursor="grab",c.canvas.addEventListener("pointerdown",t=>{e=t.clientX,c.canvas.setPointerCapture(t.pointerId)}),c.canvas.addEventListener("pointermove",t=>{if(e==null)return;let n=(t.clientX-e)/S;e=t.clientX,m=Math.max(-.28,Math.min(.28,m+n)),b()}),c.canvas.addEventListener("pointerup",()=>{e=null})}return b(),{destroy(){}}},{label:"Lower the Sun"});
