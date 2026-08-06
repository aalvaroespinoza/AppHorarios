import type { DayOfWeek } from '@/core/types/common';
import type { Subject } from './subject';

/**
 * Identificadores canónicos de cada escenario de cursada.
 * Cada escenario puede implicar distintos horarios de colectivo.
 */
export type ScenarioId =
  | 'martes-con-arquitectura'
  | 'martes-sin-arquitectura'
  | 'miercoles'
  | 'jueves'
  | 'viernes';

/**
 * Resultado del motor de escenarios.
 * Cuando el día actual no tiene cursada, es null.
 */
export type ScenarioResult = ScenarioId | null;

/**
 * Definición estática de un escenario: qué día aplica,
 * qué materias están activas y qué label mostrar en la UI.
 */
export interface Scenario {
  id: ScenarioId;
  /** Etiqueta legible para la UI */
  label: string;
  /** Día de la semana al que corresponde este escenario */
  day: DayOfWeek;
  /**
   * IDs de las materias activas en este escenario.
   * Referencia los IDs definidos en data/subjects.ts.
   */
  activeSubjectIds: Subject['id'][];
  /**
   * Descripción breve del escenario (uso interno / debugging).
   */
  description: string;
}

/**
 * Opciones que el motor puede recibir para resolver ambigüedades.
 * Por ejemplo: los martes se necesita saber si hay Arquitectura.
 */
export interface ScenarioEngineOptions {
  /**
   * Indica explícitamente si el martes actual incluye Arquitectura.
   * Si se omite, el motor usará la lógica por defecto (retornará null
   * y delegará la decisión al llamador).
   */
  tuesdayHasArquitectura?: boolean;
  /**
   * Fecha a evaluar. Si se omite, se usa la fecha/hora actual del sistema.
   * Útil para tests y simulaciones.
   */
  referenceDate?: Date;
}
