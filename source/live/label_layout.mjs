// Screen-space callouts: preserve the measured anchor while keeping text readable.
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const area = (a, b, gap) => Math.max(0, Math.min(a.x+a.w+gap,b.x+b.w)-Math.max(a.x-gap,b.x)) * Math.max(0,Math.min(a.y+a.h+gap,b.y+b.h)-Math.max(a.y-gap,b.y));
export function placeLabels(items, width, height, {padding=5,gap=3}={}) {
  const placed=[], result=Array(items.length);
  const order=items.map((p,i)=>({...p,i})).sort((a,b)=>a.y-b.y||a.x-b.x||a.i-b.i);
  for(const item of order){
    const w=Math.min(item.w,width-2*padding), h=Math.min(item.h,height-2*padding);
    const minY=Math.max(padding,item.minY||padding);
    const prefer={x:clamp(item.x,padding,width-w-padding),y:clamp(item.y,minY,height-h-padding),w,h};
    let best=null, bestScore=Infinity;
    const consider=(x,y)=>{
      const q={x:clamp(x,padding,width-w-padding),y:clamp(y,minY,height-h-padding),w,h};
      const overlap=placed.reduce((sum,p)=>sum+area(q,p,gap),0);
      const score=overlap*1e7+(q.x-prefer.x)**2+(q.y-prefer.y)**2;
      if(score<bestScore){best=q;bestScore=score;}
    };
    consider(prefer.x,prefer.y);
    if(bestScore>0){
      for(const dy of [0,-h-gap,h+gap,-2*(h+gap),2*(h+gap),-3*(h+gap),3*(h+gap)])
        for(const dx of [0,-w-gap,w+gap,-w/2-gap,w/2+gap]) consider(prefer.x+dx,prefer.y+dy);
      if(placed.some(p=>area(best,p,gap)>0))
        for(let y=minY;y<=height-h-padding;y+=Math.max(10,h+gap))
          for(let x=padding;x<=width-w-padding;x+=Math.max(10,w/2+gap))consider(x,y);
    }
    placed.push(best);result[item.i]=best;
  }
  let overlaps=0;
  for(let i=0;i<result.length;i++)for(let j=0;j<i;j++)if(area(result[i],result[j],1)>0)overlaps++;
  return {positions:result,overlaps};
}
