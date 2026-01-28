'use client';

import { useState } from 'react';

interface StepKeywordProps {
  value: string;
  onChange: (value: string) => void;
}

const KEYWORD_EXAMPLES = [
  { region: '천안', keywords: ['천안눈썹문신', '천안자연눈썹', '천안눈썹관리'] },
  { region: '두정동', keywords: ['두정동눈썹문신', '두정동반영구', '두정동눈썹샵'] },
  { region: '서울', keywords: ['강남눈썹문신', '홍대반영구', '신촌눈썹디자인'] },
];

export default function StepKeyword({ value, onChange }: StepKeywordProps) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          검색 키워드를 입력해주세요
        </h2>
        <p className="text-text-secondary">
          블로그 글의 핵심 키워드를 정해주세요
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Keyword Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            핵심 키워드
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="예: 천안눈썹문신, 강남피부관리"
            className="input-elegant text-lg"
          />
          <p className="text-xs text-text-muted">
            제목과 본문에 자연스럽게 포함될 키워드입니다
          </p>
        </div>

        {/* Keyword Tips */}
        <div className="card p-5">
          <button
            onClick={() => setShowTip(!showTip)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                💡
              </span>
              <span className="font-medium text-text-primary">키워드 설정 팁</span>
            </div>
            <svg
              className={`w-5 h-5 text-text-muted transition-transform ${showTip ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTip && (
            <div className="mt-4 pt-4 border-t border-border-light animate-fade-in">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-text-primary mb-2">초기에는 작은 지역부터</h4>
                  <p className="text-text-secondary">
                    블로그 지수가 낮을 때는 광역 지역(서울, 천안)보다 동네 단위(두정동, 불당동)부터 시작하세요.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-text-primary mb-2">키워드 교차 사용</h4>
                  <p className="text-text-secondary">
                    동일 키워드를 연속 사용하지 마세요. 지역명이나 속성을 바꿔가며 사용합니다.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-text-primary mb-2">예시</h4>
                  <div className="space-y-2">
                    {KEYWORD_EXAMPLES.map((example) => (
                      <div key={example.region} className="flex flex-wrap gap-2">
                        <span className="text-text-muted">{example.region}:</span>
                        {example.keywords.map((kw) => (
                          <button
                            key={kw}
                            onClick={() => onChange(kw)}
                            className="px-2 py-1 rounded-lg bg-background-subtle text-text-secondary hover:bg-secondary-light hover:text-primary transition-colors text-xs"
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rules Preview */}
        <div className="p-4 rounded-xl bg-background-subtle border border-border-light">
          <div className="flex items-start gap-3">
            <span className="text-lg">📌</span>
            <div className="text-sm">
              <p className="text-text-primary font-medium mb-1">제목 작성 규칙</p>
              <ul className="text-text-secondary space-y-1">
                <li>• 제목에 핵심 키워드를 포함합니다</li>
                <li>• 본문 내 최소 3회 언급 (시작/중간/마무리)</li>
                <li>• 특정 단어는 10회 이하로 제한합니다</li>
              </ul>
            </div>
          </div>
        </div>

        {value && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 text-success text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>키워드가 설정되었습니다: <strong>{value}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
