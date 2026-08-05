import { DiaSemana, Horario, Materia } from '../../types';
import { MATERIAS } from '../../data/materiasDB';
import { HORARIOS_COLECTIVOS } from '../../data/horariosDB';

const DURACION_VIAJE_MINUTOS = 60;
const MARGEN_MINUTOS = 15;

const timeToMins = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const calcularColectivos = (
  dia: DiaSemana,
  tipo: 'ida' | 'vuelta',
  cursaArquitectura: boolean,
  duermeEnCordoba: boolean
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

  // Ordenar cronológicamente
  materiasDelDia.sort((a, b) => timeToMins(a.horaInicio) - timeToMins(b.horaInicio));

  // 2. Obtener horarios del día y filtrar por tipo de viaje
  const horariosDelDia = HORARIOS_COLECTIVOS[dia] || [];
  const opciones = horariosDelDia.filter((h: Horario) => h.tipo === tipo);

  if (tipo === 'ida') {
    const tieneMateriaA8 = materiasDelDia.some((m) => m.horaInicio === '08:00');
    
    // REGLA DE ORO (Tráfico AM)
    if (tieneMateriaA8) {
      const opcionesAM = opciones
        .filter((h) => timeToMins(h.horaSalida) >= timeToMins('06:30') && timeToMins(h.horaSalida) <= timeToMins('07:15'))
        .sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));

      const recomendado = opcionesAM.find((h) => h.horaSalida === '06:30' || h.horaSalida === '06:40') || (opcionesAM.length > 0 ? opcionesAM[0] : null);
      
      let alternativas: Horario[] = [];
      if (recomendado) {
        const index = opcionesAM.indexOf(recomendado);
        alternativas = opcionesAM.slice(index + 1);
      }
      
      return { recomendado, alternativas };
    } 
    
    // Para el resto de horarios de ida
    const primeraMateria = materiasDelDia[0];
    const limiteLlegadaTerminal = timeToMins(primeraMateria.horaInicio) - MARGEN_MINUTOS;

    const opcionesValidas = opciones
      .filter((h) => {
        const llegadaEstimada = timeToMins(h.horaSalida) + DURACION_VIAJE_MINUTOS;
        return llegadaEstimada <= limiteLlegadaTerminal;
      })
      .sort((a, b) => timeToMins(b.horaSalida) - timeToMins(a.horaSalida)); // El que sale más tarde y llega a tiempo será el primero ([0])

    const recomendado = opcionesValidas.length > 0 ? opcionesValidas[0] : null;
    
    // Alternativas: las opciones más tempranas (re-ordenadas de menor a mayor hora de salida)
    const alternativas = opcionesValidas.length > 1 
      ? opcionesValidas.slice(1, 3).sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida)) 
      : [];
    
    return { recomendado, alternativas };
  } else {
    // VUELTA
    if (dia === 'viernes' && duermeEnCordoba) {
      return { recomendado: null, alternativas: [] };
    }

    const ultimaMateria = materiasDelDia[materiasDelDia.length - 1];
    const limiteSalidaTerminal = timeToMins(ultimaMateria.horaFin);

    const opcionesValidas = opciones
      .filter((h) => timeToMins(h.horaSalida) > limiteSalidaTerminal)
      .sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));

    const recomendado = opcionesValidas.length > 0 ? opcionesValidas[0] : null;
    const alternativas = opcionesValidas.slice(1, 3);

    return { recomendado, alternativas };
  }
};
