import assert from 'node:assert/strict';
import {WORLDS,WORDS,requiredFor,recognizeKnown,findKnown} from '../js/data.js';
assert.equal(WORLDS.length,4);assert.equal(WORDS.length,26);
for(const world of WORLDS){assert.equal(world.words.length,9);for(const lang of ['zh','en','ms']){assert.ok(world[lang]);for(const item of world.words){const r=requiredFor(item[lang],3);assert.equal(Object.values(r).reduce((a,b)=>a+b,0),[...item[lang].replace(/\s+/g,'')].length*3)}}}
assert.deepEqual(requiredFor('APPLE',3),{A:3,P:6,L:3,E:3});
assert.deepEqual(requiredFor('BANANA',2),{B:2,A:6,N:4});
assert.deepEqual(requiredFor('苹果',3),{'苹':3,'果':3});
assert.equal(findKnown('APPLE')?.zh,'苹果');
assert.equal(recognizeKnown('我有苹果、香蕉和书。').length,3);
console.log('PASS: 4 worlds, 36 levels, 26 curated words, EN/ZH/MS counting and dictionary');
