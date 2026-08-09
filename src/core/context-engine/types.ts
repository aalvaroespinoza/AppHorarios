export type ContextCategory = 'schedule' | 'travel' | 'weather' | 'reminder' | 'calendar' | 'notification' | 'system';
export type ContextPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ContextEvent {
  id: string;
  category: ContextCategory;
  type: string;
  title: string;
  description?: string;
  datetimeISO: string; // Start time or exact time
  endTimeISO?: string;
  priority: ContextPriority;
  priorityReasons: string[];
  source: string;
  metadata?: Record<string, unknown>;
  relatedEventIds?: string[];
}

export interface ContextSnapshot {
  timestamp: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  currentEvents: ContextEvent[];
  upcomingEvents: ContextEvent[];
  pastEvents: ContextEvent[];
  nextActionableEvent?: ContextEvent;
}

export interface ContextProvider {
  name: string;
  getEvents(referenceDate: Date): Promise<ContextEvent[]> | ContextEvent[];
}
