"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject } from '@/types/subject';
import { formatTimeRange } from '@/core/utils/date';
import { SPRING_CONFIG } from '@/lib/animations';
import { parseMateriaRawText } from '@/core/utils/materiaParser';
import { parseMateriaInfo } from '@/core/utils/edificio';

import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface SubjectCardProps {
  subject: Subject;
}

/**
 * SubjectCard
 *
 * Fila compacta que muestra una materia con su horario.
 * Permite hacer clic para abrir el submenú de detalles de cursado.
 */
export function SubjectCard({ subject }: SubjectCardProps) {
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const parsed = parseMateriaRawText(subject.name);

  return (
    <>
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
        onClick={() => setSelectedSubject(subject)}
        className="flex items-start justify-between gap-4 py-3 cursor-pointer active:scale-98 transition-transform"
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
              className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setSelectedSubject(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del Submenú */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Detalle de Cursado</span>
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Nombre de la Materia */}
                <div>
                  <h3 className="text-xl font-bold text-white">{info.nombre}</h3>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    ⏰ Horario: <span className="text-white font-medium">{horaInicio} a {horaFin} hs</span>
                  </p>
                </div>

                {/* Grid de Detalles: Curso, Aula y Edificio */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-3.5 flex flex-col">
                    <span className="text-xs text-neutral-400">Curso</span>
                    <span className="text-base font-bold text-purple-300 mt-1">{info.curso}</span>
                  </div>

                  <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-3.5 flex flex-col">
                    <span className="text-xs text-neutral-400">Aula</span>
                    <span className="text-base font-bold text-emerald-300 mt-1">Aula {info.aula}</span>
                  </div>

                  <div className="col-span-2 bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-3.5 flex flex-col">
                    <span className="text-xs text-neutral-400">Ubicación / Edificio</span>
                    <span className="text-base font-bold text-amber-300 mt-1 flex items-center gap-1.5">
                      📍 {info.edificio}
                    </span>
                <div className="flex gap-2 mt-2">
                  <Link href={`/boveda?subject=${encodeURIComponent(info.nombre)}`} className="w-full">
                    <Button size="sm" variant="secondary" className="w-full rounded-xl flex items-center justify-center gap-2">
                      <FileText size={14} className="text-teal-400" />
                      <span>Abrir en Bóveda (Notas)</span>
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
