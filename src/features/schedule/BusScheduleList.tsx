"use client";

import { useState } from 'react';
import type { ScheduleForDay } from '@/lib/services/schedule.service';
import { BusServiceCard } from './BusServiceCard';

interface BusScheduleListProps {
  schedule: ScheduleForDay;
}

/**
 * BusScheduleList
 *
 * Renderiza los servicios de colectivo agrupados por sentido:
 *   IDA (Despeñaderos → UTN)
 *   VUELTA (UTN → Despeñaderos)
 *
 * Utiliza pestañas (Tabs) para no extender el scroll verticalmente.
 */
export function BusScheduleList({ schedule }: BusScheduleListProps) {
  const { ida, vuelta } = schedule;
  const noServices = ida.length === 0 && vuelta.length === 0;
  
  // Default to the tab that has services if possible
  const [tab, setTab] = useState<'ida' | 'vuelta'>(ida.length > 0 ? 'ida' : 'vuelta');

  if (noServices) {
    return (
      <section aria-label="Horarios de colectivos">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">
          Colectivos
        </p>
        <p className="text-[14px] text-[var(--color-text-secondary)] py-3">
          Sin horarios registrados para este día.
        </p>
      </section>
    );
  }

  const activeList = tab === 'ida' ? ida : vuelta;

  return (
    <section aria-label="Horarios de colectivos" className="flex flex-col gap-3">
      <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg">
        <button 
          onClick={() => setTab('ida')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${tab === 'ida' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`}
        >
          Ida ({ida.length})
        </button>
        <button 
          onClick={() => setTab('vuelta')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${tab === 'vuelta' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`}
        >
          Vuelta ({vuelta.length})
        </button>
      </div>

      <div className="min-h-[200px]">
        {activeList.length > 0 ? (
          <ul
            className="divide-y divide-[var(--color-border)] animate-in fade-in slide-in-from-bottom-2 duration-300"
            aria-label={`Servicios de ${tab}`}
          >
            {activeList.map((service) => (
              <BusServiceCard key={service.id} service={service} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[var(--color-border)] rounded-xl bg-zinc-50 dark:bg-zinc-900/50 mt-2">
            <p className="text-[14px] font-medium text-[var(--color-text-secondary)]">
              No hay servicios de {tab} para este día.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
