"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, CalendarDays, Sparkles, MapPin, Kanban, CheckSquare } from 'lucide-react';
import type { useAgenda, AgendaItem } from '@/hooks/useAgenda';
import { SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

import { getEdificio, parseMateria } from '@/core/utils/edificio';
import { MateriaDetailModal } from '@/components/MateriaDetailModal';
import type { Task } from '@/types/task';

interface AgendaViewProps {
  fechaSeleccionada: string;
  diaNombre: string;
  esHoy: boolean;
  agenda: ReturnType<typeof useAgenda>;
  agendaDelDia: ReturnType<ReturnType<typeof useAgenda>['obtenerAgendaDelDia']>;
}

export function AgendaView({ fechaSeleccionada, diaNombre, esHoy, agenda, agendaDelDia }: AgendaViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [timeblockingBlocks, setTimeblockingBlocks] = useState<any[]>([]);
  const [kanbanTasks, setKanbanTasks] = useState<Task[]>([]);

  const [nuevoEvento, setNuevoEvento] = useState({ 
    titulo: '', 
    fecha: fechaSeleccionada,
    horaInicio: '10:00', 
    duracion: '60' // minutos
  });

  useEffect(() => {
    // Sincronizar bloques de time-blocking
    const storedTB = localStorage.getItem('lifeos_timeblocking_blocks');
    if (storedTB) {
      try {
        setTimeblockingBlocks(JSON.parse(storedTB));
      } catch (e) {}
    }

    // Sincronizar tareas de Kanban
    const storedKB = localStorage.getItem('lifeos_kanban_tasks');
    if (storedKB) {
      try {
        const parsed: Task[] = JSON.parse(storedKB);
        setKanbanTasks(parsed.filter(t => t.status === 'in-progress' || t.status === 'todo'));
      } catch (e) {}
    }
  }, [fechaSeleccionada]);

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

  // Eventos de todo el día base
  const allDayEvents = [
    ...agendaDelDia.filter(item => !item.horaInicio || !item.horaInicio.includes(':')),
    ...(esHoy ? kanbanTasks.slice(0, 3).map(k => ({
      id: 'kb-' + k.id,
      titulo: `📌 ${k.title}`,
      tipo: 'kanban',
      color: 'border-sky-500/40 text-sky-300'
    })) : [])
  ];

  // Eventos con hora (clases + bloques de time-blocking de hoy)
  const tbEventsFormatted: AgendaItem[] = esHoy ? timeblockingBlocks.map(b => ({
    id: b.id,
    titulo: b.title,
    horaInicio: b.horaInicio,
    horaFin: b.horaFin,
    color: b.color || 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200',
    tipo: 'custom' as const,
    modalidad: undefined
  })) : [];

  const timedEvents: AgendaItem[] = [
    ...agendaDelDia.filter(item => item.horaInicio && item.horaInicio.includes(':')),
    ...tbEventsFormatted
  ];

  // Ordenar cronológicamente por horaInicio
  const eventosOrdenados = [...timedEvents].sort((a, b) => 
    (a.horaInicio || '00:00').localeCompare(b.horaInicio || '00:00')
  );

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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-xs font-bold text-black transition-colors active:scale-95"
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
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
            
            <div className="flex gap-2">
              <input 
                type="date"
                value={nuevoEvento.fecha}
                onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                className="flex-[2] bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white [color-scheme:dark]"
              />
              <input 
                type="time"
                value={nuevoEvento.horaInicio}
                onChange={(e) => setNuevoEvento({...nuevoEvento, horaInicio: e.target.value})}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-neutral-400 font-semibold px-1">Duración</label>
              <select
                value={nuevoEvento.duracion}
                onChange={(e) => setNuevoEvento({...nuevoEvento, duracion: e.target.value})}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
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
                className="flex-1 bg-white hover:bg-neutral-200 text-black rounded-xl py-2.5 text-xs font-bold shadow-lg transition-all"
              >
                Guardar Bloque
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sección "Todo el día" (All Day Events & Kanban Sync) */}
      {allDayEvents.length > 0 && (
        <div className="flex flex-col gap-2 pb-3 border-b border-neutral-800/80">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
            <CalendarDays size={12} /> Tareas y Recordatorios
          </span>
          <div className="flex flex-wrap gap-2">
            {allDayEvents.map((item, idx) => (
              <div 
                key={item.id || idx}
                onClick={() => item.tipo !== 'kanban' && setSelectedSubject(item)}
                className={`flex items-center gap-2 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 px-3 py-1.5 rounded-xl transition-colors text-xs font-medium text-white ${item.tipo !== 'kanban' ? 'cursor-pointer' : ''}`}
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

      {/* SECCIÓN 2: Schedule List View Nativo estilo iOS */}
      <div className="flex flex-col gap-4 mt-2">
        {eventosOrdenados.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-neutral-500 gap-2">
            <Clock size={28} className="opacity-40" />
            <p className="text-xs font-medium">Sin actividades programadas para este día.</p>
          </div>
        ) : (
          eventosOrdenados.map((item, idx) => {
            const materia = parseMateria(item.titulo || item);
            const edificioName = getEdificio(materia.aula);

            return (
              <div key={item.id || idx} className="flex gap-3.5 items-start">
                {/* Columna Izquierda: Hora */}
                <div className="w-14 shrink-0 flex flex-col items-end pt-1">
                  <span className="text-sm font-bold text-white">{item.horaInicio}</span>
                  <span className="text-[10px] text-neutral-500 uppercase">{item.horaFin || 'Fin'}</span>
                </div>

                {/* Columna Derecha: Tarjeta de la Tarea / Materia */}
                <div
                  onClick={() => setSelectedSubject(item)}
                  className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 active:scale-[0.98] transition-transform cursor-pointer shadow-lg backdrop-blur-md flex flex-col gap-1.5 hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <h3 className="text-base font-bold text-white truncate leading-tight">
                      {materia.nombre || item.titulo}
                    </h3>
                    {item.tipo === 'custom' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          agenda.eliminarEvento(item.id);
                        }}
                        className="text-neutral-500 hover:text-red-400 p-0.5 shrink-0 rounded-md transition-colors"
                        title="Eliminar bloque"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {(materia.aula || edificioName) && (
                    <p className="text-xs text-neutral-400 flex items-center gap-1">
                      <MapPin size={11} className="shrink-0 text-cyan-400" />
                      <span>{materia.aula ? `Aula ${materia.aula}` : ''} {edificioName ? `• ${edificioName}` : ''}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800">
                      {item.horaInicio} - {item.horaFin || 'Fin'}
                    </span>
                    {item.modalidad && (
                      <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                        {item.modalidad}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MateriaDetailModal 
        materia={selectedSubject} 
        onClose={() => setSelectedSubject(null)} 
      />
    </section>
  );
}
