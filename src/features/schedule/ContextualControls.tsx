"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEscenario } from '@/hooks/useEscenario';
import NativeCard from '@/components/ui/NativeCard';
import NativeSwitch from '@/components/ui/NativeSwitch';
import { DayOfWeek } from '@/types/common';
import { Building2, Bed } from 'lucide-react';

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
    return <div className="animate-pulse h-24 bg-zinc-900/50 rounded-xl" />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 
        Añadimos un bloque de estilos en línea en caso de que la clase
        "no-scrollbar" no esté configurada previamente en Tailwind/globals.css
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* 1. Carrusel de Días */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 flex space-x-2 items-center"
      >
        {DIAS_SEMANA.map((dia) => {
          const isSelected = diaSeleccionado === dia.id;
          return (
            <button
              key={dia.id}
              data-active={isSelected}
              onClick={() => setDiaSeleccionado(dia.id)}
              className={`whitespace-nowrap transition-all duration-200 ${
                isSelected 
                  ? 'bg-zinc-800 text-white font-semibold rounded-full px-4 py-2' 
                  : 'text-zinc-500 font-medium rounded-full px-4 py-2 hover:bg-zinc-800/40'
              }`}
            >
              {dia.label}
            </button>
          );
        })}
      </div>

      {/* Controles Dinámicos (solo martes o viernes) */}
      <AnimatePresence mode="popLayout">
        {diaSeleccionado === 'martes' && (
          <motion.button 
            key="martes-btn"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
            onClick={() => setCursaArquitectura(!cursaArquitectura)}
            className={`w-full text-left p-4 mt-2 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
              cursaArquitectura 
                ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                : 'bg-[var(--color-surface)] border-[var(--color-border)]'
            }`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl transition-opacity duration-500 ${cursaArquitectura ? 'opacity-100' : 'opacity-0'}`} />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors duration-300 ${cursaArquitectura ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-zinc-800/50 dark:bg-zinc-800 text-[var(--color-text-secondary)]'}`}>
                  <Building2 size={20} />
                </div>
                <div>
                  <span className={`font-semibold text-[16px] block leading-tight transition-colors duration-300 ${cursaArquitectura ? 'text-orange-900 dark:text-orange-50' : 'text-[var(--color-text-primary)]'}`}>
                    Cursar Arquitectura
                  </span>
                  <span className={`text-[13px] block leading-tight mt-0.5 transition-colors duration-300 ${cursaArquitectura ? 'text-orange-700 dark:text-orange-200/70' : 'text-[var(--color-text-secondary)]'}`}>
                    {cursaArquitectura ? 'Agregado al itinerario de hoy' : 'Tocar para cursar'}
                  </span>
                </div>
              </div>
              <motion.div 
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                cursaArquitectura ? 'bg-orange-500 border-orange-500' : 'border-zinc-300 dark:border-zinc-600'
              }`}>
                <AnimatePresence>
                  {cursaArquitectura && (
                    <motion.svg 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.button>
        )}

        {diaSeleccionado === 'viernes' && (
          <motion.button 
            key="viernes-btn"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
            onClick={() => setDuermeEnCordoba(!duermeEnCordoba)}
            className={`w-full text-left p-4 mt-2 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
              duermeEnCordoba 
                ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                : 'bg-[var(--color-surface)] border-[var(--color-border)]'
            }`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl transition-opacity duration-500 ${duermeEnCordoba ? 'opacity-100' : 'opacity-0'}`} />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors duration-300 ${duermeEnCordoba ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-zinc-800/50 dark:bg-zinc-800 text-[var(--color-text-secondary)]'}`}>
                  <Bed size={20} />
                </div>
                <div>
                  <span className={`font-semibold text-[16px] block leading-tight transition-colors duration-300 ${duermeEnCordoba ? 'text-indigo-900 dark:text-indigo-50' : 'text-[var(--color-text-primary)]'}`}>
                    Dormir en Córdoba
                  </span>
                  <span className={`text-[13px] block leading-tight mt-0.5 transition-colors duration-300 ${duermeEnCordoba ? 'text-indigo-700 dark:text-indigo-200/70' : 'text-[var(--color-text-secondary)]'}`}>
                    {duermeEnCordoba ? 'Se cancelan regresos de hoy' : 'Tocar si te quedás'}
                  </span>
                </div>
              </div>
              <motion.div 
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                duermeEnCordoba ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-300 dark:border-zinc-600'
              }`}>
                <AnimatePresence>
                  {duermeEnCordoba && (
                    <motion.svg 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
