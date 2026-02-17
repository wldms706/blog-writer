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
            width: 140,
            height: 140,
            borderRadius: 32,
            background: 'white',
            marginBottom: 48,
          }}
        >
          <span style={{ fontSize: 80, fontWeight: 900, color: '#0047FF' }}>
            B
          </span>
        </div>
        <span
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '8px',
            textTransform: 'uppercase' as const,
          }}
        >
          BLOG WRITER
        </span>
        <div
          style={{
            display: 'flex',
            marginTop: 32,
            width: 80,
            height: 4,
            background: 'rgba(255,255,255,0.3)',
            borderRadius: 2,
          }}
        />
        <span
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 24,
            letterSpacing: '2px',
          }}
        >
          blogwriter.co.kr
        </span>
      </div>
    ),
    { ...size }
  );
}
