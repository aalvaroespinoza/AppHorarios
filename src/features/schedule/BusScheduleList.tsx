"use client";

import { useState } from 'react';
import type { ScheduleForDay } from '@/lib/services/schedule.service';
import { BusServiceCard } from './BusServiceCard';

export function BusScheduleList({ schedule }: { schedule: ScheduleForDay }) {
  const [tab, setTab] = useState<'ida' | 'vuelta'>(schedule.ida.length ? 'ida' : 'vuelta');
  return (
    <section aria-label="Horarios de colectivos" className="flex flex-col gap-4">
      <div className="glass-toolbar flex gap-1 rounded-full p-1" aria-label="Sentido del viaje">
        {(['ida', 'vuelta'] as const).map(direction => <button type="button" key={direction} onClick={() => setTab(direction)} aria-pressed={tab === direction} className={'min-h-11 flex-1 rounded-full px-3 text-sm font-semibold ' + (tab === direction ? 'glass-primary' : 'text-subtle hover:bg-muted')}>{direction === 'ida' ? 'Ida' : 'Vuelta'} · {schedule[direction].length}</button>)}
      </div>
      {schedule[tab].length ? <ul className="flex flex-col gap-3" aria-label={'Servicios de ' + tab}>{schedule[tab].map(service => <BusServiceCard key={service.id} service={service} />)}</ul> : <p className="glass-panel p-6 text-center text-subtle">No hay servicios de {tab} para este día.</p>}
    </section>
  );
}
