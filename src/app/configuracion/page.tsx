'use client';

import { useState, useEffect } from 'react';
import NativeCard from '@/components/ui/NativeCard';
import { RefreshCw, Info, ChevronRight, Settings2 } from 'lucide-react';

export default function Configuracion() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return <div className="min-h-screen bg-[var(--color-bg)]" />;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans max-w-md mx-auto pb-24 overflow-y-auto">
      <header className="bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)] pt-12 pb-4 px-4 sticky top-0 z-10 flex flex-col shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Ajustes</h1>
      </header>

      <div className="p-4 space-y-6 mt-2">
        


        {/* SECCIÓN: SISTEMA */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 fill-mode-both">
          <h2 className="text-[13px] uppercase text-[var(--color-text-secondary)] font-medium tracking-wide mb-2 ml-4">Sistema</h2>
          <NativeCard className="p-0 overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
            <button 
              onClick={handleForzarRecarga}
              className="w-full flex items-center justify-between p-4 active:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-1.5 rounded-lg text-white shadow-sm">
                  <RefreshCw size={18} />
                </div>
                <div className="text-left">
                  <span className="font-medium text-[16px] block text-[var(--color-text-primary)]">Forzar recarga de datos</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--color-text-secondary)]" />
            </button>
          </NativeCard>
        </section>

        {/* SECCIÓN: ACERCA DE */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <h2 className="text-[13px] uppercase text-[var(--color-text-secondary)] font-medium tracking-wide mb-2 ml-4">Acerca de App Horarios</h2>
          <NativeCard className="p-0 overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-500 p-1.5 rounded-lg text-white shadow-sm">
                  <Info size={18} />
                </div>
                <span className="font-medium text-[16px] text-[var(--color-text-primary)]">Versión PWA</span>
              </div>
              <span className="text-[var(--color-text-secondary)] text-[16px]">v1.2.0</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-1.5 rounded-lg text-white shadow-sm">
                  <Settings2 size={18} />
                </div>
                <span className="font-medium text-[16px] text-[var(--color-text-primary)]">Motor de Recomendación</span>
              </div>
              <span className="text-[var(--color-text-secondary)] text-[16px]">Activo</span>
            </div>
          </NativeCard>
        </section>

      </div>
    </main>
  );
}
