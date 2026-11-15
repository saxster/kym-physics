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
parser.add_argument('--widths', default='390,1440')
parser.add_argument('--out', default='build/discovery-browser')
args = parser.parse_args()
out = ROOT / args.out
out.mkdir(parents=True, exist_ok=True)
site = ROOT / 'build/site'

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_): pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(site)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_address[1]}/'
receipt = {'indexSha256': hashlib.sha256((site/'index.html').read_bytes()).hexdigest(),
           'cases': [], 'checks': [], 'errors': []}
MONITOR = """window.discoveryResources={audio:0,mic:0};
for(const key of ['AudioContext','webkitAudioContext'])if(window[key])window[key]=new Proxy(window[key],{construct(t,a){discoveryResources.audio++;return Reflect.construct(t,a);}});
if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=()=>{discoveryResources.mic++;throw Error('Unexpected microphone');};"""

def settled(page):
    page.wait_for_function('!document.getAnimations().some(a=>a.playState==="running"&&a.effect?.getTiming().iterations!==Infinity)')

def directory(page):
    page.goto(url+'#investigations', wait_until='networkidle')
    page.get_by_role('button', name='Choose a new investigation', exact=True).click()
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

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio'])
        widths = [390,820,1024,1180,1440] if args.matrix else [int(w) for w in args.widths.split(',')]
        themes = ['light','dark','sepia'] if args.matrix else ['sepia']
        for width in widths:
            for theme in themes:
                context=browser.new_context(viewport={'width':width,'height':950},reduced_motion='reduce',device_scale_factor=1)
                page=context.new_page();page.add_init_script(MONITOR)
                page.on('pageerror',lambda error:receipt['errors'].append(str(error)))
                directory(page)
                page.evaluate('(theme)=>document.documentElement.dataset.theme=theme',theme)
                links=page.locator('.discovery-entries a').evaluate_all('(es)=>es.map(e=>e.dataset.discovery)')
                selected=set(args.only.split(',')) if args.only else set(links)
                assert selected <= set(links), f'Unknown requested activities: {selected-set(links)}'
                for ident in links:
                    if ident not in selected:continue
                    case={'id':ident,'width':width,'theme':theme};receipt['cases'].append(case)
                    activity=open_activity(page,ident)
                    assert page.evaluate('discoveryResources')=={'audio':0,'mic':0},'Opening requested sound/device access'
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Page overflows'
                    prefix=f'{ident}-{width}-{theme}'
                    if ident=='statement-trail':
                        expect(activity.locator('.discovery-trail button')).to_have_count(9)
                        for index in [0,1,4,7,8]:activity.locator('.discovery-trail button').nth(index).click()
                        expect(activity.get_by_role('status')).to_contain_text('reached 9')
                        activity.get_by_role('button',name='Use a plain list',exact=True).click()
                        activity.get_by_label('My correction to a rejected statement',exact=True).fill('Interaction forces act on different objects.')
                        activity.screenshot(path=str(out/f'{prefix}-changed.png'),animations='disabled')
                    else:
                        expect(activity.get_by_role('button',name='Explore',exact=True)).to_have_attribute('aria-pressed','true')
                        assert picture_has_marks(activity.locator('.discovery-picture canvas')),'Blank scene'
                        activity.screenshot(path=str(out/f'{prefix}-default.png'),animations='disabled')
                        control=activity.locator('.discovery-controls input:visible,.discovery-controls select:visible').first
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
                        activity.screenshot(path=str(out/f'{prefix}-changed.png'),animations='disabled')
                        activity.get_by_role('button',name='Challenge',exact=True).click()
                        expect(activity.locator('.discovery-challenge')).to_be_visible()
                        expect(activity.get_by_role('button',name='Save this finding',exact=True)).to_be_disabled()
                        activity.get_by_label('My measurement answer',exact=True).fill('not a number')
                        activity.get_by_role('button',name='Check my measurement',exact=True).click()
                        expect(activity.get_by_role('status')).to_contain_text('finite number')
                        if ident=='discovery-train':
                            assert activity.locator('.discovery-plot figcaption').filter(has_text='Position ·').count()==0,'Integrated answer plot leaked'
                        activity.get_by_role('button',name='Show the reasoning',exact=True).click()
                        expect(activity.get_by_role('button',name='Save this finding',exact=True)).to_be_enabled()
                        assert not activity.locator('.discovery-feedback').filter(has_text='NaN').count()
                    assert page.evaluate('discoveryResources')=={'audio':0,'mic':0},'Ordinary controls requested sound/device access'
                    close_activity(page,activity);case['passed']=True
                    print(f'PASS {ident} {width} {theme}',flush=True)
                context.close()
        if args.journey:
            context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce',accept_downloads=True)
            page=context.new_page();page.add_init_script(MONITOR)
            page.on('pageerror',lambda e:receipt['errors'].append(str(e)))
            directory(page);activity=open_activity(page,'discovery-train')
            activity.get_by_label('My prediction for this investigation',exact=True).fill('More braking reduces displacement.')
            activity.get_by_label('My claim and evidence',exact=True).fill('The two velocity areas differ.')
            activity.get_by_role('button',name='Keep this run',exact=True).click()
            activity.get_by_label('Velocity at 4 s',exact=True).focus();page.keyboard.press('End')
            activity.get_by_role('button',name='Save this finding',exact=True).click()
            expect(activity.get_by_role('status')).to_contain_text('notebook')
            with page.expect_download() as download:
                activity.get_by_role('button',name='Save a paper experiment sheet',exact=True).click()
            sheet=Path(download.value.path()).read_text()
            assert 'My prediction' in sheet and 'More braking' in sheet and 'Model limits' in sheet
            saved=page.evaluate('App.store.get("lab:m-graph")')
            assert saved['findings'][0]['claim']=='The two velocity areas differ.'
            assert saved['findings'][0]['plots'][0]['points']
            close_activity(page,activity)
            page.get_by_role('button',name='My notebook: highlights, notes and answers',exact=True).click()
            expect(page.locator('dialog.notebook')).to_contain_text('The two velocity areas differ.')
            with page.expect_download() as download:page.get_by_role('button',name='Save my notebook',exact=True).click()
            markdown=Path(download.value.path()).read_text();assert 'More braking' in markdown and 'Settings:' in markdown
            page.keyboard.press('Escape');page.reload(wait_until='networkidle')
            directory(page);activity=open_activity(page,'discovery-train')
            expect(activity.get_by_label('My claim and evidence',exact=True)).to_have_value('The two velocity areas differ.')
            receipt['checks'].append('comparison, finding, paper sheet, notebook, Markdown export, draft reload')
            close_activity(page,activity)
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
