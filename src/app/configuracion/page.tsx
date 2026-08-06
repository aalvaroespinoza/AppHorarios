'use client';

import { useState, useEffect } from 'react';
import NativeCard from '@/components/ui/NativeCard';
import { useBec } from '@/hooks/useBec';
import { RefreshCw, Info, ChevronRight, Settings2, Bus, AlertTriangle, ShieldCheck, Mail, Ticket } from 'lucide-react';

export default function Configuracion() {
  const [isMounted, setIsMounted] = useState(false);
  const bec = useBec();

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
        
        {/* SECCIÓN: BEC */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          <h2 className="text-[13px] uppercase text-[var(--color-text-secondary)] font-medium tracking-wide mb-2 ml-4">
            Boleto Educativo Cordobés
          </h2>
          <NativeCard className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-500/20 p-2 rounded-xl text-green-500">
                <Ticket size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-[18px]">Resumen Mensual</h3>
                <p className="text-sm text-[var(--color-text-secondary)] capitalize">
                  {new Date().toLocaleString('es-AR', { month: 'long', timeZone: 'America/Argentina/Buenos_Aires' })} {new Date().getFullYear()}
                </p>
              </div>
            </div>
            
            <div className="bg-black/5 dark:bg-black/40 rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="text-center mb-4">
                <p className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold mb-1">Total Histórico</p>
                <div className="text-4xl font-bold text-[var(--color-text-primary)]">
                  {bec.obtenerResumenMensual(new Date().getMonth() + 1, new Date().getFullYear()).totalCombinado} <span className="text-xl text-[var(--color-text-secondary)] font-medium">viajes</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center px-2 pt-4 border-t border-[var(--color-border)]">
                <div className="text-center">
                  <p className="text-[12px] text-[var(--color-text-secondary)] mb-1">Idas Usadas</p>
                  <p className="text-xl font-bold text-green-400">{bec.obtenerResumenMensual(new Date().getMonth() + 1, new Date().getFullYear()).idaTotal}</p>
                </div>
                <div className="w-px h-8 bg-[var(--color-border)]" />
                <div className="text-center">
                  <p className="text-[12px] text-[var(--color-text-secondary)] mb-1">Vueltas Usadas</p>
                  <p className="text-xl font-bold text-blue-400">{bec.obtenerResumenMensual(new Date().getMonth() + 1, new Date().getFullYear()).vueltaTotal}</p>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que querés reiniciar todo el conteo de pasajes BEC? Esta acción no se puede deshacer.')) {
                    bec.reiniciarHistorial();
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 bg-red-500/10 font-medium text-[15px] hover:bg-red-500/20 active:scale-[0.98] transition-all"
              >
                Reiniciar historial BEC
              </button>
            </div>
          </NativeCard>
        </section>

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

        {/* SECCIÓN: FUENTES DE DATOS */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          <h2 className="text-[13px] uppercase text-[var(--color-text-secondary)] font-medium tracking-wide mb-2 ml-4">
            Fuentes de Datos
          </h2>
          <NativeCard className="p-0 overflow-hidden divide-y divide-[var(--color-border)] bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="p-4 flex gap-4 items-start">
              <Bus className="text-emerald-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-[var(--color-text-primary)] text-[15px]">Empresas</p>
                <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
                  Canelo, Lumasa e Intercordoba.
                </p>
              </div>
            </div>
            <div className="p-4 flex gap-4 items-start">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-[var(--color-text-primary)] text-[15px]">Aviso Importante</p>
                <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
                  Los horarios son relevados manualmente (Agosto 2026) y pueden cambiar sin previo aviso por las empresas de transporte.
                </p>
              </div>
            </div>
            <div className="p-4 flex gap-4 items-start">
              <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-[var(--color-text-primary)] text-[15px]">Uso Offline</p>
                <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
                  Esta aplicación guarda los datos en tu dispositivo para funcionar sin conexión a internet.
                </p>
              </div>
            </div>
          </NativeCard>
        </section>

        {/* SECCIÓN: CONTACTO */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
          <h2 className="text-[13px] uppercase text-[var(--color-text-secondary)] font-medium tracking-wide mb-2 ml-4">
            Contacto
          </h2>
          <a 
            href="mailto:soporte@apphorarios.com?subject=Reportar%20horario%20incorrecto"
            className="block w-full"
          >
            <NativeCard className="flex items-center justify-between p-4 active:bg-zinc-800/50 transition-colors bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-2 rounded-lg text-white">
                  <Mail size={18} />
                </div>
                <span className="font-medium text-[var(--color-text-primary)] text-[16px]">Reportar horario incorrecto</span>
              </div>
            </NativeCard>
          </a>
        </section>

      </div>
    </main>
  );
}
