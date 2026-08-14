import { LOCATIONS } from '@/data/locations';
import { WeatherCondition, WeatherData, WeatherCurrent, WeatherHourly, WeatherDaily, LocationId } from './weather.types';

const WEATHER_CACHE_PREFIX = 'weather_cache_';
const WEATHER_CACHE_TTL = 20 * 60 * 1000; // 20 minutos de caché

interface CacheEntry {
  timestamp: number;
  data: WeatherData;
}

export interface StandardWeatherSummary {
  temp: number;
  rainProb: number;
  condition: string;
  conditionKey: WeatherCondition;
  code: number;
  humidity: number;
  windSpeed: number;
}

export class WeatherService {
  private static instance: WeatherService;
  private inflightRequests: Map<string, Promise<WeatherData>> = new Map();

  private constructor() {}

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * Mapeo de códigos WMO (World Meteorological Organization) a nuestras condiciones semánticas.
   */
  public parseWmoCode(code: number): WeatherCondition {
    if (code === 0) return 'despejado';
    if (code === 1 || code === 2) return 'parcialmente_nublado';
    if (code === 3) return 'nublado';
    if (code === 45 || code === 48) return 'niebla';
    if (code >= 51 && code <= 57) return 'llovizna';
    if (code >= 61 && code <= 67) return 'lluvia';
    if (code >= 71 && code <= 77) return 'nieve';
    if (code >= 80 && code <= 82) return 'lluvia'; // chubascos
    if (code >= 85 && code <= 86) return 'nieve';
    if (code >= 95 && code <= 99) return 'tormenta';
    return 'desconocido';
  }

  /**
   * Nombre legible en español para la condición climática.
   */
  public getConditionLabel(condition: WeatherCondition): string {
    switch (condition) {
      case 'despejado': return 'Despejado';
      case 'parcialmente_nublado': return 'Parcialmente Nublado';
      case 'nublado': return 'Nublado';
      case 'niebla': return 'Niebla';
      case 'llovizna': return 'Llovizna';
      case 'lluvia': return 'Lluvia';
      case 'tormenta': return 'Tormenta eléctrica';
      case 'nieve': return 'Nieve';
      default: return 'Despejado';
    }
  }

  public getCoordinates(location: LocationId): { lat: number; lng: number } {
    switch (location) {
      case 'despenaderos': return LOCATIONS.despenaderosBusStop || { lat: -31.8153, lng: -64.2894 };
      case 'cordoba': return LOCATIONS.cordobaBusStop || { lat: -31.4422, lng: -64.1938 };
      case 'utn': return { lat: -31.4422, lng: -64.1938 };
      default: return { lat: -31.81, lng: -64.29 };
    }
  }

  /**
   * Obtiene el pronóstico completo de OpenMeteo con soporte offline vía caché local.
   */
  public async getWeather(location: LocationId = 'despenaderos', forceRefresh = false): Promise<WeatherData> {
    const cacheKey = `${WEATHER_CACHE_PREFIX}${location}`;

    if (!forceRefresh && this.inflightRequests.has(location)) {
      return this.inflightRequests.get(location)!;
    }

    const fetchPromise = this._fetchWeather(location, cacheKey, forceRefresh);
    this.inflightRequests.set(location, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      this.inflightRequests.delete(location);
    }
  }

  /**
   * Obtiene un resumen estandarizado rápido del clima actual (temp, rainProb, condition).
   */
  public async getQuickWeather(lat = -31.81, lng = -64.29): Promise<StandardWeatherSummary> {
    try {
      const weatherData = await this.getWeather('despenaderos');
      const rainProb = weatherData.hourly[0]?.precipitationProbability ?? (weatherData.current.precipitation > 0 ? 80 : 0);

      return {
        temp: Math.round(weatherData.current.temperature),
        rainProb,
        condition: this.getConditionLabel(weatherData.current.condition),
        conditionKey: weatherData.current.condition,
        code: weatherData.current.code,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed
      };
    } catch (e) {
      console.warn('[WeatherService] Fallback en getQuickWeather:', e);
      return {
        temp: 20,
        rainProb: 0,
        condition: 'Despejado',
        conditionKey: 'despejado',
        code: 0,
        humidity: 50,
        windSpeed: 10
      };
    }
  }

  private async _fetchWeather(location: LocationId, cacheKey: string, forceRefresh: boolean): Promise<WeatherData> {
    let cachedEntry: CacheEntry | null = null;
    if (typeof window !== 'undefined' && !forceRefresh) {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          cachedEntry = JSON.parse(stored);
          if (Date.now() - cachedEntry!.timestamp < WEATHER_CACHE_TTL) {
            return cachedEntry!.data;
          }
        }
      } catch (e) {
        console.warn('[WeatherService] Error reading cache', e);
      }
    }

    const coords = this.getCoordinates(location);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=America%2FArgentina%2FCordoba&forecast_days=7`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP error: ${res.status}`);
      }

      const rawData = await res.json();
      const parsedData = this.transformOpenMeteoResponse(location, rawData);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: parsedData
          }));
        } catch (e) {
          console.warn('[WeatherService] Could not save cache', e);
        }
      }

      return parsedData;

    } catch (error) {
      console.warn(`[WeatherService] Fetch error for ${location}, checking cache fallback:`, error);
      
      if (cachedEntry) {
        return { ...cachedEntry.data, isStale: true };
      }

      // Si no hay internet ni caché previo, generamos estructura offline segura
      return {
        locationId: location,
        updatedAtISO: new Date().toISOString(),
        isStale: true,
        current: {
          temperature: 20,
          feelsLike: 20,
          condition: 'despejado',
          code: 0,
          windSpeed: 10,
          humidity: 45,
          isDay: true,
          precipitation: 0
        },
        hourly: [],
        daily: []
      };
    }
  }

  private transformOpenMeteoResponse(location: LocationId, raw: any): WeatherData {
    const current: WeatherCurrent = {
      temperature: raw.current?.temperature_2m ?? 20,
      feelsLike: raw.current?.apparent_temperature ?? raw.current?.temperature_2m ?? 20,
      condition: this.parseWmoCode(raw.current?.weather_code ?? 0),
      code: raw.current?.weather_code ?? 0,
      windSpeed: raw.current?.wind_speed_10m ?? 0,
      humidity: raw.current?.relative_humidity_2m ?? 50,
      isDay: raw.current?.is_day === 1,
      precipitation: raw.current?.precipitation ?? 0
    };

    const hourlyTimes = raw.hourly?.time || [];
    const hourly: WeatherHourly[] = hourlyTimes.map((timeIso: string, i: number) => ({
      datetimeISO: timeIso,
      temperature: raw.hourly.temperature_2m[i] ?? 20,
      feelsLike: raw.hourly.apparent_temperature ? raw.hourly.apparent_temperature[i] : raw.hourly.temperature_2m[i],
      condition: this.parseWmoCode(raw.hourly.weather_code[i] ?? 0),
      code: raw.hourly.weather_code[i] ?? 0,
      precipitationProbability: raw.hourly.precipitation_probability ? raw.hourly.precipitation_probability[i] : 0,
      precipitation: raw.hourly.precipitation ? raw.hourly.precipitation[i] : 0,
      uvIndex: raw.hourly.uv_index ? raw.hourly.uv_index[i] : undefined,
    }));

    const dailyTimes = raw.daily?.time || [];
    const daily: WeatherDaily[] = dailyTimes.map((dateStr: string, i: number) => ({
      dateISO: dateStr,
      maxTemp: raw.daily.temperature_2m_max ? raw.daily.temperature_2m_max[i] : 22,
      minTemp: raw.daily.temperature_2m_min ? raw.daily.temperature_2m_min[i] : 10,
      condition: this.parseWmoCode(raw.daily.weather_code ? raw.daily.weather_code[i] : 0),
      code: raw.daily.weather_code ? raw.daily.weather_code[i] : 0,
      sunrise: raw.daily.sunrise ? raw.daily.sunrise[i] : undefined,
      sunset: raw.daily.sunset ? raw.daily.sunset[i] : undefined,
    }));

    return {
      locationId: location,
      updatedAtISO: new Date().toISOString(),
      current,
      hourly,
      daily
    };
  }
}

export const weatherService = WeatherService.getInstance();
