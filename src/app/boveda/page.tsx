"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, KeyRound, Eye, EyeOff, Copy, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface DatoBoveda {
  id: string;
  titulo: string;
  valor: string;
}

const DATOS_DEFAULT: DatoBoveda[] = [
  { id: '1', titulo: 'Alias Bancario', valor: 'newdata' },
  { id: '2', titulo: 'CUIL', valor: '20472531388' },
  { id: '3', titulo: 'Dirección Envío', valor: 'San Luis 831, Despeñaderos' },
  { id: '4', titulo: 'WiFi Casa (Clave)', valor: 'lorenzojulian' },
  { id: '5', titulo: 'Mail Personal', valor: 'alvaroespinoza512@gmail.com' },
];

export default function BovedaPage() {
  const [datos, setDatos] = useState<DatoBoveda[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Dato state
  const [showAdd, setShowAdd] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoValor, setNuevoValor] = useState('');

  // Unmasked fields
  const [unmasked, setUnmasked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('apphorarios_boveda_v2');
    if (stored) {
      try {
        setDatos(JSON.parse(stored));
      } catch (e) {
        setDatos(DATOS_DEFAULT);
      }
    } else {
      setDatos(DATOS_DEFAULT);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('apphorarios_boveda_v2', JSON.stringify(datos));
    }
  }, [datos, isMounted]);

  const copyToClipboard = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      
      // Feedback
      if (navigator.vibrate) navigator.vibrate(40);
      setToastMsg('¡Copiado al portapapeles!');
      setTimeout(() => setToastMsg(null), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const toggleUnmask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnmasked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = () => {
    if (!nuevoTitulo || !nuevoValor) return;
    setDatos(prev => [...prev, {
      id: Date.now().toString(),
      titulo: nuevoTitulo,
      valor: nuevoValor
    }]);
    setNuevoTitulo('');
    setNuevoValor('');
    setShowAdd(false);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDatos(prev => prev.filter(d => d.id !== id));
  };

  if (!isMounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 mt-2">
        <Link 
          href="/academia"
          className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Bóveda <KeyRound size={20} className="text-amber-400" />
          </h1>
        </div>
      </header>

      {/* Intro */}
      <p className="text-sm text-zinc-400">
        Tus datos clave a un toque de distancia. Tocá cualquier tarjeta para copiar su contenido.
      </p>

      {/* Grid */}
      <div className="flex flex-col gap-3">
        {datos.map(d => {
          const isUnmasked = unmasked[d.id];
          const displayValue = isUnmasked ? d.valor : '•'.repeat(Math.min(d.valor.length, 12));
          return (
            <motion.div
              layout
              key={d.id}
              onClick={() => copyToClipboard(d.valor)}
              className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-sm hover:border-zinc-700"
            >
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">{d.titulo}</span>
                <span className={`text-base font-semibold truncate ${isUnmasked ? 'text-zinc-100' : 'text-zinc-600 tracking-[0.2em]'}`}>
                  {displayValue}
                </span>
              </div>
              <div className="flex gap-2 shrink-0 items-center">
                <button 
                  onClick={(e) => toggleUnmask(d.id, e)}
                  className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  {isUnmasked ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20">
                  <Copy size={14} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fab Button */}
      <button 
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-amber-900/20 active:scale-90 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Nuevo Dato</h3>
                <button onClick={() => setShowAdd(false)} className="text-zinc-500 p-1"><X size={18} /></button>
              </div>
              <input 
                placeholder="Título (Ej: CBU)"
                value={nuevoTitulo}
                onChange={e => setNuevoTitulo(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-amber-500"
              />
              <input 
                placeholder="Valor"
                value={nuevoValor}
                onChange={e => setNuevoValor(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-amber-500"
              />
              <button 
                onClick={handleAdd}
                className="w-full py-3 bg-amber-500 text-black font-bold rounded-xl mt-2 active:scale-[0.98] transition-transform shadow-lg"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2 pointer-events-none"
          >
            <Copy size={14} className="text-amber-500" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
