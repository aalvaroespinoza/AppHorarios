"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { parseMateriaInfo } from '@/core/utils/edificio';
import { X } from 'lucide-react';

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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col gap-5 text-white shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del Pop-up */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  ✨ Detalle de Cursado
                </span>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nombre de la Materia & Horario */}
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-extrabold text-white leading-tight">{info.nombre}</h3>
                <p className="text-sm text-neutral-400 mt-1 flex items-center gap-1.5">
                  ⏰ Horario: <span className="text-white font-semibold">{horaInicio} a {horaFin} hs</span>
                </p>
              </div>

              {/* Grid de Detalles: Curso, Aula y Edificio */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-4 flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase">Curso</span>
                  <span className="text-lg font-black text-purple-300 mt-1">{info.curso}</span>
                </div>

                <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-4 flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase">Aula</span>
                  <span className="text-lg font-black text-emerald-300 mt-1">Aula {info.aula}</span>
                </div>

                <div className="col-span-2 bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-4 flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase">Ubicación / Edificio</span>
                  <span className="text-base font-bold text-amber-300 mt-1 flex items-center gap-2">
                    📍 {info.edificio}
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
