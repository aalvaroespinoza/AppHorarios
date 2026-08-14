"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Trash2, CheckCircle2, Circle, 
  Clock, Sparkles, X, Settings2, HelpCircle, RotateCcw 
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAGE_TRANSITION, SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

interface BlockTask {
  id: string;
  title: string;
  horaInicio: string;
  horaFin: string;
  priority: 'alta' | 'media' | 'baja';
  completed: boolean;
  color?: string;
}

const DEFAULT_BLOCKS: BlockTask[] = [
  {
    id: 'b-1',
    title: 'Estudio de Física II',
    horaInicio: '09:00',
    horaFin: '11:00',
    priority: 'alta',
    completed: false,
    color: 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200',
  },
  {
    id: 'b-2',
    title: 'Almuerzo & Descanso',
    horaInicio: '12:30',
    horaFin: '13:30',
    priority: 'baja',
    completed: false,
    color: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
  },
  {
    id: 'b-3',
    title: 'TP de Programación',
    horaInicio: '15:00',
    horaFin: '17:00',
    priority: 'alta',
    completed: false,
    color: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200',
  },
  {
    id: 'b-4',
    title: 'Entrenamiento / Gym',
    horaInicio: '18:30',
    horaFin: '20:00',
    priority: 'media',
    completed: false,
    color: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
  }
];

const START_HOUR = 7; // 07:00
const END_HOUR = 23; // 23:00
const TOTAL_HOURS = END_HOUR - START_HOUR + 1; // 17 horas
const HOUR_HEIGHT = 64; // 64px por hora

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

  // Cálculo matemático exacto de posición
  const getBlockPosition = (horaInicio: string, horaFin: string) => {
    const [hStart, mStart] = (horaInicio || '08:00').split(':').map(Number);
    const [hEnd, mEnd] = (horaFin || '09:00').split(':').map(Number);

    const startMinutes = (hStart - START_HOUR) * 60 + (mStart || 0);
    const endMinutes = (hEnd - START_HOUR) * 60 + (mEnd || 0);

    const top = Math.max((startMinutes / 60) * HOUR_HEIGHT, 0);
    const durationMinutes = Math.max(endMinutes - startMinutes, 30);
    const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT - 4, 38);

    return { top, height };
  };

  // Posición de la línea de tiempo actual
  const now = new Date();
  const currentMinutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * HOUR_HEIGHT;
  const showCurrentTimeLine = now.getHours() >= START_HOUR && now.getHours() <= END_HOUR;

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
            <p className="text-[11px] text-neutral-500 font-medium">Grilla visual de 07:00 a 23:00</p>
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

      {/* Contenedor Padre de Grilla Calibrada (17 horas x 64px = 1088px) */}
      <div className="relative w-full h-[650px] sm:h-[720px] overflow-y-auto mt-1 border border-neutral-800/80 rounded-3xl bg-neutral-950/60 shadow-2xl hide-scrollbar">
        {/* Filas de Horas */}
        <div className="relative w-full" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
          {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
            const hour = i + START_HOUR;
            return (
              <div 
                key={hour} 
                style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                className="absolute left-0 right-0 border-b border-neutral-800/50 flex"
              >
                <span className="w-14 text-[11px] text-neutral-500 font-mono pr-3 text-right pt-1.5 select-none shrink-0">
                  {String(hour).padStart(2, '0')}:00
                </span>
                <div className="flex-1 relative border-l border-neutral-800/50">
                  {/* Línea de media hora */}
                  <div className="absolute top-1/2 left-0 right-0 border-b border-neutral-800/20 border-dashed" />
                </div>
              </div>
            );
          })}

          {/* Línea de hora actual en vivo */}
          {showCurrentTimeLine && (
            <div 
              className="absolute left-14 right-0 z-30 flex items-center pointer-events-none"
              style={{ top: `${currentTimeTop}px` }}
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
                  style={{
                    top: `${top + 2}px`,
                    height: `${height}px`
                  }}
                  className={`absolute left-1 right-1 z-20 pointer-events-auto cursor-pointer p-2.5 rounded-2xl flex flex-col justify-between transition-all backdrop-blur-md shadow-md active:scale-[0.98] border ${
                    block.completed
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                      : block.color || 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBlock(block.id);
                        }}
                        className={`shrink-0 transition-colors ${block.completed ? 'text-emerald-400' : 'text-neutral-500 hover:text-cyan-400'}`}
                      >
                        {block.completed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                      </button>
                      <CardTitle className={`text-xs sm:text-sm font-bold truncate leading-tight ${block.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                        {block.title}
                      </CardTitle>
                    </div>

                    <span className="text-[10px] font-mono font-bold bg-black/40 px-1.5 py-0.5 rounded text-neutral-300 shrink-0">
                      {block.horaInicio} - {block.horaFin}
                    </span>
                  </div>

                  {height > 55 && (
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                      <span className="capitalize">Prioridad: {block.priority}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block.id);
                        }}
                        className="text-neutral-500 hover:text-red-400 p-0.5 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
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
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-400" /> Nuevo Bloque de Tiempo
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateBlock} className="flex flex-col gap-3">
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Estudiar Cálculo..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  autoFocus
                />

                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-400 font-semibold">Inicio</label>
                    <input 
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-400 font-semibold">Fin</label>
                    <input 
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-400 font-semibold">Prioridad</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  disabled={!newTitle.trim()}
                  className="w-full mt-2 font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-xs"
                >
                  Crear Bloque
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ajustes / Reset */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings2 size={16} className="text-cyan-400" /> Ajustes de Time-Blocking
                </h2>
                <button onClick={() => setShowSettingsModal(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                El Time-Blocking organiza tu día en bloques visuales continuos de 07:00 a 23:00 para máxima claridad mental.
              </p>

              <Button
                onClick={handleResetData}
                variant="destructive"
                className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Reiniciar Bloques a Valores por Defecto</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Ayuda */}
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
                  <HelpCircle size={16} className="text-cyan-400" /> ¿Cómo usar Time-Blocking?
                </h2>
                <button onClick={() => setShowHelpModal(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <li>• <strong>Bloques Horarios</strong>: Toca en <em>+ Bloque</em> para crear una franja horaria dedicada a una tarea.</li>
                <li>• <strong>Marcar Completado</strong>: Toca el círculo del bloque para tacharlo cuando lo finalices.</li>
                <li>• <strong>Línea Roja en Vivo</strong>: Te indica en qué minuto exacto del día te encuentras.</li>
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
