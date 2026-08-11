-- 문자(SMS/LMS) 발송 기록
-- 중복 발송 방지 + 발송 이력 추적 + 비용 확인용

create table if not exists sms_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,

  -- payment_failed | coupon_expiring | inactive | welcome
  kind text not null,

  to_number text not null,
  text text not null,

  -- sent | failed | skipped
  status text not null,
  error text,

  created_at timestamptz default now()
);

alter table sms_logs enable row level security;

create policy "Service role can manage sms logs"
  on sms_logs for all
  using (auth.role() = 'service_role');

-- 중복 발송 검사(user_id + kind + created_at)용
create index if not exists sms_logs_user_kind_idx on sms_logs(user_id, kind, created_at desc);
create index if not exists sms_logs_created_at_idx on sms_logs(created_at desc);

-- 확인용
-- select kind, status, count(*) from sms_logs group by kind, status;
