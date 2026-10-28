// Pure length and view-width calculations shared by the scale explorer and its tests.
export const MIN_EXP = -15;
// One extra framing step lets the full Milky Way fit in a landscape viewport.
export const MAX_EXP = 22;
const LIGHT_YEAR = 9.4607304725808e15; // metres; Julian year, c = 299 792 458 m/s
const AU = 149597870700; // metres; exact IAU astronomical unit
const SUPERSCRIPT = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

function finite(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${label} must be a finite number`);
  return value;
}

export function clampExp(exp) {
  return Math.max(MIN_EXP, Math.min(MAX_EXP, finite(exp, 'Exponent')));
}

export function widthAt(exp) {
  return 10 ** finite(exp, 'Exponent');
}

// Base repeated presses on the destination, so a press during an animation is never lost.
export function stepTarget(currentTarget, direction) {
  if (direction !== -1 && direction !== 1) throw new RangeError('Direction must be -1 or 1');
  return clampExp(finite(currentTarget, 'Current target') + direction);
}

function number(value) {
  return Number(value.toPrecision(3)).toLocaleString('en-GB', { maximumFractionDigits: 12 });
}

export function formatPower(exp) {
  const rounded = Math.round(finite(exp, 'Exponent') * 100) / 100;
  return '10' + String(Object.is(rounded, -0) ? 0 : rounded).split('').map(c => SUPERSCRIPT[c] || c).join('');
}

export function formatWidth(exp) {
  const metres = widthAt(exp);
  if (metres < 1e-12) return `${number(metres / 1e-15)} fm`;
  if (metres < 1e-6) return `${number(metres / 1e-9)} nm`;
  if (metres < 1e-3) return `${number(metres / 1e-6)} µm`;
  if (metres < 1) return `${number(metres / 1e-3)} mm`;
  if (metres < 1e3) return `${number(metres)} m`;
  if (metres < 1e10) return `${number(metres / 1e3)} km`;
  if (metres < 1e15) return `${number(metres / AU)} AU`;
  const years = metres / LIGHT_YEAR;
  return `${number(years)} light-year${Math.abs(years - 1) < 1e-12 ? '' : 's'}`;
}

// Leave 20% of the frame free around a landmark; the landmark's size is not rounded to a power of ten.
export function fitExponent(sizeMetres) {
  finite(sizeMetres, 'Landmark size');
  if (sizeMetres <= 0) throw new RangeError('Landmark size must be positive');
  return clampExp(Math.log10(sizeMetres * 1.25));
}

export function ratioText(exp, reference = 0) {
  const difference = finite(exp, 'Exponent') - finite(reference, 'Reference exponent');
  if (Math.abs(difference) < 1e-9) return 'Your starting view';
  const magnitude = Math.abs(difference);
  const factor = magnitude <= 6 ? number(10 ** magnitude) : formatPower(magnitude);
  return `${factor}× ${difference > 0 ? 'wider' : 'smaller'} than your starting view`;
}
