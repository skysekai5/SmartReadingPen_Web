from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re
root=Path(__file__).resolve().parent.parent
modules={}
def url(name):
 if name in modules:return modules[name]
 source=(root/'js'/name).read_text()
 source=re.sub(r"from '(\./[^']+)'",lambda m:"from '"+url(m.group(1)[2:])+"'",source)
 value='data:text/javascript;base64,'+base64.b64encode(source.encode()).decode();modules[name]=value;return value
html=(root/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="./styles.css"/>','<style>'+(root/'styles.css').read_text()+'</style>')
html=html.replace('src="./js/app.js"','src="'+url('app.js')+'"')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':844});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.wait_for_timeout(1000)
 print('Title',page.title(),'photo',page.locator('#photo-file').count(),'errors',errors[:5])
 assert page.locator('#photo-file').count()==1, errors
 page.locator('[data-page=play]').click();print('play',page.locator('[data-go=shooter]').count()); assert page.locator('[data-go=shooter]').count()==1
 page.locator('[data-go=shooter]').click();print('worlds',page.locator('[data-world]').count());assert page.locator('[data-world]').count()==4
 page.locator('[data-world="0"]').click();print('shooter',page.locator('#shooter-start').count(),'target',page.locator('#word-target').inner_text()); assert page.locator('#shooter-start').count()==1
 page.locator('#shooter-start').click();page.locator('#shooter-fire').click();page.wait_for_timeout(500)
 page.locator('[data-page=tools]').click(); print('tools',page.locator('[data-go=stroke]').count());assert page.locator('[data-go=stroke]').count()==1
 page.locator('[data-go=dictionary]').click(); print('dict words',page.locator('#dict-results .panel').count());assert page.locator('#dict-results .panel').count()==26
 page.locator('[data-page=play]').click();page.locator('[data-go=math]').click();print('math options',page.locator('[data-answer]').all_text_contents());assert page.locator('[data-answer]').count()==4
 page.locator('[data-page=play]').click();page.locator('[data-go=sentence]').click();print('sentence buttons',page.locator('[data-remaining]').count()); assert page.locator('[data-remaining]').count()==3
 page.screenshot(path='/mnt/data/web_v1_build/web_v1_mobile.png',full_page=True)
 print('runtime errors',errors)
 browser.close()
 assert not errors,errors
