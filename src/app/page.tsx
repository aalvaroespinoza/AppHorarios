"use client";

import { useState } from 'react';
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
  const [lockedTrip, setLockedTrip] = useState<{ day: string; direction: 'ida' | 'vuelta' } | null>(null);
  const contextualDirection = isToday && (materiasDelDia.some(m => horaActualHHMM >= m.horaInicio) || !recomendacionIda.recomendado) ? 'vuelta' : 'ida';
  const primary = lockedTrip?.day === diaSeleccionado ? lockedTrip.direction : contextualDirection;
  const secondary = primary === 'ida' ? 'vuelta' : 'ida';
  const trip = (direction: 'ida' | 'vuelta', compact: boolean) => (
    <HorarioCard key={diaSeleccionado + direction} titulo={direction === 'ida' ? 'Hacia Córdoba' : 'Volver a Despeñaderos'} recomendacion={direction === 'ida' ? recomendacionIda : recomendacionVuelta} direction={direction} bec={bec} isToday={isToday} diaSeleccionado={diaSeleccionado} compact={compact} onInteraction={() => setLockedTrip({ day: diaSeleccionado, direction: primary })} />
  );

  return (
    <main className="page-shell flex min-h-[100dvh] flex-col gap-5">
      <ScheduleHeader diaCapitalizado={diaSeleccionado.charAt(0).toUpperCase() + diaSeleccionado.slice(1)} diaSeleccionado={diaSeleccionado} setDiaSeleccionado={setDiaSeleccionado} />
      <ContextualControls />
      {timeMounted ? (
        <>
          {trip(primary, false)}
          <ClassTimeline materiasDelDia={materiasDelDia} isToday={isToday} horaActualHHMM={horaActualHHMM} linePosition={linePosition} activeIndex={activeIndex} compact />
          {trip(secondary, true)}
        </>
      ) : <div className="glass-panel h-80 p-6 text-subtle" role="status">Preparando tus viajes…</div>}
    </main>
  );
}
