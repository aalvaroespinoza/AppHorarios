'use client';

import { useCountdown } from '@/hooks/useCountdown';

export default function IndicadorEstado({ horaSalida }: { horaSalida: string }) {
  const minutes = useCountdown(horaSalida);
  if (minutes === null) return null;
  return <span className={'glass-pill inline-flex px-3 py-1.5 text-sm font-medium ' + (minutes >= 0 && minutes <= 15 ? 'text-accent' : 'text-subtle')}>{minutes < 0 ? 'Horario pasado' : minutes === 0 ? 'Salida programada ahora' : minutes <= 15 ? 'Salida próxima' : 'Programado'}</span>;
}
