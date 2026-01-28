-- 1. profiles 테이블
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  plan text default 'free' check (plan in ('free', 'paid')),
  daily_usage int default 0,
  last_usage_date date,
  created_at timestamptz default now()
);

-- 2. histories 테이블
create table histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  keyword text not null,
  business_category text,
  topic text,
  purpose text,
  content text not null,
  created_at timestamptz default now()
);

-- 3. settings 테이블
create table settings (
  user_id uuid references profiles(id) on delete cascade primary key,
  default_business_category text,
  keyword_presets text[] default '{}'
);

-- 4. RLS (Row Level Security) 활성화
alter table profiles enable row level security;
alter table histories enable row level security;
alter table settings enable row level security;

-- 5. RLS 정책: 본인 데이터만 접근
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own histories" on histories for select using (auth.uid() = user_id);
create policy "Users can insert own histories" on histories for insert with check (auth.uid() = user_id);
create policy "Users can delete own histories" on histories for delete using (auth.uid() = user_id);

create policy "Users can view own settings" on settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on settings for update using (auth.uid() = user_id);

-- 6. 회원가입 시 자동으로 profile 생성하는 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. histories 인덱스
create index histories_user_id_idx on histories(user_id);
create index histories_created_at_idx on histories(created_at desc);
