'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Configuracion() {
  const [temaOscuro, setTemaOscuro] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black text-white font-sans max-w-md mx-auto">
      <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 pt-10 pb-4 px-4 sticky top-0 z-10 flex items-center">
        <Link href="/" className="text-blue-500 flex items-center pr-4 font-medium">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
          </svg>
          Atrás
        </Link>
        <h1 className="text-lg font-bold flex-1 text-center pr-16 text-zinc-100">Ajustes</h1>
      </header>

      <div className="p-4 space-y-8 mt-6 pb-12">
        
        <section>
          <h2 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-2 ml-4">Preferencias de UI</h2>
          <div className="bg-zinc-900 rounded-[1.5rem] overflow-hidden shadow-sm border border-zinc-800">
            
            <div className="flex items-center justify-between p-5">
              <label htmlFor="tema" className="font-semibold text-zinc-200 text-[15px]">Tema Oscuro</label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="tema"
                  checked={temaOscuro}
                  onChange={(e) => setTemaOscuro(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-12 h-7 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-zinc-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-400 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-blue-500 peer-checked:after:bg-white"></div>
              </div>
            </div>

          </div>
        </section>

        <p className="text-center text-zinc-500 text-xs mt-10 px-8 leading-relaxed font-medium">
          La cursada de Arquitectura y las estadías en Córdoba ahora se configuran directamente en la pantalla de inicio.
        </p>

      </div>
    </main>
  );
}
