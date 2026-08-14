"use client";

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Bus, Wallet, Calendar, CheckSquare, Zap, MapPin, 
  ArrowUpRight, Sparkles, Moon, SunMedium, 
  ChevronRight, Kanban, Clock, Shield, ArrowRight, LayoutGrid, CloudSun
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContextEngine } from '@/core/hooks/useContextEngine';
import { useFinanzas } from '@/hooks/useFinanzas';
import { useTodaySchedule } from '@/hooks/useTodaySchedule';
import { useEscenario } from '@/hooks/useEscenario';
import { weatherService } from '@/core/services/weather/weather.service';
import type { Task } from '@/types/task';

interface ImmediateActionConfig {
  isRestMode: boolean;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  badgeText: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  accentColor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export default function InicioHubPage() {
  const contextSnapshot = useContextEngine();
  const finanzas = useFinanzas();
  const { diaSeleccionado } = useEscenario();
  const {
    materiasDelDia,
    isToday,
    recomendacionIda,
    recomendacionVuelta
  } = useTodaySchedule();

  const [inProgressTasksCount, setInProgressTasksCount] = useState(0);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);

  useEffect(() => {
    // Leer tareas en progreso desde localStorage
    const storedKanban = localStorage.getItem('lifeos_kanban_tasks');
    if (storedKanban) {
      try {
        const parsed: Task[] = JSON.parse(storedKanban);
        setInProgressTasksCount(parsed.filter(t => t.status === 'in-progress').length);
      } catch (e) {}
    }

    // Obtener clima de Despeñaderos
    weatherService.getWeather('despenaderos')
      .then(w => setCurrentTemp(Math.round(w.current.temperature)))
      .catch(() => setCurrentTemp(null));
  }, []);

  const fechaHoy = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const fechaCapitalizada = fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1);

  // Determinar la Acción Inmediata
  const nextEvent = contextSnapshot?.nextActionableEvent;
  const currentEvent = contextSnapshot?.currentEvents?.[0];

  let immediateAction: ImmediateActionConfig = {
    isRestMode: true,
    title: 'Modo Descanso',
    description: 'Sin compromisos urgentes para este momento.',
    buttonText: '🛡️ Activar Modo Búnker',
    buttonHref: '/focus',
    badgeText: 'Libre',
    badgeVariant: 'secondary',
    accentColor: 'text-neutral-400',
    icon: Moon,
  };

  if (currentEvent) {
    immediateAction = {
      isRestMode: false,
      title: currentEvent.title || 'Evento en Curso',
      description: currentEvent.description || 'Actividad en desarrollo ahora mismo.',
      buttonText: currentEvent.category === 'travel' ? 'Ver Detalle del Viaje' : `Continuar con ${currentEvent.title}`,
      buttonHref: currentEvent.category === 'travel' ? '/viajes' : '/viajes#seccion-cursado',
      badgeText: 'EN CURSO',
      badgeVariant: 'default',
      accentColor: 'text-emerald-400',
      icon: Sparkles,
    };
  } else if (nextEvent) {
    const isTravel = nextEvent.category === 'travel';
    immediateAction = {
      isRestMode: false,
      title: nextEvent.title || (isTravel ? 'Próxima Salida' : 'Próxima Materia'),
      description: nextEvent.description || 'Prepárate para tu siguiente compromiso.',
      buttonText: isTravel ? 'Ver Viaje a Córdoba' : `Ir a ${nextEvent.title}`,
      buttonHref: isTravel ? '/viajes' : '/viajes#seccion-cursado',
      badgeText: nextEvent.priority === 'critical' ? 'URGENTE' : 'PRÓXIMO',
      badgeVariant: 'default',
      accentColor: 'text-cyan-400',
      icon: isTravel ? Bus : Sparkles,
    };
  } else if (materiasDelDia && materiasDelDia.length > 0 && isToday) {
    const primeraClase = materiasDelDia[0];
    immediateAction = {
      isRestMode: false,
      title: primeraClase.nombre || 'Clase de Hoy',
      description: `Aula ${primeraClase.aula || 'Central'} • ${primeraClase.horaInicio || '08:00'} hs`,
      buttonText: `Continuar con ${primeraClase.nombre || 'Cursado'}`,
      buttonHref: '/viajes#seccion-cursado',
      badgeText: 'HOY',
      badgeVariant: 'secondary',
      accentColor: 'text-emerald-400',
      icon: Sparkles,
    };
  } else if (recomendacionIda?.recomendado) {
    immediateAction = {
      isRestMode: false,
      title: 'Viaje hacia Córdoba',
      description: `Salida recomendada a las ${recomendacionIda.recomendado.horaSalida} hs`,
      buttonText: 'Ver Viaje a Córdoba',
      buttonHref: '/viajes',
      badgeText: 'TRANSPORTE',
      badgeVariant: 'default',
      accentColor: 'text-cyan-400',
      icon: Bus,
    };
  }

  const formatoMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Variantes para cascada / stagger
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.02
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-24 px-4 pt-12 flex flex-col gap-6 bg-[#0a0a0c] text-white max-w-md mx-auto"
    >
      {/* SECCIÓN 1: Header (Contexto) */}
      <motion.header variants={itemVariants} className="px-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Hola, Alvaro
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Resumen de hoy • {fechaCapitalizada}
          </p>
        </div>

        <Link
          href="/resumen"
          className="flex items-center gap-1.5 bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xl px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:border-neutral-700 transition-colors shadow-sm"
          title="Ver reporte meteorológico"
        >
          <CloudSun size={14} className="text-cyan-400" />
          <span>{currentTemp !== null ? `${currentTemp}°` : 'Clima'}</span>
        </Link>
      </motion.header>

      {/* SECCIÓN 2: Hero Card (Acción Inmediata) */}
      <motion.div variants={itemVariants}>
        <div className="w-full bg-neutral-900/40 border border-neutral-800/60 rounded-[32px] p-6 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${immediateAction.isRestMode ? 'bg-neutral-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {immediateAction.badgeText || 'Acción Prioritaria'}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-bold border-neutral-800 text-neutral-400">
              {immediateAction.isRestMode ? 'Descanso' : 'En Vivo'}
            </Badge>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {immediateAction.title}
            </h2>
            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
              {immediateAction.description}
            </p>
          </div>

          <Link href={immediateAction.buttonHref} className="w-full block mt-1">
            <Button
              className="w-full h-12 rounded-[20px] font-bold text-xs sm:text-sm bg-white hover:bg-neutral-200 text-black flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
            >
              <span className="truncate">{immediateAction.buttonText}</span>
              <ArrowRight size={16} className="shrink-0" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* SECCIÓN 3: Bento Grid (Módulos Secundarios) */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 px-2">
          Módulos Principales
        </span>

        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta Finanzas */}
          <Link href="/finanzas" className="block group">
            <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between hover:bg-neutral-800/50 transition-all shadow-md active:scale-95">
              <div className="flex items-center justify-between">
                <span className="text-2xl">💸</span>
                <ArrowUpRight size={15} className="text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 font-medium mb-1">Presupuesto</p>
                <p className="text-lg font-bold text-white truncate">
                  {formatoMoneda(finanzas.balanceTotal || 0)}
                </p>
              </div>
            </div>
          </Link>

          {/* Tarjeta Kanban / Tareas */}
          <Link href="/kanban" className="block group">
            <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between hover:bg-neutral-800/50 transition-all shadow-md active:scale-95">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📋</span>
                <ArrowUpRight size={15} className="text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 font-medium mb-1">En Curso</p>
                <p className="text-lg font-bold text-white truncate">
                  {inProgressTasksCount} {inProgressTasksCount === 1 ? 'Tarea' : 'Tareas'}
                </p>
              </div>
            </div>
          </Link>

          {/* Tarjeta Agenda / Cursado */}
          <Link href="/academia" className="block group">
            <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between hover:bg-neutral-800/50 transition-all shadow-md active:scale-95">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📚</span>
                <ArrowUpRight size={15} className="text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 font-medium mb-1">Cursado Hoy</p>
                <p className="text-lg font-bold text-white truncate">
                  {materiasDelDia && materiasDelDia.length > 0 
                    ? `${materiasDelDia.length} ${materiasDelDia.length === 1 ? 'materia' : 'materias'}` 
                    : 'Sin clases'}
                </p>
              </div>
            </div>
          </Link>

          {/* Tarjeta Bóveda / Menú */}
          <Link href="/boveda" className="block group">
            <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between hover:bg-neutral-800/50 transition-all shadow-md active:scale-95">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🗄️</span>
                <ArrowUpRight size={15} className="text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 font-medium mb-1">Bóveda</p>
                <p className="text-lg font-bold text-white truncate">
                  Menú de Apps
                </p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.main>
  );
}
