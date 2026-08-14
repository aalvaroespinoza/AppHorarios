"use client";

import { motion } from 'framer-motion';
import { 
  Bus, Wallet, CalendarDays, Sparkles, 
  Settings, Info, LayoutGrid, Sun, Zap, CheckSquare, Lock, BookOpen, FileText, ChevronLeft, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { PAGE_TRANSITION, SPRING_CONFIG } from '@/lib/animations';

export default function HubPage() {
  const apps = [
    {
      id: 'viajes',
      title: 'Viajes & Colectivos',
      href: '/viajes',
      icon: <Bus size={28} className="text-blue-400" />,
      color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
      description: 'Detección de Bus'
    },
    {
      id: 'finanzas',
      title: 'Finanzas',
      href: '/finanzas',
      icon: <Wallet size={28} className="text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
      description: 'Presupuesto y Gastos'
    },
    {
      id: 'agenda',
      title: 'Agenda & Cursado',
      href: '/academia',
      icon: <CalendarDays size={28} className="text-purple-400" />,
      color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
      description: 'Clases y Horarios'
    },
    {
      id: 'kanban',
      title: 'Tablero Kanban',
      href: '/kanban',
      icon: <LayoutGrid size={28} className="text-sky-400" />,
      color: 'from-sky-500/20 to-sky-600/5 border-sky-500/20',
      description: 'Gestión de Tareas'
    },
    {
      id: 'notas',
      title: 'Notas & Bóveda',
      href: '/notas',
      icon: <FileText size={28} className="text-teal-400" />,
      color: 'from-teal-500/20 to-teal-600/5 border-teal-500/20',
      description: 'Bloques Notion'
    },
    {
      id: 'focus',
      title: 'Focus & Búnker',
      href: '/focus',
      icon: <Zap size={28} className="text-amber-400" />,
      color: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
      description: 'Modo Deep Work'
    },
    {
      id: 'resumen',
      title: 'Resumen Diario',
      href: '/resumen',
      icon: <Sun size={28} className="text-yellow-400" />,
      color: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20',
      description: 'Clima y Batería'
    },
    {
      id: 'tareas',
      title: 'Time-Blocking',
      href: '/tareas',
      icon: <CheckSquare size={28} className="text-indigo-400" />,
      color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
      description: 'Bloques 24 Horas'
    },
    {
      id: 'datos',
      title: 'Datos Secretos',
      href: '/datos-personales',
      icon: <Lock size={28} className="text-rose-400" />,
      color: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
      description: 'Claves e Info'
    },
    {
      id: 'lecturas',
      title: 'Lecturas',
      href: '/lecturas',
      icon: <BookOpen size={28} className="text-cyan-400" />,
      color: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
      description: 'Recursos y Libros'
    },
    {
      id: 'ayuda',
      title: 'Centro de Ayuda',
      href: '/ayuda',
      icon: <HelpCircle size={28} className="text-cyan-400" />,
      color: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
      description: 'Guías y Manual'
    },
    {
      id: 'lifeos',
      title: 'LifeOS Asistente',
      href: '/lifeos',
      icon: <Sparkles size={28} className="text-orange-400" />,
      color: 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
      description: 'Dictado IA'
    },
    {
      id: 'config',
      title: 'Ajustes',
      href: '/configuracion',
      icon: <Settings size={28} className="text-zinc-400" />,
      color: 'from-zinc-500/20 to-zinc-600/5 border-zinc-500/20',
      description: 'Preferencias'
    },
  ];

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-5 max-w-md mx-auto flex flex-col gap-5 min-h-[100dvh] pb-28 relative bg-[#0a0a0c]"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* Header con botón atrás hacia Inicio */}
      <header className="flex items-center justify-between mt-1 mb-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm"
            title="Volver a Inicio"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              Menú de Apps
            </h1>
            <p className="text-xs text-neutral-400 font-medium">
              Ecosistema completo de herramientas
            </p>
          </div>
        </div>
      </header>

      {/* Grid de Apps */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {apps.map((app, i) => (
          <Link key={app.id} href={app.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, ...SPRING_CONFIG }}
              className={`flex flex-col p-4 rounded-3xl bg-gradient-to-br ${app.color} border backdrop-blur-xl shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 aspect-square justify-center`}
            >
              <div className="mb-2.5">
                {app.icon}
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-snug">{app.title}</h2>
              <span className="text-[10px] font-semibold text-white/70 dark:text-neutral-400 uppercase tracking-wider mt-0.5">{app.description}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
