import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const PROMO_LIMIT = 100;

export async function GET() {
  const admin = createAdminClient();

  const { count } = await admin
    .from('subscriptions')
    .select('id', { count: 'exact', head: true });

  const current = count || 0;
  const remaining = Math.max(0, PROMO_LIMIT - current);
  const isPromoOpen = remaining > 0;

  return NextResponse.json({
    current,
    remaining,
    limit: PROMO_LIMIT,
    isPromoOpen,
    prices: {
      pro_permanent: isPromoOpen ? 12900 : 19900,
      pro_general: isPromoOpen ? 9900 : 15900,
    },
    originalPrices: {
      pro_permanent: 19900,
      pro_general: 15900,
    },
  });
}
