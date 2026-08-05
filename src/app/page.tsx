'use client';

import { useMemo, useState, useEffect } from 'react';
import { useEscenario } from '../hooks/useEscenario';
import { calcularColectivoRecomendado } from '../engine/recommendationEngine';
import { DiaSemana } from '../types';
import Link from 'next/link';
import ContadorVivo from '../components/ContadorVivo';
import RelojMinimalista from '../components/RelojMinimalista';
import IndicadorEstado from '../components/IndicadorEstado';

// Helper para obtener el día actual local
const getDiaActual = (): DiaSemana => {
  const map: Record<number, DiaSemana> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  return map[new Date().getDay()];
};

export default function Home() {
  const { escenario, isMounted } = useEscenario();
  const [dia, setDia] = useState<DiaSemana>('lunes');

  // Estados para manejar los colectivos perdidos
  const [idaPerdida, setIdaPerdida] = useState(false);
  const [vueltaPerdida, setVueltaPerdida] = useState(false);

  useEffect(() => {
    setDia(getDiaActual());
  }, []);

  const recomendacionIda = useMemo(() => {
    return calcularColectivoRecomendado(dia, 'ida', escenario);
  }, [dia, escenario]);

  const recomendacionVuelta = useMemo(() => {
    return calcularColectivoRecomendado(dia, 'vuelta', escenario);
  }, [dia, escenario]);

  // Prevenir hydration mismatch
  if (!isMounted) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Cargando...</div>;

  const noViaja = dia === 'domingo' || !recomendacionIda.recomendado;

  const idaActual = idaPerdida && recomendacionIda.siguiente_disponible 
    ? recomendacionIda.siguiente_disponible 
    : recomendacionIda.recomendado;

  const vueltaActual = vueltaPerdida && recomendacionVuelta.siguiente_disponible 
    ? recomendacionVuelta.siguiente_disponible 
    : recomendacionVuelta.recomendado;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),3rem)] max-w-md mx-auto selection:bg-blue-500/30">
      <header className="flex justify-between items-start mb-10 mt-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">AppHorarios</h1>
          <p className="text-zinc-400 capitalize font-medium mt-1">Hoy es {dia}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <RelojMinimalista />
          <Link 
            href="/configuracion" 
            className="p-3 rounded-full bg-zinc-900 shadow-xl shadow-black/20 border border-zinc-800 text-blue-500 hover:bg-zinc-800 transition-colors active:scale-95"
            aria-label="Configuración"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </Link>
        </div>
      </header>

      {noViaja ? (
        <div className="bg-zinc-900 rounded-[2rem] p-8 shadow-xl shadow-black/20 border border-zinc-800 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-zinc-800/50 text-blue-500 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner border border-zinc-700/50">☕</div>
          <h2 className="text-2xl font-bold mb-2 text-zinc-100">Hoy no viajás.</h2>
          <h3 className="text-xl font-medium text-zinc-400 mb-2">¡A descansar!</h3>
          <p className="text-zinc-500 mt-2 text-sm">Aprovecha para adelantar TP o relajarte.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* SECCIÓN DE IDA */}
          {idaActual && (
            <section>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">Recomendación Ida</h3>
              <div className="bg-zinc-900 rounded-[2rem] p-6 shadow-xl shadow-black/20 border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-hover:opacity-10 transition-opacity">
                  <svg className="w-32 h-32 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-4.03l2.843-1.606a2.5 2.5 0 011.696-.347l1.794.394A1 1 0 0119 9.873V15a1 1 0 001 1h.05a2.5 2.5 0 014.9 0h.5a1 1 0 001-1V9a1 1 0 00-.7-.954l-4.106-.713a2.5 2.5 0 00-2.456 1.077L18.064 10l-3.328-1.872a4.5 4.5 0 00-2.22-.577l-1.076-.118A1 1 0 0010 8.441V4a1 1 0 00-1-1H3z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <p className="text-blue-500 text-sm font-semibold tracking-wide uppercase mt-0.5">{idaActual.empresa}</p>
                      <IndicadorEstado horaSalida={idaActual.horaSalida} />
                    </div>
                    <ContadorVivo horaSalida={idaActual.horaSalida} />
                  </div>
                  <p className="text-6xl font-black tracking-tighter mb-4 text-zinc-50">{idaActual.horaSalida}</p>
                  
                  <div className="flex justify-between items-end mt-4">
                    {idaActual.nota ? (
                      <span className="text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-500/30 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">
                        {idaActual.nota}
                      </span>
                    ) : <div/>}
                    
                    {!idaPerdida && recomendacionIda.siguiente_disponible && (
                      <button 
                        onClick={() => setIdaPerdida(true)}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-700/80 px-4 py-2 rounded-full transition-all border border-zinc-700/50 active:scale-95 shadow-sm"
                      >
                        Lo perdí 🏃‍♂️
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {recomendacionIda.alternativas.length > 0 && !idaPerdida && (
                <div className="mt-4 bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50 flex gap-4 overflow-x-auto snap-x">
                  <div className="text-[10px] font-extrabold text-zinc-600 self-center uppercase pr-2 tracking-widest flex-shrink-0 snap-start">
                    Anteriores
                  </div>
                  {recomendacionIda.alternativas.map((alt, idx) => (
                    <div key={idx} className="flex-shrink-0 bg-zinc-800/50 px-5 py-3 rounded-xl border border-zinc-700/50 snap-center opacity-75">
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase mb-0.5">{alt.empresa}</p>
                      <p className="font-bold text-zinc-300 text-lg">{alt.horaSalida}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SECCIÓN DE VUELTA */}
          {vueltaActual && (
            <section>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2 mt-8">Recomendación Vuelta</h3>
              <div className="bg-blue-600 rounded-[2rem] p-6 shadow-xl shadow-blue-900/20 border border-blue-500 overflow-hidden relative text-white group">
                <div className="relative z-10 flex justify-between items-center mb-1">
                  <div className="flex items-center gap-3">
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">{vueltaActual.empresa}</p>
                    <IndicadorEstado horaSalida={vueltaActual.horaSalida} />
                  </div>
                  <div className="scale-95 origin-right">
                    <ContadorVivo horaSalida={vueltaActual.horaSalida} />
                  </div>
                </div>
                <div className="relative z-10 mt-2">
                  <p className="text-5xl font-black tracking-tighter mb-4">{vueltaActual.horaSalida}</p>
                  
                  <div className="flex justify-between items-end mt-4 min-h-[32px]">
                    {vueltaActual.nota ? (
                      <span className="text-[11px] bg-blue-700/50 text-blue-100 max-w-[120px] font-medium leading-tight px-3 py-1.5 rounded-xl">
                        {vueltaActual.nota}
                      </span>
                    ) : <div/>}

                    {!vueltaPerdida && recomendacionVuelta.siguiente_disponible && (
                      <button 
                        onClick={() => setVueltaPerdida(true)}
                        className="text-[11px] font-semibold text-white/90 hover:text-white bg-blue-500/50 hover:bg-blue-400/50 px-4 py-2 rounded-full transition-all border border-blue-400/30 active:scale-95 shadow-sm"
                      >
                        Lo perdí 🏃‍♂️
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {recomendacionVuelta.alternativas.length > 0 && !vueltaPerdida && (
                <div className="mt-4 bg-blue-900/10 rounded-2xl p-4 border border-blue-900/20 flex gap-4 overflow-x-auto snap-x">
                  <div className="text-[10px] font-extrabold text-blue-500/50 self-center uppercase pr-2 tracking-widest flex-shrink-0 snap-start">
                    Opciones
                  </div>
                  {recomendacionVuelta.alternativas.map((alt, idx) => (
                    <div key={idx} className="flex-shrink-0 bg-zinc-900/40 px-5 py-3 rounded-xl border border-zinc-800/50 snap-center">
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase mb-0.5">{alt.empresa}</p>
                      <p className="font-bold text-zinc-400 text-lg">{alt.horaSalida}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      )}
    </main>
  );
}
