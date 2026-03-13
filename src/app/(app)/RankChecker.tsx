'use client';

import { useEffect } from 'react';

export default function RankChecker() {
  useEffect(() => {
    // 페이지 로드 시 네이버 순위 업데이트 (fire-and-forget)
    fetch('/api/check-rank', { method: 'POST' }).catch(() => {});
  }, []);

  return null;
}
