import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const prompts = {
  TREATMENT_CONTEXT_RULES: "시술별 표현 규칙",
  REGULATED_KEYWORDS: [], BRANDING_TYPE_NAMES: {}, TONE_PROMPT_OVERRIDES: {},
  BRANDING_GENERAL_PROMPT: '', BRANDING_REGULATED_PROMPT: '',
  filterMedicalTerms: t=>t, filterForeignWords:t=>t, filterListBullets:t=>t,
  filterBannedWords:t=>t, filterFirstPerson:t=>t,
};
function harness(route,{response={ok:true,json:async()=>({content:[{text:'제목\n\n완성된 본문.'}]})},networkError=false,saveError=false}={}) {
 const usageCalls=[],queries=[];
 const supabase={auth:{getUser:async()=>({data:{user:{id:'owner'}}})},from(table){const ops=[['from',table]];queries.push(ops);const q={};for(const m of ['select','eq','update'])q[m]=(...a)=>(ops.push([m,...a]),q);q.single=async()=>({data:null});q.maybeSingle=async()=>saveError?{data:null,error:{message:'injected'}}:{data:{id:'history'},error:null};return q;}};
 const exports={};
 const code=ts.transpileModule(fs.readFileSync(new URL(`../src/app/api/${route}/route.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,{exports,process:{env:{ANTHROPIC_API_KEY:'test'}},console:{log(){},error(){}},Date,
 fetch:async()=>{if(networkError)throw Error('network');return response;},
 require(name){if(name==='next/server')return{NextResponse:{json:(data,opts)=>({data,status:opts?.status||200})}};if(name.includes('supabase/server'))return{createClient:async()=>supabase};if(name==='@/lib/usage')return{checkAndIncrementUsage:async(_,consume)=>{usageCalls.push(consume);return{allowed:true,remaining:2,plan:'free'};}};if(name==='@/lib/prompts')return prompts;throw Error(name);},});
 return{run:body=>exports.POST({json:async()=>body}),usageCalls,queries};
}
const input={contentType:'branding',brandingType:'philosophy',businessCategory:'네일',keyword:'네일'};

test('upstream failures do not consume free quota', async()=>{
 for(const options of [{networkError:true},{response:{ok:false,status:500,json:async()=>({})}},{response:{ok:true,json:async()=>({content:[]})}},{response:{ok:true,json:async()=>({stop_reason:'max_tokens',content:[{text:'잘린 본문'}]})}}]){
  const h=harness('generate',options);const r=await h.run(input);
  assert(r.status>=500);assert.deepEqual(h.usageCalls,[false]);
 }
});
test('completed article consumes exactly once after successful generation',async()=>{
 const h=harness('generate');const r=await h.run(input);assert.equal(r.status,200);assert.deepEqual(h.usageCalls,[false,true]);assert.equal(r.data.content,'제목\n\n완성된 본문.');
});
test('revision saves new content only to the current owner history',async()=>{
 const h=harness('generate/revise');const r=await h.run({originalContent:'원본',instruction:'문단 나눠줘',historyId:'history'});
 assert.equal(r.data.historySaved,true);
 const query=h.queries.find(q=>q.some(o=>o[0]==='from'&&o[1]==='histories'));
 assert(query.some(o=>o[0]==='eq'&&o[1]==='user_id'&&o[2]==='owner'));
 assert(query.some(o=>o[0]==='eq'&&o[1]==='id'&&o[2]==='history'));
 assert(query.some(o=>o[0]==='update'&&o[1].content===r.data.content));
});
test('revision persistence failure is reported without losing the revised text',async()=>{
 const h=harness('generate/revise',{saveError:true});const r=await h.run({originalContent:'원본',instruction:'수정',historyId:'history'});
 assert.equal(r.data.historySaved,false);assert.equal(r.data.content,'제목\n\n완성된 본문.');
});
