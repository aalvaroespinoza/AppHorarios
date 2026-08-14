"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { parseMateriaInfo, getSubjectColorMapping } from '@/core/utils/edificio';
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
        
        const mapping = getSubjectColorMapping(materia.color);

        // Fallback para horarios
        const firstBlock = materia.classBlocks && materia.classBlocks[0];
        const horaInicio = materia.horaInicio || materia.timeStart || materia.startTime || (firstBlock ? firstBlock.startTime : "08:00");
        const horaFin = materia.horaFin || materia.timeEnd || materia.endTime || (firstBlock ? firstBlock.endTime : "11:10");

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decoración de fondo sutil con el color de la materia */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 ${mapping.dot} opacity-[0.15] blur-3xl rounded-full pointer-events-none`} />

              {/* Header del Pop-up */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 relative z-10">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${mapping.text}`}>
                  Detalle
                </span>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nombre de la Materia & Horario */}
              <div className="flex flex-col gap-1 relative z-10">
                <h3 className="text-xl font-extrabold text-white leading-tight tracking-tight">{info.nombre}</h3>
                <p className="text-sm text-zinc-400 mt-0.5 flex items-center gap-1.5 font-medium">
                  ⏰ Horario: <span className="text-zinc-200">{horaInicio} a {horaFin} hs</span>
                </p>
              </div>

              {/* Grid de Detalles: Curso, Aula y Edificio */}
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className={`border rounded-2xl p-3 flex flex-col ${mapping.bg} ${mapping.border}`}>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Curso</span>
                  <span className={`text-lg font-black mt-0.5 ${mapping.text}`}>{info.curso}</span>
                </div>

                <div className={`border rounded-2xl p-3 flex flex-col ${mapping.bg} ${mapping.border}`}>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Aula</span>
                  <span className={`text-lg font-black mt-0.5 ${mapping.text}`}>Aula {info.aula}</span>
                </div>

                <div className={`col-span-2 border rounded-2xl p-3 flex flex-col ${mapping.bg} ${mapping.border}`}>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Ubicación / Edificio</span>
                  <span className={`text-sm font-bold mt-1 flex items-center gap-2 ${mapping.text}`}>
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
