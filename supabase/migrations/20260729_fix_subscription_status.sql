-- 빌링 크론이 3회 결제 실패 시 status = 'payment_failed' 로 바꾸려 하지만
-- 20260206_add_subscriptions.sql 의 CHECK 제약조건에 해당 값이 없어 UPDATE 가 통째로 거부됨.
-- retry_count 증가도 같은 UPDATE 에 묶여 있어 함께 롤백되고, 결과적으로 실패한 구독이
-- status='active' / retry_count=2 로 고정되어 매일 토스 결제가 무한 재시도됨.
-- → 제약조건에 'payment_failed' 추가.

-- 1. 기존 status CHECK 제약조건 제거 (이름이 다를 수 있어 동적으로 탐색)
do $$
declare
  c text;
begin
  select conname into c
    from pg_constraint
   where conrelid = 'public.subscriptions'::regclass
     and contype = 'c'
     and pg_get_constraintdef(oid) ilike '%status%';

  if c is not null then
    execute format('alter table public.subscriptions drop constraint %I', c);
  end if;
end $$;

-- 2. payment_failed 를 포함한 제약조건 재생성
alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('active', 'cancelled', 'expired', 'pending', 'payment_failed'));

-- 3. 크론이 참조하는 컬럼 보강 (누락 시에만 추가)
alter table public.subscriptions add column if not exists retry_count integer default 0;

-- 4. 확인용
-- select status, count(*) from public.subscriptions group by status;
