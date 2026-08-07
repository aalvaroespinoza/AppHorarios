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

export default function Hoy() {
  const { diaSeleccionado, isMounted, setDiaSeleccionado } = useEscenario();
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

  if (!isMounted) return <div className="min-h-[100dvh] bg-black" />;

  const diaCapitalizado = diaSeleccionado.charAt(0).toUpperCase() + diaSeleccionado.slice(1);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <ScheduleHeader 
        diaCapitalizado={diaCapitalizado} 
        setDiaSeleccionado={setDiaSeleccionado} 
      />

      <ContextualControls />


      <div className="flex flex-col gap-6 mt-2">
        <HorarioCard 
          titulo={`Ida hacia Córdoba`}
          recomendacion={recomendacionIda} 
          icon={Bus} 
          direction="ida"
          bec={bec}
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
          titulo={`Vuelta a Despeñaderos`}
          recomendacion={recomendacionVuelta} 
          icon={Bus} 
          direction="vuelta"
          bec={bec}
        />
      </div>
    </motion.div>
  );
}
