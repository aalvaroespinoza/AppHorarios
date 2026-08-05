'use client';

import { useState } from 'react';
import { useEscenario } from '@/hooks/useEscenario';
import { rawScheduleEntries } from '@/data/schedules';
import NativeCard from '@/components/ui/NativeCard';
import { Bus, MapPin } from 'lucide-react';
import ContextualControls from '@/features/schedule/ContextualControls';
import type { RawScheduleEntry } from '@/types/schedule';

export default function HorariosPage() {
  const escenario = useEscenario();
  const [tab, setTab] = useState<'ida' | 'vuelta'>('ida');

  if (!escenario.isMounted) return <div className="min-h-screen bg-black" />;

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
    <main className="min-h-screen bg-black text-white font-sans max-w-md mx-auto pb-24 overflow-y-auto">
      <header className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 pt-12 pb-4 px-4 sticky top-0 z-10 flex flex-col shadow-lg gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-1">
            <Bus className="text-blue-500" />
            Todos los Horarios
          </h1>
          <p className="text-sm text-zinc-400 leading-tight">Consulta la grilla completa de colectivos agrupada por empresa.</p>
        </div>
        
        {/* Tabs Ida/Vuelta */}
        <div className="flex bg-zinc-800/50 p-1 rounded-xl">
          <button 
            onClick={() => setTab('ida')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'ida' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Ida (hacia Cba)
          </button>
          <button 
            onClick={() => setTab('vuelta')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'vuelta' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Vuelta (hacia Desp)
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6 mt-2">
        <ContextualControls />

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {Object.keys(agrupadosPorEmpresa).length > 0 ? (
            <div className="flex flex-col gap-6">
              {Object.entries(agrupadosPorEmpresa).map(([empresa, horarios]) => (
                <NativeCard key={empresa} className="p-0 overflow-hidden border border-zinc-800">
                  <div className={`px-4 py-3 border-b border-zinc-800 font-bold tracking-wide uppercase text-sm ${tab === 'ida' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#34c759]/10 text-[#34c759]'}`}>
                    {empresa}
                  </div>
                  <ul className="divide-y divide-zinc-800/50">
                    {horarios.map((h, idx) => (
                      <li key={idx} className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                        <span className="text-2xl font-semibold text-zinc-100">{h.horaSalida}</span>
                        {h.notas && (
                          <div className="bg-zinc-800/50 text-zinc-400 text-[11px] px-2 py-1 rounded-md flex items-center gap-1 max-w-[150px] text-right">
                            <MapPin size={10} className="shrink-0" />
                            <span className="leading-tight text-left">{h.notas}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
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
