import { useState, useEffect } from 'react';

type Destino = 'cordoba' | 'despeñaderos';

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
  const [climaState, setClimaState] = useState<string | null>(null);

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
          // invalid cache
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
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation_probability&timezone=America%2FArgentina%2FBuenos_Aires&forecast_days=2`;
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            dataToUse = data;
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data }));
          } else if (parsedCache) {
            // Fallback a caché vieja si falla la red
            dataToUse = parsedCache.data;
          }
        } catch (error) {
          // Error de red, usar caché si existe
          if (parsedCache) {
            dataToUse = parsedCache.data;
          }
        }
      }

      if (dataToUse && isMounted) {
        const horaExacta = horaLlegada.split(':')[0].padStart(2, '0');
        const targetSuffix = `T${horaExacta}:00`;
        
        const index = dataToUse.hourly.time.findIndex((t: string) => t.endsWith(targetSuffix));
        
        if (index !== -1) {
          const probLluvia = dataToUse.hourly.precipitation_probability[index];
          const temp = dataToUse.hourly.temperature_2m[index];
          
          let result = '';
          if (probLluvia > 40) result += '☔ ';
          if (temp < 12) result += '🧥';
          
          result = result.trim();
          setClimaState(result || null);
        } else {
          setClimaState(null);
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
