-- 프로필에 가게 정보 컬럼 추가 (글 작성 시 자동 로드용)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_hours TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_parking TEXT;
