import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkNaverBlogRank } from '@/lib/naver-search';

export async function GET(request: NextRequest) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    // 1. 신규 항목: 블로그 URL 제출 후 7시간 지난 미확인 항목
    const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();

    const { data: newItems, error: newError } = await supabase
      .from('histories')
      .select('id, keyword, blog_url')
      .not('blog_url', 'is', null)
      .not('blog_url_submitted_at', 'is', null)
      .is('rank_checked_at', null)
      .lte('blog_url_submitted_at', sevenHoursAgo)
      .limit(30);

    if (newError) {
      console.error('Fetch new items error:', newError);
    }

    // 2. 재확인 항목: 마지막 확인 후 12시간 지난 항목
    const twentyFourHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

    const { data: recheckItems, error: recheckError } = await supabase
      .from('histories')
      .select('id, keyword, blog_url')
      .not('blog_url', 'is', null)
      .not('rank_checked_at', 'is', null)
      .lte('rank_checked_at', twentyFourHoursAgo)
      .limit(30);

    if (recheckError) {
      console.error('Fetch recheck items error:', recheckError);
    }

    // 합치기 (중복 제거)
    const seenIds = new Set<string>();
    const allItems: { id: string; keyword: string; blog_url: string }[] = [];
    for (const item of [...(newItems || []), ...(recheckItems || [])]) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        allItems.push(item);
      }
    }

    if (allItems.length === 0) {
      return NextResponse.json({
        message: 'No items to check',
        newPending: newItems?.length || 0,
        recheckPending: recheckItems?.length || 0,
        processed: 0,
      });
    }

    let processed = 0;
    let errors = 0;

    for (const item of allItems) {
      try {
        // VIEW 탭 + 블로그 탭 둘 다 체크
        const [viewResult, blogResult] = await Promise.all([
          checkNaverBlogRank(item.keyword, item.blog_url, 'view'),
          checkNaverBlogRank(item.keyword, item.blog_url, 'blog'),
        ]);

        const { error: updateError } = await supabase
          .from('histories')
          .update({
            naver_rank: viewResult.rank,
            naver_blog_rank: blogResult.rank,
            rank_checked_at: viewResult.checkedAt,
          })
          .eq('id', item.id);

        if (updateError) {
          console.error(`Update rank error for ${item.id}:`, updateError);
          errors++;
        } else {
          processed++;
        }

        // Rate limit: 200ms 간격 (2개 요청이므로)
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Check rank error for ${item.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      message: 'Rank check complete',
      newChecked: newItems?.length || 0,
      reChecked: recheckItems?.length || 0,
      total: allItems.length,
      processed,
      errors,
    });
  } catch (error) {
    console.error('Cron check-naver-rank error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
