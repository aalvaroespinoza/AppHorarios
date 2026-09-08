import { createClassCalendar } from '@/core/utils/classCalendar';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const value = (key: string) => {
      const entry = form.get(key);
      if (typeof entry !== 'string') throw new Error('Dato inválido');
      return entry;
    };
    const date = value('date');
    const calendar = createClassCalendar({ title: value('title'), date, start: value('start'), end: value('end'), location: value('location') });
    return new Response(calendar, { headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="clase-${date}.ics"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    return new Response('No se pudo preparar el evento. Volvé al detalle y revisá la fecha y el horario.', { status: 400 });
  }
}
