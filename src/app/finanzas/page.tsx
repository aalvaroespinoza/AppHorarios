"use client";

import { useState } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Wallet, ArrowDownRight, ArrowUpRight, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useFinanzas } from '@/hooks/useFinanzas';
import { useCuentasClaras, TipoDeuda } from '@/hooks/useCuentasClaras';

const CATEGORIAS = ['Comida', 'Facu', 'Suscripciones', 'Ocio', 'Transporte', 'Otros'];

export default function FinanzasPage() {
  const finanzas = useFinanzas();
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Comida');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('gasto');

  const { balanceTotal, gastosDelMes, transacciones, isMounted } = finanzas;

  const cuentasClaras = useCuentasClaras();
  const [showSplit, setShowSplit] = useState(false);
  const [splitPersona, setSplitPersona] = useState('');
  const [splitMonto, setSplitMonto] = useState('');
  const [splitDesc, setSplitDesc] = useState('');
  const [splitTipo, setSplitTipo] = useState<TipoDeuda>('me_debe');

  if (!isMounted || !cuentasClaras.isMounted) return null;

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

  const handleGuardarSplit = () => {
    if (!splitMonto || isNaN(Number(splitMonto)) || !splitPersona) return;
    cuentasClaras.agregarDeuda({
      persona: splitPersona,
      monto: Number(splitMonto),
      descripcion: splitDesc,
      tipo: splitTipo
    });
    setSplitPersona('');
    setSplitMonto('');
    setSplitDesc('');
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
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 select-none">
            Finanzas <Wallet size={20} className="text-emerald-400" />
            <span 
              onDoubleClick={() => setShowSplit(true)}
              className="text-[10px] text-zinc-900 ml-1 cursor-default opacity-50 hover:opacity-100"
            >
              •
            </span>
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
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
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

      {/* Modal Cuentas Claras (Micro-Splitwise) */}
      <AnimatePresence>
        {showSplit && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 pt-20"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSplit(false)} />
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-5 max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Cuentas Claras <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 uppercase tracking-widest font-black">Beta</span>
                </h2>
                <button onClick={() => setShowSplit(false)} className="text-zinc-500 hover:text-white p-1 bg-zinc-800/50 rounded-full"><X size={18} /></button>
              </div>

              {/* Balance */}
              <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center ${cuentasClaras.balanceNeto >= 0 ? 'bg-emerald-900/20 border border-emerald-500/20' : 'bg-red-900/20 border border-red-500/20'}`}>
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">Balance Neto</p>
                <p className={`text-2xl font-bold ${cuentasClaras.balanceNeto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {cuentasClaras.balanceNeto >= 0 ? 'Te deben ' : 'Debés '}{formatoMoneda(Math.abs(cuentasClaras.balanceNeto))}
                </p>
              </div>

              {/* Formulario Exprés */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input 
                    placeholder="Persona (Ej: Juan)" 
                    value={splitPersona}
                    onChange={e => setSplitPersona(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-2 text-zinc-500 font-bold text-sm">$</span>
                    <input 
                      placeholder="0.00" 
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={splitMonto}
                      onChange={e => setSplitMonto(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-6 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-bold tabular-nums" 
                    />
                  </div>
                </div>
                <input 
                  placeholder="Descripción (Ej: Pizza)" 
                  value={splitDesc}
                  onChange={e => setSplitDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                />
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={() => setSplitTipo('me_debe')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${splitTipo === 'me_debe' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'}`}
                  >
                    Me debe
                  </button>
                  <button 
                    onClick={() => setSplitTipo('le_debo')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${splitTipo === 'le_debo' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'}`}
                  >
                    Le debo
                  </button>
                </div>
                <button 
                  onClick={handleGuardarSplit}
                  className="w-full mt-2 py-3 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl shadow-lg active:scale-[0.98] transition-transform"
                >
                  Agregar Registro
                </button>
              </div>

              {/* Listado */}
              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 border-t border-zinc-800/50 pt-4 pb-2">
                {cuentasClaras.deudas.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center italic mt-4">Todo saldado. Cuentas claras, conservan la amistad. 🍻</p>
                ) : (
                  cuentasClaras.deudas.map(d => (
                    <div key={d.id} className="flex items-center justify-between bg-zinc-800/40 p-3 rounded-2xl border border-zinc-800/80">
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span className="truncate max-w-[100px]">{d.persona}</span>
                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold shrink-0 ${d.tipo === 'me_debe' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {d.tipo === 'me_debe' ? 'te debe' : 'le debés'}
                          </span>
                        </p>
                        {d.descripcion && <p className="text-xs text-zinc-400 truncate mt-0.5">{d.descripcion}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-sm tabular-nums text-white">{formatoMoneda(d.monto)}</span>
                        <button 
                          onClick={() => cuentasClaras.saldarDeuda(d.id)}
                          className="bg-zinc-700 hover:bg-zinc-600 active:scale-95 transition-transform text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg"
                        >
                          Saldar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
