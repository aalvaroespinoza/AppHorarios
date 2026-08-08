"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Timer, DollarSign, LayoutGrid, Settings, Info, Mic, KeyRound } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { useFinanzas } from '@/hooks/useFinanzas';
import type { useAgenda } from '@/hooks/useAgenda';
import { SPRING_CONFIG } from '@/lib/animations';

// Importación perezosa de los widgets pesados
const PomodoroWidget = dynamic(() => import('@/components/PomodoroWidget'), { ssr: false });
const FinanzasRapidasWidget = dynamic(() => import('./FinanzasWidget'), { ssr: false });
const VoiceRecorder = dynamic(() => import('./VoiceRecorder'), { ssr: false });

export function FloatingActions({ finanzas, agenda }: { finanzas: ReturnType<typeof useFinanzas>, agenda: ReturnType<typeof useAgenda> }) {
  const [showMenu, setShowMenu] = useState(false);
  
  // Vistas activas dentro del popover
  const [activeView, setActiveView] = useState<'menu' | 'pomodoro' | 'finanzas' | 'mic'>('menu');

  const closePopover = () => {
    setShowMenu(false);
    setTimeout(() => setActiveView('menu'), 300); // reset after exit animation
  };

  return (
    <>
      {/* Floating Top Right Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-40" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
        <button 
          onClick={() => { setShowMenu(true); setActiveView('mic'); }}
          className="w-10 h-10 bg-blue-600 border border-blue-500/50 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-900/20 active:scale-90 transition-all hover:bg-blue-500"
        >
          <Mic size={20} />
        </button>
        <button 
          onClick={() => { setShowMenu(true); setActiveView('menu'); }}
          className="w-10 h-10 bg-zinc-800/80 backdrop-blur border border-zinc-700/50 rounded-full flex items-center justify-center text-zinc-300 shadow-lg active:scale-90 transition-all hover:bg-zinc-700"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Popovers Dinámicos */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-transparent"
              onClick={closePopover}
            />
            <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={SPRING_CONFIG}
            className="absolute top-16 right-4 z-50 w-72 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-4 shadow-2xl overflow-hidden"
          >
            {activeView === 'menu' && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-2 px-1">
                  <h3 className="text-zinc-300 font-bold text-sm">Menú de Accesos</h3>
                  <button onClick={closePopover} className="text-zinc-500 hover:text-white p-1"><X size={16}/></button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => setActiveView('pomodoro')}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-colors text-left"
                  >
                    <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400"><Timer size={18} /></div>
                    <span className="font-medium text-sm text-zinc-200 flex-1">Pomodoro</span>
                  </button>

                  <button 
                    onClick={() => setActiveView('finanzas')}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-colors text-left"
                  >
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><DollarSign size={18} /></div>
                    <span className="font-medium text-sm text-zinc-200 flex-1">Finanzas Rápidas</span>
                  </button>

                  <Link href="/horarios" className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-colors">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><LayoutGrid size={18} /></div>
                    <span className="font-medium text-sm text-zinc-200 flex-1">Horarios Completos</span>
                  </Link>

                  <Link href="/boveda" className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-colors">
                    <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400"><KeyRound size={18} /></div>
                    <span className="font-medium text-sm text-zinc-200 flex-1">Bóveda de Datos</span>
                  </Link>

                  <Link href="/configuracion" className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-colors">
                    <div className="bg-zinc-700/50 p-2 rounded-lg text-zinc-400"><Settings size={18} /></div>
                    <span className="font-medium text-sm text-zinc-200 flex-1">Ajustes</span>
                  </Link>
                  
                  <Link href="/acerca" className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-colors">
                    <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Info size={18} /></div>
                    <span className="font-medium text-sm text-zinc-200 flex-1">Acerca de</span>
                  </Link>
                </div>
              </div>
            )}

            {activeView === 'pomodoro' && (
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <h3 className="text-zinc-300 font-bold text-sm">Pomodoro</h3>
                  <button onClick={closePopover} className="text-zinc-500 hover:text-white p-1"><X size={16}/></button>
                </div>
                <PomodoroWidget />
              </div>
            )}

            {activeView === 'finanzas' && (
              <FinanzasRapidasWidget finanzas={finanzas} onClose={closePopover} />
            )}

            {activeView === 'mic' && (
              <VoiceRecorder agenda={agenda} onClose={closePopover} />
            )}
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
