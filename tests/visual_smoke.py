from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re
root=Path(__file__).resolve().parent.parent
modules={}
def url(name):
 if name in modules:return modules[name]
 source=(root/'js'/name).read_text();source=re.sub(r"from '(\./[^']+)'",lambda m:"from '"+url(m.group(1)[2:])+"'",source)
 result='data:text/javascript;base64,'+base64.b64encode(source.encode()).decode();modules[name]=result;return result
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="./styles.css"/>','<style>'+(root/'styles.css').read_text()+'</style>').replace('src="./js/app.js"','src="'+url('app.js')+'"')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':390,'height':844});page.set_content(html);page.wait_for_timeout(700)
 page.screenshot(path='/mnt/data/web_v1_build/web_v1_home.png',full_page=True)
 page.locator('[data-page=play]').click();page.locator('[data-go=shooter]').click();page.locator('[data-world="0"]').click();page.screenshot(path='/mnt/data/web_v1_build/web_v1_shooter.png',full_page=True)
 page.locator('#shooter-start').click();page.wait_for_timeout(600);page.screenshot(path='/mnt/data/web_v1_build/web_v1_shooter_running.png',full_page=True)
 b.close()
