"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Home, Bus, Calendar, Wallet, 
  LayoutGrid, BarChart3, Zap, FileText, 
  BookOpen, Plus, Sparkles, RefreshCw, X, ArrowRight
} from 'lucide-react';
import { syncEngine } from '@/core/sync/engine';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);
    const handleCustomClose = () => setOpen(false);

    document.addEventListener('keydown', down);
    window.addEventListener('open-command-palette', handleCustomOpen);
    window.addEventListener('close-command-palette', handleCustomClose);

    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-command-palette', handleCustomOpen);
      window.removeEventListener('close-command-palette', handleCustomClose);
    };
  }, []);

  const runCommand = (command: () => void) => {
    command();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-start pt-[12vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: -10, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-lg bg-neutral-900/90 border border-neutral-800/90 rounded-3xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 overflow-hidden flex flex-col text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="w-full flex flex-col gap-3">
              {/* Input de Búsqueda Raycast Style */}
              <div className="flex items-center gap-3 border-b border-neutral-800/80 pb-3 px-1">
                <Search size={18} className="text-neutral-400 shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Escribe un comando o busca una sección..."
                  className="w-full bg-transparent text-white placeholder-neutral-500 text-base sm:text-lg font-medium outline-none border-none"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Lista de Resultados */}
              <Command.List className="max-h-[55vh] overflow-y-auto flex flex-col gap-3 py-1 hide-scrollbar">
                <Command.Empty className="py-8 text-center text-xs font-medium text-neutral-500">
                  No se encontraron comandos o pantallas.
                </Command.Empty>

                {/* GRUPO 1: Navegación Principal */}
                <Command.Group heading="Navegación Rápida" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 flex flex-col gap-1">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                        <Home size={15} />
                      </div>
                      <span>Ir a Inicio (Hub)</span>
                    </div>
                    <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/viajes'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                        <Bus size={15} />
                      </div>
                      <span>Ir a Viajes & Colectivos</span>
                    </div>
                    <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/academia'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                        <Calendar size={15} />
                      </div>
                      <span>Ir a Agenda & Cursado</span>
                    </div>
                    <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/estadisticas'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <BarChart3 size={15} />
                      </div>
                      <span>Ir a Estadísticas & Métricas</span>
                    </div>
                    <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/finanzas'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Wallet size={15} />
                      </div>
                      <span>Ir a Finanzas & Gastos</span>
                    </div>
                    <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/kanban'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                        <LayoutGrid size={15} />
                      </div>
                      <span>Ir a Tablero Kanban</span>
                    </div>
                    <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/focus'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <Zap size={15} />
                      </div>
                      <span>Ir a Focus & Búnker</span>
                    </div>
                    <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/notas'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                        <FileText size={15} />
                      </div>
                      <span>Ir a Notas & Bóveda</span>
                    </div>
                    <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/boveda'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                        <LayoutGrid size={15} />
                      </div>
                      <span>Ir a Menú de Aplicaciones</span>
                    </div>
                    <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                  </Command.Item>
                </Command.Group>

                {/* GRUPO 2: Acciones Rápidas */}
                <Command.Group heading="Acciones Rápidas" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 flex flex-col gap-1 mt-2">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/kanban'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Plus size={15} />
                      </div>
                      <span>Crear Nueva Tarea</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Kanban</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/finanzas'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <Wallet size={15} />
                      </div>
                      <span>Registrar Nuevo Gasto</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Finanzas</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/focus'))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                        <Zap size={15} />
                      </div>
                      <span>Activar Modo Búnker / Deep Work</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Focus</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => syncEngine.processQueue())}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                        <RefreshCw size={15} />
                      </div>
                      <span>Forzar Sincronización Local-First</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Sync</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              {/* Footer con atajo */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500 px-1">
                <span>Navega con flechas ↑↓ y presiona Enter</span>
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-400">
                  ESC
                </kbd>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
