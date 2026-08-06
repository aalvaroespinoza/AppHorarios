'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NativeCard from '@/components/ui/NativeCard';
import { Bell, RefreshCw, Moon, Sun, ChevronLeft, Trash2, Ticket, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useBec } from '@/hooks/useBec';

export default function Configuracion() {
  const router = useRouter();
  const bec = useBec();
  const [isMounted, setIsMounted] = useState(false);
  const [notisA, setNotisA] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleForzarRecarga = () => {
    if (window.confirm('¿Seguro que querés limpiar caché y forzar la recarga? Esto actualizará la app y borrará temporalidades.')) {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => caches.delete(name));
        });
      }
      window.location.reload();
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-black" />;

  const currentDate = new Date();
  const mesNum = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const mesString = currentDate.toLocaleString('es-AR', { month: 'long' });
  const resumenBec = bec.obtenerResumenMensual(mesNum, year);

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans max-w-md mx-auto pb-10">
      <header className="bg-zinc-950/90 backdrop-blur-md pt-12 pb-4 px-2 sticky top-0 z-10 flex items-center gap-2">
        <button 
          onClick={() => router.back()}
          className="text-blue-500 p-2 flex items-center gap-1 active:opacity-50"
        >
          <ChevronLeft size={28} className="-ml-2" />
          <span className="text-lg -ml-1">Volver</span>
        </button>
      </header>
      
      <div className="px-4">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-6 pl-2">Configuración</h1>

        {/* SECCIÓN 1: General */}
        <section className="mb-6">
          <h2 className="text-[13px] uppercase text-zinc-500 font-medium tracking-wide mb-2 ml-4">General</h2>
          <NativeCard className="p-0 overflow-hidden bg-zinc-900 border-none divide-y divide-zinc-800">
            {/* Toggle Notificaciones */}
            <div className="flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-1.5 rounded-[10px] text-white">
                  <Bell size={18} fill="currentColor" />
                </div>
                <span className="font-medium text-[16px] text-white">Notificaciones</span>
              </div>
              <div 
                onClick={() => setNotisA(!notisA)}
                className={`w-12 h-7 rounded-full p-0.5 cursor-pointer transition-colors ${notisA ? 'bg-green-500' : 'bg-zinc-700'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${notisA ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Limpiar Caché / Forzar Recarga */}
            <button 
              onClick={handleForzarRecarga}
              className="w-full flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-1.5 rounded-[10px] text-white">
                  <RefreshCw size={18} />
                </div>
                <span className="font-medium text-[16px] text-white">Limpiar Caché</span>
              </div>
            </button>
          </NativeCard>
        </section>

        {/* SECCIÓN 2: Apariencia */}
        <section className="mb-6">
          <h2 className="text-[13px] uppercase text-zinc-500 font-medium tracking-wide mb-2 ml-4">Apariencia</h2>
          <NativeCard className="p-0 overflow-hidden bg-zinc-900 border-none divide-y divide-zinc-800">
            <div className="flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-1.5 rounded-[10px] text-white">
                  {darkMode ? <Moon size={18} fill="currentColor" /> : <Sun size={18} fill="currentColor" />}
                </div>
                <span className="font-medium text-[16px] text-white">Modo Oscuro</span>
              </div>
              <div 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-7 rounded-full p-0.5 cursor-pointer transition-colors ${darkMode ? 'bg-green-500' : 'bg-zinc-700'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </NativeCard>
        </section>

        {/* SECCIÓN 3: Boleto Educativo */}
        <section className="mb-6">
          <h2 className="text-[13px] uppercase text-zinc-500 font-medium tracking-wide mb-2 ml-4">Boleto Educativo</h2>
          <NativeCard className="p-0 overflow-hidden bg-zinc-900 border-none">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-1.5 rounded-[10px] text-white">
                  <Ticket size={18} fill="currentColor" />
                </div>
                <div>
                  <span className="font-medium text-[16px] text-white block leading-tight">Resumen de Viajes</span>
                  <span className="text-[13px] text-zinc-400 capitalize">{mesString} {year}</span>
                </div>
              </div>
              
              <div className="bg-zinc-950/60 rounded-xl p-5 flex flex-col items-center justify-center text-center border border-zinc-800/60">
                <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">Total usados</p>
                <div className="text-5xl font-bold text-white mb-2">
                  {resumenBec.totalCombinado}
                </div>
                <div className="text-[13px] font-medium text-zinc-500 flex gap-2 items-center">
                  <span className="text-emerald-400">Idas: {resumenBec.idaTotal}</span>
                  <span className="text-zinc-700">|</span>
                  <span className="text-blue-400">Vueltas: {resumenBec.vueltaTotal}</span>
                </div>
              </div>
            </div>
          </NativeCard>
        </section>

        {/* SECCIÓN 4: Información */}
        <section className="mb-6">
          <h2 className="text-[13px] uppercase text-zinc-500 font-medium tracking-wide mb-2 ml-4">Información</h2>
          <NativeCard className="p-0 overflow-hidden bg-zinc-900 border-none">
            <Link 
              href="/acerca"
              className="w-full flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 text-blue-400 p-1.5 rounded-[10px]">
                  <Info size={18} />
                </div>
                <span className="font-medium text-[16px] text-white">Acerca de la App</span>
              </div>
              <ChevronRight size={18} className="text-zinc-500" />
            </Link>
          </NativeCard>
        </section>

        {/* FOOTER: Acerca de */}
        <div className="mt-12 text-center flex flex-col gap-1 text-zinc-500 pb-10">
          <p className="text-sm font-semibold tracking-wide">AppHorarios v2.0</p>
          <p className="text-xs">Tu Planner Personalizado</p>
          <p className="text-xs mt-2 text-zinc-600">© 2026 Todos los derechos reservados.</p>
        </div>
      </div>
    </main>
  );
}
