const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const AD_DIR = __dirname;
const OUT_DIR = path.join(AD_DIR, 'output');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// 공통 스타일 (cards.html에서 추출)
const COMMON_FONT = `@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Pretendard', -apple-system, sans-serif; width: 1080px; height: 1350px; display: flex; align-items: center; justify-content: center; }
.card { width: 1080px; height: 1350px; border-radius: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px; position: relative; overflow: hidden; }
.card .line1 { font-weight: 900; line-height: 1.3; text-align: center; }
.card .line2 { text-align: center; line-height: 1.4; }
.card .logo { position: absolute; bottom: 60px; font-size: 28px; font-weight: 700; letter-spacing: 2px; opacity: 0.4; }`;

// ========== 소재 1 ==========
const AD1_CARDS = [
  { name: 'ad1_1_hook', style: `.card { background: #000; color: #fff; }
.line1 { font-size: 108px; margin-bottom: 36px; } .line2 { font-size: 84px; color: #3B5CFF; font-weight: 800; } .logo { color: #fff; }
.sub { font-size: 66px; color: rgba(255,255,255,0.5); font-weight: 600; margin-bottom: 60px; }`,
    html: `<div class="card"><div class="sub">뷰티샵 원장님들</div><div class="line1">상위노출 블로그?</div><div class="line2">이제 배우지 마세요.</div><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad1_2_pain', style: `.card { background: #fff; color: #000; padding: 0; justify-content: flex-start; }
.img-wrap { width: 100%; height: 65%; position: relative; overflow: hidden; } .img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.img-wrap .badge { position: absolute; top: 12%; left: 50%; transform: translate(-50%,-50%); font-size: 96px; font-weight: 900; color: #000; letter-spacing: 4px; }
.text { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 0 48px 180px; }
.line1 { font-size: 54px; margin-bottom: 24px; font-weight: 600; color: #666; } .line2 { font-size: 66px; font-weight: 900; color: #000; } .logo { color: #000; }`,
    html: `<div class="card"><div class="img-wrap"><img src="file://${AD_DIR}/card2-bg.png"><div class="badge">GPT</div></div><div class="text"><div class="line1">블로그 강의 듣고,<br>GPT 돌려보고</div><div class="line2">그래도 상위노출<br>안 되셨죠?</div></div><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad1_3_reason', style: `.card { background: #3B5CFF; color: #fff; }
.line1 { font-size: 96px; margin-bottom: 36px; } .line2 { font-size: 78px; font-weight: 700; color: rgba(255,255,255,0.85); } .logo { color: #fff; }`,
    html: `<div class="card"><div class="line1">당연해요.</div><div class="line2">네이버 SEO 규칙이<br>따로 있거든요.</div><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad1_4_solution', style: `.card { background: #000; color: #fff; padding: 0; justify-content: flex-start; }
.img { width: 100%; height: 55%; object-fit: cover; } .text { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 60px; }
.line2 { font-size: 84px; font-weight: 900; } .logo { color: #fff; }`,
    html: `<div class="card"><img src="file://${AD_DIR}/og-image.png" class="img"><div class="text"><div class="line2">규칙을 대신<br>지켜드립니다.</div></div><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad1_5_method', style: `.card { background: #fff; color: #000; padding: 0; justify-content: flex-start; }
.img-wrap { width: 100%; height: 55%; position: relative; overflow: hidden; } .img-wrap img { width: 100%; height: 100%; object-fit: contain; background: #f5f5f5; }
.img-wrap .badge { position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%); background: #3B5CFF; color: #fff; font-size: 42px; font-weight: 800; padding: 20px 48px; border-radius: 100px; white-space: nowrap; }
.text { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 60px; }
.line1 { font-size: 84px; font-weight: 700; margin-bottom: 36px; } .line2 { font-size: 108px; font-weight: 900; color: #3B5CFF; } .logo { color: #000; }`,
    html: `<div class="card"><div class="img-wrap"><img src="file://${AD_DIR}/card5-bg.png"><div class="badge">청주네일아트 키워드 3위 노출</div></div><div class="text"><div class="line1">키워드만 넣으면</div><div class="line2">2분이면 끝.</div></div><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad1_6_cta', style: `.card { background: #3B5CFF; color: #fff; }
.strike { font-size: 72px; font-weight: 900; color: #000; margin-bottom: 48px; text-decoration: line-through; text-decoration-color: red; text-decoration-thickness: 4px; text-align: center; line-height: 1.3; }
.line1 { font-size: 72px; margin-bottom: 60px; } .line2 { font-size: 72px; font-weight: 800; background: rgba(255,255,255,0.2); padding: 30px 80px; border-radius: 100px; } .logo { color: #fff; }`,
    html: `<div class="card"><div class="strike">블로그 대행 한 달에<br>50만원 이상</div><div class="line1">한 달에 9,900원으로<br>네이버 블로그 장악하세요</div><div class="line2">무료 체험하기</div><div class="logo">BLOG WRITER</div></div>` },
];

// ========== 소재 2 ==========
const AD2_CARDS = [
  { name: 'ad2_1_hook', style: `.card { background: #000; color: #fff; }
.naver-img { width: 360px; height: auto; border-radius: 36px; margin-bottom: 60px; }
.sub { font-size: 54px; font-weight: 600; color: #3B5CFF; margin-bottom: 60px; }
.main { font-size: 84px; font-weight: 900; text-align: center; line-height: 1.4; } .highlight { color: #3B5CFF; } .logo { color: #fff; }`,
    html: `<div class="card"><img src="file://${AD_DIR}/naver-logo.jpeg" class="naver-img"><div class="sub">뷰티샵 원장님들</div><div class="main">네이버 블로그<br><span class="highlight">중요성</span><br>아직도 모르세요?</div><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad2_2_number', style: `.card { background: #fff; color: #000; }
.sub { font-size: 48px; color: #000; font-weight: 600; margin-bottom: 48px; }
.big { font-size: 180px; font-weight: 900; color: #3B5CFF; margin-bottom: 24px; }
.main { font-size: 72px; font-weight: 900; text-align: center; line-height: 1.5; } .logo { color: #000; }`,
    html: `<div class="card"><div class="sub">월 평균 매출 2000만원 중</div><div class="big">1500만원</div><div class="main">유입은<br>블로그였습니다.</div><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad2_3_empathy1', style: `.card { background: #f5f5f5; color: #000; padding: 90px 90px 0; justify-content: flex-start; }
.speech { background: #fff; border-radius: 60px; padding: 60px 72px; font-size: 60px; font-weight: 800; line-height: 1.5; text-align: center; box-shadow: 0 6px 36px rgba(0,0,0,0.08); position: relative; }
.speech::after { content: ''; position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 36px solid transparent; border-right: 36px solid transparent; border-top: 42px solid #fff; }
.person { width: 600px; height: auto; object-fit: contain; margin-top: auto; margin-bottom: 0; } .logo { color: #000; }`,
    html: `<div class="card"><div class="speech">아, 블로그<br>중요한 거 알지..<br>아는데 너무 어려운 걸<br>어떡해?</div><img src="file://${AD_DIR}/card3-person.png" class="person"><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad2_4_empathy2', style: `.card { background: #f5f5f5; color: #000; padding: 90px 90px 0; justify-content: flex-start; }
.speech { background: #fff; border-radius: 60px; padding: 60px 72px; font-size: 78px; font-weight: 800; line-height: 1.5; text-align: center; box-shadow: 0 6px 36px rgba(0,0,0,0.08); position: relative; }
.speech::after { content: ''; position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 36px solid transparent; border-right: 36px solid transparent; border-top: 42px solid #fff; }
.person { width: 660px; height: auto; object-fit: contain; margin-top: auto; margin-bottom: 0; } .logo { color: #000; }`,
    html: `<div class="card"><div class="speech">귀찮은 걸<br>어떡해?</div><img src="file://${AD_DIR}/card4-person.png" class="person"><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad2_5_solve', style: `.card { background: #3B5CFF; color: #fff; }
.sub { font-size: 54px; color: rgba(255,255,255,0.6); font-weight: 600; margin-bottom: 60px; }
.main { font-size: 84px; font-weight: 900; text-align: center; line-height: 1.5; } .logo { color: #fff; }`,
    html: `<div class="card"><div class="sub">그래서</div><div class="main">제가<br>만들었습니다.</div><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad2_6_product', style: `.card { background: #fff; color: #000; padding: 0; justify-content: flex-start; }
.img { width: 100%; height: 60%; object-fit: contain; background: #f5f5f5; }
.text { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 60px; }
.main { font-size: 66px; font-weight: 900; text-align: center; line-height: 1.5; } .highlight { color: #3B5CFF; } .logo { color: #000; }`,
    html: `<div class="card"><img src="file://${AD_DIR}/card-product.png" class="img"><div class="text"><div class="main">원장님 <span class="highlight">글 뽑아서</span><br>그냥 블로그에<br>옮기기만 하세요</div></div><div class="logo">BLOG WRITER</div></div>` },

  { name: 'ad2_7_cta', style: `.card { background: #000; color: #fff; }
.main { font-size: 78px; font-weight: 900; text-align: center; line-height: 1.5; margin-bottom: 72px; } .highlight { color: #3B5CFF; }
.btn { background: #3B5CFF; color: #fff; font-size: 66px; font-weight: 800; padding: 36px 96px; border-radius: 100px; } .logo { color: #fff; }`,
    html: `<div class="card"><div class="main"><span class="highlight">3회 무료</span>로<br>직접 써보세요.</div><div class="btn">무료 체험하기</div><div class="logo">BLOG WRITER</div></div>` },
];

function exportCard(card) {
  const tmpHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${COMMON_FONT}\n${card.style}</style></head><body>${card.html}</body></html>`;
  const tmpFile = path.join(AD_DIR, `_tmp_${card.name}.html`);
  const outFile = path.join(OUT_DIR, `${card.name}.png`);
  fs.writeFileSync(tmpFile, tmpHtml);
  try {
    execSync(`"${CHROME}" --headless --disable-gpu --screenshot="${outFile}" --window-size=1080,1350 --hide-scrollbars "file://${tmpFile}" 2>/dev/null`, { timeout: 15000 });
    console.log('✅', card.name + '.png');
  } catch(e) {
    console.log('❌', card.name, e.message?.slice(0,50));
  }
  fs.unlinkSync(tmpFile);
}

console.log('=== 소재 1 (6장) ===');
AD1_CARDS.forEach(exportCard);
console.log('\n=== 소재 2 (7장) ===');
AD2_CARDS.forEach(exportCard);
console.log('\n완료! 출력 폴더:', OUT_DIR);
