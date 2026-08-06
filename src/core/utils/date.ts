/**
 * Formatea una fecha como string largo en español argentino.
 * Ejemplo: "martes, 5 de agosto de 2026"
 *
 * Se usa en Server Components (no expone Date al cliente).
 */
export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Cordoba',
  }).format(date);
}

/**
 * Formatea un rango HH:MM–HH:MM para mostrar en la UI.
 * Ejemplo: ("16:00", "19:00") → "16:00–19:00"
 */
export function formatTimeRange(start: string, end: string): string {
  return `${start}–${end}`;
}

/**
 * getDayOfWeek
 *
 * Retorna el día de la semana actual como DayOfWeek.
 * TODO: implementar si se necesita fuera del scenario-engine.
 */
export function getDayOfWeek(): string {
  // TODO: implementar
  throw new Error('getDayOfWeek: aún no implementado');
}
