import { ScenarioTag } from '@/components/ui/ScenarioTag';
import { SubjectList } from '@/features/schedule/SubjectList';
import { BusScheduleList } from '@/features/schedule/BusScheduleList';
import { determineScenario, findScenario } from '@/lib/engine';
import { getScheduleForDay } from '@/lib/services';
import { subjectData } from '@/data/subjects';
import { rawScheduleEntries } from '@/data/schedules';
import { companies } from '@/data/companies';
import { formatDateLong } from '@/utils/date';

interface DayViewProps {
  /** Fecha a mostrar. La lógica se computa a partir de ella. */
  date: Date;
  /**
   * Desambiguación de Arquitectura para los martes.
   * Se podrá conectar a un toggle en el futuro.
   */
  tuesdayHasArquitectura?: boolean;
}

/**
 * DayView — Server Component compartido
 *
 * Encapsula el pipeline completo para un día:
 *   date → escenario → materias → horarios → UI
 *
 * (Versión inicial funcional: sin recomendaciones)
 */
export function DayView({
  date,
  tuesdayHasArquitectura = false,
}: DayViewProps) {
  /* ── 1. Fecha ─────────────────────────────────────────────── */
  const dateLabel = formatDateLong(date);

  /* ── 2. Escenario + materias ──────────────────────────────── */
  const scenarioId = determineScenario({ tuesdayHasArquitectura, referenceDate: date });
  const scenario = scenarioId ? findScenario(scenarioId) : null;

  const activeSubjects = scenario
    ? subjectData.subjects.filter((s) =>
        scenario.activeSubjectIds.includes(s.id),
      )
    : [];

  /* ── 3. Horarios del día ──────────────────────────────────── */
  const busSchedule = scenario
    ? getScheduleForDay(scenario.day, rawScheduleEntries, Object.values(companies))
    : { ida: [], vuelta: [] };

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div
      className="
        w-full max-w-md
        bg-[var(--color-surface)]
        rounded-2xl
        border border-[var(--color-border)]
        shadow-sm
        overflow-hidden
      "
    >
      {/* ── Encabezado: fecha + escenario ── */}
      <div className="px-5 pt-5 pb-4">

        {/* Fecha */}
        <p className="text-[12px] text-[var(--color-text-secondary)] mb-2 capitalize">
          {dateLabel}
        </p>

        {/* Escenario + badge */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[20px] font-semibold text-[var(--color-text-primary)] leading-snug">
            {scenario ? scenario.label : 'Sin cursada'}
          </h2>
          <ScenarioTag
            scenarioId={scenarioId}
            label={scenario?.label ?? null}
          />
        </div>

      </div>

      {/* ── Materias ──────────────────────────────────────────── */}
      <div className="border-t border-[var(--color-border)]" />
      <div className="px-5 py-4">
        <SubjectList subjects={activeSubjects} />
      </div>

      {/* ── Horarios de Colectivos (Ida/Vuelta) ───────────────── */}
      <div className="border-t border-[var(--color-border)]" />
      <div className="px-5 py-4">
        <BusScheduleList schedule={busSchedule} />
      </div>

    </div>
  );
}
