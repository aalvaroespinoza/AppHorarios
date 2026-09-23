"use client";

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useEscenario } from '@/hooks/useEscenario';
import { useBec } from '@/hooks/useBec';
import { useTodaySchedule } from '@/hooks/useTodaySchedule';
import ContextualControls from '@/features/schedule/ContextualControls';
import { HorarioCard } from '@/features/schedule/HorarioCard';
import { ClassTimeline } from '@/features/schedule/ClassTimeline';
import { ScheduleHeader } from '@/features/schedule/ScheduleHeader';

export default function HomePage() {
  const { diaSeleccionado, setDiaSeleccionado } = useEscenario();
  const bec = useBec();
  const schedule = useTodaySchedule();
  const { materiasDelDia, isToday, horaActualHHMM, linePosition, activeIndex, recomendacionIda, recomendacionVuelta, timeMounted } = schedule;
  const trip = (direction: 'ida' | 'vuelta', compact: boolean) => (
    <HorarioCard key={diaSeleccionado + direction} titulo={direction === 'ida' ? 'Hacia Córdoba' : 'Volver a Despeñaderos'} recomendacion={direction === 'ida' ? recomendacionIda : recomendacionVuelta} direction={direction} bec={bec} isToday={isToday} diaSeleccionado={diaSeleccionado} compact={compact} />
  );

  return (
    <main className="page-shell flex min-h-[100dvh] flex-col gap-5">
      <ScheduleHeader diaCapitalizado={diaSeleccionado.charAt(0).toUpperCase() + diaSeleccionado.slice(1)} diaSeleccionado={diaSeleccionado} setDiaSeleccionado={setDiaSeleccionado} />
      <ContextualControls />
      <Link href="/horarios" className="flex min-h-11 items-center justify-between gap-2 text-sm font-medium text-accent">Todos los horarios de colectivos<ArrowUpRight size={17} /></Link>
      {timeMounted ? (
        <>
          {trip('ida', false)}
          <ClassTimeline key={diaSeleccionado} selectedDay={diaSeleccionado} materiasDelDia={materiasDelDia} isToday={isToday} horaActualHHMM={horaActualHHMM} linePosition={linePosition} activeIndex={activeIndex} compact />
          {trip('vuelta', true)}
        </>
      ) : <div className="glass-panel h-80 p-6 text-subtle" role="status">Preparando tus viajes…</div>}
    </main>
  );
}
