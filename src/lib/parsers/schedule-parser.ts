import type { BusService, RawScheduleEntry, Direction } from '@/types/schedule';
import type { DayOfWeek } from '@/types/common';

// ─── Contador interno para generar IDs deterministas ─────────────────────────

/**
 * Genera un ID único para un BusService a partir de sus campos clave.
 * El ID es estable mientras no cambie la entrada.
 *
 * Formato: `svc-{empresa}-{sentido}-{dia}-{horaSalida}`
 * Ejemplo: `svc-empresa-ejemplo-ida-martes-0630`
 */
function buildServiceId(entry: RawScheduleEntry): string {
  const salida = entry.horaSalida.replace(':', '');
  return `svc-${entry.empresa}-${entry.sentido}-${entry.dia}-${salida}`;
}

/**
 * Valida que un string tenga formato HH:MM (24 h).
 * No lanza excepción: retorna false si el formato es inválido.
 */
export function isValidTimeString(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

/**
 * Valida que un sentido sea 'ida' o 'vuelta'.
 */
export function isValidDirection(value: string): value is Direction {
  return value === 'ida' || value === 'vuelta';
}

/**
 * Valida que un día sea uno de los días permitidos.
 */
export function isValidDay(value: string): value is DayOfWeek {
  const allowed: DayOfWeek[] = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
  ];
  return allowed.includes(value as DayOfWeek);
}

/**
 * Transforma una RawScheduleEntry en un BusService tipado.
 *
 * Lanza un Error descriptivo si algún campo requerido es inválido,
 * para facilitar la detección de errores al cargar datos.
 *
 * @param entry - Entrada cruda del dataset
 * @returns BusService normalizado
 */
export function parseScheduleEntry(entry: RawScheduleEntry): BusService {
  if (!entry.empresa || entry.empresa.trim() === '') {
    throw new Error(`[parseScheduleEntry] Campo 'empresa' vacío: ${JSON.stringify(entry)}`);
  }

  if (!isValidDirection(entry.sentido)) {
    throw new Error(
      `[parseScheduleEntry] Sentido inválido '${entry.sentido}'. Debe ser 'ida' o 'vuelta'.`,
    );
  }

  if (!isValidDay(entry.dia)) {
    throw new Error(
      `[parseScheduleEntry] Día inválido '${entry.dia}'.`,
    );
  }

  if (!isValidTimeString(entry.horaSalida)) {
    throw new Error(
      `[parseScheduleEntry] horaSalida '${entry.horaSalida}' no tiene formato HH:MM.`,
    );
  }

  if (!isValidTimeString(entry.horaLlegada)) {
    throw new Error(
      `[parseScheduleEntry] horaLlegada '${entry.horaLlegada}' no tiene formato HH:MM.`,
    );
  }

  return {
    id: buildServiceId(entry),
    companyId: entry.empresa.trim(),
    line: entry.linea?.trim(),
    direction: entry.sentido,
    day: entry.dia,
    departureTime: entry.horaSalida,
    arrivalTime: entry.horaLlegada,
    notes: entry.notas?.trim(),
  };
}

/**
 * Parsea un array de entradas crudas en un array de BusService.
 *
 * Las entradas inválidas son descartadas y se registra un warning
 * por consola en lugar de lanzar una excepción global.
 *
 * @param rawEntries - Array de entradas crudas
 * @returns Array de BusService válidos
 */
export function parseAllScheduleEntries(
  rawEntries: RawScheduleEntry[],
): BusService[] {
  const results: BusService[] = [];

  for (const entry of rawEntries) {
    try {
      results.push(parseScheduleEntry(entry));
    } catch (err) {
      // En producción se podría enviar a un sistema de monitoreo
      console.warn('[schedule-parser]', (err as Error).message);
    }
  }

  return results;
}

// ─── Funciones de filtrado (sin cálculos) ────────────────────────────────────

/**
 * Filtra servicios por día de la semana.
 *
 * @param services - Lista de BusService
 * @param day - Día a filtrar
 * @returns Servicios que operan en ese día
 */
export function filterByDay(
  services: BusService[],
  day: DayOfWeek,
): BusService[] {
  return services.filter((s) => s.day === day);
}

/**
 * Filtra servicios por sentido (ida / vuelta).
 *
 * @param services - Lista de BusService
 * @param direction - Sentido a filtrar
 * @returns Servicios en ese sentido
 */
export function filterByDirection(
  services: BusService[],
  direction: Direction,
): BusService[] {
  return services.filter((s) => s.direction === direction);
}

/**
 * Filtra servicios por empresa.
 *
 * @param services - Lista de BusService
 * @param companyId - ID de la empresa
 * @returns Servicios de esa empresa
 */
export function filterByCompany(
  services: BusService[],
  companyId: string,
): BusService[] {
  return services.filter((s) => s.companyId === companyId);
}

/**
 * Combina filtros de día y sentido.
 * Atajo conveniente para el caso de uso más frecuente.
 */
export function filterByDayAndDirection(
  services: BusService[],
  day: DayOfWeek,
  direction: Direction,
): BusService[] {
  return services.filter((s) => s.day === day && s.direction === direction);
}
