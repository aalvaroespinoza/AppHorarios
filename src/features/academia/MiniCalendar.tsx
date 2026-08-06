"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useDeadlines } from '@/hooks/useDeadlines';
import NativeCard from '@/components/ui/NativeCard';

export function MiniCalendar() {
  const [currentDate] = useState(new Date());
  const monthName = currentDate.toLocaleString('es-AR', { month: 'long' });
  const year = currentDate.getFullYear();
  
  const { deadlines, agregarDeadline, calcularDiasFaltantes, isMounted } = useDeadlines();
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

  // Encontrar deadlines para el día seleccionado
  const selectedDeadlines = selectedDate 
    ? deadlines.filter(d => d.fecha === selectedDate)
    : [];

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
            const dayDeadlines = dateStr ? deadlines.filter(d => d.fecha === dateStr) : [];
            const isSelected = selectedDate === dateStr;

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
                {dayDeadlines.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayDeadlines.map((dl, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${dl.colorIcono}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <AnimatePresence mode="popLayout">
        {selectedDeadlines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <NativeCard className="flex flex-col gap-3 py-4 border-emerald-900/30 bg-gradient-to-br from-zinc-900/90 to-emerald-950/20">
              {selectedDeadlines.map(dl => {
                const faltan = calcularDiasFaltantes(dl.fecha);
                return (
                  <div key={dl.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-zinc-400 text-xs font-semibold mb-1 tracking-wider uppercase">Deadline</p>
                      <h3 className="text-white font-bold text-base leading-tight">{dl.titulo}</h3>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center min-w-[90px]">
                      <span className="text-2xl mb-0.5">⏳</span>
                      <span className="text-emerald-400 font-black text-sm leading-none">
                        {faltan === 0 ? '¡Hoy!' : faltan < 0 ? 'Pasó' : `${faltan} días`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </NativeCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
