"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useAgenda } from '@/hooks/useAgenda';
import { useEscenario } from '@/hooks/useEscenario';
import NativeCard from '@/components/ui/NativeCard';
import { determineScenario, findScenario } from '@/lib/engine/scenario-engine';
import { subjectData } from '@/data/subjects';
import type { DayOfWeek } from '@/types/common';

export function MiniCalendar() {
  const [currentDate] = useState(new Date());
  const monthName = currentDate.toLocaleString('es-AR', { month: 'long' });
  const year = currentDate.getFullYear();
  
  const { deadlines, agregarDeadline, calcularDiasFaltantes, isMounted: isDeadMounted } = useDeadlines();
  const agenda = useAgenda();
  const { cursaArquitectura, isMounted: isEscMounted } = useEscenario();

  const isMounted = isDeadMounted && agenda.isMounted && isEscMounted;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDead, setNewDead] = useState({ titulo: '', fecha: '' });
  
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // monday first
  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

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
    const agendaEventos = agenda.eventos.filter(e => e.dia === dayOfWeek);
    agendaEventos.forEach(e => {
      combined.push({
        id: `evento-${e.id}`,
        tipo: 'evento',
        titulo: e.titulo,
        horaInicio: e.horaInicio,
        horaFin: e.horaFin,
        color: 'bg-zinc-500'
      });
    });
    
    // 3. Deadlines
    const dayDeadlines = deadlines.filter(d => d.fecha === dateStr);
    dayDeadlines.forEach(dl => {
      combined.push({
        id: `deadline-${dl.id}`,
        tipo: 'deadline',
        titulo: dl.titulo,
        horaInicio: '23:59',
        horaFin: '23:59',
        color: dl.colorIcono || 'bg-emerald-500',
        dlFaltan: calcularDiasFaltantes(dl.fecha)
      });
    });
    
    // Ordenar cronológicamente
    combined.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    return combined;
  };

  const handleSaveDeadline = () => {
    if (newDead.titulo && newDead.fecha) {
      agregarDeadline({
        id: Date.now().toString(),
        titulo: newDead.titulo,
        fecha: newDead.fecha,
        colorIcono: 'bg-emerald-500' // default color
      });
      setNewDead({ titulo: '', fecha: '' });
      setShowAddForm(false);
    }
  };

  if (!isMounted) return null;

  const combinedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 text-zinc-400">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} />
            <h2 className="font-semibold text-sm uppercase tracking-wider capitalize">{monthName} {year}</h2>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2 p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                <input 
                  type="text" placeholder="Título del deadline"
                  value={newDead.titulo} onChange={(e) => setNewDead({...newDead, titulo: e.target.value})}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <input 
                    type="date"
                    value={newDead.fecha} onChange={(e) => setNewDead({...newDead, fecha: e.target.value})}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                  <button onClick={handleSaveDeadline} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-sm">
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-[10px] font-bold text-zinc-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysArray.map((day, idx) => {
            const isToday = day === currentDate.getDate();
            const dateStr = day ? `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
            const isSelected = selectedDate === dateStr;
            
            let dots: string[] = [];
            if (dateStr) {
              const evs = getEventsForDate(dateStr);
              // Para no llenar de puntos si hay 5 clases, agrupamos por tipo o mostramos máx 3
              const uniqueTypes = Array.from(new Set(evs.map(e => e.tipo)));
              dots = uniqueTypes.map(t => {
                if (t === 'clase') return 'bg-blue-400';
                if (t === 'deadline') return 'bg-emerald-500';
                return 'bg-zinc-400';
              });
            }

            return (
              <button 
                key={idx} 
                onClick={() => dateStr && setSelectedDate(isSelected ? null : dateStr)}
                disabled={!day}
                className={`h-9 w-full flex flex-col items-center justify-center text-xs rounded-lg transition-colors relative ${
                  isToday 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20' 
                    : isSelected
                      ? 'bg-zinc-700 text-white font-bold'
                      : day 
                        ? 'text-zinc-300 hover:bg-zinc-800' 
                        : 'text-transparent cursor-default'
                }`}
              >
                <span>{day}</span>
                {dots.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dots.map((color, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${color}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <AnimatePresence mode="popLayout">
        {combinedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <NativeCard className="flex flex-col gap-3 py-4 border-zinc-800/80 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90">
              <div className="flex flex-col gap-0 relative">
                {/* Línea vertical continua */}
                <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-zinc-800 rounded-full" />

                {combinedEvents.map((ev, idx) => {
                  const isDeadline = ev.tipo === 'deadline';
                  const isClase = ev.tipo === 'clase';
                  
                  return (
                    <div key={ev.id} className="relative pl-8 py-3">
                      {/* Punto en la línea */}
                      <div className={`absolute left-[3px] top-[22px] w-3.5 h-3.5 bg-zinc-900 border-[2.5px] rounded-full z-10 ${
                        isDeadline ? 'border-emerald-500' : isClase ? 'border-blue-500' : 'border-zinc-500'
                      }`} />
                      
                      <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-zinc-400 text-xs font-semibold mb-1 tracking-wider uppercase flex items-center gap-1">
                              {isDeadline ? '⏳ Entrega' : isClase ? '📘 Clase' : '📅 Evento'}
                            </p>
                            <h3 className="text-white font-bold text-base leading-tight">{ev.titulo}</h3>
                            <p className="text-zinc-400 text-sm mt-1.5 font-medium">
                              {isDeadline ? 'Todo el día' : `${ev.horaInicio} - ${ev.horaFin}`}
                            </p>
                          </div>
                          
                          {isDeadline && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex flex-col items-center justify-center min-w-[70px]">
                              <span className="text-emerald-400 font-black text-xs leading-none text-center">
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
            </NativeCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
