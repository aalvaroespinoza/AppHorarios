"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAgenda } from '@/hooks/useAgenda';
import { useEscenario } from '@/hooks/useEscenario';
import { useFinanzas } from '@/hooks/useFinanzas';
import type { DayOfWeek } from '@/core/types/common';
import { MiniCalendar } from '@/features/academia/MiniCalendar';
import { AgendaView } from '@/features/academia/AgendaView';
import { PAGE_TRANSITION } from '@/lib/animations';

// Helper to get monday of current or offset week
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

  // Generate current week array
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

  if (!isMounted) return null;

  const agendaDelDia = agenda.obtenerAgendaDelDia(selectedDateISO);
  const esHoy = selectedDateISO === todayISO;

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 relative min-h-[100dvh]"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >


      {/* Header */}
      <header className="flex flex-col gap-2 mt-2">
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-[11px] font-black tracking-[0.25em] uppercase drop-shadow-sm">
          CENTRO DE CONTROL
        </h2>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white pr-32 leading-tight">
          Planner 📚
        </h1>
      </header>

      {/* Week Navigator */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 px-1">
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(o => o - 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg">
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-sm font-semibold capitalize tracking-wide text-gray-700 dark:text-zinc-300">
              {monthName} {yearStr}
            </h3>
            <button onClick={() => setWeekOffset(o => o + 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg">
              <ChevronRight size={18} />
            </button>
          </div>
          {weekOffset !== 0 && (
            <button onClick={handleResetWeek} className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
              ESTA SEMANA
            </button>
          )}
        </div>

        {/* Day Selector */}
        <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {currentWeekDates.map((dayData) => {
            const isSelected = selectedDateISO === dayData.dateISO;
            return (
              <button
                key={dayData.dateISO}
                data-active={isSelected}
                onClick={() => handleDaySelect(dayData.dateISO, dayData.dayName)}
                className={`flex flex-col items-center justify-center min-w-[50px] py-2 rounded-2xl transition-all ${
                  isSelected 
                    ? 'bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' 
                    : 'bg-gray-100 dark:bg-zinc-800/60 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-zinc-700/50'
                } ${dayData.isToday && !isSelected ? 'border-blue-500/50' : ''}`}
              >
                <span className="text-[10px] font-bold uppercase mb-0.5">{dayData.dayName.slice(0, 3)}</span>
                <span className="text-lg font-black leading-none">{dayData.dayNumber}</span>
                {dayData.isToday && (
                  <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-blue-600' : 'bg-blue-400'}`} />
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
