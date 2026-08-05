import type { ID } from './common';

/**
 * Empresa operadora de colectivos.
 */
export interface Company {
  /** Identificador único (slug corto) */
  id: ID;
  /** Razón social o nombre comercial completo */
  name: string;
  /** Nombre abreviado para mostrar en la UI */
  shortName: string;
  /** Color representativo (hex) — opcional, para futuro uso visual */
  color?: string;
}
