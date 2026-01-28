'use client';

import { useState, useEffect } from 'react';
import { BUSINESS_CATEGORIES, TOPIC_CATEGORIES, PURPOSES, READER_STATES } from '@/data/constants';
import { FormData } from '@/types';
import { saveHistory } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';

interface StepGenerateProps {
  onReset: () => void;
  formData: FormData;
}

// UX 메시지 (PRD 기준 - 규칙/숫자/기준 설명 없이 결과만)
const UX_MESSAGES = {
  generating: '글의 완성도를 높이는 중이에요.',
  autoFix: '내부 기준에 맞게 조금 더 안정적인 글로 자동 보정 중이에요.',
  charMin: '핵심 기준을 더 명확히 담기 위해 내용을 보강 중이에요.',
  keywordLow: '글의 흐름을 해치지 않게 핵심 연결을 조금 더 강화하고 있어요.',
  repeatOver: '의미는 유지하면서 문장을 더 자연스럽게 다듬고 있어요.',
  forbidden: '검색 품질에 불리할 수 있는 표현을 안전하게 정리 중이에요.',
  complete: '기준을 충족한 글이 완성되었습니다.',
};

// 공백 제외 글자수 계산
const countCharsWithoutSpaces = (text: string) => text.replace(/\s/g, '').length;

// 키워드 하이라이트 함수
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword || !text) return text;

  // 키워드를 정규식으로 이스케이프 처리
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');

  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === keyword.toLowerCase()) {
      return (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </mark>
      );
    }
    return part;
  });
};

export default function StepGenerate({ onReset, formData }: StepGenerateProps) {
  const [phase, setPhase] = useState<'generating' | 'autofix' | 'complete' | 'error'>('generating');
  const [currentMessage, setCurrentMessage] = useState(UX_MESSAGES.generating);
  const [errorMessage, setErrorMessage] = useState('');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const business = BUSINESS_CATEGORIES.find((b) => b.id === formData.businessCategory);
  const topic = TOPIC_CATEGORIES.find((t) => t.id === formData.topic);
  const purpose = PURPOSES.find((p) => p.id === formData.purpose);
  const reader = READER_STATES.find((r) => r.id === formData.readerState);

  // Gemini API를 통한 글 생성
  useEffect(() => {
    let cancelled = false;

    async function generate() {
      try {
        // Phase 1: 생성 중 UX 메시지 순환
        const uxMessages = [
          UX_MESSAGES.generating,
          UX_MESSAGES.charMin,
          UX_MESSAGES.keywordLow,
          UX_MESSAGES.repeatOver,
        ];
        let msgIdx = 0;
        const messageInterval = setInterval(() => {
          msgIdx = (msgIdx + 1) % uxMessages.length;
          if (!cancelled) setCurrentMessage(uxMessages[msgIdx]);
        }, 1500);

        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword: formData.keyword,
            businessCategory: business?.name || formData.businessCategory,
            topic: topic?.name || formData.topic,
            purpose: purpose?.name || formData.purpose,
            readerState: reader?.name || formData.readerState,
            selectedTitle: formData.selectedTitle,
          }),
        });

        clearInterval(messageInterval);

        if (cancelled) return;

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'API 요청 실패');
        }

        if (!data.content) {
          throw new Error('생성된 텍스트가 없습니다');
        }

        // Phase 2: 자동 보정 메시지
        setPhase('autofix');
        setCurrentMessage(UX_MESSAGES.autoFix);

        await new Promise((r) => setTimeout(r, 1000));
        if (cancelled) return;

        setCurrentMessage(UX_MESSAGES.forbidden);
        await new Promise((r) => setTimeout(r, 800));
        if (cancelled) return;

        // 완료
        setContent(data.content);
        setPhase('complete');
        setCurrentMessage(UX_MESSAGES.complete);

        // 히스토리에 자동 저장
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          saveHistory({
            keyword: formData.keyword || '',
            businessCategory: formData.businessCategory || '',
            topic: formData.topic || '',
            purpose: formData.purpose || '',
            content: data.content,
          }, user.id);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Generate error:', err);
        setErrorMessage(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        setPhase('error');
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.keyword, formData.businessCategory, formData.topic, formData.purpose, formData.readerState, retryCount]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = () => {
    setPhase('generating');
    setCurrentMessage(UX_MESSAGES.generating);
    setErrorMessage('');
    setContent('');
    setRetryCount((c) => c + 1);
  };

  // 에러 화면
  if (phase === 'error') {
    return (
      <div className="animate-fade-in">
        <div className="max-w-xl mx-auto">
          <div className="card p-10 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium text-text-primary mb-2">글 생성에 실패했습니다</p>
            <p className="text-sm text-text-secondary mb-6">{errorMessage}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={onReset} className="btn-secondary">처음으로</button>
              <button onClick={handleRetry} className="btn-primary">다시 시도</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 생성 중 또는 자동 보정 중 화면
  if (phase === 'generating' || phase === 'autofix') {
    return (
      <div className="animate-fade-in">
        <div className="max-w-xl mx-auto">
          <div className="card p-10 text-center">
            {/* 로딩 애니메이션 */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse-soft">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 메시지 - 규칙/숫자 없이 친절한 문구만 */}
            <p className="text-lg text-text-primary font-medium mb-2 animate-fade-in" key={currentMessage}>
              {currentMessage}
            </p>

            {/* 스켈레톤 */}
            <div className="mt-8 space-y-3">
              <div className="skeleton h-4 w-4/5 mx-auto" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 완료 화면
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          완료
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          {UX_MESSAGES.complete}
        </h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* 설정 요약 - 간결하게 */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {business?.icon} {business?.name}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-accent/10 text-accent-dark text-sm font-medium">
              {formData.keyword}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-background-subtle text-text-secondary text-sm">
              {topic?.name}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-background-subtle text-text-secondary text-sm">
              {purpose?.name}
            </span>
          </div>
        </div>

        {/* 생성된 글 */}
        <div className="card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-text-primary">생성된 글</h3>
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                {countCharsWithoutSpaces(content).toLocaleString()}자
              </span>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                copied
                  ? 'bg-success text-white'
                  : 'bg-background-subtle text-text-secondary hover:bg-secondary-light'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  복사됨
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  복사하기
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-xl bg-background-subtle border border-border-light">
            <div className="whitespace-pre-wrap text-text-primary leading-relaxed text-[15px]">
              {highlightKeyword(content, formData.keyword)}
            </div>
          </div>

          {/* 키워드 하이라이트 안내 */}
          <p className="text-xs text-slate-400 text-center">
            <mark className="bg-yellow-200 text-yellow-900 px-1 rounded text-[10px]">노란색</mark> 표시는 핵심 키워드입니다
          </p>
        </div>

        {/* 안전 뱃지 - 간결하게 */}
        <div className="card p-4 bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-success text-sm">안전한 글</h4>
              <p className="text-text-secondary text-xs">
                내부 기준을 충족한 블로그 글입니다
              </p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={onReset}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            처음부터 다시 쓰기
          </button>
          <button
            onClick={handleCopy}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            글 복사하기
          </button>
        </div>
      </div>
    </div>
  );
}
