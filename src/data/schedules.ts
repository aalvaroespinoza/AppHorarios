import type { RawScheduleEntry, Direction } from '@/types/schedule';
import type { DayOfWeek } from '@/types/common';

/**
 * Base de datos cruda de horarios de colectivo.
 * Relevados a mano de carteles/capturas de Canelo, Lumasa e Intercordoba
 * (agosto 2026). NO inventar ni completar con datos supuestos — si falta
 * un horario, mejor dejarlo afuera que inventarlo.
 *
 * Canelo avisó cambio de horarios próximo — reconfirmar antes de un viaje
 * real. Tel: (03547) 497666.
 */

const DIAS_HABILES: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

// Minutos de viaje estimados cuando la empresa no publica hora de llegada
const VIAJE_ESTIMADO_MIN = 65;

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor((total / 60) % 24).toString().padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function expandirLunesAViernes(
  empresa: string,
  sentido: Direction,
  horas: string[],
  llegadas?: string[], // si no se pasa, se estima
  notas?: string,
): RawScheduleEntry[] {
  const entries: RawScheduleEntry[] = [];
  DIAS_HABILES.forEach((dia) => {
    horas.forEach((horaSalida, i) => {
      const horaLlegada = llegadas ? llegadas[i] : sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN);
      entries.push({
        empresa,
        sentido,
        horaSalida,
        horaLlegada,
        dia,
        notas: llegadas ? notas : (notas ? `${notas} · llegada estimada` : 'llegada estimada'),
      });
    });
  });
  return entries;
}

// ─── IDA (Despeñaderos → Córdoba), Lunes a Viernes ───────────────────────
const CANELO_IDA = [
  '05:30', '06:30', '06:40', '07:50', '09:20', '10:50',
  '12:20', '13:40', '15:20', '16:55', '18:20', '20:00', '21:20',
];

const INTERCORDOBA_IDA = [
  '06:45', '08:45', '11:35', '14:00', '16:00', '18:45', '20:00', '20:45', '22:25',
];

const LUMASA_IDA_SALIDA = ['07:20', '09:20', '11:20', '13:20', '15:20', '17:20', '19:20', '21:20'];
const LUMASA_IDA_LLEGADA = ['08:20', '10:20', '12:20', '14:20', '16:20', '18:20', '20:20', '22:20'];

// ─── VUELTA (Córdoba → Despeñaderos), Lunes a Viernes ────────────────────
const INTERCORDOBA_VUELTA = [
  '07:00', '09:45', '10:30', '12:15', '13:15', '14:00', '16:00', '17:00', '18:15', '20:00', '21:15',
];

const LUMASA_VUELTA_SALIDA = ['06:30', '08:30', '10:40', '12:30', '14:30', '16:30', '18:30', '20:30'];
const LUMASA_VUELTA_LLEGADA = ['07:30', '09:30', '11:40', '13:30', '15:30', '17:30', '19:30', '21:30'];

// ─── SÁBADOS ─────────────────────────────────────────────────────────────
// Canelo confirmado por teléfono (terminal a terminal). Lumasa
// calculado con el mismo desfase Río Tercero/Despeñaderos/Córdoba que ya
// usa la tabla de lunes a viernes. Intercordoba ya estaba cargado (servicios "diario").

const CANELO_IDA_SABADO = ['07:00'];
const INTERCORDOBA_IDA_SABADO = ['08:45', '14:00', '18:45', '20:00', '22:25']; // ya son "diario"

const LUMASA_IDA_SABADO_SALIDA = ['09:20', '11:20', '13:20', '15:20', '17:20', '19:20', '21:20'];
const LUMASA_IDA_SABADO_LLEGADA = ['10:20', '12:20', '14:20', '16:20', '18:20', '20:20', '22:20'];

const CANELO_VUELTA_SABADO = ['13:30'];
const INTERCORDOBA_VUELTA_SABADO = ['07:00', '10:30', '17:00', '18:15', '20:00'];

const LUMASA_VUELTA_SABADO_SALIDA = ['08:30', '10:40', '12:30', '14:30', '16:30', '18:30', '20:30'];
const LUMASA_VUELTA_SABADO_LLEGADA = ['09:30', '11:40', '13:30', '15:30', '17:30', '19:30', '21:30'];

export const rawScheduleEntries: RawScheduleEntry[] = [
  ...expandirLunesAViernes('canelo', 'ida', CANELO_IDA),
  ...expandirLunesAViernes('intercordoba', 'ida', INTERCORDOBA_IDA),
  ...expandirLunesAViernes('lumasa', 'ida', LUMASA_IDA_SALIDA, LUMASA_IDA_LLEGADA),

  ...expandirLunesAViernes('intercordoba', 'vuelta', INTERCORDOBA_VUELTA),
  ...expandirLunesAViernes('lumasa', 'vuelta', LUMASA_VUELTA_SALIDA, LUMASA_VUELTA_LLEGADA),

  ...CANELO_IDA_SABADO.map((horaSalida): RawScheduleEntry => ({
    empresa: 'canelo', sentido: 'ida', horaSalida,
    horaLlegada: sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN),
    dia: 'sabado', notas: 'confirmado por teléfono · llegada estimada',
  })),
  ...INTERCORDOBA_IDA_SABADO.map((horaSalida): RawScheduleEntry => ({
    empresa: 'intercordoba', sentido: 'ida', horaSalida,
    horaLlegada: sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN),
    dia: 'sabado', notas: 'servicio diario · llegada estimada',
  })),
  ...LUMASA_IDA_SABADO_SALIDA.map((horaSalida, i): RawScheduleEntry => ({
    empresa: 'lumasa', sentido: 'ida', horaSalida,
    horaLlegada: LUMASA_IDA_SABADO_LLEGADA[i],
    dia: 'sabado',
  })),
  ...CANELO_VUELTA_SABADO.map((horaSalida): RawScheduleEntry => ({
    empresa: 'canelo', sentido: 'vuelta', horaSalida,
    horaLlegada: sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN),
    dia: 'sabado', notas: 'confirmado por teléfono · llegada estimada',
  })),
  ...INTERCORDOBA_VUELTA_SABADO.map((horaSalida): RawScheduleEntry => ({
    empresa: 'intercordoba', sentido: 'vuelta', horaSalida,
    horaLlegada: sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN),
    dia: 'sabado', notas: 'solo servicios diarios · llegada estimada',
  })),
  ...LUMASA_VUELTA_SABADO_SALIDA.map((horaSalida, i): RawScheduleEntry => ({
    empresa: 'lumasa', sentido: 'vuelta', horaSalida,
    horaLlegada: LUMASA_VUELTA_SABADO_LLEGADA[i],
    dia: 'sabado',
  })),
];
