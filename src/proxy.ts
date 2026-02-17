import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup');

  const isPublicPage =
    isAuthPage ||
    pathname === '/' ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth');

  // 리다이렉트 시 세션 쿠키를 함께 전달하는 헬퍼
  function redirectWithCookies(destination: string) {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // 로그인 + 루트(랜딩) 접속 → 대시보드로
  if (user && pathname === '/') {
    return redirectWithCookies('/write');
  }

  // 로그인 + 인증 페이지 → 대시보드로
  if (user && isAuthPage) {
    return redirectWithCookies('/write');
  }

  // 비로그인 + 보호된 페이지 → 로그인으로
  if (!user && !isPublicPage) {
    return redirectWithCookies('/login');
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
