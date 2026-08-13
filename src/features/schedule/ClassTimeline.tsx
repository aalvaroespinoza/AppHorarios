"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseMateriaInfo } from '@/core/utils/edificio';

export interface ClassItem {
  id?: string;
  nombre?: string;
  name?: string;
  title?: string;
  rawText?: string;
  horaInicio?: string;
  horaFin?: string;
  timeStart?: string;
  timeEnd?: string;
  curso?: string;
  aula?: string;
  color?: string;
}

export interface ClassTimelineProps {
  materiasDelDia?: ClassItem[];
  classes?: ClassItem[];
  isToday?: boolean;
  horaActualHHMM?: string;
  linePosition?: "none" | "before" | "inside" | "after";
  activeIndex?: number;
}

export function ClassTimeline({
  materiasDelDia,
  classes,
  isToday,
  horaActualHHMM,
  linePosition,
  activeIndex
}: ClassTimelineProps) {
  const items = materiasDelDia || classes || [];
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

  if (items.length === 0) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-4 text-center text-sm text-neutral-500 italic">
        Sin materias programadas para hoy 📚
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {items.map((cls, idx) => {
        const rawString = cls.nombre || cls.name || cls.title || cls.rawText || '';
        const info = parseMateriaInfo(rawString);
        const horaInicio = cls.horaInicio || cls.timeStart || "08:00";
        const horaFin = cls.horaFin || cls.timeEnd || "11:10";
        const isActive = activeIndex === idx && isToday;

        return (
          <div
            key={cls.id || idx}
            onClick={() => setSelectedSubject(cls)}
            className={`cursor-pointer active:scale-98 transition-transform bg-neutral-900/80 border rounded-2xl p-4 flex items-center justify-between hover:border-neutral-700 ${
              isActive ? 'border-purple-500/80 bg-purple-950/20 shadow-md shadow-purple-950/30' : 'border-neutral-800'
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="font-bold text-white text-base">{info.nombre}</span>
              <span className="text-xs text-neutral-400">
                {info.curso !== 'N/A' && info.curso !== 'Consultar' ? `${info.curso} | ` : ''}
                Aula {info.aula} · 📍 {info.edificio}
              </span>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                isActive 
                  ? 'bg-purple-600 text-white border-purple-500 animate-pulse' 
                  : 'text-purple-400 bg-purple-950/40 border-purple-800/40'
              }`}>
                {horaInicio} - {horaFin}
              </span>
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {selectedSubject && (() => {
          const rawString = selectedSubject.nombre || selectedSubject.title || selectedSubject.rawText || selectedSubject.name || '';
          const info = parseMateriaInfo(rawString);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setSelectedSubject(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-5 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del Submenú */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Detalle de Cursado</span>
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Nombre de la Materia */}
                <div>
                  <h3 className="text-xl font-bold text-white">{info.nombre}</h3>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    ⏰ Horario: <span className="text-white font-medium">{selectedSubject.horaInicio || selectedSubject.timeStart || "08:00"} a {selectedSubject.horaFin || selectedSubject.timeEnd || "11:10"} hs</span>
                  </p>
                </div>

                {/* Grid de Detalles: Curso, Aula y Edificio */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-3.5 flex flex-col">
                    <span className="text-xs text-neutral-400">Curso</span>
                    <span className="text-base font-bold text-purple-300 mt-1">{info.curso}</span>
                  </div>

                  <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-3.5 flex flex-col">
                    <span className="text-xs text-neutral-400">Aula</span>
                    <span className="text-base font-bold text-emerald-300 mt-1">Aula {info.aula}</span>
                  </div>

                  <div className="col-span-2 bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-3.5 flex flex-col">
                    <span className="text-xs text-neutral-400">Ubicación / Edificio</span>
                    <span className="text-base font-bold text-amber-300 mt-1 flex items-center gap-1.5">
                      📍 {info.edificio}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
