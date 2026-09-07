"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Bus, ChevronDown, Clock3, MapPin, RotateCcw, TicketCheck, ArrowRight } from 'lucide-react';
import { addMinutes, OFFSET_PARADA_VUELTA_MIN } from '@/lib/engine/recommendation-engine';
import { useCountdown } from '@/hooks/useCountdown';
import { useLocalStorageState } from '@/core/hooks/useLocalStorageState';
import EntertainmentSelector from '@/components/EntertainmentSelector';
import type { RawScheduleEntry } from '@/types/schedule';
import type { useBec } from '@/hooks/useBec';

export const formatMinutosFaltantes = (mins: number) => {
  if (mins < 60) return mins + ' min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? h + ' h' : h + ' h ' + m + ' min';
};

interface HorarioCardProps {
  titulo: string;
  recomendacion: { recomendado: RawScheduleEntry | null; alternativas: RawScheduleEntry[] };
  icon?: React.ElementType;
  direction: 'ida' | 'vuelta';
  bec: ReturnType<typeof useBec>;
  isToday?: boolean;
  diaSeleccionado?: string;
  compact?: boolean;
  onInteraction?: () => void;
}

const sameService = (a: RawScheduleEntry, b: RawScheduleEntry) => a.empresa === b.empresa && a.horaSalida === b.horaSalida && a.sentido === b.sentido && a.dia === b.dia;

export function HorarioCard({ titulo, recomendacion, icon: Icon = Bus, direction, bec, isToday = true, diaSeleccionado = 'lunes', compact = false, onInteraction }: HorarioCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [alternativesOpen, setAlternativesOpen] = useState(false);
  // Keep the existing key format so previously selected services remain available.
  const todayDateStr = new Date().toISOString().split('T')[0];
  const storageKey = 'selected-bus-' + todayDateStr + '-' + diaSeleccionado + '-' + direction;
  const [overrideBus, setOverrideBus, selectionLoaded] = useLocalStorageState<RawScheduleEntry | null>(storageKey, null);
  const options = recomendacion.recomendado ? [recomendacion.recomendado, ...recomendacion.alternativas] : recomendacion.alternativas;
  const manual = selectionLoaded && overrideBus !== null && options.some(option => sameService(option, overrideBus));
  const current = manual ? overrideBus : recomendacion.recomendado;
  const alternatives = options.filter(option => !current || !sameService(option, current));
  const isReturn = direction === 'vuelta';
  const stopTime = (entry: RawScheduleEntry) => isReturn ? addMinutes(entry.horaSalida, OFFSET_PARADA_VUELTA_MIN) : entry.horaSalida;
  const minutes = useCountdown(isToday && current ? stopTime(current) : undefined);
  const record = bec.getRegistroHoy();
  const becUsed = isToday && (isReturn ? record.vueltaUsado : record.idaUsado);
  const isCollapsed = compact && !expanded;
  const touch = () => onInteraction?.();
  const status = !isToday ? 'Horario programado' : minutes === null ? 'Horario programado' : minutes < 0 ? 'El horario ya pasó' : minutes === 0 ? 'Salida programada ahora' : 'En ' + formatMinutosFaltantes(minutes);

  return (
    <section className={'glass-panel min-w-0 overflow-hidden ' + (!compact ? 'aurora-border' : '')} aria-label={titulo}>
      {isCollapsed ? (
        <button type="button" onClick={() => { touch(); setExpanded(true); }} className="flex min-h-20 w-full items-center gap-3 px-5 py-4 text-left" aria-expanded={false}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-accent"><Icon size={20} /></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">{titulo}</span><span className="mt-1 block text-sm text-subtle">{current ? (stopTime(current) + ' · ' + (isReturn ? 'Ministerio' : 'Despeñaderos')) : 'Consultar opciones'}</span></span>
          <ChevronDown size={18} className="shrink-0 text-subtle" />
        </button>
      ) : (
        <div className="p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Icon size={21} /></span>
              <div className="min-w-0"><p className="section-label">{compact ? 'También en tu día' : 'Tu próximo viaje'}</p><h2 className="mt-0.5 text-base font-semibold text-ink">{titulo}</h2></div>
            </div>
            {compact && <button type="button" onClick={() => setExpanded(false)} className="glass-button h-11 w-11 shrink-0 p-0" aria-label="Resumir viaje" aria-expanded={true}><ChevronDown size={18} className="rotate-180" /></button>}
          </div>

          {current ? (
            <>
              <div className="rounded-3xl bg-elevated px-4 py-5">
                <p className="mb-2 flex items-center gap-1.5 text-sm text-subtle"><MapPin size={15} />{isReturn ? 'Parada Ministerio' : 'Desde Despeñaderos'}</p>
                <div className="time-display text-ink">{stopTime(current)}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={'glass-pill px-3 py-1.5 text-sm font-semibold ' + (isToday && minutes !== null && minutes >= 0 ? 'bg-accent/10 text-accent' : 'text-subtle')}>{status}</span>
                  <span className="text-sm capitalize text-subtle">{current.empresa}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                <span className="flex items-center gap-2 text-subtle"><Clock3 size={16} />Llegada estimada</span>
                <span className="font-semibold tabular-nums text-ink">{current.horaLlegada}</span>
              </div>
              <button type="button" className="glass-primary aurora-border flex w-full items-center justify-center gap-2" onClick={() => { touch(); setDetailsOpen(!detailsOpen); }} aria-expanded={detailsOpen}>
                {detailsOpen ? 'Cerrar detalle' : 'Detalle del viaje'}<ChevronDown size={17} className={detailsOpen ? 'rotate-180' : ''} />
              </button>
              {detailsOpen && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-sm leading-relaxed text-subtle">Horario programado, sin seguimiento en vivo.{isReturn && <> Sale de la terminal de Córdoba a las <strong className="tabular-nums text-ink">{current.horaSalida}</strong>; el paso por Ministerio es estimado.</>}</p>
                  {current.notas && <p className="mt-2 text-sm text-subtle">{current.notas}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {isToday && <button type="button" aria-pressed={becUsed} className={'glass-button gap-2 ' + (becUsed ? 'text-success' : '')} onClick={() => becUsed ? bec.desmarcarViaje(direction) : bec.marcarViaje(direction)}><TicketCheck size={18} />{becUsed ? 'BEC registrado · Deshacer' : 'Registrar uso de BEC'}</button>}
                    {manual && <button type="button" className="glass-button gap-2" onClick={() => setOverrideBus(null)}><RotateCcw size={16} />Volver al sugerido</button>}
                  </div>
                  <EntertainmentSelector />
                </div>
              )}
              {manual && <p className="mt-3 text-sm text-subtle">Elegido por vos</p>}
            </>
          ) : (
            <div className="rounded-3xl bg-elevated p-4">
              <p className="text-base font-semibold text-ink">Sin viaje sugerido</p>
              <p className="mt-2 text-sm leading-relaxed text-subtle">{alternatives.length ? 'Los servicios restantes no coinciden con tu cursado. Podés consultar sus horarios.' : 'No hay un servicio disponible que coincida con tu cursado y este horario.'}</p>
              <Link className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent" href="/horarios">Ver todos los horarios<ArrowRight size={16} /></Link>
            </div>
          )}

          {alternatives.length > 0 && (
            <div className="mt-3">
              <button type="button" className="flex min-h-11 w-full items-center justify-between gap-2 text-sm font-semibold text-subtle" aria-expanded={alternativesOpen} onClick={() => { touch(); setAlternativesOpen(!alternativesOpen); }}><span>Alternativas <span className="font-normal">({alternatives.length})</span></span><ChevronDown size={17} className={alternativesOpen ? 'rotate-180' : ''} /></button>
              {alternativesOpen && <div className="mt-2 flex max-h-80 flex-col gap-2 overflow-y-auto">
                <p className="mb-1 text-sm text-subtle">Compará la llegada con tu cursado antes de elegir.</p>
                {alternatives.map(alt => <button type="button" key={alt.empresa + alt.horaSalida} onClick={() => { setOverrideBus(alt); setAlternativesOpen(false); }} className="flex min-h-16 w-full flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-elevated px-4 py-3 text-left transition-colors hover:bg-muted">
                  <span><span className="block text-lg font-semibold tabular-nums text-ink">{stopTime(alt)}</span><span className="block text-sm capitalize text-subtle">{alt.empresa}</span></span><span className="text-sm text-subtle">Llega <strong className="tabular-nums text-ink">{alt.horaLlegada}</strong></span>
                </button>)}
              </div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
