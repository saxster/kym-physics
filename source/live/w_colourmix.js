// 11.2 Additive lights, subtractive paints, and object reflectance under coloured light.
import { Live } from './core.js';
import { drawObject, note } from './art_waves.js';

const OBJECTS = [
  { name: 'Banana', refl: [0.9, 0.8, 0.1], desc: 'R .9 G .8 B .1' },
  { name: 'Leaf', refl: [0.2, 0.6, 0.1], desc: 'R .2 G .6 B .1' },
  { name: 'Blue cloth', refl: [0.1, 0.2, 0.8], desc: 'R .1 G .2 B .8' },
  { name: 'White kurta', refl: [0.95, 0.95, 0.95], desc: 'R .95 G .95 B .95' },
];

Live.register('colourmix', (stage, params, api) => {
  const c = api.colors();
  const W = 640, H = 320;
  const k = api.canvas(W, H, 'Overlapping discs of light, patches of paint on paper, or everyday objects under coloured light');

  let tab = 0;      // 0 = Light on a white wall, 1 = Paints on paper, 2 = An object under this light
  let objIdx = 0;   // 0 = Banana, 1 = Leaf, 2 = Blue cloth, 3 = White kurta
  let ch1 = 80;     // Red (or Cyan) % (starts at 80 so moving slider to max 100 changes to full 100%)
  let ch2 = 100;    // Green (or Magenta) %
  let ch3 = 100;    // Blue (or Yellow) %

  const say = api.readout();

  // Control 1: Mode tabs
  api.tabs(['Light on a white wall', 'Paints on paper', 'An object under this light'], (i) => {
    tab = i;
    s1Lab.textContent = tab === 1 ? 'Cyan paint' : 'Red light';
    s2Lab.textContent = tab === 1 ? 'Magenta paint' : 'Green light';
    s3Lab.textContent = tab === 1 ? 'Yellow paint' : 'Blue light';
    objectControl.style.display = tab === 2 ? 'flex' : 'none';
    drawFrame();
  });

  // Control 2: Three channel sliders (Red/Cyan, Green/Magenta, Blue/Yellow)
  const s1 = api.slider('Red light', {
    min: 0, max: 100, step: 5, value: ch1,
    fmt: (v) => `${v}%`,
    onInput: (v) => { ch1 = v; drawFrame(); },
  });
  const s2 = api.slider('Green light', {
    min: 0, max: 100, step: 5, value: ch2,
    fmt: (v) => `${v}%`,
    onInput: (v) => { ch2 = v; drawFrame(); },
  });
  const s3 = api.slider('Blue light', {
    min: 0, max: 100, step: 5, value: ch3,
    fmt: (v) => `${v}%`,
    onInput: (v) => { ch3 = v; drawFrame(); },
  });
  const s1Lab = s1.input.previousElementSibling;
  const s2Lab = s2.input.previousElementSibling;
  const s3Lab = s3.input.previousElementSibling;

  const objectControl=document.createElement('label');
  objectControl.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 14px;font:14px var(--sans);color:var(--ink);background:var(--sheet)';
  objectControl.textContent='Choose an object';objectControl.style.display='none';
  const objectSelect=document.createElement('select');objectSelect.setAttribute('aria-label','Object under coloured light');
  objectSelect.style.cssText='font:inherit;min-height:44px;max-width:100%;background:var(--paper);color:var(--ink)';
  OBJECTS.forEach((ob,i)=>{const o=document.createElement('option');o.value=i;o.textContent=ob.name;objectSelect.append(o);});
  objectSelect.addEventListener('change',()=>{objIdx=+objectSelect.value;drawFrame();});
  objectControl.append(objectSelect);stage.append(objectControl);
  note(stage,'Object colours use an idealised three-channel reflectance model. The drawing shows light arriving and the colour returned to your eye; real materials have richer spectra.');
  // Clicking on the 4 object cards in the Object tab selects that object
  k.cv.addEventListener('pointerdown', (e) => {
    if (tab !== 2) return;
    const r = k.cv.getBoundingClientRect();
    const px = ((e.clientX - r.left) / (r.width || W)) * W;
    const py = ((e.clientY - r.top) / (r.height || H)) * H;
    if (py >= 236 && py <= 298) {
      const idx = Math.floor((px - 32) / 146);
      if (idx >= 0 && idx < 4) {
        objIdx = idx;
        objectSelect.value=String(idx);
        drawFrame();
      }
    }
  });

  function rgbCss(r, g, b) {
    const R = Math.round(Math.max(0, Math.min(1, r)) * 255);
    const G = Math.round(Math.max(0, Math.min(1, g)) * 255);
    const B = Math.round(Math.max(0, Math.min(1, b)) * 255);
    return `rgb(${R}, ${G}, ${B})`;
  }

  function colourWord(r, g, b) {
    const mx = Math.max(r, g, b);
    if (mx < 0.08) return 'black (dark)';
    if (r > 0.7 && g > 0.7 && b > 0.7) return 'white';
    if (r > 0.6 && g > 0.6 && b < 0.35) return 'yellow';
    if (r < 0.35 && g > 0.5 && b > 0.5) return 'cyan';
    if (r > 0.5 && g < 0.35 && b > 0.5) return 'magenta';
    if (r > g * 1.4 && r > b * 1.4) return 'red';
    if (g > r * 1.3 && g > b * 1.3) return 'green';
    if (b > r * 1.3 && b > g * 1.3) return 'blue';
    return 'a mixed tint';
  }

  function drawVenn(ctx, isPaint) {
    const a1 = ch1 / 100, a2 = ch2 / 100, a3 = ch3 / 100;
    const cx = 240, cy = 158, rad = 76;
    const c1 = { x: cx - 44, y: cy - 30 };
    const c2 = { x: cx + 44, y: cy - 30 };
    const c3 = { x: cx, y: cy + 42 };

    // Backdrop: dark room for lights, white paper for paints
    ctx.fillStyle = isPaint ? '#fbfaf5' : '#161d1b';
    api.draw.roundRect(ctx, 24, 16, 430, 288, 8);
    ctx.fill();
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Render exact pixel-by-pixel Venn circles onto an offscreen ImageData (220 x 190 at 2x scale)
    const bx = 90, by = 32, bw = 300, bh = 250;
    const img = ctx.createImageData(bw, bh);
    const data = img.data;
    for (let py = 0; py < bh; py++) {
      const y = by + py;
      for (let px = 0; px < bw; px++) {
        const x = bx + px;
        const in1 = (x - c1.x) * (x - c1.x) + (y - c1.y) * (y - c1.y) <= rad * rad;
        const in2 = (x - c2.x) * (x - c2.x) + (y - c2.y) * (y - c2.y) <= rad * rad;
        const in3 = (x - c3.x) * (x - c3.x) + (y - c3.y) * (y - c3.y) <= rad * rad;
        if (!in1 && !in2 && !in3) continue;
        let r = 0, g = 0, b = 0;
        if (!isPaint) {
          // Additive mixing: sum of R, G, B channels
          r = in1 ? a1 : 0;
          g = in2 ? a2 : 0;
          b = in3 ? a3 : 0;
        } else {
          // Subtractive mixing on white paper: multiply reflectances
          // Cyan absorbs R (passes G, B); Magenta absorbs G (passes R, B); Yellow absorbs B (passes R, G)
          r = 0.98 * (in1 ? 1 - 0.92 * a1 : 1) * (in2 ? 0.94 : 1) * (in3 ? 0.95 : 1);
          g = 0.98 * (in1 ? 0.92 : 1) * (in2 ? 1 - 0.92 * a2 : 1) * (in3 ? 0.94 : 1);
          b = 0.96 * (in1 ? 0.92 : 1) * (in2 ? 0.92 : 1) * (in3 ? 1 - 0.92 * a3 : 1);
        }
        const idx = (py * bw + px) * 4;
        data[idx] = Math.round(r * 255);
        data[idx + 1] = Math.round(g * 255);
        data[idx + 2] = Math.round(b * 255);
        data[idx + 3] = 255;
      }
    }
    const tmp = document.createElement('canvas');
    tmp.width = bw;
    tmp.height = bh;
    tmp.getContext('2d').putImageData(img, 0, 0);
    ctx.drawImage(tmp, bx, by);

    // Circle outlines
    ctx.strokeStyle = isPaint ? 'rgba(29,51,45,0.35)' : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.2;
    for (const pt of [c1, c2, c3]) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Region labels on the right legend card
    const lx = 468, ly = 16, lw = 152, lh = 288;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    api.draw.roundRect(ctx, lx, ly, lw, lh, 6);
    ctx.fill();
    ctx.stroke();

    if (!isPaint) {
      api.draw.text(ctx, 'Additive mixing', lx + 12, ly + 24, { size: 12, color: c.ink, weight: 700 });
      api.draw.text(ctx, 'red + green = yellow', lx + 12, ly + 52, { size: 11, color: c.ink });
      api.draw.text(ctx, 'green + blue = cyan', lx + 12, ly + 74, { size: 11, color: c.ink });
      api.draw.text(ctx, 'red + blue = magenta', lx + 12, ly + 96, { size: 11, color: c.ink });
      api.draw.text(ctx, 'all three = white', lx + 12, ly + 118, { size: 11, color: c.ink, weight: 600 });

      // Show current overlap swatch
      ctx.fillStyle = rgbCss(a1, a2, a3);
      api.draw.roundRect(ctx, lx + 12, ly + 142, lw - 24, 44, 4);
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.stroke();
      api.draw.text(ctx, `Centre: ${colourWord(a1, a2, a3)}`, lx + 12, ly + 206, { size: 11.5, color: c.ink, weight: 600 });

      say(
        `Red ${ch1}% + green ${ch2}% + blue ${ch3}% on a white wall: the centre overlap looks ${colourWord(a1, a2, a3)} ` +
        `(red + green = yellow, all three = white; your red, green and blue cones fire together). ` +
        `Screen colours are RGB approximations of spectral colours, and a phone screen's red is not a single pure wavelength.`
      );
    } else {
      api.draw.text(ctx, 'Subtractive paints', lx + 12, ly + 24, { size: 12, color: c.ink, weight: 700 });
      api.draw.text(ctx, 'cyan + yellow = green', lx + 12, ly + 52, { size: 11, color: c.ink });
      api.draw.text(ctx, 'cyan + magenta = blue', lx + 12, ly + 74, { size: 11, color: c.ink });
      api.draw.text(ctx, 'magenta + yellow = red', lx + 12, ly + 96, { size: 11, color: c.ink });
      api.draw.text(ctx, 'all three = near black', lx + 12, ly + 118, { size: 11, color: c.ink, weight: 600 });

      const r = (1 - 0.92 * a1), g = (1 - 0.92 * a2), b = (1 - 0.92 * a3);
      ctx.fillStyle = rgbCss(r, g, b);
      api.draw.roundRect(ctx, lx + 12, ly + 142, lw - 24, 44, 4);
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.stroke();
      api.draw.text(ctx, `Centre: ${colourWord(r, g, b)}`, lx + 12, ly + 206, { size: 11.5, color: c.ink, weight: 600 });

      say(
        `Cyan ${ch1}%, magenta ${ch2}%, yellow ${ch3}% on white paper: each paint subtracts one third of the spectrum ` +
        `(cyan absorbs red, magenta absorbs green, yellow absorbs blue; cyan + yellow = green, all three = near black). ` +
        `Screen colours are RGB approximations of real pigments.`
      );
    }
  }

  function drawObjectTab(ctx) {
    const lr = ch1 / 100, lg = ch2 / 100, lb = ch3 / 100;
    const ob = OBJECTS[objIdx];
    const [rr, rg, rb] = ob.refl;
    const outR = lr * rr, outG = lg * rg, outB = lb * rb;

    // Left: lamp beam; Middle: chosen object + pure red reference patch; Right: reflected light reaching eye
    ctx.fillStyle = '#18201e';
    api.draw.roundRect(ctx, 24, 16, W - 48, 206, 8);
    ctx.fill();

    // Lamp swatch
    ctx.fillStyle = rgbCss(lr, lg, lb);
    ctx.beginPath();
    ctx.arc(105, 118, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    api.draw.text(ctx, `Lamp (${ch1}%, ${ch2}%, ${ch3}%)`, 105, 174, { size: 11.5, color: '#fbfaf5', align: 'center' });

    api.draw.arrow(ctx, 152, 118, 232, 118, rgbCss(Math.max(0.3, lr), Math.max(0.3, lg), Math.max(0.3, lb)), 2.5, 8);

    // Recognisable material silhouettes, coloured by the calculated reflected light.
    drawObject(ctx,{...c,ink:'#fbfaf5'},objIdx,320,111,52,rgbCss(outR,outG,outB));
    api.draw.text(ctx, ob.name, 320, 52, { size: 13, color: '#fbfaf5', align: 'center', weight: 700 });
    api.draw.text(ctx, `Reflectance ${ob.desc}`, 320, 176, { size: 11, color: '#cfccbf', align: 'center' });

    // Pure-red reference patch (R 1.0, G 0.0, B 0.0) so pure red under pure blue is strictly black (0, 0, 0)
    const pureRedOut = rgbCss(lr * 1.0, 0, 0);
    ctx.fillStyle = pureRedOut;
    api.draw.roundRect(ctx, 430, 76, 162, 68, 6);
    ctx.fill();
    ctx.strokeStyle = '#cfccbf';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    api.draw.text(ctx, 'Ideal pure-red patch', 511, 64, { size: 11, color: '#cfccbf', align: 'center' });
    api.draw.text(ctx, lr === 0 ? 'Looks black (0% R in lamp)' : `Sends back ${Math.round(lr * 100)}% R only`, 511, 162, {
      size: 10.5, color: '#cfccbf', align: 'center',
    });

    // Bottom chooser bar for the 4 objects: Banana · Leaf · Blue cloth · White kurta
    for (let i = 0; i < 4; i++) {
      const item = OBJECTS[i];
      const bx = 32 + i * 146, by = 236, bw = 134, bh = 62;
      const sel = i === objIdx;
      ctx.fillStyle = sel ? c.sheet : c.paper;
      ctx.strokeStyle = sel ? c.proton : c.rule;
      ctx.lineWidth = sel ? 2.2 : 1;
      api.draw.roundRect(ctx, bx, by, bw, bh, 6);
      ctx.fill();
      ctx.stroke();

      // Swatch under current light
      ctx.fillStyle = rgbCss(lr * item.refl[0], lg * item.refl[1], lb * item.refl[2]);
      ctx.beginPath();
      ctx.arc(bx + 22, by + 31, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1;
      ctx.stroke();

      api.draw.text(ctx, item.name, bx + 42, by + 26, { size: 11.5, color: c.ink, weight: sel ? 700 : 500 });
      api.draw.text(ctx, item.desc, bx + 42, by + 44, { size: 9.5, color: c.muted });
    }

    const lookWord = colourWord(outR, outG, outB);
    say(
      `${ob.name} (reflectance ${ob.desc}) under light R ${ch1}%, G ${ch2}%, B ${ch3}%: ` +
      `it sends back R ${Math.round(outR * 100)}%, G ${Math.round(outG * 100)}%, B ${Math.round(outB * 100)}%, so it looks ${lookWord}. ` +
      `(Three-channel reflectance model: banana R .9 G .8 B .1; leaf R .2 G .6 B .1; blue cloth R .1 G .2 B .8; kurta .95 each; ` +
      `a pure red patch under pure blue light is black, and a phone screen's red is an RGB approximation, not one pure wavelength.)`
    );
  }

  function drawFrame() {
    const ctx = k.ctx;
    k.clear(c.plate);
    if (tab === 0) drawVenn(ctx, false);
    else if (tab === 1) drawVenn(ctx, true);
    else drawObjectTab(ctx);
  }

  api.loop(() => {
    drawFrame();
  });

  drawFrame();
  return { destroy() {} };
}, { label: 'Mix lights and paints', static: true });
