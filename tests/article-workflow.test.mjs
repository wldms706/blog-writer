import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(path, dependencies={}) {
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,URL,require:name=>{if(dependencies[name])return dependencies[name];throw Error(name);}});
 return exports;
}
const constants=load('../src/data/constants.ts');
const {getNextTopics,getPublishableText,isNaverPostUrl}=load('../src/lib/article-workflow.ts',{'@/data/constants':constants});
test('publish copy removes inline and multiline editor guides but preserves paragraphs and user text',()=>{
 const input='속눈썹 펌\n\n컬과 모의 방향을 확인해요.\n\n[편집가이드: 사진을\n넣어주세요]\n\n실제 관리법 [주의사항]을 확인해요.';
 assert.equal(getPublishableText(input),'속눈썹 펌\n\n컬과 모의 방향을 확인해요.\n\n실제 관리법 [주의사항]을 확인해요.');
 assert.equal(getPublishableText(input),getPublishableText(getPublishableText(input)));
});
test('next topics use the same business and exclude the current topic',()=>{
 for(const business of ['eyelash','skin','semi-permanent']){
  const available=constants.getTopicsForBusiness(business);
  const current=available[0].id;
  const next=getNextTopics(business,current);
  assert(next.length>0&&next.length<=3);
  assert(!next.some(t=>t.id===current));
  assert(next.every(t=>available.some(a=>a.id===t.id)));
 }
});

test('rank tracking accepts post URLs and rejects homepages and lookalike domains',()=>{
 for(const value of ['https://blog.naver.com/example/12345','https://m.blog.naver.com/example/12345','https://blog.naver.com/PostView.naver?blogId=example&logNo=12345']) assert(isNaverPostUrl(value));
 for(const value of ['https://blog.naver.com/example','https://blog.naver.com.evil.test/example/12345','https://example.com/example/12345','javascript:alert(1)','https://blog.naver.com/PostView.naver?blogId=example']) assert(!isNaverPostUrl(value));
});

test('link saving only reports success when a history row was updated',async()=>{
 for(const found of [false,true]){
  const operations=[];
  const q={update:values=>(operations.push(values),q),eq:()=>q,select:()=>q,maybeSingle:async()=>({data:found?{id:'history'}:null,error:null})};
  const {updateBlogUrl}=load('../src/lib/storage.ts',{'@/lib/supabase/client':{createClient:()=>({from:()=>q})}});
  assert.equal(await updateBlogUrl('history','https://blog.naver.com/example/12345'),found);
  assert.equal(operations[0].naver_rank,null);
  assert.equal(operations[0].rank_checked_at,null);
 }
});
