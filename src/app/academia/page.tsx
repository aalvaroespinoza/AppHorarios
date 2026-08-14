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
import { Button } from '@/components/ui/button';
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

  if (!agenda.isMounted || !isEscMounted) {
    return <div className="min-h-[100dvh] bg-[#0a0a0c]" />;
  }

  // Generar los 7 días de la semana actual según el offset
  const monday = getMondayOfOffset(weekOffset);
  const dayNamesShort = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
  const fullDayMap: Record<number, DayOfWeek> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };

  const currentWeekDates = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateISO = `${yyyy}-${mm}-${dd}`;

    return {
      date: d,
      dateISO,
      dayNum: d.getDate(),
      dayNameShort: dayNamesShort[index],
      dayOfWeekName: fullDayMap[d.getDay()],
      isToday: dateISO === todayISO
    };
  });

  const handleSelectDay = (dateISO: string, dayName: DayOfWeek) => {
    setSelectedDateISO(dateISO);
    setDiaSeleccionado(dayName);
  };

  const handleResetWeek = () => {
    setWeekOffset(0);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    setSelectedDateISO(iso);
    setDiaSeleccionado(fullDayMap[today.getDay()]);
  };

  const currentDayData = currentWeekDates.find(d => d.dateISO === selectedDateISO) || currentWeekDates[0];
  const diaNombreCapitalizado = currentDayData.dayOfWeekName.charAt(0).toUpperCase() + currentDayData.dayOfWeekName.slice(1);
  const esHoy = selectedDateISO === todayISO;

  const agendaDelDia = agenda.obtenerAgendaDelDia(currentDayData.dayOfWeekName, selectedDateISO);

  const monthName = monday.toLocaleDateString('es-AR', { month: 'long' });
  const yearStr = monday.getFullYear();

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-5 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-24"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* Header con título */}
      <header className="flex items-center justify-between mt-1">
        <div className="flex flex-col">
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 text-[11px] font-black tracking-[0.25em] uppercase drop-shadow-sm">
            PLANNER & CURSADO
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Agenda 📚
          </h1>
        </div>
      </header>

      {/* Week Navigator con Botón Hoy */}
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

          <div className="flex items-center gap-2">
            {!esHoy && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetWeek} 
                className="text-xs font-bold border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-violet-300 h-7 px-2.5 rounded-lg"
              >
                Hoy
              </Button>
            )}
            {weekOffset !== 0 && (
              <button onClick={handleResetWeek} className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
                ESTA SEMANA
              </button>
            )}
          </div>
        </div>

        {/* Day Selector */}
        <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {currentWeekDates.map((dayData) => {
            const isSelected = selectedDateISO === dayData.dateISO;
            return (
              <button
                key={dayData.dateISO}
                onClick={() => handleSelectDay(dayData.dateISO, dayData.dayOfWeekName)}
                className={`flex-1 min-w-[46px] py-2 px-1 rounded-2xl flex flex-col items-center gap-1 transition-all text-xs ${
                  isSelected
                    ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-600/30 scale-105'
                    : dayData.isToday
                    ? 'bg-violet-950/40 border border-violet-500/40 text-violet-300 font-semibold'
                    : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800/80 hover:bg-neutral-800/80'
                }`}
              >
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                  {dayData.dayNameShort}
                </span>
                <span className="text-sm font-extrabold">
                  {dayData.dayNum}
                </span>
                {dayData.isToday && (
                  <span className="w-1 h-1 rounded-full bg-violet-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini Calendario de Exámenes y Fechas Críticas */}
      <MiniCalendar fechaSeleccionadaISO={selectedDateISO} />

      {/* Grid de la Agenda Diaria con Timeline */}
      <AgendaView
        fechaSeleccionada={selectedDateISO}
        diaNombre={diaNombreCapitalizado}
        esHoy={esHoy}
        agenda={agenda}
        agendaDelDia={agendaDelDia}
      />
    </motion.div>
  );
}
