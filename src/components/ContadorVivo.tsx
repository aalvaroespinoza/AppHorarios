'use client';

import { useCountdown } from '@/hooks/useCountdown';

export default function ContadorVivo({ horaSalida }: { horaSalida: string }) {
  const minutes = useCountdown(horaSalida);
  const text = minutes === null ? 'Calculando…' : minutes < 0 ? 'El horario ya pasó' : minutes === 0 ? 'Salida programada ahora' : minutes > 60 ? 'Programado a las ' + horaSalida : 'Sale en ' + minutes + ' min';
  return <span className={'glass-pill inline-flex px-3 py-1.5 text-sm font-medium ' + (minutes !== null && minutes >= 0 && minutes <= 15 ? 'bg-accent/10 text-accent' : 'text-subtle')}>{text}</span>;
}
