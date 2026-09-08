// @vitest-environment node
import { expect, it } from 'vitest';
import { POST } from './route';

it('serves a private calendar response from form data', async () => {
  const body = new URLSearchParams({ title: 'Inglés I', date: '2026-09-08', start: '11:20', end: '13:20', location: 'Aula 209' });
  const response = await POST(new Request('https://lifeos.test/api/calendar/class', { method: 'POST', body }));
  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Type')).toBe('text/calendar; charset=utf-8');
  expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="clase-2026-09-08.ics"');
  expect(response.headers.get('Cache-Control')).toContain('no-store');
  expect(await response.text()).toContain('SUMMARY:Inglés I');
});

it('rejects incomplete form data', async () => {
  const response = await POST(new Request('https://lifeos.test/api/calendar/class', { method: 'POST', body: new URLSearchParams({ title: 'Clase' }) }));
  expect(response.status).toBe(400);
});
