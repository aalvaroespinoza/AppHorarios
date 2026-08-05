import { DiaSemana, TipoViaje, EscenarioUsuario, Horario, Materia } from '../types';
import { MATERIAS } from '../data/materiasDB';
import { HORARIOS_COLECTIVOS } from '../data/horariosDB';

// Asumimos un tiempo de viaje interurbano estático para el cálculo (ej. 1 hora)
const DURACION_VIAJE_MINUTOS = 60;

/**
 * Función pura auxiliar para convertir un string "HH:MM" a minutos desde las 00:00.
 * Facilita las operaciones matemáticas de tiempos sin depender de objetos Date impuros.
 */
const timeToMins = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Motor principal de recomendación. Es una función 100% pura y determinística.
 * Dado un día, el tipo de viaje y las variables del escenario del usuario, 
 * determina exactamente qué colectivo tomar.
 */
export const calcularColectivoRecomendado = (
  dia: DiaSemana,
  tipo: TipoViaje,
  escenario: EscenarioUsuario
): { recomendado: Horario | null; siguiente_disponible: Horario | null; alternativas: Horario[] } => {
  
  // 1. Obtener las materias estáticas para el día solicitado
  let materiasDelDia = MATERIAS.filter((m) => m.dia === dia);

  // 2. Filtrar materias según el escenario
  // Si no cursa Arquitectura, la ignoramos. Si es obligatoria (presencial), siempre se cursa.
  materiasDelDia = materiasDelDia.filter((m) => {
    if (m.obligatoria) return true;
    if (dia === 'martes' && m.nombre === 'Arquitectura' && escenario.cursaArquitecturaMartes) {
      return true;
    }
    return false; // Ignora materias virtuales o condicionales que el usuario no cursará presencialmente hoy
  });

  // Si después del filtrado no hay materias presenciales, no hay viaje requerido
  if (materiasDelDia.length === 0) {
    return { recomendado: null, siguiente_disponible: null, alternativas: [] };
  }

  // Ordenar cronológicamente (garantiza que [0] es la primera y [length-1] la última)
  materiasDelDia.sort((a, b) => timeToMins(a.horaInicio) - timeToMins(b.horaInicio));

  const horariosDelDia = HORARIOS_COLECTIVOS[dia] || [];

  if (tipo === 'ida') {
    // 3. Cálculo del "Horario Límite de Llegada" a la terminal en Córdoba
    //    Es decir, debe llegar a la terminal restando el tiempo de caminata a la facultad
    const primeraMateria = materiasDelDia[0];
    const limiteLlegadaTerminal = timeToMins(primeraMateria.horaInicio) - escenario.minutosCaminandoTerminal;

    // 4. Buscar en horariosDB el colectivo que cumpla la regla
    const opcionesIda = horariosDelDia
      .filter((h) => h.tipo === 'ida')
      .map((h) => ({
        horario: h,
        // Calculamos a qué hora llegará este colectivo a la terminal
        llegadaEstimada: timeToMins(h.horaSalida) + DURACION_VIAJE_MINUTOS,
      }))
      .filter((opcion) => opcion.llegadaEstimada <= limiteLlegadaTerminal)
      // Ordenar de mayor a menor llegadaEstimada para tener primero el que llega más "cerca pero antes" del límite
      .sort((a, b) => b.llegadaEstimada - a.llegadaEstimada);

    const recomendado = opcionesIda.length > 0 ? opcionesIda[0].horario : null;
    // Las alternativas son las 2 opciones previas más cercanas
    const alternativas = opcionesIda.slice(1, 3).map((o) => o.horario);

    // Calcular siguiente_disponible (el bondi que sale después del recomendado, sin importar si llega tarde)
    let siguiente_disponible: Horario | null = null;
    if (recomendado) {
      const todosLosIda = horariosDelDia
        .filter((h) => h.tipo === 'ida')
        .sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));
      
      const index = todosLosIda.findIndex(h => timeToMins(h.horaSalida) === timeToMins(recomendado.horaSalida) && h.empresa === recomendado.empresa);
      if (index !== -1 && index + 1 < todosLosIda.length) {
        siguiente_disponible = todosLosIda[index + 1];
      }
    }

    return { recomendado, siguiente_disponible, alternativas };
    
  } else {
    // 5. Lógica a la inversa para el viaje de vuelta
    
    // Regla de negocio especial: Si es viernes y duerme en Córdoba, no hay vuelta
    if (dia === 'viernes' && escenario.duermeEnCordobaViernes) {
      return { recomendado: null, siguiente_disponible: null, alternativas: [] };
    }

    // El Horario Límite de Salida es el tiempo al que el alumno logrará llegar a la terminal
    // (hora en que termina su última clase + tiempo que demora en caminar)
    const ultimaMateria = materiasDelDia[materiasDelDia.length - 1];
    const limiteSalidaTerminal = timeToMins(ultimaMateria.horaFin) + escenario.minutosCaminandoTerminal;

    const opcionesVuelta = horariosDelDia
      .filter((h) => h.tipo === 'vuelta')
      .filter((h) => timeToMins(h.horaSalida) >= limiteSalidaTerminal)
      // Ordenar de menor a mayor horaSalida, el primer bondi que sale después del límite es el ideal
      .sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));

    const recomendado = opcionesVuelta.length > 0 ? opcionesVuelta[0] : null;
    const alternativas = opcionesVuelta.slice(1, 3);
    
    // El siguiente_disponible para la vuelta es simplemente la segunda opción
    const siguiente_disponible = opcionesVuelta.length > 1 ? opcionesVuelta[1] : null;

    return { recomendado, siguiente_disponible, alternativas };
  }
};
