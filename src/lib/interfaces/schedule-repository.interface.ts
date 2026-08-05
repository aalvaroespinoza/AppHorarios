import type { ScheduleData } from '@/types/schedule';

/**
 * Repositorio de horarios.
 * Interfaz que abstrae la fuente de datos (JSON local, API, etc.).
 * Implementar en lib/repositories/schedule-repository.ts
 */
export interface ScheduleRepository {
  /** Retorna todos los horarios disponibles */
  getAll(): Promise<ScheduleData>;
}
