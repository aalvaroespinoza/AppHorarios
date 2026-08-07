"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckSquare, ListTodo, Plus, Square } from 'lucide-react';
import Link from 'next/link';
import NativeCard from '@/core/components/ui/NativeCard';
import { createClient } from '@/lib/supabase/client';

interface TaskEvent {
  id: string;
  parsed_data: {
    type: string;
    payload?: {
      title?: string;
      date?: string;
      datetimeISO?: string;
    }
  };
  status: string; // 'processed' | 'completed'
}

export default function TareasPage() {
  const [tasks, setTasks] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
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

      // Filtrar solo TASK y create_reminder
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
    
    // Optistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      const { error } = await supabase
        .from('raw_events')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error actualizando tarea:', err);
      // Revertir si falla
      fetchTasks();
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

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

      {loading ? (
        <div className="flex justify-center p-10">
          <span className="text-zinc-500">Cargando tareas...</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 mt-2">
            <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
              <ListTodo size={16} /> Pendientes ({pendingTasks.length})
            </h2>
            
            {pendingTasks.length > 0 ? (
              pendingTasks.map((t) => {
                const payload = t.parsed_data?.payload;
                const title = payload?.title || 'Sin título';
                const date = payload?.datetimeISO || payload?.date;

                return (
                  <NativeCard 
                    key={t.id}
                    onClick={() => toggleTask(t.id, t.status)}
                    className="bg-zinc-900/60 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors cursor-pointer group flex items-start gap-4"
                  >
                    <div className="mt-0.5 text-zinc-500 group-hover:text-indigo-400 transition-colors">
                      <Square size={22} />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
                      {date && <p className="text-sm text-zinc-500 font-medium">{date}</p>}
                    </div>
                  </NativeCard>
                );
              })
            ) : (
              <NativeCard className="bg-zinc-900/40 border border-zinc-800/60 border-dashed p-8 flex flex-col items-center justify-center text-center gap-3">
                <ListTodo size={36} className="text-zinc-600 mb-1" />
                <p className="text-sm text-zinc-400 font-medium">
                  No hay tareas pendientes. Díctale a LifeOS para agregar una nueva.
                </p>
              </NativeCard>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
                <CheckSquare size={16} /> Completadas ({completedTasks.length})
              </h2>
              
              {completedTasks.map((t) => {
                const payload = t.parsed_data?.payload;
                const title = payload?.title || 'Sin título';
                const date = payload?.datetimeISO || payload?.date;

                return (
                  <NativeCard 
                    key={t.id}
                    onClick={() => toggleTask(t.id, t.status)}
                    className="bg-zinc-900/20 border border-zinc-800/50 p-4 flex items-start gap-4 opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="mt-0.5 text-emerald-500">
                      <CheckSquare size={22} />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <h3 className="text-base font-semibold text-zinc-400 line-through">{title}</h3>
                      {date && <p className="text-sm text-zinc-600 font-medium line-through">{date}</p>}
                    </div>
                  </NativeCard>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
