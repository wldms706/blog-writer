import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkNaverBlogRank } from '@/lib/naver-search';

// 같은 아이템 재확인 최소 간격: 10분
const MIN_RECHECK_INTERVAL_MS = 10 * 60 * 1000;
// 한 번에 최대 체크 개수
const MAX_ITEMS_PER_REQUEST = 10;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - MIN_RECHECK_INTERVAL_MS).toISOString();

    // 블로그 URL이 있고:
    // 1) 한 번도 체크 안 한 항목 OR
    // 2) 블로그 탭 순위가 아직 없는 항목 OR
    // 3) 10분 이상 지난 항목
    const { data: items, error } = await supabase
      .from('histories')
      .select('id, keyword, blog_url, rank_checked_at')
      .eq('user_id', user.id)
      .not('blog_url', 'is', null)
      .or(`rank_checked_at.is.null,naver_blog_rank.is.null,rank_checked_at.lte.${cutoff}`)
      .limit(MAX_ITEMS_PER_REQUEST);

    if (error) {
      console.error('Check rank query error:', error);
      return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    let updated = 0;

    for (const item of items) {
      try {
        // VIEW 탭 + 블로그 탭 둘 다 체크
        const [viewResult, blogResult] = await Promise.all([
          checkNaverBlogRank(item.keyword, item.blog_url, 'view'),
          checkNaverBlogRank(item.keyword, item.blog_url, 'blog'),
        ]);

        await supabase
          .from('histories')
          .update({
            naver_rank: viewResult.rank,
            naver_blog_rank: blogResult.rank,
            rank_checked_at: viewResult.checkedAt,
          })
          .eq('id', item.id);

        updated++;

        // Rate limit: 200ms 간격 (2개 요청이므로)
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Rank check failed for ${item.id}:`, err);
      }
    }

    return NextResponse.json({ updated, total: items.length });
  } catch (err) {
    console.error('Check rank error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
