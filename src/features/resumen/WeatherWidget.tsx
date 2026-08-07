"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudSun, X, Wind, Droplets } from 'lucide-react';

const MOCK_HOURLY = [
  { time: '14:00', temp: '15°C', icon: <CloudSun size={20} /> },
  { time: '15:00', temp: '16°C', icon: <CloudSun size={20} /> },
  { time: '16:00', temp: '17°C', icon: <CloudSun size={20} /> },
  { time: '17:00', temp: '16°C', icon: <CloudSun size={20} /> },
  { time: '18:00', temp: '14°C', icon: <CloudSun size={20} /> },
];

const MOCK_DAILY = [
  { day: 'Mañana', temp: '18°C / 9°C', desc: 'Soleado' },
  { day: 'Viernes', temp: '20°C / 10°C', desc: 'Parcialmente nublado' },
  { day: 'Sábado', temp: '22°C / 12°C', desc: 'Despejado' },
];

export function WeatherWidget() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            layoutId="weather-card"
            onClick={() => setIsExpanded(true)}
            style={{ borderRadius: 24 }}
            className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-transform w-max border border-blue-200 dark:border-blue-800/50"
          >
            <CloudSun size={18} className="text-blue-500 dark:text-blue-400" />
            <span className="text-sm font-bold text-blue-900 dark:text-blue-100">14°C - Despeñaderos</span>
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
              style={{ borderRadius: 40 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl flex flex-col gap-6 overflow-hidden"
            >
              {/* Header Expandido */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Despeñaderos</h2>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">Jueves, 7 de Agosto</p>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Clima Actual */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex flex-col">
                  <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">14°</span>
                  <span className="text-lg font-bold text-blue-500">Parcialmente Nublado</span>
                </div>
                <CloudSun size={80} className="text-blue-400 opacity-90" />
              </div>

              {/* Extras */}
              <div className="flex items-center gap-4 py-4 border-y border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Wind size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">12 km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">45%</span>
                </div>
              </div>

              {/* Hourly Slider */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Hoy</h3>
                <div className="flex overflow-x-auto snap-x hide-scrollbar gap-4 pb-2">
                  {MOCK_HOURLY.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 snap-center min-w-[3.5rem]">
                      <span className="text-xs font-medium text-gray-500">{item.time}</span>
                      <div className="text-blue-400">{item.icon}</div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.temp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximos Días */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Próximos días</h3>
                <div className="flex flex-col gap-3">
                  {MOCK_DAILY.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-neutral-800/50 p-3 rounded-2xl">
                      <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[4rem]">{item.day}</span>
                      <span className="text-xs text-gray-500 dark:text-neutral-400 flex-1 ml-4">{item.desc}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.temp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
