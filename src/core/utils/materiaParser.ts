export function parseMateriaRawText(rawText: string) {
  if (!rawText) return { curso: '', aula: '', nombre: rawText, edificio: '' };
  
  // Extrae ej: "1K2", "520", "Arquitectura de Computadoras"
  const match = rawText.match(/^(\d[a-zA-Z]\d)\s*Aula:\s*(\d+)\s+(.+)$/i);
  
  if (!match) return { curso: '', aula: '', nombre: rawText, edificio: '' };

  const curso = match[1];
  const aula = match[2];
  const nombre = match[3];
  const num = parseInt(aula, 10);

  let edificio = "";
  if (num >= 200 && num <= 299) edificio = "Edificio Central";
  else if (num >= 400 && num <= 499) edificio = "I. Chaurrondo";
  else if (num >= 500 && num <= 599) edificio = "Gallardo";
  else if (num >= 600 && num <= 899) edificio = "Soro";
  else if (num >= 900 && num <= 999) edificio = "Poseto";

  return { curso, aula, nombre, edificio };
}
