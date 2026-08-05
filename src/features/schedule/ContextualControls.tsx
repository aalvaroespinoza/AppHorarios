"use client";

import React from 'react';
import { useEscenario } from '@/hooks/useEscenario';
import NativeCard from '@/components/ui/NativeCard';
import { DayOfWeek } from '@/types/common';

const DIAS_SEMANA: { id: DayOfWeek; label: string }[] = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' },
];

export default function ContextualControls() {
  const {
    diaSeleccionado, 
    setDiaSeleccionado,
    isMounted
  } = useEscenario();

  // Prevenir desajustes de hidratación en Server Side Rendering
  if (!isMounted) {
    return <div className="animate-pulse h-24 bg-zinc-900/50 rounded-xl" />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 
        Añadimos un bloque de estilos en línea en caso de que la clase
        "no-scrollbar" no esté configurada previamente en Tailwind/globals.css
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* 1. Carrusel de Días */}
      <div className="overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
        <div className="flex space-x-2 items-center">
          <button
            onClick={() => {
              const map: Record<number, DayOfWeek> = {
                0: 'lunes', 1: 'lunes', 2: 'martes', 3: 'miercoles',
                4: 'jueves', 5: 'viernes', 6: 'sabado'
              };
              setDiaSeleccionado(map[new Date().getDay()]);
            }}
            className="whitespace-nowrap transition-all duration-200 text-blue-400 font-bold rounded-full px-4 py-2 hover:bg-zinc-800/40 flex items-center gap-1 shrink-0"
          >
            Hoy
          </button>
          <div className="w-[1px] h-6 bg-zinc-800 shrink-0"></div>
          {DIAS_SEMANA.map((dia) => {
            const isSelected = diaSeleccionado === dia.id;
            return (
              <button
                key={dia.id}
                onClick={() => setDiaSeleccionado(dia.id)}
                className={`whitespace-nowrap transition-all duration-200 ${
                  isSelected 
                    ? 'bg-zinc-800 text-white font-semibold rounded-full px-4 py-2' 
                    : 'text-zinc-500 font-medium rounded-full px-4 py-2 hover:bg-zinc-800/40'
                }`}
              >
                {dia.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Los switches contextuales (Arquitectura, Córdoba) han sido movidos a Configuración */}
    </div>
  );
}
