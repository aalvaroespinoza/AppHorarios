"use client";

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Plus, CheckCircle, ExternalLink, Clock, BookOpen, ChevronDown, ChevronUp, WalletCards, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAgenda } from '@/hooks/useAgenda';
import { useTracker } from '@/hooks/useTracker';
import { useEscenario } from '@/hooks/useEscenario';
import type { DayOfWeek } from '@/types/common';
import PomodoroWidget from '@/components/PomodoroWidget';

const DIAS: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

export default function AcademiaPage() {
  const { diaSeleccionado, setDiaSeleccionado, isMounted } = useEscenario();
  const agenda = useAgenda();
  const tracker = useTracker('s4vitar');
  
  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({ titulo: '', horaInicio: '10:00', horaFin: '11:00' });
  
  const [mostrarTracker, setMostrarTracker] = useState(false);
  const [nuevoModulo, setNuevoModulo] = useState('');

  if (!isMounted || !agenda.isMounted || !tracker.isMounted) return null;

  const agendaDelDia = agenda.obtenerAgendaDelDia(diaSeleccionado);

  const handleAgregarEvento = () => {
    if (!nuevoEvento.titulo) return;
    agenda.agregarEvento({
      id: Date.now().toString(),
      titulo: nuevoEvento.titulo,
      horaInicio: nuevoEvento.horaInicio,
      horaFin: nuevoEvento.horaFin,
      dia: diaSeleccionado
    });
    setNuevoEvento({ titulo: '', horaInicio: '10:00', horaFin: '11:00' });
    setMostrarFormEvento(false);
  };

  const handleAgregarModulo = () => {
    if (!nuevoModulo) return;
    tracker.marcarModulo(nuevoModulo, true);
    setNuevoModulo('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 pb-28"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex flex-col gap-2 mt-2">
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-[11px] font-black tracking-[0.25em] uppercase drop-shadow-sm">
          CENTRO DE CONTROL
        </h2>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Academia 📚
        </h1>
      </header>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <a 
          href="shortcuts://run-shortcut?name=agregar%20recordatorio"
          className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-2xl p-4 flex flex-col gap-3 shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm leading-tight">Nuevo<br/>Recordatorio</span>
        </a>
        <Link 
          href="/finanzas"
          className="bg-zinc-800/80 border border-zinc-700/50 hover:bg-zinc-800 transition-colors rounded-2xl p-4 flex flex-col gap-3 shadow-sm active:scale-95"
        >
          <div className="bg-zinc-700/50 w-8 h-8 rounded-full flex items-center justify-center">
            <WalletCards size={18} className="text-emerald-400" />
          </div>
          <span className="text-zinc-200 font-bold text-sm leading-tight">Finanzas 💸<br/>Gastos</span>
        </Link>
      </div>

      {/* Pomodoro Widget */}
      <PomodoroWidget />

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {DIAS.map((dia) => (
          <button
            key={dia}
            onClick={() => setDiaSeleccionado(dia)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              diaSeleccionado === dia 
                ? 'bg-zinc-100 text-zinc-900 shadow-md' 
                : 'bg-zinc-800/60 text-zinc-400 hover:text-white border border-zinc-700/50'
            }`}
          >
            {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
          </button>
        ))}
      </div>

      {/* Agenda Section */}
      <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-5 text-zinc-400">
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <h2 className="font-semibold text-sm uppercase tracking-wider">Agenda de Hoy</h2>
          </div>
        </div>

        <div className="relative border-l-2 border-zinc-800 ml-3 pl-5 flex flex-col gap-5 py-2">
          {agendaDelDia.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">Sin eventos programados para {diaSeleccionado}.</p>
          ) : (
            agendaDelDia.map((item, idx) => (
              <div key={item.id + idx} className="relative">
                <span className="absolute -left-[1.6rem] top-2 h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 bg-emerald-500 z-20" />
                
                {item.tipo === 'custom' && (
                  <div className="absolute inset-y-0 right-0 w-16 bg-red-500 rounded-2xl flex items-center justify-center z-0">
                    <Trash2 size={20} className="text-white" />
                  </div>
                )}

                <motion.div 
                  className={`relative z-10 p-3.5 rounded-2xl shadow-sm ${item.color || 'bg-zinc-800 border border-zinc-700/50 text-zinc-100'}`}
                  drag={item.tipo === 'custom' ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={{ left: 0.8, right: 0 }}
                  onDragEnd={(e, info: PanInfo) => {
                    if (item.tipo === 'custom' && info.offset.x < -80) {
                      agenda.eliminarEvento(item.id);
                    }
                  }}
                >
                  <h3 className="font-bold text-[15px] leading-tight mb-1">{item.titulo}</h3>
                  <div className="flex items-center gap-2 text-xs opacity-80 font-medium">
                    <span className="bg-black/20 px-2 py-0.5 rounded-md">
                      {item.horaInicio} - {item.horaFin}
                    </span>
                    {item.modalidad && (
                      <span className="bg-black/20 px-2 py-0.5 rounded-md capitalize">
                        {item.modalidad}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800/60">
          <AnimatePresence>
            {mostrarFormEvento ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3 overflow-hidden"
              >
                <input 
                  type="text"
                  placeholder="Título del evento"
                  value={nuevoEvento.titulo}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, titulo: e.target.value})}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <div className="flex gap-2">
                  <input 
                    type="time"
                    value={nuevoEvento.horaInicio}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, horaInicio: e.target.value})}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <input 
                    type="time"
                    value={nuevoEvento.horaFin}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, horaFin: e.target.value})}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={() => setMostrarFormEvento(false)}
                    className="flex-1 py-3 text-sm font-semibold text-zinc-400 hover:text-white bg-zinc-800/50 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAgregarEvento}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                  >
                    Guardar
                  </button>
                </div>
              </motion.div>
            ) : (
              <button 
                onClick={() => setMostrarFormEvento(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all text-sm font-semibold hover:bg-zinc-800/30 active:scale-[0.98]"
              >
                <Plus size={18} />
                + Agregar evento a la agenda
              </button>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Tracker Section (Accordion) */}
      <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
        <button 
          onClick={() => setMostrarTracker(!mostrarTracker)}
          className="w-full p-5 flex items-center justify-between text-zinc-400 hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-200">Progreso S4vitar</h2>
          </div>
          {mostrarTracker ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <AnimatePresence>
          {mostrarTracker && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="px-5 pb-5 overflow-hidden"
            >
              <div className="flex gap-2 mb-5">
                <input 
                  type="text"
                  placeholder="Módulo completado..."
                  value={nuevoModulo}
                  onChange={(e) => setNuevoModulo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAgregarModulo()}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                />
                <button 
                  onClick={handleAgregarModulo}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-[0.95] flex items-center justify-center"
                >
                  <CheckCircle size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                {tracker.state.modulosCompletados.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic">Aún no hay módulos registrados.</p>
                ) : (
                  tracker.state.modulosCompletados.map((mod, i) => (
                    <div key={i} className="flex items-center gap-3 bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-3">
                      <CheckCircle size={16} className="text-green-500 shrink-0" />
                      <span className="text-sm text-zinc-200 font-medium">{mod}</span>
                    </div>
                  ))
                )}
              </div>

              <a 
                href={tracker.generarLinkObsidian()}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold transition-all bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 active:scale-[0.98]"
              >
                <ExternalLink size={18} />
                Exportar Informe (Obsidian)
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

    </motion.div>
  );
}
