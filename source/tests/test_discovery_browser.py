#!/usr/bin/env python3
"""Serial rendered checks of the optional discovery activities through their real book links.

Default: changed activities only, phone/desktop in sepia. --matrix runs the approved
five-width, three-theme visual gate. --journey adds notebook, concealment and offline.
"""
import argparse
import functools
import hashlib
import http.server
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--matrix', action='store_true')
parser.add_argument('--journey', action='store_true')
parser.add_argument('--only', default='')
parser.add_argument('--widths', help='Override widths, including for a bounded matrix repair')
parser.add_argument('--themes', help='Override themes, including for a bounded matrix repair')
parser.add_argument('--out', default='build/discovery-browser')
args = parser.parse_args()
out = ROOT / args.out
out.mkdir(parents=True, exist_ok=True)
site = ROOT / 'build/site'

class Quiet(http.server.SimpleHTTPRequestHandler):
    # CSS fonts and offline precaching share persistent connections.
    protocol_version = 'HTTP/1.1'
    def log_message(self, *_): pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(site)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_address[1]}/'
receipt = {'indexSha256': hashlib.sha256((site/'index.html').read_bytes()).hexdigest(),
           'cases': [], 'checks': [], 'errors': [], 'requestFailures': []}
active_case={}
MONITOR = """window.discoveryResources={audio:0,mic:0};
window.discoveryAudio=[];
for(const key of ['AudioContext','webkitAudioContext'])if(window[key])window[key]=new Proxy(window[key],{construct(t,a){discoveryResources.audio++;const c=Reflect.construct(t,a);discoveryAudio.push(c);return c;}});
if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=()=>{discoveryResources.mic++;throw Error('Unexpected microphone');};"""

def settled(page):
    page.wait_for_function('!document.getAnimations().some(a=>a.playState==="running"&&a.effect?.getTiming().iterations!==Infinity)')

def monitor_errors(page):
    page.on('pageerror',lambda error:receipt['errors'].append(str(error)))
    def console_error(message):
        if message.type=='error':
            detail={'message':message.text,'location':message.location,'case':dict(active_case),'viewport':page.viewport_size,'page':page.url}
            receipt['errors'].append(detail)
            print('CONSOLE ERROR '+json.dumps(detail),flush=True)
    def request_failed(request):
        detail={'url':request.url,'method':request.method,'failure':request.failure,'case':dict(active_case),'viewport':page.viewport_size,'page':page.url}
        receipt['requestFailures'].append(detail)
        print('REQUEST FAILED '+json.dumps(detail),flush=True)
    page.on('console',console_error)
    page.on('requestfailed',request_failed)

def directory(page):
    page.goto(url+'#investigations', wait_until='networkidle')
    page.get_by_role('button', name='Choose a new investigation', exact=True).click()
    expect(page.locator('.discovery-entries a')).to_have_count(23)
    purpose=page.locator('.discovery-purpose')
    for name in ['Make something work','Measure an unknown','Test an explanation','Discover a hidden property']:
        purpose.get_by_role('button',name=name,exact=True).click()
        assert 0<page.locator('.discovery-entries a').count()<23, f'Purpose filter did not narrow the routes: {name}'
    purpose.get_by_role('button',name='Every question',exact=True).click()
    expect(page.locator('.discovery-entries a')).to_have_count(23)

def open_activity(page, ident):
    page.locator(f'.discovery-entries a[data-discovery="{ident}"]').click()
    activity = page.locator(f'details[data-discovery-activity="{ident}"]')
    expect(activity).to_have_attribute('open','')
    expect(activity.locator('.discovery-title')).to_be_visible()
    settled(page)
    return activity

def close_activity(page, activity):
    activity.locator('xpath=ancestor::figure').locator('.live-close').click()
    page.evaluate('location.hash="investigations"')
    expect(page.locator('#investigations')).to_be_visible()
    settled(page)

def picture_has_marks(canvas):
    return canvas.evaluate("""c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;
      for(let i=0;i<d.length;i+=16)if(d[i+3]&&Math.abs(d[i]-d[0])+Math.abs(d[i+1]-d[1])+Math.abs(d[i+2]-d[2])>45)n++;
      return n>25;}""")

def snapshot(activity, case, prefix, state):
    assert activity.evaluate('()=>document.documentElement.scrollWidth<=innerWidth+1'), f'Page overflows in {state}'
    activity.screenshot(path=str(out/f'{prefix}-{state}.png'),animations='disabled')
    # Keep crop coordinates so visual review can reuse these screenshots without
    # opening another browser or rerunning a successful matrix case.
    bounds=activity.bounding_box()
    case.setdefault('visualRegions',{})[state]=activity.locator('.discovery-picture,.discovery-plots,.discovery-trail').evaluate_all(
        '(es)=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})')
    for region in case['visualRegions'][state]:
        region['x']-=bounds['x'];region['y']-=bounds['y']

def selected_trail_contrast(activity):
    return activity.locator('.discovery-trail button[aria-pressed=true]').evaluate_all("""buttons=>{
      const ctx=document.createElement('canvas').getContext('2d');
      const rgb=()=>Array.from(ctx.getImageData(0,0,1,1).data).slice(0,3);
      const light=channels=>channels.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
      return buttons.map(button=>{
        const style=getComputedStyle(button);
        const layers=[];for(let e=button;e;e=e.parentElement)layers.push(getComputedStyle(e).backgroundColor);
        ctx.fillStyle='#fff';ctx.fillRect(0,0,1,1);
        for(const color of layers.reverse()){ctx.fillStyle=color;ctx.fillRect(0,0,1,1);}const background=rgb();
        ctx.fillStyle=style.color;ctx.fillRect(0,0,1,1);const foreground=rgb();
        const a=light(foreground),b=light(background);
        return {foreground,background,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
      });
    }""")

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio'])
        widths = [int(w) for w in args.widths.split(',')] if args.widths else ([390,820,1024,1180,1440] if args.matrix else [390,1440])
        themes = args.themes.split(',') if args.themes else (['light','dark','sepia'] if args.matrix else ['sepia'])
        for width in widths:
            for theme in themes:
                active_case={'id':'directory','width':width,'theme':theme}
                context=browser.new_context(viewport={'width':width,'height':950},reduced_motion='reduce',device_scale_factor=1)
                page=context.new_page();page.add_init_script(MONITOR)
                monitor_errors(page)
                directory(page)
                assert not receipt['errors'],receipt['errors']
                page.evaluate('(theme)=>document.documentElement.dataset.theme=theme',theme)
                links=page.locator('.discovery-entries a').evaluate_all('(es)=>es.map(e=>e.dataset.discovery)')
                selected=set(args.only.split(',')) if args.only else set(links)
                assert selected <= set(links), f'Unknown requested activities: {selected-set(links)}'
                for ident in links:
                    if ident not in selected:continue
                    case={'id':ident,'width':width,'theme':theme};receipt['cases'].append(case)
                    active_case={'id':ident,'width':width,'theme':theme}
                    activity=open_activity(page,ident)
                    assert page.evaluate('discoveryResources')=={'audio':0,'mic':0},'Opening requested sound/device access'
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Page overflows'
                    prefix=f'{ident}-{width}-{theme}'
                    snapshot(activity,case,prefix,'default')
                    if ident=='statement-trail':
                        expect(activity.locator('.discovery-trail button')).to_have_count(9)
                        for index in [0,1,4,7,8]:activity.locator('.discovery-trail button').nth(index).click()
                        expect(activity.locator('p[role=status]')).to_contain_text('reached 9')
                        activity.get_by_role('button',name='Use a plain list',exact=True).click()
                        activity.get_by_label('My correction to a rejected statement',exact=True).fill('Interaction forces act on different objects.')
                        snapshot(activity,case,prefix,'changed')
                        case['selectedTextContrast']=selected_trail_contrast(activity)
                        assert case['selectedTextContrast'] and all(c['ratio']>=4.5 for c in case['selectedTextContrast']), f'Selected trail text contrast below 4.5:1: {case["selectedTextContrast"]}'
                    else:
                        expect(activity.get_by_role('button',name='Explore',exact=True)).to_have_attribute('aria-pressed','true')
                        assert picture_has_marks(activity.locator('.discovery-picture canvas')),'Blank scene'
                        control=activity.locator('.discovery-controls input:visible,.discovery-controls select:visible').first
                        if ident=='d-machine-trail':
                            control=activity.get_by_label('Magnetic field',exact=True)
                            if not control.is_visible():activity.get_by_text('More apparatus controls',exact=True).click()
                        old=control.input_value()
                        if control.evaluate('e=>e.tagName')=='SELECT':
                            values=control.locator('option').evaluate_all('(es)=>es.map(e=>e.value)')
                            control.select_option(next(v for v in values if v!=old))
                        else:
                            control.focus();control.press('Home' if old==control.get_attribute('max') else 'End')
                        assert control.input_value()!=old,'Control did not receive the change'
                        activity.get_by_role('button',name='Investigate',exact=True).click()
                        expect(activity.locator('.discovery-controls')).not_to_have_count(0)
                        assert picture_has_marks(activity.locator('.discovery-picture canvas')),'Changed scene blank'
                        snapshot(activity,case,prefix,'changed')
                        activity.get_by_role('button',name='Challenge',exact=True).click()
                        expect(activity.locator('.discovery-challenge')).to_be_visible()
                        expect(activity.get_by_role('button',name='Save this finding',exact=True)).to_be_disabled()
                        activity.get_by_label('My measurement answer',exact=True).fill('not a number')
                        activity.get_by_role('button',name='Check my measurement',exact=True).click()
                        expect(activity.locator('p[role=status]')).to_contain_text('finite number')
                        if ident=='discovery-train':
                            assert activity.locator('.discovery-plot figcaption').filter(has_text='Position ·').count()==0,'Integrated answer plot leaked'
                        activity.get_by_role('button',name='Show the reasoning',exact=True).click()
                        expect(activity.get_by_role('button',name='Save this finding',exact=True)).to_be_enabled()
                        assert not activity.locator('.discovery-feedback').filter(has_text='NaN').count()
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Page overflows after challenge or trail change'
                    assert page.evaluate('discoveryResources')=={'audio':0,'mic':0},'Ordinary controls requested sound/device access'
                    close_activity(page,activity);case['passed']=True
                    (out/'receipt.json').write_text(json.dumps(receipt,indent=2))
                    assert not receipt['errors'],receipt['errors']
                    print(f'PASS {ident} {width} {theme}',flush=True)
                context.close()
        if args.journey:
            active_case={'id':'notebook/audio/offline journey','width':390,'theme':'sepia'}
            context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce',accept_downloads=True)
            page=context.new_page();page.add_init_script(MONITOR)
            monitor_errors(page)
            directory(page);activity=open_activity(page,'discovery-train')
            expect(activity.get_by_label('Shared clock',exact=True)).to_be_visible()
            activity.get_by_role('button',name='Inspect larger drawings',exact=True).click()
            assert activity.locator('.discovery-plot canvas').first.evaluate('c=>c.clientWidth')==640
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            activity.get_by_role('button',name='Inspect larger drawings',exact=True).click()
            figure=activity.locator('xpath=ancestor::figure')
            figure.locator('.lab-prediction summary').click()
            figure.get_by_label('My prediction',exact=True).fill('Keep this original lab note.')
            activity.get_by_label('My prediction for this investigation',exact=True).fill('More braking reduces displacement.')
            activity.get_by_label('My claim and evidence',exact=True).fill('The two velocity areas differ.')
            activity.get_by_role('button',name='Keep this run',exact=True).click()
            activity.get_by_label('Velocity at 4 s',exact=True).focus();page.keyboard.press('End')
            activity.get_by_role('button',name='Save this finding',exact=True).click()
            expect(activity.locator('p[role=status]')).to_contain_text('notebook')
            with page.expect_download() as download:
                activity.get_by_role('button',name='Save a paper experiment sheet',exact=True).click()
            sheet=Path(download.value.path()).read_text()
            assert 'My prediction' in sheet and 'More braking' in sheet and 'Model limits' in sheet
            saved=page.evaluate('App.store.get("lab:m-graph")')
            assert saved['prediction']=='Keep this original lab note.'
            assert saved['findings'][0]['claim']=='The two velocity areas differ.'
            assert saved['findings'][0]['plots'][0]['points']
            figure.locator('.lab-explanation summary').click()
            figure.get_by_label('My explanation',exact=True).fill('The original explanation remains too.')
            assert page.evaluate('App.store.get("lab:m-graph").findings.length')==1
            activity.get_by_role('button',name='Challenge',exact=True).click()
            activity.get_by_label('My measurement answer',exact=True).fill('136')
            activity.get_by_role('button',name='Check my measurement',exact=True).click()
            expect(activity.locator('p[role=status]')).to_contain_text('agrees')
            activity.get_by_role('button',name='Explore',exact=True).click()
            activity.get_by_text('Repeat this case or try another',exact=True).click()
            activity.get_by_label('Case number',exact=True).fill('42')
            activity.get_by_role('button',name='Open this case',exact=True).click()
            expect(activity.get_by_label('Velocity at 4 s',exact=True)).to_have_value('12')
            expect(activity.locator('.discovery-readings')).to_contain_text('Journey displacement: 108 m')
            assert page.evaluate('App.store.get("lab:m-graph").findings[0].state.v1')==20
            close_activity(page,activity)
            page.get_by_role('button',name='My notebook: highlights, notes and answers',exact=True).click()
            expect(page.locator('dialog.notebook')).to_contain_text('The two velocity areas differ.')
            with page.expect_download() as download:page.get_by_role('button',name='Save my notebook',exact=True).click()
            markdown=Path(download.value.path()).read_text();assert 'More braking' in markdown and 'Settings:' in markdown
            assert 'Keep this original lab note.' in markdown and 'The original explanation remains too.' in markdown
            page.locator('dialog.notebook .nb-more summary').click()
            with page.expect_download() as backup:page.get_by_role('button',name='Save a backup',exact=True).click()
            backup_path=out/'notebook-backup.json';backup.value.save_as(str(backup_path))
            restored_context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
            restored=restored_context.new_page();monitor_errors(restored);restored.goto(url,wait_until='networkidle')
            restored.get_by_role('button',name='My notebook: highlights, notes and answers',exact=True).click()
            restored.locator('dialog.notebook .nb-more summary').click()
            with restored.expect_navigation(wait_until='networkidle'):
                restored.locator('dialog.notebook input[type=file]').set_input_files(str(backup_path))
            directory(restored);restored_activity=open_activity(restored,'discovery-train')
            expect(restored_activity.get_by_label('My claim and evidence',exact=True)).to_have_value('The two velocity areas differ.')
            expect(restored_activity.get_by_label('Velocity at 4 s',exact=True)).to_have_value('12')
            assert restored.evaluate('App.store.get("lab:m-graph").prediction')=='Keep this original lab note.'
            restored_context.close()
            page.keyboard.press('Escape');page.reload(wait_until='networkidle')
            directory(page);activity=open_activity(page,'discovery-train')
            expect(activity.get_by_label('My claim and evidence',exact=True)).to_have_value('The two velocity areas differ.')
            receipt['checks'].append('comparison, immutable finding, original-note preservation, solved challenge, repeatable case, paper sheet, notebook, Markdown and JSON backup/restore, draft reload')
            close_activity(page,activity)
            activity=open_activity(page,'doppler-train')
            activity.get_by_role('button',name='Challenge',exact=True).click()
            activity.get_by_role('button',name='Hear this frequency',exact=True).click()
            expect(activity.locator('p[role=status]')).to_contain_text('short tone')
            assert 'Hz' not in activity.locator('p[role=status]').inner_text(),'Sound feedback exposed the concealed number'
            assert page.evaluate('discoveryResources')=={'audio':1,'mic':0}
            close_activity(page,activity)
            page.wait_for_function('discoveryAudio.every(c=>c.state==="closed")')
            receipt['checks'].append('explicit audio only, concealed frequency and closed audio context')
            page.evaluate('navigator.serviceWorker.ready.then(()=>true)')
            page.wait_for_function('navigator.serviceWorker.controller')
            context.set_offline(True);page.reload(wait_until='networkidle')
            page.get_by_role('button',name='Choose a new investigation',exact=True).click()
            activity=open_activity(page,'d-hidden-planet')
            expect(activity.locator('.discovery-plot figcaption').first).to_contain_text('Close-up vertical scale')
            assert picture_has_marks(activity.locator('.discovery-picture canvas'))
            receipt['checks'].append('offline lazy activity and disclosed transit close-up')
            context.close()
        assert not receipt['errors'],receipt['errors']
        browser.close()
finally:
    server.shutdown()
    (out/'receipt.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps({'cases':len(receipt['cases']),'checks':receipt['checks'],'errors':receipt['errors']}))
