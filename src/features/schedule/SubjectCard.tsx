"use client";

import { motion } from 'framer-motion';
import type { Subject } from '@/types/subject';
import { formatTimeRange } from '@/core/utils/date';
import { SPRING_CONFIG } from '@/lib/animations';
import { getEdificio, parseMateria } from '@/core/utils/edificio';

interface SubjectCardProps {
  subject: Subject;
}

/**
 * SubjectCard
 *
 * Fila compacta que muestra una materia con su horario.
 * No tiene interacción ni lógica.
 */
export function SubjectCard({ subject }: SubjectCardProps) {
  const materia = parseMateria(subject.name || subject);
  const curso = materia.curso || (subject as any).curso;
  const aula = materia.aula || (subject as any).aula;
  const edificioName = getEdificio(aula);

  return (
    <motion.li 
      variants={{
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: SPRING_CONFIG
        }
      }}
      className="flex items-start justify-between gap-4 py-3"
    >
      <div className="flex flex-col text-center min-w-0 w-full">
        <div className="flex items-center justify-center gap-2">
          {subject.color && (
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${subject.color.split(' ')[0]}`} />
          )}
          <span className="font-bold text-sm text-[var(--color-text-primary)] truncate leading-snug">
            {materia.nombre}
          </span>
          {subject.isOptional && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm shrink-0">
              Opcional
            </span>
          )}
        </div>

        {(curso || aula) && (
          <span className="text-xs mt-1">
            {curso ? `Curso: ${curso}` : ''}
            {curso && aula ? ' | ' : ''}
            {aula ? `Aula: ${aula}` : ''}
          </span>
        )}

        {edificioName && (
          <span className="text-xs font-semibold opacity-80">
            📍 {edificioName}
          </span>
        )}

        {/* Bloques horarios */}
        {subject.classBlocks.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1">
            {subject.classBlocks.map((block, i) => (
              <li
                key={i}
                className="text-[12px] text-[var(--color-text-secondary)] flex items-center gap-1"
              >
                <span className="capitalize">{block.day}</span>
                <span aria-hidden="true">·</span>
                <span>{formatTimeRange(block.startTime, block.endTime)}</span>
              </li>
            ))}
            <li className="text-[12px] text-[var(--color-text-secondary)] flex items-center gap-1">
              <span aria-hidden="true">·</span>
              <span className="capitalize">{subject.modality}</span>
            </li>
          </ul>
        )}
      </div>

      {/* Turno */}
      <span
        className="
          shrink-0 mt-0.5
          text-[11px] font-medium uppercase tracking-wide
          text-[var(--color-text-secondary)]
        "
      >
        {subject.shift}
      </span>
    </motion.li>
  );
}
