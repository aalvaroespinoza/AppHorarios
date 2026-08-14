"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CloudSun, CloudRain, X, Wind, Droplets, SunMedium, Sunset, AlertCircle, WifiOff } from 'lucide-react';
import { SPRING_CONFIG } from '@/lib/animations';
import { useEscenario } from '@/hooks/useEscenario';
import { calcularColectivos } from '@/lib/engine/recommendation-engine';
import { weatherService } from '@/core/services/weather/weather.service';
import type { DayOfWeek } from '@/core/types/common';
import type { WeatherData } from '@/core/services/weather/weather.types';

export function WeatherWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [warnings, setWarnings] = useState<{ uv: string | null; sunset: string | null }>({ uv: null, sunset: null });

  const { cursaArquitectura, duermeEnCordoba, diaSeleccionado } = useEscenario();
  const recIda = calcularColectivos(diaSeleccionado as DayOfWeek, 'ida', cursaArquitectura, duermeEnCordoba, '00:00');
  const recVuelta = calcularColectivos(diaSeleccionado as DayOfWeek, 'vuelta', cursaArquitectura, duermeEnCordoba, '00:00');

  const horaIda = recIda.recomendado?.horaSalida;
  const horaVuelta = recVuelta.recomendado?.horaSalida;

  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      try {
        setLoading(true);
        const data = await weatherService.getWeather('despenaderos');
        if (!isMounted) return;

        setWeather(data);
        setIsOffline(!!data.isStale);
        setLoading(false);
      } catch (err) {
        console.warn('[WeatherWidget] Error cargando clima, usando fallback offline:', err);
        if (isMounted) {
          setIsOffline(true);
          setLoading(false);
        }
      }
    };

    loadWeather();
    return () => { isMounted = false; };
  }, []);

  // Probabilidad de lluvia actual o en la próxima hora
  const currentRainProb = weather?.hourly?.[0]?.precipitationProbability ?? 
    (weather?.current?.precipitation && weather.current.precipitation > 0 ? 85 : 0);

  const isRainRisk = currentRainProb > 40;

  // Cálculo de advertencias de UV y Atardecer
  useEffect(() => {
    if (weather && weather.hourly && weather.daily && weather.hourly.length > 0) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      let uvWarningStr: string | null = null;
      let sunsetWarningStr: string | null = null;

      if (horaIda || horaVuelta) {
        const checkUV = (hora: string | undefined) => {
          if (!hora) return false;
          const hour = hora.split(':')[0];
          const targetIso = `${todayStr}T${hour.padStart(2, '0')}:00`;
          const hData = weather.hourly.find(h => h.datetimeISO === targetIso);
          return !!(hData && hData.uvIndex && hData.uvIndex > 6);
        };

        const idaHighUV = checkUV(horaIda);
        const vueltaHighUV = checkUV(horaVuelta);
        if (idaHighUV && vueltaHighUV) {
          uvWarningStr = "UV Alto (>6) en tus viajes de ida y vuelta. Usá protector solar.";
        } else if (idaHighUV) {
          uvWarningStr = "UV Alto (>6) en tu viaje de ida. Usá protector solar.";
        } else if (vueltaHighUV) {
          uvWarningStr = "UV Alto (>6) en tu viaje de vuelta. Usá protector solar.";
        }
      }

      if (horaVuelta && weather.daily[0]?.sunset) {
        const sunsetIso = weather.daily[0].sunset;
        const sunsetTime = sunsetIso.split('T')[1];
        if (sunsetTime) {
          const sunsetHour = parseInt(sunsetTime.split(':')[0], 10);
          const sunsetMin = parseInt(sunsetTime.split(':')[1], 10);
          const sunsetTotal = sunsetHour * 60 + sunsetMin;

          const vHour = parseInt(horaVuelta.split(':')[0], 10);
          const vMin = parseInt(horaVuelta.split(':')[1], 10);
          const vTotal = vHour * 60 + vMin;

          if (Math.abs(sunsetTotal - vTotal) <= 60) {
            sunsetWarningStr = `Tu viaje de vuelta coincidirá con el atardecer (${sunsetTime} hs)`;
          }
        }
      }

      setWarnings({ uv: uvWarningStr, sunset: sunsetWarningStr });
    }
  }, [weather, horaIda, horaVuelta]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: SPRING_CONFIG }
  };

  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const conditionLabel = weather 
    ? weatherService.getConditionLabel(weather.current.condition)
    : 'Cargando...';

  // Horas futuras procesadas
  const nextHours = (weather?.hourly || []).slice(0, 12).map(h => ({
    time: new Date(h.datetimeISO).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(h.temperature),
    feelsLike: `${Math.round(h.feelsLike)}°C`,
    rainProb: h.precipitationProbability,
    precipitation: `${h.precipitation} mm`,
    code: h.code,
    isRainy: h.precipitationProbability > 40 || h.condition.includes('lluvia')
  }));

  // Días futuros procesados
  const nextDays = (weather?.daily || []).slice(1, 5).map(d => ({
    date: new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(new Date(d.dateISO + 'T00:00:00')),
    max: Math.round(d.maxTemp),
    min: Math.round(d.minTemp),
    condition: weatherService.getConditionLabel(d.condition),
    code: d.code
  }));

  return (
    <>
      <AnimatePresence>
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            layoutId="weather-card"
            transition={SPRING_CONFIG}
            onClick={() => setIsExpanded(true)}
            style={{ borderRadius: 24 }}
            className={`rounded-full px-4 py-3 flex items-center justify-between cursor-pointer shadow-sm active:scale-95 transition-transform w-full border ${
              isRainRisk 
                ? 'bg-blue-500/10 dark:bg-blue-900/30 border-blue-400/40 text-blue-900 dark:text-blue-100' 
                : 'bg-blue-100/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40 text-blue-900 dark:text-blue-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isRainRisk ? (
                <CloudRain size={20} className="text-blue-500 shrink-0 animate-bounce" />
              ) : (
                <CloudSun size={20} className="text-blue-500 dark:text-blue-400 shrink-0" />
              )}
              <span className="text-sm font-bold truncate">
                {loading ? '--°' : `${Math.round(weather?.current?.temperature ?? 20)}°C`} - Despeñaderos
              </span>
              {isRainRisk && (
                <span className="hidden sm:inline-flex bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  ☔ Llevá paraguas ({currentRainProb}%)
                </span>
              )}
            </div>

            {!loading && weather && (
              <div className="flex items-center gap-3 text-xs font-medium text-blue-800/70 dark:text-blue-200/70 shrink-0 pl-2">
                <span className="flex items-center gap-1">
                  <Droplets size={13} className={isRainRisk ? 'text-blue-500 font-bold' : ''} /> 
                  {currentRainProb}%
                </span>
                {isOffline && (
                  <span title="Datos en caché" className="inline-flex items-center">
                    <WifiOff size={13} className="text-amber-400" />
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsExpanded(false)}
            />

            <motion.div
              key="expanded"
              layoutId="weather-card"
              transition={SPRING_CONFIG}
              style={{ borderRadius: 36 }}
              className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden text-white"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-5"
              >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">Despeñaderos</h2>
                      {isOffline && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-medium">
                          Offline / Caché
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400 capitalize">{displayDate}</p>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </motion.div>

                {/* Clima Actual */}
                <motion.div variants={itemVariants} className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <span className="text-6xl font-black tracking-tighter">
                      {loading ? '--' : Math.round(weather?.current?.temperature ?? 20)}°
                    </span>
                    <span className="text-base font-semibold text-blue-400">
                      {conditionLabel}
                    </span>
                  </div>
                  {isRainRisk ? (
                    <CloudRain size={72} className="text-blue-400 animate-pulse" />
                  ) : (
                    <CloudSun size={72} className="text-blue-400 opacity-90" />
                  )}
                </motion.div>

                {/* Badge Alerta de Lluvia */}
                {isRainRisk && (
                  <motion.div variants={itemVariants} className="bg-blue-500/15 border border-blue-500/30 text-blue-200 p-3 rounded-2xl flex items-center gap-2.5 text-sm font-medium">
                    <span className="text-lg">☔</span>
                    <span>Alta probabilidad de lluvia ({currentRainProb}%). ¡Salí con paraguas y margen de tiempo!</span>
                  </motion.div>
                )}

                {/* Métricas */}
                <motion.div variants={itemVariants} className="flex items-center justify-around py-3 border-y border-neutral-800 text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-blue-400" />
                    <span className="text-sm font-bold">{currentRainProb}% lluvia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind size={16} className="text-teal-400" />
                    <span className="text-sm font-bold">{Math.round(weather?.current?.windSpeed ?? 0)} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-medium">Humedad:</span>
                    <span className="text-sm font-bold">{Math.round(weather?.current?.humidity ?? 50)}%</span>
                  </div>
                </motion.div>

                {/* Avisos de Viaje (UV y Atardecer) */}
                <AnimatePresence>
                  {(warnings.uv || warnings.sunset) && (
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex flex-col gap-2">
                      {warnings.uv && (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-xs font-semibold">
                          <SunMedium size={18} className="shrink-0 text-amber-400" />
                          <span>{warnings.uv}</span>
                        </div>
                      )}
                      {warnings.sunset && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 p-3 rounded-xl text-xs font-semibold">
                          <Sunset size={18} className="shrink-0 text-indigo-400" />
                          <span>{warnings.sunset}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pronóstico por hora */}
                {nextHours.length > 0 && (
                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Hoy (Próximas horas)</h3>
                    <div className="flex flex-row overflow-x-auto gap-3 py-2 snap-x hide-scrollbar w-full">
                      {nextHours.map((item, idx) => {
                        const isSelected = selectedHour === item.time;
                        return (
                          <motion.div
                            key={idx}
                            onClick={() => setSelectedHour(isSelected ? null : item.time)}
                            className={`shrink-0 w-16 flex flex-col items-center snap-center cursor-pointer p-2.5 rounded-2xl transition-colors border ${
                              isSelected 
                                ? 'bg-blue-900/30 border-blue-500/50' 
                                : 'bg-neutral-800/60 border-neutral-700/50 hover:bg-neutral-800'
                            }`}
                          >
                            <span className="text-xs font-medium text-neutral-400">{item.time}</span>
                            <div className="my-1 text-blue-400">
                              {item.isRainy ? <CloudRain size={18} /> : <CloudSun size={18} />}
                            </div>
                            <span className="text-sm font-bold">{item.temp}°</span>
                            <span className="text-[10px] text-blue-300 font-medium">{item.rainProb}%</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Pronóstico próximos días */}
                {nextDays.length > 0 && (
                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Próximos días</h3>
                    <div className="flex flex-col gap-2">
                      {nextDays.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-neutral-800/50 border border-neutral-700/40 p-3 rounded-2xl"
                        >
                          <span className="text-sm font-bold capitalize w-24">{item.date}</span>
                          <span className="text-xs text-neutral-400 flex-1 truncate">{item.condition}</span>
                          <span className="text-sm font-bold text-neutral-200">{item.max}° / {item.min}°</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
