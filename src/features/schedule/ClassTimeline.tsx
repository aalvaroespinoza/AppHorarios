"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Bus, CheckCircle2, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import { parseMateriaInfo } from '@/core/utils/materiaParser';
import { getEdificioByAula } from '@/core/utils/edificio';
import { MateriaDetailModal } from '@/components/MateriaDetailModal';

export interface ClassItem {
  id?: string; nombre?: string; name?: string; title?: string; rawText?: string;
  horaInicio?: string; horaFin?: string; timeStart?: string; timeEnd?: string;
  curso?: string; aula?: string; color?: string;
}
export interface ClassTimelineProps {
  materiasDelDia?: ClassItem[]; classes?: ClassItem[]; isToday?: boolean;
  horaActualHHMM?: string; linePosition?: "none" | "before" | "inside" | "after";
  activeIndex?: number; compact?: boolean;
}
const dateKey = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Cordoba', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const nameOf = (item: ClassItem) => item.nombre || item.name || item.title || item.rawText || '';
const startOf = (item: ClassItem) => item.horaInicio || item.timeStart || '';
const endOf = (item: ClassItem) => item.horaFin || item.timeEnd || '';
const attendanceKey = (item: ClassItem, index: number) => item.id ? `${item.id}-${startOf(item)}` : `class-${index}`;

export function ClassTimeline({ materiasDelDia, classes, isToday, horaActualHHMM = '00:00', compact = true }: ClassTimelineProps) {
  const items = materiasDelDia || classes || [];
  const [selectedMateria, setSelectedMateria] = useState<ClassItem | null>(null);
  const [expanded, setExpanded] = useState(!compact);
  const [focusedItem, setFocusedItem] = useState<ClassItem | null>(null);
  const [attended, setAttended] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('lifeos_class_attendance') || '{}');
      if (stored._date === dateKey()) {
        const { _date: _storedDate, ...entries } = stored;
        setAttended(entries);
      }
    } catch { /* A missing or invalid previous record must not block the schedule. */ }
  }, []);
  const registerAttendance = (item: ClassItem, index: number) => {
    const next = { ...attended, [attendanceKey(item, index)]: true };
    try {
      localStorage.setItem('lifeos_class_attendance', JSON.stringify({ ...next, _date: dateKey() }));
      setAttended(next);
      setError('');
    } catch { setError('No se pudo guardar la asistencia. Probá de nuevo.'); }
  };
  const academic = items.filter((item) => !parseMateriaInfo(nameOf(item)).isViaje);
  const relevant = isToday ? academic.find((item) => endOf(item) > horaActualHHMM) : academic[0];
  const summary = selectedMateria || focusedItem || relevant;
  const displayed = expanded ? items : summary ? [summary] : [];
  const isCurrent = (item: ClassItem) => Boolean(isToday && startOf(item) <= horaActualHHMM && endOf(item) > horaActualHHMM);
  return <section id="seccion-cursado" className="glass-panel scroll-mt-24 p-5" aria-label="Cursado del día">
    <div className="mb-3 flex items-center gap-2 text-subtle">
      <BookOpen size={17} className="text-accent" />
      <h2 className="section-label">{expanded ? 'Tu cursado' : summary ? isCurrent(summary) ? 'Ahora en clase' : 'Próxima clase' : 'Tu cursado'}</h2>
    </div>
    {displayed.length === 0 && <p className="py-3 text-sm text-subtle">{items.length ? 'Terminaste las clases de este día.' : 'No hay clases para este día.'}</p>}
    <div className="space-y-3">
      {displayed.map((item) => {
        const index = items.indexOf(item);
        const info = parseMateriaInfo(nameOf(item));
        const classroom = item.aula || info.aula;
        const classroomNumber = Number.parseInt(classroom, 10);
        const building = classroomNumber > 0 ? getEdificioByAula(classroomNumber) : '';
        const registered = attended[attendanceKey(item, index)] || attended[`class-${index}`];
        return <article key={`${item.id || index}-${startOf(item)}`} className={expanded ? 'rounded-2xl border border-line bg-surface p-4' : ''}>
          {info.isViaje ? <div className="flex items-center gap-3 text-sm text-subtle"><Bus size={18} /><span>{info.nombre} · {startOf(item)} a {endOf(item)}</span></div> : <>
            <button type="button" onClick={() => setSelectedMateria(item)} onFocus={() => setFocusedItem(item)} onBlur={() => setFocusedItem(null)} className="flex min-h-11 w-full items-center gap-3 text-left">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold leading-snug text-ink">{info.nombre}</p>
                <p className="mt-1 text-sm font-medium tabular-nums text-subtle">{startOf(item) || 'Sin horario'}{endOf(item) ? ` a ${endOf(item)}` : ''}{isCurrent(item) ? ' · En curso' : ''}</p>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-accent"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{classroom && !['N/A', '-', 'Consultar'].includes(classroom) ? `Aula ${classroom}` : 'Aula sin asignar'}{building && !['N/A', '-'].includes(building) ? ` · ${building}` : ''}</span></p>
              </div><ChevronRight size={18} className="shrink-0 text-subtle" />
            </button>
            {expanded && isToday && <button type="button" onClick={() => registerAttendance(item, index)} disabled={Boolean(registered)} className="glass-button mt-3 w-full text-sm">{registered ? <><CheckCircle2 size={16} /> Asistencia registrada</> : 'Registrar asistencia'}</button>}
          </>}
        </article>;
      })}
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
    {items.length > 0 && <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 text-sm font-medium text-accent">{expanded ? 'Ver resumen' : 'Ver cursado del día'}<ChevronDown size={16} className={expanded ? 'rotate-180' : ''} /></button>}
    <MateriaDetailModal materia={selectedMateria} onClose={() => setSelectedMateria(null)} />
  </section>;
}
