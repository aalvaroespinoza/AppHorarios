"use client";

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Clock, Plus, Trash2 } from 'lucide-react';
import type { useAgenda } from '@/hooks/useAgenda';

interface AgendaViewProps {
  fechaSeleccionada: string;
  diaNombre: string;
  esHoy: boolean;
  agenda: ReturnType<typeof useAgenda>;
  agendaDelDia: ReturnType<ReturnType<typeof useAgenda>['obtenerAgendaDelDia']>;
}

export function AgendaView({ fechaSeleccionada, diaNombre, esHoy, agenda, agendaDelDia }: AgendaViewProps) {
  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({ 
    titulo: '', 
    fecha: fechaSeleccionada,
    horaInicio: '10:00', 
    duracion: '60' // minutos
  });

  // Cuando cambia la fecha seleccionada externamente, actualizamos el form si está cerrado
  // o lo forzamos.
  if (nuevoEvento.fecha !== fechaSeleccionada && !mostrarFormEvento) {
    setNuevoEvento(prev => ({ ...prev, fecha: fechaSeleccionada }));
  }

  const handleAgregarEvento = () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha) return;
    
    // Calcular horaFin basado en duracion
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

  return (
    <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-5 text-zinc-400">
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <h2 className="font-semibold text-sm uppercase tracking-wider">
            {esHoy ? "Agenda de Hoy" : `Agenda del ${fechaSeleccionada.split('-').reverse().join('/')}`}
          </h2>
        </div>
      </div>

      <div className="relative border-l-2 border-zinc-800 ml-3 pl-5 flex flex-col gap-5 py-2">
        {agendaDelDia.length === 0 ? (
          <p className="text-zinc-500 text-sm italic">Sin eventos programados para esta fecha.</p>
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
                  type="date"
                  value={nuevoEvento.fecha}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                  className="flex-[2] bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                />
                <input 
                  type="time"
                  value={nuevoEvento.horaInicio}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, horaInicio: e.target.value})}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 font-semibold px-1">Duración</label>
                <select
                  value={nuevoEvento.duracion}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, duracion: e.target.value})}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora y media</option>
                  <option value="120">2 horas</option>
                  <option value="180">3 horas</option>
                </select>
              </div>

              <div className="flex gap-2 mt-2">
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
              onClick={() => {
                setNuevoEvento(prev => ({ ...prev, fecha: fechaSeleccionada }));
                setMostrarFormEvento(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all text-sm font-semibold hover:bg-zinc-800/30 active:scale-[0.98]"
            >
              <Plus size={18} />
              Agregar evento
            </button>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
