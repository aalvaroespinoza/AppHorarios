"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useAgenda } from '@/hooks/useAgenda';
import { useEscenario } from '@/hooks/useEscenario';
import NativeCard from '@/core/components/ui/NativeCard';
import { determineScenario, findScenario } from '@/lib/engine/scenario-engine';
import { subjectData } from '@/data/subjects';
import type { DayOfWeek } from '@/core/types/common';
import { SPRING_CONFIG } from '@/lib/animations';
import { getEdificio, parseMateria } from '@/core/utils/edificio';
import { MateriaDetailModal } from '@/components/MateriaDetailModal';

export function MiniCalendar() {
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  
  const monthName = viewDate.toLocaleString('es-AR', { month: 'long' });
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const { deadlines, agregarDeadline, calcularDiasFaltantes, isMounted: isDeadMounted } = useDeadlines();
  const agenda = useAgenda();
  const { cursaArquitectura, isMounted: isEscMounted } = useEscenario();

  const isMounted = isDeadMounted && agenda.isMounted && isEscMounted;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Agregar formulario
  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState<'evento' | 'deadline'>('deadline');
  const [newEntity, setNewEntity] = useState({ titulo: '', fecha: '', horaInicio: '10:00', horaFin: '11:00' });
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // monday first
  const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;
  const daysArray = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

  const goToPreviousMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  };

  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();

  // Helpers para combinar fuentes
  const getEventsForDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObjLocal = new Date(y, m - 1, d);
    const jsDay = dateObjLocal.getDay();
    
    const map: Record<number, DayOfWeek> = {
      1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado', 0: 'lunes'
    };
    const dayOfWeek = map[jsDay];
    
    const combined: any[] = [];
    
    // 1. Clases
    const scenarioId = determineScenario({ referenceDate: dateObjLocal, tuesdayHasArquitectura: cursaArquitectura });
    const scenario = scenarioId ? findScenario(scenarioId) : null;
    
    if (scenario) {
      subjectData.subjects.forEach(sub => {
        if (scenario.activeSubjectIds.includes(sub.id)) {
          sub.classBlocks.forEach(block => {
            if (block.day === dayOfWeek) {
              combined.push({
                id: `clase-${sub.id}-${block.day}`,
                tipo: 'clase',
                titulo: sub.name,
                horaInicio: block.startTime,
                horaFin: block.endTime,
                color: sub.color || 'bg-blue-500'
              });
            }
          });
        }
      });
    }
    
    // 2. Eventos Manuales
    const agendaEventos = agenda.eventos.filter(e => e.fecha === dateStr);
    agendaEventos.forEach(e => {
      combined.push({
        id: `evento-${e.id}`,
        tipo: 'evento',
        titulo: e.titulo,
        horaInicio: e.horaInicio,
        horaFin: e.horaFin,
        color: e.color || 'bg-zinc-500'
      });
    });
    
    // 3. Deadlines
    const dayDeadlines = deadlines.filter(d => d.fecha === dateStr);
    dayDeadlines.forEach(dl => {
      combined.push({
        id: `deadline-${dl.id}`,
        tipo: 'deadline',
        titulo: dl.titulo,
        horaInicio: dl.hora || '23:59',
        horaFin: dl.hora || '23:59',
        color: dl.colorIcono || 'text-emerald-500',
        dlFaltan: calcularDiasFaltantes(dl.fecha)
      });
    });
    
    // Ordenar cronológicamente
    combined.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    return combined;
  };

  const handleSaveEntity = () => {
    if (!newEntity.titulo || !newEntity.fecha) return;
    
    if (addType === 'deadline') {
      agregarDeadline({
        id: Date.now().toString(),
        titulo: newEntity.titulo,
        fecha: newEntity.fecha,
        colorIcono: 'text-emerald-500'
      });
    } else {
      agenda.agregarEvento({
        id: Date.now().toString(),
        titulo: newEntity.titulo,
        fecha: newEntity.fecha,
        horaInicio: newEntity.horaInicio,
        horaFin: newEntity.horaFin
      });
    }
    
    setNewEntity({ titulo: '', fecha: '', horaInicio: '10:00', horaFin: '11:00' });
    setShowAddForm(false);
  };

  if (!isMounted) return null;

  const combinedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const today = new Date();

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
        
        {/* Navegación del Calendario */}
        <div className="flex items-center justify-between mb-5 text-zinc-400">
          <div className="flex items-center gap-1">
            <button onClick={goToPreviousMonth} className="p-1.5 hover:bg-zinc-800 rounded-xl transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="relative">
              <input 
                type="month" 
                value={`${year}-${String(month+1).padStart(2, '0')}`}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m] = e.target.value.split('-');
                    setViewDate(new Date(Number(y), Number(m)-1, 1));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <h2 className="font-semibold text-[15px] uppercase tracking-wider capitalize px-2 flex items-center gap-1.5 text-zinc-200">
                {monthName} {year} <ChevronDown size={14} className="text-zinc-500" />
              </h2>
            </div>
            <button onClick={goToNextMonth} className="p-1.5 hover:bg-zinc-800 rounded-xl transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {!isCurrentMonth && (
              <button onClick={goToToday} className="text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg">
                HOY
              </button>
            )}
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-8 h-8 bg-zinc-800 border border-zinc-700/50 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-sm"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={SPRING_CONFIG}
              className="mb-5 overflow-hidden"
            >
              <div className="flex flex-col gap-3 p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 shadow-inner">
                {/* Tipo Selector */}
                <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                  <button 
                    onClick={() => setAddType('deadline')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${addType === 'deadline' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Recordatorio
                  </button>
                  <button 
                    onClick={() => setAddType('evento')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${addType === 'evento' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Evento
                  </button>
                </div>

                <input 
                  type="text" placeholder="Título"
                  value={newEntity.titulo} onChange={(e) => setNewEntity({...newEntity, titulo: e.target.value})}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-base text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                
                <div className="flex flex-col gap-2">
                  <input 
                    type="date"
                    value={newEntity.fecha} onChange={(e) => setNewEntity({...newEntity, fecha: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-base text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                  {addType === 'evento' && (
                    <div className="flex gap-2">
                      <input 
                        type="time" value={newEntity.horaInicio} onChange={(e) => setNewEntity({...newEntity, horaInicio: e.target.value})}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-base text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                      />
                      <input 
                        type="time" value={newEntity.horaFin} onChange={(e) => setNewEntity({...newEntity, horaFin: e.target.value})}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-base text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-1">
                  <button onClick={() => setShowAddForm(false)} className="flex-1 text-sm font-semibold text-zinc-400 py-2.5 rounded-xl hover:bg-zinc-800/50">
                    Cancelar
                  </button>
                  <button onClick={handleSaveEntity} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-md shadow-blue-900/20 active:scale-95 transition-all">
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grilla del Calendario */}
        <div className="grid grid-cols-7 gap-1 text-center mb-3">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-[11px] font-bold text-zinc-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysArray.map((day, idx) => {
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
            const isSelected = selectedDate === dateStr;
            
            let dots: string[] = [];
            if (dateStr) {
              const evs = getEventsForDate(dateStr);
              // Para no saturar, obtenemos tipos unicos o recortamos
              const uniqueTypes = Array.from(new Set(evs.map(e => e.tipo)));
              dots = uniqueTypes.map(t => {
                if (t === 'clase') return 'bg-blue-400';
                if (t === 'deadline') return 'bg-emerald-500';
                return 'bg-amber-400';
              });
            }

            return (
              <button 
                key={idx} 
                onClick={() => dateStr && setSelectedDate(isSelected ? null : dateStr)}
                disabled={!day}
                className={`h-10 w-full flex flex-col items-center justify-center text-[13px] rounded-xl transition-all relative ${
                  isToday 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30' 
                    : isSelected
                      ? 'bg-zinc-700 text-white font-bold ring-2 ring-zinc-500 ring-offset-2 ring-offset-zinc-900'
                      : day 
                        ? 'text-zinc-300 hover:bg-zinc-800' 
                        : 'text-transparent cursor-default'
                }`}
              >
                <span>{day}</span>
                {dots.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-[3px] mt-0.5 max-w-[20px]">
                    {dots.slice(0, 3).map((color, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${color}`} />
                    ))}
                    {dots.length > 3 && <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Vista de Agenda del Día Seleccionado */}
      <AnimatePresence mode="popLayout">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={SPRING_CONFIG}
          >
            <NativeCard className="flex flex-col gap-3 py-4 border-zinc-800/80 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 shadow-2xl">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-zinc-200 font-bold text-sm tracking-wide">
                  Agenda del {selectedDate.split('-').reverse().join('/')}
                </h3>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">
                  {combinedEvents.length} elementos
                </span>
              </div>
              
              {combinedEvents.length === 0 ? (
                <p className="text-sm text-zinc-500 italic px-2 py-4 text-center">No hay actividades programadas.</p>
              ) : (
                <div className="flex flex-col gap-0 relative">
                  <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-zinc-800 rounded-full" />

                  {combinedEvents.map((ev) => {
                    const isDeadline = ev.tipo === 'deadline';
                    const isClase = ev.tipo === 'clase';
                    
                    return (
                      <div key={ev.id} className="relative pl-8 py-3">
                        <div className={`absolute left-[3px] top-[22px] w-3.5 h-3.5 bg-zinc-900 border-[2.5px] rounded-full z-10 ${
                          isDeadline ? 'border-emerald-500' : isClase ? 'border-blue-500' : 'border-amber-500'
                        }`} />
                        
                        <div 
                          onClick={() => setSelectedSubject(ev)}
                          className="bg-zinc-800/30 border border-zinc-700/30 rounded-2xl p-4 transition-all hover:bg-zinc-800/50 cursor-pointer active:scale-98"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-zinc-400 text-[10px] font-bold mb-1 tracking-wider uppercase flex items-center gap-1.5">
                                {isDeadline ? '⏳ Recordatorio / Entrega' : isClase ? '📘 Clase Regular' : '📅 Evento Personal'}
                              </p>
                              {(() => {
                                const materia = parseMateria(ev.titulo || ev);
                                const edificioName = getEdificio(materia.aula);
                                return (
                                  <div className="flex flex-col text-center mb-1">
                                    <span className="font-bold text-sm">{materia.nombre}</span>
                                    {(materia.curso || materia.aula) && (
                                      <span className="text-xs mt-1">
                                        {materia.curso ? `Curso: ${materia.curso}` : ''}
                                        {materia.curso && materia.aula ? ' | ' : ''}
                                        {materia.aula ? `Aula: ${materia.aula}` : ''}
                                      </span>
                                    )}
                                    {edificioName && (
                                      <span className="text-xs font-semibold opacity-80">
                                        📍 {edificioName}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                              <div className="flex items-center gap-2 justify-center">
                                <span className="bg-black/20 text-zinc-300 text-xs font-medium px-2 py-0.5 rounded-md">
                                  {isDeadline ? (ev.horaInicio !== '23:59' ? ev.horaInicio : 'Todo el día') : `${ev.horaInicio} - ${ev.horaFin}`}
                                </span>
                              </div>
                            </div>
                            
                            {isDeadline && ev.dlFaltan !== undefined && (
                              <div className={`border px-3 py-2 rounded-xl flex flex-col items-center justify-center min-w-[70px] ${
                                ev.dlFaltan === 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                ev.dlFaltan < 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              }`}>
                                <span className="font-black text-xs leading-none text-center">
                                  {ev.dlFaltan === 0 ? '¡Hoy!' : ev.dlFaltan < 0 ? 'Pasó' : `${ev.dlFaltan}d`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </NativeCard>
          </motion.div>
        )}
      </AnimatePresence>

      <MateriaDetailModal 
        materia={selectedSubject} 
        onClose={() => setSelectedSubject(null)} 
      />
    </div>
  );
}
