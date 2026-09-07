"use client";

import { useEffect, useRef } from 'react';
import { Building2, Bed, Check } from 'lucide-react';
import { useEscenario } from '@/hooks/useEscenario';
import { getDiaActual } from '@/context/EscenarioContext';
import type { DayOfWeek } from '@/core/types/common';

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 'lunes', label: 'Lun' }, { id: 'martes', label: 'Mar' },
  { id: 'miercoles', label: 'Mié' }, { id: 'jueves', label: 'Jue' },
  { id: 'viernes', label: 'Vie' }, { id: 'sabado', label: 'Sáb' },
];

export default function ContextualControls({ showScenarios = true }: { showScenarios?: boolean }) {
  const { diaSeleccionado, setDiaSeleccionado, cursaArquitectura, setCursaArquitectura, duermeEnCordoba, setDuermeEnCordoba, isMounted } = useEscenario();
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = container.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (active && container.current) container.current.scrollTo({ left: active.offsetLeft - container.current.offsetLeft - container.current.clientWidth / 2 + active.clientWidth / 2 });
  }, [diaSeleccionado, isMounted]);

  if (!isMounted) return <div className="glass-toolbar h-14 rounded-full" aria-label="Cargando días" />;
  const showArchitecture = showScenarios && diaSeleccionado === 'martes';
  const showStay = showScenarios && diaSeleccionado === 'viernes';
  const enabled = showArchitecture ? cursaArquitectura : duermeEnCordoba;
  const Icon = showArchitecture ? Building2 : Bed;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div ref={container} className="glass-toolbar relative flex gap-1 overflow-x-auto rounded-full p-1 no-scrollbar" aria-label="Día de la semana">
        {DAYS.map(day => (
          <button type="button" key={day.id} aria-pressed={diaSeleccionado === day.id} aria-label={day.id + (getDiaActual() === day.id ? ', día actual' : '')} onClick={() => setDiaSeleccionado(day.id)} className={'min-h-11 min-w-11 flex-1 rounded-full px-2 text-sm font-semibold transition-colors ' + (diaSeleccionado === day.id ? 'glass-primary' : 'text-subtle hover:bg-muted')}>
            {day.label}
          </button>
        ))}
      </div>
      {(showArchitecture || showStay) && (
        <button type="button" aria-pressed={enabled} onClick={() => showArchitecture ? setCursaArquitectura(!cursaArquitectura) : setDuermeEnCordoba(!duermeEnCordoba)} className={'glass-panel flex w-full items-center gap-3 px-4 py-3 text-left ' + (enabled ? 'aurora-border' : '')}>
          <Icon className="shrink-0 text-accent" size={20} />
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">{showArchitecture ? 'Cursar Arquitectura' : 'Me quedo en Córdoba'}</span><span className="block text-sm text-subtle">{showArchitecture ? (enabled ? 'Incluida en tus viajes' : 'Sin esta clase') : (enabled ? 'Sin viaje de vuelta' : 'Con viaje de vuelta')}</span></span>
          <span className={'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ' + (enabled ? 'border-transparent bg-accent text-white' : 'border-line bg-muted')}>{enabled && <Check size={15} />}</span>
        </button>
      )}
    </div>
  );
}
