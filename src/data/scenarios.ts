import type { Scenario } from '@/types/scenario';

/**
 * Escenarios de cursada según el día.
 */
export const scenarios: Scenario[] = [
  {
    id: 'martes-con-arquitectura',
    label: 'Martes con Arquitectura',
    day: 'martes',
    activeSubjectIds: ['arquitectura', 'sistemas-operativos'],
    description: 'Martes de cursada extendida (Tarde + Noche)',
  },
  {
    id: 'martes-sin-arquitectura',
    label: 'Martes sin Arquitectura',
    day: 'martes',
    activeSubjectIds: ['sistemas-operativos'],
    description: 'Martes de cursada normal (Noche)',
  },
  {
    id: 'miercoles',
    label: 'Miércoles (Virtual)',
    day: 'miercoles',
    activeSubjectIds: ['diseño'],
    description: 'Miércoles virtual, no requiere colectivo',
  },
  {
    id: 'jueves',
    label: 'Jueves',
    day: 'jueves',
    activeSubjectIds: ['economia', 'sistemas-operativos'],
    description: 'Jueves normal (Noche)',
  },
  {
    id: 'viernes',
    label: 'Viernes',
    day: 'viernes',
    activeSubjectIds: ['redes'],
    description: 'Viernes normal (Noche)',
  }
];
