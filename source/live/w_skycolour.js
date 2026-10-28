// 11.3 Rayleigh sky dome from a Mumbai sea wall: 1/lambda^4 scattering (700, 530, 450 nm) on a curved Earth.
import { Live } from './core.js';
import { note, label, eye } from './art_waves.js';

const FRAG = `
uniform float u_elev;    // Sun elevation in degrees (-2 to 90)
uniform float u_dens;    // Atmosphere density (1.0 = Earth, 0.35 = Thin air, 0.0 = Moon)
uniform float u_pan;     // Horizontal pan offset (-0.6 to 0.6)

// Curved-Earth optical airmass: R_E / H_scale ≈ 750, so horizon airmass ≈ 38
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
`;

Live.register('skycolour', (stage, params, api) => {
  const c = api.colors();
  note(stage,'The sky colour is an illustrative RGB, single-scattering model. Direct sunlight travels to the observer; scattered skylight arrives from another direction. The atmosphere and light paths are greatly enlarged.');
  const W = 640, H = 360;

  let elev = 10;    // degrees (-2 to 90), default 10 deg
  let tabIdx = 0;   // 0 = Earth (dens 1.0), 1 = Thin air (dens 0.35), 2 = The Moon (dens 0.0)
  let pan = 0;

  const DENS = [1.0, 0.35, 0.0];
  const say = api.readout();

  function curvedAirMass(deg) {
    const k = 750;
    const s = Math.max(-0.04, Math.sin((deg * Math.PI) / 180));
    return Math.sqrt(k * k * s * s + 2 * k + 1) - k * s;
  }

  function directSunRGB(deg, dens) {
    if (dens <= 0.001) return [1, 1, 1];
    const m = curvedAirMass(deg);
    const b0 = 0.026 * dens;
    return [
      Math.exp(-1.0 * b0 * m),
      Math.exp(-3.04 * b0 * m),
      Math.exp(-5.86 * b0 * m),
    ];
  }

  function fallback2D(ctx, width, height) {
    const dens = DENS[tabIdx];
    const horizonY = 282;
    const mSun = curvedAirMass(elev);
    const b0 = 0.026 * dens;
    const beta = [1.0 * b0, 3.04 * b0, 5.86 * b0];

    // 64-sample vertical gradient using the same curved-Earth single-scattering model
    const steps = 64;
    for (let i = 0; i < steps; i++) {
      const y0 = (i / steps) * horizonY;
      const y1 = ((i + 1) / steps) * horizonY + 1;
      const vFrac = Math.max(0.005, 1 - (i + 0.5) / steps);
      const mView = curvedAirMass((vFrac * 90));
      let r = 0, g = 0, b = 0;
      if (dens > 0.001) {
        const tauR = beta[0] * (mSun * 0.5 + mView * 0.5);
        const tauG = beta[1] * (mSun * 0.5 + mView * 0.5);
        const tauB = beta[2] * (mSun * 0.5 + mView * 0.5);
        r = 1 - Math.exp(-beta[0] * mView * Math.exp(-tauR) * 2.6);
        g = 1 - Math.exp(-beta[1] * mView * Math.exp(-tauG) * 2.6);
        b = 1 - Math.exp(-beta[2] * mView * Math.exp(-tauB) * 2.6);
      }
      ctx.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      ctx.fillRect(0, y0, width, y1 - y0);
    }

    // Sun disc
    const sunX = (0.36 + pan) * width;
    const sunY = horizonY - (Math.max(-4, elev) / 95) * 245;
    const [sr, sg, sb] = directSunRGB(elev, dens);
    ctx.fillStyle = `rgb(${Math.round(sr * 255)}, ${Math.round(sg * 255)}, ${Math.round(sb * 255)})`;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Sea and Mumbai sea wall
    ctx.fillStyle = '#121f29';
    ctx.fillRect(0, horizonY, width, height - horizonY);
    ctx.fillStyle = '#141917';
    ctx.fillRect(0, 322, width, height - 322);

    // Side-view inset at top right
    ctx.fillStyle = '#141c1e';
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    ctx.fillRect(450, 14, 176, 114);
    ctx.strokeRect(450, 14, 176, 114);
    api.draw.text(ctx, 'air layer drawn far thicker than it is', 538, 120, {
      size: 9.5, color: '#cfccbf', align: 'center',
    });
  }

  const gl = api.gl(FRAG, {
    u_elev: elev,
    u_dens: DENS[tabIdx],
    u_pan: pan,
  }, {
    width: W,
    height: H,
    fallback: fallback2D,
    label: 'Sky dome over the Mumbai sea wall showing Rayleigh scattering and the colour of the Sun from horizon to noon',
  });

  function updateReadout() {
    if (tabIdx === 2) {
      say(
        'The Moon (no air): no atmosphere scatters sunlight towards your eye, so the sky is black even at noon and the Sun is white ' +
        '(exposure, tone-mapping and screen RGB are display approximations).'
      );
      return;
    }
    const mNow = curvedAirMass(elev);
    const mNoon = curvedAirMass(90);
    const ratio = mNow / mNoon;
    const [sr, sg, sb] = directSunRGB(elev, DENS[tabIdx]);
    const sunWord = sb < 0.15 ? 'deep orange-red' : sb < 0.45 ? 'warm orange-yellow' : 'yellowish-white';
    const airLabel = tabIdx === 1 ? 'thin air' : 'air';
    say(
      `Sun ${elev}° above the horizon: its light crosses ${ratio.toFixed(1)} times as much ${airLabel} as at noon ` +
      `(computed for a curved Earth; in the corner inset the air layer is drawn far thicker than it is). ` +
      `Blue (450 nm) scatters 5.86× more than red (700 nm) and green (530 nm) about 3× more, so direct sunlight looks ${sunWord} ` +
      `while scattered light makes the sky blue (exposure, tone-mapping and screen colours are approximations).`
    );
  }

  const path=api.canvas(640,160,'Direct sunlight and a separately scattered ray arriving at an eye');
  function drawPaths(){
    const ctx=path.ctx;path.clear(c.plate);const ox=530,oy=118,sx=52,sy=30;
    ctx.fillStyle=c.electron;ctx.globalAlpha=.07*DENS[tabIdx];ctx.fillRect(16,15,608,115);ctx.globalAlpha=1;
    ctx.strokeStyle=c.rule;ctx.beginPath();ctx.moveTo(16,130);ctx.lineTo(624,130);ctx.stroke();
    eye(ctx,c,ox,oy,.7);ctx.fillStyle=c.neutron;ctx.beginPath();ctx.arc(sx,sy,13,0,2*Math.PI);ctx.fill();
    api.draw.arrow(ctx,sx+18,sy+4,ox-20,oy,c.neutron,2.2,7);label(ctx,c,'Direct sunlight → eye',275,101,{size:12,color:c.neutron});
    if(DENS[tabIdx]>0){
      api.draw.arrow(ctx,sx+18,sy,330,43,c.neutron,1.8,6);api.draw.arrow(ctx,330,43,ox-14,oy-12,c.electron,2.2,7);
      ctx.beginPath();ctx.arc(330,43,5,0,2*Math.PI);ctx.fillStyle=c.electron;ctx.fill();label(ctx,c,'Air molecule scatters light',340,27,{size:12});
      label(ctx,c,'Scattered skylight',380,60,{size:12,color:c.electron});
    }else label(ctx,c,'No atmosphere → no scattered skylight',270,45,{size:13,align:'center'});
    label(ctx,c,`Path key · schematic, not an angle measurement · Sun ${elev}°`,20,151,{size:12,color:c.muted});
  }
  api.loop(drawPaths);
  function sync() {
    drawPaths();
    gl.set('u_elev', elev);
    gl.set('u_dens', DENS[tabIdx]);
    gl.set('u_pan', pan);
    updateReadout();
  }

  // Control 1: Sun height slider (-2° to 90°)
  api.slider('Sun height', {
    min: -2, max: 90, step: 1, value: elev,
    fmt: (v) => `${v}°`,
    onInput: (v) => {
      elev = v;
      sync();
    },
  });

  // Control 2: Tabs Earth · Thin air · The Moon (no air)
  api.tabs(['Earth', 'Thin air', 'The Moon (no air)'], (i) => {
    tabIdx = i;
    sync();
  });

  // Control 3: Drag on the sky dome to look around horizontally
  if (gl.canvas) {
    let dragX = null;
    gl.canvas.style.cursor = 'grab';
    gl.canvas.addEventListener('pointerdown', (e) => {
      dragX = e.clientX;
      gl.canvas.setPointerCapture(e.pointerId);
    });
    gl.canvas.addEventListener('pointermove', (e) => {
      if (dragX == null) return;
      const dx = (e.clientX - dragX) / W;
      dragX = e.clientX;
      pan = Math.max(-0.28, Math.min(0.28, pan + dx));
      sync();
    });
    gl.canvas.addEventListener('pointerup', () => { dragX = null; });
  }

  sync();
  return { destroy() {} };
}, { label: 'Lower the Sun' });
