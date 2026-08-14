"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Zap, Timer, PenLine, Droplets, Bike, 
  CheckCircle2, Settings2, HelpCircle, X, RotateCcw 
} from 'lucide-react';
import Link from 'next/link';
import { useLocalStorageState } from '@/core/hooks/useLocalStorageState';
import { BateriaMentalSection } from '@/features/academia/BateriaMentalSection';
import { Button } from '@/components/ui/button';
import { PAGE_TRANSITION } from '@/lib/animations';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

const PomodoroWidget = dynamic(() => import('@/components/PomodoroWidget'), { ssr: false, loading: () => <Skeleton className="h-40 w-full" /> });
const StravaWidget = dynamic(() => import('@/features/focus/StravaWidget').then(m => m.StravaWidget), { ssr: false, loading: () => <Skeleton className="h-24 w-full" /> });
const GymTracker = dynamic(() => import('@/features/focus/GymTracker').then(m => m.GymTracker), { ssr: false, loading: () => <Skeleton className="h-32 w-full" /> });
const MateTracker = dynamic(() => import('@/features/focus/MateTracker').then(m => m.MateTracker), { ssr: false, loading: () => <Skeleton className="h-24 w-full" /> });

export default function FocusPage() {
  const [bunkerMode, setBunkerMode] = useState(false);
  const [notasRapidas, setNotasRapidas] = useLocalStorageState('focus_notas_rapidas', '');
  const [showSaved, setShowSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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

  const handleResetNotes = () => {
    if (!window.confirm('¿Borrar las notas rápidas?')) return;
    setNotasRapidas('');
    setShowSettings(false);
  };

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className={`p-4 max-w-md mx-auto flex flex-col gap-5 min-h-[100dvh] relative text-white transition-colors duration-500 ${
        bunkerMode ? 'bg-black pb-8' : 'bg-[#0a0a0c] pb-28'
      }`}
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
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              {bunkerMode ? 'Búnker Activo 🛡️' : 'Focus Station ⚡'}
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium">
              {bunkerMode ? 'Zero distracciones. Modo Deep Work.' : 'Energía, hidratación y rendimiento.'}
            </p>
          </div>
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
            title="Ajustes"
          >
            <Settings2 size={15} />
          </button>
        </div>
      </header>

      {/* Toggle Button Modo Búnker */}
      <button 
        onClick={() => setBunkerMode(!bunkerMode)} 
        className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-[0.98] ${
          bunkerMode 
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse' 
            : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 hover:border-amber-500/60'
        }`}
      >
        {bunkerMode ? '🔴 SALIR DEL MODO BÚNKER' : '🛡️ ACTIVAR MODO BÚNKER (DEEP WORK)'}
      </button>

      {/* Renderizado Condicional de Modo Búnker */}
      {bunkerMode ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4">
          <button 
            onClick={() => setBunkerMode(false)}
            className="absolute top-8 right-6 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-all"
          >
            🔴 SALIR DEL BÚNKER
          </button>
          <div className="scale-125 sm:scale-150 transform transition-transform w-full max-w-sm flex flex-col items-center">
            <PomodoroWidget />
          </div>
          <p className="text-xs text-neutral-600 tracking-widest uppercase font-mono mt-12">
            Concentración Total • Modo Deep Work
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Batería Mental */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-xs font-bold tracking-widest text-neutral-500 uppercase px-1 flex items-center gap-2">
              <Zap size={14} className="text-amber-400" /> Batería & Energía
            </h2>
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <BateriaMentalSection />
            </motion.div>
          </section>

          {/* Mate Tracker */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-xs font-bold tracking-widest text-neutral-500 uppercase px-1 flex items-center gap-2">
              <Droplets size={14} className="text-cyan-400" /> Hidratación
            </h2>
            <MateTracker />
          </section>

          {/* Fitness: Strava & Gym */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-bold tracking-widest text-neutral-500 uppercase px-1 flex items-center gap-2">
              <Bike size={14} className="text-emerald-400" /> Entrenamiento
            </h2>
            <StravaWidget />
            <GymTracker />
          </section>

          {/* Pomodoro */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-xs font-bold tracking-widest text-neutral-500 uppercase px-1 flex items-center gap-2">
              <Timer size={14} className="text-purple-400" /> Pomodoro Timer
            </h2>
            <PomodoroWidget />
          </section>

          {/* Notas Rápidas */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                <PenLine size={14} className="text-yellow-400" /> Notas Rápidas
              </h2>
              <AnimatePresence>
                {showSaved && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-xs font-bold text-emerald-400 flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} /> Guardado
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <textarea 
              value={notasRapidas}
              onChange={handleNotasChange}
              placeholder="Ideas al vuelo o tareas que no querés olvidar..."
              className="w-full h-28 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3.5 text-xs text-neutral-200 resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </section>
        </div>
      )}

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
                  <Settings2 size={16} className="text-amber-400" /> Ajustes de Focus & Búnker
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                El Modo Búnker aísla la pantalla para eliminar cualquier distracción mientras estudiás o programás.
              </p>

              <Button
                onClick={handleResetNotes}
                variant="destructive"
                className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Limpiar Notas Rápidas</span>
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
                  <HelpCircle size={16} className="text-amber-400" /> ¿Cómo usar Focus Station?
                </h2>
                <button onClick={() => setShowHelp(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <li>• <strong>Modo Búnker</strong>: Toca el botón superior para entrar en pantalla completa inmersiva de concentración.</li>
                <li>• <strong>Batería Mental</strong>: Registra tu nivel de cansancio para que el co-piloto te sugiera descansos.</li>
                <li>• <strong>Hidratación & Gym</strong>: Mantené el registro de mates y entrenamientos sincronizados.</li>
              </ul>

              <Button
                onClick={() => setShowHelp(false)}
                className="w-full mt-2 text-xs font-bold rounded-xl bg-amber-500 text-black hover:bg-amber-400"
              >
                Entendido
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
