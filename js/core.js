import {LABELS} from './data.js';
export const STORE_KEY='smartreadingpen.web.v1';
const defaults={language:'zh',readingSpeed:.85,sourceLanguage:'zh',targetLanguage:'en',stickerIds:[],shooter:{},math:{op:0,level:1,star:1,question:0},quizWins:0,sentenceWins:0,dictDownloads:false};
function load(){try{const stored=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');return {...defaults,...stored,shooter:stored.shooter||{},math:{...defaults.math,...(stored.math||{})}};}catch{return structuredClone(defaults)}}
export const state=load();
export function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch{toast('Local storage unavailable; progress will not persist.')}}
export const $=(id)=>document.getElementById(id);
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function t(key){return LABELS[state.language]?.[key]||LABELS.zh[key]||key}
let toastTimeout;
export function toast(message){const node=$('toast');if(!node)return;node.textContent=message;node.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>node.classList.remove('show'),2900)}
export function modal(title,body,{ok=t('check'),cancel=t('cancel'),onOK=null}={}){return new Promise(resolve=>{const root=$('dialog-root');root.innerHTML=`<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true"><h3>${esc(title)}</h3><div class="modal-body">${body}</div><div class="controls"><button id="modal-cancel" class="ghost">${esc(cancel)}</button><button id="modal-ok" class="primary">${esc(ok)}</button></div></div></div>`;const finish=(answer)=>{root.innerHTML='';resolve(answer);if(answer&&onOK)onOK()};$('modal-ok').onclick=()=>finish(true);$('modal-cancel').onclick=()=>finish(false);root.querySelector('.modal-bg').addEventListener('click',e=>{if(e.target.classList.contains('modal-bg'))finish(false)})})}
export function playEffect(type){const name={good:'answer_correct',bad:'answer_try_again',shoot:'shooter_laser'}[type];if(!name)return;const a=new Audio(`./assets/audio/${name}.wav`);a.volume=type==='shoot'?.5:.65;a.play().catch(()=>{});return a}
export const locale={zh:'zh-CN',en:'en-US',ms:'ms-MY'};
let speechToken=0;
export function stopSpeech(){speechToken++;try{window.speechSynthesis?.cancel()}catch{}}
export function speak(text,lang=state.language,{onSegment=null,onDone=null,characters=false}={}){
 stopSpeech();const thisToken=speechToken; if(!('speechSynthesis' in window)){toast('This browser does not support speech synthesis.');onDone?.();return;}
 // Each segment is a separate utterance so Chinese character / English letter highlighter aligns reliably.
 const filtered=String(text??'').replace(/[\u00AD]/g,'').trim();
 const segments=characters?[...filtered].map((c,index)=>({c,index})).filter(x=>x.c.trim()) : filtered.split(/([，,、；;。.!?！？\n]+)/).filter(Boolean).map(s=>s.trim()).filter(Boolean);
 if(!segments.length){onDone?.();return;}
 let i=0;
 function next(){if(thisToken!==speechToken)return;if(i>=segments.length){onSegment?.(-1);onDone?.();return}const item=segments[i],s=characters?item.c:item,idx=characters?item.index:i;i++;
  if(/^[，,、；;。.!?！？\n：:]+$/.test(s)){onSegment?.(-1);setTimeout(next,/[。.!?！？]/.test(s)?420:220);return}
  onSegment?.(characters?idx:s,idx);
  const u=new SpeechSynthesisUtterance(s);u.lang=locale[lang]||locale.zh;u.rate=Math.max(.5,Math.min(1.4,Number(state.readingSpeed)||.85));u.volume=1;
  const voices=window.speechSynthesis.getVoices?.()||[];const prefix=u.lang.split('-')[0];const match=voices.find(v=>v.lang?.toLowerCase()===u.lang.toLowerCase()&&v.localService)||voices.find(v=>v.lang?.toLowerCase().startsWith(prefix)&&v.localService)||voices.find(v=>v.lang?.toLowerCase().startsWith(prefix));if(match)u.voice=match;
  let finished=false;const done=()=>{if(finished)return;finished=true;if(thisToken===speechToken)setTimeout(next,characters?80:0)};
  u.onend=done;u.onerror=done;
  window.speechSynthesis.speak(u);
  // Some browsers do not dispatch onend for unsupported locale. Avoid stalling the UI.
  setTimeout(()=>{if(thisToken===speechToken&&!finished&& !window.speechSynthesis.speaking)done()},Math.max(2500,s.length*340));
 }
 next();
}
export function highlightMarkup(text,active=-1){return [...String(text)].map((c,i)=>`<span class="letter ${i===active?'active':''}" data-pos="${i}">${esc(c)}</span>`).join('')}
export function voiceStatus(lang){if(!('speechSynthesis' in window))return 'Unavailable';let voices=window.speechSynthesis.getVoices?.()||[];const langCode=locale[lang].slice(0,2);const filtered=voices.filter(v=>v.lang?.toLowerCase().startsWith(langCode));if(!voices.length)return 'Voice list loading / follow device';return filtered.length?`${filtered.filter(v=>v.localService).length} offline · ${filtered.length} total`:'No matching browser voice (may use system fallback)';}
export function award(id){if(!state.stickerIds.includes(id)){state.stickerIds.push(id);save();}}
export function langName(l){return {zh:'中文',en:'English',ms:'Bahasa Melayu'}[l]||l}
