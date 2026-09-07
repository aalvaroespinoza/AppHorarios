"use client";

import { useState } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import type { Subject } from '@/types/subject';
import { parseMateriaRawText } from '@/core/utils/materiaParser';
import { MateriaDetailModal } from '@/components/MateriaDetailModal';

export function SubjectCard({ subject }: { subject: Subject }) {
  const [open, setOpen] = useState(false);
  const parsed = parseMateriaRawText(subject.name);
  return <li className="list-none">
    <button type="button" onClick={() => setOpen(true)} className="glass-panel flex w-full items-center gap-3 p-5 text-left">
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-ink">{parsed.nombre}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-accent"><MapPin size={15} />{parsed.aula && parsed.aula !== 'N/A' ? `Aula ${parsed.aula}` : 'Aula sin asignar'}</p>
        <ul className="mt-2 space-y-1 text-sm text-subtle">{subject.classBlocks.map((block, index) => <li key={index}><span className="capitalize">{block.day}</span> · <span className="tabular-nums">{block.startTime} a {block.endTime}</span></li>)}</ul>
      </div>
      <ChevronRight size={18} className="shrink-0 text-subtle" />
    </button>
    <MateriaDetailModal materia={open ? subject : null} onClose={() => setOpen(false)} />
  </li>;
}
