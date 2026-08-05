import { DiaSemana, Horario, Materia } from '../../types';
import { MATERIAS } from '../../data/materiasDB';
import { HORARIOS_COLECTIVOS } from '../../data/horariosDB';

// Funciones puras para manipulación de horas (formato "HH:MM")
const addMinutes = (timeHHMM: string, minsToAdd: number): string => {
  const [hours, minutes] = timeHHMM.split(':').map(Number);
  const totalMins = hours * 60 + minutes + minsToAdd;
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const subMinutes = (timeHHMM: string, minsToSub: number): string => {
  const [hours, minutes] = timeHHMM.split(':').map(Number);
  let totalMins = hours * 60 + minutes - minsToSub;
  if (totalMins < 0) totalMins += 24 * 60;
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const calcularColectivos = (
  dia: DiaSemana,
  tipo: 'ida' | 'vuelta',
  cursaArquitectura: boolean,
  duermeEnCordoba: boolean,
  horaActualHHMM: string
): { recomendado: Horario | null, alternativas: Horario[] } => {
  
  // 1. Obtener y filtrar materias del día
  let materiasDelDia = MATERIAS.filter((m: Materia) => m.dia === dia);

  materiasDelDia = materiasDelDia.filter((m: Materia) => {
    if (m.obligatoria) return true;
    if (dia === 'martes' && m.nombre === 'Arquitectura' && cursaArquitectura) {
      return true;
    }
    return false; // Ignorar materias virtuales o no obligatorias que no se cursan
  });

  if (materiasDelDia.length === 0) {
    return { recomendado: null, alternativas: [] };
  }

  // Ordenar cronológicamente (usando strings ya que el formato es HH:MM)
  materiasDelDia.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  // 2. Obtener horarios base del día y tipo
  const horariosDelDia = HORARIOS_COLECTIVOS[dia] || [];
  let opciones = horariosDelDia.filter((h: Horario) => h.tipo === tipo);

  // 3. Lógica de Filtrado en Vivo (descartar los que ya pasaron)
  opciones = opciones.filter((h: Horario) => h.horaSalida >= horaActualHHMM);

  if (opciones.length === 0) {
    return { recomendado: null, alternativas: [] };
  }

  // 4. Filtrado por tipo de viaje e itinerario académico
  if (tipo === 'ida') {
    const primeraMateria = materiasDelDia[0];
    
    // REGLA DE 8 AM: Si la PRIMERA materia es a las 08:00
    if (primeraMateria.horaInicio === '08:00') {
      opciones = opciones.filter((h) => h.horaSalida >= '06:30' && h.horaSalida <= '06:45');
    } else {
      // Regla general para el resto de horarios (ej. viernes a la tarde)
      // Debe llegar al menos 15 minutos antes de la clase (viaje de 60 min)
      const limiteSalida = subMinutes(primeraMateria.horaInicio, 75); // 60 viaje + 15 margen
      opciones = opciones.filter((h) => h.horaSalida <= limiteSalida);
    }
  } else {
    // VUELTA
    if (dia === 'viernes' && duermeEnCordoba) {
      return { recomendado: null, alternativas: [] };
    }

    const ultimaMateria = materiasDelDia[materiasDelDia.length - 1];
    const limiteSalidaTerminal = ultimaMateria.horaFin;

    // Debe salir después de que termine la última clase
    opciones = opciones.filter((h) => h.horaSalida >= limiteSalidaTerminal);
  }

  // 5. Ordenar los resultados finales ascendente (el más próximo en el futuro primero)
  opciones.sort((a, b) => a.horaSalida.localeCompare(b.horaSalida));

  // 6. Retornar el recomendado y las alternativas
  const recomendado = opciones.length > 0 ? opciones[0] : null;
  const alternativas = opciones.slice(1);

  return { recomendado, alternativas };
};
