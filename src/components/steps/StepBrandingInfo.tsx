'use client';

import { BrandingType, BrandingInfo, RecruitInfo, PhilosophyInfo } from '@/types';

interface StepBrandingInfoProps {
  value: BrandingInfo;
  onChange: (value: BrandingInfo) => void;
  brandingType: BrandingType | null;
  shopAddress?: string;
  shopHours?: string;
  shopPhone?: string;
  shopParking?: string;
  onShopInfoChange?: (field: 'shopAddress' | 'shopHours' | 'shopPhone' | 'shopParking', value: string) => void;
}

// 각 브랜딩 타입별 질문 정의
const RECRUIT_QUESTIONS: { key: keyof RecruitInfo; label: string; placeholder: string }[] = [
  { key: 'courseName', label: '교육 과정명이 무엇인가요?', placeholder: '예: 반영구 눈썹 1:1 클래스, 두피문신 마스터 과정' },
  { key: 'targetStudent', label: '어떤 분들을 대상으로 하나요?', placeholder: '예: 입문자, 전직 희망자, 기존 시술자 스킬업' },
  { key: 'curriculum', label: '수업 내용/커리큘럼은 어떻게 되나요?', placeholder: '예: 이론+실습 8회, 모델 실습 포함, 총 4주 과정' },
  { key: 'benefit', label: '수강 혜택이나 강점이 있나요?', placeholder: '예: 소수정예 3명, 수료 후 취업연계, 재료 제공' },
];

const PHILOSOPHY_QUESTIONS: { key: keyof PhilosophyInfo; label: string; placeholder: string }[] = [
  { key: 'coreValue', label: '가장 중요하게 생각하는 가치는 무엇인가요?', placeholder: '예: 자연스러움, 고객 만족, 안전한 시술' },
  { key: 'difference', label: '다른 샵과 다르게 생각하는 점이 있나요?', placeholder: '예: 트렌드보다 고객 얼굴형에 맞는 디자인, 과하지 않은 자연스러움' },
  { key: 'whyPhilosophy', label: '왜 그런 철학을 갖게 되셨나요?', placeholder: '예: 과한 시술로 후회하는 고객을 많이 봐서' },
  { key: 'message', label: '고객에게 전하고 싶은 메시지가 있나요?', placeholder: '예: 시술은 신중하게, 선택은 본인에게 맞게' },
];

const TITLE_BY_TYPE: Record<BrandingType, string> = {
  recruit: '수강생 모집 정보를 알려주세요',
  philosophy: '샵의 철학과 신념을 알려주세요',
};

const SUBTITLE_BY_TYPE: Record<BrandingType, string> = {
  recruit: '교육 과정 정보를 입력하시면 AI가 모집 글을 작성합니다',
  philosophy: '어떤 가치를 중요하게 생각하시나요?',
};

export default function StepBrandingInfo({ value, onChange, brandingType, shopAddress, shopHours, shopPhone, shopParking, onShopInfoChange }: StepBrandingInfoProps) {
  if (!brandingType) return null;

  const handleChange = (key: string, newValue: string) => {
    const updatedInfo = { ...value };
    if (brandingType === 'recruit') {
      updatedInfo.recruit = { ...updatedInfo.recruit, [key]: newValue };
    } else if (brandingType === 'philosophy') {
      updatedInfo.philosophy = { ...updatedInfo.philosophy, [key]: newValue };
    }
    onChange(updatedInfo);
  };

  const getQuestions = () => {
    switch (brandingType) {
      case 'recruit':
        return RECRUIT_QUESTIONS;
      case 'philosophy':
        return PHILOSOPHY_QUESTIONS;
      default:
        return [];
    }
  };

  const getCurrentValues = () => {
    switch (brandingType) {
      case 'recruit':
        return value.recruit;
      case 'philosophy':
        return value.philosophy;
      default:
        return {};
    }
  };

  const questions = getQuestions();
  const currentValues = getCurrentValues();

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          {TITLE_BY_TYPE[brandingType]}
        </h2>
        <p className="text-gray-500">
          {SUBTITLE_BY_TYPE[brandingType]}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {questions.map((q, idx) => (
          <div key={q.key} className="space-y-2">
            <label className="block text-sm font-medium text-black">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#3B5CFF]/10 text-[#3B5CFF] text-xs font-bold mr-2">
                {idx + 1}
              </span>
              {q.label}
            </label>
            <input
              type="text"
              value={(currentValues as Record<string, string>)[q.key] || ''}
              onChange={(e) => handleChange(q.key, e.target.value)}
              placeholder={q.placeholder}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3B5CFF] focus:ring-2 focus:ring-[#3B5CFF]/20 outline-none text-black placeholder:text-gray-400 transition-all"
            />
          </div>
        ))}

        {/* 매장 정보 */}
        {onShopInfoChange && (
          <div className="card p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-[#3B5CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-black">매장 정보</h3>
                <span className="text-xs text-gray-400">(선택사항)</span>
              </div>
              <p className="text-xs text-gray-400 ml-6">입력하면 글 마지막에 자연스럽게 포함됩니다</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  매장 주소
                </label>
                <input
                  type="text"
                  value={shopAddress || ''}
                  onChange={(e) => onShopInfoChange('shopAddress', e.target.value)}
                  placeholder="예: 서울시 강남구 신사동 123-4 2층"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white
                    focus:border-[#3B5CFF] focus:ring-2 focus:ring-[#3B5CFF]/20 focus:outline-none
                    transition-all placeholder:text-gray-400 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  영업시간
                </label>
                <input
                  type="text"
                  value={shopHours || ''}
                  onChange={(e) => onShopInfoChange('shopHours', e.target.value)}
                  placeholder="예: 평일 10:00~20:00, 주말 예약제"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white
                    focus:border-[#3B5CFF] focus:ring-2 focus:ring-[#3B5CFF]/20 focus:outline-none
                    transition-all placeholder:text-gray-400 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  연락처
                </label>
                <input
                  type="text"
                  value={shopPhone || ''}
                  onChange={(e) => onShopInfoChange('shopPhone', e.target.value)}
                  placeholder="예: 010-1234-5678"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white
                    focus:border-[#3B5CFF] focus:ring-2 focus:ring-[#3B5CFF]/20 focus:outline-none
                    transition-all placeholder:text-gray-400 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  주차 안내
                </label>
                <input
                  type="text"
                  value={shopParking || ''}
                  onChange={(e) => onShopInfoChange('shopParking', e.target.value)}
                  placeholder="예: 건물 내 주차 가능, 1시간 무료"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white
                    focus:border-[#3B5CFF] focus:ring-2 focus:ring-[#3B5CFF]/20 focus:outline-none
                    transition-all placeholder:text-gray-400 text-black"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-[#3B5CFF]/5 border border-[#3B5CFF]/20">
          <svg className="w-5 h-5 text-[#3B5CFF] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-black">
            <p className="font-medium mb-1">작성 팁</p>
            <ul className="space-y-1 text-gray-600">
              <li>• 모든 항목을 채우지 않아도 됩니다</li>
              <li>• 키워드처럼 간단히 적어도 괜찮아요</li>
              <li>• AI가 자연스러운 문장으로 변환합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
