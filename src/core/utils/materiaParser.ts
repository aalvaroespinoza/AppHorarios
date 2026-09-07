import { parseMateriaInfo as parseSubject } from './edificio';

export interface ParsedMateria {
  curso: string;
  aula: string;
  nombre: string;
  edificio: string;
  isViaje?: boolean;
}

export function parseMateriaInfo(rawText: string | undefined | null): ParsedMateria {
  const text = rawText?.trim() || '';
  // Match a travel label, not arbitrary substrings such as "Seguridad".
  if (/^(?:ida|vuelta|viaje)(?:\s|$)|^(?:despeñaderos|córdoba)\s*(?:→|a\s)/i.test(text)) {
    return { curso: '', aula: '', nombre: text, edificio: '', isViaje: true };
  }
  return parseSubject(text);
}

export function parseMateriaRawText(rawText: string) {
  return parseMateriaInfo(rawText);
}
