import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// 업종별 세부 시술 키워드
const BUSINESS_KEYWORDS: Record<string, string[]> = {
  'semi-permanent': ['눈썹문신', '반영구', '눈썹반영구', '자연눈썹', '아이라인', '헤어라인', '입술반영구'],
  'scalp': ['두피관리', '탈모관리', '두피케어', '탈모케어', '두피스케일링', '탈모예방'],
  'skin': ['피부관리', '피부관리실', '피부케어', '페이셜', '여드름관리', '모공관리', '리프팅', '피부과'],
  'nail': ['네일', '네일샵', '젤네일', '네일아트', '손톱관리', '발톱관리'],
  'hair': ['헤어샵', '미용실', '커트', '펌', '염색', '헤어스타일링'],
  'makeup': ['메이크업', '웨딩메이크업', '촬영메이크업', '셀프메이크업'],
  'waxing': ['왁싱', '브라질리언왁싱', '페이스왁싱', '바디왁싱'],
};

// 블덱스 지수를 키워드 전략 그룹으로 매핑
function getKeywordStrategy(blogIndexLevel: string): 'broad' | 'medium' | 'narrow' {
  // 최적화 1~3: 넓은 지역 (구/시 단위)
  if (['optimal1', 'optimal2', 'optimal3'].includes(blogIndexLevel)) {
    return 'broad';
  }
  // 준최적화 상위 4~7: 동 단위
  if (['sub4', 'sub5', 'sub6', 'sub7'].includes(blogIndexLevel)) {
    return 'medium';
  }
  // 준최적화 하위 0~3: 동 + 세부시술
  return 'narrow';
}

function getStrategyDescription(strategy: 'broad' | 'medium' | 'narrow'): string {
  switch (strategy) {
    case 'broad': return '시/구 단위의 넓은 지역 키워드로 경쟁 가능';
    case 'medium': return '동 단위의 중간 지역 키워드 추천';
    case 'narrow': return '동 + 세부시술 조합의 좁은 틈새 키워드';
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { businessCategory } = await request.json();

    if (!businessCategory) {
      return NextResponse.json({ error: '업종을 선택해주세요.' }, { status: 400 });
    }

    // 사용자 프로필에서 지역 정보와 블로그 지수 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('location_city, location_district, location_neighborhood, blog_index_level')
      .eq('id', user.id)
      .single();

    const locationCity = profile?.location_city || '';
    const locationDistrict = profile?.location_district || '';
    const locationNeighborhood = profile?.location_neighborhood || '';
    const blogIndexLevel = profile?.blog_index_level || 'medium';

    // 지역 정보가 없으면 기본 메시지
    if (!locationCity && !locationDistrict && !locationNeighborhood) {
      return NextResponse.json({
        keywords: [],
        message: '설정에서 지역 정보를 입력해주세요.',
        needsLocation: true,
      });
    }

    // 블로그 지수가 없으면
    if (!profile?.blog_index_level) {
      return NextResponse.json({
        keywords: [],
        message: '설정에서 블로그 지수를 선택해주세요.',
        needsBlogIndex: true,
      });
    }

    const businessKeywords = BUSINESS_KEYWORDS[businessCategory] || [];
    const strategy = getKeywordStrategy(blogIndexLevel);
    const strategyDesc = getStrategyDescription(strategy);

    // Gemini에게 키워드 추천 요청
    const prompt = `당신은 네이버 블로그 SEO 전문가입니다.

사용자 정보:
- 업종: ${businessCategory}
- 업종 관련 키워드: ${businessKeywords.join(', ')}
- 지역: ${locationCity} ${locationDistrict} ${locationNeighborhood}
- 블로그 지수: ${blogIndexLevel} (블덱스 기준)

현재 키워드 전략: ${strategyDesc}

블로그 지수에 따른 키워드 전략:
- 최적1~3 (높음): 시/구 단위의 넓은 지역 키워드로 경쟁 가능 (예: "${locationDistrict}피부관리", "${locationCity}눈썹문신")
- 준최4~7 (중간): 동 단위의 중간 지역 키워드 추천 (예: "${locationNeighborhood}피부관리", "${locationNeighborhood}눈썹문신")
- 준최0~3 (낮음): 동 + 세부시술 조합의 좁은 틈새 키워드 (예: "${locationNeighborhood}여드름관리", "${locationNeighborhood}자연눈썹")

위 전략에 맞춰 최적의 검색 키워드 5개를 추천해주세요.
각 키워드는 실제 네이버에서 검색될 수 있는 형태여야 합니다.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "keywords": [
    {"keyword": "키워드1", "reason": "추천 이유"},
    {"keyword": "키워드2", "reason": "추천 이유"},
    {"keyword": "키워드3", "reason": "추천 이유"},
    {"keyword": "키워드4", "reason": "추천 이유"},
    {"keyword": "키워드5", "reason": "추천 이유"}
  ]
}`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      // API 실패 시 기본 키워드 생성
      return NextResponse.json({
        keywords: generateFallbackKeywords(businessCategory, locationNeighborhood, locationDistrict, blogIndexLevel),
        message: 'AI 추천 (기본값)',
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSON 파싱
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (result.keywords && Array.isArray(result.keywords)) {
          return NextResponse.json({
            keywords: result.keywords,
            blogIndexLevel,
            location: `${locationCity} ${locationDistrict} ${locationNeighborhood}`.trim(),
          });
        }
      }
    } catch {
      console.error('JSON parse error:', generatedText);
    }

    // 파싱 실패 시 기본 키워드
    return NextResponse.json({
      keywords: generateFallbackKeywords(businessCategory, locationNeighborhood, locationDistrict, blogIndexLevel),
      message: 'AI 추천 (기본값)',
    });

  } catch (error) {
    console.error('Recommend keywords error:', error);
    return NextResponse.json({ error: '키워드 추천 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 기본 키워드 생성 함수
function generateFallbackKeywords(
  businessCategory: string,
  neighborhood: string,
  district: string,
  blogIndexLevel: string
) {
  const baseKeywords = BUSINESS_KEYWORDS[businessCategory] || ['관리'];
  const strategy = getKeywordStrategy(blogIndexLevel);

  // 전략에 따라 지역 범위 결정
  const location = strategy === 'broad' ? district : neighborhood;

  return baseKeywords.slice(0, 5).map((kw) => ({
    keyword: `${location}${kw}`,
    reason: strategy === 'broad'
      ? '구 단위 경쟁 키워드'
      : strategy === 'narrow'
      ? '동 + 세부시술 틈새 키워드'
      : '동 단위 안정 키워드',
  }));
}
