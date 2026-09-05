"use client";

import { useState } from 'react';
import type { DayOfWeek } from '@/core/types/common';

import { SubjectList } from '@/features/schedule/SubjectList';
import { BusScheduleList } from '@/features/schedule/BusScheduleList';
import { determineScenario, findScenario } from '@/lib/engine';
import { getScheduleForDay } from '@/lib/services';
import { useSubjects } from '@/hooks/useSubjects';
import { rawScheduleEntries } from '@/data/schedules';
import { companies } from '@/data/companies';
import { formatDateLong } from '@/core/utils/date';

import { useEscenario } from '@/hooks/useEscenario';

interface DayViewProps {
  /** Fecha a mostrar. La lógica se computa a partir de ella. */
  date: Date;
}

/**
 * DayView — Server Component compartido
 *
 * Encapsula el pipeline completo para un día:
 *   date → escenario → materias → horarios → UI
 *
 * (Versión inicial funcional: sin recomendaciones)
 */
export function DayView({
  date,
}: DayViewProps) {
  const { cursaArquitectura } = useEscenario();
  const { subjects } = useSubjects();
  const [currentDate, setCurrentDate] = useState<Date>(date);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  /* ── 1. Fecha ─────────────────────────────────────────────── */
  const dateLabel = formatDateLong(currentDate);

  /* ── 2. Escenario + materias dinámicas ─────────────────────── */
  const scenarioId = determineScenario({ tuesdayHasArquitectura: cursaArquitectura, referenceDate: currentDate });
  const scenario = scenarioId ? findScenario(scenarioId) : null;
  const currentDow = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][currentDate.getDay()] as DayOfWeek;

  const activeSubjects = subjects.filter((s) => {
    if (currentDow === 'martes' && !cursaArquitectura && s.name.toLowerCase().includes('arquitectura')) {
      return false;
    }
    return s.classBlocks.some((b) => b.day.toLowerCase() === currentDow.toLowerCase());
  });

  /* ── 3. Horarios del día ──────────────────────────────────── */
  const busSchedule = getScheduleForDay(currentDow, rawScheduleEntries, Object.values(companies));

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div
      className="
        w-full max-w-md
        bg-zinc-900
        rounded-sm
        border border-zinc-800
        shadow-none
        overflow-visible
      "
    >
      {/* ── Encabezado: fecha limpia y DatePicker ── */}
      <div className="px-5 pt-5 pb-4">

        <div className="flex items-start justify-between gap-3 relative">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-0.5">
              SYS.DAY // TELEMETRÍA
            </span>
            <h2 className="text-2xl font-bold font-mono text-zinc-100 leading-snug capitalize flex items-center gap-2">
              {dateLabel.split(',')[0]}
              {scenarioId ? (
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest border border-acid-green/50 bg-acid-green/15 text-acid-green">
                  {scenario?.label}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest border border-zinc-800 bg-zinc-950 text-zinc-400">
                  Sin Cursada
                </span>
              )}
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5 capitalize">
              {dateLabel.split(',')[1]?.trim()}
            </p>
          </div>
          
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-zinc-950 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors border border-zinc-800 cursor-pointer shadow-none"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>CAMBIAR</span>
          </button>

          {showDatePicker && (
            <div className="absolute top-full right-0 mt-2 bg-zinc-950 border border-zinc-700 rounded-sm shadow-none z-50 overflow-hidden w-52 font-mono animate-in fade-in slide-in-from-top-1">
              {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const isSelected = d.toDateString() === currentDate.toDateString();
                return (
                  <button
                    key={offset}
                    onClick={() => { setCurrentDate(d); setShowDatePicker(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors capitalize border-b border-zinc-800/80 last:border-0 cursor-pointer ${
                      isSelected 
                        ? 'bg-zinc-900 text-safety-orange font-bold border-l-2 border-safety-orange' 
                        : 'hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    {offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : formatDateLong(d).split(',')[0]}
                    <span className="block text-[10px] text-zinc-500 mt-0.5 capitalize">{formatDateLong(d).split(',')[1]?.trim()}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Materias ──────────────────────────────────────────── */}
      <div className="border-t border-zinc-800" />
      <div className="px-5 py-4">
        <SubjectList subjects={activeSubjects} />
      </div>

      {/* ── Horarios de Colectivos (Ida/Vuelta) ───────────────── */}
      <div className="border-t border-zinc-800" />
      <div className="px-5 py-4">
        <BusScheduleList schedule={busSchedule} />
      </div>

    </div>
  );
}
