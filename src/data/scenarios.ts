import type { Scenario } from '@/types/scenario';

/**
 * Escenarios de cursada según el día.
 * Los IDs en activeSubjectIds deben coincidir EXACTO con los ids de
 * src/data/subjects.ts. Si se renombra un id ahí, hay que actualizarlo acá.
 *
 * Nota: las materias virtuales (Álgebra, Física I) NO se incluyen acá a
 * propósito — este archivo solo modela qué materias requieren viaje en
 * colectivo ese día, no la cursada completa del día.
 */
export const scenarios: Scenario[] = [
  {
    id: 'martes-con-arquitectura',
    label: 'Martes con Arquitectura',
    day: 'martes',
    activeSubjectIds: ['arquitectura-computadoras', 'paradigmas-programacion'],
    description: 'Arquitectura 08:00 + Paradigmas 17:20 a 20:40',
  },
  {
    id: 'martes-sin-arquitectura',
    label: 'Martes sin Arquitectura',
    day: 'martes',
    activeSubjectIds: ['paradigmas-programacion'],
    description: 'Solo Paradigmas 17:20 a 20:40',
  },
  {
    id: 'miercoles',
    label: 'Miércoles',
    day: 'miercoles',
    activeSubjectIds: ['analisis-sistemas-informacion', 'sintaxis-semantica-lenguajes'],
    description: 'Cursada corrida 08:00 a 15:40',
  },
  {
    id: 'jueves',
    label: 'Jueves',
    day: 'jueves',
    activeSubjectIds: [
      'arquitectura-computadoras',
      'analisis-sistemas-informacion',
      'sintaxis-semantica-lenguajes',
    ],
    description: 'Cursada corrida 08:00 a 18:05',
  },
  {
    id: 'viernes',
    label: 'Viernes',
    day: 'viernes',
    activeSubjectIds: ['paradigmas-programacion'],
    description: 'Álgebra es virtual — solo viaja para Paradigmas 19:55',
  },
];
