import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
const exports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/lib/subscription-pricing.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,process:{env:{}},require:()=>({createAdminClient:()=>({from:()=>({select:()=>({in:async()=>({count:null,error:{message:'failed'}})})})})})});
const {resolveCheckoutPricing,getCheckoutPricing}=exports;
const overrides=JSON.stringify({returning:{pro_permanent:12900}});
test('approved returning customer receives old price only on the approved plan',()=>{
 const r=resolveCheckoutPricing(114,'returning',overrides);
 assert.equal(r.prices.pro_permanent,12900);assert.equal(r.prices.pro_general,15900);assert(r.hasPersonalPrice);
});
test('other users and anonymous visitors keep regular pricing after the promotion',()=>{
 for(const user of [undefined,'another']){const r=resolveCheckoutPricing(114,user,overrides);assert.equal(r.prices.pro_permanent,19900);assert.equal(r.prices.pro_general,15900);assert.equal(r.prices.caption_only,2900);assert(!r.hasPersonalPrice);}
});
test('promotion threshold and invalid account overrides do not create arbitrary charges',()=>{
 assert.equal(resolveCheckoutPricing(99).prices.pro_permanent,12900);assert.equal(resolveCheckoutPricing(100).prices.pro_permanent,19900);
 for(const price of [0,-1,19901,12900.5,'12900'])assert.equal(resolveCheckoutPricing(114,'returning',JSON.stringify({returning:{pro_permanent:price}})).prices.pro_permanent,19900);
 assert.throws(()=>resolveCheckoutPricing(114,'returning','invalid json'));
});
test('pricing lookup failure stops checkout instead of assuming a promotional price',async()=>{
 await assert.rejects(getCheckoutPricing('returning'),/구독 가격/);
});
