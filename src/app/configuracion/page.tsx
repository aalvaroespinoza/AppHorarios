'use client';

import { useEscenario } from '../../hooks/useEscenario';
import Link from 'next/link';

export default function Configuracion() {
  const { escenario, updateEscenario, isMounted } = useEscenario();

  if (!isMounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans max-w-md mx-auto">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 pt-10 pb-4 px-4 sticky top-0 z-10 flex items-center">
        <Link href="/" className="text-blue-500 flex items-center pr-4 font-medium">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
          </svg>
          Atrás
        </Link>
        <h1 className="text-lg font-bold flex-1 text-center pr-16 text-slate-800">Ajustes</h1>
      </header>

      <div className="p-4 space-y-8 mt-6 pb-12">
        
        <section>
          <h2 className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2 ml-4">Preferencias de Cursada</h2>
          <div className="bg-white rounded-[1.5rem] overflow-hidden divide-y divide-slate-100 shadow-sm border border-slate-200">
            
            <div className="flex items-center justify-between p-5">
              <label htmlFor="arquitectura" className="font-semibold text-slate-700 text-[15px]">Cursar Arquitectura los Martes</label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="arquitectura"
                  checked={escenario.cursaArquitecturaMartes}
                  onChange={(e) => updateEscenario({ cursaArquitecturaMartes: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-green-500"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5">
              <label htmlFor="dormir" className="font-semibold text-slate-700 text-[15px]">Dormir en Córdoba los Viernes</label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="dormir"
                  checked={escenario.duermeEnCordobaViernes}
                  onChange={(e) => updateEscenario({ duermeEnCordobaViernes: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-green-500"></div>
              </div>
            </div>

          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2 ml-4">Tiempos y Márgenes</h2>
          <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200 p-5 flex items-center justify-between">
             <label htmlFor="minutos" className="font-semibold text-slate-700 text-[15px] flex-1 pr-4">Minutos de caminata a la Terminal</label>
             <input 
               id="minutos"
               type="number"
               min="0"
               max="60"
               value={escenario.minutosCaminandoTerminal}
               onChange={(e) => updateEscenario({ minutosCaminandoTerminal: parseInt(e.target.value) || 0 })}
               className="w-16 text-right text-blue-600 font-black text-lg bg-slate-50 rounded-xl p-2 border-0 outline-none focus:ring-2 focus:ring-blue-100"
             />
          </div>
        </section>

        <p className="text-center text-slate-400 text-xs mt-10 px-8 leading-relaxed font-medium">
          Los cambios se guardan automáticamente de forma local para que funcione offline.
        </p>

      </div>
    </main>
  );
}
