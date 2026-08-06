"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Plus, Clock, Trash2, Calendar as CalendarIcon, Timer, DollarSign, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useAgenda } from '@/hooks/useAgenda';
import { useEscenario } from '@/hooks/useEscenario';
import { useFinanzas } from '@/hooks/useFinanzas';
import type { DayOfWeek } from '@/types/common';
import { MiniCalendar } from '@/features/academia/MiniCalendar';
import { AgendaView } from '@/features/academia/AgendaView';
import { FloatingActions } from '@/features/academia/FloatingActions';

const DIAS: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function getDiaActualStr(): DayOfWeek {
  const jsDay = new Date().getDay();
  const map: Record<number, DayOfWeek> = {
    1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado', 0: 'lunes'
  };
  return map[jsDay] || 'lunes';
}

export default function AcademiaPage() {
  const { diaSeleccionado, setDiaSeleccionado, isMounted } = useEscenario();
  const agenda = useAgenda();
  const finanzas = useFinanzas();

  const [diaActual, setDiaActual] = useState<DayOfWeek>('lunes');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDiaActual(getDiaActualStr());
  }, []);

  useEffect(() => {
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

  if (!isMounted || !agenda.isMounted || !finanzas.isMounted) return null;

  const agendaDelDia = agenda.obtenerAgendaDelDia(diaSeleccionado);
  const esHoy = diaSeleccionado === diaActual;



  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 pb-28 relative min-h-screen"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <FloatingActions finanzas={finanzas} />

      {/* Header */}
      <header className="flex flex-col gap-2 mt-2">
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-[11px] font-black tracking-[0.25em] uppercase drop-shadow-sm">
          CENTRO DE CONTROL
        </h2>
        <h1 className="text-3xl font-bold tracking-tight text-white pr-32 leading-tight">
          Planner 📚
        </h1>
      </header>

      {/* Day Selector */}
      <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mt-2">
        {DIAS.map((dia) => {
          const isHoyReal = dia === diaActual;
          return (
            <button
              key={dia}
              data-active={diaSeleccionado === dia}
              onClick={() => setDiaSeleccionado(dia)}
              className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                diaSeleccionado === dia 
                  ? 'bg-zinc-100 text-zinc-900 shadow-md' 
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white border border-zinc-700/50'
              } ${isHoyReal && diaSeleccionado !== dia ? 'border-blue-500/50' : ''}`}
            >
              {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
              {isHoyReal && (
                <span className={`absolute top-0 right-0 -mt-0.5 -mr-0.5 w-2.5 h-2.5 rounded-full ${diaSeleccionado === dia ? 'bg-blue-600' : 'bg-blue-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      <AgendaView 
        diaSeleccionado={diaSeleccionado}
        esHoy={esHoy}
        agenda={agenda}
        agendaDelDia={agendaDelDia}
      />

      {/* Mini Calendar Section */}
      <MiniCalendar />

    </motion.div>
  );
}
