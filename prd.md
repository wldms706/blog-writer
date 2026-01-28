# 블로그 라이터 PRD (Product Requirements Document)

## 제품 개요
뷰티샵 원장님들을 위한 AI 블로그 글 자동 생성 SaaS 서비스

### 핵심 가치
- "규칙은 시스템이 책임집니다" - 사용자는 키워드만 입력하면 SEO 최적화된 블로그 글 자동 생성
- 실력을 직접 말하지 않고, 판단 기준을 제시하여 실력이 드러나는 글 작성

### 타겟 사용자
- 뷰티샵 (피부관리실, 네일샵, 헤어샵 등) 원장님
- 블로그 마케팅이 필요하지만 글쓰기에 시간을 쓰기 어려운 분들

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.1.4 (App Router) |
| 스타일링 | Tailwind CSS v4 |
| AI | Google Gemini 2.0 Flash API |
| 인증/DB | Supabase (Auth + PostgreSQL) |
| 배포 | Vercel |
| 결제 | (예정) 토스페이먼츠 or Stripe |

---

## 완료된 기능 (Stage 1)

### 1. 글 생성 기능 ✅
- 7단계 마법사 폼 (업종 → 키워드 → 주제 → 목적 → 독자상태 → 확인 → 생성)
- Gemini 2.0 Flash API 연동
- 1,500자 이상 SEO 최적화 글 생성
- 마크다운 없는 순수 텍스트 출력
- 복사하기 기능

### 2. Supabase 인증 시스템 ✅
- 이메일/비밀번호 회원가입 및 로그인
- 미들웨어 기반 인증 보호
- 로그아웃 기능
- 세션 관리

### 3. 데이터베이스 ✅
- **profiles**: 사용자 정보 + 플랜 + 사용량
- **histories**: 생성된 글 히스토리
- **settings**: 사용자 설정 (기본 업종, 키워드 프리셋)
- RLS (Row Level Security) 적용 - 본인 데이터만 접근

### 4. 사용량 제한 ✅
- 무료 플랜: 하루 3회 생성
- 유료 플랜: 무제한 (결제 시스템 구현 후 활성화)
- 날짜 변경 시 자동 리셋

### 5. UI/UX ✅
- 반응형 레이아웃 (모바일/데스크톱)
- 사이드바 + 탑바 구조
- 로딩 애니메이션 + UX 메시지
- 에러 핸들링 (재시도 UI)

---

## 진행 예정 (Stage 2)

### 1. 소셜 로그인 🔜
- [ ] 카카오 로그인
- [ ] 네이버 로그인
- [ ] Supabase OAuth Provider 설정

### 2. 결제 시스템 🔜
- [ ] 토스페이먼츠 or Stripe 연동
- [ ] 구독 플랜 (월 9,900원)
- [ ] 결제 성공 시 plan: 'paid' 업데이트
- [ ] 구독 취소/환불 처리

### 3. 랜딩 페이지 🔜
- [ ] 서비스 소개
- [ ] 가격 정책 안내
- [ ] 데모 영상/스크린샷
- [ ] CTA (회원가입 유도)

### 4. 스마트 키워드 시스템 🔜 (핵심 기능)

#### 워크플로우
```
1. 지역 입력 → 2. 블로그 지수 체크 → 3. 맞춤 키워드 추천 → 4. 글 생성
```

#### 4-1. 지역 설정
- [ ] 회원가입/설정에서 샵 위치 입력 (시/구/동)
- [ ] 예: 서울시 강남구 신사동
- [ ] DB 저장: profiles 테이블에 location 필드 추가

#### 4-2. 블로그 지수 체크
- [ ] 네이버 블로그 URL 입력받기
- [ ] 블로그 지수 분석 (예상 지표):
  - 방문자 수 추정
  - 글 발행 빈도
  - 이웃 수
  - 블로그 나이
- [ ] 지수 등급: 상/중/하 판정

#### 4-3. 키워드 추천 로직
```
블로그 지수 높음 (상) → "강남 피부관리" (시/구 단위)
블로그 지수 중간 (중) → "신사동 피부관리" (동 단위)
블로그 지수 낮음 (하) → "신사동 여드름관리" (동 + 세부 시술)
```

- [ ] 지수가 낮을수록 → 좁은 지역 + 세부 키워드 조합
- [ ] 지수가 높을수록 → 넓은 지역 + 경쟁 키워드 도전
- [ ] AI가 업종 + 지역 + 지수 조합으로 최적 키워드 5개 추천

#### 4-4. 키워드 분석 정보 제공
- [ ] 예상 검색량 (월간)
- [ ] 경쟁도 (상/중/하)
- [ ] 추천 이유 설명
- [ ] "이 키워드로 작성하기" 버튼

### 5. 자동 보정 시스템 🔜

#### 글 품질 자동 체크
- [ ] 키워드 밀도 체크 (3~5% 권장)
- [ ] 금지 표현 필터링 ("최고", "1등", "예약하세요" 등)
- [ ] 반복 단어 감지 (10회 이상 반복 경고)
- [ ] 글자수 체크 (1,500자 이상)

#### 자동 수정 제안
- [ ] 문제 발견 시 자동 수정 옵션 제공
- [ ] 수정 전/후 비교 미리보기
- [ ] "규칙은 시스템이 책임집니다" - 사용자는 클릭만

### 6. 추가 기능 (선택)
- [ ] 글 수정/재생성 기능
- [ ] 여러 버전 비교
- [ ] 글 내보내기 (워드, 한글)
- [ ] 글 예약 발행 (블로그 API 연동)
- [ ] 경쟁사 블로그 분석

---

## 새로운 워크플로우 (개선안)

```
[기존] 업종 → 키워드 직접입력 → 주제 → 목적 → 독자상태 → 확인 → 생성

[개선]
1. 지역 확인 (설정에서 가져오기)
2. 블로그 지수 체크 (첫 사용 시)
3. AI 키워드 추천 (지수 기반)
4. 키워드 선택
5. 주제/목적/독자상태 자동 추천
6. 확인 → 생성
7. 품질 체크 → 자동 보정
8. 완료
```

---

## 플랜 및 가격

| 플랜 | 가격 | 기능 |
|------|------|------|
| 무료 | 0원 | 하루 3회 생성 |
| 프로 | 월 9,900원 | 무제한 생성 |

---

## 환경 변수

```env
# Gemini API
GEMINI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# (예정) 결제
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
```

---

## DB 스키마

### profiles
```sql
create table profiles (
  id uuid references auth.users primary key,
  email text,
  plan text default 'free',  -- 'free' | 'paid'
  daily_usage int default 0,
  last_usage_date date,
  -- 지역 정보 (Stage 2 추가)
  location_city text,        -- 시/도 (예: 서울시)
  location_district text,    -- 구 (예: 강남구)
  location_neighborhood text, -- 동 (예: 신사동)
  -- 블로그 정보 (Stage 2 추가)
  blog_url text,             -- 네이버 블로그 URL
  blog_index_level text,     -- 'high' | 'medium' | 'low'
  blog_index_checked_at timestamptz,
  created_at timestamptz default now()
);
```

### histories
```sql
create table histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  keyword text not null,
  business_category text,
  topic text,
  purpose text,
  content text not null,
  created_at timestamptz default now()
);
```

### settings
```sql
create table settings (
  user_id uuid references profiles(id) on delete cascade primary key,
  default_business_category text,
  keyword_presets text[] default '{}'
);
```

---

## 파일 구조

```
src/
├── app/
│   ├── (app)/              # 인증 필요 영역
│   │   ├── layout.tsx      # 메인 레이아웃 (사이드바+탑바)
│   │   ├── page.tsx        # 홈 (글 생성 마법사)
│   │   ├── history/        # 히스토리 페이지
│   │   ├── settings/       # 설정 페이지
│   │   └── LogoutButton.tsx
│   ├── (auth)/             # 인증 페이지
│   │   ├── layout.tsx
│   │   ├── login/
│   │   └── signup/
│   └── api/
│       └── generate/       # Gemini API 호출
├── components/
│   └── steps/              # 7단계 마법사 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # 브라우저용
│   │   └── server.ts       # 서버용
│   ├── storage.ts          # DB CRUD
│   └── usage.ts            # 사용량 관리
├── middleware.ts           # 인증 미들웨어
└── data/
    └── constants.ts        # 업종/주제/목적 등 상수
```

---

## 배포 URL
- Production: https://blog-writer-ebon.vercel.app
- GitHub: https://github.com/wldms706/blog-writer

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-01-28 | PRD 업데이트: 스마트 키워드 시스템 + 자동 보정 시스템 추가 |
| 2026-01-28 | Stage 1 완료: Supabase 인증 + DB + 사용량 제한 |
| 2026-01-28 | Gemini 2.0 Flash API 연동 |
| 2026-01-28 | 초기 버전 배포 |
