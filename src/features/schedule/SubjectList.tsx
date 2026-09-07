"use client";

import type { Subject } from '@/types/subject';
import { SubjectCard } from './SubjectCard';

export function SubjectList({ subjects }: { subjects: Subject[] }) {
  return <section aria-label="Materias del día" className="space-y-3">
    <h2 className="section-label">Tus materias</h2>
    {subjects.length === 0 ? <div className="glass-panel p-6 text-center text-subtle">No hay materias para este día.</div> :
      <ul className="space-y-3" aria-label="Lista de materias">{subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} />)}</ul>}
  </section>;
}
