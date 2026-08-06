"use client";

import type { ResolvedBusService } from '@/lib/services/schedule.service';
import { useMicroClima } from '@/hooks/useMicroClima';

interface BusServiceCardProps {
  service: ResolvedBusService;
}

/** Labels y estilos según el sentido del viaje. */
const DIRECTION_CONFIG = {
  ida: {
    label: 'Ida',
    route: 'Despeñaderos → UTN',
    dotClass: 'bg-[var(--color-accent)]',
  },
  vuelta: {
    label: 'Vuelta',
    route: 'UTN → Despeñaderos',
    dotClass: 'bg-[#34c759]',
  },
} as const;

/**
 * BusServiceCard
 *
 * Fila que muestra un servicio de colectivo con:
 *   - Hora de salida (prominente)
 *   - Hora de llegada
 *   - Empresa
 *   - Sentido (indicador de color)
 *   - Línea / ramal (si existe)
 *   - Notas (si existen)
 *
 * Puramente presentacional — sin lógica ni estado.
 */
export function BusServiceCard({ service }: BusServiceCardProps) {
  const config = DIRECTION_CONFIG[service.direction];
  const destino = service.direction === 'ida' ? 'cordoba' : 'despeñaderos';
  const climaEmoji = useMicroClima(destino, service.arrivalTime);

  return (
    <li className="flex items-start gap-3.5 py-3">
      {/* Indicador de sentido */}
      <div className="flex flex-col items-center pt-1 shrink-0">
        <span
          className={`w-2 h-2 rounded-full mt-0.5 ${config.dotClass}`}
          aria-hidden="true"
        />
      </div>

      {/* Bloque horario */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        {/* Fila principal: hora + empresa */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            {/* Hora de salida — tamaño prominente */}
            <span className="text-[18px] font-semibold tabular-nums text-[var(--color-text-primary)] leading-none">
              {service.departureTime}
            </span>
            {/* Flecha + hora de llegada + Clima */}
            <span className="text-[13px] text-[var(--color-text-secondary)] flex items-center gap-1">
              → {service.arrivalTime} {climaEmoji && <span className="ml-2">{climaEmoji}</span>}
            </span>
          </div>

          {/* Empresa */}
          <span className="text-[13px] font-medium text-[var(--color-text-primary)] shrink-0">
            {service.companyName}
          </span>
        </div>

        {/* Fila secundaria: ruta + línea */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            {config.route}
          </span>
          {service.line && (
            <>
              <span className="text-[var(--color-border)]" aria-hidden="true">·</span>
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                {service.line}
              </span>
            </>
          )}
        </div>

        {/* Notas opcionales */}
        {service.notes && (
          <p className="text-[11px] text-[var(--color-text-secondary)] italic mt-0.5">
            {service.notes}
          </p>
        )}
      </div>
    </li>
  );
}
