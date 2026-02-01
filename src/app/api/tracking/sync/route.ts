import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncUserToSheet, initializeSheetHeaders } from '@/lib/google-sheets';

export async function POST() {
  try {
    const supabase = await createClient();

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자만 전체 동기화 가능
    const adminEmails = ['wldms706@naver.com'];
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    // 헤더 초기화
    await initializeSheetHeaders();

    // 모든 사용자 데이터 가져오기
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, plan, daily_usage, total_usage, last_usage_date, created_at, coupon_used, coupon_code');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    let synced = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const profile of profiles || []) {
      const success = await syncUserToSheet({
        userId: profile.id,
        email: profile.email || '',
        planType: profile.plan || 'free',
        dailyUsage: profile.last_usage_date === today ? (profile.daily_usage || 0) : 0,
        totalUsage: profile.total_usage || 0,
        lastAccessDate: profile.last_usage_date || '',
        signupDate: profile.created_at?.split('T')[0] || '',
        couponUsed: profile.coupon_used || false,
        couponCode: profile.coupon_code || '',
      });

      if (success) synced++;
    }

    return NextResponse.json({
      success: true,
      synced,
      total: profiles?.length || 0,
    });
  } catch (error) {
    console.error('Tracking sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
