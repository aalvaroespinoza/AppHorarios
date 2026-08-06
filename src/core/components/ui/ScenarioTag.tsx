import type { ScenarioId } from '@/types/scenario';

interface ScenarioTagProps {
  scenarioId: ScenarioId | null;
  label: string | null;
}

/**
 * ScenarioTag
 *
 * Pill que muestra el escenario activo del día.
 * Si no hay escenario (null), muestra un estado neutro.
 */
export function ScenarioTag({ scenarioId, label }: ScenarioTagProps) {
  if (!scenarioId || !label) {
    return (
      <span
        className="
          inline-flex items-center
          px-2.5 py-0.5 rounded-full
          text-[12px] font-medium
          bg-[#f2f2f7] text-[var(--color-text-secondary)]
        "
      >
        Sin cursada
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex items-center
        px-2.5 py-0.5 rounded-full
        text-[12px] font-medium
        bg-[#e8f0fe] text-[var(--color-accent)]
      "
    >
      {label}
    </span>
  );
}
