// Exercise the actual raw-pool and api.gl source with deterministic GL/DOM fakes.
// Browser context-limit receipts remain the coordinator's integration gate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../live/core.js',import.meta.url),'utf8');
const helpers=source.slice(source.indexOf('// Raw fragment-shader pool.'),source.indexOf('// End raw fragment-shader pool.'));
const method=source.slice(source.indexOf('    gl(fragment, uniforms = {},'),source.indexOf('\n    _loops:'));
const stats={contexts:0,shaders:0,deleteShaders:0,programs:0,deletePrograms:0,buffers:0,deleteBuffers:0,lossCalls:0,draws:0,detachErrors:0};
let compileFailure=false,linkFailure=false,allocFailure=false;
const contexts=[];
function createGL(){
 const attached=new Map(),data={lost:false,uniforms:{}};
 const fn={isContextLost:()=>data.lost,getParameter:()=>4,createShader:type=>{stats.shaders++;return {type};},getShaderParameter:shader=>!(compileFailure&&shader.type==='FRAGMENT_SHADER'),getShaderInfoLog:()=> 'test compilation failure',createProgram:()=>{stats.programs++;const p={};attached.set(p,new Set());return p;},attachShader:(p,s)=>attached.get(p).add(s),detachShader:(p,s)=>{if(!attached.get(p).delete(s)){stats.detachErrors++;throw Error('detached unattached shader');}},getProgramParameter:()=>!linkFailure,getProgramInfoLog:()=> 'test link failure',deleteShader:()=>stats.deleteShaders++,deleteProgram:()=>stats.deletePrograms++,createBuffer:()=>{if(allocFailure)return null;stats.buffers++;return {};},deleteBuffer:()=>stats.deleteBuffers++,getAttribLocation:()=>0,getUniformLocation:(p,n)=>({n}),uniform1f:(l,v)=>data.uniforms[l.n]=v,drawArrays:()=>stats.draws++,getExtension:()=>({loseContext(){stats.lossCalls++;data.lost=true;}})};
 const gl=new Proxy(data,{get:(o,k)=>k in fn?fn[k]:k in o?o[k]:k.startsWith('MAX_')?k:k.toUpperCase()===k?k:()=>{}});contexts.push(gl);return gl;
}
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.listeners=[];this.attrs={};this.style={setProperty(){}};this.dataset={};this.clientWidth=640;this.clientHeight=360;this.width=300;this.height=150;this.hidden=false;}
 appendChild(child){child.remove();this.children.push(child);child.parent=this;return child;}
 remove(){if(this.parent){const i=this.parent.children.indexOf(this);if(i>=0)this.parent.children.splice(i,1);this.parent=null;}}
 setAttribute(k,v){this.attrs[k]=v;}
 removeAttribute(k){delete this.attrs[k];if(k==='style')this.style={setProperty(){}};}
 querySelector(){return null;}
 addEventListener(type,listener,options){this.listeners.push({type,listener,options});}
 removeEventListener(type,listener){this.listeners=this.listeners.filter(x=>x.type!==type||x.listener!==listener);}
 dispatchEvent(event){for(const x of [...this.listeners])if(x.type===event.type)x.listener(event);return true;}
 hasPointerCapture(id){return this.captures?.has(id)||false;}
 setPointerCapture(id){(this.captures??=new Set()).add(id);}
 releasePointerCapture(id){this.captures?.delete(id);}
 getBoundingClientRect(){return {left:0,top:0,width:640,height:360};}
 getContext(type){if(type==='2d')return {};if(!this.gl){stats.contexts++;this.gl=createGL();}return this.gl;}
}
let simulatedMs=0,nextTimer=0;const timers=new Map();
const sandbox={performance:{now:()=>simulatedMs},setTimeout(fn,delay){const id=++nextTimer;timers.set(id,{fn,at:simulatedMs+delay});return id;},clearTimeout(id){timers.delete(id);},document:{createElement:tag=>new Element(tag)},window:{devicePixelRatio:1},CustomEvent:class{constructor(type){this.type=type;}},ResizeObserver:class{observe(){}disconnect(){}},Float32Array,Set,Math,console};
vm.createContext(sandbox);
vm.runInContext(helpers+`\nfunction makeFixture(){const fig=document.createElement('figure'),stage=document.createElement('div'),controls=document.createElement('div'),state={t:0},cleanups=[],loops=new Set();const note=()=>{};const sizeCanvas=(cv)=>{cv.style.cursor='';};const api={onCleanup(fn){cleanups.push(fn);},loop(fn){loops.add(fn);},canvas(){const cv=document.createElement('canvas');stage.appendChild(cv);return {cv,ctx:{}};},${method}};const close=()=>cleanups.forEach(fn=>fn());fig.addEventListener('close-lesson',close);return {api,fig,stage,loops,close,state};}\n`,sandbox);
const make=()=>vm.runInContext('makeFixture()',sandbox);
let firstCanvas=null,oldCalls=0;
for(let i=0;i<60;i++){
 const f=make(),ctl=f.api.gl('void main(){gl_FragColor=vec4(1.);}',{u_value:i},{fallback(){}});
 assert.ok(ctl.ok);firstCanvas??=ctl.canvas;assert.equal(ctl.canvas,firstCanvas);ctl.canvas.style.cursor='grab';ctl.canvas.addEventListener('pointerdown',()=>oldCalls++);
 ctl.set('u_value',i+1);for(const loop of f.loops)loop(0,i);f.close();assert.equal(ctl.canvas.listeners.length,0);assert.equal(ctl.canvas.width,1);assert.equal(ctl.canvas.style.cursor,undefined);ctl.draw();
}
assert.equal(stats.contexts,1);assert.equal(stats.lossCalls,0);assert.equal(stats.programs,stats.deletePrograms);assert.equal(stats.buffers,stats.deleteBuffers);assert.equal(stats.shaders,stats.deleteShaders);
firstCanvas.dispatchEvent({type:'pointerdown'});assert.equal(oldCalls,0);
// A new raw figure must close the prior owner before moving the same canvas.
const a=make(),ac=a.api.gl('ok'),b=make(),bc=b.api.gl('ok');assert.equal(ac.ok,false);assert.equal(a.stage.children.length,0);assert.equal(b.stage.children.length,1);assert.equal(bc.canvas,firstCanvas);b.close();
// Shader/link/buffer failures return the healthy context and delete partial resources.
for(const failure of ['compile','link','buffer']){
 compileFailure=failure==='compile';linkFailure=failure==='link';allocFailure=failure==='buffer';let painted=0;
 const f=make(),ctl=f.api.gl('invalid',{u_value:7},{fallback(ctx,w,h,U,t){painted++;assert.equal(U.u_value,7);}});assert.equal(ctl.ok,false);assert.ok(painted>0);f.close();
 compileFailure=linkFailure=allocFailure=false;
}
assert.equal(stats.detachErrors,0);assert.equal(stats.programs,stats.deletePrograms);assert.equal(stats.buffers,stats.deleteBuffers);assert.equal(stats.shaders,stats.deleteShaders);assert.equal(stats.contexts,1);
// Loss preserves uniforms and the shared clock while switching to a fresh 2D canvas.
const f=make(),frames=[],ctl=f.api.gl('ok',{u_value:11},{fallback(ctx,w,h,U,t){frames.push([U.u_value,t]);}}),gpuCanvas=ctl.canvas;
for(const loop of f.loops)loop(0,3.25);contexts[0].lost=true;gpuCanvas.dispatchEvent({type:'webglcontextlost',preventDefault(){}});assert.equal(ctl.ok,false);assert.notEqual(ctl.canvas,gpuCanvas);assert.deepEqual(frames.at(-1),[11,3.25]);ctl.set('u_value',12);for(const loop of f.loops)loop(.1,3.35);assert.deepEqual(frames.at(-1),[12,3.35]);f.close();assert.equal(gpuCanvas.listeners.length,0);
const after=make(),afterCtl=after.api.gl('ok');assert.equal(afterCtl.ok,true);assert.equal(stats.contexts,2);assert.notEqual(afterCtl.canvas,gpuCanvas);after.close();assert.equal(stats.lossCalls,0);
console.log('PASS raw WebGL: 60 serial loans/one context, prior-owner close, listener/resource cleanup, failure recovery and loss fallback clock/uniforms');

// Public surface-change subscriptions: immediate, fallback replacement, close and unsubscribe.
const watchFixture=make(),watchCtl=watchFixture.api.gl('ok',{}, {fallback(){}}),surfaces=[],unsubscribed=[];
watchCtl.onCanvasChange(cv=>surfaces.push(cv));const unsubscribe=watchCtl.onCanvasChange(cv=>unsubscribed.push(cv));unsubscribe();const watchedGPU=watchCtl.canvas;watchedGPU.gl.lost=true;watchedGPU.dispatchEvent({type:'webglcontextlost',preventDefault(){}});assert.equal(surfaces.length,2);assert.equal(surfaces[1],watchCtl.canvas);assert.notEqual(surfaces[0],surfaces[1]);assert.equal(unsubscribed.length,1);watchFixture.close();assert.equal(surfaces.at(-1),null);let closedSurface='unset';watchCtl.onCanvasChange(cv=>closedSurface=cv);assert.equal(closedSurface,null);

// Exercise each widget's actual pointer-binding block through GPU -> 2D transfer.
const rippleSource=fs.readFileSync(new URL('../live/w_ripple.js',import.meta.url),'utf8'),skySource=fs.readFileSync(new URL('../live/w_skycolour.js',import.meta.url),'utf8');
const rippleBlock=rippleSource.slice(rippleSource.indexOf('  // Control 1:'),rippleSource.indexOf('  // Control 2:'));
const skyBlock=skySource.slice(skySource.indexOf('  // Control 3:'),skySource.indexOf('\n  sync();',skySource.indexOf('  // Control 3:')));
vm.runInContext(`function bindRipple(f,ctl){const api=f.api,gl=ctl,W=640,H=360,scrap={x0:410,y0:180},sources=[{x:230,y:180},{x:-100,y:-100},{x:-100,y:-100}],tabs=[document.createElement('button'),document.createElement('button')];let twoFingers=false,simT=5,updates=0;function syncUniforms(){updates++;gl.set('u_simT',simT);gl.set('u_s0',[sources[0].x,sources[0].y,simT,0]);}${rippleBlock};return {scrap,sources,get updates(){return updates;}};}
function bindSky(f,ctl){const api=f.api,gl=ctl,W=640;let pan=0,updates=0;function sync(){updates++;gl.set('u_pan',pan);}${skyBlock};return {get pan(){return pan;},get updates(){return updates;}};}`,sandbox);
function pointer(cv,type,x,y,id=7){cv.dispatchEvent({type,clientX:x,clientY:y,pointerId:id});}
function advance(ms){simulatedMs+=ms;for(const [id,timer] of [...timers])if(timer.at<=simulatedMs){timers.delete(id);timer.fn();}}
const rippleFixture=make(),rippleCtl=rippleFixture.api.gl('ok',{}, {fallback(){}}),ripple=sandbox.bindRipple(rippleFixture,rippleCtl),rippleGPU=rippleCtl.canvas;
pointer(rippleGPU,'pointerdown',100,80);pointer(rippleGPU,'pointerup',100,80);assert.equal(ripple.sources[0].x,100);
pointer(rippleGPU,'pointerdown',200,100);assert.equal(timers.size,1);rippleGPU.gl.lost=true;rippleGPU.dispatchEvent({type:'webglcontextlost',preventDefault(){}});assert.equal(timers.size,0);assert.equal(rippleGPU.listeners.length,0);assert.equal(rippleGPU.hasPointerCapture(7),false);const ripple2D=rippleCtl.canvas;
pointer(ripple2D,'pointerdown',320,140);pointer(ripple2D,'pointerup',320,140);assert.equal(ripple.sources[0].x,320);assert.equal(ripple.sources[0].y,140);
pointer(ripple2D,'pointerdown',500,220);advance(421);pointer(ripple2D,'pointerup',500,220);assert.equal(ripple.scrap.x0,500);assert.ok(Math.abs(ripple.scrap.y0-220)<1e-10);
pointer(ripple2D,'pointerdown',50,50);const updatesBeforeClose=ripple.updates;rippleFixture.close();advance(500);assert.equal(ripple.updates,updatesBeforeClose);assert.equal(ripple2D.listeners.length,0);assert.equal(ripple2D.hasPointerCapture(7),false);
const skyFixture=make(),skyCtl=skyFixture.api.gl('ok',{}, {fallback(){}}),sky=sandbox.bindSky(skyFixture,skyCtl),skyGPU=skyCtl.canvas;
pointer(skyGPU,'pointerdown',100,80);pointer(skyGPU,'pointermove',164,80);assert.ok(Math.abs(sky.pan-.1)<1e-10);skyGPU.gl.lost=true;skyGPU.dispatchEvent({type:'webglcontextlost',preventDefault(){}});const sky2D=skyCtl.canvas;
pointer(sky2D,'pointermove',300,80);assert.ok(Math.abs(sky.pan-.1)<1e-10,'old drag must be cancelled');pointer(sky2D,'pointerdown',100,80);pointer(sky2D,'pointermove',228,80);pointer(sky2D,'pointerup',228,80);assert.ok(Math.abs(sky.pan-.28)<1e-10);skyFixture.close();assert.equal(sky2D.listeners.length,0);
// Initial no-WebGL mounting uses exactly the same immediate binding path.
vm.runInContext('idleRawGL=null;activeRawGL=null;rawGLUnavailable=true;',sandbox);const noGLFixture=make(),noGLCtl=noGLFixture.api.gl('ok',{}, {fallback(){}}),noGLRipple=sandbox.bindRipple(noGLFixture,noGLCtl);assert.equal(noGLCtl.ok,false);pointer(noGLCtl.canvas,'pointerdown',280,160);pointer(noGLCtl.canvas,'pointerup',280,160);assert.equal(noGLRipple.sources[0].x,280);noGLFixture.close();
console.log('PASS raw canvas transfer: subscription/unsubscribe/close, ripple tap+long-press and sky drag after loss, initial no-WebGL gestures');
