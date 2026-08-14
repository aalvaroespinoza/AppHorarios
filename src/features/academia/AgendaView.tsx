"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, CalendarDays, Sparkles, MapPin } from 'lucide-react';
import type { useAgenda } from '@/hooks/useAgenda';
import { SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

import { getEdificio, parseMateria } from '@/core/utils/edificio';
import { MateriaDetailModal } from '@/components/MateriaDetailModal';

interface AgendaViewProps {
  fechaSeleccionada: string;
  diaNombre: string;
  esHoy: boolean;
  agenda: ReturnType<typeof useAgenda>;
  agendaDelDia: ReturnType<ReturnType<typeof useAgenda>['obtenerAgendaDelDia']>;
}

const START_HOUR = 8; // 08:00
const END_HOUR = 22; // 22:00
const TOTAL_HOURS = END_HOUR - START_HOUR + 1; // 15 horas (08:00 a 22:00)
const HOUR_HEIGHT = 64; // h-16 = 64px

export function AgendaView({ fechaSeleccionada, diaNombre, esHoy, agenda, agendaDelDia }: AgendaViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({ 
    titulo: '', 
    fecha: fechaSeleccionada,
    horaInicio: '10:00', 
    duracion: '60' // minutos
  });

  if (nuevoEvento.fecha !== fechaSeleccionada && !mostrarFormEvento) {
    setNuevoEvento(prev => ({ ...prev, fecha: fechaSeleccionada }));
  }

  const handleAgregarEvento = () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha) return;
    
    const [h, m] = nuevoEvento.horaInicio.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + parseInt(nuevoEvento.duracion));
    
    const horaFin = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

    agenda.agregarEvento({
      id: Date.now().toString(),
      titulo: nuevoEvento.titulo,
      fecha: nuevoEvento.fecha,
      horaInicio: nuevoEvento.horaInicio,
      horaFin: horaFin
    });
    setNuevoEvento({ titulo: '', fecha: fechaSeleccionada, horaInicio: '10:00', duracion: '60' });
    setMostrarFormEvento(false);
  };

  // Separar eventos de todo el día vs eventos con hora
  const allDayEvents = agendaDelDia.filter(item => !item.horaInicio || !item.horaInicio.includes(':'));
  const timedEvents = agendaDelDia.filter(item => item.horaInicio && item.horaInicio.includes(':'));

  // Helper para calcular posición y altura absoluta en la grilla
  const getEventPosition = (horaInicio: string, horaFin?: string) => {
    const [hStart, mStart] = horaInicio.split(':').map(Number);
    const startMinutes = (hStart - START_HOUR) * 60 + (mStart || 0);
    const top = Math.max((startMinutes / 60) * HOUR_HEIGHT, 0);

    let durationMinutes = 60;
    if (horaFin && horaFin.includes(':')) {
      const [hEnd, mEnd] = horaFin.split(':').map(Number);
      const endMinutes = (hEnd - START_HOUR) * 60 + (mEnd || 0);
      durationMinutes = Math.max(endMinutes - startMinutes, 30);
    }

    const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT - 4, 36);
    return { top, height };
  };

  // Posición de la línea de tiempo actual
  const now = new Date();
  const currentMinutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * HOUR_HEIGHT;
  const showCurrentTimeLine = esHoy && now.getHours() >= START_HOUR && now.getHours() <= END_HOUR;

  return (
    <section className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between text-neutral-300 pb-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-cyan-400" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-white">
            {esHoy ? "Agenda de Hoy" : `Agenda del ${fechaSeleccionada.split('-').reverse().join('/')}`}
          </h2>
        </div>
        <button
          onClick={() => {
            setNuevoEvento(prev => ({ ...prev, fecha: fechaSeleccionada }));
            setMostrarFormEvento(!mostrarFormEvento);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition-colors"
        >
          <Plus size={14} />
          <span>Nuevo Bloque</span>
        </button>
      </div>

      {/* Formulario Agregar Evento */}
      <AnimatePresence>
        {mostrarFormEvento && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING_CONFIG}
            className="flex flex-col gap-3 overflow-hidden bg-neutral-950 p-4 rounded-2xl border border-neutral-800"
          >
            <input 
              type="text"
              placeholder="Título del evento o tarea..."
              value={nuevoEvento.titulo}
              onChange={(e) => setNuevoEvento({...nuevoEvento, titulo: e.target.value})}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            
            <div className="flex gap-2">
              <input 
                type="date"
                value={nuevoEvento.fecha}
                onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                className="flex-[2] bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
              />
              <input 
                type="time"
                value={nuevoEvento.horaInicio}
                onChange={(e) => setNuevoEvento({...nuevoEvento, horaInicio: e.target.value})}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-neutral-400 font-semibold px-1">Duración</label>
              <select
                value={nuevoEvento.duracion}
                onChange={(e) => setNuevoEvento({...nuevoEvento, duracion: e.target.value})}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1 hora y media</option>
                <option value="120">2 horas</option>
                <option value="180">3 horas</option>
              </select>
            </div>

            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => setMostrarFormEvento(false)}
                className="flex-1 py-2.5 text-xs font-bold text-neutral-400 hover:text-white bg-neutral-900 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAgregarEvento}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl py-2.5 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
              >
                Guardar Bloque
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sección "Todo el día" (All Day Events) */}
      {allDayEvents.length > 0 && (
        <div className="flex flex-col gap-2 pb-3 border-b border-neutral-800/80">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
            <CalendarDays size={12} /> Todo el día
          </span>
          <div className="flex flex-wrap gap-2">
            {allDayEvents.map((item, idx) => (
              <div 
                key={item.id || idx}
                onClick={() => setSelectedSubject(item)}
                className="flex items-center gap-2 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 px-3 py-1.5 rounded-xl cursor-pointer transition-colors text-xs font-medium text-white"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="truncate max-w-[200px]">{item.titulo}</span>
                {item.tipo === 'custom' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      agenda.eliminarEvento(item.id);
                    }}
                    className="text-neutral-500 hover:text-red-400 ml-1"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time-Blocking Calendar Grid (Estilo Cal.com de 08:00 a 22:00) */}
      <div className="flex flex-col relative w-full h-[600px] sm:h-[680px] overflow-y-auto mt-2 border-t border-neutral-800 rounded-2xl bg-neutral-950/40 hide-scrollbar">
        {/* Filas de horas */}
        {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
          const hour = i + START_HOUR;
          return (
            <div key={hour} className="flex h-16 border-b border-neutral-800/50 relative">
              <span className="w-14 text-[11px] text-neutral-500 font-mono pr-2 text-right pt-1 select-none shrink-0">
                {String(hour).padStart(2, '0')}:00
              </span>
              <div className="flex-1 relative border-l border-neutral-800/50">
                {/* Línea sutil de media hora */}
                <div className="absolute top-1/2 left-0 right-0 border-b border-neutral-800/20 border-dashed pointer-events-none" />
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
            <div className="w-2.5 h-2.5 -ml-1.5 rounded-full bg-red-500 ring-4 ring-red-500/20 shadow-sm" />
            <div className="flex-1 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
        )}

        {/* Contenedor absoluto de Bloques de Eventos */}
        <div className="absolute top-0 bottom-0 left-14 right-2 pointer-events-none">
          {timedEvents.map((item, idx) => {
            const { top, height } = getEventPosition(item.horaInicio, item.horaFin);
            const materia = parseMateria(item.titulo || item);
            const edificioName = getEdificio(materia.aula);

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSelectedSubject(item)}
                style={{ top: `${top + 2}px`, height: `${height}px` }}
                className={`absolute left-1 right-1 rounded-xl p-2.5 shadow-md cursor-pointer pointer-events-auto overflow-hidden flex flex-col justify-between border backdrop-blur-sm transition-all hover:scale-[1.01] hover:z-20 ${
                  item.color || 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-start justify-between gap-1 min-w-0">
                  <div className="min-w-0 flex flex-col">
                    <span className="font-bold text-xs truncate leading-tight text-white">
                      {materia.nombre || item.titulo}
                    </span>
                    {(materia.aula || edificioName) && (
                      <span className="text-[10px] text-neutral-300 truncate flex items-center gap-1 mt-0.5 opacity-90">
                        <MapPin size={10} className="shrink-0" />
                        {materia.aula ? `Aula ${materia.aula}` : ''} {edificioName ? `• ${edificioName}` : ''}
                      </span>
                    )}
                  </div>

                  {item.tipo === 'custom' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        agenda.eliminarEvento(item.id);
                      }}
                      className="text-neutral-400 hover:text-red-400 p-1 shrink-0 rounded-md transition-colors"
                      title="Eliminar bloque"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono font-medium opacity-80 mt-1">
                  <span className="bg-black/30 px-1.5 py-0.5 rounded">
                    {item.horaInicio} - {item.horaFin || 'Fin'}
                  </span>
                  {item.modalidad && (
                    <span className="bg-black/30 px-1.5 py-0.5 rounded capitalize">
                      {item.modalidad}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <MateriaDetailModal 
        materia={selectedSubject} 
        onClose={() => setSelectedSubject(null)} 
      />
    </section>
  );
}
