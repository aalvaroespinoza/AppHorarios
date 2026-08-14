"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, HelpCircle, Clock, LayoutGrid, 
  FileText, Zap, Wallet, Bus, Sparkles, ChevronDown, ChevronUp, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAGE_TRANSITION, SPRING_CONFIG } from '@/lib/animations';

interface GuideSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  href: string;
  badge: string;
  steps: string[];
  tip: string;
}

const GUIDES: GuideSection[] = [
  {
    id: 'timeblocking',
    title: 'Time-Blocking 24h',
    subtitle: 'Planificación visual por franjas horarias',
    icon: Clock,
    color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400',
    href: '/tareas',
    badge: 'Productividad',
    steps: [
      '1. Entrá a Time-Blocking y tocá en "+ Bloque" para crear una franja horaria.',
      '2. Asigná la hora de inicio y fin (ej: 09:00 a 11:00) y la prioridad.',
      '3. La línea roja en vivo te indica exactamente qué deberías estar haciendo en el minuto actual.',
      '4. Tocá el círculo a la izquierda del bloque cuando lo hayas completado para tacharlo.'
    ],
    tip: '💡 Usá bloques de 90 a 120 minutos para tareas pesadas como estudiar o programar.'
  },
  {
    id: 'kanban',
    title: 'Tablero Kanban',
    subtitle: 'Gestión ágil de proyectos y entregas',
    icon: LayoutGrid,
    color: 'from-sky-500/20 to-sky-600/5 border-sky-500/30 text-sky-400',
    href: '/kanban',
    badge: 'Proyectos',
    steps: [
      '1. Creá tareas en la columna "Por Hacer" con su título, descripción y prioridad.',
      '2. Cuando comiences a trabajar en ella, tocala y movela a "En Progreso" con la flecha.',
      '3. Al finalizarla, pasala a "Completado" para archivarla exitosamente.',
      '4. Podés deslizar horizontalmente entre columnas en tu iPhone.'
    ],
    tip: '💡 No tengas más de 2 o 3 tareas simultáneas en "En Progreso" para evitar la sobrecarga mental.'
  },
  {
    id: 'notas',
    title: 'Notas & Bóveda Notion',
    subtitle: 'Editor estructurado por bloques',
    icon: FileText,
    color: 'from-teal-500/20 to-teal-600/5 border-teal-500/30 text-teal-400',
    href: '/notas',
    badge: 'Conocimiento',
    steps: [
      '1. Creá una nota tocando en "+ Nueva Nota".',
      '2. Cada párrafo, título (H1/H2) o elemento de lista es un bloque independiente que se auto-ajusta.',
      '3. Se guarda automáticamente cada vez que escribís, de manera local en tu dispositivo.',
      '4. Podés buscar en tiempo real entre tus notas guardadas desde la barra superior.'
    ],
    tip: '💡 Usá listas de tipo Checklist para resúmenes rápidos de estudio.'
  },
  {
    id: 'focus',
    title: 'Focus Station & Búnker',
    subtitle: 'Máxima concentración sin distracciones',
    icon: Zap,
    color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    href: '/focus',
    badge: 'Deep Work',
    steps: [
      '1. Tocá en "🛡️ ACTIVAR MODO BÚNKER" para entrar en pantalla completa inmersiva.',
      '2. Utilizá el temporizador Pomodoro (25 min de foco + 5 min de descanso).',
      '3. Registrá tu Batería Mental para que el sistema aprenda tus picos de energía.',
      '4. Anotá pensamientos fugaces en las Notas Rápidas para no perder el foco.'
    ],
    tip: '💡 Activá el modo No Molestar en tu iPhone antes de entrar al Búnker.'
  },
  {
    id: 'finanzas',
    title: 'Finanzas & Cuentas Claras',
    subtitle: 'Presupuesto mensual y gastos compartidos',
    icon: Wallet,
    color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    href: '/finanzas',
    badge: 'Economía',
    steps: [
      '1. Configurá tu presupuesto mensual en el menú de Ajustes (icono de engranaje).',
      '2. Registrá tus gastos diarios por categoría (Comida, Facu, Transporte, etc.).',
      '3. Usá "Cuentas Claras" para anotar cuando le pagás algo a un amigo o te deben dinero.',
      '4. La barra superior te avisará si superás el 80% de tu límite presupuestario.'
    ],
    tip: '💡 Registrá el gasto inmediatamente después de pagar para mantener el balance 100% al día.'
  },
  {
    id: 'viajes',
    title: 'Viajes & Colectivos',
    subtitle: 'Recomendación automática de buses según cursado',
    icon: Bus,
    color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    href: '/viajes',
    badge: 'Transporte',
    steps: [
      '1. La app calcula el colectivo exacto que debés tomar según la hora de tu primera clase.',
      '2. Al terminar el cursado, te muestra el bus de regreso con el paso por tu parada exacta.',
      '3. Marcá "BEC Usado" para llevar el registro de tus boletos gratuitos.',
      '4. Si perdés un colectivo, abrí "Ver siguientes opciones" para tomar el próximo de inmediato.'
    ],
    tip: '💡 Podés ver la grilla completa de todas las empresas en los 3 puntos superiores -> Todos los Horarios.'
  }
];

export default function AyudaPage() {
  const [expandedId, setExpandedId] = useState<string | null>('timeblocking');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-4 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/boveda"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Centro de Ayuda <HelpCircle size={17} className="text-cyan-400" />
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium">Guías interactivas de uso de LifeOS</p>
          </div>
        </div>
      </header>

      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-cyan-950/40 via-neutral-900/80 to-indigo-950/40 border border-cyan-500/20 rounded-2xl p-4 flex flex-col gap-1.5 shadow-md">
        <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Sparkles size={15} className="text-cyan-400" /> Todo lo que necesitas saber
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Tocá en cada módulo para desplegar su guía de uso paso a paso, consejos prácticos y accesos directos.
        </p>
      </div>

      {/* Lista de Guías Acordeón */}
      <div className="flex flex-col gap-3">
        {GUIDES.map(guide => {
          const isExpanded = expandedId === guide.id;
          const Icon = guide.icon;

          return (
            <Card 
              key={guide.id} 
              className={`bg-neutral-900/60 border rounded-2xl overflow-hidden transition-all shadow-md ${
                isExpanded ? 'border-cyan-500/40 bg-neutral-900/80' : 'border-neutral-800/80'
              }`}
            >
              <button
                onClick={() => toggleExpand(guide.id)}
                className="w-full p-4 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${guide.color} flex items-center justify-center shrink-0 border`}>
                    <Icon size={19} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{guide.title}</h3>
                      <Badge className="bg-neutral-800 text-[10px] text-neutral-400 border-neutral-700">{guide.badge}</Badge>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">{guide.subtitle}</p>
                  </div>
                </div>

                <div className="text-neutral-500 ml-2">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={SPRING_CONFIG}
                    className="px-4 pb-4 pt-1 border-t border-neutral-800/60 flex flex-col gap-3"
                  >
                    <div className="space-y-2 mt-2">
                      {guide.steps.map((step, idx) => (
                        <p key={idx} className="text-xs text-neutral-300 leading-relaxed pl-1">
                          {step}
                        </p>
                      ))}
                    </div>

                    <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3 text-xs text-cyan-300 leading-relaxed font-medium">
                      {guide.tip}
                    </div>

                    <Link href={guide.href} className="w-full block mt-1">
                      <Button
                        size="sm"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                      >
                        <span>Abrir {guide.title}</span>
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
