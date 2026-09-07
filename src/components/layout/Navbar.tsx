"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Bus, Clock, GraduationCap, WifiOff } from 'lucide-react';
import { syncEngine } from '@/core/sync/engine';

const tabs = [
  { href: '/', label: 'Viajes', Icon: Bus },
  { href: '/horarios', label: 'Horarios', Icon: Clock },
  { href: '/aulas', label: 'Aulas', Icon: GraduationCap },
];

export function Navbar() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const refresh = () => {
      setOffline(!navigator.onLine);
      if (navigator.onLine) void syncEngine.processQueue();
    };
    refresh();
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
    };
  }, []);
  const active = pathname.startsWith('/aulas') || pathname.startsWith('/configuracion/materias')
    ? '/aulas' : pathname.startsWith('/horarios') ? '/horarios' : pathname === '/' || pathname.startsWith('/viajes') ? '/' : '';

  return (
    <nav aria-label="Navegación principal" className="fixed z-40 inset-x-4 mx-auto max-w-[448px]"
      style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      {offline && <div role="status" className="mx-auto mb-2 w-fit rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-subtle flex items-center gap-2">
        <WifiOff size={14} /> Sin conexión · Datos locales
      </div>}
      <div className="glass-toolbar rounded-[30px] grid grid-cols-3 p-1.5 gap-1">
        {tabs.map(({ href, label, Icon }) => {
          const selected = active === href;
          return (
            <Link key={href} href={href} aria-current={selected ? 'page' : undefined}
              className="relative flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-[24px] px-2 py-2">
              {selected && <motion.span layoutId="nav-selection" transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 35 }}
                className="absolute inset-0 rounded-[24px] aurora-border" />}
              <Icon aria-hidden size={21} strokeWidth={selected ? 2.3 : 1.8} className={`relative ${selected ? 'text-accent' : 'text-subtle'}`} />
              <span className={`relative text-xs ${selected ? 'text-ink font-semibold' : 'text-subtle'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
export default Navbar;
