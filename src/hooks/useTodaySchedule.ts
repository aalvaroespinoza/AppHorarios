import { useState, useEffect } from 'react';
import type { DayOfWeek } from '@/core/types/common';
import { useEscenario } from '@/hooks/useEscenario';
import { useSubjects } from '@/hooks/useSubjects';
import { calcularColectivos } from '@/lib/engine/recommendation-engine';

export function useTodaySchedule() {
  const { cursaArquitectura, duermeEnCordoba, diaSeleccionado } = useEscenario();
  const { subjects, isMounted: isSubjectsMounted } = useSubjects();
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

  const map: Record<string, number> = {
    'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'domingo': 0
  };
  const targetDay = map[diaSeleccionado] ?? 1;

  // Filtrado de materias dinámicas para el día seleccionado
  const materiasDelDia: Array<{
    id?: string;
    nombre: string;
    horaInicio: string;
    horaFin: string;
    color?: string;
    aula?: string;
    modality?: string;
  }> = [];

  subjects.forEach(subject => {
    // Si es martes y no cursa arquitectura, omitir materias de arquitectura
    if (diaSeleccionado === 'martes' && !cursaArquitectura && subject.name.toLowerCase().includes('arquitectura')) {
      return;
    }

    subject.classBlocks.forEach(block => {
      if (block.day.toLowerCase() === diaSeleccionado.toLowerCase()) {
        materiasDelDia.push({
          id: subject.id,
          nombre: subject.name,
          horaInicio: block.startTime,
          horaFin: block.endTime,
          color: subject.color,
          aula: block.classroom,
          modality: subject.modality
        });
      }
    });
  });

  // Ordenar cronológicamente
  materiasDelDia.sort((a, b) => {
    const [h1, m1] = a.horaInicio.split(':').map(Number);
    const [h2, m2] = b.horaInicio.split(':').map(Number);
    return (h1 * 60 + m1) - (h2 * 60 + m2);
  });

  const isToday = new Date().getDay() === targetDay;
  const horaParaFiltro = isToday ? horaActualHHMM : '00:00';

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

  const recomendacionIda = calcularColectivos(
    diaSeleccionado as DayOfWeek, 
    'ida', 
    cursaArquitectura, 
    duermeEnCordoba, 
    horaParaFiltro,
    subjects
  );
  
  const recomendacionVuelta = calcularColectivos(
    diaSeleccionado as DayOfWeek, 
    'vuelta', 
    cursaArquitectura, 
    duermeEnCordoba, 
    horaParaFiltro,
    subjects
  );

  useEffect(() => {
    if (isToday) {
      import('@/core/services/notifications/travel-notification.service').then(({ travelNotificationService }) => {
        const todayString = new Date().toISOString().split('T')[0];
        if (recomendacionIda.recomendado && materiasDelDia.length > 0) {
          const rec = recomendacionIda.recomendado;
          travelNotificationService.handleRecommendation({
            id: `ida-${todayString}-${diaSeleccionado}-${rec.horaSalida}`,
            claseTime: materiasDelDia[0].horaInicio,
            colectivoTime: rec.horaSalida,
            leaveHomeTime: (rec as any).saleDeCasa || rec.horaSalida,
            empresa: rec.empresa
          }).catch(console.error);
        }

        if (recomendacionVuelta.recomendado && materiasDelDia.length > 0) {
          const rec = recomendacionVuelta.recomendado;
          travelNotificationService.handleRecommendation({
            id: `vuelta-${todayString}-${diaSeleccionado}-${rec.horaSalida}`,
            claseTime: materiasDelDia[materiasDelDia.length - 1].horaFin,
            colectivoTime: rec.horaSalida,
            leaveHomeTime: rec.horaSalida,
            empresa: rec.empresa,
            destino: 'Alta Gracia'
          }).catch(console.error);
        }
      });
    }
  }, [isToday, recomendacionIda.recomendado, recomendacionVuelta.recomendado, materiasDelDia, diaSeleccionado]);

  return {
    materiasDelDia,
    isToday,
    horaActualHHMM,
    linePosition,
    activeIndex,
    recomendacionIda,
    recomendacionVuelta,
    timeMounted: timeMounted && isSubjectsMounted
  };
}
