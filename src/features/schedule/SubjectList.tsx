"use client";

import { motion } from 'framer-motion';
import type { Subject } from '@/types/subject';
import { SubjectCard } from './SubjectCard';

interface SubjectListProps {
  subjects: Subject[];
}

/**
 * SubjectList
 *
 * Lista las materias activas del escenario.
 * Muestra un empty state si no hay materias cargadas todavía.
 */
export function SubjectList({ subjects }: SubjectListProps) {
  return (
    <section aria-label="Materias del día">
      {/* Etiqueta de sección */}
      <p
        className="
          text-[11px] font-semibold uppercase tracking-widest
          text-[var(--color-text-secondary)]
          mb-1
        "
      >
        Materias
      </p>

      {subjects.length === 0 ? (
        /* Empty state */
        <p className="text-[14px] text-[var(--color-text-secondary)] py-3">
          Sin materias registradas para este día.
        </p>
      ) : (
        <motion.ul
          className="divide-y divide-[var(--color-border)]"
          aria-label="Lista de materias"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1, 
              transition: { staggerChildren: 0.1 } 
            }
          }}
        >
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </motion.ul>
      )}
    </section>
  );
}
