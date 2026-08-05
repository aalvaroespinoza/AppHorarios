import { Info, Bus, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';
import NativeCard from '@/components/ui/NativeCard';
import { Header } from '@/components/ui/Header';

export default function AcercaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <Header />
      
      <main className="flex-1 px-4 py-6 max-w-md w-full mx-auto space-y-6">
        <section className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-500 mb-4">
            <Info size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">App Horarios</h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-sm leading-relaxed">
            Recomendador personal de colectivos entre Despeñaderos y la UTN Córdoba, optimizado para el cursado.
          </p>
        </section>

        <section>
          <h2 className="text-[13px] uppercase text-[var(--color-text-secondary)] font-medium tracking-wide mb-2 ml-4">
            Fuentes de Datos
          </h2>
          <NativeCard className="p-0 overflow-hidden divide-y divide-[var(--color-border)]">
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

        <section>
          <h2 className="text-[13px] uppercase text-[var(--color-text-secondary)] font-medium tracking-wide mb-2 ml-4">
            Contacto
          </h2>
          <a 
            href="mailto:soporte@apphorarios.com?subject=Reportar%20horario%20incorrecto"
            className="block w-full"
          >
            <NativeCard className="flex items-center justify-between p-4 active:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-2 rounded-lg text-white">
                  <Mail size={18} />
                </div>
                <span className="font-medium text-[var(--color-text-primary)]">Reportar horario incorrecto</span>
              </div>
            </NativeCard>
          </a>
        </section>
      </main>
      
      <div
        className="shrink-0 bg-[var(--color-bg)]"
        style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
        aria-hidden="true"
      />
    </div>
  );
}
