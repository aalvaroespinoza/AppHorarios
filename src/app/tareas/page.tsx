"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Trash2, CheckCircle2, Circle, 
  Clock, Sparkles, X, Settings2, HelpCircle, RotateCcw,
  CalendarDays, Tag, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAGE_TRANSITION, SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

interface BlockTask {
  id: string;
  title: string;
  horaInicio: string; // "10:00"
  horaFin: string; // "11:30"
  priority: 'alta' | 'media' | 'baja';
  completed: boolean;
  color: string;
}

const DEFAULT_BLOCKS: BlockTask[] = [
  {
    id: '1',
    title: 'Estudio de Física II',
    horaInicio: '09:00',
    horaFin: '11:00',
    priority: 'alta',
    completed: false,
    color: 'bg-red-950/40 border-red-500/40 text-red-200',
  },
  {
    id: '2',
    title: 'Desarrollo Proyecto Final',
    horaInicio: '14:00',
    horaFin: '16:30',
    priority: 'media',
    completed: false,
    color: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200',
  },
  {
    id: '3',
    title: 'Gimnasio & Cardio',
    horaInicio: '18:00',
    horaFin: '19:30',
    priority: 'baja',
    completed: true,
    color: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
  }
];

const START_HOUR = 8; // 08:00
const END_HOUR = 22; // 22:00
const TOTAL_HOURS = END_HOUR - START_HOUR + 1; // 15 horas

export default function TareasTimeBlockingPage() {
  const [blocks, setBlocks] = useState<BlockTask[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockTask | null>(null);

  // Formulario nuevo bloque
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('10:00');
  const [newEnd, setNewEnd] = useState('11:30');
  const [newPriority, setNewPriority] = useState<'alta' | 'media' | 'baja'>('media');

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('lifeos_timeblocking_blocks');
    if (stored) {
      try {
        setBlocks(JSON.parse(stored));
      } catch (e) {
        setBlocks(DEFAULT_BLOCKS);
      }
    } else {
      setBlocks(DEFAULT_BLOCKS);
    }
  }, []);

  const saveBlocks = (updated: BlockTask[]) => {
    setBlocks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_timeblocking_blocks', JSON.stringify(updated));
    }
  };

  const handleResetData = () => {
    if (!window.confirm('¿Reiniciar todos los bloques a los valores por defecto?')) return;
    saveBlocks(DEFAULT_BLOCKS);
    setShowSettingsModal(false);
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const colors: Record<string, string> = {
      alta: 'bg-red-950/40 border-red-500/40 text-red-200',
      media: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200',
      baja: 'bg-neutral-900/60 border-neutral-700/60 text-neutral-200',
    };

    const newBlock: BlockTask = {
      id: 'tb-' + Date.now(),
      title: newTitle.trim(),
      horaInicio: newStart,
      horaFin: newEnd,
      priority: newPriority,
      completed: false,
      color: colors[newPriority],
    };

    saveBlocks([...blocks, newBlock]);
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleToggleBlock = (id: string) => {
    const updated = blocks.map(b => b.id === id ? { ...b, completed: !b.completed } : b);
    saveBlocks(updated);
    if (selectedBlock?.id === id) {
      setSelectedBlock({ ...selectedBlock, completed: !selectedBlock.completed });
    }
  };

  const handleDeleteBlock = (id: string) => {
    const updated = blocks.filter(b => b.id !== id);
    saveBlocks(updated);
    if (selectedBlock?.id === id) setSelectedBlock(null);
  };

  // Cálculo matemático exacto de posición con 5rem por hora
  const getBlockPosition = (horaInicio: string, horaFin: string) => {
    const [hStart, mStart] = (horaInicio || '08:00').split(':').map(Number);
    const [hEnd, mEnd] = (horaFin || '09:00').split(':').map(Number);

    const startHour = isNaN(hStart) ? 8 : hStart;
    const startMinutes = isNaN(mStart) ? 0 : mStart;

    let endHour = isNaN(hEnd) ? startHour + 1 : hEnd;
    let endMinutes = isNaN(mEnd) ? startMinutes : mEnd;

    const durationInHours = Math.max((endHour * 60 + endMinutes - (startHour * 60 + startMinutes)) / 60, 0.5);

    const top = `calc(${startHour - START_HOUR} * 5rem + ${(startMinutes / 60)} * 5rem)`;
    const height = `calc(${durationInHours} * 5rem)`;

    return { top, height };
  };

  // Posición de la línea de tiempo actual
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const showCurrentTimeLine = currentHour >= START_HOUR && currentHour <= END_HOUR;
  const currentTimeTop = `calc(${currentHour - START_HOUR} * 5rem + ${(currentMinutes / 60)} * 5rem)`;

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-4 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/boveda"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Time-Blocking <Clock size={17} className="text-cyan-400" />
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium">Grilla visual de 08:00 a 22:00</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Ayuda y Guía"
          >
            <HelpCircle size={15} />
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Ajustes de Horarios"
          >
            <Settings2 size={15} />
          </button>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1 px-3 shadow-md shadow-cyan-500/20"
          >
            <Plus size={15} />
            <span>Bloque</span>
          </Button>
        </div>
      </header>

      {/* Contenedor Padre de Grilla Calibrada (h-20 / 5rem exactos) */}
      <div className="flex flex-col relative w-full h-[640px] overflow-y-auto mt-1 border border-neutral-800/80 rounded-3xl bg-neutral-950/60 shadow-2xl hide-scrollbar">
        {/* Filas de Horas fijadas a h-20 (5rem) */}
        {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
          const hour = i + START_HOUR;
          return (
            <div key={hour} className="flex h-20 border-b border-neutral-800/50 relative">
              <span className="w-14 text-[11px] text-neutral-500 font-mono pr-3 text-right pt-1.5 select-none shrink-0">
                {String(hour).padStart(2, '0')}:00
              </span>
              <div className="flex-1 relative border-l border-neutral-800/50">
                {/* Línea de media hora */}
                <div className="absolute top-1/2 left-0 right-0 border-b border-neutral-800/20 border-dashed pointer-events-none" />
              </div>
            </div>
          );
        })}

        {/* Línea de hora actual en vivo */}
        {showCurrentTimeLine && (
          <div 
            className="absolute left-14 right-0 z-30 flex items-center pointer-events-none"
            style={{ top: currentTimeTop }}
          >
            <div className="w-2.5 h-2.5 -ml-1.5 rounded-full bg-red-500 ring-4 ring-red-500/20 shadow-md" />
            <div className="flex-1 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
        )}

        {/* Bloques de Eventos posicionados con precisión matemática */}
        <div className="absolute top-0 bottom-0 left-14 right-3 pointer-events-none">
          {blocks.map((block) => {
            const { top, height } = getBlockPosition(block.horaInicio, block.horaFin);

            return (
              <Card
                key={block.id}
                onClick={() => setSelectedBlock(block)}
                style={{ top, height }}
                className={`absolute left-1 right-1 rounded-2xl p-3 border backdrop-blur-md cursor-pointer pointer-events-auto transition-all hover:scale-[1.01] hover:z-20 flex flex-col justify-between shadow-lg overflow-hidden ${
                  block.completed ? 'opacity-40 line-through bg-neutral-900 border-neutral-800 text-neutral-500' : block.color
                }`}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <span className={`text-xs font-bold truncate leading-tight ${block.completed ? 'text-neutral-500' : 'text-white'}`}>
                    {block.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBlock(block.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-white shrink-0"
                  >
                    {block.completed ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Circle size={15} />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono opacity-80 mt-1">
                  <span>{block.horaInicio} - {block.horaFin}</span>
                  <span className="capitalize">{block.priority}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal Nuevo Bloque */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white"
            >
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus size={16} className="text-cyan-400" /> Nuevo Bloque de Tiempo
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateBlock} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-medium">Actividad / Tarea</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Estudiar Álgebra..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 font-medium">Inicio</label>
                    <input
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 font-medium">Fin</label>
                    <input
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-medium">Prioridad</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(['alta', 'media', 'baja'] as const).map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewPriority(p)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                          newPriority === p
                            ? p === 'alta' ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : p === 'media' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs">
                  Guardar Bloque
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Detalle Bloque */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setSelectedBlock(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-neutral-800 pb-2">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedBlock.title}</h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    {selectedBlock.horaInicio} - {selectedBlock.horaFin} hs
                  </span>
                </div>
                <button onClick={() => setSelectedBlock(null)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs border-neutral-700">
                  Prioridad: {selectedBlock.priority}
                </Badge>
                <Badge variant={selectedBlock.completed ? "default" : "secondary"} className="text-xs">
                  {selectedBlock.completed ? "Completado" : "Pendiente"}
                </Badge>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => handleToggleBlock(selectedBlock.id)}
                  variant="outline"
                  className="flex-1 text-xs rounded-xl border-neutral-700 hover:bg-neutral-800"
                >
                  {selectedBlock.completed ? "Marcar Pendiente" : "Marcar Completado"}
                </Button>
                <Button
                  onClick={() => handleDeleteBlock(selectedBlock.id)}
                  variant="destructive"
                  size="icon"
                  className="rounded-xl w-10 h-10 shrink-0"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ajustes */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings2 size={16} className="text-cyan-400" /> Ajustes de Time-Blocking
                </h2>
                <button onClick={() => setShowSettingsModal(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Podés restablecer la grilla a los bloques de ejemplo predeterminados.
              </p>

              <Button
                onClick={handleResetData}
                variant="destructive"
                className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Restablecer Bloques por Defecto</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ayuda */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle size={16} className="text-cyan-400" /> ¿Qué es Time-Blocking?
                </h2>
                <button onClick={() => setShowHelpModal(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <li>• <strong>Bloques de Enfoque</strong>: Asigna horas fijas a cada tarea para evitar la procrastinación.</li>
                <li>• <strong>Línea Roja</strong>: Te indica en tiempo real dónde estás posicionado hoy.</li>
                <li>• <strong>Sincronización</strong>: Los bloques aparecen automáticamente en tu Agenda diaria.</li>
              </ul>

              <Button
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-2 text-xs font-bold rounded-xl bg-cyan-500 text-black hover:bg-cyan-400"
              >
                Entendido
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
