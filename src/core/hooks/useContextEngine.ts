import { useState, useEffect, useRef } from 'react';
import { getContextEngine } from '@/core/context-engine/instance';
import { ContextSnapshot } from '@/core/context-engine/types';
import { notificationService } from '@/core/services/notifications/notification.service';

export function useContextEngine() {
  const [snapshot, setSnapshot] = useState<ContextSnapshot | null>(null);
  const evaluatedEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const engine = getContextEngine();

    const evaluate = async () => {
      try {
        const snap = await engine.getSnapshot(new Date());
        if (isMounted) {
          setSnapshot(snap);
          
          // Fase 10: Evaluar candidatos a notificación
          if (snap.nextActionableEvent) {
            const ev = snap.nextActionableEvent;
            if (ev.priority === 'critical' || ev.priority === 'high') {
              const notificationId = `ctx-notif-${ev.id}`;
              
              // Evitar duplicados en runtime usando el Set
              if (!evaluatedEventsRef.current.has(notificationId)) {
                evaluatedEventsRef.current.add(notificationId);
                
                // Programar con el servicio central (idempotente si usa el mismo ID)
                // El ID se mapea internamente al adapter (OneSignal) en el backend o SW.
                const scheduledTime = new Date(ev.datetimeISO);
                // Notificar 15 mins antes si es 'high', 5 mins antes si es 'critical'
                const offset = ev.priority === 'critical' ? 5 : 15;
                scheduledTime.setMinutes(scheduledTime.getMinutes() - offset);

                if (scheduledTime.getTime() > Date.now()) {
                  notificationService.schedule({
                    category: ev.category as any,
                    title: `⚠️ ${ev.title}`,
                    message: ev.description || 'Requiere tu atención pronto.',
                    data: { eventId: ev.id, type: ev.type }
                  }, scheduledTime).catch(console.error);
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('[useContextEngine] Error evaluando contexto:', e);
      }
    };

    evaluate();
    // Recalcular cada minuto
    const interval = setInterval(evaluate, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return snapshot;
}
