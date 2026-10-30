"""Integration smoke, no external OCR model downloads; real engine on device unverified."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
import re, base64
import tempfile
sample=Path(tempfile.gettempdir())/'smartpen-web-v2-test.png'
root=Path(__file__).resolve().parent.parent
modules={}
def module_url(name):
 if name in modules:return modules[name]
 source=(root/'js'/name).read_text()
 source=re.sub(r"from '(\./[^']+)'",lambda m:"from '"+module_url(m.group(1)[2:])+"'",source)
 url='data:text/javascript;base64,'+base64.b64encode(source.encode()).decode()
 modules[name]=url;return url
html=(root/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="./styles.css"/>','<style>'+(root/'styles.css').read_text()+'</style>')
html=html.replace('src="./js/app.js"','src="'+module_url('app.js')+'"')
Image.new('RGB',(700,580),'white').save(sample)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1024,'height':768})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 mock = '''
 window.__ocrCalls=[];window.__ocrBehavior='zh-good';
 window.Tesseract={createWorker:async(lang,oem,opts)=>{
   const worker={lang,params:{},terminated:false,
    setParameters:async p=>{worker.params=p},
    recognize:async()=>{window.__ocrCalls.push({lang,psm:worker.params.tessedit_pageseg_mode});
     let text=window.__ocrBehavior==='zh-bad'?'3 ng Li':lang==='chi_sim'?'海':lang==='eng'?'Hello world':'Selamat pagi';
     return {data:{text,confidence:window.__ocrBehavior==='zh-bad'?90:80}};
    },terminate:async()=>{worker.terminated=true}};
   return worker;
 }};
 '''
 html=html.replace('<script type="module"', '<script>'+mock+'</script><script type="module"')
 page.set_content(html,wait_until='domcontentloaded')
 page.wait_for_timeout(450)
 print('start',flush=True);page.wait_for_selector('#source-lang',timeout=5000);assert page.locator('#source-lang').input_value()=='zh'
 assert page.get_by_text('原文语言（识别前先选）').count()==1
 print('source ready',flush=True);page.locator('#photo-file').set_input_files(str(sample))
 page.wait_for_function('document.getElementById("photo-preview").naturalWidth === 700',timeout=5000); print("image loaded",flush=True)
 page.locator('#ocr-mode').select_option('single')
 page.locator('#photo-ocr').click();print('ocr clicked', page.locator('#photo-status').inner_text(),flush=True)
 page.wait_for_function('document.getElementById("recognized-text").value.trim()==="海"',timeout=5000);print("ocr text ready",flush=True)
 assert page.locator('#source-lang').input_value()=='zh'
 assert page.evaluate('window.__ocrCalls[0].lang')=='chi_sim'
 assert page.evaluate('window.__ocrCalls[0].psm')=='10'
 # Check rejecting English-looking OCR garbage without guessing source language.
 print('first asserts passed',flush=True);page.evaluate('window.__ocrBehavior="zh-bad"')
 page.locator('#photo-ocr').click()
 print('OCR bad button done',page.locator('#photo-status').inner_text(),flush=True);page.wait_for_function('document.getElementById("photo-status").textContent.includes("尚未识别出可靠汉字")',timeout=5000); print('guard done',flush=True)
 assert page.locator('#source-lang').input_value()=='zh'
 page.locator('#photo-translate').click(); print('translate click',flush=True)
 assert page.locator('#dialog-root').locator('.modal').count()==0, 'Bad OCR should not request translation'
 # Language switch replaces worker and picks English without mixed-language cache.
 print('translate guard done',flush=True);page.evaluate('window.__ocrBehavior="zh-good"');page.locator('#source-lang').select_option('en')
 page.locator('#photo-ocr').click()
 page.wait_for_function('document.getElementById("recognized-text").value.trim()==="Hello world"',timeout=5000);print('English ready',flush=True)
 assert page.locator('#source-lang').input_value()=='en'
 assert page.evaluate('window.__ocrCalls.at(-1).lang')=='eng'
 page.locator('[data-page=play]').click()
 assert page.locator('[data-go=shooter]').count()==1
 page.locator('[data-go=shooter]').click()
 assert page.locator('[data-world]').count()==4
 page.locator('[data-page=tools]').click()
 assert page.locator('[data-go=stroke]').count()==1
 page.screenshot(path='/mnt/data/web_v2_build/ocr_v2_ipad_layout.png',full_page=True)
 print('OCR integration: Chinese -> bad-script guard -> English -> games/tools PASS; page errors:',errors)
 assert not errors,errors
 browser.close()
