"use client";

import React from 'react';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import RelojMinimalista from '@/components/RelojMinimalista';
import type { DayOfWeek } from '@/core/types/common';

interface ScheduleHeaderProps {
  diaCapitalizado: string;
  setDiaSeleccionado: (dia: DayOfWeek) => void;
}

export function ScheduleHeader({ diaCapitalizado, setDiaSeleccionado }: ScheduleHeaderProps) {
  return (
    <header className="flex justify-between items-end mt-2 mb-2">
      <div>
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-[11px] font-black tracking-[0.25em] uppercase mb-1 drop-shadow-sm">
          APP HORARIO
        </h2>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {diaCapitalizado}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            const map: Record<number, DayOfWeek> = {
              0: 'lunes', 1: 'lunes', 2: 'martes', 3: 'miercoles',
              4: 'jueves', 5: 'viernes', 6: 'sabado'
            };
            setDiaSeleccionado(map[new Date().getDay()]);
          }}
          className="text-blue-400 font-bold text-sm bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors"
        >
          Hoy
        </button>
        <div className="flex gap-2">
          <Link 
            href="/horarios"
            className="bg-zinc-900 w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center shadow-sm hover:bg-zinc-800 transition-colors"
          >
            <LayoutGrid size={16} className="text-zinc-400" />
          </Link>
          <div className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 flex items-center justify-center shadow-sm">
            <RelojMinimalista />
          </div>
        </div>
      </div>
    </header>
  );
}
