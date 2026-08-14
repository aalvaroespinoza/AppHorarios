"use client";

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, Plus, Wallet, ArrowDownRight, ArrowUpRight, Trash2, X, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useFinanzas } from '@/hooks/useFinanzas';
import { useCuentasClaras, TipoDeuda } from '@/hooks/useCuentasClaras';
import { PAGE_TRANSITION, TAP_ANIMATION } from '@/lib/animations';

const CATEGORIAS = ['Comida', 'Facu', 'Suscripciones', 'Ocio', 'Transporte', 'Otros'];

export default function FinanzasPage() {
  const finanzas = useFinanzas();
  const cuentasClaras = useCuentasClaras();

  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Comida');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('gasto');
  const [showAddForm, setShowAddForm] = useState(false);

  // Modal Split / Cuentas Claras
  const [showSplit, setShowSplit] = useState(false);
  const [splitPersona, setSplitPersona] = useState('');
  const [splitMonto, setSplitMonto] = useState('');
  const [splitDesc, setSplitDesc] = useState('');
  const [splitTipo, setSplitTipo] = useState<TipoDeuda>('me_debe');

  if (!finanzas.isMounted || !cuentasClaras.isMounted) return null;

  const { balanceTotal, gastosDelMes, transacciones } = finanzas;

  const formatoMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Cálculos de métricas Maybe-style
  let totalIngresosMes = 0;
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  transacciones.forEach(t => {
    const fechaT = new Date(t.fecha);
    if (fechaT.getMonth() === mesActual && fechaT.getFullYear() === anioActual) {
      if (t.tipo === 'ingreso') {
        totalIngresosMes += Number(t.monto);
      }
    }
  });

  const presupuesto = totalIngresosMes > 0 ? totalIngresosMes : (gastosDelMes > 0 ? gastosDelMes * 1.25 : 100000);
  const gasto = gastosDelMes;
  const saldoDisponible = Math.max(presupuesto - gasto, 0);
  const porcentaje = Math.min(Math.round((gasto / (presupuesto || 1)) * 100), 100);

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
    setShowAddForm(false);
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
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-3">
          <Link 
            href="/academia"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Finanzas <Wallet size={18} className="text-cyan-400" />
            </h1>
            <p className="text-xs text-neutral-500 font-medium">Dashboard estilo Maybe</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={TAP_ANIMATION}
            onClick={() => setShowSplit(true)}
            className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Users size={14} className="text-purple-400" />
            <span>Split</span>
          </motion.button>

          <motion.button
            whileTap={TAP_ANIMATION}
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </header>

      {/* TARJETA 1: Resumen Principal */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-cyan-400" /> Presupuesto Disponible
          </span>
          <div className="text-5xl font-extrabold tracking-tight text-white leading-none">
            {formatoMoneda(saldoDisponible)}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-xs text-neutral-400 font-medium">
          <span>Balance Total: <strong className="text-white">{formatoMoneda(balanceTotal)}</strong></span>
          <span>Cuentas Claras: <strong className={cuentasClaras.balanceNeto >= 0 ? 'text-emerald-400' : 'text-red-400'}>{cuentasClaras.balanceNeto >= 0 ? '+' : ''}{formatoMoneda(cuentasClaras.balanceNeto)}</strong></span>
        </div>
      </div>

      {/* TARJETA 2: Barra de Consumo */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Consumo de Presupuesto
          </span>
          <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
            {porcentaje}%
          </span>
        </div>

        {/* Barra de progreso requerida */}
        <div className="w-full bg-neutral-800 rounded-full h-3 mt-4 overflow-hidden">
          <div 
            className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min((gasto / (presupuesto || 1)) * 100, 100)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400 mt-2 font-medium">
          <span>Gastado: <strong className="text-white">{formatoMoneda(gasto)}</strong></span>
          <span>Límite: <strong className="text-neutral-300">{formatoMoneda(presupuesto)}</strong></span>
        </div>
      </div>

      {/* Formulario Rápido (Desplegable) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm uppercase tracking-wider text-neutral-300">Nueva Transacción</h2>
              <button onClick={() => setShowAddForm(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-2 mb-4 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button 
                onClick={() => setTipo('gasto')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  tipo === 'gasto' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Gasto
              </button>
              <button 
                onClick={() => setTipo('ingreso')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  tipo === 'ingreso' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Ingreso
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <span className="absolute left-4 top-3 text-neutral-500 font-bold">$</span>
                <input 
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors"
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
                          ? 'bg-white text-black font-bold' 
                          : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <input 
                type="text"
                placeholder={tipo === 'gasto' ? 'Descripción (Ej: Café, Supermercado)' : 'Descripción (Ej: Sueldo, Venta)'}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />

              <button 
                onClick={handleGuardar}
                className={`w-full mt-2 rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                  tipo === 'gasto' 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                }`}
              >
                <Plus size={18} />
                Guardar {tipo === 'gasto' ? 'Gasto' : 'Ingreso'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TARJETA 3: Movimientos */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-2">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
          <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-400">
            Últimos Movimientos
          </h2>
          <span className="text-xs text-neutral-500 font-mono">{transacciones.length} registros</span>
        </div>

        <div className="flex flex-col">
          {transacciones.length === 0 ? (
            <div className="py-6 text-center text-sm text-neutral-500 italic">
              No hay movimientos registrados. ¡Toca + para agregar el primero!
            </div>
          ) : (
            transacciones.slice(0, 10).map((t) => (
              <div 
                key={t.id} 
                className="flex justify-between items-center border-b border-neutral-800/50 py-3 last:border-b-0"
              >
                <div className="flex flex-col min-w-0 pr-3">
                  <span className="text-sm font-semibold text-white truncate">{t.descripcion}</span>
                  <span className="text-xs text-neutral-500">
                    {new Date(t.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} • {t.categoria}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold text-sm tabular-nums ${
                    t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {t.tipo === 'gasto' ? '-' : '+'}{formatoMoneda(t.monto)}
                  </span>
                  <button 
                    onClick={() => finanzas.eliminarTransaccion(t.id)}
                    className="text-neutral-600 hover:text-red-400 p-1 transition-colors rounded-lg"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Cuentas Claras (Micro-Split) */}
      <AnimatePresence>
        {showSplit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-hidden">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Cuentas Claras <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">Split</span>
                </h2>
                <button onClick={() => setShowSplit(false)} className="text-neutral-500 hover:text-white p-1.5 bg-neutral-800 rounded-full">
                  <X size={16} />
                </button>
              </div>

              {/* Balance Neto */}
              <div className={`p-4 rounded-xl flex flex-col items-center justify-center text-center ${
                cuentasClaras.balanceNeto >= 0 ? 'bg-emerald-950/30 border border-emerald-500/30' : 'bg-red-950/30 border border-red-500/30'
              }`}>
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mb-1">Balance Neto</p>
                <p className={`text-2xl font-black ${cuentasClaras.balanceNeto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {cuentasClaras.balanceNeto >= 0 ? 'Te deben ' : 'Debés '}{formatoMoneda(Math.abs(cuentasClaras.balanceNeto))}
                </p>
              </div>

              {/* Formulario Exprés */}
              <div className="flex flex-col gap-2.5">
                <div className="flex gap-2">
                  <input 
                    placeholder="Persona (Ej: Juan)" 
                    value={splitPersona}
                    onChange={e => setSplitPersona(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-2 text-neutral-500 font-bold text-sm">$</span>
                    <input 
                      placeholder="0.00" 
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={splitMonto}
                      onChange={e => setSplitMonto(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-6 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-bold tabular-nums" 
                    />
                  </div>
                </div>
                <input 
                  placeholder="Descripción (Ej: Pizza, Regalo)" 
                  value={splitDesc}
                  onChange={e => setSplitDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                />
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={() => setSplitTipo('me_debe')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      splitTipo === 'me_debe' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-950 text-neutral-500 border border-neutral-800'
                    }`}
                  >
                    Me debe
                  </button>
                  <button 
                    onClick={() => setSplitTipo('le_debo')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      splitTipo === 'le_debo' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-neutral-950 text-neutral-500 border border-neutral-800'
                    }`}
                  >
                    Le debo
                  </button>
                </div>
                <button 
                  onClick={handleGuardarSplit}
                  className="w-full mt-2 py-3 bg-white hover:bg-neutral-200 text-black text-xs uppercase font-extrabold tracking-wider rounded-xl shadow-lg active:scale-[0.98] transition-transform"
                >
                  Agregar Registro
                </button>
              </div>

              {/* Listado */}
              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 border-t border-neutral-800 pt-3 pb-1">
                {cuentasClaras.deudas.length === 0 ? (
                  <p className="text-neutral-500 text-xs text-center italic py-2">Todo saldado. Cuentas claras, conservan la amistad. 🍻</p>
                ) : (
                  cuentasClaras.deudas.map(d => (
                    <div key={d.id} className="flex items-center justify-between bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span className="truncate max-w-[100px]">{d.persona}</span>
                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                            d.tipo === 'me_debe' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {d.tipo === 'me_debe' ? 'te debe' : 'le debés'}
                          </span>
                        </p>
                        {d.descripcion && <p className="text-xs text-neutral-400 truncate mt-0.5">{d.descripcion}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-sm tabular-nums text-white">{formatoMoneda(d.monto)}</span>
                        <button 
                          onClick={() => cuentasClaras.saldarDeuda(d.id)}
                          className="bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-transform text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg border border-neutral-700/50"
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
