export function getEdificio(aulaStr: string | null | undefined): string {
  if (!aulaStr) return "";
  // Extraer solo los números del string del aula
  const numMatches = String(aulaStr).match(/\d+/);
  if (!numMatches) return "";
  const num = parseInt(numMatches[0], 10);
  
  if (num >= 200 && num <= 299) return "Edificio Central";
  if (num >= 400 && num <= 499) return "I. Chaurrondo";
  if (num >= 500 && num <= 599) return "Gallardo";
  if (num >= 600 && num <= 899) return "Soro";
  if (num >= 900 && num <= 999) return "Poseto";
  return "";
}

export interface MateriaParsed {
  curso: string;
  aula: string;
  nombre: string;
}

/**
 * Normaliza y extrae curso, aula y nombre desde un objeto o un string crudo tipo "1K2 Aula:520 Arquitectura de Computadoras"
 */
export function parseMateria(input: any): MateriaParsed {
  if (!input) return { curso: "", aula: "", nombre: "" };

  if (typeof input === 'object') {
    const cursoObj = input.curso || "";
    const aulaObj = input.aula || "";
    const nombreObj = input.nombre || input.name || input.titulo || "";

    if (cursoObj || aulaObj) {
      return {
        curso: String(cursoObj),
        aula: String(aulaObj),
        nombre: String(nombreObj)
      };
    }

    return parseMateria(String(nombreObj));
  }

  const str = String(input).trim();

  // Pattern matching: "1K2 Aula:520 Arquitectura de Computadoras" or "1K2 Aula 520 Arquitectura..." or "Aula:520 Arquitectura..."
  const fullMatch = str.match(/^(?:([0-9][A-Za-z0-9]+)\s+)?(?:Aula[:\s]*([0-9A-Za-z]+)\s+)?(.*)$/i);

  if (fullMatch && (fullMatch[1] || fullMatch[2])) {
    const curso = fullMatch[1] || "";
    const aula = fullMatch[2] || "";
    const nombre = fullMatch[3]?.trim() || str;
    return { curso, aula, nombre };
  }

  return { curso: "", aula: "", nombre: str };
}
