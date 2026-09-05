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
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0C] border-t border-zinc-800 pb-safe shadow-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Indicador Minimalista Offline */}
      {isOffline && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-none border border-amber-500 shadow-none flex items-center gap-1.5">
          <WifiOff size={11} />
          <span>OFFLINE // LOCAL IDB</span>
        </div>
      )}

      <div className="flex justify-around items-center h-14 max-w-md mx-auto px-4 relative">
        {/* 1. Viajes */}
        <Link
          href="/"
          className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-1">
            <div className={`p-1 rounded-sm border transition-colors ${
              isViajesActive
                ? 'text-safety-orange bg-safety-orange/15 border-safety-orange/50 shadow-none'
                : 'border-transparent text-zinc-500 group-hover:text-zinc-200'
            }`}>
              <Bus size={18} strokeWidth={isViajesActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider transition-colors ${
              isViajesActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
            }`}>
              VIAJES
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
            <div className={`p-1 rounded-sm border transition-colors ${
              isHorariosActive
                ? 'text-safety-orange bg-safety-orange/15 border-safety-orange/50 shadow-none'
                : 'border-transparent text-zinc-500 group-hover:text-zinc-200'
            }`}>
              <Clock size={18} strokeWidth={isHorariosActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider transition-colors ${
              isHorariosActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
            }`}>
              HORARIOS
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
            <div className={`p-1 rounded-sm border transition-colors ${
              isAulasActive
                ? 'text-safety-orange bg-safety-orange/15 border-safety-orange/50 shadow-none'
                : 'border-transparent text-zinc-500 group-hover:text-zinc-200'
            }`}>
              <GraduationCap size={18} strokeWidth={isAulasActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider transition-colors ${
              isAulasActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
            }`}>
              AULAS
            </span>
          </motion.div>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
