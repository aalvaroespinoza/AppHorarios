"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus } from 'lucide-react';
import type { DayOfWeek } from '@/core/types/common';
import { useEscenario } from '@/hooks/useEscenario';
import { useBec } from '@/hooks/useBec';
import ContextualControls from '@/features/schedule/ContextualControls';
import NativeCard from '@/core/components/ui/NativeCard';
import RelojMinimalista from '@/components/RelojMinimalista';
import AntiSleepButton from '@/components/AntiSleepButton';
import EntertainmentSelector from '@/components/EntertainmentSelector';
import { calcularColectivos, OFFSET_PARADA_VUELTA_MIN, addMinutes } from '@/lib/engine/recommendation-engine';
import { calcularHoraLlegada } from '@/core/utils/time';
import { determineScenario, findScenario } from '@/lib/engine/scenario-engine';
import { subjectData } from '@/data/subjects';
import { HorarioCard } from '@/features/schedule/HorarioCard';
import { ClassTimeline } from '@/features/schedule/ClassTimeline';
import { ScheduleHeader } from '@/features/schedule/ScheduleHeader';
export default function Hoy() {
  const { cursaArquitectura, duermeEnCordoba, diaSeleccionado, isMounted, setDiaSeleccionado } = useEscenario();
  const bec = useBec();
  const [horaActualHHMM, setHoraActualHHMM] = useState("00:00");
  const [timeMounted, setTimeMounted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setHoraActualHHMM(`${h}:${m}`);
    };
    updateTime();
    setTimeMounted(true);
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  
  if (!isMounted) return <div className="min-h-screen bg-black" />;

  // Filtrar materias del día usando la nueva lógica de escenarios y bloques
  const map: Record<string, number> = {
    'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'domingo': 0
  };
  const targetDay = map[diaSeleccionado];
  const refDate = new Date();
  while (refDate.getDay() !== targetDay) {
    refDate.setDate(refDate.getDate() + 1);
  }

  const scenarioId = determineScenario({ 
    tuesdayHasArquitectura: cursaArquitectura,
    referenceDate: refDate 
  });
  const scenarioData = scenarioId ? findScenario(scenarioId) : null;

  let materiasDelDia: Array<{nombre: string, horaInicio: string, horaFin: string, color?: string}> = [];
  if (scenarioData) {
    subjectData.subjects.forEach(subject => {
      if (scenarioData.activeSubjectIds.includes(subject.id)) {
        subject.classBlocks.forEach(block => {
          if (block.day === diaSeleccionado) {
            materiasDelDia.push({
              nombre: subject.name,
              horaInicio: block.startTime,
              horaFin: block.endTime,
              color: subject.color
            });
          }
        });
      }
    });
    // Ordenar cronológicamente
    materiasDelDia.sort((a, b) => {
      const [h1, m1] = a.horaInicio.split(':').map(Number);
      const [h2, m2] = b.horaInicio.split(':').map(Number);
      return (h1 * 60 + m1) - (h2 * 60 + m2);
    });
  }

  // Determinar si estamos viendo "hoy" o un día futuro/pasado
  const isToday = new Date().getDay() === targetDay;
  const horaParaFiltro = isToday ? horaActualHHMM : '00:00';

  // Lógica para la línea de tiempo roja de "ahora"
  let activeIndex = -1;
  let linePosition: 'before' | 'inside' | 'after' | 'none' = 'none';

  if (isToday && materiasDelDia.length > 0) {
    if (horaActualHHMM < materiasDelDia[0].horaInicio) {
      activeIndex = 0;
      linePosition = 'before';
    } else if (horaActualHHMM >= materiasDelDia[materiasDelDia.length - 1].horaFin) {
      activeIndex = materiasDelDia.length - 1;
      linePosition = 'after';
    } else {
      for (let i = 0; i < materiasDelDia.length; i++) {
        const m = materiasDelDia[i];
        if (horaActualHHMM >= m.horaInicio && horaActualHHMM < m.horaFin) {
          activeIndex = i;
          linePosition = 'inside';
          break;
        } else if (i < materiasDelDia.length - 1 && horaActualHHMM >= m.horaFin && horaActualHHMM < materiasDelDia[i+1].horaInicio) {
          activeIndex = i;
          linePosition = 'after';
          break;
        }
      }
    }
  }

  // Ejecutar motor
  const recomendacionIda = calcularColectivos(diaSeleccionado as DayOfWeek, 'ida', cursaArquitectura, duermeEnCordoba, horaParaFiltro);
  const recomendacionVuelta = calcularColectivos(diaSeleccionado as DayOfWeek, 'vuelta', cursaArquitectura, duermeEnCordoba, horaParaFiltro);

  // Capitalizar día
  const diaCapitalizado = diaSeleccionado.charAt(0).toUpperCase() + diaSeleccionado.slice(1);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      
      {/* Header */}
      <ScheduleHeader 
        diaCapitalizado={diaCapitalizado} 
        setDiaSeleccionado={setDiaSeleccionado} 
      />

      {/* Controladores */}
      <ContextualControls />

      {/* Tarjetas de Resultados */}
      <div className="flex flex-col gap-6 mt-2">
        <HorarioCard 
          titulo={`Ida hacia Córdoba`}
          recomendacion={recomendacionIda} 
          icon={Bus} 
          direction="ida"
          bec={bec}
        />
        
        {/* Modo Viaje (Entretenimiento) */}
        <EntertainmentSelector />
        
        {/* Línea de Tiempo de Materias */}
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
