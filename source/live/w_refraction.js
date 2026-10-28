// 10.4 Refraction & total internal reflection: Snell's law, marching wavefronts at c/n, and critical angle.
import { Live } from './core.js';
import { note, label } from './art_waves.js';

const MATS = [
  { name: 'water', Cap: 'Water', n: 1.333, speedText: 'three-quarters of its speed', wash: 'rgba(53, 109, 131, 0.14)' },
  { name: 'glass', Cap: 'Glass', n: 1.52, speedText: 'two-thirds of its speed', wash: 'rgba(46, 96, 74, 0.14)' },
  { name: 'diamond', Cap: 'Diamond', n: 2.419, speedText: '41% of its speed', wash: 'rgba(147, 96, 34, 0.14)' },
];

Live.register('refraction', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 320;
  note(stage,'Angles are measured from the dashed normal. Wavefront spacing changes with speed, while frequency stays the same. Solid arrows show light paths, not the motion of water or glass.');
  const k = api.canvas(W, H, 'A beam of light with marching wavefronts bending at the boundary between air and water, glass, or diamond');

  let theta1Deg = 45;
  let matIdx = 0;
  let fromMaterial = false; // false = Air -> material, true = Material -> air
  let phase = 0;

  const say = api.readout();

  // Control 1: Angle slider (0 to 89 degrees, default 45)
  api.slider('Arriving angle', {
    min: 0, max: 89, step: 1, value: theta1Deg,
    fmt: (v) => `${v}°`,
    onInput: (v) => {
      theta1Deg = v;
      drawFrame(0);
    },
  });

  // Control 2: Tabs for second material
  api.tabs(['Water (1.333)', 'Glass (1.52)', 'Diamond (2.419)'], (i) => {
    matIdx = i;
    drawFrame(0);
  });

  // Control 3: Direction toggle "Air -> material" / "Material -> air"
  const dirBtn = api.button('Direction: air → material', () => {
    fromMaterial = !fromMaterial;
    dirBtn.textContent = fromMaterial ? 'Direction: material → air' : 'Direction: air → material';
    dirBtn.setAttribute('aria-pressed', String(fromMaterial));
    drawFrame(0);
  }, { pressed: false });

  const detail=document.createElement('details');
  const summary=document.createElement('summary');summary.textContent='Follow light from a fixed coin';summary.style.cssText='padding:12px;font:14px var(--sans);cursor:pointer';detail.append(summary);stage.append(detail);
  const coin=api.canvas(640,250,'Fixed coin eight centimetres below a material surface, with actual light and apparent position');detail.append(coin.cv);
  function drawCoin(mat){
    const ctx=coin.ctx;coin.clear(c.plate);
    const x=160,y=70,S=16,depth=8*S,coinX=x+6.5*S;
    const th=Math.asin(Math.SQRT1_2/mat.n),reach=8*Math.tan(th),hitX=coinX-reach*S;
    ctx.fillStyle=mat.wash;ctx.fillRect(x,y,220,depth);ctx.strokeStyle=c.ink;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+depth);ctx.lineTo(x+220,y+depth);ctx.lineTo(x+220,y);ctx.stroke();
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=c.muted;ctx.beginPath();ctx.moveTo(hitX,y);ctx.lineTo(coinX,y+reach*S);ctx.stroke();ctx.restore();
    api.draw.arrow(ctx,coinX,y+depth,hitX,y,c.neutron,2.5,7);
    api.draw.arrow(ctx,hitX,y,hitX-42,y-42,c.neutron,2.5,7);
    ctx.fillStyle=c.proton;ctx.beginPath();ctx.ellipse(coinX,y+depth-3,11,4,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.setLineDash([3,3]);ctx.strokeStyle=c.proton;ctx.beginPath();ctx.ellipse(coinX,y+reach*S,11,4,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    label(ctx,c,'Observer',hitX-52,20,{align:'center'});label(ctx,c,'45° in air',hitX+18,y-15,{size:12});
    label(ctx,c,'Apparent coin',399,108,{color:c.muted});label(ctx,c,'Fixed real coin · 8 cm deep',399,131,{size:12,color:c.proton});
    label(ctx,c,`${mat.Cap}: ${ (th*180/Math.PI).toFixed(1)}° inside`,399,160,{size:12});
    label(ctx,c,'Dashed = back-projection',399,183,{size:12,color:c.muted});
    label(ctx,c,'Same coin position for every material. An optical box, not a filled kitchen cup.',20,232,{size:12,color:c.muted});
  }

  function drawWavefrontsAlong(ctx, cx, cy, dirX, dirY, nIndex, isIncoming, maxDist, col, alpha) {
    const lamAir = 28; // px in air
    const lam = lamAir / nIndex; // spacing shrinks by factor n!
    const perpX = -dirY, perpY = dirX;
    const halfWidth = 18;
    // Phase advances at frequency f, so distance offset = ((phase / 2pi) % 1) * lam
    const shift = (((phase / (2 * Math.PI)) % 1) + 1) % 1;
    ctx.save();
    ctx.strokeStyle = col;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.6;
    for (let m = 0; m * lam < maxDist; m++) {
      const s = isIncoming ? maxDist - (m + shift) * lam : (m + shift) * lam;
      if (s < 4 || s > maxDist - 2) continue;
      const px = cx + dirX * s;
      const py = cy + dirY * s;
      ctx.beginPath();
      ctx.moveTo(px - perpX * halfWidth, py - perpY * halfWidth);
      ctx.lineTo(px + perpX * halfWidth, py + perpY * halfWidth);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFrame(dt) {
    phase += dt * 5.0;
    const ctx = k.ctx;
    k.clear(c.plate);

    const mat = MATS[matIdx];
    const cx = 320, cy = 160; // boundary intersection point
    const rayLen = 142;

    // Top half is air (n = 1.00), bottom half is material (n = mat.n)
    ctx.fillStyle = mat.wash;
    ctx.fillRect(0, cy, W, H - cy);

    // Boundary line
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(16, cy);
    ctx.lineTo(W-16, cy);
    ctx.stroke();

    // Dashed normal line
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(cx, 16);
    ctx.lineTo(cx, H - 16);
    ctx.stroke();
    ctx.restore();
    api.draw.text(ctx, 'normal', cx + 6, 28, { size: 11, color: c.muted });
    api.draw.text(ctx, 'Air (n = 1.00)', 24, cy - 12, { size: 12, color: c.ink, weight: 600 });
    api.draw.text(ctx, `${mat.Cap} (n = ${mat.n})`, 24, cy + 22, { size: 12, color: c.electron, weight: 600 });

    const n1 = fromMaterial ? mat.n : 1.0;
    const n2 = fromMaterial ? 1.0 : mat.n;
    const th1 = (theta1Deg * Math.PI) / 180;
    const sinTh2 = (n1 * Math.sin(th1)) / n2;
    const tir = sinTh2 > 1.0;
    const th2 = tir ? 0 : Math.asin(Math.min(1, sinTh2));
    const theta2Deg = (th2 * 180) / Math.PI;
    const critDeg = fromMaterial ? (Math.asin(1 / mat.n) * 180) / Math.PI : 90;

    // Unit directions from (cx, cy) outward along the 3 rays
    // If air -> material: arriving comes from top-left (-sin th1, -cos th1), reflected goes top-right (+sin th1, -cos th1), refracted goes bottom-right (+sin th2, +cos th2)
    // If material -> air: arriving comes from bottom-left (-sin th1, +cos th1), reflected goes bottom-right (+sin th1, +cos th1), refracted goes top-right (+sin th2, -cos th2)
    const signY = fromMaterial ? 1 : -1;
    const incOutX = -Math.sin(th1), incOutY = signY * Math.cos(th1);
    const refOutX = Math.sin(th1), refOutY = signY * Math.cos(th1);
    const transOutX = Math.sin(th2), transOutY = -signY * Math.cos(th2);

    // Wavefronts marching along incoming and refracted/reflected rays
    drawWavefrontsAlong(ctx, cx, cy, incOutX, incOutY, n1, true, rayLen, c.electron, 0.55);
    if (!tir) {
      drawWavefrontsAlong(ctx, cx, cy, transOutX, transOutY, n2, false, rayLen, c.electron, 0.55);
    } else {
      drawWavefrontsAlong(ctx, cx, cy, refOutX, refOutY, n1, false, rayLen, c.electron, 0.55);
    }

    // Draw arriving ray
    const xStart = cx + incOutX * rayLen, yStart = cy + incOutY * rayLen;
    ctx.strokeStyle = c.neutron;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    api.draw.arrow(ctx, xStart, yStart, (xStart + cx) / 2, (yStart + cy) / 2, c.neutron, 2.6, 8);

    // Draw reflected ray
    const xRef = cx + refOutX * rayLen, yRef = cy + refOutY * rayLen;
    ctx.save();
    ctx.globalAlpha = tir ? 1.0 : 0.42;
    ctx.strokeStyle = tir ? c.proton : c.neutron;
    ctx.lineWidth = tir ? 2.8 : 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(xRef, yRef);
    ctx.stroke();
    api.draw.arrow(ctx, cx, cy, (cx + xRef) / 2, (cy + yRef) / 2, tir ? c.proton : c.neutron, tir ? 2.8 : 1.8, 7);
    ctx.restore();

    if (tir) {
      api.draw.text(ctx, 'total internal reflection', xRef - 10, yRef + (fromMaterial ? 16 : -10), {
        size: 11.5, color: c.proton, align: 'right', weight: 700,
      });
    } else {
      // Draw refracted ray
      const xTrans = cx + transOutX * rayLen, yTrans = cy + transOutY * rayLen;
      ctx.strokeStyle = c.neutron;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(xTrans, yTrans);
      ctx.stroke();
      api.draw.arrow(ctx, cx, cy, (cx + xTrans) / 2, (cy + yTrans) / 2, c.neutron, 2.5, 8);
    }

    // Label angles
    api.draw.text(ctx, `θ₁ = ${theta1Deg}°`, cx - 48, cy + signY * 42, {
      size: 11.5, color: c.ink, align: 'right', weight: 600,
    });
    if (!tir) {
      api.draw.text(ctx, `θ₂ = ${theta2Deg.toFixed(1)}°`, cx + 48, cy - signY * 42, {
        size: 11.5, color: c.proton, align: 'left', weight: 600,
      });
    }

    // Right side panel: "Coin in the 8 cm cup" summary diagram (45 deg sightline over rim)
    drawCoin(mat);

    // Readout
    if (!fromMaterial) {
      say(
        `Air to ${mat.name} at ${theta1Deg}°: the light slows to ${mat.speedText} (v = c/${mat.n}) and continues at ${theta2Deg.toFixed(1)}° to the normal; wavefront spacing shrinks by ${mat.n}. ` +
        `Some light reflects at ${theta1Deg}° too (slowed enormously, by about 10¹⁰, so you can see the crests).`
      );
    } else if (!tir) {
      say(
        `${mat.Cap} to air at ${theta1Deg}° (critical angle ${critDeg.toFixed(1)}°): the light speeds up to c and bends away from the normal to ${theta2Deg.toFixed(1)}° ` +
        `(slowed enormously so you can see the crests).`
      );
    } else {
      say(
        `${mat.Cap} to air at ${theta1Deg}°: beyond ${critDeg.toFixed(1)}° no light gets out. ` +
        `The surface is a mirror from below (total internal reflection at ${theta1Deg}°; slowed enormously so you can see the crests).`
      );
    }
  }

  api.loop((dt) => {
    drawFrame(dt);
  });

  drawFrame(0);
  return { destroy() {} };
}, { label: 'Bend the beam' });
