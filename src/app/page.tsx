'use client';

import { useMemo, useState, useEffect } from 'react';
import { useEscenario } from '../hooks/useEscenario';
import { calcularColectivoRecomendado } from '../engine/recommendationEngine';
import { DiaSemana } from '../types';
import Link from 'next/link';
import ContadorVivo from '../components/ContadorVivo';

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
  if (!isMounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>;

  const noViaja = dia === 'domingo' || !recomendacionIda.recomendado;

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 font-sans p-6 pb-12 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-8 mt-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AppHorarios</h1>
          <p className="text-slate-500 capitalize font-medium">Hoy es {dia}</p>
        </div>
        <Link 
          href="/configuracion" 
          className="p-3 rounded-full bg-white shadow-sm border border-slate-100 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </Link>
      </header>

      {noViaja ? (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner">☕</div>
          <h2 className="text-2xl font-bold mb-2">Hoy no viajás.</h2>
          <h3 className="text-xl font-bold text-slate-700 mb-2">¡A descansar!</h3>
          <p className="text-slate-400 mt-2 text-sm">Aprovecha para adelantar TP o relajarte.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* SECCIÓN DE IDA */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Recomendación Ida</h3>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-4.03l2.843-1.606a2.5 2.5 0 011.696-.347l1.794.394A1 1 0 0119 9.873V15a1 1 0 001 1h.05a2.5 2.5 0 014.9 0h.5a1 1 0 001-1V9a1 1 0 00-.7-.954l-4.106-.713a2.5 2.5 0 00-2.456 1.077L18.064 10l-3.328-1.872a4.5 4.5 0 00-2.22-.577l-1.076-.118A1 1 0 0010 8.441V4a1 1 0 00-1-1H3z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-blue-200 text-sm font-semibold tracking-wide uppercase mt-1">{recomendacionIda.recomendado?.empresa}</p>
                  {recomendacionIda.recomendado && (
                    <ContadorVivo horaSalida={recomendacionIda.recomendado.horaSalida} />
                  )}
                </div>
                <p className="text-6xl font-black tracking-tighter mb-4">{recomendacionIda.recomendado?.horaSalida}</p>
                {recomendacionIda.recomendado?.nota && (
                  <span className="text-xs font-medium bg-black/25 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">
                    {recomendacionIda.recomendado.nota}
                  </span>
                )}
              </div>
            </div>
            
            {recomendacionIda.alternativas.length > 0 && (
              <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 overflow-x-auto">
                <div className="text-[10px] font-extrabold text-slate-300 self-center uppercase pr-2 tracking-widest flex-shrink-0">
                  Siguientes
                </div>
                {recomendacionIda.alternativas.map((alt, idx) => (
                  <div key={idx} className="flex-shrink-0 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">{alt.empresa}</p>
                    <p className="font-bold text-slate-900 text-lg">{alt.horaSalida}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECCIÓN DE VUELTA */}
          {recomendacionVuelta.recomendado && (
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 mt-8">Recomendación Vuelta</h3>
              <div className="bg-blue-600 rounded-[2rem] p-6 shadow-sm border border-slate-200 overflow-hidden relative text-white">
                <div className="relative z-10 flex justify-between items-center mb-1">
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">{recomendacionVuelta.recomendado.empresa}</p>
                  <div className="scale-95 origin-right">
                    <ContadorVivo horaSalida={recomendacionVuelta.recomendado.horaSalida} />
                  </div>
                </div>
                <div className="relative z-10 flex justify-between items-end mt-2">
                  <p className="text-5xl font-black tracking-tighter">{recomendacionVuelta.recomendado.horaSalida}</p>
                  {recomendacionVuelta.recomendado.nota && (
                    <div className="text-right">
                      <p className="text-[11px] text-blue-200 max-w-[90px] font-medium leading-tight">
                        {recomendacionVuelta.recomendado.nota}
                      </p>
                    </div>
                  )}
                </div>
                {recomendacionVuelta.alternativas.length > 0 && (
                  <div className="relative z-10 mt-6 pt-5 border-t border-blue-500/50 flex justify-between items-center text-sm">
                    <span className="text-blue-200 text-xs font-semibold">Alternativas:</span>
                    <div className="flex gap-4">
                      {recomendacionVuelta.alternativas.map((alt, idx) => (
                        <span key={idx} className="font-bold text-white">
                          {alt.horaSalida} <span className="text-[10px] text-blue-200 font-normal uppercase ml-0.5">{alt.empresa}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      )}
    </main>
  );
}
