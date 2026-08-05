import { Materia } from '../types';

export const MATERIAS: Materia[] = [
  // Martes
  {
    nombre: 'Arquitectura',
    dia: 'martes',
    horaInicio: '08:00',
    horaFin: '11:10',
    obligatoria: false, // Depende del escenarioUsuario (si la cursa o no)
  },
  {
    nombre: 'Paradigmas',
    dia: 'martes',
    horaInicio: '17:20',
    horaFin: '20:40',
    obligatoria: true,
  },
  // Miércoles
  {
    nombre: 'Jornada Miércoles',
    dia: 'miercoles',
    horaInicio: '08:00',
    horaFin: '15:40',
    obligatoria: true,
  },
  // Jueves
  {
    nombre: 'Jornada Jueves',
    dia: 'jueves',
    horaInicio: '08:00',
    horaFin: '18:05',
    obligatoria: true,
  },
  // Viernes
  {
    nombre: 'Álgebra (Virtual)',
    dia: 'viernes',
    horaInicio: '14:00',
    horaFin: '17:10',
    obligatoria: false, // Es virtual, no afecta traslados en cole
  },
  {
    nombre: 'Paradigmas',
    dia: 'viernes',
    horaInicio: '19:55',
    horaFin: '23:05',
    obligatoria: true,
  },
  // Sábado
  {
    nombre: 'Física (Virtual)',
    dia: 'sabado',
    horaInicio: '09:00',
    horaFin: '13:00',
    obligatoria: false, // Es virtual
  }
];
