'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NativeCard from '@/core/components/ui/NativeCard';
import { 
  Bell, RefreshCw, Moon, Sun, ChevronLeft, Ticket, 
  Info, ChevronRight, BookOpen, Wallet, Kanban, FileText, 
  Settings2, Check, Sparkles, HelpCircle 
} from 'lucide-react';
import Link from 'next/link';
import { useBec } from '@/hooks/useBec';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { HelpModal } from '@/components/HelpModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Configuracion() {
  const router = useRouter();
  const bec = useBec();
  const { theme, isDark, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // Estado para el Presupuesto Semanal
  const [presupuestoSemanal, setPresupuestoSemanal] = useState<string>('30000');
  const [presupuestoGuardado, setPresupuestoGuardado] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedBudget = localStorage.getItem('lifeos_weekly_budget');
    if (storedBudget) {
      setPresupuestoSemanal(storedBudget);
    }
  }, []);

  const handleGuardarPresupuesto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presupuestoSemanal) return;
    localStorage.setItem('lifeos_weekly_budget', presupuestoSemanal);
    setPresupuestoGuardado(true);
    setTimeout(() => setPresupuestoGuardado(false), 2000);
  };

  const handleForzarRecarga = () => {
    if (window.confirm('¿Seguro que querés limpiar caché y forzar la recarga? Esto actualizará la app y sincronizará los estados.')) {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => caches.delete(name));
        });
      }
      window.location.reload();
    }
  };

  if (!isMounted) return <div className="min-h-[100dvh] bg-[#0a0a0c]" />;

  const currentDate = new Date();
  const mesNum = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const mesString = currentDate.toLocaleString('es-AR', { month: 'long' });
  const resumenBec = bec.obtenerResumenMensual(mesNum, year);

  return (
    <main className="min-h-[100dvh] bg-[#0a0a0c] text-white font-sans max-w-md mx-auto pb-28 relative">
      {/* Header Sticky */}
      <header className="bg-[#0a0a0c]/90 backdrop-blur-xl pt-12 pb-3 px-4 sticky top-0 z-20 flex items-center justify-between border-b border-neutral-800/80">
        <button 
          onClick={() => router.back()}
          className="text-cyan-400 p-1 flex items-center gap-1 active:opacity-60 transition-opacity"
        >
          <ChevronLeft size={24} className="-ml-1" />
          <span className="text-sm font-semibold">Volver</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Centro de Comando
        </span>
      </header>
      
      <div className="p-4 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
            Configuración ⚙️
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Personalización, presupuesto y módulos del sistema.
          </p>
        </div>

        {/* SECCIÓN 1: Categorías de Ajustes Rápidos */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[11px] uppercase text-neutral-500 font-bold tracking-wider px-1">
            Categorías de Ajustes
          </h2>

          <div className="grid grid-cols-2 gap-2.5">
            {/* General / Materias */}
            <Link href="/configuracion/materias" className="group">
              <div className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-3.5 flex flex-col justify-between h-24 transition-all shadow-sm active:scale-95">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate group-hover:text-indigo-300 transition-colors">
                    General
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate block">
                    Gestión de materias
                  </span>
                </div>
              </div>
            </Link>

            {/* Finanzas */}
            <Link href="/finanzas" className="group">
              <div className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-3.5 flex flex-col justify-between h-24 transition-all shadow-sm active:scale-95">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Wallet size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate group-hover:text-emerald-300 transition-colors">
                    Finanzas
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate block">
                    Balance y deudas
                  </span>
                </div>
              </div>
            </Link>

            {/* Bóveda de Notas */}
            <Link href="/notas" className="group">
              <div className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-3.5 flex flex-col justify-between h-24 transition-all shadow-sm active:scale-95">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate group-hover:text-teal-300 transition-colors">
                    Bóveda
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate block">
                    Notas tipo Notion
                  </span>
                </div>
              </div>
            </Link>

            {/* Kanban */}
            <Link href="/kanban" className="group">
              <div className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-3.5 flex flex-col justify-between h-24 transition-all shadow-sm active:scale-95">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Kanban size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate group-hover:text-sky-300 transition-colors">
                    Kanban
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate block">
                    Tablero ágil
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* SECCIÓN 2: Presupuesto Semanal de Finanzas */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[11px] uppercase text-neutral-500 font-bold tracking-wider px-1">
            Presupuesto Semanal (Finanzas)
          </h2>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Wallet size={18} />
              </div>
              <div>
                <span className="text-sm font-bold text-white block leading-tight">
                  Límite de Gasto Semanal
                </span>
                <span className="text-[11px] text-neutral-400">
                  Calcula alertas automáticas de balance
                </span>
              </div>
            </div>

            <form onSubmit={handleGuardarPresupuesto} className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-2.5 text-xs text-neutral-500 font-mono">$</span>
                <input
                  type="number"
                  value={presupuestoSemanal}
                  onChange={(e) => setPresupuestoSemanal(e.target.value)}
                  placeholder="30000"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className={`text-xs font-bold rounded-xl px-4 transition-all ${
                  presupuestoGuardado
                    ? 'bg-emerald-500 text-black'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                {presupuestoGuardado ? (
                  <span className="flex items-center gap-1"><Check size={14} /> Guardado</span>
                ) : (
                  'Guardar'
                )}
              </Button>
            </form>
          </div>
        </section>

        {/* SECCIÓN 3: Notificaciones y Caché */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[11px] uppercase text-neutral-500 font-bold tracking-wider px-1">
            Sistema & Notificaciones
          </h2>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl divide-y divide-neutral-800/80 overflow-hidden shadow-xl">
            {/* Link a Notificaciones */}
            <Link 
              href="/configuracion/notificaciones" 
              className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-900/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Avisos y Notificaciones</span>
                  <span className="text-[10px] text-neutral-400">Recordatorios de colectivos y clases</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-neutral-500" />
            </Link>

            {/* Limpiar Caché / Forzar Recarga */}
            <button 
              onClick={handleForzarRecarga}
              className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-900/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Limpiar Caché y Forzar Sync</span>
                  <span className="text-[10px] text-neutral-400">Actualiza Service Worker y assets locales</span>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* SECCIÓN 4: Apariencia */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[11px] uppercase text-neutral-500 font-bold tracking-wider px-1">
            Apariencia
          </h2>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <span className="text-xs font-bold text-white">Tema de la Aplicación</span>
            </div>
            
            <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800">
              {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    theme === mode 
                      ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-neutral-700' 
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {mode === 'light' && 'Claro'}
                  {mode === 'dark' && 'Oscuro'}
                  {mode === 'auto' && 'Auto'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: Boleto Educativo */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[11px] uppercase text-neutral-500 font-bold tracking-wider px-1">
            Boleto Educativo Gratuito
          </h2>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Ticket size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Resumen BEC</span>
                <span className="text-[10px] text-neutral-400 capitalize">{mesString} {year}</span>
              </div>
            </div>
            
            <div className="bg-neutral-950 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
                Viajes Registrados este Mes
              </span>
              <div className="text-4xl font-black text-white mb-2">
                {resumenBec.totalCombinado}
              </div>
              <div className="text-xs font-medium text-neutral-400 flex gap-3 items-center">
                <span className="text-emerald-400">Idas: {resumenBec.idaTotal}</span>
                <span className="text-neutral-700">|</span>
                <span className="text-cyan-400">Vueltas: {resumenBec.vueltaTotal}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <div className="mt-4 text-center flex flex-col gap-1 text-neutral-600 pb-6">
          <p className="text-xs font-bold tracking-wide text-neutral-500">LifeOS • AppHorarios v2.1</p>
          <p className="text-[11px]">Sistema Local-First para iPhone & Web</p>
        </div>
      </div>

      {/* Modal Flotante de Ayuda Global */}
      <HelpModal />
    </main>
  );
}
