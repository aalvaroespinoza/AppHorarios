"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Calendar } from 'lucide-react';
import { useAgenda } from '@/hooks/useAgenda';
import { useEscenario } from '@/hooks/useEscenario';
import { useFinanzas } from '@/hooks/useFinanzas';
import type { DayOfWeek } from '@/core/types/common';
import { MiniCalendar } from '@/features/academia/MiniCalendar';
import { AgendaView } from '@/features/academia/AgendaView';
import { PAGE_TRANSITION } from '@/lib/animations';

// Helper para calcular el lunes de la semana actual o con offset
const getMondayOfOffset = (offset: number) => {
  const dt = new Date();
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7);
  return new Date(dt.setDate(diff));
};

export default function AcademiaPage() {
  const { diaSeleccionado, setDiaSeleccionado, isMounted: isEscMounted } = useEscenario();
  const agenda = useAgenda();
  const finanzas = useFinanzas();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDateISO, setSelectedDateISO] = useState<string>('');
  const [todayISO, setTodayISO] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    setTodayISO(iso);
    if (!selectedDateISO) setSelectedDateISO(iso);
  }, [selectedDateISO]);

  const isMounted = isEscMounted && agenda.isMounted && finanzas.isMounted && todayISO !== '';

  const handleDaySelect = (iso: string, dayName: DayOfWeek) => {
    setSelectedDateISO(iso);
    setDiaSeleccionado(dayName);
  };

  const handleResetWeek = () => {
    setWeekOffset(0);
    setSelectedDateISO(todayISO);
    const day = new Date().getDay();
    const map: Record<number, DayOfWeek> = { 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado', 0: 'domingo' };
    setDiaSeleccionado(map[day] || 'lunes');
  };

  // Generar array de la semana
  const weekMonday = getMondayOfOffset(weekOffset);
  const currentWeekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekMonday);
    d.setDate(weekMonday.getDate() + i);
    const dayNameMap: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    
    return {
      dateISO: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayName: dayNameMap[i],
      dayNumber: d.getDate(),
      monthNumber: d.getMonth() + 1,
      isToday: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === todayISO
    };
  });

  const monthName = weekMonday.toLocaleString('es-AR', { month: 'long' });
  const yearStr = weekMonday.getFullYear();

  const agendaDelDia = isMounted ? agenda.obtenerAgendaDelDia(selectedDateISO) : [];
  const esHoy = selectedDateISO === todayISO;

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-5 relative min-h-[100dvh] pb-28"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      {/* Header con botón Hoy compacto e interactivo */}
      <header className="flex items-center justify-between mt-1">
        <div className="flex flex-col">
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 text-[11px] font-black tracking-[0.25em] uppercase drop-shadow-sm">
            PLANNER & CURSADO
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Agenda 📚
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!esHoy && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 8 }}
              whileTap={{ scale: 0.93 }}
              onClick={handleResetWeek}
              className="flex items-center gap-1 text-xs font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2.5 py-1.5 rounded-full hover:bg-violet-500/25 transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)] active:scale-95 shrink-0"
              title="Volver a la fecha de hoy"
            >
              <RotateCcw size={11} className="text-violet-400" />
              <span>Hoy</span>
            </motion.button>
          )}
        </div>
      </header>

      {/* Week Navigator */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-neutral-400 px-1">
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(o => o - 1)} className="p-1 hover:bg-neutral-800 rounded-lg transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-xs font-bold capitalize tracking-wide text-neutral-200">
              {monthName} {yearStr}
            </h3>
            <button onClick={() => setWeekOffset(o => o + 1)} className="p-1 hover:bg-neutral-800 rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          {weekOffset !== 0 && (
            <button onClick={handleResetWeek} className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
              ESTA SEMANA
            </button>
          )}
        </div>

        {/* Day Selector */}
        <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {currentWeekDates.map((dayData) => {
            const isSelected = selectedDateISO === dayData.dateISO;
            return (
              <button
                key={dayData.dateISO}
                data-active={isSelected}
                onClick={() => handleDaySelect(dayData.dateISO, dayData.dayName)}
                className={`flex flex-col items-center justify-center min-w-[48px] py-2 rounded-2xl transition-all ${
                  isSelected 
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' 
                    : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-800'
                } ${dayData.isToday && !isSelected ? 'border-violet-500/50 text-violet-300' : ''}`}
              >
                <span className="text-[10px] font-bold uppercase mb-0.5">{dayData.dayName.slice(0, 3)}</span>
                <span className="text-base font-black leading-none">{dayData.dayNumber}</span>
                {dayData.isToday && (
                  <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-violet-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AgendaView 
        fechaSeleccionada={selectedDateISO}
        diaNombre={diaSeleccionado}
        esHoy={esHoy}
        agenda={agenda}
        agendaDelDia={agendaDelDia}
      />

      {/* Mini Calendar Section */}
      <MiniCalendar />

    </motion.div>
  );
}
