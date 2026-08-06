import type { DayOfWeek } from '@/core/types/common';
import type { Direction, RawScheduleEntry } from '@/types/schedule';
import { determineScenario, findScenario } from './scenario-engine';
import { subjectData } from '@/data/subjects';
import { rawScheduleEntries } from '@/data/schedules';

// Funciones puras para manipulación de horas (formato "HH:MM")
export const OFFSET_PARADA_VUELTA_MIN = 10;

export const timeToMins = (timeHHMM: string): number => {
  const [hours, minutes] = timeHHMM.split(':').map(Number);
  return hours * 60 + minutes;
};

export const addMinutes = (timeHHMM: string, minsToAdd: number): string => {
  const [hours, minutes] = timeHHMM.split(':').map(Number);
  let totalMins = hours * 60 + minutes + minsToAdd;
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const subMinutes = (timeHHMM: string, minsToSub: number): string => {
  const [hours, minutes] = timeHHMM.split(':').map(Number);
  let totalMins = hours * 60 + minutes - minsToSub;
  if (totalMins < 0) totalMins += 24 * 60;
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const calcularColectivos = (
  dia: DayOfWeek,
  tipo: Direction,
  cursaArquitectura: boolean,
  duermeEnCordoba: boolean,
  horaActualHHMM: string
): { recomendado: RawScheduleEntry | null, alternativas: RawScheduleEntry[] } => {
  
  const map: Record<string, number> = {
    'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'domingo': 0
  };
  const targetDay = map[dia];
  const refDate = new Date();
  while (refDate.getDay() !== targetDay) {
    refDate.setDate(refDate.getDate() + 1);
  }

  const scenarioId = determineScenario({ 
    tuesdayHasArquitectura: cursaArquitectura,
    referenceDate: refDate 
  });

  const scenario = scenarioId ? findScenario(scenarioId) : null;

  if (!scenario) {
    return { recomendado: null, alternativas: [] };
  }

  let classBlocks = subjectData.subjects
    .filter(s => scenario.activeSubjectIds.includes(s.id))
    .flatMap(s => s.classBlocks)
    .filter(cb => cb.day === dia);

  if (classBlocks.length === 0) {
    return { recomendado: null, alternativas: [] };
  }

  classBlocks.sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));

  // Todos los horarios disponibles en ese día y dirección
  const todasOpciones = rawScheduleEntries.filter(
    (h) => h.dia === dia && h.sentido === tipo
  );

  if (todasOpciones.length === 0) {
    return { recomendado: null, alternativas: [] };
  }

  let idealBus: RawScheduleEntry | null = null;

  if (tipo === 'ida') {
    const primerBloque = classBlocks[0];
    const limiteLlegadaTerminal = timeToMins(primerBloque.startTime);
    
    // Buses que llegan antes o a la misma hora que empieza la clase
    let validas = todasOpciones.filter(h => timeToMins(h.horaLlegada) <= limiteLlegadaTerminal);
    if (validas.length > 0) {
      // Ordenamos descendente para encontrar el que llega más cerca a la hora de cursar (el más tarde posible)
      validas.sort((a, b) => timeToMins(b.horaSalida) - timeToMins(a.horaSalida));
      idealBus = validas[0];
    }
  } else {
    // VUELTA
    if (dia === 'viernes' && duermeEnCordoba) {
      return { recomendado: null, alternativas: [] };
    }
    const ultimoBloque = classBlocks[classBlocks.length - 1];
    let limiteSalidaTerminal = timeToMins(ultimoBloque.endTime);
    
    // Buses que salen después de la clase
    let validas = todasOpciones.filter(h => timeToMins(h.horaSalida) >= limiteSalidaTerminal);
    
    if (validas.length > 0) {
      // Ordenamos ascendente para agarrar el primero que sale después de clases
      validas.sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));
      idealBus = validas[0];
    } else {
      // Si no hay buses válidos después de la clase (ej. clase termina 23:05 y el último bus es antes)
      // Agarra el último bus disponible de ese día ("me trato de tomar todos los anteriores")
      let todasOrdenadas = [...todasOpciones].sort((a, b) => timeToMins(b.horaSalida) - timeToMins(a.horaSalida));
      idealBus = todasOrdenadas[0];
    }
  }

  // Si no se encontró un ideal (caso extremo donde ningún colectivo cumple las condiciones)
  if (!idealBus) {
    let todasOrdenadas = [...todasOpciones].sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));
    idealBus = todasOrdenadas[0]; // Fallback genérico al primer colectivo del día
  }

  // Filtrado de las opciones que todavía no pasaron en el día real para mostrarlas como alternativas
  let opcionesFuturas = todasOpciones.filter((h) => timeToMins(h.horaSalida) >= timeToMins(horaActualHHMM));

  // Las alternativas son todas las futuras EXCEPT el recomendado actual (si es que no pasó)
  let alternativas = opcionesFuturas.filter(h => h.horaSalida !== idealBus!.horaSalida);
  alternativas.sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));

  return { recomendado: idealBus, alternativas };
};
