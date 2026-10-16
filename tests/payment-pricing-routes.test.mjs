import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
function harness(route,price=12900,pricingError=false){
 const requests=[],saved=[];const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:null}),update:()=>q,upsert:async data=>(saved.push(data),{error:null})};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(`../src/app/api/payments/${route}/route.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,Buffer,Date,process:{env:{TOSS_SECRET_KEY:'mock'}},console:{error(){},log(){}},require:n=>{
 if(n==='next/server')return{NextResponse:{json:(data,opts)=>({data,status:opts?.status||200})}};
 if(n.includes('supabase/server'))return{createClient:async()=>({auth:{getUser:async()=>({data:{user:{id:'returning',email:'fixture@example.invalid'}}})},from:()=>q})};
 if(n.includes('subscription-pricing'))return{getCheckoutPricing:async()=>{if(pricingError)throw Error('lookup failed');return{prices:{pro_permanent:price}};}};
 if(n==='nanoid')return{nanoid:()=> 'mock-order'};throw Error(n);},fetch:async(url,opts)=>{requests.push({url,body:JSON.parse(opts.body)});return{ok:true,json:async()=>url.endsWith('/issue')?{billingKey:'mock-billing'}:{paymentKey:'mock-payment',card:{}}};}});
 return{run:body=>exports.POST({json:async()=>body}),requests,saved};
}
test('new card checkout charges and stores the authenticated customer price',async()=>{
 for(const price of [12900,19900]){const h=harness('billing-issue',price);const r=await h.run({authKey:'mock-auth',customerKey:'customer_returning',planId:'pro_permanent'});assert.equal(r.status,200);assert.equal(h.requests[1].body.amount,price);assert.equal(h.saved[0].price,price);assert.equal(h.saved[0].cancelled_at,null);assert.equal(h.saved[0].discount_percent,0);}
});
test('confirmation rejects a mismatched amount before contacting the payment provider',async()=>{
 const h=harness('confirm',12900);const r=await h.run({paymentKey:'mock-payment',orderId:'mock-order',amount:19900,planId:'pro_permanent'});assert.equal(r.status,400);assert.equal(h.requests.length,0);
});
test('price lookup failure prevents both card registration and payment approval',async()=>{
 for(const route of ['billing-issue','confirm']){const h=harness(route,12900,true);const r=await h.run({authKey:'mock-auth',customerKey:'customer_returning',paymentKey:'mock-payment',orderId:'mock-order',amount:12900,planId:'pro_permanent'});assert.equal(r.status,500);assert.equal(h.requests.length,0);}
});
