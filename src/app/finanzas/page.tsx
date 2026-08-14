"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Wallet, ArrowDownRight, ArrowUpRight, 
  Trash2, X, Users, Sparkles, MoreVertical, Settings2, RotateCcw, HelpCircle, Check 
} from 'lucide-react';
import Link from 'next/link';
import { useFinanzas } from '@/hooks/useFinanzas';
import { useCuentasClaras, TipoDeuda } from '@/hooks/useCuentasClaras';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PAGE_TRANSITION, TAP_ANIMATION } from '@/lib/animations';
import { FinanceChart } from '@/features/finanzas/FinanceChart';
import { trackEvent } from '@/core/analytics/engine';

const CATEGORIAS_DEFAULT = ['Comida', 'Facu', 'Suscripciones', 'Ocio', 'Transporte', 'Otros'];

export default function FinanzasPage() {
  const finanzas = useFinanzas();
  const cuentasClaras = useCuentasClaras();

  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Comida');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('gasto');
  const [showAddForm, setShowAddForm] = useState(false);

  // Modales de Ajustes y Ayuda
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [customPresupuesto, setCustomPresupuesto] = useState('150000');
  const [alertaPorcentaje, setAlertaPorcentaje] = useState('80');

  // Modal Split / Cuentas Claras
  const [showSplit, setShowSplit] = useState(false);
  const [splitPersona, setSplitPersona] = useState('');
  const [splitMonto, setSplitMonto] = useState('');
  const [splitDesc, setSplitDesc] = useState('');
  const [splitTipo, setSplitTipo] = useState<TipoDeuda>('me_debe');

  useEffect(() => {
    const savedPresupuesto = localStorage.getItem('lifeos_finanzas_presupuesto');
    if (savedPresupuesto) setCustomPresupuesto(savedPresupuesto);
    const savedAlerta = localStorage.getItem('lifeos_finanzas_alerta');
    if (savedAlerta) setAlertaPorcentaje(savedAlerta);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lifeos_finanzas_presupuesto', customPresupuesto);
    localStorage.setItem('lifeos_finanzas_alerta', alertaPorcentaje);
    setShowSettings(false);
  };

  const handleResetData = () => {
    if (!window.confirm('¿Reiniciar todas las transacciones financieras a valores limpios?')) return;
    localStorage.removeItem('lifeos_transacciones');
    localStorage.removeItem('lifeos_cuentas_claras');
    window.location.reload();
  };

  const { balanceTotal = 0, gastosDelMes = 0, transacciones = [] } = finanzas;

  const formatoMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(valor);
  };

  const presupuestoVal = Number(customPresupuesto) || 150000;
  const gasto = gastosDelMes;
  const saldoDisponible = Math.max(presupuestoVal - gasto, 0);
  const porcentaje = Math.min(Math.round((gasto / (presupuestoVal || 1)) * 100), 100);
  const esAlertaSuperada = porcentaje >= Number(alertaPorcentaje);

  const handleGuardar = () => {
    if (!monto || isNaN(Number(monto))) return;
    const montoNum = Number(monto);
    finanzas.agregarTransaccion({
      id: Date.now().toString(),
      monto: montoNum,
      tipo,
      categoria,
      descripcion,
      fecha: new Date().toISOString()
    });
    // Registrar evento real en el motor analítico
    trackEvent(
      tipo === 'gasto' ? 'expense_added' : 'income_added',
      'finance',
      montoNum
    );
    setMonto('');
    setDescripcion('');
    setShowAddForm(false);
  };

  const handleGuardarDeuda = () => {
    if (!splitPersona || !splitMonto || isNaN(Number(splitMonto))) return;
    cuentasClaras.agregarDeuda({
      persona: splitPersona,
      monto: Number(splitMonto),
      descripcion: splitDesc || 'Gasto compartido',
      tipo: splitTipo
    });
    setSplitPersona('');
    setSplitMonto('');
    setSplitDesc('');
    setShowSplit(false);
  };

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-4 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/boveda"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Finanzas <Wallet size={17} className="text-emerald-400" />
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium">Control de gastos y deudas</p>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Ayuda"
          >
            <HelpCircle size={15} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Ajustes de Presupuesto"
          >
            <Settings2 size={15} />
          </button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1 px-3 shadow-md shadow-emerald-500/20"
          >
            <Plus size={15} />
            <span>Gasto</span>
          </Button>
        </div>
      </header>

      {/* Card Resumen Semanal con Motor Analítico Visual */}
      <Card className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Resumen Semanal</h2>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-bold border-neutral-800 text-neutral-400">
            Últimos 7 Días
          </Badge>
        </div>
        <FinanceChart 
          transacciones={transacciones} 
          presupuestoSemanal={presupuestoVal} 
        />
      </Card>

      {/* Card de Presupuesto y Balance */}
      <Card className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Disponible del Mes</span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-0.5 font-sans">
              {formatoMoneda(saldoDisponible)}
            </div>
          </div>
          <Badge className={`text-xs font-bold ${esAlertaSuperada ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
            {porcentaje}% Gastado
          </Badge>
        </div>

        {/* Barra de progreso de presupuesto */}
        <div className="w-full bg-neutral-800/80 h-2.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${esAlertaSuperada ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-neutral-400 font-medium pt-1 border-t border-neutral-800/60">
          <span>Gastado: <strong className="text-white">{formatoMoneda(gasto)}</strong></span>
          <span>Meta: <strong className="text-neutral-300">{formatoMoneda(presupuestoVal)}</strong></span>
        </div>
      </Card>

      {/* Botones Rápidos (Dividir Cuentas / Agregar) */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          onClick={() => setShowSplit(true)}
          variant="outline"
          className="rounded-2xl border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white flex items-center justify-center gap-2 py-3 h-auto"
        >
          <Users size={16} className="text-cyan-400" />
          <span className="text-xs font-bold">Cuentas Claras</span>
        </Button>
        <Button
          onClick={() => {
            setTipo('ingreso');
            setShowAddForm(true);
          }}
          variant="outline"
          className="rounded-2xl border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white flex items-center justify-center gap-2 py-3 h-auto"
        >
          <ArrowDownRight size={16} className="text-emerald-400" />
          <span className="text-xs font-bold">+ Ingreso</span>
        </Button>
      </div>

      {/* Formulario Agregar Transacción */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl overflow-hidden"
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {tipo === 'gasto' ? '💸 Registrar Gasto' : '💰 Registrar Ingreso'}
              </span>
              <button onClick={() => setShowAddForm(false)} className="text-neutral-500 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTipo('gasto')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${tipo === 'gasto' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-neutral-950 text-neutral-500'}`}
              >
                Gasto
              </button>
              <button
                onClick={() => setTipo('ingreso')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${tipo === 'ingreso' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-neutral-950 text-neutral-500'}`}
              >
                Ingreso
              </button>
            </div>

            <input 
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Monto ARS (ej: 4500)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              autoFocus
            />

            <div className="flex gap-2">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIAS_DEFAULT.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input 
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción (opcional)"
                className="flex-[2] bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <Button
              onClick={handleGuardar}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl mt-1"
            >
              Guardar Movimiento
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historial de Movimientos */}
      <div className="flex flex-col gap-2 mt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-1">
          Últimos Movimientos
        </span>

        <div className="flex flex-col gap-2">
          {transacciones.slice(0, 8).map(t => (
            <div key={t.id} className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {t.tipo === 'ingreso' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.descripcion || t.categoria}</h4>
                  <span className="text-[10px] text-neutral-500 font-medium">{t.categoria}</span>
                </div>
              </div>

              <span className={`text-xs font-bold font-mono ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-neutral-200'}`}>
                {t.tipo === 'ingreso' ? '+' : '-'}{formatoMoneda(Number(t.monto))}
              </span>
            </div>
          ))}

          {transacciones.length === 0 && (
            <p className="text-xs text-neutral-500 text-center py-6">Sin movimientos registrados este mes.</p>
          )}
        </div>
      </div>

      {/* Modal Ajustes */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings2 size={16} className="text-emerald-400" /> Ajustes Financieros
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-400 font-semibold">Presupuesto Mensual (ARS)</label>
                  <input 
                    type="number"
                    value={customPresupuesto}
                    onChange={(e) => setCustomPresupuesto(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-400 font-semibold">Alerta de Gasto (% Límite)</label>
                  <input 
                    type="number"
                    value={alertaPorcentaje}
                    onChange={(e) => setAlertaPorcentaje(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl mt-1">
                  Guardar Preferencias
                </Button>
              </form>

              <div className="pt-2 border-t border-neutral-800">
                <Button
                  onClick={handleResetData}
                  variant="destructive"
                  className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Reiniciar Base de Datos Financiera</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ayuda */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle size={16} className="text-emerald-400" /> Guía de Finanzas
                </h2>
                <button onClick={() => setShowHelp(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <li>• <strong>Presupuesto Dinámico</strong>: Configura tu meta mensual en ajustes para ver cuánto saldo te queda día a día.</li>
                <li>• <strong>Cuentas Claras</strong>: Registra gastos compartidos y deudas con amigos o compañeros sin perder la cuenta.</li>
                <li>• <strong>100% Privado</strong>: Todos tus datos se almacenan de manera local y encriptada.</li>
              </ul>

              <Button
                onClick={() => setShowHelp(false)}
                className="w-full mt-2 text-xs font-bold rounded-xl bg-emerald-500 text-black hover:bg-emerald-400"
              >
                Entendido
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Split Cuentas Claras */}
      <AnimatePresence>
        {showSplit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users size={16} className="text-cyan-400" /> Registrar Gasto Compartido
                </h2>
                <button onClick={() => setShowSplit(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <input 
                  type="text"
                  value={splitPersona}
                  onChange={(e) => setSplitPersona(e.target.value)}
                  placeholder="Persona / Amigo (ej: Juan)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input 
                  type="number"
                  value={splitMonto}
                  onChange={(e) => setSplitMonto(e.target.value)}
                  placeholder="Monto ARS"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input 
                  type="text"
                  value={splitDesc}
                  onChange={(e) => setSplitDesc(e.target.value)}
                  placeholder="Motivo (ej: Asado, Pizza)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setSplitTipo('me_debe')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${splitTipo === 'me_debe' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-neutral-950 text-neutral-500'}`}
                  >
                    Me debe
                  </button>
                  <button
                    onClick={() => setSplitTipo('le_debo')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${splitTipo === 'le_debo' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-neutral-950 text-neutral-500'}`}
                  >
                    Le debo
                  </button>
                </div>

                <Button
                  onClick={handleGuardarDeuda}
                  className="w-full mt-2 font-bold bg-cyan-500 hover:bg-cyan-400 text-black text-xs rounded-xl"
                >
                  Guardar en Cuentas Claras
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
