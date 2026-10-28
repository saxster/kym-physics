"""Exercise scene explanations through the real reader UI, including lazy offline loads.
Run with an already served book URL. Screenshots are written to ignored build output.
"""
import pathlib, re, sys
from playwright.sync_api import sync_playwright, expect
URL=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8872/').rstrip('/')+'/'
OUT=pathlib.Path(__file__).resolve().parents[1]/'build'/'explorer-checks'
OUT.mkdir(parents=True,exist_ok=True)

def open_explorer(page,name):
    page.goto(URL+'#explore-'+name)
    root=page.locator('#explore-'+name)
    root.locator('.explore-open').click()
    expect(root.locator('.scale-explorer' if name=='scale' else '.xp-wrap')).to_be_visible()
    return root

def snapshot(root,selector,path):
    # Put the persistent mobile reader toolbar away from the figure under inspection.
    style=root.page.add_style_tag(content='.navbtn{visibility:hidden!important;}')
    try: root.locator(selector).screenshot(path=str(OUT/path),animations='disabled')
    finally: style.evaluate('(e)=>e.remove()')

with sync_playwright() as p:
    browser=p.chromium.launch()
    errors=[]
    for width in [390,820,1440]:
        page=browser.new_page(viewport={'width':width,'height':1000},reduced_motion='reduce')
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(URL)
        assert not page.evaluate("performance.getEntriesByType('resource').some(r=>/x_map-/.test(r.name))"),'map eagerly loaded on cover'
        spectrum=open_explorer(page,'spectrum')
        sky=open_explorer(page,'sky')
        expect(sky.locator('.sky-phase-links')).to_be_hidden()
        for theme in ['light','dark','sepia']:
            page.evaluate('(t)=>document.documentElement.dataset.theme=t',theme)
            page.goto(URL+'#explore-spectrum')
            for title,key in [('Colour & spectral lines','visible'),('Electric & magnetic fields','wave'),('One photon & an electron','photon')]:
                btn=spectrum.get_by_role('button',name=title,exact=True)
                btn.focus();btn.press('Enter');expect(btn).to_have_attribute('aria-pressed','true')
                expect(spectrum.locator('.explorer-scene-note')).not_to_be_empty()
                assert spectrum.locator('.spectrum-canvas').evaluate('(e)=>e.clientHeight')==410
                page.wait_for_timeout(180)
                snapshot(spectrum,'.spectrum-canvas',f'spectrum-{key}-{width}-{theme}.png')
            spectrum.get_by_role('button',name='TV remote (940 nm, 1.32 eV)',exact=True).click()
            expect(spectrum.locator('.spectrum-canvas')).to_have_attribute('aria-label',re.compile('940 nm'))
            expect(spectrum.locator('.xp-readout')).to_contain_text('does not eject electrons')
            spectrum.get_by_role('button',name='Visible (750–400 nm, 1.65–3.10 eV)',exact=True).click()
            expect(spectrum.locator('.xp-readout')).to_contain_text('knocks out an electron')
            spectrum.get_by_role('button',name='Electric & magnetic fields',exact=True).click()
            animate=spectrum.get_by_role('button',name='Animate E ⊥ B wave',exact=True)
            expect(animate).to_have_attribute('aria-pressed','false');animate.click()
            expect(spectrum.get_by_role('button',name='Pause wave',exact=True)).to_have_attribute('aria-pressed','true')
            page.goto(URL+'#explore-sky')
            expect(spectrum.locator('button').filter(has_text='Animate E ⊥ B wave')).to_have_attribute('aria-pressed','false')
            sky.get_by_role('button',name='From space & Mumbai rooftop',exact=True).click()
            sky.get_by_role('button',name='Dec Solstice (21 Dec)',exact=True).click()
            sky.get_by_role('slider',name='Solar time of day in hours').evaluate("(e)=>{e.value=12;e.dispatchEvent(new Event('input',{bubbles:true}));}")
            expect(sky.locator('.explorer-scene-note')).to_contain_text('south of zenith')
            snapshot(sky,'.xp-split',f'sky-seasons-{width}-{theme}.png')
            time=sky.get_by_role('slider',name='Solar time of day in hours')
            time.focus();time.press('End')
            expect(sky.locator('.explorer-scene-note')).to_contain_text('Each blue arc traces one hour')
            snapshot(sky,'.xp-split',f'sky-night-{width}-{theme}.png')
            sky.get_by_role('button',name='Moon phases, eclipses & ideal tides',exact=True).click()
            expect(sky.locator('.sky-phase-links')).to_be_visible()
            for i in range(8):
                button=sky.locator('.sky-phase-links button').nth(i)
                button.focus();button.press('Enter');expect(button).to_have_attribute('aria-pressed','true')
                expect(sky.locator('.explorer-scene-note')).to_contain_text(f'Current position {i+1}.')
            snapshot(sky,'.xp-split',f'sky-moon-{width}-{theme}.png')
            snapshot(sky,'.sky-phase-links',f'sky-phases-{width}-{theme}.png')
            sky.get_by_role('button',name='Missions (Chandrayaan-3 & Aditya-L1)',exact=True).click()
            sky.get_by_role('button',name='Aditya-L1 (Sun–Earth L1 halo orbit)',exact=True).click()
            expect(sky.locator('.explorer-scene-note')).to_contain_text('oblique view')
            snapshot(sky,'.xp-split',f'sky-halo-{width}-{theme}.png')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,theme,'horizontal overflow')
        for name in ['sky','spectrum']:
            root=page.locator('#explore-'+name);page.goto(URL+'#explore-'+name)
            for _ in range(2):
                root.get_by_role('button',name='Close explorer',exact=True).click()
                root.locator('.explore-open').click();expect(root.locator('.xp-wrap')).to_be_visible()
        scale=open_explorer(page,'scale')
        for theme in ['light','dark','sepia']:
            page.evaluate('(t)=>document.documentElement.dataset.theme=t',theme)
            for name in ['Proton','Hydrogen atom','Visible light wave','Grain of sand','You (Kym)','Sun','Earth–Sun','One light-year','Milky Way']:
                options=scale.get_by_label('Jump to a landmark').locator('option').all_text_contents()
                if name not in options: continue
                scale.get_by_label('Jump to a landmark').select_option(label=name)
                expect(scale.locator('.scale-mechanism')).not_to_be_empty()
                expect(scale.locator('.scale-reference')).to_contain_text('metre')
                snapshot(scale,'.scale-scene',f'scale-{name.lower().replace(" ","-")}-{width}-{theme}.png')
        page.goto(URL+'#explore-map');root=page.locator('#explore-map')
        expect(root.locator('.amap-svg')).to_be_visible()
        for theme in ['light','dark','sepia']:
            page.evaluate('(t)=>document.documentElement.dataset.theme=t',theme)
            for region in ['World','India','Europe','Britain']:
                root.get_by_role('button',name=region,exact=True).click()
                labels=root.locator('.amap-labels text').evaluate_all('(es)=>es.filter(e=>e.getClientRects().length).map(e=>({box:e.getBoundingClientRect().toJSON(),size:parseFloat(getComputedStyle(e).fontSize)*e.getScreenCTM().a}))')
                for label in labels: assert label['size']>=12.5,(width,theme,region,label)
                for i,a in enumerate(labels):
                    for b in labels[i+1:]:
                        x,y=a['box'],b['box']
                        assert min(x['right'],y['right'])<=max(x['left'],y['left']) or min(x['bottom'],y['bottom'])<=max(x['top'],y['top']),(width,theme,region,'label collision')
                snapshot(root,'.amap',f'map-{region.lower()}-{width}-{theme}.png')
            # A location is still accessible through keyboard activation when labels are culled.
            pin=root.locator('.amap-pin').filter(visible=True).first
            pin.focus();pin.press('Enter');expect(root.locator('.amap-card')).to_be_visible()
        year=root.get_by_role('slider',name='Year',exact=True);year.focus();year.press('Home')
        expect(root.locator('.amap-year')).to_contain_text('500 BCE')
        year.press('End');expect(root.locator('.amap-year')).to_contain_text('2026')
        assert root.locator('.ll-bar').count()>20
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        page.close();print('PASS all explorer scene views/themes, keyboard, reopen and map labels:',width,flush=True)
    context=browser.new_context(service_workers='allow')
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(URL);page.evaluate('navigator.serviceWorker.ready')
    page.wait_for_function('navigator.serviceWorker.controller!==null')
    context.set_offline(True)
    for name in ['scale','sky','spectrum']:
        page.goto(URL+'#explore-'+name);page.reload()
        root=page.locator('#explore-'+name);root.locator('.explore-open').click()
        expect(root.locator('.scale-explorer' if name=='scale' else '.xp-wrap')).to_be_visible()
    page.goto(URL+'#explore-map');page.reload();expect(page.locator('#explore-map .amap-svg')).to_be_visible()
    assert not errors,errors
    print('PASS fresh offline lazy mount of all four explorers; no page errors',flush=True)
    browser.close()
