import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const horariosPath = path.join(__dirname, '../../data/horarios.json');
let horariosData = { horarios: {} };

try {
  const rawData = fs.readFileSync(horariosPath, 'utf8');
  horariosData = JSON.parse(rawData);
} catch (error) {
  console.error('Error leyendo el archivo horarios.json:', error.message);
}

/**
 * Obtiene los horarios para un día específico
 * @param {string} dia - Día de la semana en español (ej: "martes", "miercoles")
 * @returns {Object|null} - Objeto con los horarios del día o null si no hay
 */
export const getHorariosPorDia = (dia) => {
  return horariosData.horarios[dia] || null;
};
