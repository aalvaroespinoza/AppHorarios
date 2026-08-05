import type { Metadata } from 'next';
import { Header } from '@/components/ui/Header';
import { DayView } from '@/components/layout/DayView';
import { getNextSchoolDay } from '@/lib/engine';
import { formatDateLong } from '@/utils/date';

/**
 * Genera el título dinámico con el día de cursada correspondiente.
 * Se recalcula en cada request (no se cachea).
 */
export async function generateMetadata(): Promise<Metadata> {
  const tomorrow = getNextSchoolDay(new Date());
  const label = formatDateLong(tomorrow);
  return {
    title: `Mañana · ${label} — AppHorarios`,
  };
}

/**
 * Página "Mañana"
 *
 * Calcula el próximo día de cursada a partir de hoy
 * y delega el render completo a DayView.
 *
 * Sin lógica duplicada: reutiliza getNextSchoolDay + DayView.
 */
export default function MananaPage() {
  const tomorrow = getNextSchoolDay(new Date());

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-4 sm:px-6">
        <DayView date={tomorrow} />
      </main>
      <div
        className="shrink-0 bg-[var(--color-bg)]"
        style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
        aria-hidden="true"
      />
    </div>
  );
}
