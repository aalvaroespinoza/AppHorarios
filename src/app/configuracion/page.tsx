'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NativeCard from '@/components/ui/NativeCard';
import NativeSwitch from '@/components/ui/NativeSwitch';
import { useEscenario } from '@/hooks/useEscenario';
import { RefreshCw, Moon, Sun, Info, ChevronRight, Settings2, Building2, Bed } from 'lucide-react';

export default function Configuracion() {
  const { cursaArquitectura, setCursaArquitectura, duermeEnCordoba, setDuermeEnCordoba } = useEscenario();
  const [temaOscuro, setTemaOscuro] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTemaOscuro(isDark);
  }, []);

  const handleToggleTheme = (checked: boolean) => {
    setTemaOscuro(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleForzarRecarga = () => {
    if (window.confirm('¿Seguro que querés forzar la recarga? Esto actualizará la app y restablecerá estados temporales.')) {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      window.location.reload();
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-zinc-100 dark:bg-black" />;

  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-black text-black dark:text-white font-sans max-w-md mx-auto pb-24 overflow-y-auto">
      <header className="bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 pt-12 pb-4 px-4 sticky top-0 z-10 flex flex-col shadow-sm dark:shadow-lg">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Ajustes</h1>
      </header>

      <div className="p-4 space-y-6 mt-2">
        
        {/* SECCIÓN: PREFERENCIAS */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-[13px] uppercase text-zinc-500 dark:text-zinc-500 font-medium tracking-wide mb-2 ml-4">Preferencias</h2>
          <NativeCard className="p-0 overflow-hidden bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/50">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-1.5 rounded-lg text-white shadow-sm">
                  {temaOscuro ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <span className="font-medium text-[16px]">Modo Oscuro</span>
              </div>
              <div className="relative inline-block w-14 align-middle select-none shrink-0">
                <input 
                  type="checkbox" 
                  checked={temaOscuro}
                  onChange={(e) => handleToggleTheme(e.target.checked)}
                  className="peer sr-only"
                  id="theme-toggle"
                />
                <label 
                  htmlFor="theme-toggle"
                  className="block w-12 h-7 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer transition-colors peer-checked:bg-[#34c759] relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:border-white shadow-inner"
                ></label>
              </div>
            </div>

            {/* TOGGLE ARQUITECTURA */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-1.5 rounded-lg text-white shadow-sm">
                  <Building2 size={18} />
                </div>
                <div>
                  <span className="font-medium text-[16px] block leading-tight">Cursar Arquitectura</span>
                  <span className="text-[12px] text-zinc-500 block leading-tight mt-0.5">Habilitar viajes tempranos (08:00)</span>
                </div>
              </div>
              <NativeSwitch checked={cursaArquitectura} onChange={setCursaArquitectura} />
            </div>

            {/* TOGGLE CORDOBA */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-1.5 rounded-lg text-white shadow-sm">
                  <Bed size={18} />
                </div>
                <div>
                  <span className="font-medium text-[16px] block leading-tight">Dormir en Córdoba</span>
                  <span className="text-[12px] text-zinc-500 block leading-tight mt-0.5">Cancela regresos a Despeñaderos</span>
                </div>
              </div>
              <NativeSwitch checked={duermeEnCordoba} onChange={setDuermeEnCordoba} />
            </div>
          </NativeCard>
        </section>

        {/* SECCIÓN: SISTEMA */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 fill-mode-both">
          <h2 className="text-[13px] uppercase text-zinc-500 dark:text-zinc-500 font-medium tracking-wide mb-2 ml-4">Sistema</h2>
          <NativeCard className="p-0 overflow-hidden bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/50">
            <button 
              onClick={handleForzarRecarga}
              className="w-full flex items-center justify-between p-4 active:bg-zinc-100 dark:active:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-1.5 rounded-lg text-white shadow-sm">
                  <RefreshCw size={18} />
                </div>
                <div className="text-left">
                  <span className="font-medium text-[16px] block">Forzar recarga de datos</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-400" />
            </button>
          </NativeCard>
        </section>

        {/* SECCIÓN: ACERCA DE */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <h2 className="text-[13px] uppercase text-zinc-500 dark:text-zinc-500 font-medium tracking-wide mb-2 ml-4">Acerca de App Horarios</h2>
          <NativeCard className="p-0 overflow-hidden bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/50 divide-y divide-zinc-200 dark:divide-zinc-800/50">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-500 p-1.5 rounded-lg text-white shadow-sm">
                  <Info size={18} />
                </div>
                <span className="font-medium text-[16px]">Versión PWA</span>
              </div>
              <span className="text-zinc-500 dark:text-zinc-400 text-[16px]">v1.2.0</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-1.5 rounded-lg text-white shadow-sm">
                  <Settings2 size={18} />
                </div>
                <span className="font-medium text-[16px]">Motor de Recomendación</span>
              </div>
              <span className="text-zinc-500 dark:text-zinc-400 text-[16px]">Activo</span>
            </div>
          </NativeCard>
        </section>

      </div>
    </main>
  );
}
