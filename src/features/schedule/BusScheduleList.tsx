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
 * Renderiza los servicios de colectivo agrupados por sentido con pestañas mecánicas:
 *   IDA (Despeñaderos → UTN)
 *   VUELTA (UTN → Despeñaderos)
 */
export function BusScheduleList({ schedule }: BusScheduleListProps) {
  const { ida, vuelta } = schedule;
  const noServices = ida.length === 0 && vuelta.length === 0;
  
  // Default to the tab that has services if possible
  const [tab, setTab] = useState<'ida' | 'vuelta'>(ida.length > 0 ? 'ida' : 'vuelta');

  if (noServices) {
    return (
      <section aria-label="Horarios de colectivos" className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-1">
          [SYS.SCHEDULE // COLECTIVOS]
        </p>
        <p className="text-xs font-mono text-zinc-400 py-2">
          NO HAY SERVICIOS REGISTRADOS PARA ESTE DÍA.
        </p>
      </section>
    );
  }

  const activeList = tab === 'ida' ? ida : vuelta;

  return (
    <section aria-label="Horarios de colectivos" className="flex flex-col gap-3">
      {/* Botones Mecánicos de Pestañas */}
      <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-sm gap-1">
        <button 
          onClick={() => setTab('ida')}
          className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            tab === 'ida' 
              ? 'bg-zinc-900 border border-safety-orange/50 text-safety-orange font-bold shadow-none' 
              : 'border border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>IDA</span>
          <span className="text-[10px] opacity-80">({ida.length})</span>
        </button>
        <button 
          onClick={() => setTab('vuelta')}
          className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            tab === 'vuelta' 
              ? 'bg-zinc-900 border border-acid-green/50 text-acid-green font-bold shadow-none' 
              : 'border border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>VUELTA</span>
          <span className="text-[10px] opacity-80">({vuelta.length})</span>
        </button>
      </div>

      <div className="min-h-[200px]">
        {activeList.length > 0 ? (
          <ul
            className="flex flex-col gap-1.5"
            aria-label={`Servicios de ${tab}`}
          >
            {activeList.map((service) => (
              <BusServiceCard key={service.id} service={service} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center border border-zinc-800 rounded-sm bg-zinc-950 mt-2">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              [NO HAY SERVICIOS DE {tab.toUpperCase()} PARA ESTE DÍA]
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
