"use client";

import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Settings } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEscenario } from '@/hooks/useEscenario';
import { useTodaySchedule } from '@/hooks/useTodaySchedule';
import { getDiaActual } from '@/context/EscenarioContext';
import ContextualControls from '@/features/schedule/ContextualControls';
import { ClassTimeline } from '@/features/schedule/ClassTimeline';

const dayLabels: Record<string, string> = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo' };

export default function AgendaPage() {
  const { diaSeleccionado, setDiaSeleccionado } = useEscenario();
  const { materiasDelDia, isToday, horaActualHHMM, timeMounted } = useTodaySchedule();
  const reduced = useReducedMotion();
  const first = materiasDelDia[0];
  const end = materiasDelDia.reduce((latest, item) => item.horaFin > latest ? item.horaFin : latest, '');

  return (
    <main className="page-shell flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3 pt-4">
        <div><p className="section-label mb-1">Un día a la vez</p><h1 className="text-3xl font-semibold tracking-tight">Tu agenda</h1></div>
        <Link href="/configuracion" aria-label="Configuración" className="glass-button w-11 p-0"><Settings size={20} /></Link>
      </header>
      <ContextualControls />
      {!timeMounted ? <div className="glass-panel p-6 text-subtle" role="status">Preparando tu agenda…</div> : <>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{dayLabels[diaSeleccionado]}{isToday && <span className="ml-2 text-sm font-normal text-accent">Hoy</span>}</h2>
            <p className="mt-1 text-sm text-subtle">{first ? `${materiasDelDia.length} ${materiasDelDia.length === 1 ? 'clase' : 'clases'} · ${first.horaInicio} a ${end}` : 'Un día sin cursado'}</p>
          </div>
          {!isToday && <button type="button" className="glass-button text-sm" onClick={() => setDiaSeleccionado(getDiaActual())}><CalendarDays size={16} />Hoy</button>}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={diaSeleccionado} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .18 }}>
            <ClassTimeline selectedDay={diaSeleccionado} materiasDelDia={materiasDelDia} isToday={isToday} horaActualHHMM={horaActualHHMM} compact={false} allowCollapse={false} />
          </motion.div>
        </AnimatePresence>
        <Link href="/" className="flex min-h-14 items-center justify-between gap-3 border-t border-line py-4 text-sm font-medium text-accent">Organizar mis viajes<ArrowUpRight size={18} /></Link>
      </>}
    </main>
  );
}
