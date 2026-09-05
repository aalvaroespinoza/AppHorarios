'use client';

import { useState } from 'react';
import { useEscenario } from '@/hooks/useEscenario';
import { rawScheduleEntries } from '@/data/schedules';
import NativeCard from '@/core/components/ui/NativeCard';
import { Bus, MapPin, Settings } from 'lucide-react';
import Link from 'next/link';
import ContextualControls from '@/features/schedule/ContextualControls';
import type { RawScheduleEntry } from '@/types/schedule';

export default function HorariosPage() {
  const escenario = useEscenario();
  const [tab, setTab] = useState<'ida' | 'vuelta'>('ida');

  if (!escenario.isMounted) return <div className="min-h-[100dvh] bg-[#0A0A0C]" />;

  const { diaSeleccionado } = escenario;
  
  const horariosDelDia = rawScheduleEntries.filter(h => h.dia === diaSeleccionado) || [];
  const horariosFiltrados = horariosDelDia.filter(h => h.sentido === tab);

  // Agrupar por empresa (capitalizando el nombre)
  const agrupadosPorEmpresa = horariosFiltrados.reduce((acc, curr) => {
    const empresaCapitalized = curr.empresa.charAt(0).toUpperCase() + curr.empresa.slice(1);
    if (!acc[empresaCapitalized]) {
      acc[empresaCapitalized] = [];
    }
    acc[empresaCapitalized].push(curr);
    return acc;
  }, {} as Record<string, RawScheduleEntry[]>);

  // Ordenar horarios dentro de cada empresa de menor a mayor
  Object.keys(agrupadosPorEmpresa).forEach(empresa => {
    agrupadosPorEmpresa[empresa].sort((a, b) => a.horaSalida.localeCompare(b.horaSalida));
  });

  return (
    <main className="min-h-[100dvh] bg-[#0A0A0C] text-[#F4F4F6] font-sans max-w-md mx-auto pb-24">
      <header className="pt-8 pb-2 px-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono font-bold text-safety-orange tracking-[0.2em] uppercase block mb-0.5">
              SYS.DATABASE // HORARIOS
            </span>
            <h1 className="text-xl font-mono font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-tight">
              <Bus size={18} className="text-safety-orange" />
              GRILLA DE COLECTIVOS
            </h1>
          </div>
          <Link href="/configuracion" className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors shadow-none">
            <Settings size={16} />
          </Link>
        </div>
        
        {/* Indicador de Vista Actual */}
        <div className={`flex items-center justify-between py-1.5 px-3 rounded-sm border font-mono text-xs uppercase tracking-wider ${
          tab === 'ida' 
            ? 'bg-safety-orange/10 border-safety-orange/40 text-safety-orange' 
            : 'bg-acid-green/10 border-acid-green/40 text-acid-green'
        }`}>
          <span>SENTIDO: {tab.toUpperCase()}</span>
          <span className="text-[10px] opacity-80">{tab === 'ida' ? 'DESPEÑADEROS → CBA' : 'CBA → DESPEÑADEROS'}</span>
        </div>
      </header>

      {/* Tabs Ida/Vuelta fijados (Sticky) */}
      <div className="sticky top-0 z-40 bg-[#0A0A0C]/95 backdrop-blur-md px-4 py-2 border-b border-zinc-800 shadow-none">
        <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-sm gap-1 max-w-md mx-auto">
          <button 
            onClick={() => setTab('ida')}
            className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer ${
              tab === 'ida' 
                ? 'bg-zinc-900 border border-safety-orange/50 text-safety-orange font-bold shadow-none' 
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            IDA ({horariosDelDia.filter(h => h.sentido === 'ida').length})
          </button>
          <button 
            onClick={() => setTab('vuelta')}
            className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer ${
              tab === 'vuelta' 
                ? 'bg-zinc-900 border border-acid-green/50 text-acid-green font-bold shadow-none' 
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            VUELTA ({horariosDelDia.filter(h => h.sentido === 'vuelta').length})
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 mt-1">
        <ContextualControls />

        <div id="seccion-cursado" className="animate-in fade-in slide-in-from-bottom-2 duration-300 scroll-mt-24">
          {Object.keys(agrupadosPorEmpresa).length > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(agrupadosPorEmpresa).map(([empresa, horarios]) => (
                <NativeCard key={empresa} className="p-0 overflow-hidden border border-zinc-800 bg-zinc-900 rounded-sm shadow-none">
                  <div className="px-3.5 py-2.5 border-b border-zinc-800 font-mono font-bold tracking-wider uppercase text-xs flex items-center justify-between bg-zinc-950 text-zinc-200">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-safety-orange rounded-none" />
                      {empresa}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-zinc-400 border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 rounded-sm">
                      {horarios.length} SERVICIOS
                    </span>
                  </div>
                  <div className="p-3.5">
                    <div className="grid grid-cols-4 gap-2">
                      {horarios.map((h, idx) => (
                        <div 
                          key={idx} 
                          className="flex flex-col items-center justify-center py-2 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-default"
                        >
                          <span className="text-sm font-bold font-mono text-zinc-100 tracking-tight">{h.horaSalida}</span>
                          {h.notas && (
                            <div className="flex items-center gap-0.5 mt-0.5 text-safety-orange">
                              <MapPin size={8} />
                              <span className="text-[8px] uppercase font-mono font-bold tracking-widest leading-none">Info</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </NativeCard>
              ))}
            </div>
          ) : (
            <NativeCard className="p-6 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider bg-zinc-900 border border-zinc-800 rounded-sm shadow-none">
              [NO HAY VIAJES DE {tab.toUpperCase()} PROGRAMADOS PARA ESTE DÍA]
            </NativeCard>
          )}
        </div>
      </div>
    </main>
  );
}
