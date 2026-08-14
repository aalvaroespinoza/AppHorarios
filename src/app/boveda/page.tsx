"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Bus, Wallet, CalendarDays, Sparkles, 
  Settings, Info, LayoutGrid, Sun, Zap, CheckSquare, Lock, BookOpen, FileText, ChevronLeft, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { PAGE_TRANSITION, SPRING_CONFIG } from '@/lib/animations';

function BovedaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const subject = searchParams.get('subject');
    if (subject) {
      router.replace(`/notas?subject=${encodeURIComponent(subject)}`);
    }
  }, [searchParams, router]);

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
      id: 'configuracion',
      title: 'Configuración',
      href: '/configuracion',
      icon: <Settings size={28} className="text-neutral-400" />,
      color: 'from-neutral-500/20 to-neutral-600/5 border-neutral-500/20',
      description: 'Ajustes del Sistema'
    }
  ];

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mt-1 px-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm active:scale-95"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Bóveda <Sparkles size={17} className="text-cyan-400" />
            </h1>
            <p className="text-xs text-neutral-400 font-medium">Centro de Módulos & Apps</p>
          </div>
        </div>

        <Link 
          href="/configuracion"
          className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm active:scale-95"
        >
          <Settings size={18} />
        </Link>
      </header>

      {/* Grid de Apps y Módulos */}
      <div className="grid grid-cols-2 gap-3.5 px-1">
        {apps.map((app) => (
          <Link
            key={app.id}
            href={app.href}
            className="group block"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING_CONFIG}
              className={`h-full p-4 rounded-3xl bg-gradient-to-br ${app.color} border backdrop-blur-xl shadow-lg flex flex-col justify-between gap-3 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-neutral-950/60 border border-white/5 backdrop-blur-sm shadow-inner">
                  {app.icon}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors leading-tight">
                  {app.title}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                  {app.description}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export default function HubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c]" />}>
      <BovedaContent />
    </Suspense>
  );
}
