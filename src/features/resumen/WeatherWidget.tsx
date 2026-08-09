"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CloudSun, X, Wind, Droplets } from 'lucide-react';
import { SPRING_CONFIG } from '@/lib/animations';

const MOCK_HOURLY = [
  { time: '14:00', temp: '15°C', icon: <CloudSun size={20} />, feelsLike: '14°C', humidity: '45%', wind: '12 km/h' },
  { time: '15:00', temp: '16°C', icon: <CloudSun size={20} />, feelsLike: '15°C', humidity: '42%', wind: '14 km/h' },
  { time: '16:00', temp: '17°C', icon: <CloudSun size={20} />, feelsLike: '16°C', humidity: '40%', wind: '16 km/h' },
  { time: '17:00', temp: '16°C', icon: <CloudSun size={20} />, feelsLike: '15°C', humidity: '45%', wind: '15 km/h' },
  { time: '18:00', temp: '14°C', icon: <CloudSun size={20} />, feelsLike: '12°C', humidity: '50%', wind: '10 km/h' },
];

const MOCK_DAILY = [
  { day: 'Mañana', temp: '18°C / 9°C', desc: 'Soleado' },
  { day: 'Viernes', temp: '20°C / 10°C', desc: 'Parcialmente nublado' },
  { day: 'Sábado', temp: '22°C / 12°C', desc: 'Despejado' },
];



export function WeatherWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  interface WeatherData {
    current: { temp: number; wind: number; humidity: number; code: number };
    hourly: { time: string; temp: number; code: number }[];
    daily: { date: string; max: number; min: number; code: number }[];
  }

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const { weatherService } = await import('@/core/services/weather/weather.service');
        const data = await weatherService.getWeather('despenaderos');
        if (!isMounted) return;

        const pad = (n: number) => String(n).padStart(2, '0');
        const now = new Date();
        const nowIso = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
        
        const currentHourIndex = data.hourly.findIndex(h => h.datetimeISO >= nowIso);
        const idx = currentHourIndex === -1 ? 0 : currentHourIndex;

        const nextHours = data.hourly.slice(idx, idx + 12).map(h => ({
          time: new Date(h.datetimeISO).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          temp: Math.round(h.temperature),
          feelsLike: `${Math.round(h.feelsLike)}°C`,
          humidity: `${h.precipitationProbability}%`, // Usamos probabilidad como algo más útil en este summary
          wind: `${h.precipitation} mm`, // Cambiamos para mostrar prep
          code: h.code,
          icon: h.condition.includes('lluvia') ? <Droplets size={20} /> : <CloudSun size={20} />
        }));

        const nextDays = data.daily.slice(1, 5).map(d => ({
          date: new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(new Date(d.dateISO + 'T00:00:00')),
          max: Math.round(d.maxTemp),
          min: Math.round(d.minTemp),
          code: d.code
        }));

        setWeather({
          current: {
            temp: Math.round(data.current.temperature),
            wind: Math.round(data.current.windSpeed),
            humidity: Math.round(data.current.humidity),
            code: data.current.code
          },
          hourly: nextHours as any,
          daily: nextDays as any
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching weather:", err);
        if (isMounted) setLoading(false);
      }
    };
    fetchWeather();
    return () => { isMounted = false; };
  }, []);

  // Variantes para animar la entrada escalonada (stagger) del contenido interno
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
            className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-3 flex items-center justify-between cursor-pointer shadow-sm active:scale-95 transition-transform w-full border border-blue-200 dark:border-blue-800/50"
          >
            <div className="flex items-center gap-2">
              <CloudSun size={18} className="text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{loading || !weather ? '--' : weather.current.temp}°C - Despeñaderos</span>
            </div>
            {!loading && weather && (
              <div className="flex items-center gap-3 text-xs font-medium text-blue-800/70 dark:text-blue-200/70 pr-1">
                <span className="flex items-center gap-1"><Droplets size={12}/> {weather.current.humidity}%</span>
                <span className="flex items-center gap-1"><Wind size={12}/> {weather.current.wind} km/h</span>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />
            
            <motion.div
              key="expanded"
              layoutId="weather-card"
              transition={SPRING_CONFIG}
              style={{ borderRadius: 40 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden"
            >
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-6"
              >
                {/* Header Expandido */}
                <motion.div variants={itemVariants} className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Despeñaderos</h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-400">{displayDate}</p>
                  </div>
                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </motion.div>

                {/* Clima Actual */}
                <motion.div variants={itemVariants} className="flex items-center justify-between mt-2">
                  <div className="flex flex-col">
                    <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">{loading || !weather ? '--' : weather.current.temp}°</span>
                    <span className="text-lg font-bold text-blue-500">Parcialmente Nublado</span>
                  </div>
                  <CloudSun size={80} className="text-blue-400 opacity-90" />
                </motion.div>

                {/* Extras */}
                <motion.div variants={itemVariants} className="flex items-center gap-4 py-4 border-y border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Wind size={16} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">{loading || !weather ? '--' : weather.current.wind} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">{loading || !weather ? '--' : weather.current.humidity}%</span>
                  </div>
                </motion.div>

                {/* Hourly Slider */}
                <motion.div variants={itemVariants} className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Hoy</h3>
                  <div className="flex flex-row overflow-x-auto gap-4 py-4 snap-x hide-scrollbar w-full">
                    {(weather?.hourly || []).map((item: any, idx: number) => {
                      const isSelected = selectedHour === item.time;
                      return (
                        <motion.div 
                          layout
                          key={idx} 
                          onClick={() => setSelectedHour(isSelected ? null : item.time)}
                          className={`flex-shrink-0 w-16 flex flex-col items-center snap-center cursor-pointer p-2 rounded-2xl transition-colors ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50'
                          }`}
                        >
                          <motion.span layout className="text-xs font-medium text-gray-500">{item.time}</motion.span>
                          <motion.div layout className="text-blue-400">{item.icon}</motion.div>
                          <motion.span layout className="text-sm font-bold text-gray-900 dark:text-white">{item.temp}°C</motion.span>
                          
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden flex flex-col gap-1.5 mt-1 pt-2 border-t border-blue-200/50 dark:border-blue-800/30 w-full items-center"
                              >
                                <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium text-center leading-tight">ST: {item.feelsLike}</span>
                                <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1"><Droplets size={10} className="text-blue-400"/> {item.humidity}</span>
                                <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1"><Wind size={10} className="text-gray-400"/> {item.wind}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Próximos Días */}
                <motion.div variants={itemVariants} className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Próximos días</h3>
                  {selectedDay ? (
                    <div className="flex flex-col gap-4 mt-4 animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={() => setSelectedDay(null)} className="text-sm text-blue-500 mb-2 font-medium text-left">← Volver al pronóstico general</button>
                      <h3 className="text-xl font-bold capitalize">{selectedDay.date}</h3>
                      <div className="flex items-center gap-4 text-lg">
                        <span className="text-red-500">Máx: {selectedDay.max}°C</span>
                        <span className="text-blue-500">Mín: {selectedDay.min}°C</span>
                      </div>
                      <p className="text-gray-500">Detalles ampliados para este día irán aquí...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {(weather?.daily || []).map((item: any, idx: number) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedDay(item)}
                          className="flex items-center justify-between bg-gray-50 dark:bg-neutral-800/50 p-3 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[4rem] capitalize">{item.date}</span>
                          <span className="text-xs text-gray-500 dark:text-neutral-400 flex-1 ml-4">Cod: {item.code}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{item.max}° / {item.min}°</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
