"use client";

import type { ResolvedBusService } from '@/lib/services/schedule.service';
import { useMicroClima } from '@/hooks/useMicroClima';

interface BusServiceCardProps {
  service: ResolvedBusService;
}

/** Labels y estilos según el sentido del viaje en modo consola industrial. */
const DIRECTION_CONFIG = {
  ida: {
    label: 'IDA',
    route: 'DESPEÑADEROS → UTN',
    badgeClass: 'border-safety-orange/50 bg-safety-orange/15 text-safety-orange',
    dotClass: 'bg-safety-orange',
  },
  vuelta: {
    label: 'VUELTA',
    route: 'UTN → DESPEÑADEROS',
    badgeClass: 'border-acid-green/50 bg-acid-green/15 text-acid-green',
    dotClass: 'bg-acid-green',
  },
} as const;

/**
 * BusServiceCard
 * Display de datos de telemetría para un servicio de colectivo.
 */
export function BusServiceCard({ service }: BusServiceCardProps) {
  const config = DIRECTION_CONFIG[service.direction];
  const destino = service.direction === 'ida' ? 'cordoba' : 'despeñaderos';
  const clima = useMicroClima(destino, service.arrivalTime);

  return (
    <li className="p-3.5 my-2 bg-zinc-900 border border-zinc-800 rounded-sm list-none transition-colors hover:border-zinc-700 shadow-none">
      {/* Franja de estado superior: Dirección, Ruta y Empresa */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80 mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 border rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest ${config.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-none ${config.dotClass}`} />
            {config.label}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:inline">
            {config.route}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300 border border-zinc-800 bg-zinc-950 px-2 py-0.5 rounded-sm">
          {service.companyName}
        </span>
      </div>

      {/* Fila principal: Hora de salida en tipografía monoespaciada grande, llegada y clima */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div className="flex items-baseline gap-2.5">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 leading-none">
              {service.departureTime}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              DEP
            </span>
          </div>
          
          <span className="text-zinc-600 font-mono text-sm">→</span>
          
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-base sm:text-lg font-semibold tracking-tight text-zinc-300">
              {service.arrivalTime}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              ARR
            </span>
          </div>
        </div>

        {/* Telemetría climática */}
        {clima && (
          <div 
            className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-sm text-[10px] font-mono text-zinc-400 shrink-0 self-start sm:self-auto" 
            title={`Temp: ${clima.temp}°C, Lluvia: ${clima.lluvia}%`}
          >
            <span>{clima.emoji}</span>
            <span className="text-zinc-200 font-bold">{clima.temp}°C</span>
            <span className="text-zinc-500 uppercase">{clima.texto}</span>
          </div>
        )}
      </div>

      {/* Fila secundaria técnica: Línea / Ramal y Notas */}
      {(service.line || service.notes) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500">
          {service.line && (
            <span className="uppercase tracking-wider">
              RAMAL: <strong className="text-zinc-400 font-semibold">{service.line}</strong>
            </span>
          )}
          {service.line && service.notes && <span>{"//"}</span>}
          {service.notes && (
            <span className="text-zinc-400 italic">
              {service.notes}
            </span>
          )}
        </div>
      )}
    </li>
  );
}
