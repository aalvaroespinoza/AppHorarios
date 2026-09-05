import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0C',
          borderRadius: '38px',
          border: '4px solid #202024',
          position: 'relative',
        }}
      >
        {/* Status indicator LED */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '18px',
            width: '8px',
            height: '8px',
            borderRadius: '4px',
            background: '#00E599',
          }}
        />

        {/* Bus Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF5500"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: '84px', height: '84px' }}
        >
          <path d="M8 6v6" />
          <path d="M15 6v6" />
          <path d="M2 12h19.6" />
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
          <circle cx="7" cy="18" r="2" />
          <path d="M9 18h5" />
          <circle cx="16" cy="18" r="2" />
        </svg>

        {/* Label */}
        <div
          style={{
            marginTop: '6px',
            color: '#F4F4F6',
            fontSize: '12px',
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '0.2em',
          }}
        >
          HORARIOS
        </div>
      </div>
    ),
    { ...size }
  );
}
