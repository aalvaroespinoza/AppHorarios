import { Header } from '@/components/ui/Header';
import { NavTabs } from '@/components/layout/NavTabs';
import { DayView } from '@/components/layout/DayView';

/**
 * Página principal — "Hoy"
 *
 * Delega todo el cómputo a DayView con la fecha actual.
 * Sin lógica propia: solo estructura de página.
 */
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <Header />
      <NavTabs />
      <main className="flex-1 flex flex-col items-center px-4 py-4 sm:px-6">
        <DayView date={new Date()} />
      </main>
      <div
        className="shrink-0 bg-[var(--color-bg)]"
        style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
        aria-hidden="true"
      />
    </div>
  );
}
