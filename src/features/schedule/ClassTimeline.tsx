"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseMateriaInfo } from '@/core/utils/materiaParser';
import { getSubjectColorMapping } from '@/core/utils/edificio';
import { Clock } from 'lucide-react';

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
  const [selectedMateria, setSelectedMateria] = useState<any | null>(null);

  const currentTime = horaActualHHMM || (() => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  })();

  const [h, m] = currentTime.split(':').map(Number);
  const currentMinutes = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);

  const isTimeBetween = (start: string, end: string, current: string) => {
    return current >= start && current < end;
  };

  if (items.length === 0) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-3xl p-5 text-center text-sm text-neutral-400 italic backdrop-blur-md">
        Sin materias programadas para hoy 🏠
      </div>
    );
  }

  return (
    <section className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md relative">
      <div className="flex items-center gap-2 mb-4 text-neutral-400">
        <Clock size={18} className="text-zinc-400" />
        <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Cursado / Horario del día</h2>
      </div>

      {/* Timeline Vertical */}
      <div className="relative border-l-2 border-neutral-800 ml-3 pl-5 flex flex-col gap-4 py-1">
        {/* Línea de tiempo actual */}
        {isToday && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-red-500 z-40 w-full pointer-events-none" 
            style={{ top: `${Math.min(Math.max((currentMinutes / 1440) * 100, 0), 100)}%` }}
          >
            <div className="absolute -top-1.5 -left-1 w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
          </div>
        )}

        {items.map((cls, idx) => {
          const rawString = cls.nombre || cls.name || cls.title || cls.rawText || '';
          const info = parseMateriaInfo(rawString);
          const horaInicio = cls.horaInicio || cls.timeStart || "08:00";
          const horaFin = cls.horaFin || cls.timeEnd || "11:10";
          const isCurrentClass = isToday && isTimeBetween(horaInicio, horaFin, currentTime);
          
          const mapping = getSubjectColorMapping(cls.color);

          return (
            <div key={cls.id || idx} className="relative">
              {/* Timeline Indicator Dot */}
              <span 
                className={`absolute -left-[1.65rem] top-3.5 h-3.5 w-3.5 rounded-full border-[3px] border-neutral-950 z-20 transition-all ${
                  isCurrentClass 
                    ? `${mapping.dot} ring-4 ${mapping.ring} scale-110` 
                    : 'bg-neutral-700'
                }`} 
              />

              <div
                onClick={() => setSelectedMateria(cls)}
                className={`group relative z-10 p-4 rounded-2xl border cursor-pointer active:scale-[0.98] transition-transform ${
                  isCurrentClass
                    ? `bg-gradient-to-r ${mapping.gradient} ${mapping.border} shadow-lg ${mapping.shadow}`
                    : `bg-neutral-900/80 border-neutral-800 ${mapping.bgHover}`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h3 className={`font-bold text-base leading-tight transition-colors ${isCurrentClass ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                      {info.nombre}
                    </h3>
                    {info.aula !== '-' && info.aula !== 'N/A' && (
                      <div className="flex items-center gap-1.5 text-xs opacity-80 mt-1">
                        <span className={`px-2 py-0.5 rounded-md font-medium ${mapping.bg} ${mapping.text}`}>
                          Aula {info.aula}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      isCurrentClass 
                        ? `${mapping.dot} text-white ${mapping.border} animate-pulse` 
                        : 'bg-black/40 text-neutral-300 border-neutral-800'
                    }`}>
                      {horaInicio} - {horaFin}
                    </span>
                    {isCurrentClass && (
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider mt-1 ${mapping.text}`}>
                        En curso
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedMateria && (() => {
          const info = parseMateriaInfo(selectedMateria.nombre || selectedMateria.title || selectedMateria.rawText || "");
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setSelectedMateria(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Detalle de Cursado</span>
                  <button onClick={() => setSelectedMateria(null)} className="text-neutral-500 hover:text-white bg-neutral-800 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                </div>

                <div>
                  <h3 className="text-xl font-bold leading-tight">{info.nombre}</h3>
                  <p className="text-sm text-neutral-400 mt-2">
                    ⏰ Horario: <span className="text-white font-medium">{selectedMateria.horaInicio || selectedMateria.timeStart || "00:00"} a {selectedMateria.horaFin || selectedMateria.timeEnd || "00:00"} hs</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-neutral-800/50 rounded-2xl p-4 flex flex-col border border-neutral-700/50">
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Curso</span>
                    <span className="text-lg font-bold text-purple-300 mt-0.5">{info.curso}</span>
                  </div>
                  <div className="bg-neutral-800/50 rounded-2xl p-4 flex flex-col border border-neutral-700/50">
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Aula</span>
                    <span className="text-lg font-bold text-emerald-300 mt-0.5">{info.aula}</span>
                  </div>
                  <div className="col-span-2 bg-neutral-800/50 rounded-2xl p-4 flex flex-col border border-neutral-700/50">
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Edificio</span>
                    <span className="text-base font-bold text-amber-300 mt-0.5">📍 {info.edificio}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
