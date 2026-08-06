"use client";

import { useState, useEffect } from 'react';

/**
 * Hook para calcular minutos restantes para un horario HH:MM
 */
export function useCountdown(horaSalida: string | undefined) {
  const [minutosFaltantes, setMinutosFaltantes] = useState<number | null>(null);

  useEffect(() => {
    if (!horaSalida) {
      setMinutosFaltantes(null);
      return;
    }

    const calculate = () => {
      const ahora = new Date();
      const [h, m] = horaSalida.split(':').map(Number);
      
      const salida = new Date();
      salida.setHours(h, m, 0, 0);

      // Si ya pasó, la diferencia será negativa
      const diffMs = salida.getTime() - ahora.getTime();
      const diffMins = Math.ceil(diffMs / 60000);
      
      setMinutosFaltantes(diffMins);
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [horaSalida]);

  return minutosFaltantes;
}
