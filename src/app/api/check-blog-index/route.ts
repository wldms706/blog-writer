import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: NextRequest) {
  // 인증 확인
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { blogUrl } = await request.json();

    if (!blogUrl) {
      return NextResponse.json({ error: '블로그 URL이 필요합니다.' }, { status: 400 });
    }

    // 네이버 블로그 URL 검증
    const isNaverBlog = blogUrl.includes('blog.naver.com');
    if (!isNaverBlog) {
      return NextResponse.json({ error: '현재 네이버 블로그만 지원됩니다.' }, { status: 400 });
    }

    // 블로그 ID 추출
    const blogIdMatch = blogUrl.match(/blog\.naver\.com\/([^/?]+)/);
    const blogId = blogIdMatch ? blogIdMatch[1] : null;

    if (!blogId) {
      return NextResponse.json({ error: '올바른 블로그 URL 형식이 아닙니다.' }, { status: 400 });
    }

    // Gemini에게 블로그 분석 요청
    // 실제로는 블로그 페이지를 크롤링하거나 네이버 API를 사용해야 하지만,
    // 여기서는 Gemini에게 블로그 ID 기반으로 일반적인 추정을 하도록 합니다.
    const prompt = `당신은 네이버 블로그 SEO 전문가입니다.

블로그 URL: ${blogUrl}
블로그 ID: ${blogId}

이 블로그의 예상 지수를 다음 중 하나로 판단해주세요:
- high: 블로그 지수가 높음 (일 방문자 1000명 이상 예상, 오래된 블로그)
- medium: 블로그 지수가 보통 (일 방문자 100-1000명 예상)
- low: 블로그 지수가 낮음 (일 방문자 100명 미만 예상, 신규 블로그)

참고: 블로그 ID가 짧고 간단하면 오래된 블로그일 가능성이 높고, 숫자가 많거나 복잡하면 최근에 만든 블로그일 가능성이 높습니다.

반드시 다음 JSON 형식으로만 응답하세요:
{"level": "high" 또는 "medium" 또는 "low", "reason": "판단 이유"}`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      // API 실패 시 기본값으로 'medium' 반환
      return NextResponse.json({
        level: 'medium',
        reason: '블로그 분석 API 오류로 기본값 적용',
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSON 파싱 시도
    try {
      // JSON 부분만 추출
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (['high', 'medium', 'low'].includes(result.level)) {
          return NextResponse.json(result);
        }
      }
    } catch {
      console.error('JSON parse error:', generatedText);
    }

    // 파싱 실패 시 텍스트에서 레벨 추출 시도
    if (generatedText.includes('high')) {
      return NextResponse.json({ level: 'high', reason: 'AI 분석 결과' });
    } else if (generatedText.includes('low')) {
      return NextResponse.json({ level: 'low', reason: 'AI 분석 결과' });
    }

    // 기본값
    return NextResponse.json({ level: 'medium', reason: '기본값 적용' });

  } catch (error) {
    console.error('Check blog index error:', error);
    return NextResponse.json({ error: '블로그 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
