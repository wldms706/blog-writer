#!/bin/bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
AD_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$AD_DIR/output"
mkdir -p "$OUT_DIR"

# 소재1 전체 페이지
"$CHROME" --headless --disable-gpu --screenshot="$OUT_DIR/소재1_전체.png" --window-size=1200,3200 "file://$AD_DIR/cards.html" 2>/dev/null
echo "✅ 소재1_전체.png"

# 소재2 전체 페이지
"$CHROME" --headless --disable-gpu --screenshot="$OUT_DIR/소재2_전체.png" --window-size=1200,3600 "file://$AD_DIR/cards2.html" 2>/dev/null
echo "✅ 소재2_전체.png"

echo ""
echo "완료! $OUT_DIR 폴더 확인하세요"
echo "개별 카드는 브라우저에서 각 카드를 스크린샷(Cmd+Shift+4) 떠주세요"
