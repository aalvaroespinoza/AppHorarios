import { describe, expect, it, vi } from 'vitest';
import type { Subject } from '@/types/subject';

vi.mock('@/data/schedules', () => ({ rawScheduleEntries: [
  { dia: 'lunes', sentido: 'ida', empresa: 'canelo', horaSalida: '06:30', horaLlegada: '07:30' },
  { dia: 'lunes', sentido: 'ida', empresa: 'otra', horaSalida: '06:45', horaLlegada: '07:45' },
  { dia: 'lunes', sentido: 'ida', empresa: 'canelo', horaSalida: '09:00', horaLlegada: '10:00' },
  { dia: 'lunes', sentido: 'ida', empresa: 'nocturno', horaSalida: '23:00', horaLlegada: '00:30' },
  { dia: 'lunes', sentido: 'vuelta', empresa: 'canelo', horaSalida: '18:00', horaLlegada: '19:00' },
  { dia: 'lunes', sentido: 'vuelta', empresa: 'otra', horaSalida: '18:00', horaLlegada: '19:15' },
  { dia: 'lunes', sentido: 'vuelta', empresa: 'canelo', horaSalida: '19:00', horaLlegada: '20:00' },
] }));

import { calcularColectivos } from './recommendation-engine';

const subjects: Subject[] = [{ id: 'subject', name: 'Matemática', classBlocks: [{ day: 'lunes', startTime: '08:00', endTime: '17:30' }] }];

describe('trip recommendation feasibility', () => {
  it('preserves the preferred 06:30 Canelo while it is boardable', () => {
    expect(calcularColectivos('lunes', 'ida', true, false, '06:00', subjects).recomendado?.horaSalida).toBe('06:30');
  });
  it('replaces a missed preference with the remaining punctual service', () => {
    expect(calcularColectivos('lunes', 'ida', true, false, '06:31', subjects).recomendado?.horaSalida).toBe('06:45');
  });
  it('does not recommend late or next-day arrivals when no punctual departure remains', () => {
    const result = calcularColectivos('lunes', 'ida', true, false, '07:00', subjects);
    expect(result.recomendado).toBeNull();
    expect(result.alternativas.map(service => service.horaSalida)).toEqual(['09:00', '23:00']);
  });
  it('keeps a return boardable at Ministerio after terminal departure and preserves other companies', () => {
    const result = calcularColectivos('lunes', 'vuelta', true, false, '18:05', subjects);
    expect(result.recomendado?.horaSalida).toBe('18:00');
    expect(result.alternativas.some(service => service.empresa === 'otra' && service.horaSalida === '18:00')).toBe(true);
    expect(calcularColectivos('lunes', 'vuelta', true, false, '18:11', subjects).recomendado?.horaSalida).toBe('19:00');
  });
  it('never falls back to a return before class ends or after the last service has passed', () => {
    const lateSubjects: Subject[] = [{ ...subjects[0], classBlocks: [{ day: 'lunes', startTime: '18:00', endTime: '23:05' }] }];
    expect(calcularColectivos('lunes', 'vuelta', true, false, '00:00', lateSubjects).recomendado).toBeNull();
    expect(calcularColectivos('lunes', 'vuelta', true, false, '20:00', subjects)).toEqual({ recomendado: null, alternativas: [] });
  });
  it('uses the latest end of overlapping classes and keeps an empty schedule empty', () => {
    const overlapping: Subject[] = [{ ...subjects[0], classBlocks: [{ day: 'lunes', startTime: '15:00', endTime: '20:00' }, { day: 'lunes', startTime: '16:00', endTime: '17:00' }] }];
    expect(calcularColectivos('lunes', 'vuelta', true, false, '00:00', overlapping).recomendado).toBeNull();
    expect(calcularColectivos('lunes', 'ida', true, false, '00:00', [])).toEqual({ recomendado: null, alternativas: [] });
  });
});
