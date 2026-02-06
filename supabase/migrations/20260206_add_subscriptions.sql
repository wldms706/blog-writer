-- 구독 테이블 생성
-- 토스페이먼츠 정기결제 연동용

-- 1. subscriptions 테이블 생성
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique not null,

  -- 플랜 정보
  plan_id text not null,  -- pro_permanent, pro_general
  plan_name text not null,
  plan_type text not null, -- permanent, general
  price integer not null,

  -- 구독 상태
  status text default 'active' check (status in ('active', 'cancelled', 'expired', 'pending')),

  -- 결제 정보
  payment_key text,       -- 토스페이먼츠 결제키
  order_id text,          -- 주문번호
  billing_key text,       -- 빌링키 (자동결제용)

  -- 카드 정보
  card_company text,      -- 카드사
  card_number text,       -- 마스킹된 카드번호

  -- 날짜
  started_at timestamptz default now(),
  next_billing_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. RLS 활성화
alter table subscriptions enable row level security;

-- 3. RLS 정책
create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role can manage subscriptions"
  on subscriptions for all
  using (auth.role() = 'service_role');

-- 4. 인덱스
create index subscriptions_user_id_idx on subscriptions(user_id);
create index subscriptions_status_idx on subscriptions(status);
create index subscriptions_next_billing_at_idx on subscriptions(next_billing_at);

-- 5. profiles 테이블에 plan 관련 컬럼 추가/수정
-- 기존 plan 컬럼 제약조건 제거 후 새로 추가
alter table profiles drop constraint if exists profiles_plan_check;
alter table profiles add constraint profiles_plan_check
  check (plan in ('free', 'paid', 'pro_permanent', 'pro_general'));

-- plan_type 컬럼 추가 (없는 경우)
alter table profiles add column if not exists plan_type text;
alter table profiles add column if not exists updated_at timestamptz default now();

-- 6. 결제 히스토리 테이블 (결제 내역 추적용)
create table if not exists payment_histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  subscription_id uuid references subscriptions(id) on delete set null,

  -- 결제 정보
  payment_key text not null,
  order_id text not null,
  amount integer not null,

  -- 상태
  status text not null, -- DONE, CANCELED, FAILED

  -- 메타데이터
  card_company text,
  card_number text,
  receipt_url text,

  -- 날짜
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 7. payment_histories RLS
alter table payment_histories enable row level security;

create policy "Users can view own payment histories"
  on payment_histories for select
  using (auth.uid() = user_id);

create policy "Service role can manage payment histories"
  on payment_histories for all
  using (auth.role() = 'service_role');

-- 8. payment_histories 인덱스
create index payment_histories_user_id_idx on payment_histories(user_id);
create index payment_histories_created_at_idx on payment_histories(created_at desc);
