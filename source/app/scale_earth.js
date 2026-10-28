// The same public-domain Natural Earth geography used by the adventure map.
import { geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/land-110m.json';
const land = feature(world, world.objects.land);
export function drawEarth(ctx, x, y, radius, palette) {
  const projection = geoOrthographic().translate([x,y]).scale(radius).rotate([-75,-15]).clipAngle(90);
  const path = geoPath(projection,ctx);
  ctx.save();
  ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fillStyle=palette.electronWash;ctx.fill();
  ctx.beginPath();path(land);ctx.fillStyle=palette.green;ctx.fill();
  ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.strokeStyle=palette.electron;ctx.lineWidth=1.5;ctx.stroke();
  ctx.restore();
}
