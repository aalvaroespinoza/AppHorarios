'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, Moon, Sun, ChevronLeft, Ticket, 
  ChevronRight, BookOpen, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useBec } from '@/hooks/useBec';
import { useTheme, ThemeMode } from '@/context/ThemeContext';

export default function Configuracion() {
  const router = useRouter();
  const bec = useBec();
  const { theme, isDark, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          Ajustes
        </span>
      </header>
      
      <div className="p-4 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
            Configuración ⚙️
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Preferencias de la aplicación y gestión de cursado.
          </p>
        </div>

        {/* SECCIÓN 1: Accesos de Gestión */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[11px] uppercase text-neutral-500 font-bold tracking-wider px-1">
            Gestión y Horarios
          </h2>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Aulas y Materias */}
            <Link href="/aulas" className="group">
              <div className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-3.5 flex flex-col justify-between h-24 transition-all shadow-sm active:scale-95">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate group-hover:text-indigo-300 transition-colors">
                    Aulas
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate block">
                    Gestión de materias
                  </span>
                </div>
              </div>
            </Link>

            {/* Colectivos */}
            <Link href="/horarios" className="group">
              <div className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-3.5 flex flex-col justify-between h-24 transition-all shadow-sm active:scale-95">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate group-hover:text-cyan-300 transition-colors">
                    Horarios
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate block">
                    Grilla de colectivos
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* SECCIÓN 2: Apariencia */}
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

        {/* SECCIÓN 3: Boleto Educativo */}
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

        {/* SECCIÓN 4: Caché y Mantenimiento */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[11px] uppercase text-neutral-500 font-bold tracking-wider px-1">
            Mantenimiento
          </h2>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
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
                  <span className="text-[10px] text-neutral-400">Actualiza Service Worker y horarios locales</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-neutral-500" />
            </button>
          </div>
        </section>

        {/* Footer info */}
        <div className="mt-4 text-center flex flex-col gap-1 text-neutral-600 pb-6">
          <p className="text-xs font-bold tracking-wide text-neutral-500">AppHorarios</p>
          <p className="text-[11px]">Horarios, Viajes y Gestión de Aulas</p>
        </div>
      </div>
    </main>
  );
}
