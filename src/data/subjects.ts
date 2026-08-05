import type { SubjectData } from '@/types/subject';

/**
 * Base de datos estática de materias.
 * Cursada real — NO modificar con datos inventados.
 */
export const subjectData: SubjectData = {
  version: '2.0.0',
  updatedAt: new Date().toISOString(),
  subjects: [
    {
      id: 'ingles-i',
      name: 'Inglés I',
      shift: 'mañana',
      modality: 'presencial',
      isOptional: false,
      classBlocks: [
        { day: 'lunes', startTime: '11:20', endTime: '12:50' },
      ],
    },
    {
      id: 'arquitectura-computadoras',
      name: 'Arquitectura de Computadoras',
      shift: 'mañana',
      modality: 'presencial',
      isOptional: false,
      classBlocks: [
        { day: 'martes', startTime: '08:00', endTime: '11:10' },
        { day: 'jueves', startTime: '08:00', endTime: '11:10' },
      ],
    },
    {
      id: 'analisis-sistemas-informacion',
      name: 'Análisis de Sistemas de Información',
      shift: 'mañana',
      modality: 'presencial',
      isOptional: false,
      classBlocks: [
        { day: 'miercoles', startTime: '08:00', endTime: '10:25' },
        { day: 'jueves', startTime: '11:20', endTime: '14:00' },
      ],
    },
    {
      id: 'sintaxis-semantica-lenguajes',
      name: 'Sintaxis y Semántica de los Lenguajes',
      shift: 'tarde',
      modality: 'presencial',
      isOptional: false,
      classBlocks: [
        { day: 'miercoles', startTime: '12:05', endTime: '15:40' },
        { day: 'jueves', startTime: '14:55', endTime: '18:05' },
      ],
    },
    {
      id: 'paradigmas-programacion',
      name: 'Paradigmas de Programación',
      shift: 'noche',
      modality: 'presencial',
      isOptional: false,
      classBlocks: [
        { day: 'martes', startTime: '17:20', endTime: '20:40' },
        { day: 'viernes', startTime: '19:55', endTime: '23:05' },
      ],
    },
    {
      id: 'algebra-geometria-analitica',
      name: 'Álgebra y Geometría Analítica',
      shift: 'tarde',
      modality: 'virtual',
      isOptional: false,
      classBlocks: [
        { day: 'viernes', startTime: '14:00', endTime: '17:10' },
      ],
    },
    {
      id: 'fisica-i',
      name: 'Física I',
      shift: 'mañana',
      modality: 'virtual',
      isOptional: true,
      classBlocks: [
        { day: 'sabado', startTime: '09:00', endTime: '13:00' },
      ],
    },
  ],
};
