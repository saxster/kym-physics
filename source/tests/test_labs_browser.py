#!/usr/bin/env python3
"""Exercise every published lesson through the built book, with screenshots and a JSON receipt.

python tests/test_labs_browser.py --site build/site --themes sepia --widths 390,1440
Default matrix includes all themes. Screenshots are review evidence, not physics oracles.
"""
import argparse
import functools
import hashlib
import http.server
import json
from pathlib import Path
import re
import threading
import time
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--site', default='build/site')
parser.add_argument('--url', help='Test this deployed book URL against the expected --site build')
parser.add_argument('--out', default='build/labs-browser')
parser.add_argument('--themes', default='light,sepia,dark')
parser.add_argument('--widths', default='390,1440')
parser.add_argument('--only', default='')
parser.add_argument('--fallback', action='store_true')
parser.add_argument('--smoke', action='store_true', help='Theme/fallback matrix: open, change one input, play, resize, close; full controls are checked separately')
parser.add_argument('--engine', default='chromium', choices=['chromium', 'webkit', 'firefox'])
args = parser.parse_args()
site = (ROOT / args.site).resolve()
out = (ROOT / args.out).resolve()
out.mkdir(parents=True, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = None
if args.url:
    url = args.url.rstrip('/') + '/'
else:
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(site)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_address[1]}/'
receipt = {'url': url, 'engine': args.engine, 'fallback': args.fallback,
           'mode':'smoke' if args.smoke else 'all-controls',
           'indexSha256':hashlib.sha256((site/'index.html').read_bytes()).hexdigest(),
           'runtimeSha256':hashlib.sha256(re.sub(r'data:font/woff2;base64,[A-Za-z0-9+/=]+','FONT',(site/'index.html').read_text()).encode()).hexdigest(),
           'cache':re.search(r"const CACHE = '([^']+)'",(site/'sw.js').read_text()).group(1),
           'chunks':json.loads(re.search(r'window.BOOK_CHUNKS=(.*?);window.BOOK_SCALE_ART=',(site/'index.html').read_text()).group(1)),
           'cases': [], 'errors': []}
MONITOR = """window.resourceStarts={audio:0,mic:0,sensor:0};
for(const k of ['AudioContext','webkitAudioContext'])if(window[k])window[k]=new Proxy(window[k],{construct(t,a){resourceStarts.audio++;return Reflect.construct(t,a);}});
if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=()=>{resourceStarts.mic++;return Promise.reject(Error('Unexpected microphone start'));};
for(const k of ['Magnetometer','Accelerometer','LinearAccelerationSensor'])if(window[k])window[k]=new Proxy(window[k],{construct(t,a){resourceStarts.sensor++;return Reflect.construct(t,a);}});"""
FALLBACK = """const originalContext=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:originalContext.call(this,t,...a);};"""


DOM_CALCULATIONS = {'m-rain', 'm-rocket', 'm-kepler', 'm-pressure', 'm-stevin', 'w10-delay'}


def diagram_painted(canvas, timeout_ms=1500):
    # These six calculations intentionally contain text only. The annotation layer
    # moves that text into readable DOM spans, leaving a uniform canvas background.
    # Every other lesson must still paint raster marks; labels cannot mask a lost plot.
    probe = """(cv, textOnly)=>{const c=cv.getContext('2d'),d=c.getImageData(0,0,cv.width,cv.height).data;
    let n=0;for(let i=0;i<d.length;i+=16)if(d[i+3]&&Math.abs(d[i]-d[0])+Math.abs(d[i+1]-d[1])+Math.abs(d[i+2]-d[2])>45)n++;
    if(n>25)return true;
    if(!textOnly.includes(cv.closest('.live-stage')?.dataset.lesson))return false;
    const surface=cv.closest('.lab-diagram-surface');
    const labels=[...(surface?.querySelectorAll('.lab-diagram-label')||[])].filter(e=>
      !e.hidden&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&
      (!e.checkVisibility||e.checkVisibility())&&e.textContent.trim());
    return labels.length>=3&&labels.filter(e=>/\\d/.test(e.textContent)).length>=2&&
      labels.every(e=>!/(?:NaN|undefined)/.test(e.textContent));}"""
    deadline = time.monotonic() + timeout_ms / 1000
    while True:
        if canvas.evaluate(probe, sorted(DOM_CALCULATIONS)):
            return True
        if time.monotonic() >= deadline:
            return False
        canvas.page.wait_for_timeout(25)


def snapshot(figure, path):
    figure.screenshot(path=str(path), animations='disabled', timeout=15000)


try:
    with sync_playwright() as pw:
        opts = {'headless': True}
        if args.engine == 'chromium':
            opts['args'] = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio']
        browser = getattr(pw, args.engine).launch(**opts)
        if args.url:
            expect.set_options(timeout=60000)
        for width in [int(w) for w in args.widths.split(',')]:
            # A reader changes themes within one device session. Keep its HTTP
            # cache/offline worker while using a fresh page for each theme.
            context = browser.new_context(viewport={'width': width, 'height': 844 if width < 600 else 1000},
                                          is_mobile=width<600, has_touch=width<900,
                                          device_scale_factor=2 if width<600 else 1, reduced_motion='reduce')
            for theme in args.themes.split(','):
                page = context.new_page()
                page.add_init_script(MONITOR)
                if args.fallback:
                    page.add_init_script(FALLBACK)
                errors = []
                scripts = []
                page.on('pageerror', lambda e: errors.append(str(e)))
                page.on('console', lambda m: errors.append('console: '+m.text) if m.type=='error' else None)
                page.on('request', lambda r: scripts.append(r.url) if r.resource_type == 'script' and '/live/' in r.url else None)
                response = page.goto(url, wait_until='domcontentloaded' if args.url else 'networkidle', timeout=180000 if args.url else 30000)
                if args.url:
                    assert response.ok, f'Live index HTTP {response.status}'
                    assert hashlib.sha256(response.body()).hexdigest() == receipt['indexSha256'], 'Live index differs from the verified build'
                    worker = page.request.get(url + 'sw.js', timeout=60000)
                    assert worker.ok and worker.body() == (site / 'sw.js').read_bytes(), 'Live service worker differs from the verified build'
                    receipt['deployedBytesVerified'] = True
                    receipt.setdefault('navigations', []).append({'width': width, 'theme': theme, 'indexSha256': receipt['indexSha256']})
                    page.wait_for_function('window.App && App.data && App.data.lessons && document.querySelector("[data-lesson-id]")')
                    page.evaluate('document.fonts.ready.then(()=>true)')
                page.evaluate('(theme)=>document.documentElement.dataset.theme=theme', theme)
                lessons = page.evaluate('App.data.lessons || []')
                assert lessons, 'No catalog lessons were published'
                assert not scripts, f'Eager lazy scripts before a tap: {scripts}'
                selected = set(args.only.split(',')) if args.only else None
                if selected:
                    assert selected <= {l['id'] for l in lessons}, f'Unknown requested lessons: {selected-{l["id"] for l in lessons}}'
                for lesson in lessons:
                    if selected and lesson['id'] not in selected:
                        continue
                    case = {'id': lesson['id'], 'width': width, 'height':844 if width<600 else 1000,
                            'touch':width<900, 'theme': theme, 'controls': 0}
                    receipt['cases'].append(case)
                    prefix = f'{lesson["id"]}-{width}-{theme}'
                    before_error = len(errors)
                    try:
                        page.evaluate('(id)=>location.hash=id', lesson['target'])
                        figure = page.locator('#' + lesson['target'])
                        opener = figure.locator(f'button[data-lesson-id="{lesson["id"]}"]')
                        expect(opener).to_be_visible()
                        if not args.smoke: snapshot(figure, out / f'{prefix}-before.png')
                        resources = page.evaluate('JSON.stringify(resourceStarts)')
                        opener.tap() if width<600 else opener.click()
                        stage = figure.locator('.live-stage')
                        expect(stage.locator('.lab-title')).to_have_text(lesson['title'])
                        expect(figure.locator('.live-readout')).not_to_be_empty()
                        assert page.evaluate('JSON.stringify(resourceStarts)') == resources, 'Opening started audio or sensor'
                        play = figure.locator('.live-play')
                        assert not play.count() or play.get_attribute('aria-pressed') == 'false', 'Opening must not start motion'
                        diagram = stage.locator('canvas[data-logical-width]').last
                        assert diagram_painted(diagram), 'Blank calculated diagram'
                        assert diagram.evaluate('e=>e.clientWidth<=e.parentElement.clientWidth+1'), 'Diagram does not fit its opening view'
                        snapshot(figure, out / f'{prefix}-open.png')
                        controls = figure.locator('.live-controls input[type="range"]')
                        exercised=set()
                        for i in range(min(1, controls.count()) if args.smoke else controls.count()):
                            control = controls.nth(i)
                            if control.is_disabled() or not control.is_visible():
                                continue
                            exercised.add(i)
                            for key in (('End',) if args.smoke else ('Home', 'End')):
                                if not args.smoke: snapshot(figure, out / f'{prefix}-control-{i}-{key}-before.png')
                                control.focus(); control.press(key)
                                assert not re.search(r'NaN|undefined', figure.locator('.live-readout').inner_text()), 'Invalid model readout'
                                assert diagram_painted(diagram), 'Diagram cleared after input'
                                case['controls'] += 1
                            control.evaluate('(e)=>{e.value=(+e.min + +e.max)/2;e.dispatchEvent(new Event("input",{bubbles:true}));}')
                        tabs = figure.locator('.live-controls .live-tabs button')
                        for i in range(0 if args.smoke else tabs.count()):
                            snapshot(figure, out / f'{prefix}-tab-{i}-before.png')
                            tabs.nth(i).tap() if width<600 else tabs.nth(i).click()
                            assert diagram_painted(diagram), 'Blank diagram after preset'
                            assert not re.search(r'NaN|undefined', figure.locator('.live-readout').inner_text())
                            case['controls'] += 1
                            # Some presets enable a separately scaled clock or physical parameter.
                            for j in range(controls.count()):
                                control=controls.nth(j)
                                if j in exercised or control.is_disabled() or not control.is_visible():
                                    continue
                                exercised.add(j)
                                for key in ('Home','End'):
                                    control.focus();control.press(key)
                                    assert diagram_painted(diagram)
                                    assert not re.search(r'NaN|undefined',figure.locator('.live-readout').inner_text())
                                    case['controls']+=1
                        actions = figure.locator('.live-controls > button.live-ctl')
                        for i in range(0 if args.smoke else actions.count()):
                            action = actions.nth(i)
                            if action.is_disabled() or not action.is_visible():
                                continue
                            label = action.inner_text()
                            if re.search(r'^(Play|Pause|Turn left|Turn right|Full-size drawing|Fit drawing|Back to the drawing)$', label):
                                continue
                            if re.search(r'microphone|sensor|choose.*video|magnetometer', label, re.I):
                                continue
                            snapshot(figure, out / f'{prefix}-action-{i}-before.png')
                            action.tap() if width<600 else action.click()
                            page.wait_for_timeout(40)
                            assert diagram_painted(diagram), 'Blank diagram after action'
                            assert not re.search(r'NaN|undefined', figure.locator('.live-readout').inner_text())
                            case['controls'] += 1
                        play = figure.locator('.live-play')
                        if play.count() and play.is_visible():
                            if play.inner_text() == 'Play':
                                if not args.smoke: snapshot(figure, out / f'{prefix}-play-before.png')
                                play.tap() if width<600 else play.click()
                            page.wait_for_timeout(100)
                            assert not re.search(r'NaN|undefined', figure.locator('.live-readout').inner_text())
                            if play.is_visible() and play.inner_text() == 'Pause':
                                play.tap() if width<600 else play.click()
                        # A useful explanation survives resizing and live theme changes while paused.
                        page.evaluate("document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark'")
                        page.wait_for_timeout(30)
                        assert diagram_painted(diagram), 'Blank diagram after theme change'
                        page.evaluate('(theme)=>document.documentElement.dataset.theme=theme', theme)
                        detail = figure.get_by_role('button', name='Full-size drawing', exact=True)
                        if not args.smoke: snapshot(figure, out / f'{prefix}-detail-before.png')
                        detail.tap() if width<600 else detail.click()
                        page.wait_for_timeout(30)
                        assert diagram_painted(diagram), 'Blank native-size diagram'
                        fit=figure.get_by_role('button', name='Fit drawing', exact=True)
                        fit.tap() if width<600 else fit.click()
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Page-wide overflow'
                        if not args.smoke: snapshot(figure, out / f'{prefix}-changed.png')
                        if len(errors) > before_error:
                            raise AssertionError(errors[before_error:])
                        close=figure.get_by_role('button', name='Back to the drawing', exact=True)
                        close.tap() if width<600 else close.click()
                        expect(opener).to_be_focused()
                        expect(figure.locator('.live-stage')).to_have_count(0)
                        case['passed'] = True
                    except Exception as e:
                        case['passed'] = False
                        case['error'] = str(e)
                        if 'overflow' in str(e):
                            case['overflow'] = page.evaluate("""()=>[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className?.baseVal??e.className,right:e.getBoundingClientRect().right,text:e.textContent?.slice(0,80)})).filter(e=>e.right>innerWidth+1).slice(-20)""")
                        try:
                            page.screenshot(path=str(out / f'{prefix}-failure.png'))
                            figure.get_by_role('button', name='Back to the drawing', exact=True).click(timeout=1000)
                        except Exception:
                            pass
                    print(f'{"PASS" if case["passed"] else "FAIL"} {prefix}: {case.get("error", "controls/diagram/focus")}', flush=True)
                    (out / 'receipt.json').write_text(json.dumps(receipt, indent=2))
                receipt['errors'].extend(errors)
                page.close()
            context.close()
        browser.close()
finally:
    if server:
        server.shutdown()
    receipt['finished'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    (out / 'receipt.json').write_text(json.dumps(receipt, indent=2))
    (out / 'log.md').write_text('\n'.join(f'- {r["id"]} {r["width"]}px {r["theme"]}: {"PASS" if r.get("passed") else "FAIL"}; {r.get("controls",0)} control boundary/preset actions; before/open/changed screenshots retained.' for r in receipt['cases']))

failed = [r for r in receipt['cases'] if not r.get('passed')]
assert not failed and not receipt['errors'], f'{len(failed)} failed cases; errors: {receipt["errors"][:10]}'
print(f'PASS {len(receipt["cases"])} lesson/viewport/theme cases ({args.engine})')
