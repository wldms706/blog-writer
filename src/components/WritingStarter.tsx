'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BUSINESS_CATEGORIES } from '@/data/constants';
import { getNextTopics } from '@/lib/article-workflow';

export type WritingSeed = { businessCategory: string; keyword: string; topic: string };
export default function WritingStarter({ onSelect, userPlanType }: { onSelect: (seed: WritingSeed) => void; userPlanType?: string | null }) {
  const [recent, setRecent] = useState<{business_category: string; keyword: string; topic: string} | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const client = createClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) return;
        const { data } = await client.from('histories').select('business_category,keyword,topic')
          .eq('user_id', user.id).order('created_at', {ascending: false}).limit(1).maybeSingle();
        if (!cancelled && data && BUSINESS_CATEGORIES.some(b => b.id === data.business_category)) setRecent(data);
      } catch { /* Recommendations should never block writing. */ }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  if (!recent || (userPlanType === 'pro_general' && recent.business_category === 'semi-permanent')) return null;
  return <section className="card p-5 mb-6">
    <h3 className="font-bold text-black">오늘은 이 주제로 써볼까요?</h3>
    <p className="text-sm text-gray-500 mt-1 mb-3">최근 키워드 ‘{recent.keyword}’와 업종을 이어서 사용해요. 다음 화면에서 바꿀 수 있어요.</p>
    <div className="grid gap-2 sm:grid-cols-3">{getNextTopics(recent.business_category, recent.topic).map(topic =>
      <button key={topic.id} type="button" className="text-left rounded-xl bg-gray-50 p-3 hover:bg-blue-50 border border-gray-200" onClick={() => onSelect({businessCategory: recent.business_category, keyword: recent.keyword, topic: topic.id})}>
        <span className="block font-semibold text-sm text-black">{topic.name}</span><span className="text-xs text-gray-500">{topic.description}</span>
      </button>)}
    </div>
  </section>;
}
