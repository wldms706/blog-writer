'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { saveProfile } from '@/lib/storage';

const STORY_QUESTIONS = [
  { key: 'storyMotivation', q: '이 일을 시작하게 된 계기가 뭔가요?', placeholder: '예: 원래 미용에 관심이 많았는데, 반영구를 처음 접하고 완전 빠져버렸어요...' },
  { key: 'storyPriority', q: '시술할 때 가장 중요하게 생각하는 건 뭔가요?', placeholder: '예: 자연스러움이요. 티 안 나게 하는 게 제일 어렵고 제일 중요해요...' },
  { key: 'storyMessage', q: '고객에게 꼭 해주고 싶은 말이 있다면?', placeholder: '예: 가격만 보지 마세요. 내 얼굴에 하는 투자인데 한번에 제대로...' },
  { key: 'storyDifference', q: '다른 샵과 다르다고 생각하는 점은?', placeholder: '예: 저는 피부 상태를 먼저 보고 기법을 추천해요. 무조건 비싼 걸 권하지 않아요...' },
  { key: 'storyReward', q: '이 일을 하면서 가장 보람 느끼는 순간은?', placeholder: '예: 시술 끝나고 거울 보면서 웃으시는 순간이요. 그 표정 보면 다 보람이에요...' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: 기본정보, 2: 스토리, 3: 완료
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [stories, setStories] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (profile?.name) {
        router.push('/write');
      }
    }
    checkUser();
  }, [router]);

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim() || !userId) return;
      setSaving(true);
      await saveProfile(userId, {
        name: name.trim(),
        businessName: businessName.trim(),
      });
      setSaving(false);
      setStep(2);
    } else if (step === 2) {
      setSaving(true);
      if (userId) {
        await saveProfile(userId, {
          storyMotivation: stories.storyMotivation || '',
          storyPriority: stories.storyPriority || '',
          storyMessage: stories.storyMessage || '',
          storyDifference: stories.storyDifference || '',
          storyReward: stories.storyReward || '',
        });
      }
      setSaving(false);
      setStep(3);
    }
  };

  const handleSkipStory = () => {
    setStep(3);
  };

  const handleGoToWrite = () => {
    router.push('/write');
  };

  // Step 1: 기본 정보
  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3B5CFF]/10 flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <h1 className="text-2xl font-black text-black">환영합니다!</h1>
            <p className="mt-2 text-sm text-gray-500">
              시작하기 전에 간단한 정보를 입력해주세요
            </p>
          </div>

          {/* 진행 표시 */}
          <div className="flex items-center gap-2 justify-center">
            <div className="w-8 h-1 rounded-full bg-[#3B5CFF]" />
            <div className="w-8 h-1 rounded-full bg-gray-200" />
            <div className="w-8 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#3B5CFF]"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                상호명
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="매장/업체명 (선택)"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#3B5CFF]"
              />
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!name.trim() || saving}
            className="w-full rounded-full bg-[#3B5CFF] py-3 text-sm font-bold text-white hover:bg-[#2A45E0] disabled:opacity-50 transition-colors"
          >
            {saving ? '저장 중...' : '다음'}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: 원장님 스토리
  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3B5CFF]/10 flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
            <h1 className="text-2xl font-black text-black">원장님의 이야기를 들려주세요</h1>
            <p className="mt-2 text-sm text-gray-500">
              답변을 작성하면 AI가 원장님만의 개성이 담긴 글을 만들어드립니다
            </p>
          </div>

          {/* 진행 표시 */}
          <div className="flex items-center gap-2 justify-center">
            <div className="w-8 h-1 rounded-full bg-[#3B5CFF]" />
            <div className="w-8 h-1 rounded-full bg-[#3B5CFF]" />
            <div className="w-8 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="space-y-5">
            {STORY_QUESTIONS.map(({ key, q, placeholder }) => (
              <div key={key}>
                <p className="mb-1.5 text-sm font-medium text-[#3B5CFF]">{q}</p>
                <textarea
                  value={stories[key] || ''}
                  onChange={(e) => setStories({ ...stories, [key]: e.target.value })}
                  placeholder={placeholder}
                  rows={2}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#3B5CFF] resize-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSkipStory}
              className="flex-1 rounded-full bg-gray-100 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              나중에 할게요
            </button>
            <button
              onClick={handleNext}
              disabled={saving}
              className="flex-1 rounded-full bg-[#3B5CFF] py-3 text-sm font-bold text-white hover:bg-[#2A45E0] disabled:opacity-50 transition-colors"
            >
              {saving ? '저장 중...' : '완료'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: 완료
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* 진행 표시 */}
        <div className="flex items-center gap-2 justify-center">
          <div className="w-8 h-1 rounded-full bg-[#3B5CFF]" />
          <div className="w-8 h-1 rounded-full bg-[#3B5CFF]" />
          <div className="w-8 h-1 rounded-full bg-[#3B5CFF]" />
        </div>

        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-black text-black mb-2">준비 완료!</h1>
          <p className="text-sm text-gray-500">
            지금 바로 첫 블로그 글을 만들어보세요
          </p>
          <p className="mt-1 text-xs text-gray-400">
            최초 3회 무료 체험이 가능합니다
          </p>
        </div>

        <button
          onClick={handleGoToWrite}
          className="w-full rounded-full bg-[#3B5CFF] py-3 text-sm font-bold text-white hover:bg-[#2A45E0] transition-colors"
        >
          글 작성하러 가기
        </button>
      </div>
    </div>
  );
}
