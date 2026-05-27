'use client';

import { useState } from 'react';
import { BUSINESS_CATEGORIES } from '@/data/constants';

type CaptionStyle = 'knowhow' | 'customer' | 'confidence' | 'philosophy' | 'daily';

const STYLES: { id: CaptionStyle; name: string; icon: string; description: string }[] = [
  { id: 'knowhow', name: '노하우/팁형', icon: '💡', description: '실력 어필 + 통념 뒤집기' },
  { id: 'customer', name: '고객 사례형', icon: '💝', description: '감동적인 사연 + 진심' },
  { id: 'confidence', name: '자신감/포트폴리오형', icon: '✨', description: '짧고 강한 임팩트' },
  { id: 'philosophy', name: '철학/브랜딩형', icon: '🎯', description: '신념과 가치 전달' },
  { id: 'daily', name: '일상/공감형', icon: '🤍', description: '편안한 일상 이야기' },
];

export default function CaptionPage() {
  const [step, setStep] = useState(1);
  const [style, setStyle] = useState<CaptionStyle | null>(null);
  const [businessCategory, setBusinessCategory] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [detail, setDetail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [activeLanguage, setActiveLanguage] = useState<'ko' | 'en' | 'ja' | 'zh'>('ko');
  const [translating, setTranslating] = useState<string | null>(null);

  const handleTranslate = async (lang: 'en' | 'ja' | 'zh') => {
    if (translations[lang]) {
      setActiveLanguage(lang);
      return;
    }
    setTranslating(lang);
    try {
      const res = await fetch('/api/translate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result, language: lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '번역 실패');
      setTranslations((prev) => ({ ...prev, [lang]: data.content }));
      setActiveLanguage(lang);
    } catch (e) {
      setError(e instanceof Error ? e.message : '번역 오류');
    } finally {
      setTranslating(null);
    }
  };

  const displayText = activeLanguage === 'ko' ? result : translations[activeLanguage] || '';

  const handleGenerate = async () => {
    if (!style || !businessCategory || !topic.trim()) return;
    setGenerating(true);
    setError('');

    try {
      const business = BUSINESS_CATEGORIES.find(b => b.id === businessCategory);
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style,
          businessCategory: business?.name || businessCategory,
          topic: topic.trim(),
          detail: detail.trim(),
        }),
      });

      const data = await res.json();
      if (res.status === 403) {
        setError('무료 3회를 모두 사용했어요. 구독하시면 무제한이에요!');
        setGenerating(false);
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || 'AI 생성 실패');
      }

      setResult(data.content);
      setStep(5);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStep(1);
    setStyle(null);
    setBusinessCategory(null);
    setTopic('');
    setDetail('');
    setResult('');
    setError('');
    setTranslations({});
    setActiveLanguage('ko');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-black mb-2">인스타 캡션 만들기</h1>
        <p className="text-sm text-gray-500">
          뷰티샵 원장님 무드의 신뢰감 있는 인스타 캡션을 만들어드려요
        </p>
      </div>

      {/* Step 1: 캡션 유형 선택 */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <p className="text-sm font-bold text-black mb-3">어떤 스타일의 캡션을 쓸까요?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStyle(s.id);
                    setStep(2);
                  }}
                  className="text-left p-4 rounded-2xl bg-gray-50 hover:bg-[#3B5CFF]/10 hover:border-[#3B5CFF] border-2 border-transparent transition-all"
                >
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-bold text-black text-sm mb-1">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: 업종 선택 */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <button
            onClick={() => setStep(1)}
            className="text-xs text-gray-500 hover:text-black mb-2"
          >
            ← 뒤로
          </button>
          <p className="text-sm font-bold text-black mb-3">업종을 선택해주세요</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BUSINESS_CATEGORIES.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBusinessCategory(b.id);
                  setStep(3);
                }}
                className="p-3 rounded-xl bg-gray-50 hover:bg-[#3B5CFF]/10 border-2 border-transparent hover:border-[#3B5CFF] transition-all text-center"
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="text-xs font-bold text-black">{b.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: 주제 입력 */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <button
            onClick={() => setStep(2)}
            className="text-xs text-gray-500 hover:text-black mb-2"
          >
            ← 뒤로
          </button>
          <div>
            <label className="text-sm font-bold text-black mb-2 block">
              어떤 내용을 쓸까요? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              주제, 키워드, 시술 이름 등 자유롭게 입력해주세요
            </p>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                style === 'knowhow' ? '예: 자연눈썹 잘 그리는 법' :
                style === 'customer' ? '예: 항암 후 눈썹 잃은 고객님 헤어스트록 시술' :
                style === 'confidence' ? '예: 새 작업 결과물 자랑' :
                style === 'philosophy' ? '예: 가르치는 사람의 책임' :
                '예: 졸업생 챌린지 마무리, 워크숍 후기'
              }
              rows={3}
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm outline-none focus:border-[#3B5CFF] resize-none"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-bold text-black mb-2 block">
              추가 정보 <span className="text-gray-400 font-normal text-xs">(선택)</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              더 구체적인 디테일이 있으면 입력 (없으면 비워두세요)
            </p>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="예: 6년차 운영, 매주 새벽 5시 일어남, 수강생 40명 완주 등"
              rows={3}
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm outline-none focus:border-[#3B5CFF] resize-none"
            />
          </div>
          <button
            onClick={() => setStep(4)}
            disabled={!topic.trim()}
            className="w-full rounded-full bg-[#3B5CFF] py-3 text-sm font-bold text-white hover:bg-[#2A45E0] disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}

      {/* Step 4: 확인 + 생성 */}
      {step === 4 && (
        <div className="space-y-4 animate-fade-in">
          <button
            onClick={() => setStep(3)}
            className="text-xs text-gray-500 hover:text-black mb-2"
          >
            ← 뒤로
          </button>
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">스타일</span><span className="font-bold">{STYLES.find(s => s.id === style)?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">업종</span><span className="font-bold">{BUSINESS_CATEGORIES.find(b => b.id === businessCategory)?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">주제</span><span className="font-bold text-right max-w-[60%]">{topic}</span></div>
          </div>
          {error && (
            <div className="rounded-xl bg-red-50 text-red-700 text-sm p-3">{error}</div>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full rounded-full bg-[#3B5CFF] py-3 text-sm font-bold text-white hover:bg-[#2A45E0] disabled:opacity-30"
          >
            {generating ? 'AI가 캡션 만드는 중...' : '캡션 만들기'}
          </button>
        </div>
      )}

      {/* Step 5: 결과 */}
      {step === 5 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-black">완성된 캡션</h2>
            <button
              onClick={handleCopy}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[#3B5CFF] text-white hover:bg-[#2A45E0]'
              }`}
            >
              {copied ? '✓ 복사됨' : '복사하기'}
            </button>
          </div>

          {/* 언어 선택 탭 */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveLanguage('ko')}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                activeLanguage === 'ko'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇰🇷 한국어
            </button>
            {(['en', 'ja', 'zh'] as const).map((lang) => {
              const labels = { en: '🇺🇸 English', ja: '🇯🇵 日本語', zh: '🇨🇳 中文' };
              const isActive = activeLanguage === lang;
              const isLoading = translating === lang;
              const isReady = !!translations[lang];
              return (
                <button
                  key={lang}
                  onClick={() => handleTranslate(lang)}
                  disabled={isLoading}
                  className={`text-xs font-bold px-4 py-2 rounded-full transition-all disabled:opacity-50 ${
                    isActive
                      ? 'bg-black text-white'
                      : isReady
                      ? 'bg-blue-50 text-[#3B5CFF] hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isLoading ? '번역 중...' : labels[lang]}
                  {isReady && !isActive && ' ✓'}
                </button>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 whitespace-pre-wrap text-sm leading-relaxed border border-gray-200">
            {displayText || result}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-full bg-gray-100 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-30"
            >
              {generating ? '재생성 중...' : '다시 생성'}
            </button>
            <button
              onClick={reset}
              className="rounded-full bg-[#3B5CFF] py-3 text-sm font-bold text-white hover:bg-[#2A45E0]"
            >
              새 캡션 만들기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
