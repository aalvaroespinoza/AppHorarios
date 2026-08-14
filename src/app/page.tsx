"use client";

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Bus, Wallet, Calendar, CheckSquare, Zap, MapPin, 
  ArrowUpRight, Sparkles, Moon, SunMedium, 
  ChevronRight, Kanban, Clock, Shield, ArrowRight, LayoutGrid, CloudSun
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

  // Saludo dinámico según la hora
  const currentHour = new Date().getHours();
  const saludo = currentHour < 12 ? 'Buenos días' : currentHour < 20 ? 'Buenas tardes' : 'Buenas noches';
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
      buttonText: currentEvent.category === 'travel' ? '🚍 Ver Detalle del Viaje' : `🚀 Continuar con ${currentEvent.title}`,
      buttonHref: currentEvent.category === 'travel' ? '/viajes' : '/academia',
      badgeText: 'EN CURSO',
      badgeVariant: 'default',
      accentColor: 'text-cyan-400',
      icon: Sparkles,
    };
  } else if (nextEvent) {
    const isTravel = nextEvent.category === 'travel';
    immediateAction = {
      isRestMode: false,
      title: nextEvent.title || (isTravel ? 'Próxima Salida' : 'Próxima Materia'),
      description: nextEvent.description || 'Prepárate para tu siguiente compromiso.',
      buttonText: isTravel ? '📍 Ver viaje a Córdoba' : `🚀 Ir a ${nextEvent.title}`,
      buttonHref: isTravel ? '/viajes' : '/academia',
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
      buttonText: `🚀 Continuar con ${primeraClase.nombre || 'Cursado'}`,
      buttonHref: '/academia',
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
      buttonText: '📍 Ver viaje a Córdoba',
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
        staggerChildren: 0.05,
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 max-w-md mx-auto flex flex-col gap-4 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* 1. Header de Contexto */}
      <motion.header variants={itemVariants} className="flex flex-col gap-1 mt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            {fechaCapitalizada}
          </span>
          {/* Píldora de Clima: Conecta directamente al Resumen Diario */}
          <Link 
            href="/resumen" 
            className="flex items-center gap-1.5 bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl hover:border-neutral-700 px-3 py-1 rounded-full text-xs font-semibold text-neutral-300 transition-colors shadow-sm"
            title="Ver reporte meteorológico"
          >
            <CloudSun size={13} className="text-cyan-400" />
            <span>Despeñaderos</span>
            {currentTemp !== null && (
              <span className="text-neutral-200 font-bold ml-0.5">• {currentTemp}°</span>
            )}
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
          {saludo}, Alvaro 👋
        </h1>
      </motion.header>

      {/* 2. Acceso al Menú de Aplicaciones (Tarjeta Central Estricta) */}
      <motion.div variants={itemVariants}>
        <Link href="/boveda" className="group block w-full">
          <Card className="w-full flex flex-col overflow-hidden bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl hover:border-neutral-700 rounded-2xl p-3.5 transition-all shadow-sm active:scale-[0.99]">
            <div className="flex items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-neutral-800/80 text-cyan-400 flex items-center justify-center shrink-0 border border-neutral-700/50">
                  <LayoutGrid size={18} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    Menú de Aplicaciones
                  </span>
                  <span className="text-[11px] text-neutral-400 truncate">
                    Bóveda, Kanban, Notas y Herramientas
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-neutral-500 group-hover:text-white transition-colors shrink-0" />
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* 3. Card de Acción Inmediata (Hero Action) */}
      <motion.div variants={itemVariants}>
        <Card className={`w-full flex flex-col overflow-hidden rounded-3xl border p-5 shadow-xl backdrop-blur-xl transition-all ${
          immediateAction.isRestMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-neutral-900/50 border-cyan-500/30'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <immediateAction.icon size={18} className={immediateAction.accentColor} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Acción Inmediata
              </span>
            </div>
            <Badge 
              variant={immediateAction.badgeVariant}
              className={`text-[10px] font-extrabold uppercase tracking-wider ${
                immediateAction.badgeText === 'URGENTE' || immediateAction.badgeText === 'EN CURSO'
                  ? 'bg-cyan-500 text-black'
                  : 'border-neutral-700 text-neutral-300'
              }`}
            >
              {immediateAction.badgeText}
            </Badge>
          </div>

          <div className="flex flex-col gap-0.5 mb-4 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug truncate">
              {immediateAction.title}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
              {immediateAction.description}
            </p>
          </div>

          <Link href={immediateAction.buttonHref} className="w-full block">
            <Button
              className={`w-full min-h-[48px] rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform ${
                immediateAction.isRestMode
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700/50'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
              }`}
            >
              <span className="truncate">{immediateAction.buttonText}</span>
              <ArrowRight size={16} className="shrink-0" />
            </Button>
          </Link>
        </Card>
      </motion.div>

      {/* 4. Grilla de Resumen Armónica (2x2) */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2.5 mt-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 px-1">
          Módulos Principales
        </span>

        <div className="grid grid-cols-2 gap-3">
          {/* Card Viajes */}
          <Link href="/viajes" className="group">
            <Card className="w-full flex flex-col overflow-hidden bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl hover:border-neutral-700 rounded-2xl p-4 justify-between h-full transition-all shadow-sm active:scale-95">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Bus size={16} />
                </div>
                <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-sky-400 transition-colors" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-0.5">
                  Viajes
                </span>
                <span className="text-sm font-bold text-white truncate block">
                  {recomendacionIda?.recomendado ? `${recomendacionIda.recomendado.horaSalida} hs` : 'Ver salidas'}
                </span>
              </div>
            </Card>
          </Link>

          {/* Card Finanzas */}
          <Link href="/finanzas" className="group">
            <Card className="w-full flex flex-col overflow-hidden bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl hover:border-neutral-700 rounded-2xl p-4 justify-between h-full transition-all shadow-sm active:scale-95">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Wallet size={16} />
                </div>
                <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-0.5">
                  Finanzas
                </span>
                <span className="text-base font-extrabold text-white tracking-tight truncate block">
                  {formatoMoneda(finanzas.balanceTotal || 0)}
                </span>
              </div>
            </Card>
          </Link>

          {/* Card Agenda */}
          <Link href="/academia" className="group">
            <Card className="w-full flex flex-col overflow-hidden bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl hover:border-neutral-700 rounded-2xl p-4 justify-between h-full transition-all shadow-sm active:scale-95">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-violet-400 transition-colors" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-0.5">
                  Agenda
                </span>
                <span className="text-sm font-bold text-white truncate block">
                  {materiasDelDia && materiasDelDia.length > 0
                    ? `${materiasDelDia.length} ${materiasDelDia.length === 1 ? 'materia' : 'materias'}`
                    : 'Sin cursado'}
                </span>
              </div>
            </Card>
          </Link>

          {/* Card Kanban */}
          <Link href="/kanban" className="group">
            <Card className="w-full flex flex-col overflow-hidden bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl hover:border-neutral-700 rounded-2xl p-4 justify-between h-full transition-all shadow-sm active:scale-95">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Kanban size={16} />
                </div>
                <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-amber-400 transition-colors" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-0.5">
                  Kanban
                </span>
                <span className="text-base font-bold text-white tracking-tight truncate block">
                  {inProgressTasksCount} <span className="text-xs text-neutral-400 font-normal">en curso</span>
                </span>
              </div>
            </Card>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
