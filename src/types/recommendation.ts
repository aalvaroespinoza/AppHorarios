import type { ID, DayOfWeek } from '@/core/types/common';
import type { BusService } from './schedule';
import type { Subject } from './subject';

/**
 * Nivel de urgencia o conveniencia de una recomendación.
 */
export type RecommendationPriority = 'alta' | 'media' | 'baja';

/**
 * Razón por la que se sugiere un servicio concreto.
 */
export type RecommendationReason =
  | 'llega_a_tiempo'       // El colectivo llega antes del inicio de la clase
  | 'margen_ajustado'      // Llega con poco margen de tiempo
  | 'ultima_opcion'        // Último servicio disponible antes de la clase
  | 'regreso_optimo';      // Mejor opción para el regreso tras la clase

/**
 * Recomendación de un servicio de colectivo
 * vinculada a una materia específica.
 */
export interface Recommendation {
  id: ID;
  /** Día al que aplica esta recomendación */
  day: DayOfWeek;
  /** Materia asociada */
  subject: Pick<Subject, 'id' | 'name' | 'shift'>;
  /** Servicio de colectivo recomendado */
  busService: BusService;
  /** Razón de la recomendación */
  reason: RecommendationReason;
  /** Prioridad visual para ordenar en la UI */
  priority: RecommendationPriority;
  /**
   * Margen en minutos entre la llegada del colectivo
   * y el inicio de la clase (puede ser negativo si llega tarde).
   */
  marginMinutes: number;
  /** Nota adicional para mostrar al usuario */
  note?: string;
}

/**
 * Conjunto de recomendaciones para un día completo.
 */
export interface DayRecommendations {
  day: DayOfWeek;
  /** Recomendaciones de ida (Despeñaderos → UTN) */
  outbound: Recommendation[];
  /** Recomendaciones de regreso (UTN → Despeñaderos) */
  inbound: Recommendation[];
}
