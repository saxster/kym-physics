// Ch 4.2 c4_drag_balance -> w_airfall: Falling through air vs vacuum, terminal speed, and drag = weight balance.
// Integrates a = g - 0.5 * C * rho * A * v^2 / m with RK2 (dt <= 2 ms). Time slowed 4x.
import { Live } from './core.js';
import { equalTimePositions } from './mechanics_geometry.mjs';
import { mechanismKey } from './art_mechanics.js';

const G = 9.8;
const RHO_MUMBAI = 1.225; // kg/m^3

const PAIRS = [
  {
    name: 'Hammer and feather',
    height: 1.6,
    note: 'Feather modelled as 1 g with 30 cm\u00b2 facing area, C = 1.0.',
    objs: [
      { label: 'Hammer', m: 1.32, A: 0.0025, C: 0.8, shape: 'hammer' },
      { label: 'Feather', m: 0.001, A: 0.0030, C: 1.0, shape: 'feather' },
    ],
  },
  {
    name: 'Flat and crumpled sheet',
    height: 1.6,
    note: 'Both 5 g A4 sheets: flat 0.0624 m\u00b2 (C = 1.1), crumpled 4 cm ball (C = 0.47).',
    objs: [
      { label: 'Crumpled sheet', m: 0.005, A: Math.PI * 0.02 * 0.02, C: 0.47, shape: 'ball' },
      { label: 'Flat sheet', m: 0.005, A: 0.0624, C: 1.1, shape: 'sheet' },
    ],
  },
  {
    name: '2 mm and 4 mm raindrop',
    height: 20.0,
    note: 'Real drops as big as 4 mm flatten and break up, so about 10 m/s is the real ceiling.',
    objs: [
      { label: '2 mm drop', m: 4.19e-6, A: 3.105e-6, C: 0.5, shape: 'drop2' },
      { label: '4 mm drop', m: 33.0e-6, A: 12.6e-6, C: 0.5, shape: 'drop4' },
    ],
  },
];

Live.register('airfall', (stage, params, api) => {
  const c = api.colors();
  const k = api.canvas(640, 400, 'Two objects dropped side by side with weight and drag arrows, plus a speed-time graph');
  let air = 1.0; // fraction of Mumbai air density
  let pairIdx = 0;
  let simT = 0;
  let state = [];
  let history = [];
  const say = api.readout();
  mechanismKey(stage, "Compare equal times, then compare forces", ["Faint snapshots share a 0.1 s clock; hollow marks show earlier positions.", "Each object\u2019s weight arrow is its own 100% reference, not a common newton scale. Graph traces use solid / dashed marks to identify the objects."]);

  function reset() {
    simT = 0;
    const p = PAIRS[pairIdx];
    state = p.objs.map((o) => ({
      y: 0,
      v: 0,
      dragRatio: 0,
      landed: false,
      tLand: null,
      vt: air > 1e-6 ? Math.sqrt((2 * o.m * G) / (o.C * (air * RHO_MUMBAI) * o.A)) : Infinity,
    }));
    history = [{ t: 0, v0: 0, v1: 0, y0:0,y1:0 }];
    updateReadout();
  }

  function accel(o, v, rho) {
    if (rho <= 0) return G;
    const drag = 0.5 * o.C * rho * o.A * v * v;
    const w = o.m * G;
    return Math.max(0, G - Math.min(drag, w) / o.m);
  }

  function stepPhysics(dtReal) {
    if (dtReal <= 0) return;
    const p = PAIRS[pairIdx];
    if (state.every((s) => s.landed)) return;

    // Time slowed 4x
    let rem = dtReal * 0.25;
    const hStep = 0.002;
    const rho = air * RHO_MUMBAI;

    while (rem > 1e-6 && !state.every((s) => s.landed)) {
      const dt = Math.min(hStep, rem);
      rem -= dt;
      const tPrev = simT;
      simT += dt;

      state.forEach((s, i) => {
        if (s.landed) return;
        const o = p.objs[i];
        // RK2 midpoint step
        const a1 = accel(o, s.v, rho);
        const vMid = s.v + 0.5 * dt * a1;
        const a2 = accel(o, vMid, rho);
        let vNext = s.v + dt * a2;
        if (Number.isFinite(s.vt) && vNext > s.vt) vNext = s.vt;
        const yNext = s.y + vMid * dt;

        // Clamp drag <= weight every frame
        const dragForce = rho > 0 ? Math.min(o.m * G, 0.5 * o.C * rho * o.A * vNext * vNext) : 0;
        s.dragRatio = dragForce / (o.m * G);
        if (s.dragRatio > 1.000001) {
          console.error('Airfall conservation error: drag exceeded weight', s.dragRatio);
        }

        if (yNext >= p.height) {
          const frac = (p.height - s.y) / Math.max(1e-9, yNext - s.y);
          s.tLand = tPrev + frac * dt;
          s.y = p.height;
          s.v = vNext;
          s.landed = true;
        } else {
          s.y = yNext;
          s.v = vNext;
        }
      });

      if (simT - (history[history.length - 1]?.t || 0) >= 0.02) {
        history.push({ t: simT, v0: state[0].v, v1: state[1].v, y0:state[0].y,y1:state[1].y });
      }
    }

    // Check vacuum simultaneous landing within 1 frame
    if (air === 0 && (state[0].landed || state[1].landed)) {
      if (Math.abs((state[0].tLand ?? simT) - (state[1].tLand ?? simT)) > 0.005) {
        console.error('Vacuum landing mismatch');
      }
    }
    updateReadout();
  }

  function updateReadout() {
    const p = PAIRS[pairIdx];
    const [o0, o1] = p.objs;
    const [s0, s1] = state;

    if (air === 0) {
      const tVac = Math.sqrt((2 * p.height) / G);
      say(`No air: they fall together from ${p.height} m and land together in ${tVac.toFixed(2)} s (currently ${s0.v.toFixed(1)} m/s, drag = 0% of weight). Slowed 4 times.`);
      return;
    }

    const fmtObj = (o, s) => {
      const pct = Math.round(s.dragRatio * 100);
      if (pct >= 99) {
        return `${o.label}: steady at ${s.v.toFixed(1)} m/s (drag now equals weight, 100%)`;
      }
      return `${o.label}: ${s.v.toFixed(1)} m/s (drag = ${pct}% of weight)`;
    };

    let landingStr = '';
    if (s0.landed && s1.landed) {
      const gap = Math.abs(s1.tLand - s0.tLand);
      const first = s0.tLand <= s1.tLand ? o0.label : o1.label;
      landingStr = gap < 0.01
        ? ` Both landed together at ${s0.tLand.toFixed(2)} s.`
        : ` ${first} landed first at ${Math.min(s0.tLand, s1.tLand).toFixed(2)} s, ${gap.toFixed(2)} s ahead.`;
    } else if (s0.landed || s1.landed) {
      const first = s0.landed ? o0.label : o1.label;
      const tFirst = (s0.landed ? s0.tLand : s1.tLand).toFixed(2);
      landingStr = ` ${first} landed at ${tFirst} s; the other is still falling.`;
    }

    say(`${fmtObj(o0, s0)} · ${fmtObj(o1, s1)}.${landingStr} ${p.note} Slowed 4 times.`);
  }

  api.slider('Air', {
    min: 0, max: 1, step: 0.05, value: air,
    fmt: (v) => (v === 0 ? 'no air' : v === 1 ? 'Mumbai air (100%)' : `${Math.round(v * 100)}% air`),
    onInput: (v) => { air = +v.toFixed(2); reset(); },
  });

  api.tabs(PAIRS.map((p) => p.name), (i) => {
    pairIdx = i;
    reset();
  }, 0);

  api.button('Drop', () => { reset(); });

  api.loop((dt) => {
    if (dt > 0) stepPhysics(dt);

    k.clear(c.plate);
    const ctx = k.ctx;
    const p = PAIRS[pairIdx];

    // ---- Left panel: Drop column (x: 24..315)
    const topY = 48, floorY = 276;
    const colH = floorY - topY;
    const pxPerM = colH / p.height;

    // Air wash proportional to air density
    if (air > 0) {
      ctx.save();
      ctx.globalAlpha = 0.08 * air;
      ctx.fillStyle = c.electron;
      ctx.fillRect(30, topY, 275, colH);
      ctx.restore();
    }

    // Release line & ground
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = c.muted;
    ctx.beginPath();
    ctx.moveTo(30, topY);
    ctx.lineTo(305, topY);
    ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, `release height ${p.height} m`, 34, topY - 8, { size: 12, color: c.muted, weight: 600 });
    api.draw.text(ctx, 'sizes enlarged', 302, 22, { size: 11, color: c.muted, align: 'right' });

    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, floorY);
    ctx.lineTo(305, floorY);
    ctx.stroke();

    const xs = [110, 225];
    const strobes = equalTimePositions([...history,{t:simT,y0:state[0].y,y1:state[1].y}]);
    state.forEach((s, i) => {
      const o = p.objs[i];
      const cx = xs[i];
      const cy = Math.min(floorY - 12, topY + s.y * pxPerM);

      // Earlier positions share one strobe clock across both drop lanes.
      ctx.save();ctx.strokeStyle=i?c.neutron:c.electron;ctx.globalAlpha=.35;
      strobes.forEach(h=>{const yy=Math.min(floorY-12,topY+(i?h.y1:h.y0)*pxPerM);ctx.beginPath();ctx.arc(cx,yy,4,0,Math.PI*2);ctx.stroke();});ctx.restore();

      // Draw object icon
      ctx.fillStyle = c.ink;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.6;
      if (o.shape === 'hammer') {
        ctx.fillRect(cx - 3, cy - 10, 6, 20);
        ctx.fillRect(cx - 9, cy - 14, 18, 6);
      } else if (o.shape === 'feather') {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12);
        ctx.quadraticCurveTo(cx + 8, cy, cx, cy + 12);
        ctx.quadraticCurveTo(cx - 8, cy, cx, cy - 12);
        ctx.stroke();
      } else if (o.shape === 'sheet') {
        ctx.save();ctx.translate(cx,cy);ctx.rotate(-.12);ctx.fillStyle=c.sheet;ctx.fillRect(-14,-5,28,10);ctx.strokeRect(-14,-5,28,10);ctx.beginPath();ctx.moveTo(-9,-1);ctx.lineTo(9,-1);ctx.moveTo(-9,2);ctx.lineTo(6,2);ctx.stroke();ctx.restore();
      } else if (o.shape.startsWith('drop')) {
        const rad = o.shape === 'drop2' ? 7 : 10;
        ctx.beginPath();
        ctx.moveTo(cx - rad, cy + 3);
        ctx.bezierCurveTo(cx - rad, cy - rad * 1.2, cx + rad, cy - rad * 1.2, cx + rad, cy + 3);
        ctx.quadraticCurveTo(cx, cy + 6, cx - rad, cy + 3);
        ctx.closePath();
        ctx.fillStyle = c.electron;
        ctx.fill();
      } else {
        const rad = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fillStyle = c.ink;
        ctx.fill();
      }

      // Compare a common zero-to-weight reference away from the moving icon.
      const fy=348;
      if(!s.landed){
        api.draw.arrow(ctx,cx-20,fy,cx-20,fy+34,c.proton,2,6);
        if(s.dragRatio>.03)api.draw.arrow(ctx,cx+20,fy+34,cx+20,fy+34-s.dragRatio*34,c.proton,2,6);
        api.draw.text(ctx,'weight',cx-20,397,{size:11,color:c.proton,align:'center'});
        api.draw.text(ctx,`drag ${Math.round(s.dragRatio*100)}%`,cx+30,337,{size:11,color:c.proton,align:'center'});
      }else api.draw.text(ctx,'landed',cx,365,{size:12,color:c.muted,align:'center'});

      api.draw.text(ctx, o.label, cx, floorY + 18, { size: 12, color: c.ink, align: 'center', weight: 600 });
      api.draw.text(ctx, `${s.v.toFixed(1)} m/s`, cx, floorY + 33, { size: 11.5, color: c.electron, align: 'center' });
    });

    // ---- Right panel: Speed-time graph (x: 355..615)
    const gx0 = 365, gy0 = 276, gw = 248, gh = 216;
    const maxV = Math.max(pairIdx===2?12:8,Math.ceil(Math.max(state[0].v,state[1].v)/2)*2);
    const maxT = Math.max(pairIdx===2?3.5:1.5,simT+.1);
    const sx = gw / maxT;
    const sy = gh / maxV;

    api.draw.arrow(ctx, gx0, gy0, gx0 + gw + 8, gy0, c.ink, 1.5, 6);
    api.draw.arrow(ctx, gx0, gy0, gx0, gy0 - gh - 8, c.ink, 1.5, 6);
    api.draw.text(ctx, 'time (s)', gx0 + gw, gy0 + 22, { size: 12, color: c.muted, align: 'right' });
    api.draw.text(ctx, 'speed (m/s)', gx0 + 8, gy0 - gh + 4, { size: 12, color: c.muted, weight: 600 });

    for (let vTick = 2; vTick <= maxV; vTick += (pairIdx === 2 ? 4 : 2)) {
      const y = gy0 - vTick * sy;
      ctx.beginPath(); ctx.moveTo(gx0 - 4, y); ctx.lineTo(gx0, y); ctx.strokeStyle = c.ink; ctx.stroke();
      api.draw.text(ctx, String(vTick), gx0 - 8, y + 4, { size: 11, color: c.muted, align: 'right' });
    }

    // Terminal velocity dashed lines if within graph range
    state.forEach((s, i) => {
      if (Number.isFinite(s.vt) && s.vt <= maxV) {
        const yVt = gy0 - s.vt * sy;
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = i === 0 ? c.ink : c.electron;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(gx0, yVt);
        ctx.lineTo(gx0 + gw, yVt);
        ctx.stroke();
        ctx.restore();
        api.draw.text(ctx, `${p.objs[i].label} ${s.vt.toFixed(1)} m/s`, gx0 + gw - 4, yVt - 5, {
          size: 10.5, color: i === 0 ? c.ink : c.electron, align: 'right',
        });
      }
    });

    // Plot speed curves
    if (history.length > 1) {
      [0, 1].forEach((idx) => {
        ctx.strokeStyle = idx === 0 ? c.ink : c.electron;
        ctx.setLineDash(idx===1?[5,3]:[]);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        history.forEach((pt, kIdx) => {
          const tx = gx0 + Math.min(maxT, pt.t) * sx;
          const vy = gy0 - Math.min(maxV, idx === 0 ? pt.v0 : pt.v1) * sy;
          if (kIdx === 0) ctx.moveTo(tx, vy); else ctx.lineTo(tx, vy);
        });
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }
  });

  reset();
  return { destroy() {} };
}, { label: 'Drop them' });
