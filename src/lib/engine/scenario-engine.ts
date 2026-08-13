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

export function findScenario(scenarioId: string): Scenario | undefined {
  return ALL_SCENARIOS.find(s => s.id === scenarioId) || ALL_SCENARIOS[0];
}
