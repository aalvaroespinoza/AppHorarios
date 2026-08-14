export interface ParsedMateria {
  curso: string;
  aula: string;
  nombre: string;
  edificio: string;
  isViaje?: boolean;
}

export function parseMateriaInfo(rawText: string | undefined | null): ParsedMateria {
  if (!rawText) return { curso: '-', aula: '-', nombre: 'Materia', edificio: '-' };

  // Ignorar viajes (Ida, Vuelta, Despeñaderos, Córdoba)
  if (
    rawText.toLowerCase().includes("ida") || 
    rawText.toLowerCase().includes("vuelta") || 
    rawText.toLowerCase().includes("despeñaderos") || 
    rawText.toLowerCase().includes("córdoba")
  ) {
    return { curso: '', aula: '', nombre: rawText, edificio: '', isViaje: true };
  }

  // Busca el patrón: "2K3 Aula:400 Análisis de Sistemas"
  const match = rawText.match(/([0-9][a-zA-Z][0-9]+)\s*Aula:\s*(\d+)\s+(.+)/i);
  if (!match) return { curso: '-', aula: '-', nombre: rawText, edificio: '-' };

  const curso = match[1];
  const aula = match[2];
  const nombre = match[3];
  const num = parseInt(aula, 10);

  let edificio = "Edificio Central";
  if (num >= 400 && num <= 499) edificio = "I. Chaurrondo";
  else if (num >= 500 && num <= 599) edificio = "Gallardo";
  else if (num >= 600 && num <= 899) edificio = "Soro";
  else if (num >= 900 && num <= 999) edificio = "Poseto";

  return { curso, aula, nombre, edificio };
}

export function parseMateriaRawText(rawText: string) {
  return parseMateriaInfo(rawText);
}
