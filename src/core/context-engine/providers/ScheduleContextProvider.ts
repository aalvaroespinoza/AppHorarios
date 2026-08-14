import { ContextProvider, ContextEvent } from '../types';
import { subjectData } from '@/data/subjects';

export class ScheduleContextProvider implements ContextProvider {
  name = 'ScheduleContextProvider';

  getEvents(referenceDate: Date): ContextEvent[] {
    const events: ContextEvent[] = [];
    
    // We only execute on the client
    if (typeof window === 'undefined') return events;

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${referenceDate.getFullYear()}-${pad(referenceDate.getMonth()+1)}-${pad(referenceDate.getDate())}`;

    // Helper: Determine day of week
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const targetDayName = dias[referenceDate.getDay()];

    // 1. Materias estáticas (recurrentes) - TODO: We assume full schedule for simplicity, 
    // or we can read cursaArquitectura from localStorage ('escenario_config')
    const configStored = localStorage.getItem('escenario_config');
    let cursaArquitectura = false;
    if (configStored) {
      try {
        const conf = JSON.parse(configStored);
        cursaArquitectura = conf.cursaArquitectura ?? false;
      } catch(e) {}
    }

    let activeSubjects = subjectData.subjects;
    const storedSubjects = localStorage.getItem('lifeos_subjects');
    if (storedSubjects) {
      try {
        const parsed = JSON.parse(storedSubjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeSubjects = parsed;
        }
      } catch (e) {
        console.error('Error parsing lifeos_subjects:', e);
      }
    }

    activeSubjects.forEach(subject => {
      // Excluir Arquitectura si no la cursa y es ese subject
      if (!cursaArquitectura && subject.name.includes('Arquitectura')) {
        return;
      }
      subject.classBlocks.forEach(block => {
        if (block.day.toLowerCase() === targetDayName) {
          const [h1, m1] = block.startTime.split(':');
          const [h2, m2] = block.endTime.split(':');
          
          const dtStart = new Date(referenceDate);
          dtStart.setHours(Number(h1), Number(m1), 0, 0);

          const dtEnd = new Date(referenceDate);
          dtEnd.setHours(Number(h2), Number(m2), 0, 0);

          events.push({
            id: `schedule-materia-${subject.id}-${dateStr}`,
            category: 'schedule',
            type: 'class',
            title: subject.name,
            datetimeISO: dtStart.toISOString(),
            endTimeISO: dtEnd.toISOString(),
            priority: 'low',
            priorityReasons: [],
            source: this.name,
            metadata: {
              modality: subject.modality
            }
          });
        }
      });
    });

    // 2. Eventos de la Agenda (custom)
    const agendaStored = localStorage.getItem('academia_agenda_eventos');
    if (agendaStored) {
      try {
        const agenda = JSON.parse(agendaStored);
        const hoyAgenda = agenda.filter((e: Record<string, unknown>) => e.fecha === dateStr);
        hoyAgenda.forEach((e: Record<string, unknown>) => {
          const [h1, m1] = (e.horaInicio as string).split(':');
          const [h2, m2] = (e.horaFin as string).split(':');

          const dtStart = new Date(referenceDate);
          dtStart.setHours(Number(h1), Number(m1), 0, 0);
          
          const dtEnd = new Date(referenceDate);
          dtEnd.setHours(Number(h2), Number(m2), 0, 0);

          events.push({
            id: `schedule-custom-${e.id}`,
            category: 'calendar',
            type: 'custom_event',
            title: String(e.titulo),
            description: e.descripcion as string | undefined,
            datetimeISO: dtStart.toISOString(),
            endTimeISO: dtEnd.toISOString(),
            priority: 'low',
            priorityReasons: [],
            source: this.name,
            metadata: {
              location: e.ubicacion
            }
          });
        });
      } catch (e) {
        console.error('Error parsing agenda:', e);
      }
    }

    return events;
  }
}
