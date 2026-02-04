'use client';

import { useState, useCallback } from 'react';

interface StepTreatmentInfoProps {
  value: string;
  onChange: (value: string) => void;
}

interface ShopInfo {
  programName: string;
  description: string;
  difference: string;
  targetCustomer: string;
  process: string;
}

// 구조화된 필드를 하나의 문자열로 조합
function combineFields(info: ShopInfo): string {
  const parts: string[] = [];
  if (info.programName.trim()) parts.push(`프로그램명: ${info.programName.trim()}`);
  if (info.description.trim()) parts.push(`설명: ${info.description.trim()}`);
  if (info.difference.trim()) parts.push(`차별점: ${info.difference.trim()}`);
  if (info.targetCustomer.trim()) parts.push(`추천 대상: ${info.targetCustomer.trim()}`);
  if (info.process.trim()) parts.push(`진행 방식: ${info.process.trim()}`);
  return parts.join('\n');
}

// 기존 문자열을 구조화된 필드로 파싱 (뒤로가기 시 복원용)
function parseFields(text: string): ShopInfo {
  const info: ShopInfo = {
    programName: '',
    description: '',
    difference: '',
    targetCustomer: '',
    process: '',
  };

  if (!text) return info;

  // 구조화된 포맷 파싱 시도
  const lines = text.split('\n');
  let matched = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('프로그램명:')) {
      info.programName = trimmed.replace('프로그램명:', '').trim();
      matched = true;
    } else if (trimmed.startsWith('설명:')) {
      info.description = trimmed.replace('설명:', '').trim();
      matched = true;
    } else if (trimmed.startsWith('차별점:')) {
      info.difference = trimmed.replace('차별점:', '').trim();
      matched = true;
    } else if (trimmed.startsWith('추천 대상:')) {
      info.targetCustomer = trimmed.replace('추천 대상:', '').trim();
      matched = true;
    } else if (trimmed.startsWith('진행 방식:')) {
      info.process = trimmed.replace('진행 방식:', '').trim();
      matched = true;
    }
  }

  // 구조화된 포맷이 아닌 경우 (레거시) 설명 필드에 전체 텍스트 넣기
  if (!matched && text.trim()) {
    info.description = text.trim();
  }

  return info;
}

const EXAMPLES = [
  {
    programName: '탕탕이 슬리밍',
    description: '지방분해 앰플을 주입해서 붓기 없이 사이즈를 줄여주는 바디 관리',
    difference: '독자 배합 앰플 사용, 시술 후 붓기가 거의 없어서 바로 일상생활 가능',
    targetCustomer: '결혼식/촬영 앞둔 분, 부분 사이즈 고민이 있는 분',
    process: '상담 후 부위 선정, 앰플 주입 30분, 고주파 마무리. 주 1~2회 권장',
  },
  {
    programName: '시그니처 속눈썹 연장',
    description: '자연스러운 볼륨감을 살리는 속눈썹 한올한올 수작업 연장',
    difference: '극세사 모를 사용해서 자속 무게감 없이 가볍고, 3주 이상 유지력',
    targetCustomer: '화장 시간을 줄이고 싶은 직장인, 눈매가 답답한 분',
    process: '눈매 상담 후 컬/길이/숱 선택, 90분 시술, 리터치는 2~3주 후',
  },
];

export default function StepTreatmentInfo({ value, onChange }: StepTreatmentInfoProps) {
  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => parseFields(value));
  const [showExamples, setShowExamples] = useState(false);

  // 필드 변경 시 조합된 문자열을 부모에 전달
  const updateField = useCallback((field: keyof ShopInfo, fieldValue: string) => {
    setShopInfo(prev => {
      const updated = { ...prev, [field]: fieldValue };
      // 다음 틱에서 onChange 호출 (setState와 동시에 부모 업데이트)
      setTimeout(() => onChange(combineFields(updated)), 0);
      return updated;
    });
  }, [onChange]);

  // 예시 클릭 시 전체 필드 채우기
  const handleExampleClick = (example: typeof EXAMPLES[0]) => {
    setShopInfo(example);
    onChange(combineFields(example));
    setShowExamples(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          우리 샵의 시그니처를 알려주세요
        </h2>
        <p className="text-text-secondary">
          구체적으로 적을수록 우리 샵만의 개성이 담긴 글이 만들어져요
        </p>
        <p className="text-sm text-text-muted mt-1">
          (선택사항 - 건너뛰어도 됩니다)
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* 구조화된 입력 필드 */}
        <div className="card p-6 space-y-5">

          {/* 프로그램명 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              프로그램/시술 이름
            </label>
            <input
              type="text"
              value={shopInfo.programName}
              onChange={(e) => updateField('programName', e.target.value)}
              placeholder="예: 탕탕이 슬리밍, 시그니처 왁싱, 아쿠아필 관리"
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-background-subtle
                focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                transition-all placeholder:text-text-muted text-text-primary"
            />
          </div>

          {/* 한 줄 설명 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              한 줄로 설명하면?
            </label>
            <input
              type="text"
              value={shopInfo.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="예: 지방분해 앰플로 붓기 없이 사이즈를 줄여주는 바디 관리"
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-background-subtle
                focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                transition-all placeholder:text-text-muted text-text-primary"
            />
          </div>

          {/* 차별점 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              다른 곳과 뭐가 다른가요?
              <span className="font-normal text-text-muted ml-1">우리만의 특별한 점</span>
            </label>
            <textarea
              value={shopInfo.difference}
              onChange={(e) => updateField('difference', e.target.value)}
              placeholder="예: 독자 배합 앰플을 사용해서 붓기가 거의 없고, 시술 후 바로 일상생활이 가능해요"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-background-subtle
                focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                transition-all placeholder:text-text-muted text-text-primary resize-none"
            />
          </div>

          {/* 추천 대상 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              어떤 분들에게 특히 좋나요?
            </label>
            <input
              type="text"
              value={shopInfo.targetCustomer}
              onChange={(e) => updateField('targetCustomer', e.target.value)}
              placeholder="예: 결혼식 앞둔 분, 부분 사이즈 고민이 있는 분, 피부 트러블이 잦은 분"
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-background-subtle
                focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                transition-all placeholder:text-text-muted text-text-primary"
            />
          </div>

          {/* 진행 방식 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              어떻게 진행되나요?
              <span className="font-normal text-text-muted ml-1">과정, 소요시간, 주기 등</span>
            </label>
            <textarea
              value={shopInfo.process}
              onChange={(e) => updateField('process', e.target.value)}
              placeholder="예: 상담 후 부위 선정 → 앰플 도포 30분 → 고주파 마무리. 주 1~2회, 총 4~6회 권장"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-background-subtle
                focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                transition-all placeholder:text-text-muted text-text-primary resize-none"
            />
          </div>
        </div>

        {/* 예시 토글 버튼 */}
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors py-2"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showExamples ? '예시 숨기기' : '이렇게 적어보세요 (예시)'}
        </button>

        {/* 예시 목록 */}
        {showExamples && (
          <div className="card p-4 space-y-3 animate-fade-in">
            <p className="text-xs text-text-muted mb-2">클릭하면 예시가 자동으로 입력됩니다</p>
            {EXAMPLES.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left p-4 rounded-lg bg-background-subtle hover:bg-secondary-light border border-transparent hover:border-primary/20 transition-all space-y-1.5"
              >
                <div className="font-medium text-primary">{example.programName}</div>
                <div className="text-sm text-text-secondary">{example.description}</div>
                <div className="text-xs text-text-muted">
                  차별점: {example.difference}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="card p-4 bg-blue-50 border-blue-100">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">이 정보가 글에 어떻게 반영되나요?</p>
              <p className="text-sm text-blue-700 mt-1">
                입력한 내용이 블로그 글 본문에 자연스럽게 녹아들어, 우리 샵만의 전문성과 차별점이 드러나는 글이 만들어집니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
