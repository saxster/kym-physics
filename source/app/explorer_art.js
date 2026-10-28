// Deterministic editorial landmarks. The declared outer span remains the scale;
// internal features are explanations, not measured maps or particle trajectories.
const TAU = Math.PI * 2;
function dot(ctx,x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
function line(ctx,x,y,x2,y2,colour,width=1){ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
function noise(i){const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);}
export const SCALE_DETAILS={
 proton:'A proton has internal quark structure. The three marks are symbols, not hard balls or orbit tracks.',
 atom:'The shaded electron cloud shows where an electron is more likely to be found. Its nucleus is an enlarged marker; an electron does not follow a drawn orbit.',
 wave:'The bracket spans one full wavelength. The curve represents an electric-field pattern, not a wavy path followed by a photon.',
 sand:'Facets and fine grains distinguish a solid grain from empty space. The outline represents the one-millimetre reference; the texture is illustrative.',
 human:'The tabletop is the one-metre reference. The person and objects establish context rather than a measured portrait of you.',
 sun:'A cut-away separates the hot interior from the visible surface. The internal bands and particles are schematic; the outer circle sets the diameter.',
 orbit:'The endpoint separation is one astronomical unit. The Sun and Earth are enlarged markers, so their drawn diameters are not on this distance scale.',
 lightyear:'One light-year is the distance between the end marks, not the size of a star. Light takes one year to travel that distance in empty space.',
 galaxy:'The star-rich disc, central bulge and dusty spiral arms distinguish a galaxy from a simple spiral line. Individual stars are enlarged marks; this is not a measured map.',
};
export function drawScaleLandmark(ctx,kind,cx,cy,r,c,fallback){
 if(r<1.5||r>4000)return;
 if(!['proton','atom','wave','sand','human','sun','orbit','lightyear','galaxy'].includes(kind)){fallback(ctx,kind,cx,cy,r,c);return;}
 ctx.save();ctx.translate(cx,cy);
 const lw=Math.max(1.2,Math.min(2.5,r*.025));ctx.lineWidth=lw;
 if(kind==='proton'){
  const g=ctx.createRadialGradient(-r*.2,-r*.2,r*.1,0,0,r);g.addColorStop(0,c.protonWash);g.addColorStop(1,'transparent');
  dot(ctx,0,0,r,g);ctx.strokeStyle=c.proton;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);
  [[-.33,-.24],[.31,-.13],[0,.36]].forEach(([x,y],i)=>{
   if(r>28){ctx.strokeStyle=c.muted;ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(x*r,y*r);ctx.quadraticCurveTo(-y*r*.3,x*r*.3,0,r*.36);ctx.stroke();ctx.globalAlpha=1;}
   dot(ctx,x*r,y*r,r*.17,i<2?c.proton:c.electron);
   if(r>40){ctx.fillStyle=c.paper||'#fbfaf5';ctx.font=`600 ${Math.min(22,r*.16)}px Lexend,system-ui`;ctx.textAlign='center';ctx.fillText(i<2?'u':'d',x*r,y*r+r*.055);}
  });
 }else if(kind==='atom'){
  const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,c.electronWash);g.addColorStop(.5,c.electronWash);g.addColorStop(1,'transparent');dot(ctx,0,0,r,g);
  ctx.save();ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.clip();
  for(let i=1;i<=450;i++){const rad=Math.min(1,Math.sqrt(-Math.log(Math.max(.001,noise(i)))*.16))*r,a=noise(i+700)*TAU;ctx.globalAlpha=.12+.4*(1-rad/r);dot(ctx,Math.cos(a)*rad,Math.sin(a)*rad,Math.max(.55,Math.min(1.2,r*.012)),c.electron);}
  ctx.restore();dot(ctx,0,0,Math.max(2,r*.018),c.proton);
  ctx.strokeStyle=c.electron;ctx.lineWidth=1;ctx.setLineDash([2,5]);ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();ctx.setLineDash([]);
 }else if(kind==='sand'){
  const pts=[[.92,.08],[.6,.73],[-.2,.91],[-.88,.38],[-.8,-.46],[-.08,-.96],[.7,-.6]];
  ctx.fillStyle=c.neutronWash;ctx.strokeStyle=c.neutron;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*r,y*r):ctx.moveTo(x*r,y*r));ctx.closePath();ctx.fill();ctx.stroke();ctx.clip();
  for(let i=0;i<80;i++){const x=(noise(i+20)*2-1)*r,y=(noise(i+120)*2-1)*r;ctx.globalAlpha=.12+noise(i+220)*.3;dot(ctx,x,y,Math.max(.7,Math.min(2,r*.012)),c.neutron);}ctx.globalAlpha=1;
  [[-1,.1,.1,-.5],[.1,-.5,.7,-.6],[.1,-.5,.4,.6],[.4,.6,-.2,.91]].forEach(p=>line(ctx,p[0]*r,p[1]*r,p[2]*r,p[3]*r,c.neutron,lw*.65));
 }else if(kind==='wave'){
  line(ctx,-r,0,r,0,c.muted);ctx.strokeStyle=c.electron;ctx.lineWidth=lw;ctx.beginPath();for(let i=0;i<=96;i++){const x=-r+i*r/48,y=-Math.sin(i/96*TAU)*r*.3;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  if(r>35){line(ctx,-r,r*.47,r,r*.47,c.ink,1);for(const x of [-r,r])line(ctx,x,r*.4,x,r*.54,c.ink,1);ctx.fillStyle=c.ink;ctx.font='600 13px Lexend,system-ui';ctx.textAlign='center';ctx.fillText('one wavelength',0,r*.47+19);}
 }else if(kind==='human'){
  line(ctx,-r,-r*.12,r,-r*.12,c.ink,Math.min(5,lw*2));for(const x of [-r*.83,r*.83])line(ctx,x,-r*.12,x,r*.6,c.ink,lw);
  ctx.strokeStyle=c.ink;ctx.strokeRect(-r*.28,-r*.42,r*.56,r*.24);line(ctx,0,-r*.18,0,-r*.12,c.ink,lw);
  dot(ctx,-r*.55,-r*.52,r*.13,c.neutronWash);ctx.stroke();line(ctx,-r*.55,-r*.39,-r*.55,-r*.17,c.ink,lw);line(ctx,-r*.55,-r*.26,-r*.2,-r*.2,c.ink,lw);
  for(let i=0;i<4;i++)line(ctx,r*.3+i*r*.09,-r*.13,r*.3+i*r*.09,-r*(.29+noise(i)*.07),c.electron,lw*2);
 }else if(kind==='sun'){
  const g=ctx.createRadialGradient(-r*.3,-r*.35,r*.1,0,0,r);g.addColorStop(0,c.neutronWash);g.addColorStop(1,c.neutron);dot(ctx,0,0,r,g);
  ctx.save();ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.clip();
  for(let i=0;i<280;i++){const a=noise(i)*TAU,rad=Math.sqrt(noise(i+400))*r;ctx.globalAlpha=.15;dot(ctx,Math.cos(a)*rad,Math.sin(a)*rad,Math.max(.8,r*.015),c.neutron);}ctx.globalAlpha=1;
  // A quarter cut-away; circular layer edges are explanatory, not measured boundaries.
  for(const [rr,colour] of [[1,c.neutronWash],[.7,c.protonWash],[.28,c.proton]]){ctx.fillStyle=colour;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r*rr,-Math.PI/2,0);ctx.closePath();ctx.fill();}
  ctx.restore();ctx.strokeStyle=c.neutron;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();
 }else if(kind==='orbit'||kind==='lightyear'){
  ctx.strokeStyle=c.muted;ctx.setLineDash([4,5]);line(ctx,-r,0,r,0,c.muted,lw);ctx.setLineDash([]);
  for(const x of [-r,r])line(ctx,x,-Math.min(18,r*.15),x,Math.min(18,r*.15),c.ink,lw);
  if(kind==='orbit'){dot(ctx,-r,0,Math.max(3,Math.min(13,r*.1)),c.neutron);dot(ctx,r,0,Math.max(2,Math.min(6,r*.05)),c.electron);}
  if(r>42){ctx.fillStyle=c.ink;ctx.font='600 13px Lexend,system-ui';ctx.textAlign='center';ctx.fillText(kind==='orbit'?'Sun → Earth':'light travels for one year',0,30);}
 }else if(kind==='galaxy'){
  ctx.save();ctx.scale(1,.65);
  const glow=ctx.createRadialGradient(0,0,0,0,0,r);glow.addColorStop(0,c.neutronWash);glow.addColorStop(.6,c.electronWash);glow.addColorStop(1,'transparent');dot(ctx,0,0,r,glow);
  for(let i=0;i<850;i++){const t=Math.sqrt(noise(i+12)),arm=i%4,a=t*TAU*.82+arm*Math.PI/2+(noise(i+99)-.5)*.36,rad=t*r*.95;ctx.globalAlpha=.25+.55*(1-t);dot(ctx,Math.cos(a)*rad,Math.sin(a)*rad,Math.max(.45,Math.min(1.5,r*.008)),i%6?c.electron:c.neutron);}
  ctx.globalAlpha=.8;const core=ctx.createRadialGradient(0,0,0,0,0,r*.2);core.addColorStop(0,c.neutron);core.addColorStop(1,'transparent');dot(ctx,0,0,r*.2,core);ctx.restore();
 }
 ctx.restore();
}
