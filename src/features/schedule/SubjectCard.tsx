"use client";

import { motion } from 'framer-motion';
import type { Subject } from '@/types/subject';
import { formatTimeRange } from '@/core/utils/date';
import { SPRING_CONFIG } from '@/lib/animations';
import { parseMateriaRawText } from '@/core/utils/materiaParser';

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
  const parsed = parseMateriaRawText(subject.name);

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
      <div className="flex flex-col items-center text-center justify-center h-full w-full min-w-0">
        {parsed.curso ? (
          <div className="flex flex-col items-center text-center justify-center h-full w-full p-1 gap-0.5">
            <span className="font-bold text-xs leading-tight">{parsed.nombre}</span>
            <span className="text-[11px] opacity-80 font-medium">
              {parsed.curso} | Aula {parsed.aula}
            </span>
            <span className="text-[10px] font-bold text-neutral-900 dark:text-white bg-black/10 dark:bg-white/20 px-1.5 py-0.5 rounded-md mt-0.5">
              📍 {parsed.edificio}
            </span>
          </div>
        ) : (
          <span className="text-xs text-center font-bold">{parsed.nombre}</span>
        )}

        {/* Bloques horarios */}
        {subject.classBlocks && subject.classBlocks.length > 0 && (
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
      {subject.shift && (
        <span
          className="
            shrink-0 mt-0.5
            text-[11px] font-medium uppercase tracking-wide
            text-[var(--color-text-secondary)]
          "
        >
          {subject.shift}
        </span>
      )}
    </motion.li>
  );
}
