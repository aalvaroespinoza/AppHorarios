import type { BusService } from '@/types/schedule';
import type { DayOfWeek } from '@/types/common';
import type { Company } from '@/types/company';
import type { RawScheduleEntry } from '@/types/schedule';
import {
  parseAllScheduleEntries,
  filterByDay,
  filterByDirection,
} from '@/lib/parsers/schedule-parser';
import { compareTime } from '@/utils/time';

// ─── Tipos del servicio ───────────────────────────────────────────────────────

/**
 * BusService con el nombre de la empresa ya resuelto.
 * Listo para ser consumido por componentes sin lookups adicionales.
 */
export interface ResolvedBusService extends BusService {
  companyName: string;
}

/**
 * Resultado del servicio de horarios agrupado por sentido.
 */
export interface ScheduleForDay {
  ida: ResolvedBusService[];
  vuelta: ResolvedBusService[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Busca el nombre legible de una empresa por su ID.
 * Si no se encuentra, devuelve el propio ID como fallback.
 */
export function resolveCompanyName(
  companyId: string,
  companies: Company[],
): string {
  return companies.find((c) => c.id === companyId)?.shortName ?? companyId;
}

/**
 * Ordena un array de BusService cronológicamente por hora de salida.
 * Devuelve una copia nueva sin mutar el original.
 */
export function sortByDepartureTime(
  services: BusService[],
): BusService[] {
  return [...services].sort((a, b) =>
    compareTime(a.departureTime, b.departureTime),
  );
}

/**
 * Adjunta el nombre de empresa resuelto a cada BusService.
 */
function resolveServices(
  services: BusService[],
  companies: Company[],
): ResolvedBusService[] {
  return services.map((s) => ({
    ...s,
    companyName: resolveCompanyName(s.companyId, companies),
  }));
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Procesa los datos crudos y devuelve los servicios del día solicitado,
 * agrupados por sentido y ordenados cronológicamente.
 *
 * Flujo:
 *   rawEntries → parse → filter(day) → sort → split(ida/vuelta) → resolve names
 *
 * @param day       - Día de la semana a filtrar
 * @param rawEntries - Entradas crudas del dataset
 * @param companies  - Lista de empresas para resolver nombres
 * @returns Servicios de ida y vuelta listos para renderizar
 */
export function getScheduleForDay(
  day: DayOfWeek,
  rawEntries: RawScheduleEntry[],
  companies: Company[],
): ScheduleForDay {
  // 1. Parsear todas las entradas (descarta inválidas con warning)
  const allServices = parseAllScheduleEntries(rawEntries);

  // 2. Filtrar por día
  const dayServices = filterByDay(allServices, day);

  // 3. Ordenar cronológicamente
  const sorted = sortByDepartureTime(dayServices);

  // 4. Separar por sentido y resolver nombres de empresa
  const ida = resolveServices(filterByDirection(sorted, 'ida'), companies);
  const vuelta = resolveServices(filterByDirection(sorted, 'vuelta'), companies);

  return { ida, vuelta };
}
