import { describe, it, expect, vi } from 'vitest';
import { ContextEngine } from './engine';
import { ContextProvider, ContextEvent } from './types';

class MockProvider implements ContextProvider {
  name = 'MockProvider';
  constructor(private events: ContextEvent[]) {}
  getEvents() { return this.events; }
}

describe('ContextEngine', () => {
  it('deduplicates events by ID', async () => {
    const engine = new ContextEngine();
    engine.registerProvider(new MockProvider([
      { id: '1', category: 'schedule', type: 'class', title: 'A', datetimeISO: '2026-08-08T10:00:00.000Z', priority: 'low', priorityReasons: [], source: 'Mock' },
      { id: '1', category: 'schedule', type: 'class', title: 'A_Duplicate', datetimeISO: '2026-08-08T10:00:00.000Z', priority: 'low', priorityReasons: [], source: 'Mock' }
    ]));

    const snap = await engine.getSnapshot(new Date('2026-08-08T09:00:00.000Z'));
    expect(snap.upcomingEvents.length).toBe(1);
    expect(snap.upcomingEvents[0].title).toBe('A');
  });

  it('calculates priority correctly', async () => {
    const engine = new ContextEngine();
    
    const now = new Date('2026-08-08T10:00:00.000Z');
    const in10Mins = new Date(now.getTime() + 10 * 60000).toISOString();
    const in30Mins = new Date(now.getTime() + 30 * 60000).toISOString();
    const inPast = new Date(now.getTime() - 10 * 60000).toISOString();

    engine.registerProvider(new MockProvider([
      { id: 't1', category: 'travel', type: 'leave_home', title: 'Leave', datetimeISO: in10Mins, priority: 'low', priorityReasons: [], source: 'Mock' },
      { id: 'c1', category: 'schedule', type: 'class', title: 'Class', datetimeISO: in30Mins, priority: 'low', priorityReasons: [], source: 'Mock' },
      { id: 'p1', category: 'calendar', type: 'custom_event', title: 'Past', datetimeISO: inPast, priority: 'low', priorityReasons: [], source: 'Mock' },
    ]));

    const snap = await engine.getSnapshot(now);
    
    const leaveEvent = snap.upcomingEvents.find(e => e.id === 't1');
    expect(leaveEvent?.priority).toBe('critical');

    const classEvent = snap.upcomingEvents.find(e => e.id === 'c1');
    expect(classEvent?.priority).toBe('high');

    const pastEvent = snap.pastEvents.find(e => e.id === 'p1');
    expect(pastEvent?.priority).toBe('low');

    // nextActionableEvent should be the critical one
    expect(snap.nextActionableEvent?.id).toBe('t1');
  });

  it('builds relationships correctly', async () => {
    const engine = new ContextEngine();
    const now = new Date('2026-08-08T10:00:00.000Z');
    
    // El viaje está a las 11:00, el clima es a las 11:15
    const classTimeISO = '2026-08-08T11:00:00.000Z'; // UTC

    engine.registerProvider(new MockProvider([
      { id: 'class1', category: 'schedule', type: 'class', title: 'Class', datetimeISO: classTimeISO, priority: 'low', priorityReasons: [], source: 'Mock' },
      // Metadata mapea al viaje
      { id: 'travel1', category: 'travel', type: 'bus_arrival', title: 'Travel', datetimeISO: '2026-08-08T10:30:00.000Z', priority: 'low', priorityReasons: [], source: 'Mock', metadata: { claseTime: '08:00' } }, 
      { id: 'weather1', category: 'weather', type: 'rain', title: 'Rain', datetimeISO: '2026-08-08T10:45:00.000Z', priority: 'low', priorityReasons: [], source: 'Mock' },
    ]));

    // Modificamos el metadata del travel1 en el test para que apunte exactamente a la hora local del class1
    const d = new Date(classTimeISO);
    const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    
    engine.registerProvider(new MockProvider([
      { id: 'class1', category: 'schedule', type: 'class', title: 'Class', datetimeISO: classTimeISO, priority: 'low', priorityReasons: [], source: 'Mock' },
      { id: 'travel2', category: 'travel', type: 'bus_arrival', title: 'Travel', datetimeISO: '2026-08-08T10:30:00.000Z', priority: 'low', priorityReasons: [], source: 'Mock', metadata: { claseTime: hm } }, 
      { id: 'weather1', category: 'weather', type: 'rain', title: 'Rain', datetimeISO: '2026-08-08T10:45:00.000Z', priority: 'low', priorityReasons: [], source: 'Mock' },
    ]));

    const snap = await engine.getSnapshot(now);
    const travel = snap.upcomingEvents.find(e => e.id === 'travel2');
    expect(travel?.relatedEventIds).toContain('class1');
    expect(travel?.relatedEventIds).toContain('weather1'); // 10:30 y 10:45 tienen diferencia <= 30 mins
  });
});
