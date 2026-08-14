"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ChevronLeft, ChevronRight, Trash2, CheckCircle2, 
  Circle, Clock, MoreHorizontal, Sparkles, X, Settings2, HelpCircle, RotateCcw 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus } from '@/types/task';
import { TAP_ANIMATION, SPRING_CONFIG } from '@/lib/animations';

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  borderColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'todo',
    title: 'Por Hacer',
    borderColor: 'border-neutral-800',
    accentColor: 'text-neutral-400',
    badgeBg: 'bg-neutral-800',
    badgeText: 'text-neutral-300',
  },
  {
    id: 'in-progress',
    title: 'En Progreso',
    borderColor: 'border-sky-500/50',
    accentColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 border-sky-500/30',
    badgeText: 'text-sky-300',
  },
  {
    id: 'done',
    title: 'Completado',
    borderColor: 'border-emerald-500/50',
    accentColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    badgeText: 'text-emerald-300',
  },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('lifeos_kanban_tasks');
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (e) {
        setTasks([]);
      }
    } else {
      setTasks([]);
    }
  }, []);

  const saveTasks = (updated: Task[]) => {
    setTasks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_kanban_tasks', JSON.stringify(updated));
    }
  };

  const handleResetBoard = () => {
    if (!window.confirm('¿Limpiar todas las tarjetas del tablero Kanban?')) return;
    saveTasks([]);
    setShowSettings(false);
  };

  const handleQuickAdd = () => {
    if (!quickTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: quickTitle.trim(),
      status: 'todo',
      createdAt: new Date().toISOString(),
    };
    saveTasks([newTask, ...tasks]);
    setQuickTitle('');
  };

  const moveTask = (taskId: string, direction: 'prev' | 'next') => {
    const updated = tasks.map(task => {
      if (task.id !== taskId) return task;

      let nextStatus: TaskStatus = task.status;
      if (direction === 'next') {
        if (task.status === 'todo') nextStatus = 'in-progress';
        else if (task.status === 'in-progress') nextStatus = 'done';
      } else if (direction === 'prev') {
        if (task.status === 'done') nextStatus = 'in-progress';
        else if (task.status === 'in-progress') nextStatus = 'todo';
      }

      return { ...task, status: nextStatus };
    });
    saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleAddTask = (status: TaskStatus) => {
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      status,
      createdAt: new Date().toISOString(),
    };

    saveTasks([newTask, ...tasks]);
    setNewTitle('');
    setNewDesc('');
    setAddingToColumn(null);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Info y Botones de Control */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Tablero Ágil
          </span>
          <Badge variant="outline" className="text-[10px] text-neutral-400 font-mono">
            {tasks.length} tarjetas
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Ayuda"
          >
            <HelpCircle size={15} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Ajustes y Limpieza"
          >
            <Settings2 size={15} />
          </button>
        </div>
      </div>

      {/* Input Rápido Superior para Añadir Tarea */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Nueva tarea..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleQuickAdd();
          }}
          className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <Button 
          onClick={handleQuickAdd}
          disabled={!quickTitle.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold text-xs rounded-xl px-4 h-auto py-2.5 shadow-md shadow-cyan-500/20"
        >
          Agregar
        </Button>
      </div>

      {/* Columnas Horizontales con Scroll Móvil (iPhone 15 Optimized) */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 -mx-4 px-4 hide-scrollbar">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <Card
              key={col.id}
              className={`w-[85vw] max-w-[320px] shrink-0 snap-center bg-neutral-900/60 border ${col.borderColor} rounded-2xl flex flex-col max-h-[75vh] shadow-xl backdrop-blur-md overflow-hidden`}
            >
              {/* Header Columna */}
              <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-neutral-800/80 bg-neutral-950/40">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    col.id === 'todo' ? 'bg-neutral-500' : col.id === 'in-progress' ? 'bg-sky-400 animate-pulse' : 'bg-emerald-400'
                  }`} />
                  <CardTitle className="text-sm font-bold text-white">
                    {col.title}
                  </CardTitle>
                </div>
                <Badge variant="outline" className={`text-xs font-mono font-bold ${col.badgeBg} ${col.badgeText}`}>
                  {colTasks.length}
                </Badge>
              </CardHeader>

              {/* Lista de Tareas dentro de la Columna */}
              <CardContent className="p-3 flex-1 overflow-y-auto flex flex-col gap-3 hide-scrollbar">
                {/* Formulario Rápido de Agregar Tarea */}
                {addingToColumn === col.id ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col gap-2 shadow-lg"
                  >
                    <input
                      type="text"
                      placeholder="Título de la tarjeta..."
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                      autoFocus
                    />
                    <textarea
                      placeholder="Descripción breve (opcional)..."
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-[11px] text-neutral-300 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs h-7 rounded-lg"
                        onClick={() => setAddingToColumn(null)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-7 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg"
                        onClick={() => handleAddTask(col.id)}
                      >
                        Añadir
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAddingToColumn(col.id);
                      setNewTitle('');
                      setNewDesc('');
                    }}
                    className="w-full justify-center gap-1.5 border border-dashed border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800/40 rounded-xl text-xs py-2 h-auto"
                  >
                    <Plus size={14} />
                    <span>Añadir Tarjeta</span>
                  </Button>
                )}

                {/* Tarjetas */}
                <AnimatePresence>
                  {colTasks.length === 0 && addingToColumn !== col.id ? (
                    <div className="py-8 text-center text-xs text-neutral-500 italic">
                      Sin tarjetas en esta columna
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={SPRING_CONFIG}
                      >
                        <Card className="bg-neutral-900/90 border border-neutral-800/90 rounded-xl p-3.5 flex flex-col gap-2 shadow-sm hover:border-neutral-700 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-white leading-snug">
                              {task.title}
                            </h4>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors"
                              title="Eliminar tarjeta"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-neutral-400 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Acciones de Movimiento */}
                          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50 mt-1">
                            <span className="text-[9px] text-neutral-500 font-mono">
                              {task.createdAt ? new Date(task.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : 'Hoy'}
                            </span>

                            <div className="flex gap-1">
                              {col.id !== 'todo' && (
                                <motion.button
                                  whileTap={TAP_ANIMATION}
                                  onClick={() => moveTask(task.id, 'prev')}
                                  className="w-6 h-6 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
                                  title="Mover a columna anterior"
                                >
                                  <ChevronLeft size={13} />
                                </motion.button>
                              )}
                              {col.id !== 'done' && (
                                <motion.button
                                  whileTap={TAP_ANIMATION}
                                  onClick={() => moveTask(task.id, 'next')}
                                  className="w-6 h-6 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center justify-center transition-colors"
                                  title="Mover a siguiente columna"
                                >
                                  <ChevronRight size={13} />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Ajustes */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings2 size={16} className="text-sky-400" /> Ajustes de Kanban
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Podés limpiar todas las tarjetas del tablero para iniciar desde cero.
              </p>

              <Button
                onClick={handleResetBoard}
                variant="destructive"
                className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Limpiar Todo el Tablero</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ayuda */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle size={16} className="text-sky-400" /> ¿Cómo usar el Tablero Kanban?
                </h2>
                <button onClick={() => setShowHelp(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <li>• <strong>Agregar rápido</strong>: Escribí en el campo superior y tocá Agregar o Enter.</li>
                <li>• <strong>Columnas</strong>: Por Hacer, En Progreso y Completado.</li>
                <li>• <strong>Mover Tarjetas</strong>: Usá las flechas inferiores de cada tarjeta para cambiar de estado.</li>
                <li>• <strong>Sincronización</strong>: Las tareas en progreso aparecen automáticamente en tu Agenda diaria.</li>
              </ul>

              <Button
                onClick={() => setShowHelp(false)}
                className="w-full mt-2 text-xs font-bold rounded-xl bg-sky-500 text-black hover:bg-sky-400"
              >
                Entendido
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default KanbanBoard;
