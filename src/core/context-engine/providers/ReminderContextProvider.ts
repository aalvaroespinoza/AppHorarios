import { ContextProvider, ContextEvent } from '../types';

export class ReminderContextProvider implements ContextProvider {
  name = 'ReminderContextProvider';

  getEvents(referenceDate: Date): ContextEvent[] {
    const events: ContextEvent[] = [];
    if (typeof window === 'undefined') return events;

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${referenceDate.getFullYear()}-${pad(referenceDate.getMonth()+1)}-${pad(referenceDate.getDate())}`;

    const deadlinesStored = localStorage.getItem('academia_deadlines');
    if (deadlinesStored) {
      try {
        const deadlines = JSON.parse(deadlinesStored);
        
        // Filtramos por el día (dateStr)
        const hoyDeadlines = deadlines.filter((d: Record<string, unknown>) => d.fecha === dateStr);
        hoyDeadlines.forEach((d: Record<string, unknown>) => {
          
          let dt = new Date(referenceDate);
          if (d.hora && typeof d.hora === 'string') {
            const [h, m] = d.hora.split(':');
            dt.setHours(Number(h), Number(m), 0, 0);
          } else {
            // Todo el día
            dt.setHours(12, 0, 0, 0);
          }

          events.push({
            id: `reminder-${d.id}`,
            category: 'reminder',
            type: 'deadline',
            title: String(d.titulo),
            datetimeISO: dt.toISOString(),
            priority: 'low',
            priorityReasons: [],
            source: this.name,
            metadata: {
              urgency: d.prioridad
            }
          });
        });

      } catch (e) {
        console.error('Error parsing deadlines:', e);
      }
    }

    return events;
  }
}
