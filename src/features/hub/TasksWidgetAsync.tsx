"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, AlertCircle } from 'lucide-react';
import type { Task } from '@/types/task';

export async function fetchTasksData(): Promise<{ count: number; error: boolean }> {
  try {
    if (typeof window !== 'undefined') {
      const storedKanban = localStorage.getItem('lifeos_kanban_tasks');
      if (storedKanban) {
        const parsed: Task[] = JSON.parse(storedKanban);
        const inProgress = parsed.filter(t => t.status === 'in-progress' || t.status === 'todo');
        return { count: inProgress.length, error: false };
      }
    }
    return { count: 0, error: false };
  } catch (err) {
    console.error('[TasksWidgetAsync] Error fetching tasks:', err);
    return { count: 0, error: true };
  }
}

export function TasksWidgetAsync() {
  const [taskData, setTaskData] = useState<{ count: number; error: boolean }>({ count: 0, error: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasksData().then((res) => {
      setTaskData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between animate-pulse">
        <div className="w-8 h-8 rounded-full bg-neutral-800" />
        <div className="flex flex-col gap-1">
          <div className="w-12 h-3 bg-neutral-800 rounded" />
          <div className="w-20 h-5 bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  if (taskData.error) {
    return (
      <div className="bg-neutral-900/40 border border-red-900/40 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-2xl">📋</span>
          <AlertCircle size={16} className="text-red-400" />
        </div>
        <div>
          <p className="text-xs text-neutral-500 font-medium mb-1">Tareas</p>
          <p className="text-sm font-bold text-red-400">Error al cargar</p>
        </div>
      </div>
    );
  }

  return (
    <Link href="/kanban" className="block group">
      <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between hover:bg-neutral-800/50 transition-all shadow-md active:scale-95">
        <div className="flex items-center justify-between">
          <span className="text-2xl">📋</span>
          <ArrowUpRight size={15} className="text-neutral-600 group-hover:text-white transition-colors" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 font-medium mb-1">En Curso</p>
          <p className="text-lg font-bold text-white truncate">
            {taskData.count} {taskData.count === 1 ? 'Tarea' : 'Tareas'}
          </p>
        </div>
      </div>
    </Link>
  );
}
