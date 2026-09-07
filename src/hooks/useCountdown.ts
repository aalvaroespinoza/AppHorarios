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
      const localTime = new Intl.DateTimeFormat('es-AR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hourCycle: 'h23', timeZone: 'America/Argentina/Cordoba',
      }).format(new Date());
      const [hours, minutes, seconds] = localTime.split(':').map(Number);
      const [departureHours, departureMinutes] = horaSalida.split(':').map(Number);
      const diffMins = Math.ceil((departureHours * 3600 + departureMinutes * 60 - hours * 3600 - minutes * 60 - seconds) / 60);
      
      setMinutosFaltantes(diffMins);
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [horaSalida]);

  return minutosFaltantes;
}
