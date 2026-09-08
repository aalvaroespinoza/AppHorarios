"use client";

import { useEffect, useId, useRef } from 'react';
import { CalendarPlus, Clock, MapPin, X } from 'lucide-react';
import { getEdificioByAula, parseMateriaInfo } from '@/core/utils/edificio';
import { createClassCalendar } from '@/core/utils/classCalendar';

export interface MateriaDetail {
  nombre?: string; title?: string; rawText?: string; name?: string; titulo?: string;
  horaInicio?: string; timeStart?: string; startTime?: string;
  horaFin?: string; timeEnd?: string; endTime?: string;
  aula?: string; curso?: string;
  classBlocks?: { startTime: string; endTime: string; classroom?: string; day?: string }[];
}

export function MateriaDetailModal({ materia, eventDate, onClose }: { materia: MateriaDetail | null; eventDate?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (materia && element && !element.open) element.showModal();
    if (!materia && element?.open) element.close();
  }, [materia]);
  const info = parseMateriaInfo(materia?.nombre || materia?.title || materia?.rawText || materia?.name || materia?.titulo || '');
  const block = materia?.classBlocks?.[0];
  const start = materia?.horaInicio || materia?.timeStart || materia?.startTime || block?.startTime;
  const end = materia?.horaFin || materia?.timeEnd || materia?.endTime || block?.endTime;
  const aula = materia?.aula || block?.classroom || info.aula;
  const known = (value?: string) => Boolean(value && !['N/A', '-', 'Consultar'].includes(value));
  const classroomNumber = Number.parseInt(aula, 10);
  const building = classroomNumber > 0 ? getEdificioByAula(classroomNumber) : '';
  const calendarEvent = { title: info.nombre, date: eventDate || '', start: start || '', end: end || '', location: [known(aula) ? `Aula ${aula}` : '', known(building) ? building : ''].filter(Boolean).join(' · ') };
  let canDownloadCalendar = false;
  if (eventDate) {
    try { createClassCalendar(calendarEvent); canDownloadCalendar = true; } catch { /* Incomplete schedules cannot be exported. */ }
  }

  return (
    <dialog ref={dialog} aria-labelledby={titleId} onCancel={onClose} onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-[28px] border border-line bg-elevated p-0 text-ink shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm">
      {materia && <div className="p-6">
        <div className="mb-5 flex items-center justify-between gap-2">
          <p className="section-label">Tu clase</p>
          <button type="button" onClick={onClose} aria-label="Cerrar detalle" className="glass-button h-11 w-11 p-0"><X size={20} /></button>
        </div>
        <h2 id={titleId} className="text-2xl font-semibold tracking-tight">{info.nombre}</h2>
        <p className="mt-3 flex items-center gap-2 text-sm text-subtle"><Clock size={17} />{start && end ? `${start} a ${end}` : 'Horario sin asignar'}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted p-4"><dt className="text-sm text-subtle">Curso</dt><dd className="mt-1 text-lg font-semibold">{known(materia.curso || info.curso) ? materia.curso || info.curso : 'Sin asignar'}</dd></div>
          <div className="rounded-2xl bg-muted p-4"><dt className="text-sm text-subtle">Aula</dt><dd className="mt-1 text-lg font-semibold text-accent">{known(aula) ? aula : 'Sin asignar'}</dd></div>
          <div className="col-span-2 rounded-2xl bg-muted p-4"><dt className="text-sm text-subtle">Edificio</dt><dd className="mt-1 flex items-center gap-2 font-medium"><MapPin size={17} className="shrink-0 text-accent" />{known(building) ? building : 'Ubicación por confirmar'}</dd></div>
        </dl>
        {(materia.classBlocks?.length || 0) > 1 && <ul className="mt-4 space-y-2 text-sm text-subtle">{materia.classBlocks?.map((item, index) => <li key={index} className="capitalize">{item.day}: {item.startTime} a {item.endTime}{item.classroom ? ` · Aula ${item.classroom}` : ''}</li>)}</ul>}
        {eventDate && <div className="mt-6">
          <p className="text-sm text-subtle">Solo el {new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${eventDate}T12:00:00Z`))}. Sin repetición.</p>
          {canDownloadCalendar ? <>
            <form action="/api/calendar/class" method="post" className="mt-3">
              {Object.entries(calendarEvent).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
              <button type="submit" className="glass-primary w-full"><CalendarPlus size={18} /> Descargar evento (.ics)</button>
            </form>
            <p className="mt-3 text-xs leading-relaxed text-subtle">Después abrilo desde Descargas, Archivos o Mail e importalo en Calendario. Incluye solo esta clase.</p>
          </> : <p className="mt-3 text-sm text-subtle">Completá el horario de la materia para agregarla al calendario.</p>}
        </div>}
        <button type="button" onClick={onClose} className="glass-button mt-6 w-full">Listo</button>
      </div>}
    </dialog>
  );
}
