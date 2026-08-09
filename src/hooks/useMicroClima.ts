import { useState, useEffect } from 'react';
import { weatherService } from '@/core/services/weather/weather.service';
import type { LocationId } from '@/core/services/weather/weather.types';

export type Destino = 'cordoba' | 'despeñaderos';

export interface MicroClimaData {
  emoji: string;
  texto: string;
  temp: number;
  lluvia: number;
}

const mapDestinoToLocationId = (destino: Destino): LocationId => {
  return destino === 'despeñaderos' ? 'despenaderos' : 'cordoba';
};

export function useMicroClima(destino: Destino, horaLlegada: string) {
  const [climaState, setClimaState] = useState<MicroClimaData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchClima = async () => {
      try {
        const locationId = mapDestinoToLocationId(destino);
        const data = await weatherService.getWeather(locationId);
        
        if (!isMounted) return;

        if (horaLlegada && data.hourly) {
          const horaExacta = horaLlegada.split(':')[0];
          
          // Formatear hoy como YYYY-MM-DD
          const pad = (n: number) => String(n).padStart(2, '0');
          const d = new Date();
          const hoyStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
          
          // Buscamos la hora aproximada
          const targetTime = `${hoyStr}T${horaExacta.padStart(2, '0')}:00`;
          const hourlyItem = data.hourly.find(h => h.datetimeISO === targetTime);
          
          if (hourlyItem) {
            const probLluvia = hourlyItem.precipitationProbability;
            const temp = Math.round(hourlyItem.temperature);
            
            if (probLluvia > 30) {
              setClimaState({ emoji: '☔', texto: 'Puede llover', temp, lluvia: probLluvia });
            } else if (temp < 18) {
              setClimaState({ emoji: '🧥', texto: 'Llevar abrigo', temp, lluvia: probLluvia });
            } else {
              setClimaState({ emoji: '🌤️', texto: 'Clima ideal', temp, lluvia: probLluvia });
            }
          } else {
            // Fallback si no hay data de esa hora (por ejemplo si ya pasó y el forecast empieza desde ahora)
             setClimaState({ emoji: '⚠️', texto: 'Sin previsión', temp: 0, lluvia: 0 });
          }
        }
      } catch (err) {
        if (isMounted) setClimaState({ emoji: '⚠️', texto: 'Error de red', temp: 0, lluvia: 0 });
      }
    };

    fetchClima();

    return () => {
      isMounted = false;
    };
  }, [destino, horaLlegada]);

  return climaState;
}
