/**
 * LifeOS Analytics Engine (Umami style)
 * Motor de tracking de eventos local-first, 100% basado en flujos de datos reales.
 */

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  category: 'focus' | 'task' | 'finance' | 'travel' | 'academic' | 'system';
  timestamp: string; // ISO string
  value?: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsSummary {
  totalEvents: number;
  tasksCompleted: number;
  focusHours: number;
  totalExpenses: number;
  travelsCount: number;
  habitsCompletedToday: number;
  classesAttended: number;
  dailyActivity: { date: string; day: string; count: number }[];
  categoryBreakdown: { category: string; count: number; percentage: number }[];
}

const STORAGE_KEY = 'lifeos_analytics_events';

/**
 * Registra un evento de forma silenciosa y asíncrona sin bloquear la UI
 */
export async function trackEvent(
  eventName: string,
  category: AnalyticsEvent['category'] = 'system',
  value?: number,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    if (typeof window === 'undefined') return;

    const newEvent: AnalyticsEvent = {
      id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      eventName,
      category,
      timestamp: new Date().toISOString(),
      value,
      metadata
    };

    setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
        events.push(newEvent);
        if (events.length > 2000) {
          events.splice(0, events.length - 2000);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      } catch (e) {
        console.warn('[AnalyticsEngine] Failed to save event:', e);
      }
    }, 0);
  } catch (err) {
    // Silencioso
  }
}

/**
 * Obtiene los eventos almacenados
 */
export function getEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Métricas reales de Tareas Completadas (Kanban + Time-blocking)
 */
export function getCompletedTasksCount(): number {
  if (typeof window === 'undefined') return 0;
  let count = 0;
  try {
    const kbStored = localStorage.getItem('lifeos_kanban_tasks');
    if (kbStored) {
      const kb = JSON.parse(kbStored);
      count += kb.filter((t: any) => t.status === 'done').length;
    }
  } catch (e) {}

  try {
    const tbStored = localStorage.getItem('lifeos_timeblocking_blocks');
    if (tbStored) {
      const tb = JSON.parse(tbStored);
      count += tb.filter((b: any) => b.completed).length;
    }
  } catch (e) {}

  return count;
}

/**
 * Métricas reales de Gastos Totales
 */
export function getTotalExpenses(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const finStored = localStorage.getItem('academia_finanzas_movimientos');
    if (finStored) {
      const fin = JSON.parse(finStored);
      return fin
        .filter((t: any) => t.tipo === 'gasto')
        .reduce((acc: number, t: any) => acc + Number(t.monto || 0), 0);
    }
  } catch (e) {}
  return 0;
}

/**
 * Horas de foco registradas en sesiones de Pomodoro / Focus
 */
export function getFocusHours(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const focusStored = localStorage.getItem('lifeos_focus_sessions');
    if (focusStored) {
      const sessions = JSON.parse(focusStored);
      const mins = sessions.reduce((acc: number, s: any) => acc + (s.durationMinutes || 25), 0);
      return Math.round((mins / 60) * 10) / 10;
    }
  } catch (e) {}
  return 0;
}

/**
 * Total de viajes registrados en Boleto Educativo Gratuito
 */
export function getTravelsCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const becStored = localStorage.getItem('bec_viajes_v2');
    if (becStored) {
      const bec = JSON.parse(becStored);
      return (bec.idas?.length || 0) + (bec.vueltas?.length || 0);
    }
  } catch (e) {}
  return 0;
}

/**
 * Calcula estadísticas agregadas para el dashboard estilo Umami sin datos falsos
 */
export function getStats(daysBack: number = 7): AnalyticsSummary {
  const events = getEvents();
  const now = new Date();
  
  const tasksCompleted = getCompletedTasksCount();
  const totalExpenses = getTotalExpenses();
  const focusHours = getFocusHours();
  const travelsCount = getTravelsCount();

  // Construir serie de actividad diaria real de los últimos N días
  const dailyActivity: { date: string; day: string; count: number }[] = [];
  const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = diasNombres[d.getDay()];

    const count = events.filter(e => e.timestamp.startsWith(dateStr)).length;

    dailyActivity.push({
      date: dateStr,
      day: dayLabel,
      count
    });
  }

  // Desglose por Categorías real
  const categoriesMap: Record<string, number> = {};

  events.forEach(e => {
    const cat = e.category.charAt(0).toUpperCase() + e.category.slice(1);
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
  });

  const totalCatEvents = Object.values(categoriesMap).reduce((a, b) => a + b, 0);
  const categoryBreakdown = Object.entries(categoriesMap).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / (totalCatEvents || 1)) * 100)
  }));

  // Contar hábitos completados hoy y clases asistidas desde eventos reales
  const todayStr = now.toISOString().split('T')[0];
  const habitsCompletedToday = events.filter(
    e => e.eventName === 'habit_completed' && e.timestamp.startsWith(todayStr)
  ).length;
  const classesAttended = events.filter(e => e.eventName === 'class_attended').length;

  return {
    totalEvents: events.length,
    tasksCompleted,
    focusHours,
    totalExpenses,
    travelsCount,
    habitsCompletedToday,
    classesAttended,
    dailyActivity,
    categoryBreakdown
  };
}
