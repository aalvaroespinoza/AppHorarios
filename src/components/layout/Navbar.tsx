"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bus, Clock, GraduationCap, WifiOff } from 'lucide-react';
import { TAP_ANIMATION } from '@/lib/animations';
import { syncEngine } from '@/core/sync/engine';

export function Navbar() {
  const pathname = usePathname();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      syncEngine.processQueue();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isViajesActive = pathname === '/' || pathname?.startsWith('/viajes');
  const isHorariosActive = pathname?.startsWith('/horarios');
  const isAulasActive = pathname?.startsWith('/aulas') || pathname?.startsWith('/configuracion/materias');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/80 pb-safe">
      {/* Indicador Minimalista Offline */}
      {isOffline && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md">
          <WifiOff size={11} />
          <span>Modo Offline • Guardando en IDB</span>
        </div>
      )}

      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4 relative">
        {/* 1. Viajes */}
        <Link
          href="/"
          className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-1">
            <div className={`p-1.5 rounded-xl transition-all ${
              isViajesActive
                ? 'text-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-neutral-400 group-hover:text-white'
            }`}>
              <Bus size={20} strokeWidth={isViajesActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[10px] font-bold tracking-tight transition-colors ${
              isViajesActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
            }`}>
              Viajes
            </span>
          </motion.div>
        </Link>

        {/* 2. Horarios de Colectivos */}
        <Link
          href="/horarios"
          className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-1">
            <div className={`p-1.5 rounded-xl transition-all ${
              isHorariosActive
                ? 'text-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-neutral-400 group-hover:text-white'
            }`}>
              <Clock size={20} strokeWidth={isHorariosActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[10px] font-bold tracking-tight transition-colors ${
              isHorariosActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
            }`}>
              Horarios
            </span>
          </motion.div>
        </Link>

        {/* 3. Gestión de Aulas y Materias */}
        <Link
          href="/aulas"
          className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-1">
            <div className={`p-1.5 rounded-xl transition-all ${
              isAulasActive
                ? 'text-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-neutral-400 group-hover:text-white'
            }`}>
              <GraduationCap size={20} strokeWidth={isAulasActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[10px] font-bold tracking-tight transition-colors ${
              isAulasActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
            }`}>
              Aulas
            </span>
          </motion.div>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
