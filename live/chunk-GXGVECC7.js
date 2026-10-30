import{$ as I,Ad as X,Bd as K,Cd as b,Dd as N,Ha as k,Mf as J,Pc as R,Rc as C,Uc as Q,_ as z,_b as G,_c as V,_e as W,aa as O,ag as Y,ba as L,ca as D,da as U,ea as B,ld as j,o as F,yd as w,zd as H}from"./chunk-RJJSQFJM.js";var u=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},ie=new J(-1,1,1,-1,0,1),y=class extends H{constructor(){super(),this.setAttribute("position",new w([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new w([0,2,0,0,2,0],2))}},re=new y,x=class{constructor(e){this._mesh=new X(re,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,ie)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var T=class extends u{constructor(e,s="tDiffuse"){super(),this.textureID=s,this.uniforms=null,this.material=null,e instanceof N?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=b.clone(e.uniforms),this.material=new N({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new x(this.material)}render(e,s,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var q={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var M=class extends u{constructor(e,s){super(),this.scene=e,this.camera=s,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,s,i){let a=e.getContext(),t=e.state;t.buffers.color.setMask(!1),t.buffers.depth.setMask(!1),t.buffers.color.setLocked(!0),t.buffers.depth.setLocked(!0);let o,l;this.inverse?(o=0,l=1):(o=1,l=0),t.buffers.stencil.setTest(!0),t.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),t.buffers.stencil.setFunc(a.ALWAYS,o,4294967295),t.buffers.stencil.setClear(l),t.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),t.buffers.color.setLocked(!1),t.buffers.depth.setLocked(!1),t.buffers.color.setMask(!0),t.buffers.depth.setMask(!0),t.buffers.stencil.setLocked(!1),t.buffers.stencil.setFunc(a.EQUAL,1,4294967295),t.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),t.buffers.stencil.setLocked(!0)}},A=class extends u{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Z=class{constructor(e,s){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),s===void 0){let i=e.getSize(new R);this._width=i.width,this._height=i.height,s=new V(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:k}),s.texture.name="EffectComposer.rt1"}else this._width=s.width,this._height=s.height;this.renderTarget1=s,this.renderTarget2=s.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new T(q),this.copyPass.material.blending=F,this.clock=new Y}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,s){this.passes.splice(s,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let s=this.passes.indexOf(e);s!==-1&&this.passes.splice(s,1)}isLastEnabledPass(e){for(let s=e+1;s<this.passes.length;s++)if(this.passes[s].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());let s=this.renderer.getRenderTarget(),i=!1;for(let a=0,t=this.passes.length;a<t;a++){let o=this.passes[a];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(a),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),o.needsSwap){if(i){let l=this.renderer.getContext(),g=this.renderer.state.buffers.stencil;g.setFunc(l.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),g.setFunc(l.EQUAL,1,4294967295)}this.swapBuffers()}M!==void 0&&(o instanceof M?i=!0:o instanceof A&&(i=!1))}}this.renderer.setRenderTarget(s)}reset(e){if(e===void 0){let s=this.renderer.getSize(new R);this._pixelRatio=this.renderer.getPixelRatio(),this._width=s.width,this._height=s.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,s){this._width=e,this._height=s;let i=this._width*this._pixelRatio,a=this._height*this._pixelRatio;this.renderTarget1.setSize(i,a),this.renderTarget2.setSize(i,a);for(let t=0;t<this.passes.length;t++)this.passes[t].setSize(i,a)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var $=class extends u{constructor(e,s,i=null,a=null,t=null){super(),this.scene=e,this.camera=s,this.overrideMaterial=i,this.clearColor=a,this.clearAlpha=t,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new j}render(e,s,i){let a=e.autoClear;e.autoClear=!1;let t,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(t=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(t),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=a}};var v={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var ee=class extends u{constructor(){super(),this.uniforms=b.clone(v.uniforms),this.material=new W({name:v.name,uniforms:this.uniforms,vertexShader:v.vertexShader,fragmentShader:v.fragmentShader}),this._fsQuad=new x(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,s,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Q.getTransfer(this._outputColorSpace)===G&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===z?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===I?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===O?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===L?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===U?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===B?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===D&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var S=new C;function p(f,e,s,i,a,t){let o=2*Math.PI*a/4,l=Math.max(t-2*a,0),g=Math.PI/4;S.copy(e),S[i]=0,S.normalize();let r=.5*o/(o+l),_=1-S.angleTo(f)/g;return Math.sign(S[s])===1?_*r:l/(o+l)+r+r*(1-_)}var te=class f extends K{constructor(e=1,s=1,i=1,a=2,t=.1){let o=a*2+1;if(t=Math.min(e/2,s/2,i/2,t),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:e,height:s,depth:i,segments:a,radius:t},o===1)return;let l=this.toNonIndexed();this.index=null,this.attributes.position=l.attributes.position,this.attributes.normal=l.attributes.normal,this.attributes.uv=l.attributes.uv;let g=new C,r=new C,_=new C(e,s,i).divideScalar(2).subScalar(t),d=this.attributes.position.array,P=this.attributes.normal.array,c=this.attributes.uv.array,se=d.length/6,n=new C,E=.5/o;for(let m=0,h=0;m<d.length;m+=3,h+=2)switch(g.fromArray(d,m),r.copy(g),r.x-=Math.sign(r.x)*E,r.y-=Math.sign(r.y)*E,r.z-=Math.sign(r.z)*E,r.normalize(),d[m+0]=_.x*Math.sign(g.x)+r.x*t,d[m+1]=_.y*Math.sign(g.y)+r.y*t,d[m+2]=_.z*Math.sign(g.z)+r.z*t,P[m+0]=r.x,P[m+1]=r.y,P[m+2]=r.z,Math.floor(m/se)){case 0:n.set(1,0,0),c[h+0]=p(n,r,"z","y",t,i),c[h+1]=1-p(n,r,"y","z",t,s);break;case 1:n.set(-1,0,0),c[h+0]=1-p(n,r,"z","y",t,i),c[h+1]=1-p(n,r,"y","z",t,s);break;case 2:n.set(0,1,0),c[h+0]=1-p(n,r,"x","z",t,e),c[h+1]=p(n,r,"z","x",t,i);break;case 3:n.set(0,-1,0),c[h+0]=1-p(n,r,"x","z",t,e),c[h+1]=1-p(n,r,"z","x",t,i);break;case 4:n.set(0,0,1),c[h+0]=1-p(n,r,"x","y",t,e),c[h+1]=1-p(n,r,"y","x",t,s);break;case 5:n.set(0,0,-1),c[h+0]=p(n,r,"x","y",t,e),c[h+1]=1-p(n,r,"y","x",t,s);break}}static fromJSON(e){return new f(e.width,e.height,e.depth,e.segments,e.radius)}};export{T as a,Z as b,$ as c,ee as d,te as e};
