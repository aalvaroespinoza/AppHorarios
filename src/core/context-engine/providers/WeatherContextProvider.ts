import { ContextProvider, ContextEvent } from '../types';
import { weatherService } from '@/core/services/weather/weather.service';
import type { LocationId } from '@/core/services/weather/weather.types';

const LOCATIONS_MAP: Record<string, LocationId> = {
  cordoba: 'cordoba',
  despeñaderos: 'despenaderos'
};

export class WeatherContextProvider implements ContextProvider {
  name = 'WeatherContextProvider';

  async getEvents(referenceDate: Date): Promise<ContextEvent[]> {
    const events: ContextEvent[] = [];
    if (typeof window === 'undefined') return events;

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${referenceDate.getFullYear()}-${pad(referenceDate.getMonth()+1)}-${pad(referenceDate.getDate())}`;

    // Solo buscamos el clima para hoy o mañana
    const diffDays = Math.floor((referenceDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays > 1) {
      return events; // No tenemos forecast mas alla de 2 días
    }

    for (const [destino, locId] of Object.entries(LOCATIONS_MAP)) {
      try {
        const data = await weatherService.getWeather(locId);

        // Encontrar eventos relevantes (lluvia > 30% o temp < 10 o temp > 35) 
        // a lo largo del día de referencia
        if (data && data.hourly) {
          for (let i = 0; i < data.hourly.length; i++) {
            const h = data.hourly[i];
            const timeISO = h.datetimeISO; // formato 2026-08-08T00:00
            
            if (timeISO.startsWith(dateStr)) {
              const probLluvia = h.precipitationProbability;
              const temp = h.temperature;

              let isRelevant = false;
              let type = '';
              let title = '';

              if (probLluvia > 30) {
                isRelevant = true;
                type = 'rain';
                title = `Lluvia en ${destino} (${probLluvia}%)`;
              } else if (temp < 10) {
                isRelevant = true;
                type = 'cold';
                title = `Mucho frío en ${destino} (${Math.round(temp)}°C)`;
              } else if (temp > 35) {
                isRelevant = true;
                type = 'heat';
                title = `Mucho calor en ${destino} (${Math.round(temp)}°C)`;
              }

              if (isRelevant) {
                // timeISO has no Z because we asked open-meteo without it, BUT weatherService returns what open meteo gives, which is YYYY-MM-DDTHH:mm
                events.push({
                  id: `weather-${destino}-${timeISO}`,
                  category: 'weather',
                  type,
                  title,
                  datetimeISO: new Date(timeISO).toISOString(), // Parse to UTC for the engine
                  priority: 'low',
                  priorityReasons: [],
                  source: this.name,
                  metadata: { temp, probLluvia, location: destino }
                });
              }
            }
          }
        }
      } catch (e) {
        console.error(`[WeatherContextProvider] Error fetching weather for ${destino}:`, e);
      }
    }

    return events;
  }
}
