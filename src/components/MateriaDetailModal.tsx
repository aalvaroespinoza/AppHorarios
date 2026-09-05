"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { parseMateriaInfo } from '@/core/utils/edificio';
import { Clock, MapPin } from 'lucide-react';

interface MateriaDetailModalProps {
  materia: any | null;
  onClose: () => void;
}

export function MateriaDetailModal({ materia, onClose }: MateriaDetailModalProps) {
  return (
    <AnimatePresence>
      {materia && (() => {
        const rawString = materia.nombre || materia.title || materia.rawText || materia.name || materia.titulo || '';
        const info = parseMateriaInfo(rawString);

        // Fallback para horarios
        const firstBlock = materia.classBlocks && materia.classBlocks[0];
        const horaInicio = materia.horaInicio || materia.timeStart || materia.startTime || (firstBlock ? firstBlock.startTime : "08:00");
        const horaFin = materia.horaFin || materia.timeEnd || materia.endTime || (firstBlock ? firstBlock.endTime : "11:10");

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-sm p-5 shadow-none flex flex-col gap-4 text-zinc-100 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del Pop-up */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <span className="text-[10px] font-mono font-bold text-safety-orange uppercase tracking-widest">
                  SYS.MATERIA // DETALLE DE CURSADO
                </span>
                <button
                  onClick={onClose}
                  className="w-6 h-6 rounded-sm text-zinc-400 hover:text-zinc-100 bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-xs cursor-pointer active:translate-y-[0.5px]"
                >
                  ✕
                </button>
              </div>

              {/* Nombre de la Materia & Horario */}
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-mono font-bold leading-tight text-zinc-100 uppercase">{info.nombre}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-1 flex items-center gap-1.5">
                  <Clock size={12} className="text-zinc-500" />
                  <span>HORARIO:</span>
                  <span className="text-zinc-200 font-semibold">{horaInicio} a {horaFin} HS</span>
                </p>
              </div>

              {/* Grid de Detalles Técnico */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-zinc-950 rounded-sm p-3 flex flex-col border border-zinc-800 font-mono">
                  <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-widest">CURSO</span>
                  <span className="text-sm font-bold text-zinc-200 mt-0.5">{info.curso || '—'}</span>
                </div>

                <div className="bg-zinc-950 rounded-sm p-3 flex flex-col border border-zinc-800 font-mono">
                  <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-widest">AULA</span>
                  <span className="text-sm font-bold text-acid-green mt-0.5">{info.aula ? `AULA ${info.aula}` : '—'}</span>
                </div>

                <div className="col-span-2 bg-zinc-950 rounded-sm p-3 flex flex-col border border-zinc-800 font-mono">
                  <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-widest">UBICACIÓN / EDIFICIO</span>
                  <span className="text-xs font-bold text-safety-orange mt-0.5 flex items-center gap-1.5">
                    <MapPin size={12} className="shrink-0" /> {info.edificio || 'Campus Universitario'}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
}
