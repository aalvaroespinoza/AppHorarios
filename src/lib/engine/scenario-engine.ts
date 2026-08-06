import type {
  ScenarioId,
  ScenarioResult,
  ScenarioEngineOptions,
  Scenario,
} from '@/types/scenario';
import type { DayOfWeek } from '@/core/types/common';
import { scenarios } from '@/data/scenarios';

// ─── Constantes internas ──────────────────────────────────────────────────────

const TZ = 'America/Argentina/Cordoba';

/**
 * Mapeo de número de día JS (0=domingo) → DayOfWeek.
 * Los días sin cursada quedan como null.
 */
const JS_DAY_TO_DOW: Record<number, DayOfWeek | null> = {
  0: null,        // domingo
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado',
};

/**
 * Devuelve el número de día JS (0=domingo…6=sábado) para una fecha
 * evaluada en la zona horaria de Córdoba, Argentina.
 * Evita que el desfase UTC‑3 produzca el día incorrecto en el servidor.
 */
function weekdayInArgentina(date: Date): number {
  const name = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: TZ,
  }).format(date);
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return map[name] ?? date.getDay();
}

/**
 * Días de la semana que tienen cursada.
 * Lunes, sábado y domingo están excluidos actualmente.
 */
const SCHOOL_DAYS: DayOfWeek[] = ['martes', 'miercoles', 'jueves', 'viernes'];

// ─── Funciones puras de soporte ───────────────────────────────────────────────

/**
 * Convierte una fecha JS al DayOfWeek correspondiente.
 * Retorna null si el día no tiene cursada (domingo, lunes, sábado).
 *
 * @param date - Fecha a convertir
 * @returns DayOfWeek válido o null
 */
export function dateToSchoolDay(date: Date): DayOfWeek | null {
  const jsDay = weekdayInArgentina(date);
  const dow = JS_DAY_TO_DOW[jsDay] ?? null;

  if (dow === null || !SCHOOL_DAYS.includes(dow)) {
    return null;
  }

  return dow;
}

/**
 * Dado un punto de partida, avanza día a día hasta encontrar
 * el próximo día con cursada (martes a viernes).
 *
 * @param from - Fecha de referencia (no incluida en la búsqueda)
 * @returns Fecha del próximo día de cursada
 */
export function getNextSchoolDay(from: Date): Date {
  const next = new Date(from);
  for (let i = 0; i < 7; i++) {
    next.setDate(next.getDate() + 1);
    if (dateToSchoolDay(next) !== null) return next;
  }
  // Fallback de seguridad (no debería ocurrir con Tue‑Fri como días hábiles)
  return next;
}

/**
 * Indica si un día de la semana tiene cursada.
 */
export function isSchoolDay(day: DayOfWeek): boolean {
  return SCHOOL_DAYS.includes(day);
}

/**
 * Busca la definición estática de un escenario por su ID.
 * Retorna undefined si no existe (no debería ocurrir con datos correctos).
 */
export function findScenario(id: ScenarioId): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

/**
 * Retorna todos los escenarios que corresponden a un día dado.
 * Para 'martes' retornará dos escenarios (con y sin Arquitectura).
 */
export function getScenariosForDay(day: DayOfWeek): Scenario[] {
  return scenarios.filter((s) => s.day === day);
}

// ─── Motor principal ──────────────────────────────────────────────────────────

/**
 * Determina el ScenarioId que aplica dado el momento actual
 * y las opciones de contexto.
 *
 * Reglas:
 * 1. Si el día no tiene cursada → retorna null.
 * 2. Si es martes:
 *    - Si `tuesdayHasArquitectura` es true  → 'martes-con-arquitectura'
 *    - Si `tuesdayHasArquitectura` es false → 'martes-sin-arquitectura'
 *    - Si no se especifica               → retorna null (ambigüedad sin resolver)
 * 3. Para el resto de los días con cursada → retorna el ScenarioId del día.
 *
 * @param options - Opciones opcionales del motor
 * @returns ScenarioId activo o null si no hay cursada / ambigüedad
 */
export function determineScenario(
  options: ScenarioEngineOptions = {},
): ScenarioResult {
  const { tuesdayHasArquitectura, referenceDate } = options;
  const now = referenceDate ?? new Date();

  const day = dateToSchoolDay(now);

  // Sin cursada hoy
  if (day === null) return null;

  // Martes: requiere desambiguación
  if (day === 'martes') {
    if (tuesdayHasArquitectura === true) return 'martes-con-arquitectura';
    if (tuesdayHasArquitectura === false) return 'martes-sin-arquitectura';
    // No se indicó → ambigüedad sin resolver
    return null;
  }

  // Resto de días con cursada: el ID del escenario coincide con el día
  const scenarioId = day as ScenarioId;

  // Verificar que exista definido (guarda de seguridad)
  if (!findScenario(scenarioId)) {
    console.warn(
      `[scenario-engine] No se encontró definición para el escenario '${scenarioId}'.`,
    );
    return null;
  }

  return scenarioId;
}

/**
 * Variante tipada: igual que determineScenario pero lanza si hay ambigüedad.
 * Útil cuando el llamador garantiza que siempre pasará tuesdayHasArquitectura.
 *
 * @throws Error si el resultado es null
 */
export function determineScenarioOrThrow(
  options: ScenarioEngineOptions = {},
): ScenarioId {
  const result = determineScenario(options);

  if (result === null) {
    throw new Error(
      '[scenario-engine] No se pudo determinar el escenario. ' +
        'Verificá que haya cursada hoy y que tuesdayHasArquitectura esté definido si es martes.',
    );
  }

  return result;
}
