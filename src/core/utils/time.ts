// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Convierte un string HH:MM a minutos desde medianoche.
 * Función interna pura, no se exporta.
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Devuelve el string HH:MM tal cual para mostrar en la UI.
 * Argentina usa formato 24 h, no se necesita conversión.
 *
 * @example formatTime("07:30") → "07:30"
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * Calcula la diferencia en minutos entre la llegada y el inicio de clase.
 * Retorna positivo si el colectivo llega antes, negativo si llega tarde.
 *
 * @param arrivalTime  - Hora de llegada del colectivo (HH:MM)
 * @param targetTime   - Hora de inicio de la clase (HH:MM)
 * @returns Minutos de margen (positivo = tiempo de sobra)
 *
 * @example calculateMarginMinutes("07:45", "08:00") → 15
 * @example calculateMarginMinutes("08:10", "08:00") → -10
 */
export function calculateMarginMinutes(
  arrivalTime: string,
  targetTime: string,
): number {
  return timeToMinutes(targetTime) - timeToMinutes(arrivalTime);
}

/**
 * Compara dos strings HH:MM para ordenar cronológicamente.
 * Apto como función de comparación para Array.sort().
 *
 * @example ["14:00","07:30"].sort(compareTime) → ["07:30","14:00"]
 */
export function compareTime(a: string, b: string): number {
  return timeToMinutes(a) - timeToMinutes(b);
}

/**
 * Calcula la hora estimada de llegada (ETA) de un viaje en colectivo.
 * Añade penalizaciones de tráfico offline basadas en el tipo de viaje y la hora pico.
 *
 * @param horaSalida - Hora a la que sale el colectivo (formato "HH:MM")
 * @param tipoViaje - Dirección del viaje ('ida' o 'vuelta')
 * @returns Hora estimada de llegada (formato "HH:MM")
 */
export function calcularHoraLlegada(horaSalida: string, tipoViaje: 'ida' | 'vuelta'): string {
  const minutosSalida = timeToMinutes(horaSalida);
  let tiempoViajeMinutos = 60; // Base: 1 hora

  if (tipoViaje === 'ida') {
    // Hora pico a la ida: 06:00 (360) a 07:30 (450)
    if (minutosSalida >= 360 && minutosSalida <= 450) {
      tiempoViajeMinutos += 20;
    }
  } else if (tipoViaje === 'vuelta') {
    // Hora pico a la vuelta: 16:00 (960) a 18:30 (1110)
    if (minutosSalida >= 960 && minutosSalida <= 1110) {
      tiempoViajeMinutos += 15;
    }
  }

  // Sumar tiempo de viaje y calcular hora y minuto
  let minutosLlegada = minutosSalida + tiempoViajeMinutos;
  minutosLlegada = minutosLlegada % 1440; // Manejar cruce de medianoche

  const h = Math.floor(minutosLlegada / 60);
  const m = minutosLlegada % 60;

  // Formatear a string "HH:MM" con padding
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');

  return `${hh}:${mm}`;
}
