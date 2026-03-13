export type NaverSearchResult = {
  rank: number; // 0 = 30위 밖, 1~30 = 순위
  checkedAt: string;
};

/**
 * 네이버 검색 결과에서 특정 블로그 URL의 순위를 찾는다.
 * 상위 30개 결과를 확인하고, 해당 URL이 없으면 0을 반환한다.
 *
 * @param tab - 'view' = VIEW 탭, 'blog' = 블로그 탭
 */
export async function checkNaverBlogRank(
  keyword: string,
  blogUrl: string,
  tab: 'view' | 'blog' = 'view',
): Promise<NaverSearchResult> {
  const checkedAt = new Date().toISOString();
  const normalizedTarget = normalizeBlogUrl(blogUrl);

  // 네이버 모바일 검색 (VIEW 또는 블로그 탭)
  const where = tab === 'blog' ? 'blog' : 'view';
  const searchUrl = `https://m.search.naver.com/search.naver?where=${where}&query=${encodeURIComponent(keyword)}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    });

    if (!response.ok) {
      console.error(`[NaverSearch] HTTP ${response.status} for keyword="${keyword}" tab="${tab}"`);
      return { rank: 0, checkedAt };
    }

    const html = await response.text();
    const blogLinks = extractBlogLinksFromHtml(html);

    if (blogLinks.length === 0) {
      console.warn(`[NaverSearch] 블로그 링크 0개 추출됨 - keyword="${keyword}" tab="${tab}" (HTML 구조 변경 가능성)`);
    }

    for (let i = 0; i < blogLinks.length; i++) {
      const normalizedLink = normalizeBlogUrl(blogLinks[i]);
      if (normalizedLink === normalizedTarget) {
        return { rank: i + 1, checkedAt };
      }
    }

    return { rank: 0, checkedAt };
  } catch (error) {
    console.error(`[NaverSearch] 크롤링 실패 - keyword="${keyword}" tab="${tab}":`, error);
    return { rank: 0, checkedAt };
  }
}

/**
 * HTML에서 블로그 링크를 순서대로 추출한다.
 * 여러 파싱 방법을 누적하여 견고성을 높인다.
 */
function extractBlogLinksFromHtml(html: string): string[] {
  const links: string[] = [];
  const seen = new Set<string>();

  const addLink = (url: string) => {
    const decoded = decodeHtmlEntities(url);
    // 검색/목록 관련 URL 제외
    if (decoded.includes('/search/') || decoded.includes('BlogSearchList')) return;
    const normalized = normalizeBlogUrl(decoded);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      links.push(decoded);
    }
  };

  // 방법 1: data-url 속성 (네이버 모바일 VIEW 탭 주요 패턴)
  const dataUrlRegex = /data-url="([^"]*blog\.naver\.com[^"]*)"/g;
  let match;
  while ((match = dataUrlRegex.exec(html)) !== null) {
    addLink(match[1]);
  }

  // 방법 2: href 속성에서 블로그 링크 (보완 - 방법1과 누적)
  const hrefRegex = /href="(https?:\/\/(?:m\.)?blog\.naver\.com\/[^"]+)"/g;
  while ((match = hrefRegex.exec(html)) !== null) {
    addLink(match[1]);
  }

  // 방법 3: a 태그의 class에 api_txt_lines 등 VIEW 탭 결과 링크 패턴
  const apiTxtRegex = /class="[^"]*api_txt_lines[^"]*"[^>]*href="([^"]*)"/g;
  while ((match = apiTxtRegex.exec(html)) !== null) {
    if (match[1].includes('blog.naver.com')) {
      addLink(match[1]);
    }
  }

  // 방법 4: data-cr-area 속성 근처의 blog.naver.com 링크 (최신 네이버 모바일)
  const dataCrRegex = /data-cr-area="[^"]*"[^>]*href="([^"]*blog\.naver\.com[^"]*)"/g;
  while ((match = dataCrRegex.exec(html)) !== null) {
    addLink(match[1]);
  }

  // 방법 5: JSON-LD 또는 script 내 blog URL (네이버가 SPA로 전환 시 대비)
  const jsonUrlRegex = /"url"\s*:\s*"(https?:\/\/(?:m\.)?blog\.naver\.com\/[^"]+)"/g;
  while ((match = jsonUrlRegex.exec(html)) !== null) {
    addLink(match[1]);
  }

  return links;
}

/**
 * HTML 엔티티 디코딩
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

/**
 * 네이버 블로그 URL 정규화.
 * 다양한 URL 형식을 "username/postid" 형태로 통일하여 비교한다.
 */
function normalizeBlogUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // /username/postid 형태
    const cleanMatch = parsed.pathname.match(/^\/([^/]+)\/(\d+)$/);
    if (cleanMatch) {
      return `${cleanMatch[1]}/${cleanMatch[2]}`;
    }

    // /PostView.naver?blogId=xxx&logNo=yyy 형태
    if (parsed.pathname.includes('PostView')) {
      const blogId = parsed.searchParams.get('blogId');
      const logNo = parsed.searchParams.get('logNo');
      if (blogId && logNo) {
        return `${blogId}/${logNo}`;
      }
    }

    // 폴백
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  } catch {
    return url;
  }
}
