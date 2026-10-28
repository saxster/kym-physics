// 9.3 Ripple tank: disturbance travels, water (and floating paper scrap) moves in a closed loop and stays put.
// Amplitude falls as 1/sqrt(r); two sources superpose by plain addition.
import { Live } from './core.js';
import { note, label } from './art_waves.js';

const FRAG = `
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
`;

Live.register('ripple', (stage, params, api) => {
  const c = api.colors();
  note(stage,'The paper scrap is a local marker: it oscillates near its starting point while the pattern travels outward. Two-source bands are places of reinforcement or cancellation, not streams of travelling water.');
  const W = 640, H = 360;
  const SPEED_PX = 30; // 30 px/s = 3.0 cm/s (10 px = 1 cm)
  const SPEED_CM = 3.0;
  let simT = 2.4;
  let rhythm = 0; // Hz (0 = single dips)
  let twoFingers = false;

  // Up to 3 sources: { x, y, t0 }
  const sources = [
    { x: 230, y: 180, t0: 0.2 },
    { x: -100, y: -100, t0: -1 },
    { x: -100, y: -100, t0: -1 },
  ];
  const scrap = { x0: 410, y0: 180, x: 410, y: 180, dispMm: 0 };

  function evalWaveDisp(px, py, src, t, freq) {
    if (src.t0 < 0) return { dx: 0, dy: 0, h: 0 };
    const rx = px - src.x, ry = py - src.y;
    const r = Math.hypot(rx, ry);
    if (r < 1e-3) return { dx: 0, dy: 0, h: 0 };
    const ux = rx / r, uy = ry / r;
    const f = freq > 0.05 ? freq : 1.5;
    const k = (2 * Math.PI * f) / SPEED_PX;
    const w = 2 * Math.PI * f;
    const amp = 1 / Math.sqrt(Math.max(r, 10) / 10);
    let env = 0, phase = 0;
    if (freq > 0.05) {
      const age = Math.max(0, t - src.t0);
      const front = SPEED_PX * age;
      env = age > 0 && r < front + 12 ? Math.min(1, Math.max(0, (front + 12 - r) / 18)) : 0;
      phase = k * r - w * age;
    } else {
      const age = t - src.t0;
      if (age <= 0) return { dx: 0, dy: 0, h: 0 };
      const dr = r - SPEED_PX * age;
      env = Math.exp(-(dr * dr) / (2 * 26 * 26)) * Math.exp(-0.12 * age);
      phase = k * dr;
    }
    const h = amp * env * Math.sin(phase);
    const radial = 7.0 * amp * env * Math.sin(phase);
    const loopY = 4.5 * amp * env * Math.cos(phase);
    return { dx: ux * radial, dy: uy * radial + loopY * 0.35, h };
  }

  function updateScrap() {
    let dx = 0, dy = 0;
    if (twoFingers) {
      const f = rhythm > 0.05 ? rhythm : 1.5;
      const a = evalWaveDisp(scrap.x0, scrap.y0, { x: 260, y: 180, t0: 0 }, simT, f);
      const b = evalWaveDisp(scrap.x0, scrap.y0, { x: 380, y: 180, t0: 0 }, simT, f);
      dx = a.dx + b.dx;
      dy = a.dy + b.dy;
    } else {
      for (let i = 0; i < 3; i++) {
        const w = evalWaveDisp(scrap.x0, scrap.y0, sources[i], simT, i === 0 ? rhythm : 0);
        dx += w.dx;
        dy += w.dy;
      }
    }
    scrap.x = scrap.x0 + dx;
    scrap.y = scrap.y0 + dy;
    scrap.dispMm = Math.hypot(dx, dy); // 10 px = 1 cm => 1 px = 1 mm
  }

  function fallback2D(ctx, width, height, U) {
    ctx.fillStyle = c.plate;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(53, 109, 131, 0.08)';
    ctx.fillRect(0, 0, width, height);

    const activeSources = twoFingers
      ? [{ x: 260, y: 180, t0: 0, f: rhythm > 0.05 ? rhythm : 1.5 }, { x: 380, y: 180, t0: 0, f: rhythm > 0.05 ? rhythm : 1.5 }]
      : sources.filter(s => s.t0 >= 0).map((s, idx) => ({ ...s, f: idx === 0 ? rhythm : 0 }));

    for (const s of activeSources) {
      const age = Math.max(0, simT - s.t0);
      const f = s.f > 0.05 ? s.f : 1.5;
      const lam = SPEED_PX / f;
      const maxR = Math.min(720, SPEED_PX * age + 30);
      for (let r = lam * ((SPEED_PX * age / lam) % 1); r < maxR; r += lam) {
        if (r < 4) continue;
        let env = 1 / Math.sqrt(Math.max(r, 10) / 10);
        if (s.f <= 0.05) {
          const dr = r - SPEED_PX * age;
          env *= Math.exp(-(dr * dr) / (2 * 26 * 26)) * Math.exp(-0.12 * age);
        }
        if (env < 0.03) continue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = c.electron;
        ctx.globalAlpha = Math.min(0.85, env * 0.75);
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = c.proton;
      ctx.fill();
    }

    // Still nodal lines hint in two-finger mode
    if (twoFingers) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = c.muted;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(320, 10);
      ctx.lineTo(320, H - 10);
      ctx.stroke();
      ctx.restore();
    }

    // Paper scrap loop & rectangle
    ctx.save();
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = c.muted;
    ctx.beginPath();
    ctx.arc(scrap.x0, scrap.y0, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.5;
    api.draw.roundRect(ctx, scrap.x - 9, scrap.y - 6, 18, 12, 2);
    ctx.fill();
    ctx.stroke();
    api.draw.text(ctx, 'paper scrap', scrap.x0, scrap.y0 + 20, { size: 11, color: c.muted, align: 'center' });
  }

  updateScrap();
  const gl = api.gl(FRAG, {
    u_s0: [sources[0].x, sources[0].y, sources[0].t0, 0],
    u_s1: [sources[1].x, sources[1].y, sources[1].t0, 0],
    u_s2: [sources[2].x, sources[2].y, sources[2].t0, 0],
    u_scrap: [scrap.x0, scrap.y0, scrap.x, scrap.y],
    u_mode: 0,
    u_freq: 0,
    u_simT: simT,
  }, {
    width: W,
    height: H,
    fallback: fallback2D,
    label: 'Top view of a ripple tank with circular waves and a floating paper scrap',
  });

  const say = api.readout();
  function updateReadout() {
    const fEff = rhythm > 0.05 ? rhythm : 1.5;
    const lam = (SPEED_CM / fEff).toFixed(1);
    const dStr = scrap.dispMm.toFixed(1);
    const base = `Rings spread at ${SPEED_CM.toFixed(1)} cm/s (slowed to about a tenth of real ripple speed; wave heights are exaggerated, and each ring's height falls as 1/√r as its energy spreads round a larger circle). The paper scrap is ${dStr} mm from where it started (it goes round a closed loop and comes back). Dipping faster packs the rings closer: wavelength ${lam} cm.`;
    if (twoFingers) {
      say(`${base} Where the rings cross, their heights add; along the still lines they cancel.`);
    } else {
      say(base);
    }
  }

  const marker=api.canvas(640,130,'Magnified displacement of the local paper marker about its rest position');
  function drawMarker(){
    const ctx=marker.ctx;marker.clear(c.plate);const x=122,y=62,magnify=7,dx=(scrap.x-scrap.x0)*magnify,dy=(scrap.y-scrap.y0)*magnify;
    ctx.strokeStyle=c.muted;ctx.setLineDash([3,4]);ctx.beginPath();ctx.ellipse(x,y,48,24,0,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();
    ctx.save();ctx.translate(x+dx,y+dy);ctx.rotate(-.2);ctx.fillStyle=c.sheet;ctx.fillRect(-9,-6,18,12);ctx.strokeStyle=c.ink;ctx.strokeRect(-9,-6,18,12);ctx.restore();
    label(ctx,c,'Rest + / paper □',20,115,{size:12});label(ctx,c,'LOCAL MOTION ×7',20,20,{size:12,weight:600});
    label(ctx,c,`Displacement: ${scrap.dispMm.toFixed(1)} mm`,270,40,{size:14,weight:600});
    label(ctx,c,'The pattern spreads across the tank.',270,68,{size:13});
    label(ctx,c,'This scrap moves around its rest point.',270,91,{size:13});
    label(ctx,c,'Dashed oval is a motion guide, not a wave crest.',270,115,{size:11,color:c.muted});
  }
  function syncUniforms() {
    updateScrap();
    drawMarker();
    if (twoFingers) {
      gl.set('u_s0', [260, 180, 0, 0]);
      gl.set('u_s1', [380, 180, 0, 0]);
    } else {
      gl.set('u_s0', [sources[0].x, sources[0].y, sources[0].t0, 0]);
      gl.set('u_s1', [sources[1].x, sources[1].y, sources[1].t0, 0]);
      gl.set('u_s2', [sources[2].x, sources[2].y, sources[2].t0, 0]);
    }
    gl.set('u_scrap', [scrap.x0, scrap.y0, scrap.x, scrap.y]);
    gl.set('u_mode', twoFingers ? 1 : 0);
    gl.set('u_freq', rhythm);
    gl.set('u_simT', simT);
    updateReadout();
  }

  // Control 1: Tap surface to dip a finger (or long-press to move paper scrap)
  const cv = gl.canvas;
  if (cv) {
    cv.style.cursor = 'pointer';
    let downTime = 0, downPos = null, pressTimer = 0;
    const toLocal = (e) => {
      const r = cv.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / (r.width || W)) * W,
        y: ((e.clientY - r.top) / (r.height || H)) * H,
      };
    };
    cv.addEventListener('pointerdown', (e) => {
      downTime = performance.now();
      downPos = toLocal(e);
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        if (downPos) {
          scrap.x0 = Math.max(24, Math.min(W - 24, downPos.x));
          scrap.y0 = Math.max(24, Math.min(H - 24, downPos.y));
          downPos = null;
          syncUniforms();
        }
      }, 420);
    });
    cv.addEventListener('pointerup', () => {
      clearTimeout(pressTimer);
      if (downPos && performance.now() - downTime < 420) {
        twoFingers = false;
        tabs[0].setAttribute('aria-pressed', 'true');
        tabs[1].setAttribute('aria-pressed', 'false');
        sources.pop();
        sources.unshift({ x: downPos.x, y: downPos.y, t0: simT - 0.05 });
        syncUniforms();
      }
      downPos = null;
    });
  }

  // Control 2: Slider Rhythm (0 = single dip, or 0.5-3.0 Hz)
  api.slider('Rhythm', {
    min: 0, max: 3, step: 0.5, value: 0,
    fmt: (v) => (v === 0 ? 'Single dip' : `${v.toFixed(1)} Hz`),
    onInput: (v) => {
      rhythm = v;
      if (rhythm > 0 && sources[0].t0 < 0) {
        sources[0] = { x: 230, y: 180, t0: 0 };
      }
      syncUniforms();
    },
  });

  // Control 3: Tabs One finger / Two fingers
  const tabs = api.tabs(['One finger', 'Two fingers'], (i) => {
    twoFingers = i === 1;
    if (!twoFingers && sources[0].t0 < 0) {
      sources[0] = { x: 230, y: 180, t0: simT - 0.5 };
    }
    syncUniforms();
  });

  api.loop((dt) => {
    if (dt > 0) {
      simT += dt;
      syncUniforms();
    } else {
      updateScrap();
    drawMarker();
      updateReadout();
    }
  });

  syncUniforms();
  return { destroy() {} };
}, { label: 'Dip a finger' });
