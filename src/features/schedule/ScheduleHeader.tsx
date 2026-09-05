"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, GraduationCap, Bus, Settings, Calendar } from 'lucide-react';
import RelojMinimalista from '@/components/RelojMinimalista';
import { Button } from '@/components/ui/button';
import type { DayOfWeek } from '@/core/types/common';

interface ScheduleHeaderProps {
  diaCapitalizado: string;
  diaSeleccionado?: string;
  setDiaSeleccionado: (dia: DayOfWeek) => void;
}

export function ScheduleHeader({ diaCapitalizado, diaSeleccionado, setDiaSeleccionado }: ScheduleHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dayMap: Record<number, DayOfWeek> = {
    0: 'lunes', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  const diaActualHoy = dayMap[new Date().getDay()];
  
  // Evaluar si estamos en el día de hoy
  const currentSelectedDay = (diaSeleccionado || diaCapitalizado).toLowerCase();
  const esHoy = currentSelectedDay === diaActualHoy.toLowerCase() || 
                (diaCapitalizado.toLowerCase() === 'hoy');

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0C]/95 backdrop-blur-md -mx-4 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b border-zinc-800 shadow-none flex flex-col gap-2 transition-all">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-safety-orange font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5">
            SYS.CONSOLE // HORARIOS
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100 leading-tight uppercase font-mono">
            {diaCapitalizado}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón icono miniatura "Volver a hoy" */}
          <AnimatePresence>
            {!esHoy && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 4 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 4 }}
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-9 h-9 rounded-sm shrink-0 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-safety-orange hover:bg-zinc-800 shadow-none flex items-center justify-center"
                  onClick={() => setDiaSeleccionado(diaActualHoy)}
                  title="Volver al día de hoy"
                >
                  <Calendar size={15} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Módulo LCD de hora */}
          <div className="bg-zinc-950 border border-zinc-800 px-3 h-9 rounded-sm flex items-center justify-center pointer-events-auto shadow-none">
            <RelojMinimalista />
          </div>

          {/* Botón mecánico de opciones */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-9 h-9 rounded-sm bg-zinc-900 border flex items-center justify-center transition-colors shadow-none cursor-pointer ${
                isMenuOpen 
                  ? 'border-safety-orange text-safety-orange bg-safety-orange/10' 
                  : 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
              }`}
              title="Opciones y Horarios"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <MoreVertical size={16} />
              </motion.div>
            </motion.button>

            {/* Menú Desplegable Flotante */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)} 
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: -4, originX: 1, originY: 0 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 z-50 w-64 bg-zinc-950 border border-zinc-700 rounded-sm p-2 shadow-none flex flex-col gap-1"
                  >
                    {/* 1. Gestión de Materias */}
                    <Link
                      href="/configuracion/materias"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-sm hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors group text-left"
                    >
                      <div className="w-7 h-7 rounded-sm border border-zinc-800 bg-zinc-900 text-zinc-300 flex items-center justify-center">
                        <GraduationCap size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-zinc-100 group-hover:text-safety-orange transition-colors">
                          GESTIÓN DE MATERIAS
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Aulas, cursos y horarios
                        </span>
                      </div>
                    </Link>

                    {/* 2. Todos los Horarios */}
                    <Link
                      href="/horarios"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-sm hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors group text-left"
                    >
                      <div className="w-7 h-7 rounded-sm border border-zinc-800 bg-zinc-900 text-zinc-300 flex items-center justify-center">
                        <Bus size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-zinc-100 group-hover:text-safety-orange transition-colors">
                          TODOS LOS HORARIOS
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Grilla completa de colectivos
                        </span>
                      </div>
                    </Link>

                    <div className="h-[1px] bg-zinc-800 my-0.5" />

                    {/* 3. Ajustes */}
                    <Link
                      href="/configuracion"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-sm hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors group text-left"
                    >
                      <div className="w-7 h-7 rounded-sm border border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center justify-center">
                        <Settings size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-zinc-300 group-hover:text-zinc-100 transition-colors">
                          CONFIGURACIÓN
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Preferencias de la consola
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
