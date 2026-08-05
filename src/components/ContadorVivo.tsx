'use client';

import { useState, useEffect } from 'react';

interface Props {
  horaSalida: string;
}

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
    return <span className="opacity-0 text-xs">Calculando...</span>;
  }

  // Escenario 1: Ya se fue
  if (minutosRestantes < 0) {
    return <span className="text-white/60 font-medium text-xs tracking-wide bg-black/20 px-3 py-1 rounded-full">El colectivo ya pasó</span>;
  }

  // Escenario 2: Falta mucho (> 1 hora)
  if (minutosRestantes > 60) {
    return <span className="text-white/90 font-medium text-xs tracking-wide">Sale a las <span className="font-bold">{horaSalida}</span></span>;
  }

  // Escenario 3: ¡Alerta! Menos de 15 minutos (Corre!)
  if (minutosRestantes <= 15) {
    return (
      <span className="font-bold text-white text-xs bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] px-3 py-1 rounded-full flex items-center gap-1 animate-pulse border border-red-400">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Faltan {minutosRestantes} min
      </span>
    );
  }

  // Escenario 4: Entre 16 y 60 minutos
  return (
    <span className="font-bold text-white text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full shadow-inner flex items-center gap-1 border border-white/10">
      <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      Faltan {minutosRestantes} min
    </span>
  );
}
