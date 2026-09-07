"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Pencil, Trash2, Clock, MapPin, RotateCcw, BookOpen, Check, X, Settings2 } from 'lucide-react';
import { useSubjects, SubjectFormData, subjectToFormData } from '@/hooks/useSubjects';
import { Subject } from '@/types/subject';
import { DayOfWeek } from '@/core/types/common';
import { parseMateriaInfo, getEdificioByAula } from '@/core/utils/edificio';

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'lunes', label: 'Lunes' }, { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' }, { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' }, { value: 'sabado', label: 'Sábado' },
];
const INITIAL: SubjectFormData = { nombre: '', dia: 'lunes', horaInicio: '08:00', horaFin: '11:10', curso: '', aula: '' };
const inputClass = 'mt-1.5 min-h-11 w-full min-w-0 rounded-2xl border border-line bg-muted px-3 py-2 text-base text-ink';
const dialogClass = 'm-auto w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto rounded-[28px] border border-line bg-elevated p-5 text-ink shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm';

export default function GestorMateriasPage() {
  const { subjects, loading, isMounted, addSubject, updateSubject, deleteSubject, resetToDefaults } = useSubjects();
  const [filter, setFilter] = useState<string>('todos');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState<SubjectFormData>(INITIAL);
  const [pendingDelete, setPendingDelete] = useState<Subject | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const editorDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && !editorDialog.current?.open) editorDialog.current?.showModal();
    if (!open && editorDialog.current?.open) editorDialog.current.close();
  }, [open]);
  useEffect(() => {
    if (pendingDelete && !deleteDialog.current?.open) deleteDialog.current?.showModal();
    if (!pendingDelete && deleteDialog.current?.open) deleteDialog.current.close();
  }, [pendingDelete]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const startEditor = (subject?: Subject) => {
    setEditing(subject || null);
    setForm(subject ? subjectToFormData(subject) : { ...INITIAL, dia: (filter === 'todos' ? 'lunes' : filter) as DayOfWeek });
    setError('');
    setOpen(true);
  };
  const closeEditor = () => { if (!busy) setOpen(false); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!form.nombre.trim()) { setError('Escribí el nombre de la materia.'); return; }
    if (form.horaFin <= form.horaInicio) { setError('La hora de fin debe ser posterior al inicio.'); return; }
    setBusy(true);
    setError('');
    try {
      if (editing) await updateSubject(editing.id, form);
      else await addSubject(form);
      setOpen(false);
      setToast(editing ? 'Materia actualizada' : 'Materia agregada');
    } catch { setError('No se pudo guardar la materia. Tus cambios siguen en el formulario.'); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!pendingDelete || busy) return;
    setBusy(true);
    setError('');
    try { await deleteSubject(pendingDelete.id); setPendingDelete(null); setToast('Materia eliminada'); }
    catch { setError('No se pudo eliminar. Probá de nuevo.'); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    if (!window.confirm('¿Restablecer las materias iniciales? Se reemplazarán tus materias y cambios personalizados.')) return;
    setBusy(true);
    try { await resetToDefaults(); setToast('Materias iniciales restauradas'); setError(''); }
    catch { setError('No se pudieron restablecer las materias.'); }
    finally { setBusy(false); }
  };
  const filtered = subjects.filter((subject) => filter === 'todos' || subject.classBlocks.some((block) => block.day === filter));
  const aulaNumber = Number.parseInt(form.aula, 10);
  const building = Number.isFinite(aulaNumber) && aulaNumber > 0 ? getEdificioByAula(aulaNumber) : '';

  if (!isMounted || loading) return <main className="page-shell" aria-busy="true"><p className="text-subtle">Cargando tus materias…</p></main>;

  return <main className="page-shell text-ink">
    {toast && <div role="status" className="glass-toolbar fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-2xl p-4 text-sm font-medium text-ink shadow-lg"><Check size={18} className="text-success" />{toast}</div>}
    <header className="mb-6 flex items-center justify-between gap-3">
      <div><p className="section-label">Todo a mano</p><h1 className="text-3xl font-semibold tracking-tight">Tus aulas</h1></div>
      <Link href="/configuracion" aria-label="Configuración" className="glass-button h-11 w-11 p-0"><Settings2 size={21} /></Link>
    </header>
    <div className="mb-5 flex items-center justify-between gap-3">
      <p className="text-sm text-subtle">{subjects.length} {subjects.length === 1 ? 'materia en tu semana' : 'materias en tu semana'}</p>
      <button type="button" onClick={() => startEditor()} className="glass-primary shrink-0 px-4"><Plus size={18} />Nueva</button>
    </div>
    <div role="group" aria-label="Filtrar materias por día" className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2">
      {[{ value: 'todos', label: 'Todos' }, ...DAYS].map(({ value, label }) => <button type="button" key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={`glass-pill min-h-11 shrink-0 border px-4 text-sm font-medium ${filter === value ? 'aurora-border border-accent bg-accent/10 text-accent' : 'border-line bg-surface text-subtle'}`}>{label}</button>)}
    </div>
    {error && !open && !pendingDelete && <p role="alert" className="mb-4 text-sm text-danger">{error}</p>}
    {filtered.length === 0 ? <div className="glass-panel p-8 text-center"><BookOpen size={30} className="mx-auto mb-3 text-accent" /><h2 className="text-lg font-semibold">Un poco de tiempo libre</h2><p className="mt-2 text-sm text-subtle">No tenés materias {filter === 'todos' ? 'guardadas' : 'para este día'}.</p><button type="button" onClick={() => startEditor()} className="glass-button mt-5">Agregar materia</button></div> :
      <div className="space-y-4">{filtered.map((subject) => {
        const info = parseMateriaInfo(subject.name);
        return <article key={subject.id} className="glass-panel p-5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="min-w-0 flex-1 text-lg font-semibold leading-snug">{info.nombre}</h2>
            <button type="button" onClick={() => startEditor(subject)} aria-label={`Editar ${info.nombre}`} className="glass-button h-11 w-11 shrink-0 p-0"><Pencil size={17} /></button>
          </div>
          <div className="mt-3 space-y-3">{subject.classBlocks.map((block, index) => {
            const aula = block.classroom || (info.aula !== 'N/A' ? info.aula : '');
            const number = Number.parseInt(aula, 10);
            const location = number > 0 ? getEdificioByAula(number) : '';
            return <div key={index} className="rounded-2xl bg-muted p-3.5">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"><span className="font-medium capitalize text-accent">{DAYS.find((day) => day.value === block.day)?.label || block.day}</span><span className="flex items-center gap-1.5 tabular-nums text-subtle"><Clock size={14} />{block.startTime} a {block.endTime}</span></p>
              <p className="mt-2 flex items-start gap-1.5 text-sm font-medium"><MapPin size={16} className="mt-0.5 shrink-0 text-accent" /><span>{aula && !['-', 'Consultar'].includes(aula) ? `Aula ${aula}` : 'Aula sin asignar'}{location && location !== 'N/A' ? ` · ${location}` : ''}</span></p>
            </div>;
          })}</div>
          <div className="mt-3 flex items-center justify-between gap-3"><p className="text-sm capitalize text-subtle">{info.curso !== 'Consultar' ? info.curso : subject.modality}</p><button type="button" aria-label={`Eliminar ${info.nombre}`} onClick={() => { setError(''); setPendingDelete(subject); }} className="flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm text-danger"><Trash2 size={16} />Eliminar</button></div>
        </article>;
      })}</div>}
    <button type="button" disabled={busy} onClick={reset} className="mx-auto mt-6 flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm text-subtle"><RotateCcw size={16} />Restablecer materias iniciales</button>
    <Link href="/" className="mx-auto mt-2 flex min-h-11 items-center justify-center gap-1 text-sm text-accent"><ChevronLeft size={16} />Volver a Viajes</Link>

    <dialog ref={editorDialog} aria-labelledby="subject-editor-title" onCancel={(event) => { event.preventDefault(); closeEditor(); }} onClose={() => setOpen(false)} className={dialogClass}>
      <div className="mb-5 flex items-center justify-between gap-3"><h2 id="subject-editor-title" className="text-xl font-semibold">{editing ? 'Editar materia' : 'Nueva materia'}</h2><button type="button" onClick={closeEditor} disabled={busy} aria-label="Cerrar formulario" className="glass-button h-11 w-11 p-0"><X size={20} /></button></div>
      <form onSubmit={save} className="space-y-4">
        <label className="block text-sm font-medium">Nombre de la materia<input autoFocus required type="text" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} placeholder="Ej. Análisis de Sistemas" className={inputClass} /></label>
        <label className="block text-sm font-medium">Día de cursado<select value={form.dia} onChange={(event) => setForm({ ...form, dia: event.target.value as DayOfWeek })} className={inputClass}>{DAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3"><label className="min-w-0 text-sm font-medium">Inicio<input required type="time" value={form.horaInicio} onChange={(event) => setForm({ ...form, horaInicio: event.target.value })} className={inputClass} /></label><label className="min-w-0 text-sm font-medium">Fin<input required type="time" value={form.horaFin} onChange={(event) => setForm({ ...form, horaFin: event.target.value })} className={inputClass} /></label></div>
        <div className="grid grid-cols-2 gap-3"><label className="min-w-0 text-sm font-medium">Curso<input type="text" value={form.curso} onChange={(event) => setForm({ ...form, curso: event.target.value })} placeholder="Ej. 2K3" className={inputClass} /></label><label className="min-w-0 text-sm font-medium">Aula<input type="text" value={form.aula} onChange={(event) => setForm({ ...form, aula: event.target.value })} placeholder="Ej. 400" className={inputClass} /></label></div>
        {building && <p className="flex items-center gap-2 rounded-2xl bg-muted p-3 text-sm text-accent"><MapPin size={17} />{building}</p>}
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2"><button type="button" disabled={busy} onClick={closeEditor} className="glass-button flex-1">Cancelar</button><button type="submit" disabled={busy} className="glass-primary flex-1">{busy ? 'Guardando…' : 'Guardar'}</button></div>
      </form>
    </dialog>
    <dialog ref={deleteDialog} aria-labelledby="delete-subject-title" onCancel={(event) => { event.preventDefault(); if (!busy) setPendingDelete(null); }} onClose={() => setPendingDelete(null)} className={dialogClass}>
      <h2 id="delete-subject-title" className="text-xl font-semibold">¿Eliminar esta materia?</h2><p className="mt-3 text-sm leading-relaxed text-subtle">Se quitará {pendingDelete ? parseMateriaInfo(pendingDelete.name).nombre : 'la materia'} de tu cursado semanal.</p>
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-6 flex gap-3"><button autoFocus type="button" disabled={busy} onClick={() => setPendingDelete(null)} className="glass-button flex-1">Cancelar</button><button type="button" disabled={busy} onClick={remove} className="glass-button flex-1 text-danger">{busy ? 'Eliminando…' : 'Eliminar'}</button></div>
    </dialog>
  </main>;
}
