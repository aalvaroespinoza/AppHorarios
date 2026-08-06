import { useState, useEffect } from 'react';

type Destino = 'cordoba' | 'despeñaderos';

export interface MicroClimaData {
  emoji: string;
  texto: string;
  temp: number;
  lluvia: number;
}

interface ClimaCache {
  timestamp: number;
  data: any;
}

const CACHE_KEY_PREFIX = 'micro_clima_';
const CACHE_EXPIRY_MS = 3 * 60 * 60 * 1000; // 3 horas

const COORDS = {
  cordoba: { lat: -31.4135, lng: -64.181 },
  despeñaderos: { lat: -31.815, lng: -64.289 }
};

export function useMicroClima(destino: Destino, horaLlegada: string) {
  const [climaState, setClimaState] = useState<MicroClimaData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchClima = async () => {
      const cacheKey = `${CACHE_KEY_PREFIX}${destino}`;
      const cached = localStorage.getItem(cacheKey);
      let parsedCache: ClimaCache | null = null;
      
      if (cached) {
        try {
          parsedCache = JSON.parse(cached);
        } catch (e) {
          console.error(`[MicroClima] Error parsing cache para ${destino}:`, e);
        }
      }

      const now = Date.now();
      let dataToUse = null;

      if (parsedCache && (now - parsedCache.timestamp < CACHE_EXPIRY_MS)) {
        dataToUse = parsedCache.data;
      } else {
        // Necesitamos fetch nuevo
        try {
          const { lat, lng } = COORDS[destino];
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation_probability&timezone=America%2FArgentina%2FCordoba&forecast_days=2`;
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.error) {
              console.error(`[MicroClima] Error devuelto por la API de Open-Meteo:`, data.error, data.reason);
            }
            dataToUse = data;
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data }));
          } else {
            console.error(`[MicroClima] Error HTTP ${res.status} al consultar Open-Meteo para ${destino}`);
            if (parsedCache) {
              dataToUse = parsedCache.data;
            }
          }
        } catch (error) {
          console.error(`[MicroClima] Excepción de red al intentar fetchear clima para ${destino}:`, error);
          if (parsedCache) {
            dataToUse = parsedCache.data;
          }
        }
      }

      if (!dataToUse) {
        console.error(`[MicroClima] No hay dataToUse disponible para ${destino} (sin caché y fetch fallido).`);
        if (isMounted) setClimaState({ emoji: '⚠️', texto: 'Error de red', temp: 0, lluvia: 0 });
        return;
      }

      if (dataToUse && isMounted && horaLlegada) {
        const horaExacta = horaLlegada.split(':')[0];
        const index = parseInt(horaExacta, 10);
        
        console.log(`[MicroClima] Destino: ${destino}, Hora Llegada Recibida: ${horaLlegada}, Índice calculado: ${index}`);
        
        if (isNaN(index) || index < 0 || !dataToUse.hourly?.time || index >= dataToUse.hourly.time.length) {
          console.error(`[MicroClima] Índice ${index} fuera de rango o datos inválidos en la respuesta de la API`);
          setClimaState({ emoji: '⚠️', texto: 'Error de datos', temp: 0, lluvia: 0 });
          return;
        }

        const probLluvia = dataToUse.hourly.precipitation_probability[index];
        const temp = dataToUse.hourly.temperature_2m[index];
        
        console.log(`[MicroClima] Encontrado! Temp: ${temp}°C, Lluvia: ${probLluvia}%`);
        
        if (probLluvia > 30) {
          setClimaState({ emoji: '☔', texto: 'Puede llover', temp, lluvia: probLluvia });
        } else if (temp < 18) {
          setClimaState({ emoji: '🧥', texto: 'Llevar abrigo', temp, lluvia: probLluvia });
        } else {
          setClimaState({ emoji: '🌤️', texto: 'Clima ideal', temp, lluvia: probLluvia });
        }
      }
    };

    fetchClima();

    return () => {
      isMounted = false;
    };
  }, [destino, horaLlegada]);

  return climaState;
}
