-- 네이버 검색 순위 자동 확인 기능
-- Supabase SQL Editor에서 실행하세요

-- 1. 블로그 URL 제출 시각
ALTER TABLE histories ADD COLUMN IF NOT EXISTS blog_url_submitted_at timestamptz;

-- 2. 네이버 검색 순위 (null = 미확인, 0 = 100위 밖, 1~100 = 순위)
ALTER TABLE histories ADD COLUMN IF NOT EXISTS naver_rank integer;

-- 3. 순위 확인 시각
ALTER TABLE histories ADD COLUMN IF NOT EXISTS rank_checked_at timestamptz;

-- 4. 크론 쿼리용 부분 인덱스 (미확인 + URL 제출된 항목만)
CREATE INDEX IF NOT EXISTS idx_histories_pending_rank_check
  ON histories (blog_url_submitted_at)
  WHERE blog_url IS NOT NULL
    AND blog_url_submitted_at IS NOT NULL
    AND rank_checked_at IS NULL;
