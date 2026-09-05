"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject } from '@/types/subject';
import { formatTimeRange } from '@/core/utils/date';
import { SPRING_CONFIG } from '@/lib/animations';
import { parseMateriaRawText } from '@/core/utils/materiaParser';
import { parseMateriaInfo } from '@/core/utils/edificio';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface SubjectCardProps {
  subject: Subject;
}

/**
 * SubjectCard
 * Celda técnica de la matriz de materias con estilo de consola de hardware industrial.
 */
export function SubjectCard({ subject }: SubjectCardProps) {
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const parsed = parseMateriaRawText(subject.name);

  return (
    <>
      <motion.li 
        variants={{
          hidden: { opacity: 0, scale: 0.99, y: 4 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: SPRING_CONFIG
          }
        }}
        onClick={() => setSelectedSubject(subject)}
        className="p-3.5 my-2 bg-zinc-900 border border-zinc-800 rounded-sm list-none transition-colors hover:border-zinc-700 shadow-none cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
      >
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-xs sm:text-sm text-zinc-100 uppercase tracking-tight">
              {parsed.nombre}
            </span>
            {parsed.curso && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 rounded-sm">
                {parsed.curso}
              </span>
            )}
            {parsed.aula && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-acid-green border border-acid-green/40 bg-acid-green/10 px-1.5 py-0.5 rounded-sm">
                AULA {parsed.aula}
              </span>
            )}
            {parsed.edificio && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-safety-orange border border-safety-orange/40 bg-safety-orange/10 px-1.5 py-0.5 rounded-sm">
                📍 {parsed.edificio}
              </span>
            )}
          </div>

          {/* Bloques horarios técnicos */}
          {subject.classBlocks && subject.classBlocks.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5">
              {subject.classBlocks.map((block, i) => (
                <li
                  key={i}
                  className="text-[11px] font-mono text-zinc-400 flex items-center gap-1"
                >
                  <span className="uppercase text-zinc-500 font-semibold">{block.day}</span>
                  <span className="text-zinc-600">{"//"}</span>
                  <span className="text-zinc-200">{formatTimeRange(block.startTime, block.endTime)} HS</span>
                </li>
              ))}
              <li className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                [{subject.modality}]
              </li>
            </ul>
          )}
        </div>

        {/* Turno */}
        {subject.shift && (
          <div className="shrink-0 self-start sm:self-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 border border-zinc-800 bg-zinc-950 px-2 py-0.5 rounded-sm">
              {subject.shift}
            </span>
          </div>
        )}
      </motion.li>

      {/* Modal Técnico: Detalle de Cursado */}
      <AnimatePresence>
        {selectedSubject && (() => {
          const info = parseMateriaInfo(selectedSubject.nombre || selectedSubject.title || selectedSubject.rawText || selectedSubject.name || '');
          const firstBlock = selectedSubject.classBlocks && selectedSubject.classBlocks[0];
          const horaInicio = selectedSubject.horaInicio || selectedSubject.timeStart || (firstBlock ? firstBlock.startTime : "08:00");
          const horaFin = selectedSubject.horaFin || selectedSubject.timeEnd || (firstBlock ? firstBlock.endTime : "11:10");

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4"
              onClick={() => setSelectedSubject(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-sm p-5 shadow-none flex flex-col gap-4 text-zinc-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del Submenú */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <span className="text-[10px] font-mono font-bold text-safety-orange uppercase tracking-widest">
                    SYS.MATERIA // DETALLE DE CURSADO
                  </span>
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="text-zinc-400 hover:text-zinc-100 bg-zinc-950 border border-zinc-800 rounded-sm w-6 h-6 flex items-center justify-center font-mono text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Nombre de la Materia */}
                <div>
                  <h3 className="text-base font-mono font-bold leading-tight text-zinc-100 uppercase">{info.nombre}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    HORARIO: <span className="text-zinc-200 font-semibold">{horaInicio} a {horaFin} HS</span>
                  </p>
                </div>

                {/* Grid de Detalles Técnico */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-zinc-950 rounded-sm p-3 flex flex-col border border-zinc-800 font-mono">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-widest">CURSO</span>
                    <span className="text-sm font-bold text-zinc-200 mt-0.5">{info.curso}</span>
                  </div>

                  <div className="bg-zinc-950 rounded-sm p-3 flex flex-col border border-zinc-800 font-mono">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-widest">AULA</span>
                    <span className="text-sm font-bold text-acid-green mt-0.5">AULA {info.aula}</span>
                  </div>

                  <div className="col-span-2 bg-zinc-950 rounded-sm p-3 flex flex-col border border-zinc-800 font-mono">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-widest">UBICACIÓN / EDIFICIO</span>
                    <span className="text-xs font-bold text-safety-orange mt-0.5">
                      📍 {info.edificio}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-1">
                  <Link href="/aulas" className="w-full">
                    <Button size="sm" variant="secondary" className="w-full rounded-sm h-8 flex items-center justify-center gap-2">
                      <GraduationCap size={13} className="text-safety-orange" />
                      <span>GESTIONAR EN AULAS</span>
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
