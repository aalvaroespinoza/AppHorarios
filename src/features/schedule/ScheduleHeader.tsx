"use client";

import { useRef } from 'react';
import Link from 'next/link';
import { Settings, CalendarDays } from 'lucide-react';
import RelojMinimalista from '@/components/RelojMinimalista';
import { getDiaActual } from '@/context/EscenarioContext';
import type { DayOfWeek } from '@/core/types/common';

interface ScheduleHeaderProps {
  diaCapitalizado: string;
  diaSeleccionado?: string;
  setDiaSeleccionado: (dia: DayOfWeek) => void;
}

export function ScheduleHeader({ diaCapitalizado, diaSeleccionado, setDiaSeleccionado }: ScheduleHeaderProps) {
  const today = getDiaActual();
  const logoTaps = useRef(0);
  const logoTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshWithSecretGesture = () => {
    logoTaps.current += 1;
    if (logoTapTimeout.current) clearTimeout(logoTapTimeout.current);
    logoTapTimeout.current = setTimeout(() => { logoTaps.current = 0; }, 850);

    if (logoTaps.current === 3) {
      logoTaps.current = 0;
      window.location.reload();
    }
  };

  return (
    <header className="flex items-center justify-between gap-3 pt-[max(1rem,env(safe-area-inset-top))] pb-1">
      <div className="min-w-0">
        <button type="button" onClick={refreshWithSecretGesture} className="section-label mb-1 cursor-default" aria-label="LifeOS">
          LifeOS · Tu día, más simple
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Tus viajes</h1>
        <p className="mt-1 text-sm text-subtle">{diaCapitalizado.replace('Miercoles', 'Miércoles').replace('Sabado', 'Sábado')} <span aria-hidden="true">·</span> <RelojMinimalista /></p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {diaSeleccionado !== today && (
          <button type="button" className="glass-button w-11 p-0" onClick={() => setDiaSeleccionado(today)} aria-label="Volver al día de hoy">
            <CalendarDays size={19} />
          </button>
        )}
        <Link href="/configuracion" className="glass-button aurora-border w-11 p-0" aria-label="Configuración"><Settings size={20} /></Link>
      </div>
    </header>
  );
}
