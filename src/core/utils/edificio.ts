export function getEdificioByAula(aulaNum: number): string {
  if (aulaNum >= 200 && aulaNum <= 299) return "Edificio Central";
  if (aulaNum >= 400 && aulaNum <= 499) return "I. Chaurrondo";
  if (aulaNum >= 500 && aulaNum <= 599) return "Gallardo";
  if (aulaNum >= 600 && aulaNum <= 899) return "Soro";
  if (aulaNum >= 900 && aulaNum <= 999) return "Poseto";
  return "Edificio no especificado";
}

export function parseMateriaInfo(rawText: string) {
  if (!rawText) return { curso: 'N/A', aula: 'N/A', nombre: rawText || 'Materia', edificio: 'N/A' };
  
  // Intenta extraer patrón: "2K3 Aula:400 Análisis de Sistemas..."
  const match = String(rawText).match(/^([0-9][a-zA-Z][0-9]+)\s*Aula:\s*(\d+)\s+(.+)$/i);
  if (match) {
    const aulaNum = parseInt(match[2], 10);
    return {
      curso: match[1],
      aula: match[2],
      nombre: match[3],
      edificio: getEdificioByAula(aulaNum)
    };
  }
  
  return { curso: 'Consultar', aula: 'N/A', nombre: String(rawText), edificio: 'N/A' };
}

export function getEdificio(aulaStr: string | null | undefined): string {
  if (!aulaStr) return "";
  const numMatches = String(aulaStr).match(/\d+/);
  if (!numMatches) return "";
  const num = parseInt(numMatches[0], 10);
  const ed = getEdificioByAula(num);
  return ed === "Edificio no especificado" ? "" : ed;
}

export interface MateriaParsed {
  curso: string;
  aula: string;
  nombre: string;
}

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
  const info = parseMateriaInfo(str);
  if (info.curso !== 'Consultar') {
    return {
      curso: info.curso,
      aula: info.aula,
      nombre: info.nombre
    };
  }

  return { curso: "", aula: "", nombre: str };
}
