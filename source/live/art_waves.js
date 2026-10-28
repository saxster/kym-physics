// Small explanatory drawings shared by the wave, light and field figures.
// All dimensions are logical canvas units. Colour is paired with labels or symbols.
export function panel(ctx, c, x, y, w, h, title) {
  ctx.fillStyle = c.sheet; ctx.strokeStyle = c.rule; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 7); ctx.fill(); ctx.stroke();
  label(ctx, c, title, x + 12, y + 23, { weight: 600 });
}
export function label(ctx, c, text, x, y, {size=13,align='left',weight=400,color=c.ink}={}) {
  ctx.fillStyle=color;ctx.font=`${weight} ${size}px Lexend,system-ui,sans-serif`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(text,x,y);
}
export function note(stage, text) {
  const p=document.createElement('p');p.className='live-model-note';
  p.style.cssText='font:13px/1.5 var(--sans);color:var(--ink-2);margin:0;padding:10px 14px;border-top:1px solid var(--rule);background:var(--sheet)';
  p.textContent=text;stage.append(p);return p;
}
export function legend(stage, items) {
  const row=document.createElement('div');row.className='live-visual-key';row.setAttribute('aria-label','Diagram key');
  row.style.cssText='display:flex;flex-wrap:wrap;gap:8px 18px;padding:10px 14px;font:13px/1.4 var(--sans);color:var(--ink);background:var(--sheet)';
  for(const [text,colour,dashed=false] of items){
    const item=document.createElement('span'),swatch=document.createElement('i');
    item.style.cssText='display:inline-flex;align-items:center;gap:7px';
    swatch.setAttribute('aria-hidden','true');swatch.style.cssText=`display:inline-block;width:22px;border-top:3px ${dashed?'dashed':'solid'} ${colour}`;
    item.append(swatch,document.createTextNode(text));row.append(item);
  }stage.append(row);return row;
}
export function eye(ctx,c,x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.beginPath();ctx.moveTo(-18,0);ctx.quadraticCurveTo(0,-18,18,0);ctx.quadraticCurveTo(0,18,-18,0);ctx.fillStyle=c.sheet;ctx.fill();ctx.strokeStyle=c.ink;ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,2.5,0,Math.PI*2);ctx.fillStyle=c.ink;ctx.fill();ctx.restore();}
export function person(ctx,c,x,y,h=64){ctx.save();ctx.strokeStyle=c.ink;ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.arc(x,y-h+8,7,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-h+16);ctx.lineTo(x,y-23);ctx.moveTo(x-12,y);ctx.lineTo(x,y-23);ctx.lineTo(x+12,y);ctx.moveTo(x-13,y-35);ctx.lineTo(x,y-h+26);ctx.lineTo(x+13,y-35);ctx.stroke();ctx.restore();}
export function phaseDisc(ctx,x,y,r,theta,day='#eadb9c',night='#303b37'){
  // Project a sunlit sphere: lit fraction (1-cos theta)/2; waxing on right.
  const t=((theta%(2*Math.PI))+2*Math.PI)%(2*Math.PI),wax=t<Math.PI,cos=Math.cos(t);
  ctx.save();ctx.fillStyle=night;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  if(Math.abs(t-Math.PI)<1e-8){ctx.fillStyle=day;ctx.fill();}
  else if(t>1e-8){
    ctx.fillStyle=day;ctx.beginPath();ctx.moveTo(x,y-r);
    // Outer limb: top to bottom along the lit side.
    ctx.arc(x,y,r,-Math.PI/2,Math.PI/2,!wax);
    const pts=50;
    for(let i=0;i<=pts;i++){
      const a=Math.PI/2-i*Math.PI/pts;
      const xx=x+(wax?1:-1)*cos*r*Math.cos(a),yy=y+r*Math.sin(a);
      ctx.lineTo(xx,yy);
    }
    ctx.closePath();ctx.fill();
  }
  ctx.strokeStyle='#718078';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.stroke();ctx.restore();
}
export function drawObject(ctx,c,kind,x,y,r,fill){
  ctx.save();ctx.translate(x,y);ctx.fillStyle=fill;ctx.strokeStyle=c.ink;ctx.lineWidth=1.7;
  ctx.beginPath();
  if(kind===0){ctx.moveTo(-r,-r*.2);ctx.quadraticCurveTo(0,r*.9,r,-r*.3);ctx.quadraticCurveTo(r*.5,r*1.4,-r*.65,r*.6);ctx.quadraticCurveTo(-r,r*.3,-r,-r*.2);}
  else if(kind===1){ctx.moveTo(-r,0);ctx.quadraticCurveTo(0,-r,r,-r*.6);ctx.quadraticCurveTo(r*.7,r*.8,-r,0);}
  else if(kind===2){ctx.moveTo(-r,-r*.75);ctx.lineTo(r,-r*.75);ctx.lineTo(r*.85,r*.7);ctx.quadraticCurveTo(0,r*.9,-r*.9,r*.7);ctx.closePath();}
  else {ctx.moveTo(-r*.35,-r);ctx.lineTo(-r*.85,-r*.65);ctx.lineTo(-r*.55,-r*.1);ctx.lineTo(-r*.35,-r*.28);ctx.lineTo(-r*.35,r);ctx.lineTo(r*.35,r);ctx.lineTo(r*.35,-r*.28);ctx.lineTo(r*.55,-r*.1);ctx.lineTo(r*.85,-r*.65);ctx.lineTo(r*.35,-r);ctx.quadraticCurveTo(0,-r*.6,-r*.35,-r);}
  ctx.fill();ctx.stroke();
  if(kind===0){ctx.beginPath();ctx.moveTo(-r,-r*.2);ctx.lineTo(-r*1.06,-r*.45);ctx.stroke();}
  if(kind===1){ctx.beginPath();ctx.moveTo(-r*.8,0);ctx.lineTo(r*.65,-r*.45);ctx.stroke();}
  if(kind===2){ctx.setLineDash([3,4]);ctx.strokeRect(-r*.7,-r*.55,r*1.35,r*.95);}
  ctx.restore();
}
