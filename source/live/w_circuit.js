// 12.3 A circuit, energy-per-charge profile and rope analogy: one representation at a time.
import { Live } from './core.js';
import { label, note } from './art_waves.js';

Live.register('circuit', (stage, params, api) => {
  const c=api.colors(),k=api.canvas(640,360,'A closed LED circuit linked to equal charge counters and energy-per-charge accounting');
  let nLeds=1,vBat=9,phase=0,view=0;
  const say=api.readout();
  api.tabs(['1 LED','2 LEDs','3 LEDs','4 LEDs'],i=>{nLeds=i+1;phase=0;draw(0);});
  api.slider('Battery',{min:1.5,max:9,step:1.5,value:vBat,fmt:v=>`${v.toFixed(1)} V`,onInput:v=>{vBat=v;phase=0;draw(0);}});
  api.tabs(['Circuit','Energy per charge','Rope model'],i=>{view=i;draw(0);});
  note(stage,'Choose a view: charge keeps circulating; the battery supplies energy per charge. Dots mark equal amounts of conventional charge, not individual electrons.');
  function solve(){
    const I=Math.max(0,(vBat-2*nLeds)/330),pLed=I>0?2*I:0,pRes=I*I*330,pBat=vBat*I;
    if(I>0&&Math.abs(pBat-nLeds*pLed-pRes)>1e-9)throw new Error('Circuit power is not conserved');
    return {I,iMa:1000*I,pLed,pRes,pBat,vRes:I>0?vBat-2*nLeds:0};
  }
  function resistor(ctx,x,y,w=82){
    ctx.strokeStyle=c.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);
    for(let i=1;i<12;i++)ctx.lineTo(x+i*w/12,y+(i%2?-8:8));ctx.lineTo(x+w,y);ctx.stroke();
  }
  function circuit(ctx,s){
    label(ctx,c,'1  Follow the charge around the whole loop',24,29,{size:17,weight:600});
    const L=78,R=565,T=111,B=262,P=2*(R-L+B-T);
    ctx.strokeStyle=c.ink;ctx.lineWidth=2;ctx.strokeRect(L,T,R-L,B-T);
    ctx.fillStyle=c.sheet;ctx.fillRect(L-22,166,44,48);ctx.strokeRect(L-22,166,44,48);
    label(ctx,c,'+',L,179,{align:'center',weight:600,color:c.proton});label(ctx,c,'−',L,207,{align:'center',weight:600});
    label(ctx,c,`${vBat.toFixed(1)} V`,L,239,{align:'center',weight:600});
    ctx.fillStyle=c.plate;ctx.fillRect(202,T-12,86,24);resistor(ctx,204,T);
    label(ctx,c,'330 Ω',245,84,{align:'center',weight:600});
    for(let i=0;i<nLeds;i++){
      const x=355+(i+.5)*170/nLeds;
      ctx.fillStyle=s.I>0?c.proton:c.sheet;ctx.beginPath();ctx.moveTo(x-8,T-9);ctx.lineTo(x+8,T);ctx.lineTo(x-8,T+9);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+9,T-10);ctx.lineTo(x+9,T+10);ctx.stroke();
      api.draw.arrow(ctx,x+7,T-13,x+18,T-24,c.proton,1.4,4);
    }
    label(ctx,c,`${nLeds} red LED${nLeds>1?'s':''}`,440,65,{align:'center',weight:600});
    // Equal spacing and rate everywhere: a charge ledger, not a drift-speed simulation.
    for(let i=0;i<32;i++){
      let d=((i+phase%1)/32)*P,x,y;
      if(d<R-L){x=L+d;y=T;}else if(d<R-L+B-T){x=R;y=T+d-(R-L);}else if(d<2*(R-L)+B-T){x=R-(d-(R-L)-(B-T));y=B;}else{x=L;y=B-(d-2*(R-L)-(B-T));}
      if(y===T&&((x>200&&x<294)||(x>350&&x<530)))continue;
      if(x===L&&y>160&&y<218)continue;
      ctx.fillStyle=c.electron;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();
    }
    for(const [x,y,n,txt] of [[154,T,'A','leaving +'],[322,T,'B','after resistor'],[320,B,'C','returning to −']]){
      ctx.strokeStyle=c.proton;ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x,y+8);ctx.stroke();
      label(ctx,c,n,x,y===T?y+27:y-18,{align:'center',weight:600,color:c.proton});
      label(ctx,c,`${s.iMa.toFixed(1)} mA`,x,y===T?y+47:y-38,{align:'center',weight:600});
      label(ctx,c,txt,x,y===T?y+65:y+28,{align:'center',size:12});
    }
    label(ctx,c,`A = B = C: ${Math.floor(phase)} equal charge amounts counted`,320,336,{align:'center',weight:600});
  }
  function energy(ctx,s){
    label(ctx,c,'2  Follow the energy carried by each coulomb',24,29,{size:17,weight:600});
    if(s.I<=0){label(ctx,c,`${vBat.toFixed(1)} V is below the ${2*nLeds} V threshold.`,320,127,{size:19,align:'center',weight:600});label(ctx,c,'No charge circulates; no power is transferred.',320,170,{size:16,align:'center'});label(ctx,c,'This threshold model does not resolve the individual LED voltages.',320,219,{size:13,align:'center',color:c.muted});return;}
    const base=252,Y=v=>base-v*17;
    ctx.strokeStyle=c.rule;ctx.lineWidth=1;for(const v of [0,3,6,9]){ctx.beginPath();ctx.moveTo(60,Y(v));ctx.lineTo(600,Y(v));ctx.stroke();label(ctx,c,`${v} V`,49,Y(v)+4,{align:'right',size:12});}
    const pts=[[76,0],[114,vBat],[218,vBat],[318,s.I>0?2*nLeds:vBat],[355,s.I>0?2*nLeds:vBat]];
    for(let i=0;i<nLeds;i++)pts.push([355+(i+1)*175/nLeds,s.I>0?2*(nLeds-i-1):i===nLeds-1?0:vBat]);
    pts.push([600,0]);ctx.strokeStyle=c.electron;ctx.lineWidth=3;ctx.beginPath();pts.forEach(([x,v],i)=>i?ctx.lineTo(x,Y(v)):ctx.moveTo(x,Y(v)));ctx.stroke();
    label(ctx,c,'battery',95,281,{align:'center',weight:600});label(ctx,c,'resistor',270,281,{align:'center',weight:600});label(ctx,c,'LEDs',447,281,{align:'center',weight:600});
    label(ctx,c,`+${vBat.toFixed(1)} J/C`,100,307,{align:'center',color:c.electron});label(ctx,c,`−${s.vRes.toFixed(1)} J/C`,270,307,{align:'center',color:c.proton});label(ctx,c,s.I>0?'−2 J/C each':'no current',447,307,{align:'center',color:c.proton});
    label(ctx,c,'This “height” means energy per charge, not physical altitude.',320,339,{align:'center',size:13});
  }
  function rope(ctx,s){
    label(ctx,c,'3  A rope helps us picture a complete circuit',24,29,{size:17,weight:600});
    ctx.strokeStyle=c.ink;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(320,182,230,77,0,0,2*Math.PI);ctx.stroke();
    for(let i=0;i<28;i++){
      const a=(i/28+phase/28)*2*Math.PI,x=320+230*Math.cos(a),y=182+77*Math.sin(a);
      ctx.fillStyle=c.sheet;ctx.strokeStyle=c.ink;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,3,0,2*Math.PI);ctx.fill();ctx.stroke();
    }
    // Opposed finger strokes make a contact instead of another labelled box.
    for(const [x,y,col] of [[90,181,c.electron],[430,112,c.proton]]){
      ctx.fillStyle=c.sheet;ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x-28,y-17,56,34,13);ctx.fill();ctx.stroke();
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x-15+i*9,y-11);ctx.lineTo(x-15+i*9,y+11);ctx.stroke();}
    }
    label(ctx,c,'hands pull',90,225,{align:'center',color:c.electron,weight:600});label(ctx,c,'hands grip: they warm up',430,76,{align:'center',color:c.proton,weight:600});
    api.draw.arrow(ctx,240,105,300,105,c.electron,2,8);api.draw.arrow(ctx,400,260,340,260,c.electron,2,8);
    label(ctx,c,'Same rope speed everywhere; energy is passed at the contacts.',320,304,{align:'center',weight:600});
    label(ctx,c,'A circuit has charge carriers and electric fields; it has no material rope.',320,336,{align:'center',size:12});
  }
  function draw(dt){const s=solve();if(dt>0)phase+=(s.iMa/21.212)*3*dt;k.clear(c.plate);[circuit,energy,rope][view](k.ctx,s);
    say(s.I>0?`Same current everywhere: ${s.iMa.toFixed(1)} mA. Battery supplies ${s.pBat.toFixed(3)} W; resistor receives ${s.pRes.toFixed(3)} W and each of ${nLeds} LEDs receives ${s.pLed.toFixed(3)} W. Energy balances; charge is not used up. The 2 V LED model is approximate.`:`${vBat.toFixed(1)} V does not exceed the ${2*nLeds} V LED threshold in this approximate model: no current anywhere in the loop.`);}
  api.loop(draw);draw(0);return {destroy(){}};
},{label:'Run the loop'});
