'use client';
import { useState, useEffect } from 'react';

export default function IndicadorEstado({ horaSalida }: { horaSalida: string }) {
  const [minutos, setMinutos] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const [h, m] = horaSalida.split(':').map(Number);
      const now = new Date();
      const sal = new Date();
      sal.setHours(h, m, 0, 0);
      let diff = (sal.getTime() - now.getTime()) / 60000;
      setMinutos(diff);
    };
    update();
    const interval = setInterval(update, 60000); // Actualiza cada minuto
    return () => clearInterval(interval);
  }, [horaSalida]);

  if (minutos === null) return null;

  if (minutos > 30) {
    return (
      <div className="flex items-center gap-1.5 bg-zinc-950/50 px-2.5 py-1 rounded-full border border-green-500/20">
        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
        <span className="text-[10px] text-green-400 font-semibold tracking-wide uppercase">A tiempo</span>
      </div>
    );
  } else if (minutos >= 15) {
    return (
      <div className="flex items-center gap-1.5 bg-zinc-950/50 px-2.5 py-1 rounded-full border border-yellow-500/20">
        <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]"></span>
        <span className="text-[10px] text-yellow-400 font-semibold tracking-wide uppercase">Preparate</span>
      </div>
    );
  } else if (minutos > 0) {
    return (
      <div className="flex items-center gap-1.5 bg-zinc-950/50 px-2.5 py-1 rounded-full border border-red-500/20">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        <span className="text-[10px] text-red-400 font-semibold tracking-wide uppercase">¡Corré!</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5 bg-zinc-950/50 px-2.5 py-1 rounded-full border border-zinc-700">
      <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
      <span className="text-[10px] text-zinc-400 font-semibold tracking-wide uppercase">Salió</span>
    </div>
  );
}
