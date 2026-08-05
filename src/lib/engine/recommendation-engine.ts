import type { DayOfWeek } from '@/types/common';
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
  
  // 1. Obtener escenario activo
  // Simulamos una fecha de referencia que coincida con el día solicitado
  // para que el scenario-engine pueda resolverlo correctamente.
  // Como `determineScenario` usa dateToSchoolDay, pasamos un martes cualquiera 
  // si piden martes, etc. Pero es más fácil construir un Date base:
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

  // 2. Obtener materias del escenario para ese día
  // Extraemos todos los bloques de clase de las materias activas para ese día
  let classBlocks = subjectData.subjects
    .filter(s => scenario.activeSubjectIds.includes(s.id))
    .flatMap(s => s.classBlocks)
    .filter(cb => cb.day === dia);

  if (classBlocks.length === 0) {
    return { recomendado: null, alternativas: [] };
  }

  // Ordenar cronológicamente
  classBlocks.sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));

  // 3. Obtener horarios base del día y tipo
  let opciones = rawScheduleEntries.filter(
    (h) => h.dia === dia && h.sentido === tipo
  );

  // 4. Lógica de Filtrado en Vivo (descartar los que ya pasaron)
  opciones = opciones.filter((h) => timeToMins(h.horaSalida) >= timeToMins(horaActualHHMM));

  if (opciones.length === 0) {
    return { recomendado: null, alternativas: [] };
  }

  // 5. Filtrado por tipo de viaje e itinerario académico
  if (tipo === 'ida') {
    const primerBloque = classBlocks[0];
    
    // Regla general: Debe llegar al menos 15 minutos antes de la clase.
    // Usamos horaLlegada de la tabla si existe, sino asumimos 60 mins de viaje.
    const limiteLlegadaTerminal = timeToMins(primerBloque.startTime) - 15;
    
    opciones = opciones.filter((h) => {
      // Como horaLlegada está en schedules.ts, la usamos
      return timeToMins(h.horaLlegada) <= timeToMins(primerBloque.startTime);
    });

  } else {
    // VUELTA
    if (dia === 'viernes' && duermeEnCordoba) {
      return { recomendado: null, alternativas: [] };
    }

    const ultimoBloque = classBlocks[classBlocks.length - 1];
    const limiteSalidaTerminal = timeToMins(ultimoBloque.endTime);

    // Debe salir después de que termine la última clase
    opciones = opciones.filter((h) => timeToMins(h.horaSalida) >= limiteSalidaTerminal);
  }

  // 6. Ordenar los resultados finales ascendente (el más próximo en el futuro primero)
  opciones.sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));

  // 7. Retornar el recomendado y las alternativas
  const recomendado = opciones.length > 0 ? opciones[0] : null;
  const alternativas = opciones.slice(1);

  return { recomendado, alternativas };
};
