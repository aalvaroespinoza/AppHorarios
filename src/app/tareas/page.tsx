"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Trash2, CheckCircle2, Circle, 
  Clock, Sparkles, X, Settings2, HelpCircle, RotateCcw,
  CalendarDays, Tag, AlertCircle, Check, FileText, BookOpen, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubjects } from '@/hooks/useSubjects';
import { parseMateriaInfo } from '@/core/utils/edificio';
import { trackEvent } from '@/core/analytics/engine';
import { PAGE_TRANSITION, SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';
import type { Task as KanbanTask } from '@/types/task';

export type ScheduleItemKind = 'materia' | 'kanban' | 'block';

export interface BlockTask {
  id: string;
  title: string;
  description?: string;
  horaInicio: string; // "10:00"
  horaFin: string; // "11:30"
  priority: 'alta' | 'media' | 'baja';
  completed: boolean;
  color?: string;
}

export interface UnifiedScheduleItem {
  id: string;
  kind: ScheduleItemKind;
  title: string;
  description?: string;
  horaInicio: string;
  horaFin: string;
  isAllDay?: boolean;
  priority?: 'alta' | 'media' | 'baja';
  completed?: boolean;
  aula?: string;
  edificio?: string;
  curso?: string;
  color?: string;
  kanbanStatus?: string;
  rawMateria?: any;
}

const DEFAULT_BLOCKS: BlockTask[] = [
  {
    id: '1',
    title: 'Estudio de Física II',
    description: 'Repaso de electromagnetismo y resolución de ejercicios de la guía.',
    horaInicio: '09:00',
    horaFin: '11:00',
    priority: 'alta',
    completed: false,
    color: 'border-red-500/30',
  },
  {
    id: '2',
    title: 'Desarrollo Proyecto Final',
    description: 'Implementación del backend y sincronización de base de datos.',
    horaInicio: '14:00',
    horaFin: '16:30',
    priority: 'media',
    completed: false,
    color: 'border-cyan-500/30',
  },
  {
    id: '3',
    title: 'Gimnasio & Cardio',
    description: 'Entrenamiento de fuerza y sesión de estiramiento.',
    horaInicio: '18:00',
    horaFin: '19:30',
    priority: 'baja',
    completed: true,
    color: 'border-neutral-700',
  }
];

export default function TareasTimeBlockingPage() {
  const { subjects } = useSubjects();
  const [blocks, setBlocks] = useState<BlockTask[]>([]);
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockTask | null>(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState<UnifiedScheduleItem | null>(null);

  // Selector de días
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1; // 0=Lun, 6=Dom
  });

  // Formulario nuevo bloque
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStart, setNewStart] = useState('10:00');
  const [newEnd, setNewEnd] = useState('11:30');
  const [newPriority, setNewPriority] = useState<'alta' | 'media' | 'baja'>('media');

  useEffect(() => {
    setIsMounted(true);
    // Cargar bloques de time-blocking
    const storedBlocks = localStorage.getItem('lifeos_timeblocking_blocks');
    if (storedBlocks) {
      try {
        setBlocks(JSON.parse(storedBlocks));
      } catch (e) {
        setBlocks(DEFAULT_BLOCKS);
      }
    } else {
      setBlocks(DEFAULT_BLOCKS);
    }

    // Cargar tareas del Kanban
    const storedKanban = localStorage.getItem('lifeos_kanban_tasks');
    if (storedKanban) {
      try {
        setKanbanTasks(JSON.parse(storedKanban));
      } catch (e) {}
    }
  }, []);

  const saveBlocks = (updated: BlockTask[]) => {
    setBlocks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_timeblocking_blocks', JSON.stringify(updated));
    }
  };

  const handleResetData = () => {
    if (!window.confirm('¿Reiniciar todos los bloques a los valores por defecto?')) return;
    saveBlocks(DEFAULT_BLOCKS);
    setShowSettingsModal(false);
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBlock: BlockTask = {
      id: 'tb-' + Date.now(),
      title: newTitle.trim(),
      description: newDescription.trim() || 'Bloque de enfoque y productividad',
      horaInicio: newStart,
      horaFin: newEnd,
      priority: newPriority,
      completed: false,
    };

    saveBlocks([...blocks, newBlock]);
    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);
  };

  const handleToggleBlock = (id: string) => {
    const updated = blocks.map(b => {
      if (b.id === id) {
        const nextCompleted = !b.completed;
        if (nextCompleted) {
          trackEvent('task_completed', 'task', 1);
        }
        return { ...b, completed: nextCompleted };
      }
      return b;
    });
    saveBlocks(updated);
    if (selectedBlock?.id === id) {
      setSelectedBlock({ ...selectedBlock, completed: !selectedBlock.completed });
    }
  };

  const handleToggleKanbanTask = (kanbanId: string) => {
    const realId = kanbanId.replace('kb-', '');
    const updated = kanbanTasks.map(k => {
      if (k.id === realId) {
        const nextStatus = k.status === 'done' ? 'todo' : 'done';
        if (nextStatus === 'done') {
          trackEvent('task_completed', 'task', 1);
        }
        return { ...k, status: nextStatus as any };
      }
      return k;
    });
    setKanbanTasks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_kanban_tasks', JSON.stringify(updated));
    }
  };

  const handleDeleteBlock = (id: string) => {
    const updated = blocks.filter(b => b.id !== id);
    saveBlocks(updated);
    if (selectedBlock?.id === id) setSelectedBlock(null);
  };

  // Días de la semana para el selector
  const diasSemana = [
    { label: 'Lun', nombre: 'lunes' },
    { label: 'Mar', nombre: 'martes' },
    { label: 'Mié', nombre: 'miercoles' },
    { label: 'Jue', nombre: 'jueves' },
    { label: 'Vie', nombre: 'viernes' },
    { label: 'Sáb', nombre: 'sabado' },
    { label: 'Dom', nombre: 'domingo' },
  ];

  const diaSeleccionadoObj = diasSemana[selectedDayIndex] || diasSemana[0];
  const diaActualNombre = diaSeleccionadoObj.nombre;

  // 1. Materias del día seleccionado
  const materiasDelDia: UnifiedScheduleItem[] = [];
  subjects.forEach(subject => {
    subject.classBlocks?.forEach(block => {
      if (block.day.toLowerCase() === diaActualNombre) {
        const parsed = parseMateriaInfo(subject.name);
        materiasDelDia.push({
          id: `mat-${subject.id}-${block.startTime}`,
          kind: 'materia',
          title: parsed.nombre || subject.name,
          description: `${parsed.curso ? parsed.curso + ' • ' : ''}Aula ${parsed.aula || block.classroom || '—'} (${parsed.edificio || 'Campus'})`,
          horaInicio: block.startTime || "08:00",
          horaFin: block.endTime || "11:10",
          aula: parsed.aula || block.classroom,
          edificio: parsed.edificio,
          curso: parsed.curso,
          color: subject.color,
          rawMateria: subject,
        });
      }
    });
  });

  // 2. Bloques de agenda / timeblocking
  const timeblockingItems: UnifiedScheduleItem[] = blocks.map(b => ({
    id: b.id,
    kind: 'block',
    title: b.title,
    description: b.description,
    horaInicio: b.horaInicio || "10:00",
    horaFin: b.horaFin || "11:30",
    priority: b.priority,
    completed: b.completed,
    color: b.color,
  }));

  // 3. Tareas del Kanban pendientes o en progreso (inyectadas al inicio del día como "Todo el día")
  const kanbanItems: UnifiedScheduleItem[] = kanbanTasks
    .filter(k => k.status !== 'done')
    .map(k => ({
      id: `kb-${k.id}`,
      kind: 'kanban',
      title: k.title,
      description: k.description || 'Tarea del tablero Kanban',
      horaInicio: '08:00',
      horaFin: 'Todo el día',
      isAllDay: true,
      priority: (k.priority || 'media') as any,
      completed: k.status === 'done',
      kanbanStatus: k.status,
    }));

  // Lista unificada ordenada cronológicamente
  const agendaUnificada: UnifiedScheduleItem[] = [
    ...kanbanItems,
    ...materiasDelDia,
    ...timeblockingItems
  ].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return (a.horaInicio || '00:00').localeCompare(b.horaInicio || '00:00');
  });

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-4 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mt-1 px-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/boveda"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm active:scale-95"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Agenda <Clock size={17} className="text-cyan-400" />
            </h1>
            <p className="text-xs text-neutral-400 font-medium">Schedule List • Clases & Tareas</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:scale-95"
            title="Ayuda y Guía"
          >
            <HelpCircle size={15} />
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:scale-95"
            title="Ajustes"
          >
            <Settings2 size={15} />
          </button>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="rounded-full bg-white hover:bg-neutral-200 text-black font-bold flex items-center gap-1 px-3 shadow-md active:scale-95"
          >
            <Plus size={15} />
            <span>Tarea</span>
          </Button>
        </div>
      </header>

      {/* SECCIÓN 1: Selector de Semana (Top) */}
      <div className="flex gap-2 pb-4 border-b border-neutral-800/50 overflow-x-auto no-scrollbar px-1 snap-x">
        {diasSemana.map((d, index) => {
          const isActive = selectedDayIndex === index;
          return (
            <button
              key={d.label}
              onClick={() => setSelectedDayIndex(index)}
              className={`flex-1 min-w-[50px] py-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all snap-center active:scale-95 ${
                isActive 
                  ? 'bg-white text-black font-bold shadow-md' 
                  : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800/60 hover:bg-neutral-800'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider">{d.label}</span>
              <span className="text-xs font-black">{index + 1}</span>
            </button>
          );
        })}
      </div>

      {/* SECCIÓN 2: Schedule List Unificado */}
      <div className="flex flex-col gap-4 mt-2 px-1 pb-24">
        {agendaUnificada.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500 gap-2">
            <Clock size={32} className="opacity-40" />
            <p className="text-sm font-medium">No hay actividades programadas para este día</p>
            <Button
              onClick={() => setShowAddModal(true)}
              variant="outline"
              size="sm"
              className="mt-2 text-xs rounded-xl border-neutral-800 text-neutral-300"
            >
              <Plus size={14} className="mr-1" /> Agregar primera tarea
            </Button>
          </div>
        ) : (
          agendaUnificada.map((item) => {
            const isMateria = item.kind === 'materia';
            const isKanban = item.kind === 'kanban';
            const isBlock = item.kind === 'block';

            return (
              <div key={item.id} className="flex gap-3.5 items-start">
                {/* Columna Izquierda: Hora */}
                <div className="w-14 shrink-0 flex flex-col items-end pt-1">
                  <span className="text-sm font-bold text-white leading-tight">
                    {item.isAllDay ? 'Todo el día' : item.horaInicio}
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase">
                    {item.isAllDay ? 'Pendiente' : item.horaFin}
                  </span>
                </div>
                
                {/* Columna Derecha: Tarjeta */}
                <div 
                  onClick={() => {
                    if (isBlock) {
                      const found = blocks.find(b => b.id === item.id);
                      if (found) setSelectedBlock(found);
                    } else {
                      setSelectedItemDetail(item);
                    }
                  }}
                  className={`flex-1 rounded-2xl p-4 transition-all cursor-pointer shadow-lg backdrop-blur-md flex flex-col gap-2.5 ${
                    isKanban
                      ? 'border border-dashed border-amber-500/50 bg-amber-950/15 hover:border-amber-400'
                      : isMateria
                      ? 'border border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-400/60'
                      : item.completed
                      ? 'border border-neutral-800/60 opacity-50 bg-neutral-950/40'
                      : 'border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <h3 className={`text-base font-bold truncate leading-tight ${item.completed ? 'line-through text-neutral-400' : 'text-white'}`}>
                      {item.title}
                    </h3>

                    {/* Botón de Check o Badge */}
                    {isMateria ? (
                      <Badge variant="outline" className="text-[10px] uppercase font-bold border-cyan-500/40 text-cyan-300 bg-cyan-500/10 shrink-0">
                        MATERIA
                      </Badge>
                    ) : isKanban ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold border-amber-500/40 text-amber-300 bg-amber-500/10">
                          TAREA
                        </Badge>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleKanbanTask(item.id);
                          }}
                          className="text-neutral-400 hover:text-white p-0.5"
                          title="Marcar como realizada en Kanban"
                        >
                          <Circle size={18} className="text-amber-400 hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold border-neutral-700 text-neutral-400">
                          AGENDA
                        </Badge>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBlock(item.id);
                          }}
                          className="text-neutral-400 hover:text-white p-0.5"
                          title={item.completed ? "Marcar pendiente" : "Marcar completado"}
                        >
                          {item.completed ? (
                            <CheckCircle2 size={18} className="text-emerald-400" />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Footer de Tarjeta con Enlace a Notas o Prioridad */}
                  <div className="flex items-center justify-between gap-2 mt-0.5 pt-2 border-t border-neutral-800/40">
                    <div className="flex items-center gap-1.5">
                      {item.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] uppercase font-bold border capitalize ${
                            item.priority === 'alta' ? 'border-red-500/40 text-red-300 bg-red-500/10' :
                            item.priority === 'media' ? 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' :
                            'border-neutral-700 text-neutral-400'
                          }`}
                        >
                          {item.priority}
                        </Badge>
                      )}

                      {isMateria && item.aula && (
                        <span className="text-[11px] font-semibold text-neutral-300">
                          Aula {item.aula}
                        </span>
                      )}
                    </div>

                    {isMateria && (
                      <Link 
                        href={`/boveda?subject=${encodeURIComponent(item.title)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-teal-500/10 px-2 py-1 rounded-lg border border-teal-500/20 hover:bg-teal-500/20 transition-all"
                      >
                        <FileText size={12} />
                        <span>Notas</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nuevo Bloque */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="w-full max-w-sm bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-3xl p-5 flex flex-col gap-4 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-neutral-800/80 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus size={16} className="text-cyan-400" /> Nueva Tarea en Agenda
                </h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 transition-all flex items-center justify-center active:scale-95">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateBlock} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-medium">Actividad / Título</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Estudiar Álgebra..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-medium">Descripción (opcional)</label>
                  <input
                    type="text"
                    placeholder="Notas o detalles..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 font-medium">Inicio</label>
                    <input
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 font-medium">Fin</label>
                    <input
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-medium">Prioridad</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(['alta', 'media', 'baja'] as const).map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewPriority(p)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                          newPriority === p
                            ? p === 'alta' ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : p === 'media' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl text-xs">
                  Guardar Tarea
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Detalle Tarea Block */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedBlock(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="w-full max-w-sm bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-3xl p-5 flex flex-col gap-4 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-neutral-800/80 pb-2">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedBlock.title}</h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    {selectedBlock.horaInicio} - {selectedBlock.horaFin} hs
                  </span>
                </div>
                <button onClick={() => setSelectedBlock(null)} className="w-8 h-8 rounded-full text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 transition-all flex items-center justify-center active:scale-95">
                  <X size={15} />
                </button>
              </div>

              {selectedBlock.description && (
                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  {selectedBlock.description}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs border-neutral-700">
                  Prioridad: {selectedBlock.priority}
                </Badge>
                <Badge variant={selectedBlock.completed ? "default" : "secondary"} className="text-xs">
                  {selectedBlock.completed ? "Completada" : "Pendiente"}
                </Badge>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => handleToggleBlock(selectedBlock.id)}
                  variant="outline"
                  className="flex-1 text-xs rounded-xl border-neutral-700 hover:bg-neutral-800"
                >
                  {selectedBlock.completed ? "Marcar Pendiente" : "Marcar Completada"}
                </Button>
                <Button
                  onClick={() => handleDeleteBlock(selectedBlock.id)}
                  variant="destructive"
                  size="icon"
                  className="rounded-xl w-10 h-10 shrink-0"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Detalle Item Unificado (Materia o Kanban) */}
      <AnimatePresence>
        {selectedItemDetail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedItemDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="w-full max-w-sm bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-3xl p-5 flex flex-col gap-4 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-neutral-800/80 pb-2">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedItemDetail.title}</h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    {selectedItemDetail.isAllDay ? 'Todo el día' : `${selectedItemDetail.horaInicio} - ${selectedItemDetail.horaFin} hs`}
                  </span>
                </div>
                <button onClick={() => setSelectedItemDetail(null)} className="w-8 h-8 rounded-full text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 transition-all flex items-center justify-center active:scale-95">
                  <X size={15} />
                </button>
              </div>

              {selectedItemDetail.description && (
                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  {selectedItemDetail.description}
                </p>
              )}

              {selectedItemDetail.kind === 'materia' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Aula</span>
                    <p className="font-bold text-white mt-0.5">{selectedItemDetail.aula || '—'}</p>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Edificio</span>
                    <p className="font-bold text-white mt-0.5">{selectedItemDetail.edificio || 'Campus'}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                {selectedItemDetail.kind === 'materia' ? (
                  <Link href={`/boveda?subject=${encodeURIComponent(selectedItemDetail.title)}`} className="w-full">
                    <Button className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                      <FileText size={15} />
                      <span>Abrir Notas de la Materia</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => {
                      handleToggleKanbanTask(selectedItemDetail.id);
                      setSelectedItemDetail(null);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={15} />
                    <span>Marcar Tarea como Completada</span>
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ajustes */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="relative w-full max-w-sm bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-3xl p-5 flex flex-col gap-4 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-neutral-800/80 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings2 size={16} className="text-cyan-400" /> Ajustes de Agenda
                </h2>
                <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 rounded-full text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 transition-all flex items-center justify-center active:scale-95">
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Podés restablecer la lista a los bloques de ejemplo predeterminados.
              </p>

              <Button
                onClick={handleResetData}
                variant="destructive"
                className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Restablecer Tareas por Defecto</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ayuda */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="relative w-full max-w-sm bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-3xl p-5 flex flex-col gap-3 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-neutral-800/80 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle size={16} className="text-cyan-400" /> Schedule List View
                </h2>
                <button onClick={() => setShowHelpModal(false)} className="w-8 h-8 rounded-full text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 transition-all flex items-center justify-center active:scale-95">
                  <X size={15} />
                </button>
              </div>

              <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <li>• <strong>Conectividad Total</strong>: Tus clases de la facultad y las tareas del Kanban se integran automáticamente.</li>
                <li>• <strong>Notas Directas</strong>: Toca el botón de Notas en cualquier materia para abrir sus apuntes en la Bóveda.</li>
                <li>• <strong>Selector Superior</strong>: Cambia entre los días de la semana con inercia táctil.</li>
              </ul>

              <Button
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-2 text-xs font-bold rounded-xl bg-white text-black hover:bg-neutral-200"
              >
                Entendido
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
