import type { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export const metadata: Metadata = { title: 'Sin conexión — LifeOS' };

export default function OfflinePage() {
  return (
    <main className="page-shell flex min-h-[80dvh] items-center justify-center">
      <section className="glass-panel flex w-full max-w-sm flex-col items-center gap-4 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <WifiOff size={26} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Sin conexión</h1>
        <p className="text-sm leading-relaxed text-subtle">
          Tus datos guardados siguen en este dispositivo. Volvé a Viajes para consultar los horarios disponibles.
        </p>
        <Link href="/" className="glass-primary mt-2 inline-flex min-h-11 items-center justify-center px-6">Volver a Viajes</Link>
      </section>
    </main>
  );
}
