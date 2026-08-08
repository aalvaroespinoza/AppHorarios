import type { Coordinates } from '@/types/routing';

/**
 * Coordenadas centralizadas del sistema.
 * Las ubicaciones marcadas como `null` están pendientes de configuración.
 */
export const LOCATIONS: Record<string, Coordinates | null> = {
  home: null, // Pendiente de configuración
  despenaderosBusStop: { lat: -31.8153, lng: -64.2894 }, // Actual (usado como origen/destino Despeñaderos)
  cordobaBusStop: { lat: -31.4422, lng: -64.1938 }, // Actual (usado como Terminal/Ministerio Córdoba)
  ministry: { lat: -31.4422, lng: -64.1938 }, // Reutilizando coords de Córdoba para la parada del Ministerio
  utn: null, // Pendiente de configuración
};
