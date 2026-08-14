"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Home, Bus, Calendar, Wallet, 
  LayoutGrid, BarChart3, Zap, FileText, 
  BookOpen, Plus, Sparkles, RefreshCw, X, ArrowRight,
  Shield, CheckCircle2, Settings, HelpCircle, MapPin, Coffee, Dumbbell, Lock
} from 'lucide-react';
import { trackEvent } from '@/core/analytics/engine';
import { syncEngine } from '@/core/sync/engine';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const runCommand = (command: () => void, feedback?: string) => {
    setOpen(false);
    command();
    if (feedback) {
      showToast(feedback);
    }
  };

  return (
    <>
      {/* Toast Flotante de Feedback Rápido */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100000] bg-neutral-900/90 text-white border border-emerald-500/40 px-4 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.3)] backdrop-blur-xl flex items-center gap-2.5 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="w-full max-w-lg bg-neutral-900/95 border border-neutral-800/90 rounded-3xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 overflow-hidden flex flex-col text-white"
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

                {/* Lista de Resultados con Categorías */}
                <Command.List className="max-h-[55vh] overflow-y-auto flex flex-col gap-3 py-1 hide-scrollbar">
                  <Command.Empty className="py-8 text-center text-xs font-medium text-neutral-500">
                    No se encontraron comandos o pantallas.
                  </Command.Empty>

                  {/* GRUPO 1: Navegación Principal */}
                  <Command.Group heading="Navegación Principal" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 flex flex-col gap-1">
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/'))}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                          <Home size={15} />
                        </div>
                        <span>🏠 Inicio / Hub</span>
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
                        <span>🚌 Viajes y Colectivos</span>
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
                        <span>📅 Agenda y Cursado</span>
                      </div>
                      <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                    </Command.Item>

                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/tareas'))}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                          <Calendar size={15} />
                        </div>
                        <span>📅 Agenda y Kanban (Schedule List)</span>
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
                        <span>💸 Finanzas y Presupuesto</span>
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
                        <span>🧠 Bóveda de Notas & Apps</span>
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
                        <span>🎯 Modo Foco / Búnker</span>
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
                        <span>📊 Estadísticas (Umami)</span>
                      </div>
                      <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                    </Command.Item>
                  </Command.Group>

                  {/* GRUPO 2: Acciones de Viajes */}
                  <Command.Group heading="Acciones de Viajes" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 flex flex-col gap-1 mt-2">
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/viajes#ida-cordoba'))}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                          <MapPin size={15} />
                        </div>
                        <span>📍 Ver viaje a Córdoba (Ida)</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">Viajes</span>
                    </Command.Item>

                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/viajes#vuelta-despenaderos'))}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                          <MapPin size={15} />
                        </div>
                        <span>📍 Ver viaje a Despeñaderos (Vuelta)</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">Viajes</span>
                    </Command.Item>
                  </Command.Group>

                  {/* GRUPO 3: Acciones Rápidas (Kanban & Bóveda) */}
                  <Command.Group heading="Acciones Rápidas" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 flex flex-col gap-1 mt-2">
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/kanban?action=new'))}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                          <Plus size={15} />
                        </div>
                        <span>➕ Nueva Tarea (Kanban)</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">Kanban</span>
                    </Command.Item>

                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/boveda?new=true'))}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                          <FileText size={15} />
                        </div>
                        <span>📝 Nueva Nota Rápida</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">Bóveda</span>
                    </Command.Item>
                  </Command.Group>

                  {/* GRUPO 4: Tracker de Hábitos */}
                  <Command.Group heading="Tracker de Hábitos (Analytics Engine)" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 flex flex-col gap-1 mt-2">
                    <Command.Item
                      onSelect={() => runCommand(() => {
                        trackEvent('estudio_s4vitar', 'academic', 1);
                      }, '🛡️ Estudio S4vitar / eJPT registrado exitosamente')}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                          <Shield size={15} />
                        </div>
                        <span>🛡️ Registrar estudio: S4vitar / eJPT</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        Track
                      </span>
                    </Command.Item>

                    <Command.Item
                      onSelect={() => runCommand(() => {
                        trackEvent('habito_mate', 'system', 1);
                      }, '🧉 Desconexión / Mate registrado')}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                          <Coffee size={15} />
                        </div>
                        <span>🧉 Registrar Desconexión / Mate</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        Track
                      </span>
                    </Command.Item>

                    <Command.Item
                      onSelect={() => runCommand(() => {
                        trackEvent('asistencia_facultad', 'academic', 1);
                      }, '🎓 Asistencia a Facultad registrada')}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                          <CheckCircle2 size={15} />
                        </div>
                        <span>🎓 Registrar Asistencia Facultad</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        Track
                      </span>
                    </Command.Item>
                  </Command.Group>

                  {/* GRUPO 5: Sistema */}
                  <Command.Group heading="Sistema" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 flex flex-col gap-1 mt-2">
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/configuracion'))}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center border border-neutral-700">
                          <Settings size={15} />
                        </div>
                        <span>⚙️ Configuración</span>
                      </div>
                      <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                    </Command.Item>

                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/ayuda'))}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                          <HelpCircle size={15} />
                        </div>
                        <span>🆘 Ayuda y Atajos</span>
                      </div>
                      <ArrowRight size={13} className="text-neutral-500 group-data-[selected=true]:text-white transition-colors" />
                    </Command.Item>

                    <Command.Item
                      onSelect={() => runCommand(() => {
                        syncEngine.processQueue();
                      }, '🔄 Sincronización Local-First ejecutada')}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white cursor-pointer transition-colors text-xs font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                          <RefreshCw size={15} />
                        </div>
                        <span>🔄 Forzar Sincronización Local-First</span>
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
    </>
  );
}
