"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Plus, Clock, Trash2, Calendar as CalendarIcon, Timer, DollarSign, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useAgenda } from '@/hooks/useAgenda';
import { useEscenario } from '@/hooks/useEscenario';
import { useFinanzas } from '@/hooks/useFinanzas';
import type { DayOfWeek } from '@/types/common';
import PomodoroWidget from '@/components/PomodoroWidget';

const DIAS: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function getDiaActualStr(): DayOfWeek {
  const jsDay = new Date().getDay();
  const map: Record<number, DayOfWeek> = {
    1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado', 0: 'lunes'
  };
  return map[jsDay] || 'lunes';
}

function MiniCalendar() {
  const [currentDate] = useState(new Date());
  const monthName = currentDate.toLocaleString('es-AR', { month: 'long' });
  const year = currentDate.getFullYear();
  
  // Dummy calendar grid
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // monday first
  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

  return (
    <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 text-zinc-400">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} />
          <h2 className="font-semibold text-sm uppercase tracking-wider capitalize">{monthName} {year}</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-zinc-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {daysArray.map((day, idx) => {
          const isToday = day === currentDate.getDate();
          return (
            <div 
              key={idx} 
              className={`h-8 w-full flex items-center justify-center text-xs rounded-lg transition-colors ${
                isToday 
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20' 
                  : day 
                    ? 'text-zinc-300 hover:bg-zinc-800' 
                    : 'text-transparent'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function AcademiaPage() {
  const { diaSeleccionado, setDiaSeleccionado, isMounted } = useEscenario();
  const agenda = useAgenda();
  const finanzas = useFinanzas();
  
  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({ titulo: '', horaInicio: '10:00', horaFin: '11:00' });
  
  const [showPomo, setShowPomo] = useState(false);
  const [showFin, setShowFin] = useState(false);
  
  const [montoR, setMontoR] = useState('');
  const [tipoR, setTipoR] = useState<'ingreso' | 'gasto'>('gasto');

  const [diaActual, setDiaActual] = useState<DayOfWeek>('lunes');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDiaActual(getDiaActualStr());
  }, []);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const activeBtn = scrollContainerRef.current.querySelector('[data-active="true"]') as HTMLButtonElement;
    if (activeBtn) {
      const container = scrollContainerRef.current;
      const scrollLeft = activeBtn.offsetLeft - (container.clientWidth / 2) + (activeBtn.clientWidth / 2);
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [diaSeleccionado, isMounted]);

  if (!isMounted || !agenda.isMounted || !finanzas.isMounted) return null;

  const agendaDelDia = agenda.obtenerAgendaDelDia(diaSeleccionado);
  const esHoy = diaSeleccionado === diaActual;

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

  const handleGuardarR = () => {
    if (!montoR || isNaN(Number(montoR))) return;
    finanzas.agregarTransaccion({
      id: Date.now().toString(),
      tipo: tipoR,
      monto: Number(montoR),
      categoria: tipoR === 'ingreso' ? 'Ingreso' : 'Varios',
      descripcion: 'Rápido',
      fecha: new Date().toISOString(),
    });
    setMontoR('');
    setShowFin(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 pb-28 relative min-h-screen"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      {/* Floating Top Right Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-40" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
        <button 
          onClick={() => { setShowFin(false); setShowPomo(!showPomo); }}
          className="w-10 h-10 bg-zinc-800/80 backdrop-blur border border-zinc-700/50 rounded-full flex items-center justify-center text-zinc-300 shadow-lg active:scale-90 transition-all hover:bg-zinc-700"
        >
          <Timer size={18} />
        </button>
        <button 
          onClick={() => { setShowPomo(false); setShowFin(!showFin); }}
          className="w-10 h-10 bg-zinc-800/80 backdrop-blur border border-zinc-700/50 rounded-full flex items-center justify-center text-zinc-300 shadow-lg active:scale-90 transition-all hover:bg-zinc-700"
        >
          <DollarSign size={18} />
        </button>
        <a 
          href="shortcuts://run-shortcut?name=agregar%20recordatorio"
          className="w-10 h-10 bg-blue-600 border border-blue-500/50 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-900/20 active:scale-90 transition-all hover:bg-blue-500"
        >
          <Plus size={20} />
        </a>
      </div>

      {/* Floating Popovers */}
      <AnimatePresence>
        {showPomo && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-16 right-4 z-50 w-72 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-zinc-300 font-bold text-sm">Pomodoro</h3>
              <button onClick={() => setShowPomo(false)} className="text-zinc-500 hover:text-white p-1"><X size={16}/></button>
            </div>
            <PomodoroWidget />
          </motion.div>
        )}

        {showFin && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-16 right-4 z-50 w-72 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-zinc-300 font-bold text-sm flex items-center gap-2"><DollarSign size={16} className="text-emerald-400"/> Finanzas Rápidas</h3>
              <button onClick={() => setShowFin(false)} className="text-zinc-500 hover:text-white p-1"><X size={16}/></button>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 bg-zinc-950 p-1 rounded-2xl border border-zinc-800/50">
                <button 
                  onClick={() => setTipoR('gasto')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${tipoR === 'gasto' ? 'bg-red-500/20 text-red-500' : 'text-zinc-500'}`}
                >Gasto</button>
                <button 
                  onClick={() => setTipoR('ingreso')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${tipoR === 'ingreso' ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-500'}`}
                >Ingreso</button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 font-bold text-sm">$</span>
                <input 
                  type="text" 
                  inputMode="decimal"
                  pattern="[0-9]*"
                  placeholder="0.00" 
                  value={montoR} 
                  onChange={(e) => setMontoR(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 mt-1">
                <Link href="/finanzas" className="flex-1 text-center py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-700">
                  Ver más
                </Link>
                <button onClick={handleGuardarR} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20">
                  Guardar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col gap-2 mt-2">
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-[11px] font-black tracking-[0.25em] uppercase drop-shadow-sm">
          CENTRO DE CONTROL
        </h2>
        <h1 className="text-3xl font-bold tracking-tight text-white pr-32 leading-tight">
          Planner 📚
        </h1>
      </header>

      {/* Day Selector */}
      <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mt-2">
        {DIAS.map((dia) => {
          const isHoyReal = dia === diaActual;
          return (
            <button
              key={dia}
              data-active={diaSeleccionado === dia}
              onClick={() => setDiaSeleccionado(dia)}
              className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                diaSeleccionado === dia 
                  ? 'bg-zinc-100 text-zinc-900 shadow-md' 
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white border border-zinc-700/50'
              } ${isHoyReal && diaSeleccionado !== dia ? 'border-blue-500/50' : ''}`}
            >
              {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
              {isHoyReal && (
                <span className={`absolute top-0 right-0 -mt-0.5 -mr-0.5 w-2.5 h-2.5 rounded-full ${diaSeleccionado === dia ? 'bg-blue-600' : 'bg-blue-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Agenda Section */}
      <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-5 text-zinc-400">
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <h2 className="font-semibold text-sm uppercase tracking-wider">
              {esHoy ? "Agenda de Hoy" : `Agenda del ${diaSeleccionado}`}
            </h2>
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
                Agregar evento
              </button>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Mini Calendar Section */}
      <MiniCalendar />

    </motion.div>
  );
}
