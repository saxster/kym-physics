// Three's CSS parser does not accept color(display-p3 ...). Let the browser
// convert CSS Color 4 values into the sRGB space used by our canvas/WebGL views.
// https://html.spec.whatwg.org/multipage/canvas.html#color-spaces-and-color-space-conversion
export function makeColourResolver(createCanvas) {
  const converted = new Map();
  let context;
  return style => {
    if (!/^color\(/i.test(style)) return style;
    if (converted.has(style)) return converted.get(style);
    if (!context) {
      const canvas = createCanvas();
      canvas.width = canvas.height = 1;
      context = canvas.getContext('2d', {colorSpace:'srgb', willReadFrequently:true});
    }
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = style;
    context.fillRect(0, 0, 1, 1);
    const bytes = context.getImageData(0, 0, 1, 1, {colorSpace:'srgb'}).data;
    const result = '#' + Array.from(bytes).slice(0, 3).map(v => v.toString(16).padStart(2, '0')).join('');
    converted.set(style, result);
    return result;
  };
}
