// Original scene primitives; geometries are allocated once and owned by this lesson.
import {Mesh,BoxGeometry,SphereGeometry,MeshStandardMaterial,MeshBasicMaterial,BufferGeometry,Float32BufferAttribute,Line,LineBasicMaterial,ArrowHelper,Vector3,InstancedMesh,Object3D,DoubleSide} from 'three';
export function sceneTools(lab,api){
 const root=lab.kit?.root,c=api.colors();

 const material=(color,opacity=1)=>new MeshStandardMaterial({color,roughness:.85,transparent:opacity<1,opacity,side:DoubleSide});
 function box(x,y,z,w,h,d,color=c.ink,opacity=1){if(!root)return null;const o=new Mesh(new BoxGeometry(w,h,d),material(color,opacity));o.position.set(x,y,z);root.add(o);return o;}
 function ball(x,y,z,r,color=c.electron,opacity=1){if(!root)return null;const o=new Mesh(new SphereGeometry(r,18,12),material(color,opacity));o.position.set(x,y,z);root.add(o);return o;}
 function line(points,color=c.ink,max=160){if(!root)return {set(){}};const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(new Float32Array(max*3),3));const o=new Line(geo,new LineBasicMaterial({color}));o.frustumCulled=false;root.add(o);o.set=p=>{const a=geo.attributes.position;for(let i=0;i<Math.min(max,p.length);i++)a.setXYZ(i,...p[i]);a.needsUpdate=true;geo.setDrawRange(0,Math.min(max,p.length));};o.set(points);return o;}
 function arrow(a,b,color=c.proton){if(!root)return {set(){}};const v=new Vector3(...b).sub(new Vector3(...a));const o=new ArrowHelper(v.clone().normalize(),new Vector3(...a),v.length(),color,.14,.07);o.line.geometry.userData.shared=true;o.cone.geometry.userData.shared=true;root.add(o);o.set=(A,B)=>{const d=new Vector3(...B).sub(new Vector3(...A)),len=d.length();o.visible=len>1e-5;if(!o.visible)return;o.position.set(...A);o.setDirection(d.normalize());o.setLength(len,Math.min(.14,len*.3),Math.min(.07,len*.15));};return o;}
 function particles(count,color=c.electron,r=.055){if(!root)return {set(){},finish(){}};const o=new InstancedMesh(new SphereGeometry(r,10,8),material(color),count),dummy=new Object3D();o.frustumCulled=false;root.add(o);return {object:o,set(i,x,y,z,scale=1){dummy.position.set(x,y,z);dummy.scale.setScalar(scale);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);},finish(){o.instanceMatrix.needsUpdate=true;}};}
 function surface(rows,cols,position,color=c.electron){if(!root)return {update(){}};const geo=new BufferGeometry(),a=new Float32Array(rows*cols*3),indices=[];for(let i=0;i<rows-1;i++)for(let j=0;j<cols-1;j++){const k=i*cols+j;indices.push(k,k+cols,k+1,k+1,k+cols,k+cols+1);}geo.setAttribute('position',new Float32BufferAttribute(a,3));geo.setIndex(indices);const o=new Mesh(geo,material(color,.75));o.frustumCulled=false;root.add(o);o.update=fn=>{for(let i=0;i<rows;i++)for(let j=0;j<cols;j++)geo.attributes.position.setXYZ(i*cols+j,...fn(i,j));geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();};o.update(position);return o;}
 return {root,c,box,ball,line,arrow,particles,surface};
}
export function diagramTools(ctx,c){
 const text=(s,x,y,color=c.ink,size=13,align='left')=>{ctx.fillStyle=color;ctx.font=`${size}px Lexend,system-ui`;ctx.textAlign=align;ctx.fillText(s,x,y);};
 const line=(x,y,X,Y,color=c.rule,width=1.5)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke();};
 const dot=(x,y,r,color=c.electron)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 const bar=(x,y,w,h,f,color=c.electron)=>{ctx.fillStyle=c.sheet;ctx.fillRect(x,y,w,h);ctx.fillStyle=color;ctx.fillRect(x,y,w*Math.max(0,Math.min(1,f)),h);ctx.strokeStyle=c.rule;ctx.strokeRect(x,y,w,h);};
 const path=(points,color=c.electron,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();};
 const plot=(fn,{x=45,y=50,w=550,h=130,min=0,max=1,ymin=0,ymax=1,color=c.electron}={})=>{line(x,y+h,x+w,y+h);line(x,y,x,y+h);const pts=[];for(let j=0;j<=180;j++){const t=min+(max-min)*j/180,v=fn(t);if(Number.isFinite(v))pts.push([x+w*j/180,y+h-(v-ymin)/(ymax-ymin)*h]);}path(pts,color);const tick=v=>Math.abs(v)>9999||Math.abs(v)<.001&&v!==0?v.toExponential(1):Number(v.toPrecision(3)).toString();text(tick(min),x,y+h+14,c.muted,11);text(tick(max),x+w,y+h+14,c.muted,11,'right');text(tick(ymax),x-5,y+4,c.muted,11,'right');text(tick(ymin),x-5,y+h,c.muted,11,'right');return {X:v=>x+(v-min)/(max-min)*w,Y:v=>y+h-(v-ymin)/(ymax-ymin)*h};};
 const arrow=(x,y,X,Y,color=c.proton,width=2)=>{line(x,y,X,Y,color,width);const a=Math.atan2(Y-y,X-x),h=Math.min(8,Math.hypot(X-x,Y-y)*.35);line(X,Y,X-h*Math.cos(a-.45),Y-h*Math.sin(a-.45),color,width);line(X,Y,X-h*Math.cos(a+.45),Y-h*Math.sin(a+.45),color,width);};
 return {text,line,dot,bar,path,plot,arrow};
}
export const rads=d=>d*Math.PI/180;
export const fixed=(v,n=2)=>Number.isFinite(v)?v.toFixed(n):'∞';
