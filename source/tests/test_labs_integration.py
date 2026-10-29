#!/usr/bin/env python3
"""Public integration: original/alternative, journal export, story return, failure and offline."""
import argparse
import functools
import http.server
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--site', default='build/site')
p.add_argument('--url', help='Exercise the deployed book rather than a local server')
p.add_argument('--out', default='build/labs-integration')
args = p.parse_args()
SITE = (ROOT / args.site).resolve()
OUT = ROOT / args.out; OUT.mkdir(parents=True, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass


server = None
if args.url:
    url = args.url.rstrip('/') + '/'
else:
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(SITE)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_address[1]}/'
errors = []


def open_lesson(page, ident):
    lesson = page.evaluate('(id)=>App.data.lessons.find(l=>l.id===id)', ident)
    page.evaluate('(id)=>location.hash=id', lesson['target'])
    fig = page.locator('#' + lesson['target'])
    fig.locator(f'[data-lesson-id="{ident}"]').click()
    expect(fig.locator('.lab-title')).to_have_text(lesson['title'])
    return fig


try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce', accept_downloads=True)
        page = context.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
        if args.url:
            page.set_default_navigation_timeout(180000)
            expect.set_options(timeout=60000)
        page.goto(url, wait_until='networkidle')
        # The original field demo remains usable alongside its alternative.
        old = page.locator('figure[data-live="field3d"]')
        page.evaluate('(id)=>location.hash=id', old.get_attribute('id'))
        old.locator('.live-open').click()
        expect(old.locator('.live-3d')).to_be_visible()
        old.get_by_role('button', name='Back to the drawing', exact=True).click()
        fig = open_lesson(page, 'field-probe')
        fig.get_by_label('My prediction', exact=True).fill('The resultant includes both fields.')
        fig.get_by_text('Explain what happened', exact=True).click()
        fig.get_by_label('My explanation', exact=True).fill('The compass follows their vector sum.')
        page.screenshot(path=str(OUT / 'journal-before-close.png'))
        fig.get_by_role('button', name='Back to the drawing', exact=True).click()
        fig = open_lesson(page, 'field-probe')
        expect(fig.get_by_label('My prediction', exact=True)).to_have_value('The resultant includes both fields.')
        fig.get_by_text('Explain what happened', exact=True).click()
        expect(fig.get_by_label('My explanation', exact=True)).to_have_value('The compass follows their vector sum.')
        fig.get_by_role('button', name='Back to the drawing', exact=True).click()
        page.locator('#tb-notebook').click()
        notebook = page.get_by_role('dialog', name='My notebook', exact=True)
        expect(notebook).to_contain_text('The compass follows their vector sum.')
        with page.expect_download() as download:
            notebook.get_by_role('button', name='Save my notebook', exact=True).click()
        download.value.save_as(str(OUT / 'notebook.md'))
        assert 'The compass follows their vector sum.' in (OUT / 'notebook.md').read_text()
        notebook.get_by_text('Back up or restore', exact=True).click()
        with page.expect_download() as download:
            notebook.get_by_role('button', name='Save a backup', exact=True).click()
        download.value.save_as(str(OUT / 'notebook.json'))
        backup = json.loads((OUT / 'notebook.json').read_text())
        assert backup['keys']['lab:field-probe']['explanation'] == 'The compass follows their vector sum.'
        notebook.get_by_role('button', name='Close the notebook', exact=True).click()
        # Restore through the public file picker, after removing only the test's journal entry.
        page.evaluate("App.store.set('lab:field-probe',null)")
        page.locator('#tb-notebook').click()
        notebook.locator('input[type=file]').set_input_files(str(OUT/'notebook.json'))
        page.wait_for_timeout(1000)
        page.wait_for_load_state('networkidle')
        fig=open_lesson(page,'field-probe')
        expect(fig.get_by_label('My prediction',exact=True)).to_have_value('The resultant includes both fields.')
        fig.get_by_role('button',name='Back to the drawing',exact=True).click()
        # A story opens exactly the shared lesson and has an explicit return route.
        page.evaluate("App.openStory('oersted')")
        story = page.locator('#storydlg')
        link = story.locator('[data-open-lesson="field-probe"]')
        expect(link).to_be_visible()
        page.screenshot(path=str(OUT / 'story-before-experiment.png'))
        link.click()
        expect(page.locator('#storydlg')).not_to_be_visible()
        expect(page.locator('.lab-title:visible')).to_have_text('Add wire and Earth fields')
        page.get_by_role('button', name='Return to the story', exact=True).click()
        expect(page.locator('#storydlg')).to_be_visible()
        expect(story.locator('[data-open-lesson="field-probe"]')).to_be_focused()
        page.locator('#storydlg .sd-close').click()
        for story_id,lesson_id in [('tabla','w9-membrane'),('raman','w11-polarisation'),('raman','w11-raman'),('light-wave','w11-arago')]:
            page.evaluate('(id)=>App.openStory(id)',story_id)
            link=page.locator('#storydlg').locator(f'[data-open-lesson="{lesson_id}"]')
            expect(link).to_be_visible();link.click()
            fig=page.locator('figure.live-on').filter(has=page.locator(f'[data-lesson="{lesson_id}"]'))
            if lesson_id=='w9-membrane':
                expect(fig.get_by_role('slider',name='Central mass loading')).to_have_value('2')
            elif lesson_id=='w11-polarisation':
                expect(fig.get_by_role('button',name='Water glare',exact=True)).to_have_attribute('aria-pressed','true')
            elif lesson_id=='w11-raman':
                expect(fig.get_by_role('button',name='Stokes',exact=True)).to_have_attribute('aria-pressed','true')
            else:
                expect(fig.get_by_role('slider',name='Probe radius on screen')).to_have_value('0')
            page.get_by_role('button',name='Return to the story',exact=True).click()
            expect(page.locator('#storydlg')).to_be_visible()
            page.locator('#storydlg .sd-close').click()
        # Ordinary chapter entry must not inherit a prior story preset.
        fig=open_lesson(page,'w9-membrane')
        expect(fig.get_by_role('slider',name='Central mass loading')).to_have_value('0')
        fig.get_by_role('button',name='Back to the drawing',exact=True).click()
        # Explicit finite-duration sound starts before its scheduled stop (Web Audio contract).
        fig = open_lesson(page, 'w9-membrane')
        audio_buttons = fig.locator('.live-controls > button.live-ctl').filter(has_text='Listen')
        if not audio_buttons.count():
            audio_buttons = fig.locator('.live-controls > button.live-ctl').filter(has_text='Hear')
        assert audio_buttons.count(), 'Missing explicit membrane audio action'
        audio_buttons.first.click()
        page.wait_for_timeout(100)
        assert not errors, errors
        fig.get_by_role('button', name='Back to the drawing', exact=True).click()
        # Forced context loss retains a usable calculated diagram and controls.
        fig = open_lesson(page, 'motor')
        fig.locator('.lab-view-controls > summary').click()
        for name in ['Side view','Top view','Reset view']:
            fig.get_by_role('button',name=name,exact=True).click()
        view=fig.locator('.live-3d')
        view.focus();view.press('ArrowLeft');view.press('ArrowUp')
        touch=fig.get_by_role('button',name='Turn with touch: off',exact=True)
        touch.click();expect(view).to_have_css('touch-action','none')
        fig.get_by_role('button',name='Turn with touch: on',exact=True).click()
        expect(view).to_have_css('touch-action','pan-y')
        fig.locator('.live-3d canvas').evaluate("cv=>cv.dispatchEvent(new Event('webglcontextlost',{cancelable:true}))")
        expect(fig.locator('.live-3d')).not_to_be_visible()
        expect(fig.locator('.lab-diagram-scroll')).to_be_visible()
        slider = fig.get_by_role('slider', name='Coil angle', exact=True)
        slider.focus(); slider.press('End')
        expect(fig.locator('.live-readout')).not_to_be_empty()
        fig.get_by_role('button', name='Back to the drawing', exact=True).click()
        # Repeated openings restore the drawing and release the scene DOM each time.
        for _ in range(8):
            fig = open_lesson(page, 'motor')
            fig.get_by_role('button', name='Back to the drawing', exact=True).click()
            expect(fig.locator('.live-stage')).to_have_count(0)
        # Offline cache covers an experiment not previously opened in this context.
        page.evaluate('()=>navigator.serviceWorker.ready.then(()=>true)')
        page.reload(wait_until='networkidle')
        page.wait_for_function('navigator.serviceWorker.controller !== null')
        context.set_offline(True)
        page.reload(wait_until='domcontentloaded')
        fig = open_lesson(page, 'photoelectric')
        expect(fig.locator('.live-readout')).to_contain_text('eV')
        page.screenshot(path=str(OUT / 'offline-photoelectric.png'))
        fig.get_by_role('button', name='Back to the drawing', exact=True).click()
        page.emulate_media(media='print')
        assert page.locator('figure[data-live="field3d"] > svg').evaluate("e=>getComputedStyle(e).display!=='none'")
        context.set_offline(False)
        assert not errors, errors
        browser.close()
    print('PASS originals, local prediction/explanation, notebook export/backup, story return/focus, context loss, repeated close, offline lazy lesson and print')
finally:
    if server:
        server.shutdown()
