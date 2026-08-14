"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, X, Kanban, Clock, BookOpen, 
  Wallet, Bus, ChevronDown, Sparkles, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  badge: string;
  content: string;
  tips: string[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'kanban',
    title: 'Tablero Kanban',
    icon: Kanban,
    accentColor: 'text-sky-400',
    badge: 'Proyectos',
    content: 'Toca las flechas en las tarjetas para moverlas de Pendiente a Completado. Las tareas incompletas se envían a tu iPhone.',
    tips: [
      'Usa el input superior para añadir tareas rápidas a la columna Por Hacer.',
      'Las tarjetas en progreso se sincronizan automáticamente con la agenda de hoy.',
      'Compatible con el Atajo de Apple Reminders vía /api/shortcuts/sync.'
    ]
  },
  {
    id: 'time-blocking',
    title: 'Time-Blocking',
    icon: Clock,
    accentColor: 'text-cyan-400',
    badge: 'Enfoque',
    content: 'Las tareas con horas asignadas caen automáticamente en la grilla visual de la agenda.',
    tips: [
      'Grilla matemática precisa calibrada en bloques de 5rem por hora (08:00 a 22:00).',
      'La línea roja en vivo te indica exactamente en qué minuto del día estás.',
      'Toca cualquier bloque para ver detalles o marcarlo completado.'
    ]
  },
  {
    id: 'boveda',
    title: 'Bóveda (Notion)',
    icon: BookOpen,
    accentColor: 'text-teal-400',
    badge: 'Apuntes',
    content: 'Usa bloques de texto. Se guarda automáticamente al escribir (Local-first).',
    tips: [
      'Presiona Enter para crear un nuevo bloque y escribe "/" para cambiar el tipo.',
      'Soporta encabezados (H1, H2), listas de viñetas y tareas con checkbox.',
      'Tus notas están encriptadas y guardadas en tu dispositivo sin latencia.'
    ]
  },
  {
    id: 'finanzas',
    title: 'Finanzas & Cuentas Claras',
    icon: Wallet,
    accentColor: 'text-emerald-400',
    badge: 'Control',
    content: 'Gestiona ingresos, gastos, deudas y tu presupuesto semanal con balance automático.',
    tips: [
      'Configura tu presupuesto semanal en Ajustes para recibir alertas de gasto.',
      'Divide gastos en Cuentas Claras para llevar registro de quién debe a quién.'
    ]
  },
  {
    id: 'viajes',
    title: 'Viajes & Transporte',
    icon: Bus,
    accentColor: 'text-blue-400',
    badge: 'Movilidad',
    content: 'Horarios de colectivos entre Córdoba y Despeñaderos con cuenta regresiva inteligente.',
    tips: [
      'La cápsula superior te muestra la hora en vivo y permanece fija al deslizar.',
      'Usa el menú de 3 puntitos para saltar a Todos los Horarios o a Gestión de Materias.'
    ]
  }
];

export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string>('kanban');

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? '' : id);
  };

  return (
    <>
      {/* Botón flotante trigger estilo Linear */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 z-40 w-12 h-12 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-cyan-400 hover:text-white hover:border-cyan-500 shadow-2xl flex items-center justify-center backdrop-blur-xl transition-all"
        title="Centro de Ayuda"
      >
        <HelpCircle size={22} />
      </motion.button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white max-h-[85vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">
                      Guía del Sistema
                    </h2>
                    <p className="text-[11px] text-neutral-400 font-medium">LifeOS Architecture & Tools</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Acordeón de Secciones de Ayuda */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 hide-scrollbar">
                {HELP_SECTIONS.map((sec) => {
                  const isExpanded = openSection === sec.id;
                  const Icon = sec.icon;

                  return (
                    <div
                      key={sec.id}
                      className={`border rounded-2xl transition-all overflow-hidden ${
                        isExpanded 
                          ? 'bg-neutral-950/80 border-neutral-700/80 shadow-md' 
                          : 'bg-neutral-950/40 border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <button
                        onClick={() => toggleSection(sec.id)}
                        className="w-full p-3.5 flex items-center justify-between gap-3 text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 ${sec.accentColor}`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">
                              {sec.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {sec.badge}
                            </span>
                          </div>
                        </div>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-neutral-500"
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 pb-4 pt-1 border-t border-neutral-800/60 flex flex-col gap-2.5 text-xs"
                          >
                            <p className="text-neutral-300 leading-relaxed">
                              {sec.content}
                            </p>

                            <div className="bg-neutral-900/60 rounded-xl p-3 flex flex-col gap-1.5 border border-neutral-800/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                                Tips Pro
                              </span>
                              <ul className="space-y-1 text-[11px] text-neutral-400 leading-normal">
                                {sec.tips.map((tip, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-cyan-400">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Footer Modal */}
              <div className="pt-2 border-t border-neutral-800 flex justify-end">
                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl py-2.5"
                >
                  Entendido
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default HelpModal;
