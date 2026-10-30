export function text(ctx,c,s,x,y,size=15){ctx.fillStyle=c;ctx.font=`${size}px sans-serif`;ctx.textAlign='left';ctx.fillText(s,x,y);}
export function line(ctx,c,pts,width=2,dash=[]){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);}
export function circle(ctx,c,x,y,r,fill=false){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=c;ctx.fill();}else{ctx.strokeStyle=c;ctx.lineWidth=2;ctx.stroke();}}
export function rect(ctx,c,x,y,w,h,fill=false){ctx.fillStyle=c;ctx.strokeStyle=c;ctx.lineWidth=2;if(fill)ctx.fillRect(x,y,w,h);else ctx.strokeRect(x,y,w,h);}
export function arrow(ctx,c,x,y,dx,dy,label=''){
 line(ctx,c,[[x,y],[x+dx,y+dy]]);const a=Math.atan2(dy,dx);line(ctx,c,[[x+dx-8*Math.cos(a-.45),y+dy-8*Math.sin(a-.45)],[x+dx,y+dy],[x+dx-8*Math.cos(a+.45),y+dy-8*Math.sin(a+.45)]]);
 if(label)text(ctx,c,label,x+dx+8,y+dy);
}
export function plot(ctx,c,series,{xmin=0,xmax=1,ymax=1,xlabel='',ylabel='',x=65,y=50,w=505,h=180}={}){
 line(ctx,c.ink,[[x,y],[x,y+h],[x+w,y+h]],1);
 text(ctx,c.ink,ylabel,x,y-12,13);text(ctx,c.ink,xlabel,x+w/3,y+h+38,13);
 text(ctx,c.ink,Number(ymax.toPrecision(3)).toString(),5,y+12,12);text(ctx,c.ink,Number(xmax.toPrecision(3)).toString(),x+w-15,y+h+20,12);text(ctx,c.ink,'0',x-20,y+h+20,12);
 for(const s of series)line(ctx,s.color,s.points.map(([a,b])=>[x+(a-xmin)/(xmax-xmin)*w,y+h-b/ymax*h]),s.width||2,s.dash||[]);
}
export function controls(api,lab){
 const s={};
 return {s,slider(key,label,min,max,step,value,unit=''){
  s[key]=value;return api.slider(label,{min,max,step,value,fmt:v=>`${Number(v.toFixed(4))} ${unit}`.trim(),onInput:v=>{s[key]=v;lab.refresh();}});
 },tabs(labels,key='mode',start=0){s[key]=start;api.tabs(labels,i=>{s[key]=i;lab.refresh();},start);},
 clock(max=4){
  s.time=0;const ctl=api.slider('Replay time',{min:0,max,step:max/200,value:0,fmt:v=>`${v.toFixed(2)} s`,onInput:v=>{s.time=v;lab.refresh();}});
  api.playback(true);api.loop(dt=>{if(dt>0){s.time=Math.min(max,s.time+dt*.5);ctl.set(s.time);if(s.time>=max)api.pause();lab.refresh();}});
  api.button('Reset time',()=>{s.time=0;ctl.set(0);api.pause();lab.refresh();});
 }};
}
