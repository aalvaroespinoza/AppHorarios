"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Bus } from 'lucide-react';
import { useEscenario } from '@/hooks/useEscenario';
import { useBec } from '@/hooks/useBec';
import { useTodaySchedule } from '@/hooks/useTodaySchedule';
import ContextualControls from '@/features/schedule/ContextualControls';
import EntertainmentSelector from '@/components/EntertainmentSelector';
import { HorarioCard } from '@/features/schedule/HorarioCard';
import { ClassTimeline } from '@/features/schedule/ClassTimeline';
import { ScheduleHeader } from '@/features/schedule/ScheduleHeader';
import { PAGE_TRANSITION } from '@/lib/animations';

export default function ViajesPage() {
  const { diaSeleccionado, setDiaSeleccionado } = useEscenario();
  const bec = useBec();
  const {
    materiasDelDia,
    isToday,
    horaActualHHMM,
    linePosition,
    activeIndex,
    recomendacionIda,
    recomendacionVuelta
  } = useTodaySchedule();

  const diaCapitalizado = diaSeleccionado ? diaSeleccionado.charAt(0).toUpperCase() + diaSeleccionado.slice(1) : 'Hoy';

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 pb-28 min-h-[100dvh]"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <ScheduleHeader 
        diaCapitalizado={diaCapitalizado} 
        setDiaSeleccionado={setDiaSeleccionado} 
      />

      <ContextualControls />

      <div className="flex flex-col gap-6 mt-2">
        <HorarioCard 
          titulo="Ida hacia Córdoba"
          recomendacion={recomendacionIda} 
          icon={Bus} 
          direction="ida"
          bec={bec}
          isToday={isToday}
        />
        
        <EntertainmentSelector />
        
        <ClassTimeline 
          materiasDelDia={materiasDelDia}
          isToday={isToday}
          horaActualHHMM={horaActualHHMM}
          linePosition={linePosition}
          activeIndex={activeIndex}
        />

        <HorarioCard 
          titulo="Vuelta a Despeñaderos"
          recomendacion={recomendacionVuelta} 
          icon={Bus} 
          direction="vuelta"
          bec={bec}
          isToday={isToday}
        />
      </div>
    </motion.div>
  );
}
