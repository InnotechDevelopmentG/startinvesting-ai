import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'startinvesting.ai — See how much your money could grow';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '52px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: '#00C896',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: 'white', fontSize: '28px', display: 'flex' }}>↗</div>
          </div>
          <span style={{ fontSize: '28px', fontWeight: 500, color: '#111', letterSpacing: '-0.5px' }}>
            startinvesting<span style={{ color: '#00C896' }}>.ai</span>
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 500,
            color: '#111111',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: '28px',
            maxWidth: '900px',
          }}
        >
          See how much your money<br />
          could <span style={{ color: '#00C896' }}>really</span> grow.
        </div>

        {/* Subline */}
        <div style={{ fontSize: '26px', color: '#888888', marginBottom: '56px' }}>
          Free investment simulator · Built on real historical data · 2 minutes
        </div>

        {/* Stat strip */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { label: 'Based on', value: 'S&P 500 data' },
            { label: 'Time to complete', value: '~2 minutes' },
            { label: 'Cost', value: 'Free forever' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                padding: '14px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#999', fontWeight: 400 }}>{item.label}</span>
              <span style={{ fontSize: '18px', color: '#111', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
