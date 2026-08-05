import type { ResolvedBusService } from '@/lib/services/schedule.service';
import { calculateMarginMinutes } from '@/utils/time';

interface BusAlternativeRowProps {
  service: ResolvedBusService;
  /** Hora de referencia para calcular el margen (opcional) */
  referenceTime?: string;
  /** Ruta en texto corto */
  route: string;
}

/**
 * BusAlternativeRow
 *
 * Fila compacta para servicios alternativos al recomendado.
 * Menos prominente visualmente, muestra margen en badge sutil.
 * Puramente presentacional.
 */
export function BusAlternativeRow({
  service,
  referenceTime,
}: BusAlternativeRowProps) {
  const marginMinutes =
    referenceTime !== undefined
      ? calculateMarginMinutes(service.arrivalTime, referenceTime)
      : null;

  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      {/* Bloque de hora */}
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-[16px] font-semibold tabular-nums text-[var(--color-text-primary)] leading-none shrink-0">
          {service.departureTime}
        </span>
        <span className="text-[12px] text-[var(--color-text-secondary)] shrink-0">
          → {service.arrivalTime}
        </span>
        <span className="text-[13px] text-[var(--color-text-primary)] truncate">
          {service.companyName}
        </span>
      </div>

      {/* Margen en badge */}
      {marginMinutes !== null && (
        <span
          className="
            shrink-0
            text-[11px] font-medium
            px-2 py-0.5 rounded-full
            bg-[#f2f2f7] text-[var(--color-text-secondary)]
          "
          title={`${marginMinutes} min de margen`}
        >
          +{marginMinutes} min
        </span>
      )}
    </li>
  );
}
