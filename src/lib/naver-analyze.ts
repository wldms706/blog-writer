/**
 * 네이버 상위 노출 블로그 본문 크롤링 + 공통 표현 추출
 *
 * 1. 키워드로 네이버 검색 → 상위 3개 블로그 URL 추출
 * 2. 각 블로그 본문 크롤링
 * 3. 공통으로 자주 등장하는 2~4글자 표현(n-gram) 추출
 * 4. 생성 프롬프트에 반영할 공통 표현 리스트 반환
 */

// 불용어 (분석에서 제외할 일반적인 단어)
const STOP_WORDS = new Set([
  '그리고', '하지만', '그래서', '그러나', '또한', '때문에', '이렇게', '그렇게',
  '정말로', '진짜로', '사실은', '물론이', '아무래', '어쨌든', '그런데', '왜냐면',
  '합니다', '입니다', '습니다', '됩니다', '었습니', '겠습니', '하세요', '주세요',
  '그래도', '하는데', '있는데', '없는데', '같은데', '인데요', '거든요', '잖아요',
  '에서는', '으로는', '에서의', '으로의', '이라고', '라고는', '라는것', '라는게',
  '이러한', '그러한', '저러한', '이것은', '그것은', '저것은',
  '확인하', '확인해', '중요합', '중요한', '필요합', '필요한',
  '대한민', '블로그', '네이버', '포스팅', '이미지', '출처는',
]);

/**
 * 네이버 검색 상위 블로그 URL 추출 (최대 3개)
 */
async function getTopBlogUrls(keyword: string): Promise<string[]> {
  const searchUrl = `https://m.search.naver.com/search.naver?where=view&query=${encodeURIComponent(keyword)}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const html = await response.text();
    const urls: string[] = [];
    const seen = new Set<string>();

    // blog.naver.com URL 추출
    const patterns = [
      /data-url="(https?:\/\/(?:m\.)?blog\.naver\.com\/[^"]+)"/g,
      /href="(https?:\/\/(?:m\.)?blog\.naver\.com\/[^"]+)"/g,
    ];

    for (const regex of patterns) {
      let match;
      while ((match = regex.exec(html)) !== null) {
        const url = match[1].replace(/&amp;/g, '&');
        if (url.includes('/search/') || url.includes('BlogSearchList')) continue;
        const normalized = url.replace(/^https?:\/\/m\./, 'https://');
        if (!seen.has(normalized)) {
          seen.add(normalized);
          urls.push(url);
        }
        if (urls.length >= 3) break;
      }
      if (urls.length >= 3) break;
    }

    return urls.slice(0, 3);
  } catch (error) {
    console.error('[NaverAnalyze] URL 추출 실패:', error);
    return [];
  }
}

/**
 * 블로그 URL에서 blogId와 logNo 추출
 */
function parseBlogUrl(url: string): { blogId: string; logNo: string } | null {
  try {
    const parsed = new URL(url);
    // /blogId/logNo 형태
    const pathMatch = parsed.pathname.match(/^\/([^/]+)\/(\d+)$/);
    if (pathMatch) return { blogId: pathMatch[1], logNo: pathMatch[2] };
    // PostView.naver?blogId=xxx&logNo=yyy 형태
    const blogId = parsed.searchParams.get('blogId');
    const logNo = parsed.searchParams.get('logNo');
    if (blogId && logNo) return { blogId, logNo };
    return null;
  } catch {
    return null;
  }
}

/**
 * 네이버 블로그 본문 텍스트 크롤링
 * 모바일 PostView URL을 직접 사용하여 SE 에디터 본문 추출
 */
async function fetchBlogContent(url: string): Promise<string> {
  try {
    const parsed = parseBlogUrl(url);
    if (!parsed) return '';

    // 모바일 PostView URL로 직접 접근 (iframe 우회)
    const postViewUrl = `https://m.blog.naver.com/PostView.naver?blogId=${parsed.blogId}&logNo=${parsed.logNo}`;

    const response = await fetch(postViewUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return '';

    const html = await response.text();

    // 방법 1: SE 에디터 p 태그에서 텍스트 추출 (가장 정확)
    const pTexts = html.match(/<p[^>]*class="se-text[^"]*"[^>]*>[\s\S]*?<\/p>/g);
    if (pTexts && pTexts.length > 0) {
      const text = pTexts
        .map(p => p.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim())
        .filter(t => t.length > 2)
        .join(' ');
      if (text.length > 100) return text;
    }

    // 방법 2: span.se-fs- 패턴
    const spans = html.match(/<span[^>]*class="[^"]*se-fs-[^"]*"[^>]*>[^<]+<\/span>/g);
    if (spans && spans.length > 0) {
      const text = spans
        .map(s => s.replace(/<[^>]+>/g, '').trim())
        .filter(t => t.length > 2)
        .join(' ');
      if (text.length > 100) return text;
    }

    // 방법 3: se-main-container 전체에서 텍스트 추출
    const seIdx = html.indexOf('se-main-container');
    if (seIdx > -1) {
      const chunk = html.slice(seIdx, seIdx + 30000);
      const text = chunk
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length > 100) return text;
    }

    return '';
  } catch (error) {
    console.error('[NaverAnalyze] 본문 크롤링 실패:', error);
    return '';
  }
}

/**
 * 텍스트에서 n-gram 빈도 추출 (2~4글자 한국어 표현)
 */
function extractNgrams(text: string, n: number): Map<string, number> {
  const counts = new Map<string, number>();
  // 한국어 텍스트만 추출
  const koreanText = text.replace(/[^가-힣\s]/g, '');
  const words = koreanText.split(/\s+/).filter(w => w.length >= 2);

  for (let i = 0; i <= words.length - n; i++) {
    const gram = words.slice(i, i + n).join(' ');
    if (gram.length >= 4 && !STOP_WORDS.has(gram.replace(/\s/g, '').slice(0, 3))) {
      counts.set(gram, (counts.get(gram) || 0) + 1);
    }
  }

  return counts;
}

/**
 * 여러 블로그 본문에서 공통으로 자주 등장하는 표현 추출
 */
function findCommonPhrases(texts: string[], keyword: string): string[] {
  if (texts.length === 0) return [];

  // 각 텍스트에서 2-gram, 3-gram 추출
  const allGrams: Map<string, { count: number; docCount: number }> = new Map();

  for (const text of texts) {
    const seenInDoc = new Set<string>();

    for (const n of [1, 2]) {
      const grams = extractNgrams(text, n);
      for (const [gram, count] of grams) {
        if (!seenInDoc.has(gram)) {
          seenInDoc.add(gram);
          const existing = allGrams.get(gram) || { count: 0, docCount: 0 };
          existing.count += count;
          existing.docCount += 1;
          allGrams.set(gram, existing);
        }
      }
    }
  }

  // 2개 이상 문서에서 등장하고, 빈도가 높은 표현 선택
  const commonPhrases: { phrase: string; score: number }[] = [];
  const keywordChars = keyword.replace(/\s/g, '');

  for (const [phrase, { count, docCount }] of allGrams) {
    // 키워드 자체는 제외
    if (phrase.replace(/\s/g, '') === keywordChars) continue;
    // 너무 짧은 건 제외
    if (phrase.replace(/\s/g, '').length < 3) continue;

    // 2개 이상 문서에서 등장한 표현만
    if (docCount >= 2) {
      const score = count * docCount;
      commonPhrases.push({ phrase, score });
    }
  }

  // 점수 순 정렬 → 상위 15개
  commonPhrases.sort((a, b) => b.score - a.score);
  return commonPhrases.slice(0, 15).map(p => p.phrase);
}

/**
 * 메인 함수: 키워드의 상위 노출 블로그 분석 → 공통 표현 반환
 */
export async function analyzeTopBlogs(keyword: string): Promise<{
  phrases: string[];
  analyzedCount: number;
}> {
  try {
    // 1. 상위 블로그 URL 추출
    const urls = await getTopBlogUrls(keyword);
    if (urls.length === 0) {
      return { phrases: [], analyzedCount: 0 };
    }

    // 2. 본문 크롤링 (병렬)
    const contents = await Promise.all(urls.map(fetchBlogContent));
    const validContents = contents.filter(c => c.length > 100);

    if (validContents.length === 0) {
      return { phrases: [], analyzedCount: 0 };
    }

    // 3. 공통 표현 추출
    const phrases = findCommonPhrases(validContents, keyword);

    return {
      phrases,
      analyzedCount: validContents.length,
    };
  } catch (error) {
    console.error('[NaverAnalyze] 분석 실패:', error);
    return { phrases: [], analyzedCount: 0 };
  }
}
