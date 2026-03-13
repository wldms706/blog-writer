-- 네이버 블로그 탭 순위 컬럼 추가
-- 기존 naver_rank는 VIEW 탭, naver_blog_rank는 블로그 탭

ALTER TABLE histories
  ADD COLUMN IF NOT EXISTS naver_blog_rank integer;
