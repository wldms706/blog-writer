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
| 프레임워크 | Next.js 16.1.6 (App Router + Turbopack) |
| 스타일링 | Tailwind CSS v4 |
| AI | Google Gemini 2.0 Flash API |
| 인증/DB | Supabase (Auth + PostgreSQL) |
| 배포 | Vercel (Hobby Plan) |
| 결제 | 토스페이먼츠 |
| 폰트 | Pretendard (한국어) + DM Serif Display (영문 악센트) |

---

## 디자인 시스템

### 컬러 팔레트 (Bold Tricolor)
| 요소 | 색상 |
|------|------|
| Primary Blue | #3B5CFF (로얄블루) |
| Black | #000000 |
| White | #FFFFFF |
| Background | #FFFFFF |
| Card Background | #F5F5F5 |

### 디자인 특징
- **버튼**: pill 형태 (rounded-full)
- **카드**: 테두리 없이 색상 블록 + shadow
- **헤더/푸터**: 검정 배경
- **헤딩**: font-black (900)
- **뱃지/태그**: 솔리드 컬러 pill
- **선택 카드**: 솔리드 블루 배경 (선택 시)

---

## 완료된 기능

### 1. 글 생성 기능 ✅
- **SEO 글**: 10~11단계 마법사 (업종에 따라 다름)
- **브랜딩 글**: 7~8단계 마법사 (브랜딩 종류에 따라 다름)
- Gemini 2.0 Flash API 연동
- 1,500자 이상 SEO 최적화 글 생성
- 마크다운 없는 순수 텍스트 출력
- 복사하기 기능
- **편집가이드 시스템**: `[편집가이드: 사진 넣어주세요]` 마커 자동 삽입
- **매장 정보 자동 포함**: 주소/영업시간/연락처/주차 → 글 마지막에 자연스럽게 삽입
- **사진 재사용 금지**: "이전 글에서 사용한 사진은 절대 재사용하지 마세요" 경고

### 2. Supabase 인증 시스템 ✅
- **Google 소셜 로그인** ✅
- **카카오 소셜 로그인** ✅
- 미들웨어 기반 인증 보호
- 로그아웃 기능
- 세션 관리

### 3. 데이터베이스 ✅
- **profiles**: 사용자 정보 + 플랜 + 사용량 + 지역 + 블로그 지수 + 활동 추적
- **histories**: 생성된 글 히스토리 + 블로그 URL + 네이버 순위
- **settings**: 사용자 설정 (기본 업종)
- **subscriptions**: 구독/결제 정보
- RLS (Row Level Security) 적용

### 4. 결제 시스템 ✅
- **토스페이먼츠** 연동 완료
- 구독 플랜 2종:
  - Pro (반영구): 월 19,900원
  - Pro (일반): 월 14,900원
- 결제 성공/실패 페이지
- 구독 관리 (설정 페이지에서 해지 가능)
- 관리자 무제한 사용

### 5. 사용량 제한 ✅
- 무료 플랜: 하루 3회 (매일 자정 리셋)
- 유료 플랜: 무제한
- 관리자/화이트리스트: 무제한

### 6. UI/UX ✅
- **Bold Tricolor 디자인** (파란+검정+흰색)
- 반응형 레이아웃 (모바일/데스크톱)
- 모바일 최적화 (사이드바 숨김, 터치 친화적)
- 검정 헤더 + 검정 푸터
- 검정/블루 사이드바 카드
- 로딩 애니메이션 + UX 메시지
- 에러 핸들링 (재시도 UI)

### 7. 랜딩 페이지 ✅
- **Section 1 (Black)**: 히어로 — 대형 타이포 "블로그 라이터" + CTA
- **Section 2 (Blue)**: 기능 소개 — floating pill 태그들
- **Section 3 (White)**: 이렇게 작동합니다 — 3단계 설명
- 검정 푸터

### 8. 스마트 키워드 추천 시스템 ✅

#### 8-1. 지역 설정 ✅
- 설정 페이지에서 샵 위치 입력 (시/구/동)
- 동 정보 없어도 구 내 실제 동네 자동 탐색

#### 8-2. 블로그 지수 시스템 (블덱스 기준) ✅
- **최적화 (1~3)**: 구/시 단위 경쟁 키워드 가능
- **준최적화 5~7**: 동 + 시/구 단위 키워드 혼합 추천
- **준최적화 1~4**: 동 + 세부 키워드 조합
- **일반 (구 준최0)**: 초세부 틈새 키워드

#### 8-3. AI 키워드 추천 ✅
- 지역 + 업종 + 블로그 지수 기반 맞춤 키워드 5개 추천
- Gemini AI를 통한 실시간 키워드 분석
- 추천 이유 설명 포함
- 직접 입력 옵션 제공
- 키워드 유효성 검사 (자모 분리 체크, 특수문자 체크)

### 9. AI 제목 추천 시스템 ✅
- 글 생성 전 AI가 제목 후보 3개 추천
- 클릭률 높이는 제목 스타일 (궁금증/수치화/자극적)
- 직접 입력 옵션 제공
- 선택된 제목이 본문 생성 시 자동 적용

### 10. 규제 업종 보호 규칙 ✅

#### 반영구/두피문신 업종 규칙 ✅
- 1인칭 표현 절대 금지 ("저는", "제가", "저희")
- 숫자 소제목 구조 ("1. 소제목" 형태)
- 전문 정보 전달체 프롬프트
- **외부링크 첨부 금지** ✅
- **네이버지도 첨부 금지** ✅
- 매장 정보는 수동태로 표현 ("운영되고 있다", "완비되어 있다")

### 11. 키워드 배치 규칙 ✅
- 제목에 키워드 1회 필수
- 본문 첫 2~3문장 이내에 1회 필수
- 본문 중간에 2회 분산 배치
- 본문 마지막 2~3문장 이내에 1회 필수
- **합계: 최소 4회, 최대 6회** (3회 이하 거부, 7회 이상 거부)
- 대형 키워드: 5~7회 (8회 이상 절대 금지)

### 12. 브랜딩 글 작성 기능 ✅

#### 12-1. 글 유형 선택 ✅
- 첫 단계에서 SEO 글 / 브랜딩 글 선택

#### 12-2. 브랜딩 종류 ✅
| 종류 | 설명 |
|------|------|
| 수강생 모집 🎓 | 교육 과정 안내 및 수강생 모집 글 |
| 철학/신념 💭 | 샵이 추구하는 가치와 철학 |

#### 12-3. 수강생 모집 글 ✅
- 수강 주제 입력 스텝 (예: "천안 반영구수강", "강남 엠보교정")
- 교육 과정 정보 입력 (과정명, 대상, 커리큘럼, 혜택)
- 지역명 포함 키워드 자동 반영

#### 12-4. 브랜딩 글 규칙 ✅
- 규제 업종: 1인칭 금지, 정보 전달 중심
- 비규제 업종: 1인칭 자연스럽게 허용
- 1,500자 이상 작성
- 키워드 4~6회 배치
- 영업/유도 표현 금지
- 편집가이드 포함 (수업 현장 사진, 수강생 작품, 수료증)

### 13. 톤 선택 기능 ✅
- 비규제 업종 SEO 글 + 브랜딩 글에서 톤 선택 가능
- 프리셋: 따뜻한 / 전문적인 / 캐주얼 등

### 14. 시술 정보 스텝 ✅
- 시술 관련 추가 컨텍스트 입력 (선택사항)
- 매장 정보 입력: 주소, 영업시간, 연락처, 주차 안내
- 모든 업종에서 사용 가능 (규제/비규제 모두)
- 브랜딩 글에서도 매장 정보 입력 가능

### 15. 편집가이드 시스템 ✅
- 생성된 글에 `[편집가이드: ...]` 마커 자동 삽입
- 가이드 종류:
  - 시술 전후 비교 사진
  - 시술 과정 사진
  - 매장 외관/간판 사진
  - 주차 공간 사진
  - 매장 내부 인테리어 사진
  - 수업/교육 현장 사진 (수강글)
  - 수강생 작품 사진 (수강글)
  - 인용문구 활용 안내
- 매장 정보에 따라 동적으로 사진 가이드 생성

### 16. 콘텐츠 안전 필터 시스템 ✅
- 의료 용어 자동 치환 (레이저→광관리, 리프팅→탄력관리 등)
- 외국어 자동 제거 (러시아어, 영어 2글자 이상)
- 업종 키워드 과다반복 방지 (10회 초과 시 동의어 자동 치환)

### 17. 네이버 순위 자동 확인 ✅
- 블로그 URL 제출 후 7시간 대기 → 네이버 검색 API로 순위 확인
- Vercel Cron으로 12시간마다 자동 실행
- 히스토리에서 순위 표시 (N위 / 100위밖 / 확인중 / 미제출)
- Naver Search API 연동

### 18. 업종 확장 ✅
| 업종 | 아이콘 | 규제여부 |
|------|--------|----------|
| 반영구 | ✨ | O (1인칭 금지, 외부링크 금지) |
| 두피/탈모 | 🌱 | X |
| 피부 관리 | 💎 | X |
| 네일 아트 | 💅 | X |
| 헤어 | 💇 | X |
| 메이크업 | 💄 | X |
| 왁싱 | 🪶 | X |
| 속눈썹 | 👁️ | X |

### 19. 관리자 기능 ✅
- 관리자 이메일 화이트리스트 (무제한 사용)
- 현재 관리자: wldms706@naver.com
- 무제한 계정: mwm2020@nate.com, gkdisk9@nate.com, etang12330@gmail.com

### 20. 온보딩 시스템 ✅
- OAuth 로그인 후 이름/상호명 입력
- 이름 미입력 시 온보딩으로 자동 리다이렉트
- 헤더에 이름 표시

### 21. Google Sheets 트래킹 ✅
- 가입일, 이메일, 이름, 상호명, 플랜, 사용량 동기화
- 글 생성 시 자동 동기화

### 22. 카카오톡 알림 시스템 🔧 (구조 완성, 발송 대기)

#### 구조 ✅
- `profiles` 테이블에 `last_active_at`, `phone` 컬럼 추가
- 앱 접속 시마다 `last_active_at` 자동 갱신
- 크론 엔드포인트: `/api/cron/send-reminders` (매일 실행)
- 3일 이상 미접속 유저 자동 조회

#### 유료/무료 구분 알림 ✅
- **유료 유저**: "원장님! 블로그 글쓰셔야죠 ,,ㅜㅜ" → /write 유도
- **무료 유저**: "구독하시면 매일 더 많은 글을 쓸 수 있어요!" → /pricing 유도

#### 대기 중 (카카오 비즈니스 채널 심사 후)
- [ ] Solapi 카카오 채널 연동
- [ ] 알림톡 템플릿 2개 등록 + 승인
- [ ] 환경변수 등록 (SOLAPI_API_KEY 등)
- [ ] sendKakaoReminder() 실제 API 연결

---

## 현재 워크플로우

### SEO 글 (비규제 업종 — 11단계)
```
1. 글 유형 선택 (SEO / 브랜딩)
2. 업종 선택
3. 주제 선택
4. 키워드 입력 (AI 추천 or 직접)
5. 시술 정보 + 매장 정보 (선택)
6. 목적 선택
7. 독자 상태 선택
8. 톤 선택
9. 규칙 확인
10. AI 제목 추천 (3개) 또는 직접 입력
11. 글 생성
```

### SEO 글 (규제 업종/반영구 — 10단계)
```
1~7. 위와 동일 (톤 선택 없음)
8. 규칙 확인
9. AI 제목 추천
10. 글 생성
```

### 브랜딩 글 — 수강생 모집 (비규제 — 8단계)
```
1. 글 유형 선택 (SEO / 브랜딩)
2. 업종 선택
3. 브랜딩 종류 선택 (수강생 모집 / 철학)
4. 수강 주제 입력 (예: 천안 반영구수강)
5. 교육 과정 정보 + 매장 정보
6. 톤 선택
7. AI 제목 추천
8. 글 생성
```

### 브랜딩 글 — 철학/신념 (비규제 — 8단계)
```
1~3. 위와 동일
4. 키워드 입력
5. 철학 정보 + 매장 정보
6. 톤 선택
7. AI 제목 추천
8. 글 생성
```

---

## 플랜 및 가격

| 플랜 | 가격 | 기능 |
|------|------|------|
| 무료 | 0원 | 하루 3회 생성 |
| Pro (반영구) | 월 19,900원 | 무제한 생성, 반영구/두피 특화 |
| Pro (일반) | 월 14,900원 | 무제한 생성, 일반 업종 |

---

## 환경 변수

```env
# AI
GEMINI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 결제 (토스페이먼츠)
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# 네이버 검색 API
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# 크론 인증
CRON_SECRET=

# Google Sheets 트래킹
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_SPREADSHEET_ID=

# 카카오 알림 (대기 중)
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_SENDER_NUMBER=
KAKAO_CHANNEL_PFID=
KAKAO_TEMPLATE_INACTIVE_PAID=
KAKAO_TEMPLATE_INACTIVE_FREE=
```

---

## DB 스키마

### profiles
```sql
create table profiles (
  id uuid references auth.users primary key,
  email text,
  plan text default 'free',
  name text,
  business_name text,
  daily_usage int default 0,
  last_usage_date date,
  location_city text,
  location_district text,
  location_neighborhood text,
  blog_url text,
  blog_index_level text,
  blog_index_checked_at timestamptz,
  last_active_at timestamptz default now(),
  phone text,
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
  blog_url text,
  blog_url_submitted_at timestamptz,
  naver_rank integer,
  rank_checked_at timestamptz,
  created_at timestamptz default now()
);
```

### subscriptions
```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan_id text not null,
  status text default 'active',
  payment_key text,
  amount integer,
  started_at timestamptz default now(),
  expires_at timestamptz,
  cancelled_at timestamptz
);
```

### settings
```sql
create table settings (
  user_id uuid references profiles(id) on delete cascade primary key,
  default_business_category text
);
```

---

## Vercel Cron Jobs

| 경로 | 스케줄 | 설명 |
|------|--------|------|
| `/api/cron/check-naver-rank` | `0 */12 * * *` (12시간마다) | 네이버 순위 확인 |
| `/api/cron/send-reminders` | `0 1 * * *` (매일 KST 10시) | 미접속 유저 카카오 알림 |

---

## 파일 구조

```
src/
├── app/
│   ├── page.tsx              # 랜딩 페이지 (Black+Blue+White 섹션)
│   ├── layout.tsx            # 루트 레이아웃 (Pretendard + DM Serif Display)
│   ├── AuthRedirect.tsx      # 로그인 유저 자동 리다이렉트
│   ├── (app)/                # 인증 필요 영역
│   │   ├── layout.tsx        # 앱 레이아웃 (검정 헤더, 사이드바)
│   │   ├── page.tsx          # 홈 (글 생성 마법사)
│   │   ├── write/page.tsx    # 글쓰기 (확장 마법사)
│   │   ├── history/          # 히스토리 (순위 표시 포함)
│   │   ├── settings/         # 설정 (지역+블로그지수+구독관리)
│   │   ├── onboarding/       # 온보딩 (이름/상호명 입력)
│   │   ├── subscribe/        # 결제 (토스페이먼츠)
│   │   ├── HeaderLogo.tsx
│   │   ├── LogoutButton.tsx
│   │   └── OnboardingGuard.tsx
│   ├── (auth)/               # 인증 페이지 (검정 배경)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   └── signup/
│   ├── (marketing)/          # 마케팅 페이지
│   │   └── pricing/          # 요금 안내
│   ├── (legal)/              # 법적 페이지
│   │   ├── terms/
│   │   └── privacy/
│   └── api/
│       ├── generate/             # 본문 생성 (SEO + 브랜딩)
│       ├── generate-titles/      # 제목 추천
│       ├── recommend-keywords/   # 키워드 추천
│       ├── check-blog-index/     # 블로그 지수 확인
│       ├── payments/confirm/     # 토스 결제 확인
│       ├── tracking/sync/        # Google Sheets 동기화
│       └── cron/
│           ├── check-naver-rank/ # 네이버 순위 크론
│           └── send-reminders/   # 카카오 알림 크론
├── components/
│   ├── SelectionCard.tsx         # 선택 카드 (솔리드 블루)
│   ├── StepProgress.tsx          # 진행바
│   ├── Header.tsx                # 랜딩용 헤더 (검정)
│   ├── Footer.tsx                # 공통 푸터 (검정)
│   └── steps/
│       ├── StepContentType.tsx   # 글 유형 선택
│       ├── StepBusiness.tsx      # 업종 선택
│       ├── StepKeyword.tsx       # AI 키워드 추천
│       ├── StepTopic.tsx         # 주제 선택
│       ├── StepPurpose.tsx       # 목적 선택
│       ├── StepReader.tsx        # 독자 상태
│       ├── StepTone.tsx          # 톤 선택
│       ├── StepRules.tsx         # 규칙 확인
│       ├── StepTreatmentInfo.tsx # 시술/매장 정보
│       ├── StepBrandingType.tsx  # 브랜딩 종류
│       ├── StepBrandingInfo.tsx  # 브랜딩 정보 + 매장 정보
│       ├── StepRecruitTopic.tsx  # 수강 주제 입력
│       ├── StepTitleSelect.tsx   # AI 제목 추천
│       └── StepGenerate.tsx      # 글 생성 + 결과
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # 브라우저용
│   │   ├── server.ts         # 서버용
│   │   └── admin.ts          # Service Role (크론용)
│   ├── storage.ts            # DB CRUD
│   ├── usage.ts              # 사용량 관리
│   ├── naver-search.ts       # 네이버 검색 순위 체크
│   └── google-sheets.ts      # Google Sheets 트래킹
├── middleware.ts              # 인증 미들웨어
├── types/index.ts             # 타입 정의
└── data/constants.ts          # 상수 (업종/주제/목적/스텝)
```

---

## 배포 URL
- Production: https://www.blogwriter.co.kr
- Vercel: https://blog-writer-ebon.vercel.app

---

## 진행 예정

### 카카오톡 알림 발송 연결
- [ ] 카카오 비즈니스 채널 심사 통과
- [ ] Solapi 채널 연동
- [ ] 알림톡 템플릿 승인
- [ ] 실제 발송 코드 연결

### 추가 기능 (선택)
- [ ] 네이버 로그인
- [ ] 글 수정/재생성 기능
- [ ] 여러 버전 비교
- [ ] 글 내보내기 (워드, 한글)
- [ ] 글 예약 발행 (블로그 API 연동)
- [ ] 경쟁사 블로그 분석

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-01 | **카카오톡 알림 시스템** - 미접속 유저 자동 감지 + 유료/무료 구분 알림 구조 (발송 대기) |
| 2026-03-01 | **UI 전면 리디자인** - Bold Tricolor (파란+검정+흰색), pill 버튼, 솔리드 카드, 검정 헤더/푸터, DM Serif Display 폰트 |
| 2026-03-01 | **수강글 매장 정보** - 브랜딩/수강글에도 주소/영업시간/연락처/주차 입력 + 프롬프트 반영 |
| 2026-03-01 | **키워드 반복 강화** - 수강글 본문에 키워드 최소 4회 필수 배치 규칙 |
| 2026-03-01 | **수강글 편집가이드** - 수업 현장/수강생 작품/수료증/교육 공간 사진 가이드 |
| 2026-02-28 | **수강생 모집 기능** - 자기소개 → 수강생 모집으로 변경, 수강 주제 스텝 추가 |
| 2026-02-28 | **매장 정보 전 업종 허용** - 반영구 업종에서도 주소/영업시간 입력 가능 |
| 2026-02-28 | **외부링크/네이버지도 금지** - 반영구 업종 편집가이드에 추가 |
| 2026-02-28 | **매장 사진 가이드** - 주소/주차/영업시간에 따라 동적 사진 가이드 생성 |
| 2026-02-24 | **네이버 순위 자동 확인** - 크론 + 네이버 검색 API 연동 |
| 2026-02-23 | **블로그 URL 제출** - 히스토리에서 URL 입력, 순위 추적 |
| 2026-02-14 | **콘텐츠 안전 필터** - 의료 용어 치환, 외국어 제거, 키워드 과다반복 방지 |
| 2026-02-14 | **온보딩 시스템** - 가입 후 이름/상호명 입력 |
| 2026-02-06 | **토스페이먼츠 결제** - 구독 플랜 2종, 결제/해지 |
| 2026-02-01 | **Google Sheets 트래킹** - 사용자 데이터 자동 동기화 |
| 2026-01-30 | **모바일 반응형 + 키워드 유효성 검사** |
| 2026-01-29 | **브랜딩 글 + 업종 확장 + 키워드 하이라이트 + 제목 추천** |
| 2026-01-28 | **초기 버전 배포** - Supabase 인증 + Gemini AI + 기본 SEO 글 생성 |
