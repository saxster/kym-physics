"""Exercise exam preparation through the real reader, storage, print and offline boundaries."""
import argparse
import functools
import http.server
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--site', type=Path, default=ROOT/'build/site', help='Built reader directory to exercise')
args = parser.parse_args()
OUT = ROOT / 'build/exam-checks'
OUT.mkdir(parents=True, exist_ok=True)
receipt = {'checks': [], 'layouts': [], 'errors': []}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_): pass


server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(args.site.resolve())))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_address[1]}/'

# Controlled wall-clock time survives reload; timers and DOM events still execute normally.
CLOCK = """const ActualDate=Date; const initial=ActualDate.now();
window.examTestOffset=Number(sessionStorage.getItem('exam-test-offset')||0);
window.Date=class extends ActualDate { constructor(...args){super(...(args.length?args:[ActualDate.now()+window.examTestOffset]));}
static now(){return ActualDate.now()+window.examTestOffset;} };
window.advanceExamClock=ms=>{window.examTestOffset+=ms;sessionStorage.setItem('exam-test-offset',window.examTestOffset);document.dispatchEvent(new Event('visibilitychange'));};"""


def question(page, ident):
    page.goto(url+'#exam-q-'+ident, wait_until='networkidle')
    q = page.locator('#exam-q-'+ident)
    expect(q).to_be_visible()
    return q


def mark_all(q):
    for c in q.locator('.exam-rubric input').all(): c.check()
    q.get_by_role('button', name='Save marked attempt', exact=True).click()
    expect(q.locator('.exam-saved')).to_be_visible()
    expect(q.locator('.exam-saved')).to_be_focused()


try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce', accept_downloads=True)
        context.add_init_script(CLOCK)
        page = context.new_page()
        page.on('pageerror', lambda e: receipt['errors'].append(str(e)))
        page.goto(url, wait_until='networkidle')
        expect(page).to_have_title('The Moving World')
        page.get_by_role('link', name='Prepare for my exam · motion', exact=True).click()
        expect(page.get_by_role('heading', name='Prepare for my exam', exact=True)).to_be_visible()
        expect(page.get_by_role('heading', name='Practice today', exact=True)).to_be_visible()
        expect(page.locator('#exam-prep')).to_have_class('flow exam-prep exam-enhanced')
        receipt['checks'].append('cover entry, correct page identity, nonblank preparation page, daily heading')

        q = question(page, 'motion-independent-speed')
        expect(q.locator('.exam-solution')).not_to_be_visible()
        q.get_by_role('button', name='Show model answer', exact=True).click()
        expect(q.locator('.exam-question-status')).to_contain_text('Try an answer first')
        expect(q.locator('.exam-solution')).not_to_be_visible()
        q.get_by_label('Your first answer', exact=True).fill('150 cm = 1.50 m; average speed = 1.50 m ÷ 0.50 s = 3 m/s.')
        q.get_by_label('Final number', exact=True).fill('3')
        q.get_by_label('Unit in your answer', exact=True).fill('m/s')
        q.get_by_role('button', name='Show model answer', exact=True).click()
        expect(q.locator('.exam-number-feedback')).to_contain_text('agree with the model')
        expect(q.get_by_label('Your first answer', exact=True)).to_have_attribute('readonly', '')
        expect(q.get_by_role('button', name='Try this question again', exact=True)).to_have_count(0)
        mark_all(q)
        expect(q.get_by_role('button', name='Try this question again', exact=True)).to_be_visible()
        expect(page.locator('#exam-objective-motion-speed .exam-objective-status')).to_contain_text('Answered independently')
        page.reload(wait_until='networkidle')
        expect(q.get_by_label('Your first answer', exact=True)).to_have_value('150 cm = 1.50 m; average speed = 1.50 m ÷ 0.50 s = 3 m/s.')
        expect(q.locator('.exam-saved')).to_be_visible()
        receipt['checks'].append('empty-answer gate, own answer commitment, numeric feedback, rubric marking, independent evidence, saved answer and marks after reload')

        # Revealing on day one and marking on day two must retain the original answer date.
        transfer = question(page, 'motion-transfer-units')
        transfer.get_by_label('Your first answer', exact=True).fill('Both boats move at 2 m/s; convert to compatible units first.')
        transfer.get_by_role('button', name='Show model answer', exact=True).click()
        page.evaluate('advanceExamClock(86400000)')
        page.reload(wait_until='networkidle')
        mark_all(transfer)
        expect(page.locator('#exam-objective-motion-speed .exam-objective-status')).not_to_contain_text('Secure')
        fresh = question(page, 'motion-review-round-trip')
        fresh.get_by_label('Your first answer', exact=True).fill('Total distance / total time gives average speed. Displacement is zero on the round trip, so average velocity is zero.')
        fresh.get_by_role('button', name='Show model answer', exact=True).click()
        mark_all(fresh)
        expect(page.locator('#exam-objective-motion-speed .exam-objective-status')).to_contain_text('Secure in self-marked practice')
        receipt['checks'].append('delayed marking cannot create spaced success; a fresh changed-context answer on a later day can')

        hinted = question(page, 'motion-independent-acceleration')
        hinted.get_by_role('button', name='Give me a hint', exact=True).click()
        expect(hinted.get_by_label('Your first answer', exact=True)).to_be_focused()
        hinted.get_by_label('Your first answer', exact=True).fill('Change in velocity / elapsed time = 2 m/s².')
        hinted.get_by_label('Final number', exact=True).fill('2')
        hinted.get_by_label('Unit in your answer', exact=True).fill('m/s²')
        hinted.get_by_role('button', name='Show model answer', exact=True).click()
        mark_all(hinted)
        expect(hinted.locator('.exam-saved')).to_contain_text('with help')
        expect(page.locator('#exam-objective-motion-acceleration .exam-objective-status')).not_to_contain_text('Secure')
        receipt['checks'].append('hints are remembered and never counted as fresh independent evidence')

        page.get_by_label('Question stage', exact=True).select_option('worked')
        expect(page.locator('#exam-q-motion-independent-speed')).not_to_be_visible()
        page.evaluate("location.hash='exam-q-motion-independent-distance'")
        expect(page.locator('#exam-q-motion-independent-distance')).to_be_visible()
        page.get_by_role('button', name='Search the book (⌘K or /)', exact=True).click()
        search = page.get_by_role('combobox', name='Search the book', exact=True)
        search.fill('720')
        expect(page.get_by_role('option').filter(has_text='Boat B travels 7200')).to_have_count(0)
        search.fill('Prepare for my exam')
        expect(page.get_by_role('option').filter(has_text='Prepare for my exam').first).to_be_visible()
        page.keyboard.press('Escape')
        page.get_by_label('Question stage', exact=True).select_option('worked')
        page.get_by_role('button', name='Search the book (⌘K or /)', exact=True).click()
        search.fill('A model ferry')
        page.get_by_role('option').filter(has_text='Exam practice question').first.click()
        expect(page.locator('#exam-q-motion-independent-distance')).to_be_visible()
        receipt['checks'].append('filter recovery, direct question link, search entry and concealed answer exclusion')

        paper_a = page.locator('#exam-paper-motion-paper-a')
        page.goto(url+'#exam-paper-motion-paper-a', wait_until='networkidle')
        paper_a.get_by_role('button', name='Start 15-minute paper', exact=True).click()
        qa = page.locator('#exam-q-motion-paper-a-2')
        qa.get_by_label('Your first answer', exact=True).fill('540 / (3 × 60) = 3 m/s')
        qa.get_by_label('Final number', exact=True).fill('3')
        qa.get_by_label('Unit in your answer', exact=True).fill('m/s')
        expect(qa.locator('.exam-solution')).not_to_be_visible()
        deadline = page.evaluate("JSON.parse(localStorage.getItem('mw:exam:motion')).paper.deadline")
        page.evaluate('advanceExamClock(120000)')
        page.reload(wait_until='networkidle')
        expect(paper_a).to_have_attribute('open', '')
        expect(qa.get_by_label('Your first answer', exact=True)).to_have_value('540 / (3 × 60) = 3 m/s')
        assert deadline == page.evaluate("JSON.parse(localStorage.getItem('mw:exam:motion')).paper.deadline")
        expect(paper_a.locator('.exam-timer')).not_to_contain_text('15:00')
        page.evaluate('advanceExamClock(780001)')
        expect(page.locator('#exam-motion-status')).to_contain_text('Time is up')
        expect(qa.locator('.exam-solution')).to_be_visible()
        expect(qa.get_by_role('button', name='Try this question again', exact=True)).to_have_count(0)
        mark_all(qa)
        receipt['checks'].append('paper locks, first answers retained across reload, unchanged deadline, expiry and paper retry safety')

        page.goto(url+'#exam-paper-motion-paper-b', wait_until='networkidle')
        paper_b = page.locator('#exam-paper-motion-paper-b')
        paper_b.get_by_role('button', name='Use without a timer', exact=True).click()
        qb = page.locator('#exam-q-motion-paper-b-1')
        qb.get_by_label('Your first answer', exact=True).fill('I state the observer and describe relative motion.')
        expect(qb.locator('.exam-solution')).not_to_be_visible()
        paper_b.get_by_role('button', name='Finish paper and mark', exact=True).click()
        expect(qb.locator('.exam-solution')).to_be_visible()
        receipt['checks'].append('second paper supports untimed practice and explicit finishing')

        page.evaluate('window.print=()=>{window.examPrintRequested=true}')
        page.get_by_label('What to print', exact=True).select_option('questions:motion-paper-a')
        page.get_by_role('button', name='Print selected sheet', exact=True).click()
        page.emulate_media(media='print')
        expect(paper_a.locator('.exam-question')).to_have_count(6)
        expect(paper_a.locator('.exam-question').first).to_be_visible()
        expect(paper_a.locator('.exam-solution').first).not_to_be_visible()
        expect(paper_a.locator('.exam-response-ui').first).not_to_be_visible()
        expect(paper_a.locator('.exam-paper-ui')).not_to_be_visible()
        expect(paper_a.get_by_role('button')).to_have_count(0)
        expect(paper_b).not_to_be_visible()
        expect(page.locator('#ch1')).not_to_be_visible()
        page.pdf(path=str(OUT/'motion-paper-a-questions.pdf'), format='A4')
        page.emulate_media(media='screen')
        page.evaluate("dispatchEvent(new Event('afterprint'))")
        page.get_by_label('What to print', exact=True).select_option('answers:motion-paper-a')
        page.get_by_role('button', name='Print selected sheet', exact=True).click()
        page.emulate_media(media='print')
        expect(paper_a.locator('.exam-solution').first).to_be_visible()
        expect(paper_a.locator('.exam-markpoints').first).to_be_visible()
        expect(paper_a.get_by_role('button')).to_have_count(0)
        expect(paper_a.locator('.exam-marking-ui').first).not_to_be_visible()
        page.pdf(path=str(OUT/'motion-paper-a-answers.pdf'), format='A4')
        page.emulate_media(media='screen')
        page.evaluate("dispatchEvent(new Event('afterprint'))")
        receipt['checks'].append('question-only print excludes solutions and saved responses; answer print includes model and marking')

        with page.expect_download() as got:
            page.get_by_role('button', name='Export exam progress', exact=True).click()
        got.value.save_as(str(OUT/'motion-progress.md'))
        assert '1.50 m ÷ 0.50 s' in (OUT/'motion-progress.md').read_text()
        page.get_by_role('button', name='My notebook: highlights, notes and answers', exact=True).click()
        if page.locator('.nb-more').get_attribute('open') is None:
            page.locator('.nb-more > summary').click()
        with page.expect_download() as got:
            page.get_by_role('button', name='Save a backup', exact=True).click()
        backup_path = OUT/'notebook-with-exam.json'
        got.value.save_as(str(backup_path))
        assert json.loads(backup_path.read_text())['keys']['exam:motion']['attempts']
        page.get_by_role('button', name='Close the notebook', exact=True).click()
        # Restore through the existing notebook UI in a new browser storage context.
        restored = browser.new_context(reduced_motion='reduce')
        rp = restored.new_page(); rp.goto(url+'#exam-prep', wait_until='networkidle')
        rp.get_by_role('button', name='My notebook: highlights, notes and answers', exact=True).click()
        if rp.locator('.nb-more').get_attribute('open') is None:
            rp.locator('.nb-more > summary').click()
        rp.locator('.notebook input[type=file]').set_input_files(str(backup_path))
        rp.wait_for_timeout(1000)
        rp.goto(url+'#exam-q-motion-independent-speed', wait_until='networkidle')
        expect(rp.locator('#exam-q-motion-independent-speed .exam-saved')).to_be_visible()
        restored.close()
        receipt['checks'].append('readable Markdown export and existing notebook backup/restore on a fresh device context')

        for width in [320, 390, 820, 1024, 1180, 1440]:
            page.set_viewport_size({'width': width, 'height': 900})
            for theme in ['light', 'sepia', 'dark']:
                page.get_by_role('button', name='Reading settings: text size and colours', exact=True).click()
                page.locator('#settings-pop').get_by_role('button', name=theme.capitalize(), exact=True).click()
                page.keyboard.press('Escape')
                page.goto(url+'#exam-prep', wait_until='networkidle')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'), (width, theme)
                if (width, theme) in [(390, 'sepia'), (1440, 'light')]: page.screenshot(path=str(OUT/f'exam-{width}-{theme}.png'))
                graph = question(page, 'motion-independent-speed-graph')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'), (width, theme, 'graph')
                expect(graph.locator('svg')).to_be_visible()
                if width == 320:
                    assert graph.locator('svg text').evaluate_all('(nodes)=>nodes.every(n=>n.getBoundingClientRect().height>=11.5)'), 'Graph scale labels must remain readable on a narrow phone'
                receipt['layouts'].append({'width': width, 'theme': theme})
        page.goto(url+'#exam-motion-filters', wait_until='networkidle')
        select = page.get_by_label('Question stage', exact=True)
        select.focus(); page.keyboard.press('ArrowDown'); page.keyboard.press('Tab')
        assert page.evaluate("document.activeElement.id === 'exam-objective'")
        receipt['checks'].append('native keyboard controls, graph/data layout and six widths × three themes without horizontal overflow')

        page.goto(url+'#exam-q-motion-independent-speed', wait_until='networkidle')
        page.wait_for_function('navigator.serviceWorker.controller !== null')
        context.set_offline(True)
        page.reload(wait_until='load')
        expect(page.locator('#exam-q-motion-independent-speed .exam-saved')).to_be_visible()
        expect(page.get_by_role('button', name='Prepare for my exam', exact=True)).to_be_visible()
        context.set_offline(False)
        receipt['checks'].append('offline reload preserves complete practice and saved marking')
        context.close()

        nojs = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
        np = nojs.new_page(); np.goto(url+'#exam-q-motion-independent-speed', wait_until='load')
        nq = np.locator('#exam-q-motion-independent-speed')
        nq.locator('.exam-solution > summary').click()
        expect(nq.locator('.exam-model')).to_be_visible()
        nojs.close()
        broken = browser.new_context(reduced_motion='reduce')
        broken.add_init_script("Storage.prototype.setItem=function(){throw new DOMException('No storage','QuotaExceededError')}")
        bp = broken.new_page(); bp.goto(url+'#exam-q-motion-recall-speed', wait_until='networkidle')
        expect(bp.locator('.exam-storage-note')).to_be_visible()
        bq = bp.locator('#exam-q-motion-recall-speed')
        bq.get_by_label('Your first answer', exact=True).fill('Total distance divided by total elapsed time; m/s.')
        bq.get_by_role('button', name='Show model answer', exact=True).click()
        mark_all(bq)
        broken.close()
        receipt['checks'].append('readable no-JavaScript native answer disclosure and usable storage-failure session')
        assert not receipt['errors'], receipt['errors']
        browser.close()
    receipt['result'] = 'PASS'
    print('PASS complete motion exam journey, marking, delayed evidence, papers, print, backup, offline, fallback and responsive matrix')
finally:
    (OUT/'receipt.json').write_text(json.dumps(receipt, indent=2))
    server.shutdown()
