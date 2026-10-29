import {Box3,Vector3,Matrix4} from 'three';
// Hidden alternatives and unused line-buffer capacity are not part of the current apparatus.
function geometryBounds(geometry){
  const p=geometry?.attributes?.position;if(!p)return null;
  const index=geometry.index,start=geometry.drawRange.start||0,total=index?index.count:p.count;
  const count=Math.min(total-start,geometry.drawRange.count);
  if(count<=0)return null;
  if(!index&&start===0&&count===total){geometry.computeBoundingBox();return geometry.boundingBox.clone();}
  const box=new Box3(),point=new Vector3();
  for(let i=start;i<start+count;i++){point.fromBufferAttribute(p,index?index.getX(i):i);box.expandByPoint(point);}
  return box;
}
export function visibleSceneBounds(root){
  root.updateWorldMatrix(true,true);
  const box=new Box3(),instance=new Matrix4();
  root.traverseVisible(node=>{
    if(!node.geometry)return;
    const materials=Array.isArray(node.material)?node.material:[node.material];
    if(materials.length&&materials.every(m=>m&&(m.visible===false||m.opacity===0)))return;
    const local=geometryBounds(node.geometry);if(!local||local.isEmpty())return;
    if(node.isInstancedMesh){
      for(let i=0;i<node.count;i++){node.getMatrixAt(i,instance);box.union(local.clone().applyMatrix4(instance).applyMatrix4(node.matrixWorld));}
    }else box.union(local.applyMatrix4(node.matrixWorld));
  });
  return box;
}
export function framingDistance(bounds,verticalFov,aspect,padding=1.22){
  const tanV=Math.tan(verticalFov*Math.PI/360),tanH=tanV*Math.max(.01,aspect);
  let distance=2;
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])
    distance=Math.max(distance,z+.2,z+padding*Math.max(Math.abs(x)/tanH,Math.abs(y)/tanV));
  return distance;
}
