const TIME_ZONE = 'America/Argentina/Cordoba';
const weekdays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

/** Today, or the next occurrence of the selected weekday, in Córdoba. */
export function classDateForDay(day: string, now = new Date()): string {
  const index = weekdays.indexOf(day);
  if (index < 0) throw new Error('Día inválido');
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find(item => item.type === type)!.value;
  const date = new Date(`${part('year')}-${part('month')}-${part('day')}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + (index - date.getUTCDay() + 7) % 7);
  return date.toISOString().slice(0, 10);
}

export interface ClassCalendarEvent {
  title: string;
  date: string;
  start: string;
  end: string;
  location: string;
}

const escapeText = (text: string) => text.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// RFC 5545 limits physical lines to 75 octets, without splitting UTF-8 characters.
function fold(line: string): string {
  let output = '';
  let bytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (bytes + size > 75) { output += '\r\n '; bytes = 1; }
    output += char;
    bytes += size;
  }
  return output;
}

export function createClassCalendar(event: ClassCalendarEvent, now = new Date()): string {
  const { title, date, start, end, location } = event;
  if (!title.trim() || title.length > 500 || location.length > 500 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) {
    throw new Error('Faltan datos válidos de la clase');
  }
  const day = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== date || start === end) throw new Error('Fecha u horario inválido');
  // University schedules are in Córdoba (UTC-03:00), regardless of device timezone.
  const begins = new Date(`${date}T${start}:00-03:00`);
  const ends = new Date(`${date}T${end}:00-03:00`);
  if (ends < begins) ends.setUTCDate(ends.getUTCDate() + 1);
  const uid = `${encodeURIComponent(title)}-${date}-${start.replace(':', '')}@lifeos`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LifeOS//Clase individual//ES', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp(now)}`, `DTSTART:${stamp(begins)}`, `DTEND:${stamp(ends)}`,
    `SUMMARY:${escapeText(title)}`, `LOCATION:${escapeText(location)}`,
    'DESCRIPTION:Clase individual agregada desde LifeOS. Sin repetición semanal.',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].map(fold).join('\r\n');
}
