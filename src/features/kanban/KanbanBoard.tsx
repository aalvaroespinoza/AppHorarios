"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Trash2, CheckCircle2, Circle, Clock, MoreHorizontal, Sparkles, X } from 'lucide-react';
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

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Repasar apuntes de Física II',
    description: 'Electrostática y circuitos en serie.',
    status: 'todo',
    priority: 'alta',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Entrega de TP Arquitectura',
    description: 'Terminar renders y memoria descriptiva.',
    status: 'in-progress',
    priority: 'alta',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Cargar saldo en Red Bus',
    description: 'Asegurar saldo para la semana de cursado.',
    status: 'done',
    priority: 'baja',
    createdAt: new Date().toISOString(),
  },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isMounted, setIsMounted] = useState(false);
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('lifeos_kanban_tasks');
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('lifeos_kanban_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  const moveTask = (taskId: string, direction: 'prev' | 'next') => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
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
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
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

    setTasks(prev => [newTask, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setAddingToColumn(null);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Tablero Kanban
          </span>
          <Badge variant="outline" className="text-[10px] text-neutral-400 font-mono">
            {tasks.length} tareas
          </Badge>
        </div>
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
                        <Card className="bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800/80 p-3 rounded-xl flex flex-col gap-2.5 shadow-sm transition-colors group">
                          {/* Contenido de la tarjeta */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-white leading-snug break-words">
                                {task.title}
                              </span>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-neutral-600 hover:text-red-400 p-0.5 rounded transition-colors opacity-60 hover:opacity-100 shrink-0"
                                title="Eliminar tarjeta"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            {task.description && (
                              <p className="text-[11px] text-neutral-400 leading-normal line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Botones de acción compactos para mover entre columnas */}
                          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50 mt-0.5">
                            {/* Botón mover izquierda */}
                            {task.status !== 'todo' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveTask(task.id, 'prev')}
                                className="h-7 w-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                                title="Mover a la columna anterior"
                              >
                                <ChevronLeft size={16} />
                              </Button>
                            ) : (
                              <div className="w-7 h-7" />
                            )}

                            {/* Badge de estado actual */}
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-semibold">
                              {task.status}
                            </span>

                            {/* Botón mover derecha */}
                            {task.status !== 'done' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveTask(task.id, 'next')}
                                className="h-7 w-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                                title="Mover a la siguiente columna"
                              >
                                <ChevronRight size={16} />
                              </Button>
                            ) : (
                              <div className="w-7 h-7 flex items-center justify-center text-emerald-400">
                                <CheckCircle2 size={16} />
                              </div>
                            )}
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
    </div>
  );
}

export default KanbanBoard;
