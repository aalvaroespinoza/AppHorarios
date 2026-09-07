import type { DayOfWeek } from '@/core/types/common';
import type { Direction, RawScheduleEntry } from '@/types/schedule';
import type { Subject } from '@/types/subject';
import { rawScheduleEntries } from '@/data/schedules';
import { getStoredSubjectsSync } from '@/core/services/subject.service';

export const OFFSET_PARADA_VUELTA_MIN = 10;

export const timeToMins = (timeHHMM: string): number => {
  const [hours, minutes] = timeHHMM.split(':').map(Number);
  return hours * 60 + minutes;
};

export const addMinutes = (timeHHMM: string, minsToAdd: number): string => {
  const total = ((timeToMins(timeHHMM) + minsToAdd) % 1440 + 1440) % 1440;
  return Math.floor(total / 60).toString().padStart(2, '0') + ':' + (total % 60).toString().padStart(2, '0');
};

/** Suggest a service only when it is still boardable and fits the class schedule. */
export const calcularColectivos = (
  dia: DayOfWeek,
  tipo: Direction,
  cursaArquitectura: boolean,
  duermeEnCordoba: boolean,
  horaActualHHMM: string,
  providedSubjects?: Subject[]
): { recomendado: RawScheduleEntry | null; alternativas: RawScheduleEntry[] } => {
  const subjects = providedSubjects ?? getStoredSubjectsSync();
  const blocks = subjects
    .filter(subject => !(dia === 'martes' && !cursaArquitectura && subject.name.toLowerCase().includes('arquitectura')))
    .flatMap(subject => subject.classBlocks)
    .filter(block => block.day.toLowerCase() === dia.toLowerCase());
  if (!blocks.length || (tipo === 'vuelta' && dia === 'viernes' && duermeEnCordoba)) {
    return { recomendado: null, alternativas: [] };
  }

  const now = timeToMins(horaActualHHMM);
  const boardingMinutes = (entry: RawScheduleEntry) => timeToMins(entry.horaSalida) + (tipo === 'vuelta' ? OFFSET_PARADA_VUELTA_MIN : 0);
  const future = rawScheduleEntries
    .filter(entry => entry.dia === dia && entry.sentido === tipo && boardingMinutes(entry) >= now)
    .sort((a, b) => boardingMinutes(a) - boardingMinutes(b));
  let recommended: RawScheduleEntry | null = null;

  if (tipo === 'ida') {
    const firstStart = Math.min(...blocks.map(block => timeToMins(block.startTime)));
    const feasible = future.filter(entry => {
      const arrival = timeToMins(entry.horaLlegada);
      // An arrival after midnight belongs to the next day, not before today's class.
      return arrival >= timeToMins(entry.horaSalida) && arrival <= firstStart;
    });
    recommended = feasible.at(-1) ?? null;
    // Preserve the user's explicit 06:30 Canelo preference for an 08:00 class.
    if (firstStart === 8 * 60) recommended = feasible.find(entry => entry.empresa === 'canelo' && entry.horaSalida === '06:30') ?? recommended;
  } else {
    const lastEnd = Math.max(...blocks.map(block => timeToMins(block.endTime)));
    // Retain the existing conservative terminal-departure rule; no walking time is invented.
    recommended = future.find(entry => timeToMins(entry.horaSalida) >= lastEnd) ?? null;
  }

  return {
    recomendado: recommended,
    alternativas: future.filter(entry => entry !== recommended),
  };
};
