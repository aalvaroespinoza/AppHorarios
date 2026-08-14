"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Bus, Calendar, Wallet, LayoutGrid } from 'lucide-react';
import { TAP_ANIMATION } from '@/lib/animations';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: '/', label: 'Inicio', icon: Home },
  { id: '/horarios', label: 'Viajes', icon: Bus },
  { id: '/academia', label: 'Agenda', icon: Calendar },
  { id: '/finanzas', label: 'Finanzas', icon: Wallet },
  { id: '/boveda', label: 'Menú', icon: LayoutGrid },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-t border-neutral-800 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.id || (item.id !== '/' && pathname?.startsWith(item.id));

          return (
            <Link
              key={item.id}
              href={item.id}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <motion.div
                whileTap={TAP_ANIMATION}
                className="flex flex-col items-center gap-1"
              >
                <div className={`p-1 rounded-xl transition-all ${
                  isActive ? 'text-cyan-400 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'text-neutral-400 group-hover:text-white'
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
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
      </div>
    </nav>
  );
}

export default Navbar;
