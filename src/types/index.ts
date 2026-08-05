export type Empresa = 'Canelo' | 'Lumasa' | 'Intercordoba' | 'Sierras';

export type TipoViaje = 'ida' | 'vuelta';

export interface Horario {
  empresa: Empresa;
  /** Formato "HH:MM" */
  horaSalida: string;
  tipo: TipoViaje;
  nota?: string;
}

export type DiaSemana =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export interface Materia {
  nombre: string;
  dia: DiaSemana;
  /** Formato "HH:MM" */
  horaInicio: string;
  /** Formato "HH:MM" */
  horaFin: string;
  obligatoria: boolean;
}

export interface EscenarioUsuario {
  tema: 'claro' | 'oscuro';
}
