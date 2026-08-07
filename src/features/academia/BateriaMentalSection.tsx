"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, BatteryFull, BatteryMedium, BatteryLow, Plus } from 'lucide-react';
import { useBateriaMental, EnergiaNivel } from '@/hooks/useBateriaMental';

const FILTROS = [
  { id: 'todas', label: 'Todas', icon: null },
  { id: 'alta', label: 'Alta', icon: BatteryFull, color: 'text-red-400' },
  { id: 'media', label: 'Media', icon: BatteryMedium, color: 'text-yellow-400' },
  { id: 'baja', label: 'Baja', icon: BatteryLow, color: 'text-emerald-400' },
];

export function BateriaMentalSection() {
  const { tareas, isMounted, agregarTarea, alternarCompletada, eliminarTarea } = useBateriaMental();
  const [filtro, setFiltro] = useState<EnergiaNivel | 'todas'>('todas');
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [nuevaEnergia, setNuevaEnergia] = useState<EnergiaNivel>('alta');
  const [isAdding, setIsAdding] = useState(false);

  if (!isMounted) return null;

  const tareasFiltradas = tareas.filter(t => filtro === 'todas' || t.energia === filtro);

  const handleAdd = () => {
    if (!nuevaTarea.trim()) return;
    agregarTarea(nuevaTarea, nuevaEnergia);
    setNuevaTarea('');
    setIsAdding(false);
  };

  const getEnergiaColor = (nivel: EnergiaNivel) => {
    switch (nivel) {
      case 'alta': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'media': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'baja': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <section className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Batería Mental</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <Plus size={14} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-2 mb-2">
              <input 
                placeholder="¿Qué hay que hacer?"
                value={nuevaTarea}
                onChange={e => setNuevaTarea(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-base text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2 items-center justify-between mt-1">
                <div className="flex gap-1.5">
                  {(['alta', 'media', 'baja'] as EnergiaNivel[]).map(nivel => (
                    <button
                      key={nivel}
                      onClick={() => setNuevaEnergia(nivel)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                        nuevaEnergia === nivel 
                          ? getEnergiaColor(nivel)
                          : 'bg-zinc-800/50 text-zinc-500 border-transparent hover:text-zinc-300'
                      }`}
                    >
                      {nivel}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                >
                  Agregar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTROS.map(f => {
          const Icon = f.icon;
          const isActive = filtro === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive 
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-md' 
                  : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800'
              }`}
            >
              {Icon && <Icon size={12} className={isActive ? 'text-zinc-900' : f.color} />}
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 min-h-[100px]">
        {tareasFiltradas.length === 0 ? (
          <p className="text-zinc-600 text-xs italic text-center py-6 border border-dashed border-zinc-800 rounded-2xl">
            No hay tareas de esta energía.
          </p>
        ) : (
          <AnimatePresence>
            {tareasFiltradas.map(t => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: t.completada ? 0.5 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  t.completada 
                    ? 'bg-zinc-900/40 border-zinc-800/50 grayscale' 
                    : 'bg-zinc-900/80 border-zinc-800/80 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => alternarCompletada(t.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      t.completada 
                        ? 'bg-emerald-500 text-white scale-90' 
                        : 'border-2 border-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {t.completada && <Check size={14} />}
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold transition-all ${t.completada ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                      {t.titulo}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getEnergiaColor(t.energia)}`}>
                    {t.energia}
                  </span>
                  <button 
                    onClick={() => eliminarTarea(t.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
