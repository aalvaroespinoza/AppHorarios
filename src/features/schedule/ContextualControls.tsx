"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEscenario } from '@/hooks/useEscenario';
import { getDiaActual } from '@/context/EscenarioContext';
import { DayOfWeek } from '@/core/types/common';
import { Building2, Bed } from 'lucide-react';
import { SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

const DIAS_SEMANA: { id: DayOfWeek; label: string }[] = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' },
];

export default function ContextualControls() {
  const {
    diaSeleccionado, 
    setDiaSeleccionado,
    cursaArquitectura,
    setCursaArquitectura,
    duermeEnCordoba,
    setDuermeEnCordoba,
    isMounted
  } = useEscenario();

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Memoize today's date so it only calculates once per render
  const todayId = useMemo(() => getDiaActual(), []);

  // Auto-centrar el día seleccionado
  React.useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const activeBtn = scrollContainerRef.current.querySelector('[data-active="true"]') as HTMLButtonElement;
    if (activeBtn) {
      const container = scrollContainerRef.current;
      const scrollLeft = activeBtn.offsetLeft - (container.clientWidth / 2) + (activeBtn.clientWidth / 2);
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [diaSeleccionado, isMounted]);

  // Prevenir desajustes de hidratación en Server Side Rendering
  if (!isMounted) {
    return <div className="animate-pulse h-16 bg-zinc-900 border border-zinc-800 rounded-sm" />;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Selector Mecánico de Días */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 flex space-x-1.5 items-center"
      >
        {DIAS_SEMANA.map((dia) => {
          const isSelected = diaSeleccionado === dia.id;
          const isToday = todayId === dia.id;
          return (
            <button
              key={dia.id}
              data-active={isSelected}
              onClick={() => setDiaSeleccionado(dia.id)}
              className={`whitespace-nowrap transition-colors duration-150 relative rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-wider border select-none cursor-pointer ${
                isSelected 
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-bold' 
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
              } ${
                isToday 
                  ? '!border-acid-green/60 !text-acid-green font-bold' 
                  : ''
              }`}
            >
              {dia.label} {isToday && "*"}
            </button>
          );
        })}
      </div>

      {/* Controles Dinámicos de Escenario */}
      <AnimatePresence mode="popLayout">
        {diaSeleccionado === 'martes' && (
          <motion.button 
            key="martes-btn"
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={SPRING_CONFIG}
            whileTap={TAP_ANIMATION}
            onClick={() => setCursaArquitectura(!cursaArquitectura)}
            className={`w-full text-left p-3.5 rounded-sm border transition-colors shadow-none cursor-pointer ${
              cursaArquitectura 
                ? 'bg-safety-orange/10 border-safety-orange/60' 
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-sm border ${cursaArquitectura ? 'bg-safety-orange text-black border-safety-orange font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                  <Building2 size={16} />
                </div>
                <div>
                  <span className={`font-mono font-bold text-xs uppercase tracking-wide block leading-tight ${cursaArquitectura ? 'text-safety-orange' : 'text-zinc-200'}`}>
                    CURSAR ARQUITECTURA
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block leading-tight mt-0.5 uppercase tracking-wider">
                    {cursaArquitectura ? '[ACTIVO // ITINERARIO MODIFICADO]' : '[INACTIVO // TOCAR PARA ACTIVAR]'}
                  </span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-none border flex items-center justify-center font-mono text-[10px] font-bold ${
                cursaArquitectura ? 'bg-safety-orange border-safety-orange text-black' : 'border-zinc-700 bg-zinc-950 text-transparent'
              }`}>
                {cursaArquitectura ? '✓' : ''}
              </div>
            </div>
          </motion.button>
        )}

        {diaSeleccionado === 'viernes' && (
          <motion.button 
            key="viernes-btn"
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={SPRING_CONFIG}
            whileTap={TAP_ANIMATION}
            onClick={() => setDuermeEnCordoba(!duermeEnCordoba)}
            className={`w-full text-left p-3.5 rounded-sm border transition-colors shadow-none cursor-pointer ${
              duermeEnCordoba 
                ? 'bg-acid-green/10 border-acid-green/60' 
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-sm border ${duermeEnCordoba ? 'bg-acid-green text-black border-acid-green font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                  <Bed size={16} />
                </div>
                <div>
                  <span className={`font-mono font-bold text-xs uppercase tracking-wide block leading-tight ${duermeEnCordoba ? 'text-acid-green' : 'text-zinc-200'}`}>
                    DORMIR EN CÓRDOBA
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block leading-tight mt-0.5 uppercase tracking-wider">
                    {duermeEnCordoba ? '[ACTIVO // SE CANCELAN REGRESOS]' : '[INACTIVO // TOCAR SI TE QUEDÁS]'}
                  </span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-none border flex items-center justify-center font-mono text-[10px] font-bold ${
                duermeEnCordoba ? 'bg-acid-green border-acid-green text-black' : 'border-zinc-700 bg-zinc-950 text-transparent'
              }`}>
                {duermeEnCordoba ? '✓' : ''}
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
