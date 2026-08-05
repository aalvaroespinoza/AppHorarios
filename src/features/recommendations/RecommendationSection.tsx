import type { RecommendationGroup } from '@/lib/engine/recommendation-engine';
import { RecommendedBusCard } from './RecommendedBusCard';
import { BusAlternativeRow } from './BusAlternativeRow';

interface RecommendationSectionProps {
  group: RecommendationGroup;
  /** 'ida' o 'vuelta' — determina label, ruta y si se muestra margen */
  direction: 'ida' | 'vuelta';
}

const DIRECTION_META = {
  ida: {
    label: 'Ida',
    route: 'Despeñaderos → UTN',
  },
  vuelta: {
    label: 'Vuelta',
    route: 'UTN → Despeñaderos',
  },
} as const;

/**
 * RecommendationSection
 *
 * Sección para un sentido (ida o vuelta) que muestra:
 *   1. Tarjeta del colectivo recomendado (o mensaje si no hay)
 *   2. Lista de alternativas (si existen)
 *
 * No contiene lógica de clasificación — recibe el grupo ya calculado.
 */
export function RecommendationSection({
  group,
  direction,
}: RecommendationSectionProps) {
  const meta = DIRECTION_META[direction];
  const { recommended, alternatives, cutoffTime } = group;

  // Sin recomendado ni alternativas
  if (!recommended && alternatives.length === 0) {
    return (
      <div>
        <SectionLabel direction={direction} />
        <p className="text-[13px] text-[var(--color-text-secondary)] py-2">
          Sin colectivos disponibles{' '}
          {cutoffTime
            ? direction === 'ida'
              ? `que lleguen antes de las ${cutoffTime}`
              : `después de las ${cutoffTime}`
            : 'para este sentido'}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel direction={direction} />

      {/* ── Recomendado ───────────────────────────────── */}
      {recommended && (
        <RecommendedBusCard
          service={recommended}
          referenceTime={direction === 'ida' ? cutoffTime ?? undefined : undefined}
          directionLabel={meta.label}
          route={meta.route}
        />
      )}

      {/* ── Alternativas ──────────────────────────────── */}
      {alternatives.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">
            Alternativas
          </p>
          <ul
            className="divide-y divide-[var(--color-border)]"
            aria-label={`Alternativas de ${meta.label}`}
          >
            {alternatives.map((svc) => (
              <BusAlternativeRow
                key={svc.id}
                service={svc}
                referenceTime={direction === 'ida' ? cutoffTime ?? undefined : undefined}
                route={meta.route}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Sub-componente interno ───────────────────────────────────────────────────

function SectionLabel({ direction }: { direction: 'ida' | 'vuelta' }) {
  const dotClass =
    direction === 'ida' ? 'bg-[var(--color-accent)]' : 'bg-[#34c759]';
  const label = direction === 'ida' ? 'Ida' : 'Vuelta';

  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
        {label}
      </p>
    </div>
  );
}
