// One physical view width drives the scene, ruler, comparisons and learning prompts.
import App from './core.js';
import { MIN_EXP, MAX_EXP, clampExp, widthAt, stepTarget, formatWidth, formatPower, fitExponent, ratioText } from './scale_model.mjs';
import { RUNGS, drawRungIcon } from './scale_catalog.js';
import { drawEarth } from './scale_earth.js';
const { el } = App;
const DIMENSIONS = [1e-15, 1e-10, 5e-7, .001, 1, 1.2742e7, 1.39e9, 1.496e11, 9.4607e15, 1e21];
const STOPS = RUNGS.map((r, i) => ({...r, metres: DIMENSIONS[i]})).concat([
  {name:'Apartment',metres:10,kind:'illustration',sizeText:'10 m illustrative reference'},
  {name:'Neighbourhood',metres:100,kind:'illustration',sizeText:'100 m illustrative reference'},
  {name:'Coastal region',metres:1e5,kind:'illustration',sizeText:'100 km illustrative reference'},
]).sort((a,b)=>a.metres-b.metres);
const LESSONS = [
  ['Start with one metre', 'Before you begin, picture a length of one metre. What familiar thing would fit inside a window that wide? Make a guess, then confirm the starting view.', 0, 'Begin at one metre', 0, 'Our starting window is one metre across, about a long stride. This is a reference length, not a measurement of your height.'],
  ['Predict before you zoom', 'If the window becomes ten times wider, will a fixed object inside it look bigger or smaller? Make your prediction, then try it.', 0, 'Make the view 10× wider', 1, 'The window is now ten metres across. A fixed length takes up one tenth as much of the scene’s width, so it looks smaller. The object itself has not shrunk.'],
  ['Travel in the other direction', 'How many divisions by ten take a one-metre window down to one millimetre? Count the steps before visiting that scale.', 0, 'Visit one millimetre', -3, 'Three steps: 1 metre → 100 millimetres → 10 millimetres → 1 millimetre. Each step divides the width by ten; together they divide it by 1,000.'],
  ['Count the steps', 'Starting at one millimetre, how many steps of ×10 return to one metre? Will the total factor be 30 or 1,000? Predict before comparing.', -3, 'Compare with one metre', 0, 'It takes three steps: 1 mm → 1 cm → 10 cm → 1 m. The factors multiply: 10 × 10 × 10 = 1,000, rather than adding to 30.'],
  ['Try a prediction of your own', 'This step starts with a window 100 metres across. It becomes ten times wider. Predict its new width before you reveal it.', 2, 'Reveal the next width', 3, '100 metres × 10 = 1,000 metres: one kilometre. Now use the ruler to try your own predictions, or return to this result.'],
];
App.explorer('scale', {
  mount(stage, { close }) {
    let exp = 0, target = 0, frame = 0, disposed = false, selected = null;
    let guideOpen = false, lesson = -1, expected = null, revealed = false, announceTimer, observation = '';
    const imageFailures = new Set();
    const canvas = el('canvas', { class: 'scale-canvas', role: 'img', 'aria-label': 'A one-metre window at human scale.' });
    const width = el('strong', {class:'scale-width'});
    const power = el('span', {class:'scale-power'});
    const comparison = el('p', {class:'scale-comparison'});
    const caption = el('p', {class:'scale-caption'});
    const windowNote = el('p', {class:'scale-window-note', id:'scale-window-note'});
    canvas.setAttribute('aria-describedby','scale-window-note');
    const status = el('p', {class:'scale-sr', role:'status', 'aria-live':'polite'});
    const slider = el('input', {type:'range', min:MIN_EXP, max:MAX_EXP, step:'any', value:0, 'aria-label':'View width, from proton scale to galaxy scale'});
    const minus = el('button', {type:'button', class:'xp-btn', onclick:()=>{clearSelection();go(stepTarget(target,-1));}}, '10× smaller');
    const plus = el('button', {type:'button', class:'xp-btn', onclick:()=>{clearSelection();go(stepTarget(target,1));}}, '10× larger');
    const home = el('button', {type:'button', class:'xp-btn', onclick:()=>{ selected=null; choose.value=''; go(0); }}, 'Back to you');
    const choose = el('select', {'aria-label':'Jump to a landmark', onchange:()=>{
      if (choose.value === '') return;
      selected=STOPS[Number(choose.value)];
      // Width is horizontal, so a circular landmark also needs room vertically.
      go(fittedLandmarkExponent());
    }}, el('option',{value:''},'Visit a landmark…'), STOPS.map((r,i)=>el('option',{value:i},r.name)));
    const promptTitle = el('h3', {tabindex:'-1'});
    const promptBody = el('p');
    const guideStatus = el('p', {class:'scale-guide-status'});
    const action = el('button', {type:'button', class:'xp-btn', onclick:()=>{
      if (lesson < 0) { setLesson(0); return; }
      revealed=true; expected=LESSONS[lesson][4]; selected=null; choose.value=''; updateLesson(); go(expected);
    }});
    const prev = el('button',{type:'button',class:'xp-btn',onclick:()=>setLesson(lesson-1)},'Previous');
    const next = el('button',{type:'button',class:'xp-btn',onclick:()=>setLesson(lesson+1)},'Next');
    const restore = el('button',{type:'button',class:'xp-btn',hidden:true,onclick:()=>{clearSelection();go(expected);action.focus({preventScroll:true});}},'Return to this step');
    const guide = el('aside',{class:'scale-guide',hidden:true,'aria-label':'Guided journey'},
      el('p',{class:'xp-kicker'},'Predict · explore · explain'), promptTitle,promptBody,action,guideStatus,restore,
      el('div',{class:'scale-guide-nav'},prev,next));
    const guideBtn=el('button',{type:'button',class:'xp-btn','aria-expanded':'false',onclick:()=>{
      guideOpen=!guideOpen; guide.hidden=!guideOpen; guideBtn.setAttribute('aria-expanded',String(guideOpen));
      guideBtn.textContent=guideOpen?'Close guide':'Take a guided journey';
      wrap.classList.toggle('has-guide',guideOpen);
      if (guideOpen) { updateLesson(); promptTitle.focus({preventScroll:true}); promptTitle.scrollIntoView({block:'nearest',behavior:'instant'}); }
      else guideBtn.focus({preventScroll:true});
      draw();
    }},'Take a guided journey');
    const details=el('details',{class:'scale-details'},el('summary',{},'About the scale, pictures and mathematics'),
      el('p',{},'The width is the horizontal distance across the entire scene. Each step multiplies or divides that width by ten. Equal distances on the ruler represent equal ratios, not equal additions. 10⁰ means 1; it does not mean zero.'),
      el('p',{},'An ordinary ruler adds the same length at each mark. This ruler multiplies by ten at each equal step, so tiny and enormous lengths can share one ruler. To compare two exact powers of ten, subtract their exponents: from 10⁻³ m to 10⁰ m is 0 − (−3) = 3 steps, or 1,000 times the width.'),
      el('p',{},'The ruler extends one framing step beyond the galaxy’s approximate width so its whole drawing fits on a narrow or wide screen. Extra space around a landmark belongs to the window, not to the object.'),
      el('p',{},'Landmark sizes are approximate. Choosing a landmark fits its reference dimension into the window; its size need not be an exact power of ten. A light wavelength and the Earth–Sun distance are lengths, not solid objects.'),
      el('p',{},'The apartment, neighbourhood and coastline are AI-created illustrations assigned reference widths of 10 metres, 100 metres and 100 kilometres. They are illustrative changes of scene, not one continuous measured location. They are not measured maps or Kym’s actual home. Microscopic and astronomical views use schematic drawings. Small markers may stand for objects too small to resolve; they are labelled as markers.'),
      el('p',{},'Reference dimensions: proton ≈ 10⁻¹⁵ m; hydrogen atom ≈ 10⁻¹⁰ m; visible-light example 500 nm; sand example 1 mm; Earth diameter 12,742 km; Sun diameter ≈ 1.39 million km; Earth–Sun mean distance ≈ 149.6 million km; light-year ≈ 9.46 × 10¹⁵ m; Milky Way width ≈ 10²¹ m.'),
      el('a',{href:'#s0-3'},'Read Chapter 0.3: Powers of ten'));
    const retryImages=el('button',{type:'button',class:'xp-btn',hidden:true,onclick:()=>loadArtwork()},'Retry illustrations');
    const scene=el('div',{class:'scale-scene'},canvas);
    const primary=el('div',{class:'scale-primary'},
      el('div',{class:'scale-readout'},el('span',{class:'xp-kicker'},'Width of your window'),width,power),scene,
      el('div',{class:'scale-step-controls'},minus,plus),
      el('div',{class:'scale-ruler'},el('span',{},'Smaller'),slider,el('span',{},'Larger')),
      windowNote,comparison,caption,
      el('div',{class:'scale-secondary'},home,choose,retryImages));
    const wrap=el('div',{class:'scale-explorer'},
      el('div',{class:'scale-top'},el('p',{class:'xp-kicker'},'One metre. Then the universe.'),
        el('button',{type:'button',class:'xp-btn',onclick:()=>{dispose();close();}},'Close explorer')),
      el('div',{class:'scale-layout'},primary,guide),
      el('div',{class:'scale-guide-toggle'},guideBtn), details,status);
    stage.replaceChildren(wrap);
    const room=new Image(),coast=new Image(),art=new Image();
    const artwork=[[room,window.BOOK_SCALE_ASSETS?.room],[coast,window.BOOK_SCALE_ASSETS?.coast],[art,window.BOOK_SCALE_ART]];
    function loadArtwork(){
      for(const [img,src] of artwork){
        imageFailures.delete(img);
        img.onload=()=>{imageFailures.delete(img);if(!disposed)draw();};
        img.onerror=()=>{imageFailures.add(img);if(!disposed)draw();};
        if(src)img.src=src;else imageFailures.add(img);
      }
      draw();
    }
    function clearSelection(){selected=null;choose.value='';}
    function fittedLandmarkExponent(){
      const aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight);
      return fitExponent(selected.metres*Math.max(1,aspect));
    }
    function updateLesson() {
      const st=LESSONS[lesson];
      promptTitle.textContent=st?`${lesson+1} / ${LESSONS.length} · ${st[0]}`:'A journey in five small steps';
      promptBody.textContent=st?(revealed?st[5]:st[1]):'Start at human scale, make a prediction, and see what a change of ten really does. Your current view stays here until you begin.';
      action.textContent=st?st[3]:'Begin at one metre';
      prev.hidden=next.hidden=lesson<0; prev.disabled=lesson<=0;next.disabled=lesson>=LESSONS.length-1;
      updateGuide();
    }
    function setLesson(n) {
      lesson=Math.max(0,Math.min(LESSONS.length-1,n)); revealed=false; expected=LESSONS[lesson][2];selected=null;choose.value='';
      updateLesson();go(expected);promptTitle.focus({preventScroll:true});
    }
    function updateGuide() {
      const away=expected!==null && Math.abs(exp-expected)>.02;
      guideStatus.textContent=lesson<0?'':away?'You are exploring away from this step.':`${revealed?'Result':'Starting view for this step'}: ${formatWidth(exp)} across.`;
      restore.hidden=!away;
    }
    function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
    function isActive(){return !disposed && !document.hidden && !stage.closest('[data-page-off]');}
    function pause(){stop();target=exp;clearTimeout(announceTimer);}
    function go(e) {
      stop(); target=clampExp(e);const from=exp; const start=performance.now();
      if(!isActive()){pause();return;}
      if(App.reduceMotion() || Math.abs(from-target)<.001){paint(target);return;}
      function tick(now){if(!isActive()){pause();return;}const t=Math.min(1,(now-start)/550);paint(from+(target-from)*(t*t*(3-2*t)));if(t<1)frame=requestAnimationFrame(tick);else frame=0;}
      frame=requestAnimationFrame(tick);
    }
    slider.addEventListener('input',()=>{stop();selected=null;choose.value='';target=clampExp(Number(slider.value));paint(target);});
    // Keep fitted fractional widths exact while providing predictable keyboard increments.
    slider.addEventListener('keydown',e=>{
      const increments={ArrowLeft:-.05,ArrowDown:-.05,ArrowRight:.05,ArrowUp:.05,PageDown:-.5,PageUp:.5};
      let value;
      if(e.key==='Home')value=MIN_EXP;else if(e.key==='End')value=MAX_EXP;
      else if(e.key in increments)value=Math.round((exp+increments[e.key])*1e12)/1e12;else return;
      e.preventDefault();stop();clearSelection();target=clampExp(value);paint(target);
    });
    function paint(e) {
      exp=clampExp(e);slider.value=exp;
      width.textContent=`${formatWidth(exp)} across`;power.replaceChildren(Number.isInteger(exp)?'10':'≈ 10',el('sup',{},String(Math.round(exp*100)/100)), ' metres');
      slider.setAttribute('aria-valuetext',`${formatWidth(exp)} across. ${ratioText(exp)}`);
      comparison.textContent=ratioText(exp);
      // A labelled step always changes the width by a full factor of ten.
      minus.disabled=target-1<MIN_EXP-1e-9;plus.disabled=target+1>MAX_EXP+1e-9;
      const r=selected || STOPS.reduce((a,b)=>Math.abs(Math.log10(b.metres)-exp)<Math.abs(Math.log10(a.metres)-exp)?b:a);
      if(exp>=3.5 && exp<=6.5) observation='A coastal region comes into view. This illustration has a reference width of 100 kilometres; it is not a measured map.';
      else if(exp>=0 && exp<=3) observation= exp<.5?'Start with a one-metre reference. Zoom out to find the room and the street around it.':exp<1.5?'A room comes into view. Each length looks ten times smaller after one full step out.':exp<2.5?'Buildings and lanes surround the room. This is an illustrative neighbourhood.':'A kilometre is 1,000 metres. The neighbourhood now occupies only a small part of the window.';
      else observation=`${r.name} · ${r.sizeText}. Nearby reference; the window width is shown above. Schematic: dots and internal details are enlarged; objects extending beyond the window are cropped.`;
      if(selected)observation=`Selected reference: ${selected.name} · ${selected.sizeText}. ${observation}`;
      windowNote.textContent=`Dashed window: ${formatWidth(exp-1)} across, one tenth of the full view width.`;
      clearTimeout(announceTimer);
      if(isActive())announceTimer=setTimeout(()=>{if(isActive())status.textContent=`${width.textContent}. ${comparison.textContent}`;},180);
      updateGuide();draw();
    }
    function draw() {
      if(!isActive())return;
      const W=canvas.clientWidth || 700,H=canvas.clientHeight||380,dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
      const ctx=canvas.getContext('2d');if(!ctx)return;
      ctx.scale(dpr,dpr);const css=getComputedStyle(stage),g=k=>css.getPropertyValue(k).trim();
      const col={ink:g('--ink'),ink2:g('--ink-2'),muted:g('--muted'),vol:g('--vol'),green:g('--green'),proton:g('--proton'),electron:g('--electron'),neutron:g('--neutron'),protonWash:'rgba(169,71,48,.14)',electronWash:'rgba(53,109,131,.15)',neutronWash:'rgba(147,96,34,.15)'};
      ctx.fillStyle=g('--plate')||'#faf6e9';ctx.fillRect(0,0,W,H);
      const metres=widthAt(exp),ppm=W/metres;
      let sceneNote='';
      const intendedImage=exp>=.7 && exp<1.7?room:exp>=3.5 && exp<=6.5?coast:exp>=.7 && exp<=3.5?art:null;
      const imageFailed=intendedImage && imageFailures.has(intendedImage);
      retryImages.hidden=!imageFailed;
      if(imageFailed)sceneNote=' Illustration unavailable; a reference diagram is shown. Use Retry illustrations to try again.';
      if(intendedImage && intendedImage.complete && intendedImage.naturalWidth){
        const reference=intendedImage===room?10:intendedImage===coast?1e5:100;
        const iw=reference*ppm,ih=iw*intendedImage.naturalHeight/intendedImage.naturalWidth;
        ctx.drawImage(intendedImage,(W-iw)/2,(H-ih)/2,iw,ih);
      } else {
        let drawn=0;
        for(const r of STOPS){
          const size=r.metres*ppm;if(size<3 || size>Math.max(W,H)*4)continue;
          if(r.kind==='earth')drawEarth(ctx,W/2,H/2,size/2,col);
          else if(r.kind==='illustration'){
            ctx.strokeStyle=col.ink;ctx.lineWidth=1.5;ctx.strokeRect((W-size)/2,(H-size*2/3)/2,size,size*2/3);
          }else drawRungIcon(ctx,r.kind,W/2,H/2,size/2,col);
          drawn++;
        }
        // When the closest larger reference is outside the frame, show the largest
        // smaller landmark explicitly as a marker rather than leaving an empty scene.
        if(!drawn){
          const smaller=STOPS.filter(r=>r.metres*ppm<3);
          const marker=smaller[smaller.length-1] || STOPS[0];
          ctx.fillStyle=col.vol;ctx.beginPath();ctx.arc(W/2,H/2,3,0,Math.PI*2);ctx.fill();
          sceneNote+=` ${marker.name} is shown as a marker, too small to resolve at this width.`;
        }
      }
      caption.textContent=observation+sceneNote;
      canvas.setAttribute('aria-label',`${width.textContent}. ${caption.textContent}`);
      // A one-tenth-width inset is a true comparison, independent of artwork.
      ctx.strokeStyle=col.vol;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.strokeRect(W*.45,H*.45,W*.1,H*.1);ctx.setLineDash([]);
    }
    const placeGuide=()=>{
      const parent=(window.innerWidth<1100 || wrap.clientWidth<680) ? primary : wrap.querySelector('.scale-layout');
      if(guide.parentElement!==parent){
        if(parent===primary) primary.insertBefore(guide,primary.querySelector('.scale-ruler'));
        else parent.append(guide);
      }
    };
    const resize=new ResizeObserver(()=>{
      placeGuide();
      if(selected && isActive()){
        const fitted=fittedLandmarkExponent();
        // Keep an already fitting view stable when a guide narrows the scene.
        if(fitted>target+1e-9){go(fitted);return;}
      }
      draw();
    });resize.observe(wrap);resize.observe(scene);
    placeGuide();
    window.addEventListener('resize',placeGuide);
    const theme=new MutationObserver(()=>draw());theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
    const onPage=()=>{if(!isActive())pause();else draw();};
    window.addEventListener('hashchange',onPage);
    document.addEventListener('book:pagechange',onPage);
    document.addEventListener('visibilitychange',onPage);
    function dispose(){disposed=true;stop();clearTimeout(announceTimer);resize.disconnect();theme.disconnect();window.removeEventListener('hashchange',onPage);document.removeEventListener('book:pagechange',onPage);document.removeEventListener('visibilitychange',onPage);window.removeEventListener('resize',placeGuide);for(const [img] of artwork){img.onload=null;img.onerror=null;}}
    loadArtwork();paint(0);minus.focus({preventScroll:true});
    return dispose;
  },
});
