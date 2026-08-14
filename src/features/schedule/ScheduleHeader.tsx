"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, GraduationCap, Bus, Settings, RotateCcw } from 'lucide-react';
import RelojMinimalista from '@/components/RelojMinimalista';
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
    <header className="sticky top-0 z-40 bg-[#0a0a0c]/85 backdrop-blur-xl -mx-4 px-4 pt-2 pb-3 border-b border-neutral-800/60 shadow-lg flex flex-col gap-2 transition-all">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 text-[11px] font-black tracking-[0.25em] uppercase mb-0.5 drop-shadow-sm">
            APP HORARIO
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {diaCapitalizado}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón interactivo "Volver a Hoy" (solo visible cuando NO estamos en hoy) */}
          <AnimatePresence>
            {!esHoy && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setDiaSeleccionado(diaActualHoy)}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 rounded-full hover:bg-cyan-500/25 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] active:scale-95"
                title="Restablecer al día de hoy"
              >
                <RotateCcw size={12} className="text-cyan-400 animate-spin-slow" />
                <span>Volver a Hoy</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Píldora de la hora (Siempre visible y fija con el header sticky durante todo el scroll) */}
          <div className="bg-neutral-900/90 border border-neutral-800 px-3.5 py-1.5 rounded-full flex items-center justify-center shadow-inner">
            <RelojMinimalista />
          </div>

          {/* Botón circular de 3 puntitos con animación fachera */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-9 h-9 rounded-full bg-neutral-900 border flex items-center justify-center transition-all shadow-md ${
                isMenuOpen 
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                  : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
              title="Opciones y Horarios"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <MoreVertical size={18} />
              </motion.div>
            </motion.button>

            {/* Menú Desplegable Flotante */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Backdrop para cerrar al hacer clic afuera */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)} 
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10, originX: 1, originY: 0 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-11 z-50 w-64 bg-neutral-950/95 border border-neutral-800/90 rounded-2xl p-2 shadow-2xl backdrop-blur-xl flex flex-col gap-1"
                  >
                    {/* 1. Gestión de Materias */}
                    <Link
                      href="/configuracion/materias"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-900/90 transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <GraduationCap size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          Gestión de Materias
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          Aulas, cursos y horarios
                        </span>
                      </div>
                    </Link>

                    {/* 2. Todos los Horarios */}
                    <Link
                      href="/horarios"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-900/90 transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Bus size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          Todos los Horarios
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          Grilla completa de colectivos
                        </span>
                      </div>
                    </Link>

                    <div className="h-[1px] bg-neutral-800/70 my-0.5" />

                    {/* 3. Ajustes */}
                    <Link
                      href="/configuracion"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-900/90 transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Settings size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors">
                          Ajustes Generales
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Preferencias de la app
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
