import type { RecommendationResult } from '@/lib/engine/recommendation-engine';
import { RecommendationSection } from './RecommendationSection';

interface RecommendationListProps {
  result: RecommendationResult;
}

/**
 * RecommendationList
 *
 * Punto de entrada de la feature de recomendaciones.
 * Orquesta las secciones de Ida y Vuelta y maneja el estado vacío global.
 *
 * Recibe `RecommendationResult` ya calculado por el engine — sin lógica propia.
 */
export function RecommendationList({ result }: RecommendationListProps) {
  const { ida, vuelta, hasData } = result;

  /* Empty state global: sin datos suficientes para recomendar */
  if (!hasData) {
    return (
      <section aria-label="Recomendaciones de colectivos">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">
          Colectivos
        </p>
        <p className="text-[14px] text-[var(--color-text-secondary)] py-3">
          Sin datos suficientes para generar recomendaciones.
        </p>
      </section>
    );
  }

  return (
    <section
      className="flex flex-col gap-5"
      aria-label="Recomendaciones de colectivos"
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
        Colectivos
      </p>

      {/* ── Ida ──────────────────────────────────────── */}
      <RecommendationSection group={ida} direction="ida" />

      {/* ── Separador ────────────────────────────────── */}
      <div className="border-t border-[var(--color-border)]" />

      {/* ── Vuelta ───────────────────────────────────── */}
      <RecommendationSection group={vuelta} direction="vuelta" />
    </section>
  );
}
