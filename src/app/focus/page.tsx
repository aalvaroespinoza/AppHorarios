"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, Timer, PenLine, Droplets, Bike, CheckCircle2, Shield, ShieldAlert } from 'lucide-react';
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
  const [isBunkerMode, setIsBunkerMode] = useState(false);
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
      className={`p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative text-gray-900 dark:text-white transition-colors duration-500 ${
        isBunkerMode 
          ? 'bg-neutral-950 pb-8 justify-between' 
          : 'bg-gray-50 dark:bg-[#0a0a0c] pb-24'
      }`}
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <Link 
            href="/boveda"
            className="w-10 h-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {isBunkerMode ? 'Búnker Mode' : 'Focus Station'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              {isBunkerMode ? 'Zero distracciones. Modo Deep Work activo.' : 'Energía, hidratación y entrenamiento.'}
            </p>
          </div>
        </div>

        {/* Toggle Modo Búnker */}
        <motion.button
          whileTap={TAP_ANIMATION}
          onClick={() => setIsBunkerMode(!isBunkerMode)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
            isBunkerMode
              ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
              : 'bg-zinc-900/80 text-amber-400 border-amber-500/30 hover:border-amber-500/60'
          }`}
        >
          {isBunkerMode ? <ShieldAlert size={14} /> : <Shield size={14} />}
          <span>{isBunkerMode ? 'Búnker Activo' : 'Modo Búnker'}</span>
        </motion.button>
      </header>

      <AnimatePresence mode="wait">
        {isBunkerMode ? (
          /* Modo Búnker: Pomodoro Centrado Gigante */
          <motion.div
            key="bunker-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center my-auto w-full py-8"
          >
            <div className="w-full flex-1 flex flex-col items-center justify-center scale-105 sm:scale-125 transform transition-all">
              <PomodoroWidget />
            </div>
            <p className="text-xs text-neutral-600 tracking-widest uppercase font-mono mt-8">
              Concentración Total • Sin Notificaciones
            </p>
          </motion.div>
        ) : (
          /* Modo Habitual: Todos los Trackers */
          <motion.div
            key="standard-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
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
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
                <Droplets size={16} /> Hidratación
              </h2>
              <MateTracker />
            </section>

            {/* Fitness: Strava & Gym */}
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
                <Bike size={16} /> Entrenamiento
              </h2>
              <StravaWidget />
              <GymTracker />
            </section>

            {/* Pomodoro */}
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
                <Timer size={16} /> Pomodoro Tracker
              </h2>
              <PomodoroWidget />
            </section>

            {/* Notas Rápidas */}
            <section className="flex flex-col gap-3">
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
                className="w-full h-32 bg-gray-100 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 text-sm text-gray-700 dark:text-zinc-300 resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
