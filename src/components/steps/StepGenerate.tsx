'use client';

import { useState, useEffect } from 'react';
import { BUSINESS_CATEGORIES, TOPIC_CATEGORIES, PURPOSES, READER_STATES } from '@/data/constants';
import { FormData } from '@/types';

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

// 키워드를 포함한 샘플 콘텐츠 생성
const generateSampleContent = (keyword: string) => `## ${keyword}, 어떤 기준으로 선택해야 할까요?

"${keyword.replace(/[가-힣]+(?=눈썹|반영구|피부|두피|네일|헤어)/, '')} 어디서 하면 좋을까요?"

많은 분들이 이 질문을 합니다.
인스타그램을 뒤지고, 블로그를 읽고, 지인에게 물어봅니다.
그런데 정작 **무엇을 기준으로 선택해야 하는지**는 잘 모르는 경우가 많습니다.

검색을 하면 수많은 정보가 쏟아지지만, 그 정보들이 정말 나에게 맞는 판단 기준이 되는지는 별개의 문제입니다. ${keyword}에 대해 알아보고 계신다면, 단순히 "어디가 잘하나요?"보다는 "어떤 기준으로 골라야 하는지"부터 정리해보는 것이 훨씬 도움이 됩니다.

---

### 흔한 선택 기준의 한계

"후기가 좋은 곳"
"사진이 예쁜 곳"
"가격이 합리적인 곳"

이런 기준으로 선택하시는 분들이 많습니다.
물론 참고할 수 있는 정보입니다.

하지만 후기는 개인의 경험이고,
사진은 조명과 각도에 따라 달라지며,
가격만으로는 퀄리티를 판단하기 어렵습니다.

실제로 같은 곳을 다녀와도 만족도가 다른 경우가 많습니다. 이는 개인마다 기대치와 상태가 다르기 때문입니다. 그렇기에 남의 후기보다 나만의 판단 기준을 세우는 것이 더 중요합니다.

---

### 진짜 확인해야 할 3가지 기준

**1. 상담 과정이 충분한가**

좋은 곳은 시술 전 충분한 시간을 들여 상담합니다.
- 현재 상태 분석
- 원하는 결과 파악
- 관리 방법 안내

"빨리 예약하세요"보다 "어떤 스타일을 원하세요?"라고 먼저 묻는 곳을 찾아보세요.

${keyword}을(를) 선택할 때 가장 중요한 것은 상담의 질입니다. 충분한 상담은 결과의 만족도를 높여줄 뿐만 아니라, 시술 후 불필요한 걱정을 줄여주는 역할도 합니다. 내 상태를 정확히 파악하고, 그에 맞는 방향을 제안하는 곳인지 확인해보세요.

**2. 다양한 케이스를 보여줄 수 있는가**

포트폴리오에서 다양한 스타일을 확인해보세요.
모든 결과물이 비슷하다면, 나에게 맞는 맞춤 결과를 기대하기 어려울 수 있습니다.

${keyword} 포트폴리오를 볼 때는 다양성을 확인하세요. 같은 시술이라도 사람마다 얼굴형, 피부톤, 기존 상태가 다르기 때문에 결과물도 달라야 자연스럽습니다. 한 가지 스타일만 반복되는 곳보다, 여러 케이스에 맞춰 다르게 접근하는 곳이 신뢰할 수 있습니다.

**3. 이후 관리에 대해 설명해주는가**

${keyword}은(는) 한 번으로 끝나지 않습니다.
- 관리 주기
- 자연스러운 변화 과정
- 수정이 필요할 때의 대응 방식

이런 부분까지 미리 안내해주는 곳이 신뢰할 수 있습니다. 사후 관리에 대한 설명이 구체적일수록 전문성을 갖춘 곳이라 판단할 수 있습니다. 시술 전에 관리 방법과 주의사항을 꼼꼼히 안내받으셨다면, 그만큼 체계적으로 운영되는 곳일 가능성이 높습니다.

---

### 모든 분께 필요한 것은 아닙니다

현재 상태에 불편함이 없다면,
꼭 해야 할 이유는 없습니다.

다만, 더 나은 결과를 원하거나
관리가 어려운 분들에게는
좋은 선택지가 될 수 있습니다.

중요한 것은 외부의 권유가 아니라, 본인이 느끼는 필요에 따라 결정하는 것입니다. 유행이라서, 혹은 주변에서 추천해서가 아니라 내가 정말 원하는지를 먼저 생각해보시길 바랍니다.

---

### 시간이 지나면 달라질 수 있습니다

상황에 따라 결과는 달라질 수 있습니다.
그래서 첫 선택보다 **꾸준한 관리**가 더 중요할 수 있습니다.

처음 결과가 좋더라도, 시간이 지나면 자연스럽게 변화가 생깁니다. 이는 정상적인 과정이며, 그래서 정기적인 관리와 점검이 필요합니다. 처음부터 관리 계획을 함께 안내받을 수 있는 곳을 선택한다면 더 오래 만족스러운 결과를 유지할 수 있습니다.

---

선택이 중요합니다.
충분히 알아보고 계신가요?
어떤 기준으로 선택하실 건가요?`;

export default function StepGenerate({ onReset, formData }: StepGenerateProps) {
  const [phase, setPhase] = useState<'generating' | 'autofix' | 'complete'>('generating');
  const [currentMessage, setCurrentMessage] = useState(UX_MESSAGES.generating);
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  const business = BUSINESS_CATEGORIES.find((b) => b.id === formData.businessCategory);
  const topic = TOPIC_CATEGORIES.find((t) => t.id === formData.topic);
  const purpose = PURPOSES.find((p) => p.id === formData.purpose);
  const reader = READER_STATES.find((r) => r.id === formData.readerState);

  // 생성 및 검증 시뮬레이션
  useEffect(() => {
    const generatedContent = generateSampleContent(formData.keyword || '눈썹문신');

    // Phase 1: 생성 (2초)
    const generateTimer = setTimeout(() => {
      setPhase('autofix');
      setCurrentMessage(UX_MESSAGES.autoFix);

      // Phase 2: 자동 보정 메시지들 순환
      const messages = [
        UX_MESSAGES.charMin,
        UX_MESSAGES.keywordLow,
        UX_MESSAGES.repeatOver,
      ];

      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        if (messageIndex < messages.length) {
          setCurrentMessage(messages[messageIndex]);
          messageIndex++;
        } else {
          clearInterval(messageInterval);
          setContent(generatedContent);
          setPhase('complete');
          setCurrentMessage(UX_MESSAGES.complete);
        }
      }, 800);

      return () => clearInterval(messageInterval);
    }, 2000);

    return () => clearTimeout(generateTimer);
  }, [formData.keyword]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                {content.length.toLocaleString()}자
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
              {content}
            </div>
          </div>
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
