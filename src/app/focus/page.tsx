"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, Timer, PenLine, Droplets, Bike, Dumbbell, Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useLocalStorageState } from '@/core/hooks/useLocalStorageState';
import { BateriaMentalSection } from '@/features/academia/BateriaMentalSection';
import { PAGE_TRANSITION, TAP_ANIMATION } from '@/lib/animations';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

const PomodoroWidget = dynamic(() => import('@/components/PomodoroWidget'), { ssr: false, loading: () => <Skeleton className="h-40 w-full" /> });
const StravaWidget = dynamic(() => import('@/features/focus/StravaWidget').then(m => m.StravaWidget), { ssr: false, loading: () => <Skeleton className="h-24 w-full" /> });
const GymTracker = dynamic(() => import('@/features/focus/GymTracker').then(m => m.GymTracker), { ssr: false, loading: () => <Skeleton className="h-32 w-full" /> });
const MateTracker = dynamic(() => import('@/features/focus/MateTracker').then(m => m.MateTracker), { ssr: false, loading: () => <Skeleton className="h-24 w-full" /> });



export default function FocusPage() {
  const [notasRapidas, setNotasRapidas] = useLocalStorageState('focus_notas_rapidas', '');
  const [showSaved, setShowSaved] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNotasChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotasRapidas(e.target.value);
    setShowSaved(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 1000);
  };

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-24"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex flex-col gap-2 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-sm mb-2"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
          Focus Station
        </h1>
        <p className="text-sm text-zinc-400 font-medium">
          Controla tu energía, hidratación y entrenamiento.
        </p>
      </header>

      {/* Batería Mental */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Zap size={16} /> Energía Diaria
        </h2>
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <BateriaMentalSection />
        </motion.div>
      </section>

      {/* Mate Tracker */}
      <section className="flex flex-col gap-3 mt-1">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Droplets size={16} /> Hidratación
        </h2>
        <MateTracker />
      </section>

      {/* Fitness: Strava & Gym */}
      <section className="flex flex-col gap-4 mt-2">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Bike size={16} /> Entrenamiento
        </h2>
        <StravaWidget />
        <GymTracker />
      </section>

      {/* Pomodoro */}
      <section className="flex flex-col gap-3 mt-2">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Timer size={16} /> Pomodoro Tracker
        </h2>
        <PomodoroWidget />
      </section>

      {/* Notas Rápidas */}
      <section className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-2">
            <PenLine size={16} /> Notas Rápidas
          </h2>
          <AnimatePresence>
            {showSaved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-xs font-bold text-emerald-500 flex items-center gap-1"
              >
                <CheckCircle2 size={14} /> Guardado
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <textarea 
          value={notasRapidas}
          onChange={handleNotasChange}
          placeholder="Escribe lo que tienes en mente..."
          className="w-full h-32 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </section>
    </motion.div>
  );
}
