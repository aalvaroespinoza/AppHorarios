"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Bus, Calendar, Wallet, LayoutGrid, Bell, BarChart3 } from 'lucide-react';
import { TAP_ANIMATION } from '@/lib/animations';
import { NotificationInbox } from '@/features/notifications/NotificationInbox';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  isCenter?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: '/viajes', label: 'Viajes', icon: Bus },
  { id: '/academia', label: 'Agenda', icon: Calendar },
  { id: '/', label: 'Inicio', icon: Home, isCenter: true },
  { id: '/estadisticas', label: 'Stats', icon: BarChart3 },
  { id: '/boveda', label: 'Menú', icon: LayoutGrid },
];

export function Navbar() {
  const pathname = usePathname();
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lifeos_notifications');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUnreadCount(parsed.filter((n: any) => !n.read).length);
        } catch (e) {}
      }
    }
  }, [isInboxOpen]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/85 backdrop-blur-lg border-t border-neutral-800 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2 relative">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === '/' 
              ? pathname === '/' 
              : pathname === item.id || (item.id !== '/' && pathname?.startsWith(item.id));

            return (
              <Link
                key={item.id}
                href={item.id}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <motion.div
                  whileTap={TAP_ANIMATION}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div className={`p-1.5 rounded-xl transition-all ${
                    item.isCenter && isActive
                      ? 'text-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                      : isActive
                      ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                      : 'text-neutral-400 group-hover:text-white'
                  }`}>
                    <Icon size={item.isCenter ? 22 : 19} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className={`text-[10px] font-semibold tracking-tight transition-colors ${
                    isActive ? 'text-white font-bold' : 'text-neutral-500 group-hover:text-neutral-300'
                  }`}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {/* Botón de Campanita / Inbox Novu-style */}
          <button
            onClick={() => setIsInboxOpen(true)}
            className="absolute -top-5 right-4 w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white shadow-xl flex items-center justify-center backdrop-blur-xl transition-all active:scale-95 z-50 hover:border-neutral-700"
            title="Bandeja de Notificaciones"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-neutral-950">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
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
