-- Stage 2: 스마트 키워드 시스템을 위한 profiles 테이블 업데이트
-- Supabase SQL Editor에서 실행하세요

-- 1. profiles 테이블에 새 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_district text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_neighborhood text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blog_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blog_index_level text CHECK (blog_index_level IN ('high', 'medium', 'low'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blog_index_checked_at timestamptz;

-- 2. 기존 사용자들의 location 기본값 설정 (선택사항)
-- UPDATE profiles SET location_city = '' WHERE location_city IS NULL;

-- 완료 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles';
