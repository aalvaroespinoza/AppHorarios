"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, DollarSign, Plus, X } from 'lucide-react';
import Link from 'next/link';
import PomodoroWidget from '@/components/PomodoroWidget';
import type { useFinanzas } from '@/hooks/useFinanzas';

export function FloatingActions({ finanzas }: { finanzas: ReturnType<typeof useFinanzas> }) {
  const [showPomo, setShowPomo] = useState(false);
  const [showFin, setShowFin] = useState(false);
  
  const [montoR, setMontoR] = useState('');
  const [tipoR, setTipoR] = useState<'ingreso' | 'gasto'>('gasto');

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
    <>
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
    </>
  );
}
