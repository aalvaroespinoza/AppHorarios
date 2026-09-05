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

  if (!isMounted) return <div className="min-h-[100dvh] bg-[#0A0A0C]" />;

  const currentDate = new Date();
  const mesNum = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const mesString = currentDate.toLocaleString('es-AR', { month: 'long' });
  const resumenBec = bec.obtenerResumenMensual(mesNum, year);

  return (
    <main className="min-h-[100dvh] bg-[#0A0A0C] text-[#F4F4F6] font-sans max-w-md mx-auto pb-safe-nav relative">
      {/* Header Sticky con soporte para Dynamic Island */}
      <header className="bg-[#0A0A0C]/95 backdrop-blur-md pt-[max(1rem,env(safe-area-inset-top))] pb-3 px-4 sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 shadow-none">
        <button 
          onClick={() => router.back()}
          className="text-safety-orange font-mono text-xs font-bold uppercase tracking-wider h-9 px-2 rounded-sm border border-transparent hover:border-zinc-800 bg-zinc-950/60 flex items-center justify-center gap-1 active:translate-y-[0.5px] transition-all cursor-pointer"
        >
          <ChevronLeft size={16} className="-ml-0.5" />
          <span>VOLVER</span>
        </button>

        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
          SYS.CONFIG // AJUSTES
        </span>
      </header>
      
      <div className="p-4 flex flex-col gap-5">
        <div>
          <span className="text-[10px] font-mono font-bold text-safety-orange tracking-[0.2em] uppercase block mb-0.5">
            PREFERENCIAS DE HARDWARE
          </span>
          <h1 className="text-2xl font-mono font-black tracking-tight text-zinc-100 uppercase">
            CONFIGURACIÓN
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            PARÁMETROS DEL SISTEMA Y TELEMETRÍA LOCAL.
          </p>
        </div>

        {/* SECCIÓN 1: Accesos de Gestión */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-widest px-0.5">
            [ MÓDULOS DE NAVEGACIÓN ]
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {/* Aulas y Materias */}
            <Link href="/aulas" className="group">
              <div className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-sm p-3.5 flex flex-col justify-between h-24 transition-colors shadow-none cursor-pointer">
                <div className="w-7 h-7 rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-300 flex items-center justify-center">
                  <BookOpen size={14} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-mono font-bold text-zinc-100 block truncate group-hover:text-safety-orange transition-colors">
                    AULAS
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 truncate block">
                    Gestión de materias
                  </span>
                </div>
              </div>
            </Link>

            {/* Colectivos */}
            <Link href="/horarios" className="group">
              <div className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-sm p-3.5 flex flex-col justify-between h-24 transition-colors shadow-none cursor-pointer">
                <div className="w-7 h-7 rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-300 flex items-center justify-center">
                  <Clock size={14} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-mono font-bold text-zinc-100 block truncate group-hover:text-safety-orange transition-colors">
                    HORARIOS
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 truncate block">
                    Grilla completa
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* SECCIÓN 2: Apariencia */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-widest px-0.5">
            [ TEMA Y DISPLAY ]
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3.5 flex flex-col gap-3 shadow-none">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-300 flex items-center justify-center">
                {isDark ? <Moon size={13} /> : <Sun size={13} />}
              </div>
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase">MODO DE PANTALLA</span>
            </div>
            
            <div className="flex bg-zinc-950 p-1 rounded-sm border border-zinc-800 gap-1">
              {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center justify-center ${
                    theme === mode 
                      ? 'bg-zinc-800 text-safety-orange border border-safety-orange/50 shadow-none' 
                      : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  {mode === 'light' && 'CLARO'}
                  {mode === 'dark' && 'OSCURO'}
                  {mode === 'auto' && 'AUTO'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: Boleto Educativo */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-widest px-0.5">
            [ TELEMETRÍA BEC // BOLETO EDUCATIVO ]
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3.5 flex flex-col gap-3 shadow-none">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-300 flex items-center justify-center">
                <Ticket size={13} />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-zinc-200 uppercase block">RESUMEN MENSUAL</span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">{mesString} {year}</span>
              </div>
            </div>
            
            <div className="bg-zinc-950 rounded-sm p-3 flex flex-col items-center justify-center text-center border border-zinc-800">
              <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-widest font-bold mb-1">
                TOTAL VIAJES REGISTRADOS
              </span>
              <div className="text-4xl font-mono font-bold text-zinc-100 mb-1">
                {resumenBec.totalCombinado}
              </div>
              <div className="text-xs font-mono text-zinc-400 flex gap-3 items-center">
                <span className="text-safety-orange font-semibold">IDAS: {resumenBec.idaTotal}</span>
                <span className="text-zinc-700">{"//"}</span>
                <span className="text-acid-green font-semibold">VUELTAS: {resumenBec.vueltaTotal}</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: Caché y Mantenimiento */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-widest px-0.5">
            [ DIAGNÓSTICO Y MANTENIMIENTO ]
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-none">
            <button 
              onClick={handleForzarRecarga}
              className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-300 flex items-center justify-center">
                  <RefreshCw size={13} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-zinc-100 block uppercase">LIMPIAR CACHÉ // SYNC FORZADO</span>
                  <span className="text-[10px] font-mono text-zinc-500">Purga service worker y regenera stores locales</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-500" />
            </button>
          </div>
        </section>

        {/* Footer info */}
        <div className="mt-2 text-center flex flex-col gap-0.5 text-zinc-600 pb-4 font-mono">
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">SYS.LIFEOS // APPHORARIOS</p>
          <p className="text-[9px] uppercase tracking-wider text-zinc-600">HARDWARE CONSOLE EDITION</p>
        </div>
      </div>
    </main>
  );
}
