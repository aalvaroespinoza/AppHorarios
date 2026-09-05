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
 * Lista las materias activas del escenario en formato de matriz técnica.
 */
export function SubjectList({ subjects }: SubjectListProps) {
  return (
    <section aria-label="Materias del día" className="flex flex-col gap-2">
      {/* Etiqueta de sección de telemetría */}
      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
        [SYS.ACADEMIC // MATERIAS]
      </p>

      {subjects.length === 0 ? (
        <div className="border border-zinc-800 bg-zinc-900 rounded-sm p-5 text-center text-xs font-mono text-zinc-500 uppercase tracking-wider">
          [SIN MATERIAS REGISTRADAS PARA ESTE DÍA]
        </div>
      ) : (
        <motion.ul
          className="flex flex-col gap-1.5"
          aria-label="Lista de materias"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1, 
              transition: { staggerChildren: 0.05 } 
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
