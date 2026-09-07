"use client";

import { ArrowRight, Bus } from 'lucide-react';
import type { ResolvedBusService } from '@/lib/services/schedule.service';
import { useMicroClima } from '@/hooks/useMicroClima';

export function BusServiceCard({ service }: { service: ResolvedBusService }) {
  const clima = useMicroClima(service.direction === 'ida' ? 'cordoba' : 'despeñaderos', service.arrivalTime);
  return (
    <li className="glass-panel list-none p-5">
      <div className="mb-4 flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-sm text-subtle"><Bus size={18} className="text-accent" />{service.direction === 'ida' ? 'Hacia Córdoba' : 'Hacia Despeñaderos'}</span><span className="text-sm font-semibold capitalize text-ink">{service.companyName}</span></div>
      <div className="flex flex-wrap items-center gap-4">
        <div><span className="text-sm text-subtle">Salida</span><p className="text-3xl font-bold tabular-nums tracking-tight text-ink">{service.departureTime}</p></div><ArrowRight className="text-subtle" size={19} /><div><span className="text-sm text-subtle">Llegada estimada</span><p className="text-xl font-semibold tabular-nums text-ink">{service.arrivalTime}</p></div>
      </div>
      {clima && <p className="mt-3 text-sm text-subtle" title={'Probabilidad de lluvia: ' + clima.lluvia + '%'}>{clima.emoji} {clima.temp} °C · Pronóstico: {clima.texto}</p>}
      {(service.line || service.notes) && <p className="mt-3 border-t border-line pt-3 text-sm text-subtle">{[service.line, service.notes].filter(Boolean).join(' · ')}</p>}
    </li>
  );
}
