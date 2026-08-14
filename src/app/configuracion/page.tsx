'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NativeCard from '@/core/components/ui/NativeCard';
import { Bell, RefreshCw, Moon, Sun, ChevronLeft, Trash2, Ticket, Info, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useBec } from '@/hooks/useBec';
import { useTheme, ThemeMode } from '@/context/ThemeContext';

export default function Configuracion() {
  const router = useRouter();
  const bec = useBec();
  const { theme, isDark, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [notisA, setNotisA] = useState(true);

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

  if (!isMounted) return <div className="min-h-[100dvh] bg-black" />;

  const currentDate = new Date();
  const mesNum = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const mesString = currentDate.toLocaleString('es-AR', { month: 'long' });
  const resumenBec = bec.obtenerResumenMensual(mesNum, year);

  return (
    <main className="min-h-[100dvh] bg-gray-50 dark:bg-zinc-950 text-neutral-900 dark:text-white font-sans max-w-md mx-auto pb-10 transition-colors duration-300">
      <header className="bg-gray-50/90 dark:bg-zinc-950/90 backdrop-blur-md pt-12 pb-4 px-2 sticky top-0 z-10 flex items-center gap-2">
        <button 
          onClick={() => router.back()}
          className="text-blue-500 p-2 flex items-center gap-1 active:opacity-50"
        >
          <ChevronLeft size={28} className="-ml-2" />
          <span className="text-lg -ml-1">Volver</span>
        </button>
      </header>
      
      <div className="px-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 pl-2">Configuración</h1>

        {/* SECCIÓN 1: General */}
        <section className="mb-6">
          <h2 className="text-[13px] uppercase text-gray-500 dark:text-zinc-500 font-medium tracking-wide mb-2 ml-4">General</h2>
          <NativeCard className="p-0 overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-none divide-y divide-gray-100 dark:divide-zinc-800">
            {/* Link a Gestión de Materias */}
            <Link href="/configuracion/materias" className="w-full flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-1.5 rounded-[10px] text-white">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="font-medium text-[16px] text-gray-900 dark:text-white block leading-tight">Gestión de Materias</span>
                  <span className="text-[12px] text-gray-500 dark:text-zinc-400">Personaliza tus horarios, cursos y aulas</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-500" />
            </Link>

            {/* Link a Notificaciones */}
            <Link href="/configuracion/notificaciones" className="w-full flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-1.5 rounded-[10px] text-white">
                  <Bell size={18} fill="currentColor" />
                </div>
                <span className="font-medium text-[16px] text-gray-900 dark:text-white">Notificaciones</span>
              </div>
              <ChevronRight size={18} className="text-zinc-500" />
            </Link>

            {/* Limpiar Caché / Forzar Recarga */}
            <button 
              onClick={handleForzarRecarga}
              className="w-full flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-1.5 rounded-[10px] text-white">
                  <RefreshCw size={18} />
                </div>
                <span className="font-medium text-[16px] text-gray-900 dark:text-white">Limpiar Caché</span>
              </div>
            </button>
          </NativeCard>
        </section>

        {/* SECCIÓN 2: Apariencia */}
        <section className="mb-6">
          <h2 className="text-[13px] uppercase text-gray-500 dark:text-zinc-500 font-medium tracking-wide mb-2 ml-4">Apariencia</h2>
          <NativeCard className="p-0 overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-none divide-y divide-gray-100 dark:divide-zinc-800">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-500 p-1.5 rounded-[10px] text-white">
                  {isDark ? <Moon size={18} fill="currentColor" /> : <Sun size={18} fill="currentColor" />}
                </div>
                <span className="font-medium text-[16px] text-gray-900 dark:text-white">Tema de la Aplicación</span>
              </div>
              
              <div className="flex bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl">
                {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      theme === mode 
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {mode === 'light' && 'Claro'}
                    {mode === 'dark' && 'Oscuro'}
                    {mode === 'auto' && 'Automático'}
                  </button>
                ))}
              </div>
              {theme === 'auto' && (
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 leading-tight">
                  Cambia de oscuro a claro basándose en la hora de amanecer y atardecer del clima.
                </p>
              )}
            </div>
          </NativeCard>
        </section>

        {/* SECCIÓN 3: Boleto Educativo */}
        <section className="mb-6">
          <h2 className="text-[13px] uppercase text-gray-500 dark:text-zinc-500 font-medium tracking-wide mb-2 ml-4">Boleto Educativo</h2>
          <NativeCard className="p-0 overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-none">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-1.5 rounded-[10px] text-white">
                  <Ticket size={18} fill="currentColor" />
                </div>
                <div>
                  <span className="font-medium text-[16px] text-gray-900 dark:text-white block leading-tight">Resumen de Viajes</span>
                  <span className="text-[13px] text-gray-500 dark:text-zinc-400 capitalize">{mesString} {year}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-zinc-950/60 rounded-xl p-5 flex flex-col items-center justify-center text-center border border-gray-100 dark:border-zinc-800/60">
                <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">Total usados</p>
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
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
          <h2 className="text-[13px] uppercase text-gray-500 dark:text-zinc-500 font-medium tracking-wide mb-2 ml-4">Información</h2>
          <NativeCard className="p-0 overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-none">
            <Link 
              href="/acerca"
              className="w-full flex items-center justify-between p-3 active:bg-gray-100 dark:active:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 text-blue-600 dark:text-blue-400 p-1.5 rounded-[10px]">
                  <Info size={18} />
                </div>
                <span className="font-medium text-[16px] text-gray-900 dark:text-white">Acerca de la App</span>
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
