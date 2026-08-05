import type { ID, DayOfWeek, TimeString } from './common';

/**
 * Sentido del viaje.
 * - `'ida'`    → Despeñaderos → UTN Córdoba
 * - `'vuelta'` → UTN Córdoba → Despeñaderos
 */
export type Direction = 'ida' | 'vuelta';

/**
 * Representa un servicio de colectivo concreto
 * (una salida específica con empresa, sentido, horario y día).
 */
export interface BusService {
  /** Identificador único del servicio */
  id: ID;
  /** Referencia al ID de la empresa en data/companies.ts */
  companyId: ID;
  /** Línea o ramal específico dentro de la empresa (ej.: "El Dorado", "Ramal A") */
  line?: string;
  /** Sentido del viaje */
  direction: Direction;
  /** Día de la semana en que opera este servicio */
  day: DayOfWeek;
  /** Hora de salida desde el origen (HH:MM, 24 h) */
  departureTime: TimeString;
  /** Hora estimada de llegada al destino (HH:MM, 24 h) */
  arrivalTime: TimeString;
  /** Observaciones opcionales (ej.: "no circula feriados", "solo días hábiles") */
  notes?: string;
}

/**
 * Estructura de entrada cruda antes del parsing.
 * Se usa para tipar el JSON/TS de datos sin procesar.
 */
export interface RawScheduleEntry {
  empresa: string;              // ID o nombre de la empresa
  sentido: Direction;
  horaSalida: TimeString;       // "HH:MM"
  horaLlegada: TimeString;      // "HH:MM"
  dia: DayOfWeek;
  linea?: string;
  notas?: string;
}

/**
 * Estructura raíz del dataset de horarios.
 */
export interface ScheduleData {
  /** Versión del dataset */
  version: string;
  /** Fecha de última actualización (ISO 8601) */
  updatedAt: string;
  /** Servicios registrados (ya parseados) */
  services: BusService[];
}
