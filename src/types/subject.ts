import type { ID, DayOfWeek, Shift, TimeString } from './common';

/**
 * Bloque horario de una materia (ej.: un día con hora de inicio y fin).
 */
export interface ClassBlock {
  day: DayOfWeek;
  /** Hora de inicio de la clase (HH:MM) */
  startTime: TimeString;
  /** Hora de fin de la clase (HH:MM) */
  endTime: TimeString;
  /** Aula o sala asignada (opcional) */
  classroom?: string;
}

/**
 * Representa una materia de la carrera.
 */
export interface Subject {
  /** Identificador único de la materia */
  id: ID;
  /** Nombre completo de la materia */
  name: string;
  /** Código de la materia según el plan de estudios */
  code?: string;
  /** Año de la carrera al que pertenece */
  year?: number;
  /** Cuatrimestre (1 o 2) */
  semester?: 1 | 2;
  /** Turno predominante */
  shift: Shift;
  /** Bloques de clase semanales */
  classBlocks: ClassBlock[];
  /** Nombre del docente responsable (opcional) */
  professor?: string;
  /** Modalidad de cursada */
  modality: 'presencial' | 'virtual';
  /** Indica si la materia es electiva u opcional */
  isOptional?: boolean;
}

/**
 * Registro de materias activas en el cuatrimestre actual.
 */
export interface SubjectData {
  version: string;
  updatedAt: string;
  subjects: Subject[];
}
