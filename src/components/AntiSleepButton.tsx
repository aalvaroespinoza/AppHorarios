"use client";

import { useAntiSleepAlarm } from '@/hooks/useAntiSleepAlarm';
import { MapPin, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  targetLat: number;
  targetLng: number;
  label?: string;
}

export default function AntiSleepButton({ targetLat, targetLng, label = "Activar Anti-Pestañeo 📍" }: Props) {
  const { isActive, permissionError, toggleAlarm } = useAntiSleepAlarm(targetLat, targetLng);

  return (
    <div className="w-full mt-3">
      <motion.button
        whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
        onClick={toggleAlarm}
        className={`relative w-full py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 border ${
          isActive 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : permissionError
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800'
        }`}
      >
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2"
              >
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <span>Rastreando destino...</span>
              </motion.div>
            </motion.div>
          ) : permissionError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <AlertTriangle size={18} />
              <span>GPS Denegado (Tocar para reintentar)</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <MapPin size={18} />
              <span>{label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
