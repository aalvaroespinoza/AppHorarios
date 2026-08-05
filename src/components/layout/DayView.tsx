"use client";

import { useState } from 'react';

import { ScenarioTag } from '@/components/ui/ScenarioTag';
import { SubjectList } from '@/features/schedule/SubjectList';
import { BusScheduleList } from '@/features/schedule/BusScheduleList';
import { determineScenario, findScenario } from '@/lib/engine';
import { getScheduleForDay } from '@/lib/services';
import { subjectData } from '@/data/subjects';
import { rawScheduleEntries } from '@/data/schedules';
import { companies } from '@/data/companies';
import { formatDateLong } from '@/utils/date';

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
  const { cursaArquitectura, isMounted } = useEscenario();
  const [currentDate, setCurrentDate] = useState<Date>(date);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  /* ── 1. Fecha ─────────────────────────────────────────────── */
  const dateLabel = formatDateLong(currentDate);

  /* ── 2. Escenario + materias ──────────────────────────────── */
  const scenarioId = determineScenario({ tuesdayHasArquitectura: cursaArquitectura, referenceDate: currentDate });
  const scenario = scenarioId ? findScenario(scenarioId) : null;

  const activeSubjects = scenario
    ? subjectData.subjects.filter((s) =>
        scenario.activeSubjectIds.includes(s.id),
      )
    : [];

  /* ── 3. Horarios del día ──────────────────────────────────── */
  const currentDow = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][currentDate.getDay()] as DayOfWeek;
  const busSchedule = getScheduleForDay(currentDow, rawScheduleEntries, Object.values(companies));

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div
      className="
        w-full max-w-md
        bg-[var(--color-surface)]
        rounded-2xl
        border border-[var(--color-border)]
        shadow-sm
        overflow-visible
      "
    >
      {/* ── Encabezado: fecha limpia y DatePicker ── */}
      <div className="px-5 pt-5 pb-4">

        <div className="flex items-start justify-between gap-3 relative">
          <div>
            <h2 className="text-[24px] font-bold text-[var(--color-text-primary)] leading-snug capitalize flex items-center gap-2">
              {dateLabel.split(',')[0]}
              {scenarioId ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {scenario?.label}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Sin Cursada
                </span>
              )}
            </h2>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 capitalize">
              {dateLabel.split(',')[1]?.trim()}
            </p>
          </div>
          
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors border border-blue-200/50 dark:border-blue-900/50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Cambiar</span>
          </button>

          {showDatePicker && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden w-48 animate-in fade-in slide-in-from-top-2">
              {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const isSelected = d.toDateString() === currentDate.toDateString();
                return (
                  <button
                    key={offset}
                    onClick={() => { setCurrentDate(d); setShowDatePicker(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors capitalize border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                  >
                    {offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : formatDateLong(d).split(',')[0]}
                    <span className="block text-[11px] text-zinc-400 mt-0.5 capitalize">{formatDateLong(d).split(',')[1]?.trim()}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Materias ──────────────────────────────────────────── */}
      <div className="border-t border-[var(--color-border)]" />
      <div className="px-5 py-4">
        <SubjectList subjects={activeSubjects} />
      </div>

      {/* ── Horarios de Colectivos (Ida/Vuelta) ───────────────── */}
      <div className="border-t border-[var(--color-border)]" />
      <div className="px-5 py-4">
        <BusScheduleList schedule={busSchedule} />
      </div>

    </div>
  );
}
