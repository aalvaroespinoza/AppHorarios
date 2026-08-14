"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MapPin, Moon, CheckCircle2 } from 'lucide-react';
import NativeCard from '@/core/components/ui/NativeCard';
import { calcularHoraLlegada } from '@/core/utils/time';
import { addMinutes, OFFSET_PARADA_VUELTA_MIN } from '@/lib/engine/recommendation-engine';
import { useCountdown } from '@/hooks/useCountdown';
import type { RawScheduleEntry } from '@/types/schedule';
import type { useBec } from '@/hooks/useBec';
import { SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';
import { parseMateriaRawText } from '@/core/utils/materiaParser';

export const formatMinutosFaltantes = (mins: number) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export function HorarioCard({ 
  titulo, 
  recomendacion, 
  icon: Icon,
  direction,
  bec,
  isToday = true
}: { 
  titulo: string;
  recomendacion: { recomendado: RawScheduleEntry | null; alternativas: RawScheduleEntry[] };
  icon: React.ElementType;
  direction: 'ida' | 'vuelta';
  bec: ReturnType<typeof useBec>;
  isToday?: boolean;
}) {
  const [verAlternativas, setVerAlternativas] = useState(false);
  
  const [currentRecomendado, setCurrentRecomendado] = useState<RawScheduleEntry | null>(recomendacion.recomendado);
  const [currentAlternativas, setCurrentAlternativas] = useState<RawScheduleEntry[]>(recomendacion.alternativas);

  useEffect(() => {
    setCurrentRecomendado(recomendacion.recomendado);
    setCurrentAlternativas(recomendacion.alternativas);
  }, [recomendacion]);

  const registroHoy = bec.getRegistroHoy();
  const becUsado = isToday && (direction === 'ida' ? registroHoy.idaUsado : registroHoy.vueltaUsado);

  const handleSwap = (alt: RawScheduleEntry, idx: number) => {
    if (!currentRecomendado) return;
    const newAlts = [...currentAlternativas];
    newAlts[idx] = currentRecomendado;
    newAlts.sort((a, b) => a.horaSalida.localeCompare(b.horaSalida));
    setCurrentRecomendado(alt);
    setCurrentAlternativas(newAlts);
    setVerAlternativas(false);
  };

  const toggleTomado = () => {
    if (becUsado) {
      bec.desmarcarViaje(direction);
    } else {
      bec.marcarViaje(direction);
    }
  };
  
  const esVuelta = titulo.toLowerCase().includes('vuelta');
  const horaReal = esVuelta && currentRecomendado ? addMinutes(currentRecomendado.horaSalida, OFFSET_PARADA_VUELTA_MIN) : currentRecomendado?.horaSalida;

  const minutosFaltantes = useCountdown(horaReal);
  const parsed = parseMateriaRawText(titulo);

  if (!currentRecomendado) {
    return (
      <NativeCard className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center border border-gray-200 dark:border-zinc-700">
          <Moon size={28} className="text-gray-400 dark:text-zinc-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Hoy no hay {titulo.toLowerCase()} programada 🏠</p>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">Disfrutá tu tiempo o descansá en Córdoba.</p>
        </div>
      </NativeCard>
    );
  }

  return (
    <NativeCard className={`flex flex-col relative overflow-hidden transition-all duration-300 ${becUsado ? 'opacity-70 grayscale-[0.3]' : ''}`}>
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors ${becUsado ? 'bg-green-500/10' : 'bg-blue-500/10'}`} />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
          <Icon size={18} />
          {parsed.curso ? (
            <div className="flex flex-col items-center text-center justify-center h-full w-full p-1 gap-0.5">
              <span className="font-bold text-xs leading-tight">{parsed.nombre}</span>
              <span className="text-[11px] opacity-80 font-medium">
                {parsed.curso} | Aula {parsed.aula}
              </span>
              <span className="text-[10px] font-bold text-neutral-900 dark:text-white bg-black/10 dark:bg-white/20 px-1.5 py-0.5 rounded-md mt-0.5">
                📍 {parsed.edificio}
              </span>
            </div>
          ) : (
            <h2 className="font-semibold text-sm uppercase tracking-wider">{parsed.nombre}</h2>
          )}
        </div>
        <motion.button 
          whileTap={TAP_ANIMATION}
          onClick={toggleTomado}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            becUsado 
              ? 'bg-green-900/30 text-green-400 border-green-800/50 hover:bg-green-900/50' 
              : 'bg-gray-100 dark:bg-zinc-800/50 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700/50 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 size={16} />
          {becUsado ? 'BEC Usado ✓' : 'Ya lo tomé'}
        </motion.button>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm mb-1">{currentRecomendado.empresa}</p>
          {esVuelta ? (
            <>
              <div className="text-sm text-gray-500 dark:text-zinc-400 mb-1 mt-2">Sale de Terminal: {currentRecomendado.horaSalida}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">Pasa por tu parada (Ministerio):</div>
              <div className="text-6xl font-sans tracking-tight text-gray-900 dark:text-white leading-none">
                {horaReal}
              </div>
            </>
          ) : (
            <div className="text-6xl font-sans tracking-tight text-gray-900 dark:text-white leading-none">
              {currentRecomendado.horaSalida}
            </div>
          )}
        </div>
        
        {minutosFaltantes !== null && (
          <div className="flex flex-col items-end gap-2">
            <div className={`font-medium px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm ${
              minutosFaltantes > 0 && minutosFaltantes <= 60 
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 animate-pulse' 
                : minutosFaltantes < 0
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-300'
            }`}>
              <span className="relative flex h-2 w-2">
                {minutosFaltantes > 0 && minutosFaltantes <= 60 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  minutosFaltantes > 0 && minutosFaltantes <= 60 
                    ? 'bg-blue-500' 
                    : minutosFaltantes < 0
                      ? 'bg-red-500'
                      : 'bg-zinc-500'
                }`}></span>
              </span>
              <span>
                {minutosFaltantes > 0 
                  ? `Sale en ${formatMinutosFaltantes(minutosFaltantes)}` 
                  : minutosFaltantes === 0 
                    ? 'Saliendo...' 
                    : 'Ya salió'}
              </span>
            </div>
          </div>
        )}
      </div>

      {currentRecomendado.notas && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 p-3 rounded-2xl mb-4 text-sm text-blue-700 dark:text-blue-200 flex gap-2 items-start">
          <MapPin size={16} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
          <span className="leading-snug">
            {currentRecomendado.notas.replace(/llegada estimada/i, `Llegada estimada a las ${calcularHoraLlegada(currentRecomendado.horaSalida, direction)}`)}
          </span>
        </div>
      )}

      {currentAlternativas.length > 0 && (
        <div className="border-t border-gray-200 dark:border-zinc-800/80 pt-4 mt-2">
          <motion.button 
            whileTap={TAP_ANIMATION}
            onClick={() => setVerAlternativas(!verAlternativas)}
            className="flex items-center justify-between w-full text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors py-1"
          >
            <span>Ver siguientes {currentAlternativas.length} opciones</span>
            {verAlternativas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.button>
          <AnimatePresence>
            {verAlternativas && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={SPRING_CONFIG}
                className="mt-4 flex flex-col gap-2 overflow-hidden"
              >
                {currentAlternativas.map((alt: RawScheduleEntry, idx: number) => (
                  <motion.button 
                    whileTap={TAP_ANIMATION}
                    key={idx} 
                    onClick={() => handleSwap(alt, idx)}
                    className="flex flex-col justify-center bg-gray-100 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-700/50 p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800/80 transition-colors text-left"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold text-gray-900 dark:text-white text-lg">{alt.horaSalida}</span>
                      <span className="text-gray-500 dark:text-zinc-400 text-sm font-medium">{alt.empresa}</span>
                    </div>
                    <span className="text-gray-500 dark:text-zinc-400 text-sm font-medium mt-1">
                      Hora estimada de Llegada: {calcularHoraLlegada(alt.horaSalida, direction)}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </NativeCard>
  );
}

