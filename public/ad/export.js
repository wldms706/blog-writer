const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const AD_DIR = __dirname;
const OUT_DIR = path.join(AD_DIR, 'output');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// 각 카드를 개별 HTML로 만들어서 스크린샷
function exportCards(htmlFile, prefix, cardCount) {
  const html = fs.readFileSync(path.join(AD_DIR, htmlFile), 'utf-8');

  for (let i = 1; i <= cardCount; i++) {
    // 카드 하나만 보이는 HTML 생성
    const singleCardHtml = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Pretendard', -apple-system, sans-serif; background: transparent; width: 1080px; height: 1350px; }
</style>
${html.match(/<style>([\s\S]*?)<\/style>/)?.[0] || ''}
</head><body>
${(() => {
  const regex = new RegExp(`<div class="card-wrapper">[\\s\\S]*?카드 ${i}[\\s\\S]*?<\\/div>\\s*<\\/div>\\s*<\\/div>`, 'g');
  const match = html.match(regex);
  if (match) return match[0];
  return '';
})()}
</body></html>`;

    const tmpFile = path.join(AD_DIR, `_tmp_card_${i}.html`);
    fs.writeFileSync(tmpFile, singleCardHtml);

    const outFile = path.join(OUT_DIR, `${prefix}_card${i}.png`);
    try {
      execSync(`"${CHROME}" --headless --disable-gpu --screenshot="${outFile}" --window-size=1080,1350 --default-background-color=0 "file://${tmpFile}" 2>/dev/null`);
      console.log(`✅ ${prefix}_card${i}.png`);
    } catch (e) {
      console.log(`❌ ${prefix}_card${i}.png 실패`);
    }
    fs.unlinkSync(tmpFile);
  }
}

exportCards('cards.html', 'ad1', 6);
exportCards('cards2.html', 'ad2', 7);
console.log(`\n완료! output 폴더: ${OUT_DIR}`);
