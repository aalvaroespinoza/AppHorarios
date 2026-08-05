"use client";

import React from 'react';
import { useEscenario } from '@/hooks/useEscenario';
import NativeCard from '@/components/ui/NativeCard';
import NativeSwitch from '@/components/ui/NativeSwitch';
import { DiaSemana } from '@/types';

const DIAS_SEMANA: { id: DiaSemana; label: string }[] = [
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
        <div className="flex space-x-2">
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

      {/* 2. Switches Contextuales */}
      {/* El div contenedor envuelve los condicionales para reservar espacio sutilmente si se desea,
          pero usamos animaciones para suavizar la transición de mount/unmount */}
      <div className="flex flex-col gap-4">
        {diaSeleccionado === 'martes' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-both">
            <NativeCard className="flex flex-row items-center justify-between">
              <div className="pr-4">
                <h3 className="text-white font-medium text-base">¿Cursás Arquitectura hoy?</h3>
                <p className="text-zinc-500 text-sm mt-1 leading-snug">
                  Actívalo si debes ir a la primera hora (08:00).
                </p>
              </div>
              <NativeSwitch 
                checked={cursaArquitectura} 
                onChange={setCursaArquitectura} 
              />
            </NativeCard>
          </div>
        )}

        {diaSeleccionado === 'viernes' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-both">
            <NativeCard className="flex flex-row items-center justify-between">
              <div className="pr-4">
                <h3 className="text-white font-medium text-base">¿Dormís en Córdoba?</h3>
                <p className="text-zinc-500 text-sm mt-1 leading-snug">
                  Si te quedas, cancelaremos las recomendaciones de regreso de esa noche.
                </p>
              </div>
              <NativeSwitch 
                checked={duermeEnCordoba} 
                onChange={setDuermeEnCordoba} 
              />
            </NativeCard>
          </div>
        )}
      </div>
    </div>
  );
}
