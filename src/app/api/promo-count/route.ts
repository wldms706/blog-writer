import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCheckoutPricing } from '@/lib/subscription-pricing';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const client = await createClient();
    const {data:{user}} = await client.auth.getUser();
    return NextResponse.json(await getCheckoutPricing(user?.id),{headers:{'Cache-Control':'private, no-store'}});
  } catch {
    return NextResponse.json({error:'가격 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'},{status:503,headers:{'Cache-Control':'private, no-store'}});
  }
}
