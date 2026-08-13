export function getEdificioByAula(aulaNum: number): string {
  if (aulaNum >= 200 && aulaNum <= 299) return "Edificio Central";
  if (aulaNum >= 400 && aulaNum <= 499) return "Edificio I. Chaurrondo";
  if (aulaNum >= 500 && aulaNum <= 599) return "Edificio Gallardo";
  if (aulaNum >= 600 && aulaNum <= 899) return "Edificio Soro";
  if (aulaNum >= 900 && aulaNum <= 999) return "Edificio Poseto";
  return "Edificio no especificado";
}

export function parseMateriaInfo(rawText: string) {
  if (!rawText) return { curso: 'N/A', aula: 'N/A', nombre: rawText || 'Materia', edificio: 'N/A' };

  const str = String(rawText).trim();
  
  const match = str.match(/^([0-9][a-zA-Z0-9]+)\s*Aula:\s*(\d+)\s+(.+)$/i)
             || str.match(/^([0-9][a-zA-Z0-9]+)\s+Aula\s+(\d+)\s+(.+)$/i);
  
  if (match) {
    const aulaNum = parseInt(match[2], 10);
    return {
      curso: match[1],
      aula: match[2],
      nombre: match[3].trim(),
      edificio: getEdificioByAula(aulaNum)
    };
  }

  const fallbackMatch = str.match(/^(?:([0-9][a-zA-Z0-9]+)\s+)?(?:Aula[:\s]*(\d+)\s+)?(.+)$/i);
  if (fallbackMatch && (fallbackMatch[1] || fallbackMatch[2])) {
    const aulaNum = fallbackMatch[2] ? parseInt(fallbackMatch[2], 10) : 0;
    return {
      curso: fallbackMatch[1] || 'Consultar',
      aula: fallbackMatch[2] || 'N/A',
      nombre: fallbackMatch[3] ? fallbackMatch[3].trim() : str,
      edificio: aulaNum > 0 ? getEdificioByAula(aulaNum) : 'N/A'
    };
  }
  
  return { curso: 'Consultar', aula: 'N/A', nombre: str, edificio: 'N/A' };
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

  const info = parseMateriaInfo(input);
  if (info.curso !== 'Consultar') {
    return {
      curso: info.curso,
      aula: info.aula,
      nombre: info.nombre
    };
  }

  return { curso: "", aula: "", nombre: String(input) };
}

export function getSubjectColorMapping(colorStr?: string) {
  if (!colorStr) return { bg: 'bg-zinc-800/80', bgHover: 'hover:bg-zinc-800', border: 'border-zinc-700', text: 'text-zinc-300', dot: 'bg-zinc-500', ring: 'ring-zinc-500/30', shadow: 'shadow-zinc-900/40', gradient: 'from-zinc-900 to-zinc-950' };
  
  if (colorStr.includes('emerald')) return { bg: 'bg-emerald-950/40', bgHover: 'hover:bg-emerald-950/60', border: 'border-emerald-500/50', text: 'text-emerald-400', dot: 'bg-emerald-500', ring: 'ring-emerald-500/30', shadow: 'shadow-emerald-900/40', gradient: 'from-emerald-950/40 to-neutral-900' };
  if (colorStr.includes('rose')) return { bg: 'bg-rose-950/40', bgHover: 'hover:bg-rose-950/60', border: 'border-rose-500/50', text: 'text-rose-400', dot: 'bg-rose-500', ring: 'ring-rose-500/30', shadow: 'shadow-rose-900/40', gradient: 'from-rose-950/40 to-neutral-900' };
  if (colorStr.includes('purple')) return { bg: 'bg-purple-950/40', bgHover: 'hover:bg-purple-950/60', border: 'border-purple-500/50', text: 'text-purple-400', dot: 'bg-purple-500', ring: 'ring-purple-500/30', shadow: 'shadow-purple-900/40', gradient: 'from-purple-950/40 to-neutral-900' };
  if (colorStr.includes('pink')) return { bg: 'bg-pink-950/40', bgHover: 'hover:bg-pink-950/60', border: 'border-pink-500/50', text: 'text-pink-400', dot: 'bg-pink-500', ring: 'ring-pink-500/30', shadow: 'shadow-pink-900/40', gradient: 'from-pink-950/40 to-neutral-900' };
  if (colorStr.includes('amber')) return { bg: 'bg-amber-950/40', bgHover: 'hover:bg-amber-950/60', border: 'border-amber-500/50', text: 'text-amber-400', dot: 'bg-amber-500', ring: 'ring-amber-500/30', shadow: 'shadow-amber-900/40', gradient: 'from-amber-950/40 to-neutral-900' };
  if (colorStr.includes('blue')) return { bg: 'bg-blue-950/40', bgHover: 'hover:bg-blue-950/60', border: 'border-blue-500/50', text: 'text-blue-400', dot: 'bg-blue-500', ring: 'ring-blue-500/30', shadow: 'shadow-blue-900/40', gradient: 'from-blue-950/40 to-neutral-900' };

  return { bg: 'bg-zinc-800/80', bgHover: 'hover:bg-zinc-800', border: 'border-zinc-700', text: 'text-zinc-300', dot: 'bg-zinc-500', ring: 'ring-zinc-500/30', shadow: 'shadow-zinc-900/40', gradient: 'from-zinc-900 to-zinc-950' };
}
