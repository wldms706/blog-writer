-- Stage 3: 이름/상호명 필드 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name text;
