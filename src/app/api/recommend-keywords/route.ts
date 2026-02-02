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

// 업종+주제별 키워드 매핑 (선택한 주제에 맞는 키워드 우선 추천)
const TOPIC_KEYWORDS: Record<string, Record<string, string[]>> = {
  'semi-permanent': {
    'hairstroke': ['헤어스트로크', '헤어스트로크눈썹', '자연눈썹문신'],
    'machine-feathering': ['머신페더링', '페더링눈썹', '자연눈썹'],
    'embo': ['엠보눈썹', '엠보', '수작업눈썹'],
    'machine-shading': ['머신쉐딩', '쉐딩눈썹', '음영눈썹'],
    'suji': ['수지눈썹', '수지기법', '자연눈썹'],
    'combo': ['콤보눈썹', '복합기법', '엠보쉐딩'],
    'eyeliner': ['아이라인', '아이라인문신', '눈매교정'],
    'hairline': ['헤어라인', '헤어라인문신', '이마라인'],
    'lips': ['입술반영구', '입술문신', '립블러셔'],
    'retouch': ['눈썹리터치', '반영구수정', '눈썹보정'],
  },
  'skin': {
    'acne': ['여드름관리', '여드름피부', '트러블케어'],
    'pigmentation': ['색소침착', '기미관리', '잡티케어'],
    'wrinkle': ['주름관리', '안티에이징', '노화관리'],
    'pore': ['모공관리', '모공축소', '피지관리'],
    'hydration': ['수분관리', '보습케어', '건조피부'],
    'sensitive': ['민감성피부', '예민피부', '진정케어'],
    'lifting': ['리프팅', '탄력관리', '처짐개선'],
    'diet': ['다이어트', '체중관리', '슬리밍'],
    'body-shape': ['체형관리', '바디라인', '체형교정'],
  },
  'scalp': {
    'hair-loss-type': ['탈모유형', '탈모종류', '탈모원인'],
    'scalp-type': ['두피타입', '두피유형', '지성두피'],
    'prevention': ['탈모예방', '탈모방지', '두피건강'],
    'scaling': ['두피스케일링', '두피각질', '두피클렌징'],
    'nutrition': ['모발영양', '모발케어', '헤어트리트먼트'],
  },
  'nail': {
    'gel': ['젤네일', '젤네일아트', '젤폴리쉬'],
    'care': ['네일케어', '손톱관리', '큐티클케어'],
    'art': ['네일아트', '네일디자인', '네일트렌드'],
    'pedicure': ['페디큐어', '발관리', '발톱케어'],
    'repair': ['손상네일', '네일복구', '손톱보강'],
  },
  'hair': {
    'cut': ['헤어커트', '커트스타일', '헤어스타일'],
    'perm': ['펌', '디지털펌', '볼륨펌'],
    'color': ['염색', '헤어컬러', '컬러링'],
    'clinic': ['헤어클리닉', '손상모복구', '트리트먼트'],
    'styling': ['헤어스타일링', '셀프스타일링', '스타일링팁'],
  },
  'makeup': {
    'wedding': ['웨딩메이크업', '신부화장', '본식메이크업'],
    'photo': ['촬영메이크업', '화보메이크업', '프로필메이크업'],
    'daily': ['데일리메이크업', '일상메이크업', '출근메이크업'],
    'self': ['셀프메이크업', '메이크업팁', '메이크업초보'],
    'correction': ['커버메이크업', '피부보정', '결점커버'],
  },
  'waxing': {
    'face': ['페이스왁싱', '얼굴왁싱', '인중왁싱'],
    'body': ['바디왁싱', '팔왁싱', '다리왁싱'],
    'brazilian': ['브라질리언왁싱', '브라질리언', 'VIO왁싱'],
    'aftercare': ['왁싱애프터케어', '왁싱후관리', '인그로운헤어'],
  },
  'eyelash': {
    'extension': ['속눈썹연장', '래쉬익스텐션', '속눈썹붙이기'],
    'perm': ['속눈썹펌', '래쉬펌', '속눈썹컬'],
    'lifting': ['래쉬리프팅', '속눈썹리프팅', '눈매업'],
    'care': ['속눈썹케어', '자연속눈썹', '속눈썹영양'],
  },
};

// 공통 주제 키워드 (모든 업종에 적용)
const COMMON_TOPIC_KEYWORDS: Record<string, string[]> = {
  'philosophy': ['운영철학', '샵철학', '뷰티철학'],
  'knowledge': ['전문지식', '뷰티정보', '뷰티팁'],
  'process': ['진행과정', '시술과정', '관리과정'],
  'criteria': ['선택기준', '선택방법', '고르는법'],
  'concern': ['고민해소', '궁금증해결', 'FAQ'],
  'daily': ['일상이야기', '샵일상', '데일리'],
};

// 주제 키워드 조회 함수
function getTopicKeywords(businessCategory: string, topic: string | null): string[] {
  if (!topic) return [];

  // 업종별 주제 키워드 먼저 확인
  const categoryTopics = TOPIC_KEYWORDS[businessCategory];
  if (categoryTopics && categoryTopics[topic]) {
    return categoryTopics[topic];
  }

  // 공통 주제 키워드 확인
  if (COMMON_TOPIC_KEYWORDS[topic]) {
    return COMMON_TOPIC_KEYWORDS[topic];
  }

  return [];
}

// 블덱스 지수를 키워드 전략 그룹으로 매핑
function getKeywordStrategy(blogIndexLevel: string): 'broad' | 'medium' | 'narrow' | 'niche' {
  // 최적화 1~3: 넓은 지역 (구/시 단위)
  if (['optimal1', 'optimal2', 'optimal3'].includes(blogIndexLevel)) {
    return 'broad';
  }
  // 준최적화 상위 5~7: 동 단위
  if (['sub5', 'sub6', 'sub7'].includes(blogIndexLevel)) {
    return 'medium';
  }
  // 준최적화 하위 1~4: 동 + 세부 키워드 조합
  if (['sub1', 'sub2', 'sub3', 'sub4'].includes(blogIndexLevel)) {
    return 'narrow';
  }
  // 일반(sub0): 초세부 틈새 키워드
  return 'niche';
}

function getStrategyDescription(strategy: 'broad' | 'medium' | 'narrow' | 'niche'): string {
  switch (strategy) {
    case 'broad': return '시/구 단위의 넓은 지역 키워드로 경쟁 가능';
    case 'medium': return '동 + 시/구 단위 키워드 모두 경쟁 가능';
    case 'narrow': return '동 + 세부 키워드 조합 (예: 역삼동여자눈썹문신)';
    case 'niche': return '초세부 틈새 키워드 (예: 신사동망한눈썹문신)';
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { businessCategory, topic } = await request.json();

    if (!businessCategory) {
      return NextResponse.json({ error: '업종을 선택해주세요.' }, { status: 400 });
    }

    // 사용자 프로필에서 지역 정보와 블로그 지수 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('location_city, location_district, location_neighborhood, blog_index_level')
      .eq('id', user.id)
      .single();

    // 프로필이 없으면 (신규 사용자) 생성 시도
    if (profileError || !profile) {
      console.log('Profile not found, attempting to create for user:', user.id);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id, email: user.email });

      if (insertError) {
        console.error('Profile insert error:', insertError);
      }

      // 프로필 생성 후에도 설정 필요 안내
      return NextResponse.json({
        keywords: [],
        message: '설정에서 지역 정보와 블로그 지수를 입력해주세요.',
        needsLocation: true,
      });
    }

    const locationCity = profile.location_city || '';
    const locationDistrict = profile.location_district || '';
    const locationNeighborhood = profile.location_neighborhood || '';
    const blogIndexLevel = profile.blog_index_level || 'medium';

    // 지역 정보가 없으면 기본 메시지
    if (!locationCity && !locationDistrict && !locationNeighborhood) {
      return NextResponse.json({
        keywords: [],
        message: '설정에서 지역 정보를 입력해주세요.',
        needsLocation: true,
      });
    }

    // 블로그 지수가 없으면
    if (!profile.blog_index_level) {
      return NextResponse.json({
        keywords: [],
        message: '설정에서 블로그 지수를 선택해주세요.',
        needsBlogIndex: true,
      });
    }

    const businessKeywords = BUSINESS_KEYWORDS[businessCategory] || [];
    const topicKeywords = getTopicKeywords(businessCategory, topic);
    const strategy = getKeywordStrategy(blogIndexLevel);
    const strategyDesc = getStrategyDescription(strategy);

    // 동 정보가 없을 때 구 내 실제 동네를 찾아달라는 안내
    const neighborhoodGuide = locationNeighborhood
      ? `사용자가 입력한 동: ${locationNeighborhood}`
      : `동 정보가 없음. 반드시 ${locationDistrict}에 실제로 존재하는 동 이름을 사용하세요.`;

    // 주제 정보 안내
    const topicGuide = topic && topicKeywords.length > 0
      ? `\n★★★ 선택한 주제: ${topic} ★★★\n- 주제 관련 키워드: ${topicKeywords.join(', ')}\n- 반드시 이 주제에 맞는 키워드를 우선 추천하세요!`
      : '';

    // Gemini에게 키워드 추천 요청
    const prompt = `당신은 네이버 블로그 SEO 전문가입니다.

사용자 정보:
- 업종: ${businessCategory}
- 업종 관련 키워드: ${businessKeywords.join(', ')}
- 지역: ${locationCity} ${locationDistrict}
- ${neighborhoodGuide}
- 블로그 지수: ${blogIndexLevel} (블덱스 기준)
${topicGuide}

현재 키워드 전략: ${strategyDesc}

블로그 지수에 따른 키워드 전략:
- 최적1~3: 시/구 단위의 넓은 지역 키워드 (예: "${locationDistrict}${topicKeywords[0] || '피부관리'}", "${locationCity}${topicKeywords[0] || '눈썹문신'}")
- 준최5~7: 동 단위 + 시/구 단위 섞어서 (예: "잠실동${topicKeywords[0] || '눈썹문신'}", "${locationDistrict}${topicKeywords[0] || '피부관리'}")
- 준최1~4: 반드시 동 단위 + 세부 키워드만 (예: "잠실동여자${topicKeywords[0] || '눈썹문신'}", "방이동자연${topicKeywords[0] || '눈썹'}"). 시/구 단위 금지!
- 일반: 초세부 틈새 키워드 (예: "잠실동망한${topicKeywords[0] || '눈썹문신'}", "방이동${topicKeywords[0] || '눈썹문신'}복구")

★★★ 매우 중요 ★★★
1. ${locationDistrict}에 실제로 존재하는 동 이름을 반드시 사용하세요.
2. 예를 들어 송파구면 "잠실동, 방이동, 문정동, 가락동, 석촌동" 등 실제 동 이름을 사용.
3. 서북구면 "불당동, 성정동, 두정동, 쌍용동" 등 실제 동 이름을 사용.
4. 강남구면 "역삼동, 삼성동, 청담동, 논현동" 등 실제 동 이름을 사용.
5. 키워드는 반드시 붙여쓰기 (공백 없음)
6. 준최1~4, 일반에서는 절대 시/구 단위 키워드 사용 금지!
${topic ? `7. 선택한 주제(${topic})에 맞는 키워드를 우선 추천하세요! (예: 아이라인 주제면 "눈썹문신" 대신 "아이라인" 키워드 사용)` : ''}

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
        keywords: generateFallbackKeywords(businessCategory, locationNeighborhood, locationDistrict, blogIndexLevel, topic),
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
      keywords: generateFallbackKeywords(businessCategory, locationNeighborhood, locationDistrict, blogIndexLevel, topic),
      message: 'AI 추천 (기본값)',
    });

  } catch (error) {
    console.error('Recommend keywords error:', error);
    return NextResponse.json({ error: '키워드 추천 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 세부 키워드 접두사 (준최 1~4, 일반용)
const DETAIL_PREFIXES = ['여자', '남자', '자연', '망한', '복구', '실패', '처진', '교정'];

// 기본 키워드 생성 함수
function generateFallbackKeywords(
  businessCategory: string,
  neighborhood: string,
  district: string,
  blogIndexLevel: string,
  topic: string | null = null
) {
  // 주제 키워드가 있으면 우선 사용, 없으면 업종 키워드 사용
  const topicKws = getTopicKeywords(businessCategory, topic);
  const baseKeywords = topicKws.length > 0 ? topicKws : (BUSINESS_KEYWORDS[businessCategory] || ['관리']);
  const strategy = getKeywordStrategy(blogIndexLevel);

  // 전략에 따라 키워드 형태 결정
  if (strategy === 'broad') {
    // 최적: 구 단위
    return baseKeywords.slice(0, 5).map((kw) => ({
      keyword: `${district}${kw}`,
      reason: topic ? `${topic} 주제 구 단위 키워드` : '구 단위 경쟁 키워드',
    }));
  } else if (strategy === 'medium') {
    // 준최 5~7: 동 + 시/구 혼합
    const keywords = [];
    // 동 단위 3개
    for (let i = 0; i < 3 && i < baseKeywords.length; i++) {
      keywords.push({
        keyword: `${neighborhood}${baseKeywords[i]}`,
        reason: topic ? `${topic} 주제 동 단위 키워드` : '동 단위 안정 키워드',
      });
    }
    // 구 단위 2개
    for (let i = 0; i < 2 && i + 3 < baseKeywords.length; i++) {
      keywords.push({
        keyword: `${district}${baseKeywords[i + 3]}`,
        reason: topic ? `${topic} 주제 구 단위 키워드` : '구 단위 경쟁 키워드',
      });
    }
    return keywords;
  } else if (strategy === 'narrow') {
    // 준최 1~4: 동 + 세부
    return baseKeywords.slice(0, 5).map((kw, idx) => ({
      keyword: `${neighborhood}${DETAIL_PREFIXES[idx % DETAIL_PREFIXES.length]}${kw}`,
      reason: topic ? `${topic} 주제 세부 키워드` : '동 + 세부 키워드 조합',
    }));
  } else {
    // 일반: 초세부 틈새
    const nicheKeywords = ['망한', '실패', '복구', '교정', '처진'];
    return baseKeywords.slice(0, 5).map((kw, idx) => ({
      keyword: `${neighborhood}${nicheKeywords[idx % nicheKeywords.length]}${kw}`,
      reason: topic ? `${topic} 주제 틈새 키워드` : '초세부 틈새 키워드',
    }));
  }
}
