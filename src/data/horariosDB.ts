import { DiaSemana, Horario } from '../types';

export const HORARIOS_COLECTIVOS: Record<DiaSemana, Horario[]> = {
  lunes: [],
  martes: [
    { empresa: 'Canelo', horaSalida: '06:30', tipo: 'ida' },
    { empresa: 'Canelo', horaSalida: '06:40', tipo: 'ida' },
    { empresa: 'Intercordoba', horaSalida: '06:45', tipo: 'ida' },
    { empresa: 'Canelo', horaSalida: '21:00', tipo: 'vuelta', nota: 'Después de Paradigmas' },
    { empresa: 'Lumasa', horaSalida: '21:15', tipo: 'vuelta' }
  ],
  miercoles: [
    { empresa: 'Canelo', horaSalida: '06:30', tipo: 'ida' },
    { empresa: 'Canelo', horaSalida: '06:40', tipo: 'ida' },
    { empresa: 'Intercordoba', horaSalida: '06:45', tipo: 'ida' },
    { empresa: 'Canelo', horaSalida: '16:00', tipo: 'vuelta', nota: 'Fin cursado 15:40' },
    { empresa: 'Intercordoba', horaSalida: '16:15', tipo: 'vuelta' }
  ],
  jueves: [
    { empresa: 'Canelo', horaSalida: '06:30', tipo: 'ida' },
    { empresa: 'Canelo', horaSalida: '06:40', tipo: 'ida' },
    { empresa: 'Intercordoba', horaSalida: '06:45', tipo: 'ida' },
    { empresa: 'Canelo', horaSalida: '18:20', tipo: 'vuelta', nota: 'Fin cursado 18:05' },
    { empresa: 'Sierras', horaSalida: '18:40', tipo: 'vuelta' }
  ],
  viernes: [
    { empresa: 'Lumasa', horaSalida: '17:30', tipo: 'ida', nota: 'Para llegar a Paradigmas 19:55' },
    { empresa: 'Sierras', horaSalida: '23:30', tipo: 'vuelta', nota: 'Fin de clases 23:05' },
    { empresa: 'Canelo', horaSalida: '23:45', tipo: 'vuelta' }
  ],
  sabado: [],
  domingo: []
};
