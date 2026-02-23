-- histories 테이블에 blog_url 컬럼 추가
ALTER TABLE histories ADD COLUMN IF NOT EXISTS blog_url text;

-- histories 테이블 update RLS 정책 추가 (기존에 select/insert/delete만 있음)
CREATE POLICY "Users can update own histories" ON histories FOR UPDATE USING (auth.uid() = user_id);
