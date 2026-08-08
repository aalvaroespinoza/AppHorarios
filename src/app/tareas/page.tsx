"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckSquare, ListTodo, Plus, Square, Trash2, Calendar, Circle, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import NativeCard from '@/core/components/ui/NativeCard';
import { createClient } from '@/lib/supabase/client';
import dayjs from 'dayjs';

interface TaskEvent {
  id: string;
  parsed_data: {
    type: string;
    payload?: {
      title?: string;
      titulo?: string;
      date?: string;
      datetimeISO?: string;
      priority?: string;
    }
  };
  status: string; // 'processed' | 'completed'
}

export default function TareasPage() {
  const [tasks, setTasks] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<{id: string, reason: string}[] | null>(null);
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

      const filtered = (data || []).filter(item => {
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

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar esta tarea permanentemente?')) return;

    setTasks(prev => prev.filter(t => t.id !== id));
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
    try {
      const newTask = {
        raw_text: newTaskTitle,
        type: 'TASK',
        status: 'processed',
        parsed_data: {
          type: 'TASK',
          payload: {
            title: newTaskTitle.trim(),
            priority: 'media',
            source: 'manual'
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
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Error al crear la tarea');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuggestOrder = async () => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    if (pendingTasks.length === 0) return;
    setIsSuggesting(true);
    try {
      const payloadTasks = pendingTasks.map(t => ({
        id: t.id,
        title: t.parsed_data.payload?.title || t.parsed_data.payload?.titulo || 'Sin título',
        priority: t.parsed_data.payload?.priority,
        date: t.parsed_data.payload?.datetimeISO || t.parsed_data.payload?.date
      }));

      const res = await fetch('/api/tareas/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: payloadTasks })
      });

      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Error suggesting order:', err);
      alert('Error al obtener sugerencias de Gemini');
    } finally {
      setIsSuggesting(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Agrupación por fechas para pendientes
  const groupedPending = {
    hoy: [] as TaskEvent[],
    semana: [] as TaskEvent[],
    futuro: [] as TaskEvent[],
    sin_fecha: [] as TaskEvent[],
  };

  const now = dayjs();
  pendingTasks.forEach(t => {
    const payload = t.parsed_data?.payload;
    const dateStr = payload?.datetimeISO || payload?.date;
    if (!dateStr) {
      groupedPending.sin_fecha.push(t);
      return;
    }
    const d = dayjs(dateStr);
    if (!d.isValid()) {
      groupedPending.sin_fecha.push(t);
    } else if (d.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) {
      groupedPending.hoy.push(t);
    } else if (d.isBefore(now.add(7, 'day')) && d.isAfter(now.startOf('day'))) {
      groupedPending.semana.push(t);
    } else {
      groupedPending.futuro.push(t);
    }
  });

  const renderTask = (t: TaskEvent, isCompleted: boolean) => {
    const payload = t.parsed_data?.payload;
    const title = payload?.title || payload?.titulo || 'Sin título';
    const date = payload?.datetimeISO || payload?.date;
    const priority = payload?.priority?.toLowerCase() || 'baja';
    
    let priorityColor = 'bg-transparent';
    if (priority === 'alta') priorityColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    else if (priority === 'media') priorityColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';

    return (
      <NativeCard 
        key={t.id}
        onClick={() => toggleTask(t.id, t.status)}
        className={`border p-4 transition-colors cursor-pointer group flex items-start gap-3 ${
          isCompleted 
            ? 'bg-zinc-900/20 border-zinc-800/50 opacity-60 hover:opacity-80' 
            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <div className={`mt-0.5 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-indigo-400'}`}>
          {isCompleted ? <CheckSquare size={22} /> : <Square size={22} />}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-semibold truncate ${isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>
              {title}
            </h3>
            {!isCompleted && priority !== 'baja' && priorityColor !== 'bg-transparent' && (
              <div className={`w-2 h-2 rounded-full shrink-0 ${priorityColor}`} title={`Prioridad: ${priority}`} />
            )}
          </div>
          {date && (
            <p className={`text-xs font-medium flex items-center gap-1 ${isCompleted ? 'text-zinc-600 line-through' : 'text-zinc-500'}`}>
              <Calendar size={12} /> {dayjs(date).format('DD MMM, HH:mm')}
            </p>
          )}
        </div>
        <button 
          onClick={(e) => handleDeleteTask(t.id, e)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          title="Eliminar tarea"
        >
          <Trash2 size={16} />
        </button>
      </NativeCard>
    );
  };

  const renderGroup = (title: string, tasksList: TaskEvent[], icon: React.ReactNode) => {
    if (tasksList.length === 0) return null;
    return (
      <div className="flex flex-col gap-3 mb-6">
        <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          {icon} {title} <span className="ml-auto bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full text-[10px]">{tasksList.length}</span>
        </h3>
        {tasksList.map(t => renderTask(t, false))}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-24"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Tareas
          </h1>
        </div>
        <Link href="/lifeos" className="w-10 h-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center hover:bg-indigo-500/20 transition-colors active:scale-95 shadow-sm">
          <Plus size={20} />
        </Link>
      </header>

      {/* Formulario de Creación Rápida */}
      <form onSubmit={handleCreateTask} className="flex items-center gap-2">
        <input 
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Añadir una tarea rápida..."
          disabled={isCreating}
          className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
        <button 
          type="submit"
          disabled={!newTaskTitle.trim() || isCreating}
          className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:bg-zinc-800 active:scale-95 transition-all shadow-sm"
        >
          {isCreating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col mt-2">
          {pendingTasks.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-zinc-500 font-medium">{pendingTasks.length} tareas pendientes</span>
                {!suggestions && pendingTasks.length > 1 && (
                  <button
                    onClick={handleSuggestOrder}
                    disabled={isSuggesting}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full transition-colors active:scale-95 disabled:opacity-50"
                  >
                    {isSuggesting ? <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={12} />}
                    Sugerir orden
                  </button>
                )}
              </div>

              {/* Panel de Sugerencias */}
              <AnimatePresence>
                {suggestions && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className="overflow-hidden"
                  >
                    <NativeCard className="bg-gradient-to-br from-indigo-900/40 to-indigo-900/10 border border-indigo-500/30 p-4 mb-6 relative flex flex-col gap-3">
                      <button 
                        onClick={() => setSuggestions(null)}
                        className="absolute top-3 right-3 text-indigo-400 hover:text-white transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <h2 className="text-sm font-bold tracking-widest text-indigo-400 uppercase flex items-center gap-2">
                        <Sparkles size={16} /> Orden de ataque (Gemini)
                      </h2>
                      <div className="flex flex-col gap-2">
                        {suggestions.map((s, index) => {
                          const t = pendingTasks.find(pt => pt.id === s.id);
                          if (!t) return null;
                          const title = t.parsed_data?.payload?.title || t.parsed_data?.payload?.titulo || 'Sin título';
                          return (
                            <div key={s.id} className="flex flex-col bg-black/20 rounded-lg p-3 border border-indigo-500/10">
                              <div className="flex items-center gap-2">
                                <span className="text-indigo-400 font-bold text-xs">{index + 1}.</span>
                                <h4 className="text-sm font-bold text-white truncate">{title}</h4>
                              </div>
                              <p className="text-xs text-indigo-200/70 mt-1 pl-5">{s.reason}</p>
                            </div>
                          );
                        })}
                      </div>
                    </NativeCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {renderGroup('Hoy', groupedPending.hoy, <Circle size={10} className="fill-indigo-500 text-indigo-500" />)}
              {renderGroup('Esta Semana', groupedPending.semana, <Circle size={10} className="fill-emerald-500 text-emerald-500" />)}
              {renderGroup('Más Adelante', groupedPending.futuro, <Circle size={10} className="fill-zinc-500 text-zinc-500" />)}
              {renderGroup('Sin Fecha', groupedPending.sin_fecha, <Circle size={10} className="fill-zinc-600 text-zinc-600" />)}
            </>
          ) : (
            <NativeCard className="bg-zinc-900/40 border border-zinc-800/60 border-dashed p-8 flex flex-col items-center justify-center text-center gap-3 mb-6">
              <ListTodo size={36} className="text-zinc-600 mb-1" />
              <p className="text-sm text-zinc-400 font-medium">
                No hay tareas pendientes. Agrega una arriba o díctale a LifeOS.
              </p>
            </NativeCard>
          )}

          {completedTasks.length > 0 && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-zinc-800/50">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2 mb-2">
                <CheckSquare size={16} /> Completadas ({completedTasks.length})
              </h2>
              {completedTasks.map(t => renderTask(t, true))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
