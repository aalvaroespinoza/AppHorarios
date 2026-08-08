"use client";

import { motion } from 'framer-motion';
import { 
  Bus, Wallet, CalendarDays, Sparkles, 
  Settings, Info, LayoutGrid, Sun, Zap, CheckSquare, Lock 
} from 'lucide-react';
import Link from 'next/link';
import { PAGE_TRANSITION, SPRING_CONFIG } from '@/lib/animations';

export default function HubPage() {
  const apps = [
    {
      id: 'datos',
      title: 'Datos Secretos',
      href: '/datos-personales',
      icon: <Lock size={28} className="text-rose-400" />,
      color: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
      description: 'Claves e Info'
    },
    {
      id: 'resumen',
      title: 'Resumen Diario',
      href: '/resumen',
      icon: <Sun size={28} className="text-yellow-400" />,
      color: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20',
      description: 'Día a día'
    },
    {
      id: 'focus',
      title: 'Focus & Energía',
      href: '/focus',
      icon: <Zap size={28} className="text-orange-400" />,
      color: 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
      description: 'Rendimiento'
    },
    {
      id: 'tareas',
      title: 'Tareas',
      href: '/tareas',
      icon: <CheckSquare size={28} className="text-indigo-400" />,
      color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
      description: 'Pendientes'
    },
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
      {...PAGE_TRANSITION}
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
              transition={{ delay: i * 0.05, ...SPRING_CONFIG }}
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
