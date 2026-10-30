/** Smart Reading Pen Web V2 — on-device language-specific OCR.
 * No photographs/crops leave the browser. Only the Tesseract JS/WASM/model assets
 * are downloaded from the library CDN on first use.
 */
export const OCR_LANG={zh:'chi_sim',en:'eng',ms:'msa'};
export function ocrLanguage(language){return OCR_LANG[language]||'chi_sim'}
export function guessLayout(selection,w,h,mode='auto'){
 if(['single','line','page'].includes(mode))return mode;
 if(!selection)return 'page';
 const width=selection.w*w,height=selection.h*h;
 if(width<5||height<5)return 'page';
 const ratio=width/height;
 if(ratio>=.55&&ratio<=1.7)return 'single';
 if(ratio>1.7||ratio<.32)return 'line';
 return 'page';
}
export function pageSegMode(layout){return {single:'10',line:'7',page:'6'}[layout]||'6'}
export function scoreOCR(text,confidence,lang){
 const s=String(text||'').trim();if(!s)return -9999;
 const hanzi=[...s.matchAll(/[\u3400-\u9fff]/gu)].length;
 const latin=[...s.matchAll(/[A-Za-z]/g)].length;
 const meaningful=[...s.matchAll(/[\p{L}\p{N}]/gu)].length;
 const conf=Math.max(0,Math.min(100,Number(confidence)||0));
 if(lang==='zh')return hanzi*85+conf*.12-latin*13-(meaningful===0?120:0);
 return latin*7+conf*.12-hanzi*20;
}
export function isLikelyWrongScript(text,lang){return lang==='zh'&&!/[\u3400-\u9fff]/u.test(String(text||''));}
export function makeOcrCanvas(im,selection,{enhance=false,layout='page'}={}){
 if(!im?.naturalWidth||!im?.naturalHeight)throw Error('Image is not ready');
 const w=im.naturalWidth,h=im.naturalHeight;
 const raw=selection?{
  x:Math.floor(Math.max(0,Math.min(.9999,selection.x))*w),y:Math.floor(Math.max(0,Math.min(.9999,selection.y))*h),
  cw:Math.ceil(Math.max(.001,Math.min(1,selection.w))*w),ch:Math.ceil(Math.max(.001,Math.min(1,selection.h))*h)
 }:{x:0,y:0,cw:w,ch:h};
 const {x,y}=raw,cw=Math.max(1,Math.min(raw.cw,w-x)),ch=Math.max(1,Math.min(raw.ch,h-y));
 // Enlarge tightly cropped Chinese characters instead of running OCR on a
 // 70-pixel character. Cap canvas pixels to stay safe on iPad Safari.
 const targetMin=layout==='single'?440:layout==='line'?700:0;
 const maxDim=layout==='page'?1850:1450;
 let scale=Math.max(1,targetMin/Math.max(cw,ch));
 scale=Math.min(scale,maxDim/Math.max(cw,ch),Math.sqrt(3200000/(cw*ch)));
 // iPad images can exceed canvas size even when full-resolution photos are fine.
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(cw*scale));canvas.height=Math.max(1,Math.round(ch*scale));
 const ctx=canvas.getContext('2d',{willReadFrequently:enhance});if(!ctx)throw Error('Canvas unavailable');
 ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(im,x,y,cw,ch,0,0,canvas.width,canvas.height);
 if(enhance){
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),p=pixels.data;
  // High contrast is a fallback only: retain grey anti-aliased stroke edges.
  for(let i=0;i<p.length;i+=4){const gray=.299*p[i]+.587*p[i+1]+.114*p[i+2];const v=Math.max(0,Math.min(255,(gray-125)*1.75+125));p[i]=p[i+1]=p[i+2]=v;}
  ctx.putImageData(pixels,0,0);
 }
 return canvas;
}
let enginePromise=null;
export async function loadTesseract(){
 if(window.Tesseract?.createWorker)return window.Tesseract;
 if(!enginePromise){enginePromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';script.async=true;
  script.onload=()=>window.Tesseract?.createWorker?resolve(window.Tesseract):reject(Error('OCR library not available'));
  script.onerror=()=>reject(Error('OCR library download blocked. Check internet / content blockers.'));
  document.head.append(script);
 }).catch(err=>{enginePromise=null;throw err})}
 return enginePromise;
}
let worker=null,workerLang='';
export async function ocrWorkerFor(lang,onProgress=()=>{}){
 const tesseract=await loadTesseract();const model=ocrLanguage(lang);
 if(worker&&workerLang===model)return worker;
 // One language model at a time, avoiding V1's eng+chi_sim+msa worker on iPads.
 if(worker){try{await worker.terminate()}catch{}worker=null;workerLang='';}
 const create=async langCode=>tesseract.createWorker(langCode,1,{logger:m=>{
  if(m?.status)onProgress(m.status,m.progress);
 }});
 try{worker=await create(model);workerLang=model}
 catch(err){if(lang!=='ms')throw err;
  onProgress('Malay model unavailable; trying Latin text model',0);
  worker=await create('eng');workerLang=model;
 }
 return worker;
}
export async function recognizeLocal(im,selection,{lang='zh',mode='auto',onProgress=()=>{}}={}){
 const layout=guessLayout(selection,im.naturalWidth,im.naturalHeight,mode);
 const w=await ocrWorkerFor(lang,onProgress);
 const opts={tessedit_pageseg_mode:pageSegMode(layout),preserve_interword_spaces:'1'};
 const candidates=[];
 const pass=async (enhance,psm)=>{
  const canvas=makeOcrCanvas(im,selection,{enhance,layout});
  await w.setParameters({...opts,tessedit_pageseg_mode:psm});
  try{
   const result=await w.recognize(canvas);
   const text=String(result?.data?.text||'').trim(),confidence=Number(result?.data?.confidence)||0;
   const candidate={text,confidence,score:scoreOCR(text,confidence,lang),layout};
   candidates.push(candidate);return candidate;
  }finally{canvas.width=0;canvas.height=0}
 };
 onProgress('Recognizing '+lang.toUpperCase()+' · '+layout,0);
 let first=await pass(false,pageSegMode(layout));
 // Chinese single characters are easy to mistake for Latin characters.
 // Try another layout, then contrast if necessary, but never hallucinate a Hanzi.
 if(lang==='zh'&&(isLikelyWrongScript(first.text,lang)||first.confidence<45)){
  onProgress('Retrying Chinese character recognition',.5);
  await pass(false,layout==='single'?'6':'7');
  if(candidates.every(x=>isLikelyWrongScript(x.text,lang))){
   onProgress('Improving contrast',.7);
   await pass(true,pageSegMode(layout));
  }
 }
 candidates.sort((a,b)=>b.score-a.score);
 return {...(candidates[0]||first),model:ocrLanguage(lang),attempts:candidates.length};
}
