#!/usr/bin/env python3
"""Long public-book session: bounded contexts, renderer reuse, retry and loading cancellation."""
import argparse,functools,hashlib,http.server,json,re,struct,threading,zlib
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--site',default='build/site');p.add_argument('--engine',default='webkit');a=p.parse_args()
site=(ROOT/a.site).resolve();out=ROOT/'build'/('labs-lifecycle-'+a.engine);out.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(site)))
threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_address[1]}/'
MONITOR="""const original=HTMLCanvasElement.prototype.getContext,seen=new WeakSet();window.webglContextsCreated=0;window.webglLiveBuffers=0;window.webglLivePrograms=0;
HTMLCanvasElement.prototype.getContext=function(t,...a){const g=original.call(this,t,...a);if(g&&/webgl/.test(t)&&!seen.has(g)){seen.add(g);webglContextsCreated++;
const buffers=new WeakSet(),create=g.createBuffer.bind(g),remove=g.deleteBuffer.bind(g);
g.createBuffer=()=>{const b=create();if(b){buffers.add(b);webglLiveBuffers++;}return b;};
g.deleteBuffer=b=>{if(b&&buffers.has(b)){buffers.delete(b);webglLiveBuffers--;}return remove(b);};
const programs=new WeakSet(),createP=g.createProgram.bind(g),removeP=g.deleteProgram.bind(g);
g.createProgram=()=>{const p=createP();if(p){programs.add(p);webglLivePrograms++;}return p;};
g.deleteProgram=p=>{if(p&&programs.has(p)){programs.delete(p);webglLivePrograms--;}return removeP(p);};}if(g&&t==='webgl')window.rawContext=g;return g;};
window.canvasPointerListeners=0;const events=new WeakMap(),add=HTMLCanvasElement.prototype.addEventListener,remove=HTMLCanvasElement.prototype.removeEventListener;
HTMLCanvasElement.prototype.addEventListener=function(type,fn,opts){if(/^pointer/.test(type)){let list=events.get(this);if(!list){list=[];events.set(this,list);}const cap=typeof opts==='boolean'?opts:!!opts?.capture;if(!list.some(x=>x[0]===type&&x[1]===fn&&x[2]===cap)){list.push([type,fn,cap]);canvasPointerListeners++;}}return add.call(this,type,fn,opts);};
HTMLCanvasElement.prototype.removeEventListener=function(type,fn,opts){const list=events.get(this),cap=typeof opts==='boolean'?opts:!!opts?.capture;if(list){const i=list.findIndex(x=>x[0]===type&&x[1]===fn&&x[2]===cap);if(i>=0){list.splice(i,1);canvasPointerListeners--;}}return remove.call(this,type,fn,opts);};"""
def open_lesson(page,ident):
    if ident in ['ripple','skycolour']:
        f=page.locator(f'figure[data-live="{ident}"]').first
        page.evaluate('(id)=>location.hash=id',f.get_attribute('id'));f.locator('.live-open').click()
        expect(f.locator('.live-stage')).to_be_visible();return f
    l=page.evaluate('(id)=>App.data.lessons.find(l=>l.id===id)',ident)
    page.evaluate('(id)=>location.hash=id',l['target']);f=page.locator('#'+l['target'])
    f.locator(f'[data-lesson-id="{ident}"]').click();expect(f.locator('.lab-title')).to_have_text(l['title'])
    return f
receipt={'engine':a.engine,'cache':re.search(r"const CACHE = '([^']+)'",(site/'sw.js').read_text()).group(1),
         'sourceSha256':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT/'live/core.js',ROOT/'live/three_kit.js',ROOT/'live/w_ripple.js',ROOT/'live/w_skycolour.js']},
         'steps':[],'errors':[]}
def painted_png(data):
    # A uniform cleared canvas has only a few byte values even after PNG filtering.
    pos=8;pixels=b''
    while pos<len(data):
        n=struct.unpack('>I',data[pos:pos+4])[0];kind=data[pos+4:pos+8]
        if kind==b'IDAT':pixels+=data[pos+8:pos+8+n]
        pos+=n+12
    return len(set(zlib.decompress(pixels)))>16
try:
    with sync_playwright() as pw:
        opts={'headless':True}
        if a.engine=='chromium':opts['args']=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']
        b=getattr(pw,a.engine).launch(**opts)
        c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce',service_workers='block')
        page=c.new_page();page.add_init_script(MONITOR)
        page.on('pageerror',lambda e:receipt['errors'].append(str(e)))
        page.on('console',lambda m:receipt['errors'].append(m.text) if m.type=='error' else None)
        page.goto(url,wait_until='networkidle')
        baseline_buffers=None
        for n in range(98):
            ident=['motor','w10-eye','m-horizon','w9-water','eclipses','ripple','skycolour'][n%7]
            f=open_lesson(page,ident)
            if ident not in ['ripple','skycolour']:expect(page.locator('.live-3d:visible')).to_have_count(1)
            page.evaluate('(t)=>document.documentElement.dataset.theme=t',['light','sepia','dark'][n%3])
            canvas=f.locator('.live-stage canvas').first
            if ident in ['ripple','skycolour']:canvas.tap(position={'x':100,'y':100})
            if n<5 or n%10==0:
                data=canvas.screenshot()
                assert painted_png(data),'Reused renderer produced an empty scene'
                (out/f'{n:02d}-{ident}.png').write_bytes(data)
            # Half of openings intentionally remain open; the next 3D figure reclaims them.
            if n%2:
                page.evaluate("document.querySelectorAll('figure.live-on').forEach(f=>f.dispatchEvent(new CustomEvent('close-lesson')))")
                buffers=page.evaluate('webglLiveBuffers')
                if baseline_buffers is None:baseline_buffers=buffers
                assert buffers<=baseline_buffers+1,f'Owned GPU buffers retained after close: {buffers}, baseline {baseline_buffers}'
                assert page.evaluate('webglLivePrograms')<=1,'Owned GPU programs retained after close'
                assert page.evaluate('canvasPointerListeners')==0,'Closed shader retained pointer listeners'
                assert page.evaluate('!window.rawContext||rawContext.isContextLost()||rawContext.getParameter(rawContext.CURRENT_PROGRAM)===null'),'Raw program remains bound after close'
            count=page.evaluate('webglContextsCreated');assert count<=3,f'Unbounded context allocation: {count}'
            receipt['steps'].append({'lesson':ident,'contextsCreated':count,'liveBuffers':page.evaluate('webglLiveBuffers'),'livePrograms':page.evaluate('webglLivePrograms')})
        assert not receipt['errors'],receipt['errors']
        c.close()
        # A real GPU-context loss preserves the original shader's computed fallback and controls.
        c=b.new_context(service_workers='block',reduced_motion='reduce');page=c.new_page();page.goto(url)
        f=open_lesson(page,'ripple')
        f.locator('.live-stage canvas').first.evaluate("cv=>cv.getContext('webgl').getExtension('WEBGL_lose_context').loseContext()")
        expect(f.locator('.live-warn')).to_contain_text('became unavailable')
        fallback=f.locator('.live-stage canvas[aria-label="Top view of a ripple tank with circular waves and a floating paper scrap"]')
        expect(fallback).to_be_visible();assert fallback.evaluate("cv=>!!cv.getContext('2d')")
        assert painted_png(fallback.screenshot()),'Blank context-loss fallback'
        before=fallback.screenshot();fallback.click(position={'x':100,'y':100})
        assert fallback.screenshot()!=before,'Ripple tap stopped working after context loss'
        box=fallback.bounding_box();before=fallback.screenshot()
        page.mouse.move(box['x']+150,box['y']+130);page.mouse.down();page.wait_for_timeout(500);page.mouse.up()
        assert fallback.screenshot()!=before,'Ripple long-press stopped working after context loss'
        f.get_by_role('slider',name='Rhythm',exact=True).focus();page.keyboard.press('End')
        expect(f.locator('.live-readout')).not_to_contain_text('NaN')
        f.get_by_role('button',name='Back to the drawing',exact=True).click()
        f=open_lesson(page,'skycolour');assert painted_png(f.locator('.live-stage canvas').first.screenshot())
        f.locator('.live-stage canvas').first.evaluate("cv=>cv.getContext('webgl').getExtension('WEBGL_lose_context').loseContext()")
        fallback=f.locator('.live-stage canvas[aria-label="Sky dome over the Mumbai sea wall showing Rayleigh scattering and the colour of the Sun from horizon to noon"]')
        expect(fallback).to_be_visible();assert fallback.evaluate("cv=>!!cv.getContext('2d')")
        box=fallback.bounding_box();before=fallback.screenshot()
        page.mouse.move(box['x']+100,box['y']+100);page.mouse.down();page.mouse.move(box['x']+180,box['y']+100,steps=5);page.mouse.up()
        assert fallback.screenshot()!=before,'Sky drag stopped working after context loss'
        receipt['rawContextLossFallback']=True;receipt['rawContextLossGestures']=['ripple tap','ripple long press','sky drag'];c.close()
        # A transient entry-chunk network failure can actually be retried.
        c=b.new_context(service_workers='block',reduced_motion='reduce');page=c.new_page();requests=[]
        def fail_once(route):
            requests.append(route.request.url)
            if len(requests)==1:route.abort()
            else:route.continue_()
        page.route('**/live/w_mechanicslab-*',fail_once);page.goto(url)
        l=page.evaluate("App.data.lessons.find(l=>l.id==='m-arrow')");page.evaluate('(id)=>location.hash=id',l['target'])
        f=page.locator('#'+l['target']);launch=f.locator('[data-lesson-id="m-arrow"]');launch.click()
        expect(f.locator('.live-fail')).to_contain_text('could not load');expect(launch).to_be_enabled()
        launch.click();expect(f.locator('.lab-title')).to_have_text(l['title']);assert len(requests)==2,requests
        receipt['retryRequests']=requests;c.close()
        # Returning to a story while its module is still loading cancels the later opening.
        c=b.new_context(service_workers='block',reduced_motion='reduce');page=c.new_page();held=[]
        page.route('**/live/w_mechanicslab-*',lambda route:held.append(route));page.goto(url)
        page.evaluate("App.openStory('p-bhaskara')")
        page.locator('#storydlg [data-open-lesson="m-horizon"]').click()
        expect(page.get_by_role('button',name='Return to the story',exact=True)).to_be_visible()
        page.get_by_role('button',name='Return to the story',exact=True).click()
        expect(page.locator('#storydlg')).to_be_visible();assert held
        held[0].continue_();page.wait_for_timeout(250)
        expect(page.locator('figure.live-on')).to_have_count(0)
        opener=page.locator('[data-lesson-id="m-horizon"]');expect(opener).to_be_enabled();expect(opener).not_to_contain_text('Loading')
        receipt['cancelledPendingStory']=True;c.close()
        # An older request from another chapter must not replace the newer chosen figure.
        c=b.new_context(service_workers='block',reduced_motion='reduce');page=c.new_page();page.goto(url)
        f=open_lesson(page,'w10-eye');f.get_by_role('button',name='Back to the drawing',exact=True).click()
        held=[];page.route('**/live/w_mechanicslab-*',lambda route:held.append(route))
        l=page.evaluate("App.data.lessons.find(l=>l.id==='m-horizon')");page.evaluate('(id)=>location.hash=id',l['target'])
        page.locator(f'#{l["target"]} [data-lesson-id="m-horizon"]').click();assert held
        newer=open_lesson(page,'w10-eye');held[0].continue_();page.wait_for_timeout(250)
        expect(newer.locator('.lab-title')).to_be_visible();expect(page.locator('[data-lesson="m-horizon"]')).to_have_count(0)
        receipt['newerFigureWins']=True;c.close();b.close()
    print(f'PASS {a.engine}: 98 serial Three/raw-shader scenes, at most three contexts, owned GPU buffers/programs released, painted reuse, chunk retry and stale-load cancellation')
finally:
    server.shutdown();(out/'receipt.json').write_text(json.dumps(receipt,indent=2))
