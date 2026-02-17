import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '블로그 라이터 - 뷰티샵 원장님을 위한 AI 블로그 글쓰기';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0047FF',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: 28,
            background: 'white',
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 64, fontWeight: 900, color: '#0047FF' }}>
            B
          </span>
        </div>
        <span
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-2px',
          }}
        >
          블로그 라이터
        </span>
        <span
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 20,
          }}
        >
          뷰티샵 원장님을 위한 AI 블로그 글쓰기
        </span>
      </div>
    ),
    { ...size }
  );
}
