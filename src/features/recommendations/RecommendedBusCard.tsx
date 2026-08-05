import type { ResolvedBusService } from '@/lib/services/schedule.service';
import { calculateMarginMinutes } from '@/utils/time';

interface RecommendedBusCardProps {
  service: ResolvedBusService;
  /** Hora de inicio de clase — para calcular el margen a mostrar (solo ida) */
  referenceTime?: string;
  /** Texto del label de sentido ("Ida" | "Vuelta") */
  directionLabel: string;
  /** Ruta en texto ("Despeñaderos → UTN" | "UTN → Despeñaderos") */
  route: string;
}

/**
 * RecommendedBusCard
 *
 * Tarjeta destacada para el colectivo recomendado.
 * Visualmente diferenciada: borde izquierdo de color, fondo sutil,
 * badge "⭐ Recomendado" y margen de tiempo visible.
 *
 * Puramente presentacional — no contiene lógica.
 */
export function RecommendedBusCard({
  service,
  referenceTime,
  directionLabel,
  route,
}: RecommendedBusCardProps) {
  const marginMinutes =
    referenceTime !== undefined
      ? calculateMarginMinutes(service.arrivalTime, referenceTime)
      : null;

  return (
    <div
      className="
        relative
        rounded-xl
        border border-[var(--color-border)]
        bg-[#f0f7ff]
        border-l-[3px] border-l-[var(--color-accent)]
        px-4 py-3.5
      "
      aria-label={`Colectivo recomendado de ${directionLabel}: sale a las ${service.departureTime}`}
    >
      {/* Badge */}
      <p className="text-[11px] font-semibold text-[var(--color-accent)] mb-2 flex items-center gap-1">
        <span aria-hidden="true">⭐</span>
        Recomendado · {directionLabel}
      </p>

      {/* Fila principal: hora salida + empresa */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-bold tabular-nums text-[var(--color-text-primary)] leading-none">
            {service.departureTime}
          </span>
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            → {service.arrivalTime}
          </span>
        </div>
        <span className="text-[14px] font-semibold text-[var(--color-text-primary)] shrink-0">
          {service.companyName}
        </span>
      </div>

      {/* Ruta + línea */}
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="text-[12px] text-[var(--color-text-secondary)]">
          {route}
        </span>
        {service.line && (
          <>
            <span className="text-[var(--color-border)]" aria-hidden="true">·</span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">
              {service.line}
            </span>
          </>
        )}
      </div>

      {/* Margen de tiempo */}
      {marginMinutes !== null && marginMinutes > 0 && (
        <p className="mt-2 text-[12px] text-[var(--color-accent)] font-medium">
          Llega {marginMinutes} min antes del inicio de clase
        </p>
      )}

      {/* Notas */}
      {service.notes && (
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)] italic">
          {service.notes}
        </p>
      )}
    </div>
  );
}
