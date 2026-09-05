"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, Bus, RotateCcw, Moon } from 'lucide-react';
import NativeCard from '@/core/components/ui/NativeCard';
import { calcularHoraLlegada } from '@/core/utils/time';
import { addMinutes, OFFSET_PARADA_VUELTA_MIN } from '@/lib/engine/recommendation-engine';
import { useCountdown } from '@/hooks/useCountdown';
import { useLocalStorageState } from "@/core/hooks/useLocalStorageState";
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
  isToday = true,
  diaSeleccionado = 'lunes'
}: { 
  titulo: string;
  recomendacion: { recomendado: RawScheduleEntry | null; alternativas: RawScheduleEntry[] };
  icon?: React.ElementType;
  direction: 'ida' | 'vuelta';
  bec: ReturnType<typeof useBec>;
  isToday?: boolean;
  diaSeleccionado?: string;
}) {
  const [verAlternativas, setVerAlternativas] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Clave dinámica que incluye la fecha de hoy, el día seleccionado y el sentido (ida/vuelta)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const storageKey = `selected-bus-${todayDateStr}-${diaSeleccionado}-${direction}`;

  // Persistencia local-first del colectivo seleccionado manualmente
  const [overrideBus, setOverrideBus] = useLocalStorageState<RawScheduleEntry | null>(
    storageKey,
    null
  );

  const registroHoy = bec.getRegistroHoy();
  const becUsado = isToday && (direction === 'ida' ? registroHoy.idaUsado : registroHoy.vueltaUsado);

  // Priorizar el valor manual guardado si existe, de lo contrario usar el cálculo automático
  const isManualOverride = isClientMounted && overrideBus !== null;
  const currentRecomendado = isManualOverride ? overrideBus : recomendacion.recomendado;

  // Calcular todas las opciones disponibles excluyendo el actualmente activo
  const allAvailable = recomendacion.recomendado
    ? [recomendacion.recomendado, ...recomendacion.alternativas]
    : recomendacion.alternativas;

  const currentAlternativas = allAvailable.filter(
    (alt) => !currentRecomendado || alt.horaSalida !== currentRecomendado.horaSalida || alt.empresa !== currentRecomendado.empresa
  );

  const handleSelectAlternative = (alt: RawScheduleEntry) => {
    setOverrideBus(alt);
    setVerAlternativas(false);
  };

  const handleResetToAutomatic = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOverrideBus(null);
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
      <NativeCard className="flex flex-col items-center justify-center py-10 text-center gap-3 bg-zinc-900 border border-zinc-800 rounded-sm shadow-none">
        <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-center text-zinc-500">
          <Moon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            [SYS.SCHEDULE // INACTIVO]
          </p>
          <p className="text-sm font-bold text-zinc-100 mt-1">
            No hay {titulo.toLowerCase()} programada
          </p>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            STANDBY // DESCANSO
          </p>
        </div>
      </NativeCard>
    );
  }

  return (
    <NativeCard className={`flex flex-col relative overflow-hidden transition-all duration-200 rounded-sm border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-none ${becUsado ? 'opacity-80' : ''}`}>
      {/* Cabecera Técnica de Telemetría */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              SYS.DEP // {direction.toUpperCase()}
            </span>
            {isManualOverride && (
              <span className="text-[9px] font-mono font-bold text-safety-orange bg-safety-orange/10 px-1.5 py-0.5 rounded-sm border border-safety-orange/30 uppercase tracking-wider">
                MANUAL
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-sm flex items-center justify-center border ${esVuelta ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-safety-orange/40 bg-safety-orange/10 text-safety-orange'}`}>
              <Icon size={12} />
            </div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-100 font-mono">
              {titulo}
            </h2>
            <span className="text-[10px] font-mono font-semibold text-zinc-400 border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
              {currentRecomendado.empresa}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de Restablecer si hay selección manual */}
          {isManualOverride && (
            <button
              onClick={handleResetToAutomatic}
              className="flex items-center gap-1 text-[10px] font-mono font-semibold text-zinc-400 hover:text-safety-orange bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-sm hover:border-zinc-700 transition-colors active:translate-y-[0.5px]"
              title="Restablecer al colectivo automático recomendado"
            >
              <RotateCcw size={11} />
              <span>AUTO</span>
            </button>
          )}

          {/* Botón Mecánico BEC */}
          <motion.button 
            whileTap={TAP_ANIMATION}
            onClick={toggleTomado}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all border shadow-none ${
              becUsado 
                ? 'bg-acid-green/15 text-acid-green border-acid-green/60' 
                : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-none ${becUsado ? 'bg-acid-green' : 'bg-zinc-600'}`} />
            <span>{becUsado ? 'BEC: ON' : 'BEC: OFF'}</span>
          </motion.button>
        </div>
      </div>

      {/* Módulo LCD / Telemetría Principal */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-sm p-3.5 my-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
          {esVuelta ? 'PUNTO DE EMBARQUE // PARADA MINISTERIO' : 'SALIDA ORIGEN // DESPEÑADEROS'}
        </span>
        
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2.5">
          <div>
            {/* HORA GIGANTE EN MONOESPACIADO */}
            <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-zinc-100 leading-none py-0.5">
              {horaReal}
            </div>
            {esVuelta && (
              <span className="text-[10px] text-zinc-500 font-mono mt-1 block uppercase tracking-wider">
                ORIGEN TERMINAL CBA: <strong className="text-zinc-300 font-semibold">{currentRecomendado.horaSalida} HS</strong>
              </span>
            )}
          </div>
          
          {/* Status Badge Estilo Terminal */}
          {minutosFaltantes !== null && (
            <div className="self-start sm:self-end">
              {minutosFaltantes > 0 && minutosFaltantes <= 45 ? (
                <div className="border border-safety-orange bg-safety-orange/15 text-safety-orange font-mono text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-2 shadow-none animate-pulse">
                  <span className="w-2 h-2 bg-safety-orange rounded-none" />
                  <span>SALE EN {formatMinutosFaltantes(minutosFaltantes)}</span>
                </div>
              ) : minutosFaltantes === 0 ? (
                <div className="border border-safety-orange bg-safety-orange text-black font-mono text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-2 shadow-none animate-pulse">
                  <span className="w-2 h-2 bg-black rounded-none" />
                  <span>SALIENDO AHORA</span>
                </div>
              ) : minutosFaltantes < 0 ? (
                <div className="border border-zinc-800 bg-zinc-900 text-zinc-500 font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-none" />
                  <span>SERVICIO FINALIZADO</span>
                </div>
              ) : (
                <div className="border border-acid-green/50 bg-acid-green/10 text-acid-green font-mono text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm flex items-center gap-2 shadow-none">
                  <span className="w-2 h-2 bg-acid-green rounded-none" />
                  <span>SALE EN {formatMinutosFaltantes(minutosFaltantes)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Franja de Llegada Estimada */}
      <div className="border-t border-zinc-800/80 pt-2.5 mt-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] uppercase tracking-wider">
          <Clock size={12} className="text-zinc-400" />
          <span>LLEGADA ESTIMADA DESTINO:</span>
        </div>
        <span className="font-mono text-xs font-bold text-zinc-100 tracking-wider">
          {calcularHoraLlegada(currentRecomendado.horaSalida, direction)} HS
        </span>
      </div>

      {/* Opciones Alternativas Siguientes */}
      {currentAlternativas.length > 0 && (
        <div className="border-t border-zinc-800/80 pt-2.5 mt-2.5">
          <motion.button 
            whileTap={TAP_ANIMATION}
            onClick={() => setVerAlternativas(!verAlternativas)}
            className="flex items-center justify-between w-full text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors py-1 cursor-pointer select-none"
          >
            <span>[ + ] OPCIONES ALTERNATIVAS ({currentAlternativas.length})</span>
            {verAlternativas ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </motion.button>
          <AnimatePresence>
            {verAlternativas && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={SPRING_CONFIG}
                className="mt-2 flex flex-col gap-1.5 overflow-hidden"
              >
                {currentAlternativas.map((alt: RawScheduleEntry, idx: number) => (
                  <motion.button 
                    whileTap={TAP_ANIMATION}
                    key={idx} 
                    onClick={() => handleSelectAlternative(alt)}
                    className="flex justify-between items-center bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 p-2.5 rounded-sm transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-zinc-100 text-sm group-hover:text-safety-orange transition-colors">
                        {alt.horaSalida} HS
                      </span>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-medium">
                        {alt.empresa}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                      ETA: {calcularHoraLlegada(alt.horaSalida, direction)} HS
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
