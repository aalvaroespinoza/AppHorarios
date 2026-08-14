"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Bus, Calendar, LayoutGrid, Bell, Search, WifiOff } from 'lucide-react';
import { TAP_ANIMATION } from '@/lib/animations';
import { NotificationInbox } from '@/features/notifications/NotificationInbox';
import { syncEngine } from '@/core/sync/engine';

export function Navbar() {
  const pathname = usePathname();
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  const handleOpenCommandPalette = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/85 backdrop-blur-lg border-t border-neutral-800 pb-safe">
        {/* Indicador Minimalista Offline */}
        {isOffline && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md">
            <WifiOff size={11} />
            <span>Modo Offline • Guardando en IDB</span>
          </div>
        )}

        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1 relative">
          {/* 1. Viajes */}
          <Link
            href="/viajes"
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-0.5">
              <div className={`p-1.5 rounded-xl transition-all ${
                pathname?.startsWith('/viajes')
                  ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-neutral-400 group-hover:text-white'
              }`}>
                <Bus size={18} strokeWidth={pathname?.startsWith('/viajes') ? 2.5 : 1.8} />
              </div>
              <span className={`text-[9px] sm:text-[10px] font-semibold tracking-tight transition-colors ${
                pathname?.startsWith('/viajes') ? 'text-white font-bold' : 'text-neutral-500 group-hover:text-neutral-300'
              }`}>
                Viajes
              </span>
            </motion.div>
          </Link>

          {/* 2. Agenda */}
          <Link
            href="/academia"
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-0.5">
              <div className={`p-1.5 rounded-xl transition-all ${
                pathname?.startsWith('/academia') || pathname?.startsWith('/tareas')
                  ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-neutral-400 group-hover:text-white'
              }`}>
                <Calendar size={18} strokeWidth={pathname?.startsWith('/academia') ? 2.5 : 1.8} />
              </div>
              <span className={`text-[9px] sm:text-[10px] font-semibold tracking-tight transition-colors ${
                pathname?.startsWith('/academia') || pathname?.startsWith('/tareas') ? 'text-white font-bold' : 'text-neutral-500 group-hover:text-neutral-300'
              }`}>
                Agenda
              </span>
            </motion.div>
          </Link>

          {/* 3. Inicio (Center) */}
          <Link
            href="/"
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-0.5">
              <div className={`p-1.5 rounded-xl transition-all ${
                pathname === '/'
                  ? 'text-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-neutral-400 group-hover:text-white'
              }`}>
                <Home size={20} strokeWidth={pathname === '/' ? 2.5 : 1.8} />
              </div>
              <span className={`text-[9px] sm:text-[10px] font-semibold tracking-tight transition-colors ${
                pathname === '/' ? 'text-white font-bold' : 'text-neutral-500 group-hover:text-neutral-300'
              }`}>
                Inicio
              </span>
            </motion.div>
          </Link>

          {/* 4. Command Palette / Buscar (Raycast Trigger) */}
          <button
            onClick={handleOpenCommandPalette}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            title="Buscar o Ejecutar Comando (Ctrl+K)"
          >
            <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-0.5">
              <div className="p-1.5 rounded-xl text-neutral-400 group-hover:text-cyan-400 transition-all">
                <Search size={18} strokeWidth={1.8} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-tight text-neutral-500 group-hover:text-neutral-300">
                Buscar
              </span>
            </motion.div>
          </button>

          {/* 5. Avisos / Notificaciones */}
          <button
            onClick={() => setIsInboxOpen(true)}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            title="Bandeja de Notificaciones"
          >
            <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-0.5">
              <div className="p-1.5 rounded-xl text-neutral-400 group-hover:text-white transition-all relative">
                <Bell size={18} strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white shadow-sm ring-2 ring-neutral-950 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-tight text-neutral-500 group-hover:text-neutral-300">
                Avisos
              </span>
            </motion.div>
          </button>

          {/* 6. Menú / Bóveda */}
          <Link
            href="/boveda"
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <motion.div whileTap={TAP_ANIMATION} className="flex flex-col items-center gap-0.5">
              <div className={`p-1.5 rounded-xl transition-all ${
                pathname?.startsWith('/boveda') || pathname?.startsWith('/configuracion')
                  ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-neutral-400 group-hover:text-white'
              }`}>
                <LayoutGrid size={18} strokeWidth={pathname?.startsWith('/boveda') ? 2.5 : 1.8} />
              </div>
              <span className={`text-[9px] sm:text-[10px] font-semibold tracking-tight transition-colors ${
                pathname?.startsWith('/boveda') || pathname?.startsWith('/configuracion') ? 'text-white font-bold' : 'text-neutral-500 group-hover:text-neutral-300'
              }`}>
                Menú
              </span>
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* Bandeja de Notificaciones Slide-over / Bottom Sheet */}
      <NotificationInbox 
        isOpen={isInboxOpen} 
        onClose={() => setIsInboxOpen(false)} 
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
}

export default Navbar;
