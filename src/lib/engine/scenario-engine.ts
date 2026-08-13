import type { DayOfWeek } from '@/core/types/common';

export interface Scenario {
  id: string;
  label: string;
  description: string;
  activeSubjectIds: string[];
}

export const ALL_SCENARIOS: Scenario[] = [
  {
    id: "cursado-regular",
    label: "Cursado UTN",
    description: "Escenario de cursado regular",
    activeSubjectIds: [
      "ingles-1",
      "arquitectura-comp-mar",
      "paradigmas-prog-mar",
      "analisis-sistemas-mier",
      "sintaxis-semantica-mier",
      "arquitectura-comp-jue",
      "analisis-sistemas-jue",
      "sintaxis-semantica-jue",
      "algebra-viernes",
      "paradigmas-prog-vie",
      "fisica-sabado"
    ]
  }
];

export function determineScenario(opts?: { tuesdayHasArquitectura?: boolean; referenceDate?: Date }): string {
  return "cursado-regular";
}

export function determineScenarioOrThrow(opts?: { tuesdayHasArquitectura?: boolean; referenceDate?: Date }): string {
  return determineScenario(opts);
}

export function dateToSchoolDay(date: Date): DayOfWeek {
  const map: DayOfWeek[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return map[date.getDay()];
}

export function isSchoolDay(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 6;
}

export function findScenario(scenarioId: string): Scenario | undefined {
  return ALL_SCENARIOS.find(s => s.id === scenarioId) || ALL_SCENARIOS[0];
}

export function getScenariosForDay(day: DayOfWeek): Scenario[] {
  return ALL_SCENARIOS;
}

export function getNextSchoolDay(fromDate: Date = new Date()): Date {
  const next = new Date(fromDate);
  next.setDate(next.getDate() + 1);
  while (next.getDay() === 0) { // Omitir domingo
    next.setDate(next.getDate() + 1);
  }
  return next;
}
