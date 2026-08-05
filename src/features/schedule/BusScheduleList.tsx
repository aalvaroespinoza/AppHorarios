import type { ScheduleForDay } from '@/lib/services/schedule.service';
import { BusServiceCard } from './BusServiceCard';

interface BusScheduleListProps {
  schedule: ScheduleForDay;
}

/**
 * Etiqueta de grupo (IDA / VUELTA) con contador de servicios.
 */
function GroupLabel({
  label,
  count,
  dotClass,
}: {
  label: string;
  count: number;
  dotClass: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} aria-hidden="true" />
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
        {label}
      </p>
      <span className="text-[11px] text-[var(--color-text-secondary)] ml-auto">
        {count} {count === 1 ? 'servicio' : 'servicios'}
      </span>
    </div>
  );
}

/**
 * BusScheduleList
 *
 * Renderiza los servicios de colectivo agrupados por sentido:
 *   IDA (Despeñaderos → UTN) primero,
 *   VUELTA (UTN → Despeñaderos) segundo.
 *
 * Cada grupo muestra un empty state si no hay servicios.
 * Puramente presentacional — recibe datos ya procesados.
 */
export function BusScheduleList({ schedule }: BusScheduleListProps) {
  const { ida, vuelta } = schedule;
  const noServices = ida.length === 0 && vuelta.length === 0;

  if (noServices) {
    return (
      <section aria-label="Horarios de colectivos">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">
          Colectivos
        </p>
        <p className="text-[14px] text-[var(--color-text-secondary)] py-3">
          Sin horarios registrados para este día.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Horarios de colectivos">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
        Colectivos
      </p>

      <div className="flex flex-col gap-4">
        {/* ── IDA ─────────────────────────────────────── */}
        {ida.length > 0 && (
          <div>
            <GroupLabel
              label="Ida"
              count={ida.length}
              dotClass="bg-[var(--color-accent)]"
            />
            <ul
              className="divide-y divide-[var(--color-border)]"
              aria-label="Servicios de ida"
            >
              {ida.map((service) => (
                <BusServiceCard key={service.id} service={service} />
              ))}
            </ul>
          </div>
        )}

        {/* ── VUELTA ──────────────────────────────────── */}
        {vuelta.length > 0 && (
          <div>
            <GroupLabel
              label="Vuelta"
              count={vuelta.length}
              dotClass="bg-[#34c759]"
            />
            <ul
              className="divide-y divide-[var(--color-border)]"
              aria-label="Servicios de vuelta"
            >
              {vuelta.map((service) => (
                <BusServiceCard key={service.id} service={service} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
