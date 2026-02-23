const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID!;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET!;
const NAVER_SEARCH_URL = 'https://openapi.naver.com/v1/search/blog.json';

export type NaverSearchResult = {
  rank: number; // 0 = 100위 밖, 1~100 = 순위
  checkedAt: string;
};

/**
 * 네이버 블로그 검색 API로 키워드 검색 후 특정 블로그 URL의 순위를 찾는다.
 * 상위 100개 결과를 확인하고, 해당 URL이 없으면 0을 반환한다.
 */
export async function checkNaverBlogRank(
  keyword: string,
  blogUrl: string,
): Promise<NaverSearchResult> {
  const checkedAt = new Date().toISOString();
  const normalizedTarget = normalizeBlogUrl(blogUrl);

  const params = new URLSearchParams({
    query: keyword,
    display: '100',
    start: '1',
    sort: 'sim', // 관련도순 (네이버 기본 검색 랭킹)
  });

  const response = await fetch(`${NAVER_SEARCH_URL}?${params}`, {
    headers: {
      'X-Naver-Client-Id': NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Naver API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const items: Array<{ link: string; title: string }> = data.items || [];

  for (let i = 0; i < items.length; i++) {
    const normalizedLink = normalizeBlogUrl(items[i].link);
    if (normalizedLink === normalizedTarget) {
      return { rank: i + 1, checkedAt };
    }
  }

  return { rank: 0, checkedAt };
}

/**
 * 네이버 블로그 URL 정규화.
 * 다양한 URL 형식을 "username/postid" 형태로 통일하여 비교한다.
 *
 * 가능한 형식:
 * - https://blog.naver.com/username/postid
 * - https://m.blog.naver.com/username/postid
 * - https://blog.naver.com/PostView.naver?blogId=username&logNo=postid
 */
function normalizeBlogUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // /username/postid 형태 (깔끔한 URL)
    const cleanMatch = parsed.pathname.match(/^\/([^/]+)\/(\d+)$/);
    if (cleanMatch) {
      return `${cleanMatch[1]}/${cleanMatch[2]}`;
    }

    // /PostView.naver?blogId=xxx&logNo=yyy 형태 (레거시)
    if (parsed.pathname.includes('PostView')) {
      const blogId = parsed.searchParams.get('blogId');
      const logNo = parsed.searchParams.get('logNo');
      if (blogId && logNo) {
        return `${blogId}/${logNo}`;
      }
    }

    // 폴백: 프로토콜 제거 + 후행 슬래시 제거
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  } catch {
    return url;
  }
}
