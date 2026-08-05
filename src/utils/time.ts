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
