"use client";

import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import NativeCard from '@/core/components/ui/NativeCard';

interface Materia {
  nombre: string;
  horaInicio: string;
  horaFin: string;
  color?: string;
}

interface ClassTimelineProps {
  materiasDelDia: Materia[];
  isToday: boolean;
  horaActualHHMM: string;
  linePosition: 'before' | 'inside' | 'after' | 'none';
  activeIndex: number;
}

export function ClassTimeline({ 
  materiasDelDia, 
  isToday, 
  horaActualHHMM, 
  linePosition, 
  activeIndex 
}: ClassTimelineProps) {
  if (materiasDelDia.length === 0) return null;

  return (
    <NativeCard className="py-6">
      <div className="flex items-center gap-2 mb-5 text-zinc-400">
        <Clock size={18} />
        <h2 className="font-semibold text-sm uppercase tracking-wider">Cursado</h2>
      </div>
      
      <div className="flex flex-col gap-0 relative">
        {/* Línea vertical continua */}
        <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-zinc-800 rounded-full" />
        
        {materiasDelDia.map((materia, idx) => {
          const isFinished = isToday && materia.horaFin <= horaActualHHMM;
          const showLineBefore = isToday && linePosition === 'before' && idx === activeIndex;
          const showLineInside = isToday && linePosition === 'inside' && idx === activeIndex;
          const showLineAfter = isToday && linePosition === 'after' && idx === activeIndex;
          
          const TimeLine = () => (
            <div className="absolute left-0 right-0 z-20 flex items-center ml-1">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <div className="h-[2px] flex-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
          );

          return (
            <div key={idx} className="relative pl-8 py-3">
              {showLineBefore && <div className="absolute -top-1.5 left-0 right-0"><TimeLine /></div>}
              
              {/* Punto en la línea */}
              <div className={`absolute left-[3px] top-[22px] w-3.5 h-3.5 bg-zinc-900 border-[2.5px] rounded-full z-10 transition-colors ${
                isFinished ? 'border-zinc-700' : 'border-blue-500'
              }`} />
              
              <div className={`bg-zinc-800/30 border rounded-2xl p-4 transition-all relative ${
                isFinished ? 'border-zinc-800/50 opacity-50 grayscale' : 'border-zinc-700/30'
              }`}>
                {showLineInside && <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 -ml-8"><TimeLine /></div>}
                <h3 className={`font-semibold text-base flex items-center gap-2 ${isFinished ? 'text-zinc-300' : 'text-white'}`}>
                  {materia.color && (
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${materia.color.split(' ')[0]}`} />
                  )}
                  {materia.nombre}
                  {isFinished && <CheckCircle2 size={16} className="text-zinc-500" />}
                </h3>
                <p className="text-zinc-400 text-sm mt-1.5 font-medium">
                  {materia.horaInicio} <span className="text-zinc-600 mx-1">-</span> {materia.horaFin}
                </p>
              </div>
              
              {showLineAfter && <div className="absolute -bottom-1.5 left-0 right-0"><TimeLine /></div>}
            </div>
          );
        })}
      </div>
    </NativeCard>
  );
}
