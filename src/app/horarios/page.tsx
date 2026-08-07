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

  if (!escenario.isMounted) return <div className="min-h-[100dvh] bg-black" />;

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
    <main className="min-h-[100dvh] bg-black text-white font-sans max-w-md mx-auto ">
      <header className="pt-10 pb-2 px-4 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-1">
              <Bus className="text-blue-500" />
              Todos los Horarios
            </h1>
            <p className="text-sm text-zinc-400 leading-tight">Consulta la grilla completa de colectivos.</p>
          </div>
          <Link href="/configuracion" className="w-10 h-10 bg-zinc-800/80 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <Settings size={20} />
          </Link>
        </div>
        
        {/* Indicador de Vista Actual */}
        <div className={`flex items-center justify-center py-2 px-3 rounded-lg border font-bold text-sm tracking-wide ${
          tab === 'ida' 
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
            : 'bg-[#34c759]/10 border-[#34c759]/30 text-[#34c759]'
        }`}>
          Viendo: {tab === 'ida' ? 'IDA hacia Córdoba' : 'VUELTA hacia Despeñaderos'}
        </div>
      </header>

      {/* Tabs Ida/Vuelta fijados (Sticky) */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 border-b border-zinc-800/80 shadow-md">
        <div className="flex bg-zinc-800/80 p-1.5 rounded-xl shadow-inner max-w-md mx-auto">
          <button 
            onClick={() => setTab('ida')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'ida' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Ida
          </button>
          <button 
            onClick={() => setTab('vuelta')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'vuelta' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Vuelta
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2">
        <ContextualControls />

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {Object.keys(agrupadosPorEmpresa).length > 0 ? (
            <div className="flex flex-col gap-6">
              {Object.entries(agrupadosPorEmpresa).map(([empresa, horarios]) => (
                <NativeCard key={empresa} className="p-0 overflow-hidden border border-zinc-800 bg-zinc-950">
                  <div className={`px-4 py-3 border-b border-zinc-800 font-bold tracking-wide uppercase text-sm flex items-center justify-between ${tab === 'ida' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#34c759]/10 text-[#34c759]'}`}>
                    <span>{empresa}</span>
                    <span className="text-xs font-semibold opacity-70 bg-black/20 px-2 py-0.5 rounded-full">{horarios.length} viajes</span>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2.5">
                      {horarios.map((h, idx) => (
                        <div 
                          key={idx} 
                          className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-zinc-600 transition-all cursor-default"
                        >
                          <span className="text-lg font-bold text-zinc-100 tracking-tight">{h.horaSalida}</span>
                          {h.notas && (
                            <div className="flex items-center gap-0.5 mt-1 text-blue-400">
                              <MapPin size={9} />
                              <span className="text-[9px] uppercase font-bold tracking-widest leading-none">Info</span>
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
            <NativeCard className="p-6 text-center text-zinc-500 text-sm bg-zinc-900/20 border-dashed border-zinc-800">
              No hay viajes de {tab} programados para este día.
            </NativeCard>
          )}
        </div>
      </div>
    </main>
  );
}
