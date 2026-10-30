"""Real investigation journey: directory → evidence → notebook → backup → offline.

Uses the repository's Python Playwright runtime. Receipts/screenshots stay outside source.
"""
import functools
import http.server
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/tmp/joy-journey'); OUT.mkdir(exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT/'build/site')))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/'
errors=[]

def open_lesson(page,ident):
    lesson=page.evaluate('(id)=>App.data.lessons.find(l=>l.id===id)',ident)
    page.evaluate('(id)=>location.hash=id',lesson['target'])
    fig=page.locator('#'+lesson['target'])
    fig.locator(f'[data-lesson-id="{ident}"]').click()
    expect(fig.locator('.lab-title')).to_have_text(lesson['title'])
    return fig

def close(fig):
    fig.get_by_role('button',name='Back to the drawing',exact=True).click()

try:
 with sync_playwright() as pw:
    browser=pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce',accept_downloads=True)
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url,wait_until='networkidle')
    assert page.title().startswith('The Moving World')
    page.locator('#tb-investigate').click()
    expect(page.locator('#investigations')).to_be_visible()
    expect(page.locator('#investigation-count')).to_contain_text('17 investigations')
    page.get_by_label('Choose an everyday object',exact=True).select_option('A spinning top')
    page.get_by_label('Time for the longer activity',exact=True).select_option('10')
    expect(page.locator('#investigation-count')).to_contain_text('No activities match')
    page.get_by_label('Choose an everyday object',exact=True).select_option('all')
    page.get_by_label('Time for the longer activity',exact=True).select_option('all')
    page.screenshot(path=str(OUT/'directory-mobile.png'))
    page.locator('#investigations [data-open-lesson="j-bounce"]').click()
    fig=page.locator('figure[data-active-lesson="j-bounce"]')
    expect(fig.locator('.inv-quick')).to_be_visible()
    expect(fig.locator('.inv-theory')).not_to_have_attribute('open','')
    fig.locator('.lab-prediction > summary').click()
    fig.get_by_label('My prediction',exact=True).fill('Height and speed ratios will differ.')
    fig.locator('.inv-long > summary').click()
    fig.get_by_label('What will you hold fixed?',exact=True).fill('Same ball, surface and camera.')
    fig.get_by_label('Measurement resolution and units',exact=True).fill('Ruler divisions 0.01 m; calibration may be biased.')
    for i,y in enumerate(['0.64','0.60'],1):
        fig.get_by_role('button',name='Add a trial',exact=True).click()
        fig.get_by_label(f'Drop height, trial {i}',exact=True).fill('1')
        fig.get_by_label(f'Rebound height, trial {i}',exact=True).fill(y)
    expect(fig.locator('.inv-summary')).to_contain_text('mean 0.6200')
    expect(fig.locator('.inv-summary')).to_contain_text('speed ratio 0.8')
    fig.get_by_label('My claim and supporting observations',exact=True).fill('A 0.64 height ratio returns 64% of mechanical energy.')
    long_claim='Evidence '+('x'*11000)
    fig.get_by_label('What result would change my explanation?',exact=True).fill(long_claim)
    fig.get_by_role('button',name='Add supplied examples',exact=True).click()
    fig.get_by_role('button',name='Record model reading',exact=True).click()
    expect(fig.locator('.inv-table tbody tr')).to_have_count(7)
    expect(fig.locator('.inv-summary')).to_contain_text('Green diamonds')
    with page.expect_download() as dl:
        fig.get_by_role('button',name='Export measurements (CSV)',exact=True).click()
    csv=OUT/'bounce.csv';dl.value.save_as(str(csv));content=csv.read_text()
    for s in ['My observation','Supplied observation','Model reading','Same ball','0.64']: assert s in content
    fig.get_by_role('button',name='Remove trial 7',exact=True).click()
    expect(fig.locator('.inv-table tbody tr')).to_have_count(6)
    close(fig)
    page.reload(wait_until='networkidle');fig=open_lesson(page,'j-bounce')
    fig.locator('.inv-long > summary').click()
    expect(fig.locator('.inv-table tbody tr')).to_have_count(6)
    expect(fig.get_by_label('What result would change my explanation?',exact=True)).to_have_value(long_claim)
    expect(fig.get_by_label('What will you hold fixed?',exact=True)).to_have_value('Same ball, surface and camera.')
    fig.get_by_label('Rebound height, trial 1',exact=True).fill('not a number')
    expect(fig.locator('.inv-long')).to_contain_text('incomplete or out-of-range')
    fig.get_by_label('Rebound height, trial 1',exact=True).fill('0.64')
    fig.locator('.inv-theory > summary').click()
    expect(fig.locator('.inv-theory')).to_contain_text('e²')
    page.screenshot(path=str(OUT/'bounce-mobile-evidence.png'))
    close(fig);page.locator('#tb-notebook').click()
    notebook=page.get_by_role('dialog',name='My notebook',exact=True)
    expect(notebook).to_contain_text('Measure what a bounce returns')
    notebook.get_by_text('Investigation record · 6 trials',exact=True).click()
    expect(notebook).to_contain_text('Same ball, surface and camera.')
    with page.expect_download() as dl:
        notebook.get_by_role('button',name='Save my notebook',exact=True).click()
    md=OUT/'notebook.md';dl.value.save_as(str(md))
    assert long_claim in md.read_text();assert 'Supplied observation' in md.read_text()
    notebook.get_by_text('Back up or restore',exact=True).click()
    with page.expect_download() as dl:
        notebook.get_by_role('button',name='Save a backup',exact=True).click()
    backup=OUT/'backup.json';dl.value.save_as(str(backup));data=json.loads(backup.read_text())
    assert len(data['keys']['investigation:j-bounce']['rows'])==6
    assert data['keys']['lab:j-bounce']['prediction']=='Height and speed ratios will differ.'
    page.evaluate("App.store.remove('investigation:j-bounce')")
    with page.expect_navigation(wait_until='networkidle'):
        notebook.locator('input[type=file]').set_input_files(str(backup))
    fig=open_lesson(page,'j-bounce');fig.locator('.inv-long > summary').click()
    expect(fig.locator('.inv-table tbody tr')).to_have_count(6)
    # A real original widget is reachable, with a return to the investigation.
    fig.get_by_role('link',name='Analyse a local video',exact=True).click()
    tracker=page.locator('figure[data-live="videotrack"]')
    expect(tracker.get_by_role('button',name='Choose a video',exact=True)).to_be_visible()
    tracker.get_by_role('link',name='Return to the bounce investigation',exact=True).click()
    expect(page.locator('figure[data-active-lesson="j-bounce"] .lab-title')).to_have_text('Measure what a bounce returns')
    close(page.locator('figure[data-active-lesson="j-bounce"]'))
    # Incompatible controls cannot create misleading table readings.
    for ident,mode in [('j-yoyo','Pendulum'),('j-gas','Warm at 1 L'),('j-balance','Turning force pair')]:
        fig=open_lesson(page,ident);fig.get_by_role('button',name=mode,exact=True).click()
        expect(fig.get_by_role('button',name='Record model reading',exact=True)).to_be_disabled();close(fig)
    fig=open_lesson(page,'j-surfaces');fig.get_by_role('button',name='Polarising filter',exact=True).click()
    expect(fig.get_by_role('button',name='Record model reading',exact=True)).to_be_enabled()
    fig.get_by_role('slider',name='Analyser angle',exact=True).focus();fig.get_by_role('slider',name='Analyser angle',exact=True).press('End')
    expect(fig.locator('.live-readout')).to_contain_text('cos²(90°)=0')
    close(fig)
    fig=open_lesson(page,'j-bounce-timing')
    fig.get_by_role('slider',name='Next flight interval',exact=True).focus()
    fig.get_by_role('slider',name='Next flight interval',exact=True).press('Home')
    expect(fig.locator('.live-readout')).to_contain_text('no third impact')
    fig.locator('.inv-long > summary').click();fig.get_by_role('button',name='Add a trial',exact=True).click()
    fig.get_by_label('First flight interval, trial 1',exact=True).fill('0')
    fig.get_by_label('Next flight interval, trial 1',exact=True).fill('1')
    expect(fig.locator('.inv-long')).to_contain_text('incomplete or out-of-range')
    close(fig)
    # Sources/linked lessons all exist and are linked through actual publication targets.
    ids=page.evaluate('App.data.lessons.filter(l=>l.object).map(l=>l.id)')
    assert len(ids)==17
    for ident in ids:
        fig=open_lesson(page,ident)
        links=fig.locator('.inv-links [data-open-lesson]')
        for i in range(links.count()):
            target=links.nth(i).get_attribute('data-open-lesson')
            assert page.evaluate('(id)=>!!App.data.lessons.find(l=>l.id===id)',target)
        close(fig)
    # Keyboard and responsive overflow including the open table.
    for width in [320,768,1440]:
        page.set_viewport_size({'width':width,'height':900});fig=open_lesson(page,'j-bounce')
        fig.locator('.inv-long > summary').click()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        fig.get_by_role('button',name='Add a trial',exact=True).focus();page.keyboard.press('Enter')
        expect(fig.locator('.inv-table tbody tr')).to_have_count(7)
        fig.get_by_role('button',name='Remove trial 7',exact=True).click()
        if width==1440:page.screenshot(path=str(OUT/'bounce-desktop.png'))
        close(fig)
    # The investigation chunk and directory remain cached, and records survive offline.
    page.evaluate('()=>navigator.serviceWorker.ready.then(()=>true)');page.reload(wait_until='networkidle')
    page.wait_for_function('navigator.serviceWorker.controller!==null')
    context.set_offline(True);page.reload(wait_until='domcontentloaded')
    fig=open_lesson(page,'j-lightclock');expect(fig.locator('.live-readout')).to_contain_text('γ=1.25');close(fig)
    fig=open_lesson(page,'j-bounce');fig.locator('.inv-long > summary').click()
    expect(fig.locator('.inv-table tbody tr')).to_have_count(6);close(fig)
    assert not errors,errors
    context.close()
    # Storage can fill after the initial probe succeeds; evidence remains usable in memory.
    limited=browser.new_context(reduced_motion='reduce');p=limited.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
    p.goto(url,wait_until='networkidle')
    p.evaluate("()=>{Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')};}")
    fig=open_lesson(p,'j-bounce');fig.locator('.inv-long > summary').click()
    fig.get_by_label('My claim and supporting observations',exact=True).fill('Kept during this visit despite full storage.')
    expect(fig.locator('.inv-save')).to_contain_text('Kept for this visit')
    close(fig);fig=open_lesson(p,'j-bounce');fig.locator('.inv-long > summary').click()
    expect(fig.get_by_label('My claim and supporting observations',exact=True)).to_have_value('Kept during this visit despite full storage.')
    assert not errors,errors
    limited.close();browser.close()
 print('PASS investigation directory, observations, long text, CSV, notebook, backup/restore, original video, controls, keyboard, responsive and offline')
finally:
 server.shutdown()
 (OUT/'receipt.json').write_text(json.dumps({'url':url,'errors':errors,'checks':'journey, exports, persistence, original tracker, control modes, responsive, offline'},indent=2))
