import { describe, expect, it } from 'vitest';
import { parseMateriaInfo } from './materiaParser';

describe('class parsing', () => {
  it('does not hide classes with ida inside their name', () => {
    expect(parseMateriaInfo('Seguridad Informática').isViaje).not.toBe(true);
  });
  it('recognizes explicit travel labels', () => {
    expect(parseMateriaInfo('Ida a Córdoba').isViaje).toBe(true);
  });
  it('parses a classroom without a course and names Ichaurrondo consistently', () => {
    expect(parseMateriaInfo('Aula:400 Matemática')).toMatchObject({ nombre: 'Matemática', aula: '400', edificio: 'Edificio Ichaurrondo' });
  });
  it('keeps an unspecified classroom unknown', () => {
    expect(parseMateriaInfo('Matemática').edificio).toBe('N/A');
  });
});
