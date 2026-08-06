"use client";

import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ChevronLeft, Plus, Wallet, ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useFinanzas } from '@/hooks/useFinanzas';

const CATEGORIAS = ['Comida', 'Facu', 'Suscripciones', 'Ocio', 'Transporte', 'Otros'];

export default function FinanzasPage() {
  const finanzas = useFinanzas();
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Comida');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('gasto');

  const { balanceTotal, gastosDelMes, transacciones, isMounted } = finanzas;

  if (!isMounted) return null;

  const handleGuardar = () => {
    if (!monto || isNaN(Number(monto))) return;
    
    finanzas.agregarTransaccion({
      id: Date.now().toString(),
      tipo,
      monto: Number(monto),
      categoria: tipo === 'ingreso' ? 'Ingreso' : categoria,
      descripcion: descripcion || (tipo === 'ingreso' ? 'Ingreso' : categoria),
      fecha: new Date().toISOString(),
    });
    
    setMonto('');
    setDescripcion('');
  };

  const formatoMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 pb-28 min-h-screen"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 mt-2">
        <Link 
          href="/academia"
          className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Finanzas <Wallet size={20} className="text-emerald-400" />
          </h1>
        </div>
      </header>

      {/* Dashboard Superior */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 shadow-lg backdrop-blur-md">
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-1">Balance Total</p>
          <p className={`text-2xl font-bold tracking-tight ${balanceTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatoMoneda(balanceTotal)}
          </p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 shadow-lg backdrop-blur-md">
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-1">Gastos del Mes</p>
          <p className="text-2xl font-bold tracking-tight text-red-400">
            {formatoMoneda(gastosDelMes)}
          </p>
        </div>
      </div>

      {/* Formulario Rápido */}
      <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-zinc-400 mb-4">Nueva Transacción</h2>
        
        <div className="flex gap-2 mb-4 bg-zinc-950 p-1 rounded-2xl border border-zinc-800/50">
          <button 
            onClick={() => setTipo('gasto')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              tipo === 'gasto' ? 'bg-red-500/20 text-red-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Gasto
          </button>
          <button 
            onClick={() => setTipo('ingreso')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              tipo === 'ingreso' ? 'bg-emerald-500/20 text-emerald-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Ingreso
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="absolute left-4 top-3 text-zinc-500 font-bold">$</span>
            <input 
              type="number"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-8 pr-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {tipo === 'gasto' && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    categoria === cat 
                      ? 'bg-zinc-100 text-zinc-900' 
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-white border border-zinc-700/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <input 
            type="text"
            placeholder={tipo === 'gasto' ? 'Descripción (Ej: Hamburguesa)' : 'Descripción (Ej: Sueldo)'}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />

          <button 
            onClick={handleGuardar}
            className={`w-full mt-2 rounded-2xl py-3.5 text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
              tipo === 'gasto' 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
            }`}
          >
            <Plus size={18} />
            Guardar {tipo === 'gasto' ? 'Gasto' : 'Ingreso'}
          </button>
        </div>
      </section>

      {/* Historial */}
      <section>
        <h2 className="font-semibold text-sm uppercase tracking-wider text-zinc-500 mb-3 ml-2">Últimos Movimientos</h2>
        <div className="flex flex-col gap-3">
          {transacciones.length === 0 ? (
            <p className="text-zinc-500 text-sm italic ml-2">No hay movimientos registrados.</p>
          ) : (
            transacciones.slice(0, 10).map((t) => (
              <div key={t.id} className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-y-0 right-0 w-16 bg-red-500 flex items-center justify-center z-0">
                  <Trash2 size={18} className="text-white" />
                </div>
                <motion.div 
                  className="relative z-10 flex items-center justify-between bg-zinc-900/80 border border-zinc-800/80 p-4 shadow-sm"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={{ left: 0.8, right: 0 }}
                  onDragEnd={(e, info: PanInfo) => {
                    if (info.offset.x < -60) {
                      finanzas.eliminarTransaccion(t.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.tipo === 'ingreso' ? 'bg-emerald-500/10' : 'bg-zinc-800'
                    }`}>
                      {t.tipo === 'ingreso' ? (
                        <ArrowUpRight size={18} className="text-emerald-500" />
                      ) : (
                        <ArrowDownRight size={18} className="text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{t.descripcion}</h3>
                      <p className="text-xs text-zinc-500">{t.categoria} • {new Date(t.fecha).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold tabular-nums ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-white'}`}>
                    {t.tipo === 'gasto' ? '-' : '+'}{formatoMoneda(t.monto)}
                  </span>
                </motion.div>
              </div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
}
