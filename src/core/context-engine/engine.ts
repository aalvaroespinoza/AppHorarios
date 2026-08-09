import { ContextEvent, ContextSnapshot, ContextProvider, ContextPriority } from './types';

export class ContextEngine {
  private providers: ContextProvider[] = [];

  public registerProvider(provider: ContextProvider) {
    this.providers.push(provider);
  }

  public async getSnapshot(referenceDate: Date = new Date()): Promise<ContextSnapshot> {
    const rawEvents: ContextEvent[] = [];

    // 1. Recopilar de todos los providers
    for (const provider of this.providers) {
      try {
        const events = await provider.getEvents(referenceDate);
        rawEvents.push(...events);
      } catch (e) {
        console.error(`[ContextEngine] Error fetching from ${provider.name}:`, e);
      }
    }

    // 2. Normalizar, eliminar duplicados (usando id) y ordenar por fecha
    const uniqueEventsMap = new Map<string, ContextEvent>();
    for (const ev of rawEvents) {
      if (!uniqueEventsMap.has(ev.id)) {
        uniqueEventsMap.set(ev.id, ev);
      }
    }
    const events = Array.from(uniqueEventsMap.values()).sort((a, b) => {
      return new Date(a.datetimeISO).getTime() - new Date(b.datetimeISO).getTime();
    });

    // 3. Establecer prioridades dinámicas (Fase 4)
    for (const ev of events) {
      this.calculatePriority(ev, referenceDate);
    }

    // 4. Calcular relaciones (Fase 5)
    this.buildRelationships(events);

    // 5. Separar pasados, presentes y futuros (asumiendo granularidad por hoy)
    const currentEvents: ContextEvent[] = [];
    const upcomingEvents: ContextEvent[] = [];
    const pastEvents: ContextEvent[] = [];
    
    const nowTime = referenceDate.getTime();

    for (const ev of events) {
      const evTime = new Date(ev.datetimeISO).getTime();
      const evEndTime = ev.endTimeISO ? new Date(ev.endTimeISO).getTime() : evTime;

      // Un evento es "current" si estamos dentro de su ventana de tiempo, 
      // o si ocurrió hace muy poco y sigue siendo relevante
      if (nowTime >= evTime && nowTime <= evEndTime) {
        currentEvents.push(ev);
      } else if (evTime > nowTime) {
        upcomingEvents.push(ev);
      } else {
        pastEvents.push(ev);
      }
    }

    // Buscar "Next Actionable Event" (alta prioridad futuro cercano)
    const nextActionableEvent = upcomingEvents.find(e => e.priority === 'critical' || e.priority === 'high');

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      timestamp: referenceDate.toISOString(),
      date: `${referenceDate.getFullYear()}-${pad(referenceDate.getMonth()+1)}-${pad(referenceDate.getDate())}`,
      time: `${pad(referenceDate.getHours())}:${pad(referenceDate.getMinutes())}`,
      currentEvents,
      upcomingEvents,
      pastEvents,
      nextActionableEvent
    };
  }

  private calculatePriority(event: ContextEvent, now: Date) {
    const eventTime = new Date(event.datetimeISO).getTime();
    const nowTime = now.getTime();
    const diffMins = (eventTime - nowTime) / (1000 * 60);

    // Prioridad base
    event.priority = 'low';
    event.priorityReasons = [];

    // Lógica determinista
    if (diffMins < 0) {
      // Evento pasado
      event.priority = 'low';
      event.priorityReasons.push('event_is_in_the_past');
      return;
    }

    if (event.category === 'travel' && event.type === 'leave_home') {
      if (diffMins <= 15) {
        event.priority = 'critical';
        event.priorityReasons.push('urgent_leave_home');
      } else if (diffMins <= 60) {
        event.priority = 'high';
        event.priorityReasons.push('upcoming_leave_home');
      }
    } else if (event.category === 'travel' && event.type === 'bus_arrival') {
      if (diffMins <= 15) {
        event.priority = 'critical';
        event.priorityReasons.push('bus_arriving_soon');
      }
    } else if (event.category === 'schedule') {
      if (diffMins <= 30) {
        event.priority = 'high';
        event.priorityReasons.push('class_starts_soon');
      } else if (diffMins <= 120) {
        event.priority = 'medium';
        event.priorityReasons.push('class_upcoming');
      }
    } else if (event.category === 'reminder') {
      if (diffMins <= 60) {
        event.priority = 'high';
        event.priorityReasons.push('reminder_due_soon');
      } else if (diffMins <= 24 * 60) {
        event.priority = 'medium';
        event.priorityReasons.push('reminder_due_today');
      }
    } else if (event.category === 'calendar') {
      if (diffMins <= 60) {
        event.priority = 'high';
        event.priorityReasons.push('event_starts_soon');
      }
    }

    if (event.priority === 'low') {
      event.priorityReasons.push('event_far_in_future_or_low_impact');
    }
  }

  private buildRelationships(events: ContextEvent[]) {
    // Vincular clases con viajes, clima con viajes, etc.
    const classes = events.filter(e => e.category === 'schedule');
    const travels = events.filter(e => e.category === 'travel');
    const weather = events.filter(e => e.category === 'weather');

    for (const t of travels) {
      if (!t.relatedEventIds) t.relatedEventIds = [];
      
      // Relacionar viaje con clase
      // Suponemos que el metadata del viaje tiene 'claseTime'
      if (t.metadata?.claseTime) {
        const relatedClass = classes.find(c => {
          const classTime = new Date(c.datetimeISO);
          const hm = `${String(classTime.getHours()).padStart(2, '0')}:${String(classTime.getMinutes()).padStart(2, '0')}`;
          return hm === t.metadata!.claseTime;
        });
        if (relatedClass) {
          t.relatedEventIds.push(relatedClass.id);
          if (!relatedClass.relatedEventIds) relatedClass.relatedEventIds = [];
          relatedClass.relatedEventIds.push(t.id);
        }
      }

      // Relacionar clima con viaje si hay un evento de clima en la ventana del viaje
      const tTime = new Date(t.datetimeISO).getTime();
      for (const w of weather) {
        const wTime = new Date(w.datetimeISO).getTime();
        // Si el clima es +/- 30 mins del viaje
        if (Math.abs(wTime - tTime) <= 30 * 60 * 1000) {
          t.relatedEventIds.push(w.id);
          if (!w.relatedEventIds) w.relatedEventIds = [];
          w.relatedEventIds.push(t.id);
        }
      }
    }
  }
}
