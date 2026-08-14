"use client";

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Bus, Wallet, Calendar, CheckSquare, Zap, MapPin, 
  ArrowUpRight, Sparkles, Moon, SunMedium, 
  ChevronRight, Kanban, Clock, Shield, ArrowRight
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

export default function RootDashboard() {
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Leer tareas en progreso desde localStorage
    const storedKanban = localStorage.getItem('lifeos_kanban_tasks');
    if (storedKanban) {
      try {
        const parsed: Task[] = JSON.parse(storedKanban);
        setInProgressTasksCount(parsed.filter(t => t.status === 'in-progress').length);
      } catch (e) {}
    }

    // Clima rápido
    weatherService.getWeather('despenaderos')
      .then(w => setCurrentTemp(Math.round(w.current.temperature)))
      .catch(() => setCurrentTemp(null));
  }, []);

  if (!isMounted) {
    return <div className="min-h-[100dvh] bg-[#0a0a0c]" />;
  }

  // Saludo dinámico según la hora
  const currentHour = new Date().getHours();
  const saludo = currentHour < 12 ? 'Buenos días' : currentHour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const fechaHoy = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const fechaCapitalizada = fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1);

  // Determinar la Acción Inmediata
  const nextEvent = contextSnapshot?.nextActionableEvent;
  const currentEvent = contextSnapshot?.currentEvents?.[0];

  let immediateAction = {
    isRestMode: false,
    title: 'Modo Descanso',
    description: 'Sin cursado ni viajes urgentes para este momento.',
    buttonText: '🛡️ Activar Modo Búnker',
    buttonHref: '/focus',
    badgeText: 'Libre',
    badgeVariant: 'secondary' as const,
    accentColor: 'text-neutral-400',
    icon: Moon,
  };

  if (currentEvent) {
    immediateAction = {
      isRestMode: false,
      title: currentEvent.title || 'Evento en Curso',
      description: currentEvent.description || 'Actividad en desarrollo ahora mismo.',
      buttonText: currentEvent.category === 'travel' ? '🚍 Ver Detalle del Viaje' : `🚀 Continuar con ${currentEvent.title}`,
      buttonHref: currentEvent.category === 'travel' ? '/horarios' : '/academia',
      badgeText: 'EN CURSO',
      badgeVariant: 'default' as const,
      accentColor: 'text-cyan-400',
      icon: Sparkles,
    };
  } else if (nextEvent) {
    const isTravel = nextEvent.category === 'travel';
    immediateAction = {
      isRestMode: false,
      title: nextEvent.title || (isTravel ? 'Próxima Salida' : 'Próxima Materia'),
      description: nextEvent.description || 'Prepárate para tu siguiente compromiso.',
      buttonText: isTravel ? '📍 Ver viajes a Córdoba' : `🚀 Ir a ${nextEvent.title}`,
      buttonHref: isTravel ? '/horarios' : '/academia',
      badgeText: nextEvent.priority === 'critical' ? 'URGENTE' : 'PRÓXIMO',
      badgeVariant: 'default' as const,
      accentColor: 'text-cyan-400',
      icon: isTravel ? Bus : Sparkles,
    };
  } else if (materiasDelDia && materiasDelDia.length > 0 && isToday) {
    const primeraClase = materiasDelDia[0];
    immediateAction = {
      isRestMode: false,
      title: primeraClase.nombre || primeraClase.name || 'Clase de Hoy',
      description: `Aula ${primeraClase.aula || 'Central'} • ${primeraClase.horaInicio || '08:00'} hs`,
      buttonText: `🚀 Continuar con ${primeraClase.nombre || 'Cursado'}`,
      buttonHref: '/academia',
      badgeText: 'HOY',
      badgeVariant: 'secondary' as const,
      accentColor: 'text-emerald-400',
      icon: Sparkles,
    };
  } else if (recomendacionIda?.recomendado) {
    immediateAction = {
      isRestMode: false,
      title: 'Viaje a Córdoba',
      description: `Salida recomendada a las ${recomendacionIda.recomendado.horaSalida} hs`,
      buttonText: '📍 Ver viajes a Córdoba',
      buttonHref: '/horarios',
      badgeText: 'TRANSPORTE',
      badgeVariant: 'default' as const,
      accentColor: 'text-cyan-400',
      icon: Bus,
    };
  } else {
    immediateAction.isRestMode = true;
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
        staggerChildren: 0.08,
        delayChildren: 0.04
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 max-w-md mx-auto flex flex-col gap-5 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* 1. Header de Contexto */}
      <motion.header variants={itemVariants} className="flex flex-col gap-1 mt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            {fechaCapitalizada}
          </span>
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-400">
            <MapPin size={12} className="text-cyan-400" />
            <span>Despeñaderos</span>
            {currentTemp !== null && (
              <span className="text-neutral-300 ml-0.5 font-bold">• {currentTemp}°</span>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white mt-1">
          {saludo}, Alvaro 👋
        </h1>
        <p className="text-xs text-neutral-400 font-medium">
          Hub central y co-piloto de actividades.
        </p>
      </motion.header>

      {/* 2. Card de Acción Inmediata (Hero Action) */}
      <motion.div variants={itemVariants}>
        <Card className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-md transition-all ${
          immediateAction.isRestMode
            ? 'bg-neutral-900/60 border-neutral-800/80'
            : 'bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-cyan-950/30 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <immediateAction.icon size={20} className={immediateAction.accentColor} />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Acción Inmediata
              </span>
            </div>
            <Badge 
              variant={immediateAction.badgeVariant}
              className={`text-[10px] font-extrabold uppercase tracking-wider ${
                immediateAction.badgeText === 'URGENTE' || immediateAction.badgeText === 'EN CURSO'
                  ? 'bg-cyan-500 text-black animate-pulse'
                  : 'border-neutral-700 text-neutral-300'
              }`}
            >
              {immediateAction.badgeText}
            </Badge>
          </div>

          <div className="flex flex-col gap-1 mb-5">
            <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
              {immediateAction.title}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {immediateAction.description}
            </p>
          </div>

          {/* Botón táctil grande (mínimo 50px de altura) */}
          <Link href={immediateAction.buttonHref} className="w-full block">
            <Button
              className={`w-full min-h-[50px] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform ${
                immediateAction.isRestMode
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/25'
              }`}
            >
              <span>{immediateAction.buttonText}</span>
              <ArrowRight size={18} />
            </Button>
          </Link>
        </Card>
      </motion.div>

      {/* 3. Grilla de Resumen Consolidada (Finanzas, Agenda, Kanban, Búnker) */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-1">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 px-1">
          Módulos y Estado
        </span>

        <div className="grid grid-cols-2 gap-3">
          {/* Card Finanzas */}
          <Link href="/finanzas" className="group">
            <Card className="bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4.5 flex flex-col justify-between h-full transition-all shadow-sm active:scale-95">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Wallet size={16} />
                </div>
                <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-purple-400 transition-colors" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-0.5">
                  Finanzas
                </span>
                <span className="text-base font-extrabold text-white tracking-tight">
                  {formatoMoneda(finanzas.balanceTotal)}
                </span>
              </div>
            </Card>
          </Link>

          {/* Card Agenda / Cursado */}
          <Link href="/academia" className="group">
            <Card className="bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4.5 flex flex-col justify-between h-full transition-all shadow-sm active:scale-95">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-0.5">
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
            <Card className="bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4.5 flex flex-col justify-between h-full transition-all shadow-sm active:scale-95">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Kanban size={16} />
                </div>
                <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-sky-400 transition-colors" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-0.5">
                  Kanban
                </span>
                <span className="text-base font-bold text-white tracking-tight">
                  {inProgressTasksCount} <span className="text-xs text-neutral-400 font-normal">en curso</span>
                </span>
              </div>
            </Card>
          </Link>

          {/* Card Focus & Búnker */}
          <Link href="/focus" className="group">
            <Card className="bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4.5 flex flex-col justify-between h-full transition-all shadow-sm active:scale-95">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-amber-400 transition-colors" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-0.5">
                  Focus Station
                </span>
                <span className="text-xs font-bold text-amber-400 tracking-tight flex items-center gap-1">
                  <Shield size={12} /> Modo Búnker
                </span>
              </div>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* 4. Acceso rápido a Viajes & Colectivos */}
      <motion.div variants={itemVariants} className="mt-1">
        <Link href="/horarios" className="group block">
          <Card className="bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between transition-colors shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Bus size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Horarios y Colectivos Completos
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {recomendacionIda?.recomendado ? `Próximo: ${recomendacionIda.recomendado.horaSalida} hs` : 'Consultar cronograma'}
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-neutral-600 group-hover:text-white transition-colors shrink-0" />
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
