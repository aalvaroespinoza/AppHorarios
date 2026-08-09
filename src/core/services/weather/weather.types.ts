export type WeatherCondition = 
  | 'despejado' 
  | 'parcialmente_nublado' 
  | 'nublado'
  | 'niebla'
  | 'llovizna'
  | 'lluvia'
  | 'tormenta'
  | 'nieve'
  | 'desconocido';

export interface WeatherCurrent {
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  code: number;
  windSpeed: number;
  humidity: number;
  isDay: boolean;
  precipitation: number;
}

export interface WeatherHourly {
  datetimeISO: string; // ISO string in local timezone
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  code: number;
  precipitationProbability: number;
  precipitation: number;
  uvIndex?: number;
}

export interface WeatherDaily {
  dateISO: string; // YYYY-MM-DD
  maxTemp: number;
  minTemp: number;
  condition: WeatherCondition;
  code: number;
  sunrise?: string;
  sunset?: string;
}

export interface WeatherData {
  locationId: string;
  updatedAtISO: string;
  current: WeatherCurrent;
  hourly: WeatherHourly[];
  daily: WeatherDaily[];
  isStale?: boolean; // True si los datos provienen de un caché viejo o offline
}

export type LocationId = 'despenaderos' | 'cordoba' | 'utn';
