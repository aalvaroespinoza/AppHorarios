import type { Company } from '@/types/company';

/**
 * Base de datos estática de empresas operadoras.
 */
export const companies: Record<string, Company> = {
  canelo: {
    id: 'canelo',
    name: 'Transporte Canelo',
    shortName: 'Canelo',
    color: '#0071e3', // Azul para Canelo
  },
  lumasa: {
    id: 'lumasa',
    name: 'Lumasa',
    shortName: 'Lumasa',
    color: '#ff9500', // Naranja para Lumasa
  },
  intercordoba: {
    id: 'intercordoba',
    name: 'Intercórdoba',
    shortName: 'Intercórdoba',
    color: '#34c759', // Verde para Intercórdoba
  },
  sierras: {
    id: 'sierras',
    name: 'Sierras de Calamuchita',
    shortName: 'Sierras',
    color: '#ff3b30', // Rojo para Sierras
  },
};
