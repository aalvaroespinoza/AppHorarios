'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, ArrowRight, Bus } from 'lucide-react';
import { useEscenario } from '@/hooks/useEscenario';
import { rawScheduleEntries } from '@/data/schedules';
import ContextualControls from '@/features/schedule/ContextualControls';
import type { RawScheduleEntry } from '@/types/schedule';

export default function HorariosPage() {
  const escenario = useEscenario();
  const [tab, setTab] = useState<'ida' | 'vuelta'>('ida');
  const schedules = rawScheduleEntries.filter(entry => entry.dia === escenario.diaSeleccionado);
  const groups = schedules.filter(entry => entry.sentido === tab).reduce((result, entry) => {
    (result[entry.empresa] ??= []).push(entry);
    return result;
  }, {} as Record<string, RawScheduleEntry[]>);
  Object.values(groups).forEach(entries => entries.sort((a, b) => a.horaSalida.localeCompare(b.horaSalida)));

  return (
    <main className="page-shell flex min-h-[100dvh] flex-col gap-5">
      <header className="flex items-center justify-between gap-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div><p className="section-label mb-1">Para planear tu camino</p><h1 className="text-3xl font-bold tracking-tight text-ink">Horarios</h1></div>
        <Link href="/configuracion" aria-label="Configuración" className="glass-button aurora-border w-11 p-0"><Settings size={20} /></Link>
      </header>
      <ContextualControls showScenarios={false} />
      <div className="glass-toolbar flex gap-1 rounded-full p-1" aria-label="Sentido del viaje">
        {(['ida', 'vuelta'] as const).map(direction => <button type="button" key={direction} aria-pressed={tab === direction} onClick={() => setTab(direction)} className={'min-h-11 flex-1 rounded-full px-3 text-sm font-semibold ' + (tab === direction ? 'glass-primary' : 'text-subtle hover:bg-muted')}>{direction === 'ida' ? 'Ida' : 'Vuelta'} <span className="font-normal">· {schedules.filter(entry => entry.sentido === direction).length}</span></button>)}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-subtle"><span>{tab === 'ida' ? 'Despeñaderos' : 'Córdoba'}</span><ArrowRight size={15} /><span>{tab === 'ida' ? 'Córdoba' : 'Despeñaderos'}</span></div>
      <p className="-mt-2 text-sm text-subtle">Salidas programadas {tab === 'vuelta' ? 'desde la terminal de Córdoba' : 'desde Despeñaderos'}. {tab === 'vuelta' && 'Por Ministerio, aproximadamente 10 min después.'}</p>
      {!escenario.isMounted ? <div className="glass-panel p-6 text-subtle" role="status">Cargando horarios…</div> : Object.keys(groups).length ? Object.entries(groups).map(([company, entries]) => (
        <section key={company} className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4"><h2 className="flex items-center gap-2 text-base font-semibold capitalize text-ink"><Bus size={19} className="text-accent" />{company}</h2><span className="text-sm text-subtle">{entries.length} servicios</span></div>
          <div className="grid grid-cols-3 gap-2 p-4 min-[390px]:grid-cols-4">
            {entries.map((entry, index) => <div key={entry.horaSalida + index} className="min-w-0 rounded-2xl border border-line bg-elevated px-2 py-3 text-center">
              <time className="text-lg font-semibold tabular-nums text-ink">{entry.horaSalida}</time>
              {entry.notas && <details className="mt-1 text-sm text-subtle"><summary className="cursor-pointer py-1 text-accent">Detalle</summary><p className="mt-1 break-words text-left">{entry.notas}</p></details>}
            </div>)}
          </div>
        </section>
      )) : <div className="glass-panel p-6 text-center text-subtle">No hay servicios de {tab} para este día.</div>}
    </main>
  );
}
