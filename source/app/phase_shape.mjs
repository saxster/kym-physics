// Geometric phase: lit fraction=(1-cos elongation)/2; discs are idealised sky orientation.
export function phaseDisc(angle, radius=18) {
 const theta=((angle%360)+360)%360;
 const lit=(1-Math.cos(theta*Math.PI/180))/2;
 if(theta===0)return {lit,path:''};
 if(theta===180)return {lit,path:`M0,${-radius} A${radius},${radius} 0 1 1 0,${radius} A${radius},${radius} 0 1 1 0,${-radius} Z`};
 const waxing=theta<180,c=Math.cos(theta*Math.PI/180),rx=Math.abs(c)*radius;
 const limb=waxing?1:0,term=waxing?(c>0?0:1):(c>0?1:0);
 const path=`M0,${-radius} A${radius},${radius} 0 0 ${limb} 0,${radius} `+(rx<1e-8?`L0,${-radius}`:`A${rx},${radius} 0 0 ${term} 0,${-radius}`)+' Z';
 return {lit,path};
}
