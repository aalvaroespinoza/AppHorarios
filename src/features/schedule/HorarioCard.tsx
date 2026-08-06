"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MapPin, Moon, CheckCircle2 } from 'lucide-react';
import NativeCard from '@/components/ui/NativeCard';
import AntiSleepButton from '@/components/AntiSleepButton';
import { calcularHoraLlegada } from '@/utils/time';
import { addMinutes, OFFSET_PARADA_VUELTA_MIN } from '@/lib/engine/recommendation-engine';
import { useCountdown } from '@/hooks/useCountdown';
import type { RawScheduleEntry } from '@/types/schedule';
import type { useBec } from '@/hooks/useBec';

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
  bec
}: { 
  titulo: string;
  recomendacion: { recomendado: RawScheduleEntry | null; alternativas: RawScheduleEntry[] };
  icon: React.ElementType;
  direction: 'ida' | 'vuelta';
  bec: ReturnType<typeof useBec>;
}) {
  const [verAlternativas, setVerAlternativas] = useState(false);
  
  const [currentRecomendado, setCurrentRecomendado] = useState<RawScheduleEntry | null>(recomendacion.recomendado);
  const [currentAlternativas, setCurrentAlternativas] = useState<RawScheduleEntry[]>(recomendacion.alternativas);

  useEffect(() => {
    setCurrentRecomendado(recomendacion.recomendado);
    setCurrentAlternativas(recomendacion.alternativas);
  }, [recomendacion]);

  const registroHoy = bec.getRegistroHoy();
  const becUsado = direction === 'ida' ? registroHoy.idaUsado : registroHoy.vueltaUsado;

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
  
  const targetLat = direction === 'ida' ? -31.4422 : -31.8153;
  const targetLng = direction === 'ida' ? -64.1938 : -64.2894;

  const minutosFaltantes = useCountdown(horaReal);

  if (!currentRecomendado) {
    return (
      <NativeCard className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700">
          <Moon size={28} className="text-zinc-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Hoy no hay {titulo.toLowerCase()} programada 🏠</p>
          <p className="text-sm text-zinc-500 mt-1">Disfrutá tu tiempo o descansá en Córdoba.</p>
        </div>
      </NativeCard>
    );
  }

  return (
    <NativeCard className={`flex flex-col relative overflow-hidden transition-all duration-300 ${becUsado ? 'opacity-70 grayscale-[0.3]' : ''}`}>
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors ${becUsado ? 'bg-green-500/10' : 'bg-blue-500/10'}`} />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-zinc-400">
          <Icon size={18} />
          <h2 className="font-semibold text-sm uppercase tracking-wider">{titulo}</h2>
        </div>
        <button 
          onClick={toggleTomado}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            becUsado 
              ? 'bg-green-900/30 text-green-400 border-green-800/50 hover:bg-green-900/50' 
              : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <CheckCircle2 size={16} />
          {becUsado ? 'BEC Usado ✓' : 'Ya lo tomé'}
        </button>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-zinc-400 font-medium text-sm mb-1">{currentRecomendado.empresa}</p>
          {esVuelta ? (
            <>
              <div className="text-sm text-zinc-400 mb-1 mt-2">Sale de Terminal: {currentRecomendado.horaSalida}</div>
              <div className="text-sm text-blue-400 mb-1 font-medium">Pasa por tu parada (Ministerio):</div>
              <div className="text-6xl font-sans tracking-tight text-white leading-none">
                {horaReal}
              </div>
            </>
          ) : (
            <div className="text-6xl font-sans tracking-tight text-white leading-none">
              {currentRecomendado.horaSalida}
            </div>
          )}
        </div>
        
        {minutosFaltantes !== null && (
          <div className="flex flex-col items-end gap-2">
            <div className={`font-medium px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm ${
              minutosFaltantes > 0 && minutosFaltantes <= 60 
                ? 'bg-blue-900/40 text-blue-400 animate-pulse' 
                : minutosFaltantes < 0
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-zinc-800/80 text-zinc-300'
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
        <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-2xl mb-4 text-sm text-blue-200 flex gap-2 items-start">
          <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <span className="leading-snug">
            {currentRecomendado.notas.replace(/llegada estimada/i, `Llegada estimada a las ${calcularHoraLlegada(currentRecomendado.horaSalida, direction)}`)}
          </span>
        </div>
      )}
      
      <AntiSleepButton targetLat={targetLat} targetLng={targetLng} />

      {currentAlternativas.length > 0 && (
        <div className="border-t border-zinc-800/80 pt-4 mt-2">
          <button 
            onClick={() => setVerAlternativas(!verAlternativas)}
            className="flex items-center justify-between w-full text-sm text-zinc-400 hover:text-white transition-colors py-1"
          >
            <span>Ver siguientes {currentAlternativas.length} opciones</span>
            {verAlternativas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {verAlternativas && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="mt-4 flex flex-col gap-2 overflow-hidden"
              >
                {currentAlternativas.map((alt: RawScheduleEntry, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSwap(alt, idx)}
                    className="flex flex-col justify-center bg-zinc-800/40 border border-zinc-700/50 p-3 rounded-xl hover:bg-zinc-800/80 transition-colors text-left"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold text-white text-lg">{alt.horaSalida}</span>
                      <span className="text-zinc-400 text-sm font-medium">{alt.empresa}</span>
                    </div>
                    <span className="text-zinc-400 text-sm font-medium mt-1">
                      Hora estimada de Llegada: {calcularHoraLlegada(alt.horaSalida, direction)}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </NativeCard>
  );
}
