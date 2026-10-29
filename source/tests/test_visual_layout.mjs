import assert from 'node:assert/strict';
import {Group,Mesh,BoxGeometry,MeshBasicMaterial,BufferGeometry,Float32BufferAttribute,Line,InstancedMesh,Matrix4,PerspectiveCamera,Vector3} from 'three';
import {placeLabels} from '../live/label_layout.mjs';
import {visibleSceneBounds,framingDistance} from '../live/scene_bounds.mjs';

// Motor terminals and graph ticks must remain separate at phone and desktop widths.
for(const width of [340,500])for(const n of [6,14]){
  const items=Array.from({length:n},(_,i)=>({x:width/2+(i%3)*4,y:80+(i%2)*3,w:55+(i%4)*12,h:18}));
  const result=placeLabels(items,width,280);
  assert.equal(result.overlaps,0);
  assert.deepEqual(placeLabels(items,width,280),result);
  for(const p of result.positions){assert(p.x>=5&&p.y>=5);assert(p.x+p.w<=width-5);assert(p.y+p.h<=275);}
}
const footer=placeLabels([{x:5,y:150,minY:150,w:220,h:38},{x:60,y:160,minY:150,w:210,h:28}],340,240);
assert.equal(footer.overlaps,0);
assert(footer.positions.every(p=>p.y>=150),'Readable bottom legends stay below the geometry');

const root=new Group(),mat=new MeshBasicMaterial();
root.add(new Mesh(new BoxGeometry(2,4,6),mat));
const hidden=new Group();hidden.visible=false;const remote=new Mesh(new BoxGeometry(2,2,2),mat);remote.position.x=1000;hidden.add(remote);root.add(hidden);
const transparent=new Mesh(new BoxGeometry(200,200,200),new MeshBasicMaterial({opacity:0,transparent:true}));root.add(transparent);
const lineGeometry=new BufferGeometry();lineGeometry.setAttribute('position',new Float32BufferAttribute([0,0,0, 2,0,0, 999,999,999],3));lineGeometry.setDrawRange(0,2);root.add(new Line(lineGeometry,mat));
let bounds=visibleSceneBounds(root);assert.deepEqual(bounds.min.toArray(),[-1,-2,-3]);assert.deepEqual(bounds.max.toArray(),[2,2,3]);
lineGeometry.setIndex([0,1]);lineGeometry.setDrawRange(0,Infinity);bounds=visibleSceneBounds(root);assert.equal(bounds.max.x,2);
const instances=new InstancedMesh(new BoxGeometry(1,1,1),mat,2);instances.setMatrixAt(0,new Matrix4().makeTranslation(-4,0,0));instances.setMatrixAt(1,new Matrix4().makeTranslation(5,0,0));root.add(instances);
bounds=visibleSceneBounds(root);assert.equal(bounds.min.x,-4.5);assert.equal(bounds.max.x,5.5);

// Every visible bound corner must lie inside the actual perspective frustum.
for(const aspect of [340/280,500/280,820/280]){
  const camera=new PerspectiveCamera(35,aspect,.1,1000);camera.position.z=framingDistance(bounds,35,aspect);camera.updateMatrixWorld();
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const p=new Vector3(x,y,z).project(camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z>-1&&p.z<1);
  }
}
console.log('Visual layout: collision avoidance, active geometry bounds, instances and perspective framing PASS');
