import { createAdminClient } from '@/lib/supabase/admin';

export const PROMO_LIMIT = 100;
export const REGULAR_PRICES: Record<string, number> = {pro_permanent:19900,pro_general:15900,caption_only:2900};

export function resolveCheckoutPricing(count: number, userId?: string, overridesJson = '') {
  const isPromoOpen = count < PROMO_LIMIT;
  const prices = {...REGULAR_PRICES, pro_permanent:isPromoOpen?12900:19900, pro_general:isPromoOpen?9900:15900};
  let hasPersonalPrice = false;
  if (userId && overridesJson) {
    const overrides = JSON.parse(overridesJson);
    const personal = overrides?.[userId];
    if (personal && typeof personal === 'object') for (const planId of ['pro_permanent','pro_general']) {
      const price = personal[planId];
      if (Number.isInteger(price) && price > 0 && price < prices[planId as keyof typeof prices]) {
        prices[planId as keyof typeof prices] = price;
        hasPersonalPrice = true;
      }
    }
  }
  return {current:count, remaining:Math.max(0,PROMO_LIMIT-count), limit:PROMO_LIMIT, isPromoOpen,prices,
    originalPrices:{...REGULAR_PRICES,caption_only:4900},hasPersonalPrice};
}

export async function getCheckoutPricing(userId?: string) {
  const admin = createAdminClient();
  const {count,error} = await admin.from('subscriptions').select('id',{count:'exact',head:true}).in('plan_id',['pro_permanent','pro_general']);
  if (error || count === null) throw new Error('구독 가격을 확인하지 못했습니다. 다시 시도해주세요.');
  return resolveCheckoutPricing(count,userId,process.env.BILLING_LEGACY_PRICE_OVERRIDES || '');
}
