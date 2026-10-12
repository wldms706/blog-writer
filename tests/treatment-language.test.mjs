import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(file) {
 const exports = {};
 const source = fs.readFileSync(new URL(`../src/lib/prompts/${file}.ts`, import.meta.url), 'utf8');
 vm.runInNewContext(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {exports});
 return exports;
}
const {filterBannedWords} = load('filters');
test('character comparisons are removed without collapsing lash paragraphs', () => {
 const text = '속눈썹 펌\n\n짱구 같은 느낌이 걱정돼요.\n\n짱구처럼 보일까요?';
 assert.equal(filterBannedWords(text), '속눈썹 펌\n\n부자연스러운 느낌이 걱정돼요.\n\n부자연스럽게 보일까요?');
 assert(!filterBannedWords('짱구눈썹, 짱구 느낌').includes('짱구'));
});
test('appropriate lash terminology stays intact', () => {
 const text = '자연스러운 컬\n\n길이와 모의 방향, 뭉침을 확인해요.';
 assert.equal(filterBannedWords(text), text);
});
test('generation and revision both receive treatment context rules', () => {
 const {TREATMENT_CONTEXT_RULES} = load('common-rules');
 assert.match(TREATMENT_CONTEXT_RULES, /속눈썹/);
 assert.match(TREATMENT_CONTEXT_RULES, /짱구/);
 for (const route of ['generate', 'generate/revise']) {
  const source = fs.readFileSync(new URL(`../src/app/api/${route}/route.ts`, import.meta.url), 'utf8');
  assert(source.includes('${TREATMENT_CONTEXT_RULES}'));
  assert(source.includes('filterBannedWords(filteredText)'));
 }
});
