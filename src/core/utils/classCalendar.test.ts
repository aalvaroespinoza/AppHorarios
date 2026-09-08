import { describe, expect, it } from 'vitest';
import { classDateForDay, createClassCalendar } from './classCalendar';

const event = { title: 'Análisis Matemático', date: '2026-09-08', start: '18:00', end: '20:15', location: 'Aula 209' };

describe('class calendar', () => {
  it('uses the selected day in Córdoba, including local midnight and next week', () => {
    const now = new Date('2026-09-09T01:00:00Z'); // Still Tuesday in Córdoba.
    expect(classDateForDay('martes', now)).toBe('2026-09-08');
    expect(classDateForDay('miercoles', now)).toBe('2026-09-09');
    expect(classDateForDay('lunes', now)).toBe('2026-09-14');
    expect(classDateForDay('viernes', new Date('2026-12-31T15:00:00Z'))).toBe('2027-01-01');
  });

  it('exports exactly one non-recurring event with absolute class times', () => {
    const ics = createClassCalendar(event);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).not.toMatch(/RRULE|RDATE/);
    expect(ics).toContain('DTSTART:20260908T210000Z');
    expect(ics).toContain('DTEND:20260908T231500Z');
    expect(ics).toContain('SUMMARY:Análisis Matemático');
    expect(ics).toContain('LOCATION:Aula 209');
    expect(ics.endsWith('\r\n')).toBe(true);
  });

  it('handles classes ending after midnight', () => {
    expect(createClassCalendar({ ...event, start: '23:00', end: '01:00' })).toContain('DTEND:20260909T040000Z');
  });

  it('escapes text and folds long UTF-8 lines without allowing extra events', () => {
    const ics = createClassCalendar({ ...event, title: 'Á'.repeat(100), location: 'A, B; C\\D\nBEGIN:VEVENT' });
    for (const line of ics.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(ics).toContain('LOCATION:A\\, B\\; C\\\\D\\nBEGIN:VEVENT');
    expect(ics.split('\r\n').filter(line => line === 'BEGIN:VEVENT')).toHaveLength(1);
  });

  it.each([{ date: '2026-02-30' }, { start: '25:00' }, { end: '18:00' }, { title: '' }, { date: '' }])('rejects invalid or missing data: %j', invalid => {
    expect(() => createClassCalendar({ ...event, ...invalid })).toThrow();
  });
});
