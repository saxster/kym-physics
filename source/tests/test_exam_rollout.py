"""All chapters have reviewed preparation content and a working offline practice route."""
import functools
import http.server
import json
import os
import re
from pathlib import Path
import sys
import threading
import unittest
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from playwright.sync_api import sync_playwright, expect
ROOT = Path(__file__).resolve().parents[1]
SITE = Path(os.environ.get('READER_EXAM_SITE', ROOT/'build/site')).resolve()
sys.path.insert(0, str(ROOT))
from exam_prep import load_exam, validate_exam
from exam_rollout import create_mixed


def catalogs():
    return sorted([load_exam(p) for p in (ROOT/'exams').glob('*.json')], key=lambda c:c['chapter'])


class Rollout(unittest.TestCase):
    def test_all_chapters_and_cumulative_coverage(self):
        banks = catalogs()
        self.assertEqual([c['chapter'] for c in banks], list(range(16)))
        all_ids = []
        for c in banks:
            self.assertEqual(len(c['papers']), 2)
            self.assertGreaterEqual(len(c['cards']), len(c['objectives']))
            self.assertEqual({q['stage'] for q in c['questions']}, {'recall','worked','guided','independent','transfer','review','paper'})
            all_ids += [q['id'] for q in c['questions']]
            expected={'#s'+v.replace('.', '-') for v in re.findall(r'^## (\d+\.\d+) ', (ROOT/'src'/f'ch{c["chapter"]:02d}.md').read_text(), re.M)}
            self.assertLessEqual(expected, {q['teach'] for q in c['questions']}, f'Every section needs practice: {c["chapter"]}')
        self.assertEqual(len(all_ids), len(set(all_ids)))
        mixed = validate_exam(create_mixed(banks))
        self.assertEqual({o['id'] for o in mixed['objectives']}, {o['id'] for c in banks for o in c['objectives']})
        original = {q['id']:q for c in banks for q in c['questions']}
        for q in mixed['questions']:
            self.assertEqual(q, original[q['id']], 'Cumulative practice must preserve reviewed answers')

    def test_generated_pages_and_offline_links(self):
        class Links(HTMLParser):
            def __init__(self): super().__init__(); self.ids=[]; self.links=[]
            def handle_starttag(self, tag, attrs):
                a=dict(attrs)
                if 'id' in a:self.ids.append(a['id'])
                if tag=='a' and a.get('href'):self.links.append(a['href'])
        site=SITE; pages=[site/'index.html',*sorted((site/'exams').glob('*.html'))]
        self.assertEqual(len(pages),18)
        parsed={}
        for path in pages:
            self.assertLess(path.stat().st_size,4*1024*1024)
            item=Links();item.feed(path.read_text());parsed[path.resolve()]=item
            self.assertEqual(len(item.ids),len(set(item.ids)),path.name)
        files=json.loads(re.search(r'const FILES = (.*?);',(site/'sw.js').read_text()).group(1))
        for path in pages[1:]:self.assertIn('./'+str(path.relative_to(site)),files)
        for path,item in parsed.items():
            for href in item.links:
                url=urlsplit(href)
                if url.scheme or url.netloc:continue
                target=(path.parent/unquote(url.path)).resolve() if url.path else path
                if target.is_dir():target=target/'index.html'
                if not target.exists() and path.name == 'index.html' and url.path.startswith('source/'):
                    target=ROOT.parent/unquote(url.path)  # Source notes ship beside the repository's published index.
                self.assertTrue(target.exists(),(path.name,href))
                if url.fragment and target in parsed:self.assertIn(unquote(url.fragment),parsed[target].ids,(path.name,href))

    def test_every_chapter_in_real_reader(self):
        banks = catalogs(); self.assertEqual(len(banks),16)
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self,*_): pass
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(SITE)))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        base=f'http://127.0.0.1:{server.server_address[1]}/'
        out=ROOT/'build/exam-rollout';out.mkdir(parents=True,exist_ok=True)
        receipt={'chapters':[],'errors':[]}
        try:
            with sync_playwright() as p:
                browser=p.chromium.launch()
                ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
                page=ctx.new_page();page.on('pageerror',lambda e:receipt['errors'].append(str(e)))
                page.goto(base,wait_until='networkidle')
                for chapter in [0,12]:
                    page.goto(base+f'index.html#ch{chapter}',wait_until='networkidle')
                    page.get_by_role('button',name='Prepare for my exam',exact=True).click()
                    expect(page.locator('#exam-prep')).to_have_class('flow exam-prep exam-enhanced')
                    self.assertEqual(page.evaluate('App.data.exam.chapter'),chapter)
                for c in banks:
                    target='' if c['chapter']==1 else f'exams/ch{c["chapter"]:02d}.html'
                    page.goto(base+target+'#exam-prep',wait_until='networkidle')
                    expect(page.locator('#exam-prep')).to_have_class('flow exam-prep exam-enhanced')
                    q=next(q for q in c['questions'] if q['stage']=='independent')
                    node=page.locator('#exam-q-'+q['id'])
                    expect(node.locator('.exam-solution')).not_to_be_visible()
                    node.get_by_label('Your first answer',exact=True).fill('I need to review this idea and check the reasoning.')
                    node.get_by_role('button',name='Show model answer',exact=True).click()
                    expect(node.locator('.exam-model')).to_be_visible()
                    node.get_by_role('button',name='Save marked attempt',exact=True).click()
                    expect(node.locator('.exam-saved')).to_contain_text('0 /')
                    page.reload(wait_until='networkidle')
                    expect(node.locator('.exam-saved')).to_be_visible()
                    expect(node.get_by_label('Your first answer',exact=True)).to_have_value('I need to review this idea and check the reasoning.')
                    for width in [390,1440]:
                        page.set_viewport_size({'width':width,'height':900})
                        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(c['chapter'],width)
                    if c['chapter'] in [0,8,15]:page.screenshot(path=str(out/f'chapter-{c["chapter"]}.png'))
                    receipt['chapters'].append({'chapter':c['chapter'],'answer_mark_reload':'PASS','widths':[390,1440]})
                page.goto(base+'exams/ch03.html#exam-word-ch03-card-1',wait_until='networkidle')
                card=page.locator('#exam-word-ch03-card-1 details');card.locator('summary').click()
                page.goto(base+'exams/ch03.html#exam-q-ch03-o1-q2',wait_until='networkidle')
                expect(page.locator('#exam-q-ch03-o1-q2')).to_contain_text('You have seen this solution before')
                page.evaluate("dispatchEvent(new Event('beforeprint'))")
                self.assertTrue(page.evaluate("App.store.get('exam:chapter-03').drafts['ch03-o2-q2'].solutionSeen"))
                page.evaluate("dispatchEvent(new Event('afterprint'))")
                page.goto(base+'exams/mixed.html#exam-prep',wait_until='networkidle')
                expect(page.locator('#exam-prep')).to_have_class('flow exam-prep exam-enhanced')
                # Previously seen chapter questions cannot become fresh independent evidence in mixed practice.
                state=page.evaluate("App.store.get('exam:mixed')")
                self.assertTrue(any(d.get('solutionSeen') for d in state['drafts'].values()))
                page.locator('#tb-notebook').click()
                if page.locator('.nb-more').get_attribute('open') is None:page.locator('.nb-more > summary').click()
                with page.expect_download() as got:page.get_by_role('button',name='Save a backup',exact=True).click()
                backup=out/'all-chapters-backup.json';got.value.save_as(str(backup))
                saved=json.loads(backup.read_text())['keys']
                self.assertEqual(len([k for k in saved if k.startswith('exam:')]),17)
                page.get_by_role('button',name='Close the notebook',exact=True).click()
                fresh=browser.new_context(reduced_motion='reduce');rp=fresh.new_page()
                rp.goto(base+'exams/ch15.html#exam-prep',wait_until='networkidle');rp.locator('#tb-notebook').click()
                if rp.locator('.nb-more').get_attribute('open') is None:rp.locator('.nb-more > summary').click()
                with rp.expect_navigation(wait_until='networkidle'):rp.locator('.notebook input[type=file]').set_input_files(str(backup))
                expect(rp.locator('.exam-saved').first).to_be_visible();fresh.close()
                receipt['backup_restore']='All 17 chapter/mixed keys preserved and restored on a fresh browser context'
                page.wait_for_function('navigator.serviceWorker.controller!==null')
                ctx.set_offline(True)
                for n in range(16):
                    page.goto(base+f'exams/ch{n:02d}.html#exam-prep',wait_until='load')
                    expect(page.locator('#exam-prep')).to_have_class('flow exam-prep exam-enhanced')
                    self.assertEqual(page.evaluate('App.data.exam.chapter'),n)
                    expected=next(q['id'] for q in banks[n]['questions'] if q['stage']=='independent')
                    expect(page.locator('#exam-q-'+expected)).to_be_visible()
                page.goto(base+'index.html#ch3',wait_until='load')
                expect(page.locator('#ch3')).to_be_visible()
                self.assertEqual(len(page.evaluate('App.data.chapters')),16)
                self.assertFalse(receipt['errors'],receipt['errors'])
                browser.close()
            receipt['result']='PASS'
        finally:
            (out/'receipt.json').write_text(json.dumps(receipt,indent=2));server.shutdown(); server.server_close()

if __name__=='__main__':unittest.main()
