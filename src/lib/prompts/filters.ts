// 생성된 글 후처리 필터 모음

// 의료 용어 → 안전 표현 치환 맵 (네이버 비공개 방지)
const MEDICAL_TERM_REPLACEMENTS: [string, string][] = [
  // 복합어 (긴 패턴 우선)
  ['레이저 토닝', '광관리 토닝'],
  ['레이저 시술', '광관리'],
  ['레이저 관리', '광관리'],
  ['레이저 치료', '광관리'],
  ['리프팅 시술', '탄력관리'],
  ['리프팅 관리', '탄력관리'],
  ['필러 시술', '볼륨관리'],
  ['필러 주입', '볼륨관리'],
  ['보톡스 시술', '주름관리'],
  ['보톡스 주사', '주름관리'],
  ['피부과 전문의', '피부관리 전문가'],
  ['피부과 시술', '피부관리'],
  ['마취 크림', '진정크림'],
  ['마취크림', '진정크림'],
  ['마취 연고', '진정크림'],
  ['의료 행위', '미용 관리'],
  ['의료기기', '관리 기기'],
  // 단일어 (짧은 패턴)
  ['레이저', '광관리'],
  ['리프팅', '탄력관리'],
  ['필러', '볼륨관리'],
  ['보톡스', '주름관리'],
  ['보톨리눔', '주름관리'],
  ['피부과', '피부관리실'],
  ['의료진', '전문 관리사'],
  ['의료', '미용'],
  ['마취', '진정'],
  ['진료', '상담'],
  ['처방전', '추천 리스트'],
  ['처방', '추천'],
  ['환자', '고객'],
  ['치료', '관리'],
  ['진단', '피부 분석'],
];

export function filterMedicalTerms(text: string): string {
  let filtered = text;
  for (const [term, replacement] of MEDICAL_TERM_REPLACEMENTS) {
    while (filtered.includes(term)) {
      filtered = filtered.replace(term, replacement);
    }
  }
  return filtered;
}

// 뷰티 영어 → 한국어 치환 맵
const BEAUTY_ENGLISH_REPLACEMENTS: [RegExp, string][] = [
  [/\bSMP\b/gi, '두피문신'],
  [/\bscalp\s*micro\s*pigmentation\b/gi, '두피문신'],
  [/\bmicro\s*pigmentation\b/gi, '색소 시술'],
  [/\bmicroblading\b/gi, '눈썹문신'],
  [/\bsemi[\s-]*permanent\b/gi, '반영구'],
  [/\bpermanent\s*make\s*up\b/gi, '반영구 메이크업'],
  [/\bhairline\b/gi, '헤어라인'],
  [/\blash\s*lift\b/gi, '래쉬 리프트'],
  [/\blash\s*perm\b/gi, '속눈썹 펌'],
  [/\blash\s*curl\b/gi, '속눈썹 컬'],
  [/\blash\b/gi, '래쉬'],
  [/\bperm\b/gi, '펌'],
  [/\bcurl(ing)?\b/gi, '컬'],
  [/\blift\b/gi, '리프트'],
  [/\bwaxing\b/gi, '왁싱'],
  [/\bskin\s*care\b/gi, '피부관리'],
  [/\bcare\b/gi, '케어'],
  [/\bdesign\b/gi, '디자인'],
  [/\bart\s*make\s*up\b/gi, '아트메이크업'],
  [/\bmake\s*up\b/gi, '메이크업'],
  [/\bnail\s*art\b/gi, '네일아트'],
  [/\bnail\b/gi, '네일'],
  [/\bhair\b/gi, '헤어'],
  [/\bscalp\b/gi, '두피'],
  [/\bbrow\b/gi, '브로우'],
  [/\btip(s)?\b/gi, '팁'],
  [/\bbeauty\b/gi, '뷰티'],
  [/\bshop\b/gi, '샵'],
];

export function filterForeignWords(text: string): string {
  let filtered = text;
  for (const [pattern, replacement] of BEAUTY_ENGLISH_REPLACEMENTS) {
    filtered = filtered.replace(pattern, replacement);
  }
  filtered = filtered.replace(/[а-яА-ЯёЁ]+/g, '');
  filtered = filtered.replace(/\([a-zA-Z\s]+\)/g, '');
  filtered = filtered.replace(/(?<=[\uAC00-\uD7AF\s])[a-zA-Z]{2,}(?=[\uAC00-\uD7AF\s.,!?])/g, '');
  filtered = filtered.replace(/  +/g, ' ');
  return filtered;
}

export function filterListBullets(text: string, keepNumberedHeaders: boolean = false): string {
  return text
    .split('\n')
    .map((line) => {
      let filtered = line.replace(/^\s*[-·•※]\s+/, '');
      if (!keepNumberedHeaders) {
        filtered = filtered.replace(/^\s*\d+\.\s+/, '');
      }
      return filtered;
    })
    .join('\n');
}

export function filterFirstPerson(text: string): string {
  let filtered = text;
  filtered = filtered.replace(/저희는\s*/g, '');
  filtered = filtered.replace(/저희\s*쪽에서는\s*/g, '');
  filtered = filtered.replace(/저희가\s*/g, '');
  filtered = filtered.replace(/저희의\s*/g, '');
  filtered = filtered.replace(/저희\s*/g, '');
  filtered = filtered.replace(/제가\s*/g, '');
  filtered = filtered.replace(/저는\s*/g, '');
  filtered = filtered.replace(/우리\s*샵/g, '');
  filtered = filtered.replace(/  +/g, ' ');
  return filtered;
}

// 금지 단어/표현 삭제 필터
const BANNED_WORDS_TO_REMOVE = [
  /만족스러운\s*/g, /만족도가\s*/g, /만족스러웠/g, /대만족/g,
  /감동받았/g, /감동을\s*/g, /감동이/g, /감탄/g,
  /효능\s*/g, /최초\s*/g, /최저\s*/g, /1위\s*/g,
  /무료\s*/g, /공짜\s*/g, /저렴한\s*곳/g, /신용\s*/g, /가입\s*/g,
];

const BANNED_SENTENCES = [
  /[^.!?\n]*예약하세요[^.!?\n]*[.!?]?\s*/g,
  /[^.!?\n]*문의주세요[^.!?\n]*[.!?]?\s*/g,
  /[^.!?\n]*방문해보세요[^.!?\n]*[.!?]?\s*/g,
  /[^.!?\n]*상담받으세요[^.!?\n]*[.!?]?\s*/g,
  /[^.!?\n]*찾아와주세요[^.!?\n]*[.!?]?\s*/g,
];

const PROMO_WORD_REPLACEMENTS: [RegExp, string][] = [
  [/완벽하게/g, '깔끔하게'], [/완벽한/g, '깔끔한'],
  [/최고의/g, '괜찮은'], [/최고예요/g, '좋았어요'],
  [/최고입니다/g, '좋습니다'], [/최고였/g, '좋았'],
  [/최고\s*/g, '좋은 '],
  [/최대의\s*/g, ''], [/최대\s+/g, ''],
  [/강추/g, '괜찮은'], [/대박/g, '진짜 좋'],
  [/제일\s/g, '꽤 '], [/가장\s/g, '꽤 '],
  [/완전\s/g, '정말 '], [/엄청\s*/g, '꽤 '],
  [/효과적/g, '도움이 되는'], [/효과가/g, '변화가'],
  [/효과를/g, '변화를'], [/효과/g, '변화'],
  [/체험/g, '경험'], [/후기/g, '이야기'],
  [/추천드립니다/g, '좋습니다'], [/추천합니다/g, '좋습니다'],
  [/추천해요/g, '좋아요'], [/추천/g, ''], [/카드/g, ''],
];

export function filterBannedWords(text: string): string {
  let filtered = text;
  filtered = filtered.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '');
  for (const pattern of BANNED_WORDS_TO_REMOVE) {
    filtered = filtered.replace(pattern, '');
  }
  for (const pattern of BANNED_SENTENCES) {
    filtered = filtered.replace(pattern, '');
  }
  for (const [pattern, replacement] of PROMO_WORD_REPLACEMENTS) {
    filtered = filtered.replace(pattern, replacement);
  }
  filtered = filtered.replace(/  +/g, ' ');
  return filtered;
}
