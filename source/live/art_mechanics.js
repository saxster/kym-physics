// Original textbook apparatus marks. Drawings are schematic; measurements stay in each model.
export function mechanismKey(stage, heading, items) {
  const box=document.createElement('div');
  box.className='live-mechanism-key';
  box.style.cssText='padding:.7rem .9rem;border-top:1px solid var(--rule);font:13px/1.5 var(--sans);background:var(--sheet);color:var(--ink)';
  const title=document.createElement('strong'); title.textContent=heading; box.append(title);
  const list=document.createElement('ul');list.style.cssText='margin:.35rem 0 0;padding-left:1.1rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.3rem 1.2rem';
  for(const item of items){const li=document.createElement('li');li.textContent=item;list.append(li);}
  box.append(list);stage.append(box);return box;
}
export function person(ctx,x,feet,h,col) {
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.lineCap='round';
  const head=feet-h*.83,r=h*.105;
  ctx.beginPath();ctx.arc(x,head,r,0,2*Math.PI);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,head+r);ctx.lineTo(x,feet-h*.33);
  ctx.moveTo(x-h*.18,feet);ctx.lineTo(x,feet-h*.33);ctx.lineTo(x+h*.18,feet);
  ctx.moveTo(x-h*.20,feet-h*.43);ctx.lineTo(x,feet-h*.61);ctx.lineTo(x+h*.20,feet-h*.43);ctx.stroke();ctx.restore();
}
export function hatch(ctx,x,y,w,h,col,spacing=8) {
  if(w<=0||h<=0)return;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.strokeStyle=col;ctx.globalAlpha=.45;ctx.lineWidth=1;
  for(let d=-h;d<w;d+=spacing){ctx.beginPath();ctx.moveTo(x+d,y+h);ctx.lineTo(x+d+h,y);ctx.stroke();}ctx.restore();
}
export function dimension(ctx,x1,y1,x2,y2,col) {
  const dx=x2-x1,dy=y2-y1,n=Math.hypot(dx,dy)||1,ox=-dy/n*4,oy=dx/n*4;
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.moveTo(x1-ox,y1-oy);ctx.lineTo(x1+ox,y1+oy);ctx.moveTo(x2-ox,y2-oy);ctx.lineTo(x2+ox,y2+oy);ctx.stroke();ctx.restore();
}
export function coin(ctx,x,y,r,fill,ink) {
  ctx.save();ctx.fillStyle=fill;ctx.strokeStyle=ink;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(x,y,r*.65,0,Math.PI*2);ctx.stroke();ctx.restore();
}
export function phone(ctx,x,y,w,h,c) {
  ctx.save();ctx.fillStyle=c.sheet;ctx.strokeStyle=c.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();ctx.stroke();
  ctx.fillStyle=c.electron;ctx.globalAlpha=.13;ctx.fillRect(x+4,y+6,w-8,h-12);ctx.globalAlpha=1;
  ctx.beginPath();ctx.moveTo(x+w*.35,y+3);ctx.lineTo(x+w*.65,y+3);ctx.stroke();ctx.restore();
}
