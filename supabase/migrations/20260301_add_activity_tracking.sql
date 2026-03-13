-- 유저 활동 추적 + 카카오 알림용 필드 추가
-- profiles 테이블에 last_active_at, phone 컬럼 추가

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS phone text;

-- 3일 이상 미접속 유저를 빠르게 조회하기 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at
  ON profiles (last_active_at)
  WHERE last_active_at IS NOT NULL;

-- phone 컬럼 인덱스 (알림 발송시 사용)
CREATE INDEX IF NOT EXISTS idx_profiles_phone
  ON profiles (phone)
  WHERE phone IS NOT NULL;

-- 기존 유저의 last_active_at을 현재 시각으로 초기화
UPDATE profiles SET last_active_at = now() WHERE last_active_at IS NULL;
