import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeatherService, weatherService } from './weather.service';
import type { LocationId } from './weather.types';

// Simulamos fetch
global.fetch = vi.fn();

const mockOpenMeteoResponse = {
  current: {
    temperature_2m: 22.5,
    apparent_temperature: 24.1,
    weather_code: 61,
    wind_speed_10m: 12.5,
    relative_humidity_2m: 60,
    is_day: 1,
    precipitation: 1.5
  },
  hourly: {
    time: ["2026-08-08T14:00", "2026-08-08T15:00"],
    temperature_2m: [22.5, 23.0],
    apparent_temperature: [24.1, 24.5],
    precipitation_probability: [80, 20],
    precipitation: [1.5, 0],
    weather_code: [61, 3]
  },
  daily: {
    time: ["2026-08-08", "2026-08-09"],
    temperature_2m_max: [25.0, 26.0],
    temperature_2m_min: [15.0, 16.0],
    weather_code: [61, 0]
  }
};

describe('WeatherService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Limpiamos caché local simulado si estuviera disponible
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('debería parsear códigos WMO correctamente (Fase 11)', () => {
    expect(weatherService.parseWmoCode(0)).toBe('despejado');
    expect(weatherService.parseWmoCode(3)).toBe('nublado');
    expect(weatherService.parseWmoCode(61)).toBe('lluvia');
    expect(weatherService.parseWmoCode(95)).toBe('tormenta');
    expect(weatherService.parseWmoCode(999)).toBe('desconocido');
  });

  it('debería obtener el clima y transformarlo a los tipos de AppHorarios', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpenMeteoResponse
    } as any);

    const data = await weatherService.getWeather('despenaderos');

    // Validar fetch call
    expect(fetch).toHaveBeenCalledTimes(1);
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain('latitude=-31.8153');
    expect(url).toContain('longitude=-64.2894');
    expect(url).toContain('timezone=America%2FArgentina%2FCordoba');

    // Validar datos current
    expect(data.current.temperature).toBe(22.5);
    expect(data.current.condition).toBe('lluvia');
    expect(data.current.precipitation).toBe(1.5);

    // Validar datos hourly
    expect(data.hourly.length).toBe(2);
    expect(data.hourly[0].datetimeISO).toBe("2026-08-08T14:00");
    expect(data.hourly[0].precipitationProbability).toBe(80);
    expect(data.hourly[0].condition).toBe('lluvia');

    // Validar datos daily
    expect(data.daily.length).toBe(2);
    expect(data.daily[0].dateISO).toBe("2026-08-08");
    expect(data.daily[0].maxTemp).toBe(25.0);
  });

  it('debería utilizar deduplicación en memoria para requests simultáneos', async () => {
    vi.mocked(fetch).mockImplementation(async () => {
      // Simular latencia para permitir que las promesas se unan
      await new Promise(r => setTimeout(r, 10));
      return {
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as any;
    });

    // Disparamos 3 llamadas a la vez
    const p1 = weatherService.getWeather('cordoba');
    const p2 = weatherService.getWeather('cordoba');
    const p3 = weatherService.getWeather('cordoba');

    await Promise.all([p1, p2, p3]);

    // Sólo debe haber hecho un fetch
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  
  it('debería fallar si la API responde con error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500
    } as any);

    await expect(weatherService.getWeather('utn')).rejects.toThrow('Open-Meteo HTTP error: 500');
  });
});
