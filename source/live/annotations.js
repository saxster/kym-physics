// Live text callouts for calculated diagrams. Geometry retains its original aspect/scale.
import {placeLabels} from './label_layout.mjs';
const NS='http://www.w3.org/2000/svg';
const numericLabel=text=>/^(?:[+\-−]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+\-]?\d+)?[%°]?|∞)$/i.test(text.trim());
export function leaderLayer(host){
  const svg=document.createElementNS(NS,'svg');svg.classList.add('lab-label-guides');svg.setAttribute('aria-hidden','true');host.append(svg);return svg;
}
export function arrangeAnnotations(items,width,height,svg,{grow=false}={}){
  if(!width||!height)return 0;
  const specs=items.map(({node,x,y,preferredX=x,preferredY=y,minY,align='center',baseline='bottom',angle=0})=>{
    node.hidden=false;node.style.transform=`rotate(${angle}rad)`;
    const w=node.offsetWidth,h=node.offsetHeight,co=Math.abs(Math.cos(angle)),si=Math.abs(Math.sin(angle));
    const rw=w*co+h*si,rh=h*co+w*si;
    const px=align==='left'?preferredX:align==='right'?preferredX-rw:preferredX-rw/2;
    const py=baseline==='top'?preferredY:baseline==='middle'?preferredY-rh/2:preferredY-rh+3;
    return {x:px,y:py,w:rw,h:rh,nw:w,nh:h,minY};
  });
  let limit=Math.max(height+(grow?48:0),...specs.map(s=>(s.minY||0)+s.h+5)),layout=placeLabels(specs,width,limit);
  while(grow&&layout.overlaps&&limit<height+240){limit+=40;layout=placeLabels(specs,width,limit);}
  while(svg.children.length<items.length){const line=document.createElementNS(NS,'line');line.setAttribute('stroke-dasharray','2 3');svg.append(line);}
  let bottom=height;
  items.forEach((item,i)=>{
    const p=layout.positions[i],s=specs[i];
    item.node.style.left=(p.x+(p.w-s.nw)/2)+'px';item.node.style.top=(p.y+(p.h-s.nh)/2)+'px';
    const line=svg.children[i],endX=Math.max(p.x,Math.min(p.x+p.w,item.x)),endY=Math.max(p.y,Math.min(p.y+p.h,item.y));
    const moved=item.leader!==false&&Math.hypot(endX-item.x,endY-item.y)>7;
    line.style.display=moved?'':'none';line.setAttribute('x1',item.x);line.setAttribute('y1',item.y);line.setAttribute('x2',endX);line.setAttribute('y2',endY);
    line.setAttribute('stroke',item.color||'var(--muted)');bottom=Math.max(bottom,p.y+p.h);
  });
  for(let i=items.length;i<svg.children.length;i++)svg.children[i].style.display='none';
  svg.setAttribute('viewBox',`0 0 ${width} ${Math.max(height,bottom+5)}`);
  svg.style.height=Math.max(height,bottom+5)+'px';
  return Math.max(0,Math.ceil(bottom-height+8));
}
const rgb=c=>{const m=/^#([\da-f]{6})$/i.exec(c);return m?[0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)/255):null;};
function contrast(a,b){const A=rgb(a),B=rgb(b);if(!A||!B)return 5;const L=v=>v.map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);return (Math.max(L(A),L(B))+.05)/(Math.min(L(A),L(B))+.05);}
export function diagramAnnotations(canvas,api){
  const surface=document.createElement('div');surface.className='lab-diagram-surface';
  canvas.cv.replaceWith(surface);surface.append(canvas.cv);
  const header=document.createElement('div');header.className='lab-diagram-head';surface.prepend(header);
  const svg=leaderLayer(surface),layer=document.createElement('div');layer.className='lab-diagram-labels';surface.append(layer);
  const real=canvas.ctx,records=[],dedupe=new Map(),nodes=[];
  const text=(value,x,y,maxWidth)=>{
    if(real.globalAlpha===0||!String(value).trim())return;
    const m=real.getTransform(),dpr=canvas.cv.width/(canvas.cv.clientWidth||canvas.W);
    const X=(m.a*x+m.c*y+m.e)/dpr,Y=(m.b*x+m.d*y+m.f)/dpr;
    const font=real.font,match=/([\d.]+)px/.exec(font),size=match?+match[1]:13,scale=Math.hypot(m.a,m.b)/dpr;
    const item={text:String(value),x:X,y:Y,font:font.replace(/[\d.]+px/,Math.max(12,size*scale)+'px'),color:typeof real.fillStyle==='string'?real.fillStyle:api.colors().ink,align:real.textAlign,baseline:real.textBaseline,angle:Math.atan2(m.b,m.a),maxWidth:Number.isFinite(maxWidth)?maxWidth*scale:undefined};
    const key=item.text+'|'+X.toFixed(1)+'|'+Y.toFixed(1);
    if(dedupe.has(key))records[dedupe.get(key)]=item;else{dedupe.set(key,records.length);records.push(item);}
  };
  const proxy=new Proxy(real,{get(target,key){if(key==='fillText'||key==='strokeText')return text;const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;},set(target,key,value){return Reflect.set(target,key,value,target);}});
  return {surface,ctx:proxy,begin(){records.length=0;dedupe.clear();},finish(){
    const width=canvas.cv.clientWidth,height=canvas.cv.clientHeight;if(!width)return;
    const colors=api.colors(),items=[],body=[];
    records.forEach((r,i)=>{
      let node=nodes[i];if(!node){node=document.createElement('span');node.className='lab-diagram-label';layer.append(node);nodes.push(node);}
      if(node.textContent!==r.text)node.textContent=r.text;
      node.style.font=r.font;node.style.maxWidth=Math.min(r.maxWidth||240,width-12)+'px';
      const readable=contrast(r.color,colors.plate)>=4.5;
      node.style.color=readable?r.color:colors.ink;node.style.borderLeftColor=readable?'transparent':r.color;
      const heading=r.y<=height*.22&&r.text.length>18&&Math.abs(r.angle)<.01;
      node.classList.toggle('lab-diagram-heading',heading);
      if(heading){
        if(node.parentElement!==header)header.append(node);
        node.hidden=false;node.style.transform='none';node.style.maxWidth=(width-24)+'px';
        return;
      }
      if(node.parentElement!==layer)layer.append(node);
      body.push({r,node});
    });
    for(let i=records.length;i<nodes.length;i++)nodes[i].hidden=true;
    const top=header.offsetHeight;
    body.forEach(({r,node})=>{
      const baseline=r.baseline==='top'||r.baseline==='hanging'?'top':r.baseline==='middle'?'middle':'bottom';
      const align=r.align==='center'?'center':r.align==='right'||r.align==='end'?'right':'left';
      const margin=r.y>=height*.82&&!numericLabel(r.text);
      items.push({...r,y:r.y+top,node,align,baseline:margin?'top':baseline,
        ...(margin?{preferredY:top+height+6+Math.max(0,r.y-height*.82),minY:top+height+4,leader:false}:{})});
    });
    const gutter=arrangeAnnotations(items,width,height+top,svg,{grow:true});
    const padding=gutter+'px';if(surface.style.paddingBottom!==padding)surface.style.paddingBottom=padding;
  }};
}
