import { LOCATIONS } from '@/data/locations';
import { WeatherCondition, WeatherData, WeatherCurrent, WeatherHourly, WeatherDaily, LocationId } from './weather.types';

const WEATHER_CACHE_PREFIX = 'weather_cache_';
const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  timestamp: number;
  data: WeatherData;
}

export class WeatherService {
  private static instance: WeatherService;
  
  // En memoria temporal para dedup request simultáneos
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

  private getCoordinates(location: LocationId): { lat: number; lng: number } {
    switch (location) {
      case 'despenaderos': return LOCATIONS.despenaderosBusStop!;
      case 'cordoba': return LOCATIONS.cordobaBusStop!;
      case 'utn': return { lat: -31.4422, lng: -64.1938 }; // Aproximado para UTN FCEFYN si no hay
      default: return LOCATIONS.despenaderosBusStop!;
    }
  }

  public async getWeather(location: LocationId, forceRefresh = false): Promise<WeatherData> {
    const cacheKey = `${WEATHER_CACHE_PREFIX}${location}`;

    // 1. Memory In-flight Deduplication
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

  private async _fetchWeather(location: LocationId, cacheKey: string, forceRefresh: boolean): Promise<WeatherData> {
    // 2. Check persistent cache
    let cachedEntry: CacheEntry | null = null;
    if (typeof window !== 'undefined' && !forceRefresh) {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          cachedEntry = JSON.parse(stored);
          if (Date.now() - cachedEntry!.timestamp < WEATHER_CACHE_TTL) {
            return cachedEntry!.data; // Valido
          }
        }
      } catch (e) {
        console.warn('[WeatherService] Error reading cache', e);
      }
    }

    // 3. Fetch Open-Meteo
    const coords = this.getCoordinates(location);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FArgentina%2FCordoba&forecast_days=7`;

    try {
      // AbortController para timeout (10s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP error: ${res.status}`);
      }

      const rawData = await res.json();
      const parsedData = this.transformOpenMeteoResponse(location, rawData);

      // Save to cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: parsedData
        }));
      }

      return parsedData;

    } catch (error) {
      console.error(`[WeatherService] Fetch error for ${location}:`, error);
      
      // Fallback a caché expirado
      if (cachedEntry) {
        console.warn(`[WeatherService] Fallback to stale cache for ${location}`);
        return { ...cachedEntry.data, isStale: true };
      }

      throw error;
    }
  }

  private transformOpenMeteoResponse(location: LocationId, raw: any): WeatherData {
    const current: WeatherCurrent = {
      temperature: raw.current.temperature_2m,
      feelsLike: raw.current.apparent_temperature,
      condition: this.parseWmoCode(raw.current.weather_code),
      code: raw.current.weather_code,
      windSpeed: raw.current.wind_speed_10m,
      humidity: raw.current.relative_humidity_2m,
      isDay: raw.current.is_day === 1,
      precipitation: raw.current.precipitation
    };

    const hourly: WeatherHourly[] = raw.hourly.time.map((timeIso: string, i: number) => ({
      datetimeISO: timeIso, // Open-meteo already returns e.g. "2026-08-08T14:00" in our requested timezone (Cordoba)
      temperature: raw.hourly.temperature_2m[i],
      feelsLike: raw.hourly.apparent_temperature[i],
      condition: this.parseWmoCode(raw.hourly.weather_code[i]),
      code: raw.hourly.weather_code[i],
      precipitationProbability: raw.hourly.precipitation_probability[i],
      precipitation: raw.hourly.precipitation[i],
    }));

    const daily: WeatherDaily[] = raw.daily.time.map((dateStr: string, i: number) => ({
      dateISO: dateStr, // "2026-08-08"
      maxTemp: raw.daily.temperature_2m_max[i],
      minTemp: raw.daily.temperature_2m_min[i],
      condition: this.parseWmoCode(raw.daily.weather_code[i]),
      code: raw.daily.weather_code[i]
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
