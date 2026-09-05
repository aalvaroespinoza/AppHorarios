'use client';
import { useState, useEffect } from 'react';

/**
 * IndicadorEstado
 * Indicador de telemetría de estado del servicio con LED y estilo terminal.
 */
export default function IndicadorEstado({ horaSalida }: { horaSalida: string }) {
  const [minutos, setMinutos] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const [h, m] = horaSalida.split(':').map(Number);
      const now = new Date();
      const sal = new Date();
      sal.setHours(h, m, 0, 0);
      const diff = (sal.getTime() - now.getTime()) / 60000;
      setMinutos(diff);
    };
    update();
    const interval = setInterval(update, 60000); // Actualiza cada minuto
    return () => clearInterval(interval);
  }, [horaSalida]);

  if (minutos === null) return null;

  if (minutos > 30) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-zinc-950 border border-acid-green/40 px-2 py-0.5 rounded-sm shadow-none select-none">
        <span className="w-1.5 h-1.5 rounded-none bg-acid-green" />
        <span className="text-[10px] text-acid-green font-mono font-bold tracking-widest uppercase">A TIEMPO</span>
      </div>
    );
  } else if (minutos >= 15) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-zinc-950 border border-amber-500/50 px-2 py-0.5 rounded-sm shadow-none select-none">
        <span className="w-1.5 h-1.5 rounded-none bg-amber-400" />
        <span className="text-[10px] text-amber-400 font-mono font-bold tracking-widest uppercase">PREPARAR</span>
      </div>
    );
  } else if (minutos > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-zinc-950 border border-safety-orange px-2 py-0.5 rounded-sm shadow-none animate-pulse select-none">
        <span className="w-1.5 h-1.5 rounded-none bg-safety-orange" />
        <span className="text-[10px] text-safety-orange font-mono font-extrabold tracking-widest uppercase">¡CORRÉ!</span>
      </div>
    );
  }
  
  return (
    <div className="inline-flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-sm shadow-none select-none">
      <span className="w-1.5 h-1.5 rounded-none bg-zinc-600" />
      <span className="text-[10px] text-zinc-500 font-mono font-semibold tracking-widest uppercase">SALIÓ</span>
    </div>
  );
}
