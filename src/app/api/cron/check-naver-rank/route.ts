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
    // 블로그 URL 제출 후 7시간 지난 미확인 항목 조회
    const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();

    const { data: pendingItems, error: fetchError } = await supabase
      .from('histories')
      .select('id, keyword, blog_url, blog_url_submitted_at')
      .not('blog_url', 'is', null)
      .not('blog_url_submitted_at', 'is', null)
      .is('rank_checked_at', null)
      .lte('blog_url_submitted_at', sevenHoursAgo)
      .limit(50);

    if (fetchError) {
      console.error('Fetch pending items error:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!pendingItems || pendingItems.length === 0) {
      return NextResponse.json({ message: 'No pending items', processed: 0 });
    }

    let processed = 0;
    let errors = 0;

    for (const item of pendingItems) {
      try {
        const result = await checkNaverBlogRank(item.keyword, item.blog_url);

        const { error: updateError } = await supabase
          .from('histories')
          .update({
            naver_rank: result.rank,
            rank_checked_at: result.checkedAt,
          })
          .eq('id', item.id);

        if (updateError) {
          console.error(`Update rank error for ${item.id}:`, updateError);
          errors++;
        } else {
          processed++;
        }

        // Rate limit: 100ms 간격
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Check rank error for ${item.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      message: 'Rank check complete',
      total: pendingItems.length,
      processed,
      errors,
    });
  } catch (error) {
    console.error('Cron check-naver-rank error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
