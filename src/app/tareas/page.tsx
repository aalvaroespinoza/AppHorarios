"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, CheckCircle2, Circle, Clock, Sparkles, X, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';
import dayjs from 'dayjs';
import { PAGE_TRANSITION, SPRING_CONFIG } from '@/lib/animations';

interface TaskEvent {
  id: string;
  horaInicio?: string;
  horaFin?: string;
  parsed_data: {
    type: string;
    payload?: {
      title?: string;
      titulo?: string;
      date?: string;
      datetimeISO?: string;
      horaInicio?: string;
      horaFin?: string;
      priority?: string;
      category?: string;
    }
  };
  status: string; // 'processed' | 'completed'
}

const START_HOUR = 8;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR + 1; // 15 horas (80px cada una = 1200px)
const HOUR_HEIGHT = 80;

export default function TareasPage() {
  const [tasks, setTasks] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStart, setNewTaskStart] = useState('10:00');
  const [newTaskDuration, setNewTaskDuration] = useState('60');
  const [isCreating, setIsCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskEvent | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('raw_events')
        .select('*')
        .in('status', ['processed', 'completed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      const filtered = (data || []).filter((item: any) => {
        const type = item.parsed_data?.type;
        return type === 'TASK' || type === 'create_reminder' || type === 'REMINDER';
      });

      setTasks(filtered as TaskEvent[]);
    } catch (err) {
      console.error('Excepción al cargar tareas:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'processed' : 'completed';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      const { error } = await supabase
        .from('raw_events')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error actualizando tarea:', err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('¿Eliminar esta tarea de la agenda?')) return;

    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);

    try {
      const { error } = await supabase
        .from('raw_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error eliminando tarea:', err);
      fetchTasks();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreating(true);

    const [h, m] = newTaskStart.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + parseInt(newTaskDuration));
    const horaFin = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

    try {
      const newTask = {
        raw_text: newTaskTitle,
        type: 'TASK',
        status: 'processed',
        parsed_data: {
          type: 'TASK',
          payload: {
            title: newTaskTitle.trim(),
            horaInicio: newTaskStart,
            horaFin: horaFin,
            priority: 'media',
            source: 'manual',
            datetimeISO: new Date().toISOString()
          }
        }
      };

      const { data, error } = await supabase
        .from('raw_events')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => [data, ...prev]);
      setNewTaskTitle('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Error al crear la tarea');
    } finally {
      setIsCreating(false);
    }
  };

  // Posición de la línea de tiempo actual
  const now = new Date();
  const currentMinutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * HOUR_HEIGHT;
  const showCurrentTimeLine = now.getHours() >= START_HOUR && now.getHours() <= END_HOUR;

  // Extraer y procesar tareas activas
  const activeTasks = tasks.map((tarea, idx) => {
    const payload = tarea.parsed_data?.payload;
    const title = payload?.title || payload?.titulo || 'Tarea programada';
    const priority = payload?.priority?.toLowerCase() || 'media';
    const isCompleted = tarea.status === 'completed';

    // Determinar hora de inicio y fin
    let horaInicio = payload?.horaInicio;
    let horaFin = payload?.horaFin;

    if (!horaInicio) {
      const dStr = payload?.datetimeISO || payload?.date;
      if (dStr && dayjs(dStr).isValid()) {
        horaInicio = dayjs(dStr).format('HH:mm');
        horaFin = dayjs(dStr).add(1, 'hour').format('HH:mm');
      } else {
        // Horas default escalonadas
        const defaultH = 8 + (idx * 2) % 13;
        horaInicio = `${String(defaultH).padStart(2, '0')}:00`;
        horaFin = `${String(defaultH + 1).padStart(2, '0')}:30`;
      }
    }

    if (!horaFin) {
      const [h, m] = horaInicio.split(':').map(Number);
      horaFin = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // Cálculo dinámico según la fórmula requerida
    const start = new Date(`1970-01-01T${horaInicio}:00`);
    const end = new Date(`1970-01-01T${horaFin}:00`);
    const top = (start.getHours() - 8) * 80 + (start.getMinutes() / 60) * 80;
    const height = Math.max(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 80, 56);

    return {
      ...tarea,
      title,
      horaInicio,
      horaFin,
      priority,
      isCompleted,
      top,
      height
    };
  });

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-5 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-24"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/boveda"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Time-Blocking <Clock size={18} className="text-cyan-400" />
            </h1>
            <p className="text-xs text-neutral-500 font-medium">Agenda visual de 08:00 a 22:00</p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          size="sm"
          className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
        >
          <Plus size={16} />
          <span>Bloque</span>
        </Button>
      </header>

      {/* Modal / Formulario Nuevo Bloque */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-400" /> Nuevo Bloque de Tiempo
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
                <input 
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Título del bloque (Ej: Estudiar Física)..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  autoFocus
                />

                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[11px] text-neutral-400 font-semibold px-1">Hora Inicio</label>
                    <input 
                      type="time"
                      value={newTaskStart}
                      onChange={(e) => setNewTaskStart(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[11px] text-neutral-400 font-semibold px-1">Duración</label>
                    <select
                      value={newTaskDuration}
                      onChange={(e) => setNewTaskDuration(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 hora</option>
                      <option value="90">1.5 horas</option>
                      <option value="120">2 horas</option>
                    </select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={!newTaskTitle.trim() || isCreating}
                  className="w-full mt-2 font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl"
                >
                  {isCreating ? 'Guardando...' : 'Crear Bloque'}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenedor Padre de Grilla Horaria (1200px de altura = 15 horas x 80px) */}
      <div className="relative w-full h-[1200px] mt-4 border-t border-neutral-800 rounded-3xl bg-neutral-950/40 overflow-hidden shadow-2xl">
        {/* Columna lateral de horas fijas de 08:00 a 22:00 */}
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
            const hour = i + START_HOUR;
            return (
              <div key={hour} className="flex h-[80px] border-b border-neutral-800/50 relative">
                <span className="w-14 text-xs text-neutral-500 font-mono pr-3 text-right pt-2 select-none shrink-0">
                  {String(hour).padStart(2, '0')}:00
                </span>
                <div className="flex-1 relative border-l border-neutral-800/50">
                  {/* Marca de media hora */}
                  <div className="absolute top-1/2 left-0 right-0 border-b border-neutral-800/20 border-dashed" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Línea de hora actual en vivo */}
        {showCurrentTimeLine && (
          <div 
            className="absolute left-14 right-0 z-30 flex items-center pointer-events-none"
            style={{ top: `${currentTimeTop}px` }}
          >
            <div className="w-3 h-3 -ml-1.5 rounded-full bg-red-500 ring-4 ring-red-500/20 shadow-md" />
            <div className="flex-1 h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
          </div>
        )}

        {/* Bloques de Tareas / Materias posicionados de forma absoluta */}
        <div className="absolute inset-0 pointer-events-none">
          {activeTasks.map((task) => (
            <Card
              key={task.id}
              onClick={() => setSelectedTask(task)}
              style={{
                top: `${task.top + 2}px`,
                height: `${task.height - 4}px`
              }}
              className={`absolute left-16 right-4 z-20 pointer-events-auto cursor-pointer p-3 border rounded-2xl flex flex-col justify-between transition-all backdrop-blur-md shadow-md active:scale-[0.98] ${
                task.isCompleted
                  ? 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                  : task.priority === 'alta'
                    ? 'bg-red-950/30 border-red-500/40 hover:border-red-400'
                    : 'bg-cyan-950/30 border-cyan-500/40 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id, task.status);
                    }}
                    className={`shrink-0 transition-colors ${task.isCompleted ? 'text-emerald-400' : 'text-neutral-500 hover:text-cyan-400'}`}
                  >
                    {task.isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </button>
                  <CardTitle className={`text-xs sm:text-sm font-bold truncate leading-tight ${task.isCompleted ? 'line-through text-neutral-500' : 'text-white'}`}>
                    {task.title}
                  </CardTitle>
                </div>

                <Badge 
                  variant="outline" 
                  className={`text-[10px] shrink-0 font-mono font-semibold px-2 py-0.5 ${
                    task.priority === 'alta' ? 'border-red-500/40 text-red-400 bg-red-500/10' : 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10'
                  }`}
                >
                  {task.horaInicio} - {task.horaFin}
                </Badge>
              </div>

              {task.height > 65 && (
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                  <span className="truncate">Prioridad: {task.priority}</span>
                  <button
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Detalle de Bloque */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedTask(null)}
          >
            <div 
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
            >
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Detalle del Bloque</span>
                <button onClick={() => setSelectedTask(null)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={16} />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-snug">{selectedTask.parsed_data?.payload?.title || 'Bloque'}</h3>
                <p className="text-xs text-neutral-400 mt-2 font-mono">
                  ⏰ {selectedTask.horaInicio} a {selectedTask.horaFin} hs
                </p>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => {
                    toggleTask(selectedTask.id, selectedTask.status);
                    setSelectedTask(null);
                  }}
                  variant="secondary"
                  className="flex-1 text-xs font-bold rounded-xl"
                >
                  {selectedTask.status === 'completed' ? 'Marcar Pendiente' : 'Marcar Completada'}
                </Button>
                <Button
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  variant="destructive"
                  className="text-xs font-bold rounded-xl"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
