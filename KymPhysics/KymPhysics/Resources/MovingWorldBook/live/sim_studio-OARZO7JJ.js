import{b as ee}from"./chunk-VXTE6MAK.js";import{a as y}from"./chunk-WI6J6YAJ.js";import"./chunk-WOT6VMZA.js";var ce=`
html[data-sim-cb="1"] {
  --proton: #b34500;
  --electron: #005f99;
  --green: #007a5a;
  --neutron: #7a3e9d;
}
@media (prefers-color-scheme: dark) {
  html:not([data-theme="light"]):not([data-theme="sepia"])[data-sim-cb="1"] {
    --proton: #f28e4b;
    --electron: #6ec4f0;
    --green: #69cfa6;
    --neutron: #c79de6;
  }
}
html[data-theme="dark"][data-sim-cb="1"] {
  --proton: #f28e4b;
  --electron: #6ec4f0;
  --green: #69cfa6;
  --neutron: #c79de6;
}
html[data-sim-highlights="1"] .live-ctl:hover,
html[data-sim-highlights="1"] .live-ctl:focus-visible,
html[data-sim-highlights="1"] .live-watch-dot:hover,
html[data-sim-highlights="1"] .live-watch-dot:focus-visible,
html[data-sim-highlights="1"] .live-step-btn:hover,
html[data-sim-highlights="1"] .live-step-btn:focus-visible,
html[data-sim-highlights="1"] input[type="range"]:hover,
html[data-sim-highlights="1"] input[type="range"]:focus-visible,
html[data-sim-highlights="1"] .atlas-stage:focus-visible {
  outline: 2.5px solid var(--proton, #b34500) !important;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--proton, #b34500) 20%, transparent);
}
.live-pdom-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.live-pdom-sr:focus-within {
  position: relative;
  width: auto;
  height: auto;
  overflow: visible;
  clip-path: none;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  margin: .3rem 0;
  padding: .25rem .6rem;
  border-radius: 6px;
  border: 1.5px solid var(--vol);
  background: var(--sheet);
  color: var(--ink);
  font: 500 .8rem/1.3 var(--sans, system-ui, sans-serif);
}
.live-slider-track {
  display: flex;
  align-items: center;
  gap: .28rem;
  flex: 1 1 10rem;
  min-width: 0;
}
.live-slider-track input[type="range"] {
  flex: 1 1 auto;
  min-width: 3.5rem;
  margin: 0;
}
.live-step-btn {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: var(--sheet);
  color: var(--ink-2);
  font: 700 1rem/1 var(--sans, system-ui, sans-serif);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: border-color .12s ease, background-color .12s ease;
}
.live-step-btn:hover { border-color: var(--vol); color: var(--ink); }
.live-step-btn:active { transform: translateY(1px); }
.live-studio-bar {
  order: 0;
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .35rem;
  padding: .42rem .55rem;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: color-mix(in srgb, var(--sheet) 88%, var(--paper));
  position: relative;
}
.live-studio-bar .live-play {
  order: -1;
  min-height: 30px;
  min-width: 4.5rem;
  padding: .24rem .68rem;
  border-radius: 6px;
  font-size: .78rem;
}
.live-studio-sep {
  width: 1px;
  height: 1.2rem;
  background: var(--rule);
  margin: 0 .12rem;
}
.live-studio-pill {
  min-height: 30px;
  padding: .24rem .58rem;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: var(--paper);
  color: var(--ink-2);
  font: 500 .78rem/1.2 var(--sans, system-ui, sans-serif);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: .28rem;
  white-space: nowrap;
}
.live-studio-pill:hover { border-color: var(--ink); color: var(--ink); }
.live-studio-pill[aria-pressed="true"],
.live-studio-pill[aria-expanded="true"] {
  background: var(--ink);
  color: var(--sheet);
  border-color: var(--ink);
}
.live-studio-presets {
  order: 0;
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .3rem .4rem;
  padding: .2rem 0;
}
.live-studio-presets-lbl {
  font: 600 .72rem/1.2 var(--sans, system-ui, sans-serif);
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--muted);
  margin-right: .15rem;
}
.live-studio-popover {
  order: 0;
  flex-basis: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: .45rem .75rem;
  padding: .6rem .75rem;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--sheet);
  color: var(--ink);
  font: 500 .8rem/1.35 var(--sans, system-ui, sans-serif);
}
.live-studio-popover[hidden] { display: none; }
.live-pref-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
}
.live-pref-btn {
  padding: .22rem .55rem;
  border-radius: 999px;
  border: 1px solid var(--rule);
  background: var(--paper);
  color: var(--ink);
  font: 600 .75rem/1.2 var(--sans, system-ui, sans-serif);
  cursor: pointer;
}
.live-pref-btn[aria-checked="true"] {
  background: var(--vol);
  border-color: var(--vol);
  color: var(--paper);
}
@media (pointer: coarse) {
  .live-step-btn { width: 44px; height: 44px; font-size: 1.15rem; }
  .live-studio-pill,
  .live-studio-bar .live-play { min-height: 44px; padding: .38rem .75rem; font-size: .84rem; }
  .live-pref-btn { min-height: 44px; min-width: 56px; padding: .35rem .8rem; font-size: .82rem; }
}
.live-keys-modal {
  order: 0;
  flex-basis: 100%;
  padding: .65rem .8rem;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--sheet);
  color: var(--ink);
  font: 400 .8rem/1.45 var(--sans, system-ui, sans-serif);
}
.live-keys-modal[hidden] { display: none; }
.live-keys-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .45rem;
}
.live-keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: .3rem .75rem;
}
.live-keycap {
  display: inline-block;
  padding: .1rem .38rem;
  margin-right: .3rem;
  border: 1px solid var(--rule);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--paper);
  font: 600 .74rem/1.2 var(--mono, ui-monospace, monospace);
  color: var(--ink);
}
figure.live-openplay .live-challenge,
figure.live-openplay .live-mechanism-key,
figure.live-openplay .live-watch-caption,
figure.live-openplay .live-idealised {
  display: none !important;
}
`,te=!1;function de(){if(te||typeof document>"u"||(te=!0,document.getElementById("kym-sim-studio-css")))return;let n=document.createElement("style");n.id="kym-sim-studio-css",n.textContent=ce,document.head.appendChild(n)}var I=new Map,W=new Map,ue=0;function pe(n){return{num(e,s=0){let t=e.toLowerCase(),i=n.sliders.find(o=>o.label.toLowerCase().includes(t));return i?+i.input.value:s},setSlider(e,s,t="tour"){let i=e.toLowerCase(),o=n.sliders.find(d=>d.label.toLowerCase().includes(i));o&&o.drive(s,t)},tab(e=0){return n.tabGroups[e]?n.tabGroups[e].activeIdx:0},selectTab(e=0,s=0){let t=n.tabGroups[e];t&&t.btns[s]&&t.btns[s].click()},clickBtn(e){let s=e.toLowerCase(),t=n.buttons.find(i=>i.label.toLowerCase().includes(s));t&&t.btn.click()},readout(){return n.readoutText||""},get interacted(){return n.interacted},get watched(){return n.watched}}}function $(n,e){if(!y.getPrefs().sonify)return;let s=n.audio?.()?.ctx;s&&ee(s,{dir:e,gain:.04})}function fe(n,e){for(let s of n.sliders){if(!s.wrap||s.wrap.querySelector(".live-slider-track"))continue;let t=s.input,i=document.createElement("div");i.className="live-slider-track";let o=document.createElement("button");o.type="button",o.className="live-step-btn",o.textContent="\u2212",o.setAttribute("aria-label",`Decrease ${s.label}`);let d=document.createElement("button");d.type="button",d.className="live-step-btn",d.textContent="+",d.setAttribute("aria-label",`Increase ${s.label}`);let l=(u,p)=>{let a=p?.shiftKey?5:1,b=+t.value,v=Number.isFinite(s.step)&&s.step>0?s.step:1,w=b+u*v*a,h=Math.max(s.min,Math.min(s.max,w)),S=(String(v).split(".")[1]||"").length,x=+h.toFixed(Math.min(6,S+1));x!==b&&(s.drive(x,"user"),$(e,u))};o.addEventListener("click",u=>l(-1,u)),d.addEventListener("click",u=>l(1,u)),t.parentNode.insertBefore(i,t),i.append(o,t,d)}}function ne(n){let e=P.getState(n);return e?JSON.stringify(e):null}function R(n,e,s,t,i,o){let d={seq:++ue,t:Date.now(),actor:t||"user",widget:n,lesson:e.dataset.activeLesson||null,kind:i?.kind||"update",control:i?.label||null,value:i?.value??null,readout:s.readoutText||"",stamped:!!o},l=W.get(n)||[];if(l.push(d),l.length>100&&l.shift(),W.set(n,l),typeof window<"u"&&(window.dispatchEvent(new CustomEvent("live:io-event",{detail:d})),typeof window.kymPhysicsNotify=="function"))try{window.kymPhysicsNotify({kind:"live_io_event",widgetId:n,actor:d.actor,responseText:d.readout,eventJSON:JSON.stringify(d),stateJSON:ne(e)})}catch{}return d}function me(n,e,s,t){if(typeof window>"u")return;let i=/^c(?:h)?(\d+)[_-]|^fig-(\d+)-/.exec(e.id||"")||/ch(?:apter-)?(\d+)/i.exec(e.closest("article")?.id||""),o=i?parseInt(i[1]||i[2],10):null;if(typeof window.kymPhysicsNotify=="function")try{window.kymPhysicsNotify({kind:"live_io_stamp",widgetId:n,chapter:o,actor:t||"user",responseText:s.readoutText||"",payloadJSON:ne(e)})}catch{}}function T(n){if(!n){let e=Array.from(I.values());return e[e.length-1]||null}if(typeof n=="string"){for(let e of I.values())if(e.fig.id===n||e.name===n||e.fig.dataset.activeLesson===n)return e;return null}return I.has(n)?I.get(n):null}function A(n,e,s={}){let t=document.createElement("button");return t.type="button",t.className="live-studio-pill",t.textContent=n,e&&t.setAttribute("aria-label",e),s.pressed!=null&&t.setAttribute("aria-pressed",String(!!s.pressed)),s.expanded!=null&&t.setAttribute("aria-expanded",String(!!s.expanded)),t}function ve(n,e,s){if(!e||!e.prompt)return null;let t=document.createElement("div");t.className="live-challenge";let i=document.createElement("span");i.className="live-challenge-text",i.innerHTML=`<strong>Challenge:</strong> ${e.prompt}`;let o=document.createElement("span");return o.className="live-stamp"+(s?" is-stamped":""),o.setAttribute("role","status"),o.textContent=s?"\u2713 Stamped":"\u25CE Goal",t.append(i,o),n.insertBefore(t,n.firstChild),o}function he(n,e,s,t,i,o,d,l){let u=null,p=null,a=!1;o&&(u=document.createElement("div"),u.className="live-cutaway-card",u.setAttribute("data-glass","1"),u.hidden=!0,u.innerHTML=`<span class="live-cutaway-badge">\u25D0 Cut-away inside view</span><p>${o}</p>`,n.appendChild(u));let b=k=>{if(a=!!k,u&&(u.hidden=!a),p&&p.setAttribute("aria-pressed",String(a)),typeof s.cutawayCb=="function")try{s.cutawayCb(a)}catch{}};if(!i||!i.length)return;let v=0,w=document.createElement("div");w.className="live-watch-bar";let h=document.createElement("button");h.type="button",h.className="live-ctl live-watch-btn",h.textContent="\u25B6 Watch 5-shot tour",h.setAttribute("aria-pressed","false");let S=document.createElement("div");S.className="live-watch-dots";let x=document.createElement("span");x.className="live-watch-caption",x.textContent="Tap Watch or any step 1\u20135 for a guided tour.";let B=i.map((k,f)=>{let m=document.createElement("button");return m.type="button",m.className="live-watch-dot",m.textContent=String(f+1),m.title=k.title||`Shot ${f+1}`,m.setAttribute("aria-label",k.title||`Shot ${f+1}`),m.addEventListener("click",()=>{g(),O(f)}),S.appendChild(m),m});(o||s.cutawayCb)&&(p=document.createElement("button"),p.type="button",p.className="live-ctl live-cutaway-btn",p.textContent="\u25D0 Cut-away",p.setAttribute("aria-pressed","false"),p.addEventListener("click",()=>{b(!a),window.__bookSound&&window.__bookSound.play("flap")}));function O(k){let f=i[k];if(!f)return;B.forEach((E,C)=>E.classList.toggle("is-active",C===k)),x.textContent=f.caption||f.title||"",f.cutaway!=null&&b(!!f.cutaway);let m=f.act||f.enter;if(typeof m=="function"){s.setActor("tour");try{m(t)}catch{}finally{s.setActor("user")}}k===i.length-1&&s.setWatched(!0)}function g(){v&&(clearInterval(v),v=0),h.setAttribute("aria-pressed","false"),h.textContent="\u25B6 Watch 5-shot tour"}h.addEventListener("click",()=>{if(v){g();return}let k=0;h.setAttribute("aria-pressed","true"),h.textContent="\u25A0 Stop tour",O(0),v=setInterval(()=>{if(k++,k>=i.length){g();return}O(k)},2100)}),d.onCleanup(g),d.onHide(g),w.append(h,S),p&&w.appendChild(p),w.appendChild(x),e.insertBefore(w,l)}function ye(n,e,s,t,i){let o=document.createElement("div");o.className="live-studio-popover",o.hidden=!0;let d=()=>{let a=y.getPrefs();s&&s.setAttribute("aria-pressed",String(!!a.sonify)),o.querySelectorAll("[data-pref-key]").forEach(b=>{let v=b.dataset.prefKey,w=v==="units"?a.units==="kmh":!!a[v];b.setAttribute("aria-checked",String(w)),v==="units"?b.textContent=a.units==="kmh"?"km/h":"m/s":b.textContent=w?"On":"Off"})};for(let[a,b]of[["units","Speed units"],["colorblind","Colour-blind palette"],["highlights","Interactive highlights"],["sonify","Sound & sonification"]]){let v=document.createElement("div");v.className="live-pref-row";let w=document.createElement("span");w.textContent=b;let h=document.createElement("button");h.type="button",h.className="live-pref-btn",h.setAttribute("role","switch"),h.dataset.prefKey=a,h.addEventListener("click",()=>{let S=y.getPrefs();if(a==="units")y.setPrefs({units:S.units==="kmh"?"si":"kmh"});else{let x=!S[a];if(y.setPrefs({[a]:x}),a==="sonify")if(x)$(t,1);else{t.audio?.().stop?.();try{t._ext?.sonifyHook?.(0,i.t,y.getPrefs())}catch{}}}d()}),v.append(w,h),o.appendChild(v)}d();let l=document.createElement("div");l.className="live-keys-modal",l.hidden=!0,l.setAttribute("role","dialog"),l.setAttribute("aria-label","Simulation keyboard shortcuts"),l.innerHTML=`
    <div class="live-keys-head">
      <strong>Keyboard Shortcuts</strong>
      <button type="button" class="live-pref-btn live-keys-close">Close</button>
    </div>
    <div class="live-keys-grid">
      <div><span class="live-keycap">Space</span>Play / Pause</div>
      <div><span class="live-keycap">.</span>Step forward +1 frame</div>
      <div><span class="live-keycap">S</span>Toggle \xBC\xD7 Slow motion</div>
      <div><span class="live-keycap">R</span>Replay (Shift+R Reset all)</div>
      <div><span class="live-keycap">O</span>Toggle Open Play mode</div>
      <div><span class="live-keycap">H</span>Toggle Focus highlights</div>
      <div><span class="live-keycap">Arrows</span>Adjust focused slider</div>
      <div><span class="live-keycap">Esc</span>Close dialogs</div>
    </div>`;let u=null,p=(a=!1)=>{let b=!o.hidden||!l.hidden;o.hidden=!0,l.hidden=!0,n.setAttribute("aria-expanded","false"),e.setAttribute("aria-expanded","false"),a&&b&&u&&(u.focus({preventScroll:!0}),u=null)};return n.addEventListener("click",()=>{let a=o.hidden;p(!1),o.hidden=!a,n.setAttribute("aria-expanded",String(a)),a&&(u=n,d(),o.querySelector(".live-pref-btn")?.focus?.({preventScroll:!0}))}),e.addEventListener("click",()=>{let a=l.hidden;p(!1),l.hidden=!a,e.setAttribute("aria-expanded",String(a)),a&&(u=e,l.querySelector(".live-keys-close")?.focus?.({preventScroll:!0}))}),l.querySelector(".live-keys-close").addEventListener("click",()=>p(!0)),{prefsPopover:o,keysModal:l,syncPrefSwitches:d,closeOverlays:p}}function be(n,e,s,t,i,o,d,l,u={}){de();let p=(window.__liveEnhancements||{})[n]||{},a=i._ext,b=pe(a),v=a.challenge||p.challenge,w=a.yourNumbers!==null||!!p.yourNumbers,h=a.watch||p.watch,S=a.cutaway||p.cutaway,x=a.idealised||p.idealised,B=p.presets||[];for(let r of a.buttons)r.initialPressed===void 0&&(r.initialPressed=r.btn.getAttribute("aria-pressed"));fe(a,i);let O="mw:stamp:"+n,g=!1;try{g=localStorage.getItem(O)==="1"}catch{}let k=ve(s,v,g),f=null;if(w){f=document.createElement("div"),f.className="live-your-numbers",f.setAttribute("aria-live","off");let r=document.createElement("span");r.className="live-yn-badge",r.textContent="Your numbers";let c=document.createElement("span");c.className="live-yn-eq",f.append(r,c),t.insertBefore(f,t.firstChild)}he(s,t,a,b,h,S,i,f?f.nextSibling:t.firstChild);let m=document.createElement("div");m.className="live-studio-bar",m.setAttribute("role","toolbar"),m.setAttribute("aria-label","Simulation transport and preferences");let E=t.querySelector(".live-play");E&&!E.hidden&&m.appendChild(E);let C=null,D=null;d.playbackSupported!==!1&&(D=A("+1 Step","Step forward one frame"),D.addEventListener("click",()=>{d.stepOnce?.(.05),$(i,1),R(n,e,a,"user",{kind:"button",label:"Step"},g)}),C=A("Slow \xBC\xD7","Toggle slow motion quarter speed",{pressed:!1}),C.addEventListener("click",()=>{let r=d.speed>=.5;d.setSpeed?.(r?.25:1),C.setAttribute("aria-pressed",String(r)),R(n,e,a,"user",{kind:"button",label:"Slow",value:r?.25:1},g)}),m.append(D,C));let M=A("Replay","Replay from start keeping current controls");M.addEventListener("click",()=>{a.setActor("reset");try{if(d.t=0,typeof a.resetHooks?.replay=="function")a.resetHooks.replay();else if(typeof l?.replay=="function")l.replay();else{let r=a.buttons.find(c=>/^(replay|release|launch|restart|drop|fire)\b/i.test(c.label));r&&r.btn.click()}i.redraw?.()}finally{a.setActor("user")}R(n,e,a,"user",{kind:"button",label:"Replay"},g)});let U=A("Reset","Reset all controls and simulation"),J=()=>{let r=typeof a.resetHooks?.resetAll=="function"||typeof l?.resetAll=="function";a.setActor("reset");try{if(d.t=0,d.setSpeed?.(1),C&&C.setAttribute("aria-pressed","false"),r){for(let c of a.tabGroups)c.btns.setActive&&c.btns.setActive(c.initialIdx);for(let c of a.sliders)c.set(c.initialValue);for(let c of a.buttons)c.initialPressed!=null&&c.btn.setAttribute("aria-pressed",c.initialPressed);typeof a.resetHooks?.resetAll=="function"?a.resetHooks.resetAll():l.resetAll()}else{for(let c of a.tabGroups)c.btns[c.initialIdx]&&c.activeIdx!==c.initialIdx&&c.btns[c.initialIdx].click();for(let c of a.sliders)c.drive(c.initialValue,"reset");for(let c of a.buttons)c.initialPressed!=null&&c.btn.getAttribute("aria-pressed")!==c.initialPressed&&c.btn.click()}i.redraw?.()}finally{a.setActor("user")}R(n,e,a,"reset",{kind:"reset",label:"Reset"},g)};U.addEventListener("click",J),m.append(M,U);let H=null;a.sonifyHook&&(H=A("Sonify","Toggle opt-in physics sonification",{pressed:!!y.getPrefs().sonify}),H.addEventListener("click",()=>{let r=!y.getPrefs().sonify;if(y.setPrefs({sonify:r}),H.setAttribute("aria-pressed",String(r)),r)$(i,1);else{i.audio?.().stop?.();try{a.sonifyHook(0,d.t,y.getPrefs())}catch{}}}),m.appendChild(H));let K=A("Open Play","Hide hints and equations for unstructured exploration",{pressed:!u.lesson&&!!y.getPrefs().openPlay}),z=r=>{u.lesson||(e.classList.toggle("live-openplay",!!r),K.setAttribute("aria-pressed",String(!!r)))};u.lesson||(z(!!y.getPrefs().openPlay),K.addEventListener("click",()=>{let r=!e.classList.contains("live-openplay");y.setPrefs({openPlay:r}),z(r)}),m.appendChild(K));let j=document.createElement("span");j.className="live-studio-sep",j.setAttribute("aria-hidden","true");let V=A("\u2699 Prefs","Simulation display and unit preferences",{expanded:!1}),G=A("? Keys","Keyboard shortcuts for this simulation",{expanded:!1});m.append(j,V,G);let N=null;if(B.length){N=document.createElement("div"),N.className="live-studio-presets";let r=document.createElement("span");r.className="live-studio-presets-lbl",r.textContent="Presets:",N.appendChild(r);for(let c of B){let _=A(c.name,c.prompt||c.name);_.addEventListener("click",()=>P.setState(e,c.state||{},{actor:"preset"})),N.appendChild(_)}}let{prefsPopover:se,keysModal:ie,syncPrefSwitches:Y,closeOverlays:re}=ye(V,G,H,i,d),X=r=>{let c=(r.target?.tagName||"").toUpperCase();if(!(c==="TEXTAREA"||c==="SELECT"||c==="INPUT"&&r.target.type!=="range")){if(r.key==="Escape"){re(!0);return}if(!(r.metaKey||r.ctrlKey||r.altKey)){if(r.key==="?"||r.key==="/"&&r.shiftKey){r.preventDefault(),G.click();return}r.key===" "&&c!=="BUTTON"&&c!=="INPUT"?E&&!E.hidden&&(r.preventDefault(),E.click()):r.key==="."?D&&(r.preventDefault(),D.click()):r.key==="s"||r.key==="S"?C&&(r.preventDefault(),C.click()):r.key==="r"&&!r.shiftKey?(r.preventDefault(),M.click()):r.key==="R"&&r.shiftKey?(r.preventDefault(),U.click()):(r.key==="o"||r.key==="O")&&!u.lesson?(r.preventDefault(),K.click()):(r.key==="h"||r.key==="H")&&(r.preventDefault(),y.setPrefs({highlights:!y.getPrefs().highlights}),Y())}}};e.addEventListener("keydown",X),i.onCleanup(()=>e.removeEventListener("keydown",X));let ae=t.querySelector(".live-watch-bar")||f||t.firstChild;if(t.insertBefore(m,ae),N&&m.after(N),(N||m).after(se,ie),x){let r=document.createElement("p");r.className="live-idealised",r.innerHTML=`<strong>What the model simplifies:</strong> ${x}`,t.appendChild(r)}let Q="",Z=(r=a.getActor?.()||"user",c=null)=>{let _=a.yourNumbers!==null?a.yourNumbers:p.yourNumbers;if(f&&_!=null){let L=typeof _=="function"?_(b):String(_);L&&L!==Q&&(f.querySelector(".live-yn-eq").textContent=L,Q=L)}if(!g&&r==="user"&&v&&typeof v.check=="function"){let L=!1;try{L=!!v.check(b)}catch{L=!1}if(L){g=!0;try{localStorage.setItem(O,"1")}catch{}if(k&&(k.textContent="\u2713 Stamped",k.classList.add("is-stamped","just-stamped")),o&&!o.querySelector(".live-open-stamp")){let q=document.createElement("em");q.className="live-open-stamp",q.textContent="\u2713",q.title="Challenge completed",o.appendChild(q)}window.__bookSound&&window.__bookSound.play("stamp"),me(n,e,a,r)}}c&&c.kind!=="readout"&&R(n,e,a,r,c,g)};a.changeListeners.add(Z);let oe=y.onPrefs(Y);i.onCleanup(oe);let le={name:n,fig:e,stage:s,controls:t,api:i,state:d,inst:l,ext:a,isStamped:()=>g,doResetAll:J};I.set(e,le),Z("model",{kind:"mount"})}function ge(n,e){I.delete(e)}function ke(n){return new Promise(e=>{let s=()=>{clearTimeout(i),n.removeEventListener("live:mounted",t),e(T(n))},t=()=>s(),i=setTimeout(s,5e3);n.addEventListener("live:mounted",t,{once:!0})})}var P={list(){return Array.from(I.values()).map(n=>({widget:n.name,figId:n.fig.id||null,lesson:n.fig.dataset.activeLesson||null,stamped:n.isStamped()}))},getState(n){let e=T(n);if(!e)return null;let s={};for(let o of e.ext.sliders)s[o.label]=+o.input.value;let t=e.ext.tabGroups.map(o=>o.activeIdx),i=typeof e.inst?.getState=="function"?e.inst.getState():null;return{version:1,widget:e.name,figId:e.fig.id||null,lesson:e.fig.dataset.activeLesson||null,sliders:s,tabs:t,custom:i,readout:e.ext.readoutText||"",stamped:e.isStamped(),prefs:{...y.getPrefs()}}},setState(n,e={},{actor:s="preset"}={}){let t=T(n);if(!t||!e)return null;e.prefs&&typeof e.prefs=="object"&&y.setPrefs(e.prefs),t.ext.setActor(s);try{if(Array.isArray(e.tabs)&&e.tabs.forEach((i,o)=>{let d=t.ext.tabGroups[o];d&&d.btns[i]&&d.activeIdx!==i&&d.btns[i].click()}),e.sliders&&typeof e.sliders=="object")for(let[i,o]of Object.entries(e.sliders)){let d=i.toLowerCase(),l=t.ext.sliders.find(u=>u.label===i||u.label.toLowerCase().includes(d));l&&Number.isFinite(+o)&&l.drive(+o,s)}e.custom&&typeof t.inst?.setState=="function"&&t.inst.setState(e.custom);for(let i of t.api._loops)i(0,t.state.t)}finally{t.ext.setActor("user")}return R(t.name,t.fig,t.ext,s,{kind:"preset",label:"setState"},t.isStamped()),P.getState(t.fig)},async openPreset(n,e={}){let s=T(n);if(!s){let t=document.getElementById(n)||document.querySelector(`figure[data-live="${n}"]`);if(!t)return null;let i=t.querySelector(".live-open");if(i&&!t.classList.contains("live-on")){t.scrollIntoView({behavior:"instant",block:"center"});let o=ke(t);i.click(),s=await o}else s=T(t)}return s?(s.fig.scrollIntoView({behavior:"instant",block:"center"}),P.setState(s.fig,e,{actor:"preset"})):null},capturePNG(n){let e=T(n);if(!e)return null;for(let i of e.api._loops)i(0,e.state.t);let s=e.stage.querySelector("canvas"),t="";if(s)try{t=s.toDataURL("image/png")}catch{t=""}return{pngDataUrl:t,state:P.getState(e.fig),readout:e.ext.readoutText||"",timestamp:Date.now()}},getEventLog(n){let e=T(n),s=e?e.name:typeof n=="string"?n:null,t=s?(W.get(s)||[]).slice():[],i=t.filter(l=>l.actor==="user"&&l.kind!=="mount"),o=new Set(i.filter(l=>l.control).map(l=>l.control)),d=0;for(let l=1;l<i.length;l++)i[l].control&&i[l].control===i[l-1].control&&d++;return{events:t,processSummary:{variablesChangedCount:o.size,singleVariableSteps:d,totalUserActions:i.length,watchTourUsed:t.some(l=>l.actor==="tour")}}},shareUrl(n){let e=P.getState(n);if(!e)return"";let s={widget:e.widget,state:{sliders:e.sliders,tabs:e.tabs,custom:e.custom}},t=btoa(unescape(encodeURIComponent(JSON.stringify(s)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),i=e.figId?`#${e.figId}`:typeof location<"u"?location.hash:"";return`${location.origin}${location.pathname}?preset=${t}${i}`}};function F(){if(typeof location>"u")return;let e=new URLSearchParams(location.search).get("preset");if(!e&&location.hash.includes("preset=")){let s=/preset=([^&#]+)/.exec(location.hash);s&&(e=s[1])}if(e)try{let s=e.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((e.length+3)%4),t=JSON.parse(decodeURIComponent(escape(atob(s))));t&&t.widget&&t.state&&queueMicrotask(()=>{P.openPreset(t.widget,t.state)})}catch{}}typeof window<"u"&&(window.__liveStudio={attach:be,detach:ge},window.LiveIO=P,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",F,{once:!0}):queueMicrotask(F),window.addEventListener("hashchange",F));export{P as LiveIO};
