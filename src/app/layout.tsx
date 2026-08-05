import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ServiceWorkerRegistration } from '@/components/ui/ServiceWorkerRegistration';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'AppHorarios',
    template: '%s — AppHorarios',
  },
  description:
    'Consultá qué colectivo tomar desde Despeñaderos a la UTN Córdoba según tu día de cursada.',
  manifest: '/manifest.json',

  // ── Íconos ──────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
  },

  // ── Apple / iPhone ───────────────────────────────────────────
  appleWebApp: {
    capable: true,
    title: 'AppHorarios',
    statusBarStyle: 'default',
  },

  // ── Open Graph (por si se comparte el link) ──────────────────
  openGraph: {
    title: 'AppHorarios',
    description: 'Colectivos Despeñaderos → UTN Córdoba según tu cursada',
    type: 'website',
    locale: 'es_AR',
  },
};

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,        // evita zoom accidental en PWA
  userScalable: false,
  viewportFit: 'cover',   // safe-area en iPhone X+
  themeColor: [
    // El sistema puede elegir según el modo (solo light por ahora)
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
  ],
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        {/* Registro del Service Worker — Client Component invisible */}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
