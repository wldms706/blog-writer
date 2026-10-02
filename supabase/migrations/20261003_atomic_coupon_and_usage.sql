begin;

-- Only the existing server service role can invoke these transactions.
create or replace function public.blog_usage_atomic(p_user_id uuid, p_consume boolean default false)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  p public.profiles%rowtype;
  s public.subscriptions%rowtype;
  paid boolean;
  total integer;
  today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Unauthorized'; end if;
  select * into p from public.profiles where id = p_user_id for update;
  if not found then return jsonb_build_object('allowed', false, 'remaining', 0, 'plan', 'free'); end if;
  select * into s from public.subscriptions where user_id = p_user_id;
  if found then
    paid := (s.status = 'active' and s.plan_id <> 'caption_only'
      and (s.payment_key is distinct from 'coupon_grant' or s.next_billing_at > now()))
      or (s.status = 'cancelled' and s.plan_id <> 'caption_only' and s.next_billing_at > now());
  else
    -- Preserve intentionally granted paid accounts without a subscription.
    paid := p.plan = 'paid' or p.plan like 'pro_%';
  end if;
  paid := coalesce(paid, false) or coalesce(p.email = any(array[
    'wldms706@naver.com','mwm2020@nate.com','gkdisk9@nate.com','etang12330@gmail.com']), false);
  total := coalesce(p.total_usage, 0);
  if not paid and total >= 3 then
    return jsonb_build_object('allowed', false, 'remaining', 0, 'plan', 'free');
  end if;
  if p_consume then
    total := total + 1;
    update public.profiles set total_usage = total,
      daily_usage = case when last_usage_date = today then coalesce(daily_usage, 0) + 1 else 1 end,
      last_usage_date = today where id = p_user_id;
  end if;
  return jsonb_build_object('allowed', true, 'remaining', case when paid then -1 else 3 - total end,
    'plan', case when paid then 'paid' else 'free' end);
end $$;
revoke all on function public.blog_usage_atomic(uuid, boolean) from public, anon, authenticated;
grant execute on function public.blog_usage_atomic(uuid, boolean) to service_role;

create or replace function public.redeem_coupon_atomic(p_user_id uuid, p_code text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  c public.coupons%rowtype;
  p public.profiles%rowtype;
  s public.subscriptions%rowtype;
  has_sub boolean;
  shared boolean;
  target text;
  expiry timestamptz;
  max_count integer;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Unauthorized'; end if;
  select * into c from public.coupons where code = upper(trim(p_code)) for update;
  if not found then return jsonb_build_object('error', '존재하지 않는 쿠폰 코드예요.', 'status', 400); end if;
  if c.status = 'expired' or c.redemption_deadline <= now() then
    return jsonb_build_object('error', '쿠폰 등록 기간이 만료됐어요.', 'status', 400);
  end if;
  max_count := greatest(coalesce(c.max_uses, 1), 1);
  shared := max_count > 1;
  if not shared then
    if c.user_id is not null and c.user_id <> p_user_id then
      return jsonb_build_object('error', '이 쿠폰은 다른 원장님 계정 전용이에요.', 'status', 403);
    end if;
    if c.status = 'used' then return jsonb_build_object('error', '이미 등록된 쿠폰이에요.', 'status', 400); end if;
  else
    if exists(select 1 from public.coupon_redemptions where coupon_id = c.id and user_id = p_user_id) then
      return jsonb_build_object('error', '이 쿠폰은 이미 등록하셨어요.', 'status', 400);
    end if;
    if coalesce(c.used_count, 0) >= max_count then
      return jsonb_build_object('error', '쿠폰 정원이 다 찼어요.', 'status', 400);
    end if;
  end if;
  select * into p from public.profiles where id = p_user_id for update;
  if not found then raise exception 'Profile missing'; end if;
  select * into s from public.subscriptions where user_id = p_user_id for update;
  has_sub := found;
  if has_sub and s.price > 0 and (s.status = 'active' or (s.status = 'cancelled' and s.next_billing_at > now())) then
    return jsonb_build_object('error', '이미 유료 구독을 이용 중이에요. 쿠폰 적용은 고객센터에 문의해주세요. 쿠폰은 사용되지 않았습니다.', 'status', 409);
  end if;
  target := coalesce(c.target_plan, 'pro_permanent');
  if target not in ('pro_permanent', 'pro_general', 'pro_reels') then raise exception 'Unsupported coupon plan'; end if;
  expiry := now() + make_interval(days => greatest(coalesce(c.duration_days, 30), 1));
  if has_sub and s.status = 'active' and s.payment_key = 'coupon_grant' then
    expiry := greatest(expiry, s.next_billing_at);
  end if;
  insert into public.subscriptions(user_id, status, plan_id, plan_name, plan_type, price,
    started_at, next_billing_at, payment_key, order_id, customer_key, billing_key, retry_count,
    cancelled_at, discount_percent, coupon_code, updated_at)
  values(p_user_id, 'active', target,
    case target when 'pro_permanent' then '프로 (반영구) - 쿠폰' when 'pro_general' then '프로 (일반) - 쿠폰' else '릴스 PRO - 쿠폰' end,
    case when target = 'pro_permanent' then 'permanent' else 'general' end, 0,
    now(), expiry, 'coupon_grant', 'coupon_' || c.code || '_' || p_user_id,
    'coupon_' || p_user_id, null, 0, null, 0, c.code, now())
  on conflict(user_id) do update set status = excluded.status, plan_id = excluded.plan_id,
    plan_name = excluded.plan_name, plan_type = excluded.plan_type, price = 0,
    started_at = excluded.started_at, next_billing_at = excluded.next_billing_at,
    payment_key = excluded.payment_key, order_id = excluded.order_id, customer_key = excluded.customer_key,
    billing_key = null, card_company = null, card_number = null, retry_count = 0,
    cancelled_at = null, discount_percent = 0, coupon_code = excluded.coupon_code, updated_at = now();
  update public.profiles set plan = 'paid', plan_type = target, coupon_used = true, coupon_code = c.code
    where id = p_user_id;
  if shared then
    insert into public.coupon_redemptions(coupon_id, user_id) values(c.id, p_user_id);
    update public.coupons set used_count = coalesce(used_count, 0) + 1 where id = c.id;
  else
    update public.coupons set status = 'used', used_at = now(), expires_at = expiry,
      user_id = p_user_id where id = c.id;
  end if;
  return jsonb_build_object('success', true, 'expiresAt', expiry, 'targetPlan', target,
    'message', '블로그라이터 PRO 이용권이 활성화됐어요! 🎉');
end $$;
revoke all on function public.redeem_coupon_atomic(uuid, text) from public, anon, authenticated;
grant execute on function public.redeem_coupon_atomic(uuid, text) to service_role;
notify pgrst, 'reload schema';
commit;
