import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import HomePage from './page';

const state = vi.hoisted(() => ({ hour: '08:00', isToday: true, hasOutbound: true }));
vi.mock('@/hooks/useEscenario', () => ({ useEscenario: () => ({ diaSeleccionado: 'lunes', setDiaSeleccionado: vi.fn() }) }));
vi.mock('@/hooks/useBec', () => ({ useBec: () => ({}) }));
vi.mock('@/hooks/useTodaySchedule', () => ({ useTodaySchedule: () => ({
  materiasDelDia: [{ horaInicio: '09:00' }], isToday: state.isToday,
  horaActualHHMM: state.hour, timeMounted: true,
  recomendacionIda: { recomendado: state.hasOutbound ? {} : null }, recomendacionVuelta: {},
}) }));
vi.mock('@/features/schedule/HorarioCard', () => ({ HorarioCard: ({ direction }: { direction: string }) => <section data-trip={direction} /> }));
vi.mock('@/features/schedule/ClassTimeline', () => ({ ClassTimeline: () => <section data-classes="true" /> }));
vi.mock('@/features/schedule/ContextualControls', () => ({ default: () => null }));
vi.mock('@/features/schedule/ScheduleHeader', () => ({ ScheduleHeader: () => null }));

describe('orden de los viajes', () => {
  it.each([
    ['08:00', true, true], ['15:00', true, true], ['23:00', true, false], ['15:00', false, true],
  ] as const)('mantiene ida, cursado y vuelta a las %s (hoy: %s, ida: %s)', (hour, isToday, hasOutbound) => {
    Object.assign(state, { hour, isToday, hasOutbound });
    const html = renderToStaticMarkup(<HomePage />);
    expect(html.indexOf('data-trip="ida"')).toBeLessThan(html.indexOf('data-classes'));
    expect(html.indexOf('data-classes')).toBeLessThan(html.indexOf('data-trip="vuelta"'));
    expect(html).toContain('href="/horarios"');
  });
});
