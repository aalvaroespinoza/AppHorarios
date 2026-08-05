import type { RawScheduleEntry } from '@/types/schedule';

/**
 * Base de datos cruda de horarios de colectivos.
 * Se separa en ida (hacia UTN) y vuelta (hacia Despeñaderos).
 */
export const rawScheduleEntries: RawScheduleEntry[] = [
  // ─── IDA (Despeñaderos → UTN) ─────────────────────────────
  // Mañana (migrados)
  { empresa: 'canelo', sentido: 'ida', horaSalida: '06:30', horaLlegada: '07:45', dia: 'martes' },
  { empresa: 'canelo', sentido: 'ida', horaSalida: '06:40', horaLlegada: '07:55', dia: 'martes' },
  { empresa: 'intercordoba', sentido: 'ida', horaSalida: '06:45', horaLlegada: '08:00', dia: 'martes' },
  { empresa: 'canelo', sentido: 'ida', horaSalida: '06:30', horaLlegada: '07:45', dia: 'miercoles' },
  { empresa: 'canelo', sentido: 'ida', horaSalida: '06:40', horaLlegada: '07:55', dia: 'miercoles' },
  { empresa: 'intercordoba', sentido: 'ida', horaSalida: '06:45', horaLlegada: '08:00', dia: 'miercoles' },
  { empresa: 'canelo', sentido: 'ida', horaSalida: '06:30', horaLlegada: '07:45', dia: 'jueves' },
  { empresa: 'canelo', sentido: 'ida', horaSalida: '06:40', horaLlegada: '07:55', dia: 'jueves' },
  { empresa: 'intercordoba', sentido: 'ida', horaSalida: '06:45', horaLlegada: '08:00', dia: 'jueves' },

  // Tarde/Noche
  { empresa: 'canelo', sentido: 'ida', horaSalida: '11:00', horaLlegada: '12:15', dia: 'martes', notas: 'Directo' },
  { empresa: 'intercordoba', sentido: 'ida', horaSalida: '12:00', horaLlegada: '13:10', dia: 'martes' },
  { empresa: 'lumasa', sentido: 'ida', horaSalida: '16:00', horaLlegada: '17:15', dia: 'martes' },
  { empresa: 'sierras', sentido: 'ida', horaSalida: '17:00', horaLlegada: '18:10', dia: 'martes' },
  { empresa: 'sierras', sentido: 'ida', horaSalida: '17:00', horaLlegada: '18:10', dia: 'jueves' },
  { empresa: 'sierras', sentido: 'ida', horaSalida: '17:00', horaLlegada: '18:10', dia: 'viernes' },

  // ─── VUELTA (UTN → Despeñaderos) ──────────────────────────
  { empresa: 'canelo', sentido: 'vuelta', horaSalida: '17:30', horaLlegada: '18:45', dia: 'martes' },
  { empresa: 'lumasa', sentido: 'vuelta', horaSalida: '22:45', horaLlegada: '23:55', dia: 'martes' },
  { empresa: 'sierras', sentido: 'vuelta', horaSalida: '23:00', horaLlegada: '00:10', dia: 'martes' },
  { empresa: 'intercordoba', sentido: 'vuelta', horaSalida: '23:15', horaLlegada: '00:30', dia: 'martes' },

  { empresa: 'lumasa', sentido: 'vuelta', horaSalida: '22:45', horaLlegada: '23:55', dia: 'jueves' },
  { empresa: 'sierras', sentido: 'vuelta', horaSalida: '23:00', horaLlegada: '00:10', dia: 'jueves' },

  { empresa: 'lumasa', sentido: 'vuelta', horaSalida: '22:45', horaLlegada: '23:55', dia: 'viernes' },
  { empresa: 'intercordoba', sentido: 'vuelta', horaSalida: '23:15', horaLlegada: '00:30', dia: 'viernes' },
];
