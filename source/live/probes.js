// Draggable Virtual Instruments & PDOM Mirrors (Strobe Path Probe & Reference Height Datum).
// Pairs crisp Canvas pointer/touch dragging with a visually-hidden native range control
// so keyboard & VoiceOver learners inspect every measurement 1:1.
import { draw } from './core.js';
import { setRole } from './draft_canvas.js';

// Records timed strobe breadcrumbs along a trajectory and renders an interactive crosshair probe.
export function createPathProbe(stage, api, {
  maxDots = 40,
  dotInterval = 0.14,
  formatCard,
  onSelect,
} = {}) {
  const dots = [];
  let accum = 0;
  let selectedIdx = -1;
  let dragging = false;

  // PDOM accessibility mirror
  const pdomWrap = document.createElement('label');
  pdomWrap.className = 'live-pdom-sr';
  pdomWrap.textContent = 'Inspect strobe path point';
  const pdomRange = document.createElement('input');
  pdomRange.type = 'range';
  pdomRange.min = '0';
  pdomRange.max = '0';
  pdomRange.step = '1';
  pdomRange.value = '0';
  pdomRange.setAttribute('aria-label', 'Inspect strobe path measurement dot');
  pdomWrap.appendChild(pdomRange);
  (api.controls || stage).appendChild(pdomWrap);

  const syncPdom = () => {
    pdomRange.max = String(Math.max(0, dots.length - 1));
    if (selectedIdx >= 0 && selectedIdx < dots.length) {
      pdomRange.value = String(selectedIdx);
      const txt = formatCard ? formatCard(dots[selectedIdx]).join(', ') : `Point ${selectedIdx + 1}`;
      pdomRange.setAttribute('aria-valuetext', txt);
    } else {
      pdomRange.setAttribute('aria-valuetext', `${dots.length} path points recorded`);
    }
  };

  pdomRange.addEventListener('input', () => {
    if (!dots.length) return;
    selectedIdx = Math.max(0, Math.min(dots.length - 1, +pdomRange.value));
    syncPdom();
    onSelect?.(dots[selectedIdx]);
    api.redraw?.();
  });

  api.onCleanup(() => pdomWrap.remove());

  return {
    get dots() { return dots; },
    get selected() { return selectedIdx >= 0 ? dots[selectedIdx] : null; },
    clear() {
      dots.length = 0;
      accum = 0;
      selectedIdx = -1;
      syncPdom();
    },
    record(dt, sample) {
      if (dt <= 0) {
        if (!dots.length && sample) {
          dots.push(sample);
          syncPdom();
        }
        return;
      }
      accum += dt;
      if (accum >= dotInterval || !dots.length) {
        accum = 0;
        const prev = dots[dots.length - 1];
        if (!prev || Math.hypot(prev.cx - sample.cx, prev.cy - sample.cy) > 3) {
          dots.push(sample);
          if (dots.length > maxDots) dots.shift();
          syncPdom();
        }
      }
    },
    hitTest(px, py, radius = 20) {
      let best = -1;
      let bestD = radius;
      for (let i = 0; i < dots.length; i++) {
        const d = Math.hypot(dots[i].cx - px, dots[i].cy - py);
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    },
    setDragging(on) { dragging = !!on; },
    get dragging() { return dragging; },
    selectNear(px, py, radius = 24) {
      const idx = this.hitTest(px, py, radius);
      if (idx >= 0) {
        selectedIdx = idx;
        syncPdom();
        onSelect?.(dots[idx]);
      }
      return idx >= 0 ? dots[idx] : null;
    },
    clearSelection() {
      selectedIdx = -1;
    },
    draw(ctx, pal, bounds = { minX: 10, maxX: 430, minY: 12, maxY: 250 }) {
      if (!dots.length) return;
      ctx.save();
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const sel = i === selectedIdx;
        ctx.beginPath();
        ctx.arc(d.cx, d.cy, sel ? 5.5 : 3.0, 0, Math.PI * 2);
        ctx.fillStyle = sel ? pal.force : pal.pe;
        ctx.globalAlpha = sel ? 1 : 0.42;
        ctx.fill();
        if (sel) {
          ctx.lineWidth = 1.6;
          ctx.strokeStyle = pal.sheet;
          ctx.stroke();
        }
      }
      if (selectedIdx >= 0 && dots[selectedIdx]) {
        const d = dots[selectedIdx];
        ctx.globalAlpha = 1;
        // Crosshair reticle
        ctx.strokeStyle = pal.force;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(d.cx, d.cy, 10, 0, Math.PI * 2);
        ctx.moveTo(d.cx - 14, d.cy); ctx.lineTo(d.cx - 6, d.cy);
        ctx.moveTo(d.cx + 6, d.cy); ctx.lineTo(d.cx + 14, d.cy);
        ctx.moveTo(d.cx, d.cy - 14); ctx.lineTo(d.cx, d.cy - 6);
        ctx.moveTo(d.cx, d.cy + 6); ctx.lineTo(d.cx, d.cy + 14);
        ctx.stroke();

        // Compact readout card positioned inside track bounds
        if (formatCard) {
          const lines = formatCard(d);
          const cw = 136;
          const ch = 14 + lines.length * 14;
          const cx = Math.max(bounds.minX, Math.min(bounds.maxX - cw, d.cx + 14));
          const cy = Math.max(bounds.minY, Math.min(bounds.maxY - ch, d.cy - ch - 8));
          draw.roundRect(ctx, cx, cy, cw, ch, 5);
          ctx.fillStyle = pal.sheet;
          ctx.fill();
          ctx.strokeStyle = pal.force;
          ctx.lineWidth = 1.3;
          ctx.stroke();
          lines.forEach((ln, li) => {
            draw.text(ctx, ln, cx + 8, cy + 16 + li * 14, {
              size: 10.5,
              color: li === 0 ? pal.force : pal.ink,
              weight: li === 0 ? 700 : 500,
            });
          });
        }
      }
      ctx.restore();
    },
  };
}

// Draggable horizontal reference datum line (e.g. h = 0 potential energy zero) with PDOM mirror.
export function createReferenceLine(stage, api, {
  label = 'Reference height h = 0',
  min = 0,
  max = 1.2,
  step = 0.1,
  value = 0,
  onChange,
} = {}) {
  let val = value;
  let dragging = false;

  const pdomWrap = document.createElement('label');
  pdomWrap.className = 'live-pdom-sr';
  pdomWrap.textContent = label;
  const inp = document.createElement('input');
  inp.type = 'range';
  inp.min = String(min);
  inp.max = String(max);
  inp.step = String(step);
  inp.value = String(value);
  inp.setAttribute('aria-label', label);
  inp.setAttribute('aria-valuetext', `${value.toFixed(1)} m`);
  pdomWrap.appendChild(inp);
  (api.controls || stage).appendChild(pdomWrap);

  const set = (next) => {
    const clamped = Math.max(min, Math.min(max, Math.round(next / step) * step));
    val = +clamped.toFixed(2);
    inp.value = String(val);
    inp.setAttribute('aria-valuetext', `${val.toFixed(1)} m`);
    onChange?.(val);
    api.redraw?.();
  };
  inp.addEventListener('input', () => set(+inp.value));
  api.onCleanup(() => pdomWrap.remove());

  return {
    get value() { return val; },
    set,
    get dragging() { return dragging; },
    setDragging(on) { dragging = !!on; },
    hitTest(px, py, xLeft, xRight, yLine) {
      return px >= xLeft - 24 && px <= xRight + 10 && Math.abs(py - yLine) <= 13;
    },
    draw(ctx, x0, x1, y, pal) {
      ctx.save();
      setRole(ctx, 'centerline', pal.friction);
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      // Tactile datum grip handle on left margin
      draw.roundRect(ctx, x0 - 22, y - 9, 44, 18, 4);
      ctx.fillStyle = dragging ? pal.friction : pal.sheet;
      ctx.fill();
      ctx.strokeStyle = pal.friction;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      draw.text(ctx, `h₀=${val.toFixed(1)}`, x0, y + 3.5, {
        size: 9.5,
        color: dragging ? pal.sheet : pal.friction,
        align: 'center',
        weight: 700,
      });
      ctx.restore();
    },
  };
}
