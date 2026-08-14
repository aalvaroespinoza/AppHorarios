"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, GraduationCap, Dumbbell, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/core/analytics/engine';

interface HabitItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  eventCategory: string;
}

const HABITS: HabitItem[] = [
  { id: 'facultad', label: 'Facultad', icon: GraduationCap, eventCategory: 'academic' },
  { id: 'ciberseguridad', label: 'Ciberseg.', icon: Shield, eventCategory: 'focus' },
  { id: 'habitos', label: 'Gym/Ocio', icon: Dumbbell, eventCategory: 'system' },
];

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getCheckedHabits(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('lifeos_daily_log');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Solo devolver si es del día actual
      if (parsed._date === getTodayKey()) {
        return parsed;
      }
    }
  } catch (e) {}
  return {};
}

function saveCheckedHabits(habits: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lifeos_daily_log', JSON.stringify({ ...habits, _date: getTodayKey() }));
}

export function DailyLogWidgetAsync() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setChecked(getCheckedHabits());
  }, []);

  const handleToggle = (habit: HabitItem) => {
    const wasChecked = !!checked[habit.id];
    const next = { ...checked, [habit.id]: !wasChecked };
    setChecked(next);
    saveCheckedHabits(next);

    if (!wasChecked) {
      trackEvent('habit_completed', habit.eventCategory as any, 1, { habit: habit.id });
    }
  };

  const completedCount = HABITS.filter(h => checked[h.id]).length;

  if (!isMounted) {
    return (
      <div className="col-span-2 bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xl rounded-[28px] p-5 animate-pulse h-28" />
    );
  }

  return (
    <div className="col-span-2 bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xl rounded-[28px] p-5 flex flex-col gap-3 shadow-xl relative overflow-hidden">
      {/* Indicador de progreso sutil */}
      <div className="absolute top-0 left-0 h-[2px] bg-emerald-500/60 transition-all duration-500 rounded-full" style={{ width: `${(completedCount / HABITS.length) * 100}%` }} />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          Check-in Diario
        </span>
        {completedCount === HABITS.length ? (
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> Completado
          </span>
        ) : (
          <span className="text-[10px] font-mono text-neutral-500">
            {completedCount}/{HABITS.length}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {HABITS.map((habit) => {
          const Icon = habit.icon;
          const isOn = !!checked[habit.id];

          return (
            <motion.button
              key={habit.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleToggle(habit)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border transition-all active:scale-95 ${
                isOn
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-bold tracking-tight">{habit.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
