// 13.2 Magnetometer sensor lab: |B|, horizontal, vertical (down), and dip angle compared with WMM2025 Mumbai reference.
import { Live } from './core.js';
import { note, label } from './art_waves.js';

Live.register('magnetometer', (stage, params, api) => {
  const c = api.colors();
  note(stage,'Keep the phone flat, screen upwards. Sensor x/y are in the screen plane; z points out of the screen. Only then do √(x²+y²) and −z represent horizontal and down. Tilting the phone changes these components, but not |B|. Reference values are a model, not a calibration.');
  const W = 640, H = 290;
  const k = api.canvas(W, H, 'Three-bar magnetic field display (total, horizontal, down) and dip angle diagram for Mumbai');

  // WMM2025 Mumbai reference values
  const WMM = { total: 43.6, horiz: 38.4, down: 20.7, dip: 28 };

  let sensor = null;
  let sensorActive = false;
  let held = false;
  let statusNote = 'Lay the phone flat on a wooden or plastic surface away from steel. Nothing leaves this device.';

  // Default reading before sensor starts shows the WMM2025 Mumbai reference values so the opening view is informative
  let cur = { x: 38.4, y: 0, z: -20.7 };

  const say = api.readout();

  function stopSensor() {
    if (sensor) {
      try { sensor.stop(); } catch (e) {}
      sensor = null;
    }
    sensorActive = false;
    magBtn.textContent = 'Use the magnetometer';
    magBtn.setAttribute('aria-pressed', 'false');
  }

  // Control 1: Use the magnetometer button
  const magBtn = api.button('Use the magnetometer', async () => {
    if (sensorActive) {
      stopSensor();
      drawFrame();
      return;
    }
    const MagClass = window.Magnetometer;
    if (typeof MagClass !== 'function') {
      statusNote = 'Magnetometer not available here. On a phone, the free phyphox app ("Magnetometer" experiment) can record the same measurement.';
      magBtn.disabled = true;
      drawFrame();
      return;
    }
    try {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const p = await navigator.permissions.query({ name: 'magnetometer' });
          if (p.state === 'denied') throw new Error('denied');
        } catch (e) { /* some browsers do not support querying magnetometer permission */ }
      }
      const s = new MagClass({ frequency: 10 });
      let gotReading = false;
      const timeout = setTimeout(() => {
        if (!gotReading) {
          stopSensor();
          statusNote = 'Magnetometer not available here. On a phone, the free phyphox app ("Magnetometer" experiment) can record the same measurement.';
          magBtn.disabled = true;
          drawFrame();
        }
      }, 1600);
      s.addEventListener('reading', () => {
        gotReading = true;
        clearTimeout(timeout);
        if (!held && api.visible) {
          cur = { x: s.x || 0, y: s.y || 0, z: s.z || 0 };
          drawFrame();
        }
      });
      s.addEventListener('error', () => {
        clearTimeout(timeout);
        stopSensor();
        statusNote = 'Magnetometer not available here. On a phone, the free phyphox app ("Magnetometer" experiment) can record the same measurement.';
        magBtn.disabled = true;
        drawFrame();
      });
      s.start();
      sensor = s;
      sensorActive = true;
      magBtn.textContent = 'Stop the magnetometer';
      magBtn.setAttribute('aria-pressed', 'true');
      statusNote = 'Reading live magnetometer on this device (nothing is stored or sent).';
      drawFrame();
    } catch (e) {
      stopSensor();
      statusNote = 'Magnetometer not available here. On a phone, the free phyphox app ("Magnetometer" experiment) can record the same measurement.';
      magBtn.disabled = true;
      drawFrame();
    }
  }, { pressed: false });

  // Control 2: Hold button
  const holdBtn = api.button('Hold', () => {
    held = !held;
    holdBtn.textContent = held ? 'Release hold' : 'Hold';
    holdBtn.setAttribute('aria-pressed', String(held));
    drawFrame();
  }, { pressed: false });

  api.onHide(stopSensor);
  api.onCleanup(stopSensor);

  const axes=api.canvas(640,140,'Phone lying flat with x and y screen-plane axes and z pointing out of the screen');
  function drawAxes(){const ctx=axes.ctx;axes.clear(c.plate);ctx.strokeStyle=c.ink;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(36,28,126,72,9);ctx.stroke();ctx.strokeStyle=c.rule;ctx.strokeRect(45,35,108,55);
    api.draw.arrow(ctx,98,63,191,63,c.proton,2,7);label(ctx,c,'+x',199,67,{size:12,color:c.proton});
    api.draw.arrow(ctx,98,63,98,13,c.electron,2,7);label(ctx,c,'+y',108,19,{size:12,color:c.electron});
    ctx.fillStyle=c.ink;ctx.beginPath();ctx.arc(98,63,3,0,2*Math.PI);ctx.fill();ctx.beginPath();ctx.arc(98,63,9,0,2*Math.PI);ctx.strokeStyle=c.ink;ctx.stroke();label(ctx,c,'⊙ +z out of screen',35,123,{size:12});
    label(ctx,c,'SCREEN UP · PHONE FLAT',269,35,{size:12,weight:600});label(ctx,c,'x and y → horizontal components',269,65,{size:13});label(ctx,c,'−z → down (only in this orientation)',269,88,{size:13});label(ctx,c,'Rotation changes components, not total field.',269,115,{size:12,color:c.muted});}

  function computeMetrics() {
    const horiz = Math.hypot(cur.x, cur.y);
    const vert = -cur.z;
    const total = Math.hypot(cur.x, cur.y, cur.z);
    const dipDeg = (Math.atan2(vert, Math.max(1e-6, horiz)) * 180) / Math.PI;
    return {
      total: Math.round(total),
      horiz: Math.round(horiz),
      vert: Math.round(vert),
      dip: Math.round(dipDeg),
      rawTotal: total,
      rawDip: dipDeg,
    };
  }

  function drawFrame() {
    const ctx = k.ctx;
    k.clear(c.plate);
    const m = computeMetrics();
    drawAxes();

    // Reminder note at top
    api.draw.text(ctx, statusNote, 24, 22, {
      size: 11, color: statusNote.startsWith('Magnetometer not') ? c.proton : c.muted,
    });

    // Left panel (x = 24..370): Three-bar display (Total, Horizontal, Down) with WMM2025 Mumbai reference marks
    const bars = [
      { label: 'Total |B|', val: m.total, wmm: WMM.total, col: c.ink },
      { label: 'Horizontal', val: m.horiz, wmm: WMM.horiz, col: c.electron },
      { label: m.vert>=0?'Down':'Up', val: Math.abs(m.vert), wmm: WMM.down, col: c.proton },
    ];
    const maxScale = Math.max(80, m.total * 1.15);
    const barX = 135, barW = 190;

    api.draw.text(ctx, sensorActive ? 'Live reading vs Mumbai WMM2025' : 'Mumbai WMM2025 reference (press button for live sensor)', 24, 48, {
      size: 12, color: c.ink, weight: 700,
    });

    for (let i = 0; i < bars.length; i++) {
      const b = bars[i];
      const y = 70 + i * 58;
      api.draw.text(ctx, b.label, 24, y + 16, { size: 12, color: c.ink, weight: 600 });

      // Track background
      ctx.fillStyle = c.sheet;
      ctx.strokeStyle = c.rule;
      ctx.lineWidth = 1;
      api.draw.roundRect(ctx, barX, y, barW, 24, 4);
      ctx.fill();
      ctx.stroke();

      // Filled bar
      const fillW = Math.min(barW, (b.val / maxScale) * barW);
      ctx.fillStyle = b.col;
      ctx.globalAlpha = 0.82;
      api.draw.roundRect(ctx, barX, y, Math.max(4, fillW), 24, 4);
      ctx.fill();
      ctx.globalAlpha = 1;

      // WMM2025 reference tick mark
      const wmmX = barX + (b.wmm / maxScale) * barW;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wmmX, y - 4);
      ctx.lineTo(wmmX, y + 28);
      ctx.stroke();
      api.draw.text(ctx, `WMM ${b.wmm} μT`, wmmX, y + 40, { size: 12, color: c.muted, align: 'center' });

      // Value readout at right of bar
      api.draw.text(ctx, `${b.val} μT`, barX + barW + 10, y + 17, {
        size: 12, color: b.col, weight: 700,
      });
    }

    // Right panel (x = 408..616): Dip angle diagram (horizontal vs downward component)
    const boxX = 408, boxY = 48, boxW = 208, boxH = 212;
    ctx.fillStyle = c.sheet;
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1;
    api.draw.roundRect(ctx, boxX, boxY, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    api.draw.text(ctx, `Dip angle: ${m.dip}° (Mumbai WMM: 28°)`, boxX + boxW / 2, boxY + 22, {
      size: 11.5, color: c.ink, align: 'center', weight: 700,
    });

    const ox = boxX + 36, oy = boxY + 100;
    const vecLen = 90;
    const dipRad = (m.rawDip * Math.PI) / 180;
    const hx = ox + vecLen * Math.cos(dipRad);
    const vy = oy + vecLen * Math.sin(dipRad);

    // Horizontal ground line
    ctx.strokeStyle = c.rule;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox - 10, oy);
    ctx.lineTo(boxX + boxW - 18, oy);
    ctx.stroke();

    // Dashed rectangle components
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = c.muted;
    ctx.beginPath();
    ctx.moveTo(hx, oy);
    ctx.lineTo(hx, vy);
    ctx.lineTo(ox, vy);
    ctx.stroke();
    ctx.restore();

    // Horizontal arrow (compass part)
    api.draw.arrow(ctx, ox, oy, hx, oy, c.electron, 2.2, 7);
    api.draw.text(ctx, `Horizontal ${m.horiz} μT`, (ox + hx) / 2, oy - 8, {
      size: 10.5, color: c.electron, align: 'center', weight: 600,
    });

    // Vertical (down) arrow
    api.draw.arrow(ctx, ox, oy, ox, vy, c.proton, 2.2, 7);
    api.draw.text(ctx, `${m.vert>=0?'Down':'Up'} ${Math.abs(m.vert)} μT`, ox + 8, (oy + vy) / 2 + 4, {
      size: 10.5, color: c.proton, weight: 600,
    });

    // Total B vector arrow
    api.draw.arrow(ctx, ox, oy, hx, vy, c.ink, 2.6, 8);
    api.draw.text(ctx, `|B| = ${m.total} μT`, hx - 6, vy + 18, {
      size: 11, color: c.ink, align: 'right', weight: 700,
    });

    // Dip angle arc
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(ox, oy, 34, Math.min(0,dipRad), Math.max(0,dipRad));
    ctx.stroke();
    api.draw.text(ctx, `${m.dip}°`, ox + 42, oy + 16, { size: 11, color: c.ink, weight: 600 });

    label(ctx,c,`Sensor axes: x ${cur.x.toFixed(1)} · y ${cur.y.toFixed(1)} · z ${cur.z.toFixed(1)} μT`,24,278,{size:12,color:c.muted});

    // Readout
    if (m.rawTotal > 150) {
      say(
        `Total |B| = ${m.total} μT (horizontal ${m.horiz} μT, vertical ${m.vert} μT, dip ${m.dip}°): ` +
        `because |B| exceeds 150 μT, a magnet or steel is nearby, swamping the Earth's field ` +
        `(Mumbai WMM2025 expectation: total 43.6 μT, horizontal 38.4 μT, down 20.7 μT, dip 28°).`
      );
    } else {
      say(
        `Total |B| = ${m.total} μT, horizontal = ${m.horiz} μT, vertical (down) = ${m.vert} μT, dip = ${m.dip}° ` +
        `(Mumbai WMM2025 reference: total 43.6 μT, horizontal 38.4 μT, down 20.7 μT, dip 28°). ` +
        `Horizontal and vertical components require the phone to lie flat; phone magnetometers are uncalibrated and nearby steel (table legs, phone parts) shifts the reading, so agreement within about 10 μT is good.`
      );
    }
  }

  api.loop(() => {
    drawFrame();
  });

  drawFrame();
  return { destroy() { stopSensor(); } };
}, { label: 'Read the magnetic field' });
