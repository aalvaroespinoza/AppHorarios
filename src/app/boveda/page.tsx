"use client";

import { motion } from 'framer-motion';
import { 
  Bus, Wallet, CalendarDays, Sparkles, 
  Settings, Info, LayoutGrid 
} from 'lucide-react';
import Link from 'next/link';

export default function HubPage() {
  const apps = [
    {
      id: 'viajes',
      title: 'Viajes',
      href: '/',
      icon: <Bus size={28} className="text-blue-400" />,
      color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
      description: 'Colectivos'
    },
    {
      id: 'agenda',
      title: 'Agenda',
      href: '/academia',
      icon: <CalendarDays size={28} className="text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
      description: 'Clases y tareas'
    },
    {
      id: 'finanzas',
      title: 'Finanzas',
      href: '/finanzas',
      icon: <Wallet size={28} className="text-purple-400" />,
      color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
      description: 'Gastos'
    },
    {
      id: 'lifeos',
      title: 'LifeOS',
      href: '/lifeos',
      icon: <Sparkles size={28} className="text-amber-400" />,
      color: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
      description: 'Asistente IA'
    },
    {
      id: 'config',
      title: 'Ajustes',
      href: '/configuracion',
      icon: <Settings size={28} className="text-zinc-400" />,
      color: 'from-zinc-500/20 to-zinc-600/5 border-zinc-500/20',
      description: 'Preferencias'
    },
    {
      id: 'acerca',
      title: 'Acerca de',
      href: '/acerca',
      icon: <Info size={28} className="text-zinc-400" />,
      color: 'from-zinc-500/20 to-zinc-600/5 border-zinc-500/20',
      description: 'App info'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-5 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] pb-24 relative bg-[#0a0a0c]"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex flex-col gap-1.5 mt-2 mb-2">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-2 border border-white/10 shadow-inner">
          <LayoutGrid size={24} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
          Menú
        </h1>
        <p className="text-sm text-zinc-400 font-medium">
          Acceso rápido a todas tus herramientas.
        </p>
      </header>

      {/* Grid de Apps */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {apps.map((app, i) => (
          <Link key={app.id} href={app.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', bounce: 0 }}
              className={`flex flex-col p-4 rounded-3xl bg-gradient-to-br ${app.color} border backdrop-blur-xl shadow-sm hover:shadow-md active:scale-95 active:shadow-inner transition-all duration-200 aspect-square justify-center`}
            >
              <div className="mb-3">
                {app.icon}
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">{app.title}</h2>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">{app.description}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
