"use client";

import React from 'react';
import { useEscenario } from '@/hooks/useEscenario';
import NativeCard from '@/components/ui/NativeCard';
import NativeSwitch from '@/components/ui/NativeSwitch';
import { DayOfWeek } from '@/types/common';
import { Building2, Bed } from 'lucide-react';

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
    cursaArquitectura,
    setCursaArquitectura,
    duermeEnCordoba,
    setDuermeEnCordoba,
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

      {/* Controles Dinámicos (solo martes o viernes) */}
      {diaSeleccionado === 'martes' && (
        <NativeCard className="p-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-1.5 rounded-lg text-white shadow-sm">
                <Building2 size={18} />
              </div>
              <div>
                <span className="font-medium text-[16px] block leading-tight text-white">¿Cursás Arquitectura hoy?</span>
                <span className="text-[12px] text-zinc-400 block leading-tight mt-0.5">Activa viaje a las 08:00</span>
              </div>
            </div>
            <NativeSwitch checked={cursaArquitectura} onChange={setCursaArquitectura} />
          </div>
        </NativeCard>
      )}

      {diaSeleccionado === 'viernes' && (
        <NativeCard className="p-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-1.5 rounded-lg text-white shadow-sm">
                <Bed size={18} />
              </div>
              <div>
                <span className="font-medium text-[16px] block leading-tight text-white">¿Dormís en Córdoba?</span>
                <span className="text-[12px] text-zinc-400 block leading-tight mt-0.5">Cancela regresos de hoy</span>
              </div>
            </div>
            <NativeSwitch checked={duermeEnCordoba} onChange={setDuermeEnCordoba} />
          </div>
        </NativeCard>
      )}
    </div>
  );
}
