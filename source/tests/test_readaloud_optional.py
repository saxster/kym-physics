"""Exercise the real Listen controls with a silent speech-output substitute.

Verify opened teaching notes stay in the reading queue and closed notes stay out.
The substitute exercises sentence selection without downloading a voice or playing audio.
"""
import functools
import http.server
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_): pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT/'build/site')))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_address[1]}/'
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        page = context.new_page()
        page.goto(url+'#s0-1', wait_until='networkidle')
        page.get_by_role('button', name='Listen to section 0.1', exact=True).click()
        expect(page.get_by_role('button', name='Download Isabella', exact=True)).to_be_visible()
        expect(page.get_by_role('button', name='Use this device’s voice', exact=True)).to_be_visible()
        assert not page.evaluate("performance.getEntriesByType('resource').some(r=>/huggingface|kokoro.web/.test(r.name))")
        context.close()

        context = browser.new_context(viewport={'width': 820, 'height': 1000}, reduced_motion='reduce')
        context.add_init_script("""localStorage.setItem('mw:readaloud:voice',JSON.stringify('system'));
          window.spoken=[];
          Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},addEventListener(){},
            speak(u){window.spoken.push(u.text);}}});""")
        page = context.new_page(); page.goto(url+'#s0-1', wait_until='networkidle')
        listen = page.get_by_role('button', name='Listen to section 0.1', exact=True)
        listen.click()
        expect(page.locator('.rl-player')).to_be_visible()
        baseline = int(page.locator('.rl-count').inner_text().split(' of ')[1])
        page.get_by_role('button', name='Stop reading', exact=True).click()
        review = page.locator('#five-model')
        school = page.locator('#s0-1 .box.school')
        review.locator(':scope > summary').click()
        school.locator(':scope > summary').click()
        listen.click()
        expanded = int(page.locator('.rl-count').inner_text().split(' of ')[1])
        assert expanded > baseline, 'Opened explanations must join the narration'
        for _ in range(expanded - 1):
            page.get_by_role('button', name='Next sentence', exact=True).click()
        spoken = ' '.join(page.evaluate('spoken'))
        assert 'simplified picture or description' in spoken, 'Read the visible model explanation'
        assert 'IB MYP science' in spoken, 'Read the visible school explanation'
        page.get_by_role('button', name='Stop reading', exact=True).click()
        review.locator(':scope > summary').click()
        school.locator(':scope > summary').click()
        listen.click()
        assert int(page.locator('.rl-count').inner_text().split(' of ')[1]) == baseline, 'Closed notes must stay out of the reading queue'
        browser.close()
    print('PASS voice download choice, opened review/school narration, closed review exclusion')
finally:
    server.shutdown()
