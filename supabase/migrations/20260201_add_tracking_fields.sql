-- 추적용 필드 추가
-- Supabase SQL Editor에서 실행하세요

-- total_usage 컬럼 추가 (총 사용 횟수)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_usage INTEGER DEFAULT 0;

-- 쿠폰 관련 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coupon_used BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- created_at 컬럼이 없다면 추가 (가입일)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
