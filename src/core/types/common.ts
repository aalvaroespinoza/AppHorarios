/**
 * Días de la semana disponibles para cursada.
 * Se usa como discriminador en horarios y materias.
 */
export type DayOfWeek =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

/**
 * Turno académico en el que se dicta una materia.
 */
export type Shift = 'mañana' | 'tarde' | 'noche';

/**
 * Formato de hora en string HH:MM (24 h).
 * Ejemplo: "07:30", "14:00", "20:45"
 */
export type TimeString = string;

/**
 * Identificador único opaco para entidades del dominio.
 */
export type ID = string;
