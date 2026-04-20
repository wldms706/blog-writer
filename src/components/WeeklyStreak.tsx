'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function WeeklyStreak() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 이번 주 월요일 0시 계산
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=일요일, 1=월요일, ...
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - daysFromMonday);
        monday.setHours(0, 0, 0, 0);

        const { count: weekCount } = await supabase
          .from('histories')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', monday.toISOString());

        setCount(weekCount || 0);
      } catch {
        setCount(null);
      }
    }
    load();
  }, []);

  if (count === null) return null;

  let message = '';
  let emoji = '';
  let bg = '';
  let textColor = '';

  if (count === 0) {
    message = '이번 주 아직 시작 안 하셨어요!\n첫 글 써볼까요?';
    emoji = '✨';
    bg = 'bg-gray-100';
    textColor = 'text-gray-700';
  } else if (count === 1) {
    message = '이번 주 1개 썼어요!\n한 개만 더 쓰면 효과가 나와요';
    emoji = '💪';
    bg = 'bg-[#3B5CFF]/10';
    textColor = 'text-[#3B5CFF]';
  } else if (count === 2) {
    message = '이번 주 2개 달성!\n주 2회 목표 완료';
    emoji = '🎉';
    bg = 'bg-[#3B5CFF]/15';
    textColor = 'text-[#3B5CFF]';
  } else {
    message = `이번 주 벌써 ${count}개 썼어요!\n불타고 있어요`;
    emoji = '🔥';
    bg = 'bg-gradient-to-r from-[#3B5CFF] to-[#2A45E0]';
    textColor = 'text-white';
  }

  return (
    <div className={`${bg} ${textColor} rounded-2xl p-4 mb-4 flex items-center gap-3`}>
      <div className="text-3xl">{emoji}</div>
      <div className="flex-1 whitespace-pre-line text-sm font-bold leading-snug">
        {message}
      </div>
      {count >= 2 && (
        <div className="text-xs font-black bg-white/20 rounded-full px-3 py-1">
          {count}개
        </div>
      )}
    </div>
  );
}
