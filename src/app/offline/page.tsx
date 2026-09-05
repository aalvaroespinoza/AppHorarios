import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sin conexión — AppHorarios',
};

/**
 * Página /offline
 * Modo consola industrial sin conexión.
 */
export default function OfflinePage() {
  return (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center bg-[#0A0A0C] px-4 font-mono">
      <div
        className="
          w-full max-w-sm
          bg-zinc-900
          rounded-sm
          border border-zinc-800
          shadow-none
          px-6 py-8
          text-center
          flex flex-col items-center gap-3
        "
      >
        <div className="w-10 h-10 rounded-sm border border-amber-500/40 bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm font-bold">
          [!]
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
            NETWORK STATUS // DISCONNECTED
          </span>
          <h1 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
            MODO OFFLINE
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1">
            Sin conexión de red disponible.<br />Los datos locales siguen accesibles en IndexedDB.
          </p>
        </div>

        <Link
          href="/"
          className="
            mt-2 px-6 h-10
            inline-flex items-center justify-center
            bg-safety-orange text-black border border-safety-orange
            rounded-sm
            text-xs font-bold uppercase tracking-wider
            transition-colors hover:bg-[#ff681a] active:bg-[#e64d00]
            cursor-pointer select-none
          "
        >
          RECONECTAR
        </Link>
      </div>
    </div>
  );
}
