"use client";

import { useState } from 'react';
import { parseMateriaInfo } from '@/core/utils/edificio';
import { MateriaDetailModal } from '@/components/MateriaDetailModal';
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
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

  if (items.length === 0) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-3xl p-5 text-center text-sm text-neutral-400 italic backdrop-blur-md">
        Sin materias programadas para hoy 🏠
      </div>
    );
  }

  return (
    <section className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md relative">
      <div className="flex items-center justify-between mb-4 text-neutral-400">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-purple-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-300">Cursado / Horario del día</h2>
        </div>
        {isToday && horaActualHHMM && (
          <span className="text-xs font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full">
            Ahora: {horaActualHHMM} hs
          </span>
        )}
      </div>

      {/* Timeline Vertical */}
      <div className="relative border-l-2 border-neutral-800 ml-3 pl-5 flex flex-col gap-4 py-1">
        {items.map((cls, idx) => {
          const rawString = cls.nombre || cls.name || cls.title || cls.rawText || '';
          const info = parseMateriaInfo(rawString);
          const horaInicio = cls.horaInicio || cls.timeStart || "08:00";
          const horaFin = cls.horaFin || cls.timeEnd || "11:10";
          const isActive = activeIndex === idx && isToday;

          return (
            <div key={cls.id || idx} className="relative">
              {/* Timeline Indicator Dot */}
              <span 
                className={`absolute -left-[1.65rem] top-3.5 h-3.5 w-3.5 rounded-full border-[3px] border-neutral-950 z-20 transition-all ${
                  isActive 
                    ? 'bg-purple-500 ring-4 ring-purple-500/30 scale-110' 
                    : 'bg-neutral-700'
                }`} 
              />

              <div
                onClick={() => setSelectedSubject(cls)}
                className={`group relative z-10 p-4 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-950/40 to-neutral-900 border-purple-500/80 shadow-lg shadow-purple-950/40 text-white'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-bold text-base leading-tight text-white group-hover:text-purple-300 transition-colors">
                      {info.nombre}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs opacity-80 mt-1">
                      {info.curso !== 'N/A' && info.curso !== 'Consultar' && (
                        <span className="bg-black/30 px-2 py-0.5 rounded-md font-medium text-purple-300">
                          {info.curso}
                        </span>
                      )}
                      {info.aula !== 'N/A' && (
                        <span className="bg-black/30 px-2 py-0.5 rounded-md font-medium text-emerald-300">
                          Aula {info.aula}
                        </span>
                      )}
                      {info.edificio !== 'N/A' && (
                        <span className="bg-black/30 px-2 py-0.5 rounded-md font-medium text-amber-300">
                          📍 {info.edificio}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      isActive 
                        ? 'bg-purple-600 text-white border-purple-400 animate-pulse' 
                        : 'bg-black/40 text-neutral-300 border-neutral-800'
                    }`}>
                      {horaInicio} - {horaFin}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 mt-1">
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

      <MateriaDetailModal 
        materia={selectedSubject} 
        onClose={() => setSelectedSubject(null)} 
      />
    </section>
  );
}
