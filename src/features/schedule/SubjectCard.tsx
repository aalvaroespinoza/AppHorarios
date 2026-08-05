"use client";

import { motion } from 'framer-motion';
import type { Subject } from '@/types/subject';
import { formatTimeRange } from '@/utils/date';

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
  return (
    <motion.li 
      variants={{
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: { type: "spring", bounce: 0, duration: 0.4 }
        }
      }}
      className="flex items-start justify-between gap-4 py-3"
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          {subject.color && (
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${subject.color.split(' ')[0]}`} />
          )}
          <span className="text-[15px] font-medium text-[var(--color-text-primary)] truncate leading-snug">
            {subject.name}
          </span>
          {subject.isOptional && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm shrink-0">
              Opcional
            </span>
          )}
        </div>

        {/* Bloques horarios */}
        {subject.classBlocks.length > 0 && (
          <ul className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
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
