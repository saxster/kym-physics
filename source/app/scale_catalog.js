export const RUNGS = [
  {
    exp: -15,
    name: 'Proton',
    label: 'Proton 10⁻¹⁵ m',
    sizeText: '1 femtometre (0.000 000 000 000 001 m)',
    kind: 'proton',
    story: 'A single proton (the nucleus of a hydrogen atom) is about 10⁻¹⁵ m across. Rutherford discovered in 1911 that almost all of an atom’s mass sits in this tiny core.',
    chapter: 'Chapters 0.3 & 15.2',
  },
  {
    exp: -10,
    name: 'Hydrogen atom',
    label: 'Hydrogen atom 10⁻¹⁰ m',
    sizeText: '0.1 nanometres (100,000 protons wide)',
    kind: 'atom',
    story: 'Five steps of ×10 wider than a proton. If the proton at the centre were a 1 cm marble on your floor, the electron cloud would reach half a kilometre away in every direction.',
    chapter: 'Chapters 0.3 & 15.2',
  },
  {
    exp: -6,
    name: 'Visible light wave',
    label: 'Visible light wave 10⁻⁶ m',
    sizeText: 'About 0.5 micrometres (500 nm)',
    kind: 'wave',
    story: 'A single wavelength of green-red sunlight is just under one micrometre, about 10,000 atoms wide. Soap-bubble films of this thickness glow with interference colours.',
    chapter: 'Chapters 0.3 & 11.5',
  },
  {
    exp: -3,
    name: 'Grain of sand',
    label: 'Grain of sand 10⁻³ m',
    sizeText: '1 millimetre (0.001 m)',
    kind: 'sand',
    story: 'A coarse grain of Juhu beach sand or a mustard seed sits at 1 millimetre: three steps of ÷10 smaller than you, and a thousand times wider than a light wave.',
    chapter: 'Chapter 0.3',
  },
  {
    exp: 0,
    name: 'You (Kym)',
    label: 'You (Kym) 10⁰ m',
    sizeText: '1 metre (human scale)',
    kind: 'human',
    story: 'Any number to the zeroth power is 1, so 10⁰ m is 1 metre: roughly the height of your desk or a long stride. This is our home rung on the ladder.',
    chapter: 'Chapter 0.3',
  },
  {
    exp: 7,
    name: 'Earth',
    label: 'Earth 10⁷ m',
    sizeText: '12,742 km diameter (~10⁷ m)',
    kind: 'earth',
    story: 'Seven steps of ×10 up from you. Eratosthenes measured Earth’s circumference with two sticks and a shadow in Alexandria and Syene.',
    chapter: 'Chapters 0.1, 0.3 & 5.1',
  },
  {
    exp: 9,
    name: 'Sun',
    label: 'Sun 10⁹ m',
    sizeText: '1.39 million km diameter (~10⁹ m)',
    kind: 'sun',
    story: 'Two steps of ×10 wider than Earth (about 109 Earth diameters across). Its hot plasma core fuses 600 million tonnes of hydrogen every second.',
    chapter: 'Chapters 0.3 & 15.3',
  },
  {
    exp: 11,
    name: 'Earth–Sun',
    label: 'Earth–Sun 10¹¹ m',
    sizeText: '149.6 million km (1 AU, ~1.5 × 10¹¹ m)',
    kind: 'orbit',
    story: 'Two more steps of ×10 take us from the Sun’s width to the width of Earth’s orbit around it. Light takes about 8 minutes and 20 seconds to cross this radius.',
    chapter: 'Chapters 0.3, 5.3 & 14.2',
  },
  {
    exp: 16,
    name: 'One light-year',
    label: 'One light-year 10¹⁶ m',
    sizeText: '9.46 × 10¹⁵ m (~10¹⁶ m)',
    kind: 'lightyear',
    story: 'The distance light travels in one Julian year. The nearest star beyond the Sun, Proxima Centauri, sits at 4.25 light-years (about 4 × 10¹⁶ m).',
    chapter: 'Chapters 0.3 & 15.5',
  },
  {
    exp: 21,
    name: 'Milky Way',
    label: 'Milky Way 10²¹ m',
    sizeText: 'About 100,000 light-years (~10²¹ m)',
    kind: 'galaxy',
    story: 'Five steps of ×10 wider than a single light-year: our home galaxy of over a hundred billion stars, turning slowly in a flat spiral disc.',
    chapter: 'Chapters 0.3 & 15.7',
  },
];

export function drawRungIcon(ctx, kind, cx, cy, r, col) {
  if (r < 1.5 || r > 4000) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (kind === 'proton') {
    ctx.fillStyle = col.protonWash;
    ctx.strokeStyle = col.proton;
    ctx.lineWidth = Math.max(1.2, Math.min(3, r * 0.06));
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (r > 12) {
      const qr = r * 0.22;
      const pts = [[0, -r * 0.42], [-r * 0.38, r * 0.28], [r * 0.38, r * 0.28]];
      pts.forEach(([qx, qy], i) => {
        ctx.beginPath();
        ctx.fillStyle = i < 2 ? col.proton : col.electron;
        ctx.arc(qx, qy, qr, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  } else if (kind === 'atom') {
    const grad = ctx.createRadialGradient(0, 0, r * 0.05, 0, 0, r);
    grad.addColorStop(0, col.electronWash);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = col.electron;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = col.proton;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2.5, r * 0.04), 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'wave') {
    ctx.strokeStyle = col.neutron;
    ctx.lineWidth = Math.max(1.6, Math.min(3.2, r * 0.08));
    ctx.beginPath();
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 - 1;
      const x = t * r;
      // The full horizontal span 2r represents one wavelength.
      const y = Math.sin((t + 1) * Math.PI) * r * 0.38;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else if (kind === 'sand') {
    ctx.fillStyle = col.neutronWash;
    ctx.strokeStyle = col.neutron;
    ctx.lineWidth = Math.max(1.2, Math.min(2.4, r * 0.05));
    ctx.beginPath();
    const angles = [0.1, 1.1, 2.0, 2.9, 3.8, 4.9, 5.7];
    const rads = [0.92, 0.85, 0.96, 0.82, 0.9, 0.88, 0.95];
    angles.forEach((a, i) => {
      const px = Math.cos(a) * r * rads[i];
      const py = Math.sin(a) * r * rads[i];
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'human') {
    ctx.strokeStyle = col.ink;
    ctx.fillStyle = col.ink;
    const lw = Math.max(1.5, Math.min(3.5, r * 0.07));
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    const headR = r * 0.16;
    ctx.beginPath();
    ctx.arc(0, -r * 0.62, headR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.46);
    ctx.lineTo(0, r * 0.18);
    ctx.moveTo(-r * 0.38, -r * 0.18);
    ctx.lineTo(r * 0.38, -r * 0.18);
    ctx.moveTo(0, r * 0.18);
    ctx.lineTo(-r * 0.28, r * 0.82);
    ctx.moveTo(0, r * 0.18);
    ctx.lineTo(r * 0.28, r * 0.82);
    ctx.stroke();
  } else if (kind === 'earth') {
    ctx.fillStyle = col.electronWash;
    ctx.strokeStyle = col.electron;
    ctx.lineWidth = Math.max(1.4, Math.min(3, r * 0.05));
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (r > 10) {
      ctx.strokeStyle = col.green;
      ctx.lineWidth = Math.max(1, r * 0.03);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.98, r * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = col.proton;
      ctx.beginPath();
      ctx.arc(r * 0.22, -r * 0.28, Math.max(2, r * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'sun') {
    const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.15);
    grad.addColorStop(0, col.neutron);
    grad.addColorStop(0.75, col.neutronWash);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = col.neutron;
    ctx.lineWidth = Math.max(1.5, Math.min(3, r * 0.05));
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'orbit') {
    // The declared dimension is Sun-to-Earth distance, not orbital diameter.
    ctx.strokeStyle = col.electron;
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = col.neutron;
    ctx.beginPath();
    ctx.arc(-r, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = col.electron;
    ctx.beginPath();
    ctx.arc(r, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'lightyear') {
    // A light-year is a distance: the endpoint separation is one light-year.
    ctx.strokeStyle = col.green;
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = col.green;
    for (const x of [-r, r]) {
      ctx.beginPath();
      ctx.arc(x, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'galaxy') {
    ctx.strokeStyle = col.proton;
    ctx.lineWidth = Math.max(1.4, Math.min(3.2, r * 0.05));
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      for (let t = 0.15; t <= 1; t += 0.04) {
        const a = t * Math.PI * 2.2 + arm * Math.PI;
        const rad = t * r * 0.92;
        const x = Math.cos(a) * rad;
        const y = Math.sin(a) * rad * 0.68;
        if (t === 0.15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = col.neutron;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(3, r * 0.16), Math.max(2, r * 0.09), 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
