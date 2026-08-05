import type { SubjectData } from '@/types/subject';

/**
 * Base de datos estática de materias.
 * Representa la cursada actual.
 */
export const subjectData: SubjectData = {
  version: '1.0.0',
  updatedAt: new Date().toISOString(),
  subjects: [
    {
      id: 'arquitectura',
      name: 'Arquitectura de Computadoras',
      shift: 'tarde',
      modality: 'presencial',
      isOptional: false,
      classBlocks: [
        {
          day: 'martes',
          startTime: '13:00',
          endTime: '17:00',
        }
      ]
    },
    {
      id: 'sistemas-operativos',
      name: 'Sistemas Operativos',
      shift: 'noche',
      modality: 'presencial',
      isOptional: false,
      classBlocks: [
        {
          day: 'martes',
          startTime: '18:15',
          endTime: '22:30',
        },
        {
          day: 'jueves',
          startTime: '20:30',
          endTime: '22:30',
        }
      ]
    },
    {
      id: 'diseño',
      name: 'Diseño de Sistemas',
      shift: 'noche',
      modality: 'virtual',
      isOptional: false,
      classBlocks: [
        {
          day: 'miercoles',
          startTime: '18:15',
          endTime: '22:30',
        }
      ]
    },
    {
      id: 'economia',
      name: 'Economía',
      shift: 'noche',
      modality: 'presencial',
      isOptional: true,
      classBlocks: [
        {
          day: 'jueves',
          startTime: '18:15',
          endTime: '20:15',
        }
      ]
    },
    {
      id: 'redes',
      name: 'Redes de Información',
      shift: 'noche',
      modality: 'presencial',
      isOptional: false,
      classBlocks: [
        {
          day: 'viernes',
          startTime: '18:15',
          endTime: '22:30',
        }
      ]
    }
  ],
};
