"""Acceptance checks for gaps found in the published Powers of Ten plan audit."""
from pathlib import Path
import math, sys
from playwright.sync_api import sync_playwright, expect
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
OUT=Path(__file__).resolve().parents[1]/'build'/'plan-audit';OUT.mkdir(parents=True,exist_ok=True)
DIMENSIONS={'Proton':1e-15,'Hydrogen atom':1e-10,'Visible light wave':5e-7,'Grain of sand':.001,'You (Kym)':1,'Apartment':10,'Neighbourhood':100,'Coastal region':1e5,'Earth':12742000,'Sun':1.39e9,'Earth–Sun':1.496e11,'One light-year':9.4607e15,'Milky Way':1e21}
def open_explorer(page):
 page.goto(URL+'#explore-scale');page.get_by_role('button',name='Open Powers of Ten',exact=True).click()
def colours(canvas):
 return canvas.evaluate('''c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const s=new Set();for(let i=0;i<d.length;i+=400)s.add(`${d[i]},${d[i+1]},${d[i+2]}`);return s.size}''')
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':320,'height':900},reduced_motion='reduce');errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 open_explorer(page)
 expect(page.get_by_role('button',name='10× smaller',exact=True)).to_be_focused()
 choose=page.get_by_role('combobox',name='Jump to a landmark');slider=page.get_by_role('slider');canvas=page.locator('.scale-canvas')
 for name,dimension in DIMENSIONS.items():
  choose.select_option(label=name)
  for w in [320,1440]:
   page.set_viewport_size({'width':w,'height':900})
   page.wait_for_timeout(80)
   e=float(slider.input_value());box=canvas.bounding_box()
   assert dimension*box['width']/10**e <= .8*min(box['width'],box['height'])+1,(name,w,e,box)
   assert abs(float(slider.input_value())-e)<1e-9
  assert page.locator('.scale-caption').inner_text().startswith('Selected reference: '+name),name
 print('PASS all 13 landmark sizes and mobile-to-desktop fitting')
 page.get_by_role('button',name='10× smaller',exact=True).click()
 expect(choose).to_have_value('')
 for e in [-14,-12,-7,14,15,19,20]:
  slider.evaluate('(s,e)=>{s.value=e;s.dispatchEvent(new Event("input",{bubbles:true}))}',e)
  assert colours(canvas)>1,e
  assert 'marker' in canvas.get_attribute('aria-label') or 'reference' in canvas.get_attribute('aria-label'),e
 print('PASS reference content throughout formerly blank intervals')
 page.get_by_role('button',name='Back to you',exact=True).click()
 page.get_by_role('button',name='Take a guided journey',exact=True).click()
 expect(page.get_by_role('heading',name='A journey in five small steps')).to_be_focused()
 page.get_by_role('button',name='Begin at one metre',exact=True).click()
 actions=['Begin at one metre','Make the view 10× wider','Visit one millimetre','Compare with one metre','Reveal the next width']
 for i,action in enumerate(actions):
  if i:page.get_by_role('button',name='Next',exact=True).click()
  if i==3: expect(page.locator('.scale-guide')).not_to_contain_text('The factors multiply:')
  page.get_by_role('button',name=action,exact=True).click()
  if i==3: expect(page.locator('.scale-guide')).to_contain_text('The factors multiply:')
  page.get_by_role('button',name='10× smaller',exact=True).click()
  expect(page.get_by_role('button',name='Return to this step',exact=True)).to_be_visible()
  page.get_by_role('button',name='Return to this step',exact=True).click()
  expect(page.get_by_role('button',name='Return to this step',exact=True)).to_be_hidden()
 expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
 page.get_by_role('button',name='Close guide',exact=True).click()
 expect(page.get_by_role('button',name='Take a guided journey',exact=True)).to_be_focused()
 print('PASS complete guide, resynchronisation and focus')
 for w in [320,390,820,1024,1180,1440]:
  page.set_viewport_size({'width':w,'height':900})
  page.evaluate("document.documentElement.style.setProperty('--scale','1.84')")
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),('200% text',w)
  page.evaluate("document.documentElement.style.setProperty('--scale','0.92')")
 print('PASS 200% reading text reflow at six widths')
 # A failed module load can really be retried, even when the browser cached the failed import.
 context=browser.new_context(service_workers='block',reduced_motion='reduce');failure=context.new_page();attempts=[]
 def chunk_route(route):
  attempts.append(route.request.url)
  if len(attempts)==1:route.abort()
  else:route.continue_()
 failure.route('**/live/x_scale-*',chunk_route)
 failure.goto(URL+'#explore-scale');launch=failure.get_by_role('button',name='Open Powers of Ten',exact=True);launch.click()
 expect(failure.locator('.live-warn')).to_contain_text('could not load')
 expect(launch).to_be_focused();launch.click();expect(failure.locator('.scale-width')).to_have_text('1 m across')
 assert len(attempts)==2,attempts
 print('PASS failed chunk retry and focus recovery')
 # Image failure has an honest fallback and a working recovery control.
 image_page=context.new_page();blocked=[True]
 image_page.route('**/assets/scale/room.webp',lambda r:r.abort() if blocked[0] else r.continue_())
 open_explorer(image_page);image_page.get_by_role('button',name='10× larger',exact=True).click()
 expect(image_page.locator('.scale-caption')).to_contain_text('Illustration unavailable')
 blocked[0]=False;image_page.get_by_role('button',name='Retry illustrations',exact=True).click()
 expect(image_page.get_by_role('button',name='Retry illustrations',exact=True)).to_be_hidden()
 image_page.wait_for_function("(()=>{const c=document.querySelector('.scale-canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,s=new Set();for(let i=0;i<d.length;i+=400)s.add(`${d[i]},${d[i+1]},${d[i+2]}`);return s.size>50})()")
 print('PASS illustration failure fallback and recovery')
 # Ordinary reader links use pushState, so hashchange alone cannot pause a hidden explorer.
 moving=browser.new_page(reduced_motion='no-preference');open_explorer(moving)
 moving.get_by_text('About the scale, pictures and mathematics',exact=True).click()
 moving.get_by_role('button',name='10× larger',exact=True).click()
 moving.get_by_role('link',name='Read Chapter 0.3: Powers of ten',exact=True).click()
 expect(moving.locator('.scale-explorer')).to_be_hidden()
 value=moving.locator('.scale-width').text_content();moving.wait_for_timeout(700)
 assert value==moving.locator('.scale-width').text_content(),'hidden page kept changing'
 moving.go_back();expect(moving.locator('.scale-explorer')).to_be_visible()
 print('PASS router Back and hidden-page animation pause')
 page.bring_to_front();page.set_viewport_size({'width':1440,'height':1000});choose.select_option(label='Earth');page.wait_for_timeout(80)
 page.locator('.scale-explorer').screenshot(path=str(OUT/'04-fixed-earth.png'))
 assert not errors,errors
 browser.close()
