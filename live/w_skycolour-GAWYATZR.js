import{a as E}from"./chunk-YVAPA4BS.js";var j=`
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
`;E.register("skycolour",(G,P,i)=>{let R=i.colors(),b=640,z=360,n=10,l=0,h=0,v=[1,.35,0],S=i.readout();function f(e){let t=Math.max(-.04,Math.sin(e*Math.PI/180));return Math.sqrt(750*750*t*t+2*750+1)-750*t}function w(e,a){if(a<=.001)return[1,1,1];let t=f(e),s=.026*a;return[Math.exp(-1*s*t),Math.exp(-3.04*s*t),Math.exp(-5.86*s*t)]}function T(e,a,t){let s=v[l],c=282,u=f(n),d=.026*s,r=[1*d,3.04*d,5.86*d],y=64;for(let m=0;m<y;m++){let x=m/y*c,V=(m+1)/y*c+1,L=Math.max(.005,1-(m+.5)/y),p=f(L*90),M=0,_=0,k=0;if(s>.001){let B=r[0]*(u*.5+p*.5),C=r[1]*(u*.5+p*.5),I=r[2]*(u*.5+p*.5);M=1-Math.exp(-r[0]*p*Math.exp(-B)*2.6),_=1-Math.exp(-r[1]*p*Math.exp(-C)*2.6),k=1-Math.exp(-r[2]*p*Math.exp(-I)*2.6)}e.fillStyle=`rgb(${Math.round(M*255)}, ${Math.round(_*255)}, ${Math.round(k*255)})`,e.fillRect(0,x,a,V-x)}let $=(.36+h)*a,A=c-Math.max(-4,n)/95*245,[D,F,X]=w(n,s);e.fillStyle=`rgb(${Math.round(D*255)}, ${Math.round(F*255)}, ${Math.round(X*255)})`,e.beginPath(),e.arc($,A,15,0,Math.PI*2),e.fill(),e.fillStyle="#121f29",e.fillRect(0,c,a,t-c),e.fillStyle="#141917",e.fillRect(0,322,a,t-322),e.fillStyle="#141c1e",e.strokeStyle=R.rule,e.lineWidth=1,e.fillRect(450,14,176,114),e.strokeRect(450,14,176,114),i.draw.text(e,"air layer drawn far thicker than it is",538,120,{size:9.5,color:"#cfccbf",align:"center"})}let o=i.gl(j,{u_elev:n,u_dens:v[l],u_pan:h},{width:b,height:z,fallback:T,label:"Sky dome over the Mumbai sea wall showing Rayleigh scattering and the colour of the Sun from horizon to noon"});function Y(){if(l===2){S("The Moon (no air): no atmosphere scatters sunlight towards your eye, so the sky is black even at noon and the Sun is white (exposure, tone-mapping and screen RGB are display approximations).");return}let e=f(n),a=f(90),t=e/a,[s,c,u]=w(n,v[l]),d=u<.15?"deep orange-red":u<.45?"warm orange-yellow":"yellowish-white",r=l===1?"thin air":"air";S(`Sun ${n}\xB0 above the horizon: its light crosses ${t.toFixed(1)} times as much ${r} as at noon (computed for a curved Earth; in the corner inset the air layer is drawn far thicker than it is). Blue (450 nm) scatters 5.86\xD7 more than red (700 nm) and green (530 nm) about 3\xD7 more, so direct sunlight looks ${d} while scattered light makes the sky blue (exposure, tone-mapping and screen colours are approximations).`)}function g(){o.set("u_elev",n),o.set("u_dens",v[l]),o.set("u_pan",h),Y()}if(i.slider("Sun height",{min:-2,max:90,step:1,value:n,fmt:e=>`${e}\xB0`,onInput:e=>{n=e,g()}}),i.tabs(["Earth","Thin air","The Moon (no air)"],e=>{l=e,g()}),o.canvas){let e=null;o.canvas.style.cursor="grab",o.canvas.addEventListener("pointerdown",a=>{e=a.clientX,o.canvas.setPointerCapture(a.pointerId)}),o.canvas.addEventListener("pointermove",a=>{if(e==null)return;let t=(a.clientX-e)/b;e=a.clientX,h=Math.max(-.28,Math.min(.28,h+t)),g()}),o.canvas.addEventListener("pointerup",()=>{e=null})}return g(),{destroy(){}}},{label:"Lower the Sun"});
