'use client';

import { useState, useEffect } from 'react';

interface Props {
  horaSalida: string;
}

/**
 * ContadorVivo
 * Módulo de telemetría LED / display segmentado para el conteo regresivo de colectivos.
 */
export default function ContadorVivo({ horaSalida }: Props) {
  const [minutosRestantes, setMinutosRestantes] = useState<number | null>(null);

  useEffect(() => {
    const calcularRestante = () => {
      if (!horaSalida) return;
      
      const [h, m] = horaSalida.split(':').map(Number);
      const ahora = new Date();
      const salida = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m, 0, 0);
      
      const diffMs = salida.getTime() - ahora.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      setMinutosRestantes(diffMins);
    };

    calcularRestante(); // Llamada inicial inmediata
    const interval = setInterval(calcularRestante, 10000); // Re-calcula cada 10 seg
    
    return () => clearInterval(interval);
  }, [horaSalida]);

  // Previene destellos o hidrataciones incorrectas
  if (minutosRestantes === null) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-zinc-800 bg-zinc-950 text-zinc-600 font-mono text-[11px] uppercase tracking-wider animate-pulse select-none">
        <span className="w-1.5 h-1.5 bg-zinc-700 rounded-none" />
        <span>CALC...</span>
      </div>
    );
  }

  // Escenario 1: Ya se fue
  if (minutosRestantes < 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-zinc-800 bg-zinc-950 text-zinc-500 font-mono text-[11px] uppercase tracking-wider select-none">
        <span className="w-1.5 h-1.5 bg-zinc-600 rounded-none" />
        <span>PASADO // YA SALIÓ</span>
      </div>
    );
  }

  // Escenario 2: Falta mucho (> 1 hora)
  if (minutosRestantes > 60) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-zinc-800 bg-zinc-950 text-zinc-300 font-mono text-[11px] uppercase tracking-wider select-none">
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-none" />
        <span>PROGRAMADO: <strong className="text-zinc-100 font-bold">{horaSalida} HS</strong></span>
      </div>
    );
  }

  // Escenario 3: ¡Alerta de urgencia! Menos de 15 minutos (Safety Orange #FF5500)
  if (minutosRestantes <= 15) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm border border-safety-orange bg-safety-orange/15 text-safety-orange font-mono text-[11px] font-bold uppercase tracking-widest shadow-none animate-pulse select-none">
        <span className="w-2 h-2 bg-safety-orange rounded-none" />
        <span>T-{minutosRestantes} MIN // SALIDA INMINENTE</span>
      </div>
    );
  }

  // Escenario 4: Entre 16 y 60 minutos (Acid Green #00E599)
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm border border-acid-green/60 bg-acid-green/10 text-acid-green font-mono text-[11px] font-bold uppercase tracking-widest shadow-none select-none">
      <span className="w-2 h-2 bg-acid-green rounded-none" />
      <span>T-{minutosRestantes} MIN // A TIEMPO</span>
    </div>
  );
}
