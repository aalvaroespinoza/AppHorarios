import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
          borderRadius: '110px',
          boxShadow: 'inset 0 0 0 16px rgba(255,255,255,0.03)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: '260px', height: '260px' }}
        >
          {/* Capa superior */}
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(6, 182, 212, 0.2)" />
          {/* Capa media */}
          <path d="M2 12l10 5 10-5" />
          {/* Capa inferior */}
          <path d="M2 17l10 5 10-5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
