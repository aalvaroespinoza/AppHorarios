import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sin conexión — AppHorarios',
};

/**
 * Página /offline
 *
 * Mostrada por el Service Worker cuando el dispositivo está sin red
 * y la página solicitada no está en caché.
 */
export default function OfflinePage() {
  return (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center bg-[var(--color-bg)] px-4">
      <div
        className="
          w-full max-w-sm
          bg-[var(--color-surface)]
          rounded-2xl
          border border-[var(--color-border)]
          shadow-sm
          px-6 py-10
          text-center
          flex flex-col items-center gap-4
        "
      >
        <span className="text-5xl" role="img" aria-label="Colectivo">🚌</span>

        <div className="flex flex-col gap-1">
          <h1 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
            Sin conexión
          </h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
            Revisá tu conexión a internet<br />e intentá de nuevo.
          </p>
        </div>

        <Link
          href="/"
          className="
            mt-2 px-6 py-2.5
            bg-[var(--color-accent)] text-white
            rounded-full
            text-[14px] font-medium
            transition-opacity hover:opacity-90 active:opacity-75
          "
        >
          Reintentar
        </Link>
      </div>
    </div>
  );
}
