import type { DayOfWeek } from '@/types/common';
import type { Subject } from '@/types/subject';
import type { ResolvedBusService, ScheduleForDay } from '@/lib/services/schedule.service';
import { calculateMarginMinutes, compareTime } from '@/utils/time';

// ─── Configuración ────────────────────────────────────────────────────────────

/**
 * Margen mínimo en minutos entre la llegada del colectivo y el inicio
 * de la primera clase para que el servicio sea considerado "a tiempo".
 * Un colectivo con margen menor es descartado.
 */
export const MIN_MARGIN_MINUTES = 10;

// ─── Tipos de salida ──────────────────────────────────────────────────────────

/**
 * Clasificación de servicios para un sentido (ida o vuelta).
 */
export interface RecommendationGroup {
  /** El servicio óptimo: único colectivo destacado. */
  recommended: ResolvedBusService | null;
  /** Servicios válidos adicionales, en orden cronológico. */
  alternatives: ResolvedBusService[];
  /**
   * Servicios descartados (llegan muy tarde para ida,
   * o salen antes de que termine la clase para vuelta).
   * No se muestran en la UI pero se conservan para auditoría.
   */
  discarded: ResolvedBusService[];
  /** Hora de corte usada para clasificar (primera clase o última clase). */
  cutoffTime: string | null;
}

/**
 * Resultado completo de recomendaciones para el día activo.
 */
export interface RecommendationResult {
  ida: RecommendationGroup;
  vuelta: RecommendationGroup;
  /** Hora de inicio de la primera clase del día. */
  firstClassTime: string | null;
  /** Hora de fin de la última clase del día. */
  lastClassTime: string | null;
  /**
   * true si hay suficientes datos para producir recomendaciones
   * (materias + servicios cargados).
   */
  hasData: boolean;
}

// ─── Helpers de tiempo de clase ───────────────────────────────────────────────

/**
 * Devuelve la hora de inicio de la primera clase del día,
 * considerando todos los bloques de todas las materias activas.
 *
 * @param subjects - Materias activas del escenario
 * @param day      - Día a evaluar
 * @returns TimeString HH:MM o null si no hay bloques para ese día
 */
export function getFirstClassStartTime(
  subjects: Subject[],
  day: DayOfWeek,
): string | null {
  const times = subjects
    .flatMap((s) => s.classBlocks)
    .filter((b) => b.day === day)
    .map((b) => b.startTime);

  if (times.length === 0) return null;

  return [...times].sort(compareTime)[0];
}

/**
 * Devuelve la hora de fin de la última clase del día,
 * considerando todos los bloques de todas las materias activas.
 *
 * @param subjects - Materias activas del escenario
 * @param day      - Día a evaluar
 * @returns TimeString HH:MM o null si no hay bloques para ese día
 */
export function getLastClassEndTime(
  subjects: Subject[],
  day: DayOfWeek,
): string | null {
  const times = subjects
    .flatMap((s) => s.classBlocks)
    .filter((b) => b.day === day)
    .map((b) => b.endTime);

  if (times.length === 0) return null;

  return [...times].sort(compareTime).at(-1)!;
}

// ─── Clasificadores por sentido ───────────────────────────────────────────────

/**
 * Clasifica los servicios de IDA.
 *
 * Criterio:
 *   - Descartado:   margen < MIN_MARGIN_MINUTES (llega demasiado tarde)
 *   - A tiempo:     margen >= MIN_MARGIN_MINUTES
 *   - Recomendado:  el de SALIDA MÁS TARDE entre los a tiempo
 *                   (minimiza tiempo de espera en la UTN)
 *   - Alternativas: el resto a tiempo, en orden cronológico
 */
export function classifyIda(
  services: ResolvedBusService[],
  firstClassTime: string,
): RecommendationGroup {
  const onTime: ResolvedBusService[] = [];
  const discarded: ResolvedBusService[] = [];

  for (const svc of services) {
    const margin = calculateMarginMinutes(svc.arrivalTime, firstClassTime);
    if (margin >= MIN_MARGIN_MINUTES) {
      onTime.push(svc);
    } else {
      discarded.push(svc);
    }
  }

  if (onTime.length === 0) {
    return { recommended: null, alternatives: [], discarded, cutoffTime: firstClassTime };
  }

  // El recomendado es el que sale MÁS TARDE (menos tiempo de espera en destino)
  const sorted = [...onTime].sort((a, b) =>
    compareTime(b.departureTime, a.departureTime),
  );
  const [recommended, ...rest] = sorted;

  // Las alternativas se muestran en orden cronológico (más temprano primero)
  const alternatives = [...rest].sort((a, b) =>
    compareTime(a.departureTime, b.departureTime),
  );

  return { recommended, alternatives, discarded, cutoffTime: firstClassTime };
}

/**
 * Clasifica los servicios de VUELTA.
 *
 * Criterio:
 *   - Descartado:   sale ANTES o AL MISMO TIEMPO que termina la última clase
 *   - Disponible:   sale DESPUÉS de que termina la última clase
 *   - Recomendado:  el PRIMERO disponible (mínima espera tras la clase)
 *   - Alternativas: el resto, en orden cronológico
 */
export function classifyVuelta(
  services: ResolvedBusService[],
  lastClassTime: string,
): RecommendationGroup {
  const available: ResolvedBusService[] = [];
  const discarded: ResolvedBusService[] = [];

  for (const svc of services) {
    // El colectivo debe salir estrictamente después de que termine la clase
    if (compareTime(svc.departureTime, lastClassTime) > 0) {
      available.push(svc);
    } else {
      discarded.push(svc);
    }
  }

  if (available.length === 0) {
    return { recommended: null, alternatives: [], discarded, cutoffTime: lastClassTime };
  }

  // Ya vienen ordenados cronológicamente; el primero es el recomendado
  const [recommended, ...alternatives] = available;

  return { recommended, alternatives, discarded, cutoffTime: lastClassTime };
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Produce las recomendaciones completas para el día activo.
 *
 * Flujo:
 *   subjects → getFirstClassStartTime / getLastClassEndTime
 *   schedule.ida    → classifyIda(firstClassTime)
 *   schedule.vuelta → classifyVuelta(lastClassTime)
 *
 * @param subjects - Materias activas del escenario (puede estar vacío)
 * @param schedule - Servicios ya parseados, filtrados y con empresa resuelta
 * @param day      - Día del escenario
 * @returns RecommendationResult listo para el componente visual
 */
export function getRecommendations(
  subjects: Subject[],
  schedule: ScheduleForDay,
  day: DayOfWeek,
): RecommendationResult {
  const firstClassTime = getFirstClassStartTime(subjects, day);
  const lastClassTime = getLastClassEndTime(subjects, day);

  // Sin materias o sin servicios: no hay recomendaciones posibles
  const hasData =
    subjects.length > 0 &&
    (schedule.ida.length > 0 || schedule.vuelta.length > 0);

  const ida: RecommendationGroup =
    firstClassTime !== null
      ? classifyIda(schedule.ida, firstClassTime)
      : { recommended: null, alternatives: [], discarded: schedule.ida, cutoffTime: null };

  const vuelta: RecommendationGroup =
    lastClassTime !== null
      ? classifyVuelta(schedule.vuelta, lastClassTime)
      : { recommended: null, alternatives: [], discarded: schedule.vuelta, cutoffTime: null };

  return { ida, vuelta, firstClassTime, lastClassTime, hasData };
}
