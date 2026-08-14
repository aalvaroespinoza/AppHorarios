"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MapPin, Moon, CheckCircle2, Clock, Bus, Sparkles } from 'lucide-react';
import NativeCard from '@/core/components/ui/NativeCard';
import { calcularHoraLlegada } from '@/core/utils/time';
import { addMinutes, OFFSET_PARADA_VUELTA_MIN } from '@/lib/engine/recommendation-engine';
import { useCountdown } from '@/hooks/useCountdown';
import type { RawScheduleEntry } from '@/types/schedule';
import type { useBec } from '@/hooks/useBec';
import { SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

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
  icon: Icon = Bus,
  direction,
  bec,
  isToday = true
}: { 
  titulo: string;
  recomendacion: { recomendado: RawScheduleEntry | null; alternativas: RawScheduleEntry[] };
  icon?: React.ElementType;
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
  
  const esVuelta = direction === 'vuelta' || titulo.toLowerCase().includes('vuelta');
  const horaReal = esVuelta && currentRecomendado ? addMinutes(currentRecomendado.horaSalida, OFFSET_PARADA_VUELTA_MIN) : currentRecomendado?.horaSalida;
  const minutosFaltantes = useCountdown(horaReal);

  if (!currentRecomendado) {
    return (
      <NativeCard className="flex flex-col items-center justify-center py-10 text-center gap-3 bg-neutral-900/40 border-neutral-800/80 rounded-3xl">
        <div className="w-14 h-14 bg-neutral-800/50 rounded-full flex items-center justify-center border border-neutral-700/50">
          <Moon size={24} className="text-neutral-400" />
        </div>
        <div>
          <p className="text-base font-bold text-white">No hay {titulo.toLowerCase()} programada</p>
          <p className="text-xs text-neutral-400 mt-0.5">Disfrutá tu día o descansá en casa.</p>
        </div>
      </NativeCard>
    );
  }

  return (
    <NativeCard className={`flex flex-col relative overflow-hidden transition-all duration-300 rounded-3xl border border-neutral-800/80 bg-neutral-950/60 backdrop-blur-md p-5 shadow-xl ${becUsado ? 'opacity-75 grayscale-[0.2]' : ''}`}>
      {/* Resplandor sutil */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors ${becUsado ? 'bg-emerald-500/10' : 'bg-cyan-500/10'}`} />

      {/* Cabecera de la Tarjeta */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${esVuelta ? 'bg-indigo-500/10 text-indigo-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
            <Icon size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-tight leading-tight">{titulo}</h2>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {currentRecomendado.empresa}
            </span>
          </div>
        </div>

        {/* Botón BEC */}
        <motion.button 
          whileTap={TAP_ANIMATION}
          onClick={toggleTomado}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
            becUsado 
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <CheckCircle2 size={14} className={becUsado ? 'text-emerald-400' : 'text-neutral-500'} />
          <span>{becUsado ? 'BEC Usado ✓' : 'Marcar BEC'}</span>
        </motion.button>
      </div>

      {/* Horario Principal y Cuenta Regresiva */}
      <div className="flex justify-between items-end my-2">
        <div>
          {esVuelta ? (
            <div className="flex flex-col">
              <span className="text-[11px] text-neutral-400 font-medium">Paso por parada Ministerio:</span>
              <div className="text-5xl font-black font-sans tracking-tight text-white leading-none mt-1">
                {horaReal}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono mt-1">
                Sale de Terminal Cba: {currentRecomendado.horaSalida} hs
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[11px] text-neutral-400 font-medium">Salida de Despeñaderos:</span>
              <div className="text-5xl font-black font-sans tracking-tight text-white leading-none mt-1">
                {currentRecomendado.horaSalida}
              </div>
            </div>
          )}
        </div>
        
        {/* Píldora de cuenta regresiva */}
        {minutosFaltantes !== null && (
          <div className="flex flex-col items-end pb-1">
            <div className={`font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-md ${
              minutosFaltantes > 0 && minutosFaltantes <= 45 
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.25)]' 
                : minutosFaltantes < 0
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300'
            }`}>
              <span className="relative flex h-2 w-2">
                {minutosFaltantes > 0 && minutosFaltantes <= 45 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  minutosFaltantes > 0 && minutosFaltantes <= 45 
                    ? 'bg-cyan-400' 
                    : minutosFaltantes < 0
                      ? 'bg-red-400'
                      : 'bg-neutral-500'
                }`}></span>
              </span>
              <span>
                {minutosFaltantes > 0 
                  ? `Sale en ${formatMinutosFaltantes(minutosFaltantes)}` 
                  : minutosFaltantes === 0 
                    ? 'Saliendo ahora' 
                    : 'Ya salió'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Nota / Llegada Estimada */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 p-2.5 rounded-2xl my-2 text-xs text-neutral-300 flex items-center gap-2">
        <Clock size={14} className="text-cyan-400 shrink-0" />
        <span className="leading-snug">
          Llegada estimada a destino: <strong className="text-white font-mono">{calcularHoraLlegada(currentRecomendado.horaSalida, direction)} hs</strong>
        </span>
      </div>

      {/* Alternativas Siguientes */}
      {currentAlternativas.length > 0 && (
        <div className="border-t border-neutral-800/60 pt-3 mt-1">
          <motion.button 
            whileTap={TAP_ANIMATION}
            onClick={() => setVerAlternativas(!verAlternativas)}
            className="flex items-center justify-between w-full text-xs font-semibold text-neutral-400 hover:text-white transition-colors py-1"
          >
            <span>Ver siguientes {currentAlternativas.length} opciones de viaje</span>
            {verAlternativas ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </motion.button>
          <AnimatePresence>
            {verAlternativas && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={SPRING_CONFIG}
                className="mt-2 flex flex-col gap-2 overflow-hidden"
              >
                {currentAlternativas.map((alt: RawScheduleEntry, idx: number) => (
                  <motion.button 
                    whileTap={TAP_ANIMATION}
                    key={idx} 
                    onClick={() => handleSwap(alt, idx)}
                    className="flex justify-between items-center bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl transition-colors text-left group"
                  >
                    <div>
                      <span className="font-mono font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                        {alt.horaSalida} hs
                      </span>
                      <span className="text-xs text-neutral-400 ml-2 font-medium">
                        {alt.empresa}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Llega {calcularHoraLlegada(alt.horaSalida, direction)}
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
